<style scoped>
.submitTopBtnWrapper {
  position: absolute;
  top: 20px;
  right: 100px;
}

.leftBtn {
  position: absolute;
  top: 20px;
  left: 120px;
}

.order1688 {
  text-align: right;
  vertical-align: middle;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.statistical {
  padding: 10px 5px;
  font-weight: 600;
}

.ivu-form-item {
  margin-bottom: 10px;
}
</style >
<style>
.addProductBar .ivu-modal-footer {
  display: none;
}
</style>
<template>
  <!--备货计划-->
  <!--houseType  self自营 overSea 海外  fba-->
  <!--plansType 0 自营仓 1海外仓 2FBA -->
  <div>
    <div class="leftBtn">
      <Button v-if="plansType != 2 && planData.readyType !== 5" type="success"
        @click="operateStep == 0 ? gotoQualityTest() : gotoStocking()">{{
          operateStep == 0 ? "下一步：质检比例" : "上一步：备货商品"
        }}</Button>
      <Button @click="cancelAction" class="ml10">取消</Button>
      <Button type="primary" class="ml10" @click="submitAction('planData')"
        v-if="isEdit && getPermission('stockUpPlan_submit') && (operateStep == 1 || planData.readyType === 5)">提交
      </Button>
      <Button type="primary" class="ml10" @click="submitAction('planData', 'draft')"
        v-if="isEdit && getPermission('stockUpPlan_submit') && (operateStep == 1 || planData.readyType === 5)">保存
      </Button>
      <template v-if="plansType == '4'">
        <Button type="primary" class="ml10" v-if="getPermission('stockUpPlan_audit')" @click="verify('planData', 3)"
          :loading="verifyLoading_3">审核通过
        </Button>
        <Button type="primary" class="ml10" v-if="getPermission('stockUpPlan_audit')" @click="verify('planData', 1)"
          :loading="verifyLoading_1">审核驳回
        </Button>
      </template>
      <template v-if="plansType == '3' || plansType == '4'">
        <Button type="primary" class="ml10" @click="verify('planData', 4)" :loading="verifyLoading_4">取消备货</Button>
      </template>
    </div>
    <div class="submitTopBtnWrapper">
      <!-- <template>
        <Button
          type="primary"
          class="mr10"
          @click="submitAction('planData')"
          v-if="
            isEdit && getPermission('stockUpPlan_submit') && operateStep == 1
          "
          >提交
        </Button>
        <Button
          type="primary"
          class="mr10"
          @click="submitAction('planData', 'draft')"
          v-if="
            isEdit && getPermission('stockUpPlan_submit') && operateStep == 1
          "
          >保存
        </Button>
      </template> -->
      <!-- <template v-if="plansType == '4'">
        <Button
          type="primary"
          class="mr10"
          v-if="getPermission('stockUpPlan_audit')"
          @click="verify('planData', 3)"
          :loading="verifyLoading_3"
          >审核通过
        </Button>
        <Button
          type="primary"
          class="mr10"
          v-if="getPermission('stockUpPlan_audit')"
          @click="verify('planData', 1)"
          :loading="verifyLoading_1"
          >审核驳回
        </Button>
      </template>
      <template v-if="plansType == '3' || plansType == '4'">
        <Button
          type="primary"
          class="mr10"
          @click="verify('planData', 4)"
          :loading="verifyLoading_4"
          >取消备货</Button
        >
      </template> -->
      <!-- <Button type="default" @click="cancelAction">关闭</Button> -->
    </div>
    <div style="width: 300px; margin: 0 auto" v-if="plansType != 2 && planData.readyType !== 5">
      <Steps :current="operateStep">
        <Step title="备货商品"></Step>
        <Step title="质检比例"></Step>
      </Steps>
    </div>

    <Form ref="planData" :model="planData" :label-width="100" :rules="ruleValidate"
      v-if="plansType != 2 && !qualityTestView">
      <!--  v-if="!qualityTestView || plansType != 2" -->
      <div class="supplierTabsBar">
        <!-- <Row class="tit">
          <Col>
          <div style='font-size: 14px;border-bottom: 1px solid #eee'>
            <span>{{
                  plansType == '1' ? '新增' : plansType == '2' ? '查看' : plansType == '3' ? '编辑' : plansType == '4'
                                                                                                ? '审核'
                                                                                                : ''
                }}</span> <span v-if='houseType === "self"'>
              自营仓备货计划
            </span> <span v-if='houseType === "overSea"'>
              第三方仓备货计划
            </span> <span v-if='houseType === "fba"'>
              FBA备货计划
            </span> <span v-if="plansType !== '1'" class="ml20">{{ '备货计划编号' + planData.planSerialNumber }}</span>
          </div>
          </Col>
        </Row> -->

        <Row type="flex" justify="start">
          <FormItem label="备货计划编号">保存后创建</FormItem>
        </Row>
        <Row type="flex" justify="start">
          <Col :span="20">
          <FormItem label="备货类型" prop="readyType">
            <RadioGroup v-model="planData.readyType" @on-change="changeRadio">
              <Radio :label="1" :disabled="plansType == 2 || plansType == 4">普通备货</Radio>
              <Radio :label="0" :disabled="plansType == 2 || plansType == 4" class="ml10">急采</Radio>
              <Radio :label="2" :disabled="plansType == 2 || plansType == 4" class="ml10">海外仓备货</Radio>
              <!-- <Radio
                  :label="3"
                  :disabled="plansType == 2 || plansType == 4"
                  class="ml10"
                  >FBA备货</Radio
                > -->
              <Radio :label="4" :disabled="plansType == 2 || plansType == 4" class="ml10">全托管备货</Radio>
              <Radio :label="5" :disabled="plansType == 2 || plansType == 4" class="ml10">直发备货</Radio>
            </RadioGroup>
          </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col :span="5" v-if="planData.readyType == 4">
          <FormItem label="平台主体：" prop="platformSubject">
            <dyt-select v-model="planData.platformSubject" filterable :disabled="!isEdit || proList.length > 0">
              <Option v-for="(item, index) in platformEntityArr" :value="item.value" :key="index" :disabled="item.warehouseId == planData.backupWarehouseId ||
                item.warehouseStatus === '1'
                ">{{ item.label }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5" v-if="houseType == 'fba' || planData.readyType == 4">
          <FormItem label="备货店铺：" prop="saleAccountId">
            <dyt-select v-model="planData.saleAccountId" :disabled="!isEdit || proList.length > 0 ? true : false"
              @on-open-change="saleAccountIdOpen">
              <Option v-for="(item, index) in selectedAccountsArr" :value="item.saleAccountId" :key="index">{{
                item.accountCode }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5">
          <template v-if="houseType !== 'fba' && planData.readyType !== 5">
            <FormItem label="备货仓库：" prop="backupWarehouseId">
              <dyt-select v-model="planData.backupWarehouseId" filterable :disabled="!isEdit"
                @valueChange="chooseWarehouse">
                <Option v-for="(item, index) in otherWarehouseArr" :value="item.warehouseId" :key="index"
                  :disabled="item.warehouseId == planData.purchaseWarehouseId || item.warehouseStatus === '1'"
                  :label="item.warehouseName"
                />
              </dyt-select>
            </FormItem>
          </template>
          <template v-else>
            <FormItem label="备货仓库：" prop="backupWarehouseId">
              <dyt-select v-model="planData.backupWarehouseId" filterable :disabled="!isEdit"
                @valueChange="chooseWarehouse">
                <Option v-for="(item, index) in directWarehouseArr" :value="item.warehouseId" :key="index"
                  :disabled="item.warehouseId == planData.purchaseWarehouseId || item.warehouseStatus === '1'"
                  :label="item.warehouseName"
                />
              </dyt-select>
            </FormItem>
          </template>
          </Col>
          <!--  || planData.readyType == 4 -->
          <Col :span="5" v-if="planData.readyType == 2">
          <FormItem label="中转仓库：" prop="purchaseWarehouseId">
            <dyt-select v-model="planData.purchaseWarehouseId" filterable :disabled="!isEdit">
              <Option v-for="(item, index) in transferWarehouseArr" :value="item.warehouseId" :key="index" :disabled="item.warehouseId == planData.backupWarehouseId ||
                item.warehouseStatus === '1'
                ">{{ item.warehouseName }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5">
          <FormItem label="所属事业部" prop="businessDeptId">
            <dyt-select v-model="planData.businessDeptId" filterable :disabled="!isEdit">
              <Option v-for="item in businessDeptInfoList" :value="item.id" :key="item.id" :disabled="item.warehouseId == planData.backupWarehouseId ||
                item.warehouseStatus === '1'
                ">{{ item.name }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col :span="5" v-if="planData.readyType == 4">
          <FormItem label="平台订单号" prop="platformOrderNo">
            <Input v-model="planData.platformOrderNo" maxlength="20">
            </Input>
          </FormItem>
          </Col>
          <Col :span="4">
          <FormItem label="创建人：" prop="createdName">
            <span>{{ planData.createdName }}</span>
          </FormItem>
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <FormItem label="备货备注" prop="remark">
            <Input v-model="planData.remark" type="textarea" :rows="3" style="width: 638px" :disabled="!isEdit"
              :maxlength="500"></Input>
          </FormItem>
        </Row>
        <Row type="flex" justify="start">
          <FormItem label="商品信息" prop="remark">
            <span>SKU总数量：{{ planData.planDetailsList.length }}，</span>
            <span>商品总数量：{{ totalQty }}，</span>
            <span>总金额： {{ totalPrice || 0 }}</span>
          </FormItem>
        </Row>
        <div v-if="isEdit">
          <Button type="primary" class="iconbuttons" @click="chooseSkuFn" :loading="addSkuLoading" :disabled="isDisabled">
            添加商品
          </Button>
          <!-- <Button type="primary" class="iconbuttons" @click="$refs.import.modal = true" style="margin-left: 12px" v-if="plansType !== '2' && getPermission('stockUpPlan_batchImportGoods')">
            Excel导入
          </Button> -->
          <Button type="primary" class="iconbuttons" @click="importExcel = true" style="margin-left: 12px" v-if="plansType !== '2' && getPermission('stockUpPlan_batchImportGoods')
            " :disabled="isDisabled">
            Excel导入
          </Button>
          <span class="ml20" style="color: #e4a73f;">提示:产品sku必须有第三方标签资料才允许添加</span>
        </div>
        <div class="normalTop">
          <Table highlight-row :border="true" :columns="planColumn" :data="proList" :height="tableHeight"></Table>
        </div>
        <!-- <div class="clear statistical">
          <div class="fl">
            <span class="mr10">货品种类数：</span>
            <span class="mr20">{{ planData.planDetailsList.length }}</span>
            <span class="mr10">货品总数量：</span>
            <span class="mr20">{{ totalQty }}</span>
          </div>
          <div class="fr" v-if="totalPrice !== null">
            <span class="mr10"> 总金额： </span>
            <span class="mr20">
              {{ totalPrice }}
            </span>
          </div>
        </div> -->
        <!-- <div class="table-page clear">
          <div class="table-page-right">
            <Page
              :total="planData.planDetailsList.length"
              @on-change="proChangePage"
              show-total
              :page-size="proPage.pageSize"
              show-elevator
              :current="proPage.pageNum"
              show-sizer
              @on-page-size-change="proChangePageSize"
              placement="top"
              :page-size-opts="pageArray"
            ></Page>
          </div>
        </div> -->
      </div>
    </Form>
    <stockingQualityTest v-if="qualityTestView" :planData="planData" :warehouseArr="warehouseArr"
      :transferWarehouseArr="transferWarehouseArr" :totalQty="totalQty" :totalPrice="totalPrice" :proList="proList">
    </stockingQualityTest>
    <seeStockingQualityTestVue v-if="plansType == 2" :planData="planData" :warehouseArr="warehouseArr"
      :transferWarehouseArr="transferWarehouseArr" :totalQty="totalQty" :totalPrice="totalPrice" :plansType="plansType"
      :proList="proList">
    </seeStockingQualityTestVue>
    <!--操作日志-->
    <Modal v-model="isShowOperationLog" :width="820" title="操作日志">
      <div class="supplierTabsBar">
        <Table ref="hisPriceTable" highlight-row border :loading="Tableloading" :columns="operationLogColumn"
          :data="operationLogData"></Table>
        <div class="table-page clear">
          <div class="table-page-right">
            <Page :total="operationLog.total" @on-change="logChangePage" show-total :page-size="operationLog.pageSize"
              show-elevator :current="operationLog.pageNum" show-sizer @on-page-size-change="logChangePageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="isShowOperationLog = false" size="large" style="width: 120px">关闭</Button>
      </div>
    </Modal>
    <!--添加商品-->
    <div v-if="isShowAddPro">
      <Modal v-model="isShowAddPro" :width="1100" title="添加商品" :styles="{ top: '50px' }" :mask-closable="false"
        class="addProductModal1 headerBar addProductBar">
        <addProduct :disabledSlt="false" :from="true" @addProductSuccess="addProductSuccess"
          @addProductCancel="addProductCancel" :type="plans.addType" :warehouseId="planData.backupWarehouseId"
          :eliminateData="proData"></addProduct>
      </Modal>
    </div>
    <!-- <importExcel
        ref="import"
      :action="importExcel.action"
      :title="importExcel.title"
      :downloadApi="importExcel.downloadApi"
    >

    </importExcel> -->
    <!-- Excel导入 -->
    <Modal v-model="importExcel" title="导入模板" @on-ok="importExcel = false" class-name="verticalCenterModal"
      @on-cancel="importExcel = false" :styles="{ top: '280px' }" width="400">
      <template v-if="uploadList.length == 0 ||
        (uploadList.length > 0 &&
          uploadList[uploadList.length - 1].status === 'finished')
        ">
        <div style="text-align: center; margin: 20px 0">
          <dytUpload ref="import" type="drag" :format="['XLS', 'XLSX']" :action="action" name="file"
            :data="planData.saleAccountId ? { saleAccountId: planData.saleAccountId } : {}" :headers="headObj"
            :on-success="okUpload" :on-error="uploadError" :show-upload-list="false" :onFormatError="formatError">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="60"></Icon>
              <p>导入</p>
            </div>
          </dytUpload>
        </div>
        <div style="text-align: center">
          <a href="javascript:void(0)" @click="downloadEcxel()">下载Excel文件模板</a>
        </div>
      </template>
      <template v-else>
        <div style="margin: 20px 0">
          <Progress v-if="uploadList[uploadList.length - 1].showProgress"
            :percent="uploadList[uploadList.length - 1].percentage" hide-info></Progress>
        </div>
      </template>
      <div slot="footer"></div>
    </Modal>

    <!-- 校验备货数量 -->
    <validStockNum :dialogVisible.sync="stockNumInfo.visible" :list="planDetailsList" @validSuccess="validSuccess" />
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "@/components/common/addProduct";
import stockingQualityTest from "./stockingQualityTest.vue";
import seeStockingQualityTestVue from "./seeStockingQualityTest.vue";
// import importExcel from '@/components/common/importExcel';
import validStockNum from "../stockingPlan/validStockNum";

export default {
  props: ["plans", "plansType", "isEdit", "houseType"],
  components: {
    addProduct,
    // importExcel
    stockingQualityTest,
    seeStockingQualityTestVue,
    validStockNum,
  },
  mixins: [Mixin],
  data() {
    var self = this;
    return {
      stockNumInfo: {
        visible: false,
        submitAction: {
          name: null,
          type: null,
        }
      },
      importExcel: false,
      action: api.planBatchImport,
      uploadList: [],
      submitLoading: false,
      verifyLoading_3: false,
      verifyLoading_1: false,
      verifyLoading_4: false,
      isShowOperationLog: false, // 操作日志
      addSkuLoading: false,
      isShowAddPro: false, // 添加商品
      proData: [],
      tableHeight: self.getTableHeight(520),
      planData: {},
      warehouseArr: [],
      directWarehouseArr: [],
      otherWarehouseArr: [],
      transferWarehouseArr: [],
      platformEntityArr: [
        { label: 'Temu', value: 'Temu' },
        { label: 'shein', value: 'shein' },
        { label: 'tiktok', value: 'tiktok' }
      ],
      selectedAccountsArr: [],
      proList: [],
      planColumn: [
        {
          key: "goodsThumbUrl",
          title: "图片",
          align: "center",
          render: (h, params) => {
            return self.tableImg(h, params, "thumbUrl");
          },
        },
        { key: "skuNo", align: "center", title: "SKU", width: "200" },
        { key: "spu", align: "center", title: "SPU", width: "120" },
        {
          key: "skuNo",
          align: "center",
          title: "名称规格",
          width: "350",
          render: (h, params) => {
            let spec = "";
            if (params.row.productGoodsSpecifications) {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            }
            return [
              // params.row.skuNo && params.row.goodsName ? h("br") : "",
              params.row.goodsName
                ? h(
                  "span",
                  {
                    style: {
                      display: "inline-block",
                      borderTop: params.row.skuNo ? "1px solid #dddee1" : "",
                    },
                  },
                  params.row.goodsName
                )
                : "",
              h(
                "p",
                {
                  style: {
                    color: "green",
                  },
                },
                spec
              ),
            ];
          },
        },
        {
          key: "outerPackageRequirement",
          title: '生产要求',
          align: "center",
          render: (h, params) => {
            return h('div', {
              style: {
                whiteSpace: 'pre-wrap',
                wordPreak: 'break-all'
              }
            }, params.row.outerPackageRequirement)
          }
        },
        // {
        //   key: "skuNo",
        //   align: "center",
        //   title: "产品SKU/产品名称",
        //   render: (h, params) => {
        //     let spec = "";
        //     if (params.row.productGoodsSpecifications) {
        //       spec = params.row.productGoodsSpecifications
        //         .map((i) => i.name + ":" + i.value)
        //         .join(",");
        //     }
        //     return [
        //       h(
        //         "span",
        //         {
        //           style: {
        //             display: "inline-block",
        //           },
        //         },
        //         params.row.skuNo
        //       ),
        //       params.row.skuNo && params.row.goodsName ? h("br") : "",
        //       params.row.goodsName
        //         ? h(
        //             "span",
        //             {
        //               style: {
        //                 display: "inline-block",
        //                 borderTop: params.row.skuNo ? "1px solid #dddee1" : "",
        //               },
        //             },
        //             params.row.goodsName
        //           )
        //         : "",
        //       h(
        //         "p",
        //         {
        //           style: {
        //             color: "green",
        //           },
        //         },
        //         spec
        //       ),
        //     ];
        //   },
        // },
        {
          key: "priceDetailsList",
          align: "center",
          title: "供应商报价",
          render: (h, params) => {
            if (
              params.row.priceDetailsList &&
              params.row.priceDetailsList.length > 0
            ) {
              let content = [];
              if (
                params.row.priceDetailsList &&
                params.row.priceDetailsList.length > 0
              ) {
                params.row.priceDetailsList.forEach((n, i) => {
                  content.push(h("span", n + " " + params.row.currency));
                  if (params.row.priceDetailsList.length - i > 1) {
                    content.push(h("br"));
                  }
                });
              }
              return h("div", content);
            } else {
              return h(
                "span",
                {
                  style: {
                    color: "red",
                  },
                },
                "-"
              );
            }
          },
        },
        {
          key: "replenishQuantity",
          align: "center",
          title: "备货数量",
          render: (h, params) => {
            return [
              h(
                "span",
                {
                  style: {
                    display: "inline-block",
                    verticalAlign: "middle",
                    width: "65%",
                  },
                },
                [
                  h("InputNumber", {
                    props: {
                      value: self.proList[params.index].replenishQuantity,
                      min: 1,
                      max: 99999999,
                      disabled: !self.isEdit,
                    },
                    style: {
                      width: "100%",
                    },
                    on: {
                      "on-change": (val) => {
                        self.proList[params.index].replenishQuantity = val;
                        self.proList[params.index].unitPrice =
                          self.getUnitPrice(val, params.row.priceDetailsList);
                        self.plans.planDetailsList.forEach((n, i) => {
                          if (n.goodsId == params.row.goodsId) {
                            self.plans.planDetailsList[i].replenishQuantity =
                              val;
                            self.plans.planDetailsList[i].unitPrice =
                              self.proList[params.index].unitPrice;
                          }
                        });
                      },
                    },
                  }),
                ]
              ),
            ];
          },
        },
        {
          key: "purchaserName",
          align: "center",
          title: "采购员",
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h("span", params.row.purchaserName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "operation",
          align: "center",
          width: 100,
          title: "操作",
          render: (h, params) => {
            if (self.isEdit) {
              return h(
                "Button",
                {
                  props: {
                    type: "dashed",
                  },
                  on: {
                    click: () => {
                      self.proList.splice(params.index, 1);
                      self.planData.planDetailsList.forEach((n, i) => {
                        if (n.goodsId == params.row.goodsId) {
                          self.planData.planDetailsList.splice(i, 1);
                        }
                      });
                    },
                  },
                },
                "删除"
              );
            } else {
              return "";
            }
          },
        },
      ],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 500,
      },
      operationLog: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
        supplierId: "",
      },
      operationLogColumn: [
        {
          key: "operatorName",
          align: "center",
          title: "操作人",
        },
        {
          key: "content",
          align: "center",
          title: "操作内容",
          width: 400,
        },
        {
          key: "createdTime",
          align: "center",
          title: "操作日期",
          render: (h, params) => {
            return (
              "span",
              self.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
      ],
      operationLogData: [], // 操作日志数据
      skuParams: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
      },
      option: {
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "0%",
          right: "0%",
          bottom: "0%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
            "Sun",
            "Sun",
            "Sun",
          ],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "销量",
            type: "line",
            data: [120, 132, 101, 134, 90, 230, 210, 222, 230, 250],
          },
        ],
      },
      ruleValidate: {
        readyType: [
          { type: "number", required: true, message: " ", trigger: "blur" },
        ],
        transWarehouse: [
          {
            required: true,
            message: " ",
            trigger: "change",
          },
        ],
        backupWarehouseId: [
          {
            required: true,
            message: " ",
            trigger: "change",
          },
        ],
        businessDeptId: [
          {
            required: true,
            message: " ",
            trigger: "change",
            type: "number",
          },
        ],
        purchaseWarehouseId: [
          {
            required: true,
            message: " ",
            validator: self.validatePurchaseWarehouseId,
            trigger: "change",
          },
        ],
        platformSubject: [
          {
            required: true,
            message: " ",
            trigger: "change",
          },
        ],
        saleAccountId: [
          {
            required: true,
            message: " ",
            trigger: "change",
          },
        ],
      },
      qualityTestView: false, //质检比例页面
      operateStep: 0, //操作步骤
      businessDeptInfoList: [],
      skipVerification: false
    };
  },
  created() {
    let v = this;
    v.planData = v.deepCopy(v.plans);
    delete v.planData.accountsArr
    v.getBaseDatas();
    v.getProlist();
    // plans', 'plansType', 'isEdit', 'houseType
    if (v.plans.readyType || v.plans.readyType == 0) return (v.planData.readyType = v.plans.readyType);
    let temp = {
      self: 1,
      overSea: 2,
      fba: 3,
      directShipmentAndStocking: 4
    };
    v.$set(v.planData, "readyType", temp[v.houseType]);
  },
  watch: {
    'planData.platformSubject': {
      handler(newVal, oldVal) {
        if (this.plans.accountsArr) {
          this.selectedAccountsArr = this.plans.accountsArr.filter(item => {
            if (newVal === 'tiktok') {
              return item.platformId == 'Tiktok888'
            } else {
              return item.platformId == (newVal)
            }
          })
        }
      }
    },
    'planData.saleAccountId': {
      handler(newVal, oldVal) {
        this.selectedAccountsArr.forEach(item => {
          if (item.saleAccountId == newVal) {
            this.$set(this.planData, 'accountCode', item.accountCode)
          }
        })
      }
    },
    warehouseArr: {
      handler(newVal, oldVal) {
        this.directWarehouseArr = newVal.filter(item => item.warehouseType == '5')
        this.otherWarehouseArr = newVal.filter(item => item.warehouseType != '5')
      }
    }
  },
  mounted() {
    this.uploadList = this.$refs.import.fileList;
    this.getBusinessDeptInfo();
  },
  computed: {
    totalQty() {
      let v = this;
      let num = 0;
      v.planData.planDetailsList.forEach((n, i) => {
        num += Number(n.replenishQuantity);
      });
      return num;
    },
    totalPrice() {
      let v = this;
      let amount = 0;
      // let diffCurrency = false;
      let hasPrice = v.planData.planDetailsList.some(
        (item) => !item.priceDetailsList || item.priceDetailsList.length == 0
      ); // 是否有报价
      v.planData.planDetailsList.forEach((n, i) => {
        let unitPrice = v.getUnitPrice(n.replenishQuantity, n.priceDetailsList);
        amount += unitPrice * n.replenishQuantity;
        v.planData.planDetailsList.forEach((m, j) => {
          // 判断是否存在不同币种的商品
          if (i != j && n.currency !== m.currency) {
            // diffCurrency = true;
          }
        });
      });
      return hasPrice ? null : amount.toFixed(2);
    },
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    isDisabled() {
      let flag = false
      if (this.planData.readyType == '4') {
        flag = (this.planData.platformSubject && this.planData.saleAccountId) ? false : true
      }
      return flag
    },
    planDetailsList() {
      // // m 是否能被 n 除尽
      // function judgeDivisor(m, n) {
      //   if ([0, '0'].includes(n)) return true;
      //   let num = {};
      //   let i = 0;
      //   m = m % n;
      //   while (m != 0 && !(m in num)) {
      //     num[m] = i++;
      //     m = m * 10 % n;
      //   }
      //   return m == 0;
      // }
      // 需要备货的商品数量，需要大于等于产品报价的最小起订量且能被倍数备货值除尽
      let list = this.$common.copy(this.planData.planDetailsList || []);
      let unqualifiedList = list.filter(k => {
        const stockMultiple = k.stockMultiple || 0;
        const minOrderQuantity = k.minOrderQuantity || 0;
        const replenishQuantity = k.replenishQuantity || 0;
        let subNum = this.$common.sub(replenishQuantity, minOrderQuantity);
        let isDivisor = this.isDivisible(replenishQuantity, stockMultiple);
        let errorMessage = null;
        if (subNum < 0) errorMessage = '不满足最小起订量';
        if (!errorMessage && !isDivisor) errorMessage = '不满足倍数备货值';
        k.errorMessage = errorMessage;
        return subNum < 0 || !isDivisor;
      })
      return unqualifiedList;
    },
  },
  methods: {
    isDivisible(dividend, divisor) {
      if (divisor === 0) return true;
      return dividend % divisor === 0;
    },
    validatePurchaseWarehouseId(rule, value, callback) {
      let v = this;
      if (v.planData.backupWarehouseType.toString() === "0") {
        callback();
      } else {
        if (value === "" || value === null) {
          callback(new Error("中转仓不能为空"));
        } else {
          callback();
        }
      }
    },
    // 获取备货仓库和中转仓库
    getBaseDatas() {
      let v = this;
      v.warehouseArr = [];
      v.transferWarehouseArr = [];
      v.axios
        .post(api.warehouse, {
          merchantId: v.$store.state.userInfo.merchantId,
          pageNum: 1,
          pageSize: 500,
          warehouseStatus: "0",
        })
        .then((res) => {
          if (res.data.code == 0) {
            v.warehouseArr = res.data.datas;

            v.transferWarehouseArr = res.data.datas;
            // res.data.datas.forEach((n, i) => {
            //   if (v.planData.backupWarehouseType == "0") {
            //     // 自营
            //     if (n.warehouseType === "0") {
            //       v.warehouseArr.push(n);
            //       v.transferWarehouseArr.push(n);
            //     }
            //   } else if (v.planData.backupWarehouseType == "1") {
            //     // 海外第三方
            //     if (n.warehouseType === "0") {
            //       v.transferWarehouseArr.push(n);
            //     } else if (
            //       n.warehouseType === "1" &&
            //       n.warehouseOverseaType !== "AMAZON_FBA"
            //     ) {
            //       v.warehouseArr.push(n);
            //     }
            //   } else if (v.planData.backupWarehouseType == "2") {
            //     // Fba
            //     if (n.warehouseType === "0") {
            //       v.transferWarehouseArr.push(n);
            //     } else if (
            //       n.warehouseType === "1" &&
            //       n.warehouseOverseaType === "AMAZON_FBA"
            //     ) {
            //       v.warehouseArr.push(n);
            //     }
            //   }
            // });
            if (
              v.planData.backupWarehouseId &&
              !v.warehouseArr
                .map((i) => i.warehouseId)
                .includes(v.planData.backupWarehouseId)
            ) {
              v.planData.backupWarehouseId = "";
            }
          }
        });
    },
    // 获取分页数据
    getProlist() {
      let v = this;
      let start = (v.proPage.pageNum - 1) * v.proPage.pageSize; // 起始坐标
      let end =
        v.proPage.pageNum * v.proPage.pageSize <
          v.planData.planDetailsList.length
          ? v.proPage.pageNum * v.proPage.pageSize
          : v.planData.planDetailsList.length; // 结束坐标，如果结束坐标大于数组长度，改为数组的长度
      v.proList = v.planData.planDetailsList.slice(start, end);
      if (v.planData.readyType == 5) {
        // 如果为直发备货因为不需要生成质检单所以可以直接提交，因此需要添加字段
        this.classifySpu()
      }
    },
    //根据spu分类
    classifySpu() {
      let spuList = this.planData.planDetailsList.map((item) => {
        return item.spu;
      });
      spuList = new Set(spuList);
      let tempList = [];
      spuList.forEach((itema) => {
        let tempSkuList = [];
        this.planData.planDetailsList.forEach((itemb) => {
          if (itemb.spu == itema) {
            tempSkuList.push(itemb);
            // tempSkuList[0].rowspan = tempSkuList.length;
          }
        });
        tempSkuList.forEach((itemc, index) => {
          if (index == 0) {
            itemc.rowspan = tempSkuList.length;
            itemc.colspan = 1;
          } else {
            itemc.rowspan = 0;
            itemc.colspan = 0;
          }
        });
        tempList.push(...tempSkuList);
      });
      this.planData.planDetailsList = tempList;
    },
    operationLogFn() {
      let v = this;
      let obj = {
        pageNum: 1,
        businessId: v.planData.planId,
      };
      v.Tableloading = true;
      v.axios.post(api.planLogList, obj).then((res) => {
        v.Tableloading = false;
        if (res.data.code == 0) {
          v.operationLogData = res.data.datas.list;
          v.operationLog.total = res.data.datas.total;
        }
        v.isShowOperationLog = true;
      });
    },
    proChangePageSize(pageSize) {
      this.proPage.pageSize = pageSize;
      this.getProlist();
    },
    proChangePage(page) {
      this.proPage.pageNum = page;
      this.getProlist();
    },
    logChangePageSize(pageSize) {
      this.operationLog.pageSize = pageSize;
    },
    logChangePage(page) {
      this.operationLog.pageNum = page;
    },
    chooseSkuFn() {
      if (this.houseType === "fba" && !this.planData.backupWarehouseId) {
        this.$Message.warning("请选择备货店铺");
        return;
      }
      this.isShowAddPro = true;
    },
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addProductSuccess(data) {
      let v = this;
      let arr = [];
      data.forEach((n, i) => {
        let isExist = false;
        v.planData.planDetailsList.forEach((m, j) => {
          if (n.productGoodsId == m.goodsId) {
            // 如果该商品存在，数量+1
            v.planData.planDetailsList[j].replenishQuantity += 1;
            isExist = true;
          }
        });
        if (!isExist) {
          // 如果该商品不存在，新增一条数据
          arr.push({
            cnName: n.cnName,
            goodsId: n.productGoodsId,
            goodsUrl: n.goodsUrl,
            sku: n.sku,
            productGoodsSpecifications: n.productGoodsSpecifications,
          });
        }
      });
      if (arr.length > 0) {
        // var goodsInfoUrl = v.plans.addType ==='FBA' ? api.planFbaAddGoods :
        if (v.planData.readyType == '4') {
          v.axios.post(api.checkNewOverseaTag, {
            saleAccountId: v.planData.saleAccountId,
            productGoodsIdList: arr.map(item => item.goodsId)
          }).then(res => {
            if (res.data.datas) {
              v.axios.post(api.planQueryGoodsInfo, arr).then((res) => {
                if (res.data.datas && res.data.datas.length > 0) {
                  res.data.datas.forEach((i) => {
                    arr.forEach((j) => {
                      if (i.skuNo === j.sku) {
                        i.productGoodsSpecifications = j.productGoodsSpecifications;
                      }
                    });
                  });
                  res.data.datas.forEach((n, i) => {
                    n.unitPrice = v.getUnitPrice(1, n.priceDetailsList); // 默认备货数量为1
                    v.planData.planDetailsList.push(
                      Object.assign(n, { replenishQuantity: 1 })
                    );
                  });
                  v.getProlist();
                }
              });
            } else {
              v.$Message.error('添加商品失败，商品必须要有第三方标签资料')
            }
          })
        } else {
          v.axios.post(api.planQueryGoodsInfo, arr).then((res) => {
            if (res.data.datas && res.data.datas.length > 0) {
              res.data.datas.forEach((i) => {
                arr.forEach((j) => {
                  if (i.skuNo === j.sku) {
                    i.productGoodsSpecifications = j.productGoodsSpecifications;
                  }
                });
              });
              res.data.datas.forEach((n, i) => {
                n.unitPrice = v.getUnitPrice(1, n.priceDetailsList); // 默认备货数量为1
                v.planData.planDetailsList.push(
                  Object.assign(n, { replenishQuantity: 1 })
                );
              });
              v.getProlist();
            }
          });
        }
      }
      v.isShowAddPro = false;
    },
    cancelAction() {
      // 取消
      this.$emit("addPlanGoBack", this.$store.state.thisPage);
    },
    verify(name, type) {
      // 1:审核驳回，2：审核通过
      let v = this;
      if (type == 4) {
        // 取消备货不需要校验
        v.planData.status = type;
        v["verifyLoading_" + type] = true;
        v.axios.post(api.planAudit, v.planData).then((res) => {
          v["verifyLoading_" + type] = false;
          if (res.data.code == 0) {
            let str =
              type == 1 ? "审核驳回成功！" : type == 3 ? "审核通过！" : "";
            v.$Message.success(str);
            v.$emit("addPlanGoBack", this.$store.state.thisPage);
          }
        });
      } else {
        if (v.planData.planDetailsList.length == 0) {
          v.$Message.warning("请添加商品！");
          return;
        }
        if (v.planData.backupWarehouseId === v.planData.purchaseWarehouseId) {
          v.$Message.warning("备货仓不能与中转仓一致！！");
          return;
        }
        v.$refs[name].validate((valid) => {
          // 校验通过后执行
          if (valid) {
            v.planData.status = type;
            v["verifyLoading_" + type] = true;
            v.axios.post(api.planAudit, v.planData).then((res) => {
              v["verifyLoading_" + type] = false;
              if (res.data.code == 0) {
                let str =
                  type == 1 ? "审核驳回成功！" : type == 3 ? "审核通过！" : "";
                v.$Message.success(str);
                v.$emit("addPlanGoBack", this.$store.state.thisPage);
              }
            });
          }
        });
      }
    }, // 文件上传成功的回调
    okUpload(data, file, fileList) {
      let v = this;
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          if (v.planData.planDetailsList.length > 0) {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let isExist = false;
              v.planData.planDetailsList.forEach((m, j) => {
                if (n.goodsId == m.goodsId) {
                  // 如果该商品存在，数量累加
                  v.planData.planDetailsList[j].replenishQuantity +=
                    n.backupQuantity;
                  isExist = true;
                }
              });
              if (!isExist) {
                let i = n.backupQuantity > 0 ? n.backupQuantity : 1;
                n.unitPrice = v.getUnitPrice(1, n.priceDetailsList);
                v.planData.planDetailsList.push(
                  Object.assign(n, { replenishQuantity: i })
                );
                v.getProlist();
              }
            });
          } else {
            data.datas.supplierGoodsResultList.forEach((n, i) => {
              let j = n.backupQuantity > 0 ? n.backupQuantity : 1;
              n.unitPrice = v.getUnitPrice(1, n.priceDetailsList);
              v.planData.planDetailsList.push(
                Object.assign(n, { replenishQuantity: j })
              );
              v.getProlist();
            });
          }
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          this.importExcel = false;
        }
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      } else if (data.code === 999993) {
        this.$Message.error("添加商品失败,商品必须要有第三方标签资料");
      } else {
        this.$Message.error("导入失败，请参考模板填写");
      }
    }, // 上传失败回调
    uploadError() {
      this.$Message.error("导入失败");
      this.importExcel = false;
    }, // 上传格式错误
    formatError(file) {
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
      // this.importExcel = false
    }, // 下载导入的模板
    downloadEcxel() {
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/backPlanTemplate.xlsx";
      window.location.href = path;
    },
    checkSupplierHasQuote() {
      let v = this;
      return new Promise((resolve) => {
        v.axios
          .post(
            api.queryGoodsInfo,
            v.planData.planDetailsList.map((i) => {
              return {
                cnName: i.goodsName,
                goodsId: i.goodsId,
                purchaserId: i.purchaserId,
                purchaserName: i.purchaserName,
                quantity: i.replenishQuantity,
                sku: i.skuNo,
                supplierId: i.supplierId,
              };
            })
          )
          .then((response) => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
      });
    },
    submitApi(apiUrl) {
      let v = this;
      //修改商品质检类型和比例字端
      v.planData.planDetailsList.forEach((item) => {
        item.productCheckType = item.checkType;
        item.productCheckRate = item.checkRate;
      });
      // 如果为直发备货可以直接点击提交或者保存，直发备货是需要直接写死免检
      if (v.planData.readyType == 5) {
        v.planData.planDetailsList.forEach(item => {
          item.skuCheckRate = "0"
          item.planCheckNumber = "0"
          item.planCheckType = 0
          item.planCheckRate = 0
          item.spuCheckRate = "0"
          item.qualityClassification = ""
          item.productCheckType = 0
          item.productCheckRate = 0
        })
      }
      if (!this.$common.isEmpty(v.planData.planId)) {
        v.planData.planDetailsList.forEach(item => {
          item.planId = v.planData.planId
        })
      }

      v.$Spin.show();
      v.axios
        .post(apiUrl, v.planData)
        .then((res) => {
          v.$Spin.hide();
          if (res.data.code == 0) {
            v.$Message.success("操作成功！");
            v.$Spin.hide();
            v.$emit("addPlanGoBack", v.$store.state.thisPage);
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    submitAction(name, type) {
      let v = this;
      if (this.$common.isEmpty(v.planData.readyType)) return this.$Message.error('请选择备货类型')
      // 校验在直发备货的时候需要选择仓库以及事业部
      if (v.planData.readyType == 5) {
        if (this.$common.isEmpty(v.planData.backupWarehouseId) || this.$common.isEmpty(v.planData.businessDeptId)) {
          return this.$Message.error('需选择备货仓库与所属事业部')
        }
      }
      let wareIds = v.warehouseArr
        .filter((i) => {
          return i.warehouseStatus !== "1";
        })
        .map((i) => i.warehouseId);
      let transferWarehouseIds = v.transferWarehouseArr
        .filter((i) => {
          return i.warehouseStatus !== "1";
        })
        .map((i) => i.warehouseId);
      if (v.planData.planDetailsList.length == 0) {
        v.$Message.error("请添加商品！");
        return;
      }
      if (
        v.planData.backupWarehouseId &&
        !wareIds.includes(v.planData.backupWarehouseId)
      ) {
        v.$Message.error("备货仓未启用");
        return;
      }
      if (
        v.planData.purchaseWarehouseId &&
        !transferWarehouseIds.includes(v.planData.purchaseWarehouseId)
      ) {
        v.$Message.error("中转仓未启用");
        return;
      }
      if (v.planData.backupWarehouseId === v.planData.purchaseWarehouseId) {
        v.$Message.warning("备货仓不能与中转仓一致！！");
        return;
      }
      let planCheckTypeList = v.planData.planDetailsList.map(item => item.planCheckType)
      const result = planCheckTypeList.some(item => item === 1 || item === 2);
      if (result) {
        let qualityTemplateList = v.planData.planDetailsList.filter(item => item.planCheckType !== 0)
        const result1 = qualityTemplateList.some(item => item.qualityClassification === '' || item.qualityClassification === null);
        if (result1) {
          v.$Message.warning("保存失败，商品没有绑定质检模板");
          return;
        }
      }
      if (!this.validStockingNum(name, type)) return;

      v.$Spin.show();
      let apiUrl = type === "draft" ? api.planSave : api.planSubmit;
      if (type !== "draft") {
        v.checkSupplierHasQuote().then((data) => {
          let arr = data.filter((i) => {
            if (i.priceDetailsList === null) {
              return i;
            }
          });
          if (arr.length > 0) {
            v.$Spin.hide();
            this.$Modal.confirm({
              okText: "提交",
              cancelText: "保存",
              closable: true,
              onOk() {
                v.submitApi(api.planSubmit);
              },
              onCancel() {
                v.submitApi(api.planSave);
              },
              render: (h) => {
                return h("div", {}, [
                  ...arr.map((i) => {
                    return h("p", "商品" + i.goodsName + "没有供应商报价");
                  }),
                  h(
                    "p",
                    {
                      style: {
                        marginTop: "15px",
                      },
                    },
                    "确定提交备货计划？"
                  ),
                ]);
              },
            });
          } else {
            v.submitApi(api.planSubmit);
          }
        });
      } else {
        v.submitApi(apiUrl);
      }
    },
    // 需要备货的商品数量，需要大于等于产品报价的最小起订量且能被倍数备货值除尽
    validStockingNum(name, type) {
      if (!this.planDetailsList.length || this.skipVerification) return true;
      this.stockNumInfo.submitAction = { name, type };
      this.stockNumInfo.visible = true;
      return false;
    },
    // 备货商品数量校验成功
    validSuccess(data, flag) {
      data.forEach(dk => {
        this.planData.planDetailsList.forEach((pk, pi) => {
          if (dk.goodsId === pk.goodsId) {
            this.$set(this.planData.planDetailsList[pi], 'replenishQuantity', dk.replenishQuantity);
          }
        })
      })
      // 直接跳过校验
      if(flag == 'skip') {
        this.skipVerification = true
      } 
      const { name, type } = this.stockNumInfo.submitAction;
      this.submitAction(name, type);
    },
    gotoQualityTest() {
      this.$refs["planData"].validate((valid) => {
        if (valid) {
          if (this.planData.planDetailsList.length == 0) {
            return this.$Message.warning("请先添加商品");
          }
          this.qualityTestView = true;
          this.operateStep = 1;
        }
      });
    },
    gotoStocking() {
      this.qualityTestView = false;
      this.operateStep = 0;
    },
    chooseWarehouse(val) {
      if (this.$common.isEmpty(val)) {
        this.planData.backupWarehouseType = '';
        return;
      }
      const info = this.warehouseArr.find((item) => {
        return item.warehouseId == val;
      });
      this.planData.backupWarehouseType = this.$common.isEmpty(info) ? '' : info.warehouseType;
    },
    getBusinessDeptInfo() {
      this.axios.post("/sps-service/sps/common/businessDeptInfo").then((res) => {
        this.businessDeptInfoList = res.data.datas;
        let businessDeptIds = this.authUserInfo.securityUser.businessDeptIds.split(",");
        this.businessDeptInfoList = this.businessDeptInfoList.filter(
          (item) => {
            return (
              businessDeptIds.includes(item.id.toString()) && item.enable == 1
            );
          }
        );
      });
    },
    changeRadio() {
      this.planData.backupWarehouseId = "";
      this.planData.purchaseWarehouseId = "";
      this.planData.platformSubject = "";
      this.planData.saleAccountId = ""
      this.planData.platformOrderNo = ""
      this.planData.planDetailsList = [];
      this.planData.backupWarehouseType = '';
      this.getProlist()
    },
    saleAccountIdOpen(val) {
      if (!val) return;
      if (!this.planData.platformSubject) {
        this.$Message.warning("请先选择平台主体");
      }
    },
  },
};
</script>
