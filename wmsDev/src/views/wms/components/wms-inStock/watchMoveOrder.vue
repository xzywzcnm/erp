<template >
  <dyt-model :modalVisible.sync="modalVisible" @backList="backLists" :pageLoading="pageLoading">
    <div slot="lefts">
      <Button type="primary" v-if="isShowCheck" @click="checkPassBtn">审核通过</Button>
      <Button type="primary" v-show="isMoveShow && !!stockData.length" @click="movePassBtn" class="mr10"
        :disabled="!getPermission('wmsInventoryMove_perform')">执行移动单</Button>
      <Tooltip placement="top" content="若表格无数据，则保存后会删除该移动单！" transfer max-width="300">
        <Button type="primary" @click="saveMoveOrderBtn" icon="md-checkmark" class="mr10"
          v-if="$store.state.adjustDetailTableShow === 'noCheck'"
          :disabled="!getPermission('wmsInventoryMove_save')">保存</Button>
      </Tooltip>
      <Button @click="backLists">取消</Button>
    </div>

    <div class="pt10">
      <div class="line-title">
        <h3>基本信息</h3>
      </div>
      <div class="formDetail">
        <Form :model="pageParams" :label-width="90" label-position="right" inline class="formWidth200">
          <Form-item label="移动单号：">
            <span>{{ curObj.inventoryMoveNo }}</span>
          </Form-item>
          <Form-item label="状态：">
            <!--<span style="color:green;" v-if="showStatus.moveStatus==='0'">待审核</span>-->
            <span style="color:green;" v-if="showStatus.moveStatus === '1'">已创建</span>
            <span style="color:green;" v-if="showStatus.moveStatus === '2'">已完成</span>
          </Form-item>
          <Form-item label="选择仓库：">
            <span>{{ curObj.warehouseName }}</span>
          </Form-item>
          <div class="autoLong">
            <FormItem label="备注：">
              <Input type="textarea" :rows="4" style="width: 400px;" placeholder="填写备注" v-model.trim="pageParams.remarks"
                :disabled="$store.state.adjustDetailTableShow === 'isChecked'"></Input>
            </FormItem>
          </div>
        </Form>
      </div>
      <div class="dispalyFlex alignCenter mb10">
        <div class="line-title mr20">
          <h3>明细信息</h3>
        </div>
        <Alert class="alert_inlineBlock">
          温馨提示：1、创建入库单时，仓库和入库单类型为必选项！2、创建入库单时，请先添加货品！
        </Alert>
      </div>
      <!-- 添加货品和删除货品按钮 -->
      <div v-show="isShowBtn">
        <Button type="primary" icon="md-add" @click="showAddProductModal" class="mr10">添加货品</Button>
        <Button type="error" icon="md-trash"
          @click="deleteProductBtn(selectMoveTable, allSelectMoveTableList)">移除货品</Button>
      </div>
      <div class="mt10" v-if="$store.state.adjustDetailTableShow === 'noCheck'">
        <!--表格-->
        <Table highlight-row border :columns="columns6" :data="stockData" v-if="stockTableStatus" :loading="TableLoading"
          ref="selection" @on-selection-change="selectItem" @on-select-all="allSelectMoveBtn"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
              :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 已审核表格 -->
      <div class="mt10" v-if="$store.state.adjustDetailTableShow === 'isChecked'">
        <!--表格-->
        <Table highlight-row border :loading="TableLoading" :columns="columns7" :data="data7"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
              :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 库位选择模态框 -->
      <Modal v-model="showLocationModal" :styles="{ top: '80px', width: '1000px' }" title="库位选择" class="headerBar">
        <div class="content">水电费水电费
          <selectWareLocate @sendData="getData" :wareId="wareId" :clickIndex="clickIndex" :open="showLocationModal"
            :curTableSku="curTableSku" :curBatchNo="curBatchNo" v-if="showLocationModal"></selectWareLocate>
        </div>
        <div slot="footer"></div>
      </Modal>
    </div>
  </dyt-model>
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import selectWareLocate from './selectWareLocate';
const pageParams = {
  warehouseId: '', // 选择仓库
  remarks: '', // 填写备注
  pageNum: 1,
  pageSize: 10
}
const defaultData = {
  stockTableStatus: true,
  isShowSelect: true, // 选择收货仓库默认显示
  isShowBtn: true, // 添加货品和删除货品按钮默认显示
  isShow: true, // 保存按钮默认显示
  isShowCheck: true, // 审核通过默认显示
  isMoveShow: false, // 执行移动单按钮隐藏
  clickIndex: null, // 当前行的下标
  curTableSku: null, // 当前行的SKU
  curBatchNo: null, // 批次号
  totalRecords: 0, // 总条数
  wareId: '', // 选择的仓库id
  userSelectTable: [], // 用户选择的表格数组集合
  wareHouseTypeList: [], // 仓库选择列表
  addProductModal: false, // 新增货品模态框
  moveProductModalTitle: '选择移动的产品',
  stockData: [],
  data7: [],
  selectMoveTable: [], // 勾选删除
  allSelectMoveTableList: [], // 全选删除
  showStatus: {}, // 移动单状态
  changeMoveNumList: [],
  deleteMoveList: [], // 删除哪一行的集合。传给后台的删除数据
  showLocationModal: false, // 库位模态框
}
export default {
  mixins: [Mixin],
  components: { selectWareLocate },
  data() {
    var self = this;
    return {
      modalVisible: false,
      pageLoading: false,
      pageParams: self.$common.copy(pageParams),
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
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
          title: 'FROM库位',
          key: 'fromWarehouseLocationName',
          align: 'center'
        }, {
          title: 'FROM可用库存',
          key: 'fromInventoryNumber',
          align: 'center'
        }, {
          title: 'FROM不良品数量',
          key: 'fromDefectiveNumber',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.fromDefectiveNumber || 0);
          }
        }, {
          title: 'TO库位',
          key: 'toWarehouseLocationName',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.toWarehouseLocationName
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-focus': () => {
                    self.showLocationModal = true;
                    self.wareId = self.curObj.warehouseId; // 传仓库id
                    self.clickIndex = params.index;
                    self.curTableSku = params.row.goodsSku; // 传SKU
                    self.curBatchNo = params.row.receiptBatchNo; // 批次号
                  }
                }
              })
            ]);
          }
        }, {
          title: '移动数量',
          key: 'moveInventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  min: 0,
                  max: params.row.fromInventoryNumber + params.row.fromDefectiveNumber,
                  value: params.row.moveInventoryNumber
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    self.stockData[params.index] = params.row;
                    params.row.moveInventoryNumber = value;
                    self.changeMoveNumList.push(self.stockData[params.index]);
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                confirm: true,
                title: '您确定要删除这条数据吗？确认删除之后记得点击保存按钮！',
                transfer: true
              },
              on: {
                'on-ok': () => {
                  this.removeProduct(params.index, this.stockData[params.index].inventoryMoveDetailId);
                }
              }
            }, [
              h('Button', {
                style: {
                  margin: '0 5px'
                },
                props: {
                  type: 'error',
                  placement: 'top'
                }
              }, '删除')
            ]);
          }
        }
      ],
      columns7: [
        {
          title: '图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
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
          title: 'FROM库位',
          key: 'fromWarehouseLocationName',
          align: 'center'
        }, {
          title: 'FROM可用库存',
          key: 'fromInventoryNumber',
          align: 'center'
        }, {
          title: 'FROM不良品数量',
          key: 'fromDefectiveNumber',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.fromDefectiveNumber || 0);
          }
        }, {
          title: 'TO库位',
          key: 'toWarehouseLocationName',
          align: 'center'
        }, // {
        //   title: 'TO可用库位',
        //   key: 'toInventoryNumber',
        //   align: 'center'
        // },
        {
          title: '移动数量',
          key: 'moveInventoryNumber',
          align: 'center'
        }
      ],
      ...self.$common.copy(defaultData),
    };
  },
  props: {
    curObj: {
      default: null
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    '$store.state.adjustDetailWatchFlag': function (val) {
      if (val) {
        if (this.curObj.moveSkuNum === 0) {
          this.isShow = false;
          this.isShowCheck = false;
          this.pageParams.remarks = this.curObj.remark;
        } else {
          this.isShow = true;
          this.isShowCheck = true;
          this.pageParams.remarks = this.curObj.remark;
        }
      }
    },
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true,
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit("update:dialogVisible", nval);
      },
      deep: true,
    },
  },
  methods: {
    open() {
      this.reset();
      this.$nextTick(() => {
        this.searchData();
        this.modalVisible = true;
      })
    },
    reset() {
      this.pageParams = this.$common.copy(pageParams);
      Object.keys(defaultData).forEach(key => {
        this[key] = this.$common.copy(defaultData[key]);
      })
    },
    backLists() {
      this.$store.commit('adjustDetailWatchFlag', false);
      this.$emit('searchData');
      this.modalVisible = false;
    },
    // backPage() {
    //   // 返回列表按钮
    //   this.$store.commit('moveOrderShow', 'move');
    //   this.$store.commit('adjustDetailWatchFlag', false);
    // },
    searchData() {
      // 页面查询
      var v = this;
      var obj = {
        inventoryMoveNo: v.curObj.inventoryMoveNo,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.TableLoading = true;
      v.axios.post(api.get_moveDetailData, obj).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          if (res.data.datas.wmsInventoryMoveDetailResultPage !== null) {
            v.stockData = res.data.datas.wmsInventoryMoveDetailResultPage.list;
            v.data7 = res.data.datas.wmsInventoryMoveDetailResultPage.list;
            v.showStatus = res.data.datas; // 移动单状态
            v.totalRecords = res.data.datas.wmsInventoryMoveDetailResultPage.total; // 总条数
          } else {
            v.stockData = [];
            v.data7 = [];
            v.totalRecords = 0;
          }
          if (this.showStatus.moveStatus === '2') {
            this.isShow = false;
            this.isShowCheck = false;
            this.isShowBtn = false;
            this.$store.commit('adjustDetailTableShow', 'isChecked');
          } else if (this.showStatus.moveStatus === '1') {
            this.isShow = false;
            this.isShowCheck = false;
            this.isMoveShow = true;
            this.isShowBtn = false;
            this.$store.commit('adjustDetailTableShow', 'noCheck');
          } else if (this.showStatus.moveStatus === '0') {
            this.$store.commit('adjustDetailTableShow', 'noCheck');
          }
        }
      });
    },
    changePage(page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    selectItem(data) {
      // 勾选当前行删除
      this.selectMoveTable = data;
    },
    allSelectMoveBtn(data) {
      // 全选删除
      this.allSelectMoveTableList = data;
    },
    moveValidFn() {
      // 库存移动校验
      let v = this;
      let valid = true;
      for (var i = 0; i < v.stockData.length; i++) {
        if (v.stockData[i].toWarehouseLocationName === '') {
          v.$Message.info({
            content: 'TO库位不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
        if (v.stockData[i].moveInventoryNumber === null) {
          v.$Message.info({
            content: '移动数量不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
        if (v.stockData[i].moveInventoryNumber <= 0) {
          v.$Message.info({
            content: '移动数量不能小于等于0',
            duration: 5
          });
          valid = false;
          return;
        }
        var re = v.$regular.NoDecima;
        if (re.test(v.stockData[i].moveInventoryNumber)) {
          v.$Message.info({
            content: '移动数量不能为小数',
            duration: 5
          });
          valid = false;
          return;
        }
        if (v.stockData[i].moveInventoryNumber > v.stockData[i].fromInventoryNumber + v.stockData[i].fromDefectiveNumber) {
          v.$Message.info({
            content: '移动数量不能大于当前产品的From可用库存 + from不良品数量',
            duration: 5
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    filterArrFn(arr) {
      // 数组去重
      return Array.from(new Set(arr));
    },
    filterDeleteArrFn(array) {
      // 去除重复的删除id
      var n = [];
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) === -1) {
          n.push(array[i]);
        }
      }
      return n;
    },
    moveDtlObj() {
      // 审核通过和保存参数
      let v = this;
      let newObj = {
        inventoryMoveNo: v.curObj.inventoryMoveNo,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        inventoryMoveDetailId: v.filterDeleteArrFn(v.deleteMoveList), // 删除行
        wmsInventoryMoveDetailList: v.stockData
      };
      return newObj;
    },
    checkPassBtn() {
      // 审核通过
      var v = this;
      var obj = this.moveDtlObj();
      if (this.moveValidFn()) {
        v.axios.post(api.auditMoveOrder, obj).then(res => {
          if (res.data.code === 0) {
            v.$Message.success('审核成功');
            v.$store.commit('adjustDetailTableShow', 'isChecked');
            v.isShow = false;
            v.isShowCheck = false;
            v.isMoveShow = true;
            v.isShowBtn = false;
            v.deleteMoveList = [];
            this.searchData();
          } else if (res.data.code === -6) {
            v.$Message.info({
              content: '实际库存有变化，移动数量不能大于From可用库存',
              duration: 4
            });
          }
        });
      }
    },
    saveMoveOrderBtn(flag) {
      // 修改保存按钮
      var v = this;
      return new Promise(resolve => {
        var obj = this.moveDtlObj();
        obj.inventoryMoveId = v.curObj.inventoryMoveId;
        if (this.moveValidFn()) {
          v.axios.post(api.saveMoveOrder, obj).then(res => {
            if (res.data.code === 0) {
              v.deleteMoveList = [];
              v.changeMoveNumList = [];
              resolve();
              if (flag === 'ignore') return;
              // this.searchData();
              if (v.stockData.length === 0) {
                this.isShow = false;
                this.isShowCheck = false;
                this.backLists();
              } else {
                this.searchData();
              }
              v.$Message.success('保存成功');
            }
          });
        }
      });
    },
    movePassBtn() {
      // 执行移动按钮
      var v = this;
      v.saveMoveOrderBtn('ignore').then(() => {
        var obj = {
          inventoryMoveNo: v.curObj.inventoryMoveNo
        };
        v.axios.post(api.performMoveOrder, obj).then(res => {
          if (res.data.code === 0) {
            if (res.data.others.datas) {
              // code 554131
              v.$Message.error('操作失败:库位正在盘点中(盘点单：' + res.data.others.datas + ')');
            } else {
              v.$Message.success('库存移动成功');
              this.$store.commit('adjustDetailTableShow', 'isChecked');
              this.isMoveShow = false;
              this.isShowBtn = false;
              this.searchData();
            }
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: '盘点中，暂时不能操作库存',
              duration: 4
            });
          } else if (res.data.code === -2) {
            v.$Message.info({
              content: '移动失败，实际库存有变化，移动数量不能大于From可用库存',
              duration: 4
            });
          } else if (res.data.code === -3) {
            v.$Message.info({
              content: '移动单已执行，不能重复执行',
              duration: 4
            });
          }
        });
      });
    },
    removeProduct(index, moveDetailId) {
      // 删除表格行
      var v = this;
      v.stockData.splice(index, 1);
      if (moveDetailId) {
        v.deleteMoveList.push(moveDetailId);
      }
      if (v.stockData.length === 0) {
        this.isShowCheck = false; // 审核按钮隐藏
      }
      v.$Message.success('成功删除当前行的货品');
      v.totalRecords = v.totalRecords - 1;
    },
    deleteProductBtn(selectMoveTable, allSelectMoveTableList) {
      // 批量删除
      let v = this;
      if (v.selectMoveTable.length === 0) {
        v.$Message.info('请勾选你要删除的货品');
        return;
      }
      let arr = [];
      v.stockData.forEach((obj, index) => {
        arr.push(obj);
      });
      arr.forEach((obj, index) => {
        selectMoveTable.forEach((item, j) => {
          if (obj.inventoryId === item.inventoryId) {
            v.stockData.splice(index, 1);
            v.selectMoveTable = [];
            v.allSelectMoveTableList = [];
            if (selectMoveTable[j].inventoryMoveDetailId) {
              v.deleteMoveList.push(selectMoveTable[j].inventoryMoveDetailId);
            }
            if (v.stockData.length === 0) {
              this.isShowCheck = false; // 审核按钮隐藏
            }
            v.totalRecords = v.totalRecords - v.selectMoveTable.length;
          }
        });
      });
      arr.forEach((obj, index) => {
        allSelectMoveTableList.forEach((item, j) => {
          if (obj.warehouseId === item.warehouseId || obj.receiptBatchNo === item.receiptBatchNo) {
            v.stockData.splice(index, 1);
            v.selectMoveTable = [];
            v.allSelectMoveTableList = [];
            if (allSelectMoveTableList[j].inventoryMoveDetailId) {
              v.deleteMoveList.push(allSelectMoveTableList[j].inventoryMoveDetailId);
            }
            if (v.stockData.length === 0) {
              this.isShowCheck = false; // 审核按钮隐藏
            }
            v.totalRecords = 0;
          }
        });
      });
      v.$Message.success('成功删除选中的货品');
    },
    showAddProductModal() {
      // 添加产品模态框
      var v = this;
      v.wareId = v.curObj.warehouseId;
      v.addProductModal = true;
    },
    userSelectOk(data) {
      this.userSelectTable = data; // 用户选择的表格数据
      this.userSelectTable.forEach((item, i) => {
        item.fromWarehouseLocationId = item.warehouseLocationId; // From库位Id
        item.fromWarehouseLocationName = item.warehouseLocationName; // From库位
        item.fromInventoryNumber = item.availableNumber; // FROM可用库存
      });
    },
    addNewProduct() {
      // 保存添加产品
      var v = this;
      this.userSelectTable.forEach((n, i) => {
        n.toWarehouseLocationName = ''; // 初始化一个空值
        n.toInventoryNumber = '';
        n.moveInventoryNumber = null; // 移动数量
      });
      if (v.userSelectTable.length === 0) {
        v.addProductModal = true;
        this.$Message.info({
          content: '请勾选你要添加的货品',
          duration: 4
        });
        return;
      }
      v.addProductModal = false;
      v.$Message.success('成功添加移动的产品');
      v.stockData = v.stockData.concat(v.userSelectTable);
      v.totalRecords += v.userSelectTable.length;
      v.isShow = true; // 保存按钮显示
      v.isShowCheck = true; // 审核按钮显示
    },
    cancelButton() {
      // 模态框取消按钮
      var v = this;
      v.$Message.info('取消添加移动的货品');
      v.addProductModal = false;
    },
    getData(selectData) {
      // 获取库位名称和 ID
      let v = this;
      v.stockData.forEach((n, i) => {
        if (i === selectData.clickIndex) {
          if (n.fromWarehouseLocationId !== selectData.warehouseLocationId) {
            n.toWarehouseLocationName = selectData.warehouseLocationName; // 库位名称
            n.toWarehouseLocationId = selectData.warehouseLocationId; // 库位ID
            n.toInventoryNumber = selectData.toInventoryNumber; // TO可用库存
            v.stockTableStatus = false;
            v.$nextTick(function () {
              v.stockTableStatus = true;
            });
            v.$Message.success('选择库位成功');
            this.showLocationModal = false;
          } else if (n.fromWarehouseLocationId === selectData.warehouseLocationId) {
            v.$Message.info({
              content: 'From库位和To库位不能相同，请重新选择',
              duration: 4
            });
            this.showLocationModal = true;
          }
        }
      });
    }
  }
};
</script >
<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
