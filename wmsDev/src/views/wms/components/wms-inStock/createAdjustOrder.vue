<template >
  <div >
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom:10px;" >
      <Icon type="ios-arrow-back" ></Icon >
      <a @click="backPage" >返回列表</a >
    </div >
    <div class="dataSort grayBg" >
      <h3 >基本信息</h3 >
    </div >
    <div style="background-color: #fff;margin:0 10px 0 10px;padding:10px 0 0 10px;" >
      <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="90" :rules="ruleValidate" >
        <Row v-show="isShowNoAndStatus" >
          <Col span="5" >
            <Form-item label="调整单号：" >
              <span >{{ adjustOrderData.inventoryAdjustNo }}</span >
            </Form-item >
          </Col >
          <Col span="5" >
            <Form-item label="状态：" >
              <!-- 待审核 -->
              <span style="color:green;" v-if="showStatus.adjustStatus === '0'" >待审核</span >
              <!-- 待执行 -->
              <span style="color:green;" v-if="showStatus.adjustStatus === '1'" >待执行</span >
              <!-- 完成 -->
              <span style="color:green;" v-if="showStatus.adjustStatus === '2'" >已完成</span >
            </Form-item >
          </Col >
        </Row >
        <Row >
          <Col span="6" >
            <FormItem label="备注：" >
              <Input
                  type="textarea"
                  :autosize="{ minRows: 5, maxRows: 6 }"
                  placeholder="填写备注"
                  v-model.trim="pageParams.remarks"
                  :disabled="$store.state.adjustDetailTableShow === 'isChecked'" ></Input >
            </FormItem >
          </Col >
        </Row >
      </Form >
    </div >
    <div class="dataSort grayBg" >
      <h3 >明细信息</h3 >
    </div >
    <!-- 添加货品和删除货品按钮 -->
    <div class="addBinding" v-show="isShowBtn" >
      <Button type="primary" icon="md-add" @click="showAddProductModal" >添加货品</Button >
      <Button
          type="error"
          icon="md-trash"
          @click="deleteProductBtn(selectAdjustTable, allSelectAdjustTable)" >移除货品</Button >
    </div >
    <!-- 待审核表格 -->
    <div class="shopTable" v-if="$store.state.adjustDetailTableShow === 'noCheck'" >
      <!--表格-->
      <Table
          highlight-row
          border
          :columns="columns6"
          :data="data6"
          ref="selection"
          @on-selection-change="selectItem"
          @on-select-all="allSelectAdjustBtn" ></Table >
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
    </div >
    <!-- 已审核表格 -->
    <div class="shopTable" v-if="$store.state.adjustDetailTableShow === 'isChecked'" >
      <!--表格-->
      <Table highlight-row border :columns="columns7" :data="data7" ></Table >
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
    </div >
    <!-- 创建入库单和取消按钮 -->
    <div class="addBinding" style="margin-top:80px; text-align:center;" >
      <!-- 创建库存调整单 -->
      <Button
          type="primary"
          style="margin-right:50px;"
          @click="createAdjustOrderBtn"
          v-if="isCreateShow" >创建库存调整单</Button >
      <!-- 审核通过 -->
      <Button
          type="primary"
          style="margin-right:50px;"
          v-if="isShowCheck"
          @click="checkPassBtn"
          :disabled="!getPermission('wmsInventoryAdjust_modifyExamine')" >审核通过</Button >
      <!-- 执行调整单 -->
      <Button
          type="primary"
          style="margin-right:50px;"
          v-show="isAdjustShow"
          @click="adjustPassBtn"
          :loading="passLoading"
          :disabled="!getPermission('wmsInventoryAdjust_modifyImplement')" >执行调整单</Button >
      <!-- 保存 -->
      <Button
          type="primary"
          style="margin-right:50px;"
          @click="saveMoveOrderBtn"
          icon="md-checkmark"
          v-if="isShow"
          :disabled="!getPermission('wmsInventoryAdjust_modify')" >保存</Button >
      <!-- 返回上一页 -->
      <Button type="default" icon="md-close" @click="cancelcreateAdjustOrderBtn" >返回列表</Button >
    </div >
    <div class="addBinding" style="display:inline-block;" >
      <Affix :offset-bottom="10" >
        <Alert show-icon style="width:355px;" >
          <p >温馨提示：</p >
          <p >1、创建库存调整单之前，请先添加货品！</p >
          <p >2、在添加货品之前，请先选择仓库！</p >
          <p >3、修改表格数据之后，请记得点保存！</p >
          <p >4、审核通过后，不能再进行添加、删除、修改！</p >
        </Alert >
      </Affix >
    </div >
    <!-- 新建货品模态框 -->
    <div v-if="addNewProductModal" >
      <Modal
          v-model="addNewProductModal"
          :styles="{ top: '80px', width: '1500px' }"
          class="headerBar addProductBar"
          :title="adjustProductModalTitle" >
        <div class="content" >
          <addProduct
              :categoryOption="false"
              @addProductSuccess="addProductSuccess"
              @addProductCancel="addProductCancel"
              :wareId="wareId"
              :eliminateData="data6" ></addProduct >
        </div >
        <!--<div slot="footer">-->
        <!--<Button type="primary" @click="addNewProduct">确认添加货品</Button>-->
        <!--<Button @click="cancelButton">取消</Button>-->
        <!--</div>-->
      </Modal >
    </div >
  </div >
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import addProduct from './newAddProduct';

export default {
  mixins: [Mixin],
  components: {
    addProduct: addProduct
  },
  data () {
    var self = this;
    return {
      passLoading: false,
      isShowNoAndStatus: false, // 单号和状态隐藏
      isShowSelect: true, // 选择收货仓库默认显示
      isShowBtn: true, // 添加货品和删除货品按钮默认显示
      isCreateShow: true, // 创建库存调整单按钮默认显示
      isShow: false, // 保存按钮默认隐藏
      isShowCheck: false, // 审核通过按钮隐藏，现在不要审核操作了
      isAdjustShow: false, // 执行调整单按钮隐藏
      pageParams: {
        remarks: '', // 填写备注
        pageNum: 1,
        pageSize: 10
      },
      totalRecords: 0, // 总条数
      ruleValidate: {
        // warehouseId: [
        //  { required: true, message: '仓库不能为空，请选择仓库', trigger: 'change' }
        // ]
      },
      wareId: this.getWarehouseId(),
      userSelectTable: [], // 用户选择的表格数组集合
      wareHouseTypeList: [], // 仓库选择列表
      addNewProductModal: false, // 新增货品模态框
      adjustProductModalTitle: '选择调整的产品',
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片00',
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
          title: '库位',
          key: 'warehouseLocationName',
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
          title: '原库存数量',
          key: 'oriInventoryNumber',
          align: 'center'
        }, {
          title: '原不良品数量',
          key: 'oriDefectiveNumber',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.oriDefectiveNumber || 0);
          }
        }, {
          title: '原分配数量',
          key: 'oriAllottedNumber',
          align: 'center'
        }, {
          title: '原冻结数量',
          key: 'oriFrozenNumber',
          align: 'center'
        }, {
          title: '原可用数量',
          key: 'oriUsableNumber',
          align: 'center'
        }, {
          title: '待归库数量', // 待归库数量
          key: 'waitComeBackNumber',
          align: 'center'
        }, {
          title: '调整目标数量',
          key: 'adjustInventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small', // max: params.row.oriInventoryNumber,
                  min: 0,
                  value: params.row.adjustInventoryNumber
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    self.data6[params.index] = params.row;
                    params.row.adjustInventoryNumber = value;
                    if (self.showStatus.adjustStatus === '0') {
                      self.changeAdjustNumList.push(self.data6[params.index]);
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
                  this.removeProduct(params.index, this.data6[params.index].inventoryAdjustDetailId);
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
      data6: [], // 审核通过表格
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
          title: '库位',
          key: 'warehouseLocationName',
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
          title: '原库存数量',
          key: 'oriInventoryNumber',
          align: 'center'
        }, {
          title: '原分配数量',
          key: 'oriAllottedNumber',
          align: 'center'
        }, {
          title: '原冻结数量',
          key: 'oriFrozenNumber',
          align: 'center'
        }, {
          title: '原不良品数量',
          key: 'oriDefectiveNumber',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.oriDefectiveNumber || 0);
          }
        }, {
          title: '原可用数量',
          key: 'oriUsableNumber',
          align: 'center'
        }, {
          title: '待归库数量', // 待归库数量
          key: 'waitComeBackNumber',
          align: 'center'
        }, {
          title: '调整目标数量',
          key: 'adjustInventoryNumber',
          align: 'center'
        }
      ],
      data7: [],
      adjustOrderData: {},
      selectAdjustTable: [], // 勾选删除
      allSelectAdjustTable: [], // 全选删除
      deleteAdjustList: [], // 删除的表格数据
      changeAdjustNumList: [],
      showStatus: {} // 调整单状态
    };
  },
  created () {
    var v = this;
    // v.getWareHouseName(); // 调用仓库下拉列表
    v.fromStartPage();
  },
  methods: {
    addProductSuccess (data) {
      let v = this;
      data.forEach((item, i) => {
        item.oriAllottedNumber = item.allottedNumber === null ? 0 : item.allottedNumber; // 分配数量
        item.oriFrozenNumber = item.frozenNumber === null ? 0 : item.frozenNumber; // 冻结数量
        item.oriInventoryNumber = item.inventoryNumber; // 库存数量
        item.oriUsableNumber = item.availableNumber; // 可用数量
        item.adjustInventoryNumber = null; // 调整目标数量
        item.oriDefectiveNumber = item.defectiveNumber; // 原不良品数量
      });
      v.data6 = v.data6.concat(data); // 待执行
      if (v.data6[0].inventoryId) {
        v.data6 = v.repeatArrayObject(v.data6, 'inventoryId');
      } else {
        v.data6 = v.repeatArrayObject(v.data6, 'goodsId');
      }
      v.totalRecords = v.data6.length;
      if (v.showStatus.adjustStatus === '1' && v.data6.length !== 0) {
        v.isShow = true; // 保存按钮显示
        // v.isShowCheck = true; // 审核按钮显示
      }
      v.addNewProductModal = false;
    },
    addProductCancel () {
      this.addNewProductModal = false;
    },
    fromStartPage () {
      this.$store.commit('adjustDetailTableShow', 'noCheck');
    },
    backPage () {
      // 返回列表按钮
      this.$store.commit('adjustOrderShow', 'adjust');
    },
    selectItem (data) {
      // 选择表格数据
      this.selectAdjustTable = data;
    },
    allSelectAdjustBtn (data) {
      this.allSelectAdjustTable = data;
    },
    adjustValidFn () {
      // 创建库存调整校验
      let v = this;
      let valid = true;
      for (var i = 0; i < v.data6.length; i++) {
        if (v.data6[i].adjustInventoryNumber === null) {
          v.$Message.info({
            content: '调整目标数量不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
        if (v.data6[i].adjustInventoryNumber < 0) {
          v.$Message.info({
            content: '调整目标数量不能小于0',
            duration: 5
          });
          valid = false;
          return;
        }
        var re = v.$regular.AllNumber;
        if (!re.test(v.data6[i].adjustInventoryNumber)) {
          v.$Message.info({
            content: '调整目标数量不能为小数',
            duration: 5
          });
          valid = false;
          return;
        }
        let adjustAdd = Number(v.data6[i].oriAllottedNumber) + Number(v.data6[i].oriFrozenNumber + Number(v.data6[i].waitComeBackNumber)); // 分配数量+冻结数量+ 待归库数量
        if (v.data6[i].adjustInventoryNumber < adjustAdd) {
          v.$Message.info({
            content: '调整目标数量要大于原分配数量和原冻结数量和待归库数量之和',
            duration: 5
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    createAdjustOrderBtn () {
      // 创建库存调整单
      var v = this;
      if (this.data6.length === 0) {
        this.$Message.info({
          content: '创建之前，请添加货品',
          duration: 4
        });
        return;
      }
      var obj = {
        warehouseId: v.wareId,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        wmsInventoryAdjustDetail: v.data6
      };
      if (this.adjustValidFn()) {
        v.axios.post(api.createAdjustOrder, obj).then(res => {
          if (res.data.code === 0) {
            v.$Message.success('创建库存调整单成功');
            v.$store.commit('adjustOrderShow', 'adjust');
            v.isShowNoAndStatus = true;
            v.isCreateShow = false;
            v.isShow = true;
            // v.isShowCheck = true;
            v.isAdjustShow = true; // 创建成功就显示执行按钮
            v.isShowSelect = false;
            v.adjustOrderData = res.data.datas;
            this.searchData();
          } else {
            v.$Message.error('创建失败');
          }
        });
      }
    },
    searchData () {
      // 页面查询
      var v = this;
      var obj = {
        inventoryAdjustNo: v.adjustOrderData.inventoryAdjustNo,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.axios.post(api.get_adjustDetailData, obj).then(res => {
        if (res.data.code === 0) {
          v.data6 = res.data.datas.adjustList.list;
          v.data7 = res.data.datas.adjustList.list;
          v.showStatus = res.data.datas;
          v.totalRecords = res.data.datas.adjustList.total;
          v.data6.forEach((item, i) => {
            item.waitComeBackNumber = item.oriWaitComeBackNumber;
            item.changedNum = Number(item.oriInventoryNumber) - Number(item.adjustInventoryNumber); // 变化库存
            item.remainderNum = item.adjustInventoryNumber; // 剩余库存
            item.relatedBusinessNo = item.inventoryAdjustNo; // 相关业务编号
          });
        }
      });
    },
    changePage (page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    filterArrFn (arr) {
      // 数组去重
      return Array.from(new Set(arr));
    },
    filterDeleteArrFn (array) {
      // 去除重复的删除id
      var n = [];
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) === -1) {
          n.push(array[i]);
        }
      }
      return n;
    },
    adjustDtlObj () {
      // 审核通过和保存参数
      let v = this;
      let newObj = {
        adjustStatus: v.showStatus.adjustStatus,
        inventoryAdjustNo: v.adjustOrderData.inventoryAdjustNo,
        inventoryAdjustId: v.adjustOrderData.inventoryAdjustId,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        warehouseId: v.adjustOrderData.warehouseId,
        wmsInventoryAdjustDetail: v.filterArrFn(v.changeAdjustNumList),
        removeList: v.filterDeleteArrFn(v.deleteAdjustList)
      };
      return newObj;
    },
    checkPassBtn () {
      // 审核通过按钮
      var v = this;
      var obj = this.adjustDtlObj();
      if (this.adjustValidFn()) {
        v.axios.post(api.checkAdjustOrder, obj).then(res => {
          if (res.data.code === 0) {
            v.$store.commit('adjustDetailTableShow', 'isChecked');
            v.isShow = false;
            // v.isShowCheck = false;
            v.isAdjustShow = true;
            v.isShowBtn = false;
            v.deleteAdjustList = [];
            this.searchData();
            v.$Message.success('审核通过');
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: '调整数量不能小于分配数量和冻结数量两者相加之和(请检查输入数据或sku实际库存)',
              duration: 8
            });
          }
        });
      }
    },
    saveMoveOrderBtn () {
      // 保存按钮
      var v = this;
      var obj = this.adjustDtlObj();
      if (this.adjustValidFn()) {
        v.axios.post(api.modifyAdjustOrder, obj).then(res => {
          if (res.data.code === 0) {
            v.deleteAdjustList = [];
            v.changeAdjustNumList = [];
            if (v.data6.length === 0) {
              this.isShow = false;
              // this.isShowCheck = false;
            }
            this.searchData();
            v.$Message.success('保存成功');
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: '调整数量不能小于分配数量和冻结数量两者相加之和(请检查输入数据或sku实际库存)',
              duration: 8
            });
          }
        });
      }
    },
    adjustPassBtn () {
      // 执行调整按钮
      var v = this;
      if (v.adjustValidFn()) {
        v.axios.get(api.carryAdjustOrder + '?inventoryAdjustNo=' + v.adjustOrderData.inventoryAdjustNo).then(res => {
          if (res.data.code === 0) {
            this.passLoading = true;
            v.$store.commit('adjustDetailTableShow', 'isChecked');
            v.isAdjustShow = false;
            v.isShowBtn = false;
            v.isShow = false;
            v.$Message.success('执行调整成功');
            this.searchData();
          } else if (res.data.code === -999) {
            v.$Message.info({
              content: '该调整单正处于盘点状态，无法执行该操作',
              duration: 4
            });
          }
        });
      }
    },
    userSelectOk (data) {
      // 添加货品用户勾选的表格数据
      var v = this;
      v.userSelectTable = data;
      v.userSelectTable.forEach((item, i) => {
        item.oriAllottedNumber = item.allottedNumber === null ? 0 : item.allottedNumber; // 分配数量
        item.oriFrozenNumber = item.frozenNumber === null ? 0 : item.frozenNumber; // 冻结数量
        item.oriInventoryNumber = item.inventoryNumber; // 库存数量
        item.oriUsableNumber = item.availableNumber; // 可用数量
      });
    },
    cancelcreateAdjustOrderBtn () {
      // 取消创建库存移动单
      this.$store.commit('adjustOrderShow', 'adjust');
    },
    getWareHouseName () {
      // 获取仓库下拉列表
      var obj = {};
      this.axios.get(api.selectAdjustWareHouseName, obj).then(res => {
        if (res.data.code === 0) {
          this.wareHouseTypeList = res.data.datas;
        }
      });
    },
    changeWarehouseName (val) {
      // 改变仓库，清空当前所属仓库的表格数据
      var v = this;
      v.pageParams.warehouseId = val;
      for (var i = 0; i < v.data6.length; i++) {
        if (v.pageParams.warehouseId !== v.data6[i].warehouseId) {
          v.data6 = [];
          v.totalRecords = 0;
        }
      }
    },
    removeProduct (index, adjustDetailId) {
      // 删除当前表格行
      var v = this;
      v.data6.splice(index, 1);
      if (adjustDetailId) {
        v.deleteAdjustList.push(adjustDetailId);
      }
      if (v.data6.length === 0) {
        // this.isShowCheck = false; // 审核按钮隐藏
      }
      v.$Message.success('成功删除当前行的货品');
      v.totalRecords = v.totalRecords - 1;
    },
    deleteProductBtn (selectAdjustTable, allSelectAdjustTable) {
      // 批量删除表格行
      let v = this;
      if (v.selectAdjustTable.length === 0) {
        v.$Message.info('请勾选你要删除的货品');
        return;
      }
      let arr = [];
      v.data6.forEach((obj, index) => {
        arr.push(obj);
      });
      arr.forEach((obj, index) => {
        selectAdjustTable.forEach((item, j) => {
          if (obj.inventoryId === item.inventoryId) {
            v.data6.splice(index, 1);
            v.selectAdjustTable = [];
            v.allSelectAdjustTable = [];
            if (selectAdjustTable[j].inventoryAdjustDetailId) {
              v.deleteAdjustList.push(selectAdjustTable[j].inventoryAdjustDetailId);
            }
            if (v.data6.length === 0) {
              // this.isShowCheck = false; // 审核按钮隐藏
            }
            v.totalRecords = v.totalRecords - v.selectAdjustTable.length; // 删除表格行
          }
        });
      });
      arr.forEach((obj, index) => {
        allSelectAdjustTable.forEach((item, j) => {
          if (obj.warehouseId === item.warehouseId || obj.receiptBatchNo === item.receiptBatchNo) {
            v.data6.splice(index, 1);
            v.selectAdjustTable = [];
            v.allSelectAdjustTable = [];
            if (allSelectAdjustTable[j].inventoryAdjustDetailId) {
              v.deleteAdjustList.push(allSelectAdjustTable[j].inventoryAdjustDetailId);
            }
            if (v.data6.length === 0) {
              // this.isShowCheck = false; // 审核按钮隐藏
            }
            v.totalRecords = 0;
          }
        });
      });
      v.$Message.success('成功删除选中的货品');
    },
    showAddProductModal () {
      // 添加货品模态框
      var v = this;
      v.addNewProductModal = true;
    },
    addNewProduct () {
      // 确认添加产品按钮
      var v = this;
      v.userSelectTable.forEach((n, i) => {
        n.adjustInventoryNumber = null; // 调整目标数量
      });
      var obj = {};
      for (var i = 0; i < v.userSelectTable.length; i++) {
        obj[v.userSelectTable[i].inventoryId] = 1;
        for (var j = 0; j < v.data6.length; j++) {
          if (obj[v.data6[j].inventoryId]) {
            v.$Message.info({
              content: '创建入库单失败',
              duration: 3
            });
            v.addNewProductModal = true;
            return;
          }
        }
      }
      if (v.userSelectTable.length === 0) {
        v.addNewProductModal = true;
        this.$Message.info({
          content: '请勾选你要添加的货品',
          duration: 4
        });
        return;
      }
      v.addNewProductModal = false;
      v.$Message.success('成功添加调整的货品');
      v.data6 = v.data6.concat(v.userSelectTable); // 待执行
      v.totalRecords += v.userSelectTable.length;
      if (v.showStatus.adjustStatus === '1' && v.data6.length !== 0) {
        v.isShow = true; // 保存按钮显示
        // v.isShowCheck = true; // 审核按钮显示
      }
    },
    cancelButton () {
      // 模态框取消按钮
      var v = this;
      v.$Message.info('取消添加调整的产品');
      v.addNewProductModal = false;
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
