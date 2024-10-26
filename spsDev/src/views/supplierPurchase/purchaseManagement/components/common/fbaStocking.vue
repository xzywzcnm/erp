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

.tit {
  font-size: 14px;
  padding: 5px 10px;
  background-color: rgba(204, 204, 204, 0.498039215686275)
}
</style>
<template >
  <div >
    <div class="submitTopBtnWrapper" >
      <template >
        <Button type="primary" class="mr10" @click="submitAction('planData')" :loading="submitLoading" >提交</Button >
      </template >
      <Button type="default" @click="cancelAction" >关闭</Button >
    </div >
    <Form ref="planData" :model="planData" :label-width="120" :rules="ruleValidate" >
      <div class="supplierTabsBar" >
        <div class="tit" >
          平台备货信息
        </div >
        <Row type="flex" justify="start" class="normalTop" >
          <Col :span="7" >
            <FormItem label="创建人：" prop="createdName" >
              <span >{{ planData.createdName }}</span >
            </FormItem >
          </Col >
          <!--<Col :span="7" :offset="1">-->
          <!--<FormItem label="Shipment Name：" prop="shipmentName">-->
          <!--<Input v-model="planData.shipmentName"></Input>-->
          <!--</FormItem>-->
          <!--</Col>-->
          <Col :span="7" >
            <FormItem label="中转仓库：" prop="purchaseWarehouseId" >
              <dyt-select v-model="planData.purchaseWarehouseId" > <Option
                  v-for="(item,index) in transferWarehouseArr"
                  :disabled="item.warehouseStatus === '1'"
                  :value="item.warehouseId"
                  :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
            </FormItem >
          </Col >
          <Col :span="7" :offset="1" >
            <FormItem label="备货店铺：" prop="purchaseWarehouseId" >
              <dyt-select v-model="planData.purchaseWarehouseId" > <Option
                  v-for="(item,index) in transferWarehouseArr"
                  :disabled="item.warehouseStatus === '1'"
                  :value="item.warehouseId"
                  :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
            </FormItem >
          </Col >
        </Row >
        <!--<Row type="flex" justify="start">-->
        <!--<Col :span="7">-->
        <!--<FormItem label="中转仓库：" prop="purchaseWarehouseId">-->
        <!--<dyt-select v-model="planData.purchaseWarehouseId">-->
        <!--<Option v-for="(item,index) in transferWarehouseArr" :value="item.warehouseId" :key="index">{{item.warehouseName}}</Option>-->
        <!--</dyt-select>-->
        <!--</FormItem>-->
        <!--</Col>-->
        <!--<Col :span="7" :offset="1">-->
        <!--<FormItem label="目标市场：" prop="shipmentName">-->
        <!--<Input v-model="planData.shipmentName"></Input>-->
        <!--</FormItem>-->
        <!--</Col>-->
        <!--<Col :span="7" :offset="1">-->
        <!--<FormItem label="包装类型：" prop="packageType">-->
        <!--<RadioGroup v-model="planData.packageType">-->
        <!--<Radio label="1">-->
        <!--<span>混装发货</span>-->
        <!--</Radio>-->
        <!--<Radio label="2">-->
        <!--<span>原包装发货</span>-->
        <!--</Radio>-->
        <!--</RadioGroup>-->
        <!--</FormItem>-->
        <!--</Col>-->
        <!--&lt;!&ndash; <template v-if="plansType!='1'">-->
        <!--<Col :span="2" :offset="1">-->
        <!--<Button type="dashed" @click="operationLogFn">操作日志</Button>-->
        <!--</Col>-->
        <!--</template> &ndash;&gt;-->
        <!--</Row>-->
        <div class="tit" >
          商品信息
        </div >
        <div class="normalTop" >
          <Button type="primary" class="iconbuttons" @click="chooseSkuFn" :loading="addSkuLoading" >
            添加商品 </Button >
        </div >
        <div class="normalTop" >
          <Table highlight-row :border="false" :columns="planColumn" :data="proList" :height="tableHeight" ></Table >
        </div >
        <div class="clear statistical" >
          <div class="fl" >
            <span class="mr10" >货品种类数：</span > <span class="mr20" >{{ planData.planDetailsList.length }}</span > <span
              class="mr10" >货品总数量：</span > <span class="mr20" >{{ totalQty }}</span >
          </div >
          <div class="fr" v-if="totalPrice !== null" >
            <span class="mr10" >
              总金额：
            </span > <span class="mr20" >
              {{ totalPrice }}
            </span >
          </div >
        </div >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <Page
                :total="planData.planDetailsList.length"
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
        <div class="normalTop" >
          <FormItem label="备货备注" prop="remark" >
            <!--<Input v-model="planData.remark" type="textarea" :rows="4" style="width: 600px;" :disabled="!isEdit"></Input>-->
            <Input v-model="planData.remark" type="textarea" :rows="4" style="width: 600px;" :maxlength="500"></Input >
          </FormItem >
        </div >
      </div >
    </Form >
    <!--操作日志-->
    <Modal v-model="isShowOperationLog" :width="820" title="操作日志" >
      <div class="supplierTabsBar" >
        <Table
            ref="hisPriceTable"
            highlight-row
            border
            :loading="Tableloading"
            :columns="operationLogColumn"
            :data="operationLogData" ></Table >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <Page
                :total="operationLog.total"
                @on-change="logChangePage"
                show-total
                :page-size="operationLog.pageSize"
                show-elevator
                :current="operationLog.pageNum"
                show-sizer
                @on-page-size-change="logChangePageSize"
                placement="top"
                :page-size-opts="pageArray" ></Page >
          </div >
        </div >
      </div >
      <div slot="footer" >
        <Button type="primary" @click="isShowOperationLog = false" size="large" style="width: 120px;" >关闭</Button >
      </div >
    </Modal >
    <!--添加商品-->
    <div v-if="isShowAddPro" >
      <Modal
          v-model="isShowAddPro"
          :width="1100"
          title="添加商品"
          :styles="{top: '50px'}"
          :mask-closable="false"
          class='addProductModal1 headerBar addProductBar' >
        <addProduct
            :disabledSlt='false'
            :from='true'
            @addProductSuccess='addProductSuccess'
            @addProductCancel='addProductCancel'
            :eliminateData='proData' ></addProduct >
      </Modal >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['plansType', 'isEdit'],
  mixins: [Mixin],
  data () {
    var self = this;
    return {
      submitLoading: false,
      verifyLoading_3: false,
      verifyLoading_1: false,
      verifyLoading_4: false,
      isShowOperationLog: false, // 操作日志
      addSkuLoading: false,
      isShowAddPro: false, // 添加商品
      proData: [],
      tableHeight: self.getTableHeight(480),
      planData: {
        suggestType: 2,
        backupWarehouseType: '2',
        createdName: this.$store.state.userName || sessionStorage.getItem('userName') || '',
        shipmentName: '2019-02-20  15:15:15',
        packageType: '1',
        purchaseWarehouseId: '',
        purchaseWarehouseName: '',
        backupWarehouseId: '',
        backupWarehouseName: '',
        remark: '',
        planDetailsList: [],
        skuQuantity: 0,
        estimatedAmount: 0
      },
      warehouseArr: [],
      transferWarehouseArr: [],
      proList: [],
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
          key: 'purchaserName',
          align: 'center',
          title: 'ASIN',
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h('span', params.row.purchaserName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'purchaserName',
          align: 'center',
          title: '日均销量',
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h('span', params.row.purchaserName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'purchaserName',
          align: 'center',
          title: '建议数量',
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h('span', {
                style: {
                  color: 'red'
                }
              }, params.row.purchaserName);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'priceDetailsList',
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
          key: 'replenishQuantity',
          align: 'center',
          title: '备货数量',
          width: 140,
          render: (h, params) => {
            return [
              h('span', {
                style: {
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  width: '65%'
                }
              }, [
                h('InputNumber', {
                  props: {
                    value: self.proList[params.index].replenishQuantity,
                    min: 1,
                    max: 99999999 // disabled: !self.isEdit
                  },
                  style: {
                    width: '100%'
                  },
                  on: {
                    'on-change': (val) => {
                      self.proList[params.index].replenishQuantity = val;
                      self.proList[params.index].unitPrice = self.getUnitPrice(val, params.row.priceDetailsList);
                      self.planData.planDetailsList.forEach((n, i) => {
                        if (n.goodsId == params.row.goodsId) {
                          self.planData.planDetailsList[i].replenishQuantity = val;
                          self.planData.planDetailsList[i].unitPrice = self.proList[params.index].unitPrice;
                        }
                      });
                    }
                  }
                })
              ])
            ];
          }
        }, {
          key: 'purchaserName',
          align: 'center',
          title: '采购员',
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h('span', params.row.purchaserName);
            } else {
              return h('span', '-');
            }
          }
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
                  self.proList.splice(params.index, 1);
                  self.planData.planDetailsList.forEach((n, i) => {
                    if (n.goodsId == params.row.goodsId) {
                      self.planData.planDetailsList.splice(i, 1);
                    }
                  });
                }
              }
            }, '删除');
          }
        }
      ],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      operationLog: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
        supplierId: ''
      },
      operationLogColumn: [
        {
          key: 'operatorName',
          align: 'center',
          title: '操作人'
        }, {
          key: 'content',
          align: 'center',
          title: '操作内容',
          width: 400
        }, {
          key: 'createdTime',
          align: 'center',
          title: '操作日期',
          render: (h, params) => {
            return ('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }
      ],
      operationLogData: [], // 操作日志数据
      ruleValidate: {
        transWarehouse: [
          {
            required: true,
            message: '不能为空',
            trigger: 'change'
          }
        ],
        backupWarehouseId: [
          {
            required: true,
            message: '不能为空',
            trigger: 'change'
          }
        ],
        purchaseWarehouseId: [
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
    // v.planData = v.deepCopy(v.plans)
    v.getBaseDatas();
    v.getProlist();
  },
  computed: {
    totalQty () {
      let v = this;
      let num = 0;
      v.planData.planDetailsList.forEach((n, i) => {
        num += Number(n.replenishQuantity);
      });
      return num;
    },
    totalPrice () {
      let v = this;
      let amount = 0;
      // let diffCurrency = false;
      let hasPrice = v.planData.planDetailsList.some(item => !item.priceDetailsList || item.priceDetailsList.length == 0); // 是否有报价
      v.planData.planDetailsList.forEach((n, i) => {
        let unitPrice = v.getUnitPrice(n.replenishQuantity, n.priceDetailsList);
        amount += unitPrice * n.replenishQuantity;
        // v.planData.planDetailsList.forEach((m, j) => { // 判断是否存在不同币种的商品
        //   if (i != j && n.currency !== m.currency) {
        //     diffCurrency = true;
        //   }
        // });
      });
      return hasPrice ? null : amount.toFixed(2);
    }
  },
  methods: {
    getBaseDatas () { // 获取备货仓库和中转仓库
      let v = this;
      v.warehouseArr = [];
      v.transferWarehouseArr = [];
      v.axios.post(api.warehouse, { pageNum: 1 }).then(res => {
        if (res.data.code == 0) {
          res.data.datas.forEach((n, i) => {
            if (v.planData.backupWarehouseType == '0') {
              if (n.warehouseType === '0') {
                v.warehouseArr.push(n);
              }
            } else if (v.planData.backupWarehouseType == '2') {
              if (n.warehouseType === '0') {
                v.transferWarehouseArr.push(n);
              } else if (n.warehouseType === '1') {
                v.warehouseArr.push(n);
              }
            }
          });
        }
      });
    },
    getProlist () { // 获取分页数据
      let v = this;
      let start = (v.proPage.pageNum - 1) * v.proPage.pageSize; // 起始坐标
      let end = (v.proPage.pageNum * v.proPage.pageSize) < v.planData.planDetailsList.length
                ? (v.proPage.pageNum * v.proPage.pageSize)
                : v.planData.planDetailsList.length; // 结束坐标，如果结束坐标大于数组长度，改为数组的长度
      v.proList = v.planData.planDetailsList.slice(start, end);
    },
    operationLogFn () {
      let v = this;
      let obj = {
        pageNum: 1,
        businessId: v.planData.planId
      };
      v.Tableloading = true;
      v.axios.post(api.planLogList, obj).then(res => {
        v.Tableloading = false;
        if (res.data.code == 0) {
          v.operationLogData = res.data.datas.list;
        }
        v.isShowOperationLog = true;
      });
    },
    proChangePageSize (pageSize) {
      this.proPage.pageSize = pageSize;
      this.getProlist();
    },
    proChangePage (page) {
      this.proPage.pageNum = page;
      this.getProlist();
    },
    logChangePageSize (pageSize) {
      this.operationLog.pageSize = pageSize;
    },
    logChangePage (page) {
      this.operationLog.pageNum = page;
    },
    chooseSkuFn () {
      this.isShowAddPro = true;
    },
    addProductCancel () {
      this.isShowAddPro = false;
    },
    addProductSuccess (data) {
      let v = this;
      let arr = [];
      data.forEach((n, i) => {
        let isExist = false;
        v.planData.planDetailsList.forEach((m, j) => {
          if (n.productGoodsId == m.goodsId) { // 如果该商品存在，数量+1
            v.planData.planDetailsList[j].replenishQuantity += 1;
            isExist = true;
          }
        });
        if (!isExist) { // 如果该商品不存在，新增一条数据
          arr.push({
            cnName: n.cnName,
            goodsId: n.productGoodsId,
            goodsUrl: n.goodsUrl,
            sku: n.sku
          });
        }
      });
      if (arr.length > 0) {
        v.axios.post(api.planQueryGoodsInfo, arr).then(res => {
          if (res.data.datas && res.data.datas.length > 0) {
            res.data.datas.forEach((n, i) => {
              n.unitPrice = v.getUnitPrice(1, n.priceDetailsList); // 默认备货数量为1
              v.planData.planDetailsList.push(Object.assign(n, { replenishQuantity: 1 }));
            });
            v.getProlist();
          }
        });
      }
      v.isShowAddPro = false;
    },
    cancelAction () { // 取消
      this.$emit('addPlanGoBack', this.$store.state.thisPage);
    },
    verify (type) { // 1:审核驳回，2：审核通过
      let v = this;
      v['verifyLoading_' + type] = true;
      v.planData.status = type;
      v.axios.post(api.planAudit, v.planData).then(res => {
        v['verifyLoading_' + type] = false;
        if (res.data.code == 0) {
          let str = type == 1 ? '审核驳回成功！' : type == 3 ? '审核通过！' : '';
          v.$Message.success(str);
          v.$emit('addPlanGoBack', this.$store.state.thisPage);
        }
      });
    },
    submitAction (name) {
      let v = this;
      if (v.planData.planDetailsList.length == 0) {
        v.$Message.error('请添加商品！');
        return;
      }
      v.$refs[name].validate((valid) => { // 校验通过后执行
        if (valid) {
          v.submitLoading = true;
          v.axios.post(api.planSubmit, v.planData).then(res => {
            v.submitLoading = false;
            if (res.data.code == 0) {
              v.$Message.success('提交成功');
              v.$emit('addPlanGoBack', v.$store.state.thisPage);
            }
          });
        }
      });
    }
  }
};
</script >
