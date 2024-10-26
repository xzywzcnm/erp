<template >
  <div>
    <div class="modalItemContent">
      <Form :model="pageParams" :label-width="100" label-position="left">
        <Row>
          <Col span="8">
          <Form-item label="库位：">
            <Input v-model.trim="pageParams.wareLocate"></Input>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="8">
          <Form-item label="所属库区：">
            <Select v-model="pageParams.warehouseBlockId">
              <Option value="*">全部</Option>
              <Option v-for="item in wareBlockList" :value="item.warehouseBlockId" :key="item.warehouseBlockId">{{
                item.warehouseBlockName }}</Option>
            </Select>
          </Form-item>
          </Col>
          <Col span="8" offset="2">
          <Form-item label="库位使用：">
            <Select v-model="pageParams.yOrNPickLocation">
              <Option value="*">全部</Option>
              <Option value="0">作为收货库位</Option>
              <Option value="1">作为拣货库位</Option>
              <Option value="2">作为异常库位</Option>
              <Option value="3">作为不良品库位</Option>
            </Select>
          </Form-item>
          </Col>
          <Col span="4" offset="2">
          <Button type="primary" @click="locationDataSearch" :disabled="SearchDisabled" icon="ios-search">查询</Button>
          </Col>
        </Row>
      </Form>
      <!-- 表格  -->
      <Row>
        <Col span="24">
        <Table highlight-row border height="560" :columns="columns6" :loading="TableLoading" :data="data6"></Table>
        <!--分页按钮-->
        <div class='table-page'>
          <div class='table-page-right'>
            <Page :total='totalRecords' :current='pageParams.pageNum' @on-change='changePage' show-total
              :page-size='pageParams.pageSize' show-elevator show-sizer @on-page-size-change='changePageSize'
              placement='top' :page-size-opts='pageArray'></Page>
          </div>
        </div>
        </Col>
      </Row>
    </div>
  </div>
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      // warehouseId: this.getWarehouseId(),
      pageParams: {
        wareLocate: '', // 库位
        warehouseBlockId: '*', // 所属库区
        yOrNPickLocation: '*', // 是否拣货库位
        pageNum: 1,
        pageSize: 10
      },
      totalRecords: 0, // 总条数
      // 所属库区
      wareBlockList: [],
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center'
        }, {
          title: '库位代码',
          key: 'warehouseLocationCode',
          align: 'center',
          width: 100
        }, {
          title: '库位名称',
          key: 'warehouseLocationName',
          align: 'center',
          width: 100
        }, {
          title: '库位使用',
          key: 'pickingFlag',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (params.row.pickingFlag === '0') {
              return h('span', '收货库位');
            } else if (params.row.pickingFlag === '1') {
              return h('span', '拣货库位');
            } else if (params.row.pickingFlag === '2') {
              return h('span', '异常库位');
            } else if (params.row.pickingFlag === '3') {
              return h('span', '不良品库位');
            }
          }
        }, {
          title: '所属库区',
          key: 'warehouseBlockName',
          align: 'center',
          width: 100
        }, {
          title: '库区类型',
          key: 'warehouseBlockType',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (params.row.warehouseBlockType === '00') {
              return h('span', '收货区');
            } else if (params.row.warehouseBlockType === '10') {
              return h('span', '标准区');
            } else if (params.row.warehouseBlockType === '11') {
              return h('span', '良品区');
            } else if (params.row.warehouseBlockType === '12') {
              return h('span', '不良品区');
            } else if (params.row.warehouseBlockType === '20') {
              return h('span', '退货区');
            }
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small',
                  disabled: params.row.checkStatus === '1' || ((params.row.pickingFlag === '0' || params.row.pickingFlag === '2') && (v.$route.path === '/inventoryMove' || v.$route.path === '/inventoryAdjust'))
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    if (this.type === 'processProduct') {
                      this.$emit('okSelectPosition', params.row.warehouseLocationName, params.row.warehouseLocationId, params.row.warehouseBlockId);
                    } else {
                      this.checkLocation(params.row);
                    }
                  }
                }
              }, params.row.checkStatus === '1' ? '盘点中' : '选择')
            ]);
          }
        }
      ],
      data6: []
    };
  },
  props: {
    open: {
      default: null
    },
    wareId: {
      default: null
    },
    clickIndex: {
      default: null
    },
    curTableSku: {
      // SKU
      default: null
    },
    curBatchNo: {
      // 批次号
      default: null
    },
    type: {
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
    searchData() {
      // 查询搜索功能
      var v = this;
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize, // warehouseBlockType: ['00', '10', '11', '12', '20'],
        warehouseId: this.getWarehouseId(), // 选择哪条仓库的id
        warehouseLocationStatus: '0'
      };
      if (v.pageParams.wareLocate) { paramsObj.warehouseLocationName = v.pageParams.wareLocate; } // 输入搜索库位
      if (v.pageParams.warehouseBlockId !== '*') { paramsObj.warehouseBlockId = v.pageParams.warehouseBlockId; } // 所属库区
      if (v.pageParams.yOrNPickLocation !== '*') { paramsObj.pickingFlag = v.pageParams.yOrNPickLocation; }
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(this.type === 'processProduct'
        ? api.locationDetailList
        : api.get_inventoryWareLocationData, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            if (this.type === 'processProduct') {
              v.data6 = res.data.datas;
              v.totalRecords = res.data.datas.length;
            } else {
              v.data6 = res.data.datas.list;
              v.totalRecords = res.data.datas.total;
            }
          }
        });
      this.getWareBlockName(); // 调用库区下拉列表
    },
    locationDataSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    },
    getWareBlockName() {
      // 获取所属库区下拉列表
      var v = this;
      var obj = {
        warehouseBlockStatus: '0',
        warehouseId: this.getWarehouseId(), // 选择哪条仓库的id
        warehouseLocationStatus: '0'
      };
      if (this.type === 'processProduct') {
        v.axios.get(api.blockList + '?warehouseId=' + this.getWarehouseId()).then(res => {
          if (res.data.code === 0) {
            v.wareBlockList = res.data.datas;
          }
        });
      } else {
        v.axios.post(api.get_wareBlockName, obj).then(res => {
          if (res.data.code === 0) {
            v.wareBlockList = res.data.datas;
          }
        });
      }
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
    checkLocation(data) {
      // 选择库位
      var v = this;
      v.axios.get(api.getAvailableNumber + '?warehouseLocationId=' + data.warehouseLocationId + '&goodsSku=' + this.curTableSku + '&receiptBatchNo=' + this.curBatchNo).then(res => {
        if (res.data.code === 0) {
          data.clickIndex = this.clickIndex;
          data.toInventoryNumber = res.data.datas;
          v.$emit('sendData', data);
        }
      });
    }
  }
};
</script >
