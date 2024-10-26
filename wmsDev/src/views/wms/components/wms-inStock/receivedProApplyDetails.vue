<template>
  <div>
    <h2>已入库产品出库流程</h2>
    <Divider />
    <Form ref="receivedProApplyForm" class="mt20" :model="receivedProApplyForm" :label-width="120" :rules="ruleValidate">
      <!-- 产品到货出库信息申请 -->
      <div>
        <div style="display: flex" class="mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">产品到货出库信息申请</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem label="处理编号:">
            <span>{{ receivedProApplyForm.handleNo }}</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="创建人:">
            <span>{{ createByName }}</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="所属事业部:">
            <span>{{ businessDept }}</span>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="申请日期:" prop="applyTime">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 1
              ">
              <DatePicker v-model="receivedProApplyForm.applyTime" type="date" placeholder="选择日期" style="width: 200px"
                :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 1)"
                @on-change="(e) => { getApplyTime(e, 'applyTime') }">
              </DatePicker>
            </div>
            <div v-else>
              {{ formatTime(receivedProApplyForm.applyTime) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="收件供应商名称:" prop="supplierId">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 1">
              <dyt-select v-model="receivedProApplyForm.supplierId" clearable filterable
                :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 1)">
                <Option v-for="(item, index) in supplierArr" :value="item.supplierId" :key="index">{{ item.supplierName }}
                </Option>
              </dyt-select>
            </div>
            <div v-else>
              {{ showText('supplierId', receivedProApplyForm.supplierId) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="结算方式:">
            <!-- <Input v-model="receivedProApplyForm.settlementTypeName"/> -->
            <!-- <div v-if=" detailsData.type === 'edit' &&
              receivedProApplyForm.status == 1">
              <dyt-select v-model="receivedProApplyForm.settlementTypeName" clearable filterable
              :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 1)">
              <Option v-for="(item, index) in settlementMethodArr" :value="item.dataValue" :key="index">{{ item.dataDesc
              }}
              </Option>
            </dyt-select>
            </div> -->
            <div>
              {{ showText('settlementTypeName', receivedProApplyForm.settlementTypeName) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="12">
          <FormItem label="供应商收件信息:">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
              <Input v-model="receivedProApplyForm.supplierReceivingInfo" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.supplierReceivingInfo }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6" v-if="receivedProApplyForm.status !== 1">
          <FormItem label="出库单号:" prop="pickingNo">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 2">
              <Input v-model="receivedProApplyForm.pickingNo" :maxlength="30" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.pickingNo }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="出库原因:" prop="pickingReason">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 1">
              <dyt-select v-model="receivedProApplyForm.pickingReason" clearable filterable
                :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 1)">
                <Option v-for="(item, index) in outboundReasonList" :value="item.value" :key="index">{{ item.label }}
                </Option>
              </dyt-select>
            </div>
            <div v-else>
              {{ showText('pickingReason', receivedProApplyForm.pickingReason) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="申请出库总金额:">
            {{ receivedProApplyForm.stockApplyTotalAmount }}元
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="申请出库总数量:">
            {{ receivedProApplyForm.actualStockNumber }}件
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="需抵/退还金额:">
            {{ receivedProApplyForm.returnTotalAmount }}元
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="申请补充说明:">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
              <Input v-model="receivedProApplyForm.applyRemark" :maxlength="200" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.applyRemark }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="仓库:" prop="warehouseId">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 1
              ">
              <dyt-select v-model="receivedProApplyForm.warehouseId" clearable filterable disabled>
                <Option v-for="(item, index) in warehouseList" :value="item.warehouseId" :key="index">{{
                  item.warehouseName
                }}
                </Option>
              </dyt-select>
            </div>
            <div v-else>
              {{ showText('warehouseId', receivedProApplyForm.warehouseId) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="申请出库明细:">
            <div v-if="!receivedProApplyForm.applyDetailFilePath
              && detailsData.type === 'edit'
              && receivedProApplyForm.status == 1">
              <Upload ref="excelUploadRef" name="files" :show-upload-list="true" :before-upload="fileUploadBefore"
                accept=".xlsx,.xls" :action="uploadFilesUrl" :max-size="10240" class="upload-item">
                <div class="upload-icon">
                  <Button type="primary">
                    <Icon type="ios-cloud-upload" />
                    上传
                  </Button>
                </div>
                <Spin v-if="isUploadLoading" fix></Spin>
              </Upload>
            </div>
            <div v-else>
              <div v-if="receivedProApplyForm.applyDetailFilePath">
                <Icon type="ios-paper" size="20" color="green" />
                {{ receivedProApplyForm.applyDetailFileName }}
                <Icon type="md-eye" size="20" class="ml10" style="cursor:pointer" @click="getDetailsExcel('see')" />
                <Icon type="md-download" size="20" class="ml20" style="cursor:pointer"
                  @click="getDetailsExcel('download')" />
                <Icon type="ios-trash" v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1" size="20"
                  class="ml20" style="cursor:pointer" @click="getDetailsExcel('delete')" />
              </div>
              <div v-else>
                -
              </div>
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="到货异常编号:" prop="abnormalArrivalNo">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
              <Input v-model="receivedProApplyForm.abnormalArrivalNo" :maxlength="17" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.abnormalArrivalNo }}
            </div>
          </FormItem>
        </Col>
        </Row>
      </div>
      <Divider />
      <!-- 出库明细列表 -->
      <div>
        <div class="mt20 mb10" style="display: flex">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">出库明细列表</span>
        </div>
        <div class="flexBox mt20" v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
          <Button type="primary" @click="addGoods">添加商品</Button>
          <Button type="primary" class="ml10" @click="importExcel = true">Excel导入</Button>
        </div>
        <!-- <div class="flexBox mt20" v-if="receivedProApplyForm.status !== 1 || detailsData.type == 'view'">
            <Button type="primary" @click="exportGoodsDetails">excel导出 <Icon type="md-download" /></Button>
          </div> -->
        <div class="normalTop">
          <Table :border="true" :columns="goodsColumn" :data="tableData"
            :height="pagination.total > 8 ? 450 : 0" class="demandTableStyle">
            <template slot-scope="{ index }" slot="returnNumber">
              <FormItem class="mt20" :label-width="0"
                :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.returnNumber'"
                :rules="{ required: true, type: 'number', message: '请填写', trigger: 'change' }">
                <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
                  <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].returnNumber"
                    :min="1" :precision="0"></InputNumber>
                </div>
                <div v-else>
                  {{ receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].returnNumber }}
                </div>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="price">
              <FormItem class="mt20" :label-width="0" :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.price'"
                :rules="{ validator: validPrice, trigger: 'change' }">
                <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
                  <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].price" :min="1">
                  </InputNumber>
                </div>
                <div v-else>
                  {{ receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].price }}
                </div>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="stockReason">
              <FormItem class="mt20" :label-width="0">
                <div v-if="detailsData.type === 'edit' &&
                  receivedProApplyForm.status == 1">
                  <Input v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].stockReason"
                    placeholder="请输入" :maxlength="200" type='textarea' :rows="3" show-word-limit
                    :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 1)"></Input>
                </div>
                <div v-else>
                  {{ receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].stockReason }}
                </div>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="discount">
              <FormItem class="mt20" :label-width="0" :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.discount'"
                :rules="{ validator: validDiscount, trigger: 'change' }">
                <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 1">
                  <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].discount">
                  </InputNumber>
                </div>
                <div v-else>
                  {{ receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].discount }}
                </div>
              </FormItem>
            </template>
          </Table>
          <Page
            class="mt10"
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
      </div>
      <Divider />
      <!-- 仓库出库情况反馈 -->
      <div v-if="receivedProApplyForm.status !== 1
      && receivedProApplyForm.status !== 2
      && !receivedProApplyForm.skipWarehouse ">
        <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">仓库出库情况反馈</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem label="实际出库总数量:" prop="actualStockNumber">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 3">
              <InputNumber v-model="receivedProApplyForm.actualStockNumber" :min="1" :precision="0"></InputNumber>
            </div>
            <div v-else>
              {{ receivedProApplyForm.actualStockNumber }}
            </div>
          </FormItem>
          </Col>
          <Col :span="18">
          <FormItem label="补充出库说明:" prop="stockRemark">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 3">
              <Input v-model="receivedProApplyForm.stockRemark" :maxlength="200"></Input>
            </div>
            <div v-else>
              {{ receivedProApplyForm.stockRemark }}
            </div>
          </FormItem>
          </Col>
        </Row>
        <Divider />
      </div>
      <!-- 售后寄出填写 -->
      <div v-if="receivedProApplyForm.status !== 1
      && receivedProApplyForm.status !== 2
      && !receivedProApplyForm.skipWarehouse">
        <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">售后寄出填写</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem label="寄出日期:" prop="sendTime">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 3">
              <DatePicker v-model="receivedProApplyForm.sendTime" type="date" placeholder="选择日期" style="width: 200px"
                :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 3)"
                @on-change="(e) => { getApplyTime(e, 'sendTime') }">
              </DatePicker>
            </div>
            <div v-else>
              {{ formatTime(receivedProApplyForm.sendTime) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出物流单号:" prop="sendTrackingNumber">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 3">
              <Input v-model="receivedProApplyForm.sendTrackingNumber" :maxlength="30" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.sendTrackingNumber }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出数量:" prop="sendNumber">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 3">
              <InputNumber v-model="receivedProApplyForm.sendNumber" :min="0" :precision="0"></InputNumber>
            </div>
            <div v-else>
              {{ receivedProApplyForm.sendNumber }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="寄出补充说明:">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 3">
              <Input v-model="receivedProApplyForm.sendRemark" :maxlength="200" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.sendRemark }}
            </div>
          </FormItem>
          </Col>
        </Row>
        <Divider />
      </div>
      <!-- 出库金额跟进与核对 -->
      <div
        v-if="receivedProApplyForm.status !== 1 && receivedProApplyForm.status !== 2 && receivedProApplyForm.status !== 3">
        <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">出库金额跟进与核对</span>
        </div>
        <Row>
          <Col :span="6">
          <FormItem label="金额退/抵方式(核对):" :label-width="150" prop="amountMode">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 4">
              <dyt-select v-model="receivedProApplyForm.amountMode" clearable filterable
                :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 4)">
                <Option v-for="(item, index) in amountModeList" :value="item.value" :key="index"
                  :disabled="isDisabledOption && item.value === 1">{{ item.label }}
                </Option>
              </dyt-select>
            </div>
            <div v-else>
              {{ showText('amountMode', receivedProApplyForm.amountMode) }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="记账月份(核对）:" prop="tallyTime">
            <!-- <DatePicker v-model="receivedProApplyForm.tallyTime" type="month" placeholder="选择日期" style="width: 200px"
              :disabled="!(detailsData.type === 'edit' && receivedProApplyForm.status == 4)"
              @on-change="(e) => { getApplyTime(e, 'tallyTime') }">
            </DatePicker> -->
            <div>{{ receivedProApplyForm.tallyTime }}</div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="实际退/抵金额:" prop="actualReturnAmount" :label-width="150">
            <div v-if="detailsData.type === 'edit' &&
              receivedProApplyForm.status == 4
              " class="demandTableStyle">
              <InputNumber v-model="receivedProApplyForm.actualReturnAmount" :min="0" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.actualReturnAmount }}
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="退/抵付款图片:">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 4">
              <div class="form-pic-item">
                <Poptip trigger="hover" transfer placement="top">
                  <div class="pic-item-view" v-if="receivedProApplyForm.picturePath">
                    <img :src="`./filenode/s${receivedProApplyForm.picturePath}`" />
                    <div class="pic-view-cover">
                      <div class="pic-view-btn">
                        <Icon title="删除" type="ios-trash-outline" @click.native="removeImg()" />
                      </div>
                    </div>
                  </div>
                  <div class="image-preview-content" slot="content">
                    <img style="width:350px" :src="`./filenode/s${receivedProApplyForm.picturePath}`" />
                  </div>
                </Poptip>
                <Upload v-if="!receivedProApplyForm.picturePath" ref="imgUploadRef" name="files" :show-upload-list="false"
                  :multiple="true" accept="image/*" :before-upload="imgFileUploadBefore" :action="uploadFilesUrl"
                  :max-size="10240" class="upload-item">
                  <div class="upload-icon">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                  <Spin v-if="isUploadLoading" fix></Spin>
                </Upload>
              </div>
            </div>
            <div v-else>
              <div class="form-pic-item">
                <div v-if="receivedProApplyForm.picturePath">
                  <div class="pic-item-view">
                    <dyt-previewImg :url="`./filenode/s${receivedProApplyForm.picturePath}`" />
                  </div>
                  <!-- <div slot="content">
                    <img style="width:350px" :src="`./filenode/s${receivedProApplyForm.picturePath}`" />
                  </div> -->
                </div>
              </div>
            </div>
          </FormItem>
          </Col>
          <Col :span="6">
          <FormItem label="退/抵备注:" :label-width="150">
            <div v-if="detailsData.type === 'edit' && receivedProApplyForm.status == 4">
              <Input v-model="receivedProApplyForm.returnRemark" :maxlength="200" />
            </div>
            <div v-else>
              {{ receivedProApplyForm.returnRemark }}
            </div>
          </FormItem>
          </Col>
        </Row>
        <Divider />
      </div>
      <!-- 操作日志 -->
      <div>
        <div style="display: flex" class="mt20 mb10">
          <div style="width: 4px; height: 20px; background: #2c74f6"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">操作日志</span>
          <Checkbox v-model="isShowRemark" class="ml20" style="margin-top:6px" @on-change="isShowOperationRemark">显示备注
          </Checkbox>
        </div>
        <Row>
          <Col :span="14">
          <div class="flexBox">
            <Input v-model="operationRemark" :rows="3" type="textarea" :maxlength="300" show-word-limit />
            <Button type="primary" class="ml20" @click="addRemark">备注</Button>
          </div>
          </Col>
          <Col :span="24" class="mt20">
          <Table border :columns="orderLogColumns" :data="wmsGoodsStockApplyLogList" :loading="loading" max-height="450">
          </Table>
          </Col>
        </Row>
      </div>
      <!--添加商品-->
      <div v-if="isShowAddPro">
        <Modal v-model="isShowAddPro" :width="1100" title="添加商品" :styles="{ top: '50px' }" :mask-closable="false"
          class="addProductModal1 headerBar addProductBar">
          <addProduct :from="'allGoods'" :disabledSlt="false" @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel"></addProduct>
        </Modal>
      </div>
      <Spin v-if="loading" fix></Spin>
      <!-- Excel导入 -->
      <Modal v-model="importExcel" title="导入模板" @on-ok="importExcel = false" class-name="verticalCenterModal"
        @on-cancel="importExcel = false" :styles="{ top: '280px' }" width="400">
        <template v-if="uploadList.length == 0 ||
          (uploadList.length > 0 &&
            uploadList[uploadList.length - 1].status === 'finished')
          ">
          <div style="text-align: center; margin: 20px 0">
            <Upload ref="import" type="drag" :format="['XLS', 'XLSX']" :action="action" name="file" :data="{ isStock: 1 }"
              accept=".xlsx,.xls" :headers="headObj" :on-success="okUpload" :on-error="uploadError"
              :show-upload-list="false" :onFormatError="formatError">
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="60"></Icon>
                <p>导入</p>
              </div>
            </Upload>
          </div>
          <div style="text-align: center">
            <a href="javascript:void(0)" @click="downloadEcxel()">下载Excel文件模板</a>
          </div>
        </template>
        <template v-else>
          <div style="margin: 20px 0">
            <Progress v-if="uploadList[uploadList.length - 1].showProgress"
              :percent="uploadList[uploadList.length - 1].percentage" hide-info></Progress>
          </div>
        </template>
        <div slot="footer"></div>
      </Modal>
      <Modal v-model="returnShow" title="确认退回" width="400">
        <Input v-model="operateReturnReason" placeholder="请输入退回原因" :maxlength="200" type="textarea" :rows="3"
          show-word-limit />
        <div slot="footer">
          <Button @click="returnShow = false">取消</Button>
          <Button type="primary" @click="confirmReturnApply">确定</Button>
        </div>
      </Modal>
    </Form>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import { time_now } from '@/utils/comConfig.js';
export default {
  props: {
    detailsData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  mixins: [Mixin],
  components: { addProduct },
  data() {
    return {
      pageArray: [10, 20, 50, 100],
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      receivedProApplyForm: {
        applyTime: null,
        settlementTypeName: null,
        supplierReceivingInfo: null,
        pickingNo: null,
        pickingReason: null,
        applyRemark: null,
        warehouseId: null,
        supplierId: null,
        applyDetailFilePath: null,
        applyDetailFileName: null,
        stockApplyTotalAmount: null,
        actualStockNumber: null,
        returnTotalAmount: null,
        wmsGoodsStockApplyDetailList: [],
        abnormalArrivalNo: null,
        stockRemark: null,
        sendTime: null,
        sendTrackingNumber: null,
        sendNumber: null,
        sendRemark: null,
        tallyTime: null,
        picturePath: null,
        returnRemark: null,
        actualReturnAmount: undefined,
        wmsGoodsStockApplyLogList: []
      },
      ruleValidate: {
        applyTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        pickingNo: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        pickingReason: [
          { required: true, type: 'number', message: '请选择', trigger: 'change' }
        ],
        sendTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        sendTrackingNumber: [
          { required: true, message: '请输入', trigger: 'change' }
        ],
        sendNumber: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' }
        ],
        tallyTime: [
          { required: true, message: '请选择日期', trigger: 'change' }
        ],
        amountMode: [
          { required: true, type: 'number', message: '请选择', trigger: 'change' }
        ],
        warehouseId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        actualReturnAmount: [
          { required: true, validator: this.validActualReturnAmount, trigger: 'change' }
        ],
        abnormalArrivalNo: [
          { validator: this.checkWhiteSpace, trigger: 'change', message: '输入值不能包含空格' }
        ]
      },
      outboundReasonList: [
        {
          label: '质量问题',
          value: 1
        },
        {
          label: '入库错误',
          value: 2
        },
        {
          label: '采多出库',
          value: 3
        },
        {
          label: '库存报废',
          value: 4
        },
        {
          label: '滞销/清仓处理',
          value: 5
        },
        {
          label: "问题商品退货",
          value: 6,
        },
      ],
      supplierArr: [],
      settlementMethodArr: [],
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      importExcel: false,
      isShowAddPro: false,
      goodsColumn: [
        {
          key: 'goodsInfo',
          align: 'center',
          title: '商品信息',
          minWidth: 250,
          render: (h, params) => {
            //  处理-规格
            let spec = ''
            if (params.row.productGoodsSpecifications && typeof params.row.productGoodsSpecifications == 'object') {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            } else {
              spec = !this.$common.isEmpty(params.row.productGoodsSpecifications)
                ? params.row.productGoodsSpecifications : params.row.goodsAttributes
            }

            return h('div', {
              style: {
                display: 'flex'
              }
            }, [
              h('div', { style: {} }, [
                this.tableImg(h, params, "goodsUrl")
              ]),
              h('div', { class: 'ml20' }, [
                h('div', {}, `SKU：${!this.$common.isEmpty(params.row.skuNo) ? params.row.skuNo : params.row.goodsSku || '-'}`),
                h('div', {}, `名称：${!this.$common.isEmpty(params.row.goodsName) ? params.row.goodsName : params.row.goodsCnDesc || '-'}`),
                h('div', {
                  style: {
                    color: '#7FA37E'
                  }
                }, `${spec || '-'}`)
              ])
            ]);
          }
        },
        {
          key: 'returnNumber',
          title: '预计退货数量',
          align: 'center',
          minWidth: 100,
          slot: 'returnNumber',
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '预计退货数量'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: 'stockReason',
          title: '仓库出库原则',
          minWidth: 200,
          align: 'center',
          slot: 'stockReason'
        },
        {
          key: 'price',
          title: '采购价格',
          align: 'center',
          minWidth: 100,
          slot: 'price',
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '采购价格'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: 'discount',
          title: '折扣方案',
          align: 'center',
          minWidth: 100,
          slot: 'discount',
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '折扣方案'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: 'opeation',
          title: '操作',
          width: 200,
          align: 'center',
          render: (h, params) => {
            let result = (this.detailsData.type === 'edit' && this.receivedProApplyForm.status == 1)
              ? h('div', {
                style: {
                  color: 'red',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach((item, index) => {
                      if (item.goodsId == params.row.goodsId) {
                        this.receivedProApplyForm.wmsGoodsStockApplyDetailList.splice(index, 1);
                      }
                    })
                  }
                }
              }, '删除') : ''
            return result
          }
        }
      ],
      action: api.import_goodsStockApply,
      uploadList: [],
      loading: false,
      createByArr: [],
      amountModeList: [
        { label: '累计月结抵扣', value: 1 },
        { label: '逐单现金退还', value: 2 },
        { label: '由公司承担', value: 3 },
        { label: '其他', value: 4 },
      ],
      isShowRemark: true,
      operationRemark: null,
      orderLogColumns: [
        {
          key: "updatedBy",
          title: "操作人", // 操作人
          width: 100,
          render: (h, params) => {
            let createdName = ''
            this.createByArr.forEach(item => {
              if (item.userId === params.row.createdBy) {
                createdName = item.userName
              }
            })
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
            return h(
              "div",
              {},
              params.row.createdTime
            );
          },
        },
      ],
      returnShow: false,
      operateReturnReason: null,
      wmsGoodsStockApplyLogList: [],
      oldWmsGoodsStockApplyLogList: [] // 做备份
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    businessDept() {
      let businessDeptInfo = {};
      if (this.$common.isEmpty(this.$store.getters.getBusinessDeptList)) return businessDeptInfo;
      this.$store.getters.getBusinessDeptList.forEach(item => {
        businessDeptInfo[item.id] = item;
      })
      return businessDeptInfo[this.receivedProApplyForm.businessDeptId].name;
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
    createByName() {
      let name = ''
      this.createByArr.forEach(item => {
        if (item.userId === this.receivedProApplyForm.createdBy) {
          name = item.userName
        }
      })
      return name
    },
    isDisabledOption() {
      if (['01', '02', '04', '06'].includes(this.receivedProApplyForm.settlementTypeName)) return true
    },
    // 当前表格起始下标
    tableIndex () {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize;
    },
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    }
  },
  watch: {
    'receivedProApplyForm.supplierId': {
      handler(newVal, oldVal) {
        if (newVal && oldVal) {
          this.supplierArr.forEach(item => {
            if (item.supplierId === newVal) {
              let supplierReceivingInfo = ''
              this.receivedProApplyForm.settlementTypeName = item.settlementType
              supplierReceivingInfo = `${item.contactMan ? item.contactMan : ''}  ${item.telephone ? item.telephone : ''}  ${item.rAddress ? item.rAddress : ''}  ${item.rAddressDetail ? item.rAddressDetail : ''} `
              this.$set(item, 'supplierReceivingInfo', supplierReceivingInfo)
              this.receivedProApplyForm.supplierReceivingInfo = this.$common.isEmpty(item.supplierReceivingInfo.trim()) ? '--' : item.supplierReceivingInfo
            }
          })
        }
      }
    },
    'receivedProApplyForm.wmsGoodsStockApplyDetailList': {
      handler(newVal, oldVal) {
        let stockApplyTotalAmount = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce((pre, next) => {
          return pre + (next.price * next.returnNumber)
        }, 0)
        let actualStockNumber = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce((pre, next) => {
          return pre + next.returnNumber
        }, 0)
        let returnTotalAmount = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce((pre, next) => {
          return pre + ((next.price * next.returnNumber * next.discount))
        }, 0)
        this.receivedProApplyForm.stockApplyTotalAmount = parseFloat(stockApplyTotalAmount.toFixed(2))
        this.receivedProApplyForm.actualStockNumber = parseFloat(actualStockNumber.toFixed(2))
        this.receivedProApplyForm.returnTotalAmount = parseFloat(returnTotalAmount.toFixed(2))
      },
      deep: true,
      immediate: true
    },
    detailsData: {
      handler(newVal, oldVal) {
        if (newVal) {
          let receivedProApplyForm = newVal.receivedProApplyForm || {};
          // // 待核对 记账月份更为自动使用创建月份，并且不可进行修改
          // if ([4].includes(receivedProApplyForm.status)) {
          //   receivedProApplyForm.tallyTime = this.$common.dayjs().format('YYYY-MM');
          // }
          this.receivedProApplyForm = this.$common.copy(receivedProApplyForm);
          this.createByArr = this.$common.copy(newVal.createByArr);
          this.supplierArr = this.$common.copy(newVal.supplierArr);
          this.warehouseList = this.$common.copy(newVal.warehouseList);
          this.settlementMethodArr = this.$common.copy(newVal.settlementMethodArr);
          this.wmsGoodsStockApplyLogList = this.$common.copy(receivedProApplyForm.wmsGoodsStockApplyLogList);
          this.oldWmsGoodsStockApplyLogList = this.$common.copy(receivedProApplyForm.wmsGoodsStockApplyLogList);
          this.searchTable();
        }
      },
      deep: true,
      immediate: true
    },
  },
  created() {
  },
  methods: {
    time_now,
    // 上传excel
    fileUploadBefore(file) {
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        this.$Message.error('文件格式不对，请上传xlsx、xls格式的文件');
        return false;
      }
      // this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.receivedProApplyForm.applyDetailFilePath = res.data.datas[0]
        this.receivedProApplyForm.applyDetailFileName = file.name
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 对excel文件进行下载、预览、删除操作
    getDetailsExcel(type) {
      if (type == 'download') {
        window.open('./filenode/s' + this.receivedProApplyForm.applyDetailFilePath)
      } else if (type == 'delete') {
        this.receivedProApplyForm.applyDetailFilePath = null
        this.receivedProApplyForm.applyDetailFileName = null
      } else {
        let url = 'filenode/s' + this.receivedProApplyForm.applyDetailFilePath
        let localUrl = window.location.href
        localUrl = localUrl.split('wms.html#')[0]
        // 在线预览excel
        window.open(`https://view.officeapps.live.com/op/view.aspx?src=${localUrl += url}`)
      }
    },
    // 选择成功回调
    addProductSuccess(data) {
      let goodsData = []
      data.forEach((n, i) => {
        let isExist = false;
        this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach((m, j) => {
          if (n.productGoodsId == m.goodsId) {
            // 如果该商品存在，数量+1
            this.receivedProApplyForm.wmsGoodsStockApplyDetailList[j].returnNumber += 1;
            isExist = true;
          }
        });
        if (!isExist) {
          // 如果该商品不存在，新增一条数据
          goodsData.push({
            returnNumber: null,
            stockReason: null,
            price: null,
            discount: null,
            goodsCnDesc: n.goodsCnDesc,
            goodsId: n.productGoodsId,
            goodsAttributes: n.goodsAttributes,
            goodsSku: n.goodsSku,
            goodsUrl: n.goodsUrl
          })
        }
      });
      if (goodsData.length) {
        goodsData.forEach(item => {
          this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(item)
        })
      }
      this.searchTable();
      this.isShowAddPro = false;
    },
    // 取消选择回调
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addGoods() {
      this.isShowAddPro = true
    },
    // 下载导入的模板
    downloadEcxel() {
      const path =
        this.$store.state.imgUrlPrefix +
        "/wms-service/template/stockGoodsTemplate.xlsx";
      window.location.href = path;
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
    searchTable () {
      this.$nextTick(() => {
        const pageSize = this.pagination.pageSize;
        const pageNum = this.pagination.pageNum
        this.tableData = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.slice((pageNum - 1) * pageSize, pageNum * pageSize);
        this.pagination.total = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.length;
      });
    },
    // 文件上传成功的回调
    okUpload(data, file, fileList) {
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          if (this.receivedProApplyForm.wmsGoodsStockApplyDetailList.length > 0) {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let isExist = false;
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach((m, j) => {
                if (n.productGoodsId == m.goodsId || n.goodsId == m.goodsId) {
                  // 如果该商品存在，数量累加
                  this.receivedProApplyForm.wmsGoodsStockApplyDetailList[j].returnNumber +=
                    n.backupQuantity;
                  isExist = true;
                }
              });
              if (!isExist) {
                let i = n.backupQuantity > 0 ? n.backupQuantity : 1;
                this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(
                  Object.assign(n, { returnNumber: i })
                );
              }
            });
          } else {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let j = n.backupQuantity > 0 ? n.backupQuantity : 1;
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(
                Object.assign(n, { returnNumber: j })
              );
            });
          }
          this.searchTable();
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
      } else if (data.code === 221108) {
        this.$Message.error('文件导入失败')
        this.importExcel = false;
      } else {
        this.$Message.error(data.message)
        this.importExcel = false;
      }
    }, // 上传失败回调
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
    // // 提交或者暂存
    // submitOrSave(type) {
    //   let obj = this.$common.copy(this.receivedProApplyForm)
    //   let authInfo = this.$store.state.authUserInfo
    //   obj.status = type === 'save' ? 1 : 2
    //   this.supplierArr.forEach(item => {
    //     if(item.supplierId === obj.supplierId) {
    //       obj.supplierName = item.supplierName
    //     }
    //   })
    //   obj.businessDeptId = authInfo.securityUser.businessDeptId
    //   this.loading = true
    //   this.axios.post(api.add_stockApply, obj).then((res) => {
    //     if(res.data.code === 0) {
    //       this.$Message.success('操作成功')
    //       this.$emit('goBack', true)
    //     }
    //   }).finally(() => {
    //     this.loading = false
    //   })
    // },
    // 选中时间
    getApplyTime(val, type) {
      this.receivedProApplyForm[type] = val
    },
    // 校验折扣信息
    validDiscount(rule, value, callback) {
      this.$nextTick(() => {
        if (value > 1) {
          this.$Message.error('不能大于1')
          return callback(new Error('不得大于1'))
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          this.$Message.error('小数位数不能超过两位')
          return callback(new Error('小数位数不得超过两位'));
        }
        // 校验通过
        callback();
      });
    },
    // 校验采购价格
    validPrice(rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(value)) {
          this.$Message.error('请填写采购价格')
          return callback(new Error('请填写采购价格'))
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          this.$Message.error('小数位数不能超过两位')
          return callback(new Error('小数位数不得超过两位'));
        }
        // 校验通过
        callback();
      });
    },
    // 检验空格
    checkWhiteSpace(rule, value, callback) {
      if (/\s/.test(value)) {
        callback(new Error('输入值不能包含空格'));
      } else {
        callback();
      }
    },
    // 导出商品详细内容
    // exportGoodsDetails() {
    //   if(this.receivedProApplyForm.wmsGoodsStockApplyDetailList.length == 0) return this.$Message.error('无数据不允许导出')
    //   this.loading = true
    //   this.axios.post(`${api.export_goodsStockGoodsExport}?handleNo=${this.receivedProApplyForm.handleNo}`,{},{responseType: "blob"}).then(res => {
    //     console.log(res);
    //     if (!res || !res.resData) {
    //       return this.$Message.error('下载失败')
    //     }
    //     this.$common.downloadFile(res.resData, { name: res.filename }).finally(() => {
    //       this.loading = false
    //     })
    //   }).finally(() => {
    //     this.loading = false
    //   })

    // },
    //  上传付款图片
    imgFileUploadBefore(file) {
      if (!file.type.includes('image/')) {
        this.$Message.error('文件格式不对，请上传图片格式的文件');
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.receivedProApplyForm.picturePath = res.data.datas[0]
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    removeImg() {
      this.receivedProApplyForm.picturePath = null
    },
    editDeatils(type) {
      // 由于时间赋值导致原先赋值的时间会被强制转换格式，因此需要转化一下时间
      this.receivedProApplyForm.applyTime = this.$common.isEmpty(this.receivedProApplyForm.applyTime)
        ? this.receivedProApplyForm.applyTime : this.formatTime(this.receivedProApplyForm.applyTime)
      // this.receivedProApplyForm.tallyTime = this.$common.isEmpty(this.receivedProApplyForm.tallyTime)
      //   ? this.receivedProApplyForm.tallyTime : this.formatTime(this.receivedProApplyForm.tallyTime, 'month')
      this.receivedProApplyForm.sendTime = this.$common.isEmpty(this.receivedProApplyForm.sendTime)
        ? this.receivedProApplyForm.sendTime : this.formatTime(this.receivedProApplyForm.sendTime)
      this.$refs.receivedProApplyForm.validate((valid) => {
        if (valid) {
          let obj = this.$common.copy(this.receivedProApplyForm)
          this.supplierArr.forEach(item => {
            if (item.supplierId == this.receivedProApplyForm.supplierId) {
              obj.supplierName = item.supplierName
            }
          })
          this.loading = true
          obj.status = type === 'submit' ? obj.status + 1 : obj.status
          if (type === 'save') {
            obj.isSave = 1
          }
          this.axios.post(api.update_stockApply, obj).then((res) => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功')
              this.$emit('goBack', true)
            }
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    // 修改时间
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
    // 退回申请
    returnApply() {
      this.returnShow = true
    },
    confirmReturnApply() {
      let obj = {
        status: this.receivedProApplyForm.status - 1,
        operateReturnReason: this.operateReturnReason,
        handleNo: this.receivedProApplyForm.handleNo
      }
      if (this.$common.isEmpty(this.operateReturnReason)) return this.$Message.error('请输入退回原因')
      this.loading = true
      this.axios.post(api.return_stockApply, obj).then(res => {
        if (res.data.code == 0) {
          this.$Message.success('操作成功')
          this.$emit('goBack', true)
        }
      }).finally(() => {
        this.loading = false
        this.returnShow = false
      })
    },
    // 添加备注
    addRemark() {
      if (this.$common.isEmpty(this.operationRemark) || this.$common.isEmpty(this.operationRemark.trim())) return this.$Message.error('备注为空无法添加')
      this.loading = true
      let obj = {
        operateReturnReason: this.operationRemark,
        handleNo: this.receivedProApplyForm.handleNo
      }
      this.axios.post(api.add_remark, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('添加成功')
          let remark = {
            logContentDesc: `备注: ${this.operationRemark}`,
            createdBy: this.userInfo.userId,
            createdTime: this.time_now(),
            logTypeDesc: '07'
          }
          if (this.isShowRemark) { this.wmsGoodsStockApplyLogList.unshift(remark) }
          this.oldWmsGoodsStockApplyLogList.unshift(remark)
          this.operationRemark = null
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 是否显示备注
    isShowOperationRemark(val) {
      if (val) {
        this.wmsGoodsStockApplyLogList = this.$common.copy(this.oldWmsGoodsStockApplyLogList)
      } else {
        this.wmsGoodsStockApplyLogList = this.oldWmsGoodsStockApplyLogList.filter(item => item.logTypeDesc !== '07')
      }
    },
    // 校验
    validActualReturnAmount(rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(value)) {
          this.$Message.error("请填写实际退/抵金额");
          return callback(new Error("请填写实际退/抵金额"));
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          this.$Message.error("小数位数不能超过两位");
          return callback(new Error("小数位数不得超过两位"));
        }
        // 校验通过
        callback();
      });
    },
    // 显示文本
    showText(type, val) {
      let result = null
      // 仓库
      if (type == 'warehouseId' && val) {
        let list = this.$common.arrayToObj(this.warehouseList, "warehouseId");
        result = list[val] ? list[val].warehouseName : ''
      }
      // 结算方式
      if (type == 'settlementTypeName' && val) {
        let list = this.$common.arrayToObj(this.settlementMethodArr, "dataValue");
        result = list[val] ? list[val].dataDesc : ''
      }
      // 供应商id
      if (type == 'supplierId' && val) {
        let list = this.$common.arrayToObj(this.supplierArr, "supplierId");
        result = list[val] ? list[val].supplierName : ''
      }
      // 出库原因
      if (type == 'pickingReason' && val) {
        let list = this.$common.arrayToObj(this.outboundReasonList, "value");
        result = list[val] ? list[val].label : ''
      }
      // 金额退/抵方式(核对)
      if (type == 'amountMode' && val) {
        let list = this.$common.arrayToObj(this.amountModeList, "value");
        result = list[val] ? list[val].label : ''
      }
      return result
    }
  }
}
</script>
<style lang="less">
.demandTableStyle {
  .ivu-input-number-handler-wrap {
    display: none;
  }

  .ivu-form-item-error-tip {
    display: none;
  }
}

.form-pic-item {
  display: flex;
  justify-content: flex-start;
  flex-flow: wrap;

  .pic-item-view {
    position: relative;
    margin-right: 10px;
    width: 46px;
    height: 46px;

    >img {
      height: 100%;
      width: 100%;
    }

    .pic-view-cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      &:hover {
        background: rgba(0, 0, 0, 0.5);

        .pic-view-btn {
          display: block;
        }
      }

      .pic-view-btn {
        display: none;
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate(0, -50%);
        font-size: 20px;
        color: #fff;
        text-align: center;

        >i {
          cursor: pointer;
        }
      }
    }
  }

  .upload-item {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 46px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }

  .upload-icon {
    width: 70px;
    height: 70px;

    i> {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>