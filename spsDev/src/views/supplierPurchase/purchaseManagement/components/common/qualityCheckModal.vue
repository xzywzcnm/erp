<template>
     <Modal v-model="modalVisible" title="质检标准" width="800px" max-height="600px">
      <Form ref="modalForm" :model="modalForm"  :label-width="100" label-position="right" class="modal-form">
        <FormItem prop="qualityType" label="质检类型:">
         {{ modalForm.qualityType || ''}}
        </FormItem>
        <FormItem prop="qualityCheckRate" label="质检比例:">
         {{ modalForm.qualityCheckRate + '%'}}
        </FormItem>
        <FormItem prop="washedLabel" label="水洗唛描述:">
         {{ modalForm.washedLabel || ''}}
        </FormItem>
        <FormItem prop="washedLabelPDF">
          <div slot="label">
            <div>水洗唛:</div>
            <div>(PDF/JPG/PNG)</div>
          </div>
          <Poptip trigger="hover" placement="right-start" v-if="!$common.isEmpty(modalForm.washedLabelPdfPath)">
              <div class="washed-image-content">
                <img
                  :src="modalForm.imgData"
                  @click="previewWashedPdf"
                />
              </div>
              <div class="washed-image-preview-content" slot="content">
                <img :src="modalForm.imgData" @click="previewWashedPdf" />
              </div>
            </Poptip>

        </FormItem>
        <FormItem prop="qualityClassification" label="质检模板:">
        <div class="flexBox">
          <div>{{ modalForm.qualityClassification || ''}}</div>
          <div class="templateTypeStyle">
            <Tooltip transfer content="模板类型">
            <Tag v-if="!$common.isEmpty(modalForm.templateType)" :color="templateTypeMap[modalForm.templateType].color">
            {{ templateTypeMap[modalForm.templateType].text }}
          </Tag>
        </Tooltip>
          </div>
        </div>
        </FormItem>
        <Table :columns="qualityColumns" :data="(modalForm.qualityProjectVOList || [])" style="margin-left:25px" border></Table>
        <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
        <!-- 加载中 -->
        <Spin fix v-if="pageLoading">加载数据...</Spin>
      </Form>
      <div slot="footer" style="text-align: right">
        <Button @click="modalVisible = false">取消</Button>
      </div>
    </Modal>
</template>
<script>
export default {
  props: {
    moduleVisible: { type: Boolean, default: false },
    qualityCheckInfo: { type:Object, default:() => {}}
  },
  data() {
    return {
      modalForm:{
        templateData:[]
      },
      qualityColumns: [
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
      modalVisible: false,
      templateTypeMap: {
        0 : { text: '常规', color: 'green' },
        1 : { text: 'Temu', color: 'red' },
        2 : { text: 'Shein', color: 'purple' },
        3 : { text: 'Tiktok', color: 'orange' },
        4 : { text: 'Otto', color: 'blue' },
      }
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
      }
    },
    qualityCheckInfo: {
      deep:true,
      handler(val) {
        this.modalForm = val
      }
    }
  },
  computed: {
    pageLoading () {
      if (this.$common.isEmpty(this.modalForm) || this.$common.isEmpty(this.modalForm.loading)) return false;
      return this.modalForm.loading;
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.modalForm) || this.$common.isEmpty(this.modalForm.qualityProjectVOList)) return 0;
      let priceTotal = 0;
      this.modalForm.qualityProjectVOList.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  methods: {
    // 水洗唛PDF文件预览
    previewWashedPdf () {
      if (this.$common.isEmpty(this.modalForm.washedLabelPdfPath)) return;
      const url = this.modalForm.washedLabelPdfPath;
      const suffix = url.substring(url.lastIndexOf('.'), url.length);
      if (suffix.toLocaleLowerCase() == '.pdf') {
        this.axios.get(`./filenode/s${url}`, { responseType: 'blob' }).then(res => {
          this.$common.blobToBase64(res.data || res.resData).then(data => {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          })
        })
      } else {
        window.open(`./filenode/s${url}`);
      }
    },
  }
}
</script>
<style lang="less" scoped>
.modal-form{
  position: relative;
}
.washed-image-content{
  position: relative;
  width: 80px;
  height: 80px;
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