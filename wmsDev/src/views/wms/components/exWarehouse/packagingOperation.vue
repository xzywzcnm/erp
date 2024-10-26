<template>
  <div class="packaging_operation">
    <div class="operation_box">
      <!--扫描-->
      <Card :bordered="false" class="card_box">
        <div slot="title" class="title_box">
          <h3 class="title">扫描</h3>
          <div class="options">
            <!--校对SKU-->
            <div class="options_item">
              <span class="txt">校对SKU</span>
              <Icon :class="packagingSetupForm.checkSku === 'Y' ? 'icon_yes' : 'icon_no'"
                :type="packagingSetupForm.checkSku === 'Y' ? 'md-checkmark' : 'md-close'" />
            </div>
            <!--校对身份码-->
            <div class="options_item">
              <span class="txt">身份码</span>
              <Icon :class="packagingSetupForm.mobileImie === 'Y' ? 'icon_yes' : 'icon_no'" :type="packagingSetupForm.mobileImie === 'Y' ? 'md-checkmark' : 'md-close'
                " />
            </div>
            <!--称重-->
            <div class="options_item">
              <span class="txt">称重</span>
              <Icon :class="packagingSetupForm.packingEnableWeight === 'Y' ? 'icon_yes' : 'icon_no'
                " :type="packagingSetupForm.packingEnableWeight === 'Y'
      ? 'md-checkmark'
      : 'md-close'
    " />
            </div>
            <!--录包材-->
            <div class="options_item">
              <span class="txt">录包材</span>
              <Icon :class="packagingSetupForm.enablePackageMaterial === 'Y'
                  ? 'icon_yes'
                  : 'icon_no'
                " :type="packagingSetupForm.enablePackageMaterial === 'Y'
      ? 'md-checkmark'
      : 'md-close'
    " />
            </div>
            <!--称重单位-->
            <div class="options_item">
              <span class="txt">{{ weightTitle }}</span>
              <Tooltip content="请保持系统重量单位和电子秤重量单位一致">
                <Icon class="help_icon" type="md-help-circle"></Icon>
              </Tooltip>
            </div>
            <!--设置-->
            <div class="options_item">
              <Icon class="icon_set" type="md-settings" @click="packagingSetup = true" />
            </div>
          </div>
        </div>
        <Form :model="formParameter" ref="formParameter" class="form_box" :label-width="180" onSubmit="return false">
          <!--识别号-->
          <FormItem label="识别号：" prop="identificationNumber">
            <Input v-model.trim="formParameter.identificationNumber" :element-id="'identificationNumber'"
              style="width: 300px" placeholder="可扫描出库单号、运单号、物流商单号" @on-keyup.13="identificationKey(1)"></Input>
            <Checkbox @on-change="saveLocalData" class="inline-block ml10" v-model="isSliceIdentificationNumber">截去
            </Checkbox>
            前
            <InputNumber v-model="sliceStartLength" @on-change="saveLocalData" :disabled="!isSliceIdentificationNumber"
              :precision="0" style="height: 24px" :min="0" :max="999999" class="w-40" size="small" />后
            <InputNumber :disabled="!isSliceIdentificationNumber" @on-change="saveLocalData" :precision="0"
              style="height: 24px" size="small" :min="0" :max="999999" class="w-40" v-model="sliceEndLength" />
            <Tooltip content="有些物流商面单扫描的运单号会带前缀或后缀，这样系统就无法识别运单号，勾选可截去相对应的前缀或后缀">
              <Icon type="md-help-circle" />
            </Tooltip>
          </FormItem>
          <!--扫描SKU/货品身份码-->
          <FormItem label="扫描SKU：" v-if="packagingSetupForm.checkSku === 'Y'" prop="scanSku">
            <Input v-model.trim="formParameter.scanSku" style="width: 300px" :element-id="'scanSku'" placeholder="可扫描SKU"
              @on-keyup.13="identificationKey(2)"></Input>
          </FormItem>
          <!--扫描身份码-->
          <FormItem label="扫描身份码：" v-if="packagingSetupForm.mobileImie === 'Y'" prop="mobileImie">
            <Input v-model.trim="formParameter.mobileImie" style="width: 300px" :element-id="'mobileImie'"
              placeholder="可扫描身份码" @on-keyup.13="identificationKey(5)"></Input>
          </FormItem>
          <!--包材-->
          <FormItem label="包材编号：" prop="packingMaterial" v-if="packagingSetupForm.enablePackageMaterial === 'Y'">
            <Input v-model.trim="formParameter.packingMaterial" style="width: 300px" :element-id="'packingMaterial'"
              placeholder="请输入包材编号" @on-keyup.13="identificationKey(3)"></Input>
          </FormItem>
          <!--称重-->
          <FormItem label="称重：" prop="weight" v-if="packagingSetupForm.packingEnableWeight === 'Y'">
            <Input v-model.trim="formParameter.weight" type="number" style="width: 300px" :element-id="'weight'" number
              :maxlength="15" @on-keyup.13="identificationKey(4)">
            <span slot="append">{{ packagingSetupForm.packingWeightUnit }}</span>
            </Input>
          </FormItem>
        </Form>
      </Card>
      <!--出库单-->
      <Card class="outbound_order" v-if="outboundOrderData.length > 0">
        <div slot="title" class="outbound_tiem">
          <h2 class="title">{{ "出库单号：" + deliveryOrder }}</h2>
          <!-- <h2 class="title" v-if="brandName" style="font-size: 24px;color: red;">{{ `品牌：${brandName}` }}</h2> -->
          <Button type="primary" @click="markExceptionBtn" v-if="getPermission('wmsPicking_markException')">标记异常
          </Button>
        </div>
        <Table highlight-row border max-height="650" :columns="outboundOrderColumn" :data="outboundOrderData"></Table>
      </Card>
    </div>
    <!--已扫描包裹-->
    <div class="table_box">
      <h2 class="title">已扫描包裹</h2>
      <Table highlight-row border max-height="700" :columns="packageColumn" :data="packageData"></Table>
    </div>
    <!--标记异常-->
    <Modal v-model="markException" class-name="markExceptionModal" title="标记异常" width="700" :mask-closable="false"
      @on-visible-change="packagingSetupChange">
      <div class="markException_box">
        <h2 class="title">{{ "出库单" + deliveryOrder + "异常" }}</h2>
        <Table highlight-row border :columns="markExceptionColumn" :data="markExceptionData"></Table>
      </div>
      <div slot="footer" style="text-align: center">
        <Button @click="markException = false">取消</Button>
        <Button type="primary" @click="markExceptionSubmit">确定</Button>
      </div>
    </Modal>
    <!--包装设置-->
    <Modal v-model="packagingSetup" class-name="packagingSetupModal" title="包装设置" width="700" :mask-closable="false"
      @on-visible-change="packagingSetupChange">
      <Form ref="packagingSetupForm" :model="packagingSetupForm">
        <h2 class="modelTit">发货设置</h2>
        <FormItem>
          <Checkbox v-model="packagingSetupForm.enablePackageMaterial" :true-value="'Y'" :false-value="'N'">需要录入包材
          </Checkbox>
        </FormItem>
        <FormItem>
          <Checkbox v-model="packagingSetupForm.checkSku" :true-value="'Y'" :false-value="'N'" @on-change="changeSku">
            校对SKU
          </Checkbox>
        </FormItem>
        <FormItem>
          <div style="display: flex; align-items: center">
            <Checkbox v-model="packagingSetupForm.packingEnableWeight" :true-value="'Y'" :false-value="'N'">需要称重
            </Checkbox>
            <Select v-model="packagingSetupForm.packingWeightUnit" size="small" style="width: 150px; margin-left: 20px">
              <Option v-for="(item, index) in weightTypeList" :key="index" :value="item.value">
                {{ item.label }}
              </Option>
            </Select>
          </div>
        </FormItem>
        <FormItem>
          <Checkbox v-model="packagingSetupForm.mobileImie" :true-value="'Y'" :false-value="'N'"
            @on-change="changeMobileImie">身份码
          </Checkbox>
        </FormItem>
        <h2 class="modelTit" style="margin-top: 30px">称重异常提醒设置</h2>
        <p>当包裹中的商品为：</p>
        <FormItem>
          <Checkbox class="inline-block" v-model="packagingSetupForm.packingSingleWeightRemark" :true-value="'Y'"
            :false-value="'N'">单品
          </Checkbox>
          <span>且包裹称重与商品资料重量误差大于等于</span>
          <RadioGroup v-model="disabledGroup">
            <Radio label="0">
              <Input style="width: 60px" v-model="packagingSetupForm.packingSingleTranscend" />
              克
            </Radio>
            <Radio label="1">
              <Input style="width: 60px" v-model="packagingSetupForm.packingSingleTranscendPercent" />
              %
            </Radio>
          </RadioGroup>
          <span>时系统将提示</span>
        </FormItem>
        <FormItem>
          <Checkbox class="inline-block" v-model="packagingSetupForm.packingMultiWeightRemark" :true-value="'Y'"
            :false-value="'N'">多品
          </Checkbox>
          <span>且包裹称重与商品资料重量误差大于等于</span>
          <RadioGroup v-model="disabled1Group">
            <Radio label="0">
              <Input style="width: 60px" v-model="packagingSetupForm.packingMultiTranscend" />
              克
            </Radio>
            <Radio label="1">
              <Input style="width: 60px" v-model="packagingSetupForm.packingMultiTranscendPercent" />
              %
            </Radio>
          </RadioGroup>
          <span>时系统将提示</span>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: center">
        <Button @click="packagingSetup = false">关闭</Button>
        <Button type="primary" @click="packagingSetupBtn"
          v-if="getPermission('packageSetting_savePackingOperationsSetting')">保存
        </Button>
      </div>
    </Modal>
    <!--称重异常提醒-->
    <Modal v-model="abnormalWeighing" title="称重异常提醒" width="600" :closable="false" class-name="abnormalWeighingModal"
      :mask-closable="false">
      <Alert type="warning" show-icon>{{ abnormalReminder.error }}</Alert>
      <Table :columns="abnormalWeighingColumns" :data="abnormalWeighingData" max-height="400"></Table>
      <div class="product_weight_box">
        <p class="line_txt">
          <span>产品重量小计(g)：</span>
          <span class="number">{{ abnormalReminder.productWeight }}</span>
        </p>
      </div>
      <div slot="footer" style="text-align: center; padding: 10px 0 20px 0">
        <Button @click="unpackingBtn">取消包装</Button>
        <Button type="primary" @click="continueDeliverGoods">继续包装</Button>
      </div>
    </Modal>
    <!-- 货品增值项操作 -->
    <addItemModal :modelVisible.sync="addItemInfo.visible" :data="addItemInfo" />
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import barcode_mixin from "@/components/mixin/barcode_mixin";
// import audio from '@/components/audios/huanbao.mp3'
import addItemModal from "@/views/components/addItemModal";

export default {
  name: "packagingOperation",
  components: { addItemModal },
  mixins: [Mixin, barcode_mixin],
  data() {
    let v = this;
    return {
      isSliceIdentificationNumber: false,
      sliceStartLength: 0,
      sliceEndLength: 0,
      formParameter: {
        identificationNumber: "",
        scanSku: "",
        mobileImie: "",
        packingMaterial: "",
        weight: "",
      },
      signSku: "",
      packageData: [],
      packageColumn: [
        {
          title: "NO",
          align: "center",
          width: 100,
          key: "packageNo",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "出库单号",
          align: "center",
          key: "packageCode",
        },
        {
          title: "跟踪号",
          align: "center",
          key: "trackingNumber",
        },
        {
          title: "SKU及数量",
          align: "center",
          key: "skuNumber",
          render: (h, params) => {
            let data = params.row.skuList;
            let talg = [];
            if (data.length > 0) {
              data.map((item) => {
                talg.push(
                  h(
                    "p",
                    {
                      style: {
                        lineHeight: "25px",
                      },
                    },
                    item.sku + " * " + item.quantity
                  )
                );
              });
            }
            return h("div", talg);
          },
        },
        {
          title: "包材名称",
          align: "center",
          key: "title",
        },
        {
          title: "重量(g)",
          align: "center",
          key: "weight",
        },
      ],
      outboundOrderData: [],
      outboundOrderColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          key: "outboundOrderNo",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "名称/规格",
          align: "center",
          key: "title",
        },
        {
          title: "SKU",
          align: "center",
          key: "sku",
        },
        {
          title: "应包装数量",
          align: "center",
          key: "quantity",
        },
        {
          title: "已扫数量",
          align: "center",
          key: "scannedQuantity",
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                size: "small",
                min: 0,
                max: params.row.quantity,
                value: params.row.scannedQuantity,
              },
              on: {
                input: (val) => {
                  v.outboundOrderData[params.index].scannedQuantity = val;
                  v.$nextTick(() => {
                    if (v.packagingSetupForm.checkSku === "Y") {
                      if (params.row.scannedQuantity === params.row.quantity) {
                        v.handerCheckSku();
                        // 包材
                        if (v.packagingSetupForm.enablePackageMaterial === "Y") {
                          v.$nextTick(() => {
                            v.getFocus("packingMaterial");
                          });
                        } else if (v.packagingSetupForm.packingEnableWeight === "Y") {
                          // 称重
                          v.$nextTick(() => {
                            v.getFocus("weight");
                          });
                        }
                      }
                    }
                  });
                },
              },
            });
          },
        },
        // {
        //   title: '超期换包',
        //   key: 'isExtended',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('span', {
        //       style: {
        //         color: 'red',
        //         fontSize: '24px'
        //       }
        //     }, params.row.isExtended ? '超期' : '');
        //   }
        // }
      ],
      packagingSetup: false,
      packagingSetupForm: {
        mobileImie: "Y", // 是否校验身份码  N 不需要 Y 需要
        packingEnableWeight: "Y", // 是否需要称重 N 不需要 Y 需要*/
        packingWeightUnit: "g", //  g , kg
        enablePackageMaterial: "Y", // 是否需要录入包材 N 不需要 Y 需要
        checkSku: "Y", // 是否校对SKU Y 是 N 否
        packingSingleWeightRemark: "Y", // 单品称重异常提醒 Y是 N否
        packingSingleTranscend: "", // 单品称重误差阀值 单位g
        packingSingleTranscendPercent: null, // 单品称重误差百分比
        packingMultiWeightRemark: "Y", // 多品称重异常提醒 Y是 N否
        packingMultiTranscend: "", // 多品称重误差阀值 单位g
        packingMultiTranscendPercent: null, // 多品称重误差百分比
      },
      weightTypeList: [
        {
          label: "克（g）",
          value: "g",
        },
        {
          label: "千克（Kg）",
          value: "kg",
        },
      ],
      disabledGroup: "0",
      disabled1Group: "0",
      markException: false,
      markExceptionData: [],
      markExceptionColumn: [
        {
          title: "图片",
          align: "center",
          key: "img",
          render(h, params) {
            return v.tableImg(h, params, "pictureUrl");
          },
        },
        {
          title: "SKU",
          align: "center",
          key: "sku",
        },
        {
          title: "待包装数量",
          align: "center",
          key: "quantity",
        },
        {
          title: "已扫数量",
          align: "center",
          key: "scannedQuantity",
          render: (h, params) => {
            return h("InputNumber", {
              props: {
                size: "small",
                min: 0,
                max: params.row.quantity,
                value: params.row.scannedQuantity,
              },
              on: {
                input: (val) => {
                  v.markExceptionData[params.index].scannedQuantity = val;
                },
              },
            });
          },
        },
      ],
      abnormalWeighing: false,
      abnormalWeighingData: [],
      abnormalWeighingColumns: [
        {
          title: "图片",
          align: "center",
          render(h, params) {
            return v.tableImg(h, params, "pictureUrl");
          },
        },
        {
          title: "SKU",
          align: "center",
          key: "sku",
        },
        {
          title: "产品重量(g)",
          align: "center",
          key: "productWeight",
        },
      ],
      packingMaterialList: [],
      deliveryOrder: "",
      brandName: "",
      productBrandIds: "",
      packageId: null,
      abnormalReminder: {},
      originalData: {},
      packingMaterialId: null,
      weightTitle: "",
      isExistAudio: false,
      audio: "",
      addItemInfo: {
        visible: false, //弹框
        setting: null, //拣货复核时进行包装 Y N
        list: [],
        sku: "",
        totalList: {},
        inputFocus: "", //记录原操作光标位置
      },
    };
  },
  created() {
    let v = this;
    v.getDeliverySetting();
    v.packingMaterialData();
    v.$nextTick(() => {
      v.getFocus("identificationNumber");
    });
    let scanSliceNumber = localStorage.getItem("scanSliceNumber");
    if (scanSliceNumber) {
      let data = JSON.parse(scanSliceNumber);
      v.isSliceIdentificationNumber = data.isSliceIdentificationNumber;
      v.sliceStartLength = data.sliceStartLength;
      v.sliceEndLength = data.sliceEndLength;
    }
  },
  methods: {
    saveLocalData() {
      localStorage.setItem(
        "scanSliceNumber",
        JSON.stringify({
          isSliceIdentificationNumber: this.isSliceIdentificationNumber,
          sliceStartLength: this.sliceStartLength,
          sliceEndLength: this.sliceEndLength,
        })
      );
    },
    // 扫描最后调用的公共方法
    handerData(type) {
      let v = this;
      if (
        v.packagingSetupForm.enablePackageMaterial === "Y" &&
        v.packagingSetupForm.packingEnableWeight === "Y" &&
        v.packingMaterialId === null
      ) {
        v.$Message.error({
          duration: 5,
          content: "包材编号不能为空！",
        });
        return false;
      }
      let data = [];
      if (v.outboundOrderData.length > 0) {
        for (let i = 0; i < v.outboundOrderData.length; i++) {
          // 当校对SKU时，先判断当前包裹中的sku是否已经全部扫描完，只有当扫描完成时，才能完成扫描包裹
          // 如果没有设置校对SKU，则不需要判断
          if (v.packagingSetupForm.checkSku === "Y") {
            if (
              v.outboundOrderData[i].quantity !== v.outboundOrderData[i].scannedQuantity
            ) {
              v.$Message.error({
                duration: 5,
                content: "当前包裹中还在sku还未扫描完成！",
              });
              return false;
            }
          }
          v.outboundOrderData[i].skuLists = [];
          if (v.packagingSetupForm.mobileImie === "Y") {
            let mobileImieArr = v.outboundOrderData[i].mobileImieList;
            if (mobileImieArr.length > 0) {
              for (let j = 0; j < mobileImieArr.length; j++) {
                if (mobileImieArr[j].sku === v.outboundOrderData[i].sku) {
                  if (mobileImieArr[j].value !== "") {
                    v.outboundOrderData[i].skuLists.push(mobileImieArr[j].value);
                  }
                }
              }
              // 校验身份码是否全部填写或者全部都没有填写
              if (
                v.outboundOrderData[i].skuLists.length > 0 &&
                v.outboundOrderData[i].skuLists.length !== mobileImieArr.length
              ) {
                v.$Message.error({
                  duration: 5,
                  content: "当前包裹中还有身份码未扫描完成！",
                });
                return false;
              }
            }
          }
          let obj = {
            sku: v.outboundOrderData[i].sku,
            quantity:
              v.packagingSetupForm.checkSku === "Y"
                ? v.outboundOrderData[i].scannedQuantity
                : v.outboundOrderData[i].quantity,
            packageGoodsId: v.outboundOrderData[i].packageGoodsId,
            mobileImieCodes: v.outboundOrderData[i].skuLists,
          };
          data.push(obj);
        }
      }
      // 当不用校对sku、不录入包材、不称重时，不需要调称重接口
      if (type) {
        v.handerPackageData(v.originalData, "noEntry");
      } else {
        let query = {
          materialId: v.packingMaterialId || null, // 包材Id,
          packageId: v.packageId || null, // 包裹id,
          weight: v.formParameter.weight || 0, // 重量,
          weightUnit: v.packagingSetupForm.packingWeightUnit === "g" ? 0 : 1, // 重量单位 0：g 、1:kg, 默认g
          pickingGoodsSkuList: data,
        };
        v.axios.put(api.put_packingWeighting, query).then((res) => {
          if (res.data.code === 0) {
            let talg = res.data.datas;
            v.handerPackageData(talg, "yesEntry");
          }
        });
      }
    },
    // 如果识别到有条码编码，将对应的sku重新赋值this.signSku（仓库只要sku，又要识别条码编码，鬼麻烦）
    restartSku() {
      let inputVal = this.formParameter.scanSku;
      let realSku = null;
      for (let i = 0; i <= this.outboundOrderData.length - 1; i++) {
        let n = this.outboundOrderData[i];
        if (inputVal === n.sku) {
          realSku = null;
          break;
        }
        if (!realSku && n.barCode.includes(inputVal)) realSku = n.sku;
      }
      // console.log(realSku, inputVal);
      return realSku || inputVal;
    },
    // 识别号、扫描SKU、扫描身份码、包材、称重 回车键
    identificationKey(key) {
      let v = this;
      // 识别号
      if (key === 1) {
        let identificationNumber = v.formParameter.identificationNumber;
        if (v.isSliceIdentificationNumber) {
          if (v.sliceStartLength)
            identificationNumber = identificationNumber.slice(v.sliceStartLength);
          if (v.sliceEndLength)
            identificationNumber = identificationNumber.slice(
              0,
              identificationNumber.length - v.sliceEndLength
            );
        }
        if (identificationNumber !== "") {
          if (v.getPermission("wmsPicking_scanPackaging")) {
            v.axios
              .put(
                api.put_scanPackaging +
                `${identificationNumber}?warehouseId=${v.getWarehouseId()}`
              )
              .then(async (res) => {
                if (res.data.code === 0) {
                  let data = res.data.datas;
                  // 在分拣与包装的环节，出现品牌换包与超期换包时，播放声音提醒
                  // v.soundReminder(data, key);

                  if (data.packageDetails && data.packageInfo) {
                    v.handerCheckSku();
                    v.deliveryOrder = data.packageInfo.packageCode;
                    v.productBrandIds = data.packageInfo.productBrandIds;
                    v.packageId = data.packageInfo.packageId;
                    v.brandName = data.packageInfo.brandName;

                    if (data.packageDetails.length > 0) {
                      let skuList = data.packageDetails.map((k) => k.sku);
                      let barCodeList = await v.getBarcodeBeSku(skuList);
                      data.packageDetails.map((item) => {
                        item["scannedQuantity"] = 0;
                        item["mobileImieList"] = [];

                        let barCode =
                          barCodeList[item.sku] && barCodeList[item.sku].scanCodeList;
                        item.barCode = barCode || [];
                      });
                      v.outboundOrderData = data.packageDetails;
                    }
                    v.originalData = data;
                    // 当不校对SKU、不录入包材、不称重时，扫描出库单时，就直接是扫描包裹成功了
                    if (
                      v.packagingSetupForm.checkSku === "N" &&
                      v.packagingSetupForm.enablePackageMaterial === "N" &&
                      v.packagingSetupForm.packingEnableWeight === "N"
                    ) {
                      v.handerData(true);
                      return false;
                    } else {
                      this.getAddItemOperation();
                    }
                  } else {
                    v.$Message.error(
                      "当前扫描的出库单号或运单号或物流商单号，已经扫描出库！"
                    );
                    return false;
                  }

                  const packagingSetupForm = v.packagingSetupForm || {};
                  let focusStr = "";
                  if (packagingSetupForm.checkSku === "Y") {
                    focusStr = "scanSku"; // sku
                  } else if (packagingSetupForm.enablePackageMaterial === "Y") {
                    focusStr = "packingMaterial"; // 包材
                  } else if (packagingSetupForm.packingEnableWeight === "Y") {
                    focusStr = "weight"; // 称重
                  }
                  if (focusStr) {
                    v.$nextTick(() => {
                      v.getFocus(focusStr);
                    });
                  }
                }
              });
          } else {
            v.gotoError();
          }
        } else {
          v.$Message.error("识别号不能为空！");
        }
      } else if (key === 2) {
        // 扫描SKU
        let scanSku = v.restartSku();
        v.signSku = scanSku;
        if (scanSku !== "") {
          let data = [];
          if (v.outboundOrderData.length > 0) {
            v.inputFocus = "scanSku"; //默认光标在sku身上
            // 取出当前扫描sku的这一条数据
            v.outboundOrderData.map((item) => {
              if (item.sku === scanSku) {
                data.push(item);
              }
            });

            // 在分拣与包装的环节，出现品牌换包与超期换包时，播放声音提醒
            // v.soundReminder(data, key);

            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                let item = data[i];
                if (item.quantity !== item.scannedQuantity) {
                  v.outboundOrderData.map((ele, index) => {
                    if (ele.sku === item.sku) {
                      ele.scannedQuantity += 1;
                      v.formParameter.scanSku = "";
                      if (ele.mobileImieList.length <= 0) {
                        for (let i = 0; i < item.quantity; i++) {
                          ele.mobileImieList.push({
                            index: i + 1,
                            sku: ele.sku,
                            value: "",
                          });
                        }
                        v.$set(
                          v.outboundOrderData[index],
                          "mobileImieList",
                          ele.mobileImieList
                        );
                      }
                      // 当有检验身份码时，扫描sku后自动将光标定位到扫描身份码
                      if (v.packagingSetupForm.mobileImie === "Y") {
                        v.$nextTick(() => {
                          v.getFocus("mobileImie");
                          v.inputFocus = "mobileImie";
                        });
                      }
                    }
                  });
                } else {
                  v.formParameter.scanSku = "";
                  v.$Message.error({
                    content: "当前扫描的数量不能大于应包装数量！",
                    duration: 3,
                  });
                  return false;
                }
              }
            } else {
              v.$Message.error({
                content: "当前扫描的sku不存在！",
                duration: 3,
              });
              return false;
            }

            let talgData = v.outboundOrderData.filter((item) => {
              return item.scannedQuantity === item.quantity;
            });
            // sku全部扫描后，移动焦点
            if (talgData.length === v.outboundOrderData.length) {
              const packagingSetupForm = v.packagingSetupForm;

              if (
                packagingSetupForm.mobileImie === "N" &&
                packagingSetupForm.enablePackageMaterial === "N" &&
                packagingSetupForm.packingEnableWeight === "N"
              ) {
                this.handerData();
              }
              let focusStr = "";
              if (packagingSetupForm.mobileImie === "Y") {
                focusStr = "mobileImie"; // 身份码
              } else if (packagingSetupForm.enablePackageMaterial === "Y") {
                focusStr = "packingMaterial"; // 包材
              } else if (packagingSetupForm.packingEnableWeight === "Y") {
                focusStr = "weight"; // 称重
              }
              if (focusStr) {
                v.$nextTick(() => {
                  v.getFocus(focusStr);
                });
                v.inputFocus = "focusStr";
              }
            }

            // 增值项处理
            this.handleAddItemOperation();
          }
        } else {
          v.$Message.error("SKU不能为空！");
        }
      } else if (key === 5) {
        // 身份码
        // 自动填充身份码
        if (v.formParameter.mobileImie !== "") {
          v.outboundOrderData.map((item, index) => {
            if (item.mobileImieList.length > 0) {
              for (let i = 0; i < item.mobileImieList.length; i++) {
                let ele = item.mobileImieList[i];
                if (ele.sku === item.sku && ele.sku === v.signSku) {
                  if (ele.value === "") {
                    ele.value = v.formParameter.mobileImie;
                    v.$set(
                      v.outboundOrderData[index].mobileImieList[i],
                      "value",
                      v.formParameter.mobileImie
                    );
                    break;
                  }
                }
              }
            }
          });
        }
        v.signSku = "";
        v.formParameter.mobileImie = "";
        v.getFocus("scanSku");
        let talgData = v.outboundOrderData.filter((item) => {
          return item.scannedQuantity === item.quantity;
        });
        if (talgData.length === v.outboundOrderData.length) {
          if (
            v.packagingSetupForm.enablePackageMaterial === "N" &&
            v.packagingSetupForm.packingEnableWeight === "N"
          ) {
            this.handerData();
          }
          // 包材
          if (v.packagingSetupForm.enablePackageMaterial === "Y") {
            v.$nextTick(() => {
              v.getFocus("packingMaterial");
            });
          } else if (v.packagingSetupForm.packingEnableWeight === "Y") {
            // 称重
            v.$nextTick(() => {
              v.getFocus("weight");
            });
          }
        }
      } else if (key === 3) {
        // 包材编号
        v.packingMaterialId = null;
        if (v.formParameter.packingMaterial !== "") {
          let data = [];
          if (v.packingMaterialList.length > 0) {
            v.packingMaterialList.map((item) => {
              if (item.packageMaterialNumber === v.formParameter.packingMaterial) {
                data.push(item);
              }
            });
            if (data.length > 0) {
              v.packingMaterialId = data[0].packageMaterialId;
            } else {
              v.$Message.error({
                content: "当前检索的包材编号不存在！",
                duration: 3,
              });
              return false;
            }
          }
        } else {
          v.$Message.error("包材编号不能为空！");
          return false;
        }
        if (v.packagingSetupForm.packingEnableWeight === "Y") {
          v.$nextTick(() => {
            v.getFocus("weight");
          });
        } else {
          v.handerData();
        }
      } else if (key === 4) {
        // 当前称重 - 当前包裹的预估重量 >= 包装设置里面设置的包裹重量时，会出现称重异常提醒弹窗
        // 称重
        let weight = v.formParameter.weight;
        if (v.outboundOrderData.length > 0) {
          for (let i = 0; i < v.outboundOrderData.length; i++) {
            if (v.packagingSetupForm.checkSku === "Y") {
              if (
                v.outboundOrderData[i].quantity !== v.outboundOrderData[i].scannedQuantity
              ) {
                v.$Message.error("当前包裹中还在sku还未扫描完成！");
                return false;
              }
            }
            if (
              v.packagingSetupForm.enablePackageMaterial === "Y" &&
              v.packingMaterialId === null
            ) {
              v.$Message.error("包材编号不能为空！");
              return false;
            }
          }
          if (weight !== "" && weight > 0) {
            // 扫描称重后校验包裹
            let query = {
              packageId: v.packageId,
              warehouseId: v.getWarehouseId(),
              unit: v.packagingSetupForm.packingWeightUnit,
              weight: weight,
            };
            v.axios.put(api.put_validatePickingPackage, query).then((res) => {
              let data = res.data.datas;
              // 称重没有异常的时候，走正常的流程
              if (data.validate) {
                v.handerData();
              } else {
                // 称重有异常时，弹出称重异常提醒弹窗
                v.abnormalReminder = data;
                v.abnormalWeighingData = data.packageDetails;
                v.abnormalWeighing = true;
              }
            });
          } else {
            v.$Message.error("称重不能为空且要大于0！");
            return false;
          }
        } else {
          v.$Message.error("请先扫描识别号！");
          return false;
        }
      }
    },
    // 监听包装设置弹窗
    packagingSetupChange(value) {
      if (!value) {
        this.disabledGroup = "0";
        this.disabled1Group = "0";
        this.packagingSetupForm = JSON.parse(JSON.stringify(this.originalSetupForm));
      }
    },
    // 获取包装设置的数据
    getDeliverySetting() {
      let v = this;
      if (v.getPermission("packageSetting_queryPackingOperationsSetting")) {
        v.axios.get(api.get_OperationsSetting).then((res) => {
          if (res.data.code === 0) {
            res.data.datas.forEach((i) => {
              for (let key in v.packagingSetupForm) {
                if (i.paramKey === key) {
                  v.packagingSetupForm[key] = i.paramValue;
                }
              }
            });
            v.originalSetupForm = JSON.parse(JSON.stringify(v.packagingSetupForm));
            v.packagingSetupForm.packingSingleTranscend
              ? (v.disabledGroup = "0")
              : (v.disabledGroup = "1");
            v.packagingSetupForm.packingMultiTranscend
              ? (v.disabled1Group = "0")
              : (v.disabled1Group = "1");
            v.handerCheckSku();
            let talg = v.packagingSetupForm.packingWeightUnit === "g" ? "克" : "千克";
            v.weightTitle =
              "称重单位为：" + talg + "(" + v.packagingSetupForm.packingWeightUnit + ")";
          }
        });
      } else {
        v.gotoError();
      }
    },
    // 处理包装设置的参数
    paramsHandel() {
      let v = this;
      let arr = [];
      for (let key in v.packagingSetupForm) {
        arr.push({
          paramKey: key,
          paramValue: v.packagingSetupForm[key],
        });
      }
      return arr;
    },
    // 包装设置弹窗的保存按钮
    packagingSetupBtn() {
      let v = this;
      let params = v.paramsHandel();
      v.axios.post(api.set_DeliverySetting, { paramBoList: params }).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("保存成功");
          for (let key in v.packagingSetupForm) {
            v.packagingSetupForm[key] = "";
          }
          v.packagingSetup = false;
          v.getDeliverySetting();
        }
      });
    },
    // 获取包材编号的数据
    packingMaterialData() {
      let v = this;
      v.axios.get(api.get_packingMaterial).then((res) => {
        if (res.data.code === 0) {
          v.packingMaterialList = res.data.datas;
        }
      });
    },
    // 添加校对列
    handerCheckSku() {
      let v = this;
      if (v.packagingSetupForm.checkSku === "Y") {
        let checkSku = {
          title: "校对",
          align: "center",
          width: 100,
          key: "proofreading",
          render: (h, params) => {
            let talg = params.row.scannedQuantity === params.row.quantity;
            return h("Icon", {
              props: {
                type: talg ? "md-checkmark" : "md-close",
                size: "24",
              },
              style: {
                fontWeight: "bolder",
                color: talg ? "#008000" : "#FF0000",
              },
            });
          },
        };
        // 添加身份码列
        if (v.packagingSetupForm.mobileImie === "Y") {
          let mobileImie = {
            title: "身份码",
            align: "center",
            key: "mobileImieCode",
            render: (h, params) => {
              let obj = [];
              let data = params.row.mobileImieList;
              data.map((item, index) => {
                obj[index] = h("Input", {
                  props: {
                    value: item.value,
                    clearable: true,
                  },
                  class: "mobileImie_input",
                  on: {
                    input(val) {
                      v.outboundOrderData[params.index].mobileImieList[index].value = val;
                      v.$set(
                        v.outboundOrderData[params.index].mobileImieList[index],
                        "value",
                        val
                      );
                    },
                  },
                });
              });
              return h("div", obj);
            },
          };
          v.outboundOrderColumn.map((item, index) => {
            if (item.key === "mobileImieCode") {
              v.outboundOrderColumn.splice(index, 1);
            }
          });
          v.outboundOrderColumn.push(mobileImie);
        } else {
          v.outboundOrderColumn.map((item, index) => {
            if (item.key === "mobileImieCode") {
              v.outboundOrderColumn.splice(index, 1);
            }
          });
        }
        v.outboundOrderColumn.map((item, index) => {
          if (item.key === "proofreading") {
            v.outboundOrderColumn.splice(index, 1);
          }
        });
        v.outboundOrderColumn.push(checkSku);
      } else {
        v.outboundOrderColumn.map((item, index) => {
          if (item.key === "proofreading") {
            v.outboundOrderColumn.splice(index, 1);
          }
        });
      }
    },
    // 继续包装
    continueDeliverGoods() {
      let v = this;
      v.abnormalWeighing = false;
      v.handerData();
    },
    // 取消包装
    unpackingBtn() {
      this.resetData();
    },
    // 标记异常
    markExceptionBtn() {
      let v = this;
      v.markExceptionData = JSON.parse(JSON.stringify(v.outboundOrderData));
      v.markException = true;
    },
    // 标记异常的确定按钮
    markExceptionSubmit() {
      let v = this;
      let data = [];
      let abnormalArr = [];
      if (v.markExceptionData.length > 0) {
        v.markExceptionData.map((item) => {
          if (item.quantity === item.scannedQuantity) {
            abnormalArr.push(item);
          }
          data.push({
            actualPickingNumber: item.scannedQuantity,
            packageGoodsId: item.packageGoodsId,
          });
        });
        if (abnormalArr.length === v.markExceptionData.length) {
          v.$Message.error("已扫描数量不能全等于待包装数量，不然无法标记异常！");
          return false;
        }
        let query = {
          packageId: v.packageId,
          updateActualPickingNumBoList: data,
        };
        v.axios.post(api.post_markException, query).then((res) => {
          if (res.data.datas) {
            v.$Message.success("标记异常成功！");
            v.resetData();
          }
        });
      }
    },
    // 重置数据的公共方法
    resetData() {
      let v = this;
      v.abnormalWeighing = false;
      v.markException = false;
      v.markExceptionData = [];
      v.outboundOrderData = [];
      v.$refs["formParameter"].resetFields();
      v.packingMaterialId = null;
      v.getFocus("identificationNumber");
    },
    // 处理组装已扫描包裹列表的数据
    handerPackageData(data, type) {
      let v = this;
      let obj = {};
      if (data) {
        // 录入
        if (type === "yesEntry") {
          obj = {
            packageCode: data.packageCode,
            trackingNumber: data.trackingNumber,
          };
        } else if (type === "noEntry") {
          // 不录入
          if (Object.keys(data).length > 0) {
            obj = {
              packageCode: data.packageInfo.packageCode,
              trackingNumber: data.packageInfo.trackingNumber,
            };
          }
        }
        if (v.outboundOrderData.length > 0) {
          let talg = v.packagingSetupForm.packingWeightUnit === "kg" ? 1000 : 1; // 如果是kg 需乘1000
          let skuList = [];
          v.outboundOrderData.map((item) => {
            obj.weight = Number(v.formParameter.weight * talg).toFixed(2);
            skuList.push({
              sku: item.sku,
              quantity: item.quantity,
            });
          });
          obj.skuList = skuList;
          // 获取包材名称
          if (v.packingMaterialList.length > 0) {
            v.packingMaterialList.map((item) => {
              if (item.packageMaterialId === v.packingMaterialId) {
                obj.title = item.packageMaterialName;
              }
            });
          }
        }
        // 已包装列表只显示当前账号最近扫描的50个包裹
        v.packageData.unshift(obj);
      }
      if (v.packageData.length > 50) {
        v.packageData = v.packageData.slice(0, 50);
      }
      v.resetData();
      v.$Message.success("已扫描包裹成功！");
    },
    // 不勾选检验sku时, 去掉勾选身份码
    changeSku(value) {
      if (value === "N") {
        if (this.packagingSetupForm.mobileImie === "Y") {
          this.packagingSetupForm.mobileImie = "N";
        }
      }
    },
    // 选中身份码时，自动勾选中校验SKU
    changeMobileImie(value) {
      if (value === "Y") {
        this.packagingSetupForm.checkSku = "Y";
      }
    },
    playAudio() {
      /* let audio = new Audio();
      audio.src = require('../../../../../public/static/audios/huanbao.mp3');
      audio.play(); */
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
    soundReminder(data, key) {
      if (!(data && key)) return;
      let fun = {
        // 品牌列表
        brandList: ["LAPA"],
        keyTemp: { 1: "allJudge", 2: "isOverTime" },
        // 两个都判断
        allJudge(data) {
          let { packageDetails = [], packageInfo = {} } = data;
          return this.isLapaFun(packageInfo) || this.isOverTime(packageDetails);
        },
        // 是否品牌
        isLapaFun(data) {
          let { brandName } = data;
          if (!brandName) return;
          return brandName && this.brandList.includes(brandName.toUpperCase());
        },
        // 是否超期
        isOverTime(list = []) {
          let isExtended = false;
          list.forEach((k) => {
            k.isExtended && (isExtended = true);
          });
          return isExtended;
        },
      };
      let typeFun = fun.keyTemp[key];
      if (!typeFun) return;
      let result = fun[typeFun](data);
      if (!result) return;
      this.playAudio();
    },
    // 获取增项操作
    getAddItemOperation() {
      let params = `?businessId=${this.formParameter.identificationNumber
        }&warehouseId=${this.getWarehouseId()}`;
      this.axios.post(api.pickingReminderSetting + params).then(({ data }) => {
        if (data.code !== 0) return;
        this.addItemInfo.totalList = data.datas || {};
      });
    },
    handleAddItemOperation() {
      let list = [];
      let addItemInfo = this.addItemInfo;
      const key = this.deliveryOrder + "&" + this.signSku;
      Object.keys(addItemInfo.totalList).forEach((k) => {
        if (key === k) list = addItemInfo.totalList[k];
      });
      if (!list.length) return;
      let realList = list.filter(fk => {
        // 这里产品设计奇葩，增值服务的提示不统一，比如抽真空需要展示在列表不在弹框
        return !['vacuumizeProduct'].includes(fk.resourceName);
      });
      this.addItemInfo.sku = this.signSku;
      this.addItemInfo.list = realList;
      if (!realList.length) return;
      // 扫描数据完显后再弹出提示
      this.addItemInfo.visible = true;
      this.playAudio();
    },
  },
  watch: {
    "addItemInfo.visible": {
      handler(value) {
        if (value) return;
        setTimeout(() => {
          this.getFocus(this.inputFocus);
        }, 200);
      },
      deep: true,
    },
  },
};
</script>

<style lang="less">
.packaging_operation {
  padding-top: 10px;

  .operation_box {
    display: flex;
    justify-content: space-between;

    .card_box {
      width: 700px;
      height: max-content;

      :deep(.ivu-card-head) {
        border-bottom: none;
      }

      .title_box {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          color: #333;
          font-size: 16px;
          font-weight: bold;
        }

        .options {
          display: flex;
          align-items: center;

          .options_item {
            margin-left: 14px;

            :deep(.ivu-tooltip-inner) {
              max-width: 320px;
            }

            .txt {
              font-size: 15px;
              color: #666;
              margin-right: 5px;
            }

            .icon_yes {
              font-size: 20px;
              color: #008000;
              font-weight: bold;
            }

            .icon_no {
              font-size: 20px;
              color: #ff0000;
              font-weight: bold;
            }

            .help_icon {
              font-size: 21px;
              color: #999999;
              cursor: pointer;
            }

            .icon_set {
              font-size: 21px;
              color: #2d8cf0;
              cursor: pointer;
            }
          }
        }
      }

      :deep(.ivu-card-body) {
        background-color: #dbebd3;

        .form_box /deep/ {
          padding-top: 15px;

          .ivu-form-item-label {
            font-size: 16px;
            padding-right: 0 !important;
            color: #333;
          }

          .ivu-select-selection {
            height: initial;
          }

          .ivu-select-arrow {
            display: none !important;
          }

          input {
            font-size: 14px;
            height: 38px;
            line-height: 38px;
          }
        }
      }
    }

    .outbound_order {
      width: 880px;
      height: max-content;

      :deep(.ivu-card-head) {
        padding: 8px 16px;
      }

      .outbound_tiem {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
          color: #333;
          font-size: 18px;
          font-weight: bold;
        }
      }

      :deep(.mobileImie_input) {
        .ivu-input {
          margin-top: 4px;
          height: 28px;
          line-height: 28px;
        }
      }

      :deep(.mobileImie_input:last-child .ivu-input) {
        margin-bottom: 4px;
      }
    }
  }

  .table_box {
    margin-top: 50px;

    .title {
      color: #333;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
    }
  }

  .ivu-tooltip-inner {
    width: 250px;
    white-space: normal;
  }

  .ivu-input-number-small input {
    height: 24px !important;
    line-height: 24px !important;
  }
}

.packagingSetupModal /deep/ {
  .modelTit {
    color: #333;
    font-size: 15px;
    font-weight: bold;
    border-bottom: 1px solid #cccccc;
    padding-bottom: 5px;
    margin-bottom: 15px;
  }

  .ivu-form-item {
    margin: 0;

    label {
      font-size: 14px;
    }
  }
}

.markExceptionModal /deep/ {
  .title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 10px;
  }
}

.abnormalWeighingModal /deep/ {
  .ivu-alert {
    margin-bottom: 20px;

    :deep(.ivu-alert-message) {
      font-size: 15px !important;
      line-height: 24px !important;
    }
  }

  .product_weight_box {
    margin-top: 25px;
    text-align: right;
    display: flex;
    flex-direction: column;

    .line_txt {
      color: #333;
      font-size: 16px;
      margin: 6px 0;

      .number {
        font-weight: bold;
      }
    }
  }
}

.w-40 {
  width: 40px;
}

.inline-block {
  display: inline-block;
}
</style>
