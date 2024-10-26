<template >
  <div :class="wrap" >
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <Form
              ref="pageParams" :model="pageParams" label-position="right" :label-width="100" style="padding-top: 10px" >
            <div class="d-flex justify-conent-start align-items-center" >
              <Row class="wid-all" >
                <Col span="12" >
                  <FormItem label="类型" >
                    <local-buttons
                        :data="tabsData" :value.sync="pageParams.platformId" ></local-buttons >
                  </FormItem >
                </Col >
                <Col span="12" >
                  <FormItem label="状态" >
                    <local-buttons
                        :data="tabsData1" :value.sync="pageParams.dealStatus" ></local-buttons >
                  </FormItem >
                </Col >
              </Row >
            </div >
            <div
                class="d-flex justify-conent-start align-items-start flex-wrap" :class="{none : !moreFilter}" >
              <Row
                  class="wid-all" type="flex" :gutter="25" >
                <Col span="8" >
                  <FormItem
                      label="订单号/交易号" prop="platformId" >
                    <Input
                        class="wid256" :maxlength="50" v-model.trim="pageParams.salesRecordNumber" />
                  </FormItem >
                </Col >
                <Col span="8" >
                  <FormItem
                      label="相关产品" prop="platformId" >
                    <Input
                        class="wid256" :maxlength="50" v-model.trim="pageParams.itemId" />
                  </FormItem >
                </Col >
                <Col span="8" >
                  <FormItem
                      label="买家ID" prop="platformId" >
                    <Input
                        class="wid256" :maxlength="50" v-model.trim="pageParams.buyerAccountId" />
                  </FormItem >
                </Col >
              </Row >

            </div >
            <div
                class="d-flex justify-conent-start align-items-start flex-wrap" :class="{none : !moreFilter}" >
              <Row
                  class="wid-all" type="flex" :gutter="25" >
                <Col span="8" >
                  <FormItem
                      label="自动客服规则" prop="platformId" >
                    <dyt-select
                        class='wid256' v-model="pageParams.ruleSetMatchId" @on-change="getAotuRule" > <Option
                        v-for="(item,index) in rules" :key="index" :value="item.value" >{{ item.label }}</Option>
                    </dyt-select > <dyt-select
                      class='wid256' v-model="pageParams.autoRuleId" > <Option
                      v-for="(item,index) in ruleMessage"
                      :key="index"
                      :value="item.autoRuleId" >{{ item.action }}</Option> </dyt-select >
                  </FormItem >
                </Col >
                <Col span="8" >
                  <FormItem
                      label="发送时间" prop="platformId" >
                    <Date-picker
                      transfer
                        class='wid256'
                        type="datetimerange"
                        @on-clear="resetDate"
                        @on-change="getDateValue"
                        :clearable="clearAble"
                        :options="dateOptions"
                        format="yyyy-MM-dd HH:mm:ss"
                        placement="bottom-end"
                        placeholder="选择日期"
                        :value="payTimeArr" ></Date-picker >
                  </FormItem >
                </Col >
              </Row >

            </div >
            <div class="filterItem filterConfirm" >
              <Button
                  type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search" >查询 </Button >
              <Button
                  @click="reset" size="small" v-once icon="md-refresh" >重置 </Button >
            </div >
          </Form >
        </div >
      </div >
      <div class="moreFilter" >
        <Button
            size="small" @click="toggleMoreFilter" >
          {{ moreFilterMes }}
          <Icon
              :type="moreFilterIcon" size="small" ></Icon >
        </Button >
      </div >
    </div >
    <!--操作-->
    <div class="dataSort grayBg" >
      <Button
          style="margin-left: 20px"
          v-if="getPermission('autoMessage_cancelBatch')"
          @click="batchCancelMt" >批量取消发送 </Button >
    </div >
    <div class="plr10" >
      <Table
          border
          :loading="tableLoading"
          :columns="columns1"
          :data="tableDate"
          @on-selection-change="checkDataMt" ></Table >
      <div class="table-page" >
        <div class="table-page-right" >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              :current="pageParams.pageNum"
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </div >
      </div >
    </div >
    <sliderModal
      v-model="orderDetailsStatus"
      :spinShow="spinShow"
      :styles="sliderObjStyle"
      :buttonVisibile="buttonVisibile"
      v-if="orderDetailsBegin"
      :swStyles="swStyles"
      class="combineDetails slider-model"
    >
      <orderDetails
        :hasEdit=false
        ref="goodReputation"
        :orderDetailsId="orderDetailsId"
        :prefix="'/cs-service'"
        :orderNo.sync="orderNo"
        :timestamp="timestamp"
        @spinLoading="spinLoading"
        @resetSpinShow="resetSpinShow"
        @updateList="getList"
        :buttonVisibile="buttonVisibile"
        inPage="goodReputation"
        :moal-visible.sync="orderDetails"
      />
    </sliderModal >
  </div >
</template>
<style scoped>
.wid256 {
  width: 256px
}

.wid-all {
  width: 100%
}

</style>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #FFF !important;
}

.form-item-label-select {
  margin-top: -10px;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import postSaleStep from '@/views/customerCenter/components/postSaleTreatment/postSaleStep';
import orderSysMixin from '@/components/mixin/orderSys_mixin';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin, orderSysMixin],
  data () {
    let v = this;
    return {
      orderDetailsStatus: false,
      swStyles: {
        left: 0
      },
      orderDetailsId: null,
      orderNo: null,
      timestamp: 0,
      timestamp1: 0,
      buttonVisibile: false,
      sliderObjStyle: null,
      orderDetailsBegin: false,
      ruleMessage: [],
      payTimeArr: [],
      clearAble: true,
      moreFilter: false, // 高级筛选
      moreFilterMes: '更多选项',
      moreFilterIcon: 'md-arrow-dropdown',
      total: 0,
      checkedData: [],
      rules: [
        {
          value: 'UNPAID',
          label: '买家下单之后未付款'
        }, {
          value: 'RISK',
          label: '买家下单之后已付款(资金未到账)'
        }, {
          value: 'PAID',
          label: '订单收到买家付款'
        }, {
          value: 'CHECKED',
          label: '订单核查成功(匹配产品、仓库、物流方式)'
        }
      ],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          title: '订单号',
          render (h, params) {
            return h('a', {
              on: {
                click () {
                  v.showOrder(params);
                }
              }
            }, [
              h('p', {}, params.row.accountCode + '-' + params.row.salesRecordNumber)
            ]);
          }
        }, {
          title: '相关产品',
          key: 'itemId'
        }, {
          title: '买家ID',
          key: 'buyerAccountId'
        }, {
          title: '自动客服规则',
          render (h, params) {
            // : 消息类型(UNPAID:买家下单之后未付款 RISK:买家下单之后已付款(资金未到账) PAID:订单收到买家付款 CHECKED:订单核查成功(匹配产品、仓库、物流方式) ,
            let da = params.row.eventCode;
            let str = da === 'UNPAID' ? '买家下单之后未付款' : da === 'RISK' ? '买家下单之后已付款(资金未到账)' : da === 'PAID'
                                                                                           ? '订单收到买家付款'
                                                                                           : '订单核查成功(匹配产品、仓库、物流方式)';
            return h('span', str);
          }
        }, {
          title: '发送时间',
          render: (h, params) => {
            return h('div', v.getDataToLocalTime(params.row.dealTime, 'fulltime'));
          }
        }, {
          title: '状态',
          render (h, params) {
            let da = params.row.dealStatus;
            let str = da === 1 ? '就绪' : da === 2 ? '处理中' : da === 3 ? '处理成功' : '处理失败';
            return h('span', str);
          }
        }, {
          title: '操作',
          render (h, params) {
            return h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 标记为付款
                    clickFn: () => {
                      v.$Modal.info({
                        title: '自动客服发送记录',
                        okText: '关闭',
                        render: (h) => {
                          return h('Form', {
                            props: {
                              labelWidth: 100,
                              labelPosition: 'right'
                            }
                          }, [
                            h('FormItem', {
                              props: {
                                label: '订单号/交易号' + ':'
                              }
                            }, params.row.orderNo + '/' + params.row.salesRecordNumber), h('FormItem', {
                              props: {
                                label: '买家' + ':'
                              }
                            }, params.row.buyerAccountId), h('FormItem', {
                              props: {
                                label: '发送时间' + ':'
                              }
                            }, v.getDataToLocalTime(params.row.dealTime, 'fulltime')), h('FormItem', {
                              props: {
                                label: '消息体' + ':'
                              }
                            }, params.row.messageContent)
                          ]);
                        }
                      });
                    }
                  },
                  list: [
                    {
                      text: '取消',
                      value: 1,
                      hide: params.row.dealStatus !== 1 && !v.getPermission('autoMessage_cancel'),
                      clickFn: () => {
                        v.axios.put(api.put_cancelMessage + '?autoMessageId=' + params.row.autoMessageId).then(res => {
                          if (res.data.code === 0) {
                            v.$Message.success('操作成功');
                            v.search();
                          }
                        });
                      }
                    }, {
                      text: '重新发送', // 编辑sku
                      value: 2,
                      hide: params.row.dealStatus !== 4 && !v.getPermission('autoMessageHistory_reSend'),
                      clickFn: () => {
                        v.axios.put(api.reSendMessage + '?autoMessageIds=' + params.row.autoMessageId).then(res => {
                          if (res.data.code === 0) {
                            v.$Message.success('操作成功');
                            v.search();
                          }
                        });
                      }
                    }
                  ]
                }
              }
            });
          }
        }
      ],
      tableDate: [],
      tabsData: [
        {
          label: 'ebay',
          value: 'ebay'
        }, {
          label: '速卖通',
          value: 'aliexpress'
        }
      ],
      tabsData1: [
        {
          label: '待发送',
          value: 1
        }, {
          label: '发送失败',
          value: 4
        }
      ],
      pageParams: {
        'buyerAccountId': null, // 买家账号 ,
        'dealStatus': 1, // 消息状态(1:就绪 2:处理中 3:处理成功 4:处理失败) ,
        'dealTimeEnd': null, // 发送结束时间 ,
        'dealTimeStart': null, // 发送启始时间 ,
        'itemId': null, //  相关产品=刊登号 ,
        'platformId': 'ebay', // 平台ID(销售渠道) ,
        'ruleSetMatchId': null, // 规则集匹配顺序号 ,
        'salesRecordNumber': null, // 订单号/交易号 ,
        'pageNum': 1,
        'pageSize': 10
      }
    };
  },
  components: {
    orderDetails,
    postSaleStep
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  methods: {
    showOrder (params) {
      let v = this;
      v.orderDetailsId = params.row.orderNo;
      let date = new Date().getTime();
      v.orderDetailsBegin = true;
      v.$nextTick(function () {
        v.orderDetailsStatus = true;
        v.timestamp = date;
      });
    },
    getAotuRule () {
      let v = this;
      v.axios.post(api.put_autoSendMessageAutoRule, {
        code: v.pageParams.ruleSetMatchId,
        status: 1, // 1启用 0停用 全部-1 ,
        'pageNum': 1,
        'pageSize': 99999
      }).then(res => {
        if (res.data.code === 0) {
          v.ruleMessage = res.data.datas.list;
        }
      });
    },
    batchCancelMt () {
      let v = this;
      let arr = v.checkedData.filter(i => {
        if (i.dealStatus !== 2) {
          return true;
        }
      });
      if (arr.length === 0) {
        v.$Message.error('请选择要取消发送数据，发送中数据不能取消发送');
        return;
      }
      if (v.checkedData.length !== arr.length) {
        v.$Modal.confirm({
          title: '温馨提示',
          content: '存在发送中的消息，发送中消息无法取消发送。是否继续发送状态为发送中之外的消息发生',
          onOk () {
            v.batchCancel('/' + arr.join(','));
          }
        });
      } else {
        v.batchCancel('/' + arr.join(','));
      }
    },
    batchCancel (data) {
      let v = this;
      v.axios.put(api.put_batchCancelMessage + data).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.getList();
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    resetDate () {
      let v = this;
      v.payTimeArr = [];
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (!value[0] || !value[1]) {
          v.pageParams.dealTimeStart = null;
          v.pageParams.dealTimeEnd = null;
        } else {
          let date1 = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          let date2 = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
          v.pageParams.dealTimeStart = date1;
          v.pageParams.dealTimeEnd = date2;
        }
      }
    },
    checkDataMt (data) {
      this.checkedData = data;
    },
    search () {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    changePage (page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.pageParams.pageSize = (+val);
      this.getList();
    },
    reset () {
      for (let key in this.pageParams) {
        this.pageParams[key] = null;
      }
      this.pageParams.platformId = 'ebay';
      this.pageParams.dealStatus = 1;
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 10;
    },
    getList () {
      let v = this;
      if (!v.getPermission('autoMessage_queryAll')) v.gotoError();
      v.loadingTrue();
      v.axios.post(api.get_autoMessage, v.pageParams).then(res => {
        if (res.data.code === 0) {
          let saleAccountIdPos = [];
          if (res.data.datas.list) {
            saleAccountIdPos = res.data.datas.list.map(i => i.saleAccountId);
          }

          async function getData () {
            const Arr = await v.getAccountCode(res.data.datas.list, saleAccountIdPos);
            v.tableDate = Arr;
            v.total = res.data.datas.total;
            v.loadingFalse();
          }

          getData();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    }

  },
  created () {
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
    this.payTimeArr = [start, end];
    this.getDateValue([start, end]);
    this.search();
  },
  watch: {
    domWidth: { // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler (n) {
        let v = this;
        if (n > 1600) {
          v.sliderObjStyle = { width: '1000px' };
        } else if (n > 1200) {
          v.sliderObjStyle = { width: '800px' };
        } else {
          v.sliderObjStyle = { width: '700px' };
        }
      },
      immediate: true
    }
  },
  mounted () {

  }
};
</script >
