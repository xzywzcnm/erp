<template>
  <div class="need-evauate">
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformSearch clear">
            <Form
              ref="filterFormRef"
              :model="pageParams"
              label-position="right"
              :label-width="80"
            >
              <dyt-filter :filter-row="1" tableClassName=".page-table-view">
                <Form-item label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="shopList"
                    :replace-option-key="{ value: 'saleAccountId', label: 'accountCode' }"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="订单号" prop="orderNoList">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入订单号,多个用回车或逗号分隔"
                    v-model="pageParams.orderNoList"
                  />
                </Form-item>
                <Form-item label="留评价时间" prop="packageArrivalTime">
                  <Date-picker
                    transfer
                    style="width:100%"
                    type="datetimerange"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placeholder="请选择留评价时间范围"
                    v-model="pageParams.packageArrivalTime"
                  />
                </Form-item>
                <Form-item label="买家账号" prop="buyerNameList">
                  <dyt-input-tag
                    type="textarea"
                    :limit="1"
                    :string="false"
                    placeholder="请输入买家账号,多个用回车或逗号分隔"
                    v-model="pageParams.buyerNameList"
                  />
                </Form-item>
                <Form-item label="付款时间" prop="payTimeRang">
                  <Date-picker
                    transfer
                    style="width:100%"
                    type="datetimerange"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placeholder="请选择付款时间范围"
                    v-model="pageParams.payTimeRang"
                  />
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="getList(true)" :disabled="dataLoading" icon="md-search">查询</Button>
                  <Button class="ml10" v-once icon="md-refresh" @click="resetForm">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <Card shadow class="normalMargin page-table-view">
      <div style="display: flex; margin-bottom: 5px;">
        <div style="flex:50;">
          <Button @click="showMoreDialog" type="primary" icon="ios-keypad" v-if="getPermission('ebayFeedback_batchfeedback')">批量回评</Button>
        </div>
        <div style="flex:50;text-align: right;"></div>
      </div>
      <Table
        :columns="columns"
        :loading="dataLoading"
        highlight-row
        border
        :height="tableHeight"
        :data="tableData"
        @on-selection-change="getSelectValue"
        row-key="id"
      />
      <Page
        :total="total"
        @on-change="changePage"
        show-total
        :disabled="dataLoading"
        :page-size="pageParams.pageSize"
        show-elevator
        :current="curPage"
        show-sizer
        @on-page-size-change="changePageSize"
        placement="top"
        :page-size-opts="pageArray"
      />
    </Card>
    <keep-alive>
      <Modal v-model="replyModel" title="给买家留评价" :mask-closable="false" :width="600" v-if="replyModelStatus" @on-ok="moreReply" :loading="moreLoading">
        <div class="normalMargin">
          <Form ref="formInline" :model="moreParams" label-position="left" :label-width="80">
            <Row type="flex">
              <Radio v-model="isTrue">好评</Radio>
            </Row>
            <Row type="flex" class="normalTop" prop="selectInContent">
              <Checkbox v-model="moreParams.selectInContent">随机从评选模板中挑选评选内容</Checkbox>
            </Row>
            <FormItem :label-width="100" label="选择评价模板" class="normalTop">
              <dyt-select v-model="selectConent" @on-change="changeTemplateContent">
                <Option v-for="item in templateList" :key="item.feedbackTemplateId" :value="item.content">{{ item.name }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem :label-width="100" label="评价内容" class="normalTop" prop="feedbackContent">
              <Input v-model="moreParams.feedbackContent" type="textarea" />
            </FormItem>
          </Form>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <sliderModal v-model="orderDetailsStatus" :spinShow="spinShow" :styles="sliderObjStyle" :buttonVisibile="buttonVisibile" v-if="orderDetailsBegin" :swStyles="swStyles" class="combineDetails slider-model">
        <div slot="header">
          <div class="normalPadding" v-if="evaluateRow">
            <Card shadow>
              <Row type="flex">
                销售号：{{ evaluateRow.accountCode + '-' + evaluateRow.salesRecordNumber }}
              </Row>
              <Row type="flex" class="normalTop">
                Item：{{ evaluateRow.itemId }} * {{ evaluateRow.quantity }}
              </Row>
              <Row type="flex" class="normalTop" v-if="!evaluateRow.sellerFirstTime">
                <template>
                  <Row type="flex" :gutter="10">
                    <Col>
                    评价内容：
                    </Col>
                    <Col>
                    {{ evaluateRow.buyerFeedbackContent }}
                    </Col>
                  </Row>
                </template>
              </Row>
              <!--<Row type="flex" class="normalTop" v-if="!evaluateRow.sellerFirstTime">
                给买家发送信息
              </Row>
              <Row type="flex" class="normalTop" v-if="!evaluateRow.sellerFirstTime">
                <Input type="textarea" v-model.trim="replyText" />
              </Row>-->
              <template v-if="evaluateRow.sellerFirstTime">
                <Scroll :on-reach-bottom="handleReachBottom" height="200" class="normalTop">
                  <template v-for="(item, index) in csmesList">
                    <div v-if="item.sender !== evaluateRow.buyerName" :key="index">
                      <div class="csUserInfo flexBox flexEnd">
                        <span class="csSenderName normalRMargin">{{ item.sender }}</span>
                        <span>{{ getDataToLocalTime(item.createdTime, 'fulltime') }}</span>
                      </div>
                      <div class="csContent csUserContent flexBox flexEnd normalRMargin">
                        <Card dis-hover style="margin:4px 0 16px 0; display: inline-block" class="greenBgColor tongtool-emoji">
                          <div v-html="makeCsContent(item.messageBody.messageContent.replace(/\r\n|\n/g, '<br>'))"></div>
                        </Card>
                      </div>
                    </div>
                    <div :key="`e-${index}`" v-else>
                      <div class="csUserInfo">
                        <span class="csSenderName normalRMargin">{{ item.sender }}</span>
                        <span>{{ getDataToLocalTime(item.createdTime, 'fulltime') }}</span>
                      </div>
                      <div class="csContent">
                        <Card dis-hover style="margin:4px 0 16px 0;display:inline-block" class="tongtool-emoji">
                          <div v-html="makeCsContent(item.messageBody.messageContent.replace(/\r\n|\n/g, '<br>'))"></div>
                        </Card>
                      </div>
                    </div>
                  </template>
                </Scroll>
                <!-- <RadioGroup v-model="vertical" vertical>
                  <Radio label="1">
                    <span>继续与买家沟通</span>
                  </Radio>
                  <template v-if="vertical === '1'">
                    <Form ref="keepInline" :model="keepParams" label-position="left" :label-width="80">
                      <FormItem :label-width="100" label="选择评价模板" class="normalTop">
                        <dyt-select v-model="selectConent" @on-change="changeTemplateContent">
                          <Option v-for="item in templateList" :key="item.feedbackTemplateId" :value="item.content">{{item.name}}</Option>
                        </dyt-select>
                      </FormItem>
                      <FormItem :label-width="100" label="模板编号">

                      </FormItem>
                    </Form>
                  </template>
                  <Radio label="2">
                    <span>处理结果</span>
                  </Radio>
                  <template v-if="vertical === '2'">
                    <div>
                      2
                    </div>
                  </template>
                </RadioGroup> -->
              </template>
            </Card>
          </div>
        </div>
        <!-- <div slot="footer">
           <div class="combineButton">
             <Button type="primary" @click="confirmSave">确定</Button>
             <Button @click="orderDetailsStatus = !orderDetailsStatus" style="margin-left: 10px">取消</Button>
           </div>
         </div>-->
        <orderDetails
          ref="goodReputation"
          :hasEdit=false
          :orderDetailsId="orderDetailsId"
          :orderRowsDetail="orderRowsDetail"
          :orderNo="orderNo"
          :timestamp="timestamp"
          @spinLoading="spinLoading"
          @resetSpinShow="resetSpinShow"
          @updateList="getList"
          :buttonVisibile="buttonVisibile"
          inPage="goodReputation"
          :moal-visible.sync="orderDetailsStatus"
        />
      </sliderModal>
    </keep-alive>
    <!-- <keep-alive>
      <Modal v-model="viewEvalutionModel" title="查看评价" :mask-closable="false" :width="800">
        <viewEvaluation :evaluateRow="evaluateRow"></viewEvaluation>
      </Modal>
    </keep-alive> -->
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
// import viewEvaluation from '@/views/customerCenter/components/evaluate/viewEvaulaton'

export default {
  mixins: [Mixin],
  data () {
    let self = this;
    return {
      dataLoading: false,
      csmesList: [],
      keepParams: {},
      vertical: '',
      replyText: '',
      moreLoading: true,
      selectConent: '',
      templateList: [],
      isTrue: true, // evaluationData
      evaluateRow: null, // ebay订单详情
      viewEvalutionModel: false,
      orderNo: null,
      timestamp: 0,
      orderDetailsId: null,
      orderRowsDetail: {},
      orderDetailsBegin: false,
      buttonVisibile: false,
      sliderObjStyle: null,
      swStyles: null,
      orderDetailsStatus: false, // end
      moreParams: {
        selectInContent: false,
        feedbackContent: '',
        feedbackLevel: 'Positive'
      },
      replyModelStatus: false,
      replyModel: false,
      curPage: 1,
      total: 0,
      totalPage: 0,
      pageParams: {
        saleAccountIdList: [],
        orderNoList: [],
        sellerFeedbackTimeStart: null,
        sellerFeedbackTimeEnd: null,
        buyerNameList: [],
        payTimeStart: null,
        payTimeEnd: null,
        packageArrivalTime: this.$common.getRangeTime('', -7, 'day'),
        payTimeRang: [],
        pageNum: 1,
        pageSize: 20
      },
      columns: [
        {
          type: 'selection',
          width: 45,
          align: 'center'
        },
        {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          width: 200,
          render: (h, params) => {
            return h('span', {
              style: {
                color: this.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                cursor: params.row.sType == 1 ? 'pointer' : ''
              },
              on: {
                click: () => {
                  if (params.row.sType == 1 && this.getPermission('order_detail')) {
                    this.evaluateRow = params.row;
                    this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                    this.showOrder(params);
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.salesRecordNumber);
          }
        },
        {
          title: '买家账号',
          key: 'buyerAccountId',
          align: 'center',
          width: 130,
          render: (h, params) => {
            return h('span', params.row.buyerAccountId)
          }
        },
        {
          title: '付款日期',
          key: 'name',
          align: 'center',
          width: 150,
          render: (h, params) => {
            if (params.row.sType === 1) {
              return h('span', this.getDataToLocalTime(params.row.payTime, 'fulltime'));
            }
          }
        },
        {
          title: '买家评价',
          align: 'center',
          minWidth: 120,
          key: 'buyerFeedbackContent'
        },
        {
          title: '我的评价',
          align: 'center',
          minWidth: 120,
          key: 'sellerFeedbackContent'
        },
        {
          title: '留评价时间',
          align: 'center',
          key: 'name',
          width: 150,
          render: (h, params) => {
            if (params.row.sType !== 1 || !params.row.hasChild) {
              return h('span', self.getDataToLocalTime(params.row.sellerFeedbackTime, 'fulltime'));
            }
          }
        },
        {
          title: '操作',
          key: 'name',
          align: 'center',
          width: 120,
          render: (h, params) => {
            if (!params.row.hasChild) {
              return h('div', [
                params.row.syncStatus !== 3 && params.row.syncStatus !== 4 && self.getPermission('ebayFeedback_feedback')
                  ? h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.idArr = [params.row.orderTransactionId];
                        this.showMoreDialog();
                      }
                    }
                  }, '回评')
                  : ''

              ]);
            }
          }
        }
      ],
      tableData: [],
      idArr: [],
      pageParamsStatus: false
    };
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
        Promise.resolve(v.getPermission('ebayFeedback_queryForNeedSellerFeedback')
          ? v.getList()
          : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(295);
    },
  },
  methods: {
    makeCsContent (value) {
      let reg = /(\/:0){1}[0-9][0-9]/g;
      let arr = value.match(reg);
      if (arr !== null && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          let item = Number(arr[i].replace('/:', ''));
          let str = `<span class="emoji${item}"></span>`;
          value = value.replace(arr[i], str);
        }
      }
      return value;
    },
    confirmSave () {
      let v = this;
      if (v.replyText === '') {
        v.$Message.error('回评内容不能为空');
        return false;
      }
      const obj = {
        url: api.set_response,
        type: 'put',
        data: {
          ebayFeedbackId: v.evaluateRow.ebayFeedbackId,
          feedbackContent: v.replyText
        }
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('回评成功');
          v.replyText = '';
          v.orderDetailsStatus = false;
        }
      });
    },
    handleReachBottom () {

    },
    getTemplateList () {
      let v = this;
      const obj = {
        url: api.get_templateModel,
        data: {
          platformId: 'ebay',
          pageNum: 1,
          pageSize: 100
        }
      };
      v.templateList = [];
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.templateList = data.list;
        }
      });
    },
    changeTemplateContent (value) {
      let v = this;
      v.moreParams.feedbackContent = v.moreParams.feedbackContent + value;
    },
    getCsMes (params) {
      let v = this;
      const obj = {
        url: api.get_queryByBuyerAccountIdAndItemId + '?buyerAccountId=' + params.row.buyerAccountId + '&itemId=' + params.row.itemId, // url: api.get_queryByBuyerAccountIdAndItemId + '?buyerAccountId=' + 'Kl*hRGJ' + '&itemId=' + 'lMszG',
        type: 'get'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.csmesList = response.data.datas;
        }
      });
    },
    showOrder (params) {
      if (params.row.sellerFeedbackTime) {
        this.getCsMes(params);
      }
      this.orderDetailsId = params.row.orderId;
      this.orderRowsDetail = this.$common.copy(params.row);
      let date = new Date().getTime();
      this.orderDetailsBegin = true;
      this.$nextTick(() => {
        this.orderDetailsStatus = true;
        this.timestamp = date;
      });
    },
    getSelectValue (value) {
      let arr = value.map(n => {
        return n.orderTransactionId;
      });
      this.idArr = arr;
    },
    moreReply () {
      let v = this;
      if (v.idArr.length === 0) {
        v.$Message.warning('请选择要回评的订单');
        return false;
      }
      let params = Object.assign({}, v.moreParams);
      delete params.selectInContent;
      params.orderTransactionIds = v.idArr;
      const obj = {
        url: api.set_feedBack,
        data: params
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('回评成功');
          v.pageParamsStatus = true;
          v.replyModel = false;
          v.moreLoading = false;
          v.selectInContent = '';
          v.$refs['formInline'].resetFields();
          v.$nextTick(() => {
            v.moreLoading = true;
          });
        } else {
          v.moreLoading = false;
          v.$nextTick(() => {
            v.moreLoading = true;
          });
        }
      });
    },
    showMoreDialog (type) {
      let v = this;
      if (v.idArr.length === 0) {
        v.$Message.error('请选择要回评的订单');
        return;
      }
      v.replyModelStatus = true;
      v.$nextTick(() => {
        v.replyModel = true;
      });
    },
    // 获取店铺名称
    getShopName (id) {
      let b = this.shopList.find(n => {
        return n.saleAccountId === id;
      });
      if (b) {
        return b.account;
      }
      return id;
    },
    // 重置表单
    resetForm () {
      this.$refs.filterFormRef && this.$refs.filterFormRef.resetFields();
      this.$nextTick(() => {
        this.pageParams.packageArrivalTime = this.$common.getRangeTime('', -7, 'day');
      });
    },
    getFilter () {
      let params = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(params.packageArrivalTime) && !this.$common.isEmpty(params.packageArrivalTime[0])) {
        params.sellerFeedbackTimeStart = this.$common.getUniversalTime(params.packageArrivalTime[0], 'fulltime');
        params.sellerFeedbackTimeEnd = this.$common.getUniversalTime(params.packageArrivalTime[1], 'fulltime');
      }
      if (!this.$common.isEmpty(params.payTimeRang) && !this.$common.isEmpty(params.payTimeRang[0])) {
        params.payTimeStart = this.$common.getUniversalTime(params.payTimeRang[0], 'fulltime');
        params.payTimeEnd = this.$common.getUniversalTime(params.payTimeRang[1], 'fulltime');
      }
      delete params.packageArrivalTime;
      delete params.payTimeRang;
      return params;
    },
    // 获取列数据
    getList (type) {
      if (this.dataLoading) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      let parmas = this.getFilter();
      const obj = {
        url: api.get_feedBack,
        data: parmas
      };
      this.tableData = [];
      this.dataLoading = true;
      this.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let listArr = [];
          let saleAccountIdPos = [];
          let random = '';
          data.list.forEach((n, i) => {
            random = `${(new Date().getTime()).toString(32)}-${Number(((Math.random() * Math.pow(10, 10)).toFixed(0))).toString(32)}`;
            n.id = `${n.orderId}-${random}`;
            let queryFeedbackDetailBoList = n.queryFeedbackDetailBoList || [];
            if (queryFeedbackDetailBoList.length === 1) {
              n.sType = 1;
              n = Object.assign(n, queryFeedbackDetailBoList[0]);
              n.accountCode = '';
              // n.children = [];
              saleAccountIdPos.push(n.saleAccountId);
              listArr.push(n);
            } else if (queryFeedbackDetailBoList.length > 1) {
              n.accountCode = '';
              n.sType = 1;
              n.hasChild = true;
              saleAccountIdPos.push(n.saleAccountId);
              n.children = [];
              n.stretch = true;
              n.indentSize = 15;// 自定义的间距
              listArr.push(n);
              queryFeedbackDetailBoList.forEach((m, t) => {
                random = `${(new Date().getTime()).toString(32)}-${Number(((Math.random() * Math.pow(10, 10)).toFixed(0))).toString(32)}`;
                m.sType = 2;
                m.id = `p${n.orderId}-${m.orderTransactionId}-${random}`;
                n.children.push(m);
              });
            }
          });
          if (saleAccountIdPos.length > 0) { // 匹配订单号
            this.getAccountCode(listArr, saleAccountIdPos).then(arr => {
              arr.forEach((n, i) => {
                if (n.children) {
                  n.children.forEach((m, t) => {
                    m.accountCode = n.accountCode;
                  });
                }
              });
              this.tableData = arr;
              this.dataLoading = false;
            }).catch(() => {
              this.dataLoading = false;
            })
          } else {
            this.dataLoading = false;
          }
          this.$nextTick(() => {
            this.total = Number(data.total);
            this.totalPage = Number(data.pages);
          });
        } else {
          this.tableData = [];
          this.$nextTick(() => {
            this.total = 0;
            this.totalPage = 0;
            this.dataLoading = false;
          });
        }
      }).catch(() => {
        this.dataLoading = false;
      })
    },
    getAccountCode (pos, saleAccountIdPos) { // get accountcode common method
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + saleAccountIdPos).then(response => {
          if (response.data.code === 0) {
            let list = response.data.datas;
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                for (let t = 0; t < pos.length; t++) {
                  if (pos[t].saleAccountId === list[i].saleAccountId) {
                    pos[t].accountCode = list[i].accountCode;
                  }
                  if (i === list.length - 1 && t === pos.length - 1) {
                    resolve(pos);
                  }
                }
              }
            } else {
              resolve(pos);
            }
          }
        });
      });
    }
  },
  mounted () {
    this.getShopList(null, '/cs-service/erpCommon');
    this.getList();
    this.getTemplateList();
  }
};
</script>
<style lang="less" scoped>
.need-evauate{
  .ivu-page{
    margin-top: 5px;
    text-align: right;
  }
  :deep(.platformSearch) {
    .ivu-form-item-content{
      width: 275px;
    }
  }
  :deep(.formItem){
    label{
      &.ivu-radio-wrapper-checked {
        background-color: #2d8cf0;
        color: #fff;
      }
    }
  }
}
</style>
