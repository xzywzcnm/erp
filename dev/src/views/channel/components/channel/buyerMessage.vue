<template >
  <Modal v-model="model1" title="买家发送消息" @on-visible-change="visibleMt" width="600" >
    <Form ref="formInline" @submit.native.prevent :model="formInline" :rules="ruleInline" :label-width="130" >
      <FormItem v-for="(item,index) in allMessageTemplateList" :key="index" :label="item.categoryName" >
        <dyt-select v-model="item.model" >
          <Option
            v-for="(citem,cindex) in item.children"
            @click.native.stop="whiteTemp(citem)"
            :key="cindex"
            :value="citem.messageTemplateName"
          >{{ citem.messageTemplateName }}</Option>
          </dyt-select >
      </FormItem >
      <Row >
        <Col span="6" class="late-code-box" >
          <span >模板编号</span > <Input
            v-model.trim="templateCode" @on-enter="searchTemplateByCode" placeholder="enter搜索" clearable ></Input >
        </Col >
        <Col span="16" >
          <div class="demo-upload-list" v-for="(item,index) in uploadedImgList" :key="index" >
            <template v-if="item.status === 'finished'" >
              <img :src="item.url" >
              <div class="demo-upload-list-cover" >
                <Icon type="ios-trash-outline" @click.native="handleRemove(item)" ></Icon >
              </div >
            </template >
            <template v-else >
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info ></Progress >
            </template >
          </div >
          <dytUpload
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
              name='files'
              :data='{saleAccountId: orderInfo.saleAccountId}'
              multiple
              type="drag"
              :action="`${uploadPath}?saleAccountId=${orderInfo.saleAccountId}`"
              style="display: inline-block;width:58px;" >
            <div style="width: 58px;height:58px;line-height: 58px;" >
              <Icon type="ios-camera" size="20" ></Icon >
            </div >
          </dytUpload >
        </Col >
      </Row >
      <Input v-model="requestBo.messageContent" :maxlength="5000" type="textarea" :rows="4" />
    </Form >
    <div slot="footer" >
      <Button type="primary" @click="sendMessage" >保存 </Button >
      <Button @click="model1 = false" >关闭</Button >
    </div >
  </Modal >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import { getToken } from '@/utils/cookie';

export default {
  name: 'BuyerMessage',
  mixins: [Mixin],
  props: ['orderInfo'],
  data () {
    let v = this;
    return {
      templateCode: '',
      allMessageTemplateList: [],
      model1: false,
      currentMessage: '',
      currentMessageGroup: '',
      formInline: {
        user: '',
        password: ''
      },
      ruleInline: {
        user: [
          {
            required: true,
            message: 'Please fill in the user name',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please fill in the password.',
            trigger: 'blur'
          }, {
            type: 'string',
            min: 6,
            message: 'The password length cannot be less than 6 bits',
            trigger: 'blur'
          }
        ]
      },
      uploadedImgList: [], // 已上传图片列表
      defaultList: [],
      requestBo: {
        'itemId': v.orderInfo.orderTransactions[0].webstoreItemId, // itemId
        'itemTitle': v.orderInfo.orderTransactions[0].title, //  item标题
        'messageContent': '', // 回复的内容
        tempMessageContent: '', // 存在多交易 存放
        'messageMediaList': [ // 站内信附件列表
          {
            'mediaName': '', // 附件名称
            'mediaUrl': '' // 附件网址
          }
        ],
        'receiver': v.orderInfo.buyerAccountId, // 接收人 ,
        'saleAccountId': v.orderInfo.saleAccountId, // 帐号编号
        'sendToEmail': 0, // 站内信附件列表
        'sender': '' // 发送人
      },
      uploadPath: api.ebay_uploadPictureBySaleAccountId // 上传图片地址
    };
  },
  computed: {
    uploadImgHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () {},
  mounted () {
    this.uploadedImgList = this.$refs.upload.fileList;
  },
  watch: {},
  methods: {
    sendMessage () {
      let v = this;
      if (v.requestBo.messageContent === '' || v.requestBo.messageContent === null) {
        v.$Message.error('消息内容不能为空');
        return;
      }
      v.requestBo.messageMediaList = v.uploadedImgList.map(i => {
        return {
          mediaName: i.response.datas.mediaName,
          mediaUrl: i.response.datas.mediaUrl
        };
      });
      v.axios.post(api.update_ebaySendBuyerMessage, v.requestBo).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.model1 = false;
        }
      });
    },
    searchTemplateByCode () { // 根据模版编号查询模版内容
      let v = this;
      if (v.templateCode) {
        v.axios.get('/order-service/erpCommon' + api.query_tempCode + '?platformId=' + v.inGroup + '&templateCode=' + v.templateCode).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data) {
              v.requestBo.messageContent = data.messageContent;
            } else {
              v.$Message.error('未找到模板');
            }
            v.templateCode = '';
          }
        });
      }
    },
    getOrderBuyerIdAndItemId () { // 根据买家ID、ITEMId查询订单信息
      let v = this;
      return new Promise(resolve => {
        v.axios.get('/order-service/erpCommon' + api.queryByBuyerIdAndItemId + '?buyerAccountId=' + v.orderInfo.buyerAccountId + '&itemId=' + v.orderInfo.orderTransactions[0].webstoreItemId).then(res => {
          if (res.data.code === 0) {
            let arr = res.data.datas;
            let arr1 = [];
            if (arr) {
              arr.forEach(i => {
                i.orderShippingInfos.forEach(j => {
                  j.orderShippingDetailBos.forEach(k => {
                    k.orderLen = i.orderShippingInfos.length;
                    k.packageLen = j.orderShippingDetailBos.length;
                    k.accountCode = i.accountCode;
                    arr1.push(k);
                  });
                });
              });
              let arr2 = arr1.sort(v.compare('orderId', 'packageCode'));
              arr2.forEach((i) => {
                if (!v.orderLength['i' + i.packageCode]) {
                  v.orderLength['i' + i.packageCode] = 1;
                  i.packageCodeIndex = true;
                } else {
                  v.orderLength['i' + i.packageCode] += 1;
                }
                if (!v.orderLength[i.orderId]) {
                  v.orderLength[i.orderId] = 1;
                  i.rowIndex = true;
                } else {
                  v.orderLength[i.orderId] += 1;
                }
              });
              v.orderList = arr2;
            }
            resolve();
          }
        }).catch(() => {
        });
      });
    },
    whiteTemp (item) {
      this.allMessageTemplateList.forEach(i => {
        i.model = '';
      });
      this.requestBo.messageContent = item.messageContent;
    },
    visibleMt (open) {
      if (open) {
        this.requestBo.messageContent = '';
        this.requestBo.itemId = this.orderInfo.orderTransactions[0].webstoreItemId;
        this.requestBo.itemTitle = this.orderInfo.orderTransactions[0].title;
        this.requestBo.receiver = this.orderInfo.buyerAccountId;
        this.requestBo.saleAccountId = this.orderInfo.saleAccountId;
        this.getAllTemp();
        this.getAccount();
      }
    },
    getAccount () {
      let v = this;
      v.axios.post(api.get_saleAccountById + '?saleAccountIds=' + v.orderInfo.saleAccountId).then(response => {
        if (response.data.code === 0) {
          v.requestBo.sender = response.data.datas[0].account;
        }
      });
    },
    getAllTemp () {
      // 获取所有模板
      let v = this;
      v.axios.get('/order-service/erpCommon' + api.get_allTemplate + '?platformId=' + v.inGroup).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let obj = {};
          let arr = [];
          data.forEach((i) => {
            i.model = '';
            if (!obj[i.categoryName]) {
              i.children = [];
              arr.push(i);
              obj[i.categoryName] = i.children;
            }
            obj[i.categoryName].push(i);
          });
          v.allMessageTemplateList = arr;
        }
      }).catch(() => {
      });
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
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
    handleFormatError (file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
      });
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 2M.'
      });
    },
    handleBeforeUpload () {
      const fileList = this.$refs.upload.fileList;
      const check = fileList.length < 6;
      if (!check) {
        this.$Notice.warning({
          title: 'Up to five pictures can be uploaded.'
        });
        this.uploadedImgList = fileList.filter(item => {
          return item.status == 'finished' && !item.showProgress;
        });
      }
      return check;
    }
  }
};
</script>

<style scoped lang="less">
.late-code-box {
  float: left;
  margin-top: 9px;
  margin-right: 10px;
}
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
