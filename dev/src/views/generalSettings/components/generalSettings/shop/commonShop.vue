<template >
  <div>
    <!-- 筛选模块 -->
    <shopFilter ref="shopFilter" :pageParams.sync="pageParams" @combineData="combineData"
      @customListCombine="customListCombine" @changePlatform="changePlatform" :shopPlatformType="shopPlatformType" />
    <!-- 添加新绑定模块 -->
    <shopBinding :shopPlatformType="shopPlatformType" :showParams="showParams" :thirdAuth="isThirdAuth">
      <!-- 排序模块 -->
      <shopSort :buttonGroupModel="buttonGroupModel" @combineData="combineData" @customListCombine="customListCombine"
        slot="shopSort"></shopSort>
    </shopBinding>
    <!-- 自定义渠道列表 -->
    <customList v-if="$store.state.SETTING_CHANNEL === 1" ref="customList" :customShopDataTable="customShopData"
      :custTotal="total" :customPage.sync="customPage" :custLoading="loading" />
    <!-- 通用渠道列表 -->
    <div class="shopTable" v-if="$store.state.SETTING_CHANNEL === 0">
      <Table highlight-row border :columns="columns" :data="shopData" :height="tableHeight" :loading="tableLoading" />
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"
            :current="curPage" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import shopFilter from '../components/filter';// 筛选
import shopMixin from '../mixin/shopMixin';
import shopSort from '../components/sort';// 排序
import shopBinding from '../components/binding';// 编辑
import customList from '../components/customList'; // 自定义列表
import { AUTH_PLATFORM, AUTH_PLATFORM_TIME_MAP, SHOW_BIND_TIME } from '@/utils/enum';
import api from '@/api/api';

const noAuthPlatform = ['newegg'];

export default {
  mixins: [Mixin, shopMixin],
  components: {
    shopFilter,
    shopSort,
    shopBinding,
    customList
  },
  data() {
    let self = this;
    return {
      tableHeight: 500,
      customPage: 1,
      status: self.$store.state.bindingResult,
      shopPlatformType: '',
      awiatQuery: false,
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
        }
      ],
      showParams: {
        saleAccountId: null,
        type: null,
        account: null
      },
      getSitePlatform: ['amazon', 'cdiscount', 'lazada', 'newegg', 'tiktok']
    };
  },
  watch: {
    '$route': {
      handler() {
        if (this.awiatQuery) return;
        this.shopPlatformType = this.$route.params.platform;
        this.pageParamsStatus = true;
        if (this.getSitePlatform.includes(this.shopPlatformType)) this.getLazadaSite(this.shopPlatformType);
      },
      immediate: true
    },
    customPage: {
      deep: true,
      handler(val) {
        if (this.awiatQuery) return;
        this.$set(this.pageParamsCustomize, 'pageNum', val);
        this.$nextTick(() => {
          this.pageParamsStatus = true;
        });
      }
    }
  },
  methods: {
    customListCombine(obj) {
      this.customPage = 1;
      obj.pageNum = 1;
      // 自定义平台
      this.pageParamsCustomize = Object.assign(this.pageParamsCustomize, obj);
      this.$nextTick(() => {
        this.getList(this.pageParamsCustomize, true);
      });
    },
    siteNameMt(val) {
      let pos = '';
      if (val && this.siteList) {
        val.forEach((n, i) => {
          this.siteList.forEach((m, t) => {
            if (n.siteId === Number(m.siteId)) {
              pos = pos + m.cnName + '';
            }
          });
        });
      }
      return pos;
    },
    oAuthApi(id) {
      this.axios.get(api.post_auth2Url + id).then(response => {
        if (response.data.code === 0) {
          window.open(response.data.datas, '_blank');
        }
      });
    },
    synChildAccount(id) {
      this.axios.get(api.syn_child_account + '?saleAccountId=' + id).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('同步成功');
        }
      });
    },
    changePlatform(id) {
      this.shopPlatformType = id;
    },
    show(saleAccountId, type, account, row) {
      this.showParams = {
        sid: saleAccountId,
        type: type,
        account: account,
        row: row
      };
    },
    // 第三方平台授权
    toAuth({ platformId, saleAccountId, authType, action, accountCode, account }) {
      this.axios.post(api.post_saleAccount_thirdAuth_applyAuth, {
        "accountCode": accountCode,
        "accountName": account,
        "action": action, // 行动(toauth(返回授权地址)、edit(返回表单地址))
        "currentAuthType": authType,
        "platformId": platformId,
        "saleAccountId": saleAccountId
      }).then(response => {
        if (response && response.data && response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            window.open(data.redirectUrl, '_blank');
          } else {
            this.$Message.error('获取申请授权回调地址失败！');
          }
        }
      });
    },
    // 根据 pushThirdAuthAccount key，查询当前用户是否配置了平台授权
    getPushThirdAuthAccountData() {
      return new Promise((resolve, reject) => {
        const query = {
          businessId: this.$store.state.erpConfig.userInfo.merchantId,
          paramKeys: ['pushThirdAuthAccount']
        }
        this.axios.post(api.post_erpCommonSettingParam1_queryByUK, query).then(res => {
          if (!res || !res.data || res.data.code != 0 || this.$common.isEmpty(res.data.datas)) return resolve([]);
          res.data.datas.forEach((item) => {
            if (item.paramKey === 'pushThirdAuthAccount' && !this.$common.isEmpty(item.paramValue)) {
              const obj = JSON.parse(item.paramValue);
              resolve(Object.keys(obj))
            }
          })
        }).catch(() => {
          resolve([]);
        })
      });
    },
    // 获取搜索条件的参数
    getFlterParams() {
      this.shopPlatformType = this.$route.path.replace(/\/shop\/(.*)/, '$1').toLowerCase();
      if (this.$store.state.SETTING_CHANNEL === 0 && this.shopPlatformType != this.pageParams.platformId) {
        this.$set(this.pageParams, 'platformId', this.shopPlatformType);
      }
      let pageParams = this.$common.removeEmpty(this.pageParams);
      return pageParams;
    },
    getList(obj, isAwiat) {
      this.loading = true;
      let pageParams = this.getFlterParams();
      if (pageParams.authStatus === '-1') {
        pageParams.authStatus = null
      }
      if (pageParams.status === '-1') {
        pageParams.status = null
      }
      if (this.$store.state.SETTING_CHANNEL === 0) {
        if (this.$store.state.thirdAuthPlatform.includes(this.shopPlatformType) || this.$store.state.thirdAuthPlatform.includes('all')) {
          if (!this.getPermission(`${this.shopPlatformType}Account_list`)) {
            return this.$Message.error({
              content: '您暂无查看此平台数据',
              duration: 1,
              level: 1
            });
          }
          this.shopData = [];
          this.axios.post(api.post_saleAccount_thirdAuth_query, pageParams).then((response) => {
            this.loading = false;
            this.tableLoading = false;
            if (response.data.code === 0) {
              let data = response.data.datas.list;
              this.$nextTick(() => {
                this.total = Number(response.data.datas.total);
                this.totalPage = Number(response.data.datas.totalPage);
              });
              this.shopData = data;
            }
          }).catch(() => {
            this.loading = false;
            this.tableLoading = false;
          });
        } else if (this.$store.state.platformGroupShow) { // 没有平台的时候，不调用查询
          this.shopData = [];
          if (!this.getPermission(`${this.shopPlatformType}Account_list`)) {
            this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
            this.loading = false;
            this.tableLoading = false;
            return;
          }

          this.axios.post('/setting-service/' + this.shopPlatformType + 'Account/list', JSON.stringify(pageParams)).then(response => {
            this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
            this.loading = false;
            this.tableLoading = false;
            if (response.data.code === 0) {
              // 不知道为什么写重复了
              // if (this.shopPlatformType === 'amazon') {
              //   let data = response.data.datas.list;
              //   this.$nextTick(() => {
              //     this.total = Number(response.data.datas.total);
              //     this.totalPage = Number(response.data.datas.totalPage);
              //   });
              //   this.shopData = data;
              // } else {
              //   let data = response.data.datas.list;
              //   this.$nextTick(() => {
              //     this.total = Number(response.data.datas.total);
              //     this.totalPage = Number(response.data.datas.totalPage);
              //   });
              //   this.shopData = data;
              // }
              let data = response.data.datas.list || [];
              if (['miravia'].includes(this.shopPlatformType)) {
                data.forEach(k => { k.saleAccount = this.$common.copy(k) });
              }
              this.$nextTick(() => {
                this.total = Number(response.data.datas.total);
                this.totalPage = Number(response.data.datas.totalPage);
              });
              this.shopData = data;
            }
          }).catch(() => {
            this.tableLoading = false;
            this.loading = false;
            this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
          });
        } else {
          this.tableLoading = false;
          this.loading = false;
          this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
        }
      } else if (this.$store.state.SETTING_CHANNEL === 1) {
        if (this.awiatQuery) {
          this.loading = false;
          this.tableLoading = false;
          return;
        }
        if (!this.$common.isEmpty(obj) && isAwiat) {
          this.awiatQuery = true;
        }
        // 自定义平台  saleAccount_list
        if (!this.getPermission('saleAccount_list')) {
          this.$Message.error({
            content: '您暂无查看此平台数据',
            duration: 1,
            level: 1
          });
          this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
          this.loading = false;
          this.tableLoading = false;
          if (isAwiat) {
            this.awiatQuery = false;
          }
          return
        }
        if (this.$refs.customList && this.$common.isEmpty(obj)) {
          this.pageParamsCustomize = this.$refs.customList.pageParamsCustomize;
        } else if (this.pageParamsCustomize) {
          this.pageParamsCustomize.pageNum = this.pageParams.pageNum;
          this.pageParamsCustomize.pageSize = this.pageParams.pageSize;
        }
        let params = JSON.parse(JSON.stringify(this.pageParamsCustomize));
        params.platformId = params.platformId === -1 ? null : params.platformId;
        this.axios.post(api.get_saleAccountList, JSON.stringify(params)).then(response => {
          this.loading = false;
          this.tableLoading = false;
          this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
          if (response.data.code === 0) {
            this.customShopData = [];
            this.customShopData = response.data.datas.list;
            this.$nextTick(() => {
              this.total = Number(response.data.datas.total);
              this.totalPage = Number(response.data.datas.totalPage);
            });
          }
          if (isAwiat) {
            this.$nextTick(() => {
              setTimeout(() => {
                this.awiatQuery = false;
              }, 500);
            })
          }
        }).catch(e => {
          if (isAwiat) {
            this.$nextTick(() => {
              setTimeout(() => {
                this.awiatQuery = false;
              }, 500);
            })
          }
          this.loading = false;
          this.tableLoading = false;
          this.$refs.shopFilter.initFilter && this.$refs.shopFilter.initFilter();
        });
      }
    },
    // shein 平台授权
    platformAuth (row, platform) {
      if (['shein', 'sheinx'].includes(platform)) {
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
    },
    // 第三方授权店铺停用(启用)
    threeDisableAndEnable({ status, saleAccountId }, row) {
      let _api = status ? api.put_saleAccount_thirdAuth_disable : api.put_saleAccount_thirdAuth_enable;
      let accountCode = row.accountCode || '';
      if (!this.isThirdAuth && !this.isMiravia && !this.isShein && !this.isTemu && !this.$common.isEmpty(row.saleAccount)) {
        accountCode = row.saleAccount.accountCode || '';
      }
      this.$Modal.confirm({
        title: '提示',
        content: `确认${status ? '停用' : '启用'}：<span style="color: #f20;">${accountCode}</span>`,
        onOk: () => {
          this.axios.put(`${_api}?saleAccountId=${saleAccountId}&PlatformId=${this.shopPlatformType}`).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success(status ? '停用成功' : '启用成功');
              this.getList();
            }
          });
        }
      });
    }
  },
  created() {
    this.tableHeight = this.getTableHeight(385);
    if (this.$route.path) {
      this.shopPlatformType = this.$route.path.replace(/\/shop\/(.*)/, '$1').toLowerCase();
    }
  },
  computed: {
    // 获取事业部
    allBusinessDept() {
      let businessDeptJson = {};
      (this.$store.getters.getBusinessDeptList || []).forEach(item => {
        businessDeptJson[item.id] = item;
      })
      return businessDeptJson;
    },
    // 是否第三方授权
    isThirdAuth() {
      return this.$store.state.thirdAuthPlatform.includes(this.shopPlatformType) || this.$store.state.thirdAuthPlatform.includes('all');
    },
    isMiravia() {
      return ['miravia'].includes(this.shopPlatformType);
    },
    isShein() {
      return ['sheinx'].includes(this.shopPlatformType);
    },
    isTemu () {
      return ['temux'].includes(this.shopPlatformType);
    },
    isShowAccountCode () {
      return ['miravia', 'temux'].includes(this.shopPlatformType);
    },
    columns() {
      let self = this;
      const isJoom = this.shopPlatformType !== 'joom';
      let basic = [
        {
          title: '代号',
          key: 'saleAccount',
          width: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.isThirdAuth || this.isMiravia || this.isShein || this.isShowAccountCode) {
              if (this.$common.isEmpty(row.accountCode)) return h('span', '');
              return h('span', row.accountCode);
            }
            if (this.$common.isEmpty(row.saleAccount)) return h('span', '');
            return h('span', row.saleAccount.accountCode);
          }
        },
        {
          title: '平台',
          key: 'platform',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h('div', {
              class: `platformItem platform-item-${this.shopPlatformType}`
            }, [
              h('span', {
                class: (() => {
                  return self.shopPlatformType;
                })(),
              })
            ]);
          }
        },
        {
          title: this.isThirdAuth ? '通途状态' : 'LAPA状态',
          key: 'tongStatus',
          width: 200,
          align: 'center',
          render: (h, params) => {
            if (this.isThirdAuth || this.isMiravia || this.isShein || this.isTemu) {
              return h('div', {
                style: {
                  color: params.row.status === 1 ? 'green' : 'red'
                }
              }, params.row.status === 1 ? '启用' : '停用');
            }
            if (this.$common.isEmpty(params.row.saleAccount)) return h('span', {}, '');
            if (params.row.saleAccount.status) {
              return h('span', {
                style: {
                  color: '#008000'
                }
              }, '启用');
            } else {
              return h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '停用');
            }
          }
        },
        {
          title: '操作',
          key: 'operate',
          minWidth: 140,
          maxWidth: 240,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            const saleAccount = this.$common.isEmpty(params.row.saleAccount) ? {} : params.row.saleAccount;
            let id = params.row.saleAccountId ? params.row.saleAccountId : params.row[self.shopPlatformType + 'AccountId'];
            let { saleAccountId } = params.row;
            let status = params.row.status === 1;
            let btnList = [h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px', marginTop: '5px', ...self.lookStyle()
              },
              on: {
                click: () => {
                  self.show(id, 'check', saleAccount.account, params.row);
                }
              }
            }, '查看'),
            h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px', marginTop: '5px', ...self.editStyle()
              },
              on: {
                click: () => {
                  // if (params.row.authAccountId) {
                  //   self.toAuth({
                  //     accountCode: params.row.accountCode,
                  //     accountName: params.row.account,
                  //     action: 'edit',
                  //     authType: params.row.authType,
                  //     platformId: self.shopPlatformType,
                  //     saleAccountId: saleAccountId
                  //   });
                  // } else {
                  //   self.show(id, 'edit', saleAccount.account, params.row);
                  // }
                  self.show(id, 'edit', saleAccount.account, params.row);
                }
              }
            }, '编辑')];
            if (!this.isThirdAuth) {
              if ((!this.$common.isEmpty(saleAccount.status) && saleAccount.status == 0) || (!this.$common.isEmpty(params.row.status) && params.row.status == 0)) {
                btnList.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px', marginTop: '5px', ...self.enableStyle()
                  },
                  on: {
                    click: () => {
                      let stopParams = {
                        saleAccountId: saleAccount.saleAccountId || id,
                        status: '1'
                      };
                      stopParams[self.shopPlatformType + 'Account'] = id;
                      self.enbaleStatus(stopParams, params.row);
                    }
                  }
                }, '启用'));
              } else {
                btnList.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px', marginTop: '5px', ...self.disableStyle()
                  },
                  on: {
                    click: () => {
                      let stopParams = {
                        saleAccountId: saleAccount.saleAccountId || id,
                        status: '0'
                      };
                      stopParams[self.shopPlatformType + 'Account'] = id;
                      self.disableStatus(stopParams, params.row);
                    }
                  }
                }, '停用'));
              }
            } else {
              btnList.push(h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px', marginTop: '5px', ...(status ? self.enableStyle() : self.disableStyle())
                },
                on: {
                  click() {
                    self.threeDisableAndEnable({
                      status: status,
                      saleAccountId: saleAccountId
                    }, params.row);
                  }
                }
              }, status ? '停用' : '启用'));
            }
            if (AUTH_PLATFORM.includes(self.shopPlatformType) && !['wb'].includes(self.shopPlatformType)) {
              if (!this.isThirdAuth) {
                btnList.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    marginTop: '5px',
                    ...self.accreditStyle(),
                    display: (() => {
                      // shopee 主店铺则展示授权按钮，子店铺隐藏。(主店铺parentSaleAccountId为空，子店铺有值)
                      return (self.shopPlatformType === 'shopee' && params.row.parentSaleAccountId) ? 'none' : 'inline-block';
                    })()
                  },
                  on: {
                    click: () => {
                      if (self.isShein) {
                        self.platformAuth(params.row, self.shopPlatformType);
                      } else {
                        self.show(id, 'give', saleAccount.account, params.row);
                      }
                    }
                  }
                }, '授权'))
              } else {
                const { accountCode, account, authType, saleAccountId } = params.row;
                btnList.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px',
                    marginTop: '5px',
                    ...self.editStyle()
                  },
                  on: {
                    click() {
                      self.toAuth({
                        accountCode: accountCode,
                        accountName: account,
                        action: 'edit',
                        authTypes: authType,
                        platformId: self.shopPlatformType,
                        saleAccountId: saleAccountId
                      });
                    }
                  }
                }, '授权'))
              }
            }
            if (self.shopPlatformType === 'ebay') {
              btnList.push(h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  marginTop: '5px',
                  ...self.editStyle()
                },
                on: {
                  click: () => {
                    self.oAuthApi(params.row.ebayAccountId);
                  }
                }
              }, 'OAuth API授权'));
            }
            // if (self.shopPlatformType === 'shopee') {
            //   btnList.push(h('Button', {
            //     props: {
            //       size: 'small'
            //     },
            //     on: {
            //       click: () => {
            //         self.synChildAccount(params.row.saleAccountId);
            //       }
            //     }
            //   }, '同步附属店铺'));
            // }
            return h('div', {
              style: {
                'display': 'inline-block',
                'margin': '0 auto',
                'text-align': 'left',
                'margin-bottom': '5px',
              }
            }, btnList);
          }
        }
      ];

      isJoom && basic.splice(2, 0, {
        title: '账户名',
        key: 'account',
        minWidth: 160,
        align: 'center',
        render: (h, params) => {
          if (this.isThirdAuth || this.isMiravia || this.isShein || this.isTemu) {
            if (this.$common.isEmpty(params.row.account)) return h('span', {}, '');
            return h('span', {}, params.row.account);
          }
          if (this.$common.isEmpty(params.row.saleAccount)) return h('span', {}, '');
          let item = [h('span', params.row.saleAccount.account)];
          if (params.row.isSip === 'Y' && self.shopPlatformType === 'shopee') {
            item.push(h('span', {
              style: {
                color: '#F1582B'
              }
            }, '(SIP店铺)'));
          }
          return h('span', {}, item);
        }
      });
      basic.splice(isJoom ? 3 : 2, 0, {
        title: '所属事业部',
        key: 'businessDeptName',
        minWidth: 160,
        align: 'center',
        render: (h, { row }) => {
          if (!this.$common.isEmpty(row.businessDeptName)) {
            return h('span', {}, row.businessDeptName);
          }
          if (!this.$common.isEmpty(row.saleAccount) && !this.$common.isEmpty(row.saleAccount.businessDeptName)) {
            return h('span', {}, row.saleAccount.businessDeptName);
          }
          if (!this.$common.isEmpty(row.businessDeptId) && !this.$common.isEmpty(this.allBusinessDept[row.businessDeptId])) {
            return h('span', {}, this.allBusinessDept[row.businessDeptId].name);
          }
          if (!this.$common.isEmpty(row.authJson) && this.$common.isString(row.authJson)) {
            const authJson = JSON.parse(row.authJson);
            const saleAccount = authJson.saleAccount || {};
            if (!this.$common.isEmpty(saleAccount.businessDeptId) && !this.$common.isEmpty(this.allBusinessDept[saleAccount.businessDeptId])) {
              return h('span', {}, this.allBusinessDept[saleAccount.businessDeptId].name);
            }
          }
          return h('span', {}, '');
        }
      });
      if (!noAuthPlatform.includes(this.shopPlatformType)) {
        basic.splice(isJoom ? 4 : 3, 0, {
          title: '授权状态',
          minWidth: 100,
          maxWidth: 160,
          align: 'center',
          render: (h, params) => {
            if (!self.$common.isEmpty(params.row.accountTokenList)) {
              return h('div', (params.row.accountTokenList || []).map(i => {
                return h('p', [
                  h('span', {
                    domProps: {
                      title: i.authName,
                    },
                    style: {
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      marginRight: '10px',
                      textOverflow: 'ellipsis',
                      verticalAlign: 'top'
                    }
                  }, i.authName),
                  h('span', {
                    style: {
                      color: i.status === 1 ? 'green' : 'red'
                    }
                  }, i.status === 1 ? '有效' : '无效'),
                  i.authDescription ? h('Poptip', {
                    props: {
                      'word-wrap': true,
                      trigger: 'hover',
                      content: i.authDescription
                    }
                  }, [h('Icon', {
                    props: {
                      size: 16,
                      type: 'ios-help-circle'
                    }
                  })]) : '',
                  i.authType.includes('oauth') ? h('span', {
                    class: 'goAuth',
                    style: {
                      ...self.accreditStyle()
                    },
                    on: {
                      'click'() {
                        self.toAuth({
                          platformId: params.row.platformId,
                          saleAccountId: params.row.saleAccountId,
                          action: 'toauth',
                          authType: i.authType,
                          accountCode: params.row.accountCode,
                          account: params.row.account,
                        });
                      }
                    }
                  }, '前往授权') : ''
                ]);
              }));
            }
            const otherAuth = ['walmart', 'wish', 'tophatter', 'thisshop', 'shopline', 'priceminister', 'mercadolibre', 'joom', 'meesho'];
            if (otherAuth.includes(this.shopPlatformType)) {
              if (params.row[this.shopPlatformType + 'Enabled']) {
                return h('span', {
                  style: {
                    color: '#008000'
                  }
                }, '有效');
              } else {
                return h('span', {
                  style: {
                    color: '#FF0000'
                  }
                }, '失效');
              }
            }
            /**
             * 0: 未授权 1: 已授权 2: 授权失效 3: 挂起(ozon平台没有过期时间字段，当是3时就是授权过期)
             * 授权过期 比当前时间小过期
             * */
            const completeStatus = ['miravia', 'wb'];
            let status = params.row[completeStatus.includes(this.shopPlatformType) ? 'authStatus' : `${self.shopPlatformType}Status`];
            let tokenTimeKey = AUTH_PLATFORM_TIME_MAP[self.shopPlatformType] || 'tokenInvalidDate';
            let tokenTime = params.row[tokenTimeKey];
            let text = null;
            let now = new Date().getTime();
            let tokenDate = new Date(self.getDataToLocalTime(tokenTime, 'fulltime')).getTime();
            let isHand = ['ozon', 'temux'].includes(self.shopPlatformType);
            if (AUTH_PLATFORM.includes(self.shopPlatformType) && tokenTime && now > tokenDate) {
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
                    style: { color: isHand ? '#e91e63' : '##ff9800' }
                  }, isHand == 'ozon' ? '授权过期' : '挂起');
                  break;
              }
            }
            return text;
          }
        })
      }
      // ioss NO 列
      basic.splice(isJoom ? 5 : 4, 0, {
        title: 'ioss NO',
        key: 'iossNo',
        minWidth: 100,
        align: 'center',
        render: (h, { row }) => {
          if (this.isThirdAuth || this.isMiravia || this.isShein || this.isTemu) {
            if (this.$common.isEmpty(row.iossNo)) return h('span', {}, '');
            return h('span', {}, row.iossNo);
          }
          if (this.$common.isEmpty(row.saleAccount)) return h('span', '');
          return h('span', row.saleAccount.iossNo);
        }
      });
      if (AUTH_PLATFORM.includes(this.shopPlatformType)) {
        basic.splice(isJoom ? 6 : 5, 0, {
          title: '绑定时间',
          key: 'tokenEffectiveDate',
          minWidth: 200,
          align: 'center',
          render: (h, { row }) => {
            const platformObj = {
              'shopee': 'effectiveTime',
              'jdyn': 'createdTime',
              'otto': 'createdTime',
              'temux': 'createdTime',
              'tiktok': 'createdTime',
              'ozon': 'createdTime',
              'sheinx': 'createdTime',
              'miravia': 'createdTime',
              'wb': 'createdTime'
            }
            // 第三方使用 authJson
            if (this.isThirdAuth) {
              if (this.$common.isString(row.authJson) && !this.$common.isEmpty(row.authJson)) {
                const authJson = JSON.parse(row.authJson);
                const bindTime = self.getDataToLocalTime(authJson.createdTime, 'fulltime');
                return h('span', bindTime);
              }
              return h('span', '');
            }
            let key = platformObj[this.shopPlatformType];
            if (!key) key = 'tokenEffectiveDate';
            // if (this.$common.isEmpty(params.row[key])) return h('span', '');
            const bindTime = self.getDataToLocalTime(this.$common.isEmpty(row[key]) ? row.createdTime : row[key], 'fulltime');
            return h('span', bindTime);
          }
        });
      } else if (this.shopPlatformType === 'mycom') {
        basic.splice(-1, 0, {
          title: '绑定时间',
          key: 'tokenEffectiveDate',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.tokenEffectiveDate)) return h('span', '');
            return h('span', self.getDataToLocalTime(params.row.tokenEffectiveDate, 'fulltime'));
          }
        });
      } else if (SHOW_BIND_TIME.includes(this.shopPlatformType)) {
        basic.splice(-1, 0, {
          title: '绑定时间',
          key: 'createdTime',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            if (this.$common.isEmpty(params.row.createdTime)) return h('span', '');
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        });
      }
      // else if (['tiktok'].includes(this.shopPlatformType)) {
      //   basic.splice(2, 0, {
      //     title: '站点',
      //     key: 'siteId',
      //     minWidth: 100,
      //     align: 'center',
      //     render: (h, params) => {
      //       let siteList = self.$store.state.shopSiteList || [];
      //       let list = siteList.filter(k => k.siteId === params.row.siteId);
      //       return h('span', list[0] ? list[0].cnName : '');
      //     }
      //   });
      // }

      let platformSpecial = [];
      switch (this.shopPlatformType) {
        case 'ebay':
          platformSpecial = [{
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
              }, Number(params.row.positiveFeedbackPercent) + '%')]);
            }
          },
          {
            title: 'OAuth API授权状态',
            key: 'refreshTokenInvalidTime',
            minWidth: 100,
            maxWidth: 160,
            render: (h, params) => {
              if (params.row.refreshTokenInvalidTime &&
                new Date(self.getDataToLocalTime(params.row.refreshTokenInvalidTime, 'fulltime')).getTime() >= new Date().getTime()) {
                return h('span', { style: { color: 'green' } }, '已授权');
              } else {
                return h('span', { style: { color: 'red' } }, '失效');
              }
            }
          }];
          break;
        case 'alibaba':
          platformSpecial = [{
            title: 'memberID',
            key: 'memberId',
            width: 160,
            align: 'center'
          },
          {
            title: '账户类型',
            key: 'accountType',
            minWidth: 160,
            align: 'center',
            render: (h, params) => {
              if (params.row.accountType === 'buyer') {
                return h('span', '买家');
              } else {
                return h('span', '卖家');
              }
            }
          }];
          break;
        case 'alibabagj':
          platformSpecial = [{
            title: 'taobao_user_id',
            key: 'taobaoUserId',
            minWidth: 160,
            align: 'center',
            render: (h, params) => {
              return h('span', params.row.taobaoUserId);
            }
          }];
          break;
        case 'aliexpress':
          platformSpecial = [
            {
              title: '授权过期时间',
              minWidth: 100,
              align: 'center',
              key: 'expireTime',
              render: (h, params) => {
                return h('span', self.getDataToLocalTime(params.row.expireTime, 'fulltime'));
              }
            },
            {
              title: 'Login Id',
              key: 'loginId',
              align: 'center',
              minWidth: 120,
              maxWidth: 160
            }];
          break;
        case 'amazon':
          platformSpecial = [{
            title: '站点', // key: 'siteCountry',
            key: 'siteId',
            minWidth: 120,
            align: 'center',
            render: (h, params) => {
              let siteArr = this.siteList.filter(item => {
                return item.siteId === params.row.siteId;
              });
              return h('span', siteArr.length > 0 ? siteArr[0].cnName : '');
            }
          }, {
            title: '邮箱',
            key: 'emailAddress',
            minWidth: 120,
            align: 'center',
            render: (h, { row }) => {
              if (this.$common.isEmpty(row.emailRelation) || this.$common.isEmpty(row.emailRelation.emailAddress)) return h('span', '');
              return h('span', row.emailRelation.emailAddress);
            }
          }];
          break;
        case 'cdiscount':
          platformSpecial = [{
            title: '站点',
            key: 'site',
            minWidth: 160,
            align: 'center',
            render: (h, params) => {
              let siteName = null;
              let siteId = params.row.cdiscountAccountSaleAreaList ? params.row.cdiscountAccountSaleAreaList[0].siteId.toString() : '';
              self.siteList.forEach((n, i) => {
                if (siteId === n.siteId) {
                  siteName = n.cnName;
                }
              });
              return h('span', siteName);
            }
          }];
          break;
        case 'joom':
          platformSpecial = [{
            title: 'CLIENT ID',
            key: 'clientId',
            minWidth: 120,
            align: 'center'
          }, {
            title: 'CLIENT SECRET',
            key: 'clientSecret',
            minWidth: 100,
            align: 'center',
            render: (h, params) => {
              return h('span', '**********');
            }
          }];
          break;
        case 'newegg':
          platformSpecial = [{
            title: '站点',
            key: 'site',
            minWidth: 160,
            align: 'center',
            render: (h, params) => {
              let siteName = null;
              self.siteList.forEach((n, i) => {
                if (params.row.site === n.siteId) {
                  siteName = n.cnName;
                }
              });
              return h('span', siteName);
            }
          }];
          break;
        case 'shopee':
          platformSpecial = [{
            title: 'shopId',
            key: 'shopId',
            minWidth: 100,
            align: 'center'
          }];
          break;
        // case 'shopify':
        //   platformSpecial = [{
        //     title: '店铺地址',
        //     key: 'shopName',
        //     minWidth: 160,
        //     align: 'center',
        //     render: (h, params) => {
        //       return h('span', 'https://' + params.row.shopName + '.myshopify.com');
        //     }
        //   }];
        //   break;
        case 'tophatter':
          platformSpecial = [{
            title: 'accessToken',
            key: 'accessToken',
            align: 'center',
            render: (h, params) => {
              return h('span', '**********');
            }
          }];
          break;
        case 'temux':
        case 'ozon':
          platformSpecial = [{
            title: '授权失效时间',
            key: 'apiKeyExpiresTime',
            minWidth: 160,
            align: 'center',
            render: (h, { row }) => {
              if (this.$common.isEmpty(row.apiKeyExpiresTime)) return h('span', {}, '');
              return h('span', {}, row.apiKeyExpiresTime);
            }
          }];
          break;
        case 'lazada':
          platformSpecial = [{
            title: '站点',
            key: 'lazadaSite',
            minWidth: 160,
            align: 'center',
            render: (h, { row }) => {
              let lazadaAccountSaleAreaList = row.lazadaAccountSaleAreaList;
              if (this.$common.isEmpty(lazadaAccountSaleAreaList) && this.$common.isString(row.authJson) && !this.$common.isEmpty(row.authJson)) {
                const authJson = JSON.parse(row.authJson);
                lazadaAccountSaleAreaList = authJson.lazadaAccountSaleAreaList;
              }
              if (this.$common.isEmpty(lazadaAccountSaleAreaList)) return h('span', '');
              return h('span', this.siteNameMt(lazadaAccountSaleAreaList));
            }
          }];
          break;
      }
      /**
       * dhgate
       * */
      basic.splice(-2, 0, ...platformSpecial);
      return basic;
    }
  },
  mounted() {
    this.getCodeResult();
  }
};
</script>
<style>
.three-table-cursor {
  cursor: pointer;
  margin-left: 5px;
}
</style>
