<template>
  <div class="sortingInfo">
    <div style="font-size: 14px; font-weight: bold">
      首页 / 出库管理 / 多品分拣 / 分拣单 {{ showNo }}
    </div>
    <!-- 当前拣货单 -->
    <div class="pickHeader">
      <Row>
        <Col span="22" style="padding-right: 30px">
        <div style="font-size: 16px; margin-left: 10px; font-weight: bold">
          当前分拣作业拣货单：{{ showNo }} 多品
        </div>
        </Col>
        <Col span="2">
        <Button size="small" @click="pickFinish">结束本次分拣</Button>
        </Col>
      </Row>
    </div>
    <div class="">
      <Row>
        <Col span="15">
        <!-- 输入sku开始分拣 -->
        <div class="skuInput">
          SKU/货品身份码
          <Input ref="curSku" style="width: 300px; margin-left: 15px" autofocus @on-enter="
            clearSku();
          skuStart();
          "></Input>
        </div>
        <!-- 找篮子及展示货品信息 -->
        <div class="showProductGoods">
          <div v-show="showProductGoods && sku !== null">
            <Row>
              <Col span="15">
              <!-- 拣货框 -->
              <div style="margin-left: 60%;padding-top: 10px;padding-bottom: 20px;">
                <div :style="curBox.color" class="productBox">
                  <span style="font-size: 50px">{{ curBox.boxNo }}</span>
                </div>
              </div>
              </Col>
              <Col span="7">
              <!-- 全部分拣完成 -->
              <div v-if="isFinishStatus" style="
                      margin-left: 10%;
                      padding-top: 20px;
                      padding-bottom: 20px;
                      width: 300px;
                      height: 200px;
                    ">
                <div>
                  <Row style="margin-bottom: 20px">
                    <Col span="6">
                    <div>
                      <Icon type="md-information-circle" color="#169bd5" style="
                                font-size: 40px;
                                margin-left: 20px;
                                line-height: 20px;
                              "></Icon>
                    </div>
                    </Col>
                    <Col>
                    <h2 style="color: #ff0000">全部分拣完成</h2>
                    </Col>
                  </Row>
                  <span style="
                          font-size: 15px;
                          font-weight: bold;
                          color: #ff0000;
                        ">{{
                          "拣货单号：{pickingGoodsNo} 已经分拣完成，点击【结束本次分拣】结束本次作业".replace(
                            "{pickingGoodsNo}",
                            showNo
                          )
                        }}</span>
                </div>
              </div>
              </Col>
            </Row>
            <!-- 货品信息 -->
            <div class="productInfo">
              <Row>
                <Col span="10">
                <div style="width: 300px; height: 170px">
                  <img :src="productGoods.pictureUrl
                        ? filenodeViewTargetUrl + productGoods.pictureUrl
                        : placeholderSrc
                      " style="width: 100%; height: 100%" />
                </div>
                </Col>
                <Col span="10">
                <div style="font-size: 22px; margin-top: 12px">
                  SKU：<span style="color: #008000">{{
                    productGoods.sku
                  }}</span>
                </div>
                <div style="font-size: 22px; margin-top: 12px">
                  名称：<span style="color: #008000">{{
                    productGoods.title
                  }}</span>
                </div>
                <div class="combinationTips" v-if="isCombination">
                  该产品为映射SKU，所有SKU扫描完毕打印商品标签
                </div>
                </Col>
              </Row>
            </div>
          </div>
          <!-- 货品异常警告 -->
          <div class="warnBox" v-if="!showProductGoods && sku !== null && sku !== ''">
            <div style="
                  height: 25px;
                  background: #dee6ee;
                  padding: 5px;
                  border-bottom: 1px solid #c5d2e1;
                ">
              货品异常警告
            </div>
            <div style="
                  width: 94%;
                  height: 200px;
                  background: #faeed8;
                  border: 1px solid #dcddda;
                  margin-top: 30px;
                  margin-left: 3%;
                  padding: 15px;
                ">
              <h2>
                {{
                  "您扫描的货品{sku}，当前拣货单中的包裹均不需要或需求数量已经满足。".replace(
                    "{sku}",
                    sku
                  )
                }}
              </h2>
              <div style="margin-top: 10px; font-size: 14px">
                <div style="margin-bottom: 5px">可能的原因：</div>
                <span>1.您拣货的时候错误拣出该货品或该货品拣货过多。</span><br />
                <span>2.该货品条码粘贴错误。</span>
                <div style="margin-top: 5px">
                  请将该货品交由异常处理部门处理。
                </div>
              </div>
            </div>
            <div class="warnBtn">继续扫描其他货品（回车）</div>
          </div>
          <!-- 货品增值项操作 -->
          <!-- <div class="addItemOperation" v-if="showProductGoods && addItemInfo.visible">
            <div class="addItemOperation_content">
              <div class="addItemOperation_title">货品增项操作提醒</div>
              <productAdditionOperation :data="addItemInfo" />
              <div class="addItemOperation_footer">
                <Button type="primary" @click="closeAddItemVisible">继续扫描其它货品（回车）</Button>
              </div>
            </div>
          </div> -->
        </div>
        </Col>
        <!-- 拣货单及出库单 -->
        <Col span="9">
        <Tabs :value="tabName" type="card" style="margin: 15px 10px 0 10px" @on-click="changeTab">
          <TabPane name="pickTab" style="height: 485px; background-color: rgba(215, 215, 215, 1)" :label="pickTab">
            <h2 style="
                  margin-top: 20px;
                  margin-bottom: 10px;
                  padding-left: 10px;
                ">
              拣货单信息： <span style="color: #0000ff">{{ showNo }}</span>
            </h2>
            <Table border height="300" :columns="pickGoodsColumn" :data="pickGoodsData"></Table>
          </TabPane>
          <TabPane ref="packTab" name="packTab" style="height: 485px; background-color: rgba(215, 215, 215, 1)"
            :label="packTab" :disabled="packDisabled">
            <h2 style="
                  margin-top: 20px;
                  margin-bottom: 10px;
                  padding-left: 10px;
                ">
              出库单信息：
              <span style="color: #0000ff">{{
                curBox.boxData.packageCode
              }}</span>
            </h2>
            <div :style="curBox.color" class="showBoxNo" />
            <!-- <h2 class="showbrandName" v-if="curBox.boxData.brandName">{{ `品牌：${curBox.boxData.brandName}` }}</h2> -->
            <Table highlight-row border height="300" :columns="curPackGoodsTabColumn"
              :data="curBox.boxData.sortingPackageGoodsResult" :row-class-name="rowClassName"></Table>
            <div style="margin: 30px 10px 0;display:flex;justify-content: space-between;align-items:center;">
              <div>
                <Button @click="restPackage" style="margin-right:10px;">将该包裹重置为未开始分拣</Button>
                <Button @click="removePackage">将该包裹从当前拣货单中移除等待生成新拣货单</Button>
              </div>
              <!-- <Button @click="valAddServiceOpen">增值服务</Button> -->
            </div>
          </TabPane>
        </Tabs>
        </Col>
      </Row>
    </div>
    <!-- 篮子(包裹) -->
    <div class="pickingGoods">
      <Row>
        <!-- 左 -->
        <Col span="8">
        <template v-for="(item, index) in leftBoxs">
          <div :key="index" v-if="leftBoxsStatus">
            <div class="pickBox" :style="item.color" @click="showLeftBox(index)">
              <div style="
                    border-top: 15px solid #ed4014;
                    border-right: 15px solid transparent;
                    float: left;
                  "></div>
              <div style="text-align: center; margin-top: 5px">
                {{ item.boxNo }}
              </div>
              <div style="text-align: center; margin-top: 3px">
                {{ item.boxData ? item.boxData.packageCode : "" }}
              </div>
            </div>
            <!-- <div v-if="(index + 1) % leftCol === 0" style="float: none;height: 62px;" :key="item.boxNo"></div> -->
            <div v-if="(index + 1) % leftCol === 0" style="float: none; height: 62px"></div>
          </div>
        </template>
        </Col>
        <!-- 中 -->
        <Col span="8" style="border-left: 5px solid #528ed5; padding-left: 10px">
        <template v-for="(item, index) in midBoxs">
          <div v-if="midBoxsStatus" :key="index">
            <div class="pickBox" :style="item.color" @click="showMidBox(index)">
              <div style="
                    border-top: 15px solid #ff9900;
                    border-right: 15px solid transparent;
                    float: left;
                  "></div>
              <div style="text-align: center; margin-top: 5px">
                {{ item.boxNo }}
              </div>
              <div style="text-align: center; margin-top: 3px">
                {{ item.boxData ? item.boxData.packageCode : "" }}
              </div>
            </div>
            <!-- <div v-if="(index + 1) % midCol === 0" style="float: none;height: 62px;" :key="item.boxNo"></div> -->
            <div v-if="(index + 1) % midCol === 0" style="float: none; height: 62px"></div>
          </div>
        </template>
        </Col>
        <!-- 右 -->
        <Col span="8" style="border-left: 5px solid #528ed5; padding-left: 10px">
        <template v-for="(item, index) in rigBoxs">
          <div v-if="rigBoxsStatus" :key="index">
            <div class="pickBox" :style="item.color" @click="showRigBox(index)">
              <div style="
                    border-top: 15px solid #2db7f5;
                    border-right: 15px solid transparent;
                    float: left;
                  "></div>
              <div style="text-align: center; margin-top: 5px">
                {{ item.boxNo }}
              </div>
              <div style="text-align: center; margin-top: 3px">
                {{ item.boxData ? item.boxData.packageCode : "" }}
              </div>
            </div>
            <!-- <div v-if="(index + 1) % rigCol === 0" style="float: none;height: 62px;" :key="item.boxNo"></div> -->
            <div v-if="(index + 1) % rigCol === 0" style="float: none; height: 62px"></div>
          </div>
        </template>
        </Col>
      </Row>
    </div>
    <!-- 结束分拣有异常 -->
    <Modal v-model="abnormal" v-if="abnormalStatus" width="1120" :styles="{ top: '100px' }" :mask-closable="false"
      title="多品分拣—结束分拣" :closable="false">
      <div style="
          height: 60px;
          border: 1px solid #ccc;
          background: #ffffcc;
          line-height: 60px;
          font-size: 16px;
        ">
        <div>
          <Icon type="md-information-circle" color="#ffcc00" style="
              font-size: 40px;
              margin-left: 20px;
              marginright: 20px;
              vertical-align: middle;
            "></Icon>
          {{
            "您即将结束拣货单 {pickingGoodsNo} 的分拣作业，但系统检测到以下异常".replace(
              "{pickingGoodsNo}",
              showNo
            )
          }}:
        </div>
      </div>
      <div style="border: 1px solid #ccc; background: #d6e9f2; margin-top: 20px">
        <Row>
          <Col span="15" style="margin-left: 10px">
          <Row>
            <Col span="20">
            <span style="color: #ff0000">以下包裹未完成所有货品的分拣</span>
            </Col>
            <Col span="4">
            <span style="cursor: pointer" @click="saveAsExcel(0)">保存为Excel</span>
            </Col>
          </Row>
          <Table ref="nopickTable" border height="300" :columns="nopickDataColumn" :data="nopickData"></Table>
          <Button type="primary" class="ml10" @click="PrintDistributionList">打印配货清单
          </Button>
          <div style="margin-top: 20px; font-size: 14px">
            <div style="margin-bottom: 5px">可能的原因：</div>
            <span>1.拣货货品小于拣货单要求数量。</span><br />
            <span>2.之前的分拣过程在某个拣货框中放入了过多的货品。</span><br />
            <span>3.等待分拣区尚有剩余货品未扫描。</span>
          </div>
          </Col>
          <Col span="8" style="margin-left: 20px">
          <span style="cursor: pointer" @click="saveAsExcel(1)">保存为Excel</span>
          <Table ref="nopickGoodsTable" border height="300" :columns="nopickGoodsColumn" :data="nopickGoodsData"></Table>
          <div style="margin-top: 40px; font-size: 14px">
            <span>拣货与分拣过程均确保数量准确的情况下，待拣部分货品应该与等待分拣区的剩余货品数量一致。</span>
          </div>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Row>
          <Col span="18">
          <div style="
                width: 600px;
                height: 60px;
                border: 1px solid #ccc;
                background: #ffffcc;
                text-align: left;
                padding: 5px;
              ">
            <div style="margin-top: 10px">
              如果您觉得错误过多，无法追溯，您可以将所有拣货框中的货品全部放回等待分拣区，
              并<span style="color: #0000ff; cursor: pointer" @click="cancelPick">撤销本次分拣</span>拣货单可以再次开启分拣作业。
            </div>
          </div>
          </Col>
          <Col span="6" style="margin-top: 15px">
          <Button type="error" @click="endsorting">强制结束 </Button>
          <Button type="primary" @click="backPick">返回继续分拣 </Button>
          </Col>
        </Row>
      </div>
    </Modal>
    <!-- 货品增值项操作 -->
    <addItemModal :modelVisible.sync="addItemInfo.visible" :data="addItemInfo" />
    <!-- 速卖通 JIT 订单提示 -->
    <JITModaVerify :modelVisible.sync="JITModaVisible" :modelData="JITVerifyData" @closeJITModal="curSkuFocus"
      :encasementBoxNo="encasementBoxNo" />
    <!-- 印花烫印提示 -->
    <printingTips :modelVisible.sync="printingInfo.visible" :modelData="printingInfo.data"
      @closePrintingModal="curSkuFocus" @printReturn="printReturn" />
    <!-- 增值服务添加 :addItemList="addItemList" -->
    <!-- <addValAddService :modelVisible.sync="valAddServiceInfo.visible" :list="completeList" @addSuccess="addSuccess" /> -->
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import barcode_mixin from "@/components/mixin/barcode_mixin";
import light from "./mixin/light";
import Qs from "qs";
import { getErpconfig } from "@/utils/user";
// import productAdditionOperation from '@/views/components/productAdditionOperation';
import addItemModal from "@/views/components/addItemModal";
import JITModaVerify from "@/views/components/JITModaVerify";
import printingTips from "@/views/components/printingTips";
import PrintTongtu from "@/utils/printCommon";
// import addValAddService from "./addValAddService";

export default {
  mixins: [Mixin, tableMixin, light, barcode_mixin],
  components: {
    addItemModal,
    JITModaVerify,
    printingTips,
    // addValAddService,
  },
  data() {
    return {
      clearTime: null,
      filenodeViewTargetUrl: localStorage.getItem("imgUrlPrefix"),
      pickingGoodsNo: null, // 当前拣货单编号
      sku: null, // 输入sku
      productGoods: {
        // 当前货品展示
        sku: null,
        title: null,
        pictureUrl: null,
      },
      showProductGoods: false, // 控制是否显示当前货品信息（无效时用到）
      tabName: "pickTab", // 控制标签页显示
      pickTab: "拣货单",
      packTab: "出库单",
      packDisabled: true, // 控制出库单标签页的显示隐藏
      pickDataNum: 0, // 已完成扫描的货品数量
      leftBoxs: [], // 左侧货架
      midBoxs: [], // 中间货架
      rigBoxs: [], // 右侧货架
      leftRow: null,
      leftCol: null,
      midRow: null,
      midCol: null,
      rigRow: null,
      rigCol: null,
      isFinishStatus: false, // 全部分拣完成提示信息
      // isFinish: false, // 分拣完成模态框
      // finModalStatus: false, // 是否加载分拣完成模态框
      newPickingGoodsNo: null, // 开启新的拣货单
      curBox: {
        // 当前篮子
        boxData: {},
      },
      packageData: [], // 出库单列表数据
      rowClassIndex: null, // 记录当前高亮行下标
      pickGoodsData: [], // 拣货单货品数据
      pickGoodsColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "sku/名称/规格",
          key: "",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    color: "#008000",
                  },
                },
                params.row.sku
              ),
              h("div", params.row.title),
              h("div", params.row.variations),
            ]);
          },
        },
        {
          title: "总货品数量", // 总货品数量
          key: "allQuantity",
          align: "center",
        },
        {
          title: "已出库数量",
          align: "center",
          render(h, params) {
            let voidQuantity = params.row.allQuantity - params.row.realQuantity;
            return h(
              "span",
              {
                style: {
                  color: voidQuantity > 0 ? "red" : "#515a6e",
                },
              },
              voidQuantity
            );
          },
        },
        {
          title: "已分拣货品数量", // 已分拣货品数量
          key: "",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.haveNum);
          },
        },
        {
          title: "还需", // 还需
          key: "",
          align: "center",
          width: 100,
          render: (h, params) => {
            let num = params.row.quantity - params.row.haveNum;
            if (num) {
              return h(
                "div",
                {
                  style: {
                    color: "#FF0000",
                  },
                },
                num
              );
            } else {
              return h(
                "div",
                {
                  style: {
                    color: "#008000",
                  },
                },
                "完成"
              );
            }
          },
        },
      ],
      curPackGoodsTabColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "sku/名称/规格",
          key: "",
          align: "center",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: {
                    color: "#008000",
                  },
                },
                params.row.sku
              ),
              h("div", params.row.title),
              h("div", params.row.variations),
            ]);
          },
        },
        {
          title: "应发货品数量",
          key: "quantity",
          align: "center",
        },
        {
          title: "拣货框货品数量",
          key: "haveSkuNum",
          align: "center",
        },
        {
          title: "还需",
          key: "",
          align: "center",
          width: 100,
          render: (h, params) => {
            let num = params.row.quantity - params.row.haveSkuNum;
            if (num) {
              return h(
                "div",
                {
                  style: {
                    color: "#FF0000",
                  },
                },
                num
              );
            } else {
              return h(
                "div",
                {
                  style: {
                    color: "#008000",
                  },
                },
                "完成"
              );
            }
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
      ],
      abnormal: false, // 分拣结束有异常模态框
      abnormalStatus: false, // 是否显示分拣结束异常模态框
      nopickData: [], // 未完成所有货品分拣的包裹数据列表
      nopickDataColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "拣货框",
          key: "boxNo",
          align: "center",
          render: (h, params) => {
            if (params.row.noBoxNo) {
              return h("div", "未分配");
            } else {
              return h("div", params.row.boxNo);
            }
          },
        },
        {
          title: "出库单号",
          key: "packageCode",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              {
                style: {
                  color: "#1e5494",
                },
              },
              params.row.packageCode
            );
          },
        },
        {
          title: "货品(已拣/待拣)",
          key: "",
          align: "center",
          render: (h, params) => {
            if (params.row.noBoxNo) {
              let list = params.row.sortingPackageGoodsResult;
              let pos = [];
              list.forEach((n, i) => {
                let item = h("div", [
                  h(
                    "div",
                    n.sku +
                    "(" +
                    n.haveSkuNum +
                    "/" +
                    (n.quantity - n.haveSkuNum) +
                    ")"
                  ),
                ]);
                pos.push(item);
              });
              return h("div", pos);
            } else {
              let list = params.row.boxData.sortingPackageGoodsResult;
              let pos = [];
              if (list) {
                list.forEach((n, i) => {
                  if (n.haveSkuNum < n.quantity) {
                    let item = h("div", [
                      h(
                        "div",
                        n.sku +
                        "(" +
                        n.haveSkuNum +
                        "/" +
                        (n.quantity - n.haveSkuNum) +
                        ")"
                      ),
                    ]);
                    pos.push(item);
                  }
                });
              }
              return h("div", pos);
            }
          },
        },
        {
          title: "异常原因",
          key: "",
          align: "center",
          render: (h, params) => {
            if (params.row.noBoxNo) {
              return h("div", "未开始分拣");
            } else {
              return h("div", "分拣未完成");
            }
          },
        },
      ],
      nopickGoodsData: [], // 为完成分拣货品列表
      nopickGoodsColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "货品小计",
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
          title: "已拣",
          key: "haveNum",
          align: "center",
        },
        {
          title: "待拣",
          key: "",
          align: "center",
          render: (h, params) => {
            return h("div", params.row.quantity - params.row.haveNum);
          },
        },
      ],
      greenLightNum: null, // 记录已经完成分拣的篮子编号
      greenLightStatus: false, // 通过状态判断避免重复调用方法
      showNo: null, // 展示的拣货单号
      leftBoxsStatus: true, // 拣货架状态
      midBoxsStatus: true,
      rigBoxsStatus: true,
      printUrl: "", // 打印地址
      index: 0,
      isPrint: false, // 是否需要打印
      isExistAudio: false,
      audio: "",
      addItemInfo: {
        visible: false, // 弹框
        setting: null, // 拣货复核时进行包装 Y N
        list: [],
        sku: "",
        totalList: {},
      },
      JITModaVisible: false,
      encasementBoxNo: "",
      JITVerifyJson: {},
      JITVerifyData: [],
      printingInfo: {
        printInfo: {},
        visible: false, // 弹框
        data: {},
      },
      allPackageList: {}, //原存储出库单列表被随意赋值，保险起见重新弄一份
      combinatList: {}, //用于普通和组合数量变更
      isCombination: false, //是否组合
      valAddServiceInfo: {
        packageCode: null,
        visible: false,
      },
    };
  },
  methods: {
    // 打印配货清单
    PrintDistributionList() {
      let v = this;
      let obj = {
        packageCodeList: v.nopickData.map((i) => i.packageCode),
        warehouseId: v.getWarehouseId(),
      };
      v.$Spin.show();
      v.axios.post(api.queryDeliveryListPath, obj).then((response) => {
        v.$Spin.hide();
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.every((n, i) => {
            let jsonObj = {
              pdf: n.deliveryListLabelPath,
              postId: n.packageCode,
            };
            v.startPrint(jsonObj, n.packageCode);
            return true;
          });
        }
      });
    },
    clearSku() {
      // 如果识别到有条码编码，将对应的sku重新赋值this.sku（仓库只要sku，又要识别条码编码，鬼麻烦）
      let inputVal = this.$refs.curSku.$refs.input.value;
      let realSku = null;
      for (let i = 0; i <= this.pickGoodsData.length - 1; i++) {
        let n = this.pickGoodsData[i];
        if (inputVal === n.sku || inputVal === n.upc) {
          realSku = null;
          break;
        }
        if (!realSku && n.barCode.includes(inputVal)) realSku = n.sku;
      }
      // console.log(realSku, inputVal);
      this.sku = realSku || inputVal;
      this.$refs.curSku.$refs.input.value = "";
    },
    skuStart() {
      // 空时不执行
      if (this.$common.isEmpty(this.sku)) return;
      // 输入sku开始分拣
      this.$nextTick(() => {
        this.$refs.curSku.$refs.input.value = "";
      });
      this.isCombination = false;
      this.showProductGoods = false;
      // 先调用方法关掉所有灯
      if (this.state === 2) light.closeAll();
      if (this.greenLightNum !== null && this.greenLightStatus) {
        light.openGreen(this.greenLightNum); // 绿灯常亮 当前篮子已装满
        this.greenLightStatus = false;
      }
      let validObj = this.hasBox();
      if (!validObj.isPickGoods) {
        this.messageFun("请扫描正确的SKU/货品身份码！", "warning");
        // this.showProductGoods = false;
        return;
      }
      if (!validObj.hasBox) {
        this.messageFun("没有可用拣货篮！", "warning");
        return;
      }
      // this.showProductGoods = false;
      this.pickGoodsData.forEach((n, i) => {
        if (this.sku === n.sku || this.sku === n.upc) {
          if (n.quantity === n.haveNum) {
            // 判断拣货单中该sku是否已完成分拣
            return false;
          }
          if (n.quantity === n.haveNum + 1) {
            // 记录当前拣货单完成分拣的情况
            this.pickDataNum += 1;
            n.pickFinishStatus = true;
            if (this.pickDataNum === this.pickGoodsData.length) {
              this.isFinishStatus = true; // 显示全部完成分拣提示信息
            }
          }
          this.showProductGoods = true;
          this.tabName = "packTab"; // 若sku有效，显示出库单
          this.packDisabled = false; // 关掉disabled,显示出库单
          this.productGoods = n;
          n.haveNum += 1;
          this.selectBox();
        }
      });
      // 高亮当前行
      let data = this.curBox.boxData.sortingPackageGoodsResult;
      if (data) {
        data.forEach((m, t) => {
          if (m.sku === this.sku || m.upc === this.sku) {
            this.rowClassIndex = t;
          }
        });
      }

      if (this.showProductGoods) {
        this.$nextTick(() => {
          // 增值项处理
          this.handleAddItemOperation();
          // 普通和组合产品的处理
          this.handleSkuOpration();
        });
      }
    },
    handleSkuOpration() {
      let boxData = this.curBox.boxData || {};
      // 非速卖通不处理
      if (!["JIT"].includes(boxData.source)) return;
      const sku = this.sku;
      // 拐了个弯去拿是因为发现packageData长度在重置的时候被变更了，代码很乱，保险起见重新复制一份
      let data = this.combinatList[boxData.packageCode] || {};
      let productScanMap = data.productScanMap;
      // 旧数据存在为空的情况，则不去处理
      if (this.$common.isEmpty(productScanMap)) return;
      // productScanMap 是下单时的数据，不会由后面sku变更影响，以普通至组合排序，最多有两条
      let list = productScanMap[sku] || [];
      if (!list.length) {
        this.messageFun("该sku为变更sku，获取面单异常!", "error");
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
        this.messageFun("该sku获取标签异常!", "error");
        return;
      }
      // skuType:0普通 1组合
      if (item.skuType == 1) {
        this.isCombination = true;
        this.playAudio();
      } else {
        if (!item.labelPath) {
          this.messageFun("sku标签路径为空!", "error");
          return;
        }
        PrintTongtu.pdfPrint({ pdf: item.labelPath });
      }
    },
    messageFun(msg = "这是一个提示", type = "info") {
      this.$Message[type]({
        content: msg,
        duration: 4,
      });
    },
    rowClassName(row, index) {
      let v = this;
      if (index === v.rowClassIndex) {
        return "demo-table-info-row";
      } else {
        return "";
      }
    },
    packageCodeHasSku() {
      // 检查是否有没有分配完的出库单
      let hasTrue = false;
      let v = this;
      [...v.leftBoxs, ...v.midBoxs, ...v.rigBoxs].forEach((i) => {
        if (i.boxData && i.boxData.sortingPackageGoodsResult) {
          i.boxData.sortingPackageGoodsResult.forEach((j) => {
            if (j.sku === v.sku && j.haveSkuNum < j.quantity) {
              hasTrue = true;
            }
          });
        }
      });
      return hasTrue;
    },
    hasBox() {
      /**
       * @Description:判断是否有可用拣货篮
       * @author gan
       * @date: 2020/11/13 15:20
       * @params:
       */
      let hasBox = true;
      let isPickGoods = false; // 是当前拣货单商品
      let firstJoin = false; // 是否第一次拣货
      let v = this;
      v.pickGoodsData.forEach((n, i) => {
        if (v.sku === n.sku || v.sku === n.upc) {
          if (n.haveNum === 0) {
            firstJoin = true;
          }
          isPickGoods = true;
        }
      });
      if (isPickGoods) {
        // 是当前拣货单商品
        // 先判断是否第一次加入
        if (firstJoin) {
          // 判断是否存在在正在拣货的篮子
          if (v.packageCodeHasSku()) {
            hasBox = true;
          } else {
            // 判断是否有空篮子
            if (
              v.leftBoxs.some((i) => i.boxData === null) ||
              v.midBoxs.some((i) => i.boxData === null) ||
              v.rigBoxs.some((i) => i.boxData === null)
            ) {
              hasBox = true;
            } else {
              hasBox = false;
            }
          }
        }
      }
      return {
        hasBox: hasBox,
        isPickGoods: isPickGoods,
      };
    },
    selectBox() {
      // 选择符合条件的箱子
      if (!this.findBox(this.leftBoxs)) {
        if (!this.findBox(this.midBoxs)) {
          this.findBox(this.rigBoxs);
        }
      }
      // this.$nextTick(() => {
      //   this.handleAddItemNumber();
      // })
    },
    // // 对增值服务数量增加
    // handleAddItemNumber() {
    //   let boxData = this.curBox.boxData || {};
    //   let [list, addList] = [[], []];
    //   const key = boxData.packageCode + "&" + this.sku;
    //   Object.keys(this.addItemInfo.totalList).forEach((k) => {
    //     if (key === k) addList = this.addItemInfo.totalList[k];
    //   });
    //   let powerList = addList.filter(k => {
    //     return !['ottoMarketingProduct'].includes(k.resourceName);
    //   })
    //   let temp = this.$common.arrayToObj(powerList, 'resourceName');
    //   let sortlist = boxData.sortingPackageGoodsResult || [];
    //   sortlist.forEach((item, index) => {
    //     if (this.sku === item.sku || this.sku === item.upc) {
    //       if ('vacuumizeProduct' in temp) {
    //         let num = item.vacuumizeNumber + 1;
    //         num = (num >= item.quantity) ? item.quantity : num;
    //         this.$set(this.curBox.boxData.sortingPackageGoodsResult[index], 'vacuumizeNumber', num);
    //       }
    //       if ('inventoryOverTime' in temp) {
    //         let num = item.replacePackingNumber + 1;
    //         num = (num >= item.quantity) ? item.quantity : num;
    //         this.$set(this.curBox.boxData.sortingPackageGoodsResult[index], 'replacePackingNumber', num);
    //       }
    //     }
    //   })
    // },
    findBox(boxList) {
      // 根据指定的箱子集合查找有效的箱子
      let v = this;
      if (boxList.length) {
        let isF = false;
        for (let i = 0; i < boxList.length; i++) {
          let box = boxList[i];
          if (box.boxData && !box.boxIsFinish) {
            let sortingPackageGoodsResult = box.boxData.sortingPackageGoodsResult;
            for (let m = 0; m < sortingPackageGoodsResult.length; m++) {
              let k = sortingPackageGoodsResult[m];
              if ((v.sku === k.sku || v.sku === k.upc) && k.haveSkuNum < k.quantity) {
                // 当前篮子需要这个sku
                isF = true;
                k.haveSkuNum += 1;
                v.curBox = box;
                if (k.quantity === k.haveSkuNum) {
                  box.packDataNum++;
                  if (sortingPackageGoodsResult.length === box.packDataNum) {
                    box.color = "background:#00B150;cursor:pointer;"; // 绿色
                    box.boxIsFinish = true; // 当前篮子已完成分拣
                    if (v.isPrint) {
                      v.beforePrint(
                        box.boxData.labelPath,
                        "1",
                        box.boxData,
                        box
                      );
                    }
                    if (this.state === 2) {
                      light.flashGreen(box.boxNo); // 绿灯闪烁 当前货品是这个篮子的最后一个
                      v.greenLightNum = box.boxNo;
                      v.greenLightStatus = true;
                    }
                  }
                }
                return true;
              }
            }
          }
        }
        if (isF) return;
        for (let i = 0; i < boxList.length; i++) {
          let box = boxList[i];
          if (!box.boxData) {
            // 判断篮子是否为空
            box.boxData = v.getPackageData(box);
            // 已出库处理
            box.boxData.sortingPackageGoodsResult.forEach((p) => {
              if (p.quantity === 0) {
                // 都已出库
                box.packDataNum++;
              }
            });
            box.color = "background:#9BC053;cursor:pointer;";
            if (this.state === 2) {
              light.flashRed(box.boxNo); // 红灯闪烁 篮子刚分配且当前货品不是最后一个
            }

            // 未完成分拣
            let sortingPackageGoodsResult = box.boxData.sortingPackageGoodsResult;
            for (let m = 0; m < sortingPackageGoodsResult.length; m++) {
              let k = sortingPackageGoodsResult[m];
              if (
                (v.sku === k.sku || v.sku === k.upc) &&
                k.haveSkuNum < k.quantity
              ) {
                // 当前篮子需要这个sku
                k.haveSkuNum += 1;
                v.curBox = box;
                if (k.quantity === k.haveSkuNum) {
                  box.packDataNum++;
                  if (sortingPackageGoodsResult.length === box.packDataNum) {
                    box.color = "background:#00B150;cursor:pointer;";
                    box.boxIsFinish = true; // 当前篮子已完成分拣
                    if (v.isPrint) {
                      v.beforePrint(
                        box.boxData.labelPath,
                        "1",
                        box.boxData,
                        box
                      );
                    }
                    if (this.state === 2) {
                      light.flashGreen(box.boxNo); // 绿灯闪烁 当前货品是这个篮子的最后一个
                      v.greenLightNum = box.boxNo;
                      v.greenLightStatus = true;
                    }
                  }
                }
                return true;
              }
            }
          }
        }
      }
      return false;
    },
    getPackageData(box) {
      // 获取当前sku的包裹信息
      let v = this;
      for (let i = 0; i < v.packageData.length; i++) {
        for (
          let j = 0;
          j < v.packageData[i].sortingPackageGoodsResult.length;
          j++
        ) {
          if (
            v.sku === v.packageData[i].sortingPackageGoodsResult[j].sku ||
            v.sku === v.packageData[i].sortingPackageGoodsResult[j].upc
          ) {
            let temp = JSON.parse(JSON.stringify(v.packageData[i]));
            box.delPackData = v.packageData.splice(i, 1); // 存起来方便在重置包裹时使用
            return temp;
          }
        }
      }
      return null;
    },
    // 获取拣货单列表
    getPickingList() {
      return new Promise((resolve, reject) => {
        let v = this;
        if (!v.pickingGoodsNo) return reject(new Error(false));
        let pos = [];
        v.pickDataNum = 0;
        v.axios
          .get(api.get_pickListOfGoods + v.pickingGoodsNo, {
            params: { warehouseId: this.pickingGoodsNo },
          })
          .then(async (response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;

              let packageList = data.sortingPackageGoodsResult || [];
              let skuList = packageList.map((k) => k.sku);
              let barCodeList = await v.getBarcodeBeSku(skuList);

              packageList.forEach((n, i) => {
                n.haveNum = 0; // 拣货单已分拣货品数量
                n.pickFinishStatus = false; // 拣货单分拣完成状态 false未完成 true已完成
                v.packageData.forEach((j) => {
                  j.sortingPackageGoodsResult.forEach((k) => {
                    if (n.sku === k.sku) {
                      if (n.realQuantity) {
                        n.realQuantity += k.quantity; // 目的是统计已出库数量
                      } else {
                        n.realQuantity = k.quantity;
                      }
                    }
                  });
                });
                n.allQuantity = n.quantity;
                n.quantity = n.realQuantity;
                if (!n.realQuantity || n.realQuantity === 0) {
                  v.pickDataNum += 1;
                }
                let barCode = barCodeList[n.sku] && barCodeList[n.sku].scanCodeList;
                n.barCode = barCode || [];
                pos.push(n);
              });
              v.pickGoodsData = pos;
              v.showNo = data.pickingGoodsNo;
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
    // 获取出库单列表
    getPackList() {
      return new Promise((resolve, reject) => {
        if (!this.pickingGoodsNo) return reject(new Error(false));
        this.axios
          .get(api.get_packageList + this.pickingGoodsNo)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas || [];
              let list = data.map((n, i) => {
                if (n.source == "JIT") {
                  n.labelPath = `${window.location.origin}/wms-service/filenode/s${n.labelPath}`;
                }
                n.sortingPackageGoodsResult.forEach((j, k) => {
                  j.haveSkuNum = 0; // 出库单已分拣货品数量
                  // j.vacuumizeNumber = 0; // 抽真空数量
                  // j.replacePackingNumber = 0; // 换包装数量
                });
                return n;
              });
              this.packageData = this.$common.copy(list);
              this.printUrl = this.packageData[0].labelPath;

              // 以出库单号存储
              let temp = {};
              data.forEach((k) => (temp[k.packageCode] = k));
              this.combinatList = this.$common.copy(temp);
              this.allPackageList = temp;
              resolve();
            } else {
              reject(new Error(false));
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 获取分拣架设置列表
    getPackageSetting() {
      return new Promise((resolve, reject) => {
        let v = this;
        let obj = { typeList: ["sorting", "packing"] };
        v.axios
          .post(api.get_packageSetting, obj)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              let [leftBoxsStatus, midBoxsStatus, rigBoxsStatus] = [
                false,
                false,
                false,
              ];
              data.forEach((item, i) => {
                const paramValue = item.paramValue === "Y";
                if (item.paramKey === "enableLeftShelfType" && paramValue) {
                  leftBoxsStatus = true;
                } else if (
                  item.paramKey === "enableMidShelfType" &&
                  paramValue
                ) {
                  midBoxsStatus = true;
                } else if (
                  item.paramKey === "enableRightShelfType" &&
                  paramValue
                ) {
                  rigBoxsStatus = true;
                }
                // 包装作业流程开启，则在“多品分拣”环节，不需要进行“货品增项操作”的识别
                if (item.paramKey === "enablePickingReviewForPackaging")
                  v.addItemInfo.setting = item.paramValue;
              });
              data.forEach((item, i) => {
                if (item.paramKey === "leftShelfType") {
                  if (leftBoxsStatus) {
                    v.leftRow = item.paramValue.split("x")[0];
                    v.leftCol = item.paramValue.split("x")[1];
                  }
                } else if (item.paramKey === "midShelfType") {
                  if (midBoxsStatus) {
                    v.midRow = item.paramValue.split("x")[0];
                    v.midCol = item.paramValue.split("x")[1];
                  }
                } else if (item.paramKey === "rightShelfType") {
                  if (rigBoxsStatus) {
                    v.rigRow = item.paramValue.split("x")[0];
                    v.rigCol = item.paramValue.split("x")[1];
                  }
                } else if (item.paramKey === "enableLeftShelfType") {
                  if (item.paramValue === "Y") {
                    v.leftBoxsStatus = true;
                  } else {
                    v.leftBoxsStatus = false;
                  }
                } else if (item.paramKey === "enableMidShelfType") {
                  if (item.paramValue === "Y") {
                    v.midBoxsStatus = true;
                  } else {
                    v.midBoxsStatus = false;
                  }
                } else if (item.paramKey === "enableRightShelfType") {
                  if (item.paramValue === "Y") {
                    v.rigBoxsStatus = true;
                  } else {
                    v.rigBoxsStatus = false;
                  }
                } else if (item.paramKey === "enableSortingPrinted") {
                  // 是否需要打印
                  if (item.paramValue === "Y") {
                    v.isPrint = true;
                  } else {
                    v.isPrint = false;
                  }
                } else {
                }
              });
              resolve(true);
              v.initBox();
            } else {
              reject(new Error(false));
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    // 初始化拣货框
    initBox() {
      let v = this;
      if (v.leftRow && v.leftCol) {
        for (let i = 1; i <= v.leftRow; i++) {
          for (let j = 1; j <= v.leftCol; j++) {
            let box = {
              boxNo: "1" + i + j,
              boxData: null, // 存储包裹信息
              packDataNum: 0, // 已扫描货品种类数
              color: "background:white",
              boxIsFinish: false, // true已完成  false未完成
            };
            v.leftBoxs.push(box);
          }
        }
      }
      if (v.midRow && v.midCol) {
        for (let n = 1; n <= v.midRow; n++) {
          for (let k = 1; k <= v.midCol; k++) {
            let box = {
              boxNo: "2" + n + k,
              boxData: null, // 存储包裹信息
              packDataNum: 0, // 已扫描货品种类数
              packageCode: null,
              color: "background:white",
              boxIsFinish: false,
            };
            v.midBoxs.push(box);
          }
        }
      }
      if (v.rigRow && v.rigCol) {
        for (let s = 1; s <= v.rigRow; s++) {
          for (let t = 1; t <= v.rigCol; t++) {
            let box = {
              boxNo: "3" + s + t,
              boxData: null, // 存储包裹信息
              color: "background:white",
              boxIsFinish: false, // 判断篮子是否满了
            };
            v.rigBoxs.push(box);
          }
        }
      }
    },
    // 打印前
    beforePrint(obj, id, data, box) {
      // this.print({ obj: obj, id: id, data: data });
      this.jitHandle(data, box);
      // this.printingTipHandle(data, box);
      this.printingTipHandle(obj, id, data);
    },
    // jit 提示
    jitHandle(data, box) {
      let productDto = data.jitOrderMapperProductDTO || {};
      let list = productDto.jITProductInfoDTOList || [];
      if (!(data.source == "JIT" && list.length)) return;
      // 获取子级映射 SKU
      let productSku = list.map((item) => {
        return (item.productGoodsInfoDTOList || []).map((row) => {
          return row.productSku;
        });
      });
      productSku = this.$common.flat(productSku);
      if (!this.$common.isEmpty(productSku)) {
        this.JITVerifyData = [this.$common.copy(data)];
        this.encasementBoxNo = box.boxNo;
        this.$refs.curSku.$refs.input.blur();
        this.$set(
          this.JITVerifyJson,
          box.boxNo,
          this.$common.copy(this.JITVerifyData)
        );
        this.$nextTick(() => {
          this.JITModaVisible = true;
        });
      }
    },
    // 印花烫印 提示
    printingTipHandle(obj, id, data) {
      let list = data.productMapperInfoDTOList || [];
      if (!list.length) {
        this.print({ obj: obj, id: id, data: data });
        return;
      }
      this.printingInfo.data = data;
      this.printingInfo.printInfo = { obj: obj, id: id, data: data };
      this.printingInfo.visible = true;
    },
    // 等待印花打印完成再打印面单（不知道为啥打印只能打一个，估计冲突了，暂时没有其余好的办法）
    printReturn() {
      this.print(this.printingInfo.printInfo);
    },
    // 打印
    print({ obj = "", id = "", data = {} } = {}) {
      let v = this;
      if (!obj) return;
      v.printHtmlUrl(obj, id).then((response) => {
        if (response.printType === "cainiao") {
          v.sortingFinishPrint(data);
          return;
        }
        let jsonObj = response;
        let instance = v.axios.create({
          timeout: 3000,
          headers: {
            "Content-Type": "multipart/form-data; charset=UTF-8",
          },
        });
        delete v.axios.defaults.headers.post["X-Requested-With"];
        instance
          .post("http://localhost:10099/print", Qs.stringify(jsonObj))
          .then((response) => {
            if (response.status === 200) {
              v.sortingFinishPrint(data);
            }
          })
          .catch(() => {
            v.axios.get(api.get_downloadPrint).then((response) => {
              if (response.data.code === 0) {
                v.$Modal.info({
                  title: "提示",
                  okText: "取消",
                  render: (h, params) => {
                    return h(
                      "div",
                      {
                        class: "normalTop20",
                      },
                      [
                        h(
                          "div",
                          {
                            class: "flexBox flexBoxJustContent",
                            style: {
                              fontSize: "16px",
                            },
                          },
                          "该功能需使用打印控件，请下载安装"
                        ),
                        h(
                          "a",
                          {
                            attrs: {
                              href:
                                v.$store.state.erpConfig.filenodeViewTargetUrl +
                                response.data.datas,
                              target: "_blank",
                            },
                            class: "flexBox flexBoxJustContent normalTop",
                            style: {
                              fontSize: "16px",
                              fontWeight: "bold",
                            },
                          },
                          "点击下载"
                        ),
                        h(
                          "div",
                          {
                            class: "flexBox flexBoxJustContent normalTop",
                            style: {
                              fontSize: "16px",
                            },
                          },
                          "如果已安装，请开启打印控件"
                        ), // 如果已安装，请开启打印控件
                      ]
                    );
                  },
                });
              }
            });
          });
      });
    },
    sortingFinishPrint(data) {
      let v = this;
      let params = {
        packageIds: [data.packageId],
        pickingGoodsId: v.pickingGoodsNo,
      };
      v.axios.put(api.put_sortingFinishPrint, params).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("分拣打印完成");
        }
      });
    },
    showLeftBox(index) {
      // 点击左侧篮子显示出库单信息
      if (this.leftBoxs[index].boxData) {
        this.curBox = this.leftBoxs[index];
        this.tabName = "packTab"; // 显示出库单
        const boxJITInfo = this.JITVerifyJson[this.curBox.boxNo];
        if (this.$common.isEmpty(boxJITInfo)) return;
        this.JITVerifyData = boxJITInfo;
        this.encasementBoxNo = this.curBox.boxNo;
        this.$refs.curSku.$refs.input.blur();
        this.$nextTick(() => {
          this.JITModaVisible = true;
        });
      }
    },
    showMidBox(index) {
      // 点击中间篮子显示出库单信息
      if (this.midBoxs[index].boxData) {
        this.curBox = this.midBoxs[index];
        this.tabName = "packTab"; // 显示出库单
        const boxJITInfo = this.JITVerifyJson[this.curBox.boxNo];
        if (this.$common.isEmpty(boxJITInfo)) return;
        this.JITVerifyData = boxJITInfo;
        this.encasementBoxNo = this.curBox.boxNo;
        this.$refs.curSku.$refs.input.blur();
        this.$nextTick(() => {
          this.JITModaVisible = true;
        });
      }
    },
    showRigBox(index) {
      // 点击右侧篮子显示出库单信息
      if (this.rigBoxs[index].boxData) {
        this.curBox = this.rigBoxs[index];
        this.tabName = "packTab"; // 显示出库单
        const boxJITInfo = this.JITVerifyJson[this.curBox.boxNo];
        if (this.$common.isEmpty(boxJITInfo)) return;
        this.JITVerifyData = boxJITInfo;
        this.encasementBoxNo = this.curBox.boxNo;
        this.$refs.curSku.$refs.input.blur();
        this.$nextTick(() => {
          this.JITModaVisible = true;
        });
      }
    },
    changeTab(name) {
      // 改变tabName的值
      let v = this;
      if (name === "pickTab") {
        v.tabName = "pickTab";
      } else if (name === "packTab") {
        v.tabName = "packTab";
      }
    },
    sortingEnd() {
      // 分拣完成 无异常
      let v = this;
      let obj = {
        errorPackageIdList: [], // 异常的出库单id列表
        pickingGoodsId: v.pickingGoodsNo,
      };
      v.overSorting(obj);
    },
    overSorting(obj) {
      // 结束分拣 接口
      // let boxList = [...this.leftBoxs, ...this.midBoxs, ...this.rigBoxs];
      // let list = [];
      // boxList.forEach(k => {
      //   // 异常包裹不需要记录增值服务数据
      //   if (obj.errorPackageIdList.includes(k.packageId)) return;
      //   let boxData = k.boxData || {};
      //   (boxData.sortingPackageGoodsResult || []).forEach(sk => {
      //     let vacuumizeNumber = sk.vacuumizeNumber || 0;
      //     let replacePackingNumber = sk.replacePackingNumber || 0;
      //     if (vacuumizeNumber > 0 || replacePackingNumber > 0) {
      //       list.push({
      //         packageGoodsId: sk.packageGoodsId,
      //         vacuumizeNumber: vacuumizeNumber,
      //         replacePackingNumber: replacePackingNumber,
      //       })
      //     }
      //   })
      // })
      // list.length && (obj.skuValueAddedServiceList = list);
      // console.log(obj, 'obj', boxList)
      // return;
      this.axios.post(api.end_sorting, obj).then((response) => {
        if (response.data.code === 0) {
          window.location.href = `//${window.location.host}/wms-service/wms.html#/sorting?warehouseId=${this.getWarehouseId()}`; // 结束分拣
        }
      });
    },
    pickFinish() {
      // 结束本次分拣
      let v = this;
      let list = []; // 未完成分拣包裹列表
      if (v.packageData.length) {
        // packageData里若是有数据则表示有包裹未分配篮子
        v.packageData.forEach((m, t) => {
          m.noBoxNo = true; // 增加noBoxNo表示该包裹未分配拣货框 true未分配 false已分配
          list.push(m);
        });
      }
      if (v.leftBoxs.length) {
        v.leftBoxs.forEach((v, b) => {
          if (v.boxData) {
            // 先判断篮子是否为空
            if (!v.boxIsFinish) {
              // 判断篮子是否未完成分拣 false未完成 true已完成
              v.noBoxNo = false; // 增加noBoxNo表示该包裹未分配拣货框 true未分配 false已分配
              v.packageId = v.boxData.packageId; // 把id拿到外层，在强制结束用到
              v.packageCode = v.boxData.packageCode; // 把code拿到外层，在异常包裹列表用到
              list.push(v);
              if (this.state === 2) {
                light.openRed(v.boxNo); // 红灯常亮 还有篮子未分配
              }
            }
          }
        });
      } else if (v.midBoxs.length) {
        v.midBoxs.forEach((s, p) => {
          if (s.boxData) {
            // 先判断篮子是否为空
            if (!s.boxIsFinish) {
              // 判断篮子是否未完成分拣 false未完成 true已完成
              s.noBoxNo = false; // 增加noBoxNo表示该包裹未分配拣货框 true未分配 false已分配
              s.packageId = s.boxData.packageId;
              s.packageCode = s.boxData.packageCode;
              list.push(s);
              if (this.state === 2) {
                light.openRed(s.boxNo); // 红灯常亮 还有篮子未分配
              }
            }
          }
        });
      } else if (v.midBoxs.length) {
        v.midBoxs.forEach((n, k) => {
          if (n.boxData) {
            // 先判断篮子是否为空
            if (!n.boxIsFinish) {
              // 判断篮子是否未完成分拣 false未完成 true已完成
              n.noBoxNo = false; // 增加noBoxNo表示该包裹未分配拣货框 true未分配 false已分配
              n.packageId = n.boxData.packageId;
              n.packageCode = n.boxData.packageCode;
              list.push(n);
              if (this.state === 2) {
                light.openRed(n.boxNo); // 红灯常亮 还有篮子未分配
              }
            }
          }
        });
      }
      let pos = []; // 未完成分拣货品列表
      v.pickGoodsData.forEach((n, i) => {
        if (!n.pickFinishStatus) {
          // 未完成分拣
          pos.push(n);
        }
      });
      if (!list.length && !pos.length) {
        // 当这两个数组都没有数据时，表示无异常
        v.sortingEnd();
      } else {
        // 反正则表示有异常数据
        v.abnormal = true;
        v.abnormalStatus = true;
        v.nopickGoodsData = pos;
        v.nopickData = [];
        list.map((item) => {
          if (
            item.printTime === null ||
            (item.boxData && item.boxData.printTime === null)
          ) {
            v.nopickData.push(item);
          }
        });
      }
    },
    backPick() {
      // 返回继续分拣
      let v = this;
      v.abnormal = false;
    },
    cancelPick() {
      // 撤销本次分拣
      let v = this;
      v.axios.post(api.cancel_sorting + v.pickingGoodsNo).then((response) => {
        if (response.data.code === 0) {
          window.location.href = `//${window.location.host
            }/wms-service/wms.html#/sorting?warehouseId=${v.getWarehouseId()}`;
        }
      });
    },
    endsorting() {
      // 强制结束 有异常
      let v = this;
      let pos = [];
      let arr = [];
      v.nopickData.forEach((n, i) => {
        pos.push(n.packageId);
        if (n.boxData) {
          n.boxData.sortingPackageGoodsResult.forEach((j) => {
            arr.push({
              packageGoodsId: j.packageGoodsId,
              actualPickingNumber: j.haveSkuNum,
            });
          });
        } else {
          n.sortingPackageGoodsResult.forEach((j) => {
            arr.push({
              packageGoodsId: j.packageGoodsId,
              actualPickingNumber: j.haveSkuNum,
            });
          });
        }
      });
      let obj = {
        errorPackageIdList: pos,
        updateActualPickingNumBoList: arr,
        pickingGoodsId: v.pickingGoodsNo,
      };
      v.overSorting(obj);
    },
    restPackage() {
      // 将该包裹重置为未开始分拣
      this.sku = null;
      this.$refs.curSku.$refs.input.value = null;
      this.curBox.boxData.sortingPackageGoodsResult.forEach((n, i) => {
        this.pickGoodsData.forEach((m, t) => {
          // m.pickFinishStatus = false; // 拣货单分拣完成状态 false未完成 true已完成
          if (
            ((n.sku === m.sku && n.sku) || (n.upc === m.upc && n.upc)) &&
            n.haveSkuNum > 0
          ) {
            m.haveNum -= n.haveSkuNum;
            if (m.pickFinishStatus) {
              this.pickDataNum -= 1;
            }
            m.pickFinishStatus = false; // 拣货单分拣完成状态 false未完成 true已完成
          }
        });
      });
      this.curBox.boxData = "";
      this.JITVerifyJson = {};
      this.curBox.boxIsFinish = false; // 把篮子的状态标记为未完成
      this.curBox.packDataNum = 0;
      this.packageData.push(this.curBox.delPackData[0]);
      this.tabName = "pickTab"; // 显示拣货单
      this.packDisabled = true; // 打开disabled,隐藏出库单
      this.curBox.color = "background:white";
      this.isFinishStatus = false; // 隐藏全部完成分拣提示信息
      this.combinatList = this.$common.copy(this.allPackageList);
    },
    isPickFinishStatus() {
      // 移除包裹的时候是否完成拣货状态
      this.pickDataNum = 0;
      this.pickGoodsData.forEach((i) => {
        if (i.quantity === i.haveNum) {
          i.pickFinishStatus = true;
          this.pickDataNum++;
        }
      });
    },
    removePackage() {
      // 将该包裹从当前拣货单中移除等待生成新的拣货单
      let v = this;
      let obj = {
        packageId: v.curBox.boxData.packageId,
        pickingGoodsId: v.pickingGoodsNo,
      };
      v.axios.post(api.del_packageInfo, obj).then((response) => {
        if (response.data.code === 0) {
          v.curBox.boxData.sortingPackageGoodsResult.forEach((n, i) => {
            // 先拿到该包裹货品数据
            v.pickGoodsData.forEach((m, t) => {
              // 再从拣货单中删除对应的数量
              if ((n.sku === m.sku && n.sku) || (n.upc === m.upc && m.upc)) {
                if (m.pickFinishStatus) {
                  v.pickDataNum -= 1;
                  m.pickFinishStatus = false; // 拣货单分拣完成状态 false未完成 true已完成
                }
                if (m.quantity - n.quantity) {
                  // 拣货单中货品数量减去出库单货品数量，若为0则从拣货单中删除
                  m.haveNum -= n.haveSkuNum;
                  m.quantity -= n.quantity;
                } else {
                  v.pickGoodsData.splice(t, 1);
                }
                v.isPickFinishStatus();
              }
            });
          });
          v.sku = null;
          v.$refs.curSku.$refs.input.value = null;
          v.curBox.boxData = "";
          v.curBox.boxIsFinish = false; // 把篮子的状态标记为未完成
          v.tabName = "pickTab"; // 显示拣货单
          v.packDisabled = true; // 打开disabled,隐藏出库单
          v.curBox.color = "background:white";
          v.curBox.packDataNum = 0;
        }
      });
    },
    saveAsExcel(val) {
      // 保存为Excel
      let v = this;
      let obj = {};
      let filenodeViewTargetUrl = localStorage.getItem("imgUrlPrefix");
      clearTimeout(v.clearTime);
      if (val) {
        // nopickGoodsTable(右侧表格)
        if (!v.nopickGoodsData.length) {
          v.messageFun("no data！", "error");
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [
          // 表头
          {
            title: "No",
            column: "no",
          },
          {
            title: "货品小计",
            column: "goodsTotal",
          },
          {
            title: "已拣",
            column: "alreadyPick",
          },
          {
            title: "待拣",
            column: "waitPick",
          },
        ];
        let pos = [];
        v.nopickGoodsData.forEach((n, i) => {
          pos.push([
            {
              column: "no",
              content: i + 1,
            },
            {
              column: "goodsTotal",
              content: n.sku,
            },
            {
              column: "alreadyPick",
              content: n.haveNum,
            },
            {
              column: "waitPick",
              content: n.quantity - n.haveNum,
            },
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m,
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList,
        };
      } else {
        // nopickTable(左侧表格)
        if (!v.nopickData.length) {
          v.messageFun("no data！", "error");
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [
          // 表头
          {
            title: "No",
            column: "no",
          },
          {
            title: "拣货框",
            column: "pickBox",
          },
          {
            title: "包裹号",
            column: "pickNo",
          },
          {
            title: "货品(已拣/待拣)",
            column: "alorwaitPick",
          },
          {
            title: "异常原因",
            column: "abReason",
          },
        ];
        let pos = [];
        let box = [];
        v.nopickData.forEach((n, i) => {
          if (n.noBoxNo) {
            let list = n.sortingPackageGoodsResult;
            list.forEach((n, i) => {
              let item =
                n.sku +
                "(" +
                n.haveSkuNum +
                "/" +
                (n.quantity - n.haveSkuNum) +
                ")";
              box.push(item);
            });
          } else {
            let list = n.boxData.sortingPackageGoodsResult;
            if (list) {
              list.forEach((n, i) => {
                if (n.haveSkuNum < n.quantity) {
                  let item =
                    n.sku +
                    "(" +
                    n.haveSkuNum +
                    "/" +
                    (n.quantity - n.haveSkuNum) +
                    ")";
                  box.push(item);
                }
              });
            }
          }
          pos.push([
            {
              column: "no",
              content: i + 1,
            },
            {
              column: "pickBox",
              content: n.noBoxNo ? "未匹配" : n.boxNo,
            },
            {
              column: "pickNo",
              content: n.packageCode,
            },
            {
              column: "alorwaitPick",
              content: box.toString(),
            },
            {
              column: "abReason",
              content: n.noBoxNo ? "未开始分拣" : "分拣未完成",
            },
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m,
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList,
        };
      }
      let newTab = window.open();
      v.axios.post(api.import_excel, obj).then((response) => {
        if (response.data.code === 0) {
          // let newTab = window.open();
          newTab.location.href = filenodeViewTargetUrl + response.data.datas;
          v.clearTime = setTimeout(function () {
            newTab.close();
          }, 1000);
        } else {
          newTab.close();
        }
      });
    },
    playAudio() {
      /* let audio = new Audio();
      audio.src = require('../../../../../public/static/audios/huanbao.mp3');
      audio.play(); */
      if (this.isExistAudio) {
        this.audio.load();
      } else {
        this.audio = new Audio();
        this.audio.src = require("#@/static/audios/huanbao.mp3");
      }
      this.audio.play();
      this.isExistAudio = true;
    },
    // 在分拣与包装的环节，出现品牌换包与超期换包时，播放声音提醒
    soundReminder() {
      let data = this.curBox.boxData || {};
      let { brandName = "", sortingPackageGoodsResult = [] } = data;
      let [brandList, isExtended, isBrandName] = [["LAPA"], false, false];
      isBrandName = brandName && brandList.includes(brandName.toUpperCase());
      sortingPackageGoodsResult.forEach((sk) => {
        if (this.sku === sk.sku && sk.isExtended) isExtended = true;
      });
      if (!(isBrandName || isExtended)) return;
      this.playAudio();
    },
    // 获取增项操作
    getAddItemOperation() {
      let parmas = `?pickingGoodsId=${this.pickingGoodsNo
        }&warehouseId=${this.getWarehouseId()}`;
      this.axios.post(api.pickingReminderSetting + parmas).then(({ data }) => {
        if (data.code !== 0) return;
        this.addItemInfo.totalList = data.datas || {};
      });
    },
    // 增值项
    handleAddItemOperation() {
      let list = [];
      let addItemInfo = this.addItemInfo;
      const key = this.curBox.boxData.packageCode + "&" + this.sku;
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
      if (!realList.length) return;
      // 扫描数据完显后再弹出提示
      this.addItemInfo.visible = true;
      this.playAudio();
    },
    // 弹窗关闭
    curSkuFocus() {
      this.$nextTick(() => {
        this.$refs.curSku.$refs.input.focus();
      });
    },
    valAddServiceOpen() {
      // this.valAddServiceInfo.packageCode = params.row.packageCode;
      this.valAddServiceInfo.visible = true;
    },
    // // 增值服务修改成功返回的数据
    // addSuccess(list) {
    //   let listToObj = this.$common.arrayToObj(list, 'sku');
    //   let boxData = this.curBox.boxData || {};
    //   let sortlist = boxData.sortingPackageGoodsResult || [];
    //   sortlist.forEach((item, index) => {
    //     let row = listToObj[item.sku];
    //     // let addItemList = this.addItemList[item.sku];
    //     // let temp = this.$common.arrayToObj(addItemList, 'resourceName');
    //     if (!row) return;
    //     // if ('vacuumizeProduct' in temp) {
    //     this.$set(this.curBox.boxData.sortingPackageGoodsResult[index], 'vacuumizeNumber', row.vacuumizeNumber);
    //     // }
    //     // if ('inventoryOverTime' in temp) {
    //     this.$set(this.curBox.boxData.sortingPackageGoodsResult[index], 'replacePackingNumber', row.replacePackingNumber);
    //     // }
    //   })
    // },
  },
  created() {
    let v = this;
    // 获取拣货单号
    let pickingGoodsNo = JSON.parse(localStorage.getItem("pickingGoodsNo"));
    if (pickingGoodsNo) v.pickingGoodsNo = pickingGoodsNo;

    v.getPackageSetting().finally(() => {
      if (v.addItemInfo.setting == "N") return;
      v.getAddItemOperation();
    });
    v.getPackList().then(() => {
      v.getPickingList();
    });
    if (!v.$store.state.erpConfig) getErpconfig();
  },
  computed: {
    // // 处理增值服务列表需要的数据
    // completeList() {
    //   let boxData = this.curBox.boxData || {};
    //   let sortlist = boxData.sortingPackageGoodsResult || [];
    //   return sortlist;
    // },
    // addItemList() {
    //   let boxData = this.curBox.boxData || {};
    //   let totalList = this.addItemInfo.totalList;
    //   let temp = {};
    //   this.completeList.forEach(item => {
    //     let addList = [];
    //     const key = boxData.packageCode + "&" + item.sku;
    //     Object.keys(totalList).forEach((k) => {
    //       if (key === k) addList = totalList[k];
    //     });
    //     temp[item.sku] = addList.filter(k => {
    //       return !['ottoMarketingProduct'].includes(k.resourceName);
    //     })
    //   })
    //   console.log(temp, 'temp')
    //   return temp;
    // },
  },
  watch: {
    "addItemInfo.visible": {
      handler(value) {
        if (value) return;
        this.curSkuFocus();
      },
      deep: true,
    },
  },
};
</script>
 
<style lang="less" scoped>
.pickHeader {
  width: 99%;
  height: 40px;
  margin: 10px auto;
  line-height: 40px;
  background-color: rgba(247, 150, 70, 1);
}

.skuInput {
  margin-left: 10px;
  margin-top: 15px;
  padding-left: 10px;
  height: 65px;
  line-height: 65px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: rgba(43, 120, 228, 1);
}

.showProductGoods {
  height: 457px;
  margin-top: 10px;
  padding-top: 20px;
  margin-left: 10px;
  background-color: rgba(215, 215, 215, 1);
  position: relative;

  .addItemOperation {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 40px;
    box-sizing: border-box;
    z-index: 999;
    background-color: #d7d7d7;

    .addItemOperation_content {
      height: 100%;
      background-color: #fff;
      border: 1px solid #e9e9e9;
      display: flex;
      flex-direction: column;
    }

    .addItemOperation_title {
      height: 25px;
      background: #dee6ee;
      line-height: 25px;
      padding: 0 6px;
      border-bottom: 1px solid #c5d2e1;
    }

    .addItemOperation_footer {
      text-align: center;
      margin: 10px 0;
    }
  }
}

.pickingGoods {
  width: 99%;
  margin: 10px auto;
}

.pickBox {
  float: left;
  width: 18%;
  height: 50px;
  margin-top: 5px;
  margin-bottom: 5px;
  border: 1px solid #000;
  font-weight: bold;
  margin-right: 2%;
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
  width: 96%;
  height: 200px;
  margin-left: 2%;
  padding: 15px 30px;
  background-color: #fff;
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

.showBoxNo {
  display: inline-block;
  width: 80px;
  height: 40px;
  border: 1px solid #000;
  margin-bottom: 10px;
  text-align: center;
  line-height: 40px;
  vertical-align: top;
}

.showbrandName {
  display: inline-block;
  margin-left: 15px;
  color: red;
  font-size: 30px;
  font-weight: bold;
  vertical-align: top;
}

.combinationTips {
  color: #d9001b;
  font-size: clamp(0.7rem, 1.1vw, 1.1rem);
  font-weight: bold;
  margin-top: 12px;
}
</style>
<style>
.ivu-table .demo-table-info-row td {
  background-color: #ebf7ff;
}
</style>
