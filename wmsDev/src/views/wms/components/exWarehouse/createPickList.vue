<template>
  <div class="list">
    <div v-if="defaultShow">
      <h5>您当前筛选的包裹汇总信息：</h5>
      <packInfo :fatherTableData="fatherTableData"></packInfo>
      <h5>拣货单生成规则：</h5>
      <!--  @backSlt="backSlt" -->
      <pickListRule ref="pickListRuleOrder" :show="false" :sortedType="sortedType"
        :isSplitCombination="isSplitCombination" :maxsku="maxsku" :update="ruleConfig">
      </pickListRule>
      <h5>拣货标签：</h5>
      <Input v-model="picking_text" type="textarea" :autosize="{ minRows: 4 }"></Input>
      <h5>常用标签：</h5>
      <span class="tag_boxs" v-for="(item, index) in countLabels" :key="index" @click="selectTag(item)">{{ item }}</span>
      <div class="operate-btn">
        <Button type="primary" @click="clickBtn" :disabled="disabledCreateBtn">生成拣货单</Button>
      </div>
    </div>
    <div v-else>
      <successCrtPickList :createAfterTableData="createAfterTableData"></successCrtPickList>
      <div class="operate-btn">
        <Button type="primary" @click="toPickList" style="margin-right: 20px"
          v-if="ispickList.pickList || ispickList.otherStockOutPickList">去拣货单列表</Button>
        <Button type="primary" @click="close">关闭</Button>
      </div>
    </div>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>
<style lang="less" scoped>
.tag_boxs {
  height: 30px;
  line-height: 30px;
  display: inline-block;
  text-align: center;
  color: #333;
  border: 1px solid #ccc;
  padding: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  margin: 0 10px 10px 0;
}
</style>
<script>
import packInfo from "./packInfo";
import pickListRule from "./pickListRule";
import successCrtPickList from "./successCrtPickList";
import api from "@/api/api";
import menu from "@/api/menu/menuWarehouse";
import layoutMix from "@/components/mixin/layout_mixin";
import commonMixin from "@/components/mixin/common_mixin";
import { outListTypeList } from "@/views/wms/stockOUt/otherStouck/components/fileData.js";
import { pickingTypeList } from "@/views/wms/stockOUt/fullyManage/components/fileData.js";

export default {
  props: [
    "apiParams",
    "apiCondition",
    "type",
    "createType",
    "clickRowObj",
    "searchParams",
    "countLabels",
    "sortedType",
    "isSplitCombination",
    "maxsku",
  ],
  mixins: [layoutMix, commonMixin],
  data() {
    return {
      defaultShow: true,
      createAfterTableData: [],
      stockOutType: [
        {
          code: "单品",
          value: "SS",
        },
        {
          code: "多品",
          value: "MM",
        },
      ],
      fatherTableData: [],
      errorFlag: false,
      errorTips: "",
      disabledCreateBtn: false,
      pageLoading: false,
      picking_text: "",
      ispickList: {
        pickList: "",
        otherStockOutPickList: "",
      },
      typelist: {
        lendSample: 'J1',
        sell: "S1",
        other: "O3",
      },
      // sortedType: '0', // 拣货顺序
      // isSplitCombination: '1'// 是否组合
    };
  },
  components: {
    packInfo,
    pickListRule,
    successCrtPickList,
  },
  methods: {
    // 中英文逗号分隔
    chEnCsv(params) {
      let arr = [];
      if (params.indexOf(",") > -1) {
        let initArr = params.split(",");
        initArr.forEach((val) => {
          if (val.indexOf("，") > -1) {
            arr = [...arr, ...val.split("，")];
          } else {
            arr = [...arr, val];
          }
        });
      } else if (params.indexOf("，") > -1) {
        let initArr = params.split("，");
        initArr.forEach((val) => {
          if (val.indexOf(",") > -1) {
            arr = [...arr, ...val.split(",")];
          } else {
            arr = [...arr, val];
          }
        });
      } else {
        arr.push(params);
      }
      return arr;
    },
    // 生成拣货单
    clickBtn() {
      let v = this;
      if (this.errorFlag) {
        this.$Message.warning({
          content: this.errorTips,
          duration: this.$store.state.messageTipsDuration,
        });
        return;
      }
      let arr = [];
      if (this.createType === "select") {
        arr = this.apiParams.map((val) => {
          return val.pickingNo;
        });
      }
      if (this.createType === "single") {
        arr = [this.clickRowObj.pickingNo];
      }
      let sltParams = this.$refs.pickListRuleOrder
        ? this.$refs.pickListRuleOrder.sltParams
        : {}; // 规则数据
      let obj = {
        pickingNos: arr,
        remark: this.picking_text,
        maxPickingsNum: sltParams.max,
        allowDiffLogisticsDealer: sltParams.num2,
        allowDiffWarehouseBlock: sltParams.areaNum,
        allowDiffWarehouseBlockGroup: sltParams.groupNum,
        pickingGoodsType: this.typelist[this.type] || "O3",
        allowDiffMailMode: sltParams.num2 === "1" ? null : sltParams.num3,
      };
      if (this.createType === "all") {
        delete obj.pickingNos;
        obj = Object.assign(obj, v.searchParams);
      }

      if (this.sortedType) obj.sortedType = sltParams.sortedType; // 拣货顺序
      obj.isSplitCombination = false; // 是否组合
      if (this.isSplitCombination) { obj.isSplitCombination = sltParams.isSplitCombination === "1"; } // 是否组合
      if (this.maxsku) {
        obj.generateType = sltParams.max ? "0" : "1"; // 拣货单生成类型 0以最大出库单数生成 1以最大sku数生成
        obj.maxPickingsNum = sltParams.max || sltParams.maxsku; // 对应类型填入的值
      }

      // 检验拣货规则是否正常
      this.validatePickListRuleOrder().then((res) => {
        if (!res) return;
        const type = this.type;
        let overHouseList = outListTypeList.map((k) => k.value);
        let directList = Object.values(pickingTypeList).map((k) => k.value);

        let rqApi = api.create_pickList;
        if (["other", 'lendSample', ...overHouseList].includes(type)) { rqApi = api.createOtherPickingGoods; }
        if (directList.includes(type)) rqApi = api.directCreateOtherPickingGoods;

        this.$Spin.show();
        this.axios
          .post(rqApi, obj)
          .then((res) => {
            this.$Spin.hide();
            if (res.data.code === 0) {
              this.$Message.success("生成成功");
              this.picklistPower();
              let data = res.data.datas;
              data.forEach((val1) => {
                this.stockOutType.forEach((val2) => {
                  if (val1.packageGoodsType === val2.value) {
                    val1.type = val2.code;
                  }
                });
              });
              this.createAfterTableData = data;
              this.defaultShow = false;
            }
          })
          .catch(() => {
            this.$Spin.hide();
          });
      });
    },
    toPickList() {
      let url = this.type === "sell" ? "/pickList" : "/otherStockOutPickList";
      this.$router.push({ path: url, query: { warehouseId: this.getWarehouseId() } });
      this.close();
    },
    close() {
      this.$emit("closeSuccess");
      this.createAfterTableData = [];
      this.picking_text = "";
    },
    // backSlt (data) {
    //   this.maxPickingsNum = data.max;
    //   this.allowDiffLogisticsDealer = data.num2;
    //   this.allowDiffMailMode = data.num3;
    //   this.allowDiffWarehouseBlock = data.areaNum; // 库区
    //   this.allowDiffWarehouseBlockGroup = data.groupNum; // 库区组
    //   this.sortedType = data.sortedType; // 拣货顺序
    // },
    getOtherStockApiCondition() {
      let [obj, apiCondition] = [{}, this.apiCondition];
      obj.packageGoodsStatus = apiCondition.picked === "*" ? null : apiCondition.picked;
      obj.packageType =
        apiCondition.packType === "" || apiCondition.packType[0] === "*"
          ? null
          : apiCondition.packType;
      obj.pickingGoodsNo =
        apiCondition.pickNo === "" ? null : this.chEnCsv(apiCondition.pickNo);
      obj.pickingNos =
        apiCondition.outListNo === "" ? null : this.chEnCsv(apiCondition.outListNo);
      obj.pickingStatus =
        apiCondition.outListStatus === "" || apiCondition.outListStatus[0] === "*"
          ? null
          : apiCondition.outListStatus; // 出库单状态
      obj.pickingType =
        apiCondition.outListType === "" || apiCondition.outListType[0] === "*"
          ? ["O1", "O2", "O3"]
          : apiCondition.outListType;
      obj.referenceNo =
        apiCondition.referenceNo === "" ? null : this.chEnCsv(apiCondition.referenceNo);
      obj.saleChannel =
        apiCondition.channelSell === "" || apiCondition.channelSell[0] === "*"
          ? null
          : apiCondition.channelSell;
      obj.pickingExtendList = apiCondition.logisticType;
      return obj;
    },
    // 选中常用标签
    selectTag(name) {
      let text = this.picking_text;
      if (text !== "") {
        this.picking_text = text + "，" + name;
      } else {
        this.picking_text = name;
      }
    },
    // 判断是否有拣货单列表页面权限
    picklistPower() {
      const obj = {
        pickList: "/pickList",
        otherStockOutPickList: "/otherStockOutPickList",
      };
      this.filterPath(menu.menu, obj);
    },
    filterPath(data, obj) {
      if (!(data && data.length)) return;
      data.forEach((k) => {
        if (k.children && k.children.length) {
          this.filterPath(k.children, obj);
        }
        for (let i in obj) {
          if (k.path && k.path === obj[i]) {
            const path = k.path.slice(1);
            this.ispickList[path] = k.id;
          }
        }
      });
    },
    // 初始化数据
    initData() {
      let obj = {
        warehouseId: [this.getWarehouseId()],
        pickingNos: (this.apiParams || []).map((val) => val.pickingNo),
        pickingType: this.typelist[this.type] ? [this.typelist[this.type]] : ["O3"],
      };
      if (this.createType === "single") {
        obj.pickingNos = [this.clickRowObj.pickingNo];
      }
      if (this.createType === "all") {
        if (this.type === "sell") {
          delete obj.pickingNos;
          obj = Object.assign(obj, this.searchParams);
        } else {
          let objects = this.getOtherStockApiCondition();
          obj = { ...obj, ...objects };
        }
      }
      let apiUrl = this.type === "sell" ? api.get_sellStockTableInfo : api.get_otherStockTableInfo;
      this.pageLoading = true;
      this.axios.post(apiUrl, obj).then((res) => {
        if (res.data.code === 0) {
          if (res.data.datas) {
            this.fatherTableData = res.data.datas;
            this.disabledCreateBtn = false;
          } else {
            this.disabledCreateBtn = true;
          }
        } else {
          this.disabledCreateBtn = false;
          this.errorFlag = true;
          this.errorTips = res.data.message;
          setTimeout(() => {
            this.$parent.$parent.createPickListModel = false;
          }, 1000);
        }
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 检验拣货单规则是否验证通过
    validatePickListRuleOrder() {
      let pickListRuleOrder = this.$refs["pickListRuleOrder"];
      if (!pickListRuleOrder) {
        return new Promise((resolve, reject) => {
          resolve(true);
        });
      }
      return pickListRuleOrder.handleSubmit();
    },
  },
  created() {
    [...outListTypeList, ...Object.values(pickingTypeList)].forEach((k) => {
      // 新增的出库单类型
      this.typelist[k.value] = k.value;
    });
    this.defaultShow = true;
    this.initData();
  },
  computed: {
    ruleConfig() {
      let ruleOption = {
        allowDiffLogisticsDealer: '0',
        allowDiffMailMode: '0',
        allowDiffWarehouseBlockGroup: '0',
        allowDiffWarehouseBlock: '0',
        maxPickingsNum: 20,
      }
      if (['/directOtherStockOut'].includes(this.$route.path)) {
        ruleOption.maxPickingsNum = 1;
      }
      return ruleOption;
    }
  },
  watch: {
    apiParams: function (newValue) {
      this.initData();
    },
  },
};
</script>
<style scoped lang="less">
.list {
  position: relative;

  h5 {
    padding: 9px 0;
  }

  .operate-btn {
    position: sticky;
    padding: 10px;
    width: calc(100% + 32px);
    margin-left: -16px;
    bottom: -16px;
    text-align: center;
    background: #fff;
    border-top: 1px solid #ccc;
    box-shadow: 0 -2px 3px #ccc;
  }
}
</style>
