<template>
  <div class="additionalWaybillNo">
    <div v-if="workShow === 'list'" class="listPage">
      <div class="searchMain">
        <Form ref="formInline" :model="searchParams" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <FormItem label="搜索出库单">
              <Input placeholder="可输入出库单号、订单号查询" v-model="searchParams.searchValue" />
            </FormItem>
            <FormItem label="发货时间">
              <Date-picker transfer type="datetimerange" style="width: 100%" @on-clear="resetDate"
                @on-change="getDateValue" :options="dateOptions" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss"
                placement="bottom-end" :value="payTimeArr"></Date-picker>
            </FormItem>
            <FormItem label="运单号">
              <!-- <local-buttons :data="tabsData" :value.sync="searchParams.hasTrackingNum"></local-buttons> -->
              <dyt-select v-model="searchParams.hasTrackingNum">
                <Option v-for="item in tabsData" :value="item.value" :key="item.value" :label="item.label"></Option>
              </dyt-select>
            </FormItem>
            <div slot="operation" v-if="getPermission('packageInfo_queryForSupplementTrackingNumber')">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询
              </Button>
              <Button @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="shipping_method">
        <div class="option_btn" v-if="!upOrDown" @click="switchBtn">
          <Icon size="20" type="ios-arrow-forward" />
        </div>
        <shippingMethod :upOrDown="upOrDown" @switchOption="switchOption" @selectCheckBox="selectCheckBox"
          :showCheckbox="true" :treeData="treeData"></shippingMethod>
        <div class="content_table ml10">
          <!--操作按钮组-->
          <div class="funMain" style="margin-top:0;">
            <div class="funMain__flex">
              <div>
                <Buttons type="primary" trigger="click" class="mr20"
                  v-if="getPermission('packageInfo_againGetTrackingNumber')">
                  <Button type="primary" @click.native="batchGetTrackingNum">
                    获取-选中 </Button>
                  <Buttons-menu slot="list">
                    <Buttons-item @click.native="getAllTrackingNum" name="1">获取（所有结果集）
                    </Buttons-item>
                  </Buttons-menu>
                </Buttons>
                <Buttons type="primary" trigger="click" class="mr20"
                  v-if="getPermission('packageInfo_exportSupplementTrackingNumber')">
                  <Button type="primary" @click.native="batchExport">
                    导出-选中 </Button>
                  <Buttons-menu slot="list">
                    <Buttons-item @click.native="exportAll" name="1">导出（所有结果集）
                    </Buttons-item>
                  </Buttons-menu>
                </Buttons>
                <Button v-if="getPermission('packageInfo_importSupplementTrackingNumber')" @click="importMt">EXCEL导入补录
                </Button>
              </div>
              <div>
                <dyt-sortBySelect :sortButtonList="sortButtonList" :sorType="{ DESC: 'down', ASC: 'up' }"
                  @sortInfo="getSortInfoAndFetch">
                </dyt-sortBySelect>
              </div>
            </div>
          </div>
          <!--列表-->
          <div class="tableMain">
            <div class="tableBox">
              <Table highlight-row border :columns="columns" :loading="TableLoading" :data="datas"
                @on-selection-change="selectChange" :height="tableHeight"></Table>
            </div>
          </div>
          <div class="pagesMain">
            <Page :total="total" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total show-sizer
              show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
              :page-size-opts="[10, 20, 50, 100, 500]"></Page>
          </div>
        </div>
      </div>
    </div>

    <div v-if="workShow === 'detail'">
      <sellStockOutDtl :workShow="workShow" :pickingNo="packageCode" workType="sellStock"></sellStockOutDtl>
    </div>
    <importTemp @getList="getList" ref="importTemp" :actionUrl="importUrl" :loadTemplateApi="loadTemplateApi"
      :files="'excleFile'"></importTemp>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import shippingMethod from '@/components/common/shippingMethod';
import sellStockOutDtl from '../exWarehouse/sellStockOutDtl';
import importTemp from '@/components/common/importTemp';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  name: 'additionalWaybillNo',
  mixins: [Mixin, tableHeight_mixin],
  components: {
    shippingMethod,
    sellStockOutDtl,
    importTemp
  },
  data() {
    let self = this;
    return {
      importUrl: api.import_SupplementTrackingNumber, // 导入地址
      loadTemplateApi: api.get_SupplementTrackingNumberTemplet, // 下载模板
      checkedData: [],
      tabsData: [
        // {
        //   label: '全部',
        //   value: '*'
        // },
        {
          label: '有',
          value: 1
        }, {
          label: '无',
          value: 0
        }
      ],
      total: 0,
      columns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          key: '',
          align: 'center',
          width: 60,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('span', {
              class: 'blueColor cursor underline',
              on: {
                click: () => {
                  self.showPackageDetails(params.row.packageCode, 'detail');
                }
              }
            }, params.row.packageCode);
          }
        }, {
          title: '订单号',
          key: 'salesRecordNumber',
          align: 'center',
          minWidth: 160,
          render(h, params) {
            let pos = [];
            if (params.row.packageOrderBoList !== null) {
              for (let i = 0; i < params.row.packageOrderBoList.length; i++) {
                var n = params.row.packageOrderBoList[i];
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
          title: '物流商包裹号', // 物流商包裹号
          align: 'center',
          minWidth: 140,
          key: 'thirdPartyNo'
        }, {
          title: 'LAPA重量（g）',
          align: 'center',
          width: 140,
          key: 'userWeight'
        }, {
          title: '物流商重量（g）',
          align: 'center',
          width: 140,
          key: 'carrierWeight'
        }, {
          title: 'LAPA运费（￥）',
          align: 'center',
          width: 140,
          key: 'estimateFreight'
        }, {
          title: '物流商运费（￥）',
          align: 'center',
          width: 140,
          key: 'postage'
        }, {
          title: '运单号',
          align: 'center',
          minWidth: 120,
          key: 'trackingNumber'
        }, {
          title: '获取状态',
          align: 'center',
          minWidth: 120,
          key: 'carrierSendStatus',
          render(h, params) {
            // 获取物流商发货状态(1:未就绪 2:处理中 3:处理成功 4:处理失败) ,
            let carrier = params.row.carrierSendStatus;
            let text = carrier === 2 ? '处理中' : '待处理';
            return h('span', text);
          }
        }, {
          title: '操作',
          align: 'center',
          width: 140,
          fixed: 'right',
          render(h, params) {
            return !self.getPermission('packageInfo_againGetTrackingNumber') || h('Button', {
              on: {
                'click'() {
                  self.getTrackingNumber({
                    packageIds: [params.row.packageId]
                  });
                }
              }
            }, '开始获取');
          }
        }
      ],
      datas: [],
      sortButtonList: [
        {
          sortHeader: "出库时间",
          sortField: "despatchTime",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "创建时间",
          sortField: "createdTime",
          sortType: "up",
        },
      ],
      upOrDown: true,
      clearAble: true,
      payTimeArr: [],
      searchParams: {
        endDespatchTime: null, // 发货结束时间 ,
        hasTrackingNum: 0, // 是否有运单号,1是0无 null全部 ,
        merchantShippingMethodIdList: [],
        orderBy: 'despatchTime', // 排序方式 出库时间:despatchTime 创建时间createdTime 默认despatchTime ,
        orderNo: '',
        packageCodes: [],
        pageNum: 1,
        pageSize: 10,
        platformId: null,
        saleAccountId: null,
        saleAccountIds: [],
        salesRecordNumber: null,
        searchValue: '',
        startDespatchTime: null,
        upDown: 'up', // 升降 升:up 降down 默认降序 ,
        warehouseId: self.getWarehouseId()
      },
      packageCode: '',
      workShow: 'list',
      treeData: []
    };
  },
  created() {
    // 调整为默认不查询
    // this.getAllShipMethod();
    // this.search();
  },
  props: {},
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  methods: {
    importMt() {
      let v = this;
      v.$refs.importTemp.model1 = true;
    },
    batchGetTrackingNum() {
      // 批量获取运单号
      let v = this;
      if (v.checkedData.length === 0) {
        v.$Message.info('请选择数据');
        return;
      }
      v.getTrackingNumber({
        packageIds: v.checkedData.map(i => {
          return i.packageId;
        })
      }).then(() => {
        v.checkedData = [];
      });
    },
    getAllTrackingNum() {
      // 获取所有结果集运单号
      let v = this;
      v.searchParams.pageSize = this.getPageSizeCache();
      let params = v.deepCopy(v.searchParams);
      v.getTrackingNumber(params);
    },
    selectChange(data) {
      this.checkedData = data;
    },
    batchExport() {
      // 批量导出
      let v = this;
      if (v.checkedData.length === 0) {
        v.$Message.error('请选择操作数据');
        return;
      }
      v.exportSupplementTrackingNumber({
        packageIds: v.checkedData.map(i => {
          return i.packageId;
        }),
        warehouseId: v.getWarehouseId()
      });
    },
    exportAll() {
      // 导出所有集
      let v = this;
      v.searchParams.pageSize = this.getPageSizeCache();
      let params = v.deepCopy(v.searchParams);
      v.exportSupplementTrackingNumber(params);
    },
    exportSupplementTrackingNumber(params) {
      // 导出接口
      let v = this;
      v.axios.post(api.export_SupplementTrackingNumber, params).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('导出成功');
        }
      });
    },
    getTrackingNumber(params) {
      let v = this;
      // 获取运单号接口
      params.warehouseId = v.getWarehouseId();
      return new Promise((resolve, reject) => {
        v.axios.post(api.get_againGetTrackingNumber, params).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.getList();
            resolve();
          }
        });
      });
    },
    reset() {
      let v = this;
      v.searchParams = {
        endDespatchTime: null, // 发货结束时间 ,
        hasTrackingNum: 0, // 是否有运单号,1是0无 null全部 ,
        merchantShippingMethodIdList: [],
        orderBy: 'despatchTime', // 排序方式 出库时间:despatchTime 创建时间createdTime 默认despatchTime ,
        orderNo: '',
        packageCodes: [],
        pageNum: 1,
        pageSize: 50,
        platformId: null,
        saleAccountId: null,
        saleAccountIds: [],
        salesRecordNumber: null,
        searchValue: '',
        startDespatchTime: null,
        upDown: 'up', // 升降 升:up 降down 默认降序 ,
        warehouseId: v.getWarehouseId() // 仓库流水号
      };
      v.payTimeArr = [];
    },
    getList() {
      let v = this;
      if (!v.getPermission('packageInfo_queryForSupplementTrackingNumber')) {
        v.gotoError();
        v.$Message.error('无权限');
        return;
      }
      v.searchParams.pageSize = this.getPageSizeCache();
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_queryForSupplementTrackingNumber, v.searchParams).then(response => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (response.data.code === 0) {
          v.datas = response.data.datas.list;
          v.total = response.data.datas.total;
        }
      });
    },
    showPackageDetails(packageCode, detail) {
      this.packageCode = packageCode;
      this.workShow = detail;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.upDown = type;
      this.searchParams.orderBy = feild;
      this.search();
    },
    search() {
      let v = this;
      v.searchParams.pageNum = 1;
      v.getList();
      v.getAllShipMethod();
    },
    resetDate() {
      let v = this;
      v.searchParams.startDespatchTime = '';
      v.searchParams.endDespatchTime = '';
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.searchParams.startDespatchTime = v.$uDate.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.searchParams.endDespatchTime = v.$uDate.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.getList();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      this.getList();
    }, // 获取所有的邮寄方式
    getAllShipMethod() {
      let v = this;
      let obj = JSON.parse(JSON.stringify(this.searchParams));
      delete obj.pageSize;
      delete obj.pageNum;
      v.axios.post(api.get_chooseShippingMethodOnSupTkNum, obj).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          var data = res.data.datas;
          data.forEach(val => {
            val.title = val.logisticsDealerName === null ? '未指定物流商' : val.logisticsDealerName;
            val.code = val.logisticsDealerCode;
            val.logisticsDealerCode = val.logisticsDealerCode;
            val.expand = true;
            val.queryMailResultList.forEach(val2 => {
              val2.logisticsDealerCode = val.logisticsDealerCode;
              val2.title = val2.logisticsMailName === null ? '未指定邮寄方式' : val2.logisticsMailName;
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
          } else {
            this.treeData = [];
          }
        } else {
          this.treeData = [];
        }
      });
    }, // 展开与收起邮寄方式
    switchBtn() {
      this.upOrDown = !this.upOrDown;
    },
    switchOption(val) {
      this.upOrDown = val;
    }, // 选中的邮寄方式
    selectCheckBox(arr) {
      let paramsArr = arr.filter(item => {
        if (item.logisticsMailCode) {
          return item;
        }
      }).map(item => {
        return item.logisticsMailCode;
      });
      this.searchParams.merchantShippingMethodIdList = paramsArr.length > 0 ? paramsArr : null;
      this.search();
    }
  }
};
</script>
<style lang="less" scoped>
.additionalWaybillNo {
  height: 100%;
}

// .mt10 {
//   margin-top: 10px;
// }

.form-wid {
  width: 260px;
}

.wid-long {
  width: 100%;
}

.mr20 {
  margin-right: 20px;
}

.shipping_method {
  // width: 100%;
  flex: 1;
  position: relative;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;

  :deep(.ivu-tree .ivu-checkbox-wrapper) {
    display: inline-block;
  }

  .content_table {
    flex: 1;
    overflow: hidden;
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
