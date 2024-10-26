<template >
  <div >
    <div class="modalItemContent" >
      <div class="platformSearch" style="margin-bottom:20px;" >
        <Row >
          <Button-group >
            <Button
                :type="item.checked ? 'primary' : 'default'"
                v-for="item in sortData"
                @click="clickSortButton(item)"
                :key="item.value" >
              {{ item.label }}
              <Icon type="md-arrow-up" v-if="item.checked && !item.toogle" ></Icon >
              <Icon type="md-arrow-down" v-if="item.checked && item.toogle" ></Icon >
            </Button >
          </Button-group >
        </Row >
      </div >
      <!--表格-->
      <Row >
        <Col span="24" >
          <DragableTable
              v-model="tableData"
              :columns-list="columnsList"
              @on-start="handleOnstart"
              @on-end="handleOnend" ></DragableTable >
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
import DragableTable from './dragableTable'; // 引入拖拽子组件
export default {
  mixins: [Mixin],
  components: {
    DragableTable: DragableTable
  },
  data () {
    return {
      totalRecords: 0,
      pageParams: {
        // 参数
        pageNum: 1,
        pageSize: 10,
        DESC: 'DESC', // 降序
        CT: 'PC' // 排序的标记
      },
      cacheClickVal: 'PC', // 排序缓存值
      sortData: [
        {
          label: '重新排序_按批次',
          value: 'PC',
          checked: false,
          toogle: true
        }, {
          label: '重新排序_按有效期',
          value: 'TM',
          checked: false,
          toogle: true
        }
      ],
      isTable: {
        hasDragged: false,
        isDragging: false,
        oldIndex: 0,
        newIndex: 0
      },
      columnsList: [
        {
          type: 'index',
          title: '出货顺序',
          width: 90,
          align: 'center'
        }, {
          title: '调整出货顺序',
          key: 'adjustOrderSort',
          align: 'center',
          width: 260,
          render: (h, params) => {
            return h('div', [
              h('Tooltip', {
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: '当前页置顶',
                  placement: 'bottom'
                }
              }, [
                h('Button', {
                  props: {
                    icon: 'md-arrow-dropup',
                    size: 'small'
                  },
                  style: {
                    marginRight: '20px',
                    color: 'green',
                    display: params.index === 0 ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      this.upIndex(params.index);
                      // console.log('置顶了！');
                    }
                  }
                })
              ]), h('Tooltip', {
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: '当前页置底',
                  placement: 'bottom'
                }
              }, [
                h('Button', {
                  props: {
                    icon: 'md-arrow-dropdown',
                    size: 'small'
                  },
                  style: {
                    marginRight: '20px',
                    color: 'red',
                    display: params.index === this.tableData.length - 1 ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      this.downIndex(params.index);
                      // console.log('置底了！');
                    }
                  }
                })
              ]), h('Tooltip', {
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: '当前页上移',
                  placement: 'bottom'
                }
              }, [
                h('Button', {
                  props: {
                    icon: 'md-arrow-up',
                    size: 'small'
                  },
                  style: {
                    marginRight: '20px',
                    color: 'green',
                    display: params.index === 0 ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      this.moveUp(params.index);
                    }
                  }
                })
              ]), h('Tooltip', {
                props: {
                  transfer: true,
                  maxWidth: 250,
                  content: '当前页下移',
                  placement: 'bottom'
                }
              }, [
                h('Button', {
                  props: {
                    icon: 'md-arrow-down',
                    size: 'small'
                  },
                  style: {
                    marginRight: '20px',
                    color: 'red',
                    display: params.index === this.tableData.length - 1 ? 'none' : 'inline'
                  },
                  on: {
                    click: () => {
                      this.moveDown(params.index);
                    }
                  }
                })
              ])
              // h('Icon', {
              //   props: {
              //     type: 'arrow-move',
              //     size: 22
              //   }
              // })
            ]);
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center'
        }, /* {
         title: '有效期',
         key: 'goodsEndDate',
         align: 'center',
         render: (h, params) => {
         if (params.row.goodsEndDate) {
         return h('div', this.$uDate.dealTime(params.row.goodsEndDate));
         }
         }
         }, */
        {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '可用数量',
          key: 'availableNumber',
          align: 'center'
        }
      ],
      tableData: [],
      adjustSortList: [], // 保存调整前的outSeq
      adjustSortData: [] // 调整出货顺序数据
    };
  },
  props: {
    open: {
      default: null
    },
    productSku: {
      default: null
    },
    wareId: {
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
  },
  methods: {
    searchData () {
      // 查询数据
      var v = this;
      var skuArr = [];
      skuArr.push(v.productSku);
      for (var j = 0; j < this.sortData.length; j++) {
        var paramsObj = {
          productGoodsId: skuArr,
          warehouseId: this.wareId, // 仓库ID
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize,
          orderSeq: v.sortData[0].checked === true || v.sortData[1].checked === true ? v.pageParams.DESC : null,
          orderBy: v.sortData[0].checked === true || v.sortData[1].checked === true ? v.pageParams.CT : null,
          queryState: '2', // 标识
          queryParamType: '3'
        };
      }
      v.axios.post(api.get_inventoryListData, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.tableData = res.data.datas.list;
          v.totalRecords = res.data.datas.total;
        }
      });
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.DESC = 'DESC';
      } else {
        this.pageParams.DESC = 'ASC';
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    handleOnstart (from) {
      var v = this;
      v.isTable.oldIndex = from;
      v.isTable.hasDragged = true;
      v.isTable.isDragging = true;
    },
    handleOnend (e) {
      this.isTable.isDragging = false;
      console.log(this.tableData);
    },
    filterArrFn (arr) {
      // 删除相同的数组元素
      var newObj = {
        id: '',
        index: null
      };
      var newList = JSON.parse(JSON.stringify(arr)).reverse();
      for (var i = 0; i < newList.length; i++) {
        newObj.id = newList[i].inventoryId;
        newObj.index = i;
        for (let j = 0; j < newList.length; j++) {
          if (newObj.id === newList[j].inventoryId && j > newObj.index) {
            newList.splice(j, 1);
          }
        }
      }
      arr = newList.reverse();
      return arr;
    },
    moveUp (index) {
      // 上移按钮
      var v = this;
      let obj = {};
      obj.outSeq = v.tableData[index].outSeq;
      v.tableData[index].outSeq = v.tableData[index - 1].outSeq;
      v.tableData[index - 1].outSeq = obj.outSeq;
      v.tableData.splice(index - 1, 0, v.tableData[index]);
      v.tableData.splice(index + 1, 1);
      var obj1 = {};
      obj1.outSeq = v.tableData[index].outSeq;
      obj1.inventoryId = v.tableData[index].inventoryId;
      obj1.receiptBatchNo = v.tableData[index].receiptBatchNo;
      var obj2 = {};
      obj2.outSeq = v.tableData[index - 1].outSeq;
      obj2.inventoryId = v.tableData[index - 1].inventoryId;
      obj2.receiptBatchNo = v.tableData[index - 1].receiptBatchNo;
      v.adjustSortData.push(obj1, obj2);
      v.adjustSortData = this.filterArrFn(this.adjustSortData);
      console.log(v.tableData);
      v.$Message.success('上移了');
    },
    moveDown (index) {
      // 下移按钮
      var v = this;
      let obj = {};
      obj.outSeq = v.tableData[index].outSeq;
      v.tableData[index].outSeq = v.tableData[index + 1].outSeq;
      v.tableData[index + 1].outSeq = obj.outSeq;
      v.tableData.splice(index + 2, 0, v.tableData[index]);
      v.tableData.splice(index, 1);
      var obj3 = {};
      obj3.outSeq = v.tableData[index].outSeq;
      obj3.inventoryId = v.tableData[index].inventoryId;
      obj3.receiptBatchNo = v.tableData[index].receiptBatchNo;
      var obj4 = {};
      obj4.outSeq = v.tableData[index + 1].outSeq;
      obj4.inventoryId = v.tableData[index + 1].inventoryId;
      obj4.receiptBatchNo = v.tableData[index + 1].receiptBatchNo;
      v.adjustSortData.push(obj3, obj4);
      v.adjustSortData = this.filterArrFn(this.adjustSortData);
      v.$Message.success('下移了');
    },
    upIndex (index) {
      // 置顶按钮
      var v = this;
      v.tableData.forEach(val => {
        v.adjustSortList.push(val.outSeq);
      });
      v.tableData.splice(0, 0, v.tableData[index]);
      v.tableData.splice(index + 1, 1);
      for (var i = 0; i < v.tableData.length; i++) {
        v.tableData[i].outSeq = v.adjustSortList[i];
        let obj5 = {};
        obj5.outSeq = v.tableData[i].outSeq;
        obj5.inventoryId = v.tableData[i].inventoryId;
        obj5.receiptBatchNo = v.tableData[i].receiptBatchNo;
        v.adjustSortData.push(obj5);
      }
      v.$Message.success('置顶了');
    },
    downIndex (index) {
      // 置底按钮
      var v = this;
      v.tableData.forEach(val => {
        v.adjustSortList.push(val.outSeq);
      });
      v.tableData.splice(v.tableData.length, 0, v.tableData[index]);
      v.tableData.splice(index, 1);
      for (var i = 0; i < v.tableData.length; i++) {
        v.tableData[i].outSeq = v.adjustSortList[i];
        let obj6 = {};
        obj6.outSeq = v.tableData[i].outSeq;
        obj6.inventoryId = v.tableData[i].inventoryId;
        obj6.receiptBatchNo = v.tableData[i].receiptBatchNo;
        obj6.goodsEndDate = v.tableData[i].goodsEndDate;
        v.adjustSortData.push(obj6);
      }
      v.$Message.success('置底了');
    },
    sortCommonFn () {
      // 批量排序公用方法
      let v = this;
      let newAdjustObj = {};
      let adjustDtlList = this.filterArrFn(this.adjustSortData);
      if (!adjustDtlList.length) {
        adjustDtlList = null;
      }
      newAdjustObj.orderBy = v.pageParams.CT;
      newAdjustObj.orderSeq = v.pageParams.DESC;
      newAdjustObj.queryParamType = '3';
      newAdjustObj.queryState = '2';
      newAdjustObj.productGoodsId = this.productSku;
      newAdjustObj.warehouseId = this.wareId; // 仓库ID
      newAdjustObj.wmsInventoryList = adjustDtlList;
      return newAdjustObj;
    },
    getSortParams () {
      // 获取新排序的数组
      let newAdjustObj = {};
      let adjustDtlList = this.filterArrFn(this.adjustSortData);
      if (!adjustDtlList.length) {
        adjustDtlList = null;
      }
      for (var j = 0; j < this.sortData.length; j++) {
        if (this.sortData[0].checked === true) {
          let newAdjustObj = this.sortCommonFn();
          return newAdjustObj;
        } else if (this.sortData[1].checked === true) {
          let newAdjustObj = this.sortCommonFn();
          return newAdjustObj;
        } else if (this.sortData[j].checked === false) {
          newAdjustObj.wmsInventoryList = adjustDtlList;
          newAdjustObj.warehouseId = this.wareId; // 仓库ID
          return newAdjustObj;
        }
      }
    },
    saveAdjustSortFn () {
      // 保存调整出货顺序
      let v = this;
      let obj = this.getSortParams();
      v.axios.post(api.adjustInventorySort, obj).then(res => {
        if (res.data.code === 0) {
          v.adjustSortData = [];
          v.adjustSortList = [];
        }
      });
    },
    changePage (page) {
      // 表格分页
      this.pageParams.pageNum = page;
      if (this.adjustSortData.length !== 0) {
        this.saveAdjustSortFn(); // 切页保存
      }
      this.adjustSortData = [];
      this.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    }
  }
};
</script >
