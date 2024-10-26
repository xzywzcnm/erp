<template>
  <div class="otherStockOutPickList">
    <div v-if="workShow === 'list'" class="listPage">
      <div class="searchMain">
        <Form ref="formItem" :model="formItem" :label-width="labelWidth">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <FormItem label="拣货单编号：" prop="pickingGoodsNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="formItem.pickingGoodsNoList"
                placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="出库单号：" prop="pickingNoList">
              <dyt-input-tag :limit="1" type="textarea" v-model.trim="formItem.pickingNoList" placeholder="多个请用逗号或回车分隔" />
            </FormItem>
            <FormItem label="拣货单状态：" prop="pickListStatus">
              <dyt-select v-model="formItem.pickListStatus">
                <Option v-for="(item, i) in pickListStatusList" :value="item.value" :key="i + 'pickListStatusList'"
                  :label="item.txt"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="拣货单类型：" prop="pickListType">
              <dyt-select v-model="formItem.pickListType">
                <Option v-for="(item, i) in pickListTypeList" :value="item.value" :key="i + 'pickListTypeList'"
                  :label="item.txt"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="打印状态：" prop="printStatus">
              <dyt-select v-model="formItem.printStatus">
                <Option v-for="(item, i) in printStatusList" :value="item.value" :key="i + 'printStatusList'"
                  :label="item.txt"></Option>
              </dyt-select>
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询
              </Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!--排序-->
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Dropdown @on-click="batchOption">
              <Button icon="ios-copy-outline">批量操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('wmsPickingGoods_print_other')">打印拣货单
                </DropdownItem>
                <DropdownItem name="1" v-if="getPermission('wmsPickingGoods_modifyToPicking_otherBatch')
                  ">标记为已拣货
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table border highlight-row ref="selection" :columns="columns" :loading="TableLoading" :data="data"
            @on-selection-change="tableChange" :height="tableHeight"></Table>
        </div>
      </div>

      <!--分页-->
      <div class="pagesMain">
        <Page :total="tableItemTotal" :current="formItem.pageNum" :page-size="formItem.pageSize" show-total show-sizer
          show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>
    <div v-if="workShow === 'detail'">
      <pickListDtl :pickingGoodsNo="pickingGoodsNo" :pickingStatus="pickingStatus" where="other" @goList="goList"
        :pickingDetail="pickingDetail"></pickListDtl>
    </div>
  </div>
</template>
<script>
import dropDown from "@/views/wms/components/common/dropDownOpt";
import pickListDtl from "./pickListDtl";
import api from "@/api/api";
import common from "@/components/mixin/common_mixin";
import printMixin from "@/components/mixin/print_mixin";
import tableHeight_mixin from "@/components/mixin/tableHeight_mixin";

export default {
  mixins: [common, printMixin, tableHeight_mixin],
  components: {
    dropDown,
    pickListDtl,
  },
  data() {
    var v = this;
    return {
      labelWidth: 90,
      workShow: "list",

      tableItemTotal: 0,
      pickingGoodsNo: "", // 拣货单编号
      formItem: {
        pickingGoodsNoList: [],
        pickingNoList: [],
        pickListStatus: "",
        pickListType: "",
        pickingGoodsUploadCarrierStatus: null,
        printStatus: "",
        pageNum: 1,
        pageSize: 10,
        orderBy: "CT",
        orderSeq: "DESC",
      },
      wareId: v.getWarehouseId(),
      pickListStatusList: [
        {
          txt: "已拣货",
          check: false,
          value: "1",
        },
        {
          txt: "未拣货",
          check: false,
          value: "0",
        },
      ],
      pickListTypeList: [
        {
          txt: "单品",
          check: false,
          value: "SS",
        },
        {
          txt: "多品",
          check: false,
          value: "MM",
        },
      ],
      logisticsStatusList: [
        {
          txt: "全部",
          check: true,
          value: null,
        },
        {
          txt: "下发成功",
          check: false,
          value: 3,
        },
        {
          txt: "下发失败",
          check: false,
          value: 4,
        },
      ],
      printStatusList: [
        {
          txt: "已打印",
          check: false,
          value: 1,
        },
        {
          txt: "未打印",
          check: false,
          value: 0,
        },
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
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: "拣货单编号",
          key: "pickingGoodsNo",
          align: "center",
          minWidth: 160,
          render: (h, params) => {
            if (v.getPermission("wmsPickingGoods_detail_other")) {
              return h(
                "a",
                {
                  on: {
                    click: () => {
                      v.pickingGoodsNo = params.row.pickingGoodsNo;
                      v.pickingStatus = params.row.packageGoodsStatus;
                      v.workShow = "detail";
                      v.pickingDetail = params.row || {};
                    },
                  },
                  style: {
                    display: "inline-block",
                    width: "100%",
                    height: "100%",
                  },
                },
                params.row.pickingGoodsNo
              );
            } else {
              return h("div", params.row.pickingGoodsNo);
            }
          },
        },
        {
          title: "拣货单类型",
          key: "type",
          width: 160,
          align: "center",
        },
        {
          title: "拣货单状态",
          key: "status",
          align: "center",
          width: 120,
        },
        {
          title: "打印状态",
          key: "status",
          align: "center",
          width: 110,
          render: (h, params) => {
            return h(
              "div",
              params.row.printStatus === "0" ? "未打印" : "已打印"
            );
          },
        },
        {
          title: "出库单数",
          key: "pickingNumber",
          align: "center",
          width: 110,
        },
        {
          title: "SKU数",
          key: "goodsSkuNumber",
          align: "center",
          width: 110,
        },
        {
          title: "货品数",
          key: "goodsQuantityNumber",
          align: "center",
          width: 110,
        },
        {
          title: "拣货完成时间",
          key: "finishTime",
          width: 160,
          align: "center",
        },
        {
          title: "创建人",
          key: "createdByName",
          width: 140,
          align: "center",
        },
        {
          title: "创建时间",
          key: "createdTime",
          width: 160,
          align: "center",
        },
        {
          title: "操作",
          key: "op",
          width: 160,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h(
              dropDown,
              {
                props: {
                  dropList: [
                    {
                      code: "打印拣货单",
                      value: "1",
                      flagCode: ["1"],
                      status: this.getPermission("wmsPickingGoods_print_other")
                        ? "1"
                        : -1,
                    },
                    {
                      code: "标记为已拣货",
                      value: "2",
                      flagCode: ["0"],
                      status: this.getPermission(
                        "wmsPickingGoods_modifyToPicking_otherSingle"
                      )
                        ? params.row.packageGoodsStatus
                        : -1,
                    },
                    {
                      code: "删除",
                      value: "3",
                      flagCode: ["0"],
                      status: this.getPermission("wmsPickingGoods_remove_other")
                        ? params.row.packageGoodsStatus
                        : -1,
                    },
                  ],
                  styleData: { width: "80px" },
                  txt: "操作",
                  listenNormal: false,
                },
                on: {
                  nameValBack: (val) => {
                    if (val === "2") {
                      if (
                        this.getPermission(
                          "wmsPickingGoods_modifyToPicking_otherSingle"
                        )
                      ) {
                        this.markHasPicked({
                          pickingGoodsNos: [params.row.pickingGoodsNo],
                        });
                      } else {
                        this.$Message.warning("没有权限");
                      }
                    } else if (val === "3") {
                      if (this.getPermission("wmsPickingGoods_remove_other")) {
                        this.getGenerateSituation(params.row).then(() => {
                          // 删除
                          this.axios
                            .post(
                              api.delete_listPickNo +
                              "?pickingGoodsNo=" +
                              params.row.pickingGoodsNo +
                              "&packageGoodsStatus=" +
                              params.row.packageGoodsStatus
                            )
                            .then((res) => {
                              if (res.data.code === 0) {
                                this.$Message.success("操作成功!");
                                this.searchFn();
                              }
                            })
                            .finally(() => {
                              this.$Modal.remove();
                            });
                        });
                      } else {
                        this.$Message.warning("没有权限");
                      }
                    } else if (val === "1") {
                      let goto = this.$router.resolve({
                        path: "/printPickList",
                        query: {
                          warehouseId: this.getWarehouseId(),
                          data: params.row.pickingGoodsNo,
                          type: "pickList",
                        },
                      });
                      window.open(goto.href, "_blank");
                    }
                  },
                },
              },
              []
            );
          },
        },
      ],
      data: [],
      tableSltData: [],
      pickingStatus: "",
      pickingGoodsNos: [],
      pickingDetail: {}, // 出库单详情
    };
  },
  methods: {
    logisticsChange(value) {
      this.logisticsStatusList.forEach((it) => {
        it.check = value === it.value;
      });
      this.formItem.pickingGoodsUploadCarrierStatus = value;
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.formItem.orderSeq = type;
      this.formItem.orderBy = feild;
      this.searchFn();
    },
    search() {
      this.formItem.pageNum = 1;
      this.searchFn();
    },
    searchFn() {
      // 查询函数
      this.formItem.pageSize = this.getPageSizeCache();
      if (this.getPermission("wmsPickingGoods_list_other")) {
        let obj = {
          warehouseId: this.wareId,
          packageGoodsStatus: this.formItem.pickListStatus,
          packageGoodsType: this.formItem.pickListType,
          pickingGoodsNoList: this.formItem.pickingGoodsNoList,
          pickingNoList: this.formItem.pickingNoList,
          pageNum: this.formItem.pageNum,
          pageSize: this.formItem.pageSize,
          orderSeq: this.formItem.orderSeq,
          orderBy: this.formItem.orderBy,
          pickingGoodsUploadCarrierStatus:
            this.formItem.pickingGoodsUploadCarrierStatus,
          printStatus: this.formItem.printStatus,
          pickingType: "",
        };
        let data = this.$common.removeEmpty(obj);

        this.TableLoading = true;
        this.SearchDisabled = true;
        this.axios.post(api.get_pickList, data).then((res) => {
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
      data.forEach((val) => {
        val.type =
          val.packageGoodsType === "SS"
            ? "单品"
            : val.packageGoodsType === "SM"
              ? "单品"
              : val.packageGoodsType === "MM"
                ? "多品"
                : "";
        val.status =
          val.packageGoodsStatus === "0"
            ? "未拣货"
            : val.packageGoodsStatus === "1"
              ? "已拣货"
              : "";
        val.finishTime = val.finishTime
          ? this.$uDate.dealTime(val.finishTime)
          : "";
        val.createdTime = val.createdTime
          ? this.$uDate.dealTime(val.createdTime)
          : "";
      });
      return data;
    },
    markHasPicked(params) {
      // 标记为已发货
      this.axios.post(api.mark_hasPicked, params).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success("标记成功");
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
      let tableSltData = this.tableSltData;
      if (!tableSltData.length) {
        this.$Message.warning({
          content: "请选择操作数据",
          duration: 3,
        });
        return;
      }
      if (val === "1") {
        let arr = tableSltData.map((val) => {
          return val.pickingGoodsNo;
        });
        this.markHasPicked({ pickingGoodsNos: arr });
      } else {
        let arr = tableSltData.map((k) => k.pickingGoodsNo);
        let goto = this.$router.resolve({
          path: "/printPickListBatch",
          query: {
            warehouseId: this.getWarehouseId(),
            data: arr.join(","),
            type: "pickList",
            where: "other",
          },
        });
        window.open(goto.href, "_blank");
      }
    }, // 重置按钮
    reset() {
      this.$refs["formItem"].resetFields();
    },
    goList(val) {
      this.workShow = val;
    },
    // 查询出库单拣货单关系 (出库单:拣货单 -> 1:1 返回0, *:1 返回1, 1:* 返回2, *:* 返回3)
    getGenerateSituation(row) {
      return new Promise((resolve, reject) => {
        this.TableLoading = true;
        this.axios
          .post(
            `${api.generateSituation}?pickingGoodsNo=${row.pickingGoodsNo}&pickingNo=''`
          )
          .then(({ data }) => {
            if (data.code === 0) {
              if (!data.datas) {
                resolve();
                return;
              }
              let content = {
                1: "该拣货单删除后会删除多张出库单的拣货信息",
                2: "该拣货单删除后会删除对应出库单的所有拣货单",
                3: "该拣货单删除后会删除对应出库单的所有拣货单",
              };
              this.$Modal.confirm({
                title: "提示",
                content: `<p>${content[data.datas]}</p>`,
                loading: true,
                onOk: () => {
                  resolve();
                },
              });
            } else {
              resolve();
            }
          })
          .catch(() => {
            resolve();
          })
          .finally(() => {
            this.TableLoading = false;
          });
      });
    },
  },
  watch: {
    workShow: function (val) {
      if (val === "list") {
        this.searchFn();
      }
    },
  },
  created() {
    this.searchFn();
  },
};
</script>
<style lang="less" scoped>
.otherStockOutPickList {
  height: 100%;

  .search {
    margin-left: 20px;
  }

  .dataSort {
    margin: 10px 0;
  }
}
</style>
