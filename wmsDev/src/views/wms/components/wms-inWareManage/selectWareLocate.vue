<template >
  <div >
    <div class="modalItemContent" >
      <Form :model="pageParams" :label-width="80" label-position="left" >
        <Row :gutter="20">
          <Col span="8" >
            <Form-item label="库位：" >
              <Input v-model.trim="pageParams.wareLocate" ></Input >
            </Form-item >
          </Col >
          <Col span="8" >
            <Form-item label="所属库区：" >
              <Select v-model="pageParams.warehouseBlockId" > <Option value="*" >全部</Option > <Option
                  v-for="item in wareBlockDataList"
                  :value="item.warehouseBlockId"
                  :key="item.warehouseBlockId" >{{ item.warehouseBlockName }} </Option > </Select >
            </Form-item >
          </Col >
          <Col span="6" offset="2" >
            <Button type="primary" @click="locateSearchData" :disabled="SearchDisabled" icon="ios-search" >查询</Button >
          </Col >
        </Row >
      </Form >
      <!-- 表格  -->
      <Row >
        <Col span="24" >
          <Table highlight-row border :columns="columns6" :loading="TableLoading" :data="data6" height="200" ></Table >
          <!--分页按钮-->
          <div class="table-page" >
            <div class="table-page-right" >
              <Page
                  :total="totalRecords"
                  :current="pageParams.pageNum"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray" ></Page >
            </div >
          </div >
        </Col >
      </Row >
    </div >
  </div >
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      pickingFlag: v.$store.state.pickingFlag,
      pageParams: {
        wareLocate: '', // 库位
        warehouseBlockId: '*', // 所属库区
        selectWareLocateUseType: '*', // 库位使用
        pageNum: 1,
        pageSize: 10
      },
      totalRecords: 0, // 总条数 // 所属库区
      wareBlockDataList: [],
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center'
        }, {
          title: '库位代码',
          key: 'warehouseLocationCode',
          align: 'center'
        }, {
          title: '库位名称',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '库位使用',
          key: 'pickingFlag',
          align: 'center',
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
          align: 'center'
        }, {
          title: '库区类型',
          key: 'warehouseBlockType',
          align: 'center',
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
                  disabled: params.row.checkStatus === '1'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    if (params.row.checkStatus === '1') {
                      return;
                    }
                    this.selectLocationName(params.row);
                  }
                }
              }, params.row.checkStatus === '1' ? '盘点中' : '选择')
            ]);
          }
        }
      ],
      data6: [],
      selectNum: null
    };
  },
  props: {
    open: {
      default: null
    },
    shelfWareId: {
      // 提交上架结果仓库ID
      default: null
    },
    passMark: {
      // 合格库位还是不合格库位的标记
      default: null
    },
    receiptWareId: {
      // 入库单详情仓库ID
      default: null
    },
    clickIndex: {
      default: null
    },
    workType: {
      // 确认上架or收货质检添加货品的标记
      default: null
    },
    locateCheckType: {
      // 库位选择区分标记
      default: null
    },
    shelfLocate: {
      // 上架管理库位选择
      default: null
    },
    fromLocateParams: {
      default: null
    },
    warehouseLocationId: {
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
  created () {
    this.searchData();
    this.getWareBlockName(); // 调用库区下拉列表
  },
  methods: {
    searchData () {
      // 查询功能
      var v = this;
      var shelfObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        warehouseId: this.receiptWareId, // warehouseBlockType: ['00', '10'],
        warehouseLocationStatus: '0',
        pickingFlag: this.pickingFlag // 库位使用 null 全部  0：作为收货库位 1：作为拣货库位
      };
      if (v.pageParams.wareLocate) { shelfObj.warehouseLocationIdOrName = v.pageParams.wareLocate; } // 输入搜索库位
      if (v.pageParams.warehouseBlockId !== '*') { shelfObj.warehouseBlockId = v.pageParams.warehouseBlockId; } // 所属库区
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.selectWareLocation, shelfObj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          v.data6 = res.data.datas.list;
          v.totalRecords = res.data.datas.total;
        }
      });
    },
    locateSearchData () {
      // 页面查询
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    },
    getWareBlockName () {
      // 获取所属库区下拉列表
      var v = this;
      let obj = {
        warehouseBlockStatus: '0', // warehouseBlockTypeList: ['00', '10'],
        warehouseId: this.receiptWareId
      };
      v.axios.post(api.selectDetailWareBlock, obj).then(res => {
        if (res.data.code === 0) {
          v.wareBlockDataList = res.data.datas;
        }
      });
      /* if (this.workType === 'shelfFlag') {
       var obj = {
       warehouseBlockStatus: '0',
       warehouseBlockTypeList: ['10', '11', '12', '20'],
       warehouseId: this.receiptWareId
       };
       v.axios.post(api.selectDetailWareBlock, obj)
       .then(res => {
       if (res.data.code === 0) {
       v.wareBlockDataList = res.data.datas;
       }
       });
       } else if (this.workType === 'qualityFlag') {
       let obj = {
       warehouseBlockStatus: '0',
       warehouseBlockTypeList: ['00', '10'],
       warehouseId: this.receiptWareId
       };
       v.axios.post(api.selectDetailWareBlock, obj)
       .then(res => {
       if (res.data.code === 0) {
       v.wareBlockDataList = res.data.datas;
       }
       });
       } else if (this.shelfLocate === 'shelfLocateName') {
       if (this.selectNum && this.passMark === 0) {
       this.passMark = this.selectNum;
       }
       if (this.passMark === 1) {
       let obj = {
       warehouseBlockStatus: '0',
       warehouseBlockTypeList: ['10', '11'],
       warehouseId: this.shelfWareId
       };
       v.axios.post(api.selectShelfWareBlockName, obj)
       .then(res => {
       if (res.data.code === 0) {
       v.wareBlockDataList = res.data.datas;
       }
       });
       } else if (this.passMark === 2) {
       let obj = {
       warehouseBlockStatus: '0',
       warehouseBlockTypeList: ['10', '12'],
       warehouseId: this.shelfWareId
       };
       v.axios.post(api.selectShelfWareBlockName, obj)
       .then(res => {
       if (res.data.code === 0) {
       v.wareBlockDataList = res.data.datas;
       }
       });
       }
       } */
    },
    changePage (page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    selectLocationName (data) {
      // 选择库位
      var v = this;
      if (v.locateCheckType === 'checkShelvesP') {
        data.clickIndex = this.clickIndex;
        this.$emit('sendData', data); // 确认上架库位选择
      } else if (v.locateCheckType === 'checkShelvesU') {
        data.clickIndex = this.clickIndex;
        this.$emit('sendData', data); // 确认上架无源入库 库位选择
      } else if (v.locateCheckType === 'checkQualityP') {
        data.clickIndex = this.clickIndex;
        this.$emit('sendData', data); // 确认质检库位选择
      } else if (v.locateCheckType === 'checkQualityU') {
        data.clickIndex = this.clickIndex;
        this.$emit('sendData', data); // 确认质检 无源入库 库位选择
      } else if (v.shelfLocate === 'shelfLocateName') {
        this.$emit('sendData', data); // 确认质检 无源入库 库位选择
      } else if (v.workType === 'fromLocateManage') {
        this.$emit('sendData', data);
      }
    }
  }
};
</script >
