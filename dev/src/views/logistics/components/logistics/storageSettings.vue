<template>
  <div class="storageSetting">
    <div class="selectCard">
      <div class="itemCard" style="background: #f8f9fd; height: 50px">
        <span>仓库名称</span>
      </div>
      <div
        class="itemCard"
        v-for="(item, index) in warehouseNameList"
        :key="item.id"
        style="cursor: pointer"
        @click="chooseWarehouseName(item, index)"
        :style="
          warehouseNameIndex == index ? 'background:#ebf5fe;color:#259CFC' : ''
        "
      >
        <span>{{ item.warehouseName }}</span>
      </div>
    </div>
    <div class="formStyle">
      <Button
        type="primary"
        @click="saveData"
        v-if="
          getPermission(
            'warehouseAssociationTemplate_addWarehouseLinkTemplateInfo'
          )
        "
        >保存</Button
      >
      <div class="lines mt10"></div>
      <Form :model="formData" :label-width="120" class="mt20 ml20">
        <Form-item label="操作费用：" prop="currency">
          <dyt-select
            v-model="formData.operatingExpenseTemplateId"
            style="width: 200px"
          >
            <Option
              v-for="item in OperatingTemplateList"
              :key="item.templateId"
              :label="item.templateName"
              :value="item.templateId"
            ></Option>
          </dyt-select>
        </Form-item>
        <Form-item label="仓储费用：" prop="currency">
          <dyt-select
            v-model="formData.storageCostTemplateId"
            style="width: 200px"
          >
            <Option
              v-for="item in storageTemplateList"
              :key="item.templateId"
              :label="item.templateName"
              :value="item.templateId"
            ></Option>
          </dyt-select>
        </Form-item>
        <Form-item label="出仓费用：" prop="currency">
          <dyt-select
            v-model="formData.outOfWarehouseExpensesTemplateId"
            style="width: 200px"
          >
            <Option
              v-for="item in deliverTemplateList"
              :key="item.templateId"
              :label="item.templateName"
              :value="item.templateId"
            ></Option>
          </dyt-select>
        </Form-item>
        <Form-item label="尾程物流运费：" prop="currency">
          <Card style="width: 88%">
            <Table border :columns="columns1" :data="tableData" width="1000">
              <template slot="template" slot-scope="scope">
                <dyt-select
                  v-model="tableData[scope.index].freightTemplateId"
                  style="width: 200px"
                >
                  <Option
                    v-for="item in freightTemplateList"
                    :key="item.templateId"
                    :label="item.templateName"
                    :value="item.templateId"
                  ></Option>
                </dyt-select>
              </template>
              <template slot="operate" slot-scope="scope">
                <div
                  style="color: red; cursor: pointer"
                  @click="deleteChannel(scope)"
                  v-if="
                    getPermission(
                      'warehouseAssociationTemplate_deleteWarehouseLinkTemplateInfo'
                    )
                  "
                >
                  删除
                </div>
              </template>
            </Table>
            <Button type="text" style="color: #5796eb" @click="addChannel"
              >+新增渠道</Button
            >
          </Card>
        </Form-item>
      </Form>
    </div>
    <Modal v-model="addChannelModal" title="新建渠道" width="40%">
      <Form
        :model="modalData"
        :label-width="90"
        class="mt20 ml20"
        ref="modalData"
        :rules="modalRules"
      >
        <Row>
          <Col :span="10">
            <Form-item label="渠道代码：" prop="channelCode">
              <dyt-input v-model="modalData.channelCode" style="width: 200px">
              </dyt-input>
            </Form-item>
          </Col>
          <Col :span="10">
            <Form-item label="渠道名称：" prop="channelName">
              <dyt-input v-model="modalData.channelName" style="width: 200px">
              </dyt-input>
            </Form-item>
          </Col>
        </Row>
        <Row>
          <Col :span="10">
            <Form-item label="物流商：" prop="logisticsProvider">
              <dyt-input
                v-model="modalData.logisticsProvider"
                style="width: 200px"
              >
              </dyt-input>
            </Form-item>
          </Col>
        </Row>
      </Form>
      <div slot="footer">
        <Button @click="confirm" type="primary">确定 </Button>
        <Button @click="addChannelModal = false">取消</Button>
      </div>
    </Modal>
    <Modal title="操作提示" v-model="deleteView" width="40%">
      <div class="deleteDialog">
        <span>请确定是否删除渠道：</span>
        <span style="color: #ee6f2d"> {{ warehouseName }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <Button @click="deleteView = false">取 消</Button>
        <Button type="primary" @click="deleteConfirm">确 定</Button>
      </span>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],
  data() {
    return {
      warehouseNameIndex: "",
      warehouseId: "",
      formData: {
        currency: "",
      },
      modalData: {
        channelCode: "",
        channelName: "",
        logisticsProvider: "",
      },
      modalRules: {
        channelCode: [
          {
            required: true,
            message: "请输入渠道代码",
            trigger: "blur",
          },
        ],
        channelName: [
          {
            required: true,
            message: "请输入渠道名称",
            trigger: "blur",
          },
        ],
        logisticsProvider: [
          {
            required: true,
            message: "请输入物流商",
            trigger: "blur",
          },
        ],
      },
      columns1: [
        {
          title: "渠道代码",
          key: "channelCode",
          width: 218,
        },
        {
          title: "渠道名称",
          key: "channelName",
          width: 200,
        },
        {
          title: "物流商",
          key: "logisticsProvider",
          width: 200,
        },
        {
          title: "物流价格模版",
          key: "freightTemplateId",
          slot: "template",
          width: 300,
        },
        {
          title: "操作",
          key: "operate",
          slot: "operate",
          width: 80,
        },
      ],
      tableData: [],
      addChannelModal: false,
      warehouseNameList: [], //仓库名称列表
      OperatingTemplateList: [], //操作费用列表
      storageTemplateList: [], //仓储费用列表
      deliverTemplateList: [], //出仓费用列表
      freightTemplateList: [], //模版列表
      deleteView: false, //删除渠道的弹窗
      warehouseName: "",
    };
  },
  mounted() {
    this.getWarehouseName();
    this.queryOperatingExpenseTemplate();
    this.queryStorageCostTemplate();
    this.queryOutOfWarehouseExpensesTemplate();
    this.queryFreightTemplate();
  },
  methods: {
    //获取仓库名字
    getWarehouseName() {
      if (
        !this.getPermission("warehouseAssociationTemplate_getWarehouseInfo")
      ) {
        return this.$Message.warning("没权限");
      }
      // this.$http.get('/WarehouseAssociationTemplate/queryWarehouseInfo').then(res => {
      this.axios.get(api.getWarehouseInfo).then((res) => {
        this.warehouseNameList = res.data.datas;
        this.chooseWarehouseName(this.warehouseNameList[0], 0);
      });
    },
    //获取操作费用
    queryOperatingExpenseTemplate() {
      this.axios.get(api.queryOperateExpenseTemplate).then((res) => {
        this.OperatingTemplateList = res.data.datas;
      });
    },
    //获取仓储费用
    queryStorageCostTemplate() {
      this.axios.get(api.queryStorageTemplateWarehouse).then((res) => {
        this.storageTemplateList = res.data.datas;
      });
    },
    //获取出仓费用
    queryOutOfWarehouseExpensesTemplate() {
      this.axios.get(api.queryOutOfWarehouseExpensesTemplate).then((res) => {
        this.deliverTemplateList = res.data.datas;
      });
    },
    //获取物流价格模版
    queryFreightTemplate() {
      this.axios.get(api.queryFreightTemplateWarehouse).then((res) => {
        this.freightTemplateList = res.data.datas;
      });
    },
    //获取仓库信息
    chooseWarehouseName(item, index) {
      if (
        !this.getPermission(
          "warehouseAssociationTemplate_queryWarehouseLinkTemplateInfo"
        )
      ) {
        return this.$Message.warning("没权限");
      }
      this.warehouseNameIndex = index;
      this.warehouseId = item.warehouseId;
      this.axios({
        method: "get",
        url: api.queryWarehouseLinkTemplateInfo,
        params: { warehouseId: this.warehouseId },
      }).then((res) => {
        if (res.data.datas != null) {
          let datas = res.data.datas;
          console.log(datas, "datas");
          this.$set(
            this.formData,
            "operatingExpenseTemplateId",
            datas.operatingExpenseTemplateId
          );
          this.$set(
            this.formData,
            "storageCostTemplateId",
            datas.storageCostTemplateId
          );
          this.$set(
            this.formData,
            "outOfWarehouseExpensesTemplateId",
            datas.outOfWarehouseExpensesTemplateId
          );
          this.tableData = datas.warehouseLinkFreightTemplateInfoVOS;
          console.log(this.formData, "formData");
          return;
        }
        this.formData.operatingExpenseTemplateId = "";
        this.formData.storageCostTemplateId = "";
        this.formData.outOfWarehouseExpensesTemplateId = "";
        this.tableData = [];
      });
    },
    ////保存数据
    saveData() {
      let temp = {};
      temp.operatingExpenseTemplateId =
        this.formData.operatingExpenseTemplateId;
      temp.outOfWarehouseExpensesTemplateId =
        this.formData.outOfWarehouseExpensesTemplateId;
      temp.storageCostTemplateId = this.formData.storageCostTemplateId;
      temp.warehouseId = this.warehouseId;
      temp.warehouseLinkFreightTemplateInfoQOS = this.tableData;
      return this.axios({
        method: "post",
        url: api.addWarehouseLinkTemplateInfo,
        data: temp,
      }).then((res) => {
        this.$Message.success("保存成功");
      });
    },
    confirm() {
      this.$refs["modalData"].validate((valid) => {
        if (valid) {
          console.log(this.modalData, "modalData");
          this.tableData.push(this.modalData);
          this.addChannelModal = false;
        }
      });
    },
    addChannel() {
      this.modalData = {
        channelCode: "",
        channelName: "",
        logisticsProvider: "",
      };
      this.addChannelModal = true;
    },
    deleteChannel(scope) {
      // this.tableData.splice(index, 1)
      console.log(scope, "scope");
      this.warehouseName = scope.row.channelName;
      this.channelIndex = scope.index;
      this.deleteView = true;
    },
    //删除确认
    deleteConfirm() {
      this.tableData.splice(this.channelIndex, 1);
      let temp = {};
      temp.operatingExpenseTemplateId =
        this.formData.operatingExpenseTemplateId;
      temp.outOfWarehouseExpensesTemplateId =
        this.formData.outOfWarehouseExpensesTemplateId;
      temp.storageCostTemplateId = this.formData.storageCostTemplateId;
      temp.warehouseId = this.warehouseId;
      temp.warehouseLinkFreightTemplateInfoQOS = this.tableData;
      return this.axios({
        method: "post",
        url: api.addWarehouseLinkTemplateInfo,
        data: temp,
      }).then((res) => {
        this.deleteView = false;
        this.$Message.success("删除成功");
      });
    },
  },
};
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  width: 2px;
}
.storageSetting {
  flex: 1;
  background: #ffffff;
  padding: 10px;
  display: flex;
  .selectCard {
    width: 250px;
    height: 800px;
    overflow: auto;
    border: 1px solid #dedede;

    .itemCard {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #dedede;
    }
  }
  .formStyle {
    flex: 1;
    padding-left: 20px;
    .lines {
      height: 1px;
      background: #d7d7d7;
    }
  }
}
</style>