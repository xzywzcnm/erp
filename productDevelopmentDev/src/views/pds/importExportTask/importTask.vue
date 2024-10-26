<template >
  <div class="mainBox">
    <!--筛选条件-->
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form ref="searchCriteria" :model="searchCriteria" :label-width="80" class="formSearch resetIvu">
          <dyt-filter>
            <Form-item label="导入类型">
              <dyt-select v-model="searchCriteria.fileType" multiple :max-tag-count="1">
                <Option v-for="(item, index) in Object.values(exportTypes)" :key="index" :value="item.value">{{ item.label }}
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="导入状态">
              <dyt-select v-model="searchCriteria.taskStatus">
                <Option v-for="(item, index) in Object.values(typeList)" :key="index" :value="item.value">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <Form-item label="任务号">
              <dyt-input placeholder="请输入任务号" v-model.trim="searchCriteria.taskNo"></dyt-input>
            </Form-item>
            <Form-item label="导入时间">
              <DatePicker transfer placeholder="选择日期" format="yyyy-MM-dd" @on-change="selectDate"
                :value="searchCriteria.createdTime" />
              之前
            </Form-item>
            <div slot="operation">
              <Button type="primary" @click="getTablData" icon="md-search">查询</Button>
              <Button @click="resetForm" class="ml10" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
        <div class="operaBtn"></div>
        <!-- 列表-->
        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <Table highlight-row :loading="tableLoading" border :columns="column" :data="tableList" :height="tableHeight">
            </Table>
          </div>
          <page-common :pageConfig="proPage" @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common>
        </div>
      </div>
    </Card>
  </div>
</template>

<script>
import api from '@/api/api';
import pageMixin from "@/components/mixin/page_mixin";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";
export default {
  name: 'exportTask',
  mixins: [pageMixin, table_highly_adaptive],
  data() {
    return {
      searchCriteria: {
        taskType: '1',//任务类型(导入0  导入1)
        fileType: [],
        taskStatus: null,
        taskNo: null,
        createdTime: null,
        pageSize: 50,
        pageNum: 1
      },
      typeList: {
        '1': { value: 1, label: '导入中' },
        '2': { value: 2, label: '导入完成' },
        '3': { value: 3, label: '导入失败' }
      },
      exportTypes: {
        // '0': { value: 0, label: '物料管理' },
        '1': { value: 1, label: '工艺管理' },
        '2': { value: 2, label: '工序管理' },
        'secondary_process_import': { value: 'secondary_process_import', label: '二次工艺管理' }
      },
      exportData: [],
      column: [
        {
          title: '序号',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        },
        {
          title: '导入任务号',
          key: 'taskNo',
          align: 'center',
          minWidth: 120
        },
        {
          title: '导入类型',
          key: 'types',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let item = this.exportTypes[params.row.taskFileType] || {};
            return h('span', item.label || '');
          }
        },
        {
          title: '导入文件',
          key: 'taskFileName',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.taskFileUrl) || !this.permission.download) return h('div', {}, row.taskFileName);
            return h('div', {
              on: {
                style: {
                  'color': '#2d8cf0',
                  'cursor': 'pointer',
                  'text-decoration': 'underline',
                  'text-underline-position': 'under'
                },
                click: () => {
                  this.downLoad(`${window.location.origin}/pds-service/filenode/s/${row.taskFileUrl}`);
                }
              }
            }, row.taskFileName);
          }
        },
        {
          title: '导入时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('span', this.$common.getDateTime(params.row.createdTime, 'YYYY-MM-DD HH:mm:ss', 0))
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            let item = this.typeList[row.taskStatus] || {};
            if (this.$common.isEmpty(item)) return h('span', {}, '');
            if (row.taskStatus != 3) return h('span', {}, item.label);
            return h('Tooltip', {
              style: {
                textAlign: 'center',
                color: '#f00',
                cursor: 'pointer'
              },
              class: 'wayBillStatusError',
              props: {
                placement: 'top',
                transfer: true,
                content: row.reason || ''
              }
            }, [
              h('span', {}, item.label)
            ]);
          }
        },
        {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let item = this.userInfoList[params.row.createdBy] || {};
            return h('span', item.userName || params.row.createdBy);
          }
        },
        {
          title: '',
          key: '',
          align: 'center',
          minWidth: 120,
          renderHeader: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  color: '#008000'
                }
              }, '成功'),
              h('span', {
                style: {
                  margin: '0 5px'
                }
              }, '/'),
              h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '失败')
            ]);
          },
          render: (h, { row }) => {
            if (![2, 3, '2', '3'].includes(row.taskStatus)) return h('div', '');
            return h('div', [
              h('span', {
                style: {
                  color: '#008000'
                }
              }, row.successCount || 0),
              h('span', {
                style: {
                  margin: '0 5px'
                }
              },'/'),
              h('span', {
                style: {
                  color: '#FF0000'
                }
              }, row.failCount || 0)
            ]);
          }
        },
        {
          title: '备注',
          width: 200,
          align: 'center',
          resizable: true,
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#FF0000'
              }
            }, params.row.remark);
          }
        },
        {
          title: '操作',
          width: 100,
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.taskResult) || !this.permission.download) return h('div', {}, '');
            return h('div', {
              style: {
                'color': '#2d8cf0',
                'cursor': 'pointer',
                'text-decoration': 'underline',
                'text-underline-position': 'under'
              },
              on: {
                click: () => {
                  this.downLoad(`${window.location.origin}/pds-service/filenode/s/${row.taskResult}`);
                }
              }
            }, '下载');
          }
        }
      ],
      userInfoList: [],
    };
  },
  created() {
    this.getUserMesCommon();
    this.fetch(api.queryTaskList, "post");
  },
  computed: {
    // 权限
    permission () {
      return {
        query: this.getPermission('productDev_importTask_query'),
        download: this.getPermission('productDev_importTask_download')
      }
    }
  },
  methods: {
    resetForm() {
      this.reset();
    },
    getTablData () {
      if (!this.permission.query) {
        return this.$Message.error('暂无查询权限!');
      }
      if (this.tableLoading) return;
      this.search();
    },
    // 下载
    downLoad (url) {
      window.open(url);
    },
    // 获取创建人列表
    getUserMesCommon() {
      let userInfoList = this.$store.state.userInfoList;
      if (userInfoList.length) return this.userInfoList = userInfoList;
      this.$axios.get(api.get_userInfoCommon).then((response) => {
        if (response.code === 0) {
          this.$store.commit("userInfoList", response.datas || {});
          this.userInfoList = response.datas || {};
        }
      });
    },
    // 选择日期
    selectDate(val) {
      this.searchCriteria.createdTime = val;
    },
  },
};
</script>