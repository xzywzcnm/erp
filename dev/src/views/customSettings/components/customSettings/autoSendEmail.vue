<template>
  <div class="auto-send-email-body">
    <Tabs v-model="platform">
      <TabPane v-for="(tab, tIndex) in tabList" :label="tab.label" :name="tab.name" :key="`tab-${tIndex}`" />
    </Tabs>
    <div class="auto-send-email-content">
      <Form ref="searchForm" class="search-form" :model="pageParams" :label-width="90">
        <dyt-filter ref="dytFilter" :filter-row="1">
          <Form-item label="状态" prop="enable">
            <dyt-select v-model="pageParams.enable" placeholder="请选择状态">
              <Option v-for="(item, index) in sendStatuData" :value='item.value' :label="item.label" :key="`status-${index}`" />
            </dyt-select>
          </Form-item>
          <Form-item label="模板名称" prop="name">
            <dyt-input v-model.trim="pageParams.name" placeholder="请输入模板名称" />
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="searchTable(true)" icon="md-search">查询</Button>
            <Button class="ml10" @click="resetSearch" icon="md-refresh">重置</Button>
          </div>
        </dyt-filter>
      </Form>
      <div class="operate-button">
        <div class="operate-left">
          <span v-if="permission.add">
            <Button type="primary" @click="openEditVisible({}, 'add')">添加</Button>
            <span style="margin-left: 5px; font-size: 12px;">符合订单条件的客户，系统将自动回复模板内容给客户</span>
          </span>
        </div>
        <div class="operate-right"></div>
      </div>
      <div
        class="mt15 auto-send-email-table"
        v-for="(tab, tIndex) in tabList"
        :key="`list-${tIndex}`"
        v-show="platform == tab.name"
      >
        <Table
          v-if="tableJson[tab.name]"
          highlight-row
          :loading="tableLoading"
          border
          :height="tableHeight"
          :columns="tableColumn"
          :data="(tableJson[tab.name] || [])"
        />
        <div class="mt5 auto-send-email-page">
          <Page
            v-if="pageJson[tab.name]"
            :total="pageJson[tab.name].total"
            show-total
            :page-size="pageJson[tab.name].pageSize"
            show-elevator
            :current="pageJson[tab.name].pageNum || 1"
            show-sizer
            @on-page-size-change="pageSizeChange"
            @on-change="changePageNum"
            placement="top"
            :page-size-opts="pageArray"
          />
        </div>
      </div>

    </div>
    <editOrAddSendInfo
      :modal-visible.sync="sendInfoEditVisible"
      :module-data="sendInfoEditData"
      :view-type="sendInfoType"
      :store-account-data="storeAccountList"
      @updateList="searchTable"
    />
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import editOrAddSendInfo from '@/views/customSettings/components/customSettings/components/editOrAddSendInfo.vue';

export default {
  mixins: [Mixin],
  name: 'autoSendEmail',
  components: {
    editOrAddSendInfo
  },
  data () {
    return {
      platform: 'ebay',
      tableLoading: false,
      sendInfoEditVisible: false,
      pageLoading: false,
      storeAccountList: [],
      sendInfoEditData: {
        tableRow: {},
        other: {
          platform: ''
        }
      },
      sendInfoType: 'view',
      sendStatuData: [
        { value: 0, label: '已停用' },
        { value: 1, label: '已启用' }
      ],
      tabList: [
        { label: 'Ebay', name: 'ebay' }
      ],
      tableJson: {},
      pageJson: {},
      pageConfig: {
        // 升降 升:up 降down
        // upDown: 'down',
        // orderBy: '',
        pageNum: 1,
        pageSize: 20,
        total: 0
      },
      pageParams: {
        name: '',
        enable: null
      },
      tableColumn: [
        {
          title: '序号',
          key: 'serialNumber',
          align: 'center',
          width: 100,
          render: (h, { index }) => {
            return h('div', index + 1);
          }
        },
        {
          title: '模板名称',
          key: 'name',
          align: 'center',
          minWidth: 200,
        },
        {
          title: '状态',
          key: 'serialNumber1',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            return h('span', {
              style: {
                color: row.enable == 1 ? '#19be6b' : '#f20'
              }
            }, row.enable == 1 ? '启用' : '停用')
          }
        },
        {
          title: '操作',
          width: 200,
          key: 'operate',
          fixed: 'right',
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            item.push(h('Button', {
              props: {
                type: 'info',
                size: 'small'
              },
              on: {
                click: () => {
                  this.openEditVisible(row, 'view');
                }
              }
            }, '查看'));
            if (this.permission.edit) {
              item.push(h('Button', {
                class: 'ml5',
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.openEditVisible(row, 'edit');
                  }
                }
              }, '编辑'));
            }

            if ((row.enable == 1 && this.permission.stop) || (row.enable == 0 && this.permission.enable)) {
              item.push(h('Button', {
                class: 'ml5',
                props: {
                  type: row.enable == 1 ? 'warning' : 'success',
                  size: 'small',
                  loading: row.enableLoading
                },
                on: {
                  click: () => {
                    this.enableTableRow(row);
                  }
                }
              }, row.enable == 1 ? '停用' : '启用'));
            }

            // item.push(h('Button', {
            //   class: 'ml5',
            //   props: {
            //     type: 'error',
            //     size: 'small',
            //     loading: row.deleteLoading
            //   },
            //   on: {
            //     click: () => {
            //       this.deteleTableRow(row);
            //     }
            //   }
            // }, '删除'));
            return item;
          }
        }
      ]
    };
  },
  watch: {
    platform: {
      deep: true,
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          this.initPlatformData(val);
        })
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(290);
    },
    // 权限
    permission() {
      return {
        add: this.getPermission('replyTemplate_create'),
        edit: this.getPermission('replyTemplate_edit'),
        query: this.getPermission('replyTemplate_query'),
        enable: this.getPermission('replyTemplate_enable'),
        stop: this.getPermission('replyTemplate_stop'),
      }
    },
  },
  mounted () {
  },
  methods: {
    // 初始化对应平台数据
    initPlatformData (platform) {
      this.pageLoading = true;
      let awaitRes = [
        () => {
          return this.getPlatformSaleAccounts(platform);
        }
      ];
      this.$common.promiseAll(awaitRes).finally(() => {
        this.pageLoading = false;
        if (this.$common.isEmpty(this.tableJson[platform])) {
          this.$set(this.tableJson, platform, []);
          this.$set(this.pageJson, platform, this.$common.copy(this.pageConfig));
        }
        this.$nextTick(() => {
          this.searchTable();
        });
      })
    },
    // 获取对应平台下的店铺
    getPlatformSaleAccounts (platform) {
      return new Promise((resolve) => {
        this.storeAccountList = [];
        this.axios.post(api.get_querySaleAccounts, {
          'platformIds': [platform],
          'subsystemCode': 'cs-service'
        }).then(res => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          this.storeAccountList = res.data.datas || [];
          resolve(res.data.datas || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取搜索添加
    getSearchParams () {
      let param = this.$common.copy(this.pageParams);
      param = { ...param, ...this.pageJson[this.platform], platformId: this.platform };
      delete param.total;
      return param;
    },
    // 查询数据
    searchTable (type) {
      if (!this.permission.query) {
        this.$Message.error('你暂无权限查看！');
        return;
      }
      if (this.tableLoading) return;
      if (type) {
        this.pageParams.pageNum = 1;
      }
      this.tableLoading = true;
      this.$nextTick(() => {
        let getParams = this.getSearchParams();
        this.tableJson[this.platform] = [];
        this.axios.post(api.replyTemplate.queryAll, getParams).then(res => {
          if (!res || !res.data || !res.data.datas || res.data.code != 0) return;
          this.tableJson[this.platform] = (res.data.datas.list || []).map(row => {
            return { ...row, deleteLoading: false, enableLoading: false }
          });
          this.pageJson[this.platform].total = res.data.datas.total;
        }).finally(() => {
          this.tableLoading = false;
        });
      })
    },
    // 重置查询条件
    resetSearch () {
      this.$refs.searchForm && this.$refs.searchForm.resetFields();
    },
    // 列表条数改变
    pageSizeChange (pageSize) {
      this.pageJson[this.platform].pageSize = pageSize;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 页码改变
    changePageNum (page) {
      this.pageJson[this.platform].pageNum = page;
      this.$nextTick(() => {
        this.searchTable();
      })
    },
    // 打开弹窗
    openEditVisible (row, type) {
      this.sendInfoEditData.tableRow = this.$common.copy(row);
      this.sendInfoEditData.other.platform = this.platform;
      this.sendInfoType = type;
      this.$nextTick(() => {
        this.sendInfoEditVisible = true;
      })
    },
    // 删除模板
    deteleTableRow (row) {
      if (row.deleteLoading) return;
      row.deleteLoading = true;
      this.axios.post(api.replyTemplate.delete, {
        params: {
          replyTemplateId: row.replyTemplateId
        }
      }).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$nextTick(() => {
          this.searchTable();
        })
      }).finally(() => {
        row.deleteLoading = false;
      })
    },
    // 模板启用(停用)
    enableTableRow (row) {
      if (row.enableLoading) return;
      this.$Modal.confirm({
        title: '操作确认',
        content: `你确认${row.enable == 1 ? '停用' : '启用'}：${row.name}？`,
        onOk: () => {
          row.enableLoading = true;
          this.axios.get(api.replyTemplate[row.enable == 1 ? 'stop' : 'enable'], {
            params: {
              replyTemplateId: row.replyTemplateId
            }
          }).then(res => {
            if (!res || !res.data || res.data.code != 0) return;
            this.$nextTick(() => {
              this.searchTable();
            })
          }).finally(() => {
            row.enableLoading = false;
          })
        }
      })
    }
  }
};
</script>
<style lang="less" scoped>
.auto-send-email-body{
  position: relative;
  height: 100%;
  background: #fff;
  :deep(.ivu-tabs) {
    .ivu-tabs-bar{
      margin-bottom: 0px;
    }
  }
  .auto-send-email-content{
    padding: 14px 14px 0px 14px;
    position: relative;
    .search-form{
      position: relative;
      padding: 0;
      .ivu-form-item{
        width: 25%;
        min-width: 300px;
        max-width: 500px;
      }
    }
  }
  .operate-button{
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    .operate-left{
      text-align: left;
    }
    .operate-right {
      text-align: right;
    }
  }
  .auto-send-email-page{
    text-align: right;
  }
}
</style>
