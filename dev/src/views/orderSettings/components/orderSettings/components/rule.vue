<template >
  <div class="rulePage">
    <Spin v-if="pageLoading" fix></Spin>
    <Form :disabled="looKsettings" class="rule-page-form">
      <Row :gutter="10">
        <Col :span="15">
        <div class="normalPaddingRight normalTop">
          <div class="modalItem">
            <div class="modalItemHeader">
              <div>已选条件</div>
            </div>
            <div class="modalItemContent">
              <template>
                <!-- 订单来源 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O001')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O001'].platformIds }">订单来源为</span> <span
                    class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O001'].platformIds"
                    @click="addItem('platformIds', 'O001')">
                    {{ source.platformIds.length > 0 ? source.platformIds.toString() : '指定平台' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O001'].platformIds && platform.length > 0"
                    v-model="componentsModel['O001'].platformIds" multiple style="width: 100px"
                    @on-change="changeValue('O001', 'platformIds')">
                    <Option v-for="item in shipmentPlatformList" :value="item.platformId" :key="item.platformId">{{
                      item.name
                    }}</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O001'].platformIds }">
                    并且
                  </span>
                  <span class="blueColor itemPaddingRight cursor"
                    :class="{ textMarginTop: componentsStatus['O001'].platformIds }"
                    @click="addItem('siteIds', 'O001', 'platformIds')" v-if="!componentsStatus['O001'].siteIds">
                    {{ source.siteIds.length > 0 ? source.siteIds.toString() : '指定站点' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O001'].siteIds" style="width: 160px"
                    v-model="componentsModel['O001'].siteIds" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in sitesList" :key="index" :value="item.siteId" :v="item.cnName">{{
                      item.cnName
                    }}</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O001'].platformIds }">并且为</span>
                  <span class="blueColor itemPaddingRight cursor"
                    :class="{ textMarginTop: componentsStatus['O001'].platformIds }"
                    v-if="!componentsStatus['O001'].saleAccountIds"
                    @click="addItem('saleAccountIds', 'O001', 'saleAccountIds')">
                    {{ source.saleAccountIds.length > 0 ? source.saleAccountIds.toString() : '指定帐号' }}
                  </span>
                  <dytStoreSelect
                    style="width: 220px"
                    v-model="componentsModel['O001'].saleAccountIds"
                    :option-data="platformAccountList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                    v-if="componentsStatus['O001'].saleAccountIds"
                  />
                </div>
                <!-- 订单收件人姓名/地址存在 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O019')) >= 0">
                  <span class="itemPaddingRight">订单收件人姓名/地址存在</span> <span class="blueColor itemPaddingRight cursor"
                    @click="showAbnormal">
                    指定异常
                  </span>
                </div>
                <!-- 发货仓库 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O002')) >= 0">
                  <span class="itemPaddingRight">发货仓库为</span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O002'].warehouseIds"
                    @click="addItem('warehouseIds', 'O002')">
                    {{ componentsModel['O002'].warehouseIds.length > 0 || warehouseIdsName.length ?
                      warehouseIdsName.toString() : '指定仓库'
                    }}
                  </span>
                  <dyt-select v-if="componentsStatus['O002'].warehouseIds" v-model="componentsModel['O002'].warehouseIds"
                    multiple style="width: 100px">
                    <Option v-for="item in storeList" :value="item.warehouseId" :key="item.warehouseId"> {{
                      item.warehouseName
                    }}</Option>
                  </dyt-select>
                </div>
                <!-- 买家选择的运输类型 -->
                <div class="uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O003')) >= 0">
                  <span class="itemPaddingRight">买家选择的运输类型为</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('shipmentTypes', 'O003')" transfer width="700" placement="right">
                      <span class="blueColor cursor max-height-300">
                        {{ shipmentTagModel.length > 0 ? '' : '指定类型' }}
                        <span v-show="shipmentTagModel.length > 0" class="mr20" v-for="(item, index) in shipmentTagModel"
                          :key="index">{{ item }}</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div>
                          已选择
                        </div>
                        <div class="breakWord max-height-300">
                          <Tag closable :color="tagColor(item)" v-for="(item, index) in shipmentTagModel" :key="index"
                            @on-close="delTag(index)">{{ item }}</Tag>
                        </div>
                        <div class="divider normalTop"></div>
                        <div class="platformSelect normalTop">
                          <dyt-select v-model="shipmentPlatformModel" style="width:150px" @on-change="getSite"
                            placeholder="请选择平台">
                            <Option v-for="item in shipmentPlatformList" :key="item.platformId" :value="item.platformId"
                            >{{ item.name }}</Option>
                          </dyt-select>
                          <dyt-select v-model="shipmentPlatformSite" v-if="hasSite" style="width:150px; margin-left:10px"
                            @on-change="setSite">
                            <Option v-for="item in shipmentPlatformSiteList" :key="item.siteId" :value="item.siteId"
                            >{{ item.cnName }}</Option>
                          </dyt-select>
                        </div>
                        <div class="normalTop">
                          <Input v-model.trim="shipmentSearchValue" style="width:310px" @on-enter="shipmentSearch()"
                            placeholder="请输入运输类型名称搜索"></Input>
                        </div>
                        <div class="normalTop" v-if="addiblePlatform.includes(shipmentPlatformModel)">
                          <Input v-model.trim='shippingMethodName' placeholder="新增运输类型"
                            style="width:310px;margin-right:10px" /><Button @click='saveShopifyLogisticsMode'>保存</Button>
                        </div>
                        <div class="normalTop" v-if="shipmentPlatformModel !== '' && smShippingMethodList.length != 0">
                          <CheckboxGroup ref='shipCheckBoxRef' v-model="shipmentCheckBoxModel" @on-change="setTagValue">
                            <div class="checkboxContainer">
                              <div class="normalTop" v-for="(item, index) in smShippingMethodList" :key="`${item.siteId}-${index}`">
                                <Checkbox v-if="item.siteId"
                                  :label="shipmentPlatformModel + ':' + item.siteId + ':' + item.siteName + ':' + item.shippingMethodName + ':' + item.shippingMethodDescription">
                                  {{ item.shippingMethodDescription }}</Checkbox>
                                <Checkbox v-else
                                  :label="shipmentPlatformModel + ':' + item.shippingMethodName + ':' + item.shippingMethodDescription">
                                  <span>{{ item.shippingMethodDescription }}</span>
                                </Checkbox>
                                <Poptip confirm title="您确定要删除吗？"
                                  @on-ok="deleteShipMethod(item.merchantShippingMethodId, index)">
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
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O005')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O005'].states }">订单收货地址省/州为</span> <span
                    class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O005'].states"
                    @click="addItem('states', 'O005')">
                    {{ componentsModel['O005'].states === '' ? '指定省/州' : componentsModel['O005'].states }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O005'].states"
                    v-model.trim="componentsModel['O005'].states"></Input>
                </div>
                <!-- 订单收货地址城市 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O006')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O006'].cities }">订单收货地址城市为</span> <span
                    class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O006'].cities"
                    @click="addItem('cities', 'O006')">
                    {{ componentsModel['O006'].cities === '' ? '指定城市' : componentsModel['O006'].cities }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O006'].cities"
                    v-model.trim="componentsModel['O006'].cities"></Input>
                </div>
                <!-- 订单总金额 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O007')) >= 0">
                  <span class="itemPaddingRight">订单总金额</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('amountRange', 'O007')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="ml10" v-if="amountRange.usdFloor !== 0 || amountRange.usdUpper !== 0">{{
                          ($common.isEmpty(amountRange.usdFloor) ? 0 : amountRange.usdFloor) + '-' + ($common.isEmpty(amountRange.usdUpper) ? 0 : amountRange.usdUpper)
                        }}(USD)</span>
                        <span class="ml10" v-if="amountRange.eurFloor !== 0 || amountRange.eurUpper !== 0">{{
                          ($common.isEmpty(amountRange.eurFloor) ? 0 : amountRange.eurFloor) + '-' + ($common.isEmpty(amountRange.eurUpper) ? 0 : amountRange.eurUpper)
                        }}(EUR)</span>
                        <span class="ml10" v-if="amountRange.gbpFloor !== 0 || amountRange.gbpUpper !== 0">{{
                          ($common.isEmpty(amountRange.gbpFloor) ? 0 : amountRange.gbpFloor) + '-' + ($common.isEmpty(amountRange.gbpUpper) ? 0 : amountRange.gbpUpper)
                        }}(GBP)</span>
                        <span class="ml10" v-if="amountRange.audFloor !== 0 || amountRange.audUpper !== 0">{{
                          ($common.isEmpty(amountRange.audFloor) ? 0 : amountRange.audFloor) + '-' + ($common.isEmpty(amountRange.audUpper) ? 0 : amountRange.audUpper)
                        }}(AUD)</span>
                        <span
                          v-if="amountRange.usdUpper === 0 && amountRange.eurUpper === 0 && amountRange.gbpUpper === 0 && amountRange.audUpper === 0">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <Form ref="amountRange" :model="amountRange" :disabled="looKsettings" :label-width="80">
                          <FormItem label="美元(USD)" class="form-item-range">
                            <InputNumber :min="0" v-model="amountRange.usdFloor" @on-change="numberChange($event, 'usd')" />
                            <span>-</span>
                            <InputNumber :min="0" v-model="amountRange.usdUpper" @on-blur="numberBlur($event, 'usd')" />
                          </FormItem>
                          <FormItem label="或欧元(EUR)" class="form-item-range">
                            <InputNumber :min="0" v-model="amountRange.eurFloor" @on-change="numberChange($event, 'eur')" />
                            <span>-</span>
                            <InputNumber :min="0" v-model="amountRange.eurUpper" @on-blur="numberBlur($event, 'eur')" />
                          </FormItem>
                          <FormItem label="或英镑(GBP)" class="form-item-range">
                            <InputNumber :min="0" v-model="amountRange.gbpFloor" @on-change="numberChange($event, 'gbp')" />
                            <span>-</span>
                            <InputNumber :min="0" v-model="amountRange.gbpUpper" @on-blur="numberBlur($event, 'gbp')" />
                          </FormItem>
                          <FormItem label="或澳元(AUD)" class="form-item-range">
                            <InputNumber :min="0" v-model="amountRange.audFloor" @on-change="numberChange($event, 'aud')" />
                            <span>-</span>
                            <InputNumber :min="0" v-model="amountRange.audUpper" @on-blur="numberBlur($event, 'aud')" />
                          </FormItem>
                        </Form>
                        <div class="redColor">注：其他币种转化成美元,所有选项都必须填写</div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单利润 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O008')) >= 0">
                  <span class="itemPaddingRight">订单利润</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('priceRange', 'O008')" transfer width="500" placement="bottom">
                      <a>
                        {{
                          (componentsModel['O008'].priceRange.less === 1 && componentsModel['O008'].priceRange.more === 1)
                          ? '低于' + componentsModel['O008'].priceRange.lowerProfit + '%' + ', ' + '高于' +
                          componentsModel['O008'].priceRange.upperProfit + '%'
                          : componentsModel['O008'].priceRange.less === 1 && componentsModel['O008'].priceRange.more !== 1
                            ? '低于' + componentsModel['O008'].priceRange.lowerProfit + '%'
                            : componentsModel['O008'].priceRange.less !== 1 && componentsModel['O008'].priceRange.more === 1
                              ? '高于' + componentsModel['O008'].priceRange.upperProfit + '%'
                              : '指定范围'
                        }}
                      </a>
                      <div slot="content">
                        <div class="">
                          <Checkbox v-model="componentsModel['O008'].priceRange.less" :true-value="1" :false-value="0"
                            class="priceRangeCheck">低于</Checkbox>
                          <InputNumber :min="0" v-model.trim="componentsModel['O008'].priceRange.lowerProfit"
                            style="width:100px"></InputNumber>
                          <span class="pricePrangeLeft">%</span>
                        </div>
                        <div class="">
                          <Checkbox v-model="componentsModel['O008'].priceRange.more" :true-value="1" :false-value="0"
                            class="priceRangeCheck">高于</Checkbox>
                          <InputNumber :min="0" v-model.trim="componentsModel['O008'].priceRange.upperProfit"
                            style="width:100px"></InputNumber>
                          <span class="pricePrangeLeft">%</span>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单目的地 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O004')) >= 0">
                  <!-- 订单目的地为 -->
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O004'].countryCodes }">订单目的地为</span> <span
                    v-if="!componentsStatus['O004'].countryCodes"
                    class="blueColor itemPaddingRight cursor countryCodesName" @click="addItem('countryCodes', 'O004')">
                    <!-- 指定国家 -->
                    {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
                  </span>
                  <erpTreeSelect v-if="componentsStatus['O004'].countryCodes" v-model="countryCodes" :multiple="true"
                    class="country-codes-calss" :normalizer="treeNormalizer" :options="countryData"
                    :default-expand-level="Infinity" :appendToBody="true" placeholder="请选择" noResultsText="无匹配数据"
                    style="display: inline-block; margin-right: 5px; width:200px; vertical-align: middle;"
                    @input="getTreeData" @open="openTree" @close="closeTree" zIndex="9999999999" />
                  <dyt-input-tag style="display: inline-block; width: 300px; vertical-align: middle;"
                    v-if="componentsStatus['O004'].countryCodes" type="textarea" :limit="1"
                    placeholder="请输入国家名称，多个可用逗号或换行隔开" v-model="textareaCountryCodes" />
                  <!-- 且邮编在 -->
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O004'].countryCodes }">且邮编在</span> <span
                    class="blueColor itemPaddingRight cursor"
                    :class="{ textMarginTop: componentsStatus['O004'].countryCodes }">
                    <Poptip @on-popper-show="addItem('buyerPostalCodes', 'O004')" transfer width="500" placement="bottom">
                      <!-- 指定范围 -->
                      <span class="blueColor itemPaddingRight cursor">
                        <!-- {{
                        postcodeOne !== '' && postcodeTwo !== '' ? postcodeOne + '-' + postcodeTwo :
                          postcodeOne !== '' && postcodeTwo === '' ? postcodeOne : postcodeArea !== '' ? postcodeArea : '指定范围' }} -->
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
                        <RadioGroup v-model="componentsModel['O004'].postalCodeType" @on-change="getPostCodeType">
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
                        <div class="normalTop" v-if="componentsModel['O004'].postalCodeType === 0">
                          <!-- <Input v-model.trim="postcodeOne" style="width:150px"></Input>
                          <span> - </span>
                          <Input v-model.trim="postcodeTwo" style="width:150px"></Input> -->
                          <div v-for="(item, index) in postcodeArr" :key="index" class="normalMarginBottom">
                            <Input v-model.trim="item.postcode1" style="width:150px"></Input>
                            <span> - </span>
                            <Input v-model.trim="item.postcode2" style="width:150px"></Input>
                            <Button type="primary" shape="circle" icon="md-add" class="normalLMargin" v-if="index === 0"
                              @click="addPostcodeFn"></Button>
                            <Button type="error" shape="circle" icon="md-remove" class="normalLMargin" v-if="index > 0"
                              @click="deletePostcodeFn(index)"></Button>
                          </div>
                        </div>
                        <!-- 邮编列表 -->
                        <div class="normalTop" v-if="componentsModel['O004'].postalCodeType === 1">
                          <Input v-model="postcodeArea" style="width:300px" type="textarea" :rows="5"
                            placeholder="多邮编换行请求半角输入逗号隔开"></Input>
                        </div>
                      </div>
                    </Poptip>
                  </span>

                </div>
                <!-- 订单产品包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O009')) >= 0">
                  <span class="itemPaddingRight">发货信息包含</span> <span v-if="!componentsStatus['O009'].productCategories"
                    class="blueColor itemPaddingRight cursor" @click="addItem('productCategories', 'O009')">
                    {{ componentsModel['O009'].productCategories.length > 0 ? productCategoryListName : '指定分类' }}
                  </span>
                  <!-- <treeSelect
                    v-if="componentsStatus['O009'].productCategories"
                    style="width:200px"
                    :treeData="productCategoryTree"
                    ref="treeDataRef1"
                    v-model="country1Codes"
                    filterable showCheckbox
                    @on-change="getTree1Data"
                  /> -->
                  <erpTreeSelect v-if="componentsStatus['O009'].productCategories" v-model="country1Codes"
                    :multiple="true" :normalizer="tree1Normalizer" :options="productCategoryTree"
                    :default-expand-level="Infinity" :appendToBody="true" placeholder="请选择" noResultsText="无匹配数据"
                    style="display: inline-block; margin-right: 5px; width:200px; vertical-align: middle;"
                    @input="getTree1Data" zIndex="9999999999" />
                  <!-- <dyt-select v-if="componentsStatus['O009'].productCategories" v-model="componentsModel['O009'].productCategories" style="width:100px" multiple>
                      <Option v-for="item in productCategoryList" :key="item.productCategoryId" :value="item.productCategoryId">{{item.cnName}}</Option>
                    </dyt-select>-->
                  <span class="itemPaddingRight">或</span> <span class="blueColor itemPaddingRight cursor">
                    <Poptip @on-popper-show="addItem('skus', 'O009')" transfer width="350" placement="bottom"
                      v-model="skusStatus">
                      <span class="blueColor cursor">
                        {{ $common.isEmpty(modelSkusO009TXT) ? '指定SKU' : modelSkusO009TXT }}
                      </span>
                      <div slot="content">
                        <Input v-model.trim="componentsModel['O009'].skus" type="textarea" :rows="4" style="width:300px"
                          placeholder="请输入SKU，多个SKU用逗号或换行隔开">
                        </Input>
                      </div>
                    </Poptip>
                  </span> <span class="itemPaddingRight">或</span>
                  <span v-if="!componentsStatus['O009'].productTags" class="blueColor itemPaddingRight cursor"
                    @click="addItem('productTags', 'O009')">
                    <template v-if="componentsModel['O009'].productTags.length > 0">
                      <template v-for="(tag, tagIndex) in productTagList">
                        <span :key="`tag${tagIndex}`"
                          v-if="componentsModel['O009'].productTags.includes(tag.productTagId)">
                          {{ tag.name }}
                        </span>
                      </template>
                    </template>
                    <template v-else>指定商品标签</template>
                    <!-- {{
                        componentsModel['O009'].productTags.length > 0
                        ? componentsModel['O009'].productTags.toString()
                        : '指定商品标签'
                      }} -->
                  </span>
                  <dyt-select v-if="componentsStatus['O009'].productTags" v-model="componentsModel['O009'].productTags"
                    style="max-width:200px" multiple>
                    <Option v-for="(item, index) in productTagList" :key="index" :value="item.productTagId">{{ item.name
                    }}</Option>
                  </dyt-select>
                </div>
                <!-- 订单产品包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O026')) >= 0">
                  <span class="itemPaddingRight">订单产品包含</span> <span class="blueColor itemPaddingRight cursor">
                    <Poptip @on-popper-show="addItem('skus', 'O026')" transfer width="350" placement="bottom"
                      v-model="skusStatus1">
                      <span class="blueColor cursor">
                        {{ $common.isEmpty(modelSkusO026TXT) ? '指定SKU' : modelSkusO026TXT }}
                      </span>
                      <div slot="content">
                        <Input v-model.trim="componentsModel['O026'].skus" type="textarea" :rows="4" style="width:300px"
                          placeholder="请输入SKU，多个SKU用逗号或换行隔开">
                        </Input>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- 订单产品店铺SKU -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('W004')) >= 0">
                  <span class="itemPaddingRight">订单产品店铺SKU</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('shopSku', 'W004')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        {{
                          shopSkuModel === 0 ? '以' + shopSku.start + '开头' : shopSkuModel === 1
                          ? '以' + shopSku.end + '结尾'
                          : '指定规律'
                        }}
                      </span>
                      <div slot="content" class="keywordString shopSku">
                        <RadioGroup v-model="shopSkuModel" vertical>
                          <Radio :label="0">
                            以<Input v-model.trim="shopSku.start" style="width:160px"></Input>开头
                          </Radio>
                          <Radio :label="1" style="margin-top:10px">
                            以<Input v-model.trim="shopSku.end" style="width:160px"></Input> 结尾
                          </Radio>
                        </RadioGroup>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!-- eBay订单 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O010')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O010'].isEbayPlus }">eBay订单</span> <span
                    v-if="!componentsStatus['O010'].isEbayPlus" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isEbayPlus', 'O010')">
                    {{ componentsModel['O010'].isEbayPlus === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O010'].isEbayPlus" v-model="componentsModel['O010'].isEbayPlus"
                    class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O010'].isEbayPlus }">
                    eBayPlus订单
                  </span>
                </div>
                <!-- eBay订单EGD -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O012')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O012'].include }">eBay订单</span> <span
                    v-if="!componentsStatus['O012'].include" class="blueColor itemPaddingRight cursor"
                    @click="addItem('include', 'O012')">
                    {{ componentsModel['O012'].include === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O012'].include" v-model="componentsModel['O012'].include"
                    class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O012'].include }">
                    包含EGD物品
                  </span>
                </div>
                <!-- 产品刊登标题所含关键字包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O011')) >= 0">
                  <span class="itemPaddingRight">产品刊登标题所含关键字包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('productKeyword', 'O011')" transfer width="500" placement="bottom">
                      <a>{{
                        (componentsModel['O011'].productKeyword.length > 1 &&
                          componentsModel['O011'].productKeyword[0].value !== '')
                        ? componentsModel['O011'].productKeyword[0].value + '...'
                        : '指定字符串'
                      }}</a>
                      <div slot="content" class="keywordString">
                        <RadioGroup v-model="componentsModel['O011'].type">
                          <Radio :label="0">
                            <span>以下关键字都必须包含</span>
                          </Radio>
                          <Radio :label="1">
                            <span>以下关键字包含任意一个</span>
                          </Radio>
                        </RadioGroup>
                        <Form ref="productKeyword" :model="componentsModel['O011']" :label-width="80"
                          style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['O011'].productKeyword" :key="index"
                            :label="'关键字' + index">
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
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O013')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O013'].goodsCountry }">货品所在地为</span> <span
                    v-if="!componentsStatus['O013'].goodsCountry" class="blueColor itemPaddingRight cursor"
                    @click="addItem('goodsCountry', 'O013')">
                    {{ componentsModel['O013'].goodsCountry !== '' ? componentsModel['O013'].goodsCountry : '指定国家' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O013'].goodsCountry" style="width: 100px"
                    v-model="componentsModel['O013'].goodsCountry" filterable placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                      :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select> <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O013'].goodsCountry }">且</span> <span
                    v-if="!componentsStatus['O013'].goodsCity" class="blueColor itemPaddingRight cursor"
                    :class="{ textMarginTop: componentsStatus['O013'].goodsCountry }"
                    @click="addItem('goodsCity', 'O013')">
                    {{ componentsModel['O013'].goodsCity !== '' ? componentsModel['O013'].goodsCity : '指定城市' }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O013'].goodsCity" placeholder="城市"
                    v-model.trim="componentsModel['O013'].goodsCity"></Input> <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O013'].goodsCountry }">且</span> <span
                    v-if="!componentsStatus['O013'].goodsPostalCode" class="blueColor itemPaddingRight cursor"
                    :class="{ textMarginTop: componentsStatus['O013'].goodsCountry }"
                    @click="addItem('goodsPostalCode', 'O013')">
                    {{
                      componentsModel['O013'].goodsPostalCode !== '' ? componentsModel['O013'].goodsPostalCode : '指定邮编'
                    }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O013'].goodsPostalCode" placeholder="指定邮编"
                    v-model.trim="componentsModel['O013'].goodsPostalCode"></Input>
                </div>
                <!-- 是否为黑名单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O014')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O014'].isWishExpress }">专有黑名单</span> <span
                    v-if="!componentsStatus['O014'].isBuyerInBlackList" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isBuyerInBlackList', 'O014')">
                    {{ componentsModel['O014'].isBuyerInBlackList === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O014'].isBuyerInBlackList"
                    v-model="componentsModel['O014'].isBuyerInBlackList" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O014'].isBuyerInBlackList }">
                    ，白名单除外
                  </span>
                </div>
                <!-- wish订单 是否是Wish Express：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O015')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O015'].isWishExpress }">wish订单</span> <span
                    v-if="!componentsStatus['O015'].isWishExpress" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isWishExpress', 'O015')">
                    {{ componentsModel['O015'].isWishExpress === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O015'].isWishExpress"
                    v-model="componentsModel['O015'].isWishExpress" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O015'].isWishExpress }">
                    Wish Express
                  </span>
                </div>
                <!-- wish订单 是否是EPC订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O016')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O016'].isWishEPC }">wish订单</span> <span
                    v-if="!componentsStatus['O016'].isWishEPC" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isWishEPC', 'O016')">
                    {{ componentsModel['O016'].isWishEPC === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O016'].isWishEPC" v-model="componentsModel['O016'].isWishEPC"
                    class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O016'].isWishEPC }">
                    EPC订单
                  </span>
                </div>
                <!-- wish订单 是否是优质服务商订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O017')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O017'].isWishQualityServiceOrder }">wish订单</span> <span
                    v-if="!componentsStatus['O017'].isWishQualityServiceOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isWishQualityServiceOrder', 'O017')">
                    {{ componentsModel['O017'].isWishQualityServiceOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O017'].isWishQualityServiceOrder"
                    v-model="componentsModel['O017'].isWishQualityServiceOrder" class="itemPaddingRight"
                    style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O017'].isWishQualityServiceOrder }">
                    优质服务商订单
                  </span>
                </div>
                <!-- wish订单 是否是A+物流计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O018')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O018'].isWishALogisticsPlanOrder }">wish订单</span> <span
                    v-if="!componentsStatus['O018'].isWishALogisticsPlanOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isWishALogisticsPlanOrder', 'O018')">
                    {{ componentsModel['O018'].isWishALogisticsPlanOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O018'].isWishALogisticsPlanOrder"
                    v-model="componentsModel['O018'].isWishALogisticsPlanOrder" class="itemPaddingRight"
                    style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O018'].isWishALogisticsPlanOrder }">
                    A+物流计划订单
                  </span>
                </div>
                <!-- wish订单 是否是可选A+物流计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O035')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O035'].isWishALogisticsPlanOrder }">wish订单</span> <span
                    v-if="!componentsStatus['O035'].isWishALogisticsPlanOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isWishALogisticsPlanOrder', 'O035')">
                    {{ componentsModel['O035'].isWishALogisticsPlanOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O035'].isWishALogisticsPlanOrder"
                    v-model="componentsModel['O035'].isWishALogisticsPlanOrder" class="itemPaddingRight"
                    style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O035'].isWishALogisticsPlanOrder }">
                    可选A+物流计划订单
                  </span>
                </div>
                <!-- 是否要求支付消费者VAT：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O036')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O036'].wishPayCustomerVatRequired }">Wish订单</span> <span
                    v-if="!componentsStatus['O036'].wishPayCustomerVatRequired" class="blueColor itemPaddingRight cursor"
                    @click="addItem('wishPayCustomerVatRequired', 'O036')">
                    {{ componentsModel['O036'].wishPayCustomerVatRequired === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O036'].wishPayCustomerVatRequired"
                    v-model="componentsModel['O036'].wishPayCustomerVatRequired" class="itemPaddingRight"
                    style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O036'].wishPayCustomerVatRequired }">
                    要求支付消费者VAT
                  </span>
                </div>
                <!-- 是否合并计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O037')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O037'].wishEligibleForShippingReimbursement }">Wish订单</span>
                  <span v-if="!componentsStatus['O037'].wishEligibleForShippingReimbursement"
                    class="blueColor itemPaddingRight cursor"
                    @click="addItem('wishEligibleForShippingReimbursement', 'O037')">
                    {{ componentsModel['O037'].wishEligibleForShippingReimbursement === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O037'].wishEligibleForShippingReimbursement"
                    v-model="componentsModel['O037'].wishEligibleForShippingReimbursement" class="itemPaddingRight"
                    style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O037'].wishEligibleForShippingReimbursement }">
                    合并计划订单
                  </span>
                </div>
                <!-- amazon订单 是否是prime订单：是/否：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O023')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O023'].amazonPrime }">prime订单</span> <span
                    v-if="!componentsStatus['O023'].amazonPrime" class="blueColor itemPaddingRight cursor"
                    @click="addItem('amazonPrime', 'O023')">
                    {{ componentsModel['O023'].amazonPrime === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O023'].amazonPrime" v-model="componentsModel['O023'].amazonPrime"
                    class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O023'].amazonPrime }">
                    prime订单
                  </span>
                </div>

                <!-- amazon订单 订单类型：ToB订单/ToC订单 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O022')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O022'].amazonOrderType }">订单类型</span> <span
                    v-if="!componentsStatus['O022'].amazonOrderType" class="blueColor itemPaddingRight cursor"
                    @click="addItem('amazonOrderType', 'O022')">
                    {{ componentsModel['O022'].amazonOrderType === '0' ? 'B2C订单' : 'B2B订单' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O022'].amazonOrderType"
                    v-model="componentsModel['O022'].amazonOrderType" class="itemPaddingRight" style="width:120px">
                    <Option value="1">B2B订单</Option>
                    <Option value="0">B2C订单</Option>
                  </dyt-select>
                </div>

                <!-- vova 是否集运订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O020')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O020'].isVovaIsCombineOrder }">vova订单</span> <span
                    v-if="!componentsStatus['O020'].isVovaIsCombineOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isVovaIsCombineOrder', 'O020')">
                    {{ componentsModel['O020'].isVovaIsCombineOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O020'].isVovaIsCombineOrder"
                    v-model="componentsModel['O020'].isVovaIsCombineOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O020'].isVovaIsCombineOrder }">
                    集运订单
                  </span>
                </div>
                <!--joom 商品总金额 指定范围 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O021')) >= 0">
                  <span class="itemPaddingRight">joom 商品总金额</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O021')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        {{
                          componentsModel['O021'].listingParams.currency
                          ? componentsModel['O021'].listingParams.beginValue + '-' +
                          componentsModel['O021'].listingParams.endValue + '(' +
                          componentsModel['O021'].listingParams.currency + ')'
                          : '指定范围'
                        }}
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单单笔交易额转换为币种：</span>
                        <dyt-select v-model="componentsModel['O021'].listingParams.currency" style="width: 150px"
                          size="small">
                          <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label
                          }}</Option>
                        </dyt-select>
                        <span class="ml10">之后满足以下全部条件：：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O021'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O021'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O021'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O021'].listingParams.checkbox1"
                            v-model="componentsModel['O021'].listingParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O021'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O021'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O021'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O021'].listingParams.checkbox2"
                            v-model="componentsModel['O021'].listingParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--.订单货品总数量指定范围-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O024')) >= 0">
                  <span class="itemPaddingRight">订单货品总数量</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O024')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['O024'].listingParams.checkbox1">
                          <span>{{
                            componentsModel['O024'].listingParams.beginType === 0
                            ? '&ge;'
                            : componentsModel['O024'].listingParams.beginType === 1 ? '&gt;' : '='
                          }}</span>
                          <span>{{ componentsModel['O024'].listingParams.beginValue }}</span>
                        </span>
                        <span v-if="componentsModel['O024'].listingParams.checkbox2">
                          <span>{{ componentsModel['O024'].listingParams.endType === 0 ? '&lt;' : '&le;' }}</span>
                          <span>{{ componentsModel['O024'].listingParams.endValue }}</span>
                        </span>
                        <span
                          v-if="!componentsModel['O024'].listingParams.checkbox1 && !componentsModel['O024'].listingParams.checkbox2">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单货品总数量满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O024'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O024'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O024'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O024'].listingParams.checkbox1"
                            v-model="componentsModel['O024'].listingParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O024'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O024'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O024'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O024'].listingParams.checkbox2"
                            v-model="componentsModel['O024'].listingParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--O025  -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O025')) >= 0">
                  <span class="itemPaddingRight">订单重量满足以下条件</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O025')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="blueColor cursor">
                          <span v-if="componentsModel['O025'].listingParams.checkbox1">
                            <span>{{
                              componentsModel['O025'].listingParams.beginType === 0
                              ? '&ge;'
                              : componentsModel['O025'].listingParams.beginType === 1 ? '&gt;' : '='
                            }}</span>
                            <span>{{ componentsModel['O025'].listingParams.beginValue }}</span>
                          </span>
                          <span v-if="componentsModel['O025'].listingParams.checkbox2">
                            <span>{{ componentsModel['O025'].listingParams.endType === 0 ? '&lt;' : '&le;' }}</span>
                            <span>{{ componentsModel['O025'].listingParams.endValue }}</span>
                          </span>
                          <span v-if="componentsModel['O025'].listingParams.checkbox3">
                            体积重计量因子
                            <span>{{ componentsModel['O025'].listingParams.volumnValue }}</span>
                          </span>
                          <span
                            v-if="!componentsModel['O025'].listingParams.checkbox1 && !componentsModel['O025'].listingParams.checkbox2 && !componentsModel['O025'].listingParams.checkbox3">指定范围</span>
                        </span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单重量满足以下全部条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O025'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O025'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O025'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O025'].listingParams.checkbox1"
                            v-model="componentsModel['O025'].listingParams.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O025'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O025'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O025'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O025'].listingParams.checkbox2"
                            v-model="componentsModel['O025'].listingParams.endValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O025'].listingParams.checkbox3" @on-change="changeWeight">
                          </Checkbox>与体积重取重对比取重的作为订单重量计算 <span>体积重计量因子</span>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O025'].listingParams.checkbox3"
                            v-model="componentsModel['O025'].listingParams.volumnValue"></InputNumber>
                          <Tooltip transfer
                            content="订单中每件货品在商品管理中记录的最长边为a1、中间值为b1、最短边为c，所有a1中的最大值为a，所有b1中的最大值为b，订单中所有货品的短边c相加为d，则a、b、d中的最大值为订单货品长度，中间值为订单货品宽度，最小值为订单货品高度。体积重(g)=(a*b*d)/计重因子*1000。">
                            <Icon size="18" type="ios-help-circle" />
                          </Tooltip>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.订单预估利润指定范围-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O027')) >= 0">
                  <span class="itemPaddingRight">订单预估利润</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O027')" transfer width="650" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['O027'].listingParams.checkbox1">
                          <span>{{
                            componentsModel['O027'].listingParams.beginType === 0
                            ? '&ge;'
                            : componentsModel['O027'].listingParams.beginType === 1 ? '&gt;' : '='
                          }}</span>
                          <span>{{ componentsModel['O027'].listingParams.beginValue }}</span>
                        </span>
                        <span v-if="componentsModel['O027'].listingParams.checkbox2">
                          <span>{{ componentsModel['O027'].listingParams.endType === 0 ? '&lt;' : '&le;' }}</span>
                          <span>{{ componentsModel['O027'].listingParams.endValue }}</span>
                        </span>
                        <span
                          v-if="!componentsModel['O027'].listingParams.checkbox1 && !componentsModel['O027'].listingParams.checkbox2">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>订单利润：</span>
                          <RadioGroup v-model="componentsModel['O027'].listingParams.typeSelect">
                            <Radio label="1">转换为币种</Radio>
                            <dyt-select v-if="componentsModel['O027'].listingParams.typeSelect === '1'" filterable
                              v-model="componentsModel['O027'].listingParams.currency"
                              style="width:150px; margin: 0 10px;">
                              <Option v-for="item in currencyList" :value="item.value" :key="item.value">{{ item.label
                              }}</Option>
                            </dyt-select>
                            <Radio label="2">百分比</Radio>
                          </RadioGroup>
                          <span style="margin-left: 20px;">之后满足以下全部条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O027'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O027'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O027'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O027'].listingParams.checkbox1"
                            v-model="componentsModel['O027'].listingParams.beginValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O027'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O027'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O027'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O027'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O027'].listingParams.checkbox2"
                            v-model="componentsModel['O027'].listingParams.endValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O027'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.订单的邮寄方式为指定邮寄方式-->
                <div class="uniformlyspacedPadding content-flex" v-if="rulesModel.indexOf(getRuleCode('O028')) >= 0">
                  <div class="itemPaddingRight" style="line-height: 32px;">订单的邮寄方式为</div>
                  <div class="blueColor itemPaddingRight" style="position: relative;flex: 100;">
                    <span
                      class="cursor"
                      v-if="!componentsStatus['O028'].listingParams"
                      @click="addItem('listingParams', 'O028')"
                      style="display: inline-block; margin-top: 6px;"
                    >
                      {{ modelShippingO028Txt }}
                    </span>
                    <div v-if="componentsStatus['O028'].listingParams">
                      <Spin v-if="modelShippingO028Loding" fix>数据加载中...</Spin>
                      <logisticsModeTree
                        class="shipping-method-select"
                        v-model="value2"
                        :loadingChildren="true"
                        :allLogisticsMode="false"
                        :autoLoading="true"
                        :limit="Infinity"
                        :clearable="false"
                        valueConsistsOf="LEAF_PRIORITY"
                        placeholder="请选择规则指定发货指定方式"
                        @on-change="getAccountApi"
                        @loadingCompleted="logisticsTreeloaded"
                      >
                        <div slot="value-label" slot-scope="{ node }">{{ node.raw.labelPath }}</div>
                      </logisticsModeTree>
                    </div>
                  </div>
                </div>

                <!--订单收货地址街道包含指定字符串-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O029')) >= 0">
                  <span class="itemPaddingRight">订单收货地址街道包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('productKeyword', 'O029')" transfer width="500" placement="bottom">
                      <a>{{
                        (componentsModel['O029'].productKeyword.length > 0 &&
                          componentsModel['O029'].productKeyword[0].value !== '')
                        ? componentsModel['O029'].productKeyword[0].value + '...'
                        : '指定字符串'
                      }}</a>
                      <div slot="content" class="keywordString">
                        <div style="margin-bottom: 10px;">指定要在地址(仅街道1+街道2，不含国家/地区省市信息)中查找的字符：</div>
                        <Form ref="productKeyword" :model="componentsModel['O029']" :label-width="80"
                          :disabled="looKsettings" style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['O029'].productKeyword" :key="index"
                            :label="'字符' + index">
                            <Row>
                              <Col span="18">
                              <Input type="text" v-model.trim="item.value"></Input>
                              </Col>
                              <Col span="4" offset="1">
                              <Button @click="handleRemoveCharacter(index)">删除</Button>
                              </Col>
                            </Row>
                          </FormItem>
                          <FormItem>
                            <Row>
                              <Col span="12">
                              <Button type="dashed" long @click="handleAddCharacter" icon="md-add">新增</Button>
                              </Col>
                            </Row>
                          </FormItem>
                        </Form>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.订单收件人电话要求指定条件 旧-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O030')) >= 0">
                  <span class="itemPaddingRight">订单收件人电话要求</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O030')" transfer placement="bottom" width="600">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['O030'].listingParams.checkbox1">
                          <span style="margin-right: 5px;">移动电话可读字符长度&le;</span>
                          <span style="margin-right: 5px;">{{ componentsModel['O030'].listingParams.mobileLength
                          }}</span>
                          <span style="margin-right: 5px;">{{
                            componentsModel['O030'].listingParams.condition1 == 1 ? '并且' : '或者'
                          }}</span>
                        </span>
                        <span
                          v-if="componentsModel['O030'].listingParams.checkbox1 && componentsModel['O030'].listingParams.checkbox2">
                          <span style="margin-right: 5px;">固定电话可读字符长度&le;</span>
                          <span style="margin-right: 5px;">{{ componentsModel['O030'].listingParams.phoneLength
                          }}</span>
                          <span style="margin-right: 5px;">{{
                            componentsModel['O030'].listingParams.condition2 == 1 ? '并且' : '或者'
                          }}</span>
                        </span>
                        <span
                          v-if="componentsModel['O030'].listingParams.checkbox1 && componentsModel['O030'].listingParams.checkbox2 && componentsModel['O030'].listingParams.checkbox3">
                          <span style="margin-right: 5px;">移动电话前缀</span>
                          <span style="margin-right: 5px;">{{
                            componentsModel['O030'].listingParams.condition3 == 1 ? '以' : '不以'
                          }}</span>
                          <span style="margin-right: 5px;">{{ componentsModel['O030'].listingParams.mobilePrefixes
                          }}</span>
                        </span>
                        <span
                          v-if="!componentsModel['O030'].listingParams.checkbox1 &&
                            !componentsModel['O030'].listingParams.checkbox2 && !componentsModel['O030'].listingParams.checkbox3">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>订单收件人电话要求满足以下选中的条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O030'].listingParams.checkbox1"></Checkbox>
                          <span>移动电话可读字符长度&le;</span>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1"
                            v-model="componentsModel['O030'].listingParams.mobileLength"></InputNumber>
                          <dyt-select v-model="componentsModel['O030'].listingParams.condition1"
                            style="width:120px; margin-left: 10px;" size="small"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1">
                            <Option :value="1">并且</Option>
                            <Option :value="2">或者</Option>
                          </dyt-select>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O030'].listingParams.checkbox2"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1"></Checkbox>
                          <span>固定电话可读字符长度&le;</span>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1 || !componentsModel['O030'].listingParams.checkbox2"
                            v-model="componentsModel['O030'].listingParams.phoneLength"></InputNumber>
                          <dyt-select v-model="componentsModel['O030'].listingParams.condition2"
                            style="width:120px; margin-left: 10px;" size="small"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1 || !componentsModel['O030'].listingParams.checkbox2">
                            <Option :value="1">并且</Option>
                            <Option :value="2">或者</Option>
                          </dyt-select>
                        </div>
                        <div class="platformSelect normalTop" style="display: flex; align-items: flex-start;">
                          <Checkbox v-model="componentsModel['O030'].listingParams.checkbox3"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1 || !componentsModel['O030'].listingParams.checkbox2">
                          </Checkbox>
                          <span>移动电话前缀</span>
                          <dyt-select v-model="componentsModel['O030'].listingParams.condition3"
                            style="width:120px; margin-left: 10px;" size="small"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1 || !componentsModel['O030'].listingParams.checkbox2 || !componentsModel['O030'].listingParams.checkbox3">
                            <Option :value="1">以</Option>
                            <Option :value="2">不以</Option>
                          </dyt-select>
                          <Input v-model="componentsModel['O030'].listingParams.mobilePrefixes" type="textarea"
                            style="width: 200px; margin: 0 10px;"
                            :disabled="!componentsModel['O030'].listingParams.checkbox1 || !componentsModel['O030'].listingParams.checkbox2 || !componentsModel['O030'].listingParams.checkbox3" />
                          <span>开头</span>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.订单收件人电话要求指定条件 新-->
                <div class="uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O039')) >= 0">
                  <span class="itemPaddingRight">订单收件人电话要求</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O039')" transfer placement="bottom" width="600"
                      popper-class="poptipClass">
                      <span class="blueColor cursor">
                        <span
                          v-if="!(componentsModel['O039'].listingParams.checkbox1 || componentsModel['O039'].listingParams.checkbox2)">指定范围</span>
                        <span v-else>
                          <span v-if="componentsModel['O039'].listingParams.checkbox1">
                            <span class="mr5">电话可读字符长度</span>
                            <span class="mr5">
                              {{ operatorType[componentsModel['O039'].listingParams.operator] }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O039'].listingParams.phoneLength }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O039'].listingParams.relevance == '&' ? '并且' : '或者' }}
                            </span>
                          </span>
                          <span v-if="componentsModel['O039'].listingParams.checkbox2">
                            <span class="mr5">电话</span>
                            <span class="mr5">
                              {{ matchRuleType[componentsModel['O039'].listingParams.matchRule] }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O039'].listingParams.isContains == 1 ? '包含' : '不包含' }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O039'].listingParams.phoneContext }}
                            </span>
                          </span>
                        </span>
                      </span>

                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>订单收件人电话要求满足以下选中的条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O039'].listingParams.checkbox1"></Checkbox>
                          <span>电话可读字符长度 </span>
                          <dyt-select v-model="componentsModel['O039'].listingParams.operator" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O039'].listingParams.checkbox1" :clearable="false">
                            <Option v-for="(item, key, index) in operatorType" :key="index + 'aa'" :value="key"
                              :label="item" />
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O039'].listingParams.checkbox1"
                            v-model="componentsModel['O039'].listingParams.phoneLength"></InputNumber>
                          <dyt-select v-model="componentsModel['O039'].listingParams.relevance" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O039'].listingParams.checkbox1" :clearable="false">
                            <Option value="&">并且</Option>
                            <Option value="|">或者</Option>
                          </dyt-select>
                        </div>
                        <div class="platformSelect normalTop" style="display: flex; align-items: flex-start;">
                          <Checkbox v-model="componentsModel['O039'].listingParams.checkbox2"></Checkbox>
                          <span>电话</span>
                          <dyt-select v-model="componentsModel['O039'].listingParams.matchRule" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O039'].listingParams.checkbox2" :clearable="false">
                            <Option v-for="(item, key) in matchRuleType" :key="item + 'bb'" :value="key" :label="item" />
                          </dyt-select>
                          <dyt-select v-model="componentsModel['O039'].listingParams.isContains" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O039'].listingParams.checkbox2" :clearable="false">
                            <Option value="1">包含</Option>
                            <Option value="2">不包含</Option>
                          </dyt-select>
                          <Input size="small" type="textarea" class="ml10 width200"
                            :disabled="!componentsModel['O039'].listingParams.checkbox2"
                            v-model="componentsModel['O039'].listingParams.phoneContext"></Input>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--.订单收件人手机要求指定条件 新-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O040')) >= 0">
                  <span class="itemPaddingRight">订单收件人手机要求</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O040')" transfer placement="bottom" width="600"
                      popper-class="poptipClass">
                      <span class="blueColor cursor">
                        <span
                          v-if="!(componentsModel['O040'].listingParams.checkbox1 || componentsModel['O040'].listingParams.checkbox2)">指定范围</span>
                        <span v-else>
                          <span v-if="componentsModel['O040'].listingParams.checkbox1">
                            <span class="mr5">手机可读字符长度</span>
                            <span class="mr5">
                              {{ operatorType[componentsModel['O040'].listingParams.operator] }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O040'].listingParams.mobileLength }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O040'].listingParams.relevance == '&' ? '并且' : '或者' }}
                            </span>
                          </span>
                          <span v-if="componentsModel['O040'].listingParams.checkbox2">
                            <span class="mr5">手机</span>
                            <span class="mr5">
                              {{ matchRuleType[componentsModel['O040'].listingParams.matchRule] }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O040'].listingParams.isContains == 1 ? '包含' : '不包含' }}
                            </span>
                            <span class="mr5">
                              {{ componentsModel['O040'].listingParams.mobileContext }}
                            </span>
                          </span>
                        </span>
                      </span>

                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>订单收件人手机要求满足以下选中的条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O040'].listingParams.checkbox1"></Checkbox>
                          <span>手机可读字符长度 </span>
                          <dyt-select v-model="componentsModel['O040'].listingParams.operator" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O040'].listingParams.checkbox1" :clearable="false">
                            <Option v-for="(item, key, index) in operatorType" :key="index + 'aa'" :value="key"
                              :label="item" />
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O040'].listingParams.checkbox1"
                            v-model="componentsModel['O040'].listingParams.mobileLength"></InputNumber>
                          <dyt-select v-model="componentsModel['O040'].listingParams.relevance" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O040'].listingParams.checkbox1">
                            <Option value="&">并且</Option>
                            <Option value="|">或者</Option>
                          </dyt-select>
                        </div>
                        <div class="platformSelect normalTop" style="display: flex; align-items: flex-start;">
                          <Checkbox v-model="componentsModel['O040'].listingParams.checkbox2"></Checkbox>
                          <span>手机</span>
                          <dyt-select v-model="componentsModel['O040'].listingParams.matchRule" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O040'].listingParams.checkbox2">
                            <Option v-for="(item, key, index) in matchRuleType" :key="index + 'bb'" :value="key"
                              :label="item" />
                          </dyt-select>
                          <dyt-select v-model="componentsModel['O040'].listingParams.isContains" class="ml10 width120"
                            size="small" :disabled="!componentsModel['O040'].listingParams.checkbox2">
                            <Option value="1">包含</Option>
                            <Option value="2">不包含</Option>
                          </dyt-select>
                          <Input size="small" type="textarea" class="ml10 width200"
                            :disabled="!componentsModel['O040'].listingParams.checkbox2"
                            v-model="componentsModel['O040'].listingParams.mobileContext"></Input>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.买家支付的运费指定范围-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O031')) >= 0">
                  <span class="itemPaddingRight">买家支付的运费</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O031')" transfer placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['O031'].listingParams.checkbox1">
                          <span>{{
                            componentsModel['O031'].listingParams.beginType === 0
                            ? '&ge;'
                            : componentsModel['O031'].listingParams.beginType === 1 ? '&gt;' : '='
                          }}</span>
                          <span>{{ componentsModel['O031'].listingParams.beginValue }}</span>
                        </span>
                        <span v-if="componentsModel['O031'].listingParams.checkbox2">
                          <span>{{ componentsModel['O031'].listingParams.endType === 0 ? '&lt;' : '&le;' }}</span>
                          <span>{{ componentsModel['O031'].listingParams.endValue }}</span>
                        </span>
                        <span
                          v-if="!componentsModel['O031'].listingParams.checkbox1 && !componentsModel['O031'].listingParams.checkbox2">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>买家支付的运费转换为币种：</span>
                          <dyt-select filterable v-model="componentsModel['O031'].listingParams.currency"
                            style="width:150px; margin: 0 10px;">
                            <Option v-for="item in currencyList" :value="item.value" :key="item.value">{{ item.label }}
                            </Option>
                          </dyt-select>
                          <span style="margin-left: 20px;">之后满足以下全部条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O031'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O031'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O031'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O031'].listingParams.checkbox1"
                            v-model="componentsModel['O031'].listingParams.beginValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O031'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O031'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O031'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O031'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O031'].listingParams.checkbox2"
                            v-model="componentsModel['O031'].listingParams.endValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O031'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!--.订单交易货品总数量指定范围-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O032')) >= 0">
                  <span class="itemPaddingRight">订单交易货品总数量</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('listingParams', 'O032')" transfer placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['O032'].listingParams.checkbox1">
                          <span>{{
                            componentsModel['O032'].listingParams.beginType === 0
                            ? '&ge;'
                            : componentsModel['O032'].listingParams.beginType === 1 ? '&gt;' : '='
                          }}</span>
                          <span>{{ componentsModel['O032'].listingParams.beginValue }}</span>
                        </span>
                        <span v-if="componentsModel['O032'].listingParams.checkbox2">
                          <span>{{ componentsModel['O032'].listingParams.endType === 0 ? '&lt;' : '&le;' }}</span>
                          <span>{{ componentsModel['O032'].listingParams.endValue }}</span>
                        </span>
                        <span
                          v-if="!componentsModel['O032'].listingParams.checkbox1 && !componentsModel['O032'].listingParams.checkbox2">指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div style="display: flex; align-items: center;">
                          <span>订单交易货品总数量满足以下选中的条件：</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O032'].listingParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['O032'].listingParams.beginType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O032'].listingParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O032'].listingParams.checkbox1"
                            v-model="componentsModel['O032'].listingParams.beginValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O032'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['O032'].listingParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['O032'].listingParams.endType" style="width:120px;"
                            size="small" :disabled="!componentsModel['O032'].listingParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" class="ml10"
                            :disabled="!componentsModel['O032'].listingParams.checkbox2"
                            v-model="componentsModel['O032'].listingParams.endValue"></InputNumber>
                          <span style="margin-left: 15px; color: #FF0000;"
                            v-if="componentsModel['O032'].listingParams.typeSelect === '2'">(%)注意输入框后已有百分号</span>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>

                <!-- Aliexpress速卖通 是否合单订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O033')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O033'].isCombinedOrder }">Aliexpress订单</span> <span
                    v-if="!componentsStatus['O033'].isCombinedOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isCombinedOrder', 'O033')">
                    {{ componentsModel['O033'].isCombinedOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O033'].isCombinedOrder"
                    v-model="componentsModel['O033'].isCombinedOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O033'].isCombinedOrder }">
                    合单订单
                  </span>
                </div>
                <!-- Aliexpress速卖通 是否十日达订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O034')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O034'].isTenDaysOrder }">Aliexpress订单</span>
                  <span v-if="!componentsStatus['O034'].isTenDaysOrder" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isTenDaysOrder', 'O034')">
                    {{ componentsModel['O034'].isTenDaysOrder === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O034'].isTenDaysOrder"
                    v-model="componentsModel['O034'].isTenDaysOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O034'].isTenDaysOrder }">
                    十日达订单
                  </span>
                </div>

                <!-- otto 退件包裹拦截 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O038')) >= 0">
                  <span class="itemPaddingRight"
                    :class="{ textMarginTop: componentsStatus['O038'].isReturnPackage }">Otto订单</span>
                  <span v-if="!componentsStatus['O038'].isReturnPackage" class="blueColor itemPaddingRight cursor"
                    @click="addItem('isReturnPackage', 'O038')">
                    {{ componentsModel['O038'].isReturnPackage === '0' ? '否' : '是' }}
                  </span>
                  <dyt-select v-if="componentsStatus['O038'].isReturnPackage"
                    v-model="componentsModel['O038'].isReturnPackage" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select>
                  <span class="itemPaddingRight" :class="{ textMarginTop: componentsStatus['O038'].isReturnPackage }">
                    匹配退件包裹
                  </span>
                </div>

              </template>
            </div>
          </div>
          <div class="modalItem normalTop">
            <div class="modalItemHeader">
              <div>设定动作</div>
            </div>
            <div class="modalItemContent content-padding">
              <template v-if="ruleParmas !== null && ruleParmas.type === 0">
                <!-- 自动分仓规则的设定动作 -->
                <div class="normalPadding">
                  <Form ref="actionParams" :model="actionParams" :rules="actionRule" :lable-width="80"
                    :disabled="looKsettings" label-position="left">
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
                    <FormItem label="类型:" prop="type">
                      <RadioGroup v-model="actionParams.type">
                        <Radio :label="0">选择指定仓库</Radio>
                        <Radio :label="1">选择指定仓库中距离最近的</Radio>
                      </RadioGroup>
                    </FormItem>
                    <div v-if="actionParams.type === 0">
                      <FormItem label="仓库：" prop="warehouseIds">
                        <dyt-select v-model="actionParams.warehouseIds" ref="warehouseRef" style="width: 200px"
                          filterable>
                          <Option v-for="item in storeList" :value="item.warehouseId" :key="item.warehouseId"> {{
                            item.warehouseName
                          }}</Option>
                        </dyt-select>
                        <Checkbox v-model="actionParams.matchOtherRulesSelected" class="ml15">仓库：
                        </Checkbox>
                      </FormItem>
                    </div>
                    <div v-if="actionParams.type === 1">
                      <FormItem label="仓库：" prop="warehouseIdList">
                        <dyt-select v-model="actionParams.warehouseIdList" style="width: 200px" multiple filterable
                          @on-change="changeData">
                          <Option v-for="item in warehouseList" :value="item.warehouseId" :key="item.warehouseId"> {{
                            item.warehouseName
                          }}</Option>
                        </dyt-select><span class="ml5">(需在仓库设置中维护距离权重)</span>
                      </FormItem>
                      <div>
                        <Checkbox v-model="actionParams.onlyDistriHaveStockSelected"
                          @on-change="onlyDistriHaveStockSelectedChange">仅分配有货仓库
                        </Checkbox>
                        <Checkbox v-model="actionParams.matchOtherRulesSelected2"
                          :disabled="!actionParams.onlyDistriHaveStockSelected" class="ml10">
                          所分配仓库缺货时支持继续匹配其他规则
                        </Checkbox>
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
              <!--截留订单-->
              <template v-if="ruleParmas !== null && (ruleParmas.type === 1 || ruleParmas.type === 2)">
                <div class="normalPadding">
                  <Form ref="actionParams" :model="actionParams" :rules="actionRule" :disabled="looKsettings"
                    :lable-width="80" label-position="left">
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
                      <Input v-if="actionParams.isSupended === 1" v-model.trim="actionParams.supendedOrderReason"
                        style="width:200px" placeholder="请输入截留原因"></Input>
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
                      <Input v-if="actionParams.isRemind === 1" v-model.trim="actionParams.shipmentRemindingReason"
                        style="width:200px" placeholder="请输入发货提醒"></Input>
                    </FormItem>
                    <!--添加订单标签-->
                    <FormItem label="添加订单标签：" prop="isOrderTags">
                      <RadioGroup v-model="actionParams.isOrderTags">
                        <Radio :label="1">
                          <span>是</span>
                        </Radio>
                        <Radio :label="0">
                          <span>否</span>
                        </Radio>
                      </RadioGroup>
                      <dyt-select v-if="actionParams.isOrderTags" style="width:300px" v-model="actionParams.orderTagId"
                        multiple>
                        <Option v-for="(item, index) in tagsList" :key="index" :value="item.tagId" :v="item.tagId">{{
                          item.tagName
                        }}</Option>
                      </dyt-select>
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
              <div>可选条件</div>
            </div>
            <div class="modalItemContent">
              <template v-if="rules !== null && rules.length > 0">
                <CheckboxGroup v-model="rulesModel">
                  <div v-for="(item, index) in rules" :key="index" class="uniformlyspacedPadding">
                    <div
                      v-if="((index > 0 && item.group !== rules[index - 1].group) || index === 0) && item.group !== null"
                      class="groupTitle">
                      {{ item.groupDescription }}
                      <span style="position: relative; top: 1px; cursor: pointer;"
                        v-if="item.groupDescription === 'Aliexpress'">
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
      </Row>
    </Form>
    <div class="ruleButtons flexEnd normal pt10">
      <Button class="normalRMargin" @click="closeRuleModal(0)">取 消</Button>
      <Button type="primary" class="saveButton" :loading="loading" :disabled="looKsettings"
        @click="saveButton">保 存</Button>
    </div>
    <keep-alive>
      <!--选择指定异常-->
      <Modal v-model="abnormalModelStatus" title="选择指定异常" :z-index="9999" :mask-closable="false" :width="700"
        v-if="abnormalStatus">
        <Row type="flex">
          <h6>本条件用于筛选异常状况，以下条件符合任何一项，即认为符合本条件。</h6>
        </Row>
        <Form :disabled="looKsettings">
          <Row type="flex" v-for="(item, itemIndex) in checkList" :key="itemIndex" justify="start" :gutter="5"
            align="middle" class="normalTop">
            <Col>
            <Checkbox v-model="item.status" :true-value="1" :false-value="0"></Checkbox>
            </Col>
            <Col>
            {{ item.text1 }}
            </Col>
            <Col>
            <InputNumber :min="1" :disabled="!item.status" v-model.trim="item.value" />
            </Col>
            <Col>
            <span class="redColor">{{ item.text2 }} </span>
            </Col>
          </Row>
        </Form>
        <div slot="footer">
          <Row type="flex" justify="end" :gutter="10">
            <Button @click="cancelAbnormal">取消</Button>
            <Button type="primary" :disabled="looKsettings" @click="saveAbnormal">保存 </Button>
          </Row>
        </div>
      </Modal>
    </keep-alive>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import Sortable from 'sortablejs';
import logisticsModeTree from '@/components/common/logisticsModeTree';
import { mapObjs, checkList, componentsModel, componentsStatus, matchRuleType, operatorType } from './ruleData';

export default {
  mixins: [Mixin, publicService, orderSys],
  components: {
    logisticsModeTree
  },
  data() {
    let v = this;
    const noEmpty = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入规则名'));
      } else {
        callback();
      }
    };
    return {
      addiblePlatform: ['shopify', 'ozon'],
      textareaCountryCodes: [],
      isChangeTreecountryCodes: false,
      modelShippingO028Loding: false,
      pageLoading: false,
      // 指定异常
      abnormalModelStatus: false,
      abnormalStatus: false,
      value2: [],
      checkList: checkList, // end
      country1Codes: [],
      countryJson: {},
      country1Json: {},
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
      smShippingMethodList: [],
      hasSite: false,
      shipmentSearchValue: null,
      shipmentPlatformModel: '',
      shippingMethodName: '', // 添加的运输类型
      shipmentPlatformSite: '',
      shipmentPlatformList: [],
      shipmentPlatformSiteList: [],
      shipmentCheckBoxModel: [],
      shipmentTagModel: [],
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
      countryData: [],
      actionParams: {
        ruleName: null,
        remark: null,
        isSupended: 0,
        isRemind: 0,
        isOrderTags: 0, // 是否添加订单标签
        orderTagId: [], // 标签id
        status: 0,
        supendedOrderReason: null,
        shipmentRemindingReason: null,
        type: 0,
        warehouseIds: null,
        matchOtherRulesSelected: true,
        warehouseIdList: [],
        onlyDistriHaveStockSelected: true,
        matchOtherRulesSelected2: true
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
      productTagList: [],
      skusStatus: false,
      skusStatus1: false,
      productCategoryListName: '',
      cursor: [],
      productCategoryList: [],
      index: 1,
      currentIndex: 0,
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
      componentsModel: componentsModel,
      componentsStatus: componentsStatus,
      autoRuleId: null,
      rules: null,
      rulesModel: [], // 右侧勾选状态
      ruleItems: null,
      actonStatus: true,
      warehouseList: [],
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
      productCategoryIdList: [],
      matchRuleType: matchRuleType,
      operatorType: operatorType,
    };
  },
  props: {
    ruleParmas: { // if obj key is type, value 0 is warehose edit, 1 audit create,  2 audit edit
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
    timestamp(n, o) {
      this.resetRuleData();
      this.getRuleDetails();
      this.getWarehouseList();
      this.addItem('productTags', 'O009', true);
      this.$nextTick(() => {
        if (this.$refs.warehouseRef) {
          this.$refs.warehouseRef.reset();
        }
      });
      this.listData = [];
      this.getStore(1); // 获取仓库列表
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
  computed: {
    modelSkusO009TXT () {
      if (this.$common.isEmpty(this.componentsModel['O009'])) return '';
      if (this.$common.isEmpty(this.componentsModel['O009'].skus)) return '';
      let arr = [];
      let nTxt = '';
      (this.$common.split(this.componentsModel['O009'].skus, ['\n', '，', ','])).forEach(txt => {
        nTxt = txt.trim();
        if (!this.$common.isEmpty(nTxt) && !arr.includes(nTxt)) {
          arr.push(nTxt);
        }
      });
      return arr.join(',');
    },
    modelSkusO026TXT () {
      if (this.$common.isEmpty(this.componentsModel['O026'])) return '';
      if (this.$common.isEmpty(this.componentsModel['O026'].skus)) return '';
      let arr = [];
      let nTxt = '';
      (this.$common.split(this.componentsModel['O026'].skus, ['\n', '，', ','])).forEach(txt => {
        nTxt = txt.trim();
        if (!this.$common.isEmpty(nTxt) && !arr.includes(nTxt)) {
          arr.push(nTxt);
        }
      });
      return arr.join(',');
    },
    modelShippingO028Txt () {
      if (this.$common.isEmpty(this.componentsModel['O028'])) return '指定邮寄方式';
      if (this.$common.isEmpty(this.componentsModel['O028'].listingParams)) return '指定邮寄方式';
      if (this.$common.isEmpty(this.componentsModel['O028'].listingParams.shippingMethodIds)) return '指定邮寄方式';
      return this.componentsModel['O028'].listingParams.shippingMethodIds.map(m => m.name).join('，');
    }
  },
  created() {
    this.getOrderListTagNew(); // 获取标签
  },
  methods: {
    distinguishLastStage(arr) {
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
    treeNormalizer(node) {
      this.$set(this.countryJson, node.zoneCode, node);
      return {
        id: node.zoneCode || 'all',
        label: node.title,
        children: node.children
      }
    },
    tree1Normalizer(node) {
      this.$set(this.country1Json, node.productCategoryId, node);
      return {
        id: node.productCategoryId || 'all',
        label: node.title,
        children: node.children
      }
    },
    onlyDistriHaveStockSelectedChange() {
      if (!this.actionParams.onlyDistriHaveStockSelected) {
        this.$nextTick(() => {
          this.actionParams.matchOtherRulesSelected2 = false;
        });
      }
    },
    changeWeight(value) {
      if (!value) {
        this.componentsModel['O025'].listingParams.volumnValue = 0;
      }
    },
    endFunc(e) { // 移动后逻辑处理
      let v = this;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      let data = v.listSortDate[oldIndex];
      v.listSortDate.splice(oldIndex, 1);
      v.listSortDate.splice(newIndex, 0, data);
    },
    getRuleCode(ruleCode, type) {
      let mapObj = {
        'O001': 'O001', // 订单来源
        'O004': 'O004', // 订单目的地
        'O009': 'O009', // 订单产品分类指定SKU和商品标签
        'O026': 'O026', // 订单产品分类指定SKU和商品标签
        'O011': 'O011', // 产品刊登标题所含关键字包含
        'O012': 'O012', // eBay订单是否包含EGD物品
        'O013': 'O013', // 货品所在地为指定国家/城市/邮编
        'O029': 'O029', // 订单收货地址街道包含指定字符串
        'W005': 'O013',
        'W006': 'O012',
        'W007': 'O011',
        'W008': 'O029',
        'W004': 'W004',
        'W003': 'O009',
        'W002': 'O004',
        'W001': 'O001',
        ...mapObjs,
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    getBackRuleCode(ruleCode, type) { // 反推 code
      let mapObj = {
        'O013': 'W005',
        'O012': 'W006',
        'O011': 'W007',
        'O029': 'W008',
        'W004': 'W004',
        'O009': 'W003',
        'O004': 'W002',
        'O001': 'W001',
        ...mapObjs,
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    resetRuleData() {
      let v = this;
      v.rulesModel = [];
      v.country1Codes = [];
      v.productCategoryIdList = [];
      v.componentsModel['O001'].platformIds = [];
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
      v.checkList.forEach((n, i) => {
        n.value = null;
        n.status = 0;
      });
      v.componentsModel['O021'] = {
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
      v.componentsModel['O024'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
      };
      v.componentsModel['O025'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          volumnValue: 0
        }
      };
      v.componentsModel['O027'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          currency: 'CNY',
          typeSelect: '1'
        }
      };
      v.componentsModel['O028'] = {
        listingParams: {
          shippingMethodIds: []
        }
      };
      v.componentsModel['O030'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          mobileLength: 0,
          condition1: 1,
          phoneLength: 0,
          condition2: 1,
          condition3: 1,
          mobilePrefixes: ''
        }
      };
      v.componentsModel['O031'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0,
          currency: 'CNY'
        }
      };
      v.componentsModel['O032'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          beginType: 0,
          beginValue: 0,
          endType: 0,
          endValue: 0
        }
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
      v.smShippingMethodList = [];
      v.hasSite = false;
      v.shipmentSearchValue = null;
      v.shipmentPlatformModel = '';
      v.shipmentPlatformSite = '';
      v.shipmentPlatformList = [];
      v.shipmentPlatformSiteList = [];
      v.shipmentCheckBoxModel = [];
      v.shipmentTagModel = [];
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
        ruleName: null,
        isSupended: 0,
        isRemind: 0,
        isOrderTags: 0, // 是否添加订单标签
        orderTagId: [], // 标签id
        status: 0,
        supendedOrderReason: null,
        shipmentRemindingReason: null,
        type: 0,
        warehouseIds: null,
        matchOtherRulesSelected: true,
        warehouseIdList: [],
        onlyDistriHaveStockSelected: true,
        matchOtherRulesSelected2: true
      };
      v.componentsModel['O004'].postalCodeType = 0;
      v.componentsModel['O005'].states = '';
      v.componentsModel['O006'].cities = '';
      v.componentsModel['O007'].amountRange = [];
      v.componentsModel['O008'] = {
        priceRange: {
          less: 0,
          more: 0,
          upperProfit: 0,
          lowerProfit: 0
        }
      };
      v.componentsModel['O009'] = {
        productCategories: [],
        skus: '',
        productTags: []
      };
      v.componentsModel['O026'] = {
        skus: ''
      };
      v.componentsModel['O010'].isEbayPlus = '1';
      v.componentsModel['O011'] = {
        productKeyword: [
          {
            value: ''
          }
        ],
        type: 0
      };
      v.componentsModel['O029'] = {
        productKeyword: [
          {
            value: ''
          }
        ]
      };
      v.componentsModel['O012'].include = '1';
      v.componentsModel['O013'] = {
        goodsCountry: '',
        goodsCity: '',
        goodsPostalCode: ''
      };
      v.componentsModel['O014'].isBuyerInBlackList = '1';
      v.componentsModel['O015'].isWishExpress = '1';
      v.componentsModel['O016'].isWishEPC = '1';
      v.componentsModel['O023'].amazonPrime = '1';
      v.componentsModel['O022'].amazonOrderType = '1';
      v.componentsModel['O017'].isWishQualityServiceOrder = '1';
      v.componentsModel['O018'].isWishALogisticsPlanOrder = '1';
      v.componentsModel['O035'].isWishOptionalAdvancedLogistics = '1';
      v.componentsModel['O036'].wishPayCustomerVatRequired = '1';
      v.componentsModel['O037'].wishEligibleForShippingReimbursement = '1';
      v.componentsModel['O020'].isVovaIsCombineOrder = '1';
      v.componentsModel['O033'].isCombinedOrder = '1';
      v.componentsModel['O034'].isTenDaysOrder = '1';
      v.componentsModel['O038'].isReturnPackage = '1';
      v.componentsModel['O039'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          phoneLength: 0,
          operator: '<',
          relevance: '&',
          matchRule: '1',
          isContains: '1',
          phoneContext: '0',
        }
      }
      v.componentsModel['O040'] = {
        listingParams: {
          checkbox1: false,
          checkbox2: false,
          mobileLength: 0,
          operator: '<',
          relevance: '&',
          matchRule: '1',
          isContains: '1',
          mobileContext: '0',
        }
      }

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
    },
    // 获取规则详情
    getRuleDetails() {
      let url;
      const type = this.ruleParmas.type;
      this.autoRuleId = this.ruleParmas.autoRuleId;
      this.oldComponentsModel = this.$common.copy(this.componentsModel);
      this.oldComponentsStatus = this.$common.copy(this.componentsStatus);
      this.$nextTick(() => {
        this.actionParams.ruleName = this.ruleParmas.name;
        this.actionParams.status = Number(this.ruleParmas.status);
      });
      if (type === 0) {
        url = api.get_warehouseRuleDetail;
      } else if (type === 2 || type === 1) {
        url = api.get_orderAutoAuditRuleDetail;
      }
      this.pageLoading = true;
      this.axios.get(url + this.autoRuleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (!this.$common.isEmpty(data.selectedRule)) {
            this.actionParams.remark = data.selectedRule.remark;
          }
          const processingData = async () => {
            const rulesResult = await this.setRulesGroup(type, data.rules);// 可选条件分组
            if (rulesResult) {
              if (data.ruleItems !== null && data.ruleItems.length > 0) {
                this.ruleItems = data.ruleItems;
                this.processingRulesItemData(data.ruleItems);
              }
              this.processingActions(data.ruleActions);
            }
            if (this.componentsModel['O028'] && this.componentsModel['O028'].listingParams) {
              this.value2 = (this.componentsModel['O028'].listingParams.shippingMethodIds || []).map(m => m.shippingId);
            }
            this.pageLoading = false;
          }
          processingData();
        }
      }).catch(() => {
        this.pageLoading = false;
      });
    },
    processingActions(ruleActions) {
      let v = this;
      if (ruleActions !== null && ruleActions.length > 0) {
        for (let i = 0; i < ruleActions.length; i++) {
          let action = ruleActions[i];
          if (action.type === 'supended') {
            v.actionParams.isSupended = Number(action.value);
          } else if (action.type === 'shipmentReminding') {
            v.actionParams.isRemind = Number(action.value);
          } else if (action.type === 'setOrderTag') {
            v.actionParams.isOrderTags = Number(action.value);
          } else if (action.type === 'setOrderTagId') {
            v.actionParams.orderTagId = action.value.split(',');
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
        }
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
            siteIds: !!v.componentsStatus['O001'].siteIds,
            saleAccountIds: !!v.componentsStatus['O001'].saleAccountIds
          });
        }
      } else if (name === 'siteIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        v.componentsStatus[code][name] = !this.looKsettings;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: true,
            saleAccountIds: !!v.componentsStatus['O001'].saleAccountIds
          });
        }
      } else if (name === 'saleAccountIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: !!v.componentsStatus['O001'].siteIds,
            saleAccountIds: true
          });
        }
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'goodsCountry') {
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCountrys();
      } else if (['goodsCity', 'goodsPostalCode'].includes(name)) {
        if (v.componentsModel[code]['goodsCountry'].length === 0 && !v.componentsStatus[code]['goodsCountry']) {
          v.$Message.error('请先选择国家');
          return false;
        }
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (['include', 'productKeyword', 'isEbayPlus', 'priceRange', 'cities', 'amountRange', 'states', 'isWishExpress', 'isWishEPC', 'isWishQualityServiceOrder', 'isWishALogisticsPlanOrder', 'isVovaIsCombineOrder', 'isBuyerInBlackList'].includes(name)) {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'skus') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'productTags') {
        if (type) {
          v.getProductTags();
        } else {
          v.componentsStatus[code][name] = !this.looKsettings;
        }
        // v.getProductTags().then(result => {
        //   if (result) {
        //     v.componentsStatus[code][name] = true;
        //   }
        // });
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
          siteIds: !!v.componentsStatus['O001'].siteIds,
          saleAccountIds: !!v.componentsStatus['O001'].saleAccountIds
        });
      } else if (name === 'shopSku') {
        v.componentsStatus[code][name] = !this.looKsettings;
      } else if (name === 'listingParams') {
        if (this.looKsettings) return;
        v.modelShippingO028Loding = true;
        v.componentsStatus[code][name] = !this.looKsettings;
        v.getCurrencyInfo();
      } else {
        v.componentsStatus[code][name] = !this.looKsettings;
      }
    },
    validCategoryIdMt(selectId) {
      let v = this;
      // 这里是为了处理原本A父类有2个子类 全选，后面A父类添加了一个子类但是因为父Id传过去了 全选问题
      let arr = v.productCategoryTree[0].children;

      function makeTree(a) {
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
    setTreeDate(selectId) {
      let v = this;
      let arr = v.productCategoryTree[0].children;
      let item = [];

      function makeTree(a) {
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
    getShipment(type) { // 获取运输类型平台
      let v = this;
      v.getEnablePlatform().then(data => {
        v.shipmentPlatformList = data;
        v.getShimentSites(v.componentsModel['O001'].platformIds, type);
      });
    },
    getShimentSites(platformArr, type = {}) { // 站点获取
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
          if (v.componentsModel['O001'].siteIds && v.componentsModel['O001'].siteIds.length > 0 && v.componentsModel['O001'].siteIds.includes(n.siteId)) {
            hasSiteIds.push(n.siteId);
          }
        });
        v.sitesList = sitesArr;
        if (hasSiteIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['O001'].siteIds = hasSiteIds;
          });
        } else {
          v.componentsModel['O001'].siteIds = [];
        }
      } else {
        v.componentsModel['O001'].siteIds = [];
      }
      if (v.platformAccountList.length > 0) {
        let hasSaleAccountIds = []; // 还存在的账号
        v.platformAccountList.forEach(i => {
          if (v.componentsModel['O001'].saleAccountIds && v.componentsModel['O001'].saleAccountIds.length > 0 && v.componentsModel['O001'].saleAccountIds.includes(i.saleAccountId)) {
            hasSaleAccountIds.push(i.saleAccountId);
          }
        });
        if (hasSaleAccountIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['O001'].saleAccountIds = hasSaleAccountIds;
          });
        } else {
          v.componentsModel['O001'].saleAccountIds = [];
        }
      } else {
        v.componentsModel['O001'].saleAccountIds = [];
      }
      v.componentsStatus['O001'].siteIds = !!type.siteIds;
      v.componentsStatus['O001'].saleAccountIds = !!type.saleAccountIds;
    },
    setTagValue(checkboxArr) { // 运输类型产生tag
      let v = this;
      let arr = [];
      for (let i = 0; i < checkboxArr.length; i++) {
        if (checkboxArr[i].split(':').length > 3) {
          // 有站点
          let prefix = checkboxArr[i].split(':')[0];
          let item = checkboxArr[i].split(':')[3];
          for (let t = 0; t < v.smShippingMethodList.length; t++) {
            let subItem = v.smShippingMethodList[t];
            if (item === subItem.shippingMethodName && !v.shipmentTagModel.includes(prefix + ':' + subItem.siteName + ':' + subItem.shippingMethodDescription)) {
              arr.push(prefix + ':' + subItem.siteName + ':' + subItem.shippingMethodDescription);
            }
            if (i === checkboxArr.length - 1 && t === v.smShippingMethodList.length - 1) {
              v.shipmentTagModel = [...v.shipmentTagModel, ...arr];
            }
          }
        } else {
          let prefix = checkboxArr[i].split(':')[0];
          let item = checkboxArr[i].split(':')[1].split(':')[0];
          for (let t = 0; t < v.smShippingMethodList.length; t++) {
            let subItem = v.smShippingMethodList[t];
            if (item === subItem.shippingMethodName && !v.shipmentTagModel.includes(prefix + ':' + subItem.shippingMethodDescription)) {
              arr.push(prefix + ':' + subItem.shippingMethodDescription);
            }
            if (i === checkboxArr.length - 1 && t === v.smShippingMethodList.length - 1) {
              v.shipmentTagModel = [...v.shipmentTagModel, ...arr];
            }
          }
        }
      }
    },
    getSite(val) { // 获取站点
      let v = this;
      v.shipmentPlatformSiteList = [];
      v.shipmentPlatformSite = '';
      v.shipmentSearchValue = '';
      for (let i = 0; i < v.shipmentPlatformList.length; i++) {
        let item = v.shipmentPlatformList[i];
        if (item.platformId === val && item.sites.length > 0) {
          v.hasSite = true;
          v.getSmShippingMethod(val, item.sites[0].siteId, item.sites[0].cnName);
          v.$nextTick(function () {
            v.shipmentPlatformSiteList = item.sites;
            v.shipmentPlatformSite = item.sites[0].siteId;
          });
        } else if (item.platformId === val && item.sites.length === 0) {
          v.hasSite = false;
          v.shipmentPlatformSiteList = [];
          v.getSmShippingMethod(val);
        }
      }
      if (v.addiblePlatform.includes(v.shipmentPlatformModel)) {
        setTimeout(() => {
          v.shipmentSearch();
        }, 10);
      }
    },
    delTag(index) { // 删除标签
      let v = this;
      v.shipmentCheckBoxModel.splice(index, 1);
      v.shipmentTagModel.splice(index, 1);
    },
    tagColor(item) {
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
    shipmentSearch () {
      let v = this;
      let siteName = v.shipmentPlatformSiteList.find(i => i.siteId === v.shipmentPlatformSite);
      siteName = this.$common.isEmpty(siteName) ? '' : siteName.cnName;
      v.getSmShippingMethod(v.shipmentPlatformModel, v.shipmentPlatformSite, siteName);
    },
    setSite(val) {
      let siteName = this.shipmentPlatformSiteList.find(i => i.siteId === val);
      siteName = this.$common.isEmpty(siteName) ? '' : siteName.cnName;
      this.getSmShippingMethod(this.shipmentPlatformModel, val, siteName);
    },
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
      this.smShippingMethodList = [];
      this.axios.get(api.get_queryShippingMethod, {
        params: objParam
      }).then(response => {
        if (response.data.code === 0) {
          let newRes = response.data.datas.map(i => {
            if (siteId) {
              i.siteId = siteId;
              i.siteName = siteName;
            }
            return i;
          });
          if (!this.$common.isEmpty(this.shipmentSearchValue)) {
            this.smShippingMethodList = newRes.filter(item => {
              return item.shippingMethodDescription.toLowerCase().indexOf(this.shipmentSearchValue.toLowerCase()) > -1;
            });
          } else {
            this.smShippingMethodList = this.$common.copy(newRes);
          }
          if (platformId === 'shopify') {
            this.shipmentTagModel.forEach(item => {
              if (this.smShippingMethodList) {
                let valid = this.smShippingMethodList.some(item1 => {
                  return item.split(':')[1] === item1.shippingMethodName;
                });
                if (!valid && item.split(':')[0] === 'shopify') {
                  this.smShippingMethodList.unshift({
                    shippingMethodDescription: item.split(':')[1],
                    shippingMethodName: item.split(':')[1]
                  });
                }
              }
            });
          }

          let value = JSON.parse(JSON.stringify(this.shipmentCheckBoxModel));
          this.shipmentCheckBoxModel = [];
          this.shipmentCheckBoxModel = value;
        }
      });
    },
    processingRulesItemData(data) { // 加载时处理已选条件
      let v = this;
      let platArr = [];
      let sitesArr = [];
      let accountArr = [];
      let checkListArr = [];
      for (let i = 0; i < data.length; i++) { // 已选条件遍历
        let item = data[i];
        let rc = v.getRuleCode(item.ruleCode);
        for (let m = 0; m < v.rules.length; m++) { // 遍历该规则能设置的条件有哪些
          let rItem = v.rules[m];//
          if (rc === v.getRuleCode(rItem.id)) { // 匹配
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
                if (bItem.name === oItem.name) { // 循环已保存规则并插入 ????
                  if (['O013', 'O012', 'O010', 'O014', 'O015', 'O016', 'O023', 'O022', 'O017', 'O018', 'O020', 'O033', 'O034', 'O035', 'O036', 'O037', 'O038'].includes(rc)) { // 如果是单选
                    subObj.value = bItem.value;
                  } else { // 如果是多选
                    if (subObj.hasOwnProperty('autoRuleParamValues')) {
                      subObj.autoRuleParamValues.push(bItem.ruleItemParamValues);
                    } else {
                      subObj.autoRuleParamValues = bItem.ruleItemParamValues;
                    }
                  }
                }
                if (!['O013', 'O012', 'O010', 'O008', 'O006', 'O005', 'O011', 'O004', 'O003', 'W004', 'O001', 'O002', 'O014', 'O015', 'O016', 'O023', 'O022', 'O017', 'O018', 'O019', 'O020', 'O021', 'O024', 'O025', 'O027', 'O028', 'O029', 'O030', 'O031', 'O032', 'O033', 'O034', 'O035', 'O036', 'O037', 'O038', 'O039', 'O040'].includes(rc)) {
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
                      v.getProductCategoryName(arr);
                    }
                  }
                } else if (rc === 'O021') {
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
                } else if (rc === 'O024') {
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
                  }
                } else if (rc === 'O025') {
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
                  } else if (bItem.name === 'volumnValue') {
                    v.componentsModel[rc]['listingParams'].volumnValue = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox3 = true;
                  }
                } else if (rc === 'O027') {
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
                  } else if (bItem.name === 'typeSelect') {
                    v.componentsModel[rc]['listingParams'].typeSelect = bItem.value;
                  }
                } else if (rc === 'O028') {
                  if (bItem.name === 'shippingMethodIds') {
                    // v.componentsModel[rc]['listingParams'].shippingMethodIds = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].shippingMethodIds = (bItem.ruleItemParamValues || []).map(i => {
                      return {
                        carrierId: i.value.split(',')[0],
                        shippingId: i.value.split(',')[1],
                        name: i.value.split(',')[2]
                      };
                    });
                  }
                } else if (rc === 'O030') {
                  if (bItem.name === 'mobileLength') {
                    v.componentsModel[rc]['listingParams'].mobileLength = Number(bItem.value);
                  } else if (bItem.name === 'condition1') {
                    v.componentsModel[rc]['listingParams'].condition1 = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox1 = true;
                  } else if (bItem.name === 'condition2') {
                    v.componentsModel[rc]['listingParams'].condition2 = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox2 = true;
                  } else if (bItem.name === 'condition3') {
                    v.componentsModel[rc]['listingParams'].condition3 = Number(bItem.value);
                    v.componentsModel[rc]['listingParams'].checkbox3 = true;
                  } else if (bItem.name === 'phoneLength') {
                    v.componentsModel[rc]['listingParams'].phoneLength = Number(bItem.value);
                  } else if (bItem.name === 'mobilePrefixes') {
                    v.componentsModel[rc]['listingParams'].mobilePrefixes = bItem.value;
                  }
                } else if (rc === 'O031') {
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
                } else if (rc === 'O032') {
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
                  }
                } else if (rc === 'O002') {
                  if (!(bItem.name === 'warehouseIds' && oItem.name === 'warehouseIds')) return
                  let fun = (list, type) => {
                    let [arr, arrIds] = [[], []];
                    list.forEach((n, i) => {
                      bItem.ruleItemParamValues.forEach((m, t) => {
                        if (n.warehouseId === m.value) {
                          type == 2 && arr.push(n.warehouseName);
                          type == 1 && arrIds.push(m.value);
                        }
                      });
                    });
                    type == 2 && (v.warehouseIdsName = arr);
                    type == 1 && (v.componentsModel[rc][bItem.name] = arrIds);
                  }

                  // 从对应权限的仓库列表中取仓库id
                  let storeList = v.storeList || [];
                  if (!storeList.length) {
                    v.getStore(1).then(res => {
                      if (res) fun(v.storeList, 1); ;
                    });
                  } else {
                    fun(storeList, 1);
                  }

                  // 从所有仓库中取仓库名(涉及权限，只能查看，不能编辑)
                  let allStorelist = v.allStorelist || [];
                  if (!allStorelist.length) {
                    v.getAllstore(0).then(res => {
                      if (res) fun(v.allStorelist, 2); ;
                    });
                  } else {
                    fun(allStorelist, 2);
                  }
                } else if (rc === 'O008') {
                  if (bItem.name === 'less') {
                    v.componentsModel[rc]['priceRange'].less = Number(bItem.value);
                  } else if (bItem.name === 'more') {
                    v.componentsModel[rc]['priceRange'].more = Number(bItem.value);
                  } else if (bItem.name === 'lowerProfit') {
                    v.componentsModel[rc]['priceRange'].lowerProfit = Number(bItem.value);
                  } else {
                    v.componentsModel[rc]['priceRange'].upperProfit = Number(bItem.value);
                  }
                } else if (rc === 'O011') {
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
                } else if (rc === 'O029') {
                  if (bItem.name === 'addresses' && oItem.name === 'addresses') {
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
                } else if (rc === 'O001') { // 订单来源处理
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
                                v.componentsModel[rc][bItem.name] = sitesArr;
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
                              v.getSalesAccountName(obj).then(res => {
                                let arr = [];
                                let arrIds = [];
                                res.forEach((n, i) => {
                                  arr.push(n.accountCode);
                                  arrIds.push(n.saleAccountId);
                                });
                                v.source[bItem.name] = arr;
                                v.componentsModel[rc][bItem.name] = accountArr;
                              });
                            }
                          }
                        });
                      }
                    }
                  }
                } else if (rc === 'O003') {
                  if (bItem.name === 'shipmentTypes' && oItem.name === 'shipmentTypes') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let tagArr = [];
                    val.forEach((obj, i) => {
                      let n = JSON.parse(obj.value);
                      if (n.siteId) {
                        arr.push(n.platformId + ':' + n.siteId + ':' + n.siteName + ':' + n.shipmentName + ':' + n.shipmentDesc);
                        tagArr.push(n.platformId + ':' + n.siteName + ':' + n.shipmentDesc);
                      } else {
                        arr.push(n.platformId + ':' + n.shipmentName + ':' + n.shipmentDesc);
                        tagArr.push(n.platformId + ':' + n.shipmentDesc);
                      }
                    });
                    v.shipmentCheckBoxModel = arr;
                    v.shipmentTagModel = tagArr;
                  }
                } else if (rc === 'O004') {
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
                    if (v.componentsModel['O004'].postalCodeType === 0) {
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
                } else if (rc === 'W004') {
                  if (bItem.name === 'start' && oItem.name === 'start') {
                    v.shopSkuModel = 0;
                    v.shopSku.start = bItem.value;
                  } else if (bItem.name === 'end' && oItem.name === 'end') {
                    v.shopSkuModel = 1;
                    v.shopSku.end = bItem.value;
                  }
                } else if (rc === 'O019') {
                  if (!checkListArr.includes(bItem.name)) {
                    checkListArr.push(bItem.name);
                    let index = v.checkList.findIndex(n => {
                      return n.name === bItem.name;
                    });
                    if (index >= 0) {
                      v.checkList[index].status = 1;
                      v.checkList[index].value = Number(bItem.value);
                    }
                  }
                } else if (['O039', 'O040'].includes(rc)) {
                  let typeTemp = {
                    'O039': {
                      checkList1: ['phoneLength', 'operator', 'relevance'],
                      checkList2: ['matchRule', 'isContains', 'phoneContext'],
                    },
                    'O040': {
                      checkList1: ['mobileLength', 'operator', 'relevance'],
                      checkList2: ['matchRule', 'isContains', 'mobileContext'],
                    },
                  }
                  const checkList1 = typeTemp[rc].checkList1;
                  const checkList2 = typeTemp[rc].checkList2;
                  if ([...checkList1, ...checkList2].includes(bItem.name)) {
                    let value = ['phoneLength', 'mobileLength'].includes(bItem.name) ? Number(bItem.value) : bItem.value;
                    v.componentsModel[rc]['listingParams'][bItem.name] = value;
                  }
                  if (checkList1.includes(bItem.name)) {
                    v.componentsModel[rc]['listingParams'].checkbox1 = true;
                  }
                  if (checkList2.includes(bItem.name)) {
                    v.componentsModel[rc]['listingParams'].checkbox2 = true;
                  }
                } else {
                  v.componentsModel[rc][bItem.name] = bItem.value;
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
    deleteShipMethod(shipId, index) {
      let v = this;
      if (shipId === undefined) {
        v.smShippingMethodList.splice(index, 1);
        v.$Message.success('操作成功');
        return;
      }
      v.axios.delete(api.delete_merchantShippingMethod + shipId).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.shipmentSearch();
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    saveShopifyLogisticsMode() {
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
          v.shipmentSearch();
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    setRulesGroup(type, data) { // 分组
      // // 调试 start
      // let obj = {
      //   display: "匹配退件包裹订单：<span style='color: #0054A6; text-decoration: underline;'>是/否</span>",
      //   group: "Otto",
      //   groupDescription: "Otto",
      //   id: "O038",
      //   items: [{ valueType: 0, name: "isReturnPackage ", text: "1：是 0：否", type: "SELECT" }],
      //   order: 1,
      //   url: "HUE",
      // }
      // data.push(obj);
      // // 调试 end
      let v = this;
      return new Promise(resolve => {
        if (data.length && data[0].group === null) { // 没有分组
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            data[i].uid = v.getRuleCode(item.id);
            if (i === data.length - 1) {
              v.rules = data;
              resolve(true);
            }
          }
        } else { // 有分组
          let obj = {};
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            data[i].uid = v.getRuleCode(item.id);
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
    changeValue(val, item) { // 下拉多选，如果选择全部，则干掉其他选项
      let v = this;
      let value = v.componentsModel[val][item];
      if (value.indexOf('all') >= 0) {
        v.componentsModel[val][item] = ['all'];
      }
    },
    handleSubmit() {
      let v = this;
      let valid = true;
      // let status = false;// 判定是否校验完成

      return new Promise((resolve, reject) => {
        if (this.actionParams.ruleName === '') {
          this.$Message.error('规则名不能为空');
          this.loading = false;
          reject(new Error('规则名不能为空'));
          return false;
        }
        if (!this.$common.isEmpty(this.actionParams.remark) && this.actionParams.remark.length > 200) {
          v.$Message.error('备注不能超过200字符长度');
          v.loading = false;
          reject(new Error('备注不能超过200字符长度'));
          return false;
        }
        let arr = [];
        for (let item in v.componentsStatus) { // 扫componentsStatus 的key
          let subArr = [];// autoRuleParams
          let changeItem = v.getRuleCode(item);
          let sub = v.componentsStatus[changeItem];
          if (changeItem === 'O019') {
            v.checkList.forEach((n, i) => {
              if (n.status === 1) {
                subArr.push({
                  name: n.name,
                  type: 0,
                  value: n.value
                });
              }
            });
          }
          for (let subItem in sub) { // 扫componentsStatus 的key 里面对象的key,获取当前业务类型
            let child = sub[subItem];
            for (let u = 0; u < v.rulesModel.length; u++) { // 检查选定的已选条件
              let ruleItem = v.rulesModel[u];
              if (ruleItem === item) { // 勾选有效， 做值校验
                if (changeItem === 'O001' && v.componentsModel[changeItem]['platformIds'].length === 0) {
                  v.$Message.error('已选条件下订单来源指定平台不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O002' && v.componentsModel[changeItem]['warehouseIds'].length === 0) {
                  v.$Message.error('已选条件下指定仓库不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O003' && v.shipmentTagModel.length === 0) {
                  v.$Message.error('已选条件下运输类型不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O004' && v.componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下订单目的地指定国家不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'W004' && v.shopSkuModel === null) {
                  v.$Message.error('请选择店铺SKU规则开头或者结束');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'W004' && v.shopSkuModel !== null) {
                  if (v.shopSkuModel === 0 && v.shopSku.start === '') {
                    v.$Message.error('店铺SKU开头内容不能为空');
                    v.loading = false;
                    valid = false;
                  } else if (v.shopSkuModel === 1 && v.shopSku.end === '') {
                    v.$Message.error('店铺SKU结尾内容不能为空');
                    v.loading = false;
                    valid = false;
                  }
                } else if (changeItem === 'O005' && v.componentsModel[changeItem]['states'] === '') {
                  v.$Message.error('已选条件下指定洲/省不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O006' && v.componentsModel[changeItem]['cities'] === '') {
                  v.$Message.error('已选条件下订单收货地址城市不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O008' && (v.componentsModel[changeItem]['priceRange'].lowerProfit === '' && v.componentsModel[changeItem]['priceRange'].upperProfit === '')) {
                  v.$Message.error('已选条件下订单利润不能都为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O009' && (v.componentsModel[changeItem]['productCategories'].length === 0 && v.componentsModel[changeItem]['skus'] === '' && v.componentsModel[changeItem]['productTags'].length === 0)) {
                  v.$Message.error('已选条件下订单产品分类指定SKU和商品标签不能都为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O026' && (v.componentsModel[changeItem]['skus'] === '')) {
                  v.$Message.error('已选条件下订单指定SKU不能都为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O011' && (v.componentsModel[changeItem].productKeyword.length === 0 || v.componentsModel[changeItem].productKeyword[0].value === '')) {
                  v.$Message.error('已选条件下产品刊登标题所含关键字不能为空');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O021' && ((v.componentsModel[changeItem].listingParams.currency === null || v.componentsModel[changeItem].listingParams.currency === '') || (!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('joom 商品总金额请指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O024' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('订单货品总数量请指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O025' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('订单重量请指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O027' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('订单预估利润请指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O028' && ((!v.componentsModel[changeItem].listingParams.shippingMethodIds.length === 0))) {
                  v.$Message.error('订单的邮寄方式为指定邮寄方式');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O029' && (v.componentsModel[changeItem].productKeyword.length === 0 || v.componentsModel[changeItem].productKeyword[0].value === '')) {
                  v.$Message.error('订单收货地址街道包含指定字符串');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O030' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2 && !v.componentsModel[changeItem].listingParams.checkbox3))) {
                  v.$Message.error('订单收件人电话要求指定条件');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O031' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('买家支付的运费指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O032' && ((!v.componentsModel[changeItem].listingParams.checkbox1 && !v.componentsModel[changeItem].listingParams.checkbox2))) {
                  v.$Message.error('订单交易货品总数量指定范围');
                  v.loading = false;
                  valid = false;
                } else if (changeItem === 'O013' && (v.componentsModel[changeItem]['goodsCountry'] === '' || v.componentsModel[changeItem].goodsCity === '' || v.componentsModel[changeItem].goodsCity === null || v.componentsModel[changeItem]['goodsCountry'] === null)) {
                  v.$Message.error('已选条件下货品所在地所在国家和城市不能为空');
                  v.loading = false;
                  valid = false;
                } else if (['O039', 'O040'].includes(changeItem)) {
                  const checkbox1 = v.componentsModel[changeItem].listingParams.checkbox1;
                  const checkbox2 = v.componentsModel[changeItem].listingParams.checkbox2;
                  let typeList = {
                    'O039': {
                      msg: '电话',
                      params1: 'phoneLength',
                      params2: 'phoneContext',
                    },
                    'O040': {
                      msg: '手机',
                      params1: 'mobileLength',
                      params2: 'mobileContext',
                    }
                  }
                  let flag = false;
                  const params1 = v.componentsModel[changeItem].listingParams[typeList[changeItem].params1];
                  const params2 = v.componentsModel[changeItem].listingParams[typeList[changeItem].params2];
                  if (!(checkbox1 || checkbox2)) {
                    v.$Message.error(`已选条件下订单收件人${typeList[changeItem].msg}要求不能为空`);
                    flag = true;
                  } else if (checkbox1 && !(params1 || params1 === 0)) {
                    v.$Message.error(`字符长度不能为空`);
                    flag = true;
                  } else if (checkbox2 && !(params2 || params2 === 0)) {
                    v.$Message.error(`前缀包含内容不能为空`);
                    flag = true;
                  }
                  if (flag) {
                    v.loading = false;
                    valid = false;
                  }
                }
                // status = true;// 设置校验完毕
                if (child || (v.componentsModel[changeItem][subItem] && v.componentsModel[changeItem][subItem].length > 0) || changeItem === 'O008' || changeItem === 'O007' || changeItem === 'O003' || changeItem === 'W004' || changeItem === 'O021' || changeItem === 'O024' || changeItem === 'O025' || changeItem === 'O027' || changeItem === 'O028' || changeItem === 'O030' || changeItem === 'O031' || changeItem === 'O032' || changeItem === 'O039' || changeItem === 'O040') { // 这块代码虽然没BUG，但业务代码处理不太好，以后有时间要修改下 #001
                  if (changeItem !== 'O013' && changeItem !== 'O012' && changeItem !== 'O011' && changeItem !== 'O029' && changeItem !== 'O010' && changeItem !== 'O008' && changeItem !== 'O006' && changeItem !== 'O007' && changeItem !== 'O005' && changeItem !== 'O003' && changeItem !== 'W004' && changeItem !== 'O014' && changeItem !== 'O015' && changeItem !== 'O016' && changeItem !== 'O023' && changeItem !== 'O022' && changeItem !== 'O017' && changeItem !== 'O018' && changeItem !== 'O020' && changeItem !== 'O021' && changeItem !== 'O024' && changeItem !== 'O025' && changeItem !== 'O027' && changeItem !== 'O028' && changeItem !== 'O030' && changeItem !== 'O031' && changeItem !== 'O032' && changeItem !== 'O033' && changeItem !== 'O034' && changeItem !== 'O035' && changeItem !== 'O036' && changeItem !== 'O037' && changeItem !== 'O038' && changeItem !== 'O039' && changeItem !== 'O040') { // 根据业务类型和接口规则进行拼接处理
                    let childArr = [];
                    let subItemList = v.componentsModel[changeItem][subItem];
                    if (subItem !== 'buyerPostalCodes' && subItemList && subItemList.length > 0) {
                      if (subItem === 'skus') {
                        // subItemList = v.sepCommasFn(v.componentsModel[changeItem][subItem]);
                        if (v.$common.isUndefined(v[`modelSkus${changeItem}TXT`])) {
                          subItemList = v.sepCommasFn(v.componentsModel[changeItem][subItem]);
                        } else {
                          subItemList = v[`modelSkus${changeItem}TXT`].split(',');
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
                    // if (changeItem === 'O004' && subItem === 'buyerPostalCodes' && v.postcodeOne !== '') {
                    if (changeItem === 'O004' && subItem === 'buyerPostalCodes' && v.componentsModel[changeItem].postalCodeType === 0) {
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
                        value: v.componentsModel[changeItem].postalCodeType
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
                    } else if (changeItem === 'O004' && subItem === 'buyerPostalCodes' && v.componentsModel[changeItem].postalCodeType === 1 && v.postcodeArea !== '') {
                      let arr = [];
                      let postcodeArea = v.postcodeArea.split(',');
                      subArr.push({
                        name: 'postalCodeType',
                        type: 0,
                        value: v.componentsModel[changeItem].postalCodeType
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
                  } else if (changeItem === 'O011' && v.componentsModel[changeItem][subItem].length > 0 && v.componentsModel[changeItem][subItem].value !== '') {
                    let arr = [];
                    subArr.push({
                      name: 'containsType',
                      type: 0,
                      value: v.componentsModel[changeItem].type
                    });
                    if (v.componentsModel[changeItem][subItem].length > 0 && v.componentsModel[changeItem][subItem][0].value !== '') {
                      for (let i = 0; i < v.componentsModel[changeItem][subItem].length; i++) {
                        let keyItem = v.componentsModel[changeItem][subItem][i].value;
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
                  } else if (changeItem === 'O029' && v.componentsModel[changeItem][subItem].length > 0 && v.componentsModel[changeItem][subItem].value !== '') {
                    let arr = [];
                    if (v.componentsModel[changeItem][subItem].length > 0 && v.componentsModel[changeItem][subItem][0].value !== '') {
                      for (let i = 0; i < v.componentsModel[changeItem][subItem].length; i++) {
                        let keyItem = v.componentsModel[changeItem][subItem][i].value;
                        if (keyItem !== '') {
                          arr.push({
                            value: keyItem
                          });
                        }
                      }
                      let obj = {
                        name: 'addresses',
                        type: 1,
                        autoRuleParamValues: arr
                      };
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'O021') {
                    let list = [];
                    let zip = v.componentsModel['O021'].listingParams;
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
                  } else if (changeItem === 'O024') {
                    let list = [];
                    let zip = v.componentsModel['O024'].listingParams;
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
                  } else if (changeItem === 'O025') {
                    let list = [];
                    let zip = v.componentsModel['O025'].listingParams;
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
                        name: 'volumnValue',
                        type: 0,
                        value: zip.volumnValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O027') {
                    let list = [];
                    let zip = v.componentsModel['O027'].listingParams;
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
                    if (zip.currency) {
                      list.push({
                        name: 'currency',
                        type: 0,
                        value: zip.currency
                      });
                    }
                    if (zip.typeSelect) {
                      list.push({
                        name: 'typeSelect',
                        type: 0,
                        value: zip.typeSelect
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O028') {
                    let list = [];
                    let zip = v.componentsModel['O028'].listingParams;
                    if (zip.shippingMethodIds) {
                      let values = zip.shippingMethodIds.map(i => {
                        return {
                          value: i.carrierId + ',' + i.shippingId + ',' + i.name
                        };
                      });
                      list.push({
                        name: 'shippingMethodIds',
                        type: 1,
                        autoRuleParamValues: values
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O030') {
                    let list = [];
                    let zip = v.componentsModel['O030'].listingParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'condition1',
                        type: 0,
                        value: zip.condition1
                      }, {
                        name: 'mobileLength',
                        type: 0,
                        value: zip.mobileLength
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'condition2',
                        type: 0,
                        value: zip.condition2
                      }, {
                        name: 'phoneLength',
                        type: 0,
                        value: zip.phoneLength
                      });
                    }
                    if (zip.checkbox3) {
                      list.push({
                        name: 'condition3',
                        type: 0,
                        value: zip.condition3
                      }, {
                        name: 'mobilePrefixes',
                        type: 0,
                        value: zip.mobilePrefixes
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O031') {
                    let list = [];
                    let zip = v.componentsModel['O031'].listingParams;
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
                    if (zip.currency) {
                      list.push({
                        name: 'currency',
                        type: 0,
                        value: zip.currency
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O032') {
                    let list = [];
                    let zip = v.componentsModel['O032'].listingParams;
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
                  } else if (changeItem === 'O008') {
                    let mtItem = v.componentsModel[changeItem][subItem];
                    if (mtItem.less === 1) {
                      subArr.push({
                        name: 'less',
                        type: 0,
                        value: 1
                      });
                      subArr.push({
                        name: 'lowerProfit',
                        type: 0,
                        value: mtItem.lowerProfit
                      });
                    }
                    if (mtItem.more === 1) {
                      subArr.push({
                        name: 'more',
                        type: 0,
                        value: 1
                      });
                      subArr.push({
                        name: 'upperProfit',
                        type: 0,
                        value: mtItem.upperProfit
                      });
                    }
                  } else if (changeItem === 'O003') {
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
                      shippingArr.push({ value: JSON.stringify(obj) });
                      if (i === v.shipmentCheckBoxModel.length - 1) {
                        subArr.push({
                          name: 'shipmentTypes',
                          type: 1,
                          autoRuleParamValues: shippingArr
                        });
                      }
                    }
                  } else if (changeItem === 'O007') {
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
                  } else if (changeItem === 'W004') {
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
                  } else if (changeItem === 'O039') {
                    let list = [];
                    let zip = v.componentsModel[changeItem].listingParams;

                    if (zip.checkbox1) {
                      list.push({
                        name: 'operator',
                        type: 0,
                        value: zip.operator
                      }, {
                        name: 'phoneLength',
                        type: 0,
                        value: zip.phoneLength
                      }, {
                        name: 'relevance',
                        type: 0,
                        value: zip.relevance
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'matchRule',
                        type: 0,
                        value: Number(zip.matchRule)
                      }, {
                        name: 'isContains',
                        type: 0,
                        value: Number(zip.isContains)
                      }, {
                        name: 'phoneContext',
                        type: 0,
                        value: zip.phoneContext
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'O040') {
                    let list = [];
                    let zip = v.componentsModel[changeItem].listingParams;
                    if (zip.checkbox1) {
                      list.push({
                        name: 'operator',
                        type: 0,
                        value: zip.operator
                      }, {
                        name: 'mobileLength',
                        type: 0,
                        value: zip.mobileLength
                      }, {
                        name: 'relevance',
                        type: 0,
                        value: zip.relevance
                      });
                    }
                    if (zip.checkbox2) {
                      list.push({
                        name: 'matchRule',
                        type: 0,
                        value: Number(zip.matchRule)
                      }, {
                        name: 'isContains',
                        type: 0,
                        value: Number(zip.isContains)
                      }, {
                        name: 'mobileContext',
                        type: 0,
                        value: zip.mobileContext
                      });
                    }
                    subArr = list;
                  } else {
                    let obj = {
                      name: subItem,
                      type: 0,
                      value: v.componentsModel[changeItem][subItem]
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  }
                }
              }
            }
          }

          if (subArr.length > 0) { // 如果有值， 组成数据
            let itemObj = {
              ruleCode: v.ruleParmas.type === 0 ? v.getBackRuleCode(item) : item,
              autoRuleParams: subArr
            };
            arr.push(itemObj);
          }
        }

        resolve([valid, arr]);
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
    saveButton() {
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
            if (v.ruleParmas.editType === 'add') {
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
              if (v.actionParams.isSupended === 0 && v.actionParams.isRemind === 0 && v.actionParams.isOrderTags === 0) {
                v.$Message.error('截留订单和发货提醒和订单标签至少有一个要启用');
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
              if (v.actionParams.isOrderTags === 1 && (v.actionParams.orderTagId === null || v.actionParams.orderTagId.length === 0)) {
                v.$Message.error('订单标签不能为空');
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
                  type: 'setOrderTag',
                  value: v.actionParams.isOrderTags
                }, {
                  type: 'setOrderTagId',
                  value: v.actionParams.orderTagId.join(',')
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
          obj.remark = this.actionParams.remark;
          v.axios[postType](url, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.closeRuleModal(1);
            }
            v.loading = false;
          }).catch(() => {
            v.loading = false;
          });
        }
      });
    },
    closeRuleModal(val) {
      this.loading = false;
      this.$emit('closeModal', val);
    },
    handleAdd() {
      this.index++;
      this.componentsModel['O011'].productKeyword.push({
        value: ''
      });
    },
    handleRemove(index) {
      this.componentsModel['O011'].productKeyword.splice(index, 1);
    },

    handleAddCharacter() {
      this.currentIndex++;
      this.componentsModel['O029'].productKeyword.push({
        value: ''
      });
    },
    handleRemoveCharacter(index) {
      this.componentsModel['O029'].productKeyword.splice(index, 1);
    },

    getProductCategory() { // 获取商品分类
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
    getProductTags() {
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
    getProductCategoryName(idArr) {
      let v = this;
      let arr = [];
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
        }
      });
    },
    openTree() {
      this.isChangeTreecountryCodes = true;
    },
    closeTree() {
      this.isChangeTreecountryCodes = false;
    },
    getTreeData(val) {
      const allText = Object.values(this.countryJson).map(m => m.title);
      const otherText = this.textareaCountryCodes.filter(t => !allText.includes(t));
      let treeVal = [];
      let treeText = [];
      this.isChangeTreecountryCodes = true;
      setTimeout(() => {
        this.isChangeTreecountryCodes = false;
      }, 500);
      if (val.length === 0) {
        this.textareaCountryCodes = otherText;
        this.componentsModel['O004'].countryCodes = treeVal;
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
      this.componentsModel['O004'].countryCodes = treeVal;
    },
    getTree1Data(val) {
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
        this.componentsModel['O009'].productCategories = treeVal;
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
      this.componentsModel['O009'].productCategories = treeVal;
    },
    getCommonCountryName(selectArr) { // 获取对应国家名字
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

        function makeTreeName(data) {
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
    getCommonCountry(selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
        function makeTree(data) {
          if (!selectArr) selectArr = [];
          let arr = [
            {
              title: '全部',
              check: false,
              expand: true
            }
          ];

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
            arr[0].children.push(obj);
          });
          v.countryCodes = [];
          v.$nextTick(function () {
            // 默认选择值
            v.$nextTick(() => {
              v.countryCodes = selectArr.map(val => val.value);
            });
            v.countryData = arr;
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
    getPostCodeType(value) {
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
    addPostcodeFn() {
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
    deletePostcodeFn(index) {
      this.postcodeArr.splice(index, 1);
    },
    getWarehouseList() { // 获取开启权重的仓库列表
      let v = this;
      v.axios.get(api.wmsService + api.query_warehouse + '?enableAreaWeight=1').then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseList = data;
          }
        }
      });
    },
    changeData(val) {
      let v = this;
      let arr = [];
      if (val.length > 0) {
        val.forEach(i => {
          v.warehouseList.forEach(j => {
            if (i === j.warehouseId) {
              arr.push(j);
            }
          });
        });
      }
      v.listData = arr;
      v.listSortDate = v.deepCopy(arr);
      let el = this.$refs.dragable1.$children[1].$el.children[1];
      Sortable.create(el, {
        onEnd: v.endFunc
      });
    },
    showAbnormal() {
      let v = this;
      v.abnormalStatus = true;
      v.$nextTick(function () {
        v.abnormalModelStatus = true;
      });
    },
    cancelAbnormal() {
      let v = this;
      v.abnormalModelStatus = false;
    },
    saveAbnormal() {
      let v = this;
      v.abnormalModelStatus = false;
    },
    // 数据加载完成
    logisticsTreeloaded () {
      this.modelShippingO028Loding = false;
    },
    // 邮寄方式改变时
    getAccountApi(value) {
      this.carrierAccount = [];
      if (this.$common.isEmpty(value.parentNode)) {
        this.$set(this.componentsModel['O028'].listingParams, 'shippingMethodIds', []);
        return false;
      }
      this.shippingMethodModel = [];
      this.shippingAccountModel = [];
      let newList = [];
      value.parentNode.forEach(item => {
        (item.children || []).forEach(child => {
          if (value.carrierId.includes(item.carrierId) && value.shippingMethodId.includes(child.shippingMethodId)) {
            newList.push({
              carrierId: item.carrierId,
              shippingId: child.shippingMethodId,
              name: child.labelPath
            })
          }
        });
      });
      this.$set(this.componentsModel['O028'].listingParams, 'shippingMethodIds', newList);
    },
  },
  mounted() {
    let v = this;
    v.$watch(function () {
      return v.componentsModel['O001'].platformIds;
    }, function (n, o) {
      if (JSON.stringify(n) !== JSON.stringify(o)) {
        // v.componentsModel['O001'].siteIds = [];
        // v.componentsModel['O001'].saleAccountIds = [];
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
    v.$watch(function () {
      return v.componentsModel['O008'].priceRange.lowerProfit;
    }, function (n, o) {
      if (n > v.componentsModel['O008'].priceRange.upperProfit) {
        v.componentsModel['O008'].priceRange.upperProfit = n;
      }
    });
  }
};
</script>
<style lang="less">
@import "./rule.less";
</style>
<style lang="less" scoped>
.modalItemHeader{
  padding: 0 15px;
  line-height: 32px;
}
.rulesRightHeight,
.normalPaddingRight {
  height: 585px;
  overflow: auto;
}
.checkboxContainer {
  min-height: 30px;
  padding: 10px;
  max-height: 300px;
  overflow: auto;
}
.content-padding{
  padding: 15px 15px 0 15px;
}
.breakWord {
  white-space: normal;
  .ivu-tag{
    :deep(.ivu-icon-ios-close){
      color: initial !important;
    }
  }
}
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
.content-flex{
  display: flex;
}
.shipping-method-select{
  &.logistics-mode-treeselect{
    :deep(.vue-treeselect){
      .vue-treeselect__control{
        min-height: 32px;
      }
      .vue-treeselect__value-container{
        white-space: initial;
      }
    }
  }
}
.rule-page-form{
  margin-top: 5px;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}
</style>
