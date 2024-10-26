<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" title="维护箱唛" :width="600">
      <div class="content">
        <Form ref="formValidates" :model="formValidate" :label-width="60" :rules="ruleValidate">
          <FormItem label="发货单:">
            <span>{{dialogObj.data.supplierDespatchId || '-'}}</span>
          </FormItem>
          <FormItem label="共:" prop="num">
            <Input v-model="formValidate.num" placeholder="请输入" clearable style="width:100px;" @on-change="initTablelist()"></Input>
            <span class="ml10">箱</span>
          </FormItem>
          <Table highlight-row max-height="590" :columns="columns" :data="formValidate.tableList" :border="true" :loading="Tableloading" class="fmb0">
            <template slot-scope="{ index }" slot="send">
              <FormItem :rules="ruleValidate.despatchNumber" :prop="`tableList.${index}.despatchNumber`" :label-width="0" :show-message="false">
                <Input type="text" v-model="formValidate.tableList[index].despatchNumber" />
              </FormItem>
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
const validateNumber = (rule, value, callback) => {
  if (value && !regular.validateInteger.test(value)) {
    callback(new Error('请输入正整数'));
  } else {
    callback();
  }
};
import api from '@/api/api';
import regular from '@/utils/regular';
export default {
  data () {
    return {
      loading: false,
      Tableloading: false,
      columns: [
        {
          title: '箱编号',
          key: 'boxNo'
        },
        {
          title: '发货数',
          slot: 'send'
        },
      ],
      formValidate: {
        num: '',
        tableList: [],
      },
      ruleValidate: {
        num: [
          { required: true, message: '请输入箱数', trigger: 'blur' },
          { validator: validateNumber, trigger: 'blur' }
        ],
        despatchNumber: [
          { required: true, message: '请输入发货数', trigger: 'blur' },
          { validator: validateNumber, trigger: 'blur' }
        ],
      },
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {}
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
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let [temp, total] = [[], 0];
          this.formValidate.tableList.forEach(k => {
            total += k.despatchNumber - 0;
            temp.push({
              boxNo: k.boxNo,
              despatchNumber: k.despatchNumber - 0,
              supplierDespatchId: this.dialogObj.data.supplierDespatchId,
            });
          });
          if (total > this.dialogObj.data.allSendQuantity) {
            this.$Message.error('发货数不能超过总发货数，请检查~');
            return;
          }
          // console.log(temp);
          // return;
          this.loading = true;
          this.axios.post(api.maintainShippingMark, temp).then(({ data }) => {
            if (data.code == 0) {
              this.$Message.info('操作成功');
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
      this.formValidate.num = '';
      this.formValidate.tableList = [];

      let supplierDespatchId = this.dialogObj.data.supplierDespatchId;
      this.getBoxlist(supplierDespatchId);
    },
    // 箱数变化，表格列表变化
    initTablelist () {
      const num = this.formValidate.num || 0;
      this.formValidate.tableList = [];
      if (!regular.validateInteger.test(num)) return;
      for (let i = 0; i < num; i++) {
        this.formValidate.tableList.push({
          boxNo: `${num}-${i + 1}`,
          despatchNumber: ''
        });
      }
    },
    // 查看箱唛
    getBoxlist (supplierDespatchId) {
      this.Tableloading = true;
      this.axios.post(api.queryShippingMark + `?supplierDespatchId=${supplierDespatchId}`).then(({ data }) => {
        if (data.code == 0) {
          let arr = data.datas || [];
          this.formValidate.tableList = arr.map((k, i) => {
            return {
              boxNo: k.boxNo,
              despatchNumber: k.despatchNumber + ''
            };
          });
          this.formValidate.num = arr.length || '';
        }
      }).finally(() => {
        this.Tableloading = false;
      });
    },
  }
};
</script>
<style scoped>
</style>