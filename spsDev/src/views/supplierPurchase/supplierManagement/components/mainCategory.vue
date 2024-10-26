<style scoped >

</style>
<template >
  <div >
    <div class="flexBox spaceBetween normalTop20" >
      <div class="tableControl" >
        <Button
            type="primary"
            v-if="getPermission('supplierCategory_create')"
            @click="addMainPro"
            class="iconbuttons"
            style="margin-left: 12px;width: 100px;" >
          新增 </Button >
        <Button
            type="primary"
            v-if="getPermission('supplierCategory_batchRemove')"
            @click="deleteProFn(null)"
            class="iconbuttons"
            style="margin-left: 12px;width: 100px;" >
          删除 </Button >
        <Button
            type="primary"
            v-if="getPermission('supplierCategory_batchImport')"
            @click="importExcel = true"
            class="iconbuttons"
            style="margin-left: 12px;width: 100px;" >
          批量导入 </Button >
      </div >
    </div >
    <div class="commonFilter normalTop20" >
      <div class="orderTable" >
        <keep-alive >
          <Table
              ref="mainProTable"
              highlight-row
              :border="true"
              :height="tableHeight"
              :loading="Tableloading"
              :columns="mainProColumn"
              :data="mainProData"
              @on-selection-change="getSelectValue" ></Table >
        </keep-alive >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <keep-alive >
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
                  :page-size-opts="pageArray" ></Page >
            </keep-alive >
          </div >
        </div >
      </div >
    </div >
    <!--新增/编辑供应商-->
    <Modal
        v-model="isShowAddMainPro" :title="isAddMainPro? '新增主营品类' : '编辑主营品类'" :width="560" >
      <div class="normalTop" >
        <Form ref="mainPro" :model="mainPro" :label-width="80" :rules="ruleValidate" >
          <div >
            <FormItem label="名称" prop="categoryName" >
              <Input v-model.trim="mainPro.categoryName" ></Input >
            </FormItem >
          </div >
          <div class="normalTop" >
            <FormItem label="描述" >
              <Input
                  v-model.trim="mainPro.categoryDesc"
                  type="textarea"
                  :rows="5"
                  placeholder="请输入..."
                  :maxlength='500' ></Input >
            </FormItem >
          </div >
        </Form >
      </div >
      <div slot="footer" style="text-align: center;" >
        <Button
            type="primary" @click="save('mainPro')" :loading="saveLoading" >保存 </Button >
        <Button type="primary" @click="isShowAddMainPro = false" >关闭</Button >
      </div >
    </Modal >
    <!--批量导入-->
    <Modal
        v-model="importExcel"
        title="批量导入"
        @on-ok="importExcel=false"
        class-name="verticalCenterModal"
        @on-cancel="importExcel=false"
        :styles="{top: '280px'}"
        width="400" >
      <template v-if="uploadList.length == 0 || (uploadList.length>0 && uploadList[uploadList.length-1].status === 'finished')" >
        <div style="text-align:center;margin:20px 0;" >
          <dytUpload
              ref="import"
              type="drag"
              :format="['XLS','XLSX']"
              :action="batchImport"
              name='file'
              :headers='headObj'
              :on-success='okUpload'
              :on-error='uploadError'
              :show-upload-list='false'
              :onFormatError="formatError" >
            <div style="padding: 20px 0" >
              <Icon type="ios-cloud-upload" size="60" ></Icon >
              <p >导入</p >
            </div >
          </dytUpload >
        </div >
        <div style="text-align:center;" >
          <a href="javascript:void(0)" @click="downloadEcxel()" >下载Excel文件模板</a >
        </div >
      </template >
      <template v-else >
        <div style="text-align: center;margin: 20px 0;" >正在导入品类</div >
        <Progress
            v-if="uploadList[uploadList.length-1].showProgress"
            :percent="uploadList[uploadList.length-1].percentage"
            hide-info ></Progress >
      </template >
      <div slot="footer" >

      </div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    let self = this;
    return {
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(250),
      totalPage: 0,
      total: 0,
      curPage: 1,
      isShowAddMainPro: false,
      isAddMainPro: true,
      importExcel: false, // 批量导入
      batchImport: api.categoryBatchImport, // 导入EXCEL
      uploadList: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        pageFlag: '1'
      },
      newMainPro: {
        categoryDesc: '',
        categoryName: '',
        supplierCategoryId: null
      },
      mainPro: {}, // 新增、编辑供货商
      selectionArr: [], // 已选中表格行数据
      mainProData: [],
      saveLoading: false,
      mainProColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'categoryName',
          align: 'center',
          title: '名称'
        }, {
          key: 'categoryDesc',
          align: 'center',
          title: '描述',
          render: (h, params) => {
            return h('div', {
              style: {
                'overflow': 'hidden',
                'text-overflow': 'ellipsis',
                'white-space': 'nowrap'
              },
              attrs: {
                title: params.row.categoryDesc
              }
            }, params.row.categoryDesc);
          }
        }, {
          key: 'operation',
          align: 'center',
          title: '操作',
          render: (h, params) => {
            let v = this;
            return [
              !v.getPermission('supplierCategory_modify') || h('Button', {
                props: {
                  type: 'dashed'
                },
                on: {
                  click: () => {
                    v.editMainPro(params.row);
                  }
                }
              }, '编辑'), !v.getPermission('supplierCategory_remove') || h('Poptip', {
                props: {
                  'confirm': true,
                  'transfer': true,
                  'title': '确认要删除该行数据吗？'
                },
                style: {
                  'margin-left': '40px'
                },
                on: {
                  'on-ok': () => {
                    self.deleteProFn(params.row.supplierCategoryId);
                    self.$set(self.mainProData[params.index], '_checked', true);
                    self.selectionArr = [];
                    self.selectionArr.push(params.row);
                  }
                }
              }, [
                h('Button', {
                  props: {
                    type: 'dashed'
                  }
                }, '删除')
              ])
            ];
          }
        }
      ],
      ruleValidate: {
        categoryName: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 100,
            message: '不能超过100个字符',
            trigger: 'change'
          }
        ]
      }
    };
  },
  created () {
    this.pageParams.pageSize = this.getPageSizeCache();
  },
  watch: {
    pageParamsStatus (n, o) {
      var v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  activated () {
    this.startLoading();
  },
  mounted () {
    this.uploadList = this.$refs.import.fileList;
  },
  methods: {
    startLoading () {
      var v = this;
      v.$Loading.start();
      v.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      v.Tableloading = true;
      if (!v.getPermission('supplierCategory_query')) {
        v.$Message.error('无权限');
        return;
      }
      v.axios.post(api.query, v.pageParams).then(response => {
        v.Tableloading = false;
        v.total = 0;
        if (response.data.code == 0) {
          v.mainProData = response.data.datas.list;
          v.total = response.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    addMainPro () {
      this.mainPro = Object.assign({}, this.newMainPro);
      this.isAddMainPro = true;
      this.isShowAddMainPro = true;
    },
    editMainPro (val) {
      this.mainPro = Object.assign({}, val);
      this.isAddMainPro = false;
      this.isShowAddMainPro = true;
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    deleteProFn (val) {
      let v = this;
      let categoryIds = [];
      if (val) { // 删除行
        categoryIds.push(val);
      } else {
        if (v.selectionArr.length == 0) {
          v.$Message.error('请选择需要删除的产品');
          return;
        } else {
          v.selectionArr.forEach((n, i) => {
            categoryIds.push(n.supplierCategoryId);
          });
        }
      }
      v.axios.post(api.remove, categoryIds).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('删除成功');
          if (v.mainProData.length == v.selectionArr.length && v.pageParams.pageNum > 1) { // 当前页大于1，且当前页数据被删除完之后，向前一页查询
            v.pageParams.pageNum--;
          }
          v.getList();
        }
      });
    },
    save (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.saveLoading = true;
          if (v.mainPro.supplierCategoryId) { // 有Id时为修改
            v.axios.post(api.modify, v.mainPro).then(res => {
              if (res.data.code == 0) {
                v.$Message.success('保存成功');
                v.getList();
                v.isShowAddMainPro = false;
              }
              v.saveLoading = false;
            });
          } else { // 没有ID时为新增
            v.axios.post(api.create, v.mainPro).then(res => {
              if (res.data.code == 0) {
                v.$Message.success('保存成功');
                v.getList();
                v.isShowAddMainPro = false;
              }
              v.saveLoading = false;
            });
          }
        }
      });
    }, // 文件上传成功的回调
    okUpload (data, file, fileList) {
      let noTSatisfiableStr = data.datas;
      if (data.success) {
        this.$Message.success({
          content: file.name + ' 导入成功 ' + (noTSatisfiableStr && noTSatisfiableStr.length > 0
                                           ? ',其中：' + noTSatisfiableStr + '不符合的要求，已忽略.'
                                           : ''),
          duration: 6,
          closable: true
        });
        this.getList();
        this.importExcel = false;
      } else {
        this.$Message.error(file.name + '导入失败');
      }
    }, // 上传失败回调
    uploadError () {
      this.$Message.error('导入失败');
      this.importExcel = false;
    },
    formatError (file) {
      this.$Notice.warning({
        title: '上传文件格式有误',
        desc: '文件 ' + file.name + ' 格式错误, 请选择[XLS或XLSX]'
      });
      this.importExcel = false;
    },
    downloadEcxel () { // 下载标发货导入的模板
      const path = this.$store.state.imgUrl + '/sps-service/template/categoryTemplate.xlsx';
      window.location.href = path;
      /* let v = this;
       v.axios.post(api.categoryDownloadImportTemplate)
       .then(response => {
       if (response.data.code == 0) {
       window.location = response.data.datas;
       } else {
       v.$Message.error('异常');
       }
       }).catch((error) => {
       v.$Message.error('异常');
       }) */
    }
  }
};
</script >
