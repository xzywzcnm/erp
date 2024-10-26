// 公共方法
import api from '../../api/api';
// import common from '@/utils/common';
// import { getToken } from '@/utils/cookie';
import { intercepTime } from '@/utils/comfun.js';
const placeholder = require('../../assets/images/placeholder.jpg');
export default {
  data() {
    return {
      importTypes: [ // 导入类型
        {
          value: 'supplierGoodsPriceImport',
          label: '采购报价导入'
        }, {
          value: 'supplierImport',
          label: '供应商导入'
        }, {
          value: 'supplierFreightCheckImport',
          label: '运费导入'
        },

      ],
      exportTypes: [ // 导出类型
        {
          value: 'purchaseExport',
          label: '采购单导出'
        }, {
          value: 'supplierGoodsPriceExport',
          label: '产品报价导出'
        }, {
          value: 'supplierExport',
          label: '供应商导出'
        }, {
          value: 'planExport',
          label: '备货计划导出'
        }, {
          value: 'purchasePaymentExport',
          label: '付款单导出'
        }, {
          value: 'requirementExport',
          label: '采购需求导出'
        }, {
          value: 'supplierBusinessExport',
          label: '商家系统管理'
        }, {
          value: 'supplierOrderInfoExport',
          label: '供应商订单导出'
        }, {
          value: 'supplierDespatchExport',
          label: '供应商发货单导出'
        }, {
          value: 'despatchOrderExport',
          label: '供应商发货单订单导出'
        }, {
          value: 'purchaseOrderExport',
          label: '采购单列表导出'
        }, {
          value: 'receiptCheckExport',
          label: '质检单导出'
        }, {
          value: 'receiptCheckQuestionExport',
          label: '处理单导出'
        }, {
          value: 'purchaseRefundExport',
          label: '退款单导出'
        }, {
          value: 'processingProblemAwaitExport',
          label: '问题件处理-待处理导出'
        }, {
          value: 'processingProblemStartExport',
          label: '问题件处理-处理中导出'
        }, {
          value: 'SelectedProcessingProblemStartExport',
          label: '问题件处理-处理中-明细导出'
        }, {
          value: 'processingProblemEenExport',
          label: '问题件处理-处理完成导出'
        }, {
          value: 'SelectedProcessingProblemEenExport',
          label: '问题件处理-处理完成-明细导出'
        }, {
          value: 'SpsFullManagedReturnExport',
          label: '全托管退货数据导出'
        }, {
          value: 'stockRequirementExport',
          label: '备货需求数据导出'
        }, {
          value: 'stockApplyExport',
          label: '入库出库申请导出'
        }, {
          value: 'supplierFreightCheckExport',
          label: '寄出运费核对导出'
        }, {
          value: 'billApplyExport',
          label: '账单申请列表导出'
        }, {
          value: 'billApplyExportPayment',
          label: '账单申请财务付款列表导出'
        }, {
          value: 'spsProcessAbnormalArrivalExport',
          label: '到货异常处理导出'
        }, {
          value: 'supplierOrderInfoManufactureMeansExport',
          label: '生产资料导出'
        }, {
          value: 'supplierFreightCheckImportExport',
          label: '已导入运费数据导出'
        }, {
          value: 'billApplyDeductionExport',
          label: '汇总抵扣管理导出'
        }, {
          value: 'purchaseCancelExport',
          label: '采购取消记录导出'
        }
      ],
      userInfoList: this.$store.state.userInfoList, // 用户信息列表
      formValidate: {
        country: [],
        collections: []
      },
      mask: false,
      tagIdList: [],
      shippingMethodModel: [],
      shippingMethodData: [],
      tagsList: [],
      roleList: this.$store.state.roleList,
      controlList: this.setControlList(),
      buildStatus: false, // 首次渲染状态判断
      storeFilterMes: '',
      autoWidth: 0,
      domWidth: document.documentElement.clientWidth || document.body.clientWidth || 0,
      domHeight: document.documentElement.clientHeight || document.body.clientHeight || 0,
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
      labelWidth: 110,
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreFilterMes: '更多筛选项',
      pageArray: [10, 20, 50, 100],
      placeholderSrc: placeholder,
      spinShow: false,
      categoryData: [],
      shippingMethodArrList: [],
      isShowEditSeo: false,
      supplierLevelArr: [], // 供应商等级
      supplierTypeArr: [], // 供应商类型
      settlementMethodArr: [], // 结算方式
      developerArr: [], // 开发人员
      purchaserArr: [], // 采购人员
      mainCategoryArr: [], // 主营品类
      settlementTimeArr: [], // 结算时间
      settlementPeriodArr: [], // 结算时间值
      limitNumObj: {
        title: 70,
        meta: 160
      },
      isAdmin: this.$store.state.isAdmin,
      dateOptions: {
        shortcuts: [
          {
            text: '最近三天',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
              return [start, end];
            }
          }, {
            text: '最近一周',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            }
          }, {
            text: '最近一个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            }
          }, {
            text: '最近三个月',
            value: function () {
              let end = new Date();
              let start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            }
          }
        ]
      },
      settlementTimeValueArr: [
        {
          dataValue: '1',
          dataDesc: '账期后' + '1' + '天'
        }, {
          dataValue: '2',
          dataDesc: '账期后' + '2' + '天'
        }, {
          dataValue: '3',
          dataDesc: '账期后' + '3' + '天'
        }, {
          dataValue: '4',
          dataDesc: '账期后' + '4' + '天'
        }, {
          dataValue: '5',
          dataDesc: '账期后' + '5' + '天'
        }, {
          dataValue: '6',
          dataDesc: '账期后' + '6' + '天'
        }, {
          dataValue: '7',
          dataDesc: '账期后' + '7' + '天'
        }
      ],
      filenodeViewTargetUrl: this.$store.state.imgUrl,
      warehouseList: [], // 仓库下拉框数据
      SearchDisabled: false, // 禁用搜索按钮
      Tableloading: false, // 列表的loading变量
      currencyList: [], // 币种
      personOpenArr: [],  //  已启用人员
    };
  },
  watch: {
    roleList: function (n, o) {
      if (n != o) {
        this.controlList = this.setControlList();
      }
    }
  },
  methods: {
    isSelf(id) {
      let userId = this.$store.state.userId || sessionStorage.getItem('userId');
      if (this.typeOf(id) === 'array') {
        return id.some(i => i === userId);
      } else {
        return id === userId;
      }
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
    intiBaseDataList() {
      let v = this;
      v.axios.get(api.baseDataList + '?dataType=' + 'settlementPeriod').then(res => {
        if (res.data.code == 0) {
          v.settlementPeriodArr = res.data.datas;
        }
      });
      v.axios.get(api.baseDataList + '?dataType=' + 'settlementTime').then(res => {
        if (res.data.code == 0) {
          v.settlementTimeArr = res.data.datas;
        }
      });
      v.axios.get(api.baseDataList + '?dataType=' + 'supplierLevel').then(res => {
        if (res.data.code == 0) {
          v.supplierLevelArr = res.data.datas;
        }
      });
      v.axios.get(api.baseDataList + '?dataType=' + 'supplierType').then(res => {
        if (res.data.code == 0) {
          v.supplierTypeArr = res.data.datas;
        }
      });
      v.axios.get(api.baseDataList + '?dataType=' + 'settlementType').then(res => {
        if (res.data.code == 0) {
          v.settlementMethodArr = res.data.datas;
        }
      });
      v.axios.get(api.userList).then(res => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          v.personOpenArr = [];
          for (let i in datas) {
            if (i != 'service') {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName
              });
              if (datas[i].status == 1) {
                v.personOpenArr.push({
                  userId: datas[i].userId,
                  name: datas[i].userName
                });
              }
            }
          }
          v.developerArr = arr;
          v.purchaserArr = arr;
        }
      });
      let obj = {};
      v.axios.post(api.categoryQuery, obj).then(res => {
        if (res.data.code == 0) {
          v.mainCategoryArr = res.data.datas.list;
        }
      });
    },
    getProductListInfo(arr) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(`${api.get_queryByGoodsIds}?UserId=${v.$store.state.userInfo.merchantId},${v.$store.state.userInfo.userId}`, arr).then((res) => {
          if (res.data.code === 0) {
            resolve(res.data.datas);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        });
      });
    },
    getUserInfo(userId, key) {
      let allUser = this.$store.state.allUser;
      let userInfo = null;
      if (key) {
        for (let allUserkey in allUser) {
          if (userId === allUserkey) {
            userInfo = allUser[userId];
          }
        }
      }
      if (userInfo) {
        return key ? userInfo[key] : userInfo;
      } else {
        // 系统操作
        return userId;
      }
    },
    tableImg(h, params, imgKey, no) {
      let productPic = params.row[imgKey];
      let pic = (no || productPic) ? productPic : this.placeholderSrc;
      // sps 有些接口没带前缀 - -、
      if (pic && !pic.includes('filenode') && !pic.includes('http://') && !pic.includes('https://')) {
        pic = `${this.filenodeViewTargetUrl}${pic}`;
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
              src: pic ? pic : placeholder
            },
            on: {
              error: (event) => {
                let img = event.target || event.srcElement || (event.path && event.path[0] ? event.path[0] : null);
                if (this.$common.isEmpty(img)) return;
                img.src = placeholder;
                img.onerror = null;
              }
            },
            style: {
              width: '46px',
              height: '46px',
              objectFit: 'cover',
              verticalAlign: 'middle',
              cursor: 'pointer'
            }
          })
        ]), h('img', {
          slot: 'content',
          props: {},
          attrs: {
            src: pic
          },
          on: {
            error: (event) => {
              let img = event.target || event.srcElement || (event.path && event.path[0] ? event.path[0] : null);
              if (this.$common.isEmpty(img)) return;
              img.src = '';
              img.onerror = null;
              img.style.width = '0px';
            }
          },
          style: {
            width: pic ? '400px' : '0px',
            height: 'auto',
            verticalAlign: 'middle'
          }
        })
      ]);
    },
    setPageSizeCache(pageSize) {
      localStorage.setItem(this.$route.path + 'PageSize', pageSize);
    },
    getPageSizeCache() {
      let value = localStorage.getItem(this.$route.path + 'PageSize');
      if (value && !isNaN(+value)) {
        return +value;
      } else {
        localStorage.removeItem(this.$route.path + 'PageSize');
        return 10;
      }
    },
    getPermission(name) { // 是否有权限
      let v = this;
      if (v.isAdmin || v.controlList[name]) return true;
    },
    reloadTag(val) { // 标签更新
      let v = this;
      v.orderData.forEach(function (n, i) {
        if (n.orderId == v.orderDetailsId) {
          v.orderData[i].orderTagList = val;
        }
      });
    },
    loadingFalse() { // 重置table loading状态
      this.$nextTick(function () {
        this.loading = false;
      });
    },
    setControlList() {
      let v = this;
      let storeRoleList = v.$store.state.roleList;
      return storeRoleList;
    },
    getTableHeight(curHeight) {
      // let v = this;
      let dHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
      return dHeight - curHeight < 400 ? 400 : dHeight - curHeight;
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
    getNowTime() { // 获取用户设置的时间
      // let v = this; // localTime = new Date().getTime(),
      let timezoom = this.getDefaultTimezoom();
      if (timezoom != undefined) {
        let diffTime = Number(timezoom) * 60 * 60 * 1000;
        return new Date().getTime() - diffTime;
      } else {
        return new Date().getTime();
      }
    },
    getDateTime(date, type) { // 时间格式获取
      // let v = this;
      let d = new Date(date);
      let year = d.getFullYear();
      let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      if (type == 'fulltime') {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    isDelModal(okCallback, cancelCallback) {
      let v = this;
      v.$Modal.confirm({
        title: '温馨提示', // content: '<p>确认是否删除</p>',
        content: '确定是否删除',
        onOk: () => {
          okCallback && okCallback();
        },
        onCancel: () => {
          cancelCallback && cancelCallback();
        }
      });
    },
    getUniversalTime(date, type) { // UTC时间
      if (date == null) return;
      let d = new Date(date);
      let year = d.getUTCFullYear();
      let month = d.getUTCMonth() + 1 < 10 ? '0' + (d.getUTCMonth() + 1) : d.getUTCMonth() + 1;
      let day = d.getUTCDate() < 10 ? '0' + d.getUTCDate() : d.getUTCDate();
      let hours = d.getUTCHours() < 10 ? '0' + d.getUTCHours() : d.getUTCHours();
      let minutes = d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes();
      let seconds = d.getUTCSeconds() < 10 ? '0' + d.getUTCSeconds() : d.getUTCSeconds();
      if (type == 'fulltime') {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        return year + '-' + month + '-' + day;
      }
    },
    getDataToLocalTime(date, type, isIntercept) { // 本地时间
      if (date == null) return null;
      let timezoom = this.getDefaultTimezoom();
      let b = new Date(date).getTime() + timezoom * 60 * 60 * 1000;
      let d = new Date(b);
      let year = d.getFullYear();
      let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      let time = null;
      if (type == 'fulltime') {
        time = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        time = year + '-' + month + '-' + day;
      }
      if (isIntercept) {//是否截取去掉秒数
        time = intercepTime(time);
      }
      return time;
    },
    toogleContentDisplay(status, cname) { // 箭头状态，是否显示的div
      let v = this;
      if (v[status] == 'chevron-up') {
        v[status] = 'chevron-down';
        v[cname] = false;
      } else {
        v[status] = 'chevron-up';
        v[cname] = true;
      }
    },
    hideLayer(cname) {
      let v = this;
      v[cname] = true;
    },
    validateEmail() { // 邮箱格式校验，可共用
      let reg = this.$regular.isMailbox;
      // let v = this;
      let validateEmail = function (rule, value, callback) {
        if (value === '') {
          callback(new Error('请输入邮箱地址'));
        } else if (!reg.test(value)) {
          callback(new Error('邮箱格式不正确'));
        } else {
          callback();
        }
      };
      return validateEmail;
    },
    validateEmpty() {
      let validateEmpty = function (rule, value, callback) {
        if (value === '' || value === null) {
          callback(new Error('内容不能为空'));
        } else {
          callback();
        }
      };
      return validateEmpty;
    },
    validateMobile() { // 手机校验，可共用，只验证非空
      let reg = this.$regular.validation;
      let validateMobile = function (rule, value, callback) {
        if (value === '') {
          callback(new Error('请正确输入电话号码'));
        } else if (!reg.test(value)) {
          callback(new Error('电话号码不能有字母'));
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    validatePhone() { // 电话校验，可共用，可为空，纯数字
      let reg = this.$regular.validatePhone;
      let phone = function (rule, value, callback) {
        if (value !== null && !reg.test(value)) {
          callback(new Error('格式有误'));
        } else {
          callback();
        }
      };
      return phone;
    },
    validateNumber() { // 可共用，可为空，纯数字
      let reg = this.$regular.AllNumber;
      let phone = function (rule, value, callback) {
        if (value !== null && !reg.test(value)) {
          callback(new Error('只能输入数字'));
        } else {
          callback();
        }
      };
      return phone;
    },
    validatePrice() { // 校验价格
      let v = this;
      let reg = v.$regular.validatePrice;
      return function (rule, value, callback) {
        if (!value) {
          callback(new Error('价格不能为空'));
        } else if (value.length > 27) {
          callback(new Error('数字太大'));
        } else if (!reg.test(value)) {
          callback(new Error('请输入正整数或者两位小数的金额'));
        } else {
          callback();
        }
      };
    },
    validateInteger() { // 校验正整数
      let v = this;
      let reg = v.$regular.validateInteger;
      return function (rule, value, callback) {
        if (!value) {
          callback(new Error('不能为空'));
        } else if (!reg.test(String(value))) {
          callback(new Error('输入的数字必须为正整数'));
        } else {
          callback();
        }
      };
    },
    validateQQ() { // 校验qq
      let v = this;
      let reg = v.$regular.AllNumber;
      return function (rule, value, callback) {
        if (!value) {
          callback();
        } else if (!reg.test(value)) {
          callback(new Error('输入的数字必须为正整数'));
        } else if (!(value.length > 5 && value.length < 50)) {
          callback(new Error('请输入正确的qq号'));
        } else {
          callback();
        }
      };
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
        // eslint-disable-next-line no-prototype-builtins
        if (src.hasOwnProperty(prop)) {
          dst[prop] = src[prop];
        }
      }
      return dst;
    },
    toggleMoreFilter() {
      let v = this;
      if (v.moreFilter) {
        v.moreFilter = false;
        v.moreFilterMes = v.storeFilterMes;
        v.moreFilterIcon = 'md-arrow-dropdown';
      } else {
        v.moreFilter = true;
        v.storeFilterMes == '' ? v.storeFilterMes = v.moreFilterMes : '';
        v.pageParams.searchValue && v.pageParams.searchValue != '' ? v.pageParams.searchValue = '' : '';
        v.moreFilterMes = '收起';
        v.moreFilterIcon = 'md-arrow-dropup';
      }
    },
    modifyTheSort(index, status) {
      let v = this;
      v.pageParams.orderBy = v.buttonGroupModel[index].type;
      v.buttonGroupModel.forEach(function (n, i) {
        if (i == index && n.selected) {
          v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
        } else if (i == index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
      v.pageParamsStatus = true;
    },
    changePage(page) { // 分页切换
      let v = this;
      v.loading = true;
      v.pageParams.pageNum = page;
      v.pageParamsStatus = true;
      v.curPage = page;
    },
    domResize(fn) {
      /* let originFn = window.onresize
       window.onresize = function () {
       originFn && originFn()
       fn()
       } */
    },
    resetTag() {
      let v = this;
      v.tagIdList = [];
      v.orderIdList = [];
    },
    changePageSize(pageSize) {
      this.setPageSizeCache(pageSize);
      this.pageParams.pageSize = pageSize;
      this.pageParamsStatus = true;
    },
    displayPage(params) {
      params = params || [];
      if (params.length != 0) {
        this.pageHide = true;
      } else {
        this.pageHide = false;
      }
    },
    gotoError() {
      this.$router.push('noPersermission');
    },
    getQueryString(name) { // 获取url里面的参数
      var reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)', 'i');
      var r = window.location.href.substr(1).match(reg);
      if (r != null) {
        return unescape(r[2]);
      } else {
        return null;
      }
    },
    resetIds() {
      let v = this;
      v.orderIds = [];
      v.packageIds = [];
    },
    /**
     * 文本框根据输入内容自适应高度
     * @elem {HTMLElement}输入框元素
     * @extra {Number}设置光标与输入框保持的距离(默认0)
     * @maxHeight {Number}设置最大高度(可选)
     */
    autoTextarea(elem, extra, maxHeight) {
      extra = extra || 0;
      var isFirefox = !!document.getBoxObjectFor || 'mozInnerScreenX' in window;
      var isOpera = !!window.opera && !!window.opera.toString().indexOf('Opera');
      var addEvent = function (type, callback) {
        elem.addEventListener ? elem.addEventListener(type, callback, false) : elem.attachEvent('on' + type, callback);
      };
      var getStyle = elem.currentStyle ? function (name) {
        var val = elem.currentStyle[name];
        if (name === 'height' && val.search(/px/i) !== 1) {
          var rect = elem.getBoundingClientRect();
          return rect.bottom - rect.top - parseFloat(getStyle('paddingTop')) - parseFloat(getStyle('paddingBottom')) + 'px';
        }
        return val;
      } : function (name) {
        return getComputedStyle(elem, null)[name];
      };
      var minHeight = parseFloat(getStyle('height'));
      elem.style.resize = 'none';
      var change = function () {
        var scrollTop;
        var height;
        var padding = 0;
        var style = elem.style;
        if (elem._length === elem.value.length) return;
        elem._length = elem.value.length;
        if (!isFirefox && !isOpera) {
          padding = parseInt(getStyle('paddingTop')) + parseInt(getStyle('paddingBottom'));
        }
        scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        elem.style.height = minHeight + 'px';
        if (elem.scrollHeight > minHeight) {
          if (maxHeight && elem.scrollHeight > maxHeight) {
            height = maxHeight - padding;
            style.overflowY = 'auto';
          } else {
            height = elem.scrollHeight - padding;
            style.overflowY = 'hidden';
          }
          style.height = height + extra + 'px';
          scrollTop += parseInt(style.height) - elem.currHeight;
          document.body.scrollTop = scrollTop;
          document.documentElement.scrollTop = scrollTop;
          elem.currHeight = parseInt(style.height);
        }
      };
      addEvent('propertychange', change);
      addEvent('input', change);
      addEvent('focus', change);
      change();
    },
    /**
     * 文本框根据输入内容限制
     * @evt event对象
     * @limit {Number}限制数
     * @option {string}seo输入框['title','meta']
     */
    limitNum(evt, limit, option) {
      let val = evt.target.value;
      val = val.replace(this.$regular.limitNum, '');
      let len = val.length;
      limit = Math.floor(limit);
      this.limitNumObj[option] = limit - len == 0 ? 0 : limit - len;
    },
    copyArr(arr) {
      return arr.map((e) => {
        if (typeof e === 'object') {
          return Object.assign({}, e);
        } else {
          return e;
        }
      });
    },
    isModal(option = { content: '确定是否删除' }) {
      let v = this;
      return new Promise(resolve => {
        v.$Modal.confirm({
          title: '温馨提示', // content: '<p>确认是否删除</p>',
          content: option.content,
          okText: option.okText,
          onOk: () => {
            resolve();
          }
        });
      });
    },
    formatParams() {
      let v = this;
      let params = v.deepCopy(v.pageParams);
      if (params.skuStr) { // sku搜索
        if (params.skuStr.indexOf(',') != -1) { // 根据','分割
          params.skuList = params.skuStr.split(',');
        } else if (params.skuStr.indexOf(' ') != -1) { // 根据空格或多个空格分割
          params.skuStr = params.skuStr.replace(/\s+/g, ','); // 将空格或多个空格替换成','
          params.skuList = params.skuStr.split(',');
        } else {
          params.skuList = [params.skuStr];
        }
      }
      delete params.skuStr; // 删掉
      params.dataType = Number(v.currentTabItem);
      params.goodsStatus = params.goodsStatus === null ? null : Number(params.goodsStatus);
      for (let index in params) { // ''转为null
        params[index] = params[index] === '' ? null : params[index];
      }
      return params;
    },
    getCurrency(value, currency, decimals) { // 金额格式全局方法
      const digitsRE = /(\d{3})(?=\d)/g;
      value = parseFloat(value);
      if (!isFinite(value) || (!value && value !== 0)) return '';
      currency = currency != null ? currency : '';
      decimals = decimals != null ? decimals : 0;
      let stringified = Math.abs(value).toFixed(decimals);
      let _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
      let i = _int.length % 3;
      let head = i > 0 ? (_int.slice(0, i) + (_int.length > 3 ? ',' : '')) : '';
      let _float = decimals ? stringified.slice(-1 - decimals) : '';
      let sign = value < 0 ? '-' : '';
      return sign + head + _int.slice(i).replace(digitsRE, '$1,') + _float + ' ' + currency;
    },
    getUnitPrice(num, priceList) { // 从报价获取对应单价
      if (priceList && priceList.length > 0) {
        let isExist = false; // 记录当前数量是否有对应的价格
        let unitPrice = 0;
        priceList.forEach((m, j) => {
          let int = m.split(',')[0];
          let price = Number(m.split(',')[1]);
          let start = Number(int.split('-')[0]);
          let end = (int.split('-')[1].indexOf('∞') != -1) ? null : Number(int.split('-')[1]);
          if (end) { // 不是无穷大时
            if (num >= start && num < end) {
              isExist = true;
              unitPrice = price;
            }
          } else { // 无穷大时
            if (num >= start) {
              isExist = true;
              unitPrice = price;
            }
          }
        });
        if (!isExist) { // 如果当前数量没有对应的价格，默认为第一个区间的单价
          unitPrice = Number(priceList[0].split(',')[1]);
        }
        return unitPrice;
      } else {
        return 0;
      }
    }, // 获取所有仓库下拉框的数据
    getAllWarehouse() {
      let userInfo = this.$store.state.userInfo;
      let obj = {
        merchantId: userInfo.merchantId,
        userId: userInfo.userId,
        warehouseStatus: '0'
      };
      return this.axios.post(api.warehouseUser, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.map((item) => {
              this.warehouseList.push({
                id: item.warehouseId,
                name: item.warehouseName,
                warehouseType: item.warehouseType
              });
            });
          }
        }
      });
    },
    /**
     * @Description: 获取1688搜同款的链接
     * @author jing
     * @date: 2020/9/18 10:52
     * @params: 图片 url
     */
    goPicrtureUrl(url) {
      let v = this;
      if (url) {
        let imgUrl = url.slice(1);
        let link = this.$store.state.ierpDomain + api.service + imgUrl;
        v.axios.get(api.get_samePic + '?imgUrl=' + link).then(response => {
          if (response.datas) {
            window.open(response.datas);
          }
        });
      } else {
        v.$Message.warning('当前商品暂无推广链接');
      }
    },
    /**
     * @Description: 获取币种下拉框的数据
     * @author jing
     * @date 2020/12/9 11:49
     * @params:
     */
    getCurrencyInfo() { // 获取币种下拉
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
        });
      });
    },
    handerGrouping(array, fun, type) {
      let groups = {};
      array.forEach(function (item) {
        let group = JSON.stringify(fun(item));
        groups[group] = groups[group] || [];
        groups[group].push(item);
      });
      let new_arr = [];
      Object.keys(groups).map(function (group) {
        new_arr.push({
          [type]: groups[group][0][type],
          data: groups[group]
        });
      });
      return new_arr;
    },
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    initSubLayerHeight() {
      return this.domHeight - 111;
    }
  },
  mounted() {
    let v = this;
    window.onresize = function () {
      v.domResize(function () {
        v.domWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
        v.domHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
      });
    };
    v.domResize(function () {
      v.domWidth = document.documentElement.clientWidth || document.body.clientWidth || 0;
      v.domHeight = document.documentElement.clientHeight || document.body.clientHeight || 0;
    });
  }
};
