<template>
  <div style="margin-left: 10px">
    <div class="top-btn-wrapper">
      <template v-if="orderType === '1' ||
        orderType == '3' ||
        orderType == '5' ||
        editType === 'placeOrder'
        ">
        <Button type="primary" @click="saveToBeSubmitted" style="margin-right: 10px"
          v-if="getPermission('purchase_submit_wait')" :loading="saveLoading1">保存至待提交
        </Button>
      </template>
      <template v-if="orderType == '2'">
        <Button type="primary" @click="saveToBeSubmittedMt" style="margin-right: 10px"
          v-if="getPermission('purchase_submit_wait')" :loading="saveLoading1">保存
        </Button>
        <!-- 保存至待提交 -->
      </template>
      <template v-if="orderType == '1' || orderType == '3' || orderType == '5'">
        <Button type="primary" v-if="orderSource == '1'
          ? getPermission('purchase_submit_wait')
          : getPermission('purchase_submit')
          " @click="saveMt" style="margin-right: 10px" :loading="saveLoading">提交
        </Button>
      </template>
      <template v-if="orderType == '4'">
        <Button type="primary" @click="batchOperation('order', '3')" style="margin-right: 10px"
          :loading="operationLoading_3">审核通过
        </Button>
        <Button type="primary" @click="batchOperation('order', '1')" style="margin-right: 10px"
          :loading="operationLoading_1">驳回
        </Button>
      </template>
      <template v-if="orderType == '6'">
        <Button type="primary" @click="batchOperation('order', '4')" style="margin-right: 10px"
          :loading="operationLoading_4">向供应商下单
        </Button>
      </template>
      <template v-if="(orderType == '3' || orderType == '4') && orderSource != '1'">
        <Button type="primary" @click="model1 = true" style="margin-right: 10px" :loading="operationLoading_5">取消采购
        </Button>
      </template>
      <Button type="default" class="mr10" @click="cancelAction">取消</Button>
    </div>

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
        <Button type="primary" @click="batchOperation('order', '5')">确定</Button>
      </div>
    </Modal>

    <Form ref="order" :model="order" :label-width="90" :rules="ruleValidate">
      <div v-if="orderType == 2 || orderType == 3 || orderType == 4" class="titleFont" style="margin: 6px 0 30px -8px">
        采购单号：{{
          order.purchaseNumber ? order.purchaseNumber : "下单后创建"
        }}
      </div>
      <div class="titleLeft titleFont">基本信息</div>
      <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
      <div class="addPurOrdForm">
        <Row class="normalTop">
          <Col :span="5">
          <FormItem label="采购员：" prop="purchaserId">
            <dyt-select v-model="order.purchaserId" filterable :disabled="orderType == '4' || order.type === 2"
              placeholder="请选择">
              <Option v-for="(item, index) in purchaserArray" :value="item.id" :key="index">{{ item.name }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5">
          <template v-if="orderType == '4'">
            <FormItem label="备货仓库：" prop="backupWarehouseName">
              <Input v-model="order.backupWarehouseName" :disabled="true">
              </Input>
            </FormItem>
          </template>
          <template v-else>
            <div v-if="order.readyType !== 5">
              <FormItem label="备货仓库：" prop="purchaseWarehouseId">
              <dyt-select v-model="order.purchaseWarehouseId" filterable clearable placeholder="请选择"
                :disabled="orderSource == '1' || order.type === 2">
                <Option v-for="(item, index) in warehouseArr" :disabled="item.warehouseStatus === '1'"
                  :value="item.warehouseId" :key="index">{{ item.warehouseName }}
                </Option>
              </dyt-select>
            </FormItem>
            </div>
            <div v-else>
              <FormItem label="备货仓库：" prop="purchaseWarehouseId">
              <dyt-select v-model="order.purchaseWarehouseId" filterable clearable placeholder="请选择"
                :disabled="orderSource == '1' || order.type === 2">
                <Option v-for="(item, index) in directWareHouseArr" :disabled="item.warehouseStatus === '1'"
                  :value="item.warehouseId" :key="index">{{ item.warehouseName }}
                </Option>
              </dyt-select>
            </FormItem>   
            </div>
          </template>
          </Col>
          <Col :span="5">
          <FormItem label="供应商1：" prop="supplierId">
            <dytSelect v-model="order.supplierId" filterable clearable :disabled="orderType == '4' || order.type === 2"
              @on-change="supplierIdChangeFn" placeholder="请选择">
              <Option v-for="(item, index) in supplierArr" :disabled="item.purchaseWarehouseStatus === '1'"
                :value="item.supplierId" :key="index">{{ item.supplierName }}</Option>
            </dytSelect>
            <supplierChoose
              v-if="proList && proList.length > 0 && !(orderType == '4' || order.type === 2)"
              :module-data="{data: proList, index: 0}"
              @confirmHand="supplierConfirmHand"
            />
          </FormItem>
          </Col>
          <Col :span="5">
          <template v-if="orderSource == 2">
            <FormItem label="备货类型：" prop="readyType">
              <dyt-select v-model="order.readyType" filterable clearable :disabled="orderType == '3' || orderType == '4' || orderType == '2'
                " placeholder="请选择">
                <Option v-for="(item, index) in readyTypeList" :disabled="item.purchaseWarehouseStatus === '1'"
                  :value="item.value" :key="index">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
          </template>
          <template v-else-if="orderSource == 1">
            <FormItem label="备货类型：" prop="readyType">
              <dyt-select v-model="order.readyType" filterable clearable :disabled="orderType == '3' || orderType == '4' || orderType == '2'
                " placeholder="请选择">
                <Option v-for="(item, index) in readyTypeList" :disabled="item.purchaseWarehouseStatus === '1'"
                  :value="item.value" :key="index">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
          </template>
          </Col>
          <Col :span="4">
          <FormItem label="结算方式：">{{ order.settlementTypeName || "-" }}
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="5">
          <FormItem label="总商品金额：">
            <span>{{ proTotalPrice.toFixed(2) }}</span>
          </FormItem>
          </Col>

          <template v-if="!isDeliveryPay">
            <Col :span="5">
            <FormItem label="运费：">
              <InputNumber :max="999999" :min="0" :step="0.01" v-model="order.freightCharge" :disabled="orderType == '4'"
                style="width: 200px"></InputNumber>
            </FormItem>
            </Col>
          </template>
          <Col :span="5">
          <FormItem label="优惠：" prop="discountAmount">
            {{ order.discountAmount }}
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="币种：" prop="currency">
            <dyt-select v-model="order.currency" filterable clearable :disabled="orderType == '4' || order.type === 2"
              @on-change="currencyChangeFn" placeholder="请选择">
              <Option v-for="(item, index) in currencyArr" :value="item.dataDesc" :key="index" :label="item.dataDesc">{{
                item.dataDesc }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="4">
          <FormItem label="采购类型：">
            {{ order.supplierTypeName }}
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="5">
          <FormItem label="应付总额：" prop="totalAmount">
            <span>{{
              Number(
                proTotalPrice + order.freightCharge - order.discountAmount
              ).toFixed(2)
            }}</span>
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="已付金额：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="收库商品金额：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="收库金额：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="4">
          <FormItem label="未收库商品金额：">{{ "-" }} </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="5">
          <FormItem label="下单数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="取消数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="少货数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="未发货数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="4">
          <FormItem label="已发货数量：">{{ "-" }} </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="5">
          <FormItem label="收货正品数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="收获次品数量：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="未收货数量：">{{ "-" }} </FormItem>
          </Col>

          <Col :span="5">
          <FormItem label="质检类型：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="4">
          <FormItem label="质检总比例：" prop="checkRateSum">
            <span>{{ order.checkRateSum }}%</span>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="5">
          <FormItem label="所属事业部：" prop="businessDeptId">
            <dyt-select v-model="order.businessDeptId" filterable clearable :disabled="orderType == '3' || orderType == '4' || orderType == '2'
              " placeholder="请选择">
              <Option v-for="item in businessDeptInfoList" :key="item.id" :label="item.name" :value="item.id">
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="1688账号类型：">
            <dyt-select v-model="order.alibabaAccountType" filterable clearable
              :disabled="orderType == '4' || order.type === 2" placeholder="请选择">
              <Option v-for="(item, index) in alibabaList" :value="item.label" :key="index">{{ item.label }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="外部流水号：">
            <Input v-if="order.type == 2" v-model="order.aliPlatformOrderNo" :maxlength="50"
              :disabled="orderType == '4' || order.type === 2" />
            <Input v-else v-model="order.externalSerialNo" :maxlength="50" :disabled="orderType == '4'" />
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="总重量(g)：" prop="weight">
            <span>{{ allWeight }}</span>
          </FormItem>
          </Col>
        </Row>

        <Row>
          <Col :span="5">
          <FormItem label="下单状态：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="下单时间：">{{ "-" }} </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="发货要求：">{{ "-" }} </FormItem>
          </Col>
          <!-- <Col :span="5">
            <FormItem label="总商品金额：">
              <span>{{ proTotalPrice.toFixed(2) }}</span>
            </FormItem>
          </Col>

          <Col :span="5">
            <FormItem label="应付总额：" prop="totalAmount">
              <span>{{
                Number(
                  proTotalPrice + order.freightCharge - order.discountAmount
                ).toFixed(2)
              }}</span>
            </FormItem>
          </Col> -->
        </Row>
        <!-- !is1688 -->
        <div v-if="orderType == 1 ||
          orderType == 5 ||
          order.purchaseId == '' ||
          order.purchaseId == null
          ">
          <div class="titleLeft titleFont" style="margin: 20px 0">采购备注</div>
          <Row class="normalTop remarkTextarea">
            <div>
              <FormItem>
                <Input v-model="order.remark" type="textarea" maxlength="500" :rows="3"></Input>
              </FormItem>
            </div>
          </Row>
        </div>
        <!-- 编辑备注 -->
        <div v-else>
          <!-- is1688 -->
          <div>
            <add-remark :isVisible.sync="isEditRemark" :showRemarkList="showRemarkList"
              :purchaseId="order.purchaseId"></add-remark>
          </div>
        </div>
      </div>
      <div class="product-defualt-head" v-if="order.readyType !== 5">
        <div class="product-info-title">采购定制</div>
        <div class="head-mian-content">
          <FormItem label="超发：" :label-width="100">
            <Checkbox v-model="order.overshootState" :disabled="isDisabledExceed || order.type === 2">允许超发</Checkbox>
            <span class="product-info-tips">注意：订单所有商品都有SKC编码，才能允许超发</span>
          </FormItem>
          <FormItem label="打印商品标签：" :label-width="100" class="form-item-line white-space-nowrap"
          v-if="order.readyType === 4"
            :rules="{ validator: formeItemTagType, trigger: 'change' }" prop="tagType">
            <RadioGroup v-model="order.tagType" @on-change="tagTypeChange">
              <Radio :label="0" :disabled="order.type === 2">LAPA标签</Radio>
              <Radio :disabled="$common.isEmpty(detailsResultGoodsIds) || order.type === 2" :label="1">第三方标签</Radio>
            </RadioGroup>
            <div v-if="[1, '1'].includes(order.tagType)" class="superaddition-form-item">
              <dytSelect v-model="order.platformAndAccountCode" placeholder="请选择第三方标签" @on-change="formItemOverseaTagChange"
                :disabled="order.type == 2">
                <Option v-for="(tag, tIndex) in overseaTagList" :key="`tag-${tIndex}`" :label="tag.label"
                  :value="tag.value" />
              </dytSelect>
            </div>
            <span class="product-info-tips">注意：订单所有商品都有选择第三方标签，才能选择</span>
          </FormItem>

          <FormItem label="来货特项：" :label-width="100">
            <CheckboxGroup v-model="order.comingSpecial">
              <Checkbox :label="item.comingSpecialId" v-for="(item, index) in productTagList" :key="index">
                {{ item.comingSpecial }}
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
        </div>
      </div>

      <div class="product-info-head">
        <div class="product-info-title">商品信息</div>
      </div>
      <div class="product-info-operate">
        <div class="product-operate-left" v-if="order.type !== 2">
          <Button type="primary" @click="addProFn" class="iconbuttons" :disabled="orderType == '4'" :loading="addLoading">
            添加商品
          </Button>
          <Button type="primary" @click="batchDelFn" class="iconbuttons" style="margin-left: 10px"
            :disabled="orderType == '4'">
            批量删除
          </Button>
        </div>
        <div class="product-operate-right">
          <Checkbox v-model="order.updateQuoteFlag" :disabled="orderType == '4'">是否更新最新报价</Checkbox>
          <Checkbox v-model="order.updateSupplierFlag" :disabled="orderType == '4'">是否下单供应商设置为首选供应</Checkbox>
        </div>
      </div>
      <div class="sameStyleSearch normalTop">
        <Table highlight-row :columns="orderColumn" :data="proList" :border="true" @on-selection-change="getSelectValue">
          <template slot-scope="scope" slot="choose1688Product">
            <Select v-model="proList[scope.index].platformSkuId" style="width: 150px" transfer>
              <Option v-for="(item, index) in proList[scope.index].aliSkus" :key="index" :value="item.platformSkuId"
                :label="item.platformName">
                <div style="display: flex">
                  <img class="img" :src="item.platformImage" alt="图片" style="width: 60px" />
                  <div style="margin-left: 5px">
                    <div> {{ item.platformName }} </div>
                    <div>{{ item.platformSupplierName }}</div>
                    <div>
                      <span>{{ item.skcs[0].platformValue }}</span>
                      <span class="ml10">{{ item.skcs[1].platformValue }}</span>
                    </div>
                  </div>
                </div>
              </Option>
            </Select>
          </template>
        </Table>
      </div>
    </Form>
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
    <Modal v-model="settingModalVisible" :width="620" class-name="vertical-center-modal" title="批量设置规则">
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
        <Button type="primary" @click="dealWayConfirm">确定 </Button>
        <Button @click="dealModal = false">取消</Button>
      </div>
    </Modal>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import orderMixin from "@/components/mixin/order_mixin";
import addProduct from "@/components/common/addProduct";
import { alibabaList } from "../../supplyOrder/configFile";
import { time_now } from "@/utils/comfun.js";
import addRemark from "@/views/supplierPurchase/purchaseManagement/supplyOrder/addRemark";
import supplierChoose from '@/views/supplierPurchase/purchaseManagement/components/common/supplierChoose';

const previewType = {
  '款到发货': '担保交易',
  '阿里账期': '账期交易'
};

export default {
  // props: [
  //   "orderSource",
  //   "orderType",
  //   "orderData",
  //   "purchaseWarehouseArr",
  //   "purchaserArr",
  //   "editType",
  //   "tabsValue",
  // ],
  // common_mixins 的 data 里定义了 purchaserArr，与组件的 props 中的 purchaserArr 重复（会报错），因此将其改为 purchaserArray
  props: [
    "orderSource",
    "orderType",
    "orderData",
    "purchaseWarehouseArr",
    "purchaserArray",
    "editType",
    "tabsValue",
  ],
  components: { addProduct, addRemark, supplierChoose },
  mixins: [Mixin, orderMixin],
  data() {
    // var self = this;
    return {
      showRemark: false,
      saveLoading: false,
      saveLoading1: false,
      operationLoading_3: false,
      operationLoading_1: false,
      operationLoading_4: false,
      operationLoading_5: false,
      overseaTagList: [],
      pageLoading: false,
      addLoading: false,
      isShowAddPro: false,
      proData: [],
      isShowCancelOrder: false,
      selectionArr: [],
      isDeliveryPay: false,
      model1: false,
      order: {
        tagType: 0,
        platformAndAccountCode: ''
      },
      proList: [],
      /* proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
      }, */
      sourceType: false, // 是否勾选1688商品
      purchaseAccountIdArr: [],
      supplierArr: [],
      currencyArr: [],
      readyTypeList: [
        { value: 0, label: "急采" },
        { value: 1, label: "普通备货" },
        { value: 2, label: "海外仓备货" },
        { value: 3, label: "FBA备货" },
        { value: 4, label: "全托管备货" },
        { value: 5, label: "直发备货" },
      ],
      purchaseTypeList: [
        { value: 1, label: "急采" },
        { value: 0, label: "普通备货" },
        { value: 2, label: "海外仓备货" },
        { value: 3, label: "FBA备货" },
      ],
      alibabaList,
      supplierTypeArr: [],
      settlementTypeArr: [],
      orderColumn: [],
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
            trigger: "blur",
            type: "number",
          },
        ],
        businessDeptId: [
          {
            required: true,
            type: "number",
            message: "不能为空",
            trigger: "change",
          },
        ],
      },
      proTotalPrice: 0,
      allWeight: 0, // 总重量
      showRemarkList: [],
      isEditRemark: false,

      //新加参数
      checkType: 1,
      settingRule: {
        radio1: "1",
        input1: "",
        input2: "",
        input3: "",
      },
      settingModalVisible: false,
      //总应检数量
      planCheckNumber: 0,
      //总质检比例
      businessDeptInfoList: [], //事业部列表

      accountList: [],
      is1688: false,
      accountParamQO: {
        accountId: "",
        aliMessage: "",
        orderType: "",
        purchaseMessage: "",
      },
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
      dealModal: false,
      directWareHouseArr: [],
      warehouseArr: [],
      productTagList: [],
    };
  },
  computed: {
    // 登录人可查看事业部ID
    businessDeptIds() {
      if (this.$common.isEmpty(this.$store.getters["allowBusinessDeptIds"])) return '';
      return this.$store.getters["allowBusinessDeptIds"].join(',');
    },
    isDisabledExceed() {
      if (this.$common.isEmpty(this.proList)) return true;
      const findItem = !this.$common.isEmpty(this.proList.find(item => {
        return this.$common.isEmpty(item.skc);
      }))
      // 当数据改变之后，不包含 skc 时， 允许超发取消选中
      if (findItem && this.order.overshootState) {
        this.$set(this.order, 'overshootState', false);
      }
      return findItem;
    },
    // 获取商品信息中的商品 ID
    detailsResultGoodsIds() {
      if (this.$common.isEmpty(this.proList)) return [];
      return this.proList.map(m => m.goodsId).filter(f => !this.$common.isEmpty(f));
    },
    // 验证标签类型是否正确
    validateTagType() {
      if ([1, '1'].includes(this.order.tagType)) {
        const selectTag = this.order.platformAndAccountCode;
        if (this.$common.isEmpty(selectTag)) {
          return false;
        }
      }
      return true;
    }
  },
  created() {
    this.pageLoading = true;
    this.init();
    this.getProlist();
    this.getComingSpecialList();
    // 加载需要页面初始数据
    this.initBaseDataList().finally(() => {
      // 二次加载数据
      this.loadPageData().then(() => { }).finally(() => {
        this.pageLoading = false;
      })
    })
    if (this.editType === "placeOrder") {
      // 下单的时候才调
      this.getAllSupplierGoodsUnitiPrice();
    }
  },
  mounted() {
    // this.changeTableColumns();
    this.getBusinessDeptInfo();
    this.getAccount();
  },
  watch: {
    'order.tagType': {
      immediate: true,
      handler(val) {
        if ([0, '0'].includes(val)) {
          this.$set(this.order, 'platformAndAccountCode', '');
        }
      }
    },
    "order.detailsResultList": {
      handler: function (newVal, oldVal) {
        let v = this;
        v.order.purchaserId = v.$store.state.userInfo.userId; // 默认为当前操作人
        if (newVal.length == 0) {
          v.sourceType = false;
          v.order.type = 1;
        } else {
          let isAlibaba = false;
          let isNormal = false;
          v.order.type = 1;
          newVal.forEach((n, i) => {
            if (n.relationPlatform) {
              isAlibaba = true;
            } else {
              isNormal = true;
            }
          });
          if (!isAlibaba && isNormal) {
            // 普通下单
            v.sourceType = false;
            v.order.type = 1;
          } else if (isAlibaba && !isNormal) {
            // 1688下单
            v.sourceType = true;
            v.order.type = 2;
          } else if (isAlibaba && isNormal) {
            // 混合下单
            v.sourceType = true;
            v.order.type = 3;
          }
        }
      },
      deep: true,
    },
    // eslint-disable-next-line no-dupe-keys
    "order.detailsResultList": {
      handler: function (val, oldVal) {
        this.proTotalPrice = val.reduce((amount, n) => {
          let replenishQuantity = n.replenishQuantity ? n.replenishQuantity : 0;
          let unitPrice = n.unitPrice ? n.unitPrice : 0;
          return amount + replenishQuantity * unitPrice;
        }, 0);
        this.allWeight = val.reduce((a, b) => {
          let replenishQuantity = b.replenishQuantity ? b.replenishQuantity : 0;
          let weight = b.weight ? b.weight : 0;
          return a + replenishQuantity * weight;
        }, 0);
      },
      deep: true,
    },
    order: {
      handler(newVal) {
        if (this.orderType == 5) {
          this.order.remark = "";
        }
        this.showRemarkList = this.order.remarks || [];
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
    'order.platformAndAccountCodeStr': {
      handler(newVal){
        if(newVal){
          let platformAndAccountCodeArr = newVal.split(',')
          platformAndAccountCodeArr = platformAndAccountCodeArr.map(item => {
            const parts = item.split("-");
            const result = parts.slice(0,2).join("-");
            return {
              label: result,
              value: item
            }
          })
          this.overseaTagList = platformAndAccountCodeArr
        }
      }
    },
    // 当商品ID为空时，清除选中的第三方标签
    detailsResultGoodsIds(val) {
      this.checkHasOverseaTag()
      if (this.$common.isEmpty(val)) {
        this.$set(this.order, 'tagType', 0);
        this.$set(this.order, 'platformAndAccountCode', '');
        return;
      }
    },
    purchaseWarehouseArr: {
      handler(newVal, oldVal) {
        this.directWareHouseArr = newVal.filter(item => item.warehouseType == '5')
        this.warehouseArr = newVal.filter(item => item.warehouseType != '5')
      },
      immediate: true
    }
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        this.productTagList = list || [];
      })
    },
    time_now,
    init() {
      if (this.orderData.remarks && this.orderData.remarks.length > 0) {
        this.orderData.remarks.forEach((i) => {
          i.edit = false;
          i.remarkDraft = i.remark;
        });
      }
      this.order = { ...this.order, ...this.deepCopy(this.orderData) };
      if (this.$common.isEmpty(this.order.tagType) || [0, '0'].includes(this.order.tagType)) {
        this.order.tagType = 0;
        this.order.platformAndAccountCode = '';
      }
      if (this.$common.isEmpty(this.order.overshootState)) {
        this.$set(this.order, 'overshootState', false);
      } else {
        this.$set(this.order, 'overshootState', [1, '1'].includes(this.order.overshootState));
      }
      // 来货特项
      if (this.$common.isEmpty(this.order.comingSpecial)) {
        this.$set(this.order, 'comingSpecial', []);
      } else {
        this.$set(this.order, 'comingSpecial', this.order.comingSpecial.split(','));
      }

      this.is1688 = this.order.setupStatus == 1 ? true : false;
      //获取table列表
      this.changeTableColumns();
      // this.changeTableProductView();
      if (this.order.remarks != null) {
        this.order.remark = this.order.remarks[0].remark;
      }
      this.order.currency = !this.order.currency ? "CNY" : this.order.currency;
      //采购需求那里一开始需要给质检赋值
      if (this.order.checkRateSum == undefined) {
        // this.order.checkRateSum = 0;
        // this.order.checkType = 1;
        this.$set(this.order, "checkRateSum", 0);
        this.$set(this.order, "checkType", 1);
        this.order.detailsResultList.forEach((item, index) => {
          this.$set(this.order.detailsResultList[index], "checkSkuNumber", 0);
          this.$set(this.order.detailsResultList[index], "checkSkuRate", 0);
        });
      }
      this.$nextTick(() => {
        this.supplierIdChangeFn(this.order.supplierId, true);
      })
    },
    // 二次加载数据
    loadPageData() {
      return new Promise((resolve) => {
        this.$common.promiseAll([]).then((list) => {
          resolve(list);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    initBaseDataList() {
      return new Promise((resolve) => {
        this.$common.promiseAll([
          () => {
            return new Promise((resolve) => {
              // this.axios.post(api.queryIdAndName)
              this.axios.post(api.purchaseSupplierData).then((res) => {
                if (res.data.code == 0) {
                  this.supplierArr = [];
                  if (this.tabsValue === 0) {
                    let data = res.data.datas;
                    if (data.length > 0) {
                      data.map((item) => {
                        if (item.auditStatus === 3) {
                          this.supplierArr.push(item);
                        }
                      });
                    }
                  } else {
                    this.supplierArr = res.data.datas;
                  }
                  if (this.order.supplierId && !this.supplierArr.map((j) => j.supplierId).includes(this.order.supplierId)) {
                    // 供应商停用
                    this.order.supplierId = "";
                  }
                  this.getSettlementType();
                  this.getSupplierType();
                }
                resolve(res);
              }).catch(() => {
                resolve({});
              })
            })
          },
          () => {
            return new Promise((resolve) => {
              this.axios.get(api.baseDataList + "?dataType=" + "supplierType").then((res) => {
                if (res.data.code == 0) {
                  this.supplierTypeArr = res.data.datas;
                }
                resolve(res);
              }).catch(() => {
                resolve({});
              })
            })
          },
          () => {
            return new Promise((resolve) => {
              // 货币下拉列表
              // this.axios.post(api.getCurrencyDropdownList)
              this.axios.get(api.baseDataList + "?dataType=currencyType").then((res) => {
                if (res.data.code == 0) {
                  this.currencyArr = res.data.datas;
                }
                resolve(res);
              }).catch(() => {
                resolve({});
              })
            })
          }
        ]).then(arr => {
          resolve(arr);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    changeTableColumns() {
      let v = this;
      const tableColumnList = {
        selection: {
          type: "selection",
          width: 60,
          align: "center",
        },
        goodsThumbUrl: {
          key: "goodsThumbUrl",
          title: "图片",
          align: "center",
          width: 100,
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
            let ruledCondition = v.fixRuledCondition(params.row.ruledCondition);
            // let link = params.row.goodsUrl;
            let link = params.row.supplierPurchaseLink;
            return h(
              "div",
              {
                style: {
                  width: "100%",
                  display: "flex",
                },
              },
              [
                h(
                  "Row",
                  {
                    style: {
                      width: "100%",
                    },
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
                          span: params.row.searchUrl ? 16 : 22,
                        },
                      },
                      [
                        h("p", `SKU: ${params.row.skuNo || ''}`),
                        h("p", `SKC: ${params.row.skc || ''}`),
                        h("div", {
                          class: "textOver",
                          attrs: { title: params.row.goodsName },
                        }, params.row.goodsName)
                      ]),
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
                        class: "textOver",
                        attrs: { title: spec },
                      },
                      [
                        h(
                          "p",
                          {
                            style: { color: "green" },
                            class: "textOver",
                          },
                          spec
                        ),
                      ]
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
                ruledCondition.length === 0 ||
                v.orderType !== "3" ||
                h(
                  "Tooltip",
                  {
                    style: {
                      width: "10px",
                    },
                    props: {
                      transfer: true,
                    },
                  },
                  [
                    h(
                      "div",
                      {
                        slot: "content",
                      },
                      ruledCondition.map((i) => {
                        return h("p", i);
                      })
                    ),
                    h("Icon", {
                      style: {
                        color: "red",
                      },
                      props: {
                        size: "16",
                        type: "md-alert",
                      },
                    }),
                  ]
                ),
              ]
            );
          },
        },
        outerPackageRequirement: {
          key: "outerPackageRequirement",
          align: "center",
          width: 180,
          title: '生产要求',
          render: (h, params) => {
            return h('div', {
              style: {
                whiteSpace: 'pre-wrap',
                wordPreak: 'break-all'
              }
            }, params.row.outerPackageRequirement)
          }
        },
        // relatedPlatformGoods: {
        //   key: "relatedPlatformGoods",
        //   align: "center",
        //   title: "1688商品属性",
        //   render: (h, params) => {
        //     if (params.row.relatedPlatformGoods) {
        //       return h(
        //         "span",
        //         JSON.parse(params.row.relatedPlatformGoods).attributeDisplayName
        //       );
        //     } else {
        //       return "";
        //     }
        //   },
        // },
        availableNumber: {
          key: "availableNumber",
          align: "center",
          title: "可用库存",
          render: (h, params) => {
            if (
              params.row.availableNumber !== null &&
              params.row.availableNumber !== ""
            ) {
              return h("span", params.row.availableNumber);
            } else {
              return h("span", "-");
            }
          },
        },
        onWayNoDespatchNumber: {
          key: "onWayNoDespatchNumber",
          align: "center",
          title: "未发货库存",
          renderHeader: (h, params) => {
            return h(
              "div",
              {
                style: { color: "#458B00" },
                attrs: {
                  title:
                    "未发货库存 = 下单数 - 取消数 - 少货数 - 取大（发货数量 ，收货数量）",
                },
              },
              "未发货库存"
            );
          },
          render: (h, params) => {
            if (
              params.row.onWayNoDespatchNumber !== null &&
              params.row.onWayNoDespatchNumber !== ""
            ) {
              return h("span", params.row.onWayNoDespatchNumber);
            } else {
              return h("span", "-");
            }
          },
        },
        onWayDespatchNumber: {
          key: "onWayDespatchNumber",
          align: "center",
          title: "在途库存",
          renderHeader: (h, params) => {
            return h(
              "div",
              {
                style: { color: "#458B00" },
                attrs: { title: "在途库存 = 最小值为0（发货数量 - 收货数量)" },
              },
              "在途库存"
            );
          },
          render: (h, params) => {
            if (
              params.row.onWayDespatchNumber !== null &&
              params.row.onWayDespatchNumber !== ""
            ) {
              return h("span", params.row.onWayDespatchNumber);
            } else {
              return h("span", "-");
            }
          },
        },

        requiredQuantity: {
          key: "requiredQuantity",
          align: "center",
          title: "需求数量",
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
                max: 99999999,
                formatter: (value) => {
                  let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                  return str;
                },
                disabled: v.orderType == "4" || v.order.type === 2,
              },
              on: {
                "on-change": (val) => {
                  v.$set(v.proList[params.index], "replenishQuantity", val);
                  v.calculateNumAndRate(params.index);
                  // if (val == 0 || val == null) {
                  //   v.proList[params.index].checkSkuRate = 0;
                  // } else {
                  //   v.proList[params.index].checkSkuRate = (
                  //     (v.proList[params.index].checkSkuNumber * 100) /
                  //     v.proList[params.index].replenishQuantity
                  //   ).toFixed(0);
                  // }

                  // if (v.order.checkType == 2) {
                  //   v.$set(v, "planCheckNumber", val);
                  // }
                  // v.order.detailsResultList.forEach((n, i) => {
                  //   if (n.goodsId == params.row.goodsId) {
                  //     v.order.detailsResultList[i].replenishQuantity = val;
                  //   }
                  // });
                },
              },
            });
          },
        },
        mustCheck: {
          key: "checkSkuNumber",
          align: "center",
          title: "应检数量",
          render: (h, params) => {
            // return h("InputNumber", {
            //   props: {
            //     value: v.proList[params.index].checkSkuNumber,
            //     min: 0,
            //     max: v.proList[params.index].replenishQuantity,
            //     formatter: (value) => {
            //       let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
            //       str = `${value}`.replace(/[^\d]/g, ""); // 清除"数字"和"."以外的字符
            //       return str;
            //     },
            //     //  disabled: this.orderType == "3" || this.orderType == "4",
            //     disabled:
            //       this.order.checkType == 0 || this.order.checkType == 2,
            //   },
            //   // style: {
            //   //   width: "50px",
            //   // },
            //   on: {
            //     "on-change": (val) => {
            //       v.proList[params.index].checkSkuNumber = val;
            //       v.proList[params.index].checkSkuRate = (
            //         (v.proList[params.index].checkSkuNumber * 100) /
            //         v.proList[params.index].replenishQuantity
            //       ).toFixed(0);
            //       v.countCheckRateSum();
            //       // v.proList[params.index].checkSkuNumber = val;
            //       // v.$set(v.proList[params.index], "checkSkuNumber", val);
            //     },
            //   },
            // });
            return h("span", params.row.checkSkuNumber);
          },
        },
        // mustCheck: {
        //   key: "checkSkuNumber",
        //   align: "center",
        //   title: "应检数量",
        //   render: (h, params) => {
        //     return h("InputNumber", {
        //       props: {
        //         value: v.proList[params.index].checkSkuNumber,
        //         min: 0,
        //         max: v.proList[params.index].replenishQuantity,
        //         formatter: (value) => {
        //           let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
        //           str = `${value}`.replace(/[^\d]/g, ""); // 清除"数字"和"."以外的字符
        //           return str;
        //         },
        //         //  disabled: this.orderType == "3" || this.orderType == "4",
        //         disabled:
        //           this.order.checkType == 0 || this.order.checkType == 2,
        //       },
        //       // style: {
        //       //   width: "50px",
        //       // },
        //       on: {
        //         "on-change": (val) => {
        //           v.proList[params.index].checkSkuNumber = val;
        //           v.proList[params.index].checkSkuRate = (
        //             (v.proList[params.index].checkSkuNumber * 100) /
        //             v.proList[params.index].replenishQuantity
        //           ).toFixed(0);
        //           v.countCheckRateSum();
        //           // v.proList[params.index].checkSkuNumber = val;
        //           // v.$set(v.proList[params.index], "checkSkuNumber", val);
        //         },
        //       },
        //     });
        //   },
        // },
        checkRate: {
          key: "checkSkuRate",
          align: "center",
          title: "质检比例",
          render: (h, { row }) => {
            // if (row.checkSkuRate == "NaN" || row.checkSkuRate == "Infinity") {
            //   row.checkSkuRate = 0;
            // }
            return h("span", `${row.checkSkuRate || "0"}%`);
          },
        },

        unitPrice: {
          key: "unitPrice",
          align: "center",
          title: "单价",
          width: 200,
          render: (h, params) => {
            return [
              h("InputNumber", {
                props: {
                  value: v.proList[params.index].unitPrice,
                  min: 0,
                  max: 9999999,
                  step: 0.01,
                  formatter: (value) => {
                    let str = `${value}`.replace(/B(?=(d{3})+(?!d))/g, ",");
                    return str;
                  },
                  disabled: v.orderType == "4",
                },
                on: {
                  "on-change": (val) => {
                    v.$set(v.proList[params.index], "unitPrice", val);
                    v.order.detailsResultList.forEach((n, i) => {
                      if (n.goodsId == params.row.goodsId) {
                        v.order.detailsResultList[i].unitPrice = val;
                      }
                    });
                  },
                },
              }),
            ];
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
                  type: "primary",
                  disabled: v.orderType == "4" || v.order.type == 2,
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
                    // 获取第三方标签
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
        if (
          v.order.type != 2 &&
          v.order.type != 3 &&
          name == "relatedPlatformGoods"
        ) {
          // 不是1688订单或混合订单不显示1688属性
          continue;
        }
        if (v.orderSource != "1" && name == "requiredQuantity") {
          // 不是需求下单不显示需求数量
          continue;
        }
        v.orderColumn.push(tableColumnList[name]);
      }
    },
    fixRuledCondition(ruledCondition) {
      let arr = [];
      if (ruledCondition) {
        JSON.parse(ruledCondition).forEach((i) => {
          if (i) {
            if (this.typeOf(i) === "object") {
              if (i.purchasePirceRange) {
                arr.push(
                  "采购单价范围" + i.purchasePirceRange.replace(/,/g, "")
                );
              } else if (i.purchaseFloatRange) {
                arr.push(
                  "采购浮动范围" + i.purchaseFloatRange.replace(/,/g, "") + "%"
                );
              }
            }
            if (i === "numgreaterthan") {
              arr.push("采购总数量大于需求数量");
            }
          }
        });
      }
      return arr;
    },
    supplierIdChangeFn(val, type) {
      this.getSettlementType();
      this.getSupplierType();
      !type && this.getAllSupplierGoodsUnitiPrice();
      this.checkIs1688(val);
    },
    // 确认选择供应商
    supplierConfirmHand (res) {
      if (this.$common.isEmpty(res) || this.$common.isEmpty(res.data)) return;
      if (this.order.supplierId == res.data.supplierId) return;
      this.$set(this.order, 'supplierId', res.data.supplierId);
      this.$nextTick(() => {
        this.supplierIdChangeFn(res.data.supplierId);
      });
    },
    // 判断当前商品是否都存在第三方标签
    checkHasOverseaTag() {
      if (this.$common.isEmpty(this.order.platformAndAccountCode)) {
        return;
      }
      if (this.$common.isEmpty(this.detailsResultGoodsIds) || this.$common.isEmpty(this.order.platformAndAccountCode)) {
        this.$set(this.order, 'platformAndAccountCode', '');
        return;
      }
      this.axios.post(api.checkNewOverseaTag, {
        productGoodsIdList: this.detailsResultGoodsIds,
        saleAccountId: this.order.platformAndAccountCode.split("-").slice(2).join("-")
      }).then((res) => {
        if (res.data && res.data.code == 0) {
          if (!(this.$common.isBoolean(res.data.datas) && res.data.datas)) {
            this.$Message.error('此第三方标签不能选择，有商品没有匹配到第三方标签资料')
            this.$set(this.order, 'platformAndAccountCode', '');
          }
        }
      }).catch(() => {
        this.$set(this.order, 'platformAndAccountCode', '');
      })

    },
    // 验证标签类型
    formeItemTagType(rule, value, callback) {
      this.$nextTick(() => {
        if (!this.validateTagType && !this.$common.isEmpty(this.detailsResultGoodsIds)) {
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
        this.checkHasOverseaTag()
        this.$nextTick(() => {
          this.$refs.order && this.$refs.order.validateField('tagType');
        })
      })
    },
    getAllSupplierGoodsUnitiPrice() {
      // 获取供应商报价
      let v = this;
      let params = {};
      params.supplierId = v.order.supplierId;
      if (v.proList.length === 0) return;
      params.supplierGoodsBos = v.proList.map((i) => {
        return {
          goodsIds: i.goodsId,
          requiredQuantity: i.backupQuantity || i.requiredQuantity || 1,
        };
      });
      v.axios.post(api.get_SupplierGoodsUnitiPrice, params).then((response) => {
        if (response.data.code === 0) {
          v.proList.forEach((i) => {
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
    /* purchaseTypeChangeFn(value) {
      this.order.purchaseType = value;
    }, */
    getSettlementType() {
      let v = this;
      v.supplierArr.forEach((n, i) => {
        if (n.supplierId == v.order.supplierId) {
          v.order.settlementType = n.settlementType;
          v.order.settlementTypeName = n.settlementTypeName;
        }
      });
    },
    getSupplierType() {
      let v = this;
      v.supplierArr.forEach((n, i) => {
        if (n.supplierId == v.order.supplierId) {
          v.order.supplierType = n.supplierType;
          v.order.supplierTypeName = n.supplierTypeName;
        }
      });
    },
    typeChange(val) {
      let v = this;
      if (!val) {
        v.order.type = 1;
      } else {
        let isAlibaba = false;
        let isNormal = false;
        if (v.order.detailsResultList.length > 0) {
          v.order.detailsResultList.forEach((n, i) => {
            if (n.relationPlatform) {
              isAlibaba = true;
            } else {
              isNormal = true;
            }
          });
          if (isAlibaba && !isNormal) {
            v.order.type = 2;
          } else if (isAlibaba && isNormal) {
            v.order.type = 3;
          }
        }
      }
    },
    payChange() {
      this.order.freightCharge = 0;
    },
    addProFn() {
      let v = this;
      if (!v.order.supplierId) return v.$Message.warning("请先选择供应商");
      if (!v.order.purchaseWarehouseId) {
        v.$Message.warning("请先选择采购仓库！！");
      } else {
        v.isShowAddPro = true;
      }
    },
    getProlist() {
      return new Promise((resolve) => {
        // 获取分页数据
        /* let start = (this.proPage.pageNum - 1) * this.proPage.pageSize; // 起始坐标
      let end =
        this.proPage.pageNum * this.proPage.pageSize <
        this.order.detailsResultList.length
          ? this.proPage.pageNum * this.proPage.pageSize
          : this.order.detailsResultList.length; // 结束坐标，如果结束坐标大于数组长度，改为数组的长度 */
        this.proList = this.order.detailsResultList.map((i) => {
          if (this.editType === "placeOrder") {
            // 只有下单的时候 需求数量等于下单数量
            i.replenishQuantity = i.requiredQuantity ? i.requiredQuantity : 1; // 下单数量 等于需求数量
          }
          return i;
        });
        this.selectSkuArr = [];
        this.$nextTick(() => {
          resolve(this.proList);
        })
      })
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
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
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addProductSuccess(data) {
      let v = this;
      v.skuLoading = true;
      let obj = {
        purchaseWarehouseId: v.order.purchaseWarehouseId,
        readyType: v.order.readyType,
        goodsInfoList: [],
      };
      data.forEach((n, i) => {
        obj.goodsInfoList.push({
          cnName: n.cnName,
          goodsId: n.productGoodsId,
          goodsUrl: n.goodsUrl,
          sku: n.sku,
          skc: n.skc,
          weight: n.weight,
          productGoodsSpecifications: n.productGoodsSpecifications,
        });
      });
      v.axios.post(api.purchaseQueryGoodsInfo, obj).then((res) => {
        if (res.data.code == 0) {
          res.data.datas.forEach((i) => {
            data.forEach((j) => {
              if (i.skuNo === j.sku) {
                i.productGoodsSpecifications = j.productGoodsSpecifications;
                if (this.$common.isEmpty(i.skc)) {
                  i.skc = j.skc;
                }
              }
            });
          });
          res.data.datas.forEach((m, j) => {
            let exist = false;
            v.order.detailsResultList.forEach((l, k) => {
              if (m.goodsId == l.goodsId) {
                // 当前商品已存在时，下单数量+1
                v.order.detailsResultList[k].replenishQuantity++;
                exist = true;
              }
            });
            if (!exist) {
              // 当前商品不存在时，新增一条数据
              // 添加重量
              obj.goodsInfoList.forEach((p) => {
                if (p.goodsId === m.goodsId) {
                  m.weight = p.weight;
                }
              });
              v.order.detailsResultList.push(
                Object.assign(m, {
                  weight: m.weight,
                  replenishQuantity: 0,
                  unitPrice: 0,
                  onWayDespatchNumber: m.onWayQuantity,
                })
              );
            }
          });
        }
        v.order.detailsResultList.forEach((item, index) => {
          v.$set(v.order.detailsResultList[index], "checkSkuNumber", 0);
          v.$set(v.order.detailsResultList[index], "checkSkuRate", 0);
        });
        v.skuLoading = false;
        v.getProlist();
        v.getAllSupplierGoodsUnitiPrice();
        //1688就去调选择1688商品列表
        if (this.is1688) {
          let getSupplier = this.supplierArr.find((item) => {
            return item.supplierId == this.order.supplierId;
          });
          if (this.$common.isEmpty(getSupplier)) {
            getSupplier = {}
          }
          const temp = {
            skus: obj.goodsInfoList.map((item) => {
              return item.sku;
            }),
            supplierName: getSupplier.supplierName,
            supplierId: this.order.supplierId
          };
          // 获取对应 1688 的供应商
          this.axios.post('/sps-service/sps/requirement/queryAliSkus', temp).then((res) => {
            const list = (!res.data && res.data.code != 0) ? [] : res.data.datas || [];
            if (list.length == 0) {
              this.proList.forEach((itema, indexa) => {
                this.$set(this.proList[indexa], 'aliSkus', []);
                this.$set(this.proList[indexa], 'platformSkuId', '');
              });
              return;
            }
            const skuNoList = this.proList.map(item => item.skuNo);
            let includesSkuObj = {};
            list.forEach(item => {
              if (skuNoList.includes(item.sku)) {
                includesSkuObj[item.sku] = item;
              }
            });
            //给每个匹配的 sku 增加1688选择选项
            this.proList.forEach((item, index) => {
              if (Object.keys(includesSkuObj).includes(item.skuNo)) {
                this.$set(this.proList[index], 'aliSku', includesSkuObj[item.skuNo].aliSkuList || []);
              } else {
                this.$set(this.proList[index], 'aliSku', []);
              }
            });
          });
        } else {
          this.proList.forEach((itema, indexa) => {
            this.$set(this.proList[indexa], 'aliSkus', []);
            this.$set(this.proList[indexa], 'platformSkuId', '');
          });
        }
        this.isShowAddPro = false;
      });
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
      v.$Spin.show();
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
            v.$Spin.hide();
            if (res.data.code == 0) {
              v.$Message.success("操作成功");
              v.$emit("addOrderGoBack", v.$store.state.thisPage);
            } else if (res.data.code === 227007) {
              v.$Message.error("供应商已停用");
            }
          });
        }
      });
    },
    cancelAction() {
      // 取消
      this.$emit("goBackFromAdd");
    },
    saveToBeSubmitted() {
      this.order.status = 1;
      this.saveAction("order", "saveLoading1");
    },
    saveToBeSubmittedMt() {
      this.order.status = 1;
      this.saveAction("order", "saveLoading1", api.purchaseSubmit);
    },
    saveMt() {
      this.order.status = 2;
      this.saveAction("order", "saveLoading");
    },
    // 获取第三方标签数据
    // getthirdPartyTagList() {
    //   return new Promise((resolve) => {
    //     this.axios.post(api.listByProductGoodsId, {
    //       productGoodsIdList: this.detailsResultGoodsIds
    //     }).then((res) => {
    //       if (res.data && res.data.code == 0) {
    //         (res.data.datas || []).forEach(item => {
    //           this.$set(this.overseaTagList, item.platformAndAccountCode, item);
    //         })
    //       }
    //       resolve(res);
    //     }).catch((error) => {
    //       console.error(error);
    //       resolve({});
    //     }).finally(() => {
    //       // 判断当前商品是否都存在第三方标签
    //       this.checkHasOverseaTag();
    //     })
    //   })
    // },
    saveAction(name, saveLoading, apiX) {
      let v = this;
      // if (this.order.checkType == 1) {
      //   let result = this.validateNumber();
      //   if (!result) return;
      // }
      if (v.order.detailsResultList.length == 0) {
        v.$Message.error({
          content: "请添加商品！",
          duration: 3,
          closable: true,
        });
      } else {
        let qtyError = v.order.detailsResultList.some(
          (item) => item.replenishQuantity == 0
        ); // 判断下单数量是否等于0
        let priceError = v.order.detailsResultList.some(
          (item) => item.unitPrice == 0
        ); // 判断价格是否等于0
        let wareIds = v.purchaseWarehouseArr
          .filter((i) => {
            if (i.warehouseStatus !== "1") {
              return i;
            }
          })
          .map((i) => i.warehouseId);
        let supplierIds = v.supplierArr
          .filter((i) => {
            if (i.purchaseWarehouseStatus !== "1") {
              return i;
            }
          })
          .map((i) => i.supplierId);
        if (qtyError) {
          v.$Message.error("下单数量不能为0");
          return;
        }
        if (priceError) {
          v.$Message.error("价格不能为0");
          return;
        }
        if (!wareIds.includes(v.order.purchaseWarehouseId)) {
          v.$Message.error("采购仓库未启用");
          return;
        }
        if (!supplierIds.includes(v.order.supplierId)) {
          v.$Message.error("供应商未启用");
          return;
        }
        //抽检校验
        v.$refs[name].validate((valid) => {
          // 校验通过后执行
          if (valid) {
            v[saveLoading] = true;
            // debugger
            let obj = v.deepCopy(v.order);
            // 采购需求管理页面
            obj.remarks = [
              {
                remark: obj.remark,
              },
            ]; // 参数修改
            delete obj.remark;
            //备注单独用接口，所以除了新增和复制，其他功能删除备注字段
            if (
              this.orderType != 1 &&
              this.orderType != 5 &&
              obj.purchaseId != "" &&
              obj.purchaseId != null
            ) {
              delete obj.remarks;
            }
            obj.isDeliveryPay = v.isDeliveryPay ? 1 : 0;
            obj.updateQuoteFlag = obj.updateQuoteFlag ? 1 : 0;
            obj.updateSupplierFlag = obj.updateSupplierFlag ? 1 : 0;
            obj.overshootState = obj.overshootState ? 1 : 0;
            obj.detailsResultList.forEach((i) => {
              i.requiredQuantity = i.backupQuantity;
            });
            v.currencyArr.filter((k) => {
              if (k.dataDesc == obj.currency) {
                obj.currency = k.dataValue;
              }
            });
            let apiUrl = "";
            if (apiX) {
              apiUrl = apiX;
            } else {
              if (v.orderSource == "1") {
                // 采购需求管理申请下单提交api
                apiUrl = api.requirementApplyOrder;
              } else if (v.orderSource == "2") {
                // 采购单管理添加采购单提交api
                apiUrl = api.purchaseSubmit;
              }
            }
            //质检新加参数
            obj.checkRateSum = this.order.checkRateSum;
            obj.planCheckNumber = this.planCheckNumber;

            obj.detailsResultList = this.proList;
            //1688走去选择交易方式
            // if (this.is1688) {
            //   return this.openDealModal(obj);
            // }
            obj.comingSpecial = obj.comingSpecial.join(',');

            v.$Spin.show();
            v.axios.post(apiUrl, obj).then((res) => {
              v.$Spin.hide();
              if (res.data.code == 0) {
                v.$Message.success("提交成功");
                v.$emit(
                  "addOrderGoBack",
                  v.$store.state.thisPage,
                  res.data.datas,
                  obj.status
                );
              }
              v[saveLoading] = false;
            });
          }
        });
      }
    },

    radioChange() {
      //免检
      if (this.order.checkType == 0) {
        this.proList.forEach((item) => {
          item.checkSkuNumber = 0;
          item.checkSkuRate = 0;
        });
        this.order.checkRateSum = 0;
      }
      //全检
      if (this.order.checkType == 2) {
        //应捡=下单数
        this.proList.forEach((item) => {
          item.checkSkuNumber = item.replenishQuantity;
          item.checkSkuRate = 100;
        });
        this.order.checkRateSum = 100;
      }
    },
    validateNumber() {
      //抽检:如果应检数量都为0或等于下单数量，下单时弹窗告知错误：质检类型为抽检时，应检数量不能都为0或都为下单数量；
      let isAllZero = true;
      let isAllReplenishQuantity = true;
      this.order.detailsResultList.forEach((item) => {
        if (item.checkSkuNumber != 0) isAllZero = false;
        if (item.checkSkuNumber != item.replenishQuantity) {
          isAllReplenishQuantity = false;
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
    confirmCheckNumberRule() {
      this.$set(this, "proList", this.proList);
      if (this.settingRule.radio1 == "1") {
        let spuList = [
          ...new Set(
            this.proList.map((item) => {
              return item.spu;
            })
          ),
        ];
        //根据相同spu分为一组
        let spuArr = [];
        spuList.forEach((itema) => {
          let arr = [];
          this.proList.forEach((itemb) => {
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
        this.countCheckSkuRate();
      }
      //sku抽检比例
      if (this.settingRule.radio1 == "2") {
        this.proList.forEach((item) => {
          item.checkSkuNumber = parseFloat(
            ((item.replenishQuantity * this.settingRule.input2) / 100).toFixed(
              0
            )
          );
          item.checkSkuRate = this.settingRule.input2;
        });
      }
      //sku抽检件数
      if (this.settingRule.radio1 == "3") {
        let isContinue = true;
        this.proList.forEach((item) => {
          if (item.replenishQuantity < parseFloat(this.settingRule.input3)) {
            isContinue = false;
          }
        });
        if (!isContinue) {
          return this.$Message.warning("抽检数量不得大于下单数量");
        }
        this.proList.forEach((item) => {
          item.checkSkuNumber = parseFloat(this.settingRule.input3);
          item.checkSkuRate = (
            (item.checkSkuNumber * 100) /
            item.replenishQuantity
          ).toFixed(0);
        });
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
    //计算质检总比例
    countCheckRateSum() {
      //总下单数
      let replenishQuantity = this.proList
        .map((item) => {
          return item.replenishQuantity;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      //总质检数
      let checkSkuNumber = this.proList
        .map((item) => {
          return item.checkSkuNumber;
        })
        .reduce((pre, cur) => {
          return pre + cur;
        });
      this.order.checkRateSum = (
        (checkSkuNumber * 100) /
        replenishQuantity
      ).toFixed(0);
    },
    //计算sku比例
    countCheckSkuRate() {
      this.proList.forEach((item) => {
        item.checkSkuRate = (
          (item.checkSkuNumber * 100) /
          item.replenishQuantity
        ).toFixed(0);
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
    calculateNumAndRate(index) {
      let temp = this.proList[index];
      temp.checkSkuNumber = parseInt(
        ((temp.replenishQuantity * temp.checkSkuRate) / 100).toFixed(0)
      );
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas.filter((item) => {
            return item.enable == 1;
          });
        });
    },
    //获取账号详情
    accountChange() {
      if (!this.accountParamQO.accountId) return;
      this.axios
        .get(
          `/sps-service/sps/setting/accountParam/${this.accountParamQO.accountId}`
        )
        .then((res) => {
          this.accountParamQO.orderType = res.data.datas.orderType;
          this.accountParamQO.aliMessage = res.data.datas.aliMessage;
          this.accountParamQO.purchaseMessage = res.data.datas.purchaseMessage;
        });
    },
    checkIs1688(val) {
      if (!val) return;
      this.supplierArr.forEach((item) => {
        if (item.supplierId == val) {
          this.is1688 = item.setupStatus == 0 ? false : true;
        }
      });
      // this.changeTableProductView();
    },
    openDealModal(obj) {
      if (!this.accountParamQO.accountId) {
        return this.$Message.error("1688账号不能为空");
      }
      //判断选择1688商品
      let valid = true;
      this.proList.forEach((item) => {
        if (!item.platformSkuId) {
          valid = false;
        }
      });
      if (!valid) {
        return this.$Message.error("1688商品不能为空");
      }
      this.supplierArr.forEach((item) => {
        if (item.supplierId == obj.supplierId) {
          obj.supplierName = item.supplierName;
        }
      });

      obj.accountParamQO = this.accountParamQO;
      obj.setupStatus = this.is1688 ? 1 : 0;
      this.axios.post(api.createOrderPreview, [obj]).then((res) => {
        // if (res.data.code == 999993) {
        //   return this.$Message.error(res.data.message);
        // }
        this.dealModal = true;
        if (res && res.data && res.data.datas) {
          if (!this.$common.isEmpty(res.data.datas.fail) && res.data.datas.fail > 0) {
            this.getDealWayError(res.data.datas.error);
          }
          this.data1 = (res.data.datas || []).map((item) => {
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
      });
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
    //获取1688账号
    getAccount() {
      this.axios.post(`${api.postQueryAccount}?businessDeptIds=${this.businessDeptIds}`).then((res) => {
        this.accountList = res.data.datas;
      });
    },
    changeTableProductView() {
      let temp = {
        key: "choose1688Product",
        title: "选择1688商品",
        width: 180,
        slot: "choose1688Product",
      };
      //判断是否1688 0不是 1是
      if (!this.is1688) {
        //向供应商下单
        if (
          this.orderColumn
            .map((item) => {
              return item.key;
            })
            .includes("choose1688Product")
        ) {
          this.orderColumn.splice(10, 1);
        }
      } else {
        //1688
        if (
          !this.orderColumn
            .map((item) => {
              return item.key;
            })
            .includes("choose1688Product")
        ) {
          this.orderColumn.splice(10, 0, temp);
        }
      }
    },
    dealWayConfirm() {
      let validStatus = true;
      this.data1.forEach((item) => {
        if (!item.tradeType) {
          validStatus = false;
        }
      });
      this.data1.forEach((itema) => {
        this.accountList.forEach((itemb) => {
          if (itema.accountParamQO.accountId == itemb.accountId) {
            itema.accountParamQO.accountName = itemb.accountCode;
          }
        });
      });

      if (!validStatus) return this.$Message.error("交易方式不能为空");
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
            this.$emit("addOrderGoBack", this.$store.state.thisPage);
          }
        }
      });
    },
    // 商品标签切换事件
    tagTypeChange(e) {
      let arr = this.order.comingSpecial || [];
      if (e == 1) {
        if (!arr.includes('1')) arr.push('1');// 自动选择第三方标签
      } else {
        let index = arr.indexOf('1');
        if (index >= 0) arr.splice(index, 1);// 取消选择第三方标签
      }
      this.$set(this.order, 'comingSpecial', arr);
    }
  },
};
</script>
<style scoped >
.top-btn-wrapper {
  position: absolute;
  top: 20px;
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

.textOrange {
  margin-left: 10px;
  color: orange;
}

.addPurOrdMod .ivu-icon {
  font-size: 26px;
  color: #ff9900;
}

.remarkTextarea>>>.ivu-form-item-content {
  margin-left: 32px !important;
}

.addIcon {
  font-size: 20px;
  font-weight: 600;
  color: #2d8cf0;
  margin-left: 10px;
}

.remarkItemTextarea>>>.ivu-form-item-content {
  margin-left: 30px !important;
}

.remarkTextarea>>>textarea {
  width: 500px !important;
  height: 60px !important;
}

.itemRemark {
  margin-left: 20px;
  display: inline;
  white-space: pre-wrap;
  width: 400px !important;
  word-wrap: break-word;
}

.remarkItemTextarea>>>.ivu-form-item-content {
  line-height: 20px !important;
}

.paraTitle {
  font-size: 16px;
  font-weight: bold;
}
</style>
<style>
.addProductBar .ivu-modal-footer {
  display: none;
}

.addPurOrdForm {
  margin-right: 60px;
}

.addPurOrdForm .ivu-form-item-content {
  margin-left: 120px !important;
}

.addPurOrdForm .ivu-form-item-label {
  width: 120px !important;
}

.addPurOrdForm textarea.ivu-input {
  height: 80px !important;
}
</style>
<style scoped lang="less">
.ivu-form-item {
  margin-bottom: 12px;
}

.product-info-head {
  display: flex;
  padding: 0 15px 10px 15px;
  justify-content: space-between;
  border-bottom: 1px dashed #dddee1;

  .product-info-title {
    font-size: 16px;
    font-weight: bold;
  }
}

.product-info-operate {
  display: flex;
  padding: 15px 15px 0px 15px;
  justify-content: space-between;
}

.product-info-tips {
  font-size: 12px;
  color: #f60;
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
    margin-left: 5px;
    white-space: nowrap;
  }
}
</style>
