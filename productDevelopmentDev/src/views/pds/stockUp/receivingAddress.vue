<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div>
          <Button class="mr15" @click="addRessMt">新增收货地址</Button><Button @click="delChange">批量停用</Button>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list',tableClass]">
            <Table highlight-row :height=" tableHeight" :columns="addressTableColumns" :data="addressDate" :loading="tableLoading" @on-selection-change="addressSelectionChange">
            </Table>
          </div>
          <Modal v-model="addressModal" :title="addressTit" width="800" class="addressModal">
            <Form ref="addressForm" class="reset" :label-width="90" :model="addressForm" :rules="addressRule">
              <FormItem prop="warehouseName">
                <label slot="label" class="redDot">样品仓名称</label>
                <Input v-model.trim="addressForm.warehouseName" :maxlength="50" />
              </FormItem>
              <FormItem prop="receiverName">
                <label slot="label" class="redDot">收货人</label>
                <Input v-model.trim="addressForm.receiverName" :maxlength="25" />
              </FormItem>
              <FormItem>
                <label class="redDot" slot="label">所在地区</label>
                <dyt-select v-model="addressForm.countryCode" ref="selectA" class="addressWid" filterable @on-change="getCountryId(addressForm.countryCode)">
                  <Option v-for="item in CountryList" :value="item.countryId" :key="item.countryId" :label="item.cnName"></Option>
                </dyt-select>
                <dyt-select v-model="addressForm.provinceCode" filterable class="addressWid" ref="selectB" @on-change="getStateId(addressForm.provinceCode)">
                  <Option v-for="item in ProvinceList" :value="item.stateId" :key="item.stateId" :label="item.cnName"></Option>
                </dyt-select>
                <dyt-select v-model="addressForm.cityCode" filterable class="addressWid" ref="selectC">
                  <Option v-for="item in deliveredList" :value="item.cityId" :key="item.cityId" :label="item.cnName"></Option>
                </dyt-select>
              </FormItem>
              <FormItem prop="detailAddress">
                <label class="redDot" slot="label">详细地址</label>
                <Input v-model.trim="addressForm.detailAddress" :maxlength="1000" type="textarea" placeholder="Enter something..."></Input>
              </FormItem>
              <FormItem prop="postcode">
                <label class="redDot" slot="label">邮编</label>
                <Input :maxlength="30" v-model="addressForm.postcode" />
              </FormItem>
              <FormItem prop="cellphone">
                <label class="redDot" slot="label">手机</label>
                <Input :maxlength="30" v-model="addressForm.cellphone" />
              </FormItem>
              <FormItem prop="cellphone">
                <label slot="label">固定电话</label>
                <Input :maxlength="10" style="width: 100px" v-model.trim="addressForm.telephoneAreaCode" @on-blur="checkPhoneValid" placeholder="区号" />-<Input style="width: 100px" v-model.trim="addressForm.telephoneNum" :maxlength="30" @on-blur="checkPhoneValid" placeholder="电话号码" />-<Input style="width: 100px" v-model.trim="addressForm.telephoneShortNum" :maxlength="10" @on-blur="checkPhoneValid" placeholder="分机号" />
              </FormItem>
              <FormItem>
                <label slot="label"></label>
                <i-switch v-model="isDefault"></i-switch>设置为默认地址<span class="color-999 f12">（设置后系统将在下单时自动选中该收货地址）</span>
              </FormItem>
            </Form>
            <div slot="footer">
              <Button type="text" @click="addressModal = false">取消</Button>
              <Button type="primary" @click="save">确定</Button>
            </div>
          </Modal>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import api from "../../../api/api";
import CommonMixin from "../../../components/mixin/commonMixin";
// import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';

export default {
  name: "receivingAddress",
  mixins: [CommonMixin, table_highly_adaptive],
  components: {},
  data () {
    let v = this;
    return {
      CountryList: [], // 国家
      ProvinceList: [], //
      deliveredList: [], //
      addressModal: false,
      addressTit: "新增收货地址",
      tableLoading: false,
      isDefault: false, // 设置默认地址
      addressDate: [],
      type: "add",
      addressTableColumns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          key: "warehouseName",
          title: "样品仓名称",
          minWidth: 120,
          align: "center"
        },
        {
          key: "receiverName",
          title: "收货人",
          minWidth: 120,
          align: "center"
        },
        {
          key: "locationFullName",
          title: "所在地区",
          minWidth: 160,
          align: "center"
        },
        {
          key: "detailAddress",
          title: "详细地址",
          minWidth: 160,
          align: "center",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: params.row.detailAddress
                }
              },
              params.row.detailAddress
            );
          }
        },
        {
          key: "postcode",
          title: "邮编",
          minWidth: 160,
          align: "center",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: params.row.postcode
                }
              },
              params.row.postcode
            );
          }
        },
        {
          key: "receiverName",
          title: "电话/手机",
          minWidth: 160,
          align: "center",
          render (h, params) {
            if (
              params.row.telephoneAreaCode === "" ||
              params.row.telephoneAreaCode === null
            ) {
              return h(
                "div",
                {
                  attrs: {
                    title: "空" + "/" + params.row.cellphone
                  }
                },
                "空" + "/" + params.row.cellphone
              );
            } else if (
              params.row.cellphone === "" ||
              params.row.cellphone === null
            ) {
              return h(
                "div",
                {
                  attrs: {
                    title:
                      params.row.telephoneAreaCode +
                      "-" +
                      params.row.telephoneNum +
                      "-" +
                      params.row.telephoneShortNum +
                      "/" +
                      "空"
                  }
                },
                params.row.telephoneAreaCode +
                "-" +
                params.row.telephoneNum +
                "-" +
                params.row.telephoneShortNum +
                "/" +
                "空"
              );
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title:
                      params.row.telephoneAreaCode +
                      "-" +
                      params.row.telephoneNum +
                      "-" +
                      params.row.telephoneShortNum +
                      "/" +
                      params.row.cellphone
                  }
                },
                params.row.telephoneAreaCode +
                "-" +
                params.row.telephoneNum +
                "-" +
                params.row.telephoneShortNum +
                "/" +
                params.row.cellphone
              );
            }
          }
        },
        {
          key: "receiverName",
          title: "是否为默认地址",
          minWidth: 160,
          align: "center",
          render (h, params) {
            if (params.row.isDefault === 0) {
              return h("div", "非默认地址");
            } else {
              return h("div", "默认地址");
            }
          }
        },
        {
          key: "receiverName",
          title: "是否启用",
          minWidth: 160,
          align: "center",
          render (h, params) {
            if (params.row.validStatus === 0) {
              return h("div", "是");
            } else {
              return h("div", "否");
            }
          }
        },
        {
          key: "enableFlag",
          align: "center",
          title: "操作",
          width: 120,
          render: (h, params) => {
            return h("local-down-button", {
              props: {
                data: {
                  btn: {
                    text: "修改", // 修改
                    clickFn: () => {
                      v.addressModal = true;
                      v.$axios
                        .get(
                          api.queryByCountryId +
                          "?countryId=" +
                          params.row.countryCode
                        )
                        .then((res) => {
                          if (res.code === 0) {
                            v.ProvinceList = "";
                            v.ProvinceList = res.datas;
                          }
                        })
                        .catch(() => { });
                      v.$axios
                        .get(
                          api.queryByStateId +
                          "?stateId=" +
                          params.row.provinceCode
                        )
                        .then((res) => {
                          if (res.code === 0) {
                            v.deliveredList = res.datas;
                          }
                        })
                        .catch(() => { });
                      Object.assign(v.addressForm, params.row);
                      v.addressForm.isDefault === 1
                        ? (v.isDefault = true)
                        : (v.isDefault = false);
                      v.type = "edit";
                    }
                  },
                  list: [
                    {
                      text: (() =>
                        params.row.isDefault === 0
                          ? "设置为默认地址"
                          : "默认地址")(),
                      value: 1,
                      clickFn: () => {
                        if (params.row.isDefault === 0) {
                          v.setDefault(params.row.shippingAddressId);
                        }
                      }
                    },
                    {
                      text: (() =>
                        params.row.validStatus === 0 ? "停用" : "启用")(),
                      value: 2,
                      clickFn: () => {
                        let status = params.row.validStatus === 0 ? 1 : 0;
                        v.delAddress([
                          {
                            shippingAddressId: params.row.shippingAddressId, // 收货地址ID，必需
                            validStatus: status
                          }
                        ]);
                      }
                    }
                  ]
                }
              }
            });
            // return h("div", [
            //   h(
            //     "Buttons",
            //     {
            //       props: {
            //         trigger: "click"
            //       },
            //       class: "defaultStyle trimming",
            //       on: {
            //         "on-click": (val) => {
            //           switch (val) {
            //             case "1":
            //               if (params.row.isDefault === 0) {
            //                 v.setDefault(params.row.shippingAddressId);
            //               }
            //               break;
            //             case "2":
            //               let status = params.row.validStatus === 0 ? 1 : 0;
            //               v.delAddress([
            //                 {
            //                   shippingAddressId: params.row.shippingAddressId, // 收货地址ID，必需
            //                   validStatus: status
            //                 }
            //               ]);
            //               break;
            //           }
            //         }
            //       }
            //     },
            //     [
            //       h(
            //         "Button",
            //         {
            //           type: "default",
            //           on: {
            //             click () {
            //               v.addressModal = true;
            //               v.$axios
            //                 .get(
            //                   api.queryByCountryId +
            //                     "?countryId=" +
            //                     params.row.countryCode
            //                 )
            //                 .then((res) => {
            //                   if (res.code === 0) {
            //                     v.ProvinceList = "";
            //                     v.ProvinceList = res.datas;
            //                   }
            //                 })
            //                 .catch(() => {});
            //               v.$axios
            //                 .get(
            //                   api.queryByStateId +
            //                     "?stateId=" +
            //                     params.row.provinceCode
            //                 )
            //                 .then((res) => {
            //                   if (res.code === 0) {
            //                     v.deliveredList = res.datas;
            //                   }
            //                 })
            //                 .catch(() => {});
            //               Object.assign(v.addressForm, params.row);
            //               v.addressForm.isDefault === 1
            //                 ? (v.isDefault = true)
            //                 : (v.isDefault = false);
            //               v.type = "edit";
            //             }
            //           }
            //         },
            //         [
            //           h("span", {
            //             style: {
            //               top: "0"
            //             }
            //           }),
            //           h("span", "修改")
            //         ]
            //       ),
            //       h(
            //         "Buttons-menu",
            //         {
            //           slot: "list"
            //         },
            //         [
            //           h(
            //             "Buttons-item",
            //             {
            //               props: {
            //                 name: "1"
            //               },
            //               domProps: {
            //                 innerHTML: (function () {
            //                   if (params.row.isDefault === 0) {
            //                     return "设置为默认地址";
            //                   } else {
            //                     return "默认地址";
            //                   }
            //                 })()
            //               }
            //             },
            //             ""
            //           ),
            //           h(
            //             "Buttons-item",
            //             {
            //               props: {
            //                 name: "2"
            //               },
            //               domProps: {
            //                 innerHTML: (function () {
            //                   if (params.row.validStatus === 0) {
            //                     return "停用";
            //                   } else {
            //                     return "启用";
            //                   }
            //                 })()
            //               }
            //             },
            //             ""
            //           )
            //         ]
            //       )
            //     ]
            //   )
            // ]);
          }
        }
      ],
      addressRule: {
        warehouseName: {
          required: true,
          message: "样品仓名称不能为空",
          trigger: "blur"
        },
        receiverName: {
          validator: v.receiverNameValid,
          trigger: "blur"
        },
        detailAddress: {
          required: true,
          message: "详细地址不能为空",
          trigger: "blur"
        },
        postcode: {
          validator: v.typeNub,
          trigger: "blur"
        },
        cellphone: {
          validator: v.cellphoneValid,
          trigger: "blur"
        }
      },
      addressForm: {
        countryCode: "64961f3d-9e6b-11e7-87bc-0050568e2f6d", // 收货国家编码
        provinceCode: "", // 收货省份编码
        warehouseName: "", // 样品仓名称
        cityCode: "", // 收货城市编码
        area: "", // 收货所在城市县份、分区(中文)
        detailAddress: "", // 收货详细地址
        receiverName: "", // 收货人姓名
        postcode: null, // 邮政编码
        cellphone: "", // 手机
        telephoneAreaCode: "", // 固定电话-区号
        telephoneNum: "", // 固定电话-电话号码
        telephoneShortNum: "" // 固定电话-分区号
      },
      addressChangeDate: []
    };
  },
  created () {
    let v = this;
    v.getList();
    v.getCountry();
    v.$nextTick(() => {
      v.getCountryId(v.addressForm.countryCode);
    });
  },
  methods: {
    delChange () {
      let arr = [];
      let v = this;
      if (v.addressChangeDate.length === 0) {
        v.$msg.error("未选择停用数据");
        return;
      }
      v.addressChangeDate.forEach((item) => {
        arr.push({
          shippingAddressId: item.shippingAddressId,
          validStatus: 1
        });
      });
      v.delAddress(arr);
    },
    addressSelectionChange (data) {
      let v = this;
      v.addressChangeDate = data;
    },
    addRessMt () {
      let v = this;
      v.addressModal = true;
      v.type = "add";
      v.resetForm(v.addressForm);
      v.$refs.addressForm.resetFields();
      v.addressTit = "新增收货地址";
      v.$axios
        .get(
          api.queryByCountryId +
          "?countryId=64961f3d-9e6b-11e7-87bc-0050568e2f6d"
        )
        .then((res) => {
          if (res.code === 0) {
            v.ProvinceList = "";
            v.ProvinceList = res.datas;
          }
        })
        .catch(() => { });
    },
    resetForm (form) {
      for (let key in form) {
        form[key] = "";
      }
      form.countryCode = "64961f3d-9e6b-11e7-87bc-0050568e2f6d";
    },
    getCountry (callback) {
      let v = this;
      v.$axios
        .get(api.queryCountry)
        .then((res) => {
          if (res.code === 0) {
            v.CountryList = res.datas;
            callback && callback();
          }
        })
        .catch(() => { });
    },
    getStateId (id, callback) {
      let v = this;
      v.addressForm.cityCode = "";
      v.$refs.selectC.reset();
      v.$axios
        .get(api.queryByStateId + "?stateId=" + id)
        .then((res) => {
          if (res.code === 0) {
            v.deliveredList = res.datas;
            callback && callback();
          }
        })
        .catch(() => { });
    },
    getCountryId (id, callback) {
      let v = this;
      v.addressForm.provinceCode = "";
      v.addressForm.cityCode = "";
      v.$refs.selectB.reset();
      v.$refs.selectC.reset();
      v.$axios
        .get(api.queryByCountryId + "?countryId=" + id)
        .then((res) => {
          if (res.code === 0) {
            v.ProvinceList = "";
            v.ProvinceList = res.datas;
            callback && callback();
          }
        })
        .catch(() => { });
    },
    getList () {
      let v = this;
      v.tableLoading = true;
      v.$axios
        .post(api.queryShippingAddress, {})
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            v.addressDate = res.datas;
          }
        })
        .catch(() => {
          v.tableLoading = false;
        });
    },
    checkPhoneValid () {
      this.$refs.addressForm.validateField("cellphone");
    },
    receiverNameValid (rule, value, callback) {
      // let v = this;
      if (value === "" || value === null) {
        callback(new Error("收货人不能为空"));
      } else if (value.length < 2) {
        callback(new Error("收货人字数范围为2-25"));
      } else {
        callback();
      }
    },
    cellphoneValid (rule, value, callback) {
      let v = this;
      let reg = v.$regular.AllNumber;
      if (v.addressForm.cellphone === "" || v.addressForm.cellphone === null) {
        if (
          v.addressForm.telephoneAreaCode === "" ||
          v.addressForm.telephoneNum === "" ||
          v.addressForm.telephoneShortNum === "" ||
          v.addressForm.telephoneAreaCode === null ||
          v.addressForm.telephoneNum === null ||
          v.addressForm.telephoneShortNum === null
        ) {
          callback("固定电话和手机必须填写一个");
        } else if (!reg.test(v.addressForm.telephoneAreaCode)) {
          callback(new Error("固定电话区号必须为数字"));
        } else if (!reg.test(v.addressForm.telephoneNum)) {
          callback(new Error("固定电话号码必须为数字"));
        } else if (!reg.test(v.addressForm.telephoneShortNum)) {
          callback(new Error("固定电话分号必须为数字"));
        } else {
          callback();
        }
      } else if (!reg.test(v.addressForm.cellphone)) {
        callback(new Error("手机必须为数字"));
      } else if (
        (v.addressForm.telephoneAreaCode === "" ||
          v.addressForm.telephoneAreaCode === null) &&
        (v.addressForm.telephoneNum === "" ||
          v.addressForm.telephoneNum === null) &&
        (v.addressForm.telephoneShortNum === "" ||
          v.addressForm.telephoneShortNum === null)
      ) {
        callback();
      } else if (!reg.test(v.addressForm.telephoneAreaCode)) {
        callback(new Error("固定电话区号必须为数字"));
      } else if (!reg.test(v.addressForm.telephoneNum)) {
        callback(new Error("固定电话号码必须为数字"));
      } else if (!reg.test(v.addressForm.telephoneShortNum)) {
        callback(new Error("固定电话分号必须为数字"));
      } else {
        callback();
      }
    },
    typeNub (rule, value, callback) {
      let v = this;
      let reg = v.$regular.AllNumber;
      if (value === "" || value === null) {
        callback(new Error("邮编不能为空"));
      } else if (!reg.test(value)) {
        callback(new Error("邮编只能为数字"));
      } else {
        callback();
      }
    },
    addAddress (params) {
      // 新增收货地址
      let v = this;
      v.$axios
        .post(api.createShippingAddress, params)
        .then(() => { })
        .catch(() => { });
    },
    updateAddress (params) {
      // 新增收货地址
      let v = this;
      v.$axios
        .post(api.updateShippingAddress, params)
        .then(() => { })
        .catch(() => { });
    },
    save () {
      let v = this;
      v.$refs.addressForm.validate((valid) => {
        if (valid) {
          v.addressForm.isDefault = v.isDefault ? 1 : 0;
          if (v.type === "add") {
            v.$Spin.show();
            v.$axios
              .post(api.createShippingAddress, v.addressForm)
              .then((res) => {
                v.$Spin.hide();
                if (res.code === 0) {
                  v.$msg.success("添加成功");
                  v.getList();
                  v.addressModal = false;
                }
              })
              .catch(() => {
                v.$Spin.hide();
              });
          } else if (v.type === "edit") {
            v.$Spin.show();
            v.$axios
              .post(api.updateShippingAddress, v.addressForm)
              .then((res) => {
                v.$Spin.hide();
                if (res.code === 0) {
                  v.$msg.success("修改成功");
                  /*  if (v.isDefault) {
                 v.setDefault(v.addressForm.shippingAddressId);
                 } else {
                 v.getList();
                 v.addressModal = false;
                 } */
                  v.getList();
                  v.addressModal = false;
                } else if (res.code === 1111) {
                  v.$msg.error({
                    content: "样品仓名称不能重复",
                    duration: 5
                  });
                } else {
                  v.$msg.error({
                    content: "修改失败",
                    duration: 5
                  });
                }
              })
              .catch(() => {
                v.$Spin.hide();
              });
          }
        }
      });
    },
    setDefault (id) {
      let v = this;
      v.$axios
        .post(api.setDefaultShippingAddress, {
          shippingAddressId: id
        })
        .then((res) => {
          if (res.code === 0) {
            // v.$msg.success('设置默认地址成功');
            v.getList();
          }
        })
        .catch(() => { });
    },
    delAddress (params) {
      let v = this;
      v.$axios
        .post(api.deleteShippingAddress, params)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("操作成功");
            v.addressChangeDate = [];
            v.getList();
          }
        })
        .catch(() => { });
    }
  }
};
</script>

<style>
.addressModal .ivu-modal-body {
  overflow-y: scroll;
}

.reset .ivu-form-item-required .ivu-form-item-label:before {
  content: "";
}
</style>
<style scoped>
.addressWid {
  width: 120px;
  margin-right: 5px;
}
.color-999 {
  color: #999;
}
</style>
