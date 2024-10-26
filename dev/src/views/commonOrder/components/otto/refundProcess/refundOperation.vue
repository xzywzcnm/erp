<template>
  <div>
    <Modal v-model="modalVisible" :title="title + '退款'" :mask-closable="false" class="refundOperationPage">
      <div class="fmb10">
        <Form ref="formItem" :model="formItem" :rules="formRule" :label-width="90">
          <div class="mb10 tips">
            是否{{ title }}<span style="color:#ed4014;"> {{ list.length }} </span>个退款申请
          </div>
          <FormItem label="拒绝原因:" prop="refuse" v-if="[2, 4].includes(type)">
            <dyt-select v-model="formItem.refuse">
              <Option v-for="(item, index) in refuseList" :key="index" :value='item.value' :label="item.label" />
            </dyt-select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalVisible = false">取消</Button>
        <Button type="primary" @click="handle" :loading="loading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'refundOperation',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default() { return [] }
    },
    type: {
      type: String | Number,
      default: null
    },
  },
  data() {
    return {
      modalVisible: false,
      formItem: {
        refuse: '',
      },
      formRule: {
        refuse: [
          { required: true, message: '请选择拒绝原因', trigger: 'change' }
        ],
      },
      refuseList: [
        { label: 'THIRD_PARTY_ITEM', value: 'THIRD_PARTY_ITEM' },
        { label: 'WRONG_ITEM', value: 'WRONG_ITEM' },
        { label: 'EXCHANGE', value: 'EXCHANGE' },
        { label: 'DAMAGE_TO_THE_HYGIENE_SEAL', value: 'DAMAGE_TO_THE_HYGIENE_SEAL' },
        { label: 'ITEM_DAMAGED', value: 'ITEM_DAMAGED' },
        { label: 'RETURN_PERIOD_EXCEEDED', value: 'RETURN_PERIOD_EXCEEDED' },
        { label: 'ITEM_NOT_IN_THE_PARCEL', value: 'ITEM_NOT_IN_THE_PARCEL' },
      ],
      loading: false,
    }
  },
  watch: {
    dialogVisible: {
      handler(nval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval) {
        if (nval) return;
        this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  computed: {
    title() {
      const type = this.type;
      let title = '';
      if ([2, 4].includes(type)) title = '拒绝';
      if ([1, 3].includes(type)) title = '接受';
      return title;
    },
  },
  methods: {
    open() {
      this.modalVisible = true;
      this.formItem.refuse = '';
      this.$nextTick(() => {
        this.$refs['formItem'].resetFields();
      })
    },
    handle() {
      this.$refs['formItem'].validate((valid) => {
        if (!valid) return;
        const type = this.type;
        const list = this.list;
        const refuse = this.formItem.refuse;
        let [apiUrl, rqType, temp] = ['', '', {}];
        let fun = {
          1: {
            api: `${api.ott_acceptedOttoRefund}/${list[0].ottoRefundInfoId}`,
            type: 'put',
            temp() { return {} },
          },
          2: {
            api: `${api.ott_rejectedOttoRefund}/${list[0].ottoRefundInfoId}/${refuse}`,
            type: 'put',
            temp() { return {} },
          },
          3: {
            api: api.ott_batchAcceptedOttoRefund,
            type: 'post',
            temp() {
              let ottoRefundInfoIds = list.map(k => k.ottoRefundInfoId);
              return {
                ottoRefundInfoIds: ottoRefundInfoIds,
              }
            },
          },
          4: {
            api: api.ott_batchRejectedOttoRefund,
            type: 'post',
            temp() {
              let ottoRefundInfoIds = list.map(k => k.ottoRefundInfoId);
              return {
                ottoRefundInfoIds: ottoRefundInfoIds,
                reason: refuse,
              }
            },
          },
        }
        apiUrl = fun[type].api;
        rqType = fun[type].type;
        temp = fun[type].temp();
        // console.log(apiUrl);
        // console.log(rqType);
        // console.log(temp);
        this.loading = true;
        this.axios[rqType](apiUrl, temp).then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success('操作成功!');
          this.modalVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
  }
}
</script>
<style lang="less">
.refundOperationPage {
  .tips {
    font-size: 16px;
    padding-left: 25px;
    padding-top: 30px;
  }
}
</style>
