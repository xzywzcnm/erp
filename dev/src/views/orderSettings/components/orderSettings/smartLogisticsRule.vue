<template>
  <div class="smartLogisticsRule">
    <!-- <div>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="12">
        <h2 class="text-center">智能物流匹配逻辑说明</h2>
        </Col>
      </Row>
      <div class="mt15" style="display:flex;justify-content:center;align-items:center;">
        <Tooltip theme="light">
          <Icon type="md-help-circle" size="20" color="#32a6d9" />
          <div slot="content">
            <h3>必要流程：找出可发物流商</h3>
            <p>订单匹配物流渠道基础属性中的：</p>
            <p>1.尺寸限制</p>
            <p>2.重量限制</p>
            <p>3.接收类型限制</p>
            <p>4.配送范围限制</p>
            <p class="mt5">匹配结果=1结束，匹配结果>1进行下一步</p>
          </div>
        </Tooltip>
        <div class="ml10 setup-item">
          匹配物流渠道基础属性
        </div>
        <Icon type="md-arrow-round-forward" size="24" class="ml20" />
        <Tooltip theme="light" max-width="260">
          <Icon type="md-help-circle" size="20" color="#32a6d9" class="ml20" />
          <div slot="content">
            <h3>c</h3>
            <p>上一步匹配成功的结果集跑物流匹配规则，通过规则引擎匹配，从上到下匹配</p>
            <p class="mt5">匹配结果=1结束，匹配结果>1进行下一步</p>
          </div>
        </Tooltip>
        <div class="ml10 setup-item">
          匹配物流规则
        </div>
        <Icon type="md-arrow-round-forward" size="24" class="ml20" />
        <Tooltip theme="light" max-width="260">
          <Icon type="md-help-circle" size="20" color="#32a6d9" class="ml20" />
          <div slot="content">
            <h3>可选流程：适用范围</h3>
            <p>用户可自定义物流渠道的适用范围，匹配所有渠道的适用范围</p>
            <p class="mt5">匹配结果=1结束，匹配结果>1进行下一步</p>
          </div>
        </Tooltip>
        <div class="ml10 setup-item">
          匹配物流适用范围
        </div>
        <Icon type="md-arrow-round-forward" size="24" class="ml20" />
        <Tooltip theme="light" max-width="260">
          <Icon type="md-help-circle" size="20" color="#32a6d9" class="ml20" />
          <div slot="content">
            <h3>必要流程：选择运费最低或时效最快</h3>
            <p>计算所有符合条件物流渠道的运费/时效，根据设置的优先级选择运费最低或时效最快的</p>
          </div>
        </Tooltip>
        <div class="ml10 setup-item">
          运费/时效优先级
        </div>
      </div>
    </div> -->
    <!-- 仓库 -->
    <!-- <Button @click="$refs.newRule.open()">打开</Button>-->
    <div class="mt10 ml15">
      <span>仓库：</span>
      <Button-group>
        <template v-for="(item, index) in wareGroup" v-if="index < 5">
          <Button v-if="item.selected" type="primary" @click="getPlatformData(item.warehouseId)" :key="index">
            {{ item.title }} </Button>
          <span class="pseudoButton" v-if="!item.selected" @click="getPlatformData(item.warehouseId)" :key="index">{{ item.title }}</span>
        </template>
        <template v-if="wareGroup.length > 5">
          <Dropdown class="ml10" transfer transfer-class-name="ware-list-mian" @on-visible-change="wareListVisible">
            <Button>
              {{ moreTitle }}
              <Icon type="md-arrow-dropdown" />
            </Button>
            <Dropdown-menu slot="list">
              <div class="list-filter-input">
                <dytInput ref="wareFilterInput" v-model="listFilterInput" placeholder="请输入仓库名称" />
              </div>
              <Dropdown-item v-for="(item, index) in filterWareList" :key="`filter-${index}`">
                <div @click="getPlatformData(item.warehouseId)">{{ item.title }}</div>
              </Dropdown-item>
              <div v-if="filterWareList.length == 0" style="color: #898989; padding: 10px;text-align: center;">无匹配数据</div>
            </Dropdown-menu>
          </Dropdown>
        </template>
      </Button-group>
    </div>
    <div class="commonFilter">
      <div class="card-container normalTop">
        <div class="card-content">
          <!-- 物流规则 -->
          <h3 class="normalFontSizeTwoSize mt15">
            1.物流规则
            <Button type="primary" v-if="permission.add" @click="addRule" class="ml10">新增物流规则</Button>
            <Button class="ml10" type="primary" :disabled="!allChodeDisable" v-if="permission.enable" @click="batchEnableDisable('Enable')">启用</Button>
            <Button class="ml10" type="primary" :disabled="!allChodeEnable" v-if="permission.disable" @click="batchEnableDisable('Disable')">停用</Button>
            <Button class="ml10" type="primary" :disabled="$common.isEmpty(choseTableRowsData)" v-if="permission.copyRule" @click="openCopyRule">复制</Button>
            <Button class="ml10" type="primary" :disabled="$common.isEmpty(choseTableRowsData)" v-if="permission.delete" @click="delRuleFn(null)">删除</Button>
          </h3>
          <Form class="formReset clear commonFilter mt10">
            <div class="form-reset-main">
              <Form-item label="状态" prop="status">
                <dyt-select v-model="searchParams.status">
                  <Option v-for="(item,index) in statusList" :value="item.value" :key="index">{{ item.label }}</Option>
                </dyt-select>
              </Form-item>
              <Form-item label="规则名称" prop="name">
                <dytInput v-model="searchParams.name" placeholder="请输入规则名称" />
              </Form-item>
              <Form-item label="规则指定订单来源" prop="platformIds">
                <dyt-select multiple v-model="searchParams.platformIds">
                  <Option v-for="item in platformList" :value="item.platformId" :key="item.platformId"> {{ item.name }}</Option>
                </dyt-select>
              </Form-item>
              <Form-item label="规则指定订单目的国家/地区包括">
                <erpTreeSelect
                  v-model="selectCountry"
                  :multiple="true"
                  :normalizer="treeNormalizer"
                  :options="countryData"
                  :default-expand-level="1"
                  :appendToBody="true"
                  placeholder="请选择"
                  noResultsText="无匹配数据"
                  @input="treeSelectCategoryChange"
                />
              </Form-item>
              <!-- :limit="1" -->
              <Form-item label="规则指定发货指定方式">
                <logisticsModeTree
                  v-model="value2"
                  :loadingChildren="true"
                  :allLogisticsMode="true"
                  :isType="true"
                  :warehouse-id="selectWareID"
                  placeholder="请选择规则指定发货指定方式"
                  @on-change="shippingChange"
                />
              </Form-item>
            </div>
            <div class="form-reset-button">
              <Button type="primary" class="smart-search" @click="search">搜索</Button>
            </div>

          </Form>
          <div v-if="shippingParamsList.length > 0" class="mt10 commonFilter">
            <span>已选发货指定方式：</span>
            <Tag v-for="(item,index) in shippingParamsList" :key="item.id">{{ item.name }}
              <Icon type="ios-close" class="ml10" @click="delShipFn(index)" />
            </Tag>
          </div>
          <div class="commonFilter normalTop">
            <Table
              ref="dragable"
              highlight-row
              border
              :columns="logisticsColumns"
              :loading="ruleTableLoading"
              :data="logisticsData"
              :height="630"
              @on-selection-change="choseRowsChange"
            />
          </div>
          <!-- <h3 class="normalFontSizeTwoSize mt15">2.物流渠道适用范围</h3>
          <div class="commonFilter normalTop">
            <Table highlight-row border max-height="400" :columns="scopeColumns" :loading="scopeLoading" :data="scopeData"></Table>
          </div> -->
          <!--  优先级 -->
          <!-- <h3 class="normalFontSizeTwoSize mt15" style="display: flex">3.运费/时效优先级</h3>
          <div class=" flexAlignItemsCenter flexBoxJustContent moveDragContainer" style="display: flex" id="moveDragContainer">
            <div class="moveDrag flexAlignItemsCenter flexBoxJustContent" style="display: flex" v-for="(item, index) in dataList" :key="index">
              <Icon type="md-move" class="normalRMargin"></Icon>
              <span>
                {{
                  item === 'LF' ? '运费最低' : item === 'FT' ? '时效最快' : item === 'STO' ? '上网时间最短' : '妥投率最高'
                }}
              </span>
              <Icon v-if="index+1 !== dataList.length" type="ios-arrow-forward" style="position:absolute;left:50%;" />
            </div>
          </div> -->
        </div>
      </div>
    </div>
    <!-- 规则创建编辑 -->
    <Modal v-model="ruleEditModel" v-if="ruleEditStatus" width="1000" :mask-closable="false" :loading="ruleLoading" class-name="modal-order-smart-rule">
      <div class="ivu-modal-confirm-head">
        <div class="ivu-modal-confirm-head-title">{{ ruleTitle }}</div>
      </div>
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
        <smartRule
          :timestamp="timestamp"
          :type="editType"
          :ruleParmas="ruleParmas"
          :selectWareID="selectWareID"
          :wareGroup="wareGroup"
          @closeModal="closeModal"
          :warehouseType="warehouseType"
          :looKsettings="looKsettings"
          :ruleType="'smart'"
        ></smartRule>
      </div>
      <div slot="footer"></div>
    </Modal>
    <!-- 适用范围 -->
    <Modal v-model="scopeModal" v-if="scopeModalStatus" width="1000" title="适用范围" @on-ok="saveScope" @on-cancel="cancelScope" :loading="scopeModalLoading">
      <div class="modalItemContent clear">
        <div class="modalItemPadding">
          <Form ref="rangeOfApplicationParmas" :model="rangeOfApplicationParams" label-position="left">
            <Row>
              <Col :span="12">
                <FormItem :label-width="100" label="适用平台/账号：">
                  <erpTreeSelect
                    v-model="shopAccountListModel"
                    :multiple="true"
                    :normalizer="accountNormalizer"
                    :options="shopAccount"
                    :default-expand-level="1"
                    :appendToBody="true"
                    placeholder="请选择"
                    noResultsText="无匹配数据"
                    zIndex="99999999999"
                  />
                </FormItem>
              </Col>
              <Col :span="10" :offset="1">
              <FormItem :label-width="100" label="适用货品标签：">
                <dyt-select v-model="goodsTagList" multiple>
                  <Option v-for="(item, index) in productTagList" :value="item" :key="index"> {{ item }}</Option>
                </dyt-select>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="12">
              <FormItem :label-width="135" label="适用包裹金额（$）：">
                <InputNumber v-model="carrierShippingMethodParmas.minPrice" :min="0" size="small"></InputNumber>
                <span> - </span>
                <InputNumber v-model="carrierShippingMethodParmas.maxPrice" :min="0" size="small"></InputNumber>
              </FormItem>
              </Col>
              <Col :span="11" :offset="1">
              <FormItem :label-width="180" label="买家支付的运费范围（$）：">
                <InputNumber v-model="carrierShippingMethodParmas.minShippingFeeIncome" :min="0" size="small"></InputNumber>
                <span> - </span>
                <InputNumber v-model="carrierShippingMethodParmas.maxShippingFeeIncome" :min="0" size="small"></InputNumber>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col :span="12">
              <FormItem :label-width="100" label="包裹包含SKU：">
                <Input v-model.trim="skuList" type="textarea" :rows="4" placeholder="支持多个SKU，请用逗号或空格分开"></Input>
              </FormItem>
              </Col>
              <Col :span="11" :offset="1">
              <FormItem :label-width="110" label="商品总数量范围：">
                <InputNumber v-model="carrierShippingMethodParmas.minGoodsQuantity" :min="0" size="small"></InputNumber>
                <span> - </span>
                <InputNumber v-model="carrierShippingMethodParmas.maxGoodsQuantity" :min="0" size="small"></InputNumber>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </Modal>
    <!-- new rule-->
    <newRule ref="newRule" ruleType="smart"></newRule>
    <!-- 优先级调整 -->
    <ruleSortModal
      @modalConfirm="tableRowSort"
      :model-data="ruleSortData"
      :model-visible.sync="chonseSortVisible"
    />
    <!-- 批量复制规则弹窗 -->
    <copyRuleModal
      :model-data="copyRuleInfo"
      :model-visible.sync="copyRuleVisible"
    />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import Sortable from 'sortablejs';
import smartRule from './components/smartRule';
import publicService from '@/components/mixin/publicService_mixin';
import newRule from '@/views/orderSettings/components/orderSettings/components/newRule';
import ruleSortModal from '@/views/orderSettings/components/orderSettings/components/ruleSortModal';
import copyRuleModal from '@/views/orderSettings/components/orderSettings/components/copyRuleModal';
import logisticsModeTree from '@/components/common/logisticsModeTree';

let sortEl;
export default {
  mixins: [Mixin, publicService],
  components: {
    smartRule,
    newRule,
    ruleSortModal,
    copyRuleModal,
    logisticsModeTree
  },
  data () {
    let self = this;
    return {
      looKsettings: false,
      choseTableRowsData: [],
      countryData: [],
      listFilterInput: '',
      platformList: [],
      selectCountry: [],
      copyRuleVisible: false,
      copyRuleInfo: {},
      ruleSortData: {
        rowIndex: null,
        tableList: [],
        row: {}
      },
      // 平台树接口 json
      shopAccountJson: {},
      chonseSortVisible: false,
      searchParams: {
        'businessId': '', // 业务Id 智能物流为仓库id ,
        'countryCodes': [], //  国家编码集合
        'platformIds': [], // 平台ids
        'shippingMethodIds': [], // 邮寄方式集合
        'status': 1 // 状态 1启用 0停用 全部-1 ,
      },
      statusList: [
        {
          label: '全部',
          value: -1
        }, {
          label: '启用',
          value: 1
        }, {
          label: '停用',
          value: 0
        }
      ],
      editType: '1', // 0 编辑 1 创建
      dataList: ['LF', 'FT'],
      typeList: ['LF', 'FT'],
      moreTitle: '更多仓库',
      wareGroup: [], // 仓库列表
      selectWareID: null, // 当前选择仓库Id
      // 物流规则
      ruleTableLoading: true,
      logisticsData: [],
      logisticsColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'No.',
          width: 60,
          render: (h, params) => {
            return h('span', params.row.sortIndex + 1);
          }
        }, {
          title: '优先级',
          width: 200,
          render: (h, params) => {
            if (!self.permission.priority || self.logisticsData.length == 1) {
              return h('div', {}, '');
            }
            let arr = [];
            arr = [

            ];
            if (params.index == 0 || params.index != self.logisticsData.length - 1) {
              arr.push(h('span', {
                attrs: {
                  title: '置底'
                },
                class: 'icon iconfont icon-setBottom-copy normalFontSizeTwoSize cursor greenColor',
                on: {
                  click: () => {
                    self.tableRowSort({ newIndex: self.logisticsData.length - 1, oldIndex: params.index });
                  }
                }
              }));
            }
            if (params.index != 0 || params.index == self.logisticsData.length - 1) {
              arr.push(h('span', {
                attrs: {
                  title: '置顶'
                },
                class: 'icon iconfont icon-zhiding1 normalFontSizeTwoSize cursor blueColor',
                on: {
                  click: () => {
                    self.tableRowSort({ newIndex: 0, oldIndex: params.index });
                  }
                }
              }));
            }
            arr.push(h('Icon', {
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
            }));
            arr.push(h('Icon', {
              attrs: {
                title: '编辑排序'
              },
              style: {
                marginLeft: '5px',
                position: 'relative'
              },
              class: 'cursor normalFontSizeTwoSize lapa lapa-edit',
              on: {
                click: () => {
                  this.ruleSortData = {
                    rowIndex: params.index,
                    row: this.$common.copy(params.row),
                    tableList: this.$common.copy(self.logisticsData),
                  }
                  this.$nextTick(() => {
                    this.chonseSortVisible = true;
                  })
                }
              }
            }));
            return h('div', {}, arr);
          }
        }, {
          title: '规则名称',
          minWidth: 100,
          key: 'name',
          render: (h, { row }) => {
            return h('div', {
              style: {
                'white-space': 'pre-wrap'
              }
            }, row.name)
          }
        },
        {
          title: '状态',
          key: 'status',
          width: 100,
          render: (h, params) => {
            return params.row.status === 0 ? h('span', {
              class: 'redColor'
            }, '停用') : h('span', {
              class: 'greenColor'
            }, '启用');
          }
        }, {
          title: '最后修改人',
          minWidth: 120,
          maxWidth: 200,
          key: 'updatedBy',
          render: (h, params) => {
            return h('span', self.getUserName(params.row.updatedBy));
          }
        }, {
          title: '最后修改时间',
          minWidth: 200,
          maxWidth: 240,
          key: 'updateTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.updatedTime, 'fulltime'));// return last update time
          }
        }, {
          title: '操作',
          key: 'operate',
          minWidth: 140,
          maxWidth: 280,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5',
                style: {
                  display: (() => {
                    return self.permission.view ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '查看规则' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = true;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 0, // 0 edit 1 create
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: params.row.name,
                        status: params.row.status,
                        details: params.row || {},
                        businessId: self.selectWareID
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '查看'),
              h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5 ml5',
                style: {
                  display: (() => {
                    return self.permission.update ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '编辑规则' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 0, // 0 edit 1 create
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: params.row.name,
                        status: params.row.status,
                        businessId: self.selectWareID
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '编辑'),
              params.row.status === 0 ? h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5 ml5',
                style: {
                  display: (() => {
                    return self.permission.enable ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 0);
                  }
                }
              }, '启用') : params.row.status === 1 ? h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5 ml5',
                style: {
                  display: (() => {
                    return self.permission.disable ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 1);
                  }
                }
              }, '停用') : '',
              h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5 ml5',
                style: {
                  display: (() => {
                    return self.permission.copyRule ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '订单自动规则--创建' + '(' + self.nameAddOne(params.row.name) + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        type: 1, // 0 edit 1 create
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: self.nameAddOne(params.row.name),
                        status: 0,
                        businessId: self.selectWareID,
                        copy: true
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '复制'),
              !self.permission.delete || h('Button', {
                props: {
                  size: 'small'
                },
                class: 'mb5 ml5',
                on: {
                  'click' () {
                    self.delRuleFn(params.row);
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      ruleEditModel: false,
      ruleEditStatus: false,
      ruleLoading: false,
      ruleTitle: null,
      ruleParmas: null,
      timestamp: 0,
      scopeLoading: true,
      scopeData: [],
      scopeColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'No.',
          width: 60,
          render: (h, params) => {
            return h('span', params.row.sortIndex + 1);
          }
        }, {
          title: '物流商/物流渠道',
          minWidth: 120,
          align: 'center',
          key: 'carrierName',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.carrierName), h('div', params.row.carrierShippingMethodName)
            ]);
          }
        }, {
          title: '适用范围',
          minWidth: 150,
          align: 'center',
          key: 'scopeExtent',
          render: (h, params) => {
            let pos = [];
            if (params.row.orderCarrierScopePlatformList) {
              pos.push('平台/账号');
            }
            if (params.row.tagNameList) {
              pos.push('商品标签');
            }
            if (params.row.minPrice > 0 || params.row.maxPrice > 0) {
              pos.push('订单金额');
            }
            if (params.row.minShippingFeeIncome > 0 || params.row.maxShippingFeeIncome > 0) {
              pos.push('运费范围');
            }
            if (params.row.skuList) {
              pos.push('包含sku');
            }
            if (params.row.minGoodsQuantity > 0 || params.row.maxGoodsQuantity > 0) {
              pos.push('数量范围');
            }
            if (pos.length) {
              return h('div', pos.toString());
            } else {
              return h('div', '所有');
            }
          }
        }, {
          title: '最后修改人',
          minWidth: 120,
          maxWidth: 200,
          align: 'center',
          key: 'updatedBy',
          render: (h, params) => {
            return h('span', self.getUserName(params.row.updatedBy));
          }
        }, {
          title: '最后修改时间',
          minWidth: 200,
          maxWidth: 240,
          align: 'center',
          key: 'updateTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.updatedTime, 'fulltime'));// return last update time
          }
        }, {
          title: '操作',
          key: 'operate',
          minWidth: 140,
          maxWidth: 240,
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                size: 'small'
              },
              style: {
                display: (() => {
                  return self.permission.edit ? 'inline-block' : 'none';
                })()
              },
              on: {
                click: () => {
                  self.editType = '0';
                  self.carrierShippingMethodParmas = {
                    maxPrice: null,
                    minPrice: 0,
                    maxShippingFeeIncome: null,
                    minShippingFeeIncome: 0,
                    minEfficiency: 0,
                    maxEfficiency: 0,
                    minGoodsQuantity: 0,
                    maxGoodsQuantity: null
                  };
                  this.editRowData(params.row);
                }
              }
            }, '编辑');
          }
        }
      ],
      scopeModal: false,
      scopeModalStatus: false,
      shopAccount: [],
      rangeOfApplicationParams: null,
      shopAccountListModel: [],
      goodsTagList: [],
      skuList: '',
      carrierShippingMethodParmas: {
        maxPrice: null,
        minPrice: 0,
        maxShippingFeeIncome: null,
        minShippingFeeIncome: 0,
        minEfficiency: 0,
        maxEfficiency: 0,
        minGoodsQuantity: 0,
        maxGoodsQuantity: null
      },
      platformGroup: null,
      rowData: [],
      scopeModalLoading: true,
      warehouseType: '0',
      value2: [],
      shippingParamsList: []
    };
  },
  computed: {
    // 权限
    permission () {
      return {
        enable: this.getPermission('orderCarrierAutoRule_enable'),
        disable: this.getPermission('orderCarrierAutoRule_disable'),
        add: this.getPermission('orderCarrierAutoRule_insert'),
        edit: this.getPermission('orderCarrierScope_update'),
        delete: this.getPermission('orderCarrierAutoRule_delete'),
        copyRule: this.getPermission('orderCarrierAutoRule_copy'),
        view: this.getPermission('orderCarrierAutoRule_get'),
        update: this.getPermission('orderCarrierAutoRule_update'),
        priority: this.getPermission('orderCarrierAutoRule_updatePriority'),
        query: this.getPermission('orderCarrierAutoRule_query'),
        carrierQuery: this.getPermission('orderCarrierScope_query'),
      }
    },
    allChodeEnable () {
      if (this.$common.isEmpty(this.choseTableRowsData)) return false;
      const hasDisable = this.choseTableRowsData.find(row => row.status === 0);
      return this.$common.isEmpty(hasDisable);
    },
    allChodeDisable () {
      if (this.$common.isEmpty(this.choseTableRowsData)) return false;
      const hasEnable = this.choseTableRowsData.find(row => row.status === 1);
      return this.$common.isEmpty(hasEnable);
    },
    filterWareList () {
      let list = [];
      const str = this.$common.isEmpty(this.listFilterInput.trim()) ? '' : (this.listFilterInput.trim()).toLocaleLowerCase();
      this.wareGroup.forEach((item, index) => {
        if (index >= 5 && (this.$common.isEmpty(str) || (item.title.toLocaleLowerCase()).includes(str))) {
          list.push(item);
        }
      });
      return list;
    }
  },
  created () {
    let v = this;
    v.getPermissionCallback('orderSettings_smartLogisticsRule').then(res => {
      v.getWareHouseName(); // 获取仓库列表
      v.getCommonCountry(v.treeArr);
      v.getEnablePlatform().then(data => {
        v.platformList = data;
      }); // 获取订单来源
    });
  },
  methods: {
    getCommonCountry (selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
        const makeTree = (data) => {
          if (!selectArr) selectArr = [];
          let arr = [
            {
              zoneCode: 'allValue',
              title: '全部',
              check: false,
              expand: true
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
                };
                if (this.$common.isEmpty(obj.children)) {
                  obj.children = [];
                }
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
            if (this.$common.isEmpty(arr[0].children)) {
              arr[0].children = [];
            }
            arr[0].children.push(obj);
          });
          v.$nextTick(function () {
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
    search () {
      this.searchParams.businessId = this.selectWareID;
      let params = JSON.parse(JSON.stringify(this.searchParams));
      params.shippingMethodIds = this.shippingParamsList.map(i => i.id);
      this.choseTableRowsData = [];
      this.getLogisticsData(params);
    },
    // 更多仓储下拉显示
    wareListVisible (visible) {
      if (!visible) {
        // this.listFilterInput = '';
        return;
      }
      if (this.$refs.wareFilterInput && this.$refs.wareFilterInput.$el) {
        const demo = this.$refs.wareFilterInput.$el.querySelector('.ivu-input');
        if (!demo) return;
        setTimeout(() => {
          demo.focus();
          setTimeout(() => {
            demo.focus();
          }, 200);
        }, 300);
      }
    },
    delShipFn (index) {
      const removeItem = this.shippingParamsList.splice(index, 1);
      let removeId = [];
      removeItem.forEach(m => {
        removeId.push(m.id);
        removeId.push(m.parentMerchantId);
      });
      const notRemove = this.shippingParamsList.map(m => m.id);
      this.value2 = this.$common.arrRemoveRepeat([...this.value2.filter(f => !removeId.includes(f)), ...notRemove]);
    },
    // 删除规则
    delRuleFn (row = {}) {
      const single = !this.$common.isEmpty(row);
      let newIds = [];
      if (single) {
        newIds = [row.autoRuleId];
      } else {
        if (this.$common.isEmpty(this.choseTableRowsData)) return this.$Message.error('请选择需要删除的规则');
        newIds = this.choseTableRowsData.map(m => m.autoRuleId);
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: single ? `确认删除规则：<span style="white-space: pre-wrap;">${row.name}</span>？` : `确认删除选中的 <span style="color: #f20;">${newIds.length}</span> 条规则？`,
        onOk: () => {
          this.axios.delete(api.add_orderCarrierRule + '?autoRuleIds=' + newIds).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功');
              this.pageParamsStatus = true;
              this.selectTabData = [];
              this.search();
            }
          });
        },
        onCancel: () => {}
      });
    },
    setNumber () {
      if (this.carrierShippingMethodParmas.minPrice > this.carrierShippingMethodParmas.maxPrice) {
        [
          this.carrierShippingMethodParmas.minPrice, this.carrierShippingMethodParmas.maxPrice
        ] = [this.carrierShippingMethodParmas.maxPrice, this.carrierShippingMethodParmas.minPrice];
      }
      if (this.carrierShippingMethodParmas.minShippingFeeIncome > this.carrierShippingMethodParmas.maxShippingFeeIncome) {
        [
          this.carrierShippingMethodParmas.minShippingFeeIncome, this.carrierShippingMethodParmas.maxShippingFeeIncome
        ] = [
          this.carrierShippingMethodParmas.maxShippingFeeIncome, this.carrierShippingMethodParmas.minShippingFeeIncome
        ];
      }
      if (this.carrierShippingMethodParmas.minGoodsQuantity > this.carrierShippingMethodParmas.maxGoodsQuantity) {
        [
          this.carrierShippingMethodParmas.minGoodsQuantity, this.carrierShippingMethodParmas.maxGoodsQuantity
        ] = [this.carrierShippingMethodParmas.maxGoodsQuantity, this.carrierShippingMethodParmas.minGoodsQuantity];
      }
    },
    saveNewOrderCarrierRule () {
      let v = this;
      let obj = {
        typeList: v.typeList,
        warehouseId: v.selectWareID
      };
      v.axios.put(api.set_orderCarrierRule, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('修改成功');
        }
      });
    },
    getPlatformData (id) {
      let v = this;
      v.selectWareID = id;
      v.search();
      v.getCarrierRule();
      v.getCarrierScope();
      v.wareGroup.forEach((n, i) => {
        if (n.warehouseId === id) {
          n.selected = true;
          v.warehouseType = n.warehouseType;
          v.wareGroup.splice(i, 1);
          v.wareGroup.splice(0, 0, n);
        } else {
          n.selected = false;
        }
      });
      this.$nextTick(() => {
        this.listFilterInput = '';
      });
    },
    // 获取仓库下拉列表
    getWareHouseName () {
      let v = this;
      let pos = [];
      v.axios.post(api.queryUserAllwarehouse).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data) {
            v.selectWareID = data[0].warehouseId;
            data.forEach((n, i) => {
              if (n.warehouseId === v.selectWareID) {
                pos.push({
                  selected: true,
                  warehouseId: n.warehouseId,
                  title: n.warehouseName,
                  warehouseType: n.warehouseType
                });
                v.warehouseType = n.warehouseType;
              } else {
                pos.push({
                  selected: false,
                  warehouseId: n.warehouseId,
                  title: n.warehouseName,
                  warehouseType: n.warehouseType
                });
              }
            });
            v.wareGroup = pos;
            v.search();
            v.getCarrierRule();
            v.getCarrierScope();
          }
        }
      });
    },
    getCarrierRule () {
      let v = this;
      v.axios.get(api.erpService + api.get_orderCarrierRule + v.selectWareID).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length) {
            v.dataList = [];
            v.typeList = [];
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              v.$nextTick(() => {
                v.dataList.push(item.type);
              });
              v.typeList.push(item.type);
            }
          }
        }
      });
    },
    getLogisticsData (params) { // 获取物流规则表格数据
      if (!this.permission.query) return;
      this.logisticsData = [];
      if (this.$common.isEmpty(this.selectWareID)) return;
      this.ruleTableLoading = true;
      this.axios.post(api.get_orderCarrierAutoRule, params).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas;
          list.forEach((n, i) => {
            n.sortIndex = i;
          });
          this.logisticsData = list;
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
      }).finally(() => {
        this.ruleTableLoading = false;
      });
    },
    addRule () { // 新增物流规则
      let v = this;
      v.editType = '0';
      v.ruleTitle = '新建规则';
      const date = new Date().getTime();
      v.ruleEditStatus = true;
      v.looKsettings = false;
      v.$nextTick(function () {
        v.ruleEditModel = true;
        v.ruleParmas = {
          type: 1, // 0 edit 1 create
          name: '',
          autoRuleId: null,
          status: 0,
          businessId: v.selectWareID
        };
        v.timestamp = date;
      });
    },
    // 表格选择行数据改变时
    choseRowsChange (rows) {
      this.choseTableRowsData = rows || [];
    },
    // 规则批量启用(停用)
    batchEnableDisable (str) {
      const match = {
        // 停用
        Disable: { apiUrl: api.autoRuleBatchDisable, stop: this.allChodeEnable, txt: '停用' },
        // 启用
        Enable: { apiUrl: api.autoRuleBatchEnable, stop: this.allChodeDisable, txt: '启用' }
      }
      if (this.$common.isEmpty(match[str]) || !match[str].stop) return;
      const choseIdData = this.choseTableRowsData.map(m => m.autoRuleId);
      this.$Modal.confirm({
        title: '操作确认',
        content: `<div>确定${match[str].txt} <span style="color:#f20;">${choseIdData.length}</span> 条规则</div>`,
        loading: true,
        onOk: () => {
          this.axios.put(match[str].apiUrl, choseIdData).then(res => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$Message.success('操作成功');
            this.search();
          }).finally(() => {
            this.$Modal.remove();
          });
        },
        onCancel: () => { }
      });
    },
    // 打开批量复制规则弹窗
    openCopyRule () {
      this.copyRuleInfo = {
        chooseWareId: this.selectWareID,
        warehouseData: this.wareGroup,
        rule: this.$common.copy(this.choseTableRowsData)
      }
      this.$nextTick(() => {
        this.copyRuleVisible = true;
      })
    },
    // 物流方式改变
    shippingChange (data) {
      this.shippingParamsList = (this.$common.isArray(data.choseNode) ? data.choseNode : [data.choseNode]).map(m => {
        return {
          ...m,
          name: m.labelPath,
          id: m.value
        }
      });
    },
    closeModal (value) {
      let v = this;
      v.ruleEditModel = false;
      if (value === 1) {
        v.search();
      }
    },
    // 移动后逻辑处理
    tableRowSort (params) {
      if (this.$common.isEmpty(params)) return false;
      const oldIndex = params.oldIndex;
      const newIndex = params.newIndex;
      if (this.$common.isEmpty(oldIndex) || this.$common.isEmpty(newIndex) || oldIndex === newIndex) {
        this.$common.isFunction(params.callBack) && params.callBack(false);
        return false;
      }
      let obj = {};
      let newList = this.$common.copy(this.logisticsData);
      if (oldIndex > newIndex) {
        obj = {
          currentId: newList[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? newList[newIndex - 1].autoRuleId : null // 因为logisticsData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== newList.length - 1) {
          obj.nextId = newList[newIndex].autoRuleId;// 因为logisticsData并没有更新，所以newIndex取的是原来的位置
        }
      } else {
        obj = {
          currentId: newList[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? newList[newIndex].autoRuleId : null // 因为logisticsData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== newList.length - 1) {
          obj.nextId = newList[newIndex + 1].autoRuleId;// 因为logisticsData并没有更新，所以newIndex取的是原来的位置
        }
      }
      this.saveSortInfo(obj).then((val) => {
        this.logisticsData = [];
        this.$common.isFunction(params.callBack) && params.callBack(val);
        if (val) {
          newList[oldIndex].sortIndex = newIndex;
          newList.forEach((row, index) => {
            if (oldIndex > newIndex) {
              if (newIndex <= index && oldIndex > index) {
                row.sortIndex = index + 1;
              }
            } else if (oldIndex < index && newIndex >= index) {
              row.sortIndex = index - 1;
            }
          });
          newList.sort((a, b) => { return a.sortIndex - b.sortIndex });
          this.$nextTick(() => {
            this.logisticsData = newList;
          });
          return;
        }
        this.$nextTick(() => {
          this.logisticsData = newList;
        });
      });
    },
    // 排序保存
    saveSortInfo (obj) {
      return new Promise((resolve) => {
        this.axios.put(api.update_carrierAutoRule, JSON.stringify(obj)).then(response => {
          if (!response || !response.data || response.data.code != 0) return resolve(false);
          this.$Message.success('修改成功');
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      })
    },
    setStatus (row, type) { // 启用  停用
      const autoRuleId = row.autoRuleId;
      let url = api.set_enableAutoRule;
      if (type) {
        url = api.set_disableAutoRule;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${type == 1 ? '停' : '启'}用规则：<span style="color: #f20;">${row.name}</span>`,
        onOk: () => {
          this.axios.put(url + autoRuleId).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.search();
              this.$Message.success('操作成功');
            }
          });
        }
      });
    },
    getCarrierScope () { // 查询物流渠道适用范围列表
      let v = this;
      if (!v.permission.carrierQuery) return;
      v.axios.get(api.get_orderCarrierScope + v.selectWareID).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              n.sortIndex = i;
            });
            v.scopeLoading = false;
            v.scopeData = data;
          } else {
            v.scopeLoading = false;
          }
        }
      });
    },
    editRowData (data) { // 编辑
      let v = this;
      v.rowData = data;
      v.scopeModal = true;
      v.scopeModalStatus = true;
      // 处理数据
      if (data.tagNameList) {
        v.goodsTagList = data.tagNameList;
      }
      if (data.skuList) {
        v.skuList = data.skuList.toString();
      }
      if (data.minShippingFeeIncome) {
        v.carrierShippingMethodParmas.minShippingFeeIncome = data.minShippingFeeIncome;
      }
      if (data.maxShippingFeeIncome) {
        v.carrierShippingMethodParmas.maxShippingFeeIncome = data.maxShippingFeeIncome;
      }
      if (data.maxGoodsQuantity) {
        v.carrierShippingMethodParmas.maxGoodsQuantity = data.maxGoodsQuantity;
      }
      if (data.minGoodsQuantity) {
        v.carrierShippingMethodParmas.minGoodsQuantity = data.minGoodsQuantity;
      }
      if (data.maxPrice) {
        v.carrierShippingMethodParmas.maxPrice = data.maxPrice;
      }
      if (data.minPrice) {
        v.carrierShippingMethodParmas.minPrice = data.minPrice;
      }
      // if (data.orderCarrierScopePlatformList) {
      //   if (v.shopList.length === 0) { // 获取平台/帐号
      //     v.getShopList(1, api.carrierServiceCommon)
      //       .then(result => {
      //         v.setShopGroup(v.shopList, data.orderCarrierScopePlatformList);
      //       });
      //   } else {
      //     v.setShopGroup(v.shopList, data.orderCarrierScopePlatformList);
      //   }
      // }
      v.getModalData(data);
    },
    getModalData (data) { // 获取适用范围Modal所需数据
      let v = this;
      let list = [];
      if (data.orderCarrierScopePlatformList) {
        list = data.orderCarrierScopePlatformList;
      }
      if (v.shopList.length === 0) { // 获取平台/帐号
        v.getShopList(1, api.carrierServiceCommon, null, true).then(result => {
          v.setShopGroup(v.shopList, list);
        });
      } else {
        v.setShopGroup(v.shopList, list);
      }
      v.getProductTagList(api.carrierServiceCommon);// 获取标签列表名称
    },
    setShopGroup (shopList, openList) { // 加载适用平台帐号列表
      let v = this;
      let obj = {};
      let arrObj = {
        title: '全部',
        saleAccountId: 'parent-level-allChild',
        platformId: null,
        children: []
      };
      let platformGroup = v.$store.state.platformGroup;
      if (platformGroup.length > 0) {
        function makePlatformGroup () { // 读可用平台列表
          return new Promise(resolve => {
            for (let i = 0; i < platformGroup.length; i++) {
              if (!obj.hasOwnProperty(platformGroup[i].platformId)) {
                arrObj.children.push({
                  title: platformGroup[i].platformId,
                  platformId: platformGroup[i].platformId,
                  saleAccountId: `parent-level-${platformGroup[i].platformId}`
                });
                obj[platformGroup[i].platformId] = arrObj.children.length - 1;
              }
              if (i === platformGroup.length - 1) {
                resolve(true);
              }
            }
          });
        }
        let checkPlatformId = [];
        function makeRangeShopList () { // 适用平台帐号
          return new Promise(resolve => {
            let parentInfo = {};
            for (let t = 0; t < shopList.length; t++) {
              let item = shopList[t];
              if (obj.hasOwnProperty(item.platformId)) {
                let subItem = {
                  title: item.accountCode || item.account,
                  saleAccountId: item.saleAccountId,
                  platformId: item.platformId
                };
                if (v.$common.isUndefined(arrObj.children[obj[item.platformId]].children)) {
                  v.$set(arrObj.children[obj[item.platformId]], 'children', []);
                }
                arrObj.children[obj[item.platformId]].children.push(subItem);
                (openList || []).forEach(sItem => {
                  if (sItem.platformId === item.platformId && (sItem.saleAccountId === item.saleAccountId || sItem.saleAccountId === null)) {
                    !checkPlatformId.includes(item.saleAccountId) && checkPlatformId.push(item.saleAccountId);
                  }
                  if (sItem.saleAccountId === null) {
                    parentInfo = arrObj.children.find(p => p.platformId === sItem.platformId);
                    if (!v.$common.isEmpty(parentInfo) && !checkPlatformId.includes(parentInfo.saleAccountId)) {
                      checkPlatformId.push(parentInfo.saleAccountId);
                    }
                  }
                });
              }
            }
            resolve(true);
          });
        }

        function setShopAccount () {
          v.shopAccount = [arrObj];
        }

        async function getStartMakeShop () {
          const result = await makePlatformGroup();
          if (result) {
            const mslResult = await makeRangeShopList();
            if (mslResult) {
              await setShopAccount();
              v.shopAccountJson = {};
              v.handShopAccount(v.shopAccount || []);
              checkPlatformId = v.initCheckedShopAccount(v.$common.arrRemoveRepeat(checkPlatformId), v.shopAccountJson);
              v.shopAccountListModel = checkPlatformId;
            }
          }
        }
        getStartMakeShop();
      }
    },
    // 处理平台树对象值
    handShopAccount (data = []) {
      data.forEach(treeNode => {
        this.$set(this.shopAccountJson, treeNode.saleAccountId, treeNode);
        if (!this.$common.isEmpty(treeNode.children)) {
          this.handShopAccount(treeNode.children);
        }
      });
    },
    // 初始化处理选中平台树的值
    initCheckedShopAccount (checkPlatformId, shopAccountJson) {
      let checkId = [];
      const allId = Object.keys(shopAccountJson);
      const isCheckAll = allId.find(f => {
        return f != 'parent-level-allChild' && !checkPlatformId.includes(f);
      });
      if (this.$common.isEmpty(isCheckAll)) return ['parent-level-allChild'];
      let parentLevel = [];
      let lastStage = [];
      checkPlatformId.forEach(val => {
        val.includes('parent-level-') ? parentLevel.push(val) : lastStage.push(val);
      });
      let includesKey = [];
      // 平台只有 2 级，不做递归了
      parentLevel.forEach(key => {
        if (this.$common.isEmpty(shopAccountJson[key]) || this.$common.isEmpty(shopAccountJson[key].children)) return;
        shopAccountJson[key].children.forEach(last => {
          includesKey.push(last.saleAccountId);
        });
      });
      checkId = lastStage.filter(val => !includesKey.includes(val));
      return [...parentLevel, ...checkId];
    },
    makePlatformGroup () {
      let v = this;
      let platformGroup = v.$store.state.platformGroup;
      if (platformGroup === null) {
        v.getPlatformGroup().then(result => {
          if (result) {
            v.platformGroup = v.$store.state.platformGroup;
          }
        });
      } else {
        v.platformGroup = platformGroup;
      }
    },
    makeTreeToArr (treeData = []) { // 试用平台帐号转化
      let arr = [];
      return new Promise(resolve => {
        const allId = Object.keys(this.shopAccountJson).filter(f => f != 'parent-level-allChild');
        if (treeData.includes('parent-level-allChild')) {
          const checkId = allId.filter(f => f.includes('parent-level-'));
          // 肯定没有第三级，不做递归
          arr = checkId.map(id => {
            return {
              platformId: this.shopAccountJson[id].platformId,
              saleAccountIds: null
            }
          });
          resolve([true, arr]);
          return;
        }
        let platformJson = {};
        // 肯定没有第三级，不做递归
        treeData.forEach(val => {
          if (this.$common.isEmpty(this.shopAccountJson[val])) return;
          if (val.includes('parent-level-')) {
            arr.push({
              platformId: this.shopAccountJson[val].platformId,
              saleAccountIds: null
            });
          } else {
            if (platformJson[this.shopAccountJson[val].platformId]) {
              platformJson[this.shopAccountJson[val].platformId].push(val);
            } else {
              platformJson[this.shopAccountJson[val].platformId] = [val];
            }
          }
        });
        Object.keys(platformJson).forEach(key => {
          arr.push({
            platformId: key,
            saleAccountIds: platformJson[key],
          });
        });
        resolve([true, arr]);
      });
    },
    saveScope () {
      let v = this;
      let carrierPlatformList = [];
      v.makeTreeToArr(this.shopAccountListModel).then(result => {
        if (result[0]) {
          carrierPlatformList = result[1];
          v.setNumber();

          let obj = {
            carrierId: v.rowData.carrierId,
            shippingMethodId: v.rowData.shippingMethodId,
            warehouseId: v.selectWareID,
            orderCarrierScopeId: v.rowData.orderCarrierScopeId,
            priceCurrency: 'USD',
            shippingFeeIncomeCurrency: 'USD',
            minShippingFeeIncome: v.carrierShippingMethodParmas.minShippingFeeIncome,
            maxShippingFeeIncome: v.carrierShippingMethodParmas.maxShippingFeeIncome,
            maxGoodsQuantity: v.carrierShippingMethodParmas.maxGoodsQuantity,
            minGoodsQuantity: v.carrierShippingMethodParmas.minGoodsQuantity,
            maxPrice: v.carrierShippingMethodParmas.maxPrice,
            minPrice: v.carrierShippingMethodParmas.minPrice,
            orderCarrierScopePlatformList: carrierPlatformList,
            skuList: v.skuList ? v.skuList.split(',') : [],
            tagNameList: v.goodsTagList.length ? v.goodsTagList : []
          };
          v.axios.put(api.put_orderCarrierScope, obj).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('修改成功');
              v.getCarrierScope();
              v.scopeModal = false;
            } else {
              v.scopeModalLoading = false;
              v.$nextTick(function () {
                v.scopeModalLoading = true;
              });
            }
          }).catch(() => {
            v.scopeModalLoading = false;
            v.$nextTick(function () {
              v.scopeModalLoading = true;
            });
          });
        }
      });
    },
    cancelScope () {
      let v = this;
      v.goodsTagList = [];
      v.skuList = '';
      v.shopAccountListModel = [];
      v.carrierShippingMethodParmas = {
        maxPrice: null,
        minPrice: 0,
        maxShippingFeeIncome: null,
        minShippingFeeIncome: 0,
        minEfficiency: 0,
        maxEfficiency: 0,
        minGoodsQuantity: 0,
        maxGoodsQuantity: null
      };
    },
    // 处理树节点
    accountNormalizer (node) {
      return {
        id: node.saleAccountId,
        label: node.title,
        children: node.children
      }
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.zoneCode,
        label: node.title,
        children: node.children
      }
    },

    // 树选中值改变
    treeSelectCategoryChange (value) {
      this.searchParams.countryCodes = this.getCheckVal(this.countryData, value);
    },
    // 递归获取树选中值和末级
    getCheckVal (arr = [], value, newVal = [], type = false) {
      let checkVal = newVal;
      arr.forEach(item => {
        if (type) {
          item.zoneCode != 'allValue' && checkVal.push(item.zoneCode);
          !this.$common.isEmpty(item.children) && this.getCheckVal(item.children, value, checkVal, true);
        } else {
          if (value.includes(item.zoneCode)) {
            item.zoneCode != 'allValue' && checkVal.push(item.zoneCode);
            !this.$common.isEmpty(item.children) && this.getCheckVal(item.children, value, checkVal, true);
          } else if (!this.$common.isEmpty(item.children)) {
            this.getCheckVal(item.children, value, checkVal);
          }
        }
      });
      return checkVal;
    }
  },
  mounted () {
    document.body.ondrop = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    let todoList = document.getElementById('moveDragContainer');
    if (this.permission.priority) {
      if (!this.$common.isEmpty(todoList)) {
        Sortable.create(todoList, {
          group: {
            name: 'list',
            pull: true
          },
          animation: 120,
          ghostClass: 'placeholder-style',
          onUpdate: (event) => {
            let newIndex = event.newIndex;
            let oldIndex = event.oldIndex;
            let item = this.typeList[oldIndex];
            this.typeList.splice(oldIndex, 1);
            this.typeList.splice(newIndex, 0, item);
            this.saveNewOrderCarrierRule();
          }
        });
      }
      if (this.$refs.dragable && this.$refs.dragable.$children && this.$refs.dragable.$children[1] && this.$refs.dragable.$children[1].$el) {
        if (this.$refs.dragable.$children[1].$el.children && this.$refs.dragable.$children[1].$el.children[1]) {
          sortEl = this.$refs.dragable.$children[1].$el.children[1];
          Sortable.create(sortEl, {
            handle: '.grayColor',
            onEnd: this.tableRowSort
          });
        }
      }
    }
    this.makePlatformGroup();
  }
};
</script>
<style lang="less">
.smartLogisticsRule{
  .setup-item{
    display:inline-block;
    width:140px;
    height:40px;
    border:1px solid #32a6d9;
    background:#32a6d9;
    color:#fff;
    font-weight:700;
    border-radius:5px;
    text-align:center;
    line-height:40px;
  }
}
.formReset {
  display: flex;
  .form-reset-main{
    display: flex;
    flex-wrap: wrap;
    // flex: 100;
    // max-width: calc(100% - 40px);
  }
  .form-reset-button{
    flex: 100;
    padding-top: 12px;
  }
  .ivu-form-item {
    margin-bottom: 0;
    margin-right: 20px;
    width: 280px;
    min-width: 200px;
  }
}

.formReset .ivu-form-item-label {
  padding: 5px 0px 2px 0px;
}
.ware-list-mian{
  &.ivu-select-dropdown{
    padding: 0;
    max-height: 250px;
  }
  .ivu-dropdown-menu{
    padding-bottom: 10px;
  }
  .list-filter-input{
    position: sticky;
    top: 0;
    padding: 10px;
    background: #fff;
    z-index: 10;
  }
}
.modal-order-smart-rule{
  .ivu-modal{
    width: 80% !important;
    min-width: 1000px;
    max-width: 1800px;
  }
  .ivu-modal-body{
    max-height: calc(100vh - 200px);
  }
  .ivu-modal-footer{
    display: none;
    height: 0;
    padding: 0;
  }
}
</style>
