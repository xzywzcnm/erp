<template >
  <div>
    <!--设置查看-->
    <Modal
      v-model="setShippingModel"
      scrollable
      :title="`${looKsettings ? '查看' : '编辑'}物流渠道`"
      @input="data => $emit('input', data)"
      width="1200"
      :mask-closable="false"
      @on-visible-change="visible2"
    >
      <Spin v-if="loading4 || pageInitLoading" fix style="position: sticky; top: -16px; height: calc(100vh - 265px);">
        <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        <div>Loading</div>
      </Spin>
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <!--渠道基础信息-->
          <Form :label-width="90" :disabled="(looKsettings || cannotSave)">
            <div class="modalItem">
              <div class="modalItemHeader">
                <div class="title-h6">渠道基础信息</div>
              </div>
              <div class="modalItemContent clear p10">
                <Row>
                  <Col span="12">
                  <span class="normalRMargin fontBold">物流商：</span> {{
                      logisticsChannelModalParams.carrierShippingMethod.carrierName
                  }}
                  </Col>
                  <Col span="11" v-if="logisticsChannelModalParams.carrierShippingMethod.carrierType">
                  <span class="normalRMargin fontBold">物流商类型：</span>
                  <span v-if="logisticsChannelModalParams.carrierShippingMethod.carrierType === 1">无对接</span><span
                    v-if="logisticsChannelModalParams.carrierShippingMethod.carrierType === 2">Excel对接</span>
                  </Col>
                </Row>
                <Row class="normalTop">
                  <Col :span="12">
                  <span class="normalRMargin fontBold redDot">物流渠道名称：</span>
                  <Input
                    style="width: 300px;" size="small" ref="carrierShippingMethodName"
                    v-model="logisticsChannelModalParams.carrierShippingMethod.carrierShippingMethodName"
                    :key="'cccccc'" :maxlength="100" />
                  </Col>
                  <Col :span="11">
                  <span class="fontBold redDot">物流渠道代码：</span>
                  <Input
                    style="width: 300px;" size="small" ref="carrierShippingMethodCode"
                    v-model="logisticsChannelModalParams.carrierShippingMethod.carrierShippingMethodCode"
                    :maxlength="100" />
                  </Col>

                </Row>
                <Row class="normalTop">
                  <Col :span="12">
                    <span class="normalRMargin fontBold">保险服务：</span>
                    <dyt-select class="w300" size="small" v-model="logisticsChannelModalParams.carrierShippingMethod.isInsurance">
                      <Option v-for="item in YesOrNolist" :key="item.value" :value="item.value">{{ item.label }}</Option>
                    </dyt-select>
                  </Col>
                  <Col :span="11">
                    <span class="normalRMargin fontBold">跳过下发物流：</span>
                    <CheckboxGroup v-model="logisticsChannelModalParams.skipLogistics" style="display: inline-block">
                      <Checkbox :label="1">
                        <span>跳过</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </Col>
                </Row>
                <Row class="normalTop">
                  <Col :span="11">
                  <span class="normalRMargin fontBold">追踪信息查询网址：</span> <Input style="width:260px" size="small"
                    v-model='logisticsChannelModalParams.carrierShippingMethod.trackUrl' />
                  </Col>
                </Row>
                <div class="normalTop">
                  <span class="normalRMargin fontBold">发货说明：</span>
                  <Input v-model="logisticsChannelModalParams.carrierShippingMethod.remark" type="textarea" />
                </div>
              </div>
            </div>
            <div class="modalItem">
              <div class="modalItemHeader flex-center-between">
                <div class="title-h6">物流限制</div>
                <div class="country-operate-btn">
                  <Button type="primary" @click="openImportRestrictionModal">导入</Button>
                  <Button class="ml10" type="primary" @click="exportLogisticsRestriction" :loading="logisticsLimitExport">导出</Button>
                </div>
              </div>
              <div class="modalItemContent clear p10">
                <div class="country-tab-module">
                  <Icon class="move-left" type="md-play" @click="moveTagCrosswiseAxle('left')" :class="{'disabled-move' : !leftVisible}" />
                  <div class="country-tab-box">
                    <div class="country-tab-content">
                      <div id="countryTabContent" class="move-box">
                        <div
                          v-for="(cKey, cIndex) in countryLogisticsLimitKeys"
                          :key="`${cKey}-${cIndex}`"
                          @click="switchoverCountry($event, cKey)"
                          class="country-tab-item"
                          :class="{
                            'active-country-tab': activeTemporaryId == cKey
                          }"
                          :title="countryLogisticsLimitJson[cKey].countryNameTxt || ''"
                        >
                          <span class="country-tab-txt">{{ countryLogisticsLimitJson[cKey].countryNameTxt }}</span>
                          <span @click.stop="openSetCountryModal(cKey)" class="country-tab-set" v-if="cIndex != 0 && !(looKsettings || cannotSave)" title="设置">
                            <Icon type="md-settings" />
                          </span>
                          <span @click.stop="handleTabRemove(cKey)" class="country-tab-remove" v-if="cIndex != 0 && !(looKsettings || cannotSave)" title="移除">
                            <Icon type="md-close" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="add-country-item" title="添加" v-if="!(looKsettings || cannotSave)" @click="openSetCountryModal('')">
                      <Icon type="md-add" />
                    </div>
                  </div>
                  <Icon class="move-right" type="md-play" @click="moveTagCrosswiseAxle('right')" :class="{'disabled-move' : !rightVisible}" />
                </div>
                <div class="country-tab-view" v-if="countryLogisticsLimitJson[activeTemporaryId]">
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">参考时效(天)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-minEfficiency`" size="small" class="w100" :min="0" :max="999"
                      @on-blur="blurChange('minEfficiency')" v-model="countryLogisticsLimitJson[activeTemporaryId].minEfficiency"
                    />
                    -
                    <InputNumber :ref="`${activeTemporaryId}-maxEfficiency`" :min="0" size="small" :max="999" class="w100"
                      @on-blur="blurChange('maxEfficiency')" v-model="countryLogisticsLimitJson[activeTemporaryId].maxEfficiency"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">最大尺寸限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxLength`" :min="0" :max="999999" @on-blur="blurChange('maxLength')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxLength" size="small"
                    />
                    *
                    <InputNumber :ref="`${activeTemporaryId}-maxWidth`" :min="0" :max="999999" @on-blur="blurChange('maxWidth')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxWidth" size="small"
                    />
                    *
                    <InputNumber :ref="`${activeTemporaryId}-maxHeight`" :min="0" :max="999999" @on-blur="blurChange('maxHeight')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxHeight" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">最小尺寸限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-minLength`" :min="0" :max="999999" @on-blur="blurChange('minLength')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].minLength" size="small"
                    />
                    *
                    <InputNumber :ref="`${activeTemporaryId}-minWidth`" :min="0" :max="999999" @on-blur="blurChange('minWidth')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].minWidth" size="small"
                    />
                    *
                    <InputNumber :ref="`${activeTemporaryId}-minHeight`" :min="0" :max="999999" @on-blur="blurChange('minHeight')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].minHeight" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">周长限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxPerimeter`" :min="0" :max="999999" @on-blur="blurChange('maxPerimeter')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxPerimeter" size="small"
                    />
                    </div>
                    <div class="flex-item">
                    <span class="normalRMargin fontBold">最长边限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxDimensionsLength`" :min="0" :max="999999" @on-blur="blurChange('maxDimensionsLength')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxDimensionsLength" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">最长两边和限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxLongestTwoSidesAnd`" :min="0" :max="999999" @on-blur="blurChange('maxLongestTwoSidesAnd')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxLongestTwoSidesAnd" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">三边和限制(cm)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxThreeSidesAnd`" :min="0" :max="999999" @on-blur="blurChange('maxThreeSidesAnd')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxThreeSidesAnd" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">体积限制(cm³)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-minVolume`" :min="0" :max="999999" @on-blur="blurChange('minVolume')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].minVolume" size="small"
                    />
                    到
                    <InputNumber :ref="`${activeTemporaryId}-maxVolume`" :min="0" :max="999999" @on-blur="blurChange('maxVolume')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxVolume" size="small"
                    />
                  </div>
                  <div class="flex-item">
                    <span class="normalRMargin fontBold">适用重量 (g)：</span>
                    <InputNumber :ref="`${activeTemporaryId}-minWeight`" :min="0" :max="999999" @on-blur="blurChange('minWeight')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].minWeight" size="small"
                    />
                    <span style="margin:0 5px;">到</span>
                    <InputNumber :ref="`${activeTemporaryId}-maxWeight`" :min="0" :max="999999" @on-blur="blurChange('maxWeight')"
                      v-model="countryLogisticsLimitJson[activeTemporaryId].maxWeight" size="small"
                    />
                  </div>
                  <div class="flex-item flex-full-item">
                    <span class="normalRMargin fontBold redDot">接收类型：</span>
                    <CheckboxGroup v-model="countryLogisticsLimitJson[activeTemporaryId].acceptableType" style="display: inline-block">
                      <Checkbox label="01">
                        <span>普货</span>
                      </Checkbox>
                      <Checkbox label="02">
                        <span>纯电池</span>
                      </Checkbox>
                      <Checkbox label="03">
                        <span>配套电</span>
                      </Checkbox>
                      <Checkbox label="04">
                        <span>液体</span>
                      </Checkbox>
                      <Checkbox label="05">
                        <span>药品</span>
                      </Checkbox>
                      <Checkbox label="06">
                        <span>粉末</span>
                      </Checkbox>
                      <Checkbox label="07">
                        <span>危险品</span>
                      </Checkbox>
                      <Checkbox label="08">
                        <span>内置电池</span>
                      </Checkbox>
                      <Checkbox label="09">
                        <span>纽扣电池</span>
                      </Checkbox>
                      <Checkbox label="10">
                        <span>带磁</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>
                </div>
              </div>
            </div>
          </Form>
          <div class="normalTop">
            <Form ref="shippingParams" :label-width="90" label-position="right">
              <template>
                <div class="modalItem" v-if="shippingParams.carrierParams && shippingParams.carrierParams.length > 0">
                  <div class="modalItemHeader">
                    <div class="title-h6">物流商可选设置(默认设置)</div>
                  </div>
                  <div class="modalItemContent clear">
                    <div class="modalItemPadding">
                      <template v-if="shippingParams.carrierParams && shippingParams.carrierParams.length > 0"
                        v-for="(item, cpIndex) in shippingData.carrierParams">
                        <FormItem v-if="item.paramType === 'hide'" v-show="false" :label="item.paramName"
                          style="width:300px;float:left" prop="paramValue" :key="cpIndex">
                          <!-- 缓存数据，不显示 -->
                          <span v-if="item.paramType === 'hide'" v-show="false">{{
                              shippingParams.carrierParams[cpIndex].paramValue
                          }}</span>
                        </FormItem>
                        <FormItem v-else :label="item.paramName" style="width:300px;float:left" prop="paramValue"
                          :key="`else-${cpIndex}`">
                          <Input v-if="item.paramType === 'input'" :disabled="(looKsettings || cannotSave)"
                            v-model.trim="shippingParams.carrierParams[cpIndex].paramValue"></Input>
                          <dyt-select v-if="item.paramType === 'select'" :disabled="(looKsettings || cannotSave)"
                            v-model="shippingParams.carrierParams[cpIndex].paramValue">
                            <Option v-for="(subItem, t) in item.carrierParamDictionaryList" :key="t"
                              :value="subItem.itemValue">{{ subItem.itemName }}</Option>
                          </dyt-select>
                          <RadioGroup v-if="item.paramType === 'radio'" :disabled="(looKsettings || cannotSave)"
                            v-model="shippingParams.carrierParams[cpIndex].paramValue">
                            <Radio v-for="(subItem, t) in item.carrierParamDictionaryList" :key="t"
                              :label="subItem.itemValue">{{ subItem.itemName }}</Radio>
                          </RadioGroup>
                          <CheckboxGroup v-if="item.paramType === 'check'" :disabled="(looKsettings || cannotSave)"
                            v-model="shippingParams.carrierParams[cpIndex].paramValue">
                            <Checkbox v-for="(subItem, t) in item.carrierParamDictionaryList" :key="t"
                              :label="subItem.itemValue"></Checkbox>
                          </CheckboxGroup>
                        </FormItem>
                      </template>
                    </div>
                  </div>
                </div>
                <!--派送范围及运费-->
                <div class="modalItem">
                  <div class="modalItemHeader">
                    <div class="title-h6">派送范围及运费</div>
                  </div>
                  <div class="p10">
                    <p class="fontWeight">派送范围</p>
                    <RadioGroup v-model="arriveableType">
                      <Radio v-for="(item, index) in sendUsageType" :key="index" :label="item.value" :disabled="(looKsettings || cannotSave)">
                        <span>{{ item.text }}</span>
                      </Radio>
                    </RadioGroup>
                  </div>
                  <div class="p10">
                    <div class="fontWeight mb10 flex-center-between">
                      <div>计费模型</div>
                      <div style="text-align: right;">
                        <Button :loading="downLoading" size="small" class="mr5" v-if="permission.exportExcel && shippingMethodId" @click="exportPriceZone">导出</Button>
                        <Button
                          size="small"
                          v-if="permission.importExcel"
                          @click="batchImport('new')"
                          class="mr5"
                          :disabled="(looKsettings || cannotSave)"
                        >批量导入</Button>
                        <template v-if="arriveableType !== 1">
                          <!-- <Button size="small" v-if="accept === '1' && permission.importExcel" @click="batchImport" class="mr5">批量导入</Button> -->
                          <Button size="small" @click="addPartition" :disabled="(looKsettings || cannotSave)">新增分区 </Button>
                        </template>
                        <Button size="small" @click="channelCitation" class="ml5" :disabled="(looKsettings || cannotSave)">从其他渠道引用 </Button>
                      </div>
                    </div>
                    <Row type="flex" justify="start" :gutter="20" align="middle">
                      <Col>
                      <Row type="flex" justify="start" :gutter="5" align="middle">
                        <span class="redColor">*</span> <span>运费币种</span>
                        <Col>
                        <dyt-select v-model="freightCurrency" :disabled="(looKsettings || cannotSave)">
                          <Option v-for="(item, itemIndex) in currencyList" :key="itemIndex" :value="item.value">{{
                              item.label
                          }}</Option>
                        </dyt-select>
                        </Col>
                      </Row>
                      </Col>
                      <Col>
                      <Row type="flex" justify="start" :gutter="5" align="middle">
                        <Col>
                        <dyt-select v-model="freightDiscountType" :disabled="(looKsettings || cannotSave)">
                          <Option value="1">运费折扣</Option>
                          <Option value="2">通折</Option>
                        </dyt-select>
                        </Col>
                        <Col>
                        <InputNumber :precision="4" :min="0" v-model="freightDiscount" size="small" :max="1" :disabled="(looKsettings || cannotSave)" />
                        </Col>
                      </Row>
                      </Col>
                      <Col>
                      <span class="redColor">请注意，无折扣时，请输入1，八折时，请输入0.8</span>
                      </Col>
                    </Row>
                    <Table :columns="columns4" class="normalTop" :data="data4" height="300"></Table>
                  </div>
                </div>
                <div class="modalItem">
                  <div class="modalItemHeader">
                    <div class="title-h6">适用仓库</div>
                  </div>
                  <Card>
                    <div v-show="type === '01'" class="modalItemContent clear">
                      <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
                        <Checkbox :value="checkAll" @click.prevent.native="handleCheckAll" :disabled="(looKsettings || cannotSave)">全部自营仓库
                        </Checkbox>
                      </div>
                      <CheckboxGroup v-model="warehouseIdList" :disabled="(looKsettings || cannotSave)">
                        <Row>
                          <Col span="6" v-for="(item, index) in storeList" v-if="item.warehouseType === '0'"
                            :key="index">
                          <Checkbox :disabled="(looKsettings || cannotSave)" :label="item.warehouseId">{{ item.warehouseName }}</Checkbox>
                          </Col>
                        </Row>
                      </CheckboxGroup>
                    </div>
                    <div v-show="type === '02'">
                      {{ activeCarrierName }}
                    </div>
                  </Card>
                </div>
                <div class="modalItem setMarkShippingContainer" v-if="setShippingModel">
                  <div class="modalItemHeader">
                    <div class="title-h6">平台标发货设置</div>
                  </div>
                  <div class="modalItemContent clear" style="max-height: 400px;overflow-y: auto;">
                    <template v-for="(platformItem, platformItemIndex) in platformGroup">
                      <div class="flexBox modalItemBox" :key="platformItem.platformId" v-if="platformItem.type === 1 || platformItem.checkboxStatus">
                        <div class="platformTitle flexBox" v-if="platformItem.type === 1">
                          <Checkbox @on-change="setCheckboxStatus($event, platformItemIndex)" :disabled="(looKsettings || cannotSave)"
                            v-model="platformItem.checkboxStatus">
                            {{ platformItem.name }}
                          </Checkbox>
                        </div>
                        <div style="width:100%;" v-if="platformItem.checkboxStatus">
                          <div class="flexBox flexStart"
                            v-for="(item, scIndex) in shippingParams.platformCarrierSettings[platformItem.platformId]"
                            :key="scIndex"
                          >
                            <div class="flexBox spaceBetween" v-if="!item.hasOwnProperty('countryCode') || item.countryCode === null">
                              <div style="width:100%; padding-bottom: 10px;">
                                <div class="smsc modalItemPadding">
                                  <FormItem label="" :label-width="0" class="inlineBlockStyle">
                                    <dyt-select
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].markDeliveryType"
                                      :disabled="(looKsettings || cannotSave)"
                                      style="width: 140px;" @on-change="markDeliveryTypeChange"
                                      :clearable="false"
                                    >
                                      <Option v-for="item in markDeliveryType" :key="item.value" :value="item.value" :label="item.label" />
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem
                                    label="站点"
                                    v-if="platformItem.platformId === 'temux'"
                                    class="inlineBlockStyle ivu-form-item-required"
                                    :rules="{
                                      required: true,
                                      validator: verifySite(shippingParams.platformCarrierSettings, `${platformItem.platformId}.${scIndex}.platformSite`),
                                      trigger: 'change',
                                      msg: '请选择站点'
                                    }"
                                    :prop="`${platformItem.platformId}.${scIndex}.platformSite`"
                                  >
                                    <dyt-select
                                      style="width: 100px"
                                      v-model="item.platformSite"
                                      filterable
                                      :disabled="(looKsettings || cannotSave)"
                                    >
                                      <Option
                                        v-for="(site, sIndex) in platformSiteDataList"
                                        :key="`l-${site.value}-${sIndex}`"
                                        :value="site.value"
                                        :label="site.label"
                                        @click.native="psiteValChange(site.value, platformItem.platformId, scIndex, 'carrierCode')"
                                      />
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem label="物流服务商(Carrier)：" prop="carrierCode" class="inlineBlockStyle" :label-width="140">
                                    <dyt-select style="width:160px"
                                      v-if="platformItem.platformId === 'temux'"
                                      :disabled="(looKsettings || cannotSave || !item.platformSite)"
                                      v-model="item.carrierCode"
                                      :allow-create="!['tiktok'].includes(platformItem.platformId)"
                                      filterable
                                      @on-change="changeCarrierCode($event, platformItem.platformId)"
                                      @on-create="handleCreateCarrierCode($event, { platformId: platformItem.platformId })"
                                    >
                                      <template v-for="(ccaItem, ccaIndex) in carrierCodeArr[platformItem.platformId]">
                                        <Option
                                          v-if="item.platformSite == ccaItem.site"
                                          :key="`si-${ccaIndex}`" :value="ccaItem.valueCode" :label="ccaItem.valueCnName"
                                        />
                                      </template>
                                    </dyt-select>
                                    <dyt-select style="width:160px"
                                      v-else-if="carrierCodeArr[platformItem.platformId].length"
                                      :disabled="(looKsettings || cannotSave)"
                                      v-model="item.carrierCode"
                                      :allow-create="!['tiktok'].includes(platformItem.platformId)"
                                      filterable
                                      @on-change="changeCarrierCode($event, platformItem.platformId)"
                                      @on-create="handleCreateCarrierCode($event, { platformId: platformItem.platformId })"
                                    >
                                      <Option v-for="(ccaItem, ccaIndex) in carrierCodeArr[platformItem.platformId]"
                                        :key="ccaIndex" :value="ccaItem.valueCode" :label="ccaItem.valueCnName" />
                                    </dyt-select>
                                    <Input v-else
                                      v-model.trim="shippingParams.platformCarrierSettings[platformItem.platformId][0].carrierCode"
                                      :disabled="(looKsettings || cannotSave)"
                                      style="width:150px" placeholder="请输入" />
                                  </FormItem>
                                  <FormItem label="发货国家" prop="deliveryCountryCode"
                                    v-if="platformItem.platformId === 'wish'">
                                    <dyt-select style="width: 100px" v-model="item.deliveryCountryCode" filterable :disabled="(looKsettings || cannotSave)">
                                      <Option v-for="(item, index) in formValidate.country" :key="index"
                                        :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem label="运单号：" prop="trackingNumberType" class="inlineBlockStyle">
                                    <dyt-select
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].trackingNumberType"
                                      :disabled="(looKsettings || cannotSave)">
                                      <Option :value=0>不填运单号</Option>
                                      <Option :value=1>物流商单号</Option>
                                      <Option :value=2>运单号</Option>
                                    </dyt-select>
                                  </FormItem>
                                  <div v-if="item && item.platformId === 'otto'">
                                    <!-- <Form inline :label-width="80"> -->
                                    <FormItem label="发货国家：" :label-width="80" class="inlineBlockStyle">
                                      <Input
                                        v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].deliveryCountry"
                                        :disabled="(looKsettings || cannotSave)"
                                        style="width:120px" />
                                    </FormItem>
                                    <FormItem label="发货城市：" :label-width="80" class="inlineBlockStyle">
                                      <Input
                                        v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].deliveryCity"
                                        :disabled="(looKsettings || cannotSave)"
                                        style="width:120px" />
                                    </FormItem>
                                    <FormItem label="发货邮编：" :label-width="80" class="inlineBlockStyle">
                                      <Input
                                        v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].deliveryZipCode"
                                        :disabled="(looKsettings || cannotSave)"
                                        style="width:150px" />
                                    </FormItem>
                                    <FormItem label="退货物流服务商：" :label-width="110" class="inlineBlockStyle">
                                      <Input
                                        v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].returnLogisticsServiceProvider"
                                        :disabled="(looKsettings || cannotSave)"
                                        style="width:130px" />
                                    </FormItem>
                                    <!-- </Form> -->
                                  </div>
                                  <div class="table-order-item">
                                    <Checkbox v-model="item.carrierType" :disabled="(looKsettings || cannotSave)">
                                      使用系统获取服务商
                                      <span style="color:#f60;">注：只有部分返回</span>
                                    </Checkbox>
                                    <!-- <Checkbox v-model="item.syncFirst"
                                      v-if="(['ebay'].includes(platformItem.platformId) && ![0, '0'].includes(shippingParams.platformCarrierSettings[platformItem.platformId][0].markDeliveryType))">
                                      同步首次
                                    </Checkbox> -->
                                    <div v-if="item && item.platformId === 'amazon'">
                                      <FormItem label="配送服务：" >
                                        <Select
                                          style="width: 200px"
                                          filterable
                                          allow-create
                                          clearable
                                          :disabled="(looKsettings || cannotSave)"
                                          @on-create="handleCreateDelivery($event, `${item.platformId}_${item.carrierCode}`)"
                                          v-model="shippingParams.platformCarrierSettings[platformItem.platformId][0].shippingService"
                                        >
                                          <Option v-for="(item, aIndex) in amazonDeliveryList" :value="item.valueCode" :label="item.valueCnName" :key="`a-${aIndex}`" />
                                        </Select>
                                      </FormItem>
                                    </div>
                                    <div>
                                      <span class="default">（默认）</span>
                                      <span class="blueColor" style="line-height: 32px;cursor: pointer"
                                        v-if="!(looKsettings || cannotSave)"
                                        @click="addSpecialCountry(platformItem.platformId)">添加特例国家</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <template v-else>
                              <Card class="special-case-country" dis-hover>
                                <div style="display: flex">
                                  <FormItem label="国家/地区"
                                    prop="platformCarrierSettings[platformItem.platformId][scIndex].countryCode"
                                    :label-width="140">
                                    <dyt-select style="width:150px" filterable
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].countryCode"
                                      :disabled="(looKsettings || cannotSave)"
                                      placeholder="请选择或输入所在地">
                                      <Option v-for="(item, ccIndex) in formValidate.country" :key="ccIndex"
                                        :value="item.twoCode">{{ item.enName }}</Option>
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem
                                    label="站点"
                                    v-if="platformItem.platformId === 'temux'"
                                    class="inlineBlockStyle ivu-form-item-required"
                                    :rules="{
                                      required: true,
                                      validator: verifySite(shippingParams.platformCarrierSettings, `${platformItem.platformId}.${scIndex}.platformSite`),
                                      trigger: 'change',
                                      msg: '请选择站点'
                                    }"
                                    :prop="`${platformItem.platformId}.${scIndex}.platformSite`"
                                  >
                                    <dyt-select
                                      style="width: 100px"
                                      v-model="item.platformSite"
                                      filterable
                                      :disabled="(looKsettings || cannotSave)"
                                    >
                                      <Option
                                        v-for="(site, sIndex) in platformSiteDataList"
                                        :key="`l-${site.value}-${sIndex}`"
                                        :value="site.value"
                                        :label="site.label"
                                        @click.native="psiteValChange(site.value, platformItem.platformId, scIndex, 'carrierCode')"
                                      />
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem label="物流服务商(Carrier)" prop="carrierCode"
                                    :rules="{ required: true, validator: validCarrier(scIndex, platformItem.platformId, platformItem.checkboxStatus, shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].carrierCode), message: '该选项不能为空', trigger: 'blur' }"
                                    :label-width="140">
                                    <dyt-select style="width:200px"
                                      v-if="platformItem.platformId === 'temux'"
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].carrierCode"
                                      :disabled="(looKsettings || cannotSave || !item.platformSite)"
                                      @on-create="handleCreateCarrierCode($event, {
                                        platformId: platformItem.platformId
                                      })" allow-create filterable
                                    >
                                      <template v-for="(ccaItem, ccaIndex) in carrierCodeArr[platformItem.platformId]">
                                        <Option
                                          v-if="item.platformSite == ccaItem.site"
                                          :key="`code-${ccaIndex}`" :value="ccaItem.valueCode" :label="ccaItem.valueCnName"
                                        />
                                      </template>
                                    </dyt-select>
                                    <dyt-select style="width:200px"
                                      v-else-if="carrierCodeArr[platformItem.platformId].length"
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].carrierCode"
                                      :disabled="(looKsettings || cannotSave)"
                                      @on-create="handleCreateCarrierCode($event, {
                                        platformId: platformItem.platformId
                                      })" allow-create filterable
                                    >
                                      <Option
                                        v-for="(ccaItem, ccaIndex) in carrierCodeArr[platformItem.platformId]"
                                        :key="`code-${ccaIndex}`" :value="ccaItem.valueCode" :label="ccaItem.valueCnName"
                                      />
                                    </dyt-select>
                                    <Input v-else
                                      v-model.trim="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].carrierCode"
                                      :disabled="(looKsettings || cannotSave)"
                                      style="width:200px" placeholder="请输入"></Input>
                                  </FormItem>
                                </div>
                                <div style="display: flex">
                                  <FormItem label="发货国家" :label-width="140" v-if="platformItem.platformId === 'wish'">
                                    <dyt-select style="width: 100px"
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].deliveryCountryCode"
                                      :disabled="(looKsettings || cannotSave)"
                                      filterable>
                                      <Option v-for="(item, index) in formValidate.country" :key="index"
                                        :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                                    </dyt-select>
                                  </FormItem>
                                  <FormItem label="运单号" prop="trackingNumberType" :label-width="140">
                                    <dyt-select
                                      v-model="shippingParams.platformCarrierSettings[platformItem.platformId][scIndex].trackingNumberType"
                                      :disabled="(looKsettings || cannotSave)">
                                      <Option :value=0>不填运单号</Option>
                                      <Option :value=1>物流商单号</Option>
                                      <Option :value=2>运单号</Option>
                                    </dyt-select>
                                  </FormItem>
                                  <a class="redColor delShippingParamsItem" href="javascript:;"
                                    v-if="!(looKsettings || cannotSave)"
                                    @click="delShippingParamsItem(scIndex, platformItem.platformId)">删除</a>
                                </div>
                              </Card>
                            </template>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- 速卖通线上发货 -->
                <div class="modalItem setMarkShippingContainer"
                  v-if="showStatus === 'API_AE_LG' || showStatus === 'API_EDIS' || showStatus === 'api_joomLogistics'">
                  <div class="modalItemHeader">
                    <div class="title-h6" v-if="showStatus === 'API_AE_LG'">速卖通线上发货设置</div>
                    <div class="title-h6" v-if="showStatus === 'API_EDIS'">eDIS物流设置</div>
                    <div class="title-h6" v-if="showStatus === 'api_joomLogistics'">Joom Logistics设置</div>
                  </div>
                  <div class="modalItemContent">
                    <div>
                      <Row>
                        <!-- 发货地址 -->
                        <Col span="8" v-if="showStatus !== 'api_joomLogistics'">
                        <div style="font-size:12px;margin-top:10px;margin-left:20%;">
                          <span v-if="showStatus !== 'API_EDIS'">选择发件地址：</span>
                          <span v-if="showStatus === 'API_EDIS'">发货地址：</span>
                          <dyt-select
                            style="width:100px"
                            :disabled="(looKsettings || cannotSave)"
                            v-model="sendAddress.addressValue" @on-change="changeSender" filterable
                          >
                            <Option
                              v-for="(item, index) in sendList"
                              :key="index"
                              :value="item.addressId"
                            >{{ item.cityName + ' ' + item.provinceName + ' ' + item.countryName + ' ' + item.name }}</Option>
                          </dyt-select>
                        </div>
                        <div style="margin-top:10px;margin-left:10px;">
                          <Form ref="tabs" :label-width="75" label-position="left">
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="姓名：">
                                <Input v-model.trim="showSendList.name" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="国家/地区：">
                                <Input v-model.trim="showSendList.countryName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="省州：">
                                <Input v-model.trim="showSendList.provinceName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="城市：">
                                <Input v-model.trim="showSendList.cityName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="区县：">
                                <Input v-model.trim="showSendList.districtName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="街道：">
                                <Input v-model.trim="showSendList.street1" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="邮箱：">
                                <Input v-model.trim="showSendList.email" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="邮编：">
                                <Input v-model.trim="showSendList.postcode" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="旺旺：">
                                <Input v-model.trim="showSendList.trademanageId" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="手机：">
                                <Input v-model.trim="showSendList.mobile" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                        </Col>
                        <!-- 揽收地址 -->
                        <Col span="8">
                        <div style="font-size:12px;margin-top:10px;margin-left:20%;">
                          <span v-if="showStatus !== 'API_EDIS'">选择揽收地址：</span>
                          <span v-if="showStatus === 'API_EDIS'">交运地址：</span>
                          <dyt-select
                            style="width:100px"
                            v-model="pickupAddress.addressValue"
                            @on-change="changePickup"
                            filterable
                            :disabled="(looKsettings || cannotSave)"
                          >
                            <Option
                              v-for="(item, index) in pickupList"
                              :key="index"
                              :value="item.addressId"
                            >{{item.cityName + ' ' + item.provinceName + ' ' + item.countryName + ' ' + item.name}}</Option>
                          </dyt-select>
                        </div>
                        <div style="margin-top:10px;margin-left:10px;">
                          <Form ref="pickupTabs" :label-width="75" label-position="left">
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="姓名：">
                                <Input v-model.trim="showPickupList.name" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="国家/地区：">
                                <Input v-model.trim="showPickupList.countryName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="省州：">
                                <Input v-model.trim="showPickupList.provinceName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="城市：">
                                <Input v-model.trim="showPickupList.cityName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="区县：">
                                <Input v-model.trim="showPickupList.districtName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="街道：">
                                <Input v-model.trim="showPickupList.street1" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="邮箱：">
                                <Input v-model.trim="showPickupList.email" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="邮编：">
                                <Input v-model.trim="showPickupList.postcode" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="旺旺：">
                                <Input v-model.trim="showPickupList.trademanageId" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="手机：">
                                <Input v-model.trim="showPickupList.mobile" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                        </Col>
                        <!-- 退件地址 -->
                        <Col span="8" v-if="showStatus !== 'api_joomLogistics' && showStatus !== 'API_EDIS'">
                        <div style="font-size:12px;margin-top:10px;margin-left:20%;">
                          选择退件地址：
                          <dyt-select
                            style="width:100px"
                            v-model="refundAddress.addressValue"
                            :disabled="(looKsettings || cannotSave)"
                            @on-change="changeRefund"
                            filterable
                          >
                            <Option
                              v-for="(item, index) in refundList"
                              :key="index"
                              :value="item.addressId"
                            >{{item.cityName + ' ' + item.provinceName + ' ' + item.countryName + ' ' + item.name}}</Option>
                          </dyt-select>
                        </div>
                        <div style="margin-top:10px;margin-left:10px;">
                          <Form ref="tabs" :label-width="75" label-position="left">
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="姓名：">
                                <Input v-model.trim="showRefundList.name" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="国家/地区：">
                                <Input v-model.trim="showRefundList.countryName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="省州：">
                                <Input v-model.trim="showRefundList.provinceName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="城市：">
                                <Input v-model.trim="showRefundList.cityName" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="区县：">
                                <Input v-model.trim="showRefundList.districtName" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="街道：">
                                <Input v-model.trim="showRefundList.street1" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="邮箱：">
                                <Input v-model.trim="showRefundList.email" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="邮编：">
                                <Input v-model.trim="showRefundList.postcode" disabled></Input>
                              </FormItem>
                              </Col>
                              <Col span="12">
                              <FormItem :label-width="60" label="旺旺：">
                                <Input v-model.trim="showRefundList.trademanageId" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                            <Row :gutter="16">
                              <Col span="12">
                              <FormItem :label-width="80" label="手机：">
                                <Input v-model.trim="showRefundList.mobile" disabled></Input>
                              </FormItem>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                        </Col>
                        <!-- 交运方式与揽件时间 -->
                        <Col span="8" v-if="showStatus === 'API_EDIS'">
                        <div style="font-size:12px;margin-top:10px;margin-left:20%;">交运方式与揽件时间</div>
                        <div style="margin-top:10px;margin-left:10px;">
                          <Form ref="tabs" :label-width="75" label-position="left">
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="交运方式：">
                                <RadioGroup v-model="deliverType">
                                  <Radio label="PICK_UP" disabled>上门揽收
                                  </Radio>
                                  <Radio label="DROP_OFF" disabled>卖家自送
                                  </Radio>
                                </RadioGroup>
                              </FormItem>
                              </Col>
                            </Row>
                          </Form>
                          <Form ref="tabs" :label-width="75" label-position="left">
                            <Row>
                              <Col span="24">
                              <FormItem :label-width="80" label="揽件时间：">
                                <RadioGroup v-model="deliverTime">
                                  <Radio label="TIME_14_16" disabled>14:00-16:00
                                  </Radio>
                                  <Radio label="TIME_16_18" disabled>16:00-18:00
                                  </Radio>
                                </RadioGroup>
                              </FormItem>
                              </Col>
                            </Row>
                          </Form>
                        </div>
                        </Col>
                        <!--代理人-->
                        <Col span="8" v-if="showStatus === 'API_EDIS'">
                        <FormItem label="代理人">
                          <dyt-select v-model="agentAddress.addressValue" style="width: 200px;" :disabled="(looKsettings || cannotSave)"
                            @on-change="changeAgentAddress">
                            <Option v-for="(item, index) in agentList" :value="item.carrierPlatformAccountAddressId"
                              :key="index">{{ item.name }}</Option>
                          </dyt-select>
                        </FormItem>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
                <!--自定义物流不展示-->
                <div class="modalItem setMarkShippingContainer" v-if="accept !== '2'">
                  <div class="modalItemHeader">
                    <div class="title-h6">面单打印设置</div>
                  </div>
                  <div class="modalItemContent">
                    <div v-if="shippingData && shippingData.carrierParams">
                      <template v-for="(item, cpIndex) in shippingData.carrierParams">
                        <div class="flexBox flexStart" v-if="item" :key="cpIndex">
                          <template v-if="item.paramKey === 'labelSize'">
                            <FormItem label="面单模板" prop="paramValue">
                              <dyt-select v-model="shippingData.carrierParams[cpIndex].paramValue" :disabled="(looKsettings || cannotSave)">
                                <Option v-if="item.carrierParamDictionaryList.length > 0"
                                  v-for="(subItem, subIndex) in item.carrierParamDictionaryList" :key="subIndex"
                                  :value="subItem.itemValue">{{ subItem.itemName }}</Option>
                              </dyt-select>
                            </FormItem>
                          </template>
                          <template v-if="item.paramKey === 'labelGenerrateType'">
                            <FormItem label="'面单尺寸'" prop="paramValue">
                              <dyt-select v-model="shippingData.carrierParams[cpIndex].paramValue" :disabled="(looKsettings || cannotSave)">
                                <Option v-if="item.carrierParamDictionaryList.length > 0"
                                  v-for="(subItem, subIndex) in item.carrierParamDictionaryList" :key="subIndex"
                                  :value="subItem.itemValue">{{ subItem.itemName }}</Option>
                              </dyt-select>
                            </FormItem>
                          </template>
                        </div>
                      </template>
                    </div>
                    <div class="normalPadding flexBox">
                      <Checkbox v-model="shippingParams.isPrintPickingList" :true-value="1" :false-value="0" :disabled="(looKsettings || cannotSave)"
                        style="margin:7px">打印配货清单
                      </Checkbox>
                    </div>
                  </div>
                </div>
              </template>
            </Form>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button v-if="(openType !== 'addCustom' && !looKsettings && !cannotSave && !loading4 && !pageInitLoading)" @click="setShippingMethod(null)"
          :loading="buttonTalg" type="primary">保 存</Button>
        <Button v-if="(openType === 'addCustom' && !looKsettings && !cannotSave && !loading4 && !pageInitLoading)" @click="addCustomMt"
          :loading="buttonTalg" type="primary">保 存</Button>
        <Button @click="closeModal">关 闭</Button>
      </div>
    </Modal>

    <!-- 编辑/查看运费 -->
    <Modal v-model="editPriceModal" width="1000" title="计费模型编辑" :mask-closable="false" @on-visible-change="priceVisible">
      <div>
        <Form :model="pricingQuantityMode" :disabled="logisticsSetView">
          <FormItem label="计费方式">
            <RadioGroup v-model="pricingQuantityMode.priceType">
              <Radio v-for="(item, index) in billingList" :key="index" :label="item.value">{{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="计重方式">
            <RadioGroup v-model="pricingQuantityMode.weightType">
              <Radio v-for="(item, index) in weightTypeList" :key="index" :label="item.value">{{ item.label }}
              </Radio>
            </RadioGroup>
            <span v-show="pricingQuantityMode.weightType !== 1">（材积重：
              <InputNumber :max="100000000" :min="0" style="width: 150px;" v-model="pricingQuantityMode.volumeWeight" />
              ）
            </span>
          </FormItem>
        </Form>
        <Card dis-hover v-show="isShowCountry">
          <Row>
            <Col span="18">
              <span class="tag-chose" @click="choseCountryTag('allType')" :class="{ tagChoseActive: allCountry }">全部</span>
              <span
                class="tag-chose"
                v-for="(item, index) in countryList"
                :key="index"
                :class="{ tagChoseActive: item.checked }"
                @click="choseCountryTag(item)"
              >{{ item.zoneCnName }}</span>
            </Col>
            <Col span="6">
              <Input v-model="searchCountry" placeholder="支持中文、英文、二字码搜索" @on-enter="searchCountryHandel" />
            </Col>
          </Row>
          <div class="mt10 mb10">
            <Button v-if="!logisticsSetView" size="small" v-show="!$common.isEmpty(choseCountryList)" @click="setAllCountryList">全部</Button>
            <Row>
              <CheckboxGroup v-model="choseCountryId" class="select_country_checkbox" :disabled="logisticsSetView">
                <Col span="4" v-for="(item, index) in allCountryList" v-show="choseCountryList.includes(item.twoCode)" :key="index">
                  <Tooltip v-if="disabledUseCountry.includes(item.twoCode)" placement="right-start" :transfer="true" max-width="200px">
                    <Checkbox :label="item.twoCode" :disabled="true">
                      <span>{{ item.cnName }}</span>
                    </Checkbox>
                    <div slot="content">已有分区选择该国家</div>
                  </Tooltip>
                  <Checkbox v-else :label="item.twoCode" :disabled="logisticsSetView">
                    <span>{{ item.cnName }}</span>
                  </Checkbox>
                </Col>
              </CheckboxGroup>
            </Row>
          </div>
          <Card dis-hover>
            <p>已选中国家：</p>
            <Row>
              <CheckboxGroup v-model="choseCountryId" class="select_country_checkbox">
                <Col span="4" v-for="(item, index) in allCountryList" v-show="choseCountryId.indexOf(item.twoCode) > -1"
                  :key="index">
                <Checkbox :label="item.twoCode" :disabled="logisticsSetView">{{ item.cnName }}</Checkbox>
                </Col>
              </CheckboxGroup>
            </Row>
            <div class="clear">
              <p class="fr">
                <Button v-if="!logisticsSetView" size="small" @click="clearChoseCountryId">清空 </Button>
              </p>
            </div>
          </Card>
        </Card>
        <p class="mt10 mb10 fontWeight" v-html="freightText"></p>
        <dTable
          highlight-row
          disabled-hover
          border
          stripe
          :columns="editPriceModalColumns"
          :data="editPriceModalData"
          size="small"
        />
        <p class="mt10 mb10 fontWeight">
          <Button v-if="!logisticsSetView" size="small" type="primary" @click="addWeightIntervals">新增重量区间</Button>
        </p>
        <p>验证运费是否正确：重量(g)
          <InputNumber v-model="weightTest" :min="0" :max="99999999999999999999999999999999" :disabled="logisticsSetView" />
          <Button @click="freightVerification" v-if="!logisticsSetView" type="primary" class="ml10 mr10">验证运费</Button>
          <span>测试运费：</span>{{ freightTest }}
        </p>
      </div>
      <div slot="footer">
        <Button type="primary" v-if="permission.update && !logisticsSetView" @click="editOK">保存 </Button>
        <Button @click="editPriceModal = false">取消</Button>
      </div>
    </Modal>

    <!--批量导入 计费模型-->
    <div v-if="modal2">
      <Modal v-model="modal2" title="导入运费模板">
        <Form :model="importForm">
          <FormItem label="计费方式:">
            <RadioGroup v-model="importForm.priceType">
              <Radio v-for="(item, index) in billingList" :key="index" :label="item.value">{{ item.label }}
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="计重方式:">
            <RadioGroup v-model="importForm.weightType">
              <Radio v-for="(item, index) in weightTypeList" :key="index" :label="item.value">{{ item.label }}
              </Radio>
            </RadioGroup>
            <span v-if="importForm.weightType !== 1">
              （材积重：
              <Input style="width: 100px;" v-model="importForm.volumeWeight" />)
            </span>
          </FormItem>
          <FormItem label="选择文件:">
            <div class="fl">
              <dytUpload
                style="display: inline-block"
                :headers="headObj"
                ref="uploadRef"
                :name="newImport ? 'excelFile': 'excleFile'"
                :data="importForm"
                :show-upload-list="false"
                :action="uploadZoneExcel"
                :before-upload="beforeHandleUpload"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :on-format-error="handleFormatError"
                :max-size="uploadFilesMaxSize"
                :format="['xls', 'xlsx']"
              >
                <Button class="mr10">批量上传</Button>
              </dytUpload>
              <div v-if="file !== null"> {{ file.name }}</div>
            </div>
            <a class="ml20" @click="download">下载</a>
          </FormItem>
          <FormItem label="导入处理：" v-if="arriveableType != 1">
            <RadioGroup v-model="importForm.covered">
              <Radio v-for="(item, index) in importTypeList" :key="index" :label="item.value">{{ item.label }}</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <div slot="footer">
          <Button type="primary" :loading="loading5" @click="saveImport">保存 </Button>
          <Button @click="coloseUptateFile">取消</Button>
        </div>
      </Modal>
    </div>
    <!--从其他渠道引用-弹窗-->
    <Modal v-model="channelModal" title="选择引用的渠道" :mask-closable="false" @on-visible-change="visibleChange">
      <Form :label-width="120">
        <Row>
          <Col span="18">
          <FormItem label="请选择物流商:">
            <dyt-select v-model="selectProvider" filterable @on-change="ChangeSelectProvider">
              <Option v-for="(item, sIndex) in selectProviderList" :value="item.id" :key="`${item.id}-${sIndex}`">{{ item.name }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col span="18">
          <FormItem label="请选择物流渠道:">
            <dyt-select v-model="logisticsChannel" filterable @on-change="ChangeLogisticsChannel">
              <Option v-for="(item, sIndex) in logisticsChannelList" :value="item.id" :key="`${item.id}-${sIndex}`">{{ item.name }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
      </Form>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="saveChannel">确定</Button>
        <Button @click="channelModal = false">取消</Button>
      </div>
    </Modal>
    <!-- 物流限制信息导入 -->
    <Modal v-model="restrictionModalVisible" title="导入物流限制" :mask-closable="false">
      <Spin fix v-if="importRestrictionLoading"></Spin>
      <Form>
        <FormItem label="" :label-width="0">
          <dytUpload
            style="display: inline-block"
            ref="restrictionImprotRef"
            name="excel"
            :data="restrictioImportData"
            :show-upload-list="false"
            :action="restrictionExcel"
            :before-upload="beforeHandleUpload"
            :on-success="restrictionImportSuccess"
            :on-error="uploadError"
            :on-format-error="handleFormatError"
            :format="['xls', 'xlsx']"
          >
            <Button class="mr20" type="primary">{{!file ? '请选择文件' : '更换文件'}}</Button>
          </dytUpload>
          <Button class="ml20" type="primary" @click="downloadTemplate('restriction')">下载模板</Button>
        </FormItem>
        <FormItem label="" :label-width="0">
          <span v-if="file">{{ file.name }}</span>
        </FormItem>
      </Form>
      <div slot="footer" style="text-align: right;">
        <Button type="primary" @click="saveRestrictionImport" :loading="importRestrictionLoading">确定</Button>
        <Button @click="restrictionModalVisible = false">取消</Button>
      </div>
    </Modal>
    <!-- 选择国家 -->
    <setCountryModal :modalVisible.sync="countryModalVisible" :modal-data="countryModalData" @countryConfirm="countryConfirm" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import setCountryModal from './components/setCountryModal';

const extraPlatform = {
  sheinx: {
    apiUrl: api.queryCarrierChannel,
    requestType: 'post',
    dataKey: {},
    paramsData: {},
    resHand: (item, v) => {
      return {
        ...item,
        valueCode: v.$common.isNumber(item.carrierCode) ? (item.carrierCode).toString() : item.carrierCode,
        valueCnName: item.carrierCode
      };
    }
  },
  temux: {
    apiUrl: api.otherPlatformCarrier,
    requestType: 'post',
    dataKey: {
      businessId: 'platformId'
    },
    paramsData: {
      paramKey: 'shippingMethod',
    },
    resHand: (item, v) => {
      let list = [];
      Object.keys(item).forEach(key => {
        (item[key] || []).forEach(item => {
          list.push({
            ...item,
            site: key,
            valueCode: v.$common.isNumber(item.carrierId) ? (item.carrierId).toString() : item.carrierId,
            valueCnName: item.carrierCode
          });
        });
      });
      return list;
    }
  }
};
const defaultAllCount = {
  acceptableType: '01', // 接收类型
  isAllCountry: 1,
  maxDimensionsLength: 0,
  maxHeight: 0,
  maxLength: 0,
  maxLongestTwoSidesAnd: 0,
  maxPerimeter: 0,
  minEfficiency: 0,
  maxEfficiency: 0,
  maxThreeSidesAnd: 0,
  maxVolume: 0,
  maxWeight: 0,
  maxWidth: 0,
  minHeight: 0,
  minLength: 0,
  minVolume: 0,
  minWeight: 0,
  minWidth: 0,
};

export default {
  mixins: [Mixin, publicService],
  nema: 'logisticsChannelModal',
  components: {
    setCountryModal,
  },
  props: {
    type: { // 01 API对接  02 第三方物流
      type: String,
      default: '01'
    },
    activeCarrierName: {
      type: String,
      default: ''
    },
    accept: { // 1 物流商 2 自定义物流商
      type: String,
      default: '1'
    },
    setShippingMethodModelStatus: { // 设置/编辑/新增自定义物流渠道弹窗的展示与隐藏
      type: Boolean,
      default: false
    },
    showShippingSettingId: {
      type: String,
      default: null
    },
    platformGroup: {
      type: Array,
      default: () => []
    },
    formInline: {
      type: Object,
      default: () => {
      }
    },
    openType: {
      type: String,
      default: 'ship'
    },
    NewCustomLogistics: {
      type: Boolean,
      default: false
    },
    showStatus: {
      type: String,
      default: null
    },
    tabIndex: Number,
    tabs: Array,
    looKsettings: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let self = this;
    return {
      setShippingModel: false,
      weightTest: 0,
      leftVisible: false,
      rightVisible: false,
      logisticsSetView: false,
      pageInitLoading: false,
      allCountryInfoData: [],
      checkedCountry: [],
      activeTemporaryId: '',
      countryLogisticsLimitJson: {},
      countryLogisticsLimitKeys: [],
      countryModalData: {},
      countryModalVisible: false,
      downLoading: false,
      logisticsLimitExport: false,
      restrictionModalVisible: false,
      importRestrictionLoading: false,
      cannotSave: false,
      freightTest: '',
      buttonTalg: false,
      loading4: false,
      loading5: false,
      commonParameterList: [],
      deliveryDataJson: {},
      editTableRow: {},
      YesOrNolist: [
        {
          value: 1,
          label: 'Y'
        }, {
          value: 0,
          label: 'N'
        }
      ],
      sendUsageType: [
        {
          text: '全球可达(运费相同)',
          value: 1
        }, {
          text: '全球可达(运费不同)',
          value: 2
        }, {
          text: '非全球可达',
          value: 3
        }
      ],
      importForm: {
        // 计费方式
        priceType: 1,
        // 2 覆盖所有数据, 1 覆盖相同国家，不同追加
        covered: 1,
        // 材积重
        volumeWeight: '',
        // 渠道ID
        shippingMethodId: '',
        // 计重方式
        weightType: 1,
      },
      restrictioImportData: {
        shippingMethodId: '',
      },
      oldImportData: {},
      modal2: false,
      newImport: false,
      shippingMethodId: null,
      skuList: '',
      file: null,
      data4: [],
      data5: [
        {
          'carrierShippingMethodPriceModelZoneId': null,
          'carrierShippingMethodSectionChargesList': [
            {
              'additionalFeeRate': 0,
              'carrierShippingMethodPriceModelZoneId': null,
              'carrierShippingMethodSectionChargesId': null,
              'endWeight': 0,
              'firstWeight': 0,
              'firstWeightPrice': 0,
              'operatingCost': 0,
              'price': 0,
              'priceCurrency': 'CNY',
              'priceType': 0,
              'registrationFee': 0,
              'sortNo': 0,
              'startWeight': 0,
              'unitWeight': 0,
              'unitWeightPrice': 0
            }
          ],
          'countryTwoCodeList': [],
          'priceType': 0,
          'volumeWeight': 0,
          'weightType': 0,
          'zoneName': '0',
          carrierShippingMethodPriceModelZoneCountryList: []
        }
      ], // 全球可达（运费相同）
      data6: [
        {
          'carrierShippingMethodPriceModelZoneId': null,
          'carrierShippingMethodSectionChargesList': [
            {
              'additionalFeeRate': 0,
              'carrierShippingMethodPriceModelZoneId': null,
              'carrierShippingMethodSectionChargesId': null,
              'endWeight': 0,
              'firstWeight': 0,
              'firstWeightPrice': 0,
              'operatingCost': 0,
              'price': 0,
              'priceCurrency': 'CNY',
              'priceType': 0,
              'registrationFee': 0,
              'sortNo': 0,
              'startWeight': 0,
              'unitWeight': 0,
              'unitWeightPrice': 0
            }
          ],
          'countryTwoCodeList': [],
          'priceType': 0,
          'volumeWeight': 0,
          'weightType': 0,
          'zoneName': '0',
          carrierShippingMethodPriceModelZoneCountryList: []
        }
      ], // 全球可达（运费不同）
      data7: [], // 非全球可达
      // 计费模型币种
      freightCurrency: 'CNY',
      freightDiscount: 1,
      freightDiscountType: '1',
      columns4: [
        {
          key: 'zoneName',
          title: '分区',
          render(h, params) {
            if (params.row.zoneName === '0') {
              return h('div', '默认分区');
            } else {
              return h('div', params.row.zoneName);
            }
          }
        },
        {
          key: 'carrierShippingMethodPriceModelZoneCountryList',
          title: '通达国家',
          render(h, params) {
            let text = '';
            if (params.row.zoneName === '0') {
              return h('div', '所有国家');
            } else {
              if (params.row.carrierShippingMethodPriceModelZoneCountryList) {
                text = params.row.carrierShippingMethodPriceModelZoneCountryList.map(i => {
                  return i.cnName;
                }).join('、');
              }
              return h('span', text);
            }
          }
        },
        {
          title: '计费方式',
          render(h, params) {
            let text = params.row.priceType === 1 ? '普通计费' : params.row.priceType === 2
              ? '首续重计费'
              : params.row.priceType === 3 ? '固定收费' : '';
            return h('span', text);
          }
        },
        {
          title: '计重方式',
          render(h, params) {
            let text = params.row.weightType === 1 ? '实重' : params.row.weightType === 2
              ? '抛重'
              : params.row.weightType === 3 ? '两者比较' : '';
            return h('span', text);
          }
        },
        {
          key: 'formula',
          title: '计费公式'
        },
        {
          title: '操作',
          render: (h, params) => {
            let tdItem = [];
            if (!this.looKsettings) {
              params.row.zoneName !== '0' && tdItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  'click'() {
                    self.logisticsSetView = false;
                    self.editPriceModal = true;
                    self.editPriceModalModalStatus = true;
                    self.editIndex = params.index;
                    self.editPriceModalData = params.row.carrierShippingMethodSectionChargesList || [];
                    self.cacheEditPriceModalData = params.row.carrierShippingMethodSectionChargesList || [];
                    self.pricingQuantityMode.priceType = params.row.priceType || 1;
                    self.pricingQuantityMode.weightType = params.row.weightType || 1;
                    self.pricingQuantityMode.volumeWeight = params.row.volumeWeight || 0;
                    self.editTableRow = self.$common.copy(params.row);
                    if (params.row.carrierShippingMethodPriceModelZoneCountryList) {
                      self.choseCountryId = params.row.carrierShippingMethodPriceModelZoneCountryList.map(i => {
                        return i.twoCode;
                      });
                    }

                    if (params.row.zoneName === '0') {
                      self.isShowCountry = false;
                    } else {
                      self.isShowCountry = true;
                    }
                  }
                }
              }, '编辑'));
              tdItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                class: 'ml5',
                on: {
                  'click'() {
                    self.deteleTableRow(params.row, params.index);
                  }
                }
              }, '删除'));
            }
            tdItem.push(h('Button', {
              props: {
                size: 'small',
                disabled: false,
              },
              class: 'ml5',
              on: {
                'click'() {
                  self.logisticsSetView = true;
                  self.editPriceModal = true;
                  self.editPriceModalModalStatus = true;
                  self.editIndex = params.index;
                  self.editPriceModalData = params.row.carrierShippingMethodSectionChargesList || [];
                  self.cacheEditPriceModalData = params.row.carrierShippingMethodSectionChargesList || [];
                  self.pricingQuantityMode.priceType = params.row.priceType || 1;
                  self.pricingQuantityMode.weightType = params.row.weightType || 1;
                  self.pricingQuantityMode.volumeWeight = params.row.volumeWeight || 0;
                  self.editTableRow = self.$common.copy(params.row);
                  if (params.row.carrierShippingMethodPriceModelZoneCountryList) {
                    self.choseCountryId = params.row.carrierShippingMethodPriceModelZoneCountryList.map(i => {
                      return i.twoCode;
                    });
                  }

                  if (params.row.zoneName === '0') {
                    self.isShowCountry = false;
                  } else {
                    self.isShowCountry = true;
                  }
                }
              }
            }, '查看'));
            return h('div', {}, tdItem);
          }
        }
      ],
      checkAll: false,
      warehouseIdList: [],
      indeterminate: false,
      showMarkShipping: false,
      markDeliveryType: [
        {
          label: '手动同步', // 手动同步
          value: 0
        }, {
          label: '下发物流商成功后同步', // 下发物流商成功后同步
          value: 1
        }, {
          label: '获取运单号成功后同步', // 获取运单号成功后同步
          value: 2
        }, {
          label: '出库成功后同步',
          value: 3
        }
      ],
      carrierCodeArr: {},
      amazonDeliveryList: [],
      sendAddress: {
        addressType: 'sender',
        addressValue: null
      },
      pickupAddress: {
        addressType: 'pickup',
        addressValue: null
      },
      refundAddress: {
        addressType: 'refund',
        addressValue: null
      },
      agentAddress: {
        addressType: 'agent',
        name: null,
        street1: null,
        mobile: null,
        addressValue: null
      },
      sendList: [], // 下拉数据
      agentList: [], // 下拉数据
      showSendList: [], // 下拉选中后的展示数据
      pickupList: [],
      showPickupList: [],
      showRefundList: [],
      showAgentList: [],
      refundList: [],
      deliverType: 'PICK_UP',
      deliverTime: 'TIME_16_16',
      allCountry: false,
      choseCountryList: [],
      pricingQuantityMode: {
        priceType: 1,
        weightType: 1,
        volumeWeight: 0
      },
      billingList: [
        {
          label: '普通计费',
          value: 1
        }, {
          label: '首续重计费',
          value: 2
        }, {
          label: '固定收费',
          value: 3
        }
      ],
      platformSiteDataList: [
        { label: '美国', value: 'US' },
        { label: '英国', value: 'UK' },
        { label: '德国', value: 'DE' },
      ],
      weightTypeList: [
        {
          label: '实重',
          value: 1
        }, {
          label: '抛重',
          value: 2
        }, {
          label: '两者比较',
          value: 3
        }
      ],
      isShowCountry: false,
      searchCountry: '',
      choseCountryId: [],
      editPriceModalColumns: [],
      editPriceModalData: [],
      editPriceModal: false,
      cacheEditPriceModalData: [],
      uploadZoneExcel: '',
      restrictionExcel: api.importShippingLogistics,
      importTypeList: [
        {
          label: '覆盖原有数据',
          value: 2
        }, {
          label: '国家相同覆盖，不同追加',
          value: 1
        }
      ],
      arriveableType: null,
      logisticsChannelModalParams: {
        acceptableCityList: null,
        acceptablePackageTypeList: [],
        skipLogistics: [],
        carrierShippingMethod: {
          carrierShippingMethodCode: '',
          carrierShippingMethodName: '',
          isInsurance: 0,
          acceptablePackageTypeList: '',
          hasTrackingNumber: '',
          logisType: '',
          isSupportInterfaceTransferBill: 0,
          isRequiredConfirm: 0,
          arriveableType: '1',
          remark: ''
        }
      },
      shippingParams: { // 平台标发货设置
        shippingMethodId: '',
        shippingData: null,
        platformCarrierSettings: {},
        isPrintPickingList: 0
      },
      shippingData: null,
      shippingMethodIdCopy: null,
      saleAccountIdCopy: null, // 派送范围及运费
      pricingParams: {
        priceType: null,
        weightType: null,
        subCostWay: null
      },
      pricingModelCommonColumns: [
        {
          title: '分区',
          key: 'name',
          minWidth: 100,
          align: 'center'
        }, {
          title: '通达国家',
          key: 'reachState',
          minWidth: 150,
          maxWidth: 240,
          align: 'center',
          render: (h, params) => {
            return h('div', self.getPricingReachStateData(params.row.carrierShippingMethodPriceModelZoneCountryList));
          }
        }, {
          title: '价格',
          key: 'costPrice',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  value: params.row.price,
                  min: 0,
                  placeholder: `标准报价`
                }
              }), h('div', {
                class: 'flexBox normalTop flexBoxJustContent'
              }, [
                h('span', '折扣价' + '：'), h('span', {
                  class: 'redColor'
                }, '$ ' + params.row.price * (self.freightDiscount === null ? 100 : self.freightDiscount) / 100)
              ])
            ]);
          }
        }, {
          title: '挂号费',
          key: 'registrationFee',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.registrationFee,
                min: 0,
                placeholder: `挂号费`
              }
            });
          }
        }, {
          title: '操作费（元/票）',
          key: 'operatingCost',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.operatingCost,
                min: 0,
                placeholder: `操作费（元/票）`
              }
            });
          }
        }, {
          title: '附加费（%）',
          key: 'additionalFeeRate',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.additionalFeeRate,
                min: 0,
                placeholder: `附加费（%）`
              }
            });
          }
        }
      ],
      pricingModelContinuedHeavyColumns: [
        {
          title: '首重（g）',
          key: 'firstWeight',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.firstWeight,
                min: 0,
                placeholder: `首重（g）`
              },
              on: {
                'input': (val) => {
                  self.cachePricingData[params.index].firstWeight = val;
                }
              }
            });
          }
        }, {
          title: '首重运费（元）',
          key: 'firstWeightPrice',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  value: params.row.firstWeightPrice,
                  min: 0,
                  placeholder: `首重运费（元）`
                },
                on: {
                  'input': (val) => {
                    self.cachePricingData[params.index].firstWeightPrice = val;
                  }
                }
              }), h('div', {
                class: 'flexBox normalTop flexBoxJustContent'
              }, [
                h('span', '折扣价' + '：'), h('span', {
                  class: 'redColor'
                }, '$ ' + params.row.firstWeightPrice * (self.freightDiscount === null
                  ? 100
                  : self.freightDiscount) / 100)
              ])
            ]);
          }
        }, {
          title: '续重单位重量（g）',
          key: 'unitWeight',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.unitWeight,
                min: 0,
                placeholder: `续重单位重量（g）`
              },
              on: {
                'input': (val) => {
                  self.cachePricingData[params.index].unitWeight = val;
                }
              }
            });
          }
        }, {
          title: '续重单价（元）',
          key: 'unitWeightPrice',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  value: params.row.unitWeightPrice,
                  min: 0,
                  placeholder: `续重单价（元）`
                },
                on: {
                  'input': (val) => {
                    self.cachePricingData[params.index].unitWeightPrice = val;
                  }
                }
              }), h('div', {
                class: 'flexBox normalTop flexBoxJustContent'
              }, [
                h('span', '折扣价' + '：'), h('span', {
                  class: 'redColor'
                }, '$ ' + params.row.unitWeightPrice * (self.freightDiscount === null
                  ? 100
                  : self.freightDiscount) / 100)
              ])
            ]);
          }
        }, {
          title: '附加费（%）',
          key: 'additionalFeeRate',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.additionalFeeRate,
                min: 0,
                placeholder: `附加费（%）`
              }
            });
          }
        }
      ],
      pricingModelColumns: [],
      cachePriceModelColumns: [],
      shippingLoading: true,
      priceModelColumns: [
        {
          title: '分区',
          key: 'zoneName',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '通达国家',
          key: 'reachState',
          minWidth: 150,
          maxWidth: 240,
          align: 'center',
          render: (h, params) => {
            return h('div', self.getPricingReachStateData(params.row.carrierShippingMethodPriceModelZoneCountryList));
          }
        },
        {
          title: '计费方式',
          key: 'priceType',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.priceType === 1) {
              return h('div', '普通计费');
            } else if (params.row.priceType === 2) {
              return h('div', '首续重计费');
            } else if (params.row.priceType === 3) {
              return h('div', '固定收费');
            }
          }
        },
        {
          title: '计重方式',
          key: 'weightType',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.weightType === 1) {
              return h('div', '实重');
            } else if (params.row.weightType === 2) {
              return h('div', '抛重');
            } else if (params.row.weightType === 3) {
              return h('div', '两者比较');
            }
          }
        },
        {
          title: '计费公式',
          key: 'formula',
          minWidth: 200,
          align: 'center'
        },
        {
          title: '操作',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                size: 'small',
                disabled: self.looKsettings
              },
              on: {
                click: () => {
                  self.priceVisible(true);
                  self.editPriceModal = true;
                  self.editPriceModalModalStatus = true;
                  self.editIndex = params.index;
                  if (params.row.carrierShippingMethodSectionChargesList) {
                    self.editPriceModalData = params.row.carrierShippingMethodSectionChargesList;
                    self.cacheEditPriceModalData = params.row.carrierShippingMethodSectionChargesList; // 缓存数据
                  }
                  let colunms = [];
                  if (params.row.priceType === 1 || params.row.priceType === 3) { // 普通计费、固定收费
                    colunms = [
                      {
                        title: '重量段',
                        key: 'weight',
                        minWidth: 120,
                        align: 'center',
                        render: (h, params) => {
                          return h('div', params.row.startWeight + '~' + params.row.endWeight + 'g');
                        }
                      },
                      {
                        title: '价格',
                        key: 'price',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.price,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].price = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '挂号费',
                        key: 'registrationFee',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.registrationFee,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].registrationFee = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '操作费',
                        key: 'operatingCost',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.operatingCost,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].operatingCost = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '附加费（%）',
                        key: 'additionalFeeRate',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.additionalFeeRate,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].additionalFeeRate = val;
                              }
                            }
                          });
                        }
                      }
                    ];
                  } else if (params.row.priceType === 2) { // 首续重计费
                    colunms = [
                      {
                        title: '重量段',
                        key: 'weight',
                        minWidth: 120,
                        align: 'center',
                        render: (h, params) => {
                          return h('div', params.row.startWeight + '~' + params.row.endWeight + 'g');
                        }
                      },
                      {
                        title: '首重运费',
                        key: 'firstWeightPrice',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.firstWeightPrice,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].firstWeightPrice = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '续重单位重量',
                        key: 'unitWeight',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.unitWeight,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].unitWeight = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '续重单价',
                        key: 'unitWeightPrice',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.unitWeightPrice,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].unitWeightPrice = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '挂号费',
                        key: 'registrationFee',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.registrationFee,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].registrationFee = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '操作费',
                        key: 'operatingCost',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.operatingCost,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].operatingCost = val;
                              }
                            }
                          });
                        }
                      },
                      {
                        title: '附加费（%）',
                        key: 'additionalFeeRate',
                        minWidth: 100,
                        align: 'center',
                        render: (h, params) => {
                          return h('InputNumber', {
                            props: {
                              value: params.row.additionalFeeRate,
                              min: 0,
                              disabled: self.logisticsSetView
                            },
                            on: {
                              'input': (val) => {
                                self.cacheEditPriceModalData[params.index].additionalFeeRate = val;
                              }
                            }
                          });
                        }
                      }
                    ];
                  }
                  self.editPriceModalColumns = colunms;
                }
              }
            }, '编辑/查看运费');
          }
        }
      ],
      carrierShippingMethodParmas: {
        maxPrice: null,
        minPrice: 0,
        maxLength: 0,
        minLength: 0,
        maxShippingFeeIncome: null,
        minShippingFeeIncome: 0,
        minGoodsQuantity: 0,
        maxGoodsQuantity: null
      },
      channelModal: false,
      selectProvider: null,
      selectProviderList: [],
      logisticsChannel: null,
      logisticsChannelList: [],
      modalData: {},
      selectType: null
    };
  },
  computed: {
    countryList() {
      if (this.countryCodesName) {
        return this.countryCodesName.map(i => {
          i.checked = false;
          return i;
        });
      } else {
        return [];
      }
    },
    allCountryList() {
      let arr = [];
      this.countryCodesName.forEach(i => {
        arr = arr.concat(...i.countries);
      });
      return arr;
    },
    // 全部国家信息
    allCountryInfoList() {
      let list = [];
      this.allCountryInfoData.forEach(item => {
        if (item.countries) {
          list.push(item.countries);
        }
      });
      list = this.$common.flat(list);
      return list;
    },
    freightText() {
      let v = this;
      if (v.pricingQuantityMode.priceType === 1) {
        return '运费 = (重量 * 单价 + 挂号费 + 操作费) * (1 + 附加费)';
      } else if (v.pricingQuantityMode.priceType === 2) {
        return '重量小于等于首重，运费=首重运费*（1+附加费）' + '<br/>' + '重量大于首重，运费={首重运费 +向上取整(总重量-首重)/续重单位重量) * 续重单价 + 挂号费 + 操作费}*（1+附加费）';
      } else {
        return '运费 = (单价 + 挂号费 + 操作费) * (1 + 附加费)';
      }
    },
    // 权限
    permission () {
      return {
        update: this.getPermission('carrierShippingMethod_update'), // 更新
        importExcel: this.getPermission('carrierShippingMethodPriceModelZone_importExcelNew'), // 导入运费模板
        exportExcel: this.getPermission('carrierShippingMethodPriceModelZone_export'), // 导出运费模板
      }
    },
    // 物流模板编辑弹窗禁选国家地区
    disabledUseCountry () {
      if (!this.$common.isEmpty(this.editTableRow.zoneName) && [0].includes(Number(this.editTableRow.zoneName))) {
        return [];
      }
      let choseCountryCode = [];
      const rowChose = (this.editTableRow.carrierShippingMethodPriceModelZoneCountryList || []).map(m => m.twoCode);
      this.data4.forEach(row => {
        if (this.$common.isEmpty(row.zoneName) || ![0].includes(Number(row.zoneName))) {
          (row.carrierShippingMethodPriceModelZoneCountryList || []).forEach(item => {
            if (!this.$common.isEmpty(item.twoCode) && !choseCountryCode.includes(item.twoCode) && !rowChose.includes(item.twoCode)) {
              choseCountryCode.push(item.twoCode);
            }
          })
        }
      });
      return choseCountryCode;
    }
  },
  mounted() {},
  methods: {
    initPageData () {
      return new Promise((resolve) => {
        this.pageInitLoading = true;
        this.$common.promiseAll([
          this.getCurrencyInfo, // 获取币种下拉的数据
          this.getAllCountryName, // 获取国家信息
          this.makePlatformGroup, // 获取所有平台的数据
          this.getCountrys
        ]).then((arrRes) => {
          this.allCountryInfoData = arrRes[1] || [];
          this.pageInitLoading = false;
          resolve({ state: 'finally' });
        }).catch(() => {
          this.pageInitLoading = false;
          resolve({ state: 'finally' });
        });
      })
    },
    async getDeliveryList(platformId, parameterCode, shippingService) {
      const { data } = await this.axios.post(api.get_orderCommonParameter, {
        parameterCode: parameterCode,
        parameterName: "shippingService"
      });
      this[platformId + 'DeliveryList'] = [];
      if (platformId && this.shippingParams.platformCarrierSettings) {
        if (this.shippingParams.platformCarrierSettings[platformId]) {
          if (this.shippingParams.platformCarrierSettings[platformId][0]) {
            this.shippingParams.platformCarrierSettings[platformId][0].shippingService = shippingService || null;
          }
        }
      }
      let { code, datas } = data;
      if (code === 0) {
        const getCode = datas.filter(f => !this.$common.isEmpty(f.valueCode)).map(m => m.valueCode);
        const list = (this.deliveryDataJson[parameterCode] || []).filter(f => {
          return !getCode.includes(f) && !this.$common.isEmpty(f);
        }).map(m => {
          return { valueCode: m, valueCnName: m };
        });
        this[platformId + 'DeliveryList'] = [...datas, ...list];
      } else {
        const list = (this.deliveryDataJson[parameterCode] || []).filter(f => !this.$common.isEmpty(f)).map(m => {
          return { valueCode: m, valueCnName: m };
        });
        this[platformId + 'DeliveryList'] = list;
      }
    },
    // 关闭--设置/编辑/新增自定义物流渠道弹窗
    closeModal () {
      this.setShippingModel = false;
    },
    markDeliveryTypeChange(val) {
      // this.shippingParams.platformCarrierSettings[this.platformItem.platformId]
      this.platformGroup.forEach(item => {
        if (['ebay'].includes(item.platformId)) {
          this.shippingParams.platformCarrierSettings[item.platformId].forEach(row => {
            if ([0, '0'].includes(val)) {
              row.syncFirst = false;
            }
          })
        }
      })
    },
    freightVerification() {
      /**
       * @Description: 验证运费
       * @author gan
       * @date: 2020/9/25 16:37
       * @params:
       */
      let v = this;
      if (v.editPriceModalData && v.editPriceModalData.length > 0) {
        v.freightTest = 0;
        let valid = false;
        if (v.pricingQuantityMode.priceType === 1) {
          // 普通计费
          v.editPriceModalData.forEach(i => {
            if (v.weightTest > i.startWeight && v.weightTest <= i.endWeight) {
              valid = true;
              v.freightTest = ((i.price * v.weightTest + i.registrationFee + i.operatingCost) * (1 + 0.01 * i.additionalFeeRate)).toFixed(2);
            }
          });
        } else if (v.pricingQuantityMode.priceType === 2) {
          // 首续重计费
          /*
           * 重量小于等于首重，运费=首重运费*（1+附加费）
           重量大于首重，运费={首重运费 +向上取整(总重量-首重)/续重单位重量) * 续重单价 + 挂号费 + 操作费}*（1+附加费）
           * */
          v.editPriceModalData.forEach(i => {
            if (v.weightTest > i.startWeight && v.weightTest <= i.endWeight) {
              valid = true;
              if (v.weightTest >= i.firstWeight) {
                v.freightTest = ((i.firstWeightPrice + (Math.ceil((v.weightTest - i.firstWeight) / i.unitWeight)) * i.unitWeightPrice + i.registrationFee + i.operatingCost) * (1 + 0.01 * i.additionalFeeRate)).toFixed(2);
              } else {
                v.freightTest = (i.firstWeightPrice * (1 + 0.01 * i.additionalFeeRate)).toFixed(2);
              }
            }
          });
        } else {
          // 固定收费
          /*
           * 运费 = (单价 + 挂号费 + 操作费) * (1 + 附加费)
           * */
          v.editPriceModalData.forEach(i => {
            if (v.weightTest > i.startWeight && v.weightTest <= i.endWeight) {
              valid = true;
              v.freightTest = ((i.price + i.registrationFee + i.operatingCost) * (1 + 0.01 * i.additionalFeeRate)).toFixed(2);
            }
          });
        }
        if (!valid) {
          v.$Message.info('不在重量区间之内');
        }
      } else {
        v.freightTest = 0;
      }
    }, // 设置/编辑/新增自定义物流渠道弹窗---显示状态发生变化时触发的事件
    visible2(open) {
      if (!open) {
        this.setShippingModel = open;
        this.shippingParams.isPrintPickingList = 0;
        this.carrierShippingMethodPriceModelId = null;
        this.data5 = [
          {
            'carrierShippingMethodPriceModelZoneId': null,
            'carrierShippingMethodSectionChargesList': [
              {
                'additionalFeeRate': 0,
                'carrierShippingMethodPriceModelZoneId': null,
                'carrierShippingMethodSectionChargesId': null,
                'endWeight': 0,
                'firstWeight': 0,
                'firstWeightPrice': 0,
                'operatingCost': 0,
                'price': 0,
                'priceCurrency': 'CNY',
                'priceType': 0,
                'registrationFee': 0,
                'sortNo': 0,
                'startWeight': 0,
                'unitWeight': 0,
                'unitWeightPrice': 0
              }
            ],
            'countryTwoCodeList': [],
            'priceType': 0,
            'volumeWeight': 0,
            'weightType': 0,
            'zoneName': '0',
            carrierShippingMethodPriceModelZoneCountryList: []
          }
        ];
        this.data6 = [
          {
            'carrierShippingMethodPriceModelZoneId': null,
            'carrierShippingMethodSectionChargesList': [
              {
                'additionalFeeRate': 0,
                'carrierShippingMethodPriceModelZoneId': null,
                'carrierShippingMethodSectionChargesId': null,
                'endWeight': 0,
                'firstWeight': 0,
                'firstWeightPrice': 0,
                'operatingCost': 0,
                'price': 0,
                'priceCurrency': 'CNY',
                'priceType': 0,
                'registrationFee': 0,
                'sortNo': 0,
                'startWeight': 0,
                'unitWeight': 0,
                'unitWeightPrice': 0
              }
            ],
            'countryTwoCodeList': [],
            'priceType': 0,
            'volumeWeight': 0,
            'weightType': 0,
            'zoneName': '0',
            carrierShippingMethodPriceModelZoneCountryList: []
          }
        ];
        this.data7 = [];
        this.arriveableType = 1;
        this.agentAddress.addressValue = '';
        this.closeModal();
      }
    },

    // 计费模型编辑弹窗---显示状态发生变化时触发的事件
    priceVisible(open) {
      if (open) {
        this.choseCountryTag('allType');
        this.getCountrys();
        this.weightTest = 0;
        this.freightTest = 0;
      }
    },
    // 删除计费模型
    deteleTableRow (row, rowIndex) {
      let text = '';
      if (row.zoneName === '0') {
        text = '所有国家';
      } else if (row.carrierShippingMethodPriceModelZoneCountryList) {
        text = row.carrierShippingMethodPriceModelZoneCountryList.map(i => {
          return i.cnName;
        }).join('、');
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: `确认要删除通达 <span style="color:#f20;">${text}</span> 的计费模型？`,
        onOk: () => {
          this.data4.splice(rowIndex, 1);
          // 全球可达（运费不同）
          if (this.arriveableType === 2) {
            this.data6.splice(rowIndex, 1);
          } else if (this.arriveableType === 3) {
          // 非全球可达
            this.data7.splice(rowIndex, 1);
          }
          this.data4.forEach((i, index) => {
            if (this.arriveableType === 3) {
              i.zoneName = index + 1 + '';
            } else {
              i.zoneName = index + '';
            }
          });
        },
        onCancel: () => { }
      });
    },
    // 监听选择渠道引用弹窗
    visibleChange(val) {
      if (!val) {
        this.selectProvider = null;
        this.logisticsChannel = null;
      }
    },
    // 从其他渠道引用
    channelCitation() {
      this.channelModal = true;
      this.selectProvider = this.modalData.carrier.carrierId;
      this.logisticsChannel = this.modalData.carrierShippingMethod.shippingMethodId;
      this.ChangeSelectProvider(this.selectProvider);
    },

    // 批量导入--导入运费模板
    batchImport (type) {
      this.uploadZoneExcel = `${api.carrierService}${api.importPriceModelZoneExcel}`;
      this.oldImportData = this.$common.copy(this.importForm);
      this.importForm.shippingMethodId = this.shippingMethodId;
      this.newImport = type == 'new';
      if (type == 'new') {
        this.$set(this.importForm, 'priceModelZoneJson', this.$common.copy(this.data4));
        let urlAdd = '';
        if ([1, 3].includes(Number(this.arriveableType))) {
          if ([3].includes(Number(this.arriveableType))) {
            urlAdd = `importSingle=2`;
          } else {
            urlAdd = `importSingle=${this.arriveableType}`;
          }
        }
        this.uploadZoneExcel = `${api.carrierService}${api.importParseExcel}${this.$common.isEmpty(urlAdd) ? '' : '?' + urlAdd}`;
      }
      this.$nextTick(() => {
        this.file = null;
        this.modal2 = true;
      });
    },

    // 新增分区
    addPartition() {
      if (this.arriveableType === 2) {
        let lenght = this.data6.length + '';
        if (this.data4.length > 0) {
          this.data6 = JSON.parse(JSON.stringify(this.data4));
        }
        this.data6.push({
          'carrierShippingMethodPriceModelZoneId': null,
          'carrierShippingMethodSectionChargesList': [
            {
              'additionalFeeRate': 0,
              'carrierShippingMethodPriceModelZoneId': null,
              'carrierShippingMethodSectionChargesId': null,
              'endWeight': 0,
              'firstWeight': 0,
              'firstWeightPrice': 0,
              'operatingCost': 0,
              'price': 0,
              'priceCurrency': 'CNY',
              'priceType': 0,
              'registrationFee': 0,
              'sortNo': 0,
              'startWeight': 0,
              'unitWeight': 0,
              'unitWeightPrice': 0
            }
          ],
          'countryTwoCodeList': [],
          'priceType': 0,
          'volumeWeight': 0,
          'weightType': 0,
          'zoneName': lenght,
          carrierShippingMethodPriceModelZoneCountryList: []
        });
        this.data4 = JSON.parse(JSON.stringify(this.data6));
      } else if (this.arriveableType === 3) {
        let lenght = this.data7.length + 1 + '';
        if (this.data4.length > 0) {
          this.data7 = JSON.parse(JSON.stringify(this.data4));
        }
        this.data7.push({
          'carrierShippingMethodPriceModelZoneId': null,
          'carrierShippingMethodSectionChargesList': [
            {
              'additionalFeeRate': 0,
              'carrierShippingMethodPriceModelZoneId': null,
              'carrierShippingMethodSectionChargesId': null,
              'endWeight': 0,
              'firstWeight': 0,
              'firstWeightPrice': 0,
              'operatingCost': 0,
              'price': 0,
              'priceCurrency': 'CNY',
              'priceType': 0,
              'registrationFee': 0,
              'sortNo': 0,
              'startWeight': 0,
              'unitWeight': 0,
              'unitWeightPrice': 0
            }
          ],
          'countryTwoCodeList': [],
          'priceType': 0,
          'volumeWeight': 0,
          'weightType': 0,
          'zoneName': lenght,
          carrierShippingMethodPriceModelZoneCountryList: []
        });
        this.data4 = JSON.parse(JSON.stringify(this.data7));
      }
    },
    // 导出计费模型
    exportPriceZone () {
      if (this.downLoading) return this.$Message.warning('正在导出文件中....');
      this.downLoading = true;
      this.axios({
        method: "post",
        url: `${api.exportPriceModelZone}/${this.shippingMethodId}`,
        data: {},
        responseType: "blob",
        timeout: 600000,
        headers: {
          // 这个置空，否则导出时有可能有问题
          PlatformId: ''
        }
      }).then(res => {
        if (!res || !res.resData) {
          this.downLoading = false;
          return this.$Message.error('下载失败');
        }
        this.$common.downloadFile(res.resData, { name: res.filename }).finally(() => {
          this.downLoading = false;
        })
      })
    },
    // 打开导入物流限制弹窗
    openImportRestrictionModal () {
      this.file = null;
      this.restrictionModalVisible = true;
      this.importRestrictionLoading = false;
      this.restrictioImportData.shippingMethodId = this.shippingMethodId;
    },
    // 确认导入物流限制信息
    saveRestrictionImport () {
      this.importRestrictionLoading = true;
      if (this.file) {
        this.$refs.restrictionImprotRef.post(this.file);
      } else {
        this.importRestrictionLoading = false;
        this.$Message.error('选择上传文件');
      }
    },
    // 物流限制导入成功
    restrictionImportSuccess (res, file, fileList) {
      if (!res || res.code != 0) return;
      // 刷新详情弹窗里面的详情数据
      this.showShippingSetting(this.showShippingSettingId);
      this.restrictionModalVisible = false;
    },
    // 下载模板
    downloadTemplate (str) {
      if (this.$common.isEmpty(str)) return;
      const obj = {
        restriction: '/setting-service/template/logisticsLimitTemplate.xlsx',
      }
      if (this.$common.isEmpty(obj[str])) return;
      window.open(`${api.carrierService}/${this.filenodeViewTargetUrl}${obj[str]}`, '_self');
    },
    // 导出物流限制
    exportLogisticsRestriction () {
      if (this.logisticsLimitExport) return this.$Message.warning('正在导出文件中....');
      this.logisticsLimitExport = true;
      this.axios({
        method: "post",
        url: api.exportShippingLogistics,
        data: {},
        params: {
          shippingMethodId: this.shippingMethodId
        },
        responseType: "blob",
        timeout: 600000,
      }).then(res => {
        if (!res || !res.resData) {
          this.logisticsLimitExport = false;
          return this.$Message.error('下载失败');
        }
        this.$common.downloadFile(res.resData, { name: res.filename }).finally(() => {
          this.logisticsLimitExport = false;
        })
      });
    },
    // 添加特例国家
    addSpecialCountry(platformId) {
      const platformCarrierSettings = this.shippingParams.platformCarrierSettings[platformId] ? this.shippingParams.platformCarrierSettings[platformId][0] : {};
      let obj = {
        carrierCode: '',
        countryCode: '',
        platformSite: null,
        platformId: platformId,
        trackingNumberType: 0,
        markDeliveryType: platformCarrierSettings ? platformCarrierSettings.markDeliveryType || 0 : 0,
        carrierType: platformCarrierSettings ? platformCarrierSettings.carrierType || false : false
      };
      if (platformId === 'ebay') {
        obj.syncFirst = platformCarrierSettings ? platformCarrierSettings.syncFirst || false : false;
      }
      if (platformId === 'wish') {
        obj.deliveryCountryCode = '';
      }
      if (platformId === 'otto') {
        obj.deliveryCity = '';
        obj.deliveryZipCode = '';
        obj.deliveryCountry = '';
        obj.returnLogisticsServiceProvider = '';
      }
      this.shippingParams.platformCarrierSettings[platformId].push(obj);
    },

    // 删除--单个平台标发货设置
    delShippingParamsItem(index, platformId) {
      this.shippingParams.platformCarrierSettings[platformId].splice(index, 1);
    },

    // 判断是否有选中---平台标发货设置
    getNewShippingParamsObj(obj) {
      let arr = [];
      const deleteKey = ['syncFirst', 'platformSite'];
      return new Promise(resolve => {
        let len = Object.keys(obj.platformCarrierSettings).length;
        // shippingParams.platformCarrierSettings[platformItem.platformId][index]
        for (let item in obj.platformCarrierSettings) {
          len--;
          obj.platformCarrierSettings[item].forEach((n, i) => {
            this.platformGroup.forEach((m, t) => { // 如果勾选了
              if (n.platformId === m.platformId && m.checkboxStatus) {
                n.markDeliveryType = obj.platformCarrierSettings[item][0].markDeliveryType || 0;
                n.carrierType = obj.platformCarrierSettings[item][0].carrierType ? 1 : 0;
                if (['ebay'].includes(item)) {
                  n.syncFirst = obj.platformCarrierSettings[item][0].syncFirst ? 1 : 0
                }
                n.site = n.platformSite || null;
                // 移除一些不需要的值
                deleteKey.forEach(key => {
                  delete n[key];
                });
                arr.push(n);
              }
            });
          });
          if (len === 0) {
            resolve(arr);
          }
        }
        if (len === 0) {
          resolve([]);
        }
      });
    },
    handleFormatError() {
      this.loading5 = false;
      this.importRestrictionLoading = false;
      this.$Message.error('文件格式有误');
    },
    // 验证国家下对应的数据填写是否符合规则
    verifyCountryForm () {
      let erroInfo = {};
      let countryVal = [];
      let itemInfo = {};
      const requiredKey = {
        minEfficiency: { less: 'maxEfficiency', msg: '参考时效开始值不能大于结束值' },
        maxEfficiency: { greater: 'minEfficiency', msg: '参考时效结束值不能小于开始值' },
        maxLength: { notZero: true, keyList: ['maxWidth', 'maxHeight'], msg: '最大尺寸宽或高不为0，长度也不能为0' },
        maxWidth: { notZero: true, keyList: ['maxLength', 'maxHeight'], msg: '最大尺寸长或高不为0，宽度也不能为0' },
        maxHeight: { notZero: true, keyList: ['maxLength', 'maxWidth'], msg: '最大尺寸长或宽不为0，高度也不能为0' },
        minLength: { notZero: true, keyList: ['minWidth', 'minHeight'], msg: '最小尺寸宽或高不为0，长度也不能为0' },
        minWidth: { notZero: true, keyList: ['minLength', 'minHeight'], msg: '最小尺寸长或高不为0，宽度也不能为0' },
        minHeight: { notZero: true, keyList: ['minLength', 'minWidth'], msg: '最小尺寸长或宽不为0，高度也不能为0' },
        minVolume: { less: 'maxVolume', msg: '体积限制开始值不能大于结束值' },
        maxVolume: { greater: 'minVolume', msg: '体积限制结束值不能小于开始值' },
        minWeight: { less: 'maxWeight', msg: '适用重量开始值不能大于结束值' },
        maxWeight: { greater: 'minWeight', msg: '适用重量结束值不能小于开始值' },
        acceptableType: { required: true, msg: '接收类型不能为空' },
      };
      const verifyKey = Object.keys(requiredKey);
      let focusKey = '';
      let errorKey = '';
      this.countryLogisticsLimitKeys.forEach((key) => {
        itemInfo = this.$common.copy(this.countryLogisticsLimitJson[key]);
        if (this.$common.isEmpty(erroInfo) && this.$common.isEmpty(errorKey)) {
          errorKey = verifyKey.find(vKey => {
          // 必填
            if (requiredKey[vKey].required) {
              return this.$common.isEmpty(itemInfo[vKey]);
            }
            // 小于
            if (requiredKey[vKey].less) {
              return itemInfo[vKey] > itemInfo[requiredKey[vKey].less];
            }
            // 大于
            if (requiredKey[vKey].greater) {
              return itemInfo[vKey] < itemInfo[requiredKey[vKey].greater];
            }
            // 当前值不为 0(空) 时指定值里面不能为 0(空)
            if (requiredKey[vKey].notZero) {
              if (!this.$common.isEmpty(itemInfo[vKey]) && itemInfo[vKey] != 0) {
                return !this.$common.isEmpty(requiredKey[vKey].keyList.find(nKey => {
                  if (this.$common.isEmpty(itemInfo[nKey]) || itemInfo[nKey] == 0) {
                    focusKey = nKey;
                    return true;
                  }
                }));
              }
              return false;
            }
            return false;
          });
          if (!this.$common.isEmpty(errorKey)) {
            erroInfo = this.countryLogisticsLimitJson[key];
            erroInfo.msg = requiredKey[focusKey || errorKey].msg;
            erroInfo.focusKey = focusKey;
            erroInfo.errorKey = errorKey;
          }
        }
        delete itemInfo.temporaryId;
        delete itemInfo.countryNameTxt;
        countryVal.push({
          ...itemInfo,
          shippingMethodId: this.shippingMethodId,
          acceptableType: itemInfo.acceptableType.join(','),
        })
      });
      return { data: countryVal, error: erroInfo };
    },
    // 设置/编辑自定义物流渠道--保存按钮
    setShippingMethod(tApi) {
      let pos = [];
      const requiredKey = {
        carrierShippingMethodName: { required: true, msg: '物流渠道名称不能为空' },
        carrierShippingMethodCode: { required: true, msg: '物流渠道代码不能为空' },
      };
      let focusKey = '';
      const valObj = this.logisticsChannelModalParams.carrierShippingMethod;
      const errorKey = Object.keys(requiredKey).find(key => {
        // 必填
        if (requiredKey[key].required) {
          return this.$common.isEmpty(valObj[key]);
        }
        // 小于
        if (requiredKey[key].less) {
          return valObj[key] > valObj[requiredKey[key].less];
        }
        // 大于
        if (requiredKey[key].greater) {
          return valObj[key] < valObj[requiredKey[key].greater];
        }
        // 当前值不为 为 0 或 空时指定值里面不能为 0 或 空
        if (requiredKey[key].notZero) {
          if (!this.$common.isEmpty(valObj[key]) && valObj[key] != 0) {
            return !this.$common.isEmpty(requiredKey[key].keyList.find(nKey => {
              if (this.$common.isEmpty(valObj[nKey]) || valObj[nKey] == 0) {
                focusKey = nKey;
                return true;
              }
            }));
          }
          return false;
        }
        return false;
      });
      if (this.$common.isEmpty(focusKey)) {
        focusKey = errorKey;
      }
      if (!this.$common.isEmpty(errorKey)) {
        this.$Message.error(requiredKey[errorKey].msg);
        // 输入框聚焦
        if (this.$refs[focusKey]) {
          const inputDemo = this.$refs[focusKey].$el.querySelector('input');
          if (this.$common.isEmpty(inputDemo)) return;
          inputDemo.focus();
        }
        return;
      }

      let result = this.handleSubmit('shippingParams');
      // 验证表单是否合理
      const getCountryVal = this.verifyCountryForm();
      if (!this.$common.isEmpty(getCountryVal.error)) {
        this.$Message.error(`物流限制栏 “${getCountryVal.error.countryNameTxt}” ${getCountryVal.error.msg}`);
        this.activeTemporaryId = getCountryVal.error.temporaryId;
        this.$nextTick(() => {
          focusKey = `${getCountryVal.error.temporaryId}-${getCountryVal.error.focusKey || getCountryVal.error.errorKey}`;
          setTimeout(() => {
            if (!this.$common.isEmpty(focusKey)) {
              // 输入框聚焦
              if (this.$refs[focusKey]) {
                const inputDemo = this.$refs[focusKey].$el.querySelector('input');
                if (this.$common.isEmpty(inputDemo)) return;
                inputDemo.focus();
              }
            }
          }, 300)
        });
        return;
      }
      if (result) {
        let obj = this.deepCopy(this.shippingParams);
        this.getNewShippingParamsObj(obj).then(result => {
          obj.platformCarrierSettings = result || [];
          obj.carrierShippingMethodPriceModel = {};
          obj.carrierShippingMethodPriceModel.priceType = this.pricingParams.priceType;
          obj.carrierShippingMethodPriceModel.weightType = this.pricingParams.weightType;
          obj.carrierShippingMethodPriceModel.freightDiscount = this.freightDiscount;
          obj.carrierShippingMethodPriceModel.freightCurrency = this.freightCurrency;
          obj.carrierShippingMethodPriceModel.freightDiscountType = this.freightDiscountType;
          obj.carrierShippingMethodPriceModel.carrierShippingMethodPriceModelId = this.carrierShippingMethodPriceModelId;
          obj.carrierShippingMethodPriceModelZoneList = this.data4;
          // 国家数据
          obj.countryLogisticsLimitList = getCountryVal.data;
          obj.updateApplicationScopeBo = {
            goodsTagList: this.goodsTagList,
            maxGoodsQuantity: this.carrierShippingMethodParmas.maxGoodsQuantity,
            maxPrice: this.carrierShippingMethodParmas.maxPrice,
            maxShippingFeeIncome: this.carrierShippingMethodParmas.maxShippingFeeIncome,
            minGoodsQuantity: this.carrierShippingMethodParmas.minGoodsQuantity,
            minPrice: this.carrierShippingMethodParmas.minPrice,
            minShippingFeeIncome: this.carrierShippingMethodParmas.minShippingFeeIncome,
            skuList: this.skuList.length > 0 ? this.skuList.split(/[ |,]/) : [],
            warehouseIdList: this.warehouseIdList
          };
          obj.arriveableType = this.arriveableType; // 邮寄方式  可达类型(1全球可达运费相同2全球可达运费不同3非全球可达) ,
          if (obj.carrierShippingMethodPriceModelZoneList) {
            let valid = obj.carrierShippingMethodPriceModelZoneList.some(i => {
              return i.zoneName !== '0' && (!i.countryTwoCodeList || i.countryTwoCodeList.length === 0);
            });
            if (valid) {
              this.$Message.error('默认分区外计费模型国家不能为空');
              return;
            }

            obj.carrierShippingMethodPriceModelZoneList.forEach((n, i) => {
              if (n.carrierShippingMethodSectionChargesList) {
                n.carrierShippingMethodSectionChargesList.forEach((m, t) => {
                  pos.push(m);
                });
              }
            });
          }
          obj.carrierShippingMethodSectionCharges = pos;
          /* 添加基础信息 */
          obj.baseDetail = this.logisticsChannelModalParams.carrierShippingMethod;
          obj.baseDetail.acceptablePackageTypeList = this.logisticsChannelModalParams.acceptablePackageTypeList;
          obj.baseDetail.skipLogistics = this.$common.isEmpty(this.logisticsChannelModalParams.skipLogistics) ? 0 : this.logisticsChannelModalParams.skipLogistics[0];
          obj.baseDetail.arriveableType = this.arriveableType; // 邮寄方式  可达类型(1全球可达运费相同2全球可达运费不同3非全球可达)
          obj.baseDetail.isPrintPickingList = this.shippingParams.isPrintPickingList;

          if (this.openType === 'addCustom') {
            obj.carrierId = this.formInline.carrierId;
            delete obj.shippingMethodId;
          }
          this.buttonTalg = true;
          this.loading4 = true;
          if (this.showStatus === 'API_AE_LG' || this.showStatus === 'API_EDIS' || this.showStatus === 'api_joomLogistics') { // 速卖通线上发货
            let pos = [];
            if (this.sendAddress.addressValue !== null) {
              pos.push({
                addressType: this.sendAddress.addressType,
                addressValue: this.sendAddress.addressValue,
                saleAccountId: this.saleAccountIdCopy,
                shippingMethodId: this.shippingMethodIdCopy
              });
            }
            if (this.pickupAddress.addressValue !== null) {
              pos.push({
                addressType: this.pickupAddress.addressType,
                addressValue: this.pickupAddress.addressValue,
                saleAccountId: this.saleAccountIdCopy,
                shippingMethodId: this.shippingMethodIdCopy
              });
            }
            if (this.refundAddress.addressValue !== null) {
              pos.push({
                addressType: this.refundAddress.addressType,
                addressValue: this.refundAddress.addressValue,
                saleAccountId: this.saleAccountIdCopy,
                shippingMethodId: this.shippingMethodIdCopy
              });
            }
            if (this.agentAddress.addressValue !== null) {
              pos.push({
                addressType: this.agentAddress.addressType,
                name: this.agentAddress.name,
                street1: this.agentAddress.street1,
                mobile: this.agentAddress.mobile,
                saleAccountId: this.saleAccountIdCopy,
                shippingMethodId: this.shippingMethodIdCopy
              });
            }
            obj.addressList = pos;
            obj.saleAccountId = this.saleAccountIdCopy;
            obj.shippingMethodId = this.shippingMethodIdCopy;
            // tApi 新增
            let apiUrl = tApi || api.set_updateWithAccount;
            let apiType = tApi ? 'post' : 'put';
            this.axios[apiType](apiUrl, JSON.stringify(obj)).then(response => {
              if (response.data.code === 0) {
                this.$Message.success('操作成功');
                this.resetShippingData();
                if (obj.baseDetail.carrierId) {
                  this.$emit('changeShippingMethodsTalg', obj.baseDetail.carrierId);
                }
                this.closeModal();
              } else {
                this.shippingLoading = false;
                this.$nextTick(() => {
                  this.shippingLoading = true;
                });
              }
              this.buttonTalg = false;
              this.loading4 = false;
            }).catch(() => {
              this.buttonTalg = false;
              this.loading4 = false;
            })
          } else {
            let apiUrl = tApi || api.set_carrierShippingMethod;
            let apiType = tApi ? 'post' : 'put';
            this.axios[apiType](apiUrl, JSON.stringify(obj)).then(response => {
              if (response.data.code === 0) {
                this.$Message.success('操作成功');
                if (obj.baseDetail.carrierId) {
                  this.$emit('changeShippingMethodsTalg', obj.baseDetail.carrierId);
                }
                this.resetShippingData();
                this.closeModal();
              }
              this.buttonTalg = false;
              this.loading4 = false;
            }).catch(() => {
              this.buttonTalg = false;
              this.loading4 = false;
            })
          }
        });
      } else {
        this.$Message.error('表单填写存在不规范，请检查');
        this.resetLoading('shippingLoading');
        return false;
      }
    },

    // 新增自定义物流渠道--保存按钮
    addCustomMt() {
      this.setShippingMethod(api.add_customShip);
    },

    // 选中--全部自营仓库
    handleCheckAll() {
      if ((this.looKsettings || this.cannotSave)) return;
      if (this.indeterminate) {
        this.checkAll = false;
      } else {
        this.checkAll = !this.checkAll;
      }
      this.indeterminate = false;

      if (this.checkAll) {
        this.warehouseIdList = [];
        this.storeList.map(i => {
          if (i.warehouseType === '0') {
            this.warehouseIdList.push(i.warehouseId);
          }
        });
      } else {
        this.warehouseIdList = [];
      }
    },
    changeCarrierCode (value, platformId) {
      if (platformId === 'amazon') {
        this.getDeliveryList(platformId, platformId + '_' + value)
      }
    },
    handleCreateCarrierCode(value, { platformId, index }) {
      this.carrierCodeArr[platformId].push({
        valueCode: value,
        valueCnName: value
      });
      this.$forceUpdate();
    },
    // 选中--平台标发货设置
    setCheckboxStatus(value, index) {
      let v = this;
      delete v.platformGroup[index].checkboxStatus;
      v.$set(v.platformGroup[index], 'checkboxStatus', value);
      v.showMarkShipping = false;
      v.$nextTick(function () {
        v.showMarkShipping = true;
      });
    },

    // 表单必填项的校验规则
    validCarrier(index, platformId, status, val) {
      let v = this;
      var validCarrier1 = function (rule, value, callback) {
        if (status && (v.shippingParams.platformCarrierSettings[platformId][0].carrierCode === '' || v.shippingParams.platformCarrierSettings[platformId][0].carrierCode === null)) {
          callback(new Error('内容不能为空'));
        } else {
          callback();
        }
      };
      return validCarrier1;
    },

    // 选择发货地址
    changeSender(val) {
      let v = this;
      v.sendList.forEach((n, i) => {
        if (n.addressId === val) {
          v.showSendList = n;
        }
      });
    },
    changeAgentAddress(value) {
      this.agentList.forEach((n, i) => {
        if (n.carrierPlatformAccountAddressId === value) {
          this.agentAddress.name = n.name;
          this.agentAddress.street1 = n.street1;
          this.agentAddress.mobile = n.mobile;
        }
      });
    },
    // 选择揽收地址
    changePickup(val) {
      let v = this;
      v.pickupList.forEach((n, i) => {
        if (n.addressId === val) {
          v.showPickupList = n;
          v.deliverType = n.type;
          v.deliverTime = n.pickupTime;
        }
      });
    },

    // 选择退件地址
    changeRefund(val) {
      let v = this;
      v.refundList.forEach((n, i) => {
        if (n.addressId === val) {
          v.showRefundList = n;
        }
      });
    },
    // 计费模型编辑弹窗--选中国家
    choseCountryTag(item) {
      this.countryCodesName.forEach(i => {
        i.checked = false;
      });
      if (item === 'allType') {
        this.allCountry = true;
        let arr = [];
        this.countryCodesName.forEach(i => {
          arr = arr.concat(...i.countries);
        });
        this.choseCountryList = arr.map(i => {
          return i.twoCode;
        });
      } else {
        this.choseCountryList = item.countries.map(i => {
          return i.twoCode;
        });
        item.checked = true;
        this.allCountry = false;
      }
    },
    // 计费模型编辑弹窗--搜索国家
    searchCountryHandel(value) {
      let arr = [];
      let v = this;
      v.countryCodesName.forEach(i => {
        i.countries.forEach(j => {
          if (j.cnName.indexOf(v.searchCountry) > -1 || j.twoCode.indexOf(v.searchCountry) > -1) {
            arr.push(j);
          }
        });
      });
      this.choseCountryList = arr.map(i => {
        return i.twoCode;
      });
    },
    // 计费模型编辑弹窗--选中全部国家
    setAllCountryList() {
      const ids = this.choseCountryList.filter(f => !this.disabledUseCountry.includes(f));
      this.choseCountryId = [...new Set([...this.choseCountryId, ...ids])];
    },
    // 计费模型编辑弹窗--清空已选中国家
    clearChoseCountryId() {
      this.choseCountryId = [];
    },
    // 计费模型编辑弹窗--新增重量区间
    addWeightIntervals() {
      let v = this;
      let data = {
        'additionalFeeRate': 0,
        'carrierShippingMethodPriceModelZoneId': null,
        'carrierShippingMethodSectionChargesId': null,
        'endWeight': 0,
        'firstWeight': 0,
        'firstWeightPrice': 0,
        'operatingCost': 0,
        'price': 0,
        'priceCurrency': 'CNY',
        'priceType': 0,
        'registrationFee': 0,
        'sortNo': 0,
        'startWeight': 0,
        'unitWeight': 0,
        'unitWeightPrice': 0
      };
      if (v.editPriceModalData.length === 0) {
        v.editPriceModalData.push(data);
      } else {
        v.validPrice().then((validData) => {
          if (validData.valid) {
            data.startWeight = v.cacheEditPriceModalData[v.cacheEditPriceModalData.length - 1].endWeight;
            v.editPriceModalData.push(data);
          } else {
            v.$Message.error(validData.errMes);
          }
        });
      }
      v.cacheEditPriceModalData = v.editPriceModalData;
    },
    // 计费模型编辑弹窗--处理新增重量区间的数据
    validPrice() {
      return new Promise((resolve, reject) => {
        let valid = true;
        let errMes = '';
        this.cacheEditPriceModalData.filter(i => {
          if (i.endWeight <= i.startWeight) {
            valid = false;
            errMes = '截止重量要大于起始重量';
            return;
          }

          if (this.isShowCountry) {
            // 国家
            if (this.choseCountryId.length === 0 || this.choseCountryId === null) {
              valid = false;
              errMes = '请选择国家';
              return;
            }
          }

          if (this.pricingQuantityMode.priceType === 1 || this.pricingQuantityMode.priceType === 3) {
            if (this.$common.isEmpty(i.price)) {
              valid = false;
              errMes = '价格不能为空'; // 价格
            }
          } else if (this.pricingQuantityMode.priceType === 2) {
            if (i.firstWeight === 0) {
              valid = false;
              errMes = '首重不能为空'; // 首重
            } else if (i.firstWeightPrice === 0) {
              valid = false;
              errMes = '首重运费不能为空'; // 首重运费
            } else if (i.unitWeight === 0) {
              valid = false;
              errMes = '续重单位重量不能为空'; // 续重单位重量
            } else if (i.unitWeightPrice === 0) {
              valid = false;
              errMes = '续重单价不能为空'; // 续重单价
            }
          }
        });
        resolve({
          valid: valid,
          errMes: errMes
        });
      });
    },
    // 计费模型编辑弹窗--保存按钮
    editOK() {
      let v = this;
      if (v.pricingQuantityMode.weightType === 2 || v.pricingQuantityMode.weightType === 3) {
        if (v.pricingQuantityMode.volumeWeight === 0) {
          v.$Message.error('材积重不能为空');
          return;
        }
      }
      let arr = [];
      this.countryCodesName.forEach(i => {
        arr = arr.concat(...i.countries);
      });

      v.validPrice().then(validData => {
        if (validData.valid) {
          v.editPriceModal = false;
          v.data4[v.editIndex].carrierShippingMethodSectionChargesList = v.cacheEditPriceModalData;
          v.data4[v.editIndex].volumeWeight = v.pricingQuantityMode.volumeWeight;
          v.data4[v.editIndex].weightType = v.pricingQuantityMode.weightType;
          v.data4[v.editIndex].priceType = v.pricingQuantityMode.priceType;
          v.data4[v.editIndex].formula = v.freightText;
          v.data4[v.editIndex].countryTwoCodeList = v.choseCountryId;
          v.data4[v.editIndex].carrierShippingMethodPriceModelZoneCountryList = arr.filter(i => {
            if (v.choseCountryId.indexOf(i.twoCode) > -1) {
              return i;
            }
          });
          let data = JSON.parse(JSON.stringify(v.data4));
          v.data4 = [];
          v.data4 = data;
          v.editPriceModalData = [];
        } else {
          v.$Message.error(validData.errMes);
        }
      });
    },
    // 导入运费模板弹窗--批量上传文件
    beforeHandleUpload(file) {
      this.file = file;
      return false;
    },
    // 导入运费模板弹窗--批量上传文件成功
    uploadSuccess(res, file, fileList) {
      let v = this;
      this.loading5 = false;
      this.file = null;
      if (res.code === 0) {
        v.$Message.success('上传成功');
        v.data4 = [];
        if (res.datas.errorPath) {
          window.open(res.datas.errorPath, '_self');
        }
        let data = res.datas.carrierShippingMethodPriceModelZones || res.datas || [];
        data.forEach(i => {
          if (i.carrierShippingMethodPriceModelZoneCountryList) {
            i.countryTwoCodeList = i.carrierShippingMethodPriceModelZoneCountryList.map(j => {
              return j.twoCode;
            });
          }
        });
        if (v.arriveableType === 1) {
          v.data5 = data;
          v.data4 = JSON.parse(JSON.stringify(v.data5));
        } else if (v.arriveableType === 2) {
          if (this.newImport) {
            v.data6 = data;
          } else {
            let arr = [];
            v.data6.forEach(i => {
              if (i.zoneName === '0') {
                arr.push(i);
              }
            });
            v.data6 = [...arr, ...data];
          }
          v.data4 = JSON.parse(JSON.stringify(v.data6));
        } else if (v.arriveableType === 3) {
          v.data7 = data;
          v.data4 = JSON.parse(JSON.stringify(v.data7));
        }
      }
      v.coloseUptateFile();
    },
    // 导入运费模板弹窗--批量上传文件失败
    uploadError() {
      this.loading5 = false;
      this.importRestrictionLoading = false;
      // this.$Message.error('操作失败，请重新尝试');
    },
    // 导入运费模板弹窗--下载文件模板
    download () {
      if (this.newImport) {
        const openUrlJson = {
          // 普通计费
          '1': '/setting-service/template/priceModel-1.xlsx',
          // 首续重计费
          '2': '/setting-service/template/priceModel-2.xlsx',
          // 固定计费
          '3': '/setting-service/template/priceModel-1.xlsx'
        }
        if (this.$common.isEmpty(openUrlJson[this.importForm.priceType])) {
          return this.$Message.error('暂无当前计费方式的模板可下载，请联系管理员处理');
        }
        window.open(`${api.carrierService}/${this.filenodeViewTargetUrl}${openUrlJson[this.importForm.priceType]}`, '_self');
        return;
      }
      this.axios.get(api.getMethodPriceModelZoneTemplet + this.importForm.priceType).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          window.open(api.carrierService + '/' + this.filenodeViewTargetUrl + data, '_self');
        }
      });
    },
    // 导入运费模板弹窗--保存按钮
    saveImport() {
      this.loading5 = true;
      if (this.file) {
        this.$refs.uploadRef.post(this.file);
      } else {
        this.loading5 = false;
        this.$Message.success('选择上传文件');
      }
    },
    // 关闭导入文件弹窗
    coloseUptateFile () {
      this.file = null;
      this.importForm = this.$common.copy(this.oldImportData);
      this.$nextTick(() => {
        this.modal2 = false;
      });
    },
    // 获取设置/编辑/新增自定义物流渠道弹窗的相关数据
    showShippingSetting (id, index) { // 查询物流方式设置详情
      let v = this;
      v.loading4 = true;
      v.cannotSave = false;
      // 存下shippingMethodId和saleAccountId，详情保存时用到
      v.shippingMethodIdCopy = id;
      if (v.tabIndex !== null && v.tabs) {
        v.saleAccountIdCopy = v.tabs[v.tabIndex].carrierAccountId;
      } else {
        v.saleAccountIdCopy = v.carrierAccountId;
      }
      v.setShippingMethodStatus = true;
      v.getStore(1);// 获取仓库列表
      v.getProductTagList(api.carrierServiceCommon);// 获取标签列表名称
      v.GetQuotingLogisticsData(); // 获取从其他渠道引用的物流商数据
      v.warehouseIdList = [];
      v.goodsTagList = [];
      v.skuList = '';
      if (v.showStatus === 'API_AE_LG' || v.showStatus === 'API_EDIS' || v.showStatus === 'api_joomLogistics') {
        v.axios.get(api.get_carrierAliexpressDetail + '?shippingMethodId=' + id + '&saleAccountId=' + v.saleAccountIdCopy).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.logisticsChannelModalParams.carrierShippingMethod = data.carrierShippingMethod;
            v.handCountryData(data.countryLogisticsLimitList || []);
            v.modalData = data;
            v.logisticsChannelModalParams.carrierShippingMethod.carrierName = data.carrier.carrierName;
            if (data.baseDetail.acceptablePackageTypeList) {
              v.logisticsChannelModalParams.acceptablePackageTypeList = data.baseDetail.acceptablePackageTypeList.map(i => i.value);
            }
            let carrierShippingMethodPriceModel = data.carrierShippingMethodPriceModel;
            if (carrierShippingMethodPriceModel) {
              v.pricingParams.priceType = carrierShippingMethodPriceModel.priceType;
              v.freightDiscount = carrierShippingMethodPriceModel.freightDiscount;
              v.freightCurrency = carrierShippingMethodPriceModel.freightCurrency;
              v.freightDiscountType = carrierShippingMethodPriceModel.freightDiscountType;
              v.carrierShippingMethodPriceModelId = carrierShippingMethodPriceModel.carrierShippingMethodPriceModelId;
              if (carrierShippingMethodPriceModel.priceType === 3) {
                v.setCachePriceModelColumns(data.carrierShippingMethodPriceModelZoneList);
              }
              v.pricingParams.weightType = carrierShippingMethodPriceModel.weightType;
              for (let i = 0; i < data.carrierShippingMethodWarehouseList.length; i++) {
                let item = data.carrierShippingMethodWarehouseList[i];
                v.warehouseIdList.push(item.warehouseId);
              }
            }
            v.carrierShippingMethodParmas = v.deepCopy(data.carrierShippingMethod);
            if (!v.$common.isEmpty(v.carrierShippingMethodParmas.skipLogistics) && v.carrierShippingMethodParmas.skipLogistics != 0) {
              v.logisticsChannelModalParams.skipLogistics = [Number(v.carrierShippingMethodParmas.skipLogistics)];
            } else {
              v.logisticsChannelModalParams.skipLogistics = [];
            }
            if (v.carrierShippingMethodParmas.arriveableType !== null && v.carrierShippingMethodParmas.arriveableType !== 0 && data.carrierShippingMethodPriceModelZoneList && data.carrierShippingMethodPriceModelZoneList.length > 0) {
              data.carrierShippingMethodPriceModelZoneList.forEach(i => {
                if (i.carrierShippingMethodPriceModelZoneCountryList) {
                  i.countryTwoCodeList = i.carrierShippingMethodPriceModelZoneCountryList.map(j => {
                    return j.twoCode;
                  });
                }
              });

              v.$nextTick(() => {
                let zoneList = data.carrierShippingMethodPriceModelZoneList || [];
                v.arriveableType = v.carrierShippingMethodParmas.arriveableType
                  ? v.carrierShippingMethodParmas.arriveableType
                  : 1;
                v.data4 = zoneList;

                if (v.arriveableType === 1) {
                  v.data5 = zoneList;
                } else if (v.arriveableType === 2) {
                  v.data6 = zoneList; // 计费模型
                } else if (v.arriveableType === 3) {
                  v.data7 = zoneList; // 计费模型
                }
              });
            } else {
              v.arriveableType = 1;
              v.data4 = v.data5; // data5 为默认值
            }
            if (carrierShippingMethodPriceModel.priceType === 3) { // 如果是分段续费，则去分段那里取计费方式
              v.pricingParams.subCostWay = data.carrierShippingMethodPriceModelZoneList[0].carrierShippingMethodSectionChargesList[0].priceType;
            }
            if (v.shopList.length === 0) { // 获取平台/帐号
              v.getShopList(1, api.carrierServiceCommon, null, true).then(result => {
                v.setShopGroup(v.shopList, data.carrierShippingMethodPlatformList);
              });
            } else {
              v.setShopGroup(v.shopList, data.carrierShippingMethodPlatformList);
            }
            v.cachePricingData = data.carrierShippingMethodPriceModelZoneList;
            // 获取各平台物流服务商
            v.makeCarrierCode().then(result => {
              if (result) {
                let cm = data.carrierShippingMethod;
                v.systemShippingMethodId = cm.systemShippingMethodId;
                v.shippingMethodId = cm.shippingMethodId;
                let cp = data.carrierParams;
                let pcs = data.platformCarrierSettings;
                let cpArr = [];
                cp.forEach((n, i) => { // 整理初始化保存数据
                  if (n.paramValue === null) {
                    n.paramValue = '';
                  }
                  cpArr.push({
                    paramKey: n.paramKey,
                    paramValue: n.paramValue,
                    dataType: n.dataType
                  });
                });
                if (pcs.length > 0) {
                  var obj = v.deepCopy(v.shippingParams.platformCarrierSettings);
                  let platObj = {};// 判断选中平台
                  pcs.forEach((n, i) => {
                    if (!platObj.hasOwnProperty(n.platformId)) {
                      v.platformGroup.forEach((g, k) => {
                        if (g.platformId === n.platformId) {
                          v.platformGroup[k].checkboxStatus = true;
                        }
                      });
                      platObj[n.platformId] = 1;
                    }
                    if (n.platformId === null) {
                      n.platformId = 'ebay';
                    }
                    let addObj = {}
                    if ((typeof n.carrierType !== 'undefined' && this.$common.isEmpty(n.carrierType)) || [0, '0'].includes(n.carrierType)) {
                      addObj.carrierType = i > 0 ? pcs[0].carrierType : false;
                    } else if ([1, '1'].includes(n.carrierType)) {
                      addObj.carrierType = i > 0 ? pcs[0].carrierType : true;
                    }
                    if (['ebay'].includes(n.platformId)) {
                      if ((typeof n.syncFirst !== 'undefined' && this.$common.isEmpty(n.syncFirst)) || [0, '0'].includes(n.syncFirst)) {
                        addObj.syncFirst = i > 0 ? pcs[0].syncFirst : false;
                      } else if ([1, '1'].includes(n.syncFirst)) {
                        addObj.syncFirst = i > 0 ? pcs[0].syncFirst : true;
                      }
                    }
                    if ((n.countryCode === null || n.countryCode === '') && obj.hasOwnProperty(n.platformId)) {
                      obj[n.platformId][0] = Object.assign(obj[n.platformId][0], { ...n, ...addObj });
                    } else if (n.countryCode !== null && n.countryCode !== '' && obj.hasOwnProperty(n.platformId)) {
                      let platformObj = { // 整理参数
                        carrierCode: n.carrierCode,
                        countryCode: n.countryCode,
                        platformId: n.platformId === null ? 'ebay' : n.platformId,
                        trackingNumberType: n.trackingNumberType,
                        markDeliveryType: obj[n.platformId][0] ? obj[n.platformId][0].markDeliveryType || 0 : 0,
                        carrierType: obj[n.platformId][0] ? obj[n.platformId][0].carrierType || false : false,
                        deliveryCountryCode: n.deliveryCountryCode,
                        platformSite: n.site,
                      };
                      if (this.$common.isEmpty(n.site)) {
                        const codeInfo = this.carrierCodeArr[n.platformId].find(f => f.valueCode == n.carrierCode);
                        platformObj.platformSite = this.$common.isEmpty(codeInfo) ? null : codeInfo.site || null;
                      }
                      if (['ebay'].includes(n.platformId)) {
                        platformObj.syncFirst = obj[n.platformId][0] ? obj[n.platformId][0].syncFirst || false : false
                      }
                      if (n.platformId === 'otto') {
                        platformObj.deliveryCity = n.deliveryCity;
                        platformObj.deliveryZipCode = n.deliveryZipCode;
                        platformObj.returnLogisticsServiceProvider = n.returnLogisticsServiceProvider;
                      }
                      obj[n.platformId].push(platformObj);

                      if (n.platformId === 'otto') {
                        platformObj.deliveryCountry = n.deliveryCountry;
                        platformObj.deliveryCity = n.deliveryCity;
                        platformObj.deliveryZipCode = n.deliveryZipCode;
                        platformObj.returnLogisticsServiceProvider = n.returnLogisticsServiceProvider;
                      }
                      obj[n.platformId].push(platformObj);
                    }
                    if (!this.$common.isEmpty(obj[n.platformId]) && !this.$common.isEmpty(n.carrierCode)) {
                      const codeInfo = this.carrierCodeArr[n.platformId].find(f => f.valueCode == n.carrierCode);
                      obj[n.platformId].forEach((oItem, oIndex) => {
                        if (this.$common.isEmpty(oItem.platformSite)) {
                          oItem.platformSite = this.$common.isEmpty(codeInfo) ? '' : codeInfo.site || '';
                        }
                      });
                    }
                  });

                  v.$set(v.shippingParams, 'platformCarrierSettings', obj);
                }
                v.shippingParams.carrierParams = cpArr;
                if (cm.isPrintPickingList === 1) {
                  v.shippingParams.isPrintPickingList = 1;
                }
                v.shippingParams.shippingMethodId = cm.shippingMethodId;
                v.shippingData = data;
                v.showMarkShipping = true;
                v.$nextTick(function () {
                  v.shippingMethodSpinLoading = false;
                });
              }
            });
            v.getSettingList(v.saleAccountIdCopy).then(result => {
              if (result) {
                // 获取速卖通线上发货设置
                v.loading4 = false;
                if (data.carrierShippingMethodAccountAddressList && data.carrierShippingMethodAccountAddressList.length > 0) {
                  data.carrierShippingMethodAccountAddressList.forEach((n, i) => {
                    if (n.addressType === 'sender') {
                      v.$nextTick(() => {
                        v.sendAddress.addressValue = n.addressValue;
                      });
                      v.sendList.forEach((m, t) => {
                        if (m.addressId === n.addressValue) {
                          v.showSendList = m;
                        }
                      });
                    } else if (n.addressType === 'pickup') {
                      v.$nextTick(() => {
                        v.pickupAddress.addressValue = n.addressValue;
                      });

                      v.pickupList.forEach((m, t) => {
                        if (m.addressId === n.addressValue) {
                          v.showPickupList = m;
                          v.deliverType = n.type;
                          v.deliverTime = n.pickupTime;
                        }
                      });
                    } else if (n.addressType === 'refund') {
                      v.$nextTick(() => {
                        v.refundAddress.addressValue = n.addressValue;
                      });
                      v.refundList.forEach((m, t) => {
                        if (m.addressId === n.addressValue) {
                          v.showRefundList = m;
                        }
                      });
                    } else if (n.addressType === 'agent') {
                      let value = null;
                      v.agentList.forEach(i => {
                        if (i.name === n.name &&
                          i.street1 === n.street1 &&
                          i.mobile === n.mobile) {
                          value = i.carrierPlatformAccountAddressId;
                          v.agentAddress.name = i.name;
                          v.agentAddress.street1 = i.street1;
                          v.agentAddress.mobile = i.mobile;
                        }
                      });

                      if (value) {
                        v.$nextTick(() => {
                          v.agentAddress.addressValue = value;
                        });
                      }
                    }
                  });
                } else {
                  v.sendAddress.addressValue = '';
                  v.pickupAddress.addressValue = '';
                  v.refundAddress.addressValue = '';
                  v.agentAddress.addressValue = '';
                  v.agentAddress.name = '';
                  v.agentAddress.street1 = '';
                  v.agentAddress.mobile = '';
                  v.showSendList = [];
                  v.showPickupList = [];
                  v.showRefundList = [];
                }
              }
            });
          }
        }).catch(() => {
          v.loading4 = false;
          v.cannotSave = true;
        });
      } else {
        v.axios.get(api.get_carrierShippingMethod + id).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.logisticsChannelModalParams.carrierShippingMethod = data.carrierShippingMethod;
            v.handCountryData(data.countryLogisticsLimitList || []);
            v.modalData = data;
            v.logisticsChannelModalParams.carrierShippingMethod.carrierName = data.carrier.carrierName;
            if (data.baseDetail.acceptablePackageTypeList) {
              v.logisticsChannelModalParams.acceptablePackageTypeList = data.baseDetail.acceptablePackageTypeList.map(i => i.value);
            }
            let carrierShippingMethodPriceModel = data.carrierShippingMethodPriceModel;
            if (carrierShippingMethodPriceModel) {
              v.pricingParams.priceType = carrierShippingMethodPriceModel.priceType;
              v.freightDiscount = carrierShippingMethodPriceModel.freightDiscount;
              v.freightCurrency = carrierShippingMethodPriceModel.freightCurrency;
              v.freightDiscountType = carrierShippingMethodPriceModel.freightDiscountType;
              v.carrierShippingMethodPriceModelId = carrierShippingMethodPriceModel.carrierShippingMethodPriceModelId;
              if (carrierShippingMethodPriceModel.priceType === 3) {
                v.setCachePriceModelColumns(data.carrierShippingMethodPriceModelZoneList);
              }
              v.pricingParams.weightType = carrierShippingMethodPriceModel.weightType;
              if (carrierShippingMethodPriceModel.priceType === 3) { // 如果是分段续费，则去分段那里取计费方式
                v.pricingParams.subCostWay = data.carrierShippingMethodPriceModelZoneList[0].carrierShippingMethodSectionChargesList[0].priceType;
              }
            }
            for (let i = 0; i < data.carrierShippingMethodWarehouseList.length; i++) {
              let item = data.carrierShippingMethodWarehouseList[i];
              v.warehouseIdList.push(item.warehouseId);
            }
            v.carrierShippingMethodParmas = v.deepCopy(data.carrierShippingMethod);
            if (!v.$common.isEmpty(v.carrierShippingMethodParmas.skipLogistics) && v.carrierShippingMethodParmas.skipLogistics != 0) {
              v.logisticsChannelModalParams.skipLogistics = [Number(v.carrierShippingMethodParmas.skipLogistics)];
            } else {
              v.logisticsChannelModalParams.skipLogistics = [];
            }
            if (v.carrierShippingMethodParmas.arriveableType !== null && v.carrierShippingMethodParmas.arriveableType !== 0 && data.carrierShippingMethodPriceModelZoneList && data.carrierShippingMethodPriceModelZoneList.length > 0) {
              data.carrierShippingMethodPriceModelZoneList.forEach(i => {
                if (i.carrierShippingMethodPriceModelZoneCountryList) {
                  i.countryTwoCodeList = i.carrierShippingMethodPriceModelZoneCountryList.map(j => {
                    return j.twoCode;
                  });
                }
              });

              v.$nextTick(() => {
                let zoneList = data.carrierShippingMethodPriceModelZoneList;
                v.arriveableType = v.carrierShippingMethodParmas.arriveableType;

                v.data4 = zoneList;

                if (v.arriveableType === 1) {
                  v.data5 = zoneList;
                } else if (v.arriveableType === 2) {
                  v.data6 = zoneList; // 计费模型
                } else if (v.arriveableType === 3) {
                  v.data7 = zoneList; // 计费模型
                }
              });
            } else {
              v.arriveableType = 1;
              v.data4 = v.data5; // data5 为默认值
            }

            if (v.shopList.length === 0) { // 获取平台/帐号
              v.getShopList(1, api.carrierServiceCommon, null, true).then(result => {
                // v.setShopGroup(v.shopList, data.carrierShippingMethodPlatformList);
              });
            } else {
              // v.setShopGroup(v.shopList, data.carrierShippingMethodPlatformList);
            }
            v.cachePricingData = data.carrierShippingMethodPriceModelZoneList;
            // 获取各平台物流服务商
            v.makeCarrierCode().then(result => {
              if (result) {
                v.loading4 = false;
                let cm = data.carrierShippingMethod;
                v.systemShippingMethodId = cm.systemShippingMethodId;
                v.shippingMethodId = cm.shippingMethodId;
                let cp = data.carrierParams;
                let pcs = data.platformCarrierSettings;
                let cpArr = [];
                cp.forEach((n, i) => { // 整理初始化保存数据
                  if (n.paramValue === null) {
                    n.paramValue = '';
                  }
                  cpArr.push({
                    paramKey: n.paramKey,
                    paramValue: n.paramValue,
                    dataType: n.dataType
                  });
                });
                if (pcs.length > 0) {
                  var obj = v.deepCopy(v.shippingParams.platformCarrierSettings);
                  let platObj = {};// 判断选中平台
                  pcs.forEach((n, i) => {
                    if (!platObj.hasOwnProperty(n.platformId)) {
                      v.platformGroup.forEach((g, k) => {
                        if (g.platformId === n.platformId) {
                          v.platformGroup[k].checkboxStatus = true;
                        }
                      });
                      platObj[n.platformId] = 1;
                    }
                    if (n.platformId === null) {
                      n.platformId = 'ebay';
                    }
                    if (n.platformId === 'amazon' && n.carrierCode) {
                      if (this.$common.isUndefined(this.deliveryDataJson[n.platformId + '_' + n.carrierCode])) {
                        this.$set(this.deliveryDataJson, n.platformId + '_' + n.carrierCode, [n.shippingService]);
                      } else if (!this.deliveryDataJson[n.platformId + '_' + n.carrierCode].includes(n.shippingService)) {
                        this.deliveryDataJson[n.platformId + '_' + n.carrierCode].push(n.shippingService);
                      }
                      v.getDeliveryList(n.platformId, n.platformId + '_' + n.carrierCode, n.shippingService);
                    }
                    let addObj = {};
                    if ((typeof n.carrierType !== 'undefined' && this.$common.isEmpty(n.carrierType)) || [0, '0'].includes(n.carrierType)) {
                      addObj.carrierType = i > 0 ? !!Number(pcs[i].carrierType) : false;
                    } else if ([1, '1'].includes(n.carrierType)) {
                      addObj.carrierType = i > 0 ? !!Number(pcs[i].carrierType) : true;
                    }
                    if (['ebay'].includes(n.platformId)) {
                      if ((typeof n.syncFirst !== 'undefined' && this.$common.isEmpty(n.syncFirst)) || [0, '0'].includes(n.syncFirst)) {
                        addObj.syncFirst = i > 0 ? !!Number(pcs[i].syncFirst) : false;
                      } else if ([1, '1'].includes(n.syncFirst)) {
                        addObj.syncFirst = i > 0 ? !!Number(pcs[i].syncFirst) : true;
                      }
                    }
                    if (this.$common.isEmpty(n.carrierCode)) {
                      n.carrierCode = '';
                    }
                    if ((n.countryCode === null || n.countryCode === '') && obj.hasOwnProperty(n.platformId)) {
                      obj[n.platformId][0] = Object.assign(obj[n.platformId][0], { ...n, ...addObj });
                    } else if (n.countryCode !== null && n.countryCode !== '' && obj.hasOwnProperty(n.platformId)) {
                      let newSite = n.site;
                      if (this.$common.isEmpty(newSite)) {
                        const codeInfo = this.carrierCodeArr[n.platformId].find(f => f.valueCode == n.carrierCode);
                        newSite = this.$common.isEmpty(codeInfo) ? null : codeInfo.site || null;
                      }
                      obj[n.platformId].push({ // 整理参数
                        carrierCode: n.carrierCode,
                        countryCode: n.countryCode,
                        platformId: n.platformId === null ? 'ebay' : n.platformId,
                        trackingNumberType: n.trackingNumberType,
                        markDeliveryType: obj[n.platformId][0] ? obj[n.platformId][0].markDeliveryType || 0 : 0,
                        // carrierType: obj[n.platformId][0] ? obj[n.platformId][0].carrierType || false : false,
                        carrierType: addObj.carrierType,
                        deliveryCountryCode: n.deliveryCountryCode,
                        platformSite: newSite,
                        shippingService: n.shippingService,
                      });

                      if (['ebay'].includes(n.platformId)) {
                        // obj[n.platformId].syncFirst = obj[n.platformId][0] ? obj[n.platformId][0].syncFirst || false : false;
                        obj[n.platformId].syncFirst = addObj.syncFirst;
                      }
                    }
                    if (!this.$common.isEmpty(obj[n.platformId]) && !this.$common.isEmpty(n.carrierCode)) {
                      const codeInfo = this.carrierCodeArr[n.platformId].find(f => f.valueCode == n.carrierCode);
                      obj[n.platformId].forEach((oItem, oIndex) => {
                        if (this.$common.isEmpty(oItem.platformSite)) {
                          oItem.platformSite = this.$common.isEmpty(codeInfo) ? '' : codeInfo.site || '';
                        }
                      });
                    }
                    _setAllowCreateValue(n);
                  });
                  // 设置自定义属性值
                  function _setAllowCreateValue(n) {
                    if (v.carrierCodeArr[n.platformId].every(k => k.valueCode !== n.carrierCode)) {
                      v.carrierCodeArr[n.platformId].push({
                        valueCode: n.carrierCode,
                        valueCnName: n.carrierCode
                      });
                    }
                  }
                  v.$set(v.shippingParams, 'platformCarrierSettings', obj);
                }
                v.shippingParams.carrierParams = cpArr;
                if (cm.isPrintPickingList === 1) {
                  v.shippingParams.isPrintPickingList = 1;
                }
                v.shippingParams.shippingMethodId = cm.shippingMethodId;
                v.shippingData = data;
                v.showMarkShipping = true;
                v.$nextTick(function () {
                  v.shippingMethodSpinLoading = false;
                });
              }
            });
          }
        }).catch(() => {
          v.loading4 = false;
          v.cannotSave = true;
        })
      }
    },
    // 处理物流限制数据
    handCountryData (data = []) {
      this.countryLogisticsLimitKeys = [];
      let newData = {};
      let newKeys = [];
      const temporaryId = `temporary-${Number((Math.random()).toString().substring(2)).toString(32)}-${(new Date().getTime()).toString(32)}`;
      this.activeTemporaryId = temporaryId;
      newKeys.push(temporaryId); // 将所有国家的ID放到首位
      let allCountryData = {};
      if (this.$common.isEmpty(data)) {
        allCountryData.countryList = this.allCountryInfoList; // 选中国家信息
      } else {
        let itemId = '';
        allCountryData = data.find(f => f.isAllCountry == 1);
        if (this.$common.isEmpty(allCountryData)) {
          allCountryData.countryList = this.allCountryInfoList; // 选中国家信息
        }
        data.forEach(item => {
          if (item.isAllCountry != 1) {
            itemId = `temporary-${Number((Math.random()).toString().substring(2)).toString(32)}-${(new Date().getTime()).toString(32)}`;
            newData[itemId] = {
              ...(this.$common.copy(defaultAllCount)),
              ...item,
              temporaryId: itemId,
              acceptableType: (item.acceptableType || '01').split(','),
              countryNameTxt: item.countryList.map(m => m.cnName).join('、'),
            };
            newKeys.push(itemId);
          }
        });
      }
      allCountryData.countryNameTxt = '所有国家';
      allCountryData.temporaryId = temporaryId;
      allCountryData.acceptableType = (allCountryData.acceptableType || '01').split(',');
      allCountryData = { ...this.$common.copy(defaultAllCount), ...allCountryData };
      newData[temporaryId] = allCountryData;
      this.countryLogisticsLimitJson = newData;
      this.countryLogisticsLimitKeys = newKeys;
      this.getTabVisible();
    },
    // 判断是否显示国家 tab 左右按钮移动图标
    getTabVisible () {
      this.$nextTick(() => {
        const demo = document.querySelector('#countryTabContent');
        if (!demo) return;
        let allItemWidth = 0;
        let transform = 0;
        const childDemo = [...demo.querySelectorAll('.country-tab-item')];
        const parentNode = demo.parentNode;
        const boxWidth = parentNode.offsetWidth;
        childDemo.forEach(child => {
          allItemWidth += child.offsetWidth;
        });
        if (!this.$common.isEmpty(demo.style.transform)) {
          transform = Number(demo.style.transform.replace(/[^0-9|.]/g, ''));
        }
        this.leftVisible = transform > 0;
        this.rightVisible = allItemWidth > transform + boxWidth;
      })
    },
    // 切换国家 tab
    switchoverCountry (event, tabName) {
      let target = null;
      if (!this.$common.isEmpty(tabName)) {
        this.activeTemporaryId = tabName;
      }
      this.$nextTick(() => {
        if (!this.$common.isEmpty(event)) {
          target = event.target || event.srcElement;
        } else {
          target = document.querySelector('#countryTabContent .country-tab-item.active-country-tab');
        }
        if (!target) return;
        if (!target.className.includes('country-tab-item')) {
          target = target.parentNode;
        }
        const distance = target.offsetLeft + target.offsetWidth;
        const demo = document.querySelector('#countryTabContent');
        if (!demo) return;
        let transform = 0;
        const parentNode = demo.parentNode;
        const boxWidth = parentNode.offsetWidth;
        let allItemWidth = 0;
        const childDemo = [...demo.querySelectorAll('.country-tab-item')];
        childDemo.forEach(child => {
          allItemWidth += child.offsetWidth;
        });
        if (!this.$common.isEmpty(demo.style.transform)) {
          transform = Number(demo.style.transform.replace(/[^0-9|.]/g, ''));
        }
        if (transform > target.offsetLeft) {
          demo.style.transform = `translateX(-${target.offsetLeft}px)`;
        } else if (distance > transform + boxWidth || (transform > 0 && allItemWidth < transform + boxWidth)) {
          if (distance - boxWidth < 0) {
            demo.style.transform = `translateX(0px)`;
          } else {
            demo.style.transform = `translateX(-${distance - boxWidth}px)`;
          }
        }
        this.getTabVisible();
      })
    },
    // tab 横向位移
    moveTagCrosswiseAxle (direction) {
      const demo = document.querySelector('#countryTabContent');
      if (!demo) return;
      let distance = 0;
      const parentNode = demo.parentNode;
      let selfWidth = 0;
      const boxWidth = parentNode.offsetWidth;
      const childDemo = [...demo.querySelectorAll('.country-tab-item')];
      childDemo.forEach(child => {
        selfWidth += child.offsetWidth;
      });
      if (boxWidth > selfWidth) return;
      let transform = 0;
      if (!this.$common.isEmpty(demo.style.transform)) {
        transform = Number(demo.style.transform.replace(/[^0-9|.]/g, ''));
      }
      if (direction == 'right') {
        if (!this.rightVisible) return;
        if (selfWidth - ((2 * boxWidth) + transform) > 0) {
          distance = boxWidth + transform;
        } else {
          distance = selfWidth - boxWidth;
        }
        demo.style.transform = `translateX(${distance ? -distance : 0}px)`;
        this.getTabVisible();
      } else if (direction == 'left' && transform > 0) {
        if (!this.leftVisible) return;
        if (transform - boxWidth > 0) {
          distance = transform - boxWidth;
          demo.style.transform = `translateX(${-distance}px)`;
        } else {
          demo.style.transform = `translateX(0px)`;
        }
      }
      this.getTabVisible();
    },
    // 处理移除国家 tab 设置
    handleTabRemove (tabName) {
      this.$Modal.confirm({
        title: '操作提醒',
        content: `您确认删除 “${this.countryLogisticsLimitJson[tabName].countryNameTxt || ''}” 国家(地区)的物流限制？`,
        onOk: () => {
          delete this.countryLogisticsLimitJson[tabName];
          if (tabName == this.activeTemporaryId) {
            const rIndex = this.countryLogisticsLimitKeys.indexOf(this.activeTemporaryId);
            this.activeTemporaryId = rIndex > 0 ? this.countryLogisticsLimitKeys[rIndex - 1] : '';
          }
          this.countryLogisticsLimitKeys = this.countryLogisticsLimitKeys.filter(key => key != tabName);
          this.$nextTick(() => {
            this.switchoverCountry();
          });
        }
      });
    },
    // 打开设置国家弹窗
    openSetCountryModal (tabName) {
      let disableList = [];
      if (!this.$common.isEmpty(tabName)) {
        this.switchoverCountry(null, tabName);
      }
      Object.values(this.countryLogisticsLimitJson).forEach(item => {
        if (item.isAllCountry != 1 && (this.$common.isEmpty(tabName) || tabName != item.temporaryId)) {
          (item.countryList || []).forEach(cItem => {
            disableList.push(cItem.countryId);
          });
        }
      });
      this.countryModalData = {
        countryData: this.allCountryInfoData,
        key: tabName,
        data: this.$common.copy(this.countryLogisticsLimitJson[tabName]),
        disableId: disableList
      };
      this.$nextTick(() => {
        this.countryModalVisible = true;
      })
    },
    // 确定选中国家地区
    countryConfirm (res) {
      let temporaryId = res.key;
      let newRes = {};
      if (this.$common.isEmpty(temporaryId) || this.$common.isEmpty(this.countryLogisticsLimitJson[temporaryId])) {
        temporaryId = `temporary-${Number((Math.random()).toString().substring(2)).toString(32)}-${(new Date().getTime()).toString(32)}`;
        newRes = this.$common.copy(defaultAllCount);
        newRes.isAllCountry = 0;
        newRes.countryList = res.data; // 选中国家信息
        newRes.temporaryId = temporaryId;
        newRes.acceptableType = ['01'];
        newRes.countryNameTxt = res.data.map(m => m.cnName).join('、');
        this.activeTemporaryId = temporaryId;
        this.$set(this.countryLogisticsLimitJson, temporaryId, newRes);
        this.countryLogisticsLimitKeys.push(temporaryId);
        this.$nextTick(() => {
          this.switchoverCountry();
        });
      } else {
        newRes = this.countryLogisticsLimitJson[temporaryId];
        newRes.countryList = res.data; // 选中国家信息
        newRes.countryNameTxt = res.data.map(m => m.cnName).join('、');
      }
    },
    // 设置表格列
    setTableColumns(type) {
      let v = this;
      if (type === 1) {
        v.pricingModelColumns = v.pricingModelCommonColumns;
      } else if (type === 2) {
        v.getNewArr(v.pricingModelCommonColumns).then(arr => {
          arr.splice(2, 1, ...v.pricingModelContinuedHeavyColumns);
          v.pricingModelColumns = arr;
        });
      } else {
        v.getNewArr(v.pricingModelCommonColumns).then(arr => {
          arr.splice(2, 1, ...v.cachePriceModelColumns);
          v.pricingModelColumns = arr;
        });
      }
    },
    // 浅拷贝数组
    getNewArr(arr) {
      let newArr = [];
      return new Promise(resolve => {
        for (let i = 0; i < arr.length; i++) {
          let item = arr[i];
          newArr.push(item);
          if (i === arr.length - 1) {
            resolve(newArr);
          }
        }
      });
    },
    // 验证平台站点
    verifySite (formObj, key) {
      const valKey = key.split('.');
      const newValue = formObj[valKey[0]][valKey[1]][valKey[2]];
      return (rule, value, callback) => {
        this.$common.formItemVerify(rule, newValue, callback);
      }
    },
    // 站点值改变时
    psiteValChange (val, platformId, index, key) {
      this.$set(this.shippingParams.platformCarrierSettings[platformId][index], key, null);
    },
    // 获取物流服务商
    makeCarrierCode () {
      let v = this;
      return new Promise(resolve => {
        v.carrierCodeArr = Object.create(null);
        v.shippingParams.platformCarrierSettings = Object.create(null);
        if (v.platformGroup !== null && v.platformGroup.length > 0) {
          let arr = [];
          for (let k = 0; k < v.platformGroup.length; k++) {
            let platformItem = v.platformGroup[k];
            platformItem.checkboxStatus = false;
            v.carrierCodeArr[platformItem.platformId] = [];
            let obj = {
              parameterCode: platformItem.platformId,
              parameterName: 'carrierCode'
            };
            let requestType = 'post';
            let apiUrl = api.get_orderCommonParameter.replace(/^\./, '/setting-service');
            // tiktok无法连接通途表，另外做处理
            const tiktokFlag = platformItem.platformId === 'tiktok';
            const othetPlatform = extraPlatform[platformItem.platformId];
            if (tiktokFlag) {
              apiUrl = api.queryTiktokCarrier;
              requestType = 'get';
              obj = null;
            } else if (!this.$common.isEmpty(othetPlatform)) {
              // 其他无法连接通途表的平台，另外做处理
              apiUrl = othetPlatform.apiUrl;
              requestType = othetPlatform.requestType;
              obj = {};
              Object.keys(othetPlatform.dataKey).forEach(key => {
                if (othetPlatform.dataKey[key] == 'platformId') {
                  obj[key] = platformItem.platformId;
                }
              });
              obj = { ...obj, ...(othetPlatform.paramsData || {}) };
            }
            v.axios[requestType](apiUrl, JSON.stringify(obj)).then(response => {
              if (response.data.code === 0) {
                let list = [];
                if (tiktokFlag) {
                  list = (response.data.datas || []).map(k => {
                    return { ...k, valueCode: k.carrierId, valueCnName: k.carrierName };
                  });
                } else if (!this.$common.isEmpty(othetPlatform)) {
                  if (platformItem.platformId == 'temux') {
                    (response.data.datas || []).forEach(item => {
                      if (item.businessId == platformItem.platformId && !v.$common.isEmpty(item.paramValue)) {
                        try {
                          list = [
                            ...list,
                            ...v.$common.flat((v.$common.flat(Object.values(JSON.parse(item.paramValue))).map(m => {
                              return othetPlatform.resHand(m, v);
                            })))
                          ];
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    });
                  } else {
                    list = (response.data.datas || []).map(item => {
                      return othetPlatform.resHand(item, v);
                    });
                  }
                }
                v.$set(v.carrierCodeArr, platformItem.platformId, list);
                let platObj = {
                  carrierCode: '',
                  trackingNumberType: 0,
                  platformId: platformItem.platformId,
                  markDeliveryType: 0,
                  carrierType: false
                };
                if (['ebay'].includes(platformItem.platformId)) {
                  platObj.syncFirst = false;
                }
                v.$set(v.shippingParams.platformCarrierSettings, platformItem.platformId, [platObj]);
              }
              arr.push(1);
              // 执行完
              if (arr.length === v.platformGroup.length) {
                resolve(true);
              }
            }).catch(() => {
              arr.push(1);
              // 执行完
              if (arr.length === v.platformGroup.length) {
                resolve(true);
              }
            });
          }
        } else {
          resolve(true);
        }
      });
    },
    // 获取设置/编辑/新增自定义物流渠道弹窗的表单参数
    handleSubmit(name) {
      let v = this;
      let result = true;
      v.$refs[name].validate(function (valid) {
        if (valid) {
          result = true;
        } else {
          result = false;
        }
      });
      return result;
    },
    // 重置弹窗数据
    resetShippingData() {
      let v = this;
      v.shippingLoading = false;
      v.$nextTick(function () {
        v.shippingLoading = true;
      });
      v.closeModal();
    },
    // 获取所有平台的数据
    makePlatformGroup() {
      return new Promise((resolve) => {
        let platformGroup = this.$store.state.platformGroup;
        if (platformGroup === null) {
          this.getPlatformGroup().then(result => {
            if (result) {
              this.$emit('changPlatformGroup', this.$store.state.platformGroup);
            }
            resolve({ state: 'finally' });
          }).catch(() => {
            resolve({ state: 'finally' });
          });
        } else {
          this.$emit('changPlatformGroup', platformGroup);
          resolve({ state: 'finally' });
        }
      })
    },
    // 设置店铺的数据
    setShopGroup(shopList, openList) { // 加载适用平台帐号列表
      let v = this;
      let obj = {};
      let arrObj = {
        title: '全部',
        expand: true,
        children: []
      };
      let platformGroup = v.$store.state.platformGroup;
      if (platformGroup && platformGroup.length > 0) {
        function makePlatformGroup() { // 读可用平台列表
          return new Promise(resolve => {
            for (let i = 0; i < platformGroup.length; i++) {
              if (!obj.hasOwnProperty(platformGroup[i].platformId)) {
                arrObj.children.push({
                  title: platformGroup[i].platformId,
                  saleAccountId: null,
                  expand: true,
                  children: []
                });
                obj[platformGroup[i].platformId] = arrObj.children.length - 1;
              }
              if (i === platformGroup.length - 1) {
                resolve(true);
              }
            }
          });
        }

        function makeRangeShopList() { // 适用平台帐号
          return new Promise(resolve => {
            for (let t = 0; t < shopList.length; t++) {
              let item = shopList[t];
              if (obj.hasOwnProperty(item.platformId) && openList && openList.length > 0) {
                arrObj.children[obj[item.platformId]].children = [];
                for (let i = 0; i < openList.length; i++) {
                  let sItem = openList[i];
                  let subItem = {
                    title: item.account,
                    saleAccountId: item.saleAccountId,
                    checked: (sItem.saleAccountId === item.saleAccountId && sItem.platformId === item.platformId) || (sItem.saleAccountId === null && sItem.platformId === item.platformId) || false,
                    platformId: item.platformId,
                    expand: false,
                    children: []
                  };
                  if (sItem.saleAccountId === null) {
                    arrObj.children.forEach((p, g) => {
                      if (p.title === sItem.platformId) {
                        p.checked = true;
                      }
                    });
                  }
                  if (sItem.platformId === item.platformId) {
                    arrObj.children[obj[item.platformId]].children.push(subItem);
                  }

                  if (t === shopList.length - 1) resolve(true);
                }
              } else if (obj.hasOwnProperty(item.platformId) && openList && openList.length === 0) {
                let subItem = {
                  title: item.account,
                  saleAccountId: item.saleAccountId,
                  checked: false,
                  platformId: item.platformId,
                  expand: false,
                  children: []
                };
                arrObj.children[obj[item.platformId]].children.push(subItem);
                if (t === shopList.length - 1) resolve(true);
              } else {
                resolve(true);
              }
            }
          });
        }

        function setShopAccount() {
          v.shopAccount = [arrObj];
        }

        async function getStartMakeShop() {
          const result = await makePlatformGroup();
          if (result) {
            const mslResult = await makeRangeShopList();
            if (mslResult) {
              await setShopAccount();
              /* v.$nextTick(function () {
               let selectNodes = this.$refs['shopAccountTree'].getCheckedNodes();
               v.$refs['shopAccountTree'].treeSelectGetValue(selectNodes);
               }); */
            }
          }
        }

        getStartMakeShop();
      }
    },
    // 设置计费模型编辑弹窗的表格
    setCachePriceModelColumns(cData) {
      let v = this;
      v.cachePriceModelColumns = [];
      for (let i = 0; i < cData[0].carrierShippingMethodSectionChargesList.length; i++) {
        let item = cData[0].carrierShippingMethodSectionChargesList[i];
        let culumnItem = {
          align: 'center',
          minWidth: 230,
          renderHeader: (h, col) => {
            return h('div', [
              h('span', item.startWeight), h('span', {
                style: {
                  margin: '0 3px'
                }
              }, '-'), h('span', item.endWeight), h('span', {
                style: {
                  margin: '0 3px'
                }
              }, 'g')
            ]);
          },
          render: (h, params) => {
            if (item.priceType === 3) { // 编辑状态下，priceType等于3时返回结果
              return h('div', {
                style: {
                  padding: '8px 0'
                }
              }, [
                h('div', {
                  class: 'flexBox'
                }, [
                  h('span', {
                    style: {
                      color: 'red',
                      marginRight: '5px',
                      position: 'relative',
                      top: '8px'
                    }
                  }, '*'),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-right': '5px'
                    }
                  }, '首重'),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-right': '5px'
                    }
                  }, v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].firstWeight),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin': '0 5px'
                    }
                  }, 'g'),
                  h('InputNumber', {
                    props: {
                      value: v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].firstWeightPrice,
                      min: 0,
                      size: 'small'
                    },
                    style: {
                      width: '60px',
                      marginTop: '3px'
                    },
                    on: {
                      'input': (val) => {
                        v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].firstWeightPrice = val;
                      }
                    }
                  }),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-left': '5px'
                    }
                  }, '元')
                ]), h('div', {
                  class: 'flexBox normalTop flexBoxJustContent'
                }, [
                  h('span', '折扣价' + '：'), h('span', {
                    class: 'redColor'
                  }, Math.round((v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].firstWeightPrice * (v.freightDiscount === null
                    ? 100
                    : v.freightDiscount) / 100) * 100) / 100)
                ]), h('div', {
                  class: 'flexBox normalTop'
                }, [
                  h('span', {
                    style: {
                      color: 'red',
                      marginRight: '5px',
                      position: 'relative',
                      top: '8px'
                    }
                  }, '*'),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-right': '5px'
                    }
                  }, '续重'),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-right': '5px'
                    }
                  }, v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].unitWeight),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin': '0 5px'
                    }
                  }, 'g'),
                  h('InputNumber', {
                    props: {
                      value: v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].unitWeightPrice,
                      min: 0,
                      size: 'small'
                    },
                    style: {
                      width: '60px',
                      marginTop: '3px'
                    },
                    on: {
                      'input': (val) => {
                        v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].unitWeightPrice = val;
                        // v.cachePricingData[params.index].priceModelExtendList[i].unitWeightPrice = val;
                      }
                    }
                  }),
                  h('span', {
                    style: {
                      position: 'relative',
                      top: '6px',
                      'margin-left': '5px'
                    }
                  }, '元')
                ]), h('div', {
                  class: 'flexBox normalTop flexBoxJustContent'
                }, [
                  h('span', '折扣价' + '：'), h('span', {
                    class: 'redColor'
                  }, Math.round((v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].unitWeightPrice * (v.freightDiscount === null
                    ? 100
                    : v.freightDiscount) / 100) * 100) / 100)
                ])
              ]);
            } else if (item.priceType === 2) { // 编辑状态下，priceType等于2时返回结果
              return h('div', [
                h('span', {
                  style: {
                    color: 'red',
                    marginRight: '5px',
                    position: 'relative',
                    top: '5px'
                  }
                }, '*'), h('InputNumber', {
                  props: {
                    value: v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price,
                    min: 0
                  },
                  style: {
                    width: '80%'
                  },
                  on: {
                    'input': (val) => {
                      v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price = val;
                    }
                  }
                }), h('div', {
                  class: 'flexBox normalTop flexBoxJustContent'
                }, [
                  h('span', '折扣价' + '：'), h('span', {
                    class: 'redColor'
                  }, Math.round((v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price * (v.freightDiscount === null
                    ? 100
                    : v.freightDiscount) / 100) * 100) / 100)
                ])
              ]);
            } else if (item.priceType === 1) { // 编辑状态下，priceType等于1时返回结果
              return h('div', {
                class: 'flexBox'
              }, [
                h('span', {
                  style: {
                    color: 'red',
                    marginRight: '5px',
                    position: 'relative',
                    top: '10px'
                  }
                }, '*'), h('InputNumber', {
                  props: {
                    value: v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price,
                    min: 0
                  },
                  style: {
                    width: '75%'
                  },
                  on: {
                    'input': (val) => {
                      v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price = val;
                      // v.cachePricingData[params.index].priceModelExtendList[i].price = val;
                    }
                  }
                }), h('span', {
                  style: {
                    position: 'relative',
                    top: '6px',
                    'margin-left': '5px'
                  }
                }, '元' + '/g'), h('div', {
                  class: 'flexBox normalTop flexBoxJustContent'
                }, [
                  h('span', '折扣价' + '：'), h('span', {
                    class: 'redColor'
                  }, Math.round((v.cachePricingData[params.index].carrierShippingMethodSectionChargesList[i].price * (v.freightDiscount === null
                    ? 100
                    : v.freightDiscount) / 100) * 100) / 100)
                ])
              ]);
            }
          }
        };
        v.cachePriceModelColumns.push(culumnItem);
      }
    },
    setColumns(newVal) {
      let self = this;
      let commonColumns = [
        {
          key: 'startWeight',
          renderHeader(h, params) {
            return h('span', { class: 'redDot' }, '起始重量' + '>（g）');
          },
          width: 120,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.startWeight,
                disabled: params.index !== 0 || self.logisticsSetView,
                min: 0
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].startWeight = val;
                }
              }
            });
          }
        },
        {
          renderHeader(h, params) {
            return h('span', { class: 'redDot' }, '截止重量' + '<=（g）');
          },
          key: 'endWeight',
          width: 140,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.endWeight,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].endWeight = val;
                  if (self.cacheEditPriceModalData[params.index + 1]) {
                    self.cacheEditPriceModalData[params.index + 1].startWeight = val;
                  }
                }
              }
            });
          }
        },
        {
          title: '挂号费',
          key: 'registrationFee',
          minWidth: 140,
          align: 'center',
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'mr5' }, '挂号费'),
              this.setColIdentical(h, 'registrationFee', self.cacheEditPriceModalData, column)
            ]);
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.registrationFee,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].registrationFee = val;
                }
              }
            });
          }
        },
        {
          title: '操作费',
          key: 'operatingCost',
          minWidth: 140,
          align: 'center',
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'mr5' }, '操作费'),
              this.setColIdentical(h, 'operatingCost', self.cacheEditPriceModalData, column)
            ]);
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.operatingCost,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].operatingCost = val;
                }
              }
            });
          }
        },
        {
          title: '附加费（%）',
          key: 'additionalFeeRate',
          minWidth: 140,
          align: 'center',
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'mr5' }, '附加费（%）'),
              this.setColIdentical(h, 'additionalFeeRate', self.cacheEditPriceModalData, column)
            ]);
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.additionalFeeRate,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].additionalFeeRate = val;
                }
              }
            });
          }
        },
        {
          title: '操作',
          key: 'operation',
          minWidth: 100,
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'error',
                size: 'small',
                disabled: self.logisticsSetView
              },
              on: {
                'click'() {
                  if (self.editPriceModalData[params.index + 1] && self.editPriceModalData[params.index - 1]) {
                    self.$set(self.editPriceModalData[params.index + 1], 'startWeight', self.editPriceModalData[params.index - 1].endWeight);
                  }
                  self.editPriceModalData.splice(params.index, 1);
                }
              }
            }, '删除');
          }
        }
      ];
      if (newVal === 1) {
        commonColumns.splice(2, 0, {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '价格'),
              this.setColIdentical(h, 'price', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'price',
          minWidth: 160,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.price,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].price = val;
                }
              }
            });
          }
        });
      } else if (newVal === 2) {
        commonColumns.splice(2, 0, {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '首重（g）'),
              this.setColIdentical(h, 'firstWeight', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'firstWeight',
          minWidth: 160,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.firstWeight,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].firstWeight = val;
                }
              }
            });
          }
        },
        {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '首重运费（元）'),
              this.setColIdentical(h, 'firstWeightPrice', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'firstWeightPrice',
          minWidth: 180,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.firstWeightPrice,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].firstWeightPrice = val;
                }
              }
            });
          }
        },
        {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '续重单位重量（g）'),
              this.setColIdentical(h, 'unitWeight', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'unitWeight',
          minWidth: 190,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.unitWeight,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].unitWeight = val;
                }
              }
            });
          }
        },
        {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '续重单价（元）'),
              this.setColIdentical(h, 'unitWeightPrice', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'unitWeightPrice',
          minWidth: 180,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.unitWeightPrice,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].unitWeightPrice = val;
                }
              }
            });
          }
        });
      } else {
        commonColumns.splice(2, 0, {
          renderHeader: (h, { column }) => {
            return h('div', {}, [
              h('span', { class: 'redDot mr5' }, '价格'),
              this.setColIdentical(h, 'price', self.cacheEditPriceModalData, column)
            ]);
          },
          key: 'price',
          minWidth: 160,
          align: 'center',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: params.row.price,
                min: 0,
                disabled: self.logisticsSetView
              },
              on: {
                'input': (val) => {
                  self.cacheEditPriceModalData[params.index].price = val;
                }
              }
            });
          }
        });
      }
      this.freightTest = 0;
      this.editPriceModalColumns = commonColumns;
    },
    // 列表头部新增设置一键相同
    setColIdentical (h, colKey, tableData = [], config = {}) {
      if (this.$common.isEmpty(config.checkIdentical) || !this.$common.isBoolean(config.checkIdentical)) {
        this.$set(config, 'checkIdentical', false);
      }
      return h('Checkbox', {
        style: {},
        props: {
          value: config.checkIdentical,
          disabled: this.logisticsSetView
        },
        on: {
          'on-change': (value) => {
            if (this.$common.isEmpty(tableData)) return;
            const fRow = tableData[0];
            tableData.forEach((row, index) => {
              this.$set(tableData[index], colKey, fRow[colKey]);
            });
          }
        }
      }, '')
    },
    // 获取速卖通线上发货设置信息
    getSettingList(id) {
      let v = this;
      return new Promise(resolve => {
        let sendList = []; // 发货地址
        let pickupList = []; // 揽收地址
        let refundList = []; // 退件地址
        let agent = []; // 代理人
        v.axios.get(api.get_carrierAliexpressAddress + '?saleAccountId=' + id).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            data.forEach((m, t) => {
              if (m.addressType === 'sender') { // 发货
                sendList.push(m);
              } else if (m.addressType === 'pickup') { // 揽收
                pickupList.push(m);
              } else if (m.addressType === 'refund') { // 退件
                refundList.push(m);
              } else if (m.addressType === 'agent') { // 代理人
                agent.push(m);
              }
            });
            v.sendList = sendList;
            v.pickupList = pickupList;
            v.refundList = refundList;
            v.agentList = agent;
            resolve(true);
          }
        });
      });
    },
    // 获取从其他渠道引用的物流商数据
    GetQuotingLogisticsData() {
      this.selectProviderList = [];
      this.axios.get(api.get_enableCarriers).then((res) => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data.length > 0) {
            data.map((item) => {
              this.selectProviderList.push({
                id: item.carrierId,
                name: item.carrierName
              });
            });
          }
        }
      });
    },
    // 获取对应物流商的物流渠道
    ChangeSelectProvider(val) {
      this.logisticsChannelList = [];
      if (val) {
        this.axios.get(api.get_enableShippingMethodsApi + '?carrierId=' + val).then((res) => {
          if (res.data.code === 0) {
            this.logisticsChannelList = (res.data.datas || []).map((item) => {
              return {
                id: item.shippingMethodId,
                arriveableType: item.arriveableType,
                name: item.carrierShippingMethodName
              }
            })
          }
        });
      }
    },
    // 获取选取其他渠道对应的派送范围
    ChangeLogisticsChannel(id) {
      if (this.logisticsChannelList.length > 0) {
        this.logisticsChannelList.forEach((item) => {
          if (item.id === id) {
            this.selectType = item.arriveableType;
          }
        });
      }
    },
    // 引用其他物流渠道的确定按钮
    saveChannel() {
      if (this.logisticsChannel !== null) {
        this.axios.get(api.get_carrierShippingMethodPrice + '?shippingMethodId=' + this.logisticsChannel).then((res) => {
          if (res.data.code === 0) {
            this.channelModal = false;
            this.arriveableType = this.selectType;
            let data = res.data.datas.carrierShippingMethodPriceModelZones;
            data.forEach(i => {
              i.carrierShippingMethodPriceModelId = this.carrierShippingMethodPriceModelId;
              if (i.carrierShippingMethodPriceModelZoneCountryList) {
                i.countryTwoCodeList = i.carrierShippingMethodPriceModelZoneCountryList.map(j => {
                  return j.twoCode;
                });
              }
            });
            this.data4 = [];
            if (this.arriveableType === 1) {
              this.data5 = data;
              this.data4 = JSON.parse(JSON.stringify(this.data5));
            } else if (this.arriveableType === 2) {
              this.data6 = data;
              this.data4 = JSON.parse(JSON.stringify(this.data6));
            } else if (this.arriveableType === 3) {
              this.data7 = data;
              this.data4 = JSON.parse(JSON.stringify(this.data7));
            }
          }
        });
      } else {
        this.$Message.error('物流渠道名称不能为空');
        return false;
      }
    },
    // 失去焦点时判断
    blurChange (blurKey) {
      if (this.$common.isEmpty(this.countryLogisticsLimitJson[this.activeTemporaryId][blurKey])) {
        this.countryLogisticsLimitJson[this.activeTemporaryId][blurKey] = 0;
      }
    },
    // 自定义配送服务
    handleCreateDelivery(value, pIdCarrierCode) {
      let newList = [];
      if (this.amazonDeliveryList.length > 0) {
        newList = JSON.parse(JSON.stringify(this.amazonDeliveryList));
      }
      if (value) {
        let exists = newList.some((item) => {
          return item.valueCode === value;
        });
        if (!exists) {
          newList.push({
            valueCode: value,
            valueCnName: value
          });
          this.amazonDeliveryList = newList;
          if (this.$common.isUndefined(this.deliveryDataJson[pIdCarrierCode])) {
            this.$set(this.deliveryDataJson, pIdCarrierCode, [value]);
          } else if (!this.deliveryDataJson[pIdCarrierCode].includes(value)) {
            this.deliveryDataJson[pIdCarrierCode].push(value);
          }
        } else {
          this.$Message.warning('不能添加相同名称的配送服务！');
          return false;
        }
      }
    }
  },
  watch: {
    arriveableType: {
      handler(newVal) {
        this.data4 = [];
        if (newVal === 1) {
          this.data4 = JSON.parse(JSON.stringify(this.data5));
        } else if (newVal === 2) {
          this.data4 = JSON.parse(JSON.stringify(this.data6));
        } else if (newVal === 3) {
          this.data4 = JSON.parse(JSON.stringify(this.data7));
        }
      },
      deep: true,
      immediate: true
    },
    setShippingMethodModelStatus: {
      deep: true,
      immediate: true,
      handler (data) {
        this.setShippingModel = data;
        if (data) {
          this.initPageData().finally(() => {
            this.$nextTick(() => {
              if (this.NewCustomLogistics) {
                this.pageInitLoading = true;
                this.data4 = JSON.parse(JSON.stringify(this.data5));
                this.warehouseIdList = [];
                this.getStore(1);// 获取仓库列表
                this.getProductTagList(api.carrierServiceCommon);// 获取标签列表名称
                this.setShopGroup(this.shopList, []);
                this.logisticsChannelModalParams.carrierShippingMethod.carrierName = this.formInline.carrierName;
                this.logisticsChannelModalParams.carrierShippingMethod.logisType = 1;
                this.makeCarrierCode().finally(() => {
                  // 新增自定义时，默认所有国家
                  this.handCountryData([]);
                  this.pageInitLoading = false;
                });
              } else {
                if (this.showShippingSettingId != null && this.openType === 'ship') {
                  this.showShippingSetting(this.showShippingSettingId);
                } else {
                  this.pageInitLoading = true;
                  this.makeCarrierCode().finally(() => {
                  // 新增自定义时，默认所有国家
                    this.handCountryData([]);
                    this.pageInitLoading = false;
                  });
                }
              }
            })
          })
        }
      }
    },
    setShippingModel(val) {
      if (val) {
        this.downLoading = false;
        this.logisticsLimitExport = false;
        this.restrictionModalVisible = false;
        this.importRestrictionLoading = false;
      }
      !val && this.$emit('changeNewCustomLogistics', false);
      this.$emit('changeOpenType', 'ship');
      this.$emit('changeStatus', val);
    },
    'pricingParams.priceType': {
      handler(n, o) {
        if (n !== o) {
          this.setTableColumns(n);
        }
      }
    },

    // 监听计费模型编辑弹窗--的计费方式
    'pricingQuantityMode.priceType': {
      handler: 'setColumns',
      immediate: true
    },
    editPriceModal: {
      deep: true,
      handler (val) {
        if (val) return this.setColumns(this.pricingQuantityMode.priceType);
        this.$nextTick(() => {
          this.editPriceModalColumns = [];
        })
      }
    }
  }
};
</script>

<style lang="less" scoped>
.modalItem {
  margin: 0 0 15px 0 !important;
}

.table-order-item {
  display: flex;
  justify-content: space-between;
}

.select_country_checkbox {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}
.flex-center-between{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modalItemBox {
  min-height: 26px;
  &:last-child{
    border-bottom: none;
  }
}
.modalItemHeader {
  height: auto;
  min-height: 32px;
  .title-h6{
    padding: 0 10px;
    line-height: 32px;
  }
}
.country-operate-btn {
  padding: 5px 10px;
}
.country-tab-module{
  position: relative;
  display: flex;
  border-bottom: 1px solid #ccc;
  align-items: center;
  .move-left{
    display: inline-block;
    padding: 5px;
    transform: rotate(180deg);
    cursor: pointer;
    font-size: 16px;
    &:hover{
      color: #2d8cf0;
    }
  }
  .move-right{
    display: inline-block;
    padding: 5px;
    cursor: pointer;
    font-size: 16px;
    &:hover{
      color: #2d8cf0;
    }
  }
  .disabled-move{
    cursor: no-drop;
    color: #aaa;
    &:hover{
      color: #aaa;
    }
  }
  .country-tab-box{
    display: flex;
    flex: 100;
    align-items: center;
    max-width: calc(100% - 52px);
    overflow: hidden;
    .add-country-item{
      margin-left: 5px;
      cursor: pointer;
      &:hover{
        color: #2d8cf0;
      }
      i {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
  .country-tab-content{
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    .move-box{
      transition: 0.2s;
    }
    .country-tab-item{
      display: inline-block;
      border-top: 1px solid #ccc;
      border-right: 1px solid #ccc;
      cursor: pointer;
      .country-tab-txt{
        display: inline-block;
        padding: 5px 10px;
      }
      .country-tab-set{
        display: inline-block;
        padding: 3px 0;
        font-size: 16px;
        &:hover{
          color: #0dff00;
        }
      }
      .country-tab-remove{
        display: inline-block;
        padding: 3px;
        font-size: 16px;
        &:hover{
          color: #f20;
        }
      }
      &:first-child{
        border-left: 1px solid #ccc;
      }
      &.active-country-tab{
        background: #2d8cf0;
        color: #fff;
        border-color: #2d8cf0;
      }
    }
  }
}
.country-tab-view{
  display: flex;
  flex-flow: wrap;
  .flex-item{
    margin-top: 10px;
    padding: 0 5px;
    width: 50%;
    &.flex-full-item {
      width: 100%;
    }
  }
}
.special-case-country{
  margin-left: 10px;
  margin-bottom: 10px;
}
</style>
