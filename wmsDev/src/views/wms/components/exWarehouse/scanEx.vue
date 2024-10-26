<style scoped>
.autoRight {
  overflow-y: auto;
  overflow-x: hidden;
  height: 850px;
}

.settingCursor {
  cursor: pointer;
}

.checkboxStyle {
  display: block;
  padding-bottom: 10px;
}

.packageCode {
  justify-content: center;
  font-size: 24px;
  color: #0054a6;
}

.packageNationFlag {
  justify-content: center;
}

.shippingCode {
  justify-content: center;
  font-size: 16px;
  margin-top: 10px;
  color: #3cb034;
}

.shippingCode em {
  font-style: normal;
  margin-right: 10px;
  color: #333;
}

.packageItem {
  font-size: 24px;
}

.packageSpecialItem {
  font-size: 36px;
  color: #113f6d;
  font-weight: bold;
}

.packageSetting {
  background-color: #dbebd4;
  height: 190px;
  border-bottom: 1px solid #e1e1e1;
  border-left: 1px solid #e1e1e1;
  border-right: 1px solid #e1e1e1;
}

.packageSettingBody {
  border-top: 1px solid #e1e1e1;
}

.packageSettingFont {
  line-height: 34px;
  margin-left: 5px;
}

.scanPageItem {
  margin-bottom: 10px;
  border: 1px solid #e1e1e1;
  background-color: #fff;
}

.scanPageItemHeader {
  border-bottom: 1px solid #e9eaec;
  padding: 13px 16px;
  line-height: 1;
}

.scanPageItemHeaderContent {
  width: 100%;
  height: 24px;
  line-height: 20px;
  font-size: 14px;
  color: #1c2438;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spicLeft {
  margin-left: 15px;
}

.scanPageItemBody {
  padding: 10px;
}

.overbagShippingName {
  font-size: 24px;
  color: #0054a6;
}

.overbagParams {
  font-size: 20px;
}

.overbagParams span {
  color: #ff3300;
}

.gotoExwarehouse {
  justify-content: space-between;
}

.scanEx {
  margin-top: -15px;
  line-height: 32px;
}

.modelTit {
  line-height: 36px;
  border-bottom: 1px solid #e5e5e5;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.inline-block {
  display: inline-block;
}

.mr10 {
  margin-right: 10px;
}

.valid-bottom {
  font-size: 14px;
  padding: 20px;
}

.text-right {
  text-align: right;
}

.valid-tit {
  text-align: left;
  display: inline-block;
  width: 150px;
  line-height: 30px;
}

.scanFooter {
  position: fixed;
  bottom: 0;
  width: 42.7%;
  height: 50px;
  background-color: #6d7380;
}

.scanFooterBox {
  height: 100%;
  padding-top: 7px;
  text-align: center;
}

.ml10 {
  margin-left: 10px;
}

.mr10 {
  margin-right: 10px;
}
</style>
<template>
  <div class="commonFilter scanExPage">
    <div class="flexBox gotoExwarehouse layout-breadcrumb">
      <Breadcrumb style="margin-top:5px">
        <BreadcrumbItem>直发</BreadcrumbItem>
        <BreadcrumbItem>扫描出库</BreadcrumbItem>
      </Breadcrumb>
      <Button type="primary" @click="gotoExwarehouse" v-if="getPermission('packageInfo_getPackageByCode')"
        icon="md-swap">切换为批量出库
      </Button>
    </div>
    <Row>
      <Col :span="11">
      <Card :bordered="false">
        <p slot="title">扫描</p>
        <p slot="extra">
          <span class="mr10">称重<Icon v-if="formInline.enableWeight === 'Y'" type="md-checkmark" class="greenColor"></Icon>
            <Icon v-else type="close-round" class="redColor"></Icon>
          </span>
          <span class="mr10">量体积<Icon v-if="formInline.enableVolume === 'Y'" type="md-checkmark" class="greenColor">
            </Icon>
            <Icon v-else type="close-round" class="redColor"></Icon>
          </span>
          <span class="mr10">称重单位为:<span v-text="formInline.weightUnit === 'g'
            ? '克' + '（g）'
            : '千克' + '(kg)'
            "></span>
            <Tooltip content="请保持系统重量单位和电子秤重量单位一致">
              <Icon type="md-help-circle"></Icon>
            </Tooltip>
          </span>
          <span class="mr10">自动执行发货<Icon v-if="formInline.autoDelivery === 'Y'" type="md-checkmark" class="greenColor">
            </Icon>
            <Icon v-else type="close-round" class="redColor"></Icon>
          </span>
          <Icon type="ios-settings" class="settingCursor" @click="model4 = true"></Icon>
        </p>
        <div>
          <div class="flexBox packageCode">
            {{ packageModel.code }}
          </div>
          <div class="flexBox packageNationFlag">
            <span :class="[
              'bigNationalFlag bignationalFlag' +
              packageModel.webstoreItemSite,
            ]"></span>
          </div>
          <div class="flexBox shippingCode">
            <em>{{ packageModel.nation }}</em>
            {{ packageModel.postcode }}
          </div>
          <div class="packageSpecialItem normalTop">
            <span>物流方式：</span>
            <span class="">{{ packageModel.shippingMethod }}</span>
          </div>
          <div class="packageItem normalTop">
            <span>运单号：</span>
            <span class="redColor">{{ packageModel.waybillNo }}</span>
          </div>
          <div class="packageItem normalTop">
            <span>实际称重：</span>
            <span class="greenColor">{{ packageModel.weight }}g</span>
          </div>
        </div>
      </Card>
      <div class="packageSetting">
        <div class="packageSettingBody">
          <Form :model="formItem" :label-width="70" onSubmit="return false">
            <Row class="normalTop">
              <Col>
              <FormItem label="扫描：" prop="scan">
                <Input v-model.trim="formItem.scan" style="width:200px" ref="input1" placeholder="可扫描出库单号、运单号、物流商单号"
                  @on-keyup.13="goNextInput(1)"></Input>
                <Checkbox @on-change="saveLocalData" class="inline-block ml10" v-model="isSliceIdentificationNumber">截去
                </Checkbox>
                前
                <InputNumber v-model="sliceStartLength" @on-change="saveLocalData"
                  :disabled="!isSliceIdentificationNumber" :precision=0 style="height: 24px;" :min=0 :max=999999
                  class="w-40" size="small" />后
                <InputNumber :disabled="!isSliceIdentificationNumber" @on-change="saveLocalData" :precision=0
                  style="height: 24px;" size="small" :min=0 :max=999999 class="w-40" v-model="sliceEndLength" />
                <Tooltip content="有些物流商面单扫描的运单号会带前缀或后缀，这样系统就无法识别运单号，勾选可截去相对应的前缀或后缀">
                  <Icon type="md-help-circle" />
                </Tooltip>
              </FormItem>
              </Col>
            </Row>
            <Row v-if="localFormInline.enableWeight === 'Y'">
              <Col :span="10">
              <FormItem label="称重：" prop="weigh">
                <Input v-model.trim="formItem.weight" ref="input2" @on-keyup.13="goNextInput(2)" @on-blur="toFixedTwo">
                <span slot="append">{{
                  packageSettingModel.weight
                }}</span>
                </Input>
              </FormItem>
              </Col>
            </Row>
            <Row v-if="localFormInline.enableVolume === 'Y'">
              <FormItem label="尺寸：">
                <Col :span="5">
                <Input v-model.trim="formItem.length" ref="input3" placeholder="长" @on-keyup.13="goNextInput(3)">
                <span slot="append">cm</span>
                </Input>
                </Col>
                <Col :span="5" style="margin-left:5px">
                <Input v-model.trim="formItem.width" ref="input4" placeholder="宽" @on-keyup.13="goNextInput(4)">
                <span slot="append">cm</span>
                </Input>
                </Col>
                <Col :span="5" style="margin-left:5px">
                <Input v-model.trim="formItem.height" ref="input5" placeholder="高" @on-keyup.13="goNextInput(5)">
                <span slot="append">cm</span>
                </Input>
                </Col>
              </FormItem>
            </Row>
          </Form>
        </div>
      </div>
      </Col>
      <Col :span="12" offset="1" style="position: relative">
      <Tabs type="card" v-model="tabPane">
        <TabPane v-for="tab in tabPaneText" :key="tab.value" :name="tab.value" :label="tab.label">
          <div class="autoRight">
            <div class="scanPageItem" v-if="tab.value === '1'" v-for="(item, index) in scanData" :key="index">
              <div class="scanPageItemHeader">
                <div class="scanPageItemHeaderContent flexBox" style="justify-content: space-between;">
                  <span>已扫
                    <span class="blueColor spicLeft">{{
                      shippingMethodPos[index]
                    }}</span></span>
                  <span> </span>
                </div>
                <div class="scanPageItemBody">
                  <Table highlight-row border :columns="scanColumn" :data="item" size="small"></Table>
                </div>
              </div>
              <div class="scanPageItemBody">
                <dTable highlight-row border :columns="scanColumn" :data="item" size="small"></dTable>
              </div>
            </div>
            <!--正常的扫描标记发货-->
            <div class="scanPageItem" v-if="tab.value === '2' && !isSupplier" v-for="(item, index) in goodsData"
              :key="index">
              <div class="scanPageItemHeader">
                <div class="scanPageItemHeaderContent flexBox" style="justify-content: space-between;">
                  <span>已发
                    <span class="greenColor spicLeft">{{
                      shippingGoodsMethodPos[index]
                    }}</span></span>
                  <span>
                    <Button type="primary" size="small" v-if="getPermission('packageInfo_createExcelForBagging')
                        " icon="ios-basket" @click="setPackageOver(item, index)">结袋</Button>
                  </span>
                </div>
                <div class="scanPageItemBody">
                  <Table highlight-row border :columns="goodsColumn" :data="item" size="small"></Table>
                </div>
              </div>
              <div class="scanPageItemBody">
                <dTable highlight-row border :columns="goodsColumn" :data="item" size="small"></dTable>
              </div>
            </div>
            <!--供应商的扫描标记发货-->
            <div class="scanPageItem" v-if="tab.value === '2' && isSupplier && supplierDeliveryData.length > 0">
              <div class="scanPageItemHeader">
                <div class="scanPageItemHeaderContent flexBox" style="justify-content: flex-end;">
                  <Button type="primary" size="small" icon="ios-basket" @click="supplierBaggingBtn">结袋</Button>
                </div>
                <div class="scanPageItemBody">
                  <Table highlight-row border :columns="goodsColumn" :data="supplierDeliveryData" size="small"></Table>
                </div>
              </div>
              <div class="scanPageItemBody">
                <dTable highlight-row border :columns="goodsColumn" :data="supplierDeliveryData" size="small"></dTable>
              </div>
            </div>
          </div>
        </TabPane>
      </Tabs>
      <div class="scanFooter" v-if="scanData.length > 0 && tabPane === '1'">
        <div class="scanFooterBox">
          <Button size="large" class="mr10" v-if="getPermission('packageInfo_scanBatchMarkPackageDelivery')"
            @click="batchMarkGoods(null)">批量标记发货
          </Button>
          <Button class="ml10" size="large" @click="deleteAllGoods" type="error">清空全部</Button>
        </div>
      </div>
      </Col>
    </Row>
    <Modal v-model="model4" title="发货设置" width="700" @on-visible-change="model4Visible">
      <Form ref="formInline" :model="formInline" :rules="ruleInline">
        <p class="modelTit">发货设置</p>
        <FormItem>
          <Row>
            <Col span="6">
            <Checkbox v-model="formInline.enableWeight" :true-value="'Y'" :false-value="'N'">需要称重</Checkbox>
            </Col>
            <Col span="16">
            <Select v-model="formInline.weightUnit" size="small" style="width: 150px;">
              <Option v-for="(item, index) in weightTypeList" :key="index" :value="item.value"> {{ item.label }}
              </Option>
            </Select>
            </Col>
          </Row>
        </FormItem>
        <FormItem>
          <Checkbox v-model="formInline.enableVolume" :true-value="'Y'" :false-value="'N'">需要量尺寸</Checkbox>
        </FormItem>
        <FormItem>
          <Checkbox v-model="formInline.autoDelivery" :true-value="'Y'" :false-value="'N'">自动执行发货</Checkbox>
        </FormItem>
        <p class="modelTit">
          称重异常提醒设置 </p>
        <p>当包裹中的商品为：</p>
        <FormItem>
          <Checkbox class="inline-block" v-model="formInline.singleWeightRemark" :true-value="'Y'" :false-value="'N'">单品
          </Checkbox>
          且包裹称重与商品资料重量误差大于等于
          <RadioGroup v-model="disabledGroup">
            <Radio label="0">
              <Input style="width: 60px" v-model="formInline.singleTranscend" />
              克
            </Radio>
            <Radio label="1">
              <Input style="width: 60px" v-model="formInline.singleTranscendPercent" />
              %
            </Radio>
          </RadioGroup>
          时系统将提示
        </FormItem>
        <FormItem>
          <Checkbox class="inline-block" v-model="formInline.multiWeightRemark" :true-value="'Y'" :false-value="'N'">多品
          </Checkbox>
          且包裹称重与商品资料重量误差大于等于
          <RadioGroup v-model="disabled1Group">
            <Radio label="0">
              <Input style="width: 60px" v-model="formInline.multiTranscend" />
              克
            </Radio>
            <Radio label="1">
              <Input style="width: 60px" v-model="formInline.multiTranscendPercent" />
              %
            </Radio>
          </RadioGroup>
          时系统将提示
        </FormItem>
        <p class="modelTit">
          发货运费异常设置 </p>
        <FormItem>
          <Checkbox class="inline-block" v-model="formInline.eachPiecePostageRemark" :true-value="'Y'" :false-value="'N'">
            逐单扫描发货计算运费大于 ￥
          </Checkbox>
          <Input style="width: 60px" v-model="formInline.postageTranscend" />
          时系统将提示
        </FormItem>
      </Form>
      <div slot="footer">
        <Button size="small" @click="model4 = false">关闭</Button>
        <Button size="small" type="primary" v-if="getPermission('packageSetting_saveDeliverySetting')"
          @click="saveDeliverySetting">保存
        </Button>
      </div>
    </Modal>
    <Modal v-model="model5" title="称重异常提醒" width="600">
      <div v-if="validErrorData">
        <Alert type="warning" show-icon>
          {{ validErrorData.error }}
        </Alert>
        <Table :columns="columns5" :data="validErrorData.packageDetails" height="300"></Table>
        <div class="text-right valid-bottom">
          <p>
            <span class="valid-tit">产品重量小计(g)：</span>
            {{ validErrorData.productWeight }}
          </p>
          <p>
            <span class="valid-tit">产品重量小计(g)：</span>
            {{ validErrorData.PackingMaterialsWeightSubtotal }}
          </p>
          <p>
            <span class="valid-tit">重量总计(g)：</span>
            {{ validErrorData.productWeight + validErrorData.materialWeight }}
          </p>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="continueDeliverGoods">继续发货</Button>
        <Button @click="model5 = false">取消发货</Button>
      </div>
    </Modal>
    <Modal v-model="overbagModel.status" @on-ok="overBag">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            结袋
          </div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="overbagContent">
            <div class="flexBox flexBoxJustContent overbagShippingName normalTop">
              {{ overbagModel.overbagShippingName }}
            </div>
            <div class="flexBox flexBoxJustContent overbagParams normalTop">
              <span>{{ overbagModel.packageCount }}</span>
              个包裹
            </div>
            <div class="flexBox flexBoxJustContent overbagParams normalTop"
              v-if="storeagePackageSetting.indexOf('称重') >= 0">
              <span>{{ overbagModel.packageWeight / 1000 }} KG</span>
              总重
            </div>
            <div class="flexBox flexBoxJustContent normalTop">
              <Checkbox v-model="overbagModel.overbagConfirm">导出物流确认excel</Checkbox>
            </div>
          </div>
        </div>
      </div>
    </Modal>
    <!--供应商扫描标记发货结袋的确认弹窗-->
    <Modal v-model="supplierdeliveryModal" @on-ok="supplierQueryBtn">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            结袋
          </div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div class="overbagContent">
            <div class="flexBox flexBoxJustContent overbagParams normalTop">
              <span>{{ supplierDeliveryData.length }}</span>
              个包裹
            </div>
            <div class="flexBox flexBoxJustContent overbagParams normalTop"
              v-if="storeagePackageSetting.indexOf('称重') >= 0">
              <span>{{ supplierPackageWeight / 1000 }} KG</span>
              总重
            </div>
            <div class="flexBox flexBoxJustContent normalTop">
              <Checkbox v-model="supplierPrint">打印箱唛</Checkbox>
            </div>
          </div>
        </div>
      </div>
    </Modal>
    <Modal v-model="printTalg" class-name="printCaseMarkStyle" title="打印箱唛" width="500" :transfer="false"
      :mask-closable="false">
      <div class="printCaseMarkBox" ref="container" :style="styles">
        <p class="print_item">{{ '创建时间：' + $uDate.getDataToLocalTime(printInfo.createdTime, 'fulltime') }}</p>
        <font class="bar_code" style="font-family: IDAutomationC128S; margin-top: 10px;">{{ printInfo.skuBarcode }}
        </font>
        <p class="print_item" style="margin: 10px auto 5px">{{ printInfo.pickupOrderNumber }}</p>
        <p class="print_item">{{ '出库单数量：' + printInfo.packageQuantity }}</p>
      </div>
      <div ref="tagTemp" style="display: none;"></div>
    </Modal>

  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    packageDetails
  },
  data() {
    let v = this;
    return {
      isSliceIdentificationNumber: false,
      sliceStartLength: 0,
      sliceEndLength: 0,
      printTalg: false,
      // 标发货提示参数
      columns5: [
        {
          title: '图片',
          render(h, params) {
            return this.tableImg(h, params, 'pictureUrl');
          }
        }, {
          title: 'SKU',
          key: 'sku'
        }, {
          title: 'SKU',
          key: 'sku'
        }, {
          title: '产品重量' + '(g)',
          key: 'productWeight'
        }
      ],
      validErrorData: null,
      tabPane: '1',
      tabPaneText: [
        {
          label(h) {
            return h('div', '已扫描');
          },
          value: '1'
        }, {
          label(h) {
            return h('div', '已发货');
          },
          value: '2'
        }
      ],
      model4: false,
      model5: false,
      cacheFormInline: null,
      formInline: {
        enableWeight: 'Y', // 是否需要称重 N 不需要 Y 需要*/
        weightUnit: 'g', //  g , kg
        enableVolume: 'Y', // 是否需要量尺寸 N 不需要 Y 需要
        autoDelivery: 'Y', // 是否自动执行发货 Y 是 N 否
        singleWeightRemark: 'Y', // 单品称重异常提醒 Y是 N否
        singleTranscend: '', // 单品称重误差阀值 单位g
        singleTranscendPercent: '', // 单品称重误差百分比
        multiWeightRemark: 'Y', // 多品称重异常提醒 Y是 N否
        multiTranscend: '', // 多品称重误差阀值 单位g
        multiTranscendPercent: '', // 多品称重误差百分比
        eachPiecePostageRemark: 'Y', // 逐单扫描运费异常提醒 Y是 N否
        postageTranscend: '' // 运费误差阀值
      },
      localFormInline: {
        enableWeight: 'N',
        enableVolume: 'N'
      },
      ruleInline: {},
      disabledGroup: '0',
      disabled1Group: '0',
      paramsWeight: 0,
      weightTypeList: [
        {
          label: '克',
          value: 'g'
        }, {
          label: '千克',
          value: 'kg'
        }
      ],
      overbagModel: {
        status: false,
        overbagShippingName: '',
        packageCount: '',
        packageWeight: 0,
        overbagConfirm: true, // 默认勾选
        shippingMethodId: ''
      },
      packageModel: {
        shippingMethod: '',
        nation: '',
        postcode: '',
        code: '',
        waybillNo: '',
        weight: '',
        shippingMethodId: '',
        webstoreItemSite: 0
      },
      scanData: [],
      goodsData: [],
      scanColumn: [
        {
          title: '出库单号',
          key: 'packageCode',
          render(h, params) {
            return h('div', {
              style: {
                width: '130px'
              }
            }, [
              h('span', params.row.packageCode), h('Tooltip', {
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: params.row.error
                },
                style: {
                  marginLeft: '5px'
                }
              }, [
                h('Icon', {
                  props: {
                    type: 'md-information-circle',
                    size: 16
                  },
                  style: {
                    color: 'red',
                    display: (() => {
                      return params.row.error
                        ? 'inline-block'
                        : 'none';
                    })()
                  }
                })
              ])
            ]);
          }
        }, {
          title: '运单号',
          key: 'waybillNo'
        }, {
          title: '国家/地区',
          key: 'country'
        }, {
          title: '邮政编码',
          key: 'postcode'
        }, {
          title: '称重' + '(g)',
          key: 'weight',
          render(h, params) {
            return h('div', {}, [h('span', {}, params.row.weight)]);
          }
        }, {
          title: '操作',
          render(h, params) {
            return h('div', {
              style: {
                width: '100px'
              }
            }, [
              h('Button', {
                props: {
                  size: 'small',
                  type: 'error'
                },
                on: {
                  click() {
                    v.deleteSingleGoods(params.row.packageCode);
                  }
                }
              }, '删除'), h('Button', {
                props: { size: 'small' },
                style: {
                  marginLeft: '5px',
                  display: (() => {
                    return v.getPermission('packageInfo_scanMarkPackageDelivery')
                      ? 'line-block'
                      : 'none';
                  })()
                },
                on: {
                  click() {
                    v.tableSingleMarkGoods({
                      deliveryBatchNo: v.deliveryBatchNo,
                      flag: null,
                      height: params.row.height,
                      length: params.row.length,
                      packageId: params.row.packageId,
                      weight: params.row.weight,
                      width: params.row.width
                    }, params.row.packageCode);
                  }
                }
              }, '标发货') // 标发货
            ]);
          }
        }
      ],
      formItem: {
        height: '',
        width: '',
        length: '',
        weight: '',
        packageId: '',
        scan: ''
      },
      poptipModel: false,
      packageSettingModel: {
        settingSelect: [],
        weight: 'g',
        cacheWeight: 'g'
      },
      storeagePackageSetting: [],
      storeageNum: [1],
      deliveryBatchNo: '',
      shippingMethodPos: [],
      shippingGoodsMethodPos: [],
      clearTime: null,
      activeDeliver: null, // 缓存当前扫描数据
      isBatch: false,
      scanning_status: 0,
      scanning_time: '',
      supplierDeliveryData: [], // 供应商扫描标记发货的数据
      supplierPrint: false, // 供应商标记发货结袋是否打印箱唛
      supplierdeliveryModal: false,
      supplierPackageWeight: 0, // 供应商标记发货结袋时的总重量
      printInfo: {
        skuBarcode: null,
        createdTime: '',
        wmsPickupOrderNumberBarcode: null,
        pickupOrderNumber: null,
        packageQuantity: null
      },
      styles: {
        paddingTop: '15px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '17px',
        color: '#333',
        minWidth: '480px'
      }
    };
  },
  created() {
    let v = this;
    v.getDeliverySetting();
    /*   let exSetting = localStorage.getItem('exSetting');
     if (exSetting) {
     v.packageSettingModel.settingSelect = exSetting.split(',');
     v.storeagePackageSetting = exSetting.split(',');
     if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') >= 0) {
     v.storeageNum = [1, 2, 3, 4, 5];
     } else if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') < 0) {
     v.storeageNum = [1, 2];
     } else if (exSetting.indexOf('称重') < 0 && exSetting.indexOf('量尺寸') >= 0) {
     v.storeageNum = [1, 3, 4, 5];
     }
     }
     let weight = localStorage.getItem('cacheWeight');
     if (weight) {
     v.packageSettingModel.cacheWeight = weight;
     v.packageSettingModel.weight = weight;
     }
     */
    let scanSliceNumber = localStorage.getItem('scanSliceNumber');
    if (scanSliceNumber) {
      let data = JSON.parse(scanSliceNumber);
      v.isSliceIdentificationNumber = data.isSliceIdentificationNumber;
      v.sliceStartLength = data.sliceStartLength;
      v.sliceEndLength = data.sliceEndLength;
    }
    v.axios.get(api.get_deliveryBatchNo).then(response => {
      if (response.data.code === 0) {
        v.deliveryBatchNo = response.data.datas;
      }
    });
    v.$store.commit('active', '88889-888892');
  },
  methods: {
    saveLocalData() {
      localStorage.setItem('scanSliceNumber', JSON.stringify({
        isSliceIdentificationNumber: this.isSliceIdentificationNumber,
        sliceStartLength: this.sliceStartLength,
        sliceEndLength: this.sliceEndLength
      }));
    },
    model4Visible(n) {
      if (n) {
        this.cacheFormInline = JSON.parse(JSON.stringify(this.formInline));
      } else {
        this.formInline = JSON.parse(JSON.stringify(this.cacheFormInline));
      }
    },
    paramData(flag) {
      let v = this;
      // flag 关乎包裹回收
      let params = {
        deliveryBatchNo: v.deliveryBatchNo,
        flag: null,
        height: v.formItem.height,
        length: v.formItem.length,
        packageId: v.formItem.packageId,
        weight: v.paramsWeight,
        width: v.formItem.width,
        unit: v.packageSettingModel.weight
      };
      if (flag) {
        params.flag = 1;
      }
      return params;
    },
    continueDeliverGoods() {
      let v = this;
      v.model5 = false;
      if (v.formInline.autoDelivery === 'Y') {
        v.singleMarkGoods(null, null, v.activeDeliver);
      } else {
        v.addScanOrSendGood('scanned', v.activeDeliver);
      }
    },
    validPackage(flag) {
      let v = this;
      let params = v.paramData(flag);
      params.warehouseId = v.getWarehouseId();
      v.axios.put(api.validateDeliveryPackage, params).then(res => {
        v.$nextTick(() => {
          v.formItem.weight = '';
          v.scanning_status = 0;
        });
        if (res.data.code === 0) {
          clearInterval(v.scanning_time);
          if (res.data.datas.validate) {
            // 校验成功
            if (v.formInline.autoDelivery === 'Y') {
              v.singleMarkGoods(null, null, {
                ...params,
                packageCode: v.packageModel.code,
                waybillNo: v.packageModel.waybillNo,
                country: v.packageModel.nation,
                postcode: v.packageModel.postcode,
                weight: v.paramsWeight,
                shippingMethodId: v.packageModel.shippingMethodId,
                shippingMethod: v.packageModel.shippingMethod
              });
            } else {
              v.addScanOrSendGood('scanned', {
                ...params,
                packageCode: v.packageModel.code,
                waybillNo: v.packageModel.waybillNo,
                country: v.packageModel.nation,
                postcode: v.packageModel.postcode,
                weight: v.paramsWeight,
                shippingMethodId: v.packageModel.shippingMethodId,
                shippingMethod: v.packageModel.shippingMethod
              });
            }
          } else {
            res.data.datas.productWeight = res.data.datas.productWeight
              ? res.data.datas.productWeight
              : 0;
            res.data.datas.materialWeight = res.data.datas.materialWeight
              ? res.data.datas.materialWeight
              : 0;
            v.validErrorData = res.data.datas;
            v.activeDeliver = {
              ...params,
              packageCode: v.packageModel.code,
              waybillNo: v.packageModel.waybillNo,
              country: v.packageModel.nation,
              postcode: v.packageModel.postcode,
              weight: v.paramsWeight,
              shippingMethodId: v.packageModel.shippingMethodId,
              shippingMethod: v.packageModel.shippingMethod
            };
            v.model5 = true;
            // 校验失败
          }
        }
      }).catch(() => {
      });
    },
    singleMarkGoods(flag, initParams, tableItem) {
      let v = this;
      //  单个标发货
      let params = initParams || v.paramData(flag);
      params.warehouseId = v.getWarehouseId();
      delete params.flag; // #IDY-4665
      v.axios.put(api.markPackageDelivery, params).then(res => {
        if (res.data.code === 0) {
          v.addScanOrSendGood('goods', tableItem);
          v.scanData.forEach((i, index) => {
            i.forEach((j, childIndex) => {
              if (j.packageCode === tableItem.packageCode) {
                if (v.scanData[index].length <= 1) {
                  v.scanData.splice(index, 1);
                  v.shippingMethodPos.splice(index, 1);
                } else {
                  v.scanData[index].splice(childIndex, 1);
                }
              }
            });
          });
          v.$Message.success('标发货成功');
        }
      }).catch(() => {
      });
    },
    tableSingleMarkGoods(params, packageCode) {
      let v = this;
      params.warehouseId = v.getWarehouseId();
      delete params.flag; // #IDY-4665
      v.axios.put(api.markPackageDelivery, params).then(res => {
        if (res.data.code === 0) {
          v.scanData.forEach((i, index) => {
            i.forEach((j, childIndex) => {
              if (j.packageCode === packageCode) {
                v.addScanOrSendGood('goods', {
                  packageCode: j.packageCode,
                  waybillNo: j.waybillNo,
                  country: j.country,
                  postcode: j.postcode,
                  weight: j.weight,
                  shippingMethodId: j.shippingMethodId,
                  shippingMethod: j.shippingMethod
                });
                if (v.scanData[index].length <= 1) {
                  v.scanData.splice(index, 1);
                  v.shippingMethodPos.splice(index, 1);
                } else {
                  v.scanData[index].splice(childIndex, 1);
                }
              }
            });
          });
          v.$Message.success('标发货成功');
        }
      }).catch(() => {
      });
    },
    deleteSingleGoods(packageCode) {
      let v = this;
      v.isDelModal(() => {
        v.scanData.forEach((i, index) => {
          i.forEach((j, childIndex) => {
            if (j.packageCode === packageCode) {
              if (v.scanData[index].length <= 1) {
                v.scanData.splice(index, 1);
                v.shippingMethodPos.splice(index, 1);
              } else {
                v.scanData[index].splice(childIndex, 1);
              }
            }
          });
        });
      });
    },
    deleteAllGoods() {
      let v = this;
      if (v.scanData.length > 0) {
        v.isDelModal(() => {
          v.scanData = [];
        });
      }
    },
    batchMarkGoods(obj) {
      let v = this;
      let params;
      if (obj) {
        params = obj;
      } else {
        params = {
          flag: null,
          packages: []
        };
        let arr = [];
        if (v.scanData.length === 0) return;
        v.scanData.forEach(i => {
          i.forEach(j => {
            arr.push(j);
          });
        });
        params.packages = arr;
      }
      delete params.flag; // # IDY-4665
      params.warehouseId = v.getWarehouseId();
      v.axios.put(api.scanBatchMarkPackageDelivery, params).then(res => {
        if (res.data.code === 0) {
          // 异常包裹保留
          let data = res.data.datas;
          let arr = [];
          v.scanData = [];
          v.shippingMethodPos = [];
          if (data.exceptions && data.exceptions.length > 0) {
            data.exceptions.forEach(i => {
              v.scanData.forEach(j => {
                j.forEach(k => {
                  if (k.packageId === i.packageId) {
                    arr.push({
                      ...k,
                      error: i.error,
                      errorCode: i.errorCode,
                      packageCode: i.packageCode
                    });
                  }
                });
              });
            });
            arr.forEach(i => {
              v.$nextTick(() => {
                v.addScanOrSendGood('scanned', i);
              });
            });
          }
          if (data.successPackages && data.successPackages.length > 0) {
            // 标发货成功的包裹
            params.packages.forEach(i => {
              data.successPackages.forEach(j => {
                if (i.packageCode === j.packageCode) {
                  j.weight = i.weight;
                }
              });
            });
            data.successPackages.forEach(i => {
              v.$nextTick(() => {
                v.addScanOrSendGood('goods', {
                  packageCode: i.packageCode,
                  waybillNo: i.trackingNumber,
                  country: i.buyerCountryCode,
                  postcode: i.buyerPostalCode,
                  weight: i.weight,
                  shippingMethodId: i.shippingMethodId,
                  shippingMethod: i.shippingMethodName
                });
              });
            });
            v.scanData.forEach((i, index) => {
              i.forEach((j, childIndex) => {
                data.successPackages.forEach(k => {
                  if (j.packageCode === k.packageCode) {
                    if (v.scanData[index].length <= 1) {
                      v.scanData.splice(index, 1);
                      v.shippingMethodPos.splice(index, 1);
                    } else {
                      v.scanData[index].splice(childIndex, 1);
                    }
                  }
                });
              });
            });
          }
        }
      }).catch(() => {
      });
    },
    addScanOrSendGood(type, params) {
      // 添加到已扫描或者已发货
      let v = this;
      if (type === 'scanned') {
        v.tabPane = '1';
        let tbj = {};
        if (params) {
          tbj = params;
        }
        if (v.shippingMethodPos.indexOf(tbj.shippingMethod) < 0) {
          v.shippingMethodPos.push(tbj.shippingMethod);
          v.scanData.push([tbj]);
        } else {
          let i = v.shippingMethodPos.indexOf(tbj.shippingMethod);
          let valid = false;
          v.scanData[i].forEach(i => {
            if (i.packageCode === tbj.packageCode) {
              valid = true;
            }
          });
          if (valid) {
            v.$Message.error('此包裹已存在');
            return;
          }
          v.scanData[i].push(tbj);
        }
      } else if (type === 'goods') {
        v.tabPane = '2';
        let tbj = {};
        if (params) {
          tbj = params;
        } else {
          tbj = {
            packageCode: v.packageModel.code,
            waybillNo: v.packageModel.waybillNo,
            country: v.packageModel.nation,
            postcode: v.packageModel.postcode,
            weight: v.paramsWeight,
            shippingMethodId: v.packageModel.shippingMethodId
          };
        }
        if (v.shippingGoodsMethodPos.indexOf(tbj.shippingMethod) < 0) {
          v.shippingGoodsMethodPos.push(tbj.shippingMethod);
          v.goodsData.push([tbj]);
        } else {
          let i = v.shippingGoodsMethodPos.indexOf(tbj.shippingMethod);
          v.goodsData[i].push(tbj);
        }
        v.supplierDeliveryData.push(tbj);
      }
      v.formItem.scan = '';
      v.formItem.weight = '';
      v.formItem.length = '';
      v.formItem.width = '';
      v.formItem.height = '';
      v.paramsWeight = 0;
      v.$refs['input1'].focus();
    },
    paramsHandel() {
      let v = this;
      let arr = [];
      v.disabledGroup === '0'
        ? (v.formInline.singleTranscendPercent = '')
        : (v.formInline.singleTranscend = '');
      v.disabled1Group === '0'
        ? (v.formInline.multiTranscendPercent = '')
        : (v.formInline.multiTranscend = '');
      for (let key in v.formInline) {
        arr.push({
          paramKey: key,
          paramValue: v.formInline[key]
        });
      }
      return arr;
    },
    saveDeliverySetting() {
      let v = this;
      let params = v.paramsHandel();
      v.axios.post(api.set_DeliverySetting, {
        paramBoList: params
      }).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('保存成功');
          for (let key in v.formItem) {
            v.formItem[key] = '';
          }
          v.model4 = false;
          v.getDeliverySetting();
        }
      }).catch(() => {
      });
    },
    getDeliverySetting() {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.get_DeliverySetting).then(res => {
          if (res.data.code === 0) {
            res.data.datas.forEach(i => {
              for (let key in v.formInline) {
                if (i.paramKey === key) {
                  v.formInline[key] = i.paramValue;
                }
              }
            });
            v.formInline.singleTranscendPercent === ''
              ? (v.disabledGroup = '0')
              : (v.disabledGroup = '1');
            v.formInline.multiTranscendPercent === ''
              ? (v.disabled1Group = '0')
              : (v.disabled1Group = '1');
            v.localFormInline = Object.assign({}, v.formInline);
            if (v.formInline.enableWeight === 'Y' && v.formInline.enableVolume === 'Y') {
              v.storeageNum = [1, 2, 3, 4, 5];
            } else if (v.formInline.enableWeight === 'Y' && v.formInline.enableVolume === 'N') {
              v.storeageNum = [1, 2];
            } else if (v.formInline.enableWeight === 'N' && v.formInline.enableVolume === 'Y') {
              v.storeageNum = [1, 3, 4, 5];
            }
            v.packageSettingModel.cacheWeight = v.formInline.weightUnit;
            v.packageSettingModel.weight = v.formInline.weightUnit;
            resolve();
          }
        }).catch(() => {
        });
      });
    },
    cancelPoptip() {
      this.poptipModel = false;
    },
    savePoptip() {
      let v = this;
      localStorage.setItem('exSetting', v.packageSettingModel.settingSelect);
      localStorage.setItem('cacheWeight', v.packageSettingModel.cacheWeight);
      v.storeagePackageSetting = v.packageSettingModel.settingSelect;
      let exSetting = localStorage.getItem('exSetting');
      if (exSetting) {
        v.packageSettingModel.settingSelect = exSetting.split(',');
        v.storeagePackageSetting = exSetting.split(',');
        if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') >= 0) {
          v.storeageNum = [1, 2, 3, 4, 5];
        } else if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') < 0) {
          v.storeageNum = [1, 2];
        } else if (exSetting.indexOf('称重') < 0 && exSetting.indexOf('量尺寸') >= 0) {
          v.storeageNum = [1, 3, 4, 5];
        }
      } else {
        v.storeageNum = [1];
      }
      if (v.packageSettingModel.weight !== v.packageSettingModel.cacheWeight && v.formItem.weight) {
        if (v.packageSettingModel.cacheWeight === 'g') {
          v.formItem.weight = (v.formItem.weight * 1000).toFixed(2);
        } else {
          v.formItem.weight = (v.formItem.weight / 1000).toFixed(2);
        }
      }
      v.packageSettingModel.weight = v.packageSettingModel.cacheWeight;
      v.poptipModel = false;
    },
    goNextInput(num) {
      let v = this;
      // const l = v.storeageNum.length;
      // const cur = v.storeageNum.indexOf(num);
      let xi = v.packageSettingModel.weight === 'kg'
        ? 1000
        : 1; // 如果是kg 需乘1000
      if (v.formItem.scan === '') {
        v.$Message.error('包裹号不能为空');
        return false;
      }
      if (num > 1) {
        this.paramsWeight = Number(this.formItem.weight * xi).toFixed(2);
        /* let reg = /^\d*(\.)?(\d{1,2})?$/;
         let value = this.$refs['input' + num].value;
         if (!reg.test(value)) {
         v.$Message.error('该选项只允许输入整数或两位小数');
         return false;
         } */
      }
      if (num === 1 && v.formItem.scan !== '') {
        v.formItem.weight = '';
        if (v.formInline.enableWeight === 'Y') {
          v.$refs['input2'].focus();
        }
        if (!v.getPermission('packageInfo_getPackageByCode')) {
          v.$Message.error('无权限');
          return;
        }
        let identificationNumber = v.formItem.scan;
        if (v.isSliceIdentificationNumber) {
          if (v.sliceStartLength) identificationNumber = identificationNumber.slice(v.sliceStartLength);
          if (v.sliceEndLength) identificationNumber = identificationNumber.slice(0, identificationNumber.length - v.sliceEndLength);
        }
        v.axios.put(api.get_packageByCode, {
          'code': identificationNumber,
          'warehouseId': v.getWarehouseId()
        }).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.packageModel.code = data.packageCode;
            v.packageModel.postcode = data.buyerPostalCode;
            v.packageModel.nation = data.buyerCountryCode;
            v.packageModel.shippingMethod = data.carrierName + ' > ' + data.shippingMethodName;
            v.packageModel.waybillNo = data.trackingNumber;
            v.packageModel.shippingMethodId = data.shippingMethodId;
            v.packageModel.webstoreItemSite = data.webstoreItemSite;
            v.formItem.packageId = data.packageId;
            v.scanning_status = 1;
            if (v.formInline.enableWeight === 'Y') {
              // v.$refs['input2'].focus();
            } else if (v.formInline.enableVolume === 'Y') {
              v.$refs['input3'].focus();
            } else {
              v.validPackage(); // 检查是否有异常
            }
          } else {
            v.$refs['input1'].focus();
            v.scanning_status = 0;
          }
        });
      } else if (num === 2) {
        v.paramsWeight = Number(v.formItem.weight * xi).toFixed(2);
        v.formItem.length = '';
        v.formItem.width = '';
        v.formItem.height = '';
        if (v.formInline.enableVolume === 'Y') {
          v.$refs['input2'].focus();
        } else {
          v.scanning_time = setInterval(() => {
            v.scanning_status === 1 && v.validPackage();
          }, 1000);
        }
      } else if (num === 3) {
        v.$refs['input4'].focus();
      } else if (num === 4) {
        v.$refs['input5'].focus();
      } else if (num === 5) {
        v.validPackage(); // 检查是否有异常
      }
      /*
       if (cur === l - 1 && l !== 1) {
       v.validPackage(); // 检查是否有异常
       // v.setMarkPackage();
       } else if (cur !== l - 1 && num !== 1) {
       v.$refs['input' + (num + 1)].focus();
       } */
    },
    toFixedTwo(e) {
      this.formItem.weight = Number(this.formItem.weight).toFixed(2);
    },
    keepOut() {
      if (this.isBatch) {
        this.batchMarkGoods(this.activeDeliver);
      } else {
        this.tableSingleMarkGoods(this.activeDeliver, this.activeDeliver.packageCode);
      }
    },
    goCancel() {
      this.$router.push({ path: 'cancelPackage', query: { warehouseId: this.getWarehouseId() } });
    },
    setMarkPackage(flag) {
      // 标记包裹出库
      let v = this;
      let obj = v.deepCopy(v.formItem);
      delete obj.scan;
      obj.deliveryBatchNo = v.deliveryBatchNo;
      obj.weight = v.paramsWeight;
      /* if (flag) {
       obj.flag = 1;
       } */
      delete obj.flag;
      v.axios.put(api.set_markPackageDelivery, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let tbj = {
            packageCode: v.packageModel.code,
            waybillNo: v.packageModel.waybillNo,
            country: v.packageModel.nation,
            postcode: v.packageModel.postcode,
            weight: v.paramsWeight,
            shippingMethodId: v.packageModel.shippingMethodId
          };
          if (v.shippingMethodPos.indexOf(v.packageModel.shippingMethod) < 0) {
            v.shippingMethodPos.push(v.packageModel.shippingMethod);
            v.scanData.push([tbj]);
          } else {
            let i = v.shippingMethodPos.indexOf(v.packageModel.shippingMethod);
            v.scanData[i].push(tbj);
          }
          v.formItem.scan = '';
          v.formItem.weight = '';
          v.formItem.length = '';
          v.formItem.width = '';
          v.formItem.height = '';
          v.paramsWeight = 0;
          v.$refs['input1'].focus();
        }
      });
    },
    setPackageOver(item, index) {
      let v = this;
      v.overbagModel.status = true;
      v.overbagModel.overbagShippingName = item[0].shippingMethod;
      v.overbagModel.packageCount = v.goodsData[index].length;
      v.overbagModel.packageWeight = 0;
      v.goodsData[index].forEach((n, i) => {
        v.overbagModel.packageWeight = Number(n.weight) + Number(v.overbagModel.packageWeight);
      });
      v.overbagModel.shippingMethodId = item[0].shippingMethodId;
    },
    // 供应商标记发货的结袋按钮
    supplierBaggingBtn() {
      this.supplierdeliveryModal = true;
      this.supplierDeliveryData.map((item) => {
        this.supplierPackageWeight += Number(item.weight);
      });
    },
    // 供应商标记发货结袋弹窗的确认按钮
    supplierQueryBtn() {
      let v = this;
      let query = {
        packageCodes: [],
        print: v.supplierPrint
      };
      if (v.supplierDeliveryData.length > 0) {
        v.supplierDeliveryData.map((item) => {
          query.packageCodes.push(item.packageCode);
        });
      }
      v.axios.post(api.post_wmsPickupOrder_packageBagging, query).then((response) => {
        if (response.data.code === 0) {
          if (response.data.datas.wmsPrintPickupOrderResultBo) {
            v.printInfo = response.data.datas.wmsPrintPickupOrderResultBo;
            v.printInfo.skuBarcode = v.entityToString(v.printInfo.wmsPickupOrderNumberBarcode);
          }
          if (v.printInfo && v.supplierPrint) {
            v.$nextTick(() => {
              v.printBtn();
            });
          }
          if (!v.supplierPrint) {
            v.$Message.success('操作成功！');
          }
          v.supplierdeliveryModal = false;
          v.supplierDeliveryData = [];
        }
      });
    },
    overBag() {
      let v = this;
      if (v.overbagModel.overbagConfirm) {
        let newTab = window.open('about:blank');
        v.axios.get(api.set_packageOverBag + '?deliveryBatchNo=' + v.deliveryBatchNo + '&&shippingMethodId=' + v.overbagModel.shippingMethodId).then(response => {
          if (response.data.code === 0) {
            let erpCommon = v.$store.state.erpConfig;
            newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 2000);
          } else {
            newTab.close();
          }
        });
      }
    },
    gotoExwarehouse() {
      this.$router.push({ path: '/exwarehouse', query: { warehouseId: this.getWarehouseId() } });
    },
    printBtn() {
      let v = this;
      let instance = v.axios.create({
        timeout: 3000,
        transformRequest: [
          function (data) {
            let ret = '';
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            return ret;
          }
        ],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      instance.post('http://localhost:10099/print', {
        content: v.htm5Doc(),
        postId: '1'
      }).then(response => {
        if (response.status === 200) {
          v.$Message.success('操作成功');
        }
      }).catch(() => {
        let url = this.$store.state.erpConfig.filenodeViewTargetUrl + '/wms-service/tool/TongtoolPrinter.exe';
        v.$Modal.info({
          width: 400,
          content: `请下载打印控件<a href=${url}>点击下载</a>`
        });
      });
    },
    htm5Doc() {
      let path = `${window.location.origin}/wms-service/static/printFont/`;
      return (`<!DOCTYPE html>
                  <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <title>Title</title>
                    <style type="text/css">
                    *{margin: 0;padding: 0}
                @media print {.btn{display: none;}}
                @font-face {
                  font-family: 'IDAutomationC128S';
                  src: url('${path}IDAutomationC128S.eot'); /* IE9 Compat Modes */
                  src: url('${path}IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
                  url('${path}IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
                  url('${path}IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
                  url('${path}IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
                }

                @font-face {
                  font-family: 'IDAutomationSC39S';
                  src: url('${path}IDAutomationSC39S.eot'); /* IE9 Compat Modes */
                  src: url('${path}IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
                  url('${path}IDAutomationSC39S.ttf') format('truetype');
                }
                </style>
                    </head>
                     <body class="box">` + this.htmlText() + `
                     </body>
                  </html>`);
    },
    htmlText(callback) {
      let v = this;
      let html = '';
      let dom = v.deepCopy(v.$refs.container);
      let tagTempBoxs = v.$refs.tagTemp;
      tagTempBoxs.innerHTML = dom.parentNode.innerHTML;
      let container = tagTempBoxs.childNodes[0];
      if (v.printInfo) {
        container.childNodes[0].innerText = '创建时间：' + v.$uDate.getDataToLocalTime(v.printInfo.createdTime, 'fulltime');
        container.childNodes[1].innerText = v.printInfo.skuBarcode;
        container.childNodes[2].innerText = v.printInfo.pickupOrderNumber;
        container.childNodes[3].innerText = '出库单数量：' + v.printInfo.packageQuantity;
        callback && callback();
        html += tagTempBoxs.innerHTML;
        return html;
      }
    }
  },
  computed: {
    goodsColumn() {
      let v = this;
      if (v.scanColumn) {
        let arr = JSON.parse(JSON.stringify(v.scanColumn));
        arr.splice(-1, 1);
        return arr;
      } else {
        return [];
      }
    },
    isSupplier() {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    }
  }
};
</script>
<style lang="less">
.scanExPage {
  .ivu-tooltip-inner {
    width: 250px;
    white-space: normal;
  }
}
</style>
<style lang="less" scoped>
.printCaseMarkBox {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 17px;
  color: #333;

  .print_item {
    margin-bottom: 10px;
  }

  .bar_code {
    padding: 5px 10px;
  }
}

.w-40 {
  width: 40px;
}

.inline-block {
  display: inline-block;
}
</style>
