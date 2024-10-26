<template>
  <div>
    <Modal v-model="isVisible" title="质检标准" :width="800" :mask-closable="false" class="formDetail">
      <div>
        <Form ref="formBatch" :model="modalData" :label-width="110" class="fmb0">
          <FormItem label="质检类型：">
            <div>{{ checkTypeList[modalData.checkType] || '' }}</div>
          </FormItem>
          <FormItem label="质检比例：">
            <div>{{ modalData.rowCheckRate || 0 }}%</div>
          </FormItem>
          <FormItem label="水洗唛描述：" v-if="!$common.isEmpty(modalData.washedLabel)">
            <div>{{ modalData.washedLabel || '' }}</div>
          </FormItem>
          <FormItem label="水洗唛(PDF/JPG/PNG)：" v-if="!$common.isEmpty(washedLabelPdfPath)">
            <Poptip trigger="hover" placement="right-start">
              <div class="washed-image-content">
                <img
                  :src="pdfFirstImgPreview"
                  @click="previewWashedPdf"
                />
                <Spin fix v-if="isWashedUploadLoading"></Spin>
              </div>
              <div class="washed-image-preview-content" slot="content">
                <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
              </div>
            </Poptip>
          </FormItem>
          <FormItem label="生产要求：" v-if="!$common.isEmpty(modalData.outerPackageRequirement)">
            <div>{{ modalData.outerPackageRequirement || '' }}</div>
          </FormItem>
          <template v-if="modalData.goodsQualityInfo">
            <FormItem label="质检模板：">
              <div class="flexBox">
                <div style="white-space:pre;">{{ modalData.goodsQualityInfo.qualityTemplateName || '' }}</div>
                <div class="templateTypeStyle">
                  <Tooltip transfer content="模板类型">
                    <Tag v-if="!$common.isEmpty(modalData.goodsQualityInfo.templateType)"
                  :color="templateTypeMap[modalData.goodsQualityInfo.templateType].color">
                    {{ templateTypeMap[modalData.goodsQualityInfo.templateType].text }}
                  </Tag>
                  </Tooltip>
                </div>
              </div>
            </FormItem>
          </template>
        </Form>
        <template v-if="modalData.goodsQualityInfo && modalData.goodsQualityInfo.goodsQualityDetailList">
          <Table class="qualityInspectionTemplateTable" border highlight-row :columns="columns"
            :data="modalData.goodsQualityInfo.goodsQualityDetailList">
          </Table>
          <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
        </template>
      </div>
      <div slot="footer">
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'qualityInspectionTemplate',
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
  },
  data() {
    return {
      isVisible: false,
      formDetail: {},
      pdfFirstImgPreview: '',
      isWashedUploadLoading: false,
      tableData: [],
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
      loading: false,
      checkTypeList: {
        0: '免检',
        1: '抽检',
        2: '全检',
      },
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
    washedLabelPdfPath: {
      immediate: true,
      deep: true,
      handler (val) {
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
    }
  },
  computed: {
    washedLabelPdfPath () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.washedLabelPdfPath)) return '';
      return this.modalData.washedLabelPdfPath;
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.goodsQualityInfo)) return 0;
      if (this.$common.isEmpty(this.modalData.goodsQualityInfo.goodsQualityDetailList)) return 0;
      let priceTotal = 0;
      this.modalData.goodsQualityInfo.goodsQualityDetailList.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      // console.log(this.modalData)
    },
    // 水洗唛PDF文件预览
    previewWashedPdf () {
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
  }
}
</script>
<style lang="less" scoped>
.washed-image-content{
  position: relative;
  width: 60px;
  height: 60px;
  box-shadow: 0 0 5px #ccc;
  border-radius: 5px;
  img{
    cursor: pointer;
    height: 100%;
    width: 100%;
  }
}
.washed-image-preview-content{
  position: relative;
  img{
    max-width: 600px;
    max-height: 600px;
    min-width: 100px;
  }
}
.templateTypeStyle {
  // padding-top: 5px;
  margin-left: 20px;
}
</style>