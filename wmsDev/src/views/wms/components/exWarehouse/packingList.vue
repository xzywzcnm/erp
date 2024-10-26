<template>
  <div class="packingList">
    <div v-if="type !== 'details'">
      <!--头部筛选区域-->
      <div class="searchMain">
        <Form ref="pageParams" :model="pageParams" :label-width="80">
          <dyt-filter>
            <Form-item label="状态：" prop="status" class="notplatformParamsSelect">
              <!-- <Button-group>
                <Button v-for="item in statusList" :key="item.value" :type="item.checked ? 'primary' : 'default'"
                  @click="changeStatus(item.value)">{{ item.label }}</Button>
              </Button-group> -->
              <dyt-select v-model="pageParams.status">
                <Option v-for="(item, i) in statusList" :key="i + 'statusList'" :label="item.label" :value="item.value">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="提单号：" prop="wmsPickupOrderNumber">
              <dyt-input placeholder="请输入提单号" v-model.trim="pageParams.wmsPickupOrderNumber"></dyt-input>
            </Form-item>
            <Form-item label="创建时间">
              <Date-picker style="width:100%" type="datetimerange" :transfer="true" @on-clear="resetDate"
                @on-change="getDateValue" :clearable="true" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" placeholder="选择日期" :value="timeValue" />
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search"
                class="mr10">查询</Button>
              <Button @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <!--排序、操作功能区域-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <span>排序方式：</span>
            <Button-group class="mr10">
              <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" :disabled="SearchDisabled"
                @click="clickSortButton(item)" :key="item.value">{{ item.label }}
                <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
                <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
              </Button>
            </Button-group>
            <Button type="primary" @click="addPackingBtn">新增箱/袋</Button>
          </div>
        </div>
      </div>

      <!--列表区域-->
      <div class="tableMain">
        <div class="tableBox">
          <Table highlight-row border :loading="TableLoading" :height="tableHeight" :columns="tableColumns"
            :data="tableData"></Table>
        </div>
      </div>
      <!-- 分页 -->
      <div class="pagesMain">
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
          :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!--查看箱子详情信息-->
    <div v-else>
      <!--返回列表按钮-->
      <div class="details_box">
        <Icon type="ios-arrow-back" class="back_icon" />
        <a @click="backPage">返回列表</a>
      </div>
      <!--基本信息-->
      <div class="information_box">
        <Card :bordered="false">
          <h2 slot="title" class="title_box">基本信息</h2>
          <Row type="flex" :gutter="gutterItem">
            <Col :span="ItemCol" class="basic_item">
            <span class="basic_title">提单号：</span>
            <span class="basic_txt">{{ detailsObj.pickupOrderNumber }}</span>
            </Col>
            <Col :span="ItemCol" class="basic_item">
            <span class="basic_title">状态：</span>
            <span class="basic_txt">{{ detailsObj.statusText }}</span>
            </Col>
            <Col :span="ItemCol" class="basic_item">
            <span class="basic_title">创建时间：</span>
            <span class="basic_txt">{{ detailsObj.createdTime }}</span>
            </Col>
            <Col :span="ItemCol" class="basic_item">
            <span class="basic_title">揽收时间：</span>
            <span class="basic_txt">{{ detailsObj.pickupTime }}</span>
            </Col>
          </Row>
        </Card>
      </div>
      <!--明细信息-->
      <div class="information_box">
        <Card :bordered="false">
          <h2 slot="title" class="title_box">明细信息</h2>
          <Button type="primary" style="margin-bottom: 15px;" @click="deliveryOrderModal = true">批量添加出库单</Button>
          <Table highlight-row border max-height="650" :columns="detailsTableColumns" :data="detailsTableData"></Table>
        </Card>
      </div>
    </div>
    <!--批量添加出库单-->
    <Modal v-model="deliveryOrderModal" class-name="deliveryOrderStyle" title="批量添加出库单" width="600" :transfer="false"
      :mask-closable="false" @on-visible-change="deliveryOrderModalChange">
      <div class="deliveryOrderBox">
        <span>出库单号</span>
        <Input v-model="oddNumberList" type="textarea" placeholder="输入多个请用逗号或者换行分隔" :rows="3" style="width: 90%;" />
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="deliveryOrderModal = false">取消</Button>
        <Button type="primary" @click="deliveryOrderBtn">确定</Button>
      </div>
    </Modal>
    <!--打印箱唛-->
    <printCaseMarkModal v-if="printTalg" :wmsPickupOrderId="wmsPickupOrderId" @closeBtn="closeBtn"></printCaseMarkModal>
    <!--批量添加出库单的提示弹窗-->
    <Modal v-model="tipsTalg" class-name="tips_style">
      <div class="tips_box">
        <div class="tips_center" v-for="(item, index) in tipsList" :key="index">
          <h3 class="title">{{ item.text + '：' }}</h3>
          <div class="tips_item_box">
            <span v-for="(ele, ids) in item.data" :key="ids">{{ ele.packageCode }}</span>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="tipsTalg = false">关闭</Button>
      </div>
    </Modal>
    <aliexpressAdvanceDelivery ref="aliexpressAdvanceDelivery"></aliexpressAdvanceDelivery>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import printCaseMarkModal from './printCaseMarkModal';
import aliexpressAdvanceDelivery from '@/views/wms/components/exWarehouse/aliexpressAdvanceDelivery';

export default {
  name: 'packingList',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      tipsTalg: false,
      tipsList: [],
      total: 0,
      curPage: 1,
      timeValue: [],
      cacheClickVal: 'createdTime',
      pageParamsStatus: false,
      statusList: [
        // {
        //   label: '全部',
        //   value: '*',
        //   checked: true
        // },
        {
          label: '正在装箱',
          value: 0,
          checked: false
        }, {
          label: '等待揽收',
          value: 1,
          checked: false
        }, {
          label: '已揽收',
          value: 2,
          checked: false
        }
      ],
      type: 'case',
      pageParams: {
        status: '',
        wmsPickupOrderNumber: null,
        createdStartTime: null,
        createdEndTime: null,
        upDown: 'down',
        orderBy: 'createdTime',
        pageNum: 1,
        pageSize: 10
      },
      sortData: [ // 排序数据
        {
          label: '按创建时间',
          value: 'createdTime',
          checked: true,
          toogle: true
        }
      ],
      tableData: [],
      tableColumns: [
        {
          title: '提单号',
          key: 'pickupOrderNumber',
          align: 'center',
          render: function (h, params) {
            return h('a', {
              style: {
                display: 'inline-block',
                width: '100%',
                height: '100%'
              },
              on: {
                click: function () {
                  v.type = 'details';
                  v.pickupOrderNumber = params.row.pickupOrderNumber;
                  v.getPickupOrderData(params.row.pickupOrderNumber);
                }
              }
            }, params.row.pickupOrderNumber);
          }
        },
        {
          title: '箱/袋内包裹数量',
          key: 'packageQuantity',
          align: 'center'
        },
        {
          title: '物流商',
          key: 'carrier',
          align: 'center',
          render (h, params) {
            let carrierName = '-';
            let no = '-'
            if (params.row.carrier) {
              carrierName = params.row.carrier.carrierName
            }
            if (params.row.extendJson) {
              let json = JSON.parse(params.row.extendJson)
              json['aliexpress'].forEach(i => {
                if (i.paramKey === 'handoverContentCode') {
                  no = i.paramValue
                }
              })
            }
            return h('div', [
              h('p', carrierName),
              h('p', no)
            ])
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            // 状态(0:正在装箱，1:等待揽收，2:已揽收,99:已作废)
            let status = '';
            v.statusList.map((item) => {
              if (item.value === params.row.status) {
                status = item.label;
              }
            });
            return h('span', status);
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', v.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        },
        {
          title: '揽收日期',
          key: 'pickupTime',
          align: 'center',
          render: (h, params) => {
            return h('div', v.$uDate.getDataToLocalTime(params.row.pickupTime, 'fulltime'));
          }
        },
        {
          title: '创建人',
          key: 'createdBy',
          align: 'center',
          render: (h, params) => {
            let createdName = '';
            let createdBy = params.row.createdBy;
            if (createdBy) {
              createdName = (v.$store.state.userInfoList[createdBy]
                ? v.$store.state.userInfoList[createdBy].userName
                : '') || '';
            } else {
              createdName = '';
            }
            return h('div', createdName);
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 170,
          render: (h, params) => {
            if (params.row !== undefined) {
              let isAliexpress = false;
              let isContendId = false;
              if (params.row.extendJson) {
                let json = JSON.parse(params.row.extendJson)
                json['aliexpress'].forEach(i => {
                  if (i.paramKey === 'handoverContentId') {
                    isContendId = true
                  }
                })
              }
              if (params.row.carrier && params.row.carrier.carrierCode === 'aliexpress') {
                isAliexpress = true
              }
              return h('local-down-button', {
                props: {
                  data: {
                    btn: {
                      text: '查看',
                      disabled: false,
                      clickFn: () => {
                        v.type = 'details';
                        v.pickupOrderNumber = params.row.pickupOrderNumber;
                        v.getPickupOrderData(params.row.pickupOrderNumber);
                      }
                    },
                    list: [
                      {
                        text: '添加包裹',
                        value: 1,
                        hide: params.row.status === 2,
                        clickFn: () => {
                          v.deliveryOrderModal = true;
                          v.pickupOrderNumber = params.row.pickupOrderNumber;
                          v.wmsPickupOrderId = params.row.wmsPickupOrderId;
                        }
                      },
                      {
                        text: '继续装箱',
                        value: 2,
                        hide: params.row.status !== 0, // 正在装箱的状态，才能继续装箱
                        clickFn: () => {
                          let obj = {
                            value: 'scanPacking',
                            pickupOrderNumber: params.row.pickupOrderNumber,
                            type: 'continue'
                          };
                          v.$emit('changeTabs', obj);
                        }
                      },
                      {
                        text: '打印箱唛',
                        value: 3,
                        hide: false,
                        clickFn: () => {
                          v.printTalg = true;
                          v.wmsPickupOrderId = params.row.wmsPickupOrderId;
                        }
                      },
                      {
                        text: '打印预约面单',
                        value: 5,
                        hide: !isAliexpress || !isContendId,
                        clickFn: () => {
                          v.printPdfGetWmsPickupOrder(params.row.pickupOrderNumber)
                        }
                      },
                      {
                        text: '预约交货',
                        value: 6,
                        hide: !isAliexpress,
                        clickFn: () => {
                          v.$refs.aliexpressAdvanceDelivery.open(params.row)
                        }
                      },
                      {
                        text: '取消预约交货',
                        value: 7,
                        hide: !isAliexpress || !isContendId,
                        clickFn: () => {
                          v.cancelWmsPickupOrder_cancelPickupOrder(params.row.pickupOrderNumber)
                        }
                      },
                      {
                        text: '删除',
                        value: 4,
                        hide: params.row.status !== 0,
                        clickFn: () => {
                          v.deletePackage(params.row.wmsPickupOrderId);
                        }
                      }
                    ]
                  }
                }
              });
            }
          }
        }
      ],
      ItemCol: 6,
      gutterItem: 16, // 栅格间距，单位 px，左右平分
      detailsObj: {},
      deliveryOrderModal: false,
      detailsTableColumns: [
        {
          title: '行号',
          key: 'index',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        },
        {
          title: '出库单号',
          key: 'packageCode',
          align: 'center'
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center'
        }
      ],
      detailsTableData: [],
      oddNumberList: '',
      printTalg: false,
      wmsPickupOrderId: null,
      pickupOrderNumber: null
    };
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(335);
    }
  },
  created () {
    this.getList();
  },
  methods: {
    /**
     * 打印预约面单
     * */
    printPdfGetWmsPickupOrder (pickupOrderNumber) {
      let newWindow = window.open();
      this.axios.put(api.put_wmsPickupOrder_printPdfGetWmsPickupOrder + pickupOrderNumber).then(response => {
        if (response.data.code === 0) {
          const urlPath = response.data.datas;
          const prefix = 'filenode/s/';
          const path = urlPath.indexOf(prefix) >= 0 ? urlPath : prefix + urlPath;
          const url = '/wms-service/static/pdf/web/viewer.html?file=' + window.location.origin + '/wms-service/' + path;
          newWindow.location = url;
        } else {
          newWindow.close();
        }
      }).catch(() => {
        newWindow.close();
      })
    },
    /**
     * 取消预约交货
     * */
    cancelWmsPickupOrder_cancelPickupOrder (pickupOrderNumber) {
      let v = this;
      v.axios.get(api.get_wmsPickupOrder_cancelPickupOrder + pickupOrderNumber).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('取消成功');
        }
      })
    },
    // 切换选中状态
    changeStatus (value) {
      this.statusList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.status = value;
    },
    // 获取创建时间
    getDateValue (value) {
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.createdStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.createdEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    // 重置创建时间
    resetDate () {
      let v = this;
      v.pageParams.createdStartTime = null;
      v.pageParams.createdEndTime = null;
    },
    // 查询按钮
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    // 获取列表的数据
    getList () {
      let v = this;
      v.TableLoading = true;
      v.axios.post(api.post_wmsPickupOrder_query, v.pageParams).then(response => {
        v.TableLoading = false;
        if (response && response.data && response.data.code === 0) {
          v.tableData = response.data.datas.list;
          v.total = response.data.datas.total;
        }
      });
    },
    // 新增箱/袋
    addPackingBtn () {
      let obj = {
        value: 'scanPacking',
        type: 'adding'
      };
      this.$emit('changeTabs', obj);
    },
    // 删除包裹
    deletePackage (wmsPickupOrderId) {
      let v = this;
      v.$Modal.confirm({
        title: '是否要删除当前提单号？',
        onOk: () => {
          v.axios.delete(api.delete_wmsPickupOrder + `${wmsPickupOrderId}`).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功！');
              v.pageParamsStatus = true;
            }
          });
        },
        onCancel: () => {
        }
      });
    },
    // 点击排序的按钮
    clickSortButton (data) {
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.upDown = 'down';
      } else {
        this.pageParams.upDown = 'up';
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.pageParamsStatus = true;
    },
    // 重置数据
    reset () {
      // this.changeStatus(null);
      this.resetDate();
      this.timeValue = [];
      this.$refs['pageParams'].resetFields();
    },
    // 关闭详情页面
    backPage () {
      this.type = 'case';
      this.pageParamsStatus = true;
    },
    // 获取查看装箱详情的数据
    getPickupOrderData (pickupOrderNumber) {
      let v = this;
      v.TableLoading = true;
      v.axios.get(api.get_wmsPickupOrder + `${pickupOrderNumber}`).then(response => {
        v.TableLoading = false;
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.statusList.map((item) => {
            if (item.value === data.status) {
              data.statusText = item.label;
            }
          });
          data.createdTime = v.$uDate.getDataToLocalTime(data.createdTime, 'fulltime');
          data.pickupTime = v.$uDate.getDataToLocalTime(data.pickupTime, 'fulltime');
          v.detailsObj = data;
          v.wmsPickupOrderId = data.wmsPickupOrderId;
          if (data.wmsPickupOrderDetails) {
            v.detailsTableData = data.wmsPickupOrderDetails;
          }
        }
      });
    },
    // 关闭弹窗重置数据
    deliveryOrderModalChange (value) {
      if (!value) {
        this.oddNumberList = '';
      }
    },
    // 批量添加出库单弹窗的确定按钮
    deliveryOrderBtn () {
      let v = this;
      let obj = {};
      if (v.oddNumberList) {
        obj.packageCodes = v.sepCommasFn(v.oddNumberList);
        obj.wmsPickupOrderId = v.wmsPickupOrderId;
      } else {
        v.$Message.warning('请输入出库单!');
        return false;
      }
      v.axios.post(api.post_wmsPickupOrderDetail, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.length > 0) {
            data.map((item) => {
              if (item.code === 111004) {
                item['text'] = '包裹不存在';
              } else if (item.code === 310027) {
                item['text'] = '包裹不是出库状态';
              } else if (item.code === 310029) {
                item['text'] = '该包裹已提单';
              }
            });
            v.tipsList = v.handerGrouping(data, function (item) {
              return [item.text];
            }, 'text');
            v.tipsTalg = true;
          } else {
            v.$Message.success('操作成功！');
          }
          this.deliveryOrderModal = false;
          if (v.type === 'case') {
            v.pageParamsStatus = true;
          } else {
            v.getPickupOrderData(v.pickupOrderNumber);
          }
        }
      });
    },
    // 关闭打印箱唛的弹窗
    closeBtn (value) {
      this.printTalg = value;
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
  },
  components: {
    printCaseMarkModal,
    aliexpressAdvanceDelivery
  }
};
</script>

<style lang="less" scoped>
.details_box {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .back_icon {
    font-size: 17px;
    color: #2d8cf0;
  }

  a {
    display: inline-block;
  }
}

.information_box {
  margin-top: 10px;

  .title_box {
    color: #333;
    font-size: 17px;
    font-weight: bold;
    background-color: #fff;
  }

  .basic_item {
    line-height: 35px;
    display: flex;
  }
}

:deep(.deliveryOrderStyle) {
  .deliveryOrderBox {
    display: flex;

    span {
      display: inline-block;
      width: 60px;
      margin: 5px 8px 0 0;
    }
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
