<template>
  <div class="classDetails">
    <Modal
      v-model="visibleEdit"
      :title="modalTitle"
      :width="80"
      :mask-closable="false"
      class-name="modal-custom"
    >
      <Form ref="pageForm" class="" :model="formParams" :rules="ruleValidate" :label-width="100">
        <Form-item label="尺码分类" prop="classificationName">
          <dyt-input type="text" placeholder="请输入尺码分类" v-model="formParams.classificationName" :disabled="isDisabled" />
        </Form-item>
        <Form-item label="选择尺码项目" prop="sizePartIdList">
          <dyt-select v-model="formParams.sizePartIdList"  placeholder="选择尺码项目" multiple :disabled="isDisabled">
            <Option v-for="(item, index) in productSizePartList" :value='item.partId' :key="`picture-${index}`">
              {{item.cnName}}
           </Option>
          </dyt-select>
        </Form-item>
        <Form-item label="选择尺码图片" prop="pictureId">

          <div
            style="display: inline-block;text-align: center; line-height: 0;"
            v-if="sizePictureModal.picInfo"
            class="picture-group"
          >
            <!-- <div class="picture-group-title">{{sizePictureModal.pictureName}}: </div> -->
            <div
              v-for="(img, index) in sizePictureModal.picInfo"
              :key="`img-${index}`"
              class="picture-group-item"
            >
              <Poptip trigger="hover" :transfer="true" placement="bottom-start">
                <img style="width: 100px; height: 100px;" :src="img.pictureUrl" />
                <template slot="content">
                  <img style="max-width: 600px; max-height: 600px;" :src="img.pictureUrl" />
                </template>
              </Poptip>
            </div>

          </div>

          <Button
            style="margin-left: 10px;vertical-align: top;"
            type="primary"
            @click="openCheckPic"
            v-if="!isDisabled"
          >{{sizePictureModal.picInfo && sizePictureModal.picInfo.pictureUrl ? '更换图片': '请选择图片'}}</Button>
        </Form-item>
      </Form>
      <div>
        <div style="padding-bottom: 10px;">已选择尺码项目</div>
        <Table
         :columns="tableColumns"
         :data="tableList"
         border
         :max-height="600"
        ></Table>
      </div>
      <div slot="footer">
        <Button @click="visibleEdit = false">{{moduleData.viewType ? '关 闭': '取 消'}}</Button>
        <Button style="margin-left: 10px;" type="primary" @click="confirm" v-if="!isDisabled">确 定</Button>
      </div>
      <Spin v-if="pageLoading" fix ></Spin >
    </Modal>
    <selectSizePic :visible-module.sync="visibleSizePic" v-model="sizePictureModal" />
  </div>
</template>

<script>
import api from '@/api/api.js';
import selectSizePic from './selectSizePic'

export default {
  name: 'classDetails',
  components: { selectSizePic },
  mixins: [],
  props: {
    visibleModule: { type: Boolean, default: false },
    moduleData: { type: Object, default: () => { return {} } }
  },
  data () {
    return {
      api: api.sizeManageApiConfig.sizeClassManage,
      pageLoading: false,
      visibleSizePic: false,
      isDisabled: false,
      modalTitle: '添加',
      visibleEdit: false,
      formParams: {
        classificationId: '',
        classificationName: '',
        sizePartIdList: [],
        pictureId: ''
      },
      oldFormData: {},
      ruleValidate: {
        classificationName: [
          { required: true, message: '请输入尺码分类', trigger: 'change' },
          { required: true, message: '请输入尺码分类', trigger: 'blur' }
        ],
        sizePartIdList: [
          { required: true, message: '选择尺码项目', trigger: 'change', type: 'array' }
        ],
        pictureId: [
          { required: true, message: '选择尺码图片', trigger: 'change', type: 'string' }
        ]
      },
      productSizePartList: [],
      tableList: [],
      // pageData: {},
      tableColumns: [
        {
          title: '测量部位',
          key: 'cnName',
          width: 300,
          tooltip: true,
          render (h, { row }) {
            return h('span', row.cnName)
          }
        },
        {
          title: '测量方式描述',
          key: 'measurementDescription',
          minWidth: 170,
          tooltip: true,
          render (h, { row }) {
            return h('span', row.measurementDescription)
          }
        }
      ],
      sizePictureModal: {}
    }
  },
  watch: {
    visibleModule: {
      deep: true,
      immediate: true,
      handler (val) {
        this.visibleEdit = val;
        val && this.initPage();
      }
    },
    visibleEdit: {
      deep: true,
      handler (val) {
        !val && this.resetData();
        this.$emit('update:visibleModule', val);
      }
    },
    'formParams.sizePartIdList': {
      deep: true,
      handler (val) {
        this.tableList = this.productSizePartList.filter(item => {
          return val.includes(item.partId)
        })
      }
    },
    sizePictureModal: {
      deep: true,
      handler (val) {
        // console.log(val)
        if (val && val.picInfo) {
          this.$set(this.formParams, 'pictureId', val.pictureId);
        }
        this.$nextTick(() => {
          this.$refs.pageForm && this.$refs.pageForm.validateField('pictureId')
        })
      }
    }
  },
  created () {},
  methods: {
    async initPage () {
      this.pageLoading = true;
      try {
        await this.getProductSizePartList();
      } catch (e) {
        console.error('获取尺码项目出错', e)
      }
      this.oldFormData = this.$common.copy(this.formParams);
      if (!this.$common.isEmpty(this.moduleData)) {
        if (this.moduleData.viewType) {
          this.modalTitle = '详情';
          this.isDisabled = true;
        } else {
          this.modalTitle = '编辑';
        }
        this.$nextTick(() => {
          this.pageData = this.$common.copy(this.moduleData);
          this.getDetails();
        })
      } else {
        this.modalTitle = '添加';
        this.pageLoading = false;
      }
      // this.pageLoading = false;
    },
    getDetails () {
      this.pageLoading = true;
      this.axios.get(this.api.queryProductSizeClassificationInfo, {
        params: {
          classificationId: this.pageData.classificationId
        }
      }).then(res => {
        this.pageLoading = false;
        if (res && res.code === 0) {
          Object.keys(this.formParams).forEach(key => {
            if (!this.$common.isUndefined(res.datas[key])) {
              this.$set(this.formParams, key, res.datas[key]);
            }
          })
          if (res.datas.laPaProductSizePartInfoVOList) {
            const partIds = res.datas.laPaProductSizePartInfoVOList.map(item => {
              return item.partId;
            })
            this.$set(this.formParams, 'sizePartIdList', partIds);
          }
          if (res.datas.laPaProductPictureLanguageList) {
            const pic = res.datas.laPaProductPictureLanguageList || [];
            let picId = '';
            pic.forEach((item, index) => {
              if (!item.pictureUrl.includes('http:') && !item.pictureUrl.includes('https:') && !item.pictureUrl.includes('/pds-service/filenode/s')) {
                pic[index].pictureUrl = `/pds-service/filenode/s${item.pictureUrl}`;
              }
              this.$common.isEmpty(picId) && (picId = item.pictureId);
            })
            this.sizePictureModal = {
              pictureName: '',
              classificationId: this.moduleData.classificationId,
              picInfo: pic,
              pictureId: picId
            }
            this.$set(this.formParams, 'pictureId', this.sizePictureModal.pictureId);
          }
        }
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 获取项目尺码
    getProductSizePartList () {
      this.axios.get(this.api.queryAllProductSizePartList).then(res => {
        if (res.code === 0 && res.datas) {
          this.productSizePartList = res.datas;
        }
      })
    },
    // 重置数据
    resetData () {
      this.sizePictureModal = {};
      this.isDisabled = false;
      this.productSizePartList = [];
      this.tableList = [];
      this.$refs.pageForm && this.$refs.pageForm.resetFields();
      this.formParams = this.$common.copy(this.oldFormData);
    },
    // 确认保存
    confirm () {
      this.$refs.pageForm && this.$refs.pageForm.validate((validate) => {
        if (!validate) return;
        let params = this.$common.copy(this.formParams);
        // console.log(params)
        this.pageLoading = true;
        const url = this.api[this.$common.isEmpty(params.classificationId) ? 'addProductSizeClassification' : 'updateProductSizeClassification'];
        this.axios.post(url, params).then((data) => {
          if (data.code === 0) {
            this.$Message.success('保存成功！');
            this.visibleEdit = false;
            this.$emit('refreshPage');
          }
        }).finally(() => {
          this.pageLoading = false;
        })
      });
    },
    // 打开选择图片弹窗
    openCheckPic () {
      this.$nextTick(() => {
        this.visibleSizePic = true;
      });
    },
    // 确认选择图片
    checkPicConfirm () {}
  }
}
</script>
<style scoped>
.poptip-img-ctrl{
  max-width: 600px;
  max-height: 600px;
}
</style>
<style lang="less">
.modal-custom{
  .picture-group{
    .picture-group-item{
      margin: 0 15px 15px 0;
      display: inline-block;
      vertical-align: top;
      &:last-child{
        margin: 0 0 15px 0;
      }
      .ivu-poptip{
        font-size: 0;
        line-height: 0;
        box-shadow: 0 1px 5px 1px #868686;
        border-radius: 5px;
        vertical-align: top;
        overflow: hidden;
      }
    }
    .picture-group-title{
      position: relative;
      display: inline-block;
      line-height: initial;
    }
  }
}

</style>
