<template>
  <div class="packingWork">
    <div style="font-size: 14px; font-weight: bold; padding: 10px 10px 0">
      首页 / 出库管理 / 拣货复核 / 拣货单 {{ pickingGoodsNo }}
    </div>
    <!-- 当前拣货单 -->
    <div class="pickHeader clearfix">
      <div>
        <Row>
          <Col span="15">
          <div style="font-size: 16px; margin-left: 10px; height: 40px">
            当前拣货复核拣货单：<span style="font-weight: bold">{{ pickingGoodsNo }} {{ packageGoodsTypeName }}</span>
          </div>
          </Col>
          <Col span="9">
          <div class="fr" style="display: inline-block; float: right; margin-right: 10px">
            <div style="
                  font-size: 16px;
                  margin-left: 10px;
                  font-weight: bold; 
                  color: #fff;
                  height: 40px;
                  display: inline-block;
                ">
              当前操作员：{{ userId }}
            </div>
            <Button size="small" style="margin-left: 30px" @click="quitWork">退出当前作业</Button>
            <Button size="small" style="margin-left: 30px" @click="finishWork">结束作业</Button>
          </div>
          </Col>
        </Row>
      </div>
    </div>
    <div class="">
      <Row>
        <Col style="width: 100%">
        <!-- 输入sku开始分拣 -->
        <div class="skuInput">
          SKU/货品身份码
          <Input v-model.trim="skuInput" autofocus :element-id="'skuInputt'" ref="skuInput"
            style="width: 300px; margin-left: 15px" @on-enter="
              clearSku();
            skuStart();
            "></Input>
          <!-- v-if="packageGoodsType !== 'MM'" -->
          <Checkbox style="margin-left: 10px" v-model="isEachPiece">逐件扫描</Checkbox>
        </div>
        </Col>
      </Row>
      <Row>
        <Col class="packProcessCol">
        <div class="packProcess">
          <Steps :current="packageProcessStep">
            <Step title="扫描货品" icon="ios-person"></Step>
            <Step title="获取包裹信息" icon="ios-person"></Step>
            <Step title="校对货品数量" icon="ios-person"></Step>
            <Step title="发送至打印机" icon="ios-person"></Step>
            <Step title="标记已打印" icon="ios-person"></Step>
          </Steps>
        </div>
        </Col>
      </Row>
      <Row justify="center" align="middle" type="flex" class="bar">
        <Col :span="4">
        <Row>
          <Col :span="8">自动匹配包裹：</Col>
          <Col :span="14">{{ packageCode }}</Col>
        </Row>
        </Col>
        <Col :span="4" offset="1">
        <Row justify="center" align="middle" type="flex" v-if="pickingGoodsWeighting && reviewPackaging">
          <Col :span="4">称重：</Col>
          <Col :span="19">
          <Input ref="weightInput" v-model.trim="packageWeight.weight" style="width: 60px; margin-left: 5px"
            @on-enter="weighting" :disabled="weightStatus"></Input>
          <Select v-model="packageWeight.weightUnit" style="width: 60px; margin-left: 5px" :disabled="weightStatus">
            <Option v-for="item in weightUnitList" :key="item.value" :value="item.value">{{ item.name }}</Option>
          </Select>
          </Col>
        </Row>
        </Col>
        <Col :span="10" offset="1">
        <Row justify="center" align="middle" type="flex" v-if="reviewPackaging">
          <Col :span="3">选择包材：</Col>
          <Col :span="21" style="overflow: hidden; white-space: nowrap">
          <Select v-model="wrappings.value" label-in-value @on-change="wrappingsChange"
            style="width: 100px; margin-left: 5px" transfer>
            <Option v-for="item in wrappingsList" :key="item.value" :value="item.packageMaterialId">{{
              item.packageMaterialName }}</Option>
          </Select>
          <span style="margin-left: 15px" v-if="wrappings.value">包材尺寸(cm):{{ showSize }}</span>
          <span style="margin-left: 15px" v-if="wrappings.value">包材重量(g):{{ showWeight }}</span>
          <span style="margin-left: 15px" v-if="wrappings.value">包材成本(￥):{{ showCost }}</span>
          <span style="margin-left: 15px" v-if="wrappings.value">备注:{{ showDesc }}</span>
          </Col>
        </Row>
        </Col>
      </Row>
      <div class="scanPackageShow">
        <Row justify="center" align="middle" type="flex">
          <Col span="16">
          <!-- 扫描货品信息 -->
          <div class="skuBox">
            <div class="orderTable normalTop">
              <Table border :loading="TableLoading" :height="tableHeight" :columns="currentPackageColumn"
                :data="currentPackageData"></Table>
            </div>
            <div>
              <a href="#" @click="clearScan()" class="cleanScanLink">清空已扫描货品并重新扫描</a>
            </div>
          </div>
          </Col>
          <!-- 货品信息 -->
          <Col span="8">
          <div v-show="showSku">
            <!-- 货品信息 -->
            <div class="productInfo">
              <Row justify="center" align="middle" type="flex">
                <Col>
                <div style="width: 377px; height: 205px">
                  <img :src="productImg
                    ? filenodeViewTargetUrl + productImg
                    : placeholderSrc
                    " style="width: 100%; height: 100%" />
                </div>
                </Col>
              </Row>
              <Row justify="center" align="middle" type="flex">
                <div style="font-size: 22px; margin-top: 16px">
                  SKU：<span style="color: #008000">{{ sku }}</span>
                </div>
              </Row>
              <Row justify="center" align="middle" type="flex">
                <div style="font-size: 22px; margin-top: 16px">
                  名称：<span style="color: #008000">{{ title }}</span>
                </div>
              </Row>
              <Row justify="center" align="middle" type="flex" v-if="isCombination">
                <div class="combinationTips">
                  该产品为映射SKU，所有SKU扫描完毕打印商品标签
                </div>
              </Row>
              <Card dis-hover style="margin: 14px 10px 0 10px">
                共{{ basketNum }}个拣货篮：
                <div style="margin-top: 10px; overflow: auto">
                  {{ basketList }}
                </div>
              </Card>
            </div>
          </div>
          </Col>
        </Row>
      </div>
      <Row class="bar">
        <Col>
        拣货单的出库单
        <Button style="margin-left: 20px" @click="printSelect">打印选中面单</Button>
        </Col>
      </Row>
      <div class="orderTable">
        <Table border :loading="TableLoading" :height="tableHeight" :columns="printedPackageColumn"
          :data="printedPackageData" @on-selection-change="changeData"></Table>
      </div>
    </div>
    <!-- sku输入异常 -->
    <Modal v-if="warnModalStatus" v-model="warnStatus" title="SKU异常" width="500">
      <!--一个隐藏的input，用于回车时，关闭弹窗-->
      <Input :element-id="'skuAbnormal'" ref="skuAbnormal" @on-enter="cancel" style="
          opacity: 0;
          position: absolute;
          top: 50px;
          left: 0px;
          z-index: -10;
        "></Input>
      <div style="padding: 10px 20px">
        <Row>
          <Col span="6">
          <div>
            <Icon type="md-information-circle" color="#2b85e4" style="font-size: 50px"></Icon>
          </div>
          </Col>
          <Col span="16" v-if="findWarnStatus" style="font-size: 16px">{{
            "您扫描或输入的SKU【 {warnSku} 】在当前拣货单中未找到".replace(
              "{warnSku}",
              warnSku
            )
          }}
          </Col>
          <Col span="16" v-if="warnPrintStatus" style="font-size: 16px">您需要先处理当前未打印的包裹</Col>
          <Col span="16" v-if="warnMatchStatus" style="font-size: 16px">
          <div>
            您提交的扫描的结果，在当前拣货单中未能找到包裹信息，可能原因：
          </div>
          <div style="margin-top: 3px">*当前包裹拣货货品存在错误</div>
          <div style="margin-bottom: 15px">
            *您扫描的过程中存在遗漏或者重复。
          </div>
          </Col>
          <Col span="16" v-if="errorCode === 116104" style="font-size: 16px">拣货单不存在或状态已改变,请刷新后重试</Col>
          <Col span="16" v-if="errorCode === 116101" style="font-size: 16px">拣货复核扫描的出库单不存在</Col>
          <Col span="16" v-if="errorCode === 116102" style="font-size: 16px">拣货复核扫描出库单已作废</Col>
          <Col span="16" v-if="errorCode === 116114" style="font-size: 16px">SKU未匹配合适出库单</Col>
          <Col span="16" v-if="errorCode === 116113" style="font-size: 16px">拣货复核已结束</Col>
          <Col span="16" v-if="errorCode === 116118" style="font-size: 16px">存在未完成包装的出库单</Col>
          <!-- 提示文本，放这里想着提示统一好看 -->
          <Col span="16" v-if="warnMessage" style="font-size: 16px">{{
            warnMessage
          }}</Col>
        </Row>
      </div>
      <div slot="footer">
        <Button style="margin-right: 210px" @click="cancel">我知道了</Button>
      </div>
    </Modal>
    <!-- 结束作业 -->
    <endWarnModal ref="endWarnModal" :pickingGoodsNo="pickingGoodsNo" :pickingGoodsId="pickingGoodsId"
      :currentPackageData="currentPackageData" :packageList="printedPackageData"></endWarnModal>
    <!-- 货品增值项操作 -->
    <addItemModal :modelVisible.sync="addItemInfo.visible" :data="addItemInfo" />
    <!-- 速卖通 JIT 订单提示 -->
    <JITModaVerify :modelVisible.sync="JITModaVisible" :modelData="JITVerifyData" @closeJITModal="closeJITModal" />
    <!-- 增值服务添加 -->
    <!-- <addValAddService :modelVisible.sync="valAddServiceInfo.visible" :list="completeList" @addSuccess="addSuccess" /> -->
  </div>
</template>

<script>
import api from "@/api/api";
import tableMixin from "@/components/mixin/table_mixin";
import Mixin from "@/components/mixin/common_mixin";
import barcode_mixin from "@/components/mixin/barcode_mixin";
import endWarnModal from "./endWarnModal";
import { getErpconfig } from "@/utils/user";
import PrintTongtu from "@/utils/printCommon";
import addItemModal from "@/views/components/addItemModal";
import JITModaVerify from "@/views/components/JITModaVerify";
// import addValAddService from "./addValAddService";

export default {
  mixins: [Mixin, tableMixin, barcode_mixin],
  components: {
    endWarnModal,
    addItemModal,
    JITModaVerify,
    // addValAddService,
  },
  data() {
    var self = this;
    return {
      reviewPackaging: true,
      errorCode: 0,
      scanSkuPackageId: "",
      filenodeViewTargetUrl: localStorage.getItem("imgUrlPrefix"),
      pickingGoodsNo: "",
      pickingGoodsId: "",
      JITModaVisible: false,
      JITVerifyData: [],
      packageGoodsTypeName: "",
      packageGoodsType: "",
      pickingGoodsWeighting: null, // 是否称重
      userId: "",
      brandName: '', // 品牌名称
      packageCode: "等待提交后获取包裹信息",
      labelPath: "", // 该包裹的打印pdf地址
      productImg: null, // 当前货品的图片
      title: "", // 当前货品名称
      variations: "", // 当前货品规格
      quantity: null, // 当前货品应发数量
      packageProcessStep: 0,
      pickData: [], // 拣货单数据
      sku: null, // 输入sku
      skuInput: null, // 输入的sku
      warnSku: null, // 异常sku
      warnStatus: false, // 控制是否显示异常警告
      findWarnStatus: false, // 查询sku警告
      warnPrintStatus: false, // 控制是否显示待打印警告
      warnMatchStatus: false, // 控制是否显示匹配异常错误
      warnModalStatus: false, // 是否生成模态框
      printedPackageData: [],
      scanSkuParams: {
        pickingGoodsId: null,
        packageId: null,
        skus: [],
      },
      printedPackageColumn: [
        {
          type: "selection",
          width: 60,
          fixed: "left",
          align: "center",
        },
        {
          title: "NO.",
          width: 80,
          align: "center",
          key: "index",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "包裹号",
          key: "packageCode",
          align: "center",
        },
        {
          title: "物流商/邮寄方式",
          key: "merchantShippingMethodId",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.carrierName),
              h("div", params.row.carrierShippingMethodName),
            ]);
          },
        },
        {
          title: "已打印",
          key: "isPrinted",
          align: "center",
          render: (h, params) => {
            if (params.row.isPrinted) {
              return h("Icon", {
                props: {
                  type: "md-checkmark-circle",
                  size: "20",
                },
                style: {
                  color: "#008000",
                },
              });
            }
          },
        },
        {
          title: "运单号",
          key: "trackingNumber",
          align: "center",
        },
        {
          title: "SKU及数量",
          key: "sku",
          align: "center",
          render: (h, params) => {
            let pos = [];
            if (params.row.skus) {
              params.row.skus.forEach((n, i) => {
                pos.push(h("div", n.sku + " * " + n.quantity));
              });
              return h("div", pos);
            }
          },
        },
        {
          title: "包材",
          key: "materialId",
          align: "center",
          render: (h, params) => {
            let pos = null;
            if (this.wrappingsList) {
              this.wrappingsList.forEach((n, i) => {
                if (n.packageMaterialId === params.row.materialId) {
                  pos = n.packageMaterialName;
                }
              });
              return h("div", pos);
            }
          },
        },
        {
          title: "重量",
          key: "totalWeight",
          align: "center",
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 200,
          render: (h, params) => {
            let list = [];
            // list.push(h(
            //   "Button",
            //   {
            //     props: {
            //       type: "primary",
            //       size: "small",
            //     },
            //     style: {
            //       marginRight: "5px",
            //     },
            //     on: {
            //       click: () => {
            //         // this.valAddServiceInfo.addItemList = powerList;
            //         this.valAddServiceInfo.packageCode = params.row.packageCode;
            //         this.valAddServiceInfo.visible = true;
            //       },
            //     },
            //   },
            //   "增值服务"
            // ))
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      // self.print('http://10.0.0.117:9090/s/dhlapi/20180813/000557PCL0000456937.pdf', 'PCL123456');
                      let falg = params.row.isPrinted === 1;
                      this.printStatus = true;
                      this.packageIds = [params.row.packageId];
                      this.printObj = params.row;
                      this.skuFocus();
                      this.JITVerifyData = [this.$common.copy(params.row)];
                      self.print(
                        params.row.labelPath,
                        params.row.packageCode,
                        "",
                        "",
                        !falg
                      );
                    },
                  },
                },
                params.row.isPrinted ? "重打面单" : "打印面单"
              ),
              ...list,
            ]);
          },
        },
      ],
      currentPackageData: [],
      currentPackageColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          key: "index",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "名称/规格",
          key: "title",
          align: "center",
          render: (h, params) => {
            if (params.row.variations) {
              return h("span", params.row.name + "/" + params.row.variations);
            } else {
              return h("span", params.row.name);
            }
          },
        },
        {
          title: "SKU",
          key: "sku",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#008000",
                },
              },
              params.row.sku
            );
          },
        },
        {
          title: "应发数量",
          key: "quantity",
          align: "center",
        },
        {
          title: "已扫描数量",
          key: "scanQuantity",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  value: params.row.scanQuantity,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  input: (value) => {
                    params.row.scanQuantity = value;
                    if (!params.row.scanQuantityInputFocus) {
                      self.currentPackageData[params.index].scanQuantity =
                        params.row.scanQuantity;
                    }
                  },
                  "on-focus": () => {
                    params.row.scanQuantityInputFocus = true;
                  },
                  "on-blur": () => {
                    params.row.scanQuantityInputFocus = false;
                    self.currentPackageData[params.index].scanQuantity =
                      params.row.scanQuantity;
                    self.handleAliExpressData();
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "校对",
          key: "check",
          align: "center",
          render: (h, params) => {
            return self.currentPackageData[params.index].check
              ? h(
                "span",
                {
                  attrs: {
                    class: "icon iconfont greenColor cursor",
                  },
                  style: {
                    margin: "0 10px",
                  },
                },
                ""
              )
              : "";
          },
        },
        // {
        //   title: "增值服务",
        //   key: "check",
        //   align: "center",
        //   render: (h, { row }) => {
        //     let list = [];
        //     let vacuumizeNumber = row.vacuumizeNumber || 0;
        //     let replacePackingNumber = row.replacePackingNumber || 0;
        //     if (vacuumizeNumber > 0) {
        //       list.push(h('Tag', {
        //         props: {
        //           color: "volcano",
        //         }
        //       }, '抽真空:' + vacuumizeNumber))
        //     }
        //     if (replacePackingNumber > 0) {
        //       list.push(h('Tag', {
        //         props: {
        //           color: "magenta",
        //         }
        //       }, '换包装:' + replacePackingNumber))
        //     }
        //     return h('div', [
        //       ...list,
        //     ])
        //   }
        // },
        {
          title: "删除",
          key: "operation",
          align: "center",
          render: (h, params) => {
            return h("span", {
              attrs: {
                class: "icon iconfont icon-shanchu cursor redColor",
              },
              style: {
                margin: "0 10px",
                cursor: "pointer",
                color: "red",
              },
              on: {
                click: () => {
                  // if (self.packageGoodsType !== "MM") {
                  // 单品
                  self.clearScan();
                  // } else {
                  //   self.currentPackageData.splice(params.index, 1);
                  // }
                },
              },
            });
          },
        },
      ],
      showSku: true,
      packageWeight: {
        // 重量
        weightUnit: 0,
        weight: null,
      },
      weightUnitList: [
        {
          name: "g",
          value: 0,
        },
        {
          name: "kg",
          value: 1,
        },
      ],
      weightStatus: true, // 未完成包装前不能称重
      wrappings: {
        name: null,
        value: null,
      }, // 包材
      wrappingsList: null, // 包材列表
      showSize: null, // 选择后展示的包材尺寸
      showWeight: null,
      showCost: null,
      showDesc: null,
      userName: null, // 获取操作员name
      userList: [],
      basketNum: 0, // 拣货篮
      basketList: null,
      isEachPiece: true,
      printList: [],
      packageIds: [],
      printStatus: false,
      printObj: null,
      isPrintComplete: false,
      isExistAudio: false,
      audio: "",
      // packingScanSkuData: {},
      addItemInfo: {
        visible: false, // 弹框
        setting: null, // 拣货复核时进行包装 Y N
        list: [],
        sku: "",
        totalList: {},
      },
      // allPackageList: {}, //原存储出库单列表被随意赋值，保险起见重新弄一份
      combinatList: {}, //用于普通和组合数量变更
      isCombination: false, //是否组合
      warnMessage: "", //提示文本
      valAddServiceInfo: {
        // addItemList: [],
        packageCode: null,
        visible: false,
      },
    };
  },
  methods: {
    clearScan() {
      // 清空已扫描货品并重新扫描
      let v = this;
      if (v.scanSkuParams.packageId) {
        // 已经识别了是哪个包裹
        v.axios
          .put(
            api.update_clearScan +
            "?pickingGoodsId=" +
            v.pickingGoodsId +
            "&packageId=" +
            v.scanSkuParams.packageId
          )
          .then((response) => {
            if (response.data.code === 0) {
              v.currentPackageData = [];
              v.resetPackageParam();
            }
          });
      } else {
        // 还没找到包裹信息
        v.currentPackageData = [];
      }
    },
    weighting() {
      // 称重
      let v = this;
      v.packageWeight.packageId = v.scanSkuPackageId;
      v.axios
        .put(api.update_weighting, JSON.stringify(v.packageWeight))
        .then((response) => {
          if (response.data.code === 0) {
            // 修改这个包裹已打印列表中的重量
            v.printedPackageData[v.printedPackageData.length - 1].weight =
              v.packageWeight.weight;
            // 称重完进行下一个包裹sku扫描
            v.resetPackageParam();
            v.getScanningPickingGoods();
          }
        });
    },
    clearSku() {
      // 如果识别到有条码编码，将对应的sku重新赋值this.sku（仓库只要sku，又要识别条码编码，鬼麻烦）
      let inputVal = this.skuInput;
      let realSku = null;
      for (let i = 0; i <= this.pickData.length - 1; i++) {
        let n = this.pickData[i];
        if (inputVal === n.sku || inputVal === n.upc) {
          realSku = null;
          break;
        }
        if (!realSku && n.barCode.includes(inputVal)) realSku = n.sku;
      }
      // console.log(realSku, inputVal);
      this.sku = realSku || inputVal;
      this.skuInput = "";
      document.getElementById("skuInputt").blur();
    },
    // 错误提示
    alertMessage(msg) {
      this.warnMessage = msg || "";
      this.warnStatus = true;
      this.warnModalStatus = true;
      this.skuFocus();
    },
    skuFocus() {
      document.getElementById("skuInputt").focus();
    },
    // 输入sku开始分拣
    skuStart() {
      let v = this;
      if (!v.sku) {
        v.alertMessage("请输入SKU或货品身份码!");
        return;
      }
      // 当前有待打印的，不允许sku
      if (v.packageProcessStep === 3) {
        v.warnPrintStatus = true;
        v.alertMessage();
        return;
      }
      let pickData = v.pickData || [];
      let printedPackageData = v.printedPackageData || [];

      let [skuLocal, isExtended, checkRow] = ["", false, {}];
      // 输入sku后，先判断是否有效
      let status = false;
      pickData.forEach((n, i) => {
        if (v.sku === n.sku || v.sku === n.upc) {
          status = true;
          skuLocal = n.sku;
          v.productImg = n.pictureUrl;
          v.title = n.title;
          v.variations = n.variations;
        }
      });
      printedPackageData.forEach((m, t) => {
        if (m.skus && !m.isPrinted) {
          m.skus.forEach((s, p) => {
            if (s.sku === v.sku || s.upc === v.sku) {
              v.quantity = s.quantity;
              isExtended = s.isExtended;
            }
          });
        }
        m.skus.forEach((s, p) => {
          if (s.sku === v.sku || s.upc === v.sku) {
            checkRow = Object.assign({}, m, s);
          }
        });
      });

      if (!status) {
        v.warnSku = v.sku;
        v.findWarnStatus = true;
        v.alertMessage();
        return;
      }

      // 经确认，拣货复核没有多品情况了,一个包裹只会有一种SKU
      if (v.packageGoodsType === "MM") {
        v.alertMessage("当前页面只支持单品拣货复核!");
        return;
      }

      let isEachPiece = v.isEachPiece; //勾选逐件扫描
      let currentPackageData = v.currentPackageData || [];
      if (currentPackageData.length) {
        let list = currentPackageData.filter(
          (n) => !(n.sku === v.sku || n.upc === v.sku)
        );
        if (list.length) {
          // 只能操作完一个包裹再操作下一个包裹
          v.alertMessage(v.sku + " 不存在该包裹内，请先处理完当前包裹!");
          return;
        }
        let valid = false; // 判断满足最后一个，则调用接口
        v.currentPackageData.forEach((n, i) => {
          if (n.sku === v.sku || n.upc === v.sku) {
            let scanQuantity = n.scanQuantity || 0;
            let quantity = n.quantity || 0;
            let num = isEachPiece ? scanQuantity + 1 : quantity;
            n.scanQuantity = num;
            n.check = num >= quantity;
            valid = n.check;
          }
        });
        if (valid) {
          v.scanSku();
          return;
        }
      } else {
        let scanQuantity = isEachPiece ? 1 : v.quantity || 0;
        v.currentPackageData.push({
          sku: skuLocal,
          quantity: v.quantity,
          scanQuantity: isEachPiece ? 1 : v.quantity,
          check: scanQuantity >= v.quantity, //默认值
          name: v.title,
          variations: v.variations,
          // vacuumizeNumber: checkRow.vacuumizeNumber || 0,
          // replacePackingNumber: checkRow.replacePackingNumber || 0,
        });
        // 新加的调用接口获取包裹信息
        v.scanSku();
        return;
      }
      this.skuFocus();
      this.handleAddItemOperation();
      this.handleSkuOpration();
    },
    scanSku() {
      // 调扫描sku匹配包裹的接口
      this.printStatus = false;
      this.scanSkuParams.pickingGoodsId = this.pickingGoodsId;
      let skus = this.currentPackageData.map((m, t) => {
        return {
          sku: m.sku,
          quantity: m.scanQuantity,
        };
      });
      this.scanSkuParams.skus = skus;
      this.scanSkuParams.materialId = this.wrappings.value;
      // 处理是否逐件扫描
      this.scanSkuParams.isEachPiece = this.isEachPiece ? 0 : 1;
      // 扫描sku,传参若成功匹配包裹,则返回包裹数据,反之返回null
      this.axios
        .post(api.get_scanSku, JSON.stringify(this.scanSkuParams))
        .then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas || {};
            // 单品非逐件扫描时，拿接口返回数量
            if (!this.isEachPiece && data.pickingGoodsSkus) {
              this.currentPackageData.forEach((n, i) => {
                data.pickingGoodsSkus.forEach((m, t) => {
                  if (n.sku === m.sku) {
                    n.scanQuantity = m.quantity;
                  }
                });
              });
            }
            if (!this.scanSkuParams.packageId) {
              this.scanSkuParams.packageId = data.packageId;
            }
            this.packageCode = data.packageCode;
            this.trackingNumber = data.trackingNumber;
            this.labelPath = data.labelPath;
            this.packageWeight.weight = data.totalWeight; // 打印后才称重的
            if (
              data.pickingGoodsSkus !== null &&
              data.pickingGoodsSkus.length > 0
            ) {
              this.currentPackageData.forEach((n, i) => {
                n.check = false; // 注意
                data.pickingGoodsSkus.forEach((p, i) => {
                  if (n.sku === p.sku) {
                    n.quantity = p.quantity;
                    n.check = n.scanQuantity === n.quantity;
                    n.name = p.name;
                    n.variations = p.variations;
                  }
                });
              });
            }
            if (data.isMatch) {
              // 匹配完成了，调打印，打印成功调更新包装完成接口,并将包裹信息放置已打印的包裹列表中
              const printInfo = this.printedPackageData.find((item) => {
                return item.packageId === data.packageId;
              });
              this.matchFinish(printInfo);
            } else {
              this.skuFocus();
            }
            if (!data.isMatch && data.packageId === null) {
              // 匹配失败，提示
              this.warnMatchStatus = true;
              this.alertMessage();
            } else {
              // 增值项处理
              this.handleAddItemOperation();
              this.handleSkuOpration();
            }
          } else {
            this.alertMessage();
            let code = response.data.code;
            // 116104:拣货单信息不存在;116101:拣货复核扫描的出库单不存在;
            // 116102:拣货复核扫描出库单已作废;116114:SKU未匹配合适出库单;
            // 116113:拣货复核已结束;116118:存在未完成包装的出库单;
            let codeArr = [116104, 116101, 116102, 116114, 116113, 116118];
            codeArr.includes(code) && (this.errorCode = code);
          }
        });
    },
    handleSkuOpration() {
      this.isCombination = false;
      let data = this.combinatList[this.packageCode] || {};
      // 非速卖通不处理
      if (!["JIT"].includes(data.source)) return;
      const sku = this.sku;
      let productScanMap = data.productScanMap;
      // 旧数据存在为空的情况，则不去处理
      if (this.$common.isEmpty(productScanMap)) return;
      // productScanMap 是下单时的数据，不会由后面sku变更影响，以普通至组合排序，最多有两条
      let list = productScanMap[sku] || [];
      if (!list.length) {
        this.alertMessage("该sku为变更sku，获取面单异常!");
        return;
      }
      let item = null;
      list.forEach((k) => {
        if (!item && sku === k.sku && k.quantity > 0) {
          item = k;
          k.quantity--;
        }
      });
      if (!item) {
        this.alertMessage("该sku获取标签异常!");
        return;
      }
      // skuType:0普通 1组合
      if (item.skuType == 1) {
        this.isCombination = true;
        this.playAudio();
      } else {
        if (!item.labelPath) {
          this.$Message.error("sku标签路径为空!");
          return;
        }
        PrintTongtu.pdfPrint({ pdf: item.labelPath });
      }
    },
    // 调打印
    matchFinish(printObj) {
      this.packageProcessStep = 3;
      this.JITVerifyData = [this.$common.copy(printObj)];
      this.print(this.labelPath, this.packageCode, true);
    },
    resetPackageParam() {
      let v = this;
      v.scanSkuParams.packageId = null;
      v.packageProcessStep = 0;
      v.weightStatus = true;
      v.packageCode = "等待提交后获取包裹信息";
      v.handleAliExpressData();
    },
    // 获取拣货单列表
    getPickingList() {
      let v = this;
      if (!v.pickingGoodsId) return;
      v.axios
        .get(api.get_pickListOfGoods + v.pickingGoodsId, {
          params: { warehouseId: this.pickingGoodsNo },
        })
        .then((response) => {
          if (response.data.code !== 0) return;
          let data = response.data.datas || {};
          let skuList = (data.sortingPackageGoodsResult || []).map((k) => k.sku);
          v.getBarcodeBeSku(skuList).then((barCodeList) => {
            v.pickData = (data.sortingPackageGoodsResult || []).map((n, i) => {
              let barCode =
                barCodeList[n.sku] && barCodeList[n.sku].scanCodeList;
              return {
                pictureUrl: n.pictureUrl,
                productGoodsId: n.productGoodsId,
                quantity: n.quantity,
                sku: n.sku,
                upc: n.upc,
                title: n.title,
                variations: n.variations,
                haveNum: 0, // 拣货单已分拣货品数量
                barCode: barCode || [],
              };
            });
          });
        });
    },
    getScanningPickingGoods() {
      // 获取拣货复核页面基本信息
      let v = this;
      return v.axios.get(api.get_getScanningPickingGoods).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          //打印完会更新列表导致增值服务数据刷新，因此留一份旧的重新赋值回去
          // let oldPrintedPackageData = v.$common.arrayToObj(v.printedPackageData, 'packageCode');
          let pos = [];
          let merchantShippingMethodIdPos = [];
          if (data.packages !== null && data.packages.length > 0) {
            data.packages.forEach((n, i) => {
              // let oldPackage = oldPrintedPackageData[n.packageCode] || {};
              // n.skus.forEach(skuItem => {
              //   let oldSkuList = v.$common.arrayToObj(oldPackage.skus || [], 'sku');
              //   let oldSku = oldSkuList[skuItem.sku] || {};
              //   skuItem.vacuumizeNumber = oldSku.vacuumizeNumber || 0;
              //   skuItem.replacePackingNumber = oldSku.replacePackingNumber || 0;
              // })
              pos.push({
                ...n,
                carrierShippingMethodName: null,
                carrierName: null,
              });
              merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
            });
            if (merchantShippingMethodIdPos.length > 0) {
              Promise.resolve(
                v.axios
                  .post(
                    api.queryCarrierShippingName,
                    JSON.stringify(merchantShippingMethodIdPos)
                  )
                  .then((response1) => {
                    if (response1.data.code === 0) {
                      if (response1.data.datas.length > 0) {
                        response1.data.datas.forEach((n, i) => {
                          pos.forEach((m, t) => {
                            if (
                              m.merchantShippingMethodId === n.shippingMethodId
                            ) {
                              m.carrierName = n.carrierName;
                              m.carrierShippingMethodName =
                                n.carrierShippingMethodName;
                            }
                          });
                        });
                      }
                    }
                  })
              ).then(() => {
                v.printedPackageData = pos; // 需求改动，这个列表直接展示
                v.handleAliExpressData();
                v.defaultBrandName();
              });
            }
          }
          // 拣货篮
          if (data.pickingGoodsBaskets) {
            v.basketNum = data.pickingGoodsBaskets.length;
            v.basketList = data.pickingGoodsBaskets.toString();
          }
          v.pickingGoodsNo = data.pickingGoodsNo;
          v.pickingGoodsId = data.pickingGoodsId;
          const pickTypeObj = {
            SS: "单品",
            SM: "单品",
            MM: "多品",
          };
          v.packageGoodsTypeName = pickTypeObj[data.packageGoodsType];
          v.packageGoodsType = data.packageGoodsType;
          v.pickingGoodsWeighting = data.pickingGoodsWeighting;
          Promise.resolve(v.getUserInfoMap([data.userId])).then((result) => {
            v.userId = v.userList[data.userId].userName;
          });
          // v.userId = v.userName;
          let unprintedPackage = data.unprintedPackage;
          if (unprintedPackage !== null) {
            v.currentPackageData = (unprintedPackage.pickingGoodsSkus || []).map((n, i) => {
              return {
                ...n,
                scanQuantity: n.quantity,
                check: true,
                // vacuumizeNumber: 0,
                // replacePackingNumber: 0,
              }
            });
            v.scanSkuParams.packageId = unprintedPackage.packageId;
            v.packageCode = unprintedPackage.packageCode;
            v.packageProcessStep = 3;
          }
          v.getPickingList();
        }
      });
    },
    // 处理速卖通的普通和组合商品
    handleAliExpressData() {
      let pos = this.$common.copy(this.printedPackageData || []);
      // 存在已扫描的情况，所以需要处理已匹配的数据，不然数量对不上
      let cos = this.currentPackageData || [];
      let temp = {};
      pos.forEach((k) => {
        // 存在当前操作包裹的时候，就要记录productScanMap里原数量且根据已扫描数量随之变动
        if (this.packageCode === k.packageCode) {
          let productScanMap = k.productScanMap || {};
          cos.forEach((c) => {
            let num = c.scanQuantity || 0;
            let list = productScanMap[c.sku] || [];
            list.forEach((l) => {
              if (!("deQuantity" in l)) {
                l.deQuantity = l.quantity || 0;
              }
              let lnum = l.deQuantity;
              let subNum = lnum - num;
              l.quantity = subNum < 0 ? 0 : subNum;
              // 剩余的数量
              let reNum = num - lnum;
              num = reNum <= 0 ? 0 : reNum;
            });
          });
        }
        temp[k.packageCode] = k;
      });
      this.combinatList = this.$common.copy(temp);
    },
    // 默认显示品牌
    defaultBrandName() {
      let ditem = this.currentPackageData && this.currentPackageData[0];
      if (!ditem) return;
      this.printedPackageData.forEach((k) => {
        if (!Array.isArray(k.skus)) return;
        k.skus.forEach((sk) => {
          ditem.sku === sk.sku && (this.brandName = k.brandName);
        });
      });
    },
    // 获取分拣架设置列表
    getPackageSetting() {
      return new Promise((resolve, reject) => {
        let v = this;
        let obj = {
          typeList: ["packing"],
        };
        v.axios
          .post(api.get_packageSetting, obj)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data.length > 0) {
                data.map((item) => {
                  if (item.paramKey === "enablePickingReviewForPackaging") {
                    v.reviewPackaging = item.paramValue === "Y";
                    // 包装作业流程开启，则在“拣货复核”环节，不需要进行“货品增项操作”的识别
                    v.addItemInfo.setting = item.paramValue;
                  }
                });
              }
              resolve(true);
            } else {
              reject(new Error(false));
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    cancel() {
      // 取消弹框
      let v = this;
      v.warnStatus = false;
      v.findWarnStatus = false;
      v.warnPrintStatus = false;
      v.warnMatchStatus = false;
      v.errorCode = 0;
      v.skuFocus();
    },
    wrappingsChange(valueLabel) {
      // 选择包材
      let v = this;
      v.wrappings.name = valueLabel.label;
      v.wrappings.value = valueLabel.value;
      if (valueLabel.value) {
        v.wrappingsList.forEach((n, i) => {
          if (n.packageMaterialId === valueLabel.value) {
            v.showSize =
              n.packageMaterialLength +
              "x" +
              n.packageMaterialWidth +
              "x" +
              n.packageMaterialHeight;
            v.showWeight = n.packageMaterialWeight;
            v.showCost = n.packageMaterialCost;
            v.showDesc = n.packageMaterialDescription;
          }
        });
      }
    },
    print(path, postId, flag, orderBy, callback) {
      if (!path) {
        this.TableLoading = false;
        return this.$Message.error("未获取到面单地址！");
      }
      if (this.isPrintComplete) {
        return this.$Message.warning({
          content: "正在打印中，请耐心等待打印完成后再做此操作！",
          top: 150,
          duration: 3,
        });
      }
      if (!this.JITModaVisible) {
        this.JITVerifyData = this.JITVerifyData.filter((item) => {
          return item.source === "JIT";
        });
        if (this.JITVerifyData.length > 0) {
          // 获取子级映射 SKU
          let productSku = this.JITVerifyData.map((item) => {
            if (
              this.$common.isEmpty(item.jitOrderMapperProductDTO) ||
              this.$common.isEmpty(
                item.jitOrderMapperProductDTO.jITProductInfoDTOList
              )
            )
              return [];
            return item.jitOrderMapperProductDTO.jITProductInfoDTOList.map(
              (nxt) => {
                if (this.$common.isEmpty(nxt.productGoodsInfoDTOList))
                  return [];
                return nxt.productGoodsInfoDTOList.map((row) => {
                  return row.productSku;
                });
              }
            );
          });
          productSku = this.$common.flat(productSku);
          if (!this.$common.isEmpty(productSku)) {
            this.$nextTick(() => {
              this.JITModaVisible = true;
            });
          }
        }
      }
      this.printHtmlUrl(path, postId).then((res) => {
        // 菜鸟打印完成
        if (res.printType === "cainiao") return this.finishPrint(callback);
        // 标记已打印
        flag && this.finishPrint(callback);
        this.TableLoading = true;
        this.isPrintComplete = true;
        PrintTongtu.pdfPrint(res, "userQs").finally(() => {
          this.skuInput = "";
          this.TableLoading = false;
          this.isPrintComplete = false;
          this.skuFocus();
        });
      });
    },
    // jit 弹窗关闭
    closeJITModal() {
      this.$nextTick(() => {
        this.skuFocus();
      });
    },
    finishPrint(callback) {
      let v = this;
      let params = null;
      if (v.printStatus) {
        params = {
          packageIds: v.packageIds,
          pickingGoodsId: v.pickingGoodsId,
        };
        // 判断需要不需要加重量和包材
        if (v.pickingGoodsWeighting && v.printObj.totalWeight === null) {
          if (v.printObj.materialId === null) {
            params = {
              packageIds: v.packageIds,
              pickingGoodsId: v.pickingGoodsId,
              weight: v.packageWeight.weight,
              weightUnit: v.packageWeight.weightUnit,
              materialId: v.wrappings.value,
            };
          } else {
            params = {
              packageIds: v.packageIds,
              pickingGoodsId: v.pickingGoodsId,
              weight: v.packageWeight.weight,
              weightUnit: v.packageWeight.weightUnit,
            };
          }
        } else {
          if (v.printObj.materialId === null) {
            params = {
              packageIds: v.packageIds,
              pickingGoodsId: v.pickingGoodsId,
              materialId: v.wrappings.value,
            };
          }
        }
      } else {
        params = {
          packageIds: [v.scanSkuParams.packageId],
          pickingGoodsId: v.pickingGoodsId,
          materialId: v.wrappings.value,
        };
      }
      v.axios.put(api.update_packageFinishPrint, params).then((response) => {
        v.skuFocus();
        callback && callback();
        if (response.data.code === 0) {
          v.scanSkuPackageId = v.scanSkuParams.packageId;
          v.scanSkuParams.packageId = "";
          v.$Message.success("标记成功");
          // 这里不再需要移动数据到已打印，改为进入页面就会展示所有拣货单的出库单数据，所以这里只需改变列表的打印状态
          v.currentPackageData.forEach((n, i) => {
            v.printedPackageData.forEach((m, t) => {
              if (n.sku === m.sku) {
                m.isPrinted = 1;
              }
            });
          });
          v.packageProcessStep = 4;
          // 如果是不称重，则重置基本数据，开始下一个包裹扫描
          if (!v.pickingGoodsWeighting) {
            v.resetPackageParam();
          } else {
            v.weightStatus = false;
            v.$nextTick(function () {
              v.$refs.weightInput.focus();
            });
          }
          // 扫描的sku列表清空
          v.currentPackageData = [];
          // 刷新出库单列表数据
          v.getScanningPickingGoods();
        }
      });
    },
    finishWork() {
      // 结束作业
      let v = this;
      v.axios.put(api.prepar_finishPack + v.pickingGoodsId).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.$refs.endWarnModal.isFinishStatus = true;
          if (data.isFinish) {
            // 无异常
            v.$refs.endWarnModal.isFinish = true;
            v.$refs.endWarnModal.endStatus = true;
            v.$refs.endWarnModal.normalData();
          } else {
            // 有异常
            v.$refs.endWarnModal.isFinish = true;
            v.$refs.endWarnModal.endStatus = false;
            v.$refs.endWarnModal.abnormalData();
          }
        }
      });
    },
    quitWork() {
      // 退出当前作业
      let v = this;
      v.axios.put(api.quit_packingWork + v.pickingGoodsId).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.$refs.endWarnModal.isFinishStatus = true;
          if (data.isFinish) {
            // 是否可以走结束流程, true正常false异常
            v.$refs.endWarnModal.isFinish = true;
            v.$refs.endWarnModal.endStatus = true;
            v.$refs.endWarnModal.normalData();
          } else {
            if (data.isSingle) {
              // true一个人 false多人
              v.$refs.endWarnModal.isFinish = true;
              v.$refs.endWarnModal.endStatus = false;
              v.$refs.endWarnModal.abnormalData();
            } else {
              if (data.isQuit) {
                window.location.href = `//${window.location.host
                  }/wms-service/wms.html#/packWorking?warehouseId=${v.getWarehouseId()}`;
              }
            }
          }
        }
      });
    },
    getWrapper() {
      // 获取包材
      let v = this;
      return new Promise((resolve) => {
        v.axios.get(api.get_allWrapper).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data.length) {
              v.wrappingsList = data;
              v.wrappings.value = data[0].packageMaterialId;
              v.wrappings.name = data[0].packageMaterialName;
              let size =
                data[0].packageMaterialLength +
                "x" +
                data[0].packageMaterialWidth +
                "x" +
                data[0].packageMaterialHeight;
              v.showSize = size;
              v.showWeight = data[0].packageMaterialWeight;
              v.showCost = data[0].packageMaterialCost;
              v.showDesc = data[0].packageMaterialDescription;
            }
            resolve(true);
          }
        });
      });
    },
    getUserInfoMap(userIds) {
      // 获取分拣人名称
      let v = this;
      return new Promise((resolve) => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userList = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    changeData(val) {
      // 打印选中面单数据
      let v = this;
      v.printList = val;
    },
    printBatch(n, pos) {
      let v = this;
      if (n >= v.printList.length) {
        v.TableLoading = false;
        return pos;
      }
      let falg = true;
      if (v.printList[n].isPrinted) {
        falg = false;
      }
      v.packageIds = [v.printList[n].packageId];
      v.printObj = v.printList[n];
      v.print(
        v.printList[n].labelPath,
        v.printList[n].packageCode,
        falg,
        null,
        () => {
          v.printBatch(n + 1, pos);
        }
      );
    },
    printSelect() {
      // 打印选中面单
      let v = this;
      v.skuFocus();
      if (v.printList.length) {
        this.JITVerifyData = this.$common.copy(this.printList);
        v.TableLoading = true;
        v.printBatch(0, []);
        v.printStatus = true;
      } else {
        v.TableLoading = false;
        v.$Message.error("请选择数据"); // 请选择数据
      }
    },
    playAudio() {
      if (this.isExistAudio) {
        this.audio.load();
      } else {
        this.audio = new Audio();
        this.audio.src = require("../../../../../public/static/audios/huanbao.mp3");
      }
      this.audio.play();
      this.isExistAudio = true;
    },
    // 在分拣与包装的环节，出现品牌换包与超期换包时，播放声音提醒
    soundReminder(sku) {
      if (!sku) return;
      let [brandItem, defaultItem, extendedItem, defaultExtend, brandList] = [
        null,
        null,
        null,
        null,
        ["LAPA"],
      ];
      this.printedPackageData.forEach((pitem) => {
        if (!Array.isArray(pitem.skus)) return;
        pitem.skus.forEach((skuItem) => {
          if (sku !== skuItem.sku) return;
          // 品牌
          !brandItem && !pitem.isPrinted && (brandItem = pitem);
          // 超期
          !extendedItem && !pitem.isPrinted && (extendedItem = skuItem);
          // 这里防止已打印的包裹重新打印，默认取匹配到的第一个包裹
          !defaultItem && (defaultItem = pitem);
          !defaultExtend && (defaultExtend = skuItem);
        });
      });

      this.brandName = defaultItem && defaultItem.brandName;
      const brandPlay =
        brandItem &&
        brandItem.brandName &&
        brandList.includes(brandItem.brandName.toUpperCase());
      const defaultPlay =
        defaultItem &&
        defaultItem.brandName &&
        brandList.includes(defaultItem.brandName.toUpperCase());
      const extendPlay = extendedItem && extendedItem.isExtended;
      const deExtendPlay = defaultExtend && defaultExtend.isExtended;
      // 假如存在未打印完的包裹
      if (brandItem || extendedItem) {
        if (brandPlay || extendPlay) {
          this.playAudio();
        }
        return;
      }
      if (defaultPlay || deExtendPlay) {
        this.playAudio();
      }
    },
    // 获取增项操作
    getAddItemOperation() {
      let params = `?pickingGoodsId=${this.pickingGoodsId
        }&warehouseId=${this.getWarehouseId()}`;
      this.axios.post(api.pickingReminderSetting + params).then(({ data }) => {
        if (data.code !== 0) return;
        this.addItemInfo.totalList = data.datas || {};
      });
    },
    handleAddItemOperation() {
      let list = [];
      let addItemInfo = this.addItemInfo;
      const key = this.packageCode + "&" + this.sku;
      Object.keys(addItemInfo.totalList).forEach((k) => {
        if (key === k) list = addItemInfo.totalList[k];
      });
      if (!list.length) return;
      let realList = list.filter(fk => {
        // 这里产品设计奇葩，增值服务的提示不统一，比如抽真空需要展示在列表不在弹框
        return !['vacuumizeProduct'].includes(fk.resourceName);
      });
      this.addItemInfo.sku = this.sku;
      this.addItemInfo.list = realList;
      // this.handleAddItemNumber(list, this.sku);
      if (!realList.length) return;
      // 扫描数据完显后再弹出提示
      this.addItemInfo.visible = true;
      this.playAudio();
    },
    // // 对增值服务数量增加
    // handleAddItemNumber(addItemList, sku) {
    //   let isEachPiece = this.isEachPiece; //勾选逐件扫描
    //   let temp = this.$common.arrayToObj(addItemList, 'resourceName');
    //   this.currentPackageData.forEach((item, key) => {
    //     if (item.sku !== sku) return;
    //     if ('vacuumizeProduct' in temp) {
    //       let num = isEachPiece ? item.vacuumizeNumber + 1 : item.quantity;
    //       num = (num >= item.quantity) ? item.quantity : num;
    //       this.$set(this.currentPackageData[key], 'vacuumizeNumber', num);
    //     }
    //     if ('inventoryOverTime' in temp) {
    //       let num = isEachPiece ? item.replacePackingNumber + 1 : item.quantity;
    //       num = (num >= item.quantity) ? item.quantity : num;
    //       this.$set(this.currentPackageData[key], 'replacePackingNumber', num);
    //     }
    //   })
    //   this.printedPackageData.forEach((item, key) => {
    //     if (item.packageCode != this.packageCode) return;
    //     item.skus.forEach((skuItem, skuKey) => {
    //       if (skuItem.sku !== sku) return;
    //       if ('vacuumizeProduct' in temp) {
    //         let num = isEachPiece ? skuItem.vacuumizeNumber + 1 : skuItem.quantity;
    //         num = (num >= skuItem.quantity) ? skuItem.quantity : num;
    //         this.$set(this.printedPackageData[key].skus[skuKey], 'vacuumizeNumber', num);
    //       }
    //       if ('inventoryOverTime' in temp) {
    //         let num = isEachPiece ? skuItem.replacePackingNumber + 1 : skuItem.quantity;
    //         num = (num >= skuItem.quantity) ? skuItem.quantity : num;
    //         this.$set(this.printedPackageData[key].skus[skuKey], 'replacePackingNumber', num);
    //       }
    //     })
    //   })
    // },
    // // 增值服务修改成功返回的数据
    // addSuccess(list) {
    //   let listToObj = this.$common.arrayToObj(list, 'sku');
    //   let packageCode = this.valAddServiceInfo.packageCode;
    //   // let temp = this.$common.arrayToObj(this.valAddServiceInfo.addItemList, 'resourceName');
    //   this.printedPackageData.forEach((item, key) => {
    //     if (item.packageCode != packageCode) return;
    //     item.skus.forEach((skuItem, skuKey) => {
    //       let row = listToObj[skuItem.sku];
    //       if (!row) return;
    //       // if ('vacuumizeProduct' in temp) {
    //       this.$set(this.printedPackageData[key].skus[skuKey], 'vacuumizeNumber', row.vacuumizeNumber);
    //       // }
    //       // if ('inventoryOverTime' in temp) {
    //       this.$set(this.printedPackageData[key].skus[skuKey], 'replacePackingNumber', row.replacePackingNumber);
    //       // }
    //     })
    //   });
    //   this.$nextTick(() => {
    //     if (this.packageCode === packageCode && this.currentPackageData.length) {
    //       this.currentPackageData.forEach((item, key) => {
    //         let row = listToObj[item.sku];
    //         if (!row) return;
    //         // if ('vacuumizeProduct' in temp) {
    //         this.$set(this.currentPackageData[key], 'vacuumizeNumber', row.vacuumizeNumber);
    //         // }
    //         // if ('inventoryOverTime' in temp) {
    //         this.$set(this.currentPackageData[key], 'replacePackingNumber', row.replacePackingNumber);
    //         // }
    //       })
    //     }
    //   })
    // },
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(550);
    },
    // // 处理增值服务列表需要的数据(真是老母猪穿胸罩)
    // completeList() {
    //   let currentList = this.$common.arrayToObj(this.currentPackageData, 'sku');
    //   let list = [];
    //   this.printedPackageData.forEach((item) => {
    //     if (item.packageCode != this.valAddServiceInfo.packageCode) return;
    //     item.skus.forEach((skuItem) => {
    //       let currentItem = currentList[skuItem.sku] || {};
    //       let check = !!(skuItem.isPrinted == 1) || !!currentItem.check;
    //       let scanQuantity = check ? (item.quantity || 0) : (currentItem.scanQuantity || 0);
    //       list.push(
    //         {
    //           ...item,
    //           ...skuItem,
    //           check: check,
    //           scanQuantity: scanQuantity,
    //         }
    //       );
    //     })
    //   })
    //   return list;
    // },
  },
  created() {
    let v = this;
    getErpconfig("");
    Promise.resolve(v.getWrapper()).then(async () => {
      await v.getScanningPickingGoods();
      await v.getPackageSetting();
      this.$nextTick(() => {
        const value = v.addItemInfo.setting;
        if (value !== "N") v.getAddItemOperation();
      });
    });
  },
  watch: {
    // 监听sku异常的弹窗
    warnStatus: {
      handler(value) {
        let v = this;
        if (value) {
          v.$nextTick(() => {
            document.getElementById("skuAbnormal").focus();
          });
        } else {
          v.$nextTick(() => {
            v.skuFocus();
          });
        }
      },
      deep: true,
    },
    "addItemInfo.visible": {
      handler(value) {
        if (!value) this.skuFocus();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.pickHeader {
  width: 99%;
  height: 40px;
  margin: 10px auto;
  line-height: 40px;
  background-color: rgba(247, 150, 70, 1);
}

.skuInput {
  margin-left: 10px;
  margin-top: 5px;
  margin-right: 12px;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: rgba(43, 120, 228, 1);
}

.skuBox {
  height: 457px;
  margin-top: 10px;
  padding-top: 20px;
  margin-left: 10px;
  margin-bottom: 10px;
  background-color: #fff;
  border: 1px solid rgb(164, 197, 235);
}

.pickingGoods {
  width: 99%;
  margin: 10px auto;
}

.pickBox {
  width: 100px;
  height: 50px;
  margin-top: 10px;
  border: 1px solid #000;
}

.productBox {
  width: 300px;
  height: 170px;
  border: 1px solid #000;
  font-size: 24px;
  text-align: center;
  line-height: 170px;
  font-weight: bold;
}

.productInfo {
  background-color: rgb(252, 251, 225);
}

.scanPackageShow {
  border: 1px solid rgb(215, 215, 215);
  margin-left: 10px;
  margin-right: 12px;
  background-color: rgb(252, 251, 225);
}

.warnBox {
  width: 80%;
  height: 400px;
  border: 1px solid #717274;
  margin-left: 5%;
  background-color: #fff;
}

.warnBtn {
  width: 200px;
  height: 25px;
  line-height: 25px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
  margin-left: 40%;
  background-color: #aaa;
}

.packProcess {
  margin-top: 3px;
  width: 700px;
  height: 50px;
  margin: 10px auto;
}

.packProcessCol {
  width: 100%;
  border-style: solid;
  margin-left: 10px;
  margin-right: 12px;
  margin-top: 15px;
  border-width: 1px;
}

.bar {
  margin-left: 10px;
  margin-top: 15px;
  margin-right: 12px;
  padding-left: 10px;
  padding: 15px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  background-color: rgba(43, 120, 228, 1);
}

.cleanScanLink {
  padding-right: 12px;
  float: right;
}

.orderTable {
  padding: 0 12px;
}

.combinationTips {
  color: #d9001b;
  font-size: clamp(0.5rem, 0.4rem + 1.02vw, 1.3rem);
  font-weight: bold;
  margin-top: 12px;
}
</style>
<style>
.packProcess .ivu-steps .ivu-steps-title {
  display: block;
}

.packProcess .ivu-steps .ivu-steps-custom .ivu-steps-title {
  margin-left: -20px;
}

.packProcess .ivu-steps-item {
  overflow: initial;
}
</style>