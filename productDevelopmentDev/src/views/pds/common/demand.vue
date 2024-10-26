<template>
  <div>
    <Modal
      v-model="createDemand"
      title="新品开发详情"
      width="1100"
      :mask-closable="false"
      @on-visible-change="visibleChange"
      class="clearMarginAuto demand"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
      >
        <span>新品开发详情</span>
      </p>
      <demand-content
        :isShowBtn="false"
        ref="demand"
        :sortChoseDate="sortChoseDate"
        :stepsDate="stepsDate"
        :open="createDemand"
        @closeGetList="closeGetList"
      ></demand-content>
      <div
        slot="footer"
        v-if="$store.state.curNodeControl == 999" class="btn-box"
      >
        <!--保存多属性-->
        <Button
          type="primary"
          v-show="
            $store.state.baseInfo.erpProductId &&
            $store.state.demandBoxIndex === 1 &&
            $store.state.editTalg
          "
          @click="saveMultiple"
        >保存多属性
        </Button>
        <!---->

        <!-- 询价 -->
        <Button
          type="primary"
          v-show="
            $store.state.curNodeId === 3 &&
            $store.state.demandBoxIndex === 4 &&
            $store.state.addSupplierType === 'add'
          "
          @click="
            $refs.demand.$refs.commonInquiry.$refs.CommonAddSupplier.save()
          "
        >保存
        </Button>
        <Button
          type="primary"
          v-show="
            $store.state.curNodeId === 3 &&
            $store.state.demandBoxIndex === 4 &&
            $store.state.addSupplierType === 'edit'
          "
          @click="
            $refs.demand.$refs.commonInquiry.$refs.CommonAddSupplier.iditSave()
          "
        >保存
        </Button>
        <!---->

        <!--取样-->
        <Button
          type="primary"
          v-show="
            $store.state.productCurNodeId === 1 &&
            $store.state.demandBoxIndex === 5
          "
          @click="$refs.demand.$refs.commonSampling.save()"
        >保存质检类目
        </Button>
        <Button
          type="primary"
          v-show="$store.state.productCurNodeId === 1"
          @click="saveSampling(params)"
        >完成取样</Button>
        <Button
          type="primary"
          v-show="$store.state.productCurNodeId === 2"
          @click="auditingBtn(params, 'LC0003')"
        >审核取样
        </Button>
        <Button
          type="primary"
          v-show="$store.state.descriptionCurNodeId === 1"
          @click="
            auditingBtn(params, 'LC0004');
            saveDescription();
          "
        >完成描述
        </Button>
        <Button
          type="primary"
          v-show="$store.state.descriptionCurNodeId === 1"
          @click="saveDescription()"
        >保存描述</Button>
        <Button
          type="primary"
          v-show="$store.state.descriptionCurNodeId === 2"
          @click="auditingBtn(params, 'LC0004')"
        >审核描述
        </Button>
        <Button
          type="primary"
          v-show="$store.state.pictureCurNodeId === 1"
          @click="
            auditingBtn(params, 'LC0002');
            savePicture(true);
          "
        >完成图片
        </Button>
        <Button
          type="primary"
          v-show="$store.state.pictureCurNodeId === 1"
          @click="savePicture()"
        >保存图片</Button>
        <Button
          type="primary"
          v-show="$store.state.pictureCurNodeId === 2"
          @click="auditingBtn(params, 'LC0002')"
        >审核图片
        </Button>

        <template v-if="$store.state.curNodeId === 0">
          <Button
            type="primary"
            :loading="loadingObj.subloading"
            @click="productSubmit()"
          >提交需求
          </Button>
          <Button
            type="primary"
            :loading="loadingObj.saveloading"
            @click="productDraft()"
          >保存
          </Button>
          <Button
            type="primary"
            :loading="loadingObj.drafloading"
            @click="setInvalidProduct(params)"
          >作废
          </Button>
        </template>

        <Button
          type="primary"
          v-show="$store.state.curNodeId === 1"
          :loading="btnLoading"
          @click="auditingBtn(params)"
        >审核需求
        </Button>
        <Button
          type="primary"
          v-show="$store.state.curNodeId === 2"
          :loading="btnLoading"
          @click="auditingBtn(params)"
        >指派询价
        </Button>
        <Button
          type="primary"
          v-show="$store.state.curNodeId === 3"
          :loading="btnLoading"
          @click="saveSupplier(params)"
        >完成询价
        </Button>
        <Button
          type="primary"
          v-show="$store.state.curNodeId === 4"
          :loading="btnLoading"
          @click="auditingBtn(params)"
        >审核询价
        </Button>
        <Button
          type="primary"
          v-show="$store.state.curNodeId === 5"
          :loading="btnLoading"
          @click="generateSku(params)"
        >生成SKU
        </Button>
        <!--<Button type="primary" v-show="curNodeId===6">提交需求</Button>-->
        <Dropdown
          style="margin-left: 10px"
          v-show="$store.state.curNodeId === 6"
        >
          <Button type="primary">
            打回
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-show="
                $store.state.productCurNodeId === 1 ||
                $store.state.productCurNodeId === 2
              "
              @click.native="repulseBtn(params, 'LC0003')"
            >打回取样
            </DropdownItem>
            <DropdownItem
              v-show="
                $store.state.descriptionCurNodeId === 1 ||
                $store.state.descriptionCurNodeId === 2
              "
              @click.native="repulseBtn(params, 'LC0004')"
            >打回描述
            </DropdownItem>
            <DropdownItem
              v-show="
                $store.state.pictureCurNodeId === 1 ||
                $store.state.pictureCurNodeId === 2
              "
              @click.native="repulseBtn(params, 'LC0002')"
            >打回图片
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown
          style="margin-left: 10px"
          v-show="$store.state.curNodeId === 6"
        >
          <Button type="primary">
            转交
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-show="
                $store.state.productCurNodeId === 1 ||
                $store.state.productCurNodeId === 2
              "
              @click.native="transferBtn(params, 'LC0003')"
            >转交取样
            </DropdownItem>
            <DropdownItem
              v-show="
                $store.state.descriptionCurNodeId === 1 ||
                $store.state.descriptionCurNodeId === 2
              "
              @click.native="transferBtn(params, 'LC0004')"
            >转交描述
            </DropdownItem>
            <DropdownItem
              v-show="
                $store.state.pictureCurNodeId === 1 ||
                $store.state.pictureCurNodeId === 2
              "
              @click.native="transferBtn(params, 'LC0002')"
            >转交图片
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button
          type="primary"
          v-show="$store.state.curNodeId > 0 && $store.state.curNodeId != 6"
          @click="repulseBtn(params)"
        >打回
        </Button>
        <Button
          type="primary"
          v-show="$store.state.curNodeId > 0 && $store.state.curNodeId != 6"
          @click="transferBtn(params)"
        >转交
        </Button>
      </div>
      <div
        slot="footer"
        v-else
      >
        <div slot="footer">
          <!--保存多属性-->
          <Button
            type="primary"
            v-show="
              $store.state.baseInfo.erpProductId &&
              $store.state.demandBoxIndex === 1 &&
              $store.state.editTalg
            "
            @click="saveMultiple"
          >保存多属性
          </Button>
          <!--取消按钮-->
          <Button
            type="primary"
            @click="createDemand = false"
          >取消</Button>
        </div>
      </div>
    </Modal>
    <commonAssigned
      ref="commonAssigned"
      :productSubmitParams="productSubmitParams"
      @closeGetList="closeGetList"
    ></commonAssigned>
    <commonRepulse
      ref="commonRepulse"
      :productSubmitParams="productSubmitParams"
      @closeGetList="closeGetList"
    ></commonRepulse>
    <commonTransfer
      ref="commonTransfer"
      :productSubmitParams="productSubmitParams"
      @closeGetList="closeGetList"
    ></commonTransfer>
    <Modal
      v-model="generateSkuModal"
      title="生成SKU"
      width="850"
      class="clearMarginAuto"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
      >
        <span>生成SKU</span>
      </p>
      <Form
        ref="generateSkuRef"
        :model="generateSkuForm"
        class="co"
        :rules="generateSkuRules"
      >
        <FormItem prop="productName">
          <label slot="label">商品名称</label> <Input
            style="width: 300px"
            v-model.trim="generateSkuForm.productName"
          />
        </FormItem>
        <FormItem prop="productCode">
          <label slot="label">商品编号</label> <Input
            style="width: 300px"
            v-model.trim="generateSkuForm.productCode"
            @on-change="autoSkuMt"
          /> <span v-show="
              generateSkuForm.productGoodsList != null &&
              generateSkuForm.productGoodsList.length > 0
            ">
            <i-switch
              v-model="autoSku"
              title="根据商品编号自动更新sku"
              @on-change="autoSkuMt"
            ></i-switch>(根据商品编号自动更新sku)
          </span>
        </FormItem>
        <FormItem>
          <label slot="label">是否试卖</label>
          <i-switch v-model="generateSkuForm.saleStatus"></i-switch>
          <span class="red ml10">试卖之后会推送至erp和listing(如果已设置推送listing)</span>
        </FormItem>
        <!-- <FormItem >
             <label slot="label">推送至listing</label>
             <i-switch  v-model="sendToListing" disabled></i-switch>
           </FormItem>-->
        <local-buttons
          :data="tabsData"
          :value.sync="tabsVal"
        ></local-buttons>
        <Table
          class="mt15"
          v-show="
            tabsVal === 1 &&
            generateSkuForm.productGoodsList != null &&
            generateSkuForm.productGoodsList.length > 0
          "
          highlight-row
          :columns="skuColumn"
          :data="generateSkuForm.productGoodsList"
        ></Table>
      </Form>
      <Form
        v-show="tabsVal === 2"
        ref="generateSkuForm"
        :model="generateSkuForm"
        :rules="basicRuleValidate"
        :label-width="120"
        class="mt15"
      >
        <Row>
          <Col span="10">
          <FormItem label="采购员">
            <dyt-select
              v-model="generateSkuForm.purchaseUser"
              filterable
            >
              <Option
                v-for="(item, index) in purchaseUserList"
                :key="index"
                :value="item.userId"
              >{{ item.userName }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="是否带电">
            <RadioGroup v-model="generateSkuForm.isElectriferous">
              <Radio label="0">
                <span>带电</span>
              </Radio>
              <Radio label="1">
                <span>不带电</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="中文配货名称">
            <Input
              v-model.trim="generateSkuForm.distributionCnName"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="英文配货名称">
            <Input
              v-model.trim="generateSkuForm.distributionEnName"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="商品中文报关名称">
            <Input
              v-model.trim="generateSkuForm.declareCnName"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="商品英文报关名称">
            <Input
              v-model.trim="generateSkuForm.declareEnName"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="海关编码">
            <Input
              v-model.trim="generateSkuForm.customCode"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col
            span="12"
            style="display: flex"
            v-if="!generateSkuForm.productGoodsList"
          >
          <FormItem label="UPC">
            <Input
              v-model.trim="generateSkuForm.productUpc"
              :maxlength="100"
              style="width: 213px"
            />
          </FormItem>
          <span
            style="
                color: #2d8cf0;
                cursor: pointer;
                margin-left: 6px;
                position: relative;
                top: 8px;
              "
            v-if="generateTalg"
            @click="generateUpc"
          >生成</span>
          </Col>
          <Col
            span="10"
            v-if="!generateSkuForm.productGoodsList"
          >
          <FormItem label="EAN">
            <Input
              v-model.trim="generateSkuForm.productEan"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col
            span="10"
            v-if="!generateSkuForm.productGoodsList"
          >
          <FormItem label="ISBN">
            <Input
              v-model.trim="generateSkuForm.productIsbn"
              :maxlength="100"
            />
          </FormItem>
          </Col>
          <Col span="10">
          <FormItem label="开发员">
            <dyt-select
              v-model="generateSkuForm.developerBy"
              filterable
            >
              <Option
                v-for="(item, index) in developerUserList"
                :key="index"
                :value="item.userId"
              >{{ item.userName }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
          <!--<Col span="10">
              <FormItem label="特性标签">
                <Input v-model.trim="generateSkuForm.featureTags"  :maxlength="300"/>
              </FormItem>
            </Col>-->
          <Col span="18">
          <FormItem label="特性标签">
            <dyt-select
              v-model="generateSkuForm.featureTags"
              multiple
              filterable
            >
              <Option
                v-for="(item, index) in labelList"
                :key="index"
                :value="item.labelId"
              >{{ item.labelName }}
              </Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="24">
          <!-- 产品类型 :disabled="isDisabled"-->
          <FormItem label="产品类型">
            <CheckboxGroup
              v-model="generateSkuForm.productGoodsAcceptableTc"
              style="width: 510px"
              @on-change="productTypeChange"
            >
              <Checkbox
                v-for="(item, index) in productTypeList"
                :key="index"
                :label="item.value"
              >
                <span>{{ item.name }}</span>
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
          </Col>
          <Col span="24">
          <FormItem
            label="来源URL"
            prop="monitorLink"
          >
            <Input
              v-model.trim="generateSkuForm.monitorLink"
              style="width: 400px"
            /> <span
              style="
                  margin: 0 10px;
                  color: #2d8cf0;
                  cursor: pointer;
                  font-size: 13px;
                "
              @click="ReferenceLink"
            >使用参考链接</span> <span
              style="color: #2d8cf0; cursor: pointer; font-size: 13px"
              @click="ProductLinks"
            >使用询价产品链接</span>
          </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button
          type="text"
          @click="generateSkuModal = false"
        >取消</Button>
        <Button
          type="primary"
          @click="saveSku"
        >确定</Button>
      </div>
    </Modal>
    <!--生成UPC弹窗-->
    <Modal
      v-model="upcTalg"
      :mask-closable="false"
      title="生成UPC"
      class="clearMarginAuto"
      class-name="modal_codeStyle"
      width="650"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
      >
        <span>生成UPC</span>
      </p>
      <div
        style="margin-bottom: 15px;"
        v-for="(item, index) in upc_data"
        :key="index"
      >
        <label
          slot="label"
          :class="item.isInitId !=1 ? 'redDot' : ''"
          v-if="(item.isInitId !=1) || item.initIdCode !== null"
          style="margin-right: 8px; width: 130px; text-align: right; display: inline-block;"
        >{{ item.upcCodeName }}</label>
        <dyt-select
          v-if="item.isInitId !=1"
          v-model="item.upcCode"
          style="width:200px;"
          filterable
        >
          <Option
            v-for="(ele,index) in item.upcSettingItemBoList"
            :value="ele.upcCode"
            :key="index"
          >{{ ele.upcCodeName }}
          </Option>
        </dyt-select> <span v-else>{{
          item.initIdCode === null
          ? ''
          : item.initIdCode
                               }}</span>
        <div
          style="display: inline-block;"
          v-if="item.isInitId !=1 && item.upcCode != null"
        >
          <span style="margin-left:12px;">编码：</span> <span>{{ item.upcCode }}</span>
        </div>
      </div>
      <div
        slot="footer"
        style="text-align: center;"
      >
        <Button
          @click="setUpcBtn"
          type="primary"
        >确认</Button>
        <Button @click="upcTalg = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import demandContent from "../stockUp/demandContent";
import commonAssigned from "../stockUp/commonAssigned"; // 指派弹窗
import commonRepulse from "../stockUp/commonRepulse"; // 打回弹窗
import commonTransfer from "../stockUp/commonTransfer"; // 转交弹窗
import api from "@/api/api";

export default {
  name: "demand", // 共用弹窗
  components: {
    demandContent,
    commonAssigned,
    commonRepulse,
    commonTransfer,
  },
  mixins: [CommonMixin],
  props: ["params"],
  created() {
    this.getDeveloperData();
  },
  mounted() {
    this.demandMinHei();
    this.getAllUserMt();
  },
  data() {
    let v = this;
    return {
      upc_index: null,
      tabsData: [
        {
          label: "多属性",
          value: 1,
        },
        {
          label: "基本资料",
          value: 2,
        },
      ],
      labelList: [],
      purchaseUserList: [],
      developerUserList: [], // 开发员
      basicRuleValidate: {},
      tabsVal: 1,
      autoSku: false,
      btnLoading: false,
      generateSkuModal: false,
      generateSkuForm: {
        distributionCnName: "", // 中文配货名称
        distributionEnName: "", // 英文配货名称
        declareCnName: "", // 商品中文报关名称
        declareEnName: "", // 商品英文报关名称
        customCode: "", // 海关编码
        featureTags: [], // 特性标签
        purchaseUser: "", // 采购员
        developerBy: "", // 开发员
        productUpc: "",
        productEan: "",
        productIsbn: "",
        isElectriferous: "1",
        productId: "",
        sendToListing: 0,
        productCode: "",
        productName: "",
        saleStatus: true,
        productGoodsList: [
          {
            goodsSku: "",
            productGoodsId: "",
            goodsUpc: "",
            goodsEan: "",
            goodsIsbn: "",
          },
        ],
        productGoodsAcceptableTc: ["01"],
        monitorLink: "",
      },
      skuColumn: [
        {
          title: "SKU",
          minWidth: 110,
          render(h, params) {
            return h("Input", {
              props: {
                value: params.row.goodsSku,
              },
              on: {
                input: (val) => {
                  v.$set(
                    v.generateSkuForm.productGoodsList[params.index],
                    "goodsSku",
                    val
                  );
                },
              },
            });
          },
        },
        {
          title: "UPC",
          minWidth: 160,
          render(h, params) {
            return h(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                },
              },
              [
                h("Input", {
                  props: {
                    value: params.row.goodsUpc,
                  },
                  on: {
                    input: (val) => {
                      v.$set(
                        v.generateSkuForm.productGoodsList[params.index],
                        "goodsUpc",
                        val
                      );
                    },
                  },
                }),
                v.generateTalg
                  ? h(
                    "div",
                    {
                      style: {
                        color: "#2D8CF0",
                        cursor: "pointer",
                        width: "35px",
                        lineHeight: "32px",
                        marginLeft: "2px",
                      },
                      on: {
                        click: () => {
                          v.upc_index = params.index;
                          v.generateUpc();
                        },
                      },
                    },
                    "生成"
                  )
                  : "",
              ]
            );
          },
        },
        {
          title: "EAN",
          minWidth: 90,
          render(h, params) {
            return h("Input", {
              props: {
                value: params.row.goodsEan,
              },
              on: {
                input: (val) => {
                  v.$set(
                    v.generateSkuForm.productGoodsList[params.index],
                    "goodsEan",
                    val
                  );
                },
              },
            });
          },
        },
        {
          title: "ISBN",
          minWidth: 90,
          render(h, params) {
            return h("Input", {
              props: {
                value: params.row.goodsIsbn,
              },
              on: {
                input: (val) => {
                  v.$set(
                    v.generateSkuForm.productGoodsList[params.index],
                    "goodsIsbn",
                    val
                  );
                },
              },
            });
          },
        },
      ],
      skuDate: [],
      generateSkuRules: {
        productName: {
          required: true,
          message: "商品名称不能为空",
          trigger: "blur",
        },
        productCode: {
          required: true,
          message: "商品编号不能为空",
          trigger: "blur",
        },
      },
      nextStep: false,
      createDemand: false,
      demandIsOpen: false,
      isShowBtn: true,
      productSubmitParams: {},
      sortChoseDate: [
        {
          tit: "需求详情",
          id: 0,
          isSave: false,
          selected: true,
        },
        {
          tit: "基本信息",
          id: 7,
          isSave: false,
          selected: true,
        },
        {
          tit: "多属性",
          id: 1,
          isSave: false,
          selected: false,
        },
        {
          tit: "图片信息",
          id: 2,
          isSave: false,
          selected: false,
        },
        {
          tit: "详细描述",
          id: 3,
          isSave: false,
          selected: false,
        },
        {
          tit: "询价",
          id: 4,
          isSave: false,
          selected: false,
        },
        {
          tit: "取样",
          id: 5,
          isSave: false,
          selected: false,
        },
        {
          tit: "操作日志",
          id: 6,
          isSave: false,
          selected: false,
        },
      ],
      rowDate: {},
      stepsDate: [
        {
          title: "提交需求",
          finish: "do",
        },
        {
          title: "询价",
        },
        {
          title: "生成SKU",
        },
        {
          title: [
            {
              tit: "<p>" + "处理图片" + "</p>",
            },
            {
              tit: "<p>" + "取样" + "</p>",
            },
            {
              tit: "<p>" + "编辑描述" + "</p>",
            },
          ],
          style: { "margin-top": "-30px" },
        },
        {
          title: "确认销售",
        },
      ],
      upcTalg: false,
      upc_data: [],

      loadingObj: {
        saveloading: false,
        subloading: false,
        drafloading: false,
      },
    };
  },
  methods: {
    validSku(productCode) {
      return new Promise((resolve) => {
        let v = this;
        v.$axios
          .get(api.checkListingSkuExist + "?productCode=" + productCode)
          .then((res) => {
            if (res.code === 0) {
              resolve(res.datas);
            }
          })
          .catch(() => {});
      });
    },
    getAllUserMt() {
      let v = this;
      v.$axios
        .get(api.get_userInfoCommon)
        .then((res) => {
          if (res.code === 0) {
            v.$store.commit("purchaseUserList", res.datas);
            v.purchaseUserList = res.datas;
          }
        })
        .catch(() => {});
    },
    getDeveloperData() {
      let v = this;
      // erp 3.0 开发人员
      let ierpStatus =
        localStorage.getItem("ierpStatus") || v.$store.state.ierpStatus;
      if (ierpStatus === "1") {
        v.$axios
          .get(api.get_developer + "commodityDeveloper")
          .then((res) => {
            if (res.code === 0) {
              v.$store.commit("developerUserList", res.datas);
              v.developerUserList = res.datas;
            }
          })
          .catch(() => {});
      } else {
        // erp 2.0 的开发人员
        v.$axios
          .get(api.get_userInfoCommon)
          .then((res) => {
            if (res.code === 0) {
              v.$store.commit("developerUserList", res.datas);
              v.developerUserList = res.datas;
            }
          })
          .catch(() => {});
      }
    },
    saveSampling(params) {
      let v = this;
      let valid = true;
      v.$refs.demand.$refs.commonSampling.listCheckInfo.forEach((item) => {
        if (item.categoryName !== "") {
          valid = false;
        }
        item.listCheckDetail.forEach((tail) => {
          if (tail.checkItemName !== "" || tail.checkItemStandard !== "") {
            valid = false;
          }
        });
      });
      if (valid) {
        v.auditingBtn(params, "LC0003");
      } else {
        v.$refs.demand.$refs.commonSampling.save(
          v.auditingBtn,
          params,
          "LC0003"
        );
      }
    },
    sendDate() {},
    demandMinHei() {
      let v = this;
      if (v.domHeight < 700) {
        let dom = document.getElementsByClassName("ivu-modal-body");
        for (let i = 0; i < dom.length; i++) {
          dom[i].style.height = "400px";
        }
      }
    },
    setInvalidProduct(params) {
      let v = this;
      let data = {
        fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
        flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
        sendType: 0, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
      };
      this.$Modal.confirm({
        title: "作废需求",
        content: "<p>" + "请确认是否作废该需求" + "</p>",
        onOk: () => {
          v.loadingObj.drafloading = true;
          v.$axios
            .post(api.getNextTodoInfo, data)
            .then((res) => {
              if (res.code === 0) {
                v.productSubmitParams = res.datas;
                v.$axios
                  .post(api.setInvalid, {
                    productId: v.$store.state.createId, // 新品需求ID，必需
                    fromNodeId: v.productSubmitParams.fromNodeId,
                    flowInstanceId: v.productSubmitParams.flowInstanceId, // 流程实例ID，必需
                  })
                  .then((res) => {
                    if (res.code === 0) {
                      v.$msg.success("作废成功");
                      v.createDemand = false;
                      v.$emit("getList");
                    } else {
                      v.$msg.error({
                        content: "找不到流程接收人，请联系管理员进行流程配置",
                        duration: 5,
                      });
                    }
                  })
                  .finally(() => {
                    v.loadingObj.drafloading = false;
                  });
              } else {
                v.loadingObj.drafloading = false;
              }
            })
            .catch(() => {
              v.loadingObj.drafloading = false;
              v.$msg.error("请求失败");
            });
        },
        onCancel: () => {},
      });
    },
    autoSkuMt() {
      let v = this;
      if (v.autoSku) {
        v.generateSkuForm.productGoodsList.forEach((item) => {
          if (item.goodsSku.indexOf("_") > -1) {
            item.goodsSku = item.goodsSku.replace(
              /.*_/,
              v.generateSkuForm.productCode + "_"
            );
          } else if (item.goodsSku.indexOf("-") > -1) {
            item.goodsSku = item.goodsSku.replace(
              /.*-/,
              v.generateSkuForm.productCode + "-"
            );
          } else {
            item.goodsSku = v.generateSkuForm.productCode;
          }
        });
      }
    },
    saveSupplier(params) {
      let v = this;
      if (
        v.$store.state.curNodeId === 3 &&
        v.$store.state.demandBoxIndex === 4 &&
        v.$store.state.addSupplierType === "add"
      ) {
        v.$refs.demand.$refs.commonInquiry.$refs.CommonAddSupplier.save(
          function () {
            v.auditingBtn(params);
          }
        );
      } else if (
        v.$store.state.curNodeId === 3 &&
        v.$store.state.demandBoxIndex === 4 &&
        v.$store.state.addSupplierType === "edit"
      ) {
        v.$refs.demand.$refs.commonInquiry.$refs.CommonAddSupplier.iditSave(
          function () {
            v.auditingBtn(params);
          }
        );
      } else {
        if (v.$refs.demand.$refs.commonInquiry.inquiryDate.length < 1) {
          v.$msg.error({
            content: "完成询价失败,没有供应商报价信息,请先添加供应商报价信息",
            duration: 5,
          });
        } else {
          let valid = false;
          v.$refs.demand.$refs.commonInquiry.inquiryDate.forEach((item) => {
            if (item.isDefault === 1) {
              valid = true;
            }
          });
          if (valid) {
            v.auditingBtn(params);
          } else {
            v.$msg.error({
              content: "请设置默认供应商",
              duration: 5,
            });
          }
        }
      }
    },
    closeGetList() {
      this.createDemand = false;
      this.$emit("getList");
    },
    saveDescription() {
      this.$refs.demand.$refs.description.save();
    },
    savePicture(data) {
      let v = this;
      if (data) {
        // 只有完成才推送
        let erpStatus =
          v.$store.state.isCheckedSendErp === null
            ? 0
            : v.$store.state.isCheckedSendErp;
        v.$axios
          .post(api.setErpPictureStatus, {
            productId: v.$store.state.createId, // 需求ID
            sendErpPicture: erpStatus, // 是否推送图片至erp，0否，1是
          })
          .then(() => {});
      }
      v.$refs.demand.$refs.gallery.save();
    },
    saveSku() {
      let v = this;
      v.$refs.generateSkuRef.validate((valid) => {
        if (valid) {
          let params = Object.assign({}, v.generateSkuForm);
          if (params.saleStatus) {
            params.saleStatus = 1;
          } else {
            params.saleStatus = null;
          }
          params.productId = v.$store.state.createId;
          params.productGoodsAcceptableTc = v.generateSkuForm.productGoodsAcceptableTc.join(
            ","
          );
          params.featureTags = v.generateSkuForm.featureTags.join(",");
          if (v.generateSkuForm.sendToListing) {
            v.validSku(params.productCode).then((data) => {
              if (data === 0) {
                v.$axios
                  .post(api.saveGoodsSku, params)
                  .then((res) => {
                    if (res.code === 0) {
                      v.$store.commit(
                        "sendToListing",
                        v.generateSkuForm.sendToListing
                      );
                      v.$store.commit(
                        "sendSaleStatus",
                        v.generateSkuForm.saleStatus
                      );
                      v.auditingBtn(v.rowDate);
                      v.generateSkuModal = false;
                    }
                  })
                  .catch(() => {});
              } else {
                v.$msg.error("sku已存在，请修改sku");
              }
            });
          } else {
            v.$axios
              .post(api.saveGoodsSku, params)
              .then((res) => {
                if (res.code === 0) {
                  v.$store.commit(
                    "sendToListing",
                    v.generateSkuForm.sendToListing
                  );
                  v.$store.commit(
                    "sendSaleStatus",
                    v.generateSkuForm.saleStatus
                  );
                  v.auditingBtn(v.rowDate);
                  v.generateSkuModal = false;
                }
              })
              .catch(() => {});
          }
          /* v.$axios.post(api.saveGoodsSku, params)
           .then(res => {
           if (res.code === 0) {
           v.$store.commit('sendToListing', v.generateSkuForm.sendToListing);
           v.$store.commit('sendSaleStatus', v.generateSkuForm.saleStatus);

           v.auditingBtn(v.rowDate);
           v.generateSkuModal = false;
           }
           }).catch(err => {

           }); */
        }
      });
    },
    getConfigList() {
      /**
       * 获取流程配置
       * */
      let v = this;
      return new Promise((resolve) => {
        v.$axios.get(api.manageList + "?flowId=QB").then((response) => {
          if (response.code === 0) {
            resolve(response.datas);
          }
        });
      });
    },
    generateSku(params) {
      let v = this;
      v.getConfigList().then((response) => {
        let data = response.filter((i) => i.nodeId === 5)[0].otherConfigJson;
        if (
          data &&
          JSON.parse(data).thirdCreateSkuCheck &&
          JSON.parse(data).thirdCreateSkuUrl
        ) {
          window.location.href = JSON.parse(data).thirdCreateSkuUrl;
        } else {
          v.rowDate = params;
          v.$axios
            .get(api.generatingSku + "?productId=" + v.$store.state.createId)
            .then((res) => {
              if (res.code === 0) {
                v.generateSkuModal = true;
                v.generateSkuForm.productName = res.datas.productName;
                v.generateSkuForm.productCode = res.datas.productCode;
                v.generateSkuForm.productGoodsList =
                  res.datas.variationNameResultList;
                v.sendToListing = res.datas.sendToListing === 1;
                if (v.generateSkuForm.productGoodsList != null) {
                  v.skuColumn = [
                    {
                      title: "SKU",
                      minWidth: 110,
                      fixed: "left",
                      render(h, params) {
                        return h("Input", {
                          props: {
                            value: params.row.goodsSku,
                          },
                          on: {
                            input: (val) => {
                              v.$set(
                                v.generateSkuForm.productGoodsList[
                                  params.index
                                ],
                                "goodsSku",
                                val
                              );
                            },
                          },
                        });
                      },
                    },
                    {
                      title: "UPC",
                      minWidth: 160,
                      render(h, params) {
                        return h(
                          "div",
                          {
                            style: {
                              display: "flex",
                              alignItems: "center",
                            },
                          },
                          [
                            h("Input", {
                              props: {
                                value: params.row.goodsUpc,
                              },
                              on: {
                                input: (val) => {
                                  v.$set(
                                    v.generateSkuForm.productGoodsList[
                                      params.index
                                    ],
                                    "goodsUpc",
                                    val
                                  );
                                },
                              },
                            }),
                            v.generateTalg
                              ? h(
                                "div",
                                {
                                  style: {
                                    color: "#2D8CF0",
                                    cursor: "pointer",
                                    width: "35px",
                                    lineHeight: "32px",
                                    marginLeft: "2px",
                                  },
                                  on: {
                                    click: () => {
                                      v.upc_index = params.index;
                                      v.generateUpc();
                                    },
                                  },
                                },
                                "生成"
                              )
                              : "",
                          ]
                        );
                      },
                    },
                    {
                      title: "EAN",
                      minWidth: 90,
                      render(h, params) {
                        return h("Input", {
                          props: {
                            value: params.row.goodsEan,
                          },
                          on: {
                            input: (val) => {
                              v.$set(
                                v.generateSkuForm.productGoodsList[
                                  params.index
                                ],
                                "goodsEan",
                                val
                              );
                            },
                          },
                        });
                      },
                    },
                    {
                      title: "ISBN",
                      minWidth: 90,
                      render(h, params) {
                        return h("Input", {
                          props: {
                            value: params.row.goodsIsbn,
                          },
                          on: {
                            input: (val) => {
                              v.$set(
                                v.generateSkuForm.productGoodsList[
                                  params.index
                                ],
                                "goodsIsbn",
                                val
                              );
                            },
                          },
                        });
                      },
                    },
                  ];
                  res.datas.variationNameResultList[0].variTypeNameList.forEach(
                    (item, index) => {
                      v.skuColumn.push({
                        title: item,
                        minWidth: 90,
                        render(h, params) {
                          return h("div", params.row.variationNameList[index]);
                        },
                      });
                    }
                  );
                } else {
                  v.generateSkuForm.productGoodsList = [];
                  v.generateSkuForm.productUpc = "";
                  v.generateSkuForm.productEan = "";
                  v.generateSkuForm.productIsbn = "";
                }
                v.$set(
                  v.generateSkuForm,
                  "productGoodsList",
                  res.datas.variationNameResultList
                );
                // v.generateSkuForm.productGoodsList
              } else {
                v.$msg.error("请求失败");
              }
            });
        }
      });
    },
    // 提交需求
    productSubmit() {
      this.loadingObj.subloading = true;
      this.$refs.demand.productSubmitMt().finally(() => {
        this.loadingObj.subloading = false;
      });
    },
    // 保存
    productDraft() {
      this.loadingObj.saveloading = true;
      this.$refs.demand
        .saveSectionBtn()
        .then(() => {
          this.$msg.success("保存成功");
        })
        .finally(() => {
          this.loadingObj.saveloading = false;
        });
    },
    auditingBtn(params, flow) {
      let v = this;
      let data = {};
      v.btnLoading = true;
      if (flow) {
        params.row.flowTodoInfoList.forEach((item) => {
          if (item.flowId === flow) {
            data = {
              fromNodeId: item.currentNodeId, // 当前节点ID，必需
              flowInstanceId: item.flowInstanceId, // 流程实例ID，必需
              sendType: 0, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
            };
          }
        });
      } else {
        data = {
          fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
          flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
          sendType: 0, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
        };
      }
      v.$axios.post(api.getNextTodoInfo, data).then((res) => {
        v.btnLoading = false;
        if (res.code === 0) {
          v.productSubmitParams = res.datas;
          // 指派的人只有一个的时候 无需选择 直接跳到下一个流程
          // 下个流程无需指派的 直接跳到下一个流程
          // fromNodeId 4 需指定供应商 直接跳到下一个流程
          if (!(res.datas.flowId === 'LC0001' && res.fromNodeId === 4) &&
            (res.datas.receiverList === null || (res.datas.receiverList && res.datas.receiverList.length === 1))) {
            v.$refs.commonAssigned.productSubmitParams = res.datas;
            if (res.datas.receiverList) {
              v.$refs.commonAssigned.receiverVal = res.datas.receiverList[0].userId;
            }
            v.$refs.commonAssigned.submitParams();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5,
            });
          }
          // v.createDemand=false;
          this.$emit('getList');
        } else {
          v.$msg.error({
            content: '找不到流程接收人，请联系管理员进行流程配置',
            duration: 5
          });
        }
      }).catch(() => {
        v.btnLoading = false;
      });
    },
    repulseBtn(params, flow) {
      let v = this;
      let data = {};
      if (flow) {
        params.row.flowTodoInfoList.forEach((item) => {
          if (item.flowId === flow) {
            data = {
              fromNodeId: item.currentNodeId, // 当前节点ID，必需
              flowInstanceId: item.flowInstanceId, // 流程实例ID，必需
              sendType: 1, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
            };
          }
        });
      } else {
        data = {
          fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
          flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
          sendType: 1, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
        };
      }
      v.$Spin.show();
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
            v.$refs.commonRepulse.operating = true;
            v.$refs.commonRepulse.$refs.operatingFrom.resetFields();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5,
            });
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    transferBtn(params, flow) {
      let v = this;
      let data = {};
      if (flow) {
        params.row.flowTodoInfoList.forEach((item) => {
          if (item.flowId === flow) {
            data = {
              fromNodeId: item.currentNodeId, // 当前节点ID，必需
              flowInstanceId: item.flowInstanceId, // 流程实例ID，必需
              sendType: 3, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
            };
          }
        });
      } else {
        data = {
          fromNodeId: params.row.flowTodoInfoList[0].currentNodeId, // 当前节点ID，必需
          flowInstanceId: params.row.flowTodoInfoList[0].flowInstanceId, // 流程实例ID，必需
          sendType: 3, // 流程发送类别：0提交，1打回上级，2打回发起人，3转交，4作废
        };
      }
      v.$Spin.show();
      v.$axios
        .post(api.getNextTodoInfo, data)
        .then((res) => {
          v.$Spin.hide();
          if (res.code === 0) {
            v.productSubmitParams = res.datas;
            v.$refs.commonTransfer.operating = true;
            v.$refs.commonTransfer.$refs.operatingFrom.resetFields();
          } else {
            v.$msg.error({
              content: "找不到流程接收人，请联系管理员进行流程配置",
              duration: 5,
            });
          }
        })
        .catch(() => {
          v.$Spin.hide();
        });
    },
    visibleChange(n) {
      if (n) {
        this.demandIsOpen = true;
        this.getAllUserMt(); // 查询当前商户下的所有用户 固定执行人接口
        this.getProductLabelInfoApi().then((data) => {
          this.labelList = data;
          this.$store.commit("labelList", data);
        });
        this.setNav();
        this.$store.commit("addSupplierType", ""); // 清除新增供货商按钮
        this.$store.commit("demandIsOpen", this.demandIsOpen);
        // 设置多属性图片 在图片流程只加载一次
        if (
          this.$store.state.curNodeId === 6 &&
          this.$store.state.pictureCurNodeId === 1
        ) {
          this.$refs.demand.$refs.gallery.getImg();
        }
      } else {
        this.demandIsOpen = false;
        this.$store.commit("demandIsOpen", this.demandIsOpen);
      }
    },
    setNav() {
      let v = this;
      let flowInstance = v.$store.state.flowInstance;
      let valid = false;
      v.sortChoseDate.forEach((item) => {
        if (item.id === 7) {
          valid = true;
        }
      });
      if (flowInstance.length === 1) {
        if (valid) {
          v.sortChoseDate.forEach((item, index) => {
            if (item.id === 7) {
              v.sortChoseDate.splice(index, 1);
            }
          });
        }
      } else {
        if (!valid) {
          v.sortChoseDate.splice(1, 0, {
            tit: "基本信息",
            id: 7,
            isSave: false,
            selected: true,
          });
        }
      }
    },
    setStep() {
      let v = this;
      let flowInstance = v.$store.state.flowInstance;
      v.stepsDate = [
        {
          title: "提交需求",
          finish: "do",
        },
        {
          title: "询价",
        },
        {
          title: "生成SKU",
        },
        {
          title: [
            {
              tit: "<p>" + "处理图片" + "</p>",
            },
            {
              tit: "<p>" + "取样" + "</p>",
            },
            {
              tit: "<p>" + "编辑描述" + "</p>",
            },
          ],
          style: { "margin-top": "-30px" },
        },
        {
          title: "确认销售",
        },
      ];
      if (
        flowInstance !== undefined &&
        flowInstance.length === 1 &&
        flowInstance[0].flowId === "LC0001"
      ) {
        if (
          flowInstance[0].currentNodeId >= 2 &&
          flowInstance[0].currentNodeId <= 4
        ) {
          v.stepsDate[0].finish = "finish";
          v.stepsDate[1].finish = "do";
        } else if (flowInstance[0].currentNodeId === 5) {
          v.stepsDate[0].finish = "finish";
          v.stepsDate[1].finish = "finish";
          v.stepsDate[2].finish = "do";
        } else if (flowInstance[0].currentNodeId === 1) {
          v.stepsDate[0].finish = "do";
        } else if (flowInstance[0].currentNodeId === 0) {
          v.$refs.demand.$refs.attriButesRef.getQueryVariTypeM();
          v.$refs.demand.$refs.attriButesRef.getVariList();
          v.$refs.demand.$refs.gallery.getImg();
          v.$refs.demand.$refs.description.queryDescriptionMt();
        }
      } else {
        v.stepsDate[0].finish = "finish";
        v.stepsDate[1].finish = "finish";
        v.stepsDate[2].finish = "finish";
        let fin = false;
        if (flowInstance === undefined || flowInstance.length == 0) {
          return;
        }
        flowInstance.forEach((item) => {
          if (item.flowId === "LC0002") {
            v.stepsDate[3].title[0].finish = "do";
            if (item.currentNodeId === 3) {
              fin = true;
            } else {
              fin = false;
            }
          } else if (item.flowId === "LC0003") {
            v.stepsDate[3].title[1].finish = "do";
            if (item.currentNodeId === 3) {
              fin = true;
            } else {
              fin = false;
            }
          } else if (item.flowId === "LC0004") {
            v.stepsDate[3].title[2].finish = "do";
            if (item.currentNodeId === 3) {
              fin = true;
            } else {
              fin = false;
            }
          }
        });
        if (fin) {
          v.stepsDate[3].finish = "finish";
          v.stepsDate[4].finish = "do";
        } else {
          v.stepsDate[3].finish = "do";
        }
      }
    },
    // 保存多属性
    saveMultiple() {
      this.$refs.demand.$refs.attriButesRef.saveMultiple();
    },
    // 产品类型
    productTypeChange(value) {
      if (value.length > 1 && value.indexOf("01") > -1) {
        value.forEach((i, j) => {
          if (i === "01") {
            value.splice(j, 1);
          }
        });
      } else if (value.length === 0) {
        this.generateSkuForm.productGoodsAcceptableTc = ["01"];
      }
    },
    // 使用参考链接
    ReferenceLink() {
      let v = this;
      v.generateSkuForm.monitorLink = "";
      if (this.params) {
        if (v.params.row.referenceUrl) {
          v.generateSkuForm.monitorLink = v.params.row.referenceUrl;
        } else {
          v.$msg.warning({
            content: "当前的需求参考链接为空！",
            duration: 5,
          });
        }
      } else {
        v.$msg.error({
          content: "获取参考链接失败!",
          duration: 5,
        });
      }
    },
    // 使用询价产品链接
    ProductLinks() {
      let v = this;
      v.tableLoading = true;
      v.generateSkuForm.monitorLink = "";
      v.$axios
        .post(api.queryQuotationInfo, {
          productId: v.params.row.productId, // 产品id
          category: "XJ", // 新品开发需求类别(JBXX基本信息,DSX多属性,TPXX图片信息,XXMS详细描述,CZRZ操作日志,XJ询价,QY取样)
        })
        .then((res) => {
          v.tableLoading = false;
          if (res.code === 0) {
            let data = res.datas.quotationInfoList;
            if (data.length > 0) {
              data.map((item) => {
                if (item.isDefault === 1) {
                  if (item.productUrl) {
                    v.generateSkuForm.monitorLink = item.productUrl;
                  } else {
                    v.$msg.warning({
                      content: "当前的需求询价产品链接为空!",
                      duration: 5,
                    });
                  }
                }
              });
            }
          } else {
            v.$msg.error({
              content: "获取询价产品链接失败!",
              duration: 5,
            });
          }
        })
        .catch(() => {
          v.tableLoading = false;
          v.$msg.error({
            content: "获取询价产品链接失败!",
            duration: 5,
          });
        });
    },
    // 获取UPC的编码项数据
    generateUpc() {
      let v = this;
      v.upcTalg = true;
      let query = {
        initIdCount: null,
        isInitId: null,
        sort: null,
        upcCode: null,
        upcCodeName: "",
        upcId: null,
      };
      v.upc_data = [];
      v.$axios.post(api.post_queryProductUpcAll, query).then((response) => {
        if (response.code === 0) {
          let data = response.datas;
          if (data.length > 0) {
            data.map((item) => {
              item["upcCode"] = null;
            });
          }
          v.upc_data = data;
        }
      });
    },
    // 生成UPC弹窗的确认按钮
    setUpcBtn() {
      let upc_code = "";
      if (this.upc_data.length > 0) {
        for (let i = 0; i < this.upc_data.length; i++) {
          let talg = this.upc_data[i];
          if (talg.isInitId !== 1) {
            if (talg.upcCode === null) {
              this.$Message.error({
                content: `${talg.upcCodeName} 的编码项，属性和编码不能为空！`,
                duration: 4,
              });
              return false;
            }
            upc_code += talg.upcCode;
          } else {
            let initIdCode = talg.initIdCode === null ? "" : talg.initIdCode;
            upc_code = upc_code + initIdCode;
          }
        }
        if (!this.generateSkuForm.productGoodsList) {
          this.generateSkuForm.productUpc = upc_code;
        } else {
          this.$set(
            this.generateSkuForm.productGoodsList[this.upc_index],
            "goodsUpc",
            upc_code
          );
        }
        this.upcTalg = false;
        this.upc_data = [];
        this.$Message.success("生成UPC成功！");
      }
    },
  },
  computed: {
    sendToListing: {
      get() {
        let v = this;
        if (v.generateSkuForm.sendToListing === 0) {
          return false;
        } else {
          return true;
        }
      },
      set(val) {
        let v = this;
        v.generateSkuForm.sendToListing = val ? 1 : 0;
      },
    },
    generateTalg() {
      let sps_upc_restrictMerchantIds = this.$store.state.erpConfig
        .sps_upc_restrictMerchantIds;
      let merchantId = this.$store.state.erpConfig.merchant.merchantId;
      if (sps_upc_restrictMerchantIds.length > 0) {
        if (sps_upc_restrictMerchantIds.indexOf(merchantId) > -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
  },
  watch: {
    "$store.state.flowInstance"() {
      let v = this;
      v.setStep();
    },
    "$store.state.demandIsOpen": function (old, n) {
      if (!n) {
        // 弹窗事件
        let v = this;
        v.$refs.demand.demandBoxIndex = 0;
        v.setStep();
        if (v.params.row.saleStatus === 2) {
          v.stepsDate[4].finish = "finish";
        }
        // 0待提交需求,1待审核需求，2待分配询价，3待完成询价，4待审核询价，5待生成sku，6已生成sku
        if (v.params.row.assignStatus === 0) {
          v.$refs.demand.choseDemand(0);
          v.sortChoseDate.forEach((item) => {
            item.isSave = true;
          });
        } else if (v.params.row.assignStatus === 1) {
          v.$refs.demand.choseDemand(0);
        } else if (v.params.row.assignStatus === 2) {
          v.$refs.demand.choseDemand(4);
        } else if (v.params.row.assignStatus === 3) {
          v.$refs.demand.choseDemand(4);
        } else if (v.params.row.assignStatus === 4) {
          v.$refs.demand.choseDemand(4);
        } else if (v.params.row.assignStatus === 5) {
          v.$refs.demand.choseDemand(0);
        } else if (v.params.row.assignStatus === 6) {
          v.$refs.demand.choseDemand(0);
        }
        // queryStatus 0 待办任务,1 已办任务,2 完善产品资料,3 需求管理
        /* if(v.$parent.$data.allListFormValidate.queryStatus != 0 ){
         v.$store.commit('curNodeId',7);
         return ;
         }else if(v.params.row.assignStatus!==null){

         } */
        if (v.params.row.assignStatus !== null) {
          v.$store.commit("curNodeId", v.params.row.assignStatus);
        }
        if (
          v.params.row.productStatus !== null &&
          v.params.row.productStatus !== 0
        ) {
          // 取样
          v.$refs.demand.choseDemand(4);
          v.$store.commit("curNodeId", 6);
          v.$store.commit("productCurNodeId", v.params.row.productStatus);
        } else {
          v.$store.commit("productCurNodeId", null);
        }
        if (
          v.params.row.pictureStatus !== null &&
          v.params.row.pictureStatus !== 0
        ) {
          // 图片
          v.$refs.demand.choseDemand(2);
          v.$store.commit("curNodeId", 6);
          v.$store.commit("pictureCurNodeId", v.params.row.pictureStatus);
        } else {
          v.$store.commit("pictureCurNodeId", null);
        }
        if (
          v.params.row.descriptionStatus !== null &&
          v.params.row.descriptionStatus !== 0
        ) {
          // 描述
          v.$refs.demand.choseDemand(3);
          v.$store.commit("curNodeId", 6);
          v.$store.commit(
            "descriptionCurNodeId",
            v.params.row.descriptionStatus
          );
        } else {
          v.$store.commit("descriptionCurNodeId", null);
        }
      } else {
        this.$store.commit("curNodeControl", null);
      }
    },
  },
};
</script>

<style>
.demand .ivu-modal-body {
  overflow-x: hidden;
}

.ivu-modal-body {
  max-height: 600px;
  overflow-y: auto;
}
</style>
<style scoped>
.btn-box button{
  margin-left: 10px;
}
</style>
