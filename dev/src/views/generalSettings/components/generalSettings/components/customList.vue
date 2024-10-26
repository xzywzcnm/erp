<template>
  <!-- <div class="p10"> -->
  <div class="mt10">
    <Table highlight-row border :loading="custLoading || loading" :columns="columns" :height="tableHeight" :data="customData" />
    <div class="table-page">
      <div class="table-page-right">
        <Page
          :total="custTotal"
          @on-change="customChangePage"
          show-total
          :page-size="pageParamsCustomize.pageSize"
          show-elevator
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
          :current="currentPage"
        />
      </div>
    </div>
    <custom-shop-modal ref="customModal" :modalType="modalType" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import shopMixin from '../mixin/shopMixin';
import customShopModal from '@/views/generalSettings/components/generalSettings/components/customShopModal';
const authStatusJson = {
  '0': {
    txt: '未授权',
    style: {
      color: '#e91e63'
    }
  },
  '1': {
    txt: '已授权',
    style: {
      color: '#3cb034'
    }
  },
  '2': {
    txt: '授权失效',
    style: {
      color: '#e91e63'
    }
  }
}
export default {
  name: 'customList',
  mixins: [Mixin, shopMixin],
  components: {
    customShopModal
  },
  props: {
    customShopDataTable: {
      type: Array,
      default: () => {
        return []
      }
    },
    custTotal: {
      type: Number,
      default: 0
    },
    custLoading: {
      type: Boolean,
      default: false
    },
    customPage: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      tableHeight: 500,
      currentPage: 1,
      modalType: 'edit',
      customData: [],
      existAccreditStatus: {}
    };
  },
  watch: {
    customPage: {
      deep: true,
      handler (val) {
        this.currentPage = val;
      }
    },
    customShopDataTable: {
      handler () {
        this.existAccreditStatus = this.customShopDataTable.find(item => {
          return !this.$common.isEmpty(item.platformId) && ['temu'].includes(item.platformId.toLocaleLowerCase());
        });
        this.$nextTick(() => {
          this.customData = this.customShopDataTable;
        })
      }
    },
    customShopData: {
      handler (n, o) {
        if (n !== o) {
          this.existAccreditStatus = n.find(item => {
            return !this.$common.isEmpty(item.platformId) && ['temu'].includes(item.platformId.toLocaleLowerCase());
          });
          this.$nextTick(() => {
            this.customData = n;
          })
        }
      }

    }
  },
  computed: {
    // 是否显示授权状态
    isShowAccreditStatus () {
      return !this.$common.isEmpty(this.existAccreditStatus);
    },
    columns () {
      let besidesKeys = [];
      !this.isShowAccreditStatus && besidesKeys.push('temuStatus');
      const col = [
        {
          title: '渠道',
          key: 'saleAccountId',
          minWidth: 80,
          align: 'center',
          render: (h, params) => {
            if (this.$store.state.platformGroup) {
              let arr = this.$store.state.platformGroup.filter(i => i.type === 2 && i.platformId === params.row.platformId);
              if (arr.length > 0) {
                let name = arr[0].name;
                return h('span', name);
              }
            }
          }
        },
        {
          title: '店铺代号',
          align: 'center',
          minWidth: 100,
          key: 'accountCode'
        },
        {
          title: '店铺名称',
          align: 'center',
          minWidth: 100,
          key: 'account'
        },
        {
          title: '所属事业部',
          key: 'businessDeptName',
          minWidth: 100,
          align: 'center',
          render: (h, { row }) => {
            return h('span', {}, row.businessDeptName || (row.saleAccount ? row.saleAccount.businessDeptName || '' : ''))
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return params.row.status === 0 ? h('span', {
              class: 'stopStatus'
            }, '停用') : h('span', {
              class: 'openStatus'
            }, '启用');
          }
        },
        {
          title: '授权状态',
          key: 'temuStatus',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.temuStatus)) return h('span', '');
            const item = authStatusJson[row.temuStatus];
            if (this.$common.isEmpty(item)) return h('span', '');
            return h('span', {
              style: item.style
            }, item.txt);
          }
        },
        {
          title: 'ioss NO',
          key: 'iossNo',
          minWidth: 100,
          align: 'center',
          render: (h, { row }) => {
            if (!this.$common.isEmpty(row.iossNo)) return h('span', row.iossNo);
            if (this.$common.isEmpty(row.saleAccount)) return h('span', '');
            return h('span', row.saleAccount.iossNo);
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          width: 155,
          align: 'center',
          render: (h, params) => {
            return h('span', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: 200,
          align: 'center',
          render: (h, params) => {
            let item = [];
            this.getPermission('saleAccount_detail') && item.push(h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.openCustomModal(params.row.saleAccountId, 'look');
                }
              }
            }, '查看'));
            this.getPermission('saleAccount_update') && item.push(h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.openCustomModal(params.row.saleAccountId, 'edit');
                }
              }
            }, '编辑'));

            if (this.getPermission('saleAccount_enable') && params.row.status != 1) {
              item.push(h('Button', {
                props: {
                  size: 'small',
                  type: 'primary'
                },
                style: {
                  marginRight: '5px', ...this.enableStyle()
                },
                on: {
                  click: () => {
                    var stopParams = {
                      saleAccountId: params.row.saleAccountId
                    };
                    this.enbaleStatus(stopParams, params.row);
                  }
                }
              }, '启用'));
            }
            if (this.getPermission('saleAccount_disable') && params.row.status == 1) {
              item.push(h('Button', {
                props: {
                  size: 'small',
                  type: 'error'
                },
                style: {
                  marginRight: '5px', ...this.disableStyle()
                },
                on: {
                  click: () => {
                    var stopParams = {
                      saleAccountId: params.row.saleAccountId
                    };
                    this.disableStatus(stopParams, params.row);
                  }
                }
              }, '停用'));
            }
            if (this.getPermission('sheinAccount_authUrl') && !this.$common.isEmpty(params.row.platformId) && params.row.platformId.toLocaleLowerCase() == 'shein') {
              item.push(h('Button', {
                props: {
                  size: 'small',
                  type: 'primary'
                },
                style: {},
                on: {
                  click: () => {
                    this.platformAuth(params.row, 'shein');
                  }
                }
              }, '授权'));
            }
            return h('div', {}, item);
          }
        }
      ];
      return col.filter((item) => {
        return !besidesKeys.includes(item.key)
      })
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(385);
  },
  methods: {
    customChangePage (val) {
      this.currentPage = val;
      this.$emit('update:customPage', val);
    },
    openCustomModal (saleAccountId, type) {
      this.modalType = type;
      this.$nextTick(() => {
        this.$refs.customModal.open(saleAccountId);
      });
    },
    // 平台授权
    platformAuth (row, platform) {
      if (platform == 'shein') {
        let newOpenWindow = window.open('', '_blank');
        this.axios.get(api.sheinAuthorizeUrl, {
          params: {
            saleAccountId: row.saleAccountId
          }
        }).then(res => {
          if (res && res.data && res.data.code == 0) {
            newOpenWindow.location.href = res.data.datas;
          } else {
            newOpenWindow.close();
          }
        }).catch(() => {
          newOpenWindow.close();
        });
      }
    }
  }
};
</script>

<style scoped>

</style>
