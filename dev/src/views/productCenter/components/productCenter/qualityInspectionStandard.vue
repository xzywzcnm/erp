<template >
  <div class="quality-inspection-standard">
    <Form
      class="quality-inspection-standard"
      ref="qualityInspection"
      :model="qualityInspection"
      :label-width="110"
      label-position="right"
      :inline="true"
    >
      <Form-item label="质检模板：">
        <dyt-select v-model="qualityInspection.qualityTemplateId" :transfer="false" :disabled="disabled" placeholder="请选择质检模板">
          <Option
            v-for="(option, index) in qualityTemplateList"
            :value='option.qualityClassificationId'
            :key="`quality-${index}`"
          >{{option.qualityClassification}}</Option>
        </dyt-select>
      </Form-item>
      <template v-if="qualityProjectVOList.length > 0">
        <div class="quality-project-row">
          <div class="quality-project-item">质检项目</div>
          <div class="quality-project-item">质检内容描述</div>
          <div class="quality-project-item quality-price">价格</div>
        </div>
        <div
          class="quality-project-row"
          v-for="(item, index) in qualityProjectVOList" :key="`item-${index}`"
          :class="{
            'row-tips-error': $common.isEmpty(item.price) || item.price <= 0
          }"
        >
          <div class="quality-project-item">{{ item.qualityProject }}</div>
          <div class="quality-project-item qualityInspection-ellipsis-txt">
            <dyt-ellipsis
              :line="1"
              :content="item.qualityDescription"
            />
          </div>
          <div class="quality-project-item quality-price">
            <Poptip
              placement="left"
              trigger="hover"
              :transfer="true"
              v-if="($common.isEmpty(item.price) || item.price < 0)"
            >
              <div style="color: #f20;">不可用</div>
              <div slot="content" style="color: #333;">质检价格为空，不可用，请先完善价格信息</div>
            </Poptip>
            <span v-else>
              {{ item.price }}
            </span>
          </div>
        </div>
      </template>
    </Form>
    <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
    <Spin size="large" fix v-if="loading"></Spin>
  </div>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'qualityInspectionStandard',
  props: {
    disabled: { type: Boolean, default: false },
    productInfo: { type: Object, default: () => { return {} } },
    productId: { type: String, default: '' },
    editProductModal: { type: Boolean, default: false },
    productCategoryListData: { type: Array, default: () => { return [] } }
  },
  data () {
    return {
      loading: false,
      qualityInspection: {
        qualityTemplateId: ''
      },
      qualityTemplateList: [],
      qualityTemplateJson: {}
    }
  },
  computed: {
    tempQualityClassificationId () {
      return !this.$common.isEmpty(this.productInfo) ? this.productInfo.tempQualityClassificationId : ''
    },
    // 选中的列表
    qualityProjectVOList () {
      return this.qualityTemplateJson[this.qualityInspection.qualityTemplateId || this.tempQualityClassificationId] || [];
    },
    // 合计
    editModalTotal () {
      if (this.$common.isEmpty(this.qualityProjectVOList)) return 0;
      let priceTotal = 0;
      this.qualityProjectVOList.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price <= 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    },
  },
  watch: {
    editProductModal: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) {
          this.loading = false;
          this.qualityInspection = {
            qualityTemplateId: ''
          }
          return;
        }
        this.$nextTick(() => {
          this.initData();
        })
      }
    }
  },
  created () {},
  methods: {
    initData () {
      this.loading = true;
      let getData = [];
      // 获取所有质检模板信息
      getData.push(() => {
        return this.getAllQuality
      });
      this.$common.promiseAll(getData).then((res) => {
        this.qualityInspection = {
          qualityTemplateId: this.productInfo.qualityClassificationId
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      })
    },
    // 返回当前选中的项目模板ID
    getFormData () {
      if (this.tempQualityClassificationId === this.qualityInspection.qualityTemplateId && this.$common.isEmpty(this.productInfo.qualityClassificationId)) {
        return { data: '' }
      }
      return { data: this.qualityInspection.qualityTemplateId }
    },
    // 获取所有质检模板
    getAllQuality () {
      return new Promise((resolve) => {
        this.qualityTemplateJson = {};
        this.axios.get(api.getAllQualityTemplate).then((res) => {
          if (res && res.data && res.data.code === 0) {
            resolve(res.data.datas || []);
            this.qualityTemplateList = res.data.datas || [];
            (res.data.datas || []).forEach(item => {
              this.$set(this.qualityTemplateJson, item.qualityClassificationId, item.qualityProjectVOList);
            })
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    }
  }
};
</script>

<style lang="less" scoped>
@btnWidth: 70px;
.quality-inspection-standard{
  position: relative;
  width: 100%;
  .ivu-form-item{
    width: calc(50% - @btnWidth / 2 - 15px);
  }
  :deep(.ivu-form-item-label) {
    text-align: right;
    padding-left: 0px;
    padding-right: 10px;
  }

  .operation-item{
    width: @btnWidth;
    margin-right: 0px;
    :deep(.ivu-form-item-content) {
      margin-left: 0px !important;
      font-size: 20px;
      .ivu-icon{
        padding: 0 5px;
        cursor: pointer;
      }
    }
  }
  .dyt-select-demo{
    width: 100%;
  }
  .quality-project-row{
    display: flex;
    border-top: 1px solid #ddd;
    border-right: 1px solid #ddd;
    border-left: 1px solid #ddd;
    &:last-child{
      border-bottom: 1px solid #ddd;
    }
    &.row-tips-error{
      color: #f20;
    }
    .quality-project-item{
      flex: 50;
      min-height: 32px;
      padding: 5px 10px;
      // background-color:#eee;
      border-left: 1px solid #ddd;
      &:first-child{
        border-left: none;
      }
      &.quality-price{
        flex: auto;
        width: 120px;
      }
    }
  }
}
</style>
<style lang="less">
.qualityInspection-transfer-class-name{
  .ivu-tooltip-inner{
    max-width: 50vw;
  }
}
</style>
