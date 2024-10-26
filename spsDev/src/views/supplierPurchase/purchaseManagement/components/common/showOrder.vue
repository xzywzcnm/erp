<template>
  <div>
    <div class="submitTopBtnWrapper">
      <Button type="primary" class="mr10" @click="saveAction('order')" :loading="saveLoading"
        v-if="showType == '3' || showType == '2'">保存
      </Button>

      <template v-if="showType == '4'">
        <Button type="primary" @click="saveAction('order', '4')" :loading="saveLoading" style="margin-right: 10px">向供应商下单
        </Button>
        <Button type="primary" @click="model1 = true" style="margin-right: 10px">取消采购
        </Button>
      </template>
      <Button type="default" class="mr10" @click="cancelAction">取消</Button>
    </div>
    <Form ref="order" :model="order" :label-width="120" :rules="ruleValidate">
      <!-- 向供应商下单 -->
      <!-- <div v-if="showType != 2"> -->
      <div v-if="showType == 4">
        <div>
          <div v-if="showType == 4" class="titleFont" style="margin: 6px 0 30px -8px">
            采购单号：{{ order.purchaseNumber }}
          </div>
          <div class="titleLeft" style="font-size: 16px; font-weight: bold">
            基本信息
          </div>
          <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
          <div class="addPurOrdForm">
            <Row class="normalTop">
              <Col :span="6">
              <FormItem label="采购员：" prop="purchaserId">
                <dyt-select v-model="order.purchaserId" filterable :disabled="orderType == '3' ||
                  orderType == '4' ||
                  showType == 1 ||
                  showType == 4
                  " placeholder="请选择">
                  <Option v-for="(item, index) in purchaserArrT" :value="item.id" :key="index">{{ item.name }}</Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="备货仓库：" prop="purchaseWarehouseId">
                <dyt-select v-model="order.purchaseWarehouseId" :disabled="showType !== '3' && editType !== 'copy'">
                  <Option v-for="(item, index) in warehouseArr" :value="item.warehouseId" :key="index">{{
                    item.warehouseName }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="供应商：" prop="supplierId">
                <dyt-select v-model="order.supplierId" filterable clearable :disabled="orderType == '3' ||
                  orderType == '4' ||
                  showType == 1 ||
                  showType == 4
                  " @on-change="getSettlementType" placeholder="请选择">
                  <Option v-for="(item, index) in supplierArr" :disabled="item.purchaseWarehouseStatus === '1'"
                    :value="item.supplierId" :key="index">{{ item.supplierName }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="备货类型：" prop="readyType">
                <dyt-select v-model="order.readyType" :disabled="showType !== '3' && editType !== 'copy'"
                  placeholder="请选择">
                  <Option v-for="(item, index) in readyTypeList" :value="item.value" :key="index">{{ item.label }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="6">
              <FormItem label="币种：" prop="currency">
                <dyt-select v-model="order.currency" filterable clearable :disabled="orderType == '3' ||
                  orderType == '4' ||
                  showType == 1 ||
                  showType == 4
                  " @on-change="currencyChangeFn" placeholder="请选择">
                  <Option v-for="(item, index) in currencyArr" :value="item.dataDesc" :key="`${index}${item.dataValue}`">
                    {{ item.dataDesc }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="运费：">
                <InputNumber :max="999999" :min="0" :step="0.01" v-model="order.freightCharge" :disabled="orderType == '3' ||
                  orderType == '4' ||
                  showType == 1 ||
                  showType == 4
                  " style="width: 262.5px">
                </InputNumber>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="1688账号类型：">
                <dyt-select v-model="order.alibabaAccountType" filterable clearable :disabled="orderType == '3' ||
                  orderType == '4' ||
                  showType == 1 ||
                  showType == 4
                  " placeholder="请选择">
                  <Option v-for="(item, index) in alibabaList" :value="item.label" :key="index">{{ item.label }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="外部流水号：">
                <Input v-if="order.type == 2" v-model="order.aliPlatformOrderNo" :maxlength="50"
                  :disabled="showType == 1 || showType == 4" />
                <Input v-else v-model="order.externalSerialNo" :maxlength="50"
                  :disabled="showType == 1 || showType == 4" />
              </FormItem>
              </Col>
            </Row>
            <Row>
              <!-- <Col :span="6" v-if="orderType !== '3' || editType === 'placeOrder'">
              <FormItem label="采购备注">
                <Input v-model="order.remark" type="textarea" :rows="3" :disabled="showType == 1 || showType == 4"></Input>
              </FormItem>
              </Col> -->
              <Col :span="6">
              <FormItem label="结算方式：" prop="settlementType">
                {{ order.settleTypeName }}
              </FormItem>
              <FormItem label="总商品金额：">
                <span>{{ proTotalPrice.toFixed(2) || 0 }}</span>
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="供应商类型：">
                {{ order.supplierTypeName }}
              </FormItem>
              <FormItem label="优惠：" prop="discountAmount">
                {{ `${$common.isEmpty(order.discountAmount) ? '' : order.discountAmount.toFixed(2)}` }}
              </FormItem>
              </Col>
              <Col :span="6">
              <FormItem label="总重量(g)：" prop="weight">
                <!-- <span>{{ allWeight || 0}}</span> -->
                <span>{{ order.weightTotal || 0 }}</span>
              </FormItem>
              <FormItem label="应付总额：" prop="totalAmount">
                <span>{{ Number(proTotalPrice + order.freightCharge - order.discountAmount).toFixed(2) || 0 }}</span>
              </FormItem>
              </Col>
            </Row>
          </div>
        </div>

        <!-- 编辑备注 -->
        <add-remark :isVisible.sync="isEditRemark" :showRemarkList="showRemarkList" :purchaseId="order.purchaseId">
        </add-remark>

        <div v-if="order.status >= 3">
          <div class="titleLeft" style="font-size: 16px; font-weight: bold; margin-top: 60px">
            供应商下单信息
          </div>
          <div style="margin-left: 30px">
            <Row class="normalTop">
              <Col span="6">
              <FormItem :label-width="120" label="商家系统开通状态：">
                <span>{{
                  order.businessStatus == 1 ? "已开通" : "未开通"
                }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem :label-width="120" label="备货类型：">
                <span v-if="order.readyType">{{
                  readyTypeList[order.readyType].label
                }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem :label-width="120" label="下单时间：">
                <!-- <span>{{ getDataToLocalTime(order.orderTime, "fulltime", true) }}</span> -->
                <span>{{ getDataToLocalTime(order.createdTime, "fulltime", true) }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row style="margin-top: -10px">
              <Col span="6">
              <FormItem :label-width="120" label="要求收货时间：" prop="requireDespatchTime">
                <!-- :rules="ruleValidate.requireDespatchTime" -->
                <span>下单时间+货期</span>
                <!-- <span v-if="order.readyType != 0 || order.readyType == null">下单时间+货期</span> -->
                <!-- <DatePicker v-else type="datetime" transfer format="yyyy-MM-dd HH:mm" placeholder="请选择"
                  :value="order.requireDespatchTime" @on-change="pickDataChange" :options="options"
                  :disabled="showType == 1">
                </DatePicker> -->
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem :label-width="120" label="发货要求：">
                <Input v-model="order.requireDespatch" maxlength="500" show-word-limit type="textarea" placeholder="请输入"
                  :disabled="order.status > 3" />
              </FormItem>
              </Col>
            </Row>
          </div>
        </div>

        <div>
          <div class="titleLeft" style="margin-top: 60px; font-size: 16px; font-weight: bold">
            商品信息
          </div>
          <Row class="normalTop">
            <Col :span="8">
            <Button type="primary" @click="addProFn" class="iconbuttons" :disabled="orderType == '3' ||
              orderType == '4' ||
              showType == 1 ||
              showType == 4
              " :loading="addLoading">
              添加商品
            </Button>
            <Button type="primary" @click="batchDelFn" class="iconbuttons" style="margin-left: 10px" :disabled="orderType == '3' ||
              orderType == '4' ||
              showType == 1 ||
              showType == 4
              ">
              批量删除
            </Button>
            </Col>
            <Col :span="3" :offset="4" style="line-height: 32px">
            <Checkbox v-if="showType != 4" v-model="order.updateQuoteFlag" :disabled="orderType == '3' || orderType == '4' || showType == 1
              ">是否更新最新报价
            </Checkbox>
            </Col>
            <Col :span="4" :offset="1" style="line-height: 32px">
            <Checkbox v-if="showType != 4" v-model="order.updateSupplierFlag" :disabled="orderType == '3' || orderType == '4' || showType == 1
              ">是否下单供应商设置为首选供应
            </Checkbox>
            </Col>
          </Row>
          <div class="sameStyleSearch normalTop">
            <Table highlight-row max-height="500" :columns="orderColumn" :data="proList" :border="true"
              @on-selection-change="getSelectValue" />
          </div>
          <div class="table-page clear">
            <div class="table-page-right">
              <Page :total="proPage.total" @on-change="proChangePage" show-total :page-size="proPage.pageSize"
                show-elevator :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize"
                placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>

      <!-- 下单后修改（原编辑） -->
      <div v-else>
        <div class="showOrderModify">
          <div class="titleFont" style="margin: 6px 0 30px -8px">
            采购单号：{{ order.purchaseNumber }}
          </div>
          <div class="titleLeft basic-title">
            基本信息
          </div>
          <div class="basic-information">
            <FormItem label="采购员：">
              {{ showName(order.purchaserId) }}
            </FormItem>
            <FormItem label="备货仓库：">
              {{ order.backupWarehouseName }}
            </FormItem>
            <FormItem label="供应商：">
              {{ order.supplierName }}
            </FormItem>
            <FormItem label="备货类型：">
              <span v-if="order.readyType == 0">{{ "急采" }}</span>
              <span v-if="order.readyType == 1">{{ "普通备货" }}</span>
              <span v-if="order.readyType == 2">{{ "海外仓备货" }}</span>
              <span v-if="order.readyType == 3">{{ "FBA备货" }}</span>
              <span v-if="order.readyType == 4">{{ "全托管备货" }}</span>
              <span v-if="order.readyType == 5">{{ "直发备货" }}</span>
            </FormItem>
            <FormItem label="结算方式：">
              {{ order.settleTypeName }}
            </FormItem>
            <FormItem label="下单商品金额：">
              {{ proTotalPrice.toFixed(2) }}
            </FormItem>
            <FormItem label="超发商品金额：">
              <span>{{ order.sumOvershootPrice || 0 }}</span>
            </FormItem>
            <FormItem label="运费：" class="not-padding-item">
              <InputNumber :max="999999" :min="0" :step="0.01" v-model="order.freightCharge"
                :disabled="order.payStatus == 2 || order.payStatus == 4 || order.payStatus == 5"
                style="width: 100%; max-width: 150px;">
              </InputNumber>
            </FormItem>
            <FormItem label="优惠：">
              {{ `${$common.isEmpty(order.discountAmount) ? '' : order.discountAmount.toFixed(2)}` }}
            </FormItem>
            <FormItem label="币种：">
              {{ order.currency }}
            </FormItem>
            <FormItem label="采购类型：">
              {{ order.supplierTypeName }}
            </FormItem>
            <FormItem label="订单金额：" class="not-padding-item">
              <InputNumber :max="999999" :min="0" :step="0.01" :value="orderTotalSum"
                :disabled="order.payStatus == 2 || order.payStatus == 4 || order.payStatus == 5" style="width: 100%"
                @on-change="orderNumChange" />
            </FormItem>
            <FormItem label="已付金额：">
              {{ order.paidAmount }}
            </FormItem>
            <FormItem label="收库商品金额：">
              {{ order.shelvesTotalprice }}
            </FormItem>
            <FormItem label="收库金额：">
              {{ order.receiptAmount }}
            </FormItem>
            <FormItem label="未收库商品金额：">
              {{ order.notReceiptAmount }}
            </FormItem>
            <FormItem label="下单数量：">
              {{ order.salesNumberTotal }}
            </FormItem>
            <FormItem label="超发数量：">
              {{ order.sumOvershootNumber || 0 }}
            </FormItem>
            <FormItem label="取消数量：">
              {{ order.surplusQuantityTotal }}
            </FormItem>
            <FormItem label="少货数量：">
              <span :class="order.lessGoodsQuantityTotal > 0 ? 'red' : ''">{{ order.lessGoodsQuantityTotal }}</span>
            </FormItem>
            <FormItem label="未发货数量：">
              {{ order.notDespatchNumberTotal }}
            </FormItem>
            <FormItem label="已发货数量：">
              {{ order.despatchNumberTotal }}
            </FormItem>
            <FormItem label="收货正品数量：">
              {{ order.shelveNumberTotal }}
            </FormItem>
            <FormItem label="收货次品数量：">
              {{ order.substandardNumberTotal }}
            </FormItem>
            <FormItem label="未收货数量：">
              {{ order.notReceivedNumberTotal }}
            </FormItem>
            <FormItem label="质检类型：">
              <span v-if="order.checkType == 0">免检</span>
              <span v-if="order.checkType == 1">抽检</span>
              <span v-if="order.checkType == 2">全检</span>
            </FormItem>
            <FormItem label="质检总比例：">
              {{ order.checkRateSum }}%
            </FormItem>
            <FormItem label="所属事业部：">
              {{ order.businessDeptName }}
            </FormItem>
            <FormItem label="1688账号类型：" class="not-padding-item">
              <dyt-select v-model="order.alibabaAccountType" filterable clearable placeholder="请选择">
                <Option v-for="(item, index) in alibabaList" :value="item.label" :key="index">{{ item.label }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="外部流水号：" class="not-padding-item">
              <Input v-if="order.type == 2" v-model="order.aliPlatformOrderNo" :maxlength="50" style="width: 100%" />
              <Input v-else v-model="order.externalSerialNo" :maxlength="50" style="width: 100%" />
            </FormItem>
            <FormItem label="总重量(g)：">
              {{ order.weightTotal || 0 }}
            </FormItem>
            <FormItem label="下单状态：">
              <span v-if="order.status">{{ examineStatusList[order.status - 1].label }}</span>
            </FormItem>
            <FormItem label="下单时间：">
              <span>{{ getDataToLocalTime(order.orderTime, "fulltime", true) }}</span>
            </FormItem>
            <FormItem label="发货要求：">
              <div class="remarkOver" :title="order.requireDespatch">
                {{ order.requireDespatch }}
              </div>
            </FormItem>
          </div>
        </div>

        <!-- 编辑备注 -->
        <add-remark :isVisible.sync="isEditRemark" :showRemarkList="showRemarkList" :purchaseId="order.purchaseId">
        </add-remark>

        <div>
          <div class="formSearch ml10" style="padding: 0; margin-top: 40px">
            <div class="paraTitle mb10 titleLeft">采购定制</div>
            <div class="basic-information">
              <FormItem label="允许超发：">
                {{ overshootState ? '是' : '否' }}
              </FormItem>
              <FormItem label="允许超发状态：" v-if="overshootState">
                {{ overshootText.text }}
              </FormItem>
              <FormItem label="打印商品标签：">
                {{ `${isThirdPartyTag ? '第三方标签' : 'LAPA标签'}` }}
              </FormItem>
              <FormItem label="第三方商品标签：" v-if="isThirdPartyTag">
                {{ thirdPartyTagName }}
              </FormItem>
            </div>
            <div>
              <FormItem label="来货特项：">
                <template v-if="order.comingSpecial">
                  <span v-for="(item, index) in order.comingSpecial.split(',')" :key="index">
                    <span>
                      {{ index > 0 ? ',' : '' }}
                      {{ productTagList[item] ? productTagList[item].comingSpecial : item }}
                    </span>
                  </span>
                </template>
              </FormItem>
            </div>
          </div>

          <div class="titleLeft" style="margin: 40px 0 0 0; font-size: 16px; font-weight: bold">
            商品信息
          </div>
          <div class="product-info-head">
            <FormItem label="SKU收货状态:" :label-width="100">
              <RadioGroup v-model="skuStatus" type="button" size="small" @on-change="filterSku" button-style="solid">
                <Radio :label="item.value" v-for="(item, index) in statusList" :key="index">{{ item.label }}</Radio>
              </RadioGroup>
            </FormItem>
          </div>

          <div class="sameStyleSearch normalTop">
            <Table highlight-row max-height="500" :columns="columns" :data="orderData.detailsResultList" :border="true">
              <template slot-scope="{ row }" slot="basic">
                <basicDataCom :dataRow="row">
                  <span>{{ row.purchaseNumber || "-" }}</span>
                </basicDataCom>
                <div></div>
              </template>
              <template slot-scope="{ row }" slot="weight">
                <div>{{ row.weight }}</div>
              </template>
              <template slot-scope="{ row }" slot="stock">
                <div>可用：{{ row.availableNumber }}</div>
                <div>未发：{{ row.onWayNoDespatchNumber }}</div>
                <div>在途：{{ row.onWayDespatchNumber }}</div>
              </template>
              <!-- <template slot-scope="{ row }" slot="stock">
                <div>{{row.stock}}</div>
              </template> -->
              <template slot-scope="{ row }" slot="price">
                <div>原价：{{ row.currentCost }}</div>
                <div>单价：{{ row.unitPrice }}</div>
              </template>
              <template slot-scope="{ row }" slot="requireDespatchTime">
                <div style="width: 70px">
                  {{
                    intercepTime(row.queryOrderInfoListVO.requireDespatchTime)
                  }}
                </div>
              </template>
              <!-- <template slot-scope="{ row }" slot="salesTime">
                <span>{{getDataToLocalTime(row.salesTime, 'fulltime',true)}}</span>
              </template> -->
              <template slot-scope="{ row }" slot="logistic">
                <div>
                  发货单号：
                  <!-- <span :class="row.supplierDespatchId ? 'clickGesture' : ''">{{row.supplierDespatchId || '-'}}</span> -->
                  <span class="clickGesture" @click="showDeliverOrderDia(row)">{{
                    row.queryOrderInfoListVO.supplierDespatchId }}</span>
                </div>
                <div>
                  发货时间：
                  {{
                    getDataToLocalTime(
                      row.queryOrderInfoListVO.despatchTime,
                      "fulltime",
                      true
                    ) || "-"
                  }}
                </div>
                <div>
                  完成时间：
                  {{
                    getDataToLocalTime(
                      row.queryOrderInfoListVO.finishTime,
                      "fulltime",
                      true
                    ) || "-"
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="threeNum">
                <div>下单：{{ row.replenishQuantity }}</div>
                <div v-if="showType == 2">超发：{{ row.overshootNumber || 0 }}</div>
                <div>取消：{{ row.queryOrderInfoListVO.surplusQuantity }}</div>
                <div :class="row.queryOrderInfoListVO.lessGoodsQuantity > 0 ? 'red' : ''
                  ">
                  少货：{{ row.queryOrderInfoListVO.lessGoodsQuantity }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="deliver">
                <div>已发：{{ row.queryOrderInfoListVO.despatchNumber }}</div>
                <div>
                  未发：{{ row.queryOrderInfoListVO.notDespatchNumber }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="receive">
                <div>正品：{{ row.queryOrderInfoListVO.shelveNumber }}</div>
                <div>
                  次品：{{ row.queryOrderInfoListVO.substandardNumber }}
                </div>
                <div>
                  未收：{{ row.queryOrderInfoListVO.notReceivedNumber }}
                </div>
              </template>
              <!-- 水洗唛标准 -->
              <template slot-scope="{ row }" slot="washedLabel">
                <div>
                  <div style="display:inline-block;">成份：</div>
                  <div style="display:inline-block; width:calc(100% - 40px);">
                    {{ row.washedLabel }}
                  </div>
                </div>
                <div>
                  <div style="display:inline-block;vertical-align: top;padding-top: 15px;">标识：</div>
                  <div style="display:inline-block; width:calc(100% - 40px);vertical-align: top;"
                    v-if="!$common.isEmpty(row.washedLabelTag)">
                    <template v-for="(wash, wIndex) in (row.washedLabelTag.split(','))">
                      <img v-if="!$common.isEmpty(checkWashedData[wash]) && !$common.isEmpty(checkWashedData[wash].image)"
                        :key="`wash-${wIndex}`" :src="checkWashedData[wash].image" width="50"
                        :title="checkWashedData[wash].label" />
                    </template>
                  </div>
                </div>
              </template>
              <!-- 外包装要求 -->
              <template slot-scope="{ row }" slot="outPackRequire">
                <div style="white-space: pre-wrap; word-break: break-all;">{{ row.outerPackageRequirement }}</div>
              </template>
              <template slot-scope="{ row }" slot="remark">
                <div class="remarkOver margin-10-0" :title="row.purchaserRemark || '-'">
                  需：{{ row.purchaserRemark || "-" }}
                </div>
                <div class="remarkOver margin-10-0" :title="row.supplierRemark || '-'">
                  供：{{ row.supplierRemark || "-" }}
                </div>
              </template>
            </Table>
          </div>
          <!-- <div class="table-page clear">
            <div class="table-page-right">
              <Page :total="proPage.total" @on-change="proChangePage" show-total :page-size="proPage.pageSize" show-elevator :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div> -->
        </div>
      </div>
    </Form>

    <Modal v-model="model1" title="操作提示" width="600px" class="addPurOrdMod">
      <div style="margin: 20px 0 0 20px">
        <Icon type="md-alert" />
        <span style="margin-left: 20px">确认是否要取消采购单：</span>
        <span class="textOrange">{{ order.purchaseNumber }}</span>
        <div>
          <Button class="btnWarningTips" style="margin: 20px 40px">提示：已下单的采购单，所有SKU都是已取消状态，才允许作废</Button>
        </div>
      </div>

      <div slot="footer">
        <Button type="text" @click="model1 = false">取消</Button>
        <Button type="primary" @click="cancelPurchase">确定</Button>
      </div>
    </Modal>

    <!-- 发货单详情 -->
    <send-orderdetail :dialogObj="dialogOrderdetail" :isVisible.sync="isVisible"></send-orderdetail>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import orderMixin from "@/components/mixin/order_mixin";
import { getNewData, intercepTime, time_now } from "@/utils/comfun.js";
import {
  PurDetailList,
  alibabaList,
  examineStatusList,
  checkWashedData
} from "../../supplyOrder/configFile";
import basicDataCom from "../../supplyOrder/basicDataCom.vue";
import sendOrderdetail from "@/views/supplierPurchase/purchaseManagement/supplyOrdersend/sendOrderdetail";
import addRemark from "@/views/supplierPurchase/purchaseManagement/supplyOrder/addRemark";

export default {
  // editType  编辑类型  copy
  components: { basicDataCom, sendOrderdetail, addRemark },
  props: [
    "showType",
    "orderType",
    "orderData",
    "purchaserArrT",
    "editType",
    "purchaseOrderIds",
  ],
  mixins: [Mixin, orderMixin],
  data() {
    var self = this;
    return {
      model1: false,
      modal2: false,
      isVisible: false,
      dialogOrderdetail: {
        modelVisible: false,
        data: {},
        source: null,
      },
      checkWashedData: checkWashedData,
      overseaTagList:{},
      modal2Edit: "look",
      modal2Index: 0,
      columns: PurDetailList,
      data2: [],
      data3: [],
      searchSku: "", // 搜索sku
      allWeight: 0,
      showRemark: false,
      addLoading: false,
      sourceType: false, // 是否勾选1688商品
      saveLoading: false,
      pageLoading: false,
      searchRadio: "",
      selectionArr: [],
      allTableList: [],
      readyTypeList: {
        0: { value: 0, label: "急采" },
        1: { value: 1, label: "普通备货" },
        2: { value: 2, label: "海外仓备货" },
        3: { value: 3, label: "FAB备货" },
        4: { value: 4, label: "全托管备货" },
        5: { value: 5, label: "直发备货" },
      },
      alibabaList,
      examineStatusList,
      skuStatus: "",
      selectSkuArr: [],
      order: {},
      proList: [],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
        sku_status: [],
      },
      purchaseAccountIdArr: [],
      warehouseArr: [],
      purchaserExpressage: [],
      supplierArr: [],
      currencyArr: [],
      orderColumn: [],
      statusList: [
        { label: "全部", value: "" },
        { label: "未收货", value: 0 },
        { label: "部分收货", value: 1 },
        { label: "全部收货", value: 2 },
        { label: "超量收货", value: 3 },
      ] /* 
      tableData1: [
        {
          name: 'John Brown',
          weight: 0,
          address: 'New York No. 1 Lake Park'
        },
        {
          name: 'Jim Green',
          weight: 0,
          address: 'London No. 1 Lake Park'
        },
        {
          name: 'Joe Black',
          weight: 0,
          address: 'Sydney No. 1 Lake Park'
        },
        {
          name: 'Jon Snow',
          weight: 0,
          address: 'Ottawa No. 2 Lake Park'
        }
      ], */,
      ruleValidate: {
        purchaserId: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        purchaseWarehouseId: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        supplierId: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        /* currency: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ], */
        readyType: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
            type: "number",
          },
        ],
        // requireDespatchTime: [
        //   { required: true, message: "不能为空", trigger: "change" },
        //   { required: true, message: "请输入发货时间", trigger: "change" },
        // ],
      }, // 物流信息
      logisticsColumn: [
        {
          key: "carrierId",
          align: "center",
          title: "物流公司",
          render: (h, params) => {
            let arr = [];
            self.purchaserExpressage.forEach((n, i) => {
              arr.push(
                h(
                  "Option",
                  {
                    props: {
                      value: n.code,
                      key: i,
                    },
                  },
                  n.name
                )
              );
            });
            return h(
              "FormItem",
              {
                props: {
                  prop: "shippingInfoList." + params.index + ".carrierId", //
                  rules: [
                    {
                      required: true,
                      message: "不能为空",
                      trigger: "change",
                    },
                  ],
                },
                style: {
                  marginTop: "20px",
                },
              },
              [
                h(
                  "Select",
                  {
                    props: {
                      value:
                        self.order.shippingInfoList[params.index].carrierId,
                      disabled:
                        self.showType == "1" && self.editType !== "copy",
                      transfer: true,
                      filterable: true,
                    },
                    on: {
                      "on-change": (value) => {
                        self.order.shippingInfoList[params.index].carrierId =
                          value;
                      },
                    },
                  },
                  arr
                ),
              ]
            );
          },
        },
        {
          key: "trackingNumber",
          align: "center",
          title: "快递单号",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "shippingInfoList." + params.index + ".trackingNumber",
                  rules: [
                    {
                      required: true,
                      message: "不能为空",
                      trigger: "blur",
                    },
                  ],
                },
                style: {
                  marginTop: "20px",
                },
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.order.shippingInfoList[params.index].trackingNumber,
                    disabled: self.showType == "1" && self.editType !== "copy",
                  },
                  on: {
                    input: (value) => {
                      self.order.shippingInfoList[params.index].trackingNumber =
                        value;
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "goodsJson",
          align: "center",
          title: "发货信息",
          render(h, params) {
            let arr = [];
            if (params.row.goodsJson) {
              arr = JSON.parse(params.row.goodsJson);
            }
            return h(
              "span",
              {
                style: {
                  color: "blue",
                },
                on: {
                  click() {
                    self.data2 = self.proList.map((i) => {
                      let obj = JSON.parse(JSON.stringify(i));
                      if (arr) {
                        arr.forEach((j) => {
                          if (i.goodsId === j.goodsId) {
                            obj.quantity = j.quantity;
                          }
                        });
                      }
                      return obj;
                    });
                    self.data3 = JSON.parse(JSON.stringify(self.data2));
                    self.modal2Edit = "look";
                    self.modal2 = true;
                  },
                },
              },
              arr.map((i) => {
                return h(
                  "span",
                  {
                    style: {
                      marginRight: "5px",
                    },
                  },
                  i.sku + "*" + i.quantity
                );
              })
            );
          },
        },
        {
          key: "planArriveDate",
          align: "center",
          title: "预计到达日期",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "shippingInfoList." + params.index + ".planArriveDate",
                  rules: [
                    {
                      required: true,
                      message: "不能为空",
                      trigger: "change",
                    },
                  ],
                },
                style: {
                  marginTop: "20px",
                },
              },
              [
                h("DatePicker", {
                  props: {
                    type: "date",
                    value:
                      self.order.shippingInfoList[params.index].planArriveDate,
                    disabled: self.showType == "1" && self.editType !== "copy",
                    readonly: self.showType == "1" && self.editType !== "copy",
                    transfer: true,
                  },
                  on: {
                    "on-change": (value) => {
                      value = value + " 00:00:00";
                      self.order.shippingInfoList[params.index].planArriveDate =
                        value;
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          render: (h, params) => {
            return h("div", {}, [
              h(
                "Poptip",
                {
                  props: {
                    transfer: true,
                    confirm: true,
                    title: "确认要删除该行物流信息吗？",
                    placement: "top-end",
                  },
                  on: {
                    "on-ok": () => {
                      let v = this;
                      // 前端做删除数据操作
                      v.order.shippingInfoList.splice(params.index, 1);
                    },
                  },
                },
                [
                  h(
                    "Button",
                    {
                      props: {
                        type: "primary",
                        disabled:
                          self.showType == "1" ||
                          (self.order.shippingInfoList[params.index]
                            .purchaseShippingInfoId &&
                            self.editType !== "copy" &&
                            !self.getPermission("purchase_removeShipping")),
                      },
                    },
                    "删除"
                  ),
                ]
              ),
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    disabled:
                      self.showType == "1" ||
                      (self.order.shippingInfoList[params.index]
                        .purchaseShippingInfoId &&
                        self.editType !== "copy" &&
                        !self.getPermission("purchase_removeShipping")),
                  },
                  style: {
                    marginLeft: "10px",
                  },
                  on: {
                    click() {
                      let goodsJson = [];
                      if (params.row.goodsJson) {
                        goodsJson = JSON.parse(params.row.goodsJson);
                      }
                      self.getData(goodsJson);
                      self.modal2Index = params.index;
                      self.modal2Edit = "edit";
                      self.modal2 = true;
                    },
                  },
                },
                "编辑发货信息"
              ),
            ]);
          },
        },
      ],
      originalData: [],
      shelvesTotalPrice: null,
      totalQuantityPurchased: 0,
      TotalQuantityReceived: 0,
      expendBtn: false,
      options: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      showRemarkList: [],
      isEditRemark: false,
      productTagList: {},
    };
  },
  created() {
    this.pageLoading = true;
    this.initBaseDataList().finally(() => {
      this.init();
      this.getProlist(true);
      this.pageLoading = false;
    })
    this.getComingSpecialList();
    this.getOverseaTagList()
  },
  mounted() {
    this.$nextTick(() => {
      this.changeTableColumns();
    });
    this.requireDate();
  },
  watch: {
    proList: {
      handler: function (val, oldVal) {
        this.allWeight = val.reduce((a, b) => {
          let replenishQuantity = b.replenishQuantity ? b.replenishQuantity : 0;
          let weight = b.weight ? b.weight : 0;
          return a + replenishQuantity * weight;
        }, 0);
      },
      deep: true,
    },
    "order.detailsResultList": {
      handler: function (newVal, oldVal) {
        let v = this;
        if (newVal.length == 0) {
          v.order.type = 1;
        } else {
          let isAlibaba = false;
          let isNormal = false;
          v.order.type = 1;
          newVal.forEach((n, i) => {
            if (n.orderType === 2) {
              isAlibaba = true;
            } else {
              isNormal = true;
            }
          });
          if (!isAlibaba && isNormal) {
            v.order.type = 1;
          } else if (isAlibaba && !isNormal) {
            v.order.type = 2;
          } else if (isAlibaba && isNormal) {
            v.order.type = 3;
          }
        }
      },
      deep: true,
    },
    orderData: {
      handler(newVal) {
        this.showRemarkList = this.orderData.remarks || [];
        for (let i in this.showRemarkList) {
          this.showRemarkList[i].createdTime = this.getDataToLocalTime(
            this.showRemarkList[i].createdTime,
            "fulltime"
          );
          this.showRemarkList[i].name =
            this.$store.state.allUser[
              this.showRemarkList[i].updatedBy
            ].userName;
        }
      },
      immediate: true,
    },
  },
  computed: {
    receiptStatus() {
      if (this.order.receiptStatus === 0) {
        return 0;
      } else if (this.order.receiptStatus === 3) {
        return 1;
      } else if (this.order.receiptStatus === 2) {
        return 2;
      } else {
        return 0;
      }
    },
    overshootState() {
      return !this.$common.isEmpty(this.order.overshootState) && ![0, '0'].includes(this.order.overshootState);
    },
    overshootText() {
      if ([1, '1'].includes(this.order.overshootState)) {
        return {
          style: {
            color: '#2d8cf0',
            'font-size': '12px'
          },
          text: '允许超发中'
        }
      }
      if ([2, '2'].includes(this.order.overshootState)) {
        return {
          style: {
            color: '#f30',
            'font-size': '12px'
          },
          text: '允许超发结束'
        }
      }
      return {
        style: {},
        text: ''
      };
    },
    // 是否为第三方标签
    isThirdPartyTag() {
      if (this.$common.isEmpty(this.order) || this.$common.isEmpty(this.order.tagType) || [0, '0'].includes(this.order.tagType)) return false;
      return true;
    },
    // 第三方标签名称
    thirdPartyTagName() {
      if(this.order.platformAndAccountCode) {
        let result = this.sliceStr(this.order.platformAndAccountCode, '-', 2, 0)
        return result
      } 
      return this.overseaTagList[this.order.overseaTagId].name
    },
    proTotalPrice() {
      let totalNum = Number(this.order.totalPrice);
      if (this.$common.isEmpty(totalNum)) {
        totalNum = 0;
      }
      return totalNum;
    },
    // 订单总金额
    orderTotalSum() {
      const freightCharge = this.$common.isEmpty(Number(this.order.freightCharge)) ? 0 : Number(this.order.freightCharge);
      const discountAmount = this.$common.isEmpty(Number(this.order.discountAmount)) ? 0 : Number(this.order.discountAmount);
      const sumOvershootPrice = this.$common.isEmpty(Number(this.order.sumOvershootPrice)) ? 0 : Number(this.order.sumOvershootPrice);
      const orderSum = this.$common.add(this.proTotalPrice, freightCharge, sumOvershootPrice);
      return this.$common.sub(orderSum, discountAmount);
    },
    // 为真时固定表格高度
    overHeight() {
      return (
        this.order.shippingInfoList && this.order.shippingInfoList.length > 2
      );
    },
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        let temp = {};
        (list || []).forEach(k => {
          temp[k.comingSpecialId] = k;
        })
        this.productTagList = temp;
      })
    },
    intercepTime,
    requireDate() {
      let myDate = new Date();
      let hour = myDate.getHours();

      let nowDate =
        hour < 12
          ? new Date()
          : new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      let year = nowDate.getFullYear(); // 获取当前年份
      let month = nowDate.getMonth() + 1; // 获取当前月份(0-11,0代表1月所以要加1);
      let day = nowDate.getDate(); // 获取当前日（1-31）
      // 日期格式：2019/07/29 - 2019/07/29
      this.order.requireDespatchTime = `${year}-${month}-${day} 23:59`;
    },
    getDataFilter() {
      if (!this.searchSku) {
        this.data3 = JSON.parse(JSON.stringify(this.data2));
      } else {
        this.data3 = this.data2.filter((i) => {
          if (i.sku === this.searchSku) {
            return i;
          }
        });
      }
    },
    getData(goodsJson) {
      // 获取发货明细
      let v = this;
      v.data2 = v.proList.map((i, j) => {
        let obj = JSON.parse(JSON.stringify(i));
        obj.quantity = 0;
        obj._INDEX = j;
        obj.sku = obj.skuNo;
        if (goodsJson.length > 0) {
          goodsJson.forEach((j) => {
            if (i.goodsId === j.goodsId) {
              obj.quantity = j.quantity;
            }
          });
        }
        return obj;
      });
      v.data3 = JSON.parse(JSON.stringify(v.data2));
    },
    saveGoodsJson() {
      let arr = this.data2
        .filter((i) => {
          return i.quantity > 0;
        })
        .map((i) => {
          return {
            sku: i.sku,
            quantity: i.quantity,
            goodsId: i.goodsId,
          };
        });
      this.$set(
        this.order.shippingInfoList[this.modal2Index],
        "goodsJson",
        JSON.stringify(arr)
      );
      this.modal2 = false;
    },
    cancelPurchase() {
      let v = this;
      let obj = {
        operationType: "5",
        purchaseIdList: [v.order.purchaseId],
      };
      v.axios.post(api.purchaseOperation, obj).then((res) => {
        if (res.data.code == 0) {
          v.$Message.success("操作成功");
          v.$emit("addOrderGoBack", v.$store.state.thisPage);
        }
      });
    },

    init() {
      let orderData = this.deepCopy(this.orderData || {});
      if (orderData.remarks && orderData.remarks.length > 0) {
        let reg = new RegExp("<br>", "g");
        orderData.remarks.forEach((i) => {
          if (i.remark != null && i.remark != "") {
            i.edit = false;
            i.remarkDraft = i.remark.replace(reg, "\n");
            i.remark = i.remark.replace(reg, "\n");
          }
        });
      }

      // 向供应商下单信息
      orderData.requireDespatchTime = "";
      orderData.requireDespatch = "";
      orderData.iscrash = false;

      // 详情赋值
      // eslint-disable-next-line no-prototype-builtins
      if (orderData.hasOwnProperty("orderInformationList") && orderData.orderInformationList && orderData.orderInformationList.length) {
        let orderInformationList = orderData.orderInformationList[0];
        orderData.requireDespatchTime = intercepTime(orderInformationList.requireDespatchTime + ":59");
        orderData.requireDespatch = orderInformationList.requireDespatch || "";
        orderData.iscrash = orderInformationList.iscrash === 1 ? true : false;
      }

      this.order = this.deepCopy(orderData);
      this.originalData = orderData.detailsResultList;
      this.allTableList = this.deepCopy(orderData.detailsResultList);
      if (this.originalData.length > 0) {
        this.totalQuantityPurchased = this.originalData.reduce(
          (prev, next) => prev + next.replenishQuantity,
          0
        );
        this.TotalQuantityReceived = this.originalData.reduce(
          (prev, next) => prev + next.receiveQuantity,
          0
        );
      }
      this.order.shippingInfoList =
        this.order.shippingInfoList === null ? [] : this.order.shippingInfoList;
      this.$nextTick(() => {
        this.getSettlementType();
      });
      if (this.order.remarks != null) {
        this.order.remark = this.order.remarks[0].remark;
      }
      /* v.order.detailsResultList.forEach((n, i)=> {
       v.$set(n, 'orderQuantity', 0)
       v.$set(n, 'unitPrice', 0)
       }) */
      this.GetTotalNumber();
    },
    getSettlementType() {
      let v = this;
      v.supplierArr.forEach((n, i) => {
        if (n.supplierId == v.order.supplierId) {
          v.order.settlementType = n.settlementType;
          v.order.settlementTypeName = n.settlementTypeName;
          v.order.supplierType = n.supplierType;
          // v.order.supplierTypeName = n.supplierTypeName
        }
      });
    },
    currencyChangeFn(value) {
      this.order.currency = value;
    },
    // 获取第三方标签数据
    getOverseaTagList() {
      return new Promise((resolve) => {
        this.axios.post(api.getOverseaTaglist).then((res) => {
          if (res.data && res.data.code == 0) {
            (res.data.datas || []).forEach(item => {
              this.$set(this.overseaTagList, item.overseaTagId, item);
            })
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        })
      })
    },
    // 初始化请求数据
    initBaseDataList() {
      return new Promise((resolve) => {
        this.$common.promiseAll([
          () => {
            return this.axios.post(api.warehouse, { pageParams: 1 }).then((res) => {
              if (res.data.code == 0) {
                this.warehouseArr = res.data.datas;
              }
            })
          },
          () => {
            return this.axios.get(api.queryIdAndName).then((res) => {
              if (res.data.code == 0) {
                this.supplierArr = res.data.datas;
                this.getSettlementType();
              }
            })
          },
          () => {
            // 货币下拉列表
            return this.axios.post(api.get_expressage).then((res) => {
              if (res.data.code == 0) {
                this.purchaserExpressage = res.data.datas;
              }
            })
          },
          () => {
            return this.axios.get(api.baseDataList + "?dataType=currencyType").then((res) => {
              if (res.data.code == 0) {
                this.currencyArr = res.data.datas;
              }
            })
          }
        ]).finally((arr) => {
          resolve(arr);
        })
      })
    },
    // 新增物流方式
    addLogisticsFn() {
      this.order.shippingInfoList.push({
        carrierId: "",
        trackingNumber: "",
        planArriveDate: "",
        goodsJson: null,
      });
      this.expendBtn = true;
    },
    batchOperation(name, type) {
      let v = this;
      let qtyError = v.order.detailsResultList.some(
        (item) => item.replenishQuantity == 0
      ); // 判断下单数量是否等于0
      let priceError = v.order.detailsResultList.some(
        (item) => item.unitPrice == 0
      ); // 判断价格是否等于0
      if (qtyError) {
        v.$Message.error("下单数量不能为0");
        return;
      }
      if (priceError) {
        v.$Message.error("价格不能为0");
        return;
      }
      v.$refs[name].validate((valid) => {
        // 校验通过后执行
        if (valid) {
          let obj = {
            operationType: type,
            purchaseIdList: [v.order.purchaseId],
          };
          v["operationLoading_" + type] = true;
          v.axios.post(api.purchaseOperation, obj).then((res) => {
            v["operationLoading_" + type] = false;
            if (res.data.code == 0) {
              v.$Message.success("操作成功");
              v.$emit("addOrderGoBack", v.$store.state.thisPage);
            }
          });
        }
      });
    },
    changeTableColumns() {
      let v = this;
      let tableColumnList = {
        selection: {
          type: "selection",
          width: 60,
          align: "center",
        },
        thumbUrl: {
          key: "thumbUrl",
          title: "图片",
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
              [
                v.tableImg(h, params, "thumbUrl"),
                h(
                  "span",
                  {
                    style: {
                      color: "#157CE9",
                      cursor: "pointer",
                    },
                    on: {
                      click() {
                        let productPic = params.row.thumbUrl;
                        v.goPicrtureUrl(productPic);
                      },
                    },
                  },
                  "1688搜同款"
                ),
              ]
            );
          },
        },
        skuNo: {
          key: "skuNo",
          align: "center",
          width: 240,
          title: "产品SKU/产品名称",
          render: (h, params) => {
            let spec = "";
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            }
            let link = params.row.supplierPurchaseLink;
            return h("div", {}, [
              h(
                "Row",
                {
                  props: {
                    type: "flex",
                    justify: "center",
                    align: "middle",
                  },
                },
                [
                  h(
                    "Col",
                    {
                      props: {
                        span: 16,
                      },
                    },
                    [
                      h("span", params.row.skuNo),
                      h("br"),
                      h(
                        "div",
                        {
                          attrs: { title: params.row.goodsName },
                        },
                        params.row.goodsName
                      ),
                    ]
                  ),
                  params.row.searchUrl
                    ? h(
                      "Col",
                      {
                        props: {
                          span: 8,
                        },
                      },
                      [
                        h(
                          "a",
                          {
                            class: "related",
                            attrs: {
                              href: params.row.searchUrl,
                              target: "_blank",
                            },
                          },
                          "同款搜货"
                        ),
                      ]
                    )
                    : "",
                  h(
                    "div",
                    {
                      style: {
                        color: "green",
                      },
                      attrs: {
                        title: spec,
                      },
                    },
                    spec
                  ),
                  link != null && link != ""
                    ? h("Icon", {
                      props: {
                        type: "ios-link",
                      },
                      style: {
                        color: "#157CE9",
                        fontSize: "20px",
                        margin: "0 10px 0 10px",
                        cursor: "pointer",
                      },
                      on: {
                        click() {
                          window.open(link);
                        },
                      },
                    })
                    : "",
                ]
              ),
            ]);
          },
        },
        relatedPlatformGoods: {
          key: "relatedPlatformGoods",
          align: "center",
          title: "1688商品属性",
          render: (h, params) => {
            if (params.row.relatedPlatformGoods) {
              return h(
                "span",
                JSON.parse(params.row.relatedPlatformGoods).attributeDisplayName
              );
            } else {
              return "";
            }
          },
        },
        availableStock: {
          key: "availableStock",
          align: "center",
          title: "可用库存",
          render: (h, params) => {
            if (
              params.row.availableStock !== null &&
              params.row.availableStock !== ""
            ) {
              return h("span", params.row.availableStock);
            } else {
              return h("span", "-");
            }
          },
        },
        onPassageQuantity: {
          key: "onPassageQuantity",
          align: "center",
          title: "在途库存",
          render: (h, params) => {
            if (
              params.row.onPassageQuantity !== null &&
              params.row.onPassageQuantity !== ""
            ) {
              return h("span", params.row.onPassageQuantity);
            } else {
              return h("span", "-");
            }
          },
        },
        currentCost: {
          key: "currentCost",
          align: "center",
          title: "最近采购价",
          render: (h, params) => {
            if (
              params.row.currentCost !== null &&
              params.row.currentCost !== ""
            ) {
              return h("span", params.row.currentCost);
            } else {
              return h("span", "-");
            }
          },
        },
        replenishQuantity: {
          key: "replenishQuantity",
          align: "center",
          title: "下单数量",
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                value: v.proList[params.index].replenishQuantity,
                min: 0,
                max: 9999999,
                disabled: v.showType !== "3" && v.editType !== "copy",
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  return str;
                },
              },
              on: {
                "on-change": (val) => {
                  v.proList[params.index].replenishQuantity = val;
                  v.order.detailsResultList.forEach((n, i) => {
                    if (n.goodsId == params.row.goodsId) {
                      v.order.planDetailsList[i].replenishQuantity = val;
                    }
                  });
                },
              },
            });
          },
        },
        receiveQuantity: {
          key: "receiveQuantity",
          align: "center",
          title: "收货数量",
        },
        shelveQuantity: {
          key: "shelveQuantity",
          align: "center",
          title: "入库数量",
        },
        amountMoney: {
          key: "amountMoney",
          align: "center",
          title: "已收库金额",
          render: (h, { row }) => {
            if (!isNaN(row.receiveQuantity) && !isNaN(row.unitPrice)) {
              const amountMoney = row.receiveQuantity * row.unitPrice;
              return h("div", amountMoney.toFixed(3));
            }
            return "";
          },
        },
        unitPrice: {
          key: "unitPrice",
          align: "center",
          title: "单价",
          render: (h, params) => {
            let selectOptions = [];
            v.currencyArr.forEach((n, i) => {
              selectOptions.push(
                h(
                  "Option",
                  {
                    props: {
                      value: n.code,
                      key: n.code,
                    },
                  },
                  n.code
                )
              );
            });
            return h("InputNumber", {
              props: {
                value: v.proList[params.index].unitPrice,
                min: 0,
                max: 9999999,
                step: 0.01,
                disabled: v.showType !== "3" && v.editType !== "copy",
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  return str;
                },
              },
              on: {
                "on-change": (val) => {
                  v.proList[params.index].unitPrice = val;
                  v.order.detailsResultList.forEach((n, i) => {
                    if (n.goodsId == params.row.goodsId) {
                      v.order.planDetailsList[i].unitPrice = val;
                    }
                  });
                },
              },
            });
            /* return h('Row', [
             h('Col', {
             props: {
             span: 12
             }
             }, [
             h('InputNumber', {
             props: {
             value: v.proList[params.index].unitPrice,
             min: 0,
             max: 9999999,
             step: 0.01,
             disabled: true,
             formatter: value => {
             let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ',')
             return str
             }
             },
             on: {
             'on-change': (val)=> {
             v.proList[params.index].unitPrice = val
             v.order.detailsResultList.forEach((n, i)=> {
             if(n.goodsId == params.row.goodsId) {
             v.order.planDetailsList[i].unitPrice = val
             }
             })
             }
             }
             })
             ]),
             h('Col', {
             props: {
             span: 11,
             offset: 1
             }
             }, [
             h('Select', {
             props: {
             }
             }, selectOptions)
             ])
             ]) */
          },
        },
        weight: {
          key: "weight",
          align: "center",
          title: "重量",
        },
        operation: {
          key: "operation",
          align: "center",
          title: "操作",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "dashed",
                  disabled: v.showType !== "3" && v.editType !== "copy",
                },
                on: {
                  click() {
                    v.proList.splice(params.index, 1);
                    v.order.detailsResultList.forEach((n, i) => {
                      if (n.goodsId == params.row.goodsId) {
                        v.order.detailsResultList.splice(i, 1);
                      }
                    });
                    v.selectionArr = [];
                  },
                },
              },
              "删除"
            );
          },
        },
      };
      v.orderColumn = [];
      for (let name in tableColumnList) {
        if (v.order.type != 1 || name != "relatedPlatformGoods") {
          v.orderColumn.push(tableColumnList[name]);
        }
      }
    },
    proChangePageSize(pageSize) {
      this.proPage.pageSize = pageSize;
      this.getProlist(pageSize);
    },
    proChangePage(page) {
      this.proPage.pageNum = page;
      this.getProlist(page);
    },
    getProlist(pageSize, page) {
      // 获取分页数据
      let v = this;
      v.proList = [];
      let value = v.proPage.sku_status;
      let data = v.originalData;
      let filterData = [];
      if (data.length > 0) {
        if (value.length > 0) {
          value.map((talg) => {
            if (talg === 1) {
              // 未收货   // 收货数量 receiveQuantity  下单数量 replenishQuantity
              data.map((item) => {
                if (item.receiveQuantity === 0) {
                  filterData.push(item);
                }
              });
            }
            if (talg === 2) {
              // 全部收货
              data.map((item) => {
                if (
                  item.receiveQuantity != 0 &&
                  item.receiveQuantity === item.replenishQuantity
                ) {
                  filterData.push(item);
                }
              });
            }
            if (talg === 3) {
              // 部分收货
              data.map((item) => {
                if (
                  item.receiveQuantity != 0 &&
                  item.replenishQuantity > item.receiveQuantity
                ) {
                  filterData.push(item);
                }
              });
            }
            if (talg === 4) {
              // 超量收货
              data.map((item) => {
                if (
                  item.receiveQuantity != 0 &&
                  item.replenishQuantity < item.receiveQuantity
                ) {
                  filterData.push(item);
                }
              });
            }
          });
        } else {
          filterData = data;
        }
        v.proList = filterData.map((i, j) => {
          i.RowIndex = j;
          return i;
        });
        if (pageSize || page) {
          let start = (v.proPage.pageNum - 1) * v.proPage.pageSize; // 起始坐标
          let end =
            v.proPage.pageNum * v.proPage.pageSize < filterData.length
              ? v.proPage.pageNum * v.proPage.pageSize
              : filterData.length; // 结束坐标，如果结束坐标大于数组长度，改为数组的长度
          v.proList = filterData.slice(start, end);
        }
        v.proPage.total = filterData.length;
        // value > 0 ? v.order.detailsResultList = v.proList : v.order.detailsResultList = v.originalData;
      }
      v.selectSkuArr = [];
    }, // 筛选sku收货状态
    changeStatus(value) {
      this.proPage.sku_status = value;
      this.getProlist(true);
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
    },
    cancelAction() {
      // 取消
      this.$emit("goBackFromAdd");
    },
    addProFn() {
      let v = this;
      if (!v.order.purchaseWarehouseId) {
        v.$Message.warning("请先选择采购仓库！！");
      } else {
        v.isShowAddPro = true;
      }
    },
    batchDelFn() {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error("请选择需要删除的商品！");
      } else {
        v.selectionArr.forEach((n, i) => {
          v.proList.forEach((m, j) => {
            // 删除table中对应的商品
            if (n.goodsId === m.goodsId) {
              v.proList.splice(j, 1);
            }
          });
          v.order.detailsResultList.forEach((l, k) => {
            if (n.goodsId === l.goodsId) {
              // 删除实际列表中对应的商品
              v.order.detailsResultList.splice(k, 1);
            }
          });
        });
      }
    },
    saveAction(name, type) {
      let v = this;
      if (v.order.detailsResultList.length == 0) {
        v.$Message.error({
          content: "请添加商品！！",
          duration: 3,
          closable: true,
        });
        return;
      }
      v.$refs[name].validate((valid) => {
        // 校验通过后执行
        if (valid) {
          let obj = v.deepCopy(v.order);
          obj.updateQuoteFlag = obj.updateQuoteFlag ? 1 : 0;
          obj.updateSupplierFlag = obj.updateSupplierFlag ? 1 : 0;
          if (v.editType === "copy") {
            delete obj.purchaseId;
          }
          let apiUrl = "";
          if (type === "4") {
            if(this.order.readyType == 5 && this.order.businessStatus !== 1) {
              return this.$Message.error('“直发备货”的下单供应商必须开通“供应商系统”')
            }
            // 处理供应商下单信息
            let temp = {};
            temp.iscrash = obj.iscrash ? 1 : 0;
            temp.requireDespatch = obj.requireDespatch;
            temp.requireDespatchTime = obj.requireDespatchTime ? obj.requireDespatchTime + ":59" : null;
            temp.businessStatus = obj.businessStatus || 0;
            obj.orderInformationList = [];
            obj.orderInformationList.push(temp);
            obj.requireDespatchTime = obj.requireDespatchTime ? obj.requireDespatchTime + ":59" : null;
            v.currencyArr.filter((k) => {
              if (k.dataDesc == obj.currency) {
                obj.currency = k.dataValue;
              }
            });
            delete obj.purchaseType;
            // 向供应商下单
            apiUrl = api.submitSupplierOrder;
          } else {
            apiUrl = api.purchaseSubmit;
          }
          if (v.showType == 2) {
            //下单后修改
            /* let remarks = [];
            let remark = {
              remark: v.order.remark,
              purchaseId: v.order.purchaseId
            }
            remarks.push(remark) */
            let temp = {
              freightCharge: obj.freightCharge,
              paymentLinkType: obj.paymentLinkType,
              alibabaAccountType: obj.alibabaAccountType,
              externalSerialNo: obj.externalSerialNo,
              purchaseNumber: obj.purchaseNumber,
              totalAmount: this.orderTotalSum,
              discountAmount: this.order.discountAmount,
              // remarks: remarks,
            };
            v.saveLoading = true;
            v.$Spin.show();

            v.axios.post(api.changeOrder, temp).then((res) => {
              if (res.data.code == 0) {
                v.$Spin.hide();
                v.$emit("goBackFromAdd");
                v.$emit("getList");
                v.$Message.success("保存成功");
              }
            });
          } else {
            //备注单独用接口，所以除了新增和复制，其他功能删除备注字段
            if (this.orderType != 1 && this.orderType != 5) {
              delete obj.remarks;
            }
            v.axios.post(apiUrl, obj).then((res) => {
              v.$Spin.hide();
              v.saveLoading = false;
              if (res.data.code == 0) {
                if (type === "4") {
                  // 向供应商下单
                  v.$Message.success("操作成功");
                  v.$emit("addOrderGoBack", v.$store.state.thisPage);
                } else {
                  v.$Message.success("提交成功");
                  v.$emit(
                    "addOrderGoBack",
                    v.$store.state.thisPage,
                    res.data.datas
                  );
                }
              }
            });
          }
        }
      });
    }, // 获取已入库商品总金额
    GetTotalNumber() {
      this.axios
        .put(api.get_TotalNumber, [this.purchaseOrderIds])
        .then((res) => {
          if (res.data.code == 0) {
            this.shelvesTotalPrice = res.data.datas[0].receiptTotalPrice;
          }
        });
    },
    // 展开/收起
    expendClick() {
      this.expendBtn = !this.expendBtn;
    },
    // 时间选择
    pickDataChange(value) {
      this.order.requireDespatchTime = value;
    },
    // 根据订单的急单类型，根据交期，自动计算要求发货时间
    iscrashChange(e) {
      let createdTime = this.getDataToLocalTime(
        this.orderData.createdTime,
        "fulltime",
        true
      );
      if (e) {
        // 选中状态时，订单每个SKU的要求发货时间可以设置，默认的设置时间为：下单日期+1，时间默认为：23：59；
        this.order.requireDespatchTime = getNewData(createdTime, 1) + " 23:59";
      }
      // 不选中状态时，订单每个SKU的要求发货时间=下单时间+交期，计算方法：要求发货日期=下单日期+交期天数，时间默认为23：59
      // this.order.requireDespatchTime = getNewData(this.order.createdTime) + ' 23:59';
    },
    showName(id) {
      let userList = this.$store.state.allUser;
      for (let i in userList) {
        if (i == id) {
          return userList[i].userName;
        }
      }
    },
    filterSku() {
      let data = this.orderData;
      if (this.skuStatus || this.skuStatus === 0) {
        data.detailsResultList = this.allTableList.filter((k) => {
          if (
            k.queryOrderInfoListVO.receiveStatus == this.skuStatus ||
            (k.queryOrderInfoListVO.receiveStatus == null &&
              this.skuStatus === 0)
          ) {
            return k;
          }
        });
      } else {
        data.detailsResultList = this.allTableList;
      }
    },
    showDeliverOrderDia(row) {
      this.isVisible = true;
      this.dialogOrderdetail.data = row;
      this.dialogOrderdetail.source = 2; // 2--采购单 -> 发货单详情；else 订单 -> 发货单详情
    },
    orderNumChange(val) {
      const sumOvershootPrice = this.$common.isEmpty(Number(this.order.sumOvershootPrice)) ? 0 : Number(this.order.sumOvershootPrice);
      const freightCharge = this.$common.isEmpty(Number(this.order.freightCharge)) ? 0 : Number(this.order.freightCharge);
      const total = this.$common.add(this.proTotalPrice, sumOvershootPrice, freightCharge);
      if (val > total) {
        val = total;
      }
      if (val < 0) {
        val = 0;
      }
      this.order.discountAmount = this.$common.sub(total, val);
    },
    // 截取字符串方法
    sliceStr(str, symbol ,endIndex , startIndex) {
      const parts = str.split(symbol)
      let result = ''
      if(startIndex===0 || startIndex){
        result = parts.slice(startIndex, endIndex).join(symbol)
      } else {
        result = parts.slice(endIndex).join(symbol)
      }
      return result
    },
    time_now,
  },
};
</script>
<style lang="less">
.deleteLabelWidth {
  .ivu-form-item-content {
    margin-left: 0 !important;
  }
  .ivu-form-item {
    margin-bottom: 20px;
  }
}

.expendHeight .ivu-table-body {
  height: 145px;
}

.ivu-col-offset-2 {
  margin-left: 3.333333%;
}
</style>
<style lang="less" scoped>
.submitTopBtnWrapper {
  position: absolute;
  top: 13px;
  left: 150px;
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

.paraTitle {
  margin: 5px 0;
  font-size: 16px;
  font-weight: bold;
}

.sku_filter {
  margin: 10px 0;
}

.sku_filter {
  :deep(.ivu-form-item) {
    margin-bottom: 0;
  }
}

.titleFont {
  font-size: 16px;
  font-weight: bold;
}

.textOrange {
  margin-left: 10px;
  color: orange;
}

.addPurOrdMod .ivu-icon {
  font-size: 26px;
  color: #ff9900;
}

.showOrderModify .ivu-col {
  height: 40px;
}

.remarkOver {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.margin-10-0 {
  margin: 10px 0;
}

.addIcon {
  font-size: 20px;
  font-weight: 600;
  color: #2d8cf0;
  margin-left: 10px;
}

.remarkItemTextarea {
  :deep(.ivu-form-item-content) {
    margin-left: 30px !important;
    line-height: 20px !important;
  }
}

.textareaContent {
  :deep(textarea) {
    width: 500px !important;
    height: 60px !important;
  }
}

.itemRemark {
  margin-left: 15px;
  display: inline;
  white-space: pre-wrap;
  width: 400px;
  word-wrap: break-word;
}

.flex-inline {
  display: flex;
  align-items: flex-end;
}

.basic-title {
  @bottomSpace: 10px;
  position: relative;
  margin-bottom: @bottomSpace;
  font-weight: bold;

  &:before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -@bottomSpace;
    width: 100%;
    height: 0px;
    border-bottom: 1px dashed #dddee1;
  }
}

.basic-information {
  position: relative;
  padding-top: 10px;

  .ivu-form-item {
    width: 17.3%;

    &:nth-of-type(5n - 2) {
      width: 30%;
    }

    &:nth-of-type(5n) {
      width: 18%;
    }

    display: inline-block;

    :deep(.ivu-form-item-label) {
      padding: 5px 0;
      line-height: 1.3em;
      font-size: 14px;
    }

    :deep(.ivu-form-item-content) {
      padding: 5px 0;
      line-height: 1.3em;
      font-size: 14px;
    }

    &.not-padding-item {
      :deep(.ivu-form-item-content) {
        padding: 0;
      }
    }
  }
}

.product-info-head {
  display: flex;
  justify-content: space-between;
}
</style>
