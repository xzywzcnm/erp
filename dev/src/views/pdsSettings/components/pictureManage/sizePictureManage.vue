<template>
  <div class="sizePictureManage" style="min-width: 800px;">
    <Card shadow>
      <Form ref="pageForm" class="" :model="pageParams" :label-width="100">
        <dyt-filter
          :filter-row="1"
          @operation="filterBtn"
        >
          <Form-item label="图片名称" prop="name">
            <dyt-input type="text" placeholder="请输入图片名称" v-model="pageParams.pictureName" />
          </Form-item>
          <Form-item label="关联的分类尺码" prop="sizeClass">
            <dyt-input type="text" placeholder="请输入关联的分类尺码" v-model="pageParams.classificationName" />
          </Form-item>
        </dyt-filter>
      </Form>
      <div class="operaBtn" style="display: flex;">
        <div style="flex: 50;">
          <Button type="primary" @click="editAndAdd('add', {})">新建图片</Button>
          <Button style="margin-left: 10px;" type="primary" @click="batchDeleteInfo">批量删除</Button>
          <!-- <Buttons
            type="primary"
            style="margin-left: 10px"
            trigger="click"
            @on-click="downloadHand"
          >
            <Button type="primary" @click="downloadHand(0)">
              下载
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item :name="1">下载所有结果集</Buttons-item>
            </Buttons-menu>
          </Buttons> -->
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
         @on-selection-change="selectionChange"
        >
          <template slot-scope="{ row }" slot="pictureList">
            <div
              v-for="(pic, pindex) in row.pictureUrlList"
              :key="`p-${pindex}`"
              style="padding-right: 8px;line-height: 0;display: inline-block;"
            >
              <Poptip trigger="hover" :transfer="true" placement="bottom-start">
                <img style="height: 40px; width: 40px;" :src="pic" @error="defaultPicHand(pic, $event)" />
                <template slot="content" v-if="!errImg.includes(pic)">
                  <img style="max-width:600px; max-height: 600px;" :src="pic" />
                </template>
              </Poptip>
            </div>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button size="small" @click="editAndAdd('edit', row)">编辑</Button>
            <Button size="small" @click="deleteInfo([row])">删除</Button>
          </template>
        </Table>
      </div>
    </Card>
    <pictureDetails :visible-module.sync="visibleEdit" :module-data="moduleData" @refreshPage="serach" />
  </div>
</template>

<script>
import api from '@/api/api.js';
import CommonMixin from '@/components/mixin/common_mixin';
import pictureDetails from './pictureDetails'

export default {
  name: 'sizePictureManage',
  components: { pictureDetails },
  mixins: [CommonMixin],
  data () {
    return {
      api: api.sizeManageApiConfig.pictureManage,
      visibleEdit: false,
      errImg: [],
      moduleData: {},
      pageParams: {
        classificationName: '',
        pictureName: ''
      },
      tableList: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '序号',
          type: 'index',
          width: 70,
          align: 'center'
        },
        {
          title: '图片',
          slot: 'pictureList',
          key: 'pictureId',
          minWidth: 170
          // render (h, { row }) {
          // return h('span', row.pictureUrlList)
          // }
        },
        {
          title: '图片名称',
          key: 'pictureName',
          minWidth: 150,
          tooltip: true
        },
        {
          title: '关联的分类尺码',
          key: 'pictureId',
          minWidth: 150,
          tooltip: true,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.classificationNameList)) {
              return '';
            }
            return h('div', row.classificationNameList.join('；'))
          }
        },
        {
          title: '备注',
          key: 'remarks',
          minWidth: 200,
          tooltip: true
        },
        {
          title: '创建人/最后修改人',
          key: 'createdBy',
          width: 200,
          tooltip: true,
          render: (h, { row }) => {
            return h('div', [
              h('p', `创建人: ${this.$common.getUser(row.createdBy, 'userName')}`),
              h('p', `最后修改人: ${this.$common.getUser(row.updatedBy, 'userName')}`)
            ])
          }
        },
        {
          title: '创建时间/最后修改时间',
          key: 'pictureId',
          width: 240,
          tooltip: true,
          render: (h, { row }) => {
            return h('div', [
              h('p', `创建时间: ${this.$common.getDateTime(row.createdTime, 'YYYY-MM-DD HH:mm:ss')}`),
              h('p', `最后修改时间: ${this.$common.getDateTime(row.updatedTime, 'YYYY-MM-DD HH:mm:ss')}`)
            ])
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
      tableHeight: 500,
      tableSelection: []
    }
  },
  activated () { },
  created () {
    this.tableHeight = this.getTableHeight(270);
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
    // 获取列表数据
    serach (type) {
      this.tableLoading = true;
      this.$common.trim(this.pageParams);
      this.axios.post(this.api.queryProductSizePictureList, this.pageParams).then(res => {
        if (res.data && res.data.code === 0) {
          let list = res.data.datas || [];
          list.forEach((item) => {
            if (item.pictureUrlList) {
              item.pictureUrlList.forEach((img, iIndex) => {
                if (!img.includes('http:') && !img.includes('https:') && !img.includes('/pds-service/filenode/s')) {
                  item.pictureUrlList[iIndex] = `/pds-service/filenode/s${img}`;
                }
              });
            }
          })
          this.tableList = list;
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 表格选中值改变时触发
    selectionChange (selection) {
      this.tableSelection = selection;
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
      let deleteIds = [];
      let deleteNames = [];
      rows.forEach(item => {
        deleteIds.push(item.pictureId);
        deleteNames.push(item.pictureName);
      })
      if (deleteIds.length === 0) {
        this.$Message.warning('请最少选择一条数据删除！');
        return;
      }
      this.$Modal.confirm({
        width: 500,
        title: '提示',
        content: `确定删除 ${deleteNames.join('、')}？ 删除后不可恢复！`,
        okText: '确 定',
        cancelText: '取 消',
        onOk: () => {
          this.axios.post(this.api.delProductSizePicture, deleteIds).then(res => {
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
    },
    batchDeleteInfo () {
      this.deleteInfo(this.tableSelection)
    },
    // 下载
    downloadHand (type) {
      console.log(type, this.tableSelection)
    },
    defaultPicHand (pic, e) {
      !this.errImg.includes('pic') && this.errImg.push(pic);
      e.target.src = './static/images/placeholder.jpg';
    }
  }
}
</script>

<style>
</style>
