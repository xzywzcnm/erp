<template>
    <div>
        <Modal
        class="modal-main"
        v-model="dialogObj.modelVisible"
        :mask-closable="false"
        :title="titleMap[dialogObj.type] || '处理单'"
        width="70%">
          <div class="content">
            <Form ref="formValidate" :model="formValidate" :label-width="90" :rules="ruleValidate">
             <Row>
              <Col :span="6">
                <FormItem label="处理单号：">
                  <span>{{ formValidate.processType
                  ? this[formDataMap[formValidate.processType]].processCode : '' }}</span>
                  <span class="ml10" style="color:#2c74f6;cursor:pointer;text-decoration: underline;" @click="printTag">打印处理标签</span>
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="收货状态：">
                  {{ formValidate.processType
                  ? statusList[this[formDataMap[formValidate.processType]].status] : '' }}
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="参考编号：">
                  {{ formValidate.processType
                  ? this[formDataMap[formValidate.processType]].referenceNo : '' }}
                </FormItem>
              </Col>
              <Col :span="6">
                <FormItem label="入库单号：">
                  {{ formValidate.processType
                  ? this[formDataMap[this.formValidate.processType]].receiptNo : '' }}
                </FormItem>
              </Col>
             </Row>
              <div class="autoLong">
              <FormItem label="处理类型:" prop="processType">
                <RadioGroup v-model="formValidate.processType" type="button" button-style="solid">
                  <div v-for="(item, index) in processTypeArr" :key="index">
                    <Radio :label="item.value" :style="activeRadio(item)">
                      {{ item.label }}
                    </Radio>
                  </div>
                </RadioGroup>
              </FormItem>
            </div>
            </Form>
            <!-- 退供 -->
            <template v-if="formValidate.processType === 1">
            <Form ref="returnGoodsForm" :model="returnGoodsForm" :label-width="90" :rules="returnGoodsRules" >
              <Row>
              <Col :span="8">
                <FormItem label="供应商:" prop="supplierId">
                  <dyt-select v-model="returnGoodsForm.supplierId" disabled>
                    <Option v-for="( item, index ) in supplierList " :value="item.supplierId"
                      :label="item.supplierName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="收货人名称:" prop="contactMan">
                  <dytInput v-model="returnGoodsForm.contactMan" disabled placeholder="请输入收货人名称" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="联系电话:" prop="telephone" class="autoLong">
                  <div class="flexBox">
                    <dytInput v-model="returnGoodsForm.telephone" style="width: 240px;" disabled
                      placeholder="请输入联系电话" />
                  </div>
                </FormItem>
              </Col>
              <Col :span="8">
                <!-- <FormItem label="退货地址地区:" prop="rAddressId" v-if="isEdit">
                  <Cascader :data="areaList" v-model="returnGoodsForm.rAddressId" :disabled="!isEdit"
                    :load-data="loadAreaData" :filterable="true" :change-on-select="true" placeholder="请选择退货地址地区" />
                </FormItem> -->
                <FormItem label="退货地址地区:" prop="rAddressId">
                  <Input v-model="returnGoodsForm.rAddress" disabled></Input>
                </FormItem>
              </Col>
              <Col :span="16">
                <FormItem label="详细地址:" class="autoLong form-width590" prop="rAddressDetail">
                  <dytInput v-model="returnGoodsForm.rAddressDetail" disabled placeholder="请输入详细地址" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="退供类型:" prop="returnType">
                  <dyt-select v-model="returnGoodsForm.returnType" disabled>
                    <Option v-for="( item, index ) in returnTypeList " :value="item.value"
                      :label="item.label" :key="index"></Option>
                  </dyt-select>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="快递公司:" prop="logisticsId">
                  <dyt-select v-model="returnGoodsForm.logisticsId" :disabled="!isEdit">
                    <Option v-for="( item, index ) in expressCompanyList " :value="item.logisticsId"
                      :label="item.logisticsName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="快递单号:" prop="trackingNumber">
                  <dytInput v-model="returnGoodsForm.trackingNumber" :disabled="!isEdit" :maxlength="200" placeholder="请输入快递单号" />
                </FormItem>
              </Col>
            <Col :span="8">
                <FormItem label="退款采购单号:" :label-width="90" prop="refundPurchaseOrderNumber">
                  <dytInput v-model="returnGoodsForm.refundPurchaseOrderNumber" disabled  placeholder="请输入快递单号" />
                </FormItem>
              </Col>
              <Col :span="8">
              <div class="form-width590">
                <FormItem label="处理单备注:" prop="remark">
                  <dytInput type="textarea" v-model="returnGoodsForm.remark" disabled :maxlength="200"
                    :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注" />
                </FormItem>
              </div>
              </Col>
              <Col :span="8">
              <div class="form-width590">
                <FormItem label="退货备注:" prop="refundRemark">
                  <dytInput type="textarea" v-model="returnGoodsForm.refundRemark" :disabled="!isEdit" :maxlength="200"
                    :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注" />
                </FormItem>
              </div>
              </Col>
            </Row>
            </Form>
            </template>
            <!-- 质检入库 -->
            <template v-if="formValidate.processType === 2">
              <Form ref="quanlityForm" :model="quanlityForm" :label-width="90" :rules="quanlityRules">
              <FormItem label="供应商:" prop="supplierId">
                  <dyt-select v-model="quanlityForm.supplierId" disabled style="width:250px">
                    <Option v-for="( item, index ) in supplierList " :value="item.supplierId"
                      :label="item.supplierName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="质检比例:" prop="qualityInspectionRatio">
                  <dytInput v-model="quanlityForm.qualityInspectionRatio" disabled placeholder="请输入" style="width:200px" />
                  <span class="ml10">%</span>
              </FormItem>
              <FormItem label="是否更换标签:" prop="isChangeLabel">
                  <dyt-select v-model="quanlityForm.isChangeLabel" disabled style="width:200px">
                    <Option v-for="( item, index ) in isChangeLabelList " :value="item.value"
                      :label="item.label" :key="index"></Option>
                  </dyt-select>
                  <span class="ml10" style="color:#666666">提示：可以更改为其它SKU的LAPA标签入库</span>
                </FormItem>
              </Form>
            </template>
            <!-- 维修入库 -->
            <template v-if="formValidate.processType === 3">
              <Form ref="fixedForm" :model="fixedForm" :label-width="90" :rules="fixedRules">
              <FormItem label="维修内容:" prop="maintenanceContent">
                  <dytInput type="textarea" v-model="fixedForm.maintenanceContent" disabled
                  style="width:300px"
                  :maxlength="200"
                  :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入" />
                </FormItem>
              <FormItem label="是否更换标签:" prop="isChangeLabel">
                  <dyt-select v-model="fixedForm.isChangeLabel" disabled style="width:200px">
                    <Option v-for="( item, index ) in isChangeLabelList " :value="item.value"
                      :label="item.label" :key="index"></Option>
                  </dyt-select>
                  <span class="ml10" style="color:#666666">提示：可以更改为其它SKU的LAPA标签入库</span>
                </FormItem>
              </Form>
            </template>
            <!-- 上架入库 -->
            <template v-if="formValidate.processType === 4">
              <Form ref="listingForm" :model="listingForm" :label-width="90" :rules="listingRules">
              <FormItem label="是否更换标签:" prop="isChangeLabel">
                  <dyt-select v-model="listingForm.isChangeLabel" disabled style="width:200px">
                    <Option v-for="( item, index ) in isChangeLabelList " :value="item.value"
                      :label="item.label" :key="index"></Option>
                  </dyt-select>
                  <span class="ml10" style="color:#666666">提示：可以更改为其它SKU的LAPA标签入库</span>
                </FormItem>
              </Form>
            </template>
            <!-- 销毁 -->
            <template v-if="formValidate.processType === 5">
              <Form ref="destoryForm" :model="destoryForm" :label-width="90" :rules="destoryRules">
              <FormItem label="备注:" prop="remark">
                  <dytInput type="textarea" v-model="destoryForm.remark" disabled
                  style="width:300px"
                  :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注" />
                </FormItem>
              </Form>
            </template>
          <!-- 商品信息/入库商品信息 -->
          <div v-if="!$common.isEmpty(formValidate.processType)">
          <div style="display: flex;margin-top: 40px;">
              <div style="width: 4px; height: 20px; background: #2c74f6"></div>
              <span class="ml10" style="font-size:18px;font-weight:700">{{
                (formValidate.processType !== 1 && formValidate.processType !== 5)
              ? '入库商品信息' : '商品信息' }}</span>
            </div>
            <Table
            :border="true"
            :columns="getColumns"
            :height="tableHeight"
            :data="tableData || []"
            >
            <template slot-scope="{ row }" slot="picture">
              <div class="form-pic-item">
                <Poptip transfer trigger="hover" placement="right-start" v-for="(pic, pIndex) in tableData[row._index].checkPictureDetails" :key="`pic-${pIndex}`">
                  <div class="pic-item-view">
                    <img :src="pic.startsWith('http') ? pic : `./filenode/s${pic}`" />
                  </div>
                  <div slot="content">
                    <img style="width:350px" :src="pic.startsWith('http') ? pic : `./filenode/s${pic}`" />
                  </div>
                </Poptip>
                </div>
            </template>

            <template slot-scope="{ row }" slot="warehousingSku">
            <div style="diaplay:flex">
            <Input v-model="tableData[row._index].warehousingSku" :disabled="!isEdit" style="width:120px" />
            </div>
            </template>
            </Table>
          </div>
          </div>
          <div slot="footer">
              <Button  type="primary" v-if="isEdit" @click="submitSave" :disabled="modalLoad">确 定</Button>
              <Button @click="dialogObj.modelVisible = false">取 消</Button>
            </div>
            <Spin fix v-if="modalLoad"></Spin>
        </Modal>
    </div>
</template>
<script>
import printCommon from '@/utils/printCommon';
import { getPrintHtml } from '@/utils/printTagCommon';
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
export default {
  mixins: [Mixin],
  props: {
    dialogObj: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      tableHeight: this.getTableHeight(520),
      titleMap: {
        'create': '创建处理单',
        'view': '查看处理单',
        'edit': '修改处理单',
      },
      // 处理单处理类型
      handleOrderTypeList: {
        1: { label: '退供', value: 1, sort: 0, color: '#996600' },
        2: { label: '质检入库', value: 2, sort: 1, color: '#CC66CC' },
        3: { label: '维修入库', value: 3, sort: 2, color: '#9900FF' },
        4: { label: '上架入库', value: 4, sort: 3, color: '#009966' },
        5: { label: '销毁', value: 5, sort: 4, color: '#FF6600' },
      },
      formValidate: {
        processType: null
      },
      returnGoodsForm: {
        supplierId: null,
        contactMan: null, // 收货人名称
        telephone: null,
        rAddress: '', // 地址
        rAddressId: [], // 退货地址ID
        rAddressDetail: null, // 详细地址
        returnType: null, // 退供类型
        logisticsId: '', // 快递公司
        logisticsName: '', // 快递公司名称
        refundPurchaseOrderNumber: '', // 退款采购单号
        trackingNumber: '', // 快递单号
        remark: null, // 备注
        refundRemark: null, // 退货备注
      },
      returnGoodsRules: {
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        returnType: [
          { required: true, message: '请选择', type: "number", trigger: 'change' },
        ],
      },
      quanlityForm: {
        isChangeLabel: 0, // 是否更换标签
        qualityInspectionRatio: '60', // 质检比例，默认60
        supplierId: null
      },
      quanlityRules: {
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        qualityInspectionRatio: [
          { required: true, message: '请输入', trigger: 'change' },
          { pattern: /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/, message: '大于0或小于等于100', trigger: 'blur' },
        ]
      },
      fixedForm: {
        maintenanceContent: '', // 维修内容
        isChangeLabel: 0, // 是否更换标签
      },
      fixedRules: {},
      listingForm: {
        isChangeLabel: 0, // 是否更换标签
      },
      listingRules: {},
      destoryForm: {
        remark: ""
      },
      destoryRules: {},
      ruleValidate: {
        processType: [
          { required: true, message: '请选择', type: 'number', trigger: 'change' },
        ],
      },
      formDataMap: {
        1: 'returnGoodsForm',
        2: 'quanlityForm',
        3: 'fixedForm',
        4: 'listingForm',
        5: 'destoryForm',
      },
      oldFormData: {},
      supplierList: [],
      returnTypeList: [
        { label: '退供退款', value: 1 },
        { label: '退供维修', value: 2 },
      ],
      expressCompanyList: [],
      isChangeLabelList: [
        { label: '否', value: 0 },
        { label: '是', value: 1 },
      ],
      statusList: {
        1: '待收货',
        2: '处理中',
        3: '处理完结',
        4: '作废'
      },
      tableData: [],
      modalLoad: false,
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal, oldVal) {
        if (newVal) {
          this.init()
          this.formValidate = this.dialogObj.detailsData
          this.tableData = this.dialogObj.data
          this.tableData.forEach(item => {
            let checkPictureDetails = this.$common.isEmpty(item.platformQualityInspectionUrl)
           ? [] : item.platformQualityInspectionUrl.split(',')
            this.$set(item, 'checkPictureDetails', checkPictureDetails)
          })
          this[this.formDataMap[this.formValidate.processType]] = this.formValidate
        } else {
          this.$refs['formValidate'] && this.$refs['formValidate'].resetFields();
          this.$refs[this.formDataMap[this.formValidate.processType]] &&
          this.$refs[this.formDataMap[this.formValidate.processType]].resetFields();
          Object.entries(this.formDataMap).forEach(([key, value]) => {
            this[value] = this.$common.copy(this.oldFormData[value] ? this.oldFormData[value] : this[value])
          });
        }
      },
      deep: true,
      immediate: true
    },
  },
  computed: {
    processTypeArr() {
      let result = this.handleOrderTypeList[this.formValidate.processType] ? [this.handleOrderTypeList[this.formValidate.processType]] : []
      return result
    },
    getColumns() {
      let goodsColumns = [
        {
          key: "goodsInfo",
          title: "平台商品信息",
          align: "center",
          width: 260,
          render: (h, params) => {
            return h('div', {
              style: {
                display: 'flex'
              }
            }, [
              h('div', { style: {} }, [
                this.tableImg(h, params, "thumbUrl", params.row.thumbUrl)
              ]),
              h('div', { class: 'ml20' }, [
                h('div', {}, `平台SKU：${params.row.productSkuId || '-'}`),
                h('div', {}, `平台SPU：${params.row.productSpuId || '-'}`),
                h('div', {}, `属性集：${params.row.variationSpecifics || '-'}`)
              ])
            ]);
          }
        },
        {
          key: "skuExtCode",
          align: "center",
          title: "LAPA SKU",
          width: 140,
        },
        {
          key: "purchaseSubOrderSn",
          align: "center",
          title: "采购子单号",
          width: 160,
        },
        {
          key: "skuQuantity",
          align: "center",
          title: "件数",
          width: 70,
        },
        {
          key: "reasonDesc",
          align: "center",
          title: "商品退货原因",
          render: (h, params) => {
            return [
              h('div', {}, params.row.reasonDesc),
              h('div', {}, params.row.platformQualityInspectionProblem)
            ]
          }
        },
        {
          key: "picture",
          align: "center",
          title: "平台质检图片",
          slot: "picture"
        }
      ]
      if (this.formValidate.processType !== 1 && this.formValidate.processType !== 5) {
        goodsColumns.push({
          key: 'warehousingSku',
          title: "入库SKU编码",
          align: "center",
          width: 220,
          slot: 'warehousingSku'
        })
      } else {
        goodsColumns = goodsColumns.filter(item => item.key !== 'warehousingSku')
      }
      return goodsColumns
    },
    // 地址
    rCityName() {
      let cityName = [];
      this.returnGoodsForm.rAddressId.forEach(id => {
        if (this.addressJson[id]) {
          cityName.push(this.addressJson[id].districtCnName);
        }
      })
      return cityName.join(',');
    },
    isEdit() {
      return this.dialogObj.type === 'edit'
    }
  },
  methods: {
    init() {
      this.modalLoad = true;
      this.$set(this.returnGoodsForm, 'supplierId', this.dialogObj.data[0].supplierId)
      let awaitList = [this.getSupplierList(), this.getLogistics()];
      Promise.all(awaitList).then(() => {
        this.modalLoad = false;
      }).catch(() => {
        this.modalLoad = false;
      });
    },
    // 处理类型对应颜色
    activeRadio(row) {
      let str = {};
      let flag = this.formValidate.processType === row.value;
      if (flag) {
        str.background = str.borderColor = row.color;
        str.boxShadow = '0 1px 6px ' + row.color;
      }
      return str;
    },
    // 获取快递公司
    getLogistics() {
      return new Promise((resolve) => {
        this.axios.post(api.get_logistics, {}, { hiddenError: true }).then(({ data }) => {
          if (data) {
            this.expressCompanyList = data.datas || [];
          }
          resolve(data);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取供应商列表
    getSupplierList() {
      return new Promise((resolve) => {
        this.$store.dispatch('getSupplierList').then(res => {
          this.supplierList = res || [];
          resolve([]);
        })
      })
    },
    // 提交
    submitSave() {
      this.$refs[`${this.formDataMap[this.formValidate.processType]}`].validate((valid) => {
        if (!valid) return;
        let formData = this.$common.copy(this[this.formDataMap[this.formValidate.processType]])
        // 赋物流商名称
        this.expressCompanyList.forEach(item => {
          if (item.logisticsId == formData.logisticsId) {
            this.$set(formData, 'logisticsName', item.logisticsName)
          }
        })
        let obj = {
          returnHandleId: formData.returnHandleId,
          logisticsId: formData.logisticsId,
          logisticsName: formData.logisticsName,
          trackingNumber: formData.trackingNumber,
          refundRemark: formData.refundRemark,
          type: '2'
        }
        this.axios.post(api.update_returnInfo, obj).then(res => {
          if (res.data.code === 0) {
            this.$emit('refresh', true)
            this.dialogObj.modelVisible = false
          }
        })
      })
    },
    // 打印标签
    printTag() {
      this.modalLoad = true;
      let processLabel = {
        size: {
          width: 70,
          height: 20,
          unit: 'mm',
        },
        replaceKey: {
          tagType: 'type', // 标签类型 platformId
          barcode: 'processCode', // 条码，Number、String
          leftTop: 'processCode', // 条码左上角
          middleTop: 'processTypeCn', // 条码正上(即条码中间上方)
          rightTop: 'isChangeLabel', // 条码右上角
        }
      }
      let printArr = []
      printArr.push(this[this.formDataMap[this.formValidate.processType]])
      printArr.forEach(item => {
        this.$set(item, 'type', 'process')
        this.$set(item, 'processTypeCn', this.handleOrderTypeList[item.processType].label)
        this.$set(item, 'isChangeLabel', item.isChangeLabel ? '换标' : '')
      })
      getPrintHtml(printArr, processLabel).then(res => {
        if (!res.success || this.$common.isEmpty(res.data)) return;
        let allTagHtml = '';
        res.data.forEach((item, index) => {
          allTagHtml = `${allTagHtml}${item.printHtml}`;
        })
        allTagHtml = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>标签打印</title>
          </head>
          <style>
            * {
              margin: 0;
              padding: 0;
            }
            body{
              font-size: 0;
            }
            img {
              vertical-align: top;
            }
          </style>
          <body>${allTagHtml}</body>
        </html>`;
        printCommon.htmlPrint(allTagHtml).then((res) => {
        }).finally(() => {
          this.modalLoad = false
        })
      })
    },
  }
}
</script>
<style lang="less">
   .form-pic-item{
        display: flex;
        justify-content: flex-start;
        flex-flow: wrap;
        .pic-item-view{
          position: relative;
          margin-right: 10px;
          width: 70px;
          height: 70px;
          >img {
            height: 100%;
            width: 100%;
          }
          .pic-view-cover{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            &:hover{
              background: rgba(0, 0, 0, 0.5);
              .pic-view-btn{
                display: block;
              }
            }
            .pic-view-btn{
              display: none;
              position: absolute;
              top: 50%;
              width: 100%;
              transform: translate(0, -50%);
              font-size: 20px;
              color: #fff;
              text-align: center;
              >i{
                cursor: pointer;
              }
            }
          }
        }
        .upload-item{
          position: relative;
          display: inline-block;
          width: 70px;
          height: 70px;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
        }
        .upload-icon{
          width: 70px;
          height: 70px;
          i>{
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }
</style>