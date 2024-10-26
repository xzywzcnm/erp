<template >
  <div :class="wrap">
    <div>
      <div>
        <div class="commonFilter">
          <div class="card-container">
            <div class="card-content">
              <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="100" style="padding-top: 10px">
                <div class="d-flex justify-conent-start align-items-center">
                  <Row class="wid-all">
                    <Col span="12">
                    <FormItem label="销售渠道">
                      <dyt-select class="wid256" v-model="pageParams.platformId" filterable>
                        <Option v-for="(item,index) in platformGroupList" :key="index" :value="item.platformId">{{ item.name }}</Option>
                      </dyt-select>
                    </FormItem>
                    </Col>
                    <Col span="12">
                    <FormItem label="状态">
                      <local-buttons :data="tabsData1" :value.sync="pageParams.type"></local-buttons>
                    </FormItem>
                    </Col>
                  </Row>
                </div>
                <div class="d-flex justify-conent-start align-items-center">
                  <Row class="wid-all">
                    <Col span="12">
                    <FormItem label="模糊搜索">
                      <Input class="wid256" :maxlength="100" v-model="pageParams.matchingChars" placeholder="买家ID、买家姓名、收货地址、买家身份ID" />
                    </FormItem>
                    </Col>
                  </Row>
                </div>
                <div class="filterItem filterConfirm" :class="{normalTop : moreFilter}">
                  <Button type="primary" @click="search" size="small" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="reset" size="small" v-once icon="md-refresh">重置 </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
        <!--操作-->
        <div class="dataSort grayBg">
          <Button style="margin-left: 20px">导入</Button>
          <Button style="margin-left: 20px">导出</Button>
        </div>
        <div class="plr10">
          <Table border :loading="tableLoading" :columns="columns1" :data="tableDate" @on-selection-change="checkDataMt"></Table>
          <div class="table-page">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<style scoped>
.ml10 {
  margin-left: 10px;
}

.plr16 {
  padding: 0 16px;
}

.wid256 {
  width: 256px;
}

.wid-all {
  width: 100%;
}
</style>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #fff !important;
}

.form-item-label-select {
  margin-top: -10px;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import postSaleStep from '@/views/customerCenter/components/postSaleTreatment/postSaleStep';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    return {
      moreFilter: false,
      total: 0,
      columns1: [
        {
          title: '销售渠道',
          key: 'platformId'
        }, {
          title: '类型',
          render (h, params) {
            let da = params.row.type;
            let str = da === 1 ? '买家ID' : da === 2 ? '买家姓名' : da === 3 ? '收货地址' : '买家身份ID';
            return h('span', str);
          }
        }, {
          title: '匹配字符',
          key: 'matchingChars'
        }, {
          title: '备注',
          key: 'remark'
        }, {
          title: '已加入公共黑名单',
          render: (h, params) => {
            let str = params.row.addedToPublic === 1 ? '是' : '否';
            return h('span', str);
          }
        }, {
          title: '操作'
        }
      ],
      tableDate: [],
      tabsData1: [
        {
          label: '全部',
          value: null
        }, {
          label: '买家ID',
          value: 1
        }, {
          label: '买家姓名',
          value: 2
        }, {
          label: '收货地址',
          value: 3
        }, {
          label: '买家身份ID',
          value: 4
        }
      ],
      platformGroup: [],
      pageParams: {
        'matchingChars': '', //  匹配字符 ,
        'platformId': 'ebay', //  平台ID(销售渠道) ,
        'type': null, //  类型(1买家ID2买家姓名3收货地址 4) ,
        'pageNum': 1,
        'pageSize': 10
      }
    };
  },
  components: {
    orderDetails,
    postSaleStep
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    tabsData () {
      return this.tabsData1.slice(1, this.tabsData1.length);
    }
  },
  methods: {
    checkDataMt (data) {
      this.checkedData = data;
    },
    search () {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    changePage (page) {
      let v = this;
      v.pageParams.pageNum = page;
      v.getList();
    },
    changePageSize (val) {
      this.pageParams.pageSize = (+val);
      this.getList();
    },
    reset () {
      for (let key in this.pageParams) {
        this.pageParams[key] = null;
      }
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 10;
    },
    getList () {
      let v = this;
      v.loadingTrue();
      let apiUrl = v.blackType === '0' ? api.get_privateBlackList : v.blackType === '1'
        ? api.get_whiteList
        : api.get_whiteList;
      v.axios.post(apiUrl, v.pageParams).then(res => {
        v.loadingFalse();
        if (res.data.code === 0) {
          v.tableDate = res.data.datas.list;
          v.total = res.data.datas.total;
        }
      }).catch(() => {
        v.loadingFalse();
      });
    }

  },
  created () {
    this.search();
  },
  mounted () {

  }
};
</script >
