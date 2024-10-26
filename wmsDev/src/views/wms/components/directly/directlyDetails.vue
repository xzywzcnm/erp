<template >
  <div class="page-details" v-show="modalVisible" :class="{'page-loading': pageLoading}">
    <div class="details-head">
      <div class="details-head-text">
        <span class="details-back" @click="backList"><Icon type="ios-arrow-back" />返 回</span>
        <!-- <span class="details-title">11</span> -->
        <div class="button-group">
          <Button type="primary" v-if="isAdd" @click="saveDetail('add', 0)" :disabled="pageLoading">创建直发单</Button>
          <Button type="primary" v-if="isAdd" @click="saveDetail('add', 1)" :disabled="pageLoading">创建并提交直发单</Button>
          <Button type="primary" v-if="isEdit" @click="saveDetail('edit', 1)" :disabled="pageLoading">保 存</Button>
          <Button
            type="primary"
            v-if="isEdit && [0].includes(Number(formData.deliverPickingStatus))"
            @click="saveDetail('edit', 0)"
            :disabled="pageLoading"
          >保存并提交</Button>
          <Button type="primary" v-if="isVerify && !loadFail" @click="verifyGoods" :disabled="pageLoading">收货确认</Button>
          <Button @click="backList">取消</Button>
          <span v-if="loadFail" class="ml10" style="color: #f20;">详情数据加载失败，不可操作</span>
        </div>
      </div>
      <div class="button-group">
        <Button type="error" v-if="isEdit && [0].includes(Number(formData.deliverPickingStatus))" @click="deleteOutOrder" :disabled="pageLoading">删除</Button>
      </div>
    </div>
    <div class="details-main">
      <Form ref="fromRef" class="main-from" :model="formData" :rules="formRules" :label-width="120" :inline="true">
        <FormItem label="出库单号：" class="form-inline-item text-content">
          {{ viewType == 'add' ? '保存后创建' : moduleData.directDeliverPickingNo }}
        </FormItem>
        <FormItem label="供应商：" class="form-inline-item text-content">
          {{ supplierName }}
        </FormItem>
        <FormItem label="平台主体：" class="form-inline-item text-content">
          {{ platformNmae }}
        </FormItem>
        <FormItem label="店铺：" class="form-inline-item text-content">
          {{ accountName }}
        </FormItem>
        <FormItem label="平台订单号：" prop="platformOrderNo" class="form-inline-item" :class="isAdd || isEdit ? '' : 'text-content'">
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.platformOrderNo"
            :clearable="true"
            placeholder="请输入平台订单号"
          />
          <span v-else>{{ formData.platformOrderNo }}</span>
        </FormItem>
        <FormItem label="参考编号：" prop="referenceNo" class="form-inline-item" :class="isAdd || isEdit ? '' : 'text-content'">
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.referenceNo"
            :clearable="true"
            placeholder="请输入参考编号"
          />
          <span v-else>{{ formData.referenceNo }}</span>
        </FormItem>
        <FormItem label="创建人：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ this.getUserName(moduleData.createdBy) }}
        </FormItem>
        <FormItem label="创建时间：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ moduleData.createdTime }}
        </FormItem>
        <FormItem
          label="备注："
          prop="remark"
          :class="isAdd || isEdit ? 'form-inline-double-item' : 'form-inline-item text-content'"
        >
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.remark"
            :clearable="true"
            placeholder="请输入备注"
          />
          <span v-else>{{ formData.remark }}</span>
        </FormItem>
        <FormItem label="SKU总数量：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.skuNumber }}
        </FormItem>
        <FormItem label="商品总数量：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.orderNumberSum }}
        </FormItem>
        <FormItem label="预估总重量(kg)：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.goodsWeightSum }}
        </FormItem>
        <FormItem label="发货总数量：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.deliverNumberSum }}
        </FormItem>
        <FormItem label="未发货总数量：" class="form-inline-item text-content txt-red" v-if="!(isAdd || isEdit)">
          {{ pageDetails.notDeliverNumberSum }}
        </FormItem>
        <FormItem label="收货时间：" class="form-inline-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.receiveTime || '' }}
        </FormItem>
        <FormItem label="供应商备注：" class="form-inline-double-item text-content" v-if="!(isAdd || isEdit)">
          {{ pageDetails.supplierRemark }}
        </FormItem>
        <FormItem
          label="快递公司："
          prop="expressCompany"
          class="form-inline-item"
          :class="isAdd || isEdit ? 'form-required-item item-reduce-width' : 'text-content'"
        >
          <dyt-select v-model="formData.expressCompany" placeholder="请选择快递公司" v-if="isAdd || isEdit">
            <Option
              v-for="(item, index) in logisticsList"
              :value="item.logisticsId"
              :key="`e-${index}`"
              :label="item.logisticsName"
            />
          </dyt-select>
          <span v-else>{{ expressName }}</span>
        </FormItem>
        <FormItem
          label="快递业务："
          prop="expressBusiness"
          class="form-inline-item"
          :class="isAdd || isEdit ? 'item-reduce-width' : 'text-content'"
        >
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.expressBusiness"
            :clearable="true"
            placeholder="请输入快递业务"
          />
          <span v-else>{{ formData.expressBusiness }}</span>
        </FormItem>
        <FormItem
          label="快递单号："
          prop="trackingNumber"
          class="form-inline-item"
          :class="isAdd || isEdit ? 'form-required-item item-reduce-width' : 'text-content'"
        >
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.trackingNumber"
            :clearable="true"
            placeholder="请输入快递单号"
          />
          <span v-else>{{ formData.trackingNumber }}</span>
        </FormItem>
        <FormItem
          label="预约时间："
          prop="appointmentTime"
          class="form-inline-item"
          :style="isAdd || isEdit ? 'min-width: 465px;' : ''"
          :class="isAdd || isEdit ? 'form-required-item' : 'text-content'"
        >
          <DatePicker
            v-if="isAdd || isEdit"
            style="width: calc(100% - 180px);"
            type="datetime"
            transfer
            placeholder="请选择预约时间"
            v-model="formData.appointmentTime"
            format="yyyy-MM-dd HH:mm:ss"
          />
          <span v-else>{{ formData.appointmentTime }}</span>
          <span style="margin-left: 5px; color:#f20;" v-if="appointmentTxt">{{ appointmentTxt }}</span>
          <span class="underline" style="margin-left: 5px;" @click="pasteFun" v-if="isAdd || isEdit">粘贴快递复制字串解析</span>
        </FormItem>
        <FormItem label="装箱备注：" prop="encasementRemark" class="form-inline-plus-item" :class="isAdd || isEdit ? '' : 'text-content'">
          <Input
            v-if="isAdd || isEdit"
            v-model="formData.encasementRemark"
            :clearable="true"
            placeholder="请输入装箱备注"
          />
          <span v-else>{{ formData.encasementRemark }}</span>
        </FormItem>
        <div v-for="(item, index) in (formData.wmsDeliverInfoVOList || [])" :key="`file-${index}`">
          <FormItem
            :prop="`wmsDeliverInfoVOList[${index}].platformDeliverNo`"
            class="form-inline-item custom-label"
            :class="isAdd || isEdit ? '' : 'text-content'"
          >
            <span slot="label" class="item-label">
              <Icon
                v-if="isAdd || isEdit"
                :type="index == 0 ? 'md-add-circle' : 'md-remove-circle'"
                class="cursorClick"
                @click="addDeliver(index)"
              />
              <span>平台发货单号：</span>
            </span>
            <Input
              v-if="isAdd || isEdit"
              v-model="item.platformDeliverNo"
              :clearable="true"
              placeholder="请输入平台发货单号"
            />
            <span v-else>{{ item.platformDeliverNo }}</span>
          </FormItem>
          <FormItem label="" :label-width="0" v-if="isAdd || isEdit">
            <dyt-loadingText
              :loading="item.getExcelLoading"
              :disabled="$common.isEmpty(item.platformDeliverNo) || getFileLoading[index]"
              @click="getOrderFile(item, index)"
              class="ml10"
              title="输入平台发货单号后，“获取文件”按纽可用"
            >获取文件</dyt-loadingText>
          </FormItem>
          <FormItem label="" :label-width="0" v-if="isAdd || isEdit">
            <dyt-loadingText
              :loading="item.getExcelLoading"
              @click="openUploadModal(item, index)"
              class="ml10"
              title="点击选择文件"
            >上传新文件</dyt-loadingText>
          </FormItem>
          <FormItem
            label="发货单文件："
            :prop="`wmsDeliverInfoVOList[${index}].deliverFile`"
            :rules="verifyDeliverFile"
            style="min-width: 255px;"
            :class="isAdd || isEdit ? 'form-required-item' : 'form-inline-item text-content'"
          >
            <div v-for="(file, fIndex) in item.deliverFile" :key="`f-${fIndex}`">
              <span class="underline" @click="previewWashedPdf(file)">{{ file.fileName }}</span>
              <Icon type="md-close" class="closeIcon" @click="delUplodFile(index, fIndex)" title="移除文件" v-if="isAdd || isEdit" />
            </div>
          </FormItem>
        </div>
        <div class="block-head">
          <div class="head-title">商品信息</div>
          <div class="head-tips" v-if="isAdd || isEdit">提示：产品SKU必须能匹配到：1、第三方条码资料；2、供应商库存余量中有数据；3、“待发货”的直发采购单；</div>
          <div class="head-update-tips" v-if="isVerify">
            <span class="underline" @click="getAndUpdateTableNumber">获取并更新平台收货数据</span>
            <span class="ml10" v-if="updateData.state == 'success'" style="color: #00ad00;">获取成功</span>
            <span class="ml10" v-if="updateData.state == 'fail'" style="color: #f20;">获取失败</span>
          </div>
        </div>
        <div class="mt20 product-content">
          <Button
            type="primary"
            @click="openChoseModal"
            v-if="isAdd || (isEdit && [0].includes(Number(formData.deliverPickingStatus)))"
          >添加商品</Button>
          <Table
            v-if="modalVisible"
            class="modal-table mt20"
            border
            highlight-row
            ref="tableRef"
            :max-height="650"
            :columns="tableColumns"
            :data="formData.wmsDirectDeliverPickingDetailList"
          >
            <!-- 订单数量 -->
            <template slot-scope="{ row, index }" slot="orderNumber">
              <FormItem
                v-if="isAdd || (isEdit && [0].includes(Number(formData.deliverPickingStatus)))"
                label=""
                :prop="`wmsDirectDeliverPickingDetailList[${index}].orderNumber`"
                class="table-form-item"
                :label-width="0"
                :rules="tableItemRules.orderNumber"
              >
                <Input
                  v-model="formData.wmsDirectDeliverPickingDetailList[index].orderNumber"
                  placeholder="请输入订单数量"
                  :clearable="true"
                />
              </FormItem>
              <span v-else>{{ formData.wmsDirectDeliverPickingDetailList[index].orderNumber }}</span>
            </template>
            <!-- 平台入库 -->
            <template slot-scope="{ row, index }" slot="platformReceiptNumber">
              <FormItem
                v-if="isVerify && !loadFail"
                label=""
                :prop="`wmsDirectDeliverPickingDetailList[${index}].platformReceiptNumber`"
                class="table-form-item"
                :label-width="0"
                :rules="tableItemRules.platformReceiptNumber"
              >
                <Input
                  v-model="formData.wmsDirectDeliverPickingDetailList[index].platformReceiptNumber"
                  placeholder="请输入整数"
                  :clearable="true"
                />
              </FormItem>
              <span v-else>{{ formData.wmsDirectDeliverPickingDetailList[index].platformReceiptNumber }}</span>
            </template>
            <!-- 平台退货 -->
            <template slot-scope="{ row, index }" slot="platformReturnNumber">
              <FormItem
                v-if="isVerify && !loadFail"
                label=""
                :prop="`wmsDirectDeliverPickingDetailList[${index}].platformReturnNumber`"
                class="table-form-item"
                :label-width="0"
                :rules="tableItemRules.platformReturnNumber"
              >
                <Input
                  v-model="formData.wmsDirectDeliverPickingDetailList[index].platformReturnNumber"
                  placeholder="请输入整数"
                  :clearable="true"
                />
              </FormItem>
              <span v-else>{{ formData.wmsDirectDeliverPickingDetailList[index].platformReturnNumber }}</span>
            </template>
          </Table>
        </div>
      </Form>
    </div>
    <!-- 选择商品弹窗 -->
    <selectProductModal
      :visible.sync="choseGoodsVisible"
      :module-data="moduleData"
      :chose-list="choseGoodsList"
      :sale-account="selectSaleAccount"
      :select-platform="selectPlatform"
      :select-supplier="selectSupplier"
      @confirmChose="confirmProduct"
    />
    <!-- 上传文件 -->
    <dytUpload
      v-show="false"
      :action="uploadApi"
      accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.xlsm,.doc,.docx"
      name="files"
      :maxSize="5120"
      :show-upload-list="false"
      :multiple="true"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-format-error="formatError"
      :on-exceeded-size="exceededSize"
      ref="uploadExcel"
    >
      <Button class="choseUploadFiles">上传文件</Button>
    </dytUpload>
    <!-- 加载遮罩层 -->
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import selectProductModal from './selectProductModal';

const transferNumber = ['orderNumber', 'deliverNumber', 'platformReceiptNumber', 'platformReturnNumber'];
// 创建时的列
const addColumnKey = [
  'index', 'goodsUrl', 'platformSku', 'labelCode', 'goodsSku', 'supplierItem', 'goodsAttributes', 'goodsCnDesc',
  'orderNumber', 'inventoryNumber', 'matchPurchaseNumber', 'waitNumber', 'operation'
];
// 确认收货(待发货)时的列
const awaitColumnKey = [
  'goodsUrl', 'platformSku', 'labelCode', 'goodsSku', 'supplierItem', 'goodsAttributes', 'goodsCnDesc',
  'orderNumber', 'deliverNumber', 'matchPurchaseNumber', 'platformReceiptNumber', 'platformReturnNumber'
];
// 已(完成)收货时的列
const completeColumnKey = [
  'goodsUrl', 'platformSku', 'labelCode', 'goodsSku', 'supplierItem', 'goodsAttributes', 'goodsCnDesc',
  'orderNumber', 'deliverNumber', 'matchPurchaseNumber', 'platformReceiptNumber', 'platformReturnNumber'
];

export default {
  name: 'directlyDetails',
  mixins: [Mixin],
  components: {
    selectProductModal
  },
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 其他数据
    otherData: {
      type: Object,
      default: () => {
        return {
          type: 'add',
          platformSaleAccountObj: {},
          platformDataList: [],
          supplierDataList: []
        }
      }
    },
    visible: { type: Boolean, default: false },
    // 视图类型
    viewType: { type: String, default: 'view' }
  },
  data () {
    return {
      modalVisible: false,
      pageLoading: false,
      getFileLoading: {},
      choseGoodsVisible: false,
      loadFail: false,
      // 更新数据信息
      updateData: {
        loading: false,
        state: 'init'
      },
      choseGoodsList: [],
      uploadApi: api.fullManage_uploadBoxLabel,
      uploadIndex: null,
      whouseId: this.$store.state.warehouseId,
      // 平台文件的对象
      wmsDeliverInfoObj: {
        platformDeliverNo: '',
        deliverFile: [],
      },
      pageDetails: {},
      oldData: {},
      formData: {
        warehouseId: this.$store.state.warehouseId,
        directDeliverPickingNo: '', // 后端说这个值不用管，可以不传
        supplierId: '',
        platformSubject: '',
        saleAccountId: '',
        accountCode: '',
        platformOrderNo: '',
        referenceNo: '',
        remark: '',
        supplierRemark: '',
        expressCompany: '',
        expressBusiness: '',
        trackingNumber: '',
        encasementRemark: '',
        appointmentTime: '',
        wmsDeliverInfoVOList: [],
        deliverPickingStatus: null,
        businessDeptId: '',
        directDeliverPickingType: 0, // 直发出库单类型：0：全托管直发出库单 写死
        supplierCode: '',
        wmsDirectDeliverPickingDetailList: []
      },
      formRules: {
        expressCompany: [
          { getRequired: () => this.isAdd || this.isEdit, validator: this.verifyItem, msg: '请选择快递公司', trigger: 'change' }
        ],
        trackingNumber: [
          { getRequired: () => this.isAdd || this.isEdit, validator: this.verifyItem, msg: '请输入快递单号', trigger: 'change' },
          { getRequired: () => this.isAdd || this.isEdit, validator: this.verifyItem, msg: '请输入快递单号', trigger: 'blur' }
        ],
        appointmentTime: [
          { getRequired: () => this.isAdd || this.isEdit, validator: this.verifyItem, msg: '请选择预约时间', trigger: 'change' }
        ]
      },
      // 表格验证规则
      tableItemRules: {
        // 订单数量
        orderNumber: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 0, msg: '请输入订单数量', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 0, msg: '请输入订单数量', trigger: 'blur' }
        ],
        // 平台入库
        platformReceiptNumber: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入整数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入整数', trigger: 'blur' }
        ],
        // 平台退货
        platformReturnNumber: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入整数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入整数', trigger: 'blur' }
        ]
      },
      // 验证上传文件
      verifyDeliverFile: [
        { getRequired: () => this.isAdd || this.isEdit, validator: this.verifyFileHand, msg: '请上传发货单文件', trigger: 'change' }
      ],
      // 所有列
      allColumns: {
        index: {
          title: "行号",
          key: "index",
          align: "center",
          width: 50,
          render: (h, { index }) => {
            return h('span', {}, index + 1)
          }
        },
        goodsUrl: {
          title: "图片",
          key: "goodsUrl",
          align: "center",
          width: 80,
          render: (h, { row }) => {
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, [this.tableImg(h, row, "goodsUrl")]);
          }
        },
        platformSku: {
          title: "平台SKU",
          key: "platformSku",
          align: "center",
          width: 110
        },
        labelCode: {
          title: "条码编码",
          key: "labelCode",
          align: "center",
          width: 110
        },
        goodsSku: {
          title: "商品SKU",
          key: "goodsSku",
          align: "center",
          width: 110
        },
        supplierItem: {
          title: "供方货号",
          key: "supplierItem",
          align: "center",
          width: 110
        },
        goodsAttributes: {
          title: "SKU属性",
          key: "goodsAttributes",
          align: "center",
          minWidth: 110
        },
        goodsCnDesc: {
          title: "中文描述",
          key: "goodsCnDesc",
          align: "center",
          minWidth: 150
        },
        orderNumber: {
          title: "订单数量",
          slot: 'orderNumber',
          align: "center",
          width: 130,
        },
        inventoryNumber: {
          title: "库存余量",
          key: "inventoryNumber",
          align: "center",
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.matchPurchaseNumber) || this.$common.isEmpty(row.inventoryNumber)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, '无法匹配');
            }
            return h('span', {}, row.inventoryNumber);
          }
        },
        matchPurchaseNumber: {
          title: "匹配采购单号",
          key: "matchPurchaseNumber",
          align: "center",
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.matchPurchaseNumber) || this.$common.isEmpty(row.inventoryNumber)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, '无法匹配');
            }
            return h('span', {}, row.matchPurchaseNumber);
          }
        },
        waitNumber: {
          title: "未发货数量",
          key: "waitNumber",
          align: "center",
          width: 100
        },
        deliverNumber: {
          title: "发货数量",
          key: "deliverNumber",
          align: "center",
          width: 100
        },
        platformReceiptNumber: {
          title: "平台入库",
          slot: 'platformReceiptNumber',
          align: "center",
          width: 130,
        },
        platformReturnNumber: {
          title: "平台退货",
          slot: 'platformReturnNumber',
          align: "center",
          width: 130,
        },
        operation: {
          title: "操作",
          key: "operation",
          align: "center",
          width: 100,
          fixed: 'right',
          render: (h, { row, index }) => {
            let item = [];
            item.push(h('span', {
              class: 'operation-btn',
              on: {
                click: () => {
                  this.removeTableRow(row, index);
                }
              }
            }, '删除'));
            return item;
          }
        },
      },
      defaultColumns: [],
      // 操作列
      operationCol: {},
      // 选择的供应商
      selectSupplier: {},
      // 选择的平台主体
      selectPlatform: {},
      // 选择的店铺
      selectSaleAccount: {}
    };
  },
  watch: {
    visible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.$emit('update:visible', val);
      }
    }
  },
  created () {},
  computed: {
    // 创建
    isAdd () {
      return this.viewType == 'add';
    },
    // 编辑
    isEdit () {
      return this.viewType == 'edit' && !this.loadFail;
    },
    // 收货
    isVerify () {
      return this.viewType == 'verify';
    },
    // 查看
    isView () {
      return this.viewType == 'view';
    },
    // 列表
    tableColumns () {
      let colList = [];
      if (this.isAdd || [0].includes(Number(this.formData.deliverPickingStatus))) {
        addColumnKey.forEach(key => {
          if (this.isView) {
            key != 'operation' && colList.push(this.allColumns[key]);
          } else if (!this.$common.isEmpty(this.allColumns[key])) {
            colList.push(this.allColumns[key]);
          }
        })
        return colList;
      }
      if ([1, 2].includes(Number(this.formData.deliverPickingStatus))) {
        awaitColumnKey.forEach(key => {
          if (!this.$common.isEmpty(this.allColumns[key])) {
            colList.push(this.allColumns[key]);
          }
        })
        return colList
      }
      if ([3].includes(Number(this.formData.deliverPickingStatus))) {
        completeColumnKey.forEach(key => {
          if (!this.$common.isEmpty(this.allColumns[key])) {
            colList.push(this.allColumns[key]);
          }
        })
        return colList
      }
    },
    // 供应商
    supplierDataList () {
      return this.otherData.supplierDataList || [];
    },
    // 平台主体
    platformDataList () {
      return this.otherData.platformDataList || [];
    },
    // 店铺
    platformSaleAccountList () {
      if (this.$common.isEmpty(this.otherData.platformSaleAccountObj) || this.$common.isEmpty(this.moduleData.platformSubject)) return [];
      return this.otherData.platformSaleAccountObj[this.moduleData.platformSubject] || [];
    },
    // 快递公司
    logisticsList () {
      return this.otherData.logisticsList || [];
    },
    // 快递公司名字
    expressName () {
      if (this.$common.isEmpty(this.formData.expressCompany)) return '';
      const expressInfo = this.logisticsList.find(item => item.logisticsId == this.formData.expressCompany);
      if (this.$common.isEmpty(expressInfo)) return this.formData.expressCompany;
      return expressInfo.logisticsName || '';
    },
    // 当前供应商名称
    supplierName () {
      if (this.$common.isEmpty(this.selectSupplier)) return '';
      return this.selectSupplier.supplierName;
    },
    // 当前平台主体名称
    platformNmae () {
      if (this.$common.isEmpty(this.selectPlatform)) return '';
      return this.selectPlatform.platformName;
    },
    // 当前店铺名称
    accountName () {
      if (this.$common.isEmpty(this.selectSaleAccount)) return '';
      return this.selectSaleAccount.account;
    },
    // 登录人事业部
    loginBusinessDeptId () {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser.businessDeptId)) return '';
      return this.$store.getters.authUserInfo.securityUser.businessDeptId;
    },
    // 今天、明天、后天
    appointmentTxt () {
      if (this.$common.isEmpty(this.formData.appointmentTime)) return '';
      const dateDay = this.$common.dayjs(new Date(this.formData.appointmentTime)).format('YYYY-MM-DD');
      const nowDay = this.$common.dayjs().format('YYYY-MM-DD');
      if (nowDay == dateDay) return '今天';
      if (this.$common.dayjs(nowDay).add(1, 'day').isSame(dateDay, 'day')) return '明天';
      if (this.$common.dayjs(nowDay).add(2, 'day').isSame(dateDay, 'day')) return '后天';
      return '';
    }
  },
  activated () {},
  mounted () {},
  methods: {
    // 初始数据
    initData () {
      this.pageLoading = true;
      this.oldData = this.$common.copy(this.formData);
      setTimeout(() => {
        this.selectSupplier = this.supplierDataList.find(item => item.supplierId == this.moduleData.supplierId) || {};
        this.selectPlatform = this.platformDataList.find(item => item.platformId == this.moduleData.platformSubject) || {};
        this.selectSaleAccount = this.platformSaleAccountList.find(item => item.saleAccountId == this.moduleData.saleAccountId) || {};
        // 获取详情
        this.getDetails().finally(() => {
          this.pageLoading = false;
        })
      }, 300)
    },
    // 获取详情
    getDetails () {
      return new Promise((resolve) => {
        if (this.isAdd) {
          this.formData.wmsDeliverInfoVOList = [this.$common.copy(this.wmsDeliverInfoObj)];
          this.formData.accountCode = this.selectSaleAccount.accountCode;
          this.formData.saleAccountId = this.selectSaleAccount.saleAccountId;
          this.formData.supplierCode = this.selectSupplier.supplierCode;
          this.formData.supplierId = this.selectSupplier.supplierId;
          this.formData.businessDeptId = this.loginBusinessDeptId;
          this.formData.platformSubject = this.selectPlatform.platformId;
          delete this.formData.directDeliverPickingNo;
          return resolve({});
        }
        // 非创建都请求详情
        this.axios.get(api.queryDirectDeliverPickingInfo, {
          params: {
            directDeliverPickingNo: this.moduleData.directDeliverPickingNo
          }
        }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return resolve({});
          this.pageDetails = this.$common.copy(res.data.datas);
          let newData = {};
          Object.keys(this.formData).forEach(key => {
            if (!this.$common.isUndefined(res.data.datas[key])) {
              newData[key] = res.data.datas[key];
            }
          });
          // 上传的文件
          (newData.wmsDeliverInfoVOList || []).forEach(item => {
            item.deliverFile = this.$common.isEmpty(item.deliverFile) ? [] : JSON.parse(item.deliverFile);
          });
          // 当编辑状态时，接口返回 wmsDeliverInfoVOList 为空，则增加空文件
          if ((this.isEdit || this.isAdd) && this.$common.isEmpty(newData.wmsDeliverInfoVOList)) {
            newData.wmsDeliverInfoVOList = [this.$common.copy(this.wmsDeliverInfoObj)];
          }
          if (!this.$common.isEmpty(newData.expressCompany) && !this.$common.isEmpty(Number(newData.expressCompany))) {
            newData.expressCompany = Number(newData.expressCompany);
          }
          if (this.$common.isEmpty(newData.appointmentTime)) {
            newData.appointmentTime = '';
          }
          this.formData = newData;
          resolve(this.formData);
        }).catch(() => {
          this.loadFail = true;
          resolve({});
        })
      })
    },
    // 重置数据
    resetFromData () {
      this.pageLoading = false;
      this.loadFail = false;
      this.updateData = {
        loading: false,
        state: 'init'
      };
      this.getFileLoading = {};
      this.formData = this.$common.copy(this.oldData);
      this.$nextTick(() => {
        this.$refs.fromRef && this.$refs.fromRef.resetFields();
        setTimeout(() => {
          this.$refs.fromRef && this.$refs.fromRef.resetFields();
        }, 300)
      })
    },
    // 返回
    backList () {
      this.resetFromData();
      this.$nextTick(() => {
        this.modalVisible = false;
      })
    },
    // 验证
    verifyItem (rule, value, callback) {
      this.$nextTick(() => {
        const newVal = this.formData[rule.field];
        let required = rule.required;
        if (this.$common.isFunction(rule.getRequired)) {
          required = rule.getRequired();
        }
        if (required && this.$common.isEmpty(newVal)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        callback();
      })
    },
    // 验证文件
    verifyFileHand (rule, value, callback) {
      let required = rule.required;
      if (this.$common.isFunction(rule.getRequired)) {
        required = rule.getRequired();
      }
      if (required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      callback();
    },
    // 移除行
    removeTableRow (row, index) {
      this.formData.wmsDirectDeliverPickingDetailList.splice(index, 1);
    },
    // 打开选择商品弹窗
    openChoseModal () {
      this.choseGoodsList = this.$common.copy(this.formData.wmsDirectDeliverPickingDetailList);
      this.$nextTick(() => {
        this.choseGoodsVisible = true;
      })
    },
    // 点击粘贴按钮时
    pasteFun () {
      this.$common.getClipboard().then(content => {
        this.handleLogisInfo(content);
      }).catch(({ message }) => {
        this.$Message.error(message);
      })
    },
    // 处理粘贴板内容
    handleLogisInfo (content) {
      if (this.$common.isEmpty(content)) {
        this.$Message.error("剪贴板内容为空!");
      }
      const getContent = content.replace(",", "，");
      let logisticsInfo = {};
      getContent.split("，").forEach((item, index) => {
        if (index == 0) {
          logisticsInfo = this.logisticsList.find(log => log.logisticsName == item);
          if (!this.$common.isEmpty(logisticsInfo)) {
            this.formData.expressBusiness = logisticsInfo.logisticsId;
          } else {
            this.formData.expressBusiness = item;
          }
        } else if (index < 3) {
          if (this.$common.isEmpty(logisticsInfo)) {
            if (index == 1) {
              this.formData.trackingNumber = item;
            }
          } else if (index == 1) {
            this.formData.expressBusiness = item;
          } else if (index == 2) {
            this.formData.trackingNumber = item;
          }
        }
      })
    },
    // 添加、删除平台发货
    addDeliver (index) {
      if (index == 0) {
        this.formData.wmsDeliverInfoVOList.push(this.$common.copy(this.wmsDeliverInfoObj));
        return;
      }
      this.formData.wmsDeliverInfoVOList.splice(index, 1);
    },
    // 获取文件
    getOrderFile (item, index) {
      if (this.$common.isEmpty(this.getFileLoading[index])) {
        this.$set(this.getFileLoading, index, true);
      } else {
        if (this.getFileLoading[index]) return;
        this.getFileLoading[index] = true;
      }
      this.axios.get(api.getDispatchOrderFile, {
        params: {
          platformDeliverNo: item.platformDeliverNo,
          saleAccountId: this.formData.saleAccountId,
          platformSubject: this.selectPlatform.platformName
        }
      }).then((res) => {
        if (!res || !res.data || res.data.code !== 0 || this.$common.isEmpty(res.data.datas)) return;
        let platformFile = [];
        const nowFileUrl = this.formData.wmsDeliverInfoVOList[index].deliverFile.map(m => m.fileUrl);
        if (this.$common.isArray(res.data.datas)) {
          res.data.datas.forEach(nf => {
            if (!nowFileUrl.includes(nf.targetFileUrl)) {
              platformFile.push({ fileName: nf.originalFileName, fileUrl: nf.targetFileUrl });
            }
          })
        } else if (!nowFileUrl.includes(res.data.datas.targetFileUrl)) {
          platformFile.push({ fileName: res.data.datas.originalFileName, fileUrl: res.data.datas.targetFileUrl });
        }
        if (this.$common.isEmpty(platformFile)) return;
        this.formData.wmsDeliverInfoVOList[index].deliverFile = [...this.formData.wmsDeliverInfoVOList[index].deliverFile, ...platformFile];
      }).finally(() => {
        this.getFileLoading[index] = false;
      })
    },
    // 删除出库单
    deleteOutOrder () {
      if (this.pageLoading) return;
      this.$Modal.confirm({
        title: '操作提示',
        content: `<div style="font-size: 16px;">确认删除该直发单？</div>`,
        closable: true,
        onOk: () => {
          this.pageLoading = true;
          this.axios.delete(`${api.deleteDirectDeliverPickingInfo}?directDeliverPickingNo=${this.moduleData.directDeliverPickingNo}`).then(res => {
            if (!res || !res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功');
            this.$nextTick(() => {
              this.$emit('refreshPage');
              // 返回列表
              this.backList();
            });
          }).finally(() => {
            this.pageLoading = false;
          });
        }
      });
    },
    // 点击上传文件
    openUploadModal(row, index) {
      this.uploadIndex = index;
      const dom = document.querySelector(".choseUploadFiles");
      if (!dom) return;
      dom.click();
    },
    // 文件超出指定大小限制时的钩子
    exceededSize(file, fileList) {
      this.$Message.warning("上传的文件大小不能超过5M");
    },
    // 格式错误回调
    formatError(file, fileList) {
      this.$Message.warning("上传的文件可以是：pdf文件，图片文件，word文件，excel文件!");
    },
    // 上传失败
    handleError(error, file, fileList) {
      this.$Message.error("上传失败", error);
    },
    // 上传成功
    handleSuccess(res, file, fileList) {
      if (!res || res.code != 0) return;
      this.formData.wmsDeliverInfoVOList[this.uploadIndex].deliverFile.push({
        fileName: file.name,
        fileUrl: Object.values(res.datas)[0]
      });
      this.$nextTick(() => {
        this.$refs.fromRef.validateField(`wmsDeliverInfoVOList[${this.uploadIndex}].deliverFile`);
      })
    },
    // 点击上传的文件，PDF文件可以直接查看与打印；图片文件，word文件，excel文件可以下载到本地；
    previewWashedPdf(file) {
      if (this.$common.isEmpty(file.fileUrl)) return;
      const pointList = file.fileUrl.split(".");
      const str = pointList[pointList.length - 1];
      let url = '';
      if (file.fileUrl.substring(0, 7) == 'http://' || file.fileUrl.substring(0, 8) == 'https://') {
        url = file.fileUrl;
      } else {
        url = `./filenode/s${file.fileUrl}`;
      }
      if (str === "pdf") {
        this.axios.get(url, { responseType: "blob" }).then((res) => {
          this.$common.blobToBase64(res.data || res.resData).then((data) => {
            const fileBold = this.$common.base64ToBlob(data, "application/pdf");
            this.$common.previewFile(fileBold);
          });
        });
      } else {
        window.open(url);
      }
    },
    // 删除文件
    delUplodFile(index, fIndex) {
      this.formData.wmsDeliverInfoVOList[index].deliverFile.splice(fIndex, 1);
    },
    // 确认选择的商品
    confirmProduct (list) {
      const newList = list.map(row => {
        return {
          ...row,
          goodsSku: row.lapaSku, // 商品sku
          goodsUrl: row.imageUrl, // 商品图片
          goodsAttributes: row.spec, // 商品属性
          goodsWeight: row.weight, // 商品重量
          goodsCnDesc: row.productName, // 商品名称(即：中文描述)
          orderNumber: null, // 订单数量
          platformReceiptNumber: null, // 平台入库
          platformReturnNumber: null, // 平台退货
        }
      });
      this.formData.wmsDirectDeliverPickingDetailList = [...this.formData.wmsDirectDeliverPickingDetailList, ...newList];
    },
    // 获取并更新平台收货数据
    getAndUpdateTableNumber () {
      if (this.updateData.loading) return;
      this.updateData.loading = true;
      this.axios.get(api.getDeliverPlatformPurchaseInfo, {
        params: {
          saleAccountId: this.formData.saleAccountId,
          platformOrderNo: this.formData.platformOrderNo,
          platformSubject: this.selectPlatform.platformName,
        }
      }).then((res) => {
        if (!res || !res.data || res.data.code != 0) {
          this.updateData.state = 'fail';
          return;
        }
        this.$Message.success('操作成功！');
        this.updateData.state = 'success';
        let tableJson = {};
        this.formData.wmsDirectDeliverPickingDetailList.forEach(row => {
          tableJson[row.platformSku] = row;
        });
        (res.data.datas || []).forEach(item => {
          if (!this.$common.isEmpty(item.platformSku) && !this.$common.isEmpty(tableJson[item.platformSku])) {
            tableJson[item.platformSku].platformReceiptNumber = item.platformReceiptNumber;
            tableJson[item.platformSku].platformReturnNumber = item.platformReturnNumber;
          }
        });
        // 更新列表数据
        this.formData.wmsDirectDeliverPickingDetailList = Object.values(tableJson);
      }).catch(() => {
        this.updateData.state = 'fail';
      }).finally(() => {
        this.updateData.loading = false;
      })
    },
    // 创建、保存、提交
    saveDetail (str, type) {
      if (this.pageLoading) return;
      this.$refs.fromRef.validate((valid) => {
        if (!valid) {
          return this.$Message.error('可能存在必填项或填写不规范项');
        }
        if (this.$common.isEmpty(this.formData.wmsDirectDeliverPickingDetailList)) {
          return this.$Modal.error({
            title: '操作提示',
            content: '商品不能为空，请选择对应的商品'
          })
        }
        this.pageLoading = true;
        let param = this.$common.copy(this.formData);
        let queryUrl = api.createDirectDeliverPicking;
        if (['add'].includes(str)) {
          // 创建
          param.deliverPickingStatus = type;
        } else if (['edit'].includes(str)) {
          queryUrl = api.updateDirectDeliverPicking;
          // 编辑
          param.isSave = type;
          if (type === 0) {
            param.deliverPickingStatus = 1;
          }
        }
        param.appointmentTime = this.$common.dayjs(new Date(param.appointmentTime)).format('YYYY-MM-DD HH:mm:ss');
        param.wmsDeliverInfoVOList = param.wmsDeliverInfoVOList.map(item => {
          return {
            ...item,
            deliverFile: this.$common.isEmpty(item.deliverFile) ? '' : JSON.stringify(item.deliverFile)
          }
        });
        // 转成 number
        transferNumber.forEach(key => {
          if (this.$common.isEmpty(param[key]) || this.$common.isEmpty(Number(param[key]))) {
            param[key] = 0;
          } else {
            param[key] = Number(param[key]);
          }
        });
        let isNotMatch = false;
        param.wmsDirectDeliverPickingDetailList = param.wmsDirectDeliverPickingDetailList.map(row => {
          if (!isNotMatch && (this.$common.isEmpty(row.matchPurchaseNumber) || this.$common.isEmpty(row.inventoryNumber))) {
            isNotMatch = true;
          }
          return {
            ...row,
            orderNumber: this.$common.isEmpty(Number(row.orderNumber)) ? 0 : Number(row.orderNumber)
          }
        });
        if (isNotMatch) {
          this.pageLoading = false;
          return this.$Modal.error({
            title: '操作提示',
            content: '不能创建直发单，有商品不能匹配到相应的资料'
          })
          // return this.$Message.error('不能创建直发单，有商品不能匹配到相应的资料');
        }
        this.axios.post(queryUrl, param).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          // 触发刷新列表
          this.$emit('refreshPage');
          // 返回列表
          this.backList();
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    },
    // 确认收货
    verifyGoods () {
      if (this.pageLoading) return;
      this.$refs.fromRef.validate((valid) => {
        if (!valid) {
          return this.$Message.error('可能存在必填项或填写不规范项');
        }
        this.pageLoading = true;
        let param = this.$common.copy(this.formData);
        const pramsArr = param.wmsDirectDeliverPickingDetailList.map(row => {
          return {
            ...row,
            platformReceiptNumber: this.$common.isEmpty(Number(row.platformReceiptNumber)) ? 0 : Number(row.platformReceiptNumber),
            platformReturnNumber: this.$common.isEmpty(Number(row.platformReturnNumber)) ? 0 : Number(row.platformReturnNumber),
            orderNumber: this.$common.isEmpty(Number(row.orderNumber)) ? 0 : Number(row.orderNumber)
          }
        });
        this.axios.post(api.receiptConfirmation, pramsArr).then((res) => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功！');
          // 触发刷新列表
          this.$emit('refreshPage');
          // 返回列表
          this.backList();
        }).finally(() => {
          this.pageLoading = false;
        })
      })
    }
  }
};
</script>
<style lang="less" scoped>
.page-details{
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background: #fff;
  border-left: 1px solid #eee;
  z-index: 10;
  overflow: auto;
  box-shadow: 0px 0px 5px #ccc inset;
  :deep(.ivu-form-item-label){
    padding: 10px 0px 10px 0;
  }
  &.page-loading{
    overflow: hidden;
  }
  .details-head{
    position: sticky;
    display: flex;
    top: 0;
    padding: 10px;
    justify-content: space-between;
    box-shadow: 0 2px 5px #ccc;
    background: #fff;
    z-index: 10;
    .details-head-text{
      padding-right: 15px;
      line-height: 32px;
      overflow: hidden;
      .details-back {
        display: inline-block;
        padding: 0 15px 0 0;
        font-size: 16px;
        color: #2d8cf0;
        cursor: pointer;
      }
      .details-title {
        display: inline-block;
        font-weight: bold;
      }
    }
    .button-group{
      display: inline-block;
      > button {
        margin-right: 10px;
        &:last-child {
          margin-right: 0px;
        }
      }
    }
  }
  .details-main{
    position: relative;
    padding: 10px 15px;
    .main-from{
      .form-required-item{
        :deep(.ivu-form-item-label){
          &:before{
            content: "*";
            display: inline-block;
            margin-right: 4px;
            line-height: 1;
            font-family: SimSun;
            font-size: 14px;
            color: #ed4014;
          }
        }
      }
      .form-inline-item{
        width: calc(25% - 10px);
        min-width: 280px;
        &.txt-red{
          color: #f20;
          :deep(.ivu-form-item-label){
            color: #f20;
          }
        }
        // max-width: 320px;
        &.item-reduce-width{
          width: calc(25% - 47px);
        }
      }
      .text-content{
        margin-bottom: 10px;
        :deep(.ivu-form-item-content){
          margin-top: 7px;
          line-height: 1.4em;
        }
      }
      .form-inline-double-item{
        width: calc(50% - 10px);
        min-width: 280px;
      }
      .form-inline-plus-item{
        width: calc(75% - 10px);
        min-width: 280px;
      }
      .form-inline-full-item{
        width: calc(100% - 10px);
        min-width: 280px;
      }
    }
  }
  .ivu-date-picker{
    width: 100%;
  }
  .underline {
    color: #2d8cf0;
    text-decoration: underline;
    text-underline-position: under;
    cursor: pointer;
  }
  .block-head{
    display: flex;
    position: relative;
    align-items: center;
    .head-title{
      position: relative;
      padding-left: 20px;
      height: 20px;
      line-height: 20px;
      &:before{
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 3px;
        height: 100%;
        background: #2d8cf0;
      }
    }
    .head-tips{
      margin-left: 20px;
      padding: 5px 15px;
      // color: #f20;
      background-color: rgba(230, 247, 255, 1);
      border: 1px solid rgba(102, 204, 255, 1);
      border-radius: 3px;
    }
    .head-update-tips {
      flex: 100;
      padding-right: 30px;
      text-align: right;
    }
  }
  .product-content{
    position: relative;
    padding: 0 20px;
  }
  .block-flex{
    display: flex;
    .flex-full{
      flex: 100;
    }
  }
  .custom-label{
    :deep(.ivu-form-item-label){
      padding: 0;
      height: 32px;
      line-height: 32px;
    }
    .item-label{
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .cursorClick{
    font-size: 24px;
    &.ivu-icon-md-add-circle{
      color: #2b85e4;
    }
    &.ivu-icon-md-remove-circle{
      color:#f20;
    }
  }
  .closeIcon{
    margin-left: 5px;
    font-size: 20px;
    cursor: pointer;
    color: #ed4014;
  }
}
</style>