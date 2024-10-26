<template >
  <div class="modalItem" v-if="orderInfo !== '' && orderInfo.isHand !== 1" >
    <div class="modalItemHeader" >
      <h6 >买家留言</h6 >
      <div class="modalItemHeaderRight" >
        <p class="setMark" >
          <Button
              size="small" type="primary" @click="replyMessageStatus = !replyMessageStatus" >{{
              !replyMessageStatus ? '回复' : '收起'
            }} </Button >
        </p >
      </div >
    </div >
    <div class="modalItemContent" >
      <div class="buyerMessageCotainer" >
        <Spin
            size="large" fix v-if="csListSpin" ></Spin >
        <Scroll
            :on-reach-bottom="handleReachBottom" height="200" >
          <template v-for="(item, index) in list" >
            <div
                v-if="item.senderFlag === 0" :key="index" >
              <div class="csUserInfo flexBox flexEnd" >
                <span class="csSenderName normalRMargin" >{{ item.senderName }}</span >
                <span >{{ getDataToLocalTime(item.createdTime, 'fulltime') }}</span >
              </div >
              <div class="csContent csUserContent flexBox flexEnd normalRMargin" >
                <Card
                    dis-hover style="margin:4px 0 16px 0; display: inline-block" class="greenBgColor tongtool-emoji" >
                  <div v-html="makeCsContent(item.content.replace(/\r\n|\n/g, '<br>'))" ></div >
                </Card >
              </div >
            </div >
            <div
                :key="index" v-else >
              <div class="csUserInfo" >
                <span class="csSenderName normalRMargin" >{{ item.senderName }}</span >
                <span >{{ getDataToLocalTime(item.createdTime, 'fulltime') }}</span >
              </div >
              <div class="csContent" >
                <Card
                    dis-hover style="margin:4px 0 16px 0;display:inline-block" class="tongtool-emoji" >
                  <div v-html="makeCsContent(item.content.replace(/\r\n|\n/g, '<br>'))" ></div >
                </Card >
              </div >
            </div >
          </template >
        </Scroll >
        <div
            class="normalTop" v-if="replyMessageStatus" >
          <Row >
            <Col :span="16" >
              <Input
                  v-model.trim="replyCsMessage" type="textarea" :rows="5" placeholder="请输入回复内容" ></Input >
            </Col >
            <Col
                :span="7" :offset="1" >
              <div >插入表情</div >
              <div class="noramlTop" >
                <Row >
                  <Col
                      v-if="expresssionArr.length > 0" v-for="item in expresssionArr" :key="item" :span="6" >
                    <div class="tongtool-emoji" >
                      <span
                          :class="'emoji' + item" @click="inserExpression('/:00' + item)" ></span >
                    </div >
                  </Col >
                </Row >
              </div >
              <div class="emojiPage flexBox flexEnd noSelect normalTop" >
                <Page
                    :current="expressionPage" :page-size="8" :total="99" simple @on-change="changeEmojiPage" ></Page >
              </div >
            </Col >
          </Row >
          <div class="normalTop flexBox" >
            <Button
                type="primary" @click="replyMes" class="normalRMargin" >回复 </Button >
            <dytUpload
                v-if="uploadPath && uploadHeader.hasOwnProperty('Authorization')"
                :action="uploadPath + '?basePath=/order'"
                :show-upload-list="false"
                :before-upload="handleBeforeUpload"
                :headers="uploadHeader"
                :on-success="uploadSuccess"
                :on-error="uploadError"
                :multiple="true"
                :format="['jpg', 'jpeg', 'png', 'gif']"
                name="files" >
              <Button
                  type="primary" class="normalRMargin" >上传图片 </Button >
            </dytUpload >
            <Button
                type="default" @click="combinePic" >预览 </Button >
          </div >
        </div >
      </div >
    </div >
    <keep-alive >
      <Modal
          v-model="combineModel" v-if="combineStatus" :width="700" >
        <p
            slot="header" style="color:#113f6d;text-align:left" >
          <Icon type="information-circled" ></Icon >
          <span style="color:#fff" >预览</span >
        </p >
        <div class="combinePath flexBox flexBoxJustContent flexAlignItemsCenter" >
          <Spin
              size="large" fix v-if="imgSpin" ></Spin >
          <img
              :src="combinePath" :width="combineWidth" :height="combineHeight" v-if="!imgSpin" >
        </div >
        <div slot="footer" >
          <div >
            <Button @click.stop="close" >取消</Button >
          </div >
        </div >
      </Modal >
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import '@/style/common/emoji.less';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin],
  props: {
    orderInfo: [Object, String]
  },
  data () {
    return {
      combineStatus: false,
      combineModel: false,
      combinePath: null,
      combineWidth: 0,
      combineHeight: 0,
      imgSpin: true,
      list: [],
      expressionPage: 1,
      expresssionArr: [],
      replyCsMessage: '',
      replyMessageStatus: false,
      filePath: '',
      csListSpin: true,
      uploadPath: api.upload_files,
      filesArr: []
    };
  },
  watch: {
    orderInfo: {
      handler (n, o) {
        this.list = [];
        this.replyMessageStatus = false;
        this.replyCsMessage = '';
        this.expressionPage = 1;
        if (n !== '' && n.isHand !== 1) { // 手工单不支持调接口获取买家留言，回复留言功能 (isHand = 1 为手工单)
          this.getCsMessage();
        }
      },
      immediate: true
    }
  },
  computed: {
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () {
    this.getExpressionArr();
  },
  methods: {
    getCsMessage () {
      let v = this;
      let obj = {
        merchantId: v.orderInfo.merchantId,
        orderIdList: [
          {
            orderId: v.orderInfo.webstoreOrderId,
            buyerAccountId: v.orderInfo.orderExtendInfo.aliexpressBuyerLoginId
          }
        ],
        pageSize: 30,
        pageNum: 1,
        saleAccountId: v.orderInfo.saleAccountId
      };
      v.axios.post(api.getCsMessage, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0 && response.data.datas !== null && response.data.datas.length > 0 && response.data.datas[0].msgList !== null) {
          if (response.data.datas[0].msgList.length > 0) {
            v.list = response.data.datas[0].msgList;
          }
        }
        v.csListSpin = false;
      });
    },
    makeCsContent (value) {
      let reg = /(\/:0){1}[0-9][0-9]/g;
      let arr = value.match(reg);

      if (arr !== null && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          let item = Number(arr[i].replace('/:', ''));
          let str = `<span class="emoji${item}"></span>`;
          value = value.replace(arr[i], str);
        }
      }
      return value;
    },
    changeEmojiPage (page) {
      let v = this;
      v.expressionPage = page;
      v.$nextTick(function () {
        v.getExpressionArr();
      });
    },
    getExpressionArr () {
      let v = this;
      v.expresssionArr = [];
      let len = v.expressionPage * 8;
      for (let i = (v.expressionPage - 1) * 8; i < len; i++) {
        if (i < 99) {
          v.expresssionArr.push(i);
        }
      }
    },
    inserExpression (text) {
      let v = this;
      v.replyCsMessage = v.replyCsMessage + text;
    },
    replyMes () { // 客服信息回复
      let v = this;
      if (v.replyCsMessage === '') {
        v.$Message.error('内容不能为空');
        return false;
      }
      let obj = {
        content: v.replyCsMessage,
        filePath: v.filePath,
        orderId: v.orderInfo.orderId
      };
      v.axios.post(api.set_replayMsg, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.list = [];
          v.csListSpin = true;
          v.replyCsMessage = '';
          v.$nextTick(function () {
            v.getCsMessage();
          });
        }
      });
    },
    handleBeforeUpload () {
      // let v = this;
    },
    uploadSuccess (response, file, fileList) {
      let v = this;
      if (response.code === 0) {
        let data = response.datas;
        v.$Message.success('上传成功');
        if (data.length > 0) {
          v.filesArr.push(data[0]);
        }
      } else {
        v.$Message.error('上传失败');
      }
    },
    uploadError () {
      this.$Message.error('操作失败，请重新尝试');
    },
    combinePic () {
      let v = this;
      if (v.filesArr.length < 1) {
        v.$Message.error('请先上传图片');
        return false;
      }
      v.axios.post(api.set_picsMerge, JSON.stringify(v.filesArr)).then(response => {
        if (response.data.code === 0) {
          v.combinePath = response.data.datas;
          v.combineStatus = true;
          v.$nextTick(function () {
            v.combineModel = true;
            const img = new Image();
            const maxWidth = 600;
            img.src = response.data.datas;
            img.onload = function () {
              if (img.width > maxWidth) {
                v.combineWidth = maxWidth;
                v.combineHeight = Math.floor((maxWidth / img.width) * img.height);
              } else {
                v.combineWidth = img.width;
                v.combineHeight = img.height;
              }
              v.$nextTick(function () {
                v.imgSpin = false;
              });
            };
          });
        }
      });
    },
    close () {
      this.combineModel = false;
    },
    handleReachBottom () {

    }
  }
};
</script>
