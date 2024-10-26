<template>
  <div>
    <Form ref="formData" :model="formData" inline :label-width="100">
      <div>
        <FormItem prop="value1" label="处理单号：">
          <span>保存后自动生成</span>
        </FormItem>
      </div>
      <div>
        <FormItem prop="questionType" label="处理类型：">
          <RadioGroup v-model="formData.questionType">
            <Radio label="0">退货</Radio>
            <Radio label="1">销毁</Radio>
          </RadioGroup>
          <span class="ml10" style="background-color: #f2f2f2">提示：如果问题产品可以上架入库，请通知仓库修改问题产品数量</span>
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
      <div>
        <FormItem prop="receipterName" label="收货人名称：">
          <Input type="text" v-model="formData.receipterName" style="width: 280px">
          </Input>
        </FormItem>
        <FormItem prop="telephone" label="联系电话：">
          <Input type="text" v-model="formData.telephone" style="width: 240px">
          </Input>
        </FormItem>
      </div>
      <div class="clear">
        <div class="address">退货地址地区：</div>
        <div class="chooseAdd">
          <Row>
            <Col span="9">
            <Cascader :data="addressList" v-model="formData.rAddress" style="width: 280px" :filterable="true"
              :load-data="loadAreaData" :change-on-select="true"></Cascader>
            </Col>

            <Col span="8">
            <FormItem prop="rAddressDetail" label="详细地址：" :label-width="174">
              <Input type="text" v-model="formData.rAddressDetail" style="width: 580px">
              </Input>
            </FormItem>
            </Col>
          </Row>
        </div>
      </div>
      <div>
        <FormItem prop="logisticsId" label="快递公司：">
          <dyt-select v-model="formData.logisticsId" clearable style="width: 280px">
            <Option v-for="item in logisterList" :value="item.logisticsId" :key="item.logisticsId">{{ item.logisticsName
            }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem prop="deliveryNo" label="快递单号：">
          <Input type="text" v-model="formData.deliveryNo" style="width: 240px">
          </Input>
        </FormItem>
      </div>
      <div>
        <FormItem prop="remark" label="备注：">
          <Input type="text" v-model="formData.remark" style="width: 590px">
          </Input>
        </FormItem>
      </div>
    </Form>
    <div>
      <div class="paraTitle titleLeft mb10">问题商品信息</div>
      <Table border :columns="columns1" :data="problemProductTableList" :span-method="handleSpan" max-height="300">
        <template slot-scope="{ row }" slot="picture">
          <div style="display: flex; flex-wrap: wrap">
            <div v-for="(item, index) in row.imgUrlList" :key="index" style="margin-right: 5px">
              <large-picture :url="item.imgUrl || row.thumbUrl" imageHigh="60px">
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
export default {
  components: { largePicture },
  props: {
    problemProductTableList: {
      type: Array,
      default: () => {
        return [];
      },
    },
    receiptCheckNoList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      formData: {
        //处理类型
        questionType: "0",
        //供应商
        supplierName: "",
        //开发员id
        developerId: "",
        //采购员id
        purchaserId: "",
        //收货人名称
        receipterName: "",
        //电话
        telephone: "",
        //快递公司
        logisticsName: null,
        //快递公司单号
        logisticsId: null,
        //快递单号
        deliveryNo: "",
        //备注
        remark: "",
        //退货城市
        rCityName: "",
        rCityId: "",
        //地址
        rAddress: [],
        //详细地址
        rAddressDetail: "",
        //供应商id
        supplierId: "",
        //仓库id
        warehouseId: "",
      },
      columns1: [
        {
          title: "单号信息",
          key: "name",
          width: "240px",
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
                  // h(
                  //   "div",
                  //   {
                  //     style: { marginLeft: "5px", color: "#538f41" },
                  //   },
                  //   "Size："
                  // ),
                  // h(
                  //   "span",
                  //   {
                  //     style: { color: "#538f41" },
                  //   },
                  //   "4XL"
                  // ),
                ]
              ),
            ]);
          },
        },
        {
          title: "问题原因",
          key: "address",
          render: (h, params) => {
            return h(
              "div",
              {
                style: { margin: "4px 0 1px 0" },
                class: "",
                attrs: { title: params.row.supplierName },
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
          key: "problemCheckNumber",
        },
      ],
      userList: [],
      logisterList: [],
      //退货地址
      addressList: [],
    };
  },
  created() { },
  mounted() {
    this.getSupplierInfo();
    this.getAllUser();
    this.getLogistlist();
  },

  methods: {
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },

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

    confirm() {
      if (this.formData.rAddress) {
        this.formData.rAddress = this.formData.rAddress.join(",");
      }
      this.logisterList.forEach((item) => {
        if (item.logisticsId == this.formData.logisticsId) {
          this.formData.logisticsName = item.logisticsName;
        }
      });

      this.problemProductTableList.forEach((item) => {
        if (item.refundNumber == null) {
          item.refundNumber = 0;
        }
        if (item.destructionNumber == null) {
          item.destructionNumber = 0;
        }
      });
      this.formData.receiptCheckQuestionDetailBaseList = this.problemProductTableList;
      let temp = JSON.parse(JSON.stringify(this.formData));
      temp.rAddress = this.formData.rAddressDetail;
      temp.rCityName = this.formData.rAddress;

      temp.rCityName = temp.rCityName.split(",");
      let rCityId = [];

      let f1 = (rCityName, addressList, index) => {
        addressList.forEach((item) => {
          if (item.districtCnName == rCityName[index]) {
            rCityId.push(item.id);
            index = index + 1;
            if (index < rCityName.length) f1(rCityName, item.children, index);
          }
        });
      };
      f1(temp.rCityName, this.addressList, 0);
      temp.rCityId = rCityId.join(",");
      temp.rCityName = temp.rCityName.join(",");

      // 多传质检单号
      let obj = {};
      this.problemProductTableList.forEach(k => {
        obj[k.receiptCheckNo] = k;
      })
      temp.receiptCheckIdList = Object.keys(obj).map(k => obj[k].receiptCheckId);
      // console.log(temp)

      this.axios.post(api.createProcessing, temp).then((res) => {
        this.$emit("closeModal");
        this.$Message.success("创建成功");
      });
    },
    // 获取快递物流商
    getLogistlist() {
      this.axios.post(api.logistics).then(({ data }) => {
        if (data.code == 0) {
          this.logisterList = data.datas || [];
        }
      });
    },

    getSupplierInfo() {
      this.axios
        .post(
          "/sps-service/wmsReceiptCheckQuestion/createProcessingGetSupplierInfo",
          { receiptBatchNoList: this.receiptCheckNoList }
        )
        .then((res) => {
          this.formData.supplierName = res.data.datas.supplierName;
          this.formData.developerId = res.data.datas.developerId;
          this.formData.purchaserId = res.data.datas.purchaserId;
          this.formData.warehouseId = res.data.datas.warehouseId;
          let supplierId = res.data.datas.supplierId;
          this.getAddressInfo(supplierId);
        });
    },
    getAddressInfo(supplierId) {
      this.axios
        .get(
          `/sps-service/wmsReceiptBatchCheck/getRefundAddress?supplierId=${supplierId}`
        )
        .then((res) => {
          if (res.data.datas.rAddress) {
            this.formData.rAddress = res.data.datas.rAddress.split(",");
          }
          this.formData.rAddressDetail = res.data.datas.rAddressDetail;
          this.formData.receipterName = res.data.datas.contactMan;
          this.formData.telephone = res.data.datas.telephone;
          this.formData.supplierId = res.data.datas.supplierId;
          const info = this.$common.copy(this.formData);
          const arrKey = ["rAddress"];
          const number = [];
          this.getAddress(1).then((temp) => {
            this.getDetailsAddress(
              temp,
              this.$common.isEmpty(info.rAddress) ? [] : info.rAddress
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
                this.formData.rAddress = res.val;
              });
            });
          });
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