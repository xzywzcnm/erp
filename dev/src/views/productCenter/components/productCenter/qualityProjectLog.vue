<template>
  <Modal v-model="modalVisible" title="查看操作日志" width="800" :mask-closable="false">
    <div>
      <Table highlight-row border :columns="tableColumns" :loading="pageLoading" :data="tableData" height="500px"></Table>
      <Page
        style="margin-top: 15px; text-align: right;"
        :total="pageTotal"
        @on-change="changeLogPage"
        show-total
        :page-size="logParams.pageSize"
        show-elevator :current="logParams.pageNum"
        show-sizer
        @on-page-size-change="changeLogPageSize"
        placement="top"
        :page-size-opts="logPageArray"
      />
    </div>
    <div slot="footer" style="text-align: right;">
      <Button @click='closableModal'>关闭</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';

export default {
  mixins: [],
  components: {},
  props: {
    logVisible: { type: Boolean, default: false },
    moduleData: { type: Object, default: () => { return {} } },
    allUserInfo: { type: Object, default: () => { return {} } },
  },
  data () {
    return {
      pageLoading: false,
      modalVisible: false,
      tableData: [],
      tableColumns: [
        {
          title: '日志内容', // 日志内容
          key: 'operateContent'
        },
        {
          title: '操作日期', // 操作日期
          key: 'createdTime',
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdTime)) return h('div', '');
            return h('div', this.$common.getDataToLocalTime(row.createdTime, 'fulltime'));
          }
        },
        {
          title: '操作人', // 操作人
          width: 150,
          key: 'createdBy',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.createdBy)) return h('span', '');
            if (this.$common.isEmpty(this.allUserInfo[row.createdBy])) return h('span', row.createdBy);
            return h('span', this.allUserInfo[row.createdBy].userName);
          }
        }
      ],
      logParams: {
        qualityProjectId: '',
        pageSize: 20,
        pageNum: 1,
      },
      pageTotal: 0,
      logPageArray: [10, 20, 50, 100],
    };
  },
  watch: {
    logVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:logVisible', val);
        this.$nextTick(() => {
          val ? this.initData() : this.modalClosed();
        })
      }
    }
  },
  created () {},
  mounted () {},
  computed: {},
  methods: {
    // 初始化数据
    initData () {
      this.logParams.qualityProjectId = this.moduleData.qualityProjectId;
      this.$nextTick(() => {
        this.getTableData();
      })
    },
    // 获取列表数据
    getTableData () {
      this.pageLoading = true;
      this.tableData = [];
      this.axios.post(api.qualityQueryOperate, this.logParams).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.tableData = res.data.datas.list || [];
        this.pageTotal = res.data.datas.total;
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    changeLogPage (page) {
      this.logParams.pageNum = page;
      this.$nextTick(() => {
        this.getTableData();
      })
    },
    changeLogPageSize (pageSize) {
      this.logParams.pageSize = pageSize;
      this.$nextTick(() => {
        this.getTableData();
      })
    },
    // 关闭
    closableModal () {
      this.modalVisible = false;
    },
    // 弹窗关闭时
    modalClosed () {
      this.tableData = [];
      this.pageLoading = false;
    }
  }
};
</script>
<style scoped lang="less">

</style>
