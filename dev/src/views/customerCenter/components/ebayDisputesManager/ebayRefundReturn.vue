<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
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
                <FormItem label="状态分类" prop="ebayAccount">
                  <ButtonGroup>
                    <template v-for="(item, index) in statusList">
                      <Button v-if="item.selected" type="primary" @click="selectStatus(index, item.status)"
                        :key="index">{{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="selectStatus(index, item.status)" :key="index">{{ item.title
                      }} </Button>
                    </template>
                  </ButtonGroup>
                </FormItem>
                <Form-item label="发起时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate"
                    @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions"
                    placement="bottom-end" placeholder="选择发起时间" :value="payTimeArr" />
                </Form-item>
                <Form-item label="付款时间" prop="payTimeRange">
                  <Date-picker transfer type="datetimerange" style="width:100%" :clearable="clearAble"
                    format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placement="bottom-end" placeholder="选择付款时间"
                    v-model="pageParams.payTimeRange" />
                </Form-item>
                <FormItem label="状态" prop="statusValue">
                  <dyt-select v-model="pageParams.statusValue" filterable>
                    <Option v-for="(item, index) in statusValList" :key="index" :value="item.value" :label="item.label"
                      :v="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="平台产品编码" prop="itemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.itemId"></dyt-input>
                </FormItem>
                <FormItem label="return ID" prop="requestId">
                  <dyt-input placeholder="请输入cancel ID" v-model.trim="pageParams.requestId"></dyt-input>
                </FormItem>
                <FormItem label="订单号" prop="orderId">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入订单号, 多个订单号用逗号分隔"
                    v-model="pageParams.orderId" />
                </FormItem>
                <FormItem label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </FormItem>
                <FormItem label="SPU" prop="spus">
                  <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入SPU, 多个 SPU 用逗号分隔"
                    v-model="pageParams.spus" />
                </FormItem>
                <FormItem label="买家反馈图片" prop="hasPicture">
                  <dyt-select v-model="pageParams.hasPicture" filterable>
                    <Option :value="0">无</Option>
                    <Option :value="1">有</Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="原因" prop="reasonList">
                  <dyt-select v-model="pageParams.reasonList" :max-tag-count="1" multiple placeholder="请选择原因">
                    <Option v-for="(reason, index) in reasonData" :value="reason" :key="`rea-${index}`">{{ reason }}</Option>
                  </dyt-select>
                </FormItem>
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
    <div class="tableControl" style="display:flex;justify-content:space-between">
      <div>
        <Button type="primary" icon="logo-buffer" @click="updateAll" style="margin-right: 15px;"
          v-if="getPermission('ebayReturn_batchSync')">全部更新 </Button>

        <Dropdown @on-click="ExportAllBtn" v-if="getPermission('ebayRequest_export')">
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

      <div>
        <span>排序：</span>
        <Button-group>
          <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" @click="clickSortButton(item)"
            :key="item.value">{{ item.label }}
            <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
            <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
          </Button>
        </Button-group>
      </div>

    </div>
    <div class="orderTable normalTop">
      <keep-alive>
        <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="columns"
          @on-selection-change='tableSelectionChange' :data="tableData" class="fix-table-dislocation"></Table>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <sliderModal v-model="orderDetailsStatus" :spinShow="spinShow" :styles="sliderObjStyle"
      :buttonVisibile="buttonVisibile" v-if="orderDetailsBegin" :swStyles="swStyles"
      class="combineDetails slider-model">
      <div slot="header" v-if="orderDetailsStatus" class="combine-details">
        <div class="normalPadding">
          <Table stripe border :columns="cancelDetailsColumns" :show-header="false" :data="cancelDetailsData"></Table>
        </div>
        <div class="normalPadding">
          <Card :bordered="false">
            <p slot="title">处理过程</p>
            <template v-if="historyJson && historyJson.length > 0">
              <div v-for="(item, index) in historyJson" :key="index" class="normalTop">
                <div class="d-flex justify-content-start">
                  <span>{{ getDateTime(item.creationDate.value, 'fulltime') }}</span>
                  <span class="normalLMargin">{{ item.activity }}</span>
                </div>
                <Table v-if="item.tableArr && item.tableArr.length > 0" class="normalTop" size="small" stripe border
                  :columns="refundDetailsColumns" :show-header="false" :data="item.tableArr"></Table>
              </div>
            </template>
          </Card>
        </div>
        <div class="normalPadding" v-if="orderDetailsStatus">
          <Card :bordered="false">
            <p slot="title">退货跟踪信息</p>
            <Table
              class="normalTop"
              size="small"
              stripe
              border
              :columns="ebayLogisticsColumns"
              :show-header="false"
              :data="ebayLogisticsTable"
            />
            <div style="padding: 10px 0 0 0;" v-if="!$common.isEmpty(trackData) && $common.isArray(trackData)">物流轨迹</div>
            <div v-for="(rItem, rIndex) in trackData" :key="`rItem-${rIndex}`" class="ebay-logistics-track">
              <div>{{ `${rItem.eventTime && rItem.eventTime.value ? $common.dateTransform(rItem.eventTime.value) : ''}` }}</div>
              <div>{{ rItem.eventDesc || '' }}</div>
            </div>
          </Card>
        </div>
        <div class="normalPadding">
          <Card :bordered="false">
            <p slot="title">请在<span class="redColor">{{ responseDue }}</span>前回应 </p>
            <p>
              <!-- <template v-if="availableOption && (availableOption.includes('SELLER_ISSUE_REFUND') || availableOption.includes('SELLER_OFFER_PARTIAL_REFUND') || availableOption.includes('SELLER_SEND_MESSAGE'))"> -->
              <template>
                <div>
                  <RadioGroup v-model="handlerModel" vertical>
                    <Radio label="1" v-if="getPermission('ebayReturn_issueRefund') && getAuth('SELLER_ISSUE_REFUND')">
                      <span>全额退款</span>
                    </Radio>
                    <template v-if="handlerModel === '1'">
                      <div class="normalPadding d-flex justify-content-start">
                        <span>退款金额: </span>
                        <span class="redColor">
                          {{ sellerTotalRefund }} {{ returnCurrency }}
                        </span>
                      </div>
                      <div class="normalLMargin normalMarginBottom">
                        <div>留言:</div>
                        <Input type="textarea" v-model.trim="allReturn.comments" :row="4" style="width: 300px"></Input>
                      </div>
                    </template>
                    <Radio label="2"
                      v-if="getPermission('ebayReturn_processReturnRequest') && getAuth('SELLER_OFFER_PARTIAL_REFUND')">
                      <span>部分退款</span>
                    </Radio>
                    <template v-if="handlerModel === '2'">
                      <div class="normalPadding d-flex justify-content-start align-items-center">
                        <span>退款金额: </span> <span class="redColor normalLMargin">{{ returnCurrency }}</span>
                        <InputNumber class="normalLMargin" :min="1" size="small"
                          v-model.trim="portionReturn.partialRefundAmount" />
                      </div>
                      <div class="normalLMargin normalMarginBottom">
                        <div>留言:</div>
                        <Input type="textarea" v-model.trim="portionReturn.message" :row="4"
                          style="width: 300px"></Input>
                      </div>
                    </template>
                    <Radio label="3"
                      v-if="getPermission('ebayReturn_processReturnRequest') && getAuth('SELLER_APPROVE_REQUEST')">
                      <span>退货</span>
                    </Radio>
                    <Radio label="4"
                      v-if="getPermission('ebayReturn_processReturnRequest') && getAuth('SELLER_OFFER_REPLACEMENT')">
                      <span>已补发货</span>
                    </Radio>
                    <template v-if="handlerModel === '3' || handlerModel === '4'">
                      <div class="normalPadding">
                        <Checkbox v-model="isReturn" v-if="handlerModel === '4'">需要退货
                        </Checkbox>
                        <div>
                          <RadioGroup v-model="expressSheetProvider">
                            <Radio label="a1" disabled>由Ebay提供物流面单<span class="redColor">(暂不提供使用)</span>
                            </Radio>
                            <Radio label="a2" v-if="getAuth('SUBMIT_FILE')"
                              :disabled="handlerModel === '4' && !isReturn && getPermission('ebayReturn_addShippingLabel')">
                              由我提供物流面单
                            </Radio>
                          </RadioGroup>
                        </div>
                        <dytUpload
                          v-if="uploadPath && uploadHeader.hasOwnProperty('Authorization') && expressSheetProvider === 'a2'"
                          :action="uploadPath" :show-upload-list="false" :before-upload="handleBeforeUpload"
                          :headers="uploadHeader" :on-success="uploadSuccess" :on-error="uploadError" :multiple="true"
                          :format="['JPG', 'JPEG', 'GIF', 'PNG', 'BMP', 'PDF']" name="files">
                          <Button type="primary" class="normalRMargin">上传图片 </Button>
                        </dytUpload>
                        <div class="normalLMargin normalMarginBottom">
                          <div>留言:</div>
                          <Input type="textarea" v-model.trim="portionReturn.message" :row="4"
                            style="width: 300px"></Input>
                        </div>
                      </div>
                    </template>
                    <template v-if="getPermission('ebayReturn_escalate') && getAuth('SELLER_ESCALATE')">
                      <Radio label="6">
                        <span>升级</span>
                      </Radio>
                      <template v-if="handlerModel === '6'">
                        <div class="normalPadding">
                          <dyt-select v-model="updateDisputeParams.reason">
                            <Option value="BUYER_NORESPONSE">BUYER_NORESPONSE</Option>
                            <Option value="BUYER_RETURNED_WRONG_ITEM">BUYER_RETURNED_WRONG_ITEM</Option>
                            <Option value="DISAGREE_WITH_RETURN_REASON">DISAGREE_WITH_RETURN_REASON</Option>
                            <Option value="ITEM_NOT_RECEIVED">ITEM_NOT_RECEIVED</Option>
                            <Option value="ITEM_RECEIVED_IN_DIFFERENT_CONDITION">ITEM_RECEIVED_IN_DIFFERENT_CONDITION
                            </Option>
                            <Option value="TROUBLE_COMMUNICATION_WITH_BUYER">TROUBLE_COMMUNICATION_WITH_BUYER</Option>
                            <Option value="OTHER">OTHER</Option>
                          </dyt-select>
                          <div class="normalLMargin normalMarginBottom">
                            <div>留言:</div>
                            <Input type="textarea" v-model.trim="updateDisputeParams.message" :row="4"
                              style="width: 300px"></Input>
                          </div>
                        </div>
                      </template>
                    </template>
                    <Radio label="5" v-if="getPermission('ebayReturn_sendMessage') && getAuth('SELLER_SEND_MESSAGE')">
                      <span>发送留言</span>
                    </Radio>
                    <template v-if="handlerModel === '5'">
                      <div class="normalLMargin normalMarginBottom">
                        <div>留言:</div>
                        <Input type="textarea" v-model.trim="sendMessageParams.message" :row="4"
                          style="width: 300px"></Input>
                      </div>
                    </template>
                  </RadioGroup>
                </div>
              </template>
            </p>
          </Card>
        </div>
      </div>
      <div class="combine-footer-button" slot="footer">
        <Button type="primary" @click="hanlerDisputes">回应 </Button>
        <Button @click="orderDetailsStatus = !orderDetailsStatus" style="margin-left: 10px">取消 </Button>
      </div>
      <orderDetails
        ref="ebayCancelOrder"
        :hasEdit="false"
        :orderDetailsId="orderDetailsId"
        :orderRowsDetail="orderRowsDetail.orderInfoBo"
        target-source="ebayRefundReturn"
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
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import 'viewerjs/dist/viewer.css';
import { api as viewerApi } from 'v-viewer';
// import { getToken } from '@/utils/cookie';

const prefixCls = 'tongtool-customerCenter-ebayCancelOrder';
export default {
  mixins: [Mixin, orderSys],
  data() {
    return {
      // 详情数据
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
      uploadPath: null,
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
      reasonData: [
        'ARRIVED_DAMAGED',
        'ARRIVED_LATE',
        'BUYER_NO_SHOW',
        'DEFECTIVE_ITEM',
        'DOES_NOT_FIT',
        'FAKE_OR_COUNTERFEIT',
        'FOUND_BETTER_PRICE',
        'MISSING_PARTS',
        'NOT_AS_DESCRIBED',
        'NO_LONGER_NEED_ITEM',
        'NO_REASON',
        'ORDERED_ACCIDENTALLY',
        'ORDERED_DIFFERENT_ITEM',
        'ORDERED_WRONG_ITEM',
        'WRONG_SIZE'
      ],
      cancelDetailsColumns: [
        {
          title: '',
          key: 'name',
          align: 'right'
        }, {
          title: '',
          key: 'value',
          render: (h, params) => {
            if (params.row.type === '1') {
              return h('div', [
                !this.getPermission('ebayRequest_changeNeedAutoRefund') || h('Checkbox', {
                  props: {
                    value: params.row.value
                  },
                  on: {
                    'on-change': (value) => {
                      this.autoReturn = value;
                    }
                  }
                }), h('span', '买家升级纠纷后，无需自动退款')
              ]);
            } else {
              return h('span', params.row.value);
            }
          }
        }
      ],
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
              let bigImgs = [];
              params.row.value.filter(i => {
                if (i.extendKey === 'return_file' && i.extendValue) {
                  // return_file 退款退货
                  imgs.push(this.$store.state.erpConfig.filenodeViewTargetUrl + '/thumb' + i.extendValue);
                  bigImgs.push(this.$store.state.erpConfig.filenodeViewTargetUrl + i.extendValue);
                }
              });
              return h('div', {
                style: {
                  padding: '5px'
                }
              }, imgs.map((i, index) => {
                return h('img', {
                  style: {
                    'cursor': 'pointer',
                    'padding': '0 5px 5px 0',
                    'max-width': 'calc(50% - 5px)'
                  },
                  on: {
                    click: () => {
                      this.popupViewer(index, bigImgs);
                    }
                  },
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
         imgs.push(this.$store.state.erpConfig.filenodeViewTargetUrl + '/thumb' + i.extendValue);
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
          title: 'Return Id',
          key: 'requestId',
          align: 'center',
          minWidth: 140
        }, {
          title: '订单号',
          key: 'orderId',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('div', {
              style: {
                color: this.getPermission('order_detail') ? '#0054A6' : '#515a6e',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  if (this.getPermission('order_detail')) {
                    this.orderNo = params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber;
                    this.showOrder(params);
                  }
                }
              }
            }, params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber);
          }
        }, {
          title: '买家ID',
          minWidth: 140,
          align: 'center',
          render: (h, params) => {
            if (params.row.orderInfoBo) {
              return h('span', params.row.orderInfoBo.buyerAccountId);
            }
          }
        }, {
          title: '原因',
          key: 'reason',
          align: 'center',
          minWidth: 140
        },
        {
          title: '付款时间',
          key: 'payTime',
          align: 'center',
          minWidth: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.orderInfoBo) || this.$common.isEmpty(row.orderInfoBo.payTime)) {
              return h('span', '');
            }
            return h('span', this.$common.toLocaleDate(row.orderInfoBo.payTime, 'fulltime'));
          }
        },
        {
          title: '发起时间', // 发起时间
          key: 'initiatesTime',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return h('span', this.getDateTime(params.row.initiatesTime));
          }
        },
        {
          title: '更新时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 140
        }, {
          title: '状态',
          key: 'state',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            let text = params.row.state
            return h('span', {
              style: { color: this.redTextList.includes(text) ? 'red' : '' }
            }, text);
          }
        }, {
          title: '最迟响应时间',
          key: 'responseDue',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            if (params.row.responseDue) {
              return h('span', this.getDateTime(params.row.responseDue));
            }
          }
        },
        {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 160,
          render: (h, params) => {
            return h('div', [
              !this.getPermission('ebayRequest_detail') || h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.orderNo = params.row.accountCode + '-' + params.row.orderInfoBo.salesRecordNumber;
                    this.showOrder(params);
                  }
                }
              }, '处理'), !this.getPermission('ebayReturn_sync') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginLeft: '10px'
                },
                on: {
                  click: () => {
                    this.syncRequestId(params.row.ebayRequestId);
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
      payTimeArr: [],
      clearAble: true,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        hasPicture: null,
        requestType: 'RETURN',
        endTime: null,
        startTime: null,
        itemId: null,
        requestId: null,
        saleAccountIdList: [],
        status: 'WAITSELLER',
        orderId: null,
        statusValue: -1,
        upDown: 'down',
        spus: [],
        reasonList: [],
        payTimeRange: [],
        buyerAccountId: null,
        orderBy: 'status'
      },
      statusList: [
        {
          selected: true,
          status: 'WAITSELLER',
          title: '等待卖家回应'
        }, {
          selected: false,
          status: 'OTHER',
          title: '其他'
        }, {
          selected: false,
          status: 'CLOSED',
          title: '关闭'
        }
      ],
      statusValList: [],
      statusValList1: [
        { value: -1, label: '全部' },
        { value: 1, label: 'ITEM_DELIVERED' },
        { value: 2, label: 'RETURN_REQUESTED' },
        { value: 3, label: 'PARTIAL_REFUND_DECLINED' },
        { value: 4, label: 'RETURN_REQUESTED_TIMEOUT' },
        { value: 5, label: 'REFUND_FAILED' },
        { value: 6, label: 'PARTIAL_REFUND_REQUESTED' },
        { value: 7, label: 'REFUND_TIMEOUT' },
        { value: 8, label: 'REFUND_INITIATED' }
      ],
      statusValList2: [
        { value: -1, label: '全部' },
        { value: 1, label: 'ITEM_SHIPPED' },
        { value: 2, label: 'ITEM_DELIVERED' },
        { value: 3, label: 'RETURN_LABEL_PENDING' },
        { value: 4, label: 'RETURN_LABEL_PENDING_TIMEOUT' },
        { value: 5, label: 'ITEM_READY_TO_SHIP' },
        { value: 6, label: 'RETURN_INITIATED' }
      ],
      statusValList3: [
        { value: -1, label: '全部' },
        { value: 1, label: 'CLOSED' },
        { value: 2, label: 'ESCALATED' }
      ],
      sortData: [
        {
          label: '按状态',
          value: 'status',
          checked: true,
          toogle: true
        }, {
          label: '更新时间',
          value: 'updatedTime',
          checked: false,
          toogle: true
        }
      ],
      ebayLogisticsColumns: [
        {
          title: 'label',
          key: 'label',
          align: 'center',
          width: 100
        },
        {
          title: 'value',
          key: 'value',
          align: 'center',
          minWidth: 140
        }
      ],
      cacheClickVal: 'status',
      redTextList: ['PARTIAL_REFUND_DECLINED', 'ITEM_SHIPPED', 'ESCALATED']
    };
  },
  computed: {
    uploadHeader() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    wrap() {
      return `${prefixCls}`;
    },
    tableHeight() {
      return this.getTableHeight(320);
    },
    // 付款收款信息
    payDetails() {
      const orderDetailsData = this.$store.getters.getOrderDetails;
      let platform = '';
      if (this.$common.isEmpty(orderDetailsData)) return [];
      if (!this.$common.isEmpty(orderDetailsData.orderInfo)) {
        platform = orderDetailsData.orderInfo.platformId || '';
      }
      if (orderDetailsData && orderDetailsData.platformFeatures && orderDetailsData.platformFeatures.length !== 0 && platform === 'ebay') {
        return orderDetailsData.platformFeatures.map(item => {
          return {
            ...item,
            paypalMethod: true,
            orderPaymentsStatus: false,
            payAmount: item.grossAmount,
            actuallyAmount: item.grossAmount - item.feeAmount,
            feeAmount: (item.feeAmount * 2).toFixed(2),
            payCurrency: item.currency
          }
        });
      }
      if (this.$common.isEmpty(orderDetailsData.orderInfo) || this.$common.isEmpty(orderDetailsData.orderInfo.orderPayments)) return [];
      if (platform === 'aliexpress') {
        return orderDetailsData.orderInfo.orderPayments.map(item => {
          return {
            ...item,
            paypalMethod: false,
            orderPaymentsStatus: true,
            transactionPrice: this.$common.isEmpty(item.transactionPrice) ? 0 : item.transactionPrice.toFixed(2),
            paymentFee: this.$common.isEmpty(item.paymentFee) ? 0 : item.paymentFee,
            payAmount: item.transactionPrice,
            actuallyAmount: (this.$common.isEmpty(item.actuallyAmount) ? 0 : item.actuallyAmount) + Number((item.transactionPrice - item.paymentFee)),
            feeAmount: item.paymentFee.toFixed(2),
            payCurrency: item.transactionPriceCurrency,
            paymentMethod: item.paymentMethodName
          }
        });
      }
      return orderDetailsData.orderInfo.orderPayments.map(item => {
        return {
          ...item,
          paypalMethod: false,
          orderPaymentsStatus: true,
          payAmount: item.transactionPrice,
          actuallyAmount: item.transactionPrice - (item.paymentFee || 0),
          feeAmount: item.paymentFee === null ? 0 : item.paymentFee.toFixed(2),
          payCurrency: item.transactionPriceCurrency,
          paymentMethod: item.paymentMethodName
        }
      });
    },
    // 计算收款总额
    getToalPrice () {
      const payDetails = this.payDetails;

      if (this.$common.isEmpty(payDetails)) {
        return {
          refundTotal: null,
          priceCurrency: null
        };
      }
      let refundTotal = 0;
      let transactionPrice = 0;
      payDetails.forEach(item => {
        if (!this.$common.isEmpty(transactionPrice)) {
          refundTotal += item.actuallyAmount
        }
      })
      return {
        refundTotal: refundTotal.toFixed(2),
        priceCurrency: payDetails[0].transactionPriceCurrency
      };
    },
    // 退货跟踪信息
    ebayLogisticsTrack () {
      if (this.$common.isEmpty(this.orderRowsDetail.ebayLogisticsTrack)) return {}
      return this.orderRowsDetail.ebayLogisticsTrack;
    },
    // 退货跟踪信息-表格
    ebayLogisticsTable () {
      if (this.$common.isEmpty(this.ebayLogisticsTrack)) {
        return [{
          label: '跟踪号',
          value: '',
        },
        {
          label: '渠道商',
          value: '',
        }]
      }
      return [{
        label: '跟踪号',
        value: this.ebayLogisticsTrack.trackingNumber || '',
      },
      {
        label: '渠道商',
        value: this.ebayLogisticsTrack.carrierUsed || '',
      }]
    },
    // 物流轨迹
    trackData () {
      // 接口返回的示例
      // [{"eventCode":"UNKNOWN","eventDesc":"Delivered by","eventStatus":"DELIVERED","eventTime":{"value":"2023-05-12T14:32:23.000Z"}}]
      if (this.$common.isEmpty(this.ebayLogisticsTrack)) return [];
      if (typeof this.ebayLogisticsTrack.paramJson === 'string') {
        return JSON.parse(this.ebayLogisticsTrack.paramJson);
      }
      return this.ebayLogisticsTrack.paramJson;
    }
  },
  components: {
    orderDetails
  },
  created() {
    this.statusValList = this.statusValList1
  },
  watch: {
    domWidth: { // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler(n) {
        this.left = 460;
        this.sliderObjStyle = { width: `${n - (240 + this.left)}px` };
        this.swStyles = {
          width: `${this.left}px`,
          left: `-${this.left}px`,
          top: '0',
          height: '100%'
        };
      },
      immediate: true
    },
    pageParamsStatus(n) {
      if (n) {
        this.$Loading.start();
        Promise.resolve(this.getPermission('ebayReturn_query') ? this.getList() : this.gotoError()).then(() => {
          this.$Loading.finish();
        });
        this.pageParamsStatus = false;
      }
    },
    autoReturn(n, o) {
      if (n) {
        this.setAutoReturn(0);
      } else {
        this.setAutoReturn(1);
      }
    },
    orderDetailsStatus (val) {
      if (val) return;
      this.handlerModel = null;
    }
  },
  methods: {
    syncRequestId(requestId) {
      const obj = {
        url: api.set_returnPrefix + requestId + api.set_ebaySync,
        type: 'get'
      };
      this.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.pageParamsStatus = true;
        }
      });
    },
    popupViewer(index, list) {
      viewerApi({
        options: {
          toolbar: true,
          url: 'dataSource',
          initialViewIndex: index
        },
        images: list.map(m => {
          return { dataSource: m, src: m }
        })
      })
    },
    updateAll() {
      if (this.$common.isEmpty(this.pageParams.saleAccountIdList)) {
        this.ajaxData({
          url: api.set_ebayReturnBatchSync,
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
              url: `${api.set_ebayReturnBatchSync}?saleAccountId=${m}`,
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
    tableSelectionChange(selection) {
      this.tableSltData = selection;
    }, // 导出所有结果集
    ExportAllBtn(name) {
      let obj = {};
      // 选中导出
      let reqParams = this.removeMinusPageParams();
      if (name === '0') {
        if (this.tableSltData.length > 0) {
          obj.ebayRequestIds = this.tableSltData.map(val => val.ebayRequestId);
          obj = Object.assign(obj, reqParams);
        } else {
          this.$Message.warning('请选择导出数据');
          return;
        }
      } else {
        obj = reqParams;
      }
      this.axios.post(api.post_ebayRequest, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      });
    },
    setAutoReturn(value) {
      const obj = {
        url: api.set_autoReturn + this.ebayRequestId + '?needAutoRefund=' + value,
        type: 'put'
      };
      this.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    handleBeforeUpload() {
      // let v = this;
    },
    uploadSuccess(response, file, fileList) {
      if (response.code === 0) {
        let data = response.datas;
        this.$Message.success('上传成功');
        if (data.length > 0) {
          // this.filesArr.push(data[0]);
        }
      } else {
        this.$Message.error('上传失败');
      }
    },
    uploadError() {
      this.$Message.error('操作失败，请重新尝试');
    },
    hanlerDisputes() { // 回应
      const details = document.querySelector('.combine-details');
      const detailParent = details.parentNode;
      detailParent.scrollTop = details.offsetHeight;
      if (this.handlerModel === '1') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_issueRefund,
          data: this.allReturn
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.allReturn.comments = null;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      } else if (this.handlerModel === '2') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_processReturnRequest,
          data: {
            ...this.portionReturn,
            // 部分退款时，后端要求将原来的 decision: 'ACCEPT_PARTIAL_REFUND' 换成 decision: 'OFFER_PARTIAL_REFUND'
            decision: 'OFFER_PARTIAL_REFUND'
          }
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.portionReturn.partialRefundAmount = 0;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      } else if (this.handlerModel === '3') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_processReturnRequest,
          data: this.portionReturn
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.portionReturn.partialRefundAmount = 0;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      } else if (this.handlerModel === '4') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_processReturnRequest,
          data: this.portionReturn
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.portionReturn.partialRefundAmount = 0;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      } else if (this.handlerModel === '5') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_sendMessage,
          data: {
            message: this.sendMessageParams.message
          }
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.sendMessageParams.message = null;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      } else if (this.handlerModel === '6') {
        const obj = {
          url: api.set_returnPrefix + this.ebayRequestId + api.set_updateDisput,
          data: this.updateDisputeParams
        };
        this.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            this.sendMessageParams.message = null;
            this.$Message.success('操作成功');
            this.orderDetailsStatus = false;
            this.pageParamsStatus = true;
          }
        });
      }
    },
    selectShipmentDate(val) { // 选择日期
      this.rejectParmas.shipmentDate = this.getUniversalTime(new Date(val).getTime());
    },
    resetShipmentDate() { // 重置日期
      this.rejectParmas.shipmentDate = null;
    },
    showOrder(params) {
      // let address = '';
      let pictrue = [];
      this.orderDetailsId = params.row.orderInfoBo.customerOrderInfoId;
      this.orderRowsDetail = this.$common.copy(params.row || {});
      this.ebayRequestId = params.row.ebayRequestId;
      this.returnAmount = params.row.orderInfoBo.totalPrice;
      this.sellerTotalRefund = params.row.sellerTotalRefund;
      this.returnCurrency = params.row.refundCurrency;

      this.addressObj.name = params.row.name;
      this.addressObj.addressLine1 = params.row.street1;
      this.addressObj.addressLine2 = params.row.street2;
      this.addressObj.stateOrProvince = params.row.stateOrProvince;
      this.addressObj.postalCode = params.row.postalCode;
      this.addressObj.country = params.row.country;

      this.uploadPath = api.set_returnPrefix + this.ebayRequestId + api.set_addShippingLabel;
      this.availableOption = params.row.availableOption.split(',');
      let historyJson = JSON.parse(params.row.responseHistory);
      // if (params.row.country) {
      //   address += params.row.country;
      // }
      // if (params.row.city) {
      //   address += params.row.city;
      // }
      // if (params.row.county) {
      //   address += params.row.county;
      // }

      if (params.row.ebayRequestExtendList) {
        pictrue = params.row.ebayRequestExtendList;
      }
      historyJson.forEach((n, i) => {
        if (n.notes) {
          if (!n.tableArr) {
            n.tableArr = [];
          }
          n.tableArr.push({
            name: '留言',
            value: n.notes
          });
        }
        if (i === 0) {
          if (!n.tableArr) {
            n.tableArr = [];
          }
          n.tableArr.push({
            name: '回寄地址',
            type: 'address',
            value: JSON.parse(JSON.stringify(n))
          });
        }

        if (i === 0 && pictrue && pictrue.length > 0) {
          if (!n.tableArr) {
            n.tableArr = [];
          }
          // 第一个展示图片
          n.tableArr.push({
            name: '图片',
            type: 'pictrue',
            value: pictrue
          });
        }
      });
      this.historyJson = historyJson;
      let date = new Date().getTime();
      this.cancelDetailsData = [
        {
          name: 'Return Id',
          value: params.row.requestId
        }, {
          name: '原因',
          value: params.row.reason || ''
        }, {
          name: '买家期望',
          value: params.row.flowType
        }, {
          name: '状态',
          value: params.row.state
        }, {
          name: '发起时间',
          value: params.row.initiatesTime
        }, {
          name: '留言',
          value: params.row.comments
        }, {
          name: '自动退款',
          type: '1',
          value: params.row.needAutoRefund
        }
      ];
      this.responseDue = this.getDateTime(params.row.responseDue);
      // this.packageRadioModel = '新的包裹';
      // this.combineModel.packageCode = null;
      this.orderDetailsBegin = true;
      this.$nextTick(() => {
        this.timestamp = date;
        this.$nextTick(() => {
          this.orderDetailsStatus = true;
        })
      });
    },
    getAuth(data) {
      return this.availableOption && this.availableOption.includes(data);
    },
    startLoading() {
      this.$Loading.start();
      Promise.resolve(this.getList()).then(() => {
        this.$Loading.finish();
        this.getShopList(null, '/cs-service/erpCommon');
      });
    },
    getList() {
      let reqParams = this.removeMinusPageParams();
      const obj = {
        url: api.get_cancelList,
        type: 'POST',
        data: reqParams
      };
      this.tableData = [];
      this.loadingTrue();
      this.ajaxData(obj).then(response => {
        this.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          let saleAccountIdPos = [];
          let pos = [];
          if (data && data.list.length > 0) {
            let list = data.list;
            list.forEach((n, i) => {
              if (n.orderInfoBo) {
                pos.push(n);
                saleAccountIdPos.push(n.saleAccountId);
              }
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              const getData = async () => {
                const Arr = await this.getAccountCode(pos, saleAccountIdPos);
                this.tableData = Arr;
              }
              getData();
            }
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.tableData = [];
            this.loadingFalse();
            this.$nextTick(() => {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        }
      }).catch(() => {
        this.loadingFalse();
      })
    },
    reset() {
      this.$refs['pageParams'].resetFields();
      this.payTimeArr = [];
      this.resetDate();
    },
    getDateValue(value) { // 获取日期返回值
      if (value.length === 0) {
        this.$Message.error('日期格式有误');
        this.resetDate();
      } else {
        if (value[0] === '' || value[0] === null) return false;
        this.pageParams.startTime = this.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        this.pageParams.endTime = this.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    },
    resetDate() {
      this.pageParams.startTime = null;
      this.pageParams.endTime = null;
    },
    selectStatus(index, status) {
      this.pageParams.statusValue = -1;
      if (index === 0) {
        this.pageParams.status = 'WAITSELLER';
        this.statusValList = this.statusValList1
      } else if (index === 1) {
        this.pageParams.status = 'OTHER';
        this.statusValList = this.statusValList2
      } else {
        this.pageParams.status = 'CLOSED';
        this.statusValList = this.statusValList3
      }
      this.statusList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      // this.pageParamsStatus = true;
    },
    // 将值为-1的字段值改为Null
    removeMinusPageParams() {
      let reqParams = this.$common.copy(this.pageParams);
      for (let i in reqParams) {
        if (reqParams[i] == -1) {
          reqParams[i] = null
        }
      }
      if (!this.$common.isEmpty(reqParams.payTimeRange) && !this.$common.isEmpty(reqParams.payTimeRange[0]) && !this.$common.isEmpty(reqParams.payTimeRange[1])) {
        reqParams.payStartTime = this.$common.getUniversalTime(reqParams.payTimeRange[0], 'YYYY-MM-DD HH:mm:ss');
        reqParams.payEndTime = this.$common.getUniversalTime(reqParams.payTimeRange[1], 'YYYY-MM-DD HH:mm:ss');
      } else {
        reqParams.payStartTime = null;
        reqParams.payEndTime = null;
      }
      delete reqParams.payTimeRange;
      if (reqParams.statusValue) {
        reqParams.statusValue = this.statusValList[reqParams.statusValue].label
      }
      return reqParams;
    },
    clickSortButton(data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.upDown = 'down';
      } else {
        this.pageParams.upDown = 'up';
      }
      this.sortData.forEach((n) => {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.search();
    }
  }
};
</script>
<style lang="less" scoped>
.combine-footer-button{
  position: sticky;
  bottom: 0;
  padding: 10px;
  text-align: right;
  background: #fff;
  box-shadow: -1px 0 5px #707070;
  z-index: 999;
}
.ebay-logistics-track{
  padding-top: 10px;
  line-height: 1.6em;
  font-size: 12px;
  color: #999;
  :nth-of-type(1) {
    font-weight: bold;
  }
  // &:last-child{
  //   color: #222
  // }
}
</style>
