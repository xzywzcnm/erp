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
</template>
<script>
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
      status: self.$store.state.bindingResult,
      shopPlatformType: 'amazon',
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
        }
      ],
      columns: [
        {
          title: '代号',
          key: 'saleAccount',
          width: 160,
          align: 'center',
          render: (h, params) => {
            // return h('span', params.row.amazonAccountId);
            return h('span', params.row.saleAccount.accountCode);
          }
        },
        {
          title: '平台',
          key: 'platform',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('span', {
              class: 'platformLogo amazon'
            });
          }
        },
        {
          title: '站点', // key: 'siteCountry',
          key: 'siteId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let siteArr = this.siteList.filter((item) => {
              return item.siteId === params.row.siteId;
            });
            return h('span', siteArr.length > 0 ? siteArr[0].cnName : '');
          }
        },
        {
          title: '账户名',
          key: 'shopAccount',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.saleAccount.account);
          }
        },
        {
          title: '授权状态',
          key: '',
          width: 160,
          align: 'center',
          render: (h, params) => {
            // eslint-disable-next-line eqeqeq
            if (params.row.amazonStatus == 1) {
              return h(
                'span',
                {
                  style: {
                    color: '#008000'
                  }
                },
                '已授权'
              );
            } else {
              return h(
                'span',
                {
                  style: {
                    color: '#FF0000'
                  }
                },
                '未授权'
              );
            }
          }
        },
        {
          title: '状态',
          key: '',
          width: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.saleAccount.status === 1) {
              return h(
                'span',
                {
                  style: {
                    color: '#008000'
                  }
                },
                '有效'
              );
            } else {
              return h(
                'span',
                {
                  style: {
                    color: '#FF0000'
                  }
                },
                '失效'
              );
            }
          }
        },
        {
          title: '邮箱',
          key: 'emailAddress',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.emailRelation.emailAddress);
          }
        },
        {
          title: '绑定时间',
          key: 'createdTime',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            return h(
              'span',
              self.getDataToLocalTime(params.row.createdTime, 'fulltime')
            );
          }
        },
        {
          title: '操作',
          key: 'operate',
          minWidth: 140,
          maxWidth: 240,
          align: 'center',
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
                        params.row.amazonAccountId,
                        'check',
                        params.row.shopAccount
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
                        params.row.amazonAccountId,
                        'edit',
                        params.row.shopAccount
                      );
                    }
                  }
                },
                '编辑'
              ),
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
                          saleAccountId: params.row.amazonAccountId,
                          status: '1'
                        };
                        self.enbaleStatus(stopParams);
                      }
                    }
                  },
                  '启用'
                )
                : params.row.saleAccount.status === 1
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
                            saleAccountId: params.row.amazonAccountId,
                            status: '0'
                          };
                          self.disableStatus(stopParams);
                        }
                      }
                    },
                    '停用'
                  )
                  : ''
            ]);
          }
        }
      ],
      showParams: {
        amazonAccountId: null,
        type: null,
        account: null
      }
    };
  },
  methods: {
    show (amazonAccountId, type, account) {
      let v = this;
      v.showParams = {
        sid: amazonAccountId,
        type: type,
        account: account
      };
    }
  },
  mounted () {
    let v = this;
    v.pageParamsStatus = true;
    v.getCodeResult();
    v.getLazadaSite('amazon');
  }
};
</script>
