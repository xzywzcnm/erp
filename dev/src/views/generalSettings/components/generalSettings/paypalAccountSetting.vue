<template >
  <div >
    <div class="usersFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformParamsSelect" >
            <div class="filterItem" >
              <Button-group >
                <template v-for="(item, index) in enableList" >
                  <Button
                      v-if="item.selected"
                      type="primary"
                      @click="enableUser(index, item.status)"
                      :key="index" >{{ item.title }} </Button >
                  <Button
                      v-if="!item.selected"
                      @click="enableUser(index, item.status)"
                      :key="index" >{{ item.title }} </Button >
                </template >
              </Button-group >
            </div >
          </div >
          <div class="platformSearch clear" >
            <Form ref="pageParams" :model="pageParams" label-position="left" :label-width="70" >
              <dyt-filter :filter-row="1">
                <Form-item label="搜索字符" prop="searchValue" >
                  <dyt-input
                    placeholder="可输入PayPal邮箱"
                    v-model.trim="pageParams.searchValue"
                    @on-enter="search"></dyt-input >
                </Form-item >
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    v-if="getPermission('paypalAccount_query')"
                    :disabled="SearchDisabled"
                    icon="md-search"
                  >查询 </Button >
                  <Button style="marginLeft:10px;" @click="reset" v-once icon="md-refresh" >重置 </Button >
                </div>
              </dyt-filter>
            </Form >
          </div >
        </div >
      </div >
    </div >
    <div class="normalPadding" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" @click="addPaypal" v-if="getPermission('paypalAccount_insert')" >
          <Icon type="md-add" ></Icon >
          添加Paypal账号
        </Button >
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span >排序：</span >
        <Button-group >
          <template v-for="(item, index) in buttonGroupModel" >
            <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index" >
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
            </Button >
            <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index" >
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
            </Button >
          </template >
        </Button-group >
      </div >
    </div >
    <div class="normalPadding normalTop" >
      <Table highlight-row border :loading="tableLoading" :height="tableHeight" :columns="columns" :data="paypalData" ></Table >
      <div class="table-page" >
        <div class="table-page-right" >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray"
              :current="curPage" ></Page >
        </div >
      </div >
    </div >
    <keep-alive >
      <Modal
          v-model="authPalpayModel.status"
          :mask-closable="false"
          width="500"
          v-if="authPalpayStatus"
          @on-ok="addPaypalAccount"
          @on-cancel="resetPalPayText"
          :loading="loading"
          :ok-text="'保存'" >
        <div class="ivu-modal-confirm" >
          <div class="ivu-modal-confirm-head" >
            <div class="ivu-modal-confirm-head-title" >{{ authPalpayModel.title }}</div >
          </div >
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render" >
            <div class="normalTop" >
              <Row >
                <Col :span="1" >
                  <Icon type="md-information-circle" color="#2b85e4" size="44" ></Icon >
                </Col >
                <Col :span="21" :offset="2" >
                  <p >
                    {{ authPalpayModel.content }} </p >
                </Col >
              </Row >
              <Form
                  ref="emailModel"
                  :model="emailModel"
                  :rules="ruleCustom"
                  :label-width="80"
                  class="normalTop setAllMarkRead" >
                <Row >
                  <Col :span="16" >
                    <Form-item label="账号邮箱：" prop="email" >
                      <Input v-model.trim="emailModel.email" ></Input >
                    </Form-item >
                  </Col >
                  <Col :span="7" :offset="1" >
                    <a
                        href="https://tongtool.kf5.com/posts/view/176085"
                        class="paypalAuthGuide"
                        target="_blank" >PayPal授权指南</a >
                  </Col >
                </Row >
              </Form >
            </div >
          </div >
        </div >
      </Modal >
    </keep-alive >
    <!-- 删除 -->
    <Modal v-model="delModal" title="删除" v-if="delModalStatus" @on-ok="delOK" >
      <div style="margin: 20px;fontSize: 14px;" >
        <p >确认删除?</p >
      </div >
    </Modal >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  components: {},
  mixins: [Mixin],
  data () {
    var self = this;
    return {
      tableHeight: 500,
      buttonGroupModel: [
        {
          type: 'paypalAuthorizedDate',
          selected: true,
          status: true, // true up false down
          title: '按绑定时间'
        }, {
          type: 'paypalAccount',
          selected: false,
          status: true, // true up false down
          title: '按账号邮箱'
        }
      ],
      authPalpayModel: {
        status: false,
        title: '添加Paypal账号',
        content: 'PayPal的API授权需脱离系统登录到PayPal账号中设置，请查看授权指南。'
      },
      loading: true,
      authPalpayStatus: false,
      emailModel: {
        email: ''
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: { // 参数
        pageNum: 1,
        pageSize: 20,
        paypalAuthorized: null,
        orderBy: 'paypalAuthorizedDate',
        upDown: 'up',
        searchValue: null// 搜索内容
      },
      ruleCustom: {
        email: [
          {
            validator: this.validateEmail(),
            trigger: 'blur'
          }
        ]
      },
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      enableList: [
        {
          selected: true,
          status: '',
          title: '全部'
        }, {
          selected: false,
          status: 0,
          title: '未授权'
        }, {
          selected: false,
          status: 1,
          title: '已授权'
        }
      ],
      columns: [
        {
          title: '账号邮箱',
          key: 'paypalAccount',
          align: 'center'
        }, {
          title: '授权状态',
          align: 'center',
          key: 'paypalAuthorized',
          render: (h, params) => {
            if (params.row !== undefined) {
              return params.row.paypalAuthorized === 0 ? h('span', {
                style: 'color:#ff3300'
              }, '未授权') : h('span', {
                style: 'color:#3cb034'
              }, '已授权');
            }
          }
        }, {
          title: '绑定时间',
          align: 'center',
          key: 'paypalAuthorizedDate',
          render: (h, params) => {
            return h('div', self.getDataToLocalTime(params.row.paypalAuthorizedDate, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          width: 200,
          fixed: 'right',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                params.row.paypalAuthorized === 0 ? h('Button', {
                  style: {
                    display: (() => {
                      return self.getPermission('paypalAccount_authorize') ? 'inline-block' : 'none';
                    })()
                  },
                  props: {
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      self.goToAuth(params.row.paypalAccountId);
                    }
                  }
                }, '验证授权') : '', h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginLeft: '5px',
                    display: (() => {
                      return self.getPermission('paypalAccount_deletePaypalAccount') ? 'inline-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.del(params.row.paypalAccountId);
                    }
                  }
                }, '删除')
              ]);
            }
          }
        }
      ],
      paypalData: [],
      delModal: false, // 删除确认
      delModalStatus: false,
      paypalAccountId: null
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.paypalList();
        v.pageParamsStatus = false;
      }
    }
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.paypalList()).then(function () {
        v.$Loading.finish();
      });
    },
    paypalList () {
      let v = this;
      if (!v.getPermission('paypalAccount_query')) return;
      v.loadingTrue();
      v.axios.post(api.get_paypalList, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list === null) {
            data.list = [];
          }
          v.paypalData = data.list;
          v.$nextTick(function () {
            v.loadingFalse();
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    enableUser (index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.paypalAuthorized;
      } else if (index === 1) {
        v.pageParams.paypalAuthorized = '0';
      } else {
        v.pageParams.paypalAuthorized = '1';
      }
      v.enableList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    del (id) {
      let v = this;
      v.delModal = true;
      v.delModalStatus = true;
      v.paypalAccountId = id;
    },
    addPaypal () {
      let v = this;
      v.authPalpayStatus = true;
      v.$nextTick(function () {
        v.authPalpayModel.status = true;
      });
    },
    reset () {
      let v = this;
      this.$refs['pageParams'].resetFields();
      v.enableUser(0, '');
    },
    addPaypalAccount () {
      let v = this;
      v.$refs['emailModel'].validate(function (valid) {
        if (valid) {
          let obj = {
            paypalAccount: v.emailModel.email
          };
          v.axios.post(api.add_paypalAccount, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('新增成功');
              v.resetLoading('loading');
              v.$nextTick(function () {
                v.authPalpayModel.status = false;
              });
              v.pageParamsStatus = true;
            } else {
              v.resetLoading('loading');
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
            }
          });
        } else {
          v.resetLoading('loading');
        }
      });
    },
    goToAuth (id) {
      let v = this;
      v.axios.put(api.auth_paypal + '?paypalAccountId=' + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('验证成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    resetPalPayText () {
      let v = this;
      v.emailModel.email = null;
      v.$nextTick(function () {
        v.$refs.emailModel.resetFields();
      });
    },
    delOK () { // 确认删除
      let v = this;
      v.axios.delete(api.del_paypalAccount + v.paypalAccountId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(350);
    this.getPermissionCallback('generalSettings_paypalAccountSetting');
  }
};
</script >
