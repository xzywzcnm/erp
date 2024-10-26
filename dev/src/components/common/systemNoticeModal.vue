<template>
  <div v-if="systemNoticeList.length >0">
    <Modal v-model="systemNoticeModal" class-name="systemNoticeStyle" title="系统公告" width="800"
      :transfer="false" :mask-closable="false" @on-visible-change="systemNoticeModalChange">
      <div style="max-height: 600px; overflow-y: auto;">
        <div class="system_notice_box" v-for="(item, index) in systemNoticeList" :key="index">
          <div class="system_notice_title">
            <h2 class="title">{{ item.title }}</h2>
            <span class="title_item">{{ item.data[0].createdTime }}</span>
          </div>
          <div class="system_notice_item" v-for="(ele, idx) in item.subsystemList" :key="idx">
            <h2 class="title">{{ ele.subsystemName }}</h2>
            <div class="system_notice_conter">
              <p class="system_notice_line" v-for="(talg, ids) in ele.data" :key="ids">{{ ids + 1 + '、' + talg.context }}</p>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="systemNoticeModal = false">关闭</Button>
        <Button type="primary" @click="neverNotifyBtn">不再提醒</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'systemNoticeModal',
  mixins: [Mixin],
  data () {
    return {
      systemNoticeModal: false,
      systemNoticeList: [],
      originalData: []
    }
  },
  created () {
    // this.getsystemNoticeData();
  },
  methods: {
    // 获取系统公告的通知
    getsystemNoticeData () {
      let v = this;
      let systemAnnouncementNotice = JSON.parse(localStorage.getItem('systemAnnouncementNotice'));
      if (systemAnnouncementNotice) {
        v.axios.get(api.get_erpCommon_queryNoticeInfo).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.originalData = response.data.datas;
            if (data) {
              data.map((item) => {
                if (item.createdTime) {
                  item.createdTime = v.getDataToLocalTime(item.createdTime, 'fulltime');
                }
              });
              let new_arr = v.handerGrouping(data, function (item) {
                return [item.title];
              }, 'title');
              if (new_arr) {
                new_arr.map((ele) => {
                  ele.subsystemList = v.handerGrouping(ele.data, function (talg) {
                    return [talg.subsystemName];
                  }, 'subsystemName');
                })
              }
              v.systemNoticeList = new_arr;
            }
            v.systemNoticeModal = true;
            localStorage.setItem('systemAnnouncementNotice', JSON.stringify(false));
          }
        });
      }
    },
    // 不再提醒
    neverNotifyBtn () {
      let v = this;
      let noticeInfoIds = [];
      if (v.originalData.length > 0) {
        v.originalData.map((item) => {
          noticeInfoIds.push(item.noticeInfoId);
        })
      }
      v.axios.post(api.post_erpCommon_disableNoticeInfo, noticeInfoIds).then((response) => {
        if (response.data.code === 0) {
          v.systemNoticeModal = false;
          localStorage.setItem('systemAnnouncementNotice', JSON.stringify(false));
        }
      });
    },
    // 监听弹窗
    systemNoticeModalChange (value) {
      if (!value) {
        this.originalData = [];
        this.systemNoticeList = [];
        localStorage.setItem('systemAnnouncementNotice', JSON.stringify(false));
      }
    }
  }
}
</script>

<style lang="less" scoped>
.systemNoticeStyle {
  .system_notice_box {
    margin-bottom: 24px;

    .system_notice_title {
      margin-bottom: 15px;
      display: flex;
      justify-content: center;
      align-items: center;

      .title {
        font-weight: bold;
        color: #000;
        font-size: 22px;
        margin-right: 15px;
      }

      .title_item {
        color: #333;
        font-size: 15px;
      }
    }

    .system_notice_item {
      margin: 5px 0 24px 0;
      color: #333;
      font-size: 15px;

      .title {
        font-weight: bold;
        font-size: 18px;
        color: #333;
        margin-bottom: 10px;
      }

      .system_notice_conter {
        padding-top: 3px;
        color: #333;
        font-size: 15px;

        .system_notice_line {
          margin-bottom: 12px;
          width: 100%;
          word-wrap: break-word;
          word-break: break-all;
        }
      }
    }
  }
}
</style>
