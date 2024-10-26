<style scoped >
.tableImg {
  margin: 0px auto;
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: block;
  top: 50%;
  transform: translateY(-50%);
}

.tooltipImg {
  max-width: 100%;
  max-height: 100%;
}

.related {
  cursor: pointer;
  color: rgb(45, 140, 240);
}
</style>
<template>
  <div>
    <div class="ivu-table-wrapper">
      <div class="ivu-table ivu-table-border">
        <!---->
        <div class="ivu-table-header">
          <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
            <thead>
              <tr>
                <th class="column_0 ivu-table-column-center" style="width: 70px;">
                  <div class="ivu-table-cell">
                    <span class="">NO</span>
                  </div>
                </th>
                <th class="column_1 ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">图片</span>
                  </div>
                </th>
                <th class="column_2 ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">SKU编号/商品名称</span>
                  </div>
                </th>
                <th class="column_3 multiCols ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">最新报价</span>
                  </div>
                </th>
                <th class="column_4 ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">采购货期（天）</span>
                  </div>
                </th>
                <th class="column_5 ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">最新报价时间</span>
                  </div>
                </th>
                <th class="column_6 ivu-table-column-center">
                  <div class="ivu-table-cell">
                    <span class="">关联的1688商品</span>
                  </div>
                </th>
                <th class="column_7 ivu-table-column-center" style="width: 150px">
                  <div class="ivu-table-cell">
                    <span class="">操作</span>
                  </div>
                </th>
                <th class="column_8 ivu-table-column-center" style="width: 100px">
                  <div class="ivu-table-cell">
                    <span class="">历史价格</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="ivu-table-tbody">
              <template v-if="productsData && productsData.length > 0">
                <template v-for="(item, index) in productsData">
                  <tr class="ivu-table-row" :key="`g${index}`">
                    <td colspan="9">
                      <div class="ivu-table-cell">
                        <span style="display:inline-block;min-width:130px;max-width:600px;margin-left: 10px"
                          :class="item.supplierStatus === '4' ? 'red' : ''">{{ '供应商： ' + item.supplierName }}</span> <span
                          style="margin-left: 20px">{{ '报价产品数量： ' + item.supplierGoodsList.length }}</span>
                      </div>
                    </td>
                  </tr>
                  <template v-for="(dataItem, dataIndex) in item.supplierGoodsList">
                    <tr class="ivu-table-row" :key="`${index}-${dataIndex}`">
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span>{{ dataIndex + 1 }}</span>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <template v-if="dataItem.thumbUrl">
                            <Poptip trigger="hover" content="content" :width="500" placement="right" :transfer="true">
                              <div style="width: 80px; height: 80px; margin: 5px auto;">
                                <img class="tableImg" :src="dataItem.thumbUrl">
                              </div>
                              <div slot="content">
                                <img class="tooltipImg" :src="dataItem.thumbUrl">
                              </div>
                            </Poptip>
                          </template>
                          <template v-else>
                            <div style="width: 80px; height: 80px; margin: 5px auto;">
                              <img class="tableImg" :src="'./static/images/placeholder.jpg'">
                            </div>
                          </template>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <div style="color: rgb(45, 140, 240);">{{ dataItem.skuNo }}</div>
                          <div>{{ dataItem.goodsName }}</div>
                          <div style="color: green">{{ dataItem.productGoodsSpecifications }}</div>
                        </div>
                      </td>
                      <td class="multiCols ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <div v-for="(dtItem, dtIndex) in dataItem.priceDetailsList" :key="`${dtIndex}`"
                            :style="{ textAlign: 'center', padding: '3px', borderTop: (dataItem.priceDetailsList.length > 1 && dtIndex > 0) ? '1px solid rgb(233, 234, 236)' : 'none' }">
                            {{ dtItem }} {{ dataItem.currency }}
                          </div>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span>{{ dataItem.estimateDeliveryDays }}</span>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span>{{ getDataToLocalTime(dataItem.updatedTime, 'fulltime') }}</span>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <div v-if="dataItem.relationStatus == 2">
                            <!-- <Row>
                            <Col :span="16">
                              <dyt-select @on-open-change="getProvinceFn" transfer @click.native="recordIndexFn(index, dataIndex, dataItem.supplierPurchaseLink)">
                                <Option v-for="(selectItem, selectIndex) in dataItem.selectVariations" :value="selectItem.variTypeName" :key="selectIndex" @click.native="selectChangeFn(index, dataIndex, selectItem)">{{selectItem.variTypeName}}</Option>
                              </dyt-select>
                            </Col>
                            <Col :span="7" :offset="1">
                              <Button type="primary" size="small" style="margin-top: 4px;" @click="confirmRelatedFn(index, dataIndex)">
                                确定
                              </Button>
                            </Col>
                          </Row> -->
                          </div>
                          <div v-if="dataItem.relationStatus == 3">
                            {{ JSON.parse(dataItem.relatedPlatformGoods).attributeDisplayName }}
                          </div>
                          <div v-if="dataItem.relationStatus == 1">
                            -
                          </div>
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <Button type="default" class="iconbuttons"
                            v-if="getPermission('supplierProduct_querySupplierGoods')"
                            @click="rowOperation('1', dataItem, dataIndex)">
                            <span>查看</span>
                          </Button>
                          <!-- <Buttons trigger="click" class="defaultStyle trimming" @on-click="rowOperation" @click.native="getRowDatas(dataItem,dataIndex)">
                          <Button type="default" class="iconbuttons" @click="rowOperation('1', dataItem, dataIndex)">
                            <span>查看</span>
                          </Button>
                          <Buttons-menu slot="list">
                            <Buttons-item name="2">
                              编辑
                            </Buttons-item>
                            <Buttons-item name="3">
                              作废
                            </Buttons-item>
                          </Buttons-menu>
                        </Buttons> -->
                        </div>
                      </td>
                      <td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <span class="related" v-if="getPermission('supplierProduct_queryPriceHistory')"
                            @click="viewHistory(dataItem, dataIndex)">
                            历史价格
                          </span>
                        </div>
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
              <template v-if="!productsData || productsData.length === 0">
                <tr>
                  <td colspan="9" class="ivu-table-column-center"><span>暂无筛选结果</span></td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="ivu-spin ivu-spin-large ivu-spin-fix" v-if="loading">
          <div class="ivu-spin-main">
            <span class="ivu-spin-dot"></span>
            <div class="ivu-spin-text"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['height', 'loading', 'productsData'],
  mixins: [Mixin],
  data () {
    return {
      self: this,
      rowData: {},
      rowIndex: 0,
      pageNo: 1,
      tableHeight: this.getTableHeight(290),
    };
  },
  methods: {
    rowOperation (name, data, index) {
      this.$emit('tableRowOperation', name, data || this.rowData, index || this.rowIndex);
    },
    getRowDatas (data, index) {
      this.rowData = data;
      this.rowIndex = index;
    },
    viewHistory (data) {
      this.$emit('tableViewHistory', data);
    }
  },
  created () {
    // let v = this;
  }
};
</script >
