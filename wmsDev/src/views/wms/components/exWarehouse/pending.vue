<style lang="less">
.pendingPage {
  .wayBillStatusError .ivu-tooltip-inner {
    white-space: normal;
    word-wrap: break-word;
  }

  .text-overflow {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
<template>
  <div class="pendingPage">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="80">
            <dyt-filter>
              <Form-item label="买家姓名" prop="buyerName">
                <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
              </Form-item>
              <Form-item label="买家ID" prop="buyerAccountId">
                <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
              </Form-item>
              <Form-item label="SKU" prop="sku">
                <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                  v-model="pageParams.sku"></dyt-input-tag>
              </Form-item>
              <Form-item label="搜索字符" prop="searchValue">
                <dyt-input placeholder="可输入订单号、出库单号、买家ID、买家姓名、SKU" v-model.trim="pageParams.searchValue"></dyt-input>
              </Form-item>
              <FormItem label="物流方式" prop="shippingList">
                <!-- <Cascader transfer v-model="shippingList" :load-data="loadData" @on-change="changeShippingMethod"
                  :data="$store.state.shippingMethodData" filterable change-on-select /> -->
                <dyt-shippingSelect v-model="pageParams.shippingList" @on-change="shippingChange" :loadingChildren="true"
                  placeholder="请选择物流方式" />
              </FormItem>
              <Form-item label="国家/地区" prop="buyerCountryCodeList">
                <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                  multiple placeholder="请选择或输入所在地">
                  <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode"
                    :label="item.enName"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="创建时间">
                <Date-picker type="datetimerange" @on-clear="resetDate" transfer style="width: 100%"
                  @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                  placement="bottom-end" placeholder="选择日期" :value="payTimeArr" />
              </Form-item>
              <Form-item label="订单号" prop="orderNoList">
                <dyt-input-tag :limit="1" type="textarea" placeholder="多个订单号，用逗号或换行分隔"
                  v-model="pageParams.orderNoList"></dyt-input-tag>
              </Form-item>
              <Form-item label="出库单号" prop="packageCodeList">
                <dyt-input-tag :limit="1" type="textarea" placeholder="多个出库单号，用逗号或换行分隔"
                  v-model="pageParams.packageCodeList"></dyt-input-tag>
              </Form-item>
              <FormItem label="物流商类型">
                <local-buttons :data="tabsData" :value.sync="pageParams.carrierType" @btnClick="getList" />
              </FormItem>
              <FormItem label="状态" class="notplatformParamsSelect">
                <Button-group>
                  <template v-for="(item, index) in statusList">
                    <Button v-if="item.selected" type="primary" @click="selectStatus(index, item.status)"
                      :key="item.status">{{ item.title }}</Button>
                    <Button v-if="!item.selected" @click="selectStatus(index, item.status)" :key="item.status">{{
                      item.title
                    }}</Button>
                  </template>
                </Button-group>
              </FormItem>
              <FormItem label="申报" v-if="pageParams.carrierType === 0" class="notplatformParamsSelect">
                <Button-group>
                  <template v-for="(item, index) in declareList">
                    <Button v-if="item.selected" type="primary" @click="selectDeclare(index, item.status)" :key="index">{{
                      item.title }}</Button>
                    <Button v-if="!item.selected" @click="selectDeclare(index, item.status)" :key="index">{{ item.title
                    }}</Button>
                  </template>
                </Button-group>
              </FormItem>
              <FormItem label="分配状态" class="notplatformParamsSelect" v-if="isYms != 1">
                <local-buttons :data="tabsData1" :value.sync="pageParams.pickingStatusList" @btnClick="getList" />
              </FormItem>
              <!-- <Form-item label="货主" v-show="!isCargoOwner()">
                <dyt-select v-model="pageParams.cargoOwnerId">
                  <Option value="_NO_CARGO_OWNER">无货主</Option>
                  <template v-for="item in $store.state.userInfoList">
                    <template v-if="isCargoOwner(item.businessRoleTypeList)">
                      <Option :value="item.userId">{{item.userName}}</Option>
                    </template>
                  </template>
                </dyt-select>
              </Form-item> -->
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="clear">
      <div class="tableControl fl ml10" v-show="!ymsMerchant">
        <Button type="primary" v-if="getPermission('packageInfo_batchInvalidPackage')"
          @click="voidIssueDocFn">作废出库单</Button>
        <span v-if="tableControlStatus">
          <Button type="primary" @click="modifyMailFn" class="ml10"
            v-if="getPermission('packageInfo_batchReplaceShippingMethod')">修改物流方式</Button>
          <!--云仓时，隐藏跳过上传按钮-->
          <Button @click="modifySkipFn" class="ml10" type="primary"
            v-if="pageParams.carrierType !== 2 && getPermission('packageInfo_ignoreShipping') && isYms !== 1">跳过上传</Button>
          <!-- <Button class="mr10" type="primary"
            v-if="getPermission('packageInfo_exportExcelCarrierType') && pageParams.carrierType === 2"
            @click="batchExcelExport">批量导出</Button> -->
          <Buttons type="primary" trigger="click" class="ml10" v-if="pageParams.carrierType === 0"
            @on-click="applyForWayBillHasCondition">
            <Button type="primary" class="iconbuttons" @click="applyForWayBill"
              :disabled="!getPermission('packageInfo_uploadPackage_batch')">
              <Icon type="ios-paper"></Icon>
              申请运单
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item name="1" v-if="getPermission('packageInfo_uploadPackage_all')">申请运单（所有结果集）</Buttons-item>
            </Buttons-menu>
          </Buttons>
          <Buttons type="primary" v-if="pageParams.carrierType === 0" trigger="click"
            @on-click="fillInTheDeclarationHasCondition" class="ml10">
            <Button type="primary" class="iconbuttons" @click="fillInTheDeclaration"
              :disabled="!getPermission('packageDeclare_insert_batch')">
              <span class="icon iconfont icon-tianxie"></span>
              填写申报
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item name="1" v-if="getPermission('packageDeclare_insert_all')">填写申报（所有结果集）</Buttons-item>
            </Buttons-menu>
          </Buttons>
        </span>
        <Dropdown @on-click="exportExcel" class="ml10" v-if="multipleExportPower || allExportPower">
          <Button type="primary">导出<Icon type="md-arrow-dropdown"></Icon></Button>
          <DropdownMenu slot="list">
            <DropdownItem v-if="multipleExportPower" name="1">导出选中数据
            </DropdownItem>
            <DropdownItem v-if="allExportPower" name="2">导出所有结果集
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <span v-if="pageParams.carrierType === 0" class="ml10">上传后立即交运 <i-switch
            :disabled="!getPermission('packageInfo_confirmSetting')" v-model="enableConfirm"
            @on-change="setIssuedLogisticsProvider" :true-value="1" :false-value="0" size="large">
            <span slot="open">ON</span>
            <span slot="close">OFF</span>
          </i-switch></span>
      </div>
      <div class="dataSort fr">
        <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'down', ASC: 'up' }"
          @sortInfo="getSortInfoAndFetch">
        </dyt-sortBySelect>
      </div>
    </div>
    <div class="orderTable normalTop">
      <Table highlight-row border :loading="TableLoading" v-table-scroll="TableLoading" ref="selection"
        :height="tableHeight" :columns="orderColumn" :data="pendingData" @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 填写申报 -->
    <Modal v-model="fillInDeclare" width="900" :mask-closable="maskClosable" :loading="declareModalLoading"
      v-if="fillInDeclareStatus" @on-ok="saveDeclare" @on-cancel="closeDeclare">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            {{ fillInDeclareModel.title }}
          </div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px" v-if="fillInDeclareModel.type === 'all'">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="36"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>
              所有结果集填写申报，系统将符合您当前查询条件的所有订单填写下方的申报信息，如果之前已经存在申报信息，则会被覆盖。
              </Col>
            </Row>
          </div>
          <div class="clear">
            <Poptip placement="bottom-end" width="400" class="fr">
              <Button>
                常用申报信息
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <div slot="content" style="max-height:300px; overflow:auto">
                <Row>
                  <Col :span="12">
                  <Input v-model="declareModel.searchValue" placeholder="输入进行筛选" @on-enter="searchDecalre">
                  <Button slot="append" icon="ios-search" @click="searchDecalre"></Button>
                  </Input>
                  </Col>
                </Row>
                <div class="normalTop">
                  <Table :data="commonDecalreData" @on-row-click="addCommonDeclare" :show-header="declareHeader"
                    highlight-row :loading="TableLoading" border :columns="commonDeclareColumns"></Table>
                </div>
              </div>
            </Poptip>
          </div>
          <div class="normalTop">
            <Form ref="declarePageParams" :model="declarePageParams" :rules="ruleValidate" :label-width="145">
              <Row>
                <Col :span="12">
                <FormItem label="中文申报名" prop="goodsNameCn">
                  <Input v-model="declarePageParams.goodsNameCn" :maxlength="200"></Input>
                </FormItem>
                </Col>
                <Col :span="11" :offset="1">
                <FormItem label="英文申报名" prop="goodsNameEn">
                  <Input v-model="declarePageParams.goodsNameEn" :maxlength="200"></Input>
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="12">
                <FormItem label="重量（单个）" prop="unitWeight">
                  <Input v-model="declarePageParams.unitWeight"></Input>
                </FormItem>
                </Col>
                <Col :span="11" :offset="1">
                <FormItem label="价值（单个）" prop="unitPrice">
                  <Input v-model="declarePageParams.unitPrice"> <Select v-model="declarePageParams.declareCurrency"
                    slot="append" style="width: 70px">
                    <Option value="USD">USD</Option>
                  </Select> </Input>
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="12">
                <FormItem label="海关编码" prop="hsCode">
                  <Input v-model="declarePageParams.hsCode" :maxlength="30"></Input>
                </FormItem>
                </Col>
                <Col :span="6" :offset="1">
                <FormItem label="申报数量" prop="quantity">
                  <Input v-model="declarePageParams.quantity"></Input>
                </FormItem>
                </Col>
                <Col :span="4" :offset="1">
                <Button @click="handleSubmit('declarePageParams')">添加</Button>
                </Col>
              </Row>
              <Table :data="decalreData" highlight-row border :columns="declareColumns"></Table>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 更换物流方式 -->
    <Modal v-model="setMatchStatusModel" width="600" :mask-closable="false" v-if="setMatchStatus"
      @on-ok="setShippingMethod" @on-cancel="resetShippingMethod">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">
            {{ changeShippingMehotdModel.title }}
          </div>
        </div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="margin-top:10px">
            <Row>
              <Col :span="1">
              <Icon type="md-information-circle" color="#2b85e4" size="36"></Icon>
              </Col>
              <Col :span="21" :offset="2">
              <p style="line-height:36px"></p>
              {{ changeShippingMehotdModel.content }}
              </Col>
            </Row>
            <Form class="setAllMarkRead" style="margin-top:10px">
              <Row>
                <Col :span="14">
                <Form-item label="选择修改后物流方式：" :label-width="120">
                  <Cascader transfer :data="$store.state.shippingMethodData" @on-visible-change="showShippingData"
                    v-model="value2" :load-data="loadData" @on-change="getAccount1"></Cascader>
                </Form-item>
                </Col>
                <Col :span="9" :offset="1">
                <Form-item label="帐号：" :label-width="60">
                  <Select v-model="shippingAccountModel">
                    <Option v-for="(item, index) in carrierAccount" v-if="item.carrierAccountId !== null" :key="index"
                      :value="item.carrierAccountId">{{ item.account }}</Option>
                  </Select>
                </Form-item>
                </Col>
              </Row>
            </Form>
            <div class="matchLogisticSetting">
              <h6>物流相关设置</h6>
            </div>
            <Form class="setAllMarkRead" style="margin-top:10px" v-if="shippingMethodModel1.length > 0">
              <Row>
                <Col :span="12" v-for="(item, index) in carrierBaseSetting" :key="index">
                <Form-item :label="item.paramName" :label-width="100">
                  <Radio-group v-model="shippingMethodModel1[index].paramValue" :value="item.paramValue"
                    v-if="item.paramType === 'radio'">
                    <Radio :label="sItem.itemValue" v-for="(sItem, n) in item.dictionarys" :key="n">
                      <span>{{ sItem.itemName }}</span>
                    </Radio>
                  </Radio-group>
                  <Input v-if="item.paramType === 'input'" v-for="(sItem, n) in item.dictionarys" :key="n"
                    v-model="shippingMethodModel1[index].value" :value="sItem.itemValue"></Input>
                  <Checkbox-group v-model="shippingMethodModel1[index].paramValue" v-if="item.paramType === 'checkbox'">
                    <Checkbox v-for="(sItem, n) in item.dictionarys" :key="n" :label="sItem.itemValue">
                      <span>{{ sItem.itemName }}</span>
                    </Checkbox>
                  </Checkbox-group>
                  <Select v-if="item.paramType === 'select'" v-model="shippingMethodModel1[index].paramValue">
                    <Option v-for="(sItem, n) in item.dictionarys" :key="n" :value="sItem.itemValue"> {{ sItem.itemName
                    }} </Option>
                  </Select>
                </Form-item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </Modal>
    <!--批量修改物流方式-->
    <modifyMailingMethod ref="modifyMailingMethod" :packageData="packageData" @getList="search"></modifyMailingMethod>
    <!--批量作废包裹-->
    <voidIssueDoc ref="voidIssueDoc" :packageIdList="packageIdList" @getList="search"></voidIssueDoc>
    <!-- 修改尺寸 -->
    <editSize :modelVisible.sync="editSizeVisible" :detailData="editSizeData" :enableConfirm="enableConfirm"
      @getList="search"></editSize>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import deliveryMixin from '@/components/mixin/delivery_mixin';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import modifyMailingMethod from '@/views/wms/components/common/modifyMailingMethod';
import voidIssueDoc from '@/views/wms/components/common/voidIssueDoc';
import editSize from './editSize';

export default {
  mixins: [Mixin, deliveryMixin],
  components: {
    compoundBtn,
    packageDetails,
    modifyMailingMethod,
    voidIssueDoc,
    editSize
  },
  props: {
    ymsMerchant: {
      default: false
    },
  },
  data() {
    let self = this;
    let v = this;
    const vaildChinese = (rule, value, callback) => {
      var reg = v.$regular.MatchChinese;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入中文'));
      } else {
        callback();
      }
    };
    const vaildEnglish = (rule, value, callback) => {
      var reg = v.$regular.MatchEnglish;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入英文'));
      } else {
        callback();
      }
    };
    const validNum = (rule, value, callback) => {
      var reg = v.$regular.AllNumber;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许数字'));
      } else {
        callback();
      }
    };
    const validatePrice = (rule, value, callback) => {
      let priceReg = v.$regular.hasPriceNum;
      if (!priceReg.test(value)) {
        callback(new Error('只允许是数字'));
      } else {
        callback();
      }
    };
    return {
      packageIdList: [],
      tableSltData: [],
      packageData: [],
      tableControlStatus: true,
      shopList: [],
      platformArr: [], // 详情参数 Start
      packageModel: false,
      packageDetailsStatus: true,
      packageId: null,
      timestamp: null, // 更换物流方式 Start
      shippingMethodModel1: [],
      maskClosable: false,
      setMatchStatus: false,
      setMatchStatusModel: false,
      changeShippingMehotdModel: {
        type: '',
        title: '',
        content: ''
      },
      value2: [], // 物流[mcarrierID,merchantShippingMethodId]
      carrierAccount: [], // 对应物流账号
      carrierBaseSetting: [], // 物流参数配置
      // End
      declareModalLoading: true,
      commonDecalreData: [],
      decalreData: [],
      declareHeader: false,
      commonDeclareColumns: [
        {
          title: '中/英文申报名',
          key: 'name',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'blueColor'
              }, params.row.goodsNameCn), h('div', {
                class: 'redColor'
              }, params.row.goodsNameEn)
            ]);
          }
        }, {
          title: '申报价值（单个）',
          align: 'center',
          key: 'unitPrice'
        }, {
          title: '申报重量（单个）g',
          align: 'center',
          key: 'unitWeight'
        }, {
          title: '海关编码',
          align: 'center',
          key: 'hsCode'
        }
      ],
      ruleValidate: {
        goodsNameCn: [
          {
            validator: vaildChinese,
            trigger: 'blur'
          }
        ],
        goodsNameEn: [
          {
            validator: vaildEnglish,
            trigger: 'blur'
          }
        ],
        unitWeight: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        unitPrice: [
          {
            validator: validatePrice,
            trigger: 'blur'
          }
        ],
        hsCode: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        quantity: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ]
      },
      declareColumns: [
        {
          title: '中/英文申报名',
          key: 'name',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'blueColor'
              }, params.row.goodsNameCn), h('div', {
                class: 'redColor'
              }, params.row.goodsNameEn)
            ]);
          }
        }, {
          title: '申报价值（单个）',
          align: 'center',
          key: 'unitPrice'
        }, {
          title: '申报重量（单个）g',
          align: 'center',
          key: 'unitWeight'
        }, {
          title: '海关编码',
          align: 'center',
          key: 'hsCode'
        }, {
          title: '申报数量',
          align: 'center',
          key: 'declareCurrency',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.decalreData[params.index].quantity,
                precision: 0
              },
              on: {
                input: val => {
                  self.decalreData[params.index].quantity = val;
                },
                blur: val => {
                  let reg = self.$regular.AllNumber;
                  if (reg.test(val)) {
                    self.$Message.error('输入格式有误');
                    self.decalreData[params.index].quantity = 0;
                  }
                }
              }
            });
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            return h('span', {
              class: 'icon iconfont icon-closecircled',
              style: {
                color: '#f00',
                cursor: 'pointer',
                fontSize: '24px'
              },
              on: {
                click: () => {
                  self.delDeclare(params.index);
                }
              }
            });
          }
        }
      ],
      declarePageParams: {
        goodsNameCn: null,
        goodsNameEn: null,
        unitWeight: null,
        unitPrice: null,
        hsCode: null,
        quantity: null,
        declareCurrency: 'USD'
      },
      fillInDeclare: false,
      fillInDeclareStatus: false,
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      fillInDeclareModel: {
        type: null,
        title: '',
        pid: null
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "createdTime",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按下单时间",
          sortField: "salesTime",
          sortType: "up",
        },
      ],
      packageIds: [],
      orderColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          width: 140,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('span', {
                class: 'blueColor cursor underline',
                on: {
                  click: () => {
                    self.$emit('showPackageDetails', params.row, 'detail');
                    // self.showPackageDetails(params.row.packageId);
                  }
                }
              }, params.row.packageCode);
            } else {
              return h('div', params.row.packageCode);
            }
          }
        }, {
          title: '订单号',
          align: 'center',
          key: 'salesRecordNumber',
          width: 140,
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
                // pos.push(
                //   h('div', params.row.accountCode + '-' + n.salesRecordNumber)
                // );
                if (n.accountCode) {
                  pos.push(h('div', n.accountCode + '-' + n.salesRecordNumber));
                } else {
                  pos.push(h('div', n.salesRecordNumber));
                }
              }
              return h('div', pos);
            }
          }
        }, {
          title: '买家ID/姓名',
          key: 'buyerName',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('div', [
              h('div', {
                class: 'blueColor'
              }, params.row.buyerAccountId), h('div', {
                class: 'redColor'
              }, params.row.buyerName)
            ]);
          }
        }, {
          title: '国家/地区',
          align: 'center',
          key: 'buyerCountryCodeList',
          width: 90
        }, {
          title: '物流方式',
          align: 'center',
          key: 'merchantShippingMethodId',
          minWidth: 200,
          render: (h, params) => {
            if (params.row.carrierName === null || params.row.carrierName === '') {
              return '';
            } else {
              return h('div', params.row.carrierName + ' > ' + params.row.carrierShippingMethodName);
            }
          }
        }, {
          title: 'SKU数量',
          align: 'center',
          key: 'skuQuantity',
          width: 90
        }, {
          title: '物品数量',
          align: 'center',
          key: 'productQuantity',
          width: 90
        }, {
          title: '创建时间',
          minWidth: 140,
          align: 'center',
          key: 'createdTime',
          render: (h, params) => {
            return h('span', self.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'trackingNumberStatus',
          width: 100,
          align: 'center',
          render: (h, params) => {
            let d = params.row.trackingNumberStatus;
            let text = '申请失败';
            let icon = 'icon iconfont icon-weijiuxu';
            let iconColor = '#ff3300';
            let reason = params.row.trackingNumberFailReason;
            if (d === 1) {
              text = '待申请';
              icon = 'icon iconfont icon-weijiuxu';
              iconColor = '#444';
            } else if (d === 2) {
              text = '申请中';
              icon = 'icon iconfont icon-shenqingzhong';
              iconColor = '#f00';
            } else if (d === 3) {
              text = '申请成功';
              icon = 'icon iconfont icon-shenqingchenggong';
              iconColor = '#f00';
            }
            if (d === 4) {
              return h('Tooltip', {
                style: {
                  textAlign: 'center',
                  color: iconColor
                },
                class: 'wayBillStatusError',
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: reason
                }
              }, [
                h('div', [
                  h('span', {
                    class: icon
                  }), h('div', text)
                ])
              ]);
            } else {
              return h('div', {
                style: {
                  textAlign: 'center',
                  color: iconColor
                }
              }, [
                h('div', [
                  h('span', {
                    class: icon
                  }), h('div', text)
                ])
              ]);
            }
          }
        }, {
          title: '失败原因',
          width: 140,
          align: 'center',
          key: 'trackingNumberFailReason',
          render(h, params) {
            return h('Tooltip', {
              class: 'wayBillStatusError',
              props: {
                transfer: true,
                maxWidth: 250,
                content: params.row.trackingNumberFailReason
              }
            }, [
              h('span', {
                class: 'text-overflow',
                style: { color: '#f00' }
              }, params.row.trackingNumberFailReason)
            ]);
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 200,
          render: (h, params) => {
            let talg = h('Button', {
              props: {
                disabled: !self.getPermission('wmsPicking_querySalesPickingDetail')
              },
              on: {
                click: () => {
                  self.$emit('showPackageDetails', params.row, 'detail');
                  // self.showPackageDetails(params.row.packageId);
                }
              }
            }, '查看出库单详情');
            let trackingNumberStatus = self.pageParams.trackingNumberStatus;
            if (self.ymsMerchant) {
              return talg;
            } else {
              if (params.row !== undefined && ([1, 4].includes(trackingNumberStatus))) {
                return h(compoundBtn, {
                  props: {
                    dropList: [
                      {
                        label: '申请运单',
                        value: '1',
                        flagCode: ['1'],
                        status: self.getPermission('packageInfo_uploadPackage_single') ? '1' : -1
                      },
                      {
                        label: '填写申报',
                        value: '2',
                        flagCode: ['2'],
                        status: self.getPermission('packageDeclare_insert_single') ? '2' : -1
                      },
                      {
                        label: '修改物流方式',
                        value: '3',
                        flagCode: ['2'],
                        status: self.getPermission('packageInfo_batchReplaceShippingMethod') && params.row.isImport === 1
                          ? '2'
                          : -1
                      },
                      {
                        label: '修改尺寸',
                        value: '4',
                        flagCode: ['2'],
                        status: self.getPermission('packageInfo_modifyDimensions') && self.showSizeOperat && params.row.trackingNumberStatus == 4 ? '2' : -1
                      }
                    ],
                    title: '查看出库单详情',
                    listenNormal: false,
                    btnType: '',
                    icon: 'icon iconfont icon-chakan',
                    disabled: !self.getPermission('wmsPicking_querySalesPickingDetail')
                  },
                  on: {
                    click: val => {
                      if (!val) {
                        // 详情
                        self.$emit('showPackageDetails', params.row, 'detail');
                      } else {
                        if (val === '1') {
                          self.applyForWayBill('single', params.row.packageId);
                        } else if (val === '3') {
                          v.packageData = [params.row].map(i => {
                            return {
                              ...i,
                              pickingNo: i.packageCode,
                              logisticsDealerName: i.carrierName,
                              logisticsMailName: i.carrierShippingMethodName,
                              consigneeCountry: i.buyerCountryCodeList,
                              pickingId: i.packageId
                            };
                          });
                          v.$refs.modifyMailingMethod.modal2 = true;
                          setTimeout(() => {
                            v.packageData = [];
                          }, 100);
                        } else if (val === '4') {
                          self.editSizeData = self.$common.copy(params.row || {});
                          self.editSizeVisible = true;
                        } else {
                          self.fillInTheDeclaration('single', params.row.packageId);
                        }
                      }
                    }
                  }
                }, []);
              } else if (self.pageParams.trackingNumberStatus !== 1) {
                return talg;
              }
            }
          }
        }
      ],
      pendingData: [],
      payTimeArr: [],
      clearAble: true,
      resetStatus: true,
      pageParamsPrototype: null, // 重置查询条件
      // 0:LAPA API对接 1:无对接 2:excel对接 ,
      tabsData: [
        {
          label: 'LAPA API对接',
          value: 0
        }, {
          label: '无对接',
          value: 1
        }, {
          label: 'excel对接',
          value: 2
        }
      ],
      tabsData1: [
        {
          label: '分配成功', // 分配成功
          value: [2]
        }, {
          label: '未分配成功', // 未分配成功
          value: [0, 1, 7]
        }
      ],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        cargoOwnerType: null,
        cargoOwnerId: null,
        carrierType: 0, // 物流商类型 0:通途API对接 1:无对接 2:excel对接
        platformId: null,
        saleAccountIds: [],
        pickingStatusList: ['2'],
        trackingNumberStatus: 1,
        buyerCountryCodeList: [],
        // merchantCarrierId: null,
        // merchantShippingMethodId: null,
        merchantCarrierIdList: [],
        merchantShippingMethodIdList: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        sku: null,
        createdStartTime: null,
        createdEndTime: null,
        orderNoList: [],
        declarationStatus: null,
        orderBy: 'createdTime',
        upDown: 'up',
        searchValue: null, // 搜索内容
        warehouseId: self.getWarehouseId(),
        shippingList: [],
        packageCodeList: [],
      },
      statusList: [
        {
          selected: true,
          status: 1,
          title: '未申请'
        }, {
          selected: false,
          status: 4,
          title: '申请失败'
        }, {
          selected: false,
          status: 2,
          title: '后台申请中'
        }
      ],
      declareList: [
        {
          selected: true,
          status: null,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '申报信息未填写'
        }, {
          selected: false,
          status: -1,
          title: '申报信息已填写'
        }
      ],
      enableConfirm: 0,
      declareModel: {
        pageSize: 100,
        pageNum: 1,
        searchValue: null
      },
      editSizeVisible: false, // 修改尺寸弹框
      editSizeData: {}, // 修改尺寸数据
    };
  },
  watch: {
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(345);
    },
    // 仓库类型=云仓、自营
    showSizeOperat() {
      let warehouseId = this.getWarehouseId();
      let warehouseList = this.$store.state.warehouseList || [];
      let list = warehouseList.filter(k => { return k.warehouseId == warehouseId });
      let wareInfo = list.length ? list[0] : {};
      return wareInfo.isYms == 1 || [0, '0'].includes(wareInfo.warehouseType);
    },
    multipleExportPower() {
      let powerList = ['waitingUpload_export', 'yms_waitingUpload_export'];
      return this.returnPower(powerList);
    },
    allExportPower() {
      let powerList = ['waitingUpload_export_all', 'yms_waitingUpload_export_all'];
      return this.returnPower(powerList);
    },
  },
  methods: {
    returnPower(list) {
      let power = false;
      list.forEach(key => {
        !power && (power = this.getPermission(key));
      })
      return power;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    // batchExcelExport() {
    //   let v = this;
    //   if (v.packageIds.length === 0) {
    //     v.$Message.error('请选择订单');
    //     return false;
    //   }
    //   let isCheck = true;
    //   v.$Modal.confirm({
    //     title: '温馨提示',
    //     render(h, params) {
    //       return h('div', {
    //         style: {
    //           marginTop: '10px'
    //         }
    //       }, [
    //         h('p', {
    //           style: {
    //             marginTop: '10px'
    //           }
    //         }, [
    //           h('span', {
    //             style: {
    //               marginRight: '10px'
    //             }
    //           }, '是否跳过获取面单'), h('i-switch', {
    //             props: {
    //               value: isCheck
    //             },
    //             on: {
    //               'on-change'(value) {
    //                 isCheck = value;
    //               }
    //             }
    //           })
    //         ])
    //       ]);
    //     },
    //     onOk: () => {
    //       let params = '?ignoreGetLabel=' + Number(isCheck) + '&warehouseId=' + v.getWarehouseId();
    //       v.axios.post(api.export_ExcelCarrierType + params, v.packageIds).then(response => {
    //         if (response.data.code === 0) {
    //           v.$Message.success('操作成功');
    //           v.search();
    //         }
    //       });
    //     }
    //   });
    // },
    setIssuedLogisticsProvider(value) {
      this.axios.put(api.set_issuedLogisticsProvider + '?enableConfirm=' + value).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      });
    },
    getIssuedLogisticsProvider() {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.get_issuedLogisticsProvider).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    voidIssueDocFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageIdList = v.tableSltData.map(i => i.packageId);
      v.$refs.voidIssueDoc.modal = true;
    },
    modifySkipFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      let packageIds = v.tableSltData.map(i => i.packageId);
      let isCheck = true;
      v.$Modal.confirm({
        title: '温馨提示',
        render(h, params) {
          return h('div', {
            style: {
              marginTop: '10px'
            }
          }, [
            h('p', {
              style: {
                marginTop: '10px'
              }
            }, '所选出库单将跳过上传物流商环节，操作不可退回，是否确定？'), h('p', {
              style: {
                marginTop: '10px'
              }
            }, [
              h('span', {
                style: {
                  marginRight: '10px'
                }
              }, '是否跳过获取面单'), h('i-switch', {
                props: {
                  value: isCheck
                },
                on: {
                  'on-change'(value) {
                    isCheck = value;
                  }
                }
              })
            ])
          ]);
        },
        onOk: () => {
          let params = '?ignoreGetLabel=' + Number(isCheck);
          v.axios.post(api.update_ignoreShipping + params, packageIds).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.search();
            }
          });
        }
      });
    },
    modifyMailFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageData = v.tableSltData.map(i => {
        return {
          ...i,
          pickingNo: i.packageCode,
          logisticsDealerName: i.carrierName,
          logisticsMailName: i.carrierShippingMethodName,
          consigneeCountry: i.buyerCountryCodeList,
          pickingId: i.packageId
        };
      });
      v.$refs.modifyMailingMethod.modal2 = true;
    },
    startLoading() {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('packageInfo_queryForWaitingUpload') || v.getPermission('packageInfo_queryForTrackingNumberUncatch') || v.getPermission('packageInfo_queryForWaitingGetLabel')
        ? v.getList()
        : v.gotoError()).then(() => { v.getShopList(); v.$Loading.finish(); });
    },
    getList() {
      // 获取分页数据
      let v = this;
      let paramsObj = this.returnRequestParams();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_pendingData, JSON.stringify(paramsObj)).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          let saleAccountIdPos = [];
          let merchantShippingMethodIdPos = [];
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                buyerName: n.buyerName,
                buyerAccountId: n.buyerAccountId,
                buyerCountryCodeList: n.buyerCountryCode,
                packageOrderBoList: n.packageOrderBoList,
                saleAccountId: n.saleAccountId,
                trackingNumberStatus: n.trackingNumberStatus,
                declarationStatus: n.declarationStatus,
                isImport: n.isImport,
                packageCode: n.packageCode,
                merchantShippingMethodId: n.merchantShippingMethodId,
                carrierName: null,
                carrierShippingMethodName: null,
                payTime: n.payTime,
                totalWeight: n.totalWeight,
                skuQuantity: n.skuQuantity,
                productQuantity: n.productQuantity, // accountCode: '',
                packageId: n.packageId,
                createdTime: n.createdTime,
                trackingNumberFailReason: n.trackingNumberFailReason,
                length: n.length,
                width: n.width,
                height: n.height,
                orderShippingId: n.orderShippingId,
              });
              saleAccountIdPos.push(n.saleAccountId);
              merchantShippingMethodIdPos.push(n.merchantShippingMethodId);
            });
            if (saleAccountIdPos.length > 0) {
              // 匹配订单号
              Promise.resolve(v.axios.post(api.queryCarrierShippingName, JSON.stringify(merchantShippingMethodIdPos)).then(response => {
                if (response.data.code === 0) {
                  if (response.data.datas.length > 0) {
                    response.data.datas.forEach((n, i) => {
                      pos.forEach((m, t) => {
                        if (m.merchantShippingMethodId === n.shippingMethodId) {
                          m.carrierName = n.carrierName;
                          m.carrierShippingMethodName = n.carrierShippingMethodName;
                        }
                      });
                    });
                  }
                }
              })).then(() => {
                v.pendingData = pos;
              });
            }
            v.$nextTick(() => {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
              v.loadingFalse();
            });
          } else {
            v.pendingData = [];
            v.$nextTick(() => {
              v.total = 0;
              v.totalPage = 0;
              v.loadingFalse();
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    returnRequestParams() {
      let v = this;
      v.pageParams.pageSize = v.getPageSizeCache();
      if (v.pageParams.carrierType !== 0) {
        v.pageParams.declarationStatus = null; // 非系统对接 申报传全部
      }
      let paramsObj = JSON.parse(JSON.stringify(v.pageParams));
      if (v.pageParams.cargoOwnerId) {
        if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          paramsObj.cargoOwnerType = 0;
          paramsObj.cargoOwnerId = null;
        } else {
          paramsObj.cargoOwnerType = 1;
          paramsObj.cargoOwnerId = v.pageParams.cargoOwnerId;
        }
      } else {
        paramsObj.cargoOwnerType = null;
        paramsObj.cargoOwnerId = null;
      }
      if (this.isYms == 1) {
        paramsObj.pickingStatusList = [0, 1, 7];
      }
      delete paramsObj.shippingList;
      return paramsObj;
    },
    selectStatus(index, status) {
      let v = this;
      if (status === 1 || status === 4) {
        v.tableControlStatus = true;
      } else {
        v.tableControlStatus = false;
      }
      v.pageParams.trackingNumberStatus = status;
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.selectStatus(0, 1);
      v.selectDeclare(0, null);
      v.payTimeArr = [];
      // v.shippingList = [];
      // v.pageParams.merchantCarrierId = null;
      // v.pageParams.merchantShippingMethodId = null;
      v.resetDate();
    },
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    selectDeclare(index, status) {
      let v = this;
      if (index === 0) {
        delete v.pageParams.declarationStatus;
      } else if (index === 1) {
        v.pageParams.declarationStatus = -1;
      } else {
        v.pageParams.declarationStatus = 1;
      }
      v.declareList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    resetDate() {
      let v = this;
      v.pageParams.createdStartTime = '';
      v.pageParams.createdEndTime = '';
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] === null || value[1] === null) return false;
        v.pageParams.createdStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.createdEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    applyForWayBillHasCondition() {
      this.applyForWayBill('all');
    },
    fillInTheDeclarationHasCondition() {
      this.fillInTheDeclaration('all');
    },
    // changeShippingMethodButtonCondition() {
    //   this.changeShippingMethodButton('all');
    // },
    applyForWayBill(type, id) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'all' && !v.pendingData.length) {
        v.$Message.error('暂无数据');
        return false;
      }
      v.$Modal.confirm({
        title: type === 'all' ? '申请运单（所有结果集）' : '申请运单',
        loading: true,
        render: h => {
          return h('div', {
            style: {
              marginTop: '10px'
            }
          }, [
            h('Row', [
              h('Col', {
                props: {
                  span: 1
                }
              }, [
                h('Icon', {
                  props: {
                    type: 'md-information-circle',
                    color: '#2b85e4'
                  },
                  style: {
                    fontSize: '36px'
                  }
                })
              ]), h('Col', {
                props: {
                  span: 21,
                  offset: 2
                }
              }, [
                h('p', type === 'all' ? '所有结果集申请运单，系统将所有符合您当前查询条件的订单下发到物流商。' : type === 'single'
                  ? '确认后，订单将下发到物流商'
                  : '批量申请运单，你所选择的订单将下发到物流商')
              ])
            ])
          ]);
        },
        onOk: () => {
          let obj;
          if (type !== 'all' && type !== 'single') {
            obj = {
              packageIdList: v.packageIds,
              warehouseId: v.getWarehouseId()
            };
          } else if (type === 'single') {
            obj = {
              packageIdList: [id],
              warehouseId: v.getWarehouseId()
            };
          } else {
            obj = v.pageParams;
            if (v.pageParams.cargoOwnerId) {
              if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
                // 无货主
                obj.cargoOwnerType = 0;
                obj.cargoOwnerId = null;
              } else {
                obj.cargoOwnerType = 1;
                obj.cargoOwnerId = v.pageParams.cargoOwnerId;
              }
            } else {
              obj.cargoOwnerType = null;
              obj.cargoOwnerId = null;
            }
          }
          obj.enableConfirm = v.enableConfirm;
          v.axios.put(api.set_uploadPackage, JSON.stringify(obj)).then(response => {
            if (response.data.code === 0) {
              let dataList = response.data.datas;
              if (dataList.length === 0) {
                v.$Message.success('操作成功');
              } else {
                dataList.forEach((n, i) => {
                  v.$Message.error('邮寄方式相关设置有误，请检查邮寄方式');
                });
              }
              setTimeout(() => {
                v.$Modal.remove();
              }, 500);
              v.pageParamsStatus = true;
            }
          });
        }
      });
    },
    fillInTheDeclaration(type, id) {
      let v = this;
      if (v.packageIds.length === 0 && type !== 'all' && type !== 'single') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type === 'all' && !v.pendingData.length) {
        v.$Message.error('暂无数据');
        return false;
      }
      if (type === 'all') {
        v.fillInDeclareModel.title = '填写申报（所有结果集）';
        v.fillInDeclareModel.type = 'all';
      } else if (type === 'single') {
        v.fillInDeclareModel.title = '填写申报';
        v.fillInDeclareModel.type = 'single';
        v.fillInDeclareModel.pid = id;
      } else {
        v.fillInDeclareModel.title = '填写申报';
        v.fillInDeclareModel.type = null;
      }
      v.fillInDeclareStatus = true;
      v.$nextTick(function () {
        v.fillInDeclare = true;
        v.declareModel.searchValue = null;
        v.searchDecalre();
      });
    },
    // changeShippingMethodButton(type) {
    //   let v = this;
    //   if (v.packageIds.length === 0 && type !== 'all') {
    //     v.$Message.error('请选择订单');
    //     return false;
    //   }
    //   if (type === 'all') {
    //     v.changeShippingMehotdModel.title = '更换物流方式（所有结果集）';
    //     v.changeShippingMehotdModel.content = '所有结果集更换物流方式，系统将符合当前查询条件的所有包裹更换到您选择的物流方式，包裹将回到下发物流商菜单重新申请运单。';
    //     v.changeShippingMehotdModel.type = 'all';
    //   } else {
    //     v.changeShippingMehotdModel.type = '';
    //     v.changeShippingMehotdModel.title = '更换物流方式';
    //     v.changeShippingMehotdModel.content = '批量指定物流方式系统将自动将所选中的列表中的订单指定为所选择的物流方式。';
    //   }
    //   v.setMatchStatus = true;
    //   v.$nextTick(function () {
    //     v.setMatchStatusModel = true;
    //   });
    // },
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      let pos = [];
      v.tableSltData = value;
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.packageId);
      })).then(function () {
        v.packageIds = pos;
      });
    },
    showPackageDetails(pid) {
      let v = this;
      let date = new Date().getTime();
      v.packageId = pid;
      v.packageDetailsStatus = true;
      v.$nextTick(function () {
        v.packageModel = true;
        v.timestamp = date;
      });
    },
    // changeShippingMethod(value, data) {
    //   let v = this;
    //   if (value.length === 0) {
    //     v.pageParams.merchantCarrierId = null;
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 1) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = null;
    //   } else if (value.length === 2) {
    //     v.pageParams.merchantCarrierId = value[0];
    //     v.pageParams.merchantShippingMethodId = value[1][0];
    //   }
    //   // v.pageParams.merchantCarrierId = value[0];
    //   // v.pageParams.merchantShippingMethodId = value[1][0];
    // },
    // changeShippingMethodTwo(value, data) {
    //   let v = this;
    //   v.smModel.merchantCarrierId = value[0];
    //   v.smModel.merchantShippingMethodId = value[1];
    // },
    saveDeclare() {
      let v = this;
      let obj;
      if (v.decalreData.length === 0) {
        v.$Message.error('请先添加申报信息');
        v.declareModalLoading = false;
        v.$nextTick(function () {
          v.declareModalLoading = true;
        });
        return false;
      }
      if (v.fillInDeclareModel.type === 'single') {
        obj = {
          packageIdList: [v.fillInDeclareModel.pid],
          packageDeclareList: v.decalreData,
          warehouseId: v.getWarehouseId()
        };
      } else if (v.fillInDeclareModel.type === 'all') {
        obj = Object.assign({}, v.pageParams);
        if (v.pageParams.cargoOwnerId) {
          if (v.pageParams.cargoOwnerId === '_NO_CARGO_OWNER') {
            // 无货主
            obj.cargoOwnerType = 0;
            obj.cargoOwnerId = null;
          } else {
            obj.cargoOwnerType = 1;
            obj.cargoOwnerId = v.pageParams.cargoOwnerId;
          }
        } else {
          obj.cargoOwnerType = null;
          obj.cargoOwnerId = null;
        }
        obj.packageDeclareList = v.decalreData;
      } else {
        obj = {
          packageIdList: v.packageIds,
          packageDeclareList: v.decalreData,
          warehouseId: v.getWarehouseId()
        };
      }
      obj.carrierType = v.pageParams.carrierType;
      v.axios.post(api.add_packageDeclare, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.declareModalLoading = false;
          v.$nextTick(function () {
            v.fillInDeclare = false;
            v.closeDeclare();
            v.packageIds = [];
            v.$refs.selection.selectAll(false);
          });
          v.$Message.success('保存成功');
        } else {
          v.declareModalLoading = false;
          v.$nextTick(function () {
            v.declareModalLoading = true;
          });
        }
      }).catch(() => {
        v.declareModalLoading = false;
        v.$nextTick(function () {
          v.declareModalLoading = true;
        });
      });
    },
    searchDecalre() {
      let v = this;
      v.TableLoading = true;
      v.axios.post(api.get_packageCommonDeclare, JSON.stringify(v.declareModel)).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          v.commonDecalreData = response.data.datas.list;
        }
      });
    },
    addDeclare() {
      let v = this;
      let obj = v.deepCopy(v.declarePageParams);
      if (obj.quantity === null) {
        obj.quantity = 1;
      }
      v.$refs['declarePageParams'].resetFields();
      v.decalreData.push(obj);
    },
    closeDeclare() {
      let v = this;
      v.$refs['declarePageParams'].resetFields();
      v.decalreData = [];
    },
    handleSubmit(name) {
      let v = this;
      v.$refs[name].validate(function (valid) {
        if (valid) {
          v.addDeclare();
        }
      });
    },
    delDeclare(index) {
      let v = this;
      if (v.decalreData.length > 1) {
        v.decalreData.splice(index, 1);
      } else {
        v.decalreData = [];
      }
    },
    addCommonDeclare(value, index) {
      // 添加常用申报
      if (!value.quantity || value.quantity === null) {
        value.quantity = 1;
      }
      this.decalreData.push(value);
    },
    setShippingMethod(type) {
      let v = this;
      let obj;
      if (v.changeShippingMehotdModel.type === '') {
        obj = {
          packageIds: v.packageIds,
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel1,
          carrierAccountId: v.shippingAccountModel
        };
      } else if (v.changeShippingMehotdModel.type === 'all') {
        obj = v.deepCopy(v.pageParams);
        obj.packageIds = v.packageIds;
        obj.updateMerchantCarrierId = v.value2[0];
        obj.updateMerchantShippingMethodId = v.value2[1][0];
        obj.packageCarrierParam = v.shippingMethodModel1;
        obj.carrierAccountId = v.shippingAccountModel;
        delete obj.packageIds;
      } else if (v.changeShippingMehotdModel.type === 'single') {
        obj = {
          packageIds: [v.selectId],
          updateMerchantCarrierId: v.value2[0],
          updateMerchantShippingMethodId: v.value2[1][0],
          packageCarrierParam: v.shippingMethodModel1,
          carrierAccountId: v.shippingAccountModel
        };
      }
      v.axios.post(api.update_moreShippingMethod, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data !== null && data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              let item = data[i];
              if (item.code === 111128) {
                v.$Message.error('请选择物流商帐号');
              } else if (item.code === 111137) {
                v.$Message.error('未指定邮寄方式');
              }
            }
          } else {
            v.$Message.success('操作成功');
          }
          v.pageParamsStatus = true;
          v.resetShippingMethod();
        } else {
          v.resetShippingMethod();
          v.$Message.error('操作失败，请重新尝试');
        }
      }).catch(() => {
        v.resetShippingMethod();
      });
    },
    resetShippingMethod() {
      let v = this;
      v.value2 = [];
      v.shippingAccountModel = [];
      v.carrierAccount = [];
      v.carrierBaseSetting = [];
      v.shippingMethodModel1 = [];
    },
    getAccount1(value, selectedData) {
      let v = this;
      v.carrierAccount = [];
      if (value.length === 0) return false;
      v.shippingMethodModel1 = [];
      v.shippingAccountModel = [];
      v.getCarrierBaseSetting(value[1][0], 'shippingMethodModel1');
      if (value[1][1] !== null) {
        v.carrierAccount = value[1][1];
      }
    },
    exportExcel(name) {
      let temp = {};
      let paramsObj = this.returnRequestParams();
      if (name == 1) {
        if (!this.packageIds.length) {
          this.$Message.warning("请选择导出数据");
          return;
        }
        temp.packageIdList = this.packageIds;
        temp.warehouseId = paramsObj.warehouseId;
      } else {
        temp = paramsObj;
      }
      this.$Spin.show();
      this.axios
        .post(api.exportWaitingApply, temp)
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success("导出成功");
          this.$refs.selection.selectAll(false);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    shippingChange(data) {
      this.pageParams.merchantCarrierIdList = data.carrierId;
      this.pageParams.merchantShippingMethodIdList = data.shippingMethodId;
    }
  },
  created() {
    this.getIssuedLogisticsProvider().then(data => {
      this.enableConfirm = data;
    });
    this.pageParamsPrototype = this.deepCopy(this.pageParams);
    this.startLoading();
    // this.showShippingData(true); // 查询物流方式下拉数据
    // this.getPlatform(); // 查询所有可用平台
  },
  mounted() {
    let v = this;
    setTimeout(v.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
