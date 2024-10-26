<style scoped>
.address {
  width: 80px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.chooseAdd {
  float: left;
  width: 580px;
}

.pic {
  width: 200px;
  height: 180px;
}

.pic img {
  display: inline-block;
  margin: 0 auto;
  max-height: 100%;
  max-width: 100%;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
<style>
.deleteLabelWidth .ivu-form-item-content {
  margin-left: 0 !important;
}
.deleteLabelWidth .ivu-form-item {
  margin-bottom: 20px;
}
</style>
<template>
  <div>
    <div style="padding-bottom: 16px">
      <Form
        ref="editSupplier"
        :model="editSupplier"
        :label-width="80"
        :rules="ruleValidate"
      >
        <Row>
          <Col :span="13">
            <FormItem label="名称" prop="supplierName">
              <Input
                v-model.trim="editSupplier.supplierName"
                style="width: 360px"
                :disabled="!isEditSupplier"
              ></Input>
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem label="代码" :label-width="110">
              <Input
                v-model.trim="editSupplier.supplierCode"
                :disabled="!isEditSupplier"
                :maxlength="50"
              ></Input>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
            <FormItem label="等级">
              <dyt-select
                v-model="editSupplier.supplierLevel"
                clearable
                style="width: 360px"
                :disabled="!isEditSupplier"
              >
                <Option
                  v-for="(item, index) in supplierLevelArr"
                  :value="item.dataValue"
                  :key="index"
                  >{{ item.dataDesc }}
                </Option></dyt-select
              >
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem label="主营品类" :label-width="110">
              <dyt-select
                ref="categorySelect"
                v-model="editSupplier.supplierCategoryId"
                filterable
                clearable
                :disabled="!isEditSupplier"
                ><Option
                  v-for="(item, index) in mainCategoryArr"
                  :value="item.supplierCategoryId"
                  :key="index"
                  >{{ item.categoryName }}
                </Option></dyt-select
              >
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
            <FormItem label="开发人" prop="developerId">
              <dyt-select
                ref="developerSelect"
                v-model="editSupplier.developerId"
                filterable
                clearable
                style="width: 360px"
                :disabled="!isEditSupplier"
                ><Option
                  v-for="(item, index) in developerArr"
                  :value="item.userId"
                  :key="index"
                  >{{ item.name }}
                </Option></dyt-select
              >
            </FormItem>
          </Col>
          <Col :span="10">
            <FormItem label="采购人" :label-width="110" prop="purchaserId">
              <dyt-select
                ref="purchaserSelect"
                v-model="editSupplier.purchaserId"
                filterable
                clearable
                :disabled="!isEditSupplier"
                ><Option
                  v-for="(item, index) in personOpenArr"
                  :value="item.userId"
                  :key="index"
                  >{{ item.name }}
                </Option></dyt-select
              >
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
            <div class="clear">
              <div class="address">地址</div>
              <div class="chooseAdd">
                <Row>
                  <Col span="7">
                    <dyt-select
                      ref="countrySelect"
                      clearable
                      filterable
                      v-model="editSupplier.countryId"
                      :disabled="!isEditSupplier"
                      @on-change="countryChangeFn"
                      ><Option
                        v-for="(item, index) in countryArr"
                        :value="item.countryId"
                        :key="index"
                        >{{ item.cnName }}
                      </Option></dyt-select
                    >
                  </Col>
                  <Col span="7" style="margin-left: 10px">
                    <dyt-select
                      ref="supProvinceSelect"
                      clearable
                      filterable
                      v-model="editSupplier.provinceId"
                      :disabled="!isEditSupplier"
                      @on-open-change="getProvinceFn"
                      @on-change="provinceChangeFn"
                      ><Option
                        v-for="(item, index) in provinceArr"
                        :value="item.stateId"
                        :key="index"
                        >{{ item.cnName }}
                      </Option></dyt-select
                    >
                  </Col>
                  <Col span="7" style="margin-left: 10px">
                    <dyt-select
                      ref="supCitySelect"
                      clearable
                      filterable
                      v-model="editSupplier.cityId"
                      :disabled="!isEditSupplier"
                      @on-open-change="getCityFn"
                      ><Option
                        v-for="(item, index) in cityArr"
                        :value="item.cityId"
                        :key="index"
                        >{{ item.cnName }}
                      </Option>
                    </dyt-select>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>
          <Col :span="10">
            <FormItem label="供应商类型" prop="supplierType" :label-width="110">
              <dyt-select
                v-model="editSupplier.supplierType"
                filterable
                clearable
                :disabled="!isEditSupplier"
                ><Option
                  v-for="(item, index) in supplierTypeArr"
                  :value="item.dataValue"
                  :key="index"
                  >{{ item.dataDesc }}
                </Option></dyt-select
              >
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
            <FormItem label="详细地址">
              <Input
                v-model.trim="editSupplier.address"
                :disabled="!isEditSupplier"
                :maxlength="500"
              ></Input>
            </FormItem>
          </Col>
          <Col :span="11">
            <FormItem label="引进时间" :label-width="110">
              <DatePicker
                type="datetime"
                v-model="editSupplier.introduceTime"
                :disabled="!isEditSupplier"
                @on-change="changeTime"
                transfer
                format="yyyy-MM-dd HH:mm"
                style="width: 408px"
              ></DatePicker>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
            <FormItem label="店铺网址">
              <Input
                v-model.trim="editSupplier.storeUrl"
                :disabled="!isEditSupplier"
                :maxlength="250"
              ></Input>
            </FormItem>
          </Col>
          <Col :span="8"  v-if="editSupplier.openStatus == 0">
            <FormItem label="是否1688供应商" :label-width="120">
              <!-- <Radio v-model="isSupplier"></Radio> -->
              <Checkbox :disabled="!isEditSupplier" v-model="editSupplier.setupStatus"></Checkbox>
            </FormItem>
          </Col>
          <!-- <Col :span="10" :offset="1">
            <FormItem label="是否启用">
              <dyt-select v-model="editSupplier.isEnable" filterable :disabled="!isEditSupplier">
                <Option v-for="(item, index) in enable" :value="item.key" :key="index">{{ item.value }}</Option>
              </dyt-select>
            </FormItem>
          </Col> -->
        </Row>
        <Row>
          <Col :span="24">
            <FormItem label="备注">
              <Input
                v-model.trim="editSupplier.settlementRemark"
                type="textarea"
                :rows="3"
                placeholder="请输入..."
                :disabled="!isEditSupplier"
                :maxlength="1000"
              ></Input>
            </FormItem>
          </Col>
        </Row>
        <div class="supplierTabsBar">
          <template>
            <Tabs
              @on-click="currentSupplierPage"
              v-model="currentSupplierTabItem"
            >
              <TabPane
                v-for="(item, index) in addTabItems"
                :label="item.value"
                :key="index"
                :name="String(index)"
              ></TabPane>
            </Tabs>
          </template>
        </div>
        <!-- 财务结算 -->
        <div v-show="currentSupplierTabItem == '0'">
          <Row>
            <Col :span="6">
              <FormItem label="结算方式" prop="settlementType">
                <dyt-select
                  v-model="editSupplier.settlementType"
                  @on-change="settlementTypeChangeFn"
                  placeholder="请选择结算方式"
                  :disabled="!isEditSupplier"
                  ><Option
                    v-for="(item, index) in settlementMethodArr"
                    :value="item.dataValue"
                    :key="index"
                    >{{ item.dataDesc }}
                  </Option></dyt-select
                >
              </FormItem>
            </Col>
            <!-- 结算时间 -->
            <Col :span="6">
              <template v-if="editSupplier.settlementType == '04'">
                <FormItem label="结算时间" prop="settlementTime">
                  <dyt-select
                    v-model="editSupplier.settlementTime"
                    @on-change="settlementTimeChangeFn"
                    placeholder="请选择"
                    :disabled="!isEditSupplier"
                  >
                    <!-- <Option v-for="(item, index) in settlementTimeArr" :value="item.dataValue" :key="index" @click.native="editSupplier.settlementTimeName = item.dataDesc">{{ item.dataDesc }}</Option> -->
                    <Option
                      v-for="(item, index) in settlementTimeArr"
                      :value="item.dataValue"
                      :key="index"
                      >{{ item.dataDesc }}
                    </Option></dyt-select
                  >
                </FormItem>
              </template>
            </Col>
            <Col :span="6" style="padding-left: 10px">
              <template v-if="editSupplier.settlementType == '04'">
                <FormItem prop="settlementPeriod" :label-width="10">
                  <dyt-select
                    v-model="editSupplier.settlementPeriod"
                    @on-change="settlementPeriodChangeFn"
                    placeholder="请选择"
                    :disabled="!isEditSupplier"
                  >
                    <!-- <Option v-for="(item, index) in settlementPeriodArr" :value="item.dataValue" :key="index" @click.native="editSupplier.settlementPeriodName = item.dataDesc">{{ item.dataDesc }}</Option> -->
                    <Option
                      v-for="(item, index) in settlementPeriodArr"
                      :value="item.dataValue"
                      :key="index"
                      >{{ item.dataDesc }}
                    </Option></dyt-select
                  >
                </FormItem>
              </template>
            </Col>
            <!-- 选择日期 -->
            <Col :span="6" style="padding-left: 10px">
              <!-- <template v-if="editSupplier.settlementTime == '03'">
                <DatePicker transfer type="date" placeholder="选择日期" v-model="editSupplier.settlementTimeValue" :disabled="!isEditSupplier"></DatePicker>
              </template> -->
              <!-- 周结 半月结 -->
              <template
                v-if="
                  editSupplier.settlementPeriod == '02' ||
                  editSupplier.settlementPeriod == '04'
                "
              >
                <FormItem prop="settlementTimeValue" :label-width="10">
                  <dyt-select
                    v-model="editSupplier.settlementTimeValue"
                    placeholder="请选择"
                    :disabled="!isEditSupplier"
                  >
                    <Option
                      v-for="(item, index) in settlementTimeValueArr"
                      :value="item.dataValue"
                      :key="index"
                      >{{ item.dataDesc }}
                    </Option></dyt-select
                  >
                </FormItem>
              </template>
              <!-- 月结 -->
              <template v-if="editSupplier.settlementPeriod == '03'">
                <FormItem prop="settlementTimeValue" :label-width="10">
                  <DatePicker
                    type="date"
                    format="d"
                    transfer
                    @on-change="settlementTimeValueChangeFn"
                    placeholder="选择日期"
                    :value="editSupplier.settlementTimeValue"
                    :disabled="!isEditSupplier"
                    :readonly="!isEditSupplier"
                  ></DatePicker>
                </FormItem>
              </template>
            </Col>
          </Row>
          <div class="tableControl">
            <Button
              type="primary"
              @click="addPayMethodFn"
              class="iconbuttons"
              style="margin-left: 12px"
              :disabled="!isEditSupplier"
            >
              新增支付方式
            </Button>
          </div>
          <div class="orderTable normalTop deleteLabelWidth">
            <Table
              ref="payTable"
              highlight-row
              :border="true"
              :columns="payColumn1"
              :data="editSupplier.supplierPaymentList"
            ></Table>
          </div>
        </div>
        <div v-show="currentSupplierTabItem == '1'">
          <div class="tableControl">
            <Button
              type="primary"
              class="iconbuttons"
              @click="addCntactFn"
              style="margin-left: 12px"
              :disabled="!isEditSupplier"
            >
              新增联系人
            </Button>
          </div>
          <div class="orderTable normalTop deleteLabelWidth">
            <Table
              ref="payTable"
              highlight-row
              :border="true"
              :columns="payColumn2"
              :data="editSupplier.supplierContactList"
            ></Table>
          </div>
        </div>
        <div v-show="currentSupplierTabItem == '2'">
          <Row>
            <span
              v-for="(item, index) in editSupplier.supplierAttachmentList"
              :key="'supplierAttachmentList' + index"
            >
              <Col :span="6" :offset="1" class="supplierAttachmentList">
                <div class="pic">
                  <img :src="$store.state.imgUrl + item.attachmentUrl" />
                </div>
                <div
                  class="delete deleteLabelWidth"
                  style="text-align: center; margin-top: 10px"
                >
                  <Row>
                    <Col :span="24">
                      <FormItem
                        :prop="
                          'supplierAttachmentList.' + index + '.attachmentDesc'
                        "
                        :rules="[
                          {
                            required: true,
                            message: '请填写',
                            trigger: 'blur',
                          },
                          {
                            type: 'string',
                            max: 100,
                            message: '不能超过100字符',
                            trigger: 'change',
                          },
                        ]"
                      >
                        <Input
                          v-model.trim="item.attachmentDesc"
                          :disabled="!isEditSupplier"
                          style="width: 160px"
                        ></Input>
                      </FormItem>
                    </Col>
                    <Col :span="24">
                      <Button @click="deleteImg(index)" v-if="isEditSupplier"
                        >删除</Button
                      >
                    </Col>
                  </Row>
                </div>
              </Col>
            </span>
            <Col span="5" :offset="1">
              <template
                v-if="
                  isEditSupplier && getPermission('supplierManagement_upload')
                "
              >
                <dytUpload
                  ref="upload"
                  name="files"
                  :headers="headObj"
                  :show-upload-list="false"
                  :on-success="handleSuccess"
                  accept="image/*"
                  :format="['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff']"
                  :max-size="2048"
                  :on-format-error="handleFormatError"
                  :on-exceeded-size="handleMaxSize"
                  multiple
                  :action="actionUrl"
                  type="drag"
                >
                  <div style="padding: 50px 0">
                    <Icon
                      type="ios-cloud-upload"
                      size="52"
                      style="color: #3399ff"
                    ></Icon>
                  </div>
                </dytUpload>
              </template>
            </Col>
          </Row>
        </div>
        <div v-show="currentSupplierTabItem == '3'">
          <Row>
            <Col :span="8">
              <FormItem label="收货人名称：" :label-width="100">
                <Input
                  v-model.trim="editSupplier.returnContactMan"
                  style="width: 280px"
                  :disabled="!isEditSupplier"
                  maxlength="50"
                ></Input>
              </FormItem>
            </Col>
            <Col :span="6">
              <FormItem label="联系电话：" :label-width="85">
                <Input
                  v-model.trim="editSupplier.returnTelephone"
                  style="width: 200px"
                  :disabled="!isEditSupplier"
                  maxlength="50"
                ></Input>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col :span="13.5">
              <div class="clear">
                <div class="address" style="width: 100px">退货地址地区：</div>
                <div style="float: left; width: 300px">
                  <Cascader
                    :data="addressList"
                    v-model="editSupplier.returnAddress"
                    :filterable="true"
                    style="width: 280px"
                    :disabled="!isEditSupplier"
                    :load-data="loadAreaData"
                    :change-on-select="true"
                  ></Cascader>
                </div>
              </div>
            </Col>
            <Col :span="6">
              <FormItem label="详细地址：" :label-width="100">
                <Input
                  v-model.trim="editSupplier.returnAdressDetail"
                  style="width: 400px"
                  :disabled="!isEditSupplier"
                  maxlength="50"
                  show-word-limit
                ></Input>
              </FormItem>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
    <div style="text-align: center; padding-top: 12px">
      <template
        v-if="
          (editSupplierType == '1' || editSupplierType == '2') &&
          auditStatus !== 4
        "
      >
        <Button
          type="primary"
          @click="saveSupplierFn('editSupplier')"
          :loading="saveSupLoading"
          >保存
        </Button>
      </template>
      <template v-if="editSupplierType == '1' || editSupplierType == '2'">
        <Button
          type="primary"
          @click="submitSupplierFn('editSupplier')"
          :loading="submitSupLoading"
          style="margin-left: 20px"
          >提交
        </Button>
      </template>
      <template v-if="editSupplierType == '4'">
        <Button
          type="primary"
          @click="batchOperation('1')"
          style="margin-right: 20px"
          >审核通过
        </Button>
      </template>
      <template v-if="editSupplierType == '4'">
        <Button
          type="primary"
          @click="batchOperation('2')"
          style="margin-right: 20px"
          >驳回
        </Button>
      </template>
      <template v-if="editSupplierType == '3' || editSupplierType == '4'">
        <Button type="primary" @click="closeSupplierModal">关闭</Button>
      </template>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin], // auditStatus 对应页面tab 0 所有供应商 1 草稿 2 待审核 3 已审核 4 已停用  number
  props: [
    "editSupplierData",
    "isEditSupplier",
    "editSupplierType",
    "source",
    "auditStatus",
  ],
  data() {
    var self = this;
    return {
      editSupplier: {},
      supplierLevelArr: [],
      mainCategoryArr: [],
      developerArr: [],
      purchaserArr: [],
      countryArr: [],
      provinceArr: [],
      cityArr: [],
      supplierTypeArr: [],
      currentSupplierTabItem: "0",
      addTabItems: [
        {
          key: "0",
          value: "财务结算",
        },
        {
          key: "1",
          value: "联系人",
        },
        {
          key: "2",
          value: "供应商资料",
        },
        {
          key: "3",
          value: "退货地址",
        },
      ],
      settlementMethodArr: [],
      actionUrl: api.fileUpLoad,
      saveSupLoading: false, // 防止保存请求完成之前，再次点击保存
      submitSupLoading: false, // 防止提交请求完成之前，再次点击提交
      payMethodArr: [],
      bankArr: [],
      settlementPeriodArr: [],
      settlementTimeArr: [],
      payColumn1: [
        {
          key: "paymentType",
          align: "center",
          title: "支付方式",
          render: (h, params) => {
            let arr = [];
            self.payMethodArr.forEach((n, i) => {
              arr.push(
                h(
                  "Option",
                  {
                    props: {
                      value: n.dataValue,
                      key: i,
                    },
                  },
                  n.dataDesc
                )
              );
            });
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierPaymentList." + params.index + ".paymentType",
                  rules: [
                    {
                      required: true,
                      message: "请选择支付方式",
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
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentType,
                      disabled: !self.isEditSupplier,
                      transfer: true,
                    },
                    on: {
                      "on-change": (value) => {
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentType = value;
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentBank = null;
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccount = null;
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccountName = null;
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].subbranch = null;
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
          key: "paymentBank",
          align: "center",
          title: "银行/平台",
          render: (h, params) => {
            if (
              self.editSupplier.supplierPaymentList[params.index]
                .paymentType === "02"
            ) {
              let arr = [];
              self.bankArr.forEach((n, i) => {
                arr.push(
                  h(
                    "Option",
                    {
                      props: {
                        value: n.dataValue,
                        key: i,
                      },
                    },
                    n.dataDesc
                  )
                );
              });
              return h(
                "FormItem",
                {
                  props: {
                    prop:
                      "supplierPaymentList." + params.index + ".paymentBank",
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
                          self.editSupplier.supplierPaymentList[params.index]
                            .paymentBank,
                        disabled: !self.isEditSupplier,
                        transfer: true,
                      },
                      on: {
                        "on-change": (value) => {
                          self.editSupplier.supplierPaymentList[
                            params.index
                          ].paymentBank = value;
                        },
                      },
                    },
                    arr
                  ),
                ]
              );
            } else {
              return "";
            }
          },
        },
        {
          key: "paymentAccount",
          align: "center",
          title: "账号",
          render: (h, params) => {
            if (
              params.row.paymentType == "02" ||
              params.row.paymentType == "03" ||
              params.row.paymentType == "04"
            ) {
              return h(
                "FormItem",
                {
                  props: {
                    prop:
                      "supplierPaymentList." + params.index + ".paymentAccount",
                    rules: [
                      {
                        required: true,
                        message: "不能为空",
                        trigger: "blur",
                      },
                      {
                        type: "string",
                        max: 64,
                        message: "不能超过64字符",
                        trigger: "change",
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
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentAccount,
                      disabled: !self.isEditSupplier,
                    },
                    on: {
                      input: (value) => {
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccount = value.replace(/(^\s*)|(\s*$)/g, "");
                      },
                    },
                  }),
                ]
              );
            }
          },
        },
        {
          key: "paymentAccountName",
          align: "center",
          title: "账户名",
          render: (h, params) => {
            if (params.row.paymentType == "02") {
              return h(
                "FormItem",
                {
                  props: {
                    prop:
                      "supplierPaymentList." +
                      params.index +
                      ".paymentAccountName",
                    rules: [
                      {
                        required: true,
                        message: "不能为空",
                        trigger: "blur",
                      },
                      {
                        type: "string",
                        max: 64,
                        message: "不能超过64字符",
                        trigger: "change",
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
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentAccountName,
                      disabled: !self.isEditSupplier,
                    },
                    on: {
                      input: (value) => {
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccountName = value.replace(
                          /(^\s*)|(\s*$)/g,
                          ""
                        );
                      },
                    },
                  }),
                ]
              );
            }
          },
        },
        {
          key: "subbranch",
          align: "center",
          title: "支行",
          render: (h, params) => {
            if (
              self.editSupplier.supplierPaymentList[params.index]
                .paymentType === "02"
            ) {
              return h("Input", {
                props: {
                  value:
                    self.editSupplier.supplierPaymentList[params.index]
                      .subbranch,
                  disabled: !self.isEditSupplier,
                  maxlength: 300,
                },
                on: {
                  input: (value) => {
                    self.editSupplier.supplierPaymentList[
                      params.index
                    ].subbranch = value.replace(/(^\s*)|(\s*$)/g, "");
                  },
                },
              });
            } else {
              return "";
            }
          },
        },
        {
          key: "isDefault",
          align: "center",
          title: "默认",
          render: (h, params) => {
            let v = this;
            return h("Radio", {
              props: {
                value:
                  v.editSupplier.supplierPaymentList[params.index].isDefault ===
                  1,
                disabled: !self.isEditSupplier,
              },
              on: {
                "on-change": (value) => {
                  v.editSupplier.supplierPaymentList[params.index].isDefault =
                    value ? 1 : 0;
                  v.editSupplier.supplierPaymentList.forEach((n, i) => {
                    if (n.isDefault && i !== params.index) {
                      v.editSupplier.supplierPaymentList[i].isDefault = 0;
                    }
                  });
                },
              },
            });
          },
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  confirm: true,
                  transfer: true,
                  title: "确认要删除该行数据吗？",
                  placement: "top-end",
                },
                on: {
                  "on-ok": () => {
                    let v = this;
                    let isDef = params.row.isDefault;
                    if (params.row.supplierPaymentId) {
                      v.editSupplier.supplierPaymentIds.push(
                        params.row.supplierPaymentId
                      );
                    }
                    v.editSupplier.supplierPaymentList.splice(params.index, 1);
                    if (
                      isDef &&
                      v.editSupplier.supplierPaymentList.length > 0
                    ) {
                      // 如果是删除默认 把第一个作为默认供应商
                      v.editSupplier.supplierPaymentList[0].isDefault = 1;
                    }
                  },
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      disabled: !self.isEditSupplier,
                    },
                  },
                  "删除"
                ),
              ]
            );
          },
        },
      ],
      payColumn2: [
        {
          key: "contactMan",
          align: "center",
          title: "联系人",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierContactList." + params.index + ".contactMan",
                  rules: [
                    /* {required: true, message: '联系人不能为空', trigger: 'blur'}, */
                    {
                      type: "string",
                      max: 64,
                      message: "不能超过64字符",
                      trigger: "change",
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
                      self.editSupplier.supplierContactList[params.index]
                        .contactMan,
                    disabled: !self.isEditSupplier,
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].contactMan = value.replace(/(^\s*)|(\s*$)/g, "");
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "telephone",
          align: "center",
          title: "联系电话",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierContactList." + params.index + ".telephone",
                  rules: [
                    {
                      validator: self.validateMobilePhone(),
                      trigger: "blur",
                    },
                    {
                      type: "string",
                      max: 20,
                      message: "不能超过20字符",
                      trigger: "change",
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
                      self.editSupplier.supplierContactList[params.index]
                        .telephone,
                    disabled: !self.isEditSupplier,
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].telephone = value.replace(/(^\s*)|(\s*$)/g, "");
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "mobilePhone",
          align: "center",
          title: "手机",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierContactList." + params.index + ".mobilePhone",
                  rules: [
                    {
                      validator: self.validateMobilePhone(),
                      trigger: "blur",
                    },
                    {
                      type: "string",
                      max: 20,
                      message: "不能超过20字符",
                      trigger: "change",
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
                      self.editSupplier.supplierContactList[params.index]
                        .mobilePhone,
                    disabled: !self.isEditSupplier,
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].mobilePhone = value.replace(/(^\s*)|(\s*$)/g, "");
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "email",
          align: "center",
          title: "邮箱",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierContactList." + params.index + ".email",
                  rules: [
                    {
                      type: "email",
                      message: "邮箱格式有误",
                      trigger: "blur",
                    },
                    {
                      max: 50,
                      message: "不能超过50字符",
                      trigger: "change",
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
                      self.editSupplier.supplierContactList[params.index].email,
                    disabled: !self.isEditSupplier,
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].email = value.replace(/(^\s*)|(\s*$)/g, "");
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "qqNumber",
          align: "center",
          title: "QQ",
          render: (h, params) => {
            return h(
              "FormItem",
              {
                props: {
                  prop: "supplierContactList." + params.index + ".qqNumber",
                  rules: [
                    {
                      validator: self.validateQQ(),
                      trigger: "blur",
                    },
                    {
                      type: "string",
                      max: 50,
                      message: "不能超过50字符",
                      trigger: "change",
                    },
                    {
                      type: "string",
                      min: 5,
                      message: "不能少于5字符",
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
                      self.editSupplier.supplierContactList[params.index]
                        .qqNumber,
                    disabled: !self.isEditSupplier,
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].qqNumber = value.replace(/(^\s*)|(\s*$)/g, "");
                    },
                  },
                }),
              ]
            );
          },
        },
        {
          key: "wwAccount",
          align: "center",
          title: "旺旺",
          render: (h, params) => {
            return h("Input", {
              props: {
                value:
                  self.editSupplier.supplierContactList[params.index].wwAccount,
                disabled: !self.isEditSupplier,
                maxlength: 50,
              },
              on: {
                input: (value) => {
                  self.editSupplier.supplierContactList[
                    params.index
                  ].wwAccount = value.replace(/(^\s*)|(\s*$)/g, "");
                },
              },
            });
          },
        },
        {
          key: "faxNumber",
          align: "center",
          title: "传真号",
          render: (h, params) => {
            return h("Input", {
              props: {
                value:
                  self.editSupplier.supplierContactList[params.index].faxNumber,
                disabled: !self.isEditSupplier,
                maxlength: 20,
              },
              on: {
                input: (value) => {
                  self.editSupplier.supplierContactList[
                    params.index
                  ].faxNumber = value.replace(/(^\s*)|(\s*$)/g, "");
                },
              },
            });
          },
        },
        {
          key: "isDefault",
          align: "center",
          title: "默认",
          render: (h, params) => {
            let v = this;
            /* if(v.editSupplier.supplierContactList.length == 1 && v.editSupplier.supplierContactList[params.index].isDefault === 0) { //当只有一个联系人且没有默认联系人时，将其设为默认联系人
             v.editSupplier.supplierContactList[params.index].isDefault = 1
             } */
            return h("Radio", {
              props: {
                value:
                  v.editSupplier.supplierContactList[params.index].isDefault ===
                  1,
                disabled: !self.isEditSupplier,
              },
              on: {
                "on-change": (value) => {
                  v.editSupplier.supplierContactList[params.index].isDefault =
                    value ? 1 : 0;
                  v.editSupplier.supplierContactList.forEach((n, i) => {
                    if (n.isDefault && i !== params.index) {
                      v.editSupplier.supplierContactList[i].isDefault = 0;
                    }
                  });
                },
              },
            });
          },
        },
        {
          key: "operation",
          align: "center",
          title: "操作",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  confirm: true,
                  transfer: true,
                  title: "确认要删除该行数据吗？",
                  placement: "top-end",
                },
                on: {
                  "on-ok": () => {
                    let v = this;
                    if (params.row.supplierContactId) {
                      v.editSupplier.supplierContactIds.push(
                        params.row.supplierContactId
                      );
                    }
                    v.editSupplier.supplierContactList.splice(params.index, 1);
                  },
                },
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary",
                      disabled: !self.isEditSupplier,
                    },
                  },
                  "删除"
                ),
              ]
            );
          },
        },
      ],
      settlementTimeValueArr: [
        {
          dataValue: "1",
          dataDesc: "账期后" + "1" + " 天",
        },
        {
          dataValue: "2",
          dataDesc: "账期后" + "2" + " 天",
        },
        {
          dataValue: "3",
          dataDesc: "账期后" + "3" + " 天",
        },
        {
          dataValue: "4",
          dataDesc: "账期后" + "4" + " 天",
        },
        {
          dataValue: "5",
          dataDesc: "账期后" + "5" + " 天",
        },
        {
          dataValue: "6",
          dataDesc: "账期后" + "6" + " 天",
        },
        {
          dataValue: "7",
          dataDesc: "账期后" + "7" + " 天",
        },
      ],
      ruleValidate: {
        supplierName: [
          {
            required: true,
            message: "名称不能为空",
            trigger: "blur",
          },
          {
            type: "string",
            max: 200,
            message: "不能超过100字符",
            trigger: "change",
          },
        ],
        developerId: [
          {
            required: true,
            message: "开发人不能为空",
            trigger: "blur",
          },
        ],
        purchaserId: [
          {
            required: true,
            message: "采购人不能为空",
            trigger: "blur",
          },
        ],
        supplierType: [
          {
            required: true,
            message: "请选择供应商类型",
            trigger: "change",
          },
        ],
        settlementType: [
          {
            required: true,
            message: "请选择结算方式",
            trigger: "change",
          },
        ],
        settlementTime: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change",
          },
        ],
        settlementPeriod: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change",
          },
        ],
        settlementTimeValue: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change",
          },
        ],
        personOpenArr: [],
      },
      addressList: [],
    };
  },
  created() {
    const info = this.$common.copy(this.editSupplierData);
    const arrKey = ["returnAddress"];
    const number = [];
    this.getAddress(1).then((temp) => {
      this.getDetailsAddress(
        temp,
        this.$common.isEmpty(info.returnAddress) ? [] : info.returnAddress
      ).then((res) => {
        this.addressList = res.list;
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.$refs.countrySelect.clearSingleSelect(); // 清空国家选项
            this.$refs.categorySelect.clearSingleSelect();
            this.$refs.developerSelect.clearSingleSelect();
            this.$refs.purchaserSelect.clearSingleSelect();
            Object.keys(info).forEach((key) => {
              if (arrKey.includes(key)) {
                this.$set(
                  this.editSupplier,
                  key,
                  this.$common.isArray(info[key])
                    ? info[key]
                    : this.$common.isEmpty(info[key])
                    ? []
                    : [info[key]]
                );
              } else if (number.includes(key)) {
                const newNumber = Number(info[key]);
                this.$set(
                  this.editSupplier,
                  key,
                  this.$common.isEmpty(newNumber) ? null : newNumber
                );
              } else {
                this.$set(this.editSupplier, key, info[key]);
              }
            });
            // this.editSupplier = JSON.parse(JSON.stringify(this.editSupplierData));
            this.getBaseDataFn();
            this.getCountryFn();
            if (this.editSupplier.provinceId) {
              this.getProvinceFn(true);
              if (this.editSupplier.cityId) {
                this.getCityFn(true);
              }
            }
            this.intiBaseDataList();
          });
          this.editSupplier.returnAddress = res.val;
        });
      });
    });
  },
  watch: {
    'editSupplier.purchaserId': {
      handler(newVal, oldVal) {
        if(this.$common.isEmpty(newVal)) {
          this.editSupplier.purchaserName = null
        } else {
          this.personOpenArr.forEach(item => {
            if(newVal == item.userId) {
              this.editSupplier.purchaserName = item.name
            }
          })
        }
      }
    },
    'editSupplier.developerId': {
      handler(newVal, oldVal) {
        if(this.$common.isEmpty(newVal)) {
          this.editSupplier.developerName = null
        } else {  
          this.personOpenArr.forEach(item => {
            if(newVal == item.userId) {
              this.editSupplier.developerName = item.name
            }
          })
        }
      }
    }
  },
  methods: {
    getDetailsAddress(topAreaList, addressArr = []) {
      return new Promise((resolve) => {
        let treeList = this.$common.copy(topAreaList);
        const hand = (data, index = 0, allData) => {
          let obj = {};
          let treeIndex = 0;
          data.forEach((item, tIndex) => {
            if (item.label === addressArr[index]) {
              obj = item;
              treeIndex = tIndex;
            }
          });

          if (this.$common.isEmpty(obj)) {
            return resolve({ list: treeList, val: addressArr });
          }
          this.getAddress(obj.id).then((res) => {
            allData[treeIndex].children = res;
            if (addressArr.length - 1 > index) {
              hand(res || [], index + 1, allData[treeIndex].children);
            } else {
              return resolve({ list: treeList, val: addressArr });
            }
          });
        };
        hand(topAreaList, 0, treeList);
      });
    },
    validateMobilePhone() {
      // 可共用，可为空，纯数字
      let reg = this.$regular.AllNumber;
      return function (rule, value, callback) {
        if (!value) {
          callback();
        } else if (!reg.test(value)) {
          callback(new Error("只能输入数字"));
        } else {
          callback();
        }
      };
    },
    getBaseDataFn() {
      let v = this;
      v.axios
        .get(api.baseDataList + "?dataType=" + "supplierLevel")
        .then((res) => {
          if (res.data.code == 0) {
            v.supplierLevelArr = res.data.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "supplierType")
        .then((res) => {
          if (res.data.code == 0) {
            v.supplierTypeArr = res.data.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            v.settlementMethodArr = res.data.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "paymentType")
        .then((res) => {
          if (res.data.code == 0) {
            v.payMethodArr = res.data.datas;
          }
        });
      v.axios.get(api.baseDataList + "?dataType=" + "bank").then((res) => {
        if (res.data.code == 0) {
          v.bankArr = res.data.datas;
        }
      });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementPeriod")
        .then((res) => {
          if (res.data.code == 0) {
            v.settlementPeriodArr = res.data.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementTime")
        .then((res) => {
          if (res.data.code == 0) {
            v.settlementTimeArr = res.data.datas;
          }
        });
      v.axios.post(api.categoryQuery, {}).then((res) => {
        if (res.data.code == 0) {
          v.mainCategoryArr = res.data.datas.list;
        }
      });
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName,
              });
            }
          }
          v.developerArr = arr;
          v.purchaserArr = arr;
        }
      });
    },
    // developerFn(data) {
    //   this.editSupplier.developerName = data.name;
    // },
    // purchaserFn(data) {
    //   this.editSupplier.purchaserName = data.name;
    // },
    getCountryFn() {
      let v = this;
      v.axios.get(api.country).then((res) => {
        if (res.data.code == 0) {
          v.countryArr = res.data.datas;
        }
      });
    },
    getProvinceFn(name) {
      // 获取省、州列表
      let v = this;
      if (name) {
        if (v.editSupplier.countryId) {
          v.axios
            .get(api.province + "?countryId=" + v.editSupplier.countryId)
            .then((res) => {
              if (res.data.code == 0) {
                v.provinceArr = res.data.datas;
              }
            });
        } else {
          v.$Message.warning("请先选择国家");
        }
      }
    },
    getCityFn(name) {
      // 获取城市列表
      let v = this;
      if (name) {
        if (v.editSupplier.provinceId) {
          v.axios
            .get(api.allCity + "?stateId=" + v.editSupplier.provinceId)
            .then((res) => {
              if (res.data.code == 0) {
                v.cityArr = res.data.datas;
              }
            });
        } else {
          v.$Message.warning("请先选择省州");
        }
      }
    },
    countryChangeFn() {
      // 选择国家改变时
      this.$refs.supProvinceSelect.clearSingleSelect();
      this.provinceArr = [];
      this.cityArr = [];
    },
    provinceChangeFn() {
      // 选择省\州改变时
      this.$refs.supCitySelect.clearSingleSelect();
      this.cityArr = [];
    },
    currentSupplierPage(name) {},
    settlementTypeChangeFn(value) {
      this.editSupplier.settlementPeriod = "";
      this.editSupplier.settlementPeriodName = "";
      this.editSupplier.settlementTime = "";
      this.editSupplier.settlementTimeName = "";
      this.editSupplier.settlementTimeValue = "";
    },
    settlementTimeChangeFn(value) {},
    settlementPeriodChangeFn(value) {
      this.editSupplier.settlementTimeValue = "";
    },
    settlementTimeValueChangeFn(value) {
      this.editSupplier.settlementTimeValue = value;
    },
    addPayMethodFn() {
      let obj = {
        isDefault: 0,
        merchantId: "",
        paymentAccount: "",
        paymentAccountName: "",
        paymentBank: "",
        paymentType: this.payMethodArr[0].dataValue,
        subbranch: "",
        supplierId: "",
        supplierPaymentId: "",
      };
      if (this.editSupplier.supplierPaymentList.length === 0) {
        obj.isDefault = 1;
      }
      this.editSupplier.supplierPaymentList.push(obj);
    },
    addCntactFn() {
      this.editSupplier.supplierContactList.push({
        contactMan: "",
        email: "",
        faxNumber: "",
        isDefault: 0,
        merchantId: "",
        mobilePhone: "",
        qqNumber: "",
        supplierContactId: "",
        supplierId: "",
        telephone: "",
        wwAccount: "",
      });
    },
    handleSuccess(res, file, fileList) {
      // 上传成功
      let v = this;
      if (res.code == 0) {
        file.url = res.datas[0];
        // let arr = file.url.split("/");
        // let name = arr[arr.length - 1];
        // file.name = name.split(".")[0];
        v.editSupplier.supplierAttachmentList.push({
          attachmentDesc: "",
          attachmentUrl: file.url,
          supplierAttachmentId: "",
        });
      } else {
        v.$Message.error("上传失败，请重试");
        new Error("图片上传接口异常！");
      }
    },
    handleFormatError(file) {
      // 上传文件格式有误
      let v = this;
      v.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[jpg、png或gif]",
      });
    },
    handleMaxSize(file) {
      // 上传文件超过限定大学
      this.$Notice.warning({
        title: "文件大小受限",
        desc: "文件 " + file.name + " 太大, 不能超过2M",
      });
    },
    deleteImg(index) {
      if (
        this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
      ) {
        this.editSupplier.supplierAttachmentIds.push(
          this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
        );
      }
      this.editSupplier.supplierAttachmentList.splice(index, 1);
    },
    saveSupplierFn(name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.saveSupLoading = true;
          v.editSupplier.introduceTime = 
          this.$common.isEmpty(v.editSupplier.introduceTime) ? null : this.formatTime(v.editSupplier.introduceTime)
          let obj = v.deepCopy(v.editSupplier);
          //地址数组转字符串
          obj.returnAddress = obj.returnAddress.join(",");
          let defaultPaymentExist = false;
          if (obj.supplierPaymentList && obj.supplierPaymentList.length > 0) {
            // 如果没有默认支付方式，选第一个为默认支付方式
            obj.supplierPaymentList.forEach((n, i) => {
              if (n.isDefault == 1) {
                defaultPaymentExist = true;
              }
            });
            if (!defaultPaymentExist) {
              obj.supplierPaymentList[0].isDefault = 1;
            }
          }
          let defaultContactExist = false;
          // obj.settlementTimeValue = v.getDataToLocalTime(new Date(obj.settlementTimeValue).getTime(), 'fulltime');
          if (obj.supplierContactList && obj.supplierContactList.length > 0) {
            // 如果没有默认联系人，选第一个为默认联系人
            obj.supplierContactList.forEach((n, i) => {
              if (n.isDefault == 1) {
                defaultContactExist = true;
              }
            });
            if (!defaultContactExist) {
              obj.supplierContactList[0].isDefault = 1;
            }
          }
          if (v.source == "price") {
            v.axios.post(api.saveSupplier, obj).then((res) => {
              if (res.data.code == 0) {
                // 新增的供应商添加到供应商列表
                v.$Message.success("保存成功");
                let obj = {
                  supplierId: res.data.datas.supplierId,
                  supplierName: res.data.datas.supplierName,
                };
                v.$emit("save-supplier", obj);
              }
              v.saveSupLoading = false;
            });
          } else {
            obj.setupStatus = obj.setupStatus == true ? 1 : 0;

            //新增退货地址条件
            v.axios.post(api.managementSave, obj).then((res) => {
              if (res.data.code == 0) {
                // 新增的供应商添加到供应商列表
                v.$Message.success("保存成功");
                v.$emit("save-supplier");
              }
              v.saveSupLoading = false;
            });
          }
        } else {
          // 验证错误定位
          v.errorLocation();
        }
      });
    },
    submitSupplierFn(name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          // 格式化引入时间
          v.editSupplier.introduceTime = 
          this.$common.isEmpty(v.editSupplier.introduceTime) ? null : this.formatTime(v.editSupplier.introduceTime)
          let temp = JSON.parse(JSON.stringify(v.editSupplier));

          temp.returnAddress = temp.returnAddress.join(",");

          v.submitSupLoading = true;
          let defaultPaymentExist = false;
          if (
            v.editSupplier.supplierPaymentList &&
            v.editSupplier.supplierPaymentList.length > 0
          ) {
            // 如果没有默认支付方式，选第一个为默认支付方式
            v.editSupplier.supplierPaymentList.forEach((n, i) => {
              if (n.isDefault == 1) {
                defaultPaymentExist = true;
              }
            });
            if (!defaultPaymentExist) {
              v.editSupplier.supplierPaymentList[0].isDefault = 1;
            }
          }
          let defaultContactExist = false;
          if (
            v.editSupplier.supplierContactList &&
            v.editSupplier.supplierContactList.length > 0
          ) {
            // 如果没有默认联系人，选第一个为默认联系人
            v.editSupplier.supplierContactList.forEach((n, i) => {
              if (n.isDefault == 1) {
                defaultContactExist = true;
              }
            });
            if (!defaultContactExist) {
              v.editSupplier.supplierContactList[0].isDefault = 1;
            }
          }
          if (v.source == "price") {
            v.axios.post(api.submitSupplier, v.editSupplier).then((res) => {
              if (res.data.code == 0) {
                v.$Message.success("提交成功");
                let obj = {
                  supplierId: res.data.datas.supplierId,
                  supplierName: res.data.datas.supplierName,
                };
                v.$emit("submit-supplier", obj);
              }
              v.submitSupLoading = false;
            });
          } else {
            temp.setupStatus = temp.setupStatus == true ? 1 : 0;

            v.axios.post(api.managementSubmit, temp).then((res) => {
              if (res.data.code == 0) {
                v.$Message.success("提交成功");
                v.$emit("submit-supplier");
              }
              v.submitSupLoading = false;
            });
          }
        } else {
          // 验证错误定位
          v.errorLocation();
        }
      });
    },
    errorLocation() {
      // 验证错误定位
      let v = this;
      if (v.currentSupplierTabItem == "0") {
        if (!v.testPaymentList()) {
          v.currentSupplierTabItem = "0";
        } else if (!v.testContactList()) {
          v.currentSupplierTabItem = "1";
        } else if (!v.testAttachmentList()) {
          v.currentSupplierTabItem = "2";
        }
      } else if (v.currentSupplierTabItem == "1") {
        if (!v.testContactList()) {
          v.currentSupplierTabItem = "1";
        } else if (!v.testPaymentList()) {
          v.currentSupplierTabItem = "0";
        } else if (!v.testAttachmentList()) {
          v.currentSupplierTabItem = "2";
        }
      } else if (v.currentSupplierTabItem == "2") {
        if (!v.testAttachmentList()) {
          v.currentSupplierTabItem = "2";
        } else if (!v.testPaymentList()) {
          v.currentSupplierTabItem = "0";
        } else if (!v.testContactList()) {
          v.currentSupplierTabItem = "1";
        }
      }
    },
    testPaymentList() {
      let v = this;
      let valid = true;
      if (!v.editSupplier.settlementType) {
        return false;
      } else if (v.editSupplier.settlementType === "04") {
        if (
          !v.editSupplier.settlementTime ||
          !v.editSupplier.settlementPeriod
        ) {
          return false;
        } else if (
          v.editSupplier.settlementPeriod === "02" ||
          v.editSupplier.settlementPeriod === "04"
        ) {
          if (!v.editSupplier.settlementTimeValue) {
            return false;
          }
        } else if (v.editSupplier.settlementPeriod === "03") {
          if (!v.editSupplier.settlementTimeValue) {
            return false;
          }
        }
      }

      v.editSupplier.supplierPaymentList.forEach((n, i) => {
        if (!n.paymentType) {
          valid = false;
        } else if (
          n.paymentType == "02" &&
          (!n.paymentBank ||
            !n.paymentAccount ||
            n.paymentAccount.length > 64 ||
            !n.paymentAccountName ||
            n.paymentAccountName.length > 64)
        ) {
          valid = false;
        } else if (
          (n.paymentType == "03" || n.paymentType == "04") &&
          (!n.paymentAccount || n.paymentAccount.length > 64)
        ) {
          valid = false;
        }
      });
      return valid;
    },
    testContactList() {
      let v = this;
      let valid = true;
      let reg = v.$regular.AllNumber;
      // let phoneReg = v.$regular.isPhone;
      let emailReg = v.$regular.isMailbox;
      v.editSupplier.supplierContactList.forEach((n, i) => {
        if (n.contactMan.length > 64) {
          valid = false;
        }
        if (n.telephone) {
          if (!reg.test(n.telephone) || n.telephone.length > 20) {
            valid = false;
          }
        }
        if (n.mobilePhone) {
          if (!reg.test(n.mobilePhone) || n.mobilePhone.length > 20) {
            valid = false;
          }
        }
        if (n.qqNumber) {
          if (
            !reg.test(n.qqNumber) ||
            (n.qqNumber.length > 0 && n.qqNumber.length < 5) ||
            n.qqNumber.length > 50
          ) {
            valid = false;
          }
        }
        if (n.email) {
          if (!emailReg.test(n.email)) {
            valid = false;
          }
        }
      });
      return valid;
    },
    testAttachmentList() {
      let v = this;
      let valid = true;
      v.editSupplier.supplierAttachmentList.forEach((n, i) => {
        if (!n.attachmentDesc) {
          valid = false;
        }
      });
      return valid;
    },
    batchOperation(type) {
      this.$emit("batch-operation", type);
    },
    closeSupplierModal() {
      this.$emit("close-supplier-modal");
    },
    changeTime(e) {
      this.editSupplier.introduceTime = e;
    },
    getAddress(parentId) {
      return new Promise((resolve) => {
        this.axios
          .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${parentId}`)
          .then((res) => {
            let temp = res.data.data;
            let circle = (temp) => {
              temp.forEach((item) => {
                item.children = item.childrenDistrictList;
                item.label = item.districtCnName;
                item.value = item.districtCnName;
                if ([0, "0"].includes(item.isLastNode)) {
                  item.loading = false;
                }
                delete item.childrenDistrictList;
                if (item.children) circle(item.children);
              });
            };
            circle(temp);
            resolve(temp);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    // 展开子级加载
    loadAreaData(item, callback) {
      item.loading = true;
      if (item.isLastNode == 1) {
        item.loading = false;
        callback();
        return;
      }
      this.axios
        .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${item.id}`)
        .then((res) => {
          let temp = res.data.data;
          let circle = (temp) => {
            temp.forEach((itema) => {
              itema.children = itema.childrenDistrictList;
              itema.label = itema.districtCnName;
              itema.value = itema.districtCnName;
              //加了不会退出
              if (itema.isLastNode == 0) {
                itema.loading = false;
              }
              delete itema.childrenDistrictList;
              if (itema.children) circle(itema.children);
            });
          };
          circle(temp);
          item.children = temp;
          item.loading = false;
          callback();
        });
    },
    // 格式化时间
    formatTime(time, type) {
      let pattern = /-/        
      let resultTime = ''
      if(!pattern.test(time) && !this.$common.isEmpty(time)){
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0')
        const hour = String(date.getHours()).padStart(2, '0')
        const minute = String(date.getMinutes()).padStart(2, '0')
        resultTime = `${year}-${month}-${day} ${hour}:${minute}`;
        return resultTime
      } else {
        return time
      }
    },
  },
};
</script>
