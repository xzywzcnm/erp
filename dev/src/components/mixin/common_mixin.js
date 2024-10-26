/*
 *** 公共方法,请不要在这里写特例或者业务代码
 */
import api from '@/api/api';
import { debounce } from 'lodash';
// import dayjs from 'dayjs';
// import common from '@/utils/common';
// import { getToken } from '@/utils/cookie';
export default {
  beforeCreate () {
    this.$Loading.config({
      color: '#fbe5d1',
      failedColor: '#f0ad4e',
      height: 2
    });
    // inGroup 不是订单的平台ID， 是对应模块ID
    this.inGroup = this.$store.state.inGroup;
  },
  data () {
    return {
      platformOrderStatusObj: {
        PLACE_ORDER_SUCCESS: '等待买家付款',
        IN_CANCEL: '买家申请取消',
        WAIT_SELLER_SEND_GOODS: '等待卖家发货',
        SELLER_PART_SEND_GOODS: '卖家部分发货',
        WAIT_BUYER_ACCEPT_GOODS: '等待买家收货',
        FUND_PROCESSING: '买卖家达成一致，资金处理中',
        IN_ISSUE: '纠纷中',
        IN_FROZEN: '冻结中',
        WAIT_SELLER_EXAMINE_MONEY: '等待您确认金额',
        RISK_CONTROL: '风控中',
        FINISH: '已结束'
      },
      importTypes: [ // 导入类型
        {
          value: 'handOrderImport',
          label: '手工单导入'
        }, {
          value: 'defineOrderImport',
          label: '自定义渠道'
        }, {
          value: 'returnTrackingNumberImport',
          label: '退货跟踪号导入'
        }
      ],
      selectStore: '', // 仓库
      currencyList: [], // 币种
      platformGroupList: [], // 平台
      tongtoolPrinterUrl: null, // 打印控件地址
      productCategoryList: [],
      failTypeList: [
        { value: 1, color: '#169BD5', label: '盘点' },
        { value: 2, color: '#FF33FF', label: '未上架' },
        // { value: '4,8', color: '#FF9900', label: '缺货' },
        { value: 4, color: '#FF9900', label: '缺货' },
        { value: 10, color: '#FF9900', label: '物流异常' },
        // { value: 8, color: 'red', label: '未知异常' }
      ],
      deliveryStatusList: [ // 发货状态
        {
          selected: true,
          id: 88,
          title: '全部'
        }, {
          selected: false,
          id: 5,
          title: '未指定物流方式'
        }, {
          selected: false,
          id: 4,
          title: '已指定物流方式（待下发物流）'
        }, {
          selected: false,
          id: 3,
          title: '已下发物流（待打印）'
        }, {
          selected: false,
          id: 2,
          title: '已打印'
        }, {
          selected: false,
          id: 1,
          title: '已出库'
        }
      ],
      productCategoryTree: [ // 商品分类树
        {
          title: '全部',
          expand: true,
          children: []
        }
      ],
      combineOrderStatusList: [
        {
          label: '全部',
          value: 0
        }, {
          label: '可合并',
          value: 1
        }, {
          label: '无可合并订单',
          value: 2
        }
      ],
      tabsData1: [
        {
          label: '全部',
          value: null
        }, {
          label: '是',
          value: 1
        }, {
          label: '否',
          value: 0
        }
      ],
      tabsData2: [
        {
          label: '全部',
          value: -1
        }, {
          label: '启用',
          value: 1
        }, {
          label: '禁用',
          value: 0
        }
      ],
      tabsData3: [
        {
          label: '全部',
          value: null
        }, {
          label: '包含',
          value: 1
        }, {
          label: '不包含',
          value: 0
        }
      ],
      haveOrNot: [
        { label: '有', value: 1 },
        { label: '无', value: 0 }
      ],
      notOrhave: [
        { label: '有', value: 0 },
        { label: '无', value: 1 }
      ],
      yesOrNot: [
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ],
      notOrYes: [
        { label: '是', value: 0 },
        { label: '否', value: 1 }
      ],
      uploadFilesMaxSize: 10240, // 上传文件大小上线（kb）
      userInfoList: this.$store.state.userInfoList, // 用户信息列表
      formValidate: { // 国家/地区列表
        country: []
      },
      buttonLoadingStatus: false, // 按钮loading阻挡状态
      modalLoadingResetStatus: true, // 模态框确认 loading 状态
      mask: false,
      tagIdList: [],
      shopList: [],
      countryCodesName: JSON.parse(localStorage.getItem('countryData')) || [],
      shippingMethodModel: [],
      shippingMethodData: [],
      shippingAccountModel: [],
      carrierAccount: [], // 对应物流账号
      tagsList: [],
      roleList: this.$store.state.roleList,
      controlList: this.setControlList(),
      isAdmin: this.$store.state.isAdmin,
      storeFilterMes: '',
      autoWidth: 0,
      domWidth: document.documentElement.clientWidth || document.body.clientWidth || 0,
      domHeight: document.documentElement.clientHeight || document.body.clientHeight || 0,
      fourItemCol: {
        span: 6
      },
      threeItemCol: {
        span: 8
      },
      twoItemCol: {
        span: 12
      },
      oneItemCol: {
        span: 24
      },
      gutterItem: 16,
      labelWidth: 110,
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多筛选项',
      twoItemMd: {
        span: 11
      },
      twoItemLg: {
        span: 11
      },
      threeItemLg: {
        span: 7
      },
      threeItemMd: {
        span: 7
      },
      oneItemMd: {
        span: 12
      },
      oneItemLg: {
        span: 7
      },
      pageArray: [10, 20, 50, 100],
      placeholderSrc: './static/images/placeholder.jpg',
      filenodeViewTargetUrl: this.$store.state.erpConfig.filenodeViewTargetUrl,
      spinShow: false,
      tableLoading: false, // 列表的loading变量
      shopListData: [],
      SearchDisabled: false, // 禁用搜索按钮
      dateOptions: this.$common.dateOptions(),
      disabledDate: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now();
        }
      }
    };
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    userInfo () {
      if (this.$store.state.erpConfig) {
        return this.$store.state.erpConfig.userInfo;
      } else {
        return '';
      }
    },
    // 可查看的事业部
    getUseBusinessDeptIds() {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptIds;
    },
    platformType () {
      return this.$store.state.platformType || ''
    }
  },
  watch: {
    roleList (n, o) {
      if (n !== o) {
        this.controlList = this.setControlList();
      }
    }
  },
  methods: {
    setFormLabel () {
      if (localStorage.getItem('lang') !== 'zh-CN') return;
      let formDom = document.getElementsByClassName('ivu-form');
      let styleText = '';
      for (let i = 0; i < formDom.length; i++) {
        let maxWidth = 0;
        const formDomClassNames = formDom[i].className.split(' ')
        if (formDom[i].className.includes('__noSetFormLabel')) return

        let dom = formDom[i].querySelectorAll('.ivu-form-item-label');
        let maxIndex = 0; // 如果长度超过130占半数 已最长的为准
        if (dom.length !== 0 && dom[0].style.display !== 'block' && !formDomClassNames.includes('use-form-default')) {
          for (let k = 0; k < dom.length; k++) {
            dom[k].style.width = 'auto';
            dom[k].style.display = 'inline-block';
            dom[k].style.whiteSpace = 'nowrap';
            if (dom[k].clientWidth === 0) {
              maxWidth = Math.max(maxWidth, dom[k].innerText.length * 13 + 18);
            } else {
              maxWidth = Math.max(maxWidth, dom[k].clientWidth);
            }
            if (maxWidth > 130) maxIndex++;
            dom[k].style.whiteSpace = 'normal';
          }
          if (!formDom[i].className.split(' ').includes(`addLocalFormStyle${i}`)) {
            formDom[i].className += ` addLocalFormStyle${i}`;
            maxWidth = maxWidth > 130 && maxIndex < (dom.length / 2) ? 130 : maxWidth + 1;
            styleText += `.addLocalFormStyle${i} .ivu-form-item-label{width:${maxWidth}px!important}
                      .addLocalFormStyle${i} .ivu-form-item-content{margin-left:${maxWidth}px!important}
        `;
          }
        }
      }
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = styleText;
      document.querySelector('head').appendChild(style);
    },
    getUserInfo (userId, key) {
      // 通过用户id获取用户信息
      let allUser = this.deepCopy(this.$store.state.userInfoList);
      let userInfo = null;
      if (allUser) {
        for (let key in allUser) {
          if (userId === key) {
            userInfo = allUser[key];
          }
        }
      }
      if (key) {
        return userInfo[key];
      } else {
        return userInfo;
      }
    },
    setOutOfStockStatusConcatRender (h, params) {
      if (params.row.outOfStockStatusConcat) {
        let value = [];
        const arr = params.row.outOfStockStatusConcat.split(',');
        return h('div', {}, arr.map(i => {
          const obj = this.failTypeList.find(j => {
            if (this.$common.isString(j.value) && j.value.includes(',')) {
              value = j.value.split(',').find(v => {
                return v == Number(i)
              });
              return this.$common.isEmpty(value);
            }
            return j.value == Number(i);
          });
          if (!this.$common.isEmpty(obj)) {
            return h('Tag', {
              props: {
                color: obj.color
              }
            }, obj.label);
          }
        }));
      }
    },
    showLoading () {
      this.$Spin.show({
        render: (h) => {
          return h('div', [
            h('Icon', {
              'class': 'demo-spin-icon-load',
              props: {
                type: 'ios-loading',
                size: 18
              }
            }), h('div', 'Loading')
          ]);
        }
      });
    },
    getStockOut (params) {
      let v = this;
      return new Promise(resolve => {
        // 库存管理-获取已有库存列表信息
        v.axios.post(api.get_wmsInventory, params).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getProductCategoryList () { // 获取商品分类(筛选下拉)
      let self = this;
      self.axios.get(api.get_productCategory, { hiddenError: true }).then(response => {
        if (response.data.code === 0) {
          self.productCategoryList = response.data.datas;
          let productCategoryTree = self.getProductCategoryTree(response.data.datas, null);
          self.$set(self.productCategoryTree[0], 'children', []);
          self.$set(self.updateCategoryTree[0], 'children', []);
          self.$nextTick(function () {
            self.$set(self.productCategoryTree[0], 'children', productCategoryTree);
            self.$set(self.updateCategoryTree[0], 'children', productCategoryTree);

            productCategoryTree.unshift({
              title: '未分类',
              productCategoryId: 'noCategory',
              expand: true
            });
          });
        }
      });
    },
    getProductCategoryTree (productCategoryList, parentId) { // 组装商品分类树
      var tree = [];
      var children;
      productCategoryList.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    // 获取国家地区
    getAllCountryName () {
      return new Promise((resolve) => {
        this.axios.get(api.carrierService + '/erpCommon' + api.commonService + api.get_commonCountry).then(response => {
          if (!response || !response.data || response.data.code != 0) {
            this.countryCodesName = [];
            sessionStorage.setItem('countryData', JSON.stringify([]));
            return resolve([]);
          }
          sessionStorage.setItem('countryData', JSON.stringify(response.data.datas || []));
          this.countryCodesName = JSON.parse(JSON.stringify(response.data.datas || []));
          resolve(JSON.parse(JSON.stringify(response.data.datas || [])));
        }).catch(() => {
          resolve([]);
        })
      })
    },
    getEnablePlatform (option = {
      getLocalStorage: false
    }) {
      // 获取订单来源 公共方法别加逻辑在里面
      /**
       * @params
       * option.getLocalStorage 是否获取localStorage缓存 Boolean
       * */
      let v = this;
      return new Promise(resolve => {
        if (option.getLocalStorage && localStorage.getItem('queryEnablePlatform')) {
          resolve(JSON.parse('queryEnablePlatform'));
        } else {
          v.axios.get(api.get_queryEnablePlatform).then(response => {
            if (response.data.code === 0) {
              localStorage.setItem('queryEnablePlatform', JSON.stringify(response.data.datas));
              resolve(response.data.datas);
            }
          });
        }
      });
    },
    getCarrierList (warehouseId, warehouseIdList) {
      /**
       * 返回当前仓库下面的物流方式分类
       * @params （必需） warehouseId 仓库id
       * @params （必需） warehouseIdList 仓库列表
       * */
      let v = this;
      let warehouseType = warehouseIdList.filter(i => {
        if (i.warehouseId === warehouseId) {
          return i;
        }
      })[0].warehouseType;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_enableCarriersApi + '?warehouseId=' + warehouseId + '&isFilter=true' + '&warehouseType=' + warehouseType).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getCarrierShippingList (carrierId, warehouseId) {
      /**
       * 返回发货物流方式
       * @params carrierId （必需） 物流商id
       * @params warehouseId （必需） 仓库id
       * */
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_enableShippingMethodsApi + '?carrierId=' + carrierId + '&warehouseId=' + warehouseId).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getCommonCountryName (selectArr) { // 获取对应国家名字
      let v = this;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTreeName(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));

              makeTreeName(data);
            }
          });
        }

        function makeTreeName (data) {
          let arr = [];
          data.forEach((n, i) => {
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k.indexOf('.') > 0) {
                if (n.zoneCode === k.split('.')[0]) {
                  if (n.countries && n.countries.length > 0) {
                    n.countries.forEach((g, l) => {
                      if (k.split('.')[1] === g.twoCode) {
                        arr.push(g.cnName);
                      }
                    });
                  }
                }
              } else {
                if (k === n.zoneCode) {
                  arr.push(n.zoneCnName);
                }
              }
            });
          });
          v.countryCodesName = arr.toString();
        }
      });
    },
    handleFormatError () { // 上传文件格式异常
      this.$Message.error('文件格式有误');
    },
    isDelModal (okCallback, cancelCallback, total, tipTxt) {
      let content = tipTxt;
      if (this.$common.isEmpty(tipTxt)) {
        content = this.$common.isEmpty(total) ? `是否确认删除?` : `是否确认删除<span style="color: #f20;">${total}</span> 条数据?`;
      }
      this.$Modal.confirm({
        title: '温馨提示', // content: '<p>确认是否删除</p>',
        content: content,
        onOk: () => {
          okCallback && okCallback();
        },
        onCancel: () => {
          cancelCallback && cancelCallback();
        }
      });
    },
    setImgPath (path, isGetThumb) {
      if (path) {
        if (path.includes('http://') || path.includes('https://')) {
          return path;
        } else if (isGetThumb) {
          return this.filenodeViewTargetUrl + '/thumb' + path;
        } else {
          return this.filenodeViewTargetUrl + path;
        }
      } else {
        return './static/images/placeholder.jpg';
      }
    },
    tableImg (h, params, imgKey, imgSrc, clickHandel, placement, quantity) {
      let v = this;
      let imgUrl = imgSrc || params.row[imgKey];
      return h('Poptip', {
        props: {
          placement: placement || 'right',
          trigger: 'hover',
          transfer: true
        },
        style: {
          width: '46px',
          height: quantity ? 'auto' : '46px',
          objectFit: 'cover',
          verticalAlign: 'middle',
          margin: '2px'
        }
      }, [
        h('div', {}, [
          h('img', {
            attrs: {
              src: v.setImgPath(imgUrl, true),
              onerror: 'javascript:this.src=\'./static/images/placeholder.jpg\''
            },
            style: {
              width: '46px',
              height: '46px',
              objectFit: 'cover',
              verticalAlign: 'middle',
              cursor: 'pointer'
            },
            on: {
              'click' () {
                clickHandel && clickHandel();
              }
            }
          }),
          (quantity ? h('div', {
            style: {
              'margin-top': '5px',
              'text-align': 'center'
            }
          }, `X ${quantity}`) : h('span'))
        ]), !imgUrl || h('img', {
          slot: 'content',
          props: {},
          attrs: {
            src: v.setImgPath(imgUrl)
          },
          style: {
            width: '400px',
            height: 'auto',
            verticalAlign: 'middle'
          }
        })
      ]);
    },
    nameAddOne (data) {
      let name = data;
      /* let reg = /.*\(\d\)$/g;
       if (reg.test(name)) {
       let str1 = Number(name.replace(/.*\((\d)\)$/g, '$1')) + 1;
       name = name.replace(/(?<=\()(\d)(?=\)$)/g, str1);
       } else {
       name = name + '(0)';
       } */
      return name + '(0)';
    },
    ajaxData (obj) { // 再封装XHR
      let v = this;
      let data = obj.hasOwnProperty('data') ? JSON.stringify(obj.data) : {};
      let axiosObj = {};
      if (obj.headers) {
        axiosObj.headers = Object.assign({}, obj.headers);
      }
      return v.axios(Object.assign(axiosObj, {
        method: obj.type ? obj.type : 'post',
        url: obj.url,
        data: data
      }))
    },
    search: debounce(function () { // 搜索查询共用方法
      this.tableLoading = true;
      this.SearchDisabled = true;
      this.pageParamsStatus = true;
      this.curPage = 1;
      this.pageParams.pageNum = 1;
    }, 600),
    getPermission (name) { // 是否有权限
      let v = this;
      if (v.isAdmin || v.controlList[name]) return true;
    },
    getPermissionCallback (name) {
      return new Promise(resolve => {
        if (this.$common.isEmpty(name)) return resolve();
        let data = sessionStorage.getItem('roleData:') || this.$store.state.roleData;
        if (this.$common.isEmpty(data)) return resolve();
        if (typeof data !== 'string') {
          data = JSON.stringify(data);
        }
        data = data.split(',');
        const host = window.location.host;
        if (this.isAdmin || data.includes(name)) return resolve();
        if (host.includes(':8080')) {
          console.warn('当前菜单无权访问，但由于本地开发环境可以暂时访问');
          return resolve();
        }
        this.gotoError();
      });
    },
    getTableHeight (curHeight) {
      return this.domHeight - curHeight < 400 ? 400 : this.domHeight - curHeight;
    },
    // 更新标签时，把已勾选的数据勾选回去
    reloadTag (val) { // 标签更新
      if (this.orderData && this.orderData.length > 0) {
        let orderIds = [];
        if (!this.$common.isEmpty(this.selectList)) {
          orderIds = this.selectList.map(item => item.orderId);
        }
        this.orderData.forEach((n, i) => {
          if (n.orderId === this.orderDetailsId) {
            this.orderData[i].orderTagList = val;
          }
          this.$set(this.orderData[i], '_checked', orderIds.includes(n.orderId));
        });
        if (this.$common.isEmpty(this.selectList)) return;
        this.selectList = this.orderData.filter(filRow => {
          return filRow._checked;
        })
      }
    },
    loadingTrue () {
      this.$nextTick(function () {
        this.tableLoading = true;
        this.SearchDisabled = true;
      });
    },
    loadingFalse () { // 重置table loading状态
      this.$nextTick(function () {
        this.tableLoading = false;
        this.SearchDisabled = false;
      });
    },
    setControlList () {
      let storeRoleList = this.$store.state.roleList;
      return storeRoleList;
    },
    resetSpinShow () {
      this.spinShow = false;
    },
    spinLoading () {
      this.spinShow = true;
    },
    getOrderListTag () { // 获取标签列表
      return new Promise((resolve) => {
        this.axios.get(api.get_orderListTag + '?type=1& time=' + new Date().getTime()).then(response => {
          if (!response.data || response.data.code != 0) {
            this.tagsList = [];
            return resolve([]);
          }
          this.tagsList = response.data.datas || [];
          resolve(this.$common.copy(response.data.datas || []));
        }).catch(() => {
          this.tagsList = [];
          return resolve([]);
        })
      })
    },
    getOrderListTagNew (fixService, getCache = true) {
      /**
       * 获取标签列表
       * params
       * fixService 非order-service 调用时需用
       * getCache 是否获取缓存 默认获取
       * */
      let v = this;
      let apiFixed = '';
      if (getCache && sessionStorage.getItem('tagsList')) {
        // 获取标签缓存
        v.$nextTick(() => {
          v.tagsList = JSON.parse(sessionStorage.getItem('tagsList'));
        });
      }

      if (fixService) {
        apiFixed = fixService;
      }
      v.axios.get(apiFixed + api.get_orderListTag + '?type=1& time=' + new Date().getTime()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          sessionStorage.setItem('tagsList', JSON.stringify(data));
          v.$nextTick(function () {
            v.tagsList = data;
          });
        }
      });
    },
    getCountrys () {
      return new Promise((resolve) => {
        if (localStorage.getItem('area') === undefined || localStorage.getItem('area') === '[]') {
          localStorage.removeItem('area');
        }
        if (localStorage.getItem('area') !== 'null' && localStorage.getItem('area')) {
          this.formValidate.country = (JSON.parse(localStorage.getItem('area'))).filter(f => !!f.twoCode);
          return resolve(this.formValidate.country);
        }
        let prefix = this.isSettingSpecial();
        this.axios.get(prefix + api.get_countrys).then(response => {
          if (!response || !response.data || response.data.code != 0) {
            return resolve([]);
          }
          let data = response.data.datas;
          this.formValidate.country = data.filter(f => !!f.twoCode);
          localStorage.setItem('area', JSON.stringify(data));
          resolve(this.formValidate.country);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    isSettingSpecial () {
      let url = window.location.href;
      if (url.indexOf('orderSettings.html') > -1) {
        return '/order-service/erpCommon/';
      } else if (url.indexOf('logistics.html') > -1) {
        return '/wms-service/erpCommon/';
      } else if (url.indexOf('customSettings.html') > -1) {
        return '/order-service/erpCommon/';
      } else if (url.indexOf('pdsSettings.html') > -1) {
        return '/pds-service/erpCommon/';
      } else {
        return './erpCommon/';
      }
    },
    countryChange (value) { // 高级筛选国家列表获取
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.buyerCountryCodeList = null;
      } else {
        v.pageParams.buyerCountryCodeList = value;
      }
    },
    getDefaultTimezoom() { // 获取默认时区
      let timezoom = localStorage.getItem('timezoom');
      if (!isNaN(Number(timezoom)) && timezoom != null) {
        return Number(timezoom);
      }
      const nowDate = new Date();
      const dateISO = nowDate.toISOString().split(/[^0-9]/);
      const dateLocale = nowDate.toLocaleString().split(/[^0-9]/);
      timezoom = Number(dateLocale[3]) - Number(dateISO[3])
      localStorage.setItem('timezoom', timezoom);
      return timezoom;
    },
    getNowTime () { // 获取用户设置的时间
      let timezoom = this.getDefaultTimezoom();
      if (timezoom !== undefined) {
        let diffTime = Number(timezoom) * 60 * 60 * 1000;
        return new Date().getTime() - diffTime;
      } else {
        return new Date().getTime();
      }
    },
    getDateTime (date, type) { // 时间格式获取
      let d = new Date(date);
      let year = d.getFullYear();
      let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      if (type === 'fulltime') {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    getUniversalTime (date, type) { // UTC时间
      if (date === null) return;
      let d = new Date(date);
      let year = d.getUTCFullYear();
      let month = d.getUTCMonth() + 1 < 10 ? '0' + (d.getUTCMonth() + 1) : d.getUTCMonth() + 1;
      let day = d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate();
      let hours = d.getUTCHours() < 10 ? '0' + d.getUTCHours() : d.getUTCHours();
      let minutes = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
      let seconds = d.getUTCSeconds() < 10 ? '0' + d.getUTCSeconds() : d.getUTCSeconds();
      if (type === 'fulltime') {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    setTimeHandel (date) {
      /*
       *当天的显示 hh:mm
       本周内的显示
       本周外、今年内的显示
       今年之前的显示 */
      let v = this;
      if (date === null) return null;
      let newDate = new Date(date).getTime();
      let today = new Date(new Date(new Date().toLocaleDateString()).getTime());
      var day = new Date(today).getDay() || 7; // 本周天数
      var year = new Date(today).setMonth(0);
      year = new Date(year).setDate(1);
      if (newDate > new Date(today).getTime()) {
        // 今天
        return v.format('hh:mm', date);
      } else if (newDate > new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1 - day).getTime()) {
        // 本周
        return v.format('w hh:mm', date);
      } else if (newDate > new Date(year).getTime()) {
        // 本年
        return v.format('MM/dd hh:mm', date);
      } else {
        return v.format('yyyy/MM/dd hh:mm', date);
      }
    },
    getProductCategoryListMt (refresh = false) {
      // 获取商品分类(筛选下拉)
      /**
       * @params
       * refresh Boolean 是否刷新
       * */
      let v = this;
      return new Promise(resolve => {
        if (v.$store.state.productCategoryList && !refresh) {
          resolve(v.$store.state.productCategoryList);
        } else {
          v.axios.get('/wms-service/erpCommon' + api.get_productCategory + '?time=' + new Date().getTime(), { hiddenError: true }).then(response => {
            if (response.data.code === 0) {
              v.$store.commit('productCategoryList', response.data.datas);
              resolve(response.data.datas);
            }
          });
        }
      });
    },
    sepCommasFn (params, splits) {
      const newSplit = typeof splits === 'string' ? [splits] : Array.isArray(splits) ? splits : [',', '，', '\n'];
      // 中英文逗号分隔
      if (params && typeof params === 'string') {
        return params.split(new RegExp(`${newSplit.join('|')}+`));
      }
      return params;
    },
    spaceComFun (params) {
      if (!params) return [];
      return params.split(' ');
    },
    format (format, date) {
      if (!date) {
        date = new Date();
      } else {
        date = new Date(date);
      }

      var Week = [
        '周日', '周一', '周二', '周三', '周四', '周五', '周六'
      ];
      // var Week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      var o = {
        'y+': date.getFullYear(), // year
        'M+': date.getMonth() + 1, // month
        'd+': date.getDate(), // day
        'h+': date.getHours(), // hour
        'H+': date.getHours(), // hour
        'm+': date.getMinutes(), // minute
        's+': date.getSeconds(), // second
        'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
        'S': date.getMilliseconds(), // millisecond
        'w': Week[date.getDay()]
      };
      if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
      }
      return format;
    },
    /**
     *
     * @date: 2021/8/24 10:12
     * @param businessRoleTypeItem 用户
     */
    isCargoOwner (businessRoleTypeItem) {
      let _businessRoleTypeList = businessRoleTypeItem || this.$store.state.erpConfig.userInfo.businessRoleTypeList;
      return _businessRoleTypeList && _businessRoleTypeList.includes('cargoOwner');
    },
    getDataToLocalTime (date, type) { // 本地时间
      return this.$common.getDataToLocalTime(date, type);
    },
    getRemainTime (date, type) { // 剩余时间
      let v = this;
      if (date === null) return null;
      let remainTime = new Date(v.getDataToLocalTime(date, 'fulltime')).getTime() / 1000;
      let nowDate = new Date().getTime() / 1000;
      return v.getLimitTime(remainTime - nowDate, type);
    },
    toogleContentDisplay (status, cname) { // 箭头状态，是否显示的div
      let v = this;
      if (v[status] === 'chevron-up') {
        v[status] = 'chevron-down';
        v[cname] = false;
      } else {
        v[status] = 'chevron-up';
        v[cname] = true;
      }
    },
    hideLayer (cname) {
      let v = this;
      v[cname] = true;
    },
    validateEmail () { // 邮箱格式校验，可共用
      let v = this;
      const reg = v.$regular.isMailbox; // /^(.+)@(.+)((\.\w{2,6}){1,3})$/
      let validateEmail = function (rule, value, callback) {
        if (value === '') {
          callback(new Error('请填写邮件地址'));
        } else if (!reg.test(value)) {
          callback(new Error('不是有效的邮箱或者邮箱格式不正确'));
        } else {
          callback();
        }
      };
      return validateEmail;
    },
    validateEmpty () {
      let validateEmpty = function (rule, value, callback) {
        if (value === '' || value === null) {
          callback(new Error('内容不能为空'));
        } else {
          callback();
        }
      };
      return validateEmpty;
    },
    validateMobile () { // 手机校验，可共用
      let v = this;
      let fixedTelephone = v.$regular.fixedTelephone;
      let isPhone = v.$regular.isPhone;
      let isMob = v.$regular.isMob;
      let validateMobile = function (rule, value, callback) {
        let talg = !isPhone.test(value) && !isMob.test(value) && !fixedTelephone.test(value) && value !== '';
        if (value === '') {
          callback(new Error('请填写电话号码'));
        } else if (talg) {
          callback(new Error('电话号码格式不正确'));
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    typeOf (obj) {
      let toString = Object.prototype.toString;
      let map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
      };
      return map[toString.call(obj)];
    },
    deepCopy (data) {
      let v = this;
      let t = v.typeOf(data);
      let o;
      if (t === 'array') {
        o = [];
      } else if (t === 'object') {
        o = {};
      } else {
        return data;
      }
      if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
          o.push(v.deepCopy(data[i]));
        }
      } else if (t === 'object') {
        for (let i in data) {
          o[i] = v.deepCopy(data[i]);
        }
      }
      return o;
    },
    shallowCopy (src) {
      let dst = {};
      for (let prop in src) {
        if (src.hasOwnProperty(prop)) {
          dst[prop] = src[prop];
        }
      }
      return dst;
    },
    getShippingList (noWarehouseId) {
      let v = this;
      let url = '?warehouseId=' + v.selectStore + '&isFilter=true';
      if (noWarehouseId) {
        url = '?isFilter=true';
      }
      v.axios.get(api.erpServiceCommon + api.get_enableCarriers + url).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts,
              apiInterface: data[i].apiInterface
            });
            if (i === data.length - 1) {
              v.shippingMethodData = pos;
            }
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    getShippingListNoAuth (noWarehouseId) {
      let v = this;
      let url = '?warehouseId=' + v.selectStore + '&isFilter=true';
      if (noWarehouseId) {
        url = '?isFilter=true';
      }
      v.axios.get(api.erpServiceCommon + api.get_enableCarriersApi + url).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts,
              apiInterface: data[i].apiInterface
            });
            if (i === data.length - 1) {
              v.shippingMethodData = pos;
            }
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    getOrderTagList (prefix) { // 获取标签列表(筛选下拉)
      let v = this;
      return new Promise(resolve => {
        let url = api.get_orderTagList;
        if (prefix) {
          url = prefix + url + '?time=' + new Date().getTime();
        }
        v.axios.get(url).then(function (response) {
          if (response.data.code === 0) {
            v.tagIdList = response.data.datas;
            resolve(response.data.datas);
          }
        });
      });
    },
    loadData (item, callback) {
      item.loading = true;
      let v = this;
      v.axios.get(api.erpServiceCommon + api.get_enableShippingMethods + '?carrierId=' + item.value + '&warehouseId=' + v.selectStore).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: [
                data[i].shippingMethodId, item.carrierAccounts
              ],
              label: data[i].carrierShippingMethodName
            });
            if (i === data.length - 1) {
              item.children = pos;
              item.loading = false;
              callback();
            }
          }
          if (data.length === 0) {
            item.children = pos;
            item.loading = false;
            v.$Message.warning('没有相关记录');
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
        v.$Message.error('系统繁忙，请重新尝试');
      });
    },
    getAccount (value, selectedData) {
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel = [];
      v.shippingAccountModel = [];
      v.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG)的时候，不显示账号
      v.getCarrierBaseSetting(value[1][0]);
      if (value[1][1] !== null) {
        v.carrierAccount = value[1][1];
      }
    },
    getCarrierBaseSetting (shippingMethodId, model) {
      let v = this;
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
      v.axios.get(api.get_shippingMethodParams + '?shippingMethodId=' + shippingMethodId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            if (model) {
              v[model].push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            } else {
              v.shippingMethodModel.push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            }
          });
          v.carrierBaseSetting = data;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    toggleMoreFilter () {
      let v = this;
      if (v.moreFilter) {
        v.moreFilter = false;
        v.moreFilterMes = v.storeFilterMes;
        v.moreFilterIcon = 'md-arrow-dropdown';
      } else {
        v.moreFilter = true;
        if (v.storeFilterMes === '') {
          v.storeFilterMes = v.moreFilterMes;
        }
        if (v.pageParams.searchValue && v.pageParams.searchValue !== '') {
          v.pageParams.searchValue = '';
        }
        v.moreFilterMes = '收起';
        v.moreFilterIcon = 'md-arrow-dropup';
      }
    },
    modifyTheSort (index, status) {
      let v = this;
      v.pageParams.orderBy = v.buttonGroupModel[index].type;
      v.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
      v.pageParamsStatus = true;
    },
    changePage (page) { // 分页切换
      this.loading = true;
      this.pageParams.pageNum = page;
      this.pageParamsStatus = true;
      this.curPage = page;
    },
    showShippingData (value) {
      if (value) {
        if (this.selectStoreStatus || this.selectStore) {
          this.getShippingList();
        } else {
          this.$Message.error('请选择仓库');
        }
      }
    },
    showShippingDataNoWare () {
      this.getShippingList();
    },
    showShippingDataNoAuth () {
      this.getShippingListNoAuth();
    },
    resetTag () {
      let v = this;
      v.tagIdList = [];
      v.orderIdList = [];
    },
    dropOrderTag (checkIdList, otherParams) {
      const orderIds = this.$common.isArray(checkIdList) ? checkIdList : this.orderIdList || [];
      if (orderIds.length === 0) {
        this.$Message.error('请选择订单');
        return false;
      }
      let addParams = this.$common.copy(otherParams || {});
      if (this.$common.isEmpty(addParams.orderType)) {
        addParams.orderType = 0;
      }
      const pushParams = this.$common.getParams(addParams);
      this.axios.delete(`${api.drop_orderTag}?orderIds=${orderIds.join(',')}&${pushParams}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('清空标签成功');
          this.pageParamsStatus = true;
          this.resetTag();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('系统繁忙，请重新尝试');
          this.resetTag();
        }
      });
    },
    setTag (checkIdList, otherParams) { // 打标签
      const orderIds = this.$common.isArray(checkIdList) ? checkIdList : this.orderIdList || [];
      let pushParams = this.$common.copy(otherParams || {});
      if (this.$common.isEmpty(pushParams.orderType)) {
        pushParams.orderType = 0;
      }
      if (orderIds.length === 0) {
        this.$Message.error('请选择订单');
      } else if (this.tagIdList.length === 0) {
        this.$Message.error('请选择标签');
      } else {
        let obj = {
          ...pushParams,
          orderIdList: orderIds,
          tagIdList: this.tagIdList
        };
        this.axios.post(api.set_tag, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            this.$Message.success('标记成功');
            this.resetTag();
            this.setTagListStatus = false;
            this.pageParamsStatus = true;
          } else {
            (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
          }
        });
      }
    },
    changePageSize (pageSize, plat) {
      if (this.pageParams) {
        this.pageParams.pageSize = pageSize;
      }
      if (this.pageParamsCustomize) {
        this.pageParamsCustomize.pageSize = pageSize;
      }
      this.tableLoading = true;
      this.SearchDisabled = true;
      this.pageParamsStatus = true;
    },
    gotoError () {
      this.$router.push({
        path: '/noPersermission'
      });
    },
    countryName (code) { // 匹配单个国家名字
      return new Promise((resolve) => {
        let area = localStorage.getItem('area');
        if (this.$common.isEmpty(code) || this.$common.isEmpty(area)) return resolve('');
        // 匹配国家名字
        area = JSON.parse(area);
        const countryInfo = area.find(item => {
          return item.twoCode === code;
        })
        if (this.$common.isEmpty(countryInfo)) return resolve('');
        resolve(countryInfo.enName);
      });
    },
    getLimitTime (value, type = true) { // 剩余时间计算
      let theTime = Math.abs(parseInt(value)); // 秒
      let day = 0;
      let theTime1 = 0; // 分
      let theTime2 = 0; // 小时
      if (theTime / 60 / 60 / 24 >= 1) {
        day = parseInt(theTime / 60 / 60 / 24);
        theTime = theTime % (60 * 60 * 24);
        if (theTime / 60 / 60 >= 1) {
          theTime2 = parseInt(theTime / 60 / 60);
          theTime = theTime % (60 * 60);
          if (theTime / 60 >= 1) {
            theTime1 = parseInt(theTime / 60);
          }
        }
        if (type) {
          return day + 'd ' + theTime2 + 'h ' + theTime1 + 'm';
        }
        return day + 'day ' + theTime2 + 'hour ' + theTime1 + 'min';
      } else if (theTime / 60 / 60 / 24 < 1 && theTime / 60 / 60 >= 1) {
        theTime2 = parseInt(theTime / 60 / 60);
        theTime = theTime % (60 * 60);
        if (theTime / 60 >= 1) {
          theTime1 = parseInt(theTime / 60);
        }
        if (type) {
          return theTime2 + 'h ' + theTime1 + 'm';
        }
        return theTime2 + 'hour ' + theTime1 + 'min';
      } else if (theTime / 60 / 60 / 24 < 1 && theTime / 60 / 60 < 1 && theTime / 60 >= 1) {
        theTime1 = parseInt(theTime / 60);
        if (type) {
          return theTime1 + 'm';
        }
        return theTime1 + 'min';
      } else {
        return 'Less than a minute';
      }
    },
    getErpConfig () { // 获取ERP基础配置
      return new Promise(resolve => {
        this.axios.get(api.get_erpConfig).then(response => {
          if (response.data.code === 0) {
            let resInfo = this.$common.copy(response.data.datas);
            resInfo.allYmsMerchantIds = null;
            if (!this.$common.isEmpty(resInfo.merchant)) {
              resInfo.merchant.isSupplier = 0;
              resInfo.merchant.isYmsCore = 0;
              resInfo.merchant.ymsCoreDomain = null;
              resInfo.merchant.ymsCoreStatus = 0;
              resInfo.merchant.ymsListingDatabaseId = null;
              resInfo.merchant.ymsListingDomain = null;
              resInfo.merchant.ymsListingStatus = null;
            }
            if (!this.$common.isEmpty(resInfo.userInfo)) {
              resInfo.userInfo.ymsCoreStatus = null;
            }
            console.warn(`接口：${api.get_erpConfig} 返回值已被修改后存入store，任务号：11062`);
            this.$store.commit('erpConfig', resInfo);
            resolve(true);
          }
        });
      });
    },
    getUserName (userId) { // 从用户列表中获取相关用户名
      if (userId === '系统操作') return userId;
      let userInfoList = this.$store.state.userInfoList;
      if (userInfoList !== null && userInfoList[userId] !== undefined) {
        return userInfoList[userId].userName;
      }
      return userId;
    },
    resetLoading (loadingName) { // reset loading common method
      let v = this;
      v[loadingName] = false;
      v.$nextTick(function () {
        v[loadingName] = true;
      });
    },
    getPlatformGroup (status, url) { // 查看已开启平台
      let v = this;
      if (!status) status = 1;
      return new Promise(resolve => {
        let apiUrl = api.get_queryByStatus;
        if (url) {
          apiUrl = url + api.get_queryByStatus;
        }
        v.axios.get(apiUrl + '?status=' + status).then(response => {
          if (response && response.data.code === 0) {
            v.platformGroupList = (response.data.datas || []);
            v.$store.commit('platformGroup', v.platformGroupList);
            localStorage.setItem('platformGroup', JSON.stringify(v.platformGroupList));
          }
        }).finally(() => {
          setTimeout(() => {
            resolve(true);
          }, 300)
        });
      });
    },
    getPrintExeUrl (platform) {
      let v = this;
      return new Promise(resolve => {
        let apiUrl = api.get_downloadPrint;
        if (platform === 'wms') {
          apiUrl = api.get_downloadPrintWms;
        }
        v.axios.get(apiUrl).then(res => {
          if (res.data.code === 0) {
            if (platform === 'wms') {
              let targetUrl = v.$store.state.erpConfig.filenodeViewTargetUrl.replace('./', '/wms-service/');
              resolve(targetUrl + res.data.datas);
            } else {
              resolve(v.$store.state.erpConfig.filenodeViewTargetUrl + res.data.datas);
            }
          } else {
            resolve();
          }
        });
      });
    },
    getCurrencyInfo () { // 获取币种下拉
      let v = this;
      let pos = [];
      return new Promise(resolve => {
        v.axios.get(api.get_currencyInfo + '?time=' + new Date().getTime()).then(response => {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              pos.push({
                label: n.currencyCode + '-' + n.currencyCnName,
                value: n.currencyCode
              });
            });
            v.currencyList = pos;
            resolve(data);
          }
        }).catch(() => {
          resolve([]);
        });
      });
    },
    getShopList (type, prefix, platformArr, addcheckUser) { // 获取店铺列表
      let v = this;
      let arr = [];
      let params = '';
      let subsystemCode = null;
      if (!prefix) {
        prefix = '/order-service/erpCommon';
      }
      // 订单和客服需要换接口
      if (window.location.href.includes('order-service')) {
        subsystemCode = 'order-service';
      } else if (window.location.href.includes('cs-service')) {
        subsystemCode = 'cs-service';
      } else {
        subsystemCode = null;
      }
      if (!subsystemCode) {
        if (addcheckUser) {
          params = '?checkUser=false';
        }
        if (!type && !platformArr) {
          arr = [v.platformType];
          v.axios.post(prefix + api.get_shopList + params, JSON.stringify(arr)).then(response => {
            v.shopList = response.data.datas;
          });
        } else if (type && !platformArr) {
          return new Promise(resolve => {
            v.getPlatformGroup().then(result => {
              if (result) {
                let arr = v.$store.state.platformGroup;
                let newArr = [];
                arr.forEach((n, i) => {
                  newArr.push(n.platformId);
                });
                v.axios.post(prefix + api.get_shopList + params, JSON.stringify(newArr)).then(response => {
                  v.shopList = response.data.datas;
                  resolve(true);
                });
              }
            });
          });
        } else if (platformArr.length > 0) {
          v.axios.post(prefix + api.get_shopList + params, JSON.stringify(platformArr)).then(response => {
            v.shopList = response.data.datas;
          });
        }
      } else {
        if (!type && !platformArr) {
          arr = [v.platformType];
          v.axios.post(prefix + api.get_querySaleAccounts, {
            'platformIds': arr,
            'subsystemCode': subsystemCode
          }).then(response => {
            v.shopList = response.data.datas;
          });
        } else if (type && !platformArr) {
          return new Promise(resolve => {
            v.getPlatformGroup().then(result => {
              if (result) {
                let arr = v.$store.state.platformGroup;
                let newArr = [];
                arr.forEach((n, i) => {
                  newArr.push(n.platformId);
                });
                v.axios.post(prefix + api.get_querySaleAccounts, {
                  'platformIds': newArr,
                  'subsystemCode': subsystemCode
                }).then(response => {
                  v.shopList = response.data.datas;
                  resolve(true);
                });
              }
            });
          });
        } else if (platformArr.length > 0) {
          v.axios.post(prefix + api.get_querySaleAccounts, {
            'platformIds': platformArr,
            'subsystemCode': subsystemCode
          }).then(response => {
            v.shopList = response.data.datas;
          });
        }
      }
    },
    closeModal (model) { // 公共关闭弹出框方法
      let v = this;
      v[model] = false;
    },
    domWidthHeight () {
      this.domWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
      this.domHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
    }, // 获取店铺数据
    getShopListData (platformIds) {
      return new Promise((resolve) => {
        let prefix = '/order-service/erpCommon';
        let subsystemCode = 'order-service';
        this.axios.post(prefix + api.get_querySaleAccounts, {
          'platformIds': platformIds,
          'subsystemCode': subsystemCode
        }).then(response => {
          if (!response.data || response.data.code != 0) {
            this.shopListData = [];
            return resolve([]);
          }
          this.shopListData = response.data.datas || [];
          resolve(response.data.datas || []);
        }).catch(() => {
          this.shopListData = [];
          resolve([]);
        })
      })
    },
    // 获取有权限的渠道,并返回所有店铺
    getHavePlatformGroup () {
      return new Promise((resolve) => {
        let platformData = [];
        let platformShopData = [];
        let data = JSON.parse(localStorage.getItem('platformGroup'));
        const newPlatform = data.filter((item) => item.type === 2).map(m => {
          return { ...m, platformId: m.platformId, selected: false, name: m.name }
        });
        this.getAllShopData(newPlatform || []).then(resArr => {
          let pIds = [];
          resArr.forEach((item) => {
            if (!this.$common.isEmpty(item.children)) {
              platformShopData = [...platformShopData, ...item.children];
              pIds.push(item.value);
            }
          })
          platformData = newPlatform.filter(f => pIds.includes(f.platformId));
          platformData.unshift({
            platformId: pIds,
            selected: true,
            name: '全部'
          });
          resolve({ platformData: platformData, shopData: platformShopData, cascaderData: resArr });
        }).catch(() => {
          resolve({ platformData: platformData, shopData: platformShopData, cascaderData: [] });
        })
      });
    },
    // 获取所有自定义平台的店铺以及有权限的平台
    getAllShopData (platfGroup) {
      return new Promise((resolve) => {
        let cascaderData = [];
        const getAllPlatform = platfGroup.map((item) => {
          return () => {
            return new Promise((resolve) => {
              this.axios.post(api.get_querySaleAccounts, { platformIds: [item.platformId], subsystemCode: 'order-service' }).then(res => {
                if (!res || !res.data || res.data.code != 0) {
                  return resolve({ value: item.platformId, label: item.name, children: [] });
                }
                resolve({
                  value: item.platformId,
                  label: item.name,
                  children: (res.data.datas || []).map(m => {
                    return { ...m, value: m.saleAccountId, label: m.accountCode }
                  })
                });
              }).catch(() => {
                resolve({ value: item.platformId, label: item.name, children: [] });
              })
            })
          }
        });
        this.$common.promiseAll(getAllPlatform).then(resArr => {
          cascaderData = resArr.filter((item) => {
            return !this.$common.isEmpty(item.children);
          });
          resolve(cascaderData);
        }).catch(() => {
          resolve(cascaderData);
        });
      })
    },
    // 复制内容按钮
    CopyContentBtn (code) {
      let oInput = document.createElement('input');
      oInput.value = code;
      document.body.appendChild(oInput);
      oInput.select();
      window.document.execCommand('Copy');
      this.$Message.success('复制成功');
      oInput.remove();
    },
    // 获取滚动条当前的位置
    getScrollTop () {
      let scrollTop = 0;
      if (document.documentElement && document.documentElement.scrollTop) {
        scrollTop = document.documentElement.scrollTop;
      } else if (document.body) {
        scrollTop = document.body.scrollTop;
      }
      return scrollTop;
    },
    // 获取SKU待办项条数
    getSkuAwaitNumber () {
      setTimeout(() => {
        const dom = document.querySelector('.product-sku-await-number');
        if (!dom) return;
        const showLable = this.getPermission('productBacklog_lable');
        if (!showLable) {
          dom.style.display = 'none';
          return;
        }
        this.axios.post(api.skuAwaitNumber, (this.getUseBusinessDeptIds.split(',')).map(m => Number(m)), { hiddenError: true }).then((res) => {
          if (!res || !res.data || res.data.code != 0 || res.data.datas == 0) {
            dom.innerText = '';
            dom.title = '';
            dom.style.display = 'none';
            return;
          }
          dom.style.display = 'inline-block';
          dom.title = `有 ${res.data.datas} 条SKU待办项临近到期`;
          dom.innerText = res.data.datas;
        });
      }, 100)
    },
    // 获取当前可视范围的高度
    getClientHeight () {
      let clientHeight = 0;
      if (document.body.clientHeight && document.documentElement.clientHeight) {
        clientHeight = Math.min(
          document.body.clientHeight,
          document.documentElement.clientHeight
        );
      } else {
        clientHeight = Math.max(
          document.body.clientHeight,
          document.documentElement.clientHeight
        );
      }
      return clientHeight;
    },
    // 获取文档完整的高度
    getScrollHeight () {
      return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
    },
    // 计算列表剩余时间
    computedTime (remainTime, type = true) {
      let str = '';
      if (remainTime === 0) {
        str = '逾期';
      } else if (remainTime === null) {
        str = '';
      } else {
        // 标发货剩余时间
        str = this.getLimitTime(remainTime, type);
      }
      return str;
    },
    /**
     * @Description: 根据数组的属性值进行分组的方法
     * @author jing
     * @date: 2020/9/7 17:08
     * @params: array 数组, fun 遍历的属性值函数, type 根据的属性值
     */
    handerGrouping (array, fun, type) {
      let groups = {};
      array.forEach(function (item) {
        let group = JSON.stringify(fun(item));
        groups[group] = groups[group] || [];
        groups[group].push(item);
      });
      let new_arr = [];
      Object.keys(groups).map((group) => {
        let newItem = {
          data: groups[group]
        };
        if (this.$common.isArray(type)) {
          type.forEach(key => {
            newItem[key] = groups[group][0][key];
          })
        } else if (!this.$common.isEmpty(type)) {
          newItem[type] = groups[group][0][type];
        }
        new_arr.push(newItem);
      });
      return new_arr;
    },
    /**
     * @Description: 根据数组中的某个属性去重
     * @author jing
     * @date 2021/3/11 18:02
     * @params:
     */
    uniqueFunc (...args) {
      const paramsLength = arguments.length;
      if (paramsLength == 1) {
        // return [...new Set(arr)];
        return [...new Set(arguments)];
      } else {
        const res = new Map();
        const flag = arguments[1];
        return arguments[0].filter(item => !res.has(item[flag]) && res.set(item[flag], item));
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.domWidthHeight);
    this.$Message.config({
      duration: 5
    });
  },
  filters: {
    amountFormat (amount) {
      if (!isNaN(Number(amount))) {
        return amount.toString().replace(/(\d)(?=(\d{3})+(?!(\d)))/g, '$1,');
      } else {
        return 0;
      }
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.domWidthHeight); // 通过有名函数 解除事件订阅
  }
};
