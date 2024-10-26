<template>
  <Modal
    v-model="calcFreightModal"
    class="co clearMarginAuto rest freight"
    width="800"
    @on-visible-change="calcFreightVisibleChange"
  >
    <p slot="header" @mousedown="moveMt" class="moveHead">
      <span>运费计算器</span>
    </p>
    <Form
      ref="freightForm"
      :model="calcFreightFormDate"
      :label-width="120"
      :rules="calcFreightValidate"
    >
      <Row v-if="$store.state.ierpStatus !== '1'">
        <Col span="11">
          <FormItem>
            <label slot="label">是否海外仓发货</label>
            <i-switch
              :disabled="isDisable"
              v-model="isOverseaDeliveryFlag"
              @on-change="changeFlag"
            ></i-switch>
          </FormItem>
        </Col>
        <Col span="11" v-show="isOverseaDeliveryFlag">
          <FormItem>
            <label slot="label">头程运输方式</label>
            <dyt-select
              v-model="calcFreightFormDate.firstCarriageModeId"
              :disabled="isDisable"
            >
              <Option
                v-for="(item, index) in carriageList"
                :key="index"
                :value="item.firstCarriageModeId"
                >{{ item.carriageModeName }}</Option
              >
            </dyt-select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="11">
          <FormItem prop="warehouse">
            <label slot="label" class="redDot">发货仓库</label>
            <dyt-select
              v-model="calcFreightFormDate.warehouse"
              class="ipt-wid"
              @on-change="warehouseChange"
              :disabled="isDisable"
            >
              <Option
                v-for="item in warehouseList"
                :key="item.warehouseId"
                :value="item.warehouseId"
                >{{ item.warehouseName }}
              </Option>
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="11">
          <FormItem prop="country">
            <label slot="label" class="redDot">到达国家</label>
            <dyt-select
              v-model="calcFreightFormDate.country"
              filterable
              class="ipt-wid"
              :disabled="isDisable"
            >
              <Option
                v-for="(item, index) in countryList"
                :key="index"
                :value="item.twoCode"
                :label="item.cnName"
              ></Option>
            </dyt-select>
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span="11">
          <FormItem v-if="$store.state.ierpStatus === '1'">
            <label slot="label" class="redDot">物流方式</label>
            <Cascader
              :data="shippingMethodData"
              @on-visible-change="showShippingDataApiMatch"
              transfer
              :transfer-class-name="'calc-freight'"
              :load-data="loadDataApiMatch"
              @on-change="getAccountApiMatch"
              v-model="value2"
            ></Cascader>
          </FormItem>
          <FormItem prop="transport" v-else>
            <label slot="label" class="redDot">运输方式</label>
            <dyt-select
              v-model="calcFreightFormDate.transport"
              :label-in-value="true"
              :disabled="isDisable"
              class="ipt-wid"
              multiple
              ref="transport"
              @on-change="transportChange()"
            >
              <Option
                v-for="(item, index) in transportList"
                :key="index"
                :value="item.shippingMethodId"
              >
                {{ item.shippingName | shipingName }}
              </Option>
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="11">
          <FormItem prop="totalWeight">
            <label slot="label" class="redDot">重量(g)</label>
            <Input
              v-model.trim="calcFreightFormDate.totalWeight"
              :disabled="isDisable"
              class="ipt-wid"
            />
          </FormItem>
        </Col>
      </Row>
      <div
        style="padding: 10px"
        v-if="
          $store.state.ierpStatus === '1' &&
          transportList &&
          transportList.length > 0
        "
      >
        <Tag
          closable
          v-for="item in transportList"
          :key="item.shippingMethodId"
          :color="freightDate && freightDate.carriageLogistics === item.shippingMethodId ? 'blue': 'default'"
          @on-close="closeShip(item.shippingMethodId)"
          >{{ item.shippingName }}</Tag
        >
      </div>
    </Form>
    <div v-show="!isDisable">
      <Button type="primary" @click="tryCalc" :loading="loading">试算</Button>
      <Table
        style="margin-top: 10px"
        :loading="loading"
        :columns="freightTable"
        :data="freightData"
        highlight-row
        height="300"
      ></Table>
    </div>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
// import logisticsMode from "@/components/common/logisticsMode";
import api from "@/api/api";

export default {
  name: "freightCalc",
  mixins: [CommonMixin],
  props: ["freightDate", "myCalc", "pageType"],
  // components: { logisticsMode },
  filters: {
    shipingName(val) {
      return val.split(">>")[1];
    },
  },
  computed: {
    isDisable() {
      if (this.myCalc === true) {
        return false;
      }
      return this.$store.state.curNodeId !== 0;
    },
  },
  created() {},
  data() {
    let v = this;
    return {
      warehouseList: [], // 仓库列表
      shippingMethodData: [],
      shippingValue: [],
      value2: [],
      shipingMethodList: [],
      loading2: false,
      carriageList: [], // 头程运输
      isOverseaDeliveryFlag: false,
      warehouseAndEnableShipMethod: {},
      calcFreightModal: false,
      loading: false,
      transportList: [],
      countryList: [],
      freightData: [],
      freightTable: [
        {
          title: "物流商",
          width: 220,
          key: "shippingName",
        },
        {
          title: "运输方式",
          width: 200,
          key: "shippingMethodName",
        },
        {
          title: "总运费(CNY)",
          width: 120,
          sortable: true,
          key: "shippingFeeCost",
          sortMethod: function (a, b, type) {
            if (type === "desc") {
              if (a == "无") {
                return 1;
              } else if (parseInt(a * 100) >= parseInt(b * 100)) {
                return -1;
              } else {
                return 1;
              }
            } else {
              if (a == "无") {
                return 1;
              } else if (parseInt(a * 100) >= parseInt(b * 100)) {
                return 1;
              } else {
                return -1;
              }
            }
          },
        },
        {
          title: "头程运输费用(CNY)",
          width: 120,
          sortable: true,
          key: "firstFreight",
          sortMethod: function (a, b, type) {
            if (type === "desc") {
              if (a == "无") {
                return 1;
              } else if (parseInt(a * 100) >= parseInt(b * 100)) {
                return -1;
              } else {
                return 1;
              }
            } else {
              if (a == "无") {
                return 1;
              } else if (parseInt(a * 100) >= parseInt(b * 100)) {
                return 1;
              } else {
                return -1;
              }
            }
          },
        },
        {
          title: "操作",
          width: 120,
          fixed: "right",
          render(h, params) {
            return h(
              "div",
              {
                style: {
                  color: "#169bd5",
                  cursor: "pointer",
                },
                on: {
                  click: function () {
                    if (v.pageType === "calc") {
                      /**
                       * 新品计算器
                       * 算的是总运费
                       * */
                      let firstFreight = params.row.firstFreight
                        ? params.row.firstFreight
                        : 0;
                      v.$parent.calcFormDate.freightPrice = (
                        Number(params.row.shippingFeeCost) + firstFreight
                      ).toFixed(2);
                    } else {
                      v.$parent.calcFormDate.freightPrice =
                        params.row.shippingFeeCost;
                    }
                    if (params.row.firstFreight) {
                      v.$parent.calcFormDate.freightHeadPrice =
                        params.row.firstFreight;
                    } else {
                      v.$parent.calcFormDate.freightHeadPrice = 0;
                    }
                    v.emitMt(params.row.shippingMethodId);
                    v.calcFreightModal = false;
                  },
                },
              },
              "采用"
            );
          },
        },
      ],
      freightArr: [],
      calcFreightValidate: {
        warehouse: {
          required: true,
          message: "请选择发货仓库",
          trigger: "change",
        },
        transport: {
          validator: v.validateTransport,
          trigger: "change",
        },
        country: {
          required: true,
          message: "请选择到达国家",
          trigger: "change",
        },
        totalWeight: {
          validator: v.validateWeight,
          trigger: "change",
        },
      },
      calcFreightFormDate: {
        warehouse: "", // 仓库
        transport: "", // 运输方式
        country: "", // 到达国家
        totalWeight: "", // 重量
        firstCarriageModeId: "", // 头程运输id
        overseaDeliveryFlag: 0,
      },
    };
  },
  methods: {
    closeShip(value) {
      this.transportList.forEach((i, index) => {
        if (i.shippingMethodId === value) {
          this.transportList.splice(index, 1);
        }
      });
    },
    showShippingDataApiMatch(val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      if (val) {
        return new Promise(resolve => {
          if (v.calcFreightFormDate.warehouse) {
            let warehouseType = v.warehouseList.filter((i) => {
              if (i.warehouseId === v.calcFreightFormDate.warehouse) {
                return i;
              }
            })[0].warehouseType;
            v.axios
              .get(
                api.get_enableCarriersApi +
                "?warehouseId=" +
                v.calcFreightFormDate.warehouse +
                "&isFilter=true" +
                "&warehouseType=" +
                warehouseType
              )
              .then((response) => {
                if (response.code === 0) {
                  let data = response.datas;
                  let pos = [];
                  for (let i = 0; i < data.length; i++) {
                    pos.push({
                      value: data[i].carrierId,
                      label: data[i].carrierName,
                      children: [],
                      loading: false,
                      carrierAccounts: data[i].carrierAccounts,
                      apiInterface: data[i].apiInterface,
                      isOnline: data[i].isOnline,
                    });
                    if (i === data.length - 1) {
                      v.shippingMethodData = pos;
                    }
                  }
                  resolve();
                }
              });
          }
        });

      }
    },
    loadDataApiMatch(item, callback) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      item.loading = true;
      let v = this;
      v.axios
        .get(
          api.get_enableShippingMethodsApi +
            "?carrierId=" +
            item.value +
            "&warehouseId=" +
            v.calcFreightFormDate.warehouse
        )
        .then((response) => {
          if (response.code === 0) {
            let data = response.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: data[i].shippingMethodId,
                label: data[i].carrierShippingMethodName,
              });
              if (i === data.length - 1) {
                item.children = pos;
                item.loading = false;
                callback();
              }
            }
            if (data.length === 0) {
              item.children = pos;
              item.loading = false;
              v.$Message.warning("没有相关记录");
              callback();
            }
            v.shipingMethodList = pos;
          } else {
            item.loading = false;
            item.children = [];
          }
        })
        .catch(() => {
          item.loading = false;
          item.children = [];
          // v.$Message.error('系统繁忙，请重新尝试');
        });
    },
    getAccountApiMatch(value, selectedData) {
      let v = this;
      console.log(value);
      console.log(selectedData);
      if (v.freightDate) {
        v.freightDate.carriageLogistics = value[1];
      }
      v.transportList.push({
        shippingMethodId: value[1],
        shippingName: selectedData[0].label + ">>>" + selectedData[1].label,
      });
      v.transportList = v.repeatArrayObject(
        v.transportList,
        "shippingMethodId"
      );
    },
    shippingMethod(data) {
      console.log(data);
    },
    getCarriage() {
      let v = this;
      v.$axios
        .post(api.carriageModeList, {
          pageNum: 1,
          pageSize: 10000,
        })
        .then((res) => {
          if (res.code === 0) {
            v.carriageList = res.datas.list;
          }
        })
        .catch(() => {});
    },
    changeFlag(value) {
      value
        ? (this.calcFreightFormDate.overseaDeliveryFlag = 1)
        : (this.calcFreightFormDate.overseaDeliveryFlag = 0);
    },
    // descSore() {
    //   let v = this;
    // },
    validateTransport(rule, value, callback) {
      let v = this;
      if (v.calcFreightFormDate.transport === "") {
        callback(new Error("请选择运输方式"));
      } else {
        callback();
      }
    },
    validateWeight(rule, value, callback) {
      let v = this;
      if (v.calcFreightFormDate.totalWeight === "") {
        callback(new Error("请输入重量"));
      } else {
        callback();
      }
    },
    transportChange() {
      let v = this;
      /* <div class="ivu-tag ivu-tag-checked"><span class="ivu-tag-text">20131210无对接物流商</span></div> */
      let all = "";
      all = v.$refs.transport.values.find((item) => item.value === "all");
      if (all !== "" && all !== undefined) {
        v.$refs.transport.$el.childNodes[0].innerHTML = `<div class="ivu-tag ivu-tag-checked"><span class="ivu-tag-text">已选择全部运输方式</span></div>`;
        return;
      }
      if (v.$refs.transport.values.length > 1) {
        v.$refs.transport.$el.childNodes[0].innerHTML = `<div class="ivu-tag ivu-tag-checked"><span class="ivu-tag-text">已选择：${v.$refs.transport.values[0].label}...等${v.$refs.transport.values.length}个运输方式</span></div>`;
      } else if (v.$refs.transport.values.length == 1) {
        v.$refs.transport.$el.childNodes[0].innerHTML = `<div class="ivu-tag ivu-tag-checked"><span class="ivu-tag-text">已选择：${v.$refs.transport.values[0].label}运输方式</span></div>`;
      } else {
        v.$refs.transport.$el.childNodes[0].innerHTML =
          '<input type="hidden"> <div> <span class="ivu-select-placeholder">' +
          "请选择" +
          '</span> <!----> <!----> <i class="ivu-icon ivu-icon-arrow-down-b ivu-select-arrow"></i></div>';
      }
    },
    emitMt(id) {
      this.$emit("setFreight", {
        shipmentsWarehouseId: this.calcFreightFormDate.warehouse,
        carriageLogistics: id,
        targetCountryId: this.calcFreightFormDate.country,
        netWeight: this.calcFreightFormDate.totalWeight,
        firstCarriageModeId: this.calcFreightFormDate.firstCarriageModeId,
        overseaDeliveryFlag: this.calcFreightFormDate.overseaDeliveryFlag,
      });
    },
    tryCalc(novaild, value) {
      let v = this;
      let all = "";
      let arr = [];
      // let list = [];
      return new Promise((resolve) => {
        v.$refs.freightForm.validate((vaild) => {
          if (vaild || novaild === "novaild") {
            if (v.$store.state.ierpStatus === "1") {
              // erp 3.0
              if (v.transportList.length === 0 && !value) {
                v.$Message.info("未选择物流方式");
                return;
              }
              v.transportList.forEach((item) => {
                arr.push({
                  countryCode: v.calcFreightFormDate.country,
                  shippingMethodId: item.shippingMethodId,
                  totalWeight: v.calcFreightFormDate.totalWeight + "",
                  warehouseId: v.calcFreightFormDate.warehouse,
                  shippingName: item.shippingName,
                  firstCarriageModeId:
                    v.calcFreightFormDate.overseaDeliveryFlag === 1
                      ? v.calcFreightFormDate.firstCarriageModeId
                      : null,
                });
              });
            } else {
              all = v.$refs.transport.values.find(
                (item) => item.value === "all"
              );
              if (all !== "" && all !== undefined) {
                v.transportList.forEach((item) => {
                  if (item.shippingMethodId !== "all") {
                    arr.push({
                      countryCode: v.calcFreightFormDate.country,
                      shippingMethodId: item.shippingMethodId,
                      totalWeight: v.calcFreightFormDate.totalWeight + "",
                      warehouseId: v.calcFreightFormDate.warehouse,
                      shippingName: item.shippingName,
                      firstCarriageModeId:
                        v.calcFreightFormDate.overseaDeliveryFlag === 1
                          ? v.calcFreightFormDate.firstCarriageModeId
                          : null,
                    });
                  }
                });
              } else {
                if (v.typeOf(v.calcFreightFormDate.transport) === "string") {
                  v.calcFreightFormDate.transport = [
                    v.calcFreightFormDate.transport,
                  ];
                }
                v.calcFreightFormDate.transport.forEach((item) => {
                  let shipName = "";
                  v.$store.state.warehouseAndEnableShipMethod.enableShipMethodInfoList.forEach(
                    (ci) => {
                      if (ci.shippingMethodId === item) {
                        shipName = ci.shippingName;
                      }
                    }
                  );
                  arr.push({
                    countryCode: v.calcFreightFormDate.country,
                    shippingMethodId: item,
                    totalWeight: v.calcFreightFormDate.totalWeight + "",
                    warehouseId: v.calcFreightFormDate.warehouse,
                    shippingName: shipName,
                    firstCarriageModeId:
                      v.calcFreightFormDate.overseaDeliveryFlag === 1
                        ? v.calcFreightFormDate.firstCarriageModeId
                        : null,
                  });
                });
              }
            }
            v.freightArr = arr;
            v.loading = true;
            v.$axios
              .post(api.getShipFeeByApiHandler, arr)
              .then((res) => {
                v.loading = false;
                if (res.code === 0) {
                  res.datas.forEach((item) => {
                    item.shippingMethodName = item.shippingLastName;
                    item.shippingName = item.shippingFirstName;
                  });
                  res.datas.forEach((item) => {
                    if (
                      item.shippingFeeCurrency !== "CNY" ||
                      item.merchantExchangeRate === 0
                    ) {
                      v.$store.state.currencyExchangeInfo.forEach((cur) => {
                        if (
                          cur.targetCurrencyCode === item.shippingFeeCurrency
                        ) {
                          item.shippingFeeCost = (
                            Number(item.shippingFeeCost) *
                            cur.merchantExchangeRate
                          ).toFixed(2);
                        }
                      });
                    } else {
                      item.shippingFeeCost = Number(
                        item.shippingFeeCost
                      ).toFixed(2);
                    }
                  });
                  v.freightData = res.datas;
                  resolve(res.datas);
                } else {
                  v.$msg.error("请求失败");
                }
              })
              .catch(() => {
                v.loading = false;
              });
          }
        });
      });
    },
    warehouseChange(item,isSetCarrier) {
      let v = this;
      let arr = [];
      if (this.$store.state.ierpStatus === '1') {
        this.showShippingDataApiMatch(true).then(() => {
          if (isSetCarrier) {
            setTimeout(() => {
              if (this.freightDate) {
                this.value2 = [this.freightDate.carrierId, this.freightDate.carriageLogistics];
                this.transportList.push({
                  shippingMethodId: this.freightDate.carriageLogistics,
                  shippingName: '模板默认物流'
                });
              }
            }, 0);
          }
        });
      } else {
        this.getCarriage();
        v.$store.state.warehouseAndEnableShipMethod.localWarehouseInfoList.forEach(
          (warehouseId) => {
            if (warehouseId.warehouseId === item) {
              arr = warehouseId.enableShipMethodIds.split(",");
            }
          }
        );
        if (arr.length > 0) {
          v.transportList = [
            {
              shippingMethodId: "all",
              shippingName: "1>>选择全部",
            },
          ];
        } else {
          v.transportList = [];
        }
        v.$store.state.warehouseAndEnableShipMethod.enableShipMethodInfoList.forEach(
          (item) => {
            arr.forEach((id) => {
              if (item.shippingMethodId === id) {
                v.transportList.push(item);
              }
            });
          }
        );
      }
    },
    getCountry() {
      let v = this;
      v.$axios
        .get(api.queryCountry)
        .then((res) => {
          if (res.code === 0) {
            v.countryList = res.datas;
          }
        })
        .catch(() => {});
    },
    getWarehouse() {
      let v = this;
      return new Promise(resolve => {
        if (v.$store.state.ierpStatus !== "1") {
          v.warehouseList =
            v.$store.state.warehouseAndEnableShipMethod.localWarehouseInfoList;
          resolve();
        } else {
          v.$axios
            .post(api.get_wmsWarehouse, {
              warehouseStatus: "0",
            })
            .then((response) => {
              if (response.code === 0) {
                v.warehouseList = response.datas;
                resolve();
              }
            });
        }
      });

    },
    calcFreightVisibleChange(open, data) {
      return new Promise((resolve) => {
        if (open) {

          this.value2 = [];
          /*if (this.pageType !== 'calc') {
          this.$refs.freightForm.resetFields();
          }*/
          this.getWarehouse().then(()=>{

            if (data !== "noGet") {

              this.getCountry();
              // this.$refs.freightForm.validateField();
            }
            this.$nextTick(() => {
              if (this.freightDate && !this.calcFreightFormDate.warehouse) {
                this.transportList = [];
                let setCarrier = false;
                this.calcFreightFormDate.warehouse = this.freightDate.shipmentsWarehouseId;
                if (this.freightDate.carrierId && this.freightDate.carriageLogistics && this.$parent.costTempId) {
                  setCarrier = true;
                }
                this.warehouseChange(this.freightDate.shipmentsWarehouseId,setCarrier,setCarrier); // 触发仓库变化
                this.calcFreightFormDate.totalWeight = this.freightDate.netWeight;
                this.calcFreightFormDate.country = this.freightDate.targetCountryId;
                this.calcFreightFormDate.firstCarriageModeId = this.freightDate.firstCarriageModeId;
                this.calcFreightFormDate.overseaDeliveryFlag = this.freightDate.overseaDeliveryFlag;
                this.isOverseaDeliveryFlag = this.freightDate.overseaDeliveryFlag === 1;
              }
            });
          });
        }
        resolve();
      });
    },
  },
};
</script>

<style>
.calc-freight {
  z-index: 99999999;
}
</style>
<style scoped></style>
