<template>
  <div :class="wrap">
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="100" style="padding-top: 10px">
            <dyt-filter>
                  <FormItem label="平台" prop="platformId" class="normalRight">
                    <dyt-select class="wid256" v-model="pageParams.platformId" @on-change="platFormChange">
                      <Option
                        v-for="(item,index) in platformGroup"
                        :key="index"
                        :value="item.platformId"
                        :label="item.title"
                      />
                    </dyt-select>
                  </FormItem>
                  <FormItem label="店铺" prop="saleAccountIdList" class="buttonForm normalRight">
                    <dytStoreSelect
                      v-model="pageParams.saleAccountIdList"
                      :option-data="shopList"
                      :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                      placeholder="请选择店铺，可输入搜索"
                      input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                    />
                  </FormItem>
                  <FormItem label="审批状态" prop="approveStatus" class="notplatformParamsSelect">
                    <local-buttons :data="tabsData" :value.sync="pageParams.approveStatus" @btnClick="btnClick"></local-buttons>
                  </FormItem>
                <FormItem label="执行状态" prop="exeStatus" class="notplatformParamsSelect">
                  <local-buttons :data="tabsData1" :value.sync="pageParams.exeStatus"></local-buttons>
                </FormItem>
                  <FormItem label="售后原因" prop="reason">
                    <dyt-select class="wid256" v-model="pageParams.reason" @on-change="platFormChange">
                      <Option
                        v-for="(item,index) in reasonList"
                        :key="index"
                        :value="item.paramValue"
                        :label="item.paramKey"
                      />
                    </dyt-select>
                  </FormItem>
                  <FormItem label="提交人" class="normalRight" prop="submittedBy">
                    <dyt-select class="wid256" v-model="pageParams.submittedBy" @on-change="platFormChange">
                      <Option
                        v-for="(item,index) in $store.state.userInfoList"
                        :key="index"
                        :value="item.userId"
                      >{{ item.userName }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="是否系统创建" class="normalRight" prop="systemCreated">
                    <dyt-select class="wid256" v-model="pageParams.systemCreated">
                      <Option
                        v-for="(item,index) in isSteamCreate"
                        :key="index"
                        :value="item.value"
                      >{{ item.label }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem class="normalRight">
                    <div slot="label" class="form-item-label-select notplatformParamsSelect">
                      <dyt-select v-model="orderTypeParamsValue" @on-change="orderTypeChange">
                        <Option
                          v-for="(item,index) in orderTypeParamsList"
                          :key="index"
                          :value="item.value"
                          :label="item.label"
                        />
                      </dyt-select>
                    </div>
                    <dyt-input-tag
                      type="textarea"
                      :limit="1"
                      :string="false"
                      :placeholder="`请输入${orderTypeText}, 多个用逗号或换行分隔`"
                      v-if="orderTypeParamsValue==='1'"
                      class="wid256"
                      v-model.trim="pageParams.orderNo"
                    />
                    <dyt-input-tag
                      type="textarea"
                      :limit="1"
                      :string="false"
                      :placeholder="`请输入${orderTypeText}, 多个用逗号或换行分隔`"
                      v-if="orderTypeParamsValue==='2'"
                      class="wid256"
                      v-model.trim="pageParams.buyerAccountId"
                    />
                    <dyt-input-tag
                      type="textarea"
                      :limit="1"
                      :string="false"
                      :placeholder="`请输入${orderTypeText}, 多个用逗号或换行分隔`"
                      v-if="orderTypeParamsValue==='3'"
                      class="wid256"
                      v-model.trim="pageParams.afterSalesCode"
                    />
                    <dyt-input-tag
                      type="textarea"
                      :limit="1"
                      :string="false"
                      :placeholder="`请输入${orderTypeText}, 多个用逗号或换行分隔`"
                      v-if="orderTypeParamsValue==='4'"
                      class="wid256"
                      v-model.trim="pageParams.sku"
                    />
                  </FormItem>
                  <FormItem class="normalRight">
                    <div slot="label" class="form-item-label-select notplatformParamsSelect">
                      <dyt-select v-model="timeParamsValue" @on-change="resetDate">
                        <Option
                          v-for="(item,index) in timeParamsList"
                          :key="index"
                          :value="item.value"
                          :label="item.label"
                        />
                      </dyt-select>
                    </div>
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
                      :value="payTimeArr"></Date-picker>
                  </FormItem>
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <!--排序-->
    <div class="dataSort grayBg">
      <span>排序方式：</span>
      <Button-group>
        <template v-for="(item,index) in buttonGroupModel">
          <Button v-if="item.selected" :key="index" type="primary" @click="modifyTheSort(index, item.status)">
            {{ item.title }}
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
          </Button>
          <Button v-if="!item.selected" :key="index" @click="modifyTheSort(index, item.status)">
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
          </Button>
        </template>
      </Button-group>
    </div>
    <!--操作-->
    <div class="dataSort grayBg opts_box">
      <div>
        <Button @click="addPostSale" v-if="getPermission('afterSales_insert')">新建</Button>
        <Buttons
          type="primary"
          style="margin-left: 20px"
          trigger="click"
          v-if="getPermission('afterSales_export')"
          @on-click="exportExcel">
          <Button type="primary" @click="exportExcel(0)">EXCEL导出</Button>
          <Buttons-menu slot="list">
            <Buttons-item :name="1">导出（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Dropdown style="margin-left: 20px" v-show="pageParams.approveStatus === 0 || pageParams.approveStatus === 1">
          <Button type="primary">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem
              v-show="pageParams.approveStatus === 0"
              @click.native="batchReview"
              v-if="getPermission('afterSales_batchSubmitApprove')">提交审批
            </DropdownItem>
            <DropdownItem
              v-show="pageParams.approveStatus === 1"
              v-if="getPermission('afterSales_batchApprovePass')"
              @click.native="batchApprovePass">审批通过
            </DropdownItem>
            <DropdownItem
              v-show="pageParams.approveStatus === 1"
              @click.native="batchBackReview"
              v-if="getPermission('afterSales_batchBackReview')">返回修改
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div>
        <Checkbox v-model="approved" v-if="getPermission('afterSales_autoSaveReview')"
          @on-change="saveAutoReview">系统自动创建的售后单不自动审核通过
        </Checkbox>
      </div>
    </div>
    <div class="plr10 table-content">
      <Table
        border
        highlight-row
        :height="tableHeight"
        :loading="tableLoading"
        :columns="columns1"
        :data="tableDate"
        @on-selection-change="checkDataMt"></Table>
      <div class="table-page">
        <div class="table-page-right">
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
            :page-size-opts="pageArray"></Page>
        </div>
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
        class="combineDetails postSaleTreatment-combineDetails"
      >
        <!-- <div slot="header"></div> -->
        <div slot="content">
          <post-sale-step
            :moal-visible="orderDetailsStatus"
            :editType="editType"
            :orderNo.sync="orderNo"
            :open="timestamp1"
            :reasonList="reasonList"
            :postDetail="postDetail"
            @searchOrderCallback="searchOrderCallback"
            @saveSuccess="saveSuccess"
          />
        </div>
        <!-- <div slot="footer"></div> -->
        <div>
          <Alert v-if="!isShowOrderDetail">订单信息</Alert>
          <orderDetails
            v-if="isShowOrderDetail"
            :hasEdit="false"
            ref="goodReputation"
            :orderDetailsId="orderDetailsId"
            :orderRowsDetai="orderRowsDetail"
            :prefix="'/cs-service'"
            :orderNo.sync="orderNo"
            :timestamp="timestamp"
            @spinLoading="spinLoading"
            @resetSpinShow="resetSpinShow"
            @updateList="getList"
            :buttonVisibile="buttonVisibile"
            inPage="goodReputation"
            :moal-visible.sync="orderDetailsStatus"
          />
        </div>
      </sliderModal>
    </keep-alive>
  </div>
</template>
<style scoped>
.wid256 {
  width: 256px;
}

.wid-all {
  width: 100%;
}

.opts_box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #fff !important;
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

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      approved: false,
      postDetail: {},
      isShowOrderDetail: false,
      editType: 'add',
      swStyles: null,
      checkedData: [],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          title: '售后单号',
          align: 'center',
          key: 'afterSalesCode',
          width: 130
        },
        {
          title: '订单号',
          key: 'orderId',
          align: 'center',
          width: 180,
          render (h, params) {
            return h(
              'span',
              params.row.accountCode + '-' + params.row.salesRecordNumber
            );
          }
        },
        {
          title: '退款',
          align: 'center',
          key: 'refundStatus',
          width: 100,
          render (h, params) {
            let text = '';
            if (params.row.refundStatus === 0) {
              text = '未退款';
            } else if (params.row.refundStatus === 1) {
              text = '退款失败';
            } else if (params.row.refundStatus === 2) {
              text = '退款完成';
            }
            return h('span', text);
          }
        },
        {
          title: '退款金额',
          key: 'refundAmount',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.refundAmount)) return h('span', '');
            const amount = Number(row.refundAmount);
            return h('span', `${this.$common.isEmpty(amount) ? row.refundAmount : amount.toFixed(2)} ${row.refundCurrency || ''}`);
          }
        },
        {
          title: '退货',
          align: 'center',
          key: 'returnDesc',
          width: 100
        },
        {
          title: '已补发货',
          align: 'center',
          key: 'warehouseStoreType',
          width: 160,
          render (h, params) {
            let text = '';
            // 仓库退货补发状态 00未收到货物,未补发 01已入库,已补发 11取消退货入库
            if (params.row.warehouseStoreType === '00') {
              text = '未收到货物,未补发';
            } else if (params.row.warehouseStoreType === '01') {
              text = '已入库,已补发';
            } else if (params.row.warehouseStoreType === '11') {
              text = '取消退货入库';
            }
            return h('span', text);
          }
        },
        {
          title: '提交人',
          align: 'center',
          width: 160,
          key: 'submittedBy',
          render (h, params) {
            let systemOperation = '系统操作';
            if (params.row.submittedBy === systemOperation) {
              return h('span', systemOperation);
            } else {
              if (v.$store.state.userInfoList && params.row.submittedBy) {
                return h(
                  'span',
                  v.userInfoList[params.row.submittedBy] &&
                  v.userInfoList[params.row.submittedBy].userName
                );
              }
            }
          }
        },
        {
          title: '创建时间',
          align: 'center',
          key: 'createdTime',
          width: 160,
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.createdTime, 'fulltime')
            );
          }
        },
        {
          title: '提交时间',
          align: 'center',
          width: 160,
          key: 'submittedDate',
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.submittedDate, 'fulltime')
            );
          }
        },
        {
          title: '付款时间',
          key: 'payTime',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.payTime, 'fulltime')
            );
          }
        },
        {
          title: '审批时间',
          key: 'approveTime',
          width: 160,
          align: 'center',
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.approveTime, 'fulltime')
            );
          }
        },
        {
          title: '异常原因',
          key: 'refundErrorMsg',
          minWidth: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.refundErrorMsg)) return h('span', '');
            if (row.refundErrorMsg.length <= 200) return h('span', row.refundErrorMsg);
            return h('Poptip', {
              props: {
                placement: 'left',
                trigger: 'hover',
                transfer: true
              },
            }, [
              h('div', {}, `${row.refundErrorMsg.substring(0, 197)}...`),
              h('div', {
                slot: 'content',
                style: {
                  'width': '500px',
                  'white-space': 'initial',
                  'max-height': '50vh',
                  'overflow': 'auto',
                },
              }, row.refundErrorMsg)
            ]);
          }
        },
        {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          width: 120,
          align: 'center',
          render (h, params) {
            let status = params.row.approveStatus + ''; // 审批状态 0未提交 1已提交 2审批退回 3审批通过
            return h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 查看
                    disabled: !v.getPermission('afterSales_detail'),
                    clickFn: () => {
                      if (!v.getPermission('afterSales_detail')) return;
                      v.editType = 'look';
                      v.isShowOrderDetail = true;
                      v.getPostDetail(params.row.afterSalesId);
                      v.show(params.row);
                    }
                  },
                  list: [
                    {
                      text: '编辑', // 编辑
                      value: 1,
                      hide: (() => {
                        return (
                          (status !== '0' && status !== '2') ||
                          !v.getPermission('afterSales_update')
                        );
                      })(),
                      clickFn: () => {
                        v.getPostDetail(params.row.afterSalesId);
                        v.isShowOrderDetail = true;
                        v.editType = 'edit';
                        v.show(params.row);
                      }
                    },
                    {
                      text: '提交审批', // 提交审批
                      value: 2,
                      hide: (() => {
                        return (
                          (status !== '0' && status !== '2') ||
                          !v.getPermission('afterSales_submitApprove')
                        );
                      })(),
                      clickFn: () => {
                        v.update_operating(
                          api.set_afterSales,
                          `/${params.row.afterSalesId}`
                        );
                      }
                    },
                    {
                      text: '审批通过', // 审批通过
                      value: 3,
                      hide: (() => {
                        return (
                          status !== '1' ||
                          !v.getPermission('afterSales_approvePass')
                        );
                      })(),
                      clickFn: () => {
                        let afterSalesType = params.row.afterSalesType.split('');
                        let refundStatus = params.row.refundStatus;
                        if (afterSalesType[0] === '1' && refundStatus === 1) {
                          v.$Modal.confirm({
                            title: '售后单上次审核通过退款失败，请核实是否继续操作',
                            onOk: () => {
                              v.update_operating(api.update_approvePass, `?afterSalesId=${params.row.afterSalesId}&approveComments=${params.row.approveComments}`);
                            },
                            onCancel: () => { }
                          });
                        } else {
                          v.update_operating(api.update_approvePass, `?afterSalesId=${params.row.afterSalesId}&approveComments=${params.row.approveComments}`);
                        }
                      }
                    }, {
                      text: '返回修改', // 返回修改
                      value: 4,
                      hide: (() => {
                        return (
                          status !== '1' ||
                          !v.getPermission('afterSales_backReview')
                        );
                      })(),
                      clickFn: () => {
                        // update_backReview
                        v.update_operating(
                          api.update_backReview,
                          `?afterSalesId=${params.row.afterSalesId}`
                        );
                      }
                    },
                    {
                      text: '删除', // 删除
                      value: 5,
                      hide: (() => {
                        return (
                          (status !== '0' && status !== '2') ||
                          !v.getPermission('afterSales_delete')
                        );
                      })(),
                      clickFn: () => {
                        v.isDelModal(() => {
                          v.delSales(params.row.afterSalesId);
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
      // norcolumns: [],
      tableDate: [],
      total: 0, // 总记录数
      pageParamsStatus: false,
      isSteamCreate: [
        {
          label: '是',
          value: 1
        },
        {
          label: '否',
          value: 0
        }
      ],
      buttonGroupModel: [
        // 排序按钮组
        {
          type: 'createdTime',
          selected: true,
          status: false,
          title: '按创建时间排序'
        },
        {
          type: 'submitTime',
          selected: false,
          status: true,
          title: '按提交时间排序'
        },
        {
          type: 'refund',
          selected: false,
          status: true,
          title: '按退款优先排序'
        },
        {
          type: 'redelivery',
          selected: false,
          status: true,
          title: '按补发货优先排序'
        },
        {
          type: 'returned',
          selected: false,
          status: true,
          title: '按退货优先排序'
        }
      ],
      payTimeArr: [],
      clearAble: true,
      timeParamsValue: '1',
      timeParamsList: [
        {
          label: '提交时间',
          value: '1'
        },
        {
          label: '付款时间',
          value: '2'
        },
        {
          label: '审批时间',
          value: '3'
        }
      ],
      orderTypeParamsValue: '1',
      orderTypeParamsList: [
        {
          label: '订单号',
          value: '1'
        },
        {
          label: '买家ID',
          value: '2'
        },
        {
          label: '售后单编号',
          value: '3'
        },
        {
          label: '订单SKU',
          value: '4'
        }
      ],
      moreFilter: false, // 高级筛选
      moreFilterMes: '更多选项',
      moreFilterIcon: 'md-arrow-dropdown',
      tabsData: [
        {
          label: '全部',
          value: null
        },
        {
          label: '等待提交',
          value: 0
        },
        {
          label: '等待审批',
          value: 1
        },
        {
          label: '审批退回',
          value: 2
        },
        {
          label: '审批通过',
          value: 3
        }
      ],
      reasonList: [], // 原因列表
      tabsData1: [
        {
          label: '全部',
          value: null
        },
        {
          label: '已退款',
          value: 1
        },
        {
          label: '退款失败',
          value: 2
        },
        {
          label: '已补发货',
          value: 3
        },
        {
          label: '部分退货入库',
          value: 4
        }
      ],
      orderDetailsBegin: false,
      platformGroup: [],
      pageParams: {
        afterSalesCode: [], //  售后服务编码
        approveStatus: null, // 审批状态 0未提交 1已提交 2审批退回 3审批通过 ,
        approveTimeStart: null, // 审批时间 ,
        approveTimeEnd: null, // 审批时间
        buyerAccountId: [], // 买家Id ,
        exeStatus: null, // 1已退款 2退款失败 3已补发货 4部分退货入库 ,
        orderNo: [], // 订单流水号
        payTimeEnd: null, // 付款时间 ,
        payTimeStart: null, // 付款时间 ,
        platformId: null, // 平台 ,
        reason: null, // 退款原因
        saleAccountIdList: [], //  店铺ids ,
        systemCreated: null,
        sku: [], // sku
        submittedBy: null, // 提交人
        submittedDateEnd: null, // 提交时间
        submittedDateStart: null, // 提交时间
        orderBy: 'createdTime',
        upDown: 'down', // up 升序 down降序 ,
        afterSaleServiceCode: null,
        pageNum: 1,
        pageSize: 10
      },
      orderDetailsId: null,
      orderRowsDetail: {},
      orderNo: null,
      timestamp: 0,
      timestamp1: 0,
      buttonVisibile: false,
      orderDetailsStatus: false,
      sliderObjStyle: null
    };
  },
  components: {
    orderDetails,
    postSaleStep
  },
  watch: {
    domWidth: {
      // common_mixin 里面有公共计算 domWidth 的方法， 这里通过 domWidth 来决定详情弹出框大小
      handler (n) {
        const viewWidth = n - 240;
        this.sliderObjStyle = { width: `${viewWidth * 0.6}px` };
        this.swStyles = {
          width: `${viewWidth * 0.4}px`,
          left: `-${viewWidth * 0.4}px`,
          top: '0',
          height: '100%'
        }
        this.left = viewWidth * 0.6;
        // if (n > 1600) {
        //   this.sliderObjStyle = { width: '700px' };
        //   this.swStyles = {
        //     width: '1000px',
        //     left: '-1000px',
        //     top: '0',
        //     height: '100%'
        //   };
        //   this.left = 560;
        // } else if (n > 1200) {
        //   this.sliderObjStyle = { width: '392px' };
        //   this.swStyles = {
        //     width: '800px',
        //     left: '-800px',
        //     top: '0',
        //     height: '100%'
        //   };
        //   this.left = 392;
        // } else {
        //   this.sliderObjStyle = { width: '322px' };
        //   this.swStyles = {
        //     width: '700px',
        //     left: '-700px',
        //     top: '0',
        //     height: '100%'
        //   };
        //   this.left = 322;
        // }
      },
      immediate: true
    },
    pageParamsStatus: function (n, o) {
      // 监听重置列表数据
      var self = this;
      if (n) {
        self.$Loading.start();
        Promise.resolve(
          self.getPermission('afterSales_query')
            ? self.getList()
            : self.gotoError()
        ).then(() => {
          self.$Loading.finish();
        });
        self.pageParamsStatus = false;
      }
    },
    orderDetailsStatus: {
      handler (val) {
        !val && this.restModal();
      }
    }
  },
  computed: {
    orderTypeText () {
      const textList = this.orderTypeParamsList.filter(f => this.orderTypeParamsValue === f.value).map(m => m.label);
      if (textList.length > 0) {
        return textList[0];
      }
      return '';
    },
    wrap () {
      return `${prefixCls}`;
    },
    tableHeight () {
      return this.getTableHeight(380);
    }
  },
  methods: {
    // 导出
    exportExcel (val) { // 0, 导出; 1, 导出所有结果集
      let v = this;
      if (val === 0) {
        let afterSalesIds = [];
        if (v.checkedData.length > 0) {
          v.checkedData.map((item) => {
            afterSalesIds.push(item.afterSalesId);
          });
          v.pageParams.afterSalesIds = afterSalesIds;
        } else {
          this.$Message.error('请先选择导出数据！');
          return false;
        }
      } else {
        v.pageParams.afterSalesIds = [];
      }
      v.axios.post(api.get_afterExport, v.pageParams).then((res) => {
        if (res.data.code === 0) {
          v.checkedData = [];
          v.$Message.success('导出成功');
        }
      });
    },
    // 保存后
    saveSuccess () {
      this.orderDetailsStatus = false;
      this.restModal();
      this.search();
    },
    // 关闭弹窗之后
    restModal () {
      this.orderRowsDetail = {};
      this.orderDetailsId = null;
      this.isShowOrderDetail = false;
    },
    searchOrderCallback (row = {}) {
      this.isShowOrderDetail = true;
      this.orderDetailsId = row.orderId || null;
      this.orderRowsDetail = this.$common.copy(row);
      let date = new Date().getTime();
      this.$nextTick(() => {
        this.orderDetailsStatus = true;
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    addPostSale () {
      this.editType = 'add';
      this.timestamp1 = new Date().getTime();
      this.show();
    },
    show (row = {}) {
      this.orderDetailsBegin = true;
      this.orderDetailsId = row.orderId || null;
      this.orderRowsDetail = this.$common.copy(row);
      let date = new Date().getTime();
      this.$nextTick(() => {
        this.orderDetailsStatus = true;
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    delSales (id) {
      let v = this;
      v.axios.delete(api.update_afterSales + '/' + id).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success('删除成功');
          v.search();
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    update_operating (url, params, message) {
      // 审批通过 、
      let v = this;
      v.axios.put(url + params).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.getList();
        }
      });
    },
    changePage (page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.pageParams.pageSize = +val;
      this.getList();
    },
    checkDataMt (data) {
      this.checkedData = data;
    },
    setAfterSalesId () {
      let v = this;
      return new Promise((resolve) => {
        let ids = [];
        ids = this.checkedData.map((i) => {
          return i.afterSalesId;
        });
        if (ids.length === 0) {
          v.$Message.error('请选择数据');
        } else {
          resolve(ids);
        }
      });
    },
    getPostDetail (afterSalesId) {
      let v = this;
      v.axios.get(api.get_salesDetail + '/' + afterSalesId).then((res) => {
        if (res.data.code === 0) {
          v.postDetail = res.data.datas;
        }
      });
    },
    batchReview () {
      // 批量提交审批
      let v = this;
      this.setAfterSalesId().then((ids) => {
        v.axios
          .post(api.batch_batchReview, {
            afterSalesIds: ids
          })
          .then((res) => {
            if (res.data.code === 0) {
              v.$Message.success('操作成功');
              v.search();
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
            }
          });
      });
    },
    batchApprovePass () {
      // 批量审批通过
      let v = this;
      this.setAfterSalesId().then((ids) => {
        v.axios
          .put(api.batch_batchApprovePass, {
            afterSalesIds: ids
          })
          .then((res) => {
            if (res.data.code === 0) {
              v.$Message.success('操作成功');
              v.search();
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
            }
          });
      });
    },
    batchBackReview () {
      // 批量退回修改
      let v = this;
      this.setAfterSalesId().then((ids) => {
        v.axios
          .post(api.batch_batchBackReview, {
            afterSalesIds: ids
          })
          .then((res) => {
            if (res.data.code === 0) {
              v.$Message.success('操作成功');
              v.search();
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
            }
          });
      });
    },
    reset () {
      // for (let key in this.pageParams) {
      //   this.pageParams[key] = null;
      // }
      // this.pageParams.saleAccountIdList = [];
      // this.pageParams.systemCreated = 1;
      // this.pageParams.pageNum = 1;
      // this.pageParams.pageSize = 10;
      this.orderTypeParamsValue = '1';
      this.timeParamsValue = '1';
      this.$refs['pageParams'].resetFields();
    },
    getList () {
      let v = this;
      v.loadingTrue();
      v.axios
        .post(api.get_afterSales, v.pageParams)
        .then((res) => {
          if (res.data.code === 0) {
            v.loadingFalse();
            v.tableDate = res.data.datas.list;
            v.total = res.data.datas.total;
          }
        })
        .catch(() => {
          v.loadingFalse();
        });
    },
    orderTypeChange (value) {
      this.pageParams.orderNo = [];
      this.pageParams.buyerAccountId = [];
      this.pageParams.afterSalesCode = [];
      this.pageParams.sku = [];
    },
    timeChange (value) {
      let v = this;
      v.pageParams.payTimeEnd = null;
      v.pageParams.payTimeStart = null;
      v.pageParams.approveTimeEnd = null;
      v.pageParams.approveTimeStart = null;
      v.pageParams.submittedDateEnd = null;
      v.pageParams.submittedDateStart = null;
    },
    btnClick (item) {
      if (item.value === 0 || item.value === 1) {
        this.tabsData1.forEach((i) => {
          i.disabled = true;
        });
      } else {
        this.tabsData1.forEach((i) => {
          i.disabled = false;
        });
      }
      this.search();
    },
    resetDate () {
      this.timeChange();
      this.payTimeArr = [];
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value[0] !== '') {
        v.timeChange();
        if (value[0] === null || value[1] === null) return false;
        let date1 = v.getUniversalTime(
          new Date(value[0]).getTime(),
          'fulltime'
        );
        let date2 = v.getUniversalTime(
          new Date(value[1]).getTime(),
          'fulltime'
        );
        if (v.timeParamsValue === '1') {
          v.pageParams.submittedDateStart = date1;
          v.pageParams.submittedDateEnd = date2;
        } else if (v.timeParamsValue === '2') {
          v.pageParams.payTimeStart = date1;
          v.pageParams.payTimeEnd = date2;
        } else if (v.timeParamsValue === '3') {
          v.pageParams.approveTimeEnd = date2;
          v.pageParams.approveTimeStart = date1;
        }
      } else {
        v.resetDate();
      }
    },
    getQueryReason () {
      let v = this;
      v.axios.get(api.get_queryReason).then((res) => {
        if (res.data.code === 0) {
          v.reasonList = res.data.datas;
        }
      });
    },
    platFormChange (value) {
      this.platformType = value;
      this.getShopList();
      // this.exchangeList(value);
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
    confirmSave () { },
    search () {
      this.pageNum = 1;
      this.getList();
    },
    getPlatformData (id) {
      let v = this;
      v.platformGroup.forEach(function (n, i) {
        if (id === n.platformId) {
          v.$router.push(id);
        }
      });
    },
    changePlatform (shopPlatformType) {
      let v = this;
      v.makePlatformGroup().then((res) => {
        if (res) {
          v.platformGroup.forEach(function (n, i) {
            if (shopPlatformType === n.platformId) {
              n.selected = true;
              v.platformName = n.title;
              v.platformGroup.splice(i, 1);
              v.platformGroup.splice(0, 0, n);
            } else {
              n.selected = false;
            }
          });
        }
      });
    },
    makePlatformGroup () {
      let v = this;
      return new Promise((resolve) => {
        let pos = [];
        let platformGroup = v.$store.state.platformGroup;
        if (platformGroup === null) {
          v.getPlatformGroup().then((result) => {
            if (result) {
              let list = v.$store.state.platformGroup;
              list.forEach((n, i) => {
                if (n.platformId === v.shopPlatformType) {
                  pos.push({
                    selected: true,
                    platformId: n.platformId,
                    title: n.name
                  });
                } else {
                  pos.push({
                    selected: false,
                    platformId: n.platformId,
                    title: n.name
                  });
                }
              });
              v.platformGroup = pos;
              if (v.platformGroup.length) {
                v.$store.commit('platformGroupShow', true);
              } else {
                v.$store.commit('platformGroupShow', false);
              }
              v.$parent.pageParamsStatus = true;
              resolve(true);
            }
          });
        } else {
          let list = v.$store.state.platformGroup;
          list.forEach((n, i) => {
            if (n.platformId === v.shopPlatformType) {
              pos.push({
                selected: true,
                platformId: n.platformId,
                title: n.name
              });
            } else {
              pos.push({
                selected: false,
                platformId: n.platformId,
                title: n.name
              });
            }
          });
          v.platformGroup = pos;
          if (v.platformGroup.length) {
            v.$store.commit('platformGroupShow', true);
          } else {
            v.$store.commit('platformGroupShow', false);
          }
          v.$parent.pageParamsStatus = true;
          resolve(true);
        }
      });
    },
    // 当平台为aliexpress时表格列表增加相对应的字段
    exchangeList (value) {
      if (value !== 'aliexpress') {
        this.columns1 = this.norcolumns;
        return;
      }
      let arr = [
        {
          title: '退款金额',
          key: ''
        },
        {
          title: '人民币的退款金额',
          key: ''
        },
        {
          title: '退款的SKU和数量',
          key: ''
        },
        {
          title: '买家纠纷提起原因',
          key: ''
        },
        {
          title: '买家纠纷的平台判定原因',
          key: ''
        },
        {
          title: '退款出资方',
          key: ''
        }
      ];
      const len = this.columns1.length ? this.columns1.length - 1 : 0;
      let ftarr = this.columns1.slice(0, len);
      let afarr = this.columns1.slice(len);
      this.columns1 = [...ftarr, ...arr, ...afarr];
    },
    // 获取cs的配置数据
    getCsSettingCommon () {
      let query = {
        typeList: ['csConfig']
      };
      this.axios.post(api.post_csSettingCommon_queryCsConfig, query).then(res => {
        if (res.data.code === 0) {
          let paramValue = res.data.datas[0].paramValue;
          this.approved = paramValue !== 'false';
        }
      });
    },
    // 保存自动审核设置
    saveAutoReview (value) {
      let query = {
        paramBoList: [
          {
            paramKey: 'csAutoReview',
            paramValue: value
          }
        ]
      };
      this.axios.post(api.post_csSettingCommon_saveAutoReview, query).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('操作成功');
          this.getCsSettingCommon();
        }
      });
    }
  },
  created () {
    this.getShopList();
    this.getQueryReason(); // 获取原因列表
    this.getPlatformGroup().then((data) => {
      this.changePlatform('ebay');
    });
    this.search();
    this.getCsSettingCommon();
  },
  mounted () { }
};
</script>
<style lang="less">
.postSaleTreatment-combineDetails{
  .ivu-sliderModal-rightButton{
    left: initial !important;
    right: calc(100vw - 255px) !important;
  }
}
</style>
