<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" title="供应商发货单" :width="1000">
      <div class="content">

        <Form ref="formValidates" :model="formValidate" :label-width="100" :rules="ruleValidate" class="table-box">
          <Row>
            <Col span="8">
            <FormItem label="发货单号:">
              <span>保存后创建</span>
            </FormItem>
            <FormItem label="物流运单号:">
              <Input v-model="formValidate.trackingNumber" placeholder="请输入" clearable></Input>
            </FormItem>
            <FormItem label="备货类型:">
              <dyt-select v-model="formValidate.readyType" clearable disabled>
                <Option v-for="(item, index) in purchaseList" :value="item.value" :key="index">{{ item.label }}</Option>
              </dyt-select>
            </FormItem>
            </Col>
            <Col span="8">
            <FormItem label="送货方式:">
              <dyt-select v-model="formValidate.despatchType" clearable>
                <Option v-for="item in sendWaylist" :value="item.value" :key="item.value">{{ item.label }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="包裹数量:" prop="packageNumber">
              <Input v-model="formValidate.packageNumber" placeholder="请输入" clearable number></Input>
            </FormItem>
            </Col>
            <Col span="8">
            <FormItem label="快递物流商:">
              <dyt-select v-model="formValidate.logisticsId" clearable>
                <Option v-for="item in logistProvilist" :value="item.logisticsId" :key="item.logisticsId">{{ item.logisticsName }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="包裹重量(kg):" prop="weight">
              <Input v-model="formValidate.weight" placeholder="请输入" clearable></Input>
            </FormItem>
            </Col>
          </Row>

          <Table highlight-row max-height="590" :columns="columns" :data="formValidate.tableList" :border="true" :loading="Tableloading" class="fmb0">
            <template slot-scope="{ row }" slot="pic">
              <large-picture :url="row.imgUrl"></large-picture>
            </template>
            <template slot-scope="{ row }" slot="basic">
              <div class="order-item">
                <div class="order-li">订单：
                  <a class="alink" href="javascript:;">{{row.purchaseNumber || '-'}}</a>
                </div>
                <div class="order-li">
                  SKU：{{row.skuNo || '-'}}
                </div>
                <div class="order-li">
                  供方货号：{{row.supplierNo || '-'}}
                </div>
                <div class="btn-list">
                  <span style="color:#ed4014;" v-if="row.iscrash==1">紧急</span>
                  <span style="color:#2db7f5;">{{row.orderType==1 ? '线上' : '线下'}}</span>
                  <!-- <span style="color:#A52A2A;" v-if="row.purchaseType == 1">急采</span>
                  <span style="color:#0000FF;" v-else>备货</span> -->
                  <span :style="row.readyType == 0 ? 'color:#A52A2A' : 'color:#0000FF'" v-if="row.readyType != null">{{purchaseList[row.readyType].label}}</span>
                  <span style="color:#19be6b;">{{statusText(row.status)}}</span>
                  <span style="color:#ff9900;" v-if="row.supplyStatus>0">{{supplyStatusList[row.supplyStatus]&&supplyStatusList[row.supplyStatus].label}}</span>
                  <span style="color:#CC00FF;" v-if="row.feedbackType===0||row.feedbackType===1">{{progressList[row.feedbackType]&&progressList[row.feedbackType].label}}</span>
                </div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="salesTime">
              <span>{{getDataToLocalTime(row.salesTime, 'fulltime', true)}}</span>
            </template>
            <template slot-scope="{row, index }" slot="despatchNumber">
              <div class="despatch-number-item">
                <FormItem :rules="ruleValidate.despatchNumber" :prop="`tableList.${index}.despatchNumber`" :show-message="false" :label-width="0">
                  <Input v-model="formValidate.tableList[index].despatchNumber" number />
                </FormItem>
                <div>
                  <Tooltip :transfer="true">
                    <span
                      class="erp sps-huaban"
                      :style="`
                        font-size: 12px;
                        line-height: 32px;
                        margin-left: 5px;
                        cursor: pointer;
                        display:${[1, '1', 2, '2'].includes(row.overshootState) ? 'inline-block' : 'none'};
                        color: ${[1, '1'].includes(row.overshootState) ? '#3cb034' : '#f30'}
                      `"
                    />
                    <span slot="content" style="white-space:initial;">
                      {{ [1, '1'].includes(row.overshootState) ? '允许超发，单色(SKC)不能超过20%，最多不超过20件' : '允许超发结束，不允许超发' }}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </template>
          </Table>
        </Form>

      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('formValidates')" :loading="loading">确定</Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
import api from '@/api/api';
import { math } from '@/utils/comfun';
import largePicture from '@/components/largePicture';
import regular from '@/utils/regular.js';
import {
  invoinceList, tablist, supplyStatusList, progressList,
  // purchaseTypeList,
  // stockTypelist,
  purchaseList
} from './configFile';
import Mixin from '@/components/mixin/common_mixin';
export default {
  mixins: [Mixin],
  components: { largePicture },
  data () {
    return {
      loading: false,
      Tableloading: false,
      columns: invoinceList,
      tableErrorList: {},
      formValidate: {
        trackingNumber: '',
        despatchType: '',
        packageNumber: '',
        logisticsId: '',
        weight: '',
        // purchaseType: '',
        readyType: '',
        tableList: [],
      },
      ruleValidate: {
        trackingNumber: [
          { max: 50, message: '最多只能输入50个字符', trigger: 'blur' },
        ],
        despatchType: [
          { type: 'number', required: true, message: '请选择送货方式', trigger: 'change' },
        ],
        packageNumber: [
          { pattern: regular.validateInteger, message: '请输入正整数', trigger: 'blur' },
        ],
        logisticsId: [
          { type: 'number', required: true, message: '请选择快递物流商', trigger: 'change' },
        ],
        weight: [
          { pattern: regular.validateWeight, message: '限数字，小数精度限4位，如0.0001', trigger: 'blur' },
        ],
        despatchNumber: [
          { type: 'number', required: true, validator: this.validatorDespatch, trigger: 'blur' },
          { type: 'number', required: true, validator: this.validatorDespatch, trigger: 'change' }
        ],
      },
      sendWaylist: [
        { label: "快递/物流送货", value: 0 },
        { label: "自送", value: 1 }
      ],
      // purchaseTypeList: [
      //   { label: "备货", value: 0},
      //   { label: "急采", value: 1},
      // ],
      logistProvilist: [],
      tablist,
      supplyStatusList,
      progressList,
      // stockTypelist,
      purchaseList,
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          list: []
        };
      }
    }
  },
  watch: {
    "dialogObj.modelVisible": {
      handler (newVal, oldVal) {
        if (newVal) {
          this.handleReset();
        } else {
          this.tableErrorList = {};
          this.$nextTick(() => {
            this.$refs.formValidates && this.$refs.formValidates.resetFields();
          })
        }
      },
      immediate: true
    }
  },
  created () { 
  },
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        const tableErrorList = Object.values(this.tableErrorList);
        if (tableErrorList.length > 0) {
          this.$Message.error(tableErrorList.join('<br>'));
          return;
        }
        if (valid) {
          // 发货数量默认等于待发数量，发货数量可以允许超发，超发幅度不能越过20%；
          let list = this.formValidate.tableList;
          // for (let i = 0; i < list.length; i++) {
          //   let num = math.add(list[i].notDespatchNumber || 0, math.mul(list[i].notDespatchNumber || 0, .2));
          //   if (list[i].despatchNumber > num) {
          //     this.$Message.error('发货数量允许超发，但超发幅度不能越过20%，请检查~');
          //     return;
          //   }
          // }
          let [sendSkuInfoQOList, data, temp] = [[], this.formValidate, {}];

          list.forEach(k => {
            let num = math.sub(k.despatchNumber || 0, k.notDespatchNumber || 0);
            sendSkuInfoQOList.push({
              ...k,
              id: k.orderInfoGoodsId,
              notDespatchNumber: num <= 0 ? 0 : num, // 不知道为什么要 despatchNumber 减 notDespatchNumber
              supplierOrderId: k.purchaseNumber,
              waitNumber: k.notDespatchNumber // 待发数量
            });
          });
          temp.despatchType = data.despatchType;
          temp.logisticsId = data.logisticsId;
          temp.packageNumber = data.packageNumber;
          temp.trackingNumber = data.trackingNumber;
          temp.weight = data.weight;
          temp.despatchSource = 0; //来源 0:自建，1:商家
          temp.sendSkuInfoQOList = sendSkuInfoQOList;
          this.handleForm(temp);
        }
      });
    },
    // 发货
    handleForm (temp) {
      this.loading = true;
      this.axios.post(api.sendGoods, temp).then(({ data }) => {
        if (data.code == 0) {
          this.$Message.info('操作成功');
          // eslint-disable-next-line vue/no-mutating-props
          this.dialogObj.modelVisible = false;
          this.$emit('fetch');
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    // 重置表单信息
    resetForm () {
      Object.keys(this.formValidate).forEach(k => {
        if (k === 'tableList') {
          this.formValidate[k] = [];
        } else {
          this.formValidate[k] = '';
        }
      });
      this.formValidate.readyType = this.dialogObj.list[0].readyType
    },
    // 重置
    handleReset () {
      this.getLogistlist();
      this.resetForm();
      let list = JSON.parse(JSON.stringify(this.dialogObj.list));
      list.forEach((k, i) => {
        this.$set(list[i], "despatchNumber", k.notDespatchNumber || 0);
      });
      this.formValidate.tableList = list;

    },
    // 验证发货数量
    validatorDespatch (rule, value, callback) {
      const ruleFields = rule.fullField.split('.');
      if (ruleFields.length !== 3) {
        this.tableErrorList = {};
        return callback();
      }
      const ruleIndex = Number(ruleFields[1]);
      if (this.$common.isEmpty(ruleIndex)) {
        this.tableErrorList = {};
        return callback();
      }
      const ruleRow = this.formValidate.tableList[ruleIndex];
      if (this.$common.isEmpty(value)) {
        this.$set(this.tableErrorList, (ruleIndex).toString(), `订单：${ruleRow.purchaseNumber} 请输入发货数量`);
        return callback(new Error('请输入发货数量'));
      }
      const newVal = Number(value);
      if (newVal < 1 || (newVal.toString()).includes('.') || this.$common.isEmpty(newVal)) {
        this.$set(this.tableErrorList, (ruleIndex).toString(), `订单：${ruleRow.purchaseNumber} 请输入大于0正整数`);
        return callback(new Error('请输入大于0正整数'));
      }
      const despatchNumber = Number(ruleRow.notDespatchNumber);
      if (![1, '1'].includes(ruleRow.overshootState) && newVal > despatchNumber) {
        this.$set(this.tableErrorList, (ruleIndex).toString(), `订单：${ruleRow.purchaseNumber} 不允许超发`);
        return callback(new Error('此单不允许超发'));
      }
      delete this.tableErrorList[(ruleIndex).toString()];
      callback();
    },
    // 获取快递物流商
    getLogistlist () {
      this.axios.post(api.logistics).then(({ data }) => {
        if (data.code == 0) {
          this.logistProvilist = data.datas || [];
        }
      });
    },
    // 状态
    statusText (status) {
      let name = '';
      this.tablist.forEach(k => {
        if (k.value !== '' && k.value == status) {
          name = k.label;
        }
      });
      return name;
    }
  }
};
</script>
<style scoped lang="less">
.order-block,
.order-li {
  display: flex;
  align-items: center;
}
.order-block {
  padding: 4px 0;
}
.order-item {
  margin-left: 10px;
}
.order-item .order-li .alink {
  text-decoration: underline;
}
.btn-list > span {
  white-space: nowrap;
  margin-right: 10px;
}
.despatch-number-item{
  display: flex;
}
</style>