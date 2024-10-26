<template>
  <div class="api" slot="content">
    <Form class="setAllMarkRead" style="margin-top: 10px">
      <Row>
        <Col :span="14">
          <!--实际发货物流方式-->
          <Form-item label="实际发货物流方式：'" :label-width="120">
            <Cascader
              :data="shippingMethodData"
              @on-visible-change="showShippingDataApiMatch"
              :transfer="true"
              :load-data="loadDataApiMatch"
              @on-change="getAccountApiMatch"
              v-model="value2"
            ></Cascader>
          </Form-item>
        </Col>
        <!--账号-->
        <Col :span="9" :offset="1" v-if="isOnlineShip === 0">
          <Form-item label="账号 ：" :label-width="60">
            <Spin v-if="carrierAccountSpin" fix></Spin>
            <dyt-select v-model="shippingAccountModel" :transfer="true">
              <template v-for="(item, index) in carrierAccount">
              <Option
                v-if="item.carrierAccountId !== null"
                :key="index"
                :value="item.carrierAccountId"
                >{{ item.account }}
              </Option>
              </template>
            </dyt-select>
          </Form-item>
        </Col>
      </Row>
    </Form>
    <!--物流相关设置-->
    <div class="matchLogisticSetting">
      <h6>物流相关设置</h6>
    </div>
    <Form
      class="setAllMarkRead white-space-nowrap-form"
      style="margin-top: 10px"
    >
      <Row>
        <Col
          :span="12"
          v-for="(item, index) in carrierBaseSetting"
          :key="index"
        >
          <Form-item
            v-if="item.paramType === 'hide'"
            v-show="false"
            :label="item.paramName"
            :label-width="100"
          >
            <span>{{ item.paramValue }}</span>
          </Form-item>
          <Form-item v-else :label="item.paramName" :label-width="100">
            <Radio-group
              v-model="shippingMethodModel[index].paramValue"
              v-if="item.paramType === 'radio'"
            >
              <Radio
                :label="sItem.itemValue"
                v-for="(sItem, n) in item.dictionarys"
                :key="n"
              >
                <span>{{ sItem.itemName }}</span>
              </Radio>
            </Radio-group>
            <Input
              v-if="item.paramType == 'input'"
              v-model="shippingMethodModel[index].paramValue"
            ></Input>
            <Checkbox-group
              v-model="shippingMethodModel[index].paramValue"
              v-if="item.paramType == 'checkbox'"
            >
              <Checkbox
                v-for="(sItem, n) in item.dictionarys"
                :key="n"
                :label="sItem.itemValue"
              >
                <span>{{ sItem.itemName }}</span>
              </Checkbox>
            </Checkbox-group>
            <dyt-select
              v-if="item.paramType === 'select'"
              v-model="shippingMethodModel[index].paramValue"
            >
              <Option
                v-for="(sItem, n) in item.dictionarys"
                :key="n"
                :value="sItem.itemValue"
              >
                {{ sItem.itemName }}
              </Option>
            </dyt-select>
            <span v-if="item.paramType === 'readOnly'">{{
              item.paramValue
            }}</span>
          </Form-item>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import Mixin from "@/components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "logisticsMode",
  mixins: [Mixin],
  props: {
    // 仓库id
    selectStoreId: {
      type: String,
      default: ""
    }, // 获取所有仓库的数据
    storeList: {
      type: Array,
      default: () => {
        return []
      }
    }, // 重置选项值
    resetTalg: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      shippingMethodData: [],
      value2: [],
      carrierAccount: [],
      isOnlineShip: 0,
      carrierAccountSpin: false,
      carrierBaseSetting: [],
      shippingMethodModel: [],
      shippingAccountModel: []
    };
  },
  methods: {
    showShippingDataApiMatch (val) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      if (val) {
        if (v.selectStoreId) {
          let warehouseType = v.storeList.filter((i) => {
            if (i.warehouseId === v.selectStoreId) {
              return i;
            }
          })[0].warehouseType;
          v.axios
            .get(
              api.get_enableCarriersApi +
                "?warehouseId=" +
                v.selectStoreId +
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
              }
            });
        }
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
            v.selectStoreId
        )
        .then((response) => {
          if (response.code === 0) {
            let data = response.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                value: [data[i].shippingMethodId, item.carrierAccounts],
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
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel = [];
      v.shippingAccountModel = null;
      v.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      v.isOnlineShip = selectedData[0].isOnline; // 1 为线上发货 0不是线上发货
      v.getCarrierBaseSettingApiMatch(value[1][0]);
      if (value[1][1] !== null) {
        v.carrierAccount = value[1][1];
      }
    },
    getCarrierBaseSettingApiMatch (shippingMethodId, model) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
      v.axios
        .get(
          api.get_shippingMethodParamsApi +
            "?shippingMethodId=" +
            shippingMethodId +
            "&time=" +
            new Date().getTime() +
            Math.random() * 100
        )
        .then((response) => {
          if (response.code === 0) {
            let data = response.datas;
            data.forEach((n) => {
              if (model) {
                v[model].push({
                  paramKey: n.paramKey,
                  paramValue: n.paramValue,
                  title: n.paramName
                });
              } else {
                v.shippingMethodModel.push({
                  paramKey: n.paramKey,
                  paramValue: n.paramValue,
                  title: n.paramName
                });
              }
            });
            v.carrierBaseSetting = data;
          }
        });
    }
  },
  watch: {
    // 发货物流方式
    value2: {
      handler (data) {
        this.$emit("ONShippingMethod", {
          type: 1,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // 物流相关设置
    shippingMethodModel: {
      handler (data) {
        this.$emit("ONShippingMethod", {
          type: 2,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // 账号
    shippingAccountModel: {
      handler (data) {
        this.$emit("ONShippingMethod", {
          type: 3,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // 重置选项值
    resetTalg: {
      handler (data) {
        if (data) {
          this.value2 = [];
          this.shippingAccountModel = [];
          this.carrierAccount = [];
          this.carrierBaseSetting = [];
        }
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
