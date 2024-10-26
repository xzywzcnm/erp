<template>
  <div>
    <Modal v-model="isVisible" title="质检详情" :width="1200" :mask-closable="false" :closable="modalClose"
      class="qualityInspectionDetails">
      <!-- 质检详情:qualityInspectionStandard="qualityInspectionStandard" -->
      <common-quality-detail :totalCheckBatchInfo="totalCheckBatchInfo" :singleCheckBatchInfo="singleCheckBatchInfo" />

      <div class="block-sty mb10">
        <div class="title">产品图片</div>
        <div class="content" style="padding:0;" v-if="fileList.length">
          <dyt-previewImg :fileList="fileList" :imgOption="{ listWidth: 90, listHeight: 90, mode: 'multiple' }">
          </dyt-previewImg>
        </div>
        <div class="empty-style" v-else>暂无数据</div>
      </div>

      <div class="block-sty">
        <div class="title">质检批次记录</div>
        <div class="content">
          <Table highlight-row border :columns="columns" :data="checkBatchList" maxHeight="400">
            <template slot-scope="{ row}" slot="checkAttachment">
              <div class="picture-width">
                <dyt-previewImg :fileList="returnList(row)"
                  :imgOption="{ listWidth: 50, listHeight: 50, mode: 'multiple' }">
                </dyt-previewImg>
              </div>
            </template>
            <template slot-scope="{ row}" slot="checkBy">
              <span>
                <span v-for="(item, index) in qualityPersonList" :key="index + 'qualityPersonList'">
                  <span v-if="item.checkCreatedBy === row.checkBy">{{ item.checkCreatedByName }}</span>
                </span>
              </span>
            </template>
          </Table>
        </div>
      </div>

      <Spin fix v-if="spinShow"></Spin>

      <div slot="footer">
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import commonQualityDetail from './commonQualityDetail.vue';
export default {
  name: 'qualityInspectionDetails',
  components: { commonQualityDetail },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Object,
      default() {
        return {}
      }
    },
    warehouseId: {
      type: String,
      default() {
        return ''
      }
    },
  },
  data() {
    return {
      isVisible: false,
      columns: [
        {
          title: '质检记录号',
          key: 'receiptBatchCheckDetailNo',
          align: 'center',
          minWidth: 160,
        },
        {
          title: '问题原因',
          key: 'problemCheckReason',
          align: 'center',
          minWidth: 140,
        },
        {
          title: '质检图片',
          slot: 'checkAttachment',
          align: 'center',
          width: 150,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 140,
        },
        {
          title: '质检数',
          key: 'checkNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '合格数',
          key: 'passCheckNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '问题数',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '质检时间',
          key: 'checkTime',
          align: 'center',
          width: 100,
        },
        {
          title: '质检人',
          slot: 'checkBy',
          align: 'center',
          minWidth: 120,
        },
      ],
      fileList: [], // 图片
      totalCheckBatchInfo: {}, // 当前批次总信息
      singleCheckBatchInfo: {}, // 当前批次信息
      // qualityInspectionStandard: [], // 质检标准列表
      checkBatchList: [], // 质检批次列表
      qualityPersonList: [], // 质检人列表
      spinShow: false,
      // 所有模板下的项目
      // qualityTemplateJson: {}
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
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      // let awaitList = [];
      // awaitList.push(() => {
      //   return this.getAllQuality();
      // })
      // this.$common.promiseAll(awaitList).then(() => {
      this.resetData();
      this.getQualityName();
      this.getQualityDetail();
      this.getCheckBatchInfo();
      this.getCheckBatchList();
      // }).catch((error) => {
      //   console.error(error);
      // })
    },
    // // 获取所有质检模板
    // getAllQuality() {
    //   return new Promise((resolve) => {
    //     this.qualityTemplateJson = {};
    //     this.axios.get(api.getAllQualityTemplate).then((res) => {
    //       if (res && res.data && res.data.code === 0) {
    //         resolve(res.data.datas || []);
    //         (res.data.datas || []).forEach(item => {
    //           this.$set(this.qualityTemplateJson, item.qualityClassificationId, item.qualityProjectVOList);
    //         })
    //       } else {
    //         resolve([]);
    //       }
    //     }).catch(() => {
    //       resolve([]);
    //     })
    //   })
    // },
    // 重置数据
    resetData() {
      this.totalCheckBatchInfo = {};
      this.singleCheckBatchInfo = {};
      // this.qualityInspectionStandard = [];
      this.checkBatchList = [];
      this.fileList = [];
    },
    // 查询当前批次总信息
    getQualityDetail() {
      let params = {
        warehouseId: this.warehouseId, // 仓库id
        receiptNo: this.modalData.receiptNo || '', // 入库单号
        receiptBatchNo: this.modalData.receiptBatchNo || '', // 批次号
        // productGoodsId: this.modalData.productGoodsId || '', // 商品id
      }
      this.axios.post(api.quality_getTotalCheckBatchInfo, params).then(({ data }) => {
        if (data.code !== 0) return;
        this.totalCheckBatchInfo = data.datas || {};
      }).finally(() => {
      });
    },
    // 查询选中批次信息
    getCheckBatchInfo(batchInfo) {
      let params = {
        warehouseId: this.warehouseId, // 仓库id
        receiptNo: this.modalData.receiptNo || '', // 入库单号
        receiptBatchNo: this.modalData.receiptBatchNo || '', // 批次号
      }
      this.spinShow = true;
      this.axios.post(api.quality_getCheckBatchInfo, params).then(({ data }) => {
        if (data.code !== 0) return;
        let singleInfo = data.datas || {};
        this.singleCheckBatchInfo = singleInfo;
        // this.getProductQuality(data.datas || {});
        if (!this.$common.isEmpty(singleInfo.selfUseSizeImagePath)) {
          singleInfo.productGoodsImageList = [singleInfo.selfUseSizeImagePath, ...(singleInfo.productGoodsImageList || [])]
        }
        // 处理图片
        let productGoodsImageList = (singleInfo.productGoodsImageList || []).map(k => { return { url: k } });
        this.fileList = productGoodsImageList;
      }).finally(() => {
        this.spinShow = false;
      });
    },
    // // 获取质检标准列表
    // getProductQuality(data) {
    //   const { qualityClassificationId } = this.singleCheckBatchInfo;
    //   if (this.$common.isEmpty(qualityClassificationId)) {
    //     this.qualityInspectionStandard = [];
    //     return;
    //   }
    //   this.qualityInspectionStandard = this.qualityTemplateJson[qualityClassificationId] || [];
    //   // let { productGoodsId } = data;
    //   // this.axios.post(api.quality_queryQualityProjectListById, `"${productGoodsId}"`)
    //   //   .then(({ data }) => {
    //   //     if (data.code !== 0) return;
    //   //     this.qualityInspectionStandard = data.datas || [];
    //   //   })
    // },
    // 查询送检批次的质检列表
    getCheckBatchList() {
      this.axios.post(api.quality_getCheckBatchDetail, [this.modalData.receiptBatchNo])
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.checkBatchList = data.datas || [];
        })
    },
    // 处理图片列表
    returnList(row) {
      let checkAttachment = row.checkAttachment ? row.checkAttachment.split(',') : [];
      let list = checkAttachment.filter(k => k).map(k => { return { url: k } });
      return list;
    },
    // 获取质检人下拉列表
    getQualityName() {
      this.$store.dispatch('getQualityPersonList').then(res => {
        this.qualityPersonList = res || [];
      })
    },
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    }
  },
}
</script>

<style lang="less">
.qualityInspectionDetails {
  .block-sty {
    border: 1px solid rgb(228 228 228);

    .title {
      padding: 6px 10px;
      background-color: #F2F2F2;
      border-bottom: 1px solid rgb(228 228 228);
    }

    .content {
      padding: 10px;
    }
  }
}
</style>
