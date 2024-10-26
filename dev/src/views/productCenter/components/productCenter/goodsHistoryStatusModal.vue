<template>
  <Modal
    :title="modalTitle"
    v-model="modalVisible"
    width="900"
    :mask-closable="false"
    :transfer="true"
    class="halt-sales-adjust-modal"
  >
    <div class="modal-main-clas">
      <!-- <div class="modal-filter-content">
        <Form ref="modalFilterForm" :model="pageParams" :label-width="60" class="modal-filter-form">
          <Form-item label="SPU" class="modal-filter-item" prop="spuList">
            <dyt-input-tag type="textarea" :limit="1" placeholder="请输入SPU，多个关用逗号或回车分隔" v-model="pageParams.spuList" />
          </Form-item>
        </Form>
        <div>
          <Button type="primary" icon="md-search" @click="searchData" :disabled="tableLoading">查询</Button>
        </div>
      </div> -->
      <Table
        highlight-row
        border
        :max-height="500"
        :loading="tableLoading"
        :columns="tableColumn"
        :data="talbeData"
      />
      <div class="mt5 modal-page">
        <Page
          :total="tableTotal"
          @on-change="pageNumChange"
          show-total
          :page-size="pageParams.pageSize"
          show-elevator
          :current="pageParams.pageNum"
          show-sizer
          @on-page-size-change="pageSizeChange"
          placement="top"
          :page-size-opts="pageArray"
        />
      </div>
    </div>
    <div slot="footer">
      <Button @click="modalVisible = false">关闭</Button>
    </div>
  </Modal>
</template>
<script>
import api from '@/api/api';

export default {
  name: 'haltSalesAdjustModal',
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false },
    moduleData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      modalVisible: false,
      loading: false,
      tableLoading: false,
      pageArray: [10, 20, 50, 100],
      tableTotal: 0,
      pageParams: {
        pageNum: 1,
        pageSize: 10,
      },
      talbeData: [],
      tableColumn: [
        {
          title: '状态开始时间',
          key: 'startTime',
          align: 'center',
          minWidth: 160,
          render: (h, { row }) => {
            return h('span', row.startTime);
          }
        },
        {
          title: '状态结束时间',
          key: 'endTime',
          align: 'center',
          minWidth: 160,
          render: (h, { row }) => {
            return h('span', row.endTime);
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 100,
        },
        {
          title: '修改人',
          key: 'updatedBy',
          align: 'center',
          minWidth: 160,
          render: (h, { row }) => {
            return h('span', row.updatedBy);
          }
        }
      ],
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
        this.$nextTick(() => {
          !val && this.closeModal();
        })
      }
    }
  },
  computed: {
    // 可查看的事业部
    getUseBusinessDeptIds() {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptIds;
    },
    sku () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.sku)) return '';
      return this.moduleData.sku;
    },
    productGoodsId () {
      if (this.$common.isEmpty(this.moduleData) || this.$common.isEmpty(this.moduleData.productGoodsId)) return '';
      return this.moduleData.productGoodsId;
    },
    modalTitle () {
      return `历史商品状态 (SKU：${this.sku})`;
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 初始化数据
    initData () {
      this.$refs.modalFilterForm && this.$refs.modalFilterForm.resetFields();
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 返回搜索条件
    getSearchParams () {
      let obj = this.$common.copy(this.pageParams);
      // if (!this.$common.isEmpty(obj.haltTheSalesTime) && !this.$common.isEmpty(obj.haltTheSalesTime[0])) {
      //   obj.startHaltTheSalesTime = this.$common.toLocaleDate(obj.haltTheSalesTime[0], 'fulltime', 0);
      //   obj.endHaltTheSalesTime = this.$common.toLocaleDate(obj.haltTheSalesTime[1], 'fulltime', 0);
      // }
      // obj.businessDeptIds = this.getUseBusinessDeptIds;
      // delete obj.haltTheSalesTime;
      obj.productGoodsId = this.productGoodsId;
      obj.orderBy = 'start_time';
      obj.upDown = 'down';
      return obj;
    },
    // 查询列表数据
    searchData () {
      if (this.tableLoading) return;
      let params = this.getSearchParams();
      this.talbeData = [];
      this.tableLoading = true;
      this.axios.post(api.historyGoodsStatusQuery, params).then(res => {
        if (!res || !res.data || !res.data.datas || res.data.code != 0) return;
        this.talbeData = res.data.datas.list || [];
        this.tableTotal = res.data.datas.total;
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 返回page
    pageNumChange(page) {
      this.pageParams.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 返回pageSize
    pageSizeChange(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 关闭弹窗
    closeModal () {
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = 10;
      this.talbeData = [];
      this.tableTotal = 0;
      this.tableLoading = false;
      this.loading = false;
    },
  }
};
</script>
<style lang="less" scoped>
.modal-main-clas{
  position: relative;
  .modal-filter-content{
    position: relative;
    display: flex;
    .modal-filter-form{
      position: relative;
      flex: 100;
      :deep(.modal-filter-item){
        display: inline-block;
        .ivu-form-item-label{
          padding-right: 5px;
        }
        .ivu-form-item-content{
          width: 280px;
        }
      }
    }
  }
  .modal-page{
    :deep(.ivu-page) {
      text-align: right;
    }
  }
}
</style>
<style lang="less">
.halt-sales-adjust-modal {
  .ivu-modal-footer{
    padding-top: 0;
  }
}
</style>
