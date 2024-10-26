<template >
  <div >
    <!--筛选-->
    <div class="interceptOrderFilter" >
      <div class="card-container" >
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="90" >
            <dyt-filter>
              <Form-item label="客服人员：" prop="userIdList" >
                <dyt-select v-model="pageParams.userIdList" :max-tag-count="1" multiple>
                  <Option v-for="item in userListData" :key="item.id" :value="item.id" >{{ item.name }}</Option>
                </dyt-select >
              </Form-item >
              <Form-item label="时间：" >
                <Date-picker
                  type="datetimerange"
                  @on-clear="resetDate"
                  transfer
                  @on-change="getDateValue"
                  :clearable="clearAble"
                  :options="dateOptions"
                  format="yyyy-MM-dd"
                  placement="bottom-end"
                  placeholder="选择日期"
                  :value="payTimeArr"
                />
              </Form-item>
              <div slot="operation">
                <Button type="primary" @click="search" v-if="getPermission('reportDayCsReplyMsgStatistics_query')">统计</Button>
                <Button type="primary" @click="exportBtn" style="margin-left: 10px;" v-if="getPermission('reportDayCsReplyMsgStatistics_export')">导出 </Button>
              </div>
            </dyt-filter>
          </Form >
        </div >
      </div >
    </div >

    <div
        class="orderTable normalTop"
        v-if="getPermission('reportDayCsReplyMsgStatistics_query') || getPermission('reportDayCsReplyMsgStatistics_export')" >
      <Table
          highlight-row
          border
          :height="tableHeight"
          :loading="tableLoading"
          :columns="statisticsColumn"
          :data="statisticsData" ></Table >
      <div class="table-page flexBox" >
        <keep-alive >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              :current="curPage"
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </keep-alive >
      </div >
    </div >
  </div >
</template>

<style lang="less" scoped >
.interceptOrderFilter{
  :deep(.platformParamsSelect){
    padding-top: 10px;
  }
  :deep(.ivu-form-item){
    display: flex;
    label {
      width: auto !important;
    }
  }
}

</style>

<script>
import api from '@/api/api';
import orderSys from '@/components/mixin/orderSys_mixin';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin, orderSys],
  data () {
    var v = this;
    return {
      pageParamsStatus: false,
      total: 0,
      curPage: 1,
      tableLoading: false,
      clearAble: true,
      payTimeArr: [],
      userListData: [],
      pageParams: {
        platformId: 'ebay',
        pageNum: 1,
        pageSize: 50,
        userIdList: [],
        startReplyDate: null,
        endReplyDate: null
      },
      statisticsData: [],
      statisticsColumn: [
        {
          title: '客服姓名',
          key: 'userName',
          align: 'center',
          render: (h, params) => {
            let userName = '';
            let userId = params.row.userId;
            if (v.userListData.length > 0) {
              v.userListData.map((item) => {
                if (item.id === userId) {
                  userName = item.name;
                }
              });
            }
            return h('div', userName);
          }
        }, {
          title: '日期',
          key: 'time',
          align: 'center',
          render: (h, params) => {
            let start_time = v.getUniversalTime(new Date(params.row.startReplyDate).getTime());
            let end_time = v.getUniversalTime(new Date(params.row.endReplyDate).getTime());
            return h('div', start_time + '-' + end_time);
          }
        }, {
          title: 'Ebay站内信处理数量',
          key: 'quantity',
          align: 'center'
        }
      ]
    };
  },
  created () {
    this.setTime();
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(240);
    }
  },
  methods: {
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getPermission('reportDayCsReplyMsgStatistics_query') ? v.getList() : v.gotoError()).then(() => {
        v.$Loading.finish();
        v.GetUserData();
      });
    }, // 设置默认时间
    setTime () {
      let start_time = new Date();
      let end_time = new Date();
      this.pageParams.startReplyDate = this.getUniversalTime(new Date().getTime());
      this.pageParams.endReplyDate = this.getUniversalTime(new Date().getTime());
      this.payTimeArr = [start_time, end_time];
    }, // 获取客服人员的数据
    GetUserData () {
      this.userListData = [];
      let apiUrl = api.get_userInfoCommon.replace(/^\./, '/cs-service');
      this.axios.get(apiUrl).then((response) => {
        if (response.data.code === 0) {
          let query = response.data.datas;
          if (Object.keys(query).length > 0) {
            for (let key in query) {
              this.userListData.push({
                id: query[key].userId,
                name: query[key].userName
              });
            }
          }
        }
      });
    }, // 获取列表数据
    getList () {
      var v = this;
      v.pageParams.merchantId = v.$store.state.erpConfig.userInfo.merchantId;
      v.axios.post(api.get_msgStatistics, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null) {
            v.statisticsData = data.list;
          } else {
            v.statisticsData = [];
          }
          v.$nextTick(function () {
            v.loadingFalse();
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        }
      });
    }, // 导出按钮
    exportBtn () {
      this.axios.post(api.export_msgStatistics, JSON.stringify(this.pageParams)).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      });
    }, // 获取日期返回值
    getDateValue (value) {
      var v = this;
      if (value.length === 0 || !value[0]) {
        v.resetDate();
      } else {
        if (value[0] !== '') {
          v.pageParams.startReplyDate = v.getUniversalTime(new Date(value[0]).getTime());
          v.pageParams.endReplyDate = v.getUniversalTime(new Date(value[1]).getTime());
        }
      }
    }, // 清空时间
    resetDate () {
      let v = this;
      // v.setTime();
      v.pageParams.startReplyDate = null;
      v.pageParams.endReplyDate = null;
    }
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
};
</script >
