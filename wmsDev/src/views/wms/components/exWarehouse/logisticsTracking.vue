<template>
    <div class="logisticsTracking">
        <div class="searchMain">
            <Form ref="pageParams" :model="pageParams" :label-width="80">
                <dyt-filter ref="dyt-filter">
                    <Form-item label="发货日期">
                        <Date-picker
                            style="width:100%"
                            type="datetimerange"
                            @on-clear="resetSendDate"
                            transfer
                            @on-change="getSendDateValue"
                            :clearable="true"
                            :options="dateOptions"
                            format="yyyy-MM-dd HH:mm:ss"
                            placement="bottom-end"
                            placeholder="选择日期"
                            :value="sendTime"
                        ></Date-picker>
                    </Form-item>
                    <Form-item label="添加日期">
                        <Date-picker
                            style="width:100%"
                            type="datetimerange"
                            @on-clear="resetAddDate"
                            transfer
                            @on-change="getAddDateValue"
                            :clearable="true"
                            :options="dateOptions"
                            format="yyyy-MM-dd HH:mm:ss"
                            placement="bottom-end"
                            placeholder="选择日期"
                            :value="addTime"
                        ></Date-picker>
                    </Form-item>
                    <div slot="operation">
                        <Button
                            type="primary"
                            @click="search"
                            :disabled="SearchDisabled"
                            icon="ios-search"
                            class="mr10"
                            >查询</Button
                        >
                        <Button @click="reset" v-once icon="md-refresh"
                            >重置</Button
                        >
                    </div>
                </dyt-filter>
            </Form>
        </div>
        <!--功能按钮操作栏-->
        <div class="funMain">
            <div class="funMain__flex">
                <div>
                    <Button
                        type="primary"
                        class="right_style"
                        @click="deliveryOrderModal = true"
                        v-if="
                            getPermission(
                                'packageLogisticsTracking_batchAddPackageLogisticsTracking'
                            )
                        "
                        >添加出库单</Button
                    >
                </div>
                <div>
                    <Button
                        type="primary"
                        @click="editCarrier"
                        v-if="
                            getPermission(
                                'packageLogisticsTracking_batchUpdateCarrierCode'
                            )
                        "
                        >修改承运商</Button
                    >
                </div>
            </div>
        </div>
        <!--列表区域-->
        <Tabs
            v-model="trackingTab"
            class="plr10"
            :animated="true"
            @on-click="selectTabs"
        >
            <TabPane
                v-for="(item, index) in statusList"
                :key="index"
                :label="item.name + '（' + item.total + '）'"
                :name="item.value"
            >
                <div class="normalTop" v-if="trackingTab === item.value">
                    <Table
                        highlight-row
                        border
                        :loading="TableLoading"
                        :columns="tableColumns"
                        :data="tableData"
                        @on-selection-change="getSelectValue"
                    ></Table>
                    <div class="table-page">
                        <div class="table-page-right">
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
                                :page-size-opts="pageArray"
                            ></Page>
                        </div>
                    </div>
                </div>
            </TabPane>
        </Tabs>
        <!--批量添加出库单弹窗-->
        <Modal
            v-model="deliveryOrderModal"
            title="批量添加出库单"
            width="650"
            :mask-closable="false"
            class-name="outboundOrderStyle"
            @on-visible-change="deliveryOrderModalChange"
        >
            <div class="outbound_order_radio">
                <RadioGroup v-model="accordingType" class="radio_box">
                    <Radio label="packageCode">出库单</Radio>
                    <Radio label="trackingNumber">运单号</Radio>
                </RadioGroup>
                <Input
                    v-model.trim="accordIngId"
                    type="textarea"
                    :rows="5"
                ></Input>
            </div>
            <div class="carrier_select" @click="changeSelect('add')">
                <span>承运商：</span>
                <Input
                    v-model.trim="carrierName"
                    readonly
                    style="width: 100%"
                ></Input>
            </div>
            <div slot="footer" style="text-align: center;">
                <Button @click="deliveryOrderModal = false">关闭</Button>
                <Button type="primary" @click="confirmAddBtn">确认添加</Button>
            </div>
        </Modal>
        <!--批量修改承运商-->
        <Modal
            v-model="carrierModal"
            title="批量修改承运商"
            width="500"
            :mask-closable="false"
            @on-visible-change="deliveryOrderModalChange"
        >
            <div
                style="width: 100%; display: flex; align-items: center;"
                @click="changeSelect('edit')"
            >
                <span style="display: inline-block;width: 180px;"
                    >批量修改承运商为：</span
                >
                <Input
                    v-model.trim="carrierName"
                    readonly
                    style="width: 90%"
                ></Input>
            </div>
            <div slot="footer" style="text-align: center;">
                <Button @click="carrierModal = false">关闭</Button>
                <Button type="primary" @click="carrierBtn">确定</Button>
            </div>
        </Modal>
        <!--跟踪信息弹窗-->
        <Modal
            v-model="trackingModal"
            title="跟踪信息"
            width="720"
            :mask-closable="false"
            class-name="trackingStyle"
        >
            <Card>
                <h2 slot="title" class="title_box">
                    <span>{{ trackingNumber }}</span>
                    <span>{{ trackingStatusTxt }}</span>
                </h2>
                <Timeline>
                    <TimelineItem
                        v-for="(item, index) in timelineList"
                        :key="index"
                    >
                        <p class="time_box">{{ item.time }}</p>
                        <p class="content_box" :title="item.statusDescription">
                            {{ item.statusDescription }}
                        </p>
                    </TimelineItem>
                </Timeline>
            </Card>
            <div slot="footer" style="text-align: center;">
                <Button @click="trackingModal = false">关闭</Button>
            </div>
        </Modal>
        <!--承运商弹窗列表-->
        <Modal
            v-model="carrierTableModal"
            title="承运商"
            width="800"
            :mask-closable="false"
            class-name="carrierTableModalStyle"
            @on-visible-change="carrierTableModalChange"
        >
            <div class="carrier_table_filter">
                <span>承运商名称：</span>
                <Input
                    v-model="carrierTableParams.nameCn"
                    placeholder="请输入承运商名称"
                    style="width: 250px"
                    @on-enter="inputEnter"
                />
            </div>
            <div class="normalTop">
                <Table
                    highlight-row
                    border
                    :loading="TableLoading"
                    :columns="carrierTableColumns"
                    :data="carrierTableData"
                ></Table>
                <div class="table-page">
                    <div class="table-page-right">
                        <Page
                            :total="carrierTotal"
                            @on-change="carrierChangePage"
                            show-total
                            :page-size="carrierTableParams.pageSize"
                            show-elevator
                            :current="carrierCurPage"
                            show-sizer
                            @on-page-size-change="carrierChangePageSize"
                            placement="top"
                            :page-size-opts="pageArray"
                        ></Page>
                    </div>
                </div>
            </div>
            <div slot="footer" style="text-align: center; margin-top: 25px;">
                <Button @click="carrierTableModal = false">关闭</Button>
            </div>
        </Modal>
        <!--批量操作异常提示弹窗-->
        <Modal v-model="tipsTalg" class-name="tips_style">
            <div class="tips_box">
                <div
                    class="tips_center"
                    v-for="(item, index) in tipsList"
                    :key="index"
                >
                    <h3 class="title">{{ item.code + "：" }}</h3>
                    <div class="tips_item_box">
                        <span v-for="(ele, ids) in item.data" :key="ids">{{
                            ele.errorMessage
                        }}</span>
                    </div>
                </div>
            </div>
            <div slot="footer" style="text-align: center;">
                <Button @click="tipsTalg = false">关闭</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'logisticsTracking',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      pageParamsStatus: false,
      sendTime: [],
      addTime: [],
      totalPage: 0,
      total: 0,
      curPage: 1,
      trackingStatusTxt: '',
      trackingNumber: '',
      pageParams: {
        trackingStatus: null, // 物流跟踪状态
        createdEndTime: null,
        createdStartTime: null,
        despatchEndTime: null,
        despatchStartTime: null,
        orderBy: 'CT', // 添加时间-CT,发货时间-DT,最后更新时间-LUT,物流跟踪状态-TS
        upDown: 'down',
        pageNum: 1,
        pageSize: 10
      },
      trackingTab: 'all',
      statusList: [
        {
          value: 'all',
          name: '全部',
          type: 'all',
          total: 0
        },
        {
          value: 'normal',
          name: '待查询',
          type: 'normalCount',
          total: 0
        },
        {
          value: 'pending',
          name: '查询中',
          type: 'pendingCount',
          total: 0
        },
        {
          value: 'notfound',
          name: '未查到',
          type: 'notfoundCount',
          total: 0
        },
        {
          value: 'transit',
          name: '运输中',
          type: 'transitCount',
          total: 0
        },
        {
          value: 'pickup',
          name: '等待领取',
          type: 'pickupCount',
          total: 0
        },
        {
          value: 'delivered',
          name: '已签收',
          type: 'deliveredCount',
          total: 0
        },
        {
          value: 'undelivered',
          name: '投递失败',
          type: 'undeliveredCount',
          total: 0
        },
        {
          value: 'expired',
          name: '运输过久',
          type: 'expiredCount',
          total: 0
        },
        {
          value: 'exception',
          name: '可能异常',
          type: 'exceptionCount',
          total: 0
        }
      ],
      tableColumns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        },
        {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            return v.getPermission(
              'packageLogisticsTrackingDetail_queryByPackageLogisticsTrackingId'
            )
                            ? h(
                              'a',
                              {
                                style: {
                                  display: 'inline-block',
                                  width: '100%',
                                  height: '100%'
                                },
                                on: {
                                  click: function () {
                                    v.trackingNumber =
                                                  params.row.trackingNumber;
                                    v.trackingStatusTxt =
                                                  params.row.status;
                                    v.GetPackageLogisticsTracking(
                                      params.row
                                        .packageLogisticsTrackingId
                                    );
                                  }
                                }
                              },
                              params.row.packageCode
                            )
                            : h('span', params.row.packageCode);
          }
        },
        {
          title: '状态',
          key: 'status',
          minWidth: 120,
          align: 'center',
          render (h, params) {
            let statusText = '';
            let status = params.row.trackingStatus;
            v.statusList.map(item => {
              if (status !== null && item.value === status) {
                statusText = item.name;
              }
            });
            return h('div', statusText);
          }
        },
        {
          title: '运单号',
          key: 'trackingNumber',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '目的地',
          key: 'buyerCountryCode',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '承运商/物流方式',
          key: 'carrierName',
          minWidth: 180,
          align: 'center',
          render: (h, params) => {
            let carrierName = params.row.carrierName;
            let carrierShippingMethodName =
                            params.row.carrierShippingMethodName;
            let text = '';
            if (carrierName && carrierShippingMethodName) {
              text =
                                carrierName + ' > ' + carrierShippingMethodName;
            }
            if (carrierName && !carrierShippingMethodName) {
              text = carrierName;
            }
            if (!carrierName && carrierShippingMethodName) {
              text = carrierShippingMethodName;
            }
            return h('div', text);
          }
        },
        {
          title: '出库时间',
          key: 'despatchTime',
          minWidth: 180,
          align: 'center',
          render (h, params) {
            return h(
              'span',
                            params.row.despatchTime
                                ? v.$uDate.dealTime(
                                  params.row.despatchTime,
                                  'fulltime'
                                )
                                : ''
            );
          }
        },
        {
          title: '添加时间',
          key: 'createdTime',
          minWidth: 180,
          align: 'center',
          render (h, params) {
            return h(
              'span',
                            params.row.createdTime
                                ? v.$uDate.dealTime(
                                  params.row.createdTime,
                                  'fulltime'
                                )
                                : ''
            );
          }
        },
        {
          title: '最后时间',
          key: 'lastUpdatedTime',
          minWidth: 180,
          align: 'center',
          render (h, params) {
            return h(
              'span',
                            params.row.lastUpdatedTime
                                ? v.$uDate.dealTime(
                                  params.row.lastUpdatedTime,
                                  'fulltime'
                                )
                                : ''
            );
          }
        },
        {
          title: '添加人',
          minWidth: 120,
          key: 'createdBy',
          align: 'center',
          render: (h, params) => {
            let createdName = '';
            let createdBy = params.row.createdBy;
            if (createdBy) {
              createdName =
                                (v.$store.state.userInfoList[createdBy]
                                    ? v.$store.state.userInfoList[createdBy]
                                      .userName
                                    : '') || '';
            } else {
              createdName = '';
            }
            return h('div', createdName);
          }
        },
        {
          title: '操作',
          key: '',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            return v.getPermission(
              'packageLogisticsTracking_researchTracking'
            )
                            ? h(
                              'a',
                              {
                                style: {
                                  display: 'inline-block',
                                  textDecoration: 'none',
                                  width: '100%',
                                  height: '100%'
                                },
                                on: {
                                  click: function () {
                                    v.requery(
                                      params.row
                                        .packageLogisticsTrackingId
                                    );
                                  }
                                }
                              },
                              '重新查询'
                            )
                            : '';
          }
        }
      ],
      tableData: [],
      selectTalbeValues: [],
      accordingType: 'packageCode',
      accordIngId: '',
      deliveryOrderModal: false,
      carrierModal: false,
      carrierCode: null,
      trackingModal: false,
      timelineList: [],
      carrierTableModal: false,
      carrierTotalPage: 0,
      carrierTotal: 0,
      carrierCurPage: 1,
      carrierTableParams: {
        nameCn: '',
        trackingMoreCarrierCodeIds: [],
        type: null,
        pageNum: 1,
        pageSize: 10
      },
      carrierTableColumns: [
        {
          title: '承运人',
          key: 'name',
          align: 'center'
        },
        {
          title: '承运商名称',
          key: 'nameCn',
          align: 'center'
        },
        {
          title: '承运人电话',
          key: 'phone',
          align: 'center'
        },
        {
          title: '是否可用',
          key: 'isEnabled',
          align: 'center',
          render: (h, params) => {
            let txt =
                            params.row.isEnabled === '1' ? '可用' : '不可用';
            return h('span', txt);
          }
        },
        {
          title: '操作',
          key: 'options',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h(
              'a',
              {
                style: {
                  display: 'inline-block',
                  textDecoration: 'none',
                  width: '100%',
                  height: '100%'
                },
                on: {
                  click: function () {
                    let code = params.row.code;
                    let carrierName = params.row.nameCn;
                    if (v.carrierStatusTalg === 'add') {
                      v.carrierCode = code;
                      v.carrierName = carrierName;
                      v.carrierTableModal = false;
                    } else if (
                      v.carrierStatusTalg === 'edit'
                    ) {
                      v.carrierCode = code;
                      v.carrierName = carrierName;
                      v.carrierTableModal = false;
                    }
                  }
                }
              },
              '选取'
            );
          }
        }
      ],
      carrierTableData: [],
      carrierStatusTalg: '',
      carrierName: '',
      tipsTalg: false,
      tipsList: []
    };
  },
  created () {
    this.getList();
  },
  methods: {
    // 获取列表数据
    getList () {
      let v = this;
      if (
        v.getPermission('packageLogisticsTracking_queryPltForCondition')
      ) {
        v.TableLoading = true;
        v.selectTalbeValues = [];
        v.tableData = [];
        let merchantShippingMethodIdPos = [];
        v.pageParams.trackingStatus =
                    v.pageParams.trackingStatus === 'all'
                        ? null
                        : v.pageParams.trackingStatus;
        v.axios
          .post(api.post_queryPltForCondition, v.pageParams)
          .then(response => {
            v.TableLoading = false;
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data.list.length > 0) {
                data.list.forEach(item => {
                  merchantShippingMethodIdPos.push(
                    item.merchantShippingMethodId
                  );
                });
                if (merchantShippingMethodIdPos.length > 0) {
                  v.axios
                    .post(
                      api.queryCarrierShippingName,
                      JSON.stringify(
                        merchantShippingMethodIdPos
                      )
                    )
                    .then(response => {
                      if (response.data.code === 0) {
                        if (
                          response.data.datas.length >
                                                    0
                        ) {
                          response.data.datas.forEach(
                            (n, i) => {
                              data.list.forEach(
                                (m, t) => {
                                  if (
                                    m.merchantShippingMethodId ===
                                                                        n.shippingMethodId
                                  ) {
                                    m.carrierName =
                                                                            n.carrierName;
                                    m.carrierShippingMethodName =
                                                                            n.carrierShippingMethodName;
                                  }
                                }
                              );
                            }
                          );
                        }
                      }
                    })
                    .then(function () {
                      v.tableData = data.list;
                    });
                }
              }
              v.total = data.total;
              v.GetPackageLogisticsTrackingTotal();
            }
          });
      } else {
        v.gotoError();
      }
    },
    // 查询按钮
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    // 获取发货日期
    getSendDateValue (value) {
      var v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.despatchStartTime = v.$uDate.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          v.pageParams.despatchEndTime = v.$uDate.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    // 获取添加日期
    getAddDateValue (value) {
      var v = this;
      if (value[0] !== '') {
        v.pageParams.createdStartTime = v.$uDate.getUniversalTime(
          new Date(value[0]).getTime(),
          'fulltime'
        );
        v.pageParams.createdEndTime = v.$uDate.getUniversalTime(
          new Date(value[1]).getTime(),
          'fulltime'
        );
      }
    },
    // 重置发货日期
    resetSendDate () {
      let v = this;
      v.pageParams.despatchStartTime = null;
      v.pageParams.despatchEndTime = null;
    },
    // 重置添加日期
    resetAddDate () {
      let v = this;
      v.pageParams.createdStartTime = null;
      v.pageParams.createdEndTime = null;
    },
    // 重置数据
    reset () {
      let v = this;
      v.$refs['pageParams'].resetFields();
      v.sendTime = [];
      v.addTime = [];
      v.resetSendDate();
      v.resetAddDate();
    },
    // 获取勾选的列表数据
    getSelectValue (value) {
      this.selectTalbeValues = value;
    },
    // 批量添加出库单的确认按钮
    confirmAddBtn () {
      let v = this;
      let query = {
        accordingType: v.accordingType,
        carrierCode: v.carrierCode,
        accordIngId: v.sepCommasFn(v.accordIngId)
      };
      if (v.carrierCode === null) {
        v.$Message.warning('承运商不能为空！');
        return false;
      }
      if (v.accordIngId === null || v.accordIngId === '') {
        v.$Message.warning('出库单或跟踪号不能为空！');
        return false;
      }
      v.axios
        .post(api.post_batchAddPackageLogisticsTracking, query)
        .then(res => {
          if (res.data.code === 0) {
            v.deliveryOrderModal = false;
            v.$Message.success('操作成功!');
            v.pageParamsStatus = true;
          }
        });
    },
    // 监听批量添加出库单的弹窗
    deliveryOrderModalChange (value) {
      if (!value) {
        this.accordingType = 'packageCode';
        this.accordIngId = null;
        this.carrierName = '';
        this.carrierCode = null;
      }
    },
    // 切换列表
    selectTabs (name) {
      if (name === 'all') {
        this.pageParams.trackingStatus = null;
      } else {
        this.pageParams.trackingStatus = name;
      }
      this.pageParamsStatus = true;
    },
    // 修改承运商按钮
    editCarrier () {
      if (this.selectTalbeValues.length > 0) {
        let arr = [];
        // 待查询和未查到的包裹才能修改承运商
        arr = this.selectTalbeValues.filter(
          item =>
            item.trackingStatus === 'normal' ||
                        item.trackingStatus === 'notfound'
        );
        if (arr.length > 0) {
          this.selectTalbeValues = [];
          arr.map(item => {
            this.selectTalbeValues.push(
              item.packageLogisticsTrackingId
            );
          });
          this.carrierModal = true;
        } else {
          this.$Message.warning({
            content: '包裹状态为待查询或未查到，才能修改承运商！',
            duration: 4
          });
          return false;
        }
      } else {
        this.$Message.warning({
          content: '请勾选需要修改的数据!',
          duration: 4
        });
        return false;
      }
    },
    // 批量修改承运商弹窗的确定按钮
    carrierBtn () {
      let v = this;
      let query = {
        carrierCode: v.carrierCode,
        packageLogisticsTrackingIds: v.selectTalbeValues
      };
      if (v.carrierCode === null) {
        v.$Message.warning('承运商不能为空！');
        return false;
      }
      v.axios.post(api.post_batchUpdateCarrierCode, query).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data.length > 0) {
            v.tipsList = v.handerGrouping(
              data,
              function (item) {
                return [item.code];
              },
              'code'
            );
            v.tipsTalg = true;
            v.carrierModal = false;
            v.pageParamsStatus = true;
          } else {
            v.carrierModal = false;
            v.pageParamsStatus = true;
            v.$Message.success('操作成功!');
          }
        }
      });
    },
    // 获取承运商的数据
    getSystemTrackingMoreCarrierData () {
      this.TableLoading = true;
      this.axios
        .post(
          api.post_systemTrackingMoreCarrier_query,
          this.carrierTableParams
        )
        .then(res => {
          this.TableLoading = false;
          if (res.data.code === 0) {
            this.carrierTableModal = true;
            let data = res.data.datas;
            this.carrierTotal = data.total;
            this.carrierTableData = data.list;
          }
        });
    },
    // 下拉选取承运商
    changeSelect (value) {
      this.carrierTableModal = !this.carrierTableModal;
      this.carrierStatusTalg = value;
      if (this.carrierTableModal) {
        this.getSystemTrackingMoreCarrierData();
      }
    },
    // 获取跟踪信息的数据
    GetPackageLogisticsTracking (packageLogisticsTrackingId) {
      let v = this;
      v.axios
        .get(
          api.get_packageLogisticsTrackingDetail +
                        `?packageLogisticsTrackingId=${packageLogisticsTrackingId}`
        )
        .then(res => {
          if (res.data.code === 0) {
            v.trackingModal = true;
            let data = res.data.datas;
            if (data.length > 0) {
              data.map(item => {
                item['time'] = item.trackinfoTime
                                    ? v.$uDate.dealTime(
                                      item.trackinfoTime,
                                      'fulltime'
                                    )
                                    : '';
              });
              v.timelineList = data;
            }
          }
        });
    },
    // 获取跟踪物流信息统计的数据
    GetPackageLogisticsTrackingTotal () {
      let v = this;
      let query = {
        createdEndTime: v.pageParams.createdEndTime,
        createdStartTime: v.pageParams.createdStartTime,
        despatchEndTime: v.pageParams.despatchEndTime,
        despatchStartTime: v.pageParams.despatchStartTime,
        trackingStatus: v.pageParams.trackingStatus
      };
      v.axios.post(api.post_packageLogisticsTracking, query).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          v.statusList.map(item => {
            item.total = 0;
            for (let key in data) {
              if (item.type === key) {
                item.total = data[key] ? data[key] : 0;
              }
              if (item.type === 'all') {
                item.total += Number(data[key]);
              }
            }
          });
        }
      });
    },
    // 查询承运商
    inputEnter () {
      if (this.carrierTableParams.nameCn !== '') {
        this.getSystemTrackingMoreCarrierData();
      } else {
        this.$Message.warning('承运商的名称不能为空!');
        return false;
      }
    },
    // 承运商的分页切换
    carrierChangePage (page) {
      let v = this;
      v.TableLoading = true;
      v.carrierTableParams.pageNum = page;
      v.curPage = page;
      v.getSystemTrackingMoreCarrierData();
    },
    carrierChangePageSize (pageSize, plat) {
      this.setPageSizeCache(pageSize);
      this.carrierTableParams.pageSize = pageSize;
      this.getSystemTrackingMoreCarrierData();
    },
    // 监听承运商列表弹窗
    carrierTableModalChange (value) {
      if (!value) {
        this.carrierTableParams.nameCn = '';
        this.carrierTableParams.trackingMoreCarrierCodeIds = [];
        this.carrierTableParams.type = null;
        this.carrierTableParams.pageNum = 1;
        this.carrierTableParams.pageSize = 10;
        this.carrierStatusTalg = '';
      }
    },
    // 重新查询
    requery (packageLogisticsTrackingId) {
      let v = this;
      v.axios
        .get(
          api.get_packageLogisticsTracking_researchTracking +
                        `?packageLogisticsTrackingId=${packageLogisticsTrackingId}`
        )
        .then(res => {
          if (res.data.code === 0) {
            v.$Message.success('操作成功!');
            v.pageParamsStatus = true;
          }
        });
    }
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.operation_nav_box {
    padding: 10px;
    background-color: #fff;
    margin: 10px 0;

    .right_style {
        margin-right: 20px;
    }
}

:deep(.carrierTableModalStyle) {
    .ivu-modal-body {
        max-height: 650px;
        overflow-y: auto;

        .carrier_table_filter {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
    }
}

:deep(.outboundOrderStyle) {
    .outbound_order_radio {
        display: flex;

        .radio_box {
            display: flex;
            flex-direction: column;
            margin-right: 3px;
        }
    }

    .carrier_select {
        display: flex;
        align-items: center;
        margin-top: 20px;

        span {
            display: inline-block;
            width: 80px;
            text-align: right;
            padding-right: 10px;
        }
    }
}

:deep(.trackingStyle) {
    .ivu-modal-body {
        max-height: 600px;
        overflow-y: auto;
    }

    .title_box {
        display: flex;
        flex-direction: column;

        span {
            display: inline-block;
            margin: 5px;
            font-size: 18px;
        }
    }

    .content_box {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

:deep(.tips_style) {
    .tips_box {
        display: flex;
        flex-direction: column;

        .tips_center {
            margin-bottom: 15px;

            .title {
                font-size: 15px;
                color: #333;
            }

            .tips_item_box {
                display: flex;
                flex-wrap: wrap;

                span {
                    padding: 10px;
                }
            }
        }
    }
}
</style>
