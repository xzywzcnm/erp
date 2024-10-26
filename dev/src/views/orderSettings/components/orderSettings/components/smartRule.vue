<template >
  <div>
    <Form :disabled="looKsettings">
      <div v-if="ruleType === 'smart' && ruleParmas && ruleParmas.copy" class="warehouse-box">
        适用仓库：
        <dyt-select v-model="ruleParmas.businessId" ref="warehouseRef" style="width: 200px" filterable>
          <Option v-for="item in storeList" :value="item.warehouseId" :key="item.warehouseId" :label="item.title" />
        </dyt-select>
      </div>
      <Row :gutter="10">
        <Col :span="15">
        <div class="normalPaddingRight normalTop">
          <div class="modalItem">
            <div class="modalItemHeader">
              <h6>已选条件</h6>
            </div>
            <div class="modalItemContent">
              <template>
                <!-- 订单来源 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A001')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A001'].platformIds}">订单来源为 </span>
                  <span
                    class="blueColor itemPaddingRight cursor"
                    v-if="!componentsStatus['order-service-A001'].platformIds"
                    @click="addItem('platformIds', 'order-service-A001')"
                  >
                    {{ source.platformIds.length > 0 ? `${source.platformIds.toString()} ` : '指定平台 ' }}
                  </span>
                  <dyt-select
                    v-if="componentsStatus['order-service-A001'].platformIds && platform.length > 0"
                    v-model="componentsModel['order-service-A001'].platformIds"
                    multiple style="width: 100px"
                    @on-change="changeValue('order-service-A001', 'platformIds')"
                  >
                    <Option v-for="item in shipmentPlatformList" :value="item.platformId" :key="item.platformId"> {{ item.name }}</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A001'].platformIds}">并且为 </span>
                  <span class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['order-service-A001'].platformIds}"
                    @click="addItem('siteIds', 'order-service-A001', 'platformIds')" v-if="!componentsStatus['order-service-A001'].siteIds"
                  >
                    {{ source.siteIds.length > 0 ? source.siteIds.toString() : '指定站点 ' }}
                  </span>
                  <dyt-select
                    v-if="componentsStatus['order-service-A001'].siteIds" style="width: 160px" v-model="componentsModel['order-service-A001'].siteIds"
                    filterable multiple placeholder="请选择或输入所在地"
                  >
                    <Option v-for="(item, index) in sitesList" :key="index" :value="item.siteId" :v="item.cnName">{{ item.cnName }}</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A001'].platformIds}">并且为 </span>
                  <span
                    class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['order-service-A001'].platformIds}"
                    v-if="!componentsStatus['order-service-A001'].saleAccountIds"
                    @click="addItem('saleAccountIds', 'order-service-A001', 'saleAccountIds')"
                  >
                    {{ source.saleAccountIds.length > 0 ? source.saleAccountIds.toString() : '指定帐号' }}
                  </span>
                  <dytStoreSelect
                    style="width: 220px"
                    v-model="componentsModel['order-service-A001'].saleAccountIds"
                    :option-data="platformAccountList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                    v-if="componentsStatus['order-service-A001'].saleAccountIds"
                  />
                </div>
                <!-- 买家选择的运输类型 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A003')) >= 0">
                  <span class="itemPaddingRight">买家选择的运输类型为</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('shipmentTypes', 'order-service-A003')" transfer width="700" placement="right">
                      <span class="blueColor cursor max-height-300">
                        {{ shipmentTagModel.length > 0 ? '' : '指定类型' }}
                        <span v-show="shipmentTagModel.length > 0" class="mr20" v-for="(item,index) in shipmentTagModel" :key="index">{{ item }}</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div>已选择</div>
                        <div class="breakWord max-height-300">
                          <Tag
                            closable
                            :color="tagColor(item)"
                            v-for="(item, index) in shipmentTagModel"
                            :key="index"
                            @on-close="delTag(index)"
                            class="tag-close-style"
                          >{{ item }}</Tag>
                        </div>
                        <div class="divider normalTop"></div>
                        <div class="platformSelect normalTop">
                          <dyt-select v-model="shipmentPlatformModel" style="width:150px" @on-change="getSite" placeholder="请选择平台">
                            <Option v-for="item in shipmentPlatformList" :key="item.platformId" :value="item.platformId">{{ item.name }}</Option>
                          </dyt-select>
                          <dyt-select v-model="shipmentPlatformSite" v-if="hasSite" style="width:150px; margin-left:10px" @on-change="setSite">
                            <Option v-for="item in shipmentPlatformSiteList" :key="item.siteId" :value="item.siteId">{{ item.cnName }}</Option>
                          </dyt-select>
                        </div>
                        <div class="normalTop">
                          <Input v-model.trim="shipmentSearchValue" style="width:310px" @on-enter="shipmentSearch(false)" placeholder="请输入运输类型名称搜索" />
                        </div>
                        <div class="normalTop" v-if="addiblePlatform.includes(shipmentPlatformModel)">
                          <Input v-model.trim='shippingMethodName' placeholder="新增运输类型" style="width:310px;margin-right:10px" />
                          <Button @click='saveShopifyLogisticsMode'>保存</Button>
                        </div>
                        <div class="normalTop" v-if="shipmentPlatformModel !== '' && smShippingMethodList.length != 0">
                          <CheckboxGroup v-model="shipmentCheckBoxModel" @on-change="setTagValue">
                            <div class="checkboxContainer">
                              <div class="normalTop" v-for="(item, index) in smShippingMethodList" :key="`${item.siteId}-${index}`">
                                <Checkbox
                                  v-if="item.siteId"
                                  :label="shipmentPlatformModel + ':' +item.siteId + ':' +item.siteName + ':'+ item.shippingMethodName + ':' + item.shippingMethodDescription"
                                >{{ item.shippingMethodDescription }}</Checkbox>
                                <Checkbox
                                  v-else
                                  :label="shipmentPlatformModel + ':' + item.shippingMethodName + ':' + item.shippingMethodDescription"
                                >
                                  <span>{{ item.shippingMethodDescription }}</span>
                                </Checkbox>
                                <!--您确定要删除吗-->
                                <Poptip confirm title="您确定要删除吗？" @on-ok="deleteShipMethod(item.merchantShippingMethodId,index)">
                                  <Icon type="ios-close-circle" v-if="addiblePlatform.includes(shipmentPlatformModel)" />
                                </Poptip>
                              </div>
                            </div>
                          </CheckboxGroup>
                        </div>
                        <div v-if="shipmentPlatformModel !== '' && smShippingMethodList.length == 0" style="padding:10px;color:#999;">暂无数据!</div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单收货地址省/州 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A005')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A005'].states}">订单收货地址省/州为 </span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['order-service-A005'].states" @click="addItem('states', 'order-service-A005')">
                    {{
                      componentsModel['order-service-A005'].states === ''
                      ? '指定省/州 '
                      : componentsModel['order-service-A005'].states + ' '
                    }}
                  </span>
                  <Input style="width:100px" v-if="componentsStatus['order-service-A005'].states" v-model.trim="componentsModel['order-service-A005'].states"></Input>
                </div>
                <!-- 订单收货地址城市 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A006')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A006'].cities}">订单收货地址城市为 </span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['order-service-A006'].cities" @click="addItem('cities', 'order-service-A006')">
                    {{
                      componentsModel['order-service-A006'].cities === ''
                      ? '指定城市 '
                      : componentsModel['order-service-A006'].cities + ' '
                    }}
                  </span>
                  <Input style="width:100px" v-if="componentsStatus['order-service-A006'].cities" v-model.trim="componentsModel['order-service-A006'].cities"></Input>
                </div>
                <!-- 订单总金额 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A007')) >= 0">
                  <span class="itemPaddingRight">订单总金额</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('amountRange', 'order-service-A007')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="ml10" v-if="amountRange.usdFloor !== 0 || amountRange.usdUpper !== 0">
                        {{ ($common.isEmpty(amountRange.usdFloor) ? 0 : amountRange.usdFloor) + '-' + ($common.isEmpty(amountRange.usdUpper) ? 0 : amountRange.usdUpper) }}(USD)
                        </span>
                        <span class="ml10" v-if="amountRange.eurFloor !== 0 || amountRange.eurUpper !== 0">
                        {{ ($common.isEmpty(amountRange.eurFloor) ? 0 : amountRange.eurFloor) + '-' + ($common.isEmpty(amountRange.eurUpper) ? 0 : amountRange.eurUpper) }}(EUR)
                        </span>
                        <span class="ml10" v-if="amountRange.gbpFloor !== 0 || amountRange.gbpUpper !== 0">
                        {{ ($common.isEmpty(amountRange.gbpFloor) ? 0 : amountRange.gbpFloor) + '-' + ($common.isEmpty(amountRange.gbpUpper) ? 0 : amountRange.gbpUpper) }}(GBP)
                        </span>
                        <span class="ml10" v-if="amountRange.audFloor !== 0 || amountRange.audUpper !== 0">
                        {{ ($common.isEmpty(amountRange.audFloor) ? 0 : amountRange.audFloor) + '-' + ($common.isEmpty(amountRange.audUpper) ? 0 : amountRange.audUpper) }}(AUD)
                        </span>
                        <span v-if="amountRange.usdUpper === 0 && amountRange.eurUpper === 0 && amountRange.gbpUpper === 0 && amountRange.audUpper === 0">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <Form ref="amountRange" :model="amountRange" :disabled="looKsettings" :label-width="80">
                          <FormItem label="美元(USD)" class="form-item-range">
                            <InputNumber style="width:80px" :min="0" v-model="amountRange.usdFloor"  @on-change="numberChange($event, 'usd')" />
                            <span>-</span>
                            <InputNumber style="width:80px" :min="0" v-model="amountRange.usdUpper" @on-blur="numberBlur($event, 'usd')" />
                          </FormItem>
                          <FormItem label="或欧元(EUR)" class="form-item-range">
                            <InputNumber style="width:80px" :min="0" v-model="amountRange.eurFloor" @on-change="numberChange($event, 'eur')" />
                            <span>-</span>
                            <InputNumber style="width:80px" :min="0" @on-blur="numberBlur($event, 'eur')" v-model="amountRange.eurUpper" />
                          </FormItem>
                          <FormItem label="或英镑(GBP)" class="form-item-range">
                            <InputNumber style="width:80px" :min="0" v-model="amountRange.gbpFloor" @on-change="numberChange($event, 'gbp')" />
                            <span>-</span>
                            <InputNumber style="width:80px" :min="0" @on-blur="numberBlur($event, 'gbp')" v-model="amountRange.gbpUpper" />
                          </FormItem>
                          <FormItem label="或澳元(AUD)" class="form-item-range">
                            <InputNumber style="width:80px" :min="0" v-model="amountRange.audFloor" @on-change="numberChange($event, 'aud')" />
                            <span>-</span>
                            <InputNumber style="width:80px" :min="0" @on-blur="numberBlur($event, 'aud')" v-model="amountRange.audUpper" />
                          </FormItem>
                        </Form>
                        <div class="redColor">注：其他币种转化成美元,所有选项都必须填写</div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单目的地 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A004')) >= 0">
                  <!-- 订单目的地为 -->
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A004'].countryCodes}">订单目的地为</span>
                  <!-- 指定国家 -->
                  <span
                    v-if="!componentsStatus['order-service-A004'].countryCodes" class="blueColor itemPaddingRight cursor countryCodesName"
                    @click="addItem('countryCodes', 'order-service-A004')"
                  >
                    {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
                  </span>
                  <erpTreeSelect
                    v-if="componentsStatus['order-service-A004'].countryCodes"
                    class="country-codes-calss"
                    v-model="countryCodes"
                    :multiple="true"
                    :normalizer="treeNormalizer"
                    :options="countryData"
                    :default-expand-level="1"
                    :appendToBody="true"
                    placeholder="请选择"
                    noResultsText="无匹配数据"
                    style="display: inline-block; margin-right: 5px; width:200px; vertical-align: middle;"
                    @input="getTreeData"
                    @open="openTree"
                    @close="closeTree"
                    zIndex="9999999999"
                  />
                  <dyt-input-tag
                    style="display: inline-block; width: 300px; vertical-align: middle;"
                    v-if="componentsStatus['order-service-A004'].countryCodes"
                    type="textarea"
                    :limit="1"
                    placeholder="请输入国家名称，多个可用逗号或换行隔开"
                    v-model="textareaCountryCodes"
                  />
                  <!-- 且邮编在 -->
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A004'].countryCodes}">且邮编在</span>
                  <span class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['order-service-A004'].countryCodes}">
                    <Poptip @on-popper-show="addItem('buyerPostalCodes', 'order-service-A004')" transfer width="500" placement="bottom">
                      <!-- 指定范围 -->
                      <span class="blueColor itemPaddingRight cursor">
                        <!-- {{
                        postcodeOne !== '' && postcodeTwo !== '' ? postcodeOne + '-' + postcodeTwo :
                          postcodeOne !== '' && postcodeTwo === '' ? postcodeOne : postcodeArea !== '' ? postcodeArea :
                        '指定范围'
                      }} -->
                        <span v-for="(item, index) in postcodeArr" :key="index">
                          <span v-if="index > 0">, </span>
                          {{
                            item.postcode1 !== '' && item.postcode2 !== ''
                            ? item.postcode1 + '-' + item.postcode2
                            : postcodeArea !== '' ? postcodeArea : '指定范围'
                          }}
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <RadioGroup v-model="componentsModel['order-service-A004'].postalCodeType" @on-change="getPostCodeType">
                          <!-- 邮编段 -->
                          <Radio :label="0">
                            <span>邮编段</span>
                          </Radio>
                          <!-- 邮编列表 -->
                          <Radio :label="1">
                            <span>邮编列表</span>
                          </Radio>
                        </RadioGroup>
                        <!-- 邮编段 -->
                        <div class="normalTop" v-if="componentsModel['order-service-A004'].postalCodeType === 0">
                          <!-- <Input v-model.trim="postcodeOne" style="width:150px"></Input>
                          <span> - </span>
                          <Input v-model.trim="postcodeTwo" style="width:150px"></Input> -->
                          <div v-for="(item, index) in postcodeArr" :key="index" class="normalMarginBottom">
                            <Input v-model.trim="item.postcode1" style="width:150px"></Input>
                            <span> - </span>
                            <Input v-model.trim="item.postcode2" style="width:150px"></Input>
                            <Button type="primary" shape="circle" icon="md-add" class="normalLMargin" v-if="index === 0" @click="addPostcodeFn"></Button>
                            <Button type="error" shape="circle" icon="md-remove" class="normalLMargin" v-if="index > 0" @click="deletePostcodeFn(index)"></Button>
                          </div>
                        </div>
                        <!-- 邮编列表 -->
                        <div class="normalTop" v-if="componentsModel['order-service-A004'].postalCodeType === 1">
                          <Input v-model="postcodeArea" style="width:300px" type="textarea" :rows="5" placeholder="多邮编换行请求半角输入逗号隔开"></Input>
                        </div>
                      </div>
                    </Poptip>
                  </span>

                </div>

                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A034')) >= 0">
                  <span class="itemPaddingRight">订单产品店铺SKU</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('shopSku', 'order-service-A034')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        {{
                          shopSkuModel === 0 ? `以${shopSku.start}开头` : shopSkuModel === 1 ? `以${shopSku.end}结尾` : '指定规律'
                        }}
                      </span>
                      <div slot="content" class="keywordString shopSku">
                        <RadioGroup v-model="shopSkuModel" vertical>
                          <Radio :label="0">
                            以 <Input v-model.trim="shopSku.start" style="width:160px"></Input> 开头
                          </Radio>
                          <Radio :label="1" style="margin-top:10px">
                            以 <Input v-model.trim="shopSku.end" style="width:160px"></Input> 结尾
                          </Radio>
                        </RadioGroup>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单产品包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A009')) >= 0">
                  <span
                    class="itemPaddingRight">发货信息包含</span> <span v-if="!componentsStatus['order-service-A009'].productCategories"
                    class="blueColor itemPaddingRight cursor" @click="addItem('productCategories', 'order-service-A009')"
                  >
                    {{
                      componentsModel['order-service-A009'].productCategories.length > 0
                      ? productCategoryListName
                      : '指定分类'
                    }}
                  </span>
                  <erpTreeSelect
                    v-if="componentsStatus['order-service-A009'].productCategories"
                    v-model="country1Codes"
                    :multiple="true"
                    :normalizer="tree1Normalizer"
                    :options="productCategoryTree"
                    :default-expand-level="1"
                    :appendToBody="true"
                    placeholder="请选择"
                    noResultsText="无匹配数据"
                    style="display: inline-block; margin-right: 5px; width:200px; vertical-align: middle;"
                    @input="getTree1Data"
                    zIndex="9999999999"
                  />
                  <!--<dyt-select  v-model="" style="width:100px" multiple>
                      <Option v-for="item in productCategoryList" :key="item.productCategoryId" :value="item.productCategoryId">{{item.cnName}}</Option>
                    </dyt-select>-->
                  <span class="itemPaddingRight">或</span> <span class="blueColor itemPaddingRight cursor">
                    <Poptip @on-popper-show="addItem('skus', 'order-service-A009')" transfer width="350" placement="bottom" v-model="skusStatus">
                      <span class="blueColor cursor">
                        {{ $common.isEmpty(orderserviceA009TXT) ? '指定SKU' : orderserviceA009TXT }}
                      </span>
                      <div slot="content">
                        <Input
                          v-model.trim="componentsModel['order-service-A009'].skus" type="textarea" :rows="4"
                          style="width:300px" placeholder="请输入SKU，多个SKU用逗号或换行隔开"
                        />
                      </div>
                    </Poptip>
                  </span>
                  <span class="itemPaddingRight">或</span>
                  <span
                    v-if="!componentsStatus['order-service-A009'].productTags" class="blueColor itemPaddingRight cursor"
                    @click="addItem('productTags', 'order-service-A009')"
                  >
                    <template v-if="componentsModel['order-service-A009'].productTags.length > 0">
                      <template v-for="(tag, tagIndex) in productTagList">
                        <span :key="`tag${tagIndex}`" v-if="componentsModel['order-service-A009'].productTags.includes(tag.productTagId)">
                          {{tag.name}}
                        </span>
                      </template>
                    </template>
                    <template v-else>指定商品标签</template>
                    <!-- {{
                        componentsModel['order-service-A009'].productTags.length > 0
                        ? componentsModel['order-service-A009'].productTags.toString()
                        : '指定商品标签'
                      }} -->
                  </span>
                  <dyt-select
                    v-if="componentsStatus['order-service-A009'].productTags" v-model="componentsModel['order-service-A009'].productTags"
                    style="max-width:200px" multiple
                  >
                    <Option v-for="(item, index) in productTagList" :key="index" :value="item.productTagId">{{ item.name }}</Option>
                  </dyt-select>
                </div>
                <!-- 订单产品包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A043')) >= 0">
                  <span class="itemPaddingRight">订单产品包含</span> <span class="blueColor itemPaddingRight cursor">
                    <Poptip @on-popper-show="addItem('skus', 'order-service-A043')" transfer width="350" placement="bottom" v-model="skusStatus1">
                      <span class="blueColor cursor">
                        {{ $common.isEmpty(orderserviceA043TXT) ? '指定SKU' : orderserviceA043TXT }}
                      </span>
                      <div slot="content">
                        <Input
                          v-model.trim="componentsModel['order-service-A043'].skus" type="textarea" :rows="4"
                          style="width:300px" placeholder="请输入SKU，多个SKU用逗号或换行隔开"
                        />
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- eBay订单 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A010')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A010'].isEbayPlus}">eBay订单 </span>
                  <span
                    v-if="!componentsStatus['order-service-A010'].isEbayPlus" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isEbayPlus', 'order-service-A010')"
                  >
                    {{ componentsModel['order-service-A010'].isEbayPlus === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select
                    v-if="componentsStatus['order-service-A010'].isEbayPlus" v-model="componentsModel['order-service-A010'].isEbayPlus"
                    class="itemPaddingRight" style="width:70px"
                  >
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A010'].isEbayPlus}">
                    eBayPlus订单
                  </span>
                </div>
                <!-- eBay订单EGD -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A012')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A012'].include}">eBay订单 </span>
                  <span v-if="!componentsStatus['order-service-A012'].include" class="blueColor itemPaddingRight cursor" @click="addItem('include', 'order-service-A012')">
                    {{ componentsModel['order-service-A012'].include === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A012'].include" v-model="componentsModel['order-service-A012'].include" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A012'].include}">
                    包含EGD物品
                  </span>
                </div>
                <!-- 产品刊登标题所含关键字包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A011')) >= 0">
                  <span class="itemPaddingRight">产品刊登标题所含关键字包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('productKeyword', 'order-service-A011')" transfer width="500" placement="bottom">
                      <a v-if="componentsModel['order-service-A011'].productKeyword.length > 1 && componentsModel['order-service-A011'].productKeyword[0].value !== ''">
                        <span class="mr5" v-for="(item,index) in componentsModel['order-service-A011'].productKeyword" :key="index">{{ item.value }}</span>
                      </a>
                      <a v-else>指定字符串</a>
                      <div slot="content" class="keywordString">
                        <RadioGroup v-model="componentsModel['order-service-A011'].type">
                          <Radio :label="0">
                            <span>以下关键字都必须包含</span>
                          </Radio>
                          <Radio :label="1">
                            <span>以下关键字包含任意一个</span>
                          </Radio>
                        </RadioGroup>
                        <Form ref="productKeyword" :model="componentsModel['order-service-A011']" :label-width="80" :disabled="looKsettings" style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['order-service-A011'].productKeyword" :key="index" :label="'关键字' + index">
                            <Row>
                              <Col span="18">
                              <Input type="text" v-model.trim="item.value" placeholder="请输入关键字"></Input>
                              </Col>
                              <Col span="4" offset="1">
                              <Button @click="handleRemove(index)">删除</Button>
                              </Col>
                            </Row>
                          </FormItem>
                          <FormItem>
                            <Row>
                              <Col span="12">
                              <Button type="dashed" long @click="handleAdd" icon="md-add">新增</Button>
                              </Col>
                            </Row>
                          </FormItem>
                        </Form>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf('O0121') >= 0">
                  <span class="itemPaddingRight">产品刊登标题所含关键字包含</span> <span class="blueColor itemPaddingRight">
                    指定字符串2
                  </span>
                </div>
                <!-- 货品所在地为 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A013')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A013'].goodsCountry}">货品所在地为</span>
                  <span
                    v-if="!componentsStatus['order-service-A013'].goodsCountry" class="blueColor itemPaddingRight cursor"
                    @click="addItem('goodsCountry', 'order-service-A013')"
                  >
                    {{
                        componentsModel['order-service-A013'].goodsCountry !== ''
                        ? componentsModel['order-service-A013'].goodsCountry
                        : '指定国家'
                      }}
                  </span>
                  <dyt-select v-if="componentsStatus['order-service-A013'].goodsCountry"
                    style="width: 100px" v-model="componentsModel['order-service-A013'].goodsCountry" filterable placeholder="请选择或输入所在地"
                  >
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A013'].goodsCountry}">且</span>
                  <span
                    v-if="!componentsStatus['order-service-A013'].goodsCity" class="blueColor itemPaddingRight cursor"
                    :class="{textMarginTop: componentsStatus['order-service-A013'].goodsCountry}" @click="addItem('goodsCity', 'order-service-A013')"
                  >
                    {{
                      componentsModel['order-service-A013'].goodsCity !== ''
                      ? componentsModel['order-service-A013'].goodsCity
                      : '指定城市'
                    }}
                  </span>
                  <Input
                    style="width:100px" v-if="componentsStatus['order-service-A013'].goodsCity" placeholder="城市"
                    v-model.trim="componentsModel['order-service-A013'].goodsCity"
                  />
                    <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A013'].goodsCountry}">且</span>
                    <span
                      v-if="!componentsStatus['order-service-A013'].goodsPostalCode" class="blueColor itemPaddingRight cursor"
                      :class="{textMarginTop: componentsStatus['order-service-A013'].goodsCountry}" @click="addItem('goodsPostalCode', 'order-service-A013')"
                    >
                    {{
                      componentsModel['order-service-A013'].goodsPostalCode !== ''
                      ? componentsModel['order-service-A013'].goodsPostalCode
                      : '指定邮编'
                    }}
                  </span>
                  <Input
                    style="width:100px" v-if="componentsStatus['order-service-A013'].goodsPostalCode" placeholder="指定邮编"
                    v-model.trim="componentsModel['order-service-A013'].goodsPostalCode"
                  />
                </div>
                <!-- 订单收件人姓名/地址存在指定异常 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A020')) >= 0">
                  <span class="itemPaddingRight">订单收件人姓名/地址存在</span>
                  <span class="blueColor itemPaddingRight cursor" @click="addItem('anomalousList', 'order-service-A020')">
                    指定异常
                  </span>
                </div>
                <!-- 订单收货邮编字符长度指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A018')) >= 0">
                  <span class="itemPaddingRight">订单收货邮编字符长度</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('zipCodeParams', 'order-service-A018')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单收货邮编字符长度满足以下选中的条件:</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A018'].zipCodeParams.checkbox1"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A018'].zipCodeParams.startType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A018'].zipCodeParams.checkbox1"
                          >
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A018'].zipCodeParams.checkbox1"
                            v-model="componentsModel['order-service-A018'].zipCodeParams.startValue"
                          />
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A018'].zipCodeParams.checkbox2"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A018'].zipCodeParams.endType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A018'].zipCodeParams.checkbox2"
                          >
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A018'].zipCodeParams.checkbox2"
                            v-model="componentsModel['order-service-A018'].zipCodeParams.endValue"
                          />
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单收货地址街道信息字符长度小于指定长度 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A016')) >= 0">
                  <span class="itemPaddingRight">订单收货地址街道信息字符长度小于</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('length', 'order-service-A016')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定长度
                      </span>
                      <span>{{ componentsModel['order-service-A016'].length }}</span>
                      <div slot="content" class="keywordString">
                        <span>订单地址信息字符长度小于：</span>
                        <InputNumber :min="0" size="small" class="ml10" v-model="componentsModel['order-service-A016'].length"></InputNumber>
                        <div style="color: red;" class="mt10">
                          *此处地址信息由街道1与街道2合并组成，不包含国家/地区、省州、城市信息。
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单/交易/运输类型的关系满足指定条件 -->
                <div class="uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A014')) >= 0">
                  <span class="itemPaddingRight">订单/交易/运输类型的关系满足</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('selectType', 'order-service-A014')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['order-service-A014'].selectType === 0">订单包含多个交易（且运输类型完全相同 ） 或者 订单仅包含一个交易</span>
                        <span v-else-if="componentsModel['order-service-A014'].selectType === 1">订单包含多个交易（且运输类型不完全相同 ）</span>
                        <span v-else>指定条件</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <RadioGroup v-model="componentsModel['order-service-A014'].selectType">
                          <Radio :label="0" class="mt10">订单包含多个交易（且运输类型完全相同 ） 或者 订单仅包含一个交易</Radio>
                          <br>
                          <Radio :label="1" class="mt10">订单包含多个交易（且运输类型不完全相同 ）</Radio>
                        </RadioGroup>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品总数量指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A022')) >= 0">
                  <span class="itemPaddingRight">订单货品总数量</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtNumParams', 'order-service-A022')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.checkbox1 || componentsModel['order-service-A022'].orderPdtNumParams.checkbox2">
                          <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.checkbox1">
                            <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.beginType === 0">&ge;</span>
                            <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.beginType === 1">&gt;</span>
                            <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.beginType === 2">=</span>
                            {{ componentsModel['order-service-A022'].orderPdtNumParams.beginValue }}
                          </span>
                          <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.checkbox2">
                            <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.endType ===0">&lt;</span>
                            <span v-if="componentsModel['order-service-A022'].orderPdtNumParams.endType ===1">&le;</span>
                            {{ componentsModel['order-service-A022'].orderPdtNumParams.endValue }}
                          </span>
                        </span>
                        <span v-else>指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品总数量满足以下选中的条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A022'].orderPdtNumParams.checkbox1"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A022'].orderPdtNumParams.beginType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A022'].orderPdtNumParams.checkbox1"
                          >
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A022'].orderPdtNumParams.checkbox1"
                            v-model="componentsModel['order-service-A022'].orderPdtNumParams.beginValue"
                          />
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A022'].orderPdtNumParams.checkbox2"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A022'].orderPdtNumParams.endType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A022'].orderPdtNumParams.checkbox2"
                          >
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A022'].orderPdtNumParams.checkbox2"
                            v-model="componentsModel['order-service-A022'].orderPdtNumParams.endValue"
                          />
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品周长指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A049')) >= 0">
                  <span class="itemPaddingRight">订单货品周长</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtBulkParams', 'order-service-A049')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A049'].orderPdtBulkParams.beginValue != 0 && componentsModel['order-service-A049'].orderPdtBulkParams.checkbox1"
                        >
                          <span v-if="componentsModel['order-service-A049'].orderPdtBulkParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A049'].orderPdtBulkParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A049'].orderPdtBulkParams.beginValue }}
                        </span>
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A049'].orderPdtBulkParams.endValue != 0&& componentsModel['order-service-A049'].orderPdtBulkParams.checkbox2"
                        >
                          <span v-if="componentsModel['order-service-A049'].orderPdtBulkParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A049'].orderPdtBulkParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A049'].orderPdtBulkParams.endValue }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品周长满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A049'].orderPdtBulkParams.checkbox1"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A049'].orderPdtBulkParams.beginType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A049'].orderPdtBulkParams.checkbox1"
                          >
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A049'].orderPdtBulkParams.checkbox1"
                            v-model="componentsModel['order-service-A049'].orderPdtBulkParams.beginValue"
                          />
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A049'].orderPdtBulkParams.checkbox2"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A049'].orderPdtBulkParams.endType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A049'].orderPdtBulkParams.checkbox2"
                          >
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A049'].orderPdtBulkParams.checkbox2"
                            v-model="componentsModel['order-service-A049'].orderPdtBulkParams.endValue"
                          />
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，<br>
                          所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d，<br>
                          则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品 <br>
                          高度，长 + 2*(宽 + 高)即订单货品周长。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品体积指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A028')) >= 0">
                  <span class="itemPaddingRight">订单货品体积</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtBulkParams', 'order-service-A028')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A028'].orderPdtBulkParams.beginValue != 0 && componentsModel['order-service-A028'].orderPdtBulkParams.checkbox1"
                        >
                          <span v-if="componentsModel['order-service-A028'].orderPdtBulkParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A028'].orderPdtBulkParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A028'].orderPdtBulkParams.beginValue }}
                        </span>
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A028'].orderPdtBulkParams.endValue != 0&& componentsModel['order-service-A028'].orderPdtBulkParams.checkbox2"
                        >
                          <span v-if="componentsModel['order-service-A028'].orderPdtBulkParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A028'].orderPdtBulkParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A028'].orderPdtBulkParams.endValue }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品体积满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A028'].orderPdtBulkParams.checkbox1"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A028'].orderPdtBulkParams.beginType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A028'].orderPdtBulkParams.checkbox1"
                          >
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A028'].orderPdtBulkParams.checkbox1"
                            v-model="componentsModel['order-service-A028'].orderPdtBulkParams.beginValue"
                          />
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A028'].orderPdtBulkParams.checkbox2"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A028'].orderPdtBulkParams.endType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A028'].orderPdtBulkParams.checkbox2"
                          >
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A028'].orderPdtBulkParams.checkbox2"
                            v-model="componentsModel['order-service-A028'].orderPdtBulkParams.endValue"
                          />
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，<br>
                          所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d，<br>
                          则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品 <br>
                          高度，a*b*d即订单货品体积。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品宽度指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A026')) >= 0">
                  <span class="itemPaddingRight">订单货品宽度</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtWidthParams', 'order-service-A026')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A026'].orderPdtWidthParams.beginValue != 0 && componentsModel['order-service-A026'].orderPdtWidthParams.checkbox1"
                        >
                          <span v-if="componentsModel['order-service-A026'].orderPdtWidthParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A026'].orderPdtWidthParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A026'].orderPdtWidthParams.beginValue }}
                        </span>
                        <span
                          class="cpd"
                          v-if="componentsModel['order-service-A026'].orderPdtWidthParams.endValue != 0&& componentsModel['order-service-A026'].orderPdtWidthParams.checkbox2"
                        >
                          <span v-if="componentsModel['order-service-A026'].orderPdtWidthParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A026'].orderPdtWidthParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A026'].orderPdtWidthParams.endValue }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品宽度满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A026'].orderPdtWidthParams.checkbox1"></Checkbox>
                          <dyt-select
                            v-model="componentsModel['order-service-A026'].orderPdtWidthParams.beginType" style="width:120px;" size="small"
                            :disabled="!componentsModel['order-service-A026'].orderPdtWidthParams.checkbox1"
                          >
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber
                            :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A026'].orderPdtWidthParams.checkbox1"
                            v-model="componentsModel['order-service-A026'].orderPdtWidthParams.beginValue"
                          />
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A026'].orderPdtWidthParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A026'].orderPdtWidthParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A026'].orderPdtWidthParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A026'].orderPdtWidthParams.checkbox2" v-model="componentsModel['order-service-A026'].orderPdtWidthParams.endValue"></InputNumber>
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c， <br> 所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d， <br> 则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品高度。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品高度指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A027')) >= 0">
                  <span class="itemPaddingRight">订单货品高度</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtHeightParams', 'order-service-A027')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围<span class="cpd" v-if="componentsModel['order-service-A027'].orderPdtHeightParams.beginValue != 0 && componentsModel['order-service-A027'].orderPdtHeightParams.checkbox1">
                          <span v-if="componentsModel['order-service-A027'].orderPdtHeightParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A027'].orderPdtHeightParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A027'].orderPdtHeightParams.beginValue }}
                        </span>
                        <span class="cpd" v-if="componentsModel['order-service-A027'].orderPdtHeightParams.endValue != 0 && componentsModel['order-service-A027'].orderPdtHeightParams.checkbox2">
                          <span v-if="componentsModel['order-service-A027'].orderPdtHeightParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A027'].orderPdtHeightParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A027'].orderPdtHeightParams.endValue }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品高度满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A027'].orderPdtHeightParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A027'].orderPdtHeightParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A027'].orderPdtHeightParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A027'].orderPdtHeightParams.checkbox1" v-model="componentsModel['order-service-A027'].orderPdtHeightParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A027'].orderPdtHeightParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A027'].orderPdtHeightParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A027'].orderPdtHeightParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A027'].orderPdtHeightParams.checkbox2" v-model="componentsModel['order-service-A027'].orderPdtHeightParams.endValue"></InputNumber>
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，<br> 所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d， <br> 则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品高度。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品长度指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A025')) >= 0">
                  <span class="itemPaddingRight">订单货品长度</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtLengthParams', 'order-service-A025')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围<span class="cpd" v-if="componentsModel['order-service-A025'].orderPdtLengthParams.beginValue != 0 && componentsModel['order-service-A025'].orderPdtLengthParams.checkbox1">
                          <span v-if="componentsModel['order-service-A025'].orderPdtLengthParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A025'].orderPdtLengthParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A025'].orderPdtLengthParams.beginValue }}
                        </span>
                        <span class="cpd" v-if="componentsModel['order-service-A025'].orderPdtLengthParams.endValue != 0 && componentsModel['order-service-A025'].orderPdtLengthParams.checkbox2">
                          <span v-if="componentsModel['order-service-A025'].orderPdtLengthParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A025'].orderPdtLengthParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A025'].orderPdtLengthParams.endValue }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品长度满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A025'].orderPdtLengthParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A025'].orderPdtLengthParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A025'].orderPdtLengthParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A025'].orderPdtLengthParams.checkbox1" v-model="componentsModel['order-service-A025'].orderPdtLengthParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A025'].orderPdtLengthParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A025'].orderPdtLengthParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A025'].orderPdtLengthParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A025'].orderPdtLengthParams.checkbox2" v-model="componentsModel['order-service-A025'].orderPdtLengthParams.endValue"></InputNumber>
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，<br> 所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d， <br> 则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品高度。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单重量指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A024')) >= 0">
                  <span class="itemPaddingRight">订单重量</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderPdtWeightParams', 'order-service-A024')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围<span class="cpd" v-if="componentsModel['order-service-A024'].orderPdtWeightParams.beginValue != 0 && componentsModel['order-service-A024'].orderPdtWeightParams.checkbox1">
                          <span v-if="componentsModel['order-service-A024'].orderPdtWeightParams.beginType == '0'">&ge;</span>
                          <span v-else-if="componentsModel['order-service-A024'].orderPdtWeightParams.beginType == '1'">&gt;</span>
                          <span v-else>=</span>{{ componentsModel['order-service-A024'].orderPdtWeightParams.beginValue }}
                        </span>
                        <span class="cpd" v-if="componentsModel['order-service-A024'].orderPdtWeightParams.endValue != 0 && componentsModel['order-service-A024'].orderPdtWeightParams.checkbox2">
                          <span v-if="componentsModel['order-service-A024'].orderPdtWeightParams.endType == '0'">&lt;</span>
                          <span v-else-if="componentsModel['order-service-A024'].orderPdtWeightParams.endType == '1'">&le;</span>
                          <span>{{ componentsModel['order-service-A024'].orderPdtWeightParams.endValue }}</span>
                        </span>
                        <span class="cpd" v-if="componentsModel['order-service-A024'].orderPdtWeightParams.computeWeightFactor != 0 && componentsModel['order-service-A024'].orderPdtWeightParams.checkbox3">
                          体积重计重因子<span>{{ componentsModel['order-service-A024'].orderPdtWeightParams.computeWeightFactor }}</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单重量满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A024'].orderPdtWeightParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A024'].orderPdtWeightParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox1" v-model="componentsModel['order-service-A024'].orderPdtWeightParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A024'].orderPdtWeightParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A024'].orderPdtWeightParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox2" v-model="componentsModel['order-service-A024'].orderPdtWeightParams.endValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox1 && !componentsModel['order-service-A024'].orderPdtWeightParams.checkbox2" v-model="componentsModel['order-service-A024'].orderPdtWeightParams.checkbox3"></Checkbox>
                          与体积重取重对比取重的作为订单重量计算
                          <span>体积重计重因子</span>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A024'].orderPdtWeightParams.checkbox3" v-model="componentsModel['order-service-A024'].orderPdtWeightParams.computeWeightFactor"></InputNumber>
                        </div>
                        <p class="mt10">
                          提示：订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，所有<br>a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d，则a、b、<br>d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品高度。体积<br>重(g)=(a*b*d)/计重因子*1000。
                        </p>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品状态包含指定的商品状态指定的商品状态 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A029')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A029'].productStatus}">订单货品状态包含指定的商品状态</span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['order-service-A029'].productStatus" @click="addItem('productStatus', 'order-service-A029')">
                    {{ showProductStatus.length > 0 ? showProductStatus.toString() : '指定的商品状态' }}
                  </span>
                  <dyt-select v-if="componentsStatus['order-service-A029'].productStatus" v-model="componentsModel['order-service-A029'].productStatus" multiple style="width: 200px">
                    <Option v-for="(proStatus, sIndex) in newProductStatus" :key="`op-${sIndex}`" :value="proStatus.value">{{proStatus.label}}</Option>
                  </dyt-select>
                </div>
                <!-- 买家曾经有过退款记录 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A031')) >= 0">
                  <span class="itemPaddingRight">买家曾经有过退款记录</span>
                </div>
                <!-- amazon订单 是否是prime订单：是/否：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A042')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A042'].amazonPrime}">prime订单</span>
                  <span v-if="!componentsStatus['order-service-A042'].amazonPrime" class="blueColor itemPaddingRight cursor" @click="addItem('amazonPrime', 'order-service-A042')">
                    {{ componentsModel['order-service-A042'].amazonPrime === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A042'].amazonPrime" v-model="componentsModel['order-service-A042'].amazonPrime" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A042'].amazonPrime}">
                    prime订单
                  </span>
                </div>

                <!-- amazon订单 订单类型：ToB订单/ToC订单 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A041')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A041'].amazonOrderType}">订单类型</span>
                  <span v-if="!componentsStatus['order-service-A041'].amazonOrderType" class="blueColor itemPaddingRight cursor" @click="addItem('amazonOrderType', 'order-service-A041')">
                    {{ componentsModel['order-service-A041'].amazonOrderType === '0' ? 'B2C订单' : 'B2B订单' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A041'].amazonOrderType" v-model="componentsModel['order-service-A041'].amazonOrderType" class="itemPaddingRight" style="width:70px">
                    <Option value="1">B2B订单</Option>
                    <Option value="0">B2C订单</Option>
                  </dyt-select>
                </div>

                <!-- 订单买家ID包含指定字符串 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A032')) >= 0">
                  <span class="itemPaddingRight">订单买家ID包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('containsStr', 'order-service-A032')" transfer width="500" placement="bottom">
                      <a v-if="componentsModel['order-service-A032'].containsStr.length > 1 && componentsModel['order-service-A032'].containsStr[0].value !== ''"><span v-for="(item,index) in componentsModel['order-service-A032'].containsStr" :key="index" class="mr5">{{ item.value }}</span></a>
                      <a v-else>指定字符串</a>
                      <div slot="content" class="keywordString">
                        <!--指定要在买家ID中查找的字符-->
                        <span>指定要在买家ID中查找的字符：</span>
                        <Form ref="containsStr" :model="componentsModel['order-service-A032']" :label-width="80" :disabled="looKsettings" style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['order-service-A032'].containsStr" :key="index" :label="'关键字' + index">
                            <Row>
                              <Col span="18">
                              <Input type="text" v-model.trim="item.value" placeholder="请输入关键字..."></Input>
                              </Col>
                              <Col span="4" offset="1">
                              <Button @click="orderStrRemove(index)">删除</Button>
                              </Col>
                            </Row>
                          </FormItem>
                          <FormItem>
                            <Row>
                              <Col span="12">
                              <Button type="dashed" long @click="orderStrAdd" icon="md-add">新增</Button>
                              </Col>
                            </Row>
                          </FormItem>
                        </Form>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 收货地址街道包含指定字符串 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A015')) >= 0">
                  <span class="itemPaddingRight">收货地址街道包：</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('streets', 'order-service-A015')" transfer width="500" placement="bottom">
                      <a v-if="componentsModel['order-service-A015'].streets.length > 1  && componentsModel['order-service-A015'].streets[0].value !== ''"><span v-for="(item,index) in  componentsModel['order-service-A015'].streets" :key="index" class="mr5">{{ item.value }}</span></a>

                      <a v-else>指定字符串</a>
                      <div slot="content" class="keywordString">
                        <span>指定要在地址(仅街道1+街道2，不含国家/地区省市信息)中查找的字符：</span>
                        <Form ref="streets" :model="componentsModel['order-service-A015']" :label-width="80" :disabled="looKsettings" style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['order-service-A015'].streets" :key="index" :label="'关键字' + index">
                            <Row>
                              <Col span="18">
                              <Input type="text" v-model.trim="item.value" placeholder="请输入关键字..."></Input>
                              </Col>
                              <Col span="4" offset="1">
                              <Button @click="streetsRemove(index)">删除</Button>
                              </Col>
                            </Row>
                          </FormItem>
                          <FormItem>
                            <Row>
                              <Col span="12">
                              <Button type="dashed" long @click="streetsAdd" icon="md-add">新增</Button>
                              </Col>
                            </Row>
                          </FormItem>
                        </Form>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单中Listing单价（产品价格+运费）指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A030')) >= 0">
                  <span class="itemPaddingRight">订单中Listing单价（产品价格+运费）</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'order-service-A030')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定范围
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单单笔交易额转换为币种：</span>
                        <dyt-select v-model="componentsModel['order-service-A030'].listingParams.currency" style="width: 150px" size="small">
                          <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
                        </dyt-select>
                        <span class="ml10">之后满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A030'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A030'].listingParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A030'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A030'].listingParams.checkbox1" v-model="componentsModel['order-service-A030'].listingParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A030'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A030'].listingParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A030'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A030'].listingParams.checkbox2" v-model="componentsModel['order-service-A030'].listingParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--joom 商品总金额 指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A033')) >= 0">
                  <span class="itemPaddingRight">joom 商品总金额</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'order-service-A033')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        {{
                          componentsModel['order-service-A033'].listingParams.currency
                          ? componentsModel['order-service-A033'].listingParams.beginValue + '-' + componentsModel['order-service-A033'].listingParams.endValue + '(' + componentsModel['order-service-A033'].listingParams.currency + ')'
                          : '指定范围'
                        }}
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单单笔交易额转换为币种：</span>
                        <dyt-select v-model="componentsModel['order-service-A033'].listingParams.currency" style="width: 150px" size="small">
                          <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
                        </dyt-select>
                        <span class="ml10">之后满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A033'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A033'].listingParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A033'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A033'].listingParams.checkbox1" v-model="componentsModel['order-service-A033'].listingParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A033'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A033'].listingParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A033'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A033'].listingParams.checkbox2" v-model="componentsModel['order-service-A033'].listingParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 买家支付的运费指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A021')) >= 0">
                  <span class="itemPaddingRight">买家支付的运费</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('buyCostParams', 'order-service-A021')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['order-service-A021'].buyCostParams.currency">
                          <span class="cpd" v-if="componentsModel['order-service-A021'].buyCostParams.beginValue != 0 && componentsModel['order-service-A021'].buyCostParams.checkbox1">
                            <span v-if="componentsModel['order-service-A021'].buyCostParams.beginType == '0'">&ge;</span>
                            <span v-else-if="componentsModel['order-service-A021'].buyCostParams.beginType == '1'">&gt;</span>
                            <span v-else>=</span>{{ componentsModel['order-service-A021'].buyCostParams.beginValue }} {{ componentsModel['order-service-A021'].buyCostParams.currency }}
                          </span>
                          <span class="cpd" v-if="componentsModel['order-service-A021'].buyCostParams.endValue != 0 && componentsModel['order-service-A021'].buyCostParams.checkbox2">
                            <span v-if="componentsModel['order-service-A021'].buyCostParams.endType == '0'">&lt;</span>
                            <span v-else-if="componentsModel['order-service-A021'].buyCostParams.endType == '1'">&le;</span>
                            <span>{{ componentsModel['order-service-A021'].buyCostParams.endValue }} {{ componentsModel['order-service-A021'].buyCostParams.currency }}</span>
                          </span>
                        </span>

                        <span v-if="!(componentsModel['order-service-A021'].buyCostParams.currency) || (!(componentsModel['order-service-A021'].buyCostParams.beginValue != 0 && componentsModel['order-service-A021'].buyCostParams.checkbox1) && !(componentsModel['order-service-A021'].buyCostParams.endValue != 0 && componentsModel['order-service-A021'].buyCostParams.checkbox2))">指定范围</span>

                        <!--{{componentsModel['order-service-A021'].buyCostParams.currency ? componentsModel['order-service-A021'].buyCostParams.beginValue + '-' +componentsModel['order-service-A021'].buyCostParams.endValue + '('+componentsModel['order-service-A021'].buyCostParams.currency+')' :'指定范围'}}-->
                      </span>
                      <div slot="content" class="keywordString">
                        <span>买家支付的运费转换为币种：</span>
                        <dyt-select v-model="componentsModel['order-service-A021'].buyCostParams.currency" style="width: 150px" size="small">
                          <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
                        </dyt-select>
                        <span class="ml10">之后满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A021'].buyCostParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A021'].buyCostParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A021'].buyCostParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A021'].buyCostParams.checkbox1" v-model="componentsModel['order-service-A021'].buyCostParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A021'].buyCostParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A021'].buyCostParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A021'].buyCostParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A021'].buyCostParams.checkbox2" v-model="componentsModel['order-service-A021'].buyCostParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单收件人电话要求指定条件 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A019')) >= 0">
                  <span class="itemPaddingRight">订单收件人电话要求</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('phoneParams', 'order-service-A019')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        指定条件
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单收件人电话符合以下选中的条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A019'].phoneParams.checkbox1"></Checkbox>
                          <span>移动电话可读字符长度≤</span>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox1" v-model="componentsModel['order-service-A019'].phoneParams.mobileLength"></InputNumber>
                        </div>
                        <dyt-select v-model="componentsModel['order-service-A019'].phoneParams.phonePreRelateType" style="width:120px;" size="small" :disabled="!(componentsModel['order-service-A019'].phoneParams.checkbox1 && componentsModel['order-service-A019'].phoneParams.checkbox2)">
                          <Option :value="0">并且</Option>
                          <Option :value="1">或者</Option>
                        </dyt-select>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A019'].phoneParams.checkbox2"></Checkbox>
                          <span>固定电话可读字符长度≤</span>
                          <InputNumber class="ml10" :min="0" size="small" :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox2" v-model="componentsModel['order-service-A019'].phoneParams.phoneLength"></InputNumber>
                        </div>
                        <dyt-select v-model="componentsModel['order-service-A019'].phoneParams.mobilePreRelateType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox3 || (componentsModel['order-service-A019'].phoneParams.checkbox3 && (!componentsModel['order-service-A019'].phoneParams.checkbox1 && !componentsModel['order-service-A019'].phoneParams.checkbox2))">
                          <Option :value="0">并且</Option>
                          <Option :value="1">或者</Option>
                        </dyt-select>
                        <div class="platformSelect normalTop">
                          <Checkbox :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox1" v-model="componentsModel['order-service-A019'].phoneParams.checkbox3"></Checkbox>
                          <span> 移动电话前缀</span>
                          <dyt-select v-model="componentsModel['order-service-A019'].phoneParams.mobilePreSlect" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox3">
                            <Option :value="0">以</Option>
                            <Option :value="1">不以</Option>
                          </dyt-select>
                          <Input class="ml10" style="width:200px;" type="textarea" placeholder="可输入多个，中间用英文逗号隔开" v-model.trim="componentsModel['order-service-A019'].phoneParams.mobilePres" :disabled="!componentsModel['order-service-A019'].phoneParams.checkbox3"></Input>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单收货邮编指定格式 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A017')) >= 0">
                  <span class="itemPaddingRight">订单收货邮编</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderZipCodeParams', 'order-service-A017')" transfer width="650" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="(componentsModel['order-service-A017'].orderZipCodeParams.checkbox1 && orderServiceA017CodeParams.beginStr) || (componentsModel['order-service-A017'].orderZipCodeParams.checkbox2 && orderServiceA017CodeParams.containsStr)">
                          <span v-if="componentsModel['order-service-A017'].orderZipCodeParams.checkbox1">以
                            <span class="plr10">{{ orderServiceA017CodeParams.beginStrText }}</span>
                            开头
                          </span>
                          <span v-if="componentsModel['order-service-A017'].orderZipCodeParams.checkbox1 && componentsModel['order-service-A017'].orderZipCodeParams.checkbox2">
                            <span v-if="componentsModel['order-service-A017'].orderZipCodeParams.relevance === 0">,并且</span>
                            <span v-if="componentsModel['order-service-A017'].orderZipCodeParams.relevance === 1">,或者</span>
                          </span>
                          <span v-if="componentsModel['order-service-A017'].orderZipCodeParams.checkbox2">包含
                            <span class="plr10">{{ orderServiceA017CodeParams.containsStrText }}</span>
                          </span>
                        </span>
                        <span v-else>指定格式</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单邮编至少符合以下选中的条件中的任意一个条件(输入内容仅限数字、英文字母、中划线和空隔)：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A017'].orderZipCodeParams.checkbox1">以</Checkbox>
                          <Input
                            class="ml10"
                            style="width:200px;"
                            type="textarea"
                            placeholder="可输入多个，用逗号或回车分隔"
                            v-model.trim="orderServiceA017CodeParams.beginStr"
                            :disabled="!componentsModel['order-service-A017'].orderZipCodeParams.checkbox1"
                          />
                          开头
                        </div>
                        <dyt-select class="mt15" v-model="componentsModel['order-service-A017'].orderZipCodeParams.relevance" style="width:80px;" size="small" :disabled="!(componentsModel['order-service-A017'].orderZipCodeParams.checkbox1 && componentsModel['order-service-A017'].orderZipCodeParams.checkbox2)">
                          <Option :value="0">并且</Option>
                          <Option :value="1">或者</Option>
                        </dyt-select>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A017'].orderZipCodeParams.checkbox2">包含</Checkbox>
                          <Input
                            class="ml10"
                            style="width:200px;"
                            type="textarea"
                            placeholder="可输入多个，用逗号或回车分隔"
                            v-model.trim="orderServiceA017CodeParams.containsStr"
                            :disabled="!componentsModel['order-service-A017'].orderZipCodeParams.checkbox2"
                          />
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单货品包含指定货品且数量指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A023')) >= 0">
                  <span class="itemPaddingRight">订单货品包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderProductParams', 'order-service-A023')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="mr10" v-if="componentsModel['order-service-A023'].orderProductParams.skus && componentsModel['order-service-A023'].orderProductParams.skus.length > 0">{{ componentsModel['order-service-A023'].orderProductParams.skus }}</span>
                        <span v-if="componentsModel['order-service-A023'].orderProductParams.checkbox1 || componentsModel['order-service-A023'].orderProductParams.checkbox2">
                          <span v-if="componentsModel['order-service-A023'].orderProductParams.checkbox1">
                            <span v-if="componentsModel['order-service-A023'].orderProductParams.beginType === 0">&ge;</span>
                            <span v-if="componentsModel['order-service-A023'].orderProductParams.beginType === 1">&gt;</span>
                            <span v-if="componentsModel['order-service-A023'].orderProductParams.beginType === 2">=</span>{{ componentsModel['order-service-A023'].orderProductParams.beginValue }}
                          </span>
                          <span v-if="componentsModel['order-service-A023'].orderProductParams.checkbox2">
                            <span v-if="componentsModel['order-service-A023'].orderProductParams.endType ===0">&lt;</span>
                            <span v-if="componentsModel['order-service-A023'].orderProductParams.endType ===1">&le;</span>{{ componentsModel['order-service-A023'].orderProductParams.endValue }}
                          </span>
                        </span>
                        <span v-if="componentsModel['order-service-A023'].orderProductParams.skus.length === 0 && !componentsModel['order-service-A023'].orderProductParams.checkbox1 && !componentsModel['order-service-A023'].orderProductParams.checkbox2">指定货品且数量指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单包含货品：</span>
                        <Input class="ml10" style="width:300px;" type="textarea" placeholder="可输入多个，中间用逗号或换行隔开" v-model.trim="componentsModel['order-service-A023'].orderProductParams.skus"></Input>
                        <br>
                        <span class="mt10">并且上述货品的数量总和满足以下选中的所有条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A023'].orderProductParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A023'].orderProductParams.beginType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A023'].orderProductParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A023'].orderProductParams.checkbox1" v-model="componentsModel['order-service-A023'].orderProductParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['order-service-A023'].orderProductParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['order-service-A023'].orderProductParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['order-service-A023'].orderProductParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10" :disabled="!componentsModel['order-service-A023'].orderProductParams.checkbox2" v-model="componentsModel['order-service-A023'].orderProductParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 是否黑名单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A039')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A039'].isBuyerInBlackList}">专有黑名单</span>
                  <span v-if="!componentsStatus['order-service-A039'].isBuyerInBlackList" class="blueColor itemPaddingRight cursor" @click="addItem('isBuyerInBlackList', 'order-service-A039')">
                    {{ componentsModel['order-service-A039'].isBuyerInBlackList === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A039'].isBuyerInBlackList" v-model="componentsModel['order-service-A039'].isBuyerInBlackList" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A039'].isBuyerInBlackList}">
                    ，白名单除外
                  </span>
                </div>
                <!-- wish订单 是否是Wish Express：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A035')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A035'].isWishExpress}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A035'].isWishExpress" class="blueColor itemPaddingRight cursor" @click="addItem('isWishExpress', 'order-service-A035')">
                    {{ componentsModel['order-service-A035'].isWishExpress === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A035'].isWishExpress" v-model="componentsModel['order-service-A035'].isWishExpress" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A035'].isWishExpress}">
                    Wish Express
                  </span>
                </div>

                <!-- wish订单 是否是EPC订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A036')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A036'].isWishEPC}">wish订单</span> <span v-if="!componentsStatus['order-service-A036'].isWishEPC" class="blueColor itemPaddingRight cursor" @click="addItem('isWishEPC', 'order-service-A036')">
                    {{ componentsModel['order-service-A036'].isWishEPC === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A036'].isWishEPC" v-model="componentsModel['order-service-A036'].isWishEPC" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A036'].isWishEPC}">
                    EPC订单
                  </span>
                </div>
                <!-- wish订单 是否是优质服务商订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A037')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A037'].isWishQualityServiceOrder}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A037'].isWishQualityServiceOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isWishQualityServiceOrder', 'order-service-A037')">
                    {{ componentsModel['order-service-A037'].isWishQualityServiceOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A037'].isWishQualityServiceOrder" v-model="componentsModel['order-service-A037'].isWishQualityServiceOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A037'].isWishQualityServiceOrder}">
                    优质服务商订单
                  </span>
                </div>
                <!-- wish订单 是否是A+物流计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A038')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A038'].isWishALogisticsPlanOrder}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A038'].isWishALogisticsPlanOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isWishALogisticsPlanOrder', 'order-service-A038')">
                    {{ componentsModel['order-service-A038'].isWishALogisticsPlanOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A038'].isWishALogisticsPlanOrder" v-model="componentsModel['order-service-A038'].isWishALogisticsPlanOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A038'].isWishALogisticsPlanOrder}">
                    A+物流计划订单
                  </span>
                </div>
                <!-- wish订单 是否是要求消费者VAT：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A047')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A047'].wishPayCustomerVatRequired}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A047'].wishPayCustomerVatRequired" class="blueColor itemPaddingRight cursor" @click="addItem('wishPayCustomerVatRequired', 'order-service-A047')">
                    {{ componentsModel['order-service-A047'].wishPayCustomerVatRequired === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A047'].wishPayCustomerVatRequired" v-model="componentsModel['order-service-A047'].wishPayCustomerVatRequired" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A047'].wishPayCustomerVatRequired}">
                    要求消费者VAT
                  </span>
                </div>
                <!-- wish订单 是否合并计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A048')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A048'].wishEligibleForShippingReimbursement}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A048'].wishEligibleForShippingReimbursement" class="blueColor itemPaddingRight cursor" @click="addItem('wishEligibleForShippingReimbursement', 'order-service-A048')">
                    {{ componentsModel['order-service-A048'].wishEligibleForShippingReimbursement === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A048'].wishEligibleForShippingReimbursement" v-model="componentsModel['order-service-A048'].wishEligibleForShippingReimbursement" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A048'].wishEligibleForShippingReimbursement}">
                    合并计划订单
                  </span>
                </div>
                <!-- wish订单 是否是可选A+物流计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A046')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A046'].isWishALogisticsPlanOrder}">wish订单</span>
                  <span v-if="!componentsStatus['order-service-A046'].isWishALogisticsPlanOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isWishALogisticsPlanOrder', 'order-service-A046')">
                    {{ componentsModel['order-service-A046'].isWishALogisticsPlanOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A046'].isWishALogisticsPlanOrder" v-model="componentsModel['order-service-A046'].isWishALogisticsPlanOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A046'].isWishALogisticsPlanOrder}">
                    可选A+物流计划订单
                  </span>
                </div>
                <!-- vova 是否集运订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A040')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A040'].isVovaIsCombineOrder}">vova订单</span>
                  <span v-if="!componentsStatus['order-service-A040'].isVovaIsCombineOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isVovaIsCombineOrder', 'order-service-A040')">
                    {{ componentsModel['order-service-A040'].isVovaIsCombineOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A040'].isVovaIsCombineOrder" v-model="componentsModel['order-service-A040'].isVovaIsCombineOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A040'].isVovaIsCombineOrder}">
                    集运订单
                  </span>
                </div>
                <!-- Aliexpress速卖通 是否合单订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A044')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A044'].isCombinedOrder}">Aliexpress订单</span>
                  <span v-if="!componentsStatus['order-service-A044'].isCombinedOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isCombinedOrder', 'order-service-A044')">
                    {{ componentsModel['order-service-A044'].isCombinedOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A044'].isCombinedOrder" v-model="componentsModel['order-service-A044'].isCombinedOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A044'].isCombinedOrder}">
                    合单订单
                  </span>
                </div>
                <!-- Aliexpress速卖通 是否十日达订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('order-service-A045')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A045'].isTenDaysOrder}">Aliexpress订单</span>
                  <span v-if="!componentsStatus['order-service-A045'].isTenDaysOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isTenDaysOrder', 'order-service-A045')">
                    {{ componentsModel['order-service-A045'].isTenDaysOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['order-service-A045'].isTenDaysOrder" v-model="componentsModel['order-service-A045'].isTenDaysOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['order-service-A045'].isTenDaysOrder}">
                    十日达订单
                  </span>
                </div>

              </template>
            </div>
          </div>
          <div class="modalItem normalTop">
            <div class="modalItemHeader">
              <h6>设定动作</h6>
            </div>
            <!--智能物流-->
            <div class="modalItemContent" v-if="ruleType === 'smart'">
              <!-- <template>
                  <div class=" normalPadding">
                    <span style="margin-top:2px">状态：</span>
                    <i-switch size="large" v-model="actionParams.status" :true-value="1" :false-value="0">
                      <span slot="open">启用</span>
                      <span slot="close">禁用</span>
                    </i-switch>
                  </div>
                </template> -->
              <template>
                <div class="normalPadding">
                  <Form ref="actionParams" :model="actionParams" :rules="actionRule" :lable-width="80" :disabled="looKsettings" label-position="left">
                    <FormItem label="规则名：" prop="ruleName">
                      <Input v-model.trim="actionParams.ruleName" placeholder="请输入规则名" style="width:300px" />
                    </FormItem>
                    <FormItem label="备注：" prop="remark">
                      <Input
                        v-model.trim="actionParams.remark"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 6 }"
                        placeholder="请输入备注(最多可输入200字符)"
                        style="width:300px"
                      />
                    </FormItem>
                    <FormItem label="类型：" prop="type">
                      <RadioGroup v-model="actionParams.type">
                        <Radio :label="0">选择指定物流</Radio>
                        <Radio :label="1">选择符合条件物流</Radio>
                      </RadioGroup>
                    </FormItem>
                    <Card dis-hover class="ship-card-box" v-if="actionParams.type === 0">
                      <Row>
                        <Col :span="14">
                        <Form-item label="实际发货物流方式：" :label-width="120" v-if="!!selectWareID">
                          <logisticsModeTree
                            v-model="value2"
                            :multiple="false"
                            :warehouse-id="selectWareID"
                            :loadingChildren="true"
                            :disableBranchNodes="true"
                            placeholder="请选择实际发货物流方式"
                            @on-change="getAccountApiMatch"
                          />
                        </Form-item>
                        </Col>
                        <Col :span="9" :offset="1" v-if="isOnlineShip === 0 && !isPms && !$common.isEmpty(carrierAccount)">
                          <Form-item label="帐号：" :label-width="60">
                            <dyt-select ref="shipAccount" v-model="shippingAccountModel">
                              <Option v-for="(item,index) in carrierAccount"
                                v-if="item.carrierAccountId !== null"
                                :key="index"
                                :value="item.carrierAccountId"
                              >{{ item.account }}</Option>
                            </dyt-select>
                          </Form-item>
                        </Col>
                      </Row>
                      <div class="matchLogisticSetting" v-if="carrierBaseSetting.length > 0">
                        <h6>物流相关设置</h6>
                      </div>
                      <Form :disabled="looKsettings">
                        <Row class="white-space-nowrap-form">
                          <Col :span="10" v-for="(item,index) in carrierBaseSetting" :key="index" class="offset-1">
                          <Form-item v-if="item.paramType === 'hide'" v-show="false" :label="item.paramName" :label-width="100">
                            <span>{{ item.paramValue }}</span>
                          </Form-item>
                          <Form-item v-else :label="item.paramName" :label-width="100">
                            <Radio-group v-model="item.paramValue" v-if="item.paramType === 'radio'">
                              <Radio :label="sItem.itemValue" v-for="(sItem,n) in item.dictionarys" :key="n">
                                <span>{{ sItem.itemName }}</span>
                              </Radio>
                            </Radio-group>
                            <Input v-if="item.paramType == 'input'" v-model="item.paramValue"></Input>
                            <Checkbox-group v-model="item.paramValue" v-if="item.paramType == 'checkbox'">
                              <Checkbox v-for="(sItem,n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                                <span>{{ sItem.itemName }}</span>
                              </Checkbox>
                            </Checkbox-group>
                            <dyt-select v-if="item.paramType === 'select'" v-model="item.paramValue">
                              <Option v-for="(sItem,n) in item.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName }}</Option>
                            </dyt-select>
                            <span v-if="item.paramType === 'readOnly'">{{ item.paramValue }}</span>
                          </Form-item>
                          </Col>
                        </Row>
                      </Form>
                      <div class="clear">
                        <Button size="small" class="fr" @click="saveShippingAccount">保存 </Button>
                      </div>
                      <!--保存的值-->
                      <p>已选择：</p>
                      <Alert v-for="(item,index) in desigMethodActionBoList" :key="index" :type="activeShippingMethodData && activeShippingMethodData.shippingMethodId === item.shippingMethodId ? 'warning' :'success'">
                        <span class="show-desig" @click="showDesig(item)">{{ item.text }}</span>
                        <Icon @click="closeMt(index)" type="ios-close" size="18" v-if="!looKsettings" style="cursor: pointer;position: absolute;right: 5px;" />
                      </Alert>
                    </Card>
                    <div v-if="actionParams.type" style="margin-bottom:10px;">
                      <Checkbox v-model="actionParams.timeSelected">
                        <span class="ml10">时效：小于</span>
                        <InputNumber size="small" :min="0" :disabled="!actionParams.timeSelected" v-model="actionParams.maxSelectedValue"></InputNumber>
                      </Checkbox>
                      <dyt-select
                        v-model="actionParams.timeTracknumberType"
                        :disabled="!(actionParams.timeSelected && actionParams.tracknumberSelected)" style="width:70px;" size="small"
                        class="ml10"
                      >
                        <Option :value="0">并且</Option>
                        <Option :value="1">或者</Option>
                      </dyt-select>
                      <Checkbox v-model="actionParams.tracknumberSelected" class="ml15">
                        <span class="ml10">运单号：</span>
                      </Checkbox>
                      <dyt-select :disabled="!actionParams.tracknumberSelected" v-model="actionParams.tracknumberSelectedValue" style="width:70px" size="small">
                        <Option :value="0">无</Option>
                        <Option :value="1">有</Option>
                      </dyt-select>
                    </div>
                    <FormItem label="状态：" prop="status">
                      <i-switch size="large" v-model="actionParams.status" :true-value="1" :false-value="0">
                        <span slot="open">启用</span> <span slot="close">禁用</span>
                      </i-switch>
                    </FormItem>
                  </Form>
                </div>
              </template>
            </div>
            <!--分仓规则-->
            <div class="modalItemContent" v-if="ruleType === 'autoCompartment'">
              <template v-if="ruleParmas !== null && ruleParmas.type === 0">
                <!-- 自动分仓规则的设定动作 -->
                <div class="normalPadding">
                  <Form ref="actionParams" :model="actionParams" :rules="actionRule" :lable-width="80" :disabled="looKsettings" label-position="left">
                    <FormItem label="规则名：" prop="ruleName">
                      <Input v-model.trim="actionParams.ruleName" style="width:300px"></Input>
                    </FormItem>
                    <FormItem label="备注：" prop="remark">
                      <Input
                        v-model.trim="actionParams.remark"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 6 }"
                        placeholder="请输入备注(最多可输入200字符)"
                        style="width:300px"
                      />
                    </FormItem>
                    <FormItem label="类型：" prop="type">
                      <RadioGroup v-model="actionParams.type">
                        <Radio :label="0">选择指定仓库</Radio>
                        <Radio :label="1">选择指定仓库中距离最近的</Radio>
                      </RadioGroup>
                    </FormItem>
                    <div v-if="actionParams.type === 0">
                      <FormItem label="仓库：" prop="warehouseIds">
                        <dyt-select
                          v-model="actionParams.warehouseIds"
                          ref="warehouseRef"
                          style="width: 200px"
                          filterable
                          @on-change="warehouseChange"
                        >
                          <template v-if="looKsettings">
                            <Option
                              v-for="item in allStorelist"
                              :value="item.warehouseId"
                              :key="item.warehouseId"
                            >{{ item.warehouseName }}</Option>
                          </template>
                          <template v-else>
                            <Option
                              v-for="item in storeList"
                              :value="item.warehouseId"
                              :key="item.warehouseId"
                            >{{ item.warehouseName }}</Option>
                          </template>
                        </dyt-select>
                        <Checkbox
                          v-if="!disabledMatch"
                          v-model="actionParams.matchOtherRulesSelected"
                          class="ml15"
                        >所分配仓库缺货时支持继续匹配其他规则</Checkbox>
                      </FormItem>
                    </div>
                    <div v-if="actionParams.type === 1">
                      <FormItem label="仓库：" prop="warehouseIdList">
                        <dyt-select
                          v-model="actionParams.warehouseIdList"
                          style="width: 200px"
                          multiple
                          filterable
                          @on-change="changeData"
                        >
                          <Option v-for="item in warehouseList" :value="item.warehouseId" :key="item.warehouseId"> {{ item.warehouseName }}</Option>
                        </dyt-select><span class="ml5">(需在仓库设置中维护距离权重)</span>
                      </FormItem>
                      <div>
                        <Checkbox v-model="actionParams.onlyDistriHaveStockSelected" @on-change="onlyDistriHaveStockSelectedChange">仅分配有货仓库
                        </Checkbox>
                        <Checkbox v-model="actionParams.matchOtherRulesSelected2" :disabled="!actionParams.onlyDistriHaveStockSelected" class="ml15"
                        >所分配仓库缺货时支持继续匹配其他规则</Checkbox>
                      </div>
                      <div class="mt10" v-show="listData.length">
                        <span>权重值相同时，按以下顺序</span>
                        <dTable ref="dragable1" highlight-row border :columns="columns" :data="listData"></dTable>
                      </div>
                    </div>
                  </Form>
                </div>
                <div class=" normalPadding">
                  <span style="margin-top:2px">状态：</span>
                  <i-switch size="large" v-model="actionParams.status" :true-value="1" :false-value="0">
                    <span slot="open">启用</span> <span slot="close">禁用</span>
                  </i-switch>
                </div>
              </template>
              <template v-if="ruleParmas !== null && (ruleParmas.type === 1 || ruleParmas.type === 2)">
                <div class="normalPadding">
                  <Form ref="actionParams" :model="actionParams" :rules="actionRule" :lable-width="80" :disabled="looKsettings" label-position="left">
                    <FormItem label="规则名：" prop="ruleName">
                      <Input v-model.trim="actionParams.ruleName" style="width:300px"></Input>
                    </FormItem>
                    <FormItem label="备注：" prop="remark">
                      <Input
                        v-model.trim="actionParams.remark"
                        type="textarea"
                        :autosize="{ minRows: 2, maxRows: 6 }"
                        placeholder="请输入备注(最多可输入200字符)"
                        style="width:300px"
                      />
                    </FormItem>
                    <FormItem label="截留订单：" prop="isSupended">
                      <RadioGroup v-model="actionParams.isSupended">
                        <Radio :label="1">
                          <span>是</span>
                        </Radio>
                        <Radio :label="0">
                          <span>否</span>
                        </Radio>
                      </RadioGroup>
                      <Input v-if="actionParams.isSupended === 1" v-model.trim="actionParams.supendedOrderReason" style="width:200px" placeholder="请输入截留原因"></Input>
                    </FormItem>
                    <FormItem label="添加发货提醒：" prop="isRemind">
                      <RadioGroup v-model="actionParams.isRemind">
                        <Radio :label="1">
                          <span>是</span>
                        </Radio>
                        <Radio :label="0">
                          <span>否</span>
                        </Radio>
                      </RadioGroup>
                      <Input v-if="actionParams.isRemind === 1" v-model.trim="actionParams.shipmentRemindingReason" style="width:200px" placeholder="请输入发货提醒"></Input>
                    </FormItem>
                    <FormItem label="状态：" prop="status">
                      <i-switch size="large" v-model="actionParams.status" :true-value="1" :false-value="0">
                        <span slot="open">启用</span> <span slot="close">禁用</span>
                      </i-switch>
                    </FormItem>
                  </Form>
                </div>
              </template>
            </div>
          </div>
        </div>
        </Col>
        <Col :span="9">
        <div class="normalTop">
          <div class="modalItem rulesRightHeight">
            <div class="modalItemHeader">
              <h6>可选条件</h6>
            </div>
            <div class="modalItemContent">
              <template v-if="rules !== null && rules.length > 0">
                <CheckboxGroup v-model="rulesModel">
                  <div v-for="(item, index) in rules" :key="index" class="uniformlyspacedPadding">
                    <div v-if="((index >  0 && item.group !== rules[index - 1].group ) || index === 0) && item.group !== null" class="groupTitle">
                      {{ item.groupDescription }}
                      <span style="position: relative; top: 1px; cursor: pointer;" v-if="item.groupDescription === 'Aliexpress'">
                        <Tooltip transfer content="十日达订单即X日达订单，如5日达、10日达">
                          <Icon size="18" type="md-help-circle" />
                        </Tooltip>
                      </span>
                    </div>
                    <Checkbox :key="item.uid" :label="item.uid">
                      <span v-html="item.display"></span>
                    </Checkbox>
                  </div>
                </CheckboxGroup>
              </template>
            </div>
          </div>
        </div>
        </Col>
        <Spin v-if="loadRuleing" fix></Spin>
      </Row>
    </Form>
    <div class="ruleButtons flexEnd normal">
      <Button class="normalRMargin" @click="closeRuleModal(0)">取消 </Button>
      <Button type="primary" class="saveButton" :loading="loading" :disabled="looKsettings" @click="saveButton">保存 </Button>
    </div>
    <!-- 订单收件人姓名/地址存在指定异常 -->
    <Modal v-model="anomalousModal" v-if="anomalousModalStatus" width="800" :mask-closable="false" title="选择指定异常" @on-ok="anomalousOk" @on-cancel="anomalousCancel">
      <h3>本条件用于筛选异常状况，以下条件符合任何一项，即认为符合本条件。</h3>
      <div class="mt10">
        <Checkbox v-model="anomalousModalParams.checkbox1">
          <span class="ml10">姓名字符中空格数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox1" v-model="anomalousModalParams.nameSpaceLess"></InputNumber>
          <span class="ml20" style="color:red;">俄罗斯邮政要求收件人地址为全名，此处可输入2</span>
        </Checkbox>
      </div>
      <div class="mt10">
        <Checkbox v-model="anomalousModalParams.checkbox2">
          <span class="ml10">姓名字符数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox2" v-model="anomalousModalParams.nameCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">输入1时，相当于收件人姓名为空</span>
        </Checkbox>
      </div>
      <div class="mt10">
        <Checkbox v-model="anomalousModalParams.checkbox3">
          <span class="ml10">地址字符数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox3" v-model="anomalousModalParams.addressCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">地址1+地址2的总字符长度</span>
        </Checkbox>
      </div>
      <div class="mt10">
        <Checkbox v-model="anomalousModalParams.checkbox4">
          <span class="ml10">城市名字字符数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox4" v-model="anomalousModalParams.cityCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">输入1时，相当于城市名称为空</span>
        </Checkbox>
      </div>
      <div class="ml10">
        <Checkbox v-model="anomalousModalParams.checkbox5">
          <span class="ml10">省/州名字字符数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox5" v-model="anomalousModalParams.stateCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">输入1时，相当于省州名称为空 </span>
        </Checkbox>
      </div>
      <div class="ml10">
        <Checkbox v-model="anomalousModalParams.checkbox6">
          <span class="ml10">邮编字符数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox6" v-model="anomalousModalParams.postCodeCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">输入1时，相当于邮编为空</span>
        </Checkbox>
      </div>
      <div class="ml10">
        <Checkbox v-model="anomalousModalParams.checkbox7">
          <span class="ml10">电话号码数字字符个数小于</span>
          <InputNumber size="small" :min="1" :disabled="!anomalousModalParams.checkbox7" v-model="anomalousModalParams.phoneCharacterLess"></InputNumber>
          <span class="ml20" style="color:red;">电话、手机两个号码必须都小于该值才认为该条件成立</span>
        </Checkbox>
      </div>
    </Modal>
  </div>
</template>
<script>
/***
 *
 * 自动分仓规则、智能物流规则
 * */
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import Sortable from 'sortablejs';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import logisticsModeTree from '@/components/common/logisticsModeTree';

export default {
  mixins: [Mixin, publicService, orderSys],
  components: {
    logisticsModeTree
  },
  data () {
    const noEmpty = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入规则名'));
      } else {
        callback();
      }
    };
    return {
      addiblePlatform: ['shopify', 'ozon'],
      orderServiceA017CodeParams: {
        beginStr: '',
        beginStrText: '',
        containsStr: '',
        containsStrText: ''
      },
      textareaCountryCodes: [],
      newProductStatus: productData.productStatus,
      apiInterfaceStatus: '',
      isOnlineShip: 0,
      value2: null,
      isPms: false,
      shippingAccountModel: '',
      activeShippingMethodData: {},
      carrierAccount: [],
      carrierBaseSetting: [],
      desigMethodActionBoList: [], // 物流信息
      columns: [
        {
          title: '优先级',
          width: 200,
          render: (h, params) => {
            let arr = [];
            arr = [
              h('span', {
                attrs: {
                  title: '置底'
                },
                class: 'icon iconfont icon-setBottom-copy normalFontSizeTwoSize cursor greenColor',
                on: {
                  click: () => {
                    let v = this;
                    v.$nextTick(() => {
                      let data = JSON.parse(JSON.stringify(v.listData));
                      v.listData = [];
                      [data[params.index], data[data.length - 1]] = [data[data.length - 1], data[params.index]];
                      v.listData = data;
                      v.listSortDate = v.deepCopy(v.listData);
                    });
                  }
                }
              }), h('span', {
                attrs: {
                  title: '置顶'
                },
                class: 'icon iconfont icon-zhiding1 normalFontSizeTwoSize cursor blueColor',
                on: {
                  click: () => {
                    let v = this;
                    v.$nextTick(() => {
                      let data = JSON.parse(JSON.stringify(v.listData));
                      v.listData = [];
                      [data[params.index], data[0]] = [data[0], data[params.index]];
                      v.listData = data;
                      v.listSortDate = v.deepCopy(v.listData);
                    });
                  }
                }
              }), h('Icon', {
                props: {
                  type: 'md-move',
                  size: 18
                },
                attrs: {
                  title: 'up'
                },
                style: {
                  marginLeft: '5px',
                  position: 'relative',
                  top: '-2px'
                },
                class: 'cursor-move grayColor'
              })

            ];
            if (params.index === 0) {
              arr.splice(1, 1);
            } else if (params.index === this.listData.length - 1) {
              arr.splice(0, 1);
            }
            return h('div', arr);
          }
        }, {
          title: '仓库',
          minWidth: 100,
          key: 'warehouseName'
        }
      ],
      listData: [],
      listSortDate: [],
      warehouseList: [],
      warehouseJson: {},
      source: {
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      },
      warehouseIdsName: [],
      platformAccountList: [],
      sitesList: [],
      postcodeArea: '',
      shopSkuModel: null,
      shopSku: {
        start: '',
        end: ''
      },
      smShippingSearch: [],
      smShippingMethodList: [],
      hasSite: false,
      shipmentSearchValue: null,
      shipmentPlatformModel: '',
      shipmentPlatformSite: '',
      shipmentPlatformList: [],
      shipmentPlatformSiteList: [],
      shipmentCheckBoxModel: [],
      shipmentTagModel: [],
      shipmentTagJson: {},
      postcodeOne: '',
      postcodeTwo: '',
      postcodeArr: [
        {
          postcode1: '',
          postcode2: ''
        }
      ],
      countryCodesName: '',
      treeArr: [],
      countryCodes: [],
      country1Codes: [],
      countryData: [],
      countryJson: {},
      country1Json: {},
      oldMatchOtherRulesSelected: true,
      disabledMatch: false,
      loadRuleing: false,
      actionParams: {
        status: 0,
        ruleName: null,
        remark: null,
        type: 0,
        carrierId: null,
        shippingMethodId: null,
        timeSelected: false,
        maxSelectedValue: null,
        timeTracknumberType: 0,
        tracknumberSelected: false,
        tracknumberSelectedValue: 1,
        isSupended: 0,
        isRemind: 0,
        supendedOrderReason: null,
        shipmentRemindingReason: null,
        warehouseIds: null,
        matchOtherRulesSelected: true,
        warehouseIdList: [],
        onlyDistriHaveStockSelected: true,
        matchOtherRulesSelected2: true
        // isSupended: 0,
        // isRemind: 0,
        // supendedOrderReason: null,
        // shipmentRemindingReason: null
      },
      actionRule: {
        ruleName: [
          { validator: noEmpty, trigger: 'blur' }
        ],
        remark: [
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'blur' },
          { validator: this.$common.strMaxVerify, maxLength: 200, trigger: 'change' }
        ]
      },
      amountRange: {
        usdUpper: 0,
        usdFloor: 0,
        audUpper: 0,
        audFloor: 0,
        eurUpper: 0,
        eurFloor: 0,
        gbpUpper: 0,
        gbpFloor: 0
      },
      shippingMethodName: '',
      productTagList: [],
      skusStatus: false,
      skusStatus1: false,
      productCategoryListName: '',
      productCategoryIdList: [],
      cursor: [],
      productCategoryList: [],
      index: 1,
      loading: false,
      autoRuleItems: [],
      platform: [
        {
          platformId: 'all',
          value: '',
          name: '全部'
        }
      ],
      oldComponentsModel: {},
      oldComponentsStatus: {},
      componentsModel: {
        'order-service-A001': {
          platformIds: [],
          siteIds: [],
          saleAccountIds: []
        },
        'O002': {
          warehouseIds: []
        },
        'order-service-A003': {
          shipmentTypes: []
        },
        'order-service-A006': {
          cities: ''
        },
        'order-service-A004': {
          countryCodes: [],
          postalCodeType: 0,
          buyerPostalCodes: ''
        },
        'order-service-A005': {
          states: ''
        },
        'order-service-A007': {
          amountRange: []
        },
        'order-service-A009': {
          productCategories: [],
          skus: '',
          productTags: []
        },
        'order-service-A043': {
          skus: ''
        },
        'order-service-A010': {
          isEbayPlus: '1'
        },
        'order-service-A039': {
          isBuyerInBlackList: '1'
        },
        'order-service-A035': {
          isWishExpress: '1'
        },
        'order-service-A044': {
          isCombinedOrder: '1'
        },
        'order-service-A045': {
          isTenDaysOrder: '1'
        },
        'order-service-A041': {
          amazonOrderType: '1'
        },
        'order-service-A042': {
          amazonPrime: '1'
        },
        'order-service-A036': {
          isWishEPC: '1'
        },
        'order-service-A037': {
          isWishQualityServiceOrder: '1'
        },
        'order-service-A038': {
          isWishALogisticsPlanOrder: '1'
        },
        'order-service-A046': {
          isWishOptionalAdvancedLogistics: '1'
        },
        'order-service-A047': {
          wishPayCustomerVatRequired: '1'
        },
        'order-service-A048': {
          wishEligibleForShippingReimbursement: '1'
        },
        'order-service-A040': {
          isVovaIsCombineOrder: '1'
        },
        'order-service-A011': {
          productKeyword: [
            {
              value: ''
            }
          ],
          type: 0
        },
        'order-service-A012': {
          include: '1'
        },
        'order-service-A013': {
          goodsCountry: '',
          goodsCity: '',
          goodsPostalCode: ''
        },
        'order-service-A018': {
          zipCodeParams: {
            checkbox1: false,
            checkbox2: false,
            startType: 0,
            startValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A016': {
          length: null
        },
        'order-service-A014': {
          selectType: null
        },
        'order-service-A022': {
          orderPdtNumParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A028': {
          orderPdtBulkParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A049': {
          orderPdtBulkParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A026': {
          orderPdtWidthParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A027': {
          orderPdtHeightParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A025': {
          orderPdtLengthParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'order-service-A024': {
          orderPdtWeightParams: {
            checkbox1: false,
            checkbox2: false,
            checkbox3: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            computeWeightFactor: 5000
          }
        },
        'order-service-A029': {
          productStatus: []
        },
        'order-service-A031': {
          refundSelected: 1 // 写死的值
        },
        'order-service-A032': {
          containsStr: [
            {
              value: ''
            }
          ]
        },
        'order-service-A015': {
          streets: [
            {
              value: ''
            }
          ]
        },
        'order-service-A030': {
          listingParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            currency: null
          }
        },
        'order-service-A033': {
          listingParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            currency: null
          }
        },
        'order-service-A021': {
          buyCostParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            currency: null
          }
        },
        'order-service-A019': {
          phoneParams: {
            checkbox1: false,
            checkbox2: false,
            checkbox3: false,
            mobileLength: null,
            phonePreRelateType: 0,
            phoneLength: null,
            mobilePreRelateType: 0,
            mobilePreSlect: 0,
            mobilePres: []
          }
        },
        'order-service-A017': {
          orderZipCodeParams: {
            checkbox1: false,
            checkbox2: false,
            beginStr: [],
            containsStr: null,
            relevance: 0
          }
        },
        'order-service-A023': {
          orderProductParams: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            skus: ''
          }
        },
        'order-service-A020': {
          anomalousList: []
        },
        'order-service-A034': {
          shopSku: null
        }
      },
      componentsStatus: {
        'order-service-A001': {
          platformIds: false,
          siteIds: false,
          saleAccountIds: false
        },
        'O002': {
          warehouseIds: false
        },
        'order-service-A003': {
          shipmentTypes: false
        },
        'order-service-A004': {
          countryCodes: false,
          buyerPostalCodes: false
        },
        'W004': {
          shopSku: false
        },
        'order-service-A005': {
          states: false
        },
        'order-service-A006': {
          cities: false
        },
        'order-service-A007': {
          amountRange: false
        },
        'order-service-A009': {
          productCategories: false,
          skus: false,
          productTags: false
        },
        'order-service-A043': {
          skus: false
        },
        'order-service-A010': {
          isEbayPlus: false
        },
        'order-service-A039': {
          isBuyerInBlackList: '1'
        },
        'order-service-A035': {
          isWishExpress: '1'
        },
        'order-service-A044': {
          isCombinedOrder: '1'
        },
        'order-service-A045': {
          isTenDaysOrder: '1'
        },
        'order-service-A041': {
          amazonOrderType: '1'
        },
        'order-service-A042': {
          amazonPrime: '1'
        },
        'order-service-A036': {
          isWishEPC: '1'
        },
        'order-service-A037': {
          isWishQualityServiceOrder: '1'
        },
        'order-service-A038': {
          isWishALogisticsPlanOrder: '1'
        },
        'order-service-A046': {
          isWishOptionalAdvancedLogistics: '1'
        },
        'order-service-A047': {
          wishPayCustomerVatRequired: '1'
        },
        'order-service-A048': {
          wishEligibleForShippingReimbursement: '1'
        },
        'order-service-A040': {
          isVovaIsCombineOrder: '1'
        },
        'order-service-A011': {
          productKeyword: false
        },
        'order-service-A012': {
          include: false
        },
        'order-service-A013': {
          goodsCountry: false,
          goodsCity: false,
          goodsPostalCode: false
        },
        'order-service-A018': {
          zipCodeParams: false
        },
        'order-service-A016': {
          length: false
        },
        'order-service-A014': {
          selectType: false
        },
        'order-service-A022': {
          orderPdtNumParams: false
        },
        'order-service-A028': {
          orderPdtBulkParams: false
        },
        'order-service-A049': {
          orderPdtBulkParams: false
        },
        'order-service-A026': {
          orderPdtWidthParams: false
        },
        'order-service-A027': {
          orderPdtHeightParams: false
        },
        'order-service-A025': {
          orderPdtLengthParams: false
        },
        'order-service-A024': {
          orderPdtWeightParams: false
        },
        'order-service-A029': {
          productStatus: false
        },
        'order-service-A031': {
          refundSelected: false
        },
        'order-service-A032': {
          containsStr: false
        },
        'order-service-A015': {
          streets: false
        },
        'order-service-A030': {
          listingParams: false
        },
        'order-service-A033': {
          listingParams: false
        },
        'order-service-A021': {
          buyCostParams: false
        },
        'order-service-A017': {
          orderZipCodeParams: false
        },
        'order-service-A019': {
          phoneParams: false
        },
        'order-service-A023': {
          orderProductParams: false
        },
        'order-service-A020': {
          anomalousList: false
        },
        'order-service-A034': {
          shopSku: null
        }
      },
      autoRuleId: null,
      rules: null,
      rulesModel: [], // 右侧勾选状态
      ruleItems: null,
      actonStatus: true, // 指定异常弹框
      anomalousModal: false,
      anomalousModalStatus: false,
      anomalousModalParams: {
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        checkbox4: false,
        checkbox5: false,
        checkbox6: false,
        checkbox7: false,
        nameSpaceLess: null,
        nameCharacterLess: null,
        addressCharacterLess: null,
        cityCharacterLess: null,
        stateCharacterLess: null,
        postCodeCharacterLess: null,
        phoneCharacterLess: null
      },
      shippingMethodList: [],
      showProductStatus: [],
      isChangeTreecountryCodes: false,
      currencyList: [] // 币种
    };
  },
  props: {
    wareGroup: {
      type: Array
    },
    ruleType: {
      type: String,
      default: 'smart' // smart：智能物流  autoCompartment: 自动分仓规则  declartion
    },
    selectWareID: {
      type: String // 智能物流规则里面选择的仓库id
    },
    warehouseType: String,
    ruleParmas: { // type: 0 edit, 1 create;
      type: Object,
      default: null
    },
    timestamp: {
      type: Number,
      default: 0
    },
    type: String,
    looKsettings: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    orderZipCodeParamsBeginStr: {
      immediate: true,
      handler (val) {
        this.orderServiceA017CodeParams.beginStr = val;
      }
    },
    orderZipCodeParamsContainsStr: {
      immediate: true,
      handler (val) {
        this.orderServiceA017CodeParams.containsStr = val;
      }
    },
    'orderServiceA017CodeParams.beginStr': {
      immediate: true,
      handler (val) {
        const beginStr = this.$common.split(val, ['，', ',', '\n'], true);
        this.orderServiceA017CodeParams.beginStrText = beginStr.join('，');
      }
    },
    'orderServiceA017CodeParams.containsStr': {
      immediate: true,
      handler (val) {
        const containsStr = this.$common.split(val, ['，', ',', '\n'], true);
        this.orderServiceA017CodeParams.containsStrText = containsStr.join('，');
      }
    },
    timestamp (n, o) {
      if (this.$refs.select1) {
        this.$refs.select1.reset();
      }
      if (this.$refs.select2) {
        this.$refs.select2.reset();
      }
      this.resetRuleData();
      this.getRuleDetails();
      this.addItem('productTags', 'order-service-A009', true);
      if (this.ruleType === 'autoCompartment') {
        this.listData = [];
        this.getStore(1); // 获取仓库列表
        this.getWarehouseList();
      }
    },
    'actionParams.matchOtherRulesSelected' (val) {
      this.oldMatchOtherRulesSelected = val;
    },
    textareaCountryCodes: {
      deep: true,
      handler(val) {
        if (this.isChangeTreecountryCodes) return;
        const removeRepeatVal = this.$common.arrRemoveRepeat(val); // 去重
        const allTreeJson = Object.values(this.countryJson);
        const getNode = this.distinguishLastStage(allTreeJson);
        const resultfulNode = getNode.lastStage.filter(tNode => removeRepeatVal.includes(tNode.title)).map(m => m.zoneCode);
        let parentChilds = {};
        let checkIds = {};
        getNode.otherStage.forEach(pNode => {
          parentChilds[pNode.zoneCode] = [];
          checkIds[pNode.zoneCode] = [];
          pNode.children.forEach(child => {
            parentChilds[pNode.zoneCode].push(child.zoneCode);
            if (resultfulNode.includes(child.zoneCode)) {
              checkIds[pNode.zoneCode].push(child.zoneCode);
            }
          })
          if (parentChilds[pNode.zoneCode].length === checkIds[pNode.zoneCode].length) {
            resultfulNode.push(pNode.zoneCode);
          }
        });
        this.countryCodes = resultfulNode;
      }
    }
  },
  created () {
    this.storeList = this.wareGroup;
    this.getAllstore(0);
  },
  methods: {
    distinguishLastStage (arr) {
      let lastStage = [];
      let otherStage = [];
      let isPush = {};
      const getNode = (arr) => {
        arr.forEach(item => {
          if (!isPush[item.zoneCode]) {
            if (this.$common.isEmpty(item.children)) {
              lastStage.push(item);
            } else {
              otherStage.push(item);
              getNode(item.children);
            }
          }
          isPush[item.zoneCode] = true;
        })
      }
      getNode(arr);
      return { lastStage: lastStage, otherStage: otherStage }
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.zoneCode,
        label: node.title,
        children: node.children
      }
    },
    tree1Normalizer (node) {
      this.$set(this.country1Json, node.productCategoryId, node);
      return {
        id: node.productCategoryId || 'all',
        label: node.title,
        children: node.children
      }
    },
    closeMt (index) {
      // 关闭事件
      this.desigMethodActionBoList.splice(index, 1);
    },
    showDesig (item) {
      // 点击赋值
      this.showShippingDataApiMatch().then((data) => {
        setTimeout(() => {
          this.value2 = item.shippingMethodId;
        }, 0);
        data.forEach(i => {
          if (i.value === item.carrierId) {
            this.carrierAccount = i.carrierAccounts;
          }
        });
        this.carrierBaseSetting = item.packageCarrierParamList;
        this.activeShippingMethodData = JSON.parse(JSON.stringify(item)); // 存的值
        this.shippingAccountModel = item.carrierAccountId;
      });
      this.getCarrierBaseSettingApiMatch(item.shippingMethodId);
    },
    getShipName (data) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.queryCarrierShippingName, data.map(i => {
          return i.shippingMethodId;
        })).then(response => {
          if (response.data.code === 0) {
            data.forEach((j, index) => {
              response.data.datas.forEach(k => {
                if (j.shippingMethodId === k.shippingMethodId) {
                  j.text = k.carrierName + '/' + k.carrierShippingMethodName;
                }
              });
            });
            resolve(data);
          }
        });
      });
    },
    saveShippingAccount () {
      // 点击新增
      let activeData = this.activeShippingMethodData; // 操作数据
      let shipIndex = null;
      if (this.$common.isEmpty(activeData.shippingMethodId)) {
        this.$Message.error('实际发货物流方式不能为空');
        return;
      }
      if (this.$common.isEmpty(this.shippingAccountModel) && this.isOnlineShip === 0 && !this.isPms) {
        this.$Message.error('账户不能为空');
        return;
      }

      let obj = {
        carrierId: activeData.carrierId,
        shippingMethodId: activeData.shippingMethodId,
        carrierAccountId: this.shippingAccountModel,
        packageCarrierParamList: this.carrierBaseSetting,
        text: activeData.text
      };
      this.desigMethodActionBoList.forEach((i, index) => {
        if (i.shippingMethodId === activeData.shippingMethodId) {
          // 如果已经存在 就替换
          shipIndex = index;
        }
      });
      if (shipIndex !== null) {
        this.desigMethodActionBoList.splice(shipIndex, 1, obj);
      } else {
        this.desigMethodActionBoList.push(obj);
      }
      this.value2 = null;
      this.shippingAccountModel = '';
      this.isPms = false;
      this.isOnlineShip = 0;
      this.carrierBaseSetting = [];
      if (this.$refs.shipAccount && this.$refs.shipAccount.reset) {
        this.$refs.shipAccount.reset();
      }
      this.activeShippingMethodData.shippingMethodId = null;
      this.activeShippingMethodData = null;
    },
    showShippingDataApiMatch (val) {
      // 没有仓库
      return new Promise(resolve => {
        this.axios.get(api.erpServiceCommon + api.get_enableCarriersApi + '?warehouseId=' + this.selectWareID + '&isFilter=true' + '&warehouseType=' + this.newWarehouseType).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let pos = [];
            for (let i = 0; i < data.length; i++) {
              pos.push({
                ...data[i],
                value: data[i].carrierId,
                label: data[i].carrierName,
                children: [],
                loading: false,
                isOnlineShip: data[i].isOnline
              });
            }
            resolve(pos);
          }
        });
      });
    },
    getAccountApiMatch (data) {
      // value[0] 是 carrierId， selectedData[0] 是 carrierId 对应的对象
      // value[1] 是 shippingMethodId， selectedData[0] 是 shippingMethodId 对应的对象
      let value = [];
      let selectedData = [];
      if (!this.$common.isEmpty(data.carrierId)) {
        value = [data.carrierId, data.shippingMethodId];
        selectedData = [data.parentNode, data.choseNode];
      }
      this.carrierAccount = [];
      this.shippingMethodModel = [];
      this.shippingAccountModel = '';
      this.activeShippingMethodData = {};
      this.apiInterfaceStatus = '';
      this.isOnlineShip = 0;
      if (value.length === 0) return false;
      const pmsInfo = selectedData.find(fin => {
        return [0, '0'].includes(fin.isPms)
      });
      // 是否 pms
      this.isPms = !this.$common.isEmpty(pmsInfo);
      this.desigMethodActionBoList.some(i => {
        if (i.shippingMethodId === value[1]) {
          // 如果已经选择就把值带出来
          this.showDesig(i);
          return true;
        }
      });
      this.activeShippingMethodData = {
        carrierId: value[0],
        shippingMethodId: value[1],
        text: selectedData[0].label + '/' + selectedData[1].label
      }; // 用于存当前选中的
      this.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      this.isOnlineShip = selectedData[0].isOnline; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      this.getCarrierBaseSettingApiMatch(value[1]);
      if (!this.$common.isEmpty(value[1])) {
        if (selectedData[1].carrierAccounts && selectedData[1].carrierAccounts.length == 1) {
          this.shippingAccountModel = selectedData[1].carrierAccounts[0].carrierAccountId;
        }
        this.carrierAccount = selectedData[1].carrierAccounts;
      }
    },
    getCarrierBaseSettingApiMatch (shippingMethodId, model) {
      // api.get_enableCarriersApi 太分散 未集中处理
      // 提取公共方法  此方法用于 /matchTheLogistics 物流方式 所有平台
      let v = this;
      v.carrierBaseSetting = [];
      v.shippingMethodModel = [];
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
        }
      });
    },

    onlyDistriHaveStockSelectedChange () {
      if (!this.actionParams.onlyDistriHaveStockSelected) {
        this.$nextTick(() => {
          this.actionParams.matchOtherRulesSelected2 = false;
        });
      }
    },
    getRuleCode (ruleCode, type, inverse) {
      let mapObj = {
        'O001': 'O001', // 订单来源
        'O002': 'O002', // 发货仓库
        'O003': 'O003', // 订单目的地
        'O004': 'O004', // 订单目的地
        'O005': 'O005', // 指定洲/省
        'O006': 'O006', // 订单收货地址城市
        'O007': 'O007', // 订单总金额
        'O008': 'O008', // 订单利润
        'O009': 'O009', // 订单产品分类指定SKU和商品标签
        'O010': 'O010', // eBay订单是否
        'O011': 'O011', // 产品刊登标题所含关键字包含
        'O012': 'O012', // eBay订单是否包含EGD物品
        'O013': 'O013', // 货品所在地为指定国家/城市/邮编
        'W005': 'O013',
        'W006': 'O012',
        'W007': 'O011',
        'W004': 'W004',
        'W003': 'O009',
        'W002': 'O004',
        'W001': 'O001',
        'order-service-A019': 'order-service-A019', // 订单收件人电话要求
        'order-service-A016': 'order-service-A016', // 订单收货地址街道信息
        'order-service-A018': 'order-service-A018', // 订单收货邮编
        'order-service-A020': 'order-service-A020', // 订单收件人姓名/地址
        'order-service-A014': 'order-service-A014', // 订单/交易/运输类型的关系
        'order-service-A017': 'order-service-A017', // 订单收货邮编
        'order-service-A005': 'order-service-A005', // 订单收货地址省/州
        'order-service-A006': 'order-service-A006', // 订单收货地址城市
        'order-service-A004': 'order-service-A004', // 订单目的地
        'order-service-A003': 'order-service-A003', // 买家选择的运输类型
        'order-service-A015': 'order-service-A015', // 收货地址街道
        'order-service-A001': 'order-service-A001', // 订单来源
        'order-service-A007': 'order-service-A007', // 订单总金额
        'order-service-A021': 'order-service-A021', // 买家支付的运费
        'order-service-A025': 'order-service-A025', // 订单货品长度
        'order-service-A026': 'order-service-A026', // 订单货品宽度
        'order-service-A023': 'order-service-A023', // 订单货品包含指定货品
        'order-service-A009': 'order-service-A009', // 订单产品包含
        'order-service-A043': 'order-service-A043', // 订单产品包含
        'order-service-A024': 'order-service-A024', // 订单重量
        'order-service-A022': 'order-service-A022', // 订单货品总数量
        'order-service-A027': 'order-service-A027', // 订单货品高度
        'order-service-A028': 'order-service-A028', // 订单货品体积
        'order-service-A049': 'order-service-A049', // 订单货品周长
        'order-service-A029': 'order-service-A029', // 订单货品状态包含指定的商品状态
        'order-service-A031': 'order-service-A031', // 买家曾经有过退款记录
        'order-service-A032': 'order-service-A032', // 订单买家ID包含指定字符串
        'order-service-A033': 'order-service-A033', // joom 订单总金额
        'order-service-A013': 'order-service-A013', // 货品所在地为
        'order-service-A030': 'order-service-A030', // 订单中Listing单价
        'order-service-A010': 'order-service-A010', // eBay订单是否eBayPlus订单
        'order-service-A011': 'order-service-A011', // 产品刊登标题所含关键字
        'order-service-A012': 'order-service-A012', // eBay订单是否包含EGD物品
        'order-service-A034': 'order-service-A034', // 订单产品店铺SKU
        'order-service-A039': 'order-service-A039', // 是否黑名单
        'order-service-A035': 'order-service-A035', // 是否是Wish Express
        'order-service-A044': 'order-service-A044', // 是否是合单
        'order-service-A045': 'order-service-A045', // 是否是十日达订单
        'order-service-A041': 'order-service-A041', // 订单类型：ToB订单/ToC订单
        'order-service-A042': 'order-service-A042', // 是否是prime订单：是/否
        'order-service-A036': 'order-service-A036', // 是否是EPC订单
        'order-service-A037': 'order-service-A037', // 是否是优质服务商订单
        'order-service-A038': 'order-service-A038', // 是否是A+物流计划订单
        'order-service-A046': 'order-service-A046', // 是否是可选A+物流计划订单
        'order-service-A040': 'order-service-A040', // 是否是是否集运订单
        'order-service-A047': 'order-service-A047', // 是否要求支付消费者VAT
        'order-service-A048': 'order-service-A048' // 是否要求合并计划订单
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    getWareRuleCode (ruleCode, inverse) {
      // 分仓规则 和智能物流规则对应
      let mapObj1 = {
        'W013': 'order-service-A017',
        'W014': 'order-service-A018',
        'W015': 'order-service-A019',
        'W016': 'order-service-A020',
        'W008': 'order-service-A014',
        'W009': 'order-service-A015',
        'W012': 'order-service-A016',
        'W031': 'order-service-A003',
        'W002': 'order-service-A004',
        'W010': 'order-service-A005',
        'W011': 'order-service-A006',
        'W001': 'order-service-A001',
        'W018': 'order-service-A021',
        'W033': 'order-service-A039',
        'W017': 'order-service-A007',
        'W028': 'order-service-A034',
        'W004': 'order-service-A034',
        'W019': 'order-service-A022',
        'W020': 'order-service-A023',
        'W032': 'order-service-A024',
        'W021': 'order-service-A025',
        'W029': 'order-service-A026',
        'W022': 'order-service-A027',
        'W023': 'order-service-A028',
        'W024': 'order-service-A029',
        'W003': 'order-service-A009',
        'W042': 'order-service-A043',
        'W025': 'order-service-A031',
        'W026': 'order-service-A032',
        'W030': 'order-service-A030',
        'W005': 'order-service-A013',
        'W027': 'order-service-A010',
        'W007': 'order-service-A011',
        'W006': 'order-service-A012',
        'W040': 'order-service-A041',
        'W041': 'order-service-A042',
        'W034': 'order-service-A035',
        'W035': 'order-service-A036',
        'W036': 'order-service-A037',
        'W037': 'order-service-A038',
        'W038': 'order-service-A040',
        'W039': 'order-service-A033',
        'W043': 'order-service-A044',
        'W044': 'order-service-A045',
        'W045': 'order-service-A046',
        'W046': 'order-service-A047',
        'W047': 'order-service-A048'
      };
      // 自动分仓
      if (inverse) {
        let mapKey = '';
        for (let key in mapObj1) {
          if (mapObj1[key] === ruleCode) {
            mapKey = key;
          }
        }
        return mapKey;
      } else {
        return mapObj1[ruleCode];
      }
    },
    getBackRuleCode (ruleCode, type) { // 反推 code
      let mapObj = {
        'O002': 'O002', // 发货仓库
        'O003': 'O003', // 订单目的地
        'O005': 'O005', // 指定洲/省
        'O006': 'O006', // 订单收货地址城市
        'O007': 'O007', // 订单总金额
        'O008': 'O008', // 订单利润
        'O010': 'O010', // eBay订单是否
        'O013': 'W005',
        'O012': 'W006',
        'O011': 'W007',
        'W004': 'W004',
        'W033': 'W033',
        'O009': 'W003',
        'O004': 'W002',
        'O001': 'W001'
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    resetRuleData () {
      let v = this;
      v.rulesModel = [];
      v.country1Codes = [];
      v.productCategoryIdList = [];
      v.componentsModel['order-service-A001'] = {
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      };
      v.amountRange = {
        usdUpper: 0,
        usdFloor: 0,
        audUpper: 0,
        audFloor: 0,
        eurUpper: 0,
        eurFloor: 0,
        gbpUpper: 0,
        gbpFloor: 0
      };
      v.source = {
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      };
      v.warehouseIdsName = [];
      v.platformAccountList = [];
      v.sitesList = [];
      v.postcodeArea = '';
      v.shopSku = {
        start: '',
        end: ''
      };
      v.smShippingSearch = [];
      v.smShippingMethodList = [];
      v.hasSite = false;
      v.shipmentSearchValue = null;
      v.shipmentPlatformModel = '';
      v.shipmentPlatformSite = '';
      v.shipmentPlatformList = [];
      v.shipmentPlatformSiteList = [];
      v.shipmentCheckBoxModel = [];
      v.shipmentTagModel = [];
      v.shipmentTagJson = {};
      v.postcodeOne = '';
      v.postcodeTwo = '';
      v.postcodeArr = [
        {
          postcode1: '',
          postcode2: ''
        }
      ];
      v.countryCodesName = '';
      v.treeArr = [];
      v.countryCodes = [];
      v.countryData = [];
      v.actionParams = {
        status: 0,
        ruleName: null,
        type: 0,
        carrierId: null,
        shippingMethodId: null,
        timeSelected: false,
        maxSelectedValue: null,
        timeTracknumberType: 0,
        tracknumberSelected: false,
        tracknumberSelectedValue: 1,
        isSupended: 0,
        isRemind: 0,
        supendedOrderReason: null,
        shipmentRemindingReason: null,
        warehouseIds: null,
        matchOtherRulesSelected: true,
        warehouseIdList: [],
        onlyDistriHaveStockSelected: true,
        matchOtherRulesSelected2: true
      };
      v.showProductStatus = [];
      v.componentsModel['O002'].warehouseIds = [];
      v.componentsModel['order-service-A003'].shipmentTypes = [];
      v.componentsModel['order-service-A004'] = {
        countryCodes: [],
        postalCodeType: 0,
        buyerPostalCodes: ''
      };
      v.componentsModel['order-service-A005'].states = '';
      v.componentsModel['order-service-A006'].cities = '';
      v.componentsModel['order-service-A007'].amountRange = [];
      v.componentsModel['order-service-A009'] = {
        productCategories: [],
        skus: '',
        productTags: []
      };
      v.componentsModel['order-service-A010'].isEbayPlus = '1';
      v.componentsModel['order-service-A039'].isBuyerInBlackList = '1';
      v.componentsModel['order-service-A035'].isWishExpress = '1';
      v.componentsModel['order-service-A044'].isCombinedOrder = '1';
      v.componentsModel['order-service-A045'].isTenDaysOrder = '1';
      v.componentsModel['order-service-A041'].amazonOrderType = '1';
      v.componentsModel['order-service-A042'].amazonPrime = '1';
      v.componentsModel['order-service-A036'].isWishEPC = '1';
      v.componentsModel['order-service-A037'].isWishQualityServiceOrder = '1';
      v.componentsModel['order-service-A038'].isWishALogisticsPlanOrder = '1';
      v.componentsModel['order-service-A046'].isWishOptionalAdvancedLogistics = '1';
      v.componentsModel['order-service-A047'].wishPayCustomerVatRequired = '1';
      v.componentsModel['order-service-A048'].wishEligibleForShippingReimbursement = '1';
      v.componentsModel['order-service-A040'].isVovaIsCombineOrder = '1';
      v.componentsModel['order-service-A012'].include = '1';
      v.componentsModel['order-service-A016'].length = null;
      v.componentsModel['order-service-A014'].selectType = null;
      v.componentsModel['order-service-A029'].productStatus = null;
      v.componentsModel['order-service-A020'].anomalousList = [];
      v.componentsModel['order-service-A034'].shopSku = null;
      v.componentsModel['order-service-A011'] = {
        productKeyword: [
          {
            value: ''
          }
        ],
        type: 0
      };
      v.componentsModel['order-service-A032'] = {
        containsStr: [
          {
            value: ''
          }
        ]
      };
      v.componentsModel['order-service-A015'] = {
        streets: [
          {
            value: ''
          }
        ]
      };
      v.componentsModel['order-service-A022'] = {
        orderPdtNumParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A030'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          currency: null
        }
      };
      v.componentsModel['order-service-A033'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          currency: null
        }
      };
      v.componentsModel['order-service-A028'] = {
        orderPdtBulkParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A049'] = {
        orderPdtBulkParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A021'] = {
        buyCostParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          currency: null
        }
      };
      v.componentsModel['order-service-A026'] = {
        orderPdtWidthParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A019'] = {
        phoneParams: {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          mobileLength: null,
          phonePreRelateType: 0,
          phoneLength: null,
          mobilePreRelateType: 0,
          mobilePreSlect: 0,
          mobilePres: []
        }
      };
      v.componentsModel['order-service-A027'] = {
        orderPdtHeightParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A025'] = {
        orderPdtLengthParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['order-service-A017'] = {
        orderZipCodeParams: {
          checkbox1: false,
          checkbox2: false,
          beginStr: [],
          containsStr: null,
          relevance: 0
        }
      };
      v.componentsModel['order-service-A023'] = {
        orderProductParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          skus: ''
        }
      };
      v.componentsModel['order-service-A024'] = {
        orderPdtWeightParams: {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          computeWeightFactor: 5000
        }
      };
      v.componentsModel['order-service-A013'] = {
        goodsCountry: '',
        goodsCity: '',
        goodsPostalCode: ''
      };
      v.componentsModel['order-service-A018'] = {
        zipCodeParams: {
          checkbox1: false,
          checkbox2: false,
          startType: 0,
          startValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.productTagList = [];
      v.skusStatus = false;
      v.skusStatus1 = false;
      v.productCategoryListName = '';
      v.productCategoryList = [];
      v.autoRuleItems = [];
      for (let i in v.componentsStatus) {
        for (let b in v.componentsStatus[i]) {
          v.componentsStatus[i][b] = false;
        }
      }
      v.componentsModel['order-service-A020'].anomalousList = [];
      v.componentsModel['order-service-A029'].productStatus = [];
      v.componentsModel['order-service-A014'].selectType = null;
      v.componentsModel['order-service-A016'].length = null;
      v.componentsModel['order-service-A018'].zipCodeParams = {
        checkbox1: false,
        checkbox2: false,
        startType: 0,
        startValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A022'].orderPdtNumParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A028'].orderPdtBulkParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A049'].orderPdtBulkParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A026'].orderPdtWidthParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A027'].orderPdtHeightParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A025'].orderPdtLengthParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['order-service-A024'].orderPdtWeightParams = {
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        computeWeightFactor: 5000
      };
      v.componentsModel['order-service-A032'] = {
        containsStr: [
          {
            value: ''
          }
        ]
      };
      v.componentsModel['order-service-A015'] = {
        streets: [
          {
            value: ''
          }
        ]
      };
      v.componentsModel['order-service-A030'].listingParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        currency: null
      };
      v.componentsModel['order-service-A033'].listingParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        currency: null
      };
      v.componentsModel['order-service-A021'].buyCostParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        currency: null
      };
      v.componentsModel['order-service-A019'].phoneParams = {
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        mobileLength: null,
        phonePreRelateType: 0,
        phoneLength: null,
        mobilePreRelateType: 0,
        mobilePreSlect: 0,
        mobilePres: []
      };
      v.componentsModel['order-service-A017'].orderZipCodeParams = {
        checkbox1: false,
        checkbox2: false,
        beginStr: [],
        containsStr: null,
        relevance: 0
      };
      v.componentsModel['order-service-A023'].orderProductParams = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        skus: ''
      };
      v.anomalousModalParams = {
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        checkbox4: false,
        checkbox5: false,
        checkbox6: false,
        checkbox7: false,
        nameSpaceLess: null,
        nameCharacterLess: null,
        addressCharacterLess: null,
        cityCharacterLess: null,
        stateCharacterLess: null,
        postCodeCharacterLess: null,
        phoneCharacterLess: null
      };
      v.apiInterfaceStatus = '';
      v.value2 = null;
      v.shippingAccountModel = '';
      v.activeShippingMethodData = {};
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.desigMethodActionBoList = [];
    },
    getRuleDetails () {
      // let url;
      // const type = this.ruleParmas.type;
      this.loadRuleing = true;
      this.oldComponentsModel = this.$common.copy(this.componentsModel);
      this.oldComponentsStatus = this.$common.copy(this.componentsStatus);
      this.autoRuleId = this.ruleParmas.autoRuleId;
      this.$nextTick(() => {
        this.actionParams.ruleName = this.ruleParmas.name;
        this.actionParams.status = Number(this.ruleParmas.status);
      });
      // if (type === 0) {
      //   url = api.get_warehouseRuleDetail;
      // } else if (type === 2 || type === 1) {
      //   url = api.get_orderAutoAuditRuleDetail;
      // }
      this.isOnlineShip = 0;
      this.isPms = false;
      let apiUrl = this.ruleType === 'smart' ? api.get_carrierAutoRule : api.get_warehouseRuleDetail;
      this.axios.get(apiUrl + this.autoRuleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (!this.$common.isEmpty(data.selectedRule)) {
            this.actionParams.remark = data.selectedRule.remark;
          }
          const processingData = async() => {
            const rulesResult = await this.setRulesGroup(data.rules);// 可选条件分组
            if (rulesResult) {
              if (data.ruleItems !== null && data.ruleItems.length > 0) {
                this.ruleItems = data.ruleItems;
                this.processingRulesItemData(data.ruleItems);
              }
              this.processingActions(data.ruleActions);
            }
          }

          processingData();
        }
      }).catch(() => {
        this.loadRuleing = false;
      });
    },
    processingActions (ruleActions) {
      let v = this;
      if (ruleActions !== null && ruleActions.length > 0) {
        for (let i = 0; i < ruleActions.length; i++) {
          let action = ruleActions[i];
          // if (action.type === 'assignCarrier') {
          //   v.actionParams.isSupended = Number(action.value);
          // } else if (action.type === 'shipmentReminding') {
          //   v.actionParams.isRemind = Number(action.value);
          // } else if (action.type === 'shipmentRemindingReason') {
          //   v.actionParams.shipmentRemindingReason = action.value;
          // } else if (action.type === 'supendedOrderReason') {
          //   v.actionParams.supendedOrderReason = action.value;
          // }
          if (action.type === 'assignCarrier') {
            let data = JSON.parse(action.value);
            v.actionParams.type = data.type;
            if (!data.type) { // 0指定 1条件
              v.$nextTick(() => {
                if (data.desigMethodActionBoList) {
                  v.getShipName(data.desigMethodActionBoList).then(data => {
                    v.desigMethodActionBoList = data;
                  });
                } else {
                  v.desigMethodActionBoList = [];
                }
              });
              v.axios.get(api.get_enableShippingMethods + '?carrierId=' + data.carrierId + '&warehouseId=' + v.ruleParmas.businessId).then(response => {
                let data = response.data.datas;
                let pos = [];
                data.forEach((n, i) => {
                  pos.push({
                    value: n.shippingMethodId,
                    label: n.carrierShippingMethodName
                  });
                });
                v.shippingMethodList = pos;
              }).catch(() => {
                this.loadRuleing = false;
              });
            } else {
              if (data.timeSelected) {
                v.actionParams.timeSelected = true;
                v.actionParams.maxSelectedValue = data.maxSelectedValue;
              }
              if (data.tracknumberSelected) {
                v.actionParams.tracknumberSelected = true;
                v.actionParams.tracknumberSelectedValue = data.tracknumberSelectedValue;
              }
              v.actionParams.timeTracknumberType = data.timeTracknumberType;
            }
          } else if (action.type === 'supended') {
            v.actionParams.isSupended = Number(action.value);
          } else if (action.type === 'shipmentReminding') {
            v.actionParams.isRemind = Number(action.value);
          } else if (action.type === 'shipmentRemindingReason') {
            v.actionParams.shipmentRemindingReason = action.value;
          } else if (action.type === 'supendedOrderReason') {
            v.actionParams.supendedOrderReason = action.value;
          } else if (action.type === 'assignWarehouse') {
            let value = JSON.parse(action.value);
            v.actionParams.type = value.type;
            if (v.actionParams.type === 0) {
              v.actionParams.warehouseIds = value.warehouseIds;
            } else {
              v.actionParams.onlyDistriHaveStockSelected = value.onlyDistriHaveStockSelected !== 0;
              v.actionParams.matchOtherRulesSelected2 = value.matchOtherRulesSelected2 !== 0;
              v.actionParams.warehouseIdList = value.warehouseIds.split(',');
              let arr = [];
              v.listData = [];
              v.listSortDate = [];
              v.actionParams.warehouseIdList.forEach(i => {
                v.storeList.forEach(j => {
                  if (i === j.warehouseId) {
                    arr.push(j);
                  }
                });
              });
              v.listData = arr;
              v.listSortDate = v.deepCopy(v.listData);
            }

            v.actionParams.matchOtherRulesSelected = value.matchOtherRulesSelected === 1;
          }
          if (i >= ruleActions.length - 1) {
            this.loadRuleing = false;
          }
        }
      } else {
        this.loadRuleing = false;
      }
    },
    addItem (name, code, type) { // getAPIData
      let v = this;
      if (name === 'warehouseIds') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getStore(1); // 获取仓库列表
      } else if (name === 'platformIds') {
        v.componentsStatus[code][name] = !this.looKsettings;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: !!v.componentsStatus['order-service-A001'].siteIds,
            saleAccountIds: !!v.componentsStatus['order-service-A001'].saleAccountIds
          });
        }
      } else if (name === 'siteIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        v.componentsStatus[code][name] = !this.looKsettings;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({ siteIds: true, saleAccountIds: !!v.componentsStatus['order-service-A001'].saleAccountIds });
        }
      } else if (name === 'saleAccountIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({ siteIds: !!v.componentsStatus['order-service-A001'].siteIds, saleAccountIds: true });
        }
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'goodsCountry') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCountrys();
      } else if (name === 'goodsCity' || name === 'goodsPostalCode') {
        if (v.componentsModel[code]['goodsCountry'].length === 0 && !v.componentsStatus[code]['goodsCountry']) {
          v.$Message.error('请先选择国家');
          return false;
        }
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'include' || name === 'productKeyword' || name === 'isEbayPlus' || name === 'priceRange' || name === 'cities' || name === 'amountRange' || name === 'states' || name === 'isBuyerInBlackList' || name === 'isWishExpress' || name === 'isWishEPC' || name === 'isWishQualityServiceOrder' || name === 'wishPayCustomerVatRequired' || name === 'wishEligibleForShippingReimbursement' || name === 'isWishALogisticsPlanOrder' || name === 'isVovaIsCombineOrder') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'skus') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'productTags') {
        if (type) {
          v.getProductTags();
        } else {
          v.componentsStatus[code][name] = !this.looKsettings;
        }
      } else if (name === 'productCategories') {
        v.getProductCategory().then(result => {
          if (result) {
            if (v.productCategoryIdList && v.productCategoryIdList.length > 0) {
              v.validCategoryIdMt(v.productCategoryIdList);
              v.setTreeDate(v.productCategoryIdList);
            }
            v.componentsStatus[code][name] = !this.looKsettings;
          }
        });
      } else if (name === 'countryCodes') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCommonCountry(v.treeArr);
      } else if (name === 'buyerPostalCodes') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'shipmentTypes') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getShipment({
          siteIds: !!v.componentsStatus['order-service-A001'].siteIds,
          saleAccountIds: !!v.componentsStatus['order-service-A001'].saleAccountIds
        });
      } else if (name === 'shopSku') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'anomalousList') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.anomalousModal = true;
        v.anomalousModalStatus = true;
      } else if (name === 'zipCodeParams') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'productStatus') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'containsStr') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'streets') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'listingParams') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCurrencyInfo();
      } else if (name === 'buyCostParams') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCurrencyInfo();
      } else {
        v.componentsStatus[code][name] = !this.looKsettings;
      }
    },
    getShipment (type) { // 获取运输类型平台
      this.getEnablePlatform().then(data => {
        this.shipmentPlatformList = data;
        this.getShimentSites(this.componentsModel['order-service-A001'].platformIds, type);
      });
    },
    getShimentSites (platformArr, type = {}) { // 站点获取
      let v = this;
      let sitesArr = [];
      let accountSite = [];
      v.shipmentPlatformList.forEach((n, i) => {
        platformArr.forEach((m, t) => {
          if (n.platformId === m) {
            sitesArr = sitesArr.concat(n.sites);
            accountSite = accountSite.concat(n.saleAccounts);
          }
        });
      });
      v.platformAccountList = accountSite;
      if (sitesArr.length > 0) {
        let hasSiteIds = [];
        sitesArr.forEach((n, i) => {
          if (n.cnName.indexOf(n.platformId) < 0) {
            n.cnName = n.platformId + '-' + n.cnName;
          }
          if (v.componentsModel['order-service-A001'].siteIds && v.componentsModel['order-service-A001'].siteIds.length > 0 && v.componentsModel['order-service-A001'].siteIds.includes(n.siteId)) {
            hasSiteIds.push(n.siteId);
          }
        });
        v.sitesList = sitesArr;
        if (hasSiteIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['order-service-A001'].siteIds = hasSiteIds;
          });
        } else {
          v.componentsModel['order-service-A001'].siteIds = [];
        }
      } else {
        v.componentsModel['order-service-A001'].siteIds = [];
      }
      if (v.platformAccountList.length > 0) {
        let hasSaleAccountIds = []; // 还存在的账号
        v.platformAccountList.forEach(i => {
          if (v.componentsModel['order-service-A001'].saleAccountIds && v.componentsModel['order-service-A001'].saleAccountIds.length > 0 && v.componentsModel['order-service-A001'].saleAccountIds.includes(i.saleAccountId)) {
            hasSaleAccountIds.push(i.saleAccountId);
          }
        });
        if (hasSaleAccountIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['order-service-A001'].saleAccountIds = hasSaleAccountIds;
          });
        } else {
          v.componentsModel['order-service-A001'].saleAccountIds = [];
        }
      } else {
        v.componentsModel['order-service-A001'].saleAccountIds = [];
      }
      v.componentsStatus['order-service-A001'].siteIds = !!type.siteIds;
      v.componentsStatus['order-service-A001'].saleAccountIds = !!type.saleAccountIds;
    },
    deleteShipMethod (shipId, index) {
      let v = this;
      if (shipId === undefined) {
        v.smShippingMethodList.splice(index, 1);
        v.$Message.success('操作成功');
        return;
      }
      v.axios.delete(api.delete_merchantShippingMethod + shipId).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.shipmentSearch(true);
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    saveShopifyLogisticsMode () {
      // 新增运输类型
      let v = this;
      if (v.shippingMethodName === '') {
        v.$Message.error('运输类型为空');
        return;
      }
      v.axios.post(api.add_merchantShippingMethod, {
        'platformId': v.shipmentPlatformModel,
        'shippingMethodName': v.shippingMethodName
      }).then(res => {
        if (res.data.code === 0) {
          v.shippingMethodName = '';
          v.$Message.success('添加成功');
          v.shipmentSearch(true);
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    setTagValue (checkboxArr) { // 运输类型产生tag
      let v = this;
      let arr = [];
      if (this.$common.isEmpty(checkboxArr)) {
        v.shipmentTagModel = [];
        v.shipmentTagJson = {};
        return;
      }
      for (let i = 0; i < checkboxArr.length; i++) {
        if (!v.$common.isEmpty(v.shipmentTagJson[checkboxArr[i]])) {
          arr.push(v.shipmentTagJson[checkboxArr[i]]);
        }
        const prefix = checkboxArr[i].split(':')[0];
        if (checkboxArr[i].split(':').length > 3) {
          // 有站点
          let item = checkboxArr[i].split(':')[3];
          for (let t = 0; t < v.smShippingMethodList.length; t++) {
            let subItem = v.smShippingMethodList[t];
            if (item === subItem.shippingMethodName && !v.shipmentTagModel.includes(prefix + ':' + subItem.siteName + ':' + subItem.shippingMethodDescription)) {
              arr.push(prefix + ':' + subItem.siteName + ':' + subItem.shippingMethodDescription);
              v.$set(v.shipmentTagJson, checkboxArr[i], prefix + ':' + subItem.siteName + ':' + subItem.shippingMethodDescription);
            }
          }
        } else {
          let item = checkboxArr[i].split(':')[1].split(':')[0];
          for (let t = 0; t < v.smShippingMethodList.length; t++) {
            let subItem = v.smShippingMethodList[t];
            if (item === subItem.shippingMethodName && !v.shipmentTagModel.includes(prefix + ':' + subItem.shippingMethodDescription)) {
              arr.push(prefix + ':' + subItem.shippingMethodDescription);
              v.$set(v.shipmentTagJson, checkboxArr[i], prefix + ':' + subItem.shippingMethodDescription);
            }
          }
        }
      }

      Object.keys(v.shipmentTagJson).forEach(key => {
        if (!checkboxArr.includes(key)) {
          delete v.shipmentTagJson[key];
        }
      });
      v.shipmentTagModel = v.$common.arrRemoveRepeat(arr);
    },
    getSite (val) { // 获取站点
      this.smShippingMethodList = [];
      this.shipmentPlatformSiteList = [];
      this.shipmentPlatformSite = '';
      this.shipmentSearchValue = '';
      for (let i = 0; i < this.shipmentPlatformList.length; i++) {
        let item = this.shipmentPlatformList[i];
        if (item.platformId === val && item.sites.length > 0) {
          this.hasSite = true;
          this.getSmShippingMethod(val, item.sites[0].siteId, item.sites[0].cnName);
          this.$nextTick(() => {
            this.shipmentPlatformSiteList = item.sites;
            this.shipmentPlatformSite = item.sites[0].siteId;
          });
        } else if (item.platformId === val && item.sites.length === 0) {
          this.hasSite = false;
          this.shipmentPlatformSiteList = [];
          this.getSmShippingMethod(val);
        }
      }
    },
    delTag (index) { // 删除标签
      let v = this;
      v.shipmentCheckBoxModel.splice(index, 1);
      v.shipmentTagModel.splice(index, 1);
    },
    tagColor (item) {
      item = item.split(':')[0];
      switch (item) {
        case 'ebay':
          return 'blue';
        case 'aliexpress':
          return 'red';
        default:
          return 'yellow';
      }
    },
    shipmentSearch (type) {
      this.smShippingMethodList = [];
      this.$nextTick(() => {
        if (!type) {
          this.smShippingMethodList = this.smShippingSearch.filter(item => {
            return item.shippingMethodDescription.toLowerCase().indexOf(this.shipmentSearchValue.toLowerCase()) > -1;
          });
          return;
        }
        let siteName = this.shipmentPlatformSiteList.find(i => i.siteId === this.shipmentPlatformSite);
        siteName = this.$common.isEmpty(siteName) ? '' : siteName.cnName;
        this.getSmShippingMethod(this.shipmentPlatformModel, this.shipmentPlatformSite, siteName);
      })
    },
    // 站点改变时
    setSite (val) {
      this.smShippingMethodList = [];
      this.$nextTick(() => {
        let siteName = this.shipmentPlatformSiteList.find(i => i.siteId === val);
        siteName = this.$common.isEmpty(siteName) ? '' : siteName.cnName;
        this.getSmShippingMethod(this.shipmentPlatformModel, val, siteName).then(() => {
          if (this.shipmentCheckBoxModel && this.shipmentCheckBoxModel.length > 0) {
            let data = this.shipmentCheckBoxModel.map(i => i);
            this.shipmentCheckBoxModel = [];
            this.$nextTick(() => {
              this.shipmentCheckBoxModel = data;
            })
          }
        });
      })
    },
    // 买家选择的运输类型查询
    getSmShippingMethod (platformId, siteId, siteName) {
      let objParam = {
        time: new Date().getTime(),
        platformId: platformId
      };
      if (!this.$common.isEmpty(siteId)) {
        objParam.siteId = siteId;
      }
      if (!this.$common.isEmpty(this.shipmentSearchValue)) {
        objParam.search = this.shipmentSearchValue;
      }
      return new Promise(resolve => {
        this.smShippingMethodList = [];
        this.axios.get(api.get_queryShippingMethod, {
          params: objParam
        }).then(response => {
          if (response.data.code === 0) {
            this.smShippingSearch = response.data.datas.map(i => {
              if (siteId) {
                i.siteId = siteId;
                i.siteName = siteName;
              }
              return i;
            });
            if (!this.$common.isEmpty(this.shipmentSearchValue)) {
              this.smShippingMethodList = this.smShippingSearch.filter(item => {
                return item.shippingMethodDescription.toLowerCase().indexOf(this.shipmentSearchValue.toLowerCase()) > -1;
              });
            } else {
              this.smShippingMethodList = this.$common.copy(this.smShippingSearch);
            }
            resolve();
          }
        }).catch(() => {
          resolve();
        });
      });
    },
    processingRulesItemData (data) { // 加载时处理已选条件
      let v = this;
      let platArr = [];
      let sitesArr = [];
      let accountArr = [];
      for (let i = 0; i < data.length; i++) { // 已选条件遍历
        let item = data[i];
        let rc;
        if (v.ruleType === 'smart') {
          rc = v.getRuleCode(item.ruleCode);
        } else if (v.ruleType === 'autoCompartment') {
          rc = v.getWareRuleCode(item.ruleCode);
        }
        for (let m = 0; m < v.rules.length; m++) { // 遍历该规则能设置的条件有哪些
          let rItem = v.rules[m];//
          if (rc === rItem.uid) { // 匹配
            let obj = {
              ruleCode: rc,
              autoRuleParams: [],
              type: 1
            };
            for (let k = 0; k < rItem.items.length; k++) { // oItem 循环规则有的选项
              let oItem = rItem.items[k];
              let subObj = { // oItem规则分类名
                name: oItem.name
              };
              for (let b = 0; b < item.ruleItemParams.length; b++) {
                let bItem = item.ruleItemParams[b];
                if (this.$common.isEmpty(bItem.ruleItemParamValues)) {
                  bItem.ruleItemParamValues = [];
                }
                if (bItem.name === oItem.name) { // 循环已保存规则并插入 ????
                  if (rc === 'order-service-A013' || rc === 'order-service-A012' || rc === 'order-service-A010' || rc === 'order-service-A031' || rc === 'order-service-A039' || rc === 'order-service-A035' || rc === 'order-service-A041' || rc === 'order-service-A042' || rc === 'order-service-A036' || rc === 'order-service-A037' || rc === 'order-service-A038' || rc === 'order-service-A040' || rc === 'order-service-A044' || rc === 'order-service-A045' || rc === 'order-service-A046' || rc === 'order-service-A047' || rc === 'order-service-A048') { // 如果是单选
                    subObj.value = bItem.value;
                  } else { // 如果是多选
                    if (subObj.hasOwnProperty('autoRuleParamValues')) {
                      subObj.autoRuleParamValues.push(bItem.ruleItemParamValues);
                    } else {
                      subObj.autoRuleParamValues = bItem.ruleItemParamValues;
                    }
                  }
                }

                const exclusive = [
                  'order-service-A013', 'order-service-A012', 'order-service-A010', 'order-service-A006', 'order-service-A005',
                  'order-service-A011', 'order-service-A004', 'order-service-A003', 'W004', 'order-service-A001', 'O002',
                  'order-service-A020', 'order-service-A034', 'order-service-A018', 'order-service-A016', 'order-service-A014',
                  'order-service-A022', 'order-service-A028', 'order-service-A026', 'order-service-A027', 'order-service-A025',
                  'order-service-A024', 'order-service-A029', 'order-service-A031', 'order-service-A032', 'order-service-A033',
                  'order-service-A015', 'order-service-A030', 'order-service-A021', 'order-service-A019', 'order-service-A017',
                  'order-service-A023', 'order-service-A039', 'order-service-A035', 'order-service-A041', 'order-service-A042',
                  'order-service-A036', 'order-service-A037', 'order-service-A038', 'order-service-A040', 'order-service-A044',
                  'order-service-A045', 'order-service-A046', 'order-service-A047', 'order-service-A048', 'order-service-A049'
                ];
                if (!exclusive.includes(rc)) {
                  let skusArr = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) { // 读取选项数据
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'skus') {
                      skusArr.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = skusArr.join('\n');
                    } else if (bItem.name === 'totalPrices') {
                      let totalPricesItem = childItem.value.split(',');
                      if (totalPricesItem[0] === 'usd') {
                        v.amountRange.usdUpper = Number(totalPricesItem[2]);
                        v.amountRange.usdFloor = Number(totalPricesItem[1]);
                      } else if (totalPricesItem[0] === 'aud') {
                        v.amountRange.audUpper = Number(totalPricesItem[2]);
                        v.amountRange.audFloor = Number(totalPricesItem[1]);
                      } else if (totalPricesItem[0] === 'eur') {
                        v.amountRange.eurUpper = Number(totalPricesItem[2]);
                        v.amountRange.eurFloor = Number(totalPricesItem[1]);
                      } else if (totalPricesItem[0] === 'gbp') {
                        v.amountRange.gbpUpper = Number(totalPricesItem[2]);
                        v.amountRange.gbpFloor = Number(totalPricesItem[1]);
                      }
                    } else {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (v.componentsModel[rc][bItem.name].indexOf(childItem.value) < 0) {
                            v.componentsModel[rc][bItem.name].push(childItem.value);
                          }
                        });
                      }
                    }
                    if (oItem.name === 'productCategories' && bItem.name === 'productCategories' && c === bItem.ruleItemParamValues.length - 1) {
                      let arr = [];
                      bItem.ruleItemParamValues.forEach((n, i) => {
                        arr.push(n.value);
                      });
                      v.productCategoryIdList = arr;
                      v.country1Codes = arr;
                      v.getProductCategoryName(arr).then(data => {
                        v.productCategoryListName = data;
                      });
                    }
                  }
                } else if (rc === 'O002') {
                  if (bItem.name === 'warehouseIds' && oItem.name === 'warehouseIds') {
                    let arr = [];
                    let arrIds = [];
                    if (v.storeList.length > 0) {
                      v.storeList.forEach((n, i) => {
                        bItem.ruleItemParamValues.forEach((m, t) => {
                          if (n.warehouseId === m.value) {
                            arr.push(n.warehouseName);
                            arrIds.push(m.value);
                          }
                        });
                      });
                      v.warehouseIdsName = arr;
                      v.componentsModel[rc][bItem.name] = arrIds;
                    } else {
                      v.getStore(1).then(res => {
                        if (res) {
                          v.storeList.forEach((n, i) => {
                            bItem.ruleItemParamValues.forEach((m, t) => {
                              if (n.warehouseId === m.value) {
                                arr.push(n.warehouseName);
                                arrIds.push(m.value);
                              }
                            });
                          });
                          v.warehouseIdsName = arr;
                          v.componentsModel[rc][bItem.name] = arrIds;
                        }
                      });
                    }
                  }
                } else if (rc === 'order-service-A011') {
                  if (bItem.name === 'containsType') {
                    v.componentsModel[rc].type = Number(bItem.value);
                  }
                  if (bItem.name === 'keys' && oItem.name === 'keys') {
                    for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                      if (c === 0) {
                        v.componentsModel[rc].productKeyword = [];
                      }
                      let childItem = bItem.ruleItemParamValues[c];
                      v.componentsModel[rc].productKeyword.push({
                        value: childItem.value
                      });
                    }
                  }
                } else if (rc === 'order-service-A034') {
                  if (bItem.name === 'start' && oItem.name === 'start') {
                    v.shopSkuModel = 0;
                    v.shopSku.start = bItem.value;
                  } else if (bItem.name === 'end' && oItem.name === 'end') {
                    v.shopSkuModel = 1;
                    v.shopSku.end = bItem.value;
                  }
                } else if (rc === 'order-service-A001') { // 订单来源处理
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) { // 读取选项数据
                    let childItem = bItem.ruleItemParamValues[c];
                    if (oItem.name === 'platformIds' && bItem.name === 'platformIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (platArr.indexOf(childItem.value) < 0) {
                            platArr.push(childItem.value);
                            if (platArr.length === bItem.ruleItemParamValues.length) {
                              v.getPlatformName(platArr).then(res => {
                                let arr = [];
                                // let arrIds = [];
                                res.forEach((n, i) => {
                                  arr.push(n.name);
                                });
                                v.source[bItem.name] = arr;
                                v.componentsModel[rc][bItem.name] = platArr;
                              });
                            }
                          }
                        });
                      }
                    } else if (oItem.name === 'siteIds' && bItem.name === 'siteIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (sitesArr.indexOf(childItem.value) < 0) {
                            sitesArr.push(childItem.value);
                            if (sitesArr.length === bItem.ruleItemParamValues.length) {
                              let obj = {
                                platformIds: platArr,
                                siteIds: sitesArr
                              };
                              v.componentsModel[rc][bItem.name] = sitesArr;
                              v.getSitesName(obj).then(res => {
                                let arr = [];
                                // let arrIds = [];
                                res.forEach((n, i) => {
                                  if (n.cnName.indexOf(n.platformId < 0)) {
                                    arr.push(n.platformId + '-' + n.cnName);
                                  } else {
                                    arr.push(n.cnName);
                                  }
                                });
                                v.source[bItem.name] = arr;
                              });
                            }
                          }
                        });
                      }
                    } else if (oItem.name === 'saleAccountIds' && bItem.name === 'saleAccountIds') {
                      v.componentsModel[rc][bItem.name] = [];
                      if (v.componentsModel[rc][bItem.name]) {
                        v.$nextTick(function () {
                          if (accountArr.indexOf(childItem.value) < 0) {
                            accountArr.push(childItem.value);
                            if (accountArr.length === bItem.ruleItemParamValues.length) {
                              let obj = {
                                platformIds: platArr,
                                saleAccountIds: accountArr
                              };
                              v.componentsModel[rc][bItem.name] = accountArr;
                              v.getSalesAccountName(obj).then(res => {
                                let arr = [];
                                let arrIds = [];
                                res.forEach((n, i) => {
                                  if (n.platformId === 'joom') {
                                    // joom 使用accountCode IDY-2046
                                    arr.push(n.accountCode);
                                  } else {
                                    arr.push(n.accountCode);
                                  }

                                  arrIds.push(n.saleAccountId);
                                });
                                v.source[bItem.name] = arr;
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                } else if (rc === 'order-service-A003') {
                  if (bItem.name === 'shipmentTypes' && oItem.name === 'shipmentTypes') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let tagArr = [];
                    val.forEach((obj, i) => {
                      let n = JSON.parse(obj.value);
                      if (n.siteId) {
                        arr.push(n.platformId + ':' + n.siteId + ':' + n.siteName + ':' + n.shipmentName + ':' + n.shipmentDesc);
                        tagArr.push(n.platformId + ':' + n.siteName + ':' + n.shipmentDesc);
                        v.$set(v.shipmentTagJson, n.platformId + ':' + n.siteId + ':' + n.siteName + ':' + n.shipmentName + ':' + n.shipmentDesc, n.platformId + ':' + n.siteName + ':' + n.shipmentDesc);
                      } else {
                        arr.push(n.platformId + ':' + n.shipmentName + ':' + n.shipmentDesc);
                        tagArr.push(n.platformId + ':' + n.shipmentDesc);
                        v.$set(v.shipmentTagJson, n.platformId + ':' + n.shipmentName + ':' + n.shipmentDesc, n.platformId + ':' + n.shipmentDesc);
                      }
                    });
                    v.shipmentCheckBoxModel = arr;
                    v.shipmentTagModel = tagArr;
                  }
                } else if (rc === 'order-service-A004') {
                  if (bItem.name === 'countryCodes' && oItem.name === 'countryCodes') { // 如果是国家.
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let originArr = [];
                    val.forEach((n, i) => {
                      originArr.push(n.value);
                      if (n.value.indexOf('.') > 0 && n.value.split('.')[0] !== n.value.split('.')[1]) {
                        arr.push(n.value.split('.')[1]);
                      } else {
                        arr.push(n.value);
                      }
                    });
                    v.treeArr = val;
                    v.componentsModel[rc]['countryCodes'] = originArr;
                    v.getCommonCountryName(val);
                  }
                  if (bItem.name === 'postalCodeType' && oItem.name === 'postalCodeType') {
                    v.componentsModel[rc].postalCodeType = Number(bItem.value);
                  }
                  if (bItem.name === 'buyerPostalCodes' && oItem.name === 'buyerPostalCodes') {
                    if (v.componentsModel['order-service-A004'].postalCodeType === 0) {
                      // let val = bItem.ruleItemParamValues[0].value;
                      // if (val && val.indexOf('-') > 0) {
                      //   v.postcodeOne = val.split('-')[0];
                      //   v.postcodeTwo = val.split('-')[1];
                      // } else {
                      //   v.postcodeOne = val;
                      // }
                      let val = '';
                      if (bItem.ruleItemParamValues.length > 0) {
                        v.postcodeArr = [];
                        bItem.ruleItemParamValues.forEach(item => {
                          val += item.value;
                          let value = item.value;
                          let o = {};
                          if (value && value.indexOf('-') > 0) {
                            o.postcode1 = value.split('-')[0];
                            o.postcode2 = value.split('-')[1];
                          } else {
                            o.postcode1 = '';
                            o.postcode2 = '';
                          }
                          v.postcodeArr.push(o);
                        });
                      }
                      v.componentsModel[rc]['buyerPostalCodes'] = val;
                    } else {
                      let val = bItem.ruleItemParamValues;
                      let arr = [];
                      if (val !== null) {
                        val.forEach((n, i) => {
                          arr.push(n.value);
                        });
                      }
                      v.componentsModel[rc]['buyerPostalCodes'] = arr.toString();
                      v.postcodeArea = arr.toString();
                    }
                  }
                } else if (rc === 'W004' || rc === 'order-service-A034') {
                  if (bItem.name === 'start' && oItem.name === 'start') {
                    v.shopSkuModel = 0;
                    v.shopSku.start = bItem.value;
                  } else if (bItem.name === 'end' && oItem.name === 'end') {
                    v.shopSkuModel = 1;
                    v.shopSku.end = bItem.value;
                  }
                } else if (rc === 'order-service-A020') {
                  if (bItem.name === 'nameSpaceLess') {
                    v.anomalousModalParams.checkbox1 = true;
                    v.anomalousModalParams.nameSpaceLess = Number(bItem.value);
                  } else if (bItem.name === 'nameCharacterLess') {
                    v.anomalousModalParams.checkbox2 = true;
                    v.anomalousModalParams.nameCharacterLess = Number(bItem.value);
                  } else if (bItem.name === 'addressCharacterLess') {
                    v.anomalousModalParams.checkbox3 = true;
                    v.anomalousModalParams.addressCharacterLess = Number(bItem.value);
                  } else if (bItem.name === 'cityCharacterLess') {
                    v.anomalousModalParams.checkbox4 = true;
                    v.anomalousModalParams.cityCharacterLess = Number(bItem.value);
                  } else if (bItem.name === 'stateCharacterLess') {
                    v.anomalousModalParams.checkbox5 = true;
                    v.anomalousModalParams.stateCharacterLess = Number(bItem.value);
                  } else if (bItem.name === 'postCodeCharacterLess') {
                    v.anomalousModalParams.checkbox6 = true;
                    v.anomalousModalParams.postCodeCharacterLess = Number(bItem.value);
                  } else if (bItem.name === 'phoneCharacterLess') {
                    v.anomalousModalParams.checkbox7 = true;
                    v.anomalousModalParams.phoneCharacterLess = Number(bItem.value);
                  }
                } else if (rc === 'order-service-A017') {
                  if (bItem.name === 'beginStr') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    if (val !== null) {
                      val.forEach((n, i) => {
                        arr.push(n.value);
                      });
                    }
                    v.componentsModel[rc]['orderZipCodeParams'].beginStr = arr;
                    // v.componentsModel[rc]['orderZipCodeParams'].beginStr = bItem.value;
                    if (bItem.ruleItemParamValues === '' || bItem.ruleItemParamValues === null) {
                      v.componentsModel[rc]['orderZipCodeParams'].checkbox1 = false;
                    } else {
                      v.componentsModel[rc]['orderZipCodeParams'].checkbox1 = true;
                    }
                  } else if (bItem.name === 'containsStr') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    if (val !== null) {
                      val.forEach((n, i) => {
                        arr.push(n.value);
                      });
                    }
                    v.componentsModel[rc]['orderZipCodeParams'].containsStr = arr;
                    // v.componentsModel[rc]['orderZipCodeParams'].containsStr = bItem.value;
                    if (bItem.ruleItemParamValues === '' || bItem.ruleItemParamValues === null) {
                      v.componentsModel[rc]['orderZipCodeParams'].checkbox2 = false;
                    } else {
                      v.componentsModel[rc]['orderZipCodeParams'].checkbox2 = true;
                    }
                  } else if (bItem.name === 'relevance') {
                    v.componentsModel[rc]['orderZipCodeParams'].relevance = Number(bItem.value);
                  }
                } else if (rc === 'order-service-A018') {
                  if (bItem.name === 'startType') {
                    v.componentsModel[rc]['zipCodeParams'].startType = Number(bItem.value);
                  } else if (bItem.name === 'startValue') {
                    v.componentsModel[rc]['zipCodeParams'].startValue = Number(bItem.value);
                    v.componentsModel[rc]['zipCodeParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['zipCodeParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['zipCodeParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['zipCodeParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A019') {
                  if (bItem.name === 'mobileLength') {
                    v.componentsModel[rc]['phoneParams'].mobileLength = Number(bItem.value);
                    v.componentsModel[rc]['phoneParams'].checkbox1 = true;
                  } else if (bItem.name === 'phonePreRelateType') {
                    v.componentsModel[rc]['phoneParams'].phonePreRelateType = Number(bItem.value);
                  } else if (bItem.name === 'phoneLength') {
                    v.componentsModel[rc]['phoneParams'].phoneLength = Number(bItem.value);
                    v.componentsModel[rc]['phoneParams'].checkbox2 = true;
                  } else if (bItem.name === 'mobilePreRelateType') {
                    v.componentsModel[rc]['phoneParams'].mobilePreRelateType = Number(bItem.value);
                  } else if (bItem.name === 'mobilePreSlect') {
                    v.componentsModel[rc]['phoneParams'].mobilePreSlect = Number(bItem.value);
                  } else if (bItem.name === 'mobilePres') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    if (val !== null) {
                      val.forEach((n, i) => {
                        arr.push(Number(n.value));
                      });
                    }
                    v.componentsModel[rc]['phoneParams'].mobilePres = arr;
                    v.componentsModel[rc]['phoneParams'].checkbox3 = true;
                  }
                } else if (rc === 'order-service-A021') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['buyCostParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['buyCostParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['buyCostParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['buyCostParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['buyCostParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['buyCostParams'].checkbox2 = true;
                  } else if (bItem.name === 'currency') {
                    v.componentsModel[rc]['buyCostParams'].currency = bItem.value;
                  }
                } else if (rc === 'order-service-A022') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtNumParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtNumParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtNumParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtNumParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtNumParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtNumParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A023') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderProductParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderProductParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderProductParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderProductParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderProductParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderProductParams'].checkbox2 = true;
                  } else if (bItem.name === 'skus') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    if (val !== null) {
                      val.forEach((n, i) => {
                        arr.push(n.value);
                      });
                    }
                    v.componentsModel[rc]['orderProductParams'].skus = arr.join(',');
                  }
                } else if (rc === 'order-service-A028') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtBulkParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtBulkParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtBulkParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtBulkParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtBulkParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtBulkParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A049') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtBulkParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtBulkParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtBulkParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtBulkParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtBulkParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtBulkParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A026') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtWidthParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtWidthParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtWidthParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtWidthParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtWidthParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtWidthParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A027') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtHeightParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtHeightParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtHeightParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtHeightParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtHeightParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtHeightParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A025') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtLengthParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtLengthParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtLengthParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtLengthParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtLengthParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtLengthParams'].checkbox2 = true;
                  }
                } else if (rc === 'order-service-A033') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['listingParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['listingParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['listingParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['listingParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox2 = true;
                  } else if (bItem.name === 'currency') {
                    v.componentsModel[rc]['listingParams'].currency = bItem.value;
                  }
                } else if (rc === 'order-service-A024') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['orderPdtWeightParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['orderPdtWeightParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtWeightParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['orderPdtWeightParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['orderPdtWeightParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtWeightParams'].checkbox2 = true;
                  } else if (bItem.name === 'computeWeightFactor') {
                    v.componentsModel[rc]['orderPdtWeightParams'].computeWeightFactor = Number(bItem.value);
                    v.componentsModel[rc]['orderPdtWeightParams'].checkbox3 = true;
                  }
                } else if (rc === 'order-service-A029') {
                  let val = bItem.ruleItemParamValues;
                  let arr = [];
                  let pos = [];
                  if (val !== null) {
                    let productStatusJson = {}
                    this.newProductStatus.forEach(item => {
                      productStatusJson[item.value] = item;
                    })
                    val.forEach((n) => {
                      arr.push(Number(n.value));
                      if (productStatusJson[n.value]) {
                        pos.push(productStatusJson[n.value].label);
                      }
                    });
                  }
                  v.componentsModel[rc]['productStatus'] = arr;
                  v.showProductStatus = pos;
                } else if (rc === 'order-service-A030') {
                  if (bItem.name === 'beginType') {
                    v.componentsModel[rc]['listingParams'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'beginValue') {
                    v.componentsModel[rc]['listingParams'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['listingParams'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['listingParams'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox2 = true;
                  } else if (bItem.name === 'currency') {
                    v.componentsModel[rc]['listingParams'].currency = bItem.value;
                  }
                } else if (rc === 'order-service-A032') {
                  if (bItem.name === 'containsStr' && oItem.name === 'containsStr') {
                    for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                      if (c === 0) {
                        v.componentsModel[rc].containsStr = [];
                      }
                      let childItem = bItem.ruleItemParamValues[c];
                      v.componentsModel[rc].containsStr.push({
                        value: childItem.value
                      });
                    }
                  }
                } else if (rc === 'order-service-A015') {
                  if (bItem.name === 'streets' && oItem.name === 'streets') {
                    for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                      if (c === 0) {
                        v.componentsModel[rc].streets = [];
                      }
                      let childItem = bItem.ruleItemParamValues[c];
                      v.componentsModel[rc].streets.push({
                        value: childItem.value
                      });
                    }
                  }
                } else if (rc === 'order-service-A039') {
                  if (bItem.name === 'isBuyerInBlackList') {
                    v.componentsModel[rc].isBuyerInBlackList = bItem.ruleItemParamValues[0].value;
                  }
                } else {
                  if (rc === 'order-service-A016' || rc === 'order-service-A014') {
                    v.componentsModel[rc][bItem.name] = Number(bItem.value);
                  } else {
                    v.componentsModel[rc][bItem.name] = bItem.value;
                  }
                }
                obj.autoRuleParams.push(subObj);
              }
            }
            v.autoRuleItems.push(obj);// 插入已勾选的的内容，保存时用
            v.rulesModel.push(rc);// 插入右侧的状态
          }
        }
      }
    },
    setRulesGroup (data) { // 分组
      let v = this;
      return new Promise(resolve => {
        if (data.length && data[0].group === null) { // 没有分组
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (v.ruleType === 'smart') {
              data[i].uid = v.getRuleCode(item.id);
            } else if (v.ruleType === 'autoCompartment') {
              data[i].uid = v.getWareRuleCode(item.id);
            }
            if (i === data.length - 1) {
              v.rules = data;
              resolve(true);
            }
          }
        } else { // 有分组
          let obj = {};
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (v.ruleType === 'smart') {
              data[i].uid = v.getRuleCode(item.id);
            } else if (v.ruleType === 'autoCompartment') {
              data[i].uid = v.getWareRuleCode(item.id);
            }
            if (obj.hasOwnProperty(item.group)) {
              obj[item.group].push(item);
            } else {
              obj[item.group] = [item];
            }
          }
          let arr = [];
          for (let item in obj) {
            arr = arr.concat(obj[item]);
          }
          v.rules = arr;
          resolve(true);
        }
      });
    },
    changeValue (val, item) { // 下拉多选，如果选择全部，则干掉其他选项
      let v = this;
      let value = v.componentsModel[val][item];
      if (value.indexOf('all') >= 0) {
        v.componentsModel[val][item] = ['all'];
      }
    },
    handleSubmit () {
      let v = this;
      return new Promise((resolve, reject) => {
        if (v.actionParams.ruleName === '') {
          v.$Message.error('规则名不能为空');
          v.loading = false;
          reject(new Error('规则名不能为空'));
          return false;
        }
        if (!this.$common.isEmpty(this.actionParams.remark) && this.actionParams.remark.length > 200) {
          v.$Message.error('备注不能超过200字符长度');
          v.loading = false;
          reject(new Error('备注不能超过200字符长度'));
          return false;
        }
        let componentsModel = this.$common.copy(this.componentsModel);
        let arr = [];
        for (let item in v.componentsStatus) { // 扫componentsStatus 的key
          let subArr = [];// autoRuleParams
          let changeItem = v.getRuleCode(item);

          let sub = v.componentsStatus[changeItem];
          for (let subItem in sub) { // 扫componentsStatus 的key 里面对象的key,获取当前业务类型
            let child = sub[subItem];
            for (let u = 0; u < v.rulesModel.length; u++) { // 检查选定的已选条件
              let ruleItem = v.rulesModel[u];
              if (ruleItem === item) { // 勾选有效， 做值校验
                if (changeItem === 'order-service-A001' && componentsModel[changeItem]['platformIds'].length === 0) {
                  v.$Message.error('已选条件下订单来源指定平台不能为空'); // 已选条件下订单来源指定平台不能为空
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O002' && componentsModel[changeItem]['warehouseIds'].length === 0) {
                  v.$Message.error('已选条件下指定仓库不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A003' && v.shipmentTagModel.length === 0) {
                  v.$Message.error('已选条件下运输类型不能为空'); // '已选条件下运输类型不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A004' && componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下订单目的地指定国家不能为空'); // ('已选条件下订单目的地指定国家不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A034' && v.shopSkuModel === null) {
                  v.$Message.error('请选择店铺SKU规则开头或者结束'); // '请选择店铺SKU规则开头或者结束');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A034' && v.shopSkuModel !== null) {
                  if (v.shopSkuModel === 0 && v.shopSku.start === '') {
                    v.$Message.error('店铺SKU开头内容不能为空'); // '店铺SKU开头内容不能为空');
                    v.loading = false;
                    return false;
                  } else if (v.shopSkuModel === 1 && v.shopSku.end === '') {
                    v.$Message.error('店铺SKU结尾内容不能为空'); // '店铺SKU结尾内容不能为空');
                    v.loading = false;
                    return false;
                  }
                } else if (changeItem === 'order-service-A005' && componentsModel[changeItem]['states'] === '') {
                  v.$Message.error('已选条件下指定洲/省不能为空'); // '已选条件下指定洲/省不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A006' && componentsModel[changeItem]['cities'] === '') {
                  v.$Message.error('已选条件下订单收货地址城市不能为空'); // '已选条件下订单收货地址城市不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A009' && (componentsModel[changeItem]['productCategories'].length === 0 && componentsModel[changeItem]['skus'] === '' && componentsModel[changeItem]['productTags'].length === 0)) {
                  v.$Message.error('已选条件下订单产品分类指定SKU和商品标签不能都为空'); // '已选条件下订单产品分类指定SKU和商品标签不能都为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A043' && (componentsModel[changeItem]['skus'] === '')) {
                  v.$Message.error('已选条件下订单指定SKU不能都为空'); // '已选条件下订单指定SKU不能都为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A011' && (componentsModel[changeItem].productKeyword.length === 0 || componentsModel[changeItem].productKeyword[0].value === '')) {
                  v.$Message.error('已选条件下产品刊登标题所含关键字不能为空'); // '已选条件下产品刊登标题所含关键字不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A013' && (componentsModel[changeItem]['goodsCountry'] === '' || componentsModel[changeItem].goodsCity === '' || componentsModel[changeItem].goodsCity === null || componentsModel[changeItem]['goodsCountry'] === null)) {
                  v.$Message.error('已选条件下货品所在地所在国家和城市不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A029' && componentsModel[changeItem]['productStatus'].length === 0) {
                  v.$Message.error('已选条件下订单货品状态包含指定的商品状态不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A032' && (componentsModel[changeItem].containsStr.length === 0 || componentsModel[changeItem].containsStr[0].value === '')) {
                  v.$Message.error('已选条件下订单买家ID包含指定字符串不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A015' && (componentsModel[changeItem].streets.length === 0 || componentsModel[changeItem].streets[0].value === '')) {
                  v.$Message.error('已选条件下收货地址街道包含指定字符串不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A030' && ((componentsModel[changeItem].listingParams.currency === null || componentsModel[changeItem].listingParams.currency === '') || (!componentsModel[changeItem].listingParams.checkbox1 && !componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('已选条件下订单中Listing单价请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A033' && ((componentsModel[changeItem].listingParams.currency === null || componentsModel[changeItem].listingParams.currency === '') || (!componentsModel[changeItem].listingParams.checkbox1 && !componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('joom 商品总金额请指定范围'); // 'joom 商品总金额请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A028' && (!componentsModel[changeItem].orderPdtBulkParams.checkbox1 && !componentsModel[changeItem].orderPdtBulkParams.checkbox2)) {
                  v.$Message.error('已选条件下订单中订单货品体积请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A049' && (!componentsModel[changeItem].orderPdtBulkParams.checkbox1 && !componentsModel[changeItem].orderPdtBulkParams.checkbox2)) {
                  v.$Message.error('已选条件下订单中订单货品周长请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A023' && (!componentsModel[changeItem].orderProductParams.checkbox1 && !componentsModel[changeItem].orderProductParams.checkbox2)) {
                  v.$Message.error('已选条件下订单中订单货品请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A027' && (!componentsModel[changeItem].orderPdtHeightParams.checkbox1 && !componentsModel[changeItem].orderPdtHeightParams.checkbox2)) {
                  v.$Message.error('已选条件下订单货品高度请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A024' && (!componentsModel[changeItem].orderPdtWeightParams.checkbox1 && !componentsModel[changeItem].orderPdtWeightParams.checkbox2)) {
                  v.$Message.error('已选条件下订单订单重量请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A025' && (!componentsModel[changeItem].orderPdtLengthParams.checkbox1 && !componentsModel[changeItem].orderPdtLengthParams.checkbox2)) {
                  v.$Message.error('已选条件下订单订单长度请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A026' && (!componentsModel[changeItem].orderPdtWidthParams.checkbox1 && !componentsModel[changeItem].orderPdtWidthParams.checkbox2)) {
                  v.$Message.error('已选条件下订单订单宽度请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A022' && (!componentsModel[changeItem].orderPdtNumParams.checkbox1 && !componentsModel[changeItem].orderPdtNumParams.checkbox2)) {
                  v.$Message.error('已选条件下订单货品总数量请指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A017') {
                  if (componentsModel[changeItem].orderZipCodeParams.checkbox1 && this.$common.isEmpty(this.orderServiceA017CodeParams.beginStr)) {
                    v.$Message.error('已选条件下订单收货邮编请指定范围');
                    v.loading = false;
                    return false;
                  } else if (componentsModel[changeItem].orderZipCodeParams.checkbox2 && this.$common.isEmpty(this.orderServiceA017CodeParams.containsStr)) {
                    v.$Message.error('已选条件下订单收货邮编请指定范围');
                    v.loading = false;
                    return false;
                  } else if (!componentsModel[changeItem].orderZipCodeParams.checkbox1 && !componentsModel[changeItem].orderZipCodeParams.checkbox2) {
                    v.$Message.error('已选条件下订单收货邮编请指定范围');
                    v.loading = false;
                    return false;
                  }
                  const beginStr = this.$common.split(this.orderServiceA017CodeParams.beginStr, ['，', ',', '\n'], true);
                  componentsModel[changeItem].orderZipCodeParams.beginStr = beginStr.join(',');
                  const containsStr = this.$common.split(this.orderServiceA017CodeParams.containsStr, ['，', ',', '\n'], true);
                  componentsModel[changeItem].orderZipCodeParams.containsStr = containsStr.join(',');
                } else if (changeItem === 'order-service-A020') {
                  if ((!v.anomalousModalParams.checkbox1 || (v.anomalousModalParams.checkbox1 && (v.anomalousModalParams.nameSpaceLess === '' || v.anomalousModalParams.nameSpaceLess === null))) && (!v.anomalousModalParams.checkbox2 || (v.anomalousModalParams.checkbox2 && (v.anomalousModalParams.nameCharacterLess === '' || v.anomalousModalParams.nameCharacterLess === null))) && (!v.anomalousModalParams.checkbox3 || (v.anomalousModalParams.checkbox3 && (v.anomalousModalParams.addressCharacterLess === '' || v.anomalousModalParams.addressCharacterLess === null))) && (!v.anomalousModalParams.checkbox4 || (v.anomalousModalParams.checkbox4 && (v.anomalousModalParams.cityCharacterLess === '' || v.anomalousModalParams.cityCharacterLess === null))) && (!v.anomalousModalParams.checkbox5 || (v.anomalousModalParams.checkbox5 && (v.anomalousModalParams.stateCharacterLess === '' || v.anomalousModalParams.stateCharacterLess === null))) && (!v.anomalousModalParams.checkbox6 || (v.anomalousModalParams.checkbox6 && (v.anomalousModalParams.postCodeCharacterLess === '' || v.anomalousModalParams.postCodeCharacterLess === null))) && (!v.anomalousModalParams.checkbox7 || (v.anomalousModalParams.checkbox7 && (v.anomalousModalParams.phoneCharacterLess === '' || v.anomalousModalParams.phoneCharacterLess === null)))) {
                    v.$Message.error('已选条件下订单收件人姓名/地址存在指定异常');
                    v.loading = false;
                    return false;
                  }
                } else if (changeItem === 'order-service-A019') {
                  if ((!componentsModel[changeItem].phoneParams.checkbox1 || (componentsModel[changeItem].phoneParams.checkbox1 && (componentsModel[changeItem].phoneParams.mobileLength === '' || componentsModel[changeItem].phoneParams.mobileLength === null))) && (!componentsModel[changeItem].phoneParams.checkbox2 || (componentsModel[changeItem].phoneParams.checkbox2 && (componentsModel[changeItem].phoneParams.phoneLength === '' || componentsModel[changeItem].phoneParams.phoneLength === null))) && (!componentsModel[changeItem].phoneParams.checkbox3 || (componentsModel[changeItem].phoneParams.checkbox3 && (componentsModel[changeItem].phoneParams.mobilePres === '' || componentsModel[changeItem].phoneParams.mobilePres === null)))) {
                    v.$Message.error('已选条件下订单收件人电话要求');
                    v.loading = false;
                    return false;
                  }
                } else if (changeItem === 'order-service-A014' && (componentsModel[changeItem].selectType === null || componentsModel[changeItem].selectType === '')) {
                  v.$Message.error('已选条件下订单/交易/运输类型的关系指定条件');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A018' && (!componentsModel[changeItem].zipCodeParams.checkbox1 && !componentsModel[changeItem].zipCodeParams.checkbox2)) {
                  v.$Message.error('已选条件下订单收货邮编字符长度指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A016' && (componentsModel[changeItem].length === '' || componentsModel[changeItem].length === null)) {
                  v.$Message.error('已选条件下订单收货地址街道信息字符指定长度');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'order-service-A021' && ((componentsModel[changeItem].buyCostParams.currency === null && componentsModel[changeItem].buyCostParams.currency === '') || (!componentsModel[changeItem].buyCostParams.checkbox1 && !componentsModel[changeItem].buyCostParams.checkbox2))) {
                  v.$Message.error('已选条件下订买家支付的运费指定范围');
                  v.loading = false;
                  return false;
                }
                const coverKey = [
                  'order-service-A007', 'order-service-A003', 'order-service-A020', 'order-service-A034', 'order-service-A018', 'order-service-A016',
                  'order-service-A014', 'order-service-A022', 'order-service-A028', 'order-service-A026', 'order-service-A027', 'order-service-A025',
                  'order-service-A033', 'order-service-A024', 'order-service-A029', 'order-service-A031', 'order-service-A030', 'order-service-A021',
                  'order-service-A019', 'order-service-A017', 'order-service-A023', 'order-service-A049'
                ];
                const exclusive = [
                  'order-service-A013', 'order-service-A012', 'order-service-A011', 'order-service-A010', 'order-service-A006', 'order-service-A007',
                  'order-service-A005', 'order-service-A003', 'W004', 'order-service-A020', 'order-service-A034', 'order-service-A018',
                  'order-service-A016', 'order-service-A014', 'order-service-A022', 'order-service-A028', 'order-service-A026', 'order-service-A027',
                  'order-service-A025', 'order-service-A033', 'order-service-A024', 'order-service-A031', 'order-service-A032', 'order-service-A015',
                  'order-service-A030', 'order-service-A021', 'order-service-A019', 'order-service-A017', 'order-service-A023', 'order-service-A035',
                  'order-service-A041', 'order-service-A042', 'order-service-A036', 'order-service-A037', 'order-service-A038', 'order-service-A040',
                  'order-service-A044', 'order-service-A045', 'order-service-A046', 'order-service-A047', 'order-service-A048', 'order-service-A049'
                ];
                if (child || (componentsModel[changeItem][subItem] && componentsModel[changeItem][subItem].length > 0) || coverKey.includes(changeItem)) { // 这块代码虽然没BUG，但业务代码处理不太好，以后有时间要修改下 #001
                  if (!exclusive.includes(changeItem)) { // 根据业务类型和接口规则进行拼接处理
                    let childArr = [];
                    let subItemList = componentsModel[changeItem][subItem];
                    if (subItem !== 'buyerPostalCodes' && subItemList && subItemList.length > 0) {
                      if (subItem === 'skus') {
                        // subItemList = v.sepCommasFn(componentsModel[changeItem][subItem]);
                        if (v.$common.isUndefined(v[`${changeItem.replace(/-/g, '')}TXT`])) {
                          subItemList = v.sepCommasFn(componentsModel[changeItem][subItem]);
                        } else {
                          subItemList = v[`${changeItem.replace(/-/g, '')}TXT`].split(',');
                        }
                      }
                      for (let t = 0; t < subItemList.length; t++) {
                        childArr.push({
                          value: subItemList[t]
                        });
                      }
                      let obj = {
                        name: subItem,
                        type: 1,
                        autoRuleParamValues: childArr
                      };
                      subArr.push(obj);
                    }
                    // if (changeItem === 'order-service-A004' && subItem === 'buyerPostalCodes' && v.postcodeOne !== '') {
                    if (changeItem === 'order-service-A004' && subItem === 'buyerPostalCodes' && componentsModel['order-service-A004'].postalCodeType === 0) {
                      let postcodeOk = false;
                      v.postcodeArr.forEach(item => {
                        if ((item.postcode1 === '' && item.postcode2 === '') || (item.postcode1 !== '' && item.postcode2 !== '')) {
                          postcodeOk = true;
                        }
                      });
                      if (!postcodeOk) {
                        v.$Message.error('请将邮编段填写完整');
                        return false;
                      }
                      subArr.push({
                        name: 'postalCodeType',
                        type: 0,
                        value: componentsModel[changeItem].postalCodeType
                      });
                      let obj = {
                        name: 'buyerPostalCodes',
                        type: 1,
                        autoRuleParamValues: []
                      };
                      obj.autoRuleParamValues = v.postcodeArr.filter(item => {
                        let o = {};
                        let value = item.postcode1 + '-' + item.postcode2;
                        o.value = value === '-' ? null : value;
                        if (o.value) {
                          return o;
                        }
                      }).map(i => {
                        return { value: i.postcode1 + '-' + i.postcode2 };
                      });

                      if (obj.autoRuleParamValues.length > 0) {
                        subArr.push(obj);
                      }
                    } else if (changeItem === 'order-service-A004' && subItem === 'buyerPostalCodes' && componentsModel['order-service-A004'].postalCodeType === 1 && v.postcodeArea !== '') {
                      let arr = [];
                      let postcodeArea = v.postcodeArea.split(',');
                      subArr.push({
                        name: 'postalCodeType',
                        type: 0,
                        value: componentsModel[changeItem].postalCodeType
                      });
                      postcodeArea.forEach((n, i) => {
                        arr.push({
                          value: n
                        });
                      });
                      let obj = {
                        name: 'buyerPostalCodes',
                        type: 1,
                        autoRuleParamValues: arr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'order-service-A011' && componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem].value !== '') {
                    let arr = [];
                    subArr.push({
                      name: 'containsType',
                      type: 0,
                      value: componentsModel[changeItem].type
                    });
                    if (componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem][0].value !== '') {
                      for (let i = 0; i < componentsModel[changeItem][subItem].length; i++) {
                        let keyItem = componentsModel[changeItem][subItem][i].value;
                        if (keyItem !== '') {
                          arr.push({
                            value: keyItem
                          });
                        }
                      }
                      let obj = {
                        name: 'keys',
                        type: 1,
                        autoRuleParamValues: arr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'order-service-A003') {
                    let shippingArr = [];
                    for (let i = 0; i < v.shipmentCheckBoxModel.length; i++) {
                      let shipItem = v.shipmentCheckBoxModel[i];
                      let data = shipItem.split(':');
                      let obj = null;
                      if (data.length > 3) {
                        // 有站点
                        obj = {
                          'platformId': data[0],
                          'siteId': data[1],
                          'siteName': data[2],
                          'shipmentName': data[3],
                          'shipmentDesc': data[4]
                        };
                      } else {
                        obj = {
                          'platformId': data[0],
                          'siteId': null,
                          'siteName': null,
                          'shipmentName': data[1],
                          'shipmentDesc': data[2]
                        };
                      }
                      shippingArr.push({
                        value: JSON.stringify(obj)
                      });
                      if (i === v.shipmentCheckBoxModel.length - 1) {
                        subArr.push({
                          name: 'shipmentTypes',
                          type: 1,
                          autoRuleParamValues: shippingArr
                        });
                      }
                    }
                  } else if (changeItem === 'order-service-A007') {
                    let mtItem = v.amountRange;
                    let arr = [
                      {
                        value: 'usd,' + mtItem.usdFloor + ',' + mtItem.usdUpper
                      }, {
                        value: 'aud,' + mtItem.audFloor + ',' + mtItem.audUpper
                      }, {
                        value: 'eur,' + mtItem.eurFloor + ',' + mtItem.eurUpper
                      }, {
                        value: 'gbp,' + mtItem.gbpFloor + ',' + mtItem.gbpUpper
                      }
                    ];
                    subArr.push({
                      name: 'totalPrices',
                      type: 1,
                      autoRuleParamValues: arr
                    });
                  } else if (changeItem === 'W004' || changeItem === 'order-service-A034') {
                    if (v.shopSkuModel === 0) {
                      let obj = {
                        name: 'start',
                        type: 0,
                        value: v.shopSku.start
                      };
                      subArr.push(obj);
                    } else {
                      let obj = {
                        name: 'end',
                        type: 0,
                        value: v.shopSku.end
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'order-service-A020') {
                    let list = [];
                    if (componentsModel[changeItem][subItem].length) {
                      componentsModel[changeItem][subItem].forEach((n, i) => {
                        list.push({
                          name: n.name,
                          type: 0,
                          value: n.value
                        });
                      });
                    } else {
                      if (v.ruleItems) {
                        v.ruleItems.forEach((n, i) => {
                          if (n.ruleCode === 'order-service-A020') {
                            n.ruleItemParams.forEach((m, t) => {
                              list.push({
                                name: m.name,
                                type: 0,
                                value: m.value
                              });
                            });
                          }
                        });
                      }
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A017') {
                    let list = [];
                    let zip = componentsModel['order-service-A017'].orderZipCodeParams;
                    let arr1 = [];
                    let pos1 = [];
                    let arr2 = [];
                    let pos2 = [];
                    if (typeof zip.beginStr === 'string') {
                      pos1 = zip.beginStr.split(',');
                    } else {
                      pos1 = zip.beginStr;
                    }
                    if (pos1 != null && pos1.length > 0) {
                      pos1.forEach((n, i) => {
                        arr1.push({
                          value: n
                        });
                      });
                    }

                    if (typeof zip.containsStr === 'string') {
                      pos2 = zip.containsStr.split(',');
                    } else {
                      pos2 = zip.containsStr;
                    }

                    if (pos2 != null && pos2.length > 0) {
                      pos2.forEach((n, i) => {
                        arr2.push({
                          value: n
                        });
                      });
                    }

                    if (zip.checkbox1 && zip.checkbox2) {
                      list.push({
                        name: 'beginStr',
                        type: 1,
                        autoRuleParamValues: arr1
                      }, {
                        name: 'containsStr',
                        type: 1,
                        autoRuleParamValues: arr2
                      }, {
                        name: 'relevance',
                        type: 0,
                        value: zip.relevance
                      });
                    } else {
                      if (zip.checkbox1) {
                        list.push({
                          name: 'beginStr',
                          type: 1,
                          autoRuleParamValues: arr1
                        });
                      }
                      if (zip.checkbox2) {
                        list.push({
                          name: 'containsStr',
                          type: 1,
                          autoRuleParamValues: arr2
                        });
                      }
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A018') {
                    let list = [];
                    let zip = componentsModel['order-service-A018'].zipCodeParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'startType',
                        type: 0,
                        value: zip.startType
                      }, {
                        name: 'startValue',
                        type: 0,
                        value: zip.startValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A019') {
                    let list = [];
                    let zip = componentsModel['order-service-A019'].phoneParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'mobileLength',
                        type: 0,
                        value: zip.mobileLength
                      });
                      if (zip.checkbox2) {
                        list.push({
                          name: 'phonePreRelateType',
                          type: 0,
                          value: zip.phonePreRelateType
                        }, {
                          name: 'phoneLength',
                          type: 0,
                          value: zip.phoneLength
                        });
                      }
                      if (zip.checkbox3) {
                        let arr = [];
                        let pos = [];
                        if (typeof zip.mobilePres === 'string') {
                          pos = zip.mobilePres.split(',');
                        } else {
                          pos = zip.mobilePres;
                        }
                        if (pos.length) {
                          pos.forEach((n, i) => {
                            arr.push({
                              value: n
                            });
                          });
                        }
                        list.push({
                          name: 'mobilePreRelateType',
                          type: 0,
                          value: zip.mobilePreRelateType
                        }, {
                          name: 'mobilePreSlect',
                          type: 0,
                          value: zip.mobilePreSlect
                        }, {
                          name: 'mobilePres',
                          type: 1,
                          autoRuleParamValues: arr
                        });
                      }
                    } else {
                      if (zip.checkbox2) {
                        list.push({
                          name: 'phonePreRelateType',
                          type: 0,
                          value: zip.phonePreRelateType
                        }, {
                          name: 'phoneLength',
                          type: 0,
                          value: zip.phoneLength
                        });
                      }
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A022') {
                    let list = [];
                    let zip = componentsModel['order-service-A022'].orderPdtNumParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A028') {
                    let list = [];
                    let zip = componentsModel['order-service-A028'].orderPdtBulkParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A049') {
                    let list = [];
                    let zip = componentsModel['order-service-A049'].orderPdtBulkParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A026') {
                    let list = [];
                    let zip = componentsModel['order-service-A026'].orderPdtWidthParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A027') {
                    let list = [];
                    let zip = componentsModel['order-service-A027'].orderPdtHeightParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A025') {
                    let list = [];
                    let zip = componentsModel['order-service-A025'].orderPdtLengthParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A024') {
                    let list = [];
                    let zip = componentsModel['order-service-A024'].orderPdtWeightParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    if (zip.checkbox3) {
                      list.push({
                        name: 'computeWeightFactor',
                        type: 0,
                        value: zip.computeWeightFactor
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A032' && componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem].value !== '') {
                    let arr = [];
                    if (componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem][0].value !== '') {
                      for (let i = 0; i < componentsModel[changeItem][subItem].length; i++) {
                        let keyItem = componentsModel[changeItem][subItem][i].value;
                        if (keyItem !== '') {
                          arr.push({
                            value: keyItem
                          });
                        }
                      }
                      let obj = {
                        name: 'containsStr',
                        type: 1,
                        autoRuleParamValues: arr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'order-service-A015' && componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem].value !== '') {
                    let arr = [];
                    if (componentsModel[changeItem][subItem].length > 0 && componentsModel[changeItem][subItem][0].value !== '') {
                      for (let i = 0; i < componentsModel[changeItem][subItem].length; i++) {
                        let keyItem = componentsModel[changeItem][subItem][i].value;
                        if (keyItem !== '') {
                          arr.push({
                            value: keyItem
                          });
                        }
                      }
                      let obj = {
                        name: 'streets',
                        type: 1,
                        autoRuleParamValues: arr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'order-service-A021') {
                    let list = [];
                    let zip = componentsModel['order-service-A021'].buyCostParams;
                    list.push({
                      name: 'currency',
                      type: 0,
                      value: zip.currency
                    });
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A023') {
                    let list = [];
                    let zip = componentsModel['order-service-A023'].orderProductParams;
                    if (zip.skus) {
                      let arr = [];
                      let pos = [];
                      if (typeof zip.skus === 'string') {
                        pos = v.sepCommasFn(zip.skus);
                      } else {
                        pos = zip.skus;
                      }
                      if (pos.length) {
                        pos.forEach((n, i) => {
                          arr.push({
                            value: n
                          });
                        });
                      }
                      list.push({
                        name: 'skus',
                        type: 1,
                        autoRuleParamValues: arr
                      });
                    }
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A030') {
                    let list = [];
                    let zip = componentsModel['order-service-A030'].listingParams;
                    list.push({
                      name: 'currency',
                      type: 0,
                      value: zip.currency
                    });
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'order-service-A033') {
                    let list = [];
                    let zip = componentsModel['order-service-A033'].listingParams;
                    list.push({
                      name: 'currency',
                      type: 0,
                      value: zip.currency
                    });
                    if (zip.checkbox1) {
                      list.push({
                        name: 'beginType',
                        type: 0,
                        value: zip.beginType
                      }, {
                        name: 'beginValue',
                        type: 0,
                        value: zip.beginValue
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: zip.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: zip.endValue
                      });
                    }
                    subArr = list;
                  } else {
                    // order-service-A016  order-service-A014  order-service-A031
                    let obj = {
                      name: subItem,
                      type: 0,
                      value: componentsModel[changeItem][subItem]
                    };
                    if (componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  }
                }
              }
            }
          }
          if (subArr.length > 0) { // 如果有值， 组成数据
            if (v.ruleType === 'autoCompartment') {
              item = v.getWareRuleCode(item, true);
            }
            let itemObj = {
              ruleCode: item,
              autoRuleParams: subArr
            };
            arr.push(itemObj);
          }
          /* if ((changeItem === 'order-service-A020' && status) || (changeItem === 'order-service-A020' && v.rulesModel.length === 0)) {
           resolve([true, arr]);
           } */
        }
        resolve([true, arr]);
      });
    },
    smartSave () {
      let v = this;
      v.loading = true;
      v.handleSubmit().then(result => {
        if (result[0]) {
          let obj = {
            autoRuleId: v.autoRuleId,
            name: v.actionParams.ruleName,
            autoRuleItems: result[1],
            status: v.actionParams.status,
            businessId: v.ruleParmas.businessId
          };
          if (!v.actionParams.type) {
            if (v.desigMethodActionBoList.length === 0) {
              v.$Message.error('请添加物流方式');
              v.loading = false;
              return false;
            }
          } else {
            if (!v.actionParams.timeSelected && !v.actionParams.tracknumberSelected) {
              v.$Message.error('时效和运单号请至少选择一个');
              v.loading = false;
              return false;
            }
          }
          let value = {};
          if (!v.actionParams.type) { // 0指定物流  1条件物流
            value = {
              type: v.actionParams.type,
              desigMethodActionBoList: v.desigMethodActionBoList
            };
          } else {
            value = {
              type: v.actionParams.type,
              timeSelected: v.actionParams.timeSelected ? 1 : 0,
              maxSelectedValue: v.actionParams.maxSelectedValue,
              timeTracknumberType: v.actionParams.timeTracknumberType,
              tracknumberSelected: v.actionParams.tracknumberSelected ? 1 : 0,
              tracknumberSelectedValue: v.actionParams.tracknumberSelectedValue
            };
          }
          obj.autoRuleActions = [
            {
              type: 'assignCarrier',
              value: JSON.stringify(value)
            }
          ];
          let postType = 'put';
          if (v.ruleParmas.type === 1) {
            postType = 'post';
          }
          obj.remark = v.actionParams.remark;
          v.axios[postType](api.add_orderCarrierRule, JSON.stringify(obj)).then(response => {
            v.loading = false;
            if (response.data.code === 0) {
              v.$Message.success('保存成功');
              this.closeRuleModal(1);
            }
          });
        }
      });
    },
    autoSave () {
      let v = this;
      v.handleSubmit().then(result => {
        if (result[0]) {
          let url = v.type === 'audit' ? api.set_orderAutoRule : api.set_warehouseAutoRule;
          let postType = 'put';
          let obj;
          let autoRuleItems;
          if (v.type === 'warehose') {
            // ruleParmas.editType
            if (v.actionParams.type === 0) {
              // 选择指定仓库
              if (v.actionParams.warehouseIds === '' || v.actionParams.warehouseIds === null) {
                v.$Message.error('请选择仓库');
                return;
              }

              autoRuleItems = {
                type: 0,
                warehouseIds: v.actionParams.warehouseIds,
                matchOtherRulesSelected: v.actionParams.matchOtherRulesSelected ? 1 : 0
              };
            } else if (v.actionParams.type === 1) {
              // 选择指定仓库中距离最近的
              // actionParams.warehouseIdList
              if (v.listSortDate.length === 0) {
                v.$Message.error('请选择仓库');
                return;
              }
              autoRuleItems = {
                type: 1,
                warehouseIds: v.listSortDate.map(i => {
                  return i.warehouseId;
                }).join(','),
                matchOtherRulesSelected: v.actionParams.matchOtherRulesSelected ? 1 : 0,
                matchOtherRulesSelected2: v.actionParams.matchOtherRulesSelected2 ? 1 : 0,
                onlyDistriHaveStockSelected: v.actionParams.onlyDistriHaveStockSelected ? 1 : 0
              };
            }
            obj = {
              autoRuleId: v.autoRuleId,
              autoRuleActions: [
                {
                  'type': 'assignWarehouse',
                  'value': JSON.stringify(autoRuleItems)
                }
              ],
              name: v.actionParams.ruleName,
              autoRuleItems: result[1],
              status: v.actionParams.status
            };
            if (v.ruleParmas.editType === 'add' || v.ruleParmas.editType === 'copy') {
              postType = 'post';
            }
          } else {
            obj = {
              autoRuleId: v.autoRuleId,
              name: v.actionParams.ruleName,
              autoRuleItems: result[1],
              status: v.actionParams.status
            };
            if (v.ruleParmas.type !== 0) {
              if (v.actionParams.isSupended === 0 && v.actionParams.isRemind === 0) {
                v.$Message.error('截留订单和发货提醒至少有一个要启用');
                v.loading = false;
                return false;
              }
              if (v.actionParams.isSupended === 1 && (v.actionParams.supendedOrderReason === null || v.actionParams.supendedOrderReason === '')) {
                v.$Message.error('截留原因不能为空');
                v.loading = false;
                return false;
              }
              if (v.actionParams.isRemind === 1 && (v.actionParams.shipmentRemindingReason === null || v.actionParams.shipmentRemindingReason === '')) {
                v.$Message.error('发货提醒不能为空');
                v.loading = false;
                return false;
              }
              obj.autoRuleActions = [
                {
                  type: 'supended',
                  value: v.actionParams.isSupended
                }, {
                  type: 'shipmentReminding',
                  value: v.actionParams.isRemind
                }, {
                  type: 'shipmentRemindingReason',
                  value: v.actionParams.shipmentRemindingReason
                }, {
                  type: 'supendedOrderReason',
                  value: v.actionParams.supendedOrderReason
                }
              ];
            } else {
              let val = {
                type: v.actionParams.type,
                warehouseIds: v.actionParams.warehouseIds,
                matchOtherRulesSelected: v.actionParams.matchOtherRulesSelected ? 1 : 0
              };
              obj.autoRuleActions = [
                {
                  type: 'assignWarehouse',
                  value: JSON.stringify(val)
                }
              ];
            }

            if (v.ruleParmas.type === 1) {
              postType = 'post';
            }
          }
          v.loading = true;
          obj.remark = v.actionParams.remark;
          v.axios[postType](url, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('保存成功');
              v.loading = false;
              this.closeRuleModal(1);
            }
          }).catch(() => {
            v.loading = false;
          });
        }
      });
    },
    saveButton () {
      let v = this;
      if (v.ruleType === 'smart') {
        v.smartSave();
      } else if (v.ruleType === 'autoCompartment') {
        v.autoSave();
      }
    },
    closeRuleModal (type) {
      this.componentsModel = this.$common.copy(this.oldComponentsModel);
      this.componentsStatus = this.$common.copy(this.oldComponentsStatus);
      this.$nextTick(() => {
        this.$emit('closeModal', type);
      });
    },
    handleAdd () {
      this.index++;
      this.componentsModel['order-service-A011'].productKeyword.push({
        value: ''
      });
    },
    orderStrAdd () {
      this.index++;
      this.componentsModel['order-service-A032'].containsStr.push({
        value: ''
      });
    },
    streetsAdd () {
      this.index++;
      this.componentsModel['order-service-A015'].streets.push({
        value: ''
      });
    },
    // 金额转换的处理
    numberChange (val, key) {
      const floor = `${key}Floor`;
      const upper = `${key}Upper`;
      if (this.$common.isUndefined(this.amountRange[upper])) {
        this.$set(this.amountRange, upper, val);
        return;
      }
      if (this.$common.isEmpty(this.amountRange[upper]) || this.amountRange[floor] > this.amountRange[upper]) {
        this.amountRange[upper] = val;
      }
    },
    // 失去焦点时
    numberBlur (val, key) {
      const floor = `${key}Floor`;
      const upper = `${key}Upper`;
      if (this.$common.isEmpty(this.amountRange[upper])) {
        this.amountRange[upper] = this.$common.isEmpty(this.amountRange[floor]) ? 0 : this.amountRange[floor];
        return;
      }
      if (this.amountRange[floor] > this.amountRange[upper]) {
        this.amountRange[upper] = this.amountRange[floor];
      }
    },
    handleRemove (index) {
      this.componentsModel['order-service-A011'].productKeyword.splice(index, 1);
    },
    orderStrRemove (index) {
      this.componentsModel['order-service-A032'].containsStr.splice(index, 1);
    },
    streetsRemove (index) {
      this.componentsModel['order-service-A015'].streets.splice(index, 1);
    },
    getProductCategory () { // 获取商品分类
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_productCategory, { hiddenError: true }).then(response => {
          if (response.data.code === 0) {
            v.productCategoryList = response.data.datas;
            let productCategoryTree = v.getProductCategoryTree(response.data.datas, null);
            v.$set(v.productCategoryTree[0], 'children', []);
            v.$nextTick(function () {
              v.$set(v.productCategoryTree[0], 'children', productCategoryTree);
            });
            resolve(true);
          }
        });
      });
    },
    getProductTags () {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_label).then(response => {
          if (response.data.code === 0) {
            v.productTagList = response.data.datas;
            resolve(true);
          }
        });
      });
    },
    getProductCategoryName (idArr) {
      let v = this;
      let arr = [];
      return new Promise(resolve => {
        if (!idArr || idArr.length === 0) {
          return false;
        }
        v.getProductCategory().then(result => {
          if (result) {
            v.productCategoryList.forEach((n, i) => {
              idArr.forEach((m, t) => {
                if (m === n.productCategoryId) {
                  arr.push(n.cnName);
                }
              });
            });
            v.productCategoryListName = arr.toString();
            resolve(v.productCategoryListName);
          }
        });
      });
    },
    openTree () {
      this.isChangeTreecountryCodes = true;
    },
    closeTree () {
      this.isChangeTreecountryCodes = false;
    },
    getTreeData (val) {
      const allText = Object.values(this.countryJson).map(m => m.title);
      const otherText = this.textareaCountryCodes.filter(t => !allText.includes(t));
      let treeVal = [];
      let treeText = [];

      if (val.length === 0) {
        this.textareaCountryCodes = otherText;
        this.componentsModel['order-service-A004'].countryCodes = treeVal;
        return;
      }
      const handTree = (arr) => {
        arr.forEach(node => {
          if (!this.$common.isEmpty(node.zoneCode)) {
            treeVal.push(node.zoneCode);
          };
          if (node.children && node.children.length > 0) {
            handTree(node.children);
          } else {
            treeText.push(node.title);
          }
        })
      }
      val.forEach(item => {
        if (Object.keys(this.countryJson).includes(item)) {
          handTree([this.countryJson[item]]);
        }
      });

      this.textareaCountryCodes = [...otherText, ...treeText];
      this.componentsModel['order-service-A004'].countryCodes = treeVal;
    },
    getTree1Data (val) {
      // let v = this;
      // let nodesArr = v.$refs['treeDataRef1'].getCheckedNodes();
      // let arr = [];
      // nodesArr.forEach((n, i) => {
      //   if (n.hasOwnProperty('productCategoryId')) {
      //     arr.push(n.productCategoryId);
      //   }
      // });
      // v.componentsModel['order-service-A009'].productCategories = arr;

      let treeVal = [];
      if (val.length === 0) {
        this.componentsModel['order-service-A009'].productCategories = treeVal;
        return;
      }
      const handTree = (arr) => {
        arr.forEach(node => {
          node.productCategoryId !== 'all' && treeVal.push(node.productCategoryId);
          if (node.children && node.children.length > 0) {
            handTree(node.children);
          }
        })
      }
      val.forEach(item => {
        if (Object.keys(this.country1Json).includes(item)) {
          handTree([this.country1Json[item]]);
        }
      });
      this.componentsModel['order-service-A009'].productCategories = treeVal;
    },
    getCommonCountryName (selectArr) { // 获取对应国家名字
      let v = this;
      if (!selectArr || selectArr.length === 0) return false;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTreeName(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));
              makeTreeName(data);
            }
          });
        }

        function makeTreeName (data) {
          let arr = [];
          data.forEach((n, i) => {
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k.indexOf('.') > 0) {
                if (n.zoneCode === k.split('.')[0]) {
                  if (n.countries && n.countries.length > 0) {
                    n.countries.forEach((g, l) => {
                      if (k.split('.')[1] === g.twoCode) {
                        arr.push(g.cnName);
                      }
                    });
                  }
                }
              } else {
                if (k === n.zoneCode) {
                  arr.push(n.zoneCnName);
                }
              }
            });
          });
          v.countryCodesName = arr.toString();
        }
      });
    },
    validCategoryIdMt (selectId) {
      let v = this;
      // 这里是为了处理原本A父类有2个子类 全选，后面A父类添加了一个子类但是因为父Id传过去了 全选问题
      let arr = v.productCategoryTree[0].children;

      function makeTree (a) {
        a.forEach((i) => {
          v.$set(i, '_setChecked', false);
          if (selectId) {
            selectId.forEach(j => {
              if (i.productCategoryId === j) {
                v.$set(i, '_setChecked', true);
              }
            });
          }
          if (i.children) {
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
    },
    setTreeDate (selectId) {
      let v = this;
      let arr = v.productCategoryTree[0].children;
      let item = [];

      function makeTree (a) {
        a.forEach((i) => {
          v.$set(i, 'checked', false);
          if (selectId) {
            selectId.forEach(j => {
              if (i.productCategoryId === j) {
                if (i.children) {
                  /* if (i.children.length === i.children.filter(i => i._setChecked).length) {
                   v.$set(i, 'checked', true);
                   if (!i.pisChecked) {
                   item.push(i);
                   }
                   } */
                } else {
                  v.$set(i, 'checked', true);
                  if (!i.pisChecked) {
                    item.push(i);
                  }
                }
              }
            });
          }
          if (i.children) {
            i.children.forEach(j => {
              j.pisChecked = i.checked;
            });
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
      v.$nextTick(() => {
        v.productCategoryIdList = item;
      });
    },
    getCommonCountry (selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
        const makeTree = (data) => {
          if (!selectArr) selectArr = [];
          let arr = [
            {
              title: '全部',
              check: false,
              zoneCode: 'all',
              expand: true
            }
          ];
          // 默认选择值
          v.countryCodes = selectArr.map(val => val.value);

          data.length > 0 && v.$set(arr[0], 'children', []);
          data.forEach((n, i) => {
            let checked = false;
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k === n.zoneCode) {
                checked = true;
              }
            });
            let obj = {
              title: n.zoneCnName,
              expand: false,
              checked: checked,
              zoneCode: n.zoneCode
            };
            if (n.countries.length > 1) {
              v.$set(obj, 'children', []);
              n.countries.forEach((m, t) => {
                let checked = false;
                selectArr.forEach((k, g) => {
                  k = k.value;
                  if (k.indexOf('.') > 0) {
                    if (m.hasOwnProperty('twoCode') && k.split('.')[1] === m.twoCode) {
                      checked = true;
                    }
                  }
                });
                let subObj = {
                  title: m.cnName,
                  expand: false,
                  checked: checked,
                  zoneCode: n.zoneCode + '.' + m.twoCode
                };
                obj.children.push(subObj);
                v.$set(v.countryJson, subObj.zoneCode, subObj);
              });
            } else if (n.countries.length === 1) {
              n.countries.forEach(i => {
                selectArr.forEach(j => {
                  if (i.zoneCode + '.' + i.zoneCode === j.value) {
                    obj.checked = true;
                  }
                });
              });
              obj.zoneCode = n.zoneCode + '.' + n.countries[0].twoCode;
            }
            v.$set(v.countryJson, obj.zoneCode, obj);
            arr[0].children.push(obj);
          });
          v.$nextTick(function () {
            v.countryData = arr;
            v.$set(v.countryJson, 'all', arr[0]);
            resolve(true);
          });
        }
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTree(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));
              makeTree(data);
            }
          });
        }
      });
    },
    getPostCodeType (value) {
      let v = this;
      v.postcodeOne = '';
      v.postcodeTwo = '';
      v.postcodeArea = '';
      v.postcodeArr = [
        {
          postcode1: '',
          postcode2: ''
        }
      ];
    }, // 增加邮编
    addPostcodeFn () {
      let canAdd = true;
      this.postcodeArr.forEach(item => {
        if (item.postcode1 === '' || item.postcode2 === '') {
          canAdd = false;
        }
      });
      if (!canAdd) {
        this.$Message.error('请将邮编段填写完整');
        return false;
      }
      let obj = {
        postcode1: '',
        postcode2: ''
      };
      this.postcodeArr.push(obj);
    }, // 删除邮编
    deletePostcodeFn (index) {
      this.postcodeArr.splice(index, 1);
    },
    anomalousOk () { // 选择指定异常确认
      let v = this;
      let pos = [];
      if (v.anomalousModalParams.checkbox1) {
        pos.push({
          name: 'nameSpaceLess',
          value: v.anomalousModalParams.nameSpaceLess
        });
      }
      if (v.anomalousModalParams.checkbox2) {
        pos.push({
          name: 'nameCharacterLess',
          value: v.anomalousModalParams.nameCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox3) {
        pos.push({
          name: 'addressCharacterLess',
          value: v.anomalousModalParams.addressCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox4) {
        pos.push({
          name: 'cityCharacterLess',
          value: v.anomalousModalParams.cityCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox5) {
        pos.push({
          name: 'stateCharacterLess',
          value: v.anomalousModalParams.stateCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox6) {
        pos.push({
          name: 'postCodeCharacterLess',
          value: v.anomalousModalParams.postCodeCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox7) {
        pos.push({
          name: 'phoneCharacterLess',
          value: v.anomalousModalParams.phoneCharacterLess
        });
      }
      v.componentsModel['order-service-A020'].anomalousList = pos;
    },
    anomalousCancel () { // 选择指定异常取消
      let v = this;
      // 新增关闭弹框时，清空数据
      if (v.ruleParmas.type) {
        v.anomalousModalParams = {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          checkbox4: false,
          checkbox5: false,
          checkbox6: false,
          checkbox7: false,
          nameSpaceLess: null,
          nameCharacterLess: null,
          addressCharacterLess: null,
          cityCharacterLess: null,
          stateCharacterLess: null,
          postCodeCharacterLess: null,
          phoneCharacterLess: null
        };
      }
      v.anomalousModal = false;
    },
    changeCarrier () { // 物流商选择的值改变时，清空物流渠道的值
      let v = this;
      v.shippingMethodList = [];
      v.actionParams.shippingMethodId = [];
    },
    getShippingMethodList (val) { // 获取物流渠道数据
      let v = this;
      if (val) {
        if (v.actionParams.carrierId) {
          v.axios.get(api.get_enableShippingMethods + '?carrierId=' + v.actionParams.carrierId + '&warehouseId=' + v.ruleParmas.businessId).then(response => {
            let data = response.data.datas;
            let pos = [];
            data.forEach((n, i) => {
              pos.push({
                value: n.shippingMethodId,
                label: n.carrierShippingMethodName
              });
            });
            v.shippingMethodList = pos;
          });
        } else {
          v.$Message.error('请先选择物流商');
        }
      }
    },
    getWarehouseList () { // 获取开启权重的仓库列表
      this.axios.get(api.wmsService + api.query_warehouse + '?enableAreaWeight=1').then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach(item => {
              this.$set(this.warehouseJson, item.warehouseId, item);
            })
            this.warehouseList = data;
          }
        }
      });
    },
    changeData (val) {
      let arr = [];
      if (val.length > 0) {
        val.forEach(i => {
          this.warehouseList.forEach(j => {
            if (i === j.warehouseId) {
              arr.push(j);
            }
          });
        });
      }
      this.listData = arr;
      this.listSortDate = this.deepCopy(arr);
      let el = this.$refs.dragable1.$children[1].$el.children[1];
      Sortable.create(el, {
        onEnd: this.endFunc
      });
    },
    // 仓库改变
    warehouseChange (val) {
      this.$nextTick(() => {
        // const removeValKey = ['cne', 'nf'];
        const removeValKey = [];
        if (this.$common.isEmpty(removeValKey)) return;
        const list = this.looKsettings ? this.allStoreJson : this.storeJson;
        if (this.$common.isEmpty(list[val]) || !removeValKey.includes(list[val].warehouseOverseaType)) {
          this.disabledMatch = false;
          this.$set(this.actionParams, 'matchOtherRulesSelected', this.oldMatchOtherRulesSelected);
        } else {
          const oldSelected = this.actionParams.matchOtherRulesSelected;
          this.$set(this.actionParams, 'matchOtherRulesSelected', false);
          this.disabledMatch = true;
          this.$nextTick(() => {
            this.oldMatchOtherRulesSelected = oldSelected;
          })
        }
      })
    }
  },
  mounted () {
    let v = this;
    v.$watch(function () {
      return v.componentsModel['order-service-A001'].platformIds;
    }, function (n, o) {
      if (JSON.stringify(n) !== JSON.stringify(o)) {
        // v.componentsModel['order-service-A001'].siteIds = [];
        // v.componentsModel['order-service-A001'].saleAccountIds = [];
        v.sitesList = [];
        v.$nextTick(function () {
          if (v.shipmentPlatformList.length > 0) {
            v.getShimentSites(n);
          }
        });
      }
    }, {
      immediate: true,
      deep: true
    });
  },
  computed: {
    // 文本
    orderserviceA009TXT () {
      if (this.$common.isEmpty(this.componentsModel['order-service-A009'])) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A009'].skus)) return '';
      let arr = [];
      let nTxt = '';
      (this.$common.split(this.componentsModel['order-service-A009'].skus, ['\n', '，', ','])).forEach(txt => {
        nTxt = txt.trim();
        if (!this.$common.isEmpty(nTxt) && !arr.includes(nTxt)) {
          arr.push(nTxt);
        }
      });
      return arr.join(',');
    },
    // 文本
    orderserviceA043TXT () {
      if (this.$common.isEmpty(this.componentsModel['order-service-A043'])) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A043'].skus)) return '';
      let arr = [];
      let nTxt = '';
      (this.$common.split(this.componentsModel['order-service-A043'].skus, ['\n', '，', ','])).forEach(txt => {
        nTxt = txt.trim();
        if (!this.$common.isEmpty(nTxt) && !arr.includes(nTxt)) {
          arr.push(nTxt);
        }
      });
      return arr.join(',');
    },
    orderZipCodeParamsBeginStr () {
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'])) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'].orderZipCodeParams)) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'].orderZipCodeParams.beginStr)) return '';
      if (this.$common.isArray(this.componentsModel['order-service-A017'].orderZipCodeParams.beginStr)) {
        return this.componentsModel['order-service-A017'].orderZipCodeParams.beginStr.join('，');
      }
      return this.componentsModel['order-service-A017'].orderZipCodeParams.beginStr;
    },
    orderZipCodeParamsContainsStr () {
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'])) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'].orderZipCodeParams)) return '';
      if (this.$common.isEmpty(this.componentsModel['order-service-A017'].orderZipCodeParams.containsStr)) return '';
      if (this.$common.isArray(this.componentsModel['order-service-A017'].orderZipCodeParams.containsStr)) {
        return this.componentsModel['order-service-A017'].orderZipCodeParams.containsStr.join('，');
      }
      return this.componentsModel['order-service-A017'].orderZipCodeParams.containsStr;
    },
    // 仓库类型
    newWarehouseType () {
      const info = this.storeList.find(i => i.warehouseId === this.selectWareID);
      if (this.$common.isEmpty(info)) return 0;
      return info.warehouseType;
    }
    /* hasShipId () {
     if (this.desigMethodActionBoList.length > 0 && this.activeShippingMethodData) {
     return  this.desigMethodActionBoList.some(i => {
     if (i.shippingMethodId === this.activeShippingMethodData.shippingMethodId) {
     return true;
     }
     });
     } else {
     return false
     }
     } */
  }
};
</script>
<style lang="less" scoped>
.form-item-range{
  :deep(.ivu-form-item-content){
    display: flex;
    .ivu-input-number-handler-wrap{
      display: none;
    }
    .ivu-input-number{
      flex: 100;
      max-width: 150px;
    }
  }
}
.warehouse-box {
  padding: 20px 10px 0px 10px;
}
.cpd {
  padding-left: 10px;
}
.modalItemContent{
  padding: 10px;
}

.rulesRightHeight,.normalPaddingRight {
  height: 615px;
  overflow: auto;
  .modalItemContent{
    height: calc(100% - 32px);
    overflow: auto;
  }
}

.groupTitle {
  font-weight: bold;
}

.itemPaddingRight {
  margin-right: 5px;
  word-break: break-all;
}

.textMarginTop {
  margin-top: 7px;
}

.saveButton {
  margin-right: 18px;
}

.keywordString .ivu-form-item {
  margin-bottom: 12px;
}

.countryCodesName {
  max-width: 300px;
}

.checkboxContainer {
  min-height: 30px;
  padding: 10px;
  max-height: 300px;
  overflow: auto;
}

.breakWord {
  white-space: normal;
  .ivu-tag{
    :deep(.ivu-icon-ios-close){
      color: initial !important;
    }
  }
}

.shopSku {
  padding: 10px 0;
}

.pricePrangeLeft {
  margin: 5px;
}

.priceRangeCheck {
  margin: 5px;
}

.show-desig {
  cursor: pointer;
}

.show-desig:hover {
  text-decoration: underline;
}

.ship-card-box .offset-1:nth-child(2n) {
  padding-left: 20px;
}
.tag-close-style{
  :deep(.ivu-icon-ios-close){
    color: #666 !important;
  }
}
</style>
<style lang="less">
.uniformlyspacedPadding .ivu-treeSelect-showCheckbox .ivu-tag {
  position: relative;
  max-width: 99%;
}

.uniformlyspacedPadding .ivu-tag-text {
  display: block;
  margin-right: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uniformlyspacedPadding .ivu-tag .ivu-icon-ios-close {
  display: block;
  position: absolute;
  right: 4px;
  top: 4px;
}
.country-codes-calss{
  .vue-treeselect__x-container{
    display: none;
  }
}

</style>
