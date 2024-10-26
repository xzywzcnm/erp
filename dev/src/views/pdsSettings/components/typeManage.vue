<template>
    <div class="mainBox">
        <div class="operaBtn">
        <Button type="primary" v-if="getPermission('pdsSettings_typeManage_add')" @click="addNewType">新增类型</Button>
       </div>
       <div class="mt10">
        <Table :columns="columns" :data="tableList" height="750" border :loading="tableLoading" highlight-row>
          <template slot="skuGenerateRules" slot-scope="{row}">
            <span v-if="row.skuGenerateRules === '0'">服装类</span>
            <span v-else>非服装类</span>
          </template>
        </Table>
        <div style="text-align:right;padding-right:10px">
          <Page :total="total" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer
          :page-size-opts="typePageArray" @on-change="changeTypePageNum" @on-page-size-change="changeTypePageSize" placement="top">
          </Page>
        </div>
       </div>
       <!-- 新增类型 -->
       <Modal v-model="addModelVisible" title="新增分类类型" :mask-closable="false" width="620">
        <div class="form-contain">
         <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
            <FormItem label="分类类型" prop="configName">
                <dyt-input style="width:370px" v-model="formValidate.configName" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="开始字符" prop="startChar">
                <dyt-input style="width:370px" v-model="formValidate.startChar" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="SPU位数" prop="spuLength">
                <dyt-input style="width:370px" v-model="formValidate.spuLength" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="SKU生成规则"   prop="skuGenerateRules">
              <dyt-select style="width:210px" v-model="formValidate.skuGenerateRules" transfer>
            <Option v-for="(item,index) in generateRuleOptions" :key="index" :value="item.value">{{ item.lable }}</Option>
          </dyt-select>
            </FormItem>
          </Form>
        </div>
        <div slot="footer">
            <Button @click="closeModal('add')">取消</Button>
            <Button type="primary" @click="confirmType('add')" :loading="loading">确定</Button>
       </div>
       </Modal>
       <!-- 编辑类型 -->
       <Modal v-model="editModelVisible" title="编辑分类类型" :closable="false" :mask-closable="false" width="620">
        <div class="form-contain">
         <Form ref="editFormValidate" :model="editFormValidate" :rules="ruleValidate" :label-width="100">
            <FormItem label="分类类型" prop="configName">
                <dyt-input style="width:370px" v-model="editFormValidate.configName" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="开始字符" prop="startChar">
                <dyt-input style="width:370px" v-model="editFormValidate.startChar" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="SPU位数" prop="spuLength">
                <dyt-input style="width:370px" v-model="editFormValidate.spuLength" placeholder="请输入"></dyt-input>
            </FormItem>
            <FormItem label="SKU生成规则"   prop="skuGenerateRules">
              <dyt-select style="width:210px" v-model="editFormValidate.skuGenerateRules" transfer>
            <Option v-for="(item,index) in generateRuleOptions" :key="index" :value="item.value">{{ item.lable }}</Option>
          </dyt-select>
            </FormItem>
          </Form>
        </div>
        <div slot="footer">
            <Button @click="closeModal('edit')">取消</Button>
            <Button type="primary" @click="confirmType('edit')" :loading="loading">确定</Button>
       </div>
       </Modal>
    </div>
</template>
<script>
import api from '@/api/api.js';
import Mixin from '@/components/mixin/common_mixin';
export default {
  name: 'typeManage',
  mixins: [Mixin],
  data () {
    return {
      columns: [
        {
          title: '序号',
          type: "index",
          width: "100"
        },
        {
          title: '分类类型',
          key: 'configName'
        },
        {
          title: 'SKU生成规则',
          slot: "skuGenerateRules",
          width: "150"
        },
        {
          title: '开始字符',
          key: 'startChar'
        },
        {
          title: 'SPU位数',
          key: 'spuLength'
        },
        {
          title: '当前SPU数值',
          key: 'spuValue'
        },
        {
          title: '创建人',
          key: 'userName'
        },
        {
          title: '创建时间',
          key: 'createdTime'
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              this.getPermission('pdsSettings_typeManage_edit') ? h('Button', {
                props: {
                  size: 'default'
                },
                style: {
                  marginRight: '8px'
                },
                on: {
                  click: () => {
                    this.openEditTypeModal(params.row)
                  }
                }
              }, '编辑') : '', this.getPermission('pdsSettings_typeManage_delete') ? h('Button', {
                props: {
                  size: 'default'
                },
                on: {
                  click: () => {
                    this.delType(params.row)
                  }
                }
              }, '删除') : ''
            ]);
          }
        }
      ],
      tableList: [],
      tableLoading: false,
      loading: false,
      pageParams: {
        pageSize: 50,
        pageNum: 1,
      },
      total: 0,
      typePageArray: [10, 20, 50, 100],
      addModelVisible: false,
      editModelVisible: false,
      delModdelVisible: false,
      formValidate: {
        configName: '',
        startChar: '',
        spuLength: '',
        skuGenerateRules: ''
      },
      ruleValidate: {
        configName: [
          { required: true, max: 50, message: '最长50字符', trigger: 'blur' },
        ],
        startChar: [
          { required: true, max: 10, message: '最长10字符', trigger: 'blur' },
          { validator: this.validateConfigName, trigger: 'blur' }
        ],
        spuLength: [
          { required: true, max: 1, message: '最长1个字符', trigger: 'blur' }
        ],
        skuGenerateRules: [
          { required: true, message: '请选择', trigger: 'blur' },
        ]
      },
      editFormValidate: {
        configName: '',
        startChar: '',
        spuLength: '',
        skuGenerateRules: ''
      },
      generateRuleOptions: [
        { lable: '服装类', value: '0' },
        { lable: '非服装类', value: '1' },
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取分类类型列表
    getList () {
      if (this.getPermission('pdsSettings_typeManage_query')) {
        this.tableLoading = true;
        let obj = {
          pageNum: this.pageParams.pageNum,
          pageSize: this.pageParams.pageSize,
        }
        this.axios
          .post(api.queryProductTypeList, obj)
          .then(({ data }) => {
            if (data.code === 0) {
              this.tableList = data.datas.list
              this.total = data.datas.total
            }
          }).finally(() => {
            this.tableLoading = false;
          })
      }
    },
    changeTypePageNum(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    changeTypePageSize (pageSize) {
      this.pageParams.pageSize = pageSize;
      this.getList();
    },
    addNewType() {
      this.formValidate = {
        configName: '',
        startChar: '',
        spuLength: ''
      }
      this.addModelVisible = true
    },
    // 校验只允许数字和英文字母
    validateConfigName(rule, value, callback) {
      const reg = /^[0-9a-zA-Z]{1,10}$/;
      if (!reg.test(value)) {
        callback(new Error('只支持数字+英文字母'));
      } else {
        callback();
      }
    },
    // 新增确认提交
    confirmType(type) {
      if (type === 'add') {
        this.$refs.formValidate.validate(valid => {
          if (valid) {
          // 校验通过，提交表单
            let obj = {
              configName: this.formValidate.configName,
              startChar: this.formValidate.startChar,
              spuLength: this.formValidate.spuLength,
              skuGenerateRules: this.formValidate.skuGenerateRules
            }
            this.loading = true
            this.axios.post(api.addProductType, obj).then(({ data }) => {
              if (data.code === 0) {
                this.$Message.success('新增成功')
                this.addModelVisible = false
                this.getList()
              }
              this.loading = false
            }).finally(() => {
              this.addModelVisible = false
              this.loading = false
            })
          }
        });
      } else {
        this.$refs.editFormValidate.validate(valid => {
          if (valid) {
          // 校验通过，提交表单
            let obj = {
              configName: this.editFormValidate.configName,
              startChar: this.editFormValidate.startChar,
              spuLength: this.editFormValidate.spuLength,
              configId: this.editFormValidate.configId,
              skuGenerateRules: this.editFormValidate.skuGenerateRules
            }
            this.loading = true
            this.axios.post(api.editProductType, obj).then(({ data }) => {
              if (data.code === 0) {
                this.$Message.success('编辑成功')
                this.editModelVisible = false
              }
              this.loading = false
              this.getList()
            }).finally(() => {
              this.editModelVisible = false
              this.loading = false
            })
          }
        });
      }
    },
    // 打开编辑分类类型
    openEditTypeModal(val) {
      this.editFormValidate = val
      this.editModelVisible = true
    },
    // 删除类型
    delType(val) {
      this.$Modal.confirm({
        title: '操作提示',
        content: `<p>确认删除分类类型:<span style="color:red;margin-left:3px;font-weight:400"> ${val.configName}</span></p>`,
        onOk: () => {
          let params = val.configId
          this.axios.post(api.deleteProductType, params).then(({ data }) => {
            if (data.code === 0) {
              this.$Message.success('删除成功')
              this.getList()
            }
            this.loading = false
          }).finally(() => {
          })
        },
        onCancel: () => {
        }
      });
    },
    closeModal(type) {
      if (type === 'add') {
        this.addModelVisible = false
      } else {
        this.editModelVisible = false
      }
      this.getList()
    }
  },
}
</script>
<style>

</style>
