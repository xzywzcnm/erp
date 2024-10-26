<template>
  <div>
    <Modal v-model="modal" title="添加供应商" width="1200">
      <Form ref="editSupplier" :model="editSupplier" :label-width="80" :rules="ruleValidate">
        <Row>
          <Col :span="13">
          <FormItem label="名称" prop="supplierName">
            <Input v-model.trim="editSupplier.supplierName" style="width: 360px"></Input>
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="代码" :label-width="110">
            <Input v-model.trim="editSupplier.supplierCode"></Input>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
          <FormItem label="等级">
            <dyt-select v-model="editSupplier.supplierLevel" clearable style="width: 360px">
              <Option v-for="(item, index) in supplierLevelArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="主营品类" :label-width="110">
            <dyt-select ref="categorySelect" v-model="editSupplier.supplierCategoryId" filterable clearable>
              <Option v-for="(item, index) in mainCategoryArr" :value="item.supplierCategoryId" :key="index">{{ item.categoryName }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
          <FormItem label="开发人">
            <dyt-select ref="developerSelect" v-model="editSupplier.developerId" filterable clearable style="width: 360px">
              <Option v-for="(item, index) in developerArr" :value="item.userId" :key="index" @click.native="developerFn(item)">{{ item.name }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="采购人" :label-width="110" prop="purchaserId">
            <dyt-select ref="purchaserSelect" v-model="editSupplier.purchaserId" filterable clearable>
              <Option v-for="(item, index) in purchaserArr" :value="item.userId" :key="index" @click.native="purchaserFn(item)">{{ item.name }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
          <FormItem label="地址">
            <Row>
              <Col span="7">
              <dyt-select ref="countrySelect" clearable filterable v-model="editSupplier.countryId" @on-change="countryChangeFn">
                <Option v-for="(item, index) in countryArr" :value="item.countryId" :key="index">{{ item.cnName }}</Option>
              </dyt-select>
              </Col>
              <Col span="7" style="margin-left: 10px">
              <dyt-select ref="supProvinceSelect" clearable filterable v-model="editSupplier.provinceId" @on-open-change="getProvinceFn" @on-change="provinceChangeFn">
                <Option v-for="(item, index) in provinceArr" :value="item.stateId" :key="index">{{ item.cnName }}</Option>
              </dyt-select>
              </Col>
              <Col span="7" style="margin-left: 10px">
              <dyt-select ref="supCitySelect" clearable filterable v-model="editSupplier.cityId" @on-open-change="getCityFn">
                <Option v-for="(item, index) in cityArr" :value="item.cityId" :key="index">{{ item.cnName }}</Option>
              </dyt-select>
              </Col>
            </Row>
          </FormItem>
          </Col>
          <Col :span="10">
          <FormItem label="供应商采购类型" prop="supplierType" :label-width="110">
            <dyt-select v-model="editSupplier.supplierType" filterable clearable>
              <Option v-for="(item, index) in supplierTypeArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
          <FormItem label="详细地址">
            <Input v-model.trim="editSupplier.address" :maxlength="500"></Input>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col :span="13">
          <FormItem label="店铺网址">
            <Input v-model.trim="editSupplier.storeUrl" :maxlength="250"></Input>
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
            <Input v-model.trim="editSupplier.settlementRemark" type="textarea" :rows="3" placeholder="请输入..." :maxlength="1000"></Input>
          </FormItem>
          </Col>
        </Row>
        <div class="supplierTabsBar">
          <template>
            <Tabs @on-click="currentSupplierPage" v-model="currentSupplierTabItem">
              <TabPane v-for="(item, index) in addTabItems" :label="item.value" :key="index" :name="String(index)"></TabPane>
            </Tabs>
          </template>
        </div>
        <!-- 财务结算 -->
        <div v-show="currentSupplierTabItem == '0'">
          <Row>
            <Col :span="6">
            <FormItem label="结算方式" prop="settlementType">
              <dyt-select v-model="editSupplier.settlementType" @on-change="settlementTypeChangeFn" placeholder="请选择结算方式">
                <Option v-for="(item, index) in settlementMethodArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
              </dyt-select>
            </FormItem>
            </Col>
            <!-- 结算时间 -->
            <Col :span="6">
            <template v-if="editSupplier.settlementType == '04'">
              <FormItem label="结算时间" prop="settlementTime">
                <dyt-select v-model="editSupplier.settlementTime" @on-change="settlementTimeChangeFn" placeholder="请选择">
                  <!-- <Option v-for="(item, index) in settlementTimeArr" :value="item.dataValue" :key="index" @click.native="editSupplier.settlementTimeName = item.dataDesc">{{ item.dataDesc }}</Option> -->
                  <Option v-for="(item, index) in settlementTimeArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
                </dyt-select>
              </FormItem>
            </template>
            </Col>
            <Col :span="6" style="padding-left: 10px">
            <template v-if="editSupplier.settlementType == '04'">
              <FormItem prop="settlementPeriod" :label-width="10">
                <dyt-select v-model="editSupplier.settlementPeriod" @on-change="settlementPeriodChangeFn" placeholder="请选择">
                  <!-- <Option v-for="(item, index) in settlementPeriodArr" :value="item.dataValue" :key="index" @click.native="editSupplier.settlementPeriodName = item.dataDesc">{{ item.dataDesc }}</Option> -->
                  <Option v-for="(item, index) in settlementPeriodArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
                </dyt-select>
              </FormItem>
            </template>
            </Col>
            <!-- 选择日期 -->
            <Col :span="6" style="padding-left: 10px">
            <!-- <template v-if="editSupplier.settlementTime == '03'">
                <DatePicker type="date" placeholder="选择日期" v-model="editSupplier.settlementTimeValue" :disabled="!isEditSupplier"></DatePicker>
              </template> -->
            <!-- 周结 半月结 -->
            <template v-if="
                  editSupplier.settlementPeriod == '02' ||
                  editSupplier.settlementPeriod == '04'
                ">
              <FormItem prop="settlementTimeValue" :label-width="10">
                <dyt-select v-model="editSupplier.settlementTimeValue" placeholder="请选择">
                  <Option v-for="(item, index) in settlementTimeValueArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}</Option>
                </dyt-select>
              </FormItem>
            </template>
            <!-- 月结 -->
            <template v-if="editSupplier.settlementPeriod == '03'">
              <FormItem prop="settlementTimeValue" :label-width="10">
                <DatePicker type="date" format="d" @on-change="settlementTimeValueChangeFn" placeholder="选择日期" :value="editSupplier.settlementTimeValue"></DatePicker>
              </FormItem>
            </template>
            </Col>
          </Row>
          <div class="tableControl">
            <Button type="primary" @click="addPayMethodFn" class="iconbuttons" style="margin-left: 12px">
              新增支付方式
            </Button>
          </div>
          <div class="orderTable normalTop deleteLabelWidth">
            <Table ref="payTable" highlight-row :border="true" :columns="payColumn1" :data="editSupplier.supplierPaymentList"></Table>
          </div>
        </div>
        <div v-show="currentSupplierTabItem == '1'">
          <div class="tableControl">
            <Button type="primary" class="iconbuttons" @click="addCntactFn" style="margin-left: 12px">
              新增联系人
            </Button>
          </div>
          <div class="orderTable normalTop deleteLabelWidth">
            <Table ref="payTable" highlight-row :border="true" :columns="payColumn2" :data="editSupplier.supplierContactList"></Table>
          </div>
        </div>
        <div v-show="currentSupplierTabItem == '2'">
          <Row>
            <template v-for="(item, index) in editSupplier.supplierAttachmentList">
              <Col span="5" :offset="1" class="supplierAttachmentList" :key="index">
              <div class="pic" :key="`d-${index}`">
                <img :src="$store.state.imgUrl + item.attachmentUrl" />
              </div>
              <div :key="`cd-${index}`" class="delete deleteLabelWidth" style="text-align: center; margin-top: 10px">
                <Row>
                  <Col :span="16">
                  <FormItem :prop="
                          'supplierAttachmentList.' + index + '.attachmentDesc'
                        " :rules="[
                          {
                            required: true,
                            message: '名称不能为空',
                            trigger: 'blur',
                          },
                          {
                            type: 'string',
                            max: 100,
                            message: '不能超过100字符',
                            trigger: 'change',
                          },
                        ]">
                    <Input v-model.trim="item.attachmentDesc"></Input>
                  </FormItem>
                  </Col>
                  <Col :span="8">
                  <Button @click="deleteImg(index)">删除</Button>
                  </Col>
                </Row>
              </div>
              </Col>
            </template>
            <Col span="5" :offset="1" class="spsUpload">
            <template>
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
                  <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                </div>
              </dytUpload>
            </template>
            </Col>
          </Row>
        </div>
      </Form>
      <div slot="footer">
        <Button @click="modal = false">取消</Button>
        <Button type="primary" @click="submitSupplierFn('editSupplier')" :loading="submitSupLoading" style="margin-left: 20px">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";

/***
 * 挪 sps新增
 * */

export default {
  name: "addSupplier",
  mixins: [CommonMixin],
  data () {
    let self = this;
    return {
      modal: false,
      editSupplier: {
        // 新增、编辑供货商
        supplierName: "",
        supplierCode: "",
        supplierLevel: "",
        supplierCategoryId: "",
        developerName: "",
        developerId: "",
        purchaserName: "",
        purchaserId: "",
        countryId: "64961f3d-9e6b-11e7-87bc-0050568e2f6d", // 中国
        provinceId: "",
        cityId: "",
        supplierType: "",
        address: "",
        storeUrl: "",
        useFlag: 0,
        settlementRemark: "",
        settlementType: "",
        settlementPeriod: "",
        settlementPeriodName: "",
        settlementTime: "",
        settlementTimeName: "",
        settlementTimeValue: "",
        supplierPaymentList: [
          // 供应商支付方式表，默认无数据
          // {
          //   isDefault: 0,
          //   merchantId: '',
          //   paymentAccount: '',
          //   paymentAccountName: '',
          //   paymentBank: '',
          //   paymentType: '',
          //   subbranch: '',
          //   supplierIds: [],
          //   supplierId: '',
          //   supplierPaymentId: ''
          // }
        ],
        supplierContactList: [
          // 供应商联系人表
          {
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
            wwAccount: ""
          }
        ],
        supplierAttachmentList: [
          // 供应商附件表
          /* {
           attachmentDesc: '',
           attachmentUrl: '',
           merchantId: '',
           supplierAttachmentId: '',
           supplierId: '',
           } */
        ]
      },
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
          value: "财务结算"
        },
        {
          key: "1",
          value: "联系人"
        },
        {
          key: "2",
          value: "供应商资料"
        }
      ],
      settlementMethodArr: [],
      actionUrl: api.spsFileUpLoad,
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
                      key: i
                    }
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
                      trigger: "change"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h(
                  "Select",
                  {
                    props: {
                      value:
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentType,
                      transfer: true
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
                      }
                    }
                  },
                  arr
                )
              ]
            );
          }
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
                        key: i
                      }
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
                        trigger: "change"
                      }
                    ]
                  },
                  style: {
                    marginTop: "20px"
                  }
                },
                [
                  h(
                    "Select",
                    {
                      props: {
                        value:
                          self.editSupplier.supplierPaymentList[params.index]
                            .paymentBank,
                        transfer: true
                      },
                      on: {
                        "on-change": (value) => {
                          self.editSupplier.supplierPaymentList[
                            params.index
                          ].paymentBank = value;
                        }
                      }
                    },
                    arr
                  )
                ]
              );
            } else {
              return "";
            }
          }
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
                        trigger: "blur"
                      },
                      {
                        type: "string",
                        max: 64,
                        message: "不能超过64字符",
                        trigger: "change"
                      }
                    ]
                  },
                  style: {
                    marginTop: "20px"
                  }
                },
                [
                  h("Input", {
                    props: {
                      value:
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentAccount
                    },
                    on: {
                      input: (value) => {
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccount = value.replace(/(^\s*)|(\s*$)/g, "");
                      }
                    }
                  })
                ]
              );
            }
          }
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
                        trigger: "blur"
                      },
                      {
                        type: "string",
                        max: 64,
                        message: "不能超过64字符",
                        trigger: "change"
                      }
                    ]
                  },
                  style: {
                    marginTop: "20px"
                  }
                },
                [
                  h("Input", {
                    props: {
                      value:
                        self.editSupplier.supplierPaymentList[params.index]
                          .paymentAccountName
                    },
                    on: {
                      input: (value) => {
                        self.editSupplier.supplierPaymentList[
                          params.index
                        ].paymentAccountName = value.replace(
                          /(^\s*)|(\s*$)/g,
                          ""
                        );
                      }
                    }
                  })
                ]
              );
            }
          }
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
                  maxlength: 300
                },
                on: {
                  input: (value) => {
                    self.editSupplier.supplierPaymentList[
                      params.index
                    ].subbranch = value.replace(/(^\s*)|(\s*$)/g, "");
                  }
                }
              });
            } else {
              return "";
            }
          }
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
                  1
              },
              on: {
                "on-change": (value) => {
                  v.editSupplier.supplierPaymentList[
                    params.index
                  ].isDefault = value ? 1 : 0;
                  v.editSupplier.supplierPaymentList.forEach((n, i) => {
                    if (n.isDefault && i !== params.index) {
                      v.editSupplier.supplierPaymentList[i].isDefault = 0;
                    }
                  });
                }
              }
            });
          }
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
                  title: "确认要删除该行数据吗？",
                  placement: "top-end"
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
                  }
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary"
                    }
                  },
                  "删除"
                )
              ]
            );
          }
        }
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
                      trigger: "change"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.editSupplier.supplierContactList[params.index]
                        .contactMan
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].contactMan = value.replace(/(^\s*)|(\s*$)/g, "");
                    }
                  }
                })
              ]
            );
          }
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
                      validator: self.validatePhone(),
                      trigger: "blur"
                    },
                    {
                      type: "string",
                      max: 20,
                      message: "不能超过20字符",
                      trigger: "change"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.editSupplier.supplierContactList[params.index]
                        .telephone
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].telephone = value.replace(/(^\s*)|(\s*$)/g, "");
                    }
                  }
                })
              ]
            );
          }
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
                      validator: self.validateNumber(),
                      trigger: "blur"
                    },
                    {
                      type: "string",
                      max: 20,
                      message: "不能超过20字符",
                      trigger: "change"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.editSupplier.supplierContactList[params.index]
                        .mobilePhone
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].mobilePhone = value.replace(/(^\s*)|(\s*$)/g, "");
                    }
                  }
                })
              ]
            );
          }
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
                      trigger: "blur"
                    },
                    {
                      max: 50,
                      message: "不能超过50字符",
                      trigger: "change"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.editSupplier.supplierContactList[params.index].email
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].email = value.replace(/(^\s*)|(\s*$)/g, "");
                    }
                  }
                })
              ]
            );
          }
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
                      validator: self.validateNumber(),
                      trigger: "blur"
                    },
                    {
                      type: "string",
                      max: 50,
                      message: "不能超过50字符",
                      trigger: "change"
                    },
                    {
                      type: "string",
                      min: 5,
                      message: "不能少于5字符",
                      trigger: "blur"
                    }
                  ]
                },
                style: {
                  marginTop: "20px"
                }
              },
              [
                h("Input", {
                  props: {
                    value:
                      self.editSupplier.supplierContactList[params.index]
                        .qqNumber
                  },
                  on: {
                    input: (value) => {
                      self.editSupplier.supplierContactList[
                        params.index
                      ].qqNumber = value.replace(/(^\s*)|(\s*$)/g, "");
                    }
                  }
                })
              ]
            );
          }
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
                maxlength: 50
              },
              on: {
                input: (value) => {
                  self.editSupplier.supplierContactList[
                    params.index
                  ].wwAccount = value.replace(/(^\s*)|(\s*$)/g, "");
                }
              }
            });
          }
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
                maxlength: 20
              },
              on: {
                input: (value) => {
                  self.editSupplier.supplierContactList[
                    params.index
                  ].faxNumber = value.replace(/(^\s*)|(\s*$)/g, "");
                }
              }
            });
          }
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
                  1
              },
              on: {
                "on-change": (value) => {
                  v.editSupplier.supplierContactList[
                    params.index
                  ].isDefault = value ? 1 : 0;
                  v.editSupplier.supplierContactList.forEach((n, i) => {
                    if (n.isDefault && i !== params.index) {
                      v.editSupplier.supplierContactList[i].isDefault = 0;
                    }
                  });
                }
              }
            });
          }
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
                  title: "确认要删除该行数据吗？",
                  placement: "top-end"
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
                  }
                }
              },
              [
                h(
                  "Button",
                  {
                    props: {
                      type: "primary"
                    }
                  },
                  "删除"
                )
              ]
            );
          }
        }
      ],
      settlementTimeValueArr: [
        {
          dataValue: "1",
          dataDesc: "账期后1天"
        },
        {
          dataValue: "2",
          dataDesc: "账期后2天"
        },
        {
          dataValue: "3",
          dataDesc: "账期后3天"
        },
        {
          dataValue: "4",
          dataDesc: "账期后4天"
        },
        {
          dataValue: "5",
          dataDesc: "账期后5天"
        },
        {
          dataValue: "6",
          dataDesc: "账期后6天"
        },
        {
          dataValue: "7",
          dataDesc: "账期后7天"
        }
      ],
      ruleValidate: {
        supplierName: [
          {
            required: true,
            message: "名称不能为空",
            trigger: "blur"
          },
          {
            type: "string",
            max: 200,
            message: "不能超过200字符",
            trigger: "change"
          }
        ],
        purchaserId: [
          {
            required: true,
            message: "采购人不能为空",
            trigger: "blur"
          }
        ],
        supplierType: [
          {
            required: true,
            message: "请选择供应商类型",
            trigger: "change"
          }
        ],
        settlementType: [
          {
            required: true,
            message: "请选择结算方式",
            trigger: "change"
          }
        ],
        settlementTime: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change"
          }
        ],
        settlementPeriod: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change"
          }
        ],
        settlementTimeValue: [
          {
            required: true,
            message: "请选择结算时间",
            trigger: "change"
          }
        ]
      }
    };
  },
  created () {
    this.$nextTick(() => {
      this.$refs.countrySelect.clearSingleSelect(); // 清空国家选项
      this.$refs.categorySelect.clearSingleSelect();
      this.$refs.developerSelect.clearSingleSelect();
      this.$refs.purchaserSelect.clearSingleSelect();
    });
    this.getBaseDataFn();
    this.getCountryFn();
    if (this.editSupplier.provinceId) {
      this.getProvinceFn(true);
      if (this.editSupplier.cityId) {
        this.getCityFn(true);
      }
    }
  },
  props: {},
  watch: {},
  methods: {
    validatePhone () {
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
    validateNumber () {
      // 可共用，可为空，纯数字
      let reg = /(^\d+$)|(^$)/;
      let phone = function (rule, value, callback) {
        if (value !== null && !reg.test(value)) {
          callback(new Error("不能有字母"));
        } else {
          callback();
        }
      };
      return phone;
    },
    validatePrice () {
      // 校验价格
      let v = this;
      let reg = v.$regular.validatePrice;
      return function (rule, value, callback) {
        if (!value) {
          callback(new Error("不能为空"));
        } else if (value.length > 27) {
          callback(new Error("数字太大"));
        } else if (!reg.test(value)) {
          callback(new Error("请输入正整数或者两位小数的金额"));
        } else {
          callback();
        }
      };
    },
    validateInteger () {
      // 校验正整数
      let v = this;
      let reg = v.$regular.validateInteger;
      return function (rule, value, callback) {
        if (!value) {
          callback(new Error("不能为空"));
        } else if (!reg.test(String(value))) {
          callback(new Error("输入的数字必须为正整数"));
        } else {
          callback();
        }
      };
    },
    getBaseDataFn () {
      let v = this;
      v.axios
        .get(api.baseDataList + "?dataType=" + "supplierLevel")
        .then((res) => {
          if (res.code == 0) {
            v.supplierLevelArr = res.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "supplierType")
        .then((res) => {
          if (res.code == 0) {
            v.supplierTypeArr = res.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.code == 0) {
            v.settlementMethodArr = res.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "paymentType")
        .then((res) => {
          if (res.code == 0) {
            v.payMethodArr = res.datas;
          }
        });
      v.axios.get(api.baseDataList + "?dataType=" + "bank").then((res) => {
        if (res.code == 0) {
          v.bankArr = res.datas;
        }
      });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementPeriod")
        .then((res) => {
          if (res.code == 0) {
            v.settlementPeriodArr = res.datas;
          }
        });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementTime")
        .then((res) => {
          if (res.code == 0) {
            v.settlementTimeArr = res.datas;
          }
        });
      v.axios.post(api.categoryQuery, {}).then((res) => {
        if (res.code == 0) {
          v.mainCategoryArr = res.datas.list;
        }
      });
      v.axios.get(api.get_userInfoCommon).then((res) => {
        if (res.code == 0) {
          let arr = [];
          let datas = res.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName
              });
            }
          }
          v.developerArr = arr;
          v.purchaserArr = arr;
        }
      });
    },
    developerFn (data) {
      this.editSupplier.developerName = data.name;
    },
    purchaserFn (data) {
      this.editSupplier.purchaserName = data.name;
    },
    getCountryFn () {
      let v = this;
      v.axios.get(api.country).then((res) => {
        if (res.code == 0) {
          v.countryArr = res.datas;
        }
      });
    },
    getProvinceFn (name) {
      // 获取省、州列表
      let v = this;
      if (name) {
        if (v.editSupplier.countryId) {
          v.axios
            .get(api.province + "?countryId=" + v.editSupplier.countryId)
            .then((res) => {
              if (res.code == 0) {
                v.provinceArr = res.datas;
              }
            });
        } else {
          v.$Message.warning("请先选择国家");
        }
      }
    },
    getCityFn (name) {
      // 获取城市列表
      let v = this;
      if (name) {
        if (v.editSupplier.provinceId) {
          v.axios
            .get(api.allCity + "?stateId=" + v.editSupplier.provinceId)
            .then((res) => {
              if (res.code == 0) {
                v.cityArr = res.datas;
              }
            });
        } else {
          v.$Message.warning("请先选择省州");
        }
      }
    },
    countryChangeFn () {
      // 选择国家改变时
      this.$refs.supProvinceSelect.clearSingleSelect();
      this.provinceArr = [];
      this.cityArr = [];
    },
    provinceChangeFn () {
      // 选择省\州改变时
      this.$refs.supCitySelect.clearSingleSelect();
      this.cityArr = [];
    },
    currentSupplierPage () { },
    settlementTypeChangeFn () {
      this.editSupplier.settlementPeriod = "";
      this.editSupplier.settlementPeriodName = "";
      this.editSupplier.settlementTime = "";
      this.editSupplier.settlementTimeName = "";
      this.editSupplier.settlementTimeValue = "";
    },
    settlementTimeChangeFn () { },
    settlementPeriodChangeFn () {
      this.editSupplier.settlementTimeValue = "";
    },
    settlementTimeValueChangeFn (value) {
      this.editSupplier.settlementTimeValue = value;
    },
    addPayMethodFn () {
      let obj = {
        isDefault: 0,
        merchantId: "",
        paymentAccount: "",
        paymentAccountName: "",
        paymentBank: "",
        paymentType: this.payMethodArr[0].dataValue,
        subbranch: "",
        supplierId: "",
        supplierPaymentId: ""
      };
      if (this.editSupplier.supplierPaymentList.length === 0) {
        obj.isDefault = 1;
      }
      this.editSupplier.supplierPaymentList.push(obj);
    },
    addCntactFn () {
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
        wwAccount: ""
      });
    },
    handleSuccess (res, file) {
      // 上传成功
      let v = this;
      if (res.code == 0) {
        file.url = res.datas[0];
        let arr = file.url.split("/");
        let name = arr[arr.length - 1];
        file.name = name.split(".")[0];
        v.editSupplier.supplierAttachmentList.push({
          attachmentDesc: "",
          attachmentUrl: file.url,
          supplierAttachmentId: ""
        });
      } else {
        v.$Message.error("上传失败，请重试");
        new Error("图片上传接口异常！");
      }
    },
    handleFormatError (file) {
      // 上传文件格式有误
      let v = this;
      v.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[jpg、png或gif]"
      });
    },
    handleMaxSize (file) {
      // 上传文件超过限定大学
      this.$Notice.warning({
        title: "文件大小受限",
        desc: "文件 " + file.name + " 太大, 不能超过2M"
      });
    },
    deleteImg (index) {
      if (
        this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
      ) {
        this.editSupplier.supplierAttachmentIds.push(
          this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
        );
      }
      this.editSupplier.supplierAttachmentList.splice(index, 1);
    },
    saveSupplierFn (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.saveSupLoading = true;
          let obj = v.deepCopy(v.editSupplier);
          let defaultPaymentExist = false;
          if (obj.supplierPaymentList && obj.supplierPaymentList.length > 0) {
            // 如果没有默认支付方式，选第一个为默认支付方式
            obj.supplierPaymentList.forEach((n) => {
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
            obj.supplierContactList.forEach((n) => {
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
              if (res.code == 0) {
                // 新增的供应商添加到供应商列表
                v.$Message.success("保存成功");
                let obj = {
                  supplierId: res.datas.supplierId,
                  supplierName: res.datas.supplierName
                };
                v.$emit("save-supplier", obj);
              }
              v.saveSupLoading = false;
            });
          } else {
            v.axios.post(api.managementSave, obj).then((res) => {
              if (res.code == 0) {
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
    submitSupplierFn (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.submitSupLoading = true;
          let defaultPaymentExist = false;
          if (
            v.editSupplier.supplierPaymentList &&
            v.editSupplier.supplierPaymentList.length > 0
          ) {
            // 如果没有默认支付方式，选第一个为默认支付方式
            v.editSupplier.supplierPaymentList.forEach((n) => {
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
            v.editSupplier.supplierContactList.forEach((n) => {
              if (n.isDefault == 1) {
                defaultContactExist = true;
              }
            });
            if (!defaultContactExist) {
              v.editSupplier.supplierContactList[0].isDefault = 1;
            }
          }
          v.axios.post(api.managementSubmit, v.editSupplier).then((res) => {
            if (res.code == 0) {
              v.$Message.success("提交成功");
              v.modal = false;
            }
            v.submitSupLoading = false;
          });
        } else {
          // 验证错误定位
          v.errorLocation();
        }
      });
    },
    errorLocation () {
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
    testPaymentList () {
      let v = this;
      let valid = true;
      v.editSupplier.supplierPaymentList.forEach((n) => {
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
    testContactList () {
      let v = this;
      let valid = true;
      let reg = v.$regular.AllNumber;
      let phoneReg = v.$regular.isPhone;
      let emailReg = v.$regular.isMailbox;
      v.editSupplier.supplierContactList.forEach((n) => {
        if (n.contactMan.length > 64) {
          valid = false;
        }
        if (!phoneReg.test(n.telephone) || n.telephone.length > 20) {
          valid = false;
        }
        if (!reg.test(n.mobilePhone) || n.mobilePhone.length > 20) {
          valid = false;
        }
        if (
          !reg.test(n.qqNumber) ||
          (n.qqNumber.length > 0 && n.qqNumber.length < 5) ||
          n.qqNumber.length > 50
        ) {
          valid = false;
        }
        if (n.email && !emailReg.test(n.email)) {
          valid = false;
        }
      });
      return valid;
    },
    testAttachmentList () {
      let v = this;
      let valid = true;
      v.editSupplier.supplierAttachmentList.forEach((n) => {
        if (!n.attachmentDesc) {
          valid = false;
        }
      });
      return valid;
    },
    batchOperation (type) {
      this.$emit("batch-operation", type);
    },
    closeSupplierModal () {
      this.$emit("close-supplier-modal");
    }
  }
};
</script>

<style scoped>
.spsUpload .ivu-upload-drag {
  border: 1px dashed #dcdee2 !important;
}

.deleteLabelWidth .ivu-form-item-content {
  margin-left: 0 !important;
}
</style>
