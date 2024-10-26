<template >
  <div class="api" slot="content">
    <Form class="setAllMarkRead" style="margin-top:10px">
      <Row>
        <Col :span="14">
        <!--实际发货物流方式-->
        <Form-item label="实际发货物流方式：" :label-width="120">
          <Cascader :data="shippingMethodData" @on-visible-change="showShippingDataApiMatch" :transfer="true" :load-data="loadDataApiMatch" @on-change="getAccountApiMatch" v-model="value2"></Cascader>
        </Form-item>
        </Col>
        <!--账号-->
        <Col :span="9" :offset="1" v-if="isOnlineShip === 0">
        <Form-item label="帐号：" :label-width="60">
          <Spin v-if="carrierAccountSpin" fix></Spin>
          <dyt-select v-model="shippingAccountModel" :transfer="true">
            <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index" :value="item.carrierAccountId">{{ item.account }}</Option>
          </dyt-select>
        </Form-item>
        </Col>
      </Row>
    </Form>
    <!--物流相关设置-->
    <div class="matchLogisticSetting">
      <h6>物流相关设置</h6>
    </div>
    <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
      <Row>
        <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index">
        <Form-item v-if="item.paramType === 'hide'" v-show="false" :label="item.paramName" :label-width="100">
          <span>{{ item.paramValue }}</span>
        </Form-item>
        <Form-item v-else :label="item.paramName" :label-width="100">
          <Radio-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'radio'">
            <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
              <span>{{ sItem.itemName }}</span>
            </Radio>
          </Radio-group>
          <Input v-if="item.paramType == 'input'" v-model="shippingMethodModel[index].paramValue"></Input>
          <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType == 'checkbox'">
            <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
              <span>{{ sItem.itemName }}</span>
            </Checkbox>
          </Checkbox-group>
          <dyt-select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
            <Option v-for="(sItem,n) in item.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName }}</Option>
          </dyt-select>
          <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
        </Form-item>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script >
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  name: 'logisticsMode',
  mixins: [Mixin, orderSys],
  props: {
    // 仓库id
    selectStoreId: {
      type: String,
      default: ''
    }, // 获取所有仓库的数据
    allStorelist: {
      type: Array,
      default: () => []
    }, // 重置选项值
    setMatchStatusModel: Boolean
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
  watch: {
    // 发货物流方式
    value2: {
      handler (data) {
        this.$emit('ONShippingMethod', {
          type: 1,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // 物流相关设置
    shippingMethodModel: {
      handler (data) {
        this.$emit('ONShippingMethod', {
          type: 2,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // 账号
    shippingAccountModel: {
      handler (data) {
        this.$emit('ONShippingMethod', {
          type: 3,
          data: data
        });
      },
      deep: true,
      immediate: true
    }, // isOnlineShip 监听当前的是否是线上发货
    isOnlineShip: {
      handler (data) {
        this.$emit('ONShippingMethod', {
          type: 4,
          data: data
        });
      },
      deep: true,
      immediate: true
    },

    // 重置选项值
    setMatchStatusModel: {
      handler (data) {
        this.value2 = [];
        this.shippingAccountModel = [];
        this.carrierAccount = [];
        this.carrierBaseSetting = [];
        this.isOnlineShip = 0;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
