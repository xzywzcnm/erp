<template>
  <dyt-model :modalVisible.sync="detailsVisible" @backList="backList" :pageLoading="pageLoading" class="page-details">
    <div slot="lefts">
      <span class="details-title">产品/包裹到货异常流程</span>
    </div>
    <div slot="rights" class="button-group">
      <Button type="primary" v-if="isEdit" @click="detailsSubmit(false)" :disabled="pageLoading">提 交</Button>
      <Button type="primary" v-if="isEdit && viewType == 'add'" @click="detailsSubmit(true)"
        :disabled="pageLoading">提交后停留当前页</Button>
      <Button type="primary" v-if="isBack" @click="sendBack" :disabled="pageLoading">退 回</Button>
      <Button v-if="isEdit && viewType != 'add'" @click="detailsSave(false)" :disabled="pageLoading">保
        存</Button>
      <Button v-if="isEdit && viewType == 'add'" @click="temporarySave" :disabled="pageLoading">暂 存</Button>
      <Button type="primary" v-if="isEdit && formData.status == 2 && permission.transfer" @click="transferToPurchaser"
        :disabled="pageLoading">转 交</Button>
      <Button v-if="!isEdit" @click="backList">关 闭</Button>
    </div>
    <div>
      <div class="details-main">
        <Form ref="fromRef" class="main-from" :model="formData" :rules="formRules" :label-width="110" :inline="true">
          <div class="main-title">仓库问题反馈</div>
          <FormItem label="到货异常编号：" class="form-inline-item">
            {{ viewType == 'add' ? '保存后创建' : this.formData.abnormalArrivalNo || '' }}
          </FormItem>
          <FormItem label="创建人：" class="form-inline-item">
            {{ this.createdByInfo ? this.createdByInfo.userName : '' }}
          </FormItem>
          <FormItem label="所属事业部：" class="form-inline-item">
            {{ businessName }}
          </FormItem>
          <FormItem label="到仓日期：" prop="arrivalDate" class="form-inline-item"
            :class="{ 'form-item-required': registerEdit }">
            <div v-if="!registerEdit">
              {{ formatTime(formData.arrivalDate) }}
            </div>
            <div v-else>
              <DatePicker type="date" transfer placeholder="选择到仓日期" v-model="formData.arrivalDate" format="yyyy-MM-dd"
                :disabled="!registerEdit" />
            </div>
          </FormItem>
          <FormItem label="对应采购员：" prop="purchaserId" class="form-inline-item"
            :class="{ 'form-item-required': registerEdit }">
            <div v-if="!registerEdit">
              {{ showText('purchaserId', formData.purchaserId) }}
            </div>
            <div v-else>
              <dyt-select v-model="formData.purchaserId" :disabled="!registerEdit" @on-change="purchaserIdChange">
                <Option v-for="(item, index) in Object.values(userInfoList)" :value="item.userId" :key="`u-${index}`"
                  :label="item.userName" />
              </dyt-select>
            </div>
          </FormItem>
          <FormItem label="异常类型：" prop="abnormalType" class="form-inline-item"
            :class="{ 'form-item-required': registerEdit }">
            <div v-if="!registerEdit">
              {{ showText('abnormalType', formData.abnormalType) }}
            </div>
            <div v-else>
              <dyt-select v-model="formData.abnormalType" :disabled="!registerEdit">
                <Option :value="1" label="产品异常(发多/发错/发少/质量问题等)" />
                <Option :value="2" label="包裹异常(无清单/无包装/破损/污染等)" />
              </dyt-select>
            </div>
          </FormItem>
          <FormItem label="供应商名称：" prop="supplierId" class="form-inline-item">
            <div v-if="!registerEdit">
              {{ showText('supplierId', formData.supplierId) }}
            </div>
            <div v-else>
              <dyt-select v-model="formData.supplierId" :disabled="!registerEdit">
                <Option v-for=" (item, index) in supplierList" :value="item.supplierId" :key="`supply-${index}`"
                  :label="item.supplierName" />
              </dyt-select>
            </div>
          </FormItem>
          <FormItem label="包裹/物流单号：" prop="referenceNo" class="form-inline-item">
            <div v-if="!registerEdit">
              {{ formData.referenceNo }}
            </div>
            <div v-else>
              <Input v-model.trim="formData.referenceNo" placeholder="请输入包裹/物流单号" :clearable="true"
                :disabled="!registerEdit" />
            </div>
          </FormItem>
          <FormItem label="入库出库处理编号:" prop="handleNo" :label-width="120" class="form-inline-item">
            <div>
              {{ formData.handleNo }}
            </div>
            <!-- <div v-else>
              <Input v-model.trim="formData.referenceNo" placeholder="请输入包裹/物流单号" :clearable="true"
                :disabled="!registerEdit" />
            </div> -->
          </FormItem>
          <div class="main-title">异常明细登记</div>
          <!--表格-->
          <Table
            border
            highlight-row
            ref="tableRef"
            :height="pagination.total > 8 ? 450 : 0"
            :columns="tableColumns"
            :data="formTableList"
          >
            <!-- 异常采购单号 -->
            <template slot-scope="{ row, index }" slot="abnormalPurchaseNumber">
              <FormItem v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]" label=""
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalPurchaseNumber`" class="table-form-item"
                :label-width="0" :rules="tableItemRules.abnormalPurchaseNumber">
                <div v-if="!registerEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]
                    .abnormalPurchaseNumber }}
                </div>
                <div v-else>
                  <Input v-model.trim="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalPurchaseNumber"
                    placeholder="请输入异常采购单号" :clearable="true" :disabled="!registerEdit" @on-keyup="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalPurchaseNumber
                      = formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalPurchaseNumber.replace(/[ ]/g, '')" />
                </div>
              </FormItem>
            </template>
            <!-- 异常sku -->
            <template slot-scope="{ row, index }" slot="abnormalSku">
              <FormItem v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]" label=""
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalSku`" class="table-form-item" :label-width="0">
                <div v-if="!registerEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalSku }}
                </div>
                <div v-else>
                  <Input v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalSku" :disabled="!registerEdit"
                    :clearable="true" :maxlength="20" />
                </div>
              </FormItem>
            </template>
            <!-- 异常数量 -->
            <template slot-scope="{ row, index }" slot="abnormalNumber">
              <FormItem v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]" label=""
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalNumber`" class="table-form-item"
                :label-width="0" :rules="tableItemRules.abnormalNumber">
                <div v-if="!registerEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalNumber }}
                </div>
                <div v-else>
                  <Input v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalNumber"
                    placeholder="请输入不小于 0 的整数" :clearable="true" :disabled="!registerEdit" />
                </div>
              </FormItem>
            </template>
            <!-- 异常原因 -->
            <template slot-scope="{ row, index }" slot="abnormalReason">
              <FormItem label="" v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]"
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalReason`" class="table-form-item"
                :label-width="0" :rules="tableItemRules.abnormalReason">
                <div v-if="!registerEdit">
                  {{ showText('abnormalReason', formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalReason) }}
                </div>
                <div v-else>
                  <dytSelect v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalReason"
                    placeholder="请选择异常原因" :disabled="!registerEdit">
                    <Option v-for="(item, cIndex) in Object.values(reasonJson)" :key="`r-${(tableIndex + index)}-${cIndex}`" :value="item.value"
                      :label="item.label" />
                  </dytSelect>
                </div>
              </FormItem>
            </template>
            <!-- 仓库异常说明 -->
            <template slot-scope="{ row, index }" slot="abnormalWarehouseReason">
              <FormItem label="" v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]"
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalWarehouseReason`" class="table-form-item"
                :label-width="0" :rules="tableItemRules.abnormalWarehouseReason">
                <div v-if="!registerEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]
                    .abnormalWarehouseReason }}
                </div>
                <div v-else>
                  <Input v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalWarehouseReason"
                    placeholder="请输入仓库异常说明" :clearable="true" :disabled="!registerEdit" />
                </div>
              </FormItem>
            </template>
            <!-- 图片说明 -->
            <template slot-scope="{ row, index }" slot="abnormalImage">
              <FormItem label="" v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]"
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].abnormalImage`" class="table-form-item"
                :label-width="0">
                <!-- 编辑状态下 -->
                <div v-if="registerEdit">
                  <dytUpload ref="uploadImageRef" name="files" :maxSize="1024 * 10" :show-upload-list="false"
                  :on-success="handleSuccess" :on-error="handleError" :on-format-error="handleFormatError"
                  :on-exceeded-size="onExceededSize" :action="imgAddress" accept="image/*" :disabled="!registerEdit"
                  class="table-item-img">
                  <Button @click="selectTableRow(row, (tableIndex + index))"
                    v-if="$common.isEmpty(formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage) && registerEdit">上传图片</Button>
                  <Poptip trigger="hover"
                    v-if="!$common.isEmpty(formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage)" transfer
                    placement="left">
                    <div class="pic-poptip-view">
                      <div @click="selectTableRow(row, (tableIndex + index))">
                        <img v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage.includes('http://') ||
                          formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage.includes('https://')
                          " :src="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage" />
                        <img v-else
                          :src="`./filenode/s${formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage}`" />
                      </div>
                      <div @click.stop="removeRowImage(row, (tableIndex + index))" class="poptip-view-remove" title="移除图片"
                        v-if="registerEdit">
                        <Icon type="md-close" />
                      </div>
                    </div>
                    <div slot="content" class="pic-poptip-big-view">
                      <img v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage.includes('http://') ||
                        formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage.includes('https://')
                        " :src="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage" />
                      <img v-else :src="`./filenode/s${formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].abnormalImage}`" />
                    </div>
                  </Poptip>
                </dytUpload>
                </div>
                <!-- 详情状态下 -->
                <div v-else>
                  <div v-if="!$common.isEmpty(formData.processAbnormalArrivalDetailBOS[index].abnormalImage)">
                    <dyt-previewImg v-if="formData.processAbnormalArrivalDetailBOS[index].abnormalImage.includes('http://') ||
                    formData.processAbnormalArrivalDetailBOS[index].abnormalImage.includes('https://')
                    " :url="formData.processAbnormalArrivalDetailBOS[index].abnormalImage" />
                    <dyt-previewImg v-else
                    :url="`./filenode/s${formData.processAbnormalArrivalDetailBOS[index].abnormalImage}`" />
                  </div>
                </div>
              </FormItem>
            </template>
            <!-- 收货地址 -->
            <template slot-scope="{ row, index }" slot="abnormalAddress">
              <FormItem label="" v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]"
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].deliveryAddress`" class="table-form-item"
                :label-width="0" :rules="tableItemRules.abnormalAddress">
                <div v-if="!feedbackEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]
                    .deliveryAddress }}
                </div>
                <div v-else>
                  <Input v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].deliveryAddress" type="textarea"
                    :maxlength="200" placeholder="请输入收货地址" :clearable="true" :disabled="!feedbackEdit" />
                </div>
              </FormItem>
            </template>
            <!-- 采购/仓库处理说明 -->
            <template slot-scope="{ row, index }" slot="processReason">
              <FormItem label="" v-if="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)]"
                :prop="`processAbnormalArrivalDetailBOS[${(tableIndex + index)}].processReason`" class="table-form-item" :label-width="0"
                :rules="tableItemRules.processReason">
                <div v-if="!feedbackEdit">
                  {{ formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].processReason }}
                </div>
                <div v-else>
                  <Input v-model="formData.processAbnormalArrivalDetailBOS[(tableIndex + index)].processReason"
                    placeholder="请输入采购/仓库处理说明" :clearable="true" :disabled="!feedbackEdit" />
                </div>
              </FormItem>
            </template>
          </Table>
          <div class="mt10" style="display: flex; justify-content: space-between;align-items: center;">
            <div>
              <Button v-if="registerEdit" type="primary" icon="md-add" @click="addTableRow(true)">新 增</Button>
            </div>
            <Page
              style="text-align: right;"
              :total="pagination.total"
              @on-change="pageNumChange"
              show-total
              :page-size="pagination.pageSize"
              show-elevator
              :current="pagination.pageNum"
              show-sizer
              @on-page-size-change="pageSizeChange"
              placement="top"
              :page-size-opts="pageArray"
            />
          </div>

          <template v-if="formData.status >= 2">
            <div class="main-title" style="margin-top: 30px;">采购处理反馈</div>
            <FormItem label="采购处理措施：" prop="processMeasure" class="form-inline-item"
              :class="{ 'form-item-required': feedbackEdit }">
              <div v-if="!feedbackEdit">
                {{ formData.processMeasure ? measureJson[formData.processMeasure].label : '' }}
              </div>
              <div v-else>
                <dytSelect v-model="formData.processMeasure" placeholder="请选择采购处理措施" :disabled="!feedbackEdit">
                  <Option v-for="(item, index) in Object.values(measureJson)" :key="`m-${index}`" :value="item.value"
                    :label="item.label" @click.native="proMeasureChange(item.value)" />
                </dytSelect>
              </div>
            </FormItem>
            <FormItem label="采购处理说明：" prop="processReason" class="form-inline-item"
              :class="{ 'form-item-required': reasonRequired }">
              <div v-if="!feedbackEdit">
                {{ formData.processReason }}
              </div>
              <div v-else>
                <Input v-model="formData.processReason" placeholder="请输入采购处理说明" :clearable="true"
                  :disabled="!feedbackEdit" />
              </div>
            </FormItem>
            <FormItem label="收件供应商名称：" prop="receiptSupplierId" class="form-inline-item"
              :class="{ 'form-item-required': supplierIdRequired }">
              <div v-if="!feedbackEdit">
                {{ showText('supplierId', formData.receiptSupplierId) }}
              </div>
              <div v-else>
                <dyt-select v-model="formData.receiptSupplierId" :disabled="!feedbackEdit">
                  <Option v-for=" (item, index) in supplierList" :value="item.supplierId" :key="`supply-${index}`"
                    :label="item.supplierName" @click.native="selectSupplier(item)" />
                </dyt-select>
              </div>
            </FormItem>
            <!-- <FormItem label="供应商收件信息：" prop="receiptSupplierInfo" class="form-inline-item"
              :class="{ 'form-item-required': supplierInfoRequired }">
              <div v-if="!feedbackEdit">
                {{ formData.receiptSupplierInfo }}
              </div>
              <div v-else>
                <Input v-model="formData.receiptSupplierInfo" placeholder="请输入供应商收件信息" :clearable="true"
                  :disabled="!feedbackEdit" />
              </div>
            </FormItem> -->
            <FormItem label="需退回总数量：" prop="returnTotalNumber" class="form-inline-item"
              :class="{ 'form-item-required': returnNumberRequired }">
              <div v-if="!feedbackEdit">
                {{ formData.returnTotalNumber }}
              </div>
              <div v-else>
                <Input v-model="formData.returnTotalNumber" placeholder="请输入需退回总数量" :clearable="true"
                  :disabled="!feedbackEdit" />
              </div>
            </FormItem>
            <FormItem v-if="feedbackEdit" label="创建入库出库：" prop="createInbound"
              :class="{ 'form-item-required': returnNumberRequired }">
              <div>
                <RadioGroup v-model="formData.createInbound">
                  <Radio :label="1">是</Radio>
                  <Radio :label="0">否</Radio>
                </RadioGroup>
                <span class="ml10 jumpTips">(选项“是"提交按钮后跳转创建入库出库申请页面，已绑入库出库处理编号不自动转)</span>
              </div>
            </FormItem>
          </template>
          <template v-if="formData.status >= 3">
            <div class="main-title">仓储售后处理</div>
            <FormItem label="寄出日期：" prop="shipmentDate" class="form-inline-item"
              :class="{ 'form-item-required': shipmentDateRequired }">
              <div v-if="!afterSaleEdit">
                {{ formatTime(formData.shipmentDate) }}
              </div>
              <div v-else>
                <DatePicker type="date" transfer placeholder="选择寄出日期" v-model="formData.shipmentDate" format="yyyy-MM-dd"
                  :disabled="!afterSaleEdit" />
              </div>
            </FormItem>
            <FormItem label="寄出物流单号：" prop="shipmentTrackingNumber" class="form-inline-item"
              :class="{ 'form-item-required': sTracNumberRequired }">
              <div v-if="!afterSaleEdit">
                {{ formData.shipmentTrackingNumber }}
              </div>
              <div v-else>
                <Input v-model="formData.shipmentTrackingNumber" placeholder="请输入寄出物流单号" :clearable="true"
                  :disabled="!afterSaleEdit" />
              </div>
            </FormItem>
            <FormItem label="寄出数量：" prop="shipmentNumber" class="form-inline-item">
              <div v-if="!afterSaleEdit">
                {{ formData.shipmentNumber }}
              </div>
              <div v-else>
                <Input v-model="formData.shipmentNumber" placeholder="请输入寄出数量" :clearable="true"
                  :disabled="!afterSaleEdit" />
              </div>
            </FormItem>
            <FormItem label="寄出补充说明：" prop="shipmentReason" class="form-inline-item">
              <div v-if="!afterSaleEdit">
                {{ formData.shipmentReason }}
              </div>
              <div v-else>
                <Input v-model="formData.shipmentReason" placeholder="请输入寄出补充说明" :clearable="true"
                  :disabled="!afterSaleEdit" />
              </div>
            </FormItem>
            <FormItem label="仓库处理结果：" prop="processResult" class="form-inline-item">
              <div v-if="!afterSaleEdit">
                {{ formData.processResult ? resultJson[formData.processResult].label : '' }}
              </div>
              <div v-else>
                <dytSelect v-model="formData.processResult" placeholder="请选择仓库处理结果" :disabled="!afterSaleEdit">
                  <Option v-for="(item, index) in Object.values(resultJson)" :key="`res-${index}`" :value="item.value"
                    :label="item.label" />
                </dytSelect>
              </div>
            </FormItem>
          </template>
        </Form>
        <template v-if="['view', 'submit'].includes(viewType)">
          <div class="main-title">
            操作日志
            <Checkbox v-model="showRemarks" style="display: inline-block; margin-left: 10px" v-if="permission.addRemarks"
              :disabled="remarkLoading">显示备注</Checkbox>
          </div>
          <div class="main-remarks" v-if="permission.addRemarks">
            <dytInput v-model="remarks" type="textarea" :rows="3" :disabled="remarkLoading"></dytInput>
            <div class="remarks-button">
              <Button type="primary" @click="addLogRemark" :loading="remarkLoading">备 注</Button>
            </div>
          </div>
          <Table border highlight-row ref="logRef" :columns="logColumns" :max-height="600" :data="logData"
            :loading="remarkLoading">
          </Table>
        </template>
      </div>
      <!-- 选择产品弹窗 -->
      <Modal v-model="addProductModal" title="添加产品" width="1200" footer-hide :mask-closable="false">
        <addProduct v-if="addProductModal" ref="addProduct" :from="'allGoods'" :multiple="false" :disabledSlt="false"
          @addProductSuccess="addProductSuccess" @addProductCancel="addProductCancel" :wareId="warehouseId"
          :eliminateData="eliminateData" />
      </Modal>
      <Modal v-model="backReasonModal" title="" width="500" :mask-closable="false">
        <Form ref="modalFromRef" :model="backData" :rules="backRules" :label-width="100" style="padding-right: 40px;">
          <FormItem label="退回原因：" prop="returnReason">
            <dytInput type="textarea" v-model="backData.returnReason" :autosize="{ minRows: 4, maxRows: 6 }"
              :disabled="backLoading" placeholder="请输入退回原因"></dytInput>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="backHand(false)">取消</Button>
          <Button type="primary" @click="backHand(true)" :loading="backLoading">确定</Button>
        </div>
      </Modal>
      <!-- 转交采购员弹窗 -->
      <Modal v-model="transferModal" title="转交采购员" width="500" :mask-closable="false">
        <Form ref="transferForm" :model="transferForm" :rules="transferRules" :label-width="100"
          style="padding-right: 40px">
          <FormItem label="新采购员:" prop="newPurchaserId">
            <dyt-select v-model="transferForm.newPurchaserId">
              <Option v-for="(item, index) in Object.values(userInfoList)" :value="item.userId" :key="`u-${index}`"
                :label="item.userName" />
            </dyt-select>
          </FormItem>
          <FormItem label="备注:" prop="remark">
            <Input v-model="transferForm.remark" type="textarea" show-word-limit :rows="3" :maxlength="200" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="closeTransferModal">取消</Button>
          <Button type="primary" @click="confirmTransfer" :loading="transferLoading">确定</Button>
        </div>
      </Modal>
    </div>
  </dyt-model>
</template>

<script>
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
import addProduct from '@/views/wms/components/wms-inStock/newAddProduct';

export default {
  name: 'detailsPage',
  mixins: [common],
  components: {
    addProduct
  },
  props: {
    visibled: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => {
        return {
          viewType: 'view',
          warehouseId: '',
          details: {}
        }
      }
    },
    // 一些常量下拉
    otherOption: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      pageArray: [10, 20, 50, 100],
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 20,
      },
      formTableList: [],
      pageLoading: true,
      detailsVisible: false,
      remarks: '',
      failToload: false,
      showRemarks: true,
      isRemarks: false,
      remarkLoading: false,
      addProductModal: false,
      eliminateData: [],
      backData: {
        returnReason: '', // 退回原因
      },
      backRules: {
        returnReason: [
          { required: true, validator: this.$common.strMaxVerify, maxLength: 200, msg: '请输入退回原因', trigger: 'blur' },
          { required: true, validator: this.$common.strMaxVerify, maxLength: 200, msg: '请输入退回原因', trigger: 'change' }
        ]
      },
      transferRules: {
        remark: [
          {
            required: true,
            maxLength: 200,
            message: "请输入备注",
            trigger: "change",
          }
        ],
        newPurchaserId: [
          {
            required: true,
            message: "请选择",
            trigger: "change",
          }
        ]
      },
      backLoading: false,
      backReasonModal: false,
      transferModal: false,
      transferLoading: false,
      imgAddress: api.uploadFile, // 上传图片的接口
      // 表单数据
      formData: {},
      formInitData: {
        arrivalDate: '',
        purchaserId: null,
        abnormalType: null,
        supplierId: null,
        referenceNo: null,
        handleNo: null,
        status: null,
        processAbnormalArrivalDetailBOS: [],
        submitter: null, // 提交人
        warehouseId: null,
        abnormalArrivalNo: null,
        createInbound: 0
      },
      // 表单验证
      formRules: {
        arrivalDate: [
          { getRequired: () => this.isEdit, validator: this.validatorItem, msg: '请选择到仓日期', trigger: 'change' }
        ],
        purchaserId: [
          { getRequired: () => this.isEdit, validator: this.validatorItem, msg: '请选择对应采购员', trigger: 'change' }
        ],
        abnormalType: [
          { getRequired: () => this.isEdit, validator: this.validatorItem, msg: '请选择异常类型', trigger: 'change' }
        ],
        referenceNo: [
          { validator: this.$common.strMaxVerify, maxLength: 30, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, maxLength: 30, trigger: 'change' }
        ],
        processMeasure: [
          { getRequired: () => this.feedbackEdit, validator: this.validatorItem, msg: '请选择采购处理措施', trigger: 'change' }
        ],
        processReason: [
          { getRequired: () => this.reasonRequired, validator: this.$common.strMaxVerify, msg: '请输入采购处理说明', maxLength: 200, trigger: 'blur' },
          { getRequired: () => this.reasonRequired, validator: this.$common.strMaxVerify, msg: '请输入采购处理说明', maxLength: 200, trigger: 'change' }
        ],
        receiptSupplierId: [
          { getRequired: () => this.supplierIdRequired, validator: this.validatorItem, msg: '请选择收件供应商名称', trigger: 'change' }
        ],
        // receiptSupplierInfo: [
        //   { getRequired: () => this.supplierInfoRequired, validator: this.$common.strMaxVerify, msg: '请输入供应商收件信息', maxLength: 200, trigger: 'blur' },
        //   { getRequired: () => this.supplierInfoRequired, validator: this.$common.strMaxVerify, msg: '请输入供应商收件信息', maxLength: 200, trigger: 'change' }
        // ],
        returnTotalNumber: [
          { getRequired: () => this.returnNumberRequired, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'blur' },
          { getRequired: () => this.returnNumberRequired, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'change' },
        ],

        shipmentDate: [
          { getRequired: () => this.shipmentDateRequired, validator: this.validatorItem, msg: '请选择寄出日期', trigger: 'change' }
        ],
        shipmentTrackingNumber: [
          { getRequired: () => this.sTracNumberRequired, validator: this.$common.strMaxVerify, maxLength: 30, msg: '请输入寄出物流单号', trigger: 'blur' },
          { getRequired: () => this.sTracNumberRequired, validator: this.$common.strMaxVerify, maxLength: 30, msg: '请输入寄出物流单号', trigger: 'change' }
        ],
        shipmentNumber: [
          { validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'blur' },
          { validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'change' }
        ],
        shipmentReason: [
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'change' }
        ],
        processResult: [
          { required: true, validator: this.validatorItem, msg: '请选择仓库处理结果', trigger: 'change' }
        ]
      },
      // 列表验证
      tableItemRules: {
        abnormalPurchaseNumber: [
          { validator: this.$common.strMaxVerify, maxLength: 30, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, maxLength: 30, trigger: 'change' }
        ],
        abnormalNumber: [
          { getRequired: () => this.registerEdit, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'blur' },
          { getRequired: () => this.registerEdit, validator: this.$common.validatorMaxNumber, min: 0, point: 0, msg: '请输入不小于0的整数', trigger: 'change' },
        ],
        abnormalReason: [
          { getRequired: () => this.registerEdit, validator: this.validatorItem, msg: '请选择异常原因', trigger: 'change' }
        ],
        abnormalWarehouseReason: [
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'change' }
        ],
        processReason: [
          { validator: this.$common.strMaxVerify, msg: '请输入采购/仓库异常说明', maxLength: 200, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, msg: '请输入采购/仓库异常说明', maxLength: 200, trigger: 'change' }
        ],
        abnormalAddress: [
          { getRequired: () => this.supplierInfoRequired, validator: this.validatorItem, trigger: 'change' },
          { getRequired: () => this.supplierInfoRequired, validator: this.validatorItem, trigger: 'blur' },
        ]
      },
      supplierList: [], // 供应商列表
      // 展示的日志数据
      logData: [],
      // 当前ID下的所有日志
      logAllData: [],
      // 日志列
      logColumns: [
        {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          width: 200,
        },
        {
          title: '操作内容描述',
          key: 'operateContent',
          align: 'center',
          minWidth: 150,
          render: (h, { row }) => {
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, [
              h('div', {
                style: {
                  display: 'inline-block'
                }
              }, row.operateContent)
            ])
          }
        },
        {
          title: '操作时间',
          key: 'createdTime',
          align: 'center',
          width: 200,
        },
      ],
      // 已被选中的数据
      tableSelectInfo: {},
      transferForm: {
        newPurchaserId: null,
        remark: null
      },
      allBusinessDeptArr: {},
    }
  },
  watch: {
    visibled: {
      immediate: true,
      handler(val) {
        this.detailsVisible = val;
      }
    },
    detailsVisible: {
      handler(val) {
        this.$emit('update:visibled', val);
        if (!val) return;
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.initData();
          }, 200)
        })
      }
    },
    showRemarks: {
      handler(val) {
        if (!this.isRemarks) return;
        this.logData = this.handRemarkDetail(this.logAllData, val);
      }
    }
  },
  computed: {
    // 权限
    permission() {
      return {
        // 新增备注
        addRemarks: this.getPermission('processAbnormalArrival_addOperate'),
        // 退回
        back: this.getPermission('processAbnormalArrival_return'),
        // 转交
        transfer: this.getPermission("processAbnormalArrival_changePurchase")
      }
    },
    // 视图类型
    viewType() {
      return this.moduleData.viewType || 'view';
    },
    // 是否可以编辑
    isEdit() {
      return !['view'].includes(this.viewType) && this.formData.status < 4 && !this.failToload;
    },
    isBack() {
      return this.isEdit && !['add'].includes(this.viewType) && this.formData.status > 1 && this.permission.back;
    },
    // 是否可以编辑 异常明细登记
    registerEdit() {
      return this.isEdit && (this.formData.status == 1 || ['add'].includes(this.viewType));
    },
    // 是否可以编辑 采购处理反馈
    feedbackEdit() {
      return this.isEdit && this.formData.status == 2;
    },
    // 采购说明 必填
    reasonRequired() {
      return [1, 3].includes(Number(this.formData.processMeasure)) && this.feedbackEdit;
    },
    // 收件供应商名称 必填
    supplierIdRequired() {
      return [2].includes(Number(this.formData.processMeasure)) && this.feedbackEdit;
    },
    // 供应商收件信息 必填
    supplierInfoRequired() {
      return [2].includes(Number(this.formData.processMeasure)) && this.feedbackEdit;
    },
    // 需退回总数量 必填
    returnNumberRequired() {
      return [2].includes(Number(this.formData.processMeasure)) && this.feedbackEdit;
    },
    // 是否可以编辑 仓储售后处理
    afterSaleEdit() {
      return this.isEdit && this.formData.status == 3;
    },
    // 寄出日期是否必要
    shipmentDateRequired() {
      return [2].includes(Number(this.formData.processMeasure)) && this.afterSaleEdit;
    },
    // 寄出物流单号是否必填
    sTracNumberRequired() {
      return [2].includes(Number(this.formData.processMeasure)) && this.afterSaleEdit;
    },
    // 详情数据
    detailsData() {
      return this.moduleData.details || {};
    },
    // 仓库ID
    warehouseId() {
      return this.moduleData.warehouseId || '';
    },
    // ID
    abnormalArrivalId() {
      return this.detailsData.abnormalArrivalId
    },
    // 登录人ID
    erpUserId() {
      if (this.$common.isEmpty(this.$store.getters.authUserInfo)) return '';
      if (this.$common.isEmpty(this.$store.getters.authUserInfo.securityUser)) return '';
      return this.$store.getters.authUserInfo.securityUser.erpUserId || '';
    },
    userInfoList() {
      return this.$store.state.userInfoList;
    },
    // 创建人
    createdByInfo() {
      const list = this.userInfoList || {};
      let userInfo = {};
      if (this.viewType != 'add') {
        userInfo = this.$common.isEmpty(this.formData.createdBy) ? {} : list[this.formData.createdBy];
      } else {
        userInfo = this.$common.isEmpty(this.erpUserId) ? {} : list[this.erpUserId];
      }
      return this.$common.isEmpty(userInfo) ? { userName: this.formData.createdBy || '' } : userInfo;
    },
    // 异常原因
    reasonJson() {
      return this.otherOption.reasonJson || {}
    },
    // 采购处理措施
    measureJson() {
      return this.otherOption.measureJson || {}
    },
    // 仓库处理结果
    resultJson() {
      return this.otherOption.resultJson || {}
    },
    // 异常明细登记列处理
    tableColumns() {
      const processReason = {
        title: '采购/仓库异常说明',
        slot: 'processReason',
        align: 'center',
        defaultVal: null,
        minWidth: 150,
      };
      const abnormalImage = {
        title: '图片说明',
        slot: 'abnormalImage',
        align: 'center',
        defaultVal: null,
        width: 150,
      };
      const abnormalAddress = {
        title: '收货地址',
        slot: 'abnormalAddress',
        align: 'center',
        defaultVal: null,
        width: 250,
        renderHeader: (h, params) => {
          return h('div', {}, [
            h('span', {}, '收货地址'),
            this.supplierInfoRequired
              ? h('span', {
                style: {
                  color: 'red'
                }
              }, '*') : null
          ])
        }
      };
      const operation = {
        title: '操作',
        key: 'operation',
        align: 'center',
        width: 150,
        render: (h, { row, index }) => {
          if (!this.isEdit) return h('span', {}, '');
          return h('span', {
            class: 'operation-delete',
            on: {
              click: () => {
                this.removeTableRow(this.tableIndex + index);
              }
            }
          }, '删除');
        }
      };
      const defaultColumns = this.getAbnormalColumns(this.registerEdit);
      if (this.registerEdit) {
        if (this.viewType == 'add') {
          return [
            ...defaultColumns,
            abnormalImage,
            operation
          ]
        }
        return [
          ...defaultColumns,
          abnormalImage,
          operation
        ]
      }
      if (this.formData.status > 1) {
        return [
          ...defaultColumns,
          processReason,
          abnormalImage,
          abnormalAddress,
        ]
      }
      return [
        ...defaultColumns,
        abnormalImage,
        abnormalAddress,
      ]
    },
    businessName() {
      let data = this.allBusinessDeptArr[this.formData.purchaserId] || {};
      return data.name;
    },
    // 当前表格起始下标
    tableIndex () {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize;
    },
  },
  methods: {
    purchaserIdChange(e) {
      if (!e || this.allBusinessDeptArr[e]) return;
      this.axios.get(api.getUserBusinessDeptName, { params: { purchaserId: e } }).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$set(this.allBusinessDeptArr, e, { name: res.data.datas })
      })
    },
    // 加载页面必要数据
    initData() {
      this.pageLoading = true;
      // this.resetFromData();
      this.formData = this.$common.copy(this.formInitData);
      let awaitList = [
        this.getSupplierList,
        () => {
          return this.getDetails(this.abnormalArrivalId);
        },
        () => {
          return this.getRemarkDetail(this.abnormalArrivalId);
        }
      ];
      this.$common.promiseAll(awaitList).then(resArr => {
        // console.log(resArr);
      }).finally(() => {
        this.isRemarks = true;
        this.pageLoading = false;
        if (this.viewType == 'add') {
          this.addTableRow()
        } else {
          this.searchTable();
        }
      })
    },
    // 返回列
    getAbnormalColumns(isRequired = false) {
      return [
        {
          title: '序号',
          key: 'serialNumber',
          width: 70,
          defaultVal: null,
          align: 'center'
        },
        {
          title: '异常采购单号',
          slot: 'abnormalPurchaseNumber',
          align: 'center',
          defaultVal: null,
          minWidth: 150,
        },
        {
          title: '异常sku',
          slot: 'abnormalSku',
          align: 'center',
          defaultVal: null,
          width: 150,
        },
        {
          title: '异常数量',
          slot: 'abnormalNumber',
          align: 'center',
          defaultVal: null,
          width: 150,
          renderHeader(h, params) {
            return h('div', {
              class: isRequired ? 'table-col-required' : '',
            }, '异常数量')
          }
        },
        {
          title: '异常原因',
          slot: 'abnormalReason',
          align: 'center',
          defaultVal: null,
          minWidth: 150,
          renderHeader(h, params) {
            return h('div', {
              class: isRequired ? 'table-col-required' : '',
            }, '异常原因')
          }
        },
        {
          title: '仓库异常说明',
          slot: 'abnormalWarehouseReason',
          align: 'center',
          defaultVal: null,
          minWidth: 150,
        }
      ]
    },
    // 重置表单数据
    resetFromData() {
      this.isRemarks = false;
      this.failToload = false;
      this.logData = [];
      this.logAllData = [];
      this.remarks = '';
      this.formData = this.$common.copy(this.formInitData);
      this.$nextTick(() => {
        this.$refs.fromRef && this.$refs.fromRef.resetFields();
      })
      this.$nextTick(() => {
        this.showRemarks = true;
        this.pageLoading = true;
      })
    },
    // 获取详情
    getDetails(id) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(id)) return resolve({});
        this.axios.post(`${api.abnormalDetail}?abnormalArrivalId=${id}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({});
          Object.keys(res.data.datas).forEach(key => {
            this.$set(this.formData, key, res.data.datas[key]);
          })
          if (this.formData.shipmentReason == null) {
            this.formData.shipmentReason = '';
          }
          if (this.formData.arrivalDate == null) {
            this.formData.arrivalDate = '';
          }
          if (this.formData.shipmentDate == null) {
            this.formData.shipmentDate = '';
          }
          this.purchaserIdChange(this.formData.purchaserId);
          resolve(res.data.datas);
        }).catch(() => {
          this.failToload = true;
          resolve({});
        })
      })
    },
    // 页码改变
    pageNumChange (val) {
      this.pagination.pageNum = val;
      this.searchTable();
    },
    // 列表条数改变
    pageSizeChange (val) {
      this.pagination.pageNum = 1;
      this.pagination.pageSize = val;
      this.searchTable();
    },
    // 列表数据处理
    searchTable (lastNum) {
      if (lastNum) {
        const total = this.formData.processAbnormalArrivalDetailBOS.length;
        if (total > 0 && this.pagination.pageSize > 0) {
          this.pagination.pageNum = Math.ceil(total / this.pagination.pageSize);
        }
      }
      this.$nextTick(() => {
        const pageSize = this.pagination.pageSize;
        const pageNum = this.pagination.pageNum
        this.formTableList = this.formData.processAbnormalArrivalDetailBOS.slice((pageNum - 1) * pageSize, pageNum * pageSize);
        this.pagination.total = this.formData.processAbnormalArrivalDetailBOS.length;
      });
    },
    // 日志详情
    getRemarkDetail(id) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(id)) return resolve({});
        this.remarkLoading = true;
        this.axios.post(`${api.abnormalRemarkDetail}?abnormalArrivalId=${id}`).then(res => {
          if (!res || !res.data || res.data.code != 0) {
            this.logAllData = [];
            this.logData = [];
            resolve([]);
            return;
          }
          this.logAllData = res.data.datas;
          this.logData = this.handRemarkDetail(this.logAllData, this.showRemarks);
          resolve(res.data.datas);
        }).catch(() => {
          this.logAllData = [];
          this.logData = [];
          resolve([]);
        }).finally(() => {
          this.remarkLoading = false;
        })
      })
    },
    // 处理日志
    handRemarkDetail(allData, showRemarks) {
      if (this.$common.isEmpty(allData)) return [];
      if (showRemarks) return allData;
      return allData.filter(row => {
        return row.type == 1;
      })
    },
    // 获取供应商
    getSupplierList() {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.supplierList)) return resolve(this.supplierList);
        this.axios.post(`${api.get_SupplierInfo}?businessDeptIds=''`).then(res => {
          if (!res || !res.data || !res.data.datas) return resolve([]);
          this.supplierList = res.data.datas;
          resolve(res.data.datas);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 隐藏详情
    backList() {
      this.resetFromData();
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.detailsVisible = false;
        })
      })
    },
    // 新增异常数据
    addTableRow (type) {
      const tableData = this.$common.copy(this.formData.processAbnormalArrivalDetailBOS);
      const tableNumber = tableData.map(row => {
        return this.$common.isEmpty(Number(row.serialNumber)) ? 0 : Number(row.serialNumber);
      });
      const maxIndex = this.$common.isEmpty(tableNumber) ? 1 : Math.max.apply(null, tableNumber) + 1;
      let newRow = {
        productGoodsId: null
      };
      this.tableColumns.forEach(item => {
        if (!['operation'].includes(item.key)) {
          if (!this.$common.isEmpty(item.key)) {
            newRow[item.key] = item.key == 'serialNumber' ? maxIndex : item.defaultVal;
          }
          if (!this.$common.isEmpty(item.slot)) {
            newRow[item.slot] = item.slot == 'serialNumber' ? maxIndex : item.defaultVal;
          }
        }
      });
      tableData.push(newRow);
      this.$set(this.formData, 'processAbnormalArrivalDetailBOS', tableData);
      this.searchTable(type);
    },
    // 采购处理措施 改变
    proMeasureChange(val) {
      this.$nextTick(() => {
        const keys = ['processReason', 'receiptSupplierId', 'returnTotalNumber'];
        keys.forEach((key) => {
          this.$refs.fromRef.validateField(key);
        });
      })
    },
    // 打开选择 SKU 弹窗
    openSelectSku(row, index) {
      if (!this.registerEdit) return;
      this.eliminateData = [row];
      this.selectTableRow(row, index);
      this.$nextTick(() => {
        this.addProductModal = true;
      })
    },
    // 当前操作的行
    selectTableRow(row, index) {
      if (!this.registerEdit) return;
      this.tableSelectInfo = {
        row: row,
        index: index
      }
    },
    // 确认添加产品
    addProductSuccess(data) {
      if (!this.$common.isEmpty(data) && !this.$common.isEmpty(this.tableSelectInfo)) {
        const res = data[0];
        let tableData = this.$common.copy(this.formData.processAbnormalArrivalDetailBOS);
        let row = tableData[this.tableSelectInfo.index];
        row.abnormalSku = res.goodsSku;
        row.productGoodsId = res.productGoodsId;
        this.$set(this.formData, 'processAbnormalArrivalDetailBOS', tableData);
      }
      this.addProductModal = false;
      this.$nextTick(() => {
        this.tableSelectInfo = {};
        this.searchTable();
      })
    },
    // 取消添加产品
    addProductCancel() {
      this.tableSelectInfo = {};
      this.addProductModal = false;
    },
    // 删除行
    removeTableRow(index) {
      this.formData.processAbnormalArrivalDetailBOS.splice(index, 1);
      const total = this.formData.processAbnormalArrivalDetailBOS.length;
      let pNum = 1;
      if (total > 0 && this.pagination.pageSize > 0) {
        pNum = Math.ceil(total / this.pagination.pageSize);
      }
      if (pNum < this.pagination.pageNum) {
        this.pagination.pageNum = pNum;
      }
      this.searchTable();
    },
    // 新增备注
    addLogRemark() {
      if (this.$common.isEmpty(this.remarks)) return;
      this.remarkLoading = true;
      this.axios.post(`${api.addOperate}?abnormalArrivalId=${this.abnormalArrivalId}`, [this.remarks]).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.remarks = '';
        this.getRemarkDetail(this.abnormalArrivalId);
      }).catch(() => {
        this.remarkLoading = false;
      })
    },
    // 图片上传成功
    handleSuccess(res) {
      if (!res || res.code != 0) {
        this.$Message.error('上传图片失败！');
        return;
      }
      let tableData = this.$common.copy(this.formData.processAbnormalArrivalDetailBOS);
      let row = tableData[this.tableSelectInfo.index];
      row.abnormalImage = res.datas;
      this.$set(this.formData, 'processAbnormalArrivalDetailBOS', tableData);
      this.$nextTick(() => {
        this.tableSelectInfo = {};
      })
    },
    // 移除图片
    removeRowImage(tableRow, index) {
      if (!this.registerEdit) return;
      let tableData = this.$common.copy(this.formData.processAbnormalArrivalDetailBOS);
      let row = tableData[index];
      row.abnormalImage = '';
      this.$set(this.formData, 'processAbnormalArrivalDetailBOS', tableData);
    },
    // 图片上传失败
    handleError(err) {
      this.$Message.error('上传图片失败！');
      this.tableSelectInfo = {};
      console.error(err);
    },
    // 图片上传时格式有误
    handleFormatError() {
      this.$Message.error('上传文件格式有误，请上传图片！');
      this.tableSelectInfo = {};
    },
    // 图片上传大小
    onExceededSize() {
      this.$Message.error('请上传 10M 以内的图片！');
      this.tableSelectInfo = {};
    },
    // 验证表单
    validatorItem(rule, value, callback) {
      let required = rule.required;
      if (this.$common.isFunction(rule.getRequired)) {
        required = rule.getRequired();
      }
      if (required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      callback();
    },
    // 处理表单数据
    getFormData(isVerify, isSubmit) {
      return new Promise((resolve) => {
        let newData = this.$common.copy(this.formData);
        newData.warehouseId = this.warehouseId;
        newData.arrivalDate = this.$common.isEmpty(newData.arrivalDate) ? null : this.$common.toLocaleDate(newData.arrivalDate, 'YYYY-MM-DD', 0);
        newData.shipmentDate = this.$common.isEmpty(newData.shipmentDate) ? null : this.$common.toLocaleDate(newData.shipmentDate, 'YYYY-MM-DD', 0);
        // newData.abnormalArrivalId  // 这个ID 是更新时传
        if (isSubmit) {
          // 提交人, 只有提交时才传
          if (this.viewType == 'add') {
            newData.submitter = this.erpUserId;
          }
        }
        if (isVerify) {
          this.$refs.fromRef.validate((valid) => {
            if (!valid) return resolve({ success: false, error: '验证不通过' });
            if (this.registerEdit && this.$common.isEmpty(newData.processAbnormalArrivalDetailBOS)) {
              return resolve({ success: false, error: '异常明细登记不能为空' });
            }
            resolve({ success: true, data: newData });
          });
          return;
        }
        resolve({ success: true, data: newData });
      })
    },
    // 提交
    detailsSubmit(isRemain) {
      this.detailsSave(true, true, isRemain);
    },
    // 退回
    sendBack() {
      this.backData.returnReason = '';
      this.backReasonModal = true;
    },
    // 退回处理
    backHand(type) {
      if (!type) {
        this.backReasonModal = false;
        return;
      }
      if (this.backLoading) return;
      this.$refs.modalFromRef.validate((valid) => {
        if (!valid) return;
        this.backLoading = true;
        this.axios.post(`${api.abnormalReturn}?abnormalArrivalId=${this.abnormalArrivalId}&returnReason=${this.backData.returnReason}`).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功');
          this.backReasonModal = false;
          this.detailsVisible = false;
          this.$emit('resetTable', {
            resetTime: true,
            type: true
          });
        }).finally(() => {
          this.backLoading = false;
        })
      })
    },
    // 选中供应商时 列表默认收货地址为该供应商地址
    selectSupplier(item) {
      if (this.$common.isEmpty(item)) {
        // this.formData.receiptSupplierInfo = '';
        return;
      }
      let deliveryAddress = ''
      deliveryAddress = this.$common.trim(`${item.contactMan || ''} ${item.telephone || ''} ${item.rAddress || ''} ${item.rAddressDetail || ''}`);
      this.formData.receiptSupplierInfo = deliveryAddress
      this.formData.processAbnormalArrivalDetailBOS.forEach(item => {
        item.deliveryAddress = deliveryAddress
      })
    },
    // 保存
    detailsSave(isVerify, isSubmit, isRemain) {
      if (this.pageLoading) return;
      this.getFormData(isVerify, isSubmit).then((res) => {
        if (!res.success) return this.$Message.error(res.error);
        let data = res.data
        this.axios.post(`${api.addOrUpdateProcess}?type=${isSubmit ? 1 : 2}`, res.data).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功');
          if (isRemain) {
            this.resetFromData()
            this.$nextTick(() => {
              this.addTableRow()
              this.pageLoading = false
            })
          } else {
            if (data.createInbound && isSubmit && this.$common.isEmpty(this.formData.handleNo)) {
              this.jumpAddApply(data)
            } else {
              this.detailsVisible = false;
              this.$emit('resetTable', {
                resetTime: true,
                type: true
              });
            }
          }
        })
      })
    },
    // 暂存
    temporarySave() {
      this.detailsSave(false);
    },
    // 转交
    transferToPurchaser() {
      this.transferModal = true
    },
    // 关闭转交Modal
    closeTransferModal() {
      this.transferModal = false
      this.transferForm = {
        newPurchaserId: null,
        remark: null
      }
    },
    // 确定转交
    confirmTransfer() {
      this.$refs.transferForm.validate((valid) => {
        if (!valid) return;
        let obj = {
          submitter: this.erpUserId,
          abnormalArrivalId: this.formData.abnormalArrivalId,
          abnormalArrivalNo: this.formData.abnormalArrivalNo,
          oldPurchaserId: this.formData.purchaserId,
          newPurchaserId: this.transferForm.newPurchaserId,
          remark: this.transferForm.remark
        }
        this.transferLoading = true
        this.axios.post(api.changePurchase, obj).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success("操作成功");
          this.closeTransferModal()
          this.detailsVisible = false;
          this.$emit("resetTable", {
            resetTime: true,
            type: true,
          });
        }).finally(() => {
          this.transferLoading = false;
          this.transferForm = {
            newPurchaserId: null,
            remark: null
          }
        })
      })
    },
    // 格式化时间
    formatTime(time, type) {
      let pattern = /-/
      let resultTime = ''
      if (!pattern.test(time) && !this.$common.isEmpty(time)) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0')
        if (type === 'month') {
          resultTime = `${year}-${month}`;
        } else {
          resultTime = `${year}-${month}-${day}`;
        }
        return resultTime
      } else {
        return time
      }
    },
    // 在非编辑状态下不展示输入框选择框、只显示文本
    showText(type, val) {
      let result = null
      // 采购人
      if (type == 'purchaserId' && val) {
        const list = this.userInfoList
        result = list[val] ? list[val].userName : ''
      }
      // 异常类型
      if (type == 'abnormalType') {
        result = val == 1 ? '产品异常(发多/发错/发少/质量问题等)' : val == 2 ? '包裹异常(无清单/无包装/破损/污染等)' : ''
      }
      // 供应商
      if (type == 'supplierId' && val) {
        const list = this.$common.arrayToObj(this.supplierList, "supplierId");
        result = list[val] ? list[val].supplierName : ''
      }
      // 异常理由
      if (type == 'abnormalReason' && val) {
        result = this.reasonJson[val] ? this.reasonJson[val].label : ''
      }
      return result
    },
    // 提交之后跳转创建出库入库单
    jumpAddApply(data) {
      let abnorMalData = this.$common.copy(this.formData)
      abnorMalData.wmsGoodsStockApplyDetailList = []
      let skuList = data.processAbnormalArrivalDetailBOS
        ? data.processAbnormalArrivalDetailBOS.filter(item => !this.$common.isEmpty(item.abnormalSku)).map(item => item.abnormalSku) : []
      if (skuList.length != 0) {
        skuList = [...new Set(skuList)] // 去重
        // 处理匹配sku
        this.axios.post(api.queryProductInfoBySkuList, skuList).then(res => {
          if (res.data.code == 0) {
            let resultList = this.$common.isEmpty(res.data.datas) ? [] : res.data.datas.map(item => {
              return {
                ...item,
                returnNumber: 0
              }
            })
            resultList.forEach(rItem => {
              this.formData.processAbnormalArrivalDetailBOS.forEach(aItem => {
                // 这里判断是否会存在异常明细登记列表中是否会存在相同SKU情况，存不存在都累加退货数量
                if (aItem.abnormalSku == rItem.goodsSku) {
                  rItem.returnNumber += aItem.abnormalNumber
                }
              })
              abnorMalData.wmsGoodsStockApplyDetailList.push({
                returnNumber: rItem.returnNumber,
                stockReason: null,
                price: null,
                discount: null,
                goodsCnDesc: rItem.goodsCnDesc,
                goodsId: rItem.productGoodsId,
                goodsAttributes: rItem.goodsAttributes,
                goodsSku: rItem.goodsSku,
                goodsUrl: rItem.goodsUrl,
              })
            })
          }
        })
      }
      this.detailsVisible = false;
      this.$emit('createAddApply', abnorMalData)
    }
  }
};
</script>

<style lang="less" scoped>
.page-details {
  .button-group {
    >button {
      margin-right: 10px;

      &:last-child {
        margin-right: 0px;
      }
    }
  }

  .details-main {
    position: relative;
    padding: 10px 0px;

    .main-title {
      padding: 10px 0;
      font-size: 16px;
      font-weight: bold;
    }

    .main-from {
      .form-inline-item {
        width: calc(25% - 10px);
        min-width: 280px;
      }
    }
  }

  .main-remarks {
    display: flex;
    margin-bottom: 20px;

    .dyt-custom-input-box[type="textarea"] {
      width: calc(100% - 80px);
      max-width: 700px;
      margin-right: 10px;

      :deep(.ivu-input) {
        resize: none;
      }
    }

    .remarks-button {
      position: relative;

      .ivu-btn {
        position: absolute;
        bottom: 0;
      }
    }
  }

  :deep(.ivu-table-cell) {
    .operation-delete {
      cursor: pointer;
      color: #f20;
    }

    .table-form-item {
      margin: 0 auto;

      .table-item-img {
        line-height: 0;
      }

      .pic-poptip-view {
        position: relative;
        margin: 0 auto;

        .poptip-view-remove {
          display: none;
          position: absolute;
          top: 0px;
          right: 0px;
          background: #2d8cf0;
          color: #fff;
          cursor: pointer;
          border-radius: 2px;
        }

        &:hover {
          .poptip-view-remove {
            display: inline-block;
          }
        }
      }

      img {
        max-width: 64px;
        max-height: 64px;
        cursor: pointer;
      }
    }
  }

  ::v-deep .ivu-input[disabled],
  fieldset[disabled] .ivu-input {
    background-color: #f3f3f3;
    opacity: 1;
    cursor: default;
    color: #333;
  }

  ::v-deep .dyt-select-demo .ivu-select-input[disabled] {
    opacity: 1;
    color: #333;
    -webkit-text-fill-color: #333;
    cursor: default;
  }
}

.pic-poptip-big-view {
  img {
    width: 400px;
  }
}

.ivu-date-picker {
  width: 100%;
}

.jumpTips {
  color: red;
}
</style>
