<style scoped >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
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
      <Form :model="pageParams" label-position="right" :label-width="90" >
        <Row >
          <Col span="5" >
            <Form-item label="调整单号：" >
              <span >{{ curObj.inventoryAdjustNo }}</span >
            </Form-item >
          </Col >
          <Col span="5" >
            <Form-item label="状态" >
              <!-- 待审核 -->
              <span style="color:green;" v-if="showStatus.adjustStatus === '0'" >待审核</span >
              <!-- 待执行 -->
              <span style="color:green;" v-if="showStatus.adjustStatus === '1'" >待执行</span >
              <!-- 完成 -->
              <span
                  style="color:green;" v-if="showStatus.adjustStatus === '2'" >已完成</span >
            </Form-item >
          </Col >
        </Row >
        <Row >
          <Col span="5" >
            <Form-item label="选择仓库：" >
              <span >{{ curObj.warehouseName }}</span >
            </Form-item >
          </Col >
          <Col span="5" >
            <Form-item label="参考编号：" >
              <span >{{ curObj.referenceNo }}</span >
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
          :loading="TableLoading"
          ref="selection"
          @on-selection-change="selectAdjustBtn"
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
      <Table highlight-row border :loading="TableLoading" :columns="columns7" :data="data7" ></Table >
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
          v-if="isAdjustShow"
          @click="adjustPassBtn"
          :disabled="!getPermission('wmsInventoryAdjust_modifyImplement')" >执行调整单</Button >
      <Tooltip placement="top" content="若表格无数据，则保存后会删除该调整单！" >
        <!-- 保存 -->
        <Button
            type="primary"
            style="margin-right:50px;"
            @click="saveMoveOrderBtn"
            icon="md-checkmark"
            v-if="isShow"
            :disabled="!getPermission('wmsInventoryAdjust_modify')" >保存</Button >
      </Tooltip >
      <!-- 返回上一页 -->
      <Button type="default" icon="md-close" @click="backPageListBtn" >返回列表</Button >
    </div >
    <div class="addBinding" style="display:inline-block;" >
      <Affix :offset-bottom="10" >
        <Alert show-icon style="width:355px;" >
          <p >温馨提示：</p >
          <p >1、修改表格数据之后，请记得点保存！</p >
          <p >2、审核通过后，不能再进行添加、删除、修改！</p >
        </Alert >
      </Affix >
    </div >
    <!-- 新建货品模态框 -->
    <div v-if="addNewProductModal" >
      <Modal
          v-model="addNewProductModal"
          :styles="{ top: '80px', width: '1500px' }"
          class="headerBar"
          :title="adjustProductModalTitle" >
        <div class="content" >
          <addProduct
              :eliminateData="data6"
              @addProductSuccess="userSelectOk"
              @addProductCancel="addNewProductModal = false"
              :wareId="wareId" ></addProduct >
        </div >
        <!--<div slot="footer">
          <Button type="primary" @click="addNewProduct">确认添加货品</Button>
          <Button @click="cancelButton">取消</Button>
        </div>-->
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
    addProduct
  },
  data: function () {
    var self = this;
    return {
      pageParams: {
        warehouseId: '', // 选择仓库
        remarks: '', // 填写备注
        pageNum: 1,
        pageSize: 10
      },
      wareId: '', // 选择的仓库id
      isShowBtn: true,
      isShow: true, // 保存
      isShowCheck: false, // 审核通过按钮，，现在不要审核操作了
      isAdjustShow: false,
      userSelectTable: [], // 用户选择的表格数组集合
      wareHouseTypeList: [], // 仓库选择列表
      totalRecords: 0, // 总条数
      addNewProductModal: false, // 新增货品模态框
      adjustProductModalTitle: '选择调整的产品',
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
          key: 'oriWaitComeBackNumber',
          align: 'center'
        }, {
          title: '调整目标数量',
          key: 'adjustInventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  // max: params.row.oriInventoryNumber,
                  size: 'small',
                  min: 0,
                  value: params.row.adjustInventoryNumber ? params.row.adjustInventoryNumber : null
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    self.data6[params.index] = params.row;
                    params.row.adjustInventoryNumber = value;
                    // params.row.adjustInventoryNumber = val.target.value;
                    self.changeAdjustNumList.push(self.data6[params.index]);
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
          key: 'oriWaitComeBackNumber',
          align: 'center'
        }, {
          title: '调整目标数量',
          key: 'adjustInventoryNumber',
          align: 'center'
        }
      ],
      data7: [],
      showStatus: {}, // 调整单状态
      selectAdjustTable: [], // 勾选删除
      allSelectAdjustTable: [], // 全选删除
      changeAdjustNumList: [],
      deleteAdjustList: [] // 删除的表格数据
    };
  },
  props: {
    curObj: {
      default: null
    },
    openFlag: {
      // 打开模态框的标记
      default: null
    }
  },
  watch: {
    '$store.state.adjustDetailWatchFlag': function (val) {
      if (val) {
        if (this.curObj.adjustSkuNum === 0) {
          this.isShow = false;
          // this.isShowCheck = false;
          this.pageParams.remarks = this.curObj.remark;
        } else {
          this.isShow = true;
          // this.isShowCheck = true;
          this.pageParams.remarks = this.curObj.remark;
        }
      }
    }
  },
  created () {
    this.searchData();
  },
  methods: {
    backPage () {
      // 返回列表按钮
      this.$store.commit('adjustOrderShow', 'adjust');
      this.$store.commit('adjustDetailWatchFlag', false);
    },
    searchData () {
      // 页面查询
      var v = this;
      var obj = {
        inventoryAdjustNo: v.curObj.inventoryAdjustNo,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.TableLoading = true;
      v.axios.post(api.get_adjustDetailData, obj).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          if (res.data.datas.adjustList !== null) {
            v.data6 = res.data.datas.adjustList.list;
            v.data7 = res.data.datas.adjustList.list;
            v.showStatus = res.data.datas;
            v.totalRecords = res.data.datas.adjustList.total;
            v.data6.forEach((item, i) => {
              item.changedNum = Number(item.oriInventoryNumber) - Number(item.adjustInventoryNumber); // 变化库存
              item.remainderNum = item.adjustInventoryNumber; // 剩余库存
              item.relatedBusinessNo = item.inventoryAdjustNo; // 相关业务编号
            });
          } else {
            v.showStatus = res.data.datas;
          }
          if (this.showStatus.adjustStatus === '2') { // 完成执行
            this.isShow = false;
            // this.isShowCheck = false;
            this.isShowBtn = false;
            this.$store.commit('adjustDetailTableShow', 'isChecked');
          } else if (this.showStatus.adjustStatus === '1') { // 待执行
            this.isShow = true; // 待执行可修改保存数据
            // this.isShowCheck = false;
            this.isAdjustShow = true;
            this.isShowBtn = true; // 待执行可以修改数据
            this.$store.commit('adjustDetailTableShow', 'noCheck');
          } else if (this.showStatus.adjustStatus === '0') { // 审核
            this.isShowBtn = true;
            this.$store.commit('adjustDetailTableShow', 'noCheck');
          }
        }
      });
    },
    changePage (page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    selectAdjustBtn (data) {
      // 勾选当前行删除
      this.selectAdjustTable = data;
    },
    allSelectAdjustBtn (data) {
      // 全选删除
      this.allSelectAdjustTable = data;
    },
    backPageListBtn () {
      // 取消创建库存移动单
      this.$store.commit('adjustOrderShow', 'adjust');
      this.$store.commit('adjustDetailWatchFlag', false);
    },
    adjustValidFn () {
      // 库存调整校验
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
        let adjustAdd = Number(v.data6[i].oriAllottedNumber) + Number(v.data6[i].oriFrozenNumber + Number(v.data6[i].oriWaitComeBackNumber)); // 分配数量+冻结数量+待归库数量
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
        inventoryAdjustId: v.curObj.inventoryAdjustId,
        inventoryAdjustNo: v.curObj.inventoryAdjustNo,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        warehouseId: v.curObj.warehouseId,
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
    saveMoveOrderBtn (type) {
      // 保存修改库存调整单按钮
      var v = this;
      var obj = this.adjustDtlObj();
      if (this.adjustValidFn()) {
        return new Promise(resolve => {
          v.axios.post(api.modifyAdjustOrder, obj).then(res => {
            if (res.data.code === 0) {
              if (type === 'implement') {
                v.$Message.success('保存成功');
                resolve();
                return;
              }

              v.deleteAdjustList = [];
              v.changeAdjustNumList = [];
              if (v.data6.length === 0) {
                this.isShow = false;
                // this.isShowCheck = false;
              }
              v.$Message.success('保存成功');
              this.searchData();
            } else if (res.data.code === -1) {
              v.$Message.info({
                content: '调整数量不能小于分配数量和冻结数量两者相加之和(请检查输入数据或sku实际库存)',
                duration: 8
              });
            }
          });
        });
      }
    },
    adjustPassBtn () {
      // 执行调整按钮
      var v = this;
      v.saveMoveOrderBtn('implement').then(() => {
        v.axios.get(api.carryAdjustOrder + '?inventoryAdjustNo=' + v.curObj.inventoryAdjustNo).then(res => {
          if (res.data.code === 0) {
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
      });
    },
    removeProduct (index, adjustDetailId) {
      // 删除表格行
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
            v.totalRecords = v.totalRecords - v.selectAdjustTable.length;
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
      v.wareId = v.curObj.warehouseId;
      v.addNewProductModal = true;
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
      v.addNewProduct();
    },
    addNewProduct () {
      // 保存添加产品
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
      v.data6 = v.data6.concat(v.userSelectTable);
      v.totalRecords += v.userSelectTable.length;
      v.isShow = true; // 保存按钮显示
      // v.isShowCheck = true; // 审核按钮显示
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
