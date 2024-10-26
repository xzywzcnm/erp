import api from "@/api/api";
import axios from "axios";
// import common from '@/utils/common';
// import { getToken } from "@/utils/cookie";

export default {
  data () {
    let v = this;
    return {
      timeZoomDate: v.getDataToLocalTime(
        new Date(v.getUniversalTime(new Date(), "fulltime")).getTime(),
        "fulltime"
      ),
      isTrue: true,
      isFalse: false,
      moreFilterMes: "显示高级搜索", // 高级搜索文字
      moreFilterIcon: "",
      moreFilter: false,
      controlList: this.setControlList(),
      filterColumns: "",
      filterColumnsIcon: "ios-arrow-up",
      pageArray: [10, 50, 100],
      domWidth:
        document.documentElement.clientWidth || document.body.clientWidth || 0,
      domHeight:
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        0,
      placeholderSrc:
        "./static/images/placeholder.jpg" /* currencyList:[{
       value:'USD',
       name:'美元'
       },{
       value:'CNY',
       name:'人民币'
       }],//币种 */,
      currencyExchangeInfo: [], // 币种汇率信息
      isDown: false,
      nubReg: /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)|0)$/,
      fileApi: api.fileUpLoad,
      uploadUserFilesApi: api.uploadUserFiles,
      timeStateList: [
        {
          value: "0",
          label: "需求创建时间",
        },
        {
          value: "1",
          label: "需求提交时间",
        },
        {
          value: "2",
          label: "需求审核时间",
        },
        {
          value: "3",
          label: "指派询价时间",
        },
        {
          value: "4",
          label: "完成询价时间",
        },
        {
          value: "5",
          label: "询价审核通过时间",
        },
        {
          value: "6",
          label: "预计完成时间",
        },
      ],
      lazyTime: 0,
      timr: null,
      productTypeList: [
        {
          name: "普货",
          value: "01",
          disabled: true,
        },
        {
          name: "纯电池",
          value: "02",
          disabled: false,
        },
        {
          name: "配套电池",
          value: "03",
          disabled: false,
        },
        {
          name: "液体",
          value: "04",
          disabled: false,
        },
        {
          name: "药品",
          value: "05",
          disabled: false,
        },
        {
          name: "粉末",
          value: "06",
          disabled: false,
        },
        {
          name: "危险品",
          value: "07",
          disabled: false,
        },
        {
          name: "内置电池",
          value: "08",
          disabled: false,
        },
        {
          name: "纽扣电池", // 纽扣电池
          value: "09",
          disabled: false,
        },
        {
          name: "带磁", // 带磁
          value: "10",
          disabled: false,
        },
      ],
      dateOptions: {
        shortcuts: [
          {
            text: "最近一周",
            value: function () {
              var end = new Date();
              var start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              return [start, end];
            },
          },
          {
            text: "最近一个月",
            value: function () {
              var end = new Date();
              var start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              return [start, end];
            },
          },
          {
            text: "最近三个月",
            value: function () {
              var end = new Date();
              var start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              return [start, end];
            },
          },
        ],
      },
    };
  },
  watch: {
    roleList (n, o) {
      if (n !== o) {
        this.controlList = this.setControlList();
      }
    }
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () { },
  mounted () {
    let v = this;
    v.domResize(function () {
      v.domWidth =
        document.documentElement.clientWidth || document.body.clientWidth || 0;
      v.domHeight =
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        0;
    });
  },
  methods: {
    getWarehouseNew () {
      /**
       * 3.0 获取仓库
       * */
      let v = this;
      return new Promise((resolve) => {
        v.$axios
          .post(api.get_wmsWarehouse, {
            warehouseStatus: "0",
          })
          .then((response) => {
            if (response.code === 0) {
              resolve(response.datas);
            }
          });
      });
    },
    getUserMesCommon () {
      let v = this;
      return new Promise((resolve) => {
        let userInfoList = v.$store.state.userInfoList;
        if (userInfoList.length === 0) {
          v.$axios.get(api.get_userInfoCommon).then((response) => {
            if (response.code === 0) {
              if (response.datas !== null) {
                v.$store.commit("userInfoList", response.datas);
                resolve({data: response.datas});
              } else {
                resolve({data: {}});
              }
            } else {
              resolve({data: {}});
            }
          }).catch(() => {
            resolve({data: {}});
          });
        } else {
          resolve({data: userInfoList});
        }
      });
    },
    repeatArrayObject (arr, key) {
      let obj = {};
      return arr.reduce((i, n) => {
        if (!obj[n[key]]) {
          obj[n[key]] = true;
          i.push(n);
        }
        return i;
      }, []);
    },
    ajaxData (obj) {
      // 再封装XHR
      // let v = this;
      // eslint-disable-next-line no-prototype-builtins
      let data = obj.hasOwnProperty("data") ? JSON.stringify(obj.data) : {};
      let axiosObj = {};
      if (obj.headers) {
        axiosObj.headers = Object.assign({}, obj.headers);
      }
      return new Promise((resolve) => {
        axios(
          Object.assign(axiosObj, {
            method: obj.type ? obj.type : "post",
            url: obj.url,
            data: data,
          })
        ).then((response) => {
          resolve(response);
        });
      });
    },
    getProductLabelInfoApi () {
      let v = this;
      return new Promise((resolve, reject) => {
        v.$axios
          .get(api.getProductLabelInfo)
          .then((res) => {
            if (res.code === 0) {
              resolve(res.datas);
              v.labelList = res.datas;
            } else {
              reject(res);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    lazyHandel (t) {
      let time = new Date().getTime();
      return new Promise((resolve) => {
        if (this.lazyTime === 0) {
          this.lazyTime = time;
        } else {
          if (time - this.lazyTime > t) {
            clearTimeout(this.timr);
            resolve();
            this.lazyTime = time;
          } else {
            clearTimeout(this.timr);
            this.lazyTime = time;
            this.timr = setTimeout(() => {
              resolve();
            }, t);
          }
        }
      });
    },
    maxLengthHandel (event, lenght) {
      let v = this;
      v.lazyHandel(300).then(() => {
        event.target.value = event.target.value.slice(0, lenght);
        v.$emit("on-keypress", event);
      });
    },
    getBetweenDay (firstDate, secondDate) {
      // eslint-disable-next-line no-redeclare
      var firstDate = new Date(firstDate);
      // eslint-disable-next-line no-redeclare
      var secondDate = new Date(secondDate);
      var diff = Math.abs(firstDate.getTime() - secondDate.getTime());
      var result = parseInt(diff / (1000 * 60 * 60 * 24));
      return result;
    },
    tagStepBtn (item, data) {
      // 按钮切换
      data.forEach((item) => {
        item.checked = false;
      });
      item.checked = true;
    },
    judgePlatformId (allUrl) {
      let platformId = '';
      let url = allUrl.includes('//') ? allUrl.split('//')[1].split('/')[0] : allUrl.split('/')[0];
      if (url.indexOf('1688') > 0) {
        platformId = '1688';
      } else if (url.indexOf('tmall') > 0) {
        platformId = 'tmall';
      } else if (url.indexOf('taobao') > 0) {
        platformId = 'taobao';
      } else if (url.indexOf('alibaba') > 0) {
        platformId = 'alibaba';
      } else if (url.indexOf('amazon') > 0) {
        platformId = 'amazon';
      } else if (url.indexOf('jd') > 0) {
        platformId = 'jd';
      } else if (url.indexOf('walmart') > 0) {
        platformId = 'walmart';
      } else if (url.indexOf('dhgate') > 0) {
        platformId = 'dhgate';
      } else if (url.indexOf('pfhoo') > 0) {
        platformId = 'pfhoo';
      } else if (url.indexOf('banggood') > 0) {
        platformId = 'banggood';
      } else if (url.indexOf('chinabrands') > 0) {
        platformId = 'chinabrands';
      } else if (url.indexOf('chinavasion') > 0) {
        platformId = 'chinavasion';
      } else if (url.indexOf('pandao') > 0) {
        platformId = 'mycom';
      } else if (url.indexOf('goten') > 0) {
        platformId = 'goten';
      } else if (url.indexOf('allegro') > 0) {
        platformId = 'allegro';
      } else if (url.indexOf('ebay') > 0) {
        platformId = 'ebay';
      }
      return platformId;
    },
    tableImg (h, params) {
      let v = this;
      return h(
        "Poptip",
        {
          props: {
            placement: "right",
            trigger: "hover",
            transfer: true,
          },
          style: {
            width: "46px",
            height: "46px",
            objectFit: "cover",
            verticalAlign: "middle",
          },
        },
        [
          h("div", {}, [
            h("img", {
              attrs: {
                src:
                  params.row.pictureUrl === " " ||
                    params.row.pictureUrl === null ||
                    params.row.pictureUrl === undefined
                    ? v.placeholderSrc
                    : params.row.pictureUrl,
              },
              on: {
                click: () => {
                  if (params.row.referenceUrl !== "") {
                    window.open(
                      "https://kj.1688.com/pdt_tongkuan.html?productUrl=" +
                      params.row.referenceUrl
                    );
                  }
                },
              },
              style: {
                width: "46px",
                height: "46px",
                objectFit: "cover",
                verticalAlign: "middle",
                cursor: "pointer",
              },
            }),
          ]),
          h("img", {
            slot: "content",
            props: {},
            attrs: {
              src:
                params.row.pictureUrl === " " ||
                  params.row.pictureUrl === null ||
                  params.row.pictureUrl === undefined
                  ? v.placeholderSrc
                  : params.row.pictureUrl,
            },
            style: {
              width: "400px",
              height: "auto",
              verticalAlign: "middle",
            },
          }),
        ]
      );
    },
    setImgPath (path, isGetThumb) {
      if (path) {
        if (path.includes('http://') || path.includes('https://')) {
          return path;
        }
        // if (isGetThumb) {
        //   return `./filenode/s/thumb${path}`;
        // }
        return `./filenode/s${path}`;
      }
      return './static/images/placeholder.jpg';
    },
    newTableImg (h, params, imgKey, imgSrc, clickHandel, placement, quantity) {
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
    // 权限
    setControlList () {
      let storeRoleList = this.$store.state.roleList;
      return storeRoleList || {};
    },
    // 是否有权限
    getPermission (name) {
      const isAdmin = this.$store.state.isAdmin;
      if (isAdmin || this.controlList[name]) {
        return true;
      }
      return false;
    },
    // 无权限时的提示
    gotoNoAccess () {
      this.$Message.error({
        content: '你暂无权限访问',
        duration: 5,
      });
    },
    getTableHeight (curHeight) {
      return this.domHeight - curHeight < 400 ? 400 : this.domHeight - curHeight;
    },
    getUserName (userId) { // 从用户列表中获取相关用户名
      if (userId === '系统操作') return userId;
      let userInfoList = this.$store.state.userInfoList;
      if (userInfoList !== null && userInfoList[userId] !== undefined) {
        return userInfoList[userId].userName;
      }
      return userId;
    },
    handleFormatError (file) {
      let v = this;
      v.$Message.error({
        content: `上传文件格式有误,文件${file.name}格式错误, 请选择[jpg,jpeg,png,gif,bmp]`,
        duration: 5,
      });
    },
    handleMaxSize (file) {
      let v = this;
      v.$Message.error({
        content: `文件大小受限,文件${file.name}太大, 不能超过2M`,
        duration: 5,
      });
    },
    changePage (page) {
      // 分页切换
      this.loading = true;
      if (this.pageParams) {
        this.pageParams.pageNum = page;
      }
      this.curPage = page;
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.pageParamsStatus)) {
          this.getList && this.getList();
        } else {
          this.pageParamsStatus = true;
        }
      })
    },
    changePageSize (val) {
      if (this.allListFormValidate) {
        this.allListFormValidate.pageSize = val;
      }
      if (this.pageParams) {
        this.pageParams.pageSize = val;
      }
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.$nextTick(() => {
        this.getList();
      })
    },
    getuserInfo (id) {
      let v = this;
      v.$axios.post(api.userInfo + id).then((res) => {
        v.$store.commit("userInfo", res.datas);
      });
    },
    domResize (fn) {
      let originFn = window.onresize;
      window.onresize = function () {
        originFn && originFn();
        fn();
      };
    },
    getUniversalTime (date, type) {
      // UTC时间
      if (date === null) return;
      let d = new Date(date);
      let year = d.getUTCFullYear();
      let month =
        d.getUTCMonth() + 1 < 10
          ? "0" + (d.getUTCMonth() + 1)
          : d.getUTCMonth() + 1;
      let day = d.getUTCDate() < 10 ? "0" + d.getUTCDate() : d.getUTCDate();
      let hours =
        d.getUTCHours() < 10 ? "0" + d.getUTCHours() : d.getUTCHours();
      let minutes =
        d.getUTCMinutes() < 10 ? "0" + d.getUTCMinutes() : d.getUTCMinutes();
      let seconds =
        d.getUTCSeconds() < 10 ? "0" + d.getUTCSeconds() : d.getUTCSeconds();
      if (type === "fulltime") {
        return (
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          seconds
        );
      } else {
        return year + "-" + month + "-" + day;
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
    /**
     * 检查是否有class
     * @param {object} dom对象
     * @param {string} 添加的class名
     * */
    hasClass (ele, cls) {
      return ele.className.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"));
    },
    /**
     * 添加class
     * @param {object} dom对象
     * @param {string} 添加的class名
     * */
    addClass (ele, cls) {
      if (!this.hasClass(ele, cls)) ele.className += " " + cls;
    },
    /**
     * 移除class
     * @param {object} dom对象
     * @param {string} 添加的class名
     * */
    removeClass (ele, cls) {
      if (this.hasClass(ele, cls)) {
        var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
        ele.className = ele.className.replace(reg, " ");
      }
    },
    isDelModal (okCallback, cancelCallback) {
      // let v = this;
      this.$Modal.confirm({
        title: "温馨提示",
        content: "<p>" + "是否删除" + "</p>",
        onOk: () => {
          okCallback && okCallback();
        },
        onCancel: () => {
          cancelCallback && cancelCallback();
        },
      });
    }, // 页面顶部排序按钮组
    sortChose (item, index, data) {
      data.forEach((item) => {
        item.selected = false;
      });
      data[index].selected = true;
    },
    getCurrencyDropdownListMt () {
      // 查询币种下拉框基础数据
      let v = this;
      axios.post(api.getCurrencyDropdownList).then((res) => {
        if (res && res.code === 0) {
          v.$store.commit("currencyList", res.datas);
          // v.currencyList=res.datas;
        }
      });
    },
    getCurrencyExchangeInfoMt () {
      // 查询币种汇率信息
      let v = this;
      axios.post(api.getCurrencyExchangeInfo).then((res) => {
        if (res && res.code === 0) {
          v.$store.commit("currencyExchangeInfo", res.datas);
          // v.currencyList=res.datas;
        }
      });
    },
    getPlatformGroup (status) {
      // 查看已开启平台
      let v = this;
      if (!status) status = 1;
      return new Promise((resolve) => {
        axios
          .get(api.get_queryByStatus + "?status=" + status)
          .then((response) => {
            if (response.data.code === 0) {
              v.$store.commit("platformGroup", response.data.datas);
              resolve(true);
            }
          });
      });
    },
    validateMobile () {
      // 手机校验，可共用
      let isPhone = this.$regular.isPhone;
      let isMob = this.$regular.isMob;
      let validateMobile = function (rule, value, callback) {
        if (!isPhone.test(value) && !isMob.test(value) && value !== "") {
          callback(new Error("电话号码格式不正确"));
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    validateEmail () {
      // 邮箱格式校验，可共用
      let v = this;
      const reg = v.$regular.isMailbox;
      let validateEmail = function (rule, value, callback) {
        if (value === "") {
          callback(new Error("请输入邮箱地址"));
        } else if (!reg.test(value)) {
          callback(new Error("邮箱格式不正确"));
        } else {
          callback();
        }
      };
      return validateEmail;
    },
    modifyTheSort (index) {
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
      v.pageParams.upDown = v.buttonGroupModel[index].status ? "up" : "down";
      v.pageParamsStatus = true;
    },
    getDataToLocalTime (date, type) {
      // 本地时间
      if (date === null) return null;
      let b =
        new Date(date).getTime() + this.getDefaultTimezoom() * 60 * 60 * 1000;
      let d = new Date(b);
      let year = d.getFullYear();
      let month =
        d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
      if (type === "fulltime") {
        return (
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          seconds
        );
      } else {
        return year + "-" + month + "-" + day;
      }
    },
    fullscreenImgModal () {
      let v = this;
      if (
        v.hasClass(
          v.$refs.imgModal.$el.lastChild.children[0],
          "ivu-modal-fullscreen"
        )
      ) {
        v.removeClass(
          v.$refs.imgModal.$el.lastChild.children[0],
          "ivu-modal-fullscreen"
        );
      } else {
        v.addClass(
          v.$refs.imgModal.$el.lastChild.children[0],
          "ivu-modal-fullscreen"
        );
        v.$refs.imgModal.$el.lastChild.children[0].children[0].style.top = 0;
        v.$refs.imgModal.$el.lastChild.children[0].children[0].style.left = 0;
      }
    } /* 拖拽事件 */,
    moveMt (e) {
      let header = e.currentTarget;
      let wid = header.parentNode.parentNode.parentNode.offsetWidth;
      let winWid = document.body.offsetWidth;
      let winHei = document.body.offsetHeight;
      let r = 0.2;
      let disX = e.clientX - header.parentNode.parentNode.offsetLeft;
      let disY = e.clientY - header.parentNode.parentNode.offsetTop;
      document.onmousemove = (e) => {
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        if (left < -(winWid - wid * r) / 2 || left > (winWid - wid * r) / 2) {
          if (left < -(winWid - wid * r) / 2) {
            left = -(winWid - wid * r) / 2;
          } else if (left > (winWid - wid * r) / 2) {
            left = (winWid - wid * r) / 2;
          }
        } else if (top < -100 || top > winHei - 150) {
          if (top < -100) {
            top = -100;
          } else if (top > winHei - 150) {
            top = winHei - 150;
          }
        }
        header.parentNode.parentNode.style.left = left + "px";
        header.parentNode.parentNode.style.top = top + "px";
      };
      document.onmouseup = (e) => {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }, // 高级搜索
    toggleMoreFilter () {
      let v = this;
      if (v.moreFilter) {
        v.moreFilter = false;
        v.moreFilterMes = "显示高级搜索";
        v.moreFilterIcon = "ios-arrow-up";
      } else {
        v.moreFilter = true;
        v.moreFilterMes = "收起";
        v.moreFilterIcon = "ios-arrow-down";
      }
    },
    toggleFilterColumns () {
      let v = this;
      v.filterColumnsIcon === "ios-arrow-down"
        ? (v.filterColumnsIcon = "ios-arrow-up")
        : (v.filterColumnsIcon = "ios-arrow-down");
    },
    setAssignStatus (h, params) {
      // let v = this;
      if (params.row.assignStatus === 0) {
        return h("div", "待提交需求");
      } else if (params.row.assignStatus === 1) {
        return h("div", "待审核需求");
      } else if (params.row.assignStatus === 2) {
        return h("div", "待分配询价");
      } else if (params.row.assignStatus === 3) {
        return h("div", "待完成询价");
      } else if (params.row.assignStatus === 4) {
        return h("div", "待审核询价");
      } else if (params.row.assignStatus === 5) {
        return h("div", "待生成sku");
      } else if (params.row.assignStatus === 6) {
        return h("div", "已生成sku");
      } else if (params.row.productStatus === 0) {
        return h("div", "取样待分配");
      } else if (params.row.productStatus === 1) {
        return h("div", "取样待处理");
      } else if (params.row.productStatus === 2) {
        return h("div", "取样待审核");
      } else if (params.row.productStatus === 3) {
        return h("div", "取样已完成");
      } else if (params.row.pictureStatus === 0) {
        return h("div", "图片待分配");
      } else if (params.row.pictureStatus === 1) {
        return h("div", "图片待处理");
      } else if (params.row.pictureStatus === 2) {
        return h("div", "图片待审核");
      } else if (params.row.pictureStatus === 3) {
        return h("div", "图片已完成");
      } else if (params.row.descriptionStatus === 0) {
        return h("div", "描述待分配");
      } else if (params.row.descriptionStatus === 1) {
        return h("div", "描述待处理");
      } else if (params.row.descriptionStatus === 2) {
        return h("div", "描述待审核");
      } else if (params.row.descriptionStatus === 3) {
        return h("div", "描述已完成");
      }
    }, // 产品资料文字
    setRequireSubBy (key) {
      let str = "";
      // let v = this;
      if (key === 0) {
        str += "待分配";
      } else if (key === 1) {
        str += '<span style="color: #2db7f5">' + "待处理" + "</span>";
      } else if (key === 2) {
        str += '<span style="color: #2d8cf0">' + "待审核" + "</span>";
      } else if (key === 3) {
        str += '<span style="color: #19be6b">' + "已完成" + "</span>";
      } else {
        str += "无";
      }
      return str;
    }, // 产品资料处理人
    setRequireSubByName (data, key) {
      let str = "";
      data.forEach((item) => {
        if (item.flowId === key) {
          str = item.receiverName;
        }
      });
      return str;
    }, // 提交数据整理
    fixDate (data) {
      for (let key in data) {
        // eslint-disable-next-line no-empty
        if (data[key] !== "") {
        }
      }
    },
    formatTime (date, type) {
      // 本地时间
      if (date === null) return null;
      let b = new Date(date).getTime();
      let d = new Date(b);
      let year = d.getFullYear();
      let month =
        d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
      if (type === "fulltime") {
        return (
          year +
          "-" +
          month +
          "-" +
          day +
          " " +
          hours +
          ":" +
          minutes +
          ":" +
          seconds
        );
      } else if (type === "yyyy-MM-dd") {
        return year + "-" + month + "-" + day;
      } else {
        return year + "-" + month + "-" + day;
      }
    },
    format (format, date) {
      if (!date) {
        date = new Date();
      } else {
        date = new Date(date);
      }
      var Week = ["日", "一", "二", "三", "四", "五", "六"];
      var o = {
        "y+": date.getFullYear(), // year
        "M+": date.getMonth() + 1, // month
        "d+": date.getDate(), // day
        "h+": date.getHours(), // hour
        "H+": date.getHours(), // hour
        "m+": date.getMinutes(), // minute
        "s+": date.getSeconds(), // second
        "q+": Math.floor((date.getMonth() + 3) / 3), // quarter
        S: date.getMilliseconds(), // millisecond
        w: Week[date.getDay()],
      };
      if (/(y+)/.test(format)) {
        format = format.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
          format = format.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
        }
      }
      return format;
    },
    typeOf (obj) {
      let toString = Object.prototype.toString;
      let map = {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regExp",
        "[object Undefined]": "undefined",
        "[object Null]": "null",
        "[object Object]": "object",
      };
      return map[toString.call(obj)];
    },
    deepCopy (data) {
      let v = this;
      let t = v.typeOf(data);
      let o;
      if (t === "array") {
        o = [];
      } else if (t === "object") {
        o = {};
      } else {
        return data;
      }
      if (t === "array") {
        for (let i = 0; i < data.length; i++) {
          o.push(v.deepCopy(data[i]));
        }
      } else if (t === "object") {
        for (let i in data) {
          o[i] = v.deepCopy(data[i]);
        }
      }
      return o;
    },
    setNull (data) {
      let obj = {};
      let v = this;
      for (let key in data) {
        if (data[key] === "") {
          obj[key] = null;
        } else if (v.typeOf(obj[key]) === "array") {
          v.setNull(obj[key]);
        } else {
          obj[key] = data[key];
        }
      }
      return obj;
    },
    handerGrouping (array, fun, type) {
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
  filters: {
    toFixedTwo (data) {
      return data.toFixed(2);
    },
  },
};
