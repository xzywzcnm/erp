<template>
  <div :class="wrap" class="platformParamsSelect">
    <Card shadow>
      <Form ref="searchForm" :model="pageParams" :label-width="70" class="formItem">
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
          <FormItem label="Item ID" prop="itemId">
            <dyt-input v-model="pageParams.itemId" />
          </FormItem>
          <FormItem label="回评状态" prop="isReviewed">
            <RadioGroup v-model="pageParams.isReviewed" type="button">
              <Radio label="">全部</Radio>
              <Radio :label="0">未回评</Radio>
              <Radio :label="1">已回评</Radio>
            </RadioGroup>
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
            />
          </Form-item>
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
          <div slot="operation">
            <Button type="primary" @click="search" icon="md-search">查询</Button>
            <Button @click="resetFeild" class="ml10">重置</Button>
          </div>
        </dyt-filter>
      </Form>
    </Card>
    <Card shadow class="normalMargin">
      <div class="mb10">
        <Button @click="showMoreDialog" type="primary" icon="ios-keypad"
          v-if="getPermission('ebayFeedback_batchfeedback')">批量回评</Button>

        <Dropdown @on-click="ExportAllBtn" class="ml10" v-if="getPermission('ebayFeedback_exportAcclaimInfo')">
          <Button type="primary" :loading="exportLoading">
            <Icon type="md-cloud-download" style="font-size: 16px;margin-right: 2px;" />
            导出
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name='0'>导出选中数据</DropdownItem>
            <DropdownItem name='1'>导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <keep-alive>
        <Table :columns="columns" :loading="tableLoading" highlight-row border :data="tableData" :height="tableHeight"
          @on-selection-change="getSelectValue" row-key="id" class="expend-table" ref="selectionTable" />
      </keep-alive>
      <Row type="flex" justify="end" class="normalTop">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </Row>
    </Card>
    <keep-alive>
      <Modal v-model="replyModel" title="给买家留评价" :mask-closable="false" :width="600" v-if="replyModelStatus"
        @on-ok="moreReply" :loading="moreLoading">
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
                <Option v-for="item in templateList" :key="item.feedbackTemplateId" :value="item.content">{{ item.name
                }}</Option>
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
      <sliderModal v-model="orderDetailsStatus" :spinShow="spinShow" :styles="sliderObjStyle"
        :buttonVisibile="buttonVisibile" v-if="orderDetailsBegin" :swStyles="swStyles"
        class="combineDetails slider-model">
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
                        <Card dis-hover style="margin:4px 0 16px 0; display: inline-block"
                          class="greenBgColor tongtool-emoji">
                          <div v-html="makeCsContent(item.messageBody.messageContent.replace(/\r\n|\n/g, '<br>'))">
                          </div>
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
                          <div v-html="makeCsContent(item.messageBody.messageContent.replace(/\r\n|\n/g, '<br>'))">
                          </div>
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
          :orderDetailsId="orderDetailsId"
          :orderRowsDetail="orderRowsDetail"
          :orderNo="orderNo"
          :hasEdit=false
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
// import viewEvaluation from '@/views/customerCenter/components/evaluate/viewEvaulaton'
const prefixCls = 'tongtool-customerCenter-evaluate';
let start = new Date();
start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
const leaveReviewTime = [start, new Date()];
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
        pageSize: 10,
        pageNum: 1,
        isReviewed: '',
        saleAccountIdList: [],
        itemId: '',
        skuList: [],
        orderNoList: [],
        leaveReviewTime: leaveReviewTime,
        buyerAccountIdList: []
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '销售号/买家账号',
          key: 'name',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            if (params.row.sType === 1) {
              return h('div', [
                h('span', {
                  style: {
                    color: self.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      if (self.getPermission('order_detail')) {
                        this.evaluateRow = params.row;
                        this.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
                        this.showOrder(params);
                      }
                    }
                  }
                }, params.row.accountCode + '-' + params.row.salesRecordNumber + '/'),
                h('span', params.row.buyerAccountId)
              ]);
            } else {
              return h('Row', {
                props: {
                  type: 'flex',
                  justify: 'center'
                },
                class: 'blueColor'
              }, params.row.accountCode + '-' + params.row.salesRecordNumber);
            }
          }
        }, {
          title: '付款日期',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            if (params.row.sType === 1) {
              return h('span', this.getDataToLocalTime(params.row.payTime, 'fulltime'));
            }
          }
        }, {
          title: '买家评价',
          align: 'center',
          key: 'buyerFeedbackContent'
        }, {
          title: '我的评价',
          align: 'center',
          key: 'sellerFeedbackContent'
        }, {
          title: '留评价时间',
          align: 'center',
          key: 'name',
          render: (h, params) => {
            if (params.row.sType !== 1 || !params.row.hasChild) {
              return h('span', self.getDataToLocalTime(params.row.sellerFeedbackTime, 'fulltime'));
            }
          }
        }, {
          title: '操作',
          key: 'name',
          align: 'center',
          fixed: 'right',
          width: 150,
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
                }, '查看')/*,
                 h('Button', {
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
                 }, '跟进') */
              ]);
            }
          }
        }
      ],
      tableData: [],
      idArr: [],
      pageParamsStatus: false,
      exportLoading: false,
      ebayFeedbackIdList: []
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
      // console.log('n:', n);
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('ebayFeedback_queryForPositive') ? v.getList() : v.gotoError()).then(() => {
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
      let [arr, ebayFeedbackIdList] = [[], []];
      value.forEach(n => {
        arr.push(n.orderTransactionId);
        n.ebayFeedbackId && ebayFeedbackIdList.push(n.ebayFeedbackId);
      });
      this.idArr = arr;
      this.ebayFeedbackIdList = ebayFeedbackIdList;
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
      let v = this;
      let parmas = this.getParmas();
      const obj = {
        url: api.get_evaluateList,
        data: parmas
      };
      v.tableData = [];
      v.tableLoading = true;
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let listArr = [];
          let saleAccountIdPos = [];
          data.list.forEach((n, i) => {
            n.id = n.orderId;
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
                m.id = 'p' + m.orderTransactionId + '-' + n.orderId;
                n.children.push(m);
              });
            }
          });
          if (saleAccountIdPos.length > 0) { // 匹配订单号
            async function getData () {
              const arr = await v.getAccountCode(listArr, saleAccountIdPos);
              arr.forEach((n, i) => {
                if (n.children) {
                  n.children.forEach((m, t) => {
                    m.accountCode = n.accountCode;
                  });
                }
              });
              v.tableData = arr;
            }

            getData();
          }
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        } else {
          v.tableData = [];
          v.$nextTick(function () {
            v.total = 0;
            v.totalPage = 0;
          });
        }
      }).finally(() => {
        v.loadingFalse();
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
    },
    // 重置查询条件
    resetFeild () {
      this.$refs['searchForm'].resetFields();
    },
    ExportAllBtn (name) {
      let fun = {
        '0': () => {
          if (this.idArr.length === 0) {
            this.$Message.warning('请选择要导出的订单~');
            return false;
          }
          return { ebayFeedbackIdList: this.ebayFeedbackIdList };
        },
        '1': () => {
          let data = {};
          let obj = this.getParmas();
          Object.keys(obj).forEach(k => {
            if (obj[k] === '') return;
            data[k] = obj[k];
          })
          return data;
        }
      }
      let temp = fun[name]();
      if (!temp || this.exportLoading) return;
      this.exportLoading = true;
      this.axios.post(api.exportAcclaimInfo, temp).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.$refs.selectionTable.selectAll(false);
        }
      }).finally(() => {
        this.exportLoading = false;
      })
    }
  },
  mounted () {
    let v = this;
    v.getShopList(null, '/cs-service/erpCommon');
    // v.getList();
    v.getTemplateList();
  }
};
</script>
