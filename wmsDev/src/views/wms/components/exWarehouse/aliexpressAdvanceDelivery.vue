<template>
  <div>
    <Modal
      style="width: 600px"
      v-model="modal"
      title="速卖通预约交货">
      <Form ref="form"
        :model="form"
        :label-width="120"
        :rules="rules">
        <FormItem prop="user" label="接收方式：">
          <RadioGroup v-model="form.collType">
            <Radio v-for="item in collTypeList" :key="item.value" :label="item.value">{{ item.label }}</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="code" label="承运商：" v-if="form.collType === 'self_post'">
          <Select v-model="form.code" style="width: 200px;">
            <Option v-for="item in domesticLogistics" :key="item.code" :label="item.name" :value="item.code"></Option>
          </Select>
        </FormItem>
        <FormItem prop="domesticTrackingNo" label="国内运单号：" v-if="form.collType === 'self_post'">
          <Input v-model.trim="form.domesticTrackingNo" placeholder="请输入国内运单号" style="width: 200px;"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="modal = false">取消</Button>
        <Button type="primary" :loading="btnLoading" @click="handleSubmit">预约</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';
export default {
  name: 'aliexpressAdvanceDelivery',
  mixins: [Mixin],
  data() {
    return {
      modal: false,
      form: {
        "appointmentType": "bigbag", // 预约交货方式（bigbag：大包预约，batch：批次预约）） ,
        "collType": "cainiao_pickup", // 揽收方式（cainiao_pickup(菜鸟揽收)、self_post(自寄)、self_send(自送)）
        code: '',
        "domesticLogisticsCompany": "", //  国内物流公司编码（交接单类型type为self_post(自寄)时必填）
        "domesticLogisticsCompanyId": "", // 国内物流公司id（交接单类型type为self_post(自寄)时必填）
        "domesticTrackingNo": "", //  国内运单号（交接单类型type为self_post(自寄)时必填）
        "wmsPickupOrderIds": [] // 提单号流水号集合
      },
      collTypeList: [
        {
          label: '菜鸟揽收',
          value: 'cainiao_pickup',
        },
        {
          label: '自寄',
          value: 'self_post',
        },
        {
          label: '自送',
          value: 'self_send',
        }
      ],
      rules: {
        code: [
          {
            required: true,
            message: '承运商不能为空',
            trigger: 'change'
          }
        ],
        domesticTrackingNo: [
          {
            required: true,
            message: '国内运单号不能为空',
            trigger: 'change'
          }
        ]
      },
      btnLoading: false,
      domesticLogistics: [] // 承运商
    };
  },
  created() {
    this.getDomesticLogistics();
  },
  props: {},
  watch: {},
  methods: {
    open(data) {
      this.btnLoading = false;
      this.form.wmsPickupOrderIds = [data.wmsPickupOrderId];
      this.modal = true;
    },
    /**
     * 获取承运商
     * */
    getDomesticLogistics() {
      this.axios.get(api.get_wmsPickupOrder_expressageHundred_query + '?type=aliexpress').then(response => {
        if (response.data.code === 0) {
          this.domesticLogistics = response.data.datas;
        }
      })
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let _params = JSON.parse(JSON.stringify(this.form))
          if (_params.collType !== 'self_post') {
            _params.domesticLogisticsCompany = '';
            _params.domesticLogisticsCompanyId = '';
            _params.domesticTrackingNo = '';
          } else {
            _params.domesticLogisticsCompany = _params.code.split('_')[0];
            _params.domesticLogisticsCompanyId = _params.code.split('_')[1];
          }
          this.btnLoading = true;
          this.axios.post(api.post_wmsPickupOrder_commitPickupOrder, _params).then(response => {
            this.btnLoading = false;
            if (response.data.code === 0) {
              this.$Message.success('预约成功');
              this.modal = false;
            }
          }).catch(() => {
            this.btnLoading = false;
          })
        }
      })
    }
  }
};
</script>

<style scoped>

</style>
