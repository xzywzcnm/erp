<template>
  <div class="warehouseConfirm">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" inline :label-width="80">
          <FormItem label="入仓状态:" class="ignore-width">
            <RadioGroup
              v-model="searchParams.warehousingStatus"
              type="button"
              button-style="solid"
              @on-change="search"
            >
              <Radio
                :label="item.value"
                v-for="(item, index) in wareStatusList"
                :key="index"
                >{{ item.label }}</Radio
              >
            </RadioGroup>
          </FormItem>
          <dyt-filter
            :filter-row="1"
            @operation="operation"
            ref="dyt-filter"
            @expand="expand"
          >
            <FormItem label="出库单编号:">
              <dyt-inputTag
                v-model="searchParams.pickingNo"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="参考编号:">
              <dyt-inputTag
                v-model="searchParams.referenceNo"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="发货时间:">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="sendTimeChange"
                :value="[
                  searchParams.beginDeliveryTime,
                  searchParams.endDeliveryTime,
                ]"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="入仓时间:">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="createTimeChange"
                :value="[
                  searchParams.beginWarehousingTime,
                  searchParams.endWarehousingTime,
                ]"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="店铺:">
              <dyt-input v-model="searchParams.account" />
              <!-- <dyt-select v-model="searchParams.account" multiple :max-tag-count="1">
                <Option v-for="(talg) in accountList" :value="talg.saleAccountId" :label="talg.accountCode"
                  :key="talg.saleAccountId"></Option>
              </dyt-select> -->
            </FormItem>
            <FormItem label="物流商单号:">
              <dyt-inputTag
                v-model="searchParams.carrierCodeList"
                :limit="1"
                type="textarea"
              />
            </FormItem>
          </dyt-filter>
        </Form>
      </div>
      <!-- 功能 -->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button
              type="primary"
              @click="openImportModal"
              v-if="getPermission('importWarehousingConfirmation')"
              >导入</Button
            >
            <Button
              type="primary"
              v-if="getPermission('wmsWarehousingConfirmation_export')"
              @click="exportExcel"
              class="ml10"
              >导出所有</Button
            >
            <Button
              type="primary"
              @click="markComplete()"
              class="ml10"
              :disabled="markDisabled"
              v-if="getPermission('warehousing_confirmFinish')"
              >标记入仓完成</Button
            >
          </div>
          <div>
            <dyt-sortBySelect
              :sortButtonList="sortButtonList"
              @sortInfo="getSortInfoAndFetch(arguments)"
            >
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!-- 表格 -->
      <div class="tableMain">
        <div class="tableBox">
          <Table
            border
            highlight-row
            ref="selection"
            :columns="columns"
            :loading="tableLoading"
            :data="tableList"
            :height="tableHeight"
            @on-selection-change="tableSelectChange"
          >
            <template slot-scope="{ row }" slot="pickingNo">
              <a href="javascript:;" @click="confirmDetail(row, 2)">{{
                row.pickingNo
              }}</a>
            </template>
            <template slot-scope="{ row }" slot="pickingType">
              <div v-for="item in outListTypeList" :key="item.value">
                {{ row.pickingType === item.value ? item.label : "" }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="account">
              <!-- <div v-for="item in accountList" :key="item.value">
                {{ row.pickingType === item.value ? item.label : '' }}
              </div> -->
              <div>{{ row.account || "" }}</div>
            </template>
            <template slot-scope="{ row }" slot="deliveryTime">
              <div v-if="row.deliveryTime">
                {{ $uDate.dealTime(row.deliveryTime).slice(0, 10) }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="warehousingTime">
              <div v-if="row.warehousingTime">
                {{ row.warehousingTime.slice(0, 10) }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="transportMethod">
              <div
                v-for="item in shippingList"
                :key="item.value + 'shippingList'"
              >
                {{ row.transportMethod === item.value ? item.label : "" }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="warehousingStatus">
              <div
                v-for="item in wareStatusList"
                :key="item.value + 'wareStatusList'"
              >
                {{ row.warehousingStatus === item.value ? item.label : "" }}
              </div>
            </template>
            <template slot-scope="{ row }" slot="action">
              <span v-if="row.warehousingStatus === '0'">
                <span
                  class="unlinkText cursorClick mr20"
                  v-if="getPermission('warehousing_warehouseConfirmation')"
                  @click="confirmDetail(row, 1)"
                  >入仓</span
                >
                <span
                  class="unlinkText cursorClick"
                  style="color: red"
                  v-if="getPermission('warehousing_confirmDelete')"
                  @click="confirmDetele(row)"
                  >删除</span
                >
              </span>
              <span v-if="row.warehousingStatus === '2'">
                <span
                  class="unlinkText cursorClick mr10"
                  v-if="getPermission('warehousing_confirmEdit')"
                  @click="confirmDetail(row, 3)"
                  >修改入仓</span
                >
                <span
                  class="unlinkText cursorClick"
                  v-if="getPermission('warehousing_confirmFinish')"
                  @click="markComplete(row)"
                  >标记入仓完成</span
                >
              </span>
            </template>
          </Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page
          :total="pageTotal"
          :current="searchParams.pageNum"
          :page-size="searchParams.pageSize"
          show-total
          show-sizer
          show-elevator
          @on-change="pageNumChange"
          @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"
        >
        </Page>
      </div>
    </div>
    <!-- 入仓详情 -->
    <confirm-detail
      :dialogVisible.sync="confirmDialog.dialogVisible"
      :titleType="confirmDialog.titleType"
      :confirmData="confirmDialog.data"
      @search="search"
    ></confirm-detail>
    <importTemp
      @getList="search"
      ref="importTemp"
      :actionUrl="actionUrl"
      :loadTemplateLocalApi="loadTemplateApi"
      :files="'files'"
    ></importTemp>
  </div>
</template>

<script>
import api from "@/api/api";
import fetch from "@/components/mixin/fetch";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";
import confirmDetail from "./confirmComponents/detail.vue";
import {
  outListTypeList,
  shippingList,
} from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
import importTemp from "@/components/common/importTemp2";
import Mixin from "@/components/mixin/common_mixin";
export default {
  name: "warehouseConfirm",
  mixins: [fetch, tableHeight_mixin, Mixin],
  components: { confirmDetail, importTemp },
  data() {
    return {
      searchParams: {
        warehousingOverseas: "",
        warehousingStatus: "",
        pickingNo: [],
        referenceNo: [],
        endWarehousingTime: "",
        beginWarehousingTime: "",
        endDeliveryTime: "",
        beginDeliveryTime: "",
        account: "", // 店铺
        carrierCodeList: [], // 物流商单号
        orderBy: "FH",
        orderSeq: "DESC",
        pageNum: 1,
        pageSize: 50,
      },
      resetOption: {
        // 重置不为空的条件
        warehousingOverseas: "",
        endDeliveryTime: "",
        beginDeliveryTime: "",
      },
      wareStatusList: [
        { label: "全部", value: "" },
        { label: "未入仓", value: "0" },
        { label: "入仓中", value: "2" },
        { label: "入仓完成", value: "1" },
      ],
      sortButtonList: [
        {
          sortHeader: "按发货时间",
          sortField: "FH",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按入仓时间",
          sortField: "RC",
          sortType: "DESC",
        },
      ],
      outListTypeList: outListTypeList, // 出库单类型
      shippingList: shippingList, // 运输方式
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "出库单编号",
          slot: "pickingNo",
          align: "center",
          minWidth: 120,
        },
        {
          title: "出库单类型",
          slot: "pickingType",
          align: "center",
          width: 100,
        },
        {
          title: "店铺",
          slot: "account",
          align: "center",
          minWidth: 120,
        },
        {
          title: "参考编号",
          align: "center",
          minWidth: 120,
          key: "referenceNo",
        },
        {
          title: "物流商单号",
          align: "center",
          minWidth: 120,
          key: "carrierCode",
        },
        {
          title: "发货时间",
          align: "center",
          width: 100,
          slot: "deliveryTime",
        },
        {
          title: "运输方式",
          align: "center",
          width: 90,
          slot: "transportMethod",
        },
        {
          title: "发货件数",
          key: "allQuantityShipped",
          align: "center",
          width: 90,
        },
        {
          title: "入仓时间",
          slot: "warehousingTime",
          align: "center",
          width: 100,
        },
        {
          title: "增值费CNY",
          key: "appreciationFee",
          align: "center",
          width: 100,
        },
        {
          title: "头程费用CNY",
          key: "headwayFee",
          align: "center",
          width: 114,
        },
        {
          title: "关税CNY",
          key: "tariffsFee",
          align: "center",
          width: 90,
        },
        {
          title: "入仓件数",
          key: "warehousingNumber",
          align: "center",
          width: 90,
        },
        {
          title: "差额件数",
          key: "sumDifferenceNumber",
          align: "center",
          width: 90,
        },
        {
          title: "入仓状态",
          slot: "warehousingStatus",
          align: "center",
          width: 90,
        },
        {
          title: "操作",
          align: "center",
          width: 170,
          fixed: "right",
          slot: "action",
        },
      ],
      confirmDialog: {
        data: {},
        titleType: 1,
        dialogVisible: false,
      },
      importUrl:
        "/wms-service/warehouseArrivalManagementImport/importWarehousingConfirmation",
      // loadTemplateApi: '/wms-service/template/工作簿1.xlsx',
      loadTemplateApi: "/wms-service/template/WarehousingImport.xlsx",
      actionUrl: "",
      accountList: [], // 店铺
    };
  },
  created() {
    this.getTime();
    this.fetch(
      api.queryOverseasWarehousing,
      "post",
      "warehousing_queryOverseasWarehousing"
    );
  },
  computed: {
    markDisabled() {
      let result = this.selectionList.filter(
        (k) => k.warehousingStatus !== "2"
      );
      return !!result.length;
    },
  },
  methods: {
    // 发货时间
    sendTimeChange(e) {
      this.searchParams.beginDeliveryTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchParams.endDeliveryTime = e[1] ? e[1] + " 23:59:59" : "";
    },
    // 入仓时间
    createTimeChange(e) {
      this.searchParams.beginWarehousingTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchParams.endWarehousingTime = e[1] ? e[1] + " 23:59:59" : "";
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(Info) {
      this.searchParams.orderSeq = Info[0] || "DESC";
      this.searchParams.orderBy = Info[1] || "FH";
      this.fetch();
    },
    // 导出
    exportExcel() {
      if (!this.tableList.length) {
        this.$Message.error("表格数据为空~");
        return;
      }
      this.$Modal.confirm({
        title: "导出所有",
        content:
          '异步导出所有行的列表数据，导出任务完成后，请使用"导出查看"的功能，下载导出文件',
        loading: true,
        onOk: () => {
          let temp = this.$common.copy(this.searchParams);
          let nullArr = [
            "beginWarehousingTime",
            "endWarehousingTime",
            "warehousingStatus",
          ];
          let deleteArr = ["pageNum", "pageSize"];
          Object.keys(temp).forEach((k) => {
            if (deleteArr.includes(k)) delete temp[k];
            if (nullArr.includes(k) && temp[k] === "") temp[k] = null;
          });
          temp = this.$common.removeEmpty(temp);
          this.axios
            .post(api.exportWarehousingConfirmation, temp)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("导出成功~");
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => {},
      });
    },
    // 入仓详情
    confirmDetail(row, type) {
      this.confirmDialog.data = row;
      this.confirmDialog.titleType = type;
      this.confirmDialog.dialogVisible = true;
    },
    // 发货时间：入仓管理单的参考编号，始时间默认值为：当天，终时间默认值为：前1个月的日期；
    getTime() {
      this.searchParams.warehousingOverseas =
        this.resetOption.warehousingOverseas = this.$store.state.warehouseId;
      const dayjs = this.$common.dayjs();
      let fun = () => {
        let temp = {};
        let arr = ["year", "month", "date", "hour", "minute", "second"];
        arr.forEach((k) => {
          temp[k] = dayjs.get(k);
        });
        return temp;
      };
      let temp = fun();
      this.searchParams.beginDeliveryTime =
        this.resetOption.beginDeliveryTime = `${temp.year}-${temp.month}-${temp.date} ${temp.hour}:${temp.minute}:${temp.second}`; // 上个月日期
      let month = temp.month >= 12 ? 0 : temp.month + 1;
      this.searchParams.endDeliveryTime =
        this.resetOption.endDeliveryTime = `${temp.year}-${month}-${temp.date} ${temp.hour}:${temp.minute}:${temp.second}`; // 取今天的日期
    },
    // 导入
    openImportModal() {
      this.actionUrl = `${this.importUrl}?warehouseId=${this.getWarehouseId()}`;
      this.$refs.importTemp.model1 = true;
    },
    // 标记完成
    markComplete(row) {
      let list = [];
      if (!row) {
        // 全部标记完成
        let selectionList = this.selectionList || [];
        if (!selectionList.length) return this.$Message.error("请勾选列表!");
        list = selectionList.map((k) => {
          return {
            pickingNo: k.pickingNo,
            warehousingStatus: k.warehousingStatus,
          };
        });
      } else {
        let { pickingNo, warehousingStatus } = row;
        list.push({ pickingNo, warehousingStatus });
      }
      this.$Modal.confirm({
        title: "确认是否要标记入仓完成？",
        content:
          '<p style="border: 1px solid #abdcff;background-color: #f0faff;padding: 8px;border-radius: 4px;color: #515a6e;font-size: 14px;line-height: 16px;">提示：标记入仓完成后，入仓费用与件数都不能修改；</p>',
        loading: true,
        width: 480,
        onOk: () => {
          this.axios
            .post(api.batchUpdateStatus, list)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功~");
              this.search();
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => {},
      });
    },
    // 删除
    confirmDetele(row) {
      this.$Modal.confirm({
        title: "操作提示",
        content: `确认是否要删除入仓单：<span style="color: #515a6e;"> ${row.pickingNo} </span>`,
        loading: true,
        width: 480,
        onOk: () => {
          this.axios
            .delete(api.deletePicking + row.pickingNo)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功~");
              this.search();
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => {},
      });
    },
  },
};
</script>

<style lang="less">
.warehouseConfirm {
  height: 100%;
}
</style>
