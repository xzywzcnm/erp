<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <Form-item label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <FormItem label="状态" prop="ebayAccount">
                  <ButtonGroup>
                    <template v-for="(item, index) in statusList">
                      <Button
                        v-if="item.selected"
                        type="primary"
                        @click="selectStatus(index, item.status)"
                        :key="index">{{ item.title }} </Button>
                      <Button
                        v-if="!item.selected"
                        @click="selectStatus(index, item.status)"
                        :key="index">{{ item.title }} </Button>
                    </template>
                  </ButtonGroup>
                </FormItem>
                <Form-item label="发起时间" prop="initiateTime">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="请选择发起时间"
                    v-model="pageParams.initiateTime"
                  />
                </Form-item>
                <FormItem label="平台产品编码" prop="itemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.itemId"></dyt-input>
                </FormItem>
                <FormItem label="cancel ID" prop="requestId">
                  <dyt-input placeholder="请输入cancel ID" v-model.trim="pageParams.requestId"></dyt-input>
                </FormItem>
                <FormItem label="订单号" prop="orderId">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号分隔" v-model="pageParams.orderId"></dyt-input-tag>
                </FormItem>
                <FormItem label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </FormItem>
                <Form-item label="付款时间" prop="payTime">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="请选择付款时间"
                    v-model="pageParams.payTime"
                  />
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="tableControl">
      <Button
        type="primary"
        icon="logo-buffer"
        @click="updateAll"
        v-if="getPermission('ebayCancellation_batchSync')">全部更新 </Button>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table
          ref="ebayCancelOrder"
          highlight-row
          border
          :height="tableHeight"
          :loading="tableLoading"
          :columns="columns"
          :data="tableData" />
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
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <keep-alive>
      <sliderModal
        v-model="orderDetailsStatus"
        :spinShow="spinShow"
        :styles="sliderObjStyle"
        :buttonVisibile="buttonVisibile"
        v-if="orderDetailsBegin"
        :swStyles="swStyles"
        class="combineDetails slider-model">
        <div slot="header">
          <div class="normalPadding">
            <Table
              stripe border :columns="cancelDetailsColumns" :show-header="false" :data="cancelDetailsData"></Table>
          </div>
          <div class="normalPadding">
            <Card :bordered="false">
              <p slot="title">处理过程</p>
              <template v-if="historyJson && historyJson.length > 0">
                <div v-for="(item, index) in historyJson" :key="index" class="d-flex justify-content-start">
                  <span>{{ getDateTime(item.actionDate.value, 'fulltime') }}</span>
                  <span class="normalLMargin">{{ item.activityType }}</span>
                </div>
              </template>
            </Card>
          </div>
          <div class="normalPadding">
            <Card :bordered="false">
              <p slot="title">请在<span class="redColor">{{ responseDue }}</span>前回应 </p>
              <p>
                <RadioGroup v-model="handlerModel">
                  <Radio label="1" v-if="getPermission('ebayCancellation_approve') && getAuth('APPROVAL_PENDING')">
                    <span>接受</span>
                  </Radio>
                  <Radio label="2" v-if="getPermission('ebayCancellation_reject') && getAuth('APPROVAL_PENDING')">
                    <span>拒绝</span>
                  </Radio>
                </RadioGroup>
                <template v-if="handlerModel === '1' && getAuth('APPROVAL_PENDING')">
                  <div class="normalTop">
                    <Checkbox v-model="cancellation">作废订单</Checkbox>
                  </div>
                </template>
                <template v-if="handlerModel === '2'">
                  <div class="normalTop">
                    <div class="d-flex justify-content-start align-items-center">
                      <span style="width: 100px; text-align: center">发货时间：</span>
                      <DatePicker type="datetime" @on-change="selectShipmentDate" style="width: 200px"></DatePicker>
                    </div>
                    <div class="d-flex justify-content-start align-items-center normalTop">
                      <span style="width: 100px; text-align: center">运单号：</span>
                      <dyt-input type="text" v-model.trim="rejectParmas.trackingNumber" style="width: 200px"/>
                    </div>
                  </div>
                </template>
              </p>
            </Card>
          </div>
        </div>
        <div slot="footer">
          <div class="combineButton">
            <Button
              type="primary"
              @click="hanlerDisputes"
              v-if="(getPermission('ebayCancellation_reject') || getPermission('ebayCancellation_approve')) && getAuth('APPROVAL_PENDING')">回应 </Button>
            <Button @click="orderDetailsStatus = !orderDetailsStatus" style="margin-left: 10px">取消 </Button>
          </div>
        </div>
        <orderDetails
          ref="ebayCancelOrder"
          :hasEdit=false
          :orderDetailsId="orderDetailsId"
          :orderRowsDetail="orderRowsDetail"
          :orderNo="orderNo"
          :timestamp="timestamp"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :buttonVisibile="buttonVisibile"
          inPage="dispute"
          :left="left"
          :moal-visible.sync="orderDetailsStatus"
        />
      </sliderModal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";

const prefixCls = 'tongtool-customerCenter-ebayCancelOrder';
export default {
  mixins: [Mixin, orderSys],
  data () {
    let self = this;
    return {
      // 详情数据
      availableOption: [],
      historyJson: null,
      orderNo: null,
      ebayRequestId: null,
      rejectParmas: {
        shipmentDate: null,
        trackingNumber: null
      },
      cancellation: false,
      handlerModel: '1',
      responseDue: null,
      cancelDetailsColumns: [
        {
          title: '',
          key: 'name',
          align: 'right'
        }, {
          title: '',
          key: 'value'
        }
      ],
      cancelDetailsData: [], // 详情数据 end
      pageParamsStatus: false, // ebay订单详情
      timestamp: 0,
      orderDetailsId: null,
      orderRowsDetail: {},
      orderDetailsBegin: false,
      buttonVisibile: false,
      sliderObjStyle: null,
      swStyles: null,
      orderDetailsStatus: false, // ebay  订单详情 end
      columns: [
        {
          title: 'Cancel Id',
          key: 'requestId',
          width: 120,
          align: 'center'
        }, {
          title: '订单号',
          key: 'orderId',
          width: 140,
          align: 'center',
          render: (h, params) => {
            let v = this;
            return h('div', {
              style: {
                color: self.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (self.getPermission('order_detail')) {
                    v.orderNo = params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber;
                    v.showOrder(params);
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber);
          }
        }, {
          title: '买家ID',
          width: 150,
          align: 'center',
          render: (h, params) => {
            if (params.row.orderInfoBo) {
              return h('span', params.row.orderInfoBo.buyerAccountId);
            }
          }
        }, {
          title: '原因',
          key: 'cancelReason',
          align: 'center',
          minWidth: 160
        }, {
          title: '发起时间', // 发起时间
          key: 'initiatesTime',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('span', this.getDateTime(params.row.initiatesTime));
          }
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          width: 160
        }, {
          title: '最近更新情况',
          key: 'status', // 最近更新情况
          width: 180,
          align: 'center'
        }, {
          title: '状态',
          key: 'state', // 状态
          width: 180,
          align: 'center'
        }, {
          title: '最迟响应时间',
          key: 'responseDue',
          align: 'center',
          width: 160,
          render: (h, params) => {
            if (params.row.responseDue) {
              return h('span', this.getDateTime(params.row.responseDue));
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 160,
          render: (h, params) => {
            let v = this;
            return h('div', [
              !self.getPermission('ebayRequest_detail') || h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click () {
                    v.orderNo = params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber;
                    v.showOrder(params);
                  }
                }
              }, '处理'), !self.getPermission('ebayCancellation_sync') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '10px'
                },
                on: {
                  click () {
                    v.syncRequestId(params.row.ebayRequestId);
                  }
                }
              }, '更新')
            ]);
          }
        }
      ],
      tableData: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        requestType: 'CANCEL',
        endTime: null,
        startTime: null,
        itemId: null,
        payTime: [],
        initiateTime: [],
        requestId: null,
        saleAccountIdList: [],
        status: 'active',
        orderId: null,
        buyerAccountId: null
      },
      statusList: [
        {
          selected: true,
          status: 'active',
          title: '未关闭'
        }, {
          selected: false,
          status: 'CLOSED',
          title: '关闭'
        }
      ]
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(290);
    }
  },
  components: {
    orderDetails
  },
  watch: {
    domWidth: { // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler (n) {
        let v = this;
        if (n > 1600) {
          v.sliderObjStyle = { width: '1000px' };
          v.swStyles = {
            width: '560px',
            left: '-560px',
            top: '0',
            height: '100%'
          };
          v.left = 560;
        } else if (n > 1200) {
          v.sliderObjStyle = { width: '800px' };
          v.swStyles = {
            width: '392px',
            left: '-392px',
            top: '0',
            height: '100%'
          };
          v.left = 392;
        } else {
          v.sliderObjStyle = { width: '700px' };
          v.swStyles = {
            width: '322px',
            left: '-322px',
            top: '0',
            height: '100%'
          };
          v.left = 322;
        }
      },
      immediate: true
    },
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('ebayRequest_query') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  },
  methods: {
    getAuth (data) {
      return this.availableOption && this.availableOption.includes(data);
    },
    syncRequestId (requestId) {
      let v = this;
      const obj = {
        url: api.ebay_prefix + requestId + api.set_ebaySync,
        type: 'get'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        }
      });
    },
    updateAll () {
      if (this.$common.isEmpty(this.pageParams.saleAccountIdList)) {
        this.ajaxData({
          url: api.set_batchSyncEbayOrder,
          type: 'get'
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return;
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        });
        return;
      }
      const awaitRes = this.pageParams.saleAccountIdList.map((m) => {
        return () => {
          return new Promise((resolve) => {
            this.ajaxData({
              url: `${api.set_batchSyncEbayOrder}?saleAccountId=${m}`,
              type: 'get'
            }).then(res => {
              if (!res || !res.data || res.data.code != 0) return resolve({ type: 'fail', key: m });
              resolve({ type: 'success', key: m });
            }).catch((err) => {
              console.error(err);
              resolve({ type: 'fail', key: m });
            });
          })
        }
      })
      this.$common.promiseAll(awaitRes).then(resArr => {
        const failLst = resArr.filter(f => f.type == 'fail').map(m => m.key);
        if (this.$common.isEmpty(failLst)) {
          this.pageParamsStatus = true;
          return this.$Message.success('操作成功');
        }
        if (failLst.length != resArr.length) {
          this.pageParamsStatus = true;
          this.$Message.success('部分操作成功');
          // this.$Message.error(`店铺：${failLst.join('、')}操作失败!`);
        }
      });
    },
    hanlerDisputes () { // 回应
      let v = this;
      if (v.handlerModel === '1') {
        const obj = {
          url: api.ebay_prefix + v.ebayRequestId + api.set_ebayApprove + '?invalidOrder=' + v.cancellation,
          type: 'put'
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '2') {
        if (!v.rejectParmas.trackingNumber || v.rejectParmas.trackingNumber === '') {
          v.$Message.error('运单号不能为空');
          return false;
        } else if (!v.rejectParmas.shipmentDate) {
          v.$Message.error('发货时间不能为空');
          return false;
        }
        const obj = {
          url: api.ebay_prefix + v.ebayRequestId + api.set_ebayReject,
          data: v.rejectParmas,
          type: 'post'
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      }
    },
    selectShipmentDate (val) { // 选择日期
      let v = this;
      v.rejectParmas.shipmentDate = v.getUniversalTime(new Date(val).getTime(), 'fulltime');
    },
    resetShipmentDate () { // 重置日期
      let v = this;
      v.rejectParmas.shipmentDate = null;
    },
    showOrder (params) {
      let v = this;
      v.orderDetailsId = params.row.orderInfoBo.customerOrderInfoId;
      this.orderRowsDetail = this.$common.copy(params.row.orderInfoBo);
      v.ebayRequestId = params.row.ebayRequestId;
      v.historyJson = JSON.parse(params.row.responseHistory);
      v.availableOption = params.row.state; // 取消状态去 state
      let date = new Date().getTime();
      v.cancelDetailsData = [
        {
          name: 'Cancel Id',
          value: params.row.requestId
        }, {
          name: '状态',
          value: params.row.state
        }, {
          name: '原因',
          value: params.row.reason || ''
        }, {
          name: '发起时间',
          value: params.row.initiatesTime
        }
      ];
      v.responseDue = v.getDateTime(params.row.responseDue);
      // v.packageRadioModel = '新的包裹';
      // v.combineModel.packageCode = null;
      v.orderDetailsBegin = true;
      v.$nextTick(function () {
        v.orderDetailsStatus = true;
        v.timestamp = date;
      });
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(() => {
        v.$Loading.finish();
        v.getShopList(null, '/cs-service/erpCommon');
      });
    },
    getPageParams () {
      let params = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(params.payTime, true)) {
        params.payStartTime = this.getUniversalTime(new Date(params.payTime[0]).getTime(), 'fulltime');
        params.payEndTime = this.getUniversalTime(new Date(params.payTime[1]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(params.initiateTime, true)) {
        params.startTime = this.getUniversalTime(new Date(params.initiateTime[0]).getTime(), 'fulltime');
        params.endTime = this.getUniversalTime(new Date(params.initiateTime[1]).getTime(), 'fulltime');
      }
      delete params.payTime;
      delete params.initiateTime;
      return params;
    },
    getList () {
      let v = this;
      const obj = {
        url: api.get_cancelList,
        type: 'POST',
        data: this.getPageParams()
      };
      v.loadingTrue();
      v.tableData = [];
      v.ajaxData(obj).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          let saleAccountIdPos = [];
          let list = data.list;
          let pos = [];
          if (data.list !== null || data.length > 0) {
            list.forEach((n, i) => {
              if (n.orderInfoBo) {
                pos.push(n);
                saleAccountIdPos.push(n.saleAccountId);
              }
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              const getData = async () => {
                const Arr = await v.getAccountCode(pos, saleAccountIdPos);
                v.tableData = Arr;
                this.$nextTick(() => {
                  if (this.$refs.ebayCancelOrder) {
                    const dome = this.$refs.ebayCancelOrder.$el;
                    const bodyTop = dome.querySelector('.ivu-table-body').scrollTop;
                    dome.querySelector('.ivu-table-fixed-body').scrollTop = bodyTop;
                  }
                })
              }
              getData();
            }
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.tableData = [];
            v.loadingFalse();
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    reset () {
      this.$refs['pageParams'].resetFields();
    },
    selectStatus (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.status = 'active';
      } else {
        v.pageParams.status = 'CLOSED';
      }
      v.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      // v.pageParamsStatus = true;
    }
  }
};
</script>
