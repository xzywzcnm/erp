<template>
  <div>
    <div class="modalItemContent">
      <Form :model="newWareHouseParams" label-position="right" :label-width="130" ref="newWareHouseParams" :rules="ruleWareSet">
        <Card title="仓库基础信息" dis-hover class="mb10">
          <Form-item label="类型：" prop="selectType">
            <dyt-select v-model="newWareHouseParams.selectType" :disabled="disabledStatus || isDisabled" style="width:250px" @on-change='selectTypeChange'>
              <Option value="0">自营</Option>
              <Option value="1">第三方</Option>
              <Option value="2">云仓</Option>
              <Option value="5">直发</Option>
            </dyt-select>
          </Form-item>
          <Form-item label="仓库代码：" prop="warehouseCode">
            <Input :disabled="disabledStatus || isDisabled" :maxlength="15" v-model.trim="newWareHouseParams.warehouseCode" style="width:250px" placeholder="请输入仓库代码"></Input>
          </Form-item>
          <Form-item label="仓库名称：" prop="warehouseName">
            <Input v-model.trim="newWareHouseParams.warehouseName" style="width:250px" :disabled="isDisabled" placeholder="请输入仓库名称" :maxlength="50"></Input>
          </Form-item>
          <Form-item label="状态：" prop="selectStatus">
            <dyt-select v-model="newWareHouseParams.selectStatus" style="width:250px" :disabled="isDisabled">
              <Option value="0">可用</Option>
              <Option value="1">停用</Option>
            </dyt-select>
          </Form-item>
          <!-- <Form-item label="库存同步：" prop="syncInventoryStatus" v-if='newWareHouseParams.selectType === "0" || newWareHouseParams.selectType === "2"' >
            <dyt-select
              v-model="newWareHouseParams.syncInventoryStatus"
              :disabled="isDisabled"
              @on-change="getSync"
              style="width:250px">
              <Option :value="0">关闭</Option>
              <Option :value="1">开启</Option>
            </dyt-select>
          </Form-item> -->
          <!-- <Form-item v-if="newWareHouseParams.syncInventoryStatus === 1" label="选择同步仓库：" prop="referenceWarehouseId">
            <dyt-select
                v-model="newWareHouseParams.referenceWarehouseId"
                :disabled="isDisabled"
                style="width:250px"
                filterable > <Option
                v-for='item in syncWarehouseList'
                :value='item.warehouseId'
                :key='item.warehouseId' > {{ item.warehouseName }}</Option> </dyt-select >
          </Form-item > -->
          <div class="vat_box">
            <Icon type="md-add-circle" class="add_vat" @click="AddVat" v-show="warehouseModalStatus != 'look'" />
            <Table :loading="loading" :columns="vatColumns" :data="vatDataList" height="300"></Table>
          </div>
        </Card>
        <div v-if='newWareHouseParams.selectType === "0" || newWareHouseParams.selectType === "2" || newWareHouseParams.selectType === "3"'>
          <Card title="仓库地址和联系人" dis-hover class="mb10">
            <Form-item label="国家：" prop="country">
              <Input v-model.trim="newWareHouseParams.country" style="width:250px" :disabled="isDisabled" :maxlength="50"></Input>
            </Form-item>
            <Form-item label="省份：" prop="province">
              <Input v-model.trim="newWareHouseParams.province" style="width:250px" :disabled="isDisabled" :maxlength="100"></Input>
            </Form-item>
            <Form-item label="城市：" prop="city">
              <Input v-model.trim="newWareHouseParams.city" style="width:250px" :disabled="isDisabled" :maxlength="100"></Input>
            </Form-item>
            <Form-item label="地址：" prop="address">
              <Input v-model.trim="newWareHouseParams.address" style="width:250px" :disabled="isDisabled" :maxlength="100"></Input>
            </Form-item>
            <Form-item label="邮编：" prop="addressZipCode">
              <Input v-model.trim="newWareHouseParams.addressZipCode" style="width:250px" :disabled="isDisabled" :maxlength="10"></Input>
            </Form-item>
            <Form-item label="联系人：" prop="userName">
              <Input v-model.trim="newWareHouseParams.userName" style="width:250px" :disabled="isDisabled" :maxlength="25"></Input>
            </Form-item>
            <Form-item label="电话：" prop="telephone">
              <!--<Input v-model.trim="newWareHouseParams.telephone" style="width:250px"></Input>-->
              <Input v-model.trim="newWareHouseParams.telephone" style="width:250px"></Input>
            </Form-item>
            <Form-item label="手机：" prop="mobile">
              <!--<Input v-model.trim="newWareHouseParams.mobile" style="width:250px"></Input>-->
              <Input v-model.trim="newWareHouseParams.mobile" style="width:250px"></Input>
            </Form-item>
            <Form-item label="Email：" prop="email">
              <Input v-model.trim="newWareHouseParams.email" style="width:250px" :disabled="isDisabled" :maxlength="100"></Input>
            </Form-item>
            <Form-item label="街道：" prop="street">
              <Input
                v-model.trim="newWareHouseParams.street"
                style="width:250px"
                :disabled="isDisabled"
                :maxlength="100"></Input>
            </Form-item>
            <Form-item label="区域：" prop="district">
              <Input
                v-model.trim="newWareHouseParams.district"
                style="width:250px"
                :disabled="isDisabled"
                :maxlength="100"></Input>
            </Form-item>
          </Card>
        </div>
        <!--第三方为亚马逊显示的内容  -->
        <div v-if="newWareHouseParams.selectType === '1' " class="mb10">
          <Card title="请选择第三方服务商" dis-hover class="mb10">
            <div class="clear">
              <div v-if="thirdCarrierList.length === 0">第三方服务商为空</div>
              <div v-for="(item,index) in thirdCarrierList" :key="index" :class="item.checked?'selectParty':''" class="typeBox" @click="choseThirdParth(index)">
                <div class="type-img-box">
                  <img v-if="item.logo" :src="item.logo" :alt="item.carrierName" />
                </div>
                <p>{{ item.carrierName }}</p>
              </div>
            </div>
          </Card>
          <Card title="请完善服务商信息" class="mb10" dis-hover v-if="overseasWarehouseTypeList.includes(threeId)">
            <!-- <div v-if="threeId === 'gcoutstore'">
              <Form-item label="AppKey：" prop="appKey">
                <Input v-model.trim="newWareHouseParams.appKey" style="width:250px" :maxlength="50"></Input>
              </Form-item>
              <Form-item label="AppToken：" prop="appToken">
                <Input v-model.trim="newWareHouseParams.appToken" style="width:250px" :maxlength="50"></Input>
              </Form-item>
              <Form-item label="客户代码：" prop="customerCode">
                <Input v-model.trim="newWareHouseParams.customerCode" style="width:250px" :maxlength="50"></Input>
              </Form-item>
            </div>
            <div v-if="threeId === 'pylOware' || threeId === 'shloutstore'">
              <Form-item label="UserToken：" prop="UserToken">
                <Input v-model.trim="newWareHouseParams.UserToken" style="width:250px" :maxlength="50"></Input>
              </Form-item>
            </div> -->
            <div class="carrier-param-list-box">
              <template v-for="(item, index) in carrierParamList">
                <!-- <Form-item
                  v-if="item.paramType === 'radio'"
                  :label="`${item.paramName}：`"
                  :prop="item.paramKey"
                  :key="`radio-${item.paramKey}-${index}`"
                  :class="item.paramKey"
                >
                  <RadioGroup v-model="newWareHouseParams[item.paramKey]" :disabled="isDisabled">
                    <Radio v-for="(k,ind) in item.carrierParamDictionaryList" :key="`radio-item-${ind}`" :label="k.itemValue">{{ k.itemName }}</Radio>
                  </RadioGroup>
                </Form-item> -->
                <Form-item
                  v-if="item.paramType === 'input'"
                  :label="`${item.paramName}：`"
                  :prop="item.paramKey"
                  :key="`input-${item.paramKey}-${index}`"
                  :class="item.paramKey"
                >
                  <dytInput
                    v-model.trim="newWareHouseParams[item.paramKey]"
                    style="width:250px"
                    :maxlength="inputMaxlength[item.paramKey] || 50"
                    :disabled="isDisabled"
                    :placeholder="`请输入${item.paramName || ''}`"
                  />
                </Form-item>
                <FormItem
                  v-else-if="item.paramType === 'select'"
                  :label="`${item.paramName}：`"
                  :prop="item.paramKey"
                  :key="`select-${item.paramKey}-${index}`"
                  :class="item.paramKey"
                >
                  <dyt-select
                    v-model.trim="newWareHouseParams[item.paramKey]"
                    style="width:250px"
                    :disabled="isDisabled"
                    :placeholder="`请选择${item.paramName || ''}`"
                  >
                    <Option v-for="(k,ind) in item.carrierParamDictionaryList" :key="ind" :value="k.itemValue">{{ k.itemName }}</Option>
                  </dyt-select>
                </FormItem>
              </template>
            </div>
            <div v-if="!$common.isEmpty(threeWarehouseList)">
              <div class="redDot">
                开启仓库：
              </div>
              <Form-item label="" prop="apiWarehouseId" :label-width="0">
                <RadioGroup v-model="warehouseId" @on-change="warehouseChange">
                  <Row>
                    <Col span="12" v-for="(item,index) in threeWarehouseList" :key="index">
                      <Radio
                        :label="item.warehouseId"
                        :disabled="isDisabled || carrierAccount.authStatus === 1"
                      >{{ item.warehouseName }}</Radio>
                    </Col>
                  </Row>
                </RadioGroup>
              </Form-item>
            </div>
          </Card>
          <Card
            title="授权信息"
            dis-hover
            v-if="(threeId === 'winitoutstore' || threeId === 'fourpxoutstore' || threeId === 'ocoutstore') && warehouseModalStatus !== 'add'">
            <FormItem title="获取Token:">
              <span v-show="carrierAccount.authStatus === 1" class="color-blue">已获取</span>
              <Button @click="gotoAccount" v-show="carrierAccount.authStatus === 0&& warehouseModalStatus !== 'look'">去授权
              </Button>
              <Button @click="gotoAccount" v-show="carrierAccount.authStatus === 1&& warehouseModalStatus !== 'look'">重新授权
              </Button>
            </FormItem>
            <FormItem label="userName:" v-show="carrierAccount.authStatus === 1">
              <span class="color-blue">{{ carrierAccount.account }}</span>
            </FormItem>
            <FormItem label="token:" v-show="carrierAccount.authStatus === 1">
              <span class="color-blue">{{ carrierAccount.token }}</span>
            </FormItem>
          </Card>
        </div>
        <div class="mb10">
          <div v-if="threeId === 'AMAZON_FBA'">
            <div class="line"></div>
            <!--<h3>店铺</h3>-->
            <Form-item label="店铺：" prop='store'>
              <dyt-select v-model="newWareHouseParams.store" style="width:250px" label-in-value @on-change='storeChange' :disabled="showStatus">
                <Option
                  v-for='shopItem in amazonStore'
                  :value="shopItem.amazonAccountId"
                  :key='shopItem.amazonAccountId'
                >{{ shopItem.saleAccount.account }}</Option>
              </dyt-select>
            </Form-item>
            <!-- <Form-item label="站点：">
                 <span>{{selectedStoreName}}</span>
             </Form-item>
              <Form-item label="仓库：">
                 <p>{{warehouseList.map(val => val.warehouseName).join('、')}}</p>
             </Form-item>-->
          </div>
          <!-- <Table :columns='thridProvideTable' :data='thridProvideData' v-if='newWareHouseParams.selectType === "1" && newWareHouseParams.thirdServiceProvider'></dTable>-->
        </div>

        <Card class="mb10" dis-hover v-if="disabledStatus && !thirdPartyVisible">
          <div slot="title" class="clear logisticsHeader">可用物流方式
            <Button v-if="!isDisabled" class="fr ml20" @click="setShippingMethodEnable">添加</Button>
            <Cascader transfer v-if="newWareHouseParams.selectType === '0' || newWareHouseParams.selectType === '2'|| newWareHouseParams.selectType === '3'"
            class="fr" style="width: 300px;"
            v-model="addShippingValue"
            :load-data="loadData"
            @on-change="changeShippingMethod"
            :data="shippingMethodData"
            filterable
            change-on-select
            ></Cascader>
            <dyt-select v-if="newWareHouseParams.selectType === '1'" class="fr mr10" style="width: 300px;" :disabled="isDisabled" v-model="addShippingValue">
              <Option
                v-for="(item,index) in disableShippingMethodList"
                :key="index"
                :value="item.systemShippingMethodId"
              >{{ item.carrierShippingMethodName }}</Option>
            </dyt-select>
          </div>
          <Table highlight-row border :loading="loading" :columns="columns2" :data="enableShippingMethodList" max-height="300">
          </Table>
        </Card>

        <Card dis-hover v-show="disabledStatus && !thirdPartyVisible">
          <div slot="title">派送距离权重设置
            <i-switch class="ml10" v-model="newWareHouseParams.enableAreaWeight" @on-change="distanceChange" :true-value="1" :false-value="0" :disabled="isDisabled"></i-switch>
          </div>
          <p class="mb10">
            <span>选择分区方案：</span>
            <dyt-select v-model="newWareHouseParams.wmsWarehouseAreaProgramId" :disabled="isDisabled" filterable @on-change="getAreaProgramId" class="wid">
              <Option v-for="(item,index) in areaList" :value="item.wmsWarehouseAreaProgramId" :key="index">{{ item.name }}
              </Option>
            </dyt-select>
          </p>
          <dTable :loading="isLoadingData3" :columns="columns3" :data="data3" height="400"></dTable>
        </Card>
      </Form>
    </div>
    <!--表格查看模态框-->
    <Modal title="添加第三方仓授权" v-model="accountModel">
      <p class="text-align-center" v-if="threeId === 'winitoutstore'">请在新开的页面中完成万邑通账户绑定操作！</p>
      <p class="text-align-center" v-if="threeId === 'fourpxoutstore'">请在新开的页面中完成递四方账户绑定操作！</p>
      <div slot="footer">
        <Button type="primary" @click="accountCallback">授权成功</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const matchingKey = {
  'customer_code': 'customerCode',
  'param1': 'UserToken'
};
const logoList = [
  { carrierCode: 'AMAZON_FBA', url: require('../../../../assets/images/u16784.png') },
  { carrierCode: 'winitoutstore', url: require('../../../../assets/images/u16790.png') },
  { carrierCode: 'gcoutstore', url: require('../../../../assets/images/u16791.png') },
  { carrierCode: 'fourpxoutstore', url: require('../../../../assets/images/u16792.png') },
  { carrierCode: 'pylOware', url: require('../../../../assets/images/u16793.png') },
  { carrierCode: 'shloutstore', url: require('../../../../assets/images/u16794.png') },
  { carrierCode: 'TT-CHUKOU1UK', url: require('../../../../assets/images/TT-CHUKOU1UK.png') },
  { carrierCode: 'Birdsystem-UK1', url: require('../../../../assets/images/Birdsystem-UK1.png') },
  { carrierCode: 'TT-fyDGC', url: require('../../../../assets/images/TT-fyDGC.jpg') },
  { carrierCode: 'TT-ektDGC', url: require('../../../../assets/images/TT-ektDGC.png') },
  { carrierCode: 'cne', url: require('../../../../assets/images/cneLogo.png') },
  { carrierCode: 'rinid', url: require('../../../../assets/images/rinidLogo.png') },
  { carrierCode: 'Hipacking', url: require('../../../../assets/images/Hipacking.png') },
  { carrierCode: 'ocoutstore', url: require('../../../../assets/images/u16795.png') },
  // 新火
  { carrierCode: 'nf', url: require('../../../../assets/images/novFire.png') },
  // 艾姆勒
  { carrierCode: 'amloutstore', url: require('../../../../assets/images/iml.png') },

];
export default {
  mixins: [Mixin],
  components: {},
  data () {
    return {
      thirdPartyVisible: false,
      isLoadingData3: false,
      areaList: [], // 分区方案
      shippingMethodData: [],
      inputMaxlength: {
        'apiDeveloperToken': 200
      },
      isShowWarehouseCheck: false,
      resetMatchingKey: [],
      accountModel: false,
      loading: false,
      addShippingValue: [],
      carrierAccount: {
        authStatus: 0,
        account: '',
        token: '',
        accountUrl: ''
      },
      enableShippingMethodList: [],
      disableShippingMethodList: [],
      thirdCarrierList: [],
      warehouseId: '',
      threeWarehouseList: [], // 第三方仓库
      columns3: [
        {
          title: '分区代码/名称',
          width: 155,
          render (h, params) {
            return h('span', params.row.code + '/' + params.row.name);
          }
        }, {
          title: '起止邮编',
          width: 145,
          render (h, params) {
            if (params.row.wmsWarehouseAreaDetailList) {
              return h('div', {}, params.row.wmsWarehouseAreaDetailList.map(i => {
                return h('p', {}, i.startPostalCode + '/' + i.endPostalCode);
              }));
            }
          }
        }, {
          title: '距离权重（0-999，距离越近数字越小）',
          minWidth: 300,
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: params.row.weight,
                min: 0,
                max: 999,
                disabled: (() => {
                  return this.isDisabled;
                })()
              },
              on: {
                'on-change': val => {
                  let obj = JSON.parse(JSON.stringify(params.row));
                  obj.weight = val;
                  this.$set(this.data3, [params.index], obj);
                }
              }
            });
          }
        }
      ],
      data3: [],
      caData3: [],
      columns2: [],
      data2: [],
      threeId: '',
      thirdPartyDate: [
        {
          checked: true,
          logo: require('../../../../assets/images/u16784.png'),
          title: '亚马逊FBA',
          id: 'fba'
        }, {
          checked: false,
          logo: require('../../../../assets/images/u16790.png'),
          title: '万邑通',
          id: 'wan'
        }
      ],
      editLogisticChannelModal: false,
      newWareHouseParams: {
        apiInterface: '',
        apiWarehouseCode: '',
        apiWarehouseId: '',
        apiWarehouseName: '',
        carrierCode: '',
        selectStatus: '0', // 选择仓库状态
        selectType: '0', // 选择仓库类型
        warehouseCode: '', // 仓库代码
        warehouseName: '', // 仓库名称
        country: '', // 国家
        province: '', // 省份
        city: '', // 城市
        address: '', // 地址
        addressZipCode: '', // 邮编
        userName: '', // 用户名
        telephone: '', // 电话
        mobile: '', // 手机
        email: '', // email
        thirdServiceProvider: '', // 三方服务商
        store: '',
        enableAreaWeight: 0, // 权重
        syncInventoryStatus: 0, // 库存同步
        wmsWarehouseAreaProgramId: '',
        referenceWarehouseId: null, // 选择同步仓库
        appKey: '', // appKey
        appToken: '', // appToken
        customerCode: '', // 客户代码
        street: '', // 街道
        district: '', // 区域
        UserToken: '' // PYL 仓的token
      },
      syncWarehouseList: [], // 同步仓库列表
      selectedStoreName: '',
      amazonStore: [],
      warehouseList: [],
      thirdServiceList: [],
      showStatus: false, // 编辑时服务商信息不可编辑
      disabledStatus: false, // 编辑时仓库代码不能修改
      ruleWareSet: {
        country: [
          {
            type: 'string',
            max: 5,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        province: [
          {
            type: 'string',
            max: 100,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        city: [
          {
            type: 'string',
            max: 100,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        address: [
          {
            type: 'string',
            max: 100,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        userName: [
          {
            type: 'string',
            max: 25,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        warehouseCode: [
          {
            required: true,
            message: '仓库代码不能为空',
            trigger: 'blur'
          }
        ],
        warehouseName: [
          {
            required: true,
            message: '仓库名称不能为空',
            trigger: 'blur'
          }
        ],
        thirdServiceProvider: [
          {
            required: true,
            message: '请选择第三方服务商',
            trigger: 'blur'
          }
        ], // telephone: [
        //   { validator: this.validateTelphone(), trigger: 'blur' },
        //   { type: 'string', max: 20, message: '超出最大长度限制', trigger: 'blur' }
        // ],
        // mobile: [
        //   { validator: this.validateMobile(), trigger: 'blur' },
        //   { type: 'string', max: 20, message: '超出最大长度限制', trigger: 'blur' }
        // ],
        email: [
          { validator: this.validateEmail, trigger: 'blur' },
          { type: 'string', max: 30, message: '超出最大长度限制', trigger: 'blur' }
        ],
        addressZipCode: [
          // { validator: this.validateZipCode(), trigger: 'blur' },
          { type: 'string', max: 20, message: '超出最大长度限制', trigger: 'blur' },
          { type: 'string', max: 20, message: '超出最大长度限制', trigger: 'change' }
        ],
        store: [
          { required: true, validator: this.requiredValidate, msg: '请选择店铺', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '请选择店铺', trigger: 'change' }
        ],
        station: [
          { required: true, validator: this.requiredValidate, msg: '请选择站点', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '请选择站点', trigger: 'change' }
        ],
        referenceWarehouseId: [
          { required: true, validator: this.requiredValidate, msg: '请选择同步仓库', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '请选择同步仓库', trigger: 'change' }
        ],
        appKey: [
          { required: true, validator: this.requiredValidate, msg: 'appKey 不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: 'appKey 不能为空', trigger: 'change' }
        ],
        appToken: [
          { required: true, validator: this.requiredValidate, msg: 'appToken 不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: 'appToken 不能为空', trigger: 'change' }
        ],
        UserToken: [
          { required: true, validator: this.requiredValidate, msg: 'UserToken 不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: 'UserToken 不能为空', trigger: 'change' }
        ],
        apiDeveloperToken: [
          { required: true, validator: this.requiredValidate, msg: 'DeveloperToken 不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: 'DeveloperToken 不能为空', trigger: 'change' }
        ],
        customerCode: [
          { required: true, validator: this.requiredValidate, msg: '客户代码不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '客户代码不能为空', trigger: 'change' }
        ],
        accountName: [
          { required: true, validator: this.requiredValidate, msg: '账号名称不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '账号名称不能为空', trigger: 'change' }
        ],
        clientId: [
          { required: true, validator: this.requiredValidate, msg: '客户端ID不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '客户端ID不能为空', trigger: 'change' }
        ],
        userId: [
          { required: true, validator: this.requiredValidate, msg: '用户ID不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '用户ID不能为空', trigger: 'change' }
        ],
        token: [
          { required: true, validator: this.requiredValidate, msg: 'Token不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: 'Token不能为空', trigger: 'change' }
        ],
        secret: [
          { required: true, validator: this.requiredValidate, msg: '必填项不能为空', trigger: 'blur' },
          { required: true, validator: this.requiredValidate, msg: '必填项不能为空', trigger: 'change' }
        ],
        apiWarehouseId: [
          { required: true, message: '请选择开启仓库', trigger: 'change' }
        ]
      },
      thridProvideTable: [
        {
          title: '代码',
          key: 'code'
        }, {
          title: '名称'
        }, {
          title: '跟踪号'
        }, {
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', { style: { marginRight: '5px' } }, '启用'), h('Checkbox', {
                on: {
                  'on-change': (bool) => {
                    if (bool) {
                      this.thridProvideData.forEach(val => {
                        val.check = true;
                      });
                    } else {
                      this.thridProvideData.forEach(val => {
                        val.check = false;
                      });
                    }
                  }
                }
              })
            ]);
          },
          render: (h, params) => {
            return h('Checkbox', {
              props: {
                value: params.row.check
              }
            });
          }
        }, {
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              on: {
                'click': () => {
                  this.editLogisticChannelModal = true;
                }
              }
            }, '查看');
          }
        }
      ],
      thridProvideData: [
        {
          code: 'ssss',
          check: false
        }, {
          code: 'ssss2',
          check: false
        }
      ],
      carrierParamList: [],
      vatColumns: [
        {
          title: 'VAT税号',
          key: 'taxNo',
          align: 'center',
          render: (h, params) => {
            if (this.warehouseModalStatus === 'look') {
              return h('div', params.row.taxNo);
            } else {
              return h('Input', {
                props: {
                  value: params.row.taxNo
                },
                on: {
                  'input': val => {
                    this.$set(this.vatDataList[params.index], 'taxNo', val);
                  }
                }
              });
            }
          }
        }, {
          title: 'VAT税率',
          key: 'taxRate',
          align: 'center',
          render: (h, params) => {
            if (this.warehouseModalStatus === 'look') {
              return h('div', params.row.taxRate);
            } else {
              return h('div', [
                h('InputNumber', {
                  props: {
                    value: Number(params.row.taxRate),
                    min: 0,
                    max: 999
                  },
                  on: {
                    'on-change': val => {
                      this.$set(this.vatDataList[params.index], 'taxRate', val);
                    }
                  }
                }), h('span', {
                  style: {
                    marginLeft: '5px',
                    fontSize: '13px'
                  }
                }, '%')
              ]);
            }
          }
        }, {
          title: '设置适用店铺',
          key: 'saleAccountId',
          width: 200,
          align: 'center',
          render: (h, params) => {
            if (this.warehouseModalStatus === 'look') {
              let text = '';
              if (this.saleAccountList.length > 0) {
                this.saleAccountList.map((item) => {
                  if (item.saleAccountId === params.row.saleAccountId) {
                    text = item.accountCode;
                  }
                });
              }
              return h('div', text);
            } else {
              let options = [];
              if (this.saleAccountList.length > 0) {
                this.saleAccountList.map((item) => {
                  let talg = h('Option', {
                    props: {
                      value: item.saleAccountId
                    }
                  }, item.accountCode);
                  options.push(talg);
                });
              }
              return h('Select', {
                props: {
                  value: params.row.saleAccountId,
                  transfer: true
                },
                style: {
                  textAlign: 'left'
                },
                on: {
                  'on-change': val => {
                    this.$set(this.vatDataList[params.index], 'saleAccountId', val);
                  }
                }
              }, options);
            }
          }
        }, {
          title: '操作',
          align: 'center',
          key: 'options',
          render: (h, params) => {
            return this.warehouseModalStatus !== 'look' ? h('Button', {
              props: {
                type: 'primary'
              },
              on: {
                click: () => {
                  this.removeData(params.index);
                }
              }
            }, '删除') : '';
          }
        }
      ],
      vatDataList: [],
      saleAccountList: [],
      editData: null,
      overseasWarehouseTypeList: [
        'winitoutstore',
        'gcoutstore',
        'fourpxoutstore',
        'pylOware',
        'shloutstore',
        'cne',
        'rinid',
        'nf',
        'amloutstore',
        'ocoutstore'
      ]
    };
  },
  created () {},
  props: {
    curSingleDtl: { // 查看仓库数据的标记
      default: null
    },
    openFlag: { // 打开模态框的标记
      default: null
    },
    wareId: { // 编辑当前哪个仓库信息的标记
      default: null
    },
    warehouseModalStatus: { // 状态 edit add
      default: null
    }
  },
  watch: {
    // 查看当前仓库信息
    '$store.state.wareSetWatchFlag': function (bool) {
      if (this.warehouseModalStatus === 'edit' || this.warehouseModalStatus === 'look') {
        this.getEnabledSaleAccounts();
        this.editData = null;
        this.carrierParamList = [];
        if (bool) {
          this.newWareHouseParams.warehouseCode = this.curSingleDtl.warehouseCode;
          this.newWareHouseParams.warehouseName = this.curSingleDtl.warehouseName;
          this.newWareHouseParams.selectStatus = this.curSingleDtl.warehouseStatus;
          this.newWareHouseParams.selectType = this.curSingleDtl.warehouseType === '0' && this.curSingleDtl.isYms === 1 ? '2' : this.curSingleDtl.warehouseType;
          this.newWareHouseParams.country = this.curSingleDtl.countryCnName;
          this.newWareHouseParams.province = this.curSingleDtl.stateCnName;
          this.newWareHouseParams.city = this.curSingleDtl.cityCnName;
          this.newWareHouseParams.address = this.curSingleDtl.address;
          this.newWareHouseParams.addressZipCode = this.curSingleDtl.addressZipCode;
          this.newWareHouseParams.userName = this.curSingleDtl.linkMan;
          this.newWareHouseParams.telephone = this.curSingleDtl.telephone;
          this.newWareHouseParams.mobile = this.curSingleDtl.mobilePhone;
          this.newWareHouseParams.email = this.curSingleDtl.email;
          this.newWareHouseParams.street = this.curSingleDtl.street;
          this.newWareHouseParams.district = this.curSingleDtl.district;
          this.newWareHouseParams.thirdServiceProvider = this.curSingleDtl.warehouseOverseaType;
          this.newWareHouseParams.store = this.curSingleDtl.overseaAccountId;
          this.newWareHouseParams.syncInventoryStatus = this.curSingleDtl.syncInventoryStatus;
          this.newWareHouseParams.referenceWarehouseId = this.curSingleDtl.referenceWarehouseId;
          this.threeId = this.curSingleDtl.warehouseOverseaType;
          this.thirdPartyVisible = ['thirdCarrier'].includes(this.curSingleDtl.warehouseOverseaType);
          this.newWareHouseParams.enableAreaWeight = this.curSingleDtl.enableAreaWeight;
          this.newWareHouseParams.wmsWarehouseAreaProgramId = this.curSingleDtl.wmsWarehouseAreaProgramId;
          this.getEnableShippingMethods();
          this.GetTaxRateData(this.curSingleDtl.warehouseId);
          if (this.newWareHouseParams.syncInventoryStatus === 1) {
            this.getReferenceWarehouse();
          }
          if (this.curSingleDtl.warehouseType === '1') {
            this.getAllShippingMethods();
            this.getThirdCarriers().then(thirdCarrierList => {
              let isgetData = false;
              thirdCarrierList.forEach((i, index) => {
                if (i.carrierCode === this.curSingleDtl.warehouseOverseaType) {
                  isgetData = true;
                  i.checked = true;
                  this.warehouseChange();
                  this.choseThirdParth(index, {
                    callback: () => {},
                    getData: this.getServeDataVal,
                    apiWarehouseId: this.curSingleDtl.apiWarehouseId,
                    type: this.warehouseModalStatus
                  });
                }
              });
              !isgetData && this.getServeDataVal();
            });
            this.getAreaList();
            this.getByWarehouseId(this.curSingleDtl.warehouseId);
          }
          this.getShippingList();
        } else {
          this.reset();
        }
      } else {
        this.reset();
      }
    },
    // 监听 warehouseModalStatus 的状态
    warehouseModalStatus: {
      handler (data) {
        if (data === 'add') {
          this.getEnabledSaleAccounts();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 重置表单
    reset () {
      this.newWareHouseParams.warehouseCode = '';
      this.newWareHouseParams.warehouseName = '';
      this.newWareHouseParams.selectStatus = '0';
      this.newWareHouseParams.selectType = '0';
      this.newWareHouseParams.country = '';
      this.newWareHouseParams.province = '';
      this.newWareHouseParams.city = '';
      this.newWareHouseParams.address = '';
      this.newWareHouseParams.addressZipCode = '';
      this.newWareHouseParams.userName = '';
      this.newWareHouseParams.telephone = '';
      this.newWareHouseParams.mobile = '';
      this.newWareHouseParams.email = '';
      this.newWareHouseParams.district = '';
      this.newWareHouseParams.street = '';
      this.newWareHouseParams.thirdServiceProvider = '';
      this.newWareHouseParams.syncInventoryStatus = 0;
      this.newWareHouseParams.referenceWarehouseId = '';
      this.threeId = '';
      this.newWareHouseParams.appKey = '';
      this.newWareHouseParams.appToken = '';
      this.newWareHouseParams.customerCode = '';
      this.newWareHouseParams.UserToken = '';
      this.areaList = [];
      this.addShippingValue = [];
      this.resetSetKey();
    },
    // 重置插入的表单数据
    resetSetKey (setNull = false, exceptKey = []) {
      let notExceptKey = [];
      this.resetMatchingKey.forEach(key => {
        if (!exceptKey.includes(key)) {
          if (setNull) {
            this.newWareHouseParams[key] = null;
          } else {
            delete this.newWareHouseParams[key];
          }
        } else {
          notExceptKey.push(key);
        }
      })
      this.$nextTick(() => {
        !setNull && (this.resetMatchingKey = notExceptKey);
      })
    },
    // 删除按钮
    removeData (index) {
      this.vatDataList.splice(index, 1);
    },
    // 获取服务商设置表单值
    getServeDataVal () {
      if (['winitoutstore', 'fourpxoutstore', 'ocoutstore'].includes(this.curSingleDtl.warehouseOverseaType)) {
        this.getOverseaWarehouseAccount();
      }
      if (['gcoutstore', 'pylOware', 'shloutstore', 'cne', 'rinid', 'nf', 'amloutstore'].includes(this.curSingleDtl.warehouseOverseaType)) {
        this.getOverseaGcoutstoreAccount();
      }
    },
    // 添加VAT税率的数据
    AddVat () {
      let item = {
        taxNo: '',
        taxRate: 0,
        saleAccountId: null
      };
      this.vatDataList.push(item);
    },
    // 获取店铺税率列表数据
    GetTaxRateData (warehouseId) {
      this.axios.get(api.get_warehouseSaleAccountTax + warehouseId).then((res) => {
        if (res.data.code === 0) {
          this.vatDataList = res.data.datas;
        }
      }).catch(() => {
      });
    },
    // 获取店铺列表
    getEnabledSaleAccounts () {
      this.axios.get(api.get_EnabledSaleAccounts + '?merchantId=' + this.$store.state.erpConfig.userInfo.merchantId).then((response) => {
        if (response.data.code === 0) {
          this.saleAccountList = response.data.datas;
        }
      });
    },
    getSync (value) {
      if (value === 1) {
        this.getReferenceWarehouse();
      }
    },
    getByWarehouseId (warehouseId) {
      // 获取派送距离权重设置
      this.axios.get(api.wmsService + api.get_queryByWarehouseId + '?warehouseId=' + warehouseId + '&warehouseType=' + this.curSingleDtl.warehouseType).then((res) => {
        if (res.data.code === 0) {
          this.data3 = res.data.datas;
        }
      }).catch(() => {
      });
    },
    getAreaProgramId (wmsWarehouseAreaProgramId) {
      // table 邮编等
      this.isLoadingData3 = true;
      this.axios.get(api.wmsService + api.get_queryByWmsWarehouseAreaProgramId + '?wmsWarehouseAreaProgramId=' + wmsWarehouseAreaProgramId).then(res => {
        if (res.data.code === 0) {
          this.isLoadingData3 = false;
          this.data3 = res.data.datas;
        }
      }).catch(() => {
        this.isLoadingData3 = false;
      });
    },
    getAreaList () {
      this.axios.get(api.wmsService + api.get_AreaList).then(res => {
        if (res.data.code === 0) {
          this.areaList = res.data.datas;
        }
      });
    },
    saveAreaRelated () {
      let params = this.data3.map(i => {
        return {
          'warehouseId': this.curSingleDtl.warehouseId,
          'weight': i.weight,
          'wmsWarehouseAreaId': i.wmsWarehouseAreaId
        };
      });

      return new Promise(resolve => {
        if (params.length === 0) {
          resolve({
            code: 0
          });
          return;
        }
        this.axios.post(api.wmsService + api.save_wmsWarehouseAreaRelated, params).then(res => {
          resolve(res.data);
        });
      });
    },
    getShippingList (h) {
      let apiPath = this.newWareHouseParams.selectType === '0' || this.newWareHouseParams.selectType === '2' || this.newWareHouseParams.selectType === '3'
        ? api.queryForEnableCarriersExcludeWarehouse
        : api.get_enableCarriersApi;
      // queryForEnableCarriersExcludeWarehouse
      this.axios.get(api.wmsErpCommon + apiPath + '?warehouseId=' + this.curSingleDtl.warehouseId + '&isFilter=true').then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: data[i].carrierId,
              label: data[i].carrierName,
              children: [],
              loading: false,
              carrierAccounts: data[i].carrierAccounts
            });
            if (i === data.length - 1) {
              this.shippingMethodData = pos;
            }
          }
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('系统繁忙，请重新尝试');
        }
      });
    },
    loadData (item, callback) {
      item.loading = true;
      let apiPath = this.newWareHouseParams.selectType === '0' || this.newWareHouseParams.selectType === '2' || this.newWareHouseParams.selectType === '3'
        ? api.queryForEnableShipMethodsExcludeWarehouse
        : api.get_enableShippingMethodsApi;
      this.axios.get(api.carrierServiceCommon + apiPath + '?carrierId=' + item.value + '&warehouseId=' + this.curSingleDtl.warehouseId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          for (let i = 0; i < data.length; i++) {
            pos.push({
              value: [data[i].shippingMethodId, item.carrierAccounts],
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
            this.$Message.warning('没有相关记录');
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('系统繁忙，请重新尝试');
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
        this.$Message.error('系统繁忙，请重新尝试');
      });
    },
    gotoAccount () {
      if (this.$common.isEmpty(this.carrierAccount.accountUrl)) {
        this.$Message.error('系统繁忙，请重新尝试');
        return;
      }
      this.accountModel = true;
      window.open(this.carrierAccount.accountUrl, '_blank');
    },
    accountCallback () {
      this.getOverseaWarehouseAccount().then((data) => {
        if (data === 1) {
          this.accountModel = false;
        } else {
          this.$Message.error('授权失败，请重新尝试');
        }
      });
    },
    getOverseaWarehouseAccount () {
      // 获取万邑通授权
      return new Promise(resolve => {
        this.axios.get(api.get_overseaWarehouseAccount + '?carrierId=' + this.curSingleDtl.warehouseId).then(res => {
          if (res.data.code === 0) {
            this.carrierAccount.authStatus = res.data.datas.authStatus;
            res.data.datas.carrierParamList.forEach(i => {
              if (i.paramKey === 'token') {
                this.carrierAccount.token = i.paramValue;
              }
            });
            this.carrierAccount.account = res.data.datas.account;
            this.carrierAccount.accountUrl = res.data.datas.authInfo.authUrl;
            resolve(res.data.datas.authStatus);
          }
        })
      });
    },
    // 获取服务商信息
    getOverseaGcoutstoreAccount () {
      return new Promise((resolve) => {
        this.axios.get(api.get_overseaWarehouseAccount + '?carrierId=' + this.curSingleDtl.warehouseId).then(res => {
          if (res.data.code === 0) {
            this.editData = res.data.datas;
            const listKey = Object.keys(matchingKey);
            let listData = [];
            (res.data.datas.carrierParamList || []).forEach((item) => {
              if (listKey.includes(item.paramKey)) {
                listData.push({ ...item, paramKey: matchingKey[item.paramKey] });
                this.$set(this.newWareHouseParams, matchingKey[item.paramKey], item.paramValue);
                this.resetMatchingKey.push(matchingKey[item.paramKey]);
              } else {
                listData.push(item);
                this.$set(this.newWareHouseParams, item.paramKey, item.paramValue);
                this.resetMatchingKey.push(item.paramKey);
              }
            });
            if (this.$common.isEmpty(this.carrierParamList)) {
              this.carrierParamList = listData;
            }
            resolve(res.data.datas || []);
            return;
          }
          resolve([]);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    getEnableShippingMethods () {
      // 启用 有效方式物流方式 Table
      this.setColumns();
      const url = `${api.wmsErpCommon}${api.get_queryBindingShippingMethods}?warehouseId=${this.curSingleDtl.warehouseId}&warehouseType=${this.curSingleDtl.warehouseType}`;
      this.axios.get(url).then(res => {
        if (res.data.code === 0) {
          this.enableShippingMethodList = res.data.datas;
        }
      }).catch(() => {
      });
    },
    setColumns () {
      // 物流-根据物流商ID查询未启用邮寄方式
      let data = [
        {
          title: '物流商',
          align: 'center',
          key: 'carrierName'
        }, {
          title: '物流渠道',
          align: 'center',
          key: 'carrierShippingMethodName'
        }, {
          title: '运单号',
          align: 'center',
          render (h, params) {
            let text = params.row.hasTrackingNumber === 0 ? 'N' : 'Y';
            return h('span', text);
          }
        }, {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                disabled: (() => {
                  return this.isDisabled;
                })()
              },
              on: {
                'click': () => {
                  this.setShippingMethodDisable(params.row.shippingMethodId);
                }
              }
            }, '移除');
          }
        }
      ];
      if (this.curSingleDtl.selectType === '0') {
        this.columns2 = data;
      } else {
        data.splice(0, 1);
        this.columns2 = data;
      }
    },
    // 获取未启用的物流方式
    getAllShippingMethods () {
      this.setColumns();
      this.loading = true;
      this.axios.get(api.wmsErpCommon + api.get_queryForDisableShippingMethodsApi + '?carrierId=' + this.curSingleDtl.warehouseId).then(res => {
        this.loading = false;
        if (res.data.code === 0) {
          this.disableShippingMethodList = res.data.datas;
          if (this.disableShippingMethodList.length > 1) {
            this.disableShippingMethodList.unshift({
              systemShippingMethodId: 'all',
              carrierShippingMethodName: '全部'
            });
          }
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    changeShippingMethod (value) {

    },
    setShippingMethodEnable () {
      // 启动 物流方式
      if (!this.addShippingValue || this.addShippingValue.length === 0) {
        this.$Message.error('请选择物流方式');
        return;
      }
      let params;
      if (this.newWareHouseParams.selectType === '0' || this.newWareHouseParams.selectType === '2' || this.newWareHouseParams.selectType === '3') {
        params = {
          warehouseId: '',
          shippingMethodIds: ''
        };
        params.warehouseId = this.curSingleDtl.warehouseId;
        if (this.addShippingValue.length > 1) {
          params.shippingMethodIds = [this.addShippingValue[1][0]];
        }
      } else {
        params = {
          'carrierId': '',
          'shippingMethodEnableDetails': []
        };
        if (this.addShippingValue === 'all') {
          this.disableShippingMethodList.forEach(i => {
            params.carrierId = i.carrierId;
            if (i.systemShippingMethodId !== 'all') {
              params.shippingMethodEnableDetails.push({
                systemShippingMethodId: i.systemShippingMethodId
              });
            }
          });
        } else {
          this.disableShippingMethodList.forEach(i => {
            if (i.systemShippingMethodId === this.addShippingValue) {
              params.carrierId = i.carrierId;
              params.shippingMethodEnableDetails.push({
                systemShippingMethodId: i.systemShippingMethodId
              });
            }
          });
        }
      }
      let valid = false;
      this.enableShippingMethodList.forEach(i => {
        if (this.newWareHouseParams.selectType === '1') {
          if (i.systemShippingMethodId === this.addShippingValue) {
            valid = true;
          }
        } else {
          if (i.shippingMethodId === this.addShippingValue[1][0]) {
            valid = true;
          }
        }
      });
      if (valid) {
        this.$Message.error('该物流方式已添加');
        return;
      }
      let apiPath = this.newWareHouseParams.selectType === '0' || this.newWareHouseParams.selectType === '2' ||
      this.newWareHouseParams.selectType === '3'
        ? this.axios.post(api.wmsErpCommon + api.bindingShippingMethodWarehouse, params)
        : this.axios.put(api.set_carrierShippingMethodEnable, params);
      apiPath.then(res => {
        if (res.data.code === 0) {
          this.$Message.success('添加成功');
          this.getEnableShippingMethods();
          this.getShippingList();
          if (this.newWareHouseParams.selectType === '1') {
            this.getAllShippingMethods();
          }
        }
      });
    },
    setShippingMethodDisable (id) {
      // 物流-物流方式停用
      let apiPath = ['0', '2'].includes(this.newWareHouseParams.selectType) ? this.axios.post(api.unbindingShippingMethodWarehouse, {
        'shippingMethodIds': [id],
        'warehouseId': this.curSingleDtl.warehouseId
      }) : this.axios.put(api.set_carrierShippingMethodDisable + '?shippingMethodId=' + id);
      apiPath.then(res => {
        if (res.data.code === 0) {
          this.$Message.success('移除成功');
          this.getEnableShippingMethods();
          this.getShippingList();
          if (this.newWareHouseParams.selectType === '1') {
            this.getAllShippingMethods();
          }
        }
      });
    },
    // 必填验证
    requiredValidate (rule, value, callback) {
      if (this.$common.isEmpty(this.newWareHouseParams[rule.field])) {
        callback(new Error(this.$common.isEmpty(rule.msg) ? '必填项不能为空' : rule.msg));
        return;
      }
      callback();
    },
    // 选中开启仓库时
    warehouseChange (value) {
      const findItem = this.threeWarehouseList.find(f => {
        return f.warehouseId === value
      })
      this.$set(this.newWareHouseParams, 'apiWarehouseId', this.$common.isEmpty(value) ? null : value);
      if (!this.$common.isEmpty(findItem)) {
        this.$set(this.newWareHouseParams, 'apiWarehouseCode', findItem.warehouseCode);
        this.$set(this.newWareHouseParams, 'apiWarehouseName', findItem.warehouseName);
        return;
      }
      this.$set(this.newWareHouseParams, 'apiWarehouseCode', null);
      this.$set(this.newWareHouseParams, 'apiWarehouseName', null);
    },
    // 派送距离权重设置
    distanceChange () {

    },
    // 新增仓库， 获取动态的appkey 等动态参数
    GetCarrierCode (carrierCode, type) {
      return new Promise((resolve) => {
        // const isUpdate = type !== 'look';
        this.axios.get(api.get_carrierCode + carrierCode).then(res => {
          if (res.data.code === 0) {
            const listKey = Object.keys(matchingKey);
            let listData = [];
            (res.data.datas.carrierParamList || []).forEach((item) => {
              if (listKey.includes(item.paramKey)) {
                listData.push({ ...item, paramKey: matchingKey[item.paramKey] });
                this.$set(this.newWareHouseParams, matchingKey[item.paramKey], item.paramValue);
                this.resetMatchingKey.push(matchingKey[item.paramKey]);
              } else {
                listData.push(item);
                this.$set(this.newWareHouseParams, item.paramKey, item.paramValue);
                this.resetMatchingKey.push(item.paramKey);
              }
            });
            this.carrierParamList = listData;
            resolve(listData);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    choseThirdParth (index, options = {}) {
      if (this.isDisabled && options.type !== 'look') return;
      // 需要开启仓库的 carrierCode
      const carrierCodeList = ['gcoutstore', 'pylOware', 'shloutstore', 'cne', 'winitoutstore', 'rinid', 'fourpxoutstore', 'ocoutstore', 'nf', 'amloutstore'];
      this.carrierParamList = [];
      this.thirdCarrierList.forEach((i, n) => {
        if (n === index) {
          this.threeId = i.carrierCode;
          this.newWareHouseParams.carrierCode = i.carrierCode;
          this.newWareHouseParams.apiInterface = i.apiInterface;
          this.threeWarehouseList = [];
          if (!['thirdCarrier', 'AMAZON_FBA'].includes(i.carrierCode)) {
            this.getThreeWarehouses(this.threeId, options.apiWarehouseId).then(() => {
              options.callback && options.callback();
            });
          }
          if (carrierCodeList.includes(i.carrierCode)) {
            this.GetCarrierCode(i.carrierCode, options.type).then(() => {
              options.getData && options.getData();
            })
          }
          i.checked = true;
        } else {
          i.checked = false;
        }
      });
    },
    okModal () {

    },
    cancelModal () {

    },
    selectTypeChange (value) {
      this.threeId = '';
      if (value === '1') {
        this.getThirdCarriers();
        this.thridServiceChange();
      }
    },
    // 获取 开启仓库
    getThreeWarehouses (id, apiWarehouseId) {
      return new Promise(resolve => {
        this.axios.get(api.get_threeWarehouses + id + '/warehouses').then(res => {
          if (res.data.code === 0) {
            this.threeWarehousesChange(res.data.datas, apiWarehouseId);
            resolve();
          }
        }).catch(() => {
        });
      });
    },
    // 获取仓库
    getWareList (item, code) {
      this.axios.get(api.wmsService + api.get_OverseaWarehouses + '?oversaeWarehouseType=' + item + '&siteCode=' + code).then(res => {
        if (res.data.code === 0) {
          this.warehouseList = res.data.datas;
          // this.getOverSeaTableData({warehouseId: this.warehouseList[0].warehouseId});
        }
      });
    },
    // 验证对应字段
    validateFormField (form, fields, strBox) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(form)) return resolve(true);
        fields.forEach(key => {
          if (!this.$common.isEmpty(strBox)) {
            form.$el.querySelector(`${strBox} .${key}`) && form.validateField(key);
          }
        })
        this.$nextTick(() => {
          if (this.$common.isEmpty(form.$el)) return resolve(true);
          const errorDemo = form.$el.querySelector(`${strBox || ''} .ivu-form-item-error`);
          resolve(this.$common.isEmpty(errorDemo));
        })
      })
    },
    // 开启仓库列表改变时
    threeWarehousesChange (list = [], apiWarehouseId) {
      this.threeWarehouseList = list || [];
      // this.warehouseId = this.$common.isEmpty(apiWarehouseId) ? this.$common.isEmpty(list) ? '' : list[0].warehouseId : apiWarehouseId;
      this.warehouseId = this.$common.isEmpty(apiWarehouseId) ? '' : apiWarehouseId;
      this.warehouseChange(this.warehouseId);
    },
    // 切换第三方服务商
    thridServiceChange (item) {
      // 获取亚马逊店铺
      this.getAmazonStore();
      // let id = this.thirdServiceList.find(val => {
      //   return val.code === item;
      // }).warehouseId;
      // 获取表格数据
      // this.getOverSeaTableData({warehouseId: id});
    },
    getAmazonStore () {
      this.axios.post(api.wmsErpCommon + api.get_amazonStore, {
        merchantId: this.$store.state.erpConfig.userInfo.merchantId
      }).then(res => {
        if (res.data.code === 0) {
          this.amazonStore = res.data.datas;
          if (!this.selectedStoreName && this.curSingleDtl && this.curSingleDtl.overseaAccountId) {
            res.data.datas.forEach((n, i) => {
              if (this.curSingleDtl.overseaAccountId === n.amazonAccountId) {
                this.selectedStoreName = n.siteCountry;
              }
            });
          }
        }
      });
    },
    getThirdCarriers () {
      return new Promise(resolve => {
        this.axios.get(api.wmsErpCommon + api.get_ThirdCarriers).then(res => {
          if (res.data.code === 0) {
            (res.data.datas || []).forEach(i => {
              if (this.$common.isEmpty(this.curSingleDtl) || this.$common.isEmpty(this.curSingleDtl.warehouseOverseaType)) {
                i.checked = false;
              } else {
                i.checked = i.carrierCode === this.curSingleDtl.warehouseOverseaType;
              }
              logoList.map((item) => {
                if (i.carrierCode === item.carrierCode) {
                  i.logo = item.url;
                }
              });
            });
            this.thirdCarrierList = res.data.datas;
            resolve(this.thirdCarrierList);
          }
        }).catch(() => {
          resolve([]);
        });
      });
    }, // 获取第三方服务商
    getThridServiceList () {
      this.axios.get(api.wmsService + api.get_OverseaWarehousesType).then(res => {
        if (res.data.code === 0) {
          this.thirdServiceList = res.data.datas;
        }
      });
    },
    getOverSeaWareList () {

    }, // 店铺切换
    storeChange (item) {
      let obj = this.amazonStore.find(val => {
        return val.amazonAccountId === item.value;
      }); // 站点
      this.selectedStoreName = obj.siteCountry;
      // this.getWareList(this.newWareHouseParams.thirdServiceProvider, obj.siteCode); // 仓库
    },
    getOverSeaTableData (params) {
      this.axios.post(api.get_OWarehouseShippingMethods, params).then(res => {

      });
    },
    paramsObj () {
      const matchList = Object.entries(matchingKey);
      const matchKey = matchList.map(m => m[0]);
      const matchVal = matchList.map(m => m[1]);
      let carrierParamList = this.$common.copy(this.carrierParamList || []);
      let newWareHouseParams = this.$common.copy(this.newWareHouseParams);
      if (carrierParamList.length > 0) {
        carrierParamList.forEach((item) => {
          item.paramValue = newWareHouseParams[item.paramKey];
          delete newWareHouseParams[item.paramKey];
          if (matchVal.includes(item.paramKey)) {
            item.paramKey = matchKey[matchVal.indexOf(item.paramKey)];
          }
        });
      }
      let obj = {
        ...newWareHouseParams,
        warehouseStatus: newWareHouseParams.selectStatus,
        warehouseType: newWareHouseParams.selectType,
        countryCnName: newWareHouseParams.country,
        stateCnName: newWareHouseParams.province,
        cityCnName: newWareHouseParams.city,
        linkMan: newWareHouseParams.userName,
        mobilePhone: newWareHouseParams.mobile,
        warehouseOverseaType: newWareHouseParams.carrierCode,
        carrierParamList: carrierParamList,
        taxes: this.vatDataList
      };
      if (this.warehouseModalStatus !== 'add') {
        obj.warehouseId = this.wareId // 编辑仓库标记
      }
      return obj;
    },
    getCreateParams (name) {
      var obj = this.paramsObj();
      let arr = obj.taxes;
      if (arr.length > 0) {
        for (let i = 0; i < arr.length - 1; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].saleAccountId === arr[j].saleAccountId) {
              this.$Message.error('适用店铺的名称不能重复！');
              return;
            }
          }
        }
      }
      this.$refs[name].validate((valid) => {
        if (valid) {
          let params = {
            warehouseCode: obj.warehouseCode,
            warehouseName: obj.warehouseName
          };
          if (obj.warehouseType === '1' && obj.carrierCode === '') {
            this.$Message.error('请选择第三方服务商');
            return;
          }
          //  + '?warehouseCode=' + obj.warehouseCode + '&warehouseName=' + obj.warehouseName
          this.$Spin.show();
          this.axios.post(api.wmsService + api.check_warehouse, params).then(response => {
            if (response.data.code === 0) {
              if (response.data.datas) {
                this.$emit('createFail');
                this.$Message.error('仓库代码或者仓库名称已存在！');
              } else {
                if (this.newWareHouseParams.selectType === '1') {
                  obj.overseaAccountId = this.newWareHouseParams.store;
                }
                // 云仓
                if (this.newWareHouseParams.selectType === '2') {
                  obj.isYms = 1;
                  obj.warehouseType = '0';
                }
                // 直发仓
                if (this.newWareHouseParams.selectType === '5') {
                  obj.warehouseType = '5';
                }
                this.axios.post(api.wmsService + api.addWareSetData, obj).then(res => {
                  this.$Spin.hide();
                  if (res.data.code === 0) {
                    this.$emit('createSuccess');
                    this.$Message.success('新增仓库成功！');
                  } else {
                    this.$emit('createFail');
                    this.$Message.warning('新增仓库失败！');
                  }
                }).catch(() => {
                  this.$Spin.hide();
                });
              }
            } else {
              this.$Spin.hide();
            }
          }).catch(() => {
            this.$Spin.hide();
          });
        } else {
          this.$Message.warning('新增仓库失败！');
        }
      });
    },
    getEditParams (name, isTips) {
      var obj = this.paramsObj();
      if (this.newWareHouseParams.selectType === '1') {
        obj.overseaAccountId = this.newWareHouseParams.store;
      }
      // 云仓
      if (this.newWareHouseParams.selectType === '2') {
        obj.isYms = 1;
        obj.warehouseType = '0';
      }
      if (this.isLoadingData3) {
        // 分区加载中 不让提交
        this.$Message.error('分区方案距离权重未加载完成');
      }

      let params = this.data3.map(i => {
        return {
          'warehouseId': this.curSingleDtl.warehouseId,
          'weight': i.weight,
          'wmsWarehouseAreaId': i.wmsWarehouseAreaId
        };
      });
      obj.relateds = params || [];

      return new Promise((resolve, reject) => {
        let arr = obj.taxes;
        if (arr.length > 0) {
          for (let i = 0; i < arr.length - 1; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              if (arr[i].saleAccountId === arr[j].saleAccountId) {
                this.$Message.error('适用店铺的名称不能重复！');
                return;
              }
            }
          }
        }
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Spin.show();
            this.axios.post(api.wmsService + api.wareSetWatchDtl, obj).then(res => {
              this.$Spin.hide();
              if (res.data.code === 0) {
                (this.$common.isEmpty(isTips) || isTips) && this.$Message.success('编辑仓库成功！');
                this.$emit('editSuccess');
                resolve(true);
              } else {
                this.$emit('editFail');
                (this.$common.isEmpty(isTips) || isTips) && this.$Message.warning('编辑仓库失败！');
                reject(new Error('编辑仓库失败！'));
              }
            }).catch(() => {
              this.$Spin.hide();
              reject(new Error('编辑仓库失败！'));
            });
          } else {
            (this.$common.isEmpty(isTips) || isTips) && this.$Message.warning('编辑仓库失败！');
            reject(new Error('编辑仓库失败！'));
          }
        });
      });
    },
    handleReset (name) {
      this.vatDataList = [];
      this.$nextTick(() => {
        this.$refs[name].resetFields();
      })
    },
    // 新增仓库
    addNewWareHouse () {
      this.getCreateParams('newWareHouseParams');
    },
    // 编辑仓库
    editOrWatchWareHouse () {
      this.getEditParams('newWareHouseParams', false).then(res => {
        if (res) {
          if (this.newWareHouseParams.selectType === '1') {
            this.saveAreaRelated().then(res => {
              if (res.code === 0) {
                this.$Message.success('编辑仓库成功' + '！');
              }
            });
          } else {
            this.$Message.success('编辑仓库成功' + '！');
          }
        }
      });
    }, // 重置表单
    resetNewWareHouse () {
      this.handleReset('newWareHouseParams');
    },
    // 电话号码校验
    validateTelphone () {
      var validateTelphone = function (rule, value, callback) {
        var re = this.$regular.isPhone;
        var result = [];
        result = value.match(re);
        if (value !== '') {
          if (!!result === false) {
            callback(new Error('不是有效的固定电话或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateTelphone;
    },
    // 手机号码校验
    validateMobile () {
      var validateMobile = function (rule, value, callback) {
        var re = this.$regular.isMob;
        var result = [];
        result = value.match(re);
        if (value !== '') {
          if (!!result === false) {
            callback(new Error('不是有效的手机号码或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    // 邮箱格式校验
    validateEmail (rule, value, callback) {
      const re = this.$regular.isMailbox;
      if (!this.$common.isEmpty(value)) {
        if (re.test(value)) {
          callback(new Error('不是有效的邮箱或者邮箱格式不正确'));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    // 邮政编码校验
    validateZipCode () {
      var validateZipCode = function (rule, value, callback) {
        var re = this.$regular.postalCode;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('不是有效的邮政编码或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateZipCode;
    },
    validateChar () { // 过滤特殊字符
      var validateZipCode = function (rule, value, callback) {
        let re = this.$regular.specialCharacters;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('只能使用中文，大小写字母，数字，下划线'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateZipCode;
    },
    changeSelect (val) {
      if (val) {
        if (!this.thirdServiceList.length) {
          this.getThridServiceList();
        }
      }
    },
    getReferenceWarehouse () { // 获取同步仓库
      this.axios.get(api.wmsService + api.get_syncWarehouse).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.syncWarehouseList = data;
        }
      });
    }
  },
  computed: {
    isDisabled () {
      return this.warehouseModalStatus === 'look';
    },
  }
};
</script>
<style lang='less' scoped>
.form-reset-label {
  margin-left: -130px;
  float: left;
  // display: inline-block;
  text-align: right;
  width: 120px;
}
.typeBox {
  display: inline-block;
  margin: 5px 0 0 5px;
  padding: 5px;
  vertical-align: top;
  .type-img-box{
    position: relative;
    margin: 0 auto;
    height: 64px;
    width: 64px;
    text-align: center;
    img {
      position: absolute;
      left: 50%;
      top: 50%;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transform: translate(-50%, -50%);
    }
  }
}
.wid {
  width: 300px;
}

.vat_box {
  position: relative;

  .add_vat {
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 25px;
    color: #2d8cf0;
    cursor: pointer;
    z-index: 100;
  }
}
.redDot{
  margin: 0 0 15px 0;
}
</style>
