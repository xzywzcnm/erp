<template>
  <div class="mainBox">
    <Card shadow>
      <div class="operaBtn" style="display: flex; max-width: 800px;">
        <div style="flex: 50;">
          <Button
            type="primary"
            class="mr10"
            @click="add"
            v-if="getPermission('pdsSettings_sizeManage_add')"
          >添加</Button>
          <Button
            type="primary"
            @click="exportExcel"
            :loading="exportLoading"
            v-if="getPermission('pdsSettings_sizeManage_export')"
          >导出</Button>
        </div>
        <div style="flex: 50; text-align: right;">
          <Button
            icon="ivu-icon ivu-icon-md-sync"
            type="primary"
            @click="getList"
            :disabled="tableLoading"
          >刷新</Button>
        </div>
      </div>
      <div class="mt10" style="max-width: 800px;">
        <Table :columns="columns" :data="tableList" border :loading="tableLoading" :max-height="tableHeight" highlight-row></Table>
      </div>
      <size-manage :modelVisible.sync="modelVisible" @fetch="getList"></size-manage>
    </Card>
  </div>
</template>

<script>
import api from '@/api/api.js';
import sizeManage from './sizeManage/add';
import { downFile } from '@/utils/comConfig.js';
import CommonMixin from '@/components/mixin/common_mixin';
export default {
  name: 'SizeManage',
  mixins: [CommonMixin],
  components: { sizeManage },
  data () {
    return {
      tableList: [],
      columns: [
        {
          title: '编码',
          key: 'sizeCode',
          'minWidth': 100
        },
        {
          title: '尺码',
          key: 'size',
          'minWidth': 100
        }
      ],
      tableLoading: false,
      modelVisible: false,
      exportLoading: false,
      tableHeight: 500
    }
  },
  activated () {},
  created () {
    this.tableHeight = this.getTableHeight(230);
    this.getList();
  },
  methods: {
    // 获取列表
    getList () {
      this.tableLoading = true;
      this.axios
        .get(api.queryProductSizeList)
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.tableList = data.datas || [];
        }).finally(() => {
          this.tableLoading = false;
        })
    },
    // 添加
    add () {
      this.modelVisible = true;
    },
    // 导出
    exportExcel () {
      this.exportLoading = true;
      this.axios({
        method: 'post',
        url: api.exportProductSizeList,
        responseType: 'blob',
        timeout: 600000
      }).then(({ resData, filename }) => {
        this.$Message.success('正在导出...');
        downFile(resData, filename)
      }).finally(() => {
        this.exportLoading = false;
      })
    }
  }
}
</script>
