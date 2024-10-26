<template>
  <div>
    <Form ref="formData" :model="formData" inline :label-width="100">
      <div>
        <FormItem prop="receiptCheckQuestionNo" label="处理单号：">
          <span>{{ formData.receiptCheckQuestionNo }}</span>
        </FormItem>
        <FormItem prop="questionType" label="处理类型：" style="margin-left: 142px">
          <span>{{ formData.questionType == 0 ? "退货" : "销毁" }}</span>
        </FormItem>
        <FormItem prop="questionStatus" label="处理状态：" style="margin-left: 210px">
          <span v-if="formData.questionStatus == '0'">待退货</span>
          <span v-if="formData.questionStatus == '1'">待销毁</span>
          <span v-if="formData.questionStatus == '2'">已退货</span>
          <span v-if="formData.questionStatus == '3'">已销毁</span>
        </FormItem>
      </div>
      <div>
        <FormItem prop="supplierName" label="供应商：">
          <Input type="text" v-model="formData.supplierName" style="width: 280px" disabled>
          </Input>
        </FormItem>
        <FormItem label="开发人员：">
          <dyt-select v-model="formData.developerId" clearable style="width: 240px" disabled>
            <Option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId">
            </Option>
          </dyt-select>
        </FormItem>
        <FormItem label="采购人员：">
          <dyt-select v-model="formData.purchaserId" clearable style="width: 240px" disabled>
            <Option v-for="item in userList" :key="item.userId" :label="item.userName" :value="item.userId">
            </Option>
          </dyt-select>
        </FormItem>
      </div>
      <div style="display: flex; align-items: center">
        <FormItem prop="receipterName" label="收货人名称：">
          <Input type="text" v-model="formData.receipterName" style="width: 280px" :disabled="!isEdit">
          </Input>
        </FormItem>
        <FormItem prop="telephone" label="联系电话：">
          <Input type="text" v-model="formData.telephone" style="width: 240px" :disabled="!isEdit">
          </Input>
        </FormItem>
        <div style="color: #422cf9; cursor: pointer" class="ml10" @click="copyInfo($event)">
          <Icon type="ios-copy-outline" size="20" v-if="!isEdit" />
          <span style="text-decoration: underline" v-if="!isEdit">复制收货人地址信息</span>
        </div>
      </div>
      <div class="clear">
        <div class="address">退货地址地区：</div>
        <div class="chooseAdd">
          <Row>
            <Col span="9">
            <Cascader :data="addressList" v-model="formData.rCityName" style="width: 280px" :disabled="!isEdit"
              :filterable="true" :load-data="loadAreaData" :change-on-select="true"></Cascader>
            </Col>
            <Col span="8">
            <FormItem prop="address" label="详细地址：" :label-width="172">
              <Input type="text" v-model="formData.rAddress" style="width: 580px" :disabled="!isEdit">
              </Input>
            </FormItem>
            </Col>
          </Row>
        </div>
      </div>
      <div>
        <FormItem prop="logisticsName" label="快递公司：">
          <dyt-select v-model="formData.logisticsId" clearable style="width: 280px" :disabled="!isEdit">
            <Option v-for="item in logisterList" :value="item.logisticsId.toString()" :key="item.logisticsId">{{
              item.logisticsName }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem prop="deliveryNo" label="快递单号：">
          <Input type="text" v-model="formData.deliveryNo" style="width: 240px" :disabled="!isEdit">
          </Input>
        </FormItem>
      </div>
      <div>
        <FormItem prop="remark" label="备注：">
          <Input type="text" v-model="formData.remark" style="width: 590px" :disabled="!isEdit">
          </Input>
        </FormItem>
      </div>
    </Form>
    <div>
      <div class="paraTitle titleLeft mb10">问题商品信息</div>
      <Table border :columns="columns1" :data="tableList" :span-method="handleSpan" max-height="300">
        <template slot-scope="{ row }" slot="picture">
          <div style="display: flex; flex-wrap: wrap">
            <div v-for="(item, index) in row.imageList" :key="index" style="margin-right: 5px">
              <large-picture :url="item" imageHigh="60px">
                <slot name="picslot"></slot>
              </large-picture>
            </div>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import largePicture from "@/components/largePicture";
import Clipboard from "clipboard";

export default {
  components: { largePicture },
  props: {
    isEdit: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    receiptCheckQuestionNo: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  data() {
    return {
      formData: {
        rCityName: [],
      },
      columns1: [
        {
          title: "单号信息",
          key: "name",
          width: 220,
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "质检单号："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.receiptCheckNo
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "采购单号："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.purchaseNo
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "入库单号："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.receiptNo
                  ),
                ]
              ),
            ]);
          },
        },
        {
          title: "基本信息",
          key: "age",
          width: "300px",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "质检记录号："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.receiptBatchCheckDetailNo
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "SKU："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.sku
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { margin: "4px 0 1px 0" },
                  class: "",
                  attrs: { title: params.row.supplierName },
                },
                params.row.description
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  // h(
                  //   "div",
                  //   {
                  //     style: { color: "#538f41" },
                  //   },
                  //   "Color："
                  // ),
                  h(
                    "span",
                    {
                      style: { color: "#538f41" },
                    },
                    params.row.productAttributes
                  ),
                ]
              ),
            ]);
          },
        },
        {
          title: "问题原因",
          key: "problemCheckReason",
          render: (h, params) => {
            return h(
              "div",
              {
                style: { margin: "4px 0 1px 0" },
                class: "",
                attrs: { title: params.row.problemCheckReason },
              },
              params.row.problemCheckReason
            );
          },
        },
        {
          title: "质检图片",
          key: "image",
          slot: "picture",
          width: "240px",
        },
        {
          title: "备注",
          key: "remark",
        },
        {
          title: "剩余数量",
          key: "remainNumber",
        },
      ],
      tableList: [],
      //开发人员，采购人员
      userList: [],
      //退货地址
      addressList: [],
      // imageList: [
      //   "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fooo.0o0.ooo%2F2017%2F03%2F10%2F58c20faf45e2c.png&refer=http%3A%2F%2Fooo.0o0.ooo&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1668756004&t=f5601f574c908338eb00f3f1ee29dc0d",
      // ],
      logisterList: [], //快递公司
    };
  },
  mounted() {
    this.getList();
    this.getLogistlist();
    this.getAllUser();
  },

  methods: {
    getList() {
      let temp = { receiptCheckQuestionNo: this.receiptCheckQuestionNo };
      this.axios.post(api.getReceiptCheckQuestionDetail, temp).then((res) => {
        this.formData = res.data.datas;
        if (this.formData.rCityName) {
          this.formData.rCityName = this.formData.rCityName.split(",");
        }
        let tableList = [];
        res.data.datas.receiptCheckQuestionDetailProductList.forEach(
          (itema) => {
            itema.receiptProblemDetailList.forEach((itemb, index) => {
              itemb.receiptCheckNo = itema.receiptCheckNo;
              itemb.purchaseNo = itema.purchaseNo;
              itemb.receiptNo = itema.receiptNo;
              if (index == 0) {
                itemb.rowspan = itema.receiptProblemDetailList.length;
                itemb.colspan = 1;
              } else {
                itemb.rowspan = 0;
                itemb.colspan = 0;
              }

              tableList.push(itemb);
            });
          }
        );
        this.tableList = tableList;
        const info = this.$common.copy(this.formData);
        const arrKey = ["rCityName"];
        const number = [];
        this.getAddress(1).then((temp) => {
          this.getDetailsAddress(
            temp,
            this.$common.isEmpty(info.rCityName) ? [] : info.rCityName
          ).then((res) => {
            this.addressList = res.list;
            this.$nextTick(() => {
              this.$nextTick(() => {
                Object.keys(info).forEach((key) => {
                  if (arrKey.includes(key)) {
                    this.$set(
                      this.formData,
                      key,
                      this.$common.isArray(info[key])
                        ? info[key]
                        : this.$common.isEmpty(info[key])
                          ? []
                          : [info[key]]
                    );
                  } else if (number.includes(key)) {
                    const newNumber = Number(info[key]);
                    this.$set(
                      this.formData,
                      key,
                      this.$common.isEmpty(newNumber) ? null : newNumber
                    );
                  } else {
                    this.$set(this.formData, key, info[key]);
                  }
                });
              });
              this.formData.rCityName = res.val;
            });
          });
        });
      });
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },
    confirm() {
      let temp = {
        receiptCheckQuestionNo: this.formData.receiptCheckQuestionNo,
        questionStatus: this.formData.questionStatus,
        receipterName: this.formData.receipterName,
        telephone: this.formData.telephone,
        logisticsId: this.formData.logisticsId,
        logisticsName: this.formData.logisticsName,
        deliveryNo: this.formData.deliveryNo,
        remark: this.formData.remark,
        rCityName: this.formData.rCityName,
        rAddress: this.formData.rAddress,
      };
      if (temp.rCityName) {
        temp.rCityName = temp.rCityName.join(",");
      }
      this.axios.post(api.wmsReceiptCheckQuestion_update, temp).then((res) => {
        this.$Message.success("修改成功");
        this.$emit("closeModalView");
      });
    },
    //获取开发员采购员
    getAllUser() {
      this.axios.get(api.userInfo_getAllUser).then((res) => {
        let list = [];
        Object.keys(res.data.datas).forEach((item) => {
          let temp = {};
          temp.userId = res.data.datas[item].userId;
          temp.userName = res.data.datas[item].userName;
          list.push(temp);
        });
        this.userList = list;
      });
    },

    //请求地址接口
    getAddress(parentId) {
      return new Promise((resolve) => {
        this.axios
          .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${parentId}`)
          .then((res) => {
            let temp = res.data.data;
            let circle = (temp) => {
              temp.forEach((item) => {
                item.children = item.childrenDistrictList;
                item.label = item.districtCnName;
                item.value = item.districtCnName;
                if ([0, "0"].includes(item.isLastNode)) {
                  item.loading = false;
                }
                delete item.childrenDistrictList;
                if (item.children) circle(item.children);
              });
            };
            circle(temp);
            resolve(temp);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    // 展开子级加载
    loadAreaData(item, callback) {
      item.loading = true;
      if (item.isLastNode == 1) {
        item.loading = false;
        callback();
        return;
      }
      this.axios
        .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${item.id}`)
        .then((res) => {
          let temp = res.data.data;
          let circle = (temp) => {
            temp.forEach((itema) => {
              itema.children = itema.childrenDistrictList;
              itema.label = itema.districtCnName;
              itema.value = itema.districtCnName;
              //加了不会退出
              if (itema.isLastNode == 0) {
                itema.loading = false;
              }
              delete itema.childrenDistrictList;
              if (itema.children) circle(itema.children);
            });
          };
          circle(temp);
          item.children = temp;
          item.loading = false;
          callback();
        });
    },
    getDetailsAddress(topAreaList, addressArr = []) {
      return new Promise((resolve) => {
        let treeList = this.$common.copy(topAreaList);
        const hand = (data, index = 0, allData) => {
          let obj = {};
          let treeIndex = 0;
          data.forEach((item, tIndex) => {
            if (item.label === addressArr[index]) {
              obj = item;
              treeIndex = tIndex;
            }
          });

          if (this.$common.isEmpty(obj)) {
            return resolve({ list: treeList, val: addressArr });
          }
          this.getAddress(obj.id).then((res) => {
            allData[treeIndex].children = res;
            if (addressArr.length - 1 > index) {
              hand(res || [], index + 1, allData[treeIndex].children);
            } else {
              return resolve({ list: treeList, val: addressArr });
            }
          });
        };
        hand(topAreaList, 0, treeList);
      });
    },
    copyInfo(e) {
      let text = `收货人名称：${this.formData.receipterName}；联系电话：${this.formData.telephone}；退货地址地区：${this.formData.rCityName}；详细地址：${this.formData.rAddress}；`;
      const clipboard = new Clipboard(e.target, { text: () => text });
      clipboard.on("success", (e) => {
        this.$Message.success("复制成功");
        // 释放内存
        clipboard.off("error");
        clipboard.off("success");
        clipboard.destroy();
      });
      clipboard.on("error", (e) => {
        // 不支持复制
        this.$Message.warning("复制成功");
        // 释放内存
        clipboard.off("error");
        clipboard.off("success");
        clipboard.destroy();
      });
      clipboard.onClick(e);
    },
    // 获取快递物流商
    getLogistlist() {
      this.axios.post(api.logistics).then(({ data }) => {
        if (data.code == 0) {
          this.logisterList = data.datas || [];
        }
      });
    },
  },
};
</script>

<style scoped>
.address {
  width: 100px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.chooseAdd {
  float: left;
  width: 580px;
}

.ivu-form-item {
  margin-bottom: 13px;
}
</style>