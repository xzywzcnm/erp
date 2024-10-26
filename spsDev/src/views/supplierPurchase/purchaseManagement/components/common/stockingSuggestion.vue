<style scoped >
.submitTopBtnWrapper {
  position: absolute;
  top: 20px;
  right: 100px;
}

.order1688 {
  text-align: right;
  vertical-align: middle;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.statistical {
  padding: 10px 5px;
  font-weight: 600;
}
</style>
<template>
  <div >
    <div class="submitTopBtnWrapper" >
      <Button type="primary" class="mr20" :loading="submitLoading" @click="submitAction('plans')" >提交</Button >
      <Button type="primary" @click="cancelAction" >取消</Button >
    </div >
    <Form ref="plans" :model="plans" :label-width="80" :rules="ruleValidate" >
      <div class="supplierTabsBar" >
        <Tabs v-model="plans.currentTabItem" @on-click="showCurrentPage" >
          <TabPane
              v-for="(item) in plans.planTabItems"
              :label="item.value"
              :key="item.key"
              :name="String(item.key)" ></TabPane >
        </Tabs >
        <Row type="flex" justify="start" class="code-row-bg" >
          <Col :span="5" >
            <FormItem label="提交人：" prop="createdByName" >
              {{ plans.planDatas[Number(plans.currentTabItem) - 1].createdByName }}
            </FormItem >
          </Col >
          <Col :span="5" :offset="1" >
            <FormItem label="备货仓库：" prop="backupWarehouseName" >
              <Input
                  v-model="plans.planDatas[Number(plans.currentTabItem) - 1].backupWarehouseName"
                  :disabled="true" ></Input >
            </FormItem >
          </Col >
          <Col :span="5" :offset="1" >
            <FormItem label="中转仓库：：" prop="purchaseWarehouseId" >
              <dyt-select v-model="plans.planDatas[Number(plans.currentTabItem) - 1].purchaseWarehouseId" :disabled="true" >
              <Option
                  v-for="(item,index) in purchaseWarehouseArr"
                  :disabled="item.warehouseStatus === '1'"
                  :value="item.warehouseId"
                  :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
            </FormItem >
          </Col >
        </Row >
        <div >
          <Table highlight-row :border="false" :columns="planColumn" :data="proList" :height="tableHeight" ></Table >
        </div >
        <div class="clear statistical" >
          <div class="fl" >
            <span class="mr10" >货品种类数：</span >
            <span class="mr20" >{{ plans.planDatas[Number(plans.currentTabItem) - 1].planDetailsList.length }}</span >
            <span
                class="mr10" >货品总数量：</span > <span class="mr20" >{{ totalQty }}</span >
          </div >
          <div class="fr" >
            <span class="mr10" >
              预计总金额：
            </span > <span class="mr20" >
              {{ totalPrice }}
            </span >
          </div >
        </div >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <Page
                :total="plans.planDatas[Number(plans.currentTabItem) - 1].planDetailsList.length"
                @on-change="proChangePage"
                show-total
                :page-size="proPage.pageSize"
                show-elevator
                :current="proPage.pageNum"
                show-sizer
                @on-page-size-change="proChangePageSize"
                placement="top"
                :page-size-opts="pageArray" ></Page >
          </div >
        </div >
        <div class="normalTop20" >
          <FormItem label="补货备注：" >
            <Input
                v-model="plans.planDatas[Number(plans.currentTabItem) - 1].remark"
                type="textarea"
                :rows="4"
                style="width:600px;" ></Input >
          </FormItem >
        </div >
      </div >
    </Form >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['planDatas', 'planTabItems', 'source'],
  mixins: [Mixin],
  data () {
    var self = this;
    return {
      tableHeight: self.getTableHeight(460),
      submitLoading: false,
      purchaseWarehouseArr: [],
      plans: {
        currentTabItem: '1',
        planTabItems: [],
        planDatas: []
      },
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      planColumn: [
        {
          key: 'goodsThumbUrl',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return self.tableImg(h, params, 'thumbUrl');
          }
        }, {
          key: 'skuNo',
          align: 'center',
          width: 160,
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
          key: 'priceDetailsList',
          align: 'center',
          title: '供应商报价',
          render: (h, params) => {
            if (params.row.priceDetailsList && params.row.priceDetailsList.length > 0) {
              let content = [];
              params.row.priceDetailsList.forEach((n, i) => {
                content.push(h('span', n + ' ' + params.row.currency));
                if (params.row.priceDetailsList.length - i > 1) {
                  content.push(h('br'));
                }
              });
              return h('div', content);
            } else {
              return h('span', '-');
            }
          }
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
          width: 140,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.proList[params.index].replenishQuantity,
                min: 1
              },
              on: {
                'on-change': (val) => {
                  self.proList[params.index].replenishQuantity = val;
                  self.plans.planDatas[Number(self.plans.currentTabItem) - 1].planDetailsList.forEach((n, i) => {
                    if (n.suggestId == params.row.suggestId) {
                      self.plans.planDatas[Number(self.plans.currentTabItem) - 1].planDetailsList[i].replenishQuantity = val;
                    }
                  });
                }
              }
            });
          }
        }, {
          key: 'purchaserName',
          align: 'center',
          title: '采购员'
        }, {
          key: 'operation',
          align: 'center',
          width: 100,
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'dashed'
              },
              on: {
                click: () => {
                  let index = Number(self.plans.currentTabItem) - 1;
                  self.plans.planDatas[index].planDetailsList.forEach((n, i) => {
                    if (n.goodsId == params.row.goodsId) {
                      self.plans.planDatas[index].planDetailsList.splice(i, 1);
                      self.getProlist();
                    }
                  });
                }
              }
            }, '删除');
          }
        }
      ],
      ruleValidate: {
        transWarehouse: [
          {
            required: true,
            message: '不能为空',
            trigger: 'change'
          }
        ]
      }
    };
  },
  created () {
    let v = this;
    v.plans.planDatas = v.deepCopy(v.planDatas);
    v.plans.planTabItems = v.deepCopy(v.planTabItems);
    v.getWarehouse();
    v.getProlist();
  },
  computed: {
    totalQty () {
      let v = this;
      let num = 0;
      v.plans.planDatas[Number(v.plans.currentTabItem) - 1].planDetailsList.forEach((n, i) => {
        num += Number(n.replenishQuantity);
      });
      return num;
    },
    totalPrice () {
      let v = this;
      let amount = 0;
      v.plans.planDatas[Number(v.plans.currentTabItem) - 1].planDetailsList.forEach((n, i) => {
        let unitPrice = v.getUnitPrice(n.replenishQuantity, n.priceDetailsList);
        amount += unitPrice * n.replenishQuantity;
      });
      return amount.toFixed(2);
    }
  },
  methods: {
    getWarehouse () {
      let v = this;
      v.axios.post(api.warehouse, {
        pageNum: 1,
        warehouseType: 0
      }).then(res => { // 本地仓
        if (res.data.code == 0) {
          v.purchaseWarehouseArr = [];
          res.data.datas.forEach((n, i) => {
            if (n.warehouseType === '0') {
              v.purchaseWarehouseArr.push(n);
            }
          });
        }
      });
    },
    showCurrentPage () {
      this.proPage.pageNum = 1;
      this.proPage.pageSize = 10;
      this.getProlist();
    },
    proChangePageSize (pageSize) {
      this.proPage.pageSize = pageSize;
      this.getProlist();
    },
    proChangePage (page) {
      this.proPage.pageNum = page;
      this.getProlist();
    },
    getProlist () { // 获取分页数据
      let v = this;
      let start = (v.proPage.pageNum - 1) * v.proPage.pageSize; // 起始坐标
      let end = (v.proPage.pageNum * v.proPage.pageSize) < v.plans.planDatas[Number(v.plans.currentTabItem) - 1].planDetailsList.length
                ? (v.proPage.pageNum * v.proPage.pageSize)
                : v.plans.planDatas[Number(v.plans.currentTabItem) - 1].planDetailsList.length; // 结束坐标，如果结束坐标大于数组长度，改为数组的长度
      v.proList = v.plans.planDatas[Number(v.plans.currentTabItem) - 1].planDetailsList.slice(start, end);
    },
    delFn (index) {
      let v = this;
      v.proList.splice(index, 1);
    },
    cancelAction () { // 取消
      this.$emit('addPlanGoBack', this.$store.state.thisPage);
    },
    submitAction (name) {
      let v = this;
      let list = [];
      let qtyIsNull = false;
      v.plans.planDatas.forEach((n, i) => {
        n.planDetailsList.forEach((m, j) => {
          v.$set(m, 'unitPrice', v.getUnitPrice(m.replenishQuantity, m.priceDetailsList));
          if (m.replenishQuantity === 0 || m.replenishQuantity === null) {
            list.push('备货计划' + (i + 1));
            qtyIsNull = true;
          }
        });
      });
      if (qtyIsNull) {
        let content = list.join('、');
        v.$Message.warning({
          content: content + ', ' + '备货数量不能为空，也不能为0',
          duration: 5,
          closable: true
        });
      } else {
        v.submitLoading = true;
        v.$refs[name].validate((valid) => { // 校验通过后执行
          if (valid) {
            v.axios.post(api.suggestSavePlan, v.plans.planDatas).then(res => {
              if (res.data.code == 0) {
                v.$Message.success('保存成功');
                v.$emit('addPlanGoBack', v.$store.state.thisPage);
              }
              v.submitLoading = false;
            });
          }
        });
      }
    }
  }
};
</script >
