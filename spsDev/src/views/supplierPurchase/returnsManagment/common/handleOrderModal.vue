<template>
    <div>
        <Modal 
        class="modal-main" 
        v-model="dialogObj.modelVisible" 
        :mask-closable="false" 
        :title="titleMap[dialogObj.type] || '创建处理单'" 
        width="70%">
          <div class="content">
            <Form ref="formValidate" :model="formValidate" :label-width="90" :rules="ruleValidate">
             <Row>
              <Col :span="6">
                <FormItem label="处理单号：">
                  <span v-if="isEdit">保存后自动生成</span>
                  <span v-else>{{ formValidate.processType
                  ? this[formDataMap[formValidate.processType]].processCode : '' }}</span>
                </FormItem>
              </Col>
              <Col :span="6" v-if="!isEdit">
                <FormItem label="收货状态：">
                  {{ formValidate.processType
                  ? statusList[this[formDataMap[formValidate.processType]].status] : '' }}
                </FormItem>
              </Col>
              <Col :span="6" v-if="!isEdit">
                <FormItem label="参考编号：">
                  {{ formValidate.processType
                  ? this[formDataMap[formValidate.processType]].referenceNo : '' }}
                </FormItem>
              </Col>
              <Col :span="6" v-if="!isEdit">
                <FormItem label="入库单号：">
                  {{ formValidate.processType
                  ? this[formDataMap[this.formValidate.processType]].receiptNo : '' }}
                </FormItem>
              </Col>
             </Row>
              <div class="autoLong">
              <FormItem label="处理类型:" prop="processType">
                <RadioGroup v-model="formValidate.processType" type="button" button-style="solid" @on-change="changeHandleType">
                  <template v-for="item in processTypeArr ">
                    <Radio :label="item.value" :style="activeRadio(item)">
                      {{ item.label }}
                    </Radio>
                  </template>
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
                  <dyt-select v-model="returnGoodsForm.supplierId" :disabled="!isEdit">
                    <Option v-for="( item, index ) in supplierList " :value="item.supplierId"
                      :label="item.supplierName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="收货人名称:" prop="contactMan">
                  <dytInput v-model="returnGoodsForm.contactMan" :disabled="!isEdit" placeholder="请输入收货人名称" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="联系电话:" prop="telephone" class="autoLong">
                  <div class="flexBox">
                    <dytInput v-model="returnGoodsForm.telephone" style="width: 240px;" :disabled="!isEdit"
                      placeholder="请输入联系电话" />
                  </div>
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="退货地址地区:" prop="rAddressId" v-if="isEdit">
                  <Cascader :data="areaList" v-model="returnGoodsForm.rAddressId" :disabled="!isEdit"
                    :load-data="loadAreaData" :filterable="true" :change-on-select="true" placeholder="请选择退货地址地区" />
                </FormItem>
                <FormItem label="退货地址地区:" prop="rAddressId" v-else>
                  <Input v-model="returnGoodsForm.rAddress" :disabled="!isEdit"></Input>
                </FormItem>
              </Col>
              <Col :span="16">
                <FormItem label="详细地址:" class="autoLong form-width590" prop="rAddressDetail">
                  <dytInput v-model="returnGoodsForm.rAddressDetail" :disabled="!isEdit" placeholder="请输入详细地址" />
                </FormItem>
              </Col>
              <Col :span="8">
                <FormItem label="退供类型:" prop="returnType">
                  <dyt-select v-model="returnGoodsForm.returnType" :disabled="!isEdit">
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
                  <dytInput v-model="returnGoodsForm.refundPurchaseOrderNumber" :disabled="!isEdit" :maxlength="200" placeholder="请输入快递单号" />
                </FormItem>
              </Col>
              <Col :span="16">
              <div class="form-width590">
                <FormItem label="备注:" prop="remark">
                  <dytInput type="textarea" v-model="returnGoodsForm.remark" :disabled="!isEdit" :maxlength="200"
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
                  <dyt-select v-model="quanlityForm.supplierId" :disabled="!isEdit" style="width:250px">
                    <Option v-for="( item, index ) in supplierList " :value="item.supplierId"
                      :label="item.supplierName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="质检比例:" prop="qualityInspectionRatio">
                  <dytInput v-model="quanlityForm.qualityInspectionRatio" :disabled="!isEdit" placeholder="请输入" style="width:200px" />
                  <span class="ml10">%</span>
              </FormItem>
              <FormItem label="是否更换标签:" prop="isChangeLabel">
                  <dyt-select v-model="quanlityForm.isChangeLabel" :disabled="!isEdit" style="width:200px">
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
                <FormItem label="供应商:" prop="supplierId">
                  <dyt-select v-model="fixedForm.supplierId" :disabled="!isEdit"  style="width:250px">
                    <Option v-for="( item, index ) in supplierList " :value="item.supplierId"
                      :label="item.supplierName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
              <FormItem label="维修内容:" prop="maintenanceContent">
                  <dytInput type="textarea" v-model="fixedForm.maintenanceContent" :disabled="!isEdit"
                  style="width:300px"
                  :maxlength="200"
                  :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入" />
                </FormItem>
              <FormItem label="是否更换标签:" prop="isChangeLabel">
                  <dyt-select v-model="fixedForm.isChangeLabel" :disabled="!isEdit" style="width:200px">
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
                  <dyt-select v-model="listingForm.isChangeLabel" :disabled="!isEdit" style="width:200px">
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
                  <dytInput type="textarea" v-model="destoryForm.remark" :disabled="!isEdit"
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
              <Input v-model="tableData[row._index].warehousingSku" :disabled="!isEdit || !isChangeSku" style="width:120px" />
              <span class="ml10" v-if="isEdit && isChangeSku" style="color:#0082ff;cursor:pointer;line-height:36px;" @click="searchPro(row._index)">查找商品</span>
              <!--查找商品-->
              <div v-if="isSearchPro">
                <Modal
                  v-model="isSearchPro"
                  :width="1100"
                  title="添加商品"
                  :styles="{ top: '50px' }"
                  :mask-closable="false"
                  class="addProductModal1 headerBar addProductBar"
                >
                  <addProduct
                    :disabledSlt="false"
                    :from="true"
                    :onlyChoseOne="true"
                    @addProductSuccess="(val) => { addProductSuccess(val) }"
                    @addProductCancel="addProductCancel"
                  ></addProduct>
                </Modal>
              </div>
            </div>
            </template>
            </Table>
          </div>
          </div>
          <div slot="footer">
              <Button  type="primary" v-if="isEdit" @click="submitSave" :disabled="modalLoad">确 定</Button>
              <!-- <span v-if="isEdit && isLoadFail" style="color:#f40;margin-right: 10px;">获取信息失败，无法进行保存操作</span> -->
              <Button @click="dialogObj.modelVisible = false">取 消</Button>
            </div>
            <Spin fix v-if="modalLoad"></Spin>
        </Modal>
    </div>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
import addProduct from "../../../../components/common/addProduct.vue";
export default {
  mixins: [Mixin],
  components: { addProduct },
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
      titleMap:{
        'create': '创建处理单',
        'view': '查看处理单',
        'change': '修改处理单',
      },
      isSearchPro: false,
      // 处理单处理类型
      handleOrderTypeList : {
        1: { label: '退供', value: 1, sort: 0, color: '#996600' },
        2: { label: '质检入库', value: 2, sort: 1, color: '#CC66CC'},
        3: { label: '维修入库', value: 3, sort: 2, color: '#9900FF'},
        4: { label: '上架入库', value: 4, sort: 3, color: '#009966'},
        5: { label: '销毁', value: 5, sort: 4, color: '#FF6600'},
      },
      formValidate:{
        processType: null
      },
      returnGoodsForm:{
        supplierId: null,
        contactMan: null, // 收货人名称
        telephone: null,
        rAddress: '', // 地址
        rAddressId: [], // 退货地址ID
        rAddressDetail: null, // 详细地址
        returnType:null, // 退供类型
        logisticsId: '', // 快递公司
        logisticsName: '', //快递公司名称
        refundPurchaseOrderNumber: '',  // 退款采购单号
        trackingNumber: '', // 快递单号
        remark: null, // 备注
      },
      returnGoodsRules:{
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        returnType: [
          { required: true, message: '请选择', type: "number", trigger: 'change' },
        ],
      },
      quanlityForm: {
        isChangeLabel:0, // 是否更换标签
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
        supplierId: null,
        maintenanceContent: '', // 维修内容
        isChangeLabel:0, // 是否更换标签
      },
      fixedRules:{
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
      },
      listingForm:{
        isChangeLabel:0, // 是否更换标签
      },
      listingRules:{},
      destoryForm:{
        remark:""
      },
      destoryRules:{},
      ruleValidate:{
        processType: [
          { required: true, message: '请选择', type: 'number' ,trigger: 'change' },
        ],
      },
      formDataMap:{
        1: 'returnGoodsForm',
        2: 'quanlityForm',
        3: 'fixedForm',
        4: 'listingForm',
        5: 'destoryForm',
      },
      oldFormData:{},
      supplierList: [],
      topAreaList: [],
      areaList: [],
      returnTypeList: [
        { label:'退供退款', value:1 },
        { label:'退供维修', value:2 },
      ],
      expressCompanyList:[],
      isChangeLabelList:[
        { label:'否', value: 0 },
        { label:'是', value: 1 },
      ],
      statusList:{
        1:'待收货',
        2:'处理中',
        3:'处理完结',
        4:'作废'
      },
      tableData:[],
      modalLoad: false,
      addressJson: {},
      isDefaultFlag: false,
      selectIndex: null
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal, oldVal) {
        if (newVal) {
          if(this.isEdit){
            this.tableData = this.$common.copy(this.dialogObj.data)
            Object.entries(this.formDataMap).forEach(([key, value]) => {
              this.oldFormData[value] = this.$common.copy(this[value])
            });
            // 创建时，这里入库sku需要默认跟原先LAPASKU一致
            this.tableData.forEach(item => {
              this.$set(item, 'warehousingSku', item.skuExtCode)
            })
            this.init()
          } else {
            this.init()
            this.formValidate = this.dialogObj.detailsData
            this.tableData = this.dialogObj.data
            this.tableData.forEach(item => {
              let checkPictureDetails = this.$common.isEmpty(item.platformQualityInspectionUrl)
           ? [] : item.platformQualityInspectionUrl.split(',')
              this.$set(item, 'checkPictureDetails', checkPictureDetails)
            })
            this[this.formDataMap[this.formValidate.processType]] = this.formValidate
          }
        } else {
          this.$refs['formValidate'] && this.$refs['formValidate'].resetFields();
          this.$refs[this.formDataMap[this.formValidate.processType]] 
          && this.$refs[this.formDataMap[this.formValidate.processType]].resetFields();
          Object.entries(this.formDataMap).forEach(([key, value]) => {
            this[value] = this.$common.copy(this.oldFormData[value] ? this.oldFormData[value] : this[value])
          });
        }
      },
      deep: true,
      immediate: true
    },
    'returnGoodsForm.supplierId': { 
      handler(newVal, oldVal) {
        if(this.dialogObj.type === 'create') {
          // 自动替换默认地址
          this.isDefaultFlag = true
          this.getRefundAddress(newVal)
        }
      },
    },
  },
  computed: {
    processTypeArr() {
      if(!this.isEdit){
        let result = this.handleOrderTypeList[this.formValidate.processType] ? [this.handleOrderTypeList[this.formValidate.processType]] : []
        return result
      }
      return Object.values(this.handleOrderTypeList).sort((a, b) => {
        return a.sort - b.sort;
      });
    },
    getColumns() {
      let goodsColumns = [
        {
          key: "goodsInfo",
          title: "平台商品信息",
          align: "center",
          width:260,
          render: (h, params) => {
            return h('div', {
              style: {
                display:'flex'
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
      if(this.formValidate.processType !== 1 && this.formValidate.processType !== 5){
        goodsColumns.push({
          key:'warehousingSku',
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
      return this.dialogObj.type === 'create'
    },
    isChangeSku() {
      return  this[this.formDataMap[this.formValidate.processType]].isChangeLabel 
    },
  },
  methods: {
    init(){
      this.modalLoad = true;
      this.$set(this.returnGoodsForm, 'supplierId', this.dialogObj.data[0].supplierId)
      this.getAddressList().then((res) => {
        this.topAreaList = res;
        this.areaList = res;
        // 需要加载的数据
        let awaitList = [this.getSupplierList(), this.getLogistics()];
        Promise.all(awaitList).then(() => {
          let awaitOtherList = [];
          if (this.dialogObj.type == 'create') {
            awaitOtherList.push(this.getRefundAddress(this.tableData[0].supplierId));
          }
          Promise.all(awaitOtherList).finally(() => {
            this.modalLoad = false;
          }).catch(() => {
            this.modalLoad = false;
          })
        }).catch(() => {
          this.modalLoad = false;
        });
      }).catch(() => {
        this.modalLoad = false;
      });
    },
    // 处理类型对应颜色
    activeRadio(row) {
      let str = {};
      let flag =  this.formValidate.processType === row.value;
      if (flag) {
        str.background = str.borderColor = row.color;
        str.boxShadow = '0 1px 6px ' + row.color;
      }
      return str;
    },
    // 获取地址(默认值返回中国省份，中国的 ID 为 1)
    getAddressList(parentId = 1) {
      return new Promise((resolve) => {
        this.axios.get(`/dyt-cloud-upms-admin/district/treeList?parentId=${parentId}`).then(({ data }) => {
          const list = this.addressListHand(this.$common.copy(data.data || []), {
            label: 'districtCnName',
            value: 'id',
            children: 'childrenDistrictList'
          }, 'childrenDistrictList');
          resolve(list);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 展开子级加载
    loadAreaData(item, callback) {
      item.loading = true;
      if(this.isDefaultFlag) return this.isDefaultFlag = false; 
      this.getAddressList(item.value).then(res => {
        item.children = this.$common.isEmpty(res) ? [] : res;
        item.loading = false;
        callback();
      })
    },
    // 地址处理
    addressListHand(data, obj, childKey, ids = [], names = '') {
      const keys = Object.keys(obj);
      data.forEach(item => {
        this.addressJson[item[obj.value]] = item;
        keys.forEach(key => {
          if (key === 'children' && [0, '0'].includes(item.isLastNode)) {
            item.loading = false;
          }
          item[key] = item[obj[key]];
        })
        if (item[childKey] && this.$common.isArray(item[childKey])) {
          this.addressListHand(item[childKey], obj, childKey, [...ids, item[obj.value]], `${names ? names + ',' : ''}${item[obj.label]}`);
        }
        delete item[childKey];
      })
      return data;
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
        this.axios.get(api.supplierAll).then((res) => {
          this.supplierList = res.data.datas;
          resolve(res.data.datas || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 创建处理单时获取供应商退货地址、用户信息
    getRefundAddress(supplierId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(supplierId)) return resolve({});
        this.axios.get(api.get_refundAddress, {
          params: {
            supplierId: supplierId || ''
          },
          hiddenError: true
        }).then(({ data }) => {
          const keys = ['telephone'];
          keys.forEach(key => {
            typeof data.datas[key] !== 'undefined' && this.$set(this.returnGoodsForm, key, data.datas[key]);
          });
          if (typeof data.datas['rAddressDetail'] !== 'undefined') {
            this.$set(this.returnGoodsForm, 'rAddressDetail', data.datas['rAddressDetail']);
          }
          if (typeof data.datas['contactMan'] !== 'undefined') {
            this.$set(this.returnGoodsForm, 'contactMan', data.datas['contactMan']);
          }
          if (typeof data.datas['rAddress'] !== 'undefined') {
            const address = (data.datas['rAddress'] || '').split(',').filter(f => !this.$common.isEmpty(f, true));
            this.getCreateRefundAddress(address).then((res) => {
              this.$set(this.returnGoodsForm, 'rAddressId', res);
              resolve({});
            })
          } else {
            resolve({});
          }
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 创建时转换为地址ID
    getCreateRefundAddress(addressArr, isId = false) {
      return new Promise((resolve) => {
        let treeList = this.$common.copy(this.topAreaList);
        let val = [];
        let cnVal = []
        const hand = (data, index = 0, allData) => {
          let obj = {};
          let treeIndex = 0;
          data.forEach((item, tIndex) => {
            if ((isId && item.id === addressArr[index]) || (!isId && item.label === addressArr[index])) {
              obj = item;
              treeIndex = tIndex;
            }
          })
          if (this.$common.isEmpty(obj)) {
            this.areaList = treeList;
            return resolve(val);
          }
          val.push(obj.value);
          cnVal.push(obj.districtCnName)
          this.getAddressList(obj.id).then(res => {
            allData[treeIndex].children = res;
            if (addressArr.length - 1 > index) {
              hand(res, index + 1, allData[treeIndex].children);
            } else {
              this.areaList = treeList;
              this.$set(this.returnGoodsForm, 'rAddress', cnVal.join(','))
              resolve(val);
            }
          })
        }
        hand(this.topAreaList, 0, treeList);
      })
    },
    changeHandleType(val){
      // if(this.$common.isEmpty(this.formValidate.processType)) {
      //   Object.entries(this.formDataMap).forEach(([key, value]) => {
      //     this[value] = this.$common.copy(this.oldFormData[value])
      //   });
      // }
    },
    searchPro(rowIndex){
      this.isSearchPro = true
      this.selectIndex = rowIndex
    },
    // 成功选择新sku
    addProductSuccess(val){
      this.isSearchPro = false
      this.$set(this.tableData[this.selectIndex], 'warehousingSku', val[0].sku)
    },
    // 取消选择新sku
    addProductCancel(){},
    // 提交
    submitSave() {
      if(this.$common.isEmpty(this.formValidate.processType)){
        return this.$Message.error('请选择处理类型~')
      }
      this.$refs[`${this.formDataMap[this.formValidate.processType]}`].validate((valid) => {
        if (!valid) return;
        let spsRefundHandleInfo = {}
        let spsRefundHandleDetailInfoList = this.$common.copy(this.tableData)
        if(this.formValidate.processType === 1){
        // 赋供应商名称
          this.supplierList.forEach(item => {
            if(item.supplierId == this.returnGoodsForm.supplierId) {
              this.$set(this.returnGoodsForm, 'supplierName', item.supplierName)
            }
          })
          // 赋物流商名称
          this.expressCompanyList.forEach(item => {
            if(item.logisticsId == this.returnGoodsForm.logisticsId) {
              this.$set(this.returnGoodsForm, 'logisticsName', item.logisticsName)
            }
          })
          const rAddress = this.rCityName
          this.$set(this.returnGoodsForm, 'rAddress', rAddress)
          spsRefundHandleInfo = this.$common.copy(this.returnGoodsForm)
        }
        if(this.formValidate.processType === 2) {
          // 赋供应商名称
          this.supplierList.forEach(item => {
            if(item.supplierId == this.quanlityForm.supplierId) {
              this.$set(this.quanlityForm, 'supplierName', item.supplierName)
            }
          })
          spsRefundHandleInfo = this.$common.copy(this.quanlityForm)
          spsRefundHandleInfo.qualityInspectionRatio = Number(spsRefundHandleInfo.qualityInspectionRatio) 
        } else if(this.formValidate.processType === 3) {
          this.supplierList.forEach(item => {
            if(item.supplierId == this.fixedForm.supplierId) {
              this.$set(this.fixedForm, 'supplierName', item.supplierName)
            }
          })
          spsRefundHandleInfo = this.$common.copy(this.fixedForm)
        }
        else {
          spsRefundHandleInfo = this.$common.copy(this[this.formDataMap[this.formValidate.processType]])
        }
        spsRefundHandleInfo.returnId = this.dialogObj.returnId
        spsRefundHandleInfo.referenceNo = this.dialogObj.referenceNo
        spsRefundHandleInfo.processType = this.formValidate.processType
        // 最终对象
        let obj = {
          spsRefundHandleInfo: spsRefundHandleInfo,
          spsRefundHandleDetailInfoList: spsRefundHandleDetailInfoList
        }
        const rAddressId = this.returnGoodsForm.rAddressId ?  this.returnGoodsForm.rAddressId.join(',') : ''
        obj.spsRefundHandleInfo.rAddressId ?  obj.spsRefundHandleInfo.rAddressId = rAddressId : ''
        this.axios.post(api.create_refundHandle, obj).then(res => {
          if(res.data.code === 0) {
            this.$emit('refresh', true)
            this.dialogObj.modelVisible = false
          }
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