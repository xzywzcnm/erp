<template>
  <Modal
    v-model="modalVisible"
    title="买家发送消息"
    @on-cancel="cancelContact"
    @on-ok="saveContact"
    width="600px"
    :mask="true"
    :mask-closable="false"
  >
    <div class="formTemplate">
      <Form :model="contactForm" :label-width="80">
        <FormItem
          v-for="(item, index) in allMessageTemplateList"
          :key="index"
          :label="item.categoryName"
        >
          <dyt-select v-model="item.model">
            <Option
              v-for="(citem, cindex) in item.children"
              @click.native.stop="whiteTemp(citem)"
              :key="cindex"
              :value="citem.messageTemplateName"
              >{{ citem.messageTemplateName }}</Option
            >
          </dyt-select>
        </FormItem>
      </Form>
    </div>
    <div style="display: flex">
      <div class="templateNum">
        <div>模版编号</div>
        <div class="templateInp">
          <Input
            v-model.trim="contactForm.input"
            @on-enter="searchTemplateByCode"
            placeholder="enter搜索"
            clearable
          ></Input>
        </div>
      </div>
      <div>
        <div
          class="demo-upload-list"
          v-for="(item, index) in uploadedImgList"
          :key="index"
        >
          <template v-if="item.status === 'finished'">
            <img :src="item.url" />
            <div class="demo-upload-list-cover">
              <Icon
                type="ios-trash-outline"
                @click.native="handleRemove(item)"
              ></Icon>
            </div>
          </template>
          <template v-else>
            <Progress
              v-if="item.showProgress"
              :percent="item.percentage"
              hide-info
            ></Progress>
          </template>
        </div>
        <dytUpload
          v-if="uploadCheckType !== 'all'"
          ref="upload"
          :show-upload-list="false"
          :default-file-list="defaultList"
          :on-success="handleSuccess"
          :on-progress="handleProgress"
          :on-error="handleError"
          :format="['JPG', 'JPEG', 'GIF', 'PNG', 'BMP', 'PDF']"
          :max-size="2048"
          :on-format-error="handleFormatError"
          :on-exceeded-size="handleMaxSize"
          :before-upload="handleBeforeUpload"
          :headers="uploadImgHeader"
          name="files"
          multiple
          type="drag"
          :data='{saleAccountId: uploadSaleAccountId}'
          :action="`${uploadPath}?saleAccountId=${uploadSaleAccountId}`"
          style="display: inline-block; width: 58px"
        >
          <div style="width: 58px; height: 58px; line-height: 58px">
            <Icon type="ios-camera" size="20"></Icon>
          </div>
        </dytUpload>
      </div>
    </div>
    <div class="contactText mt10">
      <Input
        v-model="contactForm.text"
        type="textarea"
        placeholder=""
      ></Input>
    </div>
    <div slot="footer">
      <Button @click="cancelContact">取消</Button>
      <Button type="primary" @click="saveContact">保存</Button>
    </div>
    <Spin v-if="loadingContact" fix></Spin>
  </Modal>
</template>
<script>
/**
 * *父组件：已取消订单
 * */
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';

export default {
  mixins: [Mixin, orderSys],
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    platformId: { type: String, default: '' },
    moduleData: { type: Object,
      default: () => {
        return {
          uploadCheckType: 'check'
        }
      } }
  },
  data () {
    return {
      checkRow: [],
      searchParams: {},
      modalVisible: false,
      uploadSaleAccountId: '',
      uploadCheckType: 'check',
      loadingContact: false,
      allMessageTemplateList: [],
      contactForm: {
        test: null,
        input: null,
        text: null,
      },
      uploadPath: api.ebay_uploadPictureBySaleAccountId, // 上传图片地址
      defaultList: [],
      uploadedImgList: [], // 已上传图片列表
    }
  },
  watch: {
    moduleVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initPage();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
      }
    }
  },
  computed: {
    uploadImgHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  activated () {},
  created () {},
  mounted () {},
  methods: {
    initPage () {
      this.uploadedImgList = this.$refs.upload ? this.$refs.upload.fileList : [];
      this.uploadCheckType = this.moduleData.uploadCheckType || 'check';
      this.uploadSaleAccountId = this.moduleData.uploadSaleAccountId || '';
      this.searchParams = this.moduleData.searchParams || {};
      this.checkRow = this.moduleData.checkRow || [];

      this.$nextTick(() => {
        this.getTemplate();
        this.clearContactForm();
      })
    },
    handleSuccess (res, file, fileList) {
      if (res.datas) {
        file.url = res.datas.mediaUrl;
        this.uploadedImgList = fileList;
      }
    },
    handleProgress (event, file, fileList) {
      this.uploadedImgList = fileList;
    },
    handleError (errorInfo, file, fileList) {
      this.uploadedImgList = fileList;
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "Exceeding file size limit",
        desc: "File  " + file.name + " is too large, no more than 2M.",
      });
    },
    handleBeforeUpload() {
      const fileList = this.$refs.upload.fileList;
      const check = fileList.length < 6;
      if (!check) {
        this.$Notice.warning({
          title: "Up to five pictures can be uploaded.",
        });
        this.uploadedImgList = fileList.filter(item => {
          return item.status == 'finished' && !item.showProgress;
        });
      }
      let checkAccountIds = [];
      this.checkRow.forEach(row => {
        !checkAccountIds.includes(row.saleAccountId) && checkAccountIds.push(row.saleAccountId);
      });
      if (checkAccountIds.length > 1) {
        this.$Message.error('不支持多个店铺上传图片, 请选择同一店铺的数据后再尝试！');
        return false;
      }
      return check;
    },
    searchTemplateByCode() {
      // 根据模版编号查询模版内容
      if (this.contactForm.input) {
        this.axios.get(`/order-service/erpCommon${api.query_tempCode}?platformId=${this.platformId}&templateCode=${this.contactForm.input}`).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data) {
              this.contactForm.text = data.messageContent;
            } else {
              this.$Message.error("未找到模板");
            }
            this.contactForm.input = "";
          }
        });
      }
    },
    handleContactData() {
      const msgMediaList = (this.uploadedImgList || []).map(i => {
        return {
          mediaName: i.response.datas.mediaName,
          mediaUrl: i.response.datas.mediaUrl
        };
      });
      if (this.uploadCheckType !== "all") {
        let temp = this.checkRow.map((k) => {
          return {
            itemId: k.productList[0].webstoreItemId,
            itemTitle: k.productList[0].title,
            saleAccountId: k.saleAccountId,
            sender: k.accountCode || '',
            receiver: k.buyerAccountId,
            messageContent: this.contactForm.text,
            sendToEmail: 0,
            tempMessageContent: "",
            messageMediaList: msgMediaList,
          };
        });
        return temp;
      }
      return {
        queryOrderListBo: this.searchParams,
        sendBuyerMessageRequestBo: {
          messageContent: this.contactForm.text,
          sendToEmail: 0,
          tempMessageContent: "",
          messageMediaList: msgMediaList,
        },
      };
    },
    // 关闭联系买家弹窗
    cancelContact() {
      this.modalVisible = false;
    },
    // 发送信息
    saveContact() {
      if (this.$common.isEmpty(this.contactForm.text)) {
        return this.$Message.error("消息内容不能为空");
      }
      const contactParams = this.handleContactData();
      this.loadingContact = true;
      this.axios.post(api[this.uploadCheckType !== "all" ? "update_ebaySendBuyerMessageNew" : "asyncSendByQueryResult"], contactParams).then((response) => {
        this.loadingContact = false;
        if (response.data.code === 0) {
          this.$Message.success("操作成功");
          this.modalVisible = false;
        }
      }).finally(() => {
        this.loadingContact = false;
      });
    },
    clearContactForm() {
      this.contactForm.text = "";
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "The file format is incorrect",
        desc:
          "File format of " +
          file.name +
          " is incorrect, please select jpg or png.",
      });
    },
    getTemplate() {
      this.loadingContact = true;
      this.axios.get(`/order-service/erpCommon${api.get_allTemplate}?platformId=${this.platformId}`).then((res) => {
        this.loadingContact = false;
        if (res.data.code === 0) {
          let data = res.data.datas;
          let obj = {};
          let arr = [];
          data.forEach((i) => {
            i.model = "";
            if (!obj[i.categoryName]) {
              i.children = [];
              arr.push(i);
              obj[i.categoryName] = i.children;
            }
            obj[i.categoryName].push(i);
          });
          this.allMessageTemplateList = arr;
        }
      }).catch(() => {
        this.loadingContact = false;
      });
    },
    whiteTemp(item) {
      this.allMessageTemplateList.forEach((i) => {
        i.model = "";
      });
      this.contactForm.text = item.messageContent;
    }
  }
};
</script>
<style lang="less" scoped>
.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  margin-right: 4px;

  img {
    width: 100%;
    height: 100%;
  }

  &:hover {
    .demo-upload-list-cover {
      display: block;
    }
  }
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, .6);

  i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
}
</style>
