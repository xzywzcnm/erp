<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading" class="feeDetailPage">
    <div slot="lefts">
      <!-- <Button class="ml10" type="primary" v-if="modalType === 'detail'" @click="exportDetail">导出明细</Button> -->
      <Button class="ml10" type="primary" v-if="modalType === 'edit'" @click="submitSave" :loading="loading">
        保 存
      </Button>
      <Button class="ml10" @click="modalVisible = false;">取 消</Button>
    </div>
    <div class="model-content">
      <Form ref="formDocument" :label-width="130" :model="formData" :rules="formDataRules" :inline="true"
        class="detail-form formDetail">
        <div class="stock-block stock-wordbreak">
          <div class="title">基本信息</div>
          <div>
            <FormItem label="入库单号:">
              <span>{{ orderDetail.receiptNo || '' }}</span>
            </FormItem>
            <FormItem label="客户参考编号:">
              <span>{{ orderDetail.referenceNo || '' }}</span>
            </FormItem>
            <FormItem label="跟踪号:">
              <span>{{ orderDetail.trackingNumber || '' }}</span>
            </FormItem>
            <FormItem label="货运方式:">
              <span v-if="expressList[orderDetail.shippingType]">
                {{ expressList[orderDetail.shippingType].label }}
              </span>
            </FormItem>

            <FormItem label="类型:">
              <span v-if="receiptTypeList[orderDetail.receiptType]">
                {{ receiptTypeList[orderDetail.receiptType].label }}
              </span>
            </FormItem>
            <FormItem label="入库单状态:">
              <span v-if="receiptStatusList[orderDetail.receiptSyncStatus]">
                {{ receiptStatusList[orderDetail.receiptSyncStatus].label }}
              </span>
            </FormItem>
            <FormItem label="预报重量(kg):">
              <span>{{ orderDetail.forecastWeight || 0 }}</span>
            </FormItem>
            <FormItem label="预报体积(立方米):">
              <span>{{ orderDetail.forecastVolume || 0 }}</span>
            </FormItem>

            <FormItem label="创建日期:">
              <span>{{ orderDetail.gcCreatedTime || '' }}</span>
            </FormItem>
            <FormItem label="修改日期:">
              <span>{{ orderDetail.gcUpdatedTime || '' }}</span>
            </FormItem>
            <FormItem label="海外目的仓仓库代码:">
              <span>{{ orderDetail.warehouseCode || '' }}</span>
            </FormItem>
            <FormItem label="预报箱数:">
              <span>{{ orderDetail.forecastBoxQuantity || 0 }}</span>
            </FormItem>

            <FormItem label="预报sku件数:">
              <span>{{ orderDetail.forecastSkuQuantity || 0 }}</span>
            </FormItem>
            <FormItem label="报关项:">
              <span>{{ orderDetail.customsItem || '' }}</span>
            </FormItem>
            <FormItem label="提单类型:">
              <span v-if="pickupFormList[orderDetail.pickupForm]">
                {{ pickupFormList[orderDetail.pickupForm].label }}
              </span>
            </FormItem>
            <FormItem label="是否自有税号清关:">
              <span>{{ orderDetail.clearanceService == 1 ? '是' : '否' }}</span>
            </FormItem>

            <FormItem label="出口商id:">
              <span>{{ orderDetail.exporterId || '' }}</span>
            </FormItem>
            <FormItem label="进口商id:">
              <span>{{ orderDetail.importerId || '' }}</span>
            </FormItem>
            <FormItem label="揽收服务:">
              <span v-if="orderDetail.collectingType === '0'">自送货物</span>
              <span v-if="orderDetail.collectingType === '1'">上门提货</span>
            </FormItem>
            <FormItem label="预计到达时间:">
              <span>{{ orderDetail.etaTime || '' }}</span>
            </FormItem>

            <FormItem label="上架时间:">
              <span>{{ orderDetail.shelvesTime || '' }}</span>
            </FormItem>
            <FormItem label="物理仓仓库编码:">
              <span>{{ orderDetail.phyWarehouseCode || '' }}</span>
            </FormItem>
            <FormItem label="是否递延:">
              <!-- <span>{{ orderDetail.isDelayRedeliver || '' }}</span> -->
              <span v-if="orderDetail.isDelayRedeliver === 0">否</span>
              <span v-if="orderDetail.isDelayRedeliver === 1">是</span>
            </FormItem>
            <FormItem label="订舱单号:">
              <span>{{ orderDetail.bookingNo || '' }}</span>
            </FormItem>

            <FormItem label="备注:">
              <span>{{ orderDetail.remark || '' }}</span>
            </FormItem>
          </div>
        </div>

        <div class="stock-block stock-wordbreak">
          <div class="title">
            费用信息
            <span class="ml20">提示：每次修改数据，都会重新刷新分摊到每件商品，增值费用按预报件数分摊，头程费用按预报重量分摊，关税费用按预报件数分摊；</span>
          </div>
          <div style="padding-top: 10px;">
            <FormItem label="增值费用:" prop="addedValueCost">
              <dytInput v-model.number="formData.addedValueCost" :disabled="isDisabled" type="number" class="spinButton">
                <span slot="append">CNY</span>
              </dytInput>
            </FormItem>
            <FormItem label="头程费用:" prop="headTripCost">
              <dytInput v-model.number="formData.headTripCost" :disabled="isDisabled" type="number" class="spinButton">
                <span slot="append">CNY</span>
              </dytInput>
            </FormItem>
            <FormItem label="关税费用:" prop="tariffCost">
              <dytInput v-model.number="formData.tariffCost" :disabled="isDisabled" type="number" class="spinButton">
                <span slot="append">CNY</span>
              </dytInput>
            </FormItem>
          </div>
        </div>

        <div class="stock-block stock-wordbreak ignore-width fmb0">
          <div class="title">海外仓入库明细</div>
          <div>
            <Table border highlight-row :columns="instock.columns" :data="formData.updateDetailVOList" max-height="350">
              <template slot-scope="{ row }" slot="picture">
                <div class="picture-width">
                  <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
                </div>
              </template>
              <template slot-scope="{ row }" slot="desc">
                <div>{{ row.goodsCnDesc || '-' }}</div>
                <div class="mt4">{{ row.goodsEnDesc || '-' }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="volume">
                <span>{{ row.length || 0 }}cm</span>
                <span>*{{ row.width || 0 }}cm</span>
                <span>*{{ row.height || 0 }}cm</span>
              </template>
              <template slot-scope="{ row, index }" slot="purchaseCost">
                <FormItem :label-width="0" class="tariffForm" :prop="'updateDetailVOList.' + index + '.purchaseCost'"
                  :rules="{ validator: tableValidateFloat, trigger: 'blur', name: index }">
                  <dytInput v-model.number="formData.updateDetailVOList[index].purchaseCost" :disabled="isDisabled"
                    type="number" class="spinButton" />
                </FormItem>
              </template>
            </Table>
          </div>
        </div>
      </Form>
    </div>
  </dyt-model>
</template>
<script>
import api from '@/api/api';
import regular from '@/utils/regular.js';
import { expressList, receiptTypeList, receiptStatusList, pickupFormList } from './fileData.js';
export default {
  name: "feeDetail",
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => { return {} }
    },
    modalType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      pageLoading: false,
      modalVisible: false,
      formData: {
        addedValueCost: '',
        headTripCost: '',
        tariffCost: '',
        updateDetailVOList: [],
      },
      formDataRules: {
        addedValueCost: [
          { validator: this.validateFloat, trigger: 'blur', name: 'addedValueCost' },
        ],
        headTripCost: [
          { validator: this.validateFloat, trigger: 'blur', name: 'headTripCost' },
        ],
        tariffCost: [
          { validator: this.validateFloat, trigger: 'blur', name: 'tariffCost' },
        ],
      },
      orderDetail: {},
      instock: {// 商品信息
        columns: [
          {
            title: '箱号',
            key: 'pickingPlatformBoxNo',
            width: 80,
            align: 'left',
          },
          {
            title: '产品图片',
            slot: 'picture',
            width: 90,
            align: 'left',
          },
          {
            title: '商品编码',
            key: 'platSku',
            minWidth: 120,
            align: 'left',
          },
          {
            title: '产品sku',
            key: 'goodSku',
            width: 100,
            align: 'left',
          },
          {
            title: '中英文描述',
            slot: 'desc',
            minWidth: 140,
            align: 'left',
          },
          {
            title: '重量(g)',
            key: 'weight',
            width: 90,
            align: 'left',
          },
          {
            title: '体积(cm)',
            slot: 'volume',
            width: 120,
            align: 'left',
          },
          {
            title: '采购价CNY',
            slot: 'purchaseCost',
            width: 120,
            align: 'left',
          },
          {
            title: '增值费CNY',
            key: 'zaddedValueCost',
            width: 100,
            align: 'left',
          },
          {
            title: '头程费CNY',
            key: 'theadTripCost',
            width: 100,
            align: 'left',
          },
          {
            title: '关税费CNY',
            key: 'gtariffCost',
            width: 100,
            align: 'left',
          },
          {
            title: '预报数量',
            key: 'forecastQuantity',
            width: 86,
            align: 'left',
          },
          {
            title: '上架数量',
            key: 'shelvesQuantity',
            width: 86,
            align: 'left',
          },
          {
            title: '调整数量',
            key: 'adjustmentQuantity',
            width: 86,
            align: 'left',
          },
          {
            title: '使用数量',
            key: 'useQuantity',
            width: 86,
            align: 'left',
          },
          {
            title: '剩余数量',
            key: 'remainingQuantity',
            width: 86,
            align: 'left',
          },
        ],
      },
      expressList: expressList, // 货运方式
      receiptTypeList: receiptTypeList, // 入库单类型
      receiptStatusList: receiptStatusList, // 入库单状态
      pickupFormList: pickupFormList, // 提单类型
      loading: false,
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  computed: {
    // 是否可编辑
    isDisabled() {
      return this.modalType == 'detail';
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.getDetail();
    },
    // 获取详情
    getDetail() {
      let { receiptNo } = this.modalData;
      this.pageLoading = true;
      this.axios.post(`${api.queryWarehouseManageDetails}?receiptNo=${receiptNo}`).then(({ data }) => {
        if (data.code !== 0) return;
        let temp = data.datas || {};
        this.orderDetail = temp;
        Object.keys(this.formData).forEach(k => {
          if (k === 'updateDetailVOList') return;
          this.formData[k] = temp[k] || 0;
        })
        this.formData.updateDetailVOList = (temp.overseasAndWarehouses || []).map(k => {
          k.purchaseCost = k.purchaseCost || 0;
          return k;
        });
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // // 表格分页
    // productChangePage(page) {
    //   this.instock.searchParams.pageNum = page;
    //   // this.getList();
    // },
    // // 切换每页条数
    // productChangePageSize(size) {
    //   this.instock.searchParams.pageSize = size;
    //   // this.getList();
    // },
    // 提交保存数据
    submitSave() {
      this.$refs.formDocument.validate((valid) => {
        if (!valid) return false;
        let { receiptNo } = this.modalData;
        let temp = this.$common.copy(this.formData);
        temp.receiptNo = receiptNo;
        temp.updateDetailVOList = temp.updateDetailVOList.map(k => {
          return { boxNo: k.pickingPlatformBoxNo, purchaseCost: k.purchaseCost, platSku: k.platSku };
        })
        // console.log(temp);

        this.loading = true;
        this.axios.post(api.updateFeeInfo, temp).then(({ data }) => {
          if (data.code !== 0) return;
          this.modalVisible = false;
          this.$Message.success('操作成功~');
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        });
      })
    },
    // // 导出明细
    // exportDetail() {
    //   this.$Modal.confirm({
    //     title: '导出明细',
    //     content: '<p>异步导出入库详情内容，导出任务完成后，请使用“导出查看”的功能，下载导出文件；</p>',
    //     loading: true,
    //     onOk: () => {
    //       this.$Modal.remove();
    //       // this.$Message.success('导出成功');
    //     }
    //   });
    // }
    // 表单数值验证
    validateFloat(rule, value, callback) {
      if (value === '') return callback(new Error('请输入'));
      if (!regular.hasPriceNum.test(value)) return callback(new Error('限2位浮点小数'));
      callback();
    },
    tableValidateFloat(rule, value, callback) {
      let item = this.formData.updateDetailVOList[rule.name];
      if (!item) return callback(new Error('请输入'));
      let result = item.purchaseCost;
      if (result === '') return callback(new Error('请输入'));
      if (!regular.hasPriceNum.test(result)) return callback(new Error('限2位浮点小数'));
      callback();
    },
  }
}
</script>
<style lang="less">
.feeDetailPage {
  .stock-wordbreak {
    .ivu-form-item-content {
      word-break: break-all;
    }

    .errorText {
      color: red;
    }

    .tariffForm {
      margin-right: 0px !important;
    }
  }
}
</style>