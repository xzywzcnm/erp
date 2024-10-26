<template>
  <div :class="wrap">
    <Card shadow class="platformParamsSelect">
      <Form ref="formInline" :model="pageParams" inline :label-width="80" class="formItem">
        <dyt-filter>
          <FormItem label="店铺" prop="saleAccountIdList">
            <dytStoreSelect
              v-model="pageParams.saleAccountIdList"
              :option-data="shopList"
              :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
              placeholder="请选择店铺，可输入搜索"
              input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
            />
          </FormItem>
          <FormItem label="回评状态" prop="isReviewed">
            <RadioGroup v-model="pageParams.isReviewed" type="button">
              <Radio label="">全部</Radio>
              <Radio :label="0">未回评</Radio>
              <Radio :label="1">已回评</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="跟进状态" prop="refuseReason">
            <RadioGroup v-model="pageParams.refuseReason" type="button">
              <Radio label="">全部</Radio>
              <Radio :label="0">需要处理</Radio>
              <Radio :label="1">处理完成</Radio>
            </RadioGroup>
          </FormItem>
          <Form-item label="留评时间" prop="leaveReviewTime">
            <Date-picker
              transfer
              type="datetimerange"
              style="width: 100%"
              :clearable="true"
              format="yyyy-MM-dd HH:mm:ss"
              :options="dateOptions"
              placeholder="选择日期"
              v-model="pageParams.leaveReviewTime"
            ></Date-picker>
          </Form-item>
          <FormItem label="Item ID" prop="itemId">
            <dyt-input v-model="pageParams.itemId" />
          </FormItem>
          <FormItem label="SKU" prop="skuList">
            <dyt-input-tag
              type="textarea"
              :limit="1"
              :string="false"
              placeholder="请输入SKU, 多个用逗号或者换行分隔"
              v-model="pageParams.skuList"
            />
          </FormItem>
          <FormItem label="订单号" prop="orderNoList">
            <dyt-input-tag
              type="textarea"
              :limit="1"
              :string="false"
              placeholder="请輸入订单号, 多个用逗号或者换行分隔"
              v-model="pageParams.orderNoList"
            />
          </FormItem>
          <FormItem label="客户ID" prop="buyerAccountIdList">
            <dyt-input-tag
              type="textarea"
              :limit="1"
              :string="false"
              placeholder="请輸入客户ID, 多个用逗号或者换行分隔"
              v-model="pageParams.buyerAccountIdList"
            />
          </FormItem>
          <!-- <FormItem label="SKU">
            <dyt-input v-model="pageParams.sku" />
          </FormItem> -->
          <!--<FormItem label="留评前已联系" :label-width="120">
              <dyt-select clearable v-model="pageParams.isReviewed">
                <Option :value="1">是</Option>
                <Option :value="0">否</Option>
              </dyt-select>
            </FormItem>-->
          <div slot="operation">
            <Button type="primary" @click="search">查询 </Button>
            <Button @click="resetFeild" class="ml10">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </Card>
    <Card shadow class="normalMargin">
      <div style="margin-bottom: 10px;">
        <Button
          @click="showMoreDialog"
          type="primary"
          icon="ios-keypad"
          v-if="getPermission('ebayFeedback_batchfeedback')"
        >批量回评</Button>

        <Dropdown @on-click="exportBtn" class="ml10" v-if="getPermission('ebayFeedback_exportNeutralInfo')">
          <Button type="primary" :loading="exportLoading">
            <Icon type="md-cloud-download" style="font-size: 16px;margin-right: 2px;" />
            导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name='check'>导出选中数据</DropdownItem>
            <DropdownItem name='all'>导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <keep-alive>
        <dTable :columns="columns" :loading="tableLoading" highlight-row :height="tableHeight" border :data="tableData" @on-selection-change="getSelectValue" :isRefresh="isRefresh"></dTable>
      </keep-alive>
      <Row type="flex" justify="end" class="normalTop">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </keep-alive>
      </Row>
    </Card>
    <keep-alive>
      <Modal v-model="replyModel" title="给买家留评价" :mask-closable="false" :width="600" v-if="replyModelStatus" @on-ok="moreReply">
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
                    <div :key="`v-else-${index}`" v-else>
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
        <!--<div slot="footer">
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
  </div>
</template>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #fff !important;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    let self = this;
    return {
      csmesList: [],
      keepParams: {},
      vertical: '',
      replyText: '',
      moreLoading: true,
      exportLoading: false,
      selectConent: '',
      templateList: [],
      isTrue: true, // evaluationData
      pageParamsStatus: false,
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
        pageSize: 10,
        pageNum: 1,
        isReviewed: '',
        itemId: '',
        refuseReason: '',
        saleAccountIdList: [],
        buyerAccountIdList: [],
        // sku: '',
        skuList: [],
        orderNoList: [],
        leaveReviewTime: this.$common.getRangeTime(null, -1, 'month')
      },
      columns: [
        {
          type: 'selection',
          width: 40,
          align: 'center'
        },
        {
          title: '销售号/买家账号',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            let item = [];
            if ((params.row.sType === 1) && params.row.itemId) {
              item.push(h('span', {
                style: {
                  color: self.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    if (self.getPermission('order_detail')) {
                      self.evaluateRow = params.row;
                      self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                      self.showOrder(params);
                      // self.queryReasonByFeedBackId(params.row);
                    }
                  }
                }
              }, params.row.accountCode + '-' + params.row.salesRecordNumber + '/'));
              item.push(h('span', params.row.buyerAccountId));
            } else {
              item.push(h('span', {
                class: 'blueColor'
              }, params.row.accountCode + '-' + params.row.salesRecordNumber))
            }
            // 是否可跳到站内信
            if (!this.$common.isEmpty(params.row.messageGroupId)) {
              item.push(h('Icon', {
                style: { 'cursor': 'pointer', 'margin-left': '5px', 'font-size': '22px', 'color': '#f20' },
                class: 'lapa lapa-solid-core-mail',
                on: {
                  click: () => {
                    const openUrl = `/cs-service/customer.html#/ebayMail`;
                    localStorage.setItem('erp-order-stockoutOrder', JSON.stringify({
                      messageGroupId: params.row.messageGroupId
                    }));
                    window.open(openUrl);
                  }
                }
              }));
            }
            return item;
          }
        },
        {
          title: '付款日期',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            if (params.row.sType === 1) {
              return h('span', self.getDataToLocalTime(params.row.payTime, 'fulltime'));
            }
          }
        }, {
          title: '买家评价',
          align: 'center',
          key: 'buyerFeedbackContent'
        }, {
          title: '我的评价',
          key: 'sellerFeedbackContent'
        }, {
          title: '退款',
          align: 'center',
          key: 'return',
          width: 80,
          render: (h, params) => {
            if (params.row.isRefunded === 1) {
              return h('span', '有');
            } else {
              return h('span', '无');
            }
          }
        }, {
          title: '已补发货',
          key: 'return',
          align: 'center',
          width: 110,
          render: (h, params) => {
            if (params.row.isReplenishment === 1) {
              return h('span', '有');
            } else {
              return h('span', '无');
            }
          }
        }, {
          title: '退款',
          align: 'center',
          key: 'return',
          width: 80,
          render: (h, params) => {
            if (params.row.isReturnGoods === 1) {
              return h('span', '有');
            } else {
              return h('span', '无');
            }
          }
        }, {
          title: '处理状态',
          align: 'center',
          key: 'syncStatus',
          render: (h, params) => {
            if (params.row.sType !== 1 || !params.row.hasChild) {
              if (params.row.syncStatus === 1 || !params.row.syncStatus) {
                return h('span', '未回评'); // 未回评
              } else if (params.row.syncStatus === 2) {
                return h('span', '回评中'); // 回评中
              } else if (params.row.syncStatus === 3) {
                return h('span', '回评成功'); // 回评成功
              } else if (params.row.syncStatus === 4) {
                return h('span', '回评失败'); // 回评失败
              }
            }
          }
        }, {
          title: '留评价时间',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            if (params.row.sType !== 1 || !params.row.hasChild) {
              return h('span', self.getDataToLocalTime(params.row.sellerFeedbackTime, 'fulltime'));
            }
          }
        }, {
          title: '操作',
          key: 'name',
          width: 160,
          align: 'center',
          fixed: 'right',
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
                  : '', !self.getPermission('ebayFeedback_detail') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginLeft: '10px'
                  },
                  on: {
                    click: () => {
                      this.evaluateRow = params.row;
                      this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                      this.showOrder(params);
                    }
                  }
                }, '查看'), !self.getPermission('ebayFeedback_respond') || h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginLeft: '10px'
                  },
                  on: {
                    click: () => {
                      this.evaluateRow = params.row;
                      this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                      this.showOrder(params);
                    }
                  }
                }, '跟进')
              ]);
            }
          }
        }
      ],
      tableData: [],
      idArr: [],
      tableSelectData: [],
      isRefresh: false// 这里是用来让表格宽度恢复正常的
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
        Promise.resolve(v.getPermission('ebayFeedback_queryForNeutral') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(330);
    }
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
    // 重置查询条件
    resetFeild () {
      this.$refs['formInline'].resetFields();
    },
    // 导出
    exportBtn (str) {
      if (this.$common.isEmpty(str) || this.exportLoading) return;
      let temp = {};
      if (str == 'check') {
        if (this.$common.isEmpty(this.tableSelectData)) {
          this.$Message.warning('请选择要导出的数据~');
          return;
        }
        temp.ebayFeedbackIdList = this.tableSelectData.map(row => {
          return row.ebayFeedbackId;
        })
      } else if (str == 'all') {
        temp = this.getParmas();
      }
      this.exportLoading = true;
      this.axios.post(api.exportNeutralInfo, temp).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success(`操作成功，请到"导出查看" 查看导出任务号：${res.data.datas}`);
        // this.$refs.selectionTable.selectAll(false);
      }).finally(() => {
        this.exportLoading = false;
      })
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
      if (this.$common.isEmpty(value)) return;
      this.moreParams.feedbackContent = this.moreParams.feedbackContent + value;
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
      this.tableSelectData = value;
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
          v.$nextTick(function () {
            v.moreLoading = true;
          });
        } else {
          v.moreLoading = false;
          v.$nextTick(function () {
            v.moreLoading = true;
          });
        }
      });
    },
    showMoreDialog () {
      let v = this;
      if (v.idArr.length === 0) {
        v.$Message.error('请选择要回评的订单');
        return;
      }
      v.replyModelStatus = true;
      v.$nextTick(function () {
        v.replyModel = true;
      });
    },
    getShopName (id) {
      let v = this;
      let b = v.shopList.find(n => {
        return n.saleAccountId === id;
      });
      if (b) {
        return b.account;
      }
    },
    getParmas () {
      const deleteKey = ['leaveReviewTime'];
      let parmas = this.$common.copy(this.pageParams);
      if (parmas.isReviewed === '') {
        delete parmas.isReviewed;
      }
      if (this.pageParams.leaveReviewTime.length > 0) {
        if (this.pageParams.leaveReviewTime[0]) {
          parmas.sellerFeedbackTimeStart = this.getUniversalTime(this.pageParams.leaveReviewTime[0], 'fulltime');
        }
        if (this.pageParams.leaveReviewTime[1]) {
          parmas.sellerFeedbackTimeEnd = this.getUniversalTime(this.pageParams.leaveReviewTime[1], 'fulltime');
        }
      }
      deleteKey.forEach(key => {
        delete parmas[key];
      });
      return parmas;
    },
    getList () {
      let parmas = this.getParmas();
      const obj = {
        url: api.get_queryForNeutral,
        data: parmas
      };
      this.tableData = [];
      this.tableLoading = true;
      this.tableSelectData = [];
      this.idArr = [];
      this.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let listArr = [];
          let saleAccountIdPos = [];
          data.list.forEach((n, i) => {
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
                m.sType = 2;
                n.children.push(m);
              });
            }
          });
          if (saleAccountIdPos.length > 0) { // 匹配订单号
            const getData = async () => {
              const arr = await this.getAccountCode(listArr, saleAccountIdPos);
              arr.forEach((n, i) => {
                if (n.children) {
                  n.children.forEach((m, t) => {
                    m.accountCode = n.accountCode;
                  });
                }
              });
              this.tableData = arr;
            }
            getData();
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
          });
        }
      }).finally(() => {
        this.loadingFalse();
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
    let v = this;
    // v.getList();
    v.getShopList(null, '/cs-service/erpCommon');
    v.getTemplateList();
  },
  activated () {
    this.isRefresh = true;
    setTimeout(() => {
      this.isRefresh = false;
    }, 10)
  }
};
</script>
