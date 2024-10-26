<!--
 * @Author: w
 * @Date: 2021-02-06 17:30:19
 * @LastEditors: w
 * @LastEditTime: 2021-02-06 18:25:17
-->
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
    let self = this;
    return {
      status: self.$store.state.bindingResult,
      shopPlatformType: 'yandex',
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
              class: 'platformLogo yandex'
            });
          }
        },
        {
          title: '账户名',
          key: 'account',
          minWidth: 160,
          align: 'center',
          render: (h, params) => {
            return h(
              'span',
              params.row.saleAccount.account !== 'null'
                ? params.row.saleAccount.account
                : ''
            );
          }
        },
        {
          title: 'LAPA状态',
          key: 'tongStatus',
          width: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.saleAccount.status) {
              return h(
                'span',
                {
                  style: {
                    color: '#008000'
                  }
                },
                '启用'
              );
            } else {
              return h(
                'span',
                {
                  style: {
                    color: '#FF0000'
                  }
                },
                '停用'
              );
            }
          }
        },
        {
          title: 'Yandex状态',
          key: 'yandexStatus',
          width: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.yandexStatus) {
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
          title: '绑定时间',
          key: 'tokenEffectiveDate',
          minWidth: 200,
          align: 'center',
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
                        params.row.yandexAccountId,
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
                        params.row.yandexAccountId,
                        'edit',
                        params.row.saleAccount.account
                      );
                    }
                  }
                },
                '编辑'
              ),
              params.row.yandexStatus !== 0 &&
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
                : params.row.yandexStatus !== 0 &&
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
              // params.row.yandexStatus === 0 || params.row.yandexStatus === 2
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
                        params.row.yandexAccountId,
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
        yandexAccountId: null,
        type: null,
        account: null
      }
    };
  },
  methods: {
    show (yandexAccountId, type, account) {
      let v = this;
      v.showParams = {
        sid: yandexAccountId,
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
