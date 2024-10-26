<template>
  <div>
    <Modal v-model="isVisible" title="创建问题商品处理单" width="80%" :mask-closable="false" class="problemGoodHandSheet-page">
      <div class="detail-form">
        <Form ref="formData" :model="formData" :rules="formDataRules" inline :label-width="100">
          <div class="fmb0">
            <FormItem prop="value1" label="处理单号：">
              <span>保存后自动生成</span>
            </FormItem>
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
              <FormItem label="所属事业部:">
                <span v-if="businessDeptList[formData.businessDeptId]">
                  {{ businessDeptList[formData.businessDeptId].name }}
                </span>
              </FormItem>
            </div>
          </div>

          <div class="autoLong">
            <FormItem label="处理类型:" prop="questionType">
              <RadioGroup v-model="formData.questionType" type="button" button-style="solid">
                <template v-for="item in processTypeArr ">
                  <Radio :label="item.value" :style="activeRadio(item)">
                    {{ item.label }}
                  </Radio>
                </template>
              </RadioGroup>
            </FormItem>
          </div>

          <!-- 退货 -->
          <template v-if="formData.questionType === '0'">
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
                  <FormItem prop="rAddressDetail" label="详细地址：" class="form-width590" :label-width="174">
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
                  <Option v-for="item in logisterList" :value="item.logisticsId" :key="item.logisticsId">{{
                    item.logisticsName
                  }}</Option>
                </dyt-select>
              </FormItem>
              <FormItem prop="deliveryNo" label="快递单号：">
                <Input type="text" v-model="formData.deliveryNo" style="width: 240px">
                </Input>
              </FormItem>
            </div>
            <div class="form-width590">
              <FormItem prop="remark" label="备注：">
                <Input type="text" v-model="formData.remark" style="width: 590px" :autosize="{ minRows: 3, maxRows: 6 }">
                </Input>
              </FormItem>
            </div>
            <div class="form-width590">
              <FormItem label="跳转入库出库单创建页面:" prop="isJumpPage">
                <RadioGroup v-model="formData.isJumpPage">
                  <Radio :label="1" class="mr20">需要(点击确认按钮后自动跳转至创建页面)</Radio>
                  <Radio :label="0">不需要</Radio>
                </RadioGroup>
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
                <dytInput v-model="formData.checkRate" placeholder="请输入" />
                <span class="ml10">%</span>
              </div>
            </FormItem>
            <div class="autoLong">
              <FormItem label="备注:">
                <div class="flexCenter">
                  <Input v-model="formData.testRemarks" maxlength="200" show-word-limit type="textarea" placeholder="处理意见"
                    :rows="3" style="width:400px;" />
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
                    placeholder="处理意见" :rows="3" style="width:350px;" />
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
          <Table border ref="productInfoTable" :columns="columns1" :data="problemProductTableList"
            @on-selection-change="selectProblemProduct" :span-method="handleSpan" max-height="300">
            <template slot-scope="{ row }" slot="picture">
              <div style="display: flex; flex-wrap: wrap">
                <div v-for="(item, index) in row.imgUrlList" :key="index" style="margin-right: 5px">
                  <large-picture :url="item || row.thumbUrl" imageHigh="60px">
                    <slot name="picslot"></slot>
                  </large-picture>
                </div>
              </div>
            </template>
          </Table>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="confirm" :disabled="modalLoad">确 定</Button>
        <Button @click="isVisible = false">取 消</Button>
      </div>
      <!-- <Spin fix v-if="modalLoad"></Spin> -->
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import largePicture from "@/components/largePicture";
import { processTypeList } from '../../problemPiece/components/fileData.js';
import localforage from 'localforage';
export default {
  components: { largePicture },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    moduleList: {
      type: [Array, Object],
      default() {
        return []
      }
    },
    businessDeptInfoList: {
      type: Array,
      default() { return [] }
    },
    // isOtherComing: {// 是否其他入库类型  http://192.168.91.3/www/index.php?m=task&f=view&taskID=9650 需求要求
    //   type: Boolean,
    //   default() {
    //     return false
    //   }
    // },
  },
  data() {
    return {
      modalLoad: false,
      isVisible: false,
      formData: {
        //处理类型
        questionType: "",
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
        checkRate: '100',//质检比例，默认100
        testRemarks: '',//质检意见
        groundingRemarks: '',//上架意见
        businessDeptId: '',//事业部id
        isJumpPage: 0, // 默认不需要
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
      oldFormData: {},
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
          type: 'selection',
          width: 60,
          align: 'center',
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
          title: "数量",
          key: "remainNumber",
          width: "110px",
        },
      ],
      userList: [],
      logisterList: [],
      //退货地址
      addressList: [],
      receiptCheckNoList: [],
      problemProductTableList: [],
      processTypeList: processTypeList,
      selectProblemProductList: []
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
        this.clearData();
      },
      deep: true
    },
    'formData.questionType': {
      handler(val) {
        if (['0', '1'].includes(val)) {
          this.problemProductTableList.forEach((item, index) => {
            this.$refs.productInfoTable.objData[index]._isDisabled = true;
            this.$refs.productInfoTable.objData[index]._isChecked = true;
          })
          this.selectProblemProductList = this.problemProductTableList
        } else {
          this.problemProductTableList.forEach((item, index) => {
            this.$refs.productInfoTable.objData[index]._isChecked = false;
            this.$refs.productInfoTable.objData[index]._isDisabled = false
          })
          this.selectProblemProductList = []
        }
      }
    }
  },
  computed: {
    businessDeptList() {
      let obj = {};
      let list = this.businessDeptInfoList || [];
      list.forEach(k => { obj[k.id] = k })
      return obj;
    },
    processTypeArr() {
      return Object.values(this.processTypeList).sort((a, b) => {
        return a.sort - b.sort;
      });
    },
  },
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
      this.oldFormData = this.$common.copy(this.formData);
      this.getTableList();
      this.getSupplierInfo();
      this.getAllUser();
      this.getLogistlist();
    },
    getTableList() {
      this.receiptCheckNoList = this.moduleList.map(k => k.receiptCheckNo);
      this.axios.post(api.createProcessingQuery, this.receiptCheckNoList).then((res) => {
        let temp = {};
        this.moduleList.forEach((k) => {
          temp[k.receiptCheckNo] = k;
        });
        let newData = [];
        // 列表数据合并设置
        Object.keys(res.data.datas).forEach((key) => {
          const list = res.data.datas[key].filter(
            (f) => f.problemCheckNumber && f.problemCheckNumber > 0
          );
          list.forEach((row, index) => {
            newData.push({
              ...row,
              pictureUrl: row.allImageUrl ? row.allImageUrl.split(",") : [],
              remainNumber:
                typeof row.problemCheckNumber !== "number"
                  ? null
                  : row.problemCheckNumber,
              rowspan: index === 0 ? list.length : 0,
              colspan: index === 0 ? 1 : 0,
              receiptCheckId: temp[key] ? temp[key].receiptCheckId : null,
            });
          });
        });
        this.problemProductTableList = newData;
        if (this.formData.questionType === '') {
          this.problemProductTableList.forEach((item, index) => {
            let imgUrlList = item.allImageUrl.split(',')
            this.$set(item, 'imgUrlList', imgUrlList)
            item._disabled = true;
          })
        }
      });
    },
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
      this.$refs.formData.validate((valid) => {
        if (!valid) return;
        let _self = this;
        let temp = JSON.parse(JSON.stringify(this.formData));
        let delOtherList = ['checkRate', 'testRemarks', 'groundingRemarks'];
        let delBackList = ['receipterName', 'telephone', 'logisticsName', 'logisticsId', 'deliveryNo', 'rCityName', 'rCityId', 'rAddress', 'rAddressDetail'];
        let fun = {
          'delParams'(temp, deleteKeys) {
            Object.keys(temp).forEach(key => {
              deleteKeys.includes(key) && delete temp[key];
            });
          },
          'processData0'() {
            _self.logisterList.forEach((item) => {
              if (item.logisticsId == temp.logisticsId) {
                temp.logisticsName = item.logisticsName;
              }
            });
            temp.rCityName = temp.rAddress || [];
            temp.rAddress = temp.rAddressDetail;
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
            f1(temp.rCityName, _self.addressList, 0);
            temp.rCityId = rCityId.join(",");
            temp.rCityName = temp.rCityName.join(",");
            fun.delParams(temp, delOtherList);
          },
          'processData1'() {
            fun.delParams(temp, [...delBackList, ...delOtherList, 'remark']);
          },
          'processData2'() {
            temp.remark = temp.groundingRemarks;
            fun.delParams(temp, [...delBackList, ...delOtherList]);
          },
          'processData3'() {
            temp.remark = temp.testRemarks;
            let list = _self.$common.copy(delOtherList);
            list.shift();
            fun.delParams(temp, [...delBackList, ...list]);
          },
        }
        this.problemProductTableList.forEach((item) => {
          if (item.refundNumber == null) {
            item.refundNumber = 0;
          }
          if (item.destructionNumber == null) {
            item.destructionNumber = 0;
          }
        });
        // 多传质检单号
        let obj = {};
        this.problemProductTableList.forEach(k => {
          obj[k.receiptCheckNo] = k;
        })
        temp.receiptCheckIdList = Object.keys(obj).map(k => obj[k].receiptCheckId);
        fun['processData' + temp.questionType]();

        // 空字符串需置空
        Object.keys(temp).forEach(key => {
          temp[key] === '' && (temp[key] = null);
        })
        temp.receiptCheckQuestionDetailBaseList = this.selectProblemProductList
        temp.receiptCheckQuestionDetailBaseList.forEach(item => {
          if (item.refundNumber == null) {
            item.refundNumber = 0;
          }
          if (item.destructionNumber == null) {
            item.destructionNumber = 0;
          }
        })
        if (temp.receiptCheckQuestionDetailBaseList.length === 0) {
          return this.$Message.warning('请勾选至少一项问题商品')
        }
        this.modalLoad = true;
        this.axios.post(api.createProcessing, temp).then((res) => {
          this.$Message.success("创建成功");
          this.$emit('checkSearch');
          this.isVisible = false;
          this.jumpToPurchase(temp);
        }).finally(() => {
          this.modalLoad = false;
        })
      });
    },
    // 新的窗口打开入库出库单创建页面（采购管理系统）
    async jumpToPurchase(data) {
      if (!([0, '0'].includes(data.questionType) && [1].includes(data.isJumpPage))) {
        return false;
      }
      const key = 'problemPiece';
      let problemPieceData = await localforage.getItem(key) || {};
      const problemId = new Date().getTime() + parseInt(Math.random() * 100000);
      problemPieceData[problemId] = Object.assign({ tableList: this.problemProductTableList, ...data });
      // console.log(problemPieceData);
      await localforage.setItem(key, problemPieceData);
      const page = `/sps-service/supplierPurchase.html#/receivedProOutboundApply?problemId=${problemId}`;
      const path = window.location.origin + page;
      // const path = 'http://172.20.200.108:8099' + page;
      // const name = '入库出库申请-采购管理系统';
      window.open(path);
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
          this.formData.businessDeptId = res.data.datas.businessDeptId;
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
          // 存在供应商传值为Null的情况，返回的也是null
          if(!res.data.datas) return ;
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
    // 处理类型对应颜色
    activeRadio(row) {
      let str = {};
      let flag = this.formData.questionType === row.value;
      if (flag) {
        str.background = str.borderColor = row.color;
        str.boxShadow = '0 1px 6px ' + row.color;
      }
      return str;
    },
    // 验证快递单号
    validDelivery (rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(value) || this.formData.questionType !== '0') return callback();
        if (value.includes(' ')) return callback(new Error(rule.msg || '当前项不允许存在空格'));
        callback();
      })
    },
    // 清空数据
    clearData() {
      this.formData = this.$common.copy(this.oldFormData);
      this.$nextTick(() => {
        this.$refs.formData.resetFields();
      })
    },
    selectProblemProduct(val) {
      this.selectProblemProductList = val
    }
  },
};
</script>

<style lang="less">
.problemGoodHandSheet-page {
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

  .form-width590 .ivu-form-item-content {
    width: 500px;
  }

  .ivu-modal-body {
    max-height: calc(100vh - 300px);
    overflow: auto;
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

  .inputNuberArrow {
    width: 59px;

    .ivu-input-number-handler-wrap {
      display: none;
    }
  }
}
</style>