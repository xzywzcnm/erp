/*
 *** 店铺
 */
import api from '@/api/api';
// import { getQueryString } from "@/utils";

export default {
  data () {
    return {
      loading: false,
      pageParamsStatus: false,
      shopData: [],
      customShopData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      siteList: [], // 站点
      neweggSiteList: [ // newegg 站点
        {
          selected: true,
          site: null,
          title: '全部'
        }
      ],
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      pageParamsCustomize: {
        pageNum: 1,
        pageSize: 10,
        'account': [], // 自定义店铺名称 ,
        'accountCode': [], // 自定义店铺id ,
        'orderBy': 'createdTime', // 排序 createdTime 按时间 accountCode 按代号 ,
        'platformId': null, // 平台id 全部则不传 ,
        'platformType': 1, // 平台类型 0 通用平台 1自定义平台 ,
        'status': -1, // 自定义店铺状态 0停用 1启用 -1全部 ,
        'upDown': 'up' // up 升序 down降序
      }
    };
  },
  watch: {
    pageParamsStatus: {
      handler (n) {
        if (this.awiatQuery) {
          this.pageParamsStatus = false;
          return;
        }
        if (n) {
          if (this.$store.state.platformGroup && this.$store.state.platformGroup.length > 0) {
            this.getList && this.getList();
          } else {
            this.getPlatformGroup().then(() => {
              if (this.$store.state.platformGroup && this.$store.state.platformGroup.length > 0) {
                this.getList && this.getList();
              }
            });
          }

          this.pageParamsStatus = false;
        }
      },
      immediate: true
    }
  },
  created () {
    this.$store.commit('active', 'generalSettings3-generalSettings1');
  },
  methods: {
    lookStyle () {
      // 查看
      let self = this;
      return {
        display: (() => {
          return this.getPermission(`${self.shopPlatformType}Account_detail`) ? 'inline-block' : 'none';
        })()
      };
    },
    editStyle () {
      // 编辑
      let self = this;
      return {
        display: (() => {
          return this.getPermission(`${self.shopPlatformType}Account_update`) || this.getPermission(`${self.shopPlatformType}Account_edit`)
                 ? 'inline-block'
                 : 'none';
        })()
      };
    },
    enableStyle () {
      // 启用
      return {
        display: (() => {
          return this.getPermission('saleAccount_enable') ? 'inline-block' : 'none';
        })()
      };
    },
    disableStyle () {
      // 停用
      return {
        display: (() => {
          return this.getPermission('saleAccount_disable') ? 'inline-block' : 'none';
        })()
      };
    },
    accreditStyle () {
      // 授权
      let self = this;
      return {
        display: (() => {
          let show = `${self.shopPlatformType}Account_authUrl`;
          return this.getPermission(show) ? 'inline-block' : 'none';
        })()
      };
    },
    combineData (obj) {
      obj.pageNum = 1;
      this.curPage = 1;
      if (this.$store.state.SETTING_CHANNEL === 0) {
        // 通用平台
        this.pageParams = Object.assign(this.pageParams, obj);
        this.getList && this.getList(this.pageParams, false);
      }
    },
    // getList () {
    //   this.loading = true;
    //   if (this.$store.state.SETTING_CHANNEL === 0) {
    //     if (this.$store.state.platformGroupShow) { // 没有平台的时候，不调用查询
    //       if (!this.getPermission(`${this.shopPlatformType}Account_list`)) {
    //         this.$Message.error('您没有查询权限！');
    //         this.loading = false;
    //         return;
    //       }
    //       this.axios.post('/setting-service/' + this.shopPlatformType + 'Account/list', JSON.stringify(this.pageParams)).then(response => {
    //         this.loading = false;
    //         if (response.data.code === 0) {
    //           if (this.shopPlatformType === 'amazon') {
    //             // let data = response.data.datas.accountShopList.list;
    //             // this.$nextTick(function () {
    //             //   this.total = Number(response.data.datas.accountShopList.total);
    //             //   this.totalPage = Number(response.data.datas.accountShopList.totalPage);
    //             // });
    //             let data = response.data.datas.list;
    //             this.$nextTick(() => {
    //               this.total = Number(response.data.datas.total);
    //               this.totalPage = Number(response.data.datas.totalPage);
    //             });
    //             this.shopData = data;
    //           } else {
    //             let data = response.data.datas.list;
    //             this.$nextTick(() => {
    //               this.total = Number(response.data.datas.total);
    //               this.totalPage = Number(response.data.datas.totalPage);
    //             });
    //             this.shopData = data;
    //           }
    //         }
    //       }).catch(() => {
    //         this.loading = false;
    //       })
    //     } else {
    //       this.loading = false;
    //     }
    //   } else if (this.$store.state.SETTING_CHANNEL === 1) {
    //     // 自定义平台  saleAccount_list
    //     if (!this.getPermission('saleAccount_list')) {
    //       this.$Message.error('您没有查询权限！');
    //       this.loading = false;
    //       return;
    //     }
    //     if (this.$refs.customList) {
    //       this.pageParamsCustomize = this.$refs.customList.pageParamsCustomize;
    //     } else if (this.pageParamsCustomize) {
    //       this.pageParamsCustomize.pageNum = this.pageParams.pageNum;
    //       this.pageParamsCustomize.pageSize = this.pageParams.pageSize;
    //     }
    //     let params = JSON.parse(JSON.stringify(this.pageParamsCustomize));
    //     params.platformId = params.platformId === -1 ? null : params.platformId;
    //     this.axios.post(api.get_saleAccountList, JSON.stringify(params)).then(response => {
    //       this.loading = false;
    //       if (response.data.code === 0) {
    //         this.customShopData = [];
    //         this.customShopData = response.data.datas.list;
    //         this.$nextTick(() => {
    //           this.total = Number(response.data.datas.total);
    //           this.totalPage = Number(response.data.datas.totalPage);
    //         });
    //       }
    //     }).catch(() => {
    //       this.loading = false;
    //     })
    //   } else {
    //     this.loading = false;
    //   }
    // },
    // 启用
    enbaleStatus (params, row) {
      let accountCode = row.accountCode || '';
      if (!this.isThirdAuth && !this.isMiravia && !this.$common.isEmpty(row.saleAccount)) {
        accountCode = row.saleAccount.accountCode || '';
      }
      // if (this.$store.state.SETTING_CHANNEL === 1) {
      //   accountCode = row.account || '';
      // }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认启用：<span style="color: #f20;">${accountCode}</span>`,
        onOk: () => {
          // 默认 this.$store.state.SETTING_CHANNEL === 0 是使用 operate_enableSaleAccount;
          let apiUrl = api.operate_enableSaleAccount;
          if (this.$store.state.SETTING_CHANNEL === 1) {
            apiUrl = api.enable_saleAccount;
          }
          this.axios.put(`${apiUrl}?saleAccountId=${params.saleAccountId}`).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success('启用成功');
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    // 停用
    disableStatus (params, row) {
      let accountCode = row.accountCode || '';
      if (!this.isThirdAuth && !this.isMiravia && !this.$common.isEmpty(row.saleAccount)) {
        accountCode = row.saleAccount.accountCode || '';
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认停用：<span style="color: #f20;">${accountCode}</span>`,
        onOk: () => {
          // 默认 this.$store.state.SETTING_CHANNEL === 0 是使用 operate_enableSaleAccount;
          let apiUrl = api.operate_disableSaleAccount;
          if (this.$store.state.SETTING_CHANNEL === 1) {
            apiUrl = api.disable_saleAccount;
          }
          this.axios.put(`${apiUrl}?saleAccountId=${params.saleAccountId}`).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success('停用成功');
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    // 获取站点
    getLazadaSite (shop) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(shop)) return resolve({ state: 'finally' });
        if (shop === 'amazon') {
          shop = 'amazon_new';
        }
        this.axios.get(api.erpServiceCommon + api.commonService + api.get_site + '?platformId=' + shop, { hiddenError: true }).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.siteList = data;
            if (shop === 'newegg') {
              data.forEach((n, i) => {
                this.neweggSiteList.push({
                  selected: false,
                  site: n.siteId,
                  title: n.cnName
                });
              });
            } else if (shop == 'ozon') {
              data.push({
                platformId: 'ozon',
                siteId: 'RUS ',
                cnName: '俄罗斯'
              });
            } else if (shop == 'temux') {
              data = [
                { platformId: 'temux', siteId: 'US', cnName: '美区' },
                { platformId: 'temux', siteId: 'EU', cnName: '欧区' },
                // { platformId: 'temux', siteId: 'CN', cnName: '中国' },
              ];
            }
            this.$store.commit('shopSiteList', data);
          }
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    getCodeResult () {
      this.pageParamsStatus = true;
      const pageUrl = window.location.href;
      let urlParams = this.$common.getUrlParams(pageUrl);
      if (this.$common.isEmpty(urlParams.code) || this.status) return;
      const codeNo = Number(urlParams.code);
      if (this.$common.isEmpty(codeNo)) return;
      const tipsJson = {
        0: { type: 'success', txt: '授权成功' },
        106100: { type: 'error', txt: '帐号已存在' },
        106102: { type: 'error', txt: '帐号不匹配' }
      };
      const otherError = { type: 'error', txt: '授权失败，请重新尝试' };
      const tipsObj = this.$common.isEmpty(tipsJson[codeNo]) ? otherError : tipsJson[codeNo];
      this.$Message[tipsObj.type]({
        content: tipsObj.txt,
        duration: 10
      })
      this.status = true;
      this.$store.commit('bindingResult', true);
      // 移除链接中的 code 参数
      // delete urlParams.code;
      // let newUrl = `${pageUrl.substring(0, pageUrl.indexOf('?'))}`;
      // newUrl = this.$common.isEmpty(urlParams) ? newUrl : `${newUrl}?${this.$common.getParams(urlParams)}`;
      // this.$nextTick(() => {
      //   window.location.href = newUrl;
      // });
    }
  }
};
