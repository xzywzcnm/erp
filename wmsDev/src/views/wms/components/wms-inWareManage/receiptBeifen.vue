<template >
  <div class="pd10" >
    <div v-if="!showDetail" style="margin-top: 100px;" >
      <scan @enter="search" :title="scanTitle" :placeholder="scanPlaceholder" ></scan >
    </div >
    <div v-else >
      <Card dis-hover >
        <Row class="search-box" type="flex" justify="center" align="middle" >
          <Col span="6" class="search-label" >{{ scanTitle }}：</Col >
          <Col span="15" ><Input
              class="search-ipt"
              v-model.trim="receiptNoOrReferenceNo"
              :placeholder="scanPlaceholder"
              @on-enter="search(receiptNoOrReferenceNo)" ></Input ></Col >
          <Col span="3" >
            <Button
                class="search-btn"
                type="primary"
                icon="ios-search"
                @click="search(receiptNoOrReferenceNo)" >查询 </Button >
          </Col >
        </Row >
      </Card >
      <div style="position: relative" >
        <Row class="mt10" >
          <Col span="7" >
            <div class="receipt-img-box" >
              <img v-if="activeRow !== null" :src="$store.state.imgUrlPrefix + activeRow.goodsUrl" />
              <div v-else class="text" >
                请扫描商品
              </div >
            </div >
            <Card class="mt10" dis-hover >
              <Input placeholder="扫描商品条码" v-model.trim="scanSku" ref="scanSkuRef" @on-enter="scanning" />
              <Form ref="formInline" :model="formInline" :rules="ruleInline" :label-width="135" class="mt10" >
                <FormItem prop="c" label="选择收货库位" >
                  <Select
                      v-model="warehouseLocationId"
                      filterable
                      remote
                      transfer
                      :remote-method="getWarehouseLocation"
                      @click.native="getWarehouseLocation('')"
                      :loading="loading2"
                      @on-change="saveCache" > <Option
                      v-for="item in $store.state.positionList"
                      :disabled="item.checkStatus === '1'"
                      :title="
                        item.checkStatus === '1'
                          ? '盘点中'
                          : ''
                      "
                      :value="item.warehouseLocationId"
                      :key="item.warehouseLocationId"
                      :label="item.warehouseLocationName"
                    /> </Select >
                </FormItem >
                <FormItem label="收货后是否需要质检" >
                  <RadioGroup v-model="formInline.resultFlag" @on-change="saveCache" >
                    <Radio label="Q" >是</Radio >
                    <Radio label="S" >否</Radio >
                  </RadioGroup >
                </FormItem >
                <FormItem label="收货后打印SKU条码" >
                  <RadioGroup v-model="printSKUBarcodeAfterReceiving" @on-change="saveCache" >
                    <Radio label="Y" >是</Radio >
                    <Radio label="N" >否</Radio >
                  </RadioGroup >
                </FormItem >
                <FormItem label="是否允许超量收货" >
                  <RadioGroup v-model="isOvercharge" @on-change="saveCache" >
                    <Radio label="Y" >是</Radio >
                    <Radio label="N" >否</Radio >
                  </RadioGroup >
                </FormItem >
                <FormItem label="扫描模式" >
                  <RadioGroup v-model="scanningMethod" @on-change="saveCache" >
                    <Radio label="1" >逐件扫描
                    </Radio >
                    <Radio label="2" >批量扫描</Radio >
                  </RadioGroup >
                </FormItem >
                <FormItem label="收货后关闭入库单" >
                  <Select v-model="formInline.closeReceipt" @on-change="saveCache" > <Option
                      v-for="(item,index) in receivingType"
                      :key="index"
                      :value="item.value" >{{ item.text }} </Option > </Select >
                </FormItem >
                <FormItem label="扫描到不存在SKU" >
                  <RadioGroup v-model="hasSku" @on-change="saveCache" >
                    <Radio label="1" >无源入库
                    </Radio >
                    <Radio label="2" >忽略</Radio >
                  </RadioGroup >
                </FormItem >
              </Form >
              <Button long @click="setAmountMax" >收货数量设为最大 </Button >
              <Button class="mt10" type="primary" long @click="receipt" >确认收货 </Button >
            </Card >
          </Col >
          <Col span="17" >
            <div class="right-box" >
              <Alert type="success" >
                  <span slot="desc" >
                    <span >总预期数量:</span ><b >{{expectedNumberAll}}</b >
                    <span class="ml10" >总已收货数量:</span ><b >{{doneNumberAll}}</b >
                    <span class="ml10" >总未收货数量:</span ><b >{{noBatchNumberAll}}</b >
                    <span class="ml10" >本次收货总数量:</span ><b >{{currentBatchNumberAll}}</b >
                  </span >
              </Alert >

              <Card title="入库单明细" dis-hover >
                <div slot="title">
                  <span>入库单明细</span>
                  <p style="float:right; " class="card-r-tit" >
                    <span  class="font-14 ">SKU收货状态：</span > <Select
                    v-model="receivingStatus"
                    multiple
                    size="small"
                    style="width: 300px;"
                    @on-change="changeStatus" > <Option
                    v-for="(item,index) in receivingStatusList"
                    :key="index"
                    :label="item.name"
                    :value="item.type" >{{ item.name }} </Option > </Select >
                  </p >
                </div>
                <Card dis-hover >
                  <Row >
                    <Col span="8" >
                      <p style="margin-bottom: 8px;" >
                        <span class="receipt-top-label" >入库单编号：</span >{{ detail.receiptNo }} </p >
                      <p style="margin-bottom: 8px;" >
                        <span class="receipt-top-label" >入库单类型：</span ><span v-if="detail.receiptType === '0'" >备货入库</span >
                        <span v-if="detail.receiptType === '1'" >生产入库</span >
                        <span v-if="detail.receiptType === '2'" >调拨入库</span >
                        <span v-if="detail.receiptType === '3'" >退货入库</span >
                        <span v-if="detail.receiptType === '4'" >其他入库</span >
                        <span v-if="detail.receiptType === '5'" >急采入库</span >
                      </p >
                    </Col >
                    <Col span="8" >
                      <p style="margin-bottom: 8px;" >
                        <span class="receipt-top-label" >参考编号：</span >
                        <span >{{ detail.referenceNo }}/{{ sepCommasFn(detail.referenceNo2).join('/') }}</span >
                      </p >
                      <p style="margin-bottom: 8px;" >
                        <span class="receipt-top-label" >采购员：</span > <span >{{ detail.purchaserName }}</span >
                      </p >
                    </Col >
                    <Col span="8" >
                      <p style="margin-bottom: 8px;" >
                        <span class="receipt-top-label" >入库单状态：</span > <span v-if="detail.receiptStatus === '0'" >入库单创建</span >
                        <span v-if="detail.receiptStatus === '1'" >入库单取消</span >
                        <span v-if="detail.receiptStatus === '2'" >入库单关闭</span >
                        <span v-if="detail.receiptStatus === '3'" >收货中</span ><span
                        class="tag-color tag-color-1" v-if="abnormalStatus.a" >无源入库</span ><span
                        class="tag-color tag-color-2"
                        v-if="abnormalStatus.b" >部分收货</span ><span
                        class="tag-color tag-color-3" v-if="abnormalStatus.c" >超量收货</span >
                      </p >
                    </Col >
                  </Row >
                </Card >
                <Table
                    :row-class-name="rowClassName"
                    ref="table1"
                    :columns="columns2"
                    :data="data2"
                    :height="data1.length > 0 ? 190 : 500" ></Table >
              </Card >
              <Card title="无源入库" dis-hover v-show="data1.length > 0" >
                <Table
                    :row-class-name="rowClassName"
                    :columns="columns1"
                    :loading="TableLoading"
                    :data="data1"
                    height="190" ></Table >
                <!-- <div class="table-page clear" style="margin-bottom: 0">
                                 <div class="table-page-right">
                                     <Page
                                         :total="total1"
                                         @on-change="changePage1"
                                         show-total
                                         :page-size="pageParams1.pageSize"
                                         show-elevator
                                         :current="pageParams1.pageNum"
                                         show-sizer
                                         @on-page-size-change="changePageSize1"
                                         placement="top"
                                         :page-size-opts="pageArray1"
                                     >
                                     </Page>
                                 </div></div>-->
              </Card >
            </div >
          </Col >
        </Row >

        <Spin size="large" fix v-if="spinShow" ></Spin >
      </div >
    </div >
    <printSkuCode
        ref="printSkuCode"
        :printSource="'receipt'"
        :printSkuObj="printDate"
        :printType="printType"
        :qualityCheckProcurementId="qualityCheckProcurementId"
        @printEnd="printsuccess"
        :tipsDataLength="data3"
        :barCodeShow="barCodeShow" ></printSkuCode >
    <handleSku></handleSku>
  </div >
</template>

<script>
import CommonMixin from '@/components/mixin/common_mixin';
import api from '@/api/api';
import scan from '../common/scan';
import printSkuCode from '../common/printSkuCode';
import handleSku from '@/views/wms/components/wms-inWareManage/componts/handleSku';

export default {
  name: 'receipt', // 收货
  mixins: [CommonMixin],
  components: {
    scan,
    printSkuCode,
    handleSku
  },
  data () {
    let self = this;
    let v = this;
    return {
      currentBatchNumberAll: 0,
      firstValue: true,
      isOvercharge: 'N',
      receivingType: [
        {
          text: '手动关闭',
          value: '0'
        }, {
          text: '本次收货后关闭',
          value: '1'
        }, {
          text: '完全收货后关闭',
          value: '2'
        }
      ],
      loading2: false,
      printDate: [],
      printType: 'single', // 打印参数
      qualityCheckProcurementId: '', // 打印参数
      data3: [], // 打印参数
      barCodeShow: '', // 打印参数
      modal1: false, // 批量收货
      scanTitle: '扫描或输入搜索入库单/快递单',
      scanPlaceholder: '支持通过入库单、采购单、快递单、退货跟踪号查询',
      hasSku: '1',
      activeRow: null,
      printSKUBarcodeAfterReceiving: 'N',
      positionList: v.$store.state.positionList,
      receiptData: [],
      detail: {
        receiptNo: '', // 入库单编号
        referenceNo: '', // 参考编号
        warehouseName: '', // 仓库
        receiptType: '', // 入库单类型
        receiptStatus: '', // 入库单状态
        purchaserName: '' // 采购员
      }, // 入库单详情头部数据
      showDetail: false,
      spinShow: false,
      scanningMethod: '1',
      warehouseLocationId: '', // 库位
      formInline: {
        receiptNo: '', // 入库单编号
        resultFlag: 'Q', // 收货后是否需要质检
        closeReceipt: '2' // 0手动关闭,1本次收货后关闭,2完全收货后关闭
      },
      ruleInline: {},
      receiptNoOrReferenceNo: '',
      pageArray1: [10, 50, 100],
      total: 0,
      total1: 0,
      curPage: 1,
      curPage1: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      pageParams1: {
        pageNum: 1,
        pageSize: 10
      },
      locationList: [], // 收货库位
      columns1: [
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: 'SKU图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.goodsUrl
                     ? self.$store.state.imgUrlPrefix + params.row.goodsUrl
                     : require('../../../../../public/static/images/placeholder.jpg')
              },
              style: {
                width: '60px',
                height: '60px',
                padding: '4px 0'
              }
            });
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsSku);
          }
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [
              h('span', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsCnDesc)
            ]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [
              h('span', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsEnDesc)
            ]);
          }
        }, {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        }, {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    let obj = JSON.parse(JSON.stringify(v.data1[params.index]));
                    obj.currentbatchNumber = value;
                    v.data1[params.index] = obj;
                    v.changeCurrent();
                  }
                }
              })
            ]);
          }
        }
      ],
      scanSku: '', // 扫描sku
      data1: [], // 无源入库
      columns2: [
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '入库单编号',
          key: 'receiptNo'
        }, {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, '超量收货');
            }
          }
        }, {
          title: 'SKU图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsSku);
          }
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsAttributes);
          }
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [
              h('span', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsCnDesc)
            ]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [
              h('span', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsEnDesc)
            ]);
          }
        }, {
          title: '预期数量',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.expectedNumber);
          }
        }, {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        }, {
          title: '未收货数量', // 未收货数量
          key: 'nobatchNumber',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.nobatchNumber);
          }
        }, {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    let obj = JSON.parse(JSON.stringify(v.data2[params.index]));
                    obj.currentbatchNumber = value;
                    v.data2[params.index] = obj;
                    v.changeCurrent();
                  }
                }
              })
            ]);
          }
        }
      ],
      data2: [],
      receivingStatus: [],
      receivingStatusList: [
        {
          type: 1,
          name: '创建状态'
        }, {
          type: 2,
          name: '部分收货'
        }, {
          type: 3,
          name: '全部收货'
        }
      ],
      rawData: []
    };
  },
  activated () {
    this.showDetail = false;
    this.reset();
    this.getPositionListNew(['00', '10'], '0').then(data => {
      this.getCache();
      this.warehouseLocationId = '';
    });
  },
  created () {
    if (!this.getPermission('wmsReceipt_scan')) {
      this.gotoError();
    }
    this.getPositionListNew(['00', '10'], '0').then(data => {
      this.getCache();
      this.warehouseLocationId = '';
      /* if (!this.warehouseLocationId) {
       let id = data.find(i => {
       return i.pickingCheckFlag === '1';
       });
       this.firstValue = true;
       this.warehouseLocationId = id ? id.warehouseLocationId : '';
       } */
    });
  },
  methods: {
    reset () {
      this.scanSku = '';
      this.receivingStatus = [];
      this.warehouseLocationId = '';
      this.receiptNoOrReferenceNo = '';
      this.formInline.resultFlag = 'Q';
      this.printSKUBarcodeAfterReceiving = 'N';
      this.isOvercharge = 'N';
      this.scanningMethod = '1';
      this.formInline.closeReceipt = '2';
      this.hasSku = '1';
    },
    getWarehouseLocation (query) {
      this.getPositionListNew(['00', '10'], '0', query);
    },
    changeCurrent () {
      /**
       * @Description: 本次收货总数量
       * @author gan
       * @date: 2020/10/30 14:48
       */
      let number2 = this.data2.reduce((i, j) => {
        i = i + j.currentbatchNumber;
        return i;
      }, 0);
      // 无源入库
      let number1 = this.data1.reduce((i, j) => {
        i = i + j.currentbatchNumber;
        return i;
      }, 0);
      this.currentBatchNumberAll = number2 + number1;
    },
    saveCache () {
      // 存缓存
      let v = this;
      console.log('save');
      let receiptSetting = {
        warehouseLocationId: v.warehouseLocationId, // 库位
        isOvercharge: v.isOvercharge, // 库位
        resultFlag: v.formInline.resultFlag, // 收货后是否需要质检
        printSKUBarcodeAfterReceiving: v.printSKUBarcodeAfterReceiving, // 收货后是否打印
        scanningMethod: v.scanningMethod, // 扫描模式
        closeReceipt: v.formInline.closeReceipt, // 收货后是否关闭入库单
        hasSku: v.hasSku // 扫描到不存在SKU
      };
      localStorage.setItem('receiptSetting', JSON.stringify(receiptSetting));
    },
    getCache () {
      // 获取缓存
      let v = this;
      if (localStorage.getItem('receiptSetting')) {
        let receiptSetting = JSON.parse(localStorage.getItem('receiptSetting'));
        let hasWarehouseId = v.$store.state.positionList.map(i => i.warehouseLocationId).includes(receiptSetting.warehouseLocationId); // 判断是否存在缓存库位
        v.warehouseLocationId = hasWarehouseId ? receiptSetting.warehouseLocationId : '';
        v.formInline.resultFlag = receiptSetting.resultFlag;
        v.printSKUBarcodeAfterReceiving = receiptSetting.printSKUBarcodeAfterReceiving;
        v.scanningMethod = receiptSetting.scanningMethod;
        v.formInline.closeReceipt = receiptSetting.closeReceipt;
        v.hasSku = receiptSetting.hasSku;
        v.isOvercharge = receiptSetting.isOvercharge;
      }
    },
    print (receiptNo, row) {
      this.getPrintDate(receiptNo, row).then(() => {
        this.$store.commit('printSkuModal', true);
      });
    },
    getPrintDate (id, row, referenceNo) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryAllByReceiptNo, { receiptNoList: [id] }).then(res => {
          if (res.data.code === 0) {
            // 添加参考编号
            /* let printDate = res.data.datas.filter(item => {
             if (row.referenceNo2) {
             item.referenceNo = row.referenceNo + '/' + v.sepCommasFn(row.referenceNo2).join('/');
             } else {
             item.referenceNo = row.referenceNo;
             if (referenceNo) {
             item.referenceNo = referenceNo;
             }
             }
             // 这里需要展示的打印数量是收货数量 因为后面计算是预期数量减去已收货数量所以这里转换
             [...v.data1, ...v.data2].forEach(i => {
             if (i.goodsSku === item.goodsSku && i.currentbatchNumber > 0) {
             item.doneNumber = item.expectedNumber - i.currentbatchNumber;
             item.print = true;
             }
             });
             if (item.print) {
             item.warehouseLocationName = v.$store.state.positionList.filter(i => {
             if (i.warehouseLocationId === v.warehouseLocationId) {
             return i;
             }
             })[0].warehouseLocationName;
             item.warehouseLocationNameBarCode = '123';
             item.receiptBatchNo = '批次号占位';
             return item;
             }
             }); */
            let printDate = [];
            [...v.data1, ...v.data2].forEach(i => {
              res.data.datas.forEach(item => {
                if (i.goodsSku === item.goodsSku && i.currentbatchNumber > 0) {
                  if (row.referenceNo2) {
                    item.referenceNo = row.referenceNo + '/' + v.sepCommasFn(row.referenceNo2).join('/');
                  } else {
                    item.referenceNo = row.referenceNo;
                    if (referenceNo) {
                      item.referenceNo = referenceNo;
                    }
                  }
                  item.doneNumber = item.expectedNumber - i.currentbatchNumber;
                  item.warehouseLocationName = v.$store.state.positionList.filter(i => {
                    if (i.warehouseLocationId === v.warehouseLocationId) {
                      return i;
                    }
                  })[0].warehouseLocationName;
                  item.warehouseLocationNameBarCode = '123';
                  item.receiptBatchNo = '批次号占位';
                  printDate.push(item);
                }
              });
            });

            // 默认第一个打印条码
            v.barCodeShow = printDate[0].barcode;
            v.printDate = printDate;
            resolve(res.data);
          }
        }).catch(() => {
        });
      });
    },
    printsuccess (data) {
      let v = this;
      data.forEach(i => {
        v.data1.forEach((j, index) => {
          if (i.goodsSku === j.goodsSku) {
            v.$set(v.data1[index], 'currentbatchNumber', i.notReceivingNumber);
          }
        });
        v.data2.forEach((j, index) => {
          if (i.goodsSku === j.goodsSku) {
            v.$set(v.data2[index], 'currentbatchNumber', i.notReceivingNumber);
          }
        });
      });
      if (data[0].iSClOSE) {
        this.$store.commit('printSkuModal', false);
      }
      v.receipt(false);
    },
    setScrollTop (type, index) {
      let body = this.$refs.table1.$el.getElementsByClassName('ivu-table-body')[0];
      let body1 = this.$refs.table1.$el.getElementsByClassName('ivu-table-body')[0];
      if (type === 'y') {
        body.scrollTop = index * 66;
      } else {
        body1.scrollTop = index * 66;
      }
    },
    setAmountMax () {
      let v = this;
      let data = JSON.parse(JSON.stringify(v.data2));
      data.forEach(item => {
        if (item.nobatchNumber > 0) {
          v.$set(item, 'currentbatchNumber', item.nobatchNumber);
        } else {
          v.$set(item, 'currentbatchNumber', 0);
        }
      });
      v.data2 = [];
      v.data2 = data;
      v.changeCurrent();
    },
    receipt (NoPrint = true, printData) {
      /**
       * params
       * NoPrint 是否执行打印 默认 true
       * */
      let v = this;
      if (printData) {
        printData.forEach(i => {
          v.data1.forEach((j, index) => {
            if (i.goodsSku === j.goodsSku) {
              v.$set(v.data1[index], 'currentbatchNumber', i.notReceivingNumber);
            }
          });
          v.data2.forEach((j, index) => {
            if (i.goodsSku === j.goodsSku) {
              v.$set(v.data2[index], 'currentbatchNumber', i.notReceivingNumber);
            }
          });
        });
      }
      return new Promise(resolve => {
        // let list = {};// 商品对象
        // hasSku 扫描模式 1 无源入库 2  忽略
        if (v.warehouseLocationId === '') {
          v.$Message.error({
            duration: 5,
            content: '库位为空或者输入的库位不存在，请选择库位'
          });
          v.$Spin.hide();
          return;
        }
        if (v.detail.receiptStatus === '1') {
          v.$Message.error({
            duration: 5,
            content: '入库单已取消'
          });
          v.$Spin.hide();
          return;
        }
        if (v.detail.receiptStatus === '2') {
          v.$Message.error({
            duration: 5,
            content: '入库单已关闭'
          });
          v.$Spin.hide();
          return;
        }
        let params = Object.assign({}, v.formInline);
        v.data1.forEach(i => {
          i.source = 'U';
        });
        params.receiptBatch = JSON.parse(JSON.stringify([...v.data1, ...v.data2])).filter(i => {
          if (i.currentbatchNumber > 0) {
            return i;
          }
        }); // data1 无源入库  data2 入库单明细
        if (params.receiptBatch.length === 0) {
          v.$Message.error({
            duration: 5,
            content: '收货数量为空'
          });
          v.$Spin.hide();
          return;
        }
        let warehouseBlockId = '';
        let warehouseLocationName = '';
        v.$store.state.positionList.forEach(i => {
          if (i.warehouseLocationId === v.warehouseLocationId) {
            warehouseBlockId = i.warehouseBlockId;
            warehouseLocationName = i.warehouseLocationName;
          }
        });
        params.receiptBatch.forEach(i => {
          i.warehouseLocationId = v.warehouseLocationId;
          i.resultFlag = v.formInline.resultFlag;
          i.warehouseId = v.detail.warehouseId;
          i.receiptNo = v.detail.receiptNo;
          i.warehouseBlockId = warehouseBlockId;
          i.warehouseLocationName = warehouseLocationName;
        });
        if (v.printSKUBarcodeAfterReceiving === 'Y' && NoPrint) {
          // 是否收货完打印  这里会回调到 printsuccess 收货
          v.$refs.printSkuCode.printBtnText = '收货并打印';
          v.$refs.printSkuCode.isCloseModal = true;
          v.print(v.detail.receiptNo, v.detail);
        } else {
          if (v.isOvercharge === 'N' && params.receiptBatch.some(i => i.currentbatchNumber > i.nobatchNumber)) {
            v.$Message.error('不允许超量收货！');
            v.$Spin.hide();
            return;
          }
          // currentbatchNumber
          params.isOvercharge = v.isOvercharge
                               ? v.isOvercharge
                               : 'N';
          v.axios.post(api.add_receiveBatch, params).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('收货成功！');
              resolve(res.data.datas);
              v.search(v.detail.receiptNo, true).then(() => {
                v.$Spin.hide();
              });
            } else if (res.data.code === 554135) {
              v.$Message.error('不允许超量收货');
              return false;
            } else if (res.data.code === 554136) {
              v.$Message.error('入库单已关闭,不能进行收货!');
              return false;
            }
          });
        }
      });
    },
    scanning () {
      let v = this;
      // scanningMethod 扫描模式 1 逐件扫描 2  批量扫描
      let sku = v.scanSku.toLowerCase();
      let allDate = [...this.data2, ...this.data1]; // 入库单明细 和无源入库
      let hasSkuA = allDate.find(item => {
        return item.goodsSku.toLowerCase() === sku.toLowerCase();
      });
      if (hasSkuA) {
        // 找的到sku
        allDate.forEach((item, index) => {
          if (sku === item.goodsSku.toLowerCase()) {
            v.setScrollTop('y', index);
            v.activeRow = item;
            let nub = item.currentbatchNumber || 0;
            // scanningMethod 扫描模式 1 逐件扫描  2  批量扫描
            // dataType true 无源入口
            v.$set(item, 'currentbatchNumber', nub);
            if (item.dataType) {
              // 无源入库
              nub += 1;
              v.$set(item, 'currentbatchNumber', nub);
            } else {
              if (v.scanningMethod === '1') {
                nub += 1;
                v.$set(item, 'currentbatchNumber', nub);
              } else {
                v.$set(item, 'currentbatchNumber', item.nobatchNumber);
              }
            }
            v.changeCurrent();
          }
        });
      } else {
        // 找不到sku
        if (v.hasSku === '1') {
          // 无源入库
          v.getProductDetail(sku).then(data => {
            v.data1.push(data);
            v.changeCurrent();
            v.activeRow = data;
            v.total1 += 1;
            // v.setScrollTop('y', index);
          });
        }
      }
      allDate.forEach(item => {
        v.data2.forEach((item1, index) => {
          if (item.goodsSku === item1.goodsSku) {
            v.$set(v.data2[index], 'currentbatchNumber', item.currentbatchNumber);
          }
        });
        v.data1.forEach((item1, index) => {
          if (item.goodsSku === item1.goodsSku) {
            v.$set(v.data1[index], 'currentbatchNumber', item.currentbatchNumber);
          }
        });
      });
      let data1 = JSON.parse(JSON.stringify(v.data1));
      let data2 = JSON.parse(JSON.stringify(v.data2));
      v.data1 = [];
      v.data2 = [];
      v.data1 = data1;
      v.data2 = data2;
      v.scanSku = '';
    },
    getProductDetail (sku) {
      let v = this;
      // 通过sku 返回产品信息
      return new Promise(resolve => {
        v.axios.get(api.wmsGoodsQueryGoodsBySku + '?sku=' + sku).then(res => {
          let data = res.data;
          if (data.code === 0) {
            if (data.datas === null) {
              v.$Message.error({
                duration: 5,
                content: '未找到商品'
              });
            } else {
              data.datas.dataType = true; // 标志为无源入库
              data.datas.currentbatchNumber = 1;
              resolve(data.datas);
            }
          }
        }).catch(() => {
        });
      });
    },
    rowClassName (row) {
      if (this.activeRow && this.activeRow.goodsSku === row.goodsSku) {
        return 'demo-table-info-row';
      }
      return '';
    },
    changePage (page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.search();
    },
    changePageSize (val) {
      this.pageParams.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem('pageSize', val);
      }
      this.search();
    },
    getList () {
    },
    changePage1 (page) {
      let v = this;
      v.pageParams1.pageNum = page;
      v.search();
    },
    changePageSize1 (val) {
      this.pageParams1.pageSize = +val;
      this.search();
    },
    getList1 () {
    },
    search (model, isShowCloseMessage) {
      var v = this;
      if (model) {
        v.receiptNoOrReferenceNo = model;
      }
      v.spinShow = true;
      if (v.receiptNoOrReferenceNo === '') return;
      return new Promise(resolve => {
        v.TableLoading = true;
        v.axios.post(api.wmsReceiptQueryDetail, {
          receiptBatchQueryParam: {
            pageNum: 1,
            pageSize: 10
          },
          receiptDetailPQueryParam: {
            pageNum: v.pageParams.pageNum,
            pageSize: 20000
          },
          receiptDetailUQueryParam: {
            pageNum: v.pageParams1.pageNum,
            pageSize: 20000
          },
          receiptBatchCheckQueryParam: {
            // 质检记录
            pageNum: 1,
            pageSize: 10
          },
          receiptShelveQueryParam: {
            // 上架记录
            pageNum: 1,
            pageSize: 10
          },
          receiptNoOrReferenceNo: v.receiptNoOrReferenceNo,
          warehouseId: v.getWarehouseId()
        }).then(res => {
          v.TableLoading = false;
          if (res.data.code === 0) {
            if (res.data.datas === null) {
              v.$Message.error({
                duration: 5,
                content: '暂无数据'
              });
              v.spinShow = false;
              return;
            }
            v.currentBatchNumberAll = 0; // 初始化本次收货数量
            if (res.data.datas.receipt.receiptStatus === '2' && !isShowCloseMessage) {
              v.$Message.error({
                duration: 5,
                content: '入库单' + '(' + res.data.datas.receipt.receiptNo + ')' + '已关闭，无法收货'
              });
              v.spinShow = false;
              v.detail.receiptStatus = '2';
              return;
            }
            v.detail = Object.assign({}, v.detail, res.data.datas.receipt); // 入库单详情 purchaserId
            let list = v.$store.state.userInfoList;
            if (list && res.data.datas.receipt.purchaserId) {
              v.detail.purchaserName = list[res.data.datas.receipt.purchaserId].userName;
            }
            v.formInline.receiptNo = v.detail.receiptNo;
            v.data2 = [];
            v.data1 = [];
            v.$nextTick(() => {
              v.data2 = res.data.datas.receiptDetailPPage.list.map(i => {
                i.currentbatchNumber = 0;
                return i;
              }); // 入库单明细
              v.data1 = res.data.datas.receiptDetailUPage.list.map(i => {
                i.currentbatchNumber = 0;
                return i;
              }); // 无源入库
              v.total = res.data.datas.receiptDetailPPage.total;
              v.total1 = res.data.datas.receiptDetailUPage.total;
              v.rawData = v.data2;
              v.showDetail = true;
              v.spinShow = false;
              v.$refs.scanSkuRef.focus();
              resolve();
            });
          }
        });
      });
    }, // sku的收货状态
    changeStatus (value) {
      if (value.length > 0) {
        let data = [];
        let talgData = this.rawData;
        value.map((item) => {
          // 创建状态
          if (item === 1) {
            if (talgData.length > 0) {
              talgData.map((ele) => {
                if (ele.doneNumber === 0) {
                  data.push(ele);
                }
              });
            }
          }
          // 部分收货
          if (item === 2) {
            if (talgData.length > 0) {
              talgData.map((ele) => {
                if (ele.doneNumber !== 0 && ele.doneNumber < ele.expectedNumber) {
                  data.push(ele);
                }
              });
            }
          }
          // 全部收货
          if (item === 3) {
            if (talgData.length > 0) {
              talgData.map((ele) => {
                if (ele.doneNumber >= ele.expectedNumber) {
                  data.push(ele);
                }
              });
            }
          }
        });
        this.data2 = data;
      } else {
        this.data2 = this.rawData;
      }
    }
  },
  computed: {
    expectedNumberAll () {
      // 总预期数量
      return this.data2.reduce((i, j) => {
        i = i + j.expectedNumber;
        return i;
      }, 0);
    },
    doneNumberAll () {
      // 总已收货数量
      let number2 = this.data2.reduce((i, j) => {
        i = i + j.doneNumber;
        return i;
      }, 0);
      // 无源入库
      let number1 = this.data1.reduce((i, j) => {
        let number = j.doneNumber || 0;
        i = i + number;
        return i;
      }, 0);
      return number1 + number2;
    },
    noBatchNumberAll () {
      // 总未收货数量
      return this.data2.reduce((i, j) => {
        i = i + j.nobatchNumber;
        return i;
      }, 0);
    },
    activeData () {
      return this.$store.state.activeDate;
    },
    abnormalStatus () {
      let obj = {
        a: false,
        b: false,
        c: false
      };
      if (this.detail.abnormalStatus) {
        let arr = this.detail.abnormalStatus.split('+');
        if (arr[0] === '1') {
          obj.a = true;
        }
        if (arr[1] === '1') {
          obj.b = true;
        }
        if (arr[2] === '1') {
          obj.c = true;
        }
      }
      return obj;
    }
  },
  watch: {
    activeData: function (value) {
      if (!this.getPermission('wmsReceipt_scan') && this.$route.path === '/receipt') {
        this.gotoError();
      }
    }
  }
};
</script>

<style>
.search-box .ivu-input {
  height: 40px;
}

.ivu-table .demo-table-info-row td {
  background-color: #2db7f5;
  color: #fff;
}
</style>
<style scoped>
.mt10 :deep(.ivu-icon-ios-close) {
  color: #666 !important;
}
.tag-color {
  color: #fff;
  padding: 2px 10px;
  margin-left: 10px;
  border-radius: 5px;
}

.tag-color-1 {
  background-color: #169db5;
}

.tag-color-2 {
  background-color: #ff33ff;
}

.tag-color-3 {
  background-color: #ff9900;
}

.pd10 {
  padding: 10px;
}

.mt10 {
  margin-top: 10px;
}

.receipt-top-label {
  width: 145px;
  display: inline-block;
  text-align: right;
}

.receipt-img-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  background: #d7d7d7;
  overflow: hidden;
}

.receipt-img-box img {
  max-width: 100%;
  max-height: 100%;
}

.receipt-img-box .text {
  font-size: 24px;
  color: red;
}

.right-box {
  padding-left: 10px;
}

.search-box {
  width: 1000px;
}

.search-box .search-label {
  line-height: 50px;
  text-align: right;
  font-size: 18px;
}

.search-box .search-ipt {
  line-height: 50px;
  height: 50px;
}

.search-box .search-btn {
  margin-left: 10px;
}
.card-r-tit {
  margin-top: -3px;
  overflow: initial;
  width: 400px;
}
</style >
