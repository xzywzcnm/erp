<template>
  <div class="operation-log">
    <div class="list-tit">
      <span class="mr10">操作日志</span>
      <Checkbox v-model="showNotes" @on-change="showNoteFn"
        :disabled="!(isEdit && getPermission('wmsFbaPicking_createNotes'))">显示备注</Checkbox>
    </div>

    <template v-if="showNotes && getPermission('wmsFbaPicking_createNotes')">
      <!-- 添加备注 prop="addNotes" -->
      <Form ref="logInfo" :model="logInfo" :rules="ruleValidate">
        <Form-item>
          <div class="input-flex">
            <Input placeholder="添加备注" v-model.trim="logInfo.addNotes" clearable maxlength="100" show-word-limit></Input>
            <Button type="primary" icon="md-create" @click="addMsg()" class="ml10">备注</Button>
          </div>
        </Form-item>
      </Form>
    </template>
    <!-- 备注列表 -->
    <Table border :columns="orderLogColumns" :data="orderLogData" :loading="loading" max-height="450"></Table>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
export default {
  name: 'operationLog',
  mixins: [Mixin],
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _self = this;
    return {
      showNotes: true, // 显示备注
      logInfo: { addNotes: '' },
      ruleValidate: {
        addNotes: [
          { required: true, message: '请输入备注', type: 'string', trigger: 'blur' },
          { max: 100, message: '超出输入限制长度', trigger: 'blur' }
        ]
      },
      loading: false,
      orderLogData: [],
      orderLogColumns: [
        {
          key: 'updatedBy',
          title: '操作人', // 操作人
          width: 140,
          render(h, params) {
            return h('span', _self.getUserName(params.row.updatedBy))
          }
        }, {
          key: 'logContentDesc',
          title: '操作内容描述', // 操作内容描述
          minWidth: 230,
          render(h, params) {
            if (params.row.logTypeDesc === '10') {
              return h('span', '备注' + '：' + params.row.logContentDesc);
            } else {
              return h('span', params.row.logContentDesc);
            }
          }
        }, {
          key: 'updatedTime',
          title: '操作时间', // 操作时间
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('div', {}, _self.$uDate.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }
      ]
    };
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true
    },
    isEdit: {
      handler(val) {
        this.showNotes = val;
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setData(val) {
      this.orderLogData = val.logList || [];
    },
    // 是否显示备注
    showNoteFn(val) { },
    // 添加备注
    addMsg() {
      // this.$refs['logInfo'].validate((valid) => {
      //   if (valid) {
      let addNotes = this.logInfo.addNotes;
      if (!addNotes) {
        this.$Message.error('请输入备注');
        return;
      }
      let { pickingId, pickingNo } = this.detailData;
      let temp = {};
      temp.pickingId = pickingId;
      temp.relatedBusinessNo = pickingNo;
      temp.logContentDesc = addNotes;

      this.$Spin.show();
      this.axios.post(api.add_Note, temp).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        this.$Message.success('新增成功');
        this.$emit('searchData');
        this.logInfo.addNotes = '';
      }).finally(() => {
        this.$Spin.hide();
      });
      // }
      // });
    }
  }
};
</script>
<style lang="less" scoped>
.operation-log {
  .list-tit {
    font-size: 16px;
    padding: 15px 0;
    display: flex;
    align-items: center;
  }

  .input-flex {
    display: flex;
    align-items: center;
  }
}
</style>
