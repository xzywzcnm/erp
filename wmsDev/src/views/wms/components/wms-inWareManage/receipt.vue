<template >
  <div class="pd10">
    <div v-if="!showDetail" style="margin-top: 100px;">
      <scan @enter="search" :title="scanTitle" :placeholder="scanPlaceholder"></scan>
    </div>
    <div v-else>
      <Card dis-hover>
        <div class="search-box">
          <div class="search-label">{{ scanTitle }}：</div>
          <div class="search-box_input">
            <Input v-model.trim="receiptNoOrReferenceNo" :placeholder="scanPlaceholder"
              @on-enter="search(receiptNoOrReferenceNo)" size="large"></Input>
          </div>
          <Button type="primary" icon="ios-search" @click="search(receiptNoOrReferenceNo)" size="large">
            查询
          </Button>
          <div class="search-tips" v-if="qualityTest.haveCheck == 1">
            收货后是否需要质检：
            <span>{{ ['1', '2', 1, 2].includes(qualityTest.checkType) ? '是' : '否' }}</span>
          </div>
        </div>
      </Card>
      <div class="receiptBlock mt10">
        <div class="receiptBlock_left mr10">
          <div class="receipt-img-box">
            <Poptip trigger="hover" placement="right" width="720">
              <div>
                <img v-if="activeRow !== null" :src="$store.state.imgUrlPrefix + activeRow.goodsUrl" />
                <div v-else class="text">
                  请扫描商品
                </div>
              </div>
              <div slot="content">
                <img v-if="activeRow !== null" :src="$store.state.imgUrlPrefix + activeRow.goodsUrl" />
              </div>
            </Poptip>
          </div>
          <Card class="mt10 formDetail leftSetting" dis-hover>
            <Input placeholder="扫描商品条码" v-model.trim="scanSku" ref="scanSkuRef" @on-enter="scanning" />
            <Form ref="formInline" :model="formInline" :rules="ruleInline" :label-width="130" class="mt10 fmb10">
              <FormItem prop="c" label="选择收货库位">
                <Select v-model.trim="warehouseLocationId" filterable remote transfer
                  :remote-method="getWarehouseLocation" @click.native="getWarehouseLocation('')" :loading="loading2"
                  @on-change="saveCache">
                  <Option v-for="item in $store.state.positionList" :disabled="item.checkStatus === '1'"
                    :title="item.checkStatus === '1' ? '盘点中' : ''" :value="item.warehouseLocationId"
                    :key="item.warehouseLocationId" @click.native="addTableLocationName(item.warehouseLocationName)"
                    :label="item.warehouseLocationName" />
                </Select>
              </FormItem>
              <FormItem label="收货后是否需要质检">
                <RadioGroup v-model="formInline.resultFlag" @on-change="saveCache">
                  <Radio label="Q" :disabled="qualityTest.haveCheck == 1">是</Radio>
                  <Radio label="S" :disabled="qualityTest.haveCheck == 1">否</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="收货后打印SKU条码">
                <RadioGroup v-model="printSKUBarcodeAfterReceiving" @on-change="saveCache">
                  <Radio label="Y">是</Radio>
                  <Radio label="N">否</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="是否允许超量收货">
                <RadioGroup v-model="isOvercharge" @on-change="saveCache">
                  <Radio label="Y">是</Radio>
                  <Radio label="N">否</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="扫描模式">
                <RadioGroup v-model="scanningMethod" @on-change="saveCache">
                  <Radio label="1">逐件扫描
                  </Radio>
                  <Radio label="2">批量扫描</Radio>
                </RadioGroup>
              </FormItem>
              <!-- <FormItem label="收货后关闭入库单">
                <Select v-model="formInline.closeReceipt" @on-change="saveCache">
                  <Option v-for="(item, index) in receivingType" :key="index" :value="item.value">{{ item.text }}
                  </Option>
                </Select>
              </FormItem> -->
              <FormItem label="扫描到不存在SKU">
                <RadioGroup v-model="hasSku" @on-change="saveCache">
                  <Radio label="1">无源入库
                  </Radio>
                  <Radio label="2">忽略</Radio>
                </RadioGroup>
              </FormItem>
            </Form>
            <Button long @click="setAmountMax">收货数量设为最大 </Button>
            <Button class="mt10" type="primary" long @click="pageReceipt">确认收货 </Button>
          </Card>
        </div>
        <div class="receiptBlock_right">
          <div>
            <Alert type="success">
              <span slot="desc">
                <span>总预期数量:</span><b>{{ expectedNumberAll }}</b>
                <span class="ml10">总已收货数量:</span><b>{{ doneNumberAll }}</b>
                <span class="ml10">总未收货数量:</span><b>{{ noBatchNumberAll }}</b>
                <span class="ml10">本次收货总数量:</span><b>{{ currentBatchNumberAll }}</b>
              </span>
            </Alert>
            <div v-for="(detail, index) in receiptData" :key="`d-${index}`">
              <Card title="入库单明细" dis-hove class="mt10">
                <div slot="title">
                  <span>入库单明细</span>
                  <p style="float:right; " class="card-r-tit">
                    <span class="font-14 ">SKU收货状态：</span> <Select v-model="receivingStatus[index]" multiple size="small"
                      style="width: 300px;" @on-change="changeStatus($event, index)">
                      <Option v-for="(item, index) in receivingStatusList" :key="index" :label="item.name"
                        :value="item.type">{{ item.name }} </Option>
                    </Select>
                  </p>
                </div>
                <Card dis-hover class="mb10">
                  <Row>
                    <Col span="8">
                    <p style="margin-bottom: 8px;">
                      <span class="receipt-top-label">入库单编号：</span>{{ detail.receiptNo }}
                    </p>
                    <p>
                      <span class="receipt-top-label">入库单类型：</span>
                      <span v-if="inWareTypeList[detail.receiptType]">
                        {{ inWareTypeList[detail.receiptType].label }}
                      </span>
                      <!-- <span v-if="detail.receiptType === '0'">备货入库</span>
                      <span v-if="detail.receiptType === '1'">生产入库</span>
                      <span v-if="detail.receiptType === '2'">调拨入库</span>
                      <span v-if="detail.receiptType === '3'">退货入库</span>
                      <span v-if="detail.receiptType === '4'">其他入库</span>
                      <span v-if="detail.receiptType === '5'">急采入库</span>
                      <span v-if="detail.receiptType === '6'">海外仓备货入库</span>
                      <span v-if="detail.receiptType === '7'">FBA备货入库</span>
                      <span v-if="detail.receiptType === '8'">直发备货入库</span> -->
                    </p>
                    </Col>
                    <Col span="8">
                    <p style="margin-bottom: 8px;display:flex;">
                      <span class="receipt-top-label">参考编号：</span>
                      <span style="display:inline-flex;flex-wrap:wrap;">
                        <span>{{ detail.referenceNo }}/</span>
                        <span>{{ sepCommasFn(detail.referenceNo2).join('/') }}</span>
                        <span v-if="detail.referenceNo3">/{{ detail.referenceNo3 }}</span>
                      </span>
                    </p>
                    <p>
                      <span class="receipt-top-label">采购员：</span> <span>{{ getUserName(detail.purchaserId) }}</span>
                    </p>
                    </Col>
                    <Col span="8">
                    <p style="margin-bottom: 8px;">
                      <span class="receipt-top-label">入库单状态：</span>
                      <span v-if="detail.receiptStatus === '0'">入库单创建</span>
                      <span v-if="detail.receiptStatus === '1'">入库单取消</span>
                      <span v-if="detail.receiptStatus === '2'">入库单关闭</span>
                      <span v-if="detail.receiptStatus === '3'">收货中</span>
                      <span class="tag-color tag-color-1"
                        v-if="detail.abnormalStatus && detail.abnormalStatus.split('+')[0] === '1'">无源入库</span><span
                        class="tag-color tag-color-2"
                        v-if="detail.abnormalStatus && detail.abnormalStatus.split('+')[1] === '1'">部分收货</span><span
                        class="tag-color tag-color-3"
                        v-if="detail.abnormalStatus && detail.abnormalStatus.split('+')[2] === '1'">超量收货</span>
                    </p>
                    <p style="margin-bottom: 8px;">
                      <span class="receipt-top-label">来货特项：</span>
                      <template v-if="detail.comingSpecial">
                        <span v-for="(item, index) in detail.comingSpecial.split(',')" :key="index">
                          <Tag color="magenta">
                            {{ productTagList[item] ? productTagList[item].comingSpecial : item }}
                          </Tag>
                        </span>
                      </template>
                    </p>
                    </Col>
                  </Row>
                </Card>
                <Table :row-class-name="rowClassName" ref="table1" :columns="columns2" :data="detail.data2"
                  maxHeight="560" border class="tablePd6"></Table>
              </Card>
              <!-- 无源入库不用了 -->
              <Card title="无源入库" dis-hover v-show="detail.data1.length > 0">
                <Table :row-class-name="rowClassName" border :columns="columns1" :data="detail.data1" height="190">
                </Table>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
    <printSkuCode ref="printSkuCode" :printSource="'receipt'" :printSkuObj="printDate" :printType="printType"
      :qualityCheckProcurementId="qualityCheckProcurementId" @printEnd="printsuccess" :tipsDataLength="data3"
      :barCodeShow="barCodeShow"></printSkuCode>
    <handleSku ref="handleSkuRef" :data="handleSkuData" @changeHandleSku="changeHandleSku"></handleSku>
  </div>
</template>

<script>
import CommonMixin from '@/components/mixin/common_mixin';
import transWarehouseMixin from '@/components/mixin/transWarehouse_mixin';
import api from '@/api/api';
import scan from '../common/scan';
import printSkuCode from '../common/printSkuCode';
import handleSku from '@/views/wms/components/wms-inWareManage/componts/handleSku';
import { inWareTypeObj } from '@/views/wms/components/common/receiptType.js';

export default {
  name: 'receipt', // 收货
  mixins: [CommonMixin, transWarehouseMixin],
  components: {
    scan,
    printSkuCode,
    handleSku,
  },
  data() {
    let self = this;
    let v = this;
    return {
      inWareTypeList: inWareTypeObj(),
      handleSkuData: [],
      currentBatchNumberAll: 0,
      firstValue: true,
      isOvercharge: 'N',
      // receivingType: [
      //   {
      //     text: '手动关闭',
      //     value: '0'
      //   }, {
      //     text: '本次收货后关闭',
      //     value: '1'
      //   }, {
      //     text: '完全收货后关闭',
      //     value: '2'
      //   }
      // ],
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
      receiptData: [
        {
          detail: {
            receiptNo: '', // 入库单编号
            referenceNo: '', // 参考编号
            warehouseName: '', // 仓库
            receiptType: '', // 入库单类型
            receiptStatus: '', // 入库单状态
            purchaserName: '' // 采购员
          },
          data1: [],
          data2: [],
        }
      ],
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
        // closeReceipt: '2', // 0手动关闭,1本次收货后关闭,2完全收货后关闭
        receiptBatch: ''
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
        },
        {
          title: '质检',
          align: 'center',
          width: 80,
          render: (h, params) => {
            // 是否质检：haveCheck:1空 2检
            return h('span', {}, params.row.haveCheck == 2 ? '检' : '');
          }
        },
        {
          title: 'SKU图片',
          key: 'goodsUrl',
          align: 'center',
          width: 90,
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
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            // return h('div', [
            //   h('div', {
            //     style: {
            //       color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
            //     }
            //   }, params.row.goodsSku || '-'),
            //   h('div', params.row.barCode || '-'),
            // ])
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsSku);
          }
        },
        {
          title: '商品描述',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('div', {
              style: { textAlign: 'left' }
            }, [
              h('Poptip', {
                props: {
                  content: params.row.goodsCnDesc,
                  trigger: 'hover'
                }
              }, [
                h('span', {
                  style: {
                    color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                    paddingTop: '6px',
                  }
                }, params.row.goodsCnDesc)
              ]),
              h('Poptip', {
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
              ])
            ])
          }
        },
        {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        },
        {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          width: 120,
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
          width: 56,
          align: 'center'
        },
        {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          width: 86,
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
        },
        {
          title: '质检',
          align: 'center',
          width: 66,
          render: (h, params) => {
            // 是否质检：haveCheck:1空 2检
            return h('span', {}, params.row.haveCheck == 2 ? '检' : '');
          }
        },
        {
          title: 'SKU图片',
          key: 'goodsUrl',
          align: 'center',
          width: 76,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: 'SKU/条码编码',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsSku || ''),
              h('div', params.row.barCode || ''),
            ])
          },
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsAttributes);
          }
        },
        {
          title: '商品描述',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', {
              // style: { textAlign: 'left' }
            }, [
              h('Poptip', {
                style: { display: 'block' },
                props: {
                  content: params.row.goodsCnDesc,
                  trigger: 'hover',
                  transfer: true,
                }
              }, [
                h('span', {
                  style: {
                    color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                    paddingTop: '6px',
                  }
                }, params.row.goodsCnDesc)
              ]),
              h('Poptip', {
                style: { display: 'block' },
                props: {
                  content: params.row.goodsEnDesc,
                  trigger: 'hover',
                  transfer: true,
                }
              }, [
                h('span', {
                  style: {
                    color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                  }
                }, params.row.goodsEnDesc)
              ])
            ])
          }
        },
        {
          title: '收货要求',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 140,
          render: (h, { row }) => {
            return h('div', {
              style: {
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }
            }, row.outerPackageRequirement);
          }
        },
        {
          title: '缺货数量',
          align: 'center',
          width: 70,
          render: (h, params) => {
            let number = params.row.outOfStockNumber || 0;
            return h('span', {
              style: {
                color: number > 0 ? 'red' : ''
              }
            }, number)
          }
        },
        {
          // title: '预期总数量',
          key: 'sumExpectedNumber',
          align: 'center',
          width: 146,
          renderHeader: (h, params) => {
            return h('div', [
              h('span', {
                style: { color: '#7CCD7C' },
                attrs: { title: '预期总数量=预期数量+超发数量' }
              }, '预期'),
              h('span', ' | 已收 | '),
              h('span', {
                style: { color: '#7CCD7C' },
                attrs: { title: '未收货数量=预期总数量-已收货数量' }
              }, '未收货数量')
            ])
          },
          render: (h, { row }) => {
            let color = row.receiptDetailStatus === '3' ? '#f00' : '';
            return h('div', [
              h('span', {
                style: {
                  color: color
                }
              }, this.$common.isEmpty(row.sumExpectedNumber) ? 0 : row.sumExpectedNumber),
              h('span', {
                style: {
                  color: color
                }
              }, ` | ${row.doneNumber || 0} | `),
              h('span', {
                style: {
                  color: color
                }
              }, row.nobatchNumber || 0)
            ])
          }
        },
        // {
        //   title: '已收货数量', // 已收货数量
        //   key: 'doneNumber',
        //   align: 'center',
        //   width: 100,
        //   render: (h, params) => {
        //     return h('span', {
        //       style: {
        //         color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
        //       }
        //     }, params.row.doneNumber);
        //   }
        // },
        // {
        //   title: '未收货数量', // 未收货数量
        //   key: 'nobatchNumber',
        //   align: 'center',
        //   width: 100,
        //   renderHeader: (h, params) => {
        //     return h('span', {
        //       style: { color: '#7CCD7C' },
        //       attrs: { title: '未收货数量=预期总数量-已收货数量' }
        //     }, '未收货数量')
        //   },
        //   render: (h, params) => {
        //     return h('span', {
        //       style: {
        //         color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
        //       }
        //     }, params.row.nobatchNumber);
        //   }
        // },
        {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          width: 100,
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
                    v.$set(v.receiptData[params.row.__index].data2[params.index], 'currentbatchNumber', value)
                    v.changeCurrent();
                  }
                }
              })
            ]);
          }
        }
      ],
      warehouseBlockId: '',
      warehouseLocationName: '',
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
      rawData: [],
      qualityTest: { // 质检信息
        haveCheck: null, // 是否有质检单（1：有）
        checkType: null, // 质检类型（0:免检，1:抽检，2:全检）
      },
      productTagList: {},
    };
  },
  activated() {
    this.showDetail = false;
    this.reset();
    this.init();
  },
  created() {
    if (!this.getPermission('wmsReceipt_scan')) {
      this.gotoError();
      return;
    };
    this.init();
    this.getComingSpecialList();
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        let temp = {};
        (list || []).forEach(k => {
          temp[k.comingSpecialId] = k;
        })
        this.productTagList = temp;
      })
    },
    // 初始化
    init() {
      this.getPositionListNew(['00', '10'], '0').then(data => {
        this.getCache();
        this.warehouseLocationId = '';
      });
    },
    changeHandleSku(obj) {
      let v = this;
      v.warehouseLocationIdHandleSku = obj.warehouseLocationId;
      v.dataHandleSku = obj.data;
      v.receiptData.forEach(i => {
        i.data1.forEach(j => {
          obj.data.forEach(k => {
            if (j.goodsSku === k.goodsSku) {
              j.warehouseLocationName = k.warehouseLocationName;
            }
          })
        })
        i.data2.forEach(j => {
          obj.data.forEach(k => {
            if (j.goodsSku === k.goodsSku) {
              j.warehouseLocationName = k.warehouseLocationName;
            }
          })
        })
      })
      v.receipt(true)
    },
    abnormalStatus(tr) {
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
    },
    reset() {
      this.scanSku = '';
      this.receivingStatus = [];
      this.warehouseLocationId = '';
      this.receiptNoOrReferenceNo = '';
      this.formInline.resultFlag = 'Q';
      this.printSKUBarcodeAfterReceiving = 'N';
      this.isOvercharge = 'N';
      this.scanningMethod = '1';
      // this.formInline.closeReceipt = '2';
      this.hasSku = '1';
    },
    getWarehouseLocation(query) {
      this.getPositionListNew(['00', '10'], '0', query);
    },
    // 本次收货总数量
    changeCurrent() {
      let number1 = 0;
      let number2 = 0;
      this.receiptData.forEach(i => {
        number1 += i.data2.reduce((i, j) => {
          i = i + j.currentbatchNumber;
          return i;
        }, 0)
        if (i.data1 && i.data1.length) {
          number2 += i.data1.reduce((i, j) => {
            i = i + j.currentbatchNumber;
            return i;
          }, 0)
        }
      });
      this.currentBatchNumberAll = number2 + number1;
    },
    // 存缓存
    saveCache() {
      let v = this;
      let receiptSetting = {
        warehouseLocationId: v.warehouseLocationId, // 库位
        isOvercharge: v.isOvercharge, // 库位
        resultFlag: v.formInline.resultFlag, // 收货后是否需要质检
        printSKUBarcodeAfterReceiving: v.printSKUBarcodeAfterReceiving, // 收货后是否打印
        scanningMethod: v.scanningMethod, // 扫描模式
        // closeReceipt: v.formInline.closeReceipt, // 收货后是否关闭入库单
        hasSku: v.hasSku // 扫描到不存在SKU
      };
      localStorage.setItem('receiptSetting', JSON.stringify(receiptSetting));
    },
    // 获取缓存
    getCache() {
      let v = this;
      if (localStorage.getItem('receiptSetting')) {
        let receiptSetting = JSON.parse(localStorage.getItem('receiptSetting'));
        let hasWarehouseId = v.$store.state.positionList.map(i => i.warehouseLocationId).includes(receiptSetting.warehouseLocationId); // 判断是否存在缓存库位
        v.warehouseLocationId = hasWarehouseId ? receiptSetting.warehouseLocationId : '';
        v.formInline.resultFlag = receiptSetting.resultFlag;
        v.printSKUBarcodeAfterReceiving = receiptSetting.printSKUBarcodeAfterReceiving;
        v.scanningMethod = receiptSetting.scanningMethod;
        // v.formInline.closeReceipt = receiptSetting.closeReceipt;
        v.hasSku = receiptSetting.hasSku;
        v.isOvercharge = receiptSetting.isOvercharge;
      }
    },
    print(receiptNo, row) {
      this.getPrintDate(receiptNo, row).then((data) => {
        this.$store.commit('printSkuModal', true);
      });
    },
    addTableLocationName(locationName) {
      this.$store.state.positionList.forEach(i => {
        if (i.warehouseLocationId === this.warehouseLocationId) {
          this.warehouseBlockId = i.warehouseBlockId;
          this.warehouseLocationName = i.warehouseLocationName;
        }
      });
    },
    getPrintDate(id, row, referenceNo) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryAllByReceiptNo, {
          receiptNoList: v.receiptData.map(i => i.receiptNo)
        }).then(res => {
          if (res.data.code === 0) {
            let printDate = [];
            let obj = {};
            v.receiptData.forEach(i => {
              i.data2.forEach(j => {
                res.data.datas.forEach(k => {
                  if (j.goodsSku === k.goodsSku && j.currentbatchNumber > 0 && j.receiptNo === k.receiptNo) {
                    obj[j.goodsSku] = true;
                    if (i.referenceNo2) {
                      k.referenceNo = i.referenceNo + '/' + v.sepCommasFn(i.referenceNo2).join('/');
                    } else {
                      k.referenceNo = i.referenceNo;
                      if (referenceNo) {
                        k.referenceNo = referenceNo;
                      }
                    }
                    k.doneNumber = k.expectedNumber - j.currentbatchNumber;
                    k.warehouseLocationNameBarCode = '123';
                    k.receiptBatchNo = '批次号占位';
                    k.haveCheck = j.haveCheck;
                    k.qualityTestHtml = '<span style="font-size: 12px;width: 22px;height:22px;line-height:22px;display:inline-block;border:1px solid #3c4353;border-radius:50%;text-align:center;">检</span>';// 要打印的质检内容
                    // k.platformSubject = j.platformSubject;
                    printDate.push(k);
                  }
                })
              });
            })
            // 默认第一个打印条码
            v.barCodeShow = printDate[0].barcode;
            v.printDate = printDate;
            resolve(res.data);
          }
        }).catch(() => {
        });
      });
    },
    printsuccess(data) {
      let v = this;
      data.forEach(i => {
        v.receiptData.forEach((j, jIndex) => {
          if (i.receiptNo === j.receiptNo) {
            j.data1.forEach((k, index) => {
              if (i.goodsSku === k.goodsSku) {
                v.$set(v.receiptData[jIndex].data1[index], 'currentbatchNumber', i.notReceivingNumber)
              }
            });
            j.data2.forEach((k, index) => {
              if (i.goodsSku === k.goodsSku) {
                v.$set(v.receiptData[jIndex].data2[index], 'currentbatchNumber', i.notReceivingNumber)
              }
            });
          }
        })
      });
      if (data[0].iSClOSE) {
        this.$store.commit('printSkuModal', false);
      }
      v.receipt(false);
    },
    setScrollTop(type, index) {
      let body = this.$refs.table1.$el.getElementsByClassName('ivu-table-body')[0];
      let body1 = this.$refs.table1.$el.getElementsByClassName('ivu-table-body')[0];
      if (type === 'y') {
        body.scrollTop = index * 66;
      } else {
        body1.scrollTop = index * 66;
      }
    },
    setAmountMax() {
      let v = this;
      v.receiptData.forEach(i => {
        i.data2.forEach(item => {
          if (item.nobatchNumber > 0) {
            v.$set(item, 'currentbatchNumber', item.nobatchNumber);
          } else {
            v.$set(item, 'currentbatchNumber', 0);
          }
        })
      })
      v.changeCurrent();
    },
    pageReceipt() {
      this.warehouseLocationIdHandleSku = '';
      this.dataHandleSku = [];
      this.receipt(true, null, true);
    },
    receipt(isPrint = true, printData, isOutOfStockHandel) {
      /**
       * params
       * isPrint 是否执行打印 默认 true
       * */
      let v = this;

      if (printData) {
        printData.forEach(i => {
          v.receiptData.forEach((j, jIndex) => {
            if (i.receiptNo === j.receiptNo) {
              j.data1.forEach((k, index) => {
                if (j.goodsSku === k.goodsSku) {
                  v.$set(v.receiptData[jIndex].data1[index], 'currentbatchNumber', i.notReceivingNumber)
                }
              });
              j.data2.forEach((k, index) => {
                if (j.goodsSku === k.goodsSku) {
                  v.$set(v.receiptData[jIndex].data2[index], 'currentbatchNumber', i.notReceivingNumber)
                }
              });
            }
          })
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

        let params = Object.assign({}, v.formInline);
        v.receiptData.forEach(i => {
          i.data1.forEach(j => {
            j.source = 'U';
          })
        });
        let valid = false;
        params.receiptList = v.receiptData.filter(i => {
          let list = [...i.data1, ...i.data2].filter(j => {
            return j.currentbatchNumber > 0
          });
          if (list && list.length) {
            list = list.map(k => {
              k.warehouseLocationId = v.warehouseLocationId;
              k.resultFlag = v.formInline.resultFlag;
              k.warehouseId = i.warehouseId;
              k.receiptNo = i.receiptNo;
              k.warehouseBlockId = v.warehouseBlockId;
              k.warehouseLocationName = v.warehouseLocationName;
              return k
            })
            valid = true
          }
          return {
            receiptBatch: list,
            receiptNo: i.receiptNo
          }
        })
        if (v.warehouseLocationIdHandleSku) {
          let handleSkuWarehouseBlockId = '';
          let handleWarehouseLocationName = '';
          v.$store.state.positionList.forEach(i => {
            if (i.warehouseLocationId === v.warehouseLocationIdHandleSku) {
              handleSkuWarehouseBlockId = i.warehouseBlockId;
              handleWarehouseLocationName = i.warehouseLocationName;
            }
          });
          v.dataHandleSku.forEach(i => {
            params.receiptList.forEach(j => {
              j.data1.forEach(k => {
                if (k.goodsSku === i.goodsSku) {
                  k.warehouseLocationId = v.warehouseLocationIdHandleSku;
                  k.warehouseBlockId = handleSkuWarehouseBlockId;
                  k.warehouseLocationName = handleWarehouseLocationName;
                }
              })
              j.data2.forEach(k => {
                if (k.goodsSku === i.goodsSku && k.receiptNo === i.receiptNo) {
                  k.warehouseLocationId = v.warehouseLocationIdHandleSku;
                  k.warehouseBlockId = handleSkuWarehouseBlockId;
                  k.warehouseLocationName = handleWarehouseLocationName;
                }
              })
            })
          })
        }
        if (!valid) {
          v.$Message.error({
            duration: 5,
            content: '收货数量为空'
          });
          v.$Spin.hide();
          return;
        }
        if (isOutOfStockHandel) {
          let handleData = [];
          v.receiptData.forEach((i, index) => {
            i.data1.forEach((j, jIndex) => {
              if (j.outOfStockNumber && j.currentbatchNumber > 0) {
                handleData.push(j)
              }
            })
            i.data2.forEach((j, jIndex) => {
              if (j.outOfStockNumber && j.currentbatchNumber > 0) {
                handleData.push(j)
              }
            })
          });
          if (handleData.length) {
            v.handleSkuData = handleData;
            v.$refs.handleSkuRef.open();
            return
          }
        }

        if (v.printSKUBarcodeAfterReceiving === 'Y' && isPrint) {
          // 是否收货完打印  这里会回调到 printsuccess 收货
          v.$refs.printSkuCode.printBtnText = '收货并打印';
          v.$refs.printSkuCode.isCloseModal = true;
          v.print(v.receiptData.map(i => i.receiptNo).join(','), v.detail);
        } else {
          if (v.isOvercharge === 'N') {
            let isOverchargeValid = false;
            params.receiptList.forEach(i => {
              i.data2.forEach(j => {
                if (j.currentbatchNumber > j.nobatchNumber) {
                  isOverchargeValid = true
                }
              })
            })
            if (isOverchargeValid) {
              v.$Message.error('不允许超量收货！');
              v.$Spin.hide();
              return;
            }
          }
          // currentbatchNumber
          params.isOvercharge = v.isOvercharge
            ? v.isOvercharge
            : 'N';
          let data = [];
          params.receiptList.forEach(i => {
            let obj = {
              receiptBatch: []
            };
            if (i.data1) {
              i.data1.forEach(j => {
                if (j.currentbatchNumber > 0) {
                  obj.receiptBatch.push(j)
                }
              });
            }
            i.data2.forEach(j => {
              if (j.currentbatchNumber > 0) {
                obj.receiptBatch.push(j)
              }
            });
            if (obj.receiptBatch.length) {
              obj.receiptNo = i.receiptNo;
              data.push(obj)
            }
          })
          params.receiptList = data;
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
    async scanning() {
      let v = this;
      // scanningMethod 扫描模式 1 逐件扫描 2  批量扫描
      let sku = this.scanSku;
      // 解决转库扫描问
      if (this.isTransWarehouse) {
        sku = await this.getLapaSku(sku);
      }
      if (!this.$common.isEmpty(sku)) {
        sku = sku.toLowerCase();
      }
      const list = this.$common.flat((this.receiptData || []).map(m => {
        return [(m.data2 || []), (m.data1 || [])];
      }));
      const hasSkuA = list.find(lk => {
        if (!this.$common.isEmpty(lk.barCode) && lk.barCode.toLowerCase() == sku) return true;
        if (!this.$common.isEmpty(lk.goodsSku) && lk.goodsSku.toLowerCase() == sku) return true;
        return false;
      });
      // 找的到sku
      if (!this.$common.isEmpty(hasSkuA)) {
        // 找出存在相同SKU/条码编码的数据
        let list = [];
        this.receiptData.forEach((i, index) => {
          i.data2.forEach((j, jIndex) => {
            const skuCode = [(j.barCode || '').toLowerCase(), (j.goodsSku || '').toLowerCase()].filter(f => !this.$common.isEmpty(f));
            if (skuCode.includes(sku)) list.push(Object.assign({}, j, { index, jIndex }));
          })
        });
        //  筛选出未收货数量最少且大于本次收货数量
        let receiptIsAdd = {};
        let sortList = list.sort((a, b) => a.nobatchNumber - b.nobatchNumber);
        let filterList = sortList.filter(k => k.nobatchNumber > k.currentbatchNumber);
        // 不满足条件，则取最少数量的
        if (!filterList.length) {
          receiptIsAdd = sortList[0];
        } else {
          receiptIsAdd = filterList[0];
        }
        // console.log(receiptIsAdd, 'receiptIsAdd');
        v.receiptData.forEach((i, index) => {
          i.data2.forEach((j, jIndex) => {
            const skuCode = [(j.barCode || '').toLowerCase(), (j.goodsSku || '').toLowerCase()].filter(f => !this.$common.isEmpty(f));
            if (skuCode.includes(sku) && index === receiptIsAdd.index && jIndex === receiptIsAdd.jIndex) {
              v.activeRow = j;
              v.activeRow.receiptIsAdd = receiptIsAdd;
              let nub = j.currentbatchNumber || 0;
              if (v.scanningMethod === '1') {
                nub += 1;
                v.$set(j, 'currentbatchNumber', nub);
              } else {
                v.$set(j, 'currentbatchNumber', j.nobatchNumber);
              }
            }
          });

          i.data1.forEach(i => {
            if (i.goodsSku.toLowerCase() === sku) {
              let nub = i.currentbatchNumber || 0;
              nub += 1;
              v.$set(i, 'currentbatchNumber', nub);
            }
          })
        })
        this.changeCurrent();
      } else {
        // 找不到sku hasSku：无源入库1/忽略2
        if (v.hasSku === '1') {
          // 无源入库
          v.getProductDetail(sku).then(data => {
            v.receiptData[0].data1.push(data);
            v.changeCurrent();
            v.activeRow = data;
            v.total1 += 1;
          });
        }
      }
      v.scanSku = '';
    },
    getProductDetail(sku) {
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
    rowClassName(row) {
      let { goodsSku, receiptNo } = this.activeRow || {};
      if (goodsSku === row.goodsSku && (!row.receiptNo || receiptNo === row.receiptNo)) {
        return 'demo-table-info-row';
      }
      return '';
    },
    search(model, receiptSuccess) {
      var v = this;
      if (model) {
        v.receiptNoOrReferenceNo = model;
      }
      v.$Spin.show();
      if (v.receiptNoOrReferenceNo === '') return;
      return new Promise(resolve => {
        v.TableLoading = true;
        v.warehouseLocationIdHandleSku = '';
        v.dataHandleSku = [];
        v.receivingStatus = [];
        v.receiptData = [
          {
            detail: {
              receiptNo: '', // 入库单编号
              referenceNo: '', // 参考编号
              warehouseName: '', // 仓库
              receiptType: '', // 入库单类型
              receiptStatus: '', // 入库单状态
              purchaserName: '' // 采购员
            },
            data2: [],
            data1: []
          }
        ]
        v.axios.post(api.post_wmsReceipt_detailAll, {
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
              v.$Spin.hide();
              return;
            }
            let detailList = res.data.datas.detailList.filter(i => i.receipt.receiptStatus !== '2' || receiptSuccess);
            if (detailList === null || (detailList && detailList.length === 0)) {
              v.$Message.error({
                duration: 5,
                content: '入库单已关闭'
              });
              v.$Spin.hide();
              return;
            }
            v.currentBatchNumberAll = 0; // 初始化本次收货数量
            if (!receiptSuccess && detailList.every(i => i.receipt.receiptStatus === '2')) {
              let arr = detailList.map(i => i.receipt.receiptNo);
              v.$Message.error({
                duration: 5,
                content: '入库单' + '(' + arr.join(',') + ')' + '已关闭，无法收货'
              });
              v.$Spin.hide();
              return
            }
            v.receivingStatus = [];
            v.$nextTick(() => {
              detailList.forEach((i, index) => {
                if (i.receipt.receiptStatus !== '2' || receiptSuccess) {
                  v.receivingStatus.push([])
                  if (v.receiptData[index]) {
                    for (let key in i.receipt) {
                      v.receiptData[index][key] = i.receipt[key];
                    }
                  } else {
                    v.receiptData.push(Object.assign({}, i.receipt));
                  }
                }
              })
              let list = v.$store.state.userInfoList;
              if (list) {
                detailList.forEach(i => {
                  if (i.receipt.purchaserId) {
                    i.purchaserName = list[i.receipt.purchaserId].userName;
                  }
                })
              }
              detailList.forEach((i, index) => {
                if (i.receipt.receiptStatus !== '2' || receiptSuccess) {
                  if (v.receiptData[index]) {
                    v.$set(v.receiptData[index], 'data2', i.receiptDetailPPage.list ? i.receiptDetailPPage.list.map(d => {
                      d.__index = index;
                      d.receiptNo = i.receipt.receiptNo;
                      d.currentbatchNumber = 0;
                      // d.platformSubject = i.receipt.platformSubject;
                      return d;
                    }) : []
                    )
                    v.$set(v.receiptData[index], 'data3', i.receiptDetailPPage.list ? i.receiptDetailPPage.list.map(d => {
                      d.__index = index;
                      d.receiptNo = i.receipt.receiptNo;
                      d.currentbatchNumber = 0;
                      return d;
                    }) : []
                    )
                    v.$set(v.receiptData[index], 'data1', i.receiptDetailUPage.list ? i.receiptDetailUPage.list.map(i => {
                      i.__index = index;
                      i.currentbatchNumber = 0;
                      return i;
                    }) : []
                    )
                  }
                }
              })
              // 是否需要质检
              this.qualitySetting(detailList);

              v.rawData = v.data2;
              v.showDetail = true;
              v.$Spin.hide();
              v.$nextTick(() => {
                v.$refs.scanSkuRef.focus();
              })
              resolve();
            });
          }
        });
      });
    },
    // 快递单号存在一对多入库单情况，所以要循环判断，只要当中一个入库单要质检，则更改为全部质检
    qualitySetting(list) {
      let temp = { haveCheck: null, checkType: null };
      list.forEach(item => {
        let haveCheck = item.receipt && item.receipt.haveCheck;
        let checkType = item.wmsReceiptCheckBase && item.wmsReceiptCheckBase.checkType;
        temp.haveCheck != 1 && (temp.haveCheck = haveCheck);
        ['1', '2', 1, 2].includes(checkType) && (temp.checkType = checkType);
      })
      // console.log(temp);
      this.qualityTest = temp;
      // 存在质检信息默认值更改,抽检或全检需要更改为质检
      this.formInline.resultFlag = ['1', '2', 1, 2].includes(temp.checkType) ? 'Q' : 'S';
    },
    // sku的收货状态
    changeStatus(value, index) {
      if (value.length > 0) {
        let data = [];
        let talgData = this.receiptData[index].data3;
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
        this.receiptData[index].data2 = data;
      } else {
        this.receiptData[index].data2 = this.receiptData[index].data3;
      }
    }
  },
  computed: {
    expectedNumberAll() {
      // 总预期数量
      let number = 0;
      this.receiptData.forEach(d => {
        number += d.data2.reduce((i, j) => {
          i = i + j.expectedNumber;
          return i;
        }, 0);
      })
      return number
    },
    doneNumberAll() {
      // 总已收货数量
      let number1 = 0;
      let number2 = 0;
      this.receiptData.forEach(d => {
        number2 += d.data2.reduce((i, j) => {
          i = i + j.doneNumber;
          return i;
        }, 0);
        if (d.data1 && d.data1.length) {
          number1 += d.data1.reduce((i, j) => {
            i = i + j.doneNumber;
            return i;
          }, 0);
        }
      })
      return number1 + number2;
    },
    noBatchNumberAll() {
      // 总未收货数量
      let number2 = 0;
      this.receiptData.forEach(d => {
        number2 += d.data2.reduce((i, j) => {
          i = i + j.nobatchNumber;
          return i;
        }, 0);
      })
      return number2;
    },
    activeData() {
      return this.$store.state.activeDate;
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
.ivu-table .demo-table-info-row td {
  background-color: #2db7f5;
  color: #fff;
}
</style>
<style lang="less" scoped>
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

.receipt-top-label {
  width: 100px;
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

  img {
    max-width: 100%;
  }

  .text {
    font-size: 24px;
    color: red;
  }
}

.right-box {
  padding-left: 10px;
}

.search-box {
  display: flex;
  align-items: center;

  /deep/.search-box_input {
    width: 400px;
    margin-right: 10px;

    .ivu-input {
      font-size: 14px;
    }
  }

  .search-label {
    font-size: 18px;
    margin-left: 50px;
  }

  .search-tips {
    margin-left: 40px;

    span {
      color: red;
      font-size: 18px;
    }
  }
}

.card-r-tit {
  margin-top: -3px;
  overflow: initial;
  width: 400px;
}

.receiptBlock {
  display: flex;

  .receiptBlock_left {
    width: 360px;
  }

  .receiptBlock_right {
    flex: 1;
    overflow: hidden;
  }

  .leftSetting {
    padding-bottom: 54px;
  }
}
</style >
