<style scoped >
.calTime {
  font: 12px/1.6em Verdana, Arial, Helvetica, sans-serif;
  padding: 0 12px;
}

.time {
  display: inline-block;
  background-color: #FCFBE1;
  color: #ff6600;
}

.sales {
  display: inline-block;
  width: 100px;
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
  <div>
    <template >
      <div class="commonFilter" >
        <div class="card-container" >
          <div class="card-content" >
            <div class="platformParamsSelect" >
              <Form ref="pageParams" :model="pageParams" :label-width="80" >
                <Row >
                  <Col :md="6" :lg="4" >
                    <FormItem label="仓库" prop="backupWarehouseId" >
                      <dyt-select v-model="pageParams.backupWarehouseId" clearable placeholder="请选择" > <Option
                          v-for="(item,index) in warehouseArr"
                          :disabled="item.warehouseStatus === '1'"
                          :value="item.warehouseId"
                          :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
                    </FormItem >
                  </Col >
                  <Col :md="6" :lg="4" :offset="1" >
                    <FormItem label="货品状态" prop="goodsStatus" >
                      <dyt-select v-model="pageParams.goodsStatus" clearable > <Option
                          v-for="(item,index) in goodsStatusArr"
                          :value="Object.keys(goodsStatusArr)[index]"
                          :key="index" >{{ item[Object.keys(goodsStatusArr)[index]] }} </Option > </dyt-select >
                    </FormItem >
                  </Col >
                  <Col :md="6" :lg="4" >
                    <FormItem label="" prop="skuStr" >
                      <Input v-model.trim="pageParams.skuStr" placeholder="SKU搜索，多个SKU，逗号或换行符分开" ></Input >
                    </FormItem >
                  </Col >
                  <Col :md="6" :lg="4" :offset="1" >
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
          <Button
              type="primary"
              class="iconbuttons"
              style="margin-left: 12px"
              @click="addPurchaseOrder"
              :loading="addOrderLoading" >
            生成采购单 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="settingWarehouseFn" >
            批量设置中转仓 </Button >
          <Button type="primary" class="iconbuttons" style="margin-left: 12px" @click="moveInExclude" >
            移入非备货列表 </Button >
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
                ref="managementTable"
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
      <!--批量设置中转仓-->
      <Modal v-model="isShowSettingWarehouse" title="批量设置中转仓" width="420" >
        <div class="normalTop20" >
          <Form ref="transWarehouse" :model="transWarehouse" :label-width="100" :rules="ruleValidate" >
            <FormItem label="设置中转仓为" prop="warehouseId" >
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
              @click="saveWarehouseFn('transWarehouse')"
              :loading="whSaveLoading"
              style="width: 80px;" >确定 </Button >
          <Button
              type="primary"
              @click="isShowSettingWarehouse = false"
              style="width: 80px;margin-left: 20px" >关闭 </Button >
        </div >
      </Modal >
      <!--商品销量统计-->
      <!-- <Modal v-model="isShowStatistics" title="商品销量统计" width="840">
        <div>
          <span class="sales">
            3天销量： 0
          </span>
          <span class="sales">
            7天销量： 0
          </span>
          <span class="sales">
            15天销量： 0
          </span>
          <span class="sales">
            30天销量： 0
          </span>
        </div>
        <div>
          <v-chart :options="option" auto-resize :style="{width: 800+'px'}"></v-chart>
        </div>
        <div slot="footer" style="text-align: center;">

        </div>
      </Modal> -->
    </template >
  </div >
</template>

<script>
import api from '@/api/api';
// import common from '@/assets/common.js';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    let self = this;
    return {
      pageParamsStatus: false,
      isCalStock: false, // 判断是否计算过备货需求，如果已经计算过则禁用按钮
      tableHeight: self.getTableHeight(390),
      totalPage: 0,
      total: 0,
      curPage: 1,
      calculateTime: '',
      addOrderLoading: false, // 防止生成采购单重复调用接口
      currentTabItem: '1', // 标签页
      isShowSettingWarehouse: false, // 批量设置中转仓弹窗
      whSaveLoading: false, // 批量设置中转仓提交加载状态（防止重复提交）
      warehouseArr: [],
      goodsStatusArr: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10, // calcType: 3,
        backupWarehouseId: '',
        suggestType: 3,
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
      transWarehouse: {
        warehouseId: '',
        suggestIdList: []
      },
      transWarehouseArr: [],
      selectionArr: [], // 已选中表格行数据
      stockData: [], // 主table
      stockColumn: [],
      stockAdviceColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'goodsThumbUrl',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'thumbUrl');
          }
        }, {
          key: 'skuNo',
          align: 'center',
          width: 150,
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
          key: 'priceDetails',
          align: 'center',
          width: 130,
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
          key: 'backupWarehouseName',
          align: 'center',
          title: '备货仓库',
          render: (h, params) => {
            if (params.row.backupWarehouseName) {
              return h('span', params.row.backupWarehouseName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'purchaseWarehouseName',
          align: 'center',
          title: '中转仓库',
          width: 150,
          render: (h, params) => {
            let arr = [];
            self.transWarehouseArr.forEach((n, i) => {
              arr.push(h('Option', {
                props: {
                  value: n.warehouseId,
                  key: n.warehouseId,
                  disabled: params.row.backupWarehouseId === n.warehouseId
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
          key: 'orderUnconfig',
          align: 'center',
          title: '订单未配货',
          render: (h, params) => {
            if (params.row.orderUnconfig !== null && params.row.orderUnconfig !== '') {
              return h('span', params.row.orderUnconfig);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'onWayQuantity',
          align: 'center',
          title: '在途库存',
          render: (h, params) => {
            if (params.row.onWayQuantity !== null && params.row.onWayQuantity !== '') {
              return h('span', params.row.onWayQuantity);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'availableStock',
          align: 'center',
          title: '可用库存',
          render: (h, params) => {
            if (params.row.availableStock !== null && params.row.availableStock !== '') {
              return h('span', params.row.availableStock);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'proposedQuantity',
          align: 'center',
          title: '建议数量',
          render: (h, params) => {
            if (params.row.proposedQuantity !== null && params.row.proposedQuantity !== '') {
              return h('span', params.row.proposedQuantity);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'replenishQuantity',
          align: 'center',
          title: '备货数量',
          width: 140,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.stockData[params.index].replenishQuantity,
                min: 1
              },
              on: {
                'on-change': (val) => {
                  params.row.replenishQuantity = val;
                  self.stockData[params.index] = params.row;
                }
              }
            });
          }
        }, {
          key: 'purchaserName',
          align: 'center',
          title: '采购员',
          render: (h, params) => {
            if (params.row.purchaserName !== null && params.row.purchaserName !== '') {
              return h('span', params.row.purchaserName);
            } else {
              return h('span', '-');
            }
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
          key: 'backupWarehouseName ',
          align: 'center',
          title: '补货仓库',
          render: (h, params) => {
            if (params.row.backupWarehouseName) {
              return h('span', params.row.backupWarehouseName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'createdTime',
          align: 'center',
          title: '移入时间',
          render: (h, params) => {
            if (params.row.createdTime) {
              return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'remark',
          align: 'center',
          width: 300,
          title: '原因备注'
        }, {
          key: 'operation',
          align: 'center',
          width: 200,
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'dashed'
              },
              on: {
                click: () => {
                  let suggestExcludeIds = [];
                  suggestExcludeIds.push(params.row.suggestExcludeId);
                  self.removeFn(suggestExcludeIds);
                }
              }
            }, '移出');
          }
        }
      ], /* option: {
       tooltip: {
       trigger: 'axis'
       },
       grid: {
       left: '0%',
       right: '0%',
       bottom: '0%',
       containLabel: true
       },
       xAxis: {
       type: 'category',
       data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Sun', 'Sun', 'Sun']
       },
       yAxis: {
       type: 'value'
       },
       series: [
       {
       name:'销量',
       type:'line',
       data:[120, 132, 101, 134, 90, 230, 210, 222, 230, 250]
       }
       ]
       }, */
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
      this.$refs['pageParams'].resetFields();
      this.isCalStock = false;
      this.currentTabItem = '1';
      this.calculateTime = '';
      this.selectionArr = [];
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
      v.axios.post(api.suggestCalc + '?suggestType=3').then(res => {
        if (res.data.code == 0) {
          v.getList();
        }
        v.isCalStock = true;
      });
    },
    addPurchaseOrder () {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.warning('请选择备货建议！！');
      } else {
        /* 必须设置中转仓 */
        let valid = true;
        v.selectionArr.forEach(item => {
          if ((item.purchaseWarehouseId === '' || item.purchaseWarehouseId === null) && item.warehouseType === '1') {
            valid = false;
          }
        });
        if (!valid) {
          v.$Message.error('所选项必须设置中转仓');
          return;
        }
        let newArr = v.deepCopy(v.selectionArr);
        let noSettingTransWh = false;
        let isDiffType = false;
        let isDiffPurchaseWh = false;
        let isDiffSupplier = false;
        let isNormalOrder = false; // 普通订单标记
        let isAlibabaOrder = false; // 1688订单标记
        let type = 1;
        newArr.forEach((n, i) => {
          v.$set(n, 'unitPrice', 0);
          if (n.warehouseType == 2 && !n.purchaseWarehouseId) { // 海外仓备货建议未设置采购仓(中转仓)
            noSettingTransWh = true;
          }
          if (n.relationPlatform) { // 1688订单
            isAlibabaOrder = true;
          } else { // 非1688订单
            isNormalOrder = true;
          }
          v.selectionArr.forEach((m, j) => {
            if (n.warehouseType !== m.warehouseType) { // 存在不同仓库类型的备货建议
              isDiffType = true;
            }
            if (n.purchaseWarehouseId !== m.purchaseWarehouseId) { // 存在不同采购仓库的备货建议
              isDiffPurchaseWh = true;
            }
            if (n.supplierId !== m.supplierId) { // 存在不同供应商的备货建议
              isDiffSupplier = true;
            }
          });
        });
        if (noSettingTransWh) {
          v.$Message.error('海外仓库未设置中转仓！');
          return;
        }
        if (isDiffType) {
          v.$Message.error('不同的备货仓库类型不能同时下单！');
          return;
        }
        if (isDiffPurchaseWh) {
          v.$Message.error('不同的采购仓库不能同时下单！');
          return;
        }
        if (isDiffSupplier) {
          v.$Message.error('不同的供应商不能同时下单！');
          return;
        }
        v.addOrderLoading = true;
        if (isNormalOrder && !isAlibabaOrder) { // 判断是普通下单、1688下单、混合下单
          type = 1;
        } else if (!isNormalOrder && isAlibabaOrder) {
          type = 2;
        } else if (isNormalOrder && isAlibabaOrder) {
          type = 3;
        }
        let obj = {
          detailsResultList: newArr,
          discountAmount: 0,
          freightCharge: 0,
          purchaseWarehouseId: newArr[0].purchaseWarehouseId,
          backupWarehouseId: newArr[0].backupWarehouseId,
          purchaserId: newArr[0].purchaserId,
          supplierId: newArr[0].supplierId,
          totalAmount: 0,
          totalPrice: 0,
          type: type,
          status: 1,
          updateSupplierFlag: 0,
          updateQuoteFlag: 0
        };
        v.axios.post(api.suggestSavePurchase, obj).then(res => {
          if (res.data.code == 0) {
            v.$Message.success('操作成功！');
            v.getList();
          }
          v.addOrderLoading = false;
        });
      }
    },
    settingWarehouseFn () {
      if (this.selectionArr.length == 0) {
        this.$Message.error('请选择需要设置中转仓的备货建议！！');
      } else {
        this.isShowSettingWarehouse = true;
        /* let isExistLc = this.selectionArr.some(item => item.suggestType !== 1)
         if(isExistLc) {
         this.$Message.error('本地仓不需设置中转仓')
         return
         } else {
         this.isShowSettingWarehouse = true
         } */
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
          });
        }
      });
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
    removeFn (arr) {
      let v = this;
      v.axios.post(api.suggestRemoveExclude, arr).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('操作成功！');
          v.pageParamsStatus = true;
        }
      });
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
        v.removeFn(suggestExcludeIds);
      }
    },
    intiBaseDataList () {
      let v = this;
      v.axios.post(api.warehouse, { pageNum: 1 }).then(res => {
        if (res.data.code == 0) {
          v.transWarehouseArr = [];
          v.warehouseArr = [];
          res.data.datas.forEach((n, i) => {
            v.warehouseArr.push(n);
            if (n.warehouseType == '0') {
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
