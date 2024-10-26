<template>
  <div class="detail-stock-order">
    <detailModel @backList="backList" :pageLoading="pageLoading">
      <div class="back--r" slot="lefts">
        <a href="javascript:;" style="color:#657180" @click="backList">
          <Icon type="ios-arrow-back" class="icon"></Icon>
          <span class="mr10">返回列表</span>
        </a>
        <h4>出库单详情:{{ detailData.pickingNo }}</h4>
      </div>
      <div slot="rights">
        <Button type="primary" @click="editOperat()" v-if="isEdit">保存</Button>
      </div>
      <div>
        <!-- 状态进度 -->
        <status-step ref="statusStep" :detailData="detailData"></status-step>
        <!-- 面板 -->
        <stock-panel ref="stockPanel" :detailData="detailData" :isEdit="isEdit" @searchData="searchData"
          :workShow="workShow" @getFormInfo="getFormInfo"></stock-panel>
        <!-- 货箱信息 -->
        <packing-information ref="packingInformation" :detailData="detailData" v-if="detailData.boxFinishStatus > 0"
          @searchData="searchData"></packing-information>
        <!-- 产品 -->
        <add-products ref="addProducts" :detailData="newsDetailData" @saveStockout="createStockOutList" :isEdit="isEdit"
          @searchData="searchData"></add-products>
        <!-- 分配列表 -->
        <allocation-list ref="allocationList" :detailData="detailData"></allocation-list>
        <!-- 质检列表 -->
        <quality-tes-table ref="qualityTesTable" :detailData="detailData" :isEdit="isEdit"></quality-tes-table>
        <!-- 操作日志 -->
        <operation-log ref="operationLog" :detailData="detailData" :isEdit="isEdit"
          @searchData="searchData"></operation-log>
      </div>
    </detailModel>
  </div>
</template>

<script>
import api from '@/api/api';
import stockPanel from './stockPanel';
import addProducts from './addProducts';
import statusStep from './statusStep';
import allocationList from './allocationList';
import operationLog from './operationLog';
import packingInformation from './packingInformation';
import qualityTesTable from './qualityTesTable';
import common from '@/components/mixin/common_mixin';
import detailModel from './detailModel';
export default {
  name: 'addStockOrder',
  components: { stockPanel, addProducts, statusStep, allocationList, operationLog, packingInformation, detailModel, qualityTesTable },
  mixins: [common],
  props: {
    workShow: {
      type: String,
      default: ''
    },
    rowData: {
      type: Object,
      default: () => { return {} }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      wareId: '', // 仓库id
      detailData: {},
      optionNoteData: [],
      falgType: 'otherStockOut',
      pageLoading: false, // 页面加载
      isChange: false,// 页面信息是否有改动，改动则需要刷新页面列表
      detailmainInfo: {}, // 出库单表单信息
    }
  },
  computed: {
    // 是否上传外箱标签 fbaOutBoxLabelStatus外箱标签状态(0:未上传，1:已上传)
    isOutBoLabel() {
      return this.detailData.fbaOutBoxLabelStatus === 1;
    },
    securityUser() {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    },
    // 需要把主信息和详情数据整合（也就是最新变更）给产品组件
    newsDetailData() {
      return Object.assign({}, this.detailData, this.detailmainInfo);
    },
  },
  created() {
    this.wareId = this.getWarehouseId();
    this.searchData();
  },
  methods: {
    // 获取表单信息
    getFormInfo(info) {
      this.detailmainInfo = info || {};
    },
    searchData(type) {
      if (type) this.isChange = true;// 页面信息是否有改动，改动则需要刷新页面列表
      this.pageLoading = true;
      const rowKey = ['pickingNewStatus', 'isUploadWytPackage'];
      return this.axios.get(api.queryFbaDetail, {
        params: {
          businessDeptId: this.securityUser.businessDeptId, // 所属事业部
          businessDeptIds: this.securityUser.businessDeptIds, // 可查看的事业部
          pickingId: this.rowData.pickingId
        }
      }).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let newData = data.datas || {};
        // 当从详情接口获取到的 rowKey 对应的值为空时使用列表接口返回的对应值
        Object.keys(newData).forEach(key => {
          if (rowKey.includes(key) && this.$common.isEmpty(newData[key])) {
            newData[key] = this.rowData[key] || null;
          }
        });
        this.detailData = newData;
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 返回列表
    backList() {
      this.$emit('update:workShow', 'list');
      // 页面信息是否有改动，改动则需要刷新页面列表
      if (this.isChange) this.$emit('searchData');
    },
    // 保存
    editOperat() {
      this.createStockOutList();
    },
    // 保存出库单
    async createStockOutList(cb) {
      let detailData = this.detailData;
      let temp = {};
      temp.warehouseId = this.wareId; // 仓库id
      temp.pickingId = detailData.pickingId; // 出库单id
      temp.pickingStatus = detailData.pickingStatus; // 出库单状态
      // 分配库存保存只保存产品信息
      if (!cb) {
        // 订单创建:主信息
        if (detailData.pickingStatus === '0') {
          let data = await this.$refs.stockPanel.handleSubmit('main');
          // 表单验证是否通过
          if (!data) return false;
          temp = Object.assign(temp, data);
        }

        // 收货人信息(pickingStatus: 0-可编辑，1-不可)
        let { checkLogistics } = detailData.wmsPickingExtend || {};
        if (checkLogistics === '0') {
          let data = await this.$refs.stockPanel.handleSubmit('receiver');
          // 表单验证是否通过
          if (!data) return false;
          data.pickingId = this.detailData.pickingId
          temp.wmsPickingExtend = data; // 收货人信息
        }

        // 质检信息
        let isTemu = detailData.pickingType === 'O11'; // temu出库单类型
        // if (isTemu) {
        //   let data = await this.$refs.stockPanel.handleCommon('qualityTesting', 'qualityTesting');
        //   if (!data) return false;
        //   temp = Object.assign(temp, data);
        // }
        let temu = isTemu && ['4', '8', '11', '12'].includes(detailData.pickingNewStatus);
        // let showLogisticians = temu || detailData.fbaOutBoxLabelStatus === 1;
        let showLogisticians = temu || ['4', '8', '12'].includes(detailData.pickingNewStatus);
        // 物流商信息
        if (showLogisticians) {
          let data = await this.$refs.stockPanel.handleSubmit('logistic');
          // 验证是否通过
          if (!data) return false;
          temp.fbaPickingBase = data;
        }

        // 部分分配/分配完成/待发货/完全发货:申报信息
        if (detailData.pickingStatus > 0 && detailData.pickingStatus < 99) {
          let data = await this.commonInfo('declareInfo', 'declareInfo', 'fbaDeclareBaseList');
          if (!data) return;
          temp = Object.assign(temp, data);
        }

        // 完全发货:运费明细信息
        if (detailData.pickingStatus === '4') {
          let data = await this.commonInfo('freightDetails', 'freightDetails', 'fbaExpenseDetail');
          if (!data) return;
          temp = Object.assign(temp, data);
        }

        // 质检列表
        // pickingGoodsStatus:拣货状态(0:未拣，1已拣);qualityCheckStatus:质检状态(0:未质检，1:质检完成);
        let qualityResult = detailData.pickingGoodsStatus == 1 && detailData.qualityCheckStatus === 0;
        if (isTemu && qualityResult) {
          let data = await this.$refs['qualityTesTable'].handleSubmit();
          // 验证是否通过
          if (!data) return false;
          temp.wmsPickingQualityCheckList = data;
        }
      }

      // 除了作废状态:产品信息
      if (detailData.pickingStatus && detailData.pickingStatus < 99) {
        let data = await this.$refs.addProducts.handleSubmit();
        // 验证是否通过
        if (!data) return false;
        temp.fbaPickingDetailList = data;// 产品信息
      }

      // console.log(temp);
      // return;
      this.pageLoading = true;
      this.axios.post(api.editFbaPicking, temp).then(res => {
        if (res.data.code === 0) {
          if (!cb) {
            this.$Message.success('操作成功');
            this.$emit('searchData');
            this.backList();
            return;
          }
          this.isChange = true;
          // this.searchData().then(() => { // 更新详情
          cb(); // 这里回调因为产品分配库存需要先保存再进行分配
          // })
        }
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 公用获取信息(formName 表单类名 tabName 选项卡位置 dataName 数据key名) (申报信息/箱唛信息/运费明细信息)
    async commonInfo(formName, tabName, dataName) {
      let temp = {};
      let data = await this.$refs.stockPanel.handleCommon(formName, tabName);
      // 验证是否通过
      if (!data) return false;
      temp[dataName] = data;// 产品信息
      return temp;
    },
  }
}
</script>
<style lang="less" scoped>
.detail-stock-order {
  .back--r {
    display: flex;
    align-items: center;
  }
}
</style>
