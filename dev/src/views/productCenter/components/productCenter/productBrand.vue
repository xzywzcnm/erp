<template>
  <div>
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" class="normalTop" :model="pageParams" :label-width="70" label-position="right">
            <dyt-filter>
              <Form-item
                label="品牌名称" prop="name">
                <Input placeholder="请输入品牌名称" v-model.trim="pageParams.name"></Input>
              </Form-item>
              <Form-item
                label="品牌描述" prop="description">
                <Input  placeholder="请输入品牌描述" v-model.trim="pageParams.description"></Input>
              </Form-item>
              <Form-item
                label="品牌状态" prop="status">
                <dyt-select v-model="pageParams.status"><Option value='All'>全部</Option>
                  <Option :value='1'>启用</Option> <Option :value='0'>停用</Option></dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" :disabled="SearchDisabled" icon="md-search" @click="search">查询 </Button>
                <Button style="marginLeft:10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>

    <!--操作区-->
    <div class="addBrand" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" icon="md-add" @click="add" :disabled="!getPermission('productBrand_insert')">新增品牌</Button>
      </div>
      <!--排序-->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序方式：</span>
        <Button-group>
          <template v-for="(item,index) in buttonGroupModel">
            <Button
              v-if="item.selected" :key="index" type="primary" @click="modifyTheSort(index, item.status)">
              {{ item.title }}
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            </Button>
            <Button
              v-if="!item.selected" :key="index" @click="modifyTheSort(index, item.status)">
              {{ item.title }}
              <Icon
                type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon
                type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <!--列表-->
    <div class="orderTable normalTop">
      <Table
        highlight-row
        :loading="tableLoading"
        border
        :height="tableHeight"
        :columns="brandColumn"
        :data="brandData"></Table>
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
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!--新增编辑模态窗-->
    <Modal
      v-model="productBrandModal"
      width="600"
      @on-ok="save"
      @on-cancel="productBrandModal = false"
      :loading="waitingProductBrandModalOk">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">{{ productBrandModalTitle }}</div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px">

            <Form
              ref="productBrandForm" :model="productBrand" :label-width="70" label-position="left">
              <div class="brandSelect">

                <Form-item
                  label="品牌名称" prop="name" :rules="{ required: true, message: '品牌名称不能为空', trigger: 'blur' }">
                  <Input
                    style="width:460px"
                    :maxlength="50"
                    placeholder="请输入品牌名称"
                    v-model.trim="productBrand.name"></Input>
                </Form-item>
                <Form-item
                  label="品牌网址" prop="webSite">
                  <Input
                    style="width:460px"
                    :maxlength="100"
                    placeholder="请输入品牌网址"
                    v-model.trim="productBrand.webSite"></Input>
                </Form-item>
                <Form-item
                  label="品牌描述" prop="description">
                  <Input
                    type="textarea"
                    :autosize="{ minRows: 2,maxRows: 5 }"
                    style="width:460px"
                    :maxlength="1000"
                    placeholder="请输入品牌描述"
                    v-model.trim="productBrand.description"></Input>
                </Form-item>
                <Form-item label="品牌状态">
                  <RadioGroup v-model="productBrand.status">
                    <Radio :label="1">启用</Radio>
                    <Radio :label="0">停用</Radio>
                  </RadioGroup>
                </Form-item>
                <input type="hidden" v-model="productBrand.logoPath" />
                <div class="logo">
                  <div class="label">品牌LOGO</div>
                  <div class="upload">
                    <dytUpload
                      ref="uploadProductBrand"
                      type="drag"
                      name="files"
                      :headers="uploadFilesHeader"
                      :show-upload-list="false"
                      :format="['jpg', 'png', 'gif']"
                      :max-size="uploadFilesMaxSize"
                      :on-exceeded-size="uploadExceedSize"
                      :on-error="uploadFilesError"
                      :on-success="uploadFilesSuccess"
                      :on-format-error="handleFormatError"
                      :action="uploadFiles">
                      <div style="padding: 20px 20px">
                        <Icon
                          type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                        <p>Click or drag files here to upload</p>
                      </div>
                    </dytUpload>
                    <div
                      class="product-upload-list" v-for="(item, index) in uploadList" :key="index">
                      <template v-if="item.status === 'finished'">
                        <img :src="item.url">
                        <div class="product-upload-list-cover">
                          <Icon
                            type="ios-trash-outline" @click.native="removeFiles(item)"></Icon>
                        </div>
                      </template>
                      <template v-else>
                        <Progress
                          v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 删除确认框 -->
    <delConfirmModal
      ref="delConfirmModal" @ok="del"></delConfirmModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import delConfirmModal from './delConfirmModal';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    delConfirmModal: delConfirmModal
  },
  data () {
    var self = this;
    return {
      total: 0, // 总记录数
      pageParamsStatus: false, // 是否重新加载品牌列表数据
      productBrandModal: false, // 品牌模型模态窗
      waitingProductBrandModalOk: true, // 点击确认按钮是否需要显示loading遮罩
      uploadList: [], // 已上传文件列表
      productBrandModalTitle: null, // 品牌模型模态窗口标题
      uploadFiles: api.upload_files + '?basePath=/productBrand', // 上传logo的url
      uploadFilesMaxSize: 10240, // 上传文件大小上线（kb）
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsPrototype: null, // 当前货品信息原型(重置用到)
      pageParams: { // 品牌列表筛选参数
        status: null,
        description: null,
        name: null,
        orderBy: 'status',
        upDown: 'down',
        pageSize: 10,
        pageNum: 1
      },
      productBrand: { // 编辑、新增模型
        name: null,
        description: null,
        status: 1,
        logoPath: null,
        webSite: null
      },
      buttonGroupModel: [ // 排序按钮组
        {
          type: 'status',
          selected: true,
          status: false,
          title: '按品牌状态'
        }, {
          type: 'name',
          selected: false,
          status: true,
          title: '按品牌名称'
        }
      ],
      brandData: [], // 品牌数据
      brandColumn: [ // 品牌列定义
        {
          title: 'NO',
          width: 60,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '品牌LOGO',
          key: 'logoPath',
          align: 'center',
          render: function (h, params) {
            return self.tableImg(h, params, 'logoPath');
          }
        }, {
          title: '品牌名称',
          key: 'name',
          align: 'center'
        }, {
          title: '品牌描述',
          key: 'description',
          align: 'center'
        }, {
          title: '品牌网址',
          key: 'webSite',
          align: 'center'
        }, {
          title: '品牌状态',
          key: 'status',
          align: 'center',
          render (h, params) {
            return params.row.status === 0 ? h('span', {
              class: 'stopStatus'
            }, '停用') : h('span', {
              class: 'openStatus'
            }, '启用');
          }
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          render: (h, params) => {
            if (self.productCommonDictionary.userInfoMap) {
              if (self.productCommonDictionary.userInfoMap[params.row.createdBy]) {
                return h('span', self.productCommonDictionary.userInfoMap[params.row.createdBy].userName);
              }
            }
          }
        }, {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: function (h, params) {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px'
                },
                props: {
                  vIf: self.controlList.productBrand_update,
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (self.getPermission('productBrand_update')) {
                      self.edit(params.row);
                    }
                  }
                }
              }, '编辑'), params.row.status === 1 ? h('Button', {
                props: {
                  vIf: self.controlList.productBrand_disable,
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (self.getPermission('productBrand_disable')) {
                      self.disable(params.row.productBrandId);
                    }
                  }
                }
              }, '停用') : params.row.status === 0 ? h('Button', {
                props: {
                  vIf: self.controlList.productBrand_enable,
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (self.getPermission('productBrand_enable')) {
                      self.enable(params.row.productBrandId);
                    }
                  }
                }
              }, '启用') : '', h('Button', {
                style: {
                  marginLeft: '10px'
                },
                props: {
                  vIf: self.controlList.productBrand_delete,
                  size: 'small'
                },
                on: {
                  click: () => {
                    if (self.getPermission('productBrand_delete')) {
                      self.$refs.delConfirmModal.show(params.row);
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
  computed: {
    uploadFilesHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(290);
    this.pageParamsPrototype = this.deepCopy(this.pageParams);
  },
  mounted () {
    this.uploadList = this.$refs.uploadProductBrand.fileList;
  },
  activated: function () {
    this.startLoading();
  },
  methods: {
    startLoading: function () { // 页面数据初始化
      this.pageParamsStatus = true;
    },
    search () { // 查找
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    reset () { // 重置
      let v = this;
      v.pageParams = v.deepCopy(this.pageParamsPrototype);
      // v.search();
    },
    disable (productBrandId) { // 停用
      let self = this;
      self.axios.put(api.stop_productBrand + '?productBrandId=' + productBrandId).then(response => {
        if (response.data.code === 0) {
          self.$Message.success('停用成功');
          self.pageParamsStatus = true;
        }
      });
    },
    enable (productBrandId) { // 启用
      let self = this;
      self.axios.put(api.star_productBrand + '?productBrandId=' + productBrandId).then(response => {
        if (response.data.code === 0) {
          self.$Message.success('启用成功');
          self.pageParamsStatus = true;
        }
      });
    },
    del (delRow) { // 删除
      let self = this;
      self.axios.delete(api.del_productBrand + delRow.productBrandId).then(response => {
        if (response.data.code === 0) {
          self.$Message.success('删除成功');
          self.search();
          // self.pageParamsStatus = true;
        }
        self.$refs.delConfirmModal.hide();
      });
    },
    save () { // 保存
      let self = this;
      self.$refs['productBrandForm'].validate((valid) => {
        async function doId () {
          if (valid) {
            if (!self.productBrand.productBrandId) {
              await self.axios.post(api.add_productBrand, self.productBrand).then(response => {
                if (response.data.code === 0) {
                  self.$Message.success('新增成功');
                  self.pageParamsStatus = true;
                  self.productBrandModal = false;
                }
              });
            } else {
              await self.axios.put(api.edit_productBrand, self.productBrand).then(response => {
                if (response.data.code === 0) {
                  self.$Message.success('更新成功');
                  self.pageParamsStatus = true;
                  self.productBrandModal = false;
                }
              });
            }
          }
          self.resetProductBrandModalOk();
        }

        doId();
      });
    },
    add () { // 新建
      this.productBrandModal = true;
      this.productBrandModalTitle = '新增品牌';
    },
    edit (editBrand) { // 编辑
      let v = this;
      let { ...copyBrand } = editBrand;
      v.productBrand = copyBrand;

      if (v.productBrand.logoPath) {
        v.uploadList.push({
          'name': v.productBrand.productBrandId,
          'status': 'finished',
          'url': v.filenodeViewTargetUrl + '/thumb' + v.productBrand.logoPath
        });
      }
      v.productBrandModal = true;
      v.productBrandModalTitle = '编辑品牌';
    },
    uploadFilesSuccess (response, file, fileList) { // 上传文件成功
      let v = this;
      const url = file.response.datas[0];
      fileList.splice(0, fileList.length);
      file.url = v.filenodeViewTargetUrl + url;
      fileList.push(file);
      v.productBrand.logoPath = url;
    },
    uploadFilesError () { // 上传文件异常
      this.$Message.error('系统繁忙，请重新尝试');
    },
    uploadExceedSize () { // 控制上传图片大小
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    handleFormatError () { // 上传文件格式异常
      this.$Message.error('文件格式有误');
    },
    removeFiles (file) { // 删除文件
      this.productBrand.logoPath = null;
      const fileList = this.$refs.uploadProductBrand.fileList;
      this.$refs.uploadProductBrand.fileList.splice(fileList.indexOf(file), 1);
    },
    getList () { // 查询列表数据
      let self = this;
      let { ...copyPageParams } = self.pageParams;
      if (copyPageParams.status === 'All') {
        copyPageParams.status = null;
      }
      self.loadingTrue();
      self.axios.post(api.get_productBrand, copyPageParams).then(response => {
        let pos = [];
        let userIds = [];
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach(function (n, i) {
              n.index = i + 1;
              pos.push(n);
              userIds.push(n.createdBy);
            });
          }

          Promise.all([
            self.getUserInfoMap(userIds)
          ]).then(result => {
            self.brandData = pos;
            self.$nextTick(function () {
              self.total = Number(data.total);
              self.loadingFalse();
            });
          });
        }
      }).catch(() => {
        self.loadingFalse();
      });
    },
    resetProductBrandModalOk () {
      let self = this;
      self.waitingProductBrandModalOk = false;
      self.$nextTick(function () {
        self.waitingProductBrandModalOk = true;
      });
    }
  },
  watch: {
    pageParamsStatus: function (n, o) { // 监听重置列表数据
      var self = this;
      if (n) {
        self.$Loading.start();
        Promise.resolve(self.getPermission('productBrand_query') ? self.getList() : self.gotoError()).then(() => {
          self.$Loading.finish();
        });
        self.pageParamsStatus = false;
      }
    },
    productBrandModal: function (n, o) { // 重置品牌模型模态窗
      if (!n) {
        let self = this;
        self.productBrand = { // 编辑、新增模型
          name: null,
          description: null,
          status: 1,
          logoPath: null,
          webSite: null
        };
        const fileList = self.$refs.uploadProductBrand.fileList;
        fileList.splice(0, fileList.length);
      }
    }
  }
};
</script>
