<template>
  <div class="pick" style="padding-left: 10px">
    <div v-if="workShow === 'list'">
      <div class="usersFilter">
        <div class="card-container">
          <div class="card-content platformParamsSelect">
            <Form ref="formItem" :model="formItem" :label-width="labelWidth">
              <dyt-filter>
                <FormItem label="拣货单编号：" prop="pickingGoodsNoList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="formItem.pickingGoodsNoList"
                    placeholder="多个请用逗号或回车分隔" />
                </FormItem>
                <FormItem label="出库单号：" prop="pickingNoList">
                  <dyt-input-tag :limit="1" type="textarea" v-model.trim="formItem.pickingNoList"
                    placeholder="多个请用逗号或回车分隔" />
                </FormItem>
                <Form-item label="创建时间" v-if="formItem.pickingGoodsStatus === '7'">
                  <Date-picker style="width: 100%" type="datetimerange" @on-clear="resetDate" transfer
                    @on-change="getDateValue" :clearable="clearAble" :options="dateOptions" format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <FormItem label="拣货单类型：">
                  <ButtonGroup>
                    <Button :type="v.check ? 'primary' : 'default'" v-for="(v, i) in pickListTypeList" :key="i"
                      @click="typeChange(v.value)">{{ v.txt }}</Button>
                  </ButtonGroup>
                </FormItem>
                <FormItem label="打印状态：">
                  <ButtonGroup>
                    <Button :type="v.check ? 'primary' : 'default'" v-for="(v, i) in printStatusList" :key="i"
                      @click="printStatusChange(v.value)">{{ v.txt }}</Button>
                  </ButtonGroup>
                </FormItem>
                <FormItem label="拣货单状态：" class="notplatformParamsSelect">
                  <ButtonGroup>
                    <Button :type="v.check ? 'primary' : 'default'" v-for="(v, i) in pickListStatusList" :key="i"
                      @click="statusChange(v.value)">{{ v.txt }}</Button>
                  </ButtonGroup>
                </FormItem>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
      <div class="shipping_method">
        <div class="option_btn" v-if="!upOrDown" @click="switchBtn">
          <Icon size="20" type="ios-arrow-forward" />
        </div>
        <shippingMethod :upOrDown="upOrDown" @switchOption="switchOption" @selectChange="selectChange"
          :showCheckbox="false" :treeData="treeData"></shippingMethod>
        <div class="content_table" :style="upOrDown ? 'width: 77%' : 'width: 100%'">
          <div class="sort-box">
            <!--工具-->
            <div class="clear fl">
              <div class="fr">
                <Dropdown @on-click="batchOption">
                  <Button icon="ios-copy-outline">批量操作
                    <Icon type="md-arrow-dropdown"></Icon>
                  </Button>
                  <DropdownMenu slot="list">
                    <DropdownItem name="0" v-if="getPermission('wmsPickingGoods_print')">打印拣货单
                    </DropdownItem>
                    <DropdownItem name="1" v-if="getPermission('wmsPickingGoods_modifyToPicking_batch')">标记为已拣货
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <!--排序-->
            <div class="fr">
              <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
              </dyt-sortBySelect>
            </div>
          </div>
          <!--表格-->
          <Table highlight-row border ref="selection" :height="tableHeight" :columns="columns" :loading="TableLoading"
            :data="data" @on-selection-change="tableChange"></Table>
          <!--分页-->
          <div class="pages">
            <Page :total="tableItemTotal" :current="formItem.pageNum" :page-size="formItem.pageSize" show-total show-sizer
              show-elevator style="margin-top: 10px; text-align: right;" @on-change="pageNumChange"
              @on-page-size-change="pageSizeChange" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </div>
    <div v-if="workShow === 'detail'">
      <pickListDtl :pickingGoodsNo="pickingGoodsNo" :pickingStatus="pickingStatus" where="sell" @goList="goList">
      </pickListDtl>
    </div>
  </div>
</template>
<script>
import dropDown from '@/views/wms/components/common/dropDownOpt';
import pickListDtl from './pickListDtl';
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
import printMixin from '@/components/mixin/print_mixin';
import shippingMethod from '@/components/common/shippingMethod';

export default {
  mixins: [common, printMixin],
  components: {
    dropDown,
    pickListDtl,
    shippingMethod
  },
  data() {
    var v = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
    return {
      treeData: [],
      payTimeArr: [start, end],
      clearAble: true,
      upOrDown: true,
      checkAllShip: false,
      indeterminateAll: false,
      workShow: 'list',
      tableItemTotal: 0,
      pickingGoodsNo: '', // 拣货单编号
      wareId: v.getWarehouseId(),
      formItem: {
        merchantCarrierId: null,
        merchantShippingMethodId: null,
        pickingNoList: [],
        createStartTime: null,
        createEndTime: null,
        pickingGoodsNoList: [],
        pickListStatus: null,
        pickListType: null,
        pickingGoodsStatus: '1',
        pickingGoodsUploadCarrierStatus: null,
        printStatus: null,
        logisticType: null,
        pageNum: 1,
        pageSize: 10,
        cacheClickVal: 'CT',
        orderSeq: 'DESC',
      },
      wareList: [],
      pickListStatusList: [
        /* {
         txt: '全部',
         check: true,
         value: null
         }, */
        {
          txt: '未拣货',
          check: true,
          value: '1'
        }, {
          txt: '部分拣货',
          check: false,
          value: '2'
        }, {
          txt: '等待分拣',
          check: false,
          value: '3'
        }, // 等待分拣
        {
          txt: '正在分拣',
          check: false,
          value: '4'
        }, // 正在分拣
        {
          txt: '等待复核',
          check: false,
          value: '5'
        }, // 等待复核
        {
          txt: '正在复核',
          check: false,
          value: '6'
        }, // 正在包装
        {
          txt: '已复核',
          check: false,
          value: '7'
        } // 已包装
      ],
      pickListTypeList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '单品',
          check: false,
          value: 'SS'
        }, {
          txt: '多品',
          check: false,
          value: 'MM'
        }
      ],
      logisticsStatusList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '下发成功',
          check: false,
          value: 3
        }, {
          txt: '下发失败',
          check: false,
          value: 4
        }
      ],
      printStatusList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '已打印',
          check: false,
          value: 1
        }, {
          txt: '未打印',
          check: false,
          value: 0
        }
      ],
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按拣货单状态",
          sortField: "WS",
          sortType: "DESC",
        },
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '拣货单编号',
          key: 'pickingGoodsNo',
          align: 'center',
          minWidth: 130,
          render: (h, params) => {
            if (v.getPermission('wmsPickingGoods_detail')) {
              return h('a', {
                on: {
                  click: () => {
                    v.pickingGoodsNo = params.row.pickingGoodsNo;
                    v.pickingStatus = params.row.packageGoodsStatus;
                    v.workShow = 'detail';
                  }
                },
                style: {
                  display: 'inline-block',
                  width: '100%',
                  height: '100%'
                }
              }, params.row.pickingGoodsNo);
            } else {
              return h('div', params.row.pickingGoodsNo);
            }
          }
        }, {
          title: '拣货单类型',
          key: 'type',
          width: 100,
          align: 'center'
        }, {
          title: '拣货状态',
          key: 'status',
          align: 'center',
          width: 90,
          render(h, params) {
            /*
             * packStatus：“2” 正在包装 不考虑 packageGoodsStatus 显示正在包装
             packStatus：“1” 已经包装 不考虑 packageGoodsStatus 显示已包装
             packStatus：“0” 等待包装 显示packageGoodsStatus 的状态
             packageGoodsStatus
             1未拣货，2部分拣货，3等待分拣，4正在分拣 */
            let str = params.row.printType === '0' ? '未选择' : params.row.printType === '1' ? '普通打印' : '见货出单';
            if (params.row.pickingGoodsStatus === '6' || params.row.pickingGoodsStatus === '7') {
              return h('div', {}, [h('p', params.row.status), h('p', str)]);
            } else {
              return h('div', params.row.status);
            }
          }
        }, {
          title: '打印状态',
          key: 'printStatus',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('div', params.row.printStatus === '0' ? '未打印' : '已打印');
          }
        }, {
          title: '物流渠道',
          key: 'shippingMethodResults',
          width: 150,
          align: 'center',
          render(h, params) {
            let shippingMethodResults = params.row.shippingMethodResults;
            if (shippingMethodResults && shippingMethodResults.length > 0) {
              if (shippingMethodResults.length > 3) {
                shippingMethodResults = shippingMethodResults.splice(0, 3, {
                  carrierName: '...'
                });
              }
              return h('div', {}, params.row.shippingMethodResults.map(i => {
                let text = '';
                if (i.shippingMethodName) {
                  text = i.carrierName + '>' + i.shippingMethodName;
                } else {
                  text = i.carrierName;
                }
                return h('p', text);
              }));
            }
          }
        }, {
          title: '拣货提醒',
          key: 'remark',
          width: 120,
          align: 'center'
        }, {
          title: '仓库',
          key: 'warehouseName',
          width: 100,
          align: 'center'
        }, {
          title: '出库单数',
          key: 'pickingNumber',
          align: 'center',
          width: 90
        }, {
          title: 'SKU数',
          key: 'goodsSkuNumber',
          align: 'center',
          width: 90
        }, {
          title: '货品数',
          key: 'goodsQuantityNumber',
          align: 'center',
          width: 90
        }, {
          title: '拣货完成时间',
          key: 'finishTime',
          width: 160,
          align: 'center'
        }, {
          title: '创建人',
          key: 'createdByName',
          width: 100,
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          width: 160,
          align: 'center'
        }, {
          title: '操作',
          key: 'op',
          fixed: 'right',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h(dropDown, {
              props: {
                dropList: [
                  {
                    code: '打印拣货单',
                    value: '1',
                    flagCode: ['1'],
                    status: this.getPermission('wmsPickingGoods_print') ? '1' : -1
                  }, {
                    code: '标记为已拣货',
                    value: '2',
                    flagCode: ['0'],
                    status: this.getPermission('wmsPickingGoods_modifyToPicking_single')
                      ? params.row.packageGoodsStatus
                      : -1
                  }, {
                    code: '删除',
                    value: '3',
                    flagCode: ['0'],
                    status: this.getPermission('wmsPickingGoods_remove') ? params.row.packageGoodsStatus : -1
                  }, {
                    code: '导出',
                    value: '4',
                    flagCode: ['0'],
                    status: this.getPermission('wmsPickingGoods_exportSkuNumber') ? params.row.packageGoodsStatus : -1
                  }
                ],
                styleData: { width: '110px' },
                txt: '操作',
                listenNormal: false
              },
              on: {
                nameValBack: val => {
                  if (val === '2') {
                    this.markHasPicked({
                      pickingGoodsNos: [params.row.pickingGoodsNo]
                    });
                  } else if (val === '3') {
                    // 删除
                    this.isDelModal(() => {
                      this.axios.post(api.delete_listPickNo + '?pickingGoodsNo=' + params.row.pickingGoodsNo + '&packageGoodsStatus=' + params.row.packageGoodsStatus).then(res => {
                        if (res.data.code === 0) {
                          this.data.splice(params.index, 1);
                        }
                      });
                    });
                  } else if (val === '1') {
                    let goto = this.$router.resolve({
                      path: '/printPickList',
                      query: {
                        warehouseId: this.getWarehouseId(),
                        data: params.row.pickingGoodsNo,
                        type: 'pickList',
                        where: 'sell'
                      }
                    });
                    window.open(goto.href, '_blank');
                  } else if (val === '4') {
                    v.exportSkuNumber(params.row.pickingGoodsId);
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: [],
      tableSltData: [],
      pickingStatus: '',
      batchPrintData: [],
      pickingGoodsNos: []
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(295);
    }
  },
  methods: {
    resetDate() {
      let v = this;
      v.formItem.createStartTime = null;
      v.formItem.createEndTime = null;
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] === null || value[1] === null) return false;
        v.formItem.createStartTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        v.formItem.createEndTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      }
    }, // 选中的邮寄方式
    selectChange(data) {
      if (data[0]._ISALL) {
        this.formItem.merchantCarrierId = null;
        this.formItem.merchantShippingMethodId = null;
        this.searchFn();
        return;
      }
      if (data[0].shippingMethodId) {
        this.formItem.merchantCarrierId = data[0].carrierId;
        this.formItem.merchantShippingMethodId = data[0].shippingMethodId;
        this.searchFn();
      }
    },
    getAllShipMethod() {
      let v = this;
      let obj = this.paramsFn();
      delete obj.pageSize;
      delete obj.pageNum;
      v.axios.post(api.get_queryCarriersForPickingGoodsList, obj).then(res => {
        if (res.data.code === 0 && res.data.datas && res.data.datas.length > 0) {
          let data = [
            {
              title: '全部',
              expand: true,
              _ISALL: true,
              children: res.data.datas.map(i => {
                i.title = i.carrierName;
                i.expand = true;
                if (i.shippingMethods) {
                  i.children = i.shippingMethods.map(j => {
                    j.carrierId = i.carrierId;
                    j.title = j.shippingMethodName;
                    return j;
                  });
                }
                return i;
              })
            }
          ];
          v.treeData = data;
        } else {
          v.treeData = [];
        }
      });
    },
    goList() {
      this.workShow = 'list';
    },
    initData() {
      // 仓库数据
      // this.axios.get(api.get_stockOutWareList).then(res => {
      //   if (res.data.code === 0) {
      //     this.wareList = res.data.datas;
      //   }
      // });
    },
    wareChange(value) {
      // 仓库选择
    },
    statusChange(value) {
      this.pickListStatusList.forEach(it => {
        it.check = value === it.value;
      });
      if (value === '7') {
        this.getDateValue(this.payTimeArr);
      } else {
        this.resetDate();
      }
      this.formItem.pickingGoodsStatus = value;
    },
    typeChange(value) {
      this.pickListTypeList.forEach(it => {
        it.check = value === it.value;
      });
      this.formItem.pickListType = value;
    },
    logisticsChange(value) {
      this.logisticsStatusList.forEach(it => {
        it.check = value === it.value;
      });
      this.formItem.pickingGoodsUploadCarrierStatus = value;
    },
    printStatusChange(value) {
      this.printStatusList.forEach(it => {
        it.check = value === it.value;
      });
      this.formItem.printStatus = value;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.formItem.orderSeq = type;
      this.formItem.cacheClickVal = feild;
      this.searchFn();
    },
    search() {
      if (this.formItem.pickingGoodsStatus === '7') { // 已包装
        if (this.formItem.createStartTime === null || this.formItem.createEndTime === null) {
          this.$Message.warning({
            content: '查询已包装的拣货单，创建时间不能为空！',
            duration: 4
          });
          return false;
        }
      }
      this.formItem.pageNum = 1;
      this.searchFn();
      this.getAllShipMethod();
    },
    paramsFn() {
      return {
        warehouseId: this.wareId,
        merchantCarrierId: this.formItem.merchantCarrierId,
        merchantShippingMethodId: this.formItem.merchantShippingMethodId,
        packageGoodsType: this.formItem.pickListType,
        pickingGoodsNoList: this.formItem.pickingGoodsNoList,
        pageNum: this.formItem.pageNum,
        pageSize: this.formItem.pageSize,
        orderSeq: this.formItem.orderSeq,
        pickingNoList: this.formItem.pickingNoList,
        orderBy: this.formItem.cacheClickVal,
        pickingGoodsStatus: this.formItem.pickingGoodsStatus,
        pickingGoodsUploadCarrierStatus: this.formItem.pickingGoodsUploadCarrierStatus,
        printStatus: this.formItem.printStatus,
        createStartTime: this.formItem.createStartTime,
        createEndTime: this.formItem.createEndTime,
        pickingType: 'S1'
      };
    },
    searchFn() {
      // 查询函数
      this.formItem.pageSize = this.getPageSizeCache();
      if (this.getPermission('wmsPickingGoods_list')) {
        let obj = this.paramsFn();
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.get_pickList, obj).then(res => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data = this.processResData(res.data.datas.list);
            this.tableItemTotal = res.data.datas.total;
          }
        });
      } else {
        this.gotoError(); // 无权限
      }
    },
    processResData(data) {
      // 中文匹配
      /*
       * packStatus：“2” 正在包装 不考虑 package_goods_status 显示正在包装
       packStatus：“1” 已经包装 不考虑 package_goods_status 显示已包装
       packStatus：“0” 等待包装 显示package_goods_status 的状态
       package_goods_status
       1未拣货，2部分拣货，3等待分拣，4正在分拣
       * */
      data.forEach(val => {
        val.type = val.packageGoodsType === 'SS' ? '单品' : val.packageGoodsType === 'SM'
          ? '单品'
          : val.packageGoodsType === 'MM' ? '多品' : '';
        if (val.packStatus === '2') {
          val.pickingGoodsStatus = '6';
        }
        if (val.packStatus === '1') {
          val.pickingGoodsStatus = '7';
        }
        val.status = val.pickingGoodsStatus === '1' ? '未拣货' : val.pickingGoodsStatus === '2'
          ? '部分拣货'
          : val.pickingGoodsStatus === '3'
            ? '等待分拣'
            : val.pickingGoodsStatus === '4'
              ? '正在分拣'
              : val.pickingGoodsStatus === '5'
                ? '等待复核'
                : val.pickingGoodsStatus === '6'
                  ? '正在复核'
                  : val.pickingGoodsStatus === '7' ? '已复核' : '';
        val.finishTime = val.finishTime ? this.$uDate.dealTime(val.finishTime) : '';
        val.createdTime = val.createdTime ? this.$uDate.dealTime(val.createdTime) : '';
      });
      return data;
    },
    markHasPicked(params) {
      // 标记为已发货
      this.axios.post(api.mark_hasPicked, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('标记成功');
          this.searchFn();
        }
      });
    },
    pageNumChange(page) {
      this.formItem.pageNum = page;
      this.searchFn();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.formItem.pageSize = size;
      this.searchFn();
    },
    tableChange(data) {
      this.tableSltData = data;
    },
    batchOption(val) {
      // 批量操作
      let v = this;
      if (this.tableSltData.length === 0) {
        this.$Message.warning({
          content: '请选择操作数据',
          duration: 3
        });
        return;
      }
      if (val === '1') {
        let arr = this.tableSltData.map(val => {
          return val.pickingGoodsNo;
        });
        this.markHasPicked({ pickingGoodsNos: arr });
      } else {
        // 批量打印拣货单
        let val = [];
        if (v.tableSltData.length > 0) {
          // console.log(v.tableSltData);
          v.tableSltData.forEach((n, i) => {
            val.push(n.pickingGoodsNo);
          });
        }
        v.pickingGoodsNos = val;
        let goto = this.$router.resolve({
          path: '/printPickListBatch',
          query: {
            warehouseId: this.getWarehouseId(),
            data: v.pickingGoodsNos.join(','),
            type: 'pickList',
            where: 'sell'
          }
        });
        window.open(goto.href, '_blank');
      }
    }, // 展开与收起邮寄方式
    switchBtn() {
      this.upOrDown = !this.upOrDown;
    },
    switchOption(val) {
      this.upOrDown = val;
    }, // 重置按钮
    reset() {
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      this.payTimeArr = [start, end];
      this.typeChange(null);
      this.printStatusChange(null);
      this.statusChange('1');
      this.$refs['formItem'].resetFields();
    }, // 导出单个sku
    exportSkuNumber(pickingGoodsId) {
      this.axios.get(api.get_exportSkuNumber + '?pickingGoodsId=' + pickingGoodsId).then(res => {
        if (res.data.code === 0) {
          if (res.data.datas) {
            window.open(this.$store.state.erpConfig.filenodeViewTargetUrl + res.data.datas);
            this.$Message.success('导出成功！');
          }
        }
      });
    }
  },
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        this.searchFn();
      }
    }
  },
  created() {
    this.initData();
    this.searchFn();
    this.getAllShipMethod();
  }
};
</script>

<style lang="less" scoped>
.shipping_method {
  width: 100%;
  position: relative;
  padding-top: 0px;
  display: flex;
  justify-content: space-around;

  .content_table {
    display: flex;
    flex-direction: column;
    padding: 0 10px 0 0;
    box-sizing: border-box;

    .sort-box {
      margin: 0px 0 15px 0;
    }
  }

  .option_btn {
    height: 50px;
    background-color: #2b85e4;
    color: #fff;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>
