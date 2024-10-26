<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <Row type="flex" :gutter="gutterItem" class="col_margin_bottom">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" class="tooltip_styles_item">
                  <FormItem label="店铺：" prop="saleAccountIdList">
                    <Tooltip placement="top">
                      <Icon size="16" type="md-help-circle"/>
                      <div slot="content">
                        <div style="font-size: 12px;width: 80px;">仅支持美国站</div>
                      </div>
                    </Tooltip>
                    <dytStoreSelect
                      v-model="pageParams.saleAccountIdList"
                      :option-data="walMartShopList"
                      :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                      placeholder="请选择店铺，可输入搜索"
                      input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                    />
                  </FormItem>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                  <FormItem label="退货单号：" prop="returnOrderId">
                    <Input placeholder="请输入" v-model.trim="pageParams.returnOrderId"></Input>
                  </FormItem>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                  <Form-item label="发起时间：">
                    <Date-picker
                      ref="date"
                      type="datetimerange"
                      style="width:100%"
                      @on-clear="resetDate"
                      @on-change="getDateValue"
                      :clearable="true"
                      :transfer="true"
                      format="yyyy-MM-dd"
                      :editable="false"
                      :options="dateOption"
                      placement="bottom-end"
                      placeholder="选择日期"
                      @click.native="nativeClick"
                      :value="launchTimeArr">
                    </Date-picker>
                  </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                  <FormItem label="退货类型：" prop="returnType">
                    <dyt-select v-model="pageParams.returnType" filterable placeholder="全部">
                      <Option
                        v-for="(item,index) in returnTypeList"
                        :key="index"
                        :value="item.value"
                        :label="item.name"
                        :v="item.value">{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                  <FormItem label="退货状态：" prop="returnStatus">
                    <dyt-select v-model="pageParams.returnStatus" filterable placeholder="全部">
                      <Option
                        v-for="(item,index) in returnStatusList"
                        :key="index"
                        :value="item.value"
                        :label="item.name"
                        :v="item.value">{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                  <FormItem label="订单编号：" prop="customerOrderId">
                    <Input placeholder="请输入" v-model.trim="pageParams.customerOrderId"></Input>
                  </FormItem>
                </Col>
              </Row>
              <Row type="flex" justify="space-between" :gutter="gutterItem" class="filter_options_button">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="1">
                  <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button @click="reset" size="small" v-once icon="md-refresh">重置</Button>
                </Col>
                <Col
                  :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" style="text-align: right;">
                  <Button size="small" @click="toggleMoreFilter">{{ moreFilterMes }}
                    <Icon :type="moreFilterIcon" size="small"></Icon>
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!--操作栏-->
    <div class="tableControl">
      <Button type="primary" icon="logo-buffer" @click="updateAll"
        v-if="getPermission('walmartReturns_batchSync')">全部更新</Button>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table
          highlight-row
          border
          max-height="560"
          :loading="tableLoading"
          :columns="tableColumns"
          :data="tableData">
        </Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            :current="curPage"
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray">
          </Page>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const prefixCls = 'tongtool-customerCenter-ebayCancelOrder';
export default {
  name: 'walmartRefundManage',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      launchTimeArr: [],
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 15,
        saleAccountIdList: [], // 平台账号ID
        returnOrderId: '', // 退货单号
        customerOrderId: '', // 订单编号
        initiatesStartTime: null, // 发起开始时间
        initiatesEndTime: null, // 发起结束时间
        returnStatus: null, // 退货状态(全部、INITIATED、DELIVERED、COMPLETED)
        returnType: null // 退货类型(全部、replacement return、regular (refund) return)
      },
      returnTypeList: [
        { name: 'REPLACEMENT', value: 'REPLACEMENT' },
        { name: 'REFUND', value: 'REFUND' }
      ],
      returnStatusList: [
        { name: 'INITIATED', value: 'INITIATED' },
        { name: 'DELIVERED', value: 'DELIVERED' },
        { name: 'COMPLETED', value: 'COMPLETED' }
      ],
      total: 0,
      tableData: [],
      tableColumns: [
        {
          title: '订单编号',
          key: 'customerOrderId',
          align: 'center',
          minWidth: 140
        },
        {
          title: '买家姓名',
          key: 'customerName',
          align: 'center',
          minWidth: 140
        },
        {
          title: '退货单号',
          key: 'returnOrderId',
          align: 'center',
          minWidth: 140
        },
        {
          title: '退货类型',
          key: 'returnType',
          align: 'center',
          minWidth: 140,
          render (h, params) {
            let status = '';
            v.returnTypeList.map((item) => {
              if (item.value === params.row.returnType) {
                status = item.name;
              }
            });
            return h('span', status);
          }
        },
        {
          title: '退货原因',
          key: 'returnReason',
          align: 'center',
          minWidth: 140
        },
        {
          title: '退货金额',
          key: 'returnAmount',
          align: 'center',
          minWidth: 140
        },
        {
          title: '退款货品',
          key: 'refundedGoods',
          align: 'center',
          minWidth: 140,
          render (h, params) {
            let list = params.row.walmartReturnsTransactionList;
            let text = '';
            let goodsList = [];
            if (list) {
              list.map((item) => {
                goodsList.push(item.sku);
              });
              if (goodsList.length > 0) {
                text = goodsList.join('、');
              }
            }
            return h('div', text);
          }
        },
        {
          title: '退货物流跟踪号',
          key: 'carrierTracking',
          align: 'center',
          minWidth: 160,
          render (h, params) {
            let labelImageUrl = params.row.labelImageUrl;
            return h('div', {
              style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }
            }, [
              h('span', {
                style: {
                  cursor: 'pointer',
                  color: '#2D8CF0'
                },
                on: {
                  click: () => {
                    let url = params.row.returnTrackingLink;
                    if (url) {
                      window.open(url, '_blank');
                    }
                  }
                }
              }, params.row.carrierTracking),
              labelImageUrl ? h('Icon', {
                props: {
                  type: 'ios-eye'
                },
                style: {
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#2D8CF0',
                  marginLeft: '5px'
                },
                on: {
                  click: () => {
                    let url = params.row.labelImageUrl;
                    if (url) {
                      window.open(url, '_blank');
                    }
                  }
                }
              }) : ''
            ])
          }
        },
        {
          title: '当前交货状态',
          key: 'currentDeliveryStatus',
          align: 'center',
          minWidth: 140
        },
        {
          title: '退货状态',
          key: 'returnStatus',
          align: 'center',
          minWidth: 140,
          render (h, params) {
            let status = '';
            v.returnStatusList.map((item) => {
              if (item.value === params.row.returnStatus) {
                status = item.name;
              }
            });
            return h('span', status);
          }
        },
        {
          title: '取消退货原因',
          key: 'cancelReturnReason',
          align: 'center',
          minWidth: 140
        },
        {
          title: '发起时间',
          key: 'initiatesTime',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            return h('span', v.getUniversalTime(params.row.initiatesTime, 'fulltime'));
          }
        },
        {
          title: '最后更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            return h('span', v.getUniversalTime(params.row.updatedTime, 'fulltime'));
          }
        },
        {
          title: '退款人/退款时间',
          key: 'updatedBy',
          align: 'center',
          minWidth: 180,
          render (h, params) {
            return h('div', {}, [
              [
                h('p', v.getUserName(params.row.updatedBy)),
                h('p', v.getUniversalTime(params.row.returnTime, 'fulltime'))
              ]
            ]);
          }
        },
        {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 160,
          render: (h, params) => {
            let returnStatus = params.row.returnStatus === 'DELIVERED';
            return returnStatus && v.getPermission('walmartReturns_agree') ? h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                click () {
                  v.refundBtn(params.row)
                }
              }
            }, '同意退款') : '';
          }
        }
      ],
      pageParamsStatus: false,
      walMartShopList: [],
      dateOption: {}
    }
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  activated () {
    this.handerDate();
    this.getWalMartShopList();
    this.getList();
  },
  methods: {
    // 默认查询最近三个月的数据
    handerDate () {
      let v = this;
      let now = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      let startTime = v.getDateTime(start);
      let endTime = v.getDateTime(now);
      v.pageParams.initiatesStartTime = v.getUniversalTime(startTime, 'fulltime');
      v.pageParams.initiatesEndTime = v.getUniversalTime(endTime, 'fulltime');
      v.launchTimeArr = [startTime, endTime];
    },
    // 限制选择的时间
    nativeClick () {
      const target = this.$refs['date'].$refs['pickerPanel']
      const { from, to } = target['rangeState']
      target.handlePickClick = () => {
        const { from, selecting } = target['rangeState']
        if (from && selecting) {
          this.dateOption = {
            disabledDate (value) {
              const startTime = new Date(from)
              const endTime = new Date(from)
              startTime.setDate(from.getDate() - 90)
              endTime.setDate(from.getDate() + 90)
              return !(value >= startTime && value <= endTime) || (value && value.valueOf() > Date.now())
            }
          }
        }
      }
      if (from && !to) {
        this.dateOption = {
          disabledDate (value) {
            const startTime = new Date(from)
            const endTime = new Date(from)
            startTime.setDate(from.getDate() - 90)
            endTime.setDate(from.getDate() + 90)
            return !(value >= startTime && value <= endTime) || (value && value.valueOf() > Date.now())
          }
        }
      } else {
        this.dateOption = {
          disabledDate (value) {
            return value && value.valueOf() > Date.now()
          }
        }
      }
    },
    // 获取沃尔玛平台的店铺账号
    getWalMartShopList () {
      let v = this;
      v.walMartShopList = [];
      let query = {
        platformIds: ['walmart'],
        subsystemCode: 'cs-service'
      };
      let prefix = '/cs-service/erpCommon';
      v.axios.post(prefix + api.get_querySaleAccounts, query).then(response => {
        let data = response.data.datas;
        if (data) {
          v.walMartShopList = data;
        }
      });
    },
    // 重置按钮
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.launchTimeArr = [];
      v.resetDate();
    },
    // 获取日期返回值
    getDateValue (value) {
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] === '' || value[0] === null) return false;
        v.pageParams.initiatesStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.pageParams.initiatesEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate () {
      let v = this;
      v.pageParams.initiatesStartTime = null;
      v.pageParams.initiatesEndTime = null;
    },
    // 全部更新
    updateAll () {
      this.axios.get(api.get_walmartReturns_batchSync).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功!');
          this.pageParamsStatus = true;
        }
      });
    },
    // 获取列表数据
    getList () {
      if (this.getPermission('walmartReturns_list')) {
        this.loadingTrue();
        this.tableData = [];
        this.axios.post(api.post_walmartReturns_list, this.pageParams).then((response) => {
          this.loadingFalse();
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.tableData = data.list || [];
            this.total = data.total;
          }
        });
      } else {
        this.gotoError();
      }
    },
    // 同意退款
    refundBtn (data) {
      let v = this;
      v.$Modal.confirm({
        title: '退款',
        content: `退款金额：${data.currency}  ${data.returnAmount}，你确认进行退款吗？`,
        onOk: () => {
          v.axios.get(api.get_walmartReturns_agree + `${data.walmartReturnsId}/agree`).then((response) => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功!');
              v.pageParamsStatus = true;
            }
          });
        },
        onCancel: () => {
        }
      });
    }
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tooltip_styles_item {
  position: relative;

  :deep(.ivu-tooltip){
    position: absolute;
    left: -70px;
    top: 0;
    z-index: 10;
    cursor: pointer;
  }
}
</style>
