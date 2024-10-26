<template>
  <div>
    <Modal v-model="isVisible" :title="title[modelType]||'货箱信息'" width="500" :mask-closable="false" class="volumeSettingEditPage">
      <Form :ref="formName" :model="formItem" :rules="ruleValidate" :label-width="100">
        <FormItem label="货箱代码" prop="boxTypeCode">
          <dyt-input placeholder="请输入" v-model.trim="formItem.boxTypeCode" :disabled="isDisabled"></dyt-input>
        </FormItem>
        <FormItem label="货箱型号名称" prop="boxTypeName">
          <dyt-input placeholder="请输入" v-model.trim="formItem.boxTypeName" :disabled="isDisabled"></dyt-input>
        </FormItem>
        <FormItem label="货箱尺寸" prop="boxSize">
          <div class="inputWidth">
            <Input placeholder="长" v-model="formItem.boxSize.length" class="mr10" :disabled="isDisabled">
            <span slot="append">cm</span>
            </Input>
            <Input placeholder="宽" v-model="formItem.boxSize.width" class="mr10" :disabled="isDisabled">
            <span slot="append">cm</span>
            </Input>
            <Input placeholder="高" v-model="formItem.boxSize.height" :disabled="isDisabled">
            <span slot="append">cm</span>
            </Input>
          </div>
        </FormItem>
        <FormItem label="货箱状态" prop="status">
          <RadioGroup v-model="formItem.status">
            <Radio :label="1" style="margin-right: 20px;" :disabled="isDisabled">可用</Radio>
            <Radio :label="0" :disabled="isDisabled">停用</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <dyt-input v-model.trim="formItem.remark" type="textarea" placeholder="请输入" :disabled="isDisabled"></dyt-input>
        </FormItem>
      </Form>
      <div slot="footer">
        <template>
          <Button @click="submitForm" type="primary" :loading="loading" v-if="!isDisabled">确定</Button>
          <Button @click="isVisible = false">{{isDisabled ? '关闭' : '取消'}}</Button>
        </template>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
const patternFloat = { type: 'string', message: '大于0的数字,小数精度1位', pattern: /^[1-9][0-9]{0,}(\.\d{1})?$/ };
export default {
  name: 'volumeSettingEdit',
  data () {
    return {
      isVisible: false,
      formItem: {
        boxTypeCode: '',
        boxTypeName: '',
        status: 1,
        boxSize: {
          length: '',
          width: '',
          height: ''
        },
        remark: ''
      },
      ruleValidate: {
        boxTypeCode: [
          { required: true, message: '请输入', trigger: 'blur' },
          { max: 20, message: '长度不能超过20位', trigger: 'blur' }
        ],
        boxTypeName: [
          { required: true, message: '请输入', trigger: 'blur' },
          { max: 20, message: '长度不能超过20位', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择', trigger: 'blur', type: 'number' }
        ],
        boxSize: [
          {
            type: 'object',
            required: true,
            fields: {
              length: [
                { type: 'string', required: true, message: '请输入长', trigger: 'blur' },
                patternFloat
              ],
              width: [
                { type: 'string', required: true, message: '请输入宽', trigger: 'blur' },
                patternFloat
              ],
              height: [
                { type: 'string', required: true, message: '请输入高', trigger: 'blur' },
                patternFloat
              ]
            }
          }
        ],
        remark: [
          { max: 200, required: false, message: '长度不能超过200位', trigger: 'blur' }
        ]
      },
      formName: 'formValidate',
      title: {
        'add': '新增货箱信息',
        'edit': '编辑货箱信息',
        'detail': '货箱详情信息'
      },
      loading: false
    }
  },
  props: {
    modelVisible: {
      type: Boolean,
      default () {
        return false;
      }
    },
    modelData: {
      type: Object,
      default () {
        return {};
      }
    },
    modelType: {
      type: String,
      default () {
        return '';
      }
    }
  },
  watch: {
    modelVisible: {
      handler (val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler (val) {
        if (val) return;
        this.reset();
        this.$emit('update:modelVisible', val);
      },
      deep: true
    }
  },
  computed: {
    isDisabled () {
      return this.modelType === 'detail';
    }
  },
  methods: {
    // 窗口打开
    open () {
      this.isVisible = true;

      let arr = ['length', 'width', 'height'];
      Object.keys(this.modelData).forEach(mitem => {
        if (arr.includes(mitem)) {
          this.formItem.boxSize[mitem] = this.modelData[mitem] + '';
          return;
        }
        if (!(mitem in this.formItem)) return;
        this.formItem[mitem] = this.modelData[mitem];
      })
    },
    // 重置
    reset () {
      let arr = ['length', 'width', 'height'];
      arr.forEach(k => {
        this.formItem.boxSize[k] = '';
      })
      this.$refs[this.formName].resetFields();
    },
    // 提交表单
    submitForm () {
      this.$refs[this.formName].validate((valid) => {
        if (!valid) return;
        let temp = {};
        Object.keys(this.formItem).forEach(k => {
          if (k === 'boxSize') {
            Object.keys(this.formItem[k]).forEach(ik => {
              temp[ik] = this.formItem[k][ik];
            })
          } else {
            temp[k] = this.formItem[k];
          }
        })
        let { boxId } = this.modelData;
        let [apiUrl, apiType] = [null, null];
        boxId && (temp.boxId = boxId);
        if (boxId) {
          apiUrl = api.wmsBoxesEdit;
          apiType = 'put';
        } else {
          apiUrl = api.wmsBoxesSave;
          apiType = 'post';
        }
        // let apiUrl = boxId ? api.wmsBoxesEdit : api.wmsBoxesSave;
        // console.log(temp, apiUrl);
        // return;
        this.loading = true;
        this.axios[apiType](apiUrl, temp).then(response => {
          this.$Message.success('操作成功');
          this.isVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    }
  }
}
</script>
<style lang="less">
.volumeSettingEditPage {
  .inputWidth {
    display: flex;
    .ivu-input-wrapper {
      width: 116px;
    }
  }
}
</style>
