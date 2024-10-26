<template>
  <div class="generateBox">
    <Tabs v-model="tabsVal" v-if="workShow === 'list'" @on-click="tabClick">
      <TabPane label="正常拣货单" name="1" class="tabs" v-if="getPermission('wmsPicking_querySalesPicking_generateOrderList')">
      </TabPane>
      <!--      <TabPane label="拣货异常出库单"-->
      <!--               name="3"-->
      <!--               class="tabs"-->
      <!--               v-if="getPermission('wmsPicking_querySalesPicking_generateOrderList')"></TabPane>-->
      <TabPane label="自动拣货波次" name="2" style="background-color: #fff;padding-top: 20px;padding-left: 10px"
        v-if="getPermission('wmsPickingGoods_queryPickingGoodsTask')"></TabPane>
    </Tabs>
    <div v-if="workShow === 'list'">
      <div v-if="tabsVal === '1' || tabsVal === '3'">
        <div class="usersFilter">
          <div class="card-container" style="margin-bottom: 0;">
            <div class="card-content platformParamsSelect" style="margin-top: 0;">
              <Form ref="searchParams" :model="searchParams" :label-width="labelWidth">
                <dyt-filter>
                  <Form-item label="出库单编号：" prop="outListNo">
                    <dyt-input-tag :limit="1" :string="true" type="textarea" v-model="searchParams.outListNo"
                      placeholder="多个出库单请用逗号或回车分隔"></dyt-input-tag>
                  </Form-item>
                  <Form-item label="订单号：" prop="orderNo">
                    <dyt-input-tag :limit="1" :string="true" type="textarea" v-model="searchParams.orderNo"
                      placeholder="多个订单号请用逗号或回车分隔"></dyt-input-tag>
                  </Form-item>
                  <Form-item label="付款时间">
                    <Date-picker style="width:100%" type="datetimerange" @on-clear="resetDate" transfer
                      @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                      placement="bottom-end" placeholder="选择日期" :value="payTimeArr">
                    </Date-picker>
                  </Form-item>
                  <Form-item label="出库单类型：">
                    <Button-group>
                      <Button :type="item.checked ? 'primary' : 'default'" v-for="item in packTypeBtnData"
                        @click="clickPackTypeBtnData(item)" :key="item.value">{{ item.label }}</Button>
                    </Button-group>
                  </Form-item>
                  <FormItem label="店铺：" prop="saleAccountIdList">
                    <dyt-select v-model="searchParams.saleAccountIdList" multiple :max-tag-count="1">
                      <OptionGroup v-for="(ele, index) in saleAccountList" :label="ele.name" :key="index">
                        <Option v-for="(talg) in ele.item" :value="talg.saleAccountId" :label="talg.accountCode"
                          :key="talg.saleAccountId"></Option>
                      </OptionGroup>
                    </dyt-select>
                  </FormItem>
                  <Form-item label="库区组：" prop="warehouseBlockGroupIdList">
                    <dyt-select v-model="searchParams.warehouseBlockGroupIdList" placeholder="请选择拣货库组" multiple
                      :max-tag-count="1" @on-change="warehouseBlockGroupChange">
                      <Option v-for="item in wareAreaGroupList" :value="item.warehouseBlockGroupId" :label="item.name"
                        :key="item.warehouseBlockGroupId" />
                    </dyt-select>
                  </Form-item>
                  <Form-item label="拣货库区：" prop="warehouseBlockIdList">
                    <dyt-select v-model="searchParams.warehouseBlockIdList" placeholder="请选择拣货库区" multiple
                      :max-tag-count="1" @on-change="warehouseBlockChange">
                      <Option v-for="item in warehouseBlockList" :value="item.warehouseBlockId"
                        :label="item.warehouseBlockName" :key="item.warehouseBlockId" />
                    </dyt-select>
                  </Form-item>
                  <Form-item label="拣货库位：" prop="warehouseLocationId">
                    <dyt-select v-model="searchParams.warehouseLocationId" placeholder="请选择拣货库位" :loading="loadingOption"
                      remote :remote-method="getWarehouseLocation" @on-open-change="openWarehouseLocation">
                      <Option v-for="item in warehouseLocationList" :value="item.warehouseLocationId"
                        :label="item.warehouseLocationName" :key="item.warehouseLocationId" />
                    </dyt-select>
                  </Form-item>
                  <Form-item label="来源渠道" prop="sourceList">
                    <dyt-select v-model="searchParams.sourceList" multiple :max-tag-count="1">
                      <Option v-for="(item, index) in sourceList" :key="index" :value="item.enName"
                        :label="item.enName" />
                    </dyt-select>
                  </Form-item>
                  <FormItem label="SKU/数量" prop="skuNumber" v-if="searchParams.packType === 'SS'">
                    <dyt-input v-model="searchParams.sku" />*
                    <dyt-input style="width: 100px" v-model="searchParams.skuNumber" />
                  </FormItem>
                  <FormItem label="品牌" prop="productBrandIds" v-if="searchParams.packType === 'SS'">
                    <dyt-select v-model="searchParams.productBrandIds" :max-tag-count="1" multiple>
                      <Option v-for="(item, index) in productBrandList" :key="index"
                        :class="{ productBrandRed: item.status == 0 }" :label="item.name" :value="item.productBrandId">
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="md-search">查询</Button>
                    <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
        <div class="shipping_method">
          <div class="option_btn" v-if="!upOrDown && tabsVal === '1'" @click="switchBtn">
            <Icon size="20" type="ios-arrow-forward" />
          </div>
          <shippingMethod :upOrDown="upOrDown" @switchOption="switchOption" @selectCheckBox="selectCheckBox"
            :showCheckbox="true" :treeData="treeData"></shippingMethod>
          <div class="content_table" :style="upOrDown ? 'width: 77%' : 'width: 100%'">
            <!--排序-->
            <div class="grayBg clear">
              <div class="fl">
                <div v-if="tabsVal === '1'" class="clear">
                  <Button type="primary" style="margin-right: 10px;float: left"
                    v-if="getPermission('packageInfo_batchInvalidPackage')" @click="voidIssueDocFn">作废出库单 </Button>
                  <!--正常拣货单-->
                  <Buttons type="primary" transfer style="margin-left: 10px;margin-bottom: 10px;float: left"
                    trigger="click" @on-click="clickAssignBatch">
                    <Button type="primary" class="iconbuttons" @click="clickAssignBatch(0)"
                      :disabled="!getPermission('wmsPickingGoods_create_batch')">
                      <Icon type="document-text"></Icon>
                      生成拣货单
                    </Button>
                    <Buttons-menu slot="list">
                      <Buttons-item name="1" v-if="getPermission('wmsPickingGoods_create_all')">生成拣货单（所有结果集）
                      </Buttons-item>
                    </Buttons-menu>
                  </Buttons>
                  <Icon @click="openSetting" class="setting-icon" type="md-settings" size="20"></Icon>
                </div>
                <div v-if="tabsVal === '3'">
                  <Button type="primary" style="margin-right: 10px;"
                    v-if="getPermission('packageInfo_batchInvalidPackage')" @click="voidIssueDocFn">作废出库单 </Button>
                  <Buttons type="primary" transfer style="margin-left: 10px;margin-bottom: 10px;" trigger="click">
                    <Button type="primary" class="iconbuttons" @click="removeAbnormal('checkData')">
                      <Icon type="document-text"></Icon>
                      移除异常标记
                    </Button>
                    <Buttons-menu slot="list">
                      <Buttons-item name="1" @click.native="removeAbnormal('allData')">移除异常标记（所有结果集）
                      </Buttons-item>
                    </Buttons-menu>
                  </Buttons>
                </div>
              </div>
              <div class="fr">
                <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
                </dyt-sortBySelect>
              </div>
            </div>
            <div style="display: flex; margin-top: 15px;">
              <div style="width: 100%">
                <!--正常拣货单-->
                <Table v-if="tabsVal === '1'" border highlight-row ref="selection" :loading="TableLoading"
                  :height="tableHeight" :columns="columns" :data="data" @on-selection-change="tableChange"></Table>
                <!--异常拣货单-->
                <Table v-if="tabsVal === '3'" border ref="selection" :loading="TableLoading" :columns="columns"
                  height="560" :data="data1" @on-selection-change="tableChange"></Table>
                <div class="fr pages">
                  <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize"
                    :page-size-opts="pageSizeOpts" show-total show-sizer show-elevator style="margin-top: 10px"
                    @on-change="pageNumChange" @on-page-size-change="pageSizeChange"></Page>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--生成拣货单-->
        <div>
          <Modal class="createPick" style="width: 600px" v-model="createPickListModel" @on-visible-change='visible'
            title="生成拣货单">
            <createPickList ref="createPickList" :apiParams="apiParams" :apiCondition="searchParams"
              :searchParams="searchDataProp" type="sell" :createType="createType" :clickRowObj="clickRowObj"
              @closeSuccess="closeSuccess" :countLabels=countLabels></createPickList>
          </Modal>
        </div>
      </div>
      <div v-if="tabsVal === '2'">
        <div class="clear" style="padding-bottom: 30px;cursor: pointer">
          <!--rgba(228, 228, 228, :1)深色-->
          <div :style="singleRuleStyle" @click.self="ruleClick(0)" class="fl">
            <span style="font-size: 16px" @click.self="ruleClick(0)">单品规则</span>
            <!--<i-switch v-model='singleRule'>-->
            <!--<span slot="open">开</span>-->
            <!--<span slot="close">关</span>-->
            <!--</i-switch>-->
          </div>
          <div :style="mulRuleStyle" @click.self="ruleClick(1)" class="fl">
            <span style="font-size: 16px" @click.self="ruleClick(1)">多品规则</span>
            <!--<i-switch v-model='doubleRule'>-->
            <!--<span slot="open">开</span>-->
            <!--<span slot="close">关</span>-->
            <!--</i-switch>-->
          </div>
        </div>
        <div>
          <Card :bordered="false" dis-hover>
            <div slot="title">
              合并规则
            </div>
            <pickListRule @backSlt="maxSlt" :update="update"></pickListRule>
          </Card>
          <Card :bordered="false" dis-hover>
            <div slot="title">
              时间设置
            </div>
            <Form class="timeSet">
              <FormItem label="拣货单生成时间">
                <RadioGroup v-model="delayTime">
                  <Radio label="0">
                    <span>固定周期</span> <span>每过<InputNumber size="small" v-model="fixedCycleTime"></InputNumber>
                      小时生成拣货单</span>
                  </Radio>
                  <br />
                  <Radio label="1">
                    <span>每天定时</span> <span>每天<TimePicker format="HH:mm" v-model="v.time" placeholder=""
                        style="width: 80px;margin-right: 5px" size="small" v-for="(v, i) in addInputDataList" :key="i">
                      </TimePicker>
                      <span @click="addTimePicker">
                        <Icon type="plus-circled" style="font-size: 18px"></Icon>
                      </span>
                      <span @click="dltTimePicker">
                        <Icon type="minus-circled" style="font-size: 18px" v-if="addInputDataList.length > 1"></Icon>
                      </span>生成拣货单</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
            </Form>
          </Card>
          <Card :bordered="false" dis-hover>
            <div slot="title">
              是否开启
            </div>
            <Form>
              <FormItem label="启用状态：">
                <i-switch v-model="singleRule">
                  <span slot="open">开</span> <span slot="close">关</span>
                </i-switch>
              </FormItem>
            </Form>
          </Card>
          <!--<Button type='primary' style='margin-left: 20px' @click='saveRule' :disabled='clickRuleType === 0 ? (singleRule ? false : true) : (doubleRule  ? false : true)'>保存</Button>-->
          <Button type="primary" style="margin-left: 20px" @click="saveRule"
            :disabled="!getPermission('wmsPickingGoods_createTask')">{{ clickRuleType === 0 ? '单品规则保存' : '多品规则保存' }}
          </Button>
        </div>
        <div>

        </div>
      </div>
    </div>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="pickingNo" :workType="workType"></sellStockOutDtl>
    </div>
    <Modal v-model="modal1" @on-ok="savePickSetting" title="拣货单生成设置">
      <h5>拣货单生成规则：</h5>
      <pickListRule ref="pickListRef" :show="false" @backSlt="backSltCallback"></pickListRule>
      <h2 class="common_labels">常用标签：</h2>
      <div class="labels_box">
        <Tag v-for="(item, index) in countLabels" :key="index" :name="item" closable @on-close="handleClose">{{ item }}
        </Tag>
        <Input v-model="labels_txt" placeholder="添加标签" style="width: 80px" @on-enter="handleAdd" />
      </div>
    </Modal>
    <!--批量作废包裹-->
    <voidIssueDoc ref="voidIssueDoc" :packageIdList="packageIdList" @getList="searchData"></voidIssueDoc>
  </div>
</template>

<style lang='less' scoped>
.setting-icon {
  margin-left: 25px;
  float: left;
  margin-top: 6px;
  cursor: pointer
}

.common_labels {
  font-size: 12px;
  margin: 25px 0 10px 0;
}

.labels_box {
  display: flex;
  flex-wrap: wrap;

  :deep(.ivu-tag) {
    height: 32px;
    line-height: 32px;
    margin: 0 10px 10px 0;
  }
}

.shipping_method {
  width: 100%;
  position: relative;
  padding-top: 20px;
  display: flex;
  justify-content: space-around;

  .content_table {
    padding: 0 10px 0 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  .option_btn {
    height: 50px;
    background-color: #2b85e4;
    color: #fff;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>

<script>
import api from '@/api/api';
import createPickList from './createPickList';
import sellStockOutDtl from './sellStockOutDtl';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import pickListRule from './pickListRule';
import common from '@/components/mixin/common_mixin';
import voidIssueDoc from '@/views/wms/components/common/voidIssueDoc';
import shippingMethod from '@/components/common/shippingMethod';

export default {
  mixins: [common],
  components: {
    createPickList,
    sellStockOutDtl,
    compoundBtn,
    pickListRule,
    voidIssueDoc,
    shippingMethod
  },
  data() {
    var v = this;
    return {
      treeData: [],
      upOrDown: true,
      platformArr: [],
      saleAccountList: [], // 店铺
      packageIdList: [],
      apiParams: [],
      modal1: false,
      pickListSetting: null,
      searchDataProp: null,
      indeterminateAll: false,
      pageSizeOpts: [10, 20, 30, 50, 500],
      wareId: v.getWarehouseId(),
      clickRowObj: '',
      singleRule: false,
      doubleRule: false,
      fixedCycleTime: 1,
      delayTime: '0',
      searchParams: {
        sku: '',
        skuNumber: '', // sku 数量
        productBrandIds: [], // 货品品牌流水号(品牌Id)
        saleAccountIdList: [], // 店铺流水号
        outListNo: '',
        orderNo: '',
        logisticType: null,
        pageNum: 1,
        pageSize: 50,
        packType: '',
        packageUploadCarrierStatus: null,
        warehouseBlockGroupId: '',
        warehouseBlockId: '',
        warehouseBlockGroupIdList: [],
        warehouseBlockIdList: [],
        warehouseLocationId: '',
        payStartTime: null,
        payEndTime: null,
        source: null,
        sourceList: [],
        cacheClickVal: 'CT', // 排序缓存值
        orderSeq: 'DESC',
      },
      assignList: [
        {
          label: '生成拣货单（所有结果集）',
          value: '1',
          flagCode: ['1'],
          status: '1'
        }
      ],
      tableItemTotal: 0,
      pickingNo: '',
      workShow: 'list',
      workType: 'sellStock',
      apiLogisterList: [],
      tableSltData: [],
      createPickListModel: false, // 控制生成拣货单的模态框
      addInputDataList: [{ time: '' }],
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按物流方式",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      packTypeBtnData: [
        {
          label: '全部',
          value: '',
          checked: true
        }, {
          label: '单品',
          value: 'SS',
          checked: false
        }, {
          label: '多品',
          value: 'MM',
          checked: false
        }, {
          label: '有发货提醒',
          value: 'WW',
          checked: false
        }
      ],
      logisticsStatusList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '未下发',
          check: false,
          value: 0
        }, {
          txt: '下发成功',
          check: false,
          value: 3
        }, {
          txt: '下发失败',
          check: false,
          value: 4
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '出库单编号',
          key: 'pickingNo',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (v.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('a', {
                on: {
                  click: () => {
                    v.pickingNo = params.row.pickingNo;
                    v.workShow = 'detail';
                  }
                }
              }, params.row.pickingNo);
            } else {
              return h('div', params.row.pickingNo);
            }
          }
        }, {
          title: '出库单类型',
          align: 'center',
          width: 100,
          key: 'packageType',
          render: (h, params) => {
            if (params.row.packageType === 'MS' || params.row.packageType === 'MM') {
              return h('div', '多品');
            } else if (params.row.packageType === 'SS' || params.row.packageType === 'SM') {
              return h('div', '单品');
            }
          }
        }, {
          title: '订单号',
          minWidth: 120,
          align: 'center',
          key: 'orderNos',
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
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
          title: '国家/地区',
          width: 100,
          align: 'center',
          key: 'consigneeCountry'
        }, {
          title: 'SKU',
          minWidth: 140,
          align: 'center',
          render(h, params) {
            let skus = params.row.sku;
            if (skus && skus.length > 1) {
              skus.splice(1).push('...');
            }
            return skus ? h('div', {}, skus.map(i => {
              return h('p', {
                style: {
                  color: '#fff',
                  backgroundColor: '#999',
                  marginBottom: '5px'
                }
              }, i);
            })) : '';
          }
        }, {
          title: 'SKU数量',
          minWidth: 110,
          align: 'center',
          key: 'goodsSkuNumber'
        }, {
          title: '物品数量',
          align: 'center',
          minWidth: 100,
          key: 'goodsQuantityNumber'
        }, {
          title: '物流方式',
          align: 'center',
          minWidth: 150,
          key: 'logisticsDealerName',
          render: (h, params) => {
            return h('div', params.row.logisticsDealerName + ' > ' + params.row.logisticsMailName);
          }
        }, {
          title: '拣货库区组',
          align: 'center',
          minWidth: 120,
          key: 'warehouseBlockGroupNames',
          render: (h, params) => {
            if (params.row.warehouseBlockGroupNames) {
              return h('div', params.row.warehouseBlockGroupNames.toString());
            }
          }
        }, {
          title: '拣货库区',
          align: 'center',
          minWidth: 120,
          key: 'warehouseBlockNames',
          render: (h, params) => {
            if (params.row.warehouseBlockNames) {
              return h('div', params.row.warehouseBlockNames.toString());
            }
          }
        }, {
          title: '拣货库位',
          align: 'center',
          minWidth: 120,
          key: 'warehouseLocationNames',
          render: (h, params) => {
            if (params.row.warehouseLocationNames) {
              return h('div', params.row.warehouseLocationNames.toString());
            }
          }
        }, {
          title: '创建时间',
          align: 'center',
          width: 160,
          key: 'createdTime',
          render: (h, params) => {
            return h('span', v.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'h',
          fixed: 'right',
          align: 'center',
          width: 180,
          render: (h, params) => {
            if (v.tabsVal === '1') {
              return h(compoundBtn, {
                props: {
                  dropList: [
                    {
                      label: '查看出库单详情',
                      value: '1',
                      flagCode: ['0', '1'],
                      status: this.getPermission('wmsPicking_querySalesPickingDetail') ? '0' : -1
                    }
                  ],
                  title: '生成拣货单',
                  listenNormal: false,
                  btnType: '',
                  icon: 'md-document',
                  disabled: !this.getPermission('wmsPickingGoods_create_single')
                },
                on: {
                  click: val => {
                    if (!val) {
                      // 生成拣货单
                      this.createType = 'single';
                      this.clickRowObj = params.row;
                      this.createPickListModel = true;
                      this.apiParams = [params.row];
                    } else {
                      v.pickingNo = params.row.pickingNo;
                      v.workShow = 'detail';
                    }
                  }
                }
              }, []);
            } else {
              return h(compoundBtn, {
                props: {
                  dropList: [
                    {
                      label: '查看出库单详情',
                      value: '1',
                      flagCode: ['0', '1'],
                      status: '0'
                    }
                  ],
                  title: '移除异常标记',
                  listenNormal: false,
                  btnType: '',
                  icon: 'md-document'
                },
                on: {
                  click: val => {
                    if (!val) {
                      v.removePicking({
                        packageIdList: [params.row.pickingId]
                      });
                    } else {
                      v.pickingNo = params.row.pickingNo;
                      v.workShow = 'detail';
                    }
                  }
                }
              }, []);
            }
          }
        }
      ],
      data: [],
      data1: [],
      max: 10,
      allowDifferenceLogis: '0',
      allowAlikeLogis: '0',
      tabName: '1',
      createType: '',
      singleRuleStyle: {
        backgroundColor: 'rgba(228, 228, 228, 1)',
        width: '180px',
        height: '54px',
        lineHeight: '54px',
        textAlign: 'center'
      },
      mulRuleStyle: {
        backgroundColor: 'rgba(242, 242, 242, 1)',
        width: '180px',
        height: '54px',
        lineHeight: '54px',
        paddingLeft: '10px',
        textAlign: 'center'
      },
      recordNum: null,
      clickRuleType: 0,
      showHideToggle: true,
      wareAreaGroupList: [], // 库区组下拉列表
      warehouseBlockList: [], // 库区下拉列表
      warehouseLocationList: [], // 库位下拉列表
      loadingOption: false,
      remoteString: '',
      isOpenWarehouseList: false,
      allowDiffWarehouseBlock: '0',
      allowDiffWarehouseBlockGroup: '0',
      update: null,
      tabsVal: '1',
      labels_txt: '',
      countLabels: [],
      clearAble: true,
      payTimeArr: [],
      sourceList: []
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(369);
    }
  },
  created() {
    this.getPlatform();
    this.getProductBrandList();
    this.getAllShipMethod();
    this.searchFn();
    this.getWareAreaGroup();
    this.getWarehouseBlock();
    this.showShippingData(true); // 查询物流方式下拉数据
    this.getTabsVal(); // 判断权限
    this.getEnabledSaleAccounts();
    this.pickingGoodsTags();
    this.getSourceList();
    // 物流方式
    // 查询物流商
    this.axios.get(api.get_logisterList + `?carrierId=${null}`).then(res => {
      if (res.data.code === 0) {
        let data = res.data.datas;
        let processData = data.map(val => {
          return {
            label: val.name,
            value: val.code,
            id: val.code,
            children: [],
            loading: false
          };
        });
        this.apiLogisterList = [
          {
            label: '全部',
            value: '*'
          }, ...processData
        ];
      }
    });
  },
  methods: {
    // 获取来源渠道的数据
    getSourceList() {
      let v = this;
      v.axios.get('/wms-service/erpCommon' + api.get_organizationSource).then(response => {
        if (response.data.code === 0) {
          v.sourceList = response.data.datas;
        }
      });
    },
    getEnabledSaleAccounts() {
      let v = this;
      v.axios.get(api.get_EnabledSaleAccounts + '?merchantId=' + this.$store.state.erpConfig.userInfo.merchantId).then(function (response) {
        if (response.data.code === 0) {
          v.getPlatformGroup().then(data => {
            let saleAccountData = response.data.datas;
            saleAccountData.forEach(i => {
              i.name = i.platformId;
            });
            saleAccountData.forEach(i => {
              data.forEach(j => {
                if (i.platformId === j.platformId) {
                  i.name = j.name;
                }
              });
            });
            var map = {};
            var dest = [];
            for (var i = 0; i < saleAccountData.length; i++) {
              var ai = saleAccountData[i];
              if (!map[ai.platformId]) {
                dest.push({
                  platformId: ai.platformId,
                  item: [ai],
                  name: ai.name
                });
                map[ai.platformId] = ai;
              } else {
                for (var j = 0; j < dest.length; j++) {
                  var dj = dest[j];
                  if (dj.platformId === ai.platformId) {
                    dj.item.push(ai);
                    break;
                  }
                }
              }
            }
            v.saleAccountList = dest;
          }).catch(() => {
            let saleAccountData = response.data.datas;
            var map = {};
            var dest = [];
            for (var i = 0; i < saleAccountData.length; i++) {
              var ai = saleAccountData[i];
              if (!map[ai.platformId]) {
                dest.push({
                  platformId: ai.platformId,
                  item: [ai]
                });
                map[ai.platformId] = ai;
              } else {
                for (var j = 0; j < dest.length; j++) {
                  var dj = dest[j];
                  if (dj.platformId === ai.platformId) {
                    dj.item.push(ai);
                    break;
                  }
                }
              }
            }
            v.saleAccountList = dest;
          });
        }
      });
    },
    getProductBrandList() { // 获取品牌列表(筛选下拉)
      var v = this;
      v.axios.get(api.getAll_productBrand).then(function (response) {
        if (response.data.code === 0) {
          v.productBrandList = response.data.datas;
        }
      });
    },
    voidIssueDocFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageIdList = v.tableSltData.map(i => i.pickingId);
      v.$refs.voidIssueDoc.modal = true;
    },
    visible(open) {
      if (open) {
        this.$refs.createPickList.defaultShow = true;
        this.$refs.createPickList.$refs.pickListRuleOrder.setData(); // 生成拣货单赋值
      }
    },
    savePickSetting() {
      localStorage.setItem('pickListSetting' + this.$store.state.erpConfig.userInfo.userId, JSON.stringify(this.pickListSetting));
      this.$Message.success('保存成功');
    },
    backSltCallback(data) {
      this.pickListSetting = JSON.parse(JSON.stringify(data));
    },
    openSetting() {
      let v = this;
      this.modal1 = true;
      v.$refs.pickListRef.setData(); // 生成拣货单赋值
    },
    removeAbnormal(type) {
      if (type === 'checkData') {
        if (this.tableSltData.length === 0) {
          this.$Message.error('未选择数据');
          return;
        }
        let arr = this.tableSltData.map(i => {
          return i.pickingId;
        });
        this.removePicking({
          packageIdList: arr
        });
      } else if (type === 'allData') {
        let obj = this.paramsFn();
        this.removePicking(obj);
      }
    },
    removePicking(params) {
      let v = this;
      v.axios.put(api.removeExceptSalesPicking, params).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.searchFn1();
        }
      }).catch(() => {
      });
    },
    getAllShipMethod() {
      let v = this;
      let obj = this.paramsFn();
      delete obj.pageSize;
      delete obj.pageNum;
      obj.getLabelStatus = 3;
      obj.pickingStatus = ['2'];
      v.treeData = [];
      v.axios.post(api.get_salesPickingCarriers, obj).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          let data = res.data.datas;
          data.forEach(val => {
            val.title = val.carrierName === null ? '未指定物流商' : val.carrierName;
            val.code = val.carrierId;
            val.carrierId = val.carrierId;
            val.expand = true;
            val.pickingNumber = val.count;
            val.shippingMethods.forEach(val2 => {
              val2.logisticsDealerCode = val.logisticsDealerCode;
              val2.title = val2.shippingMethodName === null ? '未指定邮寄方式' : val2.shippingMethodName;
              val2.code = val2.shippingMethodId;
              val2.expand = true;
              val2.pickingNumber = val2.count;
              val2.logisticsMailCode = val2.shippingMethodId;
            });
            val.children = val.shippingMethods;
          });
          if (data.length !== 0) {
            v.treeData = [
              {
                title: '全部',
                expand: true,
                pickingNumber: 0,
                children: []
              }
            ];
            this.treeData[0].pickingNumber = data.reduce((a, b) => {
              return a + b.count;
            }, 0);
            this.treeData[0].children = data;
          } else {
            v.treeData = [];
          }
        }
      });
    },
    getTabsVal() {
      let v = this;
      v.tabsVal = v.getPermission('wmsPicking_querySalesPicking_generateOrderList')
        ? '1'
        : v.getPermission('wmsPickingGoods_queryPickingGoodsTask') ? '2' : '';
    },
    closeSuccess() {
      this.createPickListModel = false;
      this.searchParams.logisticType = null;
      this.tableSltData = [];
      this.getAllShipMethod();
      this.searchFn();
    },
    ruleClick(num) {
      if (num === 0) {
        this.singleRuleStyle.backgroundColor = 'rgba(228, 228, 228, 1)';
        this.mulRuleStyle.backgroundColor = 'rgba(242, 242, 242, 1)';
        this.queryRuleFn('1');
      } else {
        this.singleRuleStyle.backgroundColor = 'rgba(242, 242, 242, 1)';
        this.mulRuleStyle.backgroundColor = 'rgba(228, 228, 228, 1)';
        this.queryRuleFn('1').then(() => {
          this.queryRuleFn('2');
        });
      }
      if (num !== this.clickRuleType) {
        this.showHideToggle = false;
        setTimeout(() => {
          this.showHideToggle = true;
        }, 50);
      }
      this.clickRuleType = num;
      // 有异常
    },
    clickAssignBatch(val) {
      if (!val) {
        this.createType = 'select';
        this.openCreateList();
        this.apiParams = this.tableSltData;
      } else {
        this.createType = 'all';
        if (this.data.length === 0) {
          this.$Message.warning('暂无数据');
          return;
        }
        this.searchDataProp = this.paramsFn();
        this.apiParams = [];
        this.openCreateList();
      }
    },
    maxSlt(data) {
      // 组件返回的输入框值
      this.max = data.max;
      this.allowDifferenceLogis = data.num2;
      this.allowAlikeLogis = data.num3;
      this.allowDiffWarehouseBlock = data.areaNum; // 库区
      this.allowDiffWarehouseBlockGroup = data.groupNum; // 库区组
    },
    paramsFn() {
      this.searchParams.pageSize = this.getPageSizeCache();
      let obj = {
        warehouseBlockGroupId: this.searchParams.warehouseBlockGroupId,
        warehouseBlockGroupIdList: this.searchParams.warehouseBlockGroupIdList,
        warehouseBlockId: this.searchParams.warehouseBlockId,
        warehouseBlockIdList: this.searchParams.warehouseBlockIdList,
        warehouseLocationId: this.searchParams.warehouseLocationId,
        orderBy: this.searchParams.cacheClickVal || null,
        orderSeq: this.searchParams.orderSeq,
        saleAccountIdList: this.searchParams.saleAccountIdList,
        sku: this.searchParams.sku,
        skuNumber: this.searchParams.skuNumber ? Number(this.searchParams.skuNumber) : null,
        productBrandIds: this.searchParams.productBrandIds, // packageGoodsStatus: this.searchParams.picked === '*' ? null : this.searchParams.picked,
        packageType: this.searchParams.packType === '' || this.searchParams.packType[0] === '*' ? null : [this.searchParams.packType],
        pageNum: this.searchParams.pageNum,
        pageSize: this.searchParams.pageSize,
        pickingNo: this.searchParams.outListNo === '' ? null : this.chEnCsv(this.searchParams.outListNo), // 出库单编号
        pickingStatus: ['2'], // 出库单状态
        // pickingType: this.searchParams.outListType === '' || this.searchParams.outListType[0] === '*' ? ['S1'] : this.searchParams.outListType,
        // referenceNo: this.searchParams.referenceNo === '' ? null : this.chEnCsv(this.searchParams.referenceNo),//参考编号
        warehouseId: [this.wareId],
        orderNos: this.searchParams.orderNo ? this.chEnCsv(this.searchParams.orderNo) : null,
        pickingExtendList: this.searchParams.logisticType,
        packageUploadCarrierStatus: this.searchParams.packageUploadCarrierStatus,
        payStartTime: this.searchParams.payStartTime,
        payEndTime: this.searchParams.payEndTime,
        source: this.searchParams.source,
        sourceList: this.searchParams.sourceList
      };
      return obj;
    },
    chEnCsv(params) {
      // 中英文逗号分隔
      let arr = [];
      if (params.indexOf(',') > -1) {
        let initArr = params.split(',');
        initArr.forEach(val => {
          if (val.indexOf('，') > -1) {
            arr = [...arr, ...val.split('，')];
          } else {
            arr = [...arr, val];
          }
        });
      } else if (params.indexOf('，') > -1) {
        let initArr = params.split('，');
        initArr.forEach(val => {
          if (val.indexOf(',') > -1) {
            arr = [...arr, ...val.split(',')];
          } else {
            arr = [...arr, val];
          }
        });
      } else {
        arr.push(params);
      }
      return arr;
    },
    processData(listData) {
      listData.forEach(val => {
        val.type = val.pickingType === 'S1' ? '销售出库' : val.pickingType === 'O3' ? '其他出库' : val.pickingType === 'O1'
          ? '调拨出库'
          : val.pickingType === 'O2'
            ? '组装加工'
            : '';
        val.status = val.pickingStatus === '0' ? '订单创建' : val.pickingStatus === '1' ? '部分分配' : val.pickingStatus === '2'
          ? '分配完成'
          : val.pickingStatus === '3'
            ? '部分发货'
            : val.pickingStatus === '4'
              ? '完全发货'
              : val.pickingStatus === '5'
                ? '订单完成'
                : '';
        val.pickStatus = val.packageGoodsStatus === '0' ? '未拣货' : val.packageGoodsStatus === '1' ? '已拣货' : '';
      });
      return listData;
    },
    searchFn() {
      // 查询
      let v = this;
      if (v.getPermission('wmsPicking_querySalesPicking_generateOrderList') || this.getPermission('wmsPickingGoods_queryPickingGoodsTask')) {
        let obj = this.paramsFn();
        v.TableLoading = true;
        v.SearchDisabled = true;
        obj.getLabelStatus = 3;
        obj.pickingStatus = ['2'];
        v.axios.post(api.get_sellStockList, obj).then(res => {
          if (res.data.code === 0 && res.data.datas && res.data.datas.list.length > 0) {
            let data = this.processData(res.data.datas.list);
            // 根据pickingNo去找订单前缀
            if (data.length === 0) return;
            let params = data.map(i => i.pickingId);
            v.axios.post(api.get_queryByPackageIds, params).then(response => {
              v.TableLoading = false;
              v.SearchDisabled = false;
              if (data.length !== 0) {
                data.forEach(item2 => {
                  item2.CopyPayTime = this.$uDate.getDateTime(item2.payTime, 'fulltime');
                  item2.CopyPayTime = this.$uDate.dealTime(item2.CopyPayTime);
                  item2.sku = [];
                  if (response.data.datas) {
                    response.data.datas.forEach(j => {
                      if (item2.pickingId === j.packageId) {
                        item2.sku.push(j.sku);
                      }
                    });
                  }
                });
              }
              this.data = data;
              this.tableItemTotal = res.data.datas.total;
            }).catch(() => {
              v.TableLoading = false;
              v.SearchDisabled = false;
            });
          } else {
            this.data = [];
            this.tableItemTotal = 0;
            v.TableLoading = false;
            v.SearchDisabled = false;
          }
        }).catch(() => {
          v.TableLoading = false;
          v.SearchDisabled = false;
        });
      } else {
        v.gotoError(); // 无权限
      }
    },
    searchFn1() {
      let obj = this.paramsFn();
      let v = this;
      obj.pickingExtendList = null;
      v.TableLoading = true;
      v.SearchDisabled = true;
      this.axios.post(api.querySalesPickingExcept, obj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          let data = this.processData(res.data.datas.list);
          // 根据 pickingNo 去找订单前缀
          // let pickingNoStr = data.map(val => val.saleAccountId).join(',');
          if (data.length !== 0) {
            data.forEach(item2 => {
              item2.CopyPayTime = this.$uDate.getDateTime(item2.payTime, 'fulltime');
              item2.CopyPayTime = this.$uDate.dealTime(item2.CopyPayTime);
            });
          }
          this.data1 = data;
          this.tableItemTotal = res.data.datas.total;
        } else {
          this.$Message.warning({
            content: '操作失败',
            duration: 4
          });
        }
      }).catch(() => {
        v.TableLoading = false;
        v.SearchDisabled = false;
      });
    },
    addTimePicker() {
      this.addInputDataList.push({ time: '' });
    },
    dltTimePicker() {
      this.addInputDataList.pop();
    },
    clickPackTypeBtnData(item) {
      this.packTypeBtnData.forEach(function (n) {
        n.checked = item.value === n.value;
      });
      this.searchParams.packType = item.value;
    },
    searchData() {
      // 查询按钮
      if (this.searchParams.packType !== 'SS') {
        // 只有单品才展示sku sku数量 品牌
        this.searchParams.sku = null;
        this.searchParams.skuNumber = null;
        this.searchParams.productBrandIds = null;
      }
      if (this.tabsVal === '1') {
        this.searchParams.pageNum = 1;
        this.searchFn();
        // this.getAllShipMethod()
      } else {
        this.searchParams.pageNum = 1;
        this.searchFn1();
      }
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderSeq = type;
      this.searchParams.cacheClickVal = feild;
      this.searchData();
      if (this.tabsVal === '1') {
        this.getAllShipMethod();
      }
    },
    openCreateList() {
      // 打开生成拣货单模态框
      if (this.createType === 'select') {
        if (this.tableSltData.length === 0) {
          this.$Message.warning({
            content: '请选择要操作的数据',
            duration: 3
          });
          return;
        }
      }
      this.createPickListModel = true;
    },
    tableChange(data) {
      // 表格选择项变化
      this.tableSltData = data;
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      if (this.tabsVal === '1') {
        this.searchFn();
        this.getAllShipMethod();
      } else {
        this.searchFn1();
      }
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      if (this.tabsVal === '1') {
        this.searchFn();
        this.getAllShipMethod();
      } else {
        this.searchFn1();
      }
    },
    timeTranslate(time, timeZoom) {
      // 按照时区处理时间
      let h = +time.split(':')[0];
      let m = time.split(':')[1];
      if (+timeZoom > 0) {
        if (h - +timeZoom >= 0) {
          return h - +timeZoom < 10 ? '0' + String(h - +timeZoom) + ':' + m : h - +timeZoom + ':' + m;
        } else {
          return 24 + h - +timeZoom + ':' + m;
        }
      } else {
        if (h - +timeZoom < 24) {
          return h - +timeZoom < 10 ? '0' + String(h - +timeZoom) + ':' + m : h - +timeZoom + ':' + m;
        } else {
          return h - +timeZoom - 24 + ':' + m;
        }
      }
    },
    backTime(time, timeZoom) {
      let h = +time.split(':')[0];
      let m = time.split(':')[1];
      if (h + +timeZoom > 24) {
        return h + +timeZoom - 24 + ':' + m;
      } else {
        return h + +timeZoom < 10 ? '0' + String(h + +timeZoom) + ':' + m : h + +timeZoom + ':' + m;
      }
    },
    saveRule() {
      let flag = true;
      this.addInputDataList.forEach(val => {
        if (!val.time) {
          flag = false;
        }
      });
      if (this.delayTime === '1' && !flag) {
        this.$Message.warning('请填写时间');
        return;
      }
      let obj = {
        // pickingType: !this.singleRule && !this.doubleRule ? '0' : this.singleRule && !this.doubleRule ? '1'
        //   : !this.singleRule && this.doubleRule ? '2' : this.singleRule && this.doubleRule ? '3' : null,
        //   1 单品开  2 多品开  3单品关 4多品关
        pickingType: this.clickRuleType === 0 && this.singleRule ? '1' : this.clickRuleType === 1 && this.singleRule
          ? '2'
          : this.clickRuleType === 0 && !this.singleRule
            ? '3'
            : this.clickRuleType === 1 && !this.singleRule
              ? '4'
              : '',
        allowDiffLogisticsDealer: this.allowDifferenceLogis,
        allowDiffMailMode: this.allowDifferenceLogis === '1' ? null : this.allowAlikeLogis,
        allowDiffWarehouseBlock: this.allowDiffWarehouseBlock,
        allowDiffWarehouseBlockGroup: this.allowDiffWarehouseBlockGroup,
        maxPickingsNum: this.max,
        hoursOrData: this.delayTime,
        createPickingGoodsTime: this.delayTime === '0'
          ? String(this.fixedCycleTime)
          : this.addInputDataList.map(val => this.timeTranslate(val.time, this.$common.getDefaultTimezoom())).join(','),
        warehouseId: this.wareId
      };
      this.axios.post(api.createTask, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.message);
        } else {
          // this.$Message.warning({
          //   content: res.data.message,
          //   duration: 5
          // });
        }
      });
    },
    tabClick(name) {
      this.tabName = name;
      if (name === '1') {
        this.upOrDown = true;
      } else {
        this.upOrDown = false;
      }
    },
    queryRuleFn(type) {
      if (this.getPermission('wmsPickingGoods_queryPickingGoodsTask') || this.getPermission('wmsPicking_querySalesPicking_generateOrderList')) {
        return new Promise(resolve => {
          this.axios.get(api.queryPickingGoodsTask + '?warehouseId=' + this.wareId + '&pickingType=' + type).then(res => {
            if (res.data.code === 0) {
              if (res.data.datas) {
                var obj = JSON.parse(res.data.datas.taskContent);
              } else {
                this.singleRule = false;
              }
              this.update = obj;
              if (obj) {
                if (obj.pickingType === 'pickingGoodsSingle') {
                  this.singleRule = true;
                } else if (obj.pickingType === 'pickingGoodsMany') {
                  this.singleRule = true;
                } else if (obj.pickingType === 'pickingGoodsSingleClose') {
                  this.singleRule = false;
                } else if (obj.pickingType === 'pickingGoodsManyClose') {
                  this.singleRule = false;
                }
                this.allowDifferenceLogis = obj.allowDiffLogisticsDealer;
                this.allowAlikeLogis = obj.allowDiffMailMode;
                this.allowDiffWarehouseBlock = obj.allowDiffWarehouseBlock;
                this.allowDiffWarehouseBlockGroup = obj.allowDiffWarehouseBlockGroup;
                this.max = obj.maxPickingsNum;
                this.delayTime = obj.hoursOrData;
                if (obj.hoursOrData === '0') {
                  this.fixedCycleTime = Number(obj.createPickingGoodsTime);
                  this.addInputDataList = [{ time: '' }];
                } else {
                  this.fixedCycleTime = null;
                  this.addInputDataList = obj.createPickingGoodsTime.split(',').map(val => ({
                    time: this.backTime(val, this.$common.getDefaultTimezoom())
                  }));
                }
              }
            }
            resolve();
          });
        });
      } else {
        this.gotoError(); // 无权限
      }
    },
    // 获取库区组下拉
    getWareAreaGroup() {
      this.wareAreaGroupList = [];
      this.axios.get(`${api.get_queryEnableBlockGroup}/${this.wareId}`).then(response => {
        if (response.data && response.data.code === 0) {
          this.wareAreaGroupList = response.data.datas || [];
        }
      });
    },
    // 获取库区下拉
    getWarehouseBlock() {
      this.warehouseBlockList = [];
      this.axios.post(`${api.post_queryEnableBlock}/${this.wareId}`, (this.searchParams.warehouseBlockGroupIdList || [])).then(response => {
        if (response.data && response.data.code === 0) {
          this.warehouseBlockList = response.data.datas || [];
        }
      });
    },
    // 库区组改变
    warehouseBlockGroupChange(val) {
      this.$set(this.searchParams, 'warehouseBlockIdList', []); // 清空库区
      this.$set(this.searchParams, 'warehouseLocationId', ''); // 清空库位
      this.$nextTick(() => {
        this.getWarehouseBlock();
      })
    },
    // 拣货库区改变
    warehouseBlockChange(val) {
      this.$set(this.searchParams, 'warehouseLocationId', ''); // 清空库位
    },
    // 获取库位下拉数据
    getWarehouseLocation(name) {
      setTimeout(() => {
        if (this.isOpenWarehouseList && this.$common.isString(name) && !this.$common.isEmpty(name)) {
          this.remoteString = name;
        }
      }, 200);
      this.loadingOption = true;
      this.warehouseLocationList = [];
      this.axios.post(`${api.post_queryBlockLocation}/${this.wareId}`, {
        // 库区组ID列表
        warehouseBlockGroupIdList: this.searchParams.warehouseBlockGroupIdList || [],
        // 库区ID列表
        warehouseBlockIdList: this.searchParams.warehouseBlockIdList || [],
        warehouseBlockLocationName: this.$common.isEmpty(name) ? this.remoteString : name
      }).then(response => {
        this.loadingOption = false;
        if (response.data && response.data.code === 0) {
          this.warehouseLocationList = response.data.datas || [];
        }
      }).catch(() => {
        this.loadingOption = false;
      })
    },
    // 库位展开/收起
    openWarehouseLocation(open) {
      open && this.getWarehouseLocation('');
      this.isOpenWarehouseList = open;
    },
    logisticsChange(value) {
      this.logisticsStatusList.forEach(it => {
        it.check = value === it.value;
      });
      this.searchParams.packageUploadCarrierStatus = value;
    },
    resetDate() {
      let v = this;
      v.searchParams.payStartTime = null;
      v.searchParams.payEndTime = null;
    }, // 获取拣货单标签数据
    pickingGoodsTags() {
      let v = this;
      v.axios.get(api.get_pickingGoodsTags + `?warehouseId=${v.wareId}`).then((response) => {
        if (response.data.code === 0) {
          v.countLabels = response.data.datas;
        }
      });
    }, // 添加标签
    handleAdd() {
      if (this.labels_txt !== '') {
        this.axios.post(api.add_pickingGoodsTags + `?tag=${this.labels_txt}&warehouseId=${this.wareId}`).then((response) => {
          if (response.data.code === 0) {
            this.pickingGoodsTags();
          }
        });
        this.labels_txt = '';
      } else {
        this.$Message.warning({
          content: '标签名不能为空',
          duration: 2
        });
      }
    }, // 删除标签
    handleClose(event, name) {
      this.countLabels.map((item, index) => {
        if (name === item) {
          this.axios.delete(api.delete_pickingGoodsTags + `?tag=${name}&warehouseId=${this.wareId}`).then((response) => {
            if (response.data.code === 0) {
              this.pickingGoodsTags();
            }
          });
        }
      });
    }, // 获取日期返回值
    getDateValue(value) {
      var v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.searchParams.payStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.searchParams.payEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    }, // 选中的邮寄方式
    selectCheckBox(arr) {
      let paramsArr = arr.filter(item => {
        if (item.logisticsMailCode) {
          return item;
        }
      }).map(item => {
        return {
          logisticsMailCode: item.logisticsMailCode
        };
      });
      this.searchParams.logisticType = paramsArr.length > 0 ? paramsArr : null;
      this.searchData();
    }, // 展开与收起邮寄方式
    switchBtn() {
      this.upOrDown = !this.upOrDown;
    },
    switchOption(val) {
      this.upOrDown = val;
    }, // 重置按钮
    reset() {
      let item = {
        value: ''
      };
      this.clickPackTypeBtnData(item);
      this.payTimeArr = [];
      this.$refs['searchParams'].resetFields();
    }
  },
  watch: {
    tabName(newV) {
      if (newV === '2') {
        this.singleRuleStyle.backgroundColor = 'rgba(228, 228, 228, 1)';
        this.mulRuleStyle.backgroundColor = 'rgba(242, 242, 242, 1)';
        this.queryRuleFn('2').then(() => {
          this.queryRuleFn('1');
        });
      }
    },
    tabsVal(newVal) {
      if (newVal === '1') {
        this.searchParams.pageNum = 1;
        this.searchFn();
        this.getAllShipMethod();
      } else if (newVal === '3') {
        this.searchParams.pageNum = 1;
        this.searchFn1();
      }
    }
  }
};
</script>

<style>
.transformArr {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}

.hoverTreeName:hover {
  background-color: #e5e5e5;
}

.ivu-tree .ivu-checkbox-wrapper {
  display: inline-block;
}

.generateBox {
  margin-left: 6px;
  /*background-color: #fff;*/
  height: 95%;
}

.generateBox .ivu-tabs-content {
  height: 100%;
}

.generateBox .ivu-tabs-bar {
  margin-bottom: 0;
  background-color: #fff;
}

.generateBox .grayBg {
  margin-left: 0;
  margin-right: 0;
}

.grayBg {
  margin-top: 0;
}

.generateBox .tabs {
  margin-bottom: 0px;
}

.listBox {
  background-color: #ffffff;
  /*margin-left: 6px;*/
  padding-top: 10px;
}

.queryBtn {
  margin-left: 170px !important;
  margin-bottom: 20px;
}

.timeSet .ivu-form .ivu-form-item-label {
  font-size: 14px;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to

/* .slide-fade-leave-active for below version 2.1.8 */
  {
  transform: translateX(200px);
  opacity: 0;
}

.createPick .ivu-modal-footer {
  display: none;
}

.generateBox .ivu-tabs {
  overflow-y: scroll;
}
</style>
