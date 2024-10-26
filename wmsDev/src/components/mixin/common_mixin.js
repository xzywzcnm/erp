import api from '@/api/api';
import {
  cainiaoPrint,
  initCainiao
} from '@/utils/index';
import Qs from 'qs';
import { getWarehouseId, getWareHouseItem } from '@/utils/getService';

// const wareHouseItem = getWareHouseItem();

export default {
  data() {
    return {
      isYms: null,
      currencyList: [],
      platformGroupList: [],
      datePickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-7, "day")), end];
            },
          },
          {
            text: "最近一个月",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-1, "month")), end];
            },
          },
          {
            text: "最近三个月",
            value: () => {
              const end = new Date();
              return [new Date(this.$common.dayjs(end).add(-3, "month")), end];
            },
          },
        ],
      },
      failTypeList: [
        {
          value: 1,
          color: '#169BD5',
          label: '盘点'
        },
        {
          value: 2,
          color: '#FF33FF',
          label: '未上架'
        },
        {
          value: 4,
          color: '#FF9900',
          label: '缺货'
        },
        // {
        //   value: 8,
        //   color: 'red',
        //   label: '未知异常'
        // }
      ],
      columns11: [
        {
          title: 'Name',
          key: 'name'
        }, {
          title: 'Age',
          key: 'age'
        }, {
          title: 'Address',
          key: 'address'
        }
      ],
      data11: [
        {
          name: 'John Brown',
          age: 18,
          address: 'New York No. 1 Lake Park',
          date: '2016-10-03'
        }, {
          name: 'Jim Green',
          age: 24,
          address: 'London No. 1 Lake Park',
          date: '2016-10-01'
        }, {
          name: 'Joe Black',
          age: 30,
          address: 'Sydney No. 1 Lake Park',
          date: '2016-10-02'
        }, {
          name: 'Jon Snow',
          age: 26,
          address: 'Ottawa No. 2 Lake Park',
          date: '2016-10-04'
        }
      ],
      baseUrl: process.env.BASE_URL,
      formValidate: {
        // 国家/地区列表
        country: []
      },
      shopList: [],
      shippingMethodModel: [],
      shippingMethodData: [],
      shippingAccountModel: [],
      isAdmin: this.$store.state.isAdmin,
      controlList: this.setControlList(),
      roleList: this.$store.state.roleList,
      pageArray: [10, 20, 50, 100],
      autoWidth: 0,
      domWidth: document.documentElement.clientWidth || document.body.clientWidth || 0,
      domHeight: document.documentElement.clientHeight || document.body.clientHeight || 0,
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
      gutterItem: 16,
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
      offsetCol: 1,
      labelWidth: 120,
      storeFilterMes: '',
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多筛选项',
      placeholderSrc: './static/images/placeholder.jpg',
      spinShow: false,
      SearchDisabled: false, // 禁用搜索按钮
      TableLoading: false, // 列表的loading变量
      dateOptions: {
        shortcuts: [
          {
            text: '近一周',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          }, {
            text: '近一个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          }, {
            text: '近三个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      }
    };
  },
  created() {
    const wareHouseItem = getWareHouseItem();
    this.isYms = wareHouseItem.isYms || 0;
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
  },
  watch: {
    roleList(n, o) {
      if (n !== o) {
        this.controlList = this.setControlList();
      }
    },
    // 监听路由变化
    $route(to, from) {
      if (!this.$common.isEmpty(this.pathList)) {
        const pathList = this.pathList.map(m => m.path);
        // 当路由不包含对应的值时，默认打开路由第一个值
        if (!pathList.includes(this.$route.path) && this.$route.path != '/noPersermission') {
          this.$router.push({ path: pathList[0], query: { warehouseId: getWarehouseId() } });
        }
      }
      if (to.path === this.$route.path) {
        this.workShow = 'list';
      }
    }
  },
  methods: {
    /**
         * @Description: 自动获取input输入库的焦点
         * @author jing
         * @date 2020/12/7 16:24
         * @params: 传入dom 的id
         */
    getFocus(id) {
      document.getElementById(id).focus();
    },

    getWarehouseId() {
      /**
             * @Description: 获取仓库id
             * @author gan
             * @date: 2020/10/19 14:31
             * @params:
             */
      return this.$store.state.warehouseId || getWarehouseId();
    },
    getPlatformGroup(status) { // 查看已开启平台
      let v = this;
      if (!status) status = 1;
      return new Promise(resolve => {
        v.axios.get(api.get_queryByStatus + '?status=' + status).then(response => {
          if (response && response.data.code === 0) {
            v.platformGroupList = response.data.datas;
          }
          resolve(response.data.datas);
        });
      });
    },
    setPageSizeCache(pageSize) {
      localStorage.setItem(this.$route.path + 'PageSize', pageSize);
    },
    getWaitCheckShelve(receiptNo) {
      /**
             * @param receiptNo String 入库单编号
             * */
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.queryWaitCheckShelve + receiptNo).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getPageSizeCache() {
      let value = localStorage.getItem(this.$route.path + 'PageSize');
      if (value && !isNaN(+value)) {
        return +value;
      } else {
        localStorage.removeItem(this.$route.path + 'PageSize');
        return 50;
      }
    },
    getCurrencyInfo() {
      // 获取币种下拉
      let v = this;
      let pos = [];
      return new Promise(resolve => {
        v.axios.get(api.get_currencyInfo + '?time=' + new Date().getTime()).then(response => {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              let label = n.currencyCode + (n.currencyCnName ? '-' + n.currencyCnName : '');
              pos.push({
                label: label,
                value: n.currencyCode
              });
            });
            v.currencyList = pos;
            resolve(data);
          }
        });
      });
    },
    getUserMesCommon() {
      let v = this;
      return new Promise(resolve => {
        let userInfoList = this.$store.state.userInfoList;
        if (userInfoList.length === 0) {
          this.axios.get(api.get_userInfoCommon).then(response => {
            if (response.data.code === 0) {
              if (response.data.datas !== null) {
                localStorage.setItem('userInfoList', JSON.stringify(response.data.datas));
                v.$store.commit('userInfoList', response.data.datas);
              }
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    /**
         *
         * @date: 2021/8/24 10:12
         * @param businessRoleTypeItem 用户
         */
    isCargoOwner(businessRoleTypeItem) {
      let _businessRoleTypeList = businessRoleTypeItem || this.$store.state.erpConfig.userInfo.businessRoleTypeList;
      return _businessRoleTypeList && _businessRoleTypeList.includes('cargoOwner');
    },
    getUserName(userId) { // 从用户列表中获取相关用户名
      /**
             * *注意 这个匹配是和后端返回做匹配 不做国际化
             * */
      if (userId === '系统操作') return userId;
      let userInfoList = this.$store.state.userInfoList;
      if (this.$common.isEmpty(userInfoList) || this.$common.isUndefined(userInfoList[userId])) {
        return userId;
      }
      return userInfoList[userId].userName;
    },
    printHtmlUrl(path, id) {
      let v = this;
      // 如果打印地址为html结尾 需要调用接口
      if (!path) return;

      if (path && path.indexOf('http') === -1) {
        let erpCommon = v.$store.state.erpConfig;
        if (erpCommon.filenodeViewTargetUrl === './filenode/s') {
          erpCommon.filenodeViewTargetUrl = window.location.href.split(/[^/]+(?!.*html)/)[0] + 'filenode/s';
        }
        path = erpCommon.filenodeViewTargetUrl + path;
      }
      return new Promise(resolve => {
        let str;
        let last;
        str = path.split('.');
        last = str[str.length - 1];
        if (last === 'html') {
          v.axios.get(api.get_loadUrlTxt + '?url=' + path).then(res => {
            if (res.data.code === 0) {
              let data = res.data.datas;
              resolve({
                content: data,
                postId: id
              });
            }
          });
        } else if (last === 'cainiao') {
          // 获取文本内容
          initCainiao().then((data) => {
            let websocket = data;
            v.axios.get(api.get_loadUrlTxt + '?url=' + path).then(response => {
              if (response.data.code === 0) {
                // 调用菜鸟打印
                let data = response.data.datas;
                cainiaoPrint(websocket, id, response.data.datas).then(() => {
                  resolve({
                    content: data,
                    postId: id,
                    printType: 'cainiao'
                  });
                });
              }
            });
          });
        } else {
          resolve({
            pdf: path,
            postId: id
          });
        }
      });
    },
    markPackagePrintedMt(id) {
      let v = this;
      v.$Modal.confirm({
        title: '温馨提示', // '温馨提示',
        content: '是否标记出库单已打印',
        closable: true,
        onOk() {
          v.axios.put(api.markPackagePrinted, {
            'packageIds': id
          }).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.search();
            }
          });
        }
      });
    },
    getPositionListNew(params = ['00', '10', '11', '12', '20'], pickingFlag = '1', query = '', warehouseBlockId = '') {
      let v = this;
      return new Promise(resolve => {
        let obj = {
          warehouseId: v.getWarehouseId(), // warehouseBlockType: params,
          pickingFlag: pickingFlag
        };

        let warehouseLocationName = query.replace(/^\s*|\s*$/g, '');
        this.axios.get(api.listByCondition + '?warehouseId=' + obj.warehouseId + '&pickingFlag=' + obj.pickingFlag + '&warehouseLocationName=' + warehouseLocationName + '&warehouseBlockId=' + warehouseBlockId).then(res => {
          if (res && res.data.code === 0) {
            v.$store.commit('positionList', res.data.datas);
            resolve(res.data.datas);
            // v.positionList = res.data.datas.list;
          }
        });
      });
    },

    setControlList() {
      let storeRoleList = this.$store.state.roleList;
      return storeRoleList;
    },
    // modifyTheSort(index, status) {
    //   let v = this;
    //   v.pageParams.orderBy = v.buttonGroupModel[index].type;
    //   v.buttonGroupModel.forEach((n, i) => {
    //     if (i === index && n.selected) {
    //       v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
    //     } else if (i === index && !n.selected) {
    //       n.selected = true;
    //     } else {
    //       n.selected = false;
    //     }
    //   });
    //   v.pageParams.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
    //   if (v.getList) {
    //     v.getList();
    //   }
    // },
    loadingFalse() {
      // 重置table loading状态
      this.$nextTick(function () {
        this.TableLoading = false;
        this.SearchDisabled = false;
      });
    },
    changePage(page) {
      // 分页切换
      let v = this;
      v.TableLoading = true;
      v.pageParams.pageNum = page;
      v.pageParamsStatus = true;
      v.curPage = page;
    },
    changePageSize(pageSize, plat) {
      this.setPageSizeCache(pageSize);
      this.pageParams.pageSize = pageSize;
      this.pageParamsStatus = true;
    },
    gotoError() {
      if (process.env.NODE_ENV == 'development') {
        console.warn('本地运行，无权限时不跳转');
      }
      this.$Message.error('您暂无权限');
      // this.$router.push({ path: '/noPersermission', query: { warehouseId: getWarehouseId() } });
    },
    resetSpinShow() {
      this.spinShow = false;
    },
    spinLoading() {
      this.spinShow = true;
    },
    getPermission(name) {
      let v = this;
      if (v.isAdmin || v.controlList[name]) return true;
    },
    getTableHeight(curHeight) {
      let v = this;
      return v.domHeight - curHeight < 400 ? 400 : v.domHeight - curHeight;
    },
    toggleMoreFilter() {
      let v = this;
      if (v.moreFilter) {
        v.moreFilter = false;
        v.moreFilterMes = v.storeFilterMes;
        v.moreFilterIcon = 'md-arrow-dropdown';
      } else {
        v.moreFilter = true;
        v.storeFilterMes === '' && (v.storeFilterMes = v.moreFilterMes);
        if (v.pageParams && v.pageParams.searchValue && v.pageParams.searchValue !== '') {
          v.pageParams.searchValue = '';
        }
        v.moreFilterMes = '收起';
        v.moreFilterIcon = 'md-arrow-dropup';
      }
    },
    countryChange(value) {
      // 高级筛选国家列表获取
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.buyerCountryCodeList = null;
      } else {
        v.pageParams.buyerCountryCodeList = value;
      }
    },
    getCountrys() {
      // 获取国家列表
      if (this.$common.isEmpty(localStorage.getItem('area'))) {
        localStorage.removeItem('area');
      }
      if (!this.$common.isEmpty(localStorage.getItem('area'))) {
        this.formValidate.country = JSON.parse(localStorage.getItem('area'));
      } else {
        this.axios.get(api.get_countrys).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.formValidate.country = data;
            localStorage.setItem('area', JSON.stringify(data));
          }
        });
      }
    },
    isDelModal(okCallback, cancelCallback, text) {
      let v = this;
      let content = text || '确认是否删除';
      v.$Modal.confirm({
        title: '温馨提示',
        content: '<p>' + content + '</p>',
        onOk: () => {
          okCallback && okCallback();
        },
        onCancel: () => {
          cancelCallback && cancelCallback();
        }
      });
    },
    sepCommasFn(params) {
      // 中英文逗号分隔
      let arr = [];
      if (params) {
        if (params.includes(',') && params.includes('，') && params.includes('\n')) {
          arr = params.split(',').join('\n').split('，').join('\n').split('\n');
        } else if (params.includes('，') && params.includes('\n')) {
          arr = params.split('，').join('\n').split('\n');
        } else if (params.includes('，') && params.includes(',')) {
          arr = params.split('，').join(',').split(',');
        } else if (params.includes(',') && params.includes('\n')) {
          arr = params.split(',').join('\n').split('\n');
        } else if (params.includes(',')) {
          arr = params.split(',');
        } else if (params.includes('，')) {
          arr = params.split('，');
        } else if (params.includes('\n')) {
          arr = params.split('\n');
        } else {
          arr.push(params);
        }
      }
      return arr;
    },
    tableImg(h, params, imgKey, imageUrl) {
      const row = this.$common.isEmpty(params.row) ? params : params.row;
      let imgUrl = this.$common.isEmpty(imageUrl) ? row[imgKey] || '' : imageUrl;
      if (this.$common.isString(imgUrl) && imgUrl.includes(',')) {
        imgUrl = imgUrl.split(',')[0];
      }
      if (this.$common.isArray(imgUrl) && imgUrl.length > 0) {
        imgUrl = imgUrl[0];
      }
      if (this.$common.isEmpty(imgUrl)) {
        return h('img', {
          attrs: {
            src: './static/images/placeholder.jpg',
            onerror: 'javascript:this.src=\'./static/images/placeholder.jpg\''
          },
          style: {
            width: '46px',
            height: '46px',
            objectFit: 'cover',
            verticalAlign: 'middle',
            cursor: 'pointer'
          }
        })
      }
      if (imgUrl.substring(0, 7) != 'http://' && imgUrl.substring(0, 8) != 'https://') {
        imgUrl = this.$store.state.imgUrlPrefix + imgUrl;
      }
      return h('Poptip', {
        props: {
          placement: 'right',
          trigger: 'hover',
          transfer: true
        },
        style: {
          width: '46px',
          height: '46px',
          objectFit: 'cover',
          verticalAlign: 'middle'
        }
      }, [
        h('div', {}, [
          h('img', {
            attrs: {
              src: imgUrl,
              onerror: 'javascript:this.src=\'./static/images/placeholder.jpg\''
            },
            style: {
              width: '46px',
              height: '46px',
              objectFit: 'cover',
              verticalAlign: 'middle',
              cursor: 'pointer'
            }
          })
        ]), !imgUrl || h('img', {
          slot: 'content',
          props: {},
          attrs: {
            src: imgUrl
          },
          style: {
            width: '400px',
            height: 'auto',
            verticalAlign: 'middle'
          }
        })
      ]);
    },
    showShippingData(value) {
      if (value) {
        this.getShippingList();
      }
    },
    repeatArrayObject(arr, key) {
      let obj = {};
      return arr.reduce((i, n) => {
        if (!obj[n[key]]) {
          obj[n[key]] = true;
          i.push(n);
        }
        return i;
      }, []);
    },
    getShippingList(h) {
      let v = this;
      v.axios.get(api.get_enableCarriers + '?warehouseId=' + v.getWarehouseId() + '&isFilter=true' + '&time=' + new Date().getTime()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts
            });
            if (i === data.length - 1) {
              v.shippingMethodData = pos;
              v.$store.commit('shippingMethodData', pos);
            }
          }
        }
      });
    },
    getShopList(type, prefix, platformArr) {
      let v = this;
      let arr = [];
      if (!prefix) {
        prefix = '/wms-service/erpCommon';
      }
      if (!type && !platformArr) {
        arr = [v.platformType];
        v.axios.post(prefix + api.get_shopList, JSON.stringify(arr)).then(response => {
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
              v.axios.post(prefix + api.get_shopList, JSON.stringify(newArr)).then(response => {
                v.shopList = response.data.datas;
                resolve(true);
                console.log('shopList:', v.shopList);
              });
            }
          });
        });
      } else if (platformArr.length > 0) {
        v.axios.post(prefix + api.get_shopList, JSON.stringify(platformArr)).then(response => {
          v.shopList = response.data.datas;
          console.log('shopList:', v.shopList);
        });
      }
    },
    loadData(item, callback) {
      item.loading = true;
      let v = this;
      v.axios.get(api.get_enableShippingMethods + '?carrierId=' + item.value + '&warehouseId=' + v.getWarehouseId()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: [data[i].shippingMethodId, item.carrierAccounts],
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
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
      });
    },
    startPrint(jsonObj, postId, isHtml) {
      let v = this;
      v.printHtmlUrl(jsonObj.pdf, postId).then(res => {
        if (res.printType === 'cainiao') {
          v.$Message.success('包裹号' + '：' + postId + '操作成功');
          return;
        }
        jsonObj = res;
        let instance = v.axios.create({
          timeout: 3000,
          headers: {
            'Content-Type': 'multipart/form-data; charset=UTF-8'
          }
        });
        delete v.axios.defaults.headers.post['X-Requested-With'];
        instance.post('http://localhost:10099/print', Qs.stringify(jsonObj)).then(response => {
          if (response.status === 200) {
            v.$Message.success('包裹号' + '：' + postId + '操作成功');
          }
        }).catch(() => {
          v.axios.get(api.get_downloadPrint).then(response => {
            if (response.data.code === 0) {
              v.$Modal.info({
                title: '提示',
                okText: '取消',
                render: (h, params) => {
                  return h('div', {
                    class: 'normalTop20'
                  }, [
                    h('div', {
                      class: 'flexBox flexBoxJustContent',
                      style: {
                        fontSize: '16px'
                      }
                    }, '该功能需使用打印控件，请下载安装'), h('a', {
                      attrs: {
                        href: v.$store.state.erpConfig.filenodeViewTargetUrl + response.data.datas,
                        target: '_blank'
                      },
                      class: 'flexBox flexBoxJustContent normalTop',
                      style: {
                        fontSize: '16px',
                        fontWeigh: 'bold'
                      }
                    }, '点击下载'), h('div', {
                      class: 'flexBox flexBoxJustContent normalTop',
                      style: {
                        fontSize: '16px'
                      }
                    }, '如果已安装，请开启打印控件')
                  ]);
                }
              });
            }
          });
        });
      });
    },
    domResize(fn) {
      // let originFn = window.onresize;
      /* window.onresize = function () {
             originFn && originFn();
             fn();
             }; */
    },
    typeOf(obj) {
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
    deepCopy(data) {
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
    shallowCopy(src) {
      let dst = {};
      for (let prop in src) {
        if (src.hasOwnProperty(prop)) {
          dst[prop] = src[prop];
        }
      }
      return dst;
    },
    processTimeData(list, key) {
      if (typeof key === 'string') {
        list.forEach(val => {
          if (val[key]) val[key] = this.$uDate.dealTime(val[key]);
        });
      } else if (Array.isArray(key)) {
        list.forEach(val => {
          key.forEach(item => {
            val[item] = val[item] ? this.$uDate.dealTime(val[item]) : '';
          });
        });
      }
      return list;
    },
    processObjTime(obj, paramsList) {
      paramsList.forEach(val => {
        if (obj[val]) obj[val] = this.$uDate.dealTime(obj[val]);
      });
      return obj;
    },
    getPlatform() {
      // 查询可用平台
      let v = this;
      let pos = [
        {
          platformId: '',
          title: '全部'
        }
      ];
      v.axios.get(api.get_enablePlatform).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            pos.push({
              platformId: n.platformId,
              title: n.platformId
            });
          });
          v.platformArr = pos;
        }
      });
    },
    /**
         * @Description: 根据数组的属性值进行分组的方法
         * @author jing
         * @date: 2020/9/7 17:08
         * @params: array 数组, fun 遍历的属性值函数, type 根据的属性值
         */
    handerGrouping(array, fun, type) {
      let groups = {};
      array.forEach(function (item) {
        let group = JSON.stringify(fun(item));
        groups[group] = groups[group] || [];
        groups[group].push(item);
      });
      let new_arr = [];
      let talg = Array.isArray(type);
      let obj = {};
      Object.keys(groups).map(function (group) {
        if (talg) {
          type.map((ele) => {
            obj[ele] = groups[group][0][ele];
          });
          let item = Object.assign(obj, { data: groups[group] });
          new_arr.push(item);
        } else {
          new_arr.push({
            [type]: groups[group][0][type],
            data: groups[group]
          });
        }
      });
      return new_arr;
    },
    entityToString(entity) {
      /**
             * 转html实体
             * */
      let div = document.createElement('div');
      div.innerHTML = entity;
      return div.innerText || div.textContent;
    }
  },
  mounted() {
    let v = this;
    v.domResize(function () {
      v.domWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
      v.domHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
    });
  }
};
