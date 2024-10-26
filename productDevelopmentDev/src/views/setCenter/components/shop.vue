<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <div class="filterItem">
              <span>平台：</span>
              <Button-group>
                <template v-for="(item, index) in plateformGroup">
                  <Button v-if="item.selected" type="primary" @click="getPlatformData(index, item.platformId)" :key="index">
                    {{ item.title }}
                  </Button>
                  <!--<Button v-if="!item.selected" @click="getPlatformData(index, item.platformId)">-->
                  <!--{{item.title}}-->
                  <!--</Button>-->
                </template>
              </Button-group>
            </div>
            <div class="filterItem">
              <span>状态：</span>
              <Button-group>
                <template v-for="(item, index) in enableList">
                  <Button v-if="item.selected" type="primary" @click="enbaleUser(index, item.status)" :key="index">
                    {{ item.title }}
                  </Button>
                  <Button v-if="!item.selected" @click="enbaleUser(index, item.status)" :key="index">
                    {{ item.title }}
                  </Button>
                </template>
              </Button-group>
            </div>
            <!--<div class="filterItem" v-if='platformType === null || platformType === "ebay"'>-->
            <!--<Button-group>-->
            <!--<template v-for="(item, index) in impowerList">-->
            <!--<Button v-if="item.selected" type="primary" @click="impower(index, item.status)">-->
            <!--{{item.title}}-->
            <!--</Button>-->
            <!--<Button v-if="!item.selected" @click="impower(index,item.status)">-->
            <!--{{item.title}}-->
            <!--</Button>-->
            <!--</template>-->
            <!--</Button-group>-->
            <!--</div>-->
          </div>
          <div class="platformSearch clear">
            <Row>
              <Col :span="7">
              <Form ref="pageParams" :model="pageParams" label-position="left" :label-width="70">
                <div class="filterItem">
                  <Form-item label="搜索字符" prop="searchValue">
                    <Input :placeholder="
                          platformType === null
                            ? '可输入账户名、代号'
                            : '请输入店铺名'
                        " v-model.trim="pageParams.searchValue" style="width: 200px" @on-enter="search">
                    </Input>
                  </Form-item>
                </div>
              </Form>
              </Col>
            </Row>
          </div>
          <div class="filterItem filterConfirm" :class="{ normalTop: moreFilter }">
            <Button type="primary" @click="search" size="small" v-once icon="ios-search">查询</Button>
            <Button @click="reset" size="small" v-once icon="ios-refresh">重置</Button>
          </div>
        </div>
      </div>
    </div>
    <div class="dataSort grayBg">
      <!--排序-->
      <span>排序：</span>
      <Button-group>
        <template v-for="(item, index) in platformType === null
            ? buttonGroupModel
            : platformType === 'amazon'
            ? buttonGroupOfAmazon
            : ''">
          <Button v-if="item.selected" :key="index" type="primary" @click="
              platformType === null
                ? modifyTheSort(index, item.status)
                : platformType === 'amazon'
                ? editTheSort(index, item.status)
                : ''
            ">
            {{ item.title }}
            <Icon type="md-arrow-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-down" v-if="!item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" :key="index" @click="
              platformType === null
                ? modifyTheSort(index, item.status)
                : platformType === 'amazon'
                ? editTheSort(index, item.status)
                : ''
            ">
            {{ item.title }}
            <Icon type="md-arrow-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <!--<div class="addBinding" v-if='platformType === null || platformType === "ebay"'>-->
    <!--<Button type="primary" icon="plus-round" @click="addNewBind">添加新绑定</Button>-->
    <!--</div>-->
    <div class="addBinding" style="padding: 2px 0px 8px 0px">
      <Button type="primary" icon="plus-round" @click="addNewBindOfAmazon">添加新绑定</Button>
      <Button type="primary" @click="sync" v-if="newOrOldUserFlag === '1' || newOrOldUserFlag === '4'">
        从ERP同步
      </Button>
    </div>
    <div class="shopTable">
      <Table highlight-row border :columns="orderColumn" :data="data6"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="
              (v) => {
                changePage(v, platformType);
              }
            " show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="
              (v) => {
                changePageSize(v, platformType);
              }
            " placement="top" :page-size-opts="pageArray" :current="curPage">
          </Page>
        </div>
      </div>
    </div>
    <Modal :mask-closable="false" v-model="newBindingModel" v-if="newBindingStatus" width="600">
      <p slot="header" style="color: #113f6d; text-align: left">
        <Icon type="md-information-circle"></Icon>
        <span style="color: #fff">{{ bindingTitle }}</span>
      </p>
      <addNewBinding v-if="newBindingStatus" :step="step" :ebayAccountId="shopModel.ebayAccountId" :disabled="disabled" :userSltPlat="platformType" :accountCode="shopModel.accountCode" @resetEvent="resetStep" @nextStepEvent="nextStepFinish" :account="shopModel.account" :saveCode="saveCodeStatus" @finishSave="finishSave" @userSelectedPlatform="userSelectedPlatform">
      </addNewBinding>
      <div slot="footer">
        <div>
          <Button @click.stop="closeBindingModel">取消</Button>
          <Button type="primary" @click.stop="nextStep" :loading="loading" v-if="bindingTitle == '添加新绑定'">{{ addEmpolyeeText }}
          </Button>
        </div>
      </div>
    </Modal>
    <addAmazonAccount class="addAmazonAccountModal" :curobj="amazonEditCurObj" :workType="amazonWorkType" :editAuth="newOrOldUserFlag" :siteDataList="siteDataList" @addsucc="addSuccess">
    </addAmazonAccount>
  </div>
</template>
<script>
import api from "@/api/api";
//  import addNewBinding from './addNewBinding'
import Mixin from "@/components/mixin/commonMixin";
import tableMixin from "@/components/mixin/table_mixin";
import amazonMix from "@/components/mixin/amazon_mixin";
import addAmazonAccount from "./addAmazonAccount";

export default {
  mixins: [Mixin, tableMixin, amazonMix],
  components: {
    addAmazonAccount
  },
  data () {
    var self = this;
    return {
      buttonGroupModel: [
        {
          type: "tokenEffectiveDate",
          selected: true,
          status: true, // true up false down
          title: "按绑定时间"
        },
        {
          type: "accountCode",
          selected: false,
          status: true, // true up false down
          title: "按代号"
        }
      ],
      num: 4,
      minWidth: 180,
      saveCodeStatus: false,
      shopArrowDislay: false,
      loading: false,
      newBindingStatus: false,
      arrowStatus: "chevron-down",
      shopArrowStatus: "chevron-down",
      addEmpolyeeText: "下一步",
      moreFilter: false, // 高级筛选
      step: "0",
      disabled: false,
      newBindingModel: false,
      ebayAccountId: null,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        searchValue: null,
        authStatus: null,
        orderBy: "tokenEffectiveDate",
        upDown: "up"
      },
      pageParamsStatus: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      shopModel: {
        ebayAccountId: null,
        account: null
      },
      plateformGroup: [
        //          {
        //            selected: true,
        //            platformId: null,
        //            title: '全部',
        //          },
        {
          selected: true,
          platformId: "amazon",
          title: "amazon"
        }
      ],
      enableList: [
        {
          selected: true,
          status: "",
          title: "全部"
        },
        {
          selected: false,
          status: 1,
          title: "启用"
        },
        {
          selected: false,
          status: 0,
          title: "停用"
        }
      ],
      impowerList: [
        {
          selected: true,
          status: "",
          title: "全部"
        },
        {
          selected: false,
          status: 1,
          title: "已授权"
        },
        {
          selected: false,
          status: 0,
          title: "未授权"
        },
        {
          selected: false,
          status: 2,
          title: "授权过期"
        }
      ],
      ebayColumn: [
        {
          title: "代号",
          key: "num",
          width: 120
        },
        {
          title: "平台",
          key: "platform",
          width: 150,
          render: (h, params) => {
            return params.row.platform === "alixpress"
              ? h("span", {
                class: "platformLogo alixpress"
              })
              : params.row.platform === "wish_api"
                ? h("span", {
                  class: "platformLogo wish"
                })
                : params.row.platform === "ebay"
                  ? h("span", {
                    class: "platformLogo ebay"
                  })
                  : params.row.platform === "amazon"
                    ? h("span", {
                      class: "platformLogo amazon"
                    })
                    : "";
          }
        },
        {
          title: "账户名",
          key: "account",
          width: 120
        },
        {
          title: "授权状态",
          key: "impowerStatus",
          width: 90,
          render: (h, params) => {
            return params.row.impowerStatus == 0
              ? h(
                "span",
                {
                  class: "stopStatus"
                },
                "未授权"
              )
              : params.row.impowerStatus == 1
                ? h(
                  "span",
                  {
                    class: "openStatus"
                  },
                  "已授权"
                )
                : h(
                  "span",
                  {
                    class: "stopStatus"
                  },
                  "授权过期"
                );
          }
        },
        {
          title: "授权过期时间",
          width: 200,
          key: "deathdate"
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          width: 80,
          render: (h, params) => {
            return params.row.status === 0
              ? h(
                "span",
                {
                  class: "stopStatus"
                },
                "停用"
              )
              : h(
                "span",
                {
                  class: "openStatus"
                },
                "启用"
              );
          }
        },
        {
          title: "绑定时间",
          key: "bindTime",
          width: 200
        },
        {
          title: "操作",
          key: "operate",
          width: 240,
          render: (h, params) => {
            if (params.row != undefined) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        self.show(
                          params.row.ebayAccountId,
                          "check",
                          params.row.account
                        );
                      }
                    }
                  },
                  "查看"
                ),
                h(
                  "Button",
                  {
                    props: {
                      size: "small"
                    },
                    style: {
                      marginRight: "5px"
                    },
                    on: {
                      click: () => {
                        self.show(
                          params.row.ebayAccountId,
                          "edit",
                          params.row.account
                        );
                      }
                    }
                  },
                  "编辑"
                ),
                params.row.originalImpowerStatus != "0" &&
                  params.row.originalStatus === "0"
                  ? h(
                    "Button",
                    {
                      props: {
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          var stopParams = {
                            saleAccountId: params.row.saleAccountId,
                            status: "1"
                          };
                          self.enbaleStatus(stopParams);
                        }
                      }
                    },
                    "启用"
                  )
                  : params.row.originalImpowerStatus != "0" &&
                    params.row.originalStatus != "0"
                    ? h(
                      "Button",
                      {
                        props: {
                          size: "small"
                        },
                        style: {
                          marginRight: "5px"
                        },
                        on: {
                          click: () => {
                            var stopParams = {
                              saleAccountId: params.row.saleAccountId,
                              status: "0"
                            };
                            self.disableStatus(stopParams);
                          }
                        }
                      },
                      "停用"
                    )
                    : "",
                params.row.originalImpowerStatus == "0" ||
                  params.row.originalImpowerStatus == 2
                  ? h(
                    "Button",
                    {
                      props: {
                        size: "small"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          self.show(
                            params.row.ebayAccountId,
                            "give",
                            params.row.account
                          );
                        }
                      }
                    },
                    "授权"
                  )
                  : ""
              ]);
            }
          }
        }
      ],
      data6: [],
      bindingTitle: "添加新绑定",
      status: self.$store.state.bindingResult,
      platformType: "amazon"
    };
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getSaleAccountList(v.pageParams);
      }
    },
    "pageParams.pageNum": function () {
      this.getSaleAccountList();
    },
    "pageParams.pageSize": function () {
      this.getSaleAccountList();
    }
  },
  created () {
    let v = this;
    let url = window.location.href;
    if (url.indexOf("code") > 0 && !v.status) {
      let codeNo = url.split("code=")[1];
      codeNo == 0
        ? this.$msg.success({
          content: "授权成功",
          duration: 10
        })
        : codeNo === 106100
          ? this.$msg.error({
            content: "帐号已存在",
            duration: 10
          })
          : codeNo === 106102
            ? this.$msg.error({
              content: "帐号不匹配",
              duration: 10
            })
            : this.$msg.error({
              content: "授权失败，请重新尝试",
              duration: 10
            });
      v.status = true;
      v.$store.commit("bindingResult", true);
    }
    v.orderColumn = v.deepCopy(v.amazonColumn);
    v.getSaleAccountList();
    // 判断新老账户
    this.axios.post(api.shopList, {}).then((res) => {
      if (res.code === 0) {
        this.newOrOldUserFlag = res.datas.erpUseFlag;
        var url = res.datas.merchantSdomain;
        url = url.indexOf("http") > -1 ? url : "http://" + url;
        this.oldErpViewUrl = url + res.datas.oldErpViewUrl;
      }
    });
  },
  methods: {
    getSaleAccountList () {
      this.getAmazonListAccount();
    },
    getPlatformData (index, id) {
      let v = this;
      v.pageParams.platformId = id;
      this.platformType = id; // 记录平台
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.pageParams.pageSize = 10;
      v.plateformGroup.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      //        if (v.platformType === null || v.platformType === 'ebay') {
      //          v.orderColumn = v.ebayColumn;
      //          v.pw(v.num);
      //          v.pageParamsStatus = true; //更新数据
      //        } else {
      v.orderColumn = v.deepCopy(this.amazonColumn);
      //          v.getAmazonListAccount();
      //        }
      v.userSelectedPlatformId = id; // 控制不同平台下一步的逻辑
      v.enbaleUser(0); // 按钮状态重置为全部
    },
    enbaleUser (index) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.status;
      } else if (index === 1) {
        v.pageParams.status = "1";
      } else {
        v.pageParams.status = "0";
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.enableList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    enbaleStatus () {
      // 启用
      // let v = this;
      //        v.axios.put(api.operate_enableSaleAccount + '?saleAccountId=' + params.saleAccountId)
      //          .then(response => {
      //            if (response.data.code === 0) {
      //              v.$Message.success('启用成功');
      //              v.pageParamsStatus = true;
      //            } else {
      //              v.$Message.error('启用失败');
      //            }
      //          })
    },
    disableStatus () {
      // 停用
      // let v = this;
      //        v.axios.put(api.operate_disableSaleAccount + '?saleAccountId=' + params.saleAccountId)
      //          .then(response => {
      //            if (response.data.code === 0) {
      //              v.$Message.success('停用成功');
      //              v.pageParamsStatus = true;
      //            } else {
      //              v.$Message.error('停用失败');
      //            }
      //          })
    },
    impower (index) {
      var v = this;
      if (index === 0) {
        delete v.pageParams.authStatus;
      } else if (index === 1) {
        v.pageParams.authStatus = "1";
      } else if (index === 2) {
        v.pageParams.authStatus = "0";
      } else {
        v.pageParams.authStatus = "2";
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.impowerList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    search () {
      let v = this;
      if (this.platformType === null || this.platformType === "ebay") {
        v.pageParamsStatus = true; // ebay和全部的查询
      } else if (this.platformType === "amazon") {
        this.amazonSearchFn();
      }
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset () {
      this.getPlatformData(0, "amazon"); // 产品需求，重置返回到'全部'
      this.$refs["pageParams"].resetFields();
      this.pageParams.searchValue = "";
      this.enbaleUser(0); // 按钮状态重置为全部
      this.getAmazonListAccount();
    },
    show (ebayAccountId, type, account) {
      let v = this;
      v.newBindingStatus = true;
      v.$nextTick(function () {
        if (type === "check") {
          v.disabled = true;
          v.bindingTitle = "查看";
        } else if (type === "give") {
          v.disabled = true;
          v.bindingTitle = "授权";
        } else if (type === "edit") {
          v.disabled = false;
          v.bindingTitle = "编辑";
        } else {
          v.disabled = false;
        }
        v.shopModel.account = account;
        v.shopModel.ebayAccountId = ebayAccountId;
        v.newBindingModel = true;
        v.step = "0";
      });
    },
    addNewBind () {
      let v = this;
      v.bindingTitle = "添加新绑定";
      v.resetStep();
      v.newBindingStatus = true;
      v.$nextTick(function () {
        v.newBindingModel = true;
        v.step = "0";
      });
    },
    userSelectedPlatform (plat) {
      this.userSelectedPlatformId = plat;
    },
    nextStep () {
      if (this.userSelectedPlatformId === "ebay") {
        let v = this;
        v.loading = true;
        if (v.step === "0") {
          v.shopModel.account = "";
          v.step = "1";
        } else {
          v.newBindingModel = false;
        }
      } else if (this.userSelectedPlatformId === "amazon") {
        this.newBindingModel = false;
        this.$store.commit("addAmazonAccount", true);
      }
    },
    nextStepFinish () {
      let v = this;
      v.loading = false;
      v.pageParamsStatus = true;
      v.addEmpolyeeText = "保存";
    },
    resetStep () {
      let v = this;
      v.shopModel.ebayAccountId = null;
      v.disabled = false;
      v.loading = false;
      v.step = "0";
    },
    closeBindingModel () {
      this.newBindingModel = false;
      this.resetStep();
    },
    saveCode () {
      let v = this;
      v.saveCodeStatus = true;
    },
    finishSave () {
      let v = this;
      v.closeBindingModel();
      v.saveCodeStatus = false;
      v.pageParamsStatus = true;
    }
  },
  mounted () {
    let v = this;
    v.pw(v.num);
  }
};
</script>
