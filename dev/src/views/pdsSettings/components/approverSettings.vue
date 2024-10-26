<template>
  <div class="mainBox approver-settings">
    <Card shadow>
      <Form ref="formData" :model="formData" :label-width="170" label-position="left">
        <div v-for="(data,name,key) in formData" :key="key">
          <!-- <FormItem :label="name==='stockDevelopment' ?'备货开发' : '云仓开发',"></FormItem> -->
          <FormItem :label="chooseName(name)"></FormItem>
          <div v-for="(item,index) in data" :key="index+'1'">
            <FormItem :label="item.name" :prop="name+'.' + index + '.requireVerifyBy'" :rules="{required: item.forman===1, message: '请选择指定操作人', trigger: 'blur'}" :show-message="item.forman===1">
              <div class="flex-inline">
                <RadioGroup v-model="item.forman">
                  <Radio :label="0" :disabled="item.disabled">否</Radio>
                  <Radio :label="1" :disabled="item.disabled">是</Radio>
                </RadioGroup>
                <dyt-select v-model="item.requireVerifyBy" clearable filterable :disabled="item.forman===0" :transfer="true">
                  <Option v-for="(item, index) in userInfoList" :value="item.userId" :key="index+'2'">{{ item.userName }}</Option>
                </dyt-select>
              </div>
            </FormItem>
          </div>
        </div>
        <FormItem>
          <Button type="primary" @click="handleSubmit('formData')" :loading="loading" v-if="getPermission('pdsSettings_approverSettings_save')">确定</Button>
        </FormItem>
      </Form>
    </Card>
  </div>
</template>

<script>
import api from '@/api/api.js';
import pageMixin from '@/components/mixin/page_mixin';
import CommonMixin from '@/components/mixin/common_mixin';
export default {
  components: {},
  name: 'approverSettings',
  mixins: [pageMixin, CommonMixin],
  data () {
    return {
      formData: {
        chooseStyle: [
          { name: '指定选款审核操作人', forman: 0, requireVerifyBy: '', flowType: 1, process: 2 },
          { name: '指定侵权审核操作人', forman: 0, requireVerifyBy: '', flowType: 2, process: 2 }
        ],
        stockDevelopment: [
          { name: '指定审款操作人', forman: 0, requireVerifyBy: '', flowType: 1, process: 1 },
          { name: '指定侵权审核操作人', forman: 0, requireVerifyBy: '', flowType: 2, process: 1 },
          { name: '指定审核资料操作人', forman: 0, requireVerifyBy: '', flowType: 3, process: 1 },
          { name: '指定审样核价操作人', forman: 0, requireVerifyBy: '', flowType: 4, process: 1 },
          { name: '指定完善图片指派人', forman: 0, requireVerifyBy: '', flowType: 5, process: 1 },
          { name: '指定完善文本指派人', forman: 0, requireVerifyBy: '', flowType: 6, process: 1 }
        ],
        cloudDevelopment: [
          { name: '指定侵权审核操作人', forman: 0, requireVerifyBy: '', flowType: 2, process: 0 },
          { name: '指定完善图片指派人', forman: 0, requireVerifyBy: '', flowType: 5, process: 0 },
          { name: '指定完善文本指派人', forman: 0, requireVerifyBy: '', flowType: 6, process: 0 },
          { name: '指定listing采集数据接收人', forman: 0, requireVerifyBy: '', flowType: 7, process: 0 }
        ]
      },
      userInfoList: [], // 用户信息列表
      loading: false
    }
  },
  created () {
    this.getUserlist();
  },
  activated () {
    this.init();
  },
  methods: {
    init () {
      this.$Spin.show();
      this.axios
        .get(api.queryProductDefaulReviewer)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas || [];
          let { stockDevelopment, cloudDevelopment, chooseStyle } = this.formData;
          console.log(list);
          list.forEach(k => {
            // 备货开发
            stockDevelopment.forEach((ck, ci) => {
              if (k.process === ck.process && k.flowType === ck.flowType) {
                this.formData.stockDevelopment[ci].forman = k.requireVerifyBy ? 1 : 0;
                this.formData.stockDevelopment[ci].requireVerifyBy = k.requireVerifyBy;
              }
            })
            // 云仓开发
            cloudDevelopment.forEach((ck, ci) => {
              if (k.process === ck.process && k.flowType === ck.flowType) {
                this.formData.cloudDevelopment[ci].forman = k.requireVerifyBy ? 1 : 0;
                this.formData.cloudDevelopment[ci].requireVerifyBy = k.requireVerifyBy;
              }
            })
            // 选款 暂时不清楚是都需要progress开发的字端
            chooseStyle.forEach((ck, ci) => {
              if (k.flowType === ck.flowType) {
                this.formData.chooseStyle[ci].forman = k.requireVerifyBy ? 1 : 0;
                this.formData.chooseStyle[ci].requireVerifyBy = k.requireVerifyBy;
              }
            })
          })
        }).finally(() => {
          this.$Spin.hide();
        })
    },
    getUserlist () {
      this.axios
        .get(api.getAllUserByParm, { params: { module: 'pds' } })
        .then(({ data }) => {
          if (data.code !== 0) return;
          let list = data.datas || [];
          this.userInfoList = Object.values(list);
        })
    },
    listData (arr) {
      if (!Array.isArray(arr)) return;
      return arr.map(k => {
        return {
          requireVerifyBy: k.forman === 1 ? k.requireVerifyBy : '',
          flowType: k.flowType,
          process: k.process
        }
      })
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let { stockDevelopment, cloudDevelopment, chooseStyle } = this.formData;
          let [total, lis1, lis2, lis3] = [[], [], [], []];
          lis1 = this.listData(stockDevelopment);
          lis2 = this.listData(cloudDevelopment);
          lis3 = this.listData(chooseStyle);
          total = total.concat(lis1, lis2, lis3);
          // console.log(total, '这里是传给接口的参数');
          // return;
          this.loading = true;
          this.axios
            .post(api.saveProductDefaulReviewer, total)
            .then(({ data }) => {
              if (data.code !== 0) return;
              this.$Message.success('操作成功');
              this.init();
            }).finally(() => {
              this.loading = false;
            })
        }
      })
    },
    chooseName (name) {
      if (name == 'stockDevelopment') return '备货开发';
      if (name == 'cloudDevelopment') return '云仓开发';
      if (name == 'chooseStyle') return '选款';
    }
  }
}
</script>
<style scoped>
.approver-settings {
  min-width: 700px;
}
.flex-inline {
  display: flex;
  align-items: center;
}
.flex-inline:not(:last-child) {
  margin-bottom: 10px;
}
.flex-inline .ivu-select {
  width: 400px;
  margin-left: 20px;
}
</style>
<style>
.approver-settings .ivu-form-item-content .ivu-form-item-error-tip {
  left: 106px;
}
</style>
