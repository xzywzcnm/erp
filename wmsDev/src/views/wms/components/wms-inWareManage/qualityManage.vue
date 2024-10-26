<template>
  <div class="qualityManage">

    <div class="tabs-p10">
      <Tabs v-model="tabsName">
        <TabPane label="扫描" name="detail"></TabPane>
        <TabPane label="浏览搜索" name="list"></TabPane>
      </Tabs>
    </div>

    <div v-show="tabsName === 'list'" class="qualityManage_list">
      <!--浏览搜索-->
      <div v-show="$store.state.groupWorkShow === 'list'" class="listPage">
        <div class="searchMain">
          <!--库区状态按钮组-->
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <dyt-filter ref="dyt-filter" @expand="expand">
              <Form-item label="质检状态:">
                <dyt-select v-model="pageParams.qualityStatusFlag">
                  <Option v-for="d in qualityStatusFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="条件:">
                <div class="flexAlignCenter">
                  <dyt-select :clearable="false" v-model="pageParams.groupName" @on-change="changeGroupName"
                    style="width: 90px;margin-right: 5px;overflow: hidden;">
                    <Option v-for="d in groupList" :value="d.value" :key="d.value" :label="d.label"></Option>
                  </dyt-select>
                  <Input v-model.trim="pageParams.searchInWareNumber" :placeholder="
              pageParams.groupName === 'receiptNo'
                ? '输入入库单编号'
                : pageParams.groupName === 'receiptBatchNo'
                  ? '输入批次号' : ''" style="flex:1;"> </Input>
                </div>
              </Form-item>
              <Form-item label="质检员:" prop="qualityNum">
                <dyt-select v-model="pageParams.qualityNum" placeholder="选择质检人">
                  <!-- <Option value="*">全部质检人</Option> -->
                  <Option v-for="item in qualityPersonList" :value="item.checkCreatedBy"
                    :label="item.checkCreatedByName" :key="item.checkCreatedBy">
                  </Option>
                </dyt-select>
              </Form-item>
              <FormItem label="供应商:">
                <dyt-select v-model="pageParams.supplierName">
                  <Option v-for=" item in supplierList" :value="item.supplierName" :key="item.supplierId"
                    :label="item.supplierName"></Option>
                </dyt-select>
              </FormItem>
              <FormItem label="采购员:">
                <dyt-select v-model="pageParams.purchaserId">
                  <Option v-for="(item, index) in purchaserList" :value="item.id" :label="item.name" :key="index">
                  </Option>
                </dyt-select>
              </FormItem>
              <Form-item label="质检时间:" prop="qualityTime" v-if="!['0', '1'].includes(pageParams.qualityStatusFlag)">
                <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                  v-model="pageParams.qualityTime"></DatePicker>
              </Form-item>

              <div slot="operation">
                <Button type="primary" @click="checkSearch" :disabled="SearchDisabled" icon="ios-search" class="mr10">
                  查询
                </Button>
                <Button @click="reset" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
        <!--按质检状态 或 按创建时间排序-->
        <div class="funMain">
          <div class="funMain__flex">
            <div>
              <span>排序方式：</span>
              <Button-group>
                <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" :disabled="SearchDisabled"
                  @click="clickSortButton(item)" :key="item.value">{{ item.label }}
                  <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
                  <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
                </Button>
              </Button-group>
            </div>
            <div>
              <Dropdown @on-click="batchQc">
                <Button :loading="exportLoading">批量操作
                  <Icon style="margin-left: 5px" type="md-arrow-dropdown"></Icon>
                </Button>

                <DropdownMenu slot="list">
                  <DropdownItem name="0" v-if="getPermission('wmsReceiptBatchCheck_batchSubmit')">提交质检结果-选中
                  </DropdownItem>
                  <DropdownItem name="1" v-if="getPermission('wmsReceiptBatchCheck_detail')">导出选中项质检信息
                  </DropdownItem>
                  <DropdownItem name="2">所有结果集质检信息
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        <!-- 批量操作 -->
        <div class="tableMain">
          <div class="tableBox">
            <!--表格-->
            <Table highlight-row border :loading="TableLoading" @on-selection-change="checkedDataHandel"
              :columns="columns7" :data="data6" ref="selection" :height="tableHeight"></Table>
          </div>
        </div>
        <!--分页按钮-->
        <div class="pagesMain">
          <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
            :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
      <!-- 提交质检结果模态框 -->
      <Modal v-model="qualityModal" :styles="{ top: '80px', width: '1200px' }" class="headerBar"
        :title="submitQualityTitle" @on-cancel="cancelButton">
        <div class="content">
          <submitQuality :curObj="curObj" :tabsName="tabsName" :type="type" ref="submitQualityFlag1"
            @validateFail="validateFail" @createFail="createFail" @createSuccess="createSuccess"></submitQuality>
        </div>
        <div slot="footer">
          <!--<Button type="primary" @click="submitQuality" :loading='uploadLoading' :disabled='curObj.checkStatus === "2"'>提交质检结果</Button>-->
          <Button @click="cancelButton">取消</Button>
        </div>
      </Modal>
      <!-- 入库单详情组件 -->
      <inWareDetails v-if="$store.state.groupWorkShow === 'watch'" :inWareOrderId="inWareOrderId"
        :inWareOrderNo="inWareOrderNo" @backPage="backPage" :batchNo="batchNo">
      </inWareDetails>
    </div>

    <div v-show="tabsName === 'detail'" class="detail-box">
      <!--扫描    :class="{'tran-center':!showDetail}"-->
      <div v-show="!showDetail" style="margin-top: 50px">
        <scan @enter="scanning" ref="scan"></scan>
      </div>
      <div v-show="showDetail">
        <Card dis-hover>
          <Row class="search-box" type="flex" justify="center" align="middle">
            <Col span="6" class="search-label">扫描SKU：
            </Col>
            <Col span="15"><Input class="search-ipt" v-model.trim="scanSku" ref="scanSku" autofocus
              @on-enter="scanning(scanSku)" placeholder="请扫描SKU"></Input></Col>
            <Col span="3">
            <Button class="search-btn" type="primary" icon="ios-search" @click="scanning(scanSku)">查询 </Button>
            </Col>
          </Row>
        </Card>
        <submitQuality :tabsName="tabsName" :curObj="curObj" :type="type" :open="tabsName === 'detail'"
          ref="submitQualityFlag" @validateFail="validateFail" @createFail="createFail" @createSuccess="createSuccess">
        </submitQuality>
      </div>
    </div>
    <Modal v-model="model2" width="1000" title="系统匹配到多条待质检记录">
      <Table highlight-row border :columns="columns3" :loading="TableLoading" :data="data3" max-height="400"
        ref="selectionSystem"></Table>
    </Modal>
    <Modal v-model="model3" width="1000" title="批量质检">
      <Table highlight-row border max-height="650" :columns="columns8" :data="data8"></Table>
      <div slot="footer">
        <Button type="primary" @click="submitBatch">提交结果 </Button>
        <Button @click="model3 = false">关闭</Button>
      </div>
    </Modal>
    <printSkuCode :printSkuObj="printDate" :printType="printType" :qualityCheckProcurementId="qualityCheckProcurementId"
      @printsuccess="printsuccess" :tipsDataLength="data2" :barCodeShow="barCodeShow" :printSource="'qualityManage'">
    </printSkuCode>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import submitQuality from './submitQuality';
import inWareDetails from './inWareDetails';
import scan from '../common/scan';
import printSkuCode from '../common/printSkuCode';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [Mixin, tableHeight_mixin],
  components: {
    inWareDetails: inWareDetails, // 入库单详情组件
    submitQuality: submitQuality, // 提交质检结果组件
    scan,
    printSkuCode
  },
  data() {
    var self = this;
    var v = this;
    return {
      printDate: [],
      printType: 'single', // 打印参数
      qualityCheckProcurementId: '', // 打印参数
      data2: [], // 打印参数
      barCodeShow: '', // 打印参数
      checkedDate: [],
      columns8: [
        {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 150,
          resizable: true,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU/产品名称',
          align: 'center',
          render(h, params) {
            return h('div', {}, [h('p', params.row.goodsSku), h('p', params.row.goodsCnDesc)]);
          }
        }, {
          title: '入库单号',
          align: 'center',
          key: 'receiptNo'
        }, {
          title: '送检数量',
          align: 'center',
          key: 'expectedCheckNumber'
        }, {
          title: '已检数量',
          align: 'center',
          render(h, params) {
            let nub = params.row.expectedCheckNumber - params.row.waitCheckNumber;
            return h('div', nub);
          }
        }, {
          title: '待检数量',
          align: 'center',
          key: 'waitCheckNumber'
        }, {
          title: '良品数量',
          align: 'center',
          key: 'passCheckNumber',
          render(h, params) {
            return h('InputNumber', {
              style: {
                width: '70px'
              },
              props: {
                size: 'small',
                value: params.row.passCheckNumber ? params.row.passCheckNumber : 0,
                min: 0
              },
              on: {
                'on-change': val => {
                  let obj = JSON.parse(JSON.stringify(v.data8[params.index]));
                  obj.passCheckNumber = val;
                  v.$set(v.data8, [params.index], obj);
                }
              }
            });
          }
        }, {
          title: '不良品数量',
          align: 'center',
          key: 'problemCheckNumber',
          render(h, params) {
            return h('InputNumber', {
              style: {
                width: '70px'
              },
              props: {
                size: 'small',
                value: params.row.problemCheckNumber ? params.row.problemCheckNumber : 0,
                min: 0
              },
              on: {
                input: val => {
                  let obj = JSON.parse(JSON.stringify(params.row));
                  obj.problemCheckNumber = val;
                  v.$set(v.data8, [params.index], obj);
                }
              }
            });
          }
        }
      ],
      data8: [],
      model3: false,
      scanSku: '',
      columns3: [
        {
          title: 'No',
          key: 'index',
          align: 'center',
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '入库单编号',
          key: 'receiptNo',
          minWidth: 165,
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          minWidth: 160
        }, {
          title: '质检状态',
          key: 'checkStatus',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkStatus === '0' ? h('div', {}, '待质检') : params.row.checkStatus === '1'
              ? h('div', {}, '部分质检')
              : h('div', {}, '质检完成');
          }
        }, {
          title: '送检数量' + '/' + '待质检数量',
          align: 'center',
          minWidth: 80,
          render(h, params) {
            return h('span', {}, params.row.expectedCheckNumber + '/' + params.row.waitCheckNumber);
          }
        }, {
          title: '操作',
          align: 'center',
          render(h, params) {
            return h('Button', {
              props: {
                size: 'small'
              },
              on: {
                click() {
                  v.tabsName = 'detail';
                  v.templateName = 'submitQuality';
                  v.curObj = params.row; // 获取当前表格行的数据
                  v.showDetail = true;
                  v.model2 = false;
                  v.$refs.submitQualityFlag.getQualityDetailData(v.curObj);
                  v.$refs.submitQualityFlag.getColorSize(v.curObj);
                  v.$refs.submitQualityFlag.getImgList(v.curObj);
                  v.$refs.submitQualityFlag.getProductQuality(v.curObj);
                }
              }
            }, '选择');
          }
        }
      ],
      data3: [],
      model2: false,
      tabsName: 'detail',
      type: 'look',
      showDetail: false,
      formInline: {
        search: ''
      },
      qualityDataList: {}, // 质检记录表格数据
      uploadList: [], // 质检图片
      uploadLoading: false,
      templateName: '',
      curObj: {},
      cacheClickVal: 'WS', // 排序缓存值
      inWareOrderId: '', // 入库单id标记
      inWareOrderNo: '', // 入库单编号
      batchNo: '', // 批次号
      wareId: this.getWarehouseId(), // 质检状态选择
      qualityStatusFlagList: [
        // {
        //   label: '全部',
        //   value: '*'
        //   //   checked: false
        // },
        {
          label: '待质检',
          value: '0'
          //   checked: true
        }, {
          label: '部分质检',
          value: '1'
          //   checked: false
        }, {
          label: '质检完成',
          value: '2'
          //   checked: false
        }
      ], // 选择仓库下拉列表
      wareHouseTypeList: [], // 选择质检人
      qualityPersonList: [], // 选择入库单号和批次号
      groupList: [
        {
          label: '入库单号',
          value: 'receiptNo'
        }, {
          label: '批次号',
          value: 'receiptBatchNo'
        }, {
          label: 'SKU号',
          value: 'sku'
        }
      ], // 排序的数据
      sortData: [
        {
          label: '按质检状态',
          value: 'CT',
          checked: false,
          toogle: true
        }, {
          label: '按创建时间',
          value: 'WS',
          checked: true,
          toogle: true
        }
      ],
      pageParams: {
        qualityStatusFlag: '0', // 质检状态
        groupName: 'receiptNo', // 选择入库单号和批次号
        searchInWareNumber: '', // 输入入库单号和批次号
        qualityNum: '', // 选择质检人
        DESC: 'DESC', // 默认是降序
        CT: 'WS', // 排序的标记，质检状态
        supplierName: null, // 供应商
        purchaserId: null, // 采购员id
        pageNum: 1,
        pageSize: 10,
        qualityTime: []// 质检时间
      },
      supplierList: [], // 供应商列表
      purchaserList: [], // 采购员列表
      submitQualityTitle: '质检详情',
      qualityModal: false, // 提交质检结果模态框
      totalRecords: 0, // 总条数
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '入库单编号',
          key: 'receiptNo',
          minWidth: 165,
          align: 'center',
          render: function (h, params) {
            if (v.getPermission('wmsReceiptBatchCheck_detail')) {
              return h('a', {
                style: {
                  display: 'inline-block',
                  width: '100%',
                  height: '100%'
                },
                on: {
                  click: function () {
                    this.$store.commit('activeRow', params.row);
                    this.$store.commit('groupWorkShow', 'watch');
                    this.inWareOrderId = params.row.receiptNo; // 当前行的入库单id
                    this.inWareOrderNo = params.row.receiptNo; // 当前行的入库单编号
                    this.batchNo = params.row.checkStatus;
                  }.bind(this)
                }
              }, params.row.receiptNo);
            } else {
              return h('div', params.row.receiptNo);
            }
          }.bind(this)
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          minWidth: 160
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', {
              style: {
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }
            }, [
              h('span', params.row.goodsSku), params.row.transitStatus === 1 ? h('Icon', {
                props: {
                  type: 'ios-shuffle'
                },
                style: {
                  marginLeft: '4px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#2D8CF0'
                }
              }) : ''
            ]);
          }
        }, {
          title: '质检状态',
          key: 'checkStatus',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkStatus === '0' ? h('div', {}, '待质检') : params.row.checkStatus === '1'
              ? h('div', {}, '部分质检')
              : h('div', {}, '质检完成');
          }
        }, {
          title: '送检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '已质检合格数',
          key: 'passCheckNumber',
          align: 'center',
          minWidth: 100
        }, {
          title: '已质检问题数',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 100
        }, {
          title: '待质检数量',
          key: 'waitCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '质检人',
          key: 'checkCreatedByName',
          align: 'center',
          minWidth: 80
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 150
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          minWidth: 160,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    icon: 'ios-eye',
                    disabled: !this.getPermission('wmsReceiptBatchCheck_detail')
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.checkStatus === '0' ? 'none' : params.row.checkStatus === '1'
                      ? 'none'
                      : 'inline'
                  },
                  on: {
                    click: () => {
                      self.$nextTick(() => {
                        self.type = 'look';
                        self.qualityModal = true;
                        self.curObj = params.row; // 获取当前表格行的数据
                        self.$refs.submitQualityFlag1.getQualityDetailData(self.curObj);
                        self.$refs.submitQualityFlag1.getColorSize(self.curObj);
                        self.$refs.submitQualityFlag1.getImgList(self.curObj);
                        self.$refs.submitQualityFlag1.getProductQuality(self.curObj);
                        self.templateName = 'submitQuality';
                        self.$store.commit('activeRow', params.row);
                        // self.tabsName = 'detail';
                        // self.showDetail = true;
                      });
                    }
                  }
                }, '查看'), h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    icon: 'ios-cloud-upload-outline',
                    disabled: !this.getPermission('wmsReceiptBatchCheck_submit')
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.checkStatus === '2' ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      self.$nextTick(() => {
                        self.type = 'qc';
                        self.tabsName = 'detail';
                        self.templateName = 'submitQuality';
                        self.curObj = params.row; // 获取当前表格行的数据
                        self.showDetail = true;
                        self.$refs.submitQualityFlag.getQualityDetailData(self.curObj);
                        self.$refs.submitQualityFlag.getColorSize(self.curObj);
                        self.$refs.submitQualityFlag.getImgList(self.curObj);
                        self.$refs.submitQualityFlag.getProductQuality(self.curObj);
                        setTimeout(() => {
                          v.$refs.scanSku.focus();
                        }, 0);
                        /* self.templateName = 'submitQuality';
                         self.curObj = params.row; // 获取当前表格行的数据
                         self.getQualityDetailData(params.row).then(()=>{
                         self.tabsName = 'detail';
                         self.showDetail = true;
                         }); */
                      });
                    }
                  }
                }, '提交质检结果')
              ]);
            }
          }
        }
      ],
      data6: [],
      qcData: [], // 质检数据
      exportLoading: false
    };
  },
  created() {
    this.searchData();
    this.getQualityName();
    this.getSupplierList()
    this.getPurchaserList()
  },
  methods: {
    // 返回列表
    backPage(value) {
      this.$store.commit('groupWorkShow', value);
    },
    printsuccess() {
    },
    print(receiptNo, row) {
      this.getPrintDate(receiptNo, row).then(() => {
        this.$store.commit('printSkuModal', true);
      });
    },
    getPrintDate(id, row, referenceNo) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryAllByReceiptNo, { receiptNoList: [id] }).then(res => {
          if (res.data.code === 0) {
            // 添加参考编号
            res.data.datas.forEach(item => {
              if (row.referenceNo2) {
                item.referenceNo = row.referenceNo + '/' + v.sepCommasFn(row.referenceNo2).join('/');
              } else {
                item.referenceNo = row.referenceNo;
                if (referenceNo) {
                  item.referenceNo = referenceNo;
                }
              }
            });
            v.barCodeShow = res.data.datas[0].barcode;
            v.printDate = res.data.datas;
            resolve(res.data);
          }
        }).catch(() => {
        });
      });
    },
    checkedDataHandel(data) {
      this.checkedDate = data;
    },
    submitBatch() {
      let params = this.data8.filter(i => {
        return i.passCheckNumber > 0 || i.problemCheckNumber > 0;
      });
      let v = this;
      if (params.length === 0) return;
      let arr = [];
      params.forEach(item => {
        if (Number(item.passCheckNumber) + Number(item.problemCheckNumber) > Number(item.waitCheckNumber)) {
          arr.push(item);
        }
      });
      if (arr.length > 0) {
        let str = arr.reduce((i, n) => {
          i.push(n.goodsCnDesc);
          return i;
        }, []);
        v.$Message.error({
          duration: 5,
          content: str.join('/') + '（' + '良品数量和不良品数量大于待质检数量' + '）'
        });
        return;
      }
      this.axios.post(api.batchSubmit, params).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('提交成功');
          v.searchData();
          v.model3 = false;
        }
      }).catch(() => {
      });
    },
    batchQc(name) {
      let v = this;
      if (name === '0') {
        v.data8 = v.checkedDate.filter(i => {
          return i.checkStatus === '0' || i.checkStatus === '1';
        });
        if (v.data8.length === 0) {
          v.$Message.error({
            duration: 5,
            content: '未选择可质检数据'
          });
          return;
        }
        v.data8.forEach(i => {
          i.passCheckNumber = i.waitCheckNumber;
          i.problemCheckNumber = 0;
        });
        v.model3 = true;
      }
      if (name === '1') this.qualityTest();
      if (name === '2') this.allResultsExport();
    },
    getQualityDetailData(obj) {
      // 查看提交质检结果前的数据
      var v = this;
      var obj2 = {
        merchantId: obj.merchantId,
        receiptBatchCheckNo: obj.receiptBatchCheckNo,
        receiptNo: obj.receiptNo,
        receiptBatchNo: obj.receiptBatchNo,
        warehouseLocationId: obj.warehouseLocationId,
        productGoodsId: obj.goodsSku
      };
      return new Promise(resolve => {
        v.axios.post(api.submitQualityData, obj2).then(res => {
          if (res.data.code === 0) {
            v.qualityDataList = res.data.datas;
            let arr = [];
            res.data.datas.receiptBatchCheckDetailList.forEach(val => {
              if (val.checkAttachment) {
                if (val.checkAttachment.indexOf(',') > -1) {
                  arr = [...arr, ...val.checkAttachment.split(',')];
                } else {
                  arr.push(val.checkAttachment);
                }
              }
            });
            this.uploadList = arr.map(val => {
              return {
                percentage: 100,
                showProgress: true,
                status: 'finished',
                response: {
                  datas: val
                }
              };
            });
            this.copyApiImg = [...this.uploadList];
            let data = res.data.datas.receiptBatchCheckDetailList;
            for (let i = 0; i < data.length; i++) {
              data[i].expectedCheckNumber = Number(data[i].passCheckNumber) + Number(data[i].problemCheckNumber);
              data[i].createdTime = this.$uDate.dealTime(data[i].createdTime);
            }
            this.qcData = data;
            resolve();
          }
        });
      });
    },
    // 所有结果集质检信息
    allResultsExport() {
      this.pageParams.pageSize = this.getPageSizeCache();
      let pageParams = this.pageParams;
      let paramsObj = {
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize,
        orderSeq: pageParams.DESC, // 降序
        orderBy: pageParams.CT, // 排序字段，质检状态
        supplierName: pageParams.supplierName, // 供应商
        purchaserId: pageParams.purchaserId, // 采购员id
        warehouseId: this.wareId,
        startTime: pageParams.qualityTime[0]
          ? this.$uDate.getDateTime(pageParams.qualityTime[0], 'fulltime')
          : null, // 开始时间
        endTime: pageParams.qualityTime[1]
          ? this.$uDate.getDateTime(pageParams.qualityTime[1], 'fulltime')
          : null // 结束时间
      };
      if (pageParams.qualityStatusFlag) {
        paramsObj.checkStatusList = [pageParams.qualityStatusFlag];
      } // 质检状态选择
      if (pageParams.groupName === 'receiptNo') {
        paramsObj.receiptNo = pageParams.searchInWareNumber;
      } else if (pageParams.groupName === 'receiptBatchNo') {
        paramsObj.receiptBatchNo = pageParams.searchInWareNumber;
      } else if (pageParams.groupName === 'sku') {
        paramsObj.sku = pageParams.searchInWareNumber;
      }
      // if (pageParams.qualityNum !== '*') {
      paramsObj.checkCreatedBy = pageParams.qualityNum;

      let url = api.exportProductQualityInfo + '?warehouseId=' + this.wareId;
      this.exportLoading = true;
      this.axios.post(url, paramsObj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.$refs.selection.selectAll(false);
        }
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    search() {
      this.spinShow = true;
      setTimeout(() => {
        this.spinShow = false;
      }, 3000);
      this.showDetail = true;
    },
    changeGroupName: function (value) {
      // 入库单号和批次号的输入切换
      this.pageParams.groupName = value;
    },
    scanning(sku) {
      let v = this;
      let params = {
        pageNum: 1,
        pageSize: 1000,
        orderSeq: 'DESC', // 降序
        orderBy: 'WS', // 排序字段，质检状态
        warehouseId: this.wareId,
        checkStatusList: ['0', '1'], // 带质检和部分质检
        sku: sku
      };
      v.$Spin.show();
      v.TableLoading = true;
      v.axios.post(api.qualitySearchData, params).then(res => {
        v.$Spin.hide();
        v.TableLoading = false;
        if (res.data.code === 0) {
          if (res.data.datas == null || res.data.datas.list.length === 0) {
            v.$Message.error({
              duration: 5,
              content: '暂无数据'
            });
            return;
          }
          if (res.data.datas.list.length === 1) {
            v.curObj = res.data.datas.list[0];
            v.tabsName = 'detail';
            v.templateName = 'submitQuality';
            v.showDetail = true;
            v.$refs.submitQualityFlag.getQualityDetailData(v.curObj);
            v.$refs.submitQualityFlag.getColorSize(v.curObj);
            v.$refs.submitQualityFlag.getImgList(v.curObj);
            v.$refs.submitQualityFlag.getProductQuality(v.curObj);
          } else {
            v.data3 = res.data.datas.list;
            v.model2 = true;
          }
          // this.data6 = v.processTimeData(res.data.datas.list, 'createdTime');
          // this.totalRecords = res.data.datas.total;
        }
      }).catch(() => {
        v.$Spin.hide();
      });
    },
    // 点击查询数据
    searchData() {
      this.pageParams.pageSize = this.getPageSizeCache();
      let pageParams = this.pageParams;
      if (this.getPermission('wmsReceiptBatchCheck_list')) {
        let paramsObj = {
          pageNum: pageParams.pageNum,
          pageSize: pageParams.pageSize,
          orderSeq: pageParams.DESC, // 降序
          orderBy: pageParams.CT, // 排序字段，质检状态
          supplierName: pageParams.supplierName, // 供应商
          purchaserId: pageParams.purchaserId, // 采购员id
          warehouseId: this.wareId,
          startTime: pageParams.qualityTime[0]
            ? this.$uDate.getDateTime(pageParams.qualityTime[0], 'fulltime')
            : null, // 开始时间
          endTime: pageParams.qualityTime[1]
            ? this.$uDate.getDateTime(pageParams.qualityTime[1], 'fulltime')
            : null // 结束时间
        };
        if (pageParams.qualityStatusFlag) {
          paramsObj.checkStatusList = [pageParams.qualityStatusFlag];
        } // 质检状态选择
        if (pageParams.groupName === 'receiptNo') {
          paramsObj.receiptNo = pageParams.searchInWareNumber;
        } else if (pageParams.groupName === 'receiptBatchNo') {
          paramsObj.receiptBatchNo = pageParams.searchInWareNumber;
        } else if (pageParams.groupName === 'sku') {
          paramsObj.sku = pageParams.searchInWareNumber;
        }
        // if (pageParams.qualityNum !== '*') {
        paramsObj.checkCreatedBy = pageParams.qualityNum;
        // } // 选择质检人
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.qualitySearchData, paramsObj).then(res => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = this.processTimeData(res.data.datas.list, 'createdTime');
            this.totalRecords = res.data.datas.total;
          }
        }).catch(() => {
          this.TableLoading = false;
          this.SearchDisabled = false;
        });
        // this.getWareHouseName(); // 调用仓库下拉列表
        // this.getQualityName(); // 调用质检人下拉列表
      } else {
        this.gotoError(); // 无权限
      }
    },
    checkSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.DESC = 'DESC';
      } else {
        this.pageParams.DESC = 'ASC';
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    changePage(page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.searchData();
    },
    submitQuality() {
      // 提交质检结果按钮
      this.uploadLoading = true;
      this.$refs.submitQualityFlag.handleSubmit();
    },
    createSuccess() {
      // 提交质检结果成功
      var v = this;
      v.$refs.submitQualityFlag.getQualityDetailData(v.curObj);
    },
    createFail() {
      // 提交质检结果失败
      this.qualityModal = true;
      this.uploadLoading = false;
    },
    validateFail() {
      this.uploadLoading = false;
    },
    cancelButton() {
      // 模态框取消按钮
      var v = this;
      v.qualityModal = false;
      // v.$refs.submitQualityFlag.resetFormFn(); // 取消之后，清空表单数据
      // v.$Message.info('取消提交质检结果');
    },
    // checkQualityStatus: function (value) {
    //   // 质检状态按钮状态切换
    //   this.qualityStatusFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.qualityStatusFlag = value;
    // },
    getWareHouseName() {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectCheckWareHouseName).then(res => {
        if (res.data.code === 0) {
          this.wareHouseTypeList = res.data.datas;
        }
      });
    },
    getQualityName() {
      // 获取质检人下拉列表
      var v = this;
      v.axios.post(api.get_qualityPersonName).then(res => {
        if (res.data.code === 0) {
          this.qualityPersonList = res.data.datas;
        }
      });
    }, // 重置按钮
    reset() {
      this.pageParams.searchInWareNumber = '';
      this.pageParams.groupName = 'receiptNo';
      this.pageParams.qualityStatusFlag = '0';
      //   this.checkQualityStatus('0');
      this.$refs['pageParams'].resetFields();
    },
    getSupplierList() {
      this.axios.get(api.quality_getSupplierList).then(res => {
        this.supplierList = res.data.datas
      })
    },
    getPurchaserList() {
      this.axios.get('/wms-service/erpCommon/setting-service/userInfo/getAllUser').then(res => {
        if (res.data.code === 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i !== 'service') {
              arr.push({
                id: i,
                name: datas[i].userName
              });
            }
          }
          this.purchaserList = arr;
        }
      })
    },
    // 导出质检信息
    qualityTest() {
      if (!this.checkedDate.length) {
        this.$Message.error({
          duration: 5,
          content: '请选择要导出的数据~'
        });
        return;
      }
      let arr = this.checkedDate.map(k => {
        return k.receiptBatchCheckNo
      })
      if (this.exportLoading) {
        this.$Message.warning('请稍后...')
        return;
      }
      let temp = { orderIdList: arr }
      console.log(arr, 'arr');
      let url = api.exportProductQualityInfo + '?warehouseId=' + this.wareId;
      this.exportLoading = true;
      this.axios.post(url, temp).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.$refs.selection.selectAll(false);
        }
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    // 更新表格高度
    refreshHeight() {
      this.$nextTick(() => {
        this.computedTableHeight();
        this.$refs['dyt-filter'].resizeHand();
      })
    }
  },
  watch: {
    tabsName: function (val) {
      let v = this;
      if (val === 'list') {
        v.searchData();
        v.$refs.submitQualityFlag.saveImgPath = [];
        v.$refs.submitQualityFlag.copyApiImg = [];
        v.$refs.submitQualityFlag.uploadList = [];
        v.refreshHeight();
      } else {
        v.$nextTick(() => {
          v.$refs.scan.$refs.scanIpt.focus();
        });
      }
    },
    dialogShow: {
      handler(nval, oval) {
        if (nval != 'list') return;
        this.refreshHeight();
      },
      deep: true
    }
  },
  computed: {
    dialogShow() {
      return this.$store.state.groupWorkShow;
    }
  }
};
</script>

<style lang="less" scoped>
.qualityManage {
  height: 100%;
  display: flex;
  flex-direction: column;

  .qualityManage_list {
    width: 100%;
    height: 100%;
  }

  .headerBar .ivu-modal-header p,
  .headerBar .ivu-modal-header-inner {
    color: #fff;
  }

  .detail-box {
    padding: 10px 10px 150px 10px;
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
}
</style>
