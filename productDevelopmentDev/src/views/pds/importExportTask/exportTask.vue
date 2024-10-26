<template >
  <div class="mainBox">
    <!--筛选条件-->
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form ref="searchCriteria" :model="searchCriteria" :label-width="80" class="formSearch resetIvu">
          <dyt-filter>
            <Form-item label="导出类型">
              <dyt-select v-model="searchCriteria.fileType" multiple :max-tag-count="1">
                <Option v-for="(item, index) in exportTypes" :key="index" :value="item.value">{{ item.label }}
                </Option>
              </dyt-select>
            </Form-item>
            <FormItem label="导出状态">
              <dyt-select v-model="searchCriteria.taskStatus">
                <Option v-for="(item, index) in typeList" :key="index" :value="item.value">{{ item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <Form-item label="任务号">
              <dyt-input placeholder="请输入任务号" v-model.trim="searchCriteria.taskNo"></dyt-input>
            </Form-item>
            <Form-item label="导出时间">
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
    let v = this;
    return {
      searchCriteria: {
        taskType: '0',//任务类型(导出0  导入1)
        fileType: [],
        taskStatus: null,
        taskNo: null,
        createdTime: null,
        pageSize: 50,
        pageNum: 1
      },
      typeList: [
        {
          value: 2,
          label: '导出完成'
        }, {
          value: 3,
          label: '导出失败'
        }, {
          value: 1,
          label: '导出中'
        }
      ],
      exportTypes: [
        {
          value: 0,
          label: '物料管理'
        },
        {
          value: 1,
          label: '工艺管理'
        },
        {
          value: 2,
          label: '工序管理'
        },
        {
          value: 'secondary_process_export',
          label: '二次工艺管理'
        },
        {
          value: 3,
          label: '打版数据'
        },
      ],
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
        }, {
          title: '导出任务号',
          key: 'taskNo',
          align: 'center',
          minWidth: 120
        }, {
          title: '导出类型',
          key: 'types',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let item = this.exportTypesObj[params.row.taskFileType] || {};
            return h('span', item.label || '');
          }
        }, {
          title: '导出时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', v.$common.getDateTime(params.row.createdTime, 'YYYY-MM-DD HH:mm:ss', 0))
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let item = v.typeListObj[params.row.taskStatus] || {};
            return h('span', {
              style: {
                color: params.row.taskStatus == 3 ? '#FF0000' : '',
              }
            }, item.label || '');
          }
        }, {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let item = v.userInfoList[params.row.createdBy] || {};
            return h('span', item.userName || params.row.createdBy);
          }
        }, {
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
        }, {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            if ([2, '2'].includes(params.row.taskStatus) && this.permission.download) {
              return h('div', {
                style: {
                  color: '#0000FF',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    let origin = window.location.origin + '/pds-service/filenode/s/';
                    // let origin = 'http://testing.lapa.com.cn/pds-service/filenode/s/';
                    window.open(origin + params.row.taskResult);
                  }
                }
              }, '下载');
            }
          }
        }
      ],
      userInfoList: [],
    };
  },
  created() {
    this.getUserMesCommon();

  },
  mounted() {
    this.permission.query && this.fetch(api.queryTaskList, "post");
  },
  computed: {
    // 权限
    permission() {
      return {
        query: this.getPermission('productDev_exportTask_query'),
        download: this.getPermission('productDev_exportTask_download')
      }
    },
    exportTypesObj() {
      let temp = {};
      this.exportTypes.forEach(k => {
        temp[k.value] = k;
      })
      return temp;
    },
    typeListObj() {
      let temp = {};
      this.typeList.forEach(k => {
        temp[k.value] = k;
      })
      return temp;
    },
  },
  methods: {
    resetForm() {
      this.reset();
    },
    getTablData() {
      if (!this.permission.query) {
        return this.$Message.error('暂无查询权限!');
      }
      if (this.tableLoading) return;
      this.search();
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