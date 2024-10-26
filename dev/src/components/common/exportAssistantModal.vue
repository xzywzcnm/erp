<template >
  <Modal v-model="isVisible" title="定时导出助手" width="500">
    <div class="modal-edit">
      <Form
        class="modal-edit-form"
        ref="modalForm"
        :model="formData"
        :rules="formRule"
        :label-width="100"
        label-position="right"
      >
        <Form-item label="定时导出类型: " prop="taskType">
          <dyt-select v-model="formData.taskType" multiple :max-tag-count="1" style="width: 200px;">
            <Option v-for="(item, index) in exportTypes" :key="`type-${index}`" :value="item.value">{{ item.label }}</Option>
          </dyt-select>
        </Form-item>
        <Form-item
          v-for="(item, index) in formData.exportTime"
          :key="`time-${index}`"
          :prop="`exportTime.${index}.value`"
          :rules="exportTimeRule"
          :label="`${index == 0 ? '定时导出时间:' : ''}`"
        >
          <TimePicker
            type="time"
            placeholder="请选择定时导出时间"
            style="width: 200px;"
            v-model="item.value"
            format="HH:mm:ss"
            :transfer="true"
            :editable="false"
            @on-open-change="openTimeChange"
          />
          <span class="ml10 add-tiem-btn" v-if="index == 0" @click="addExportTime" title="添加定时导出时间">
            <Icon type="md-add" />
          </span>
          <span
            class="ml10 delete-tiem-btn"
            v-if="index > 0 || formData.exportTime.length > 1"
            @click="deleteExportTime(index)"
            title="移除定时导出时间"
          >
            <Icon type="md-close" />
          </span>
        </Form-item>
      </Form>
      <Spin v-if="pageLoading" fix></Spin>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取 消</Button>
      <Button type="primary" @click="saveData" :disabled="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'exportAssistantModal',
  props: {
    modalVisible: { type: Boolean, default: false },
    modalData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      isVisible: false,
      // 表单数据组
      formData: {
        taskType: [],
        exportTime: [{ value: '' }]
      },
      // 表单验证规则
      formRule: {},
      exportTimeRule: { validator: this.validateExportTime, trigger: 'change' },
      pageLoading: false,
      exportTypes: [
        { label: 'SPU视图', value: '1' },
        { label: 'SKU视图', value: '2' }
      ],
      errorTips: []
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.isVisible = val;
        if (!val) return;
        this.$nextTick(() => {
          this.initData();
        })
      }
    },
    isVisible: {
      handler (val) {
        this.$emit('update:modalVisible', val);
        if (val) return;
        this.restData();
      }
    }
  },
  created () {},
  computed: {
    businessDeptId () {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptId;
    },
    userId () {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.erpUserId || '';
    },
  },
  methods: {
    // 初始化页面数据
    initData () {
      if (this.$common.isEmpty(this.userId)) return;
      this.pageLoading = true;
      this.axios.get(api.queryTimedExport, {
        params: {
          userId: this.userId
        }
      }).then(res => {
        if (!res || !res.data || res.data.code != 0 || !this.isVisible) return;
        let exportTime = [];
        let taskType = [];
        (res.data.datas || []).forEach((item) => {
          !exportTime.includes(item.time) && exportTime.push(item.time || '');
          !this.$common.isEmpty(item.taskType) && !taskType.includes(item.taskType.toString()) && taskType.push(item.taskType.toString());
        });
        if (!this.$common.isEmpty(taskType)) {
          this.formData.taskType = taskType;
        }
        if (!this.$common.isEmpty(exportTime)) {
          this.formData.exportTime = exportTime.map(m => {
            return { value: m || '' }
          })
        } else {
          this.formData.exportTime = [{ value: '' }];
        }
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 保存
    saveData () {
      if (this.pageLoading) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid) {
          this.$Message.error('验证不通过，请检查时间是否存在重复项目！');
          return;
        }
        this.pageLoading = true;
        let params = [];
        const exportTime = this.$common.arrRemoveRepeat(this.formData.exportTime);
        if (!this.$common.isEmpty(exportTime)) {
          this.formData.taskType.forEach(type => {
            exportTime.forEach(item => {
              !this.$common.isEmpty(item.value) && params.push({ taskType: type, time: item.value });
            })
          });
        }
        this.axios.post(`${api.updateTimedExport}?businessDeptId=${this.businessDeptId}`, params).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('设置成功！');
          this.isVisible = false;
        }).finally(() => {
          this.pageLoading = false;
        })
      });
    },
    // 重置页面数据
    restData () {
      this.pageLoading = false;
      this.errorTips = [];
      this.$refs.modalForm && this.$refs.modalForm.resetFields();
      this.$nextTick(() => {
        this.$refs.modalForm && this.$refs.modalForm.resetFields();
        setTimeout(() => {
          this.$refs.modalForm && this.$refs.modalForm.resetFields();
        }, 200);
      });
    },
    // 时间弹窗隐藏时验证下验证失败项
    openTimeChange (val) {
      if (val || this.$common.isEmpty(this.errorTips)) return;
      let newErrorTips = [];
      this.errorTips.forEach(vKey => {
        this.$refs.modalForm.validateField(`exportTime.${vKey}.value`, (res) => {
          !this.$common.isEmpty(res) && newErrorTips.push(() => {
            return new Promise((resolve) => {
              resolve(vKey);
            })
          })
        });
      });
      this.$common.promiseAll(newErrorTips).then((resArr) => {
        this.errorTips = resArr;
      });
    },
    // 新增导出时间
    addExportTime () {
      this.formData.exportTime.push({ value: '' });
    },
    // 删除导出时间
    deleteExportTime (index) {
      this.formData.exportTime.splice(index, 1);
      // 移除时，如有验证失败项则移除
      if (this.errorTips.includes(index)) {
        this.errorTips = this.errorTips.filter(item => item != index);
      }
    },
    // 时间验证
    validateExportTime (rule, value, callback) {
      const dataIndex = Number(rule.field.split('.')[1]);
      if (this.$common.isEmpty(dataIndex)) return callback();
      let otherData = [];
      this.formData.exportTime.forEach((item, index) => {
        index != dataIndex && !this.$common.isEmpty(item.value) && otherData.push(item.value);
      });
      if (!this.$common.isEmpty(dataIndex) && otherData.includes(value)) {
        !this.errorTips.includes(dataIndex) && this.errorTips.push(dataIndex);
        return callback(new Error('不可以设置重复时间'));
      }
      callback();
    }
  }
};
</script>

<style lang="less" scoped>
.modal-edit-form{
  .add-tiem-btn{
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    vertical-align: middle;
  }
  .delete-tiem-btn{
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    vertical-align: middle;
    color: #f20;
  }
}
</style>
