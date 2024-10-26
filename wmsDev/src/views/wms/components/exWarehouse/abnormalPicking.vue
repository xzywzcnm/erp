<template>
  <div>
    <div v-if="workShow === 'list'">
      <Tabs v-model="tabsValue">
        <TabPane label="拣货异常出库单" name="name1"></TabPane>
        <TabPane label="我的补拣任务列表" name="name2"></TabPane>
      </Tabs>
      <div v-if="tabsValue === 'name1'">
        <div class="usersFilter">
          <div class="card-container">
            <div class="card-content platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="110">
                <dyt-filter ref="dyt-filter">
                  <Form-item label="出库单号：">
                    <dyt-input placeholder="输入出库单号" v-model.trim="pageParams.searchSkuCode"> </dyt-input>
                  </Form-item>
                  <Form-item label="订单号：">
                    <dyt-input placeholder="输入订单号" v-model.trim="pageParams.orderNo"> </dyt-input>
                  </Form-item>
                  <Form-item label="出库单类型：">
                    <local-buttons :data="packTypeBtnData" :value.sync="pageParams.pickingType"></local-buttons>
                  </Form-item>
                  <Form-item label="库区组：">
                    <dyt-select v-model="pageParams.warehouseBlockGroupId">
                      <Option v-for="item in wareAreaGroupList" :value="item.warehouseBlockGroupId"
                        :key="item.warehouseBlockGroupId" :label="item.name"></Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="拣货库区：" prop="warehouseBlockId">
                    <!-- 联动 @on-open-change="wareBlockChange" -->
                    <dyt-select v-model="pageParams.warehouseBlockId">
                      <Option v-for="item in warehouseBlockList" :value="item.warehouseBlockId"
                        :label="item.warehouseBlockName" :key="item.warehouseBlockId">
                      </Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="拣货库位：" prop="warehouseLocationId" v-if="moreFilter">
                    <dyt-select v-model="pageParams.warehouseLocationId" remote :remote-method="getWarehouseLocation"
                      :loading="loading2" @click.native="getWarehouseLocation('')" placeholder="输入搜索词进行远程查询">
                      <Option v-for="item in warehouseLocationList" :value="item.warehouseLocationId"
                        :label="item.warehouseLocationName" :key="item.warehouseLocationId"></Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="已绑定异常处理库区：" :label-width="135">
                    <local-buttons :data="tabsData" :value.sync="pageParams.bindExceptionHandLocation"></local-buttons>
                  </Form-item>
                  <Form-item label="异常处理库区：">
                    <dyt-select v-model="pageParams.exceptionHandBlockId" @on-change="exceptChange">
                      <Option v-for="item in abnormalReservoirArea" :value="item.warehouseBlockId"
                        :label="item.warehouseBlockName" :key="item.warehouseBlockId"></Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="异常处理库位：">
                    <dyt-select v-model="pageParams.exceptionHandLocationId">
                      <Option v-for="item in abnormalReservoirLocation" :value="item.warehouseLocationId"
                        :label="item.warehouseLocationName" :key="item.warehouseLocationId"></Option>
                    </dyt-select>
                  </Form-item>
                  <FormItem label="SKU/数量" v-if="pageParams.pickingType === 'SS'">
                    <div style="display: flex;">
                      <dyt-input v-model="pageParams.sku" />*
                      <dyt-input v-model="pageParams.skuNumber" />
                    </div>
                  </FormItem>
                  <FormItem label="品牌" prop="productBrandIds" v-if="pageParams.pickingType === 'SS'">
                    <dyt-select v-model="pageParams.productBrandIds" :max-tag-count="1" multiple>
                      <Option v-for="(item, index) in productBrandList" :key="index"
                        :class="{ productBrandRed: item.status == 0 }" :label="item.name" :value="item.productBrandId">
                      </Option>
                    </dyt-select>
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

        <div class="actionBar" style="display: flex;">
          <div style="flex: 100;">
            <Dropdown class="ml10">
              <Button type="primary" @click="removeAbnormal('checkData')">
                移除异常标记
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="removeAbnormal('allData')">移除异常标记（所有结果集）</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button class="ml10" type="primary" v-if="getPermission('bindPackageExceptionHandLocation')"
              @click="openBindLocation">绑定异常处理库位 </Button>
            <Dropdown class="ml10" v-if="getPermission('supplementPicking_receiveSupplementPicking')">
              <Button type="primary" @click="receiveTask('batch')">
                领取补拣任务
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="receiveTask('all')">领取补拣任务（所有结果集）</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown class="ml10">
              <Button type="primary" @click="openAssignedUserModal('batch')">
                指派补拣任务
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="openAssignedUserModal('all')">指派补拣任务（所有结果集）</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button class="ml10" type="primary" v-if="getPermission('packageInfo_batchInvalidPackage')"
              @click="voidIssueDocFn">作废出库单 </Button>
          </div>
          <div class="dataSort grayBg" style="padding: 0; margin: 0; border: none;">
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
        <Table border highlight-row ref="selection" :height="tableHeight" :columns="columns" :loading="TableLoading"
          :data="data" @on-selection-change="tableChange"></Table>
        <!--分页-->
        <div class="fr pages">
          <Page :total="total" :current="pageParams.pageNum" :page-size="pageParams.pageSize" show-total show-sizer
            show-elevator style="margin-top: 10px" @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
      <div v-if="tabsValue === 'name2'">
        <pick-up-task></pick-up-task>
      </div>
    </div>
    <!--批量作废包裹-->
    <voidIssueDoc ref="voidIssueDoc" :packageIdList="packageIdList" @getList="search"></voidIssueDoc>
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="pickingNo" :workType="workType"></sellStockOutDtl>
    </div>
    <Modal v-model="modal" title="绑定异常处理库位">
      <Form ref="exceForm" :model="formExcep">
        <Form-item label="异常处理库位：" prop="exceptionHandLocationId" :rules="{
          required: true, message: '异常处理库位不能为空',
          trigger: 'change'
        }">
          <Select v-model="formExcep.exceptionHandLocationId">
            <Option v-for="item in abnormalLocations" :value="item.warehouseLocationId"
              :label="item.warehouseLocationName" :key="item.warehouseLocationId">{{ item.warehouseLocationName }}
            </Option>
          </Select>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="bindEcLocation">确定</Button>
        <Button @click="modal = false">取消</Button>
      </div>
    </Modal>
    <Modal v-model="modal1" title="指派补拣任务">
      <Form ref="assignForm" :model="formAssign">
        <Form-item label="指派补拣任务：" prop="assignedUserId" :rules="{
          required: true, message: '指派人不能为空',
          trigger: 'change'
        }">
          <Select v-model="formAssign.assignedUserId" filterable clearable>
            <Option v-for="item in $store.getters.userInfoList" :key="item.userId" :label="item.userName"
              :value="item.userId">{{ item.userName }} </Option>
          </Select>
        </Form-item>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="assignedUser">确定</Button>
        <Button @click="modal1 = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import voidIssueDoc from '@/views/wms/components/common/voidIssueDoc';
import sellStockOutDtl from '@/views/wms/components/exWarehouse/sellStockOutDtl';
import Button from '@/components/localComponents/d-Table/relation/button/button';
import pickUpTask from '@/views/wms/components/exWarehouse/pickUpTask';
import { getWarehouseId } from '@/utils/getService';

export default {
  name: 'abnormalPicking',
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      assignedType: '',
      loading2: false,
      modal: false,
      modal1: false,
      pickingNo: '',
      formExcep: {
        exceptionHandLocationId: ''
      },
      workShow: 'list',
      workType: 'sellStock',
      packageIdList: [],
      wareId: v.getWarehouseId(),
      warehouseBlockList: [], // 库区下拉列表
      abnormalReservoirArea: [],
      abnormalLocations: [],
      abnormalReservoirLocation: [],
      warehouseLocationList: [],
      packTypeBtnData: [
        {
          label: '全部',
          value: '',
          checked: true
        }, {
          label: '单品',
          value: 'SS',
          checked: false
        }, {
          label: '多品',
          value: 'MM',
          checked: false
        }, {
          label: '有发货提醒',
          value: 'WW',
          checked: false
        }
      ],
      TableLoading: false,
      wareAreaGroupList: [
        {
          name: '全部',
          warehouseBlockGroupId: 'null'
        }
      ],
      wareBlockNameList: [
        {
          warehouseBlockId: 'null',
          warehouseBlockName: '全部'
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'NO',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '出库单编号',
          key: 'pickingNo',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (v.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h('a', {
                on: {
                  click: () => {
                    v.pickingNo = params.row.pickingNo;
                    v.workShow = 'detail';
                  }
                }
              }, params.row.pickingNo);
            } else {
              return h('div', params.row.pickingNo);
            }
          }
        }, {
          title: '出库单类型',
          align: 'center',
          width: 100,
          key: 'packageType',
          render: (h, params) => {
            if (params.row.packageType === 'MS' || params.row.packageType === 'MM') {
              return h('div', '多品');
            } else if (params.row.packageType === 'SS' || params.row.packageType === 'SM') {
              return h('div', '单品');
            }
          }
        }, {
          title: '订单号',
          minWidth: 120,
          align: 'center',
          key: 'orderNos',
          render: (h, params) => {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                let n = params.row.packageOrderBoList[i];
                if (n.accountCode) {
                  pos.push(h('div', n.accountCode + '-' + n.salesRecordNumber));
                } else {
                  pos.push(h('div', n.salesRecordNumber));
                }
              }
              return h('div', pos);
            }
          }
        }, {
          title: '国家/地区',
          minWidth: 90,
          align: 'center',
          key: 'consigneeCountry'
        }, {
          title: 'SKU数量',
          minWidth: 90,
          align: 'center',
          key: 'goodsSkuNumber'
        }, {
          title: '物品数量/未拣数量',
          align: 'center',
          minWidth: 100,
          key: 'goodsQuantityNumber',
          render(h, params) {
            return h('div', params.row.goodsQuantityNumber + ' / ' + (params.row.goodsQuantityNumber - params.row.actualPickingNum));
          }
        }, {
          title: '物流方式',
          align: 'center',
          minWidth: 150,
          key: 'logisticsDealerName',
          render: (h, params) => {
            return h('div', params.row.logisticsDealerName + ' > ' + params.row.logisticsMailName);
          }
        }, {
          minWidth: 110,
          renderHeader(h, params) {
            return h('div', {}, [h('p', '异常处理库区'), h('p', '异常处理库位')]);
          },
          align: 'center',
          render(h, params) {
            let arr = params.row.exceptionHandBlockNames || [];
            let arr1 = params.row.exceptionHandLocationNames || [];
            return h('div', {}, [h('p', arr.join('、')), h('p', arr1.join('、'))]);
          }
        }, {
          title: '补拣次数',
          align: 'center',
          width: 90,
          key: 'pickingCount'
        }, {
          title: '拣货库区组',
          align: 'center',
          minWidth: 120,
          key: 'warehouseBlockGroupNames',
          render: (h, params) => {
            if (params.row.warehouseBlockGroupNames) {
              return h('div', params.row.warehouseBlockGroupNames.toString());
            }
          }
        }, {
          title: '拣货库区',
          align: 'center',
          minWidth: 120,
          key: 'warehouseBlockNames',
          render: (h, params) => {
            if (params.row.warehouseBlockNames) {
              return h('div', params.row.warehouseBlockNames.toString());
            }
          }
        }, {
          title: '拣货库位',
          align: 'center',
          minWidth: 120,
          key: 'warehouseLocationNames',
          render: (h, params) => {
            if (params.row.warehouseLocationNames) {
              return h('div', params.row.warehouseLocationNames.toString());
            }
          }
        }, {
          title: '创建时间',
          align: 'center',
          minWidth: 160,
          key: 'createdTime',
          render: (h, params) => {
            return h('span', v.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '操作',
          align: 'center'
        }, {
          title: '操作',
          key: 'h',
          fixed: 'right',
          align: 'center',
          minWidth: 220,
          render: (h, params) => {
            return h(compoundBtn, {
              props: {
                dropList: [
                  {
                    label: '查看出库单详情',
                    value: '1',
                    flagCode: ['0', '1'],
                    status: '0'
                  }
                ],
                title: '移除异常标记',
                listenNormal: false,
                btnType: '',
                icon: 'md-document'
              },
              on: {
                click: val => {
                  if (!val) {
                    v.removePicking({
                      packageIdList: [params.row.pickingId]
                    });
                  } else {
                    v.pickingNo = params.row.pickingNo;
                    v.workShow = 'detail';
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: [],
      total: 0,
      formAssign: {
        assignedUserId: ''
      },
      tabsValue: 'name1',
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: '',
        pickingType: '',
        searchSkuCode: '',
        warehouseBlockGroupId: '',
        exceptionHandBlockId: '',
        exceptionHandLocationId: '',
        warehouseBlockId: '',
        bindExceptionHandLocation: '',
        sku: null,
        skuNumber: null,
        warehouseLocationId: '',
        cacheClickVal: 'CT', // 排序缓存值
        orderSeq: 'DESC',
      },
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按物流方式",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      tableSltData: [],
      productBrandList: [],
      tabsData: [
        {
          label: '全部',
          value: ''
        }, {
          label: '是',
          value: '1'
        }, {
          label: '否',
          value: '0'
        }
      ]
    };
  },
  created() {
    this.getWareAreaGroup();
    this.getWarehouseAbBlock(); // 异常库区
    this.getWarehouseBlock();
    this.getProductBrandList();
    this.search();
    localStorage.setItem('userInfoList', JSON.stringify(this.$store.state.userInfoList));
  },
  components: {
    Button,
    compoundBtn,
    voidIssueDoc,
    sellStockOutDtl,
    pickUpTask
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(330);
    }
  },
  props: {},
  watch: {
    tabsValue: {
      handler(data) {
        if (data === 'name1') {
          this.reset();
          this.search();
        }
      }
    },
    'pageParams.pickingType': {
      deep: true,
      handler() {
        this.$refs['dyt-filter'] && this.$refs['dyt-filter'].init();
      }
    }
  },
  methods: {
    openAssignedUserModal(type) {
      if (this.tableSltData.length === 0 && type === 'batch') {
        this.$Message.info('未选择数据');
        return;
      } else {
        for (let i = 0; i < this.tableSltData.length; i++) {
          if (this.tableSltData[i].exceptionHandLocationNames === null) {
            this.$Message.error({
              content: '只有已绑定了异常处理库位的才允许指派补拣任务',
              duration: 4
            });
            return false;
          }
        }
      }
      this.modal1 = true;
      this.assignedType = type;
    },
    assignedUser() {
      /**
       * 指派补拣任务
       * type batch all
       * */
      let v = this;
      let type = this.assignedType;
      this.$refs.assignForm.validate((valid) => {
        if (valid) {
          let params = null;
          if (type === 'all') {
            params = v.paramsFn();
          } else {
            params = {
              packageIdList: v.tableSltData.map(i => i.pickingId)
            };
          }
          params.assignedUserId = v.formAssign.assignedUserId;
          v.axios.post(api.assignSupplementPicking, params).then(response => {
            if (response.data.code === 0) {
              v.modal1 = false;
              if (response.data.datas.supplementPickingNo) {
                v.$Modal.success({
                  title: '温馨提示',
                  content: '已指派补拣任务，补拣任务号：' + response.data.datas.supplementPickingNo
                });
              }
              v.search();
            }
          });
        }
      });
    },
    bindEcLocation() {
      // 绑定异常处理库位
      let v = this;
      v.$refs.exceForm.validate((valid) => {
        if (valid) {
          v.axios.post(api.bindPackageExceptionHandLocation, {
            'packageIdList': v.tableSltData.map(i => i.pickingId),
            'warehouseId': v.wareId,
            'warehouseLocationId': v.formExcep.exceptionHandLocationId
          }).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.modal = false;
              v.search();
            }
          });
        }
      });
    },
    receiveTask(type) {
      /**
       * 领取补拣任务
       * @params type batch 批量 和 all 所有结果集
       * */
      let v = this;
      let params = null;
      if (type === 'all') {
        params = v.paramsFn();
      } else {
        if (v.tableSltData.length === 0) {
          v.$Message.info('未选择数据');
          return;
        } else {
          for (let i = 0; i < v.tableSltData.length; i++) {
            if (v.tableSltData[i].exceptionHandLocationNames) {
              params = {
                packageIdList: v.tableSltData.map(i => i.pickingId)
              };
            } else {
              v.$Message.error({
                content: '只有已绑定了异常处理库位的才允许领取补拣任务',
                duration: 4
              });
              return false;
            }
          }
        }
      }
      v.axios.post(api.receiveSupplementPicking, params).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.supplementPickingNo) {
            this.$Modal.success({
              title: '温馨提示',
              content: '已领取补拣任务，补拣任务号：' + response.data.datas.supplementPickingNo
            });
          }
          v.search();
        }
      });
    },
    openBindLocation() {
      if (this.tableSltData.length === 0) {
        this.$Message.info('未选择数据');
        return;
      }
      this.modal = true;
      this.getWarehouseLocal('').then(response => {
        this.abnormalLocations = response;
      });
    },
    tableChange(data) {
      // 表格选择项变化
      this.tableSltData = data;
    },
    removeAbnormal(type) {
      if (type === 'checkData') {
        if (this.tableSltData.length === 0) {
          this.$Message.error('未选择数据');
          return;
        }
        let arr = this.tableSltData.map(i => {
          return i.pickingId;
        });
        this.removePicking({
          packageIdList: arr
        });
      } else if (type === 'allData') {
        let obj = this.paramsFn();
        this.removePicking(obj);
      }
    },
    voidIssueDocFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageIdList = v.tableSltData.map(i => i.pickingId);
      v.$refs.voidIssueDoc.modal = true;
    },
    getProductBrandList() { // 获取品牌列表(筛选下拉)
      var v = this;
      v.axios.get(api.getAll_productBrand).then(function (response) {
        if (response.data.code === 0) {
          v.productBrandList = response.data.datas;
        }
      });
    },
    removePicking(params) {
      let v = this;
      v.axios.put(api.removeExceptSalesPicking, params).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.search();
        }
      }).catch(() => {
      });
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.cacheClickVal = feild;
      this.search();
    },
    getWarehouseAbBlock() {
      /**
       * 获取异常库区
       * */
      let v = this;
      v.axios.get(api.get_warehouseBlock + '?warehouseId=' + v.wareId + '&warehouseBlockTypes=30').then(response => {
        if (response.data.code === 0) {
          v.abnormalReservoirArea = response.data.datas;
        }
      });
    },
    exceptChange(data) {
      this.getWarehouseLocal(data).then((reseponse) => {
        this.abnormalReservoirLocation = reseponse;
      });
    },
    getWarehouseLocal(data) {
      /**
       * 获取异常库位
       * */
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.queryByBlocksAndFlag + '?warehouseId=' + v.wareId + '&warehouseBlockIdList=' + data + '&pickingFlag=2').then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getWarehouseBlock() {
      // 获取库区下拉
      let v = this;
      v.axios.get(api.get_warehouseBlock + '?warehouseId=' + v.wareId + '&warehouseBlockGroupId=' + v.pageParams.warehouseBlockGroupId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseBlockList = data;
          }
        }
      });
    },
    getWareBlockName() {
      var v = this;
      var obj = {
        warehouseBlockStatus: null,
        warehouseBlockTypeList: null,
        warehouseId: v.getWarehouseId()
      };
      v.axios.post(api.wmsService + api.selectBlockType, obj).then(res => {
        if (res.data.code === 0) {
          // v.wareBlockNameList = res.data.datas;
          v.wareBlockNameList = [];
          let data = res.data.datas;
          let data1 = JSON.parse(JSON.stringify(res.data.datas));
          data1.forEach(i => {
            if (i.warehouseBlockType === '00') {
              i.warehouseBlockName = i.warehouseBlockName + '(收货区)';
            } else if (i.warehouseBlockType === '10') {
              i.warehouseBlockName = i.warehouseBlockName + '(标准区)';
            } else if (i.warehouseBlockType === '11') {
              i.warehouseBlockName = i.warehouseBlockName + '(良品区)';
            } else if (i.warehouseBlockType === '12') {
              i.warehouseBlockName = i.warehouseBlockName + '(不良品区)';
            }
          });
          v.wareBlockNameListEdit = data1.filter(item => item.warehouseBlockType !== '20');
          v.wareBlockNameList.push({
            warehouseBlockId: 'null',
            warehouseBlockName: '全部'
          });
          data.forEach((n, i) => {
            v.wareBlockNameList.push(n);
          });
        }
      });
    },
    getWarehouseLocation(query) {
      // 获取库位下拉数据
      let v = this;
      let warehouseBlockGroupId = v.pageParams.warehouseBlockGroupId || '';
      v.axios.get(api.get_warehouseLocation + '?warehouseId=' + v.wareId + '&warehouseBlockGroupId=' + warehouseBlockGroupId + '&warehouseBlockId=' + v.pageParams.warehouseBlockId + '&warehouseLocationName=' + query).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseLocationList = data;
          }
        }
      });
    },
    getWareAreaGroup() {
      // 获取库区组下拉
      let v = this;
      let pos = [];
      v.axios.get(api.get_wareAreaGroupList + '?warehouseId=' + getWarehouseId()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.wareAreaGroupData = data;
            data.forEach((n, i) => {
              pos.push(n);
            });
            pos.unshift({
              name: '全部',
              warehouseBlockGroupId: 'null'
            });
            v.wareAreaGroupList = pos;
          } else {
            v.wareAreaGroupData = [
              {
                name: '全部',
                warehouseBlockGroupId: 'null'
              }
            ];
          }
        }
      });
    },
    search() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    processData(listData) {
      listData.forEach(val => {
        val.type = val.pickingType === 'S1' ? '销售出库' : val.pickingType === 'O3' ? '其他出库' : val.pickingType === 'O1'
          ? '调拨出库'
          : val.pickingType === 'O2'
            ? '组装加工'
            : '';
        val.status = val.pickingStatus === '0' ? '订单创建' : val.pickingStatus === '1' ? '部分分配' : val.pickingStatus === '2'
          ? '分配完成'
          : val.pickingStatus === '3'
            ? '部分发货'
            : val.pickingStatus === '4'
              ? '完全发货'
              : val.pickingStatus === '5'
                ? '订单完成'
                : '';
        val.pickStatus = val.packageGoodsStatus === '0' ? '未拣货' : val.packageGoodsStatus === '1' ? '已拣货' : '';
      });
      return listData;
    },
    getPageSizeCache() {
      let value = localStorage.getItem(this.$route.path + 'PageSize');
      if (value && !isNaN(+value)) {
        return +value;
      } else {
        localStorage.removeItem(this.$route.path + 'PageSize');
        return 50;
      }
    },
    paramsFn() {
      let v = this;
      this.pageParams.pageSize = this.getPageSizeCache();
      let obj = {
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
        exceptionHandLocationId: v.pageParams.exceptionHandLocationId || null,
        exceptionHandBlockId: v.pageParams.exceptionHandBlockId || null,
        sku: v.pageParams.sku || null,
        skuNumber: v.pageParams.skuNumber ? Number(v.pageParams.skuNumber) : null,
        productBrandIds: v.pageParams.productBrandIds || null,
        warehouseId: [v.getWarehouseId()],
        pickingStatus: ['2'],
        orderBy: this.pageParams.cacheClickVal || null,
        orderSeq: this.pageParams.orderSeq,
        pickingNo: v.sepCommasFn(v.pageParams.searchSkuCode),
        orderNos: v.sepCommasFn(v.pageParams.orderNo),
        packageType: v.pageParams.pickingType ? [v.pageParams.pickingType] : null,
        warehouseBlockGroupId: v.pageParams.warehouseBlockGroupId || null,
        warehouseBlockId: v.pageParams.warehouseBlockId || null,
        warehouseLocationId: v.pageParams.warehouseLocationId || null,
        bindExceptionHandLocation: v.pageParams.bindExceptionHandLocation === ''
          ? null
          : Number(v.pageParams.bindExceptionHandLocation)
      };
      return obj;
    },
    getList() {
      this.tableSltData = [];
      if (this.pageParams.pickingType !== 'SS') {
        // 只有单品才展示sku sku数量 品牌
        this.pageParams.sku = null;
        this.pageParams.skuNumber = null;
        this.pageParams.productBrandIds = null;
      }
      let obj = this.paramsFn();
      let v = this;
      if (v.TableLoading) return;
      v.TableLoading = true;
      obj.pickingExtendList = null;
      this.axios.post(api.querySalesPickingExcept, obj).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          let data = this.processData(res.data.datas ? res.data.datas.list : []);
          // 根据pickingNo去找订单前缀
          if (data.length !== 0) {
            data.forEach(item2 => {
              item2.CopyPayTime = this.$uDate.getDateTime(item2.payTime, 'fulltime');
              item2.CopyPayTime = this.$uDate.dealTime(item2.CopyPayTime);
            });
          }
          this.data = data;
          this.total = res.data.datas ? res.data.datas.total : 0;
        } else {
          this.$Message.warning({
            content: '操作失败',
            duration: 4
          });
        }
      });
    },
    reset() {
      for (let key in this.pageParams) {
        this.pageParams[key] = '';
      }
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 10;
    },
    pageNumChange(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.getList();
    }
  }
};
</script>

<style scoped></style>
