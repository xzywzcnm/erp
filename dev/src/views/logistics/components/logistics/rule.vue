<template >
  <div>
    <Row :gutter="10">
      <Col :span="16" class="normalPaddingLeft">
        <div class="normalPaddingRight normalTop">
          <div class="modalItem">
            <div class="modalItemHeader">
              <h6>已选条件</h6>
            </div>
            <div class="modalItemContent">
              <template>
                <!--包裹货品指定分类-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-010')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-010'].categories}">包裹货品属于</span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['wms-service-package-declare-010'].categories" @click="addItem('categories', 'wms-service-package-declare-010')">
                    {{ productCategoryListName.length > 0 ? productCategoryListName : '指定分类' }}
                  </span>
                  <treeSelect v-if="componentsStatus['wms-service-package-declare-010'].categories" style="width:200px" :treeData="productCategoryTree" ref="treeDataRef1" v-model="country1Codes" filterable showCheckbox @on-change="getTree1Data"></treeSelect>
                </div>
                <!-- 订单来源 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-001')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-001'].platformIds}">订单来源为</span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['wms-service-package-declare-001'].platformIds" @click="addItem('platformIds', 'wms-service-package-declare-001')">
                    {{ source.platformIds.length > 0 ? source.platformIds.toString() : '指定平台' }}
                  </span> <dyt-select v-if="componentsStatus['wms-service-package-declare-001'].platformIds && platform.length > 0" v-model="componentsModel['wms-service-package-declare-001'].platformIds" multiple style="width: 100px" @on-change="changeValue('wms-service-package-declare-001', 'platformIds')">
                    <Option v-for="item in shipmentPlatformList" :value="item.platformId" :key="item.platformId"> {{ item.name }}</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-001'].platformIds}">并且为</span>
                  <span class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['wms-service-package-declare-001'].platformIds}" @click="addItem('siteIds', 'wms-service-package-declare-001', 'platformIds')" v-if="!componentsStatus['wms-service-package-declare-001'].siteIds">
                    {{ source.siteIds.length > 0 ? source.siteIds.toString() : '指定站点' }}
                  </span> <dyt-select v-if="componentsStatus['wms-service-package-declare-001'].siteIds" style="width: 160px" v-model="componentsModel['wms-service-package-declare-001'].siteIds" filterable multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item, index) in sitesList" :key="index" :value="item.siteId" :v="item.cnName">{{ item.cnName }}</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-001'].platformIds}">并且为</span>
                  <span class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['wms-service-package-declare-001'].platformIds}" v-if="!componentsStatus['wms-service-package-declare-001'].saleAccountIds" @click="addItem('saleAccountIds', 'wms-service-package-declare-001', 'saleAccountIds')">
                    {{ source.saleAccountIds.length > 0 ? source.saleAccountIds.toString() : '指定帐号' }}
                  </span>
                  <dytStoreSelect
                    style="width: 220px"
                    v-model="componentsModel['wms-service-package-declare-001'].saleAccountIds"
                    :option-data="platformAccountList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                    v-if="componentsStatus['wms-service-package-declare-001'].saleAccountIds"
                  />
                </div>
                <!-- 发货仓库 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-002')) >= 0">
                  <span class="itemPaddingRight">发货仓库为</span>
                  <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['wms-service-package-declare-002'].warehouseIds" @click="addItem('warehouseIds', 'wms-service-package-declare-002')">
                    {{
                      componentsModel['wms-service-package-declare-002'].warehouseIds.length > 0 || warehouseIdsName.length
                      ? warehouseIdsName.toString()
                      : '指定仓库'
                    }}
                  </span>
                  <dyt-select v-if="componentsStatus['wms-service-package-declare-002'].warehouseIds" v-model="componentsModel['wms-service-package-declare-002'].warehouseIds" multiple style="width: 256px">
                    <Option v-for="item in storeList" :value="item.warehouseId" :key="item.warehouseId"> {{ item.warehouseName }}</Option>
                  </dyt-select>
                </div>
                <!-- 包裹货品指定货品-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-007')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-007'].productGoodsIds}">包裹货品包含</span>
                  <span class="blueColor itemPaddingRight cursor">
                    <Poptip @on-popper-show="addItem('productGoodsIds', 'wms-service-package-declare-007')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="mr10" v-if="componentsModel['wms-service-package-declare-007'].productGoodsIds.length > 0 ">{{ componentsModel['wms-service-package-declare-007'].productGoodsIds }}</span>
                        <span v-else>指定货品</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单包含货品：</span>
                        <Input style="width:200px;marginLeft:10px;" type="textarea" placeholder="可输入多个，中间用英文逗号隔开" v-model.trim="componentsModel['wms-service-package-declare-007'].productGoodsIds"></Input>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--包裹货品总数量-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-008')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-008'].rangeOfGoods}">包裹货品总数量</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('rangeOfGoods', 'wms-service-package-declare-008')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox1 || componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox2">
                          <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox1">
                            <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginType === 0">&ge;</span>
                            <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginType === 1">&gt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginType === 2">=</span>{{ componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginValue }}
                          </span>
                          <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox2">
                            <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.endType ===0">&lt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-008'].rangeOfGoods.endType ===1">&le;</span>{{ componentsModel['wms-service-package-declare-008'].rangeOfGoods.endValue }}
                          </span>
                        </span>
                        <span v-else>指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span style="marginLeft:10px;">包裹货品总数量满足以下选中的条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox1" v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.endType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-008'].rangeOfGoods.checkbox2" v-model="componentsModel['wms-service-package-declare-008'].rangeOfGoods.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--包裹总重量指定范围-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-006')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-006'].weightOfGoods}">包裹总重量</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('rangeOfGoods', 'wms-service-package-declare-006')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox1 || componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox2">
                          <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox1">
                            <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.beginType === 0">&ge;</span>
                            <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.beginType === 1">&gt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.beginType === 2">=</span>{{ componentsModel['wms-service-package-declare-006'].weightOfGoods.beginValue }}
                          </span>
                          <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox2">
                            <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.endType ===0">&lt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-006'].weightOfGoods.endType ===1">&le;</span>{{ componentsModel['wms-service-package-declare-006'].weightOfGoods.endValue }}
                          </span> (g)

                        </span>
                        <span v-else>指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.beginType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox1" v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.beginValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.endType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-006'].weightOfGoods.checkbox2" v-model="componentsModel['wms-service-package-declare-006'].weightOfGoods.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--包裹货品包含指定货品且数量指定-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-009')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-009'].orderProductParams}">包裹货品包含</span>
                  <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('orderProductParams', 'wms-service-package-declare-009')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        <span class="mr10" v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.skus && componentsModel['wms-service-package-declare-009'].orderProductParams.skus.length > 0">{{ componentsModel['wms-service-package-declare-009'].orderProductParams.skus }}</span>
                        <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1 || componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2">
                          <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1">
                            <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.startType === 0">&ge;</span>
                            <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.startType === 1">&gt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.startType === 2">=</span>{{ componentsModel['wms-service-package-declare-009'].orderProductParams.startValue }}
                          </span>
                          <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2">
                            <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.endType ===0">&lt;</span>
                            <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.endType ===1">&le;</span>{{ componentsModel['wms-service-package-declare-009'].orderProductParams.endValue }}
                          </span>
                        </span>
                        <span v-if="componentsModel['wms-service-package-declare-009'].orderProductParams.skus.length === 0 && !componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1 && !componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2">指定货品且数量指定范围</span>
                      </span>
                      <div slot="content" class="keywordString">
                        <span>订单包含货品：</span>
                        <Input style="width:200px;marginLeft:10px;" type="textarea" placeholder="可输入多个，中间用英文逗号隔开" v-model.trim="componentsModel['wms-service-package-declare-009'].orderProductParams.skus"></Input>
                        <br>
                        <span style="marginTop:10px;">并且上述货品的数量总和满足以下选中的所有条件：</span>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.startType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1">
                            <Option :value="0">&ge;</Option>
                            <Option :value="1">&gt;</Option>
                            <Option :value="2">=</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox1" v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.startValue"></InputNumber>
                        </div>
                        <div class="platformSelect normalTop">
                          <Checkbox v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2"></Checkbox>
                          <dyt-select v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.endType" style="width:120px;" size="small" :disabled="!componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2">
                            <Option :value="0">&lt;</Option>
                            <Option :value="1">&le;</Option>
                          </dyt-select>
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" :disabled="!componentsModel['wms-service-package-declare-009'].orderProductParams.checkbox2" v-model="componentsModel['wms-service-package-declare-009'].orderProductParams.endValue"></InputNumber>
                        </div>
                      </div>
                    </Poptip>
                  </span>
                </div>
                <!--包裹货品标签-->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-011')) >= 0">
                  <span class="itemPaddingRight">包裹货品包含</span> <span v-if="!componentsStatus['wms-service-package-declare-011'].productTags" class="blueColor itemPaddingRight cursor" @click="addItem('productTags', 'wms-service-package-declare-011')">
                    {{
                      componentsModel['wms-service-package-declare-011'].productTags.length > 0
                      ? componentsModel['wms-service-package-declare-011'].productTags.join('或')
                      : '指定的商品标签'
                    }}
                  </span> <dyt-select v-if="componentsStatus['wms-service-package-declare-011'].productTags" v-model="componentsModel['wms-service-package-declare-011'].productTags" style="width:256px" multiple>
                    <Option v-for="(item, index) in productTagList" :key="index" :value="item.name">{{ item.name }}</Option>
                  </dyt-select>
                </div>
                <!-- 买家选择的运输类型 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O003')) >= 0">
                  <span class="itemPaddingRight">买家选择的运输类型为</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('shipmentTypes', 'O003')" transfer width="700" placement="right">
                      <span class="blueColor cursor">
                        {{ shipmentTagModel.length > 0 ? shipmentTagModel[0] + '...' : '指定类型' }}
                      </span>
                      <div slot="content" class="keywordString">
                        <div>
                          已选取：
                        </div>
                        <div class="breakWord max-height-300">
                          <Tag closable :color="tagColor(item)" v-for="(item, index) in shipmentTagModel" :key="index" @on-close="delTag(index)">{{ item }}</Tag>
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
                          <Input v-model.trim="shipmentSearchValue" style="width:310px" @on-enter="shipmentSearch" placeholder="请输入运输类型名称搜索"></Input>
                        </div>
                        <div class="normalTop" v-if="addiblePlatform.includes(shipmentPlatformModel)">
                          <Input v-model.trim='shippingMethodName' placeholder="新增运输类型" style="width:310px;margin-right:10px" /><Button @click='saveShopifyLogisticsMode'>保存</Button>
                        </div>
                        <div class="normalTop" v-if="shipmentPlatformModel !== '' && smShippingMethodList.length != 0">
                          <CheckboxGroup v-model="shipmentCheckBoxModel" @on-change="setTagValue">
                            <div class="checkboxContainer">
                              <div class="normalTop" v-for="(item, index) in smShippingMethodList" :key="`${item.siteId}-${index}`">
                                <Checkbox :label="shipmentPlatformModel + ':' + item.shippingMethodName + ':' + item.shippingMethodDescription">
                                  <span>{{ item.shippingMethodDescription }}</span>
                                </Checkbox>
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
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O005')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O005'].states}">订单收货地址省/州为</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O005'].states" @click="addItem('states', 'O005')">
                    {{ componentsModel['O005'].states === '' ? '指定省/州' : componentsModel['O005'].states }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O005'].states" v-model.trim="componentsModel['O005'].states"></Input>
                </div>
                <!-- 订单收货地址城市 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O006')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O006'].cities}">订单收货地址城市为</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['O006'].cities" @click="addItem('cities', 'O006')">
                    {{ componentsModel['O006'].cities === '' ? '指定城市' : componentsModel['O006'].cities }}
                  </span> <Input style="width:100px" v-if="componentsStatus['O006'].cities" v-model.trim="componentsModel['O006'].cities"></Input>
                </div>
                <!-- 订单总金额 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-005')) >= 0">
                  <span class="itemPaddingRight">包裹总金额</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('packageAmountOfMoney', 'wms-service-package-declare-005')" transfer width="500" placement="bottom">
                      <span class="blueColor cursor">
                        {{
                            componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.currency
                            ? componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.beginValue + '-' + componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.endValue + '(' + componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.currency + ')'
                            : '指定范围'
                          }}
                      </span>
                      <div slot="content" class="keywordString">
                        <Alert class="key-alert">包裹总金额包含多订单合并到一包裹中的所有订单的金额，不同币种的订单的金额将被统一按汇率转换为如下设置中的币种。</Alert>
                        <span>包裹总金额转换为币种：<dyt-select style="width: 200px;" size="small" v-model="componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.currency">
                            <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
                          </dyt-select>之后满足以下全部条件：</span>
                        <div class="mt10">
                          <InputNumber :min="0" size="small" style="marginLeft:10px;" v-model="componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.beginValue"></InputNumber>-<InputNumber :min="0" size="small" style="marginLeft:10px;" v-model="componentsModel['wms-service-package-declare-005'].packageAmountOfMoney.endValue"></InputNumber>
                        </div>
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
                            ? '低于' + componentsModel['O008'].priceRange.lowerProfit + '% , ' + '高于' + componentsModel['O008'].priceRange.upperProfit + '%'
                            : componentsModel['O008'].priceRange.less === 1 && componentsModel['O008'].priceRange.more !== 1
                              ? '低于' + componentsModel['O008'].priceRange.lowerProfit + '%'
                              : componentsModel['O008'].priceRange.less !== 1 && componentsModel['O008'].priceRange.more === 1
                                ? '高于' + componentsModel['O008'].priceRange.upperProfit + '%'
                                : '指定范围'
                          }}
                      </a>
                      <div slot="content">
                        <div class="">
                          <Checkbox v-model="componentsModel['O008'].priceRange.less" :true-value="1" :false-value="0" class="priceRangeCheck">低于</Checkbox>
                          <InputNumber :min="0" v-model.trim="componentsModel['O008'].priceRange.lowerProfit" style="width:100px"></InputNumber>
                          <span class="pricePrangeLeft">%</span>
                        </div>
                        <div class="">
                          <Checkbox v-model="componentsModel['O008'].priceRange.more" :true-value="1" :false-value="0" class="priceRangeCheck">高于</Checkbox>
                          <InputNumber :min="0" v-model.trim="componentsModel['O008'].priceRange.upperProfit" style="width:100px"></InputNumber>
                          <span class="pricePrangeLeft">%</span>
                        </div>
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
                <!-- eBay订单 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O010')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O010'].isEbayPlus}">eBay订单</span> <span v-if="!componentsStatus['O010'].isEbayPlus" class="blueColor itemPaddingRight cursor" @click="addItem('isEbayPlus', 'O010')">
                    {{ componentsModel['O010'].isEbayPlus === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O010'].isEbayPlus" v-model="componentsModel['O010'].isEbayPlus" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O010'].isEbayPlus}">
                    eBayPlus订单
                  </span>
                </div>
                <!-- eBay订单EGD -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O012')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O012'].include}">eBay订单</span> <span v-if="!componentsStatus['O012'].include" class="blueColor itemPaddingRight cursor" @click="addItem('include', 'O012')">
                    {{ componentsModel['O012'].include === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O012'].include" v-model="componentsModel['O012'].include" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O012'].include}">
                    包含EGD物品
                  </span>
                </div>
                <!-- 实际发货邮寄方式 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-003')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-003'].shippingMethodIds}">实际发货邮寄方式</span>
                  <Poptip transfer placement="bottom-start" width="500" style="max-width: calc(100% - 120px); vertical-align: top;">
                    <span class="blueColor itemPaddingRight cursor">
                      <span class="mr10" v-if="shippingParmas.length > 0" v-for="(item,index) in shippingParmas" :key="index">{{ item.name }}</span>
                      <span v-if="shippingParmas.length === 0">指定邮寄方式</span>
                    </span>
                    <div slot="content">
                      <div style="display: inline-block;width: 300px;">
                        <Cascader :data="shippingMethodData" @on-visible-change="showShippingDataApi" v-model="value2" :load-data="loadDataApi" @on-change="getAccountApi" transfer></Cascader>
                      </div>
                      <div style="padding: 10px;">
                        已选择：
                        <div style="max-height: 200px; overflow: auto;">
                          <p v-for="(item,index) in shippingParmas" :key="index">
                            <Tag closable @on-close="handleClose(index)">{{ item.name }}</Tag>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Poptip>

                </div>
                <!-- 产品刊登标题所含关键字包含 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O011')) >= 0">
                  <span class="itemPaddingRight">产品刊登标题所含关键字包含</span> <span class="blueColor itemPaddingRight">
                    <Poptip @on-popper-show="addItem('productKeyword', 'O011')" transfer width="500" placement="bottom">
                      <a>{{
                            (componentsModel['O011'].productKeyword.length > 1 && componentsModel['O011'].productKeyword[0].value !== '')
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
                        <Form ref="productKeyword" :model="componentsModel['O011']" :label-width="80" class="use-form-default" style="width: 300px">
                          <FormItem v-for="(item, index) in componentsModel['O011'].productKeyword" :key="index" :label="'关键字' + index">
                            <Row>
                              <Col span="18">
                              <Input type="text" v-model.trim="item.value" placeholder="请输入关键字..."></Input>
                              </Col>
                              <Col span="4" offset="1">
                              <Button @click="handleRemove(index)">删除</Button>
                              </Col>
                            </Row>
                          </FormItem>
                          <FormItem>
                            <Row>
                              <Col span="12">
                              <Button type="dashed" long @click="handleAdd" icon="md-add">增加</Button>
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
                    指定字符串
                  </span>
                </div>
                <!-- 货品所在地为 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('wms-service-package-declare-004')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-004'].countryCodes}">订单目的地为</span>
                  <span v-if="!componentsStatus['wms-service-package-declare-004'].countryCodes" class="blueColor itemPaddingRight cursor countryCodesName" @click="addItem('countryCodes', 'wms-service-package-declare-004')">
                    {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
                  </span>

                  <erpTreeSelect
                    v-if="componentsStatus['wms-service-package-declare-004'].countryCodes"
                    class="country-codes-calss"
                    v-model="countryCodes"
                    :multiple="true"
                    :normalizer="treeNormalizer"
                    :options="countryData"
                    :default-expand-level="Infinity"
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
                    v-if="componentsStatus['wms-service-package-declare-004'].countryCodes"
                    type="textarea"
                    :limit="1"
                    placeholder="请输入国家名称，多个可用逗号或换行隔开"
                    v-model="textareaCountryCodes"
                  />
                  <!-- <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['wms-service-package-declare-004'].countryCodes}">且邮编在</span>-->
                  <!--<span class="blueColor itemPaddingRight cursor" :class="{textMarginTop: componentsStatus['wms-service-package-declare-004'].countryCodes}">
                      <Poptip @on-popper-show="addItem('buyerPostalCodes', 'wms-service-package-declare-004')" transfer width="500" placement="bottom">
                        <span class="blueColor itemPaddingRight cursor">
                        {{
                          postcodeOne !== '' && postcodeTwo !== '' ? postcodeOne + '-' + postcodeTwo :
                            postcodeOne !== '' && postcodeTwo === '' ? postcodeOne : postcodeArea !== '' ? postcodeArea :
                          '指定范围'
                        }}
                        </span>
                      &lt;!&ndash; <div slot="content" class="keywordString">
                          <RadioGroup v-model="componentsModel['wms-service-package-declare-004'].postalCodeType" @on-change="getPostCodeType">
                            <Radio :label="0">
                              <span>邮编段</span>
                            </Radio>
                            <Radio :label="1">
                              <span>邮编列表</span>
                            </Radio>
                          </RadioGroup>
                          <div class="normalTop" v-if="componentsModel['wms-service-package-declare-004'].postalCodeType === 0">
                            <Input v-model.trim="postcodeOne" style="width:150px"></Input>
                            <span> - </span>
                            <Input v-model.trim="postcodeTwo" style="width:150px"></Input>
                          </div>
                          <div class="normalTop" v-if="componentsModel['wms-service-package-declare-004'].postalCodeType === 1">
                            <Input v-model="postcodeArea" style="width:300px" type="textarea" :rows="5" placeholder="多邮编换行请求半角输入逗号隔开"></Input>
                          </div>
                        </div>&ndash;&gt;
                      </Poptip>
                    </span>-->
                </div>
                <!-- 是否为黑名单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O014')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O014'].isWishExpress}">专有黑名单</span> <span v-if="!componentsStatus['O014'].isBuyerInBlackList" class="blueColor itemPaddingRight cursor" @click="addItem('isBuyerInBlackList', 'O014')">
                    {{ componentsModel['O014'].isBuyerInBlackList === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O014'].isBuyerInBlackList" v-model="componentsModel['O014'].isBuyerInBlackList" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O014'].isBuyerInBlackList}">
                    ，白名单除外
                  </span>
                </div>
                <!-- wish订单 是否是Wish Express：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O015')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O015'].isWishExpress}">wish订单</span> <span v-if="!componentsStatus['O015'].isWishExpress" class="blueColor itemPaddingRight cursor" @click="addItem('isWishExpress', 'O015')">
                    {{ componentsModel['O015'].isWishExpress === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O015'].isWishExpress" v-model="componentsModel['O015'].isWishExpress" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O015'].isWishExpress}">
                    Wish Express
                  </span>
                </div>
                <!-- wish订单 是否是EPC订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O016')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O016'].isWishEPC}">wish订单</span> <span v-if="!componentsStatus['O016'].isWishEPC" class="blueColor itemPaddingRight cursor" @click="addItem('isWishEPC', 'O016')">
                    {{ componentsModel['O016'].isWishEPC === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O016'].isWishEPC" v-model="componentsModel['O016'].isWishEPC" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O016'].isWishEPC}">
                    EPC订单
                  </span>
                </div>
                <!-- wish订单 是否是优质服务商订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O017')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O017'].isWishQualityServiceOrder}">wish订单</span> <span v-if="!componentsStatus['O017'].isWishQualityServiceOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isWishQualityServiceOrder', 'O017')">
                    {{ componentsModel['O017'].isWishQualityServiceOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O017'].isWishQualityServiceOrder" v-model="componentsModel['O017'].isWishQualityServiceOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O017'].isWishQualityServiceOrder}">
                    优质服务商订单
                  </span>
                </div>
                <!-- wish订单 是否是A+物流计划订单：是/否 -->
                <div class=" uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('O018')) >= 0">
                  <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O018'].isWishALogisticsPlanOrder}">wish订单</span> <span v-if="!componentsStatus['O018'].isWishALogisticsPlanOrder" class="blueColor itemPaddingRight cursor" @click="addItem('isWishALogisticsPlanOrder', 'O018')">
                    {{ componentsModel['O018'].isWishALogisticsPlanOrder === '0' ? '否' : '是' }}
                  </span> <dyt-select v-if="componentsStatus['O018'].isWishALogisticsPlanOrder" v-model="componentsModel['O018'].isWishALogisticsPlanOrder" class="itemPaddingRight" style="width:70px">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </dyt-select> <span class="itemPaddingRight" :class="{textMarginTop: componentsStatus['O018'].isWishALogisticsPlanOrder}">
                    A+物流计划订单
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <detailFrom :hideSave="true" ref="detailForm"></detailFrom>
        <Form class="mt10">
          <FormItem label="规则名称">
            <Input class="w256" v-model="actionParams.ruleName" :maxlength="20" />
          </FormItem>
        </Form>
      </Col>
      <Col :span="8">
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
    <div class="ruleButtons mt10  flexEnd normal">
      <Button class="normalRMargin" size="large" @click="closeRuleModal">取消 </Button>
      <Button type="primary" class="saveButton" size="large" :loading="loading" @click="saveButton">保存 </Button>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import detailFrom from './delarationdetail';
import Sortable from 'sortablejs';

export default {
  mixins: [Mixin, publicService, orderSys],
  data () {
    const noEmpty = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入规则名'));
      } else {
        callback();
      }
    };
    let v = this;
    return {
      addiblePlatform: ['shopify', 'ozon'],
      textareaCountryCodes: [],
      isChangeTreecountryCodes: false,
      shippingParmas: [],
      countryJson: {},
      model1: false,
      productType: 'addPackageGoods', // 打开选择产品标识
      shippingMethodName: '',
      value2: [],
      addProductValue: [],
      addProductValue1: [], // wms-service-package-declare-009
      productSku: '',
      country1Codes: [],
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
      shipmentPlatformSite: '',
      shipmentPlatformList: [],
      shipmentPlatformSiteList: [],
      shipmentCheckBoxModel: [],
      shipmentTagModel: [],
      postcodeOne: '',
      postcodeTwo: '',
      countryCodesName: '',
      treeArr: [],
      countryCodes: [],
      countryData: [],
      actionParams: {
        ruleName: null,
        isSupended: 0,
        isRemind: 0,
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
          {
            validator: noEmpty,
            trigger: 'blur'
          }
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
      productCategoryListName: '',
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
      componentsModel: {
        'wms-service-package-declare-011': {
          productTags: []
        },
        'wms-service-package-declare-009': {
          orderProductParams: {
            checkbox1: false,
            checkbox2: false,
            startType: 0,
            startValue: 0,
            endType: 0,
            endValue: 0,
            skus: ''
          }
        },
        'wms-service-package-declare-008': {
          rangeOfGoods: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'wms-service-package-declare-006': {
          weightOfGoods: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0
          }
        },
        'wms-service-package-declare-001': {
          platformIds: [],
          siteIds: [],
          saleAccountIds: []
        },
        'wms-service-package-declare-002': {
          warehouseIds: []
        },
        'O003': {
          shipmentTypes: []
        },
        'O006': {
          cities: ''
        },
        'O004': {
          countryCodes: [],
          postalCodeType: 0,
          buyerPostalCodes: ''
        },
        'W004': {
          shopSku: null
        },
        'O005': {
          states: ''
        },
        'wms-service-package-declare-005': {
          packageAmountOfMoney: {
            checkbox1: false,
            checkbox2: false,
            beginType: 0,
            beginValue: 0,
            endType: 0,
            endValue: 0,
            currency: ''
          }
        },
        'O008': {
          priceRange: {
            less: 0,
            more: 0,
            upperProfit: 0,
            lowerProfit: 0
          }
        },
        'O009': {
          productCategories: [],
          skus: '',
          productTags: []
        },
        'O010': {
          isEbayPlus: '1'
        },
        'O011': {
          productKeyword: [
            {
              value: ''
            }
          ],
          type: 0
        },
        'O012': {
          include: '1'
        },
        'wms-service-package-declare-003': {
          shippingMethodIds: []
        },
        'wms-service-package-declare-004': {
          countryCodes: [],
          postalCodeType: 0,
          buyerPostalCodes: ''
        },
        'O014': {
          isBuyerInBlackList: '1'
        },
        'O016': {
          isWishEPC: '1'
        },
        'O017': {
          isWishQualityServiceOrder: '1'
        },
        'O018': {
          isWishALogisticsPlanOrder: '1'
        },
        'wms-service-package-declare-007': {
          productGoodsIds: ''
        },
        'wms-service-package-declare-010': {
          categories: []
        }
      },
      componentsStatus: {
        'wms-service-package-declare-011': {
          productTags: false
        },
        'wms-service-package-declare-009': {
          orderProductParams: false
        },
        'wms-service-package-declare-008': {
          rangeOfGoods: false
        },
        'wms-service-package-declare-006': {
          weightOfGoods: false
        },
        'wms-service-package-declare-001': {
          platformIds: false,
          siteIds: false,
          saleAccountIds: false
        },
        'wms-service-package-declare-010': {
          categories: false
        },
        'wms-service-package-declare-007': {
          productGoodsIds: false
        },
        'wms-service-package-declare-002': {
          warehouseIds: false
        },
        'O003': {
          shipmentTypes: false
        },
        'O004': {
          countryCodes: false,
          buyerPostalCodes: false
        },
        'W004': {
          shopSku: false
        },
        'O005': {
          states: false
        },
        'O006': {
          cities: false
        },
        'wms-service-package-declare-005': {
          packageAmountOfMoney: false
        },
        'O008': {
          priceRange: false
        },
        'O009': {
          productCategories: false,
          skus: false,
          productTags: false
        },
        'O010': {
          isEbayPlus: false
        },
        'O011': {
          productKeyword: false
        },
        'O012': {
          include: false
        },
        'wms-service-package-declare-003': {
          shippingMethodIds: false
        },
        'wms-service-package-declare-004': {
          countryCodes: false,
          buyerPostalCodes: false
        },
        'O014': {
          isBuyerInBlackList: '1'
        },
        'O015': {
          isWishExpress: '1'
        },
        'O016': {
          isWishEPC: '1'
        },
        'O017': {
          isWishQualityServiceOrder: '1'
        },
        'O018': {
          isWishALogisticsPlanOrder: '1'
        }
      },
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
      productSku1: ''
    };
  },
  components: {
    detailFrom
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
    type: String
  },
  watch: {
    timestamp: {
      deep: true,
      immediate: true,
      handler (n, o) {
        // 显示之后再执行
        this.$nextTick(() => {
          this.resetRuleData();
          this.getRuleDetails();
          this.getWarehouseList();
          this.listData = [];
          if (this.ruleParmas.editType === 'edit') {
            this.$refs.detailForm && this.$refs.detailForm.getRuleDetails(this.ruleParmas.autoRuleId);
          } else {
            this.$refs.detailForm && this.$refs.detailForm.reset();
          }
        })
      }
    },
    'amountRange.usdFloor': {
      deep: true,
      handler (n, o) {
        let v = this;
        if (n > v.amountRange.usdUpper) {
          v.amountRange.usdUpper = n;
        }
      }
    },
    'amountRange.audFloor': {
      deep: true,
      handler (n, o) {
        let v = this;
        if (n > v.amountRange.audUpper) {
          v.amountRange.audUpper = n;
        }
      }
    },
    'amountRange.eurFloor': {
      deep: true,
      handler (n, o) {
        let v = this;
        if (n > v.amountRange.eurUpper) {
          v.amountRange.eurUpper = n;
        }
      }
    },
    'amountRange.gbpFloor': {
      deep: true,
      handler (n, o) {
        let v = this;
        if (n > v.amountRange.gbpUpper) {
          v.amountRange.gbpUpper = n;
        }
      }
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
    getAccountApi (value, selectedData) {
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel = [];
      v.shippingAccountModel = [];
      // v.getCarrierBaseSettingApi(value[1]); ;
      if (value[1] !== null) {
        v.shippingParmas.push({
          carrierId: value[0],
          shippingId: value[1],
          name: selectedData[1].__label
        });
      }
    },
    handleClose (index) {
      this.shippingParmas.splice(index, 1);
    },
    loadDataApi (item, callback) {
      item.loading = true;
      let v = this;
      v.axios.get(api.wmsErpCommon + api.get_enableShippingMethodsApi + '?carrierId=' + item.value).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].shippingMethodId,
              label: data[i].carrierShippingMethodName
            });
            if (i === data.length - 1) {
              item.children = pos;
              item.loading = false;
              callback();
            }
          }
          if (data.length === 0) {
            item.children = pos;
            item.loading = false;
            v.$Message.warning('没有相关记录');
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
        v.$Message.error('系统繁忙，请重新尝试');
      });
    },
    showShippingDataApi (val) {
      let v = this;
      v.axios.get(api.wmsErpCommon + api.get_enableCarriersApi + '?isFilter=true').then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts,
              apiInterface: data[i].apiInterface
            });
            if (i === data.length - 1) {
              v.shippingMethodData = pos;
            }
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    addProductSave (data) {

    },
    getProductCategory () { // 获取商品分类
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.wmsErpCommon + api.get_productCategory, { hiddenError: true }).then(response => {
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
            resolve(arr.toString());
            // v.productCategoryListName = arr.toString();
          }
        });
      });
    },
    setTreeDate (selectId) {
      let v = this;
      if (!selectId) return;
      let arr = v.productCategoryTree[0].children;
      let item = [];

      function makeTree (a) {
        a.forEach((i) => {
          selectId.forEach(j => {
            if (i.productCategoryId === j) {
              v.$set(i, 'checked', true);
              item.push(i);
            }
          });
          if (i.children) {
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
      setTimeout(() => {
        v.$refs['treeDataRef1'].treeSelectCheckChange(item);
      }, 300);
    },
    reset () {
    },
    startLoading () {
    },
    onlyDistriHaveStockSelectedChange () {
      if (!this.actionParams.onlyDistriHaveStockSelected) {
        this.$nextTick(() => {
          this.actionParams.matchOtherRulesSelected2 = false;
        });
      }
    },
    getTree1Data (val) {
      let v = this;
      let nodesArr = v.$refs['treeDataRef1'].getCheckedNodes();
      let arr = [];
      nodesArr.forEach((n, i) => {
        if (n.hasOwnProperty('productCategoryId')) {
          arr.push(n.productCategoryId);
        }
      });
      v.componentsModel['wms-service-package-declare-010'].categories = arr;
    },
    endFunc (e) { // 移动后逻辑处理
      let v = this;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      let data = v.listSortDate[oldIndex];
      v.listSortDate.splice(oldIndex, 1);
      v.listSortDate.splice(newIndex, 0, data);
    },
    getRuleCode (ruleCode, type) {
      let mapObj = {
        'wms-service-package-declare-010': 'wms-service-package-declare-010', // 包裹货品属于
        'wms-service-package-declare-001': 'wms-service-package-declare-001', // 订单来源
        'wms-service-package-declare-002': 'wms-service-package-declare-002', // 发货仓库
        'wms-service-package-declare-007': 'wms-service-package-declare-007', // 订单目的地
        'wms-service-package-declare-008': 'wms-service-package-declare-008', // 包裹货品总数量
        'wms-service-package-declare-009': 'wms-service-package-declare-009', // 包裹货品
        'wms-service-package-declare-006': 'wms-service-package-declare-006', // 包裹总重量
        'wms-service-package-declare-003': 'wms-service-package-declare-003', // 实际发货邮寄方式
        'wms-service-package-declare-004': 'wms-service-package-declare-004', // 包裹目的地
        'wms-service-package-declare-005': 'wms-service-package-declare-005', // 包裹总金额
        'wms-service-package-declare-011': 'wms-service-package-declare-011' // 包裹包含
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    getBackRuleCode (ruleCode, type) { // 反推 code
      let mapObj = {
        'wms-service-package-declare-010': 'wms-service-package-declare-010', // 包裹货品属于
        'wms-service-package-declare-001': 'wms-service-package-declare-001', // 订单来源
        'wms-service-package-declare-002': 'wms-service-package-declare-002', // 发货仓库
        'wms-service-package-declare-007': 'wms-service-package-declare-007', // 订单目的地
        'wms-service-package-declare-008': 'wms-service-package-declare-008', // 包裹货品总数量
        'wms-service-package-declare-009': 'wms-service-package-declare-009', // 包裹货品
        'wms-service-package-declare-006': 'wms-service-package-declare-006', // 包裹总重量
        'wms-service-package-declare-003': 'wms-service-package-declare-003', // 实际发货邮寄方式
        'wms-service-package-declare-004': 'wms-service-package-declare-004', // 包裹目的地
        'wms-service-package-declare-005': 'wms-service-package-declare-005', // 包裹总金额
        'wms-service-package-declare-011': 'wms-service-package-declare-011' // 包裹包含
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    resetRuleData () {
      let v = this;
      v.rulesModel = [];
      v.shippingParmas = [];
      v.componentsModel['wms-service-package-declare-001'].platformIds = [];
      v.componentsModel['wms-service-package-declare-002'].warehouseIds = [];
      v.componentsModel['wms-service-package-declare-003'].shippingMethodIds = [];
      v.componentsModel['wms-service-package-declare-004'].postalCodeType = 0;
      v.componentsModel['wms-service-package-declare-005'].packageAmountOfMoney = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0,
        currency: ''
      };
      v.componentsModel['wms-service-package-declare-006'].weightOfGoods = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['wms-service-package-declare-007'].productGoodsIds = '';
      v.componentsModel['wms-service-package-declare-008'].rangeOfGoods = {
        checkbox1: false,
        checkbox2: false,
        beginType: 0,
        beginValue: 0,
        endType: 0,
        endValue: 0
      };
      v.componentsModel['wms-service-package-declare-009'].orderProductParams = {
        checkbox1: false,
        checkbox2: false,
        startType: 0,
        startValue: 0,
        endType: 0,
        endValue: 0,
        skus: ''
      };
      v.componentsModel['wms-service-package-declare-010'].categories = [];
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
      v.countryCodesName = '';
      v.treeArr = [];
      v.countryCodes = [];
      v.countryData = [];
      v.actionParams = {
        ruleName: null,
        isSupended: 0,
        isRemind: 0,
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
      v.componentsModel['O006'].cities = '';
      v.componentsModel['O005'].states = '';
      v.componentsModel['O008'] = {
        priceRange: {
          less: 0,
          more: 0,
          upperProfit: 0,
          lowerProfit: 0
        }
      };
      v.componentsModel['O011'] = {
        productKeyword: [
          {
            value: ''
          }
        ],
        type: 0
      };
      v.productTagList = [];
      v.skusStatus = false;
      v.productCategoryListName = '';
      v.productCategoryList = [];
      v.autoRuleItems = [];
      for (let i in v.componentsStatus) {
        for (let b in v.componentsStatus[i]) {
          v.componentsStatus[i][b] = false;
        }
      }
    },
    getRuleDetails () {
      let v = this;
      let url = api.get_packageDeclareAutoRule;
      const type = v.ruleParmas.type;
      v.autoRuleId = v.ruleParmas.autoRuleId;
      v.$nextTick(function () {
        v.actionParams.ruleName = v.ruleParmas.name;
        v.actionParams.status = Number(v.ruleParmas.status);
      });
      v.axios.get(url + v.autoRuleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;

          async function processingData () {
            const rulesResult = await v.setRulesGroup(type, data.rules);// 可选条件分组
            if (rulesResult) {
              if (data.ruleItems !== null && data.ruleItems.length > 0) {
                v.ruleItems = data.ruleItems;
                v.processingRulesItemData(data.ruleItems);
              }
              v.processingActions(data.ruleActions);
            }
          }

          processingData();
        }
      });
    },
    processingActions (ruleActions) {
      let v = this;
      if (ruleActions !== null && ruleActions.length > 0) {
        for (let i = 0; i < ruleActions.length; i++) {
          let action = ruleActions[i];
          if (action.type === 'supended') {
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
        }
      }
    },
    addItem (name, code) { // getAPIData
      let v = this;
      if (name === 'warehouseIds') {
        v.componentsStatus[code][name] = true;
        v.getStore(1); // 获取仓库列表
      } else if (name === 'packageAmountOfMoney') {
        v.getCurrencyInfo();
      } else if (name === 'platformIds') {
        v.componentsStatus[code][name] = true;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: !!v.componentsStatus['wms-service-package-declare-001'].siteIds,
            saleAccountIds: !!v.componentsStatus['wms-service-package-declare-001'].saleAccountIds
          });
        }
      } else if (name === 'siteIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        v.componentsStatus[code][name] = true;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: true,
            saleAccountIds: !!v.componentsStatus['wms-service-package-declare-001'].saleAccountIds
          });
        }
      } else if (name === 'saleAccountIds') {
        if (v.componentsModel[code]['platformIds'].length === 0 && !v.componentsStatus[code]['platformIds']) {
          v.$Message.error('请先选择平台');
          return false;
        }
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment({
            siteIds: !!v.componentsStatus['wms-service-package-declare-001'].siteIds,
            saleAccountIds: true
          });
        }
        v.componentsStatus[code][name] = true;
      } else if (name === 'goodsCountry') {
        v.componentsStatus[code][name] = true;
        v.getCountrys();
      } else if (name === 'goodsCity' || name === 'goodsPostalCode') {
        if (v.componentsModel[code]['goodsCountry'].length === 0 && !v.componentsStatus[code]['goodsCountry']) {
          v.$Message.error('请先选择国家');
          return false;
        }
        v.componentsStatus[code][name] = true;
      } else if (name === 'include' || name === 'productKeyword' || name === 'isEbayPlus' || name === 'priceRange' || name === 'cities' || name === 'amountRange' || name === 'states' || name === 'isWishExpress' || name === 'isWishEPC' || name === 'isWishQualityServiceOrder' || name === 'isWishALogisticsPlanOrder' || name === 'isBuyerInBlackList') {
        v.componentsStatus[code][name] = true;
      } else if (name === 'skus') {
        v.componentsStatus[code][name] = true;
      } else if (name === 'productTags') {
        v.getProductTags().then(result => {
          if (result) {
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'shippingMethodIds') {
        v.componentsStatus[code][name] = true;
      } else if (name === 'productCategories') {
        v.getProductCategory().then(result => {
          if (result) {
            if (v.productCategoryIdList && v.productCategoryIdList.length > 0) {
              v.setTreeDate(v.productCategoryIdList);
            }
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'countryCodes') {
        v.componentsStatus[code][name] = true;
        v.getCommonCountry(v.treeArr);
      } else if (name === 'buyerPostalCodes') {
        v.componentsStatus[code][name] = true;
      } else if (name === 'shipmentTypes') {
        v.componentsStatus[code][name] = true;
        v.getShipment({
          siteIds: !!v.componentsStatus['wms-service-package-declare-001'].siteIds,
          saleAccountIds: !!v.componentsStatus['wms-service-package-declare-001'].saleAccountIds
        });
      } else if (name === 'shopSku') {
        v.componentsStatus[code][name] = true;
      } else if (name === 'categories') {
        v.componentsStatus[code][name] = true;
        v.getProductCategory().then(result => {
          if (result) {
            if (v.productCategoryIdList && v.productCategoryIdList.length > 0) {
              v.setTreeDate(v.productCategoryIdList);
            }
            v.componentsStatus[code][name] = true;
          }
        });
      }
    },
    openProductFn009 () {
      let v = this;
      v.productType = 'addPackageGoods009';
      // let data = v.componentsModel['wms-service-package-declare-009'].rangeOfGoods;
      /* if(data.productGoodsIds.length> 0) {
       v.addProductValue = data.productGoodsIds.split(',').map(i=>{
       return {

       }
       })
       } */
      this.openProductFn();
    },
    openProductFn () {
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    getShipment (type) { // 获取运输类型平台
      let v = this;
      v.axios.get(api.get_queryEnablePlatform).then(response => {
        if (response.data.code === 0) {
          v.shipmentPlatformList = response.data.datas;
          v.getShimentSites(v.componentsModel['wms-service-package-declare-001'].platformIds, type);
        }
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
          if (v.componentsModel['wms-service-package-declare-001'].siteIds && v.componentsModel['wms-service-package-declare-001'].siteIds.length > 0 && v.componentsModel['wms-service-package-declare-001'].siteIds.includes(n.siteId)) {
            hasSiteIds.push(n.siteId);
          }
        });
        v.sitesList = sitesArr;
        if (hasSiteIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['wms-service-package-declare-001'].siteIds = hasSiteIds;
          });
        } else {
          v.componentsModel['wms-service-package-declare-001'].siteIds = [];
        }
      } else {
        v.componentsModel['wms-service-package-declare-001'].siteIds = [];
      }
      if (v.platformAccountList.length > 0) {
        let hasSaleAccountIds = []; // 还存在的账号
        v.platformAccountList.forEach(i => {
          if (v.componentsModel['wms-service-package-declare-001'].saleAccountIds && v.componentsModel['wms-service-package-declare-001'].saleAccountIds.length > 0 && v.componentsModel['wms-service-package-declare-001'].saleAccountIds.includes(i.saleAccountId)) {
            hasSaleAccountIds.push(i.saleAccountId);
          }
        });
        if (hasSaleAccountIds.length > 0) {
          v.$nextTick(() => {
            v.componentsModel['wms-service-package-declare-001'].saleAccountIds = hasSaleAccountIds;
          });
        } else {
          v.componentsModel['wms-service-package-declare-001'].saleAccountIds = [];
        }
      } else {
        v.componentsModel['wms-service-package-declare-001'].saleAccountIds = [];
      }
      v.componentsStatus['wms-service-package-declare-001'].siteIds = !!type.siteIds;
      v.componentsStatus['wms-service-package-declare-001'].saleAccountIds = !!type.saleAccountIds;
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
          v.shipmentSearch();
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    saveShopifyLogisticsMode () {
      // shopify 新增运输类型
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
    setTagValue (checkboxArr) { // 运输类型产生tag
      let v = this;
      let arr = [];
      for (let i = 0; i < checkboxArr.length; i++) {
        let prefix = checkboxArr[i].split(':')[0];
        let item = checkboxArr[i].split(':')[1].split(':')[0];
        for (let t = 0; t < v.smShippingMethodList.length; t++) {
          let subItem = v.smShippingMethodList[t];
          if (item === subItem.shippingMethodName) {
            arr.push(prefix + ':' + subItem.shippingMethodDescription);
          }
          if (i === checkboxArr.length - 1 && t === v.smShippingMethodList.length - 1) {
            v.shipmentTagModel = arr;
          }
        }
      }
    },
    getSite (val) { // 获取站点
      let v = this;
      v.shipmentPlatformSiteList = [];
      v.shipmentPlatformSite = '';
      v.shipmentSearchValue = '';
      for (let i = 0; i < v.shipmentPlatformList.length; i++) {
        let item = v.shipmentPlatformList[i];
        if (item.platformId === val && item.sites.length > 0) {
          v.hasSite = true;
          v.getSmShippingMethod(val, item.sites[0].siteId);
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
    shipmentSearch () {
      let v = this;
      v.getSmShippingMethod(v.shipmentPlatformModel, v.shipmentPlatformSite, v.shipmentSearchValue);
    },
    setSite (val) {
      this.getSmShippingMethod(this.shipmentPlatformModel, val);
    },
    getSmShippingMethod (platformId, siteId) {
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
          if (!this.$common.isEmpty(this.shipmentSearchValue)) {
            this.smShippingMethodList = response.data.datas.filter(item => {
              return item.shippingMethodDescription.toLowerCase().indexOf(this.shipmentSearchValue.toLowerCase()) > -1;
            });
          } else {
            this.smShippingMethodList = response.data.datas;
          }
        }
      });
    },
    processingRulesItemData (data) { // 加载时处理已选条件
      let v = this;
      let platArr = [];
      let sitesArr = [];
      let accountArr = [];
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
                  if (rc === 'O012' || rc === 'O010' || rc === 'O014' || rc === 'O015' || rc === 'O016' || rc === 'O017' || rc === 'O018') { // 如果是单选
                    subObj.value = bItem.value;
                  } else { // 如果是多选
                    if (subObj.hasOwnProperty('autoRuleParamValues') && bItem.ruleItemParamValues) {
                      subObj.autoRuleParamValues.push(bItem.ruleItemParamValues);
                    } else {
                      subObj.autoRuleParamValues = bItem.ruleItemParamValues;
                    }
                  }
                }
                if (rc !== 'wms-service-package-declare-010' && rc !== 'wms-service-package-declare-004' && rc !== 'O012' && rc !== 'wms-service-package-declare-003' && rc !== 'O010' && rc !== 'O008' && rc !== 'O006' && rc !== 'O005' && rc !== 'O011' && rc !== 'O004' && rc !== 'O003' && rc !== 'W004' && rc !== 'wms-service-package-declare-001' && rc !== 'wms-service-package-declare-005' && rc !== 'wms-service-package-declare-006' && rc !== 'wms-service-package-declare-007' && rc !== 'wms-service-package-declare-008' && rc !== 'wms-service-package-declare-009' && rc !== 'wms-service-package-declare-002' && rc !== 'O014' && rc !== 'O015' && rc !== 'O016' && rc !== 'O017' && rc !== 'O018') {
                  let skusArr = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) { // 读取选项数据
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'skus') {
                      skusArr.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = skusArr.toString();
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
                    if (oItem.name === 'categories' && c === bItem.ruleItemParamValues.length - 1) {
                      let arr = [];
                      bItem.ruleItemParamValues.forEach((n, i) => {
                        arr.push(n.value);
                      });
                      v.productCategoryIdList = arr;
                      v.getProductCategoryName(arr);
                    }
                  }
                } else if (rc === 'wms-service-package-declare-003') {
                  v.shippingParmas = bItem.ruleItemParamValues.map(i => {
                    return {
                      carrierId: i.value.split(',')[0],
                      shippingId: i.value.split(',')[1],
                      name: i.value.split(',')[2]
                    };
                  });
                } else if (rc === 'wms-service-package-declare-010') {
                  v.componentsModel[rc].categories = bItem.ruleItemParamValues.map(i => {
                    return i.value;
                  });
                  v.getProductCategoryName(v.componentsModel[rc].categories).then(data => {
                    v.productCategoryListName = data;
                  });
                } else if (rc === 'wms-service-package-declare-007') {
                  v.componentsModel[rc].productGoodsIds = bItem.ruleItemParamValues.map(i => {
                    return i.value;
                  }).join(',');
                } else if (rc === 'wms-service-package-declare-002') {
                  if (!(bItem.name === 'warehouseIds' && oItem.name === 'warehouseIds')) return;

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
                      if (res) fun(v.storeList, 1);
                    });
                  } else {
                    fun(storeList, 1);
                  }

                  // 从所有仓库中取仓库名(涉及权限，只能查看，不能编辑)
                  let allStorelist = v.allStorelist || [];
                  if (!allStorelist.length) {
                    v.getAllstore(0).then(res => {
                      if (res) fun(v.allStorelist, 2);
                    });
                  } else {
                    fun(allStorelist, 2);
                  }
                } else if (rc === 'wms-service-package-declare-008') {
                  if (bItem.name === 'startType') {
                    v.componentsModel[rc]['rangeOfGoods'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'startValue') {
                    v.componentsModel[rc]['rangeOfGoods'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['rangeOfGoods'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['rangeOfGoods'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['rangeOfGoods'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['rangeOfGoods'].checkbox2 = true;
                  }
                } else if (rc === 'wms-service-package-declare-006') {
                  if (bItem.name === 'startType') {
                    v.componentsModel[rc]['weightOfGoods'].beginType = Number(bItem.value);
                  } else if (bItem.name === 'startValue') {
                    v.componentsModel[rc]['weightOfGoods'].beginValue = Number(bItem.value);
                    v.componentsModel[rc]['weightOfGoods'].checkbox1 = true;
                  } else if (bItem.name === 'endType') {
                    v.componentsModel[rc]['weightOfGoods'].endType = Number(bItem.value);
                  } else if (bItem.name === 'endValue') {
                    v.componentsModel[rc]['weightOfGoods'].endValue = Number(bItem.value);
                    v.componentsModel[rc]['weightOfGoods'].checkbox2 = true;
                  }
                } else if (rc === 'wms-service-package-declare-009') {
                  if (bItem.name === 'startType') {
                    v.componentsModel[rc]['orderProductParams'].startType = Number(bItem.value);
                  } else if (bItem.name === 'startValue') {
                    v.componentsModel[rc]['orderProductParams'].startValue = Number(bItem.value);
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
                } else if (rc === 'wms-service-package-declare-005') {
                  if (bItem.name === 'totalPrices') {
                    let value = bItem.ruleItemParamValues[0].value;
                    if (value) {
                      v.componentsModel[rc]['packageAmountOfMoney'].currency = value.split(',')[0];
                      v.componentsModel[rc]['packageAmountOfMoney'].beginValue = value.split(',')[1];
                      v.componentsModel[rc]['packageAmountOfMoney'].endValue = value.split(',')[2];
                    }
                  }
                } else if (rc === 'wms-service-package-declare-004') {
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
                  if (bItem.name === 'postalCodeType') {
                    v.componentsModel[rc].postalCodeType = Number(bItem.value);
                  }
                  if (bItem.name === 'buyerPostalCodes') {
                    if (v.componentsModel['wms-service-package-declare-004'].postalCodeType === 0) {
                      let val = bItem.ruleItemParamValues[0].value;
                      if (val && val.indexOf('-') > 0) {
                        v.postcodeOne = val.split('-')[0];
                        v.postcodeTwo = val.split('-')[1];
                      } else {
                        v.postcodeOne = val;
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
                } else if (rc === 'wms-service-package-declare-001') { // 订单来源处理
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
                                  arr.push(n.accountCode);
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
                } else if (rc === 'O003') {
                  if (bItem.name === 'shipmentTypes' && oItem.name === 'shipmentTypes') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let tagArr = [];
                    val.forEach((n, i) => {
                      arr.push(n.value);
                      let pre = n.value.split(':')[0];
                      let des = n.value.split(':')[2];
                      tagArr.push(pre + ':' + des);
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
                      let val = bItem.ruleItemParamValues[0].value;
                      if (val && val.indexOf('-') > 0) {
                        v.postcodeOne = val.split('-')[0];
                        v.postcodeTwo = val.split('-')[1];
                      } else {
                        v.postcodeOne = val;
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
    setRulesGroup (type, data) { // 分组
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
    changeValue (val, item) { // 下拉多选，如果选择全部，则干掉其他选项
      let v = this;
      let value = v.componentsModel[val][item];
      if (value.indexOf('all') >= 0) {
        v.componentsModel[val][item] = ['all'];
      }
    },
    handleSubmit () {
      let v = this;
      let arr = [];
      // let status = false;// 判定是否校验完成
      return new Promise(resolve => {
        if (v.actionParams.ruleName === '') {
          v.$Message.error('规则名不能为空');
          v.loading = false;
          return false;
        }
        for (let item in v.componentsStatus) { // 扫componentsStatus 的key
          let subArr = [];// autoRuleParams
          let changeItem = v.getRuleCode(item);
          let sub = v.componentsStatus[changeItem];
          for (let subItem in sub) { // 扫componentsStatus 的key 里面对象的key,获取当前业务类型
            let child = sub[subItem];
            for (let u = 0; u < v.rulesModel.length; u++) { // 检查选定的已选条件
              let ruleItem = v.rulesModel[u];
              if (ruleItem === item) { // 勾选有效， 做值校验
                if (changeItem === 'wms-service-package-declare-001' && v.componentsModel[changeItem]['platformIds'].length === 0) {
                  v.$Message.error('已选条件下订单来源指定平台不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-002' && v.componentsModel[changeItem]['warehouseIds'].length === 0) {
                  v.$Message.error('已选条件下指定仓库不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-003' && v.shippingParmas.length === 0) {
                  v.$Message.error('已选条件下实际发货邮寄方式不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-007' && v.componentsModel[changeItem].productGoodsIds.length === 0) {
                  v.$Message.error('已选条件下包裹货品属于指定货品不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-010' && v.componentsModel[changeItem].categories.length === 0) {
                  v.$Message.error('已选条件下包裹货品属于指定分类不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O003' && v.shipmentTagModel.length === 0) {
                  v.$Message.error('已选条件下运输类型不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O004' && v.componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下订单目的地指定国家不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'W004' && v.shopSkuModel === null) {
                  v.$Message.error('请选择店铺SKU规则开头或者结束');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'W004' && v.shopSkuModel !== null) {
                  if (v.shopSkuModel === 0 && v.shopSku.start === '') {
                    v.$Message.error('店铺SKU开头内容不能为空');
                    v.loading = false;
                    return false;
                  } else if (v.shopSkuModel === 1 && v.shopSku.end === '') {
                    v.$Message.error('店铺SKU结尾内容不能为空');
                    v.loading = false;
                    return false;
                  }
                } else if (changeItem === 'O005' && v.componentsModel[changeItem]['states'] === '') {
                  v.$Message.error('已选条件下指定洲/省不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O006' && v.componentsModel[changeItem]['cities'] === '') {
                  v.$Message.error('已选条件下订单收货地址城市不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O008' && (v.componentsModel[changeItem]['priceRange'].lowerProfit === '' && v.componentsModel[changeItem]['priceRange'].upperProfit === '')) {
                  v.$Message.error('已选条件下订单利润不能都为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O009' && (v.componentsModel[changeItem]['productCategories'].length === 0 && v.componentsModel[changeItem]['skus'] === '' && v.componentsModel[changeItem]['productTags'].length === 0)) {
                  v.$Message.error('已选条件下订单产品分类指定SKU和商品标签不能都为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-011' && (v.componentsModel[changeItem]['productTags'].length === 0)) {
                  v.$Message.error('已选条件下货品标签不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'O011' && (v.componentsModel[changeItem].productKeyword.length === 0 || v.componentsModel[changeItem].productKeyword[0].value === '')) {
                  v.$Message.error('已选条件下产品刊登标题所含关键字不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-008' && ((!v.componentsModel[changeItem].rangeOfGoods.checkbox1 && !v.componentsModel[changeItem].rangeOfGoods.checkbox2))) {
                  v.$Message.error('已选条件下包裹货品总数量指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-006' && ((!v.componentsModel[changeItem].weightOfGoods.checkbox1 && !v.componentsModel[changeItem].weightOfGoods.checkbox2))) {
                  v.$Message.error('已选条件下包裹总重量指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-009' && ((!v.componentsModel[changeItem].orderProductParams.checkbox1 && !v.componentsModel[changeItem].orderProductParams.checkbox2) || !v.componentsModel[changeItem].orderProductParams.skus)) {
                  v.$Message.error('已选条件下选择指定货品且数量指定范围');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-004' && v.componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下订单目的地指定国家不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'wms-service-package-declare-005' && (v.componentsModel[changeItem]['packageAmountOfMoney'].currency === '' || v.componentsModel[changeItem]['packageAmountOfMoney'].currency === null)) {
                  v.$Message.error('已选条件下包裹总金额不能为空');
                  v.loading = false;
                  return false;
                }
                // status = true;// 设置校验完毕
                if (child || (v.componentsModel[changeItem][subItem] && v.componentsModel[changeItem][subItem].length > 0) || changeItem === 'O008' || changeItem === 'wms-service-package-declare-003' || changeItem === 'wms-service-package-declare-005' || changeItem === 'wms-service-package-declare-008' || changeItem === 'wms-service-package-declare-007' || changeItem === 'wms-service-package-declare-006' || changeItem === 'wms-service-package-declare-004' || changeItem === 'wms-service-package-declare-010' || changeItem === 'wms-service-package-declare-009' || changeItem === 'O003' || changeItem === 'W004') { // 这块代码虽然没BUG，但业务代码处理不太好，以后有时间要修改下 #001
                  if (changeItem !== 'O012' && changeItem !== 'wms-service-package-declare-003' && changeItem !== 'O011' && changeItem !== 'O010' && changeItem !== 'O008' && changeItem !== 'O006' && changeItem !== 'wms-service-package-declare-005' && changeItem !== 'wms-service-package-declare-010' && changeItem !== 'wms-service-package-declare-008' && changeItem !== 'wms-service-package-declare-006' && changeItem !== 'wms-service-package-declare-007' && changeItem !== 'wms-service-package-declare-009' && changeItem !== 'O005' && changeItem !== 'O003' && changeItem !== 'W004' && changeItem !== 'O014' && changeItem !== 'O015' && changeItem !== 'O016' && changeItem !== 'O017' && changeItem !== 'O018') { // 根据业务类型和接口规则进行拼接处理
                    let childArr = [];
                    let subItemList = v.componentsModel[changeItem][subItem];
                    if (subItem !== 'buyerPostalCodes' && subItemList && subItemList.length > 0) {
                      if (subItem === 'skus') {
                        subItemList = v.componentsModel[changeItem][subItem].split(',');
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
                    if (changeItem === 'O004' && subItem === 'buyerPostalCodes' && v.postcodeOne !== '') {
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
                      if (v.postcodeTwo !== '') {
                        let value = v.postcodeOne + '-' + v.postcodeTwo;
                        value = value === '-' ? null : value;
                        if (value) {
                          obj.autoRuleParamValues = [
                            {
                              value: value
                            }
                          ];
                        }
                      } else {
                        if (v.postcodeOne) {
                          obj.autoRuleParamValues = [
                            {
                              value: v.postcodeOne
                            }
                          ];
                        }
                      }
                      if (obj.autoRuleParamValues.length > 0) {
                        subArr.push(obj);
                      }
                    } else if (changeItem === 'order-service-A004' && v.postcodeArea !== '') {
                      let arr = [];
                      let postcodeArea = v.postcodeArea.split(',');
                      subArr.push({
                        name: 'countryCodes',
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
                    } else if (changeItem === 'O004' && subItem === 'buyerPostalCodes' && v.postcodeArea !== '') {
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
                    } else if (changeItem === 'wms-service-package-declare-004' && subItem === 'buyerPostalCodes' && v.postcodeOne !== '') {
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
                      if (v.postcodeTwo !== '') {
                        obj.autoRuleParamValues = [
                          {
                            value: v.postcodeOne + '-' + v.postcodeTwo
                          }
                        ];
                      } else {
                        if (v.postcodeOne !== '') {
                          obj.autoRuleParamValues = [
                            {
                              value: v.postcodeOne
                            }
                          ];
                        }
                      }
                      if (obj.autoRuleParamValues.length > 0) {
                        subArr.push(obj);
                      }
                    } else if (changeItem === 'wms-service-package-declare-004' && subItem === 'buyerPostalCodes' && v.postcodeArea !== '') {
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
                  } else if (changeItem === 'wms-service-package-declare-003') {
                    let values = v.shippingParmas.map(i => {
                      return {
                        value: i.carrierId + ',' + i.shippingId + ',' + i.name
                      };
                    });
                    subArr.push({
                      name: 'shippingMethodIds',
                      type: 1,
                      autoRuleParamValues: values
                    });
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
                      shippingArr.push({
                        value: shipItem
                      });
                      if (i === v.shipmentCheckBoxModel.length - 1) {
                        subArr.push({
                          name: 'shipmentTypes',
                          type: 1,
                          autoRuleParamValues: shippingArr
                        });
                      }
                    }
                  } else if (changeItem === 'wms-service-package-declare-010') {
                    let ids = v.componentsModel[changeItem]['categories']
                      ? v.componentsModel[changeItem]['categories']
                      : [];
                    subArr.push({
                      name: 'categories',
                      type: 1,
                      autoRuleParamValues: ids.map(i => {
                        return {
                          value: i
                        };
                      })
                    });
                  } else if (changeItem === 'wms-service-package-declare-007') {
                    let ids = v.componentsModel[changeItem]['productGoodsIds'].split(',');
                    subArr.push({
                      name: 'productGoodsIds',
                      type: 1,
                      autoRuleParamValues: ids.map(i => {
                        return {
                          value: i
                        };
                      })
                    });
                  } else if (changeItem === 'wms-service-package-declare-005') {
                    subArr.push({
                      name: 'totalPrices',
                      type: 1,
                      autoRuleParamValues: [
                        {
                          value: v.componentsModel[changeItem][subItem].currency + ',' + v.componentsModel[changeItem][subItem].beginValue + ',' + v.componentsModel[changeItem][subItem].endValue
                        }
                      ]
                    });
                  } else if (changeItem === 'wms-service-package-declare-006') {
                    let list = [];
                    let params = v.componentsModel['wms-service-package-declare-006'].weightOfGoods;
                    if (params.checkbox1) {
                      list.push({
                        name: 'startType',
                        type: 0,
                        value: params.beginType
                      }, {
                        name: 'startValue',
                        type: 0,
                        value: params.beginValue
                      });
                    }
                    if (params.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: params.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: params.endValue
                      });
                    }
                    subArr = list;
                  } else if (changeItem === 'wms-service-package-declare-009') {
                    let list = [];
                    let zip = v.componentsModel['wms-service-package-declare-009'].orderProductParams;
                    if (zip.skus) {
                      let arr = [];
                      let pos = [];
                      if (typeof zip.skus === 'string') {
                        pos = zip.skus.split(',');
                      } else {
                        pos = zip.skus;
                      }
                      // console.log(pos);
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
                  } else if (changeItem === 'wms-service-package-declare-008') {
                    let list = [];
                    let params = v.componentsModel['wms-service-package-declare-008'].rangeOfGoods;
                    if (params.checkbox1) {
                      list.push({
                        name: 'startType',
                        type: 0,
                        value: params.beginType
                      }, {
                        name: 'startValue',
                        type: 0,
                        value: params.beginValue
                      });
                    }
                    if (params.checkbox2) {
                      list.push({
                        name: 'endType',
                        type: 0,
                        value: params.endType
                      }, {
                        name: 'endValue',
                        type: 0,
                        value: params.endValue
                      });
                    }
                    subArr.push(...list);
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
        resolve([true, arr]);
      });
    },
    saveButton () {
      let v = this;
      v.handleSubmit().then(result => {
        if (result[0]) {
          let url = api.update_packageDeclareAutoRule;
          let postType = 'put';
          let obj;
          let valid = v.$refs.detailForm.validMt();
          if (!valid) {
            return;
          }
          let ruleDetail = v.$refs.detailForm.setParams();
          ruleDetail.ruleSetMatchId = v.autoRuleId;
          obj = {
            businessId: v.ruleParmas.businessId,
            autoRuleId: v.autoRuleId,
            autoRuleActions: [
              {
                'type': 'packageDeclareCheck',
                'value': null
              }
            ],
            name: v.actionParams.ruleName,
            autoRuleItems: result[1],
            status: v.actionParams.status,
            packageRuleDetails: ruleDetail
          };
          if (v.ruleParmas.editType === 'add') {
            postType = 'post';
          }
          // v.loading = true;
          v.axios[postType](url, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('保存成功');
              v.loading = false;
              v.$emit('closeModal', 1);
            }
          }).catch(() => {
            v.loading = false;
          });
        }
      });
    },
    closeRuleModal () {
      let v = this;
      v.$emit('closeModal', 0);
    },
    handleAdd () {
      this.index++;
      this.componentsModel['O011'].productKeyword.push({
        value: ''
      });
    },
    handleRemove (index) {
      this.componentsModel['O011'].productKeyword.splice(index, 1);
    },
    getProductTags () {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.wmsErpCommon + api.get_label).then(response => {
          if (response.data.code === 0) {
            v.productTagList = response.data.datas;
            resolve(true);
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
      // let v = this;
      // let nodesArr = v.$refs['treeDataRef'].getCheckedNodes();
      // let arr = [];
      // nodesArr.forEach((n, i) => {
      //   if (n.hasOwnProperty('zoneCode')) {
      //     arr.push(n.zoneCode);
      //   }
      // });
      // v.componentsModel['wms-service-package-declare-004'].countryCodes = arr;

      const allText = Object.values(this.countryJson).map(m => m.title);
      const otherText = this.textareaCountryCodes.filter(t => !allText.includes(t));
      let treeVal = [];
      let treeText = [];
      this.isChangeTreecountryCodes = true;
      if (val.length === 0) {
        this.textareaCountryCodes = otherText;
        this.componentsModel['wms-service-package-declare-004'].countryCodes = treeVal;
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
      this.componentsModel['wms-service-package-declare-004'].countryCodes = treeVal;
    },
    getCommonCountryName (selectArr) { // 获取对应国家名字
      let v = this;
      if (!selectArr || selectArr.length === 0) return false;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTreeName(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.wmsErpCommon + api.commonService + api.get_commonCountry).then(response => {
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
    getCommonCountry (selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
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

        function makeTree (data) {
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
      });
    },
    getPostCodeType (value) {
      let v = this;
      v.postcodeOne = '';
      v.postcodeTwo = '';
      v.postcodeArea = '';
    },
    getWarehouseList () { // 获取开启权重的仓库列表
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
    changeData (val) {
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
    }
  },
  mounted () {
    let v = this;
    v.$watch(function () {
      return v.componentsModel['wms-service-package-declare-001'].platformIds;
    }, function (n, o) {
      if (JSON.stringify(n) !== JSON.stringify(o)) {
        // v.componentsModel['wms-service-package-declare-001'].siteIds = [];
        // v.componentsModel['wms-service-package-declare-001'].saleAccountIds = [];
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
.key-alert .ivu-alert-message {
  white-space: normal;
}
.country-codes-calss{
  .vue-treeselect__x-container{
    display: none;
  }
}
</style>
<style scoped lang="less">
.rulesRightHeight, .normalPaddingLeft {
  height: 600px;
  overflow: auto;
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
</style>
