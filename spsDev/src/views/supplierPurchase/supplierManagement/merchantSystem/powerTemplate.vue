<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal class="modal-main" v-model="CURENMSG.modelVisible" :mask-closable="false" title="商家系统权限模板设置" :width="800">
      <div class="content">
        <div class="flex-block">
          <!-- 左侧栏 -->
          <div class="left">
            <ul>
              <li class="lis lis--title">商家权限模板名称</li>
              <li class="lis btn-edit" @click="addTemplate('新增权限模板')">
                <Icon type="md-add" /> 新增商家权限模板
              </li>
              <li class="lis lis--flex" v-for="(item,index) in postList" :key="item.roleId" :class="{lisActive: tab === index}" @click="tabClick(item,index)">
                <span>{{item.name || ''}}</span>
                <div class="lis__operator">
                  <span class="mr10 btn-edit" @click="addTemplate('修改权限模板',item)">编辑</span>
                  <span class="btn-del">删除</span>
                </div>
              </li>
            </ul>
          </div>

          <!-- 右侧栏 -->
          <div class="right">
            <div class="mainContent">
              <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
                <Checkbox :indeterminate="indeterminate" :value="checkAll" @click.prevent.native="handleCheckAll">全选</Checkbox>
              </div>
              <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
                <Checkbox label="香蕉"></Checkbox>
                <Checkbox label="苹果"></Checkbox>
                <Checkbox label="西瓜"></Checkbox>
              </CheckboxGroup>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit()" :loading="loading">保存 </Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="CURENMSG.modelVisible = false">关闭</Button>
      </div>
    </Modal>

    <Modal class="modal-main" v-model="dialogObj.modelVisible" :mask-closable="false" :title="dialogObj.title" :width="500">
      <div class="content">
        <Form ref="temValidate" :model="dialogObj.formValidate" :label-width="100" :rules="dialogObj.ruleValidate">
          <FormItem label="权限模板名称:" prop="name">
            <Input v-model="dialogObj.formValidate.name" placeholder="请输入" clearable></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="templateSubmit('temValidate')" :loading="dialogObj.loading">保存 </Button>
        <Button @click="dialogObj.modelVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
// import api from '@/api/api';
export default {
  data () {
    return {
      loading: false,
      tab: 0,
      postList: [
        {
          name: "直供商家模板",
          roleId: 1
        },
        {
          name: "一级供应商模板",
          roleId: 2
        }
      ],
      dialogObj: {
        modelVisible: false,
        title: '',
        data: {},
        formValidate: {
          name: '',
          id: ''
        },
        ruleValidate: {
          name: [
            { required: true, message: '请输入权限模板名称', trigger: 'blur' },
          ],
        },
      },
      indeterminate: true,
      checkAll: false,
      checkAllGroup: ['香蕉', '西瓜']
    };
  },
  props: {
    CURENMSG: {
      type: Object,
      default () {
        return {
          modelVisible: false,
        };
      }
    }
  },
  watch: {
    'CURENMSG.modelVisible': {
      handler (newVal, oldVal) {
        if (newVal) {
          this.handleReset();
        }
      },
      deep: true,
      immediate: true
    }
  },
  created () { },
  methods: {
    // 提交
    handleSubmit () { },
    // 重置表单
    handleReset () { },
    // 获取权限列表
    getPower () { },
    // 点击tab切换
    tabClick (item, index) {
      this.tab = index || 0;
    },

    // 新增/修改权限模板
    addTemplate (title, row) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.title = title;
      this.dialogObj.data = row || {};
    },
    // 提交模板
    templateSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          console.log(this.dialogObj.formValidate);

          // this.dialogObj.loading = true;
        }
      });
    },

    handleCheckAll () {
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;
      if (this.checkAll) {
        this.checkAllGroup = ['香蕉', '苹果', '西瓜'];
      } else {
        this.checkAllGroup = [];
      }
    },
    checkAllGroupChange (data) {
      if (data.length === 3) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (data.length > 0) {
        this.indeterminate = true;
        this.checkAll = false;
      } else {
        this.indeterminate = false;
        this.checkAll = false;
      }
    }
  }
};
</script>

<style scoped>
.flex-block {
  flex: 1;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
}
ul {
  height: 100%;
  overflow: auto;
  margin-right: -17px;
}
.left {
  width: 230px;
  overflow: hidden;
  border: 1px solid #dde3ef;
}
.lis {
  min-height: 48px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  word-break: break-all;
  cursor: pointer;
}
.lis:not(:last-child) {
  border-bottom: 1px solid #dde3ef;
}
.lis--flex:hover,
.lisActive {
  background: #ecf5ff;
}
.lis--title {
  background: #f7f8fb;
}
.lis--flex {
  display: flex;
  justify-content: space-between;
}
.lis__operator {
  padding-right: 17px;
}
.btn-edit {
  color: #2d8cf0;
}
.btn-del {
  color: #ed4014;
}
.right {
  flex: 1;
  margin-left: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
