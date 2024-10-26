/**
 * Created by lihongxing on 2018/1/10.
 */
import api from "@/api/api";
import Mixin from "../mixin/commonMixin";

export default {
  mixins: [Mixin],
  data() {
    var self = this;
    return {
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        searchValue: null,
        authStatus: null,
        orderBy: "tokenEffectiveDate",
        upDown: "up",
      },
      addOrEdit: "add", // 判断是添加还是编辑
      platformType: "amazon", // 记录属于什么平台(button组)
      userSelectedPlatformId: "ebay", // 用户在添加新绑定模态框中的平台选择
      newOrOldUserFlag: "", // 记录用户是新还是旧
      amazonEditCurObj: {}, // 亚马逊账户编辑时的当前对象
      amazonWorkType: "add", // amazom业务类型（新增，编辑）
      siteDataList: "", // 站点数据
      oldErpViewUrl: "", // amazon老ERP用户点击“添加新绑定”时跳转的地址
      buttonGroupOfAmazon: [
        {
          selected: true,
          status: true, // true up false down
          title: "按绑定时间",
        },
      ],
      amazonColumn: [
        {
          title: "店铺",
          key: "shopName",
        },
        {
          title: "平台",
          render: (h) => {
            return h("span", {
              attrs: {
                class: "amazon",
              },
              style: {
                display: "inline-block",
                width: "100%",
                height: "50px",
              },
            });
          },
        },
        {
          title: "站点",
          key: "siteCountry",
        },
        {
          title: "账户名",
          key: "shopAccount",
        },
        {
          title: "绑定邮箱",
          key: "emailAddress",
        },
        {
          title: "绑定时间",
          key: "createdTime",
          width: 150,
        },
        {
          title: "操作",
          key: "operate",
          render: (h, params) => {
            return h("div", {}, [
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.newOrOldUserFlag === "1" ||
                      this.newOrOldUserFlag === "4"
                        ? (this.amazonWorkType = "watch")
                        : (this.amazonWorkType = "edit");
                      this.amazonEditCurObj = this.data6.find((val) => {
                        return (
                          val.amazonAccountId === params.row.amazonAccountId
                        );
                      });
                      this.$store.commit("addAmazonAccount", true);
                    },
                  },
                  // examine
                },
                this.newOrOldUserFlag === "1" || this.newOrOldUserFlag === "4"
                  ? "查看"
                  : "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                    display:
                      params.row.useFlag === "0" ? "inline-block" : "none",
                  },
                  on: {
                    click: () => {
                      var obj = {
                        amazonAccountId: params.row.amazonAccountId,
                        merchantId: params.row.merchantId,
                        useFlag: "1",
                      };
                      this.useAndUnUse(obj);
                    },
                  },
                },
                "启用"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                    display:
                      params.row.useFlag === "1" ? "inline-block" : "none",
                  },
                  on: {
                    click: () => {
                      var obj = {
                        amazonAccountId: params.row.amazonAccountId,
                        merchantId: params.row.merchantId,
                        useFlag: "0",
                      };
                      this.useAndUnUse(obj);
                    },
                  },
                },
                "停用"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                    display:
                      params.row.cpcEnableFlag === "1"
                        ? "inline-block"
                        : "none",
                  },
                  on: {
                    click: () => {
                      if (params.row.cpcAuthFlag === "1") {
                        /* self.$Modal.confirm({
                       title: '温馨提示',
                       width:'500px',
                       content: `<p>是否取消该店铺CPC授权</p>`,
                       onOk: () => {
                       self.setCpcCancel(params.row)
                       },
                       onCancel:()=>{

                       }
                       }); */
                        self.setCpcCancel(params.row);
                      } else {
                        self.$Modal.confirm({
                          title: "CPC授权",
                          width: "500px",
                          content: `<p>1、请确保授权在<span class="red">店铺常用的电脑</span>上进行操作，避免店铺关联。</p><p>2、授权店铺后，无论在哪里登录LAPA帐号，都不会有关联问题。</p><p>3、目前亚马逊支持欧洲及北美站点店铺使用CPC授权。</p>`,
                          onOk: () => {
                            self.goCpcOauth(params.row);
                          },
                          onCancel: () => {},
                        });
                      }
                    },
                  },
                  // examine
                },
                params.row.cpcAuthFlag === "0" ? "CPC授权" : "CPC已授权"
              ),
            ]);
          },
        },
      ],
    };
  },
  methods: {
    setCpcCancel(params) {
      let v = this;
      v.$axios
        .get(api.cpcCancel, {
          params: {
            accountId: params.amazonAccountId,
          },
        })
        .then((res) => {
          if (res.code === 0) {
            this.getAmazonListAccount();
            this.$Message.success("CPC授权已取消");
          } else {
            this.$Message.warning("取消CPC授权失败");
          }
        });
    },
    goCpcOauth(params) {
      let v = this;
      v.$axios
        .get(api.cpcOauth, {
          params: {
            accountId: params.amazonAccountId,
          },
        })
        .then((res) => {
          if (res.code === 0) {
            window.open(res.datas);
            // this.$Message.success('CPC授权已取消')
          } else {
            // this.$Message.warning('取消CPC授权失败')
          }
        });
    },
    addNewBindOfAmazon() {
      this.amazonWorkType = "add";
      if (this.newOrOldUserFlag === "1" || this.newOrOldUserFlag === "4") {
        // 老商户
        window.open(this.oldErpViewUrl, "_blank");
      } else {
        // 新商户
        this.$store.commit("addAmazonAccount", true);
      }
    }, // 亚马逊请求参数
    amazonRequireObj() {
      var obj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        // eslint-disable-next-line no-prototype-builtins
        useFlag: this.pageParams.hasOwnProperty("status")
          ? this.pageParams.status
          : "",
        shopName: this.pageParams.searchValue,
        upDown: this.pageParams.upDown,
      };
      return obj;
    }, // 亚马逊查询函数   flag为真表示同步之后的查询
    amazonSearchFn(flag) {
      this.$axios.post(api.getShopList, this.amazonRequireObj()).then((res) => {
        if (res.code === 0) {
          this.data6 = this.processSyncData(
            res.datas.accountShopList.list,
            flag
          );
          this.total = Number(res.datas.accountShopList.total);
        }
      });
    }, // 获取亚马逊平台的账户列表
    getAmazonListAccount() {
      this.$axios.post(api.getShopList, this.amazonRequireObj()).then((res) => {
        if (res.code === 0) {
          this.data6 = this.processSyncData(
            res.datas.accountShopList.list,
            "1"
          );
          // 站点数据
          this.siteDataList = res.datas.siteList;
          this.total = Number(res.datas.accountShopList.total);
        }
      });
    },
    processSyncData(data, flag) {
      data.forEach((val) => {
        val.createdTime = this.dealTime(val.createdTime);
      });
      if (flag) {
        data.forEach((val) => {
          val.shopName = val.shopName
            ? val.shopName
            : val.shopAccount + "_" + val.siteCountry + "站";
        });
      }
      return data;
    }, // 处理时间
    dealTime: function (time) {
      // time为世界时间
      var gmtTimeMs = new Date(time).getTime();
      var localTime =
        gmtTimeMs + this.$common.getDefaultTimezoom() * 60 * 60 * 1000;
      // 转时间格式
      var returnLocalTime = this.getDateTime(localTime, "fulltime");
      return returnLocalTime;
    }, // 亚马逊添加新绑定成功
    addSuccess() {
      this.getAmazonListAccount();
    },
    getDateTime(date, type) {
      // 时间格式获取
      // let v = this;
      let d = new Date(date);
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
    }, // 亚马逊从老ERP同步
    sync() {
      this.$axios.get(api.syncAccount).then((res) => {
        if (res.code === 0) {
          this.$Message.success("同步成功");
          this.amazonSearchFn("1");
        } else {
          this.$Message.warning("同步失败");
        }
      });
    }, // 亚马逊启用停用
    useAndUnUse(obj) {
      this.$axios.post(api.enableAndUnuse, obj).then((res) => {
        if (res.code === 0) {
          this.getAmazonListAccount();
        }
      });
    }, // 亚马逊排序
    editTheSort(index) {
      let v = this;
      v.buttonGroupOfAmazon.forEach(function (n, i) {
        if (i == index && n.selected) {
          v.buttonGroupOfAmazon[index].status = !v.buttonGroupOfAmazon[index]
            .status;
        } else if (i == index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.upDown = v.buttonGroupOfAmazon[index].status ? "up" : "down";
      v.amazonSearchFn("1");
    },
  },
  watch: {
    "$store.state.timezoomChange": function () {
      this.amazonSearchFn("1");
    },
  },
};
