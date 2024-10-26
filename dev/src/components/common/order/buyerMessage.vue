<template>
  <div class="modalItem" v-if="!$common.isEmpty(orderInfo.orderNotes)">
    <div class="modalItemHeader">
      <h6 >{{ platform === 'ebay' ? '买家留言' : platform === 'aliexpress' ? '订单备注' : '' }}</h6>
      <div class="modalItemHeaderRight" >
        <div class="setMark" v-if="orderInfo.notesCheckingOk === 0 && orderInfo.isInvalid !== '1' && inPage !== 'dispute'">
          <Checkbox
            v-model="buyerMessageCheckStatus"
            v-if="hasEdit"
            :disabled="!getPermission('orderInfo_markAsRead_detail')"
            @on-change="setmarkReadAlready"
          >标记为已读</Checkbox>
        </div>
      </div>
    </div>
    <div class="modalItemContent">
      <div class="buyerMessageCotainer">
        <Row>
          <Col :span="2">
            <span class="buyerPic"></span>
          </Col>
          <Col :span="20" :offset="1">
            <div class="buyerContent">
              <p >{{ orderInfo.buyerAccountId }}</p>
              <template v-if="!$common.isEmpty(orderInfo.orderNotes)">
                <p v-html="orderInfo.orderNotes.replace(/\r\n|\n/g, '<br>')" ></p>
              </template>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      // 订单相关
      buyerMessageCheckStatus: false
    };
  },
  props: {
    hasEdit: {
      // 是否可以编辑
      default () {
        return true;
      },
      type: Boolean
    },
    orderInfo: [Object, String],
    platform: {
      type: String,
      default: 'ebay'
    },
    timestampTwo: Number,
    inPage: String
  },
  watch: {
    timestampTwo (n, o) {
      let v = this;
      if (n !== o) {
        v.resetMessageStatus();
      }
    }
  },
  methods: {
    resetMessageStatus () {
      this.buyerMessageCheckStatus = false;
    },
    setmarkReadAlready (value) { // 留言标记为已读
      let v = this;
      let obj;
      let arr = [];
      arr.push(v.platformType);
      if (value) {
        obj = {
          platformId: arr,
          orderIdList: [v.orderInfo.orderId]
        };
        v.axios.put(api.set_markRead, JSON.stringify(obj)).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('标记成功');
            v.orderInfo.notesCheckingOk = 1;
            if (v.inPage === 'combineOrder') {
              v.$store.commit('combineStatus', true);
            }
          } else {
            (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
          }
        });
      }
    }
  }
};
</script >
