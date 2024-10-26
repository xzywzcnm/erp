<template >
  <div>
    <Row :gutter="10">
      <Col :span="15">
      <div class="normalPaddingRight normalTop">
        <div class="modalItem">
          <div class="modalItemHeader">
            <h6>已选条件</h6>
          </div>
          <div class="modalItemContent">
            <template>
              <!-- 买家曾给过我差评 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C009')) >= 0">
                <span class="itemPaddingRight">买家曾给过我差评</span>
              </div>
              <!-- 买家曾经有过退款记录 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C011')) >= 0">
                <span class="itemPaddingRight">买家曾经有过退款记录</span>
              </div>
              <!-- 买买家账号为指定买家账号 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C002')) >= 0">
                <span class="itemPaddingRight">买家账号为</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['C002'].buyerAccountIds" @click="addItem('buyerAccountIds', 'C002')" :title="componentsModel['C002'].buyerAccountIds.join('或')">
                  {{
                    componentsModel['C002'].buyerAccountIds.length > 0
                    ? componentsModel['C002'].buyerAccountIds.join('或')
                    : '指定买家帐号'
                  }}
                </span>
              </div>
              <!-- 订单货品包含指定货品 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C007')) >= 0">
                <span class="itemPaddingRight">订单货品包含</span> <span class="blueColor itemPaddingRight cursor countryCodesName" @click="addItem('skus', 'C007')" :title="componentsModel['C007'].skus.join('或') ">
                  {{ componentsModel['C007'].skus.length > 0 ? componentsModel['C007'].skus.join('或') : '指定货品' }}
                </span>
              </div>
              <!-- 买家选择的运输类型为指定类型 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C013')) >= 0">
                <span class="itemPaddingRight">买家选择的运输类型为</span> <span class="blueColor itemPaddingRight">
                  <Poptip @on-popper-show="addItem('shipmentTypes', 'C013')" transfer width="700" placement="bottom">
                    <span class="blueColor cursor">
                      {{
                          componentsModel['C013'].shipmentTypes.length > 0
                          ? componentsModel['C013'].shipmentTypes.join('或')
                          : '指定类型'
                        }}
                    </span>
                    <div slot="content" class="keywordString">
                      <div>
                        已选取：
                      </div>
                      <div class="breakWord">
                        <Tag closable v-for="(item, index) in componentsModel['C013'].shipmentTypes" :key="index" @on-close="delTag(index)">{{ item }}</Tag>
                      </div>
                      <div class="divider normalTop"></div>
                      <div class="platformSelect normalTop">
                        <dyt-select :disabled="showStatus" v-model="shipmentPlatformModel" style="width:150px" @on-change="getSite" placeholder="请选择平台">
                          <Option v-for="item in shipmentPlatformList" :key="item.platformId" :value="item.platformId">{{ item.name }}</Option>
                        </dyt-select>
                        <dyt-select :disabled="showStatus" v-model="shipmentPlatformSite" v-if="hasSite" style="width:150px; margin-left:10px" @on-change="setSite">
                          <Option v-for="item in shipmentPlatformSiteList" :key="item.siteId" :value="item.siteId">{{ item.cnName }}</Option>
                        </dyt-select>
                      </div>
                      <div class="normalTop">
                        <Input :disabled="showStatus" v-model.trim="shipmentSearchValue" style="width:310px" @on-enter="shipmentSearch" placeholder="请输入运输类型名称搜索"></Input>
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
              <!-- 买家曾经有过补发货记录 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C012')) >= 0">
                <span class="itemPaddingRight">买家曾经有过补发货记录</span>
              </div>
              <!-- 订单货品属于指定分类 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C008')) >= 0">
                <span class="itemPaddingRight">订单货品属于</span> <span v-if="!componentsStatus['C008'].productCategories" class="blueColor itemPaddingRight cursor countryCodesName" @click="addItem('productCategories', 'C008')" :title="componentsModel['C008'].productCategories.join('或') ">
                  {{
                    componentsModel['C008'].productCategories.length > 0
                    ? componentsModel['C008'].productCategories.join('或')
                    : '指定分类'
                  }}
                </span> <dyt-select :disabled="showStatus" v-if="componentsStatus['C008'].productCategories" v-model="componentsModel['C008'].productCategories" style="width:200px" multiple>
                  <Option v-for="item in productCategoryList" :key="item.productCategoryId" :value="item.productCategoryId">{{ item.cnName }}</Option>
                </dyt-select>
              </div>
              <!-- 买家曾经发起过纠纷 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C010')) >= 0">
                <span class="itemPaddingRight">买家曾经发起过纠纷</span>
              </div>
              <!-- eBay账号为指定eBay账号 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C001')) >= 0">
                <span class="itemPaddingRight">eBay账号为</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['C001'].saleAccountIds" @click="addItem('saleAccountIds', 'C001')">
                  {{ source.saleAccountIds.length > 0 ? source.saleAccountIds.join('或') : '指定eBay帐号' }}
                </span> <dyt-select v-if="componentsStatus['C001'].saleAccountIds" multiple v-model="componentsModel['C001'].saleAccountIds" filterable style="width: 200px">
                  <Option v-for="(item, index) in shopList" :key="index" :value="item.saleAccountId">{{ item.accountCode }}</Option>
                </dyt-select>
              </div>
              <!-- 买家国家为指定国家 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C006')) >= 0">
                <span class="itemPaddingRight">买家国家为</span> <span v-if="!componentsStatus['C006'].countryCodes" class="blueColor itemPaddingRight cursor countryCodesName" @click="addItem('countryCodes', 'C006')">
                  {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
                </span>
                <treeSelect v-if="componentsStatus['C006'].countryCodes" :treeData="countryData" ref="treeDataRef" v-model="countryCodes" filterable @on-change="getTreeData" style="width:200px" show-checkbox></treeSelect>
              </div>
              <!-- 买家开头为指定字符串 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C003')) >= 0">
                <span class="itemPaddingRight">买家开头为</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['C003'].buyerAccountIdsC3" @click="addItem('buyerAccountIdsC3', 'C003')" :title="componentsModel['C003'].buyerAccountIdsC3.join('或')">
                  {{
                    componentsModel['C003'].buyerAccountIdsC3.length > 0
                    ? componentsModel['C003'].buyerAccountIdsC3.join('或')
                    : '指定字符串'
                  }}
                </span>
              </div>
              <!-- 消息标题包含消息标题包含关键字 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C005')) >= 0">
                <span class="itemPaddingRight">消息标题包含</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['C005'].keys" @click="addItem('keys', 'C005')" :title="componentsModel['C005'].keys.join('或')">
                  {{ componentsModel['C005'].keys.length > 0 ? componentsModel['C005'].keys.join('或') : '消息标题包含关键字' }}
                </span>
              </div>
              <!-- 消息内容包含消息内容包含关键字 -->
              <div class="flexBox uniformlyspacedPadding" v-if="rulesModel.indexOf(getRuleCode('C004')) >= 0">
                <span class="itemPaddingRight">消息内容包含</span> <span class="blueColor itemPaddingRight cursor" v-if="!componentsStatus['C004'].keysC4" @click="addItem('keysC4', 'C004')" :title="componentsModel['C004'].keysC4.join('或') ">
                  {{
                    componentsModel['C004'].keysC4.length > 0 ? componentsModel['C004'].keysC4.join('或') : '消息内容包含关键字'
                  }}
                </span>
              </div>
            </template>
          </div>
        </div>
        <div class="modalItem normalTop">
          <div class="modalItemHeader">
            <h6>设定动作</h6>
          </div>
          <div class="modalItemContent">
            <template v-if="ruleParmas !== null">
              <div class="normalPadding">
                <Form ref="actionParams" :model="actionParams" :rules="actionRule" :lable-width="80" label-position="left">
                  <Row>
                    <Col span="20">
                    <FormItem label="规则名称：" prop="ruleName">
                      <Input :disabled="showStatus" v-model.trim="actionParams.ruleName" style="width:300px"></Input>
                    </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span="1">
                    <Checkbox :disabled="showStatus" v-model="actionParams.setPriorityStatus"></Checkbox>
                    </Col>
                    <Col span="20">
                    <FormItem label="指定优先级：" prop="setPriority">
                      <dyt-select :disabled="showStatus" v-model="actionParams.setPriority" style="width:200px">
                        <Option v-for="(item, index) in rulePriorityList" :key="index" :value="item.messagePriorityId">{{ item.priorityName }}</Option>
                      </dyt-select>
                    </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span="1">
                    <Checkbox :disabled="showStatus" v-model="actionParams.setUserStatus"></Checkbox>
                    </Col>
                    <Col span="20">
                    <FormItem label="分派到用户：" prop="setUser">
                      <dyt-select :disabled="showStatus" v-model="actionParams.setUser" style="width:200px">
                        <Option v-for="(item, index) in ruleAccountList" :key="index" :value="item.userId">{{ item.userName }}</Option>
                      </dyt-select>
                    </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span="1">
                    <Checkbox :disabled="showStatus" v-model="actionParams.setFolderStatus"></Checkbox>
                    </Col>
                    <Col span="20">
                    <FormItem label="分派到ebay消息文件夹：" prop="setFolder">
                      <dyt-select :disabled="showStatus" v-model="actionParams.setFolder" style="width:200px">
                        <Option v-for="(item, index) in ruleFolderList" :key="index" :value="item.folderId">{{ item.folderName }}</Option>
                      </dyt-select>
                    </FormItem>
                    </Col>
                  </Row>
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
                  <!-- <div v-if="((index >  0 && item.group !== rules[index - 1].group ) || index === 0) && item.group !== null" class="groupTitle">
                      {{item.groupDescription}}
                    </div> -->
                  <Checkbox :disabled="showStatus" :key="item.uid" :label="item.uid">
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
    <div class="ruleButtons flexBox flexEnd normal">
      <Button class="normalRMargin" size="large" @click="closeRuleModal">取消 </Button>
      <Button type="primary" class="saveButton" size="large" :loading="loading" @click="saveButton">保存 </Button>
    </div>
    <!-- 添加买家账号，指定字符串，关键字 -->
    <Modal v-model="addTagListModal" v-if="addTagListModalStatus" width="600" :mask-closable="false" :title="addtagTit" @on-ok="addOk" @on-cancel="addCancel">
      <div>
        {{ addTagTitle }} <Input style="width:220px;" clearable v-model.trim="tagName"></Input>
        <Button style="marginLeft:10px;" type="primary" @click="addTagList">增加 </Button>
      </div>
      <Divider />
      <div>
        <div>{{ addTagedTitle }}</div>
        <Tag style="margin:5px;" closable v-for="(item, index) in tagList" :key="index" @on-close="delTagListModal(index)">{{ item }}
        </Tag>
      </div>
    </Modal>
    <!-- 指定货品 -->
    <!-- <matchingGoodsModal ref="matchingGoodsModal" @editData="editData"></matchingGoodsModal>-->
    <matchingGoodsModal ref="matchingGoodsModal" :showNumber="false" :prefix="'/setting-service'" :choseData="addProductValue" @saveHandel="addProductSave"></matchingGoodsModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';

export default {
  mixins: [Mixin, orderSys],
  components: {
    matchingGoodsModal
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
      addTagTitle: '',
      addTagedTitle: '',
      addProductValue: [],
      showStatus: true, // 查看时不可编辑
      autoRuleId: null,
      rules: null,
      ruleItems: null,
      componentsModel: {
        'C009': { // 买家曾给过我差评
          hasNegative: ''
        },
        'C011': { // 买家曾经有过退款记录
          hasRefund: ''
        },
        'C002': { // 买买家账号为指定买家账号
          buyerAccountIds: []
        },
        'C007': { // 订单货品包含指定货品
          skus: []
        },
        'C013': { // 指定运输类型
          shipmentTypes: []
        },
        'C012': { // 买家曾经有过补发货记录
          hasReplenishmentDelivery: ''
        },
        'C008': { // 指定分类
          productCategories: []
        },
        'C010': { // 买家曾经发起过纠纷
          hasDispute: ''
        },
        'C001': { // 指定eBay账号
          saleAccountIds: []
        },
        'C006': { // 指定国家
          countryCodes: []
        },
        'C003': { // 指定字符串
          buyerAccountIdsC3: []
        },
        'C005': { // 消息标题包含关键字
          keys: []
        },
        'C004': { // 消息内容包含关键字
          keysC4: []
        }
      },
      componentsStatus: {
        'C001': { // 指定eBay账号
          saleAccountIds: false
        },
        'C002': { // 指定买家账号
          buyerAccountIds: false
        },
        'C013': { // 指定运输类型
          shipmentTypes: false
        },
        'C006': { // 指定国家
          countryCodes: false
        },
        'C003': { // 指定字符串
          buyerAccountIdsC3: false
        },
        'C005': { // 指定消息标题
          keys: false
        },
        'C004': { // 指定消息内容
          keysC4: false
        },
        'C008': { // 指定分类
          productCategories: false
        },
        'C007': { // 指定货品
          skus: false
        },
        'C009': { // 买家曾给过我差评
          hasNegative: false
        },
        'C011': { // 买家曾经有过退款记录
          hasRefund: false
        },
        'C012': { // 买家曾经有过补发货记录
          hasReplenishmentDelivery: false
        },
        'C010': { // 买家曾经发起过纠纷
          hasDispute: false
        }
      },
      source: {
        saleAccountIds: []
      },
      shipmentCheckBoxModel: [], // shipmentTypes: [],
      treeArr: [],
      countryCodesName: '',
      autoRuleItems: [],
      rulesModel: [], // 右侧勾选状态
      actionParams: {
        ruleName: null,
        ruleNameStatus: false,
        setUser: null,
        setUserStatus: false,
        setPriority: null,
        setPriorityStatus: false,
        setFolder: null,
        setFolderStatus: false
      },
      actionRule: {
        ruleName: [
          {
            validator: noEmpty,
            trigger: 'blur'
          }
        ]
      },
      countryData: [],
      countryCodes: [],
      shipmentPlatformModel: '',
      shipmentPlatformSite: '',
      shipmentPlatformSiteList: [],
      shipmentPlatformList: [],
      shipmentSearchValue: null,
      hasSite: false,
      smShippingMethodList: [],
      loading: false,
      addTagListModal: false, // 添加tag模态(买家账号，字符串，关键字)
      addTagListModalStatus: false,
      addtagTit: null,
      addTagType: null, // 区分模态操作
      productCategoryList: [],
      tagName: null,
      tagList: [],
      shippingMethodName: '',
      ruleAccountList: [], // 分派用户下拉列表
      rulePriorityList: [], // 优先级
      ruleFolderList: [] // 文件夹
    };
  },
  props: {
    ruleParmas: {
      type: Object,
      default: null
    },
    timestamp: {
      type: Number,
      default: 0
    }
  },
  watch: {
    timestamp (n, o) {
      this.resetRuleData();
      this.getRuleDetails();
      this.getPriority();
      this.getEbayFolder();
      this.getUserlist();
    }
  },
  methods: {
    addProductSave (data) {
      if (data.length > 0) {
        this.componentsStatus['C007'].skus = false;
        this.componentsModel['C007'].skus = data.map(i => {
          return i.sku;
        });
      }
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
    },
    closeRuleModal () { // 取消
      let v = this;
      v.$emit('closeModal', 0);
    },
    saveButton () { // 保存
      let v = this;
      if (v.showStatus) { // 查看不调接口
        v.$emit('closeModal', 0);
      } else {
        v.handleSubmit().then(result => {
          if (!v.actionParams.ruleName) {
            v.$Message.error('规则名不能为空');
            v.loading = false;
            return false;
          }
          let obj = {
            autoRuleId: v.autoRuleId,
            name: v.actionParams.ruleName,
            autoRuleItems: result[1],
            status: v.actionParams.status
          };
          let pos = [];
          if (v.actionParams.setFolderStatus) {
            pos.push({
              type: 'setFolder',
              value: v.actionParams.setFolder
            });
          }
          if (v.actionParams.setUserStatus) {
            pos.push({
              type: 'setUser',
              value: v.actionParams.setUser
            });
          }
          if (v.actionParams.setPriorityStatus) {
            pos.push({
              type: 'setPriority',
              value: v.actionParams.setPriority
            });
          }
          let postType = '';
          let url = '';
          if (v.ruleParmas.type !== 0) { // 0 edit 1 add
            obj.status = 1;
            postType = 'post';
            url = api.add_ebayAutoRule;
          } else {
            postType = 'put';
            url = api.edit_ebayAutoRule;
          }
          if (pos.length) {
            obj.autoRuleActions = pos;
          } else {
            v.$Message.error('指定优先级、分派到用户、分派到eBay消息文件夹三个选择项请至少选择一个！');
            v.loading = false;
            return false;
          }
          v.loading = true;
          v.axios[postType](url, obj).then(response => {
            v.loading = false;
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.loading = false;
              v.$emit('closeModal', 1);
            }
          }).catch(() => {
            v.loading = false;
          });
        });
      }
    },
    getRuleDetails () {
      let v = this;
      const type = v.ruleParmas.type;
      if (type === 2) { // 查看
        v.showStatus = true;
      } else {
        v.showStatus = false;
      }
      v.autoRuleId = v.ruleParmas.autoRuleId;
      v.$nextTick(function () {
        v.actionParams.ruleName = v.ruleParmas.name;
        v.actionParams.status = Number(v.ruleParmas.status);
      });
      v.axios.get(api.get_ebayAutoRuleDetail + v.autoRuleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;

          async function processingData () {
            const rulesResult = await v.setRulesGroup(type, data.rules);// 可选条件分组
            if (rulesResult) {
              if (data.ruleItems !== null && data.ruleItems.length > 0) {
                v.ruleItems = data.ruleItems;
                v.processingRulesItemData(data.ruleItems);
              }
            }
          }

          v.processingActions(data.ruleActions);
          processingData();
        }
      });
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
    getRuleCode (ruleCode, type) {
      let mapObj = {
        'C009': 'C009', // 买家曾经给过我差评
        'C011': 'C011', // 买家曾经有过退款记录
        'C002': 'C002', // 指定买家账号
        'C007': 'C007', // 指定货品
        'C013': 'C013', // 指定运输类型
        'C012': 'C012', // 买家曾经有过补发货记录
        'C008': 'C008', // 指定分类
        'C010': 'C010', // 买家曾经发起过纠纷
        'C001': 'C001', // 指定eBay账号
        'C006': 'C006', // 指定国家
        'C003': 'C003', // 指定字符串
        'C005': 'C005', // 消息标题包含关键字
        'C004': 'C004' // 消息内容包含关键字
      };
      if (!type) {
        return mapObj[ruleCode];
      }
    },
    processingRulesItemData (data) { // 加载时处理已选条件
      let v = this;
      // let sitesArr = [];
      // let accountArr = [];
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
                if (bItem.name === oItem.name) { // 循环已保存规则并插入
                  if (rc === 'C009' || rc === 'C010' || rc === 'C011' || rc === 'C012') { // 如果是单选
                    subObj.value = bItem.value;
                  } else { // 如果是多选
                    if (subObj.hasOwnProperty('ruleItemParamValues')) {
                      subObj.autoRuleParamValues.push(bItem.ruleItemParamValues);
                    } else {
                      subObj.autoRuleParamValues = bItem.ruleItemParamValues;
                    }
                  }
                }
                if (rc === 'C001') {
                  if (bItem.name === 'saleAccountIds' && oItem.name === 'saleAccountIds') {
                    let obj = {
                      platformIds: ['ebay'],
                      saleAccountIds: bItem.ruleItemParamValues.map(i => {
                        return i.value;
                      })
                    };
                    v.componentsModel[rc][bItem.name] = bItem.ruleItemParamValues.map(i => {
                      return i.value;
                    });
                    v.getSalesAccountName(obj).then(res => {
                      let arr = [];
                      let arrIds = [];
                      res.forEach((n, i) => {
                        arr.push(n.accountCode);
                        arrIds.push(n.saleAccountId);
                      });
                      v.source[bItem.name].push(...arr);
                    });
                  }
                } else if (rc === 'C013') {
                  if (bItem.name === 'shipmentTypes' && oItem.name === 'shipmentTypes') {
                    let val = bItem.ruleItemParamValues;
                    let arr = [];
                    let tagArr = [];
                    val.forEach((n, i) => {
                      arr.push(n.value);
                      let pre = n.value.split(':')[0];
                      let des = n.value.split(':')[1];
                      tagArr.push(pre + ':' + des);
                    });
                    v.shipmentCheckBoxModel = arr;
                    v.componentsModel['C013'].shipmentTypes = tagArr;
                  }
                } else if (rc === 'C006') {
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
                } else if (rc === 'C002') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'buyerAccountIds') {
                      pos.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = pos;
                    }
                  }
                } else if (rc === 'C003') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'buyerAccountIds') {
                      pos.push(childItem.value);
                      v.componentsModel[rc]['buyerAccountIdsC3'] = pos;
                    }
                  }
                } else if (rc === 'C005') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'keys') {
                      pos.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = pos;
                    }
                  }
                } else if (rc === 'C004') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'keys') {
                      pos.push(childItem.value);
                      v.componentsModel[rc]['keysC4'] = pos;
                    }
                  }
                } else if (rc === 'C008') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'productCategories') {
                      pos.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = pos;
                    }
                  }
                  v.getProductCategory().then(result => {
                    if (result) {
                      v.componentsStatus[rc][bItem.name] = true;
                    }
                  });
                } else if (rc === 'C007') {
                  let pos = [];
                  for (let c = 0; c < bItem.ruleItemParamValues.length; c++) {
                    let childItem = bItem.ruleItemParamValues[c];
                    if (bItem.name === 'skus') {
                      pos.push(childItem.value);
                      v.componentsModel[rc][bItem.name] = pos;
                    }
                  }
                } else {
                  v.componentsStatus[rc][bItem.name] = true;
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
              expand: true,
              children: []
            }
          ];
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
              zoneCode: n.zoneCode,
              children: []
            };
            if (n.countries.length > 1) {
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
                  zoneCode: n.zoneCode + '.' + m.twoCode,
                  children: []
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
          v.$nextTick(function () {
            v.countryData = arr;
            resolve(true);
          });
        }
      });
    },
    getTreeData (val) {
      let v = this;
      let nodesArr = v.$refs['treeDataRef'].getCheckedNodes();
      let arr = [];
      nodesArr.forEach((n, i) => {
        if (n.hasOwnProperty('zoneCode')) {
          arr.push(n.zoneCode);
        }
      });
      v.componentsModel['C006'].countryCodes = arr;
    },
    setSite (val) {
      this.getSmShippingMethod(this.shipmentPlatformModel, val);
    },
    processingActions (ruleActions) { // 处理动作
      let v = this;
      if (ruleActions !== null && ruleActions.length > 0) {
        for (let i = 0; i < ruleActions.length; i++) {
          let action = ruleActions[i];
          if (action.type === 'setFolder') {
            v.actionParams.setFolder = action.value;
            v.actionParams.setFolderStatus = true;
          } else if (action.type === 'setUser') {
            v.actionParams.setUser = action.value;
            v.actionParams.setUserStatus = true;
          } else if (action.type === 'setPriority') {
            v.actionParams.setPriority = action.value;
            v.actionParams.setPriorityStatus = true;
          }
        }
      }
    },
    addItem (name, code) { // getAPIData
      let v = this;
      if (v.showStatus) { // 查看状态不可编辑
        return false;
      }
      if (name === 'warehouseIds') {
        v.componentsStatus[code][name] = true;
        v.getAllstore(0, 1); // 获取仓库列表
      } else if (name === 'platformIds') {
        v.componentsStatus[code][name] = true;
        if (v.shipmentPlatformList.length === 0) {
          v.getShipment();
        }
      } else if (name === 'saleAccountIds') {
        v.getShopList(); // 获取ebay店铺
        v.componentsStatus[code][name] = true;
      } else if (name === 'productCategories') {
        v.getProductCategory().then(result => {
          if (result) {
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'countryCodes') {
        v.componentsStatus[code][name] = true;
        v.getCommonCountry(v.treeArr);
      } else if (name === 'shipmentTypes') {
        v.componentsStatus[code][name] = true;
        v.getShipment();
      } else if (name === 'buyerAccountIds') {
        v.componentsStatus[code][name] = true;
        v.addTagType = 'buyerAccountIds';
        v.addtagTit = '添加指定买家账号';
        v.addTagTitle = '买家账号' + '：';
        v.addTagedTitle = '您已添加的买家账号' + '：';
        v.addTagListModal = true;
        v.addTagListModalStatus = true;
        v.tagList = v.componentsModel[code].buyerAccountIds;
      } else if (name === 'buyerAccountIdsC3') {
        v.componentsStatus[code][name] = true;
        v.addTagType = 'buyerAccountIdsC3';
        v.addtagTit = '添加指定字符串';
        v.addTagTitle = '买家账号开头字符串' + '：';
        v.addTagedTitle = '您已添加的指定买家账号开头字符串' + '：';
        v.addTagListModal = true;
        v.addTagListModalStatus = true;
        v.tagList = v.componentsModel['C003'].buyerAccountIdsC3;
      } else if (name === 'keys') {
        v.componentsStatus[code][name] = true;
        v.addTagType = 'keys';
        v.addtagTit = '添加消息标题包含的关键字';
        v.addTagTitle = '关键字：';
        v.addTagedTitle = '您已添加的关键字：';
        v.addTagListModal = true;
        v.addTagListModalStatus = true;
        v.tagList = v.componentsModel['C005'].keys;
      } else if (name === 'keysC4') {
        v.componentsStatus[code][name] = true;
        v.addTagType = 'keysC4';
        v.addtagTit = '添加消息内容包含的关键字';
        v.addTagTitle = '关键字：';
        v.addTagedTitle = '您已添加的关键字：';
        v.addTagListModal = true;
        v.addTagListModalStatus = true;
        v.tagList = v.componentsModel['C004'].keysC4;
      } else if (name === 'productCategories') {
        v.getProductCategory().then(result => {
          if (result) {
            v.componentsStatus[code][name] = true;
          }
        });
      } else if (name === 'skus') {
        v.componentsStatus[code][name] = true;
        v.marryGoods();
      }
    },
    delTag (index) { // 删除标签
      let v = this;
      if (v.showStatus) { // 查看不可操作
        return false;
      }
      v.shipmentCheckBoxModel.splice(index, 1);
      v.componentsModel['C013'].shipmentTypes.splice(index, 1);
    },
    shipmentSearch () {
      let v = this;
      v.getSmShippingMethod(v.shipmentPlatformModel, v.shipmentPlatformSite, v.shipmentSearchValue);
    },
    getShipment (type) { // 获取运输类型平台
      let v = this;
      let pos = [];
      v.getEnablePlatform().then(data => {
        data.forEach((n, i) => {
          if (n.platformId === 'ebay') {
            pos.push(n);
          }
        });
        v.shipmentPlatformList = pos;
      });
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
            v.componentsModel['C013'].shipmentTypes = arr;
          }
        }
      }
    },
    addTagList () { // 添加
      let v = this;
      if (v.tagName) {
        if (v.tagList.length) {
          v.tagList.forEach((n, i) => {
            if (n === v.tagName) {
              v.$Message.error('已存在！');
              v.tagName = null;
              return false;
            }
          });
          if (v.tagName) {
            v.tagList.push(v.tagName);
            v.tagName = null;
          }
        } else {
          v.tagList.push(v.tagName);
          v.tagName = null;
        }
      }
    },
    delTagListModal (index) { // 删除
      let v = this;
      v.tagList.splice(index, 1);
    },
    addOk () {
      let v = this;
      if (v.addTagType === 'buyerAccountIds') { // 添加指定买家账号
        v.tagName = null;
        v.componentsModel['C002'].buyerAccountIds = v.tagList;
        v.componentsStatus['C002'].buyerAccountIds = false;
      } else if (v.addTagType === 'buyerAccountIdsC3') { // 添加指定字符串
        v.tagName = null;
        v.componentsModel['C003'].buyerAccountIdsC3 = v.tagList;
        v.componentsStatus['C003'].buyerAccountIdsC3 = false;
      } else if (v.addTagType === 'keys') { // 消息标题
        v.tagName = null;
        v.componentsModel['C005'].keys = v.tagList;
        v.componentsStatus['C005'].keys = false;
      } else if (v.addTagType === 'keysC4') { // 消息内容
        v.tagName = null;
        v.componentsModel['C004'].keysC4 = v.tagList;
        v.componentsStatus['C004'].keysC4 = false;
      }
    },
    addCancel () {
      let v = this;
      v.tagName = null;
      v.tagList = [];
      if (v.addTagType === 'buyerAccountIds') {
        v.componentsStatus['C002'].buyerAccountIds = false;
      } else if (v.addTagType === 'buyerAccountIdsC3') {
        v.componentsStatus['C003'].buyerAccountIdsC3 = false;
      } else if (v.addTagType === 'keys') {
        v.componentsStatus['C005'].keys = false;
      } else if (v.addTagType === 'keysC4') {
        v.componentsStatus['C004'].keysC4 = false;
      }
    },
    getProductCategory () { // 获取商品分类
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.erpServiceCommon + api.get_productCategory, { hiddenError: true }).then(response => {
          if (response.data.code === 0) {
            v.productCategoryList = response.data.datas;
            resolve(true);
          }
        });
      });
    },
    marryGoods () { // 选择指定货品
      let v = this;
      if (v.componentsModel['C007'].skus) {
        v.addProductValue = v.componentsModel['C007'].skus.map(i => {
          return {
            sku: i
          };
        });
      }
      v.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      v.$refs.matchingGoodsModal.matchingGoodsModal = true;

      /* if (v.componentsModel['C007'].skus) {
       // console.log(v.componentsModel['C007'].skus);
       v.$refs.matchingGoodsModal.chioseList1 = v.componentsModel['C007'].skus;
       v.$refs.matchingGoodsModal.matchingGoodsList = v.componentsModel['C007'].skus;
       } */
    },
    editData (val) { // 接收子组件传值
      let v = this;
      v.componentsModel['C007'].skus = val;
      v.$refs.matchingGoodsModal.matchingGoodsModal = false;
      v.$refs.matchingGoodsModal.matchingGoodsList = [];
      v.$refs.matchingGoodsModal.chioseList1 = [];
      // v.componentsStatus['C007'].skus = false;
    },
    getPriority () { // 获取优先级
      let v = this;
      v.axios.get(api.get_messagePriority).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.rulePriorityList = data;
        }
      });
    },
    getEbayFolder () { // 获取ebay文件夹
      let v = this;
      v.axios.get(api.get_folder + '?platformId=ebay').then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.ruleFolderList = data;
        }
      });
    },
    getUserlist () { // 获取用户列表
      let v = this;
      let pos = [];
      let list = this.$store.state.userInfoList;
      for (let n in list) {
        pos.push({
          userId: list[n].userId,
          userName: list[n].userName
        });
      }
      v.ruleAccountList = pos;
    },
    handleSubmit () {
      let v = this;
      let arr = [];
      // let status = false;
      return new Promise(resolve => {
        if (v.rulesModel.indexOf(v.getRuleCode('C009')) >= 0) {
          v.componentsStatus['C009'].hasNegative = true;
        }
        if (v.rulesModel.indexOf(v.getRuleCode('C011')) >= 0) {
          v.componentsStatus['C011'].hasRefund = true;
        }
        if (v.rulesModel.indexOf(v.getRuleCode('C012')) >= 0) {
          v.componentsStatus['C012'].hasReplenishmentDelivery = true;
        }
        if (v.rulesModel.indexOf(v.getRuleCode('C010')) >= 0) {
          v.componentsStatus['C010'].hasDispute = true;
        }
        for (let item in v.componentsStatus) {
          let subArr = [];// autoRuleParams
          let changeItem = v.getRuleCode(item);
          let sub = v.componentsStatus[changeItem];
          // console.log(sub);
          for (let subItem in sub) {
            let child = sub[subItem];
            // console.log(child);
            for (let u = 0; u < v.rulesModel.length; u++) {
              let ruleItem = v.rulesModel[u];
              if (ruleItem === item) { // 勾选有效
                if (changeItem === 'C001' && v.componentsModel[changeItem]['saleAccountIds'].length === 0) {
                  v.$Message.error('已选条件下指定eBay帐号不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C002' && v.componentsModel[changeItem]['buyerAccountIds'].length === 0) {
                  v.$Message.error('已选条件下指定买家账号不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C003' && v.componentsModel[changeItem]['buyerAccountIdsC3'].length === 0) {
                  v.$Message.error('已选条件下买家开头指定字符串不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C004' && v.componentsModel[changeItem]['keysC4'].length === 0) {
                  v.$Message.error('已选条件下消息内容包含关键字不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C005' && v.componentsModel[changeItem]['keys'].length === 0) {
                  v.$Message.error('已选条件下消息标题包含关键字为不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C006' && v.componentsModel[changeItem]['countryCodes'].length === 0) {
                  v.$Message.error('已选条件下指定国家不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C007' && v.componentsModel[changeItem]['skus'].length === 0) {
                  v.$Message.error('已选条件下指定货品不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C013' && v.componentsModel[changeItem]['shipmentTypes'].length === 0) {
                  v.$Message.error('已选条件下指定运输类型不能为空');
                  v.loading = false;
                  return false;
                } else if (changeItem === 'C008' && v.componentsModel[changeItem]['productCategories'].length === 0) {
                  v.$Message.error('已选条件下指定分类不能为空');
                  v.loading = false;
                  return false;
                }
                // status = true;
                if (child || (v.componentsModel[changeItem][subItem] && v.componentsModel[changeItem][subItem].length > 0)) {
                  if (changeItem === 'C009' || changeItem === 'C011' || changeItem === 'C012' || changeItem === 'C010') {
                    let obj = {
                      name: subItem,
                      type: 0,
                      value: '1'
                    };
                    subArr.push(obj);
                  } else if (changeItem === 'C002' || changeItem === 'C007' || changeItem === 'C013' || changeItem === 'C006' || changeItem === 'C005' || changeItem === 'C008') {
                    let childArr = [];
                    let list = v.componentsModel[changeItem][subItem];
                    for (let t = 0; t < list.length; t++) {
                      childArr.push({
                        value: list[t]
                      });
                    }
                    let obj = {
                      name: subItem,
                      type: 1,
                      autoRuleParamValues: childArr
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'C003') {
                    let childArr = [];
                    let list = v.componentsModel[changeItem][subItem];
                    for (let t = 0; t < list.length; t++) {
                      childArr.push({
                        value: list[t]
                      });
                    }
                    let obj = {
                      name: 'buyerAccountIds',
                      type: 1,
                      autoRuleParamValues: childArr
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'C004') {
                    let childArr = [];
                    let list = v.componentsModel[changeItem][subItem];
                    for (let t = 0; t < list.length; t++) {
                      childArr.push({
                        value: list[t]
                      });
                    }
                    let obj = {
                      name: 'keys',
                      type: 1,
                      autoRuleParamValues: childArr
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  } else if (changeItem === 'C001') {
                    let childArr = [];
                    let list = v.componentsModel[changeItem][subItem];
                    for (let t = 0; t < list.length; t++) {
                      childArr.push({
                        value: list[t]
                      });
                    }
                    let obj = {
                      name: subItem,
                      type: 1,
                      autoRuleParamValues: childArr
                    };
                    if (v.componentsModel[changeItem][subItem] !== '') {
                      subArr.push(obj);
                    }
                  }
                }
              }
            }
          }
          if (subArr.length > 0) {
            let itemObj = {
              ruleCode: v.ruleParmas.type === 0 ? v.getRuleCode(item) : item,
              autoRuleParams: subArr
            };
            arr.push(itemObj);
          }
        }
        resolve([true, arr]);
      });
    },
    resetRuleData () { // 重置数据
      let v = this;
      v.loading = false;
      v.rulesModel = [];
      v.shipmentPlatformSite = '';
      v.source = {
        saleAccountIds: []
      };
      v.smShippingMethodList = [];
      v.hasSite = false;
      v.shipmentSearchValue = null;
      v.shipmentPlatformModel = '';
      v.shipmentPlatformList = [];
      v.shipmentPlatformSiteList = [];
      v.shipmentCheckBoxModel = [];
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
        shipmentRemindingReason: null
      };
      v.productCategoryList = [];
      v.autoRuleItems = [];
      v.componentsModel['C001'].saleAccountIds = [];
      v.componentsModel['C002'].buyerAccountIds = [];
      v.componentsModel['C003'].buyerAccountIdsC3 = [];
      v.componentsModel['C004'].keysC4 = [];
      v.componentsModel['C005'].keys = [];
      v.componentsModel['C006'].countryCodes = [];
      v.componentsModel['C007'].skus = [];
      v.componentsModel['C008'].productCategories = [];
      v.componentsModel['C013'].shipmentTypes = [];
      for (let i in v.componentsStatus) {
        for (let b in v.componentsStatus[i]) {
          v.componentsStatus[i][b] = false;
        }
      }
    }
  }
};
</script>

<style scoped lang="less">
.rulesRightHeight {
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

.saveButton {
  margin-right: 18px;
}

.keywordString .ivu-form-item {
  margin-bottom: 12px;
}

.countryCodesName {
  max-width: 465px;
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
</style >
