<template>
  <div class="shelvesManage">

    <div class="tabs-p10">
      <Tabs v-model="tabsName">
        <TabPane label="扫描" name="detail"></TabPane>
        <TabPane label="浏览搜索" name="list"></TabPane>
      </Tabs>
    </div>

    <div v-show="tabsName === 'list'" class="shelvesManage_list">
      <div id="box" v-show="$store.state.groupWorkShow === 'list'" class="listPage">
        <div class="searchMain">
          <!--库区状态按钮组-->
          <Form ref="pageParams" :model="pageParams" :label-width="90">
            <dyt-filter ref="dyt-filter" @expand="expand">
              <Form-item label="上架状态:">
                <dyt-select v-model="pageParams.shelvesStatusFlag">
                  <Option v-for="d in shelvesStatusFlagList" :value="d.value" :key="d.value" :label="d.label"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="条件:">
                <div class="flexAlignCenter">
                  <dyt-select :clearable="false" v-model="pageParams.groupName" @on-change="changeGroupName"
                    style="width: 90px;margin-right: 5px;overflow: hidden;">
                    <Option v-for="d in groupList" :value="d.value" :key="d.value" :label="d.label">
                    </Option>
                  </dyt-select>
                  <Input v-model.trim="pageParams.searchInWareNumber" :placeholder="pageParams.groupName === 'receiptNo'
                    ? '输入入库单号'
                    : pageParams.groupName === 'receiptBatchNo'
                      ? '输入批次号'
                      : '输入质检记录号'" style="flex:1;"></Input>
                </div>
              </Form-item>
              <Form-item label="入库单类型:" prop="receiptType">
                <dyt-select v-model="pageParams.receiptType">
                  <Option v-for="v in inWareTypeList" :value="v.selectInWareType" :label="v.account"
                    :key="v.selectInWareType"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="sku:" prop="skus">
                <dyt-input-tag :limit="1" type="textarea" v-model.trim="pageParams.skus" placeholder="多个编号请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="上架人:" prop="selectShelvesPerson">
                <dyt-select v-model="pageParams.selectShelvesPerson" placeholder="选择上架人">
                  <!-- <Option value="*">全部上架人</Option> -->
                  <Option v-for="item in shelvesPersonList" :value="item.createdBy" :label="item.createdByName"
                    :key="item.createdBy"></Option>
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" @click="shelveSearch" :disabled="SearchDisabled" icon="ios-search" class="mr10">
                  查询
                </Button>
                <Button @click="reset" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>

        <!--按上架状态 或 按创建时间排序-->
        <div class="funMain">
          <div class="funMain__flex">
            <div>
              <Dropdown @on-click="batchQc">
                <Button>
                  批量操作<Icon style="margin-left: 5px" type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem name="submitResult" v-if="permission.batchShelve">提交上架结果-选中</DropdownItem>
                  <DropdownItem name="exportCheck" v-if="permission.export">导出选中</DropdownItem>
                  <DropdownItem name="exportAll" v-if="permission.export">导出所有结果集</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div>
              <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
              </dyt-sortBySelect>
            </div>
          </div>
        </div>

        <div class="tableMain">
          <div class="tableBox">
            <!--表格-->
            <Table highlight-row border @on-selection-change="checkedDataHandel" :columns="columns7"
              :loading="TableLoading" :data="data6" ref="selection" :height="tableHeight"></Table>
          </div>
        </div>

        <!--分页按钮-->
        <div class="pagesMain">
          <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
            :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>

      </div>
      <Modal v-model="shelvesModal" :styles="{ top: '80px', width: '1300px' }" class="headerBar"
        :title="submitShelvesTitle" @on-cancel="cancelButton">
        <div class="content">
          <submitShelfDetails :curObj="curObj" ref="submitShelvFlag" :tabsName="tabsName" @validateFail="validateFail"
            @createFail="createFail" @createSuccess="createSuccess"></submitShelfDetails>
        </div>
        <div slot="footer">
          <Button @click="cancelButton">取消</Button>
        </div>
      </Modal>
      <!-- 入库单详情组件 -->
      <inWareDetails v-if="$store.state.groupWorkShow === 'watch'" :inWareOrderId="inWareOrderId" @backPage="backPage"
        :inWareOrderNo="inWareOrderNo" :shelfS="shelfS"></inWareDetails>
    </div>

    <div class="detail-box" v-show="tabsName === 'detail'">
      <div v-show="!showDetail" style="margin-top: 50px">
        <scan ref="scan" @enter="scanning"></scan>
      </div>
      <div v-show="showDetail">
        <Card dis-hover>
          <Row class="search-box" type="flex" justify="center" align="middle">
            <Col span="6" class="search-label">扫描SKU：</Col>
            <Col span="15"><Input class="search-ipt" ref="scanSku" autofocus v-model.trim="scanSku"
              @on-enter="scanning(scanSku)" placeholder="扫描SKU："></Input></Col>
            <Col span="3"><Button class="search-btn" type="primary" icon="ios-search"
              @click="scanning(scanSku)">查询</Button></Col>
          </Row>
        </Card>
        <submitShelfDetails v-show="showDetail" :curObj="curObj" :tabsName="tabsName" ref="submitShelfDetails1"
          @validateFail="validateFail" @createFail="createFail" :type="type" @createSuccess="createSuccess">
        </submitShelfDetails>
      </div>
    </div>
    <Modal v-model="model2" width="1200" title="系统匹配到多条待上架记录">
      <Table highlight-row border :columns="columns3" :loading="TableLoading" :data="data3" max-height="400"
        ref="selection"></Table>
    </Modal>
    <Modal v-model="model3" width="1200" @on-visible-change="getPosition('')" title="提交结果">
      <Table highlight-row border max-height="560" :columns="columns8" :data="data8">
      </Table>
      <div slot="footer">
        <Button type="primary" @click="batchShelf">提交结果</Button>
        <Button @click="model3 = false">关闭</Button>
      </div>
    </Modal>
    <printSkuCode :printSkuObj="printDate" :printType="printType" :qualityCheckProcurementId="qualityCheckProcurementId"
      @printsuccess="printsuccess" :tipsDataLength="data2" :barCodeShow="barCodeShow" :printSource="'shelvesManage'">
    </printSkuCode>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import submitShelfDetails from './submitShelfDetails';
import inWareDetails from './inWareDetails';
import scan from '../common/scan';
import printSkuCode from '../common/printSkuCode';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import { inWareTypeObj } from '@/views/wms/components/common/receiptType.js';
import transWarehouseMixin from '@/components/mixin/transWarehouse_mixin';

export default {
  mixins: [Mixin, tableHeight_mixin, transWarehouseMixin],
  components: {
    inWareDetails: inWareDetails, // 入库单详情组件
    submitShelfDetails: submitShelfDetails, // 提交上架结果组件
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
      inWareTypeList: inWareTypeObj({ label: 'account', value: 'selectInWareType' }),
      checkedDate: [],
      model3: false,
      columns8: [
        {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU/条码编码',
          align: 'center',
          width: 120,
          render(h, params) {
            return h('div', {}, [h('p', params.row.goodsSku || ''), h('p', params.row.barCode || '')]);
          }
        }, {
          title: '产品名称',
          align: 'center',
          key: 'goodsCnDesc',
          width: 100,
        }, {
          title: '入库单号',
          align: 'center',
          key: 'receiptNo'
        }, {
          title: '批次号',
          align: 'center',
          key: 'receiptBatchNo'
        }, {
          title: '质检记录号',
          align: 'center',
          key: 'receiptBatchCheckDetailNo'
        }, {
          title: '质检结果',
          align: 'center',
          render(h, params) {
            let text = params.row.qcResult === 0 ? '不良品' : '良品';
            return h('span', text);
          }
        }, {
          title: '需上架总数',
          align: 'center',
          key: 'waitShelveNumber'
        }, {
          title: '已上架数量',
          align: 'center',
          key: 'shelveNumberText'
        }, {
          title: '待上架数',
          align: 'center',
          width: 120,
          renderHeader(h) {
            return h('div', {}, [
              h('p', '待上架数'), h('InputNumber', {
                props: {
                  size: 'small',
                  value: 0,
                  min: 0
                },
                on: {
                  'on-change': event => {
                    v.data8.forEach((i, index) => {
                      if (event > i.waitShelveNumber) {
                        i.shelveNumber = Number(i.waitShelveNumber) - Number(i.shelveNumberText);
                      } else {
                        i.shelveNumber = event;
                      }
                    });
                    let data = JSON.parse(JSON.stringify(v.data8));
                    v.data8 = [];
                    v.data8 = data;
                  }
                }
              })
            ]);
          },
          render(h, params) {
            return h('InputNumber', {
              props: {
                size: 'small',
                value: params.row.shelveNumber ? params.row.shelveNumber : 0,
                min: 0,
                max: params.row.waitShelveNumber
              },
              on: {
                'on-change': val => {
                  let obj = JSON.parse(JSON.stringify(v.data8[params.index]));
                  obj.shelveNumber = val;
                  v.$set(v.data8, [params.index], obj);
                }
              }
            });
          }
        }, {
          title: '上架库位',
          align: 'center',
          width: 120,
          renderHeader(h) {
            let id = '';
            return h('div', {}, [
              h('p', '上架库位'), h('Select', {
                props: {
                  value: id,
                  transfer: true,
                  filterable: true,
                  remote: true,
                  loading: v.loading2,
                  placeholder: '输入搜索词进行远程查询',
                  'remote-method': function (query) {
                    v.getPosition(query);
                  }
                },
                on: {
                  'on-change': event => {
                    v.data8.forEach((i, index) => {
                      i.warehouseLocationIdItem = event;
                    });
                    let data = JSON.parse(JSON.stringify(v.data8));
                    v.data8 = [];
                    v.data8 = data;
                  }
                },
                nativeOn: {
                  'click'() {
                    v.getPosition('');
                  }
                }
              }, v.positionList.map((i, index) => {
                return h('Option', {
                  props: {
                    key: index,
                    value: i.warehouseLocationId
                  }
                }, i.warehouseLocationName);
              }))
            ]);
          },
          render(h, params) {
            //  return h(params.row.warehouseLocationIdItem)
            return h('Select', {
              props: {
                value: params.row.warehouseLocationIdItem,
                transfer: true,
                filterable: true,
                remote: true,
                loading: v.loading2,
                'remote-method': function (query) {
                  v.getPosition(query);
                }
              },
              on: {
                'on-change': event => {
                  v.$set(v.data8[params.index], 'warehouseLocationIdItem', event);
                }
              },
              nativeOn: {
                'click'() {
                  v.getPosition('');
                }
              }
            }, v.positionList.map((i, index) => {
              return h('Option', {
                props: {
                  key: index,
                  value: i.warehouseLocationId
                }
              }, i.warehouseLocationName);
            }));
          }
        }
      ],
      data8: [],
      showDetail: false,
      scanSku: '',
      columns3: [
        {
          title: 'No',
          key: 'index',
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '入库单编号',
          key: 'receiptNo',
          minWidth: 110,
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          minWidth: 110
        }, {
          title: '质检记录',
          key: 'receiptBatchCheckDetailNo',
          align: 'center',
          minWidth: 110
        }, {
          title: '质检结果',
          align: 'center',
          minWidth: 60,
          render(h, params) {
            let text = params.row.qcResult === 0 ? '不良品' : '良品';
            return h('span', text);
          }
        }, {
          title: '上架状态',
          key: 'shelveStatus',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            if (params.row.shelveStatus === '0') {
              return h('div', {}, '待上架');
            } else if (params.row.shelveStatus === '1') {
              return h('div', {}, '部分上架');
            } else if (params.row.shelveStatus === '2') {
              return h('div', {}, '上架完成');
            }
          }
        }, {
          title: '需上架总数/待上架数量',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let nub = params.row.waitShelveNumber - params.row.shelveNumber || 0;
            return h('span', params.row.waitShelveNumber + '/' + nub);
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
                  v.templateName = 'submitShelfDetails';
                  v.curObj = params.row; // 获取当前表格行的数据
                  v.showDetail = true;
                  v.$refs.submitShelfDetails1.getShelvesDetailData(v.curObj);
                  v.$refs.submitShelfDetails1.getGoodWarehouseLocal(v.curObj);
                  v.$refs.submitShelfDetails1.getColorSize(v.curObj);
                  v.model2 = false;
                }
              }
            }, '选择');
          }
        }
      ],
      data3: [],
      model2: false,
      spinShow: false,
      formInline: {
        search: ''
      },
      type: 'look',
      tabsName: 'detail',
      uploadLoading: false,
      cacheClickVal: 'WS', // 排序缓存值
      templateName: '',
      curObj: {},
      inWareOrderId: '', // 入库单id标记
      inWareOrderNo: '', // 入库单编号
      shelfS: '',
      wareId: this.getWarehouseId(),
      positionList: [], // 库位
      // 上架状态选择
      shelvesStatusFlagList: [
        {
          label: '待上架',
          value: '0',
          checked: true
        }, {
          label: '部分上架',
          value: '1',
          checked: false
        }, {
          label: '上架完成',
          value: '2',
          checked: false
        }
      ], // 选择入库单号，批次号，质检记录号
      groupList: [
        {
          label: '入库单号',
          value: 'receiptNo'
        }, {
          label: '批次号',
          value: 'receiptBatchNo'
        }, {
          label: '质检记录号',
          value: 'receiptBatchCheckDetailNo'
        }
      ], // 选择仓库
      wareHouseTypeList: [], // 选择上架人
      shelvesPersonList: [], // 排序的数据
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "WS",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按上架状态",
          sortField: "CT",
          sortType: "DESC",
        },
      ],
      pageParams: {
        skus: [],
        receiptType: '',
        skuList: null,
        shelvesStatusFlag: '0', // 上架状态切换
        groupName: 'receiptNo', // 选择入库单号，批次号，质检记录号
        searchInWareNumber: '', // 输入入库单号
        selectShelvesPerson: '', // 选择上架人
        DESC: 'DESC', // 降序
        CT: 'WS', // 排序的标记
        pageNum: 1,
        pageSize: 50
      },
      totalRecords: 0, // 总条数
      submitShelvesTitle: '上架详情',
      shelvesModal: false, // 提交上架结果模态框
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '仓库',
          key: 'warehouseName',
          width: 100,
          align: 'center'
        }, {
          title: '入库单编号',
          key: 'receiptNo',
          minWidth: 170,
          align: 'center',
          render: function (h, params) {
            if (v.permission.detail) {
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
                    this.shelfS = params.row.shelveStatus;
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
          minWidth: 120
        }, {
          title: '来源',
          align: 'center',
          width: 100,
          render(h, params) {
            let temp = { 0: '收货', 1: '质检', 2: '转合格上架' }
            return h('span', temp[params.row.source]);
          }
        }, {
          title: '质检记录号',
          key: 'receiptBatchCheckDetailNo',
          align: 'center',
          minWidth: 120
        }, {
          title: '质检结果',
          align: 'center',
          width: 100,
          render(h, params) {
            let text = params.row.qcResult === 0 ? '不良品' : '良品';
            return h('span', text);
          }
        }, {
          title: '待上架SKU/条码编码',
          // key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center'
                }
              }, [
                h('span', params.row.goodsSku || ''),
                params.row.transitStatus === 1 ? h('Icon', {
                  props: {
                    type: 'ios-shuffle'
                  },
                  style: {
                    marginLeft: '4px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#2D8CF0'
                  }
                }) : '',
              ]),
              h('div', params.row.barCode || ''),
            ])
          }
        }, {
          title: '上架状态',
          key: 'shelveStatus',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.shelveStatus === '0') {
              return h('div', {}, '待上架');
            } else if (params.row.shelveStatus === '1') {
              return h('div', {}, '部分上架');
            } else if (params.row.shelveStatus === '2') {
              return h('div', {}, '上架完成');
            }
          }
        }, {
          title: '需上架总数',
          key: 'waitShelveNumber',
          align: 'center',
          minWidth: 100
        }, {
          title: '已上架数',
          key: 'shelveNumber',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return h('span', params.row.shelveNumber || 0);
          }
        }, {
          title: '待上架数',
          key: 'shelveNumber ',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            let nub = params.row.shelveNumber || 0;
            return h('span', params.row.waitShelveNumber - nub);
          }
        }, {
          title: '上架人',
          key: 'createdBy',
          align: 'center',
          minWidth: 100
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
          minWidth: 140,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    icon: 'ios-eye',
                    disabled: !this.permission.detail
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.shelveStatus === '0' ? 'none' : params.row.shelveStatus === '1'
                      ? 'none'
                      : 'inline'
                  },
                  on: {
                    click: () => {
                      self.$nextTick(() => {
                        self.type = 'look';
                        self.shelvesModal = true;
                        self.templateName = 'submitShelfDetails';
                        self.$store.commit('activeRow', params.row);
                        self.curObj = params.row; // 获取当前表格行的数据
                        self.$refs.submitShelvFlag.getShelvesDetailData(self.curObj);
                        self.$refs.submitShelvFlag.getGoodWarehouseLocal(self.curObj);
                        self.$refs.submitShelvFlag.getColorSize(self.curObj);
                      });
                    }
                  }
                }, '查看'),
                h('Button', {
                  props: {
                    type: 'success',
                    size: 'small',
                    icon: 'ios-cloud-upload-outline',
                    disabled: !this.permission.createRes
                  },
                  style: {
                    marginRight: '5px',
                    display: params.row.shelveStatus === '2' ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      self.$nextTick(() => {
                        self.type = 'qc';
                        self.showDetail = true;
                        // self.shelvesModal = true;
                        self.tabsName = 'detail';
                        self.templateName = 'submitShelfDetails';
                        self.curObj = params.row; // 获取当前表格行的数据
                        self.$refs.submitShelfDetails1.getShelvesDetailData(self.curObj);
                        self.$refs.submitShelfDetails1.getGoodWarehouseLocal(self.curObj);
                        self.$refs.submitShelfDetails1.getColorSize(self.curObj);
                        setTimeout(() => {
                          self.$refs.scanSku.focus();
                        }, 0);
                      });
                    }
                  }
                }, '提交上架结果')
                // h('Button', {
                //   props: {
                //     type: 'primary',
                //     size: 'small'
                //   },
                //   style: {
                //     marginRight: '5px',
                //     display: params.row.shelveStatus === '0' ? 'none' : params.row.shelveStatus === '1' ? 'none' : 'inline'
                //   },
                //   on: {
                //     click: () => {
                //     }
                //   }
                // }, '打印上架单')
              ]);
            }
          }
        }
      ],
      data6: []
    };
  },
  watch: {
    '$store.state.groupWorkShow': function (watch) {
      if (watch) {
        this.searchData();
      }
    },
    tabsName: function (val) {
      if (val === 'list') {
        this.searchData();
        this.refreshHeight();
      } else {
        this.$nextTick(() => {
          this.$refs.scan.$refs.scanIpt.focus();
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
    },
    // 权限
    permission () {
      return {
        batchShelve: this.getPermission('wmsReceiptCheckDetailShelve_batchCreateShelve'),
        query: this.getPermission('wmsReceiptCheckDetailShelve_query'),
        detail: this.getPermission('wmsReceiptCheckDetailShelve_detail'),
        createRes: this.getPermission('wmsReceiptCheckDetailShelve_createShelve'),
        export: this.getPermission('wmsReceiptCheckDetailShelve_exportTask'),
      }
    }
  },
  created() {
    this.searchData();
    this.$store.commit('pickingFlag', '1');
  },
  methods: {
    // 更新表格高度
    refreshHeight() {
      this.$nextTick(() => {
        this.computedTableHeight();
        this.$refs['dyt-filter'].resizeHand();
      })
    },
    backPage() {
      this.$store.commit('groupWorkShow', 'list');
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
    getPosition(query) {
      let v = this;
      let obj = v.data8[0].qcResult === 1 ? '11' : '12';
      let obj1 = v.data8[0].qcResult === 1 ? '1' : '3';
      v.getPositionListNew(['10', obj], obj1, query).then((data) => {
        v.positionList = data;
      });
    },
    batchShelf() {
      let v = this;
      let params = this.data8.filter(i => {
        return i.warehouseLocationIdItem !== '' && Number(i.shelveNumber) !== 0;
      });
      if (params.length === 0) {
        v.$Message.error('待上架数和上架库位不能为空');
        return;
      }
      ; let arr = [];
      params.forEach(i => {
        let obj1 = {
          warehouseLocationId: i.warehouseLocationIdItem,
          changedNum: i.shelveNumber,
          productGoodsId: i.productGoodsId,
          receiptBatchNo: i.receiptBatchNo,
          goodsSku: i.goodsSku,
          remainderNum: Number(i.waitShelveNumber) - Number(i.shelveNumber)
        };
        let obj = {
          receiptBatchNo: i.receiptBatchNo,
          productGoodsId: i.productGoodsId,
          shelveNumber: i.shelveNumber, // 上架数量
          inventoryNumber: Number(i.shelveNumber),
          remark: i.remark, // 备注
          warehouseId: i.warehouseId,
          warehouseLocationId: i.warehouseLocationId,
          goodsSku: i.goodsSku,
          passShelveNumber: i.shelveNumber, // 本次已上架合格数量
          problemWarehouseLocationId: '', // 选择上架问题库位id
          receiptCheckDetailShelveNo: i.receiptCheckDetailShelveNo,
          receiptNo: i.receiptNo, // 入库单编号
          wmsResponseInventoryLog: [obj1]
        };
        arr.push(obj);
      });
      this.$Spin.show();
      this.axios.post(api.batchCreateShelve, arr).then(res => {
        this.$Spin.hide();
        if (res.data.code === 0) {
          if (res.data.datas.length === 0) {
            v.$Message.success('提交成功');
          } else {
            v.$Message.error({
              render(h, params) {
                return res.data.datas.map(i => {
                  return h('p', i.message);
                });
              },
              duration: 5,
              closable: true
            });
          }
          v.searchData();
          v.model3 = false;
        }
      }).catch(() => {
        this.$Spin.hide();
      });
    },
    checkedDataHandel(data) {
      this.checkedDate = data;
    },
    batchQc(name) {
      let v = this;
      if (name === 'submitResult') {
        v.data8 = v.checkedDate.filter(i => {
          return i.shelveStatus === '0' || i.shelveStatus === '1';
        });
        if (v.data8.length === 0) {
          v.$Message.error({
            duration: 5,
            content: '未选择可上架数据'
          });
          return;
        }
        let valid = [];
        v.data8.forEach(i => {
          if (i.qcResult === 1) {
            valid.push('1');
          } else {
            valid.push('2');
          }
        });
        if (valid.indexOf('1') > -1 && valid.indexOf('2') > -1) {
          v.$Message.error({
            duration: 5,
            content: '只可同时上架良品数据或者不良品数据'
          });
          return;
        }
        v.data8.forEach(i => {
          i.warehouseLocationIdItem = ''; // 因为需要传2个warehouseLocationIdItem 所有新增一个为选择的库位id
          i.shelveNumberText = i.shelveNumber;
          i.shelveNumber = i.waitShelveNumber - i.shelveNumber;
        });
        v.model3 = true;
        return;
      }
      // 导出
      if (['exportCheck', 'exportAll'].includes(name)) {
        let params = this.getSearchParams();
        ['pageNum', 'pageSize'].forEach(key => {
          delete params[key];
        });
        if (name == 'exportCheck') {
          if (this.$common.isEmpty(this.checkedDate)) return this.$Message.error('请选择需要导出的数据');
          params.skuList = [];
          params.receiptCheckDetailShelveIds = this.checkedDate.map(m => m.receiptCheckDetailShelveId);
        }
        this.axios.post(api.shelveExportData, params).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          return this.$Message.success('操作成功，请到导出查看列表查看');
        });
      }
    },
    async scanning(sku) {
      let v = this;
      // 解决转库扫描问
      if (this.isTransWarehouse) {
        sku = await this.getLapaSku(sku);
      }
      let params = {
        pageNum: 1,
        pageSize: 1000,
        orderSeq: 'DESC', // 降序
        orderBy: 'WS', // 排序字段，质检状态
        warehouseId: this.wareId,
        shelveStatusList: [0, 1],
        sku: sku
      };
      v.$Spin.show();
      v.TableLoading = true;
      v.axios.post(api.shelvesListSearchData, params).then(res => {
        v.$Spin.hide();
        v.TableLoading = false;
        if (res.data.code === 0) {
          if (res.data.datas === null || res.data.datas.list.length === 0) {
            v.$Message.error({
              duration: 5,
              content: '暂无数据'
            });
            return;
          }
          if (res.data.datas.list.length === 1) {
            v.curObj = res.data.datas.list[0];
            v.tabsName = 'detail';
            v.templateName = 'submitShelfDetails';
            v.showDetail = true;
            v.$refs.submitShelfDetails1.getShelvesDetailData(v.curObj);
            v.$refs.submitShelfDetails1.getGoodWarehouseLocal(v.curObj);
            v.$refs.submitShelfDetails1.getColorSize(v.curObj);
          } else {
            v.data3 = res.data.datas.list;
            v.model2 = true;
          }
          // this.data6 = v.processTimeData(res.data.datas.list, 'createdTime');
          // this.totalRecords = res.data.datas.total;
        }
      }).catch(() => {
        v.$Spin.hide();
        v.TableLoading = false;
      });
    },
    changeGroupName: function (value) {
      // 入库单号和批次号的输入切换
      this.pageParams.groupName = value;
    },
    submitShelves() {
      // 提交上架结果按钮
      this.uploadLoading = true;
      this.$refs.submitShelvFlag.handleSubmit();
    },
    // 返回搜索条件
    getSearchParams () {
      let paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize, // 排序参数
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        receiptType: this.pageParams.receiptType,
        skuList: this.pageParams.skus,
        warehouseId: this.wareId
      };
      // 上架状态选择
      if (this.pageParams.shelvesStatusFlag) {
        paramsObj.shelveStatusList = [this.pageParams.shelvesStatusFlag];
      }
      // 选择入库单号，批次号，质检记录号
      if (this.pageParams.groupName === 'receiptNo') {
        paramsObj.receiptNo = this.pageParams.searchInWareNumber ? this.pageParams.searchInWareNumber : null;
      } else if (this.pageParams.groupName === 'receiptBatchNo') {
        paramsObj.receiptBatchNo = this.pageParams.searchInWareNumber ? this.pageParams.searchInWareNumber : null;
      } else if (this.pageParams.groupName === 'receiptBatchCheckDetailNo') {
        paramsObj.receiptBatchCheckDetailNo = this.pageParams.searchInWareNumber ? this.pageParams.searchInWareNumber : null;
      }
      paramsObj.createdBy = this.pageParams.selectShelvesPerson;
      return paramsObj;
    },
    searchData () {
      // 查询数据
      this.checkedDate = [];
      this.data6 = [];
      this.pageParams.pageSize = this.getPageSizeCache();
      if (this.permission.query) {
        let paramsObj = this.getSearchParams();
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.shelvesListSearchData, paramsObj).then(res => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data6 = this.processTimeData(res.data.datas.list, 'createdTime');
            this.totalRecords = res.data.datas.total;
          } else {
            this.totalRecords = 0;
          }
        }).catch(() => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          this.totalRecords = 0;
        });
        // this.getWareHouseName(); // 调用仓库下拉列表
        this.getshelfName(); // 调用上架人列表
      } else {
        this.gotoError(); // 无权限
      }
    },
    shelveSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    createSuccess() {
      // 提交上架结果成功
      var v = this;
      v.searchData();
      // v.tabsName = 'list';
      // v.showDetail = false;
      v.shelvesModal = false;
      v.$Message.success('成功提交上架结果');
      this.uploadLoading = false;
    },
    createFail() {
      // 提交上架结果失败
      this.shelvesModal = true;
      this.uploadLoading = false;
    },
    validateFail() {
      this.uploadLoading = false;
    },
    cancelButton() {
      var v = this;
      v.shelvesModal = false;
      v.$refs.submitShelvFlag.resetFormFn(); // 取消之后，清空表单数据
      v.$Message.info('取消提交上架结果');
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.DESC = type;
      this.pageParams.CT = feild;
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
    // checkShelvesStatus: function (value) {
    //   // 上架状态按钮状态切换
    //   this.shelvesStatusFlagList.forEach(function (n) {
    //     n.checked = n.value === value;
    //   });
    //   this.pageParams.shelvesStatusFlag = value;
    // },
    getWareHouseName() {
      // 获取仓库下拉列表
      var v = this;
      v.axios.get(api.selectShelfWareHouseName).then(res => {
        if (res.data.code === 0) {
          this.wareHouseTypeList = res.data.datas;
        }
      });
    },
    getshelfName() {
      // 获取上架人下拉列表
      var v = this;
      v.axios.get(api.get_shelvePersonName).then(res => {
        if (res.data.code === 0) {
          this.shelvesPersonList = res.data.datas;
        }
      });
    }, // 重置按钮
    reset() {
      this.pageParams.searchInWareNumber = '';
      this.pageParams.groupName = 'receiptNo';
      this.pageParams.shelvesStatusFlag = '0';
      //   this.checkShelvesStatus('0');
      this.$refs['pageParams'].resetFields();
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
<style lang="less" scoped>
.shelvesManage {
  height: 100%;
  display: flex;
  flex-direction: column;

  .shelvesManage_list {
    width: 100%;
    height: 100%;
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
