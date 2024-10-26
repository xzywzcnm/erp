<template>
  <div>
    <Modal
      v-model="isVisible"
      :title="`${isOperate ? '管理' : '打印'}第三方标签`"
      :mask-closable="false"
      class-name="edit-modal-box"
    >
      <div class="edit-modal-contain">
        <Form
          ref="editModalContain"
          :model="formData"
          :rules="ruleValidate"
          :label-width="100"
        >
          <div class="form-row-item">
            <FormItem label="标签名称:" prop="overseaTagId">
              <dyt-select
                v-model="formData.overseaTagId"
                placeholder="请选择第三方标签"
                @on-open-change="overseaTagOpenChange"
                :clearable="false"
                :disabled="isPrinting && !isOperate"
              >
                <Option
                  v-for="(item, index) in Object.values(thirdpartyTagObj)"
                  :value='item.overseaTagId'
                  :key="`status-${index}`"
                  @click.native="overseaTagChange(item.overseaTagId)"
                >{{item.name}}</Option>
              </dyt-select>
            </FormItem>
            <div class="button-line-groups item-left-spance" v-if="isOperate">
              <Button
                type="text"
                class="button-item button-primary"
                @click="addOrEditThirdparty('add')"
                :loading="addLoading"
                v-if="permission.add"
              >增加</Button>
              <Button
                type="text"
                class="button-item button-primary"
                @click="addOrEditThirdparty('edit')"
                v-if="formData.overseaTagId && permission.edit"
                :loading="editLoading"
              >编辑</Button>
              <Button
                type="text"
                class="button-item button-error"
                @click="deleteThirdparty"
                v-if="formData.overseaTagId && permission.delete"
                :loading="deleteLoading"
              >
                删除
              </Button>
            </div>
          </div>
          <div class="form-row-item" v-if="!isOperate">
            <FormItem label="打印数量:" prop="printNumber">
              <dytInput v-model="formData.printNumber" placeholder="请输入打印数量" />
            </FormItem>
          </div>
          <div class="form-row-item-table" style="margin-bottom: 24px;" v-if="formData.overseaTagId">
            <div class="item-spance">
              <label>标签类型：</label>
              {{ tagType }}
            </div>
            <div class="item-spance">
              <label>标签大小：</label>
              {{ tagSize }}
            </div>
          </div>
          <div class="form-row-item-table" style="margin-bottom: 24px;">
            <div class="item-spance">
              <label>SPU：</label>
              {{ moduleData.spu || '' }}
            </div>
            <div class="item-spance">
              <label>名称：</label>
              {{ moduleData.cnName || '' }}
            </div>
          </div>
          <div class="form-row-item" style="display: none;">
            <div class="not-padding">
              <!-- accept="image/*,application/pdf" -->
              <dytUpload
                :action="uploadPath"
                :before-upload="beforeUpload"
                :headers="uploadHeader"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                accept="application/pdf"
                :show-upload-list="false"
                :disabled="isUploadLoading"
              >
                <Button icon="ios-cloud-upload-outline" type="primary" class="form-upload-file" :disabled="isUploadLoading">请选择文件</Button>
              </dytUpload>
            </div>
          </div>
        </Form>
        <div>
          <div class="table-operate">
            <div>
              <div v-if="isOperate && $common.isEmpty(formData.overseaTagId)" style="color:#f60; line-height:32px;">
                选择标签后才可对SKU进行绑定操作
                <span style="padding-left: 5px; font-size: 20px;font-weight: bold;">↓</span>
              </div>
            </div>
            <div>
              <Button type="primary" @click="getTableListData" :disabled="tableLoading || (isPrinting && !isOperate)">刷新列表</Button>
            </div>
          </div>
          <Table
            highlight-row
            border
            :height="isOperate ? 500 : 450"
            :columns="tableColumns"
            :data="tableData"
            :loading="tableLoading"
          />
        </div>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">取 消</Button>
        <Button
          type="primary"
          @click="bindThirdpartySubmit(false)"
          :disabled="$common.isEmpty(formData.overseaTagId) || !tableChange"
        >确 定</Button>
      </div>
      <Spin fix v-if="addTagLoading">正在处理数据中....</Spin>
    </Modal>
    <Modal
      v-model="openEditThirdparty"
      :title="`${editType === 'add' ? '增加' : '编辑'}标签名称`"
      :mask-closable="false"
      class-name="edit-thirdparty-box"
    >
      <Form ref="editThirdpartyTag" :model="editFormData" :rules="editFormRule" :label-width="100">
        <div class="form-row-item">
          <FormItem label="标签名称:" prop="name">
            <dytInput v-model.trim="editFormData.name" placeholder="请输入标签名称" />
          </FormItem>
          <div class="item-spance error-tips">
            建议：标签名称使用标签类型与店铺名称一起命名，如：TEMU- Fancy Vity
          </div>
        </div>
        <div class="form-row-item">
          <FormItem label="标签类型:" prop="type">
            <dytInput v-model.trim="editFormData.type" placeholder="请输入标签类型" />
          </FormItem>
          <div class="item-spance error-tips">
            建议：填写正确的标签类型，如：TEMU
          </div>
        </div>
        <div class="form-row-item">
          <FormItem label="标签大小:" prop="frontLength">
            <dytInput v-model.trim="editFormData.frontLength" placeholder="请输入大于0的整数" />
          </FormItem>
          <span class="item-top-spance">mm * </span>
          <FormItem label=" " prop="afterLength" :label-width="1" class="hidden-label">
            <dytInput v-model.trim="editFormData.afterLength" placeholder="请输入大于0的整数" />
          </FormItem>
          <span class="item-top-spance">mm</span>
        </div>
      </Form>
      <div slot="footer">
        <Button @click="openEditThirdparty = false">取 消</Button>
        <Button type="primary" @click="saveThirdparty">确 定</Button>
      </div>
      <Spin fix v-if="editLoading || addLoading"></Spin>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import JsPdf from 'jspdf';
import { createPdf } from '@/utils/createPdf';

export default {
  name: "thirdpartyTagManage",
  components: {},
  mixins: [Mixin],
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    // 视图类型
    viewType: { type: String, default: 'operate' },
    moduleData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  data () {
    return {
      modalLoading: false,
      isUploadLoading: false,
      tableLoading: false,
      oldOverseaTagId: '',
      selectRowIndex: null,
      addLoading: false,
      editLoading: false,
      deleteLoading: false,
      openEditThirdparty: false,
      addTagLoading: false,
      isPrinting: false,
      printIndex: 1,
      editType: 'add',
      // 表单默认数据
      formData: {
        productGoodsId: '', // 商品货品流水号
        overseaTagId: '', // 海外仓标签id
        // platformSku: '', // 平台id
        barCode: '', // 条码编码
        fileName: '', // 文件名
        filePath: '', // 文件路径
        printNumber: 1 // 打印数量
      },
      // 表单验证
      ruleValidate: {
        // overseaTagId: [
        //   { required: true, validator: this.validatorOverseaTagId, msg: '请选择标签', trigger: 'change' }
        // ],
        printNumber: [
          { required: true, msg: '请输入打印数量', validator: this.requiredNumber, trigger: 'change', type: 'number' },
          { required: true, msg: '请输入打印数量', validator: this.requiredNumber, trigger: 'blur', type: 'number' }
        ]
      },
      // 第三方标签表单
      editFormData: {
        overseaTagId: '',
        name: '',
        type: '',
        frontLength: null,
        afterLength: null
      },
      // 第三方标签表单验证
      editFormRule: {
        name: [
          { required: true, formKey: 'editFormData', msg: '请输入标签名称', ortherMsg: '标签名称不能超过50字符', validator: this.requiredMaxFifty, trigger: 'change' },
          { required: true, formKey: 'editFormData', msg: '请输入标签名称', ortherMsg: '标签名称不能超过50字符', validator: this.requiredMaxFifty, trigger: 'blur' }
        ],
        type: [
          { required: true, formKey: 'editFormData', msg: '请输入标签类型', ortherMsg: '标签类型不能超过50字符', validator: this.requiredMaxFifty, trigger: 'change' },
          { required: true, formKey: 'editFormData', msg: '请输入标签类型', ortherMsg: '标签类型不能超过50字符', validator: this.requiredMaxFifty, trigger: 'blur' }
        ],
        frontLength: [
          { required: true, msg: '请输入标签宽度', validator: this.requiredNumber, trigger: 'change' },
          { required: true, msg: '请输入标签宽度', validator: this.requiredNumber, trigger: 'blur' }
        ],
        afterLength: [
          { required: true, msg: '请输入标签高度', validator: this.requiredNumber, trigger: 'change' },
          { required: true, msg: '请输入标签高度', validator: this.requiredNumber, trigger: 'blur' }
        ],
      },
      isVisible: false,
      uploadPath: api.uploadThirdpartyTagFile,
      thirdpartyTagObj: {},
      tableColumns: [
        {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          minWidth: 125
        },
        {
          title: '规格',
          key: 'specification',
          align: 'center',
          minWidth: 125
        },
        {
          title: '条码编码',
          key: 'barCode',
          align: 'center',
          width: 270,
          render: (h, { row, index }) => {
            if (this.isOperate) {
              if (this.$common.isEmpty(this.formData.overseaTagId)) return h('span', '');
              let inputVal = this.$common.isEmpty(row.barCode) ? '' : row.barCode;
              const isPass = this.barCodeValidator(row.barCode);
              let item = [h('Input', {
                props: {
                  clearable: true,
                  placeholder: '请输入条码编码，需控制在50个字符以内',
                  value: row.barCode,
                  disabled: !this.$common.isEmpty(row.barCode) && isPass.success
                },
                on: {
                  input: (val) => {
                    inputVal = val;
                  },
                  'on-blur': () => {
                    this.$set(this.tableData[index], 'barCode', inputVal);
                    this.$set(this.tableData[index], 'isChange', !this.$common.isEmpty(inputVal));
                    // const tableData = this.$common.copy(this.tableData);
                    // this.$nextTick(() => {
                    //   this.tableData = tableData;
                    // })
                  },
                  'on-enter': () => {
                    this.$set(this.tableData[index], 'barCode', inputVal);
                    this.$set(this.tableData[index], 'isChange', !this.$common.isEmpty(inputVal));
                    // const tableData = this.$common.copy(this.tableData);
                    // this.$nextTick(() => {
                    //   this.tableData = tableData;
                    // })
                  }
                }
              })];
              !isPass.success && item.push(h('div', {
                style: {
                  'text-align': 'left',
                  'color': '#f20',
                  'font-size': '12px'
                }
              }, isPass.msg));

              return h('div', {
                style: {
                  'padding': '5px 0'
                }
              }, item);
            }
            return h('span', row.barCode || '');
          }
        },
        {
          title: '第三方标签文件',
          key: 'fileName',
          align: 'center',
          minWidth: 200,
          render: (h, { row, index }) => {
            // this.$common.isEmpty(row.filePath)
            if (this.$common.isEmpty(this.formData.overseaTagId)) return h('span', '');
            return h('span', {
              style: {
                'color': '#2d8cf0',
                'text-decoration': 'underline',
                'cursor': 'pointer'
              },
              on: {
                click: () => {
                  if (this.$common.isEmpty(row.productOverseaTagId)) {
                    this.selectFile(index);
                  } else {
                    this.previewPdfFile(row);
                  }
                }
              }
            }, row.fileName || (this.isOperate ? '请选择文件' : '标签文件'))
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: 150,
          // fixed: 'right',
          align: 'center',
          render: (h, { row, index }) => {
            if (this.isOperate) {
              if (this.$common.isEmpty(row.filePath) && this.$common.isEmpty(row.barCode)) return h('span', '');
              return h('Button', {
                props: {
                  type: 'text',
                  size: 'small',
                  loading: row.deleteLoading
                },
                style: {
                  'color': '#f20',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    this.deleteTableRow(row, index)
                  }
                }
              }, '删除标签')
            }
            return h('Button', {
              props: {
                type: 'text',
                size: 'small',
                loading: this.isPrinting
              },
              style: {
                'color': '#2d8cf0',
                'cursor': 'pointer'
              },
              on: {
                click: () => {
                  this.printTableRow(row)
                }
              }
            }, '打印')
          }
        }
      ],
      tableData: [],
    };
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    },
    moduleData: {
      immediate: true,
      deep: true,
      handler (val) {
        this.formData = { ...this.$common.copy(val), printNumber: 1 };
      }
    },
    openEditThirdparty (val) {
      if (val) return;
      this.$nextTick(() => {
        this.$refs.editThirdpartyTag && this.$refs.editThirdpartyTag.resetFields();
      })
    }
  },
  computed: {
    // 权限
    permission () {
      return {
        add: this.getPermission('thirdpartyTagManage_add'),
        edit: this.getPermission('thirdpartyTagManage_edit'),
        delete: this.getPermission('thirdpartyTagManage_delete')
      }
    },
    // 是否可操作
    isOperate () {
      return this.viewType === 'operate'
    },
    // 上传组件头部信息
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    productGoodsId () {
      if (this.$common.isEmpty(this.moduleData)) return '';
      return this.moduleData.productGoodsId;
    },
    // 选中的 tag
    selectTag () {
      if (this.$common.isEmpty(this.thirdpartyTagObj[this.formData.overseaTagId])) return {};
      return this.thirdpartyTagObj[this.formData.overseaTagId];
    },
    // 标签类型
    tagType () {
      if (this.$common.isEmpty(this.selectTag)) return '';
      return this.selectTag.type || '';
    },
    // 标签大小
    tagSize () {
      if (this.$common.isEmpty(this.selectTag)) return '';
      const frontLength = this.selectTag.frontLength || '0';
      const afterLength = this.selectTag.afterLength || '0';
      return `${frontLength}mm*${afterLength}mm`;
    },
    // 第三方标签下拉
    isTableHasSelectTag () {
      if (this.$common.isEmpty(this.selectTag)) return false;
      const tableHasTag = this.tableData.find(item => this.selectTag.name == item.overseaTagName);
      return !this.$common.isEmpty(tableHasTag);
    },
    // 列表数据是否有更改
    tableChange () {
      const findChangeData = this.tableData.find(item => {
        return item.isChange === true;
      })
      return !this.$common.isEmpty(findChangeData);
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      this.initData();
    },
    // 关闭前（目前安装的版本不支持）
    // modalCloseBefore () {
    //   return new Promise(() => {})
    // },
    // 关闭弹窗
    closeModal () {
      this.modalLoading = false;
      this.isUploadLoading = false;
      this.tableLoading = false;
      this.addLoading = false;
      this.editLoading = false;
      this.deleteLoading = false;
      this.openEditThirdparty = false;
      this.addTagLoading = false;
      this.isPrinting = false;
      this.printIndex = 1;
      this.editType = 'add';
      this.isVisible = false;
      this.thirdpartyTagObj = {};
      this.tableData = [];
      this.oldOverseaTagId = '';
      this.selectRowIndex = null;
      this.formData.filePath = '';
      this.formData.fileName = '';
      this.formData.printNumber = 1;
      this.$nextTick(() => {
        this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        this.$nextTick(() => {
          this.$refs.editModalContain && this.$refs.editModalContain.resetFields();
        })
      })
    },
    initData () {
      this.modalLoading = true;
      this.$common.promiseAll([
        () => this.getTagList,
        () => this.getTableListData
      ]).then((resArr) => {
        // console.log(resArr);
      }).finally(() => {
        this.modalLoading = false;
      })
    },
    // 获取所有海外仓标签
    getTagList () {
      return new Promise((resolve) => {
        this.thirdpartyTagObj = {};
        this.axios.post(api.postTagList).then(({ data }) => {
          if (data.code !== 0 || !data.datas) {
            return resolve([]);
          }
          (data.datas || []).forEach(item => {
            this.$set(this.thirdpartyTagObj, item.overseaTagId, item);
          })
          resolve(data.datas || []);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 文件上传前
    beforeUpload (file) {
      if (this.isUploadLoading || this.$common.isEmpty(this.selectRowIndex)) return false;
      // if (file.type.includes('application/pdf') || file.type.includes('image/')) {
      if (file.type.includes('application/pdf')) {
        this.isUploadLoading = true;
        return true;
      }
      // this.$Message.error('文件格式不对，请上传图片或 PDF 文件');
      this.$Message.error('文件格式不对，请上传 PDF 文件');
      return false;
    },
    // 文件上传成功
    uploadSuccess (response, file, fileList) {
      this.isUploadLoading = false;
      if (response.code !== 0 || !response.datas) return;
      this.formData.filePath = response.datas.filePath || '';
      this.formData.fileName = response.datas.fileName || '';
      this.$set(this.tableData[this.selectRowIndex], 'filePath', response.datas.filePath || '');
      this.$set(this.tableData[this.selectRowIndex], 'fileName', response.datas.fileName || '');
      this.$set(this.tableData[this.selectRowIndex], 'isChange', true);
    },
    // 文件上传失败
    uploadError (error, file, fileList) {
      this.isUploadLoading = false;
      this.$Message.error('文件上传失败！');
      console.error(error);
    },
    // 新增sku绑定标签
    addThirdpartyTag () {
      if (this.isTableHasSelectTag) {
        return this.$Message.error(`标签：${this.selectTag.name} 已增加，无法再次增加`);
      }
      if (this.addTagLoading) return;
      this.$refs.editModalContain.validate((valid) => {
        if (!valid) return;
        this.addTagLoading = true;
        this.axios.post(api.insertSkuThirdpartyTag, this.formData).then(({ data }) => {
          this.addTagLoading = false;
          if (!data || data.code != 0) return;
          this.tableLoading = true;
          this.getTableListData().finally(() => {
            this.tableLoading = false;
          })
        }).catch(() => {
          this.addTagLoading = false;
        })
      })
    },
    // 下拉展开收起
    overseaTagOpenChange (isOpen) {
      if (!isOpen || this.$common.isEmpty(this.formData.overseaTagId)) return;
      this.oldOverseaTagId = this.formData.overseaTagId;
    },
    // 选择标签时
    overseaTagChange (id) {
      if (this.$common.isEmpty(this.oldOverseaTagId)) {
        this.oldOverseaTagId = id;
        this.tableLoading = true;
        this.getTableListData().finally(() => {
          this.tableLoading = false;
        })
        return;
      }
      if (this.tableChange) {
        this.$Modal.confirm({
          title: '操作提示',
          content: '存在修改未保存，更改标签名称后未保存的数据将会清空，是否先保存再切换？',
          onOk: () => {
            this.bindThirdpartySubmit(true).then((res) => {
              if (res.staus === 'success') {
                this.tableLoading = true;
                this.getTableListData().finally(() => {
                  this.tableLoading = false;
                })
              } else {
                this.formData.overseaTagId = this.oldOverseaTagId;
              }
            })
          },
          onCancel: () => {
            this.tableLoading = true;
            this.getTableListData().finally(() => {
              this.tableLoading = false;
            })
          }
        })
      } else {
        this.tableLoading = true;
        this.getTableListData().finally(() => {
          this.tableLoading = false;
        })
      }
    },
    // 触发选择文件弹窗
    selectFile (rowIndex) {
      const uploadBtn = document.querySelector('.form-upload-file');
      if (!uploadBtn || this.isUploadLoading) return;
      this.selectRowIndex = rowIndex;
      uploadBtn.click();
    },
    // 获取列表数据
    getTableListData (oldData = []) {
      return new Promise((resolve) => {
        let obj = { overseaTagId: this.formData.overseaTagId || '' };
        if (this.moduleData.openTrigger === 'sku') {
          obj.productGoodsId = this.productGoodsId;
        }
        if (this.moduleData.openTrigger === 'spu') {
          obj.productId = this.moduleData.productId;
        }
        this.axios.post(`${api.getSkuThirdpartyTagListDetail}?${this.$common.getParams(obj)}`).then(({ data }) => {
          let newData = data.datas.map(row => {
            return {
              ...row,
              isChange: false,
              deleteLoading: false
            }
          });
          if (!this.$common.isEmpty(oldData) && this.$common.isArray(oldData)) {
            let idObj = {};
            oldData.forEach((old) => {
              idObj[old.sku] = old;
            })
            newData.forEach((item) => {
              if (!this.$common.isEmpty(idObj[item.sku]) && (this.$common.isEmpty(item.barCode) || this.$common.isEmpty(item.filePath))) {
                if (this.$common.isEmpty(item.barCode)) {
                  item.barCode = idObj[item.sku].barCode;
                }
                if (this.$common.isEmpty(item.filePath)) {
                  item.fileName = idObj[item.sku].fileName;
                  item.filePath = idObj[item.sku].filePath;
                }
                item.isChange = idObj[item.sku].isChange;
              }
            })
          }
          if (!this.isOperate) {
            newData = newData.filter(row => {
              return !this.$common.isEmpty(row.filePath);
            })
          }
          this.tableData = newData;
          resolve(newData);
        }).catch(() => {
          this.tableData = [];
          resolve([]);
        })
      })
    },
    // 必填，字符不超过50个验证
    requiredMaxFifty (rule, value, callback) {
      this.$nextTick(() => {
        let newVal = this.$common.isEmpty(rule.formKey) ? value : this[rule.formKey][rule.field];
        if (this.$common.isEmpty(newVal, true)) {
          return callback(new Error(`${rule.msg || '必填项不能为空'}`));
        }
        if ((newVal.trim()).length > 50) {
          return callback(new Error(`${rule.ortherMsg || '此项不能超过50个字符'}`));
        }
        callback();
      })
    },
    // 条码编码验证
    barCodeValidator (value) {
      if (!this.$common.isEmpty(value) && (value.trim()).length > 50) {
        return { success: false, msg: '条码编码请控制在 50 个字符以内' };
      }
      return { success: true, msg: '' };
    },
    // 验证标签
    validatorOverseaTagId (rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.formData.overseaTagId)) {
          return callback(new Error(`${rule.msg || '必填项不能为空'}`));
        }
        callback();
      })
    },
    // 大于 0 的正整数
    requiredNumber (rule, value, callback) {
      if (this.$common.isEmpty(value, true)) {
        return callback(new Error(`${rule.msg || '必填项不能为空'}`));
      }
      const newVal = Number(value);
      if (this.$common.isEmpty(newVal) || (newVal.toString()).includes('.') || newVal < 0) {
        return callback(new Error('请输入大于0的整数'));
      }
      callback();
    },
    // 打开新增(编辑)第三方标签弹窗
    addOrEditThirdparty (str) {
      this.editType = str;
      if (str === 'edit' && !this.$common.isEmpty(this.selectTag)) {
        this.editFormData = this.$common.copy(this.selectTag);
      }
      this.$nextTick(() => {
        this.openEditThirdparty = true;
      })
    },
    // 绑定第三方标签
    bindThirdpartySubmit (isColseModal = false) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.addTagLoading) return resolve({ staus: 'saveing' });
          const selectTagId = isColseModal ? this.oldOverseaTagId : this.formData.overseaTagId;
          if (this.$common.isEmpty(selectTagId)) {
            this.$Message.error('请选择标签名称后再做此操作');
            return resolve({ staus: 'fail' });
          }
          this.addTagLoading = true;
          let errorList = '';
          const submitData = this.tableData.filter((row) => {
            return row.isChange === true;
          }).map((item) => {
            if (!this.$common.isEmpty(item.barCode) || !this.$common.isEmpty(item.filePath)) {
              if (this.$common.isEmpty(item.barCode)) {
                errorList += `<p>${item.sku} 需填写条码编码</p>`;
              } else if (this.$common.isEmpty(item.filePath)) {
                errorList += `<p>${item.sku} 需上传第三方标签文件</p>`;
              } else if (!this.$common.isEmpty(item.barCode)) {
                const isPass = this.barCodeValidator(item.barCode);
                if (!isPass.success) {
                  errorList += `<p>${item.sku} 的${isPass.msg}</p>`;
                }
              }
            }

            return {
              productGoodsId: item.productGoodsId,
              overseaTagId: selectTagId,
              barCode: item.barCode,
              fileName: item.fileName,
              filePath: item.filePath
            }
          });

          if (!this.$common.isEmpty(errorList)) {
            this.addTagLoading = false;
            this.$Modal.warning({
              title: '验证不通过，存在填写不规范',
              content: errorList,
              onOk: () => {}
            });
            return resolve({ staus: 'fail' });
          }
          this.axios.post(api.addBatchInsertThirTag, submitData).then((res) => {
            this.oldOverseaTagId = '';
            if (!res || !res.data || res.data.code != 0) return resolve({ staus: 'fail' });
            if (!isColseModal) {
              this.isVisible = false;
            }
            resolve({ staus: 'success' });
          }).catch(() => {
            resolve({ staus: 'fail' });
          }).finally(() => {
            this.addTagLoading = false;
          })
        }, isColseModal ? 500 : 0)
      })
    },
    // 保存(更新)第三方标签
    saveThirdparty () {
      if (this[`${this.editType}Loading`]) return;
      this.$refs.editThirdpartyTag.validate((valid) => {
        if (!valid) return;
        this[`${this.editType}Loading`] = true;
        this.axios.post(`${api[this.editType == 'edit' ? 'updateThirdpartyTag' : 'addThirdpartyTag']}`, this.editFormData).then(({ data }) => {
          if (!data || data.code != 0) return;
          this.$nextTick(() => {
            this.getTagList();
            // if (this.editType == 'edit') {
            //   this.tableLoading = true;
            //   this.getTableListData(this.$common.copy(this.tableData)).finally(() => {
            //     this.tableLoading = false;
            //   })
            // }
            this.openEditThirdparty = false;
          })
        }).finally(() => {
          this[`${this.editType}Loading`] = false;
        })
      })
    },
    // 删除第三方标签
    deleteThirdparty () {
      if (this.deleteLoading || this.$common.isEmpty(this.formData.overseaTagId)) return;
      const deleteInfo = this.selectTag;
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认删除标签：${deleteInfo.name}？`,
        onOk: () => {
          this.deleteLoading = true;
          this.axios.post(`${api.deleteThirdpartyTag}?overseaTagId=${this.formData.overseaTagId}`).then(({ data }) => {
            if (!data || data.code != 0) return;
            this.$set(this.formData, 'overseaTagId', '');
            this.$nextTick(() => {
              this.getTagList();
              this.tableLoading = true;
              this.getTableListData().finally(() => {
                this.tableLoading = false;
              })
            })
          }).finally(() => {
            this.deleteLoading = false;
          })
        },
        onCancel: () => {}
      })
    },
    // 删除表格行
    deleteTableRow (row, index) {
      if (row.deleteLoading) return;
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认删除 ${row.sku} 绑定的第三方标签数据？`,
        onOk: () => {
          if (this.$common.isEmpty(row.productOverseaTagId)) {
            this.$set(this.tableData[index], 'fileName', null);
            this.$set(this.tableData[index], 'filePath', null);
            this.$set(this.tableData[index], 'barCode', null);
            this.$set(this.tableData[index], 'isChange', false);
            return;
          }
          row.deleteLoading = true;
          this.axios.post(`${api.deleteSkuThirdpartyTag}?productOverseaTagId=${row.productOverseaTagId}`).then(({ data }) => {
            if (!data || data.code != 0) return;
            this.$nextTick(() => {
              const oldTableData = this.$common.copy(this.tableData);
              this.tableLoading = true;
              this.getTableListData(oldTableData.filter(oldRow => {
                return row.productOverseaTagId !== oldRow.productOverseaTagId && oldRow.isChange;
              })).finally(() => {
                this.tableLoading = false;
              })
            })
          }).finally(() => {
            row.deleteLoading = false;
          })
        },
        onCancel: () => {}
      })
    },
    // 打印 PDF 文件
    printTableRow (row, type) {
      if (!type && this.isPrinting) {
        return this.$Message.error('正在打印中，请当前打印完成后在操作');
      }
      if (this.$common.isEmpty(row.filePath)) {
        return this.$Message.error('当前数据无标签文件，无法打印');
      }
      if (this.$common.isEmpty(this.formData.printNumber)) {
        if (this.$common.isEmpty(Number(this.formData.printNumber))) {
          return this.$Message.error('打印数量填写有误，请输入大于 0 的整数');
        }
        return this.$Message.error('请输入打印数量');
      }
      const filePath = `${window.location.origin}/product-service/filenode/s${row.filePath}`;
      this.isPrinting = true;
      let pageSze = row.tagSize.split('*');
      pageSze[0] = parseInt(pageSze[0]);
      pageSze[1] = parseInt(pageSze[1]);
      createPdf([{
        ...row,
        width: pageSze[0],
        height: pageSze[1],
        unit: 'mm',
        filePath: filePath,
        page: Number(this.formData.printNumber)
      }],
      {
        replaceKey: {
          data: 'filePath'
        },
        // 处理进度， 返回百分比
        progress: (percent) => {}
      }).then((pass) => {
        this.isPrinting = false;
      });
    },
    // 打印预览标签
    previewPdfFile (row) {
      if (this.$common.isEmpty(row.filePath)) {
        return this.$Message.error('当前数据无标签文件，无法预览');
      }
      const filePath = `${window.location.origin}/product-service/filenode/s${row.filePath}`;
      const postfix = (row.filePath.substring(row.filePath.lastIndexOf('.') + 1, row.filePath.length)).toLocaleLowerCase();
      this.axios.get(filePath, { responseType: 'blob' }).then(res => {
        if (this.$common.isEmpty(res.data) && this.$common.isEmpty(res.resData)) {
          this.$Message.error('获取标签文件失败');
          return;
        }
        this.$common.blobToBase64(res.data || res.resData).then(data => {
          if (postfix !== 'pdf') {
            const img = new Image();
            img.src = window.URL.createObjectURL(res.data || res.resData);
            img.onload = () => {
              let pageSze = row.tagSize.split('*');
              pageSze[0] = img.width ? this.$common.pxToMm(img.width) : parseInt(pageSze[0]);
              pageSze[1] = img.height ? this.$common.pxToMm(img.height) : parseInt(pageSze[1])
              const doc = new JsPdf(pageSze[0] > pageSze[1] ? 'landscape' : 'portrait', 'mm', pageSze);
              doc.addImage(data, 'JPEG', 0, 0, pageSze[0], pageSze[1]);
              this.$common.previewFile(doc.output('blob'));
            }
          } else {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          }
        }).catch((err) => {
          this.$Message.error('获取标签文件失败');
          console.error(err);
        })
      }).catch((err) => {
        this.$Message.error('获取标签文件失败');
        console.error(err);
      })
    },
    // 下载 PDF 文件
    downPdfFile (row) {
      if (this.$common.isEmpty(row.filePath)) {
        return this.$Message.error('当前数据无标签文件，无法下载');
      }
      const newUrl = `${window.location.origin}/product-service/filenode/s${row.filePath}`;
      let newName = row.fileName;
      const fileSuffix = (row.fileName.substring(row.fileName.lastIndexOf('.') + 1, row.fileName.length)).toLocaleLowerCase();
      if (fileSuffix === 'pdf') {
        newName = row.fileName.substring(0, row.fileName.lastIndexOf('.'));
      }
      this.$common.downloadFile(newUrl, { name: newName, suffix: 'pdf' });
    }
  }
};
</script>
<style lang="less" scoped>
:deep(.edit-modal-box){
  .ivu-modal{
    top: 60px;
    width: 80% !important;
    max-width: 1400px;
    min-width: 900px;
    .ivu-modal-body{
      max-height: calc(100vh - 200px);
    }
  }
  .ivu-modal-body{
    padding: 0
  }
  .ivu-input[disabled] {
    color: #878787;
  }
}
:deep(.edit-thirdparty-box) {
  .ivu-modal{
    top: 100px;
    width: 70% !important;
    max-width: 1200px;
    min-height: 800px;
  }
}
.edit-modal-contain{
  position: relative;
  max-height: calc(100vh - 200px);
  padding: 16px 16px 0px 16px;
  overflow: auto;
}
.form-row-item-table{
  display: flex;
  width: 700px;
  .item-spance{
    flex: 50;
    // display: inline-block;
    padding-top: 0;
    padding-left: 15px;
    padding-right: 15px;
    margin-left: 0;
    label {
      display: inline-block;
      width: 100px;
      text-align: right;
    }
    &:first-child{
      padding-left: 0;
    }
    &:last-child{
      padding-right: 0
    }
    // margin-right: 30px;
    // width: 50%;
  }
}
.form-row-item{
  display: flex;
  .hidden-label{
    :deep(.ivu-form-item-label){
      display: none;
    }
  }
  :deep(.ivu-form-item-content){
    min-width: 200px;
    max-width: 400px;
    line-height: 1.2em;
  }
  .upload-file-item{
    :deep(.ivu-form-item-content){
      min-width: auto;
      .ivu-form-item-error-tip{
        top: calc(100% + 20px);
        white-space: nowrap;
      }
    }
  }
}
.item-left-spance{
  margin-left: 30px;
}
.item-top-spance{
  padding: 6px 3px 0 3px;
}
.item-spance{
  padding-top: 6px;
  margin-left: 30px;
  &.not-padding{
    padding: 0
  }
}
.error-tips{
  color: #f20;
}
.button-line-groups{
  .button-item{
    margin: 0 0 6px 8px;
    cursor: pointer;
    &:focus {
      box-shadow: none;
    }
    &:first-child{
      margin: 0 0 6px 0;
    }
    &.button-primary{
      color: #57a3f3;
    }
    &.button-error{
      color: #f20;
    }
  }
}
.table-operate{
  display: flex;
  padding: 0 10px 10px 10px;
  justify-content: space-between;
  :deep(.ivu-form-item) {
    margin-bottom: 15px;
    .ivu-form-item-error-tip{
      padding-top: 2px;
      font-size: 12px;
    }
  }
}
.ivu-modal-body {
  position: relative;
  .ivu-modal-confirm-footer{
    position: sticky;
    bottom: -16px;
    padding: 20px 0;
    text-align: right;
    background: #fff;
  }
}
</style>
