<template>
  <div class="sizeClassManage" style="min-width: 800px;">
    <Card shadow>
      <Form ref="pageForm" class="" :model="pageParams" :label-width="100">
        <dyt-filter
          :filter-row="1"
          @operation="filterBtn"
        >
          <Form-item label="尺码分类名称" prop="classificationName">
            <dyt-input type="text" placeholder="请输入尺码分类名称" v-model="pageParams.classificationName" />
          </Form-item>
          <Form-item label="尺码项目" prop="sizePartName">
            <dyt-input type="text" placeholder="请输入尺码项目" v-model="pageParams.sizePartName" />
          </Form-item>
          <Form-item label="关联商品分类" prop="productCategoryName">
            <dyt-input type="text" placeholder="请输入关联商品分类" v-model="pageParams.productCategoryName" />
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
            <Button size="small" @click="editAndAdd('view', row)">详情</Button>
            <Button size="small" @click="deleteInfo(row)">删除</Button>
          </template>
        </Table>
      </div>
    </Card>
    <classDetails :visible-module.sync="visibleEdit" :module-data="moduleData" @refreshPage="serach" />
  </div>
</template>

<script>
import api from '@/api/api.js';
import CommonMixin from '@/components/mixin/common_mixin';
import classDetails from './classDetails'

export default {
  name: 'sizeClassManage',
  components: { classDetails },
  mixins: [CommonMixin],
  data () {
    return {
      api: api.sizeManageApiConfig.sizeClassManage,
      visibleEdit: false,
      moduleData: {},
      pageParams: {
        classificationName: '',
        productCategoryName: '',
        sizePartName: ''
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
          title: '尺码分类',
          // slot: 'sizeType',
          key: 'picture',
          minWidth: 170,
          render (h, { row }) {
            return h('span', row.classificationName)
          }
        },
        {
          title: '关联尺码项目',
          key: 'picture',
          width: 150,
          tooltip: true,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.sizePartIdList)) {
              return h('span', '');
            }
            let renderHand = []
            row.sizePartIdList.forEach(item => {
              this.productSizePartList[item] && renderHand.push(this.productSizePartList[item].cnName);
            })
            return h('span', renderHand.join('；'))
          }
        },
        {
          title: '关联的商品分类',
          key: 'picture',
          width: 150,
          tooltip: true,
          render: (h, { row }) => {
            // return h('span', row.productCategoryIdList)
            if (this.$common.isArray(row.productCategoryNameList)) {
              return h('span', row.productCategoryNameList.join('；'));
            }
            return h('span', row.productCategoryNameList);
          }
        },
        {
          title: '创建人',
          key: 'picture',
          minWidth: 150,
          tooltip: true,
          render: (h, { row }) => {
            return h('span', this.$common.getUser(row.createdBy, 'userName'))
          }
        },
        {
          title: '创建时间',
          key: 'picture',
          width: 150,
          tooltip: true,
          render: (h, { row }) => {
            return h('span', this.$common.getDateTime(row.createdTime, 'YYYY-MM-DD HH:mm:ss'))
          }
        },
        {
          title: '操作',
          fixed: 'right',
          slot: 'action',
          align: 'center',
          width: 160
        }
      ],
      tableLoading: false,
      tableHeight: 500,
      productSizePartList: {}
    }
  },
  activated () { },
  async created () {
    this.tableHeight = this.getTableHeight(270);
    this.tableLoading = true;
    try {
      await this.getProductSizePartList();
    } catch (e) {
      console.error('获取尺码项目出错:', e)
    }
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
    // 获取项目尺码
    getProductSizePartList () {
      this.axios.get(this.api.queryAllProductSizePartList).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          res.data.datas.forEach(item => {
            this.productSizePartList[item.partId] = item;
          })
        }
      })
    },
    // 获取列表
    serach (type) {
      this.tableLoading = true;
      this.$common.trim(this.pageParams);
      this.axios.post(this.api.queryProductSizeClassificationList, this.pageParams).then(({ data }) => {
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
      delete this.moduleData.viewType;
      if (type == 'view') {
        this.moduleData.viewType = type;
      }
      this.$nextTick(() => {
        this.visibleEdit = true;
      })
    },
    // 删除
    deleteInfo (rows) {
      console.log('删除的数据', rows);
      if (this.$common.isEmpty(rows.classificationId)) {
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
          this.axios.get(this.api.delProductSizeClassification, {
            params: {
              classificationId: rows.classificationId
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
