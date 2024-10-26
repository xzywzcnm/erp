<template>
  <!-- 发货包裹 -->
  <div
    class="modalItem consignment-package"
    v-if="orderInfo.orderStatus !== 0 && orderShippingInfoList !== null && orderShippingInfoList.length > 0"
  >
    <div class="modalItemHeader flexBox">
      <div class="main-label">
        发货包裹
        <Icon style="padding: 0 5px; font-size: 16px; font-weight: bold;" :title="switchTalg ? '全部收起' : '全部展开'"
          v-if="orderShippingInfoList.length >= 2" :type="`${switchTalg ? 'ios-arrow-up' : 'ios-arrow-down'}`"
          @click="switchChange" />
      </div>
    </div>
    <Collapse class="package-collapse" simple v-model="packageCodeList" @on-change="changeCollapse">
      <div class="mb5 flexBox flex-items-center">
        <div class="cursor flexBox">
          <div title="跳到订单检索页面" style="margin: 0px 10px 5px 0;" v-if="isGoToOrderPage" @click="openOrderToRetrieve">修改包裹信息</div>
          <template v-if="orderInfo.isInvalid !== 1">
            <div
              v-if="showResetorderBtn"
              @click="resetorderShippingInfoList" style="margin: 0px 10px 5px 0;">
              <Icon type="ios-loop-strong" style="margin:0 5px"></Icon>
              <span class="pointer-font">重置包裹</span>
            </div>
            <!--isShowAddPackage 只要还有一个包裹未完成就为true-->
            <div v-if="addPackageShow" @click="addNewPackage" style="margin: 0px 10px 5px 0;">
              <Icon type="android-add" style="margin:0 5px"></Icon>
              <span class="pointer-font">添加包裹</span>
            </div>
            <div
              v-if="hasEdit && getPermission('orderInfo_moveFromPackage') && samePackageOtherOrderInfos !== null && orderInfo.orderStatus !== 7"
              style="line-height:18px; margin: 0px 10px 5px 0;" @click="separateDelivery">
              <span class="icon iconfont icon-fengexian fl" style="margin-right:5px"></span>单独发货
            </div>
          </template>
        </div>
        <div class="ml10 flexBox flex-items-center" v-if="!$common.isEmpty(voidShippingInfo)">
          <span>显示已作废包裹</span>
          <i-switch class="ml5" v-model="visibleVoidPackage" />
        </div>
      </div>
      <template v-for="(pItem, index) in orderShippingInfoList">
        <Panel v-if="pItem.packageStatus != 99" class="delivery_package_box_item" :name="pItem.packageCode" :key="`package-${index}`">
          <div class="package_box" @click.stop>
            <div class="left_box">
              <span style="color:#666;">
                出库单号:
                <span style="color: #2184ed">{{ pItem.packageCode }}</span>
              </span>
              <Icon style="margin-left: 5px;cursor: pointer;" type="ios-copy-outline"
                @click.native="CopyContentBtn(pItem.packageCode)" />
              <span v-if="splitPackageShow && pItem.addPackageTalg && !pItem.despatchTime"
                @click="addNewPackage(pItem, index, (platformId || []).join(','))"
                class="pointer-font ml5">
                添加包裹
              </span>
              <span class="package-status">
                包裹状态:
                <span style="color: #19BE6B" v-if="pItem.warehouseType == '1'">
                  {{ threeCurrentTxt[getThreeCurrent(orderShippingInfoList, index)] ? threeCurrentTxt[getThreeCurrent(orderShippingInfoList, index)].txt : '' }}
                </span>
                <span style="color: #19BE6B" v-else-if="pItem.isYms == '1'">
                  {{ ymsCurrentTxt[getCurrent(orderShippingInfoList, index)] ? ymsCurrentTxt[getCurrent(orderShippingInfoList, index)].txt : '' }}
                </span>
                <span v-else style="color: #19BE6B">
                  <template v-if="getTimeMt(pItem.getLabelTime, pItem.pickingTime)">
                    <span v-if="stepsCurrent[`${getCurrent(orderShippingInfoList, index)}-${getTimeMt(pItem.getLabelTime, pItem.pickingTime)}`]">
                      <template v-if="getCurrent(orderShippingInfoList, index) == 2">
                        {{ getPickingTitle(pItem) }}
                      </template>
                      <template v-else>
                        {{ stepsCurrent[`${getCurrent(orderShippingInfoList, index)}-${getTimeMt(pItem.getLabelTime, pItem.pickingTime)}`].txt }}
                      </template>
                    </span>
                  </template>
                  <template v-else>
                    <span v-if="getCurrent(orderShippingInfoList, index) == 1">
                      {{ getPickingTitle(pItem) }}
                    </span>
                    <span v-else>
                      {{ stepsCurrent[getCurrent(orderShippingInfoList, index)] ? stepsCurrent[getCurrent(orderShippingInfoList, index, pItem.getLabelTime,
                        pItem.pickingTime)].txt : '' }}
                    </span>
                  </template>
                </span>
              </span>
            </div>
            <div class="orderProcess" :class="{ processHeight: getCurrent(orderShippingInfoList, index) < 0 }">
              <!--第三方仓-->
              <Steps :current="getThreeCurrent(orderShippingInfoList, index)" v-if="pItem.warehouseType == '1'"
                :status="pItem.carrierPackageStatus === 'INV_ERROR' ? 'error' : 'process'">
                <Step :content="getStepTime(pItem.packageCreatedTime)" title="已创建" icon="md-cart"></Step>
                <Step title="已下发物流" icon="md-cash">
                  <div slot="content">
                    <template v-if="pItem.trackingNumberTime">{{ getStepTime(pItem.trackingNumberTime) }}</template>
                    <template v-else-if="pItem.wmsOrderFailReasonOrder">
                      <Tooltip
                        :content="pItem.carrierPackageStatus === 'INV_ERROR' ? orderDetailsData.wmsOrderFailReasons[index].carrierSendFailReason : getLogistingContent(pItem, 2)"
                        :transfer="true">
                        <div class="failresonSty" v-if="pItem.carrierPackageStatus !== 'INV_ERROR'">
                          {{ getLogistingContent(pItem, 1) }}
                        </div>
                        <div class="failresonSty" v-else>
                          {{ orderDetailsData.wmsOrderFailReasons[index].carrierSendFailReason }}
                        </div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step v-if="pItem.carrierPackageStatus !== 'INV_ERROR'" :content="getStepTime(pItem.despatchTime)"
                  title="已发货" icon="md-car"></Step>
                <Step v-else title="配货异常" icon="md-close-circle"></Step>
              </Steps>
              <Steps :current="getCurrent(orderShippingInfoList, index)" v-else>
                <Step :content="getStepTime(pItem.packageCreatedTime)" title="已创建" icon="md-add-circle"></Step>
                <Step :title="getPickingTitle(pItem)" icon="md-filing"
                  v-if="!getTimeMt(pItem.getLabelTime, pItem.pickingTime) && (pItem.isYms != 1)">
                  <div slot="content">
                    {{ getPickingContent(pItem) }}
                  </div>
                </Step>
                <Step title="已下发物流" :icon="pItem.isYms == 1 ? 'md-filing' : 'md-cloud-upload'">
                  <div slot="content">
                    <template v-if="pItem.getLabelTime">{{ getStepTime(pItem.getLabelTime) }}</template>
                    <template v-else-if="pItem.wmsOrderFailReasonOrder">
                      <Tooltip :content="getLogistingContent(pItem, 2)" :transfer="true">
                        <div class="failresonSty">
                          {{ getLogistingContent(pItem, 1) }}
                        </div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step :title="getPickingTitle(pItem)" icon="md-filing" v-if="getTimeMt(pItem.getLabelTime, pItem.pickingTime) && (pItem.isYms != 1)">
                  <div slot="content">
                    {{ getPickingContent(pItem) }}
                  </div>
                </Step>
                <Step title="已下发云仓" icon="md-cloud-upload" v-if="pItem.isYms == 1">
                  <div slot="content">
                    <template v-if="pItem.ymsSyncTime">{{ getStepTime(pItem.ymsSyncTime) }}</template>
                    <template v-else-if="pItem.ymsPkgCreateFailReason">
                      <Tooltip :content="pItem.ymsPkgCreateFailReason" :transfer="true">
                        <div class="failresonSty">{{ pItem.ymsPkgCreateFailReason }}</div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step
                  title="已下发云仓异常"
                  icon="md-alert"
                  v-if="pItem.isYms == 1 && !$common.isEmpty(pItem.wmsOrderFailReasonOrder) && !$common.isEmpty(pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg)"
                >
                  <div slot="content">
                    <Tooltip :content="pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg" :transfer="true">
                      <div class="failresonSty">
                        {{ pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg.substring(0, 30) }}
                      </div>
                    </Tooltip>
                  </div>
                </Step>
                <Step :content="getStepTime(pItem.pickingGoodsTime)" title="已拣货" icon="md-hand"></Step>
                <Step :content="getStepTime(pItem.printTime)" title="已打印" icon="md-print"></Step>
                <Step title="" icon="md-alert" v-if="!$common.isEmpty(pItem.distributionLogisticsMsg)">
                  <div slot="content">
                    <Tooltip :content="pItem.distributionLogisticsMsg" :transfer="true">
                      <div class="failresonSty">
                        {{ pItem.distributionLogisticsMsg.substring(0, 30) }}
                      </div>
                    </Tooltip>
                  </div>
                </Step>
                <Step :content="getStepTime(pItem.despatchTime)" title="已发货" icon="md-paper-plane"></Step>
              </Steps>
            </div>
            <div class="right_box">
              <div v-if="pItem.addType">
                <span class="icon iconfont iconqueren greenColor cursor buyerAddressSave"
                  @click="saveNewPackage(index)"></span>
                <span class="icon iconfont iconicon-close cursor redColor" @click="cancelNewPackage(index)"></span>
              </div>
              <div class="wms-log pointer-font" v-if="pItem.merchantShippingMethodId"
                @click="openPackageLog(pItem.orderShippingId)">包裹操作日志
              </div>
              <div v-if="pItem.warehouseType != 1 && !pItem.addType && visibleCancelBtn && getCurrent(orderShippingInfoList, index) < 5">
                <span class="icon iconfont iconicon-close cursor redColor" @click="cancelPackage(pItem.orderShippingId)" />
              </div>
              <div v-else-if="!pItem.addType && visibleCancelBtn && getThreeCurrent(orderShippingInfoList, index) < 2">
                <span class="icon iconfont iconicon-close cursor redColor" @click="cancelPackage(pItem.orderShippingId)" />
              </div>
            </div>
          </div>
          <div slot="content">
            <div class="packageDetailsProductContainer" v-if="!pItem.addType">
              <div class="packageDetailsProduct normalPadding">
                <h3 class="btn-edit-groud">
                  <span class="cursor" v-if="hasEdit && getPermission('orderShippingInfo_updatePackageDetail') && !editProductStatus[index]
                    && orderShippingInfoList[index].packageStatus !== 7 && !addNewPackageStatus && inPage !== 'dispute'"
                    @click="editProduct(index)">
                    <span class="pointer-font">编辑</span>
                    <span class="icon iconfont blueColor">&#xe611;</span>
                  </span>
                  <!-- 添加 -->
                  <span class="icon iconfont greenColor cursor buyerAddressSave" v-if="editProductStatus[index]"
                    @click="addProductSave(index, 1)">&#xe60b;</span>
                  <span class="icon iconfont iconqueren greenColor cursor buyerAddressSave" v-if="editProductStatus[index]"
                    @click="editProductSave(index)">
                  </span>
                  <span class="icon iconfont grayColor cursor" v-if="editProductStatus[index]"
                    @click="cancelProductEdit(index)">&#xe698;</span>
                </h3>
                <div class="normalTop">
                  <dTable highlight-row disabled-hover border stripe :show-header="true" :columns="productColumnsArr[index]"
                    :data="productData[index]" />
                </div>
              </div>
            </div>
            <div class="packageDetails" v-if="!pItem.addType">
              <Row>
                <Col :span="6">
                <div class="packageDetailsSquare">
                  <h3>
                    发货地址
                    <span class="icon iconfont blueColor cursor"
                      v-if="hasEdit && getPermission('orderShippingInfo_updateReceiverAddress') && !buyerAddressModalStatus[index] && orderShippingInfoList[index].packageStatus !== 7 && !addNewPackageStatus && inPage !== 'dispute'"
                      @click="editPackageSquareStatus(index, 'buyerAddressModalStatus')">&#xe611;</span>
                    <template v-if="activePlatform === 'aliexpress'">
                      <Icon v-if="!pItem._isDecryption" @click="decryptionHandel(pItem)" type="md-eye-off"
                        class="eye-icon" />
                      <Icon v-else type="md-eye" class="eye-icon" @click="unDecryptionHandel(pItem)" />
                    </template>
                    <span class="icon iconfont iconqueren greenColor cursor buyerAddressSave"
                      v-if="buyerAddressModalStatus[index]" @click="editAddressSave(index)"></span> <span
                      class="icon iconfont grayColor cursor" v-if="buyerAddressModalStatus[index]"
                      @click="cancelPackageSquareStatusEdit(index, 'buyerAddressModalStatus')">&#xe698;</span>
                  </h3>
                  <div class="packagedetailsContent" v-if="!buyerAddressModalStatus[index]">
                    <div class="packageAddressItem normalTop">
                      {{ pItem.buyerName }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerMobile }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerPhone }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerEmail }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerAddress1 }}
                    </div>
                    <div class="packageAddressItem" v-if="pItem.buyerAddress2 !== '' || pItem.buyerAddress2 !== null">
                      {{ pItem.buyerAddress2 }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerCity }} {{ pItem.buyerPostalCode }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerState }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerCountryCodeName }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerPassportCode }}
                    </div>
                  </div>
                </div>
                <Form :ref="'buyerAddressModal' + index" :v="'buyerAddressModal' + index" :model="buyerAddressModal[index]"
                  :rules="ruleDetails" class="normalTop packageDetailsAddressForm" v-if="buyerAddressModalStatus[index]">
                  <Form-item prop="buyerName">
                    <Input v-model.trim="buyerAddressModal[index].buyerName" :maxlength="200"
                      placeholder="请输入收件人名称"></Input>
                  </Form-item>
                  <Form-item prop="buyerMobile">
                    <Input v-model.trim="buyerAddressModal[index].buyerMobile" :maxlength="128"
                      placeholder="请输入手机号"></Input>
                  </Form-item>
                  <Form-item prop="buyerPhone">
                    <Input v-model.trim="buyerAddressModal[index].buyerPhone" :maxlength="128"
                      placeholder="请输入电话号码"></Input>
                  </Form-item>
                  <Form-item prop="buyerEmail">
                    <Input v-model.trim="buyerAddressModal[index].buyerEmail" :maxlength="128" placeholder="请输入邮箱"></Input>
                  </Form-item>
                  <Form-item prop="buyerAddress1">
                    <Input v-model.trim="buyerAddressModal[index].buyerAddress1" :maxlength="1000"
                      placeholder="请输入详细地址"></Input>
                  </Form-item>
                  <Form-item prop="buyerAddress2">
                    <Input v-model.trim="buyerAddressModal[index].buyerAddress2" :maxlength="1000"
                      placeholder="请输入详细地址"></Input>
                  </Form-item>
                  <Row>
                    <Col :span="7" class="buyerCity">
                    <Form-item prop="buyerCity">
                      <Input v-model.trim="buyerAddressModal[index].buyerCity" :maxlength="500" placeholder="城市"></Input>
                    </Form-item>
                    </Col>
                    <Col :span="7" :offset="1">
                    <FormItem prop="buyerState">
                      <Input v-model.trim="buyerAddressModal[index].buyerState" :maxlength="500" placeholder="省份"></Input>
                    </FormItem>
                    </Col>
                    <Col :span="7" :offset="1">
                    <Form-item prop="buyerPostalCode">
                      <Input v-model.trim="buyerAddressModal[index].buyerPostalCode" :maxlength="30"
                        placeholder="邮编"></Input>
                    </Form-item>
                    </Col>
                  </Row>
                  <Form-item>
                    <dyt-select v-model="buyerAddressModal[index].buyerCountryCode" filterable placeholder="请选择或输入所在地">
                      <Option v-for="item in formValidate.country" :key="item.countryId" :value="item.twoCode"
                        :v="item.cnName">{{ item.enName }}</Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item>
                    <Input v-model.trim="buyerAddressModal[index].buyerPassportCode" :maxlength="500"
                      placeholder="请输入买家识别号"></Input>
                  </Form-item>
                  <Poptip v-model="addressSelect" class="addressSelect" v-if="buyerAddressModalStatus[index]">
                    <Button>...</Button>
                    <div slot="title" class="platformAddress"><i>平台地址选择</i></div>
                    <div slot="content" class="platformAddressSelect" v-if="hasEdit">
                      <a class="cursor pointer-font" href="javascript:;" @click="setCommonAddress(activePlatform, index)">{{
                        activePlatform }}地址</a>
                      <a class="cursor pointer-font" href="javascript:;" v-if="activePlatform === 'ebay'"
                        @click="setCommonAddress('paypal', index)">PayPal地址</a>
                    </div>
                  </Poptip>
                </Form>
                </Col>
                <Col :span="6" v-if="wmsServiceStatus">
                <div class="flexBox flexBox-middle">
                  <div>
                    <h3>
                      仓库
                      <span class="icon iconfont blueColor cursor" v-if="hasEdit && getPermission('orderShippingInfo_updateWarehouse') &&
                        !buyerWarehouseStatus[index] && orderShippingInfoList[index].packageStatus !== 7 &&
                        !addNewPackageStatus && inPage !== 'dispute'"
                        @click="editPackageSquareStatus(index, 'buyerWarehouseStatus')">&#xe611;</span>
                      <span class="icon iconfont iconqueren greenColor cursor buyerAddressSave"
                        v-if="hasEdit && buyerWarehouseStatus[index]"
                        @click="updateWarehouseId(pItem.orderShippingId, index)"></span>
                      <span class="icon iconfont grayColor cursor" v-if="hasEdit && buyerWarehouseStatus[index]"
                        @click="cancelPackageSquareStatusEdit(index, 'buyerWarehouseStatus')">&#xe698;</span>
                      <span class="cursor pointer-font" style="margin-left: 10px; font-weight: normal; font-size: 13px;"
                        @click="availableWarehousesBtn(index)">查询可用仓库</span>
                    </h3>
                    <div class="warehorseList">
                      <span v-if="!buyerWarehouseStatus[index]">{{ findWareHouseName(pItem.warehouseId, 'allStorelist')
                      }}</span>
                      <dyt-select v-model="warehouseIdArr[index]" v-if="hasEdit && buyerWarehouseStatus[index]"
                        :disabled="!getPermission('orderShippingInfo_updateWarehouse')">
                        <Option v-for="item in warehouseList" :value="item.warehouseId" :key="item.warehouseId"
                          :label="item.warehouseName"></Option>
                      </dyt-select>
                    </div>
                  </div>
                </div>
                </Col>
                <Col :span="6" v-if="wmsServiceStatus">
                <div class="flexBox flexBox-right">
                  <div>
                    <h3 style="display: inline-block;">
                      物流方式
                      <Poptip
                        placement="top"
                        width="700"
                        trigger="click"
                        :transfer="true"
                        @on-popper-show="popperShow(index)"
                        @on-popper-hide="popperHide(index)"
                        v-model="shippingPopTip[index]"
                      >
                        <span class="icon iconfont blueColor cursor"
                          v-if="hasEdit && getPermission('orderShippingInfo_replaceShippingMethod') && orderShippingInfoList[index].packageStatus !== 7 && !addNewPackageStatus && inPage !== 'dispute'"
                          @click="editPackageSquareStatus(index, 'buyerShippingMethodModalStatus')">&#xe611;</span>
                        <div class="api" slot="content" style="min-height: 300px;">
                          <Spin v-if="shippingMethodModalLoading" fix></Spin>
                          <Form class="setAllMarkRead" style="margin-top:10px;">
                            <Row>
                              <Col :span="14">
                              <Form-item label="实际发货物流方式：" :label-width="120">
                                <logisticsModeTree
                                  v-model="choseShippingValue"
                                  :multiple="false"
                                  :max-height="260"
                                  :warehouse-id="warehouseIdArr[index]"
                                  :loadingChildren="true"
                                  :append-to-body="false"
                                  :all-logistics-mode="false"
                                  :disableBranchNodes="true"
                                  :isType="true"
                                  :allLoadedDataFilterTreedData="filterTreeShippingMethod"
                                  placeholder="请选择实际发货物流方式"
                                  @on-change="getAccountApi($event, index)"
                                />
                              </Form-item>
                              </Col>
                              <Col :span="9" :offset="1" v-if="isOnlineShip === 0 && !isPms && !$common.isEmpty(carrierAccount)">
                              <Form-item label="帐号：" :label-width="60">
                                <Spin v-if="carrierAccountSpin" fix></Spin>
                                <dyt-select v-model="shippingAccountModel" :transfer="true">
                                  <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null"
                                    :key="index" :value="item.carrierAccountId" :label="item.account" />
                                </dyt-select>
                              </Form-item>
                              </Col>
                            </Row>
                          </Form>
                          <div class="matchLogisticSetting">
                            <h6>物流相关设置</h6>
                          </div>
                          <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
                            <Row>
                              <Col
                                :span="12"
                                v-for="(item, index) in carrierBaseSetting"
                                :key="index"
                                v-show="item.paramType !== 'hide'"
                              >
                              <Form-item :label="item.paramName" :label-width="100">
                                <Radio-group v-model="shippingMethodModel[index].paramValue"
                                  v-if="item.paramType === 'radio'">
                                  <Radio :label="sItem.itemValue" v-for="(sItem, n) in item.dictionarys" :key="n">
                                    <span>{{ sItem.itemName }}</span>
                                  </Radio>
                                </Radio-group>
                                <Input v-if="item.paramType == 'input'"
                                  v-model="shippingMethodModel[index].paramValue"></Input>
                                <Checkbox-group v-model="shippingMethodModel[index].paramValue"
                                  v-if="item.paramType == 'checkbox'">
                                  <Checkbox v-for="(sItem, n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                                    <span>{{ sItem.itemName }}</span>
                                  </Checkbox>
                                </Checkbox-group>
                                <dyt-select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
                                  <Option v-for="(sItem, n) in item.dictionarys" :key="n" :value="sItem.itemValue" :label="sItem.itemName" />
                                </dyt-select>
                                <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
                              </Form-item>
                              </Col>
                            </Row>
                            <div class="flexBox normalTop saveShppingModal">
                              <Button style="margin-right:10px" @click="cancelThisShppingMethod(index)">取消</Button>
                              <Button :loading="saveShippingLoading" type="primary" @click="saveThisShippingMethod(pItem.orderShippingId, index)">保存</Button>
                            </div>
                          </Form>
                        </div>
                      </Poptip>
                    </h3>
                    <span class="cursor pointer-font" style="margin-left: 10px; font-size: 13px;"
                      v-if="getPermission('orderShippingInfo_queryMatchShippingMethod') && !pItem.despatchTime"
                      @click="analysisLogisticsBtn(index)">查询可用物流方式</span>
                    <div
                      v-if="editShippingStatus.length > 0 && editShippingStatus[index] && !buyerShippingMethodModalStatus[index]"
                      class="normalTop">
                      <div>{{
                        editShippingStatus[index].carrierName === null || editShippingStatus[index].carrierName === ''
                        ? '未匹配'
                        : editShippingStatus[index].carrierName
                      }}
                      </div>
                      <div>{{ editShippingStatus[index].carrierShippingMethodName }}</div>
                      <div v-if="pItem.trackingNumber">
                        <a class="pointer-font" :href="`https://t.17track.net/zh-cn#nums=${pItem.trackingNumber}`"
                          target="_blank">{{
                            pItem.trackingNumber
                          }}</a>
                      </div>
                      <div v-if="pItem.accountName">{{ pItem.accountName }}</div>
                      <div v-if="pItem.carrierArr && pItem.carrierArr.length > 0" v-for="carrierItem in pItem.carrierArr"
                        :key="carrierItem.packageCarrierParamId">
                        {{ carrierItem.paramName }}：{{ carrierItem.itemName }}
                      </div>
                    </div>
                    <div class="mcShippingMethod flexBox">

                    </div>
                  </div>
                </div>
                </Col>
                <!-- 尺寸修改 -->
                <Col :span="6">
                  <h3>
                    规格
                    <span
                      class="icon iconfont blueColor cursor"
                      title="编辑"
                      v-if="hasEdit && packageSzieInfo[index] && !packageSzieInfo[index].isEdit && getPermission('packageInfo_modifyDimensions')"
                      @click="openPackageSzieEdit(pItem, packageSzieInfo[index], 'isEdit')"
                    >&#xe611;</span>
                    <span
                      class="icon iconfont iconqueren greenColor cursor buyerAddressSave"
                      title="保存"
                      v-if="hasEdit && packageSzieInfo[index] && packageSzieInfo[index].isEdit"
                      @click="savePackageSzieEdit(`packageSzie${index}`, packageSzieInfo[index], 'isEdit')"
                    />
                    <span
                      class="icon iconfont grayColor cursor"
                      title="取消"
                      v-if="hasEdit && packageSzieInfo[index] && packageSzieInfo[index].isEdit"
                      @click="cancelPackageSzieEdit(packageSzieInfo[index], 'isEdit')"
                    >&#xe698;</span>
                  </h3>
                  <div class="warehorseList mt10 mb10">
                    <template v-if="packageSzieInfo[index] && !packageSzieInfo[index].isEdit">
                      <div>长：{{ packageSzieInfo[index].data.length }} cm</div>
                      <div>宽：{{ packageSzieInfo[index].data.width }} cm</div>
                      <div>高：{{ packageSzieInfo[index].data.height }} cm</div>
                      <div class="specification-tooltip">
                        <Tooltip content="包裹所有产品重量总和" placement="left">
                          <span class="specification-label">重量</span>
                        </Tooltip>：
                        {{ packageSzieInfo[index].data.totalWeight || 0 }} g
                      </div>
                      <div class="specification-tooltip">
                        <Tooltip content="长+2×(宽+高)" placement="left">
                          <span class="specification-label">周长</span>
                        </Tooltip>：
                        {{(Number(packageSzieInfo[index].data.length || '0') + 2*(Number(packageSzieInfo[index].data.width || '0') + Number(packageSzieInfo[index].data.height || '0'))).toFixed(2)}} cm
                      </div>
                      <div class="specification-tooltip">
                        <Tooltip content="长×宽×高" placement="left">
                          <span class="specification-label">体积</span>
                        </Tooltip>：
                        {{((packageSzieInfo[index].data.length || 0)*(packageSzieInfo[index].data.width || 0)*(packageSzieInfo[index].data.height || 0)).toFixed(2)}} cm³
                      </div>
                    </template>
                    <template v-else-if="hasEdit">
                      <Form
                        v-if="packageSzieInfo[index]"
                        :ref="`packageSzie${index}`"
                        :model="packageSzieInfo[index].data"
                        :rules="packageSzieRule"
                        :label-width="60"
                        label-position="right"
                        class="package-szie-form"
                      >
                        <Form-item label="长：" prop="length">
                          <Input v-model.trim="packageSzieInfo[index].data.length" placeholder="请输入长度" />
                          <span>cm</span>
                        </Form-item>
                        <Form-item label="宽：" prop="width">
                          <Input v-model.trim="packageSzieInfo[index].data.width" placeholder="请输入宽度" />
                          <span>cm</span>
                        </Form-item>
                        <Form-item label="高：" prop="height">
                          <Input v-model.trim="packageSzieInfo[index].data.height" placeholder="请输入高度" />
                          <span>cm</span>
                        </Form-item>
                        <Form-item class="form-content-txt">
                          <div class="specification-tooltip" slot="label">
                            <Tooltip content="包裹所有产品重量总和" placement="left">
                              <span class="specification-label">重量</span>
                            </Tooltip>：
                          </div>
                          {{ packageSzieInfo[index].data.totalWeight }} g
                        </Form-item>
                        <Form-item label="" class="form-content-txt">
                          <div class="specification-tooltip" slot="label">
                            <Tooltip content="长+2×(宽+高)" placement="left">
                              <span class="specification-label">周长</span>
                            </Tooltip>：
                          </div>
                          {{(Number(packageSzieInfo[index].data.length || '0') + 2*(Number(packageSzieInfo[index].data.width || '0') + Number(packageSzieInfo[index].data.height || '0'))).toFixed(2)}} cm
                        </Form-item>
                        <Form-item label="体积：" class="form-content-txt">
                          <div class="specification-tooltip" slot="label">
                            <Tooltip content="体长×宽×高" placement="left">
                              <span class="specification-label">体积</span>
                            </Tooltip>：
                          </div>
                          {{((packageSzieInfo[index].data.length || 0)*(packageSzieInfo[index].data.width || 0)*(packageSzieInfo[index].data.height || 0)).toFixed(2)}} cm³
                        </Form-item>
                      </Form>
                    </template>
                  </div>
                  <Spin fix v-if="packageSzieInfo[index] && packageSzieInfo[index].loading"></Spin>
                </Col>
              </Row>
            </div>
            <!-- 添加包裹时 -->
            <div class="packageDetails" v-if="pItem.addType">
              <div class="packageDetailsProductContainer">
                <div class="packageDetailsProduct normalPadding">
                  <h3 class="btn-edit-groud">
                    <!-- 添加 -->
                    <span v-if="!upackingTalg" class="icon iconfont greenColor cursor buyerAddressSave"
                      @click="addProductSave(index, 0)">&#xe60b;</span>
                  </h3>
                  <div class="normalTop">
                    <Table highlight-row disabled-hover border stripe :show-header="true" :columns="newPackageColumns"
                      :data="addProductData" size="small" />
                  </div>
                </div>
              </div>
              <Row style="margin-top: 10px; padding: 10px 10px 0 10px;">
                <Col :span="10">
                <div class="packageDetailsAddress">
                  <h3>发货地址</h3>
                  <Form :ref="'orderShippingInfoList' + index" :v="'orderShippingInfoList' + index" :model="pItem"
                    :rules="ruleDetails" class="normalTop packageDetailsAddressForm">
                    <Form-item prop="buyerName">
                      <Input v-model.trim="pItem.buyerName" :maxlength="200" placeholder="请输入收件人名称"></Input>
                    </Form-item>
                    <Form-item prop="buyerMobile">
                      <Input v-model.trim="pItem.buyerMobile" :maxlength="128" placeholder="请输入手机号"></Input>
                    </Form-item>
                    <Form-item prop="buyerPhone">
                      <Input v-model.trim="pItem.buyerPhone" :maxlength="128" placeholder="请输入电话号码"></Input>
                    </Form-item>
                    <Form-item prop="buyerEmail">
                      <Input v-model.trim="pItem.buyerEmail" :maxlength="128" placeholder="请输入邮箱"></Input>
                    </Form-item>
                    <Form-item prop="buyerAddress1">
                      <Input v-model.trim="pItem.buyerAddress1" :maxlength="1000" placeholder="请输入详细地址"></Input>
                    </Form-item>
                    <Form-item prop="buyerAddress2">
                      <Input v-model.trim="pItem.buyerAddress2" :maxlength="1000" placeholder="请输入详细地址"></Input>
                    </Form-item>
                    <Row>
                      <Col :span="7" class="buyerCity">
                      <Form-item prop="buyerCity">
                        <Input v-model.trim="pItem.buyerCity" :maxlength="500" placeholder="城市"></Input>
                      </Form-item>
                      </Col>
                      <Col :span="7" :offset="1">
                      <FormItem prop="buyerState">
                        <Input v-model.trim="pItem.buyerState" :maxlength="500" placeholder="省份"></Input>
                      </FormItem>
                      </Col>
                      <Col :span="7" :offset="1">
                      <Form-item prop="buyerPostalCode">
                        <Input v-model.trim="pItem.buyerPostalCode" :maxlength="30" placeholder="邮编"></Input>
                      </Form-item>
                      </Col>
                    </Row>
                    <Form-item>
                      <dyt-select v-model="pItem.buyerCountryCode" filterable placeholder="请选择或输入所在地">
                        <Option v-for="item in formValidate.country" :key="item.countryId" :value="item.twoCode"
                          :v="item.cnName">{{
                            item.enName }}</Option>
                      </dyt-select>
                    </Form-item>
                    <Form-item>
                      <Input v-model.trim="pItem.buyerPassportCode" :maxlength="500" placeholder="请输入买家识别号"></Input>
                    </Form-item>
                    <Poptip v-model="addressSelect" class="addressSelect">
                      <Button>...</Button>
                      <div slot="title" class="platformAddress"><i>平台地址选择</i></div>
                      <div slot="content" class="platformAddressSelect">
                        <a class="cursor pointer-font" href="javascript:;"
                          @click="setCommonAddress(activePlatform, index, 'add')">{{
                            activePlatform }}地址</a>
                        <a class="cursor pointer-font" href="javascript:;" v-if="activePlatform === 'ebay'"
                          @click="setCommonAddress('paypal', index, 'add')">PayPal地址</a>
                      </div>
                    </Poptip>
                  </Form>
                </div>
                </Col>
                <Col :span="14" style="padding-left: 30px;" v-if="wmsServiceStatus">
                <div class="flexBox">
                  <div>
                    <h3>仓库</h3>
                    <div class="warehorseList">
                      <dyt-select v-model="warehouseIdArr[index]" @on-change="setSelectStore(warehouseIdArr[index])">
                        <Option v-for="item in warehouseList" :value="item.warehouseId" :key="item.warehouseId"
                          :label="item.warehouseName"></Option>
                      </dyt-select>
                    </div>
                  </div>
                </div>
                <Divider />
                <div class="flexBox">
                  <div v-if="warehouseIdArr[index]">
                    <h3>
                      物流方式
                      <span class="icon iconfont blueColor cursor"
                        @click="editPackageSquareStatus(index, 'buyerShippingMethodModalStatus')">&#xe611;</span>
                    </h3>
                    <div class="api">
                      <Form class="setAllMarkRead" style="margin-top:10px">
                        <Row>
                          <Col :span="24">
                          <Form-item label="实际发货物流方式：">
                            <logisticsModeTree
                              v-model="choseShippingValue"
                              :multiple="false"
                              :warehouse-id="warehouseIdArr[index]"
                              :loadingChildren="true"
                              :disableBranchNodes="true"
                              :all-logistics-mode="false"
                              :isType="true"
                              placeholder="请选择实际发货物流方式"
                              @on-change="getAccountApi($event, index)"
                            />
                          </Form-item>
                          </Col>
                          <Col :span="24" v-if="isOnlineShip === 0 && !isPms && !$common.isEmpty(carrierAccount)">
                          <Form-item label="帐号：">
                            <Spin v-if="carrierAccountSpin" fix></Spin>
                            <dyt-select v-model="shippingAccountModel" :transfer="true">
                              <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null"
                                :key="index" :value="item.carrierAccountId" :label="item.account" />
                            </dyt-select>
                          </Form-item>
                          </Col>
                        </Row>
                      </Form>
                      <div class="matchLogisticSetting">
                        <h6>物流相关设置</h6>
                      </div>
                      <Form class="setAllMarkRead white-space-nowrap-form" style="margin-top:10px">
                        <Row>
                          <Col :span="12" v-for="(item, index) in carrierBaseSetting" :key="index" v-show="item.paramType !== 'hide'">
                          <Form-item :label="item.paramName" :label-width="100">
                            <Radio-group v-model="shippingMethodModel[index].paramValue" v-if="item.paramType === 'radio'">
                              <Radio :label="sItem.itemValue" v-for="(sItem, n) in item.dictionarys" :key="n">
                                <span>{{ sItem.itemName }}</span>
                              </Radio>
                            </Radio-group>
                            <Input v-if="item.paramType == 'input'" v-model="shippingMethodModel[index].paramValue"></Input>
                            <Checkbox-group v-model="shippingMethodModel[index].paramValue"
                              v-if="item.paramType == 'checkbox'">
                              <Checkbox v-for="(sItem, n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                                <span>{{ sItem.itemName }}</span>
                              </Checkbox>
                            </Checkbox-group>
                            <dyt-select v-if="item.paramType === 'select'" v-model="shippingMethodModel[index].paramValue">
                              <Option v-for="(sItem, n) in item.dictionarys" :key="n" :value="sItem.itemValue" :label="sItem.itemName" />
                            </dyt-select>
                            <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
                          </Form-item>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </div>
                </div>
                </Col>
                <!-- 尺寸修改 -->
                <!-- <Col :span="4" class="ml15">
                  <h3>规格</h3>
                </Col> -->
              </Row>
            </div>
          </div>
        </Panel>
        <!-- 作废包裹展示 -->
        <Panel v-else-if="visibleVoidPackage" class="delivery_package_box_item" :name="pItem.packageCode" :key="`void-${index}`">
          <div class="package_box" @click.stop>
            <div class="left_box">
              <span style="color:#666;">
                出库单号:
                <span style="color: #2184ed">{{ pItem.packageCode }}</span>
              </span>
              <Icon style="margin-left: 5px;cursor: pointer;" type="ios-copy-outline" @click.native="CopyContentBtn(pItem.packageCode)" />
              <span class="package-status" style="display: inline-block;">
                包裹状态:
                <span style="display: inline-block; color: #f20;line-height: initial;vertical-align: middle;">
                  已作废
                </span>
              </span>
            </div>
            <div class="orderProcess" :class="{ processHeight: getCurrent(orderShippingInfoList, index) < 0 }">
              <!--第三方仓-->
              <Steps
                :current="getThreeCurrent(orderShippingInfoList, index)"
                v-if="pItem.warehouseType == '1'"
                :status="pItem.carrierPackageStatus === 'INV_ERROR' ? 'error' : 'process'"
              >
                <Step :content="getStepTime(pItem.packageCreatedTime)" title="已创建" icon="md-cart"></Step>
                <Step title="已下发物流" icon="md-cash">
                  <div slot="content">
                    <template v-if="pItem.trackingNumberTime">{{ getStepTime(pItem.trackingNumberTime) }}</template>
                    <template v-else-if="pItem.wmsOrderFailReasonOrder">
                      <Tooltip
                        :content="pItem.carrierPackageStatus === 'INV_ERROR' ? orderDetailsData.wmsOrderFailReasons[index].carrierSendFailReason : getLogistingContent(pItem, 2)"
                        :transfer="true">
                        <div class="failresonSty" v-if="pItem.carrierPackageStatus !== 'INV_ERROR'">
                          {{ getLogistingContent(pItem, 1) }}
                        </div>
                        <div class="failresonSty" v-else>
                          {{ orderDetailsData.wmsOrderFailReasons[index].carrierSendFailReason }}
                        </div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step v-if="pItem.carrierPackageStatus !== 'INV_ERROR'" :content="getStepTime(pItem.despatchTime)"
                  title="已发货" icon="md-car"></Step>
                <Step v-else title="配货异常" icon="md-close-circle"></Step>
              </Steps>

              <Steps :current="getCurrent(orderShippingInfoList, index)" v-else>
                <Step :content="getStepTime(pItem.packageCreatedTime)" title="已创建" icon="md-add-circle"></Step>
                <Step :title="getPickingTitle(pItem)" icon="md-filing"
                  v-if="!getTimeMt(pItem.getLabelTime, pItem.pickingTime) && (pItem.isYms != 1)">
                  <div slot="content">
                    {{ getPickingContent(pItem) }}
                  </div>
                </Step>
                <Step title="已下发物流" :icon="pItem.isYms == 1 ? 'md-filing' : 'md-cloud-upload'">
                  <div slot="content">
                    <template v-if="pItem.getLabelTime">{{ getStepTime(pItem.getLabelTime) }}</template>
                    <template v-else-if="pItem.wmsOrderFailReasonOrder">
                      <Tooltip :content="getLogistingContent(pItem, 2)" :transfer="true">
                        <div class="failresonSty">
                          {{ getLogistingContent(pItem, 1) }}
                        </div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step :title="getPickingTitle(pItem)" icon="md-filing" v-if="getTimeMt(pItem.getLabelTime, pItem.pickingTime) && (pItem.isYms != 1)">
                  <div slot="content">
                    {{ getPickingContent(pItem) }}
                  </div>
                </Step>
                <Step title="已下发云仓" icon="md-cloud-upload" v-if="pItem.isYms == 1">
                  <div slot="content">
                    <template v-if="pItem.ymsSyncTime">{{ getStepTime(pItem.ymsSyncTime) }}</template>
                    <template v-else-if="pItem.ymsPkgCreateFailReason">
                      <Tooltip :content="pItem.ymsPkgCreateFailReason" :transfer="true">
                        <div class="failresonSty">{{ pItem.ymsPkgCreateFailReason }}</div>
                      </Tooltip>
                    </template>
                  </div>
                </Step>
                <Step
                  title=""
                  icon="md-alert"
                  v-if="pItem.isYms == 1 && !$common.isEmpty(pItem.wmsOrderFailReasonOrder) && !$common.isEmpty(pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg)"
                >
                  <div slot="content">
                    <Tooltip :content="pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg" :transfer="true">
                      <div class="failresonSty">
                        {{ pItem.wmsOrderFailReasonOrder.abnormalOutOfStockMsg.substring(0, 30) }}
                      </div>
                    </Tooltip>
                  </div>
                </Step>
                <Step :content="getStepTime(pItem.pickingGoodsTime)" title="已拣货" icon="md-hand"></Step>
                <Step :content="getStepTime(pItem.printTime)" title="已打印" icon="md-print"></Step>
                <Step title="" icon="md-alert" v-if="!$common.isEmpty(pItem.distributionLogisticsMsg)">
                  <div slot="content">
                    <Tooltip :content="pItem.distributionLogisticsMsg" :transfer="true">
                      <div class="failresonSty">
                        {{ pItem.distributionLogisticsMsg.substring(0, 30) }}
                      </div>
                    </Tooltip>
                  </div>
                </Step>
                <Step :content="getStepTime(pItem.despatchTime)" title="已发货" icon="md-paper-plane"></Step>
              </Steps>
            </div>
            <div class="right_box">
              <div class="wms-log pointer-font" v-if="pItem.merchantShippingMethodId" @click="openPackageLog(pItem.orderShippingId)">包裹操作日志</div>
            </div>
          </div>
          <div slot="content">
            <div class="packageDetailsProductContainer">
              <div class="packageDetailsProduct normalPadding">
                <div class="normalTop">
                  <dTable
                    highlight-row
                    disabled-hover
                    border
                    stripe
                    :show-header="true"
                    :columns="productColumnsArr[index]"
                    :data="productData[index]"
                  />
                </div>
              </div>
            </div>
            <div class="packageDetails">
              <Row>
                <Col :span="6">
                <div class="packageDetailsSquare">
                  <h3>发货地址</h3>
                  <div class="packagedetailsContent" v-if="!buyerAddressModalStatus[index]">
                    <div class="packageAddressItem normalTop">
                      {{ pItem.buyerName }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerMobile }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerPhone }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerEmail }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerAddress1 }}
                    </div>
                    <div class="packageAddressItem" v-if="pItem.buyerAddress2 !== '' || pItem.buyerAddress2 !== null">
                      {{ pItem.buyerAddress2 }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerCity }} {{ pItem.buyerPostalCode }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerState }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerCountryCodeName }}
                    </div>
                    <div class="packageAddressItem">
                      {{ pItem.buyerPassportCode }}
                    </div>
                  </div>
                </div>
                </Col>
                <Col :span="6" v-if="wmsServiceStatus">
                  <div class="flexBox flexBox-middle">
                    <div>
                      <h3>仓库</h3>
                      <div class="warehorseList">
                        <span v-if="!buyerWarehouseStatus[index]">{{ findWareHouseName(pItem.warehouseId, 'allStorelist')}}</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col :span="6" v-if="wmsServiceStatus">
                  <div class="flexBox flexBox-right">
                    <div>
                      <h3 style="display: inline-block;">
                        物流方式
                      </h3>
                      <div
                        v-if="!$common.isEmpty(editShippingStatus) && editShippingStatus[index] && !buyerShippingMethodModalStatus[index]"
                        class="normalTop"
                      >
                        <div>
                          {{
                            editShippingStatus[index].carrierName === null || editShippingStatus[index].carrierName === ''
                            ? '未匹配'
                            : editShippingStatus[index].carrierName
                          }}
                        </div>
                        <div>{{ editShippingStatus[index].carrierShippingMethodName }}</div>
                        <div v-if="pItem.trackingNumber">
                          <a class="pointer-font" :href="`https://t.17track.net/zh-cn#nums=${pItem.trackingNumber}`"
                            target="_blank">{{
                              pItem.trackingNumber
                            }}</a>
                        </div>
                        <div v-if="pItem.accountName">{{ pItem.accountName }}</div>
                        <div v-if="pItem.carrierArr && pItem.carrierArr.length > 0" v-for="carrierItem in pItem.carrierArr"
                          :key="carrierItem.packageCarrierParamId">
                          {{ carrierItem.paramName }}：{{ carrierItem.itemName }}
                        </div>
                      </div>
                      <div class="mcShippingMethod flexBox"></div>
                    </div>
                  </div>
                </Col>
                <!-- 尺寸修改 -->
                <Col :span="6">
                  <h3>规格</h3>
                  <div class="warehorseList mt10 mb10">
                    <template v-if="packageSzieInfo[index] && !packageSzieInfo[index].isEdit">
                      <div>长：{{ packageSzieInfo[index].data.length }} cm</div>
                      <div>宽：{{ packageSzieInfo[index].data.width }} cm</div>
                      <div>高：{{ packageSzieInfo[index].data.height }} cm</div>
                      <div class="specification-tooltip">
                        <Tooltip content="包裹所有产品重量总和" placement="left">
                          <span class="specification-label">重量</span>
                        </Tooltip>：
                        {{ packageSzieInfo[index].data.totalWeight || 0 }} g
                      </div>
                      <div class="specification-tooltip">
                        <Tooltip content="长+2×(宽+高)" placement="left">
                          <span class="specification-label">周长</span>
                        </Tooltip>：
                        {{(Number(packageSzieInfo[index].data.length || '0') + 2*(Number(packageSzieInfo[index].data.width || '0') + Number(packageSzieInfo[index].data.height || '0'))).toFixed(2)}} cm
                      </div>
                      <div class="specification-tooltip">
                        <Tooltip content="长×宽×高" placement="left">
                          <span class="specification-label">体积</span>
                        </Tooltip>：
                        {{((packageSzieInfo[index].data.length || 0)*(packageSzieInfo[index].data.width || 0)*(packageSzieInfo[index].data.height || 0)).toFixed(2)}} cm³
                      </div>
                    </template>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Panel>
      </template>
    </Collapse>
    <Modal v-model="dropPidStatus" width="360" class="waringHeader">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="md-information-circle"></Icon>
        <span>警告提示</span>
      </p>
      <div style="text-align:center">
        <p>是否确认删除包裹?</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="modal_loading" @click="confrimDrop">确认删除</Button>
      </div>
    </Modal>
    <!-- 添加商品 -->
    <matchingGoodsModal ref="matchingGoodsModal" :orderInfo="orderInfo" :typeStatus="typeStatus"
      :productListData="productListData" :curIndex="curIndex" @editData="editData"></matchingGoodsModal>
    <!--查询可用仓库-->
    <availableWarehousesModal
      ref="availableWarehouses"
      :currentIndex="currentIndex"
      :orderDetailsData="orderDetailsData"
      @selectWarehouse="selectWarehouse"
      @changeWarehouses="changeWarehouses"
      :disabled="!getPermission('orderShippingInfo_updateWarehouse')"
    />
    <!--查看物流方式解析-->
    <analysisLogisticsModal ref="analysisLogistics" :orderDetailsData="orderDetailsData" :currentIndex="currentIndex"
      :allStorelist="allStorelist" @updateDetailsData="updateDetailsData" @changeLogistics="changeLogistics"
      :orderId="orderDetailsId">
    </analysisLogisticsModal>
    <!--wms操作日志-->
    <Modal v-model="wmsLogModel" title="操作日志" width="800">
      <Table :columns="wmsLogColumns" :data="wmsLogData" height="500"></Table>
      <Button v-if="wmsLogParams.nextToken !== null" @click="getWmsLog()" icon="ios-arrow-down" long>展示更多</Button>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import matchingGoodsModal from './matchingGoodsModal';
import availableWarehousesModal from './availableWarehousesModal';
import analysisLogisticsModal from './analysisLogisticsModal';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import logisticsModeTree from '@/components/common/logisticsModeTree';

export default {
  mixins: [Mixin, publicService],
  components: {
    matchingGoodsModal,
    availableWarehousesModal,
    analysisLogisticsModal,
    logisticsModeTree
  },
  data() {
    // var self = this;
    let v = this;
    return {
      productStatusData: productData.productStatus,
      choseShippingIndex: null,
      switchTalg: true,
      isWmsLogLoading: false,
      logisticsJson: {},
      choseOrderShippingId: '',
      shippingMethodModalLoading: false,
      // 是否显示作废包裹
      visibleVoidPackage: false,
      packageCodeList: [],
      warehouseList: [],
      isPms: false,
      isShowAddPackage: false,
      ymsInventoryData: {},
      threeCurrentTxt: {
        0: { txt: '已创建' },
        1: { txt: '已下发物流' },
        2: { txt: '已发货' }
      },
      ymsCurrentTxt: {
        0: { txt: '已创建' },
        1: { txt: '已下发物流' },
        2: { txt: '已下发云仓' },
        3: { txt: '已拣货' },
        4: { txt: '已打印' },
        5: { txt: '已发货' }
      },
      stepsCurrent: {
        0: { txt: '已创建' },
        1: { txt: '已分配完成' },
        '1-true': { txt: '已下发物流' },
        2: { txt: '已下发物流' },
        3: { txt: '已拣货' },
        4: { txt: '已打印' },
        5: { txt: '已发货' }
      },
      wmsLogParams: {
        'orderShippingId': null,
        'nextToken': '1',
        'pageSize': 10
      },
      wmsLogData: [],
      wmsLogColumns: [
        {
          key: 'updatedBy',
          title: '操作人',
          width: 100,
          render(h, params) {
            return h('span', v.getUserName(params.row.updatedBy));
          }
        }, {
          key: 'logContentDesc',
          title: '操作内容描述',
          minWidth: 260
        }, {
          key: 'updatedTime',
          title: '操作时间',
          width: 100,
          render: (h, params) => {
            return h('div', {}, v.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          key: 'relatedBusinessNo',
          title: '相关业务编号'
        }
      ],
      wmsLogModel: false,
      wmsLogList: [],
      apiInterfaceStatus: null, // 指定仓库物流方式 存下选中的物流方式 若是速卖通线上发货，edis物流则不显示账号
      isOnlineShip: 0,
      newPackageColumns: [], // 新包裹列表
      selectStoreStatus: null, // 判断是否选择仓库
      typeStatus: 0, // 表示执行添加产品的功能
      productListData: [],
      curIndex: null, // 记录点击包裹的下标
      // 仓库
      // wmsServiceStatus: this.$store.state.erpConfig.purchasedServices.indexOf('wms_service') >= 0,
      productServiceStatus: this.$store.state.erpConfig.purchasedServices.indexOf('product_service') >= 0,
      wmsServiceStatus: true, // 暂时写死
      warehouseIdArr: [], // 物流
      saveShippingLoading: false,
      dropPidStatus: false,
      modal_loading: false,
      dropPid: null,
      carrierAccountSpin: false,
      shippingPopTip: [],
      shippingMethodValue: [],
      choseShippingValue: null,
      carrierBaseSetting: [], // 物流参数配置
      // 包裹相关 start
      packageGoodsQuantity: {},
      setNoDelivery: false,
      saveStatus: false,
      ruleDetails: {
        buyerName: [
          {
            validator: this.vaildatorUserEmpty(),
            trigger: 'blur'
          }
        ],
        buyerAddress1: [
          {
            validator: this.vaildatorDetailsAddressEmpty(),
            trigger: 'blur'
          }
        ],
        buyerMobile: [
          {
            validator: this.validateMobile1(),
            trigger: 'blur'
          }
        ],
        buyerPhone: [
          {
            validator: this.vaildatorBuyerPhoneEmpty1(),
            trigger: 'blur'
          }
        ],
        city: [
          {
            validator: this.vaildatorAddressCity(),
            trigger: 'blur'
          }
        ],
        addressCode: [
          {
            validator: this.vaildatorAddressCode(),
            trigger: 'blur'
          }
        ]
      },
      productColumnsArr: [], // 包裹产品列组
      editShippingStatus: [],
      catchProductData: [],
      productData: [],
      addProductData: [], // 添加新包裹内容
      editProductStatus: [],
      buyerAddressModal: [],
      buyerAddressModalStatus: [], // 包裹地址编辑状态控制,
      buyerWarehouseStatus: [], // 包裹仓库编辑状态控制
      buyerShippingMethodModalStatus: [], // 包裹物流方式状态控制
      packageSzieInfo: [], // 包裹尺码控制
      // 包裹尺码表单验证
      packageSzieRule: {
        length: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        width: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
        height: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入数字,限两位小数', trigger: 'blur' },
        ],
      },
      addressSelect: false, // 地址选择显示状态
      orderNoTitle: '',
      accountCode: '',
      orderShippingInfoList: [],
      samePackageOtherOrderInfos: null,
      packageRestStatus: true, // 可重置包裹
      orderShippingId: null,
      addNewPackageStatus: false, // 添加产品状态
      currentIndex: 0,
      upackingTalg: false, // 是否是拆包
      originalAddOrderList: [], // 记录原始包裹产品数据
      originalOrderShippingList: []
    };
    // End
  },
  props: {
    moalVisible: { type: Boolean, default: false },
    // 是否可以编辑
    hasEdit: { type: Boolean, default: true },
    orderInfo: [Object, String],
    orderDetailsData: Object,
    // 平台ID
    platformId: { type: Array, default: () => { return [] } },
    // 其他额外参数
    orderOpenData: { type: Object, default: () => { return {} } },
    timestampTwo: { type: Number, default: null },
    orderNo: [Number, String],
    orderDetailsId: String,
    inPage: String
  },
  watch: {
    orderInfo(n, o) {
      if (n !== o) {
        this.startMakeOrderShippingInfo();
      }
    },
    timestampTwo(n, o) {
      this.switchTalg = true;
      this.orderShippingInfoList = [];
      if (n !== o && this.orderDetailsId !== null) {
        this.resetOrderPackage();
      }
      if (n) {
        this.productColumnsArr = [];
        this.editProductStatus = [];
        this.startMakeOrderShippingInfo();
      }
    },
    switchTalg: {
      handler(value) {
        this.packageCodeList = [];
        if (!value) return;
        (this.orderShippingInfoList || []).forEach((item) => {
          if (!this.packageCodeList.includes(item.packageCode)) {
            this.packageCodeList.push(item.packageCode);
          }
        });
      },
      deep: true,
      immediate: true
    },
    visibleVoidView: {
      deep: true,
      immediate: true,
      handler(val) {
        this.visibleVoidPackage = val;
      }
    },
    // 物流状态改变时
    orderShippingInfoList: {
      handler(data) {
        this.$store.commit('orderShippingDetails', data);
        if (data.length > 0 && !this.upackingTalg) {
          data.forEach((item) => {
            !this.packageCodeList.includes(item.packageCode) && this.packageCodeList.push(item.packageCode);
          });
        }
      },
      deep: true,
      immediate: true
    },
    moalVisible: {
      deep: true,
      immediate: true,
      handler(val) {
        this.$nextTick(() => {
          val ? this.pageInit() : this.rsetData();
        })
      }
    }
  },
  computed: {
    isGoToOrderPage() {
      return this.$route.path === '/ebayMail';
    },
    // 未作废的包裹
    notVoidPack () {
      return (this.orderShippingInfoList || []).filter(item => item.packageStatus != 99);
    },
    // 已作废包裹
    voidedPack () {
      return (this.orderShippingInfoList || []).filter(item => item.packageStatus == 99);
    },
    // 是否显示作废包裹
    visibleVoidView () {
      if (this.$common.isEmpty(this.globalParams.type) || ![2].includes(Number(this.globalParams.type))) return false;
      if (this.$common.isEmpty(this.globalParams.value)) return false;
      const voidCodeList = this.voidedPack.map(m => m.packageCode);
      return voidCodeList.includes(this.globalParams.value);
    },
    // 是否显示取消包裹按钮
    visibleCancelBtn () {
      if (!this.hasEdit || !this.getPermission('orderShippingInfo_delete')) return false;
      if (this.addNewPackageStatus) {
        return this.notVoidPack.length > 2;
      }
      return this.notVoidPack.length > 1;
    },
    // 当前平台
    activePlatform() {
      return (this.platformId || []).join(',')
    },
    // 包裹平台信息是否必填
    orderTransactionRequired() {
      if (['aliexpress'].includes(this.activePlatform) && ([0, 1].includes(Number(this.trusteeshipType)) || this.isJIT)) {
        return true;
      }
      return false;
    },
    // 是否显示添加包裹按钮
    addPackageShow() {
      if (!this.hasEdit) return false;
      if (!this.getPermission('orderShippingInfo_addOrderShippingInfo')) return false;
      if (!(this.samePackageOtherOrderInfos === null && !this.addNewPackageStatus && this.isShowAddPackage && this.inPage !== 'dispute')) return false;
      if (this.isJIT) return false;
      return true;
    },
    // 是否显示重置包裹按钮
    showResetorderBtn () {
      if (!this.hasEdit) return false;
      if (!this.getPermission('orderShippingInfo_resetPackage')) return false;
      return this.samePackageOtherOrderInfos === null && this.notVoidPack.length > 1 && this.packageRestStatus && !this.addNewPackageStatus;
    },
    // 是否显示拆分包裹按钮
    splitPackageShow() {
      if (!this.hasEdit) return false;
      if (!this.getPermission('orderShippingInfo_split')) return false;
      if (!(this.samePackageOtherOrderInfos === null && !this.addNewPackageStatus && this.isShowAddPackage && this.inPage !== 'dispute')) return false;
      if (this.isJIT) return false;
      return true;
    },
    // 是否 JIT 订单(jit 就表示是全托管(半托管)订单)
    isJIT() {
      if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderInfo)) return false;
      return this.orderDetailsData.orderInfo.orderType === 'JIT';
    },
    // 0 全托管、1 半托管
    trusteeshipType() {
      if (this.$common.isEmpty(this.orderDetailsData) || this.$common.isEmpty(this.orderDetailsData.orderInfo)) return false;
      return this.orderDetailsData.orderInfo.trusteeshipType;
    },
    // 是否全局打开
    globalOpen () {
      if (this.$common.isEmpty(this.globalParams) || this.$common.isEmpty(this.globalParams.value)) return false;
      return true;
    },
    // 全局打开其他参数
    globalOtherParams () {
      if (this.$common.isEmpty(this.orderOpenData) || this.$common.isEmpty(this.orderOpenData.otherParams)) return {};
      return this.orderOpenData.otherParams;
    },
    // 全局打开查询的参数
    globalParams () {
      if (this.$common.isEmpty(this.orderOpenData) || this.$common.isEmpty(this.orderOpenData.searchParams)) return {};
      return this.orderOpenData.searchParams;
    },
    // 作废包裹信息
    voidShippingInfo () {
      if (this.$common.isEmpty(this.orderShippingInfoList)) return [];
      return this.orderShippingInfoList.filter(f => f.packageStatus == 99);
    }
  },
  created() { },
  mounted() {
    setTimeout(this.getCountrys(), 2000);// 获取国家区域列表
  },
  methods: {
    // isYms(pItem) {
    //   const rowWarehouseInfo = this.warehouseList.find(k => {
    //     return k.warehouseId == pItem.warehouseId;
    //   });
    //   return rowWarehouseInfo.isYms == 1;
    // },
    // 打开弹窗时
    pageInit() {
      this.logisticsJson = {};
    },
    // 弹窗关闭时
    rsetData() {
      this.packageCodeList = [];
    },
    /**
    * aliexpress 解密
    * @param row 订单数据
    * */
    decryptionHandel(row) {
      this.axios.post(api.post_orderShippingInfo_decryptByOrderId, {
        "oaid": row.extendJson ? JSON.parse(row.extendJson).oaid : null,
        "orderId": this.orderDetailsId,
        "saleAccountId": row.saleAccountId
      }).then(response => {
        if (response.data.code === 0) {
          // 目前解密字段
          let decryptionKeys = {
            buyerPostalCode: null,
            buyerName: null,
            buyerPhone: null,
            buyerAddress2: null,
            buyerAddress1: null,
            buyerMobile: null
          };
          for (let key in decryptionKeys) {
            decryptionKeys[key] = response.data.datas[key];
          }
          for (let key in decryptionKeys) {
            decryptionKeys['_' + key] = decryptionKeys[key]; // 存原始值
            row[key] = decryptionKeys[key];
          }
          row._isDecryption = true;
        }
      });
    },
    // 取消加密
    unDecryptionHandel(row) {
      // 目前解密字段
      let decryptionKeys = {
        buyerPostalCode: null,
        buyerName: null,
        buyerPhone: null,
        buyerAddress2: null,
        buyerAddress1: null,
        buyerMobile: null
      };
      for (let key in decryptionKeys) {
        row[key] = row['_' + key];
      }
      row._isDecryption = false;
    },
    openOrderToRetrieve() {
      if (this.$common.isEmpty(this.orderInfo) || this.$common.isEmpty(this.accountCode) || this.$common.isEmpty(this.orderInfo.salesRecordNumber)) {
        this.$Message.error('订单信息不全');
        return;
      }
      const openUrl = `/order-service/commonOrder.html#/orderToRetrieve?platform=ebay&orderId=${this.accountCode}-${this.orderInfo.salesRecordNumber}`;
      // window.open(openUrl, 'ebayMailToorderToRetrieve');
      window.open(openUrl);
    },
    getPickingTitle(item) {
      /**
       * @Description: 分配头部
       * @author gan
       * @date: 2020/10/29 9:35
       */
      if (item.pickingStatus === 1 || item.pickingStatus === 7 || (item.pickingStatus === 0 && item.pickingTime)) {
        return '已执行分配';
      } else {
        return '已分配完成';
      }
    },
    getPickingContent(item) {
      /**
       * @Description: 分配展示内容
       * @author gan
       * @date: 2020/10/29 9:13
       */
      if (item.pickingStatus === 1 || item.pickingStatus === 7) {
        let value = [];
        let obj = [];
        const text = this.failTypeList.filter(j => {
          obj = item.outOfStockStatusList.filter(i => {
            if (this.$common.isString(j.value) && j.value.includes(',')) {
              value = j.value.split(',').find(v => {
                return v == Number(i)
              });
              return !this.$common.isEmpty(value);
            } else {
              return j.value == Number(i);
            }
          });
          return !this.$common.isEmpty(obj);
        });
        if (text && text.length > 0) {
          return '异常原因:' + text.map(i => i.label).join('/');
        }
      } else if (item.pickingStatus === 0 && item.pickingTime) {
        return '取消分配';
      } else {
        return this.getStepTime(item.pickingTime);
      }
    },
    openPackageLog(orderShippingId) {
      this.wmsLogModel = true;
      this.wmsLogParams.orderShippingId = orderShippingId;
      this.wmsLogParams.nextToken = null;
      this.wmsLogData = [];
      this.getWmsLog();
    },
    getWmsLog() {
      if (this.isWmsLogLoading) return;
      this.isWmsLogLoading = true;
      this.axios.post(api.get_pickingLog, this.wmsLogParams).then(response => {
        if (response.data.code === 0) {
          this.wmsLogParams.nextToken = response.data.datas.nextToken;
          this.wmsLogData = [...this.wmsLogData, ...response.data.datas.result];
        }
        this.$nextTick(() => {
          this.isWmsLogLoading = false;
        })
      }).catch(() => {
        this.$nextTick(() => {
          this.isWmsLogLoading = false;
        })
      })
    },
    getTimeMt(date, date1) {
      if (date === null) {
        return false;
      } else if (date1 === null) {
        return true;
      } else {
        return new Date(date).getTime() < new Date(date1).getTime();
      }
    },
    validateMobile1() { // 手机校验，可共用
      let isPhone = this.$regular.isPhone;
      let isMob = this.$regular.isMob;
      let validateMobile = (rule, value, callback) => {
        if ((value !== null || value !== '')) {
          callback();
        } else if ((!isPhone.test(value) && !isMob.test(value))) {
          callback(new Error('电话号码格式不正确'));
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    vaildatorBuyerPhoneEmpty1() {
      let isPhone = this.$regular.enterPhone;
      let userEmpty = (rule, value, callback) => {
        if ((value !== null || value !== '')) {
          callback();
        } else if ((!isPhone.test(value))) {
          callback(new Error('电话号码格式不正确'));
        } else {
          callback();
        }
      };
      return userEmpty;
    },
    resetOrderPackage() {
      this.productData = [];
      this.catchProductData = [];
      this.buyerAddressModal = [];
      this.buyerAddressModalStatus = [];
      this.buyerShippingMethodModalStatus = [];
      this.buyerWarehouseStatus = [];
      this.packageSzieInfo = [];
      this.carrierAccount = [];
      this.packageGoodsQuantity = {};
      this.addProductData = [];
      this.originalAddOrderList = [];
      this.addNewPackageStatus = false;
      this.selectStore = null;
      this.warehouseIdArr = [];
    },
    startMakeOrderShippingInfo() {
      this.getStore().finally(() => {
        this.warehouseList = this.storeList;
        let v = this;
        let merchantShippingMethodIdPos = [];
        let packageProductList = [];// 包裹产品列表
        let packageArr = [];// merchant索引集合
        v.productColumnsArr = [];
        v.upackingTalg = false;
        let data = v.orderDetailsData;
        if (data) {
          v.samePackageOtherOrderInfos = data.samePackageOtherOrderInfos;
        } else {
          return;
        }
        if (v.wmsServiceStatus) {
          // 获取仓库列表
          v.getAllstore(0, 3).then((res) => {
            if (data.orderShippingInfoList && data.orderShippingInfoList.length > 0 && v.allStorelist.length > 0) {
              this.allStorelist.forEach((ele) => {
                data.orderShippingInfoList.forEach((item) => {
                  if (ele.warehouseId === item.warehouseId) {
                    item.warehouseType = ele.warehouseType;
                  }
                  if (item.orderShippingDetailList.length > 0) {
                    item.addPackageTalg = false;
                    item.orderShippingDetailList.forEach((ele) => {
                      if (ele.quantity > 1) {
                        item.addPackageTalg = true;
                      }
                    });
                  }
                });
              });
            }
          });
        }

        const makeOrderShippingInfoList = () => { // 包裹信息归纳
          return new Promise(resolve => {
            if (data && data.orderShippingInfoList !== null && data.orderShippingInfoList.length > 0) {
              data.orderShippingInfoList.forEach((n, i) => {
                v.shippingPopTip.splice(i, 1, false);
                if (n.packageStatus === 7) v.packageRestStatus = false;
                v.buyerAddressModal.push({ // 包裹收件人内容存储池
                  orderShippingId: n.orderShippingId,
                  packageId: n.packageId,
                  buyerAccountId: n.buyerAccountId,
                  buyerAddress1: n.buyerAddress1,
                  buyerAddress2: n.buyerAddress2,
                  buyerCity: n.buyerCity,
                  buyercountryId: n.buyercountryId,
                  buyerEmail: n.buyerEmail,
                  buyerMobile: n.buyerMobile,
                  buyerName: n.buyerName,
                  buyerPassportCode: n.buyerPassportCode,
                  buyerPhone: n.buyerPhone,
                  buyerPostalCode: n.buyerPostalCode,
                  buyerState: n.buyerState,
                  warehouseId: n.warehouseId,
                  buyerCountryCode: n.buyerCountryCode
                });
                v.warehouseIdArr.push(n.warehouseId);
                v.countryName(n.buyerCountryCode).then(response1 => {
                  n.buyerCountryCodeName = response1;
                });
                v.buyerAddressModalStatus.push(false);// 地址编辑状态集合
                v.buyerWarehouseStatus.push(false);// 仓库编辑状态集合
                v.packageSzieInfo.push({
                  isEdit: false,
                  oldData: {},
                  data: n
                });
                v.buyerShippingMethodModalStatus.push(false);// 仓库物流方式状态集合
                if (n.merchantShippingMethodId) {
                  merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
                  packageArr.push(i);// merchant索引，用来从原始list里拿相关数据
                }
                let obj = {
                  status: false,
                  model: [],
                  orderShippingId: n.orderShippingId,
                  carrierName: '',
                  carrierShippingMethodName: '',
                  shippingAccountModel: ''
                };
                v.editShippingStatus.splice(i, 1, obj);// 初始化物流状态
                packageProductList.push([]);// 初始化包裹产品信息
                n.orderShippingDetailList.forEach((m, k) => {
                  v.editProductStatus.push(false);
                  m.goodsQuantity = m.quantity;
                  m.group = i; // 多包裹的时候属于第几个包裹
                  if (m.webstoreOrderTransactionId) {
                    let id = m.webstoreItemId || m.webstoreSku;
                    if (id) {
                      id = ',' + id;
                    } else {
                      id = '';
                    }
                    m.orderTransactionId = m.webstoreOrderTransactionId + id;
                  } else {
                    m.orderTransactionId = null;
                  }
                  v.editProductStatus.push(false);// 编辑包裹详情状态集合
                  packageProductList[i].push({ ...m, warehouseId: n.warehouseId });
                  if (m.orderId === data.orderInfo.orderId) {
                    if (typeof v.packageGoodsQuantity[m.webstoreItemId] === 'number') {
                      v.packageGoodsQuantity[m.salesRecordNumber] += m.quantity;
                    } else {
                      if (!v.packageGoodsQuantity[m.salesRecordNumber]) {
                        v.packageGoodsQuantity[m.salesRecordNumber] = m.quantity;
                      } else {
                        v.packageGoodsQuantity[m.salesRecordNumber] += m.quantity;
                      }
                    }
                  }
                });
                if (i === data.orderShippingInfoList.length - 1) {
                  if (merchantShippingMethodIdPos.length === 0) {
                    resolve(true);
                  }
                  let awaitRes = [];
                  let resKey = [];
                  v.$common.arrRemoveRepeat(merchantShippingMethodIdPos).forEach(m => {
                    resKey.push(m);
                    awaitRes.push(() => {
                      return v.getParamName(m);
                    });
                  });
                  v.$common.promiseAll(awaitRes).then((arrRes) => {
                    const resObj = {};
                    arrRes.forEach(itemRes => {
                      Object.keys(itemRes).forEach(key => {
                        resObj[key] = itemRes[key]
                      });
                    });
                    let newArr = [];
                    merchantShippingMethodIdPos.forEach((mItem, mIndex) => {
                      let orderShippingInfoItem = data.orderShippingInfoList[packageArr[mIndex]]; // 原始list的索引项
                      if (orderShippingInfoItem.orderShippingCarrierParamList) {
                        newArr = [];
                        resObj[mItem].forEach((n, i) => {
                          orderShippingInfoItem.orderShippingCarrierParamList.forEach((m, t) => {
                            if (n.paramKey === m.paramKey) {
                              if (n.dictionarys) {
                                n.dictionarys.forEach((b, g) => {
                                  if (b.itemValue === m.paramValue) {
                                    let obj = {
                                      paramValue: m.paramValue,
                                      itemName: b.itemName,
                                      paramName: n.paramName
                                    };
                                    newArr.push(obj);
                                  }
                                });
                              }
                            }
                          });
                        });
                        orderShippingInfoItem.carrierArr = newArr;
                        if (mIndex === merchantShippingMethodIdPos.length - 1) {
                          resolve(true);
                        }
                      } else {
                        if (mIndex === merchantShippingMethodIdPos.length - 1) {
                          resolve(true);
                        }
                      }
                    })
                  });
                }
                const rowWarehouseInfo = v.warehouseList.find(k => {
                  return k.warehouseId == n.warehouseId;
                });
                n.isYms = rowWarehouseInfo ? rowWarehouseInfo.isYms : null;
              });
            } else {
              resolve(true);
            }
          });
        }

        const getOrderNoTitle = () => { // 获取accountCode,订单前缀
          if (v.orderNo === null) {
            v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + v.orderInfo.saleAccountId + '&time=' + new Date().getTime()).then(response => {
              if (response.data.code === 0) {
                let list = response.data.datas;
                v.accountCode = list[0].accountCode;
                v.orderNoTitle = list[0].accountCode + '-' + v.orderInfo.salesRecordNumber;
              }
            });
          } else if (v.orderNo !== null) {
            v.accountCode = v.orderNo.split('-')[0];
          }
        }

        const getShippingMethodName = () => { // 获取物流商名称
          return new Promise(resolve => {
            v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
              if (response.data.code === 0) {
                if (response.data.datas.length > 0) {
                  let data1 = response.data.datas;
                  for (let k = 0; k < merchantShippingMethodIdPos.length; k++) {
                    let mechantItem = merchantShippingMethodIdPos[k];
                    for (let i = 0; i < data1.length; i++) {
                      let item = data1[i];
                      if (item.shippingMethodId === mechantItem) {
                        v.editShippingStatus[packageArr[k]].carrierName = item.carrierName;
                        v.editShippingStatus[packageArr[k]].isOnline = item.isOnline;
                        v.editShippingStatus[packageArr[k]].carrierShippingMethodName = item.carrierShippingMethodName;
                      }
                    }
                  }
                } else {
                  v.editShippingStatus.forEach((n, i) => {
                    n.carrierName = '';
                    n.carrierShippingMethodName = '';
                  });
                }
                resolve();
              }
            });
          });
        }

        let pptObj = [];
        // let pptPos = {};
        let pptPos = [];
        let salesRrecorNumPos = [];

        const makePackageProductList = () => { // 发货包裹产品整理
          return new Promise((resolve, reject) => {
            packageProductList.forEach((item, index) => {
              pptPos.push([]);
              pptObj.push({});
              salesRrecorNumPos.push([]);
              item.forEach((n, i) => {
                if (pptObj[index].hasOwnProperty(n.orderSalesRecordNumber)) { // 销售记录号
                  pptObj[index][n.orderSalesRecordNumber]++;
                  let g = salesRrecorNumPos[index].lastIndexOf(n.orderSalesRecordNumber);
                  if (g >= 0) {
                    pptPos[index].splice(g, 0, v.deepCopy(n));
                    salesRrecorNumPos[index].splice(g, 0, n.orderSalesRecordNumber);
                  }
                } else {
                  v.$set(pptObj[index], n.orderSalesRecordNumber, 1);
                  pptPos[index].push(v.deepCopy(n));
                  salesRrecorNumPos[index].push(n.orderSalesRecordNumber);
                }
              })
            });

            pptPos.forEach(item => {
              item.reduce((x, y) => {
                if (x && x.orderSalesRecordNumber === y.orderSalesRecordNumber && !x.hasOwnProperty('rowSpan')) {
                  x.rowSpan = pptObj[x.orderSalesRecordNumber];
                  return x;
                } else if (x && x.orderSalesRecordNumber !== y.orderSalesRecordNumber) {
                  y.rowSpan = pptObj[y.orderSalesRecordNumber];
                  return y;
                } else {
                  return x;
                }
              });
            });
            resolve(true);
          });
        }

        const getCarrierAccount = () => {
          let obj = {};
          let awaitRes = [];
          (v.editShippingStatus || []).forEach(i => {
            (data.orderShippingInfoList || []).forEach(j => {
              if (i.orderShippingId === j.orderShippingId) {
                j.isOnline = i.isOnline;
              }
              if (!v.$common.isEmpty(j.carrierAccountId) && j.isOnline !== 1 && v.$common.isUndefined(obj[`${j.carrierAccountId}-${j.merchantCarrierId}`])) {
                obj[`${j.carrierAccountId}-${j.merchantCarrierId}`] = true;
                awaitRes.push(() => {
                  return v.getAccountMes(j.carrierAccountId, j.merchantCarrierId)
                });
              }
            });
          });
          v.$common.promiseAll(awaitRes).then(arrRes => {
            arrRes.forEach(aRes => {
              (data.orderShippingInfoList || []).forEach(j => {
                if (!v.$common.isEmpty(j.carrierAccountId) && j.isOnline !== 1 && aRes[`${j.carrierAccountId}-${j.merchantCarrierId}`]) {
                  j.accountName = aRes[`${j.carrierAccountId}-${j.merchantCarrierId}`];
                }
              })
            })
          });
        }

        const setorderShippingInfoList = async () => {
          const msResult = await makeOrderShippingInfoList();
          if (msResult) {
            await getShippingMethodName().then(() => {
              getCarrierAccount();
            });
            await getOrderNoTitle();
            if (data && data.samePackageOtherOrderInfos !== null) {
              let tbj = v.deepCopy(v.samePackageOtherOrderInfos);
              tbj.unshift(v.orderInfo);
              const lastResult = await makePackageProductList();

              if (lastResult) {
                v.orderShippingInfoList = data.orderShippingInfoList === null ? [] : data.orderShippingInfoList;

                await v.inserProductCoumnsInArr(1);
                let productGoodsIds = [];
                pptPos.forEach(u => {
                  u.forEach(y => {
                    productGoodsIds.push(y.productGoodsId);
                  });
                });
                Promise.all([v.getProductGoodsTag(productGoodsIds), v.getSpecifications(productGoodsIds)]).then(result => {
                  // 标签
                  let tagData = result[0] || [];
                  // 属性
                  let attributeData = result[1] || {};
                  packageProductList.forEach(k => {
                    k.forEach(y => {
                      y.specsData = [];
                      y.productGoodsTags = tagData.filter(f => y.productGoodsId === f.productGoodsId).map(m => m.tagName);
                      Object.keys(attributeData).forEach(key => {
                        if (y.productGoodsId === key) {
                          y.specsData = [...y.specsData, ...Object.values(attributeData[key] || {})]
                        }
                      })
                    });
                  });
                  v.catchProductData = v.deepCopy(pptPos);
                  v.$nextTick(() => {
                    v.getYMSInventory(pptPos);
                  });
                });
              }
              v.$parent.packageGoodsQuantityObj = v.packageGoodsQuantity;
            } else {
              v.orderShippingInfoList = data.orderShippingInfoList === null ? [] : data.orderShippingInfoList;
              await v.inserProductCoumnsInArr();
              let productGoodsIds = [];
              packageProductList.forEach(u => {
                u.forEach(y => {
                  productGoodsIds.push(y.productGoodsId);
                });
              });
              Promise.all([v.getProductGoodsTag(productGoodsIds), v.getSpecifications(productGoodsIds)]).then(result => {
                // 标签
                let tagData = result[0] || [];
                // 属性
                let attributeData = result[1] || {};
                packageProductList.forEach(k => {
                  k.forEach(y => {
                    y.specsData = [];
                    y.productGoodsTags = tagData.filter(f => y.productGoodsId === f.productGoodsId).map(m => m.tagName);
                    Object.keys(attributeData).forEach(key => {
                      if (y.productGoodsId === key) {
                        y.specsData = [...y.specsData, ...Object.values(attributeData[key] || {})]
                      }
                    })
                  });
                });
                v.catchProductData = v.deepCopy(packageProductList);
                v.$nextTick(() => {
                  v.getYMSInventory(packageProductList);
                });
                v.$parent.packageGoodsQuantityObj = v.packageGoodsQuantity;
              });
            }
            await v.dealwithLogisticReason();
            const canAddPack = (v.orderShippingInfoList || []).find(i => {
              return !i.despatchTime && i.packageStatus != 99;
            });
            v.isShowAddPackage = !this.$common.isEmpty(canAddPack);
          }
        }
        setorderShippingInfoList();
      })
    },
    // 已下发物流增加异常原因显示新需求
    dealwithLogisticReason() {
      return new Promise(resolve => {
        let { wmsOrderFailReasons, orderInfo } = this.orderDetailsData;
        if (!(wmsOrderFailReasons && wmsOrderFailReasons.length)) {
          resolve()
          return;
        };
        let { orderId } = orderInfo;
        let orderlist = wmsOrderFailReasons.filter(k => {
          return orderId === k.orderId;
        })
        if (!orderlist.length) {
          resolve();
          return;
        }
        let shippingIdVOS = [];
        orderlist.forEach(k => {
          k.wmsOrderFailReasonOrderShippingIdVOS && shippingIdVOS.push(...k.wmsOrderFailReasonOrderShippingIdVOS);
        })
        this.orderShippingInfoList.forEach((k, i) => {
          orderlist.forEach(j => {
            if (k.orderShippingId === j.orderShippingId) {
              this.orderShippingInfoList[i].wmsOrderFailReasonOrder = j;
            }
          })
        })
        resolve();
      })
    },
    // 获取单个包裹物流配置参数
    getParamName(shippingMethodId) {
      return new Promise(resolve => {
        this.axios.get(api.get_shippingMethodParamsApi, {
          params: {
            shippingMethodId: shippingMethodId,
            time: `${new Date().getTime()}${(Math.random()).toString().substring(2)}`
          }
        }).then(response => {
          if (response.data.code === 0) {
            return resolve({ [shippingMethodId]: this.$common.copy(response.data.datas || []) });
          }
          resolve({ [shippingMethodId]: [] });
        }).catch((err) => {
          console.error(err);
          resolve({ [shippingMethodId]: [] });
        });
      });
    },
    getAccountMes(carrierAccountId, merchantCarrierId) {
      return new Promise(resolve => {
        this.axios.get(`${api.erpServiceCommon}${api.get_carrierAccountMes}`, {
          params: {
            carrierAccountId: carrierAccountId,
            carrierId: merchantCarrierId,
            time: `${new Date().getTime()}${(Math.random()).toString().substring(2)}`
          }
        }).then(response => {
          if (response.data.code === 0 && !this.$common.isEmpty(response.data.datas)) {
            return resolve({ [`${carrierAccountId}-${merchantCarrierId}`]: response.data.datas.account });
          }
          resolve({ [`${carrierAccountId}-${merchantCarrierId}`]: {} });
        }).catch((err) => {
          console.error(err);
          resolve({ [`${carrierAccountId}-${merchantCarrierId}`]: {} });
        });
      });
    },
    createProdcutColumns(type, warehouseId) {
      let packageWarehouseInfo = {};
      // 包裹对应仓库信息
      if (!this.$common.isEmpty(warehouseId)) {
        packageWarehouseInfo = this.warehouseList.find(item => {
          return warehouseId == item.warehouseId;
        });
      }
      // 包裹产品columns
      let packageColumns = [];
      if (type) {
        // orderNo
        packageColumns.push({
          title: 'orderNo',
          key: 'orderNo',
          combine: true,
          minWidth: 60,
          maxWidth: 120,
          render: (h, params) => {
            let obj = {
              childrens: [
                [
                  'div', {
                    class: ''
                  }, this.accountCode + '-' + params.row.orderSalesRecordNumber
                ]
              ],
              props: {}
            };
            if (params.row.rowSpan) {
              obj.props.rowSpan = params.row.rowSpan;
            }
            return obj;
          }
        });
      }
      // 商品
      packageColumns.push({
        title: '商品',
        key: 'pictureUrl',
        width: 400,
        render: (h, params) => {
          let tableItem = [this.tableImg(h, params, 'pictureUrl')];
          const row = params.row;
          let specsDataList = [h('span', '规格: ')];
          let status = ''; // 状态
          // 状态处理
          productData.productStatus.forEach(item => {
            if (row.productStatus == item.value) {
              status = item.label
            }
          });
          // 商品规格属性
          if (row.specsData && row.specsData.length > 0) {
            row.specsData.forEach((item, index) => {
              specsDataList.push(h('span', { class: index > 0 ? 'ml5' : '' }, item.name + ': '));
              specsDataList.push(h('span', {}, item.value));
            })
          }
          let fourItem = [
            h('span', '状态: '),
            h('span', { style: { color: 'green' } }, status)
          ];
          row.productDeveloperUserId && fourItem.push(h('span', { class: 'ml10' }, `开发员：${row.productDeveloperUserId}`));
          row.purchaserName && fourItem.push(h('span', { class: 'ml10' }, `采购员：${row.purchaserName}`));
          tableItem.push(h('div', {
            style: {
              'margin-left': '10px'
            }
          },
          [
            h('div', [
              h('span', `sku: ${row.sku}`),
              h('span', { style: { 'marginLeft': '10px' } }, [
                h('span', `重量(g):`),
                h('span', { style: { 'color': '#f20' } }, ` ${row.productWeight || 0}`)
              ]),
            ]),
            h('div', `名称: ${row.title ? row.title : row.cnName}`),
            h('div', row.specsData && row.specsData.length > 0 ? specsDataList : ''),
            h('div', {}, fourItem),
            h('div', {}, `${row.productCategory ? `所属分类： ${row.productCategory}` : ''}`),
          ]));
          return h('div', {
            class: 'consignment-package-product',
          }, tableItem);
        }
      });
      // 商品标签
      packageColumns.push({
        title: '商品标签',
        key: 'productGoodsTags',
        minWidth: 200,
        render: (h, { row }) => {
          if (row.productGoodsTags && row.productGoodsTags.length > 0) {
            return (row.productGoodsTags).map((tag, i) => {
              return h('span', {
                class: 'product-goods-tag'
              }, tag)
            })
          }
          return h('span', {}, '');
        }
      });
      // 平台信息
      packageColumns.push({
        title: '平台信息',
        key: 'orderTransactionId',
        minWidth: 120,
        render: (h, params) => {
          let optionList = [];
          if (!this.orderTransactionRequired) {
            optionList.push(h('Option', {
              props: {
                value: ''
              }
            }, '请选择'));
          }
          // orderTransactionId 实际是 刊登号
          let orderTransactionId = h('div', params.row.orderTransactionId || '');
          if (!this.editProductStatus[params.row.group] && params.row.addType !== 1) {
            if (!params.row.orderTransactionId) {
              orderTransactionId = h('span', {
                style: {
                  color: 'red'
                }
              }, [
                h('Tooltip', {
                  props: {
                    size: 16,
                    content: '发货信息明显未匹配订单交易，使用线上物流发货时可能会失败'
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'ios-information-circle'
                    }
                  })
                ]), h('span', '未匹配订单交易')
              ]);
            }
          } else if (this.editProductStatus[params.row.group] && params.row.orderId === this.orderInfo.orderId && params.row.addType !== 1) {
            if (this.catchProductData[params.row.group] && this.catchProductData[params.row.group][params.index]) {
              orderTransactionId = h('Select', {
                props: {
                  placeholder: '请选择',
                  filterable: true,
                  transfer: true,
                  value: this.catchProductData[params.row.group][params.index].orderTransactionId
                },
                on: {
                  'on-change': (event) => {
                    // 编辑的时候 传webstoreOrderTransactionId   webstoreItemId || webstoreSku
                    if (event) {
                      this.orderInfo.orderTransactions.forEach(i => {
                        let id = i.webstoreItemId || i.webstoreSku;
                        if (id) {
                          id = ',' + id;
                        } else {
                          id = '';
                        }
                        if ((i.webstoreOrderTransactionId + id) === event) {
                          this.catchProductData[params.row.group][params.index].webstoreOrderTransactionId = i.webstoreOrderTransactionId;
                          this.catchProductData[params.row.group][params.index].webstoreItemId = i.webstoreItemId;
                          this.catchProductData[params.row.group][params.index].webstoreSku = i.webstoreSku;
                          this.catchProductData[params.row.group][params.index].orderTransactionId = event;
                        }
                      });
                    } else {
                      this.catchProductData[params.row.group][params.index].webstoreOrderTransactionId = null;
                      this.catchProductData[params.row.group][params.index].webstoreItemId = null;
                      this.catchProductData[params.row.group][params.index].webstoreSku = null;
                      this.catchProductData[params.row.group][params.index].orderTransactionId = null;
                    }
                    this.productData[params.row.group] = this.$common.copy(this.catchProductData[params.row.group]);
                  }
                }
              }, [
                ...optionList, ...this.orderInfo.orderTransactions.map(i => {
                  let id = i.webstoreItemId || i.webstoreSku;
                  if (id) {
                    id = ',' + id;
                  } else {
                    id = '';
                  }
                  return h('Option', {
                    props: {
                      value: i.webstoreOrderTransactionId + id
                    }
                  }, i.webstoreOrderTransactionId + id);
                })
              ]);
            }
          } else if (params.row.addType === 1 && this.catchProductData[params.row.group] && this.catchProductData[params.row.group][params.index]) {
            orderTransactionId = h('Select', {
              props: {
                placeholder: '请选择',
                filterable: true,
                transfer: true,
                value: this.addProductData[params.index].orderTransactionId
              },
              on: {
                'on-change': (event) => {
                  if (event) {
                    this.orderInfo.orderTransactions.forEach(i => {
                      let id = i.webstoreItemId || i.webstoreSku;
                      if (id) {
                        id = ',' + id;
                      } else {
                        id = '';
                      }
                      if ((i.webstoreOrderTransactionId + id) === event) {
                        this.catchProductData[params.row.group][params.index].webstoreOrderTransactionId = i.webstoreOrderTransactionId;
                        this.catchProductData[params.row.group][params.index].webstoreItemId = i.webstoreItemId;
                        this.catchProductData[params.row.group][params.index].webstoreSku = i.webstoreSku;
                      }
                    });
                  } else {
                    this.catchProductData[params.row.group][params.index].webstoreOrderTransactionId = null;
                    this.catchProductData[params.row.group][params.index].webstoreItemId = null;
                    this.catchProductData[params.row.group][params.index].webstoreSku = null;
                  }
                  this.productData[params.row.group] = this.$common.copy(this.catchProductData[params.row.group]);
                  this.addProductData = this.$common.copy(this.catchProductData[params.row.group]);
                }
              }
            }, [
              ...optionList, ...this.orderInfo.orderTransactions.map(i => {
                let id = i.webstoreItemId || i.webstoreSku;
                if (id) {
                  id = ',' + id;
                } else {
                  id = '';
                }
                return h('Option', {
                  props: {
                    value: i.webstoreOrderTransactionId + id
                  }
                }, i.webstoreOrderTransactionId + id);
              })
            ]);
          }
          return h('div', {}, [
            orderTransactionId
          ])
        }
      });
      // 数量
      packageColumns.push({
        title: '数量',
        key: 'goodsQuantity',
        width: 90,
        render: (h, params) => {
          const isExist = (this.catchProductData[params.row.group] && this.catchProductData[params.row.group][params.index]);
          if (!this.editProductStatus[params.row.group] && params.row.addType !== 1) {
            return h('span', params.row.goodsQuantity);
          } else if (this.editProductStatus[params.row.group] && params.row.orderId === this.orderInfo.orderId && params.row.addType !== 1) {
            if (!isExist) return h('span', params.row.goodsQuantity);
            return h('InputNumber', {
              props: {
                min: 0,
                size: 'small',
                value: this.catchProductData[params.row.group][params.index].goodsQuantity
              },
              style: {
                width: '70px'
              },
              on: {
                input: val => {
                  if (val === 0 && this.catchProductData[params.row.group][params.index].rowSpan === 1) {
                    this.$Message.error('单个订单下所有交易货品不能都为0');
                    return false;
                  }
                  this.catchProductData[params.row.group][params.index].quantity = val;
                }
              }
            })
          } else if (params.row.addType === 1) {
            return h('InputNumber', {
              props: {
                min: 0,
                size: 'small',
                value: this.addProductData[params.index].goodsQuantity
              },
              style: {
                width: '70px'
              },
              on: {
                input: val => {
                  this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList[params.index].quantity = val;
                }
              }
            })
          }
        }
      });
      // 库存
      packageColumns.push({
        title: '库存',
        key: 'availableNumber',
        width: 150,
        render: (h, { row }) => {
          let item = [];
          // YMS 云仓
          if (!this.$common.isEmpty(packageWarehouseInfo) && packageWarehouseInfo.isYms == 1) {
            // let addTypeList = [
            //   { key: 'SUPPLIER', label: '供应商库存：', availQty: 0 },
            //   { key: 'YMS', label: '中心仓库存：', availQty: 0 }
            // ];
            // let typeObj = {};
            // addTypeList.forEach(typeRes => {
            //   typeObj[typeRes.key] = typeRes;
            // });
            // (this.ymsInventoryData[row.warehouseId] || []).forEach(invent => {
            //   if (invent.productGoodsId == row.productGoodsId) {
            //     typeObj[invent.inventoryType].availQty = this.$common.isEmpty(invent.availQty) ? 0 : invent.availQty;
            //   }
            // });
            // addTypeList.forEach(typeRes => {
            //   item.push(h('p', `${typeRes.label}${typeObj[typeRes.key].availQty}`));
            // });
          } else {
            item.push(h('p', `可用库存：${row.availableNumber || 0}`));
            if (!this.$common.isEmpty(row.rowWarehouseType) && [0].includes(Number(row.rowWarehouseType))) {
              // 自营
              item.push(h('p', `未发在途：${row.notOnWayNumber || 0}`));
              item.push(h('p', `已发在途：${row.onWayNumber || 0}`));
              item.push(h('p', `收货库存：${row.deliveryNumber || 0}`));
            } else {
              // 海外仓库(第三方/云仓)
              item.push(h('p', `在途库存：${row.inTransitNumber || 0}`));
            }
          }
          return h('div', {}, item);
        }
      });
      // 谷仓实收信息
      if (!this.$common.isEmpty(packageWarehouseInfo) && ['gcoutstore'].includes(packageWarehouseInfo.warehouseOverseaType)) {
        packageColumns.push({
          title: '谷仓实收信息',
          key: 'productLength',
          minWidth: 160,
          render: (h, { row }) => {
            const length = this.$common.isEmpty(row.productActualLength) || row.productActualLength <= 0 ? '' : row.productActualLength;
            const width = this.$common.isEmpty(row.productActualWidth) || row.productActualWidth <= 0 ? '' : row.productActualWidth;
            const height = this.$common.isEmpty(row.productActualHeight) || row.productActualHeight <= 0 ? '' : row.productActualHeight;
            const weight = this.$common.isEmpty(row.productActualWeight) || row.productActualWeight <= 0 ? '' : row.productActualWeight;
            let item = [];
            if (!this.$common.isEmpty(weight)) {
              item.push(h('div', {}, `实收重量(g)：${weight}`));
            }
            if (!this.$common.isEmpty(length) && !this.$common.isEmpty(width) && !this.$common.isEmpty(height)) {
              item.push(h('div', {}, `实收长宽高(cm)：${length}*${width}*${height}`));
            }
            return h('div', {}, item);
          }
        });
      }
      // 销售链接
      packageColumns.push({
        title: '销售链接',
        key: 'productUrl',
        minWidth: 180,
        render: (h, params) => {
          if (!this.editProductStatus[params.row.group]) {
            return h('Tooltip', {
              props: {
                content: params.row.productUrl,
                placement: 'left',
                'max-width': 600,
                transfer: true,
              }
            }, [
              h('div', {
                class: 'ellipsis-multiline',
                style: {
                  '-webkit-line-clamp': 6,
                  'line-height': '1.4em',
                  'max-height': '8.4em',
                  'overflow': 'hidden',
                }
              }, params.row.productUrl)
            ]);
          }
          return h('Input', {
            props: {
              placeholder: '请输入销售链接',
              size: 'small',
              value: this.catchProductData[params.row.group][params.index].productUrl,
              maxlength: 1000,
            },
            on: {
              input: (val) => {
                this.$set(this.catchProductData[params.row.group][params.index], 'productUrl', val);
              }
            }
          });
        }
      });
      // 备注
      packageColumns.push({
        title: '备注',
        key: 'remark',
        minWidth: 180,
        render: (h, params) => {
          const isExist = (this.catchProductData[params.row.group] && this.catchProductData[params.row.group][params.index]);
          if (!this.editProductStatus[params.row.group] && params.row.addType !== 1) {
            return params.row.remark;
          } else if (this.editProductStatus[params.row.group] && params.row.orderId === this.orderInfo.orderId && params.row.addType !== 1) {
            if (!isExist) return params.row.remark;
            return h('Input', {
              props: {
                placeholder: '请输入发货提醒',
                size: 'small',
                value: this.catchProductData[params.row.group][params.index].remark,
                maxlength: 100,
                disabled: !(this.catchProductData[params.row.group][params.index].quantity > 0)
              },
              // style: {
              //   width: '100px'
              // },
              on: {
                input: val => {
                  this.catchProductData[params.row.group].forEach((n, i) => { // 判断发货提醒显示，是否开通商品服务
                    if (n.variations === params.row.variations && n.webstoreItemId === params.row.webstoreItemId && !this.productServiceStatus) {
                      this.catchProductData[params.row.group][i].remark = val;
                    } else if (n.productGoodsId === params.row.productGoodsId && n.orderId === params.row.orderId && this.productServiceStatus) {
                      this.catchProductData[params.row.group][i].remark = val;
                    }
                  });
                }
              }
            });
          } else if (params.row.addType === 1) {
            return h('Input', {
              props: {
                placeholder: '请输入发货提醒',
                size: 'small',
                value: this.addProductData[params.index].remark,
                maxlength: 100,
                disabled: !(this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList[params.index].quantity > 0)
              },
              // style: {
              //   width: '100px'
              // },
              on: {
                input: val => {
                  this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList.forEach((n, i) => {
                    if (n.variations === params.row.variations && n.webstoreItemId === params.row.webstoreItemId && !this.productServiceStatus) {
                      this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList[i].remark = val;
                    } else if (n.productGoodsId === params.row.productGoodsId && this.productServiceStatus) {
                      this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList[i].remark = val;
                    }
                  });
                }
              }
            });
          }
        }
      });
      return packageColumns;
    },
    inserProductCoumnsInArr(type) {
      for (let i = 0; i < this.orderShippingInfoList.length; i++) {
        this.productColumnsArr.push(this.createProdcutColumns(type, this.orderShippingInfoList[i].warehouseId));
      }
    },
    addNewPackage(value, index, platformId) { // 添加新包裹
      this.popperHide();
      if (this.addNewPackageStatus) {
        return false;
      }
      this.addNewPackageStatus = true;
      // 是否是拆包
      this.upackingTalg = !!value.packageCode;
      if (this.upackingTalg) {
        // this.packageCodeList = [];
        this.packageCodeList.push(value.packageCode, '新建包裹');
        this.originalOrderShippingList = this.orderShippingInfoList[index];
        // this.originalAddOrderList = JSON.parse(JSON.stringify(this.orderInfo.orderTransactions));
        this.originalAddOrderList = JSON.parse(JSON.stringify(this.productData[index]));
      }
      let obj = {};
      obj.buyerAccountId = this.orderInfo.buyerAccountId;
      obj.buyerAddress1 = this.orderInfo.buyerAddress1;
      obj.buyerAddress2 = this.orderInfo.buyerAddress2;
      obj.buyerCity = this.orderInfo.buyerCity;
      obj.buyerCountryCode = this.orderInfo.buyerCountryCode;
      obj.buyerEmail = this.orderInfo.buyerEmail;
      obj.buyerMobile = this.orderInfo.buyerMobile;
      obj.buyerName = this.orderInfo.buyerName;
      obj.buyerPassportCode = this.orderInfo.buyerPassportCode;
      obj.buyerPhone = this.orderInfo.buyerPhone;
      obj.buyerPostalCode = this.orderInfo.buyerPostalCode;
      obj.buyerState = this.orderInfo.buyerState;
      obj.orderId = this.orderInfo.orderId;
      obj.packageCode = '新建包裹';
      obj.trackingNumberTime = null;
      obj.printTime = null;
      obj.despatchTime = null;
      obj.packageStatus = null;
      obj.orderShippingDetailList = null;
      obj.packageCreatedTime = null;
      obj.pickingStatus = null;
      obj.warehouseId = null;
      obj.trackingNumberStatus = null;
      obj.addType = 1;
      this.warehouseIdArr.push(null);

      const makeNeworderShippingDetailList = () => { // 拷贝已有包裹产品数据
        return new Promise(resolve => {
          let params = { orderId: this.orderInfo.orderId };
          if (!this.$common.isEmpty(platformId)) {
            params.platformId = platformId
          }
          this.axios.get(api.get_orderDetailsNewPackageProductDetails, {
            params: params
          }).then(response => {
            if (response.data.code === 0) {
              const productGoodsIds = response.data.datas.map(i => i.productGoodsId);
              Promise.all([this.getProductGoodsTag(productGoodsIds), this.getSpecifications(productGoodsIds)]).then(result => {
                // 标签
                let tagData = result[0] || [];
                // 属性
                let attributeData = result[1] || {};
                let orderShippingDetailList = response.data.datas || [];
                orderShippingDetailList.forEach(k => {
                  k.specsData = [];
                  k.productGoodsTags = tagData.filter(f => k.productGoodsId === f.productGoodsId).map(m => m.tagName);
                  Object.keys(attributeData).forEach(key => {
                    if (k.productGoodsId === key) {
                      k.specsData = [...k.specsData, ...Object.values(attributeData[key] || {})];
                    }
                  })
                  k.quantity = 1;
                });
                resolve([true, orderShippingDetailList]);
              });
            }
          }).catch(() => {
            this.addNewPackageStatus = false;
          });
        });
      };
      let pptObj = {};
      let pptPos = [];
      let salesRrecorNumPos = [];

      const makePackageProductList = () => { // 发货包裹产品整理
        return new Promise((resolve, reject) => {
          obj.orderShippingDetailList.forEach((n, i) => {
            n.addType = 1;
            if (this.orderInfo.isHand === 1) {
              // 手工单
              pptPos.push(n);
            } else {
              this.orderInfo.orderTransactions.forEach((m, t) => {
                if (m.webstoreOrderTransactionId === n.webstoreOrderTransactionId) {
                  n.orderTransactionId = m.orderTransactionId;
                  if (pptObj.hasOwnProperty(n.orderSalesRecordNumber)) { // 如果已存在该sn
                    pptObj[n.orderSalesRecordNumber]++;
                    let g = salesRrecorNumPos.lastIndexOf(n.orderSalesRecordNumber);
                    if (g >= 0) {
                      pptPos.push(n);
                    }
                  } else {
                    pptObj[n.orderSalesRecordNumber] = 1;
                    pptPos.push(n);
                    salesRrecorNumPos.push(n.orderSalesRecordNumber);
                  }
                }
              });
            }
          });
          pptPos.reduce((x, y) => {
            if (x && x.orderSalesRecordNumber === y.orderSalesRecordNumber && !x.hasOwnProperty('rowSpan')) {
              x.rowSpan = pptObj[x.orderSalesRecordNumber];
              return x;
            } else if (x && x.orderSalesRecordNumber !== y.orderSalesRecordNumber) {
              y.rowSpan = pptObj[y.orderSalesRecordNumber];
              return y;
            } else {
              return x;
            }
          });
          resolve(true);
        });
      }

      const makeNewOrderShippingInfoList = (obj) => {
        return new Promise(resolve => {
          let temporaryJson = {
            shippingJson: {},
            szieJson: {},
            buyerStatus: {},
            addressStatus: {},
            address: {},
            table: {},
            columns: {},
            shippingModel: {},
          };
          this.orderShippingInfoList.forEach((item, index) => {
            temporaryJson.shippingJson[item.packageCode] = this.editShippingStatus[index];
            temporaryJson.szieJson[item.packageCode] = this.packageSzieInfo[index];
            temporaryJson.buyerStatus[item.packageCode] = this.buyerWarehouseStatus[index];
            temporaryJson.addressStatus[item.packageCode] = this.buyerAddressModalStatus[index];
            temporaryJson.address[item.packageCode] = this.buyerAddressModal[index];
            temporaryJson.table[item.packageCode] = this.productData[index];
            temporaryJson.columns[item.packageCode] = this.productColumnsArr[index];
            temporaryJson.shippingModel[item.packageCode] = this.shippingMethodModel[index] || {};
          });

          const arr = this.orderShippingInfoList.concat([obj]);
          this.orderShippingInfoList = [];
          this.$nextTick(() => {
            let normalityPackage = [];
            let voidPackage = [];
            let temporaryList = {
              shippingJson: [],
              szieJson: [],
              buyerStatus: [],
              addressStatus: [],
              address: [],
              table: [],
              columns: [],
              shippingModel: [],
            };
            (arr || []).forEach((pack) => {
              pack.packageStatus == 99 ? voidPackage.push(pack) : normalityPackage.push(pack);
            });
            this.orderShippingInfoList = [...normalityPackage, ...voidPackage];
            this.orderShippingInfoList.forEach(pack => {
              if (this.$common.isEmpty(temporaryJson.shippingJson[pack.packageCode])) {
                temporaryList.shippingJson.push({
                  carrierName: '',
                  carrierShippingMethodName: '',
                  isOnline: null,
                  model: [],
                  orderShippingId: '',
                  shippingAccountModel: '',
                  status: false,
                });
                temporaryList.szieJson.push({ data: pack, isEdit: false, oldData: {} });
                temporaryList.buyerStatus.push(false);
                temporaryList.addressStatus.push(false);
                temporaryList.table.push([]);
                temporaryList.columns.push([]);
                temporaryList.shippingModel.push({});
                temporaryList.address.push({});
              } else {
                temporaryList.shippingJson.push(temporaryJson.shippingJson[pack.packageCode]);
                temporaryList.szieJson.push(temporaryJson.szieJson[pack.packageCode]);
                temporaryList.buyerStatus.push(temporaryJson.buyerStatus[pack.packageCode]);
                temporaryList.addressStatus.push(temporaryJson.addressStatus[pack.packageCode]);
                temporaryList.table.push(temporaryJson.table[pack.packageCode]);
                temporaryList.columns.push(temporaryJson.columns[pack.packageCode]);
                temporaryList.shippingModel.push(temporaryJson.shippingModel[pack.packageCode]);
                temporaryList.address.push(temporaryJson.address[pack.packageCode]);
              }
            });
            this.editShippingStatus = temporaryList.shippingJson;
            this.packageSzieInfo = temporaryList.szieJson;
            this.buyerWarehouseStatus = temporaryList.buyerStatus;
            this.buyerAddressModalStatus = temporaryList.addressStatus;
            this.productData = temporaryList.table;
            this.productColumnsArr = temporaryList.columns;
            this.shippingMethodModel = temporaryList.shippingModel;
            this.buyerAddressModal = temporaryList.address;
            resolve(true);
          });
        });
      }

      const startMakeNewPackage = async () => {
        const result = await makeNeworderShippingDetailList();
        if (result[0]) {
          obj.orderShippingDetailList = result[1];
          const makeNewDataResult = await makeNewOrderShippingInfoList(obj);
          if (makeNewDataResult) {
            await this.inserProductCoumnsInArr();
            const prodcutDataStatus = await makePackageProductList();
            if (prodcutDataStatus) {
              let addIndex = -1;
              this.addProductData = pptPos;
              this.orderShippingInfoList.forEach((item, index) => {
                if (item.packageCode == '新建包裹' && addIndex == -1) {
                  addIndex = index;
                }
              });
              if (addIndex == -1) {
                addIndex = this.orderShippingInfoList.length - 1;
              }
              // 新增包裹  columns
              let newPackageColumns = [
                {
                  title: '商品',
                  key: 'pictureUrl',
                  width: 400,
                  render: (h, params) => {
                    let tableItem = [this.tableImg(h, params, 'pictureUrl')];
                    const row = params.row;
                    let specsDataList = [h('span', '规格: ')];
                    let status = ''; // 状态
                    // 状态处理
                    productData.productStatus.forEach(item => {
                      if (params.row.productStatus == item.value) {
                        status = item.label
                      }
                    })
                    // 商品规格属性
                    if (row.specsData && row.specsData.length > 0) {
                      row.specsData.forEach((item, index) => {
                        specsDataList.push(h('span', {}, item.name + ': '));
                        specsDataList.push(h('span', {
                          style: {
                            // color: 'green',
                            'margin-right': `${index < (row.specsData.length - 1) ? '5' : '0'}px`
                          }
                        }, item.value));
                      })
                    }
                    tableItem.push(h('div', {
                      style: {
                        'margin-left': '10px'
                      }
                    },
                    [
                      h('div', [
                        h('span', `sku: ${row.sku}`),
                        h('span', { style: { 'marginLeft': '10px' } }, [
                          h('span', `重量(g):`),
                          h('span', { style: { 'color': '#f20' } }, ` ${params.row.productWeight || 0}`)
                        ]),
                      ]),
                      h('div', `名称: ${params.row.title ? params.row.title : params.row.cnName}`),
                      h('div', row.specsData && row.specsData.length > 0 ? specsDataList : ''),
                      h('div', [
                        h('span', '状态: '),
                        h('span', { style: { color: 'green', 'marginRight': '10px' } }, status),
                          params.row.productDeveloperUserId ? h('span', '开发员：' + params.row.productDeveloperUserId) : ''
                      ]),
                        params.row.productCategory ? h('div', '所属分类：' + params.row.productCategory) : ''
                    ]));
                    return h('div', {
                      class: 'consignment-package-product',
                    }, tableItem);
                  }
                },
                {
                  title: '商品标签',
                  key: 'productGoodsTags',
                  minWidth: 300,
                  render: (h, { row }) => {
                    if (row.productGoodsTags && row.productGoodsTags.length > 0) {
                      return (row.productGoodsTags).map((tag, i) => {
                        return h('span', {
                          class: 'product-goods-tag'
                        }, tag)
                      })
                    }
                    return h('span', {}, '');
                  }
                },
                {
                  title: '平台信息',
                  key: 'orderTransactionId',
                  minWidth: 120,
                  render: (h, params) => {
                    let optionList = [];
                    if (!this.orderTransactionRequired) {
                      optionList.push(h('Option', {
                        props: {
                          value: ''
                        },
                        nativeOn: {
                          'click': () => {
                            this.orderShippingInfoList[addIndex].orderShippingDetailList[params.index].orderTransactionId = null;
                          }
                        }
                      }, '请选择'));
                    }
                    return h('Select', {
                      props: {
                        placeholder: '请选择',
                        filterable: true,
                        transfer: true,
                        value: this.addProductData[params.index].orderTransactionId,
                        disabled: !!value.packageCode
                      },
                      on: {
                        'on-change': (event) => {
                          this.orderShippingInfoList[addIndex].orderShippingDetailList[params.index].orderTransactionId = event;
                        }
                      }
                    }, [
                      ...optionList, ...this.orderInfo.orderTransactions.map(i => {
                        let id = i.webstoreItemId || i.webstoreSku;
                        if (id) {
                          id = ',' + id;
                        } else {
                          id = '';
                        }
                        return h('Option', {
                          props: {
                            value: i.orderTransactionId
                          },
                          nativeOn: {
                            'click': () => {
                              this.orderShippingInfoList[addIndex].orderShippingDetailList[params.index].orderTransactionId = i.orderTransactionId;
                            }
                          }
                        }, i.webstoreOrderTransactionId + id);
                      })
                    ]);
                  }
                },
                {
                  title: '数量',
                  width: 90,
                  key: 'goodsQuantity',
                  render: (h, params) => {
                    // 拆包
                    if (this.upackingTalg) {
                      let list = this.originalAddOrderList;
                      let original_quantity = 0;
                      if (list.length > 0) {
                        list.map((ele) => {
                          if (ele.productGoodsId === params.row.productGoodsId) {
                            original_quantity = ele.quantity;
                          }
                        });
                      }
                      return h('div', {}, [
                        h('InputNumber', {
                          props: {
                            min: 0,
                            max: original_quantity,
                            size: 'small',
                            value: 0
                          },
                          style: {
                            width: '70px'
                          },
                          on: {
                            input: val => {
                              this.orderShippingInfoList[addIndex].orderShippingDetailList[params.index].quantity = val;
                              let copy_data = this.productData[index];
                              if (list.length > 0) {
                                list.map((ele, ids) => {
                                  if (ele.productGoodsId === params.row.productGoodsId) {
                                    copy_data[ids].goodsQuantity = original_quantity - val;
                                    copy_data[ids].quantity = original_quantity - val;
                                  }
                                });
                                this.productData[index] = copy_data;
                              }
                            }
                          }
                        })
                      ]);
                    } else {
                      return h('div', {}, [
                        h('InputNumber', {
                          props: {
                            min: 0,
                            size: 'small',
                            value: this.addProductData[params.index].goodsQuantity
                          },
                          style: {
                            width: '70px'
                          },
                          on: {
                            input: val => {
                              this.orderShippingInfoList[addIndex].orderShippingDetailList[params.index].quantity = val;
                            }
                          }
                        })
                      ]);
                    }
                  }
                },
                // {
                //   title: '库存',
                //   key: 'availableNumber',
                //   width: 150,
                //   render: (h, { row }) => {
                //     return h('div', {}, [
                //       h('p', `库存数量：${row.availableNumber || 0}`),
                //       h('p', `未发在途：${row.notOnWayNumber || 0}`),
                //       h('p', `已发在途：${row.onWayNumber || 0}`)
                //     ]);
                //   }
                // },
                {
                  title: '备注',
                  key: 'remark',
                  minWidth: 180,
                  render: (h, params) => {
                    // if (params.row.addType === 1) {
                    return h('Input', {
                      props: {
                        placeholder: '请输入发货提醒',
                        size: 'small',
                        value: this.addProductData[params.index].remark,
                        maxlength: 100
                      },
                      // style: {
                      //   width: '100px'
                      // },
                      on: {
                        input: val => {
                          this.orderShippingInfoList[addIndex].orderShippingDetailList.forEach((n, i) => {
                            if (n.variations === params.row.variations && n.webstoreItemId === params.row.webstoreItemId && !this.productServiceStatus) {
                              this.orderShippingInfoList[addIndex].orderShippingDetailList[i].remark = val;
                            } else if (n.productGoodsId === params.row.productGoodsId && this.productServiceStatus) {
                              this.orderShippingInfoList[addIndex].orderShippingDetailList[i].remark = val;
                            }
                          });
                        }
                      }
                    });
                    // }
                  }
                },
                {
                  title: '操作',
                  key: 'operateClose',
                  width: 60,
                  render: (h, params) => {
                    // if (params.row.addType === 1) {
                    return h('Icon', {
                      props: {
                        type: 'md-close-circle',
                        color: '#f00',
                        size: 20
                      },
                      class: 'cursor',
                      on: {
                        click: () => {
                          let data = JSON.parse(JSON.stringify(this.addProductData));
                          data.splice(params.index, 1);
                          this.addProductData = data;
                          this.orderShippingInfoList[addIndex].orderShippingDetailList.splice(params.index, 1);
                          if (this.addProductData.length === 0) {
                            this.orderShippingInfoList[addIndex].orderShippingDetailList = [];
                          }
                        }
                      }
                    });
                    // }
                  }
                }
              ];
              this.newPackageColumns = newPackageColumns;
            } else {
              this.addNewPackageStatus = false;
            }
          } else {
            this.addNewPackageStatus = false;
          }
        } else {
          this.addNewPackageStatus = false;
        }
      }

      startMakeNewPackage();
    },
    getProductGoodsTag(productGoodsIds) {
      let v = this;
      return new Promise(resolve => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios.post(api.get_productGoodsTag, productGoodsIds).then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
        } else {
          resolve([]);
        }
      });
    },
    // 获取商品规格属性
    getSpecifications(productGoodsIds) {
      let v = this;
      return new Promise(resolve => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios.post(api.post_queryGoodsSpecificationByIds, productGoodsIds).then(response => {
            if (response.data.code === 0) {
              resolve(response.data.datas);
            }
          });
        } else {
          resolve([]);
        }
      });
    },
    handleSubmitNewPackageQuantity(index) { // 新包裹商品数量检测
      let v = this;
      let result = true;
      return new Promise(resolve => {
        if (!v.orderShippingInfoList[index].orderShippingDetailList.length) {
          resolve(result);
        } else {
          for (let i = 0; i < v.orderShippingInfoList[index].orderShippingDetailList.length; i++) {
            let item = v.orderShippingInfoList[index].orderShippingDetailList[i];
            if (item.quantity < 1) {
              result = false;
            }
            if (i === v.orderShippingInfoList[index].orderShippingDetailList.length - 1) {
              resolve(result);
            }
          }
        }
      });
    },
    hasNoOrderMatching(valid) {
      return new Promise(resolve => {
        if (valid) {
          this.$Modal.confirm({
            title: '保存SKU信息',
            render(h, params) {
              return h('span', '出库单存在未匹配订单产品，使用线上发货物流可能会失败，是否继续');
            },
            onOk() {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    saveNewPackage(index) { // 保存新包裹
      let v = this;
      if (v.saveStatus) {
        return false;
      }
      let obj = v.deepCopy(v.orderShippingInfoList[index]);
      let newProductArr = [];
      let valid = false; // 判断是否有未匹配订单交易
      obj.orderShippingDetailList.forEach((n, i) => {
        if (n.quantity !== 0) {
          if (!n.orderTransactionId) {
            valid = true;
          }
          newProductArr.push(v.deepCopy(n));
        }
      });
      v.hasNoOrderMatching(valid).then((data) => {
        if (data) {
          v.saveStatus = true;
          obj.warehouseId = v.warehouseIdArr[index];
          obj.orderShippingDetailList = newProductArr;
          obj.orderShippingDetailList.forEach(item => {
            if (!v.$common.isEmpty(item.productLength)) {
              item.productLength = Number(item.productLength);
            }
            if (!v.$common.isEmpty(item.productWidth)) {
              item.productWidth = Number(item.productWidth);
            }
            if (!v.$common.isEmpty(item.productHeight)) {
              item.productHeight = Number(item.productHeight);
            }
          });
          delete obj.packageCode;
          delete obj.packageStatus;
          delete obj.printTime;
          delete obj.trackingNumberTime;
          if (obj.warehouseId && v.shippingMethodValue.length > 0) {
            obj.setShippingMethodOrderBo = {
              merchantCarrierId: v.shippingMethodValue[0],
              merchantShippingMethodId: v.shippingMethodValue[1],
              carrierAccountId: v.shippingAccountModel,
              packageCarrierParam: v.shippingMethodModel
            };
          }
          Promise.all([
            v.handleSubmit('orderShippingInfoList' + index, obj), v.handleSubmitNewPackageQuantity(index)
          ]).then(result => {
            if (!result[0]) {
              // v.$Message.error('地址信息不正确');
              v.saveStatus = false;
            }
            if (!result[1]) {
              v.$Message.error('商品数量不能为0');
              v.saveStatus = false;
            }
            if (result[0] && result[1]) {
              if ((obj.buyerMobile === '' || obj.buyerMobile === null) && (obj.buyerPhone === '' || obj.buyerPhone === null)) {
                v.saveStatus = false;
                v.$Spin.hide();
                v.$Message.error('手机号码和电话号码必须填一个');
                return;
              }
              // 拆包
              if (v.upackingTalg) {
                obj.originalOrderShippingId = v.originalOrderShippingList.orderShippingId;
                let data = v.originalOrderShippingList.orderShippingDetailList;
                if (data.length > 0) {
                  obj.orderShippingDetailList.map((item) => {
                    data.map((ele) => {
                      if (ele.productGoodsId === item.productGoodsId) {
                        item.originalOrderShippingDetailId = ele.orderShippingDetailId;
                      }
                    });
                    delete item.orderShippingDetailId;
                  });
                }
                obj.orderShippingDetails = obj.orderShippingDetailList;
                delete obj.orderShippingDetailList;
                v.axios.post(api.post_split, JSON.stringify(obj)).then(response => {
                  if (response.data.code === 0) {
                    v.$Message.success('操作成功');
                    v.$parent.updateStatus = true;
                    v.addNewPackageStatus = false;
                    v.upackingTalg = false;
                  } else {
                    (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
                  }
                  setTimeout(() => {
                    v.saveStatus = false;
                  }, 1000);
                }).catch(() => {
                  v.saveStatus = false;
                });
              } else {
                v.axios.post(api.create_newPackage, JSON.stringify(obj)).then(response => {
                  if (response.data.code === 0) {
                    v.$Message.success('操作成功');
                    v.$parent.updateStatus = true;
                    v.addNewPackageStatus = false;
                  } else {
                    (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
                  }
                  setTimeout(() => {
                    v.saveStatus = false;
                  }, 1000);
                }).catch(() => {
                  v.saveStatus = false;
                });
              }
            }
          }).catch(() => {
            v.saveStatus = false;
          });
        }
      });
    },
    cancelNewPackage(index) { // 取消保存新包裹
      let v = this;
      v.orderShippingInfoList.pop();
      v.addProductData = [];
      v.originalAddOrderList = [];
      v.addNewPackageStatus = false;
      v.upackingTalg = false;
      v.$parent.updateStatus = true;
    },
    resetorderShippingInfoList() { // 重置包裹
      let v = this;
      v.upackingTalg = false;
      v.axios.put(api.reset_package + '?orderId=' + v.orderDetailsId).then(response => {
        if (response.data.code === 0) {
          v.$parent.updateStatus = true;
          v.$Message.success('重置成功');
          if (v.$parent.inPage === 'combineOrder') { // 如果所在页面为合并包括时，还需重置合并列表
            this.$store.commit('combineStatus', true);
          }
        }
      });
    },
    confrimDrop() { // 删除包裹
      this.upackingTalg = false;
      if (this.dropPid === null) return false;
      this.axios.delete(`${api.drop_package}${this.dropPid}?platformId=${this.activePlatform}&orderId=${this.orderDetailsId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('删除成功');
          this.$parent.updateStatus = true;
        } else {
          this.$Message.success('删除失败');
        }
      });
      this.dropPidStatus = false;
      this.dropPid = null;
    },
    dropPackage(pid) { // 删除包裹确认
      let v = this;
      v.dropPidStatus = true;
      v.dropPid = pid;
    },
    popperShow(index) {
      this.carrierBaseSetting = [];
      this.shippingMethodValue = [];
      this.choseShippingValue = null;
      this.shippingAccountModel = '';

      // 判断是否有选择仓库
      if (this.warehouseIdArr[index] || this.orderShippingInfoList[index].warehouseId) {
        this.selectStoreStatus = true;
      } else {
        this.selectStoreStatus = false;
      }
    },
    popperHide(index) {
      this.cancelPackageSquareStatusEdit(index, 'buyerShippingMethodModalStatus');
      this.carrierBaseSetting = [];
      this.shippingMethodValue = [];
      this.choseShippingValue = null;
      this.shippingAccountModel = '';
    },
    cancelThisShppingMethod(index) {
      this.shippingPopTip.splice(index, 1, false);
      this.popperHide();
    },
    saveThisShippingMethod(pid, index) { // 更换单个邮寄方式
      if (!this.shippingMethodValue[0]) {
        this.$Message.error('请选择实际发货物流方式');
        return false;
      }
      if (this.$common.isEmpty(this.shippingAccountModel) && this.isOnlineShip === 0 && !this.isPms) {
        this.$Message.error('帐号不能为空');
        return false;
      }
      this.saveShippingLoading = true;
      let obj = {
        orderShippingId: pid,
        merchantCarrierId: this.shippingMethodValue[0],
        merchantShippingMethodId: this.shippingMethodValue[1],
        packageCarrierParam: this.shippingMethodModel,
        carrierAccountId: this.shippingAccountModel,
        platformId: this.activePlatform,
        orderId: this.orderDetailsId
      };
      if (this.isOnlineShip === 1) {
        delete obj.carrierAccountId;
      }
      this.$Spin.show();
      this.axios.put(api.update_singleShippingMethod, JSON.stringify(obj)).then(response => {
        this.$Spin.hide();
        this.isOnlineShip = 0;
        this.isPms = false;
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.shippingPopTip.splice(index, 1, false);
          this.popperHide();
          this.$parent.updateStatus = true;
        } else {
          this.popperHide();
          this.$Message.error('操作失败，请重新尝试')
        }
        this.$nextTick(() => {
          this.saveShippingLoading = false;
        });
      }).catch(() => {
        this.isOnlineShip = 0;
        this.isPms = false;
        this.$nextTick(() => {
          this.saveShippingLoading = false;
        });
        this.shippingPopTip.splice(index, 1, false);
        this.popperHide();
      });
    },
    // 获取可用的物流方式
    getLogisticsListData (shippingId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(shippingId)) return resolve({ state: 'finally', data: [] });
        if (!this.$common.isEmpty(this.logisticsJson[shippingId])) return resolve({ state: 'finally', data: this.logisticsJson[shippingId] });
        this.axios.post(api.get_analysisLogistics, {
          orderShippingId: shippingId,
          onlyPlatform: '0',
          merchantCarrierIdList: [],
          merchantShippingMethod: '',
          isLimit: null
        }).then((res) => {
          if (res && res.data && res.data.code === 0) {
            this.logisticsJson[shippingId] = res.data.datas;
          }
          resolve({ state: 'finally', data: res.data.datas });
        }).catch(() => {
          resolve({ state: 'finally', data: [] });
        });
      })
    },
    // 过滤下拉树的物流方式
    filterTreeShippingMethod (data, callback) {
      const usableId = this.$common.arrRemoveRepeat((this.logisticsJson[this.choseOrderShippingId] || []).map(m => m.shippingMethodId));
      let newData = [];
      let childList = [];
      (data || []).forEach(item => {
        if (item.carrierShippingMethods && item.carrierShippingMethods.length > 0) {
          childList = item.carrierShippingMethods.filter(f => usableId.includes(f.shippingMethodId));
          if (childList.length > 0) {
            newData.push({
              ...item,
              carrierShippingMethods: childList
            });
          }
        }
      });
      callback && callback(newData);
    },
    editPackageSquareStatus(index, target) { // target 包裹编辑的内容识别符
      this.warehouseIdArr = [];
      if (this.orderDetailsData.orderShippingInfoList && this.orderDetailsData.orderShippingInfoList[index]) {
        this.choseOrderShippingId = this.orderDetailsData.orderShippingInfoList[index].orderShippingId || '';
      }
      if (this.orderShippingInfoList.length > 0) {
        this.orderShippingInfoList.map((item, index) => {
          this.warehouseIdArr.push(item.warehouseId);
        });
      }
      if (this.buyerWarehouseStatus[index]) {
        this.$Message.error('请先完成仓库操作');
        return false;
      }

      if (target === 'buyerShippingMethodModalStatus') {
        this.shippingMethodModalLoading = true;
        this.getLogisticsListData(this.choseOrderShippingId).finally(() => {
          this.shippingMethodModalLoading = false;
        });
        this.choseShippingIndex = index;
        this.isPms = false;
        this.isOnlineShip = 0;
        this.shippingPopTip.splice(index, 1, true);
        this.$nextTick(() => {
          setTimeout(() => {
            this.shippingPopTip.splice(index, 1, true);
            setTimeout(() => {
              this.shippingPopTip.splice(index, 1, true);
              setTimeout(() => {
                this.shippingPopTip.splice(index, 1, true);
              }, 150)
            }, 150)
          }, 150)
        })
        this.selectStore = this.warehouseIdArr[index];
      } else {
        this[target].splice(index, 1, true);
      }
    },
    updateWarehouseId(orderShippingId, index) {
      let v = this;
      if (v.warehouseId === null) {
        v.$Message.error('请选择仓库');
        return false;
      }
      let obj = {
        platformId: this.activePlatform,
        orderId: this.orderDetailsId,
        orderShippingId: orderShippingId,
        warehouseId: v.warehouseIdArr[index]
      };
      v.$Spin.show();
      v.axios.put(api.updateOrderShippingInfo_warehouse, JSON.stringify(obj)).then(response => {
        v.$Spin.hide();
        if (response.data.code === 0) {
          v.$parent.updateStatus = true;
          v.$Message.success('修改成功');
          v.cancelPackageSquareStatusEdit(index, 'buyerWarehouseStatus');
        } else {
          v.$Message.error('修改失败');
        }
      });
      v.selectStore = v.warehouseIdArr[index];
    },
    handleSubmit(name, obj) {
      let v = this;
      return new Promise(resolve => {
        if (obj && (obj.buyerCity === '' || obj.buyerState === null) && (obj.buyerState === '' || obj.buyerCity === null)) {
          v.$Message.error('城市和省份不能同时为空');
          resolve(false);
        }
        v.$refs[name][0].validate((valid) => {
          if (valid) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    },
    editAddressSave(index) { // 编辑地址
      let obj = this.deepCopy(this.buyerAddressModal[index]);
      let refs = 'buyerAddressModal' + index;
      // this.$Spin.show();
      this.handleSubmit(refs, obj).then(result => {
        if (result) {
          if ((obj.buyerMobile === '' || obj.buyerMobile === null) && (obj.buyerPhone === '' || obj.buyerPhone === null)) {
            this.saveStatus = false;
            this.$Spin.hide();
            this.$Message.error('手机号码和电话号码必须填一个');
            return;
          }
          let paramsObj = obj;
          paramsObj.orderDetailsId = this.orderDetailsId;
          paramsObj.platformId = this.activePlatform;
          // paramsObj.orderDetailsId = `${this.accountCode}-${this.orderInfo.salesRecordNumber}`;
          this.axios.put(api.update_packageAddress, JSON.stringify(paramsObj)).then(response => {
            this.$Spin.hide();
            if (response.data.code === 0) {
              this.$parent.updateStatus = true;
              this.$Message.success('修改成功');
              this.cancelPackageSquareStatusEdit(index, 'buyerAddressModalStatus');
            } else if (response.data.code === 110230) {
              this.$Message.error('更新发货系统出库单地址异常')
            } else {
              this.$Message.error('操作失败，请重新尝试')
            }
          });
        }
      });
    },
    // 获取 yms 云仓库存
    getYMSInventory(data) {
      this.ymsInventoryData = {};
      return new Promise((resolve) => {
        if (this.$common.isEmpty(data)) {
          this.productData = data;
          return resolve({ fail: true });
        }
        let awaitRes = {};
        data.forEach(item => {
          if (!this.$common.isEmpty(item)) {
            item.forEach((info) => {
              if (!this.$common.isEmpty(info.warehouseId)) {
                if (this.$common.isEmpty(awaitRes[info.warehouseId])) {
                  awaitRes[info.warehouseId] = [info.productGoodsId];
                } else {
                  awaitRes[info.warehouseId].push(info.productGoodsId);
                }
              }
            })
          }
        });
        if (this.$common.isEmpty(awaitRes)) {
          this.productData = data;
          return resolve({ fail: true });
        }
        const allRes = Object.keys(awaitRes).map((key) => {
          return () => {
            // 固定传 inventoryTypeList: ['SUPPLIER', 'YMS'];
            this.queryYMSInventory({
              warehouseId: key,
              productGoodsIdList: awaitRes[key],
              inventoryTypeList: ['SUPPLIER', 'YMS']
            })
          }
        });
        this.$common.promiseAll(allRes).finally(() => {
          this.productData = data;
          resolve({ fail: false });
        });
      })
    },
    // 请求对应仓库YMS的仓库
    queryYMSInventory(params) {
      return new Promise((resolve) => {
        this.axios.post(api.queryYMSInventory, params).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve({ fail: true });
          this.$set(this.ymsInventoryData, params.warehouseId, res.data.datas || []);
          resolve({ fail: false, data: res.data.datas || [] });
        }).catch(() => {
          resolve({ fail: true });
        });
      })
    },
    cancelPackageSquareStatusEdit(index, target) {
      let v = this;
      v[target].splice(index, 1, false);
    },
    setCommonAddress(type, index, packageType) {
      let v = this;
      let item = v.buyerAddressModal[index];
      if (packageType === 'add') {
        item = v.orderShippingInfoList[index];
      }
      if (type !== 'palpay') {
        item.buyerName = v.orderInfo.buyerName;
        item.buyerMobile = v.orderInfo.buyerMobile;
        item.buyerPhone = v.orderInfo.buyerPhone;
        item.buyerEmail = v.orderInfo.buyerEmail;
        item.buyerAddress1 = v.orderInfo.buyerAddress1;
        item.buyerAddress2 = v.orderInfo.buyerAddress2;
        item.buyerCity = v.orderInfo.buyerCity;
        item.buyerState = v.orderInfo.buyerState;
        item.buyerPostalCode = v.orderInfo.buyerPostalCode;
        item.buyerPassportCode = v.orderInfo.buyerPassportCode;
        item.buyerCountryCode = v.orderInfo.buyerCountryCode;
      } else {
        if (v.orderDetailsData.platformFeatures.length > 1) {
          item.buyerName = v.orderDetailsData.platformFeatures[0].buyerName;
          item.buyerMobile = v.orderDetailsData.platformFeatures[0].buyerMobile;
          item.buyerPhone = v.orderDetailsData.platformFeatures[0].buyerPhone;
          item.buyerEmail = v.orderDetailsData.platformFeatures[0].buyerEmail;
          item.buyerAddress1 = v.orderDetailsData.platformFeatures[0].buyerAddress1;
          item.buyerAddress2 = v.orderDetailsData.platformFeatures[0].buyerAddress2;
          item.buyerCity = v.orderDetailsData.platformFeatures[0].buyerCity;
          item.buyerState = v.orderDetailsData.platformFeatures[0].buyerState;
          item.buyerPostalCode = v.orderDetailsData.platformFeatures[0].buyerPostalCode;
          item.buyerPassportCode = v.orderDetailsData.platformFeatures[0].buyerPassportCode;
        } else {
          v.$Message.error('否');
        }
      }
    },
    editProduct(index) {
      let v = this;
      let item = {
        title: '操作',
        key: 'operateClose',
        width: 60,
        render: (h, params) => {
          if (v.editProductStatus[params.row.group] && params.row.orderId === v.orderInfo.orderId && params.row.addType !== 1) {
            return h('Icon', {
              props: {
                type: 'md-close-circle',
                color: '#f00',
                size: 20
              },
              class: 'cursor',
              on: {
                click: () => {
                  let item = v.catchProductData[params.row.group][params.index];
                  let productItem = v.productData[params.row.group];
                  let orderSalesRecordNumber = item.orderSalesRecordNumber;
                  if ([...new Set(v.catchProductData[params.row.group].map(i => i.orderSalesRecordNumber))].length > 0) {
                    // 多个订单
                    let len = v.catchProductData[params.row.group].filter(i => i.orderSalesRecordNumber === orderSalesRecordNumber).length;
                    if (len === 1) {
                      v.$Message.error('发货信息不能为空，合并订单如需抽离，请使用“单独发货');
                      return;
                    }
                  }

                  if (item.rowSpan === 1) {
                    v.$Message.error('单个订单下不能删除该产品');
                    return false;
                  }

                  if (item.hasOwnProperty('rowSpan')) {
                    v.catchProductData[params.row.group].every((n, i) => {
                      if (orderSalesRecordNumber === n.orderSalesRecordNumber && !n.hasOwnProperty('rowSpan')) {
                        n.rowSpan = item.rowSpan - 1;
                        productItem[i].rowSpan = item.rowSpan - 1;
                        return false;
                      } else {
                        return true;
                      }
                    });
                  } else {
                    v.catchProductData[params.row.group].every((n, i) => {
                      if (orderSalesRecordNumber === n.orderSalesRecordNumber && n.hasOwnProperty('rowSpan')) {
                        n.rowSpan--;
                        productItem[i].rowSpan--;
                        return false;
                      }
                    });
                  }

                  // 这里有问题,不能两个都删除，否则会一次删除两个，所以第二个改为赋值
                  v.catchProductData[params.row.group].splice(params.index, 1);
                  // v.productData[params.row.group].splice(params.index, 1);
                  v.getYMSInventory(v.catchProductData);
                }
              }
            });
          }
        }
      };
      v.productColumnsArr[index].push(item);
      v.editProductStatus.splice(index, 1, true);
    },
    cancelProductEdit(index) {
      this.removeOperateClose(index);
      this.resetOrderPackage();
      this.$nextTick(() => {
        this.startMakeOrderShippingInfo();
        this.editProductStatus.splice(index, 1, false);
      });
    },
    removeOperateClose(index) {
      if (JSON.stringify(this.productColumnsArr[index]).indexOf('operateClose') >= 0) {
        this.productColumnsArr[index].splice(this.productColumnsArr[index].length - 1, 1);
      }
    },
    handleSubmitEditPackageQuantity(index) { // 新包裹商品数量检测
      return new Promise((resolve, reject) => {
        if (this.$common.isEmpty(this.catchProductData) || this.$common.isEmpty(this.catchProductData[index])) {
          this.$Message.error('包裹产品不能为空');
          return reject(new Error('包裹产品不能为空'));
        }
        const getItemInfo = this.catchProductData[index].find(item => item.quantity < 1);
        resolve(this.$common.isEmpty(getItemInfo));
      });
    },
    editProductSave(index) {
      let valid = false; // 判断是否有未匹配订单交易
      let emptyPlatformInfo = [];
      let obj = this.deepCopy(this.catchProductData[index]);
      (obj || []).forEach((n, i) => {
        if (this.$common.isEmpty(n.webstoreOrderTransactionId)) {
          emptyPlatformInfo.push(n);
          if (n.quantity !== 0) {
            valid = true;
          }
        }
      });
      if (this.orderTransactionRequired && !this.$common.isEmpty(emptyPlatformInfo)) {
        this.$Message.error('商品的 “平台信息” 存在漏填，请补充完全');
        return;
      }
      this.hasNoOrderMatching(valid).then(data => {
        if (data) {
          obj.orderShippingId = this.orderShippingInfoList[index].orderShippingId;
          this.handleSubmitEditPackageQuantity(index).then(result => {
            if (result) {
              this.axios.put(`${api.update_packageDetails}?platformId=${this.activePlatform}&orderId=${this.orderDetailsId}`, JSON.stringify(obj)).then(response => {
                if (response.data.code === 0) {
                  this.$Message.success('修改成功');
                  this.$parent.updateStatus = true;
                  this.getYMSInventory(this.deepCopy(this.catchProductData));
                }
              });
              this.removeOperateClose(index);
              this.editProductStatus.splice(index, 1, false);
            } else {
              this.$Message.error('商品数量不能为0');
            }
          });
        }
      });
    },
    getStepTime(item) {
      // 步骤时间
      if (item) {
        return this.getDataToLocalTime(item, 'fulltime');
      } else {
        return '';
      }
    },
    getThreeCurrent(data = [], index) {
      // let pos = [
      //   this.orderShippingInfoList[index].packageCreatedTime,
      //   this.orderShippingInfoList[index].trackingNumberTime,
      //   this.orderShippingInfoList[index].despatchTime
      // ];
      // return pos.reduce((i, j) => {
      //   return j ? ++i : i;
      // }, -1);
      const row = data[index] || {};
      if (row.packageCreatedTime) {
        if (row.trackingNumberTime) {
          if (row.despatchTime) {
            return 2
          } else {
            if (row.carrierPackageStatus === 'INV_ERROR') {
              return 2
            } else {
              return 1
            }
          }
        } else {
          return 0
        }
      } else {
        return -1
      }
    },
    getCurrent (data, index) {
      const row = data[index] || {};
      if (row.isYms == 1) {
        return this.ymsProcess(row);
      }
      // if (!this.$common.isEmpty(row.distributionLogisticsMsg)) return 4;
      let pos = [];
      let l = 6;
      pos = [
        this.getDataToLocalTime(row.packageCreatedTime, 'fulltime'), // 创建
        row.pickingTime, // 分配
        row.getLabelTime, // 下发物流
        row.packageGoodsStatus, // 拣货1， 2未拣货
        this.getDataToLocalTime(row.printTime, 'fulltime'), // 打印
        this.getDataToLocalTime(row.despatchTime, 'fulltime') // 结束
      ];
      for (let i = 0; i < pos.length; i++) {
        if (i === 3) { // 如果没有拣货
          if (pos[i] !== 1) l--;
        } else {
          if (!pos[i]) l--;// 其他如果没有
        }
      }
      return l - 1;
    },
    ymsProcess(row) {
      let pos = [
        this.getDataToLocalTime(row.packageCreatedTime, 'fulltime'), // 创建
        row.getLabelTime, // 下发物流
        row.ymsTrackingNumberStatus, // 下发云仓
        row.packageGoodsStatus, // 拣货1， 2未拣货
        this.getDataToLocalTime(row.printTime, 'fulltime'), // 打印
        this.getDataToLocalTime(row.despatchTime, 'fulltime') // 结束
      ];
      // 已拣货、已打印都点亮，包裹直接跳到已发货的状态（只要获取到发货时间及发货状态，是否已拣货、已打印都不重要）
      let step = null;
      pos.forEach((item, key) => {
        if (key === 3) { // 如果没有拣货
          if (item == 1) step = key;
        } else if (key === 2) {
          if (item == 3) step = key;
        } else {
          if (item) step = key;
        }
      })
      return step;
    },
    editShipping(index) {
      let v = this;
      v.editShippingStatus[index].status = true;
    },
    cancelShipping(index) {
      let v = this;
      v.editShippingStatus[index].status = false;
    },
    separateDelivery() {
      let v = this;
      v.axios.put(api.individual_delivery + '?orderId=' + v.orderDetailsId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.$parent.updateStatus = true;
          if (v.$parent.inPage === 'combineOrder') { // 如果所在页面为合并包括时，还需重置合并列表
            this.$store.commit('combineStatus', true);
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    vaildatorUserEmpty() {
      let userEmpty = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入姓名'));
        } else {
          callback();
        }
      };
      return userEmpty;
    },
    vaildatorBuyerPhoneEmpty() {
      let v = this;
      let isPhone = v.$regular.enterPhone;
      let userEmpty = (rule, value, callback) => {
        if (value !== '' && (!isPhone.test(value))) {
          callback(new Error('电话号码格式不正确'));
        } else {
          callback();
        }
      };
      return userEmpty;
    },
    vaildatorDetailsAddressEmpty() {
      let addressEmpty = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入详细地址'));
        } else {
          callback();
        }
      };
      return addressEmpty;
    },
    vaildatorAddressCity() {
      let cityEmpty = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入城市名'));
        } else {
          callback();
        }
      };
      return cityEmpty;
    },
    vaildatorAddressCode() {
      let addressCodeEmpty = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入邮政编码'));
        } else {
          callback();
        }
      };
      return addressCodeEmpty;
    },
    vaildCityAndState() {
      let state = (rule, value, callback) => {
        callback(new Error('城市和省份不能同时为空'));
      };
      return state;
    },
    addProductSave(index, val) { // 产品  添加
      let v = this;
      v.curIndex = index;// 记录当前包裹下标
      if (val) { // 0 添加包裹时 1 原有包裹添加
        v.productListData = v.catchProductData[index];
      } else {
        v.productListData = v.addProductData;
      }
      // v.productListData = v.catchProductData[index];
      v.$refs.matchingGoodsModal.chioseIndex = index;
      v.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      v.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    editData (val) { // 接收子组件传值
      let platformUrlMap = {};
      val.forEach(m => {
        if (this.$common.isEmpty(m.productUrl)) {
          if (!this.$common.isEmpty(m.platformUrlMap)) {
            platformUrlMap = m.platformUrlMap;
            delete m.platformUrlMap;
            m.productUrl = platformUrlMap[this.activePlatform] || '';
          }
          m.productUrl = '';
        }
      });
      if (this.addNewPackageStatus) { // 新增包裹 添加产品
        this.addProductData = val;
        this.orderShippingInfoList[this.orderShippingInfoList.length - 1].orderShippingDetailList = val;
      } else {
        // 原有包裹
        val.forEach((n, i) => {
          if (!n.hasOwnProperty('orderShippingId')) {
            n.orderShippingId = this.orderShippingInfoList[this.curIndex].orderShippingId;
          }
          // 合并包裹，显示订单号
          if (!n.hasOwnProperty('salesRecordNumber')) {
            n.salesRecordNumber = this.orderInfo.salesRecordNumber;
            n.orderSalesRecordNumber = this.orderInfo.salesRecordNumber;
          }
        });
        this.catchProductData[this.curIndex] = val;
        this.productData[this.curIndex] = val;
      }
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
      this.$refs.matchingGoodsModal.matchingGoodsList = [];
      this.$refs.matchingGoodsModal.chioseList1 = [];
      this.$refs.matchingGoodsModal.chioseList2 = [];
    },
    cancelPackage(orderShippingId) {
      this.axios.delete(`${api.drop_package}${orderShippingId}?platformId=${this.activePlatform}&orderId=${this.orderDetailsId}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('删除成功');
          this.$parent.updateStatus = true;
        }
      });
    },
    setSelectStore (warehouseId) {
      this.selectStore = warehouseId;
      this.shippingMethodValue = [];
      this.choseShippingValue = null;
      this.shippingAccountModel = '';
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];
    },
    getAccountApi (data, index) {
      if (this.choseShippingIndex != index) return;
      let value = [];
      let selectedData = [];
      if (!this.$common.isEmpty(data.carrierId)) {
        this.shippingMethodValue = [data.carrierId, data.shippingMethodId];
        value = [data.carrierId, data.shippingMethodId];
        selectedData = [data.parentNode, data.choseNode];
      }
      this.carrierAccount = [];
      this.shippingAccountModel = '';
      this.carrierBaseSetting = [];
      this.shippingMethodModel = [];
      this.apiInterfaceStatus = null;
      this.isOnlineShip = 0;
      this.isPms = false;
      if (value.length === 0) return false;
      const pmsInfo = selectedData.find(fin => {
        return [0, '0'].includes(fin.isPms)
      });
      // 是否 pms
      this.isPms = !this.$common.isEmpty(pmsInfo);
      this.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG)的时候，不显示账号
      this.isOnlineShip = selectedData[0].isOnline; // 1 线上发货
      this.getCarrierBaseSettingApi(value[1]);
      if (!this.$common.isEmpty(value[1])) {
        if (selectedData[1].carrierAccounts && selectedData[1].carrierAccounts.length == 1) {
          this.shippingAccountModel = selectedData[1].carrierAccounts[0].carrierAccountId;
        }
        this.carrierAccount = selectedData[1].carrierAccounts;
      }
    },
    getCarrierBaseSettingApi(shippingMethodId, model) {
      let v = this;
      v.axios.get(api.get_shippingMethodParamsApi + '?shippingMethodId=' + shippingMethodId + '&time=' + new Date().getTime() + Math.random() * 100).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            if (model) {
              v[model].push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            } else {
              v.shippingMethodModel.push({
                paramKey: n.paramKey,
                paramValue: n.paramValue,
                title: n.paramName
              });
            }
          });
          v.carrierBaseSetting = data;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    }, // 开启查看可用仓库弹窗
    availableWarehousesBtn(index) {
      this.currentIndex = index;
      this.$refs.availableWarehouses.availableWarehouses = true;
    }, // 关闭查看可用仓库弹窗
    changeWarehouses(value, index) {
      this.$refs.availableWarehouses.availableWarehouses = value;
    }, // 开启物流方式弹窗
    analysisLogisticsBtn(index) {
      if (this.warehouseIdArr[index] != null) {
        this.currentIndex = 99;// 加这个是为了打开前更新一下物流方式
        this.$nextTick(() => {
          this.currentIndex = index;
          this.$refs.analysisLogistics.analysisLogistics = true;
        })
      } else {
        this.$Message.error('请先完成仓库操作');
        return false;
      }
    }, // 关闭物流方式弹窗
    changeLogistics(value) {
      this.$refs.analysisLogistics.analysisLogistics = value;
    }, // 监听子组件的更新仓库
    selectWarehouse(obj, index) {
      let v = this;
      v.$Spin.show();
      v.$refs.availableWarehouses.availableWarehouses = false;
      v.axios.put(api.updateOrderShippingInfo_warehouse, JSON.stringify({
        ...obj,
        platformId: this.activePlatform,
        orderId: this.orderDetailsId
      })).then(response => {
        v.$Spin.hide();
        if (response.data.code === 0) {
          v.$parent.updateStatus = true;
          v.$Message.success('修改成功');
          v.cancelPackageSquareStatusEdit(index, 'buyerWarehouseStatus');
        } else {
          v.$Message.error('修改失败');
        }
      });
      v.selectStore = v.warehouseIdArr[index];
    },

    // 监听子组件更新订单详情的数据
    updateDetailsData(value) {
      this.$parent.updateStatus = value;
    },
    switchChange() {
      this.switchTalg = !this.switchTalg;
    },
    changeCollapse(data) {
      if (data.length > 0) {
        if (data.length === this.orderShippingInfoList.length) {
          this.switchTalg = true;
        }
      } else {
        this.switchTalg = false;
      }
    },
    // 开启包裹尺码编辑 packageInfo_modifyDimensions
    openPackageSzieEdit (oldData, data, key) {
      this.$set(data, 'oldData', this.$common.copy(oldData));
      this.$set(data, key, true);
    },
    // 取消包裹尺码编辑
    cancelPackageSzieEdit (data, key) {
      this.$set(data, 'data', this.$common.copy(data.oldData));
      this.$set(data, key, false);
    },
    // 保存(更新)包裹尺码数据
    savePackageSzieEdit (formRef, data, key) {
      this.$refs[formRef][0].validate((valid) => {
        if (!valid) return;
        this.$set(data, 'loading', true);
        this.axios.put(api.updatePackageSize, {
          length: Number(data.data.length),
          width: Number(data.data.width),
          height: Number(data.data.height),
          orderShippingId: data.data.orderShippingId
        }).then(response => {
          if (response && response.data && response.data.code === 0) {
            this.$parent.updateStatus = true;
            this.$set(data, key, false);
            this.$Message.success('修改成功');
          }
        }).finally(() => {
          this.$set(data, 'loading', false);
        })
      })
    },
    // 下发物流内容(type:1 显示内容 2 移动显示内容)
    getLogistingContent(data, type) {
      let flag = data.trackingNumberTime || data.getLabelTime;// 有时间说明该步骤已经成功则不显示异常原因
      if (flag) return;

      let str = '';
      // wmsOrderFailReasonOrder 实际就是详情接口中的 wmsOrderFailReasons 里面的对象
      let { abnormalMessage } = data.wmsOrderFailReasonOrder;
      if (abnormalMessage) str = abnormalMessage;
      if (type === 1) return str && str.substr(0, 30);
      if (type === 2) return str;
    }
  }
};
</script>
<style lang="less" scoped>
@orderLeftWidth: 100px; // 订单详情左侧宽度
.text-error{
  color: #f20;
}
.consignment-package {
  &.modalItem {
    display: flex;
    margin: 0;
    padding-top: 15px;
    border: none;

    :deep(.ivu-input),
    :deep(.ivu-select-input),
    :deep(.ivu-btn),
    :deep(.ivu-table),
    :deep(.ivu-checkbox-wrapper) {
      font-size: 13px;
    }

    .modalItemHeader {
      height: auto;
      width: @orderLeftWidth;
      border: none;
      background: none;
    }

    .main-label {
      width: @orderLeftWidth;
      padding: 0 5px;
      font-size: 14px;
      font-weight: bold;
    }

    .package-collapse {
      margin-left: 0px;
      width: calc(100% - @orderLeftWidth);
      border: none;
    }

    .switch_style {
      margin-left: 20px;
      cursor: pointer;
      color: #2184ed;
    }

    :deep(.ivu-collapse-header) {
      display: flex;
      height: auto;
      align-items: center;

      i {
        color: #2d8cf0;
        font-size: 20px;
      }
    }

    .delivery_package_box_item {
      margin-bottom: 15px;
      padding: 0;
      border: 1px solid #E8EAEC;

      :deep(.ivu-collapse-header) {
        border: none;
      }

      .package_box {
        display: flex;
        width: 100%;
        justify-content: space-between;
        align-items: center;
        padding-right: 10px;
        box-sizing: border-box;
        cursor: auto;
        user-select: text;
        -moz-user-select: text;
        -webkit-user-select: text;
        -ms-user-select: text;

        .left_box {
          font-size: 14px;
          color: #2184ed;

          .copyIcon {
            font-size: 20px;
            color: #2184ed;
            z-index: 1000;
            margin-right: 10px;
          }
        }

        .right_box {
          display: flex;
          padding-right: 0;
          align-items: center;
          z-index: 99;
        }
      }
    }

    .package-status {
      margin-left: 10px;
      color: #666;
    }

    .orderProcess {
      margin: 0 0 0 auto;
      flex: 100;
      padding: 0 15px 0 30px;
      min-height: 60px;
      max-width: 850px;

      // border-bottom: 1px solid #dcdee2;
      .ivu-steps-item {
        overflow: initial;
        flex: 100;
      }
    }

    :deep(.ivu-collapse-content) {
      padding: 0;
    }

    .packageDetails {
      margin: 10px 0 0 0;

      .packageDetailsSquare {
        padding: 0 5px 0 10px;
        border: none;
      }

      .flexBox-middle {
        padding: 0 5px;
      }

      .flexBox-right {
        padding: 0 10px 0 5px;
      }
    }
  }

  .btn-edit-groud {
    margin-top: 15px;
    padding-right: 10px;
    text-align: right;
  }

  :deep(.consignment-package-product) {
    display: flex;
    align-items: center;
  }

  :deep(.product-goods-tag) {
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 5px;
    padding: 1px 5px;
    border-radius: 5px;
    // color: #000;
    background: rgba(#000, 0.05);

    &:last-child {
      margin-right: 0;
    }
  }
}

.eye-icon {
  margin-left: 10px;
  font-size: 14px;
  cursor: pointer;
}

.wms-log {
  margin-right: 15px;
}

.pointer-font {
  cursor: pointer;
  color: #2828ff;
  text-decoration: underline;
  text-underline-position: under;

  &.wms-log {
    word-break: keep-all;
    background: #fff;
  }
}

.processHeight {
  height: 35px;
}

.processHeight .ivu-steps .ivu-steps-custom .ivu-steps-title,
.processHeight .ivu-steps .ivu-steps-custom .ivu-steps-content {
  display: none !important;
}

:deep(.ivu-steps) {
  .ivu-steps-main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    left: calc(-50% + 11px);

    // left: -44px;
    // width: 115px;
    .ivu-steps-title {
      margin: 0;
      padding: 0;
      font-size: 12px;
      text-align: center;
    }

    .ivu-steps-content {
      text-align: center;
      margin: 0;
      padding: 0;
      font-size: 12px;
    }
  }
}
.package-szie-form{
  padding: 0 10px;
  :deep(.ivu-form-item) {
    .ivu-form-item-label{
      padding-right: 5px;
    }
    .ivu-form-item-content{
      display: flex;
      .ivu-input-wrapper{
        padding-right: 5px;
      }
    }
  }
}
.failresonSty {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  color: red;
  word-break: break-all;
}
.flex-items-center{
  align-items: center;
}
.form-content-txt{
  margin-bottom: 0;
}
.specification-tooltip{
  .specification-label{
    color: #3399ff;
    cursor: pointer;
  }
}
</style>
