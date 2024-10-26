<template>
  <div class="sizePartsManage" style="min-width: 800px;">
    <Card shadow>
      <Form ref="pageForm" class="" :model="pageParams" :label-width="100">
        <dyt-filter
          :filter-row="1"
          @operation="filterBtn"
        >
          <Form-item label="测量部位" prop="cnName">
            <dyt-input type="text" placeholder="请输入测量部位" v-model="pageParams.cnName" />
          </Form-item>
          <Form-item label="测量方式描述" prop="measurementDescription">
            <dyt-input type="text" placeholder="请输入测量方式描述" v-model="pageParams.measurementDescription" />
          </Form-item>
          <Form-item label="关联的分类尺码" prop="classificationName">
            <dyt-input type="text" placeholder="请输入关联的分类尺码" v-model="pageParams.classificationName" />
          </Form-item>
        </dyt-filter>
      </Form>
      <div class="operaBtn" style="display: flex;">
        <div style="flex: 50;">
          <Button type="primary" @click="editAndAdd('add', {})">添 加</Button>
        </div>
        <!-- <div style="flex: 50; text-align: right;">
          <Button icon="ivu-icon ivu-icon-md-sync" type="primary" @click="serach(true)" :disabled="tableLoading">刷新</Button>
        </div> -->
      </div>
      <div class="mt10">
        <Table
         :columns="columns"
         :data="tableList"
         border
         highlight-row
         :loading="tableLoading"
         :max-height="tableHeight"
        >
          <template slot-scope="{ row }" slot="action">
            <Button size="small" @click="editAndAdd('edit', row)">编辑</Button>
            <Button size="small" @click="deleteInfo(row)">删除</Button>
          </template>
        </Table>
      </div>
    </Card>
    <partsDetails :visible-module.sync="visibleEdit" :module-data="moduleData" @refreshPage="serach" />
  </div>
</template>

<script>
import api from '@/api/api.js';
import CommonMixin from '@/components/mixin/common_mixin';
import partsDetails from './partsDetails'

export default {
  name: 'sizePartsManage',
  components: { partsDetails },
  mixins: [CommonMixin],
  data () {
    return {
      api: api.sizeManageApiConfig.sizePartsManage,
      visibleEdit: false,
      moduleData: {},
      pageParams: {
        classificationName: '',
        cnName: '',
        measurementDescription: ''
      },
      tableList: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 70,
          align: 'center'
        },
        {
          title: '测量部位',
          // slot: 'sizeType',
          key: 'cnName',
          minWidth: 170
          // render (h, { row }) {
          //   return h('span', row.cnName)
          // }
        },
        {
          title: '测量方式描述',
          key: 'measurementDescription',
          width: 150,
          tooltip: true
        },
        {
          title: '英语',
          key: 'enName',
          width: 150,
          tooltip: true
        },
        {
          title: '德语',
          key: 'gerName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '法语',
          key: 'fraName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '西班牙语',
          key: 'spnName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '意大利语',
          key: 'itName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '葡萄牙语',
          key: 'porName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '波兰语',
          key: 'polName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '关联的分类尺码',
          key: 'classificationIdList',
          width: 180,
          tooltip: true,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.classificationNameList)) {
              return '';
            }
            return h('div', row.classificationNameList.join('；'))
          }
        },
        {
          title: '操作',
          fixed: 'right',
          slot: 'action',
          align: 'center',
          width: 130
        }
      ],
      tableLoading: false,
      tableHeight: 500
    }
  },
  activated () { },
  created () {
    this.tableHeight = this.getTableHeight(280);
    this.serach();
  },
  methods: {
    // 搜索栏按钮处理
    filterBtn (type) {
      // 搜索
      type == 'submit' && this.serach();
      // 重置
      type == 'refresh' && this.$refs.pageForm && this.$refs.pageForm.resetFields();
    },
    // 获取列表
    serach (type) {
      this.tableLoading = true;
      // 移除字对象中符串2端空格
      this.$common.trim(this.pageParams);
      this.axios.post(this.api.queryProductSizePartList, this.pageParams).then(({ data }) => {
        if (data.code === 0) {
          let list = data.datas || [];
          this.tableList = list;
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 编辑(新增)
    editAndAdd (type, row) {
      this.moduleData = row;
      this.$nextTick(() => {
        this.visibleEdit = true;
      })
    },
    // 删除
    deleteInfo (rows) {
      if (this.$common.isEmpty(rows.partId)) {
        this.$Message.warning('当前数据部分缺失，无法做此操作！');
        return;
      }
      this.$Modal.confirm({
        width: 500,
        title: '提示',
        content: `确定删除此数据？ 删除后不可恢复！`,
        okText: '确 定',
        cancelText: '取 消',
        onOk: () => {
          this.axios.get(this.api.delProductSizePart, {
            params: {
              partId: rows.partId
            }
          }).then(res => {
            if (res.data && res.data.code === 0) {
              this.$Message.success('删除成功！');
              this.serach();
            } else {
              this.$Message.warning((res.data ? res.data.message : '') || '删除失败！');
            }
          })
        },
        onCancel: () => {}
      })
    }
  }
}
</script>

<style>
</style>
