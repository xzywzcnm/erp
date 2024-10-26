<template>
  <div class="acceptCommon">
    <Row class="normalTop">
      <Col :md="{ span: 6 }" :lg="{ span: 5 }" class="acceptCommonTable">
      <Card :bordered="true" :style="{height: getPermission('carrier_listDefine') ? '507px' : '801px',marginBottom: '20px'}" v="curHeight">
        <p slot="title">{{ acceptTitle }}</p>
        <div class="enable-disable-switchover">
          <div class="switchover-item" :class="{'active-btn': activeItem[type].enable.state}" @click="switchoverView('enable', type)">启用</div>
          <div class="switchover-item" :class="{'active-btn': activeItem[type].disable.state}" @click="switchoverView('disable', type)">停用</div>
        </div>
        <div class="provider">
          <Table
            highlight-row
            :border="false"
            :show-header="false"
            :stripe="false"
            :columns="enableProviderColumns"
            :data="enableProviderData"
            :loading="tableProviderLoading"
            size="small"
            :height="getPermission('carrier_listDefine') ? '400' : '690'"
            @on-row-click="getTableList"
          />
        </div>
        <div class="noAcceptButton">
          <transition :duration="100" v-if="transitionSlow">
            <Button type="primary" v-if="!show && getPermission('carrier_queryForDisableCarriers')" @click="providerHandel" icon="android-add" style="width:100%; border-radius: 0">未启用物流商 </Button>
          </transition>
        </div>
        <transition name="slide-fade">
          <div v-if="show" style="position: relative;z-index: 100">
            <div class="acceptSelectProviderHeader">
              <dytInput v-model="asphValue" class="asphInput" placeholder="输入名称搜索" @on-enter="searchDisableCarriers" />
            </div>
            <div class="acceptSelectProviderBody">
              <Table highlight-row :border="false" :show-header="false" :stripe="false" :columns="disableProviderColumns" :data="disableProviderData" size="small" height="200" @on-selection-change="getSelectValue" @on-row-click="disableProviderRowClick"></Table>
            </div>
            <div class="acceptSelectOperate flexBox">
              <Button size="small" style="margin: 0 10px 5px 0" @click="cancelProvider">取消 </Button>
              <Button type="primary" size="small" style="margin: 0 10px 5px 0" @click="addProvider">确定 </Button>
            </div>
          </div>
        </transition>
      </Card>
      <Card :bordered="true" style="height: 340px;" v-show="type === '01' && getPermission('carrier_listDefine')">
        <p slot="title">已启用物流商(自定义)</p>
        <div class="enable-disable-switchover">
          <div class="switchover-item" :class="{'active-btn': activeItem.define.enable.state}" @click="switchoverView('enable', 'define')">启用</div>
          <div class="switchover-item" :class="{'active-btn': activeItem.define.disable.state}" @click="switchoverView('disable', 'define')">停用</div>
        </div>
        <div class="provider">
          <Table
            highlight-row
            :border="false"
            :show-header="false"
            :stripe="false"
            height="230"
            :columns="customLogisticsColumns"
            :data="customData"
            :loading="tableCustomLoading"
            size="small"
            @on-row-click="getTableCustomList"
          />
        </div>
        <div class="noAcceptButton">
          <transition :duration="100" v-if="transitionSlow">
            <Button type="primary" v-if="!show && getPermission('carrier_addDefine')" @click="addCustom" icon="android-add" style="width:100%; border-radius: 0">添加自定义物流 </Button>
          </transition>
        </div>
      </Card>
      </Col>
      <Col :md="{ span: 17 , offset:1}" :lg="{ span: 18 , offset:1 }" v-if="accountStatus">
      <!--物流商-->
      <Card v-if="accept === '1' || type === '02'" :bordered="true" class="acceptCommonTable">
        <!--账号、仓库-->
        <p slot="title" v-if="type === '01'">账号</p>
        <p slot="title" v-else>仓库</p>
        <div v-if="getPermission('carrier_queryForEnableCarriers') && getPermission('carrier_queryByCarrierId')">
          <div class="accountContainer">
            <div v-if="showStatus === 'API_AE_LG' || showStatus === 'API_EDIS' || showStatus === 'api_joomLogistics'">
              <Tabs type="card" @on-tab-remove="delAccount" @on-click="getTabIndex" v-model="tabsValue">
                <TabPane v-for="(tab,index) in accountList" :key="index" :name="index.toString()" :label="tab.account"></TabPane>
                <TabPane name="moreAccout" v-if="tabs.length > 20" label="更多账号请使用搜索"></TabPane>
                <dyt-select style="width:130px; position: relative; top: -2px; margin-right: 25px;" ref="resetSelect" v-if="tabs.length>1" filterable v-model="selectTabs" @click.native="setTabs" @on-change="selectValue" slot="extra">
                  <Option v-for="(tab, index) in tabs" :value="index + 1" :key="tab.carrierAccountId">{{ tab.account }}</Option>
                </dyt-select>
                <Button @click="addAccount" size="small" slot="extra">添加账号 </Button>
              </Tabs>
              <div>
                <div class="tabContainer">
                  <Form ref="tabs" :label-width="75" label-position="left">
                    <Row>
                      <Col :md="{ span: 11 }" :lg="{ span: 8 }">
                      <FormItem prop="account" label="帐号名称">
                        <span style="color:#2D8CF0;">{{ tabs[tabsValue].account }}</span>
                      </FormItem>
                      </Col>
                    </Row>
                    <div style="font-size:12px;" v-if="showStatus === 'API_AE_LG'">
                      速卖通线上发货揽收范围及价目表请参见： <a target="_blank" href="http://seller.aliexpress.com/so/online_logistics_pickup.php">http://seller.aliexpress.com/so/online_logistics_pickup.php</a>
                    </div>
                    <div style="font-size:12px;margin-top:20px;">
                      <span v-if="showStatus === 'API_AE_LG'">同步速卖通线上发货地址信息：</span>
                      <span v-if="showStatus === 'API_EDIS'">同步eDis的发货地址信息与偏好设置：</span>
                      <span v-if="showStatus === 'api_joomLogistics'">同步joom的上门揽收仓库地址信息：</span>
                      <Button @click="synchro(tabs[tabsValue].carrierAccountId)" size="small">同步 </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
            <div v-else-if="showStatus === 'API_WINIT_OUTSTORE'">
              <p class="card-tit">账号信息</p>
              <Form ref="winit" :model="winitForm">
                <!--<FormItem prop="account" label="状态">
                    <i-switch  v-model="winitForm.switchStatus" size="large" @on-change="changeWinitStatus">
                      <span slot="open">启用</span>
                      <span slot="close">停用</span>
                    </i-switch>
                  </FormItem>-->
                <Row>
                  <Col span="6">
                  <FormItem label="服务商">
                    {{ carrierName }}
                  </FormItem>
                  </Col>
                  <Col span="6">
                  <FormItem label="仓库代码">
                    {{ winitForm.carrierCode }}
                  </FormItem>
                  </Col>
                  <Col span="6">
                  <FormItem label="仓库名称">
                    {{ winitForm.carrierName }}
                  </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="6">
                  <FormItem label="userName*">
                    {{ winitForm.userName }}
                  </FormItem>
                  </Col>
                  <Col span="6">
                  <FormItem label="token*">
                    {{ winitForm.token }}
                  </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span="6">
                  <FormItem label="授权状态">
                    <span v-if="accountModel && accountModel[0] && accountModel[0].authStatus === 1" class="greenColor">已授权</span> <span v-else class="redColor">未授权</span>
                    <Button class="normalLMargin" @click="gotoAuth(accountModel[0].carrierAccountId)" size="small">{{
                            accountModel && accountModel[0] && accountModel[0].authStatus === 1 ? '重新授权' : '去授权'
                          }} </Button>
                  </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
            <div v-else>
              <Tabs type="card" @on-tab-remove="delAccount" @on-click="getTabIndex" v-model="tabsValue">
                <TabPane v-for="(tab,index) in tabs" :key="index" :name="index.toString()" :label="tab.account">
                  <div class="tabContainer" :v="tab.carrierId">
                    <Form ref="tabs" :rules="accountRules" :label-width="120" label-position="right">
                      <Row>
                        <Col>
                        <FormItem prop="account" label="状态：">
                          <i-switch :disabled="editStatus[index] && (switchStatus[index] && getPermission('carrier_disable') || !switchStatus[index] && getPermission('carrier_enable'))" v-model="switchStatus[index]" size="large">
                            <span slot="open">启用</span> <span slot="close">停用</span>
                          </i-switch>
                        </FormItem>
                        </Col>
                      </Row>
                      <Row>
                        <Col>
                        <FormItem
                          prop="account"
                          label="帐号名称："
                          v-if="!['cne', 'rinid', 'nf', 'amloutstore'].includes((warehouseCode || '').toLocaleLowerCase())"
                        >
                          <dytInput v-model.trim="tab.account" class="ivu-input-wrapper-width" :disabled="editStatus[index] || showStatus === 'API_VOVA'"></dytInput>
                        </FormItem>
                        </Col>
                      </Row>
                      <Row>
                        <template
                          v-if="accountModel.length > 0 && accountModel[index] && accountModel[index].hasOwnProperty('carrierParamList')&& accountModel[index].carrierParamList"
                        >
                          <template v-for="(item, i) in accountModel[index].carrierParamList">
                            <template v-if="accountModel[index].authType === '02'">
                              <Col :key="i" v-if="item.paramType !== 'hide'">
                              <FormItem :prop="item.paramKey" :label="`${item.paramName}：`" :key="i">
                                <dytInput
                                  class="ivu-input-wrapper-width"
                                  v-model.trim="item.paramValue"
                                  :disabled="editStatus[index] || item.paramType === 'readOnly'"
                                  :maxlength="inputMaxlength[item.paramKey] || ''"
                                />
                              </FormItem>
                              </Col>
                            </template>
                          </template>
                        </template>
                      </Row>
                      <Row>
                        <template v-if="accountModel.length > 0 && accountModel[index]">
                          <template v-if="accountModel[index].authType === '02'">
                            <Col>
                            <FormItem label="授权状态：">
                              <span class="greenColor">{{
                                      accountModel[index].authStatus === 0
                                        ? '未授权'
                                        : accountModel[index].authStatus === 1
                                        ? '已授权'
                                        : accountModel[index].authStatus === 2 ? '授权过期' : ''
                                    }}</span>
                              <Button class="normalLMargin" @click="gotoAuth(accountModel[index].carrierAccountId)" size="small">{{
                                      accountModel[index].authStatus === 0 ? '去授权' : '重新授权'
                                    }} </Button>
                            </FormItem>
                            </Col>
                          </template>
                          <template v-if="(accountModel[index].authStatus === 0 || accountModel[index].authStatus === 2)&& accountModel[index].authType === '01'">
                            <div class="d-flex justify-content-start">
                              <div style="width: 180px; flex-shrink: 0">
                                <FormItem label="授权状态：">
                                  <span class="greenColor">{{
                                        accountModel[index].authStatus === 0
                                          ? '未授权'
                                          : accountModel[index].authStatus === 1
                                          ? '已授权'
                                          : accountModel[index].authStatus === 2 ? '授权过期' : ''
                                      }}</span>
                                  <Button class="normalLMargin" @click="gotoAuthOne" size="small">{{
                                        accountModel[index].authStatus === 0 ? '去授权' : '重新授权'
                                      }} </Button>
                                </FormItem>
                              </div>
                              <template>
                                <div v-for="(item, i) in accountModel[index].carrierParamList" style="margin-left: 20px;" :key="i">
                                  <FormItem
                                    :prop="item.paramKey"
                                    :label="`${item.paramName}：`"
                                    :key="i"
                                    v-if="['input'].includes(item.paramType)"
                                  >
                                    <dytInput
                                      v-if="item.paramType === 'input'"
                                      v-model.trim="item.paramValue"
                                      :maxlength="inputMaxlength[item.paramKey] || ''"
                                    />
                                  </FormItem>
                                </div>
                              </template>
                              <template v-if="showAuthOne">
                                <div style="flex-shrink: 0">
                                  <Button class="normalLMargin" @click="confrimAuth(index)">保存 </Button>
                                  <Button class="normalLMargin" @click="cancleAuth" style="margin-left: 10px">取消 </Button>
                                </div>
                              </template>
                            </div>
                          </template>
                          <template v-if="accountModel[index].authStatus == 0 && accountModel[index].authType === '03'">
                            <Col
                              v-for="(item, i) in accountModel[index].carrierParamList"
                              :md="{ span: 24 }"
                              :lg="{ span: 24 }"
                              :key="`col-${i}`"
                            >
                              <template v-if="['hide', 'select', 'input'].includes(item.paramType)">
                                <FormItem v-if="item.paramType === 'hide'" v-show="false" :prop="item.paramKey" :label="`${item.paramName}：`">
                                  <!-- 缓存数据，不显示 -->
                                  <span v-if="item.paramType === 'hide'" v-show="false">{{ item.paramValue }}</span>
                                </FormItem>
                                <FormItem v-else-if="item.paramType === 'select'" :prop="item.paramKey" :label="`${item.paramName}：`" class="carrier-param-item">
                                  <dyt-select class="ivu-input-wrapper-width" v-model.trim="item.paramValue" :disabled="editStatus[index]">
                                    <Option v-for="(k,ind) in item.carrierParamDictionaryList" :key="ind" :value="k.itemValue">{{ k.itemName }}</Option>
                                  </dyt-select>
                                </FormItem>
                                <FormItem v-else :prop="item.paramKey" :label="`${item.paramName}：`" class="carrier-param-item">
                                  <dytInput
                                    class="ivu-input-wrapper-width"
                                    v-if="item.paramType === 'input'"
                                    v-model.trim="item.paramValue"
                                    :disabled="editStatus[index]"
                                    :maxlength="inputMaxlength[item.paramKey] || ''"
                                  />
                                </FormItem>
                              </template>
                            </Col>
                          </template>
                          <template v-for="(item, i) in accountModel[index].carrierParamList">
                            <FormItem
                              :label="`${item.paramKey}：`"
                              :key="i"
                              v-if="accountModel[index].authType !== '03' && item.apiType === '0' && showStatus !== 'API_WINIT_EXPRESS' && item.paramType !== 'hide'"
                              class="carrier-param-item"
                            >
                              <span :class="accountModel[index].authStatus == 0 ? 'redColor' : 'greenColor'">{{ item.paramValue }}</span>
                            </FormItem>
                          </template>
                        </template>
                      </Row>
                      <Row v-if="isPms">
                        <Col>
                          <FormItem prop="businessDeptIds" label="账号适用事业部:">
                            <CheckboxGroup v-model="tab.businessDeptIds">
                              <Checkbox v-for="item in businessDeptList" :label="item.id" :disabled="editStatus[index]" :key="item.id">{{item.name}}</Checkbox>
                            </CheckboxGroup>
                          </FormItem>
                        </Col>
                      </Row>
                      <Row>
                        <template v-if="accountModel.length > 0 && accountModel[index] && accountModel[index].hasOwnProperty('carrierAccountAddressList') && accountModel[index].carrierAccountAddressList.length > 0">
                          <div v-for="(item, i) in accountModel[index].carrierAccountAddressList" :key="i">
                            <div class="normalTop addresseeMes">
                              {{ item.addressDesc }}
                            </div>
                            <div class="normalTop clear" v-if="showStatus !== 'API_VOVA'">
                              <Col
                                v-for="(subItem, subIndex) in accountModel[index].carrierAccountAddressList[i].carrierParamList"
                                :md="{ span: 24 }"
                                :lg="{ span: 24 }"
                                :key="subIndex"
                              >
                                <FormItem v-if="subItem.paramType === 'hide'" :prop="subItem.paramKey" v-show="false" :label="subItem.paramName">
                                  <!-- 缓存数据，不显示 -->
                                  <span v-if="subItem.paramType === 'hide'" v-show="false">{{ subItem.paramValue }}</span>
                                </FormItem>
                                <FormItem
                                  v-else-if="['input', 'select', 'readOnly'].includes(subItem.paramType)"
                                  :prop="subItem.paramKey"
                                  :label="`${subItem.paramName}：`"
                                >
                                  <dytInput
                                    v-if="subItem.paramType === 'input'"
                                    v-model.trim="subItem.paramValue"
                                    style="width:220px;"
                                    :disabled="editStatus[index]"
                                  />
                                  <dyt-select
                                    v-if="subItem.paramType === 'select'"
                                    v-model.trim="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                  >
                                    <Option v-for="(s,t) in formValidate.country" :key="t" :value="s.twoCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <span v-if="subItem.paramType === 'readOnly'">{{ subItem.paramValue }}</span>
                                </FormItem>
                              </Col>
                            </div>
                            <div class="normalTop clear" v-if="showStatus === 'API_VOVA'">
                              <Col
                                v-for="(subItem, subIndex) in accountModel[index].carrierAccountAddressList[i].carrierParamList"
                                :md="{ span: 24 }"
                                :lg="{ span: 24 }"
                                :key="subIndex"
                              >
                                <FormItem v-if="subItem.paramType === 'hide'" :prop="`${subItem.paramName}：`" v-show="false" :label="subItem.paramName">
                                  <!-- 缓存数据，不显示 -->
                                  <span v-if="subItem.paramType === 'hide'" v-show="false">{{ subItem.paramValue }}</span>
                                </FormItem>
                                <FormItem
                                  v-else-if="['input', 'select', 'readOnly'].includes(subItem.paramType)"
                                  :prop="subItem.paramKey"
                                  :label="`${subItem.paramName}：`"
                                >
                                  <dytInput
                                    v-if="subItem.paramType === 'input' &&
                                    !['senderState', 'senderCity', 'senderStreet', 'pickupState', 'pickupCity', 'pickupStreet'].includes(subItem.paramKey)"
                                    v-model.trim="subItem.paramValue"
                                    style="width:220px;"
                                    :disabled="editStatus[index]"
                                  />
                                  <dyt-select
                                    v-if="subItem.paramType === 'select' && !['senderCountry', 'pickupCountry'].includes(subItem.paramKey)"
                                    v-model="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                  >
                                    <Option v-for="(s,t) in formValidate.country" :key="t" :value="s.twoCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <dyt-select
                                    ref="vovaCountry"
                                    v-if="['senderCountry', 'pickupCountry'].includes(subItem.paramKey)"
                                    v-model="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                  >
                                    <Option v-for="(s,t) in vovaCountry" :key="t" :value="s.valueCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <dyt-select
                                    ref="stateSelect"
                                    v-if="['senderState', 'pickupState'].includes(subItem.paramKey)"
                                    v-model="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                    @on-open-change="vovaStateChange(subItem.paramKey)"
                                  >
                                    <Option v-for="(s,t) in vovaState" :key="t" :value="s.valueCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <dyt-select
                                    ref="citySelect"
                                    v-if="['senderCity', 'pickupCity'].includes(subItem.paramKey)"
                                    v-model="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                    @on-open-change="vovaCityChange(subItem.paramKey)"
                                  >
                                    <Option v-for="(s,t) in vovaCity" :key="t" :value="s.valueCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <dyt-select
                                    ref="streetSelect"
                                    v-if="['senderStreet', 'pickupStreet'].includes(subItem.paramKey)"
                                    v-model="subItem.paramValue"
                                    :disabled="editStatus[index]"
                                    style="width:220px;"
                                    filterable
                                    @on-open-change="vovaStreetChange(subItem.paramKey)"
                                  >
                                    <Option v-for="(s,t) in vovaStreet" :key="t" :value="s.valueCode">{{ s.cnName }}</Option>
                                  </dyt-select>
                                  <span v-if="subItem.paramType === 'readOnly'">{{ subItem.paramValue }}</span>
                                </FormItem>
                              </Col>
                            </div>
                          </div>
                        </template>
                      </Row>
                    </Form>
                    <div class="tabOperate">
                      <Button size="small" v-if="editStatus[index] && getPermission('carrierAccount_save')" style="margin-right:5px" @click="editTabs(index)">编辑 </Button>
                      <Button size="small" type="primary" v-if="!editStatus[index]&& getPermission('carrierAccount_save')" style="margin-right:5px" @click="saveAccount(index)">保存 </Button>
                      <Button size="small" type="error" v-if="!editStatus[index]&& getPermission('carrierAccount_save')" style="margin-right:5px" @click="cancelSave(index)">取消 </Button>
                    </div>
                  </div>
                </TabPane>
                <dyt-select style="width:130px; position: relative; top: -2px; margin-right: 25px;" ref="resetSelect" v-if="tabs.length>1" filterable v-model="selectTabs" @on-change="selectValue" slot="extra">
                  <Option v-for="(tab, index) in tabs" :value="index + 1" :key="tab.carrierAccountId">{{ tab.account }}</Option>
                </dyt-select>
                <Button @click="handleTabsAdd" size="small" v-if="getPermission('carrier_insertWithApi')" v-show="type === '01'" slot="extra">增加 </Button>
              </Tabs>
            </div>
          </div>
        </div>
        <Spin size="large" fix v-if="spinShow"></Spin>
      </Card>
      <!--自定义物流-->
      <Card v-if="accept === '2' && type === '01'" :bordered="true" class="acceptCommonTable">
        <p slot="title">账号</p>
        <div class="p20">
          <p class="f14 mb10">物流商信息
            <Button class="fr mr10" v-if="editCustomLogistics && getPermission('carrier_updateDefine')" type="primary" size="small" @click="editCustomLogisticsFn">编辑</Button>
            <Button v-if="!editCustomLogistics" size="small" type="error" class="fr mr10" @click="cancelCustomLogisticsFn">取消</Button>
            <Button v-if="!editCustomLogistics" size="small" type="success" @click="editCustom" class="fr mr10">保存</Button>
          </p>
          <Form ref="formInline1" :model="formInline" :rules="ruleInline">
            <FormItem prop="status" label="状态">
              <i-switch size="large" :disabled="editCustomLogistics" v-model="formInline.status" :true-value=1 :false-value=0>
                <span slot="open">启用</span> <span slot="close">停用</span>
              </i-switch>
            </FormItem>
            <FormItem label="自定义物流类型">
              <RadioGroup v-model="formInline.carrierType">
                <Radio v-for="item in customTypeList" :key="item.value" disabled :label='item.value'>{{ item.label }}
                </Radio>
              </RadioGroup>

            </FormItem>
            <FormItem label="自定义物流商代码" prop="carrierCode">
              <dytInput v-model="formInline.carrierCode" :disabled="editCustomLogistics" :maxlength="500"></dytInput>
            </FormItem>
            <FormItem label="自定义物流商名称" prop="carrierName">
              <dytInput v-model="formInline.carrierName" :disabled="editCustomLogistics" :maxlength="500" />
            </FormItem>
          </Form>
        </div>
      </Card>
      <Card :bordered="true" class="normalTop">
        <p slot="title">物流渠道</p>
        <Poptip v-if="accept === '1'" slot="extra" :transfer="true" v-model="disbaleShippingMethodModel" @on-popper-show="getShppingMethodData" @on-poper-hide="resetShippingMethodData" placement="top-end" width="400">
          <Button icon="md-add" type="primary" size="small" style="margin-top:-8px">未启用物流方式 </Button>
          <div slot="content">
            <dytInput v-model="disableShippingMethodSearchName" placeholder="输入名称搜索" @on-enter="searchDisableShippingMehotd"></dytInput>
            <div class="disableTable normalTop">
              <Table highlight-row :border="false" :show-header="false" :stripe="false" :columns="disbaleShippingMethodColumns" :data="disbaleShippingMethodData" size="small" height="150" @on-selection-change="getDisableSelectValue"></Table>
            </div>
            <div class="acceptSelectOperate flexBox">
              <Button size="small" style="margin: 0 10px 5px 0" @click="disbaleShippingMethodModel = false">取消 </Button>
              <Button type="primary" size="small" style="margin: 0 10px 5px 0" @click="enableShippingMethod">确定 </Button>
            </div>
          </div>
        </Poptip>
        <Button v-if="accept === '2' && getPermission('carrierShippingMethod_addDefine')" size="small" type="primary" slot="extra" @click="addCustomChannel">新建自定义物流 </Button>
        <div>
          <div class="accountShippingMethod">
            <div class="filter_box">
              <div>
                <span>物流渠道名称/代码：</span>
                <dytInput
                  v-model.trim="logisticsChannelText"
                  clearable
                  style="width: 250px;"
                  placeholder="请输入物流渠道名称或代码"
                />
              </div>
              <div>
                <Button
                  v-if="getPermission('carrierShippingMethod_enable')"
                  type="primary"
                  @click="disableChannel"
                  :loading="disableLoading"
                >停用</Button>
              </div>
            </div>
            <Table
              highlight-row
              border
              :columns="logistiChannelColumns"
              :data="logistiChannelData"
              max-height="500"
              @on-selection-change="tableChoseValueChange"
            />
          </div>
        </div>
      </Card>
      </Col>
      <Col :md="{ span: 17 , offset:1}" :lg="{ span: 18 , offset:1 }" v-if="!accountStatus">
      <div class="noContent">
        <img src="@/assets/images/noContent.gif" alt="no content">
        <div>没有找到相关内容</div>
      </div>
      </Col>
    </Row>
    <!--添加自定义-->
    <div v-if="modal3">
      <Modal v-model="modal3" title="新建自定义物流">
        <Form ref="formInline" :model="formInline" :rules="ruleInline">
          <FormItem prop="user" label="请选择自定义物流类型">
            <RadioGroup v-model="formInline.carrierType">
              <Radio v-for="item in customTypeList" :key="item.value" :label='item.value'>{{ item.label }}
              </Radio>
            </RadioGroup>

          </FormItem>
          <FormItem label="自定义物流商代码" prop="carrierCode">
            <dytInput v-model="formInline.carrierCode" :maxlength="500"></dytInput>
          </FormItem>
          <FormItem label="自定义物流商名称" prop="carrierName">
            <dytInput v-model="formInline.carrierName" :maxlength="500" />
          </FormItem>
        </Form>
        <div slot="footer">
          <Button @click="addCustomLogistics" type="primary">保存 </Button>
          <Button @click="modal3 = false">关闭</Button>
        </div>
      </Modal>
    </div>

    <!--设置/编辑/新增自定义物流渠道弹窗-->
    <logisticsChannel
      v-if="setShippingMethodModelStatus"
      :type="type"
      :accept="accept"
      :activeCarrierName="activeCarrierName"
      :setShippingMethodModelStatus="setShippingMethodModelStatus"
      :showShippingSettingId="showShippingSettingId"
      :looKsettings="looKsettings"
      :platformGroup="platformGroup"
      :formInline="formInline"
      :openType="openType"
      :NewCustomLogistics="NewCustomLogistics"
      :showStatus="showStatus"
      :tabIndex="tabIndex"
      :tabs="tabs"
      @changeStatus="changeStatus"
      @changeOpenType="changeOpenType"
      @changeNewCustomLogistics="changeNewCustomLogistics"
      @changeShippingMethodsTalg="changeShippingMethodsTalg"
    />

    <!--复制物流渠道-->
    <copyAccept
      ref="copyAccept"
      @getList="getEnableShippingMethods(activeCarrierId)"
      :logisti-data="logistiChannelData"
      :other-data="choseLogisticsChannel"
      :shippingMethodId="activeShippingMethodId"
      :acceptName="acceptName"
    />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';
import copyAccept from './copyAccept';
import logisticsChannel from './logisticsChannelModal';

const apiInterfaceList = {
  winitoutstore: '万邑通',
  AMAZON_FBA: '亚马逊',
  gcoutstore: '谷仓',
  fourpxoutstore: '递四方',
  pylOware: 'PYL',
  shloutstore: 'SHL',
  ocoutstore: 'EF',
  cne: 'CNE',
  rinid: '睿邑达',
  nf: '新火',
  amloutstore: '艾姆勒',
  thirdCarrier: '无对接'
}
export default {
  mixins: [Mixin, publicService],
  components: {
    copyAccept,
    logisticsChannel
  },
  data () {
    return {
      accountList: [],
      tabsList: [],
      businessDeptJson: {},
      businessDeptList: [],
      // 第三方渠道对应的对象
      thirdCarrierJson: {},
      // 当前选中的物流渠道
      choseLogisticsChannel: {},
      choseTabType: this.type,
      allCarrierListData: [],
      tableProviderLoading: false,
      tableCustomLoading: false,
      customIsChose: false,
      activeItem: {
        '01': {
          enable: {
            key: 'enable',
            state: true,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
          disable: {
            key: 'disable',
            state: false,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
        },
        '02': {
          enable: {
            key: 'enable',
            state: true,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
          disable: {
            key: 'disable',
            state: false,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
        },
        define: {
          enable: {
            key: 'enable',
            state: true,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
          disable: {
            key: 'disable',
            state: false,
            tabValue: null,
            tableIndex: null,
            carrierCode: null,
          },
        }
      },
      oldTabItem: {},
      isPms: false,
      disableLoading: false,
      choseTableRows: [],
      oldModelAccount: {},
      oldTab: {},
      oldStatus: {},
      warehouseCode: '',
      looKsettings: true,
      selectTabs: null,
      NewCustomLogistics: false,
      showShippingSettingId: null,
      openType: 'ship',
      cacheForm: null, // 缓存自定义data
      editCustomLogistics: true, // 自定义编辑状态
      customTypeList: [
        {
          label: '无需数据对接',
          value: 1
        }, {
          label: 'Excel对接',
          value: 2
        }
      ],
      accept: '1', // 1 物流商 2 自定义物流商
      formInline: {
        status: 0, // 自定义物流类型
        carrierType: 1, // 自定义物流类型
        carrierCode: '', // 自定义物流商代码
        carrierName: '' // 自定义物流商名称
      },
      customData: [],
      allCustomListData: [],
      ruleInline: {
        carrierCode: [
          {
            required: true,
            message: '请输入自定义物流商代码',
            trigger: 'blur'
          }
        ],
        carrierName: [
          {
            required: true,
            message: '请输入自定义物流商名称',
            trigger: 'blur'
          }
        ]
      },
      activeShippingMethodId: '', // 当前操作ShippingMethodId
      activeCarrierId: '', // 当前操作CarrierId
      acceptName: '',
      customLogisticsColumns: [
        {
          title: 'carrierName',
          key: 'carrierName'
        }, {
          title: 'status',
          key: 'status',
          render: (h, params) => {
            let status = params.row.status;
            if (status === 0) {
              return h('span', {
                style: {
                  color: 'red'
                }
              }, '停用');
            } else {
              return h('span', {
                style: {
                  color: 'green'
                }
              }, '启用');
            }
          }
        }
      ],
      tabsValue: '0', // end
      oldTabsValue: '0',
      winitForm: {
        switchStatus: false,
        carrierCode: '',
        carrierName: '',
        userName: '',
        token: ''
      },
      uploadFilesAction: api.wmsService + api.importWarehouseArea,
      modal3: false,
      choseCheckedCountryId: [],
      choseCheckedCountryList: [], // 适用范围
      spinShow: false,
      showAuthOne: false,
      systemShippingMethodId: null,
      shopAccountListModel: [],
      goodsTagList: [],
      shopAccount: null,
      rangeOfApplicationParams: null,
      discountModal: {
        costPrice: null,
        registrationFee: null,
        operatingCost: null
      }, // 未啟用物流商
      disableSystemCarrierId: [],
      disbaleShippingMethodModel: false,
      disableShippingMethodSearchName: '',
      disbaleShippingMethodData: [],
      disbaleShippingMethodColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return params;
          }
        }, {
          title: 'name',
          key: 'carrierShippingMethodName'
        }
      ],
      checkboxLimit: '0',
      limitWeighStatus: false,
      distribution: 0,
      distributionStatus: false,
      logisTypeList: [
        {
          value: 1,
          label: '平邮'
        }, {
          value: 2,
          label: '挂号'
        }, {
          value: 3,
          label: '转线'
        }, {
          value: 4,
          label: '商业快递'
        }, {
          value: 5,
          label: 'FBA头程'
        }
      ],
      platformGroup: [], // set shippingMethod
      shippingMethodSpinLoading: true,
      setShippingMethodModelStatus: false,
      setShippingMethodStatus: false,
      activeCarrierName: '', // account
      accountStatus: false,
      accountModel: [],
      emptyAccountModel: [],
      editStatus: [],
      accountParams: {
        account: ''
      },
      accountRules: {
        account: [
          {
            validator: this.validateEmpty(),
            trigger: 'blur'
          }
        ],
        apiDeveloperToken: [
          { required: true, message: 'DeveloperToken不能为空', trigger: 'blur' }
        ],
      },
      inputMaxlength: {
        'apiDeveloperToken': 200
      },
      logistiChannelDetailsModal: false,
      logistiChannelDetailsModalStatus: false,
      logistiChannelColumns: [],
      logistiChannelData: [],
      originalData: [],
      tabs: [
        {
          businessDeptIds: [],
          account: '帐号1',
          carrierAccountId: ''
        }
      ],
      switchStatus: [], // 账号状态
      asphValue: '',
      show: false,
      transitionSlow: true,
      disableProviderColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return params;
          }
        }, {
          title: 'name',
          key: 'carrierName'
        }
      ],
      enableProviderData: [],
      disableProviderData: [],
      carrierCodeList: [],
      enableTableHeight: 0,
      loadStatus: false,
      carrierId: '',
      showStatus: null,
      editPriceModalModalStatus: false,
      editPriceModalColumns: [],
      editIndex: null, // 编辑运费下标
      carrierCodeStr: null,
      carrierShippingMethodPriceModelId: null,
      carrierAccountId: null,
      vovaCountry: [],
      vovaState: [],
      vovaCity: [],
      vovaStreet: [],
      tabIndex: null,
      channelModalData: [],
      logisticsChannelText: ''
    };
  },
  props: {
    type: {
      type: String,
      default: '01' // 01 API对接  02 第三方物流
    }
  },
  watch: {

    curHeight (n, o) {
      if (n !== o) {
        this.getEnableHeight();
      }
    },
    tabs (n, o) {
      if (n && n !== o) {
        this.accountList = n.slice(0, 20);
      }
    },
    show (n, o) {
      if (n !== o) {
        this.getEnableHeight();
      }
    },
    // 模糊搜索物流渠道名称/代码
    logisticsChannelText: {
      deep: true,
      handler (value) {
        this.filterLogistiData(value, this.originalData);
      }
    },
    //
    businessDept: {
      deep: true,
      immediate: true,
      handler (val) {
        this.businessDeptList = val;
        val.forEach(item => {
          this.$set(this.businessDeptJson, item.id, item);
        })
      }
    }
  },
  computed: {
    carrierName () {
      if (this.showStatus) {
        if (this.showStatus === 'API_WINIT_OUTSTORE') {
          return '万邑通';
        } else if (this.showStatus === 'API_AMAZON_OUTSTORE') {
          return '亚马逊';
        }
      }
    },
    // 获取事业部
    businessDept () {
      return this.$store.getters.getBusinessDeptList || []
    },
    enableProviderColumns () {
      if (this.type === '01') {
        return [
          {
            title: 'carrierName',
            key: 'carrierName'
          },
          {
            title: 'status',
            key: 'status',
            render: (h, params) => {
              if (this.$common.isEmpty(params.row.carrierAccounts)) {
                return h('div', {
                  class: 'redColor'
                }, '未授权');
              }
              return h('div', {
                class: 'greenColor'
              }, params.row.carrierAccounts.length + '帐号');
            }
          }
        ];
      } else if (this.type === '02') {
        return [
          {
            title: 'apiInterface',
            render: (h, { row }) => {
              if (this.$common.isEmpty(row.apiCode)) return h('span', '');
              const txt = apiInterfaceList[row.apiCode];
              return h('span', this.$common.isFunction(txt) ? txt(row) : txt || '');
            }
          },
          {
            title: 'carrierName',
            key: 'carrierName'
          }
        ];
      }
    },
    acceptTitle () {
      if (this.type === '01') {
        return '已启用物流商(API对接)';
      } else if (this.type === '02') {
        return '第三方仓服务商';
      }
    },
    allCountryList () {
      let arr = [];
      this.countryCodesName.forEach(i => {
        arr = arr.concat(...i.countries);
      });
      return arr;
    },
    countryList () {
      if (this.countryCodesName) {
        return this.countryCodesName.map(i => {
          i.checked = false;
          return i;
        });
      } else {
        return [];
      }
    },
    curHeight () {
      return (this.domHeight - 180) < 300 ? 280 : (this.domHeight - 180);
    },
    disableTableHeight () {
      if (this.show) {
        return this.curHeight / 2 - 80;
      } else {
        return 0;
      }
    }
  },
  activated () {
    this.startLoading();
    this.getEnableHeight();
  },
  mounted () {
    setTimeout(this.getCountrys(), 2000);
    this.makePlatformGroup();
    this.getCurrencyInfo();
    this.oldTabItem = this.$common.copy(this.activeItem);
  },
  methods: {
    setTabs () {
      this.tabsList = this.tabs;
    },
    filterLogistiData (value, data = []) {
      if (value !== '') {
        let text = value.toLowerCase();
        this.logistiChannelData = data.filter(item => {
          return (item.carrierShippingMethodCode.toLowerCase().indexOf(text) !== -1 || item.carrierShippingMethodName.toLowerCase().indexOf(text) !== -1)
        });
      } else {
        this.logistiChannelData = data;
      }
    },
    addCustomChannel () {
      this.openType = 'addCustom';
      this.NewCustomLogistics = true;
      this.looKsettings = false;
      this.$nextTick(() => {
        this.changeStatus(true);
      })
    },
    editCustomLogisticsFn () {
      // 编辑自定义物流
      this.cacheForm = JSON.parse(JSON.stringify(this.formInline));
      this.editCustomLogistics = !this.editCustomLogistics;
    },
    cancelCustomLogisticsFn () {
      // 自定义物流 取消
      this.formInline = Object.assign(this.formInline, this.cacheForm);
      this.editCustomLogistics = true;
    },
    editCustom () {
      let v = this;
      // 编辑自定义物流
      let params = '?carrierId=' + v.formInline.carrierId + '&carrierCode=' + v.formInline.carrierCode + '&carrierName=' + v.formInline.carrierName + '&status=' + v.formInline.status;
      v.$refs['formInline1'].validate((valid) => {
        if (valid) {
          v.axios.put(api.update_carrierListDefine + params).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.getCustomList();
            }
          });
        }
      });
    },
    addCustom () {
      let v = this;
      v.formInline.carrierType = 1;
      v.formInline.carrierCode = '';
      v.formInline.carrierName = '';
      v.modal3 = true;
    },
    addCustomLogistics () {
      let v = this;
      v.$refs['formInline'].validate((valid) => {
        if (valid) {
          let params = '?carrierName=' + v.formInline.carrierName + '&carrierCode=' + v.formInline.carrierCode + '&carrierType=' + v.formInline.carrierType;
          v.axios.post(api.add_carrierAddDefine + params).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('添加成功');
              v.getCustomList();
              v.modal3 = false;
            }
          });
        }
      });
    },
    // 获取自定义物流渠道数据
    getCustomList () {
      return new Promise((resolve) => {
        if (!this.getPermission('carrier_listDefine')) return resolve([]);
        this.allCustomListData = [];
        this.tableCustomLoading = true;
        this.axios.get(api.get_carrierListDefine).then(response => {
          if (!response || !response.data || response.data.code != 0) return resolve([]);
          this.allCustomListData = response.data.datas || [];
          this.editCustomLogistics = true;
          this.filterCustomTableData('define', this.customIsChose);
          this.tableCustomLoading = false;
          resolve(response.data.datas || []);
        }).catch(() => {
          this.tableCustomLoading = false;
          resolve([]);
        });
      })
    },
    // 过滤自定义物流渠道数据
    filterCustomTableData (type, isChose) {
      if (type != 'define') return;
      const choseItem = Object.values(this.activeItem[type]).find(f => f.state);
      const allData = this.allCustomListData.map(m => {
        return { ...m, _highlight: false };
      });
      if (this.$common.isEmpty(choseItem)) {
        this.customData = allData;
        if (isChose) {
          // 高亮选中
          this.$set(this.customData[0], '_highlight', true);
          this.getTableCustomList(this.customData[0], 0, this.customIsChose);
        }
        return;
      }
      let enableList = [];
      let disableList = [];
      allData.forEach(item => {
        if (item.status == 1) {
          enableList.push(item);
        } else {
          disableList.push(item);
        }
      });
      this.customData = choseItem.key == 'enable' ? enableList : disableList;
      if (isChose && !this.$common.isEmpty(this.customData)) {
        if (this.$common.isEmpty(choseItem.tableIndex) || this.$common.isEmpty(this.customData[choseItem.tableIndex])) {
          choseItem.tableIndex = 0;
        }
        // 高亮选中
        this.$set(this.customData[choseItem.tableIndex], '_highlight', true);
        this.getTableCustomList(this.customData[choseItem.tableIndex], choseItem.tableIndex, this.customIsChose);
      }
    },
    providerHandel () {
      if (this.type === '01') {
        this.show = !this.show;
      } else if (this.type === '02') {
        this.$router.push({
          path: '/wareSetting'
        });
      }
    },
    getPricingReachStateData (reachStateArr) { // 整合通达国家数据
      let arr = [];
      if (reachStateArr) { // reachStateArr 不为null
        for (let i = 0; i < reachStateArr.length; i++) {
          let item = reachStateArr[i];
          arr.push(item.cnName);
          if (i === reachStateArr.length - 1) {
            return arr.toString();
          }
        }
      }
    },
    getEnableHeight () {
      let v = this;
      if (v.show) {
        v.enableTableHeight = v.curHeight / 2 - 60;
      } else {
        v.$nextTick(function () {
          v.enableTableHeight = v.curHeight - 80;
        }, 1000);
      }
    },
    slowHide (curHeight) {
      return curHeight - 1;
    },
    startLoading () {
      this.accept = '1';
      this.activeItem = this.$common.copy(this.oldTabItem);
      this.tableCustomLoading = true;
      this.getQueryForEnableCarriers(0, 0).finally(() => {
        this.getDisableCarriers().finally(() => {
          this.tableCustomLoading = false;
          if (this.type === '01') {
          // 在API对接才调 第三方物流不调用这个接口
            this.getCustomList();
          }
        })
      })
    },
    // 物流-查询可用物流商,index 第几个物流商 accountIndex 第几个帐号
    getQueryForEnableCarriers (index, accountIndex, type = false) {
      return new Promise((resolve, reject) => {
        if (!this.customIsChose) {
          // 取消自定义渠道高亮
          this.customData = this.customData.map(m => {
            return { ...m, _highlight: false }
          });
        }
        this.getEnableCarrierData(type).then(response => {
          this.choseTabType = this.type;
          this.accountStatus = !this.$common.isEmpty(response);
          this.enableProviderData = (this.filterTableData() || []).map(m => {
            return { ...m, _highlight: false }
          });
          if (!this.$common.isEmpty(this.enableProviderData) && !this.customIsChose) {
            let activeIndex = index;
            if (!this.$common.isEmpty(this.enableProviderData[index])) {
              this.$set(this.enableProviderData[index], '_highlight', true); // 高亮选中
            } else {
              this.$set(this.enableProviderData[0], '_highlight', true); // 高亮选中
              activeIndex = 0;
            }
            this.$nextTick(() => {
              this.getTableList(this.enableProviderData[activeIndex], activeIndex, accountIndex);
            });
          }
          resolve(this.accountStatus);
        }).catch(() => {
          resolve(false);
        });
      });
    },
    // 过滤标记非自定义的物流商
    filterTableData () {
      if (this.choseTabType != 'define') {
        const choseItem = Object.values(this.activeItem[this.choseTabType]).find(f => f.state);
        if (this.$common.isEmpty(choseItem)) {
          if (this.type === '01') {
            return (this.allCarrierListData || []).filter(i => {
              return i.apiType === 0 && i.carrierType === 0;
            });
          }
          if (this.type === '02') {
            return (this.allCarrierListData || []).filter(i => {
              return [1, 2].includes(Number(i.apiType)) && i.status === 1 && i.carrierType === 0;
            });
          }
        }
        let enableList = [];
        let disableList = [];
        let enableItem = {};
        if (this.type === '01') {
          (this.allCarrierListData || []).forEach(item => {
            if (item.apiType === 0 && item.carrierType === 0) {
              if (!this.$common.isEmpty(item.carrierAccounts)) {
                enableItem = item.carrierAccounts.find(f => f.status == 1);
                if (this.$common.isEmpty(enableItem)) {
                  disableList.push(item);
                } else {
                  enableList.push(item);
                }
              } else {
                disableList.push(item);
              }
            }
          });
        } else if (this.type === '02') {
          (this.allCarrierListData || []).forEach(item => {
            if ([1, 2].includes(Number(item.apiType)) && item.status === 1 && item.carrierType === 0) {
              if (!this.$common.isEmpty(item.carrierAccounts)) {
                enableItem = item.carrierAccounts.find(f => f.status == 1);
                if (this.$common.isEmpty(enableItem)) {
                  disableList.push(item);
                } else {
                  enableList.push(item);
                }
              } else {
                disableList.push(item);
              }
            }
          });
        }
        return choseItem.key == 'enable' ? enableList : disableList;
      }
    },
    // 获取已启用物流商(API对接)数据
    getEnableCarrierData (type) {
      return new Promise((resolve) => {
        if (type && !this.$common.isEmpty(this.allCarrierListData)) {
          return resolve(this.$common.copy(this.allCarrierListData));
        }
        this.allCarrierListData = [];
        this.spinShow = true;
        this.tableProviderLoading = true;
        this.axios.get(api.get_enableCarriers).then(res => {
          if (!res || !res.data || res.data.code != 0 || this.$common.isEmpty(res.data.datas)) return resolve([]);
          let newList = [];
          let thirdParty = {};
          res.data.datas.forEach(item => {
            if (this.$common.isEmpty(item.apiCode)) {
              newList.push(item);
            } else {
              // 将 apiCode 不为空的分组
              if (this.$common.isUndefined(thirdParty[item.apiCode])) {
                this.$set(thirdParty, item.apiCode, [item]);
              } else {
                thirdParty[item.apiCode].push(item);
              }
            }
          });
          this.thirdCarrierJson = this.$common.copy(thirdParty);
          const thirdCarrier = thirdParty.thirdCarrier; // 无对接
          delete thirdParty.thirdCarrier;
          newList = this.$common.flat([newList, Object.values(thirdParty), thirdCarrier]);
          this.allCarrierListData = this.$common.copy(newList);
          this.tableProviderLoading = false;
          this.spinShow = false;
          resolve(newList);
        }).catch((err) => {
          this.tableProviderLoading = false;
          this.spinShow = false;
          console.error(err);
          resolve([]);
        })
      })
    },
    // 点击 已启用物流商(自定义) 列表行时
    getTableCustomList (row, index, notClick = true) {
      this.customIsChose = notClick;
      this.accept = '2';
      this.showStatus = row.apiInterface; // 存一下当前选中的物流商
      this.editCustomLogistics = true; //
      this.formInline.status = row.status;
      this.formInline.carrierType = row.carrierType;
      this.formInline.carrierCode = row.carrierCode;
      this.formInline.carrierName = row.carrierName;
      this.formInline.carrierId = row.carrierId;
      Object.keys(this.activeItem.define).forEach(key => {
        if (this.activeItem.define[key].state) {
          this.activeItem.define[key].tableIndex = index;
          this.activeItem.define[key].carrierCode = row.carrierCode;
        }
      });
      if (this.customIsChose) {
        // 取消对接渠道高亮
        this.enableProviderData = this.enableProviderData.map(m => {
          return { ...m, _highlight: false }
        });
      }
      this.getEnableShippingMethods(row.carrierId);
    },
    // 点击已启用物流商(API对接)列表行时
    getTableList (data, index, tabIndex) {
      this.choseLogisticsChannel = this.$common.copy({
        thirdPartyLogistics: this.type == '02',
        row: data,
        thirdCarrierJson: this.thirdCarrierJson
      });
      let carrierIndex = tabIndex;
      if (this.$common.isEmpty(carrierIndex)) {
        this.customIsChose = false;
        carrierIndex = 0;
        // 取消自定义渠道高亮
        this.customData = this.customData.map(m => {
          return { ...m, _highlight: false }
        });
      }
      if (this.$common.isEmpty(this.enableProviderData)) return;
      this.accept = '1';
      this.selectTabs = '';
      this.tabs = [];
      this.editStatus = [];
      this.winitForm.carrierCode = data.carrierCode;
      this.winitForm.carrierName = data.carrierName;
      this.showStatus = data.apiInterface; // 存一下当前选中的物流商
      this.activeCarrierName = data.carrierName; // 存一下当前选中的物流商
      this.carrierId = data.carrierId;
      this.isPms = [0, '0'].includes(data.isPms);
      this.warehouseCode = data.apiCode;
      let cIndex = 0;
      if (data.apiInterface === 'API_AE_LG') { // 速卖通线上发货
        if (this.enableProviderData[index].carrierAccounts !== null && this.enableProviderData[index].carrierAccounts.length > 0) {
          this.enableProviderData[index].carrierAccounts.forEach((n, i) => {
            this.editStatus.push(true);
            let obj = {
              account: this.enableProviderData[index].carrierAccounts[i].account,
              carrierAccountId: this.enableProviderData[index].carrierAccounts[i].carrierAccountId
            }
            if (this.isPms) {
              const businessDept = this.enableProviderData[index].carrierAccounts[i].businessDeptIdList;
              let newM = null;
              if (!this.$common.isEmpty(businessDept)) {
                obj['businessDeptIds'] = this.$common.isString(businessDept) ? businessDept.split(',').map(m => {
                  newM = Number(m);
                  return this.$common.isEmpty(newM) ? m : newM;
                }) : businessDept.map(m => {
                  newM = Number(m);
                  return this.$common.isEmpty(newM) ? m : newM;
                });
              } else {
                obj['businessDeptIds'] = [];
              }
            }
            this.tabs.push(obj);
          });
          this.carrierAccountId = this.enableProviderData[index].carrierAccounts[0].carrierAccountId;
        } else {
          this.logistiChannelData = [];
        }
        this.getEnableShippingMethods(data.carrierId);
      } else {
        if (this.enableProviderData[index].carrierAccounts !== null && this.enableProviderData[index].carrierAccounts.length > 0) {
          this.enableProviderData[index].carrierAccounts.forEach((n, i) => {
            this.editStatus.push(true);
            let obj = {
              account: this.enableProviderData[index].carrierAccounts[i].account,
              carrierAccountId: this.enableProviderData[index].carrierAccounts[i].carrierAccountId
            }
            if (this.isPms) {
              const businessDept = this.enableProviderData[index].carrierAccounts[i].businessDeptIdList;
              let newM = null;
              if (!this.$common.isEmpty(businessDept)) {
                obj['businessDeptIds'] = this.$common.isString(businessDept) ? businessDept.split(',').map(m => {
                  newM = Number(m);
                  return this.$common.isEmpty(newM) ? m : newM;
                }) : businessDept.map(m => {
                  newM = Number(m);
                  return this.$common.isEmpty(newM) ? m : newM;
                });
              } else {
                obj['businessDeptIds'] = [];
              }
            }
            this.tabs.push(obj);
          });
          if (carrierIndex >= 0 && carrierIndex <= this.tabs.length - 1) {
            cIndex = carrierIndex;
          }
          this.carrierId = this.enableProviderData[index].carrierAccounts[cIndex].carrierId;
          this.carrierAccountId = this.enableProviderData[index].carrierAccounts[cIndex].carrierAccountId;
          this.getCarrierAccount(this.enableProviderData[index].carrierAccounts[cIndex].carrierId);// 默认查询第一个帐号信息
          this.getEnableShippingMethods(this.enableProviderData[index].carrierAccounts[cIndex].carrierId);
        } else {
          this.editStatus.push(false);
          this.getEnableShippingMethods(data.carrierId);
          this.carrierId = this.enableProviderData[index].carrierId;
          this.carrierAccountId = this.enableProviderData[index].carrierAccountId;
          this.logistiChannelData = [];
          this.accountModel = [];
          this.handleTabsAdd();
        }
      }
      // 显示哪个标签
      if (!this.$common.isEmpty(this.tabs)) {
        this.tabs[cIndex].show = true;
        this.getTabIndex(cIndex);
        this.tabsValue = cIndex.toString();
      }
      Object.keys(this.activeItem[this.choseTabType]).forEach(key => {
        if (this.activeItem[this.choseTabType][key].state) {
          this.activeItem[this.choseTabType][key].tabValue = cIndex;
          this.activeItem[this.choseTabType][key].tableIndex = index;
          this.activeItem[this.choseTabType][key].carrierCode = this.enableProviderData[index].carrierCode;
        }
      });
    },
    getCarrierAccount (carrierId) { // 查询
      let v = this;
      let pos = [];
      if (!v.getPermission('carrier_queryForEnableCarriers')) return;
      v.spinShow = true;
      v.axios.get(api.get_carrierAccount + carrierId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          /* data.forEach((i, ind) => {
           i.carrierParamList.forEach((j, jnd) => {
           if (j.paramType === 'hide') {
           data[ind].carrierParamList.splice(jnd, 1);
           }
           });
           }); */

          data.forEach((n, i) => {
            if (n.status === 1) {
              pos.push(true);
            } else if (n.status === 0) {
              pos.push(false);
            }
          });
          v.switchStatus = pos;
          v.spinShow = false;
          if (v.showStatus === 'API_VOVA' && v.accountModel) {
            v.getVovaAddress();
          }

          if (v.showStatus === 'API_WINIT_OUTSTORE') {
            data[0].carrierParamList.forEach((n, i) => {
              if (n.paramKey === 'userName' && n.paramValue) {
                v.winitForm.userName = n.paramValue;
              } else if (n.paramKey === 'token' && n.paramValue) {
                v.winitForm.token = n.paramValue;
              }
            });
          }
          v.accountModel = data || [];
        } else {
          v.spinShow = false;
        }
      }).catch(() => {
        v.spinShow = false;
      });
    },
    // 查询未启用物流商
    getDisableCarriers (searchValue) {
      if (!searchValue) searchValue = '';
      return new Promise((resolve, reject) => {
        if (!this.getPermission('carrier_queryForAvailableCarriers')) return resolve(false);
        this.axios.get(api.get_disableCarriers + '?searchValue=' + searchValue).then(response => {
          if (response.data.code === 0) {
            this.disableProviderData = response.data.datas;
            resolve(true);
          }
        }).catch(() => {
          resolve(false);
        });
      });
    },
    handleTabsAdd () {
      let l = this.tabs.length + 1;
      this.editStatus.push(false);
      this.oldTabsValue = this.tabsValue;
      this.axios.get(api.get_newCarrierAccountModal + this.carrierId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.account = '帐号' + l;
          data.carrierId = this.carrierId;
          let obj = {
            isAddTab: true,
            account: data.account,
            carrierAccountId: data.carrierAccountId,
          }
          if (this.isPms) {
            obj['businessDeptIds'] = [];
          }
          this.tabs.push(obj);
          if (this.tabs.length > 0) {
            this.tabs.map((item) => {
              item.show = false;
            });
            // this.tabs[0].show = true;
            // this.tabsValue = 0;
            let talgIndex = this.tabs.length - 1;
            this.tabsValue = talgIndex.toString();
            this.getTabIndex(talgIndex);
          }
          this.accountModel.push(data);
        }
      });
    },
    cancelProvider () {
      let v = this;
      v.transitionSlow = false;
      v.show = false;
      v.carrierCodeList = [];
      setTimeout(function () {
        v.transitionSlow = true;
      }, 300);
    },
    searchDisableCarriers () {
      this.getDisableCarriers(encodeURIComponent(this.asphValue));
    },
    getSelectValue (value) {
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.carrierCode);
      })).then(() => {
        v.carrierCodeList = pos;
      });
    },
    getDisableSelectValue (value) {
      let v = this;
      let pos = [];
      if (value.length) {
        v.carrierCodeStr = value[0].carrierCode;
        Promise.resolve(value.forEach((n, i) => {
          pos.push({
            shippingMethodId: n.shippingMethodId,
            systemShippingMethodId: n.systemShippingMethodId
          }); // TE-3581 修改入参
        })).then(() => {
          v.disableSystemCarrierId = pos;
        });
      } else {
        v.disableSystemCarrierId = [];
      }
    },
    addProvider () { // 添加可用物流商
      let v = this;
      if (v.carrierCodeList.length === 0) {
        v.$Message.error('请选择物流商');
      } else {
        v.axios.post(api.add_withApi, JSON.stringify(v.carrierCodeList)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.getQueryForEnableCarriers(0, 0);
            v.getDisableCarriers();
            v.carrierCodeList = []; // 重置数据(否则第二次点击确认未选择物流商时会报错)
          } else {
            (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          }
        });
      }
    },
    disableProviderRowClick (data, index) { // 无效方法
      let v = this;
      if (!v.disableProviderData[index]._checked) {
        v.$nextTick(function () {
          v.disableProviderData[index]._checked = true;
        });
      } else {
        v.$nextTick(function () {
          v.disableProviderData[index]._checked = false;
        });
      }
    },
    editTabs (index) {
      this.editStatus.splice(index, 1, !this.editStatus[index]);
      this.$set(this.oldModelAccount, index, this.$common.copy(this.accountModel[index]));
      this.$set(this.oldTab, index, this.$common.copy(this.tabs[index]));
      this.$set(this.oldStatus, index, this.switchStatus[index]);
    },
    getNewShippingParamsObj (obj) {
      let arr = [];
      let v = this;
      return new Promise(resolve => {
        let len = Object.keys(obj.platformCarrierSettings).length;
        for (let item in obj.platformCarrierSettings) {
          len--;
          obj.platformCarrierSettings[item].forEach((n, i) => {
            v.platformGroup.forEach((m, t) => { // 如果勾选了
              if (n.platformId === m.platformId && m.checkboxStatus) {
                arr.push(n);
              }
            });
          });
          if (len === 0) {
            resolve(arr);
          }
        }
      });
    },
    makeTreeToArr (treeData) { // 试用平台帐号转化
      let arr = [];
      let obj = {};
      return new Promise(resolve => {
        treeData.forEach((n, i) => {
          if (n.platformId && !obj.hasOwnProperty(n.platformId)) {
            obj[n.platformId] = [n.saleAccountId];
          } else if (n.platformId && obj.hasOwnProperty(n.platformId) && obj[n.platformId] !== null) {
            obj[n.platformId].push(n.saleAccountId);
          } else if (!n.platformId && n.checked && n.saleAccountId === null) {
            obj[n.title] = null;
          }
        });
        for (let item in obj) {
          let newItem = {};
          newItem.platformId = item;
          newItem.saleAccountIds = obj[item];
          arr.push(newItem);
        }
        resolve([true, arr]);
      });
    },
    showShippingSetting (id, index) {
      this.showShippingSettingId = id;
      this.$nextTick(() => {
        this.changeStatus(true);
      })
    },
    // 启用(停用)
    stopShippingMethod (row, isEnable) {
      const id = row.shippingMethodId;
      const cid = row.carrierId;
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${isEnable ? '启' : '停'}用：<span style="color: #f20;">${row.carrierShippingMethodName}</span>`,
        onOk: () => {
          if (isEnable) {
            // 自定义 启用
            this.axios.put(api.set_carrierShippingMethodEnable, {
              'carrierId': cid,
              'shippingMethodEnableDetails': [
                {
                  'shippingMethodId': id
                }
              ]
            }).then(response => {
              if (response.data.code === 0) {
                this.$Message.success('操作成功');
                this.getEnableShippingMethods(cid);
              }
            });
            return;
          }
          // 停用
          this.axios.put(`${api.set_carrierShippingMethodDisable}?shippingMethodId=${id}`).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功');
              this.getEnableShippingMethods(cid);
            }
          });
        }
      });
    },
    // 批量停用
    disableChannel () {
      if (this.disableLoading) return;
      if (this.$common.isEmpty(this.choseTableRows)) return this.$Message.error('请选择需要停用的渠道');
      let ids = [];
      let cid = '';
      this.choseTableRows.filter(row => {
        return row.status === 1 || this.showStatus === 'API_AE_LG';
      }).forEach(m => {
        ids.push(m.shippingMethodId);
        if (!cid) {
          cid = m.carrierId;
        }
      });
      if (ids.length <= 0) return this.$Message.error('选择的渠道全部都不满足停用条件，请重新选择');
      let tips = `<div style="font-size: 16px;line-height: 1.4em;">确定停用<span style="color: #f20;">${ids.length}</span>条物流渠道？</div>`;
      if (ids.length < this.choseTableRows.length) {
        tips = `<div style="font-size: 16px;line-height: 1.4em;">
          选择的数据中有<span style="color: #f20;">${ids.length}</span>条渠道符合停用条件，
          <span style="color: #f20;">${this.choseTableRows.length - ids.length}</span>条不渠道不符合停用，
          确定停用<span style="color: #f20;">${ids.length}</span>条物流渠道？
        </div>`;
      }
      ids = this.$common.arrRemoveRepeat(ids);
      this.$Modal.confirm({
        title: '操作确认',
        content: tips,
        onOk: () => {
          this.disableLoading = true;
          this.axios.put(api.carrierBatchDisable, ids).then(res => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$Message.success('操作成功');
            this.getEnableShippingMethods(cid);
            this.disableLoading = false;
          });
        },
        onCancel: () => {}
      });
    },
    // 列表选择的行
    tableChoseValueChange (rows) {
      this.choseTableRows = rows || [];
    },
    cancelSave (index) {
      if (this.tabs[index].isAddTab) {
        this.tabsValue = this.oldTabsValue;
        this.tabs.splice(index, 1);
        this.accountModel.splice(index, 1);
        this.editStatus.splice(index, 1);
      } else {
        this.editStatus.splice(index, 1, !this.editStatus[index]);
        if (!this.$common.isEmpty(this.oldModelAccount[index])) {
          this.accountModel.splice(index, 1, this.$common.copy(this.oldModelAccount[index]));
          delete this.oldModelAccount[index];
        }
        if (!this.$common.isEmpty(this.oldTab[index])) {
          this.tabs.splice(index, 1, this.$common.copy(this.oldTab[index]));
          delete this.oldTab[index];
        }
        if (!this.$common.isEmpty(this.switchStatus[index])) {
          this.switchStatus[index] = this.oldStatus[index];
          delete this.oldStatus[index];
        }
      }
    },
    saveAccount (index) { // 保存帐号 index 物流商的第几个帐号
      let g = null;
      let accountModel = this.$common.copy(this.accountModel[index]);
      if (this.switchStatus[index]) {
        accountModel.status = 1;
      } else {
        accountModel.status = 0;
      }
      accountModel.account = this.tabs[index].account;
      this.enableProviderData.forEach((n, i) => {
        if (n.carrierId === this.carrierId) {
          g = i;
        }
      });
      // 当 pms 时
      if (this.isPms) {
        accountModel.businessDeptIdList = this.$common.isEmpty(this.tabs[index].businessDeptIds) ? [] : this.$common.copy(this.tabs[index].businessDeptIds);
      } else {
        delete accountModel.businessDeptIdList;
      }
      delete accountModel.businessDeptIds;

      this.axios.post(api.set_accountSaving, JSON.stringify(accountModel)).then(response => {
        if (response.data.code === 0) {
          delete this.tabs[index].isAddTab;
          this.$Message.success('操作成功');
          if (g !== null) this.getQueryForEnableCarriers(g, index);
          if (this.tabs[index].status) {
            this.tabs[index].status = false;
          }
          this.editStatus.splice(index, 1, !this.editStatus[index]);
          delete this.oldModelAccount[index];
          delete this.oldTab[index];
          delete this.oldStatus[index];
        }
      });
    },
    delAccount (index) { // 删除帐号
      let v = this;
      let g = null;
      let carrierAccountId = v.tabs[index].carrierAccountId;
      v.enableProviderData.forEach((n, i) => {
        if (n.carrierId === v.carrierId) {
          g = i;
        }
      });
      if (!v.tabs[index].status) {
        v.axios.delete(api.delete_carrierAccount + carrierAccountId).then(response => {
          if (response.data.code === 0) {
            if (g !== null) v.getQueryForEnableCarriers(g, index - 1);
            v.tabs.splice(index, 1);
            v.$Message.success('操作成功');
          }
        });
      } else {
        v.tabs.splice(index, 1);
      }
    },
    enableShippingMethod () { // 啟用物流商物流方式
      let v = this;
      if (v.disableSystemCarrierId.length === 0) {
        v.$Message.error('请勾选要启用的物流方式');
        return false;
      }
      let obj = {
        carrierId: v.carrierId,
        shippingMethodEnableDetails: v.disableSystemCarrierId
      };
      v.axios.put(api.set_carrierShippingMethodEnable, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.getShppingMethodData();
          v.getEnableShippingMethods(v.carrierId);
          v.disableSystemCarrierId = [];
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    searchDisableShippingMehotd () {
      let v = this;
      v.getShppingMethodData(v.disableShippingMethodSearchName);
    },
    getShppingMethodData (searchName) {
      let v = this;
      let value = '?carrierId=' + v.carrierId;
      if (searchName) value = value + '&&searchName=' + searchName;
      v.axios.get(api.get_queryForDisableShippingMethods + value).then(response => {
        if (response.data.code === 0) {
          v.disbaleShippingMethodData = response.data.datas;
        }
      });
    },
    resetShippingMethodData () { // 重置未啟用物流商數據
      let v = this;
      v.disableShippingMethodSearchName = '';
      v.disbaleShippingMethodData = [];
      v.disableSystemCarrierId = [];
    },
    makePlatformGroup () {
      let v = this;
      let platformGroup = v.$store.state.platformGroup;
      if (platformGroup === null) {
        v.getPlatformGroup(null, '/wms-service/erpCommon').then(result => {
          if (result) {
            v.platformGroup = v.$store.state.platformGroup;
          }
        });
      } else {
        v.platformGroup = platformGroup;
      }
    },
    synchro (val) { // 同步
      let v = this;
      v.axios.get(api.get_carrierAliexpressSync + '?saleAccountId=' + val + '&carrierId=' + v.carrierId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
        }
      });
    },
    addAccount () { // 添加账号
      window.location.href = '//' + window.location.host + '/setting-service/generalSettings.html#/shop/aliexpress';
    },
    gotoAuth (id) { // 去授权
      let newWindow = window.open('', '_blank');
      this.axios.get('/setting-service/carrierAccount/authUrl/' + id).then(response => {
        if (response.data.code === 0) {
          // window.location.href = response.data.datas;
          newWindow.location.href = response.data.datas;
        } else {
          newWindow.close();
        }
      }).catch(() => {
        newWindow.close();
      });
    },
    gotoAuthOne () { // 未授权01
      this.showAuthOne = true;
    },
    confrimAuth (index) {
      let v = this;
      let carrierAccountId = v.accountModel[index].carrierAccountId;
      let carrierParamList = v.accountModel[index].carrierParamList;
      let obj = {};
      carrierParamList.forEach((n, i) => {
        if (n.apiType === '1') {
          obj[n.paramKey] = n.paramValue;
        }
      });
      let params = {
        authParamMap: obj,
        carrierAccountId: carrierAccountId
      };
      v.axios.post(api.set_authSave, JSON.stringify(params)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('授权成功');
          v.showAuthOne = false;
          v.spinShow = true;
          v.$nextTick(function () {
            v.getCarrierAccount(v.accountModel[index].carrierId);
          });
        }
      });
    },
    cancleAuth () {
      this.showAuthOne = false;
    },
    getVovaAddress () { // 查询vova寄件人，揽收人地址中的国家、省、城市、街道下拉数据
      let v = this;
      let type = 0; // 0:country 1:state 2:city 3:district
      v.axios.get(api.get_vovaAddress + '?type=' + type).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.vovaCountry = data;
        }
      });
      v.$nextTick(function () {
        let code = v.$refs.vovaCountry[0].value; // 国家valueCode
        let code2 = v.$refs.stateSelect[0].value; // 省州valueCode
        let code3 = v.$refs.citySelect[0].value; // 城市valueCode
        if (code) {
          v.axios.get(api.get_vovaAddress + '?type=1').then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.vovaState = data;
            }
          });
        }
        if (code2) {
          v.axios.get(api.get_vovaAddress + '?type=2' + '&parentCode=' + code2).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.vovaCity = data;
            }
          });
        }
        if (code3) {
          v.axios.get(api.get_vovaAddress + '?type=3' + '&parentCode=' + code3).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.vovaStreet = data;
            }
          });
        }
      });
    },
    vovaStateChange (val) {
      let v = this;
      let code = v.$refs.vovaCountry[0].value; // 国家valueCode
      let status = v.$refs.stateSelect[0].visible; // true展开  false收起
      if (!code) {
        v.$Message.error('请先选择国家');
        return false;
      }
      let type = 1; // 0:country 1:state 2:city 3:district
      if (status && !v.vovaState.length) {
        v.axios.get(api.get_vovaAddress + '?type=' + type).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.vovaState = data;
          }
        });
      }
    },
    vovaCityChange (val) {
      let v = this;
      let code = v.$refs.vovaCountry[0].value; // 国家valueCode
      let code2 = v.$refs.stateSelect[0].value; // 省州valueCode
      let status = v.$refs.citySelect[0].visible; // true展开  false收起
      if (!code) {
        v.$Message.error('请先选择国家');
        return false;
      } else if (!code2) {
        v.$Message.error('请先选择省/州');
        return false;
      }
      let type = 2; // 0:country 1:state 2:city 3:district
      if (status && !v.vovaCity.length) {
        v.axios.get(api.get_vovaAddress + '?type=' + type + '&parentCode=' + code2).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.vovaCity = data;
          }
        });
      }
    },
    vovaStreetChange (val) {
      let v = this;
      let code = v.$refs.vovaCountry[0].value; // 国家valueCode
      let code2 = v.$refs.stateSelect[0].value; // 省州valueCode
      let code3 = v.$refs.citySelect[0].value; // 城市valueCode
      let status = v.$refs.streetSelect[0].visible; // true展开  false收起
      if (!code) {
        v.$Message.error('请先选择国家');
        return false;
      } else if (!code2) {
        v.$Message.error('请先选择省/州');
        return false;
      } else if (!code3) {
        v.$Message.error('请先选择城市');
        return false;
      }
      let type = 3; // 0:country 1:state 2:city 3:district
      if (status && !v.vovaStreet.length) {
        v.axios.get(api.get_vovaAddress + '?type=' + type + '&parentCode=' + code3).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.vovaStreet = data;
          }
        });
      }
    },
    getTabIndex (val) {
      let v = this;
      // v.selectTabs = null;
      v.tabIndex = Number(val);
      this.tabs.forEach((i, index) => {
        if (Number(val) === index) {
          i.show = true;
        } else {
          i.show = false;
        }
      });
      let data = JSON.parse(JSON.stringify(this.tabs));
      this.tabs = [];
      this.tabs = data;
    }, // 查询可用物流方式
    getEnableShippingMethods (carrierId) {
      if (!this.getPermission('carrierShippingMethod_queryForEnableShippingMethods')) return;
      let params = '?carrierId=' + carrierId;
      if (this.accept === '1') {
        // 0 是停用 1启用 不传是查全部
        params = params + '&status=1';
      }
      this.axios.get(api.get_enableShippingMethods + params).then(response => {
        if (response.data.code === 0) {
          this.originalData = response.data.datas;
          this.filterLogistiData(this.logisticsChannelText, response.data.datas);
          const newColumns = [
            {
              key: 'selection',
              type: 'selection',
              width: 50,
              align: 'center'
            },
            {
              key: 'carrierShippingMethodName',
              title: '名称',
              align: 'center',
              width: 160
            },
            {
              key: 'status',
              title: '状态',
              width: 90,
              render: (h, params) => {
                let isE = params.row.status === 1;
                return h('div', [
                  h('span', {
                    style: {
                      color: isE ? 'green' : 'red'
                    }
                  }, isE ? '启用' : '停用')
                ]);
              }
            },
            {
              key: 'carrierShippingMethodCode',
              align: 'center',
              minWidth: 150,
              title: '物流渠道代码'
            },
            {
              key: 'logisticsInterface',
              align: 'center',
              minWidth: 150,
              title: '接收方指定提交代码'
            },
            // {
            //   title: '物流时效',
            //   key: 'minEfficiency',
            //   align: 'center',
            //   minWidth: 150,
            //   render: (h, { row }) => {
            //     return h('div', [
            //       h('span', this.$common.isEmpty(row.minEfficiency) ? '' : row.minEfficiency),
            //       h('span', this.$common.isEmpty(row.minEfficiency) || this.$common.isEmpty(row.maxEfficiency) ? '' : ' - '),
            //       h('span', this.$common.isEmpty(row.maxEfficiency) ? '' : row.maxEfficiency),
            //       h('span', this.$common.isEmpty(row.minEfficiency) && this.$common.isEmpty(row.maxEfficiency) ? '' : '天')
            //     ]);
            //   }
            // },
            {
              title: '运单号',
              key: 'hasTrackingNumber',
              align: 'center',
              width: 100,
              render: (h, { row }) => {
                return this.$common.isEmpty(row.hasTrackingNumber) ? h('div', 'N') : h('div', 'Y')
              }
            },
            {
              title: '最后更新信息',
              key: 'updateTime',
              align: 'center',
              width: 150,
              render: (h, { row }) => {
                let item = [];
                item.push(h('div', {
                  attrs: {
                    title: '最后更新人'
                  }
                }, this.$common.isEmpty(row.updatedBy) ? '-' : row.updatedBy));
                item.push(h('div', {
                  attrs: {
                    title: '最后更新时间'
                  }
                }, this.$common.isEmpty(row.updateTime) ? '-' : row.updateTime));
                return h('div', {}, item);
              }
            },
            {
              title: '发件地址',
              align: 'center',
              minWidth: 150,
              key: 'senderAddressId'
            },
            {
              title: '揽收地址',
              align: 'center',
              minWidth: 150,
              key: 'pickupAddressId'
            },
            {
              title: '退件地址',
              align: 'center',
              minWidth: 150,
              key: 'refundAddressId'
            },
            {
              key: 'operate',
              align: 'center',
              title: '操作',
              fixed: 'right',
              width: 200,
              render: (h, params) => {
                const isE = params.row.status === 1;
                const isLG = this.showStatus === 'API_AE_LG';
                let operateList = [
                  h('Button', {
                    props: {
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.acceptName = params.row.carrierShippingMethodName;
                        this.activeShippingMethodId = params.row.shippingMethodId;
                        this.activeCarrierId = params.row.carrierId;
                        this.$nextTick(() => {
                          this.$refs.copyAccept.modal1 = true;
                        })
                      }
                    },
                    style: {
                      display: (() => {
                        return this.getPermission('carrierShippingMethod_copyCarrierShippingMethod')
                ? 'inline-block'
                : 'none';
                      })()
                    }
                  }, '复制'),
                  h('Button', {
                    props: {
                      size: 'small'
                    },
                    class: 'ml5',
                    on: {
                      click: () => {
                        this.showShippingSetting(params.row.shippingMethodId, params.index);
                        this.looKsettings = true;
                      }
                    },
                    style: {
                      display: (() => {
                        return this.getPermission('carrierShippingMethod_get') ? 'inline-block' : 'none';
                      })()
                    }
                  }, '查看'),
                  h('Button', {
                    props: {
                      size: 'small'
                    },
                    class: 'ml5',
                    on: {
                      click: () => {
                        this.showShippingSetting(params.row.shippingMethodId, params.index);
                        this.looKsettings = false;
                      }
                    },
                    style: {
                      display: (() => {
                        return this.getPermission('carrierShippingMethod_update') ? 'inline-block' : 'none';
                      })()
                    }
                  }, '设置'),
                ];
                (isE || isLG) && operateList.push(h('Button', {
                  props: {
                    size: 'small',
                    type: isLG ? 'default' : 'error'
                  },
                  class: 'ml5',
                  on: {
                    click: () => {
                      this.stopShippingMethod(params.row, false);
                    }
                  },
                  style: {
                    display: (() => {
                      return this.getPermission('carrierShippingMethod_enable') ? 'inline-block' : 'none';
                    })()
                  }
                }, '停用'));
                !isE && !isLG && operateList.push(h('Button', {
                  props: {
                    size: 'small'
                  },
                  class: 'ml5',
                  on: {
                    click: () => {
                      this.stopShippingMethod(params.row, true);
                    }
                  },
                  style: {
                    display: (() => {
                      return this.getPermission('carrierShippingMethod_enable') ? 'line-block' : 'none';
                    })()
                  }
                }, '启用'));
                return h('div', operateList);
              }
            }
          ];
          if (this.showStatus === 'API_AE_LG') { // 选择速卖通线上发货时，需重新设置物流渠道的表头
            const columnsKey = [
              'selection',
              'carrierShippingMethodName',
              'carrierShippingMethodCode',
              'logisticsInterface',
              // 'minEfficiency',
              'hasTrackingNumber',
              'updateTime',
              'senderAddressId',
              'pickupAddressId',
              'refundAddressId',
              'operate'
            ];
            this.logistiChannelColumns = newColumns.filter(f => columnsKey.includes(f.key));
          } else {
            let columnsKey = ['selection', 'carrierShippingMethodName'];
            if (this.accept === '2') {
              columnsKey.push('status');
            }
            columnsKey = [...columnsKey, ...[
              'carrierShippingMethodCode',
              'logisticsInterface',
              // 'minEfficiency',
              'hasTrackingNumber',
              'updateTime',
              'operate'
            ]];
            this.logistiChannelColumns = newColumns.filter(f => columnsKey.includes(f.key));
          }
        }
      }).catch(() => {
        this.originalData = [];
        this.filterLogistiData(this.logisticsChannelText, []);
      });
    },

    // 监听弹窗是否打开
    changeStatus (value) {
      this.setShippingMethodModelStatus = value;
    }, // 监听 openType
    changeOpenType (value) {
      this.openType = value;
    }, // 监听 NewCustomLogistics
    changeNewCustomLogistics (value) {
      this.NewCustomLogistics = value;
    },

    // 重新加载物流方式的数据
    changeShippingMethodsTalg (value) {
      if (value) {
        this.getEnableShippingMethods(value);
      }
    },
    // 选择账号或仓库
    selectValue (val) {
      if (val) {
        let index = val - 1;
        this.tabsValue = index.toString();
        this.getTabIndex(index);
        // this.$refs.resetSelect.setQuery(null);
      }
    },
    // 启(停)用视图切换
    switchoverView (state, type) {
      const allType = Object.keys(this.activeItem);
      if (!allType.includes(type) || this.$common.isEmpty(this.activeItem[type])) return;
      Object.keys(this.activeItem[type]).forEach(key => {
        this.activeItem[type][key].state = false;
      });
      this.activeItem[type][state].state = true;
      this.customIsChose = type == 'define';
      this.choseTabType = type;
      if (type !== 'define') {
        const activeTab = Object.values(this.activeItem[this.choseTabType]).find(f => f.state);
        if (this.$common.isEmpty(activeTab)) return;
        if (this.$common.isEmpty(activeTab.tableIndex)) {
          activeTab.tableIndex = 0;
        }
        if (this.$common.isEmpty(activeTab.tabValue)) {
          activeTab.tabValue = 0;
        }
        this.getQueryForEnableCarriers(activeTab.tableIndex, activeTab.tabValue, true);
        return;
      }
      this.filterCustomTableData(type, this.customIsChose);
    }
  }
};
</script>
<style lang="less" scoped>
.freightType {
  justify-content: space-between;
}

.card-tit {
  padding: 15px 15px 15px 0;
  font-size: 14px;
  font-weight: 500;
}

.normalTop {
  :deep(.ivu-tabs-nav-container) {
    max-width: 980px;
  }
}
.ivu-input-wrapper-width{
  width: 300px;
}
.carrier-param-item{
  width: 100%;
}
.enable-disable-switchover{
  position: relative;
  display: flex;
  .switchover-item {
    flex: 100;
    padding: 5px 0;
    cursor: pointer;
    text-align: center;
    border: 1px solid #ccc;
    border-right: none;
    &.active-btn{
      background: #2d8cf0;
      border-color: #2d8cf0;
      color: #fff;
    }
    &:last-child{
      border-right: 1px solid #ccc;
    }
  }
}
.noAcceptButton{
  position: relative;
  bottom: initial;
}
</style>
<style lang="less">
.w300 {
  width: 300px;
}
</style>
