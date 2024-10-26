<template>
  <div>
    <!-- 筛选模块 -->
    <shopFilter
      :pageParams.sync="pageParams" @combineData="combineData" :shopPlatformType="shopPlatformType"></shopFilter>
    <!-- 排序模块 -->
    <shopSort
      :buttonGroupModel="buttonGroupModel" @combineData="combineData"></shopSort>
    <!-- 添加新绑定模块 -->
    <shopBinding
      @emitBatchUpdateFeedbackScore="emitBatchUpdateFeedbackScore"
      :shopPlatformType="shopPlatformType" :showParams="showParams"></shopBinding>
    <!-- 列表数据模块 -->
    <customList
      v-if="$store.state.SETTING_CHANNEL === 1"
      ref="customList"
      :customShopDataTable="customShopData"
      :custTotal="total"
      :custLoading="loading"></customList>
    <div
      class="shopTable" v-if="$store.state.SETTING_CHANNEL === 0">
      <Table
        highlight-row border :columns="columns" @on-selection-change="changeSelect" :data="shopData" :loading="loading"></Table>
      <div class="table-page">
        <div class="table-page-right">
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
            :current="curPage"></Page>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import shopFilter from '../components/filter';// 筛选
import addNewBinding from '../components/addNewBinding';
import shopMixin from '../mixin/shopMixin';
import shopSort from '../components/sort';// 排序
import shopBinding from '../components/binding';// 排序
import customList from '../components/customList'; // 自定义列表
import api from '@/api/api'
export default {
  mixins: [Mixin, shopMixin],
  components: {
    addNewBinding,
    shopFilter,
    shopSort,
    shopBinding,
    customList
  },
  data () {
    var self = this;
    return {
      status: self.$store.state.bindingResult,
      shopPlatformType: 'ebay',
      checkData: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        searchValue: null,
        authStatus: null,
        orderBy: 'tokenEffectiveDate',
        upDown: 'up'
      },
      buttonGroupModel: [
        {
          type: 'tokenEffectiveDate',
          selected: true,
          status: true, // true up false down
          title: '按绑定时间'
        }, {
          type: 'accountCode',
          selected: false,
          status: true, // true up false down
          title: '按代号'
        }, {
          type: 'tokenInvalidDate',
          selected: false,
          status: true, // true up false down
          title: '按授权到期时间'
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '代号',
          key: 'saleAccount',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.saleAccount.accountCode);
          }
        }, {
          title: '平台',
          key: 'platform',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('span', {
              class: 'platformLogo ebay'
            });
          }
        }, {
          title: '账户名',
          key: 'saleAccount',
          align: 'center',
          minWidth: 120,
          maxWidth: 160,
          render: (h, params) => {
            return h('span', params.row.saleAccount.account);
          }
        }, {
          title: '授权状态',
          key: 'ebayStatus',
          align: 'center',
          minWidth: 80,
          maxWidth: 160,
          render: (h, params) => {
            /**
             * 2 授权失效
             *3 挂起
             * 授权过期 比当前时间小过期
             * */

            let status = params.row.ebayStatus;
            let text = null;
            let now = new Date().getTime();
            let tokenDate = new Date(self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime')).getTime();
            if (params.row.tokenInvalidDate && now > tokenDate) {
              text = h('span', { style: { color: '#e91e63' } }, '授权过期');
            } else {
              switch (status) {
                case 0:
                  text = h('span', {
                    class: 'stopStatus'
                  }, '未授权');
                  break;
                case 1:
                  text = h('span', {
                    class: 'openStatus'
                  }, '已授权');
                  break;
                case 2:
                  text = h('span', {
                    style: { color: '#f73131' }
                  }, '授权失效');
                  break;
                case 3:
                  text = h('span', {
                    style: { color: '##ff9800' }
                  }, '挂起');
                  break;
              }
            }
            return text;
          }
        }, {
          title: '信用评价',
          minWidth: 80,
          align: 'center',
          render: (h, params) => {
            return h('p', {}, [h('span', {
              style: {
                fontWeight: 'bold',
                marginRight: '5px'
              }
            }, params.row.feedbackScore), h('span', {
              style: {
                color: 'red'
              }
            }, Number(params.row.positiveFeedbackPercent) + '%')])
          }
        }, {
          title: '授权过期时间',
          minWidth: 100,
          align: 'center',
          key: 'deathdate',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.tokenInvalidDate, 'fulltime'));
          }
        }, {
          title: 'OAuth API授权状态',
          key: 'refreshTokenInvalidTime',
          minWidth: 100,
          maxWidth: 160,
          render: (h, params) => {
            if (params.row.refreshTokenInvalidTime &&
              new Date(self.getDataToLocalTime(params.row.refreshTokenInvalidTime, 'fulltime')).getTime() >= new Date().getTime()) {
              return h('span', { style: { color: 'green' } }, '已授权')
            } else {
              return h('span', { style: { color: 'red' } }, '失效')
            }
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return params.row.saleAccount.status === 0 ? h('span', {
              class: 'stopStatus'
            }, '停用') : h('span', {
              class: 'openStatus'
            }, '启用');
          }
        }, {
          title: '绑定时间',
          key: 'bindTime',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.tokenEffectiveDate, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          minWidth: 140,
          maxWidth: 240,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', ...self.lookStyle()
                },
                on: {
                  click: () => {
                    self.show(params.row.ebayAccountId, 'check', params.row.saleAccount.account);
                  }
                }
              }, '查看'),
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', ...self.editStyle()
                },
                on: {
                  click: () => {
                    self.show(params.row.ebayAccountId, 'edit', params.row.saleAccount.account);
                  }
                }
              }, '编辑'),
              params.row.ebayStatus !== 0 && params.row.saleAccount.status === 0 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', ...self.enableStyle()
                },
                on: {
                  click: () => {
                    var stopParams = {
                      saleAccountId: params.row.saleAccount.saleAccountId,
                      status: '1'
                    };
                    self.enbaleStatus(stopParams);
                  }
                }
              }, '启用') : params.row.ebayStatus !== 0 && params.row.saleAccount.status !== 0 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', ...self.disableStyle()
                },
                on: {
                  click: () => {
                    var stopParams = {
                      saleAccountId: params.row.saleAccount.saleAccountId,
                      status: '0'
                    };
                    self.disableStatus(stopParams);
                  }
                }
              }, '停用') : '',
              // 所有平台允许已授权店铺重新授权
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', ...self.accreditStyle()
                },
                on: {
                  click: () => {
                    self.show(params.row.ebayAccountId, 'give', params.row.saleAccount.account);
                  }
                }
              }, '授权'),
              h('Button', {
                style: {
                  display: this.permission.autoAPI ? 'inline-block' : ''
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    self.oAuthApi(params.row.ebayAccountId);
                  }
                }
              }, 'OAuth API授权')
            ]);
          }
        }
      ],
      showParams: {
        ebayAccountId: null,
        type: null,
        account: null
      }
    };
  },
  computed: {
    permission () {
      return {
        autoAPI: this.getPermission('ebayAccount_auth2Url')
      }
    }
  },
  methods: {
    emitBatchUpdateFeedbackScore () {
      let v = this;
      if (this.checkData.length === 0) {
        v.$Message.info('未选择数据');
        return
      }
      v.axios.post(api.post_ebayAccount_batchUpdateFeedback, {
        ebayAccountIds: this.checkData.map(i => i.saleAccount.saleAccountId)
      }).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      })
    },
    changeSelect (data) {
      this.checkData = data;
    },
    show (ebayAccountId, type, account) {
      let v = this;
      v.showParams = {
        sid: ebayAccountId,
        type: type,
        account: account
      };
    },
    oAuthApi (id) {
      let v = this;
      v.axios.get(api.post_auth2Url + id).then(response => {
        if (response.data.code === 0) {
          window.open(response.data.datas, '_blank')
        }
      })
    }
  },
  created () {
    this.getPermissionCallback('generalSettings_shop')
      .then(() => {
      });
  },
  mounted () {
    let v = this;
    v.pageParamsStatus = true;
    v.getCodeResult();
  }
};
</script>
