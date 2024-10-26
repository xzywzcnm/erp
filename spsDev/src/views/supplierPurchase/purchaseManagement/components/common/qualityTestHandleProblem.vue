<template>
  <div>
    <Modal v-model="isVisible" title="修改问题商品处理单" width="80%" :mask-closable="false" class="problemGoodHandSheet-pages">
      <div class="detail-form">
        <Form ref="formData" :model="formData" :rules="formDataRules" inline :label-width="100">
          <div class="fmb0">
            <div class="fmw200">
              <FormItem prop="receiptCheckQuestionNo" label="处理单号：">
                <span>{{ formData.receiptCheckQuestionNo }}</span>
              </FormItem>
              <FormItem prop="questionType" label="处理类型：">
                <span v-if="processTypeList[formData.questionType]">
                  {{ processTypeList[formData.questionType].label }}
                </span>
              </FormItem>
              <FormItem prop="questionStatus" label="处理状态：">
                <span v-if="processStatusList[formData.questionStatus]">
                  {{ processStatusList[formData.questionStatus].statusLable }}
                </span>
              </FormItem>
              <FormItem label="所属事业部:">
                <div v-if="formData.businessDeptIdList">
                  <span v-for="(item, index) in formData.businessDeptIdList" :key="index">
                    <span v-if="businessDeptList[item]">
                      <span v-if="index > 0">,</span>
                      {{ businessDeptList[item].name }}
                    </span>
                  </span>
                </div>
              </FormItem>
            </div>
            <div class="fmw200">
              <FormItem label="供应商:">
                {{ formData.supplierName }}
              </FormItem>
              <FormItem label="开发人员:">
                <span v-for="(item, index) in userList" :key="index + 'developerId'">
                  <span v-if="formData.developerId === item.userId">{{ item.userName }}</span>
                </span>
              </FormItem>
              <FormItem label="采购员:">
                <span v-for="(item, index) in userList" :key="index + 'purchaserId'">
                  <span v-if="formData.purchaserId === item.userId">{{ item.userName }}</span>
                </span>
              </FormItem>
            </div>
          </div>
          <!-- 退货 -->
          <template v-if="formData.questionType === '0'">
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
          </template>
          <!-- 销毁 -->
          <div class="autoLong" v-if="formData.questionType === '1'">
            <FormItem label="">
              <Alert type="warning" class="alert-tip">提示：货物由仓库自行销毁处理</Alert>
            </FormItem>
          </div>
          <!-- 重新质检 -->
          <template v-if="formData.questionType === '3'">
            <FormItem label="质检比例:" prop="checkRate">
              <div class="flexCenter">
                <dytInput v-model="formData.checkRate" placeholder="请输入" :disabled="!isEdit" />
                <span class="ml10">%</span>
              </div>
            </FormItem>
            <div class="autoLong">
              <FormItem label="备注:">
                <div class="flexCenter">
                  <Input v-model="formData.testRemarks" placeholder="处理意见" :disabled="!isEdit" type="textarea"
                    style="width:400px;" :rows="3" show-word-limit maxlength="200" />
                  <Alert type="warning" class="alert-tip" style="flex:1;max-width:500px;margin-left: 20px;">
                    <span class="tips">提示：</span>
                    <div>
                      <div>货物按商品最新质检标准，重新生成送检任务，重新质检；</div>
                      <div style="color:#FF0000;margin-top:4px;">创建“重新质检”处理单前，先修改好商品的质检标准；</div>
                    </div>
                  </Alert>
                </div>
              </FormItem>
            </div>
          </template>
          <!-- 转合格上架 -->
          <template v-if="formData.questionType === '2'">
            <div class="autoLong">
              <FormItem label="备注:">
                <div class="flexCenter">
                  <Input v-model="formData.groundingRemarks" maxlength="200" show-word-limit type="textarea"
                    placeholder="处理意见" :rows="3" style="width:350px;" :disabled="!isEdit" />
                  <Alert type="warning" class="alert-tip" style="flex:1;margin-left: 20px;">
                    提示：货物生成上架任务，可上架为合格品
                  </Alert>
                </div>
              </FormItem>
            </div>
          </template>

        </Form>
        <div>
          <div class="paraTitle titleLeft mb10">问题商品信息</div>
          <Table border :columns="columns1" :data="tableList" :span-method="handleSpan" max-height="300">
            <template slot-scope="{ row }" slot="picture">
              <div style="display: flex; flex-wrap: wrap" v-if="row.allImageUrl">
                <large-picture :url="row.allImageUrl" imageHigh="60px">
                  <slot name="picslot"></slot>
                </large-picture>
              </div>
            </template>
          </Table>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="confirm" :disabled="modalLoad">确 定</Button>
        <Button @click="isVisible = false">取 消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import largePicture from "@/components/largePicture";
import Clipboard from "clipboard";
import { processTypeList, processStatusList } from '../../problemPiece/components/fileData.js';

export default {
  components: { largePicture },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    isEdit: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    modelData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    businessDeptInfoList: {
      type: Array,
      default() { return [] }
    },
  },
  data() {
    return {
      modalLoad: false,
      isVisible: false,
      formData: {
        rCityName: [],
      },
      // 表单验证
      formDataRules: {
        questionType: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        checkRate: [
          { required: true, message: '请输入', trigger: 'blur' },
          { pattern: /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/, message: '大于0或小于等于100', trigger: 'blur' },
        ],
        deliveryNo: [
          { validator: this.validDelivery, msg: '快递单号不允许存在空格', trigger: 'blur' },
          { validator: this.validDelivery, msg: '快递单号不允许存在空格', trigger: 'change' },
        ],
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
      processTypeList: processTypeList,
      processStatusList: processStatusList,
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
        // this.clearData();
      },
      deep: true
    }
  },
  computed: {
    businessDeptList() {
      let obj = {};
      let list = this.businessDeptInfoList || [];
      list.forEach(k => { obj[k.id] = k })
      return obj;
    },
  },
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
      this.getList();
      this.getAllUser();
      this.getLogistlist();
    },
    getList() {
      let temp = { receiptCheckQuestionNo: this.modelData.receiptCheckQuestionNo };
      this.axios.post(api.getReceiptCheckQuestionDetail, temp).then((res) => {
        this.formData = res.data.datas;
        if (this.formData.rCityName) {
          this.formData.rCityName = this.formData.rCityName.split(",");
        }
        this.handleData(res.data.datas || {});
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
    handleData(datas) {
      this.formData.checkRate = (datas.checkRate || datas.checkRate === 0) ? String(datas.checkRate) : datas.checkRate;
      this.formData.testRemarks = datas.questionType == 3 ? datas.remark : '';
      this.formData.groundingRemarks = datas.questionType == 2 ? datas.remark : '';
      this.formData.businessDeptIdList = Array.from(new Set(datas.businessDeptIdList));
    },
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },
    confirm() {
      this.$refs.formData.validate((valid) => {
        if (!valid) return;
        let data = this.formData;
        let temp = {
          receiptCheckQuestionNo: data.receiptCheckQuestionNo,
          questionStatus: data.questionStatus,
        };

        // 退货
        if (['0'].includes(data.questionType)) {
          const backData = {
            receipterName: data.receipterName,
            telephone: data.telephone,
            logisticsId: data.logisticsId,
            logisticsName: data.logisticsName,
            deliveryNo: data.deliveryNo,
            remark: data.remark,
            rCityName: data.rCityName ? data.rCityName.join(",") : [],
            rAddress: data.rAddress,
          }
          temp = Object.assign({}, temp, backData);
        }
        // 重新质检
        if (['3'].includes(data.questionType)) {
          temp.checkRate = data.checkRate;
          temp.remark = data.testRemarks;
        }
        // 转合格上架
        if (['2'].includes(data.questionType)) {
          temp.remark = data.groundingRemarks;
        }

        // 空字符串需置空
        Object.keys(temp).forEach(key => {
          temp[key] === '' && (temp[key] = null);
        })
        // console.log(temp)

        this.modalLoad = true;
        this.axios.post(api.wmsReceiptCheckQuestion_update, temp).then((res) => {
          this.$Message.success("修改成功");
          this.$emit('checkSearch');
          this.isVisible = false;
        }).finally(() => {
          this.modalLoad = false;
        })
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
    // 验证快递单号
    validDelivery (rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(value) || this.formData.questionType !== '0') return callback();
        if (value.includes(' ')) return callback(new Error(rule.msg || '当前项不允许存在空格'));
        callback();
      })
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

<style  lang="less">
.problemGoodHandSheet-pages {
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
    width: 500px;
  }

  .ivu-form-item {
    margin-bottom: 13px;
  }

  .ivu-modal {
    min-width: 1000px;
    max-width: 1800px;
  }

  // 详情表单
  .detail-form {
    .flexCenter {
      display: flex;
      align-items: center;
    }

    .alert-tip {
      margin: 0;

      .tips {
        white-space: nowrap;
      }

      .ivu-alert-message {
        display: flex;
      }
    }

    .ivu-form-item {
      margin-bottom: 20px;
    }

    .fmb0 .ivu-form-item {
      margin-bottom: 6px;
    }

    .fmw200 .ivu-form-item-content {
      width: 200px;
    }

    .autoLong .ivu-form-item-content {
      width: auto;
    }
  }
}
</style>