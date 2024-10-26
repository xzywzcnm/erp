<template>
  <div :class="wrap">
    <div>
      <Tabs class="commonFilter" v-model="blackType" type="card">
        <TabPane label="专有黑名单" name="0"></TabPane>
        <TabPane label="公共黑名单" name="1"></TabPane>
        <TabPane label="白名单" name="2"></TabPane>
      </Tabs>
      <div>
        <div class="commonFilter">
          <div class="card-container">
            <div class="card-content platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="100" style="padding-top: 10px">
                <dyt-filter ref="formFilter">
                  <FormItem label="销售渠道">
                    <dyt-select class="min-wid200" ref="select31" v-model="pageParams.platformId" filterable>
                      <Option v-for="(item,index) in platformGroupList" :key="index" :value="item.platformId">{{ item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="状态" v-if="blackType === '0'" class="notplatformParamsSelect">
                    <local-buttons :data="tabsData1" :value.sync="pageParams.type"></local-buttons>
                  </FormItem>
                  <FormItem label="模糊搜索">
                    <dyt-input class="min-wid200" :maxlength="100" v-model="pageParams.matchingChars" placeholder="买家ID、买家姓名、收货地址、买家身份ID" />
                  </FormItem>
                  <div slot="operation">
                    <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                    <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置 </Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
        <!--操作-->
        <div class="dataSort grayBg" v-if="blackType === '0'">
          <Button @click="addBlackRole" v-if="getPermission('privateBlackList_create')">添加 </Button>
          <Button style="margin-left: 20px" v-if="getPermission('privateBlackList_import')" @click="$refs.importModal.modal = true">导入 </Button>
          <Button style="margin-left: 20px" v-if="getPermission('privateBlackList_export')" @click="exportHandel">导出 </Button>
        </div>
        <div class="plr10">
          <Table border highlight-row :height="tableHeight" :loading="tableLoading" :columns="columns" :data="tableDate" @on-selection-change="checkDataMt"></Table>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>

      </div>
    </div>
    <Modal v-model="modal1" :title="modal1Title" @on-visible-change="visible">
      <Form ref="blackForm" :model="blackDate" label-position="right" :rules="blackDateRules" :label-width="120">
        <FormItem label="销售渠道" prop="platformId">
          <dyt-select class="min-wid200" ref="select1" :disabled="blackType!=='0'" v-model="blackDate.platformId" filterable>
            <Option v-for="(item,index) in platformGroupList" :key="index" :value="item.platformId">{{ item.name }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="类型" prop="type">
          <dyt-select class="min-wid200" ref="select2" :disabled="blackType!=='0'" v-model="blackDate.type" filterable>
            <Option v-for="(item,index) in tabsData" :key="index" :value="item.value">{{ item.label }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="匹配字符" prop="matchingChars">
          <div class="flexBox">
            <Input
              :maxlength="100" :disabled="blackType!=='0'" class="min-wid200 " v-model.trim="blackDate.matchingChars"/>
            <Poptip class="ml10" trigger="hover" :content="`（填写平台订单中的${tabsStr}，也可输入关键字进行匹配）`">
              <Icon type="md-help-circle" size="22"/>
            </Poptip>
          </div>
        </FormItem>
        <FormItem label="备注">
          <Input :maxlength="400" class="min-wid200" type="textarea" v-model.trim="blackDate.remark" />
        </FormItem>
        <FormItem label="添加到公共黑名单" v-show="blackDate.type === 1 && blackType === '0'">
          <i-switch :disabled="blackType!=='0'" v-model="blackDate.addedToPublic" :true-value=1 :false-value=0></i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="blackSave()" type="primary" :loading="saveLoading">保存 </Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
    <Modal v-model="modal2" title="备注" width="600" :ok-text="'关闭'" cancel-text="">
      <Table border :loading="tableLoading" :columns="columns2" :data="tableDate2"></Table>
      <div class="clear">
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="total1" @on-change="changePage1" show-total :page-size="pageParams1.pageSize" show-elevator :current="pageParams1.pageNum" show-sizer @on-page-size-change="changePageSize1" placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </Modal>
    <!--导入-->
    <importModal
      ref="importModal"
      :importModal="importModal"
      :action="import_privateBlackList"
      title="导入专有黑名单"
      :downloadApi="downBlackTemp"
      :service="'/cs-service'"
      @refreshTable="getList1"
    />
  </div>
</template>
<style scoped>
.ml10 {
  margin-left: 10px;
}

.plr16 {
  padding: 0 16px;
}

.min-wid200 {
  min-width: 200px;
}

.wid256 {
  width: 256px;
}

.wid-all {
  width: 100%;
}
.pr50 {
  padding-right: 50px;
}
</style>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #fff !important;
}

.form-item-label-select {
  margin-top: -10px;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import postSaleStep from '@/views/customerCenter/components/postSaleTreatment/postSaleStep';
import importModal from '@/components/common/importModal';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    const validateType = (rule, value, callback) => {
      if (value === '' || value === null) {
        callback(new Error('类型不能为空'));
      } else {
        callback();
      }
    };
    return {
      import_privateBlackList: api.import_privateBlackList,
      downBlackTemp: api.downBlackTemp,
      importModal: false,
      total1: 0,
      updateType: '0', // 0 添加到专用黑名单 1 添加到白名单
      pageParams1: {
        merchantId: '',
        publicBlackListId: '',
        pageNum: 1,
        pageSize: 10
      },
      columns2: [
        {
          title: '顺序',
          width: 60,
          align: 'center',
          type: 'index'
        },
        {
          title: '备注',
          align: 'center',
          key: 'remark'
        }
      ],
      loading2: false,
      tableDate2: [],
      blackType: '0', // 0 专有黑名单 1 公共黑名单 2 白名单
      editType: 'add', // 编辑类型
      blackDate: {
        matchingChars: '', // 匹配字符
        platformId: '', // 销售渠道
        addedToPublic: 0,
        type: null, // 类型(1买家ID2买家姓名3收货地址 4 买家ID身份) ,
        remark: '' // 备注
      },
      blackDateRules: {
        platformId: {
          required: true,
          message: '销售渠道不能为空',
          trigger: 'change'
        },
        type: {
          required: true,
          validator: validateType,
          trigger: 'change'
        },
        matchingChars: {
          required: true,
          message: '匹配字符不能为空',
          trigger: 'blur'
        }
      },
      modal1: false,
      modal2: false,
      modal1Title: '新建专有黑名单',
      moreFilter: false,
      total: 0,
      tableDate: [],
      tabsData1: [
        {
          label: '全部',
          value: null
        },
        {
          label: '买家ID',
          value: 1
        },
        {
          label: '买家姓名',
          value: 2
        },
        {
          label: '收货地址',
          value: 3
        },
        {
          label: '买家身份ID',
          value: 4
        },
        {
          label: '付款账号',
          value: 5
        }
      ],
      platformGroup: [],
      pageParams: {
        matchingChars: '', //  匹配字符 ,
        platformId: 'ebay', //  平台ID(销售渠道) ,
        type: null, //  类型(1买家ID2买家姓名3收货地址 4) ,
        pageNum: 1,
        pageSize: 10
      },
      saveLoading: false
    };
  },
  components: {
    orderDetails,
    postSaleStep,
    importModal
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(360);
    },
    tabsData () {
      if (!(this.tabsData1 && this.tabsData1.length)) return [];
      return this.tabsData1.slice(1, this.tabsData1.length);
    },
    tabsStr () {
      if (!(this.tabsData1 && this.tabsData1.length)) return [];
      let str = [];
      this.tabsData1.forEach((k) => {
        k.value && str.push(k.label);
      });
      return str.join('/');
    },
    columns () {
      let v = this;
      let arr = [
        {
          title: '销售渠道',
          key: 'platformId',
          align: 'center'
        },
        {
          title: '类型',
          align: 'center',
          render (h, params) {
            // let da = params.row.type;
            // let str =
            //   da === 1
            //     ? "买家ID"
            //     : da === 2
            //     ? "买家姓名"
            //     : da === 3
            //     ? "收货地址"
            //     : da === 3
            //     ? "买家身份ID"
            //     : "买家ID";

            // 公共黑名单/白名单 只有买家ID
            if (v.blackType !== '0') {
              return h('span', '买家ID');
            }
            let str = '';
            let list = v.tabsData;
            list.forEach((k) => {
              if (params.row.type === k.value) str = k.label;
            });
            return h('span', str);
          }
        },
        {
          title: '匹配字符',
          align: 'center',
          key: 'matchingChars'
        },
        {
          title: '操作',
          align: 'center',
          width: 220,
          render (h, params) {
            if (v.blackType === '0' || v.blackType === '2') {
              return h('local-down-button', {
                props: {
                  data: {
                    btn: {
                      text: '编辑', // 编辑
                      hide:
                        (!v.getPermission('privateBlackList_update') &&
                          v.blackType === '0') ||
                        (!v.getPermission('whiteList_update') &&
                          v.blackType === '2'),
                      clickFn: () => {
                        v.editType = 'edit';
                        if (v.blackType === '2') {
                          // 白名单 只有买家ID类型
                          params.row.type = 1;
                        }
                        v.modal1Title = '编辑';
                        v.$nextTick(() => {
                          v.blackDate = JSON.parse(JSON.stringify(params.row));
                          v.modal1 = true;
                        });
                      }
                    },
                    list: [
                      {
                        text: '删除', // 删除
                        value: 1,
                        hide:
                          (!v.getPermission('privateBlackList_delete') &&
                            v.blackType === '0') ||
                          (!v.getPermission('whiteList_delete') &&
                            v.blackType === '2'),
                        clickFn: () => {
                          v.editType = 'delete';
                          let id =
                            v.blackType === '2'
                              ? params.row.whiteListId
                              : params.row.privateBlackListId;
                          v.isDelModal(() => {
                            v.deleteBl(id);
                          });
                        }
                      }
                    ]
                  }
                }
              });
            } else if (v.blackType === '1') {
              return h('local-down-button', {
                props: {
                  data: {
                    btn: {
                      text: '添加到专用黑名单', // 添加到专用黑名单
                      clickFn: () => {
                        v.editType = 'add';
                        v.updateType = '0';
                        params.row.type = 1;
                        v.$nextTick(() => {
                          v.blackDate = JSON.parse(JSON.stringify(params.row));
                        });
                        v.modal1 = true;
                      }
                    },
                    list: [
                      {
                        text: '添加到白名单', // 添加到白名单
                        value: 1,
                        hide: !v.getPermission('whiteList_create'),
                        clickFn: () => {
                          v.editType = 'add';
                          v.updateType = '1';
                          params.row.type = 1;
                          v.$nextTick(() => {
                            v.blackDate = JSON.parse(
                              JSON.stringify(params.row)
                            );
                          });
                          v.modal1 = true;
                        }
                      }
                    ]
                  }
                }
              });
            }
          }
        }
      ];

      if (v.blackType === '0') {
        arr.splice(-1, 0, ...[
          {
            title: '备注',
            key: 'remark',
            align: 'center'
          }, {
            title: '已加入公共黑名单',
            align: 'center',
            render: (h, params) => {
              let str = params.row.addedToPublic === 1 ? '是' : '否';
              return h('span', str);
            }
          }]
        );
      } else if (v.blackType === '1') {
        arr.splice(-1, 0, ...[
          {
            title: '被标记次数',
            key: 'markCount',
            align: 'center',
            render (h, params) {
              return h('div', {}, [
                h('span', params.row.markCount), h('Icon', {
                  class: 'fr cursor',
                  props: {
                    size: '22',
                    type: 'md-search'
                  },
                  on: {
                    'click' () {
                      v.modal2 = true;
                      v.pageParams.merchantId = v.$store.state.erpConfig.userInfo.merchantId;
                      v.pageParams1.pageNum = 1;
                      v.pageParams1.publicBlackListId = params.row.publicBlackListId;
                      v.getList1();
                    }
                  }
                })
              ]);
            }
          }
        ]
        );
      } else {
        arr.splice(-1, 0, {
          title: '备注',
          align: 'center',
          key: 'remark'
        });
      }
      return arr;
    }
  },
  methods: {
    visible (open) {
      if (!open) {
        if (this.$refs.blackForm) {
          this.$refs.blackForm.resetFields();
        }
        if (this.$refs.select1) {
          this.$refs.select1.reset();
        }
        if (this.$refs.select2) {
          this.$refs.select2.reset();
        }
        this.blackDate.addedToPublic = 0;
      }
    },
    exportHandel () {
      let v = this;
      v.axios.post(api.export_privateBlackList, v.pageParams).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success('导出成功');
        }
      });
    },
    blackSave () {
      let v = this;
      v.$refs.blackForm.validate((valid) => {
        if (valid) {
          let type = v.editType === 'add' ? 'post' : 'put'; // 提交方式
          const merchantId = v.$store.state.erpConfig.userInfo.merchantId;
          let apiUrl = '';
          if (v.blackDate.merchantId) {
            delete v.blackDate.merchantId;
          }
          // 专有黑名单
          if (v.blackType === '0') {
            apiUrl = api.update_privateBlackList;
            if (v.blackDate.type === 1 && v.blackDate.addedToPublic === 1) {
              // 类型为买家ID并且放入公共黑名单
              v.blackDate.merchantId = merchantId;
              v.axios
                .post(
                  api.csServiceCommon + api.update_publicBlackList,
                  v.blackDate
                )
                .then((res) => {
                  if (res.data.code !== 0) { v.$Message.error('添加专有黑名单失败'); }
                });
            }
          }
          // 共用黑名单
          if (v.blackType === '1') {
            if (v.updateType === '0') {
              apiUrl = api.update_privateBlackList;
            } else if (v.updateType === '1') {
              apiUrl = api.update_whiteList;
            }
          }
          // 白名单
          if (v.blackType === '2') {
            apiUrl = api.update_whiteList;
            v.blackDate.merchantId = merchantId;
          }
          // console.log(v.blackDate);
          // return;
          this.saveLoading = true;
          v.axios[type](apiUrl, v.blackDate)
            .then((res) => {
              if (res.data.code === 0) {
                v.$Message.success('保存成功');
                v.modal1 = false;
                v.search();
              } else {
                v.$Message.error('保存失败');
              }
            })
            .finally(() => {
              this.saveLoading = false;
            });
        }
      });
    },
    checkDataMt (data) {
      this.checkedData = data;
    },
    search () {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    addBlackRole () {
      let v = this;
      v.modal1 = true;
      v.updateType = '0';
      v.editType = 'add';
      v.blackDate = {
        matchingChars: '', // 匹配字符
        platformId: '', // 销售渠道
        addedToPublic: 0, // 添加公共黑名单
        type: null, // 类型(1买家ID2买家姓名3收货地址 4 买家ID身份) ,
        remark: '' // 备注
      };
      v.modal1Title = '新建专有黑名单';
    },
    changePage (page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.pageParams.pageSize = +val;
      this.getList();
    },
    changePage1 (page) {
      let v = this;
      v.pageParams1.pageNum = page;
      v.getList1(); // 备注列表
    },
    changePageSize1 (val) {
      this.pageParams1.pageSize = +val;
      this.getList1();
    },
    reset () {
      for (let key in this.pageParams) {
        this.pageParams[key] = null;
      }
      this.$refs.select31.reset();
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 10;
    },
    deleteBl (id) {
      let v = this;
      let apiUrl = v.blackType === '0' ? api.update_privateBlackList : v.blackType === '2'
        ? api.update_whiteList
        : api.csServiceCommon + api.update_publicBlackList;
      v.axios.delete(apiUrl + '/' + id).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('删除成功');
          v.search();
        }
      });
    },
    getList1 () {
      // 公共黑名单 备注
      let v = this;
      v.loading1 = true;
      v.axios
        .post(
          api.csServiceCommon + api.get_publicBlackListRemark,
          v.pageParams1
        )
        .then((res) => {
          v.loading1 = false;
          if (res.data.code === 0) {
            v.tableDate2 = res.data.datas.list;
            v.total1 = res.data.datas.total;
          }
        })
        .catch(() => {
          v.loading1 = false;
        });
    },
    getList () {
      let v = this;
      if (v.blackType === '0') {
        if (!v.getPermission('privateBlackList_queryAll')) return;
      }
      if (v.blackType === '2') {
        if (!v.getPermission('whiteList_queryAll')) return;
      }
      v.loadingTrue();
      let apiUrl = v.blackType === '0' ? api.get_privateBlackList : v.blackType === '2'
        ? api.get_whiteList
        : api.csServiceCommon + api.get_publicBlackList;
      v.axios.post(apiUrl, v.pageParams).then(res => {
        v.loadingFalse();
        if (res.data.code === 0) {
          v.tableDate = res.data.datas.list;
          v.total = res.data.datas.total;
        }
      }).catch(() => {
        v.loadingFalse();
      });
    }
  },
  created () {
    this.getPlatformGroup(1, '/cs-service/erpCommon');
    this.search();
  },
  watch: {
    'blackType' (n) {
      this.search();
      this.$nextTick(() => {
        this.$refs.formFilter && this.$refs.formFilter.resizeHand();
      })
    }
  },
  mounted () { }
};
</script>
<style scoped>
.ml10 {
  margin-left: 10px;
}

.plr16 {
  padding: 0 16px;
}

.min-wid200 {
  min-width: 200px;
}

.wid256 {
  width: 256px;
}

.wid-all {
  width: 100%;
}
</style>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #fff !important;
}

.form-item-label-select {
  margin-top: -10px;
}
</style>
