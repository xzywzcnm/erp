<template>
  <div class="commonQualityDetail-page">
    <Form ref="formValidate" :label-width="90" class="formDetail form-width200 total-sku-detail">
      <div class="fmb8 fmlabel0" style="padding: 6px;">
        <Row>
          <Col span="5">
          <FormItem label="SKU:">
            <div>{{ singleCheckBatchInfo.sku || '' }}</div>
          </FormItem>
          <FormItem label="重量(g):">
            <div>
              {{ `${(typeof singleCheckBatchInfo.length ===
                'number' || singleCheckBatchInfo.length) ? Number(Number(singleCheckBatchInfo.weight).toFixed(2)) : ''}` }}
            </div>
          </FormItem>
          <FormItem label="质检单号:">
            <div>{{ totalCheckBatchInfo.receiptCheckNo || '' }}</div>
          </FormItem>
          <FormItem label="已检合格总数:">
            <div>{{ totalCheckBatchInfo.qualifiedCheckedNumber || 0 }}</div>
          </FormItem>
          </Col>
          <Col span="5">
          <FormItem label="SPU:">
            <div>{{ singleCheckBatchInfo.spu || '' }}</div>
          </FormItem>
          <FormItem label="尺寸(cm):">
            <div>
              <span v-if="typeof singleCheckBatchInfo.length === 'number' || singleCheckBatchInfo.length">
                {{ `${Number(Number(singleCheckBatchInfo.length).toFixed(2))}` }}
              </span>
              <span v-if="typeof singleCheckBatchInfo.width === 'number' || singleCheckBatchInfo.width">
                * {{ `${Number(Number(singleCheckBatchInfo.width).toFixed(2))}` }}
              </span>
              <span v-if="typeof singleCheckBatchInfo.height === 'number' || singleCheckBatchInfo.height">
                * {{ `${Number(Number(singleCheckBatchInfo.height).toFixed(2))}` }}
              </span>
            </div>
          </FormItem>
          <FormItem label="下单总数:">
            <div>{{ totalCheckBatchInfo.purchaseNumber || 0 }}</div>
          </FormItem>
          <FormItem label="已检问题总数:">
            <div>{{ totalCheckBatchInfo.failedCheckedNumber || 0 }}</div>
          </FormItem>
          </Col>
          <Col span="8">
          <FormItem label="中文描述:">
            <div>{{ singleCheckBatchInfo.cnName || '' }}</div>
          </FormItem>
          <FormItem label="开发员:">
            <!-- productDeveloperUserId 不是ID是中文名称，后端说的 -->
            <div>{{ singleCheckBatchInfo.productDeveloperUserId || '' }}</div>
          </FormItem>
          <FormItem label="应检总数:">
            <div>{{ totalCheckBatchInfo.planCheckNumber || 0 }}</div>
          </FormItem>
          <FormItem label="待检总数:">
            <div>{{ totalCheckBatchInfo.awaitCheckedNumber || 0 }}</div>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="规格:">
            <div>{{ singleCheckBatchInfo.goodsAttributes || '' }}</div>
          </FormItem>
          <FormItem label="采购员:">
            <!-- purchaserId 不是ID是中文名称，后端说的 -->
            <div>{{ singleCheckBatchInfo.purchaserId || '' }}</div>
          </FormItem>
          <FormItem label="质检比例:">
            <div>{{ totalCheckBatchInfo.checkRate || 0 }}%</div>
          </FormItem>
          <FormItem label="待应检总数:">
            <div>{{ totalCheckBatchInfo.awaitPlanCheckedNumber || 0 }}</div>
          </FormItem>
          </Col>
        </Row>
      </div>
    </Form>
    <div class="has-quality">
      <div>批次号: <span class="sku-width">{{ singleCheckBatchInfo.receiptBatchNo || '' }}</span>
      </div>
      <div>质检状态:
        <span>
          {{ checkStatusList[singleCheckBatchInfo.checkStatus] && checkStatusList[singleCheckBatchInfo.checkStatus].olabel
          }}
        </span>
      </div>
      <div>送检数: <span>{{ singleCheckBatchInfo.expectedCheckNumber || 0 }}</span></div>
      <div>应检数: <span>{{ singleCheckBatchInfo.planCheckNumber || 0 }}</span></div>
      <div>质检比例: <span>{{ singleCheckBatchInfo.checkRate || 0 }} %</span></div>
      <div>已检合格数: <span>{{ singleCheckBatchInfo.passCheckNumber || 0 }}</span></div>
      <div>已检问题数: <span>{{ singleCheckBatchInfo.problemCheckNumber || 0 }}</span></div>
    </div>
    <!-- 质检工作页面 -->
    <slot name="qualityWorking"></slot>
    <div class="flexBox">
      <div class="block-sty mb10 testStandard">
        <!-- 这里由于Tabs组件会有嵌套bug，因此需要加多个v-if判断是否渲染该tabs -->
        <Tabs v-model="typeName" type="card" @on-click="changeTab" :animated="false"
          v-if="singleCheckBatchInfo.receiptBatchNo">
          <TabPane label="质检标准" name="0" class="flexBox">
            <div class="templateTypeStyle" v-if="!$common.isEmpty(singleCheckBatchInfo.goodsQualityInfo.templateType)">
              <Tooltip transfer content="模板类型">
                <Tag :color="templateTypeMap[singleCheckBatchInfo.goodsQualityInfo.templateType].color">
                  {{ templateTypeMap[singleCheckBatchInfo.goodsQualityInfo.templateType].text }}
                </Tag>
              </Tooltip>
            </div>
            <div class="contents paddSty" v-if="goodsQualityDetailList.length">
              <Form ref="formValidate" :label-width="80" class="formDetail">
                <div class="fmb0">
                  <FormItem :label="item.qualityProject + ':'" v-for="(item, index) in goodsQualityDetailList"
                    :key="index + 'qualityInspectionStandard'">
                    <div class="contents-paddSty-desc">{{ item.qualityDescription || '' }}</div>
                  </FormItem>
                </div>
              </Form>
            </div>
            <div class="empty-style" v-else>暂无数据</div>
          </TabPane>
          <TabPane v-if="isMaintenance" label="维修内容" name="1">
            <div class="ml20" v-if="!$common.isEmpty(singleCheckBatchInfo.maintenanceContent)">{{
              singleCheckBatchInfo.maintenanceContent }}</div>
            <div class="empty-style" v-else>暂无数据</div>
          </TabPane>
        </Tabs>
      </div>

      <div class="block-sty mb10 waterLabel"
        v-if="washedLabel || !$common.isEmpty(washedLabelPdfPath) || singleCheckBatchInfo.outerPackageRequirement">
        <div class="title">水洗唛标准</div>
        <div class="waterLabel-contents" v-if="washedLabel">
          <div class="waterLabe-label">水洗唛描述：</div>
          <div class="waterLabel-item"> {{ washedLabel }}</div>
        </div>
        <div class="waterLabel-contents" v-if="!$common.isEmpty(washedLabelPdfPath)">
          <div class="waterLabe-label" style="padding-top: 15px;">水洗唛(PDF/JPG/PNG)：</div>
          <div class="waterLabel-item">
            <Poptip trigger="hover" placement="left">
              <div class="washed-image-content">
                <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
                <Spin fix v-if="isWashedUploadLoading"></Spin>
              </div>
              <div class="washed-image-preview-content" slot="content">
                <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
              </div>
            </Poptip>
          </div>
        </div>
        <div class="waterLabel-contents" v-if="singleCheckBatchInfo.outerPackageRequirement">
          <div class="waterLabe-label">生产要求：</div>
          <div class="waterLabel-item" style="white-space:pre;"> {{ singleCheckBatchInfo.outerPackageRequirement }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { checkStatusList } from './commonData.js';
export default {
  name: 'commonQualityDetail',
  props: {
    totalCheckBatchInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    singleCheckBatchInfo: {
      type: Object,
      default() {
        return {}
      }
    }
    // qualityInspectionStandard: {
    //   type: Array,
    //   default() {
    //     return []
    //   }
    // },
  },
  data() {
    return {
      checkStatusList: checkStatusList,
      pdfFirstImgPreview: '',
      isWashedUploadLoading: false,
      typeName: '0',
      templateTypeMap: {
        0: { text: '常规', color: 'green' },
        1: { text: 'Temu', color: 'red' },
        2: { text: 'Shein', color: 'purple' },
        3: { text: 'Tiktok', color: 'orange' },
        4: { text: 'Otto', color: 'blue' },
      }
    }
  },
  watch: {
    washedLabelPdfPath: {
      immediate: true,
      deep: true,
      handler(val) {
        if (this.$common.isEmpty(val)) return;
        this.isWashedUploadLoading = true;
        const suffix = val.substring(val.lastIndexOf('.'), val.length);
        if (suffix.toLocaleLowerCase() == '.pdf') {
          this.$common.getPdfRes({
            pdfUrl: `./filenode/s${val}`,
            pageNumber: 1,
            scale: 10
          }).then(img => {
            this.pdfFirstImgPreview = img;
          }).finally(() => {
            this.isWashedUploadLoading = false;
          })
        } else {
          this.pdfFirstImgPreview = `./filenode/s${val}`;
          this.isWashedUploadLoading = false;
        }
      }
    },
    'singleCheckBatchInfo.qualityInspectionType': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.typeName = '1'
        }
      }
    }
  },
  computed: {
    // 水洗唛成份
    washedLabel() {
      return this.singleCheckBatchInfo.washedLabel;
    },
    washedLabelPdfPath() {
      // return '/temp//product/000035/2023-08-01/868af5a6f4a0448192c240449da04d8b.pdf';
      if (this.$common.isEmpty(this.singleCheckBatchInfo) || this.$common.isEmpty(this.singleCheckBatchInfo.washedLabelPdfPath)) return '';
      return this.singleCheckBatchInfo.washedLabelPdfPath;
    },
    goodsQualityDetailList() {
      let goodsQualityInfo = this.singleCheckBatchInfo.goodsQualityInfo || {};
      return goodsQualityInfo.goodsQualityDetailList || [];
    },
    isMaintenance() {
      return this.singleCheckBatchInfo.qualityInspectionType
    }
  },
  methods: {
    // 水洗唛PDF文件预览
    previewWashedPdf() {
      if (this.$common.isEmpty(this.washedLabelPdfPath)) return;
      const suffix = this.washedLabelPdfPath.substring(this.washedLabelPdfPath.lastIndexOf('.'), this.washedLabelPdfPath.length);
      if (suffix.toLocaleLowerCase() == '.pdf') {
        this.axios.get(`./filenode/s${this.washedLabelPdfPath}`, { responseType: 'blob' }).then(res => {
          this.$common.blobToBase64(res.data || res.resData).then(data => {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          })
        })
      } else {
        window.open(`./filenode/s${this.washedLabelPdfPath}`);
      }
    },
    changeTab(val) {
      this.typeName = val
    }
  }
}
</script>

<style lang="less">
.commonQualityDetail-page {
  .form-width200 {
    .ivu-form-item-content {
      // width: 180px;

      >div {
        word-break: break-all;
      }
    }
  }

  .has-quality {
    margin: 10px 0;
    padding: 6px 10px;
    border: 1px solid rgb(228 228 228);
    display: flex;
    align-items: center;

    span {
      display: inline-block;
      word-break: break-all;
      min-width: 60px;
      margin-right: 20px;
    }

    .sku-width {
      min-width: 170px;
    }
  }

  .block-sty {
    border: 1px solid rgb(228 228 228);

    .title {
      padding: 6px 10px;
      background-color: #F2F2F2;
      border-bottom: 1px solid rgb(228 228 228);
    }

    .contents {
      padding: 10px;
    }
  }

  .paddSty {
    padding: 4px 10px;
  }

  .testStandard {
    flex: 1;
    overflow: hidden;

    .ivu-tabs-nav-scroll {
      background: #F2F2F2;
    }
  }

  .waterLabel {
    width: 30%;
    min-width: 160px;
    overflow: hidden;

    .waterLabel-contents {
      display: flex;
      padding: 5px;

      .waterLabe-label {
        white-space: nowrap;
      }
    }
  }

  .contents-paddSty-desc {
    white-space: pre-wrap;
  }

  .washed-image-content {
    position: relative;
    width: 60px;
    height: 60px;
    box-shadow: 0 0 5px #ccc;
    border-radius: 5px;

    img {
      cursor: pointer;
      height: 100%;
      width: 100%;
    }
  }

  .washed-image-preview-content {
    position: relative;

    img {
      max-width: 400px;
      max-height: 400px;
      min-width: 100px;
    }
  }

  .templateTypeStyle {
    margin-left: 20px;
    margin-top: 10px
  }
}</style>
