<template>
  <div>
    <Modal v-model="isVisible" title="批量上传文件" width="80%" :mask-closable="false" :closable="modalClose"
      class="mulUploadFilesPage formDetail">
      <div>
        <logisticsInfo ref="logisticsInfo" isEdit="edit" v-if="isVisible" />
        <div>
          <Alert type="error" style="display: inline-block; padding: 8px">
            注意：下面的出库单，共用一个物流单号一起发货，不是此物流单号的出库单，请删除后再操作
          </Alert>
        </div>
        <Form ref="tableForm" :model="formData" :label-width="0" class="fmb0">
          <Table highlight-row border :columns="columns" :data="formData.tableList" :loading="tableLoading"
            maxHeight="600" class="negativeDistance">
            <template slot-scope="{ index }" slot="fbaRemark">
              <FormItem label="" :prop="'tableList.' + index + '.fbaRemark'" style="padding: 4px 0">
                <Input v-model.trim="formData.tableList[index].fbaRemark" type="textarea" :rows="2" placeholder="请输入"
                  class="textarearesize"></Input>
              </FormItem>
            </template>
            <template slot-scope="{ index }" slot="packingRemark">
              <FormItem label="" :prop="'tableList.' + index + '.packingRemark'" style="padding: 4px 0">
                <Input v-model.trim="formData.tableList[index].packingRemark" type="textarea" :rows="2" placeholder="请输入"
                  class="textarearesize" maxlength="200" show-word-limit></Input>
              </FormItem>
            </template>
            <template slot-scope="{ row, index }" slot="invoiceEdit">
              <div v-for="(item, cindex) in row.invoiceList" :key="cindex">
                <div class="dispalyFlex alignCenter flexWrap" style="padding: 6px 0" v-if="cindex === 0">
                  <div class="mr10">
                    <span>平台发货单号：</span>
                    <Input v-model="formData.tableList[index].invoiceList[cindex]
                        .dispatchOrderNo
                      " maxlength="50" style="width: 120px" />
                  </div>
                  <dyt-loadingText :loading="item.getExcelLoading" :disabled="!Boolean(item.dispatchOrderNo)"
                    @click="getOrderFile(index, cindex)" class="mr10"
                    title="输入内容不为空，tumu与shein平台主体，“获取文件”按纽可用">获取文件</dyt-loadingText>
                  <dyt-loadingText :loading="item.uploadLoading"
                    @click="uploadFile(index, cindex)">上传新文件</dyt-loadingText>
                </div>
                <div class="dispalyFlex excelMain flexWrap" style="padding: 6px 0">
                  <span><span style="color: red">*</span> 发货单文件：</span>
                  <div class="dispalyFlex excelList">
                    <div v-for="(fItem, fIndex) in item.defaultList" :key="fIndex" class="dispalyFlex excelItem">
                      <span class="linkText cursorClick" @click="previewWashedPdf(fItem)">{{ fItem.name }}</span>
                      <Icon type="md-close" class="closeIcon" @click="delExcel(index, cindex, fIndex)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template slot-scope="{ index }" slot="operator">
              <span class="unlinkText cursorClick" style="color: red" @click="confirmDetele(index)">删除</span>
            </template>
          </Table>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submitProblem" :loading="saveLoading">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>

    <!-- 上传文件 -->
    <dytUpload v-show="false" :action="uploadInfo.uploadApi" :format="uploadInfo.format" :name="uploadInfo.name"
      :headers="headObj" :maxSize="uploadInfo.maxSize" :show-upload-list="uploadInfo.showUploadList"
      :multiple="uploadInfo.multiple" :on-success="handleSuccess" :on-error="handleError" :on-format-error="formatError"
      :on-exceeded-size="exceededSize" :before-upload="handleUpload" ref="uploadExcel">
      <Button class="uploadFile">上传文件</Button>
    </dytUpload>
  </div>
</template>

<script>
import api from "@/api/api";
import {
  arrayToObj,
  statusReturn,
  outListTypeList,
  orderTypeList,
} from "./fileData";
import tableImg_mixin from "@/components/mixin/tableImg_mixin";
import permission_mixin from "@/components/mixin/permission_mixin";
import logisticsInfo from "./logisticsInfo";
export default {
  name: "mulUploadFiles",
  mixins: [permission_mixin, tableImg_mixin],
  components: { logisticsInfo },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modalData: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    let v = this;
    return {
      isVisible: false,
      formData: {
        tableList: [],
      },
      platformList: arrayToObj(outListTypeList),
      orderTypeList: arrayToObj(orderTypeList),
      columns: [
        {
          title: "出库单",
          align: "left",
          minWidth: 200,
          render: (h, { row }) => {
            let pickingItem = statusReturn(row.pickingNewStatus);
            let platformItem = this.platformList[row.platformType] || {};
            let list = [
              h(
                "div",
                {
                  style: {
                    padding: "4px 0",
                  },
                },
                [
                  h("span", "单号："),
                  h(
                    "span",
                    {
                      on: {
                        click: () => {
                          if (!power) return;
                          v.seeDetail(row, "detail");
                        },
                      },
                    },
                    row.pickingNo
                  ),
                ]
              ),
            ];
            if (pickingItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "green" },
                    attrs: { title: "出库单状态" },
                  },
                  pickingItem.label
                )
              );
            }
            if (platformItem.label) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "magenta" },
                    attrs: { title: "平台主体" },
                  },
                  platformItem.label
                )
              );
            }
            if (row.saleAccount) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: "purple" },
                    attrs: { title: "店铺" },
                  },
                  row.saleAccount
                )
              );
            }
            if (v.orderTypeList[row.orderType]) {
              list.push(
                h(
                  "Tag",
                  {
                    props: { color: row.orderType == 1 ? "red" : "blue" },
                    attrs: { title: "订单类型" },
                  },
                  v.orderTypeList[row.orderType].label
                )
              );
            }
            return h(
              "div",
              {
                style: {
                  padding: "4px 0",
                },
              },
              list
            );
          },
        },
        {
          title: "图片",
          align: "left",
          width: 80,
          render: (h, params) => {
            return v.tableImg(h, params.row.goodsUrl);
          },
        },
        {
          title: "SKU数量",
          align: "left",
          width: 80,
          key: "skuNumber",
        },
        {
          title: "商品数量",
          align: "left",
          width: 80,
          key: "allExpectedNumber",
        },
        {
          title: "备注",
          minWidth: 100,
          align: "left",
          slot: "fbaRemark",
          renderHeader(h, params) {
            return h(
              "div",
              {
                style: {
                  color: "#19be6b",
                },
              },
              "备注"
            );
          },
        },
        {
          title: "装箱备注",
          align: "left",
          minWidth: 120,
          slot: "packingRemark",
          renderHeader(h, params) {
            return h(
              "div",
              {
                style: {
                  color: "#19be6b",
                },
              },
              "装箱备注"
            );
          },
        },
        {
          title: "发货单文件",
          slot: "invoiceEdit",
          align: "left",
          minWidth: 360,
        },
        {
          title: "操作",
          slot: "operator",
          align: "left",
          width: 70,
        },
      ],
      tableLoading: false, // 表格加载
      saveLoading: false, // 表单提交加载
      uploadInfo: {
        uploadApi: api.fullManage_uploadBoxLabel,
        format: [
          "jpg",
          "jpeg",
          "png",
          "pdf",
          "xls",
          "xlsx",
          "xlsm",
          "doc",
          "docx",
        ],
        name: "files",
        showUploadList: false,
        multiple: true,
        maxSize: 5120,
        tableIndex: null, // 表格行数
        invoiceIndex: null, // 当前选中的行数据
        uploadNum: 0, // 用来计数
        defaultInvoice: {},
      },
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.getDetail();
      this.isVisible = true;
    },
    resetData() {
      this.formData.tableList = [];
    },
    // 获取出库单详情数据
    getDetail() {
      let list = this.modalData.map((k) => k.pickingId);
      this.tableLoading = true;
      this.axios
        .post(api.fullManage_queryDispatchOrderFileInfoList, list)
        .then(({ data }) => {
          if (data.code !== 0) return;
          let tableList = (data.datas || []).map((k) => {
            k.invoiceList = (k.dispatchOrderFileList || []).map((k) => {
              let nameList = k.originalFileName
                ? k.originalFileName.split(",")
                : [];
              let urlList = k.targetFileUrl ? k.targetFileUrl.split(",") : [];
              let defaultList = [];
              urlList.forEach((item, key) => {
                if (nameList[key] && item) {
                  defaultList.push({
                    name: nameList[key],
                    url: item,
                  });
                }
              });
              k.defaultList = defaultList;
              k.uploadLoading = false;
              k.getExcelLoading = false;
              return k;
            });
            return k;
          });
          this.formData.tableList = tableList;
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 提交
    async submitProblem() {
      let logisticsData = await this.$refs.logisticsInfo.handleForm();
      if (!logisticsData.valid) return;
      let tableList = this.formData.tableList;
      if (!tableList.length) {
        this.$Message.error("出库单为空!");
        return;
      }
      let [list, flag] = [[], false];
      tableList.forEach((tk) => {
        let arr = ["packingRemark", "fbaRemark", "pickingId"];
        let temp = Object.assign({}, logisticsData.data);
        arr.forEach((ak) => {
          temp[ak] = tk[ak];
        });
        let item = tk.invoiceList[0] || {};
        let fileArr = ["dispatchOrderNo", "dispatchOrderFileId"];
        fileArr.forEach((fk) => {
          temp[fk] = item[fk];
        });
        let [nameList, urlList] = [[], []];
        item.defaultList.forEach((k) => {
          nameList.push(k.name);
          urlList.push(k.url);
        });
        if (!urlList.length) flag = true;
        temp.originalFileName = nameList.join(",");
        temp.targetFileUrl = urlList.join(",");
        list.push(temp);
      });
      // console.log(list, flag);
      if (flag) {
        this.$Message.error("发货单文件不能为空!");
        return;
      }
      this.saveLoading = true;
      this.axios
        .post(api.fullManage_batchUpdate, list)
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success("操作成功");
          this.isVisible = false;
          this.$emit("backReturnList");
        })
        .finally(() => {
          this.saveLoading = false;
        });
    },
    confirmDetele(index) {
      this.formData.tableList.splice(index, 1);
    },
    // 获取发货文件
    getOrderFile(index, cindex) {
      let item = this.formData.tableList[index] || {};
      let row = item.invoiceList[cindex] || {};
      let temp = [
        {
          dispatchOrderFileId: row.dispatchOrderFileId,
          dispatchOrderNo: row.dispatchOrderNo,
          pickingId: row.pickingId,
        },
      ];
      row.getExcelLoading = true;
      this.axios
        .put(api.fullManage_updateDispatchOrderFile, temp)
        .then(() => {
          this.axios
            .post(api.fullManage_getDispatchOrderFile + row.dispatchOrderFileId)
            .then((res) => {
              if (res.data.code === 0) {
                this.getDetail();
              }
            })
            .finally(() => {
              row.getExcelLoading = false;
            });
        })
        .catch(() => {
          row.getExcelLoading = false;
        });
    },
    // 点击上传的文件，PDF文件可以直接查看与打印；图片文件，word文件，excel文件可以下载到本地；
    previewWashedPdf(k) {
      if (!k.url) return;
      let pointList = k.url.split(".");
      let str = pointList[pointList.length - 1];
      let url = `./filenode/s${k.url}`;
      if (str === "pdf") {
        this.axios.get(url, { responseType: "blob" }).then((res) => {
          this.$common.blobToBase64(res.data || res.resData).then((data) => {
            const fileBold = this.$common.base64ToBlob(data, "application/pdf");
            this.$common.previewFile(fileBold);
          });
        });
      } else {
        window.open(url);
      }
    },
    // 点击上传文件
    uploadFile(index, cindex) {
      this.uploadInfo.tableIndex = index;
      this.uploadInfo.invoiceIndex = cindex;
      this.uploadInfo.uploadNum = 0;
      let dom = document.querySelector(".uploadFile");
      dom.click();
    },
    uploadRow(val) {
      let uploadInfo = this.uploadInfo;
      let item = this.formData.tableList[uploadInfo.tableIndex] || {};
      let row = item.invoiceList[uploadInfo.invoiceIndex] || {};
      row.uploadLoading = val;
    },
    // 上传文件之前的钩子 若返回 false 或者 Promise 则停止上传
    handleUpload() {
      this.uploadRow(true);
    },
    handleSuccess(response, file, fileList) {
      this.uploadInfo.uploadNum++;
      let uploadInfo = this.uploadInfo;
      if (fileList.length > uploadInfo.uploadNum) return;
      this.$refs.uploadExcel.clearFiles();
      let [nameList, urlList] = [[], []];
      let item = this.formData.tableList[uploadInfo.tableIndex] || {};
      let row = item.invoiceList[uploadInfo.invoiceIndex] || {};
      // 将新数据放入
      fileList.forEach((fk) => {
        let data = fk.response.datas || {};
        Object.keys(data).forEach((k) => {
          nameList.push(k);
          urlList.push(data[k]);
        });
      });
      // 将原数据也放入
      row.defaultList.forEach((k) => {
        nameList.push(k.name);
        urlList.push(k.url);
      });
      // 保存信息
      let temp = [
        {
          dispatchOrderFileId: row.dispatchOrderFileId,
          dispatchOrderNo: row.dispatchOrderNo,
          pickingId: row.pickingId,
          originalFileName: nameList.join(","),
          targetFileUrl: urlList.join(","),
        },
      ];
      this.axios
        .put(api.fullManage_updateDispatchOrderFile, temp)
        .then(({ data }) => {
          if (data.code !== 0) return;
          fileList.forEach((fk) => {
            let data = fk.response.datas || {};
            Object.keys(data).forEach((k) => {
              row.defaultList.push({
                name: k,
                url: data[k],
              });
            });
          });
          // this.getDetail();
        })
        .finally(() => {
          this.uploadRow(false);
        });
    },
    handleError(error, file, fileList) {
      this.$Message.error("上传失败");
      this.uploadRow(false);
    },
    // 格式错误回调
    formatError(file, fileList) {
      this.$Message.warning(
        "上传的文件可以是：pdf文件，图片文件，word文件，excel文件!"
      );
      this.uploadRow(false);
    },
    // 文件超出指定大小限制时的钩子
    exceededSize(file, fileList) {
      this.$Message.warning("上传的文件大小不能超过5M");
      this.uploadRow(false);
    },
    // 删除文件
    delExcel(index, cindex, fIndex) {
      let item = this.formData.tableList[index] || {};
      let row = item.invoiceList[cindex] || {};
      row.defaultList.splice(fIndex, 1);
      let [nameList, urlList] = [[], []];
      row.defaultList.forEach((k, key) => {
        nameList.push(k.name);
        urlList.push(k.url);
      });
      // 保存信息
      let temp = [
        {
          dispatchOrderFileId: row.dispatchOrderFileId,
          dispatchOrderNo: row.dispatchOrderNo,
          pickingId: row.pickingId,
          originalFileName: nameList.join(","),
          targetFileUrl: urlList.join(","),
        },
      ];
      this.tableLoading = true;
      this.axios
        .put(api.fullManage_updateDispatchOrderFile, temp)
        .then((res) => {
          if (res.data.code === 0) {
            // this.getDetail();
          }
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
.mulUploadFilesPage {
  .tips {
    color: #8f8a8a;
    line-height: 14px;
    font-size: 12px;
    padding-top: 4px;
  }
  .excelMain,
  .excelList {
    flex: 1;
    overflow: hidden;
  }

  .excelList {
    flex-wrap: wrap;
  }

  .excelItem:not(:last-child) {
    margin-right: 10px;
  }

  .closeIcon {
    font-size: 20px;
    color: #ed4014;
    font-weight: bold;
    cursor: pointer;
    margin-left: 2px;
  }

  .textarearesize .ivu-input {
    resize: none;
  }
}
</style>