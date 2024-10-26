<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading" class="detailPage">
    <div slot="lefts">
      <Button class="ml10" @click="modalVisible = false;">取消</Button>
    </div>
    <div class="model-content warehouseDetailPage">
      <Form ref="formDocument" :label-width="110" :inline="true" class="detail-form formDetail">
        <div class="stock-block stock-wordbreak">
          <div class="title">基本信息</div>
          <div>
            <FormItem label="出库单编号:">
              <span>{{ orderDetail.pickingNo || '' }}</span>
            </FormItem>
            <FormItem label="出库单类型:">
              <span v-for="(item, index) in outListTypeList" :key="index + 'pickingType'">
                <span v-if="item.value === orderDetail.pickingType">{{ item.label }}</span>
              </span>
            </FormItem>
            <FormItem label="拣货单编号:">
              <span>{{ orderDetail.pickingGoodsNo || '' }}</span>
            </FormItem>
            <FormItem label="出库单状态:">
              <span v-for="(item, index) in outListStatusList" :key="index + 'pickingNewStatus'">
                <span v-if="item.value === orderDetail.pickingNewStatus">{{ item.label }}</span>
              </span>
            </FormItem>

            <FormItem label="发货仓库:">
              <span>{{ orderDetail.warehouseName || '' }}</span>
            </FormItem>
            <FormItem label="参考编号:">
              <span>{{ orderDetail.referenceNo || '' }}</span>
            </FormItem>
            <FormItem label="创建时间:">
              <span v-if="orderDetail.createdTime">{{ $uDate.dealTime(orderDetail.createdTime) }}</span>
            </FormItem>
            <FormItem label="创建人:">
              <div>{{ userInfoList[orderDetail.createdBy] && userInfoList[orderDetail.createdBy].userName }}</div>
            </FormItem>

            <FormItem label="最后修改时间:">
              <span v-if="orderDetail.updatedTime">{{ $uDate.dealTime(orderDetail.updatedTime) }}</span>
            </FormItem>
            <FormItem label="最后修改人:">
              <div>{{ userInfoList[orderDetail.updatedBy] && userInfoList[orderDetail.updatedBy].userName }}</div>
            </FormItem>
            <FormItem label="店铺:">
              <span>{{ orderDetail.saleAccount || '' }}</span>
            </FormItem>
            <FormItem label="谷仓账号:">
              <span>{{ orderDetail.pickingAccount || '' }}</span>
            </FormItem>

            <FormItem label="仓储名称/代码:">
              <span v-for="(item, index) in getWareHouseList" :key="index + 'getWareHouseList'">
                {{ item.warehouseId === wmsPickingExtend.warehouseName ? item.warehouseName : '' }}
              </span>
            </FormItem>
            <FormItem label="收货人名称:">
              <span>{{ wmsPickingExtend.consigneeName || '' }}</span>
            </FormItem>
            <FormItem label="联系人:">
              <span>{{ wmsPickingExtend.consigneeLinkMan || '' }}</span>
            </FormItem>
            <FormItem label="联系电话:">
              <span>{{ wmsPickingExtend.consigneeLinkTel || '' }}</span>
            </FormItem>

            <FormItem label="国家:">
              <span v-for="(item, index) in countryList" :key="index + 'countryList'">
                {{ item.twoCode === wmsPickingExtend.consigneeCountry ? item.cnName : '' }}
              </span>
            </FormItem>
            <FormItem label="省/州:">
              <span>{{ wmsPickingExtend.consigneeProvince || '' }}</span>
            </FormItem>
            <FormItem label="城市:">
              <span>{{ wmsPickingExtend.consigneeCity || '' }}</span>
            </FormItem>
            <FormItem label="邮政编码:">
              <span>{{ wmsPickingExtend.consigneeLinkTel || '' }}</span>
            </FormItem>

            <FormItem label="详细地址1:">
              <span>{{ wmsPickingExtend.consigneeAddress || '' }}</span>
            </FormItem>
            <FormItem label="详细地址2:">
              <span>{{ wmsPickingExtend.consigneeAddressOther || '' }}</span>
            </FormItem>
            <FormItem label="邮箱:">
              <span>{{ wmsPickingExtend.consigneeMail || '' }}</span>
            </FormItem>
            <FormItem label="备注:">
              <span>{{ orderDetail.fbaRemark || '' }}</span>
            </FormItem>

            <FormItem label="货箱数量:">
              <span class="errorText">{{ pickingBoxes.boxedNum || 0 }}</span>
            </FormItem>
            <FormItem label="货箱总重量(kg):">
              <span class="errorText">{{ pickingBoxes.sumWeigth || 0 }}</span>
            </FormItem>
            <FormItem label="sku总数:">
              <span class="errorText">{{ pickingBoxes.skuSum || 0 }}</span>
            </FormItem>
            <FormItem label="已装箱sku数量:">
              <span class="errorText">{{ pickingBoxes.skuInBoxNum || 0 }}</span>
            </FormItem>

            <FormItem label="未装箱sku数量:">
              <span class="errorText">{{ (pickingBoxes.skuSum || 0) - (pickingBoxes.skuInBoxNum || 0) }}</span>
            </FormItem>
            <FormItem label="异常sku数量:">
              <span class="errorText">{{ pickingBoxes.missNumber || 0 }}</span>
            </FormItem>
          </div>
        </div>

        <div class="stock-block stock-wordbreak">
          <div class="title">货箱信息</div>
          <div>
            <Table border highlight-row :columns="boxInfo.columns" :data="boxInfo.list"></Table>
          </div>
        </div>

        <div class="stock-block stock-wordbreak">
          <div class="title">商品信息</div>
          <div>
            <Table border highlight-row :columns="productInfo.columns" :data="productInfo.list">
              <template slot-scope="{ row }" slot="goodsUrl">
                <div class="picture-width">
                  <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="pickingNo">
                <span class="linkText cursorClick">{{ row.pickingNo || '' }}</span>
              </template>
              <template slot-scope="{ row }" slot="finishTime">
                <div class="timeWidth">{{ row.finishTime || '' }}</div>
              </template>
            </Table>
          </div>
        </div>

      </Form>
    </div>

    <!-- 货箱信息 -->
    <packing-information-detail ref="packingInformationDetail" :modelVisible.sync="packingInfo.visible"
      :detailData="packingInfo.detailData" :pickingData="packingInfo.pickingData"></packing-information-detail>
  </dyt-model>
</template>
<script>
import Big from 'big.js';
import api from '@/api/api';
import { deliveryOrderType } from './fileData.js';
import { outListStatusList } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';
import packingInformationDetail from '@/views/wms/stockOUt/otherStouck/components/packingInformationDetail';
export default {
  name: "warehouseDetail",
  components: { packingInformationDetail },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => { return {} }
    },
  },
  data() {
    let _self = this;
    return {
      pageLoading: false,
      modalVisible: false,
      orderDetail: {},
      boxInfo: {// 货箱信息
        columns: [
          {
            title: '序号',
            type: 'index',
            width: 70,
            align: 'center'
          },
          {
            title: '货箱编号',
            minWidth: 180,
            align: 'center',
            render: (h, params) => {
              return h('a', {
                on: {
                  click: () => {
                    let { pickingId } = _self.orderDetail;
                    let data = this.$common.copy(params.row);
                    data.pickingId = pickingId;
                    _self.packingInfo.pickingData = data;
                    _self.packingInfo.detailData = data;
                    _self.packingInfo.visible = true;
                  }
                }
              }, params.row.boxCode);
            }
          },
          {
            title: '货箱尺寸',
            minWidth: 120,
            align: 'center',
            render: (h, params) => {
              return h('div', {}, [
                h('span', {}, (params.row.length || 0) + 'cm'),
                h('span', {}, '*' + (params.row.width || 0) + 'cm'),
                h('span', {}, '*' + (params.row.height || 0) + 'cm')
              ]);
            }
          },
          {
            title: '货箱整箱称重',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('span', {}, (params.row.weight || 0) + 'kg');
            }
          },
          {
            title: '计抛重量',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('span', {}, (params.row.throwingWeight || 0) + 'kg');
            }
          },
          {
            title: '抛重比',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('span', {}, (params.row.throwingWeightRatio || 0) + '%');
            }
          },
          {
            title: '完整装箱时间',
            width: 160,
            align: 'center',
            render: (h, params) => {
              return h('div', {
                // attrs: {
                //   class: 'timeWidth',
                // }
              }, _self.$uDate.dealTime(params.row.boxFinishTime));
            }
          },
          {
            title: '货箱状态',
            width: 120,
            align: 'center',
            render: (h, params) => {
              let type = { 0: '正在装箱', 1: '已装箱' };
              return h('span', {}, type[params.row.status] || '');
            }
          },
        ],
        list: [],
      },
      productInfo: {// 商品信息
        columns: [
          {
            title: '产品图片',
            slot: 'goodsUrl',
            width: 90,
            align: 'center',
          },
          {
            title: '产品sku',
            key: 'goodsSku',
            width: 120,
            align: 'center',
          },
          {
            title: '中文描述',
            key: 'goodsCnDesc',
            minWidth: 140,
            align: 'center',
          },
          {
            title: '订单数量总数',
            key: 'expectedNumber',
            width: 110,
            align: 'center',
          },
          {
            title: '标签名称',
            key: 'labelName',
            minWidth: 120,
            align: 'center',
          },
          {
            title: '谷仓sku',
            key: 'platSku',
            width: 120,
            align: 'center',
          },
          {
            title: '备注',
            key: 'skuDesc',
            minWidth: 120,
            align: 'center',
          },
          {
            title: 'sku价格',
            key: 'skuProductCost',
            width: 100,
            align: 'center',
          },
          {
            title: '已分配数量',
            key: 'doneAssignedNumber',
            width: 100,
            align: 'center',
          },
          {
            title: '未分配数量',
            key: 'notAssignedNumber',
            width: 100,
            align: 'center',
          },
          {
            title: '已拣货数量',
            key: 'doneAssignedNumber',
            width: 100,
            align: 'center',
          },
          {
            title: '异常sku数量',
            key: 'missNumber',
            width: 110,
            align: 'center',
          },
        ],
        list: [],
      },
      packingInfo: { // 货箱详情
        visible: false,
        detailData: {},
        pickingData: {},
      },
      pickingBoxes: {}, // 装箱信息
      wmsPickingExtend: {}, // 收货人信息
      outListTypeList: deliveryOrderType, // 出库单类型
      outListStatusList: outListStatusList, // 出库单状态
      countryList: [], // 国家列表
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
    // 用户列表
    userInfoList() {
      return this.$store.state.userInfoList;
    },
    // 取可用的仓库类型“第三方”: warehouseType: 1 第三方 0 自营
    getWareHouseList() {
      let list = this.$store.state.warehouseList || [];
      return list.filter(k => { return k.warehouseType == 1 });
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.getDetail();
      this.getCountrys();
    },
    // 获取出库单详情
    getDetail() {
      let { pickingNo } = this.modalData;
      this.pageLoading = true;
      this.axios.get(api.queryWarehousingDetail, { params: { pickingNo } }).then(({ data }) => {
        if (data.code !== 0) return;
        let temp = data.datas || {};
        this.orderDetail = temp;
        let pickingBoxes = temp.pickingBoxes || {};
        this.pickingBoxes = pickingBoxes;
        this.wmsPickingExtend = temp.wmsPickingExtend || {};

        this.productInfo.list = temp.fbaPickingDetailList || [];
        this.boxInfo.list = (pickingBoxes.pickingBoxesVOS || []).map(k => {
          k.throwingWeight = this.throwingWeight(k);
          k.throwingWeightRatio = this.throwingWeightRatio(k.throwingWeight, k);
          return k;
        })
      }).finally(() => {
        this.pageLoading = false;
      });
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 查看货箱信息
    boxDetail(row) {
      let data = this.$common.copy(row);
      this.packingInfo.pickingData = data;
      this.packingInfo.detailData = data;
      this.packingInfo.visible = true;
    },
    // 抛重比=计抛重量/重量 百分比，两位小数，四舍五入
    throwingWeightRatio(throwingWeight, { weight }) {
      let num = 0;
      if (throwingWeight > 0 && weight > 0) {
        num = parseFloat(new Big(throwingWeight).div(weight).times(100)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    // 计抛重量=体积（长cm*宽cm*高cm）/ 6000 两位小数，四舍五入
    throwingWeight(row) {
      let { length, width, height } = row;
      let num = Number(new Big(length || 0).times(width || 0).times(height || 0));
      if (num > 0) {
        num = parseFloat(new Big(num).div(6000)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    // 获取国家列表
    getCountrys() {
      let countryList = JSON.parse(localStorage.getItem('area') || '[]');
      if (countryList.length) return (this.countryList = countryList);
      this.axios.get(api.get_countrys).then(({ data }) => {
        if (data.code !== 0) return;
        let countryList = data.datas || [];
        this.countryList = countryList;
        localStorage.setItem('area', JSON.stringify(countryList));
      });
    },
  }
}
</script>
<style lang="less">
.warehouseDetailPage {
  .stock-wordbreak {
    .ivu-form-item-content {
      word-break: break-all;
    }

    .errorText {
      color: red;
    }
  }
}
</style>