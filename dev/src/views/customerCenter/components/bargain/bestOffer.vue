<template >
  <div :class="wrap" >
    <Card
        shadow class="normalLRMargin" >
      <Form
          ref="formInline" :model="pageParams" :label-width="80" class="formItem" >
        <FormItem label="回评状态" >
          <RadioGroup
              v-model="pageParams.bestOfferStatus" type="button" >
            <Radio label="all" >全部</Radio >
            <Radio label="PENDING" >Pending</Radio >
            <Radio label="COUNTERED" >Countered</Radio >
            <Radio label="ACCEPTED" >Accepted</Radio >
            <Radio label="DECLINED" >Declined</Radio >
            <Radio label="EXPIRED" >Expired</Radio >
            <Radio label="RETRACTED" >Retracted</Radio >
            <Radio label="ADMINENDED" >AdminEnded</Radio >
          </RadioGroup >
        </FormItem >
        <Row
            type="flex" justify="start" :gutter="20" class="normalTop" >
          <Col >
            <FormItem label="Item ID" >
              <Input v-model.trim="pageParams.itemId" />
            </FormItem >
          </Col >
          <Col >
            <FormItem label="买家ID" >
              <Input v-model.trim="pageParams.buyerAccount" />
            </FormItem >
          </Col >
        </Row >
        <FormItem >
          <Button
              type="primary" @click="search" size="small" >查询 </Button >
        </FormItem >
      </Form >
    </Card >
    <!-- <Card shadow class="normalMargin">
      <Button @click="updateData" type="primary" icon="ios-keypad">更新数据</Button>
    </Card> -->
    <Card
        shadow class="normalLRMargin" >
      <keep-alive >
        <Table
            :columns="columns"
            :loading="tableLoading"
            highlight-row
            border
            :data="tableData"
            @on-selection-change="getSelectValue" ></Table >
      </keep-alive >
      <Row
          type="flex" justify="end" class="normalTop" >
        <keep-alive >
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
              :page-size-opts="pageArray" ></Page >
        </keep-alive >
      </Row >
    </Card >
    <keep-alive >
      <Modal
          v-model="bestOfferDetailsModelStatus"
          title="BestOffer"
          :mask-closable="false"
          :width="700"
          v-if="bestOfferDetailsStatus" >
        <div
            class="normalMargin" v-if="details" >
          <Row
              type="flex" justify="space-between" >
            <img
                :src="details.localImgUrl" style="width: 74px; height: 74px" >
            <Col >
              <Row
                  type="flex" justify="start" align="middle" >
                <span class="platformLogo ebayIcon" ></span > <span
                  style="margin-left: 5px" v-if="siteDetails" >{{ siteDetails.cnName }}</span >
                <span style="margin-left: 5px" >{{ accountCode }}</span >
              </Row >
            </Col >
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            {{ details.itemTitle }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            一口价：{{ details.bestOfferPriceCurrency }} {{ details.bestOfferPrice }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            数量：{{ details.counterQuantity }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            结束时间： 2019-08-31 11:50
          </Row >
          <div class="divider normalTop" ></div >
          <Row
              type="flex"
              justify="space-between"
              class="normalTop offerItem"
              align="middle"
              v-for="(item, itemIndex) in offerDetailsList"
              :key="itemIndex" >
            <Col >
              <Row
                  type="flex" justify="start" :gutter="20" align="middle" >
                <div >
                  <div :class="{'userIcon': item.bestOfferCodeType === 'BuyerBestOffer', 'userIconTwo': item.bestOfferCodeType !== 'BuyerBestOffer'}" ></div >
                  <div class="userName" >{{ item.buyerAccount }}</div >
                </div >
                <Col >
                  Submit {{ item.bestOfferPriceCurrency }} {{ item.bestOfferPrice }} x {{ item.bestOfferQuantity }}
                </Col >
              </Row >
            </Col >
            <Col >
              {{ getDataToLocalTime(item.createdTime, 'fulltime') }}
            </Col >
          </Row >
        </div >
        <div slot="footer" >
          <Row
              type="flex" justify="end" >
            <Button @click="closeDialog" >关闭</Button >
          </Row >
        </div >
      </Modal >
    </keep-alive >
    <keep-alive >
      <Modal
          v-model="handlerBestOfferDetailsModelStatus"
          title="BestOffer处理"
          :mask-closable="false"
          :width="700"
          v-if="handlerBestOfferDetailsStatus" >
        <div
            class="normalMargin" v-if="offerDetailsList.length > 0" >
          <Row
              type="flex" justify="space-between" >
            <img
                :src="offerDetailsList[0].localImgUrl" style="width: 74px; height: 74px" >
            <Col >
              <Row
                  type="flex" justify="start" align="middle" >
                <span class="platformLogo ebayIcon" ></span > <span
                  style="margin-left: 5px" v-if="siteDetails" >{{ siteDetails.cnName }}</span >
                <span style="margin-left: 5px" >{{ accountCode }}</span >
              </Row >
            </Col >
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            {{ offerDetailsList[0].itemTitle }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            一口价：{{ offerDetailsList[0].bestOfferPriceCurrency }} {{ offerDetailsList[0].bestOfferPrice }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            数量：{{ offerDetailsList[0].counterQuantity }}
          </Row >
          <Row
              type="flex" justify="space-between" class="normalTop" >
            结束时间： {{ getDataToLocalTime(offerDetailsList[0].listingEndDate, 'fulltime') }}
          </Row >
          <div class="divider normalTop" ></div >
          <div
              v-for="(item, itemIndex) in offerDetailsList" :key="itemIndex" class="normalTop offerItem" >
            <Row
                type="flex" justify="space-between" align="middle" >
              <Col >
                <Row
                    type="flex" justify="start" :gutter="20" align="middle" >
                  <div >
                    <div :class="{'userIcon': item.bestOfferCodeType === 'BuyerBestOffer', 'userIconTwo': item.bestOfferCodeType !== 'BuyerBestOffer'}" ></div >
                    <div class="userName" >{{ item.buyerAccount }}</div >
                  </div >
                  <Col >
                    {{
                      (item.bestOfferStatus != 'Retracted' && item.bestOfferStatus != 'Expired' && item.bestOfferStatus != 'BuyerCounterOffer')
                      ? 'Submit'
                      : item.bestOfferDetailsStatus
                    }} {{ item.bestOfferPriceCurrency }} {{ item.bestOfferPrice }} x {{ item.bestOfferQuantity }}
                  </Col >
                  <!-- <Col v-if="getExpireTime('2019-09-01')">
                    offer expires in: {{getExpireTime('2019-09-01')}}
                  </Col> -->
                  <Col v-if="item.bestOfferDetailsStatus === 'Pending'" >
                    offer expires in: {{ getExpireTime(item.bestOfferExpirationTime) }}
                  </Col >
                </Row >
              </Col >
              <Col >
                {{ getDataToLocalTime(item.createdTime, 'fulltime') }}
              </Col >
            </Row >
            <Row
                type="flex" justify="end" :gutter="10" v-if="item.bestOfferStatus === 'Pending' && itemIndex === 0" >
              <Col >
                <Button
                    type="primary" size="small" @click="setReply(1, item)" >Accept </Button >
              </Col >
              <Col >
                <Button
                    type="primary" size="small" @click="setReply(2, item)" >Make a counteroffer </Button >
              </Col >
              <Col >
                <Button
                    type="primary" size="small" @click="setReply(3, item)" >Decline </Button >
              </Col >
            </Row >
            <Card
                dis-hover class="normalTop" v-if="showCard && itemIndex === 0" >
              <Row
                  type="flex" jusitfy="start" align="middle" :gutter="10" >
                <Col >Your counteroffer price:</Col >
                <Input
                    v-model.trim="offerForm.counterOfferPrice" style="width: 100px" size="small" >
                  <span slot="append" >{{ item.bestOfferPriceCurrency }}</span > </Input >
              </Row >
              <Row
                  type="flex" jusitfy="start" class="normalTop" align="middle" :gutter="10" >
                <Col >Quantity:</Col >
                <InputNumber
                    v-model="offerForm.counterOfferQuantity" size="small" :step="1" ></InputNumber >
              </Row >
              <Row
                  type="flex" jusitfy="start" class="normalTop" align="middle" :gutter="10" >
                Are you sure want to decline this offer?
              </Row >
              <Row
                  type="flex" jusitfy="start" class="normalTop" :gutter="10" >
                <Col >Message:</Col >
                <Col >
                  <Input
                      type="textarea" style="width: 500px" v-model="offerForm.sellerMessage" ></Input >
                </Col >
              </Row >
              <Row
                  type="flex" justify="end" class="normalTop" >
                <Button
                    type="success" size="small" @click="saveOffer" >保存 </Button >
                <Button
                    size="small" @click="showCard = false" style="margin-left: 10px" >取消 </Button >
              </Row >
            </Card >
          </div >
        </div >
        <div slot="footer" >
          <Row
              type="flex" justify="end" >
            <Button @click="closeHandlerDialog" >关闭</Button >
          </Row >
        </div >
      </Modal >
    </keep-alive >
  </div >
</template >
<style >
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #FFF !important;
}

.ebayIcon {
  width: 77px;
  height: 31px;
  background-position: 18px -16px;
  display: inline-block;
  background-size: 80%;
}

.userIcon {
  background: url('../../../../assets/images/user.png') no-repeat;
  width: 17px;
  height: 16px;
  margin: 0 auto;
}

.userIconTwo {
  background: url('../../../../assets/images/user.png') no-repeat;
  width: 17px;
  height: 16px;
  background-position: 0 -23px;
  margin: 0 auto;
}

.offerItem {
  background-color: #f6f6f6;
  padding: 10px;
  border-radius: 4px;
}
</style >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    return {
      offerForm: {
        action: '',
        bestOfferInfoId: '',
        counterOfferPrice: 0,
        counterOfferQuantity: 0,
        sellerMessage: ''
      },
      showCard: false,
      handlerBestOfferDetailsModelStatus: false,
      handlerBestOfferDetailsStatus: false,
      bestOfferDetailsStatus: false,
      bestOfferDetailsModelStatus: false,
      curPage: 1,
      total: 0,
      totalPage: 0,
      pageParams: {
        pageSize: 10,
        pageNum: 1,
        bestOfferStatus: 'all',
        itemId: '',
        buyerAccount: ''
      },
      columns: [
        {
          title: '图片',
          width: 140,
          render: (h, params) => {
            return this.tableImg(h, params, 'localImgUrl');
          }
        }, {
          title: 'itemId',
          key: 'itemId',
          minWidth: 140
        }, {
          title: '买家ID',
          key: 'buyerAccount',
          minWidth: 140
        }, {
          title: 'offert Price',
          width: 140,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.bestOfferPrice), h('div', params.row.bestOfferPriceCurrency)
            ]);
          }
        }, {
          title: '数量',
          key: 'counterQuantity',
          wwidth: 80
        }, {
          title: '类型',
          key: 'bestOfferCodeType',
          minWidth: 140
        }, {
          title: '状态',
          key: 'bestOfferStatus',
          minWidth: 140
        }, {
          title: '时间',
          key: 'createdTime',
          minWidth: 140
        }, {
          title: '操作',
          fixed: 'right',
          width: 140,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small',
                  type: 'primary'
                },
                on: {
                  click: () => {
                    this.getDetails(params);
                  }
                }
              }, '查看'), h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '10px',
                  display: params.row.bestOfferStatus === 'Pending' ? 'inline-block' : 'none'
                },
                on: {
                  click: () => {
                    this.getDetails(params, 1);
                  }
                }
              }, '处理')
            ]);
          }
        }
      ],
      tableData: [],
      idArr: [],
      pageParamsStatus: false,
      details: null,
      offerDetailsList: [],
      hanlderStatus: false,
      siteDetails: null,
      accountCode: ''
    };
  },
  watch: {
    pageParamsStatus (n) {
      var v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  methods: {
    closeHandlerDialog () {
      let v = this;
      v.showCard = false;
      v.accountCode = '';
      v.siteDetails = null;
      v.details = null;
      v.offerDetailsList = [];
      v.offerForm = {
        action: '',
        bestOfferInfoId: '',
        counterOfferPrice: 0,
        counterOfferQuantity: 0,
        sellerMessage: ''
      };
      v.handlerBestOfferDetailsModelStatus = false;
    },
    closeDialog () {
      let v = this;
      v.accountCode = '';
      v.siteDetails = null;
      v.details = null;
      v.offerDetailsList = [];
      v.bestOfferDetailsModelStatus = false;
    },
    getSelectValue (value) {
      let arr = value.map(n => {
        return n.orderTransactionId;
      });
      this.idArr = arr;
    },
    getList () {
      let v = this;
      let params = Object.assign({}, v.pageParams);
      if (params.bestOfferStatus === 'all') {
        delete params.bestOfferStatus;
      }
      const obj = {
        url: api.get_bsetOfferList,
        data: params
      };
      v.loadingFalse();
      v.tableData = [];
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.tableData = response.data.datas.list;
          v.total = response.data.datas.total;
        }
      });
    },
    getDetails (params, type) {
      let v = this;
      const obj = {
        url: api.get_ebayOfferDetails + '?bestOfferGroupId=' + params.row.bestOfferGroupId,
        type: 'get'
      };
      v.hanlderStatus = false;
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.details = params.row;
          v.offerDetailsList = response.data.datas;
          v.getSite();
          v.getAccountCode();
          if (type) {
            v.handlerBestOfferDetailsStatus = true;
            v.$nextTick(function () {
              v.handlerBestOfferDetailsModelStatus = true;
            });
            v.hanlderStatus = true;
          } else {
            v.bestOfferDetailsStatus = true;
            v.$nextTick(function () {
              v.bestOfferDetailsModelStatus = true;
            });
          }
        }
      });
    },
    getSite () {
      let v = this;
      const obj = {
        url: '/erpCommon/common-service' + api.get_site + '?siteIdList=' + v.details.siteId + '&platformId=ebay',
        type: 'get'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.length > 0) {
            v.siteDetails = response.data.datas[0];
          }
        }
      });
    },
    getAccountCode () {
      let v = this;
      v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + [v.offerDetailsList[0].saleAccountId]).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas;
          if (list.length > 0) {
            v.accountCode = list[0].accountCode;
          }
        }
      });
    },
    getExpireTime (time) {
      let v = this;
      time = v.getDataToLocalTime(time);
      let expireTime = new Date(time).getTime();
      let nowTime = new Date().getTime();
      if (nowTime > expireTime) {
        return false;
      } else {
        return v.getTimeArr(expireTime - nowTime);
      }
    },
    getTimeArr (mss) {
      var hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      hours = hours < 10 ? '0' + hours : hours;
      var minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60));
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var seconds = parseInt(mss % (1000 * 60) / 1000);
      seconds = seconds < 10 ? '0' + seconds : seconds;
      return hours + '时' + minutes + '分' + seconds;
    },
    setReply (type, item) {
      let v = this;
      let params = {
        action: type === 1 ? 'Accept' : type === 2 ? 'Counter' : 'Decline',
        bestOfferInfoId: item.bestOfferInfoId,
        counterOfferPrice: item.bestOfferPrice,
        counterOfferQuantity: item.bestOfferQuantity,
        sellerMessage: ''
      };
      v.offerForm = Object.assign(v.offerForm, params);
      if (type === 1 || type === 3) {
        v.saveOffer();
      }
      if (type === 2) {
        v.showCard = true;
      }
    },
    saveOffer () {
      let v = this;
      const obj = {
        url: api.set_ebayOfferResponse,
        data: v.offerForm
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('保存成功');
          v.showCard = false;
          v.handlerBestOfferDetailsModelStatus = false;
        }
      });
    },
    updateData () {
    }
  },
  mounted () {
    let v = this;
    v.getList();
  }
};
</script >
