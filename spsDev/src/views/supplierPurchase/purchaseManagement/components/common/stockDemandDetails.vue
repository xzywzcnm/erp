<template>
    <div>
        <Form ref="stockDemandForm" :model="stockDemandForm" :label-width="100" :rules="stockDemandRules">
            <Row>
              <Col :span="6">
                <FormItem label="备货需求编号:">
                  <div>
                  {{ stockDemandForm.stockRequirementNo }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="18">
                <FormItem label="备货计划编号:">
                  <div>
                  {{ stockDemandForm.planSerialNumber }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="备货仓库:" prop="backupWarehouseName">
                {{ stockDemandForm.backupWarehouseName  }}
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="所属事业部:">{{ businessDept }}</FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="创建人:">{{ stockDemandForm.createdName }}</FormItem>
              </Col>
              <Col :span="24">
                <FormItem label="备货需求备注:">
                    <div>
                    {{ stockDemandForm.remark }}
                    </div>
                </FormItem>
              </Col>
              <Col :span="24">
                <FormItem label="备货需求审核意见:"  :label-width="120">
                  <div v-if="demandData.type == 'audit'">
                    <Input
                    type="textarea"
                    v-model="stockDemandForm.checkRemark"
                    :rows="4"
                    class="demandTextareaContent"
                    :maxlength="300"
                    show-word-limit
                  ></Input>
                  </div>
                  <div v-else>
                   {{ stockDemandForm.checkRemark }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="24">
                <div class="ml20">商品信息: SKU总数量: {{ stockDemandForm.stockRequirementDetailList.length }}, 商品总数量: {{ goodsNum }}</div>
              </Col>
              <Col :span="24">
              </Col>
              <Col :span="24">
                <div class="normalTop">
                <Table
                  highlight-row
                  :border="true"
                  :columns="goodsColumn"
                  :data="stockDemandForm.stockRequirementDetailList"
                  :height="tableHeight"
                  class="demandDetailsStyle"
                >
                <template slot-scope="{ row }" slot="checkStockRequirementNumber">
                  <div class="mt10" v-if="demandData.type == 'audit' && row.flag">
                    <FormItem 
                    :label-width="0"
                    :prop="'stockRequirementDetailList.' + row._index + '.checkStockRequirementNumber'"
                    :rules="{ 
                      required: true, validator: (rule, value, callback) => {checkAgreeNum(rule, value, callback, row._index)}
                      , trigger: 'change' }"
                    >
                      <InputNumber 
                      v-model="stockDemandForm.stockRequirementDetailList[row._index].checkStockRequirementNumber" 
                      :min="0" 
                      :precision="0">
                      </InputNumber>
                    </FormItem>
                  </div>
                  <div v-else>
                    {{ row.checkStockRequirementNumber }}
                  </div>
                </template>
                <template slot-scope="{ row }" slot="remark">
                  <div class="mt10">
                    <FormItem 
                    :label-width="0"
                    :prop="'stockRequirementDetailList.' + row._index + '.remark'"
                    :rules="{ 
                      validator: (rule, value, callback) => {remarkValidator(rule, value, callback, row._index, demandData.type !== 'audit' || !row.flag)}
                      , trigger: 'change' }"
                    >
                      <Input
                        :disabled="demandData.type !== 'audit' || !row.flag"
                        type="textarea"
                        :rows="3"
                        v-model="stockDemandForm.stockRequirementDetailList[row._index].remark"
                      />
                    </FormItem>
                  </div>
                </template>
                </Table>
              </div>
              </COl>
            </Row>
        </Form>
        <!-- 操作日志 -->
        <div>
          <div style="display: flex" class="mt20 mb10">
            <div style="width: 4px; height: 20px; background: #2c74f6"></div>
            <span class="ml10" style="font-size: 18px; font-weight: 700">操作日志</span>
          </div>
        </div>
        <Row>
          <Col :span="24" class="mt20">
          <Table border :columns="logColumns" :data="stockDemandForm.stockRequirementLogBaseList" :loading="loading" max-height="450">
          </Table>
          </Col>
        </Row>
    </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
export default {
  mixins: [ Mixin ],
  props: {
    demandData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    createByArr: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      authInfo: this.$store.state.authUserInfo,
      stockDemandForm: {
        backupWarehouseId: null,
        backupWarehouseType: null,
        backupWarehouseName: null,
        status: null,
        businessDeptId: null,
        remark: null,
        stockRequirementDetailList: [],
        checkRemark: null
      },
      loading: false,
      tableHeight: this.getTableHeight(480),
      stockDemandRules: {
        backupWarehouseId: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      },
      goodsColumn: [
        {
          key: 'image',
          title: '图片',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'thumbUrl')
          }
        },
        {
          key: 'productSpu',
          title: 'SPU',
          align: 'center',
          width: 150
        },
        {
          key: 'productSku',
          title: 'SKU',
          align: 'center',
          width: 150
        },
        {
          key: 'goodsInfo',
          title: '商品信息',
          align: 'center',
          render: (h, params) => {
            //  处理-规格
            let spec = ''
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications
            }
            //  处理-商品状态
            let goodsStatusMap = {
              0:'停售',
              1:'在售',
              2:'试卖', 
              3:'清仓',
            }
            return [
              h('div', {}, params.row.goodsName),
              h('div', {
                style: {
                  color: '#008000'
                }
              }, spec),
              h('div', {}, this.$common.isEmpty(params.row.status) ? '' : goodsStatusMap[params.row.status] )
            ]
          }
        },
        {
          key: 'stockRequirementNumber',
          title: '备货需求数量',
          width: 110,
          align: 'center',
        },
        {
          key: 'stockRequirementReason',
          title: '备货需求原因',
          align: 'center',
          width: 240,
          render: (h, params) => {
            return h('Tooltip',{
              props: {
                content: params.row.stockRequirementReason,
                maxWidth: 300,
                transfer: true
              }
            } , [
              h('div', {
                style: {
                  width: '200px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }
              },params.row.stockRequirementReason)
            ])
          }
        },
        {
          key: 'checkStockRequirementNumber',
          title: '实际备货需求数量',
          align: 'center',
          width: 150,
          slot: 'checkStockRequirementNumber'
        },
        {
          key: 'voidedQuantity',
          title: '作废数量',
          align: 'center',
          width: 90
        },
        {
          key: 'purchaseNumberList',
          title: '采购单号',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', {}, this.$common.isEmpty(params.row.purchaseNumberList) ? ''  : params.row.purchaseNumberList.map(item => {
              return h('div', {}, item)
            }))
          }
        },
        {
          key: 'remark',
          title: '备注',
          align: 'center',
          width: 250,
          slot: 'remark'
        },
      ],
      logColumns: [
        {
          key: "updatedBy",
          title: "操作人", // 操作人
          width: 100,
          render: (h, params) => {
            let createdName = "";
            this.createByArr.forEach((item) => {
              if (item.id === params.row.createdBy) {
                createdName = item.name;
              }
            });
            return h("span", {}, createdName);
          },
        },
        {
          key: "logContentDesc",
          title: "操作内容描述", // 操作内容描述
          minWidth: 230,
          render(h, params) {
            if (params.row.logTypeDesc === "10") {
              return h("span", "备注" + "：" + params.row.logContentDesc);
            } else {
              return h("span", params.row.logContentDesc);
            }
          },
        },
        {
          key: "updatedTime",
          title: "操作时间", // 操作时间
          width: 160,
          align: "center",
          render: (h, params) => {
            return h("div", {}, params.row.createdTime);
          },
        },
      ],
      goodsNum: 0
    }
  },
  watch: {
    demandData: {
      handler(newVal, oldVal) {
        this.stockDemandForm = newVal
      },
      deep: true,
      immediate: true,
    },
    'stockDemandForm.stockRequirementDetailList': {
      handler(newVal, oldVal) {
        let goodsNum = 0
        goodsNum = newVal.reduce((pre, next) => {
          return pre + next.stockRequirementNumber
        },0)
        this.$nextTick(() => {
          this.goodsNum = goodsNum
        })
      },
      deep: true,
      immediate: true,
    }
  },
  computed: { 
    userInfo () {
      return this.$store.state.userInfo;
    },
    businessDept () {
      let businessDeptInfo = {};
      if (this.$common.isEmpty(this.$store.getters["businessDeptList"])) return businessDeptInfo;
      this.$store.getters["businessDeptList"].forEach(item => {
        businessDeptInfo[item.id] = item;
      })
      return businessDeptInfo[this.stockDemandForm.businessDeptId].name;
    },
  },
  methods: {
    checkAgreeNum(rule, value, callback, index) {
      this.$nextTick(() => {
        if(this.$common.isEmpty(value)) return callback(new Error('请输入'))
        if(value > this.stockDemandForm.stockRequirementDetailList[index].stockRequirementNumber) {
          return callback(new Error('不得大于需求数'))
        }
        callback();
      });
    },
    // 备注验证
    remarkValidator (rule, value, callback, index, disabled) {
      if (disabled) return callback();
      this.$nextTick(() => {
        const row = this.stockDemandForm.stockRequirementDetailList[index];
        if(row.stockRequirementNumber > row.checkStockRequirementNumber && this.$common.isEmpty(value)) {
          return callback(new Error('同意数少于需求数须填写'));
        }
        callback();
      });
    },
    auditingDemand(type){
      this.$refs['stockDemandForm'].validate((valid) => {
        if(type == 'reject' && this.$common.isEmpty(this.stockDemandForm.checkRemark)) return this.$Message.error('拒绝须填写备货需求审核意见') 
        if(valid) {
          this.loading = true
          let apiUrl = api.update_requirementOrder
          // 处理-创建人事业部id
          let obj = this.$common.copy(this.stockDemandForm)
          let noAllAgree = false
          this.stockDemandForm.stockRequirementDetailList.forEach(item => {
            if(item.checkStockRequirementNumber !== item.stockRequirementNumber) return noAllAgree = true
          })
          obj.status = type === 'reject' ? 4 : noAllAgree ? 3 : 2
          this.axios.post(apiUrl, obj).then(res => {
            if(res.data.code == 0) {
              this.$Message.success('操作成功~')
              this.$emit('goBackFrom', true)
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    }
  }
}
</script>
<style lang="less">
  .demandDetailsStyle{
      .ivu-input-number-handler-wrap{
        display: none;
      }
    }
</style>