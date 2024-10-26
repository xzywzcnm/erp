<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backLists" :pageLoading="pageLoading">
    <div slot="lefts">
      <Button type="primary" @click="createMoveOrderBtn" v-if="isCreateShow">创建库存移动单</Button>
      <Button type="primary" v-show="isMoveShow && !!stockData.length" @click="movePassBtn"
        :disabled="!getPermission('wmsInventoryMove_perform')" class="ml10">执行移动单</Button>
      <Button type="primary" @click="saveMoveOrderBtn" icon="md-checkmark" v-if="stockData.length !== 0 &&
        !isCreateShow && $store.state.adjustDetailTableShow === 'noCheck'"
        :disabled="!getPermission('wmsInventoryMove_save')" class="ml10">保存</Button>
      <Button @click="backLists" class="ml10">取消</Button>
    </div>
    <div class="">
      <div class="line-title">
        <h3>基本信息</h3>
      </div>
      <div class="pt10">
        <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="90" :rules="ruleMoveValidate">

          <Row v-show="isShowNoAndStatus">
            <Col span="5">
            <Form-item label="移动单号：">
              <span>{{ createSuccessData.inventoryMoveNo }}</span>
            </Form-item>
            </Col>
            <Col span="5">
            <Form-item label="状态：">
              <!--<span style="color:green;" v-if="showStatus.moveStatus==='0'">待审核</span>-->
              <span style="color:green;" v-if="showStatus.moveStatus === '1'">已创建</span>
              <span style="color:green;" v-if="showStatus.moveStatus === '2'">已完成</span>
            </Form-item>
            </Col>
          </Row>
          <Row>
            <Col span="6">
            <FormItem label="备注：">
              <Input type="textarea" :autosize="{ minRows: 5, maxRows: 6 }" placeholder="填写备注"
                v-model.trim="pageParams.remarks" :disabled="$store.state.adjustDetailTableShow === 'isChecked'"></Input>
            </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
      <div class="dispalyFlex alignCenter mb10">
        <div class="line-title mr20">
          <h3>明细信息</h3>
        </div>
        <Alert class="alert_inlineBlock">
          温馨提示：1、创建库存移动单之前，请先添加货品！2、在添加货品之前，请先选择仓库！3、修改表格数据之后，请记得点保存！4、审核通过后，不能再进行添加、删除、修改！
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
        <Table highlight-row border :columns="columns6" :data="stockData" v-if="stockTableStatus" ref="selection"
          @on-selection-change="selectItem" @on-select-all="allSelectMoveBtn"></Table>
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
        <Table highlight-row border :columns="columns7" :loading="TableLoading" :data="data7"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total
              :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 新建货品模态框 -->
      <div v-if="addProductModal">
        <Modal v-model="addProductModal" :title="moveProductModalTitle" :styles="{ top: '80px', width: '1500px' }"
          class="headerBar  addProductBar">
          <div class="content">
            <addProduct :ctrl="true" :categoryOption="false" @addProductSuccess="addProductSuccess"
              @addProductCancel="addProductCancel" :wareId="wareId" :eliminateData="stockData"></addProduct>
          </div>
          <div slot="footer">
            <Button type="primary" @click="confirmAddProduct">确认添加货品</Button>
            <Button @click="cancelButton">取消</Button>
          </div>
        </Modal>
      </div>
      <!-- 库位选择模态框 -->
      <div v-if="showLocationModal">
        <Modal v-model="showLocationModal" :styles="{ top: '80px', width: '1000px' }" title="库位选择" class="headerBar">
          <div class="content">
            <selectWareLocate @sendData="getData" :wareId="rowWareId" :clickIndex="clickIndex" :open="showLocationModal"
              :curTableSku="curTableSku" :curBatchNo="curBatchNo"></selectWareLocate>
          </div>
          <div slot="footer"></div>
        </Modal>
      </div>
    </div>
  </dyt-model>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import addProduct from './newAddProduct';
import selectWareLocate from './selectWareLocate';
const pageParams = {
  remarks: '', // 填写备注
  pageNum: 1,
  pageSize: 10
}
const defaultData = {
  pageLoading: false,
  stockTableStatus: true,
  isShowNoAndStatus: false, // 单号和状态隐藏
  isShowSelect: true, // 选择收货仓库默认显示
  isShowBtn: true, // 添加货品和删除货品按钮默认显示
  isCreateShow: true, // 创建库存移动单按钮默认显示
  isShow: false, // 保存按钮默认隐藏
  isShowCheck: false, // 审核通过默认隐藏
  isMoveShow: false, // 执行移动单按钮隐藏
  ruleMoveValidate: {},
  userSelectTable: [], // 用户选择的表格数组集合
  // wareHouseTypeList: [], // 仓库选择列表
  addProductModal: false, // 新增货品模态框
  moveProductModalTitle: '选择移动的产品',
  clickIndex: null, // 当前行的下标
  curTableSku: null, // 当前行的SKU
  curBatchNo: null, // 批次号
  rowWareId: '', // 选择的仓库id
  totalRecords: 0, // 总条数
  stockData: [],
  data7: [],
  selectMoveTable: [], // 勾选删除
  allSelectMoveTableList: [], // 全选删除
  createSuccessData: {},
  showStatus: {}, // 移动单状态
  changeMoveNumList: [],
  goMoveStatus: false,
  deleteMoveList: [] // 删除表格行数据
}
export default {
  mixins: [Mixin],
  components: {
    addProduct: addProduct,
    selectWareLocate: selectWareLocate
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    var self = this;
    return {
      modalVisible: false,
      showLocationModal: false,
      wareId: this.getWarehouseId(),
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
            // return h('span', params.row.defectiveNumber || 0);
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
                  max: params.row.fromInventoryNumber,
                  value: params.row.toWarehouseLocationName,
                  min: params.row.moveInventoryNumber
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-focus': () => {
                    self.showLocationModal = true;
                    self.rowWareId = self.wareId; // 传仓库id
                    self.clickIndex = params.index;
                    self.curTableSku = params.row.goodsSku; // 传SKU
                    self.curBatchNo = params.row.receiptBatchNo; // 批次号
                  }
                }
              })
            ]);
          }
        }, // {
        //   title: 'TO可用库存',
        //   key: 'toInventoryNumber',
        //   align: 'center'
        // },
        {
          title: '移动数量',
          key: 'moveInventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.moveInventoryNumber,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.moveInventoryNumber = value;
                    self.stockData[params.index] = params.row;
                    if (self.showStatus.moveStatus === '0') {
                      self.changeMoveNumList.push(self.stockData[params.index]);
                    }
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
            // return h('span', params.row.defectiveNumber || 0);
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
      pageParams: self.$common.copy(pageParams),
      ...self.$common.copy(defaultData),
    };
  },
  watch: {
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
        this.fromStartPage();
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
      this.$emit('searchData');
      this.modalVisible = false;
    },
    addProductSuccess(data) {
      let v = this;
      v.addProductModal = false;
      data.forEach((item, i) => {
        item.fromDefectiveNumber = item.defectiveNumber;
        item.fromWarehouseLocationId = item.warehouseLocationId; // From库位Id
        item.fromWarehouseLocationName = item.warehouseLocationName; // From库位
        item.fromInventoryNumber = item.availableNumber; // FROM可用库存
        item.toWarehouseLocationName = ''; // 初始化一个空值
        item.toInventoryNumber = '';
        item.moveInventoryNumber = null; // 移动数量
      });
      v.stockData = v.stockData.concat(data);
      if (v.stockData[0].inventoryId) {
        v.stockData = v.repeatArrayObject(v.stockData, 'inventoryId');
      } else {
        v.stockData = v.repeatArrayObject(v.stockData, 'goodsId');
      }
      v.totalRecords = v.stockData.length;
      if (v.showStatus.moveStatus === '0' && v.stockData.length !== 0) {
        v.isShow = true; // 保存按钮显示
        v.isShowCheck = true; // 审核按钮显示
      }
    },
    addProductCancel() {
      this.addProductModal = false;
    },
    fromStartPage() {
      this.$store.commit('adjustDetailTableShow', 'noCheck');
    },
    // backPage() {
    //   // 返回列表按钮
    //   this.$store.commit('moveOrderShow', 'move');
    // },
    // getWareHouseName() {
    //   // 获取仓库下拉列表
    //   var v = this;
    //   v.axios.post(api.selectMoveWareHouseName).then(res => {
    //     if (res.data.code === 0) {
    //       this.wareHouseTypeList = res.data.datas;
    //     }
    //   });
    // }, // 改变仓库，清空当前所属仓库的表格数据
    // changeWarehouseName (val) {
    //   var v = this;
    //   v.pageParams.warehouseId = val;
    //   for (var i = 0; i < v.stockData.length; i++) {
    //     if (v.pageParams.warehouseId !== v.stockData[i].warehouseId) {
    //       v.stockData = [];
    //       v.totalRecords = 0;
    //     }
    //   }
    // },
    selectItem(data) {
      // 勾选当前行删除
      this.selectMoveTable = data;
    },
    allSelectMoveBtn(data) {
      // 全选删除
      this.allSelectMoveTableList = data;
    },
    moveValidFn() {
      // 创建库存移动校验
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
    createMoveOrderBtn() {
      // 创建库存移动单
      let v = this;
      if (this.stockData.length === 0) {
        this.$Message.info({
          content: '创建之前，请先添加货品',
          duration: 4
        });
        return;
      }
      var obj = {
        warehouseId: v.wareId,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        createInventoryMoveDetailList: v.stockData
      };
      if (this.moveValidFn()) {
        v.axios.post(api.createMoveOrder, obj).then(res => {
          if (res.data.code === 0) {
            v.$Message.success('创建库存移动单成功');
            v.createSuccessData = res.data.datas;
            v.isShowNoAndStatus = true;
            v.isCreateShow = false;
            v.isShow = true;
            // v.isShowCheck = true;
            v.isMoveShow = true;
            v.isShowSelect = false;
            // v.userSelectTable = [];  //创建成功之后，将数组清空
            this.searchData();
          } else if (res.data.success === false) {
            // v.$Message.info({
            //   content: res.data.message,
            //   duration: 6
            // });
          }
        });
      }
    },
    searchData() {
      // 页面查询
      var v = this;
      var obj = {
        inventoryMoveNo: v.createSuccessData.inventoryMoveNo,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.TableLoading = true;
      v.axios.post(api.get_moveDetailData, obj).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          v.stockData = res.data.datas.wmsInventoryMoveDetailResultPage.list;
          v.data7 = res.data.datas.wmsInventoryMoveDetailResultPage.list;
          v.showStatus = res.data.datas; // 移动单状态
          v.totalRecords = res.data.datas.wmsInventoryMoveDetailResultPage.total; // 总条数
          if (['1', '2'].includes(v.showStatus.moveStatus)) {
            v.isShowBtn = false;
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
        inventoryMoveNo: v.createSuccessData.inventoryMoveNo,
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
            v.$store.commit('adjustDetailTableShow', 'isChecked');
            v.isShow = false;
            v.isShowCheck = false;
            v.isMoveShow = true;
            v.isShowBtn = false;
            v.$Message.success('审核成功');
            v.deleteMoveList = []; // 清空选中要删除的数据
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
    saveMoveOrderBtn() {
      // 修改保存按钮
      var v = this;
      return new Promise(resolve => {
        var obj = this.moveDtlObj();
        if (this.moveValidFn()) {
          v.axios.post(api.saveMoveOrder, obj).then(res => {
            if (res.data.code === 0) {
              v.deleteMoveList = []; // 清空选中要删除的数据
              v.changeMoveNumList = [];
              if (v.stockData.length === 0) {
                this.isShow = false;
                this.isShowCheck = false;
              }
              this.searchData();
              v.$Message.success('保存成功');
              resolve();
            }
          });
        }
      });
    },
    movePassBtn() {
      // 执行移动按钮
      var v = this;
      v.saveMoveOrderBtn().then(() => {
        var obj = {
          inventoryMoveNo: this.createSuccessData.inventoryMoveNo
        };
        v.axios.post(api.performMoveOrder, obj).then(res => {
          if (res.data.code === 0) {
            if (res.data.others.datas) {
              // code 554131
              v.$Message.error('操作失败:库位正在盘点中(盘点单：' + res.data.others.datas + ')');
            } else {
              v.$Message.success('库存移动成功');
              v.$store.commit('adjustDetailTableShow', 'isChecked');
              v.isMoveShow = false;
              v.isShowBtn = false;
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
    cancelcreateMoveOrderButton() {
      // 取消创建库存移动单
      this.$store.commit('moveOrderShow', 'move');
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
      // 添加货品模态框
      var v = this;
      v.addProductModal = true;
    },
    userSelectOk(data) {
      // 选择的表格数据
      this.userSelectTable = data;
      this.userSelectTable.forEach((item, i) => {
        item.fromWarehouseLocationId = item.warehouseLocationId; // From库位Id
        item.fromWarehouseLocationName = item.warehouseLocationName; // From库位
        item.fromInventoryNumber = item.availableNumber; // FROM可用库存
      });
    },
    confirmAddProduct() {
      // 保存添加产品
      var v = this;
      v.userSelectTable.forEach((n, i) => {
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
      if (v.showStatus.moveStatus === '0' && v.stockData.length !== 0) {
        v.isShow = true; // 保存按钮显示
        v.isShowCheck = true; // 审核按钮显示
      }
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
              duration: 3
            });
            this.showLocationModal = true;
          }
        }
      });
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
