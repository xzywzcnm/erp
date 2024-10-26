<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading"
    class="inventoryDetailPage">
    <div slot="lefts">
      <Button class="ml10" type="primary" @click="refresh">更新</Button>
      <Button class="ml10" @click="modalVisible = false;">取消</Button>
    </div>
    <div class="model-content">
      <Form ref="formDocument" :label-width="130" :inline="true" class="detail-form formDetail">
        <div class="stock-block stock-wordbreak">
          <div class="title">海外出库单信息</div>
          <div>
            <FormItem label="海外出库单号:">
              <span>{{ overseaInfo.pickingNo || '' }}</span>
            </FormItem>
            <FormItem label="客户参考号:">
              <span>{{ overseaInfo.referenceNo || '' }}</span>
            </FormItem>
            <FormItem label="平台:">
              <span>{{ overseaInfo.platform || '' }}</span>
            </FormItem>
            <FormItem label="订单状态:">
              <span v-for="(item, index) in statusList" :key="index">
                <span v-if="overseaInfo.pickingStatus === item.value">
                  {{ item.label }}
                </span>
              </span>
            </FormItem>

            <FormItem label="创建时间:">
              <span>{{ overseaInfo.createdTime || '' }}</span>
            </FormItem>
            <FormItem label="出库时间:">
              <span>{{ overseaInfo.dateShipping || '' }}</span>
            </FormItem>
            <FormItem label="订单重量:">
              <span>{{ overseaInfo.orderWeight || 0 }}</span>
            </FormItem>
            <FormItem label="异常问题原因:">
              <Tooltip max-width="400" :content="overseaInfo.abnormalProblemReason"
                :disabled="!(overseaInfo.abnormalProblemReason && overseaInfo.abnormalProblemReason.length)"
                placement="top" transfer>
                <div class="textOverTwo">{{ overseaInfo.abnormalProblemReason }}</div>
              </Tooltip>
            </FormItem>

            <FormItem label="配送方式:">
              <span>{{ overseaInfo.shippingMethod || '' }}</span>
            </FormItem>
            <FormItem label="跟踪号:">
              <span>{{ overseaInfo.trackingNo || '' }}</span>
            </FormItem>
            <FormItem label="配送仓库代码:">
              <span>{{ overseaInfo.warehouseCode || '' }}</span>
            </FormItem>
            <FormItem label="物理仓代码:">
              <span>{{ overseaInfo.wpCode || '' }}</span>
            </FormItem>

            <FormItem label="收件人:">
              <span>{{ overseaInfo.consigneeLastName || '' }} {{ overseaInfo.consigneeName || '' }}</span>
            </FormItem>
            <FormItem label="地区:">
              <span>{{ overseaInfo.consigneeDistrict || '' }}</span>
            </FormItem>
            <FormItem label="总费用:">
              <span class="errorText">{{ overseaInfo.totalFee || 0 }}</span>
            </FormItem>
            <FormItem label="币种:">
              <span class="errorText">{{ overseaInfo.currencyCode || '' }}</span>
            </FormItem>

            <FormItem label="运输费:">
              <span class="errorText">{{ overseaInfo.shipping || 0 }}</span>
            </FormItem>
            <FormItem label="操作费用:">
              <span class="errorText">{{ overseaInfo.operationFee || 0 }}</span>
            </FormItem>
            <FormItem label="燃油附加费:">
              <span class="errorText">{{ overseaInfo.fuelOilFee || 0 }}</span>
            </FormItem>
            <FormItem label="费率:">
              <span class="errorText">{{ overseaInfo.rate || 0 }}</span>
            </FormItem>

            <FormItem label="关税:">
              <span class="errorText">{{ overseaInfo.tariffFee || 0 }}</span>
            </FormItem>
            <FormItem label="挂号:">
              <span class="errorText">{{ overseaInfo.registerFee || '' }}</span>
            </FormItem>
            <FormItem label="其它费用:">
              <span class="errorText">{{ overseaInfo.otherFee || 0 }}</span>
            </FormItem>
          </div>
        </div>

        <div class="stock-block stock-wordbreak">
          <div class="title">LAPA出库单信息</div>
          <div>
            <FormItem label="出库单编号:">
              <span>{{ lapaInfo.packageCode || '' }}</span>
            </FormItem>
            <FormItem label="出库单类型:">
              <span v-for="(item, index) in outListTypeList" :key="index + 'pickingType'">
                {{ item.value === lapaInfo.pickingType ? item.label : '' }}
              </span>
            </FormItem>
            <FormItem label="发货仓库:">
              <span>{{ lapaInfo.sendWareHouse || '' }}</span>
            </FormItem>
            <FormItem label="订单号:">
              <span>{{ lapaInfo.orderNumber || '' }}</span>
            </FormItem>

            <FormItem label="创建时间:">
              <span>{{ lapaInfo.createdTime || '' }}</span>
            </FormItem>
            <FormItem label="创建人:">
              <div>{{ userInfoList[lapaInfo.createdBy] && userInfoList[lapaInfo.createdBy].userName }}</div>
            </FormItem>
            <FormItem label="最后修改时间:">
              <span>{{ lapaInfo.updatedTime || '' }}</span>
            </FormItem>
            <FormItem label="最后修改人:">
              <div>{{ userInfoList[lapaInfo.updatedBy] && userInfoList[lapaInfo.updatedBy].userName }}</div>
            </FormItem>

            <FormItem label="收货人名称:">
              <span>{{ lapaInfo.buyerName || '' }}</span>
            </FormItem>
            <FormItem label="国家:">
              <span>{{ lapaInfo.buyerCountryCode || '' }}</span>
            </FormItem>
            <FormItem label="联系人:">
              <span>{{ lapaInfo.buyerName2 || '' }}</span>
            </FormItem>
            <FormItem label="省/州:">
              <span>{{ lapaInfo.buyerState || '' }}</span>
            </FormItem>

            <FormItem label="固定电话:">
              <span>{{ lapaInfo.buyerPhone || '' }}</span>
            </FormItem>
            <FormItem label="城市:">
              <span>{{ lapaInfo.buyerCity || '' }}</span>
            </FormItem>
            <FormItem label="邮箱:">
              <span>{{ lapaInfo.buyerEmail || '' }}</span>
            </FormItem>
            <FormItem label="详细地址1:">
              <span>{{ lapaInfo.buyerAddress1 || '' }}</span>
            </FormItem>

            <FormItem label="详细地址2:">
              <span>{{ lapaInfo.buyerAddress2 || '' }}</span>
            </FormItem>
            <FormItem label="邮政编码:">
              <span>{{ lapaInfo.buyerPostalCode || '' }}</span>
            </FormItem>

            <div>
              <FormItem label="物流商:">
                <span>{{ lapaInfo.logistics || '' }}</span>
              </FormItem>
              <FormItem label="物流商仓库单号:">
                <span>{{ lapaInfo.logisticsNumber || '' }}</span>
              </FormItem>
              <FormItem label="邮寄方式:">
                <span>{{ lapaInfo.merchantShippingMethodId || '' }}</span>
              </FormItem>
              <FormItem label="运单号:">
                <span>{{ lapaInfo.trackingNumber || '' }}</span>
              </FormItem>
            </div>

          </div>
        </div>

        <div class="stock-block stock-wordbreak ignore-width fmb0">
          <div class="title">商品信息</div>
          <div>
            <Table border highlight-row :columns="instock.columns" :data="instock.list">
              <template slot-scope="{ row }" slot="goodsUrl">
                <div class="picture-width">
                  <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="desc">
                <div>{{ row.goodsCnDesc || '-' }}</div>
                <div>{{ row.goodsEnDesc || '-' }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="receiptNo">
                <span v-if="row.receiptNo">{{ row.receiptNo }}</span>
                <!-- <span class="linkText cursorClick" @click="unmatch(row)"
                  v-if="!row.receiptNo && getPermission('wmsDeliOrderManage_matchOrder')">未匹配</span> -->
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
import { statusList } from './fileData.js';
import { deliveryOrderType } from '../warehouse/fileData.js';
import permission_mixin from '@/components/mixin/permission_mixin';
export default {
  name: "inventoryDetail",
  mixins: [permission_mixin],
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    modalData: {
      type: Object,
      default: () => { return {} },
    },
  },
  data() {
    return {
      pageLoading: false,
      modalVisible: false,
      orderDetail: {},
      instock: {// 商品信息
        list: [],
        columns: [
          {
            title: '产品图片',
            slot: 'goodsUrl',
            width: 90,
            align: 'center',
          },
          {
            title: '商品编码',
            key: 'platSku',
            minWidth: 120,
            align: 'center',
          },
          {
            title: '产品sku',
            key: 'goodSku',
            width: 90,
            align: 'center',
          },
          {
            title: '中英文描述',
            slot: 'desc',
            width: 120,
            align: 'center',
          },
          {
            title: '商品数量',
            key: 'quantity',
            minWidth: 120,
            align: 'center',
          },
          {
            title: '匹配入库单',
            slot: 'receiptNo',
            minWidth: 120,
            align: 'center',
          },
          {
            title: '采购价CNY',
            key: 'purchaseCost',
            width: 100,
            align: 'center',
          },
          {
            title: '增值费CNY',
            key: 'addedValueCost',
            width: 100,
            align: 'center',
          },
          {
            title: '头程费用CNY',
            key: 'headTripCost',
            width: 120,
            align: 'center',
          },
          {
            title: '关税费CNY',
            key: 'tariffCost',
            width: 100,
            align: 'center',
          },
        ],
      },
      overseaInfo: {}, // 海外出库单信息
      lapaInfo: {}, // LAPA出库单信息
      statusList: statusList,
      outListTypeList: deliveryOrderType, // 出库单类型
      warehouseId: this.$store.state.warehouseId,
    }
  },
  watch: {
    dialogVisible: {
      handler(nval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  computed: {
    // 用户列表
    userInfoList() {
      return this.$store.state.userInfoList;
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
      let { pickingNo, packageCode } = this.modalData;
      let temp = { warehouseId: this.warehouseId, pickingNo, packageCode };
      this.pageLoading = true;
      this.axios.post(api.queryOverseasManageListDetails, temp).then(({ data }) => {
        if (data.code !== 0) return;
        let temp = data.datas || {};
        this.overseaInfo = temp.wmsOverseasPickingMessage || {};
        this.lapaInfo = temp.wmsOverseasByPackageCode || {};
        this.instock.list = temp.wmsOverseasPickingDetailMessages || [];
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 提交保存数据
    refresh() {
      this.$Modal.confirm({
        title: '操作提示',
        content: '<p>确认更新出库单信息吗?</p>',
        loading: true,
        onOk: () => {
          let { pickingNo } = this.modalData;
          let { account } = this.overseaInfo;
          this.axios.post(`${api.gcPickingManagementUpdate}?pickingNo=${pickingNo}&account=${account}`)
            .then(({ data }) => {
              if (data.code !== 0) return;
              this.$Message.success('操作成功~');
              this.getDetail();
            }).finally(() => {
              this.$Modal.remove();
            });
        }
      });
    },
    // unmatch(row) {
    //   this.$Modal.confirm({
    //     title: '操作提示',
    //     content: '<p>确认是否自动匹配入库单批次</p>',
    //     loading: true,
    //     onOk: () => {
    //       let { pickingNo } = this.overseaInfo;
    //       let { platSku } = row;
    //       let apiUrl = `${api.autoMatchReceipt}?pickingNo=${pickingNo}&platSku=${platSku}&warehouseId=${this.warehouseId}`;
    //       this.axios.post(apiUrl).then(({ data }) => {
    //         if (data.code !== 0) return;
    //         this.$Message.success('操作成功~');
    //         this.getDetail();
    //       }).finally(() => {
    //         this.$Modal.remove();
    //       });
    //     }
    //   });
    // }
  }
}
</script>
<style lang="less">
.inventoryDetailPage {
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