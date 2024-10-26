<template>
    <div>
        <Form ref="stockDemandForm" :model="stockDemandForm" :label-width="100" :rules="stockDemandRules">
            <Row>
              <Col :span="24">
                <FormItem label="备货需求编号:">
                  <div class="ml10" v-if="demandData.type == 'create'">
                    保存后创建
                  </div>
                  <div v-else>
                  {{ stockDemandForm.stockRequirementNo }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="备货仓库:" prop="backupWarehouseId">
                  <dyt-select
                        ref="backupWarehouseId"
                        v-model="stockDemandForm.backupWarehouseId"
                        style="width: 250px"
                        filterable
                        :disabled="isView"
                        clearable
                      >
                        <Option
                          v-for="(item, index) in warehouseList"
                          :value="item.id"
                          :key="index"
                          >{{ item.name }}</Option
                        >
                      </dyt-select>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="所属事业部:">{{ businessDept }}</FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="创建人:">
                  <div class="ml10" v-if="demandData.type == 'create'">
                     {{ userInfo.userName }}
                  </div>
                  <div v-else>
                  {{ stockDemandForm.createdName }}
                  </div>
                </FormItem>
              </Col>
              <Col :span="24">
                <FormItem label="备货需求备注:">
                  <Input
                    type="textarea"
                    v-model="stockDemandForm.remark"
                    :rows="4"
                    class="demandTextareaContent"
                    :maxlength="300"
                    :disabled="isView"
                    show-word-limit
                  ></Input>
                </FormItem>
              </Col>
              <Col :span="24">
                <div class="ml20">商品信息: SKU总数量: {{ stockDemandForm.stockRequirementDetailList.length }}, 商品总数量: {{ goodsNum }}</div>
              </Col>
              <Col :span="24">
              <div class="flexBox mt20" v-if="!isView">
                <Button type="primary" @click="addGoods">添加商品</Button>
                <Button type="primary" class="ml10" @click="importExcel = true">Excel导入</Button>
              </div>
              </Col>
              <Col :span="24">
                <div class="normalTop">
                <Table
                  highlight-row
                  :border="true"
                  :columns="goodsColumn"
                  :data="stockDemandForm.stockRequirementDetailList"
                  :height="tableHeight"
                  class="demandTableStyle"
                >
                <template slot-scope="{ row }" slot="stockRequirementNumber">
                  <FormItem 
                    :label-width="0"
                    :prop="'stockRequirementDetailList.' + row._index + '.stockRequirementNumber'"
                    :rules="{ required: true, type: 'number', message: '请填写', trigger: 'change' }"
                  >
                  <InputNumber
                    v-model="stockDemandForm.stockRequirementDetailList[row._index].stockRequirementNumber" 
                    :min="1" 
                    :precision="0"
                    :disabled="isView"
                  />
                  </FormItem>
                </template>
                <template slot-scope="{ row }" slot="stockRequirementReason">
                  <FormItem 
                    :label-width="0"
                    :prop="'stockRequirementDetailList.' + row._index + '.stockRequirementReason'"
                    :rules="{ required: true, message: '请填写', trigger: 'change' }"
                  >
                  <Input 
                    type="textarea"
                    v-model="stockDemandForm.stockRequirementDetailList[row._index].stockRequirementReason" 
                    :maxlength="300"
                    show-word-limit
                    :disabled="isView"
                    :rows="3"
                  />
                  </FormItem>
                </template>
                </Table>
              </div>
              </COl>
            </Row>
                <!--添加商品-->
            <div v-if="isShowAddPro">
              <Modal
                v-model="isShowAddPro"
                :width="1100"
                title="添加商品"
                :styles="{ top: '50px' }"
                footer-hide
                :mask-closable="false"
                class="addProductModal1 headerBar addProductBar"
              >
                <addProduct
                  :disabledSlt="false"
                  :from="true"
                  @addProductSuccess="addProductSuccess"
                  @addProductCancel="addProductCancel"
                ></addProduct>
              </Modal>
            </div>
        </Form>
            <!-- Excel导入 -->
        <Modal
          v-model="importExcel"
          title="导入模板"
          @on-ok="importExcel = false"
          class-name="verticalCenterModal"
          @on-cancel="importExcel = false"
          :styles="{ top: '280px' }"
          width="400"
        >
          <template
            v-if="
              uploadList.length == 0 ||
              (uploadList.length > 0 &&
                uploadList[uploadList.length - 1].status === 'finished')
            "
          >
            <div style="text-align: center; margin: 20px 0">
              <dytUpload
                ref="import"
                type="drag"
                :format="['XLS', 'XLSX']"
                :action="action"
                name="file"
                :data="{isStock: 1}"
                :headers="headObj"
                :on-success="okUpload"
                :on-error="uploadError"
                :show-upload-list="false"
                :onFormatError="formatError"
              >
                <div style="padding: 20px 0">
                  <Icon type="ios-cloud-upload" size="60"></Icon>
                  <p>导入</p>
                </div>
              </dytUpload>
            </div>
            <div style="text-align: center">
              <a href="javascript:void(0)" @click="downloadEcxel()"
                >下载Excel文件模板</a
              >
            </div>
          </template>
          <template v-else>
            <div style="margin: 20px 0">
              <Progress
                v-if="uploadList[uploadList.length - 1].showProgress"
                :percent="uploadList[uploadList.length - 1].percentage"
                hide-info
              ></Progress>
            </div>
          </template>
          <div slot="footer"></div>
        </Modal>
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
        <Spin v-if="loading" fix></Spin>
    </div>
    
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from '../../../../../components/common/addProduct.vue'
export default {
  mixins: [ Mixin ],
  components: { addProduct },
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
        status: null,
        businessDeptId: null,
        remark: null,
        stockRequirementDetailList: []
      },
      loading: false,
      tableHeight: this.getTableHeight(520),
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
          width: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'thumbUrl')
          }
        },
        {
          key: 'spu',
          title: 'SPU',
          align: 'center',
          width: 190
        },
        {
          key: 'skuNo',
          title: 'SKU',
          align: 'center',
          width: 190
        },
        {
          key: 'goodsInfo',
          title: '商品信息',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            //  处理-规格
            let spec = ''
            if (params.row.productGoodsSpecifications && typeof params.row.productGoodsSpecifications == 'object') {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            } else {
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
          width: 200,
          align: 'center',
          slot: 'stockRequirementNumber',
          renderHeader: (h, { column }) => {
            return this.tableCheckHeader(h, column, this.stockDemandForm.stockRequirementDetailList, ['stockRequirementNumber']);
          }
        },
        {
          key: 'stockRequirementReason',
          title: '备货需求原因',
          align: 'center',
          width: 350,
          slot: 'stockRequirementReason',
          renderHeader: (h, { column }) => {
            return this.tableCheckHeader(h, column, this.stockDemandForm.stockRequirementDetailList, ['stockRequirementReason']);
          }
        },
        {
          key: 'operation',
          title: '操作',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return this.isView ? '' 
            : h('Button', {
              on: {
                click: () => {
                  // 删除操作
                  this.stockDemandForm.stockRequirementDetailList.splice()
                  this.stockDemandForm.stockRequirementDetailList.forEach((item, index) => {
                    if(this.demandData.type === 'create') {
                      if (item.goodsId == params.row.goodsId) {
                        this.stockDemandForm.stockRequirementDetailList.splice(index, 1);
                      }
                    } else {
                      if (item.productGoodsId == params.row.productGoodsId) {
                        this.stockDemandForm.stockRequirementDetailList.splice(index, 1);
                      }
                    }
                  });
                }
              }
            }, '删除') 
          }
        }
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
      isShowAddPro: false,
      goodsNum: 0,
      importExcel: false,
      action: api.planBatchImport,
      uploadList: [],
      warehouseList: []
    }
  },
  created() {
    this.getAllWarehouse()
  },
  mounted() {
    this.uploadList = this.$refs.import.fileList;
  },
  watch: {
    demandData: {
      handler(newVal, oldVal) {
        if(newVal.type == 'edit' || newVal.type == 'view') {
          this.stockDemandForm = newVal
        }
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
      let businessDeptId = this.demandData.type === 'create' ? this.authInfo.securityUser.businessDeptId : this.stockDemandForm.businessDeptId
      if (this.$common.isEmpty(this.$store.getters["businessDeptList"])) return businessDeptInfo;
      this.$store.getters["businessDeptList"].forEach(item => {
        businessDeptInfo[item.id] = item;
      })
      return businessDeptInfo[businessDeptId].name;
    },
    isView() {
      return this.demandData.type === 'view'
    }
  },
  methods: {
    // 选择成功回调
    addProductSuccess(data) {
      let arr = [];
      data.forEach((n, i) => {
        let isExist = false;
        this.stockDemandForm.stockRequirementDetailList.forEach((m, j) => {
          if (n.productGoodsId == m.goodsId) {
            // 如果该商品存在，数量+1
            this.stockDemandForm.stockRequirementDetailList[j].stockRequirementNumber += 1;
            isExist = true;
          }
        });
        if (!isExist) {
          // 如果该商品不存在，新增一条数据
          arr.push({
            cnName: n.cnName,
            goodsId: n.productGoodsId,
            goodsUrl: n.goodsUrl,
            sku: n.sku,
            productGoodsSpecifications: n.productGoodsSpecifications,
          });
        }
      });
      if (arr.length > 0) {
        this.axios.post(api.planQueryGoodsInfo, arr).then((res) => {
          if (res.data.datas && res.data.datas.length > 0) {
            res.data.datas.forEach((i) => {
              arr.forEach((j) => {
                if (i.skuNo === j.sku) {
                  i.productGoodsSpecifications = j.productGoodsSpecifications;
                }
              });
            });
            res.data.datas.forEach((n, i) => {
              this.stockDemandForm.stockRequirementDetailList.push(
                Object.assign(n, {
                  stockRequirementNumber: 1,
                  stockRequirementReason: null
                })
              );
            });
          }
        });
      }
      this.isShowAddPro = false;
    },
    // 取消选择回调
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addGoods() {
      this.isShowAddPro = true
    },
    // 提交或保存按钮
    finishedDemand(type) {
      this.$refs['stockDemandForm'].validate((valid) => {
        if(valid) {
          if(!this.stockDemandForm.stockRequirementDetailList.length) {
            return this.$Message.error('无商品信息')
          }
          this.loading = true
          let apiUrl = ''
          if(this.demandData.type == 'create') {
            apiUrl = api.save_requirementOrder
          } else {
            apiUrl = api.update_requirementOrder
          }
          // 处理-仓库类型
          this.warehouseList.forEach(item => {
            if(item.id === this.stockDemandForm.backupWarehouseId){
              this.$set(this.stockDemandForm, 'backupWarehouseType', item.warehouseType)
            }
          })
          // 处理-创建人事业部id
          this.stockDemandForm.businessDeptId = this.authInfo.securityUser.businessDeptId
          let obj = this.$common.copy(this.stockDemandForm)
          obj.stockRequirementDetailList = obj.stockRequirementDetailList.map(item => {
            return {
              stockRequirementNumber: item.stockRequirementNumber,
              stockRequirementReason: item.stockRequirementReason,
              productSpu: item.spu ? item.spu : item.productSpu,
              productSku: item.skuNo ? item.skuNo : item.productSku,
              productId: item.productId,
              productGoodsId: item.goodsId ? item.goodsId : item.productGoodsId
            }
          })
          obj.status = type === 'submit' ? 1 : 0
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
    },
    // 下载导入的模板
    downloadEcxel() {
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/stockRequirementTemplate.xlsx";
      window.location.href = path;
    },
    // 文件上传成功的回调
    okUpload(data, file, fileList) {
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          if (this.stockDemandForm.stockRequirementDetailList.length > 0) {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let isExist = false;
              this.stockDemandForm.stockRequirementDetailList.forEach((m, j) => {
                if (n.productGoodsId == m.goodsId || n.goodsId == m.goodsId) {
                  // 如果该商品存在，数量累加
                  this.stockDemandForm.stockRequirementDetailList[j].stockRequirementNumber += n.backupQuantity;
                  isExist = true;
                }
              });
              if (!isExist) {
                let i = n.backupQuantity > 0 ? n.backupQuantity : 1;
                this.stockDemandForm.stockRequirementDetailList.push(
                  Object.assign(n, { stockRequirementNumber: i })
                );
              }
            });
          } else {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let j = n.backupQuantity > 0 ? n.backupQuantity : 1;
              this.stockDemandForm.stockRequirementDetailList.push(
                Object.assign(n, { stockRequirementNumber: j })
              );
            });
          }
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          this.importExcel = false;
        }
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      }  else{
        this.$Message.error("导入失败，请参考模板填写");
        this.importExcel = false
      }
    },
    // 上传失败回调
    uploadError() {
      this.$Message.error("导入失败");
      this.importExcel = false;
    }, 
    // 上传格式错误
    formatError(file) {
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
    },
    // 应用所有表头
    tableCheckHeader (h, column, data, key) {
      if (this.isView) return h('div', {}, column.title);
      return h('div', {
        class: 'td-item-flex'
      }, [
        h('div', {}, column.title),
        h('Checkbox', {
          class: 'ml5',
          props: {
            disabled: data.length <= 1
          },
          on: {
            'on-change': (val) => {
              val && this.updateDataValue(data, key);
            }
          }
        }),
      ]);
    },
    // 将数据的第一条对应 key 的值应用到所有行
    updateDataValue (data, key) {
      if (this.$common.isEmpty(data)) return;
      const row = data[0];
      data.forEach((item, index) => {
        if (index > 0) {
          this.$set(item, key, row[key]);
        }
      });
    }
  }
}
</script>
<style lang="less">
    .demandTextareaContent{
      width: 500px;
    }
    .demandTableStyle{
      .ivu-input-number-handler-wrap{
        display: none;
      }
      .ivu-form-item-error-tip{
        display: none;
      }
    }
</style>
<style lang="less" scoped>
.demandTableStyle{
  :deep(.ivu-table){
    .td-item-flex{
      display: flex;
      align-items: center;
    }
  }
}
</style>