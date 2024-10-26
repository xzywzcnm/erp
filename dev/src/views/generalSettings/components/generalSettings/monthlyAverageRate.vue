<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformSearch clear">
            <Form
              ref="pageParams"
              :model="pageParams"
              label-position="left"
              :label-width="40"
            >
              <dyt-filter :filter-row="1">
                <!-- <Form-item label="日期:" prop="searchValue">
                  <DatePicker type="month" placeholder="请选择" transfer style="width: 100px"
                    v-model="pageParams.startTime" @on-change="changeStartTime"></DatePicker>
                  <span class="ml10 mr10">至</span>
                  <DatePicker type="month" placeholder="请选择" transfer style="width: 100px" v-model="pageParams.endTime"
                    @on-change="changeEndTime"></DatePicker>
                </Form-item> -->
                <Form-item
                  label="截止日期:"
                  prop="endTime"
                  :label-width="65"
                >
                  <DatePicker
                    type="month"
                    placeholder="请选择"
                    transfer
                    style="width: 100px"
                    v-model="pageParams.endTime"
                  ></DatePicker>
                </Form-item>
                <Form-item label="币种代码:" :label-width="80" prop="currency">
                  <dyt-select v-model="pageParams.currency">
                    <Option
                      v-for="(item, index) in currList"
                      :key="index"
                      :value="item.targetCurrencyCode"
                      :label="item.targetCurrencyCode"
                    ></Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="币种名称:" :label-width="80" prop="currencyName">
                  <Input v-model="pageParams.currencyName"></Input>
                </Form-item>
                <div slot="operation">
                  <Button
                    type="primary"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="md-search"
                    >查询
                  </Button>
                  <Button class="ml10" v-once icon="md-refresh" @click="reset"
                    >重置
                  </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="normalPadding" style="display: flex">
      <div style="flex: 100">
        <Button
          type="primary"
          @click="openExportModal"
          v-if="getPermission('monthlyAverageRate_export')"
        >
          导出
        </Button>
        <Button
          type="primary"
          @click="importData"
          class="ml20"
          v-if="getPermission('monthlyAverageRate_import')"
        >
          导入历史月平均汇率
        </Button>
        <span
          style="
            border: 1px solid #baeafd;
            font-size: 13px;
            margin-left: 20px;
            background-color: #e4f7fe;
            padding: 5px 10px;
          "
          >每天22：00，计算与更新当月的平均汇率，系统月平均汇率从2020-01月份开始，截止月份不能小于2020-12</span
        >
      </div>
      <!-- <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <Button @click="columnSetting">
          <Icon type="md-settings" style="font-size:16px" />
          自定义列设置
        </Button>
      </div> -->
    </div>
    <div class="normalPadding normalTop">
      <Table
        highlight-row
        border
        :loading="tableLoading"
        :height="tableHeight"
        :columns="columns"
        :data="tableData"
        ref="tableData"
      ></Table>
      <!-- <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize"
            :current="pageParams.pageNum" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div> -->
    </div>
    <!-- <Modal v-model="modalView" title="自定义列设置" @on-ok="columnConfirm" @on-cancel="modalView = false" width='360'>
      <Table highlight-row border :loading="tableLoading" :height="tableHeight" :columns="column2" :data="currencyData" width='320' @on-selection-change="selectionChange"></Table>
    </Modal> -->
    <Modal
      v-model="importModal"
      title="导入历史月平均率"
      :loading="loading"
      width="40%"
    >
      <div class="flexBox line32">
        <p style="flex-shrink: 0">选择导入文件：</p>
        <div>
          <dytUpload
            ref="importUpload"
            name="excel"
            :action="uploadFiles"
            :headers="headObj"
            :data="uploadData"
            :before-upload="handleUpload"
            :show-upload-list="false"
            :on-success="handleSuccess"
            :on-format-error="handleFormatError"
            :format="['xlsx']"
          >
            <Button>选择文件</Button>
          </dytUpload>
        </div>
        <span @click="loadTemplate" style="cursor: pointer; margin-left: 20px"
          >下载模板</span
        >
      </div>
      <div style="max-width: 360px; margin-top: 20px">
        上传文件：
        <span v-if="file">{{ file.name }}</span>
      </div>
      <div class="mt10">
        导入的币种与月份一致时：
        <RadioGroup v-model="uploadData.isCover">
          <Radio label="1">覆盖</Radio>
          <Radio label="0">忽略</Radio>
        </RadioGroup>
      </div>
      <div class="flexBox mt10">
        <div style="flex-shrink: 0">提示：</div>
        <div>
          <p>1、最早的月份不能小于2020-01,最大的月份不能大于当月；</p>
          <p>2、导入的币种不能不在初始化的31个币种当中；</p>
          <p>
            3、当月的平均率会每天计算与更新,将会覆盖导入的当月平均汇率数据；
          </p>
        </div>
      </div>
      <div slot="footer">
        <Button @click="confirm" type="primary">确定</Button>
        <Button @click="importModal = false">取消</Button>
      </div>
    </Modal>
    <!-- 导出 -->
    <Modal
      v-model="exportModal"
      title="导出"
      width="500"
    >
      <Form
        class="modal-edit-form"
        ref="modalForm"
        :model="formData"
        :rules="formRule"
        :label-width="100"
        label-position="right"
      >
        <Form-item label="导出月份" prop="startTime" class="export-modal-time">
          <DatePicker
            style="width: 150px;"
            type="month"
            placeholder="请选择起始月份"
            transfer
            format="yyyy-MM"
            v-model="formData.startTime"
            :options="startOptions"
            @on-change="startChange"
          />
        </Form-item>
        <Form-item label="" :label-width="0" class="export-modal-time ml5">
          至
        </Form-item>
        <Form-item label="" prop="endTime" :label-width="0" class="export-modal-time">
          <DatePicker
            style="margin-left: 5px; width: 150px;"
            type="month"
            placeholder="请选择截止月份"
            format="yyyy-MM"
            transfer
            v-model="formData.endTime"
            :options="endOptions"
          />
        </Form-item>
        <Spin fix v-if="exportLoading"></Spin>
      </Form>
      <div slot="footer">
        <Button @click="exportModal = false">取消</Button>
        <Button @click="confirmExport" type="primary" :loading="exportLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Mixin from "@/components/mixin/common_mixin";
import { downFile, getNowMonth } from "@/utils/comConfig.js";
export default {
  components: {},
  mixins: [Mixin],
  data() {
    return {
      tableHeight: 500,
      loading: true,
      total: 0,
      exportModal: false,
      exportLoading: false,
      formData: {
        startTime: '',
        endTime: ''
      },
      formRule: {
        startTime: [
          { required: true, message: '请选择起始月份', trigger: 'change', type: 'date' }
        ],
        endTime: [
          { required: true, message: '请选择截止月份', trigger: 'change', type: 'date' }
        ]
      },
      startOptions: {
        disabledDate: (date) => {
          const nowTime = new Date();
          const currentTime = new Date(date);
          if (nowTime.getFullYear() > currentTime.getFullYear()) return false;
          if (nowTime.getFullYear() == currentTime.getFullYear()) return nowTime.getMonth() < currentTime.getMonth();
          return true;
        }
      },
      endOptions: {
        disabledDate: (date) => {
          const nowTime = new Date();
          const startTime = this.$common.isEmpty(this.formData.startTime) ? new Date() : new Date(this.formData.startTime);
          const currentTime = new Date(date);
          if (currentTime.getFullYear() < startTime.getFullYear() || currentTime.getFullYear() > nowTime.getFullYear()) return true;
          if (currentTime.getFullYear() == startTime.getFullYear() && currentTime.getFullYear() == nowTime.getFullYear()) {
            return !(currentTime.getMonth() >= startTime.getMonth() && currentTime.getMonth() <= nowTime.getMonth());
          }
          if (currentTime.getFullYear() > startTime.getFullYear()) {
            if (nowTime.getFullYear() > currentTime.getFullYear()) return false;
            return nowTime.getMonth() < currentTime.getMonth();
          }
          if (currentTime.getFullYear() == startTime.getFullYear()) {
            return startTime.getMonth() > currentTime.getMonth();
          }
          return true;
        }
      },
      // curPage: 1,
      pageParams: {
        // 参数
        endTime: getNowMonth(),
        currency: null,
        currencyName: null,
        // pageNum: 1,
        // pageSize: 20
      },
      columns: [
        {
          title: "代码",
          width: "80px",
          key: "currency",
        },
        {
          title: "符号",
          width: "80px",
          key: "currencySymbol",
        },
        {
          title: "名称",
          key: "currencyName",
        },
      ],
      paypalData: [], // 表格数据
      currencyData: [], // 列设置表格
      modalView: false,
      currencyList: [], // 币种list
      currList: [],
      tableData: [],
      importModal: false,
      importModalStatus: false,
      uploadFiles: "/setting-service/exchangeRate/importMonthAverageRate",
      uploadData: {
        // 导入请求的参数
        isCover: "1",
      },
      file: null, // 导入文件
      confirmUpload: false, // 导入状态
      importStatus: false, // 导入过就不再标红
    };
  },
  watch: {},
  activated() {},
  methods: {
    // 获取currency数据
    columnSetting() {
      this.axios
        .get("/setting-service/exchangeRate/getRateInfo")
        .then((res) => {
          this.currencyData = res.data.datas;
          // 是否进行过缓存
          if (localStorage.getItem("__currencyList__") == null) {
            this.currencyData.forEach((itema) => {
              itema._checked = true;
            });
          } else {
            this.currencyData.forEach((itema) => {
              this.currencyList.forEach((itemb) => {
                if (itema.targetCurrencyCode == itemb) {
                  itema._checked = true;
                }
              });
            });
          }
        });
      this.modalView = true;
    },
    // select的事件
    selectionChange(val) {
      this.currencyList = val.map((item) => {
        return item.targetCurrencyCode;
      });
    },
    getFilter () {
      let pageParams = this.$common.copy(this.pageParams);
      pageParams.endTime = this.$common.toLocaleDate(pageParams.endTime, 'YYYY-MM', 0);
      return pageParams;
    },
    // 查询
    search() {
      if (!this.getPermission("monthlyAverageRate_query")) {
        return this.$Message.warning("没权限");
      }
      this.axios.post("/setting-service/exchangeRate/getMonthAverageRate", this.getFilter()).then((res) => {
        this.total = res.data.datas.total;
        let list = res.data.datas;
        if (!list.length) {
          this.tableData = [];
          return;
        }

        let columnsList = list[0].currencyRateInfo.split(",").map((item) => {
          return item.split("_")[1];
        });
        this.columns = [
          {
            title: "代码",
            width: "80px",
            key: "currency",
          },
          {
            title: "符号",
            width: "80px",
            key: "currencySymbol",
          },
          {
            title: "名称",
            key: "currencyName",
          },
        ];
        // 往列添加日期
        columnsList.forEach((item) => {
          this.columns.push({
            title: item,
            key: item,
            render: (h, params) => {
              return h(
                "span",
                {
                  style: {
                    color:
                        params.row[item] == 0 && !this.importStatus
                          ? "#ff001d"
                          : "",
                  },
                },
                params.row[item]
              );
            },
          });
        });
        // 在tabledata增添数据
        list.forEach((itema) => {
          itema.exchangeRateApiBaseList.forEach((itemb) => {
            itema[itemb.obtainTime] = itemb.rate;
          });
        });
        this.tableData = list;
      });
    },
    // 自定义列设置确认
    columnConfirm() {
      this.columns = [
        {
          title: "日期",
          key: "obtainTime",
          // width: 150
          minWidth: 90,
        },
      ];
      this.currencyList.forEach((item) => {
        this.columns.push({ title: item, key: item, minWidth: 90 });
      });
      localStorage.setItem("__currencyColumn__", JSON.stringify(this.columns));
      localStorage.setItem(
        "__currencyList__",
        JSON.stringify(this.currencyList)
      );
    },
    reset () {
      this.$refs.pageParams && this.$refs.pageParams.resetFields();
    },
    // 导出开始时间改变时
    startChange (val) {
      if (this.$common.isEmpty(this.formData.endTime)) return;
      const startTime = new Date(val);
      const currentTime = new Date(this.formData.endTime);
      if (currentTime.getFullYear() < startTime.getFullYear()) {
        this.formData.endTime = '';
        return;
      }
      if (currentTime.getFullYear() == startTime.getFullYear() && currentTime.getMonth() < startTime.getMonth()) {
        this.formData.endTime = '';
      }
    },
    openExportModal () {
      this.$refs.modalForm && this.$refs.modalForm.resetFields();
      this.$nextTick(() => {
        this.exportModal = true;
      })
    },
    // 确认导出
    confirmExport () {
      if (this.exportLoading) return;
      this.$refs.modalForm.validate((valid) => {
        if (!valid) return;
        this.exportLoading = true;
        let temp = {
          endTime: this.$common.toLocaleDate(new Date(this.formData.endTime).getTime(), 'YYYY-MM', 0),
          startTime: this.$common.toLocaleDate(new Date(this.formData.startTime).getTime(), 'YYYY-MM', 0),
          // currency: this.pageParams.currency,
          // currencyName: this.pageParams.currencyName,
        };
        this.axios({
          method: "post",
          url: "/setting-service/exchangeRate/exportMonthAverageRate",
          data: temp,
          responseType: "blob",
          timeout: 600000,
        }).then(({ resData, filename }) => {
          this.$Message.success("正在导出...");
          downFile(resData, filename);
          this.exportModal = false;
        }).finally(() => {
          this.exportLoading = false;
        });
      })
    },
    getCurrencyList() {
      this.axios
        .get("/setting-service/exchangeRate/getRateInfo")
        .then((res) => {
          this.currList = res.data.datas;
        });
    },
    // 换页数
    changePage(page) {
      this.loading = true;
      this.pageParams.pageNum = page;
      this.search();
    },
    // 换页码
    changePageSize(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.search();
    },
    importData() {
      this.importModal = true;
      this.file = null;
    },
    // 导入成功
    handleSuccess() {
      this.$Message.success("导入成功");
    },
    // 上传失败
    handleFormatError() {
      this.$Message.error("文件格式有误");
    },
    // 上传文件
    handleUpload(file) {
      this.file = file;
      return this.confirmUpload;
    },
    // 确认
    confirm() {
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.importUpload.upload(this.file);
        this.search();
        this.importModal = false;
        this.importStatus = true;
      } else {
        this.$Message.error("请选择文件");
      }
    },
    // 下载模版
    loadTemplate() {
      window.open(
        "/setting-service/./filenode/s/setting-service/template/monthAverageExchangeRate_importTemplate.xlsx"
      );
    },
  },
  created() {
    this.tableHeight = this.getTableHeight(320);
  },

  mounted() {
    // if (localStorage.getItem('__currencyColumn__') != null) {
    //   this.columns = JSON.parse(localStorage.getItem('__currencyColumn__'));
    // }
    // if (localStorage.getItem('__currencyList__') != null) {
    //   this.currencyList = JSON.parse(localStorage.getItem('__currencyList__'));
    // }
    this.search();
    this.getCurrencyList();
  },
};
</script>

<style lang='less' scoped>
.card-content {
  padding: 10px 20px 10px 20px;
}
.export-modal-time{
  display: inline-block;
}
:deep(.ivu-form) {
  .ivu-form-item-label {
    text-align: right;
  }
}
</style>
