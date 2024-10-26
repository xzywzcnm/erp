<template>
  <div>
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom: 10px">
      <Icon type="ios-arrow-back"></Icon>
      <div
        v-if="
          changeScanNumList.length > 0 &&
          ['1', '3'].includes(showStatus.checkStatus)
        "
        style="display: inline-block"
      >
        <Poptip
          confirm
          title="离开本页面之前，要保存你修改的数据吗？"
          @on-ok="backPage"
          @on-cancel="cancelSave"
        >
          <a>返回列表</a>
        </Poptip>
      </div>
      <a @click="backPage" v-else>返回列表</a>
    </div>
    <div class="dataSort grayBg">
      <h3>录入盘点结果</h3>
    </div>
    <div
      style="
        background-color: #fff;
        margin: 0 10px 10px 10px;
        padding: 10px 0 0 20px;
      "
    >
      <Form label-position="left" :label-width="80">
        <Row>
          <Col span="6">
            <Form-item label="盘点单号：" style="font-weight: 800">
              <span>{{ curObj.inventoryCheckNo }}</span>
            </Form-item>
          </Col>
          <Col span="6">
            <Form-item label="盘点仓库：" style="font-weight: 800">
              <span>{{ curObj.warehouseName }}</span>
            </Form-item>
          </Col>
          <Col span="6">
            <Form-item label="盘点状态：" style="font-weight: 800">
              <span v-if="showStatus.checkStatus === '0'">待盘点</span>
              <span v-if="showStatus.checkStatus === '1'">盘点中</span>
              <span v-if="showStatus.checkStatus === '2'">已完成</span>
              <span v-if="showStatus.checkStatus === '3'">提交盘点</span>
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <Form-item label="动态盘点：">
              <span v-if="showStatus.beginDate == null">N</span>
              <span v-else>Y</span>
            </Form-item>
          </Col>
          <Col span="6">
            <Form-item label="创建时间：">
              <span>{{ curObj.createdTime }}</span>
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
            <Form-item label="盲盘：">
              <span v-if="curObj.blindFlag === '0'">N</span>
              <span v-if="curObj.blindFlag === '1'">Y</span>
            </Form-item>
          </Col>
          <Col span="6" v-if="showStatus.checkStatus !== '0'">
            <Form-item label="盘点人员：">
              <span>{{ showStatus.checkUserName }}</span>
            </Form-item>
          </Col>
          <Col span="5">
            <Form-item>
              <a href="javascript:;" @click="printCheckList">打印盘点单</a>
            </Form-item>
          </Col>
        </Row>
      </Form>
    </div>
    <div
      style="
        background-color: #fff;
        margin: 0 10px 10px 10px;
        padding: 20px 0 0 20px;
      "
    >
      <Row>
        <Col span="4">
          <Form :model="pageParams">
            <Form-item>
              <Input
                placeholder="输入SKU或中文名称查找"
                v-model.trim="pageParams.searchSkuOrName"
                style="width: 220px"
              ></Input>
            </Form-item>
          </Form>
        </Col>
        <Col span="3">
          <Button
            type="primary"
            @click="noPageSearch"
            :disabled="SearchDisabled"
            icon="ios-search"
            >查询
          </Button>
        </Col>
        <Col
          span="5"
          style="float: right"
          v-if="['1', '3'].includes(showStatus.checkStatus)"
        >
          <span>导入盘点结果：</span>
          <div style="margin-right: 40px; display: inline-block">
            <dytUpload
              :action="importList"
              :data="{ warehouseId: curObj.warehouseId }"
              :headers="headObj"
              :on-success="uploadSuccess"
              name="excleFile"
              :show-upload-list="false"
            >
              <Button
                icon="ios-cloud-upload-outline"
                :disabled="!getPermission('wmsInventoryCheck_import')"
                >选择文件
              </Button>
            </dytUpload>
          </div>
          <a
            v-if="getPermission('wmsInventoryCheck_export')"
            href="javascript:;"
            @click="exportList"
            >导出</a
          >
        </Col>
      </Row>
    </div>
    <!-- 表格数据 -->
    <div class="shopTable">
      <!--表格-->
      <Table
        highlight-row
        border
        :columns="columns6"
        :loading="TableLoading"
        :data="scanData"
        ref="selection"
      ></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
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
            :page-size-opts="pageArray"
          ></Page>
        </div>
      </div>
    </div>
    <!-- 完成盘点和取消按钮 -->
    <div style="margin: 0 auto; padding: 80px 0; width: 500px">
      <Button
        type="primary"
        @click="startCheckBtn"
        v-if="startShow"
        style="margin-right: 50px"
        :disabled="!getPermission('wmsInventoryCheck_modify')"
        >开始盘点
      </Button>
      <Button
        type="primary"
        @click="finishedCheckBtn"
        v-if="endShow"
        style="margin-right: 50px"
        :disabled="!getPermission('wmsInventoryCheck_complete')"
        >完成盘点
      </Button>
      <!-- <div v-if="changeScanNumList.length > 0 && showStatus.checkStatus==='1'" style="display:inline-block;">
        <Poptip
          confirm
          title="离开本页面之前，要保存你修改的数据吗？"
          @on-ok="closeCheckBtn"
          @on-cancel="cancelSave">
          <Button type="default" icon="close-round" v-if="cancelShow">取消</Button>
        </Poptip>
      </div>
      <span v-else>
        <Button type="default" icon="close-round" @click="closeCheckBtn" v-if="cancelShow">取消</Button>
      </span> -->
      <Button
        type="default"
        icon="md-checkmark"
        @click="saveCheckBtn"
        v-if="endShow"
        >保存</Button
      >
      <Button
        style="margin-left: 20px"
        type="default"
        icon="md-close"
        @click="closeCheckBtn"
        v-if="cancelShow"
        >取消
      </Button>
      <Button type="default" @click="backPageListBtn" v-if="closeShow"
        >关闭
      </Button>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import { getWarehouseId } from "@/utils/getService";
// import { getToken } from '@/utils/cookie';
import scan_mixin from "./scan_mixin";

export default {
  mixins: [Mixin, scan_mixin],
  components: {},
  data() {
    var self = this;
    return {
      importList: api.importAllwh,
      startShow: true, // 开始盘点
      endShow: false, // 完成盘点
      cancelShow: true, // 取消按钮默认显示
      closeShow: false, // 关闭按钮默认隐藏
      pageParams: {
        searchSkuOrName: "", // 输入SKU或者中文名称
        pageNum: 1,
        pageSize: 10,
      },
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: "index",
          title: "序号",
          width: 70,
          align: "center",
        },
        {
          title: "产品图片",
          key: "goodsUrl",
          width: 100,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.goodsUrl
                  ? self.$store.state.imgUrlPrefix + params.row.goodsUrl
                  : require("../../../../../public/static/images/placeholder.jpg"),
              },
              style: {
                width: "60px",
                height: "60px",
                padding: "6px 0 2px 0",
              },
            });
          },
        },
        {
          title: "SKU",
          key: "goodsSku",
          align: "center",
          width: 120,
        },
        {
          title: "中文描述",
          key: "goodsCnDesc",
          minWidth: 150,
          align: "center",
        },
        {
          title: "英文描述",
          key: "goodsEnDesc",
          align: "center",
          width: 120,
        },
        {
          title: "批次号",
          key: "receiptBatchNo",
          align: "center",
          width: 120,
        },
        {
          title: "库位",
          key: "warehouseLocationName",
          align: "center",
          width: 120,
        },
        {
          title: "库存数量",
          key: "oriTotalNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            return h(
              "p",
              self.curObj.blindFlag === "1" &&
                self.showStatus.checkStatus !== "2"
                ? "*"
                : params.row.oriTotalNumber
            );
          },
        },
        {
          title: "分配数量", // 分配数量
          key: "allottedNumber",
          align: "center",
          width: 90,
        },
        {
          title: "冻结数量", // 冻结数量
          key: "frozenNumber",
          align: "center",
          width: 90,
        },
        {
          title: "已拣数量", // 已拣数量
          key: "actualPickingNumber",
          align: "center",
          width: 90,
        },
        {
          title: "待归库数量", // 待归库数量
          key: "oriWaitComeBackNumber",
          align: "center",
          width: 100,
        },
        {
          title: "已盘点数量",
          key: "checkedInventoryNumber",
          align: "center",
          width: 120,
          render: (h, params) => {
            return h("div", [
              h("InputNumber", {
                props: {
                  size: "small",
                  min: 0,
                  disabled: !this.endShow,
                  value: params.row.checkedInventoryNumber,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-change": (value) => {
                    if (this.curObj.blindFlag === "0") {
                      params.row.profitAndLossNumber = Number(
                        value - params.row.oriTotalNumber
                      );
                    }
                    params.row.checkedInventoryNumber = value;
                    self.scanData[params.index] = params.row;
                    let valid = false;
                    self.changeScanNumList.forEach((i) => {
                      if (
                        i.inventoryCheckDetailId ===
                        params.row.inventoryCheckDetailId
                      ) {
                        valid = true;
                        i.checkedInventoryNumber = value;
                      }
                    });
                    if (!valid) {
                      self.changeScanNumList.push(self.scanData[params.index]);
                    }
                    self.saveStatus = false;
                  },
                  "on-blur": () => {
                    self.scanValidFn();
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "待盘点数量",
          key: "awaitCheckedInventoryNumber",
          align: "center",
          width: 100,
        },
        {
          title: "损益数量",
          key: "profitAndLossNumber",
          align: "center",
          width: 90,
          render: (h, params) => {
            let number = Number(
              params.row.checkedInventoryNumber +
                params.row.actualPickingNumber +
                params.row.oriWaitComeBackNumber -
                params.row.oriTotalNumber
            );
            if (number > 0) {
              number = "+" + number;
            }
            return h(
              "div",
              {
                style: {
                  color: number < 0 ? "red" : number > 0 ? "green" : "",
                },
              },
              self.curObj.blindFlag === "1" &&
                self.showStatus.checkStatus !== "2"
                ? "*"
                : number
            );
          },
        },
      ],
      scanData: [],
      changeScanNumList: [], // 有改变的盘点数量数组
      showStatus: {}, // 盘点状态
      saveStatus: false, // 保存状态
    };
  },
  props: {
    curObj: {
      default: null,
    },
  },
  created() {
    this.searchData();
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
  },
  methods: {
    uploadSuccess(res) {
      if (res.code === 0) {
        this.$Message.success("导入成功");
        this.searchData();
      }
    },
    exportList() {
      let v = this;
      let obj = {
        inventoryCheckNo: this.curObj.inventoryCheckNo,
        goodsSkuOrGoodsCnDesc: this.pageParams.searchSkuOrName,
        isPage: "1",
      };
      this.axios.post(api.exportAllWh, obj).then((res) => {
        if (res.data.code === 0) {
          if (res.data.datas) {
            let erpCommon = v.$store.state.erpConfig;
            window.open(
              erpCommon.filenodeViewTargetUrl + res.data.datas,
              "_self"
            );
          } else {
            this.$Message.error("导出失败!");
          }
        }
      });
    },
    backPage() {
      // 确认保存返回列表按钮
      this.$store.commit("scanOrderShow", "scan");
      if (["1", "3"].includes(this.showStatus.checkStatus)) {
        if (!this.saveStatus) {
          this.saveChangeScanData(); // 保存
        }
      }
      // this.$Message.success('保存成功');
    },
    cancelSave() {
      // 取消保存返回列表
      this.$store.commit("scanOrderShow", "scan");
    },
    searchData() {
      // 查询按钮
      var v = this;
      var paramsObj = {
        isPage: 0,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
        inventoryCheckNo: v.curObj.inventoryCheckNo,
        goodsSkuOrGoodsCnDesc: v.pageParams.searchSkuOrName
          ? v.pageParams.searchSkuOrName
          : null, // 输入SKU或者中文名称
      };
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_scanDetailData, paramsObj).then((res) => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          v.showStatus = res.data.datas; // 盘点状态
          if (v.showStatus.checkType === "1") {
            let columns6 = v.columns6.filter((i) => i.key !== "receiptBatchNo");
            v.$nextTick(() => {
              v.columns6 = columns6;
            });
          }

          let newData = res.data.datas.inventoryCheckDetailResultPage.list;
          newData.forEach((item, index) => {
            if (v.showStatus.checkStatus === "0") {
              // item.oriTotalNumber = '*';
              item.checkedInventoryNumber = null;
            } else if (["1", "3"].includes(v.showStatus.checkStatus)) {
              if (this.curObj.blindFlag === "0") {
                // item.checkedInventoryNumber = item.checkedInventoryNumber;
              } else {
                item.oriTotalNumber = "*";
              }
            } else if (v.showStatus.checkStatus === "2") {
              item.profitAndLossNumber =
                Number(item.oriTotalNumber) -
                Number(item.checkedInventoryNumber); // 损益数量
              if (this.curObj.blindFlag === "1") {
                item.selfOriTotalNumber = "*";
              }
            }
          });
          v.scanData = newData;
          v.totalRecords = res.data.datas.inventoryCheckDetailResultPage.total;
          if (v.showStatus.checkStatus === "0") {
            v.startShow = true; // 开始盘点显示
            v.endShow = false; // 完成盘点隐藏
            v.cancelShow = true; // 取消按钮显示
            v.closeShow = false; // 关闭按钮隐藏
          } else if (["1", "3"].includes(v.showStatus.checkStatus)) {
            v.startShow = false; // 开始盘点隐藏
            v.endShow = true; // 完成盘点显示
            v.cancelShow = true; // 取消按钮显示
            v.closeShow = false; // 关闭按钮隐藏
          } else if (v.showStatus.checkStatus === "2") {
            v.startShow = false; // 开始盘点隐藏
            v.endShow = false; // 完成盘点隐藏
            v.cancelShow = false; // 取消按钮隐藏
            v.closeShow = true; // 关闭按钮显示
          }
        }
      });
    },
    noPageSearch() {
      // 页面查询
      this.pageParams.pageNum = 1; // 点击查询按钮将页码重置为1
      this.searchData();
    },
    changePage(page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.saveChangeScanData(); // 保存
      this.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    startCheckBtn() {
      // 开始盘点按钮
      var v = this;
      v.axios
        .post(
          api.startScan +
            "?inventoryCheckNo=" +
            v.curObj.inventoryCheckNo +
            "&warehouseId=" +
            v.curObj.warehouseId
        )
        .then((res) => {
          if (res.data.code === 0) {
            v.$Message.success("开始盘点成功");
            v.endShow = true;
            v.startShow = false;
            this.searchData();
            v.pageParams.searchSkuOrName = "";
          }
        });
    },
    filterArrFn(arr) {
      // 数组去重
      return Array.from(new Set(arr));
    },
    saveChangeScanData() {
      // 保存功能
      var v = this;
      let saveList = [];
      v.saveStatus = true;
      if (v.curObj.blindFlag === "1") {
        v.changeScanNumList.forEach((item) => {
          item.oriTotalNumber = null;
        });
      }
      if (v.changeScanNumList.length !== 0) {
        saveList = v.changeScanNumList;
        var obj = saveList;
        if (this.scanValidFn()) {
          this.axios.post(api.saveScanDtl, obj).then((res) => {
            if (res.data.code === 0) {
              v.$Message.success("保存成功");
            }
          });
        }
      } else {
        saveList = null;
      }
    },
    scanValidFn() {
      // 盘点数量校验
      let v = this;
      let valid = true;
      for (var i = 0; i < v.changeScanNumList.length; i++) {
        if (v.changeScanNumList[i].checkedInventoryNumber === null) {
          v.$Message.info({
            content: "盘点数量不能为空",
            duration: 5,
          });
          valid = false;
          return;
        }
        if (v.changeScanNumList[i].checkedInventoryNumber < 0) {
          v.$Message.info({
            content: "盘点数量不能小于0",
            duration: 5,
          });
          valid = false;
          return;
        }
        // 完成盘点单时，盘点数量必须大于等于（分配数量+冻结数量-已拣数量）
        if (
          v.changeScanNumList[i].checkedInventoryNumber <
          v.changeScanNumList[i].allottedNumber +
            v.changeScanNumList[i].frozenNumber -
            v.changeScanNumList[i].actualPickingNumber
        ) {
          v.$Message.info({
            content:
              "完成盘点单时，盘点数量必须大于等于（分配数量+冻结数量-已拣数量）",
            duration: 5,
          });
          valid = false;
          return;
        }
      }
      return valid;
    },
    finishedCheckBtn() {
      // 完成盘点按钮
      var v = this;
      var scanTableObj = {};
      if (v.curObj.blindFlag === "1") {
        v.changeScanNumList.forEach((item) => {
          item.oriTotalNumber = null;
        });
      }
      if (v.changeScanNumList.length !== 0) {
        scanTableObj.list = this.filterArrFn(v.changeScanNumList);
      } else {
        scanTableObj = null;
      }
      var obj = {
        blindFlag: v.curObj.blindFlag, // 盲盘
        inventoryCheckNo: v.curObj.inventoryCheckNo, // 库存盘点单编号
        inventoryCheckDetailResultPage: scanTableObj, // 盘点单详情里面的表格数据
      };
      if (this.scanValidFn()) {
        v.inventDifferenceModal(v.curObj).then((data) => {
          obj.createAdjustBol = data.isCheck;
          obj.createReplayBol = data.isAgain;
          v.axios.post(api.carryScan, obj).then((res) => {
            if (res.data.code === 0) {
              v.$Message.success("成功完成盘点");
              v.endShow = false; // 完成盘点按钮隐藏
              v.cancelShow = false; // 取消按钮隐藏
              v.closeShow = true; // 关闭按钮显示
              this.searchData();
              // this.saveChangeScanData(); // 保存
            } else if (res.data.code === -1) {
              v.$Message.info({
                content: "盘点数量不能为空",
                duration: 3,
              });
            } else if (res.data.code === -2) {
              v.$Message.info({
                content: "盘点数量不能小于0",
                duration: 3,
              });
            }
          });
        });
      }
    },
    closeCheckBtn() {
      // 取消按钮
      this.$store.commit("scanOrderShow", "scan");
      // this.saveChangeScanData(); // 保存
      // this.$Message.success('保存成功');
    },
    backPageListBtn() {
      // 关闭按钮
      this.$store.commit("scanOrderShow", "scan");
    },
    printCheckList() {
      let goto = this.$router.resolve({
        path: "/printPickList",
        query: {
          warehouseId: getWarehouseId(),
          data: this.curObj.inventoryCheckNo,
          goodsSkuOrGoodsCnDesc: null,
          type: "checkList",
        },
      });
      window.open(goto.href, "_blank");
    },
    saveCheckBtn() {
      let v = this;
      v.saveChangeScanData(); // 保存
    },
  },
};
</script>
