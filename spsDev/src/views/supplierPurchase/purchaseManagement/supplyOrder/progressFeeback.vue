<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main radioForm" v-model="dialogObj.modelVisible" :mask-closable="false" title="订单进度反馈" :width="800">
      <div class="content">
        <Form ref="formValidate" :model="formValidate" :label-width="120" :rules="ruleValidate">
          <div class="mt10 mb10 tips">
            <Icon type="md-alert" class="mr10" />
            <span>确认是否要批量变更订单进度，数量：<span class="num">{{tableList.length}}</span></span>
          </div>
          <FormItem label="订单生成进度:" prop="status">
            <RadioGroup type="button" v-model="formValidate.status">
              <Radio :label="item.value" v-for="item in progressList" :key="item.value">{{item.label}}</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="生产完成时间:" prop="sendTime" v-if="formValidate.status===0 || formValidate.status===1">
            <DatePicker type="datetime" format="yyyy-MM-dd HH:mm" placeholder="请选择" @on-change="sendTimeChange" :transfer="true" :options="options"></DatePicker>
          </FormItem>
        </Form>
        <Table highlight-row max-height="590" :columns="columns" :data="tableList" :border="true">
          <template slot-scope="{ row }" slot="pic">
            <large-picture :url="row.imgUrl" style="padding:4px 0;"></large-picture>
          </template>
        </Table>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading" :disabled="!(formValidate.status || formValidate.status===0)">确定</Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import largePicture from '@/components/largePicture';
import { progressList } from './configFile';
export default {
  components: { largePicture },
  data () {
    return {
      columns: [
        {
          title: '图片',
          width: '100px',
          slot: 'pic',
        },
        {
          title: '订单号',
          key: 'purchaseNumber'
        },
        {
          title: '供方货号',
          key: 'supplierNo'
        },
        {
          title: 'SKU',
          key: 'skuNo'
        },
      ],
      tableList: [],
      formValidate: {
        status: '',
        sendTime: '',
      },
      ruleValidate: {
        status: [
          { required: true, message: '订单生成进度必填', trigger: 'change', type: "number" }
        ],
        sendTime: [
          { required: true, message: '生产完成时间必填', trigger: 'change' }
        ],
      },
      progressList: progressList,
      loading: false,
      options: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      }
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
        if (newVal) this.handleReset();
      },
      immediate: true
    }
  },
  created () { },
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let temp = {};
          let form = this.formValidate;
          form.status < 2 ? temp.productionFinishTime = form.sendTime + ':59' : '';
          temp.feedbackType = form.status;
          temp.idList = this.tableList.map(k => {
            return k.orderInfoGoodsId;
          });
          // console.log(temp);
          // return;
          this.loading = true;
          this.axios.post(api.orderStatusFeedback, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.success('操作成功');
              // eslint-disable-next-line vue/no-mutating-props
              this.dialogObj.modelVisible = false;
              this.$emit('fetch');
            }
          }).finally(() => {
            this.loading = false;
          });
        }
      });
    },
    // 重置
    handleReset () {
      this.tableList = this.dialogObj.list;
      this.$refs['formValidate'].resetFields();
    },
    sendTimeChange (e) {
      this.formValidate.sendTime = e;
    }
  }
};
</script>
<style scoped>
.tips {
  display: flex;
  align-items: center;
}
.tips .ivu-icon {
  font-size: 26px;
  color: #ff9900;
}
.tips .num {
  color: #ff9900;
}
.radioForm .ivu-radio-group-button .ivu-radio-wrapper-checked {
  background: #2d8cf0;
  color: #fff;
}
</style>