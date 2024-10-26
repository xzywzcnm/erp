<template>
  <div style="overflow-y: auto; max-height: 350px">
    <Row>
      <Form
        ref="addSupplier"
        :model="addSupplier"
        :rules="addSupplierRules"
        class="rest supplierN"
      >
        <Row>
          <Col span="20">
            <FormItem prop="supplier">
              <label slot="label" class="redDot">供应商名称</label>
              <dyt-select
                v-model="addSupplier.supplier"
                class="wid"
                :disabled="isDisable"
                ref="supplierRefSelect"
              >
                <Input
                  type="text"
                  size="small"
                  style="width: calc(100% - 20px); margin: 10px"
                  v-model="supplierName"
                >
                  <Button
                    slot="append"
                    icon="ios-search"
                    @click.native="queryGetSupplierMt"
                  ></Button>
                </Input>
                <Option
                  v-for="(item, index) in supplierList"
                  :key="index"
                  :value="item.supplierId"
                  :disabled="item.disable"
                  :title="item.disable ? '' + '供应商已选' + '' : ''"
                  >{{ item.supplierName }}</Option
                >
                <Page
                  @on-change="changePageSupplier"
                  :current="supplierPageNumAdd"
                  :total="SupplierTotal"
                  simple
                  :transfer="true"
                ></Page>
              </dyt-select>
              <Button type="primary" @click="addNewSupplier">新增供应商</Button>
              <i-switch
                v-model="isDefault"
                :disabled="isDisable"
                title="设置为默认供应商"
              ></i-switch
              ><span>(设置为默认供应商)</span>

              <!-- <Button @click="goSupplier">新增供应商</Button>-->
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="12">
            <FormItem prop="deliveredFromCountry">
              <label slot="label" class="redDot">发货地</label>
              <dyt-select
                v-model="addSupplier.deliveredFromCountry"
                ref="selectA"
                class="wid1"
                style="width: 98px"
                filterable
                :transfer="true"
                @on-change="getCountryId(addSupplier.deliveredFromCountry)"
                :disabled="isDisable"
              >
                <Option
                  v-for="(item, index) in CountryList"
                  :key="index"
                  :value="item.countryId"
                  :label="item.cnName"
                ></Option>
              </dyt-select>
              <dyt-select
                v-model="addSupplier.deliveredFromProvince"
                filterable
                :transfer="true"
                class="wid1"
                style="width: 98px"
                ref="selectB"
                @on-change="getStateId(addSupplier.deliveredFromProvince)"
                :disabled="isDisable"
              >
                <Option
                  v-for="(item, index) in ProvinceList"
                  :key="index"
                  :value="item.stateId"
                  :label="item.cnName"
                ></Option>
              </dyt-select>
              <dyt-select
                v-model="addSupplier.deliveredFromCity"
                filterable
                :transfer="true"
                class="wid1"
                style="width: 98px"
                ref="selectC"
                :disabled="isDisable"
              >
                <Option
                  v-for="(item, index) in deliveredList"
                  :key="index"
                  :value="item.cityId"
                  :label="item.cnName"
                ></Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="12" v-if="!isSim">
            <FormItem prop="unitPrice">
              <label slot="label" class="redDot">产品单价</label>
              <Input
                v-model.trim="addSupplier.unitPrice"
                class="wid1"
                :maxlength="22"
                :disabled="isDisable"
              />
              <dyt-select
                v-model="addSupplier.unitPriceCurrency"
                class="wid1"
                @on-change="unitPriceCurrencyChange"
                :disabled="isDisable"
              >
                <Option
                  v-for="(item, index) in $store.state.currencyList"
                  :key="index"
                  :value="item.code"
                  >{{ item.name }}</Option
                >
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="12" v-if="isSim">
            <FormItem>
              <label slot="label" class="redDot">价格/重量</label>
              <Button v-show="isSim" type="primary" @click="openAttrPrice"
                >多属性</Button
              >
            </FormItem>
          </Col>
        </Row>
        <Col span="12" v-if="!isSim">
          <FormItem prop="productWeight">
            <label slot="label" class="redDot">重量(g)</label>
            <Input
              v-model.trim="addSupplier.productWeight"
              :disabled="isDisable"
              style="width: calc(100% - 100px)"
              :maxlength="22"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem prop="profitRate">
            <label slot="label">利润率(%)</label>
            <Input
              v-model.trim="addSupplier.profitRate"
              class="wid1"
              :maxlength="22"
              :disabled="isDisable"
            />
            <Button @click="openCalc">运费明细</Button>
            <!-- <Button v-show="isSim" type="primary" @click="openAttrPrice">多属性</Button>-->
          </FormItem>
        </Col>

        <Col span="24">
          <FormItem>
            <label slot="label" class="fl" style="width: 100%">阶梯价格</label>
            <div class="fl">
              <Row>
                <Col
                  class="mb10"
                  v-for="(item, index) in addSupplier.listStepQuotation"
                  :key="index"
                  >数量><Input
                    :class="{ redBor: validateAmountIs }"
                    class="wid1"
                    v-model.trim="item.amount"
                    @on-blur="validateAmount"
                    :maxlength="10"
                    :disabled="$store.state.curNodeId !== 3"
                  />，价格<Input
                    :class="{ redBor: validateAmountIs }"
                    class="wid1"
                    v-model="item.unitPrice"
                    :disabled="isDisable"
                    :maxlength="22"
                    @on-blur="validateAmount"
                  />
                  <Icon
                    type="md-add"
                    class="plusIcon"
                    v-show="
                      $store.state.curNodeId === 3 &&
                      $store.state.curNodeControl === 999
                    "
                    @click="addListStepQuotation(index)"
                  ></Icon>
                  <Icon
                    type="md-remove"
                    class="plusIcon"
                    v-show="
                      addSupplier.listStepQuotation.length > 1 &&
                      $store.state.curNodeId === 3 &&
                      $store.state.curNodeControl === 999
                    "
                    @click="removeListStepQuotation(index)"
                  ></Icon>
                </Col>
                <div
                  class="ivu-form-item-error-tip"
                  style="left: 0px !important"
                  v-show="validateAmountIs"
                >
                  请输入正确的阶梯价格和数量，数量应逐级递增
                </div>
              </Row>
            </div>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem>
            <label slot="label">采购运费</label>
            <Input
              v-model.trim="addSupplier.freightPrice"
              class="wid1"
              :maxlength="22"
              :disabled="isDisable"
            />
            <dyt-select
              v-model="addSupplier.freightPriceCurrency"
              class="wid1"
              :disabled="isDisable"
            >
              <Option
                v-for="item in $store.state.currencyList"
                :key="item.code"
                :value="item.code"
                >{{ item.name }}</Option
              >
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem prop="minBatch">
            <label slot="label" class="redDot">起批量</label>
            <Input
              v-model.trim="addSupplier.minBatch"
              class="wid1"
              :disabled="isDisable"
              :maxlength="10"
            />
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem prop="purchasePeriod">
            <label slot="label" class="redDot">采购交期</label>
            <Input
              v-model.trim="addSupplier.purchasePeriod"
              :disabled="isDisable"
              :maxlength="10"
              class="wid1"
            />天
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem prop="productLength">
            <label slot="label" class="redDot">商品尺寸(cm)</label>
            长<Input
              v-model.trim="addSupplier.productLength"
              :disabled="isDisable"
              class="wid1"
              :maxlength="22"
            />
            宽<Input
              v-model.trim="addSupplier.productWidth"
              :disabled="isDisable"
              class="wid1"
              :maxlength="22"
            />
            高<Input
              v-model.trim="addSupplier.productHeight"
              :disabled="isDisable"
              class="wid1"
              :maxlength="22"
            />
          </FormItem>
        </Col>
        <Col span="18">
          <FormItem>
            <label slot="label">产品链接</label>
            <Input
              v-model.trim="addSupplier.productUrl"
              :disabled="isDisable"
              class="wid"
              :maxlength="1000"
            />
            <Button @click="copyText" size="small" class="ml5">复制</Button>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem>
            <label slot="label">是否提供图片</label>
            <i-switch
              v-model="isPictureSupplier"
              :disabled="isDisable"
            ></i-switch>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem>
            <label slot="label">备注</label>
            <Input
              v-model.trim="addSupplier.remark"
              :disabled="isDisable"
              type="textarea"
              class="wid"
              :maxlength="2000"
            />
          </FormItem>
        </Col>
      </Form>
    </Row>
    <calc
      ref="calc"
      :curType="'inquiry'"
      :purchase="calcPurchase"
      :weight="calcWeight"
      @setSalesOl="setSalesOl"
    ></calc>
    <attrPrice
      ref="attrPrice"
      @getAttrPrice="getAttrPrice"
      :attrPriceDateInit="addSupplier.listVariQuotationInfo"
    ></attrPrice>
    <Modal
      v-model="supplierModel"
      v-if="newSupplierStatus"
      transfer
      title="新增供应商"
      width="800"
      :loading="supplierLoading"
      :mask-closable="false"
      @on-ok="saveSupplier"
      @on-cancel="cancelSupplier"
    >
      <template v-if="$store.state.ierpStatus === '1'">
        <newAddSupplier></newAddSupplier>
      </template>
      <template v-else>
        <Card shadow>
          <p slot="title">基本资料</p>
          <Form
            ref="supplierRefForm"
            :model="supplierForm"
            :rules="supplierFormValid"
            class="supplierForm"
            :label-width="90"
          >
            <FormItem label="名称" prop="corporationFullname">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="text"
                    placeholder="请填写名称"
                    v-model.trim="supplierForm.corporationFullname"
                  />
                </Col>
                <!-- <Col>
                <Checkbox style="margin-left: 20px" v-model="supplierForm.status">1688供应商</Checkbox>
              </Col> -->
              </Row>
            </FormItem>
            <FormItem label="代码" prop="supplierCode">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="text"
                    placeholder="请填写代码"
                    v-model.trim="supplierForm.supplierCode"
                  />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="等级" prop="supplierGrade">
              <Row type="flex">
                <Col :span="12">
                  <dyt-select v-model="supplierForm.supplierGrade">
                    <Option value="1">一等供应商</Option>
                    <Option value="2">二等供应商</Option>
                    <Option value="3">三等供应商</Option>
                  </dyt-select>
                </Col>
              </Row>
            </FormItem>
            <FormItem label="分配采购员" prop="purchaserId">
              <Row type="flex">
                <Col :span="12">
                  <dyt-select v-model="supplierForm.purchaserId">
                    <Option
                      v-for="item in userInfoList"
                      :value="item.userId"
                      :key="item.userId"
                      >{{ item.userName }}</Option
                    >
                  </dyt-select>
                </Col>
              </Row>
            </FormItem>
            <FormItem label="介绍" prop="description">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="textarea"
                    v-model.trim="supplierForm.description"
                  />
                </Col>
              </Row>
            </FormItem>
          </Form>
        </Card>
        <Card shadow>
          <p slot="title">财务结算</p>
          <Form
            ref="supplierRef"
            :model="supplierForm"
            :rules="supplierFormValid"
            class="supplierForm"
            :label-width="90"
          >
            <FormItem label="财务结算" prop="clearingForm">
              <Row type="flex" :gutter="20">
                <Col :span="12">
                  <dyt-select
                    v-model="supplierForm.clearingForm"
                    @on-change="chagneCleanForm"
                  >
                    <Option value="1">货到付款</Option>
                    <Option value="2">款到发货</Option>
                    <Option value="4">快递代收</Option>
                    <Option value="5">定期结算</Option>
                  </dyt-select>
                </Col>
                <Col v-if="supplierForm.clearingForm === '5'">
                  <dyt-select v-model="supplierForm.paymentType">
                    <Option value="1">日结</Option>
                    <Option value="2">周结</Option>
                    <Option value="4">半月结</Option>
                    <Option value="5">月结</Option>
                  </dyt-select>
                </Col>
              </Row>
            </FormItem>
            <FormItem label="结算方式备注" prop="clearingRemark">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="text"
                    v-model.trim="supplierForm.clearingRemark"
                  />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="支付方式" prop="paymentMode">
              <Row type="flex">
                <Col :span="12">
                  <dyt-select v-model="supplierForm.paymentMode">
                    <Option value="1">现金</Option>
                    <Option value="2">银行转账</Option>
                    <Option value="3">PayPal</Option>
                    <Option value="4">支付宝</Option>
                  </dyt-select>
                </Col>
              </Row>
            </FormItem>
            <template v-if="supplierForm.paymentMode === '2'">
              <FormItem label="开户行" prop="bank">
                <Row type="flex">
                  <Col :span="12">
                    <Input type="text" v-model.trim="supplierForm.bank" />
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="帐号" prop="payeeAccount">
                <Row type="flex">
                  <Col :span="12">
                    <Input
                      type="text"
                      v-model.trim="supplierForm.payeeAccount"
                    />
                  </Col>
                </Row>
              </FormItem>
              <FormItem label="开户名" prop="accountName">
                <Row type="flex">
                  <Col :span="12">
                    <Input
                      type="text"
                      v-model.trim="supplierForm.accountName"
                    />
                  </Col>
                </Row>
              </FormItem>
            </template>
            <template v-if="supplierForm.paymentMode === '3'">
              <FormItem label="PayPal帐号" prop="payeeAccount">
                <Row type="flex">
                  <Col :span="12">
                    <Input
                      type="text"
                      v-model.trim="supplierForm.payeeAccount"
                    />
                  </Col>
                </Row>
              </FormItem>
            </template>
            <template v-if="supplierForm.paymentMode === '4'">
              <FormItem label="支付宝帐号" prop="payeeAccount">
                <Row type="flex">
                  <Col :span="12">
                    <Input
                      type="text"
                      v-model.trim="supplierForm.payeeAccount"
                    />
                  </Col>
                </Row>
              </FormItem>
            </template>
          </Form>
        </Card>
        <Card shadow>
          <p slot="title">联系方式</p>
          <Form
            ref="supplierRef"
            :model="supplierForm"
            class="supplierForm"
            :label-width="90"
          >
            <FormItem label="联系人" prop="linkman">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.linkman" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="联系电话" prop="telephone">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.telephone" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="传真号" prop="faxNumber">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.faxNumber" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="email" prop="email">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.email" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="QQ号" prop="qqNumber">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.qqNumber" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="阿里旺旺" prop="wantWantNumber">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="text"
                    v-model.trim="supplierForm.wantWantNumber"
                  />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="邮编" prop="postalCode">
              <Row type="flex">
                <Col :span="12">
                  <Input type="text" v-model.trim="supplierForm.postalCode" />
                </Col>
              </Row>
            </FormItem>
            <FormItem label="地址" prop="">
              <Row type="flex" :gutter="10">
                <Col :span="6">
                  <dyt-select
                    v-model="countryCode"
                    filterable
                    placeholder="请选择国家"
                    @on-change="getState"
                  >
                    <Option
                      v-for="item in CountryList"
                      :value="
                        item.countryId + ',' + item.twoCode + ',' + item.cnName
                      "
                      :key="item.countryId"
                      >{{ item.cnName }}</Option
                    >
                  </dyt-select>
                </Col>
                <Col :span="6" v-if="showState">
                  <dyt-select
                    v-model="stateCode"
                    placeholder="请选择州/省"
                    @on-change="getCity"
                    filterable
                  >
                    <Option
                      v-for="item in ProvinceList"
                      :value="
                        item.stateId + ',' + item.code + ',' + item.cnName
                      "
                      :key="item.stateId"
                      >{{ item.cnName }}</Option
                    >
                  </dyt-select>
                </Col>
                <Col :span="6" v-if="showCity">
                  <dyt-select
                    v-model="cityCode"
                    placeholder="请选择市/区"
                    @on-change="getCityName"
                    filterable
                  >
                    <Option
                      v-for="item in deliveredList"
                      :value="item.code + ',' + item.cnName"
                      :key="item.cityId"
                      >{{ item.cnName }}</Option
                    >
                  </dyt-select>
                </Col>
              </Row>
            </FormItem>
            <FormItem label="详细地址" prop="detailAddress">
              <Row type="flex">
                <Col :span="12">
                  <Input
                    type="text"
                    v-model.trim="supplierForm.detailAddress"
                  />
                </Col>
              </Row>
            </FormItem>
          </Form>
        </Card>
      </template>
    </Modal>
    <newAddSupplier ref="newAddSupplier"></newAddSupplier>
  </div>
</template>
<style>
.deleteLabelWidth .ivu-form-item-content {
  margin-left: 0 !important;
}

.supplierForm .ivu-form-item {
  margin-bottom: 10px;
}

.supplierForm .ivu-form-item-error {
  margin-bottom: 25px;
}
</style>
<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import attrPrice from "./commonAttrPrice";
import calc from "./costCalculation";
import api from "@/api/api";
import newAddSupplier from "@v/pds/common/newAddSupplier";

export default {
  name: "commonAddSupplier", // 供应商详情
  mixins: [CommonMixin],
  props: ["type", "strQuotationId", "list"],
  components: {
    attrPrice,
    calc,
    newAddSupplier,
  },
  data() {
    let v = this;
    return {
      newSupplierList: [],
      cityCode: null,
      userInfoList: [],
      supplierLoading: true,
      stateCode: null,
      countryCode: null,
      showState: false,
      showCity: false,
      supplierFormValid: {
        corporationFullname: [
          {
            required: true,
            message: "供应商名称不能为空",
            trigger: "blur",
          },
        ],
        payeeAccount: [
          {
            required: true,
            message: "该选项不能为空",
            trigger: "blur",
          },
        ],
        bank: [
          {
            required: true,
            message: "该选项不能为空",
            trigger: "blur",
          },
        ],
        accountName: [
          {
            required: true,
            message: "该选项不能为空",
            trigger: "blur",
          },
        ],
      },
      supplierForm: {
        corporationFullname: "",
        supplierCode: "",
        description: "",
        supplierGrade: "1",
        paymentMode: "1",
        purchaserId: "",
        clearingForm: "1",
        clearingRemark: "",
        linkman: "",
        telephone: "",
        faxNumber: "",
        detailAddress: "",
        stateCode: "",
        countryCode: "",
        cityCode: "",
        wantWantNumber: "",
        payeeAccount: "",
        bank: "",
        accountName: "",
      },
      supplierModel: false,
      newSupplierStatus: false,
      calcPurchase: 0,
      calcWeight: 0,
      loading1: false,
      SupplierTotal: 0,
      supplierName: "",
      SupplierPageNum: 0,
      isSim: false, // 是否为单品
      supplierList: [],
      CountryList: [], // 国家
      ProvinceList: [], //
      deliveredList: [], //
      addSupplier: {
        // 主表信息：
        isDefault: 0, // 是否为默认供应商 0 否 1 是
        isPictureSupplier: 0, // 是否提供图片
        deliveredFromCountry: "64961f3d-9e6b-11e7-87bc-0050568e2f6d", // 发货地-国家
        deliveredFromProvince: "", // 发货地-省份
        deliveredFromCity: "", // 发货地-市
        freightPrice: "", // 采购运费
        freightPriceCurrency: "CNY", // 采购运费币种
        minBatch: "", // 起批量
        productHeight: "", // 商品尺寸-高
        productId: "", // 新品需求ID,必需
        productLength: "", // 商品尺寸-长
        productUrl: "", // 产品链接
        productWeight: "", // 重量
        productWidth: "", // 商品尺寸-宽
        profitRate: "", // 利润率
        purchasePeriod: "", // 采购交期
        quotationId: "", // 供应商报价ID,修改时必需，新增时不需
        remark: "", // 备注
        supplier: "", // 供应商名称（后续有供应商信息接口后，后台保存供应商编号）
        unitPrice: "", // 产品单价
        unitPriceCurrency: "CNY", // 产品单价币种
        // 阶梯报价信息（若对象不为空，则下列必填属性不能为空）：
        listStepQuotation: [
          {
            amount: "", // 数量，必填
            stepQuotationId: "", // 阶梯报价记录ID，修改时必需，新增时不需
            unitPrice: "", // 价格，必填
            isDeleted: null,
          },
        ], // 多属性报价信息（若对象不为空，则下列必填属性不能为空）
        listVariQuotationInfo: [
          {
            goodPrice: "", // 产品价格，必填
            goodWeight: "", // 产品重量，必填
            productGoodsId: "", // 货品ID,关联货品信息表，不能为空
            variQuotationId: "", // 多属性报价记录ID，修改时必需，新增时不需
          },
        ],
      },
      addSupplierRules: {
        supplier: {
          required: true,
          message: "请选择供应商名称",
          trigger: "change",
        },
        deliveredFromCountry: {
          required: true,
          message: "请选择地区",
          trigger: "change",
        },
        unitPrice: {
          validator: v.validateUnitPrice,
          trigger: "blur",
        },
        purchasePeriod: {
          required: true,
          validator: v.validatepurchasePeriod,
          trigger: "blur",
        },
        productWeight: {
          validator: v.validateWeight,
          trigger: "blur",
        },
        productLength: {
          validator: v.validateSize,
          trigger: "blur",
        },
        profitRate: {
          validator: v.validateProfitRate,
          trigger: "blur",
        },
        freightPrice: {
          validator: v.validatefreightPrice,
          trigger: "blur",
        },
        minBatch: {
          validator: v.validateminBatch,
          trigger: "blur",
        },
      },
      attrPriceDateInit: null,
      listStepQuotationInfoInit: null,
      validateAmountIs: false,

      // productAttr: [], //商品尺寸
    };
  },
  mounted() {
    let v = this;
    v.getCountry();
    v.getCurrencyDropdownListMt();
    v.getUserMesCommon().then((result) => {
      if (result) {
        v.userInfoList = Object.values(v.$store.state.userInfoList);
      }
    });
    // if (v.$store.state.addSupplierType === "add" && v.addSupplier.deliveredFromCountry === "64961f3d-9e6b-11e7-87bc-0050568e2f6d") {
    //   v.$nextTick(() => {
    //     v.getCountryId(v.addSupplier.deliveredFromCountry);
    //   });
    // }
    if (v.type !== "edit") {
      v.queryGetSupplierMt();
    }
  },
  methods: {
    validatePhone() {
      // 电话校验，可共用，可为空，纯数字
      let reg = this.$regular.validatePhone;
      let phone = function (rule, value, callback) {
        if (value !== null && !reg.test(value)) {
          callback(new Error("格式有误"));
        } else {
          callback();
        }
      };
      return phone;
    },
    copyText() {
      var oInput = document.createElement("input");
      oInput.value = this.addSupplier.productUrl;
      document.body.appendChild(oInput);
      oInput.select();
      window.document.execCommand("Copy");
      this.$Message.success("复制成功");
      oInput.remove();
    },
    chagneCleanForm(value) {
      console.log("v:", value);
      if (value === "5") {
        this.supplierForm.paymentType = "1";
      }
    },
    showOtherItem() {
      // let v = this;
    },
    saveSupplier() {
      let v = this;
      if (v.supplierForm.corporationFullname === "") {
        v.$Message.error("名称不能为空");
        v.supplierLoading = false;
        v.$nextTick(function () {
          v.supplierLoading = true;
        });
        return false;
      }
      if (v.supplierForm.paymentMode === "2") {
        if (!v.supplierForm.bank) {
          v.$Message.error("开户行不能为空");
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        } else if (!v.supplierForm.payeeAccount) {
          v.$Message.error("开户帐号不能为空");
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        } else if (!v.supplierForm.accountName) {
          v.$Message.error("开户人不能为空");
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        }
      } else if (v.supplierForm.paymentMode === "3") {
        if (!v.supplierForm.payeeAccount) {
          v.$Message.error("PayPal帐号不能为空");
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        }
      } else if (v.supplierForm.paymentMode === "4") {
        if (!v.supplierForm.payeeAccount) {
          v.$Message.error("支付宝帐号不能为空");
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        }
      }
      const obj = {
        url: api.set_addSupplier,
        data: v.supplierForm,
        type: "put",
      };
      v.ajaxData(obj).then((response) => {
        if (response.code === 0) {
          v.$Message.success("操作成功");
          v.$refs.supplierRefForm.resetFields();
          v.countryCode = "";
          v.stateCode = "";
          v.showState = false;
          v.showCity = "";
          v.supplierForm.countryCode = "";
          v.supplierForm.stateCode = "";
          v.supplierForm.cityCode = "";
          v.supplierLoading = false;
          v.$refs.supplierRefForm.resetFields();
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          v.supplierModel = false;
        } else {
          v.supplierLoading = false;
          v.$nextTick(function () {
            v.supplierLoading = true;
          });
          return false;
        }
      });
    },
    cancelSupplier() {
      let v = this;
      v.$refs.supplierRefForm.resetFields();
      v.supplierModel = false;
    },
    addNewSupplier() {
      // 新增供应商
      let v = this;
      if (v.$store.state.ierpStatus === "1") {
        v.$refs.newAddSupplier.modal = true;
      } else {
        v.newSupplierStatus = true;
        v.$nextTick(function () {
          v.supplierModel = true;
        });
      }
    },
    setSalesOl(val) {
      this.addSupplier.profitRate = val;
    },
    changePageSupplier(val) {
      let v = this;
      v.SupplierPageNum = val - 1;
      v.getSupplierMt();
    },
    goSupplier() {
      let origin = window.location.origin;
      window.open(origin + "/purchase/supplier/index.htm");
    },
    queryGetSupplierMt() {
      if (this.$store.state.ierpStatus === "1") {
        this.SupplierPageNum = 1;
      } else {
        this.SupplierPageNum = 0;
      }
      this.getSupplierMt();
    },
    getSupplierMt() {
      let v = this;
      let apiUrl = api.getSupplierInfo;
      if (v.$store.state.ierpStatus === "1") {
        apiUrl = api.getNewSupplierInfo;
      }
      v.$axios
        .post(apiUrl, {
          supplierName: v.supplierName,
          pageNum: v.SupplierPageNum,
          pageSize: 10,
          auditStatus: 3, // 已审核
          businessDeptId: this.securityUser.businessDeptId,
          businessDeptIds: this.securityUser.businessDeptIds,
        })
        .then((res) => {
          v.loading1 = false;
          if (res.code === 0) {
            v.$store.state.inquiryList.forEach((child) => {
              if (res.datas.list) {
                res.datas.list.forEach((item) => {
                  if (item.supplierId === child.supplier) {
                    item.disable = true;
                  }
                });
              }
            });
            v.supplierList = res.datas.list;
            v.SupplierTotal = res.datas.total;
          } else {
            v.$msg.error("请求失败");
          }
        });
    },
    // 获取多属性列表
    getVariListMt() {
      this.resetDate();
      this.$Spin.show();
      this.$axios
        .get(api.getQueryVari + "?productId=" + this.$store.state.createId)
        .then((res) => {
          if (res.code === 0) {
            var data = res.datas;
            this.isSim = data.length > 0;
          }
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    openCalc() {
      let price;
      let weight;
      if (!this.isSim) {
        price = this.addSupplier.unitPrice * 1;
        weight = this.addSupplier.productWeight * 1;
      } else {
        price = this.addSupplier.listVariQuotationInfo[0].goodPrice * 1;
        weight = this.addSupplier.listVariQuotationInfo[0].goodWeight * 1;
      }
      if (price === 0 || weight === 0) {
        this.$msg.error("请填写产品价格和重量");
        return;
      }
      this.calcPurchase = price;
      this.calcWeight = weight;
      this.$refs.calc.calcModal = true;
    },
    freightPriceCurrencyChange() {
      let v = this;
      v.$refs.addSupplier.validateField("freightPrice");
    },
    validateminBatch(rule, value, callback) {
      let v = this;
      var reg = v.$regular.validateInteger;
      if (value === "" || value === null) {
        callback(new Error("起批量不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入正确的起批量"));
      } else {
        callback();
      }
    },
    validateWeight(rule, value, callback) {
      //  var reg = /^[1-9]([0-9])*?\.?[0-9]*|^[0-9]\.[0-9]*$/;
      var reg = this.nubReg;
      // let v = this;
      if (value === "" || value === null) {
        callback(new Error("重量不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入正确的重量"));
      } else {
        callback();
      }
    },
    validatepurchasePeriod(rule, value, callback) {
      //  var reg = /^[1-9]([0-9])*?\.?[0-9]*|^[0-9]\.[0-9]*$/;
      let v = this;
      var reg = v.$regular.validateInteger;
      // var reg = this.nubReg;
      if (value === "" || value === null) {
        callback(new Error("采购交期不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("请输入正确的采购交期"));
      } else {
        callback();
      }
    },
    validateProfitRate(rule, value, callback) {
      var reg = this.nubReg;
      // let v = this;
      if (value === "" || value === null) {
        callback();
      } else if (!reg.test(+value)) {
        callback(new Error("请输入正确的利润率"));
      } else {
        callback();
      }
    },
    validatefreightPrice(rule, value, callback) {
      var reg = this.nubReg;
      let v = this;
      if (
        (value === "" || value === null) &&
        (v.addSupplier.freightPriceCurrency === "" ||
          v.addSupplier.freightPriceCurrency == null)
      ) {
        callback();
      } else if (!reg.test(value)) {
        callback(new Error("请正确的填写采购运费"));
      } else if (v.addSupplier.freightPriceCurrency === "") {
        callback(new Error("请选择的填写采购运费单位"));
      } else {
        callback();
      }
    },
    validateAmount() {
      let v = this;
      let amount = -1;
      let reg = this.nubReg;
      let reg1 = v.$regular.validateAmount;
      v.validateAmountIs = false;
      v.addSupplier.listStepQuotation.some((item) => {
        if (
          (item.amount !== "" && !reg1.test(item.amount)) ||
          (item.unitPrice !== "" && !reg.test(item.unitPrice))
        ) {
          v.validateAmountIs = true;
          return true;
        }
        if (+item.amount < +amount) {
          v.validateAmountIs = true;
          return true;
        }
        amount = item.amount;
      });
    },
    getSupplierList(id, callback) {
      let v = this;
      v.SupplierPageNum = 0;
      v.addSupplier.supplier = "";
      v.loading1 = true;
      let apiUrl = api.getSupplierInfo;
      if (v.$store.state.ierpStatus === "1") {
        apiUrl = api.getNewSupplierInfo;
        v.SupplierPageNum = 1;
      }
      v.$axios
        .post(apiUrl, {
          supplierName: v.$refs.supplierRefSelect.query,
          pageNum: v.SupplierPageNum,
          pageSize: 10,
          businessDeptId: this.securityUser.businessDeptId,
          businessDeptIds: this.securityUser.businessDeptIds,
        })
        .then((res) => {
          v.loading1 = false;
          if (res.code === 0) {
            v.$store.state.inquiryList.forEach((child) => {
              if (res.datas.list) {
                res.datas.list.forEach((item) => {
                  if (item.supplierId === child.supplier) {
                    item.disable = true;
                  }
                });
              }
            });
            v.supplierList = res.datas.list;
            v.SupplierTotal = res.datas.total;
            callback && callback();
          } else {
            v.$msg.error("请求失败");
          }
        });
    },
    getCountry(callback) {
      let v = this;
      v.CountryList = [];
      v.$axios.get(api.queryCountry).then((res) => {
        if (res.code === 0) {
          v.CountryList = res.datas;
          callback && callback();
        }
      });
    },
    getStateId(id, callback) {
      let v = this;
      v.addSupplier.deliveredFromCity = "";
      v.$refs.selectC.reset();
      v.deliveredList = [];
      v.$axios.get(api.queryByStateId + "?stateId=" + id).then((res) => {
        if (res.code === 0) {
          v.deliveredList = res.datas;
          callback && callback();
        }
      });
    },
    getCountryId(id, callback) {
      let v = this;
      v.addSupplier.deliveredFromProvince = "";
      v.addSupplier.deliveredFromCity = "";
      v.$refs.selectB.reset();
      v.$refs.selectC.reset();
      v.ProvinceList = [];
      v.$axios.get(api.queryByCountryId + "?countryId=" + id).then((res) => {
        if (res.code === 0) {
          v.ProvinceList = res.datas;
          callback && callback();
        }
      });
    },
    // 编辑保存
    iditSave(callback) {
      let v = this;
      v.validateAmount();
      v.$refs.addSupplier.validate((valid) => {
        if (v.isSim && !v.priceWithWeight) {
          v.$msg.error("至少需要填写一个子产品的价格和重量");
          return;
        }
        if (valid && !v.validateAmountIs) {
          /* JSON.parse(v.listStepQuotationInfoInit).forEach(item=>{
           if(JSON.stringify(v.addSupplier.listStepQuotation).indexOf(item.stepQuotationId)<0){
           v.addSupplier.listStepQuotation.push({
           amount:'',
           stepQuotationId:item.stepQuotationId,
           unitPrice:'',
           isDeleted:true
           })
           }
           });
           v.addSupplier.listStepQuotation.forEach(item=>{
           if(item.amount === ''&&item.amount === ''){
           item.isDeleted=true;
           }
           });
           v.addSupplier.listStepQuotationInfo=v.addSupplier.listStepQuotation;
           v.$Spin.show();
           v.setNull(v.addSupplier);
           let arr=[]
           v.addSupplier.listVariQuotationInfo.forEach(item=>{
           if(item.goodPrice!==''&&item.goodWeight!==''&& item.variQuotationId!==''){
           arr.push(item);
           }
           });
           arr.length==0?v.addSupplier.listVariQuotationInfo=null:v.addSupplier.listVariQuotationInfo=arr; */
          // this.saveProductAttr();
          v.$axios
            .post(api.saveProductQuotationDetail, v.addSupplier)
            .then((res) => {
              v.$Spin.hide();
              if (res.code === 0) {
                v.$msg.success("保存成功");
                v.$store.commit("addSupplierType", "");
                v.$emit("goTabList", "list");
                callback && callback();
              } else {
                v.$msg.error("保存失败");
              }
            })
            .catch(() => {
              v.$Spin.hide();
            });
        }
      });
    },
    // 新增保存
    save(callback) {
      let v = this;
      v.validateAmount();
      v.$refs.addSupplier.validate((valid) => {
        if (v.isSim && !v.priceWithWeight) {
          v.$msg.error("至少需要填写一个子产品的价格和重量");
          return;
        }
        if (valid && !v.validateAmountIs) {
          v.$Spin.show();
          v.addSupplier.productId = v.$store.state.createId;
          v.addSupplier.listStepQuotation.forEach((item) => {
            if (item.amount === "" && item.amount === "") {
              item.isDeleted = true;
            }
          });
          v.addSupplier.listStepQuotationInfo = v.addSupplier.listStepQuotation;
          /*
           * {goodPrice: "", goodWeight: "", productGoodsId: "", variQuotationId: ""}
           * */
          /* if(v.addSupplier.listVariQuotationInfo.length==1 && v.addSupplier.listVariQuotationInfo[0].goodPrice==''
           && v.addSupplier.listVariQuotationInfo[0].goodWeight=='' && v.addSupplier.listVariQuotationInfo[0].productGoodsId ==''
           && v.addSupplier.listVariQuotationInfo[0].variQuotationId ==''){
           v.addSupplier.listVariQuotationInfo=null;
           } */
          if (v.list.length === 0) {
            v.addSupplier.isDefault = 1;
          }
          // this.saveProductAttr();
          v.$axios
            .post(api.saveProductQuotationDetail, v.addSupplier)
            .then((res) => {
              v.$Spin.hide();
              if (res.code === 0) {
                v.$msg.success("保存成功");
                v.$store.commit("addSupplierType", "");
                v.$emit("goTabList", "list");
                callback && callback();
              }
            })
            .catch(() => {
              v.$Spin.hide();
            });
        }
      });
    },
    // commonAttrPrice子组件返回值
    getAttrPrice(data) {
      this.addSupplier.listVariQuotationInfo = data.obj;
      // this.productAttr = data.productAttr;
    },
    // 保存商品尺寸
    saveProductAttr() {
      this.$axios
        .post(api.post_saveProductGoods, this.productAttr)
        .then(() => {});
    },
    // 重置询价表单信息
    resetDate() {
      let v = this;
      v.addSupplier = {
        // 主表信息：
        isPictureSupplier: 0,
        isDefault: 0,
        deliveredFromCountry: "", // 发货地-国家
        deliveredFromProvince: "", // 发货地-省份
        deliveredFromCity: "", // 发货地-市
        freightPrice: "", // 采购运费
        freightPriceCurrency: "CNY", // 采购运费币种
        minBatch: "", // 起批量
        productHeight: "", // 商品尺寸-高
        productId: "", // 新品需求ID,必需
        productLength: "", // 商品尺寸-长
        productUrl: "", // 产品链接
        productWeight: "", // 重量
        productWidth: "", // 商品尺寸-宽
        profitRate: "", // 利润率
        purchasePeriod: "", // 采购交期
        quotationId: "", // 供应商报价ID,修改时必需，新增时不需
        remark: "", // 备注
        supplier: "", // 供应商名称（后续有供应商信息接口后，后台保存供应商编号）
        unitPrice: "", // 产品单价
        unitPriceCurrency: "CNY", // 产品单价币种
        // 阶梯报价信息（若对象不为空，则下列必填属性不能为空）：
        listStepQuotation: [
          {
            amount: "", // 数量，必填
            stepQuotationId: "", // 阶梯报价记录ID，修改时必需，新增时不需
            unitPrice: "", // 价格，必填
          },
        ], // 多属性报价信息（若对象不为空，则下列必填属性不能为空）
        listVariQuotationInfo: [
          {
            goodPrice: "", // 产品价格，必填
            goodWeight: "", // 产品重量，必填
            productGoodsId: "", // 货品ID,关联货品信息表，不能为空
            variQuotationId: "", // 多属性报价记录ID，修改时必需，新增时不需
          },
        ],
      };
      this.$nextTick(() => {
        v.$refs.addSupplier.resetFields();
      });
    },
    getQueryProductQuotationDetail(id) {
      let v = this;
      v.$axios
        .get(api.queryProductQuotationDetail + "?strQuotationId=" + id)
        .then((res) => {
          if (res.code === 0) {
            setTimeout(() => {
              v.addSupplier = Object.assign({}, res.datas);
              if (v.addSupplier.unitPrice !== null) {
                v.addSupplier.unitPrice = v.addSupplier.unitPrice.toFixed(2);
              }
              if (v.addSupplier.profitRate !== null) {
                v.addSupplier.profitRate = v.addSupplier.profitRate.toFixed(2);
              }
              v.addSupplier.purchasePeriod += "";
              v.addSupplier.productWeight += "";
              v.$set(v.addSupplier, "listStepQuotation", []);
              v.listStepQuotationInfoInit = JSON.stringify(
                res.datas.listStepQuotationInfo
              );
              v.getSupplierList(id, function () {
                v.addSupplier.supplier = res.datas.supplier;
              });
              v.addSupplier.deliveredFromProvince = "";
              v.addSupplier.deliveredFromCity = "";
              v.getCountry(() => {
                v.getCountryId(v.addSupplier.deliveredFromCountry, () => {
                  v.addSupplier.deliveredFromProvince =
                    res.datas.deliveredFromProvince + "";
                  v.getStateId(v.addSupplier.deliveredFromProvince, () => {
                    v.addSupplier.deliveredFromCity =
                      res.datas.deliveredFromCity + "";
                  });
                });
              });
              if (res.datas.listStepQuotationInfo.length <= 0) {
                v.$set(v.addSupplier, "listStepQuotation", [
                  {
                    amount: "", // 数量，必填
                    stepQuotationId: "", // 阶梯报价记录ID，修改时必需，新增时不需
                    unitPrice: "", // 价格，必填
                    isDeleted: null,
                  },
                ]);
              } else {
                res.datas.listStepQuotationInfo.forEach((item) => {
                  v.addSupplier.listStepQuotation.push(item);
                });
              }
            }, 100);
          }
        })
        .catch(() => {});
    },
    openAttrPrice() {
      let v = this;
      v.$refs.attrPrice.attrPrice = true;
    },
    validateUnitPrice(rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.addSupplier.unitPrice === "") {
        callback(new Error("产品单价不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("产品单价只能是数字"));
      } else if (v.addSupplier.unitPriceCurrency === "") {
        callback(new Error("请选择单位"));
      } else {
        callback();
      }
    },
    validateSize(rule, value, callback) {
      let v = this;
      var reg = this.nubReg;
      if (v.addSupplier.productLength === "") {
        callback(new Error("商品尺寸长度不能为空"));
      } else if (!reg.test(v.addSupplier.productLength)) {
        callback(new Error("请输入正确的商品尺寸长度"));
      } else if (v.addSupplier.productWidth === "") {
        callback(new Error("商品尺寸宽度不能为空"));
      } else if (!reg.test(v.addSupplier.productWidth)) {
        callback(new Error("请输入正确的商品尺寸长度"));
      } else if (v.addSupplier.productHeight === "") {
        callback(new Error("商品尺寸高不能为空"));
      } else if (!reg.test(v.addSupplier.productHeight)) {
        callback(new Error("请输入正确的商品尺寸长度"));
      } else {
        callback();
      }
    },
    addListStepQuotation(index) {
      let v = this;
      v.addSupplier.listStepQuotation.splice(index + 1, 0, {
        amount: "", // 数量，必填
        stepQuotationId: "", // 阶梯报价记录ID，修改时必需，新增时不需
        unitPrice: "", // 价格，必填
      });
    },
    removeListStepQuotation(index) {
      let v = this;
      v.addSupplier.listStepQuotation.splice(index, 1);
      v.validateAmount();
    },
    unitPriceCurrencyChange() {
      let v = this;
      if (
        v.addSupplier.unitPriceCurrency !== "" ||
        v.addSupplier.unitPriceCurrency !== null
      ) {
        v.$refs.addSupplier.validateField("unitPrice");
      }
    },
    getState(value) {
      let v = this;
      console.log("value:", value);
      if (value) {
        value = value.split(",");
        v.supplierForm.countryCode = value[1];
        v.supplierForm.countryCnName = value[2];
        v.getCountryId(value[0], () => {
          let data = v.ProvinceList;
          if (data.length > 0) {
            v.showState = true;
          } else {
            v.showState = false;
          }
        });
      }
    },
    getCity(value) {
      let v = this;
      if (value) {
        value = value.split(",");
        v.supplierForm.stateCode = value[1];
        v.supplierForm.stateCnName = value[2];
        v.getStateId(value[0], () => {
          let data = v.deliveredList;
          if (data.length > 0) {
            v.showCity = true;
          } else {
            v.showCity = false;
          }
        });
      }
    },
    getCityName(value) {
      let v = this;
      console.log("cityvalue:", value);
      if (value) {
        value = value.split(",");
        v.supplierForm.cityCode = value[0];
        v.supplierForm.cityCnName = value[1];
      }
    },
  },
  computed: {
    supplierPageNumAdd() {
      if (this.supplierPageNum) {
        return this.supplierPageNum + "1";
      } else {
        return 1;
      }
    },
    priceWithWeight() {
      let v = this;
      let vaild = false;
      v.addSupplier.listVariQuotationInfo.forEach((item) => {
        if (item.goodPrice !== "" && item.goodWeight !== "") {
          vaild = true;
        }
      });
      return vaild;
    },
    isDisable() {
      let v = this;
      if (
        v.$store.state.curNodeId !== 3 ||
        v.$store.state.curNodeControl !== 999
      ) {
        return true;
      } else {
        return false;
      }
    },
    isPictureSupplier: {
      get() {
        let v = this;
        if (v.addSupplier.isPictureSupplier === 0) {
          return false;
        } else {
          return true;
        }
      },
      set(val) {
        let v = this;
        v.addSupplier.isPictureSupplier = val ? 1 : 0;
      },
    },
    isDefault: {
      get() {
        let v = this;
        if (v.addSupplier.isDefault === 0) {
          return false;
        } else {
          return true;
        }
      },
      set(val) {
        let v = this;
        v.addSupplier.isDefault = val ? 1 : 0;
      },
    },
  },
  securityUser() {
    if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
      return this.$store.getters["authUserInfo"].securityUser;
    }
    return {}
  },
};
</script>

<style>
.supplierN .ivu-form-item-error-tip {
  left: 90px !important;
  white-space: nowrap;
}

.supplierN .ivu-form-item-label {
  width: 90px !important;
}
</style>
<style scoped>
.supplierN {
  width: 100%;
}
.redBor {
  border: 1px solid #ed3f14;
  border-radius: 4px;
}

.wid {
  width: 300px;
}

.wid1 {
  width: 100px;
}

.plusIcon {
  font-size: 16px;
  margin-left: 8px;
  margin-right: 10px;
  vertical-align: middle;
  cursor: pointer;
}
</style>
