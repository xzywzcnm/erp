<template>
  <div>
    <div class="shopTable text-center">
      <div :class="`platformItem platform-item-${shopPlatformType}`" @click="selectThisPlateform(shopPlatformType)">
        <span :class="shopPlatformType"></span> <i></i>
      </div>
    </div>
    <div class="modalItem">
      <div class="modalItemHeader">
        <div style="display: inline-block; padding: 5px;font-weight: bold;">基本</div>
      </div>
      <div class="modalItemContent">
        <div class="addNewBindingData">
          <Form :model="bindingModal" ref="bindingModal" :rules="ruleValidate" label-position="right" :label-width="200">
            <!--walmart-->
            <Form-item>
              <RadioGroup v-if="shopPlatformType === 'walmart'" v-model="bindingModal.site" @on-change="$emit('stepMt')">
                <Radio label="us" :disabled="disabledEdit">美国
                </Radio>
                <Radio label="ca" :disabled="disabledEdit">加拿大
                </Radio>
              </RadioGroup>
            </Form-item>
            <!--end-->
            <Form-item label="代号" prop="code" style="margin-bottom:20px;">
              <Tooltip placement="top" style="white-space: normal;" width="300">
                <div slot="content">
                  <p class="numTips">用于区分不同店铺的快速记忆代码，系统将此代码作为订单号的前缀拼接在订单号前面。为避免与订单号产生混淆，代号请不要用数字开头，且在代号中不要出现特殊符号。</p>
                </div>
                <Input v-model="bindingModal.code" :disabled="disabledEdit" @on-enter="enterNextStep" placeholder="请输入" style="width:200px;" />
              </Tooltip>
            </Form-item>
            <Form-item v-if="eid !== null && account !== '' && shopPlatformType === 'ebay'" label="账户名" prop="code">
              <div>{{ account }}</div>
            </Form-item>
            <FormItem v-else label="账户名" prop="account">
              <Input v-model="bindingModal.account" @on-enter="enterNextStep" :disabled="disabledEdit" placeholder="请输入账号"
                style="width:200px;" />
            </FormItem>
            <FormItem label="token" prop="token" v-if="['wb'].includes(shopPlatformType)">
              <Input v-model="bindingModal.token" @on-enter="enterNextStep" :disabled="disabledEdit" placeholder="请输入token"
                style="width:200px;" />
            </FormItem>
            <!-- shopify -->
            <!-- <FormItem label="店铺名称" v-if="shopPlatformType === 'shopify'" prop="shopifyShopName">
              https:// <Input style="display:inline-block;width:120px;margin:0 10px;"
                v-model="bindingModal.shopifyShopName" @on-enter="enterNextStep"
                :disabled="disabledEdit || $store.state.tokenEffectiveDate !== null" placeholder="请输入"></Input>
              .myshopify.com
              <div style="color:#FF0000;">
                *请填写Shopify店铺后台登录地址的二级域名
              </div>
            </FormItem>
            <FormItem label="交易费率" v-if="shopPlatformType === 'shopify'" prop="transactionRate">
              <InputNumber style="display:inline-block;width:120px;" :min='0' :max='100'
                v-model="bindingModal.transactionRate" @on-enter="enterNextStep" :disabled="disabledEdit"
                placeholder="请输入"></InputNumber>
              %
            </FormItem> -->
            <!-- lazada -->
            <FormItem label="授权站点" v-if="shopPlatformType === 'lazada'" prop="lazadaAuthSite">
              <RadioGroup v-model="bindingModal.siteIds" v-if="shopSiteDataList.length">
                <Radio :disabled="disabledEdit" v-for="(item, index) in shopSiteDataList" :key="index"
                  :label="item.siteId">{{ item.cnName }}
                </Radio>
              </RadioGroup>
            </FormItem>
            <!-- joom -->
            <FormItem label="client ID" v-if="['joom', 'ozon'].includes(shopPlatformType)" prop="clientId">
              <Input v-model="bindingModal.clientId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="client secret" v-if="shopPlatformType === 'joom'" prop="clientSecret">
              <Input v-model="bindingModal.clientSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- tophatter -->
            <FormItem label="Access Token"
              v-if="shopPlatformType === 'tophatter' || shopPlatformType === 'backmarket' || shopPlatformType === 'bigcommerce' || shopPlatformType === 'shopline' || shopPlatformType === 'tophatter'"
              prop="accessToken">
              <Input v-model="bindingModal.accessToken" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- cdiscount -->
            <FormItem label="cdiscount接口账号" v-if="shopPlatformType === 'cdiscount'" prop="cdisUserId">
              <Input v-model="bindingModal.cdisUserId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="接口账号密码" v-if="shopPlatformType === 'cdiscount'" prop="cdisAppkey">
              <Input v-model="bindingModal.cdisAppkey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="站点" v-if="['cdiscount', 'ozon'].includes(shopPlatformType)" prop="siteId">
              <dyt-select v-model="bindingModal.siteId" :disabled="disabledEdit" style="width:200px;">
                <Option v-for="(item, index) in shopSiteDataList" :key="`siteId-${index}`" :value="item.siteId" :label="item.cnName" />
              </dyt-select>
            </FormItem>
            <!-- real-->
            <FormItem label="ClientKey" v-if="shopPlatformType === 'real'">
              <Input v-model="bindingModal.cdisUserId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="SecretKey" v-if="shopPlatformType === 'real'">
              <Input v-model="bindingModal.cdisAppkey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- newegg -->
            <FormItem label="Seller ID" v-if="shopPlatformType === 'newegg'" prop="sellerId">
              <Input v-model="bindingModal.sellerId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="Secret Key" v-if="shopPlatformType === 'newegg' || shopPlatformType === 'meesho'"
              prop="secretKey">
              <Input v-model="bindingModal.secretKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="站点" v-if="shopPlatformType === 'newegg'" prop="neweggSite">
              <RadioGroup v-model="bindingModal.neweggSite" v-if="shopSiteDataList.length"
                v-for="(item, index) in shopSiteDataList" :key="index">
                <Radio :disabled="disabledEdit" :label="item.siteId">{{ item.cnName }}
                </Radio>
              </RadioGroup>
            </FormItem>
            <!-- priceminister -->
            <FormItem label="USERID" v-if="shopPlatformType === 'priceminister'" prop="pmUserId">
              <Input v-model="bindingModal.pmUserId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="TOKEN" v-if="shopPlatformType === 'priceminister'" prop="pmToken">
              <Input v-model="bindingModal.pmToken" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="userId" v-if="shopPlatformType === 'darza' || shopPlatformType === 'linio'" prop="userId">
              <Input v-model="bindingModal.userId" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="uniqueKey" v-if="shopPlatformType === 'darza'" prop="uniqueKey">
              <Input v-model="bindingModal.uniqueKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="consumerKey" v-if="shopPlatformType === 'funpinpin'" prop="consumerKey">
              <Input v-model="bindingModal.consumerKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="consumerSecret" v-if="shopPlatformType === 'funpinpin'" prop="consumerSecret">
              <Input v-model="bindingModal.consumerSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="sellerLoginId" v-if="shopPlatformType === 'gsp'" prop="sellerLoginId">
              <Input v-model="bindingModal.sellerLoginId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="uniqueKey"
              v-if="shopPlatformType === 'darza' || shopPlatformType === 'funpinpin' || shopPlatformType === 'linio'"
              prop="siteUrl">
              <Input v-model="bindingModal.siteUrl" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="shopId" v-if="shopPlatformType === 'fnac'" prop="shopId">
              <Input v-model="bindingModal.shopId" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="partnerId" v-if="shopPlatformType === 'fnac'" prop="partnerId">
              <Input v-model="bindingModal.partnerId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="fnacKey" v-if="shopPlatformType === 'fnac'" prop="fnacKey">
              <Input v-model="bindingModal.fnacKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- walmart -->
            <FormItem label="clientId"
              v-if="(shopPlatformType === 'walmart' && bindingModal.site === 'us') || shopPlatformType === 'meesho'"
              prop="clientId">
              <Input v-model="bindingModal.clientId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="clientSecret" v-if="shopPlatformType === 'walmart' && bindingModal.site === 'us'"
              prop="clientSecret">
              <Input v-model="bindingModal.clientSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="consumerId" v-if="shopPlatformType === 'walmart' && bindingModal.site === 'ca'"
              prop="consumerId">
              <Input v-model="bindingModal.consumerId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="privateKey" v-if="shopPlatformType === 'walmart' && bindingModal.site === 'ca'"
              prop="privateKey">
              <Input v-model="bindingModal.privateKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="channelType" v-if="shopPlatformType === 'walmart' && bindingModal.site === 'ca'"
              prop="channelType">
              <Input v-model="bindingModal.channelType" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- dhgate -->
            <!-- alibaba -->
            <FormItem label="账户类型" v-if="shopPlatformType === 'alibaba'" prop="alibabaType">
              <RadioGroup v-model="bindingModal.alibabaType">
                <Radio :disabled="disabledEdit" label="seller">卖家
                </Radio>
                <Radio :disabled="disabledEdit" label="buyer">买家
                </Radio>
              </RadioGroup>
            </FormItem>
            <!-- mycom -->
            <FormItem label="userName"
              v-if="shopPlatformType === 'mycom' || shopPlatformType === 'passfeed' || shopPlatformType === 'otto'"
              prop="username">
              <Input v-model="bindingModal.username" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="passWord"
              v-if="shopPlatformType === 'passfeed' || shopPlatformType === 'mycom' || shopPlatformType === 'teezily' || shopPlatformType === 'otto'"
              prop="password">
              <Input v-model="bindingModal.password" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!-- yandex -->
            <FormItem label="clientId" v-if="shopPlatformType === 'yandex'" prop="yandexClientId">
              <Input v-model="bindingModal.yandexClientId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="clientId" v-if="shopPlatformType === 'rakuten'" prop="clientKey">
              <Input v-model="bindingModal.clientKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="clientId" v-if="shopPlatformType === 'shoplazza'" prop="storeName">
              <Input v-model="bindingModal.storeName" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="clientSecret" v-if="shopPlatformType === 'yandex'" prop="yandexClientSecret">
              <Input v-model="bindingModal.yandexClientSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="站点" v-if="shopPlatformType === 'amazon'" prop="amazonSiteIds">
              <dyt-select v-model="bindingModal.amazonSiteIds" :disabled="disabledEdit" style="width:200px;">
                <Option v-for="(item, index) in shopSiteDataList" :key="index" :value="item.siteId" :label="item.cnName" />
              </dyt-select>
            </FormItem>
            <FormItem label="Merchant ID" v-if="shopPlatformType === 'amazon'" prop="sellerIdAmazon">
              <Input v-model="bindingModal.sellerIdAmazon" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="MWS授权令牌" v-if="shopPlatformType === 'amazon'" prop="mwsAuthToken">
              <Input v-model="bindingModal.mwsAuthToken" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="accessToken" v-if="shopPlatformType === 'vova'" prop="accessTokenVova">
              <Input v-model="bindingModal.accessTokenVova" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="wowcherKey" v-if="shopPlatformType === 'wowcher'" prop="wowcherKey">
              <Input v-model="bindingModal.wowcherKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="wowcherSecret" v-if="shopPlatformType === 'wowcher'" prop="wowcherSecret">
              <Input v-model="bindingModal.wowcherSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="apiKey" v-if="['btw', 'ozon'].includes(shopPlatformType)" prop="apiKey">
              <Input v-model="bindingModal.apiKey" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="platformId" v-if="shopPlatformType === 'vova'" prop="platformIdVova">
              <Input v-model="bindingModal.platformId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <!--ept-->
            <FormItem label="appKey"
              v-if="shopPlatformType === 'ept' || shopPlatformType === 'coupang' || shopPlatformType === 'jdth' || shopPlatformType === 'linio'"
              prop="appKey">
              <Input v-model="bindingModal.appKey" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="appId" v-if="shopPlatformType === 'thisshop'" prop="appId">
              <Input v-model="bindingModal.appId" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="appSecret"
              v-if="shopPlatformType === 'ept' || shopPlatformType === 'coupang' || shopPlatformType === 'jdth' || shopPlatformType === 'thisshop'"
              prop="appSecret">
              <Input v-model="bindingModal.appSecret" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="signKey" v-if="shopPlatformType === 'thisshop'" prop="signKey">
              <Input v-model="bindingModal.signKey" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="vendorId" v-if="shopPlatformType === 'coupang'" prop="vendorId">
              <Input v-model="bindingModal.vendorId" @on-enter="enterNextStep" :disabled="disabledEdit"
                style="width:200px;" placeholder="请输入"></Input>
            </FormItem>
            <FormItem label="iossNo">
              <Input v-model="bindingModal.iossNo" :disabled="disabledEdit" style="width:200px;" placeholder="请输入"
                :maxlength="200" />
            </FormItem>
            <!-- <FormItem label="站点" v-if="['tiktok'].includes(shopPlatformType)" prop="tiktokSiteIds">
              <dyt-select v-model="bindingModal.tiktokSiteIds" :disabled="disabledEdit" style="width:200px;">
                <Option v-for="(item, index) in shopSiteDataList" :key="index" :value="item.siteId">{{
                  item.cnName }}</Option>
              </dyt-select>
            </FormItem> -->
            <template v-if="!['tiktok', 'ozon', 'miravia', 'wb', 'sheinx', 'temux'].includes(shopPlatformType)">
              <FormItem label="VAT NO">
                <Input v-model="bindingModal.vatNo" :disabled="disabledEdit" style="width:200px;" placeholder="请输入"
                  :maxlength="200" />
              </FormItem>
              <FormItem label="EORI" v-if="!['tiktok', 'ozon', 'wb'].includes(shopPlatformType)">
                <Input v-model="bindingModal.eori" :disabled="disabledEdit" style="width:200px;" placeholder="请输入"
                  :maxlength="200" />
              </FormItem>
            </template>
            <FormItem label="站点" v-if="['temux'].includes(shopPlatformType)" prop="temuxSiteId" >
              <dyt-select v-model="bindingModal.temuxSiteId" placeholder="请选择站点" :disabled="disabledEdit" style="width:200px;">
                <Option
                  v-for="(item, index) in shopSiteDataList"
                  :key="`temuxs-${index}`"
                  :value="item.siteId"
                  :label="item.cnName"
                  @click.native="temuxSiteChange(item.siteId)"
                />
              </dyt-select>
            </FormItem>
            <Form-item label="店铺主体" prop="developerId" v-if="['temux'].includes(shopPlatformType)">
              <dyt-select
                v-model="bindingModal.developerId"
                placeholder="请选店铺主体"
                :disabled="disabledEdit"
                style="width:200px;"
              >
                <Option v-for="(item, index) in developerDataList" :value='item.id' :key="`business-${index}`" :label="item.name" />
              </dyt-select>
            </Form-item>
            <FormItem label="TOKEN" v-if="['temux'].includes(shopPlatformType)" prop="token">
              <Input v-model="bindingModal.token" @on-enter="enterNextStep" :disabled="disabledEdit" style="width:200px;" placeholder="请输入" />
            </FormItem>
            <Form-item label="所属事业部" prop="businessDeptId">
              <dyt-select v-model="bindingModal.businessDeptId" placeholder="请选择所属事业部" style="width:200px;"
                :disabled="disabledStatus">
                <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`" :label="item.name" />
              </dyt-select>
            </Form-item>
            <FormItem label="品牌">
              <dyt-select v-model="bindingModal.brandId" @input="brandIdChange" :clearable="true"
                :disabled="disabledStatus" style="width:200px;">
                <Option v-for="(item, index) in brandList" :key="index" :value="item.productBrandId" :label="item.name" />
              </dyt-select>
            </FormItem>
            <Form-item label="是否全托管" prop="isFullyManaged" v-if="shopPlatformType === 'aliexpress'">
              <dyt-select v-model="bindingModal.isFullyManaged" placeholder="请选择是否全托管" style="width:200px;"
                :disabled="disabledEdit">
                <Option :value='1'>是</Option>
                <Option :value='0'>否</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="是否半托管" prop="isHalfManaged" v-if="shopPlatformType === 'aliexpress'">
              <dyt-select v-model="bindingModal.isHalfManaged" placeholder="请选择是否全托管" style="width:200px;"
                :disabled="disabledEdit">
                <Option :value='1'>是</Option>
                <Option :value='0'>否</Option>
              </dyt-select>
            </Form-item>
            <FormItem
              label="平台佣金比例"
              prop="totalFinalFeePercentage"
              v-if="!isThirdAuth && !totalFinalPlatform.includes(shopPlatformType)"
            >
              <Input v-model="bindingModal.totalFinalFeePercentage" :disabled="disabledEdit" style="width:200px;"
                placeholder="请输入" :maxlength="200"></Input>%
            </FormItem>
            <FormItem
              label="VAT 比例"
              prop="vatRate"
              v-if="['miravia'].includes(shopPlatformType)"
            >
              <Input
                v-model="bindingModal.vatRate"
                :disabled="disabledEdit"
                style="width:200px;"
                placeholder="请输入"
                :maxlength="200"
              />%
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
    <div class="modalItem" v-if="oType === 'give' && auth_platform.includes(shopPlatformType)">
      <div class="modalItemHeader">
        <h6>授权</h6>
      </div>
      <div class="modalItemContent">
        <div class="addNewBindingData">
          <div class="addNewBindingGotoAuth" v-if="showAuthedButton">
            <div class="icon iconfont icon-author shopAuthor"></div>
            <div class="anbgaText">未授权</div>
            <Button type="primary" class="anbgaAuth" @click="gotoAuth">前往授权 </Button>
          </div>
          <div class="addNewBindingGotoAuth" v-else>
            <div class="icon iconfont icon-author shopAuthor authGreen"></div>
            <div class="anbgaText">已授权</div>
            <Button type="primary" class="anbgaAuth" @click="gotoAuth">重新授权 </Button>
          </div>
        </div>
      </div>
    </div>
    <Spin size="large" fix v-if="spinShow || pageLoading"></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import shopMixin from '../mixin/shopMixin';
import { AUTH_PLATFORM, AUTH_PLATFORM_TIME_MAP } from '@/utils/enum';

export default {
  mixins: [Mixin, shopMixin],
  data() {
    var self = this;
    return {
      totalFinalPlatform: ['ebay', 'wish', 'joom', 'shopee', 'amazon', 'tiktok', 'wb', 'sheinx', 'temux'],
      spinShow: false,
      auth_platform: AUTH_PLATFORM,
      secondStep: false,
      maxlength: 10,
      businessDeptDataList: [],
      selectedValue: 'ebay',
      otherApi: {
        wb: {
          addShop: {
            method: 'post',
            url: api.settingService.createWb
          },
          editShop: {
            method: 'post',
            url: api.settingService.editWb
          },
        }
      },
      ebayId: null,
      developerIdList: [],
      pageLoading: false,
      bindingModal: {
        code: '',
        iossNo: '',
        clientKey: '',
        wowcherKey: '',
        businessDeptId: null, // 所属事业部
        isFullyManaged: null, // 是否全托管
        isHalfManaged: null, // 是否半托管
        wowcherSecret: '',
        developerId: null, // temu 主体ID
        temuxSiteId: null, // temu 站点ID
        password: '',
        appId: '',
        signKey: '',
        temail: '',
        storeName: '',
        storeHash: '',
        apiKey: '',
        vendorId: '',
        uniqueKey: '',
        siteUrl: '',
        partnerId: '',
        shopId: '',
        fnacKey: '',
        consumerKey: '',
        consumerSecret: '',
        sellerLoginId: '',
        single: false,
        site: 'us',
        vatNo: '',
        eori: '',

        totalFinalFeePercentage: '',
        vatRate: '0',
        brandId: '',
        brandName: '',
        status: false,
        bindingTime: null,
        account: '',
        shopifyShopName: null,
        transactionRate: null,
        siteIds: null, // lazada 选择站点
        accessToken: null, // tophatter
        clientId: null, // joom
        clientSecret: null,
        cdisUserId: null, // cdiscount
        cdisAppkey: null,
        siteId: null, // cdiscount 选择站点
        pmUserId: null, // priceminister
        pmToken: null,
        token: null, // temu 的 token
        consumerId: null, // walmart
        privateKey: null,
        channelType: null,
        sellerId: null, // newegg
        secretKey: null,
        neweggSite: null,
        alibabaType: null, // alibaba
        username: null,
        yandexClientId: null, // yandex
        yandexClientSecret: null,
        sellerIdAmazon: null, // amazon
        mwsAuthToken: null,
        amazonSiteBaseDataId: null,
        amazonSiteIds: null, // amazon 选择站点
        amazonAccountId: null,
        amazonSiteStatus: 1,
        accessTokenVova: null, // vova
        platformId: null,
        appKey: null, // ept
        appSecret: null // ept
      },
      brandList: [],
      formDynamic: {
        items: [
          {
            value: '',
            icon: 'compose'
          }
        ]
      },
      ruleValidate: {
        // 事业部验证
        businessDeptId: [
          { required: true, validator: this.$common.formItemVerify, msg: '请选择择事业部', trigger: 'change' }
        ],
        isFullyManaged: [
          { message: '请选择是否全托管', trigger: 'change', required: true, type: 'number' }
        ],
        isHalfManaged: [
          { message: '请选择是否半托管', trigger: 'change', required: true, type: 'number' }
        ],
        cdisUserId: [
          { validator: self.vaildcdisUserId, trigger: 'blur', required: true }
        ],
        cdisAppkey: [
          { validator: self.vaildcdisAppkey, trigger: 'blur', required: true }
        ],
        code: [
          { validator: self.vaildCode, maxLength: 20, trigger: 'change', required: true, msg: '代号不能为空，请输入代号' },
          { validator: self.vaildCode, maxLength: 20, trigger: 'blur', required: true, msg: '代号不能为空，请输入代号' }
        ],
        clientId: [
          { validator: self.clientValid, trigger: 'blur', required: true }
        ],
        // lazadaAuthSite: [
        //   { validator: self.lazadaAuthSiteValid, trigger: 'change', required: true }
        // ],
        clientSecret: [
          { validator: self.clientSecretValidMt, trigger: 'blur', required: true }
        ],
        amazonSiteIds: [
          {
            validator: self.siteIdValidater,
            required: true,
            trigger: 'change'
          }
        ],
        // siteId: [
        //   {
        //     validator: self.siteIdValidater,
        //     required: ['ozon'].includes(self.shopPlatformType),
        //     trigger: 'change'
        //   }
        // ],
        // tiktokSiteIds: [
        //   { message: '请选择站点', trigger: 'change', required: true }
        // ],
        sellerIdAmazon: [
          {
            validator: self.sellerIdAmazonVal,
            trigger: 'blur',
            required: true
          }
        ],
        mwsAuthToken: [
          {
            validator: self.mwsAuthTokenVal,
            trigger: 'blur',

            required: true
          }
        ],
        account: [
          {
            validator: self.validAccount,
            required: true,
            trigger: 'blur'

          }
        ],
        consumerId: [
          {
            validator: self.validConsumerId,
            required: true,
            trigger: 'blur'

          }
        ],
        accessToken: [
          {
            validator: self.$common.validAccessToken,
            required: true,
            trigger: 'blur'
          }
        ],
        developerId: [
          { validator: self.$common.formItemVerify, required: true, msg: '请选择店铺主体', trigger: 'change' }
        ],
        temuxSiteId: [
          { validator: self.$common.formItemVerify, required: true, msg: '请选择站点', trigger: 'change' }
        ],
        token: [
          { validator: self.$common.formItemVerify, required: true, msg: '请输入 token', trigger: 'change' },
          { validator: self.$common.formItemVerify, required: true, msg: '请输入 token', trigger: 'blur' }
        ],
        privateKey: [
          {
            validator: self.validPrivateKey,
            required: true,
            trigger: 'blur'

          }
        ],
        channelType: [
          {
            validator: self.validChannelType,
            required: true,
            trigger: 'blur'

          }
        ],
        storeHash: [
          {
            validator: self.validStoreHash,
            required: true,
            trigger: 'blur'

          }
        ],
        apiKey: [
          {
            validator: self.validApiKey,
            required: true,
            trigger: 'blur'

          }
        ],
        vendorId: [
          {
            validator: self.validVendorId,
            required: true,
            trigger: 'blur'

          }
        ],
        userId: [
          {
            validator: self.validUserId,
            required: true,
            trigger: 'blur'

          }
        ],
        uniqueKey: [
          {
            validator: self.validUniqueKey,
            required: true,
            trigger: 'blur'

          }
        ],
        siteUrl: [
          {
            validator: self.validSiteUrl,
            required: true,
            trigger: 'blur'

          }
        ],
        consumerSecret: [
          {
            validator: self.validConsumerSecret,
            required: true,
            trigger: 'blur'

          }
        ],
        consumerKey: [
          {
            validator: self.validConsumerKey,
            required: true,
            trigger: 'blur'

          }
        ],
        fnacKey: [
          {
            validator: self.validFnacKey,
            required: true,
            trigger: 'blur'

          }
        ],
        partnerId: [
          {
            validator: self.validPartnerId,
            required: true,
            trigger: 'blur'

          }
        ],
        shopId: [
          {
            validator: self.validShopId,
            required: true,
            trigger: 'blur'

          }
        ],
        sellerLoginId: [
          {
            validator: self.validSellerLoginId,
            required: true,
            trigger: 'blur'

          }
        ],
        clientKey: [
          {
            validator: self.validClientKey,
            required: true,
            trigger: 'blur'

          }
        ],
        storeName: [
          {
            validator: self.validStoreName,
            required: true,
            trigger: 'blur'

          }
        ],
        password: [
          {
            validator: self.validPassword,
            required: true,
            trigger: 'blur'

          }
        ],
        yandexClientSecret: [
          {
            validator: self.validYandexClientSecret,
            required: true,
            trigger: 'blur'

          }
        ],
        yandexClientId: [
          {
            validator: self.validYandexClientId,
            required: true,
            trigger: 'blur'

          }
        ],
        appId: [
          {
            validator: self.validAppId,
            required: true,
            trigger: 'blur'

          }
        ],
        signKey: [
          {
            validator: self.validSignKey,
            required: true,
            trigger: 'blur'

          }
        ],
        wowcherKey: [
          {
            validator: self.validWowcherKey,
            required: true,
            trigger: 'blur'

          }
        ],
        wowcherSecret: [
          {
            validator: self.validWowcherSecret,
            required: true,
            trigger: 'blur'

          }
        ],
        appKey: [
          {
            validator: self.validAppKey,
            required: true,
            trigger: 'blur'

          }
        ],
        appSecret: [
          {
            validator: self.validAppSecret,
            required: true,
            trigger: 'blur'

          }
        ],
        alibabaType: [
          {
            validator: self.validAlibabaType,
            required: true,
            trigger: 'change'

          }
        ],
        username: [
          {
            validator: self.validUserName,
            required: true,
            trigger: 'blur'

          }
        ],
        secretKey: [
          {
            validator: self.validSecretKey,
            required: true,
            trigger: 'blur'

          }
        ],
        neweggSite: [
          {
            validator: self.validNeweggSite,
            required: true,
            trigger: 'change'

          }
        ],
        pmUserId: [
          {
            validator: self.validPmUserId,
            required: true,
            trigger: 'change'

          }
        ],
        pmToken: [
          { validator: self.validPmToken, required: true, trigger: 'change' }
        ],
        totalFinalFeePercentage: [
          {
            validator: self.validTotalFinalFeePercentage,
            required: true,
            trigger: 'change'
          }
        ],
        vatRate: [
          {
            required: true,
            validator: self.validVatRate,
            min: 0,
            point: 2,
            msg: '请输入不小于0的数字,限两位小数',
            trigger: 'change'
          },
        ],
      },
      eid: null,
      disabledStatus: false,
      toAuthLink: 'javascript:;'
    };
  },
  props: {
    thirdAuth: { type: Boolean, default: false },
    step: {
      type: String,
      default: '0'
    },
    sid: {
      type: String,
      default: null
    },
    oType: {
      type: String
    },
    account: {
      type: String,
      default: ''
    },
    saveCode: {
      default: ''
    },
    shopPlatformType: String,
    typeStatus: String,
    // 列表传来的 row
    detailsParams: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    // 编辑这里保存数据
    saveCode(n, o) {
      if (n && !this.spinShow) {
        const reg = this.$regular.enterCode;
        if (reg.test(this.bindingModal.code)) {
          let platformParams = this.fixParams() || {};
          if (typeof platformParams.isPass === 'boolean' && !platformParams.isPass) return;
          platformParams['saleAccountId'] = this.sid;
          platformParams.businessDeptId = this.bindingModal.businessDeptId;
          if (['aliexpress'].includes(this.shopPlatformType)) {
            platformParams.isFullyManaged = this.bindingModal.isFullyManaged;
            platformParams.isHalfManaged = this.bindingModal.isHalfManaged;
          }
          let updateUrl = `/setting-service/${this.shopPlatformType}Account`;
          if (!this.isThirdAuth) {
            platformParams[this.shopPlatformType + 'AccountId'] = this.sid;
          } else {
            updateUrl = api.post_saleAccount_thirdAuth_updateSelective;
          }
          this.$refs.bindingModal.validate(valid => {
            if (valid) {
              const otherUrl = this.getOtherApi(this.shopPlatformType, 'editShop');
              let method = 'put';
              if (!this.$common.isEmpty(otherUrl)) {
                updateUrl = otherUrl.url;
                method = otherUrl.method;
              }
              this.axios[method](updateUrl, platformParams).then(response => {
                if (response.data.code === 0) {
                  this.$emit('finishSave');
                  this.$Message.success('保存成功');
                } else {
                  this.$emit('resetEvent');
                }
              }).catch(() => {
                this.$emit('resetEvent');
              });
            } else {
              this.$emit('resetEvent');
            }
          });
        } else {
          this.$Message.error('代号格式不对');
        }
      }
    },
    // 新增这里保存数据
    step(n, o) {
      if (n === '1') {
        const reg = this.$regular.enterCode;
        this.bindingModal.status = false;
        if (reg.test(this.bindingModal.code)) {
          let platformParams = this.fixParams();
          this.$refs.bindingModal.validate(valid => {
            if (valid) {
              const otherUrl = this.getOtherApi(this.shopPlatformType, 'addShop');
              let addUrl = `/setting-service/${this.shopPlatformType}Account`;
              let method = 'post';
              if (!this.$common.isEmpty(otherUrl)) {
                addUrl = otherUrl.url;
                method = otherUrl.method;
              }
              this.axios[method](addUrl, platformParams).then(response => {
                if (response.data.code === 0) {
                  this.$emit('nextStepEvent');
                  this.secondStep = true;
                  this.disabledStatus = true;
                  this.eid = response.data.datas;// 返回 accountId
                  this.superAdminHand(response.data.datas || '');
                  this.$Message.success('保存成功');
                  this.bindingModal.platformId = '';
                  // this.$refs['bindingModal'].resetFields();
                } else {
                  this.$emit('resetEvent');
                }
              }).catch(() => {
                this.$emit('resetEvent');
              });
            } else {
              this.$emit('resetEvent');
            }
          });
        } else {
          this.$emit('resetEvent');
          this.$Message.error('代号格式不对');
        }
      } else {
        this.secondStep = false;
        this.eid = null;
        // this.$refs['bindingModal'].resetFields();
      }
    },
    sid: {
      deep: true,
      immediate: true,
      handler(n, o) {
        if (n !== o) {
          this.eid = n;
          this.pageLoading = true;
          this.$common.promiseAll([
            () => {
              return this.getLazadaSite(this.shopPlatformType);
            },
            this.getBrandList, // 获取商品管理中的品牌
            this.getBusinessDeptData, // 获取事业部
            this.getDevList, // 获取 Temu 店铺主体
          ]).finally(() => {
            this.pageLoading = false;
            this.getAccountDetails();
          });
        }
        if (n === null) {
          this.secondStep = false;
          this.eid = null;
          this.disabledStatus = false;
          // this.$refs['bindingModal'].resetFields();
        }
      }
    },
    account: {
      handler(n, o) {
        let v = this;
        if (v.shopPlatformType !== 'ebay' && !!n) {
          v.bindingModal.account = n;
        }
      },
      immediate: true
    },
    oType: {
      handler(n, o) {
        if (n === 'check' || n === 'give') {
          this.disabledStatus = true;
        } else if (n === 'edit' || n === 'add') {
          this.disabledStatus = false;
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    superAdminHand(saleAccountId) {
      if (this.$common.isEmpty(saleAccountId)) return;
      this.axios.get(api.settingService.addStore, { params: { saleAccountId: saleAccountId } }).catch(e => {
        console.error(e)
      })
    },
    // 获取事业部
    getBusinessDeptData() {
      return new Promise((resolve) => {
        this.businessDeptDataList = [];
        this.axios.get(api.get_businessDeptList, { hiddenError: true }).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 第三方授权
    thirdAuthParams(pParams) {
      delete pParams.account;
      delete pParams.vatNo;
      delete pParams.eori;
      delete pParams.iossNo;
      delete pParams.brandName;
    },
    fixParams() {
      let v = this;
      let platformParams = {
        accountCode: this.bindingModal.code,
        account: this.bindingModal.account,
        vatNo: this.bindingModal.vatNo || '',
        eori: this.bindingModal.eori || '',
        totalFinalFeePercentage: this.bindingModal.totalFinalFeePercentage || '',
        iossNo: this.bindingModal.iossNo || '',
        brandId: this.bindingModal.brandId || '',
        businessDeptId: this.bindingModal.businessDeptId,
        brandName: this.bindingModal.brandName || ''
      }
      if (this.isThirdAuth) {
        this.thirdAuthParams(platformParams);
      }
      if (this.isThirdAuth || this.totalFinalPlatform.includes(this.shopPlatformType)) {
        delete platformParams.totalFinalFeePercentage;
      }
      switch (v.shopPlatformType) {
        case 'shopify':
          // platformParams.shopName = v.bindingModal.shopifyShopName;
          // platformParams.transactionRate = v.bindingModal.transactionRate;
          // delete platformParams.account;
          // delete platformParams.vatNo;
          // delete platformParams.eori;
          // delete platformParams.totalFinalFeePercentage;
          // delete platformParams.iossNo;
          // delete platformParams.brandName;
          break;
        case 'lazada':
          let pos = [];
          if (v.bindingModal.siteIds) {
            pos.push(Number(v.bindingModal.siteIds));
          }
          platformParams.siteIds = pos;
          break;
        case 'mycom':
          platformParams.username = v.bindingModal.username;
          platformParams.password = v.bindingModal.password;
          break;
        case 'otto':
          platformParams.username = v.bindingModal.username;
          platformParams.password = v.bindingModal.password;
          break;
        case 'amazon':
          let siteArr = v.shopSiteDataList.filter(item => {
            return item.siteId === v.bindingModal.amazonSiteIds;
          });
          if (siteArr.length === 0) {
            v.$Message.error('无法匹配到对应站点信息,请重新选择站点或联系管理员！');
            return { isPass: false };
          }
          platformParams.marketplaceId = siteArr[0].amazonMarketplaceId;
          platformParams.region = siteArr[0].region;
          platformParams.siteId = v.bindingModal.amazonSiteIds;
          platformParams.serviceUrl = siteArr[0].amazonMws;
          platformParams.sellerId = v.bindingModal.sellerIdAmazon;
          platformParams.mwsAuthToken = v.bindingModal.mwsAuthToken;
          platformParams.status = v.bindingModal.amazonSiteStatus;
          break;
        case 'joom':
          platformParams.clientId = v.bindingModal.clientId;
          platformParams.clientSecret = v.bindingModal.clientSecret;
          break;
        case 'tophatter':
          platformParams.accessToken = v.bindingModal.accessToken;
          break;
        case 'cdiscount':
          platformParams.userId = v.bindingModal.cdisUserId;
          platformParams.appKey = v.bindingModal.cdisAppkey;
          platformParams.siteId = v.bindingModal.siteId;
          break;
        case 'real':
          platformParams.clientKey = v.bindingModal.cdisUserId;
          platformParams.secretKey = v.bindingModal.cdisAppkey;
          platformParams.siteId = v.bindingModal.siteId;
          break;
        case 'newegg':
          platformParams.sellerId = v.bindingModal.sellerId;
          platformParams.secretKey = v.bindingModal.secretKey;
          platformParams.site = v.bindingModal.neweggSite;
          break;
        case 'priceminister':
          platformParams.userId = v.bindingModal.pmUserId;
          platformParams.token = v.bindingModal.pmToken;
          break;
        case 'walmart':
          platformParams.site = v.bindingModal.site;
          switch (v.bindingModal.site) {
            case 'us':
              platformParams.clientId = v.bindingModal.clientId;
              platformParams.clientSecret = v.bindingModal.clientSecret;
              break;
            case 'ca':
              platformParams.consumerId = v.bindingModal.consumerId;
              platformParams.privateKey = v.bindingModal.privateKey;
              platformParams.channelType = v.bindingModal.channelType;
              break;
          }
          break;
        case 'alibaba':
          platformParams.accountType = v.bindingModal.alibabaType;
          break;
        case 'yandex':
          platformParams.clientId = v.bindingModal.yandexClientId;
          platformParams.clientSecret = v.bindingModal.yandexClientSecret;
          break;
        case 'factorymarket':
          platformParams.clientId = v.bindingModal.yandexClientId;
          platformParams.clientSecret = v.bindingModal.yandexClientSecret;
          break;
        case 'vova':
          platformParams.accessToken = v.bindingModal.accessTokenVova;
          platformParams.vovaPlatformId = v.bindingModal.platformId;
          break;
        case 'ept':
          platformParams.appKey = v.bindingModal.appKey;
          platformParams.appSecret = v.bindingModal.appSecret;
          break;
        case 'jdyn':
          platformParams.appKey = v.bindingModal.appKey;
          platformParams.appSecret = v.bindingModal.appSecret;
          platformParams.accessToken = v.bindingModal.accessToken;
          break;
        case 'backmarket':
          platformParams.accessToken = v.bindingModal.accessToken;
          break;
        case 'bigcommerce':
          platformParams.accessToken = v.bindingModal.accessToken;
          platformParams.storeHash = v.bindingModal.storeHash;
          break;
        case 'btw':
          platformParams.apiKey = v.bindingModal.apiKey;
          break;
        case 'coupang':
          platformParams.appKey = v.bindingModal.appKey;
          platformParams.appSecret = v.bindingModal.appSecret;
          platformParams.vendorId = v.bindingModal.vendorId;
          break;
        case 'darza':
          platformParams.userId = v.bindingModal.userId;
          platformParams.uniqueKey = v.bindingModal.uniqueKey;
          platformParams.siteUrl = v.bindingModal.siteUrl;
          break;
        case 'fnac':
          platformParams.shopId = v.bindingModal.shopId;
          platformParams.partnerId = v.bindingModal.partnerId;
          platformParams.fnacKey = v.bindingModal.fnacKey;
          break;
        case 'funpinpin':
          platformParams.consumerKey = v.bindingModal.consumerKey;
          platformParams.consumerSecret = v.bindingModal.consumerSecret;
          platformParams.siteUrl = v.bindingModal.siteUrl;
          break;
        case 'gsp':
          platformParams.sellerLoginId = v.bindingModal.sellerLoginId;
          platformParams.consumerSecret = v.bindingModal.consumerSecret;
          platformParams.siteUrl = v.bindingModal.siteUrl;
          break;
        case 'jdth':
          platformParams.appKey = v.bindingModal.appKey;
          platformParams.appSecret = v.bindingModal.appSecret;
          platformParams.accessToken = v.bindingModal.accessToken;
          break;
        case 'linio':
          platformParams.userId = v.bindingModal.userId;
          platformParams.appKey = v.bindingModal.appKey;
          platformParams.siteUrl = v.bindingModal.siteUrl;
          break;
        case 'meesho':
          platformParams.meeshoMerchant = v.bindingModal.clientId;
          platformParams.clientSecret = v.bindingModal.secretKey;
          break;
        case 'passfeed':
          platformParams.username = v.bindingModal.username;
          platformParams.password = v.bindingModal.password;
          break;
        case 'rakuten':
          platformParams.clientKey = v.bindingModal.clientKey;
          break;
        case 'shoplazza':
          platformParams.storeName = v.bindingModal.storeName;
          break;
        case 'shopline':
          platformParams.accessToken = v.bindingModal.accessToken;
          break;
        case 'teezily':
          platformParams.temail = v.bindingModal.temail;
          platformParams.password = v.bindingModal.password;
          break;
        case 'thisshop':
          platformParams.appId = v.bindingModal.appId;
          platformParams.appSecret = v.bindingModal.appSecret;
          platformParams.signKey = v.bindingModal.signKey;
          break;
        case 'wowcher':
          platformParams.wowcherKey = v.bindingModal.wowcherKey;
          platformParams.wowcherSecret = v.bindingModal.wowcherSecret;
          break;
        case 'aliexpress':
          platformParams.isFullyManaged = v.bindingModal.isFullyManaged;
          platformParams.isHalfManaged = v.bindingModal.isHalfManaged;
          break;
        case 'tiktok':
          delete platformParams.eori;
          delete platformParams.totalFinalFeePercentage;
          delete platformParams.vatNo;
          //   let tikTokSiteArr = v.shopSiteDataList.filter(item => {
          //     return item.siteId === v.bindingModal.tiktokSiteIds;
          //   });
          //   if (tikTokSiteArr.length === 0) {
          //     v.$Message.error('无法匹配到对应站点信息,请重新选择站点或联系管理员！');
          //     return { isPass: false };
          //   }
          //   platformParams.siteId = v.bindingModal.tiktokSiteIds;
          break;
        case 'ozon':
          platformParams.clientId = v.bindingModal.clientId;
          platformParams.siteId = v.bindingModal.siteId;
          platformParams.apiKey = v.bindingModal.apiKey;
          delete platformParams.eori;
          delete platformParams.vatNo;
          break;
        case 'miravia':
          platformParams.businessDeptId = v.bindingModal.businessDeptId;
          platformParams.vatRate = v.bindingModal.vatRate;
          delete platformParams.eori;
          delete platformParams.vatNo;
          break;
        case 'wb':
          platformParams.businessDeptId = v.bindingModal.businessDeptId;
          platformParams.token = v.bindingModal.token;
          delete platformParams.eori;
          delete platformParams.vatNo;
          break;
        case 'sheinx':
          platformParams.businessDeptId = v.bindingModal.businessDeptId;
          delete platformParams.eori;
          delete platformParams.vatNo;
          break;
        case 'temux':
          platformParams.businessDeptId = v.bindingModal.businessDeptId;
          platformParams.token = v.bindingModal.token;
          platformParams.developerId = v.bindingModal.developerId;
          delete platformParams.eori;
          delete platformParams.vatNo;
          break;
      }
      return platformParams;
    },
    resetMt() {
      let v = this;
      v.secondStep = false;
      v.eid = null;
      setTimeout(() => {
        for (let key in v.bindingModal) {
          v.bindingModal[key] = null;
        }
        v.bindingModal.site = 'us';
        v.bindingModal.amazonSiteStatus = 1;
      }, 30)
      this.$refs['bindingModal'].resetFields();
    },
    // 获取额外配置的接口路径
    getOtherApi (shopType, key) {
      if (this.$common.isEmpty(this.otherApi[shopType]) || this.$common.isEmpty(this.otherApi[shopType][key])) return '';
      return this.otherApi[shopType][key];
    },
    // 代号验证
    vaildCode(rule, value1, callback) {
      this.$nextTick(() => {
        const reg = this.$regular.enterCode;
        let value = this.bindingModal.code;
        if (!this.$common.isEmpty(value) && !reg.test(value)) {
          return callback(new Error('代号格式不正确，请检查'));
        }
        this.$common.strMaxVerify(rule, value, callback);
      })
    },
    clientValid(rule, value, callback) {
      if (value === '' || value === null) {
        callback(new Error('clientId不能为空'));
      } else {
        callback();
      }
    },
    vaildcdisUserId(rule, val, callback) {
      let value = this.bindingModal.cdisUserId;
      if (value === '' || value === null) {
        callback(new Error('cdiscount接口账号不能为空'));
      } else {
        callback();
      }
    },
    vaildcdisAppkey(rule, val, callback) {
      let value = this.bindingModal.cdisAppkey;
      if (value === '' || value === null) {
        callback(new Error('接口账号密码不能为空'));
      } else {
        callback();
      }
    },
    lazadaAuthSiteValid(rule, val, callback) {
      let value = this.bindingModal.siteIds;
      if (!value || (value && value.length === 0)) {
        callback(new Error('站点不能为空'));
      } else {
        callback();
      }
    },
    siteIdValidater(rule, value, callback) {
      // this.bindingModal
      if (this.$common.isEmpty(value)) {
        return callback(new Error('请选择站点'));
      }
      callback();
    },
    sellerIdAmazonVal(rule, value, callback) {
      if (value === '' || value === null) {
        callback(new Error('请输入Merchant ID'));
      } else {
        callback();
      }
    },
    mwsAuthTokenVal(rule, value, callback) {
      if (value === '' || value === null) {
        callback(new Error('请输入MWS授权令牌'));
      } else {
        callback();
      }
    },
    clientSecretValidMt(rule, value, callback) {
      if (value === '' || value === null) {
        callback(new Error('clientSecret不能为空'));
      } else {
        callback();
      }
    },
    validAccount(rule, val, callback) {
      let value = this.bindingModal.account;
      if (!value) {
        callback(new Error('account 不能为空'));
      } else {
        callback();
      }
    },
    validSellerLoginId(rule, val, callback) {
      let value = this.bindingModal.sellerLoginId;
      if (!value) {
        callback(new Error('sellerLoginId 不能为空'));
      } else {
        callback();
      }
    },
    validConsumerId(rule, val, callback) {
      let value = this.bindingModal.consumerId;
      if (!value) {
        callback(new Error('consumerId 不能为空'));
      } else {
        callback();
      }
    },
    validAccessToken(rule, val, callback) {
      let value = this.bindingModal.accessToken;
      if (!value) {
        callback(new Error('accessToken 不能为空'));
      } else {
        callback();
      }
    },
    // 获取 Temu 店铺主体
    getDevList () {
      return new Promise((resolve) => {
        this.developerIdList = [];
        // queryType=0 自定义渠道 temu，queryType=1 temu半托管
        if (!['temux'].includes(this.shopPlatformType)) return resolve([]);
        this.axios.get(api.settingService.developerList, {
          params: {
            queryType: 1
          },
          hiddenError: true
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          this.developerIdList = (res.data.datas || []);
          resolve(this.developerIdList);
        }).catch(() => {
          resolve([]);
        });
      })
    },
    validPrivateKey(rule, val, callback) {
      let value = this.bindingModal.privateKey;
      if (!value) {
        callback(new Error('privateKey 不能为空'));
      } else {
        callback();
      }
    },
    validChannelType(rule, val, callback) {
      let value = this.bindingModal.channelType;
      if (!value) {
        callback(new Error('channelType 不能为空'));
      } else {
        callback();
      }
    },
    validStoreHash(rule, val, callback) {
      let value = this.bindingModal.storeHash;
      if (!value) {
        callback(new Error('storeHash 不能为空'));
      } else {
        callback();
      }
    },
    validApiKey(rule, val, callback) {
      let value = this.bindingModal.apiKey;
      if (!value) {
        callback(new Error('apiKey 不能为空'));
      } else {
        callback();
      }
    },
    validUserId(rule, val, callback) {
      let value = this.bindingModal.userId;
      if (!value) {
        callback(new Error('userId 不能为空'));
      } else {
        callback();
      }
    },
    validUniqueKey(rule, val, callback) {
      let value = this.bindingModal.uniqueKey;
      if (!value) {
        callback(new Error('uniqueKey 不能为空'));
      } else {
        callback();
      }
    },
    validSiteUrl(rule, val, callback) {
      let value = this.bindingModal.siteUrl;
      if (!value) {
        callback(new Error('siteUrl 不能为空'));
      } else {
        callback();
      }
    },
    validConsumerSecret(rule, val, callback) {
      let value = this.bindingModal.consumerSecret;
      if (!value) {
        callback(new Error('consumerSecret 不能为空'));
      } else {
        callback();
      }
    },
    validAppId(rule, val, callback) {
      let value = this.bindingModal.appId;
      if (!value) {
        callback(new Error('appId 不能为空'));
      } else {
        callback();
      }
    },
    validSignKey(rule, val, callback) {
      let value = this.bindingModal.signKey;
      if (!value) {
        callback(new Error('signKey 不能为空'));
      } else {
        callback();
      }
    },
    validWowcherKey(rule, val, callback) {
      let value = this.bindingModal.wowcherKey;
      if (!value) {
        callback(new Error('wowcherKey 不能为空'));
      } else {
        callback();
      }
    },
    validWowcherSecret(rule, val, callback) {
      let value = this.bindingModal.wowcherSecret;
      if (!value) {
        callback(new Error('wowcherSecret 不能为空'));
      } else {
        callback();
      }
    },
    validAppKey(rule, val, callback) {
      let value = this.bindingModal.appKey;
      if (!value) {
        callback(new Error('appKey 不能为空'));
      } else {
        callback();
      }
    },
    validAppSecret(rule, val, callback) {
      let value = this.bindingModal.appSecret;
      if (!value) {
        callback(new Error('appSecret 不能为空'));
      } else {
        callback();
      }
    },
    validUserName(rule, val, callback) {
      let value = this.bindingModal.username;
      if (!value) {
        callback(new Error('username 不能为空'));
      } else {
        callback();
      }
    },
    validAlibabaType(rule, val, callback) {
      let value = this.bindingModal.alibabaType;
      if (!value) {
        callback(new Error('账户类型不能为空'));
      } else {
        callback();
      }
    },
    validClientKey(rule, val, callback) {
      let value = this.bindingModal.clientKey;
      if (!value) {
        callback(new Error('clientKey 不能为空'));
      } else {
        callback();
      }
    },
    validStoreName(rule, val, callback) {
      let value = this.bindingModal.storeName;
      if (!value) {
        callback(new Error('storeName 不能为空'));
      } else {
        callback();
      }
    },
    validPassword(rule, val, callback) {
      let value = this.bindingModal.password;
      if (!value) {
        callback(new Error('password 不能为空'));
      } else {
        callback();
      }
    },
    validYandexClientSecret(rule, val, callback) {
      let value = this.bindingModal.yandexClientSecret;
      if (!value) {
        callback(new Error('clientSecret 不能为空'));
      } else {
        callback();
      }
    },
    validYandexClientId(rule, val, callback) {
      let value = this.bindingModal.yandexClientId;
      if (!value) {
        callback(new Error('clientId 不能为空'));
      } else {
        callback();
      }
    },
    validShopId(rule, val, callback) {
      let value = this.bindingModal.shopId;
      if (!value) {
        callback(new Error('shopId 不能为空'));
      } else {
        callback();
      }
    },
    validPartnerId(rule, val, callback) {
      let value = this.bindingModal.partnerId;
      if (!value) {
        callback(new Error('partnerId 不能为空'));
      } else {
        callback();
      }
    },
    validFnacKey(rule, val, callback) {
      let value = this.bindingModal.fnacKey;
      if (!value) {
        callback(new Error('fnacKey 不能为空'));
      } else {
        callback();
      }
    },
    validConsumerKey(rule, val, callback) {
      let value = this.bindingModal.consumerKey;
      if (!value) {
        callback(new Error('consumerKey 不能为空'));
      } else {
        callback();
      }
    },
    validVendorId(rule, val, callback) {
      let value = this.bindingModal.vendorId;
      if (!value) {
        callback(new Error('vendorId 不能为空'));
      } else {
        callback();
      }
    },
    validSecretKey(rule, val, callback) {
      let value = this.bindingModal.secretKey;
      if (!value) {
        callback(new Error('secretKey 不能为空'));
      } else {
        callback();
      }
    },
    validNeweggSite(rule, val, callback) {
      let value = this.bindingModal.neweggSite;
      if (!value) {
        callback(new Error('neweggSite 不能为空'));
      } else {
        callback();
      }
    },
    validPmUserId(rule, val, callback) {
      let value = this.bindingModal.pmUserId;
      if (!value) {
        callback(new Error('UserId 不能为空'));
      } else {
        callback();
      }
    },
    validPmToken(rule, val, callback) {
      let value = this.bindingModal.pmToken;
      if (!value) {
        callback(new Error('Token 不能为空'));
      } else {
        callback();
      }
    },
    validTotalFinalFeePercentage(rule, val, callback) {
      this.$nextTick(() => {
        const value = this.bindingModal.totalFinalFeePercentage;
        if (!this.$common.isEmpty(value)) {
          let floatLength = 4;
          let maxCondition = Number(value) >= 100;
          let message = '(不包括100)'
          if (['miravia'].includes(this.shopPlatformType)) {
            maxCondition = Number(value) > 100;
            floatLength = 2;
            message = '';
          }
          if (isNaN(value) || Number(value) < 0 || maxCondition) {
            callback(new Error(`请输入0到100${message}之间的数字`));
          } else if (value.includes('.') && value.split('.')[1].length > floatLength) {
            callback(new Error(`小数点后面不能超过${floatLength}位`));
          } else {
            callback();
          }
        } else {
          callback(new Error('平台佣金比例不能为空'));
        }
      })
    },
    // 验证 VAT 比例
    validVatRate (rule, val, callback) {
      this.$nextTick(() => {
        this.$common.validatorMaxNumber(rule, this.bindingModal[rule.field], callback);
      })
    },
    setNumber(data) {
      return isNaN(Number(data)) ? '' : Number(data);
    },
    // temux 选中站点值改变时
    temuxSiteChange (val) {
      this.bindingModal.developerId = '';
    },
    // 获取店铺信息
    getAccountDetails() {
      let v = this;
      if (!this.$common.isEmpty(v.eid)) {
        this.spinShow = true;
        v.axios.get('/setting-service/' + v.shopPlatformType + 'Account/' + v.eid).then(response => {
          if (response.data.code === 0) {
            v.secondStep = true;
            let data = response.data.datas;
            if (data) {
              if (['miravia', 'sheinx', 'temux'].includes(v.shopPlatformType)) {
                data.saleAccount = this.$common.copy(data) || {};
              }
              Object.keys(data).forEach(key => {
                this.$set(this.bindingModal, key, data[key]);
              });
              if (this.$common.isEmpty(data.saleAccount)) {
                data.saleAccount = {};
              }
              if (['temux'].includes(this.shopPlatformType) && !this.$common.isEmpty(data.developerId)) {
                const developerInfo = this.developerIdList.find(f => f.id == data.developerId);
                if (!this.$common.isEmpty(developerInfo) && !this.$common.isEmpty(developerInfo.site)) {
                  this.$set(this.bindingModal, 'temuxSiteId', developerInfo.site);
                }
              }
              if (this.$common.isEmpty(data.saleAccount) || this.$common.isEmpty(data.saleAccount.businessDeptId)) {
                this.bindingModal.businessDeptId = !this.$common.isEmpty(this.saleAccount.businessDeptId) ? this.saleAccount.businessDeptId : null;
              } else if (!this.$common.isEmpty(data.saleAccount.businessDeptId)) {
                this.bindingModal.businessDeptId = data.saleAccount.businessDeptId;
              }
              if (typeof data[`${v.shopPlatformType}Status`] != 'undefined') {
                v.bindingModal.status = data[`${v.shopPlatformType}Status`] == 1
              } else if (typeof data[`${v.shopPlatformType}Enabled`] != 'undefined') {
                v.bindingModal.status = data[`${v.shopPlatformType}Enabled`] == 1
              }
              if (v.shopPlatformType === 'linio') {
                v.bindingModal.userId = data.linioUserId;
              }
              if (v.shopPlatformType === 'linio') {
                v.bindingModal.userId = data.linioUserId;
              }
              v.bindingModal.code = data.saleAccount.accountCode;
              v.bindingModal.vatNo = data.saleAccount.vatNo || '';
              v.bindingModal.eori = data.saleAccount.eori || '';

              v.bindingModal.totalFinalFeePercentage = v.$common.isEmpty(data.saleAccount.totalFinalFeePercentage) ? '' : data.saleAccount.totalFinalFeePercentage + '';
              v.bindingModal.brandId = data.saleAccount.brandId || '';
              v.bindingModal.brandName = data.saleAccount.brandName || '';
              v.bindingModal.iossNo = data.saleAccount.iossNo;
              v.bindingModal.account = data.saleAccount.account !== 'null' ? data.saleAccount.account : '';
              if (v.shopPlatformType === 'amazon') {
                v.bindingModal.account = data.saleAccount.account;
                v.bindingModal.sellerIdAmazon = data.sellerId;
                v.bindingModal.mwsAuthToken = data.mwsAuthToken;
                v.bindingModal.amazonSiteIds = data.siteId;
                v.bindingModal.amazonAccountId = data.amazonAccountId;
              }
              for (let platform in AUTH_PLATFORM_TIME_MAP) {
                if (v.shopPlatformType === platform) {
                  v.bindingModal.bindingTime = v.getDataToLocalTime(data[AUTH_PLATFORM_TIME_MAP[platform]], 'fulltime');
                }
              }
              if (v.shopPlatformType === 'walmart') {
                v.bindingModal.site = data.site;
              }
              v.bindingModal.shopifyShopName = data.shopName;
              v.bindingModal.transactionRate = v.setNumber(data.transactionRate);
              if (v.shopPlatformType === 'lazada') {
                const siteId = data.lazadaAccountSaleAreaList
                if (siteId && siteId[0] && typeof siteId[0].siteId != 'undefined' && siteId[0].siteId != null) {
                  v.bindingModal.siteIds = siteId[0].siteId.toString();
                }
              }
              v.bindingModal.accessToken = data.accessToken;
              v.bindingModal.clientId = data.clientId;
              v.bindingModal.clientSecret = data.clientSecret;
              v.bindingModal.cdisUserId = data.userId;
              v.bindingModal.cdisAppkey = data.appKey;
              v.bindingModal.pmUserId = data.login;
              v.bindingModal.pmToken = data.pwd;
              v.bindingModal.consumerId = data.consumerId;
              v.bindingModal.privateKey = data.privateKey;
              v.bindingModal.channelType = data.channelType;
              v.bindingModal.sellerId = data.sellerId;
              v.bindingModal.secretKey = data.secretKey;
              v.bindingModal.neweggSite = data.site;
              v.bindingModal.alibabaType = data.accountType;
              v.bindingModal.username = data.userName;
              v.bindingModal.password = data.password;
              v.bindingModal.yandexClientId = data.clientId;
              v.bindingModal.yandexClientSecret = data.clientSecret;
              v.bindingModal.accessTokenVova = data.accessToken;
              v.bindingModal.platformId = data.vovaPlatformId;

              if (v.shopPlatformType === 'cdiscount') {
                v.bindingModal.siteId = data.cdiscountAccountSaleAreaList[0].siteId.toString();
              }
              if (v.shopPlatformType === 'real') {
                v.bindingModal.cdisUserId = data.clientKey !== 'null' ? data.clientKey : '';
                v.bindingModal.cdisAppkey = data.secretKey !== 'null' ? data.secretKey : '';
              }
              if (v.shopPlatformType === 'jdth' || v.shopPlatformType === 'jdyn') {
                v.bindingModal.appKey = data.clientId;
                v.bindingModal.appSecret = data.clientSecret;
              }
              if (['aliexpress'].includes(v.shopPlatformType)) {
                this.bindingModal.isFullyManaged = this.$common.isEmpty(data.isFullyManaged) ? null : data.isFullyManaged;
                this.bindingModal.isHalfManaged = this.$common.isEmpty(data.isHalfManaged) ? null : data.isHalfManaged;
              }
            }
          }
        }).finally(() => {
          this.spinShow = false;
        });
      }
    },
    selectThisPlateform(index) {
      let v = this;
      v.selectedValue = index;
    },
    handleRemove(index) {
      this.formDynamic.items.splice(index, 1);
    },
    addNewBindingInput() {
      this.formDynamic.items.push({
        value: '',
        icon: 'compose'
      });
    },
    ottoGetToken(ottoAccountId) {
      let v = this;
      v.axios.get(api.get_ottoAccount_getToken + ottoAccountId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('授权成功');
          v.$emit('closeBindingModel');
        }
      });
    },
    gotoAuth() {
      var v = this;
      if (v.shopPlatformType === 'otto') {
        v.ottoGetToken(v.eid);
        return;
      }
      v.spinShow = true;
      let newWindow = window.open('', '_blank');
      v.axios.get('/setting-service/' + v.shopPlatformType + 'Account/authUrl/' + v.eid).then(response => {
        if (response.data.code === 0) {
          if (v.shopPlatformType === 'dhgate') {
            let data = response.data.datas;
            let dhgateParams = data.split('?')[2];
            localStorage.setItem('dhgateParams', JSON.stringify(dhgateParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
            let url = data.split('?')[0] + '?' + data.split('?')[1];
            newWindow.location.href = url;
          }
          if (v.shopPlatformType === 'wish') {
            let data = response.data.datas;
            let wishParams = data.split('?')[1];
            localStorage.setItem('wishParams', JSON.stringify(wishParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
            localStorage.setItem('accountId', JSON.stringify(v.sid !== null ? v.sid : v.eid));
          } else if (v.shopPlatformType === 'yandex') {
            let data = response.data.datas;
            let yandexParams = data.split('?')[1];
            localStorage.setItem('yandexParams', JSON.stringify(yandexParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
          } else if (v.shopPlatformType === 'factorymarket') {
            let data = response.data.datas;
            let fmParams = data.split('?')[1];
            localStorage.setItem('fmParams', JSON.stringify(fmParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
          } else if (v.shopPlatformType === 'joom') {
            let data = response.data.datas;
            let joomParams = data.split('?')[1];
            localStorage.setItem('joomParams', JSON.stringify(joomParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
            localStorage.setItem('accountId', JSON.stringify(v.sid !== null ? v.sid : v.eid));
          } else if (v.shopPlatformType === 'alibabagj') {
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
            localStorage.setItem('accountId', JSON.stringify(v.sid !== null ? v.sid : v.eid));
          }
          if (v.shopPlatformType === 'allegro') {
            let data = response.data.datas;
            let allegroParams = data.split('?')[1];
            localStorage.setItem('allegroParams', JSON.stringify(allegroParams));
            localStorage.setItem('shopPlatformType', JSON.stringify(v.shopPlatformType));
            localStorage.setItem('accountId', JSON.stringify(v.sid !== null ? v.sid : v.eid));
          }
          newWindow.location.href = response.data.datas;
        } else {
          newWindow.close();
        }
      }).catch(() => {
        newWindow.close();
      }).finally(() => {
        v.spinShow = false;
      })
    },
    enterNextStep() {
      let v = this;
      v.$emit('enterNext');
    },
    // 保留三位小数
    decimalPoint(VauleNumber) {
      let newNumber = null;
      if (!isNaN(VauleNumber)) {
        if (VauleNumber >= 0) {
          newNumber = Number(VauleNumber.toString().match(/^\d+(?:\.\d{0,3})?/));
        }
        return newNumber;
      }
      return null;
    },
    // 获取商品管理中的品牌
    getBrandList() {
      return new Promise((resolve) => {
        this.brandList = [];
        this.axios.get(api.getAll_productBrandcommon, { hiddenError: true }).then(response => {
          if (response.status == 200) {
            this.brandList = (response.data.datas || []).filter(item => {
              return item.status == 1
            })
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        });
      })
    },
    brandIdChange(val) {
      const bran = this.brandList.filter(item => {
        return item.productBrandId == val
      })
      this.bindingModal.brandName = bran[0] ? (bran[0].name || '') : ''
    }
  },
  computed: {
    // 是否第三方授权
    isThirdAuth() {
      return this.$common.isEmpty(this.thirdAuth) ? false : this.thirdAuth;
    },
    disabledEdit() {
      return this.disabledStatus || this.isThirdAuth;
    },
    saleAccount() {
      if (this.$common.isEmpty(this.detailsParams)) return {};
      return this.detailsParams.saleAccount || {};
    },
    showAuthedButton() {
      let v = this;
      const otherAuth = ['wish', 'joom'];
      if (otherAuth.includes(v.shopPlatformType)) {
        return v.bindingModal[v.shopPlatformType + 'Enabled'];
      } else {
        return !v.bindingModal[v.shopPlatformType + 'Status'];
      }
    },
    // 店铺站点数据
    shopSiteDataList () {
      if (this.$common.isEmpty(this.$store.state.shopSiteList)) return [];
      return this.$store.state.shopSiteList;
    },
    // temux 店铺主体下拉数据
    developerDataList () {
      if (!['temux'].includes(this.shopPlatformType) || this.$common.isEmpty(this.bindingModal.temuxSiteId)) return this.developerIdList;
      const newLisrt = this.developerIdList.filter(item => item.site == this.bindingModal.temuxSiteId);
      return newLisrt;
    }
  }
};
</script>
<style>
.modalItemContent .ivu-form-item-error {
  margin-bottom: 20px !important;
}
</style>
<style scoped>
.ivu-form-item-error {
  margin-bottom: 40px;
}
</style>
