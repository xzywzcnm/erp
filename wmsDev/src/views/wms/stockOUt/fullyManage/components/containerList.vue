<template>
  <div class="containerListPage">
    <div class="formDetail">
      <Form ref="formValidate" :model="data" :label-width="110" inline class="formWidth100 fmb0">
        <div class="mbBorder burder5">
          <Form-item label="SK总数量：">
            <div>{{ data.skuSum }}</div>
          </Form-item>
          <Form-item label="商品总数量：">
            <div>{{ data.productSum }}</div>
          </Form-item>
          <Form-item label="已装箱总数量：">
            <div>{{ data.quantitySum }}</div>
          </Form-item>
          <Form-item label="未装箱总数量：" class="redTips">
            <div>{{ data.notQuantitySum }}</div>
          </Form-item>
          <Form-item label="货箱总数量：">
            <div>{{ data.boxSum }}</div>
          </Form-item>
          <Form-item label="预估总重量(kg)：">
            <div>{{ data.goodsWeight }}</div>
          </Form-item>
        </div>
        <div class="mbBorder padding10">
          <logisticsInfo ref="logisticsInfo" :isEdit="isEdit" :data="data" @logisticInfoChange="logisticInfoChange" />
        </div>
        <div class="autoLong padding10 boxDesc">
          <FormItem label="装箱备注：">
            <Input style="width: 100%" v-model.trim="boxInfo.packingRemark" type="textarea" maxlength="200"
              show-word-limit v-if="invoiceEdit" :rows="2"></Input>
            <div v-else>{{ data.packingRemark }}</div>
          </FormItem>
        </div>
      </Form>

      <div class="invoiceStyle mb10" v-if="invoiceList.length">
        <div class="invoiceOne">
          <div v-for="(item, index) in invoiceList" :key="index" class="mtborder">
            <div class="dispalyFlex alignCenter">
              <Icon :type="index > 0 ? 'md-remove-circle' : 'md-add-circle'" class="icons cursorClick mr10"
                @click="invoiceOperator(index)" v-if="invoiceEdit" />
              <div class="mr20">
                <span>平台发货单号：</span>
                <Input v-model="item.dispatchOrderNo" maxlength="50" style="width: 200px" :disabled="!invoiceEdit" />
              </div>
              <template v-if="invoiceEdit">
                <dyt-loadingText :loading="item.getExcelLoading" :disabled="!(
                  Boolean(item.dispatchOrderNo) &&
                  ['0', '2', 0, 2].includes(data.platformType)
                )
                  " @click="getOrderFile(item, index)" class="mr10"
                  title="输入内容不为空，tumu与shein平台主体，“获取文件”按纽可用">获取文件</dyt-loadingText>
                <dyt-loadingText :loading="item.uploadLoading" class="mr20"
                  @click="uploadFile(item, index)">上传新文件</dyt-loadingText>
              </template>
              <div class="dispalyFlex alignCenter excelMain">
                <span>发货单文件：</span>
                <div class="dispalyFlex excelList">
                  <div v-for="(fItem, fIndex) in item.defaultList" :key="fIndex" class="dispalyFlex excelItem">
                    <span class="linkText cursorClick" @click="previewWashedPdf(fItem)">{{ fItem.name }}</span>
                    <Icon type="md-close" class="closeIcon" @click="delExcel(index, fIndex)" v-if="invoiceEdit" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Spin fix v-if="invoiceLoading"></Spin>
      </div>
      <Table highlight-row border :columns="columns" :data="tableList" :loading="tableLoading"></Table>
    </div>
    <!-- 打印箱标 -->
    <Modal v-model="printInfo.visible" title="打印箱标" class="printModal" width="650">
      <div>
        <Form ref="formItem" :model="printInfo.formItem" :label-width="100" v-if="setp == 1">
          <FormItem label="打印选择：" prop="type">
            <RadioGroup v-model="printInfo.formItem.type">
              <Radio :label="1">打印当前货箱箱标</Radio>
              <Radio :label="2">打印全部货箱箱标</Radio>
            </RadioGroup>
          </FormItem>
        </Form>
        <div v-if="tagViewHtml.length" style="max-height: 600px; overflow: auto">
          <div class="tag-view" v-for="(item, index) in tagViewHtml" :key="`tag-${index}`" :style="`${item.pagePxSze
            ? `height:${item.pagePxSze.height * item.scale}px;`
            : ''
            }`">
            <div v-html="item.previewHtml" class="tag-item-view" />
          </div>
        </div>
        <Spin fix v-if="createLoading">正在处理数据中，请不要关闭....</Spin>
        <Spin size="large" fix v-if="beingCreatePrint">
          处理打印数据中，数据量越多需要时间越久，请耐心等待...
        </Spin>
      </div>
      <div slot="footer">
        <Button @click="printInfo.visible = false">取消</Button>
        <Button type="primary" @click="previewLabel()" :disabled="createLoading" v-if="setp == 1">确认</Button>
        <Button type="primary" @click="printBoxConfirm()" :disabled="beingCreatePrint" v-if="setp == 2">打 印</Button>
      </div>
    </Modal>
    <!-- 上传文件 -->
    <Upload v-show="false" :action="uploadInfo.uploadApi" :format="uploadInfo.format" :name="uploadInfo.name"
      :headers="headObj" :maxSize="uploadInfo.maxSize" :show-upload-list="uploadInfo.showUploadList"
      :multiple="uploadInfo.multiple" :on-success="handleSuccess" :on-error="handleError" :on-format-error="formatError"
      :on-exceeded-size="exceededSize" :before-upload="handleUpload" ref="uploadExcel">
      <Button class="uploadFile">上传文件</Button>
    </Upload>
    <!-- 货箱信息 -->
    <packing-information-detail ref="packingInformationDetail" :modelVisible.sync="packingInfo.visible"
      :data="packingInfo.data" />
    <!-- 结束装箱 -->
    <confirmModal :modelVisible.sync="confirmModal.visible" @confirmClick="confirmFinishBox">
      <div slot="tips">
        <div class="mb10" style="line-height: 28px">
          确认是否结束装箱：<span style="color: #ff9900">{{
            confirmModal.data.pickingBoxNo
          }}</span>
        </div>
        <Checkbox v-model="confirmModal.isPrint" style="display: inline-block">打印当前货箱箱标</Checkbox>
      </div>
    </confirmModal>
  </div>
</template>

<script>
import api from "@/api/api";
import printCommon from "@/utils/printCommon";
import { getPrintHtml } from "@/utils/printTagCommon";
import permission_mixin from "@/components/mixin/permission_mixin";
import packingInformationDetail from "./packingInformationDetail";
import confirmModal from "@/components/common/confirmModal";
import logisticsInfo from "./logisticsInfo";

export default {
  name: "containerList",
  mixins: [permission_mixin],
  components: { packingInformationDetail, confirmModal, logisticsInfo },
  data() {
    return {
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
        invoiceIndex: null, //当前选中的行数据
        uploadNum: 0, //用来计数
      },
      printInfo: {
        visible: false,
        formItem: { type: 1 },
        data: {},
      },
      tagViewHtml: [],
      createLoading: false,
      beingCreatePrint: false,
      setp: 1, //1预览（确定）3打印
      tableLoading: false,
      tableList: [],
      deTableList: [],
      invoiceList: [], //发货单列表
      deInvoiceList: [],
      invoiceLoading: false,
      packingInfo: {
        // 货箱详情
        visible: false,
        data: {},
      },
      confirmModal: {
        data: {},
        visible: false,
        isPrint: true,
      },
      boxInfo: {
        packingRemark: "",
      },
      deBoxInfo: {},
      logisticChange: false, //物流信息变更
    };
  },
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    isEdit: {
      type: String,
      default: "",
    },
  },
  watch: {
    data: {
      handler(val) {
        if (val.pickingId) {
          this.setData();
          // this.getLogistics();
        }
      },
      deep: true,
      immediate: true,
    },
    isChange: {
      handler(val) {
        this.$emit("containerChange", val);
      },
      deep: true,
    },
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    columns() {
      let [list, v] = [[], this];
      let { pickingNo } = this.data;
      return [
        {
          title: "行号",
          width: 70,
          align: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "货箱编号",
          align: "left",
          key: "pickingBoxNo",
          width: 180,
          render: (h, { row }) => {
            return h(
              "div",
              {
                attrs: {
                  class: "linkText cursorClick",
                },
                on: {
                  click() {
                    row.pickingNo = pickingNo;
                    v.packingInfo.data = row;
                    v.packingInfo.visible = true;
                  },
                },
              },
              row.pickingBoxNo
            );
          },
        },
        {
          title: "货箱信息",
          align: "left",
          key: "platformBoxNo",
          minWidth: 160,
          render: (h, { row, index }) => {
            return h("Input", {
              props: {
                value: row.platformBoxNo,
                disabled: !v.boxInfoEdit,
              },
              on: {
                "on-change"(val) {
                  v.$set(v.tableList[index], "platformBoxNo", val.target.value);
                },
              },
            });
          },
        },
        {
          title: "货箱备注",
          align: "left",
          key: "boxRemark",
          minWidth: 180,
          render: (h, { row, index }) => {
            return h("Input", {
              props: {
                value: row.boxRemark,
                disabled: !v.boxInfoEdit,
              },
              on: {
                "on-change"(val) {
                  v.$set(v.tableList[index], "boxRemark", val.target.value);
                },
              },
            });
          },
        },
        {
          title: "SKU数量",
          align: "left",
          key: "skuSum",
          width: "110",
        },
        {
          title: "商品数量",
          align: "left",
          key: "quantitySum",
          width: "110",
        },
        {
          title: "货箱预估重量(kg)",
          align: "left",
          key: "goodsWeight",
          width: "134",
        },
        {
          title: "完成装箱时间",
          align: "left",
          key: "boxFinishTime",
          width: "150",
          render: (h, { row }) => {
            return h(
              "div",
              row.boxFinishTime ? v.$uDate.dealTime(row.boxFinishTime) : ""
            );
          },
        },
        {
          title: "货箱状态",
          align: "left",
          key: "boxStatus",
          width: "120",
          render: (h, { row }) => {
            let typeList = {
              0: { label: "正在装箱" },
              1: { label: "已装箱" },
            };
            return h(
              "span",
              typeList[row.boxStatus] ? typeList[row.boxStatus].label : ""
            );
          },
        },
        ...list,
        {
          title: "操作",
          align: "left",
          width: "200",
          render: (h, params) => {
            return v.operateRender(h, params);
          },
        },
      ];
    },
    isChange() {
      let tableList = this.tableList.map((k) => {
        return {
          platformBoxNo: k.platformBoxNo || null,
          boxRemark: k.boxRemark || null,
        };
      });
      let invoiceList = this.invoiceList.map((k) => {
        return { dispatchOrderNo: k.dispatchOrderNo || null };
      });
      let arr = [];
      arr.push(
        !(JSON.stringify(this.deTableList) === JSON.stringify(tableList))
      );
      arr.push(
        !(JSON.stringify(this.deInvoiceList) === JSON.stringify(invoiceList))
      );
      arr.push(
        !(JSON.stringify(this.deBoxInfo) === JSON.stringify(this.boxInfo))
      );
      arr.push(this.logisticChange);
      return !!arr.filter((k) => k).length;
    },
    // 编辑进来的
    savePower() {
      return (
        ["edit"].includes(this.isEdit) &&
        this.getPermission("fullTrusteeshipPicking_update")
      );
    },
    // 按钮进来的
    buttonEdit() {
      return ["button"].includes(this.isEdit);
    },
    // 编辑或完成文件上传的操作
    invoiceEdit() {
      let status = ["2"].includes(this.data.pickingNewStatus);
      return this.savePower || (this.buttonEdit && status);
    },
    // 货箱信息是否可以编辑
    boxInfoEdit() {
      let status = ["14"].includes(this.data.pickingNewStatus);
      let buttonPower =
        this.buttonEdit && this.getPermission("fullTrusteeshipPicking_update");
      return this.savePower || (buttonPower && status);
    },
  },
  methods: {
    setData() {
      let data = this.$common.copy(this.data);
      this.tableList = data.trusteeshipPickingBoxVOS || [];
      this.deTableList = this.tableList.map((k) => {
        return { platformBoxNo: k.platformBoxNo, boxRemark: k.boxRemark };
      });
      Object.keys(this.boxInfo).forEach((key) => {
        this.boxInfo[key] = data[key] || "";
      });
      this.deBoxInfo = this.$common.copy(this.boxInfo);
      this.refreshInvoiceList(data);
    },
    refreshInvoiceList(data) {
      this.invoiceList = (data.dispatchOrderFileList || []).map((k) => {
        let nameList = k.originalFileName ? k.originalFileName.split(",") : [];
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
      this.deInvoiceList = this.invoiceList.map((k) => {
        return { dispatchOrderNo: k.dispatchOrderNo };
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
    // 操作处理
    operateRender(h, { row, index }) {
      let operatorType = {
        finishBox: { label: "结束装箱", fun: "finishBox" },
        export: { label: "导出明细", fun: "export" },
        printBox: { label: "打印箱标", fun: "printBox" },
        delBox: {
          label: "删除货箱",
          class: "unlinkText cursorClick unlineErrorText",
          fun: "delBox",
        },
      };
      let [list, v] = [[], this];
      let { pickingNewStatus } = this.data;
      if (pickingNewStatus == 14) {
        // 装箱
        // 0正在装箱
        if (this.buttonEdit && [0, "0"].includes(row.boxStatus)) {
          list.push("finishBox");
        }
        // 1已装箱
        if ([1, "1"].includes(row.boxStatus)) {
          list.push("printBox");
        }
        list.push("export");
        if (this.buttonEdit) {
          list.push("delBox");
        }
      } else {
        list.push("printBox", "export");
      }
      let statusList = list.map((k) => {
        return operatorType[k];
      });
      let operatorList = statusList.map((item) => {
        let hDom = h(
          "span",
          {
            attrs: {
              class: item.class || "unlinkText cursorClick" + " mr10",
            },
            style: {},
            on: {
              click() {
                item.fun && v[item.fun] & v[item.fun](row);
              },
            },
          },
          item.label
        );
        return hDom;
      });
      return h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            marginRight: "-10px",
          },
        },
        operatorList
      );
    },
    finishBox(row) {
      let fileList = this.invoiceList.filter((k) => {
        return k.targetFileUrl;
      });
      // 当出库单发货文件为空时，“打印当前货箱箱标”的默认值为：选中
      this.confirmModal.isPrint = !!!fileList.length;
      this.confirmModal.data = row;
      this.confirmModal.visible = true;
    },
    confirmFinishBox(cb) {
      let confirmModal = this.confirmModal;
      this.axios
        .post(
          `${api.fullManage_finishPickingBox}${this.data.pickingId}?pickingBoxId=${confirmModal.data.pickingBoxId}`
        )
        .then(async (res) => {
          if (res.data.code === 0) {
            cb();
            this.$Message.success("操作成功");
            this.$emit("searchData");
            if (confirmModal.isPrint) {
              await this.printBox(confirmModal.data, true);
              let preFlag = await this.previewLabel(true);
              if (preFlag.valid) await this.printBoxConfirm(true);
            }
          }
        })
        .finally(() => {
          this.$Modal.remove();
        });
    },
    export(row) {
      this.$Modal.confirm({
        width: 500,
        title: "操作提示",
        content: "<p>确认导出货箱明细？</p>",
        loading: true,
        onOk: () => {
          this.axios({
            method: "post",
            url: `${api.fullManage_exportBox}${this.data.pickingId}?pickingBoxId=${row.pickingBoxId}`,
            responseType: "blob",
            timeout: 600000,
          })
            .then((res) => {
              if (!res.resData) return;
              this.$Message.success("导出成功");
              this.$common.downFile(res.resData, res.filename);
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    printBox(row, unVisible) {
      return new Promise((resolve) => {
        this.setp = 1;
        this.tagViewHtml = [];
        this.printInfo.data = row;
        this.printInfo.formItem.type = 1;
        this.printInfo.visible = !!!unVisible;
        resolve();
      });
    },
    delBox(row) {
      this.$Modal.confirm({
        width: 500,
        title: `确认是否删除货箱：<span style="color:#FF9900;">${row.pickingBoxNo}</span>`,
        content:
          '<div style="background-color: #e6f7ff;border:1px solid #66ccff;border-radius: 3px;display: inline-block;padding: 4px 8px;">提示：货箱删除后，货箱的商品可以重新装箱</div>',
        loading: true,
        onOk: () => {
          this.axios
            .delete(api.fullManage_deletePickingBox + row.pickingBoxId)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("操作成功");
                this.$emit("searchData");
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    previewLabel(unVisible) {
      return new Promise((resolve) => {
        let printInfo = this.printInfo;
        let lists = [];
        if (printInfo.formItem.type == 1) {
          lists = [printInfo.data];
        } else {
          lists = this.tableList;
        }
        // 结束装箱不过滤
        if (!!!unVisible) {
          lists = lists.filter((k) => [1, "1"].includes(k.boxStatus));
        }
        let printList = lists.map((k) => {
          let temp = Object.assign(
            { printNumber: 1, platformId: "fullybox" },
            k
          );
          temp.boxRemark = this.$common.isEmpty(temp.boxRemark)
            ? " "
            : temp.boxRemark;
          temp.platformBoxNo = this.$common.isEmpty(temp.platformBoxNo)
            ? ""
            : temp.platformBoxNo;
          return temp;
        });
        let tagOption = {
          size: {
            width: 70,
            height: 20,
            unit: "mm",
          },
          replaceKey: {
            tagType: "platformId",
            pickingBoxNo: "pickingBoxNo", //货箱编号
            platformBoxNo: "platformBoxNo", //货箱信息
            boxRemark: "boxRemark", //货箱备注
            printNumber: "printNumber", //数量
          },
        };
        !!!unVisible && (this.createLoading = true);
        return this.$common
          .promiseAll(
            printList.map((k) => {
              return () => {
                return new Promise((resolve) => {
                  getPrintHtml(k, tagOption).then((res) => {
                    resolve({ ...res, printNumber: k.printNumber });
                  });
                });
              };
            })
          )
          .then((list) => {
            let tagViewHtml = [];
            list.forEach((res) => {
              if (!res.success || this.$common.isEmpty(res.data)) {
                this.$Message.error("标签生成异常~");
                return;
              }
              const printQuantity = Number(res.printNumber);
              res.data.forEach((item) => {
                for (let index = 0; index < printQuantity; index++) {
                  tagViewHtml.push(item);
                }
              });
            });
            if (!tagViewHtml.length) {
              resolve({ valid: false });
              this.$Message.error("标签生成异常~");
              return;
            }
            this.tagViewHtml = tagViewHtml;
            this.setp = 2;
            resolve({ valid: true });
          })
          .catch((err) => {
            resolve({ valid: false });
          })
          .finally(() => {
            !!!unVisible && (this.createLoading = false);
          });
      });
    },
    printBoxConfirm(unVisible) {
      return new Promise((resolve) => {
        !!!unVisible && (this.beingCreatePrint = true);
        let fun = (index) => {
          let printList = this.tagViewHtml.slice(index * 40, (index + 1) * 40); //限制打印张数
          if (!printList.length) {
            resolve();
            !!!unVisible && (this.beingCreatePrint = false);
            this.$Message.success("打印完成！");
            this.tagViewHtml = [];
            this.setp = 1;
            return;
          }
          this.printTag(printList).finally(() => {
            index++;
            fun(index);
          });
        };
        fun(0);
      });
    },
    // 打印标签
    printTag(list) {
      return new Promise((resolve) => {
        let allTagHtml = "";
        list.forEach((item, index) => {
          allTagHtml = `${allTagHtml}${item.printHtml}`;
        });
        // 将 html 放到 html 文档中
        allTagHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>标签打印</title>
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body{
            font-size: 0;
          }
          img {
            vertical-align: top;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
        printCommon
          .htmlPrint(allTagHtml)
          .then((res) => {
            // console.log(res);
          })
          .finally(() => {
            resolve("finish");
          });
      });
    },
    // 获取发货文件
    getOrderFile(row, index) {
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
                this.$emit("searchData", (data) => {
                  (data.dispatchOrderFileList || []).forEach(k => {
                    if (!(k.dispatchOrderFileId === row.dispatchOrderFileId)) return;
                    let nameList = k.originalFileName ? k.originalFileName.split(",") : [];
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
                    this.$set(this.invoiceList[index], 'defaultList', defaultList);
                  })
                });
                this.$Message.success("操作成功");
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
    // 添加/删除 发货单
    invoiceOperator(index) {
      let [rqApi, rqType, rqData] = [null, null, null];
      if (index > 0) {
        rqApi = api.fullManage_deleteDispatchOrderFile;
        rqType = "delete";
        let row = this.invoiceList[index];
        rqData = [row.dispatchOrderFileId];
      } else {
        rqApi = api.fullManage_insertDispatchOrderFile + this.data.pickingId;
        rqType = "post";
      }
      this.invoiceLoading = true;
      this.axios[rqType](rqApi, { data: rqData })
        .then((res) => {
          if (res.data.code === 0) {
            this.$emit("searchData", (data) => {
              this.refreshInvoiceList(data);
            });
          }
        })
        .finally(() => {
          this.invoiceLoading = false;
        });
    },
    // 点击上传文件
    uploadFile(row, index) {
      this.uploadInfo.invoiceIndex = index;
      this.uploadInfo.uploadNum = 0;
      let dom = document.querySelector(".uploadFile");
      dom.click();
    },
    uploadRow(val) {
      let row = this.invoiceList[this.uploadInfo.invoiceIndex] || {};
      row.uploadLoading = val;
    },
    // 上传文件之前的钩子 若返回 false 或者 Promise 则停止上传
    handleUpload(file) {
      this.uploadRow(true);
    },
    handleSuccess(response, file, fileList) {
      this.uploadInfo.uploadNum++;
      if (fileList.length > this.uploadInfo.uploadNum) return;
      this.$refs.uploadExcel.clearFiles();
      let [nameList, urlList] = [[], []];
      let row = this.invoiceList[this.uploadInfo.invoiceIndex];
      // 将原数据也放入
      row.defaultList.forEach((k) => {
        nameList.push(k.name);
        urlList.push(k.url);
      });
      // 将新数据放入
      fileList.forEach((fk) => {
        let data = fk.response.datas || {};
        Object.keys(data).forEach((k) => {
          nameList.push(k);
          urlList.push(data[k]);
        });
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
          // this.$emit("searchData");
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
    delExcel(index, fIndex) {
      let row = this.invoiceList[index];
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
      this.invoiceLoading = true;
      this.axios
        .put(api.fullManage_updateDispatchOrderFile, temp)
        .then((res) => {
          if (res.data.code === 0) {
            // this.$emit("searchData");
          }
        })
        .finally(() => {
          this.invoiceLoading = false;
        });
    },
    // 物流信息加装箱备注
    uploadData() {
      return new Promise(async (resolve) => {
        let logisticsData = await this.$refs.logisticsInfo.handleForm();
        if (!logisticsData.valid) {
          resolve({ valid: false });
          return;
        }
        let { pickingExtendId, pickingId } = this.data;
        let temp = Object.assign(
          { pickingExtendId, pickingId },
          logisticsData.data,
          this.boxInfo
        );
        resolve({ valid: true, data: temp });
      });
    },
    // 完成上传文件
    async uploadFinish() {
      return new Promise(async (resolve) => {
        let list = [];
        this.invoiceList.forEach((k) => {
          (k.defaultList || []).forEach((j) => list.push(j.url));
        });
        if (!list.length) {
          this.$Message.error("发货单文件不能为空!");
          resolve({ valid: false });
          return;
        }
        let data = await this.uploadData();
        resolve(data);
      });
    },
    logisticInfoChange(e) {
      this.logisticChange = e;
    },
  },
};
</script>

<style lang="less">
.printModal {
  .ivu-form-item-label {
    font-size: 14px;
  }
}

.containerListPage {
  .ivu-upload {
    height: 18px;
  }

  .poptipWidth,
  .ivu-poptip-rel {
    width: 100%;
  }

  .invoiceStyle {
    position: relative;

    .icons {
      font-size: 24px;

      &.ivu-icon-md-add-circle {
        color: #2b85e4;
      }

      &.ivu-icon-md-remove-circle {
        color: #ed4014;
      }
    }

    .invoiceOne {
      flex: 1;
      overflow: hidden;
    }

    .mtborder {
      border-top: 1px solid #e8eaec;
      padding-top: 10px;

      &:not(:last-child) {
        padding-bottom: 10px;
      }
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
      margin-right: 16px;
    }

    .closeIcon {
      font-size: 20px;
      color: #ed4014;
      font-weight: bold;
      cursor: pointer;
      margin-left: 2px;
    }
  }

  .redTips,
  .redTips .ivu-form-item-label {
    color: #ed4014;
  }

  .mbBorder {
    padding-bottom: 10px;
    border-bottom: 1px solid #e8eaec;
  }

  .padding10 {
    padding: 10px 0;
  }

  .burder5 {
    margin-top: -5px;
  }

  .boxDesc {
    .ivu-form-item {
      display: block;
    }
  }
}
</style>