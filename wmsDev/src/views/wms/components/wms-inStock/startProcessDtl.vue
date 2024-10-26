<template >
  <div >
    <div class="backList" >
      <Icon type="ios-arrow-back" ></Icon >
      <a href="javascript:;" style="margin-left: 5px" @click="back" >返回列表</a >
    </div >
    <!--加工单详情-->
    <div style="padding: 10px;text-align: center;font-size: 14px;font-weight: 600;background-color: #fff;" >
      <span >加工单详情：</span ><span >{{ detailObj.workingNo }}</span >
    </div >
    <!--表单数据-->
    <div style="background-color: #fff;margin-bottom: 20px" >
      <Form class="startForm" >
        <Row >
          <Col span="8" >
            <FormItem label="加工单编号：" >
              <span >{{ detailObj.workingNo }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="作业仓库：" >
              <span >{{ detailObj.warehouseName }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="加工单状态：" >
              <span >{{
                detailObj.workingStatus === '0'
                  ? '创建状态'
                  : detailObj.workingStatus === '1'
                  ? '部分分配'
                  : detailObj.workingStatus === '2'
                  ? '分配完成'
                  : detailObj.workingStatus === '3'
                  ? '加工完成'
                  : detailObj.workingStatus === '4'
                  ? '取消分配'
                  : ''
              }}</span >
            </FormItem >
          </Col >
        </Row >
        <Row >
          <Col span="8" >
            <FormItem label="材料费(不含物料) CNY：" >
              <span >{{ detailObj.materialFee }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="人工费 CNY：" >
              <span >{{ detailObj.laborFee }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="创建时间：" >
              <span >{{ detailObj.createdTime }}</span >
            </FormItem >
          </Col >
        </Row >
        <Row >
          <Col span="8" >
            <FormItem label="创建人：" >
              <span >{{ detailObj.createdUserName }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="最后修改时间：" >
              <span >{{ detailObj.updatedTime }}</span >
            </FormItem >
          </Col >
          <Col span="8" >
            <FormItem label="最后修改人：" >
              <span >{{ detailObj.updatedUserName }}</span >
            </FormItem >
          </Col >
        </Row >
      </Form >
    </div >
    <!--加工成品-->
    <Card dis-hover :bordered="false" class="baseInfo" >
      <div slot="title" >加工成品</div >
      <div class="clear" >
        <Form inline :label-width="120" style="width: 500px;margin-top: 20px" class="fl" >
          <FormItem label="SKU：" >
            <span >{{ detailObj.finishedProductGoodsSku }}</span >
          </FormItem >
          <FormItem label="商品中文名称：" >
            <span >{{ detailObj.goodsCnDesc }}</span >
          </FormItem >
          <FormItem label="商品英文名称：" >
            <span >{{ detailObj.goodsEnDesc }}</span >
          </FormItem >
          <br />
          <FormItem label="加工数量：" >
            <span >{{ detailObj.workingNumber }}</span >
          </FormItem >
          <FormItem label="选择成品入库库位：" v-if="proceessHasBeenDone !== '3'" >
            <Select
                v-model="positionId"
                filterable
                remote
                transfer
                placement="top"
                :remote-method="getWarehouseLocation"
                :loading="loading2"
                @click.native="getWarehouseLocation('')"
                placeholder="输入搜索词进行远程查询" > <Option
                v-for="item in $store.state.positionList"
                :value="item.warehouseLocationId"
                :key="item.warehouseLocationId"
                :label="item.warehouseLocationName" ></Option > </Select >
            <!--<Input @on-focus="locationModal = true" v-model="storagePosition"></Input>-->
          </FormItem >
          <FormItem label="入库库位：" v-if="proceessHasBeenDone === '3'" >
            <span >{{ detailObj.warehouseLocationName }}</span >
          </FormItem >
        </Form >
        <div >
          <img
              :src="$store.state.imgUrlPrefix + detailObj.goodsImgUrl"
              alt=""
              style="margin-top: 20px;max-width: 200px" />
        </div >
      </div >
    </Card >
    <!--工具栏-->
    <div class="clear" style="padding: 10px 0" >
      <div class="fr" v-if="proceessHasBeenDone !== '3'" >
        <Button
            type="primary"
            @click="assignInventory"
            style="margin-right: 10px;"
            :disabled="!getPermission('wmsWorking_selectAllocationArea')" >分配库存</Button >
        <Button
            type="primary"
            @click="cancelAssign"
            :disabled="!getPermission('wmsWorking_selectCancelAllocationArea')" >取消分配</Button >
      </div >
    </div >
    <!--出库单表格-->
    <!--<div>-->
    <Table :columns="columns1" :data="data1" @on-selection-change="sltTableItemFn" ></Table >
    <!--</div>-->
    <div class="fr pages" >
      <Page
          :total="stockTotal"
          show-total
          show-sizer
          show-elevator
          :current="pageParams.stockPageNum"
          :page-size="pageParams.stockPageSize"
          @on-change="stockChangePage"
          @on-page-size-change="stockChangePageSize"
          placement="top"
          :page-size-opts="pageArray" ></Page >
    </div >
    <!--分配列表-->
    <div style="font-size: 16px;padding: 15px 0" >
      <span >分配列表</span > <span v-if="assignListShow" @click="changeShow" ><Icon
        type="ios-arrow-up"
        style="font-size: 18px;cursor: pointer" ></Icon ></span > <span
        v-if="!assignListShow"
        @click="changeShow" ><Icon type="ios-arrow-down" style="font-size: 18px;cursor: pointer" ></Icon ></span >
    </div >
    <!--分配表格-->
    <div style="margin-bottom:25px;" v-if="assignListShow" >
      <Table highlight-row :columns="columns2" :data="data2" ></Table >

      <div style="height: 40px" >
        <div class="fr pages" >
          <Page
              :total="batchTotal"
              show-total
              show-sizer
              show-elevator
              :current="pageParams.batchPageNum"
              :page-size="pageParams.batchPageSize"
              @on-change="batchChangePage"
              @on-page-size-change="batchChangePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </div >
      </div >

      <div style="text-align: center;margin-top: 20px;margin-left: 80px" v-if="proceessHasBeenDone !== '3'" >
        <Button type="primary" @click="overProcess" :disabled="!getPermission('wmsWorking_finish')" >完成加工</Button >
      </div >
    </div >
    <!-- 操作日志 -->
    <optionDaily
        :operationLog="optionNoteData"
        @showNoteFunc="showNoteFunc"
        from="productProcess"
        :params="{ workingNo: detailObj.workingNo }"
        @addSuccessBack="addSuccessBack" ></optionDaily >
    <!--库位模态框-->
    <div v-if="locationModal" >
      <Modal class="location" v-model="locationModal" title="库位选择" >
        <wareLocateSlt
            @sendData="okSelectPosition"
            :wareId="wareId"
            :open="locationModal"
            :productId="detailObj.productGoodsId"
            type="fromGoodProcess" ></wareLocateSlt >
      </Modal >
    </div >
    <!--分配库位模态框-->
    <div v-if="showLocationModal" >
      <Modal v-model="showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }" class="headerBar" >
        <div class="content" >
          <wareLocateSlt
              @sendData="getData"
              :wareId="wareId"
              :sku="objSku"
              :open="showLocationModal"
              :productId="productId"
              type="fromGoodProcess" ></wareLocateSlt >
        </div >
        <div slot="footer" ></div >
      </Modal >
    </div >
  </div >
</template >

<script >
import api from '@/api/api';
import dropDown from '../wms-outWareManage/dropDownOpt';
import wareLocateSlt from '../wms-outWareManage/wareLocateSlt';
import common from '@/components/mixin/common_mixin';
import optionDaily from '@/views/wms/components/common/commonDaily';

export default {
  mixins: [common],
  props: ['apiParams'],
  components: {
    wareLocateSlt,
    optionDaily
  },
  data () {
    var v = this;
    return {
      loading2: false,
      proceessHasBeenDone: '',
      productId: '',
      storagePosition: '',
      clickIndex: 0,
      objSku: '',
      wareId: this.getWarehouseId(),
      locationModal: false,
      showLocationModal: false,
      sltTableItem: [],
      stockTotal: 0,
      batchTotal: 0,
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '行状态',
          align: 'center',
          key: 'workingDetailStatus',
          render: (h, params) => {
            return h('p', {}, params.row.workingDetailStatus === '0' ? '创建状态' : params.row.workingDetailStatus === '1'
                                                                                ? '部分分配'
                                                                                : params.row.workingDetailStatus === '2'
                                                                                  ? '分配完成'
                                                                                  : params.row.workingDetailStatus === '3'
                                                                                    ? '取消分配'
                                                                                    : '');
          }
        }, {
          title: '图片',
          key: 'b',
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsImgUrl');
          }
        }, {
          title: 'sku',
          align: 'center',
          key: 'sku'
        }, {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc'
        }, {
          title: '英文描述',
          align: 'center',
          key: 'goodsEnDesc'
        }, {
          title: '重量',
          align: 'center',
          key: 'goodsWeight'
        }, {
          title: '尺寸(长*宽*高)',
          align: 'center',
          key: 'doneDeliveredNumber',
          render: (h, params) => {
            return h('div', {}, [
              h('span', {}, params.row.goodsLength ? params.row.goodsLength : 0),
              h('span', {}, '*'),
              h('span', {}, params.row.goodsWidth ? params.row.goodsWidth : 0),
              h('span', {}, '*'),
              h('span', {}, params.row.goodsHeight ? params.row.goodsHeight : 0)
            ]);
          }
        }, {
          title: '需求数量',
          align: 'center',
          key: 'needNumber'
        }, {
          title: '已分配数量',
          align: 'center',
          key: 'doneAssignedNumber',
          render: (h, params) => {
            return h('div', {}, params.row.doneAssignedNumber || 0);
          }
        }, {
          title: '未分配数量',
          align: 'center',
          key: 'unassignedNumber'
        }, {
          title: '分配库位',
          align: 'center',
          key: 'warehouseLocationName',
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '',
                  value: v.data1[params.index].warehouseLocationName,
                  disabled: v.data1[params.index].workingDetailStatus === '2'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-focus': () => {
                    v.clickIndex = params.index;
                    v.objSku = params.row.productGoodsId;
                    v.showLocationModal = true;
                    v.productId = params.row.productGoodsId;
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          align: 'center',
          key: 'm',
          render: (h, params) => {
            return h(dropDown, {
              props: {
                dropList: [
                  {
                    code: '分配库存',
                    value: '1',
                    flagCode: ['0', '1', '3'],
                    status: this.getPermission('wmsWorking_selectAllocationArea') ? params.row.workingDetailStatus : -1
                  }, {
                    code: '取消分配',
                    value: '2',
                    flagCode: ['1', '2'],
                    status: this.getPermission('wmsWorking_selectCancelAllocationArea')
                            ? params.row.workingDetailStatus
                            : -1
                  }
                ],
                styleData: { width: '80px' },
                txt: '操作',
                type: 'small',
                listenNormal: false
              },
              style: {
                display: params.row.workingDetailStatus === '0' || params.row.workingDetailStatus === '1' || params.row.workingDetailStatus === '2' || params.row.workingDetailStatus === '3'
                         ? 'block'
                         : 'none'
              },
              on: {
                nameValBack: val => {
                  let obj = null;
                  if (val === '1') {
                    // 分配库存
                    obj = {
                      allocationAreaParams: [
                        {
                          inventoryId: params.row.inventoryId,
                          workingDetailId: params.row.workingDetailId
                        }
                      ],
                      warehouseId: this.wareId,
                      workingNo: this.detailObj.workingNo
                    };
                    if (!params.row.warehouseLocationId) {
                      this.$Message.warning({
                        content: '库位为空或者输入的库位不存在，请选择库位',
                        duration: 3
                      });
                      return;
                    }
                    this.assignFn(obj, params.index);
                  } else {
                    obj = {
                      workingDetailIds: [params.row.workingDetailId]
                    };
                    // 取消分配
                    this.cancelAssignFn(obj, params.index);
                  }
                }
              }
            }, []);
          }
        }
      ],
      data1: [],
      columns2: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        }, {
          title: '产品sku',
          align: 'center',
          key: 'goodsSku'
        }, {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc'
        }, {
          title: '英文描述',
          align: 'center',
          key: 'goodsEnDesc'
        }, {
          title: '分配批次',
          align: 'center',
          key: 'receiptBatchNo'
        }, {
          title: '分配库位',
          align: 'center',
          key: 'warehouseLocationName'
        }, {
          title: '分配数量',
          align: 'center',
          key: 'batchNumber'
        }, {
          title: '分配完成时间',
          align: 'center',
          key: 'createdTime',
          render: (h, params) => {
            return h('div', this.$uDate.dealTime(params.row.createdTime));
          }
        }, {
          title: '操作人',
          align: 'center',
          key: 'createdUserName'
        }
      ],
      data2: [],
      pageParams: {
        stockPageNum: 1,
        stockPageSize: 10,
        batchPageNum: 1,
        batchPageSize: 10
      },
      assignListShow: true,
      showNotes: true,
      addNotesInput: '',
      optionNoteData: [],
      cacheOptionNoteData: [],
      detailObj: '',
      blockId: '',
      positionId: '',
      fpData: []
    };
  },
  created () {
    this.initData();
    if (this.proceessHasBeenDone === '3') {
      this.columns1.pop();
      this.columns1.pop();
    }
  },
  methods: {
    getWarehouseLocation (query) {
      let v = this;
      return new Promise(resolve => {
        if (query !== '') {
          v.pageParams.wareLocate = '';
        }
        this.getPositionListNew({ query: query }).then((data) => {
          if (query !== '') {
            if (data.length === 0) {
              v.$Message.info('无相关匹配库位');
              return;
            }
            data.forEach(i => {
              if (i.warehouseLocationName === query) {
                v.pageParams.wareLocate = i.warehouseLocationId;
              }
            });
          }
          resolve();
        });
      });
    },
    showNoteFunc (bool) {
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter(val => {
          return val.logTypeDesc !== '10';
        });
      } else {
        this.getLog();
      }
    },
    addSuccessBack () {
      this.getLog();
    },
    overProcess () {
      if (!this.positionId) {
        this.$Message.warning('库位为空或者输入的库位不存在，请选择库位');
        return;
      }
      this.blockId = this.$store.state.positionList.filter(i => i.warehouseLocationId === this.positionId)[0].warehouseBlockId;
      let obj = {
        addWarehouseBlockId: this.blockId,
        addWarehouseId: this.wareId,
        addWarehouseLocationId: this.positionId,
        productGoodsId: this.detailObj.productGoodsId,
        workingGoodsNums: this.detailObj.workingNumber,
        workingId: this.detailObj.workingId,
        receiptBatchNo: this.detailObj.receiptBatchNo
      };
      this.axios.post(api.workingFinish, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success(res.data.message);
          this.axios.get(api.workingById + '?workingId=' + this.detailObj.workingId).then(res => {
            if (res.data.code === 0) {
              this.detailObj = this.processObjTime(res.data.datas, ['createdTime', 'updatedTime']);
              this.proceessHasBeenDone = this.detailObj.workingStatus;
              this.getGoodsList();
              this.getAssignList();
              this.getLog();
            }
          });
        }
      });
    },
    okSelectPosition (val1, val2, val3) {
      this.storagePosition = val1;
      this.locationModal = false;
      this.positionId = val2;
      this.blockId = val3;
    },
    back () {
      this.$parent.workShow = 'list';
      this.$parent.startProcess = false;
    },
    sltTableItemFn (data) {
      console.log(data);
      let pos = [];
      if (data) {
        data.forEach((n, i) => {
          pos.push({
            inventoryId: n.inventoryId,
            workingDetailId: n.workingDetailId
          });
        });
      }
      let obj = {
        allocationAreaParams: pos,
        warehouseId: this.wareId,
        workingNo: this.detailObj.workingNo
      };
      this.sltTableItem = data;
      this.fpData = obj;
    },
    cancelAssignValid () {
      // 批量取消的校验
      let valid = true;
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: '请选择要操作的数据',
          duration: 3
        });
        valid = false;
        return;
      }
      // 只有部分分配(1)和分配完成(2)才能取消
      let hasAssign = true;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (this.sltTableItem[i].workingDetailStatus !== '2' && this.sltTableItem[i].workingDetailStatus !== '1') {
          hasAssign = false;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: '只有部分分配和分配完成才能取消',
          duration: 3
        });
        valid = false;
        return;
      }
      return valid;
    },
    cancelAssign () {
      // 批量取消
      if (this.cancelAssignValid()) {
        //										this.sltTableItem.forEach(val => {
        //												val.warehouseId = this.wareId
        //										})
        let obj = this.sltTableItem.filter(val => {
          return (val.workingDetailStatus === '2' || val.workingDetailStatus === '1');
        });
        let obj2 = {
          workingDetailIds: obj.map(val => val.workingDetailId)
        };
        this.cancelAssignFn(obj2);
      }
    },
    assignInventoryValid () {
      // 批量分配前的校验
      let valid = true;
      // 勾选数据校验
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: '请选择要操作的数据',
          duration: 3
        });
        valid = false;
        return;
      }
      // 分配完成的订单不能再分配
      let hasAssign = true;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (this.sltTableItem[i].workingDetailStatus === '2') {
          hasAssign = false;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: '存在分配完成的订单',
          duration: 3
        });
        valid = false;
        return;
      }
      //* *********************
      // 判断是否填了库位信息
      var flag = true;
      this.sltTableItem.forEach(val => {
        if (!val.warehouseLocationName) {
          flag = false;
        }
      });
      if (!flag) {
        this.$Message.warning({
          content: '请填写库位',
          duration: 3
        });
        valid = false;
        return;
      }
      return valid;
    },
    assignInventory () {
      // 批量分配
      if (this.assignInventoryValid()) {
        // this.sltTableItem.forEach(val => {
        //   val.warehouseId = this.wareId;
        // });
        this.assignFn(this.fpData);
      }
    },
    assignFn (params, index) {
      // 分配函数
      this.axios.post(api.selectAllocationArea, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('分配成功');
          this.sltTableItem = [];
          this.refreshAssignList(index);
        }
      });
    },
    cancelAssignFn (params, index) {
      // 取消函数
      this.axios.post(api.selectCancelAllocationArea, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('取消成功');
          this.sltTableItem = [];
          this.refreshAssignList(index, 'cancel');
        }
      });
    },
    refreshAssignList (index, val) {
      // 更新分配列表
      var obj = {
        workingDetailPageNum: this.pageParams.stockPageNum,
        workingDetailPageSize: this.pageParams.stockPageSize, // 分配表格分页
        workingBatchPageNum: this.pageParams.batchPageNum,
        workingBatchPageSize: this.pageParams.batchPageSize,
        workingId: this.detailObj.workingId
      };
      this.axios.post(api.refreshWorking, obj).then(res => {
        if (res.data.code === 0) {
          if (index === undefined) {
            // 批量时更新所有
            let processData = res.data.datas.workingDetailPageList.list;
            processData.forEach(val => {
              // val.warehouseLocationName = '';
              val.warehouseLocationId = '';
              val.receiptBatchNo = '';
              val.inventoryId = '';
              val.availableNumber = '';
              val.pickingNo = this.pickingNo;
            });
            if (val === 'cancel') {
              val.warehouseLocationName = '';
            }
            this.data1 = processData;
          } else {
            // 单条更新单条
            let obj = {
              ...res.data.datas.workingDetailPageList.list[index]
            };
            // obj.warehouseLocationName = '';
            obj.warehouseLocationId = '';
            obj.receiptBatchNo = '';
            obj.inventoryId = '';
            obj.availableNumber = '';
            obj.pickingNo = this.pickingNo;
            if (val === 'cancel') {
              obj.warehouseLocationName = '';
            }
            this.data1.splice(index, 1, obj);
          }
          this.columns1 = [...this.columns1];
          this.data2 = res.data.datas.workingBatchPageList.list;
          this.optionNoteData = this.processTimeData(res.data.datas.workingLogList || [], 'updatedTime'); // 留言信息
          this.detailObj.updatedUserName = res.data.datas.workingResult.updatedUserName;
          this.detailObj.updatedTime = res.data.datas.workingResult.updatedTime;
          this.detailObj.workingStatusDesc = res.data.datas.workingResult.workingStatusDesc;
        }
      });
    },
    showNoteFn (bool) {
      // 过滤留言
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter(val => {
          return val.logTypeDesc !== '10';
        });
      } else {
        this.optionNoteData = this.cacheOptionNoteData;
      }
    },
    stockChangePage (page) {
      // 表格分页
      this.pageParams.stockPageNum = page;
      // this.searchData();
    },
    stockChangePageSize (size) {
      // 切页
      this.pageParams.stockPageSize = size;
      // this.searchData();
    },
    batchChangePage (page) {
      // 批次表格分页
      this.pageParams.batchPageNum = page;
      // this.searchData();
    },
    batchChangePageSize (size) {
      this.pageParams.batchPageSize = size;
      // this.searchData();
    },
    changeShow () {
      this.assignListShow = !this.assignListShow;
    },
    getGoodsList () {
      this.axios.post(api.workingDetail, {
        workingNo: this.detailObj.workingNo,
        warehouseId: this.wareId
      }).then(res => {
        if (res.data.code === 0) {
          this.data1 = res.data.datas.list;
        }
      });
    },
    getAssignList () {
      this.axios.post(api.workingBatch, { workingNo: this.detailObj.workingNo }).then(res => {
        if (res.data.code === 0) {
          this.data2 = res.data.datas.list;
        }
      });
    },
    initData () {
      this.axios.get(api.workingById + '?workingId=' + this.apiParams).then(res => {
        if (res.data.code === 0) {
          this.detailObj = this.processObjTime(res.data.datas, ['createdTime', 'updatedTime']);
          this.proceessHasBeenDone = this.detailObj.workingStatus;
          this.getGoodsList();
          this.getAssignList();
          this.getLog();
        }
      });
      // 获取商品列表
    },
    getLog () {
      this.axios.post(api.workingLog, { workingNo: this.detailObj.workingNo }).then(res => {
        if (res.data.code === 0) {
          this.optionNoteData = this.processTimeData(res.data.datas, 'updatedTime');
          this.cacheOptionNoteData = res.data.datas; // 更新缓存
          // this.addNotesInput = '';
        }
      });
    },
    getData (data) {
      let v = this;
      let row = JSON.parse(JSON.stringify(this.data1[this.clickIndex]));
      row.warehouseLocationName = data.warehouseLocationName;
      row.warehouseLocationId = data.warehouseLocationId;
      row.receiptBatchNo = data.receiptBatchNo;
      row.inventoryId = data.inventoryId;
      row.availableNumber = data.availableNumber;
      v.$set(v.data1, v.clickIndex, row);
      v.data1.forEach(i => {
        v.$nextTick(() => {
          v.$set(i, '_checked', true);
        });
      });
      v.sltTableItemFn(v.data1);
    }
  }
};
</script >

<style >
.startForm .ivu-form-item {
  margin-bottom: 0;
}

.startForm .ivu-form-item-label {
  font-size: 14px;
}

.startForm {
  padding-left: 20px;
}

.location .ivu-modal {
  width: 900px !important;
}

.location .ivu-form-item {
  margin-bottom: 10px;
}
</style >
