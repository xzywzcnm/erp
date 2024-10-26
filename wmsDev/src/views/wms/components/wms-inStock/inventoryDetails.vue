<template>
  <div>
    <div class="modalItemContent">
      <div class="card-container">
        <div class="platformSearch formDetail">
          <Form :model="pageParams" label-position="right" :label-width="90" inline>
            <div class="autoLong">
              <Form-item label="库存变化类型：" :label-width="100">
                <Button-group>
                  <Button v-for="d in InventoryList" :key="d.value" :type="d.checked ? 'primary' : 'default'"
                    @click="changeCognateStatus(d.value)">{{ d.label }}
                  </Button>
                </Button-group>
              </Form-item>
            </div>

            <div class="formWidth200">
              <Form-item label="批次号：" :label-width="100">
                <Input placeholder="输入批次号" v-model.trim="pageParams.searchBatch"></Input>
              </Form-item>
              <Form-item label="库位：">
                <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="多个库区，用逗号或换行分隔"
                  v-model.trim="pageParams.searchLocation" />
              </Form-item>
              <Form-item label="操作时间：">
                <DatePicker type="daterange" transfer placeholder="选择日期" :value="[
                  pageParams.expectedStartTime,
                  pageParams.expectedEndTime,
                ]" @on-change="createTimeChange" format="yyyy-MM-dd">
                </DatePicker>
              </Form-item>
              <Form-item label="" :label-width="20">
                <Button type="primary" @click="inventDtlSearch" :disabled="SearchDisabled" icon="ios-search">查询</Button>
                <Button style="margin-left: 15px;" @click="exportDataMt">excel导出</Button>
              </Form-item>
            </div>

          </Form>
        </div>
      </div>
      <!--表格-->
      <Row>
        <Col span="24">
        <Table highlight-row border :columns="columns6" :loading="TableLoading" :data="data6" ref="table">
        </Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
              :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<style scoped>
.inventory :deep(.ivu-form-item-label) {
  width: 100px !important;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    return {
      totalRecords: 0,
      pageParams: {
        searchBatch: '',
        searchLocation: '',
        expectedStartTime: '',
        expectedEndTime: '',
        changedNumType: null,
        pageNum: 1,
        pageSize: 10
      },
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        }, {
          title: '仓库',
          key: 'warehouseName',
          width: 100,
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          width: 100,
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          width: 120,
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          width: 120,
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          width: 120
        }, {
          title: '有效期',
          key: 'goodsEndDate',
          width: 100,
          align: 'center'
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          width: 100,
          align: 'center'
        }, {
          title: '事务类型',
          key: 'logType',
          align: 'center',
          width: 120,
          render: (h, params) => {
            let temp = {
              'S0': '系统操作',
              'I0': '收货',
              'I1': '上架',
              'I2': '分配',
              'I3': '取消分配',
              'I4': '库存移动',
              'I5': '库存冻结',
              'I6': '取消冻结',
              'I7': '库存调整',
              'I8': '调拨出库',
              'I9': '收货上架',
              'O0': '调整顺序',
              'CC': '取消出库',
              'O2': '同步库存',
              'IA': '取消收货',
              'R1': '回收库存',
              'R3': '归库',
              'R4': '出库',
              'CP': '质检不良品',
              'TS': '转合格上架',
              'CA': '重新质检',
            };
            return h('span', temp[params.row.logType]);
            // if (params.row.logType === 'S0') {
            //   return h('span', '系统操作'); // 系统操作
            // } else if (params.row.logType === 'I0') {
            //   return h('span', '收货'); // 收货
            // } else if (params.row.logType === 'I1') {
            //   return h('span', '上架'); // 上架
            // } else if (params.row.logType === 'I2') {
            //   return h('span', '分配'); // 分配
            // } else if (params.row.logType === 'I3') {
            //   return h('span', '取消分配'); // 取消分配
            // } else if (params.row.logType === 'I4') {
            //   return h('span', '库存移动'); // 库存移动
            // } else if (params.row.logType === 'I5') {
            //   return h('span', '库存冻结'); // 库存冻结
            // } else if (params.row.logType === 'I6') {
            //   return h('span', '取消冻结'); // 取消冻结
            // } else if (params.row.logType === 'I7') {
            //   return h('span', '库存调整'); // 库存调整
            // } else if (params.row.logType === 'I8') {
            //   return h('span', '调拨出库'); // 调拨出库
            // } else if (params.row.logType === 'I9') {
            //   return h('span', '收货上架'); // 收货上架
            // } else if (params.row.logType === 'O0') {
            //   return h('span', '调整顺序'); // 调整顺序
            // } else if (params.row.logType === 'CC') {
            //   return h('span', '取消出库'); // 取消出库
            // } else if (params.row.logType === 'O2') {
            //   return h('span', '同步库存'); // 同步库存
            // } else if (params.row.logType === 'IA') {
            //   return h('span', '取消收货'); // 取消收货
            // } else if (params.row.logType === 'R1') {
            //   return h('span', '回收库存'); // 回收库存
            // } else if (params.row.logType === 'R3') {
            //   return h('span', '归库'); // 归库
            // } else if (params.row.logType === 'R4') {
            //   return h('span', '出库'); // 出库
            // } else if (params.row.logType === 'CP') {
            //   return h('span', '质检不良品'); // 质检不良品
            // }
          }
        }, {
          title: '可用库存变化',
          key: 'changedNum',
          align: 'center',
          width: 120,
          render(h, params) {
            return params.row.changedType === '+'
              ? h('span', {
                style: {
                  color: 'green'
                }
              }, params.row.changedType + params.row.changedNum)
              : h('span', {
                style: {
                  color: 'red'
                }
              }, params.row.changedType + params.row.changedNum);
          }
        }, {
          title: '可用库存结存',
          key: 'remainderNum',
          width: 120,
          align: 'center'
        }, {
          title: '分配库存变化',
          key: 'allottedChangedNum',
          width: 120,
          align: 'center',
          render(h, params) {
            return params.row.allottedChangedNum > 0
              ? h('span', {
                style: {
                  color: 'green'
                }
              }, '+' + params.row.allottedChangedNum)
              : params.row.allottedChangedNum < 0
                ? h('span', {
                  style: {
                    color: 'red'
                  }
                }, params.row.allottedChangedNum)
                : h('span', params.row.allottedChangedNum);
          }
        }, {
          title: '分配库存结存',
          key: 'allottedRemainderNum',
          width: 120,
          align: 'center'
        }, {
          title: '待归库库存变化',
          key: 'waitComebackChangedNum',
          width: 130,
          align: 'center',
          render(h, params) {
            return params.row.waitComebackChangedNum > 0
              ? h('span', {
                style: {
                  color: 'green'
                }
              }, '+' + params.row.waitComebackChangedNum)
              : params.row.waitComebackChangedNum < 0
                ? h('span', {
                  style: {
                    color: 'red'
                  }
                }, '-' + params.row.waitComebackChangedNum)
                : h('span', params.row.waitComebackChangedNum);
          }
        }, {
          title: '待归库库存结存',
          key: 'waitComebackRemainderNum',
          width: 130,
          align: 'center'
        }, {
          title: '库存总量变化',
          key: 'totalInventoryChangedNum',
          width: 120,
          align: 'center',
          render(h, params) {
            return params.row.totalInventoryChangedNum > 0
              ? h('span', {
                style: {
                  color: 'green'
                }
              }, '+' + params.row.totalInventoryChangedNum)
              : params.row.totalInventoryChangedNum < 0
                ? h('span', {
                  style: {
                    color: 'red'
                  }
                }, params.row.totalInventoryChangedNum)
                : h('span', params.row.totalInventoryChangedNum);
          }
        }, {
          title: '不良品库存变动',
          key: 'defectiveChangedNum',
          width: 130,
          align: 'center',
          render(h, params) {
            return params.row.defectiveChangedNum > 0
              ? h('span', {
                style: {
                  color: 'green'
                }
              }, '+' + params.row.defectiveChangedNum)
              : params.row.defectiveChangedNum < 0
                ? h('span', {
                  style: {
                    color: 'red'
                  }
                }, params.row.defectiveChangedNum)
                : h('span', params.row.defectiveChangedNum);
          }
        }, {
          title: '不良品库存结存',
          key: 'defectiveRemainderNum',
          width: 130,
          align: 'center'
        }, {
          title: '库存总量结存',
          key: 'totalInventoryRemainderNum',
          width: 120,
          align: 'center'
        }, {
          title: '相关单据号',
          key: 'relatedBusinessNo',
          width: 120,
          align: 'center'
        }, {
          title: '操作时间',
          key: 'updatedTime',
          width: 120,
          align: 'center'
        }, {
          title: '操作人',
          width: 120,
          key: 'updatedBy',
          align: 'center'
        }
      ],
      data6: [],
      InventoryList: [// 库存变化类型
        {
          label: '全部',
          value: 'null',
          checked: true
        }, {
          label: '可用库存变化',
          value: '1',
          checked: false
        }, {
          label: '已分配库存变化',
          value: '2',
          checked: false
        }, {
          label: '待归库库存变化',
          value: '3',
          checked: false
        }, {
          label: '库存总量变化',
          value: '4',
          checked: false
        }, {
          label: '不良品库存变动',
          value: '5',
          checked: false
        }
      ]
    };
  },
  props: {
    open: {
      default: null
    },
    productSku: {
      default: null
    },
    productGoodsId: {
      default: null
    },
    wareId: {
      default: null
    },
    inventoryId: {
      default: null
    }
  },
  watch: {
    open: function (val) {
      if (val) {
        this.searchData();
      }
    }
  },
  created() {
    this.searchData();
  },
  methods: {
    createTimeChange(e) {
      this.pageParams.expectedStartTime = e[0] || "";
      this.pageParams.expectedEndTime = e[1] || "";
    },
    exportDataMt() {
      var v = this;
      var paramsObj = {
        productGoodsId: v.productGoodsId,
        warehouseId: v.wareId,
        changedNumType: v.pageParams.changedNumType,
        warehouseLocationNames: v.pageParams.searchLocation === ''
          ? null
          : this.sepCommasFn(v.pageParams.searchLocation) // 输入多个库位
      };
      if (v.pageParams.searchBatch) {
        paramsObj.receiptBatchNo = v.pageParams.searchBatch;
      } // 输入批次号
      if (v.pageParams.expectedStartTime) {
        // paramsObj.updatedTimeStart = v.$uDate.getDateTime(v.pageParams.expectedStartTime, 'fulltime');
        paramsObj.updatedTimeStart = v.pageParams.expectedStartTime + ' 00:00:00';
      } // 开始时间
      if (v.pageParams.expectedEndTime) {
        // paramsObj.updatedTimeEnd = v.$uDate.getDateTime(v.pageParams.expectedEndTime) + ' 23:59:59';
        paramsObj.updatedTimeEnd = v.pageParams.expectedEndTime + ' 23:59:59';
      }
      v.axios.post(api.wmsInventExport, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('导出成功');
        }
      });
    },
    searchData() {
      // 查询功能
      var v = this;
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        productGoodsId: v.productGoodsId,
        changedNumType: v.pageParams.changedNumType,
        warehouseId: v.wareId,
        warehouseLocationNames: v.pageParams.searchLocation === ''
          ? null
          : this.sepCommasFn(v.pageParams.searchLocation) // 输入多个库位
      };
      if (v.pageParams.searchBatch) {
        paramsObj.receiptBatchNo = v.pageParams.searchBatch;
      } // 输入批次号
      if (v.pageParams.expectedStartTime) {
        // paramsObj.updatedTimeStart = v.$uDate.getDateTime(v.pageParams.expectedStartTime, 'fulltime');
        paramsObj.updatedTimeStart = v.pageParams.expectedStartTime + ' 00:00:00';
      } // 开始时间
      if (v.pageParams.expectedEndTime) {
        // paramsObj.updatedTimeEnd = v.$uDate.getDateTime(v.pageParams.expectedEndTime) + ' 23:59:59';
        paramsObj.updatedTimeEnd = v.pageParams.expectedEndTime + ' 23:59:59';
      } // 结束时间
      // get_inventoryLogListData
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.inventoryLogListSearchData, paramsObj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          let arr = res.data.datas.list
            ? res.data.datas.list
            : [];
          this.data6 = this.processTimeData(arr, 'updatedTime');
          this.totalRecords = res.data.datas.total;
        } else {
          this.$Message.warning('获取列表数据失败');
        }
      });
    },
    inventDtlSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    changePage(page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    exportData() {
      // 导出表格数据
      this.$refs.table.exportCsv({
        filename: '库存事务明细表格数据'
      });
    },
    // 选择库存变化类型
    changeCognateStatus(val) {
      let v = this;
      v.InventoryList.forEach((n, i) => {
        n.checked = n.value === val;
      });
      if (val === 'null') {
        v.pageParams.changedNumType = null;
      } else {
        v.pageParams.changedNumType = val;
      }
    }
  }
};
</script>
