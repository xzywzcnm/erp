<template>
  <div class="attribute-detail-list">
    <!--操作区-->
    <div class="addBrand">
      <Button
        type="primary"
        icon="md-add"
        v-if="permission.insert"
        @click="addEditAttribute"
      >
        添加新属性
      </Button>
      <Button
        type="primary"
        style="margin-left: 10px;"
        icon="md-sync"
        @click="refreshList"
      >
        刷新列表
      </Button>
    </div>
    <!--列表-->
    <div class="orderTable normalTop">
      <Table
        highlight-row
        :loading="tableLoading"
        border
        :height="tableHeight"
        :columns="skuMapColumn"
        :data="skuMapData"
      />
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="pageParams.pageNum"
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>
    </div>
    <!-- 新增(编辑)属性 -->
    <Modal
      v-model="showAttribute"
      :title="`${formData.attributeClassifyId?'编辑':'新增'}属性`"
      :loading="loadingAttribute"
      :mask-closable="false"
      @on-ok="saveAttribute"
      @on-cancel="cancelAttribute"
      :width="800"
      class="modal-detail-center attribute-detail-form-modal"
    >
      <Form ref="formValidate" :model="formData" :rules="ruleValidate" :label-width="150" class="form-style">
        <FormItem label="属性中文名" prop="cnName">
          <Input
            v-model="formData.cnName"
            placeholder="请输入属性中文名称"
            clearable
            maxlength="30"
          />
        </FormItem>
        <FormItem label="属性英文名" prop="enName">
          <Input
            v-model="formData.enName"
            clearable
            maxlength="150"
            placeholder="请输入属性英文名称"
          />
        </FormItem>
        <FormItem
          label="属性值"
          v-for="(item, index) in formData.attributeValueList"
          :key="`attribute-${index}`"
        >
          <Row>
            <Col span="10">
              <FormItem
                :prop="`attributeValueList.${index}.cnValue`"
                :rules="[
                  {required: true, validator: validateEnName, trigger: 'blur'},
                  {required: true, validator: validateEnName, trigger: 'change'}
                ]"
              >
                <Input
                  v-model="item.cnValue"
                  clearable
                  maxlength="30"
                  @input="valueChange"
                  placeholder="请输入属性值中文名称"
                />
              </FormItem>
            </Col>
            <span style="dispaly:inline-block; padding: 0 5px">-</span>
            <Col span="10">
              <FormItem
                :prop="`attributeValueList.${index}.enValue`"
                :rules="[
                  {required: true, validator: validateEnName, trigger: 'blur'},
                  {required: true, validator: validateEnName, trigger: 'change'}
                ]"
              >
                <Input
                  v-model="item.enValue"
                  clearable
                  maxlength="150"
                  placeholder="请输入属性值英文名称"
                  @input="valueChange"
                />
              </FormItem>
            </Col>
            <Col style="padding-left: 10px;">
              <span
                class="form-list-item"
                v-if="formData.attributeValueList.length - 1 != index"
                @click="deleteFormRow(index)"
              >
                删除
              </span>
              <span
                v-else
                class="form-list-item"
                @click="addFormRow()"
              >添加</span>
            </Col>
          </Row>
          <span class="form-error-text" v-if="formError.attributeValueList[index]">
            是否确认删除？请再次点击 "删除" 执行操作
          </span>
        </FormItem>
        <FormItem label="类型" prop="type">
          <RadioGroup v-model="formData.type">
            <Radio label="0">单选</Radio>
            <Radio label="1">多选</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="必选" prop="isMandatory">
          <RadioGroup v-model="formData.isMandatory">
            <Radio label="1">是</Radio>
            <Radio label="0">否</Radio>
          </RadioGroup>
        </FormItem>
      </Form>
    </Modal>
    <!--删除确认框组件-->
    <delConfirmModal ref="delConfirmModal" @ok="del" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import delConfirmModal from './delConfirmModal';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    delConfirmModal: delConfirmModal
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
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
      showAttribute: false,
      loadingAttribute: true,
      formData: {
        attributeClassifyId: '',
        cnName: '',
        enName: '',
        type: '',
        isMandatory: '',
        attributeValueList: []
      },
      formError: {
        attributeValueList: {}
      },
      numberKey: ['type', 'isMandatory'],
      ruleValidate: {
        cnName: [
          { required: true, message: '中文名称不能为空', trigger: 'blur' },
          { required: true, message: '中文名称不能为空', trigger: 'change' }
        ],
        enName: [
          { required: true, validator: this.validateEnName, trigger: 'blur' },
          { required: true, validator: this.validateEnName, trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        isMandatory: [
          { required: true, message: '请选择', trigger: 'change' }
        ]
      },
      pageArray: [10, 20, 50, 100, 500],
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载列表数据
      pageParams: { // 映射列表筛选参数
        pageNum: 1,
        pageSize: 20
      },
      skuMapData: [], // 列表数据
      skuMapColumn: [ // 列表列定义
        {
          title: '序号',
          width: 70,
          type: 'index',
          align: 'center'
        },
        {
          title: '属性(中:英)',
          key: 'enName',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            return h('span', `${params.row.cnName},${params.row.enName}`);
          }
        },
        {
          title: '属性值(中:英)',
          key: 'attributeClassifyId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let text = '-';
            if (params.row.attributeValueList) {
              text = params.row.attributeValueList.map(item => {
                return `${item.cnValue}:${item.enValue}`;
              }).join(', ');
            }
            return h('span', text);
          }
        },
        {
          title: '类型',
          key: 'type',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', `${params.row.type == 0 ? '单选' : '多选'}`);
          }
        },
        {
          title: '是否必选',
          key: 'isMandatory',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', `${params.row.isMandatory == 0 ? '否' : '是'}`);
          }
        },
        {
          title: '操作',
          width: 150,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px',
                  display: `${this.permission.edit ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.permission.edit && this.addEditAttribute(params.row);
                  }
                }
              }, '编辑'),
              h('Button', {
                style: {
                  marginLeft: '10px',
                  display: `${this.permission.delete ? 'inline-block' : 'none'}`
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (this.permission.delete) {
                      this.delConfirm(params.row);
                    }
                  }
                }
              }, '删除')
            ]);
          }
        }
      ]
    };
  },
  watch: {
    pageParamsStatus (val) { // 监听重置列表数据
      val && this.getList();
    },
    isVisible: {
      deep: true,
      handler (val) {
        val && (this.pageParamsStatus = true);
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(210);
  },
  computed: {
    // 权限
    permission () {
      return {
        // query: this.getPermission('productSkuMapping_query'),
        query: this.getPermission('queryAttributeClassifyAttributeList'),
        delete: this.getPermission('deleteAttributeClassifyDeleteAttribute'),
        edit: this.getPermission('updateAttributeClassifyEditAttribute'),
        insert: this.getPermission('insertAttributeClassifyAddAttribute')
      };
    }
  },
  methods: {
    getList () { // 查询列表数据
      if (!this.permission.query) return;
      let item = {
        attributeId: this.moduleData.attributeId,
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize
      };
      this.loadingTrue();
      this.axios.get(api.attributeAttributeList, { params: item }).then(res => {
        this.pageParamsStatus = false;
        this.loadingFalse();
        if (res.data.code === 0 && res.data.datas && res.data.datas.list) {
          this.skuMapData = res.data.datas.list;
          this.total = res.data.datas.total;
        }
      }).catch(() => {
        this.loadingFalse();
        this.pageParamsStatus = false;
      });
    },
    delConfirm (delRow) { // 删除确认
      this.$refs.delConfirmModal.show(delRow);
    },
    del (row) { // 删除
      const v = {
        hand: () => {
          this.axios.get(api.attributeDeleteAttribute, { params: { attributeClassifyId: row.attributeClassifyId } }).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.pageParams.pageNum = 1;
              this.pageParamsStatus = true;
              this.$refs.delConfirmModal.hide();
            }
          });
        }
      };
      v.hand();
    },
    // 刷新列表
    refreshList () {
      this.pageParamsStatus = true;
    },
    // 显示属性窗口
    addEditAttribute (row) {
      if (row.attributeClassifyId) {
        Object.keys(this.formData).forEach(key => {
          if (this.numberKey.includes(key)) {
            this.formData[key] = isNaN(row[key]) ? row[key] : row[key].toString();
          } else {
            if (key == 'attributeValueList') {
              this.formData[key] = row[key] && row[key].length > 0 ? row[key].map((item, index) => {
                return {
                  ...item,
                  index: index + 1
                };
              }) : [{ cnValue: '', enValue: '', index: 1 }];
            } else {
              this.formData[key] = row[key];
            }
          }
        });
      } else {
        this.formData.attributeValueList = [{ cnValue: '', enValue: '', index: 1 }];
        this.$nextTick(() => {
          this.$refs.formValidate.resetFields();
        });
      }
      this.$nextTick(() => {
        this.showAttribute = true;
      });
    },
    // 保存属性
    saveAttribute () {
      const v = {
        hand: () => {
          const list = this.formData.attributeValueList.map(item => {
            return {
              cnValue: item.cnValue,
              enValue: item.enValue,
              attributeValueId: item.attributeValueId
            };
          });
          const form = {
            ...this.formData,
            attributeValueList: list,
            attributeId: this.moduleData.attributeId
          };
          this.axios.post(api[form.attributeClassifyId ? 'attributeEditAttribute' : 'attributeAddAttribute'], form).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功');
              this.pageParams.pageNum = 1;
              this.pageParamsStatus = true;
              this.showAttribute = false;
              this.cancelAttribute();
              return;
            }
            if (res.data.code == 500000) {
              this.$Message.error('该属性已存在，请修改属性名称');
            }
            v.error();
          }).catch(() => {
            v.error();
          });
          // v.error()
        },
        error: () => {
          this.showAttribute = true;
          this.loadingAttribute = false;
          setTimeout(() => {
            this.loadingAttribute = true;
          }, 100);
        }
      };
      this.$refs.formValidate.validate((valid) => {
        valid ? v.hand() : v.error();
      });
      // v.error()
    },
    // 关闭编辑属性窗口
    cancelAttribute () {
      this.$refs.formValidate.resetFields();
      this.$set(this.formError, 'attributeValueList', {});
      this.$nextTick(() => {
        Object.keys(this.formData).forEach(key => {
          this.formData[key] = key == 'attributeValueList' ? [{ cnValue: '', enValue: '', index: 1 }] : '';
        });
      });
    },
    // 删除属性值行
    deleteFormRow (index) {
      // 需要第二次点击才可以删除
      // if(this.formError.attributeValueList[index]) {
      //   // 判断下一条是否已点击过删除
      //   this.formData.attributeValueList.splice(index, 1);
      //   if(!this.formError.attributeValueList[index + 1]) {
      //     this.$set(this.formError.attributeValueList, index, false);
      //   } else {
      //     this.$set(this.formError.attributeValueList, this.formData.attributeValueList.length - 1, false);
      //   }
      // } else {
      //   this.$set(this.formError.attributeValueList, index, true);
      // }
      Object.keys(this.formError.attributeValueList).forEach(key => {
        key != index && this.$set(this.formError.attributeValueList, key, false);
      });
      this.$nextTick(() => {
        if (this.formError.attributeValueList[index]) {
          this.formData.attributeValueList.splice(index, 1);
        } else {
          this.$set(this.formError.attributeValueList, index, true);
        }
      });
    },
    // 新增属性值行
    addFormRow () {
      this.valueChange();
      this.formData.attributeValueList.push({
        cnValue: '',
        enValue: '',
        index: this.formData.attributeValueList.length + 1
      });
    },
    valueChange () {
      this.$set(this.formError, 'attributeValueList', {});
    },
    // 验证
    validateEnName (rule, value, callback) {
      if (!value) {
        return callback(new Error('此项不能为空'));
      }
      const regex = /.*[\u4e00-\u9fa5]+.*$/;
      const field = rule.field.split('.');
      if (regex.test(value) && (field.includes('enValue') || field.includes('enName'))) {
        return callback(new Error('不能含有汉字'));
      }
      let isHas = false;
      if (field.includes('attributeValueList')) {
        this.formData.attributeValueList.forEach((item, index) => {
          if (field[1] != index) {
            if (field[2] == 'enValue' && item.enValue == value) {
              isHas = true;
            } else if (field[2] == 'cnValue' && item.cnValue == value) {
              isHas = true;
            }
          }
        });
      }
      if (isHas) {
        return callback(new Error('此名称已存在，请勿重复输入'));
      }
      callback();
    }
  }
};
</script>
<style scoped lang="less">
.attribute-detail-form-modal{
  .form-style{
    max-height: calc(100vh - 330px);
    min-height: 200px;
    padding-right: 10px;
    overflow: auto;
  }
  .form-list-item{
    display: inline-block;
    cursor: pointer;
    color: #2d8cf0;
  }
  .form-error-text{
    position: absolute;
    width: 100%;
    height: 25px;
    left: 0;
    bottom: -25px;
    font-size: 12px;
    color: #f20;
    background: #fff;
    line-height: 1.8em;
  }
}
</style>
