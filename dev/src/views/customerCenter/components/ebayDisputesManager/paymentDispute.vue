<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter>
                <FormItem label="纠纷状态" prop="ebayAccount">
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
                <FormItem label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </FormItem>
                <Form-item label="发起时间">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    v-model="pageParams.initiateTime"
                    :clearable="true"
                    format="yyyy-MM-dd HH:mm:ss"
                    :options="dateOptions"
                    placement="bottom-end"
                    placeholder="选择日期"
                  />
                </Form-item>
                <FormItem label="Dispute ID" prop="paymentDisputeId">
                  <dyt-input placeholder="请输入Dispute ID" v-model.trim="pageParams.paymentDisputeId"></dyt-input>
                </FormItem>
                <FormItem label="平台产品编码" prop="itemId">
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入平台产品编码" type="textarea" v-model="pageParams.itemId"></dyt-input-tag>
                </FormItem>
                <FormItem label="订单号" prop="saleRecordNumber">
                  <dyt-input-tag :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号或回车分隔" type="textarea" v-model="pageParams.saleRecordNumber"></dyt-input-tag>
                </FormItem>
                <FormItem label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </FormItem>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" v-if="getPermission('ebayPaymentDispute_query')" icon="md-search">查询</Button>
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
          @click="getUpdateNumber"
          style="margin-right: 15px;"
          v-if="getPermission('ebayPaymentDispute_batchUpdate')">全部更新 </Button>

      <Dropdown @on-click="ExportAllBtn" v-if="getPermission('ebayPaymentDispute_export')">
        <Button type="primary">
          <span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name='0'>导出选中数据</DropdownItem>
          <DropdownItem name='1'>导出所有结果集</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table
            highlight-row
            border
            :height="tableHeight"
            :loading="tableLoading"
            :columns="columns"
            @on-selection-change='tableSelectionChange'
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
              :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <Drawer v-model="orderDetailsStatus" width="1100" class="payment-drawer">
      <div class="payment-dispute flexBox">
        <div style="max-width: 400px;">
          <div class="normalPadding">
            <Card dis-hover>
              <p slot="title">请在<span class="redColor plr10">{{ details.responseByDate }}</span>前回应 </p>
              <div>
                <RadioGroup v-model="respondParams.type">
                  <Radio :label=0 >挑战争议并提供证据</Radio>
                  <Radio :label=1 >接受争议并发出全额退款</Radio>
                </RadioGroup>
                <div v-show="respondParams.type === 0" class="mt10">
                  <div>
                    <span class="white-space-nowrap">证据类型：</span>
                    <dyt-select v-model="respondParams.evidenceType" style="width: 200px">
                      <Option v-for="item in EvidenceTypeEnum" :value="item" :label="item" :key="item"></Option>
                    </dyt-select>
                  </div>
                  <div class="mt5 clearfix">
                    <div class="fl">添加证据：</div>
                    <div class="demo-upload-list fl" v-for="(item, index) in uploadList" :key="index">
                      <template v-if="item.status === 'finished'">
                        <img :src="filenodeViewTargetUrl + item.url">
                        <div class="demo-upload-list-cover">
                          <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                          <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                        </div>
                      </template>
                      <template v-else>
                        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                      </template>
                    </div>
                    <dytUpload
                      ref="upload"
                      class="fl"
                      :show-upload-list="false"
                      :on-success="handleSuccess"
                      :format="['JPG', 'JPEG', 'PNG']"
                      :max-size="1536"
                      :on-format-error="handleFormatError"
                      :on-exceeded-size="handleMaxSize"
                      :before-upload="handleBeforeUpload"
                      :headers="headObj"
                      name='files'
                      multiple
                      type="drag"
                      :action="uploadPath"
                      style="display: inline-block;width:58px;">
                      <div style="width: 58px;height:58px;line-height: 58px;">
                        <Icon type="ios-add" size="20"></Icon>
                      </div>
                    </dytUpload>
                    <div class="ml5 upload-exceed-text f12 fl">
                      <p>文件格式：jpg,jpeg,png</p>
                      <p>最大尺寸：1.5M</p>
                    </div>
                  </div>
                  <div class="r-address mt5">
                    <span class="white-space-nowrap">回寄地址：</span>
                    <div v-if="details.address">
                      <div>{{details.address.fullName}}</div>
                      <div v-if="details.address.primaryPhone && details.address.primaryPhone.number">{{ details.address.primaryPhone.countryCode }} - {{ details.address.primaryPhone.number }}</div >
                      <div v-if="details.address.addressLine1">{{ details.address.addressLine1 }}</div >
                      <div v-if="details.address.addressLine2">{{ details.address.addressLine2 }}</div >
                      <div >{{ details.address.county }} {{ details.address.city }} {{ details.address.stateOrProvince }} {{details.address.country}} </div >
                      <div >{{ details.address.postalCode }}</div >
                    </div>
                    <Icon type="md-create" class="cursor" size="18" @click="$refs.editAddress.open()" />
                  </div>
                  <div class="mt5" v-if="getPermission('ebayPaymentDispute_returnAddress')"><span class="blueColor cursor" @click="updateAddress">更新回寄地址</span></div>
                </div>
                <div v-show="respondParams.type === 1" class="mt10">
                  <Checkbox class="f14" v-model="respondParams.refundType">尝试让我的物品退回，</Checkbox>
                  <div class="r-address mt5">
                    <span class="white-space-nowrap">回寄地址：</span>
                    <div v-if="details.address">

                      <div>{{details.address.fullName}}</div>
                      <div v-if="details.address.primaryPhone && details.address.primaryPhone.number">{{ details.address.primaryPhone.countryCode }} - {{ details.address.primaryPhone.number }}</div >
                      <div v-if="details.address.addressLine1">{{ details.address.addressLine1 }}</div >
                      <div v-if="details.address.addressLine2">{{ details.address.addressLine2 }}</div >
                      <div >{{ details.address.county }} {{ details.address.city }} {{ details.address.stateOrProvince }} {{details.address.country}} </div >
                      <div >{{ details.address.postalCode }}</div >
                    </div>
                    <Icon type="md-create" class="cursor" size="18" @click="$refs.editAddress.open()" />
                  </div>
                  <div class="mt5"><span class="blueColor cursor" @click="updateAddress">更新回寄地址</span></div>
                </div>
              </div>
            </Card>
          </div>
          <div class="normalPadding">
            <Card dis-hover title="纠纷信息">
              <p class="d-flex justify-content-start"><span class="mr10">Dispute ID：</span><span>{{details.paymentDisputeId}}</span></p>
              <p class="d-flex justify-content-start"><span class="mr10">状态：</span><span>{{details.status}}</span></p>
              <p class="d-flex justify-content-start"><span class="mr10">留言：</span><span>{{details.note}}</span></p>
              <p class="d-flex justify-content-start"><span class="mr10">原因：</span><span>{{details.reason}}</span></p>
              <p class="d-flex justify-content-start"><span class="mr10">发起时间：</span><span>{{details.openDate}}</span></p>
              <p class="d-flex justify-content-start"><span class="mr10">争议金额：</span><span>{{details.amount}}{{details.currency}}</span></p>
            </Card>
          </div>
          <div class="normalPadding">
            <Card dis-hover title="处理过程">
              <p class="d-flex justify-content-start" v-for="(item, index) in details.activities" :key="index"><span >{{item.activityDate}}</span><span class="ml10">{{item.activityType}}</span></p>
            </Card>
          </div>
          <div class="normalPadding">
            <Button type="primary" class="mr10" @click="respond">回应</Button>
            <Button @click="orderDetailsStatus = false">取消</Button>
          </div>
        </div>
        <div>
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
        </div>
      </div>
    </Drawer>
    <Modal title="View Image" v-model="visible">
      <img :src="filenodeViewTargetUrl + viewImgUrl" v-if="visible" style="width: 100%">
    </Modal>
    <!--全部更新弹窗-->
    <Modal v-model="model1" @on-ok="updateAll" title="操作提示">
      确认是否要更新纠纷单信息，数量：{{ disputeNumber }}
    </Modal>
    <Modal v-model="model2" @on-ok="syncRequestId(activeRow)" title="操作提示">
      确认是否要更新纠纷单信息：<span v-if="activeRow">{{ activeRow.paymentDisputeId }}</span>
    </Modal>
    <editAddress ref="editAddress" @save="onAddressSave" ></editAddress>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
// import { getToken } from '@/utils/cookie';
import { EvidenceTypeEnum } from '@/utils/enum';
import editAddress from '@/views/customerCenter/components/ebayDisputesManager/editAddress';

const prefixCls = 'tongtool-customerCenter-ebayCancelOrder';
export default {
  mixins: [Mixin, orderSys],
  data () {
    let self = this;
    let v = this;
    return {
      // 详情数据
      /* {
          "addressLine1": "",
          "addressLine2": "",
          "city": "",
          "country": "",
          "county": "",
          "fullName": "",
          "postalCode": "",
          "primaryPhone": {
            "countryCode": "",
            "number": ""
          },
          "stateOrProvince": ""
        } */
      EvidenceTypeEnum: EvidenceTypeEnum,
      respondParams: {
        'addressType': 0,
        'ebayPaymentDisputeId': '',
        'evidenceType': '',
        'filePath': [],
        'returnAddress': null,
        'refundType': false,
        'revision': 0,
        'type': 0
      },
      activeRow: null,
      apiDetail: null,
      disputeNumber: 0,
      model: false,
      model1: false,
      model2: false,
      viewImgUrl: '',
      radioModel: '1',
      single: false,
      sellerTotalRefund: '',
      updateDisputeParams: {
        message: null,
        reason: null
      },
      allReturn: {
        comments: null
      },
      sendMessageParams: {
        message: null
      },
      portionReturn: {
        message: null,
        partialRefundAmount: 0
      },
      uploadPath: '-',
      historyJson: null,
      orderNo: null,
      expressSheetProvider: null,
      isReturn: false, // 是否需要退货
      returnAmount: 1, // 部分退货金额
      returnCurrency: null, // 退款
      availableOption: null,
      ebayRequestId: null,
      rejectParmas: {
        shipmentDate: null,
        trackingNumber: null
      },
      cancellation: false,
      handlerModel: null,
      responseDue: null,
      autoReturn: false,
      refundDetailsColumns: [
        {
          title: '',
          key: 'name',
          width: 100,
          align: 'right'
        }, {
          title: '',
          key: 'value',
          render: (h, params) => {
            if (params.row.type === 'address') {
              let name = '';
              let addressLine1 = '';
              let addressLine2 = '';
              let address = '';
              let postalCode = '';
              if (params.row.value.attributes.sellerReturnAddress) {
                let obj = params.row.value.attributes.sellerReturnAddress;
                name = obj.name;
                addressLine1 = obj.address.addressLine1;
                addressLine2 = obj.address.addressLine2;
                postalCode = obj.address.postalCode;
                address = obj.address.stateOrProvince + ' ' + obj.address.country + ' ' + obj.address.city;
              }

              return h('div', [
                h('div', {
                  style: {
                    whiteSpace: 'pre-wrap'
                  },
                  domProps: {
                    innerHTML: name
                  }
                }), h('div', {
                  style: {
                    whiteSpace: 'pre-wrap'
                  },
                  domProps: {
                    innerHTML: addressLine1
                  }
                }), h('div', {
                  style: {
                    whiteSpace: 'pre-wrap'
                  },
                  domProps: {
                    innerHTML: addressLine2
                  }
                }), h('div', {
                  style: {
                    whiteSpace: 'pre-wrap'
                  },
                  domProps: {
                    innerHTML: postalCode
                  }
                }), h('div', {
                  style: {
                    whiteSpace: 'pre-wrap'
                  },
                  domProps: {
                    innerHTML: address
                  }
                })
              ]);
            } else if (params.row.type === 'pictrue') {
              let imgs = [];
              params.row.value.filter(i => {
                if (i.extendKey === 'return_file' && i.extendValue) {
                  // return_file 退款退货
                  imgs.push(v.$store.state.erpConfig.filenodeViewTargetUrl + '/thumb' + i.extendValue);
                }
              });
              return h('div', {
                style: {
                  padding: '5px'
                }
              }, imgs.map(i => {
                return h('img', {
                  attrs: {
                    src: i
                  }
                });
              }));
            } else {
              return h('p', {
                style: {
                  whiteSpace: 'pre-wrap'
                },
                domProps: {
                  innerHTML: params.row.value
                }
              });
            }
          }
        }
        /* {
         title: '',
         key: 'pictrue',
         render: (h, params) => {
         if (params.row.pictrue) {
         let imgs = [];
         params.row.pictrue.filter(i => {
         if (i.extendKey === 'return_file' && i.extendValue) {
         // return_file 退款退货
         imgs.push(v.$store.state.erpConfig.filenodeViewTargetUrl + '/thumb' + i.extendValue);
         }
         });
         return h('div', {
         style: {
         padding: '5px'
         }
         }, imgs.map(i => {
         return h('img', {
         attrs: {
         src: i
         }
         });
         }));
         }
         }
         } */
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
      orderDetailsStatus: false,
      details: {},
      addressObj: {
        name: '',
        addressLine1: '',
        addressLine2: '',
        stateOrProvince: '',
        postalCode: '',
        country: ''
      },
      tableSltData: [], // ebay  订单详情 end
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'Dispute ID',
          key: 'paymentDisputeId',
          align: 'center',
          minWidth: 140
        }, {
          title: '订单号',
          key: 'saleRecordNumber',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('span', this.getSaleRecordNumber(params.row));
          }
        }, {
          title: '买家ID',
          minWidth: 140,
          align: 'center',
          key: 'buyerAccountId'
        }, {
          title: '原因',
          key: 'reason',
          align: 'center',
          minWidth: 140
        }, {
          title: '发起时间', // 发起时间
          key: 'openDate',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('span', this.getDateTime(params.row.openDate));
          }
        }, {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('span', this.$common.getDateTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 140
        }, {
          title: '最迟响应时间',
          key: 'responseByDate',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            if (params.row.responseByDate) {
              return h('span', this.getDateTime(params.row.responseByDate));
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 160,
          render: (h, params) => {
            return h('div', [
              self.getPermission('ebayPaymentDispute_detail') ? h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click () {
                    self.resetData();
                    let prefix = api.get_ebayPaymentDispute + params.row.paymentDisputeId;
                    self.uploadPath = prefix + api.put_ebayPaymentDisputeAddShippingLabel;
                    self.apiDetail = prefix + api.get_ebayPaymentDisputeDetail;
                    self.activeRow = params.row;
                    self.orderDetailsId = params.row.customerOrderInfoId;
                    self.orderRowsDetail = self.$common.copy(params.row);
                    self.timestamp = new Date().getTime();
                    self.getDetails();
                  }
                }
              }, '处理') : '', self.getPermission('ebayPaymentDispute_update') ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '10px'
                },
                on: {
                  click () {
                    self.activeRow = params.row;
                    self.model2 = true;
                  }
                }
              }, '更新') : ''
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
        endTime: null,
        startTime: null,
        itemId: null,
        initiateTime: this.$common.getRangeTime('', -1, 'month'),
        status: 'OPEN',
        saleRecordNumber: null,
        'buyerAccountId': '',
        'orderNos': null,
        'paymentDisputeId': '',
        'saleAccountIdList': []
      },
      statusList: [
        {
          selected: true,
          status: 'ACTION_NEEDED',
          title: '等待卖家回应'
        }, {
          selected: false,
          status: 'OPEN',
          title: '其他'
        }, {
          selected: false,
          status: 'CLOSED',
          title: '关闭'
        }
      ],
      visible: false,
      uploadList: []
    };
  },
  computed: {
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(290);
    }
  },
  components: {
    orderDetails,
    editAddress
  },
  mounted () {
    this.uploadList = this.$refs.upload.fileList;
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
        Promise.resolve(v.getList()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    },
    autoReturn (n, o) {
      if (n) {
        this.setAutoReturn(0);
      } else {
        this.setAutoReturn(1);
      }
    }
  },
  methods: {
    resetData () {
      this.$refs.upload.fileList.splice(0, this.$refs.upload.fileList.length);
      this.$nextTick(() => {
        for (let key in this.respondParams) {
          this.respondParams[key] = null;
        }
        this.respondParams.type = 0;
        this.respondParams.refundType = false;
      })
    },
    updateAddress () {
      this.axios.post(`${api.get_ebayPaymentDispute}${this.activeRow.ebayPaymentDisputeId}${api.put_ebayPaymentDisputeReturnAddress}`).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.respondParams.returnAddress = response.data.datas;
        }
      })
    },
    onAddressSave (data) {
      this.$set(this.details, 'address', data);
      this.$set(this.details.address, 'primaryPhone', data.primaryPhone);
    },
    respond () {
      let params = this.$common.copy(this.respondParams);
      params.ebayPaymentDisputeId = this.activeRow.ebayPaymentDisputeId;
      params.revision = this.activeRow.revision;
      params.refundType = params.refundType ? 1 : 0;
      params.returnAddress = this.details.address;
      if (params.type === 0) {
        params.filePath = this.uploadList.map(i => i.url);
        if (!params.evidenceType) {
          this.$Message.info('请选择证据类型');
          return;
        }
        if (!params.filePath || params.filePath.length === 0) {
          this.$Message.info('请添加证据');
          return;
        }
      }
      this.axios.put(api.put_ebayPaymentDispute_contestOrAcceptPaymentDispute, params).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.model1 = false;
        }
      });
    },
    getDetails () {
      this.$nextTick(() => {
        this.details = {};
        this.axios.put(this.apiDetail).then(response => {
          if (response.data.code === 0) {
            this.details = response.data.datas;
          }
        })
        this.orderDetailsStatus = true;
        this.timestamp = new Date().getTime();
      });
    },
    getUpdateNumber () {
      this.ajaxData({
        url: api.put_ebayPaymentDispute_updateNumber,
        type: 'put',
        data: {
          saleAccountIdList: this.pageParams.saleAccountIdList
        }
      }).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.disputeNumber = (res.data.datas || 0);
        this.model1 = true;
      }).catch((err) => {
        console.error(err);
      });
      // const awaitRes = (this.$common.isEmpty(this.pageParams.saleAccountIdList) ? [null] : this.pageParams.saleAccountIdList).map((m) => {
      //   return () => {
      //     return new Promise((resolve) => {
      //       this.ajaxData({
      //         url: api.put_ebayPaymentDispute_updateNumber,
      //         type: 'put',
      //         data: {
      //           saleAccountId: m
      //         }
      //       }).then(res => {
      //         if (!res || !res.data || res.data.code != 0) return resolve({ type: 'fail', key: m });
      //         resolve({ type: 'success', key: m, res: res });
      //       }).catch((err) => {
      //         console.error(err);
      //         resolve({ type: 'fail', key: m });
      //       });
      //     })
      //   }
      // });
      // this.$common.promiseAll(awaitRes).then(resArr => {
      //   let failLst = [];
      //   this.disputeNumber = 0;
      //   resArr.forEach((item) => {
      //     if (item.type == 'fail') {
      //       failLst.push(item.key);
      //     } else {
      //       this.disputeNumber = this.disputeNumber + (item.res.data.datas || 0);
      //     }
      //   })
      //   if (this.$common.isEmpty(failLst) || failLst.length != resArr.length) {
      //     this.model1 = true;
      //   }
      // });
    },
    handleView (url) {
      this.viewImgUrl = url;
      this.visible = true;
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file.url), 1);
    },
    handleSuccess (res, file) {
      file.url = res.datas[0];
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 6;
      if (!check) {
        this.$Notice.warning({
          title: 'Up to five pictures can be uploaded.'
        });
      }
      return check;
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 1.5M.'
      });
    },
    syncRequestId (activeRow) {
      let v = this;
      const obj = {
        url: api.get_ebayPaymentDispute + activeRow.ebayPaymentDisputeId + api.get_ebayPaymentDisputeUpdate,
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
      const obj = {
        url: api.put_ebayPaymentDisputeBatchUpdate,
        type: 'get'
      };
      this.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        }
      });
    },
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    }, // 导出所有结果集
    ExportAllBtn (name) {
      let obj = {};
      // 选中导出
      if (name === '0') {
        if (this.tableSltData.length > 0) {
          obj.ebayPaymentDisputeIds = this.tableSltData.map(val => val.ebayPaymentDisputeId);
          obj = Object.assign(obj, this.getSearchParams());
        } else {
          this.$Message.warning('请选择导出数据');
          return;
        }
      } else {
        obj = this.getSearchParams();
      }
      this.axios.post(api.post_ebayPaymentDisputeExport, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      });
    },
    setAutoReturn (value) {
      let v = this;
      const obj = {
        url: api.set_autoReturn + v.ebayRequestId + '?needAutoRefund=' + value,
        type: 'put'
      };
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    uploadSuccess (response, file, fileList) {
      let v = this;
      if (response.code === 0) {
        let data = response.datas;
        v.$Message.success('上传成功');
        if (data.length > 0) {
          // v.filesArr.push(data[0]);
        }
      } else {
        v.$Message.error('上传失败');
      }
    },
    uploadError () {
      this.$Message.error('操作失败，请重新尝试');
    },
    hanlerDisputes () { // 回应
      let v = this;
      if (v.handlerModel === '1') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_issueRefund,
          data: v.allReturn
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.allReturn.comments = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '2') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_processReturnRequest,
          data: {
            ...v.portionReturn,
            // 部分退款时，后端要求将原来的 decision: 'ACCEPT_PARTIAL_REFUND' 换成 decision: 'OFFER_PARTIAL_REFUND'
            decision: 'OFFER_PARTIAL_REFUND'
          }
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.portionReturn.partialRefundAmount = 0;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '3') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_processReturnRequest,
          data: v.portionReturn
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.portionReturn.partialRefundAmount = 0;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '4') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_processReturnRequest,
          data: v.portionReturn
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.portionReturn.partialRefundAmount = 0;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '5') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_sendMessage,
          data: {
            message: v.sendMessageParams.message
          }
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.sendMessageParams.message = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      } else if (v.handlerModel === '6') {
        const obj = {
          url: api.set_returnPrefix + v.ebayRequestId + api.set_updateDisput,
          data: v.updateDisputeParams
        };
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.sendMessageParams.message = null;
            v.$Message.success('操作成功');
            v.orderDetailsStatus = false;
            v.pageParamsStatus = true;
          }
        });
      }
    },
    selectShipmentDate (val) { // 选择日期
      let v = this;
      v.rejectParmas.shipmentDate = v.getUniversalTime(new Date(val).getTime());
    },
    resetShipmentDate () { // 重置日期
      let v = this;
      v.rejectParmas.shipmentDate = null;
    },
    getAuth (data) {
      return this.availableOption && this.availableOption.includes(data);
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(() => {
        v.$Loading.finish();
        v.getShopList(null, '/cs-service/erpCommon');
      });
    },
    // 返回搜索参数
    getSearchParams () {
      let obj = this.$common.copy(this.pageParams);
      obj.startTime = null;
      obj.endTime = null;
      const value = obj.initiateTime;
      if (!this.$common.isEmpty(value) && !this.$common.isEmpty(value[0]) && !this.$common.isEmpty(value[1])) {
        obj.startTime = this.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        obj.endTime = this.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
      delete obj.initiateTime;
      return obj;
    },
    getList () {
      let v = this;
      if (!v.getPermission('ebayPaymentDispute_query')) return
      const obj = {
        url: api.post_ebayPaymentDisputeQuery,
        type: 'POST',
        data: this.getSearchParams()
      };
      v.tableData = [];
      v.loadingTrue();
      v.ajaxData(obj).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data && data.list && data.list.length > 0) {
            let list = data.list;
            v.tableData = list;
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
      });
    },
    reset () {
      this.$refs['pageParams'].resetFields();
      this.selectStatus(0, 'OPEN');
      this.pageParams.initiateTime = this.$common.getRangeTime('', -1, 'month');
    },
    selectStatus (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.status = 'OPEN';
      } else if (index === 1) {
        v.pageParams.status = 'ACTION_NEEDED';
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
    },
    // 获取店铺代码+订单号
    getSaleRecordNumber (row) {
      if (this.shopList.length != 0) {
        let id = row.saleAccountId;
        let item = this.shopList.find(k => k.saleAccountId == id)
        return item.accountCode + '-' + row.saleRecordNumber;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.payment-drawer{
  :deep(.ivu-drawer-body) {
    padding: 0;
    .payment-dispute{
      &.flexBox{
        padding: 16px;
      }
    }
  }
}

.clearfix {
  clear: both;
}
.clearfix:after{
  content: '';
  height: 0;
  clear: both;
  display: block;
}
.w-p {
  margin-bottom: 5px;
}

.w-label {
  width: 110px;
  text-align: right;
  display: inline-block;
}

.upload-exceed-text {
  width: 150px;
}

.r-address {
  display: flex
}

.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  margin-right: 4px;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, .6);
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}

.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}

.mt5 {
  margin-top: 5px;
}
</style>
