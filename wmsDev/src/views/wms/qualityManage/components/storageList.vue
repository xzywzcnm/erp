<template>
  <div>
    <Modal v-model="isVisible" title="打印问题件存放清单" :width="1200" :mask-closable="false" class="storageListDialog">
      <div>
        <div>
          <div v-for="(item, index) in allList" :key="index" class="mb20 page-break">
            <p style="font-size: 20px;font-weight:bold;text-align: center;">问题件存放清单</p>
            <commonForm :data="item.receiptCheckStoreInfoVO">
              <div slot="firstLine">
                <FormItem label="存放编码:">
                  <span>{{ storageCodeShow(item.receiptCheckStoreInfoVO) }}</span>
                </FormItem>
              </div>
            </commonForm>
            <Table border highlight-row :columns="commodityColumns" :data="item.wmsReceiptCheckDetailBaseList || []">
              <template slot-scope="{ row, index }" slot="commodityInfo">
                <div class="good-block">
                  <div class="mr10">
                    <dyt-previewImg :url="row.allImageUrl"></dyt-previewImg>
                  </div>
                  <div class="order-item">
                    <div class="order-li">SKU：<span>{{ row.sku || '' }}</span></div>
                    <div class="order-li--text">
                      <Tooltip :content="row.description" :disabled="!row.description" placement="top">
                        {{ row.description || '' }}</Tooltip>
                    </div>
                    <div class="order-li order-li--tag">{{ row.goodsAttributes || '' }}</div>
                  </div>
                </div>
              </template>
              <template slot-scope="{ row, index }" slot="checkRate">
                <span>{{ row.checkRate || 0 }}%</span>
              </template>
              <!-- <template slot-scope="{ row, index }" slot="checkerId">
                <span v-for="(item, key) in qualityPersonList" :key="key + 'qualityPersonList'">
                  <span v-if="item.checkCreatedBy === row.checkerId">
                    {{ item.checkCreatedByName || '' }}
                  </span>
                </span>
              </template> -->
            </Table>
          </div>
          <Spin size="large" fix v-if="pageLoading"></Spin>
        </div>
        <div style="display:none;">
          <div :id="print.id">
            <div v-for="(item, index) in allList" :key="index" class="mb20 page-break">
              <p style="font-size: 20px;font-weight:bold;text-align: center;">问题件存放清单</p>
              <commonForm :data="item.receiptCheckStoreInfoVO">
                <div slot="firstLine">
                  <FormItem label="存放编码:">
                    <span>{{ storageCodeShow(item.receiptCheckStoreInfoVO) }}</span>
                  </FormItem>
                </div>
              </commonForm>
              <table border="1" style="width:100%;">
                <tr>
                  <th v-for="(item, index) in commodityColumns" :key="index">{{ item.title }}</th>
                </tr>
                <tr v-for="(litem, lindex) in (item.wmsReceiptCheckDetailBaseList || [])" :key="lindex">
                  <td v-for="(item, index) in commodityColumns" :key="index">
                    <div v-if="item.slot">
                      <div v-if="item.slot === 'commodityInfo'">
                        <div class="good-block">
                          <div class="mr10">
                            <dyt-previewImg :url="litem.allImageUrl"></dyt-previewImg>
                          </div>
                          <div class="order-item">
                            <div class="order-li">SKU：<span>{{ litem.sku || '' }}</span></div>
                            <div class="order-li--text">
                              <Tooltip :content="litem.description" :disabled="!litem.description" placement="top">
                                {{ litem.description || '' }}</Tooltip>
                            </div>
                            <div class="order-li order-li--tag">{{ litem.goodsAttributes || '' }}</div>
                          </div>
                        </div>
                      </div>
                      <div v-if="item.slot === 'checkRate'" style="text-align:center;">
                        <span>{{ litem.checkRate || 0 }}%</span>
                      </div>
                      <!-- <div v-if="item.slot === 'checkerId'" style="text-align:center;">
                        <span v-for="(qitem, qkey) in qualityPersonList" :key="qkey + 'qualityPersonList'">
                          <span v-if="qitem.checkCreatedBy === litem.checkerId">
                            {{ qitem.checkCreatedByName || '' }}
                          </span>
                        </span>
                      </div> -->
                    </div>
                    <div v-else style="text-align:center;">{{ litem[item.key] }}</div>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" v-print="print">打 印</Button>
        <Button @click="close">关 闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import commonForm from './commonForm';
export default {
  name: 'storageList',
  components: { commonForm },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    data: {
      type: Array,
      default() {
        return []
      }
    },
  },
  data() {
    return {
      isVisible: false,
      commodityColumns: [
        {
          title: '商品信息',
          slot: 'commodityInfo',
          align: 'left',
          minWidth: 180,
        },
        {
          title: '下单数',
          key: 'purchaseNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '应检数',
          key: 'planCheckNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '质检比例',
          slot: 'checkRate',
          align: 'left',
          minWidth: 90,
        },
        {
          title: '送检数',
          key: 'expectedCheckNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '已检合格数',
          key: 'qualifiedCheckedNumber',
          align: 'left',
          minWidth: 100,
        },
        {
          title: '已检问题数',
          key: 'failedCheckedNumber',
          align: 'left',
          minWidth: 100,
        },
        {
          title: '退货数',
          key: 'refundNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '销毁数',
          key: 'destructionNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '剩余数',
          key: 'remainNumber',
          align: 'left',
          minWidth: 80,
        },
        {
          title: '质检员',
          key: 'checkerId',
          align: 'left',
          minWidth: 80,
        },
      ], // 商品质检信息
      tableList: [],
      allList: [],
      pageLoading: false,
      print: {
        id: 'printAreas' + new Date().getTime() + Math.ceil(Math.random() * 100000),
      },
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
      },
      deep: true
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.getDetail();
    },
    // 获取详情
    getDetail() {
      let list = this.data.map(k => k.receiptCheckId);
      this.pageLoading = true;
      this.axios.post(api.receiptCheckPrint, list).then(({ data }) => {
        if (data && data.code === 0) {
          this.allList = (data.datas || []).map(k => {
            k.receiptCheckStoreInfoVO = k.receiptCheckStoreInfoVO || {};
            k.wmsReceiptCheckDetailBaseList = k.wmsReceiptCheckDetailBaseList || [];
            return k;
          });
        }
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 关闭窗口
    close() {
      this.isVisible = false;
      let { printReturn } = this.$listeners;
      printReturn && this.$emit('printReturn');
    },
    // 处理要显示的编码
    storageCodeShow(row) {
      if (row.slotType == 1 && row.slotCode) {
        return (row.slotCode < 10 ? '0' + row.slotCode : row.slotCode) + '框';
      }
      return row.slotCode || '';
    }
  }
}
</script>
<style lang="less">
.storageListDialog {
  .ivu-modal-body {
    min-height: 400px;
    max-height: 650px;
    overflow: auto;
  }

  .good-block {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }
}
</style>
<style media="print">
@page {
  size: auto;
  margin: 1mm 1mm 1mm .5mm;
}

@media print {
  html {
    background-color: #ffffff;
    height: auto;
    margin: 0px;
    padding: 0;
  }

  html,
  body,
  #app {
    min-width: auto;
  }

  table {
    border-collapse: collapse;
  }

  table,
  th,
  td {
    border: 1px solid black;
  }

  th {
    padding: 2px 0;
  }

  * {
    margin: 0;
    padding: 0;
    font-weight: bold;
  }

  .good-block {
    padding: 2px;
    display: flex;
    align-items: center;
    max-width: 180px;
  }

  .page-break {
    page-break-after: always;
  }
}
</style>
