<template >
  <div >
    <!-- 查看导入任务 -->
    <Modal
        v-model="isShow" width="80%" @on-cancel="cancel" title="导入任务记录" >
      <div class="orderTable normalTop" >
        <Table
            highlight-row border :height="tableHeight" :columns="taskModalColumn" :data="taskModalData" ></Table >
      </div >
      <div slot="footer" ></div >
    </Modal >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import productMixin from '@/components/mixin/product_mixin';

export default {
  props: ['taskModal', 'type'],
  mixins: [Mixin, tableMixin, productMixin],
  data () {
    var self = this;
    return {
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      isShow: false,
      taskModalData: [], // 查看导入任务数据
      taskModalColumn: [
        {
          title: '序号',
          align: 'center',
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '导入文件',
          key: 'importPath',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              style: {
                color: '#0054A6',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  window.open(self.filenodeViewTargetUrl + params.row.importPath);
                }
              }
            }, params.row.name);
          }
        }, {
          title: '导入时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '任务状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            if (params.row.status === 2) {
              return h('span', '导入中');
            } else if (params.row.status === 3) {
              return h('span', '导入成功');
            } else if (params.row.status === 4) {
              return h('span', {
                attrs: {
                  title: params.row.failureReason
                },
                style: {
                  color: 'rgb(255, 0, 0)'
                }
              }, '导入失败');
            }
          }
        }, {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          render: (h, params) => {
            let userInfoMap = self.productCommonDictionary.userInfoMap || {};
            if (userInfoMap && userInfoMap[params.row.createdBy]) {
              return h('span', userInfoMap[params.row.createdBy].userName);
            }
          }
        }, {
          title: '成功/失败',
          key: 'tasksucOrFail',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  color: '#008000'
                }
              }, params.row.success + '/'), h('span', {
                style: {
                  color: '#ff0000'
                }
              }, params.row.failure)
            ]);
          }
        }, {
          title: '操作',
          key: 'failurePath',
          align: 'center',
          render: (h, params) => {
            if (params.row.failure > 0) {
              return h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    window.open(self.filenodeViewTargetUrl + params.row.failurePath);
                  }
                }
              }, '下载失败文件');
            }
          }
        }
      ]
    };
  },
  watch: {
    taskModal (n) {
      this.isShow = n;
      if (n) {
        this.seeTask();
      }
    }
  },
  methods: {
    cancel () {
      this.$parent.taskModal = false;
      this.$emit('cancel');
    },
    seeTask () { // 查看导入任务列表
      let v = this;
      let pos = [];
      let userIds = [];
      let productGoodsIds = [];
      if (v.type === 1) {
        v.axios.get(api.productImportTaskInfo_query + '?type=1').then(response => {
          if (response.data.code === 0) {
            response.data.datas.forEach((n, i) => {
              pos.push(n);
              userIds.push(n.createdBy);
              productGoodsIds.push(n.productGoodsId);
            });
            Promise.resolve(v.getUserInfoMap(userIds)).then(function () {
              v.taskModalData = pos;
            });
          }
        });
      } else if (v.type === 2) {
        v.axios.get(api.productImportTaskInfo_query + '?type=2').then(response => {
          if (response.data.code === 0) {
            response.data.datas.forEach((n, i) => {
              pos.push(n);
              userIds.push(n.createdBy);
              productGoodsIds.push(n.productGoodsId);
            });
            Promise.resolve(v.getUserInfoMap(userIds)).then(function () {
              v.taskModalData = pos;
            });
          }
        });
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(420);
  }
};
</script >
