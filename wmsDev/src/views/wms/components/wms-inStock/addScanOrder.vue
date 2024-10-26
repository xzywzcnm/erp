<template>
  <div>
    <div class="modalItemContent">
      <div class="addModalData">
        <Form
          :model="newScanOrderParams"
          label-position="right"
          :label-width="90"
          ref="newScanOrderParams"
          :rules="ruleValidate"
        >
          <div class="inventory_style">
            <FormItem label="新增条件：" class="inventory_item">
              <Select v-model="newConditions" multiple style="width: 245px">
                <Option
                  v-for="item in newConditionsList"
                  :value="item.value"
                  :key="item.value"
                  >{{ item.title }}
                </Option>
              </Select>
            </FormItem>
            <Form-item
              label="盘点类型："
              class="inventory_item"
              style="margin-left: 75px"
            >
              <RadioGroup v-model="newScanOrderParams.checkType">
                <!-- <Radio label="0">按批次盘点</Radio> -->
                <Radio label="1">按库位盘点</Radio>
              </RadioGroup>
            </Form-item>
          </div>
          <Form-item label="产品：" v-if="newConditions.indexOf(1) > -1">
            <Input
              v-model.trim="newScanOrderParams.productSku"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 6 }"
              placeholder="可输入多个SKU，用逗号或者换行隔开"
              style="width: 357px"
            ></Input>
            <Icon type="md-close-circle" class="opts_icon" @click.native="hideBtn(1)" />
          </Form-item>
          <div class="inventory_style" v-if="newConditions.indexOf(2) > -1">
            <Col :span="12">
              <Form-item label="库区：" prop="fromWareBlock">
                <Select
                  clearable
                  v-model="newScanOrderParams.fromWareBlock"
                  style="width: 220px"
                  @on-change="selectToBlockName"
                  filterable
                >
                  <Option
                    v-for="item in wareFromBlockNameList"
                    :value="item.warehouseBlockId"
                    :label="item.warehouseBlockName"
                    :key="item.warehouseBlockId"
                    >{{ item.warehouseBlockName }}
                  </Option>
                </Select>
              </Form-item>
            </Col>
            <Col :span="12">
              <Form-item label="to" prop="toWareBlock">
                <Select
                  clearable
                  v-model="newScanOrderParams.toWareBlock"
                  style="width: 200px"
                  @on-change="selectFromLocateName"
                  filterable
                >
                  <Option
                    v-for="item in wareToBlockNameList"
                    :value="item.warehouseBlockId"
                    :label="item.warehouseBlockName"
                    :key="item.warehouseBlockId"
                    >{{ item.warehouseBlockName }}
                  </Option>
                </Select>
                <Icon
                  type="md-close-circle"
                  class="opts_icon"
                  @click.native="hideBtn(2)"
                />
              </Form-item>
            </Col>
          </div>
          <div
            class="inventory_style"
            v-if="
              newScanOrderParams.fromWareBlock &&
              newScanOrderParams.toWareBlock &&
              newConditions.indexOf(2) > -1
            "
          >
            <Col :span="12">
              <Form-item label="库位：" prop="fromLocation">
                <Select
                  clearable
                  filterable
                  remote
                  transfer
                  placement="top"
                  :remote-method="getWarehouseLocation1"
                  :loading="loading2"
                  @click.native="getWarehouseLocation1('')"
                  placeholder="输入搜索词进行远程查询"
                  v-model="newScanOrderParams.fromLocation"
                  style="width: 220px"
                >
                  <Option
                    v-for="item in wareFromLocateNameList"
                    :value="item.warehouseLocationId"
                    :label="item.warehouseLocationName"
                    :key="item.warehouseLocationId"
                    >{{ item.warehouseLocationName }}
                  </Option>
                </Select>
              </Form-item>
            </Col>
            <Col :span="12">
              <Form-item label="to" prop="toLocation">
                <Select
                  clearable
                  filterable
                  remote
                  transfer
                  placement="top"
                  :remote-method="getWarehouseLocation"
                  :loading="loading3"
                  @click.native="getWarehouseLocation('')"
                  placeholder="输入搜索词进行远程查询"
                  v-model="newScanOrderParams.toLocation"
                  style="width: 200px"
                >
                  <Option
                    v-for="item in wareToLocateNameList"
                    :value="item.warehouseLocationId"
                    :label="item.warehouseLocationName"
                    :key="item.warehouseLocationId"
                    >{{ item.warehouseLocationName }}
                  </Option>
                </Select>
              </Form-item>
            </Col>
          </div>
          <div class="inventory_style" v-if="newConditions.indexOf(3) > -1">
            <Form-item>
              <Row>
                <Col span="6">
                  <Checkbox v-model="newScanOrderParams.dynCheck">动态盘点</Checkbox>
                </Col>
              </Row>
              <Row>
                <Col span="10">
                  <Form-item prop="startTime">
                    <DatePicker
                      type="datetime"
                      transfer
                      placeholder="开始时间"
                      v-model="newScanOrderParams.startTime"
                      :disabled="!newScanOrderParams.dynCheck"
                      :options="pickerBeginDateBefore"
                    ></DatePicker>
                  </Form-item>
                </Col>
                <Col span="2" style="text-align: center">
                  <span>to</span>
                </Col>
                <Col span="10">
                  <Form-item prop="endTime">
                    <DatePicker
                      type="datetime"
                      transfer
                      placeholder="结束时间"
                      v-model="newScanOrderParams.endTime"
                      :disabled="!newScanOrderParams.dynCheck"
                      :options="pickerBeginDateAfter"
                    ></DatePicker>
                  </Form-item>
                </Col>
                <Col span="2">
                  <Icon
                    type="md-close-circle"
                    class="opts_icon"
                    @click.native="hideBtn(3)"
                  />
                </Col>
              </Row>
            </Form-item>
          </div>
          <Form
            :model="newScanOrderParams"
            label-position="left"
            ref="newScanOrderParams"
          >
            <Row>
              <Col span="13">
                <Form-item>
                  <Checkbox v-model="newScanOrderParams.selectCheckEmpty"
                    >空库位<span style="color: red">(盘点任务中是否包含空库位)</span>
                  </Checkbox>
                </Form-item>
              </Col>
              <Col span="11">
                <Form-item>
                  <Checkbox v-model="newScanOrderParams.selectCheckBlind"
                    >盲盘<span style="color: red">(盘点单是否展示系统库存)</span>
                  </Checkbox>
                </Form-item>
              </Col>
            </Row>
          </Form>
        </Form>
      </div>
    </div>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],
  data() {
    // let v = this;
    return {
      newConditions: [],
      newConditionsList: [
        {
          value: 1,
          title: "产品",
        },
        {
          value: 2,
          title: "库区",
        },
        {
          value: 3,
          title: "动态盘点",
        },
      ],
      loading2: false,
      loading3: false,
      wareId: this.getWarehouseId(),
      wareHouseTypeList: [], // 选择仓库
      wareFromBlockNameList: [], // 选择from库区
      wareToBlockNameList: [], // 选择to库区
      wareFromLocateNameList: [], // 选择From库位
      wareToLocateNameList: [], // 选择To库位
      newScanOrderParams: {
        selectWareHouse: "", // 选择仓库
        productSku: "", // 输入产品SKU
        fromWareBlock: "", // from库区
        toWareBlock: "", // to库区
        fromLocation: "", // from库位
        toLocation: "", // to库位
        startTime: "", // 开始时间
        endTime: "", // 结束时间
        selectCheckEmpty: false, // 空库位
        selectCheckBlind: false, // 盲盘
        dynCheck: false, // 勾选是否动态盘点，时间区间选择
        checkType: "1", // 盘点类型 默认选中 按批次盘点
      },
      ruleValidate: {
        selectWareHouse: [
          {
            required: true,
            message: "盘点仓库不能为空，请选择仓库",
            trigger: "change",
          },
        ],
      },
      pickerBeginDateBefore: {
        disabledDate: (time) => {
          let beginDateVal = this.newScanOrderParams.endTime;
          if (beginDateVal) {
            return time.getTime() > beginDateVal;
          }
        },
      },
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          let beginDateVal = this.newScanOrderParams.startTime;
          if (beginDateVal) {
            return time.getTime() < beginDateVal;
          }
        },
      },
    };
  },
  props: {
    openFlag: {
      // 打开模态框的标记
      default: null,
    },
  },
  watch: {
    "$store.state.addScanWatchFlag": function (bool) {
      if (bool) {
        var v = this;
        v.newConditions = [];
        v.newScanOrderParams.checkType = "1";
        v.newScanOrderParams.productSku = "";
        v.newScanOrderParams.fromLocation = "";
        v.newScanOrderParams.toLocation = "";
        v.newScanOrderParams.fromWareBlock = "";
        v.newScanOrderParams.toWareBlock = "";
        v.newScanOrderParams.startTime = "";
        v.newScanOrderParams.endTime = "";
        v.newScanOrderParams.selectCheckBlind = false; // 盲盘
        v.newScanOrderParams.selectCheckEmpty = false; // 空库位
        v.newScanOrderParams.dynCheck = false;
      }
    },
    newConditions: {
      handler(data) {
        let v = this;
        if (data.length > 0) {
          if (v.wareFromBlockNameList.length <= 0) {
            v.selectWareBlock();
          }
          if (data.indexOf(1) <= -1) {
            // 产品sku
            v.newScanOrderParams.productSku = "";
          } else if (data.indexOf(2) <= -1) {
            // 库区 库位
            v.newScanOrderParams.fromWareBlock = "";
            v.newScanOrderParams.toWareBlock = "";
            v.newScanOrderParams.fromLocation = "";
            v.newScanOrderParams.toLocation = "";
          } else if (data.indexOf(3) <= -1) {
            // 动态盘点
            v.newScanOrderParams.dynCheck = false;
            v.newScanOrderParams.startTime = "";
            v.newScanOrderParams.endTime = "";
          }
        }
      },
      deep: true,
    },
  },
  created() {
    // this.getWareHouseName(); // 渲染仓库下拉列表
  },
  methods: {
    getWarehouseLocation(query) {
      let v = this;
      return new Promise((resolve) => {
        if (query !== "") {
          v.newScanOrderParams.warehouseLocationId = "";
        }
        this.getPositionListNew(
          ["00", "10", "11", "12", "20"],
          "0,1,3",
          query,
          v.newScanOrderParams.toWareBlock
        ).then((data) => {
          if (data.length === 0) {
            v.$Message.info("无相关匹配库位");
            return;
          }
          data.forEach((i) => {
            if (i.warehouseLocationName === query) {
              v.newScanOrderParams.toLocation = i.warehouseLocationId;
            }
          });
          v.wareToLocateNameList = data;
          resolve();
        });
      });
    },
    getWarehouseLocation1(query) {
      let v = this;
      return new Promise((resolve) => {
        if (query !== "") {
          v.newScanOrderParams.fromLocation = "";
        }
        this.getPositionListNew(
          ["00", "10", "11", "12", "20"],
          "0,1,3",
          query,
          v.newScanOrderParams.fromWareBlock
        ).then((data) => {
          if (data.length === 0) {
            v.$Message.info("无相关匹配库位");
            return;
          }
          data.forEach((i) => {
            if (i.warehouseLocationName === query) {
              v.newScanOrderParams.fromLocation = i.warehouseLocationId;
            }
          });
          v.wareFromLocateNameList = data;
          resolve();
        });
      });
    },
    getScanParams() {
      // 获取新增库存盘点的所有数据
      var v = this;
      var goodsArr = []; // 输入产品SKU
      if (v.newScanOrderParams.productSku !== "" && v.newConditions.indexOf(1) > -1) {
        goodsArr = v.sepCommasFn(v.newScanOrderParams.productSku); // 输入产品SKU
      } else {
        goodsArr = null;
      }
      if (v.newScanOrderParams.dynCheck) {
        if (
          (!v.newScanOrderParams.startTime || !v.newScanOrderParams.endTime) &&
          v.newConditions.indexOf(3) > -1
        ) {
          v.$Message.error("请填写完整动态盘点时间");
          return;
        }
      }

      // 部分盘点规则
      var partScanObj = {
        goodsSkuList: goodsArr, // 输入产品SKU
        fromWarehouseBlockId:
          v.newScanOrderParams.fromWareBlock === ""
            ? null
            : v.newScanOrderParams.fromWareBlock, // from库区ID
        toWarehouseBlockId:
          v.newScanOrderParams.toWareBlock === ""
            ? null
            : v.newScanOrderParams.toWareBlock, // to库区ID
        fromWarehouseLocationId:
          v.newScanOrderParams.fromLocation === ""
            ? null
            : v.newScanOrderParams.fromLocation, // from库位ID
        toWarehouseLocationId:
          v.newScanOrderParams.toLocation === "" ? null : v.newScanOrderParams.toLocation, // to库位ID
        beginDate:
          v.newScanOrderParams.dynCheck === true ? v.newScanOrderParams.startTime : null, // 动态盘点开始日期
        endDate:
          v.newScanOrderParams.dynCheck === true ? v.newScanOrderParams.endTime : null, // 动态盘点结束日期
      };
      var obj = {
        warehouseId: v.wareId, // 选择仓库
        scopeFlag: v.newConditions.length > 0 ? "0" : "1", // 选择盘点范围
        checkType: v.newScanOrderParams.checkType, // 选择盘点类型
        scopeCondition: v.newConditions.length === 0 ? null : JSON.stringify(partScanObj), // 部分盘点的规则
        blindFlag: v.newScanOrderParams.selectCheckBlind === true ? "1" : "0", // 盲盘
        emptyFlag: v.newScanOrderParams.selectCheckEmpty === true ? "1" : "0", // 空库位
      };
      return obj;
    },
    getWareHouseName() {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectScanWareHouseName).then((res) => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    selectWareBlock(val) {
      // 选择库区/库位
      this.getWareBlockName(); // 调用库区下拉列表
      // this.getFromWareLocationName();
      // this.getToWareLocationName();
    },
    selectToBlockName(val) {
      // 选择To库区
      this.newScanOrderParams.fromLocation = "";
      this.newScanOrderParams.toLocation = "";
      this.newScanOrderParams.fromWareBlock = val; // from库区ID
      if (
        this.newScanOrderParams.toWareBlock === "" ||
        this.newScanOrderParams.toWareBlock === null
      ) {
        this.getWareToBlockName();
        return;
      }
      this.getWareToBlockName();
      // this.getFromWareLocationName();
      // this.getToWareLocationName();
    },
    selectFromLocateName(val) {
      // 选择from库位
      if (val) {
        this.newScanOrderParams.fromLocation = "";
        this.newScanOrderParams.toLocation = "";
        this.newScanOrderParams.toWareBlock = val; // to库区ID
        // this.getFromWareLocationName();
        // this.getToWareLocationName();
      }
    },
    selectToLocateName(val) {
      // 选择to库位
      this.newScanOrderParams.fromLocation = val; // from库位ID
      // this.getToWareLocationName();
    },
    getWareBlockName() {
      // 获取from库区下拉列表
      var v = this;
      var obj = {
        queryLinkageType: "W", // 联动类型库区
        warehouseId: v.wareId, // 仓库ID
      };
      v.axios.post(api.selectLinkName, obj).then((res) => {
        if (res.data.code === 0) {
          v.wareFromBlockNameList = res.data.datas.wmsWarehouseBlock;
        }
      });
    },
    getWareToBlockName() {
      // 获取to库区下拉列表
      var v = this;
      var obj = {
        queryLinkageType: "W", // 联动类型库区
        warehouseId: v.wareId, // 仓库ID
        fromWarehouseBlockId: v.newScanOrderParams.fromWareBlock,
      };
      v.axios.post(api.selectLinkName, obj).then((res) => {
        if (res.data.code === 0) {
          v.wareToBlockNameList = res.data.datas.wmsWarehouseBlock;
        }
      });
    },
    getFromWareLocationName() {
      // From库位名称
      var v = this;
      let obj = null;
      if (
        v.newScanOrderParams.fromWareBlock === "" &&
        v.newScanOrderParams.toWareBlock === ""
      ) {
        obj = {
          queryLinkageType: "WB", // 联动类型库区
          warehouseId: v.wareId,
        };
        if (!v.wareId) {
          return;
        }
      } else {
        obj = {
          queryLinkageType: "WB", // 联动类型库区
          warehouseId: v.wareId,
          fromWarehouseBlockId: v.newScanOrderParams.fromWareBlock,
          toWarehouseBlockId: v.newScanOrderParams.toWareBlock,
        };
        if (!obj.warehouseId || !obj.fromWarehouseBlockId || !obj.toWarehouseBlockId) {
          return;
        }
      }
      if (v.newScanOrderParams.fromWareBlock && v.newScanOrderParams.toWareBlock) {
        v.axios.post(api.selectLinkName, obj).then((res) => {
          if (res.data.code === 0) {
            v.wareFromLocateNameList = res.data.datas.wmsWarehouseLocation;
          }
        });
      }
    },
    getToWareLocationName() {
      // To库位名称
      var v = this;
      let obj = null;
      if (
        v.newScanOrderParams.fromWareBlock === "" &&
        v.newScanOrderParams.toWareBlock === ""
      ) {
        obj = {
          queryLinkageType: "WB", // 联动类型库区
          fromWarehouseLocationId: v.newScanOrderParams.fromLocation,
          warehouseId: v.wareId,
        };
      } else {
        obj = {
          queryLinkageType: "WB", // 联动类型库区
          warehouseId: v.wareId,
          fromWarehouseBlockId: v.newScanOrderParams.fromWareBlock,
          toWarehouseBlockId: v.newScanOrderParams.toWareBlock,
          fromWarehouseLocationId: v.newScanOrderParams.fromLocation,
        };
      }
      v.axios.post(api.selectLinkName, obj).then((res) => {
        if (res.data.code === 0) {
          v.wareToLocateNameList = res.data.datas.wmsWarehouseLocation;
        }
      });
    },
    // 移除盘点选项
    hideBtn(value) {
      let v = this;
      let index = v.newConditions.indexOf(value);
      if (index > -1) {
        v.newConditions.splice(index, 1);
      }
    },
  },
};
</script>
<style>
.checkGroup .ivu-checkbox-wrapper {
  display: inline;
}
</style>

<style lang="less" scoped>
.addModalData {
  .opts_icon {
    font-size: 23px;
    margin-left: 20px;
    cursor: pointer;
  }

  .inventory_style {
    display: flex;
    align-items: center;

    :deep(.inventory_item) {
      .ivu-icon-ios-close {
        color: #666 !important;
      }
    }
  }
}
</style>
