<template>
  <div>
    <!--修改物流方式-->
    <Modal v-model="modal2" width="1000" title="修改物流方式" :mask-closable="false" @on-visible-change="visibleFn1">

      <Form class="setAllMarkRead" style="margin-top:10px">
        <Row>
          <Col :span="24" v-if="isEditWarehouse">
            <Form-item label="选择修改后仓库：" :label-width="160">
              <Select v-model="selectStore" filterable style="width: 404px;"><Option
                v-for="(item,index) in $store.state.warehouseList"
                :value="item.warehouseId"
                :key="index">{{ item.warehouseName }}</Option></Select>
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col :span="14">
            <Form-item label="选择修改后物流方式：" :label-width="160">
              <Cascader
                transfer
                :data="shippingMethodData"
                @on-visible-change="showShippingDataApiMatch"
                v-model="value2"
                :load-data="loadDataApiMatch"
                @on-change="getAccountApiMatch"></Cascader>
            </Form-item>
          </Col>
          <Col
            :span="9"
            :offset="1"
            v-if="apiInterfaceStatus !== 'API_AE_LG' && apiInterfaceStatus !== 'API_EDIS' && apiInterfaceStatus !== 'API_VOVA'">
            <Form-item label="账号：" :label-width="160">
              <Select v-model="shippingAccountModel"><Option
                v-for="(item,index) in carrierAccount"
                v-if="item.carrierAccountId !== null"
                :key="index"
                :value="item.carrierAccountId">{{ item.account }}</Option></Select>
            </Form-item>
          </Col>
        </Row>
      </Form>
      <div class="matchLogisticSetting">
        <h6>物流动态参数</h6>
      </div>
      <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
        <Row>
          <Col :span="12" v-for="(item,index) in carrierBaseSetting" :key="index">
            <Form-item v-if="item.paramType === 'hide'" v-show="false" :label="item.paramName" :label-width="160">
              <span>{{ item.paramValue }}</span>
            </Form-item>
            <Form-item v-else :label="item.paramName" :label-width="160">
              <Radio-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'radio'">
                <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                  <span>{{ sItem.itemName }}</span>
                </Radio>
              </Radio-group>
              <!-- <Input v-if="item.paramType == 'input'" v-for="(sItem,n) in item.dictionarys" :key="n" v-model="shippingMethodModel[index].value"></Input> -->
              <Input v-if="item.paramType == 'input'" v-model="shippingMethodModel[index].paramValue"></Input>
              <Checkbox-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType == 'checkbox'">
                <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                  <span>{{ sItem.itemName }}</span>
                </Checkbox>
              </Checkbox-group>
              <Select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue"><Option
                v-for="(sItem,n) in item.dictionarys"
                :key="n"
                :value="sItem.itemValue"> {{ sItem.itemName }} </Option></Select>
              <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
            </Form-item>
          </Col>
        </Row>
      </Form>
      <Table highlight-row
        border
        :loading="TableLoading"
        :columns="columns1"
        :data="data1"
        max-height="550"
        @on-selection-change="checkDataFn">
      </Table>
      <div slot="footer">
        <Button @click="modifyShipping" type="primary">确认修改</Button>
        <Button @click="modal2 = false">取消</Button>
      </div>
    </Modal>
    <!--失败数据-->
    <Modal v-model="modal1" width="1000" title="修改失败数据">
      <Table :columns="columns2" :data="data2"></Table>
      <div slot="footer">
        <Button type='primary' @click="modal1=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSysMixin from '@/components/mixin/orderSys_mixin';

export default {
  name: 'modifyMailingMethod',
  mixins: [Mixin, orderSysMixin],
  data () {
    return {
      value2: [],
      apiInterfaceStatus: null,
      carrierAccount: [],
      carrierBaseSetting: [],
      modal1: false,
      modal2: false,
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'No.',
          type: 'index',
          width: 70,
          align: 'center'
        }, {
          title: '出库单号',
          key: 'pickingNo',
          align: 'center'
        }, {
          title: '原物流商',
          align: 'center',
          key: 'logisticsDealerName'
        }, {
          title: '原物流方式',
          align: 'center',
          key: 'logisticsMailName'
        }, {
          title: '目的地',
          align: 'center',
          key: 'consigneeCountry'
        }
      ],
      columns2: [
        {
          title: '出库单号',
          key: 'packageCode',
          width: 140
        }, {
          title: '原因',
          key: 'error'
        }
      ],
      data1: [],
      data2: []
    };
  },
  created () {
  },
  props: {
    packageData: {
      default: [] // 数据
    },
    isEditWarehouse: {
      default: false // 控制能否修改仓库
    }
  },
  watch: {},
  methods: {
    resetShip () {
      // 清空物流数据
      this.shippingMethodData = [];
      this.carrierAccount = [];
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];
      this.value2 = [];
      this.shippingAccountModel = null;
    },
    modifyShipping () {
      let v = this;
      if (this.checkData.length < 1) {
        v.$Message.info('未选择数据');
        return;
      }
      if (this.value2.length < 1) {
        v.$Message.error('请选择物流渠道');
        return;
      }
      if (!v.shippingAccountModel && v.apiInterfaceStatus !== 'API_AE_LG' && v.apiInterfaceStatus !== 'API_EDIS' && v.apiInterfaceStatus !== 'API_VOVA' && v.apiInterfaceStatus !== 'api_joomLogistics') {
        v.$Message.error('账号不能为空');
        return false;
      }
      let apiUrl = api.batchReplaceShippingMethod;
      let params = {
        carrierAccountId: v.shippingAccountModel,
        merchantCarrierId: v.value2[0],
        merchantShippingMethodId: v.value2[1][0],
        packageCarrierParam: v.shippingMethodModel,
        packageIdList: v.checkData.map(i => i.pickingId)
      };
      if (v.isEditWarehouse) {
        // 能修改仓库
        apiUrl = api.batchReplaceWarehouseAndShippingMethodwms;
        params.warehouseId = v.selectStore;
      }
      v.TableLoading = true;
      v.axios.put(apiUrl, params).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          v.$emit('getList');
          v.modal2 = false;
          if (response.data.datas && response.data.datas.length > 0) {
            v.modal1 = true;
            v.data2 = response.data.datas;
          } else {
            v.$Message.success('操作成功');
          }
        }
      });
    },
    visibleFn1 (open) {
      this.TableLoading = true;
      if (open) {
        this.resetShip();
        this.checkData = [];
        this.data1 = this.packageData;
        this.TableLoading = false;
      }
    },
    checkDataFn (data) {
      this.checkData = data;
    }
  }
};
</script>

<style>
.setAllMarkRead .ivu-form-item {
  margin-bottom: 10px;
}
</style>
<style scoped></style>
