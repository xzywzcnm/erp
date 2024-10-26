<template >
  <!-- 订单的导入查看暂时木有，后面会出需求，页面先放着 -->
  <div class="importTask" >
    <!--筛选条件-->
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" class="normalTop" :model="pageParams" :label-width="70" label-position="right" >
            <dyt-filter>
                <Form-item label="导入类型" >
                  <dyt-select v-model="pageParams.types" multiple :max-tag-count="1">
                    <Option v-for="(item,index) in importTypes" :key="index" :value="item.value" >{{ item.label }}</Option>
                  </dyt-select >
                </Form-item >
                <FormItem label="导入状态" class="notplatformParamsSelect">
                  <Button-group >
                    <template v-for="(item, index) in typeList" >
                      <Button
                          v-if="item.selected" type="primary" @click="enbaleType(index, item.status)" :key="index" >
                        {{ item.title }} </Button >
                      <Button
                          v-if="!item.selected" @click="enbaleType(index, item.status)" :key="index" >
                        {{ item.title }} </Button >
                    </template >
                  </Button-group >
                </FormItem >
                <Form-item label="任务号" >
                  <dyt-input placeholder="请输入任务号" v-model.trim="pageParams.operateCode" ></dyt-input >
                </Form-item >
                <Form-item label="导入时间" >
                  <DatePicker
                    transfer
                    type="date"
                    v-model="pageParams.createdTime"
                    @on-change="selectDate"
                    @on-clear="resetDate"
                    placeholder="选择日期"
                    style="width: calc(100% - 40px);"
                  ></DatePicker >
                  <span style="marginLeft:10px;" >之前</span >
                </Form-item >
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
          </Form >
        </div >
      </div >
    </div >
    <!-- 列表 -->
    <div class="orderTable normalTop" >
      <Table
          highlight-row
          :loading="tableLoading"
          border
          :height="tableHeight"
          :columns="importColumn"
          :data="importData" ></Table >
      <div class="table-page" >
        <div class="table-page-right" >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              :current="pageParams.pageNum"
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </div >
      </div >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      filenodeViewTargetUrl: this.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsStatus: false, // 是否重新加载列表数据
      total: 0, // 总记录数
      userInfoMap: [], // 操作人
      pageParams: {
        types: [],
        status: null,
        operateCode: null,
        createdTime: null,
        pageSize: 10,
        pageNum: 1
      },
      typeList: [ // 2:操作中 3:操作完成 4：操作失败(格式校验不通过或其他运行时异常)
        {
          selected: true,
          status: '',
          title: '全部'
        }, {
          selected: false,
          status: 3,
          title: '导入完成'
        }, {
          selected: false,
          status: 4,
          title: '导入失败'
        }, {
          selected: false,
          status: 2,
          title: '导入中'
        }
      ],
      importData: [],
      importColumn: [
        {
          title: '序号',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '导入任务号',
          key: 'operateCode',
          align: 'center',
          minWidth: 120
        }, {
          title: '导入类型',
          key: 'types',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.type === 'productImport') {
              return h('span', '待定');
            } else if (params.row.type === 'productSkuMappingImport') {
              return h('span', '待定');
            } else if (params.row.type === 'handOrderImport') {
              return h('span', '手工单导入');
            }
          }
        }, {
          title: '导入文件',
          key: 'originPath',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#0000FF',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  window.open(this.filenodeViewTargetUrl + params.row.originPath);
                }
              }
            }, params.row.originName);
          }
        }, {
          title: '导入时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.status === 2) {
              return h('span', '导入中');
            } else if (params.row.status === 3) {
              return h('span', '导入完成');
            } else if (params.row.status === 4) {
              return h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '导入失败');
            }
          }
        }, {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.userInfoMap) {
              return h('span', this.userInfoMap[params.row.createdBy].userName);
            }
          }
        }, {
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
              }, '成功'), h('span', '/'), h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '失败')
            ]);
          },
          render: (h, params) => {
            if (params.row.status !== 2 && params.row.status !== 4) {
              return h('div', [
                h('span', {
                  style: {
                    color: '#008000'
                  }
                }, params.row.success), h('span', '/'), h('span', {
                  style: {
                    color: '#FF0000'
                  }
                }, params.row.failure)
              ]);
            }
          }
        }, {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            if (params.row.status !== 2 && params.row.status !== 4 && params.row.failure) {
              return h('div', {
                style: {
                  color: '#0000FF',
                  cursor: 'pointer'
                },
                on: {
                  click: () => {
                    window.open(this.filenodeViewTargetUrl + params.row.targetPath);
                  }
                }
              }, '下载文件');
            }
          }
        }
      ]
    };
  },
  methods: {
    enbaleType (index, status) { // 选择状态
      let v = this;
      if (index === 0) {
        v.pageParams.status = null;
      } else if (index === 1) {
        v.pageParams.status = '3';
      } else if (index === 2) {
        v.pageParams.status = '4';
      } else {
        v.pageParams.status = '2';
      }
      v.typeList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectDate (val) { // 选择日期
      let v = this;
      if (!val) return;
      v.pageParams.createdTime = v.getUniversalTime(new Date(val).getTime(), 'fulltime');
    },
    resetDate () { // 重置日期
      let v = this;
      v.pageParams.createdTime = null;
    },
    search () { // 查询
      let v = this;
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.types = [];
      // v.pageParams.status = null;
      v.enbaleType(0, '');
      v.pageParams.operateCode = null;
      v.pageParams.createdTime = null;
    },
    getList () { // 获取列表数据
      let v = this;
      let userIds = [];
      let types = [];
      if (v.pageParams.types.length === 0) {
        types = v.importTypes.map(i => i.value);
      } else {
        types = v.pageParams.types;
      }
      let obj = {
        types: types,
        status: v.pageParams.status,
        operateCode: v.pageParams.operateCode,
        createdTime: v.pageParams.createdTime,
        pageSize: v.pageParams.pageSize,
        pageNum: v.pageParams.pageNum,
        platformIds: [this.inGroup]
      };
      v.loadingTrue();
      v.axios.post(api.query_taskData, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach((n, i) => {
              userIds.push(n.updatedBy);
            });
          }
          Promise.resolve(v.getUserInfoMap(userIds)).then(result => {
            v.loadingFalse();
            v.importData = data.list;
            v.total = data.total;
          });
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    getUserInfoMap (userIds) {
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userInfoMap = response.data.datas;
              resolve(true);
            }
          }).finally(() => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(245);
    this.getList();
  },
  watch: {
    pageParamsStatus: function (n, o) { // 监听重置列表数据
      let v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getList()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  }
};
</script >
