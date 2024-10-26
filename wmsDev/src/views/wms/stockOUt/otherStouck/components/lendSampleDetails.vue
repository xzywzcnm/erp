<template>
  <div class="edit-page-main">
    <detailModel @backList="backList" :pageLoading="pageLoading">
      <div class="back--r" slot="lefts">
        <a href="javascript:;" @click="backList">
          <Icon type="ios-arrow-back" class="icon"></Icon>
          <span class="mr10">返回列表</span>
        </a>
        <Button class="ml10" type="primary" v-if="['add'].includes(viewType)" @click="saveLendSample(true)"
          :disabled="pageLoading">创建出库单</Button>
        <Button class="ml10" type="primary" v-if="['distribute'].includes(viewType) && permission.edit"
          :disabled="pageLoading" @click="saveLendSample(true)">保存</Button>
        <Button class="ml10" type="primary" v-if="['audit'].includes(viewType) && permission.audit"
          :disabled="pageLoading" @click="lendAudit">审核</Button>
        <Button class="ml10" type="primary" v-if="['lend'].includes(viewType) && permission.product"
          :disabled="pageLoading" @click="lendBorrow">确认借出</Button>
        <Button class="ml10" @click="backList">取消</Button>
      </div>
      <div slot="rights">
        <Button type="error"
          v-if="permission.delete && (['audit'].includes(viewType) || (!$common.isEmpty(pageDetails.pickingStatus) && [0, 1, 2, 20].includes(Number(pageDetails.pickingStatus))))"
          :disabled="pageLoading" @click="deleteLendSample">删除</Button>
      </div>
      <!-- 状态进度显示 -->
      <Steps :current="pickingStateInfo.index" class="page-steps-style"
        style="width: calc(100% - 50px); margin: 20px auto 30px auto;" v-if="!['add'].includes(viewType)">
        <Step title="订单创建" icon="md-cart"
          :content="$common.isEmpty(pageDetails.createdTime) ? '' : $common.toLocaleDate(pageDetails.createdTime, 'fulltime')" />
        <Step title="待审核" icon="md-contacts"
          :content="$common.isEmpty(pageDetails.auditPassTime) ? '' : $common.toLocaleDate(pageDetails.auditPassTime, 'fulltime')" />
        <Step title="待拣货" icon="ios-basket"
          :content="$common.isEmpty(pageDetails.pickingGoodsFinishTime) ? '' : $common.toLocaleDate(pageDetails.pickingGoodsFinishTime, 'fulltime')" />
        <Step title="待借出" icon="ios-send"
          :content="$common.isEmpty(pageDetails.deliverFinishTime) ? '' : $common.toLocaleDate(pageDetails.deliverFinishTime, 'fulltime')" />
        <Step title="待归还" icon="md-home"
          :content="$common.isEmpty(pageDetails.returnFinishTime) ? '' : $common.toLocaleDate(pageDetails.returnFinishTime, 'fulltime')" />
        <Step title="已完成" icon="md-git-compare"
          :content="$common.isEmpty(pageDetails.statusFinishTime) ? '' : $common.toLocaleDate(pageDetails.statusFinishTime, 'fulltime')" />
      </Steps>
      <!-- 表单数据 -->
      <Form class="main-edit-form" ref="mainForm" :model="formData" :rules="formRule" :label-width="100"
        label-position="right">
        <!-- 基本信息 -->
        <Tabs v-model="tabActive" @on-click="tabClick">
          <TabPane label="主信息" name="main" :index="1" class="form-item-line">
            <Form-item label="出库单号：">
              {{ viewType == 'add' ? '保存后自动创建' : pageDetails.pickingNo || '' }}
            </Form-item>
            <Form-item label="出库单类型：">
              借样出库
            </Form-item>
            <Form-item label="出库单状态：" v-if="viewType != 'add'">
              {{ pickingStateInfo.label || '' }}
            </Form-item>
            <Form-item label="创建人：">
              {{ viewType == 'add' ? erpUserName : createdByName }}
            </Form-item>
            <Form-item label="创建时间：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.createdTime)">
              {{ $common.toLocaleDate(pageDetails.createdTime, 'fulltime') }}
            </Form-item>
            <Form-item label="借用人：" prop="borrowUser" :class="{ 'ivu-form-item-required': mainEdit }">
              <dyt-select v-model="formData.borrowUser" placeholder="请选择借用人" v-if="mainEdit"
                @valueChange="borrowUserChange">
                <Option v-for="(item, index) in userListData" :value='item.userId' :label="item.userName"
                  :key="`user-${index}`" />
              </dyt-select>
              <span v-else-if="!$common.isEmpty(formData.borrowUser)">
                {{ userListData[formData.borrowUser] ? userListData[formData.borrowUser].userName || '' :
                  pageDetails.updatedBy }}
              </span>
            </Form-item>
            <Form-item label="借用事业部：" prop="borrowDeptId" :class="{ 'ivu-form-item-required': mainEdit }">
              <dyt-select v-model="formData.borrowDeptId" placeholder="请选择事业部" v-if="mainEdit">
                <Option v-for="(item, index) in allBusinessDept" :value='item.id' :label="item.name"
                  :key="`dept-${index}`" />
              </dyt-select>
              <span v-else>{{ borrowDeptName }}</span>
            </Form-item>
            <Form-item label="借用原因：" prop="borrowReason">
              <Input v-if="mainEdit" :clearable="true" v-model.trim="formData.borrowReason" placeholder="请输入借用原因" />
              <span v-else>{{ formData.borrowReason }}</span>
            </Form-item>
            <Form-item label="备注：" prop="remark" :style="mainEdit ? ` width: 50%;` : ''">
              <Input v-if="mainEdit" :clearable="true" v-model.trim="formData.remark" placeholder="请输入备注" />
              <span v-else>{{ formData.remark }}</span>
            </Form-item>
            <Form-item label="收货地址信息：" prop="shippingAddressInfo" :style="mainEdit ? ` width: 50%;` : ''">
              <Input v-if="mainEdit" :clearable="true" v-model.trim="formData.shippingAddressInfo"
                placeholder="请输入收货地址信息" />
              <span v-else>{{ formData.shippingAddressInfo }}</span>
            </Form-item>
            <Form-item label="收货方式：" prop="shippingMethod" :class="{ 'ivu-form-item-required': mainEdit }">
              <dyt-select v-model="formData.shippingMethod" placeholder="请选择收货方式" v-if="mainEdit">
                <Option :value='0' label="发快递" />
                <Option :value='1' label="自提" />
              </dyt-select>
              <span v-else>{{ formData.shippingMethod == 1 ? '自提' : '发快递' }}</span>
            </Form-item>
            <Form-item label="快递信息：" prop="deliveryInfo">
              <Input v-if="mainEdit" :clearable="true" v-model.trim="formData.deliveryInfo" placeholder="请输入快递信息" />
              <div v-else class="flex-start">
                <div>{{ formData.deliveryInfo }}</div>
                <div class="btn-icon">
                  <Icon type="ios-create-outline" @click="openDeliveryInfoEdit" />
                </div>
              </div>
            </Form-item>
            <Form-item label="是否归还：" prop="returnGoods" :class="{ 'ivu-form-item-required': mainEdit }">
              <dyt-select v-model="formData.returnGoods" placeholder="请选择" v-if="mainEdit" @valueChange="returnChange">
                <Option :value='1' label="归还" />
                <Option :value='0' label="不归还" />
              </dyt-select>
              <span v-else :style="`color:${formData.returnGoods == 1 ? '#46b503' : '#f20'}`">{{ formData.returnGoods == 1
                ? '归还' : '不归还' }}</span>
            </Form-item>
            <Form-item label="借用天数：" prop="borrowDays" v-if="formData.returnGoods == 1"
              :class="{ 'ivu-form-item-required': mainEdit }">
              <Input v-if="mainEdit" :clearable="true" v-model.trim="formData.borrowDays" placeholder="请输入借用天数" />
              <span v-else>{{ formData.borrowDays }}</span>
            </Form-item>
            <Form-item label="应还时间：" v-if="viewType != 'add' && formData.returnGoods == 1">
              {{ pageDetails.shouldReturnTime ? $common.toLocaleDate(pageDetails.shouldReturnTime, 'fulltime') : '' }}
            </Form-item>
            <Form-item label="拣货单编号：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.pickingGoodsNoList)">
              {{ (pageDetails.pickingGoodsNoList || []).join('，') }}
            </Form-item>
            <Form-item label="拣货状态：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.pickingGoodsStatus)">
              <span v-if="pickingStatusList[pageDetails.pickingGoodsStatus]">
                {{ pickingStatusList[pageDetails.pickingGoodsStatus].label }}
              </span>
              <span v-else>{{ pageDetails.pickingGoodsStatus }}</span>
            </Form-item>
            <Form-item label="归还入库单：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.returnReceiptNo)">
              {{ pageDetails.returnReceiptNo }}
            </Form-item>
            <Form-item label="入库单状态：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.receiptStatus)">
              <span v-if="receiptDataList[pageDetails.receiptStatus]">
                {{ receiptDataList[pageDetails.receiptStatus].label }}
              </span>
              <span v-else>{{ pageDetails.receiptStatus }}</span>
            </Form-item>
            <Form-item label="最后修改人：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.updatedBy)">
              <span v-if="userListData[pageDetails.updatedBy]">
                {{ userListData[pageDetails.updatedBy].userName }}
              </span>
              <span v-else>{{ pageDetails.updatedBy }}</span>
            </Form-item>
            <Form-item label="最后修改时间：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.updatedTime)">
              {{ $common.toLocaleDate(pageDetails.updatedTime, 'fulltime') }}
            </Form-item>
            <Form-item label="借出时间：" v-if="viewType != 'add' && !$common.isEmpty(moduleData.tableRow.lendTime)">
              {{ $common.toLocaleDate(moduleData.tableRow.lendTime, 'fulltime') }}
            </Form-item>
            <Form-item label="借出数量：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.borrowNumberTotal)">
              {{ pageDetails.borrowNumberTotal }}
            </Form-item>
            <Form-item label="借出金额：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.borrowAmountTotal)">
              {{ pageDetails.borrowAmountTotal }}
            </Form-item>
            <Form-item label="归还数量：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.returnGoodsCountTotal)">
              {{ pageDetails.returnGoodsCountTotal }}
            </Form-item>
            <Form-item label="未归还数量：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.unReturnGoodsCountTotal)">
              <span class="error-txt">{{ pageDetails.unReturnGoodsCountTotal }}</span>
            </Form-item>
            <Form-item label="未归还金额：" v-if="viewType != 'add' && !$common.isEmpty(pageDetails.unReturnAmountTotal)">
              <span class="error-txt">{{ pageDetails.unReturnAmountTotal }}</span>
            </Form-item>
          </TabPane>
          <TabPane label="分配信息" name="allot" :index="2" class="form-item-line"
            v-if="!$common.isEmpty(allocationData.queryPickingBatchResult)">
            <assignPage :data="allocationData" />
          </TabPane>
        </Tabs>
        <!-- 产品 -->
        <div class="mt10 page-piece">
          <div class="piece-title">商品信息</div>
          <div class="mt10 page-operate-btn">
            <div>
              <Button class="ml10" type="primary" v-if="['add', 'distribute'].includes(viewType)"
                @click="openSelectProductModal">添加商品</Button>
              <Button class="ml10" type="error" v-if="['distribute'].includes(viewType)"
                @click="deleteTableRow(selectTableData, 'batch')" :disabled="selectTableData.length == 0">删除商品</Button>
            </div>
            <div>
              <Button class="ml10" type="primary" v-if="['distribute'].includes(viewType) && permission.allocated"
                :disabled="selectTableData.length == 0"
                @click="allocationRepertory(selectTableData, 'batch')">分配库存</Button>
              <Button class="ml10" type="primary" v-if="['distribute'].includes(viewType) && permission.frozen"
                @click="freezeAllocation(selectTableData)">冻结分配</Button>
              <Button class="ml10" type="primary"
                v-if="permission.unallocated && (['distribute'].includes(viewType) || (!$common.isEmpty(pageDetails.pickingStatus) && [0, 1, 2, 20].includes(Number(pageDetails.pickingStatus))))"
                :disabled="selectTableData.length == 0" @click="cancelAllocation(selectTableData)">取消分配</Button>
            </div>
          </div>
          <Table class="mt15" highlight-row border ref="tableRef" max-height="500" :columns="tableColumn"
            :data="formData.createBorrowSampleDetailBOList" @on-selection-change="tableCheckChange">
            <template slot-scope="{ index, row }" slot="expectedNumber">
              <Form-item label="" :prop="`createBorrowSampleDetailBOList.${index}.expectedNumber`" :label-width="0"
                :rules="tableRule.expectedNumber">
                <Input
                  v-if="(permission.add || permission.edit) && ($common.isEmpty(row.pickingDetailStatus) || row.pickingDetailStatus == 0)"
                  :clearable="true" v-model="formData.createBorrowSampleDetailBOList[index].expectedNumber"
                  placeholder="请输入商品数量" />
                <span v-else>{{ formData.createBorrowSampleDetailBOList[index].expectedNumber }}</span>
              </Form-item>
            </template>
            <template slot-scope="{ index, row }" slot="warehouseLocationName">
              <Form-item label="" :prop="`createBorrowSampleDetailBOList.${index}.warehouseLocationName`"
                :label-width="0">
                <Input
                  v-if="permission.allocated && (['distribute'].includes(viewType) && !$common.isEmpty(row.pickingDetailStatus) && [0, 1].includes(Number(row.pickingDetailStatus)))"
                  :clearable="true" :ref="`input-${index}`"
                  v-model="formData.createBorrowSampleDetailBOList[index].warehouseLocationName" placeholder="请选择库位"
                  @on-focus="locationNameFocus(row, index)" />
                <span v-else>{{ formData.createBorrowSampleDetailBOList[index].warehouseLocationName }}</span>
              </Form-item>
            </template>
            <template slot-scope="{ index, row }" slot="borrowNumber">
              <Form-item label="" :prop="`createBorrowSampleDetailBOList.${index}.borrowNumber`" :label-width="0"
                :rules="tableRule.borrowNumber">
                <Input v-if="['lend'].includes(viewType) && permission.product" :clearable="true"
                  v-model="formData.createBorrowSampleDetailBOList[index].borrowNumber" placeholder="请输入借出数量" />
                <span v-else>{{ formData.createBorrowSampleDetailBOList[index].borrowNumber }}</span>
              </Form-item>
            </template>
          </Table>
        </div>
      </Form>
      <!-- 操作日志 -->
      <optionDaily class="mt10" v-if="!initLoading && !['add'].includes(viewType)" from="lendStockOut"
        :params="{ pickingId: pickingId, relatedBusinessNo: pageDetails.pickingNo }" :falgType="falgType" />
    </detailModel>
    <!-- 添加产品 -->
    <div v-if="addProductModal">
      <Modal v-model="addProductModal" title="添加产品" width="1200" footer-hide :mask-closable="false">
        <addProduct ref="productRefs" :from="'allGoods'" @addProductSuccess="selectProductSuccess"
          @addProductCancel="selectProductCancel" :wareId="warehouseId" :eliminateData="productModalData" />
      </Modal>
    </div>
    <!--选择库位弹窗-->
    <Modal v-model="showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }" class="headerBar"
      class-name="location-modal" :mask-closable="false">
      <wareLocateSlt v-if="showLocationModal" @sendData="getLocationData" :wareId="warehouseId" :sku="locationData.objSku"
        :open="showLocationModal" :productId="locationData.productId" :pickingType="locationData.type" />
      <div slot="footer"></div>
    </Modal>
    <!-- 编辑快递信息弹窗 -->
    <Modal v-model="deliveryVisible" title="编辑快递信息" width="500" :mask-closable="false">
      <div>
        <Input :clearable="true" v-model="newDeliveryInfo" placeholder="请输入快递信息" />
        <Spin fix v-if="updateLoading"></Spin>
      </div>
      <div slot="footer">
        <Button type="primary" @click="updateDeliveryInfo" :disabled="updateLoading">确定</Button>
      </div>
    </Modal>
    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" :frozenModalTalg="frozenModalTalg" @updateData="updateData"
      :deliveryOrder="pageDetails.pickingNo" :mulSearchInput="true" />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import { getWarehouseId } from "@/utils/getService";
import detailModel from './detailModel';
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import wareLocateSlt from "@/views/wms/components/exWarehouse/wareLocateSlt";
import assignPage from "@/views/wms/stockOUt/fullyManage/components/assignPage";
import optionDaily from "@/views/wms/components/common/commonDaily";
import freezeAssignmentModal from "@/views/wms/components/exWarehouse/freezeAssignmentModal";

const tableColConfig = {
  add: ['selection', 'productUrl', 'goodsSku', 'goodsCnDesc', 'goodsAttributes', 'expectedNumber', 'operate'],
  audit: [
    'productUrl', 'goodsSku', 'goodsCnDesc', 'goodsAttributes', 'productCost', 'expectedNumber', 'doneAssignedNumber',
    'notAssignedNumber', 'warehouseLocationName', 'pickingDetailStatus', 'outOfStockStatus'
  ],
  distribute: [
    'selection', 'productUrl', 'goodsSku', 'goodsCnDesc', 'goodsAttributes', 'productCost', 'expectedNumber', 'doneAssignedNumber',
    'pickingDetailStatus', 'notAssignedNumber', 'warehouseLocationName', 'outOfStockStatus', 'operate'
  ],
  lend: [
    'productUrl', 'goodsSku', 'goodsCnDesc', 'goodsAttributes', 'productCost', 'expectedNumber', 'doneAssignedNumber',
    'pickingDetailStatus', 'notAssignedNumber', 'actualPickingNumber', 'borrowNumber', 'notBorrowNumber'
  ],
  default: [
    'productUrl', 'goodsSku', 'goodsCnDesc', 'goodsAttributes', 'productCost', 'expectedNumber', 'doneAssignedNumber',
    'pickingDetailStatus', 'notAssignedNumber', 'actualPickingNumber', 'borrowNumber', 'notBorrowNumber', 'warehouseLocationName', 'outOfStockStatus',
    'returnGoodsCount', 'unReturnGoodsCount', 'unReturnAmount'
  ],
}
// 分配状态(行状态)
const pickingStatusObj = {
  '0': { label: '未分配', value: '0' },
  '1': { label: '部分分配', value: '1' },
  '2': { label: '完成分配', value: '2' },
  '3': { label: '部分发货', value: '3' },
  '4': { label: '完成发货', value: '4' },
  '5': { label: '订单完成', value: '5' }
}

export default {
  name: 'lendSampleDetails',
  components: { detailModel, addProduct, wareLocateSlt, assignPage, optionDaily, freezeAssignmentModal },
  mixins: [Mixin],
  props: {
    moduleData: {
      type: Object,
      default: () => {
        return {
          tableRow: {},
          warehouseId: ''
        }
      }
    },
  },
  data() {
    return {
      pageLoading: false,
      initLoading: true,
      isChange: false,
      deliveryVisible: false,
      updateLoading: false,
      newDeliveryInfo: '',
      detailData: {},
      tabActive: 'main',
      isEdit: true,
      addProductModal: false,
      productModalData: [],
      pageDetails: {},
      showLocationModal: false,
      frozenModalTalg: "details",
      // 日志类型
      falgType: "lendStockOut",
      locationData: {
        clickIndex: 0,
        objSku: '',
        productId: '',
        type: 'J1'
      },
      pickingStatusList: {
        0: { label: '未拣货', value: 0 },
        1: { label: '部分拣货', value: 1 },
        2: { label: '拣货完成', value: 2 }
      },
      receiptDataList: {
        0: { value: '0', label: '入库单创建' },
        2: { value: '2', label: '入库单关闭' },
        3: { value: '3', label: '收货中' }
      },
      // 表单字段
      formData: {
        pickingType: 'J1',
        borrowUser: null,
        borrowDeptId: null,
        borrowReason: null,
        remark: null,
        shippingAddressInfo: null,
        shippingMethod: null,
        deliveryInfo: null,
        returnGoods: null,
        borrowDays: null,
        warehouseId: null,
        createBorrowSampleDetailBOList: [],
      },
      // 表单验证
      formRule: {
        // 借用人
        borrowUser: [
          {
            getRequired: () => {
              return this.mainEdit;
            },
            validator: (rule, value, callback) => {
              this.validatorRequired(rule, value, callback, 'borrowUser')
            },
            msg: '请选择借用人',
            trigger: 'change'
          }
        ],
        // 事业部
        borrowDeptId: [
          {
            getRequired: () => {
              return this.mainEdit;
            },
            validator: (rule, value, callback) => {
              this.validatorRequired(rule, value, callback, 'borrowDeptId')
            },
            msg: '请选择事业部',
            trigger: 'change'
          }
        ],
        // 收货方式
        shippingMethod: [
          {
            getRequired: () => {
              return this.mainEdit;
            },
            validator: (rule, value, callback) => {
              this.validatorRequired(rule, value, callback, 'shippingMethod')
            },
            msg: '请选择收货方式',
            trigger: 'change'
          }
        ],
        // 是否归还
        returnGoods: [
          {
            getRequired: () => {
              return this.mainEdit;
            },
            validator: (rule, value, callback) => {
              this.validatorRequired(rule, value, callback, 'returnGoods')
            },
            msg: '请选择',
            trigger: 'change'
          }
        ],
        // 借用天数
        borrowDays: [
          {
            getRequired: () => {
              return this.formData.returnGoods == 1 && this.mainEdit;
            },
            validator: (rule, value, callback) => {
              if (!this.mainEdit || this.formData.returnGoods != 1) return callback();
              this.validatorNumber(rule, value, callback, 'borrowDays')
            },
            msg: '请输入借用天数',
            min: 1,
            max: 30,
            point: 0,
            trigger: 'change'
          },
          {
            getRequired: () => {
              return this.formData.returnGoods == 1 && this.mainEdit;
            },
            validator: (rule, value, callback) => {
              if (!this.mainEdit || this.formData.returnGoods != 1) return callback();
              this.validatorNumber(rule, value, callback, 'borrowDays')
            },
            msg: '请输入借用天数',
            min: 1,
            max: 30,
            point: 0,
            trigger: 'blur'
          }
        ],
        // 借用原因
        borrowReason: [
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'borrowReason')
            },
            msg: '请输入借用原因',
            maxLength: 200,
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'borrowReason')
            },
            msg: '请输入借用原因',
            maxLength: 200,
            trigger: 'blur'
          }
        ],
        // 备注
        remark: [
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'remark')
            },
            msg: '请输入备注',
            maxLength: 200,
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'remark')
            },
            msg: '请输入备注',
            maxLength: 200,
            trigger: 'blur'
          }
        ],
        // 收货地址信息
        shippingAddressInfo: [
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'shippingAddressInfo')
            },
            msg: '请输入收货地址信息',
            maxLength: 200,
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'shippingAddressInfo')
            },
            msg: '请输入收货地址信息',
            maxLength: 200,
            trigger: 'blur'
          }
        ],
        // 快递信息
        deliveryInfo: [
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'deliveryInfo')
            },
            msg: '请输入快递信息',
            maxLength: 50,
            trigger: 'change'
          },
          {
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorString(rule, value, callback, 'deliveryInfo')
            },
            msg: '请输入快递信息',
            maxLength: 50,
            trigger: 'blur'
          }
        ],
      },
      // 表格验证
      tableRule: {
        expectedNumber: [
          {
            getRequired: (rule, value) => {
              if (this.$common.isEmpty(rule.field)) return this.mainEdit;
              const field = rule.field.split('.');
              if (field.length != 3) return this.mainEdit;
              const baseKey = field[0];
              const index = Number(field[1]);
              const key = field[2];
              if (this.$common.isEmpty(baseKey) || this.$common.isEmpty(index) || this.$common.isEmpty(key)) return this.mainEdit;
              const row = this.formData[baseKey][index];
              return this.mainEdit && (this.$common.isEmpty(row.pickingDetailStatus) || row.pickingDetailStatus == 0);
            },
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorTableNumber(rule, value, callback);
            },
            msg: '请输入商品数量',
            min: 1,
            point: 0,
            trigger: 'change'
          },
          {
            getRequired: (rule, value) => {
              if (this.$common.isEmpty(rule.field)) return this.mainEdit;
              const field = rule.field.split('.');
              if (field.length != 3) return this.mainEdit;
              const baseKey = field[0];
              const index = Number(field[1]);
              const key = field[2];
              if (this.$common.isEmpty(baseKey) || this.$common.isEmpty(index) || this.$common.isEmpty(key)) return this.mainEdit;
              const row = this.formData[baseKey][index];
              return this.mainEdit && (this.$common.isEmpty(row.pickingDetailStatus) || row.pickingDetailStatus == 0);
            },
            validator: (rule, value, callback) => {
              if (!this.mainEdit) return callback();
              this.validatorTableNumber(rule, value, callback);
            },
            msg: '请输入商品数量',
            min: 1,
            point: 0,
            trigger: 'blur'
          }
        ],
        borrowNumber: [
          {
            getRequired: (rule, value) => {
              return ['lend'].includes(this.viewType);
            },
            validator: (rule, value, callback) => {
              if (!['lend'].includes(this.viewType)) return callback();
              this.validatorTableNumber(rule, value, callback);
            },
            msg: '请输入借出数量',
            min: 1,
            point: 0,
            trigger: 'change'
          },
          {
            getRequired: (rule, value) => {
              return ['lend'].includes(this.viewType);
            },
            validator: (rule, value, callback) => {
              if (!['lend'].includes(this.viewType)) return callback();
              this.validatorTableNumber(rule, value, callback);
            },
            msg: '请输入借出数量',
            min: 1,
            point: 0,
            trigger: 'blur'
          },
        ]
      },
      // 添加的商品行字段
      createProduct: {
        productGoodsId: null,
        expectedNumber: null
      },
      // 列表选中值
      selectTableData: [],
      // 表格列设置对象
      tableColJson: {
        // 选择框
        selection: {
          type: "selection",
          width: 50,
          fixed: 'left',
          align: "center",
        },
        // 图片
        productUrl: {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 66,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          },
        },
        // 商品SKU
        goodsSku: {
          title: '商品SKU',
          key: 'goodsSku',
          align: 'center',
          width: 150
        },
        // 商品中英描述
        goodsCnDesc: {
          title: "商品中英描述",
          key: "goodsCnDesc",
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            let item = [];
            if (!this.$common.isEmpty(row.goodsCnDesc)) {
              item.push(h('div', {}, row.goodsCnDesc));
            }
            if (!this.$common.isEmpty(row.goodsEnDesc)) {
              item.push(h('div', {
                class: 'mt5',
              }, row.goodsEnDesc));
            }
            return h('div', {
              class: 'text-center-left',
            }, item);
          }
        },
        // 商品规格
        goodsAttributes: {
          title: '商品规格',
          key: 'goodsAttributes',
          align: 'center',
          width: 80
        },
        // 采购单价 创建和部分分配情况不显示
        productCost: {
          title: '采购单价',
          key: 'productCost',
          align: 'center',
          width: 80
        },
        // 商品数量
        expectedNumber: {
          title: '商品数量',
          slot: 'expectedNumber',
          align: 'center',
          minWidth: 120,
          maxWidth: 230
        },
        // 借出数量
        borrowNumber: {
          title: '借出数量',
          slot: 'borrowNumber',
          align: 'center',
          minWidth: 120,
          maxWidth: 230
        },
        // 未借出数量
        notBorrowNumber: {
          title: '未借出数量',
          key: 'notBorrowNumber',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.expectedNumber)) return h('span', '');
            if (this.$common.isEmpty(row.borrowNumber)) return h('span', row.expectedNumber);
            return h('span', (Number(row.expectedNumber) - Number(row.borrowNumber)).toFixed(0));
          }
        },
        // 已分配数
        doneAssignedNumber: {
          title: '已分配数',
          key: 'doneAssignedNumber',
          align: 'center',
          width: 80
        },
        // 未分配数
        notAssignedNumber: {
          title: '未分配数',
          key: 'notAssignedNumber',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.expectedNumber)) return h('span', '');
            if (this.$common.isEmpty(row.doneAssignedNumber)) return h('span', row.expectedNumber);
            return h('span', (Number(row.expectedNumber) - Number(row.doneAssignedNumber)).toFixed(0));
          }
        },
        // 分配库位
        warehouseLocationName: {
          title: '分配库位',
          slot: 'warehouseLocationName',
          align: 'center',
          minWidth: 120,
          maxWidth: 230
        },
        // 行状态(分配状态)
        pickingDetailStatus: {
          title: '分配状态',
          key: 'pickingDetailStatus',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.pickingDetailStatus)) return h('span', '');
            const statusInfo = pickingStatusObj[row.pickingDetailStatus];
            if (this.$common.isEmpty(statusInfo)) return h('span', row.pickingDetailStatus);
            return h('span', statusInfo.label);
          }
        },
        // 分配异常原因
        outOfStockStatus: {
          title: "分配异常原因",
          key: "outOfStockStatus",
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.outOfStockStatus)) return h('span', '');
            const abnormal = this.failTypeList.find((j) => j.value === row.outOfStockStatus);
            if (this.$common.isEmpty(abnormal)) return h('span', '');
            return h("Tag", {
              props: {
                color: abnormal.color,
              },
            }, abnormal.label);
          }
        },
        // 已拣货数
        actualPickingNumber: {
          title: '已拣货数',
          key: 'actualPickingNumber',
          align: 'center',
          width: 80
        },
        // 归还数量
        returnGoodsCount: {
          title: '归还数量',
          key: 'returnGoodsCount',
          align: 'center',
          width: 80
        },
        // 未归还数量
        unReturnGoodsCount: {
          title: '未归还数量',
          key: 'unReturnGoodsCount',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.unReturnGoodsCount)) return h('span', '');
            return h('span', {
              class: 'error-txt',
            }, row.unReturnGoodsCount);
          }
        },
        // 未归还金额
        unReturnAmount: {
          title: '未归还金额',
          key: 'unReturnAmount',
          align: 'center',
          width: 80,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.unReturnAmount)) return h('span', '');
            return h('span', {
              class: 'error-txt',
            }, row.unReturnAmount);
          }
        },
        // 操作
        operate: {
          title: '操作',
          key: 'operate',
          align: 'center',
          width: 120,
          fixed: 'right',
          render: (h, { row }) => {
            let item = [];
            if (this.permission.allocated && ['distribute'].includes(this.viewType) && !this.$common.isEmpty(row.pickingDetailStatus) && [0, 1].includes(Number(row.pickingDetailStatus))) {
              item.push(h('span', {
                class: 'mr10',
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.allocationRepertory([row], 'single');
                  },
                },
              }, '分配库存'));
            }
            if ((this.permission.add || this.permission.edit) || ['add', 'distribute'].includes(this.viewType)) {
              item.push(h('span', {
                style: {
                  color: '#f20',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.deleteTableRow([row], 'single');
                  },
                },
              }, '删除'));
            }
            return item;
          },
        }
      },
      // 分配信息数据
      allocationData: {
        queryPickingBatchResult: []
      },
    };
  },
  watch: {
    'formData.createBorrowSampleDetailBOList': {
      deep: true,
      handler(val) {
        const selectId = this.selectTableData.map(item => item.productGoodsId);
        (val || []).forEach((row, index) => {
          row._checked = selectId.includes(row.productGoodsId);
        })
      }
    }
  },
  computed: {
    // lend 借出 createPicking 生成拣货单 audit 审核 distribute 分配库存 view 查看 add 添加 edit 编辑
    viewType() {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.statusOperate)) return 'view';
      if (this.$common.isEmpty(this.pageDetails) || this.$common.isEmpty(this.pageDetails.pickingStatus)) return 'add';
      const operateInfo = this.moduleData.statusOperate.find(item => item.status.includes(this.pageDetails.pickingStatus));
      if (this.$common.isEmpty(operateInfo)) return 'view';
      return operateInfo.operate;
    },
    // 权限
    permission() {
      return {
        // 创建
        add: this.getPermission('borrowSamplePicking_create'),
        // 编辑
        edit: this.getPermission('borrowSamplePicking_editPicking'),
        // 借出
        product: this.getPermission('borrowSamplePicking_borrowProduct'),
        // 审核
        audit: this.getPermission('borrowSamplePicking_auditPass'),
        // 单个-分配库存
        allocated: this.getPermission('borrowSamplePicking_allocatedInventory'),
        // 批量-分配库存
        batchAllocated: this.getPermission('borrowSamplePicking_batchAllocatedInventory'),
        // 取消分配
        unallocated: this.getPermission('borrowSamplePicking_unallocatedStock'),
        // 冻结分配
        frozen: this.getPermission('borrowSamplePicking_frozenAllocated'),
        // 生成拣货单
        createPickin: this.getPermission('borrowSamplePicking_createPickingGoods'),
        // 删除出库单
        delete: this.getPermission('borrowSamplePicking_delete'),
      }
    },
    // 主信息是否可编辑
    mainEdit() {
      return ['add', 'distribute'].includes(this.viewType) && (this.permission.add || this.permission.edit);
    },
    // 仓库 ID
    warehouseId() {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.warehouseId)) {
        return this.$store.state.warehouseId || getWarehouseId();
      }
      return this.moduleData.warehouseId;
    },
    // 列表传过来的行数据
    tableRow() {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.tableRow)) return {};
      return this.moduleData.tableRow;
    },
    // 出库单 ID
    pickingId() {
      if (this.$common.isEmpty(this.tableRow) || this.$common.isEmpty(this.tableRow.pickingId)) return '';
      return this.tableRow.pickingId;
    },
    // 出库单状态数据
    stateList() {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.stateData)) return [];
      return this.moduleData.stateData;
    },
    // 当前出库单状态信息
    pickingStateInfo() {
      if (this.$common.isEmpty(this.pageDetails) || this.$common.isEmpty(this.pageDetails.pickingStatus)) return {};
      const info = this.stateList.find(item => item.val.includes(this.pageDetails.pickingStatus));
      return info || {};
    },
    // 用户列表
    userListData() {
      return this.$store.state.userInfoList;
    },
    // 所有的事业部
    allBusinessDept() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    // 借用人事业部名称
    borrowDeptName() {
      if (this.$common.isEmpty(this.formData.borrowDeptId) || this.$common.isEmpty(this.allBusinessDept)) return '';
      const deptInfo = this.allBusinessDept.find(item => item.id == this.formData.borrowDeptId);
      if (this.$common.isEmpty(deptInfo)) return this.formData.borrowDeptId;
      return deptInfo.name || '';
    },
    // 登录人事业部
    userBusinessDeptId() {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      return this.$store.getters.authUserInfo.securityUser.businessDeptId || '';
    },
    // 登录人ID
    erpUserId() {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      return this.$store.getters.authUserInfo.securityUser.erpUserId || '';
    },
    // 登录人名称
    erpUserName() {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      return this.$store.getters.authUserInfo.securityUser.name || '';
    },
    // 创建人名称
    createdByName() {
      if (this.$common.isEmpty(this.pageDetails) || this.$common.isEmpty(this.pageDetails.createdBy)) return '';
      if (this.$common.isEmpty(this.userListData) || this.$common.isEmpty(this.userListData[this.pageDetails.createdBy])) return this.pageDetails.createdBy;
      return this.userListData[this.pageDetails.createdBy].userName || '';
    },
    // 表格列设置
    tableColumn() {
      let colKey = tableColConfig[this.viewType] || tableColConfig.default;
      let colConfig = [];
      if ([0, 1, 2, 20].includes(Number(this.pageDetails.pickingStatus)) && !colKey.includes('selection')) {
        colKey.splice(0, 0, 'selection');
      }
      colKey.forEach(key => {
        if (this.tableColJson[key]) {
          colConfig.push(this.tableColJson[key]);
        }
      });
      return colConfig;
    }
  },
  mounted() {
    this.$refs.mainForm && this.$refs.mainForm.resetFields();
    this.$nextTick(() => {
      this.initData();
    })
  },
  methods: {
    initData() {
      this.pageLoading = true;
      let awaitRes = [];
      this.selectTableData = [];
      this.pageDetails = {};
      if (!this.$common.isEmpty(this.pickingId)) {
        awaitRes.push(() => {
          return this.getDetails(this.pickingId);
        })
      }
      this.$common.promiseAll(awaitRes).finally(() => {
        if (['add'].includes(this.viewType)) {
          this.formData.borrowUser = this.erpUserId;
          this.formData.borrowDeptId = this.userBusinessDeptId;
        }
        this.pageLoading = false;
        this.initLoading = false;
      });
    },
    // 返回列表
    backList() {
      // 页面信息是否有改动，改动则需要刷新页面列表
      this.pageLoading = false;
      this.$emit('update:modalVisible', false);
      if (this.isChange) this.$emit('updateList', true);
      this.$nextTick(() => {
        this.initLoading = true;
        this.isChange = false;
      })
    },
    // 切换
    tabClick(tab) { },
    // 获取详情信息
    getDetails(pickingId) {
      return new Promise((resolve) => {
        this.axios.post(`${api.lendSampleDetail}/${pickingId}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          // const notIncludes = [];
          Object.keys(this.formData).forEach(key => {
            if (!this.$common.isUndefined(res.data.datas[key])) {
              this.formData[key] = res.data.datas[key];
            }
          });
          let borrowNumber = null;
          this.formData.createBorrowSampleDetailBOList = (res.data.datas.productDetailVOList || []).map(row => {
            if (!this.$common.isEmpty(row.borrowNumber) && row.borrowNumber != 0) {
              borrowNumber = row.borrowNumber;
            } else if (!this.$common.isEmpty(row.actualPickingNumber)) {
              borrowNumber = row.actualPickingNumber;
            }

            return {
              ...row,
              goodsSku: row.sku,
              borrowNumber: borrowNumber,
              pickingNo: res.data.datas.pickingNo,
              warehouseId: this.warehouseId,
              pickingId: res.data.datas.pickingId,
              _checked: false
            }
          });
          this.pageDetails = this.$common.copy(res.data.datas);
          this.pageDetails.productDetailVOList = this.$common.copy(this.formData.createBorrowSampleDetailBOList);
          this.allocationData.queryPickingBatchResult = (res.data.datas.batchList || []);
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 列表选择行改变时
    tableCheckChange(rows) {
      this.selectTableData = rows;
    },
    // 删除行
    deleteTableRow(rows = [], type) {
      if (this.$common.isEmpty(rows)) return this.$Message.error('请选中需要操作的数据');
      let goodsId = [];
      rows.map(item => {
        if (!this.$common.isEmpty(item.pickingDetailStatus) && [0].includes(Number(item.pickingDetailStatus))) {
          goodsId.push(item.productGoodsId);
        }
      });
      const selectId = this.selectTableData.map(item => item.productGoodsId);
      let newRows = [];
      let selectRow = [];
      this.formData.createBorrowSampleDetailBOList.forEach((row) => {
        if (!goodsId.includes(row.productGoodsId)) {
          newRows.push(row);
          selectId.includes(row.productGoodsId) && selectRow.push(row);
        }
      });
      this.selectTableData = type == 'batch' ? [] : selectRow;
      this.$nextTick(() => {
        this.formData.createBorrowSampleDetailBOList = newRows;
      });
      if (goodsId.length != rows.length) {
        this.$Message.error('选中数据中“部分分配”和“全部分配”的数据不可移出');
      }
    },
    // 打开添加产品模态层
    openSelectProductModal() {
      this.productModalData = this.$common.copy(this.formData.createBorrowSampleDetailBOList);
      this.$nextTick(() => {
        this.addProductModal = true;
      })
    },
    // 选择产品完成回调
    selectProductSuccess(data) {
      const oldProductData = this.$common.copy(this.formData.createBorrowSampleDetailBOList);
      data.forEach((row) => {
        oldProductData.push({
          ...row,
          expectedNumber: 1,
          sku: row.goodsSku,
          warehouseId: this.warehouseId,
          pickingNo: this.pageDetails.pickingNo,
          borrowNumber: this.$common.isEmpty(row.borrowNumber) ? null : row.borrowNumber,
          pickingId: this.pageDetails.pickingId || null,
          _checked: false
        });
      });
      this.formData.createBorrowSampleDetailBOList = oldProductData;
      this.$nextTick(() => {
        this.selectProductCancel();
      })
    },
    // 选择产品失败回调
    selectProductCancel() {
      this.addProductModal = false;
    },
    // 是否归还改变时
    returnChange(val) {
      if (val == 1) {
        if (this.$common.isEmpty(this.formData.borrowDays)) {
          this.formData.borrowDays = '15';
        }
        return;
      }
      this.formData.borrowDays = null;
    },
    // 借用人改变时
    borrowUserChange(val) {
      if (this.erpUserId == val) {
        if (this.$common.isEmpty(this.formData.borrowDeptId)) {
          this.formData.borrowDeptId = this.userBusinessDeptId;
        }
        return;
      }
      this.formData.borrowDeptId = null;
    },
    // 验证必填项
    validatorRequired(rule, value, callback, key) {
      this.$nextTick(() => {
        const newVal = this.$common.isEmpty(key) ? value : this.formData[key];
        let required = this.$common.isEmpty(rule.required) ? rule.getRequired : rule.required;
        if (this.$common.isFunction(required)) {
          required = required(rule, newVal);
        }
        if (required && this.$common.isEmpty(newVal)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        callback();
      })
    },
    // 验证数字
    validatorNumber(rule, value, callback, key) {
      this.$nextTick(() => {
        const newVal = this.$common.isEmpty(key) ? value : this.formData[key];
        this.$common.validatorMaxNumber(rule, newVal, callback);
      })
    },
    // 验证字符串
    validatorString(rule, value, callback, key) {
      this.$nextTick(() => {
        const newVal = this.$common.isEmpty(key) ? value : this.formData[key];
        this.$common.strMaxVerify(rule, newVal, callback);
      })
    },
    // 验证表格中数量
    validatorTableNumber(rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(rule.field)) return callback();
        const field = rule.field.split('.');
        if (field.length != 3) return callback();
        const baseKey = field[0];
        const index = Number(field[1]);
        const key = field[2];
        if (this.$common.isEmpty(baseKey) || this.$common.isEmpty(index) || this.$common.isEmpty(key)) return callback();
        const row = this.formData[baseKey][index];
        const newVal = row[key];
        if (!this.$common.isEmpty(row.pickingDetailStatus) && row.pickingDetailStatus != 0) return callback();
        this.$common.validatorMaxNumber(rule, newVal, callback);
      })
    },
    // 聚焦到填写有误的第一个错误位置
    errorFocus() {
      this.$nextTick(() => {
        setTimeout(() => {
          const errorDemo = document.querySelector('.edit-page-main .ivu-form-item-error .ivu-form-item-content');
          if (!errorDemo) return;
          let inputDemo = errorDemo.querySelector('.ivu-select-selection .ivu-select-input');
          const errorTxt = errorDemo.querySelector('.ivu-form-item-error-tip');
          if (errorTxt && errorTxt.innerText) {
            this.$Message.error(errorTxt.innerText);
          }
          if (!inputDemo) {
            inputDemo = errorDemo.querySelector('.ivu-input-wrapper .ivu-input');
          }
          if (!inputDemo) return;
          inputDemo.focus();
        })
      }, 300)
    },
    // 获取表单数据
    getFormData() {
      let params = this.$common.copy(this.formData);
      params.borrowDays = this.$common.isEmpty(params.borrowDays) ? null : Number(params.borrowDays);
      if (this.$common.isEmpty(this.pageDetails.pickingId)) {
        params.warehouseId = this.warehouseId;
        params.createBorrowSampleDetailBOList = params.createBorrowSampleDetailBOList.map((row) => {
          return {
            productGoodsId: row.productGoodsId,
            expectedNumber: this.$common.isEmpty(row.expectedNumber) ? null : Number(row.expectedNumber)
          }
        });
      } else {
        params.pickingId = this.pageDetails.pickingId;
        params.productDetailVOList = params.createBorrowSampleDetailBOList.map((row) => {
          return {
            pickingDetailId: row.pickingDetailId,
            productGoodsId: row.productGoodsId,
            expectedNumber: this.$common.isEmpty(row.expectedNumber) ? null : Number(row.expectedNumber)
          }
        });
        delete params.createBorrowSampleDetailBOList;
        delete params.warehouseId;
        delete params.pickingType;
      }
      return params;
    },
    // 库位有焦点
    locationNameFocus(row, index) {
      if (this.$common.isEmpty(row.pickingDetailStatus) && ![0, 1].includes(row.pickingDetailStatus)) return;
      this.locationData.clickIndex = index;
      this.locationData.objSku = row.goodsSku;
      this.locationData.productId = row.productGoodsId;
      this.$nextTick(() => {
        this.showLocationModal = true;
        if (this.$refs[`input-${index}`]) {
          const demo = this.$refs[`input-${index}`].$el.querySelector('.ivu-input');
          demo && demo.blur();
        }
      });
    },
    // 确认选择库位
    getLocationData(data) {
      const row = this.formData.createBorrowSampleDetailBOList[this.locationData.clickIndex];
      if (this.$common.isEmpty(row) || this.$common.isEmpty(data)) return;
      this.$set(row, 'warehouseLocationName', data.warehouseLocationName);
      this.$set(row, 'warehouseLocationId', data.warehouseLocationId);
      this.$set(row, 'receiptBatchNo', data.receiptBatchNo);
      this.$set(row, 'inventoryId', data.inventoryId);
      this.$set(row, 'availableNumber', data.availableNumber);
    },
    // 分配库存(先保存，保存成功后再分配)
    allocationRepertory(rows, type) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(rows)) {
          this.$Message.error('请选中需要操作的数据');
          resolve({ fail: true });
          return;
        }
        const wId = rows.filter(f => !this.$common.isEmpty(f.warehouseLocationId)).map(m => m.warehouseLocationId);
        if (this.$common.isEmpty(wId)) {
          this.$Message.error(`${type == 'batch' ? '选中数据中存在' : ''}库位为空或者输入的库位不存在，请选择库位`);
          resolve({ fail: true });
          return;
        }
        this.$Modal.confirm({
          title: "温馨提示",
          content: "是否保存并分配库存",
          onOk: () => {
            this.saveLendSample(false).then((state) => {
              state && this.aRepertoryHander(rows);
              resolve({ fail: state });
            });
          },
          onCancel: () => {
            resolve({ fail: true });
          }
        })
      })
    },
    // 执行分配库存数据处理
    aRepertoryHander(rows) {
      let reParam = [];
      rows.forEach(row => {
        if (!this.$common.isEmpty(row.pickingDetailStatus)) {
          if ([0, 1].includes(Number(row.pickingDetailStatus))) {
            reParam.push({
              doneAssignedNumber: row.doneAssignedNumber, // 已分配数量
              expectedNumber: row.expectedNumber, // 预期出库数量
              productGoodsId: row.productGoodsId, // 产品ID
              receiptBatchNo: row.receiptBatchNo,
              inventoryId: row.inventoryId, // 库存id
              pickingDetailId: row.pickingDetailId, // 出库单货品详情id
              pickingNo: this.pageDetails.pickingNo, // 出库单编号
              // thisAssignedNumber: null, // 本次分配数量
              warehouseId: this.warehouseId, // 仓库id
              warehouseLocationId: row.warehouseLocationId, // 库位id
              availableNumber: row.availableNumber,
              goodsSku: row.goodsSku, // 商品 sku
            })
          }
        }
      });
      if (rows.length > reParam.length) {
        setTimeout(() => {
          this.$Modal.confirm({
            title: "温馨提示",
            content: "有已分配的sku，点击确定时忽略已分配库存的SKU，对未分配的SKU进行分配库存",
            onOk: () => {
              this.assignStock(reParam);
            },
            onCancel: () => { }
          })
        }, 500);
        return;
      }
      this.assignStock(reParam);
    },
    // 执行分配库存请求
    assignStock(reParam) {
      this.pageLoading = true;
      return new Promise((resolve) => {
        this.axios.post(api.assign_stockSingle, reParam).then((res) => {
          if (!res || !res.data || res.data.code != 0) {
            this.pageLoading = false;
            return resolve(false);
          }
          this.$Message.success('分配成功');
          this.initLoading = true;
          this.getDetails(this.pickingId).finally(() => {
            this.pageLoading = false;
            this.initLoading = false;
          });
          resolve(true);
        }).catch(() => {
          this.pageLoading = false;
          resolve(false);
        });
      })
    },
    // 取消分配库存
    cancelAllocation(rows) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(rows)) {
          this.$Message.error('请选中需要操作的数据');
          resolve({ fail: true });
          return;
        }
        const notConform = rows.find(row => ![1, 2].includes(Number(row.pickingDetailStatus)));
        if (!this.$common.isEmpty(notConform)) {
          this.$Message.error('只有部分分配和分配完成才能取消');
          resolve({ fail: true });
          return;
        }
        this.pageLoading = true;
        const params = rows.map(m => {
          delete m._checked;
          return m;
        });
        this.axios.post(api.cancel_stock, params).then((res) => {
          if (!res || !res.data || res.data.code != 0) {
            this.pageLoading = false;
            return resolve(false);
          }
          this.$Message.success('取消成功');
          this.initLoading = true;
          this.isChange = true;
          this.getDetails(this.pickingId).finally(() => {
            this.pageLoading = false;
            this.initLoading = false;
          });
          resolve(true);
        }).catch(() => {
          this.pageLoading = false;
          resolve(false);
        });
      })
    },
    // 冻结分配
    freezeAllocation() {
      return new Promise((resolve) => {
        // 冻结分配之前判断是否有改动，如果有改动，弹框提示保存再冻结分配
        const flag = JSON.stringify(this.formData.createBorrowSampleDetailBOList) === JSON.stringify(this.pageDetails.productDetailVOList);
        if (flag) {
          this.$refs.frozenModal.frozenModal = true;
          return;
        }
        this.$Modal.confirm({
          title: "温馨提示",
          content: "是否保存并冻结分配",
          onOk: () => {
            this.saveLendSample(false).then((state) => {
              if (!state) return;
              // 更新详情数据后弹窗
              this.pageLoading = true;
              this.getDetails(this.pageDetails.pickingId).finally(() => {
                this.$refs.frozenModal.frozenModal = true;
                this.pageLoading = false;
              });
            });

            this.saveLendSample(false).then(() => {
              this.refreshAssignList();
            });
          },
          onCancel: () => { },
        });
      })
    },
    // 解冻并分配后，更新列表数据
    updateData(value) {
      if (value === this.frozenModalTalg) {
        this.pageLoading = true;
        this.getDetails(this.pageDetails.pickingId).finally(() => {
          this.pageLoading = false;
        });
      }
    },
    // 删除出库单
    deleteLendSample() {
      if (this.pageLoading) return;
      this.$Modal.confirm({
        title: "温馨提示",
        content: `您确认删除出库单：${this.pageDetails.pickingNo} 吗？`,
        onOk: () => {
          this.pageLoading = true;
          this.axios.put(`${api.del_obsoletePicking}${this.pageDetails.pickingId}`).then(res => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$Message.success('删除成功');
            this.isChange = true;
            this.backList();
          }).finally(() => {
            this.pageLoading = false;
          })
        },
        onCancel: () => { }
      })
    },
    // 创建(保存)出库单
    saveLendSample(isClose = false) {
      return new Promise((resolve) => {
        if (this.pageLoading) return resolve(false);
        this.$refs.mainForm.validate((valid) => {
          if (!valid) {
            this.errorFocus();
            resolve(false);
            return;
          }
          if (this.$common.isEmpty(this.formData.createBorrowSampleDetailBOList)) {
            this.$Message.error('商品信息信息不可为空，请添加商品');
            return resolve(false);
          }
          this.pageLoading = true;
          const params = this.getFormData();
          let requerApi = api.lendSampleCreate;
          let requerMethod = 'post';
          if (!this.$common.isEmpty(params.pickingId)) {
            requerApi = api.lendSampleEditPicking;
            requerMethod = 'put';
          }
          this.axios[requerMethod](requerApi, params).then((res) => {
            if (!res || !res.data || res.data.code != 0) return resolve(false);
            isClose && this.$Message.success('保存成功！');
            // 刷新列表
            this.isChange = true;
            isClose && this.backList();
            resolve(true);
          }).catch(() => {
            resolve(false);
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    // 借样审核
    lendAudit() {
      this.pageLoading = true;
      this.axios.post(`${api.lendSampleAudit || ''}/${this.pageDetails.pickingId}`).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功！');
        // 刷新列表
        this.isChange = true;
        this.backList();
      }).catch(() => {
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 确认借出
    lendBorrow() {
      this.pageLoading = true;
      const params = this.formData.createBorrowSampleDetailBOList.map(row => {
        return {
          productGoodsId: row.productGoodsId,
          borrowNumber: row.borrowNumber,
        }
      })
      this.axios.post(`${api.lendSamplBorrow || ''}/${this.pageDetails.pickingId}`, params).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('操作成功！');
        // 刷新列表
        this.isChange = true;
        this.backList();
      }).catch(() => {
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 开启快递信息编辑
    openDeliveryInfoEdit() {
      this.newDeliveryInfo = this.formData.deliveryInfo;
      this.$nextTick(() => {
        this.deliveryVisible = true;
      })
    },
    // 更新快递信息
    updateDeliveryInfo() {
      if (this.updateLoading) return;
      this.updateLoading = true;
      this.axios.put(api.lendSamplUpdatePicking, {
        deliveryInfo: this.newDeliveryInfo,
        pickingId: this.pageDetails.pickingId
      }).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.formData.deliveryInfo = this.newDeliveryInfo;
        this.$nextTick(() => {
          this.deliveryVisible = false;
        })
      }).finally(() => {
        this.updateLoading = false;
      })
    }
  }
};
</script>
<style lang="less" scoped>
.edit-page-main {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #fff;
  z-index: 20;

  .back--r {
    display: flex;
    align-items: center;
  }

  :deep(.addstock-main) {
    height: 100%;
    overflow: auto;

    .addstock-container {
      position: relative;
    }
  }

  .main-edit-form {
    .ivu-form-item {
      :deep(.ivu-form-item-label) {
        padding-left: 5px;
        padding-right: 5px;
      }
    }

    .form-item-line {
      margin-top: 10px;

      .ivu-form-item {
        display: inline-block;
        width: 25%;
      }
    }
  }

  .page-piece {
    position: relative;

    .piece-title {
      position: relative;
      padding: 0px 10px;
      font-size: 16px;

      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 4px;
        background: #0073ff;
      }
    }

    .page-operate-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  :deep(.ivu-table) {
    .text-center-left {
      display: inline-block;
      margin: 0 auto;
      text-align: left;
    }

    .ivu-form-item {
      margin-bottom: 0;
    }

    .ivu-form-item-error-tip {
      display: none;
    }
  }
}

:deep(.location-modal) {
  .ivu-modal-footer {
    display: none;
  }
}

.page-steps-style {
  :deep(.ivu-steps-item) {
    .ivu-steps-content {
      padding-left: 0;
    }
  }
}

.flex-start {
  display: flex;
  justify-content: start;

  .btn-icon {
    i {
      margin-left: 5px;
      font-weight: bold;
      font-size: 26px;
      color: #2d8cf0;
      cursor: pointer;
    }
  }
}
</style>
