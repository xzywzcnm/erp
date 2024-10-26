<template >
  <div>
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParams" style="padding-top: 15px;" :model="pageParams" :label-width="70" label-position="right">
            <dyt-filter :filter-row="1">
              <FormItem label="状态" prop="status" :label-width="40">
                <dyt-select ref="productGoodsTagsSelect" v-model="pageParams.status">
                  <Option v-for="(item,index) in ruleStatusList" :key="index" :value="item.status">{{ item.title }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem label="规则名称" prop="ruleName">
                <dyt-input placeholder="输入规则名称查找" style="width:300px;" v-model.trim="pageParams.name"></dyt-input>
              </FormItem>
              <div slot="operation">
                <Button type="primary" v-if="getPermission('orderAutoRule_query')" @click="searchRule" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>

    <!--操作区-->
    <div style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" icon="md-add" v-if="getPermission('orderAutoRule_insert')" @click="addRule">添加新规则</Button>
        <Button class="ml10" type="error" v-if="getPermission('orderAutoRule_delete')" @click="delRule">删除</Button>
      </div>
      <!-- 排序 -->
      <commonSort style="display: inline-block;background: none;border: none;padding: 0;margin: 0;" :buttonGroupModel="buttonGroupModel" @updatePageList="updatePageList" />
    </div>
    <!-- 规则表 -->
    <div class="ruleTable">
      <keep-alive>
        <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderRuleColumn" :data="orderRuleData" @on-selection-change="getAutoRuleIds"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 规则创建编辑 -->
    <Modal v-model="ruleEditModel" v-if="ruleEditStatus" :mask-closable="false" :loading="ruleLoading" class-name="modal-order-smart-rule">
      <div class="ivu-modal-confirm-head">
        <div class="ivu-modal-confirm-head-title">{{ ruleTitle }}</div>
      </div>
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
        <rule :timestamp="timestamp" :ruleParmas="ruleParmas" type="audit" :looKsettings="looKsettings" @closeModal="closeModal"></rule>
      </div>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import commonSort from '@/components/common/commonSort';
import orderSettingsMixin from './mixin/orderSettingsMixin'; // 设置中心-订单mixin文件
import rule from './components/rule';

export default {
  mixins: [Mixin, orderSettingsMixin],
  components: {
    commonSort,
    rule
  },
  data () {
    let self = this;
    return {
      // 规则创建编辑
      ruleEditModel: false,
      ruleEditStatus: false,
      ruleLoading: false,
      ruleTitle: null,
      ruleParmas: null,
      timestamp: 0,
      looKsettings: false, // end
      ruleStatusList: [ // 状态
        {
          selected: true,
          status: -1,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '启用'
        }, {
          selected: false,
          status: 0,
          title: '停用'
        }
      ],
      buttonGroupModel: [ // 排序
        {
          type: 'status',
          selected: true,
          status: false, // true up false down
          title: '按状态'
        }, {
          type: 'createdTime',
          selected: false,
          status: true, // true up false down
          title: '按添加时间'
        }
      ],
      orderRuleColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '规则名称',
          key: 'name',
          align: 'center',
          minWidth: 300
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 200,
          render: (h, params) => {
            if (params.row.status === 0) {
              return h('span', {
                style: {
                  color: '#de2910'
                }
              }, '停用');
            } else if (params.row.status === 1) {
              return h('span', {
                style: {
                  color: '#3cb034'
                }
              }, '启用');
            }
          }
        }, {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('span', self.getUserName(params.row.createdBy));
          }
        }, {
          title: '最后更新人',
          key: 'updatedBy',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('span', self.getUserName(params.row.updatedBy));
          }
        }, {
          title: '添加时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 300,
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '最后更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 300,
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 280,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderAutoRule_get') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '订单自动规则--查看' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = true;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 2, // 0 warehose edit 1 audit create 2 audit edit
                        name: params.row.name,
                        autoRuleId: params.row.autoRuleId,
                        details: params.row || {},
                        status: params.row.status
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '查看'), h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderAutoRule_update') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '订单自动规则--编辑' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 2, // 0 warehose edit 1 audit create 2 audit edit
                        name: params.row.name,
                        autoRuleId: params.row.autoRuleId,
                        status: params.row.status
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '编辑'), params.row.status === 0 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderAutoRule_enable') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 0);
                  }
                }
              }, '启用') : params.row.status === 1 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderAutoRule_disable') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 1);
                  }
                }
              }, '停用') : '', h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('orderAutoRule_copy') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    let name = params.row.name;
                    name = name + '(0)';
                    self.ruleTitle = '订单自动规则--创建' + '(' + name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 1, // 0 warehose edit 1 audit create 2 audit edit
                        name: name,
                        autoRuleId: params.row.autoRuleId,
                        status: 0
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '复制'), !self.getPermission('orderAutoRule_delete') || h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  'click' () {
                    self.delRuleOK([params.row.autoRuleId]);
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      orderRuleData: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        status: -1, // 状态
        name: null, // 规则名称
        orderBy: 'status',
        upDown: 'down',
        pageNum: 1,
        pageSize: 10
      },
      loading: true,
      autoRuleIds: [], // 删除订单自动审核规则
      delRuleModal: false, // 删除确认
      delRuleModalStatus: false
    };
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(290);
    }
  },
  created () {
    this.getPermissionCallback('orderSettings_orderReviewRule').then(() => {
    });
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  methods: {
    startLoading () {
      this.$Loading.start();
      this.pageParamsStatus = true;
    },
    getSearchParams () {
      let params = this.$common.copy(this.pageParams);
      if (params.status == -1) {
        params.status = null;
      }
      return params;
    },
    getList () {
      let v = this;
      if (!v.getPermission('orderAutoRule_query')) return;
      v.loadingTrue();
      v.axios.post(api.get_orderAutoAuditRuleList, v.getSearchParams()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.orderRuleData = data.list;
          v.total = data.total;
          v.loadingFalse();
          v.$Loading.finish();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    searchRule () { // 查询
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.status = -1;
      v.pageParams.name = null;
      v.ruleStatusList.forEach((n, i) => {
        if (i === 0) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    delRule () { // 删除
      let v = this;
      if (v.autoRuleIds.length) {
        v.delRuleOK(v.autoRuleIds);
      } else if (v.autoRuleIds.length === 0) {
        v.$Message.error('请选择要删除的规则');
        return false;
      }
    },
    getAutoRuleIds (val) { // 获取表格选择数据的autoRuleId
      let v = this;
      let pos = [];
      if (val.length) {
        val.forEach((n, i) => {
          pos.push(n.autoRuleId);
        });
        v.autoRuleIds = pos;
      } else {
        v.autoRuleIds = [];
      }
    },
    disableRule (id) { // 停用
      let v = this;
      v.axios.put(api.set_orderAutoAuditRuleDisabled + 'autoRuleId=' + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('停用成功');
          v.pageParamsStatus = true;
        }
      });
    },
    enableRule (id) { // 启用
      let v = this;
      v.axios.put(api.set_orderAutoAuditRuleEnabled + 'autoRuleId=' + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('启用成功');
          v.pageParamsStatus = true;
        }
      });
    },
    updatePageList (obj) {
      let v = this;
      v.pageParams = Object.assign(v.pageParams, obj);
      v.pageParamsStatus = true;
    },
    closeModal (value) {
      let v = this;
      v.ruleEditModel = false;
      if (value === 1) {
        v.pageParamsStatus = true;
      }
    },
    addRule () {
      let v = this;
      v.ruleTitle = '订单自动规则--创建';
      const date = new Date().getTime();
      v.ruleEditStatus = true;
      v.looKsettings = false;
      v.$nextTick(function () {
        v.ruleEditModel = true;
        v.ruleParmas = {
          type: 1, // 0 warehose edit 1 audit create 2 audit edit
          name: '',
          autoRuleId: null,
          status: 0
        };
        v.timestamp = date;
      });
    },
    setStatus (row, type) {
      const autoRuleId = row.autoRuleId;
      let url = api.set_orderAutoAuditRuleEnabled;
      if (type) {
        url = api.set_orderAutoAuditRuleDisabled;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${type == 1 ? '停' : '启'}用规则：<span style="color: #f20;">${row.name}</span>`,
        onOk: () => {
          this.axios.put(url + autoRuleId).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.pageParamsStatus = true;
              this.$Message.success('操作成功');
            }
          });
        }
      });
      // this.axios.put(url + autoRuleId).then(response => {
      //   if (response.data.code === 0) {
      //     this.pageParamsStatus = true;
      //     this.$Message.success('操作成功');
      //   }
      // });
    },
    delRuleOK (autoRuleIds) { // 确认删除
      let v = this;
      v.isDelModal(() => {
        v.axios.delete(api.del_orderAutoAuditRule + '?autoRuleIds=' + autoRuleIds).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('删除成功');
            v.autoRuleIds = [];
            v.pageParamsStatus = true;
          }
        });
      });
    }
  }
};
</script>
<style lang="less">
.modal-order-smart-rule{
  .ivu-modal{
    width: 80% !important;
    min-width: 1000px;
    max-width: 1800px;
  }
  .ivu-modal-body{
    max-height: calc(100vh - 200px);
  }
  .ivu-modal-footer{
    height: 0;
    padding: 0;
  }
}
</style>
