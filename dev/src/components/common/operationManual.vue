<template>
  <div>
    <Modal v-model="model" width="800" title="新建手工单" @on-visible-change="visible">
      <Form :label-width="120" ref="formInline" :model="submitParameters" class="__noSetFormLabel">
        <!-- <FormItem label="订单号" class="mt10" prop="salesRecordNumber" :rules="{required: true, message: '站点不能为空', trigger: 'change'}">
          <span>{{ submitParameters.salesRecordNumber }}</span>
          <Input v-model.trim="submitParameters.salesRecordNumber" style="width:260px" />
          <Checkbox class="ml20" v-model="submitParameters.suspended"></Checkbox>
          需人工审核<span class="redColor">（不勾选仓库将直接生成出库单）</span>
        </FormItem> -->
        <Row>
          <Col span="12">
          <FormItem label="订单号" class="mt10" prop="salesRecordNumber"
            :rules="{ required: true, message: '订单号不能为空', trigger: 'blur' }">
            <Input v-model.trim="submitParameters.salesRecordNumber" />
          </FormItem>
          </Col>

          <Col span="12">
          <FormItem class="mt10" :label-width="40">
            <Checkbox v-model="submitParameters.suspended"></Checkbox>
            需人工审核<span class="redColor">（不勾选仓库将直接生成出库单）</span>
          </FormItem>
          </Col>

        </Row>

        <Alert class="text-align-center">订单信息</Alert>
        <Row>
          <Col span="12" v-if="shipmentPlatformList.length > 0">
          <FormItem label="站点" prop="webstoreItemSite"
            :rules="{ required: true, message: '站点不能为空', trigger: 'change' }">
            <dyt-select v-model="submitParameters.webstoreItemSite">
              <Option v-for="(item, index) in shipmentPlatformList" :key="index" :value="item.salesPlatformSiteId">{{
                  item.cnName
              }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
          <Col span="12">
          <FormItem label="账号" prop="saleAccountId" :rules="{ required: true, message: '账号不能为空', trigger: 'change' }">
            <dyt-select v-model="submitParameters.saleAccountId">
              <Option v-for="(item, index) in saleAccountList" :key="index" :value="item.saleAccountId">{{
                  item.accountCode
              }}</Option>
            </dyt-select>
          </FormItem>
          </Col>
        </Row>
        <div class="tit-header"><span class="sp">买家信息</span></div>
        <Row>
          <Col span="12">
          <FormItem label="买家ID" prop="buyerAccountId"
            :rules="{ required: true, message: '买家ID不能为空', trigger: 'blur' }">
            <Input v-model.trim="submitParameters.buyerAccountId" :maxlength="50" />
          </FormItem>
          </Col>
          <Col span="12">
          <FormItem label="买家Email" prop="buyerEmail">
            <Input v-model.trim="submitParameters.buyerEmail" :maxlength="50" />
          </FormItem>
          </Col>
        </Row>
        <div class="tit-header"><span class="sp">付款信息</span></div>
        <FormItem label="付款状态">
          <RadioGroup v-model="payStatus" @on-change="changePayStatus">
            <Radio label='0' :disabled="!getPermission('order_edit_handOrder_payStatus')">未付款
            </Radio>
            <Radio label='1' :disabled="!getPermission('order_edit_handOrder_payStatus')">已付款
            </Radio>
          </RadioGroup>
        </FormItem>

        <div>
          <Form-item v-show="payStatus === '1'" label="付款方式" prop="paymentMethodName"
            :rules="{ required: true, validator: validatePayMethod, message: '' + '付款方式' + '' + '不能为空' + '', trigger: 'blur' }">
            <Input :maxlength="50" v-model.trim="submitParameters.paymentMethodName" />
          </Form-item>
          <FormItem label="订单总金额" prop="totalPrice"
            :rules="{ required: true, validator: validateTotalPrice, message: '订单总金额不能为空', trigger: 'blur' }">
            <Input v-model.trim="submitParameters.totalPrice" :maxlength="13" class="ipt-wid" @on-blur="blurNumber">
            <dyt-select v-model="submitParameters.totalPriceCurrency" slot="append" style="width: 160px"
              placeholder="请选择币种">
              <Option v-for="(item, index) in currencyList" :key="index" :value="item.value">{{ item.label }}</Option>
            </dyt-select> </Input>
          </FormItem>
          <div v-if="payStatus === '1'">
            <Form-item label="交易相关链接">
              <Input v-model="submitParameters.transactionUrl" :maxlength="100" />
            </Form-item>
            <Row>
              <Col :span="12">
              <Form-item label="付款方交易号" prop="webstoreTransactionId">
                <Input :maxlength="50" v-model.trim="submitParameters.webstoreTransactionId"></Input>
              </Form-item>
              </Col>
              <Col :span="12">
              <Form-item label="成交费比例：" prop="transactionPriceRatio">
                <Input :maxlength="50" v-model.trim="submitParameters.transactionPriceRatio">
                <span slot="append">%</span> </Input>
              </Form-item>
              </Col>
            </Row>
            <Form-item label="备注" prop="paymentNote">
              <Input :maxlength="50" v-model.trim="submitParameters.paymentNote" type="textarea" :rows="4"></Input>
            </Form-item>
          </div>

        </div>
        <!--商品-->
        <div class="tit-header"><span class="sp redDot">商品信息</span>
          <Button size="small" class="ml10" @click="openProduct('product')">添加商品 </Button>
        </div>
        <Table highlight-row border max-height="500" :columns="columns2" :data="submitParameters.productGoods">
        </Table>
        <div class="tit-header"><span class="sp">收货地址</span></div>
        <FormItem label="Buyer Full Name" prop="buyerName"
          :rules="{ required: true, message: 'Buyer Full Name不能为空', trigger: 'blur' }">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerName" />
        </FormItem>
        <FormItem label="Address1" prop="buyerAddress1"
          :rules="{ required: true, message: 'Address1不能为空', trigger: 'blur' }">
          <Input :maxlength="100" v-model.trim="submitParameters.buyerAddress1" />
        </FormItem>
        <FormItem label="Address2" prop="buyerAddress2">
          <Input :maxlength="100" v-model.trim="submitParameters.buyerAddress2" />
        </FormItem>
        <FormItem label="city" prop="buyerCity" :rules="{ required: true, message: 'city不能为空', trigger: 'blur' }">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerCity" />
        </FormItem>
        <FormItem label="State/Province" prop="buyerState"
          :rules="{ required: true, message: 'State/Province不能为空', trigger: 'blur' }">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerState" />
        </FormItem>
        <FormItem label="Phone Number" prop="buyerPhone"
          :rules="{ required: true, message: 'Phone Number不能为空', trigger: 'blur' }">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerPhone" />
        </FormItem>
        <FormItem label="Mobile Number">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerMobile" />
        </FormItem>
        <FormItem label="Zip/Postal Code" prop="buyerPostalCode"
          :rules="{ required: true, message: 'Zip/Postal Code不能为空', trigger: 'blur' }">
          <Input :maxlength="50" v-model.trim="submitParameters.buyerPostalCode" />
        </FormItem>
        <FormItem label="Country/Region" prop="buyerCountryCode"
          :rules="{ required: true, message: 'Country/Region不能为空', trigger: 'change' }">
          <dyt-select ref="countryRegion" v-model="submitParameters.buyerCountryCode" filterable
            placeholder="请选择或输入所在地">
            <Option v-for="item in formValidate.country" :key="item.countryId" :value="item.twoCode" :v="item.cnName">{{
                item.enName
            }}</Option>
          </dyt-select>
        </FormItem>
        <!--订单留言-->
        <div v-if="inGroup !== 'amazon'">
          <div class="tit-header"><span class="sp">订单留言</span></div>
          <Input :maxlength="500" v-model.trim="submitParameters.remark" type="textarea" :rows="4" />
        </div>
        <!--发货信息-->
        <div style="padding: 26px 100px" v-if="payStatus === '1'">
          <Button @click="addOrderShipping" type="info" long>
            <Icon type="ios-add-circle" />
            添加发货信息
          </Button>
        </div>

        <div v-for="(item, index) in submitParameters.orderShippings" v-if="submitParameters.orderShippings.length > 0"
          :key="index">
          <Alert class="text-align-center">发货信息({{ index + 1 }})
            <Icon class="ship-close" size="16" type="ios-close-circle" @click="deleteShip(index)" />
          </Alert>
          <div class="tit-header"><span class="sp">商品信息</span>
            <Button size="small" class="ml10" @click="openProduct(index)">添加商品 </Button>
          </div>
          <Table highlight-row border max-height="500" :columns="columns1" :data="item.orderShippingDetails"
            @click.native="addProductIndex = index">
          </Table>
          <div class="tit-header"><span class="sp">收货地址</span></div>
          <FormItem label="Buyer Full Name" :prop="'orderShippings.' + index + '.buyerName'"
            :rules="{ required: true, message: 'Buyer Full Name不能为空', trigger: 'blur' }">
            <Input :maxlength="50" v-model.trim="item.buyerName" />
          </FormItem>
          <FormItem label="Address1" :prop="'orderShippings.' + index + '.buyerAddress1'"
            :rules="{ required: true, message: 'Address1不能为空', trigger: 'blur' }">
            <Input :maxlength="100" v-model.trim="item.buyerAddress1" />
          </FormItem>
          <FormItem label="Address2">
            <Input :maxlength="100" v-model.trim="item.buyerAddress2" />
          </FormItem>
          <FormItem label="city" :prop="'orderShippings.' + index + '.buyerCity'"
            :rules="{ required: true, message: 'city不能为空', trigger: 'blur' }">
            <Input v-model.trim="item.buyerCity" />
          </FormItem>
          <FormItem label="State/Province" :prop="'orderShippings.' + index + '.buyerState'"
            :rules="{ required: true, message: 'State/Province不能为空', trigger: 'blur' }">
            <Input :maxlength="50" v-model.trim="item.buyerState" />
          </FormItem>
          <FormItem label="Phone Number" :prop="'orderShippings.' + index + '.buyerPhone'"
            :rules="{ required: true, message: 'Phone Number不能为空', trigger: 'blur' }">
            <Input :maxlength="50" v-model.trim="item.buyerPhone" />
          </FormItem>
          <FormItem label="Mobile Number">
            <Input :maxlength="50" v-model.trim="item.buyerMobile" />
          </FormItem>
          <FormItem label="Zip/Postal Code" :prop="'orderShippings.' + index + '.buyerPostalCode'"
            :rules="{ required: true, message: 'Zip/Postal Code不能为空', trigger: 'blur' }">
            <Input :maxlength="50" v-model.trim="item.buyerPostalCode" />
          </FormItem>
          <FormItem label="Country/Region" :prop="'orderShippings.' + index + '.buyerCountryCode'"
            :rules="{ required: true, message: 'Country/Region不能为空', trigger: 'change' }">
            <dyt-select v-model.trim="item.buyerCountryCode" filterable placeholder="请选择或输入所在地">
              <Option v-for="citem in formValidate.country" :key="citem.countryId" :value="citem.twoCode"
                :v="citem.cnName">{{ citem.enName }}</Option>
            </dyt-select>
          </FormItem>
          <div class="tit-header"><span class="sp">仓库及物流方式</span></div>
          <Row>
            <Form-item
              label="请选择仓库"
              :label-width="120"
              :prop="'orderShippings.' + index + '.shippingMethod.warehouseId'"
              :rules="{ required: true, message: '请选择仓库不能为空', trigger: 'change' }"
            >
              <dyt-select style="width:210px" v-model="item.shippingMethod.warehouseId" @on-change="warehouseIdChange($event,index)">
                <Option v-for="(item, index) in allStorelist" :key="index" :value="item.warehouseId">{{item.warehouseName}}</Option>
              </dyt-select>
            </Form-item>
          </Row>
          <Row>
            <Col :span="12">
            <Form-item
              label="实际发货物流方式"
              :label-width="120"
              :prop="'orderShippings.' + index + '.shippingMethod.shipValue'"
              :rules="{ type: 'array', required: true, message: '实际发货物流方式不能为空', trigger: 'change' }"
            >
              <!-- <dyt-select style="display: none" v-model="item.shippingMethod.merchantCarrierId"></dyt-select> -->
              <Cascader
                :data="shippingMethodData"
                @on-visible-change="showShippingDataApi(item.shippingMethod.warehouseId, index)"
                v-model="item.shippingMethod.shipValue"
                :load-data="loadDataApi"
                @on-change="getAccountApi"
                transfer
                :disabled="$common.isEmpty(item.shippingMethod.warehouseId)"
                :placeholder="`请选择${$common.isEmpty(item.shippingMethod.warehouseId) ? '仓库后再实际发货物流方式' : '实际发货物流方式'}`"
              />
            </Form-item>
            </Col>
            <Col :span="12">
            <Form-item
              label="帐号"
              :label-width="100"
              :prop="'orderShippings.' + index + '.shippingMethod.carrierAccountId'"
              :rules="{ required: true, message: '帐号不能为空', trigger: 'change' }"
              v-if="!isPmsList[index]"
            >
              <dyt-select
                v-model="item.shippingMethod.carrierAccountId"
                :disabled="$common.isEmpty(item.shippingMethod.shipValue)"
                :placeholder="`请选择${$common.isEmpty(item.shippingMethod.shipValue) ? '实际发货物流方式后再选择账号' : '帐号'}`"
                :show-disabled-placeholder="true"
              >
                <Option
                  v-for="(item, index) in carrierAccount"
                  v-if="item.carrierAccountId !== null"
                  :key="`accountId-${index}`"
                  :value="item.carrierAccountId"
                >{{ item.account }}</Option>
              </dyt-select>
            </Form-item>
            </Col>
          </Row>
          <div class="matchLogisticSetting">
            <h6>物流相关设置</h6>
          </div>
          <Row class="mt10">
            {{ item.shippingMethod.carrierBaseSetting }}
            <Col :span="12" v-for="(item1, index1) in item.shippingMethod.packageCarrierParam" :key="index1">
              <Form-item v-if="item1.paramType === 'hide'" v-show="false" :label="item1.paramName" :label-width="100">
                <span>{{ item1.paramValue }}</span>
              </Form-item>
              <Form-item v-else :label="item1.paramName" :label-width="100">
                <Radio-group v-model="item1.paramValue" v-if="item1.paramType === 'radio'">
                  <Radio :label="sItem.itemValue" v-for="(sItem, n) in item1.dictionarys" :key="n">
                    <span>{{ sItem.itemName }}</span>
                  </Radio>
                </Radio-group>
                <Input v-if="item1.paramType == 'input'" v-model.trim="item1.paramValue"></Input>
                <Checkbox-group v-model="item1.paramValue" v-if="item1.paramType == 'checkbox'">
                  <Checkbox v-for="(sItem, n) in item1.dictionarys" :key="n" :label="sItem.itemValue">
                    <span>{{ sItem.itemName }}</span>
                  </Checkbox>
                </Checkbox-group>
                <dyt-select v-if="item1.paramType === 'select'" v-model="item1.paramValue">
                  <Option v-for="(sItem, n) in item1.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName }}
                  </Option>
                </dyt-select>
                <span v-if="item1.paramType === 'readOnly'">{{ item1.paramValue }}</span>
              </Form-item>
            </Col>
          </Row>
        </div>
      </Form>
      <div slot="footer">
        <Button @click="save" type="primary">保存 </Button>
        <Button @click="model = false">取消</Button>
      </div>
    </Modal>
    <matchingGoodsModal :noPerson="true" @saveHandel="saveHandel" :choseData="choseData" ref="matchingGoodsModal">
    </matchingGoodsModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import publicServiceMixin from '@/components/mixin/publicService_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';

export default {
  name: 'operationManual',
  mixins: [Mixin, publicServiceMixin],
  components: {
    matchingGoodsModal
  },
  data() {
    return {
      shipmentPlatformList: [],
      saleAccountList: [],
      choseData: [],
      apiInterfaceStatus: '',
      allStorelist: [],
      shippingMethodData: [],
      value2: [], // 物流[[mcarrierID, carrierAccounts],[merchantShippingMethodId]]
      carrierBaseSetting: [], // 物流参数配置
      isPmsList: [],
      addProductIndex: 0,
      model: false, // warehouseList: [],
      // carrierList: [],
      // shippingMethodList: [],
      submitParameters: {
        paymentMethodName: '',
        webstoreTransactionId: '',
        transactionPriceRatio: '',
        'paymentNote': '', // 支付留言
        'buyerAccountId': '', // 买家ID
        'buyerAddress1': '', // 买家地址 buyerAddress1
        'buyerAddress2': '', // 买家地址 buyerAddress2
        'buyerCity': '', //  买家的城市
        'buyerCountryCode': '', // 买家国家编码
        'buyerEmail': '', // 买家email
        'buyerName': '', // 收货人名称
        'buyerPhone': '', // 电话
        'buyerMobile': '', // 电话
        'buyerPostalCode': '', // 邮编
        'buyerState': '', // 买家州/省
        'orderShippings': [ // 订单发货信息
          /* {
           'buyerAddress1': '', // 买家地址 buyerAddress1
           'buyerAddress2': '', // 买家地址 buyerAddress2 ,
           'buyerCity': '', // 买家的城市
           'buyerCountryCode': '', // 买家国家编码
           'buyerName': '', // 收货人名称
           'buyerPhone': '', // 电话
           'buyerPostalCode': '', // 邮编
           'buyerState': '', // 买家州/省 ,
           'orderShippingDetails': [],
           'shippingMethod': {
           'carrierAccountId': '', // 物流商帐号Id
           'merchantCarrierId': '', // 承运人顺序号,指定物流方式时必传 ,
           'merchantShippingMethodId': '', // 邮寄方式顺序号,指定物流方式时必传 ,
           'orderShippingId': '', // 发货信息Id
           'packageCarrierParam': [ // 物流设置参数集合
           {
           'paramKey': '', // 物流参数key
           'paramValue': '' // 物流参数value
           }
           ],
           'warehouseId': '' // 仓库流水号
           }
           } */
        ],
        'pay': 0, // 是否已支付 false 未付款 true 已付款 ,
        'platformId': this.inGroup, // 订单来源
        'productGoods': [],
        'remark': '', // 订单备注
        'saleAccountId': '', //  帐号店铺流水号
        'salesRecordNumber': '', //  订单号
        'suspended': false, //  是否截留 false 不截留 true 截留
        'totalPrice': 0, // 总金额(商品金额+运费+保费) ,
        'totalPriceCurrency': 'CNY', // 总金额币种
        'transactionUrl': '', // 交易相关链接
        'webstoreItemSite': '' //  站点
      },
      payStatus: '0',
      columns: [
        {
          title: '图片',
          key: 'productPic',
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'productPic');
          }
        }, {
          title: 'SPU',
          align: 'center',
          key: 'spu'
        }, {
          title: 'SKU',
          align: 'center',
          key: 'sku'
        }, {
          title: '中文描述/英文描述',
          key: 'cnName',
          align: 'center',
          resizable: true,
          width: 150,
          render(h, params) {
            return h('div', {}, [
              h('p', params.row.cnName), h('p', params.row.enName)
            ]);
          }
        }
      ]
    };
  },
  created() {
    this.getCurrencyInfo();
    this.getAllstore(0, 3);
  },
  props: {},
  watch: {},
  computed: {
    columns1() {
      let v = this;
      return [
        ...v.columns, {
          title: '数量',
          key: 'quantity',
          render(h, params) {
            return h('Input', {
              props: {
                size: 'small',
                value: params.row.quantity/*,
                 min: 1,
                 max: 999999 */
              },
              style: {
                width: '80px'
              },
              on: {
                'on-blur': val => {
                  let number = parseInt(val.target.value);
                  number = isNaN(number) ? 0 : number;
                  v.$set(v.submitParameters.orderShippings[v.addProductIndex].orderShippingDetails[params.index], 'quantity', number);
                }
              }
            });
          }
        }, {
          title: '操作',
          key: 'operation',
          render(h, params) {
            return h('Button', {
              on: {
                'click'() {
                  v.$nextTick(() => {
                    v.submitParameters.orderShippings[params.row.sIndex].orderShippingDetails.splice(params.index, 1);
                  });
                }
              }
            }, '删除');
          }
        }
      ];
    },
    columns2() {
      let v = this;
      return [
        ...v.columns, {
          title: '数量',
          key: 'quantity',
          width: 120,
          align: 'center',
          render(h, params) {
            return h('Input', {
              props: {
                size: 'small',
                value: params.row.quantity/*,
                 min: 1,
                 max: 999999 */
              },
              style: {
                width: '80px'
              },
              on: {
                'on-blur': val => {
                  let number = parseInt(val.target.value);
                  number = isNaN(number) ? 0 : number;
                  v.$set(v.submitParameters.productGoods[params.index], 'quantity', number);
                }
              }
            });
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          render(h, params) {
            return h('Button', {
              on: {
                'click'() {
                  v.submitParameters.productGoods.splice(params.index, 1);
                }
              }
            }, '删除');
          }
        }
      ];
    }
  },
  methods: {
    changePayStatus() {
      if (this.payStatus === '0') {
        this.submitParameters.orderShippings = [];
      }
    },
    blurNumber(value) {
      let val = Number(value.target.value);
      if (isNaN(val) || val <= 0) {
        this.submitParameters.totalPrice = 0;
      } else {
        this.submitParameters.totalPrice = val.toFixed(3);
      }
    },
    reset() {
      this.submitParameters = {
        paymentMethodName: '',
        webstoreTransactionId: '',
        transactionPriceRatio: '',
        'paymentNote': '', // 支付留言
        'buyerAccountId': '', // 买家ID
        'buyerAddress1': '', // 买家地址 buyerAddress1
        'buyerAddress2': '', // 买家地址 buyerAddress2
        'buyerCity': '', //  买家的城市
        'buyerCountryCode': '', // 买家国家编码
        'buyerEmail': '', // 买家email
        'buyerName': '', // 收货人名称
        'buyerPhone': '', // 电话
        'buyerMobile': '', // 电话
        'buyerPostalCode': '', // 邮编
        'buyerState': '', // 买家州/省
        'orderShippings': [ // 订单发货信息
          /* {
           'buyerAddress1': '', // 买家地址 buyerAddress1
           'buyerAddress2': '', // 买家地址 buyerAddress2 ,
           'buyerCity': '', // 买家的城市
           'buyerCountryCode': '', // 买家国家编码
           'buyerName': '', // 收货人名称
           'buyerPhone': '', // 电话
           'buyerPostalCode': '', // 邮编
           'buyerState': '', // 买家州/省 ,
           'orderShippingDetails': [],
           'shippingMethod': {
           'carrierAccountId': '', // 物流商帐号Id
           'merchantCarrierId': '', // 承运人顺序号,指定物流方式时必传 ,
           'merchantShippingMethodId': '', // 邮寄方式顺序号,指定物流方式时必传 ,
           'orderShippingId': '', // 发货信息Id
           'packageCarrierParam': [ // 物流设置参数集合
           {
           'paramKey': '', // 物流参数key
           'paramValue': '' // 物流参数value
           }
           ],
           'warehouseId': '' // 仓库流水号
           }
           } */
        ],
        'pay': 0, // 是否已支付 false 未付款 true 已付款 ,
        'platformId': this.inGroup, // 订单来源
        'productGoods': [],
        'remark': '', // 订单备注
        'saleAccountId': '', //  帐号店铺流水号
        'salesRecordNumber': '', //  订单号
        'suspended': false, //  是否截留 false 不截留 true 截留
        'totalPrice': 0, // 总金额(商品金额+运费+保费) ,
        'totalPriceCurrency': 'CNY', // 总金额币种
        'transactionUrl': '', // 交易相关链接
        'webstoreItemSite': '' //  站点
      };
    },
    // 获取对应平台名字
    getPlatformName() {
      this.axios.post(api.get_platformIdToName, [this.inGroup]).then(response => {
        if (response.data && response.data.code === 0) {
          this.shipmentPlatformList = response.data.datas[0].sites;
        }
      });
    },
    // 获取账号（不明白，楼上已经能拿到账号了，还要筛选平台拿对应账号）
    getQueryEnablePlatform(type) {
      this.getEnablePlatform().then(data => {
        this.saleAccountList = data.filter(i => {
          if (i.platformId === this.inGroup) {
            return i;
          }
        })[0].saleAccounts;
      });
    },
    // 获取相对应权限的账号
    getAccountList() {
      let prefix = '/order-service/erpCommon';
      let subsystemCode = 'order-service';
      this.axios.post(prefix + api.get_querySaleAccounts, {
        'platformIds': [this.inGroup],
        'subsystemCode': subsystemCode
      }).then(({ data }) => {
        this.saleAccountList = data.datas || [];
      });
    },
    visible(open) {
      if (open) {
        // this.submitParameters.salesRecordNumber = 'M' + this.format('yyyyMMddhhmmssS');
        this.getCountrys();
        this.getPlatformName();
        // this.getQueryEnablePlatform();
        this.getAccountList();
        this.payStatus = '0';
        this.$refs.countryRegion.reset();
      }
    },
    validateTotalPrice(rule, value, callback) {
      if (value === '' || value === null || value === 0) {
        callback(new Error('订单总金额不能为空'));
      } else {
        callback();
      }
    },
    validatePayMethod(rule, value, callback) {
      if (this.payStatus === '1' && (value === '' || value === null)) {
        callback(new Error('付款方式' + '不能为空'));
      } else {
        callback();
      }
    },
    validatepayMethodNo(rule, value, callback) {
      if (this.payStatus === '1' && (value === '' || value === null)) {
        callback(new Error('付款方交易号' + '不能为空'));
      } else {
        callback();
      }
    },
    validateFreeRate(rule, value, callback) {
      if (this.payStatus === '1' && (value === '' || value === null)) {
        callback(new Error('成交费比例：' + '不能为空'));
      } else {
        callback();
      }
    },
    validatepaymentNote(rule, value, callback) {
      if (this.payStatus === '1' && (value === '' || value === null)) {
        callback(new Error('成交费比例：' + '不能为空'));
      } else {
        callback();
      }
    },
    deleteShip(index) {
      this.submitParameters.orderShippings.splice(index, 1);
      this.submitParameters.orderShippings.forEach((i, ind) => {
        i.orderShippingDetails.forEach(j => {
          j.sIndex = ind;
        });
      });
    },
    addOrderShipping() {
      if (this.submitParameters.productGoods.length === 0) {
        this.$Message.error('请先添加商品');
        return;
      }
      let len = this.submitParameters.orderShippings.length;
      let productGoods = this.submitParameters.productGoods.map(i => {
        i.sIndex = len;
        return i;
      });
      let data = {
        sIndex: len,
        'buyerAddress1': this.submitParameters.buyerAddress1, // 买家地址 buyerAddress1
        'buyerAddress2': this.submitParameters.buyerAddress2, // 买家地址 buyerAddress2 ,
        'buyerCity': this.submitParameters.buyerCity, // 买家的城市
        'buyerCountryCode': this.submitParameters.buyerCountryCode, // 买家国家编码
        'buyerName': this.submitParameters.buyerName, // 收货人名称
        'buyerPhone': this.submitParameters.buyerPhone, // 电话
        'buyerMobile': this.submitParameters.buyerMobile, // 电话
        'buyerPostalCode': this.submitParameters.buyerPostalCode, // 邮编
        'buyerState': this.submitParameters.buyerState, // 买家州/省 ,
        'orderShippingDetails': productGoods,
        'shippingMethod': {
          'shipValue': [], // 只是用来存
          'carrierAccountId': '', // 物流商帐号Id
          'merchantCarrierId': '', // 承运人顺序号,指定物流方式时必传 ,
          'merchantShippingMethodId': '', // 邮寄方式顺序号,指定物流方式时必传 ,
          // 'orderShippingId': '', // 发货信息Id
          'packageCarrierParam': [],
          'warehouseId': '' // 仓库流水号
        }
      };
      this.submitParameters.orderShippings.push(this.$common.copy(data));
    },
    save() {
      this.$refs.formInline.validate((valid) => {
        if (valid) {
          if (this.submitParameters.productGoods.length === 0) {
            this.$Message.error('未添加商品');
            return;
          }
          if (this.payStatus === '1' && this.submitParameters.orderShippings.length === 0) {
            this.$Message.error('请填写发货信息');
            return;
          }
          if (this.inGroup === 'amazon') {
            this.submitParameters.remark = null;
          }
          this.submitParameters.pay = this.payStatus === '1';
          this.axios.post(api.get_createHandOrder, this.submitParameters).then(res => {
            if (res.data && res.data.code === 0) {
              this.model = false;
              this.$Message.success('添加成功');
              this.$emit('getList');
            } else {
              this.$Message.error('添加失败');
            }
          });
        }
      });
    },
    showShippingDataApi(val, index) {
      if (val) {
        this.addProductIndex = index;
        let wareList = this.allStorelist.filter(i => {
          return i.warehouseId === val;
        });
        let warehouseType = wareList[0] && wareList[0].warehouseType;
        this.axios.get(`${api.erpServiceCommon}${api.get_enableCarriersApi}?warehouseId=${val}&isFilter=true&warehouseType=${warehouseType}`).then(response => {
          if (response.data && response.data.code === 0) {
            this.shippingMethodData = (response.data.datas || []).map(item => {
              return {
                ...item,
                value: item.carrierId,
                label: item.carrierName,
                children: [],
                loading: false
              }
            });
          }
        });
      }
    },
    loadDataApi(item, callback) {
      item.loading = true;
      this.axios.get(`${api.erpServiceCommon}${api.get_enableShippingMethodsApi}?carrierId=${item.value}&warehouseId=${this.selectStore}`).then(response => {
        if (response.data && response.data.code === 0) {
          item.children = (response.data.datas || []).map(m => {
            return {
              ...m,
              value: [m.shippingMethodId, item.carrierAccounts],
              label: m.carrierShippingMethodName
            }
          })
          item.loading = false;
          if (!response.data.datas || response.data.datas.length === 0) {
            this.$Message.warning('没有相关记录');
          }
          callback();
        } else {
          item.loading = false;
          item.children = [];
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
      });
    },
    // 选择仓库改变时
    warehouseIdChange (val, index) {
      // 仓库改变时清空对应值
      if (this.submitParameters.orderShippings[index] && this.submitParameters.orderShippings[index].shippingMethod) {
        this.$set(this.submitParameters.orderShippings[index].shippingMethod, 'shipValue', []);
        this.$set(this.submitParameters.orderShippings[index].shippingMethod, 'carrierAccountId', '');
        this.$set(this.submitParameters.orderShippings[index].shippingMethod, 'packageCarrierParam', []);
      }
    },
    getAccountApi(value, selectedData) {
      this.carrierAccount = [];
      const pmsInfo = (selectedData || []).find(fin => {
        return [0, '0'].includes(fin.isPms);
      });
      // 是否 pms
      this.isPmsList[this.addProductIndex] = !this.$common.isEmpty(pmsInfo);
      // 每次修改 实际发货物流方式时清空对应值
      this.$set(this.submitParameters.orderShippings[this.addProductIndex].shippingMethod, 'carrierAccountId', '');
      this.$set(this.submitParameters.orderShippings[this.addProductIndex].shippingMethod, 'packageCarrierParam', []);

      if (value.length === 0) return false;
      this.shippingMethodModel = [];
      this.shippingAccountModel = [];
      this.apiInterfaceStatus = selectedData[0].apiInterface; // 存一下这个字段，当它为速卖通线上发货(API_AE_LG),eDIS物流(API_EDIS)的时候，不显示账号
      if (selectedData[0].apiInterface !== 'API_AE_LG') {
        this.$set(this.submitParameters.orderShippings[this.addProductIndex].shippingMethod, 'merchantCarrierId', value[0]);
        this.$set(this.submitParameters.orderShippings[this.addProductIndex].shippingMethod, 'merchantShippingMethodId', value[1][0]);
        this.getCarrierBaseSettingApi(value[1][0]);
        if (value[1][1] !== null) {
          this.carrierAccount = value[1][1];
        }
      }
    },
    getCarrierBaseSettingApi(shippingMethodId, model) {
      this.carrierBaseSetting = [];
      this.axios.get(api.get_shippingMethodParamsApi + '?shippingMethodId=' + shippingMethodId + '&time=' + new Date().getTime() + Math.random() * 100).then(response => {
        if (response.data && response.data.code === 0) {
          let data = response.data.datas || [];
          this.$set(this.submitParameters.orderShippings[this.addProductIndex].shippingMethod, 'packageCarrierParam', data);
        }
      });
    },
    openProduct(index) {
      this.addProductIndex = index; // 给第几个添加
      if (index === 'product') {
        // 已选择
        this.choseData = this.submitParameters.productGoods ? this.submitParameters.productGoods : [];
      } else {
        this.choseData = this.submitParameters.orderShippings[this.addProductIndex].orderShippingDetails
          ? this.submitParameters.orderShippings[this.addProductIndex].orderShippingDetails
          : [];
      }
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    saveHandel(data) {
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
      let data1 = JSON.parse(JSON.stringify(data));
      if (this.addProductIndex !== 'product') {
        data1.forEach(i => {
          i.sIndex = this.addProductIndex;
        });
        this.$set(this.submitParameters.orderShippings[this.addProductIndex], 'orderShippingDetails', data1);
      } else {
        this.$set(this.submitParameters, 'productGoods', data1);
      }
    }
  }
};
</script>

<style scoped>
.text-align-center {
  text-align: center;
}

.tit-header {
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 15px;
}

.tit-header .sp {
  font-size: 14px;
  font-weight: bold;
  line-height: 23px;
  display: inline-block;
  vertical-align: middle;
}

.wid300 {
  width: 300px;
}

.ipt-wid {
  width: 60%;
}

.ship-close {
  position: absolute;
  right: 5px;
  top: 7px;
  cursor: pointer;
}

.ship-close:hover {
  color: red;
}
</style>
