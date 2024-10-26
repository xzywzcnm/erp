<template>
  <div>
    <div class="waitAssignBox" v-if="workShow === 'list'">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="searchParams" :model="searchParams" :label-width="labelWidth">
            <dyt-filter ref="document-filter">
              <Form-item label="出库单编号：" prop="outListNo">
                <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="searchParams.outListNo"
                  placeholder="多个出库单请用逗号或回车分隔" />
              </Form-item>
              <Form-item label="分配状态：" prop="pickingStatus">
                <dyt-select v-model="searchParams.pickingStatus" :max-tag-count="1" :multiple="true">
                  <Option v-for="item in pickingStatusList" :value="item.value" :key="item.value" :label="item.label">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="订单号：" prop="orderNos">
                <dyt-input v-model.trim="searchParams.orderNos"></dyt-input>
              </Form-item>
              <Form-item label="创建时间：">
                <Date-picker type="datetimerange" style="width: 100%" @on-clear="resetDate" @on-change="getDateValue"
                  transfer :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end"
                  :value="payTimeArr"></Date-picker>
              </Form-item>
              <Form-item label="来源渠道：" prop="source">
                <dyt-select v-model="searchParams.source">
                  <Option v-for="(item, index) in sourceList" :key="index" :value="item.enName" :label="item.enName">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="分配异常原因：" prop="outOfStockStatusList">
                <dyt-select v-model="searchParams.outOfStockStatusList" :max-tag-count="1" multiple>
                  <Option v-for="item in failTypeList" :value="item.value" :key="item.value" :label="item.label">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="订单付款时间：">
                <Date-picker type="datetimerange" style="width: 100%" @on-clear="resetPayDate"
                  @on-change="getPayDateValue" transfer :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss"
                  placement="bottom-end" :value="payTime"></Date-picker>
              </Form-item>
              <!-- <Form-item label="货主" v-if="!isCargoOwner()">
                  <dyt-select v-model="searchParams.cargoOwnerId">
                    <Option value="_NO_CARGO_OWNER">无货主</Option>
                    <template v-for="item in $store.state.userInfoList">
                      <template v-if="isCargoOwner(item.businessRoleTypeList)">
                        <Option :value="item.userId">{{item.userName}}</Option>
                      </template>
                    </template>
                  </dyt-select>
                </Form-item> -->
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
      <div class="shipping_method">
        <div class="option_btn" v-if="!upOrDown" @click="switchBtn">
          <Icon size="20" type="ios-arrow-forward" />
        </div>
        <shippingMethod :upOrDown="upOrDown" @switchOption="switchOption" @selectCheckBox="selectCheckBox"
          :showCheckbox="true" :treeData="treeData"></shippingMethod>
        <div class="content_table" :style="upOrDown ? 'width: 77%' : 'width: 100%'">
          <div style="background-color: #fff">
            <div class="fl-box" v-show="!ymsMerchant">
              <Button type="primary" style="margin-right: 10px;" v-if="getPermission('packageInfo_batchInvalidPackage')"
                @click="voidIssueDocFn">作废出库单</Button>
              <Buttons type="primary" style="margin-right: 20px;"
                v-if="getPermission('packageInfo_batchReplaceShippingMethod')">
                <Button type="primary" @click="modifyMailFn"
                  v-if="getPermission('packageInfo_batchReplaceShippingMethod')">修改物流方式</Button>
                <Buttons-menu slot="list">
                  <Buttons-item name="1" v-if="getPermission('packageInfo_batchReplaceWarehouseAndShippingMethod')"
                    @click.native="batchModifyWarehouse">修改仓库
                  </Buttons-item>
                </Buttons-menu>
              </Buttons>
              <!--<Button  type="primary" style="margin-right: 10px;"  @click="modifyMailFn" v-if="getPermission('packageInfo_batchReplaceShippingMethod')">修改物流方式</Button>-->
              <Button type="primary" @click="modifyCancel"
                v-if="getPermission('wmsPicking_modifySalesDistributionCancelSingle') && !waitLoading">取消分配</Button>
            </div>
            <Buttons type="primary" class="fl-box" v-if="!waitLoading && !ymsMerchant" trigger="click"
              @on-click="clickAssignBatch">
              <Button type="primary" class="iconbuttons" @click="clickAssignBatch(0)" :disabled="!getPermission('wmsPicking_modifySalesDistributionAll_batch')
                ">
                <Icon type="document-text"></Icon>
                分配库存
              </Button>
              <Buttons-menu slot="list">
                <Buttons-item name="1" v-if="getPermission('wmsPicking_modifySalesDistributionAll_all')
                  ">分配库存（所有结果集）
                </Buttons-item>
              </Buttons-menu>
            </Buttons>

            <Buttons type="primary" class="fl-box" trigger="click" @on-click="outputExcel">
              <Button type="primary" class="iconbuttons" @click="outputExcel(1)"
                :disabled="!getPermission('packageInfo_export')">
                <Icon type="document-text"></Icon>
                导出选择结果
              </Button>
              <Buttons-menu slot="list">
                <Buttons-item :name="2" v-if="getPermission('packageInfo_export_all')">导出所有结果</Buttons-item>
              </Buttons-menu>
            </Buttons>

            <div class="fl-box" v-if="waitLoading">
              <Button disabled>分配中</Button>
            </div>
            <div class="fl-box1" v-if="progressBarTalg">
              <div>
                有一条分配任务执行中，任务执行完成后才能继续分配
                <Progress :percent="wait.percent"></Progress>
                <span v-if="turnTalg === 1">分配进度：{{ wait.waitCount }}/{{ wait.totalCancelCount }}</span>
                <span v-if="turnTalg === 2">分配进度：{{ wait.waitCount }}/{{ wait.totalCount }}</span>
                <span v-if="turnTalg === 3">分配进度：{{ wait.waitCount }}/{{ wait.failFullAllocationCount }}</span>
              </div>
            </div>
            <div class="fl-box2" v-show="!ymsMerchant">
              <Button type="primary" size="small" @click="showWaitResult">{{ waitText }}</Button>
            </div>
            <div class="grayBg fr">
              <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
              </dyt-sortBySelect>
            </div>
          </div>
          <Table :columns="columns" border :loading="TableLoading" :data="data" :height="tableHeight"
            style="margin-top: 10px" @on-selection-change="tableSelectionData"></Table>
          <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
            show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
            :page-size-opts="[10, 20, 50, 100, 500]" style="text-align: right; padding: 10px 20px 0 0"></Page>
        </div>
      </div>
    </div>
    <!--详情-->
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :waitLoading="waitLoading" :pickingNo="pickingNo" :workType="workType" :workShow="workShow"
        :ymsMerchant="ymsMerchant"></sellStockOutDtl>
    </div>
    <!--批量修改物流方式-->
    <modifyMailingMethod ref="modifyMailingMethod" :packageData="packageData" :isEditWarehouse="isEditWarehouse"
      @getList="searchFn"></modifyMailingMethod>
    <!--批量作废包裹-->
    <voidIssueDoc ref="voidIssueDoc" :packageIdList="packageIdList" @getList="searchFn"></voidIssueDoc>
  </div>
</template>

<script>
import api from '@/api/api';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import sellStockOutDtl from './sellStockOutDtl';
import common from '@/components/mixin/common_mixin';
import modifyMailingMethod from '@/views/wms/components/common/modifyMailingMethod';
import voidIssueDoc from '@/views/wms/components/common/voidIssueDoc';
import shippingMethod from '@/components/common/shippingMethod';

export default {
  mixins: [common],
  components: {
    compoundBtn,
    sellStockOutDtl,
    modifyMailingMethod,
    voidIssueDoc,
    shippingMethod
  },
  data() {
    var v = this;
    return {
      upOrDown: true,
      packageIdList: [],
      packageData: [],
      isEditWarehouse: false, // 控制是否能修改仓库
      waitLoading: false,
      modal6: false,
      percent: 1,
      clearAble: true,
      payTimeArr: [],
      payTime: [],
      workShow: 'list',
      workType: 'sellStock',
      pickingNo: '', // 传入详情的参数
      searchParams: {
        pageNum: 1,
        pageSize: 10,
        cargoOwnerType: null,
        cargoOwnerId: null,
        orderNos: '',
        createdStartTime: '',
        createdEndTime: '',
        outListNo: '',
        source: null,
        pickingStatus: [],
        outListType: ['*'],
        channelSell: ['*'],
        outListStatus: ['0', '1', '7'],
        outOfStockStatusList: [],
        payStartTime: '',
        payEndTime: '',
        cacheClickVal: 'CT', // 排序缓存值
        orderSeq: 'ASC',
      },
      tableItemTotal: 0,
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "ASC",
          default: true,
        },
        {
          sortHeader: "按分配状态",
          sortField: "WS",
          sortType: "ASC",
        },
      ],
      treeData: [],
      assignList: [
        {
          label: '分配库存（所有结果集）',
          value: '1',
          flagCode: ['1'],
          status: '1'
        }
      ],
      sltTreeData: [],
      pickingStatusList: [
        {
          label: '订单创建',
          value: '0'
        },
        {
          label: '部分分配',
          value: '1'
        },
        {
          label: '分配失败',
          value: '7'
        }
      ],
      outListTypeList: [
        // {label: '销售出库', value: 'S1'},
        {
          label: '其他出库',
          value: 'O3'
        },
        {
          label: '调拨出库',
          value: 'O1'
        },
        {
          label: '组装加工',
          value: 'O2'
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '出库单号',
          key: 'pickingNo',
          align: 'center',
          minWidth: 140,
          render: (h, params) => {
            if (v.getPermission('wmsPicking_querySalesPickingDetail')) {
              return h(
                'a',
                {
                  on: {
                    click: () => {
                      v.pickingNo = params.row.pickingNo;
                      v.workShow = 'detail';
                    }
                  }
                },
                params.row.pickingNo
              );
            } else {
              return h('div', params.row.pickingNo);
            }
          }
        },
        {
          title: '分配状态',
          minWidth: 98,
          align: 'center',
          key: 'status'
        },
        {
          title: '分配异常原因',
          minWidth: 110,
          align: 'center',
          key: 'status',
          render(h, params) {
            // 云仓的分配异常原因
            let ymsPkgCreateFailReason = params.row.ymsPkgCreateFailReason;
            if (ymsPkgCreateFailReason) {
              return h(
                'Tooltip',
                {
                  class: 'wayBillStatusError',
                  props: {
                    transfer: true,
                    maxWidth: 250,
                    content: ymsPkgCreateFailReason
                  }
                },
                [
                  h(
                    'span',
                    {
                      class: 'text-overflow',
                      style: { color: '#f00' }
                    },
                    ymsPkgCreateFailReason
                  )
                ]
              );
            } else {
              // 直营仓的分配异常原因
              if (params.row.outOfStockStatusList) {
                return h(
                  'div',
                  {},
                  params.row.outOfStockStatusList.map((i) => {
                    let obj = v.failTypeList.filter((j) => {
                      if (j.value === Number(i)) {
                        return j;
                      }
                    })[0];
                    if (obj) {
                      return h(
                        'Tag',
                        {
                          props: {
                            color: obj.color
                          }
                        },
                        obj.label
                      );
                    }
                  })
                );
              }
            }
          }
        },
        {
          title: '订单号',
          minWidth: 98,
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
        },
        {
          title: '国家/地区',
          align: 'center',
          minWidth: 98,
          key: 'consigneeCountry'
        },
        {
          title: '物流商',
          align: 'center',
          minWidth: 120,
          key: 'logisticsDealerName'
        },
        {
          title: '物流方式',
          align: 'center',
          minWidth: 120,
          key: 'logisticsMailName'
        },
        {
          title: '创建时间',
          align: 'center',
          minWidth: 140,
          key: 'createdTime'
        },
        {
          title: '订单付款时间',
          align: 'center', // $uDate.dealTime
          minWidth: 140,
          key: 'payTime',
          render: (h, params) => {
            return h('span', v.$uDate.dealTime(params.row.payTime, 'fulltime'));
          }
        },
        {
          title: '操作',
          key: 'h',
          align: 'center',
          width: 220,
          fixed: 'right',
          render: (h, params) => {
            return !v.ymsMerchant
              ? h(compoundBtn, {
                props: {
                  dropList: [
                    {
                      label: '查看出库单详情',
                      value: '1',
                      flagCode: ['0', '1', '7'],
                      status: this.getPermission('wmsPicking_querySalesPickingDetail')
                        ? params.row.pickingStatus
                        : -1
                    }, {
                      label: '修改仓库',
                      value: '4',
                      flagCode: ['0', '7'],
                      status: this.getPermission('packageInfo_batchReplaceWarehouseAndShippingMethod')
                        ? params.row.pickingStatus
                        : -1
                    }, {
                      label: '取消分配',
                      value: '2',
                      flagCode: ['1'],
                      status: this.getPermission('wmsPicking_modifySalesDistributionCancelSingle') && !this.waitLoading
                        ? params.row.pickingStatus
                        : -1
                    }, {
                      label: '修改物流方式',
                      value: '3',
                      flagCode: ['1'],
                      status: this.getPermission('packageInfo_batchReplaceShippingMethod') && params.row.isImport === 1
                        ? '1'
                        : '0'
                    }
                  ],
                  title: '分配库存',
                  listenNormal: false,
                  btnType: '',
                  icon: 'md-share',
                  disabled: !this.getPermission('wmsPicking_modifySalesDistributionAll_single') || this.waitLoading
                },
                on: {
                  click: val => {
                    if (!val && !this.waitLoading) {
                      // 分配
                      this.dropOption(api.assign_sellAll, '不能重复分配', params.row);
                    } else {
                      if (val === '1') {
                        v.pickingNo = params.row.pickingNo;
                        v.workShow = 'detail';
                      } else if (val === '3') {
                        v.packageData = [params.row];
                        v.$refs.modifyMailingMethod.modal2 = true;
                      } else if (val === '4') {
                        v.modifyWarehouse([params.row]);
                      } else {
                        let paramsObj = {
                          ...this.paramsFn()
                        };
                        paramsObj.pickingNo = [params.row.pickingNo];
                        v.cancelApi(paramsObj);
                      }
                    }
                  }
                }
              }, [])
              : '';
          }
        }
      ],
      data: [],
      tableSltData: [],
      logisticCode: null,
      mailCode: null,
      pickingExtendList: null,
      wait: {
        totalCount: 0, // 分配总数
        totalCancelCount: 0, // 总取消数量 					(部分分配包裹)
        successCancelCount: 0, // 取消成功数量
        failCancelCount: 0, // 取消失败数量
        finishAllocationCount: 0, // 全分配成功数量
        failFullAllocationCount: 0, // 全分配失败数量
        successPartAllocationCount: 0, // 部分分配成功数量
        failPartAllocationCount: 0, // 部分分配失败数量
        waitCount: 0, // 分配中数量
        percent: 0 // 进度
      },
      turnTalg: 1, // 分配的轮次 （默认是第一轮分配）
      waitTimer: null,
      sourceList: [],
      progressBarTalg: false, // 是否展示分配库存的进度条
    };
  },
  created() {
    this.searchSendType();
    this.search(true);
    this.getWaitNub(false);
    this.getSourceList();
  },
  methods: {
    // 获取来源渠道的数据
    getSourceList() {
      let v = this;
      v.axios.get('/wms-service/erpCommon' + api.get_organizationSource).then(response => {
        if (response.data.code === 0) {
          v.sourceList = response.data.datas;
        }
      });
    },
    batchModifyWarehouse() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.isEditWarehouse = true;
      v.packageData = v.tableSltData;
      v.$refs.modifyMailingMethod.modal2 = true;
    },
    modifyWarehouse(params) {
      let v = this;
      v.isEditWarehouse = true;
      v.packageData = params;
      v.$refs.modifyMailingMethod.modal2 = true;
    },
    voidIssueDocFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.packageIdList = v.tableSltData.map((i) => i.pickingId);
      v.$refs.voidIssueDoc.modal = true;
    },
    modifyMailFn() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      v.isEditWarehouse = false;
      v.packageData = v.tableSltData;
      v.$refs.modifyMailingMethod.modal2 = true;
    },
    /*
    * 分配库存的相关说明：
      第一轮：
      总取消数量 = 取消成功数量 + 取消失败数量 （totalCancelCount = successCancelCount + failCancelCount）
      第二轮：
      分配总数 = 全分配成功数量 + 全分配失败数量 （totalCount = finishAllocationCount + failFullAllocationCount）
      第三轮：
      全分配失败数量 = 部分分配成功数量 + 部分分配失败数量 （failFullAllocationCount = successPartAllocationCount + failPartAllocationCount）
    */
    getWaitNub(isShowResult) {
      let v = this;
      let id = v.getWarehouseId();
      clearTimeout(v.waitTimer);
      v.axios.get(api.allocatedInventoryStatistics + id).then((res) => {
        if (res.data.code === 0) {
          v.wait = Object.assign({}, v.wait, res.data.datas);
          // 第一轮分配
          if (v.turnTalg === 1) {
            v.wait.waitCount = v.wait.successCancelCount + v.wait.failCancelCount;
            let totalCount = v.wait.totalCancelCount;
            let waitCount = v.wait.waitCount;
            v.handerPercent(totalCount, waitCount, isShowResult, v.turnTalg);
          } else if (v.turnTalg === 2) {
            // 第二轮分配
            v.wait.waitCount = v.wait.finishAllocationCount + v.wait.failFullAllocationCount;
            let totalCount = v.wait.totalCount;
            let waitCount = v.wait.waitCount;
            v.handerPercent(totalCount, waitCount, isShowResult, v.turnTalg);
          } else if (v.turnTalg === 3) {
            // 第三轮分配
            v.wait.waitCount = v.wait.successPartAllocationCount + v.wait.failPartAllocationCount;
            let totalCount = v.wait.failFullAllocationCount;
            let waitCount = v.wait.waitCount;
            v.handerPercent(totalCount, waitCount, isShowResult, v.turnTalg);
          }
        }
      }).catch(() => {
      });
    },
    // 处理轮询分配库存的进度
    /**
     * totalCount 为当前分配轮次的分配总数
     * waitCount 为当前分配轮次的分配数量
     * isShowResult 是否停止循环轮询
     * turnTalg 分配的轮次
     */
    handerPercent(totalCount, waitCount, isShowResult, turnTalg) {
      let v = this;
      if (isShowResult) {
        v.progressBarTalg = true;
      }
      v.waitLoading = true;
      v.wait.percent = Math.floor((waitCount / totalCount).toFixed(2) * 100);
      if (totalCount === waitCount) {
        if (isShowResult) {
          if (turnTalg === 3) {
            v.waitLoading = false;
            v.showWaitResult();
            v.searchFn();
          } else {
            v.turnTalg += 1;
            v.waitTimer = setTimeout(() => {
              v.getWaitNub(true);
            }, 1500);
          }
        }
      } else {
        v.waitTimer = setTimeout(() => {
          v.getWaitNub(true);
        }, 1500);
      }
      v.waitLoading = false;
    },
    showWaitResult() {
      // const content = `本次分配库存的出库单数量总共${this.wait.totalCount}个，其中：${this.wait.finishAllocationCount}个全分配成功，
      // ${this.wait.failFullAllocationCount}个全分配失败，${this.wait.successPartAllocationCount}个部分分配成功，
      // ${this.wait.failPartAllocationCount}个部分分配失败`
      let v = this;
      v.$Modal.warning({
        title: '分配结果',
        content:
          '本次分配库存的出库单数量总共' +
          v.wait.totalCount +
          '个，其中：' +
          v.wait.finishAllocationCount +
          '个分配完成，' +
          v.wait.successPartAllocationCount +
          '个部分分配，' +
          v.wait.failPartAllocationCount +
          '个分配失败',
        okText: '关闭',
        cancelText: ''
      });
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.searchParams.createdStartTime = v.$uDate.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          v.searchParams.createdEndTime = v.$uDate.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    resetDate() {
      let v = this;
      v.searchParams.createdStartTime = '';
      v.searchParams.createdEndTime = '';
    },
    getPayDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.searchParams.payStartTime = v.$uDate.getUniversalTime(
            new Date(value[0]).getTime(),
            'fulltime'
          );
          v.searchParams.payEndTime = v.$uDate.getUniversalTime(
            new Date(value[1]).getTime(),
            'fulltime'
          );
        }
      }
    },
    resetPayDate() {
      this.searchParams.payStartTime = '';
      this.searchParams.payEndTime = '';
    },
    tableSelectionData(selection) {
      this.tableSltData = selection;
    },
    modifyCancel() {
      let v = this;
      if (v.tableSltData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      let params = v.tableSltData.filter((i) => {
        return i.pickingStatus !== '0' && i.pickingStatus !== '7';
      });
      if (params.length === 0) {
        v.$Message.info('只有非“创建状态”和“分配失败”状态的出库单才能取消');
      } else {
        let paramsObj = {
          ...this.paramsFn()
        };
        paramsObj.pickingNo = params.map((i) => i.pickingNo);
        this.cancelApi(paramsObj).then((data) => {
          if (data.data.code === 0) {
            v.$Modal.warning({
              title: '取消分配结果',
              content: `<p>本次取消分配库存的出库单数量总共 <span class="blueColor">${params.length
              }</span> 个，其中</p>
                <p> <span class="blueColor">${data.data.datas
}</span> 个取消成功, <span class="blueColor">${params.length - data.data.datas
}</span> 个取消失败</p>`
            });
          }
        });
      }
    },
    cancelApi(params) {
      let v = this;
      return new Promise((resolve) => {
        v.axios.post(api.cancel_sellStockAll, params).then((response) => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            resolve(response);
            v.searchFn();
          }
        });
      });
    },
    dropOption(insertApi, tips, rowObj, isGetWaitNub) {
      let obj = null;
      if (Array.isArray(rowObj)) {
        obj = rowObj.map((val) => val.pickingNo);
      } else {
        obj = [rowObj.pickingNo];
      }
      let paramsObj = {
        ...this.paramsFn()
      };
      paramsObj.pickingNo = obj;
      this.waitLoading = true;
      for (let key in this.wait) {
        this.wait[key] = 0;
      }
      return new Promise((resolve) => {
        this.axios
          .post(insertApi, paramsObj)
          .then((res) => {
            resolve(res);
            if (!isGetWaitNub) {
              this.getWaitNub(true);
            }
            if (res.data.code === 0) {
              this.$Message.success('操作成功');
              this.searchFn();
            }
          })
          .catch(() => {
            this.waitLoading = false;
          });
      });
    },
    // sltChangeProcess(val, string) {
    //   // 多选模式下全部和选项的切换
    //   if (val.length > 1) {
    //     if (val[val.length - 1] === '*') {
    //       this.searchParams[string] = ['*'];
    //     } else {
    //       if (val.indexOf('*') > -1) {
    //         val.splice(val.indexOf('*'), 1);
    //         this.searchParams[string] = val;
    //       }
    //     }
    //   }
    // },
    // outListTypeChange(val) {
    //   // 出库单类型选择
    //   this.sltChangeProcess(val, 'outListType');
    // },
    // pickingStatusChange(val) {
    //   // 销售渠道改变
    //   this.sltChangeProcess(val, 'pickingStatus');
    // },
    searchSendType() {
      let v = this;
      let obj = {
        pickingNos: this.searchParams.outListNo
          ? this.chEnCsv(this.searchParams.outListNo)
          : null,
        warehouseIds: [v.getWarehouseId()],
        logisticsTrackingNo: this.searchParams.outListNo
          ? this.searchParams.outListNo
          : null,
        packageType: this.searchParams.outListType.length === 2 || this.searchParams.outListType[0] === '*'
          ? null
          : this.searchParams.outListType.join(','),
        saleChannelList: this.searchParams.channelSell.length === 3 || this.searchParams.channelSell[0] === '*'
          ? null
          : this.searchParams.channelSell,
        createdStartTime: v.searchParams.createdStartTime
          ? v.searchParams.createdStartTime
          : null,
        createdEndTime: v.searchParams.createdEndTime
          ? v.searchParams.createdEndTime
          : null
      };
      this.searchParams.orderNos && (obj.orderNos = [this.searchParams.orderNos]);
      this.axios.post(api.search_SendType, obj).then(res => {
        if (res.data.code === 0) {
          var data = res.data.datas;
          data.forEach(val => {
            val.title = val.logisticsDealerName === null
              ? '未指定物流商'
              : val.logisticsDealerName;
            val.code = val.logisticsDealerCode;
            val.logisticsDealerCode = val.logisticsDealerCode;
            val.expand = true;
            val.queryMailResultList.forEach(val2 => {
              val2.logisticsDealerCode = val.logisticsDealerCode;
              val2.title = val2.logisticsMailName === null
                ? '未指定邮寄方式'
                : val2.logisticsMailName;
              val2.code = val2.logisticsMailCode;
              val2.expand = true;
            });
            val.children = val.queryMailResultList;
          });
          if (data.length !== 0) {
            this.treeData = [
              {
                title: '全部',
                pickingNumber: 0,
                expand: true,
                children: []
              }
            ];
            this.treeData[0].pickingNumber = data.reduce((a, b) => {
              return a + b.pickingNumber;
            }, 0);
            this.treeData[0].children = data;
            let arr = [];
            data.forEach(val => {
              arr = [...arr, ...val.queryMailResultList];
            });
            this.sltTreeData = arr; // 树形结构数据默认全选
            //                          this.queryBeforeCreateList()
          } else {
            this.treeData = [];
            this.sltTreeData = [];
          }
        } else {
          this.treeData = [];
          this.sltTreeData = [];
        }
      })
        .catch(() => {
          this.treeData = [];
          this.sltTreeData = [];
        });
    },
    selectCheckBox(arr) {
      let paramsArr = arr.filter(item => {
        if (item.logisticsMailCode) {
          return item;
        }
      }).map(item => {
        return {
          logisticsMailCode: item.logisticsMailCode
        };
      });
      this.pickingExtendList = paramsArr.length > 0
        ? paramsArr
        : null;
      this.search(false);
      this.sltTreeData = arr;
    },
    clickAssignBatch(name) {
      if (!name) {
        // 批量选中分配
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择数据');
          return;
        }
        this.dropOption(api.assign_sellAll, '不能重复分配', this.tableSltData);
      } else {
        // 全部分配
        if (this.data.length === 0) {
          this.$Message.warning('无分配数据');
          return;
        }
        let arr = this.searchParams.outListNo
          ? this.searchParams.outListNo.split(',').map(i => {
            return { pickingNo: i };
          })
          : [];
        this.dropOption(api.assign_sellAll, '不能重复分配', arr);
      }
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderSeq = type;
      this.searchParams.cacheClickVal = feild;
      this.searchFn();
    },
    chEnCsv(params) {
      // 中英文逗号混合分隔
      let arr = [];
      if (params.indexOf(',') > -1) {
        let initArr = params.split(',');
        initArr.forEach((val) => {
          if (val.indexOf('，') > -1) {
            arr = [...arr, ...val.split('，')];
          } else {
            arr = [...arr, val];
          }
        });
      } else if (params.indexOf('，') > -1) {
        let initArr = params.split('，');
        initArr.forEach((val) => {
          if (val.indexOf(',') > -1) {
            arr = [...arr, ...val.split(',')];
          } else {
            arr = [...arr, val];
          }
        });
      } else {
        arr.push(params);
      }
      return arr;
    },
    paramsFn() {
      let v = this;
      this.searchParams.pageSize = this.getPageSizeCache();
      let obj = {
        warehouseId: [v.getWarehouseId()],
        orderNos: [this.searchParams.orderNos],
        createdStartTime: this.searchParams.createdStartTime,
        createdEndTime: this.searchParams.createdEndTime,
        payStartTime: this.searchParams.payStartTime,
        payEndTime: this.searchParams.payEndTime,
        orderBy: this.searchParams.cacheClickVal || null,
        orderSeq: this.searchParams.orderSeq, // packageGoodsStatus: this.searchParams.picked === '*' ? null : this.searchParams.picked,
        // packageType: this.searchParams.packType === '' || this.searchParams.packType[0] === '*' ? null : this.searchParams.packType,
        pageNum: this.searchParams.pageNum,
        pageSize: this.searchParams.pageSize, // pickingGoodsNo: this.searchParams.pickNo === '' ? null : this.chEnCsv(this.searchParams.pickNo),//拣货单号
        pickingNo: this.searchParams.outListNo === ''
          ? null
          : this.chEnCsv(this.searchParams.outListNo), // 出库单编号
        // pickingStatus: !this.searchParams.pickingStatus.length || this.searchParams.pickingStatus[0] === '*'
        //   ? this.searchParams.outListStatus
        //   : this.searchParams.pickingStatus, // 出库单状态
        pickingStatus: !this.searchParams.pickingStatus.length ? this.searchParams.outListStatus
          : this.searchParams.pickingStatus, // 出库单状态
        saleChannel: this.searchParams.channelSell === '' || this.searchParams.channelSell[0] === '*'
          ? null
          : this.searchParams.channelSell, //                warehouseId: this.searchParams.ware === '' || this.searchParams.ware[0] === '*' ? null : this.searchParams.ware,
        pickingType: this.searchParams.outListType === '' || this.searchParams.outListType[0] === '*'
          ? ['S1']
          : this.searchParams.outListType, // pickingExtendList: this.logisticCode || this.mailCode ? [
        //   {
        //     logisticsDealerCode: this.logisticCode,
        //     logisticsMailCode: this.mailCode
        //   }
        // ] : null,
        pickingExtendList: this.pickingExtendList,
        source: this.searchParams.source,
        outOfStockStatusList: this.searchParams.outOfStockStatusList
      };
      if (v.searchParams.cargoOwnerId) {
        if (v.searchParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          obj.cargoOwnerType = 0;
          obj.cargoOwnerId = null;
        } else {
          obj.cargoOwnerType = 1;
          obj.cargoOwnerId = v.searchParams.cargoOwnerId;
        }
      } else {
        obj.cargoOwnerType = null;
        obj.cargoOwnerId = null;
      }
      return obj;
    },
    searchFn() {
      // 查询
      if (this.getPermission('wmsPicking_querySalesPicking_waitForDistribution')) {
        let obj = this.paramsFn();
        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.get_sellStockList, obj).then((res) => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          if (res.data.code === 0) {
            let data = this.processData(res.data.datas.list);
            this.data = this.processTimeData(data, 'createdTime');
            this.tableItemTotal = res.data.datas.total;
            this.tableSltData = [];
          }
          setTimeout(() => {
            this.$refs['document-filter'] && this.$refs['document-filter'].resizeHand();
          }, 300)
        }).catch(() => {
          this.TableLoading = false;
          this.SearchDisabled = false;
          setTimeout(() => {
            this.$refs['document-filter'] && this.$refs['document-filter'].resizeHand();
          }, 300)
        });
      } else {
        this.gotoError(); // 无权限
      }
    },
    search(value) {
      this.searchParams.pageNum = 1;
      this.searchFn();
      if (value) { // 点击勾选的时候不重新刷新树数据，点击查询按钮的时候重新刷新树数据
        this.searchSendType();
      }
    },
    processData(listData) {
      // 返回数据的中文匹配
      listData.forEach(val => {
        val.type = val.pickingType === 'S1'
          ? '销售出库'
          : val.pickingType === 'O3'
            ? '其他出库'
            : val.pickingType === 'O1'
              ? '调拨出库'
              : val.pickingType === 'O2'
                ? '组装加工'
                : '';
        val.status = val.pickingStatus === '0'
          ? '订单创建' // 订单创建
          : val.pickingStatus === '1'
            ? '部分分配' // 部分分配
            : val.pickingStatus === '2'
              ? '分配完成' // 分配完成
              : val.pickingStatus === '3'
                ? '部分发货' // 部分发货
                : val.pickingStatus === '4'
                  ? '完成发货' // 完成发货
                  : val.pickingStatus === '5'
                    ? '订单完成' // 订单完成
                    : val.pickingStatus === '7'
                      ? '分配失败' // 分配失败
                      : '';
        val.pickStatus = val.packageGoodsStatus === '0'
          ? '未拣货'
          : val.packageGoodsStatus === '1'
            ? '已拣货'
            : '';
      });
      return listData;
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.searchFn();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      this.searchFn();
    }, // 展开与收起邮寄方式
    switchBtn() {
      this.upOrDown = !this.upOrDown;
    },
    switchOption(val) {
      this.upOrDown = val;
    }, // 重置按钮
    reset() {
      this.payTimeArr = [];
      this.payTime = [];
      this.resetDate();
      this.$refs['searchParams'].resetFields();
    },

    // 导出选中1/所有数据2
    outputExcel(index) {
      if (!index) return;
      let temp = Object.assign({}, this.paramsFn()); // pageParams中某些参数必传

      if (index === 1) {
        if (!this.tableSltData.length) {
          this.$Message.error('请选择要操作的数据');
          return;
        }
        const packageIdList = this.tableSltData.map((i) => i.pickingId);
        temp.packageIdList = packageIdList;
        temp.exportType = 0;
      }

      if (index === 2) {
        if (!this.data.length) {
          this.$Message.error('暂无数据');
          return;
        }
        temp.exportType = 1;
      }

      this.axios.post(api.post_exportSalesPicking, temp).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
          this.searchFn();
        }
      });
    }
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(315);
    },
    waitText() {
      if (this.waitLoading) {
        return '查看分配中结果';
      } else {
        return '查看上次分配结果';
      }
    },
    ymsMerchant() {
      // 如果当前用户是云仓供应商隐藏相关的操作功能
      let erpConfig = this.$store.state.erpConfig;
      if (erpConfig) {
        if (
          erpConfig.allYmsMerchantIds &&
          erpConfig.allYmsMerchantIds.length > 0
        ) {
          if (
            erpConfig.allYmsMerchantIds.indexOf(erpConfig.merchant.merchantId) >
            -1
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  },
  destroyed() {
    this.getWaitNub = null;
  }
};
</script>

<style lang="less" scoped>
.waitAssignBox {
  padding-left: 6px;
}

.fl-box {
  padding-left: 10px;
  padding-top: 20px;
  float: left;
}

.fl-box1 {
  padding-left: 10px;
  padding-top: 8px;
  float: left;
  width: 400px;
}

.fl-box2 {
  padding-left: 20px;
  padding-top: 24px;
  float: left;
}

.shipping_method {
  width: 100%;
  position: relative;
  padding-top: 0px;
  display: flex;
  justify-content: space-around;

  .content_table {
    display: flex;
    flex-direction: column;
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

<style>
.waitAssignBox .ivu-checkbox-wrapper {
  display: inline-block;
}

/* .waitAssignBox .ivu-card-body {
  height: 640px;
} */

.waitAssignBox .ivu-icon-ios-close {
  color: #666 !important;
}
</style>
