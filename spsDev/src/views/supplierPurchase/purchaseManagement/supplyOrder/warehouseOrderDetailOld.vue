<template>
  <div>
    <Modal v-model="modelVisible" title="入库单" :mask-closable="false" width="80%">
      <!-- @on-visible-change="showPayModalChange" -->
      <div class="wareHouseOrderForm">
        <Form :label-width="100" :model="formData">
          <template>
            <!-- 供应商信息 -->
            <div>
              <div style="margin-left:20px">
                <Row>
                  <Col :span="8">
                  <FormItem label="入库单编号：">{{ formData.receiptNo }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="入库单类型：" v-if="receiptTypeList[formData.receiptType]">
                    {{ receiptTypeList[formData.receiptType].label }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="入库单状态：" v-if="receiptStatusList[formData.receiptStatus]">
                    {{ receiptStatusList[formData.receiptStatus].label }}</FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col :span="8">
                  <FormItem label="备货仓库：">{{ formData.warehouseName }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="参考编号：">{{ formData.referenceNo }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="供应商名称：">{{ formData.supplierName }}</FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col :span="8">
                  <!-- <FormItem label="创建时间："> {{formData.createdTime}}</FormItem> -->
                  <FormItem label="创建时间："> {{ getDataToLocalTime(formData.createdTime, 'fulltime', true) }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="创建人：">{{ formData.createdBy }}</FormItem>
                  </Col>
                  <Col :span="8">
                  <FormItem label="采购员：">{{ formData.purchaserName }}</FormItem>
                  </Col>
                </Row>
              </div>
            </div>
          </template>
        </Form>
      </div>

      <div class="wareHouseOrderTable">
        <div class="orderTable normalTop deleteLabelWidth">
          <Table highlight-row :border="true" :data="tableList" :columns="columns" :loading="tableLoading">
            <template slot-scope="{ row}" slot="status">
              <div>{{ changeText(row.receiptDetailStatus, 3) }}</div>
            </template>
            <!-- {{row.goodsUrl || '-'}} -->
            <template slot-scope="{ row}" slot="pic">
              <div class="pic">
                <img style="width:60px;height:60px"
                  :src="row.goodsUrl && row.goodsUrl.includes('filenode') ? row.goodsUrl : `${filenodeViewTargetUrl}${row.goodsUrl}`">
              </div>
            </template>
            <template slot-scope="{ row}" slot="skuNo">
              <div>{{ row.goodsSku }}</div>
            </template>
            <template slot-scope="{ row}" slot="sku">
              <div class="textOver" :title="row.goodsAttributes">{{ row.goodsAttributes }}</div>
            </template>
            <template slot-scope="{ row}" slot="cnName">
              <div class="textOver" :title="row.goodsCnDesc">{{ row.goodsCnDesc }}</div>
            </template>
            <template slot-scope="{ row}" slot="enName">
              <div class="textOver" :title="row.goodsEnDesc">{{ row.goodsEnDesc }}</div>
            </template>
            <template slot-scope="{ row}" slot="previewNum">
              <div>{{ row.expectedNumber }}</div>
            </template>
            <template slot-scope="{ row}" slot="getNum">
              <div>{{ row.doneNumber }}</div>
            </template>
            <template slot-scope="{ row}" slot="cancelNum">
              <div>{{ row.surplusQuantity }}</div>
            </template>
            <template slot-scope="{ row}" slot="lessNum">
              <div>{{ row.lessGoodsQuantity }}</div>
            </template>
            <template slot-scope="{ row}" slot="notReceivedNum">
              <div>{{ row.nobatchNumber }}</div>
            </template>
            <template slot-scope="{ row}" slot="volume">
              <div>{{ row.goodsVolume }}</div>
            </template>
            <template slot-scope="{ row}" slot="weight">
              <div>{{ row.goodsWeight }}</div>
            </template>
            <template slot-scope="{ row}" slot="isInspection">
              <div>{{ changeText(row.checkFlag, 4) }}</div>
            </template>
          </Table>

        </div>
        <div class="table-page clear" style="margin-top:30px">
          <div class="table-page-right">
            <Page :total="proPage.total" @on-change="proChangePage" show-total :page-size="proPage.pageSize" show-elevator
              :current="proPage.pageNum" show-sizer @on-page-size-change="proChangePageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>

      <div slot="footer">
        <Button @click="modelVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';

import Mixin from '@/components/mixin/common_mixin';
import pagemixin from '@/components/mixin/page_mixin';

import { wareTitle, receiptDetailStatusList, checkFlagList, receiptTypeList, receiptStatusList } from './configFile'

export default {
  mixins: [Mixin, pagemixin],

  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          data: {}
        }
      }
    },
    isVisible: {
      type: Boolean,
      default() { return false }
    }
  },

  data() {
    return {
      tableList: [],
      modelVisible: false,
      formData: {},
      receiptNo: '',
      columns: wareTitle,
      tableLoading: false,
      receiptTypeList,
      receiptStatusList,
      filenodeViewTargetUrl: this.$store.state.imgUrl
    }
  },
  watch: {
    'isVisible': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.modelVisible = this.isVisible;
          this.receiptNo = this.dialogObj.data;
          this.getFormData();
          this.getTableData();
        }
      }
    },
    modelVisible(nV, oV) {
      this.$emit("update:isVisible", nV)
    }
  },
  methods: {
    getFormData() {
      let params = {
        receiptNo: this.receiptNo,
      }
      this.axios.post(api.getReceiptInfo, params).then(res => {
        if (res.data.code === 0) {
          this.formData = res.data.datas;
          let list = this.$store.state.allUser;
          if (list && this.formData.purchaserId) {
            this.formData.purchaserName = list[this.formData.purchaserId].userName;
          } else {
            this.formData.purchaserName = '';
          }
        }
      });
    },
    getTableData() {
      this.tableLoading = true;
      this.api = api.getReceiptGoodsInfo;
      this.type = 'post';
      this.searchCriteria.receiptNo = this.receiptNo;
      let params = {
        receiptNo: this.receiptNo,
        pageNum: 1,
        pageSize: 10
      }
      this.axios.post(api.getReceiptGoodsInfo, params).then(res => {
        this.tableLoading = false;
        if (res.data.code === 0) {
          this.tableList = res.data.datas.list;
          this.proPage.total = res.data.datas.total;
        }
      });
    },

    changeText(status, type) {
      let name = '';
      let list = this.changeList(type);
      list.forEach(k => {
        if (k.value == status) {
          name = k.label;
        }
      });
      return name;
    },
    changeList(type) {
      let list = [];
      if (type == 3) {
        list = receiptDetailStatusList;
      } else {
        list = checkFlagList;
      }
      return list;
    },
  }
}
</script>

<style scoped>
.wareHouseOrderForm .ivu-col {
  height: 35px
}

.wareHouseOrderTable {
  margin-top: 30px;
}

.pic {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}</style>