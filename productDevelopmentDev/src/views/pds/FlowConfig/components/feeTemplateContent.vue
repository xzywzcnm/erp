<template>
  <Form :model="formItem" ref="feeTemplate" :rules="rules1" :label-width="130">
    <FormItem label="模板名称" prop="templateName">
      <Input
        class="ipt"
        v-model="formItem.templateName"
        :maxlength="64"
        :disabled="isDisabled"
      ></Input>
    </FormItem>
    <FormItem label="适用平台" prop="platformId">
      <dyt-select
        class="ipt"
        :disabled="isDisabled"
        multiple
        v-model="formItem.platformId"
      >
        <Option
          v-for="(item, index) in platformList"
          :key="index"
          :value="item.platformId"
          >{{ item.platformName }}</Option
        >
      </dyt-select>
    </FormItem>
    <FormItem label="平台佣金">
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.platformFeeRate"
        :disabled="isDisabled"
      ></local-input-number
      >%
    </FormItem>
    <FormItem v-show="isShowPaypal">
      <div slot="label">
        Paypal手续费
        <Tooltip content="仅用于ebay">
          <img
            class="tool-img"
            src="../../../../assets/images/help.png"
            width="16"
          />
        </Tooltip>
      </div>
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.paypalFeeRate"
        :disabled="isDisabled"
      ></local-input-number
      >%+附加费用<local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.paypalAddedFee"
        :disabled="isDisabled"
      ></local-input-number>
    </FormItem>
    <FormItem v-show="isShowLeagueFee">
      <div slot="label">
        速卖通联盟费用
        <Tooltip content="仅用于仅用于速卖通">
          <img
            class="tool-img"
            src="../../../../assets/images/help.png"
            width="16"
          />
        </Tooltip>
      </div>
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.expressLeagueFee"
        :disabled="isDisabled"
      ></local-input-number>
    </FormItem>
    <FormItem label="是否为海外仓发货" v-if="$store.state.ierpStatus !== '1'">
      <RadioGroup v-model="formItem.overseaDeliveryFlag">
        <Radio
          v-for="(item, index) in isOverseaDelivery"
          :disabled="isDisabled"
          :key="index"
          :label="item.value"
        >
          <span>{{ item.label }}</span>
        </Radio>
      </RadioGroup>
      <span class="ml20" v-show="formItem.overseaDeliveryFlag === 1">
        头程运输方式<dyt-select
          class="ipt ml15"
          v-model="formItem.firstCarriageModeId"
          :disabled="isDisabled"
        >
          <Option
            v-for="item in headerTransport"
            :value="item.firstCarriageModeId"
            :key="item.firstCarriageModeId"
            >{{ item.carriageModeName }}</Option
          >
        </dyt-select>
      </span>
      <!--<i-switch :disabled="isDisabled"  v-model="formItem.input11"></i-switch>-->
    </FormItem>
    <FormItem label="仓库" v-if="$store.state.ierpStatus === '1'">
      <dyt-select
        v-model="formItem.shipmentsWarehouseId"
        :disabled="isDisabled"
        class="ipt"
        @on-change="warehouseChange"
      >
        <Option
            v-for="item in warehouseAndEnableShipMethod.localWarehouseInfoList"
            :key="item.warehouseId"
            :value="item.warehouseId"
        >{{ item.warehouseName }}
        </Option>
      </dyt-select>
    </FormItem>
    <div>
      <FormItem v-if="$store.state.ierpStatus === '1'">
        <label slot="label" class="redDot">物流方式</label>
        <Cascader
          :data="shippingMethodData"
          :disabled="isDisabled"
          @on-visible-change="showShippingDataApiMatch"
          :transfer="true"
          :load-data="loadDataApiMatch"
          @on-change="getAccountApiMatch"
          v-model="value2">
        </Cascader>
      </FormItem>
      <FormItem label="本地运输方式" v-else>
        <dyt-select
          v-model="formItem.shipmentsWarehouseId"
          :disabled="isDisabled"
          class="ipt"
          @on-change="warehouseChange"
        >
          <Option
            v-for="item in $store.state.warehouseAndEnableShipMethod
              .localWarehouseInfoList"
            :key="item.warehouseId"
            :value="item.warehouseId"
            >{{ item.warehouseName }}</Option
          >
        </dyt-select>
        <dyt-select
          v-model="formItem.carriageLogistics"
          :disabled="isDisabled"
          :label-in-value="true"
          class="ipt"
          ref="transport"
        >
          <Option
            v-for="(item, index) in transportList"
            :key="index"
            :value="item.shippingMethodId"
            >{{ item.shippingName | shipingName }}</Option
          >
        </dyt-select>
      </FormItem>
    </div>
    <FormItem label="售后费用">
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.afterFee"
        :disabled="isDisabled"
      ></local-input-number
      >%
    </FormItem>
    <FormItem label="汇率折损率">
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.exchangeWreckRate"
        :disabled="isDisabled"
      ></local-input-number
      >%
    </FormItem>
    <FormItem label="其他成本(CNY)">
      <local-input-number
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.otherCost"
        :disabled="isDisabled"
      ></local-input-number
      >+<local-input-number
        :disabled="isDisabled"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.otherCostRate"
        class="ipt1"
      ></local-input-number
      >%
    </FormItem>
    <FormItem>
      <dyt-select class="form-label" slot="label" v-model="model1">
        <Option
          v-for="(item, index) in list1"
          :value="item.value"
          :key="index"
          >{{ item.label }}</Option
        >
      </dyt-select>
      <local-input-number
        v-show="model1 === '0'"
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.sellingProfitRate"
        :disabled="isDisabled"
      ></local-input-number>
      <local-input-number
        v-show="model1 === '1'"
        class="ipt"
        :max="1000000000"
        :min="0"
        v-model.number.trim="formItem.costProfitRate"
        :disabled="isDisabled"
      ></local-input-number
      >%
    </FormItem>
  </Form>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";

export default {
  name: "feeTemplateContent",
  mixins: [CommonMixin],
  props: {
    editStatus: {
      default: "add"
    }
  },
  filters: {
    shipingName (val) {
      return val.split(">>")[1];
    }
  },
  created () {
    this.getWarehouse();
    this.getHeaderTransport();
    this.getSaleChannel();
    this.getCurrencyDropdownListMt();
  },
  components: {},
  data () {
    return {
      warehouseId: null,
      shippingMethodData: [],
      value2: [],
      isOverseaDelivery: [
        {
          value: 0,
          label: "否"
        },
        {
          value: 1,
          label: "是"
        }
      ],
      warehouseAndEnableShipMethod: {},
      transportList: [], // 物流方式
      platformList: [], // 平台
      headerTransport: [], // 头程物流方式
      model1: "0",
      rules1: {
        templateName: {
          message: "模板名称不能为空",
          trigger: "blur",
          required: true
        },
        platformId: {
          validator: this.validatePlatformId,
          required: true
        }
      },
      list1: [
        {
          value: "0",
          label: "销售利润率"
        },
        {
          value: "1",
          label: "成本利润率"
        }
      ],
      formItem: {
        templateName: "", // 模板名称 ,
        platformId: "", // 适用平台ID
        platformFeeRate: "", // 平台佣金
        paypalFeeRate: "", // Paypal手续费比率
        paypalAddedFee: "", // Paypal附加费用
        paypalFeeCurrency: "", // Paypal费用币种
        overseaDeliveryFlag: 0, // 海外仓发货标识(0否,1是)
        expressLeagueFee: "", // 速卖通联盟费用
        afterFee: "", // 售后费用
        exchangeWreckRate: "", // 汇率折损率
        otherCostRate: "", // 其他成本比率 ,
        otherCost: "", // 其他成本 ,
        otherCostCurrency: "", // 其他成本币种
        sellingProfitRate: "", // 销售利润率
        costProfitRate: "", // 成本利润率
        carrierId: "", // 物流商
        shipmentsWarehouseId: "", // 发货仓库
        firstCarriageModeId: "", // 头程运输方式ID
        carriageLogistics: "" // 运输物流
        // "chargeTemplateId": "", // 费用模板ID
        // "createdBy": "string", //创建人
        // "createdTime": "2019-04-09T02:41:28.173Z", //创建时间 ,
        // "merchantId": "string", //商户编号 ,
      }
    };
  },
  methods: {
    showShippingDataApiMatch (val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      if (val) {
        return new Promise(resolve => {
          if (v.formItem.shipmentsWarehouseId) {
            let warehouseType = v.warehouseAndEnableShipMethod.localWarehouseInfoList.filter((i) => {
              if (i.warehouseId === v.formItem.shipmentsWarehouseId) {
                return i;
              }
            })[0];
            if (!this.$common.isEmpty(warehouseType)) {
              warehouseType = warehouseType.warehouseType;
            }
            v.axios
              .get(
                api.get_enableCarriersApi +
                "?warehouseId=" +
                v.formItem.shipmentsWarehouseId +
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
                      isOnline: data[i].isOnline
                    });
                    if (i === data.length - 1) {
                      v.shippingMethodData = pos;
                    }
                  }
                  resolve();
                }
              });
          } else {
            v.$Message.info("请先选择仓库");
          }
        });
      }
    },
    loadDataApiMatch (item, callback) {
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
          v.formItem.shipmentsWarehouseId
        )
        .then((response) => {
          if (response.code === 0) {
            let data = response.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: data[i].shippingMethodId,
                label: data[i].carrierShippingMethodName
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
    getAccountApiMatch (value, selectedData) {
      let v = this;
      v.formItem.carriageLogistics = value[1];
      v.formItem.carrierId = value[0];
      v.transportList.push({
        shippingMethodId: value[1],
        shippingName: selectedData[0].label + ">>>" + selectedData[1].label
      });
      v.transportList = v.repeatArrayObject(
        v.transportList,
        "shippingMethodId"
      );
    },
    getWarehouse () {
      // 本地运输方式
      let v = this;
      return new Promise((resolve) => {
        if (v.$store.state.ierpStatus !== "1") {
          v.$axios
            .post(api.getWarehouseAndEnableShipMethod)
            .then((res) => {
              if (res.code === 0) {
                v.warehouseAndEnableShipMethod = res.datas;
                v.$store.commit("warehouseAndEnableShipMethod", res.datas);
                resolve();
              }
            })
            .catch(() => {});
        } else {
          v.getWarehouseNew().then((data) => {
            v.$set(
              v.warehouseAndEnableShipMethod,
              "localWarehouseInfoList",
              data
            );
            resolve();
          });
        }
      });
    },
    resetFields () {
      for (let key in this.formItem) {
        this.formItem[key] = "";
      }
      this.formItem.overseaDeliveryFlag = 0;
      this.value2 = [];
      this.$refs.feeTemplate.resetFields();
    },
    setFrom (data, type) {
      this.resetFields();
      data.platformId =
        data.platformId && data.platformId.length > 0
          ? data.platformId.split("|")
          : [];
      type === "copy" ? (data.templateName = "") : ""; // 如果是copy 清空模板名称
      this.formItem = data;
      if (this.$store.state.ierpStatus === '1') {
        this.showShippingDataApiMatch(true).then(() => {
          setTimeout(() => {
            this.value2 = [data.carrierId, data.carriageLogistics];
          }, 0);
        });
      } else {
        this.warehouseChange(data.shipmentsWarehouseId);
      }
    },
    delTempate (id) {
      let v = this;
      v.$axios
        .get(api.chargeTemplateRemove + "?chargeTemplateId=" + id)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("删除成功");
            v.$emit("emitCloseModal");
          }
        });
    },
    getHeaderTransport () {
      let v = this;
      v.$axios
        .post(api.carriageModeList, {
          pageNum: 1,
          pageSize: 10000
        })
        .then((res) => {
          if (res.code === 0) {
            v.headerTransport = res.datas.list;
          }
        });
    },
    validatePlatformId (rule, value, callback) {
      if (value.length === 0) {
        callback(new Error("适用平台不能为空"));
      } else {
        callback();
      }
    },
    getSaleChannel () {
      // 获取平台
      let v = this;
      v.$axios
        .post(api.queryPlatformInfo, {})
        .then((res) => {
          if (res.code === 0) {
            v.platformList = res.datas;
          }
        })
        .catch(() => {});
    },
    warehouseChange (item) {
      let v = this;
      let arr = [];
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
            shippingName: "1>>选择全部"
          }
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
      /* let shippingIds=item.shippingId.split('|');
       v.transportList=[]
       v.$store.state.warehouseAndEnableShipMethod.enableShipMethodInfoList.forEach(item=>{
       shippingIds.forEach(id=>{
       if(item.shippingMethodId === id){
       v.transportList.push(item);
       }
       })
       }); */
    },
    transportChange () {},
    operating () {
      let v = this;
      let postApi = "";
      if (v.editStatus === "add") {
        postApi = api.chargeTemplateCreate;
      } else {
        postApi = api.chargeTemplateModify;
      }
      v.$refs.feeTemplate.validate((valid) => {
        if (valid) {
          let params = v.deepCopy(v.setNull(v.formItem));
          /* 特殊处理字段 */
          params.platformId = params.platformId.join("|");
          /* - */
          v.$axios
            .post(postApi, params)
            .then((res) => {
              if (res.code === 0) {
                let message = v.editStatus === "add" ? "新增成功" : "编辑成功";
                v.$msg.success(message);
                v.$emit("emitCloseModal");
              }
            })
            .catch(() => {});
        }
      });
    }
  },
  computed: {
    isDisabled () {
      return this.editStatus === "look";
    },
    isShowPaypal () {
      // 只有选择ebay 才展示
      if (this.formItem.platformId && this.formItem.platformId.length) {
        return this.formItem.platformId.some((item) => {
          return item === "ebay";
        });
      }
      return false
    },
    isShowLeagueFee () {
      // 只有选择速卖通 才展示
      if (this.formItem.platformId && this.formItem.platformId.length) {
        return this.formItem.platformId.some((item) => {
          return item === "aliexpress";
        });
      }
      return false
    }
  }
};
</script>

<style scoped>
.ipt {
  width: 300px;
}

.form-label {
  width: 100px;
  margin-top: -10px;
}

.ipt1 {
  width: 60px;
}

.ipt3 {
  width: 120px;
}

.tool-img {
  vertical-align: text-bottom;
}
</style>
