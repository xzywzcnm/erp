<style scoped >
.sales {
  display: inline-block;
  min-width: 30px;
  margin-right: 5px;
}

.calTime {
  font: 12px/1.6em Verdana, Arial, Helvetica, sans-serif;
  padding: 0 12px;
}

.time {
  display: inline-block;
  background-color: #FCFBE1;
  color: #ff6600;
}
</style >
<style >
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.supplierTabsBar .ivu-tabs-nav-prev, .supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}
</style>
<template>
  <div >
    <template v-if="purchaseShow == 'fbaStockingAdvice'" >
      <div class="commonFilter" >
        <div class="card-container" >
          <div class="card-content" >
            <div class="platformParamsSelect" >
              <Form ref="pageParams" :model="pageParams" :label-width="80" >
                <Row >
                  <Col :span="5" >
                    <FormItem label="备货店铺：" prop="backupWarehouseId" >
                      <dyt-select v-model="pageParams.backupWarehouseId" clearable placeholder="请选择" > <Option
                          v-for="(item,index) in warehouseArr"
                          :disabled="item.warehouseStatus === '1'"
                          :value="item.warehouseId"
                          :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
                    </FormItem >
                  </Col >
                  <Col :span="5" >
                    <FormItem label="" prop="skuStr" >
                      <Input v-model.trim="pageParams.skuStr" placeholder="SKU搜索，多个SKU，逗号或换行符分开" ></Input >
                    </FormItem >
                  </Col >
                  <Col :span="4" :offset="1" >
                    <Button type="primary" @click="search" class="iconbuttons" >
                      搜索 </Button >
                  </Col >
                </Row >
              </Form >
            </div >
          </div >
        </div >
      </div >
      <div class="flexBox spaceBetween" >
        <div class="tableControl" v-if="currentTabItem == '1'" >
          <Button
              type="primary"
              class="iconbuttons"
              style="margin-left: 12px"
              @click="calStockRequirement"
              :disabled="isCalStock" >
            计算备货需求 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="addFbaStockPlanFn" >
            生成备货计划 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="settingWarehouseFn" >
            批量设置中转仓 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="moveInExclude" >
            移入非备货列表 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="exportEcxel" >
            导出备货建议 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="printFn" >
            打印备货建议 </Button >
        </div >
        <div class="tableControl" v-else-if="currentTabItem == '2'" >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="removeExclude" >
            移出非建议列表 </Button >
        </div >
      </div >
      <template v-if="calculateTime" >
        <div class="calTime normalTop" >
          计算时间:<span class="time" >{{ calculateTime }}</span > 当前列表数据，只在计算当时作为采购建议依据，已过计算时间，请重新计算。
        </div >
      </template >
      <div class="supplierTabsBar commonFilter normalTop" >
        <template >
          <Tabs v-model="currentTabItem" @on-click="showCurrentPage" >
            <TabPane
                v-for="(item) in tabItems"
                :label="item.value"
                :key="item.key"
                :name="String(item.key)" ></TabPane >
          </Tabs >
        </template >
      </div >
      <div class="commonFilter" >
        <div class="orderTable" >
          <keep-alive >
            <Table
                highlight-row
                :border="true"
                :height="tableHeight"
                :loading="Tableloading"
                :columns="stockColumn"
                :data="stockData"
                @on-selection-change="getSelectValue" ></Table >
          </keep-alive >
          <div class="table-page clear" >
            <div class="table-page-right" >
              <keep-alive >
                <Page
                    :total="total"
                    @on-change="changePage"
                    show-total
                    :page-size="pageParams.pageSize"
                    show-elevator
                    :current="pageParams.pageNum"
                    show-sizer
                    @on-page-size-change="changePageSize"
                    placement="top"
                    :page-size-opts="pageArray" ></Page >
              </keep-alive >
            </div >
          </div >
        </div >
      </div >
    </template >
    <transition name="bounce" >
      <template v-if="purchaseShow === 'fbaStocking'" >
        <div class="subLayer infoDetails" >
          <div class="topper" >
            <span class="arrowLeft" @click="goBackFromAddPlan" ><Icon type="ios-arrow-back" class="IconBack" ></Icon >返回</span >
          </div >
          <div class="mainContent" :style="{'height':initSubLayerHeight + 'px','overflow-y':'auto'}" >
            <fbaStocking @addPlanGoBack="addPlanGoBack" ></fbaStocking >
          </div >
        </div >
      </template >
    </transition >
    <!--批量设置中转仓-->
    <Modal v-model="isShowSettingWarehouse" title="批量设置中转仓" width="420" >
      <div class="normalTop20" >
        <Form ref="transWarehouse" :model="transWarehouse" :label-width="100" :rules="ruleValidate" >
          <FormItem label="设置中转仓为：" prop="warehouseId" >
            <dyt-select v-model="transWarehouse.warehouseId" placeholder="请选择" > <Option
                v-for="(item,index) in transWarehouseArr"
                :disabled="item.warehouseStatus === '1'"
                :value="item.warehouseId"
                :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
          </FormItem >
        </Form >
      </div >
      <div slot="footer" style="text-align: center;" >
        <Button
            type="primary"
            :loading="whSaveLoading"
            @click="saveWarehouseFn('transWarehouse')"
            style="width: 80px;" >确定 </Button >
        <Button
            type="primary" @click="isShowSettingWarehouse = false" style="width: 80px;margin-left: 20px" >关闭</Button >
      </div >
    </Modal >
    <!--未关联的弹框-->
    <Modal v-model='noBindFlag' width='800px' >
      <div v-if='noBindFlag' >
        <bindSku :warehouseId='pageParams.backupWarehouseId' :asin='rowAsin' ></bindSku >
      </div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
// import common from '@/assets/common.js';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import fbaStocking from './common/fbaStocking';
// import addStockingPlan from './common/addStockingPlan'
import bindSku from './common/bindSku';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    fbaStocking,
    bindSku
  },
  data () {
    let self = this;
    return {
      noBindFlag: false,
      rowAsin: '',
      purchaseShow: 'fbaStockingAdvice',
      pageParamsStatus: false,
      isCalStock: false, // 判断是否计算过备货需求，如果已经计算过则禁用按钮
      tableHeight: self.getTableHeight(390),
      calculateTime: '',
      totalPage: 0,
      total: 0,
      curPage: 1,
      currentTabItem: '1', // 标签页
      operationType: '',
      planDatas: [],
      isShowSettingWarehouse: false, // 批量设置中转仓弹窗
      whSaveLoading: false, // 批量设置中转仓加载状态
      warehouseArr: [],
      goodsStatusArr: [],
      pageParams: {
        // calcType: 2,
        pageNum: 1,
        pageSize: 10,
        backupWarehouseId: '',
        suggestType: 2,
        dataType: '1',
        goodsStatus: null,
        skuStr: '',
        skuList: []
      },
      tabItems: [
        {
          key: '1',
          value: '备货建议列表'
        }, {
          key: '2',
          value: '非建议列表'
        }
      ],
      selectionArr: [], // 已选中表格行数据
      stockData: [], // 主table
      stockColumn: [],
      stockAdviceColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'thumbUrl',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'thumbUrl');
          }
        }, {
          key: 'skuNo',
          align: 'center',
          width: 180,
          title: '产品SKU/产品名称',
          render: (h, params) => {
            if (params.row.goodsId) {
              let spec = '';
              if (params.row.productGoodsSpecifications) {
                spec = params.row.productGoodsSpecifications.map(i => i.name + ':' + i.value).join(',');
              }
              return h('div', {}, [
                h('p', params.row.skuNo), h('p', params.row.goodsName), h('p', {
                  style: {
                    color: 'green'
                  }
                }, spec)
              ]);
            } else {
              return h('a', {
                on: {
                  'click': () => {
                    if (this.pageParams.backupWarehouseId) {
                      this.rowAsin = params.row.asin;
                      this.noBindFlag = true;
                    } else {
                      this.$Message.warning('请选择店铺');
                    }
                  }
                }
              }, '未关联');
            }
          }
        }, {
          key: 'backupWarehouseName',
          align: 'center',
          title: 'ASIN',
          render: (h, params) => {
            if (params.row.asin) {
              return h('span', params.row.asin);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'priceDetails',
          align: 'center',
          title: '供应商报价',
          render: (h, params) => {
            if (params.row.priceDetailsList && params.row.priceDetailsList.length > 0) {
              let content = [];
              if (params.row.priceDetailsList && params.row.priceDetailsList.length > 0) {
                params.row.priceDetailsList.forEach((n, i) => {
                  content.push(h('span', n + ' ' + params.row.currency));
                  if (params.row.priceDetailsList.length - i > 1) {
                    content.push(h('br'));
                  }
                });
              }
              return h('div', content);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'backupShopName',
          align: 'center',
          title: '备货店铺',
          render: (h, params) => {
            if (params.row.backupShopName) {
              return h('span', params.row.backupShopName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'purchaseWarehouseName',
          align: 'center',
          title: '中转仓库',
          width: 160,
          render: (h, params) => {
            if (!self.stockData[params.index].purchaseWarehouseId) {
              self.stockData[params.index].purchaseWarehouseName = self.transWarehouseArr[0].warehouseName;
              self.stockData[params.index].purchaseWarehouseId = self.transWarehouseArr[0].warehouseId;
            }
            let arr = [];
            self.transWarehouseArr.forEach((n, i) => {
              arr.push(h('Option', {
                props: {
                  value: n.warehouseId,
                  key: n.warehouseId
                },
                on: {
                  click: () => {
                  }
                }
              }, n.warehouseName));
            });
            return h('Select', {
              props: {
                value: self.stockData[params.index].purchaseWarehouseId,
                'label-in-value': true
              },
              on: {
                'on-change': (obj) => {
                  self.stockData[params.index].purchaseWarehouseName = obj.label;
                  self.stockData[params.index].purchaseWarehouseId = obj.value;
                  let warehouseObj = {
                    warehouseId: obj.value,
                    suggestIdList: [params.row.suggestId]
                  };
                  self.axios.post(api.suggestSetWarehouse, warehouseObj).then(res => {
                    if (res.data.code == 0) {
                      // v.$Message.success('设置成功！')
                    }
                  });
                }
              }
            }, arr);
          }
        }, {
          key: 'salesmanName',
          align: 'center',
          title: '负责人'
        }, {
          key: 'safetyDays',
          align: 'center',
          title: '安全交期'
        }, {
          key: 'availableDays',
          align: 'center',
          title: '可售天数'
        }, {
          key: 'averageDailySales',
          align: 'center',
          title: '日均销量'
        }, {
          key: 'proposedQuantity',
          align: 'center',
          title: '建议数量'
        }, {
          key: 'replenishQuantity',
          align: 'center',
          title: '备货数量',
          width: 150,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.stockData[params.index].replenishQuantity,
                min: 1
              },
              on: {
                'on-change': (val) => {
                  self.stockData[params.index].replenishQuantity = val;
                }
              }
            });
          }
        }
      ],
      noAdviceColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'goodsThumbUrl',
          title: '图片',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'thumbUrl');
          }
        }, {
          key: 'supplierName',
          align: 'center',
          title: '产品SKU/产品名称',
          render: (h, params) => {
            let spec = '';
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications.map(i => i.name + ':' + i.value).join(',');
            }
            return h('div', {}, [
              h('p', params.row.skuNo), h('p', params.row.goodsName), h('p', {
                style: {
                  color: 'green'
                }
              }, spec)
            ]);
          }
        }, {
          key: 'backupWarehouseName',
          align: 'center',
          title: 'ASIN',
          render: (h, params) => {
            if (params.row.backupWarehouseName) {
              return h('span', params.row.backupWarehouseName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'backupWarehouseName',
          align: 'center',
          title: '补货店铺',
          render: (h, params) => {
            if (params.row.backupWarehouseName) {
              return h('span', params.row.backupWarehouseName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'updatedTime',
          align: 'center',
          title: '移入时间',
          render: (h, params) => {
            if (params.row.updatedTime) {
              return h('span', self.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'remark',
          align: 'center',
          width: 400,
          title: '原因备注'
        }, {
          key: 'operation',
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'default'
              },
              on: {
                click: () => {
                  let suggestExcludeIds = [];
                  suggestExcludeIds.push(params.row.suggestExcludeId);
                  self.removeFn(suggestExcludeIds);
                }
              }
            }, '移出非建议列表');
          }
        }
      ],
      transWarehouse: {
        warehouseId: '',
        suggestIdList: []
      },
      transWarehouseArr: [],
      ruleValidate: {
        warehouseId: [
          {
            required: true,
            message: '不能为空',
            trigger: 'change'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  activated () {
    this.reset();
    this.intiBaseDataList();
    this.startLoading();
  },
  mounted () {
  },
  methods: {
    startLoading () {
      this.$Loading.start();
      this.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      v.selectionArr = [];
      v.stockData = [];
      v.dataTypeChange(v.currentTabItem);
      let params = v.formatParams();
      let apiStr = params.dataType == 1 ? api.suggestList : api.suggestExcludeList; // 备货建议列表api、非建议列表api
      v.Tableloading = true;
      v.axios.post(apiStr, params).then(res => {
        if (res.data.code === 0) {
          v.stockData = res.data.datas.list;
          if (v.stockData.length > 0) {
            v.calculateTime = v.stockData[0].calcTime;
            v.stockData.forEach((n, i) => { // 添加属性'replenishQuantity'-备货数量
              v.$set(v.stockData[i], 'replenishQuantity', n.proposedQuantity);
            });
          }
          v.total = res.data.datas.total;
          v.Tableloading = false;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    dataTypeChange (type) {
      this.stockColumn = type == '1' ? this.stockAdviceColumn : this.noAdviceColumn;
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    reset () {
      this.purchaseShow = 'fbaStockingAdvice';
      this.isCalStock = false;
      this.currentTabItem = '1';
      this.calculateTime = '';
      this.selectionArr = [];
      this.$nextTick(() => {
        this.$refs['pageParams'].resetFields();
      });
    },
    search () {
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    showCurrentPage (name) { // tabs页切换
      this.getList();
    },
    calStockRequirement () {
      let v = this;
      v.axios.post(api.suggestCalc + '?suggestType=2').then(res => {
        if (res.data.code == 0) {
          v.getList();
        }
        v.isCalStock = true;
      });
    },
    addFbaStockPlanFn () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error('请选择备货建议！！！');
        return;
      }
      /* 必须设置中转仓 */
      let valid = true;
      v.selectionArr.forEach(item => {
        if (item.purchaseWarehouseId === '' || item.purchaseWarehouseId === null) {
          valid = false;
        }
      });
      if (!valid) {
        v.$Message.error('所选项必须设置中转仓');
        return;
      }
      if (!v.selectionArr.every(val => val.goodsId)) {
        v.$Message.warning('未关联商品不可以直接生成备货计划');
        return;
      }
      v.purchaseShow = 'fbaStocking';
    },
    moveInExclude () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error('请选择需要移入非建议列表的备货建议！');
      } else {
        v.axios.post(api.suggestSaveExclude, v.selectionArr).then(res => {
          if (res.data.code == 0) {
            v.$Message.success('操作成功！');
            v.getList();
          }
        });
      }
    },
    removeExclude () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error('请选择需要移出非建议列表的备货建议！');
      } else {
        let suggestExcludeIds = [];
        v.selectionArr.forEach((n, i) => {
          suggestExcludeIds.push(n.suggestExcludeId);
        });
        v.axios.post(api.suggestRemoveExclude, suggestExcludeIds).then(res => {
          if (res.data.code == 0) {
            v.$Message.success('操作成功！');
            v.getList();
          }
        });
      }
    },
    goBackFromAddPlan () {
      this.purchaseShow = 'fbaStockingAdvice';
      this.selectionArr = [];
    },
    addPlanGoBack (val) {
      this.purchaseShow = val;
      this.selectionArr = [];
    },
    settingWarehouseFn () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error('请选择需要设置中转仓的备货建议！！');
      } else {
        v.isShowSettingWarehouse = true;
      }
    },
    saveWarehouseFn (name) {
      let v = this;
      v.whSaveLoading = true;
      v.transWarehouse.suggestIdList = v.selectionArr.map(item => item.suggestId);
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.axios.post(api.suggestSetWarehouse, v.transWarehouse).then(res => {
            if (res.data.code == 0) {
              v.$Message.success('设置成功！');
              v.getList();
              v.isShowSettingWarehouse = false;
            }
            v.whSaveLoading = false;
          });
        }
      });
    },
    removeFn (arr) {
      let v = this;
      v.axios.post(api.suggestRemoveExclude, arr).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('操作成功！！');
          v.pageParamsStatus = true;
        }
      });
    },
    exportEcxel () { // 批量导出
      let v = this;
      if (v.stockData.length === 0) {
        v.$Message.error('无数据导出');
      } else {
        let params = v.formatParams();
        v.axios.post(api.suggestExport, params).then(response => {
          if (response.data.code == 0) {
            v.$Message.success('导出成功');
            // window.location = v.$store.state.imgUrl +   response.data.datas;
          }
        });
      }
    },
    printFn () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error('请选择需要打印的备货建议!!');
      } else {
        localStorage.setItem('printData', JSON.stringify(v.selectionArr));
        let goto = this.$router.resolve({
          path: '/printSuggestionList'
        });
        window.open(goto.href, '_blank');
      }
    },
    intiBaseDataList () {
      let v = this;
      v.axios.post(api.warehouse, { pageNum: 1 }).then(res => {
        if (res.data.code == 0) {
          v.warehouseArr = [];
          v.transWarehouseArr = [];
          res.data.datas.forEach((n, i) => {
            if (n.warehouseType == '1') {
              v.warehouseArr.push(n);
            } else if (n.warehouseType == '0') {
              v.transWarehouseArr.push(n);
            }
          });
        }
      });
      v.axios.post(api.suggestGoodsStatus).then(res => {
        if (res.data.code == 0) {
          v.goodsStatusArr = res.data.datas;
        }
      });
    }
  }
};
</script >
