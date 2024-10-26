<template>
  <div>
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :handleTable="false">
                <Form-item label="平台" prop="chosePlatform" v-if="isAllplatform">
                  <dyt-select v-model="chosePlatform" placeholder="请选择平台" @valueChange="platformChange">
                    <Option v-for="(item, index) in platformGroupList" :key="index" :value="item.platformId"
                      :label="item.name" />
                  </dyt-select>
                </Form-item>
                <Form-item label="店铺" prop="saleAccountIds" v-if="searchKey.includes('saleAccountIds')">
                  <dytStoreSelect v-model="pageParams.saleAccountIds" :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }" placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开" :disabled="isAllplatform && $common.isEmpty(chosePlatform)" />
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="searchKey.includes('tagIdList') && !isAllplatform">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :label="item.tagName" />
                  </dyt-select>
                </Form-item>
                <Form-item label="付款时间" prop="payTime" v-if="searchKey.includes('payTime')">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate"
                    @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm" :options="dateOptions"
                    placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="标签" prop="tagIdList" v-if="searchKey.includes('tagIdList') && isAllplatform">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :label="item.tagName" />
                  </dyt-select>
                </Form-item>
                <Form-item label="发货状态" prop="isDeliveryList" v-if="searchKey.includes('isDeliveryList')">
                  <dyt-select v-model="pageParams.isDeliveryList" :max-tag-count="1" multiple placeholder="请选择">
                    <Option v-for="item in shippingStatusList" :key="`isDelivery-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="订单号" prop="orderNo" v-if="searchKey.includes('orderNo')">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号分隔"
                    v-model="pageParams.orderNo"></dyt-input-tag>
                </Form-item>
                <Form-item label="交易渠道订单号" prop="webstoreOrderIds" v-if="searchKey.includes('webstoreOrderIds')">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请輸入交易渠道订单号,多个用逗号分隔"
                    v-model="pageParams.webstoreOrderIds"></dyt-input-tag>
                </Form-item>
                <Form-item label="Prime订单" prop="amazonIsPrime" v-if="searchKey.includes('amazonIsPrime')">
                  <dyt-select v-model="pageParams.amazonIsPrime" clearable>
                    <Option v-for="item in yesOrNot" :key="`amazonIsPrime-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="退款时间" prop="refundTime" v-if="searchKey.includes('refundTime')">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="refundResetData"
                    @on-change="refundGetDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions" placement="bottom-start" placeholder="选择日期" :value="refundTimeArr">
                  </Date-picker>
                </Form-item>
                <Form-item label="商品状态" prop="productStatus" v-if="searchKey.includes('productStatus')">
                  <dyt-select v-model="pageParams.productStatus" placeholder="请选择商品状态">
                    <Option v-for="(item, index) in productStatuList" :value='item.value' :key="`status-${index}`">
                      {{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="SPU/SKU" prop="webstoreSku" v-if="searchKey.includes('webstoreSku')">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入SPU/SKU,多个用逗号分隔"
                    v-model="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item label="映射商品编码" prop="mapperSkuList" v-if="searchKey.includes('mapperSkuList')">
                  <dyt-input-tag type="textarea" :limit="1" placeholder="请输入主映射商品的映射编码(支持查询多个，用逗号或换行分隔)"
                    v-model.trim="pageParams.mapperSkuList" />
                </Form-item>
                <Form-item label="ItemID" prop="webstoreItemId" v-if="searchKey.includes('webstoreItemId')">
                  <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="请输入平台产品编码,多个逗号或换行分隔"
                    v-model.trim="pageParams.webstoreItemId" />
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList" v-if="searchKey.includes('buyerCountryCodeList')">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                    multiple placeholder="请选择或输入所在地" :selectInvert="true" :option="formValidate.country"
                    :replaceKey="{ value: 'twoCode', label: 'enName' }" />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName" v-if="searchKey.includes('buyerName')">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId" v-if="searchKey.includes('buyerAccountId')">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="买家类型" prop="amazonIsBusinessOrder" v-if="searchKey.includes('amazonIsBusinessOrder')">
                  <dyt-select v-model="pageParams.amazonIsBusinessOrder" clearable>
                    <Option v-for="(item, index) in buyerTypeList" :key="index" :value="item.value">{{ item.type }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="金额范围" prop="currency" :rules="priceAuth" v-if="searchKey.includes('currency')">
                  <dyt-input style="width:80px" placeholder="最小金额" v-model.trim="pageParams.minTotalPrice"></dyt-input>
                  <span>-</span>
                  <dyt-input style="width:80px" placeholder="最大金额" v-model.trim="pageParams.maxTotalPrice"></dyt-input>
                  <dyt-select style="width:100px;margin-left: 5px;" v-model="pageParams.currency">
                    <Option value="USD">美元</Option>
                    <Option value="AUD">澳元</Option>
                    <Option value="CAD">加拿大元</Option>
                    <Option value="CNY">人民币</Option>
                    <Option value="EUR">欧元</Option>
                    <Option value="GBP">英镑</Option>
                    <Option value="MXN">墨西哥元</Option>
                    <Option value="MYR">马来西亚林吉特</Option>
                    <Option value="PHP">菲律宾比索</Option>
                    <Option value="PLN">波兰兹罗提</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="订单仓库类型" prop="warehouseType" v-if="searchKey.includes('warehouseType')">
                  <dyt-select v-model="pageParams.warehouseType" :max-tag-count="1" :multiple="true"
                    placeholder="请选择订单仓库类型">
                    <Option v-for="(item, index) in warehouseTypeData" :key="`warehouseType-${index}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库" prop="warehouseCode" v-if="searchKey.includes('warehouseCode')">
                  <dyt-select v-model="pageParams.warehouseCode" :max-tag-count="1" multiple placeholder="请选择仓库">
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseCode' :key="`ware-${index}`">
                      {{ item.warehouseName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="包裹状态" prop="deliveryStatusList " v-if="searchKey.includes('deliveryStatusList')">
                  <dyt-select v-model="pageParams.deliveryStatusList" :max-tag-count="1" multiple placeholder="请选择包裹状态">
                    <Option v-for="item in deliveryStatusList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="包裹号" prop="packageCode" v-if="searchKey.includes('packageCode')">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入包裹编号，多个包裹编号用逗号隔开"
                    v-model="pageParams.packageCode"></dyt-input-tag>
                </Form-item>
                <Form-item label="包裹类型" prop="packageType" v-if="searchKey.includes('packageType')">
                  <dyt-select v-model="pageParams.packageType" placeholder="请选择">
                    <Option :value="0">单包裹</Option>
                    <Option :value="1">多包裹</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="运单号" v-if="searchKey.includes('trackingNumberList')">
                  <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入运单号,多个运单号用逗号或回车分隔"
                    v-model="pageParams.trackingNumberList"></dyt-input-tag>
                </Form-item>
                <Form-item label="邮寄方式" v-if="searchKey.includes('merchantCarrierId')">
                  <logisticsModeTree
                    v-model="erpTreeSelectVal"
                    :loadingChildren="true"
                    :all-logistics-mode="true"
                    placeholder="请选择邮寄方式"
                    @on-change="treeChange"
                  />
                </Form-item>
                <Form-item label="返回跟踪号" prop="hasTrackingNumber" v-if="searchKey.includes('hasTrackingNumber')">
                  <dyt-select v-model="pageParams.hasTrackingNumber" placeholder="请选择">
                    <Option v-for="item in trackNumberStatusList" :key="`hasTrackingNumber-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="评价" v-if="searchKey.includes('feedbackList')" prop="feedbackList">
                  <dyt-select v-model="pageParams.feedbackList" :max-tag-count="1" multiple placeholder="请选择评价">
                    <Option v-for="(item, index) in clienteleList" :value='item.value' :key="`feedback-${index}`">
                      {{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="纠纷情况" v-if="searchKey.includes('requestTypeList')" prop="requestTypeList">
                  <dyt-select v-model="pageParams.requestTypeList" :max-tag-count="1" multiple placeholder="请选择纠纷情况">
                    <Option v-for="(item, index) in disputeConditionList" :value='item.value' :key="`feedback-${index}`">
                      {{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="缺货订单" v-if="searchKey.includes('isGoodMiss')" prop="isGoodMiss">
                  <dyt-select v-model="pageParams.isGoodMiss" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isGoodMiss-${item.value}`" :value="item.value">{{ item.label
                    }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="商品所属事业部" prop="businessDeptIdList" v-if="searchKey.includes('businessDeptIdList')">
                  <dyt-select v-model="pageParams.businessDeptIdList" :max-tag-count="1" multiple
                    placeholder="请选择商品所属事业部">
                    <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">
                      {{ item.name }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="集运订单" prop="vovaIsCombinedOrder" v-if="searchKey.includes('vovaIsCombinedOrder')">
                  <dyt-select v-model="pageParams.vovaIsCombinedOrder" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isGoodMiss-${item.value}`" :value="item.value">{{ item.label
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <!-- <Form-item label="已发货">
                  <dyt-select v-model="pageParams.isDelivery" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isDelivery-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item> -->
                <Form-item label="有补发" prop="isRedelivery" v-if="searchKey.includes('isRedelivery')">
                  <dyt-select v-model="pageParams.isRedelivery" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isRedelivery-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有异常" prop="isAbnormal" v-if="searchKey.includes('isAbnormal')">
                  <dyt-select v-model="pageParams.isAbnormal" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isAbnormal-${item.value}`" :value="item.value">{{ item.label
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="已作废" prop="isInvalid" v-if="searchKey.includes('isInvalid')">
                  <dyt-select v-model="pageParams.isInvalid" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isInvalid-${item.value}`" :value="item.value">{{ item.label }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="手工单" prop="isHand" v-if="searchKey.includes('isHand')">
                  <dyt-select v-model="pageParams.isHand" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isHand-${item.value}`" :value="item.value">{{ item.label }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有退款" prop="isRefunded" v-if="searchKey.includes('isRefunded')">
                  <dyt-select v-model="pageParams.isRefunded" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isRefunded-${item.value}`" :value="item.value">{{ item.label
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="部分退款" prop="isPartRefunded" v-if="searchKey.includes('isPartRefunded')">
                  <dyt-select v-model="pageParams.isPartRefunded" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isPartRefunded-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有售后单" prop="hasAfterSalesOrder" v-if="searchKey.includes('hasAfterSalesOrder')">
                  <dyt-select v-model="pageParams.hasAfterSalesOrder" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`hasAfterSalesOrder-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="逾期" prop="isLate" v-if="searchKey.includes('isLate')">
                  <dyt-select v-model="pageParams.isLate" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isLate-${item.value}`" :value="item.value">{{ item.label }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="asin" prop="asin" v-if="searchKey.includes('asin')">
                  <dyt-input v-model='pageParams.asin' placeholder="请输入 asin" />
                </Form-item>
                <Form-item label="货到付款订单" prop="isCashOnDelivery" v-if="searchKey.includes('isCashOnDelivery')">
                  <dyt-select v-model="pageParams.isCashOnDelivery" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isCashOnDelivery-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="合单订单" prop="aliexpressIsCombinedOrder"
                  v-if="searchKey.includes('aliexpressIsCombinedOrder')">
                  <dyt-select v-model="pageParams.aliexpressIsCombinedOrder" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`aliexpressIsCombinedOrder-${item.value}`" :value="item.value">
                      {{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="十日达订单" prop="aliexpressIsTenDaysOrder"
                  v-if="searchKey.includes('aliexpressIsTenDaysOrder')">
                  <dyt-select v-model="pageParams.aliexpressIsTenDaysOrder" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`aliexpressIsTenDaysOrder-${item.value}`" :value="item.value">
                      {{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="包含认证仓货品" v-if="searchKey.includes('containsPlatformShippedTransaction')"
                  prop="containsPlatformShippedTransaction">
                  <dyt-select v-model="pageParams.containsPlatformShippedTransaction" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`containsPlatformShippedTransaction-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="订单已税货品包含类型" prop="aliexpressAlreadyTaxedType"
                  v-if="searchKey.includes('aliexpressAlreadyTaxedType')">
                  <dyt-select v-model="pageParams.aliexpressAlreadyTaxedType" placeholder="请选择">
                    <Option v-for="item in tabsData4" :key="`aliexpressAlreadyTaxedType-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="要求支付消费者VAT" prop="wishPayCustomerVatRequired"
                  v-if="searchKey.includes('wishPayCustomerVatRequired')">
                  <dyt-select v-model="pageParams.wishPayCustomerVatRequired" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishPayCustomerVatRequired-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="EPC订单" prop="wishIsCombinedOrder" v-if="searchKey.includes('wishIsCombinedOrder')">
                  <dyt-select v-model="pageParams.wishIsCombinedOrder" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishIsCombinedOrder-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="A+物流计划订单" prop="wishIsAdvancedLogistics"
                  v-if="searchKey.includes('wishIsAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsAdvancedLogistics" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishIsAdvancedLogistics-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="可选A+物流计划" prop="wishIsOptionalAdvancedLogistics"
                  v-if="searchKey.includes('wishIsOptionalAdvancedLogistics')">
                  <dyt-select v-model="pageParams.wishIsOptionalAdvancedLogistics" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishIsOptionalAdvancedLogistics-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="优质物流商订单" prop="wishIsPremiumcarrierUpgrade"
                  v-if="searchKey.includes('wishIsPremiumcarrierUpgrade')">
                  <dyt-select v-model="pageParams.wishIsPremiumcarrierUpgrade" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishIsPremiumcarrierUpgrade-${item.value}`"
                      :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="WISH EXPRESS订单" prop="wishIsWishExpress" v-if="searchKey.includes('wishIsWishExpress')">
                  <dyt-select v-model="pageParams.wishIsWishExpress" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`wishIsWishExpress-${item.value}`" :value="item.value">{{
                      item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue" v-if="searchKey.includes('searchValue')">
                  <dyt-input @on-enter="searchOrder(true)" placeholder="可输入订单号、包裹号、买家ID、买家姓名、SKU、平台产品编码"
                    v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <!-- <Form-item label="JIT订单" v-if="['aliexpress'].includes(nowPlatform)" prop="isJIT">
                  <dyt-select v-model="pageParams.isJIT" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isJIT-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item> -->
                <Form-item label="托管类型" prop="trusteeshipType" v-if="searchKey.includes('trusteeshipType')">
                  <dyt-select v-model="pageParams.trusteeshipType" placeholder="请选择托管类型">
                    <Option :value="0">全托管</Option>
                    <Option :value="1">半托管</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button
                    v-if="isAdmin || controlList.orderInfo_query || getPermission('orderInfo_queryForInvalid')"
                    type="primary" @click="searchOrder(true)" :disabled="SearchDisabled" icon="md-search"
                  >查询</Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Buttons type="primary" trigger="click" @on-click="exportOrderHasCondition"
          v-if="getPermission('orderInfo_exportOrders_batch') || getPermission('orderInfo_exportInvalidOrders_batch')">
          <Button type="primary" @click="exportOrder" class="iconbuttons"
            v-if="getPermission('orderInfo_exportOrders_batch') || getPermission('orderInfo_exportInvalidOrders_batch')">
            <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1"
              v-if="getPermission('orderInfo_exportOrders_all') || getPermission('orderInfo_exportInvalidOrders_all')">
              导出（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown class="tcDropDown"
          v-if="(getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')) && !isAllplatform">
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
                <Button size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Dropdown class="ml10" v-if="!isCancelOrder && !isAllplatform">
          <Button type="primary">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchModifyWarehouse"
              v-if="getPermission('orderShippingInfo_batchUpdateWarehouse')">
              批量修改仓库
            </DropdownItem>
            <DropdownItem @click.native="batchModifyShippingMethod"
              v-if="getPermission('orderShippingInfo_batchReplaceShippingMethod')">
              批量修改邮寄方式
            </DropdownItem>
            <DropdownItem @click.native="batchApplyWaybill"
              v-if="getPermission('orderShippingInfo_applyOrderWaybill') && ['aliexpress'].includes(nowPlatform)">
              批量申请运单
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10"
          v-if="getPermission('orderInfo_ebaySendBuyerMessage_list') && ['ebay'].includes(nowPlatform) && !isAllplatform">
          <Button type="primary">
            批量联系买家
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="showContact('check')">批量联系买家</DropdownItem>
            <DropdownItem @click.native="showContact('all')">批量联系全部买家</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10" v-if="getPermission('orderInfo_batch_suspend') && !isAllplatform">
          <Button type="primary">
            批量截留
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="suspendedSelect">批量截留选中
            </DropdownItem>
            <DropdownItem @click.native="suspendedSelectAll">批量截留所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10" v-if="getPermission('orderRemark_insert') && !isAllplatform">
          <Button type="primary">
            批量备注
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchUpdateRemark('check')">
              批量备注选中
            </DropdownItem>
            <DropdownItem @click.native="batchUpdateRemark('all')">
              批量备注所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary"
              @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)"
              :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop"
      v-if="getPermission('orderInfo_query') || getPermission('orderInfo_queryForInvalid')">
      <keep-alive>
        <div v-if="isCancelOrder">
          <!--已取消订单-->
          <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="tableColumns"
            :data="orderData" @on-selection-change="getSelectValue"></Table>
        </div>
        <div v-else>
          <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn"
            :data="orderData" @on-selection-change="getSelectValue"></Table>
        </div>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive>
      <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus"
        @on-ok="exportExcel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ exportModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <p>
                {{ exportModel.content }} </p>
              <p class="mt10" v-if="!isCancelOrder">
                <span class="f14">多品订单SKU导出方式选择：</span>
                <RadioGroup v-model="rowCellSetting">
                  <Radio v-for="(item, index) in rowCellSettingList" :key="index" :label="item.value">{{ item.label }}
                  </Radio>
                </RadioGroup>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <Modal v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img :src="setImgPath(item.pictureUrl, true)" :alt="item.title">
            </div>
            </Col>
            <Col :span="17" :offset="1">
            <div class="odpidProductID">
              <span class="productID" @click="goItemUrl(item)"
                :class="{ 'cursor-pointer': platformIdUrlKey.includes(item.platformId) }"
                v-if="item.webstoreItemId">itemID：{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}99999</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') > 0">Color:<em>{{
                  item.variations.split(': ')[1].split(';')[0]
                }} </em></span>
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') < 0">Color:<em>{{
                  item.variations.split(': ')[1]
                }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack of:<em>{{
                item.variations.split(';')[1].split(': ')[1]
              }}</em></span>
            </div>
            </Col>
            <Col :span="2" :offset="2">
            X {{ item.quantity }}
            </Col>
          </Row>
        </div>
        <div slot="footer">
          <Button @click="closeModal">关闭</Button>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
        <orderDetails :orderDetailsId="orderDetailsId" :orderRowsDetail="orderRowsDetail" @reloadTag="reloadTag"
          :orderNo="orderNo" :timestamp="timestamp" @spinLoading="spinLoading" @resetSpinShow="resetSpinShow"
          @updateList="updateLoadTable" :orderTagList="orderTagList" :webstoreItemSite="webstoreItemSite"
          :moal-visible.sync="orderDetails" />
      </sliderModal>
    </keep-alive>
    <batchModifyModal ref="batchModifyModal" :order-id-lists="orderIdList" :orderDataProp="orderData" @getList="getList">
    </batchModifyModal>
    <Modal v-model="dialogVisible" title="操作提示" @on-ok="confirm">
      <span> 确认是否要截留订单，数量：</span>
      <span style="color:#ff995c">{{ suspendedWay == 0 ? selectList.length : total }}</span>
      <div style="margin-top:20px">
        截留原因：<Input v-model="suspendedReason" maxlength="200" show-word-limit type="textarea" style="width: 400px" />
      </div>
      <p style="margin-top:30px"> 提示：无法截留的订单将会自动忽略</p>

    </Modal>
    <!-- 批量联系买家弹窗 -->
    <batchContactPurchaser v-if="['ebay'].includes(nowPlatform)" :module-visible.sync="batchContactVisible"
      :module-data="batchContactData" :platform-id="nowPlatform" @updateList="getList" />
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
    <Spin v-if="pageDataLoading" fix>加载数据中...</Spin>
  </div>
</template>
<script>
/**
 * *父组件：已取消订单
 * */
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import batchModifyModal from '@/components/common/batchModifyModal';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import batchContactPurchaser from "@/views/commonOrder/components/commonOrder/batchContactPurchaser";
import { warehouseTypeData, clienteleEstimate, tableRowStatusTxt, disputeData } from '@/utils/comConfig';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import { platformReceptionUrl } from '@/utils/enum';
import { filterKey, cancelOrder } from '@/views/commonOrder/script/orderToRetrieveConfig';
import logisticsModeTree from '@/components/common/logisticsModeTree';

export default {
  mixins: [Mixin, orderSys],
  components: {
    orderDetails,
    batchModifyModal,
    batchContactPurchaser,
    batchRemarkModal,
    logisticsModeTree
  },
  props: {
    isCancelOrder: {
      // 已取消订单
      type: Boolean,
      default: false
    },
    tableColumns: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      moduleRemarkVisible: false,
      clienteleList: clienteleEstimate,
      disputeConditionList: disputeData,
      platformItemUrl: platformReceptionUrl,
      // 全平台时选择平台使用
      chosePlatform: '',
      moduleRemarkData: {},
      warehouseList: [], // 仓库数据
      warehouseJson: [],
      platformGroup: [],
      pageDataLoading: false,
      batchContactVisible: false,
      batchContactData: {
        uploadCheckType: 'check'
      },
      productStatuList: productData.productStatus,
      warehouseTypeData: warehouseTypeData,
      erpTreeSelectVal: [],
      value2: [], // 物流[[mcarrierID, carrierAccounts],[merchantShippingMethodId]]
      tabsData4: [
        { label: '未税', value: 0 },
        { label: '跨境已税', value: 1 },
        { label: '海外仓已税', value: 2 },
        { label: '跨境/海外仓已税', value: 3 }
      ],
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: false, // true up false down
          title: '按付款时间'
        },
        {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        },
        {
          type: 'surplusTime',
          selected: false,
          status: true, // true up false down
          title: '发货剩余时间'
        }
      ],
      orderDetails: false,
      formValidate: {
        country: []
      },
      shippingStatusList: [
        { label: '未发货', value: 0 },
        { label: '按时发货', value: 1 },
        { label: '逾期发货', value: 2 }
      ],
      deliveryStatusList: [
        // {
        //   selected: true,
        //   id: 88,
        //   title: '全部'
        // },
        {
          selected: false,
          id: 5,
          title: '未指定物流方式'
        },
        {
          selected: false,
          id: 4,
          title: '已指定物流方式（待下发物流）'
        },
        {
          selected: false,
          id: 3,
          title: '已下发物流（待打印）'
        },
        {
          selected: false,
          id: 2,
          title: '已打印'
        },
        {
          selected: false,
          id: 1,
          title: '已出库'
        }
      ],
      trackNumberStatusList: [
        { label: '已返回', value: 'Y' },
        { label: '未返回', value: 'N' },
      ],
      shopModal: [],
      payTimeArr: [],
      refundTimeArr: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        productStatus: '', // 商品状态
        trackingNumberList: [], // 运单号
        tagIdList: [],
        warehouseType: [],
        mapperSkuList: [],
        webstoreOrderIds: null,
        isHand: null,
        isGoodMiss: null,
        isRedelivery: null,
        isRefunded: null,
        isLate: null,
        warehouseCode: [],
        isPartRefunded: null,
        vovaIsCombinedOrder: null,
        isCashOnDelivery: null,
        hasAfterSalesOrder: null,
        feedbackList: [],
        requestTypeList: [],
        platformId: [],
        buyerCountryCodeList: [],
        searchValue: null,
        payStartTime: null,
        payEndTime: null,
        businessDeptIdList: [],
        // 退款开始时间
        refundStartTime: null,
        // 退款结束时间
        refundEndTime: null,
        saleAccountIds: [],
        upDown: 'down',
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        aliexpressIsCombinedOrder: null,
        aliexpressIsTenDaysOrder: null,
        amazonIsPrime: null,
        containsPlatformShippedTransaction: null,
        aliexpressAlreadyTaxedType: null,
        amazonIsBusinessOrder: null,
        wishPayCustomerVatRequired: null,
        wishIsCombinedOrder: null,
        wishIsAdvancedLogistics: null,
        wishIsOptionalAdvancedLogistics: null,
        wishIsPremiumcarrierUpgrade: null,
        wishIsWishExpress: null,
        orderBy: 'payTime',
        deliveryStatusList: [],
        priceOperator: null,
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        maxTotalPrice: '',
        minTotalPrice: '',
        currency: 'USD',
        packageCode: null,
        packageType: null,
        isDeliveryList: [],
        // isDelivery: null,
        isAbnormal: null,
        isInvalid: null,
        hasTrackingNumber: null
      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      // 买家类型
      buyerTypeList: [
        { type: 'B2B', value: 1 },
        { type: 'B2C', value: 0 }
      ],
      clearAble: true,
      orderColumn: [],
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      currencyModal: 'usd',
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderRowsDetail: {},
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      priceAuth: [
        {
          validator: this.validatePrice(),
          trigger: 'blur'
        }
      ],
      // 挑选的list
      selectList: [],
      suspendedWay: 0, // 0是选择选中，1是选择所有
      businessDeptDataList: [],
      // 截留原因
      suspendedReason: '',
      // 对话框视图
      dialogVisible: false
    };
  },
  watch: {
    $route: {
      deep: true,
      handler(val) {
        if (val.path !== "/orderToRetrieve") return;
        this.handUrlParams();
      },
    },
    pageParamsStatus(n) {
      if (n) {
        this.searchOrder();
        this.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(290);
    },
    isGetBusiness() {
      return ['otto'].includes(this.nowPlatform);
    },
    // 是否全平台
    isAllplatform() {
      return this.inGroup == 'allplatform';
    },
    // 是否为自定义平台
    isCustom() {
      return ['definePlatform'].includes(this.nowPlatform);
    },
    // 当前最新平台(全平台时会选择平台，用于传递参数)
    nowPlatform() {
      if (this.isAllplatform) return this.chosePlatform;
      return this.inGroup;
    },
    platformIdUrlKey() {
      return Object.keys(this.platformItemUrl || {});
    },
    // 搜索条件参数
    searchKey() {
      const includesKey = ['pageNum', 'pageSize', 'orderBy', 'upDown', 'platformId'];
      if (this.isCancelOrder) return [...(cancelOrder[this.nowPlatform] || cancelOrder.default), ...includesKey];
      return [...(filterKey[this.nowPlatform] || filterKey.default), ...includesKey];
    },
  },
  activated() { },
  created() {
    this.setTimeArr();
    this.handOrderColumn();
    this.$nextTick(() => {
      this.loadData();
    })
  },
  methods: {
    // 加载数据
    loadData() {
      this.pageDataLoading = true;
      let awaitRes = [
        this.getWarehouseData, // 获取仓库数据
        this.getBusinessDeptData, // 获取事业部
        this.getOrderListTag,
        this.getPlatformGroup, // 获取平台(方法在 common_mixin 文件中)
      ];
      if (this.isCustom) {
        awaitRes.push(this.GetPlatformGroup); // 获取渠道
      }
      this.$common.promiseAll(awaitRes).then((resArr) => {
        // 非自定义平台加载店铺
        if (!this.isCustom && !this.isAllplatform) {
          this.getShopList();
        }
        this.searchOrder();
      }).finally(() => {
        this.pageDataLoading = false;
      })
    },
    // 获取渠道
    GetPlatformGroup() {
      return new Promise((resolve) => {
        this.getHavePlatformGroup().then(res => {
          this.pageParams.platformId = this.$common.isEmpty(res.platformData) ? [] : res.platformData[0].platformId;
          this.shopList = this.$common.copy(res.shopData);
          this.platformGroup = this.$common.copy(res.platformData);
          this.$nextTick(() => {
            resolve(true);
          })
        });
      });
    },
    handOrderColumn() {
      let customColumn = [];
      customColumn.push({
        type: 'selection',
        width: 60,
        // fixed: 'left',
        align: 'center'
      });
      customColumn.push({
        title: "基本信息",
        key: "salesRecordNumber",
        minWidth: 250,
        // fixed: "left",
        render: (h, params) => {
          const orderDetailView = this.getPermission("orderInfo_detail");
          let itemText = [
            h('div', {
              style: { margin: '5px 0' }
            },
            [
              h('span', {}, '订单号：'),
              h('span', {
                attrs: {
                  title: orderDetailView ? '查看订单详情' : ''
                },
                style: {
                  color: orderDetailView ? "#0054A6" : "#515a6e",
                  cursor: orderDetailView ? "pointer" : 'initial'
                },
                on: {
                  click: () => {
                    if (orderDetailView) {
                      this.show(params.row);
                      this.orderNo = params.row.accountCode + "-" + params.row.salesRecordNumber;
                      this.orderTagList = params.row.orderTagList;
                      this.webstoreItemSite = params.row.webstoreItemSite;
                    }
                  }
                }
              }, `${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}`),
              h('icon', {
                class: 'icon lapa lapa-copy',
                attrs: {
                  title: '复制订单号'
                },
                style: {
                  cursor: "pointer",
                  'margin-left': '6px'
                },
                on: {
                  click: () => {
                    this.$common.copyToClip(`${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}`).then(() => {
                      this.$Message.success('复制订单号成功');
                    }).catch(() => {
                      this.$Message.error('当前浏览器不支持复制功能');
                    })
                  }
                }
              }, '')
            ])
          ];
          if (this.isAllplatform && !this.$common.isEmpty(params.row.platformId)) {
            const glInfo = this.platformGroupList.find(gl => gl.platformId == params.row.platformId);
            if (!this.$common.isEmpty(glInfo)) {
              itemText.push(h('span', {
                attrs: {
                  title: '平台'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(255, 152, 0)',
                  background: 'rgba(255, 152, 0, 0.1)'
                },
              }, glInfo.name))
            }
          }
          if (!this.$common.isEmpty(params.row.accountCode)) {
            itemText.push(h('span', {
              attrs: {
                title: '店铺'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(45, 140, 240)',
                background: 'rgba(45, 140, 240, 0.1)'
              },
            }, params.row.accountCode))
          }
          if (!this.$common.isEmpty(params.row.buyerCountryCode)) {
            itemText.push(h('span', {
              attrs: {
                title: '国家/地区'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(20, 118, 2)',
                background: 'rgba(20, 118, 2, 0.1)'
              },
            }, params.row.buyerCountryCode))
          }
          if (!this.$common.isEmpty(params.row.status)) {
            const rowStatus = params.row.status.split(',');
            this.productStatuList.forEach(item => {
              if (rowStatus.includes(item.value.toString())) {
                itemText.push(h('span', {
                  attrs: {
                    title: '商品状态'
                  },
                  class: 'table-row-td-tag',
                  style: {
                    color: 'rgba(43, 185, 43)',
                    background: 'rgba(43, 185, 43, 0.1)'
                  },
                }, item.label))
              }
            })
          }
          // if ([3, '3'].includes(params.row.synDeliverStatus) || [0, '0'].includes(params.row.remainTime)) {
          if ([3, '3'].includes(params.row.synDeliverStatus) || !this.$common.isEmpty(params.row.synDeliverDate)) {
            itemText.push(h('span', {
              attrs: {
                title: '标发货'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(53 190 255)',
                background: 'rgba(53, 190, 255, 0.1)'
              },
            }, '已标发货'))
          }
          if ([7, '7'].includes(params.row.orderStatus)) {
            itemText.push(h('span', {
              attrs: {
                title: '已发货'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(93, 53, 255)',
                background: 'rgba(93, 53, 255, 0.1)'
              },
            }, '已发货'))
          }
          if ([1, '1'].includes(params.row.isHand) && !['JIT'].includes(params.row.orderType)) {
            itemText.push(h('span', {
              attrs: {
                title: '手工单'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(187, 53, 255)',
                background: 'rgba(187, 53, 255, 0.1)'
                // color: 'rgba(98 89 102)',
                // background: 'rgba(103, 82, 114, 0.1)'
              },
            }, '手工单'))
          }
          // if (['JIT'].includes(params.row.orderType)) {
          //   itemText.push(h('span', {
          //     attrs: {
          //       title: 'JIT'
          //     },
          //     class: 'table-row-td-tag',
          //     style: {
          //       color: 'rgba(98 89 102)',
          //       background: 'rgba(103, 82, 114, 0.1)'
          //     },
          //   }, 'JIT'))
          // }
          if (!this.$common.isEmpty(params.row.trusteeshipType) && [0, 1].includes(Number(params.row.trusteeshipType))) {
            const txt = params.row.trusteeshipType == 1 ? '半托管' : '全托管';
            itemText.push(h('span', {
              attrs: {
                title: txt
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(98 89 102)',
                background: 'rgba(103, 82, 114, 0.1)'
              },
            }, txt))
          }
          if (typeof params.row.redelivery === 'boolean' && params.row.redelivery) {
            itemText.push(h('span', {
              attrs: {
                title: '有补发'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(156, 0, 185)',
                background: 'rgba(156, 0, 185, 0.1)'
              },
            }, '有补发'))
          }
          if (!this.$common.isEmpty(params.row.wmsOrderFailReasons)) {
            let abnormalOrderlist = [];
            // 筛选出异常
            params.row.wmsOrderFailReasons.forEach((k) => {
              if (params.row.orderId === k.orderId) {
                if (!this.$common.isEmpty(k.abnormalMessage) || !this.$common.isEmpty(k.distributionLogisticsMsg)) {
                  abnormalOrderlist.push(k);
                }
              }
            });
            if (abnormalOrderlist.length > 0) {
              itemText.push(h('span', {
                attrs: {
                  title: '异常订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(255, 0, 0)',
                  background: 'rgba(255, 0, 0, 0.1)'
                },
              }, '有异常'))
            }
          }
          if ([1, 2, '1', '2'].includes(params.row.isInvalid)) {
            itemText.push(h('span', {
              attrs: {
                title: '作废订单'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(225, 67, 67)',
                background: 'rgba(225, 67, 67, 0.1)'
              },
            }, '已作废'))
          }
          if (typeof params.row.goodMiss === 'boolean' && params.row.goodMiss) {
            itemText.push(h('span', {
              attrs: {
                title: '缺货订单'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(255, 165, 0)',
                background: 'rgba(255, 165, 0, 0.1)'
              },
            }, '缺货'))
          }
          if ([1, '1'].includes(params.row.isRefunded)) {
            itemText.push(h('span', {
              attrs: {
                title: '有退款'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(247, 93, 207)',
                background: 'rgba(247, 93, 207, 0.1)'
              },
            }, '有退款'))
          }
          if ([1, '1'].includes(params.row.isPartRefunded)) {
            itemText.push(h('span', {
              attrs: {
                title: '部分退款'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(187, 80, 159)',
                background: 'rgba(187, 80, 159, 0.1)'
              },
            }, '部分退款'))
          }
          if ([1, '1'].includes(params.row.hasAfterSales)) {
            itemText.push(h('span', {
              attrs: {
                title: '有售后单'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(68, 0, 201)',
                background: 'rgba(68, 0, 201, 0.1)'
              },
            }, '有售后单'))
          }
          if (['ozon'].includes(params.row.platformId) && !this.$common.isEmpty(params.row.ozonSplitOrderRecordList)) {
            let oItem = [
              h('div', {}, '已拆单'),
              h('div', {}, `主单：${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}，数量：${params.row.notSpiltTotal}`),
            ];
            (params.row.ozonSplitOrderRecordList || []).forEach((item, cIndex) => {
              oItem.push(h('div', {}, `拆分订单${cIndex + 1}：${params.row.accountCode || ''}-${item.subWebstoreOrderId || ''}，数量：${item.quantity}`));
            });
            oItem.push(h('div', {}, '点击图标可查询主单以及拆分订单'));

            itemText.push(h('Poptip', {
              props: {
                placement: 'right',
                trigger: 'hover',
                transfer: true
              },
              style: {},
            }, [
              h('span', {
                class: 'table-row-td-tag',
                style: {
                  color: 'rgb(44 141 44)',
                  background: 'rgba(0, 111, 0, 0.2)',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    this.updateLoadTable({
                      orderNo: [
                        `${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}`,
                        ...(params.row.ozonSplitOrderRecordList || []).map(item => {
                          return `${params.row.accountCode || ''}-${item.subWebstoreOrderId || ''}`
                        })
                      ].join(',')
                    })
                  }
                }
              }, '已拆单'),
              h('div', {
                slot: 'content',
                style: {
                  'width': '350px',
                  'white-space': 'initial',
                  'max-height': '50vh',
                  'overflow': 'auto',
                },
              }, oItem)
            ]))
          }
          if ([1].includes(Number(params.row.isReply))) {
            itemText.push(h('span', {
              attrs: {
                title: '回复状态'
              },
              class: 'table-row-td-tag',
              style: {
                color: 'rgba(222, 138, 255)',
                background: 'rgba(222, 138, 255, 0.1)'
              },
            }, '自动回复'))
          }
          return itemText;
        }
      });
      ['wish', 'aliexpress'].includes(this.nowPlatform) && customColumn.push({
        title: '订单状态',
        key: 'orderStatus',
        width: 140,
        align: 'center',
        render: (h, params) => {
          if (['wish'].includes(this.nowPlatform)) return h('span', params.row.platformOrderStatus || '');
          return h('span', this.getPlatformOrderStatus(params.row.platformOrderStatus));
        }
      });
      if (['wish'].includes(this.nowPlatform)) {
        customColumn.push({
          title: 'A+物流计划订单',
          key: 'wishIsAdvancedLogistics',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsAdvancedLogistics === 1
                ? '是'
                : '否')
            ]);
          }
        });
        customColumn.push({
          title: '优质物流商订单',
          key: 'wishIsPremiumcarrierUpgrade',
          align: 'center',
          width: 130,
          render: (h, params) => {
            let txt = '否';
            if (params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsPremiumcarrierUpgrade === 1) {
              txt = '是';
            }
            return h('div', txt);
          }
        });
        customColumn.push({
          title: 'WISH EXPRESS订单',
          key: 'wishIsWishExpress',
          align: 'center',
          width: 160,
          render: (h, params) => {
            let txt = '否';
            if (params.row.orderExtendInfo != null && params.row.orderExtendInfo.wishIsWishExpress === 1) {
              txt = '是';
            }
            return h('div', txt);
          }
        });
      }
      (['ebay', 'amazon'].includes(this.nowPlatform) || this.isAllplatform) && customColumn.push({
        title: "站点",
        key: "packageCode",
        width: 66,
        render: (h, params) => {
          if (params.row.webstoreItemSite !== null) {
            return h("div", {
              attrs: {
                class:
                  "nationalFlag nationalFlag" + params.row.webstoreItemSite,
                title: params.row.webstoreItemSite,
              },
            });
          } else {
            return h("div", "");
          }
        }
      });
      ['amazon'].includes(this.nowPlatform) && customColumn.push({
        title: '买家类型',
        key: 'amazonIsBusinessOrder',
        width: 120,
        align: 'center',
        render: (h, params) => {
          if (params.row.amazonIsBusinessOrder === 0) {
            return h('div', 'B2C');
          }
          if (params.row.amazonIsBusinessOrder === 1) {
            return h('div', 'B2B');
          }
        }
      });
      customColumn.push({
        title: "产品",
        key: "productList",
        width: 200,
        render: (h, params) => {
          let data = params.row.productList;
          const len = data.length;
          let pos = [];
          data.forEach((n, i) => {
            let item = this.tableImg(h, params, "", n.pictureUrl, () => {
              this.showPicModal(data);
            }, "right-end", this.$common.isEmpty(n.quantity) ? 0 : n.quantity);
            if (i < 3) {
              pos.push(item);
              if (i === 2) {
                pos.push(h("span", {
                  style: {
                    marginLeft: "5px",
                  },
                }, `${len > 3 ? '...' : ''}`));
              }
            }
          });
          return h("div", pos);
        }
      });
      customColumn.push({
        title: `买家ID/姓名${['aliexpress'].includes(this.nowPlatform) ? '/买家等级' : ''}`,
        key: 'buyerName',
        align: 'center',
        width: 160,
        render: (h, params) => {
          let textItem = [h('div', {
            style: {
              color: '#0054A6'
            }
          }, params.row.buyerAccountId),
          h('div', {
            style: {
              color: '#ff3300'
            }
          }, params.row.buyerName)];
          if (['aliexpress'].includes(this.nowPlatform) && params.row.orderExtendInfo) {
            const level = params.row.orderExtendInfo.aliexpressBuyerAccountLevel;
            const levelClass = {
              'A0': 'grayBgColor',
              'A1': 'greenBgColor',
              'A2': 'blueBgColor',
              'A3': 'yellowBgColor',
              'A4': 'redBgColor',
            }
            textItem.push(h('span', {
              class: 'lableIcon ' + levelClass[level],
              style: {
                'margin-right': '5px'
              }
            }, level));
          }
          return textItem;
        }
      });
      customColumn.push({
        title: '金额',
        key: 'totalPrice',
        width: 120,
        align: 'center',
        render: (h, params) => {
          const totalPrice = Number(params.row.totalPrice || 0).toFixed(2);
          return h('div', {}, `${totalPrice} ${params.row.totalPriceCurrency || ''}`);
        }
      });
      customColumn.push({
        title: '毛利详情',
        key: 'grossProfit',
        width: 190,
        align: 'center',
        className: 'gross-profit-style',
        render: (h, { row }) => {
          let item = [];
          const grossProfit = this.$common.isEmpty(row.grossProfit) ? '' : Number(row.grossProfit.replace(/[^.|\-|0-9]/g, ''));
          const grossMargin = this.$common.isEmpty(row.grossMargin) ? '' : Number(row.grossMargin.replace(/[^.|\-|0-9]/g, ''));
          const remote = this.$common.isEmpty(row.remote) ? '' : Number(row.remote.replace(/[^.|\-|0-9]/g, ''));
          !this.$common.isEmpty(grossProfit) && grossProfit != 0 && item.push(h('div', {}, `预估毛利润：${row.grossProfit || ''}`));
          !this.$common.isEmpty(grossMargin) && grossMargin != 0 && item.push(h('div', {}, `预估毛利率：${row.grossMargin || ''}`));
          !this.$common.isEmpty(remote) && remote != 0 && item.push(h('div', {}, `偏远地区费用：${row.remote || ''}`));
          return h('div', {}, item);
        }
      });
      (['ebay'].includes(this.nowPlatform) || this.isAllplatform) && customColumn.push({
        title: "评价",
        key: "status",
        width: 90,
        align: 'center',
        render: (h, { row }) => {
          let item = [];
          !this.$common.isEmpty(row.positiveCount) && ![0, '0'].includes(row.positiveCount) && item.push(
            h('span', {
              attrs: {
                title: '好评'
              },
              style: {
                'margin-right': '6px'
              }
            }, this.goodReputation(h, row.positiveCount))
          );
          !this.$common.isEmpty(row.neutralCount) && ![0, '0'].includes(row.neutralCount) && item.push(
            h('span', {
              attrs: {
                title: '中评'
              },
              style: {
                'margin-right': '6px'
              }
            }, this.middleReputation(h, row.neutralCount))
          );
          !this.$common.isEmpty(row.negativeCount) && ![0, '0'].includes(row.negativeCount) && item.push(
            h('span', {
              attrs: {
                title: '差评'
              },
              style: {}
            }, this.badReputation(h, row.negativeCount))
          );
          return item;
        }
      });
      customColumn.push({
        title: "异常",
        key: "salesTime",
        align: "left",
        width: 70,
        render: (h, params) => {
          // 筛选出该订单下的异常原因
          const { orderId, wmsOrderFailReasons } = params.row;
          if (this.$common.isEmpty(wmsOrderFailReasons)) return '';
          let messageList = [];
          // 筛选订单
          wmsOrderFailReasons.forEach(k => {
            if (orderId === k.orderId) {
              if (!this.$common.isEmpty(k.distributionLogisticsMsg)) {
                messageList.push(h('p', `${k.packageCode}-${k.distributionLogisticsMsg}`));
              } else if (!this.$common.isEmpty(k.abnormalMessage)) {
                messageList.push(h('p', `${k.packageCode}-${k.abnormalMessage}`));
              }
            }
          });
          if (this.$common.isEmpty(messageList)) return '';
          return h("Tooltip", {
            style: {
              textAlign: "center",
            },
            props: {
              'transfer-class-name': 'table-row-td-tooltip',
              transfer: true,
            }
          }, [
            h('div', {
              slot: 'content'
            }, messageList),
            h('icon', {
              class: 'icon lapa lapa-warning',
              style: {
                'color': '#f20',
                'font-size': '20px',
                'cursor': 'pointer'
              }
            })
          ])
        }
      });
      customColumn.push({
        title: "时间信息",
        key: "payTime",
        minWidth: 210,
        render: (h, { row }) => {
          let itemTxt = [];
          if (row.salesTime) {
            itemTxt.push(h('div', {}, `下单时间：${row.salesTime.substring(0, 16)}`));
          }
          if (row.payTime) {
            itemTxt.push(h('div', {}, `付款时间：${row.payTime.substring(0, 16)}`));
          }
          if ([3, '3'].includes(row.synDeliverStatus)) {
            if (row.synDeliverDate) {
              const deliverDate = this.getDataToLocalTime(row.synDeliverDate, "fulltime");
              itemTxt.push(h('div', {}, `标发货时间：${deliverDate.substring(0, 16)}`));
            }
          } else if (!this.$common.isEmpty(row.remainTime)) {
            const time = [0, '0'].includes(row.remainTime) ? '逾期' : this.getLimitTime(row.remainTime, true);
            itemTxt.push(h('div', [
              h('span', '发货剩余：'),
              h('span', {
                style: {
                  color: '#f20'
                }
              }, time)
            ]));
          }
          return h('div', {
            style: {
              margin: '5px 0'
            }
          }, itemTxt);
        }
      });
      customColumn.push({
        title: "出库单信息",
        key: "payTime",
        minWidth: 200,
        render: (h, { row }) => {
          if (this.$common.isEmpty(row.orderPackageVOS)) return '';
          let itemTxt = [];
          return row.orderPackageVOS.map(m => {
            itemTxt = [];
            if (!this.$common.isEmpty(m.packageCode)) {
              itemTxt.push(h('div', [
                h('span', {
                  attrs: {
                    title: '出库单号'
                  }
                }, m.packageCode),
                h('icon', {
                  class: 'icon lapa lapa-copy',
                  attrs: {
                    title: '复制出库单号'
                  },
                  style: {
                    cursor: "pointer",
                    'margin-left': '6px'
                  },
                  on: {
                    click: () => {
                      this.$common.copyToClip(`${m.packageCode || ''}`).then(() => {
                        this.$Message.success('复制出库单号成功');
                      }).catch(() => {
                        this.$Message.error('当前浏览器不支持复制功能');
                      })
                    }
                  }
                }, '')
              ]))
            }
            if (!this.$common.isEmpty(m.trackingNumber)) {
              itemTxt.push(h('div', [
                h('span', {
                  attrs: {
                    title: '跟踪号'
                  }
                }, m.trackingNumber),
                h('icon', {
                  class: 'icon lapa lapa-copy',
                  attrs: {
                    title: '复制跟踪号'
                  },
                  style: {
                    cursor: "pointer",
                    'margin-left': '6px'
                  },
                  on: {
                    click: () => {
                      this.$common.copyToClip(`${m.trackingNumber || ''}`).then(() => {
                        this.$Message.success('复制跟踪号成功');
                      }).catch(() => {
                        this.$Message.error('当前浏览器不支持复制功能');
                      })
                    }
                  }
                }, '')
              ]))
            }
            const statusObj = tableRowStatusTxt(this.warehouseList, m);
            if (!this.$common.isEmpty(m.pickingStatus) && !this.$common.isEmpty(statusObj)) {
              itemTxt.push(h('div', [
                h('span', {
                  attrs: {
                    title: '出库单状态'
                  },
                  class: 'table-row-td-tag',
                  style: {
                    // color: statusObj.color
                    background: 'rgba(43, 185, 43, 0.1)',
                    color: 'rgba(43, 185, 43)'
                  },
                }, statusObj.txt)
              ]))
            }
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, itemTxt);
          })
        }
      });
      customColumn.push({
        title: '标签',
        key: 'tags',
        minWidth: 140,
        align: 'center',
        render: (h, params) => {
          let orderTagList = params.row.orderTagList;
          let pos = [];
          if (!this.$common.isEmpty(orderTagList)) {
            orderTagList.forEach((n, i) => {
              let item = h('div', [
                h('Icon', {
                  props: {
                    type: 'pricetag',
                    color: '#f00'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }),
                h('span', n.tagName)
              ]);
              pos.push(item);
            });
            return h('div', pos);
          }
        }
      });
      customColumn.push({
        title: '备注',
        key: 'remarkContent',
        align: 'center',
        resizable: true,
        width: 200
      });
      this.orderColumn = customColumn;
    },
    // 获取仓库数据
    getWarehouseData() {
      return new Promise((resolve) => {
        this.axios.post(api.get_warehouseList, { warehouseStatus: '0' }).then(res => {
          if (res && res.data && res.data.code === 0 && res.data.datas) {
            (res.data.datas || []).forEach(item => {
              this.warehouseJson[item.warehouseCode] = item;
            })
            this.warehouseList = res.data.datas || [];
            return resolve(res.data.datas || []);
          }
          resolve([]);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取事业部
    getBusinessDeptData() {
      return new Promise((resolve) => {
        if (!this.isGetBusiness) return resolve([]);
        this.axios.get(api.get_businessDeptList).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
            return resolve(res.data.data || []);
          }
          resolve([]);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    handUrlParams() {
      this.$nextTick(() => {
        if (!['ebay'].includes(this.nowPlatform)) return;
        const urlParams = this.$common.getUrlParams();
        if (this.$common.isEmpty(urlParams) || this.$common.isEmpty(urlParams.orderId)) return;
        // 先清空条件
        this.reset();
        this.$nextTick(() => {
          this.$set(this.pageParams, "orderNo", urlParams.orderId);
          this.$nextTick(() => {
            this.searchOrder();
          });
        });
      });
    },
    treeChange(val) {
      this.value2 = [val.carrierId.join(','), [val.shippingMethodId.join(',')]];
    },
    // startLoading () {
    //   let v = this;
    //   v.tableLoading = false;
    //   v.orderData = [];
    //   v.$Loading.start();
    //   if (v.isCancelOrder) {
    //     v.getPermission('orderInfo_queryForInvalid')
    //       ? v.getShopList()
    //       : v.gotoError();
    //   } else {
    //     v.getPermission('orderInfo_query') ? v.getShopList() : v.gotoError();
    //   }
    //   v.$Loading.finish();
    //   v.getOrderListTag(); // 获取标签列表
    // },
    getParams() {
      let obj = this.deepCopy(this.pageParams);
      Object.keys(this.pageParams).forEach(key => {
        if (!this.searchKey.includes(key)) {
          delete obj[key];
        }
      });
      if (!this.$common.isEmpty(obj.warehouseCode)) {
        let warehouseIds = [];
        obj.warehouseCode.forEach(item => {
          if (this.warehouseJson[item]) {
            warehouseIds.push(this.warehouseJson[item].warehouseId);
          }
        });
        delete obj.warehouseCode;
        obj.warehouseIdList = warehouseIds;
      }
      obj.warehouseType = this.$common.isEmpty(obj.warehouseType) ? '' : obj.warehouseType.join(',');
      obj.platformId = this.$common.isEmpty(this.nowPlatform) ? [] : [this.nowPlatform];
      // 自定义平台 需要传 DEFINE_ALL
      obj.platformId = (obj.platformId || []).map((item) => {
        return item == 'definePlatform' ? 'DEFINE_ALL' : item;
      });
      obj = this.orderToRetrieveParams(obj);
      obj.trackingNumberList = this.pageParams.trackingNumberList;
      return obj;
    },
    getList(type) {
      let obj = this.getParams();
      this.orderIdList = [];
      this.orderData = [];
      if (type) {
        this.selectList = [];
      }
      let apiUrl = '';
      if (this.isCancelOrder) {
        apiUrl = api.get_queryForInvalid;
      } else {
        apiUrl = api.get_searchOrders;
        const isParams = !this.isSearch(obj);
        if ((!this.isAllplatform && !this.isSearch(obj)) || (this.isAllplatform && isParams && this.$common.isEmpty(obj.platformId))) {
          this.$Message.info('请添加搜索条件');
          this.tableLoading = false;
          this.SearchDisabled = false;
          return;
        }
      }
      this.loadingTrue();
      this.axios.post(apiUrl, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          let data = response.data.datas;
          let notSpiltTotal = 0;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              notSpiltTotal = 0;
              (n.orderTransactions || []).forEach(item => {
                if (!this.$common.isEmpty(item.quantity) && !this.$common.isEmpty(Number(item.quantity))) {
                  if (!this.$common.isEmpty(item.splitQuantity) && !this.$common.isEmpty(Number(item.splitQuantity))) {
                    notSpiltTotal += (Number(item.quantity) - Number(item.splitQuantity));
                  } else {
                    notSpiltTotal += Number(item.quantity);
                  }
                }
              })
              pos.push({
                ...n,
                isInvalid: n.isInvalid,
                isHand: n.isHand,
                isRefunded: n.isRefunded,
                invalidReason: n.invalidReason,
                orderCount: n.orderCount, // 订单数量
                buyerName: n.buyerName, // 买家
                buyerAccountId: n.buyerAccountId,
                webstoreItemSite: n.webstoreItemSite,
                buyerShippingMethod: n.buyerShippingMethod,
                totalPrice: n.totalPrice,
                totalPriceCurrency: n.totalPriceCurrency,
                orderTagList: n.orderTags,
                orderId: n.orderId,
                productList: [],
                notSpiltTotal: notSpiltTotal,
                salesRecordNumber: n.salesRecordNumber,
                saleAccountId: n.saleAccountId,
                buyerCountryCode: n.buyerCountryCode,
                platformId: n.platformId,
                payTime: this.getDataToLocalTime(n.payTime, 'fulltime'),
                salesTime: this.getDataToLocalTime(n.salesTime, 'fulltime'),
                remainTime: n.remainTime,
                wmsOrderFailReasons: n.wmsOrderFailReasons,
                synDeliverStatus: n.synDeliverStatus,
                synDeliverDate: n.synDeliverDate,
                amazonFulfillmentChannel: n.orderExtendInfo ? n.orderExtendInfo.amazonFulfillmentChannel : '',
                amazonIsBusinessOrder: n.orderExtendInfo ? n.orderExtendInfo.amazonIsBusinessOrder : '',
                amazonIsPrime: n.orderExtendInfo ? n.orderExtendInfo.amazonIsPrime : '',
                orderShippingIdAndwarehouseId: n.orderShippingIdAndwarehouseId
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) {
              // 匹配订单号
              const getData = async () => {
                try {
                  const Arr = await this.getAccountCode(pos, saleAccountIdPos);
                  let newArr = await this.getProductList(Arr, orderIdPos);
                  newArr = await this.getOrderRemark(newArr, orderIdPos);// 匹配订单备注
                  const selectOrderIds = this.selectList.map(selectRow => selectRow.orderId);
                  if (this.$common.isEmpty(selectOrderIds)) {
                    this.orderData = newArr;
                  } else {
                    this.orderData = newArr.map(row => {
                      return { ...row, _checked: selectOrderIds.includes(row.orderId) }
                    });
                    this.selectList = this.orderData.filter(filRow => filRow._checked);
                  }
                } catch (err) {
                  console.error(err);
                }
                this.getImg();
                this.loadingFalse();
              }
              getData();
            } else {
              this.loadingFalse();
            }
            this.$nextTick(function () {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(function () {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        } else {
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
      });
    },
    show(row) {
      this.orderDetailsBegin = true;
      this.orderDetailsId = row.orderId;
      this.orderRowsDetail = this.$common.copy(row);
      let date = new Date().getTime();
      this.$nextTick(function () {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    getSelectValue(value) { // table获取所选值
      this.selectList = value
      let v = this;
      let pos = [];
      Promise.resolve(
        value.forEach((n, i) => {
          pos.push(n.orderId);
        })
      ).then(() => {
        v.orderIdList = pos;
      });
    },
    tagChange(value) {
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = [];
      } else {
        v.pageParams.tagIdList = value;
      }
    },
    getMarkCountryList(h) {
      let pos = [];
      this.formValidate.country.forEach((n, i) => {
        pos.push(
          h(
            'Option',
            {
              props: {
                value: n.twoCode,
                key: n
              }
            },
            n.cnName
          )
        );
      });
      return pos;
    },
    reset() {
      this.pageParams.minTotalPrice = '';
      this.pageParams.maxTotalPrice = '';
      this.pageParams.isRefunded = null;
      this.pageParams.isHand = null;
      this.pageParams.isGoodMiss = null;
      this.pageParams.isRedelivery = null;
      this.pageParams.isPartRefunded = null;
      this.pageParams.isDeliveryList = [];
      // this.pageParams.isDelivery = null;
      this.pageParams.deliveryStatusList = [];
      this.pageParams.isAbnormal = null;
      this.pageParams.isInvalid = null;
      this.pageParams.isLate = null;
      this.pageParams.aliexpressIsCombinedOrder = null;
      this.pageParams.aliexpressIsTenDaysOrder = null;
      this.pageParams.containsPlatformShippedTransaction = null;
      this.pageParams.aliexpressAlreadyTaxedType = null;
      this.pageParams.amazonIsPrime = null;
      this.pageParams.asin = null;
      this.pageParams.wishPayCustomerVatRequired = null;
      this.pageParams.wishIsCombinedOrder = null;
      this.pageParams.wishIsAdvancedLogistics = null;
      this.pageParams.wishIsOptionalAdvancedLogistics = null;
      this.pageParams.wishIsPremiumcarrierUpgrade = null;
      this.pageParams.wishIsWishExpress = null;
      this.pageParams.feedbackList = [];
      this.pageParams.requestTypeList = [];
      this.pageParams.hasAfterSalesOrder = null;
      this.pageParams.hasTrackingNumber = null;
      this.pageParams.trackingNumberList = [];
      this.value2 = [];
      this.erpTreeSelectVal = [];
      this.$refs['pageParams'].resetFields();
      this.refundTimeArr = [];
      this.resetDate();
      this.refundResetData();
    },
    getDateValue(value) { // 获取日期返回值
      if (value.length === 0) {
        this.$Message.error('日期格式有误');
        this.resetDate();
      } else {
        if (value[0] !== '') {
          this.pageParams.payStartTime = this.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          this.pageParams.payEndTime = this.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    refundGetDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (!value[0]) {
          v.pageParams.refundStartTime = null;
          v.pageParams.refundEndTime = null;
        } else {
          v.pageParams.refundStartTime = v.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          v.pageParams.refundEndTime = v.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    resetDate() {
      this.pageParams.payStartTime = null;
      this.pageParams.payEndTime = null;
      this.payTimeArr = [];
    },
    refundResetData() {
      this.pageParams.refundStartTime = null;
      this.pageParams.refundEndTime = null;
      this.refundTimeArr = [];
    },
    searchOrder(type) {
      this.tableLoading = true;
      this.SearchDisabled = true;
      if (type) {
        this.curPage = 1;
        this.pageParams.pageNum = 1;
      }
      this.$nextTick(() => {
        this.getList(type);
      })
    },
    // 更改搜索条件后查询
    updateLoadTable(obj = {}) {
      this.pageParams = { ...this.pageParams, ...obj };
      this.$nextTick(() => {
        this.searchOrder(true);
      })
    },
    exportOrderHasCondition() { // 导出选中
      if (this.orderData.length < 1) {
        this.$Message.error('没有相关数据');
        return false;
      }
      this.exportOrder('all');
    },
    setShippingMethod(type) {
      let v = this;
      let obj;
      if (
        (v.orderIdList.length === 0 || v.orderIdList === null) &&
        type !== 'all'
      ) {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type !== 'all') {
        obj = {
          orderIdList: v.orderIdList,
          timeZone: v.$common.getDefaultTimezoom()
        };
      } else {
        obj = v.getParams();
        obj.orderIdList = v.orderIdList;
      }
      v.axios.put(api.export_orders, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.searchOrder();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    exportOrder(type) {
      if ((this.orderIdList.length === 0 || this.orderIdList === null) && type !== 'all') {
        this.$Message.error('请选择订单');
        return false;
      }
      this.exportModelStatus = true;
      if (type === 'all') {
        this.exportModel.title = '导出（所有结果集）';
        this.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过100000单。';
      } else {
        this.exportModel.title = '导出选中';
        this.exportModel.content = '系统将您勾选的订单导出到excel';
      }
      this.$nextTick(() => {
        this.exportModel.status = true;
      });
    },
    exportExcel(type) {
      let obj = {
        platformId: [],
        orderIdList: this.orderIdList,
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: this.pageParams.orderBy,
        requestTypeList: this.pageParams.requestTypeList,
        upDown: this.pageParams.upDown
      };
      if (this.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, this.getParams());
        delete obj.orderIdList;
      } else {
        obj.platformId = this.$common.arrRemoveRepeat(this.selectList.map(m => m.platformId));
      }
      let apiUrl = '';
      if (this.isCancelOrder) {
        apiUrl = api.export_cancelOrder;
      } else {
        apiUrl = api.export_orders;
        obj.rowCellSetting = this.rowCellSetting;
      }
      // 导出全平台和查询不一样，需要用增加 allplatform
      if (this.isAllplatform) {
        obj.platformId.push('allplatform');
      }
      this.axios.post(apiUrl, JSON.stringify(obj)).then((response) => {
        if (response.data.code === 0) {
          // this.orderIdList = [];
          // this.searchOrder();
          let data = response.data.datas;
          this.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
          // let erpCommon = this.$store.state.erpConfig;
          // newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
          // setTimeout(function () {
          //   newTab.close();
          // }, 1000);
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    showPicModal(data, row) {
      this.productStatus = true;
      this.$nextTick(() => {
        this.productModal = true;
        this.productDetails = data;
      });
    },
    /**
     * 跳转到对应平台
     * @params item 当前操作对象
     * customer 是客服系统
    * */
    goItemUrl(item) {
      if (this.$common.isEmpty(this.platformItemUrl[item.platformId])) return;
      const itemId = item.webstoreItemId || '';
      let amazonAsin = '';
      if (!this.$common.isEmpty(item.orderTransactions) && !this.$common.isEmpty(itemId)) {
        let orderTranInfo = item.orderTransactions.find(op => op.webstoreItemId == itemId);
        orderTranInfo = this.$common.isEmpty(orderTranInfo) ? {} : orderTranInfo.orderTransactionExtend || {};
        amazonAsin = orderTranInfo.amazonAsin || '';
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    // 全平台页面时，平台改变后
    platformChange(val) {
      if (!this.isAllplatform) return;
      this.pageParams.saleAccountIds = [];
      if (this.$common.isEmpty(val)) {
        this.shopList = [];
        return;
      }
      this.getShopList(null, null, [val]);
    },
    closeModal() {
      this.productModal = false;
    },
    modifyTheSort(index, status) {
      this.pageParams.orderBy = this.buttonGroupModel[index].type;
      this.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          this.buttonGroupModel[index].status = !this.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      this.pageParams.upDown = this.buttonGroupModel[index].status ? 'up' : 'down';
      if (this.orderData.length > 0) {
        this.$nextTick(() => {
          this.searchOrder(true);
        })
      }
    },
    validatePrice() {
      let v = this;
      let priceReg = v.$regular.priceReg;
      let validatePrice = function (rule, value, callback) {
        if (
          !priceReg.test(v.pageParams.minTotalPrice) ||
          !priceReg.test(v.pageParams.maxTotalPrice)
        ) {
          v.$Message.error('该选项必须为数字');
          v.pageParams.minTotalPrice = '';
          v.pageParams.maxTotalPrice = '';
          callback();
        } else {
          callback();
        }
      };
      return validatePrice;
    },
    // 批量备注
    batchUpdateRemark(str) {
      let updateFilter = this.getParams();
      updateFilter.orderType = 0;
      if (str !== "all") {
        if (this.selectList.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderType: 0,
          orderNo: this.selectList.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      } else if (!this.isSearch(updateFilter)) {
        return this.$Message.info("请添加搜索条件");
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.orderRetrievalBatchInsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    // 批量申请运单
    batchApplyWaybill() {
      if (this.selectList && this.selectList.length === 0) {
        this.$Message.error('请选择数据');
        return;
      }
      let applyList = [];
      let notApply = [];
      this.selectList.forEach(row => {
        if (['WAIT_SELLER_SEND_GOODS'].includes(row.platformOrderStatus)) {
          applyList.push(row.orderId);
        } else {
          notApply.push(`${row.accountCode}-${row.salesRecordNumber}`);
        }
      })
      if (notApply.length > 0) {
        this.$Modal.warning({
          title: '提示',
          content: `订单号 ${notApply.join(', ')} 不支持申请运单, 请取消选中以上订单(如果订单状态有变动，刷新后再操作)`,
          width: 800,
          onOk: () => { },
          onCancel: () => { }
        });
        return;
      }
      this.$Modal.confirm({
        title: '申请运单',
        content: `批量申请运单，你所选择的订单将下发到物流商`,
        loading: true,
        onOk: () => {
          this.axios.post(api.update_orderApplyWaybill, { orderIdList: applyList }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$Modal.remove();
              this.$Message.success('操作成功');
              this.searchOrder();
            }
          })
        },
        onCancel: () => { }
      });
    },
    // 显示弹窗
    showContact(str) {
      const searchParams = this.getParams();
      this.$set(this.batchContactData, 'uploadCheckType', str);
      this.$set(this.batchContactData, 'searchParams', searchParams);
      if (str !== "all") {
        if (this.selectList.length == 0) {
          this.$Message.error("请选择订单");
          return;
        }
        this.$set(this.batchContactData, 'uploadSaleAccountId', this.selectList[0].saleAccountId);
        this.$set(this.batchContactData, 'checkRow', this.selectList);
        const isPass = this.selectList.filter((f) => {
          if (!f.productList || !f.productList[0] || this.$common.isEmpty(f.productList[0].webstoreItemId)) {
            return true;
          }
        });
        if (isPass.length > 0) {
          this.$Message.error("订单的销售平台刊登编号不能为空");
          return;
        }
      } else {
        if (!this.isSearch(searchParams)) {
          this.$Message.info("请添加搜索条件");
          return;
        }
      }
      this.$nextTick(() => {
        this.batchContactVisible = true;
      });
    },
    getImg() {
      let busineseIdList = []
      this.orderData.forEach(itema => {
        itema.productList.forEach(itemb => {
          if (this.$common.isEmpty(itemb.orderTransactions)) {
            itemb.orderTransactions = [];
          }
          if (itemb.businessId && !busineseIdList.includes(itemb.businessId)) busineseIdList.push(itemb.businessId);
        })
      });
      this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
        this.orderData.forEach(itema => {
          itema.productList.forEach(itemb => {
            res.data.datas.forEach(itemc => {
              if (itemc.businessId == itemb.businessId) itemb.pictureUrl = itemc.path
            })
          })
        })
      })
    },
    suspendedSelect() {
      if (this.selectList.length == 0) return this.$Message.warning('请先选择要截留的订单')
      this.suspendedWay = 0
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    suspendedSelectAll() {
      if (this.orderData.length == 0) return this.$Message.warning('请先查询要截留的订单')
      this.suspendedWay = 2
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    confirm() {
      let pageParams = this.getParams();
      if (pageParams.isSuspended == 2) pageParams.isSuspended = null
      this.axios.put('/order-service/orderInfo/batchSuspendOrderInfo', {
        batchSuspendedReason: this.suspendedReason,
        orderIdList: this.suspendedWay == 0 ? this.selectList.map(item => { return item.orderId }) : [],
        queryOrderListBo: this.suspendedWay == 2 ? pageParams : {},
        operateType: this.suspendedWay
      }).then(res => {
        this.$Message.success('截留成功')
        this.searchOrder();
      })
    },
    // 好评图标
    goodReputation(h, text) {
      return [
        h('svg', {
          class: 'svg-icon',
          style: { 'font-size': '16px' },
          attrs: {
            'aria-hidden': true
          }
        }, [h('use', {
          attrs: {
            'xlink:href': '#lapa-good-reputation'
          }
        }, '')]),
        h('span', {
          style: {
            'margin-left': '2px'
          }
        }, text)
      ]
    },
    // 中评图标
    middleReputation(h, text) {
      return [
        h('svg', {
          class: 'svg-icon',
          style: { 'font-size': '16px' },
          attrs: {
            'aria-hidden': true
          }
        }, [h('use', {
          attrs: {
            'xlink:href': '#lapa-middle-reputation'
          }
        }, '')]),
        h('span', {
          style: {
            'margin-left': '2px'
          }
        }, text)
      ]
    },
    // 差评图标
    badReputation(h, text) {
      return [
        h('svg', {
          class: 'svg-icon',
          style: { 'font-size': '16px' },
          attrs: {
            'aria-hidden': true
          }
        }, [h('use', {
          attrs: {
            'xlink:href': '#lapa-bad-reputation'
          }
        }, '')]),
        h('span', {
          style: {
            'margin-left': '2px'
          }
        }, text)
      ]
    },
    selectChange(val) {
      this.selectList = val
    },
    // 设置付款时间
    setTimeArr() {
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
      this.$nextTick(() => {
        this.payTimeArr = [start, end];
        this.getDateValue(this.payTimeArr);
      });
    }
  },
  mounted() {
    this.uploadedImgList = this.$refs.upload ? this.$refs.upload.fileList : [];
    setTimeout(this.getCountrys(), 2000); // 获取国家区域列表
    this.$nextTick(() => {
      // if (this.isCancelOrder) {
      //   this.refundTimeArr = [start, end];
      //   this.refundGetDateValue(this.refundTimeArr);
      // }
      this.handUrlParams();
    });
  }
};
</script>

<style lang="less" scoped>
:deep(.gross-profit-style) {
  .ivu-table-cell {
    text-align: left;
  }
}
</style>
