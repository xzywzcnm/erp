<template>
  <div>
    <div class="demandBoxTit">
      <h3>取样</h3>
      <div class="rowBox">
        <Table :columns="samplingTable" :data="sampDate" highlight-row></Table>
        <!-- <div class="table-page">
           <div class="table-page-right">
             <Page :total="total"
                   @on-change="changePage"
                   show-total
                   :page-size="allListFormValidate.pageSize"
                   show-elevator
                   :current="allListFormValidate.pageNum"
                   show-sizer
                   @on-page-size-change="changePageSize"
                   placement="top"
                   :page-size-opts="pageArray">
             </Page>
           </div>
         </div>-->
      </div>

      <Form class="samp categoryInfo" ref="sampRef">
        <p class="wid-center" v-if="isShow">
          <Button @click="addCheckInfo" style="margin-bottom: 10px"
            >增加质检类目</Button
          >
        </p>
        <Card
          class="wid-center"
          style="margin-bottom: 10px"
          v-for="(item, index) in listCheckInfo"
          :key="index"
        >
          <Row>
            <Col span="9">
              <FormItem>
                <label slot="label">质检类目:</label>
                <Input
                  style="width: calc(100% - 90px)"
                  v-model="item.categoryName"
                  :disabled="isDisable"
                  :maxlength="50"
                />
              </FormItem>
            </Col>
            <Col offset="1" span="6" v-if="isShow"
              ><Button @click="addCheckDetail(index)">增加质检项</Button></Col
            >
          </Row>
          <Icon
            type="md-close"
            class="delCheckInfo"
            v-if="isShow"
            @click="delCategory(index)"
          ></Icon>
          <Row
            v-for="(child, childIndex) in item.listCheckDetail"
            :key="childIndex"
          >
            <Col span="9">
              <FormItem>
                <label slot="label">质检项</label>
                <Input
                  style="width: calc(100% - 90px)"
                  v-model="child.checkItemName"
                  :disabled="isDisable"
                  :maxlength="50"
                />
              </FormItem>
            </Col>
            <Col span="9">
              <FormItem>
                <label slot="label">标准</label>
                <Input
                  style="width: calc(100% - 90px)"
                  v-model="child.checkItemStandard"
                  :disabled="isDisable"
                  :maxlength="1000"
                />
              </FormItem>
            </Col>
            <Col span="2" v-if="isShow">
              <Icon
                type="md-close"
                class="delCheckItem"
                @click="delCheckItem(index, childIndex)"
              ></Icon>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import CommonAddSupplier from "./commonAddSupplier";
import api from "@/api/api";
import attrPrice from "./commonAttrPriceTw";

export default {
  name: "commonSampling", // 取样
  mixins: [CommonMixin],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    CommonAddSupplier,
    // eslint-disable-next-line vue/no-unused-components
    attrPrice
  },
  data () {
    let v = this;
    return {
      sampDate: [],
      total: 0,
      samplingTable: [
        {
          title: "采购单号",
          align: "center",
          key: "purchaseCode",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: params.row.purchaseCode
                }
              },
              params.row.purchaseCode
            );
          }
        },
        {
          title: "供应商名称",
          align: "center",
          key: "supplierName"
        },
        {
          title: "采购日期",
          align: "center",
          key: "createdTime",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.createdTime,
                    "fulltime"
                  )
                }
              },
              v.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          }
        },
        {
          title: "预计到货日期",
          align: "center",
          width: 160,
          key: "estimatedArrivalTime",
          render (h, params) {
            return h(
              "div",
              {
                attrs: {
                  title: v.getDataToLocalTime(
                    params.row.createdTime,
                    "fulltime"
                  )
                }
              },
              v.getDataToLocalTime(params.row.estimatedArrivalTime)
            );
          }
        },
        {
          title: "付款状态",
          align: "center",
          render (h, params) {
            if (params.row.payStatus === 0) {
              return h("div", "未申请付款");
            } else if (params.row.payStatus === 1) {
              return h("div", "待付款");
            } else if (params.row.payStatus === 2) {
              return h("div", "已付款");
            } else if (params.row.payStatus === 3) {
              return h("div", "已取消付款");
            }
          }
        },
        {
          title: "采购状态",
          align: "center",
          render (h, params) {
            if (params.row.purchaseStatus === 0) {
              return h("div", "等待到货");
            } else if (params.row.purchaseStatus === 1) {
              return h("div", "已到货");
            } else if (params.row.purchaseStatus === 2) {
              return h("div", "已作废");
            }
          }
        },
        {
          title: "到货日期",
          align: "center",
          width: 160,
          key: "actualArrivalTime",
          render (h, params) {
            if (params.row.actualArrivalTime === null) {
              return h("div", "暂未到货");
            } else {
              return h(
                "div",
                {
                  attrs: {
                    title: v.getDataToLocalTime(
                      params.row.createdTime,
                      "fulltime"
                    )
                  }
                },
                v.getDataToLocalTime(params.row.actualArrivalTime, "fulltime")
              );
            }
          }
        }
      ],
      allListFormValidate: {
        pageNum: 1,
        pageSize: 10,
        productId: "", // 产品id
        category: "QY" // 新品开发需求类别(JBXX基本信息,DSX多属性,TPXX图片信息,XXMS详细描述,CZRZ操作日志,XJ询价,QY取样)
      },
      listCheckInfo: [
        {
          //    categoryId: null,			//质检类目ID，不为空则修改数据，否则新增
          categoryName: "", // 质检类目名称，必需
          productId: "", // 新品需求ID，必需
          listCheckDetail: [
            // 质检详情（质检项）集合
            {
              //  checkItemId: null	,	//质检项记录ID,若修改则必需
              checkItemName: "", // 质检项
              checkItemStandard: "", // 标准
              //   checkCategoryId: "",	//质检类目ID，若修改页面内容则必需
              productId: "" // 新品需求ID，必需
            }
          ]
        }
      ]
    };
  },
  created () {},
  methods: {
    save (callback, params, params1) {
      let v = this;
      v.listCheckInfo.forEach((item) => {
        item.productId = v.$store.state.createId;
        item.listCheckDetail.forEach((child) => {
          child.productId = v.$store.state.createId;
        });
      });
      let vaild = true;
      let vaildT = true;
      v.listCheckInfo.some((item) => {
        if (item.categoryName === "") {
          vaild = false;
          return true;
        }
        item.listCheckDetail.some((item) => {
          if (item.checkItemName === "" || item.checkItemStandard === "") {
            vaild = false;
            return true;
          }
        });
      });
      if (!vaild) {
        v.$msg.error({
          content: "质检类目和质检项不能留空",
          duration: 5
        });
      }
      let tit = [];
      v.listCheckInfo.forEach((item) => {
        let arr = [];
        tit.push(item.categoryName);
        item.listCheckDetail.forEach((child) => {
          arr.push(child.checkItemName);
        });
        arr.sort();
        for (var i = 0; i < arr.length; i++) {
          if (arr[i] == arr[i + 1]) {
            v.$msg.error({
              content:
                "质检类目" +
                ":" +
                item.categoryName +
                "," +
                "质检项" +
                "：" +
                arr[i] +
                "重复",
              duration: 5
            });
            vaildT = false;
          }
        }
      });
      tit.sort();
      for (var i = 0; i < tit.length; i++) {
        if (tit[i] === tit[i + 1]) {
          v.$msg.error({
            content: "质检类目" + "：" + tit[i] + "重复",
            duration: 5
          });
          vaildT = false;
        }
      }
      if (vaild && vaildT) {
        v.$axios
          .post(api.saveProductCheckInfo, v.listCheckInfo)
          .then((res) => {
            if (res.code === 0) {
              v.$msg.success("保存成功");
              v.getList();
              callback && callback(params, params1);
            }
          })
          .catch(() => {});
      }
    },
    addCheckInfo () {
      let v = this;
      v.listCheckInfo.push({
        // categoryId: null,			//质检类目ID，不为空则修改数据，否则新增
        categoryName: "", // 质检类目名称，必需
        productId: v.$store.state.createId, // 新品需求ID，必需
        listCheckDetail: [
          // 质检详情（质检项）集合
          {
            //   checkItemId: null	,	//质检项记录ID,若修改则必需
            checkItemName: "", // 质检项
            checkItemStandard: "", // 标准
            //  checkCategoryId: null,	//质检类目ID，若修改页面内容则必需
            productId: v.$store.state.createId // 新品需求ID，必需
          }
        ]
      });
    },
    addCheckDetail (index) {
      let v = this;
      v.listCheckInfo[index].listCheckDetail.push({
        checkItemName: "", // 质检项
        checkItemStandard: "", // 标准
        productId: v.$store.state.createId // 新品需求ID，必需
      });
    },
    delCheckItem (index, childIndex) {
      let v = this;
      v.isDelModal(() => {
        if (
          v.listCheckInfo[index].listCheckDetail[childIndex].checkCategoryId !==
            undefined &&
          v.listCheckInfo[index].listCheckDetail[childIndex].checkCategoryId !==
            ""
        ) {
          v.$axios
            .post(api.deleteCheckDetailByList, [
              {
                checkCategoryId:
                  v.listCheckInfo[index].listCheckDetail[childIndex]
                    .checkCategoryId, // 质检类目ID
                checkItemId:
                  v.listCheckInfo[index].listCheckDetail[childIndex]
                    .checkItemId, // 质检项ID，必需
                productId: v.$store.state.createId
              }
            ])
            .then((res) => {
              if (res.code === 0 && res.datas >= 1) {
                v.$msg.success("删除成功");
                v.getList();
              } else {
                v.$msg.error("删除失败");
              }
            })
            .catch(() => {});
        } else {
          v.listCheckInfo[index].listCheckDetail.splice(childIndex, 1);
          v.$msg.success("删除成功");
        }
      });
    },
    delCategory (index) {
      let v = this;
      v.isDelModal(() => {
        if (
          v.listCheckInfo[index].categoryId !== undefined &&
          v.listCheckInfo[index].categoryId !== ""
        ) {
          v.$axios
            .post(api.deleteCheckCategoryByList, [
              {
                categoryId: v.listCheckInfo[index].categoryId,
                productId: v.$store.state.createId
              }
            ])
            .then((res) => {
              if (res.code === 0 && res.datas >= 1) {
                v.$msg.success("删除成功");
                v.getList();
              } else {
                v.$msg.error("删除失败");
              }
            })
            .catch(() => {
              v.$msg.error("服务错误");
            });
        } else {
          v.listCheckInfo.splice(index, 1);
          v.$msg.success("删除成功");
        }
      });
    },
    changePage (page) {
      let v = this;
      v.allListFormValidate.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.allListFormValidate.pageSize = +val;
      if (val !== undefined) {
        localStorage.setItem("pageSize", val);
      }
      this.getList();
    },
    getList () {
      let v = this;
      v.allListFormValidate.productId = v.$store.state.createId;
      if (localStorage.getItem("pageSize")) {
        v.allListFormValidate.pageSize = +localStorage.getItem("pageSize");
      }
      v.$axios
        .post(api.querySampleInfo, v.allListFormValidate)
        .then((res) => {
          if (res.code === 0) {
            v.sampDate = res.datas.productPurchaseResultList;
            if (res.datas.checkInfoList === null) {
              v.listCheckInfo = [
                {
                  //    categoryId: null,			//质检类目ID，不为空则修改数据，否则新增
                  categoryName: "", // 质检类目名称，必需
                  productId: "", // 新品需求ID，必需
                  listCheckDetail: [
                    // 质检详情（质检项）集合
                    {
                      //  checkItemId: null	,	//质检项记录ID,若修改则必需
                      checkItemName: "", // 质检项
                      checkItemStandard: "", // 标准
                      //   checkCategoryId: "",	//质检类目ID，若修改页面内容则必需
                      productId: "" // 新品需求ID，必需
                    }
                  ]
                }
              ];
            } else {
              v.listCheckInfo = res.datas.checkInfoList;
            }
          }
        })
        .catch(() => {});
    }
  },
  computed: {
    isShow () {
      let v = this;
      if (
        v.$store.state.productCurNodeId === 1 &&
        v.$store.state.curNodeControl === 999
      ) {
        return true;
      } else {
        return false;
      }
    },
    isDisable () {
      let v = this;
      if (
        v.$store.state.productCurNodeId !== 1 ||
        v.$store.state.curNodeControl !== 999
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style>
.categoryInfo .ivu-form-item-error-tip {
  left: 90px !important;
}

.categoryInfo .ivu-form-item-label {
  width: 90px !important;
}

.samp .ivu-form-item-required .ivu-form-item-label:before {
  content: "";
}
</style>
<style scoped>
.delCheckInfo {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
}

.delCheckInfo:hover {
  color: #cc0031;
}

.delCheckItem {
  line-height: 32px;
  margin-left: 10px;
  cursor: pointer;
}

.delCheckItem:hover {
  color: #cc0031;
}

.wid-center {
  width: 90%;
  margin: 0 auto;
}

.demandBoxTit h3 {
  font-weight: 600;
  font-size: 16px;
  padding: 10px 0 10px 15px;
}

.bInfo {
  font-weight: bold;
}
</style>
