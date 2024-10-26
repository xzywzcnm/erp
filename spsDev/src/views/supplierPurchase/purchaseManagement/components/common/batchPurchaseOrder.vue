<template>
  <div class="page-mian-content">
    <div class="page-top-head">
      <slot name="topper"></slot>
      <div class="top-btn-wrapper">
        <template>
          <Button type="primary" v-if="getPermission('purchaseRequirement_applyOrder') && isHasSetupStatus0"
            @click="batchSaveAction" style="margin-right: 10px" :loading="saveLoading || pageContentLoading">提交
          </Button>
          <Button type="primary" @click="batchWaitSave" v-if="getPermission('purchase_submit_wait')"
            :loading="saveLoading || pageContentLoading" style="margin-right: 10px">保存至待提交
          </Button>
          <Button type="default" class="mr10" @click="cancelAction">关闭</Button>
        </template>
      </div>
    </div>

    <div class="page-content">
      <div class="conten-left">
        <div class="conten-left-tiltle">
          <strong> 采购单</strong>
        </div>
        <div :style="{
          background:
            Number(orderIndex) === Number(index) ? '#ffff' : '#f2f2f2',
          borderRight: ' 0 solid #dbdbdb',
        }" class="chooseItem" v-for="(order, index) in orderList" :key="index" @click="clickItem(index)">
          <div>{{ order.supplierName }}</div>
          <div>{{ order.purchaseWarehouseName }}</div>
        </div>
      </div>
      <div class="conten-right">
        <div style="display: flex">
          <Button type="primary" class="ml20" @click="singleSubmit"
            v-if="(orderList[orderIndex].setupStatus == 0 || orderList[orderIndex].applyType == 1) && orderList.length > 1">提交</Button>
          <Button type="primary" class="ml20" @click="singleSave" v-if="orderList.length > 1">保存至待提交</Button>
          <Button class="ml20" @click="cancelOrder" v-if="orderList.length > 1">取消</Button>
        </div>
        <!-- <Tabs type="card" v-model="orderIndex" >
          <TabPane
            v-for="(order, index) in orderList"
            :name="index + ''"
            :key="index"
            :label="order.supplierName + '-' + order.purchaseWarehouseName"
          > -->
        <div v-for="(order, index) in orderList" :key="index" class="order-details">
          <Form v-if="Number(orderIndex) === Number(index)" :ref="'order' + index" :model="order" :label-width="90"
            :rules="ruleValidate">
            <div style="font-size: 16px; font-weight: bold">基本信息</div>
            <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
            <!-- <Row class="normalTop">
              <Col :span="4">
                <FormItem label="采购单号：">
                  <span>下单后创建</span>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="备货仓库：">
                  <span>佛山丽山仓</span>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="中转仓库：">
                  <span>--</span>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="总重量(g)：" prop="weight">
                  <span>{{ allWeight }}</span>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="总数量：" prop="weight">
                  <span>1111</span>
                </FormItem>
              </Col>
            </Row>
            <Row class="normalTop">
              <Col :span="4">
                <FormItem label="备货类型" prop="readyType">
                  <dyt-select
                    v-model="order.readyType"
                    filterable
                    clearable
                    :disabled="
                      orderType == '2' || orderType == '3' || orderType == '4'
                    "
                    placeholder="请选择"
                  >
                    <Option
                      v-for="(item, index) in readyTypeList"
                      :value="item.value"
                      :key="index"
                      >{{ item.label }}
                    </Option>
                  </dyt-select>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="结算方式：" prop="settlementType">
                  <Input
                    v-model="order.settlementTypeName"
                    :disabled="true"
                  ></Input>
                </FormItem>
              </Col>

              <Col :span="4" :offset="2">
                <FormItem label="总商品金额：" prop="purchaser">
                  <span>{{ proTotalPrice.toFixed(2) }}</span>
                </FormItem>
              </Col>
              <Col :span="4" :offset="2">
                <FormItem label="应付总额：" prop="totalAmount">
                  <span style="color: #ff6600">{{
                    Number(
                      proTotalPrice + order.freightCharge - order.discountAmount
                    ).toFixed(2)
                  }}</span>
                </FormItem>
              </Col>
            </Row> -->

            <Row class="normalTop">
              <Col :span="4">
              <FormItem label="采购人：" prop="purchaserId">
                <dyt-select v-model="order.purchaserId" filterable clearable
                  :disabled="orderType == '3' || orderType == '4'" placeholder="请选择">
                  <Option v-for="(item, index) in purchaserArray" :value="item.id" :key="index">{{ item.name }}</Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <template v-if="orderType == '3' || orderType == '4'">
                <FormItem label="采购仓库：" prop="purchaseWarehouseName">
                  <Input v-model="order.purchaseWarehouseName" :disabled="true">
                  </Input>
                </FormItem>
              </template>
              <template v-else>
                <FormItem label="采购仓库：" prop="purchaseWarehouseId">
                  <dyt-select v-model="order.purchaseWarehouseId" filterable placeholder="请选择"
                    :disabled="orderSource == '1'">
                    <Option v-for="(item, index) in purchaseWarehouseArr" :disabled="item.warehouseStatus === '1'"
                      :value="item.warehouseId" :key="index">{{ item.warehouseName }}
                    </Option>
                  </dyt-select>
                </FormItem>
              </template>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="供应商：" prop="supplierId">
                <dytSelect v-model="order.supplierId" filterable clearable
                  :disabled="orderType == '3' || orderType == '4'" @on-change="supplierIdChangeFn" placeholder="请选择">
                  <Option v-for="(item, index) in supplierArr" :disabled="item.purchaseWarehouseStatus === '1'"
                    :value="item.supplierId" :key="index">{{ item.supplierName }}</Option>
                </dytSelect>
                <supplierChoose
                  v-if="order.detailsResultList && order.detailsResultList.length > 0 && !(orderType == '3' || orderType == '4')"
                  :module-data="{data: order.detailsResultList, index: index}"
                  @confirmHand="supplierConfirmHand"
                />
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="币种：" prop="currency">
                <dyt-select v-model="order.currency" filterable clearable :disabled="orderType == '3' || orderType == '4'"
                  @on-change="currencyChangeFn" placeholder="请选择">
                  <Option v-for="(item, index) in currencyArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}
                  </Option>
                </dyt-select>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="备货类型" prop="readyType">
                <dyt-select v-model="order.readyType" filterable clearable :disabled="orderType == '2' || orderType == '3' || orderType == '4'
                  " placeholder="请选择">
                  <Option v-for="(item, index) in readyTypeList" :value="item.value" :key="index">{{ item.label }}
                  </Option>
                </dyt-select>
                <!-- :value="`${index}${item.value}`" -->
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="4">
              <FormItem label="供应商类型：" prop="supplierType">
                <Input v-model="order.supplierTypeName" :disabled="true"></Input>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="结算方式：" prop="settlementType">
                <Input v-model="order.settlementTypeName" :disabled="true"></Input>
              </FormItem>
              </Col>

              <template v-if="!isDeliveryPay">
                <Col :span="4" :offset="2">
                <FormItem label="运费：" prop="freightCharge">
                  <InputNumber style="width: 125px" :max="999999" :min="0" :step="0.01" v-model="order.freightCharge"
                    :disabled="orderType == '3' || orderType == '4'"></InputNumber>
                </FormItem>
                </Col>
              </template>
              <Col :span="4" :offset="2">
              <FormItem label="优惠：" prop="discountAmount">
                <InputNumber style="width: 125px" :max="proTotalPrice" :min="0" :step="0.01"
                  v-model="order.discountAmount" :disabled="!proTotalPrice || orderType == '3' || orderType == '4'
                    "></InputNumber>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="总商品金额：" prop="purchaser">
                <span>{{ proTotalPrice.toFixed(2) }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="4">
              <FormItem label="应付总额：" prop="totalAmount">
                <span style="color: #ff6600">{{
                  Number(
                    proTotalPrice + order.freightCharge - order.discountAmount
                  ).toFixed(2)
                }}</span>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="总重量(g)：" prop="weight">
                <span>{{ allWeight }}</span>
              </FormItem>
              </Col>
              <Col :span="4" :offset="2">
              <FormItem label="所属事业部：" prop="weight">
                <span>{{ order.businessDeptName }}</span>
              </FormItem>
              </Col>
              <Col :span="10">
              <FormItem label="采购备注" prop="remark" v-if="order.setupStatus != 1">
                <Input v-model="order.remark" type="textarea" :rows="3"
                  :disabled="orderType == '3' || orderType == '4'"></Input>
              </FormItem>
              </Col>
              <!-- <Col :span="4" :offset="2">
              <FormItem label="已付金额: ">
                <span style="color:#ff6600;">{{(Number(proTotalPrice + order.freightCharge - order.discountAmount)).toFixed(2)}}</span>
              </FormItem>
            </Col> -->
            </Row>
            <!-- <Row class="normalTop">
              <Col :span="10">
                <FormItem label="采购备注" prop="remark">
                  <Input
                    v-model="order.remark"
                    type="textarea"
                    :rows="3"
                    :disabled="orderType == '3' || orderType == '4'"
                  ></Input>
                </FormItem>
              </Col>
              <template v-if="sourceType">
                <Col :span="10" :offset="2">
                  <FormItem label="买家留言" prop="buyerMessage">
                    <Input
                      v-model="order.buyerMessage"
                      type="textarea"
                      :rows="3"
                      :disabled="orderType == '3' || orderType == '4'"
                    ></Input>
                  </FormItem>
                </Col>
              </template>
            </Row> -->
            <div v-if="order.setupStatus == 1">
              <div style="font-size: 16px; font-weight: bold">1688信息</div>
              <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
              <Row class="normalTop">
                <Col :span="10">
                <FormItem label="下单方式：">
                  <RadioGroup v-model="order.applyType">
                    <Radio :label=0>
                      <span>1688供应商下单类型</span>
                    </Radio>
                    <Radio :label=1>
                      <span>未对接系统供应商下单类型</span>
                    </Radio>
                  </RadioGroup>
                </FormItem>
                </Col>
              </Row>
              <div v-if="order.applyType === 0">
                <Row class="normalTop">
                  <Col :span="4">
                  <FormItem label="1688账号：" prop="accountParamQO.accountId">
                    <dyt-select v-model="order.accountParamQO.accountId" filterable clearable placeholder="请选择"
                      @on-change="accountChange">
                      <Option v-for="item in (accountList[index] || [])" :key="item.accountId" :value="item.accountId">
                        {{ item.accountCode }}</Option>
                    </dyt-select>
                  </FormItem>
                  </Col>
                  <Col :span="4" :offset="2">
                  <template>
                    <FormItem label="1688订单：" prop="purchaseWarehouseName">
                      <dyt-select v-model="order.accountParamQO.orderType" filterable clearable placeholder="请选择">
                        <Option :value="0" label="大市场普通订单"> </Option>
                        <Option :value="1" label="代销市场订单"> </Option>
                      </dyt-select>
                    </FormItem>
                  </template>
                  </Col>
                </Row>
                <Row class="normalTop">
                  <Col :span="10">
                  <FormItem label="1688留言">
                    <Input v-model="order.accountParamQO.aliMessage" type="textarea" :rows="2"></Input>
                  </FormItem>
                  </Col>
                </Row>
                <Row class="normalTop">
                  <Col :span="10">
                  <FormItem label="采购备注">
                    <Input v-model="order.accountParamQO.purchaseMessage" type="textarea" :rows="2"
                      :disabled="orderType == '3' || orderType == '4'"></Input>
                  </FormItem>
                  </Col>
                </Row>
              </div>
            </div>

            <div class="product-defualt-head" v-if="order.readyType !== 5">
              <div class="product-info-title">采购定制</div>
              <div class="head-mian-content">
                <FormItem label="超发：" :label-width="100">
                  <Checkbox v-model="allowExceed[index]" :disabled="isDisabledExceed[index]">允许超发</Checkbox>
                  <span class="product-info-tips">注意：订单所有商品都有SKC编码，才能允许超发</span>
                </FormItem>
                <FormItem label="打印商品标签：" :label-width="100" class="form-item-line white-space-nowrap"
                  v-if="order.readyType === 4"
                  :rules="{ validator: formeItemTagType, trigger: 'change' }" prop="tagType">
                  <RadioGroup v-model="order.tagType" @on-change="tagTypeChange">
                    <Radio :label="0">LAPA标签</Radio>
                    <Radio :label="1">第三方标签</Radio>
                  </RadioGroup>
                  <div v-if="[1, '1'].includes(order.tagType)" class="superaddition-form-item">
                    <dytSelect v-model="selectOverseaTag[index]" placeholder="请选择第三方标签"
                      @on-change="formItemOverseaTagChange">
                      <Option v-for="(tag, tIndex) in Object.values(overseaTagList[index].platformAndAccountCodeArr || {})" :key="`tag-${tIndex}`"
                        :label="tag.label" :value="tag.value" />
                    </dytSelect>
                  </div>
                  <span class="product-info-tips">注意：订单所有商品都有选择第三方标签，才能选择</span>
                </FormItem>

                <FormItem label="来货特项：" :label-width="100">
                  <CheckboxGroup v-model="order.comingSpecialList">
                    <Checkbox :label="item.comingSpecialId" v-for="(item, index) in productTagList" :key="index">
                      {{ item.comingSpecial }}
                    </Checkbox>
                  </CheckboxGroup>
                </FormItem>
              </div>
            </div>

            <div class="product-info-head bottom-dashed">
              <div class="product-info-title">商品信息
                <div class="product-info-waterTips">
                  <span>提示：下单时，默认把商品的“水洗唛”成份加入需方备注</span>
                </div>
              </div>
            </div>
            <!-- <div style="display: flex; justify-content: flex-end">
            <span class="mr10">质检类型:</span>
            <RadioGroup v-model="order.checkType" @on-change="radioChange">
              <Radio label="0" class="mr20">免检</Radio>
              <Radio label="2" class="mr20" value="2">全检</Radio>
              <Radio label="1" class="mr20" value="3">抽检</Radio>
            </RadioGroup>
            <span
              style="
                color: #001ef5;
                text-decoration: underline;
                cursor: pointer;
              "
              class="mr20"
              v-if="order.checkType == '1'"
              @click="openSettingModal"
              >批量设置抽检数量</span
            >
            <span>质检总比例:</span>
            <span>{{ order.checkRateSum }}%</span>
          </div> -->
            <!-- <Row class="normalTop">
              <Col :span="8">
                <Button
                  type="primary"
                  @click="addProFn"
                  class="iconbuttons"
                  :disabled="orderType == '3' || orderType == '4'"
                  :loading="addLoading"
                >
                  添加商品
                </Button>
                <Button
                  type="primary"
                  @click="batchDelFn"
                  class="iconbuttons"
                  style="margin-left: 10px"
                  :disabled="orderType == '3' || orderType == '4'"
                >
                  批量删除
                </Button>
              </Col>
              <Col :span="3" :offset="6" style="line-height: 32px">
                <Checkbox
                  v-model="order.updateQuoteFlag"
                  :disabled="orderType == '3' || orderType == '4'"
                  >是否更新最新报价
                </Checkbox>
              </Col>
              <Col :span="4" :offset="1" style="line-height: 32px">
                <Checkbox
                  v-model="order.updateSupplierFlag"
                  :disabled="orderType == '3' || orderType == '4'"
                  >是否下单供应商设置为首选供应
                </Checkbox>
              </Col>
            </Row> -->
            <div class="sameStyleSearch normalTop">
              <Table max-height="450" highlight-row :columns="orderColumn" :data="order.detailsResultList" :border="true"
                @on-selection-change="getSelectValue">
                <template slot-scope="scope" slot="choose1688Product">
                  <Select v-model="orderList[orderIndex].detailsResultList[scope.index].platformSkuId"
                    style="width: 150px" clearable transfer>
                    <Option v-for="(item, index) in order.detailsResultList[scope.index].aliSku" :key="index"
                      :value="item.platformSkuId" :label="item.platformName">
                      <div style="display: flex">
                        <img class="img" :src="item.platformImage" alt="图片" style="width: 60px" />
                        <div style="margin-left: 5px">
                          <div> {{ item.platformName }} </div>
                          <div>{{ item.platformSupplierName }}</div>
                          <div>
                            <span v-if="item.skcs">{{ item.skcs[0].platformValue }}</span>
                            <span class="ml10" v-if="item.skcs">{{ item.skcs[1].platformValue }}</span>
                          </div>
                        </div>
                      </div>
                    </Option>
                  </Select>
                </template>
              </Table>
            </div>
            <!--<div class="table-page clear">
            <div class="table-page-right">
              <Page :total="order.detailsResultList.length" @on-change="proChangePage" show-total :page-size="proPage.pageSize" show-elevator :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>-->
          </Form>
        </div>

        <!-- </TabPane>
        </Tabs> -->
      </div>
      <Spin fix v-if="pageContentLoading"></Spin>
    </div>

    <!--添加商品-->
    <div v-if="isShowAddPro">
      <Modal v-model="isShowAddPro" :width="1100" title="添加商品" :styles="{ top: '50px' }" :mask-closable="false"
        class="addProductModal1 headerBar addProductBar">
        <addProduct :disabledSlt="false" :from="true" @addProductSuccess="addProductSuccess"
          @addProductCancel="addProductCancel" :eliminateData="proData"></addProduct>
      </Modal>
    </div>
    <Modal v-model="isShowCancelOrder" :width="420" class-name="vertical-center-modal" title="提示">
      <div class="cancel-order">确定取消当前采购单？</div>
      <div slot="footer">
        <Button type="primary" style="margin-right: 30px" @click="batchOperation('order', '1')"
          :loading="operationLoading_1">确定
        </Button>
        <Button type="primary" @click="isShowCancelOrder = false">取消</Button>
      </div>
    </Modal>
    <Modal v-model="settingModalVisible" :width="620" class-name="vertical-center-modal" title="提示">
      <div>批量设置规则:</div>
      <RadioGroup v-model="settingRule.radio1" vertical class="ml20 settingModal" @on-change="settingRuleChange">
        <Radio label="1" class="mt10">
          <span>相同SPU的产品，总抽检比例：</span>
          <Input v-model="settingRule.input1" style="width: 50px" ref="input1" @input="inputLimit('input1')"
            v-if="settingRule.radio1 == '1'" />
          <span class="ml10" v-if="settingRule.radio1 == '1'">%，四舍五入</span>
        </Radio>
        <Radio label="2" class="mt10">
          <span>每款产品（SKU），抽检比例：</span>
          <Input v-model="settingRule.input2" style="width: 50px" ref="input2" @input="inputLimit('input2')"
            v-if="settingRule.radio1 == '2'" />
          <span class="ml10" v-if="settingRule.radio1 == '2'">%，四舍五入</span>
        </Radio>
        <Radio label="3" class="mt10">
          <span>每款产品（SKU），抽检件数：</span>
          <Input v-model="settingRule.input3" style="width: 80px" ref="input3" @input="inputLimit('input3')"
            v-if="settingRule.radio1 == '3'" />
        </Radio>
      </RadioGroup>
      <div slot="footer">
        <Button type="primary" style="margin-right: 30px" :loading="operationLoading_1" @click="confirmCheckNumberRule">确定
        </Button>
        <Button type="primary" @click="settingModalVisible = false">取消</Button>
      </div>
    </Modal>
    <Modal v-model="dealModal" title="交易方式" width="520">
      <Table border :columns="columns1" :data="data1">
        <template slot-scope="scope" slot="dealWay">
          <Select v-model="data1[scope.index].tradeType" style="width: 100%" transfer>
            <Option v-for="(item, index) in scope.row.orderPreview" :key="index" :value="item.tradeType"
              :label="item.name"></Option>
          </Select>
        </template>
      </Table>
      <div slot="footer">
        <Button type="primary" @click="dealWayConfirm" :loading="saveLoading">确定
        </Button>
        <Button @click="cancelConfirm">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script >
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "@/components/common/addProduct";
import supplierChoose from '@/views/supplierPurchase/purchaseManagement/components/common/supplierChoose';

const previewType = {
  '款到发货': '担保交易',
  '阿里账期': '账期交易'
};

export default {
  name: "batchPurchaseOrder",
  // common_mixins 的 data 里定义了 purchaserArr，与组件的 props 中的 purchaserArr 重复（会报错），因此将其改为 purchaserArray
  // props: ['orderSource', 'orderType', 'orderData', 'purchaseWarehouseArr', 'purchaserArr'],
  props: [
    "orderSource",
    "orderType",
    "orderData",
    "purchaseWarehouseArr",
    "purchaserArray",
  ],
  components: { addProduct, supplierChoose },
  mixins: [Mixin],
  data() {
    // var self = this;
    return {
      allWeight: 0,
      goodsAmount: 0,
      orderIndex: "0",
      allowExceed: {},
      selectOverseaTag: {},
      overseaTagList: {},
      pageContentLoading: false,
      saveLoading: false,
      operationLoading_3: false,
      operationLoading_1: false,
      operationLoading_4: false,
      operationLoading_5: false,
      addLoading: false,
      isShowAddPro: false,
      proData: [],
      isShowCancelOrder: false,
      selectionArr: [],
      isDeliveryPay: false,
      order: {},
      proList: [],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      },
      sourceType: false, // 是否勾选1688商品
      purchaseAccountIdArr: [],
      supplierArr: [],
      currencyArr: [],
      cancelList: [],
      readyTypeList: [
        { value: 0, label: "急采" },
        { value: 1, label: "普通备货" },
        { value: 2, label: "海外仓备货" },
        { value: 3, label: "FBA备货" },
        { value: 4, label: "全托管备货" },
        { value: 5, label: "直发备货" },
      ],
      supplierTypeArr: [],
      settlementTypeArr: [],
      orderColumn: [],
      tableColumnObj: {
        skuNo: {
          key: "skuNo",
          align: "center",
          width: 240,
          title: "产品SKU/产品名称",
          render: (h, params) => {
            let spec = "";
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications.map((i) => i.name + ":" + i.value).join(",");
            }
            let link = params.row.goodsUrl;
            return h("div", { style: { display: "flex" } }, [
              h("div", {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                },
              }, [
                this.tableImg(h, params, "thumbUrl"),
                h("span", {
                  style: {
                    color: "#157CE9",
                    cursor: "pointer",
                  },
                  on: {
                    click() {
                      let productPic = params.row.thumbUrl;
                      this.goPicrtureUrl(productPic);
                    },
                  },
                }),
              ]),
              h("Row", {
                props: {
                  type: "flex",
                  justify: "start",
                  align: "middle",
                },
                style: {
                  paddingLeft: "10px",
                  textAlign: "left",
                },
              },
              [
                h("Col", {
                  props: {
                    span: 16,
                  },
                },
                [
                  h("p", `SKU: ${params.row.skuNo || ''}`),
                  h("p", `SKC: ${params.row.skc || ''}`),
                  h("p", params.row.goodsName),
                ]),
                  params.row.searchUrl ? h("Col", {
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
                      }, "同款搜货")
                  ]) : "",
                  h("p", {
                    style: {
                      color: "green",
                    },
                  }, spec),
                  link != null && link != "" ? h("Icon", {
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
                  }) : ""
              ])
            ]);
          },
        },
        relatedPlatformGoods: {
          key: "relatedPlatformGoods",
          align: "center",
          minWidth: 100,
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
          width: "90",
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
          minWidth: 90,
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
        requiredQuantity: {
          key: "requiredQuantity",
          align: "center",
          title: "需求数量",
          minWidth: 90,
          render: (h, params) => {
            if (
              params.row.requiredQuantity !== null &&
              params.row.requiredQuantity !== ""
            ) {
              return h("span", params.row.requiredQuantity);
            } else {
              return h("span", "-");
            }
          },
        },
        currentCost: {
          key: "currentCost",
          align: "center",
          title: "最近采购价",
          minWidth: 90,
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
          width: 120,
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                value: params.row.replenishQuantity,
                min: 0,
                max: 99999999,
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  return str;
                },
                disabled: this.orderType == "3" || this.orderType == "4",
              },
              on: {
                "on-change": (val) => {
                  this.orderList[
                    Number(this.orderIndex)
                  ].detailsResultList.forEach((n, i) => {
                    if (n.goodsId == params.row.goodsId) {
                      this.orderList[Number(this.orderIndex)].detailsResultList[
                        i
                      ].replenishQuantity = val;
                    }
                  });
                  this.countCheckRateSum();
                  this.calculateRateAndNum(params.index);
                },
              },
            });
          },
        },
        unitPrice: {
          key: "unitPrice",
          align: "center",
          title: "单价",
          width: 120,
          render: (h, params) => {
            return [
              h("InputNumber", {
                props: {
                  value: params.row.unitPrice,
                  min: 0,
                  max: 9999999,
                  step: 0.01,
                  formatter: (value) => {
                    let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                    return str;
                  },
                  disabled: this.orderType == "3" || this.orderType == "4",
                },
                on: {
                  "on-change": (val) => {
                    this.orderList[
                      Number(this.orderIndex)
                    ].detailsResultList.forEach((n, i) => {
                      if (n.goodsId == params.row.goodsId) {
                        this.orderList[
                          Number(this.orderIndex)
                        ].detailsResultList[i].unitPrice = val;
                      }
                    });
                  },
                },
              }),
            ];
          },
        },
        choose1688Product: {
          key: "choose1688Product",
          title: "选择1688商品",
          width: 180,
          slot: "choose1688Product",
        },
        checkSkuNumber: {
          key: "checkSkuNumber",
          align: "center",
          title: "应检数量",
          width: 100,
          render: (h, params) => {
            return h("span", params.row.checkSkuNumber);
            // return h("InputNumber", {
            //   props: {
            //     value: params.row.checkSkuNumber,
            //     min: 0,
            //     max: params.row.replenishQuantity,
            //     formatter: (value) => {
            //       let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
            //       str = `${value}`.replace(/[^\d]/g, ""); // 清除"数字"和"."以外的字符
            //       return str;
            //     },
            //     // disabled:
            //     //   this.orderList[this.orderIndex].checkType == "0" ||
            //     //   this.orderList[this.orderIndex].checkType == "2",
            //     disabled: true,
            //   },
            //   on: {
            //     input: (val) => {
            //       // params.row.checkSkuNumber = val;
            //       // this.$set(params.row, "checkSkuNumber", val);
            //       this.orderList[this.orderIndex].detailsResultList[
            //         params.index
            //       ].checkSkuNumber = val;
            //       this.countCheckRateSum();
            //     },
            //   },
            // });
          },
        },
        checkRate: {
          key: "availableStock",
          align: "center",
          minWidth: 90,
          title: "质检比例",
          render: (h, params) => {
            // let temp = (
            //   (params.row.checkSkuNumber * 100) /
            //   params.row.replenishQuantity
            // ).toFixed(0);
            // return h("span", `${temp}%`);
            return h("span", `${params.row.checkRate}%`);
          },
        },

        weight: {
          key: "weight",
          align: "center",
          title: "重量",
          width: 90,
        },
        operation: {
          key: "operation",
          align: "center",
          title: "操作",
          minWidth: 90,
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "dashed",
                  disabled: this.orderType == "3" || this.orderType == "4",
                },
                on: {
                  click: () => {
                    this.orderList[
                      Number(this.orderIndex)
                    ].detailsResultList.forEach((n, i) => {
                      if (n.goodsId == params.row.goodsId) {
                        this.orderList[
                          Number(this.orderIndex)
                        ].detailsResultList.splice(i, 1);
                      }
                    });
                    this.selectionArr = [];
                    this.$nextTick(() => {
                      const ids = this.orderList[Number(this.orderIndex)].detailsResultList.map(m => m.productGoodsId);
                      this.getthirdPartyTagList(ids, this.orderIndex);
                    })
                  },
                },
              },
              "删除"
            );
          },
        },
      },
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
        currency: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        readyType: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
        "accountParamQO.accountId": {
          required: true,
          message: "不能为空",
          trigger: "change",
        },
      },
      orderList: [],
      proTotalPrice: 0,

      //批量设置抽检对话框
      settingModalVisible: false,
      settingRule: {
        radio1: "1",
        input1: "",
        input2: "",
        input3: "",
      },
      inputExample: "",
      //交易方式
      dealModal: false,
      columns1: [
        {
          title: "供应商",
          key: "supplierName",
          maxWidth: 240
        },
        {
          title: "交易方式",
          key: "age",
          slot: "dealWay"
        },
      ],
      data1: [],
      accountList: {},
      accountAllList: [],
      testSelect: "",
      setupStatus: 2, //是否1688供应商
      isHasSetupStatus0: true, //orderlist是否含有setupStatus为0的
      singleSubmit1688: true,
      productTagList: [],
    };
  },
  created() {
    this.init();
    this.getProlist();
    this.getComingSpecialList();
  },
  mounted() { },
  watch: {
    orderIndex: {
      handler(val, oldVal) {
        this.proTotalPrice = this.orderList[
          this.orderIndex
        ].detailsResultList.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let unitPrice = n.unitPrice ? n.unitPrice : 0;
          return amount + replenishQuantity * unitPrice;
        }, 0);
        this.allWeight = this.orderList[
          this.orderIndex
        ].detailsResultList.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let weight = n.weight ? n.weight : 0;
          return amount + replenishQuantity * weight;
        }, 0);
        // orderIndex 改变则触发通过 supplierId 获取 SettlementType 和 SupplierType
        this.getSettlementTypeAndSupplierType();
      },
    },
    orderList: {
      handler(val, oldVal) {
        this.proTotalPrice = val[this.orderIndex].detailsResultList.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let unitPrice = n.unitPrice ? n.unitPrice : 0;
          return amount + replenishQuantity * unitPrice;
        }, 0);
        this.allWeight = val[this.orderIndex].detailsResultList.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let weight = n.weight ? n.weight : 0;
          return amount + replenishQuantity * weight;
        }, 0);
      },
      deep: true,
    },
    "order.detailsResultList": {
      handler: function (newVal, oldVal) {
        // let v = this;
        this.order.purchaserId = this.$.storestate.userInfo.userId; // 默认为当前操作人
        this.goodsAmount = 0;
        newVal.forEach((i) => {
          this.goodsAmount += i.unitPrice * i.replenishQuantity;
        });
        if (newVal.length == 0) {
          this.sourceType = false;
          this.order.type = 1;
        } else {
          let isAlibaba = false;
          let isNormal = false;
          this.order.type = 1;
          newVal.forEach((n, i) => {
            if (n.relationPlatform) {
              isAlibaba = true;
            } else {
              isNormal = true;
            }
          });
          if (!isAlibaba && isNormal) {
            // 普通下单
            this.sourceType = false;
            this.order.type = 1;
          } else if (isAlibaba && !isNormal) {
            // 1688下单
            this.sourceType = true;
            this.order.type = 2;
          } else if (isAlibaba && isNormal) {
            // 混合下单
            this.sourceType = true;
            this.order.type = 3;
          }
        }
      },
      deep: true,
    },
    proList: {
      handler: function (val, oldVal) {
        this.proTotalPrice = val.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let unitPrice = n.unitPrice ? n.unitPrice : 0;
          return amount + replenishQuantity * unitPrice;
        }, 0);
      },
      deep: true,
    },
    orderTagType: {
      immediate: true,
      handler(val) {
        if ([0, '0'].includes(val)) {
          this.$set(this.selectOverseaTag, this.orderIndex, '');
        }
      }
    },
    applyType: {
      handler: function (newVal, oldVal) {
        if (newVal === 1) {
          this.isHasSetupStatus0 = this.judegeisHasSetupstatus()
        }
        this.changeTableColumns();
      },
    },
    'comingSpecialChange': {
      handler(val, oldVal) {
        let item = this.orderList[this.orderIndex];
        if (!item) return;
        this.$set(this.orderList[this.orderIndex], 'comingSpecial', val.join(','));
      },
    }
  },
  computed: {
    // 供应商ID
    checkSupplierId() {
      if (this.$common.isEmpty(this.orderList[this.orderIndex])) return '';
      return this.orderList[this.orderIndex].supplierId;
    },
    orderTagType() {
      if (this.$common.isEmpty(this.orderList[this.orderIndex])) return null;
      return this.orderList[this.orderIndex].tagType;
    },
    // 登录人可查看事业部ID
    businessDeptIds() {
      if (this.$common.isEmpty(this.$store.getters["allowBusinessDeptIds"])) return '';
      return this.$store.getters["allowBusinessDeptIds"].join(',');
    },
    // 是否为 1688 供应商
    is1688Supplier() {
      if (this.$common.isEmpty(this.orderList[this.orderIndex]) || this.$common.isEmpty(this.orderList[this.orderIndex].setupStatus)) return false;
      // setupStatus 为 1 时是 1688
      return this.orderList[this.orderIndex].setupStatus == 1;
    },
    // 是否禁用超发按钮
    isDisabledExceed() {
      let isExceed = {};
      if (this.$common.isEmpty(this.orderData)) return isExceed;
      this.orderData.forEach((m, index) => {
        if (!this.$common.isEmpty(m.detailsResultList)) {
          isExceed[index] = !this.$common.isEmpty(m.detailsResultList.find(item => {
            return this.$common.isEmpty(item.skc);
          }));
        } else {
          isExceed[index] = true;
        }
      });
      return isExceed;
    },
    // 验证标签类型是否正确
    validateTagType() {
      if ([1, '1'].includes(this.orderList[this.orderIndex].tagType)) {
        const selectTag = this.selectOverseaTag[this.orderIndex];
        if (this.$common.isEmpty(selectTag)) {
          return false;
        }
      }
      return true;
    },
    applyType() {
      if (this.$common.isEmpty(this.orderList[this.orderIndex])) return null;
      return this.orderList[this.orderIndex].applyType;
    },
    comingSpecialChange() {
      let item = this.orderList[this.orderIndex] || {};
      return item.comingSpecialList || [];
    },
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        this.productTagList = list || [];
      })
    },
    init() {
      this.allowExceed = {};
      this.orderList = this.deepCopy(this.orderData).map((i, index) => {
        this.$set(this.selectOverseaTag, index, i.platformAndAccountCode || '');
        this.$set(this.overseaTagList, index, {});
        this.$set(this.accountList, index, []);
        this.$set(this.allowExceed, index, this.$common.isEmpty(i.overshootState) ? i.overshootState == 1 : false);
        i.tagType = 0;
        i.currency = i.currency ? i.currency : "CNY";
        i.detailsResultList.forEach((j) => {
          j.unitPrice = j.unitPrice ? j.unitPrice : 0;
          j.replenishQuantity = j.replenishQuantity ? j.replenishQuantity : 0;
          //应检数量初始0
          j.checkSkuNumber = j.planCheckNumber;
          j.checkSkuRate = j.checkRate;
        });
        i.checkRateSum = 0;
        i.planCheckNumber = 0;
        i.checkType = "1";
        i.comingSpecial = '';//来货特项
        i.comingSpecialList = [];//来货特项
        return i;
      });
      this.pageContentLoading = true;
      // 初始请求数据
      this.initBaseDataList().then(() => {
        this.getAlltabsSupplierGoodsUnitiPrice();
        this.isHasSetupStatus0 = this.judegeisHasSetupstatus();
        this.matchDefaultProduct();
        // 表格列设置
        this.$nextTick(() => {
          this.supplierIdChangeFn(this.checkSupplierId);
          this.pageContentLoading = false;
        })
        this.orderList.forEach((item, index) => {
          const detailsResultGoodsIds = (item.detailsResultList || []).map(m => m.productGoodsId);
          this.getthirdPartyTagList(detailsResultGoodsIds, index)
        })

      }).catch(() => {
        this.pageContentLoading = false;
      })
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
    // 获取页面需要的数据
    initBaseDataList() {
      return new Promise((resolve) => {
        this.$common.promiseAll([
          // 获取供应商信息
          () => this.purchaseSupplierData,
          // 供应商类型
          () => this.supplierType,
          // 货币下拉列表
          () => this.currencyType,
          // 获取1688账号
          () => this.getAccount,
        ]).then((list) => {
          resolve(list);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 判断当前商品是否都存在第三方标签
    checkHasOverseaTag(orderList, changeIndex, tips) {
      const detailsResultGoodsIds = orderList.map(m => m.detailsResultList.map(m => m.productGoodsId));
      detailsResultGoodsIds.forEach((goodsIds,index) => {
        let newId = this.selectOverseaTag[this.$common.isEmpty(changeIndex) ? index : changeIndex];
        newId = this.sliceStr(newId, '-', 2)
        if (this.$common.isEmpty(newId)) {
          return;
        }
        this.axios.post(api.checkNewOverseaTag, {
          productGoodsIdList: goodsIds,
          saleAccountId: newId
        }).then((res) => {
          if(res.data.code === 0) {
            if(!res.data.datas){
              this.$Message.error('此第三方标签不能选择，有商品没有匹配到第三方标签资料')
              this.$set(this.selectOverseaTag, this.$common.isEmpty(changeIndex) ? index : changeIndex, '');
            }
          }
        }).catch(() => {
        })
      })
    },
    // 获取第三方标签数据
    getthirdPartyTagList(ids, index) {
      this.orderData.forEach((item,oIndex) => {
        let platformAndAccountCodeArr =  item.platformAndAccountCodeArr.split(',')
        platformAndAccountCodeArr = platformAndAccountCodeArr.map(item => {
          let result = this.sliceStr(item, '-', 2, 0)
          return {
            value:item,
            label:result
          }
        })
        this.$set(this.overseaTagList[oIndex], 'platformAndAccountCodeArr', platformAndAccountCodeArr);
      })
      this.$nextTick(() => {
        this.checkHasOverseaTag([this.orderList[index]], index, false)
      })
    },
    // 获取供应商信息
    purchaseSupplierData() {
      return new Promise((resolve) => {
        this.axios.post(api.purchaseSupplierData).then((res) => {
          if (res.data && res.data.code == 0) {
            this.supplierArr = res.data.datas;
            const hasSupplierId = !this.supplierArr.map((j) => j.supplierId).includes(this.orderList[this.orderIndex].supplierId);
            if (this.orderList[this.orderIndex].supplierId && hasSupplierId) {
              // 供应商停用
              this.orderList[this.orderIndex].supplierId = "";
            }
            this.getSettlementTypeAndSupplierType();
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        });
      })
    },
    // 供应商类型
    supplierType() {
      return new Promise((resolve) => {
        this.axios.get(api.baseDataList + "?dataType=" + "supplierType").then((res) => {
          if (res.data && res.data.code == 0) {
            this.supplierTypeArr = res.data.datas;
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        });
      })
    },
    // 货币下拉列表
    currencyType() {
      return new Promise((resolve) => {
        this.axios.get(api.baseDataList + "?dataType=currencyType").then((res) => {
          if (res.data && res.data.code == 0) {
            this.currencyArr = res.data.datas;
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        });
      })
    },
    // 获取1688账号
    getAccount() {
      return new Promise((resolve) => {
        this.axios.post(`${api.postQueryAccount}?businessDeptIds=${this.businessDeptIds}`).then((res) => {
          if (res.data && res.data.code == 0) {
            this.accountAllList = res.data.datas || [];
            this.orderList.forEach((item, index) => {
              if (this.$common.isEmpty(item.businessDeptId)) {
                this.$set(this.accountList, index, res.data.datas || []);
              } else {
                const businessDeptId = (item.businessDeptId.toString()).split(',');
                this.$set(this.accountList, index, (res.data.datas || []).filter(f => {
                  if (this.$common.isEmpty(f.accountParam)) return false;
                  const getInfo = f.accountParam.find(search => search.paramKey === 'businessDeptIds');
                  if (this.$common.isEmpty(getInfo)) return false;
                  const getValue = getInfo.paramValue.split(',');
                  const isHas = getValue.find(p => businessDeptId.includes(p))
                  return !this.$common.isEmpty(isHas);
                }));
              }
            });
          }
          resolve(res);
        }).catch((error) => {
          console.error(error);
          resolve({});
        });
      })
    },
    // 表格列处理
    changeTableColumns() {
      this.orderColumn = [];
      const newCol = this.$common.copy(this.tableColumnObj);
      // 不是1688订单或混合订单不显示1688属性
      if (this.order.type != 2 && this.order.type != 3) {
        delete newCol.relatedPlatformGoods;
      }
      // 不是需求下单不显示需求数量
      if (this.orderSource != "1") {
        delete newCol.requiredQuantity;
      }
      if (!this.is1688Supplier || this.orderList[this.orderIndex].applyType === 1) {
        // 不是 1688 时，移除 1688 列
        delete newCol.choose1688Product;
      }
      this.orderColumn = Object.values(newCol);
    },
    supplierIdChangeFn (val) {
      this.judge1688Supplier(val);
      this.getSettlementTypeAndSupplierType();
      this.getAllSupplierGoodsUnitiPrice(this.orderIndex);
    },
    getAlltabsSupplierGoodsUnitiPrice() {
      // let v = this;
      // let length = this.orderList.length;
      for (let i = 0; i < this.orderList.length; i++) {
        this.getAllSupplierGoodsUnitiPrice(i);
      }
    },
    getAllSupplierGoodsUnitiPrice(index) {
      // 获取供应商报价
      // let v = this;
      let params = {};
      params.supplierId = this.orderList[index].supplierId;
      if (this.orderList[index].detailsResultList.length === 0) return;
      params.supplierGoodsBos = this.orderList[index].detailsResultList.map(
        (i) => {
          return {
            goodsIds: i.goodsId,
            requiredQuantity: i.backupQuantity || i.requiredQuantity || 0,
          };
        }
      );
      this.axios.post(api.get_SupplierGoodsUnitiPrice, params).then((response) => {
        if (response.data.code === 0) {
          this.orderList[index].detailsResultList.forEach((i) => {
            response.data.datas.forEach((j) => {
              if (i.goodsId === j.goodsId) {
                i.inquiryCode = j.inquiryCode
                i.unitPrice = j.unitiPrice;
              }
            });
          });
        }
      });
    },
    currencyChangeFn(value) {
      this.order.currency = value;
    },
    getSettlementTypeAndSupplierType() {
      // let v = this;
      this.supplierArr.forEach((n, i) => {
        this.orderList.forEach((itemb) => {
          if (n.supplierId == itemb.supplierId) {
            itemb.settlementType = n.settlementType;
            itemb.settlementTypeName = n.settlementTypeName;
            itemb.settleTypeName = n.settlementTypeName;
            itemb.supplierType = n.supplierType;
            itemb.supplierTypeName = n.supplierTypeName;
          }
        });
        // if (n.supplierId == this.orderList[this.orderIndex].supplierId) {
        //   this.orderList[this.orderIndex].settlementType = n.settlementType;
        //   this.orderList[this.orderIndex].settlementTypeName =
        //     n.settlementTypeName;
        //   this.orderList[this.orderIndex].supplierType = n.supplierType;
        //   this.orderList[this.orderIndex].supplierTypeName = n.supplierTypeName;
        // }
      });
    },
    typeChange(val) {
      // let v = this;
      if (!val) {
        this.order.type = 1;
      } else {
        let isAlibaba = false;
        let isNormal = false;
        if (this.order.detailsResultList.length > 0) {
          this.order.detailsResultList.forEach((n, i) => {
            if (n.relationPlatform) {
              isAlibaba = true;
            } else {
              isNormal = true;
            }
          });
          if (isAlibaba && !isNormal) {
            this.order.type = 2;
          } else if (isAlibaba && isNormal) {
            this.order.type = 3;
          }
        }
      }
    },
    payChange() {
      this.order.freightCharge = 0;
    },
    addProFn() {
      // let v = this;
      if (!this.orderList[this.orderIndex].purchaseWarehouseId) {
        this.$Message.warning("请先选择采购仓库！！");
      } else {
        this.isShowAddPro = true;
      }
    },
    proChangePageSize(pageSize) {
      this.proPage.pageSize = pageSize;
      this.getProlist();
    },
    proChangePage(page) {
      this.proPage.pageNum = page;
      this.getProlist();
    },
    getProlist() {
      // 获取分页数据
      // let v = this;
      this.selectSkuArr = [];
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
    },
    batchDelFn() {
      // let v = this;
      if (this.selectionArr.length == 0) {
        this.$Message.error("请选择需要删除的商品！");
      } else {
        let length = this.orderList[this.orderIndex].detailsResultList.length;
        while (length--) {
          if (
            this.selectionArr
              .map((i) => i.goodsId)
              .includes(
                this.orderList[this.orderIndex].detailsResultList[length]
                  .goodsId
              )
          ) {
            this.orderList[this.orderIndex].detailsResultList.splice(length, 1);
          }
        }
      }
    },
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addProductSuccess(data) {
      // let v = this;
      this.skuLoading = true;
      let obj = {
        purchaseWarehouseId:
          this.orderList[Number(this.orderIndex)].purchaseWarehouseId,
        goodsInfoList: [],
        readyType: this.orderList[Number(this.orderIndex)].readyType,
      };
      data.forEach((n, i) => {
        obj.goodsInfoList.push({
          cnName: n.cnName,
          goodsId: n.productGoodsId,
          goodsUrl: n.goodsUrl,
          sku: n.sku,
        });
      });
      this.axios.post(api.purchaseQueryGoodsInfo, obj).then((res) => {
        if (res.data.code == 0) {
          res.data.datas.forEach((m, j) => {
            let exist = false;
            this.orderList[Number(this.orderIndex)].detailsResultList.forEach(
              (l, k) => {
                if (m.goodsId == l.goodsId) {
                  // 当前商品已存在时，下单数量+1
                  this.orderList[Number(this.orderIndex)].detailsResultList[k]
                    .replenishQuantity++;
                  exist = true;
                }
              }
            );
            if (!exist) {
              // 当前商品不存在时，新增一条数据
              this.orderList[Number(this.orderIndex)].detailsResultList.push(
                Object.assign(m, {
                  replenishQuantity: 1,
                  unitPrice: 0,
                  onPassageQuantity: m.onWayQuantity,
                })
              );
            }
          });
        }
        this.skuLoading = false;
        this.getProlist();
        this.getAllSupplierGoodsUnitiPrice(this.orderIndex);
        this.isShowAddPro = false;
      });
    },
    batchOperation(name, type) {
      let v = this;
      let qtyError = this.order.detailsResultList.some(
        (item) => item.replenishQuantity == 0
      ); // 判断下单数量是否等于0
      let priceError = this.order.detailsResultList.some(
        (item) => item.unitPrice == 0
      ); // 判断价格是否等于0
      if (qtyError) {
        this.$Message.error("下单数量不能为0");
        return;
      }
      if (priceError) {
        this.$Message.error("价格不能为0");
        return;
      }
      this.$refs[name].validate((valid) => {
        // 校验通过后执行
        if (valid) {
          let obj = {
            operationType: type,
            purchaseIdList: [this.order.purchaseId],
          };
          v["operationLoading_" + type] = true;
          this.axios.post(api.purchaseOperation, obj).then((res) => {
            v["operationLoading_" + type] = false;
            if (res.data.code == 0) {
              this.$Message.success("操作成功");
              this.$emit("addOrderGoBack", this.$store.state.thisPage);
            }
          });
        }
      });
    },
    cancelAction() {
      // 取消
      this.$emit("goBackFromAdd");
    },
    validFn() {
      let valid = true;
      let str = '';
      this.orderList.forEach((i, index) => {
        if (i.detailsResultList.length === 0) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}请添加商品！</p>`;
          valid = false;
        } else {
          i.detailsResultList.forEach((j) => {
            if (j.replenishQuantity < 1 || j.unitPrice <= 0) {
              str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}商品请填写下单数量和价格</p>`;
              valid = false;
            }
            if (!j.platformSkuId && i.setupStatus == 1) {
              str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}请选择1688商品</p>`;
              valid = false;
              if (i.applyType === 1) {
                str = null
                valid = true;
              }
            }
          });
        }
        if (!i.purchaserId) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}采购人不能为空</p>`;
          valid = false;
        }
        if (!i.purchaseWarehouseId) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}采购仓库不能为空</p>`;
          valid = false;
        }
        if (!i.accountParamQO.accountId && i.setupStatus == 1) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}1688账号不能为空</p>`;
          valid = false;
          if (i.applyType === 1) {
            str = null
            valid = true;
          }
        }
        if ([1, '1'].includes(i.tagType) && this.$common.isEmpty(this.selectOverseaTag[index])) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}第三方标签不能为空</p>`;
          valid = false;
        }
        if (!valid) {
          // 如果校验失败，将当前失败采购单加入该数组
          this.cancelList.push(i)
        }
        if (str) {
          this.$Message.error({
            content: `<div style="display: inline-block;text-align: left">${str}</div>`,
            duration: 5,
            closable: true,
          });
        }
      });
      return {
        valid: valid,
        errText: `<div style="display: inline-block;text-align: left">${str}</div>`
      };
    },
    validFnDefault() {
      // let v = this;
      let valid = true;
      this.orderList.forEach((i,index) => {
        let str = "";
        if (i.detailsResultList.length === 0) {
          let s =
            i.supplierName + "-" + i.purchaseWarehouseName + "请添加商品！";
          str += "<p>" + s + "</p>";
          valid = false;
        } else {
          i.detailsResultList.forEach((j) => {
            if (j.replenishQuantity < 1 || j.unitPrice <= 0) {
              let s =
                i.supplierName +
                "-" +
                i.purchaseWarehouseName +
                "商品请填写下单数量和价格";
              str += "<p>" + s + "</p>";
              valid = false;
            }
          });
        }
        if (!i.purchaserId) {
          let s1 =
            i.supplierName + "-" + i.purchaseWarehouseName + "采购人不能为空";
          str += "<p>" + s1 + "</p>";
          valid = false;
        }
        if (!i.purchaseWarehouseId) {
          let s1 =
            i.supplierName + "-" + i.purchaseWarehouseName + "采购仓库不能为空";
          str += "<p>" + s1 + "</p>";
          valid = false;
        }
        if ([1, '1'].includes(i.tagType) && this.$common.isEmpty(this.selectOverseaTag[index])) {
          str += `<p>${i.supplierName || ''}-${i.purchaseWarehouseName || ''}第三方标签不能为空</p>`;
          valid = false;
        }
        if (!valid) {
          // 如果校验失败，将当前失败采购单加入该数组
          this.cancelList.push(i)
        }
        if (str) {
          this.$Message.error({
            content:
              '<div style="display: inline-block;text-align: left">' +
              str +
              "</div>",
            duration: 5,
            closable: true,
          });
        }
      });
      return valid;
    },
    //批量提交
    batchSaveAction(name) {
      if (this.validFnDefault()) {
        let orderList = this.$common.copy(this.orderList);
        orderList.forEach((i, index) => {
          if (i.setupStatus === 0) {
            i.applyType = 1
          }
          let temp = [
            {
              remark: orderList[index].remark,
            },
          ];
          i.isDeliveryPay = i.isDeliveryPay ? 1 : 0;
          i.updateQuoteFlag = i.updateQuoteFlag ? 1 : 0;
          i.updateSupplierFlag = i.updateSupplierFlag ? 1 : 0;
          if (this.allowExceed[index]) {
            this.$set(orderList[index], 'overshootState', 1);
          }
          if (!this.$common.isEmpty(this.selectOverseaTag[index])) {
            this.$set(orderList[index], 'platformAndAccountCode', this.selectOverseaTag[index]);
          }
          this.$set(orderList[index], 'remarks', temp);
          i.detailsResultList.forEach((i) => {
            i.requiredQuantity = i.backupQuantity;
          });
          // i.comingSpecial = i.comingSpecial.join(',');
        });
        let apiUrl = api.applyOrders;
        if (name === "1") {
          // 保存至待提交
          apiUrl = api.submitBatch;
        }
        this.countCheckSkuRate(orderList);

        this.saveLoading = true;
        this.$Spin.show();
        this.axios.post(apiUrl, orderList).then((res) => {
          if (res.data.code == 0) {
            if (res.data.datas.fail === 0) {
              this.$Message.success("操作成功");
              //批量提交里有普通流程的,返回
              let applyTypeList = this.orderList.map(item => item.applyType)

              if ([1].includes(this.judegeOrderListSetupstatus()) && applyTypeList.includes(0)) {
                this.orderList = this.orderList.filter((item) => {
                  return item.setupStatus == 1 && item.applyType == 0;
                });
                return;
              }
              this.$emit("addOrderGoBack", this.$store.state.thisPage);
            } else {
              let arr = [];
              this.orderList.forEach((i) => {
                for (let key in res.data.datas.error) {
                  if (key + "" === i.supplierId + "_" + i.purchaseWarehouseId) {
                    arr.push(i);
                  }
                }
              });
              this.orderList = [];
              this.orderList = arr;
              this.orderIndex = "0";
              if (res.data.datas.success > 0) {
                this.$Message.success("提交成功" + res.data.datas.success + "个");
              }
              this.$Message.error("提交失败" + res.data.datas.fail + "个");
            }
          }
          this.saveLoading = false;
          this.$Spin.hide();
        }).catch(() => {
          this.saveLoading = false;
          this.$Spin.hide();
        });
      } else {
        if (this.cancelList.length > 0) {
          let cancelList = this.cancelList.map(item => {
            return {
              purchaseWarehouseId: item.purchaseWarehouseId,
              supplierId: item.supplierId
            }
          })
          return this.$Modal.confirm({
            title: '提示(采购单提交异常)',
            content: `是否跳过 ${this.cancelList[0].supplierName}-${this.cancelList[0].purchaseWarehouseName} 采购单`,
            okText: '跳过异常',
            onOk: () => {
              if (this.orderList.length === 1) {
                return this.$emit('goBackFromAdd')
              }
              const resultArr = this.orderList.filter(item => {
                return (item.purchaseWarehouseId !== cancelList[0].purchaseWarehouseId) || (item.supplierId !== cancelList[0].supplierId)
              })
              this.orderList = resultArr
              // 由于删除之后orderIndex可能会比orderList的长度要长，会有Bug
              if (this.orderList.length - 1 < this.orderIndex) {
                this.clickItem(this.orderIndex - 1)
              }
              this.cancelList = []
            },
            onCancel: () => {
              this.cancelList = []
            }
          });

        }
        this.saveLoading = false;
        this.$Spin.hide();
      }
    },
    /**
     * @Description: 获取1688搜同款的链接
     * @author jing
     * @date: 2020/9/18 10:52
     * @params: 图片 url
     */
    goPicrtureUrl(url) {
      // let v = this;
      this.axios.get(api.get_samePic + "?imgUrl=" + url).then((response) => {
        if (response.datas) {
          window.open(response.datas);
        }
      });
    },
    //新增方法
    radioChange() {
      //免检
      if (this.orderList[this.orderIndex].checkType == "0") {
        this.orderList[this.orderIndex].detailsResultList.forEach(
          (item, index) => {
            item.checkSkuNumber = 0;
            item.checkSkuRate = 0;
          }
        );
        this.orderList[this.orderIndex].checkRateSum = 0;
      }

      //全检
      if (this.orderList[this.orderIndex].checkType == "2") {
        //应捡=下单数
        this.orderList[this.orderIndex].detailsResultList.forEach(
          (item, index) => {
            item.checkSkuNumber = item.replenishQuantity;
            item.checkSkuRate = 100;
          }
        );
        this.orderList[this.orderIndex].checkRateSum = 100;
      }
    },
    //批量设置确认
    confirmCheckNumberRule() {
      if (this.settingRule.radio1 == "2") {
        this.orderList[this.orderIndex].detailsResultList.forEach((item) => {
          item.checkSkuNumber = parseFloat(
            ((item.replenishQuantity * this.settingRule.input2) / 100).toFixed(
              0
            )
          );
        });
        this.countCheckRateSum();
      }
      if (this.settingRule.radio1 == "3") {
        let isContinue = true;
        this.orderList[this.orderIndex].detailsResultList.forEach((item) => {
          if (item.replenishQuantity < parseFloat(this.settingRule.input3)) {
            isContinue = false;
          }
        });
        if (!isContinue) {
          return this.$Message.warning("抽检件数不得大于下单数量");
        }
        this.orderList[this.orderIndex].detailsResultList.forEach((item) => {
          item.checkSkuNumber = parseFloat(this.settingRule.input3);
        });
        this.countCheckRateSum();
      }
      //抽检
      if (this.settingRule.radio1 == "1") {
        let spuList = [
          ...new Set(
            this.orderList[this.orderIndex].detailsResultList.map((item) => {
              return item.spu;
            })
          ),
        ];
        //根据相同spu分为一组
        let spuArr = [];
        spuList.forEach((itema) => {
          let arr = [];
          this.orderList[this.orderIndex].detailsResultList.forEach((itemb) => {
            if (itemb.spu == itema) {
              arr.push(itemb);
            }
          });
          spuArr.push(arr);
        });
        spuArr.forEach((item) => {
          this.countDemo(item, this.settingRule.input1);
        });
        this.countCheckRateSum();
      }
      this.settingModalVisible = false;
    },
    countDemo(array, confirmSpuRate) {
      array.forEach((item) => {
        item.isContinue = 0;
      });
      let sum = 0;
      sum = array
        .map((item) => {
          return item.replenishQuantity;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      let sumCheck = ((sum * confirmSpuRate) / 100).toFixed(0);
      //1.先用质检比例*下单数
      array.forEach((item) => {
        item.checkSkuNumber = item.replenishQuantity * (confirmSpuRate / 100);
      });
      //2.有小数向下四舍五入，整数不做处理但isContinue为1
      array.forEach((item) => {
        if (item.checkSkuNumber % 1 === 0) {
          item.isContinue = 1;
        } else {
          item.checkSkuNumber = Math.floor(item.checkSkuNumber);
        }
      });
      let restCheck =
        sumCheck -
        array
          .map((item) => {
            return item.checkSkuNumber;
          })
          .reduce((pre, cur) => {
            return pre + cur;
          });
      if (restCheck == 0) return;
      let test = function (array, restCheck) {
        //可以循环的skuIndex列表,isContinue为1的不循环
        let randomIndexList = array
          .map((item, index) => {
            if (item.isContinue == 0) return index;
          })
          .filter((item) => {
            return item != undefined;
          });
        //筛选出的randomIndex
        let randomIndex =
          randomIndexList[Math.floor(Math.random() * randomIndexList.length)];
        //选出的的那一个sku质检数+1，然后不再进行循环(isContinue为1)
        array[randomIndex].checkSkuNumber =
          array[randomIndex].checkSkuNumber + 1;
        array[randomIndex].isContinue = 1;
        //循环一次剩余数-1
        restCheck = restCheck - 1;
        //当剩余数为0时推出
        if (restCheck != 0) {
          test(array, restCheck);
        }
      };
      test(array, restCheck);
    },

    //计算质检总比例
    countCheckRateSum() {
      //总下单数
      let replenishQuantity = this.orderList[this.orderIndex].detailsResultList
        .map((item) => {
          return item.replenishQuantity;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      //总质检数
      let checkSkuNumber = this.orderList[this.orderIndex].detailsResultList
        .map((item) => {
          return item.checkSkuNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      this.orderList[this.orderIndex].checkRateSum = (
        (checkSkuNumber * 100) /
        replenishQuantity
      ).toFixed(0);
    },
    //计算sku质检比例
    countCheckSkuRate(orderList) {
      orderList.forEach((itema) => {
        itema.detailsResultList.forEach((itemb) => {
          itemb.checkSkuRate = ((itemb.checkSkuNumber * 100) / itemb.replenishQuantity).toFixed(0);
        });
      });
    },

    validateNumber() {
      let isAllZero = true;
      let isAllReplenishQuantity = true;
      this.orderList.forEach((itema) => {
        //抽检
        if (itema.checkType == "1") {
          //抽检:应检数量不为0
          itema.detailsResultList.forEach((itemb) => {
            if (itemb.checkSkuNumber != 0) isAllZero = false;
            if (itemb.checkSkuNumber != itemb.replenishQuantity) {
              isAllReplenishQuantity = false;
            }
          });
        }
      });
      if (isAllZero || isAllReplenishQuantity) {
        this.$Message.warning(
          "质检类型为抽检时，应检数量不能都为0或都为下单数量"
        );
        return false;
      } else {
        return true;
      }
    },
    openSettingModal() {
      (this.settingRule = {
        radio1: "1",
        input1: "",
        input2: "",
        input3: "",
      }),
      (this.settingModalVisible = true);
      this.$nextTick(() => {
        this.$refs["input1"].$refs.input.focus();
      });
    },
    inputLimit(data) {
      this.settingRule[data] = this.settingRule[data].replace(/[^\d]/g, "");
      if (data != "input3" && this.settingRule[data] > 100) {
        this.$nextTick(() => {
          this.settingRule[data] = 100;
        });
      }
    },
    settingRuleChange(val) {
      let temp = "input" + val;
      this.$nextTick(() => {
        this.$refs[temp].$refs.input.focus();
      });
    },
    clickItem(index) {
      this.orderIndex = index + "";
      this.supplierIdChangeFn(this.checkSupplierId);
      this.changeTableColumns();
    },
    //单个提交
    singleSubmit() {
      let temp = this.$common.copy(this.orderList[this.orderIndex]);
      temp.isDeliveryPay = temp.isDeliveryPay ? 1 : 0;
      temp.updateQuoteFlag = temp.updateQuoteFlag ? 1 : 0;
      temp.updateSupplierFlag = temp.updateSupplierFlag ? 1 : 0;
      temp.detailsResultList.forEach((i) => {
        i.requiredQuantity = i.backupQuantity;
      });
      temp.remarks = [{ remark: temp.remark }];
      if (this.allowExceed[this.orderIndex]) {
        temp.overshootState = 1;
      }
      if (!this.$common.isEmpty(this.selectOverseaTag[this.orderIndex])) {
        temp.platformAndAccountCode = this.selectOverseaTag[this.orderIndex];
      }
      temp.comingSpecial = temp.comingSpecial.join(',');
      this.axios.post(api.applyOrders, [temp]).then((res) => {
        this.orderList.splice(this.orderIndex, 1);
        this.$Message.success("操作成功");
        if (!this.orderList[this.orderIndex]) {
          this.orderIndex = 0;
        }
        if (this.orderList.length == 0) {
          this.$emit("addOrderGoBack", this.$store.state.thisPage);
        }
      });
    },
    //单个保存
    singleSave() {
      let temp = this.$common.copy(this.orderList[this.orderIndex]);
      temp.isDeliveryPay = temp.isDeliveryPay ? 1 : 0;
      temp.updateQuoteFlag = temp.updateQuoteFlag ? 1 : 0;
      temp.updateSupplierFlag = temp.updateSupplierFlag ? 1 : 0;
      temp.detailsResultList.forEach((i) => {
        i.requiredQuantity = i.backupQuantity;
      });
      temp.remarks = [{ remark: temp.remark }];
      if (this.allowExceed[this.orderIndex]) {
        temp.overshootState = 1;
      }
      if (!this.$common.isEmpty(this.selectOverseaTag[this.orderIndex])) {
        // temp.platformAndAccountCode = this.selectOverseaTag[this.orderIndex];
        this.orderList[this.orderIndex].platformAndAccountCode = this.selectOverseaTag[this.orderIndex];
      }
      if (!this.validateTagType) {
        return this.$Message.error('请选择第三方标签');
      }
      if (this.is1688Supplier) {
        this.singleSubmit1688 = true;
        //判断是否填写1688账号 && 判断下单方式
        if (!this.orderList[this.orderIndex].accountParamQO.accountId && this.orderList[this.orderIndex].applyType === 0) {
          return this.$Message.error("请填写1688账号");
        }
        //判断是否选择1688商品
        const valid = this.orderList[this.orderIndex].detailsResultList.find(item => {
          return this.$common.isEmpty(item.platformSkuId);
        });
        if (!this.$common.isEmpty(valid)) {
          return this.$Message.error("请选择1688商品");
        }
        return this.singleOpenDealWay();
      }
      this.axios.post(api.submitBatch, [temp]).then((res) => {
        this.orderList.splice(this.orderIndex, 1);
        this.$Message.success("操作成功");
        if (!this.orderList[this.orderIndex]) {
          this.orderIndex = 0;
        }
        if (this.orderList.length == 0) {
          this.$emit("addOrderGoBack", this.$store.state.thisPage);
        }
      });
    },
    cancelOrder() {
      this.orderList.splice(this.orderIndex, 1);
    },
    calculateRateAndNum(index) {
      let temp = this.orderList[this.orderIndex].detailsResultList[index];
      temp.checkSkuNumber = parseInt(
        ((temp.replenishQuantity * temp.checkRate) / 100).toFixed(0)
      );
    },
    //批量保存至待提交
    batchWaitSave() {
      //只有普通订单
      if (this.judegeOrderListSetupstatus() == 0) {
        return this.saveAction("1");
      }
      this.openDealWayModal();
    },
    //打开交易方式对话框
    openDealWayModal() {
      this.singleSubmit1688 = false;
      //判断是否1688订单
      const validErr = this.validFn();
      if (validErr.valid) {
        let orderList = this.$common.copy(this.orderList);
        orderList.forEach((i, index) => {
          if (i.setupStatus === 0) {
            i.applyType = 1
          }
          let temp = [
            { remark: orderList[index].remark },
          ];
          i.isDeliveryPay = i.isDeliveryPay ? 1 : 0;
          i.updateQuoteFlag = i.updateQuoteFlag ? 1 : 0;
          i.updateSupplierFlag = i.updateSupplierFlag ? 1 : 0;
          if (this.allowExceed[index]) {
            this.$set(orderList[index], 'overshootState', 1);
          }
          if (!this.$common.isEmpty(this.selectOverseaTag[index])) {
            this.$set(orderList[index], 'platformAndAccountCode', this.selectOverseaTag[index]);
          }
          this.$set(orderList[index], 'remarks', temp);
          i.detailsResultList.forEach((i) => {
            i.requiredQuantity = i.backupQuantity;
          });
        });
        this.countCheckSkuRate(orderList);
        this.axios.post(api.createOrderPreview, orderList).then((res) => {
          const isAllNormalSupplier = orderList.map(item => item.applyType)
          // 如果下单方式存在1688供应商下单类型，则进入交易窗口
          if (isAllNormalSupplier.includes(0)) {
            this.dealModal = true;
            if (res && res.data && res.data.datas) {
              if (!this.$common.isEmpty(res.data.datas.fail) && res.data.datas.fail > 0) {
                this.getDealWayError(res.data.datas.error);
              }
              this.data1 = (res.data.datas.data || []).map((item) => {
                if (!this.$common.isEmpty(previewType[item.settlementTypeName])) {
                  const selectType = item.orderPreview.find(f => f.name === previewType[item.settlementTypeName]);
                  if (!this.$common.isEmpty(selectType)) {
                    item.tradeType = selectType.tradeType;
                  }
                }
                item.orderPreview = item.orderPreview.filter((preview) => {
                  return preview.opSupport;
                });
                return item;
              })
            }
          }
          else {
            // 如果都为未对接供应商下单类型，则直接提示操作成功
            this.$emit("addOrderGoBack", this.$store.state.thisPage);
            return this.$Message.success("操作成功");
          }
        })
      }
      if (this.cancelList.length > 0) {
        let cancelList = this.cancelList.map(item => {
          return {
            purchaseWarehouseId: item.purchaseWarehouseId,
            supplierId: item.supplierId
          }
        })
        return this.$Modal.confirm({
          title: '提示(采购单提交异常)',
          content: `是否跳过 ${this.cancelList[0].supplierName}-${this.cancelList[0].purchaseWarehouseName} 采购单`,
          width: '600px',
          // content: validErr.errText,
          okText: '跳过异常',
          onOk: () => {
            if (this.orderList.length === 1) {
              return this.$emit('goBackFromAdd')
            }
            const resultArr = this.orderList.filter(item => {
              return (item.purchaseWarehouseId !== cancelList[0].purchaseWarehouseId) || (item.supplierId !== cancelList[0].supplierId)
            })
            this.orderList = resultArr
            // 由于删除之后orderIndex可能会比orderList的长度要长，会有Bug
            if (this.orderList.length - 1 < this.orderIndex) {
              this.clickItem(this.orderIndex - 1)
            }
            this.cancelList = []
          },
          onCancel: () => {
            this.cancelList = []
          }
        });

      }
      // 置空需要去除的采购单数组
    },
    // 获取交易方式时，报错提示
    getDealWayError(error = {}) {
      if (this.$common.isEmpty(error)) return;
      let errHtml = '';
      Object.keys(error).forEach((eKey, index) => {
        errHtml += `<p style="padding-bottom: 15px;">（${index + 1}）${eKey.replace(/：/g, ' > ').replace(/:/g, ' > ')}：${error[eKey]}</p>`;
      })
      this.$Modal.confirm({
        title: '操作提示',
        width: '700px',
        okText: '跳过异常数据',
        cancelText: '返回编辑',
        content: errHtml,
        onOk: () => { },
        onCancel: () => {
          this.dealModal = false;
        }
      });
    },
    singleOpenDealWay() {
      let temp = this.$common.copy(this.orderList[this.orderIndex]);
      temp.isDeliveryPay = temp.isDeliveryPay ? 1 : 0;
      temp.updateQuoteFlag = temp.updateQuoteFlag ? 1 : 0;
      temp.updateSupplierFlag = temp.updateSupplierFlag ? 1 : 0;
      temp.detailsResultList.forEach((i) => {
        i.requiredQuantity = i.backupQuantity;
      });
      temp.remarks = [{ remark: temp.remark }];
      if (this.allowExceed[this.orderIndex]) {
        temp.overshootState = 1;
      }
      if (!this.$common.isEmpty(this.selectOverseaTag[this.orderIndex])) {
        temp.platformAndAccountCode = this.selectOverseaTag[this.orderIndex];
      }
      this.axios.post(api.createOrderPreview, [temp]).then((res) => {
        // 判断下单类型是否为1688供应商下单类型
        if (temp.applyType === 0) {
          this.dealModal = true;
          if (res && res.data && res.data.datas) {
            if (!this.$common.isEmpty(res.data.datas.fail) && res.data.datas.fail > 0) {
              this.getDealWayError(res.data.datas.error);
            }
            this.data1 = (res.data.datas.data || []).map((item) => {
              if (this.$common.isEmpty(previewType[item.settlementTypeName])) {
                const selectType = item.orderPreview.find(f => f.name === previewType[item.settlementTypeName]);
                if (!this.$common.isEmpty(selectType)) {
                  item.tradeType = selectType.tradeType;
                }
              }
              item.orderPreview = item.orderPreview.filter((preview) => {
                return preview.opSupport;
              });
              return item;
            })
          }
        } else {
          this.$emit("addOrderGoBack", this.$store.state.thisPage);
          return this.$Message.success("操作成功");
        }
      })
    },
    //获取账号详情
    accountChange() {
      let accountParamQO = this.orderList[this.orderIndex].accountParamQO;

      if (!accountParamQO.accountId) return;
      this.axios.get(`/sps-service/sps/setting/accountParam/${accountParamQO.accountId}`).then((res) => {
        accountParamQO.orderType = res.data.datas.orderType;
        accountParamQO.aliMessage = res.data.datas.aliMessage;
        accountParamQO.purchaseMessage = res.data.datas.purchaseMessage;
      });
    },
    //判断供应商是否1688
    judge1688Supplier(val) {
      if (!val) return;
      let getSupplier = this.supplierArr.find((item) => {
        return item.supplierId == val;
      });
      if (this.$common.isEmpty(getSupplier)) {
        getSupplier = {}
      }
      this.orderList[this.orderIndex].setupStatus = getSupplier.setupStatus;
      this.changeTableColumns();
      this.isHasSetupStatus0 = this.judegeisHasSetupstatus();
      // 当非 1688 时
      if (!this.is1688Supplier) {
        this.orderList[this.orderIndex].detailsResultList.forEach((item, index) => {
          this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'aliSku', []);
          this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'platformSkuId', '');
        });
        return;
      }
      const temp = {
        skuList: this.orderList[this.orderIndex].detailsResultList.map((item) => {
          return item.skuNo;
        }),
        supplierName: getSupplier.supplierName,
        supplierId: val
      }
      // 获取对应 1688 的供应商
      this.axios.post(`/sps-service/sps/requirement/queryAliProduct`, temp).then((res) => {
        const list = (!res.data && res.data.code != 0) ? [] : res.data.datas || [];
        //不是1688
        if (list.length == 0) {
          this.orderList[this.orderIndex].detailsResultList.forEach((item, index) => {
            this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'aliSku', []);
            this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'platformSkuId', '');
          });
          return;
        }
        const skuNoList = this.orderList[this.orderIndex].detailsResultList.map(item => item.skuNo);
        let includesSkuObj = {};
        list.forEach(item => {
          if (skuNoList.includes(item.sku)) {
            includesSkuObj[item.sku] = item;
          }
        });
        //给每个匹配的 sku 增加1688选择选项
        this.orderList[this.orderIndex].detailsResultList.forEach((item, index) => {
          if (Object.keys(includesSkuObj).includes(item.skuNo)) {
            this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'aliSku', includesSkuObj[item.skuNo].aliSkuList || []);
          } else {
            this.$set(this.orderList[this.orderIndex].detailsResultList[index], 'aliSku', []);
          }
        })
        this.matchDefaultProduct();
      });
    },
    // 确认选择供应商
    supplierConfirmHand (res) {
      if (this.$common.isEmpty(res) || this.$common.isEmpty(res.index) || this.$common.isEmpty(res.data)) return;
      if (this.orderList[res.index].supplierId == res.data.supplierId) return;
      this.orderIndex = res.index;
      this.$set(this.orderList[res.index], 'supplierId', res.data.supplierId);
      this.$nextTick(() => {
        this.supplierIdChangeFn(res.data.supplierId);
      });
    },
    //交易方式确认
    dealWayConfirm() {
      let validStatus = true;
      this.data1.forEach((item) => {
        if (!item.tradeType) {
          validStatus = false;
        }
      });
      let accountInfo = {};
      this.data1.forEach((itema) => {
        accountInfo = this.accountAllList.find(itemb => itema.accountParamQO.accountId == itemb.accountId);
        if (!this.$common.isEmpty(accountInfo)) {
          itema.accountParamQO.accountName = accountInfo.accountCode;
        }
      });

      if (!validStatus) return this.$Message.error("交易方式不能为空");
      this.saveLoading = true;
      let tempList = this.$common.copy(this.data1);
      tempList.forEach(item => {
        item.isDeliveryPay = item.isDeliveryPay ? 1 : 0;
        item.updateQuoteFlag = item.updateQuoteFlag ? 1 : 0;
        item.updateSupplierFlag = item.updateSupplierFlag ? 1 : 0;
      })
      this.axios.post(api.submitBatch, tempList).then((res) => {
        if (res.data.code == 0) {
          if (res.data.datas.fail === 0) {
            this.$Message.success("操作成功");
            if (this.singleSubmit1688) {
              // this.$emit("addOrderGoBack", this.$store.state.thisPage);
              this.dealModal = false;
              return this.orderList.splice(this.orderIndex, 1);
            }
            this.$emit("addOrderGoBack", this.$store.state.thisPage);
          } else {
            this.dealModal = false;
            let arr = [];
            this.orderList.forEach((i) => {
              for (let key in res.data.datas.error) {
                if (key + "" === i.supplierId + "_" + i.purchaseWarehouseId) {
                  arr.push(i);
                }
              }
            });
            this.orderList = [];
            this.orderList = arr;
            this.orderIndex = "0";
            if (res.data.datas.success > 0) {
              this.$Message.success("提交成功" + res.data.datas.success + "个");
            }
            this.$Message.error("提交失败" + res.data.datas.fail + "个");
          }
          this.saveLoading = false;
          // this.$Message.success('提交成功！')
          // this.$emit('addOrderGoBack', this.$store.state.thisPage, res.data.datas);
        }
      });
    },
    //判断orderlist的订单的setupStatus0的
    judegeisHasSetupstatus() {
      let statusList = this.orderList.map((item) => {
        return item.setupStatus;
      });
      let arr = [...new Set(statusList)];
      let status = arr.includes(0) ? true : false;
      // 判断下单方式是否存在未对接系统供应商下单类型，存在的话返回true
      let applyTypeList = this.orderList.map((item) => {
        return item.applyType;
      });
      if (applyTypeList.includes(1)) { return status = true }
      return status;
    },
    judegeOrderListSetupstatus() {
      //0普通，1 1688，2混合
      let status = 2;
      let statusList = this.orderList.map((item) => {
        return item.setupStatus;
      });
      let arr = [...new Set(statusList)];
      if (arr.length == 1) {
        status = arr.includes(0) ? 0 : 1;
      }
      return status;
    },
    saveAction(name) {
      this.saveLoading = true;
      const validErr = this.validFn();
      if (validErr.valid) {
        let orderList = this.$common.copy(this.orderList);
        orderList.forEach((i, index) => {
          let temp = [
            { remark: orderList[index].remark },
          ];
          i.isDeliveryPay = i.isDeliveryPay ? 1 : 0;
          i.updateQuoteFlag = i.updateQuoteFlag ? 1 : 0;
          i.updateSupplierFlag = i.updateSupplierFlag ? 1 : 0;
          if (this.allowExceed[index]) {
            this.$set(orderList[index], 'overshootState', 1);
          }
          if (!this.$common.isEmpty(this.selectOverseaTag[index])) {
            this.$set(orderList[index], 'platformAndAccountCode', this.selectOverseaTag[index]);
          }
          this.$set(orderList[index], 'remarks', temp);
          i.detailsResultList.forEach((i) => {
            i.requiredQuantity = i.backupQuantity;
          });
        });
        let apiUrl = api.applyOrders;
        if (name === "1") {
          // 保存至待提交
          apiUrl = api.submitBatch;
        }
        this.countCheckSkuRate(orderList);
        this.$Spin.show();
        this.axios.post(apiUrl, orderList).then((res) => {
          if (res.data.code == 0) {
            if (res.data.datas.fail === 0) {
              this.$Message.success("操作成功");
              this.$emit("addOrderGoBack", this.$store.state.thisPage);
            } else {
              let arr = [];
              this.orderList.forEach((i) => {
                for (let key in res.data.datas.error) {
                  if (key + "" === i.supplierId + "_" + i.purchaseWarehouseId) {
                    arr.push(i);
                  }
                }
              });
              this.orderList = [];
              this.orderList = arr;
              this.orderIndex = "0";
              if (res.data.datas.success > 0) {
                this.$Message.success("提交成功" + res.data.datas.success + "个");
              }
              this.$Message.error("提交失败" + res.data.datas.fail + "个");
            }
            // this.$Message.success('提交成功！')
            // this.$emit('addOrderGoBack', this.$store.state.thisPage, res.data.datas);
          }
          this.$Spin.hide();
          this.saveLoading = false;
        }).catch(() => {
          this.$Spin.hide();
          this.saveLoading = false;
        });
      } else {
        this.saveLoading = false;
        // 校验不通过处理
        if (this.cancelList.length > 0) {
          let cancelList = this.cancelList.map(item => {
            return {
              purchaseWarehouseId: item.purchaseWarehouseId,
              supplierId: item.supplierId
            }
          })
          return this.$Modal.confirm({
            title: '提示(采购单提交异常)',
            content: `是否跳过 ${this.cancelList[0].supplierName}-${this.cancelList[0].purchaseWarehouseName} 采购单`,
            width: '600px',
            // content: validErr.errText,
            okText: '跳过异常',
            onOk: () => {
              if (this.orderList.length === 1) {
                return this.$emit('goBackFromAdd')
              }
              const resultArr = this.orderList.filter(item => {
                return (item.purchaseWarehouseId !== cancelList[0].purchaseWarehouseId) || (item.supplierId !== cancelList[0].supplierId)
              })
              this.orderList = resultArr
              // 由于删除之后orderIndex可能会比orderList的长度要长，会有Bug
              if (this.orderList.length - 1 < this.orderIndex) {
                this.clickItem(this.orderIndex - 1)
              }
              this.cancelList = []
            },
            onCancel: () => {
              this.cancelList = []
            }
          });

        }
      }
    },
    // 验证标签类型
    formeItemTagType(rule, value, callback) {
      this.$nextTick(() => {
        if (!this.validateTagType) {
          return callback(new Error('请选择第三方标签'));
        }
        callback();
      });
    },
    // 第三方标签改变时
    formItemOverseaTagChange(val) {
      if (this.$common.isEmpty(val)) {
        return;
      }
      this.$nextTick(() => {
        this.checkHasOverseaTag([this.orderList[this.orderIndex]], this.orderIndex, true);
      })
    },
    //1688匹配默认商品
    matchDefaultProduct() {
      //匹配1688默认商品
      this.orderList.forEach((itema) => {
        try {
          itema.detailsResultList.forEach((itemb) => {
            if (this.$common.isEmpty(itemb.aliSku)) return (itemb.platformSkuId = "");
            itemb.platformSkuId = itemb.aliSku[0].platformSkuId;
            itemb.aliSku.forEach((itemc) => {
              if (itemc.defaultStatus) {
                itemb.platformSkuId = itemc.platformSkuId;
              }
            });
          });
        } catch (e) {
          console.error(e);
        }
      });
    },
    cancelConfirm() {
      this.dealModal = false;
      this.saveLoading = false;
    },
    // 商品标签切换事件
    tagTypeChange(e) {
      let [orderIndex] = [this.orderIndex];
      let orderData = this.orderList[orderIndex] || {};
      let arr = orderData.comingSpecialList || [];
      if (e == 1) {
        if (!arr.includes('1')) arr.push('1');// 自动选择第三方标签
      } else {
        let index = arr.indexOf('1');
        if (index >= 0) arr.splice(index, 1);// 取消选择第三方标签
      }
      this.$set(this.orderList[orderIndex], 'comingSpecialList', arr);
    }
  },
};
</script>
<style lang="less" scoped>
@leftWidth: 280px;

.page-mian-content {
  height: 100%;
  background: #f2f2f2;
}

.page-top-head {
  position: sticky;
  top: 0;
  z-index: 999;
  // .topper{
  //   position: initial;
  //   top: initial;
  //   z-index: initial;
  // }
  .top-btn-wrapper {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(0, -50%);
  }
}

.product-info-head {
  display: flex;
  padding: 0 15px 10px 15px;
  justify-content: space-between;

  &.bottom-dashed {
    border-bottom: 1px dashed #dddee1;
  }
}

.product-defualt-head {
  padding: 0 15px 10px 15px;

  &.bottom-dashed {
    border-bottom: 1px dashed #dddee1;
  }
}

.product-info-title {
  font-size: 16px;
  font-weight: bold;
}

.product-info-tips {
  margin-left: 5px;
  font-size: 12px;
  color: #f60;
  line-height: 1.4em;
}

.product-info-waterTips {
  display: inline-block;
  font-size: 12px;
  font-weight: 400;
  margin-left: 50px;
}

.page-content {
  // height: calc(100% - 60px);
  position: relative;

  .conten-left {
    display: inline-block;
    width: @leftWidth;
    vertical-align: top;

    .conten-left-tiltle {
      width: 280px;
      height: 40px;
      background: #d7d7d7;
      padding-left: 10px;
      color: #474558;
      display: flex;
      align-items: center;
    }
  }

  .conten-right {
    display: inline-block;
    width: calc(100% - @leftWidth - 5px);
    vertical-align: top;
    background: #fff;
  }
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

.cancel-order {
  padding: 20px 30px;
  font-size: 16px;
}

.related {
  cursor: pointer;
  color: rgb(45, 140, 240);
}

.related:hover {
  color: #ff6600;
  text-decoration: underline;
}

.ivu-input-number {
  width: 176.33px;
}

.settingModal ::v-deep .ivu-input {
  height: 25px;
}

.chooseItem {
  width: 280px;
  height: 70px;
  background: #f2f2f2;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid #dbdbdb;
  cursor: pointer;
}

.order-details {
  margin-top: 15px;
  padding: 0 15px 15px 15px;
}

.form-item-line {

  :deep(.ivu-form-item-content) {
    display: flex;
  }

  &.white-space-nowrap {
    :deep(.ivu-form-item-content) {
      white-space: nowrap;

      .ivu-form-item-error-tip {
        left: 193px;
      }
    }
  }

  .superaddition-form-item {
    margin-left: 5px;
    display: flex;

    :deep(.dyt-select-demo) {
      min-width: 150px;
    }
  }

  .product-info-tips {
    white-space: nowrap;
    padding-top: 10px;
  }
}
</style>
<style>
.addProductBar .ivu-modal-footer {
  display: none;
}

.ivu-col-offset-2 {
  margin-left: 3.333333%;
}
</style>