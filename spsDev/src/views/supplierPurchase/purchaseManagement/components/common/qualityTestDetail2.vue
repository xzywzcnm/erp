<template>
  <div class="qualityTestDetail2Page">
    <Form ref="formData" :model="formData" inline :label-width="90">
      <div>
        <Row>
          <Col span="6">
          <FormItem label="SKU:">
            <span>{{ formData.sku }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="SPU:">
            <span>{{ formData.spu }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="中文描述:" class="tooltip_text">
            <Tooltip :content="formData.cnName" placement="top" :disabled="formData.cnName.length <= 16"
              v-if="formData.cnName">
              <span class="oneline">{{ formData.cnName }}</span>
            </Tooltip>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="规格:">
            <span>{{ formData.goodsAttributes }}</span>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <FormItem label="质检单号:">
            <span>{{ restData.receiptCheckNo }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="下单总数:">
            <span>{{ restData.purchaseNumber }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="应检总数:">
            <span>{{ restData.planCheckNumber }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="质检比例:">
            <span>{{ restData.checkRate || 0 }}%</span>
          </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <FormItem label="已检合格总数:">
            <span>{{ restData.qualifiedCheckedNumber }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="已检问题总数:">
            <span>{{ restData.failedCheckedNumber }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="待检总数:">
            <span>{{ restData.awaitCheckedNumber }}</span>
          </FormItem>
          </Col>
          <Col span="6">
          <FormItem label="待应检总数:">
            <span>{{ restData.awaitPlanCheckedNumber }}</span>
          </FormItem>
          </Col>
        </Row>
      </div>
      <div style="
          display: flex;
          width: 100%;
          border: 1px solid #e4e4e4;
          padding-left: 10px;
          background: #f2f2f2;
        " class="mt10">
        <div style="width: 300px">批次号：{{ formData.receiptBatchNo }}</div>
        <div style="width: 200px">
          质检状态：
          <span v-if="formData.checkStatus == 0">待质检</span>
          <span v-if="formData.checkStatus == 1">质检中</span>
          <span v-if="formData.checkStatus == 2">质检完成</span>
        </div>
        <div style="width: 180px">
          送检数：{{ formData.expectedCheckNumber }}
        </div>
        <div style="width: 180px">应检数：{{ formData.planCheckNumber }}</div>
        <div style="width: 200px">质检比例：{{ formData.checkRate }}%</div>
        <div style="width: 200px">
          已检合格数：{{ formData.passCheckNumber }}
        </div>
        <div style="width: 200px">
          已检问题数：{{ formData.problemCheckNumber }}
        </div>
      </div>
      <div class="flexBox mt20">
        <div class="block-sty mb10 testStandard">
          <!-- 这里由于Tabs组件会有嵌套bug，因此需要加多个v-if判断是否渲染该tabs -->
          <Tabs v-model="typeName" type="card" @on-click="changeTab" :animated="false" v-if="formData.receiptBatchNo">
            <TabPane label="质检标准" name="0" class="flexBox">
              <div class="templateTypeStyle" v-if="!$common.isEmpty(formData.goodsQualityInfo.templateType)">
                <Tooltip transfer content="模板类型">
                  <Tag :color="templateTypeMap[formData.goodsQualityInfo.templateType].color">
                    {{ templateTypeMap[formData.goodsQualityInfo.templateType].text }}
                  </Tag>
                </Tooltip>
              </div>
              <div class="contents paddSty" v-if="goodsQualityDetailList.length">
                <Form ref="formValidate" :label-width="80" class="formDetail">
                  <div class="fmb0">
                    <div v-for="(item, index) in goodsQualityDetailList" :key="index + 'qualityInspectionStandard'">
                      <FormItem :label="item.qualityProject + ':'">
                        <div class="contents-paddSty-desc">{{ item.qualityDescription || '' }}</div>
                      </FormItem>
                    </div>
                  </div>
                </Form>
              </div>
              <div class="empty-style" v-else>暂无数据</div>
            </TabPane>
            <TabPane v-if="isMaintenance" label="维修内容" name="1">
              <div class="ml20" v-if="!$common.isEmpty(formData.maintenanceContent)">{{
                formData.maintenanceContent }}</div>
              <div class="empty-style" v-else>暂无数据</div>
            </TabPane>
          </Tabs>
        </div>
        <div class="block-sty mb10 waterLabel"
          v-if="washedLabel || !$common.isEmpty(washedLabelPdfPath) || formData.outerPackageRequirement">
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
          <div class="waterLabel-contents" v-if="formData.outerPackageRequirement">
            <div class="waterLabe-label">生产要求：</div>
            <div class="waterLabel-item" style="white-space:pre;"> {{ formData.outerPackageRequirement }}
            </div>
          </div>
        </div>
      </div>
      <Card dis-hover class="mt10">
        <p slot="title">产品图片</p>
        <div style="display: flex; flex-wrap: wrap">
          <div v-for="(item, index) in formData.productGoodsImageList" :key="index" style="margin-right: 5px">
            <large-picture :url="item" imageHigh="60px">
              <slot name="picslot"></slot>
            </large-picture>
          </div>
        </div>
      </Card>
      <Card dis-hover class="mt10">
        <p slot="title">质检批次记录</p>
        <div class="table-box">
          <Table highlight-row max-height="590" :columns="column2" :data="qualityRecordList" :border="true">
            <!-- 质检记录号 -->
            <template slot-scope="{ row }" slot="receiptBatchCheckDetailNo">
              <div>{{ row.receiptBatchCheckDetailNo }}</div>
            </template>
            <!-- 送检批次号 -->
            <template slot-scope="{ row }" slot="weight">
              <div>{{ row.weight }}</div>
            </template>
            <!-- 问题原因 -->
            <template slot-scope="{ row }" slot="problemCheckReason">
              <div style="color: #4b8ef7; text-decoration: underline">
                {{ row.problemCheckReason }}
              </div>
            </template>
            <!-- 质检图片 -->
            <template slot-scope="{ row }" slot="picture">
              <div style="display: flex">
                <div v-for="(item, index) in row.imageList" :key="index" style="margin-right: 5px">
                  <large-picture :url="item" imageHigh="60px">
                    <slot name="picslot"></slot>
                  </large-picture>
                </div>
              </div>
            </template>
            <!-- 备注 -->
            <template slot-scope="{ row }" slot="remark">
              <div>{{ row.remark }}</div>
            </template>
            <!-- 质检数 -->
            <template slot-scope="{ row }" slot="checkNumber">
              <div>{{ row.checkNumber }}</div>
            </template>
            <!-- 合格数 -->
            <template slot-scope="{ row }" slot="passCheckNumber">
              <div>{{ row.passCheckNumber }}</div>
            </template>
            <!-- 问题数 -->
            <template slot-scope="{ row }" slot="problemCheckNumber">
              <div>{{ row.problemCheckNumber }}</div>
            </template>
            <!-- 质检时间 -->
            <template slot-scope="{ row }" slot="checkTime">
              <div>{{ row.checkTime }}</div>
            </template>
            <!-- 质检人 -->
            <template slot-scope="{ row }" slot="checkBy">
              <div>
                <span v-for="(item, index) in qualityPersonList" :key="index + 'qualityPersonList'">
                  <span v-if="item.checkCreatedBy === row.checkBy">{{ item.checkCreatedByName }}</span>
                </span>
              </div>
            </template>
          </Table>
        </div>
      </Card>
    </Form>
  </div>
</template>

<script>
import api from "@/api/api";
import largePicture from "@/components/largePicture";
export default {
  components: { largePicture },
  props: {
    detailParams: {
      type: Object,
      default: () => {
        return {};
      },
    },
    productGoodsId: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  data() {
    return {
      formData: {},
      restData: {},
      column2: [
        {
          title: "质检记录号",
          slot: "receiptBatchCheckDetailNo",
          width: '160px'
        },
        {
          title: "问题原因",
          slot: "problemCheckReason",
        },
        {
          title: "质检图片",
          slot: "picture",
          width: "240px",
        },
        {
          title: "备注",
          slot: "remark",
        },
        {
          title: "质检数",
          slot: "checkNumber",
        },
        {
          title: "合格数",
          slot: "passCheckNumber",
        },
        {
          title: "问题数",
          slot: "problemCheckNumber",
        },
        {
          title: "质检时间",
          slot: "checkTime",
        },
        {
          title: "质检人",
          slot: "checkBy",
        },
      ],
      columns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      //质检批次记录
      qualityRecordList: [],
      // 质检人信息
      qualityPersonList: [],
      checkWashedData: {
        '1': { value: '1', label: '手洗', image: require("@/assets/images/handWash.png") },
        '2': { value: '2', label: '缓和干洗', image: require("@/assets/images/mildDryClean.png") },
        '3': { value: '3', label: '最高30摄氏度缓和程序机洗', image: require("@/assets/images/machineWash.png") },
        '4': { value: '4', label: '不可干洗', image: require("@/assets/images/notDryClean.png") },
        '5': { value: '5', label: '不可漂白', image: require("@/assets/images/notBleach.png") }
      },
      typeName: '0',
      pdfFirstImgPreview: '',
      isWashedUploadLoading: false,
      templateTypeMap: {
        0: { text: '常规', color: 'green' },
        1: { text: 'Temu', color: 'red' },
        2: { text: 'Shein', color: 'purple' },
        3: { text: 'Tiktok', color: 'orange' },
        4: { text: 'Otto', color: 'blue' },
      },
    };
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
    'formData.qualityInspectionType': {
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
      return this.formData.washedLabel;
    },
    washedLabelPdfPath() {
      if (this.$common.isEmpty(this.formData) || this.$common.isEmpty(this.formData.washedLabelPdfPath)) return '';
      return this.formData.washedLabelPdfPath;
    },
    goodsQualityDetailList() {
      let goodsQualityInfo = this.formData.goodsQualityInfo || {};
      return goodsQualityInfo.goodsQualityDetailList || [];
    },
    isMaintenance() {
      return this.formData.qualityInspectionType
    },
  },
  mounted() {
    this.getFormData();
    this.getRestData();
    this.getQualityRecordTable();
    this.getQualityPerson()
  },
  methods: {
    getFormData() {
      this.axios
        .post(api.getTotalCheckBatchInfo, this.detailParams)
        .then((res) => {
          this.restData = res.data.datas;
        });
    },
    //主formdata
    getRestData() {
      this.axios.post(api.getCheckBatchInfo, this.detailParams).then((res) => {
        this.formData = res.data.datas;
      });
    },
    //质检批次记录
    getQualityRecordTable() {
      this.axios
        .post(api.getCheckBatchDetail, [this.detailParams.receiptBatchNo])
        .then((res) => {
          this.qualityRecordList = res.data.datas;
        });
    },
    //获取质检人
    getQualityPerson() {
      this.axios
        .post('/wms-service/wmsReceiptBatchCheck/createdby')
        .then((res) => {
          this.qualityPersonList = res.data.datas
        });
    },
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
  },
};
</script>

<style scoped></style>
<style lang="less">
.qualityTestDetail2Page {
  .templateTypeStyle {
    margin-left: 20px;
    margin-top: 10px
  }

  .tooltip_text {
    .ivu-form-item-content {
      height: 32px;
    }

    &,
    .ivu-tooltip,
    .oneline {
      width: 100%;
    }

    .oneline {
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
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

  .empty-style {
    text-align: center;
    font-size: 12px;
    height: 48px;
    line-height: 48px;
  }

  .ivu-form-item {
    margin-bottom: 0px;
  }

  ::v-deep .ivu-card-head {
    padding: 5px 16px;
    background: #f2f2f2;
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
}
</style>