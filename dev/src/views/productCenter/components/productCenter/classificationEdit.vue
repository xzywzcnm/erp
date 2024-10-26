<template>
  <Modal
    v-model="showAttribute"
    :width="80"
    :title="modalTitle"
    :mask-closable="false"
    class="modal-detail-center"
  >
    <Form class="classification-form" ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="150">
      <FormItem label="属性分类名称" prop="classificationName">
          <dyt-input
          v-model="formData.classificationName"
          maxlength="60"
          :disabled="!isEdit"
          placeholder="请输入属性分类名称"
        />
      </FormItem>
      <FormItem label="绑定属性" prop="attributeClassifyVOList">
        <!-- <template v-for="(id, iIndex) in formData.attributeId">
          <Tag checkable color="primary" :key="`tag-${iIndex}`">标签一</Tag>
        </template> -->
        <dyt-select v-model="formData.attributeClassifyVOList" :multiple="true" filterable :disabled="!isEdit">
          <template v-for="(item, index) in attributeList">
            <Option
              v-if="item"
              :value="item.attributeClassifyId"
              :key="`option-${index}`"
            >
              <!-- {{ `${item.attributeId ? item.attributeId : ''}${item.cnName}` }} -->
              {{`${item.aliasName ? item.aliasName : ''}`}}
           </Option>
          </template>
        </dyt-select>
      </FormItem>
      <FormItem label="属性信息">
        <Table
          highlight-row
          border
          :columns="tableColumn"
          :data="tableData"
          :max-height="430"
        />
      </FormItem>
    </Form>
    <div slot="footer">
      <Button v-if="isEdit" type="primary" @click="saveAttribute">保 存</Button>
      <Button @click="cancelAttribute">{{`${isEdit?'取 消':'关 闭'}`}}</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';

export default {
  components: {},
  props: {
    modalVisual: {
      type: Boolean,
      default: false
    },
    isRefresh: {
      type: Boolean,
      default: false
    },
    modalType: {
      type: String,
      default: 'view'
    },
    moduleData: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    return {
      oldFormData: {},
      showAttribute: false,
      modalTitle: '属性分类详情',
      formData: {
        classificationId: '',
        classificationName: '',
        attributeClassifyVOList: []
      },
      ruleValidate: {
        classificationName: [
          { required: true, validator: this.validationClassification, trigger: 'blur' },
          { required: true, validator: this.validationClassification, trigger: 'change' }
        ]
      },
      attributeList: [],
      oldCheckId: [],
      tableColumn: [
        // {
        //   title: '属性名',
        //   key: 'classificationName',
        //   width: 200,
        //   align: 'center',
        //   render: (h, { row }) => {
        //     return h('div', [
        //       h('span', `${row.attributeId ? row.attributeId : ''}${row.cnName}`)

        //     ])
        //   }
        // },
        {
          title: '属性别名',
          key: 'aliasName',
          width: 200,
          align: 'center',
          render: (h, { row }) => {
            return h('div', [
              h('span', `${row.aliasName ? row.aliasName : ''}`)
            ])
          }
        },
        {
          title: '属性值',
          key: 'createdBy',
          align: 'center',
          minWidth: 200,
          render: (h, { row }) => {
            const txtList = row.attributeValueList.map(item => {
              return `${item.cnValue}`
            })
            return h('div', txtList.join(', '))
          }
        },
        {
          title: '必选',
          key: 'createdBy',
          align: 'center',
          width: 70,
          render: (h, { row }) => {
            return h('div', row.isMandatory == 0 ? '否' : '是')
          }
        },
        {
          title: '多选',
          key: 'createdTime',
          align: 'center',
          width: 70,
          render: (h, { row }) => {
            return h('div', row.type == 0 ? '单选' : '多选')
          }
        }
      ],
      tableData: [],
      isEdit: false
    };
  },
  watch: {
    modalVisual: {
      immediate: true,
      deep: true,
      handler (val) {
        val && this.init()
        this.$nextTick(() => {
          this.showAttribute = val
        })
      }
    },
    showAttribute: {
      deep: true,
      handler (val) {
        setTimeout(() => {
          this.$emit('update:modalVisual', val)
        }, 500)
      }
    },
    modalType: {
      immediate: true,
      deep: true,
      handler (val) {
        const v = {
          view: '属性分类详情',
          add: '新增属性分类',
          edit: '编辑属性分类'
        }
        this.modalTitle = v[val]
      }
    },
    'formData.attributeClassifyVOList': {
      deep: true,
      handler (val) {
        const newList = this.attributeList.filter(item => {
          return val.includes(item.attributeClassifyId)
        })
        this.tableData = newList
      }
    }
  },
  created () {},
  computed: {},
  methods: {
    // 初始化页面数据
    init () {
      this.moduleData.classificationId ? this.getDetails() : this.getAllAttribute()
    },
    // 获取分类详情
    getDetails () {
      this.axios.get(api.classificationDetails, {
        params: {
          attributeClassifyId: this.moduleData.classificationId
        }
      }).then(res => {
        if (res.data && res.data.code == 0 && res.data.datas) {
          // 属性表格数据
          Object.keys(this.formData).forEach(key => {
            if (key == 'attributeClassifyVOList') {
              const list = (res.data.datas[key] || []).map(item => {
                return item.attributeClassifyId
              })
              this.$set(this.formData, key, list)
            } else {
              this.$set(this.formData, key, res.data.datas[key])
            }
          })
          this.oldFormData = JSON.parse(JSON.stringify(this.formData))
          this.getAllAttribute()
          // this.tableData = JSON.parse(JSON.stringify(res.data.datas.attributeClassifyVOList || []))
        }
      }).catch(() => {
        this.isEdit = false
      })
    },
    // 获取所有属性
    getAllAttribute () {
      this.isEdit = ['add', 'edit'].includes(this.modalType)
      this.axios.get(api.attributeAll, {}).then(res => {
        if (res.data.code == 0 && res.data.datas) {
          this.attributeList = res.data.datas || []
        }
      })
    },
    // 保存
    saveAttribute () {
      const v = {
        hand: () => {
          const form = JSON.parse(JSON.stringify(this.formData))
          form.attributeId = form.attributeClassifyVOList
          delete form.attributeClassifyVOList
          this.axios.post(api[this.modalType == 'add' ? 'classificationAdd' : 'classificationEdit'], form).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.showAttribute = false
              // 刷新父级列表
              this.$emit('update:refresh', true)
            }
          })
        }
      }
      this.$refs.formValidate.validate((valid) => {
        valid && v.hand()
      })
    },
    // 关闭窗口
    cancelAttribute () {
      this.$refs.formValidate.resetFields()
      this.$nextTick(() => {
        this.showAttribute = false
      })
    },
    validationClassification (rule, value, callback) {
      if (!value) {
        return callback(new Error('属性分类名称不可为空'))
      }
      if (this.oldFormData.classificationName == value) {
        return callback()
      }
      if (rule.trigger == 'blur') {
        this.axios.get(api.classificationIsExist, {
          params: {
            classificationName: value,
            attributeClassifyId: this.moduleData.classificationId
          }
        }).then(res => {
          if (res.data.code == 0 && res.data.datas) {
            return callback(new Error('该属性名称已存在！'))
          }
          return callback()
        }).catch(() => {
          callback()
        })
      } else {
        callback()
      }
    }
  }
};
</script>
<style lang="less">
.modal-detail-center{
  .ivu-modal-body{
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
}
</style>
