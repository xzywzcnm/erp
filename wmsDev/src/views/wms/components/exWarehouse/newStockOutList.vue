<template>
  <div class="newStockOutList">
    <!--返回-->
    <div class="back">
      <!-- <h3> -->
      <Icon type="ios-arrow-back"></Icon>
      <a href="javascript:;" style="color: #657180" @click="backList">返回列表</a>
      <!-- </h3> -->
    </div>
    <div style="background-color: #fff">
      <Tabs value="main" @on-click="tabClick">
        <TabPane label="主信息" name="main">
          <Form :label-width="150" :rules="ruleValidate" :model="mainInfo" ref="main">
            <Row>
              <!--<Col span="6">-->
              <!--<FormItem label="发货仓库：" prop='ware'>-->
              <!--<Select v-model="mainInfo.ware" style="width:220px"-->
              <!--@on-change='wareChange'>-->
              <!--<Option v-for="item in wareList" :value="item.warehouseId" :key="item.warehouseId">-->
              <!--{{ item.warehouseName }}-->
              <!--</Option>-->
              <!--</Select>-->
              <!--</FormItem>-->
              <!--</Col>-->
              <Col span="6">
              <FormItem label="出库单类型：" prop="type">
                <Select v-model="mainInfo.type" style="width: 220px" @on-change="typeChange">
                  <!-- <Option value="O2">组装加工</Option> 不要的 -->
                  <!-- <Option value="O3">其他出库</Option>
                  <Option value="O4">退货</Option> -->
                  <!-- <Option value="O3">故障品出库</Option> 不要的 -->
                  <template v-for="(item, index) in outListTypeList">
                    <Option :value="item.value" :label="item.label" v-if="!item.importHide" :key="index + 'im'" />
                  </template>
                </Select>
              </FormItem>
              </Col>
              <!--<Col span="6">-->
              <!--<FormItem label="出库单状态：">-->
              <!--<Select v-model="mainInfo.status" style='width: 220px' @on-change='statusChange'>-->
              <!--<Option v-for="item in outListStatusList" :value="item.value"-->
              <!--:key="item.value">-->
              <!--{{ item.label }}-->
              <!--</Option>-->
              <!--</Select>-->
              <!--</FormItem>-->
              <!--</Col>-->
            </Row>
            <Row>
              <!--<Col span="6">-->
              <!--<FormItem label="运费/报关费/其他费用：">-->
              <!--<Select v-model="mainInfo.moneyType" style='width: 100px' @on-change='moneyTypeChange'>-->
              <!--<Option value="rmb">CNY-人民币</Option>-->
              <!--<Option value="us">USD-美金</Option>-->
              <!--</Select>-->
              <!--<InputNumber :min="0" :step="1.0" v-model="mainInfo.carriage"-->
              <!--style='width: 50px'></InputNumber>-->
              <!--<InputNumber :min="0" :step="1.0" v-model="mainInfo.clearanceFee"-->
              <!--style='width: 50px'></InputNumber>-->
              <!--<InputNumber :min="0" :step="1.0" v-model="mainInfo.otherFee"-->
              <!--style='width: 50px'></InputNumber>-->
              <!--</FormItem>-->
              <!--</Col>-->
              <Col span="6">
              <FormItem label="参考编号：" prop="referenceNum">
                <Input v-model.trim="mainInfo.referenceNum" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="备注：" prop="textarea">
                <Input v-model.trim="mainInfo.textarea" style="width: 220px" type="textarea"
                  :autosize="{ minRows: 2, maxRows: 7 }" placeholder="备注信息"></Input>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane label="收货人信息" name="receiver">
          <Form :label-width="100" :rules="ruleValidate" :model="mainInfo" ref="receiver">
            <Row>
              <Col span="6">
              <FormItem label="收货人名称：" prop="receiverName">
                <Input v-model.trim="mainInfo.receiverName" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="国家：" prop="country">
                <Select v-model="mainInfo.country" style="width: 220px" filterable>
                  <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.cnName
                  }}
                  </Option>
                </Select>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="联系人：" prop="linkman">
                <Input v-model.trim="mainInfo.linkman" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="省/州：" prop="region">
                <Input v-model.trim="mainInfo.region" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="联系电话：" prop="tel">
                <Input v-model.trim="mainInfo.tel" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="城市：" prop="city">
                <Input v-model.trim="mainInfo.city" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="邮箱：" prop="email">
                <Input v-model.trim="mainInfo.email" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="详细地址：" prop="address">
                <Input v-model.trim="mainInfo.address" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="邮政编码：" prop="postalcode">
                <Input v-model.trim="mainInfo.postalcode" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane label="物流商信息" name="logistic">
          <Form :label-width="100" :rules="ruleValidate" :model="mainInfo" ref="logistic">
            <Row>
              <Col span="6">
              <FormItem label="物流商：">
                <Select v-model="mainInfo.logisticDealer" label-in-value style="width: 220px" filterable
                  @on-change="logisticDealerChange">
                  <Option v-for="v in apiLogisterList" :value="v.code" :key="v.code">{{
                    v.name
                  }}</Option>
                </Select>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="物流商单号：" prop="logisticListNum">
                <Input v-model.trim="mainInfo.logisticListNum" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="邮寄方式：">
                <Select v-model="mainInfo.sendType" style="width: 220px" @on-change="changeSendType" label-in-value
                  filterable placeholder="请先选择物流商">
                  <Option v-for="v in apiSendTypeList" :value="v.code" :key="v.code">{{
                    v.name
                  }}</Option>
                </Select>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="运单号：" prop="trackingNum">
                <Input v-model.trim="mainInfo.trackingNum" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="联系人：" prop="linkmanOfLogistic">
                <Input v-model.trim="mainInfo.linkmanOfLogistic" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="联系电话：" prop="telOfLogistic">
                <Input v-model.trim="mainInfo.telOfLogistic" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="邮箱：" prop="emailOfLogistic">
                <Input v-model.trim="mainInfo.emailOfLogistic" placeholder="" style="width: 220px"></Input>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
      </Tabs>
    </div>
    <div class="dtlMsg">
      <h3>明细信息</h3>
    </div>
    <div style="padding: 10px 0">
      <Button type="primary" @click="addProductFn">添加产品</Button>
    </div>
    <div>
      <Table :columns="columns" :data="data"></Table>
    </div>
    <div class="clear">
      <div class="fr pages">
        <Page :total="data.length" show-total :page-size-opts="pageArray" show-sizer show-elevator
          style="margin-top: 10px"></Page>
      </div>
    </div>
    <div class="optBtn">
      <Button type="primary" @click="createStockOutList" style="margin-right: 10px">创建出库单</Button>
      <Button ghost @click="backList">返回列表</Button>
    </div>
    <!--添加产品模态框-->
    <div v-if="addProductModal">
      <Modal class="addProductModal1 headerBar addProductBar" v-model="addProductModal" title="添加产品" @on-ok="okAdd"
        @on-cancel="cancelAdd">
        <addProduct :from="'allGoods'" @addProductSuccess="addProductSuccess" @addProductCancel="addProductCancel"
          :wareId="wareId" :eliminateData="data"></addProduct>
      </Modal>
    </div>
  </div>
</template>
<script>
// import addProduct from './addProduct';
import addProduct from "../wms-inStock/newAddProduct";
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import { outListTypeList } from "./otherStockOut/fileData";

export default {
  components: {
    addProduct,
  },
  mixins: [common],
  data() {
    let v = this;
    return {
      addProductModal: false,
      wareList: [],
      wareId: v.getWarehouseId(),
      outListStatusList: [
        {
          label: "订单创建",
          value: "0",
        },
      ],
      mainInfo: {
        type: "",
        status: "",
        referenceNum: "",
        moneyType: "rmb",
        carriage: 0,
        clearanceFee: 0,
        otherFee: 0,
        textarea: "", // 物流商
        receiverName: "",
        country: "",
        linkman: "",
        region: "",
        tel: "",
        city: "",
        address: "",
        email: "",
        postalcode: "", // 承运人
        logisticDealer: "",
        logisticDealerName: "",
        linkmanOfLogistic: "",
        telOfLogistic: "",
        emailOfLogistic: "",
        logisticListNum: "",
        sendType: "", // 邮寄方式
        sendTypeName: "",
        trackingNum: "", // 跟踪号
      },
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "图片",
          key: "goodsUrl",
          render: (h, params) => {
            return this.tableImg(h, params, "goodsUrl");
          },
        },
        {
          title: "SKU",
          key: "goodsSku",
        },
        {
          title: "SKU属性",
          key: "goodsAttributes",
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
        },
        {
          title: "订单数量",
          key: "expectedNumber",
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  size: "small",
                  placeholder: "",
                  min: 1,
                  value: 1,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-change": (num) => {
                    v.$set(v.data[params.index], "expectedNumber", num);
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "重量",
          key: "goodsWeight",
        },
        {
          title: "体积",
          key: "goodsVolume",
        },
        {
          title: "操作",
          key: "op",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  size: "small",
                  type: "primary",
                },
                on: {
                  click: () => {
                    this.data.splice(params.index, 1);
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      data: [],
      ruleValidate: {
        referenceNum: [
          {
            type: "string",
            max: 32,
            message: "最多输入32个字符",
            trigger: "blur",
          },
        ],
        textarea: [
          {
            type: "string",
            max: 100,
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ],
        receiverName: [
          {
            type: "string",
            max: 100,
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ], // country: [
        //     {
        //         type: 'string', max: 100, message: '最多输入100个字符', trigger: 'blur'
        //     }
        // ],
        linkman: [
          {
            type: "string",
            max: 100,
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ],
        region: [
          {
            type: "string",
            max: 250,
            message: "最多输入250个字符",
            trigger: "blur",
          },
        ],
        city: [
          {
            type: "string",
            max: 250,
            message: "最多输入250个字符",
            trigger: "blur",
          },
        ],
        address: [
          {
            type: "string",
            max: 500,
            message: "最多输入500个字符",
            trigger: "blur",
          },
        ],
        postalcode: [
          {
            type: "string",
            max: 25,
            min: 0,
            message: "请输入0-25个数字",
            trigger: "blur",
          },
          {
            validator: this.validNum(),
            trigger: "blur",
          },
        ],
        logisticListNum: [
          {
            type: "string",
            max: 30,
            message: "最多输入30个字符",
            trigger: "blur",
          },
        ],
        trackingNum: [
          {
            type: "string",
            max: 30,
            message: "最多输入30个字符",
            trigger: "blur",
          },
        ],
        linkmanOfLogistic: [
          {
            type: "string",
            max: 100,
            message: "最多输入100个字符",
            trigger: "blur",
          },
        ],
        type: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "change",
          },
        ],
        emailOfLogistic: [
          {
            type: "email",
            message: "邮箱格式不正确",
            trigger: "blur",
          },
        ],
        email: [
          {
            type: "email",
            message: "邮箱格式不正确",
            trigger: "blur",
          },
        ],
        tel: [
          {
            validator: this.validateMobile,
            trigger: "blur",
          },
        ],
        telOfLogistic: [
          {
            validator: this.validateMobile,
            trigger: "blur",
          },
        ],
      },
      apiLogisterList: [], // 物流商下拉
      apiSendTypeList: [], // 邮寄方式下拉
      carrierId: "", // 选择物流商查邮寄方式的参数
      outListTypeList: outListTypeList,
    };
  },
  methods: {
    addProductSuccess(data) {
      let v = this;
      v.addProductModal = false;
      data.forEach((val) => {
        val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
        val.expectedNumber = 1;
      });
      let data1 = JSON.parse(JSON.stringify(this.data));
      this.data = [...data1, ...data];
    },
    addProductCancel() {
      this.addProductModal = false;
    },
    validateMobile(rule, value, callback) {
      // 手机校验，可共用
      if (!this.$common.isEmpty(value) && (!(this.$regular.isPhone.test(value) || this.$regular.isMob.test(value)))) {
        callback(new Error("电话号码格式不正确"));
        return;
      }
      callback();
    },
    validNum() {
      var reg = this.$regular.maxNumber_25;
      var fn = function (rule, value, callback) {
        if (!reg.test(value)) {
          callback(new Error("请输入0-25位数字"));
        } else {
          callback();
        }
      };
      return fn;
    },
    tabClick(name) {
      if (name === "logistic") {
        this.axios.get(api.get_logisterList + `?carrierId=${null}`).then((res) => {
          if (res.data.code === 0) {
            this.apiLogisterList = res.data.datas;
          }
        });
      }
    },
    backList() {
      this.$parent.workShow = "list";
    },
    okAdd() {
      // 添加产品模态框确定按钮
      let tableData = this.$refs["addProductMd"].tableSltItem;
      let mapId = this.data.map((val) => {
        return val.inventoryId;
      });
      var flag = true;
      tableData.forEach((val) => {
        if (mapId.indexOf(val.inventoryId) > -1) {
          flag = false;
        }
      });
      if (!flag) {
        return this.$Message.warning({
          content: "不能添加重复的数据",
          duration: 5,
        });
      }
      tableData.forEach((val) => {
        val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
        val.expectedNumber = 1;
      });
      this.data = [...tableData, ...this.data];
    },
    cancelAdd() { },
    addProductFn() {
      // 打开添加产品模态层
      this.addProductModal = true;
    },
    wareChange(val) {
      this.mainInfo.ware = val;
    },
    typeChange(val) {
      this.mainInfo.type = val;
    },
    statusChange(val) {
      this.mainInfo.status = val;
    },
    moneyTypeChange(val) {
      this.mainInfo.moneyType = val;
    },
    paramsObj() {
      let obj = {
        warehouseId: this.wareId, // 仓库id
        pickingType: this.mainInfo.type ? this.mainInfo.type : null, // 类型
        pickingStatus: this.mainInfo.status ? this.mainInfo.status : null, // 状态
        referenceNo: this.mainInfo.referenceNum ? this.mainInfo.referenceNum : null, // 参考编号
        wmsPickingLog: {
          logContentDesc: this.mainInfo.textarea ? this.mainInfo.textarea : null,
        },
        wmsPickingExtend: {
          consigneeName: this.mainInfo.receiverName ? this.mainInfo.receiverName : null, // 收货人名称
          consigneeCountry: this.mainInfo.country ? this.mainInfo.country : null, // 国家
          consigneeProvince: this.mainInfo.region ? this.mainInfo.region : null, // 省洲
          consigneeLinkMan: this.mainInfo.linkman ? this.mainInfo.linkman : null, // 联系人
          consigneeCity: this.mainInfo.city ? this.mainInfo.city : null, // 城市
          consigneeLinkTel: this.mainInfo.tel ? this.mainInfo.tel : null, // 联系电话
          consigneeAddress: this.mainInfo.address ? this.mainInfo.address : null, // 地址
          consigneeMail: this.mainInfo.email ? this.mainInfo.email : null, // 邮箱
          consigneeZipCode: this.mainInfo.postalcode ? this.mainInfo.postalcode : null, // 邮政编码
          //
          logisticsDealerCode: this.mainInfo.logisticDealer
            ? this.mainInfo.logisticDealer
            : null, // 承运人
          logisticsDealerName: this.mainInfo.logisticDealerName
            ? this.mainInfo.logisticDealerName
            : null,
          logisticsLinkMan: this.mainInfo.linkmanOfLogistic
            ? this.mainInfo.linkmanOfLogistic
            : null, // 承运联系人
          logisticsLinkTel: this.mainInfo.telOfLogistic
            ? this.mainInfo.telOfLogistic
            : null, // 联系电话
          logisticsLinkMail: this.mainInfo.emailOfLogistic
            ? this.mainInfo.emailOfLogistic
            : null,
          logisticsNo: this.mainInfo.logisticListNum
            ? this.mainInfo.logisticListNum
            : null, // 物流商单号
          logisticsMailCode: this.mainInfo.sendType ? this.mainInfo.sendType : null, // 邮寄方式
          logisticsMailName: this.mainInfo.sendTypeName
            ? this.mainInfo.sendTypeName
            : null,
          logisticsTrackingNo: this.mainInfo.trackingNum
            ? this.mainInfo.trackingNum
            : null, // 跟踪号
        },
        wmsPickingDetail: this.data,
      };
      return obj;
    },
    createStockOutList() {
      // 创建出库单
      // let v = this;
      if (!this.mainInfo.type) {
        return this.$Message.warning({
          content: "请填写必填项",
          duration: 5,
        });
      }
      let flag = true;
      this.$refs["main"].validate((valid) => {
        if (!valid) {
          flag = false;
        }
      });
      this.$refs["receiver"].validate((valid) => {
        if (!valid) {
          flag = false;
        }
      });
      this.$refs["logistic"].validate((valid) => {
        if (!valid) {
          flag = false;
        }
      });
      if (!flag) {
        this.$Message.warning({
          content: "校验未通过",
          duration: 5,
        });
        return;
      }
      let obj = this.paramsObj();
      this.axios.post(api.create_stockOutList, obj).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("创建成功");
          this.$parent.workShow = "list";
        }
      });
    },
    logisticDealerChange(item) {
      this.mainInfo.logisticDealer = item.value;
      this.mainInfo.logisticDealerName = item.label;
      this.carrierId = this.apiLogisterList.find((val) => {
        return val.code === item.value;
      }).code;
      this.axios.get(api.get_sendType + `?carrierId=${this.carrierId}`).then((res) => {
        if (res.data.code === 0) {
          this.apiSendTypeList = res.data.datas;
        }
      });
    },
    changeSendType(item) {
      this.mainInfo.sendType = item.value;
      this.mainInfo.sendTypeName = item.label;
    },
  },
  created() {
    this.getCountrys();
  },
};
</script>
<style>
.newStockOutList {
  padding-left: 10px;
}

.newStockOutList .dtlMsg {
  height: 50px;
  background-color: #ffffff;
  margin-top: 10px;
  line-height: 50px;
  padding-left: 20px;
}

.newStockOutList .back {
  padding: 10px 0;
}

.newStockOutList .optBtn {
  width: 200px;
  margin: 0 auto;
  padding-top: 20px;
}

.addProductModal1 .ivu-modal {
  width: 1110px !important;
}
</style>
