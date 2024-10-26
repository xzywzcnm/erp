<template >
  <div>
    <!-- 筛选模块 -->
    <shopFilter :pageParams.sync="pageParams" @combineData="combineData" :shopPlatformType="shopPlatformType"></shopFilter>
    <!-- 排序模块 -->
    <shopSort :buttonGroupModel="buttonGroupModel" @combineData="combineData"></shopSort>
    <!-- 添加新绑定模块 -->
    <shopBinding :shopPlatformType="shopPlatformType" :showParams="showParams"></shopBinding>
    <!-- 列表数据模块 -->
    <customList
        v-if="$store.state.SETTING_CHANNEL === 1"
        ref="customList"
        :customShopDataTable="customShopData"
        :custTotal="total"
        :custLoading="loading" ></customList >
    <div
        class="shopTable" v-if="$store.state.SETTING_CHANNEL === 0" >
      <Table
          highlight-row border :columns="columns" :data="shopData" ></Table >
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
  </div >
</template >
<script >
import Mixin from '@/components/mixin/common_mixin';
import shopFilter from '../components/filter'; // 筛选
import addNewBinding from '../components/addNewBinding';
import shopMixin from '../mixin/shopMixin';
import shopSort from '../components/sort'; // 排序
import shopBinding from '../components/binding'; // 排序
import customList from '../components/customList'; // 自定义列表
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
      shopPlatformType: 'aliexpress',
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
        },
        {
          type: 'accountCode',
          selected: false,
          status: true, // true up false down
          title: '按代号'
        },
        // {
        //   type: "tokenInvalidDate",
        //   selected: false,
        //   status: true, // true up false down
        //   title: '按代号'
        // },
        {
          type: 'expireTime',
          selected: false,
          status: true, // true up false down
          title: '按授权到期时间'
        }
      ],
      columns: [
        {
          title: '代号',
          key: 'saleAccount',
          width: 160,
          render: (h, params) => {
            return h('span', params.row.saleAccount.accountCode);
          }
        },
        {
          title: '平台',
          key: 'platform',
          width: 150,
          render: (h, params) => {
            return h('span', {
              class: 'platformLogo aliexpress'
            });
          }
        },
        {
          title: 'Login Id',
          key: 'loginId',
          minWidth: 120,
          maxWidth: 160
        },
        {
          title: '授权过期时间',
          minWidth: 100,
          key: 'expireTime',
          render: (h, params) => {
            return h(
              'span',
              self.getDataToLocalTime(params.row.expireTime, 'fulltime')
            );
          }
        },
        {
          title: '授权状态',
          key: 'aliexpressStatus',
          minWidth: 100,
          maxWidth: 160,
          render: (h, params) => {
            return params.row.aliexpressStatus === 0
              ? h(
                'span',
                {
                  class: 'stopStatus'
                },
                '未授权'
              )
              : params.row.aliexpressStatus === 1
                ? h(
                  'span',
                  {
                    class: 'openStatus'
                  },
                  '已授权'
                )
                : h(
                  'span',
                  {
                    class: 'stopStatus'
                  },
                  '授权过期'
                );
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 80,
          render: (h, params) => {
            return params.row.saleAccount.status === 0
              ? h(
                'span',
                {
                  class: 'stopStatus'
                },
                '停用'
              )
              : h(
                'span',
                {
                  class: 'openStatus'
                },
                '启用'
              );
          }
        },
        {
          title: '绑定时间',
          key: 'bindTime',
          width: 200,
          render: (h, params) => {
            return h(
              'span',
              self.getDataToLocalTime(params.row.tokenEffectiveDate, 'fulltime')
            );
          }
        },
        {
          title: '操作',
          key: 'operate',
          minWidth: 140,
          maxWidth: 240,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    ...self.lookStyle()
                  },
                  on: {
                    click: () => {
                      self.show(
                        params.row.aliexpressAccountId,
                        'check',
                        params.row.saleAccount.account
                      );
                    }
                  }
                },
                '查看'
              ),
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    ...self.editStyle()
                  },
                  on: {
                    click: () => {
                      self.show(
                        params.row.aliexpressAccountId,
                        'edit',
                        params.row.saleAccount.account
                      );
                    }
                  }
                },
                '编辑'
              ),
              params.row.aliexpressStatus !== 0 &&
                params.row.saleAccount.status === 0
                ? h(
                  'Button',
                  {
                    props: {
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px',
                      ...self.enableStyle()
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
                  },
                  '启用'
                )
                : params.row.aliexpressStatus !== 0 &&
                  params.row.saleAccount.status !== 0
                  ? h(
                    'Button',
                    {
                      props: {
                        size: 'small'
                      },
                      style: {
                        marginRight: '5px',
                        ...self.disableStyle()
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
                    },
                    '停用'
                  )
                  : '',
              // params.row.aliexpressStatus === 0 ||
              // params.row.aliexpressStatus === 2
              //   ?
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    ...self.accreditStyle()
                  },
                  on: {
                    click: () => {
                      self.show(
                        params.row.aliexpressAccountId,
                        'give',
                        params.row.saleAccount.account
                      );
                    }
                  }
                },
                '授权'
              )
              // : "",
            ]);
          }
        }
      ],
      showParams: {
        sid: null,
        type: null,
        account: null
      }
    };
  },
  methods: {
    show (sid, type, account) {
      let v = this;
      v.showParams = {
        sid: sid,
        type: type,
        account: account
      };
    }
  },
  mounted () {
    let v = this;
    v.pageParamsStatus = true;
    v.getCodeResult();
  }
};
</script>
