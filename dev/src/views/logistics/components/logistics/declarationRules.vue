<template>
  <div class="normalPadding">
    <detailFrom ref="detailFrom" v-if="getPermission('packageRuleDetails_default')"></detailFrom>
    <div class="mt10 mb10 operate">
      特殊申报规则
      <Button size="small" class="ml20" @click="addRule" v-if="getPermission('packageAutoRule_insert')">新增 </Button>
      <span class="ml20">状态：</span>
      <dyt-select v-model="pageParams.status" style="width:100px;" @on-change="getNewList(pageParams.status)">
          <Option v-for="(item,index) in statusList"  :key="index" :value="item.value">{{ item.label }}</Option>
      </dyt-select>
    </div>
    <dTable ref="dragable" highlight-row border :columns="columns" :loading="tableLoading" :data="listData"></dTable>
    <div class="table-page flexBox">
      <keep-alive>
        <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
      </keep-alive>
    </div>
    <!-- 规则创建编辑 -->
    <Modal v-model="ruleEditModel" :title="ruleTitle" :mask-closable="false" :loading="ruleLoading" class-name="modal-order-smart-rule">
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render" v-if="ruleEditModel">
        <rules :timestamp="timestamp" :ruleParmas="ruleParmas" type="audit" @closeModal="closeModal"></rules>
      </div>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import detailFrom from './delarationdetail';
import rules from './rule';
import Sortable from 'sortablejs';

export default {
  name: 'declarationRules',
  mixins: [Mixin],
  components: {
    detailFrom,
    rules
  },
  data () {
    let v = this;
    return {
      totalPage: 0,
      total: 0,
      curPage: 1,
      ruleTitle: '包裹自动规则',
      ruleParmas: {
        type: 2, // 0 warehose edit 1 audit create 2 audit edit
        name: '', // 规则名
        autoRuleId: null,
        status: null,
        editType: 'add',
        businessId: ''
      },
      ruleEditModel: false,
      ruleLoading: false,
      timestamp: 0,
      columns: [{
        title: 'No.',
        width: 60,
        align: 'center',
        render: (h, params) => {
          return h('span', params.row.sortIndex + 1);
        }
      }, {
        title: '优先级',
        width: 200,
        align: 'center',
        render: (h, params) => {
          let arr = [];
          arr = [
            h('span', {
              attrs: {
                title: '置底'
              },
              class: 'icon iconfont icon-setBottom-copy normalFontSizeTwoSize cursor greenColor',
              on: {
                click: () => {
                  v.tableSort(params.row.autoRuleId, v.listData.length - 1, params.index);
                }
              }
            }), h('span', {
              attrs: {
                title: '置顶'
              },
              class: 'icon iconfont icon-zhiding1 normalFontSizeTwoSize cursor blueColor',
              on: {
                click: () => {
                  v.tableSort(params.row.autoRuleId, 0, params.index);
                }
              }
            }), h('Icon', {
              props: {
                type: 'md-move',
                size: 18
              },
              attrs: {
                title: 'up'
              },
              style: {
                marginLeft: '5px',
                position: 'relative',
                top: '-2px'
              },
              class: 'cursor-move grayColor'
            })

          ];
          if (params.index === 0) {
            arr.splice(1, 1);
          } else if (params.index === v.listData.length - 1) {
            arr.splice(0, 1);
          }
          if (v.listData.length > 1 && v.getPermission('packageAutoRule_updatePriority')) {
            return h('div', arr);
          }
        }
      }, {
        title: '规则名称',
        minWidth: 100,
        align: 'center',
        key: 'name'
      }, {
        title: '状态',
        key: 'status',
        width: 100,
        align: 'center',
        render: (h, params) => {
          return params.row.status === 0 ? h('span', {
            class: 'redColor'
          }, '停用') : h('span', {
            class: 'greenColor'
          }, '启用');
        }
      }, {
        title: '创建人',
        minWidth: 120,
        maxWidth: 200,
        align: 'center',
        key: 'createdBy',
        render: (h, params) => {
          return h('span', v.getUserName(params.row.createdBy));
        }
      },
      {
        title: '最后更新人',
        minWidth: 120,
        maxWidth: 200,
        align: 'center',
        key: 'updatedBy',
        render: (h, params) => {
          return h('span', v.getUserName(params.row.updatedBy));
        }
      }, {
        title: '添加时间',
        minWidth: 200,
        maxWidth: 240,
        align: 'center',
        key: 'createdTime',
        render: (h, params) => {
          return h('span', v.getDataToLocalTime(params.row.createdTime, 'fulltime'));// return last update time
        }
      },
      {
        title: '最后更新时间',
        minWidth: 200,
        maxWidth: 240,
        align: 'center',
        key: 'updatedTime',
        render: (h, params) => {
          return h('span', v.getDataToLocalTime(params.row.updatedTime, 'fulltime'));// return last update time
        }
      }, {
        title: '操作',
        key: 'operate',
        align: 'center',
        minWidth: 140,
        maxWidth: 240,
        render: (h, params) => {
          return h('div', [
            h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px',
                display: (() => {
                  return v.getPermission('packageAutoRule_get') ? 'line-block' : 'none';
                })()
              },
              on: {
                click: () => {
                  v.ruleTitle = '订单自动规则--编辑' + '(' + params.row.name + ')';
                  const date = new Date().getTime();
                  v.ruleEditStatus = true;
                  v.$nextTick(function () {
                    v.ruleEditModel = true;
                    v.ruleParmas = {
                      editType: 'edit',
                      type: 0, // 0 warehose edit 1 audit create 2 audit edit
                      autoRuleId: params.row.autoRuleId,
                      warehouseId: params.row.warehouseId,
                      name: params.row.name,
                      status: params.row.status,
                      details: params.row || {},
                      businessId: params.row.businessId
                    };
                    v.timestamp = date;
                  });
                }
              }
            }, '编辑'), params.row.status === 0 ? h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px',
                display: (() => {
                  return v.getPermission('packageAutoRule_enable') ? 'line-block' : 'none';
                })()
              },
              on: {
                click: () => {
                  v.setStatus(params.row, 0);
                }
              }
            }, '启用') : params.row.status === 1 ? h('Button', {
              props: {
                size: 'small'
              },
              style: {
                marginRight: '5px',
                display: (() => {
                  return v.getPermission('packageAutoRule_disable') ? 'line-block' : 'none';
                })()
              },
              on: {
                click: () => {
                  v.setStatus(params.row, 1);
                }
              }
            }, '停用') : ''
          ]);
        }
      }
      ],
      listData: [],
      pageParams: {
        'status': 1, // 状态 1启用 0停用 全部-1 ,
        'pageNum': 1,
        'pageSize': 10
      },
      statusList: [
        { label: '停用', value: 0 },
        { label: '启用', value: 1 },
      ]
    };
  },
  created () {
    this.search();
  },
  mounted () {
    this.$refs.detailFrom.getPackageRuleDetails();
    let v = this;
    let el = this.$refs.dragable.$children[1].$el.children[1];
    Sortable.create(el, {
      onEnd: v.endFunc
    });
  },
  props: {},
  watch: {},
  methods: {
    setStatus (row, type) { // 启用停用规则
      const autoRuleId = row.autoRuleId;
      let url = api.enable_packageDeclareAutoRule;
      if (type) {
        url = api.disable_packageDeclareAutoRule;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${type == 1 ? '停' : '启'}用规则：<span style="color: #f20;">${row.name}</span>`,
        onOk: () => {
          this.axios.put(url + autoRuleId).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.pageParamsStatus = true;
              this.$Message.success('操作成功');
              this.getList();
            }
          });
        }
      });
    },
    closeModal () {
      this.getList();
      this.$refs.detailFrom.getPackageRuleDetails();
      this.$nextTick(() => {
        this.ruleEditModel = false;
      })
    },
    addRule () {
      this.ruleParmas.editType = 'add';
      this.ruleParmas.autoRuleId = null;
      this.ruleParmas.name = '';
      this.timestamp = new Date().getTime();
      this.ruleParmas.businessId = null;
      this.$nextTick(() => {
        this.ruleEditModel = true;
      })
    },
    tableSort (autoRuleId, index, oldIndex) {
      let v = this;
      let obj = {
        currentId: autoRuleId, // 规则ID
        previousId: index ? v.listData[index].autoRuleId : null,
        businessId: v.listData[oldIndex].businessId
      };
      if (!index && v.listData.length > 1) {
        obj.nextId = v.listData[0].autoRuleId;
      }
      v.axios.put(api.updatePriority_packageDeclareAutoRuleQuery, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.pageParamsStatus = true;
          v.getList();
          v.$Message.success('修改成功');
        }
      });
    },
    changePage (page) {
      var v = this;
      v.pageParams.pageNum = page;
      v.getList();
    }, // 切换每页条数
    changePageSize (size) {
      var v = this;
      v.pageParams.pageSize = size;
      v.getList();
    },
    search () {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    getList () {
      let v = this;
      if (!v.getPermission('packageAutoRule_query')) {
        return;
      }
      v.listData = [];
      v.axios.post(api.get_packageDeclareAutoRuleQuery, v.pageParams).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas.list;
          v.total = response.data.datas.total;
          list.forEach((n, i) => {
            n.sortIndex = i;
          });
          v.listData = list;
          v.loadingFalse();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    endFunc (e) { // 移动后逻辑处理
      let v = this;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      let obj;
      if (oldIndex === newIndex) {
        return false;
      }
      if (oldIndex > newIndex) {
        obj = {
          currentId: v.listData[oldIndex].autoRuleId, // 规则ID
          businessId: v.listData[oldIndex].businessId,
          previousId: newIndex > 0 ? v.listData[newIndex - 1].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== v.listData.length - 1) {
          obj.nextId = v.listData[newIndex + 1].autoRuleId;// 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      } else {
        obj = {
          currentId: v.listData[oldIndex].autoRuleId, // 规则ID
          businessId: v.listData[oldIndex].businessId,
          previousId: newIndex > 0 ? v.listData[newIndex].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== v.listData.length - 1) {
          obj.nextId = v.listData[newIndex + 1].autoRuleId;// 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      }
      v.axios.put(api.updatePriority_packageDeclareAutoRuleQuery, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          if (newIndex === 0 || newIndex === v.listData.length - 1) {
            v.pageParamsStatus = true;
          }
          v.listData[oldIndex].sortIndex = newIndex;
          v.listData[newIndex].sortIndex = oldIndex;
          v.getList();
          v.$Message.success('修改成功');
        }
      }).catch(() => {
        v.pageParamsStatus = true;
      });
    },
    getNewList(val) {
      if (!val && val !== 0) this.pageParams.status = -1
      this.search()
    }
  }
};
</script>

<style scoped>
.operate {
  background-color: #fff;
  width: 100%;
  padding: 10px;
}
</style>
<style lang="less">
.modal-order-smart-rule{
  .ivu-modal{
    width: 80% !important;
    min-width: 1000px;
    max-width: 1800px;
  }
  .ivu-modal-body{
    max-height: calc(100vh - 200px);
  }
  .ivu-modal-footer{
    height: 0;
    padding: 0;
  }
}
</style>
