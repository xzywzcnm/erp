<template >
  <div
      :class="wrap" :style="wrapObj" >
    <Split
        v-model="split1" class="normalPadding" >
      <div
          slot="left" class="demo-split-pane" >
        <Collapse
            v-model="leftModel" accordion >
          <Panel name="1" >
            触发时间
            <div slot="content" >
              <div
                  class="d-flex normalPadding justify-content-start leftGrayBg leftTitle" @click="selectCode(null)" >
                全部
              </div >
              <div
                  class="d-flex normalPadding leftItem"
                  :class="pageParams.code === item.code ? 'back-blue': ''"
                  v-for="item in triggerList"
                  :key="item.code"
                  @click="selectCode(item.code)" >
                {{ item.desc }}({{ item.quantity }})
              </div >
            </div >
          </Panel >
        </Collapse >
      </div >
      <div
          slot="right" class="demo-split-pane" >
        <div class="d-flex justify-content-between align-items-center rightLaybel" >
          <div class="d-flex justify-content-start align-items-center" >
            <div class="normalPadding rightLabelTitle" >
              状态：
            </div >
            <ButtonGroup class="normalPadding" >
              <template v-for="(item, index) in enableList" >
                <Button
                    v-if="item.selected"
                    type="primary"
                    @click="enableUser(index, item.status)"
                    :key="index" >{{ item.title }} </Button >
                <Button
                    v-if="!item.selected"
                    @click="enableUser(index, item.status)"
                    :key="index" >{{ item.title }} </Button >
              </template >
            </ButtonGroup >
            <Form
                ref="searchInline" :model="pageParams" inline class="searchForm" @submit.native.prevent >
              <FormItem prop="name" >
                <Input
                    type="text" v-model.trim="pageParams.name" placeholder="清输入过规则名称" @on-enter="searchRulesName" />
              </FormItem >
              <FormItem >
                <Button @click="searchRulesName" >查询</Button >
              </FormItem >
            </Form >
          </div >
          <Button
              class="addNewRules"
              @click="addNewRules"
              type="primary"
              v-if="getPermission('autoSendMessageAutoRule_insert')" >新增规则 </Button >
        </div >
        <div class="tableContainer" >
          <keep-alive >
            <Table
                highlight-row
                border
                ref="dragable"
                :loading="tableLoading"
                :height="tableHeight"
                :columns="columns"
                :data="listData"
                @on-selection-change="getSelectValue" ></Table >
          </keep-alive >
          <div class="table-page flexBox" >
            <keep-alive >
              <Page
                  :total="total"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="curPage"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray" ></Page >
            </keep-alive >
          </div >
        </div >
      </div >
    </Split >
    <!-- 规则创建编辑 -->
    <Modal
        v-model="ruleEditModel" v-if="ruleEditStatus" width="1000" :mask-closable="false" >
      <div class="ivu-modal-confirm-head" >
        <div class="ivu-modal-confirm-head-title" >{{ ruleTitle }}</div >
      </div >
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render" >
        <rule
            :timestamp="timestamp" :ruleParmas="ruleParmas" :viewStatus="viewStatus" @closeModal="closeModal" ></rule >
      </div >
      <div slot="footer" ></div >
    </Modal >
  </div >
</template>
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import Sortable from 'sortablejs';
import rule from './automaticSendingMesRules';
import { setLocalStorage } from '@/utils/index';

const prefixCls = 'tongtool-customer-automaticSendingMessageRulesOfStation';
let sortEl;
let sortableItem;
export default {
  mixins: [Mixin],
  components: {
    rule
  },
  data () {
    let v = this;
    return {
      // 规则创建编辑
      viewStatus: 'view',
      switch1: 0,
      ruleEditModel: false,
      ruleEditStatus: false,
      ruleLoading: false,
      ruleTitle: null,
      ruleParmas: null,
      timestamp: 0,
      enableList: [
        {
          selected: true,
          status: 1,
          title: '已启用'
        }, {
          selected: false,
          status: 0,
          title: '已停用'
        }
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          title: 'No.',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.sortIndex + 1);
          }
        }, {
          title: '规则名称', // '规则名称'
          minWidth: 120,
          key: 'name'
        }, {
          title: '触发时间', // '触发时间'
          minWidth: 120,
          key: 'trigger'
        }, {
          title: '触发动作', // '触发动作'
          minWidth: 120,
          key: 'action'
        }, {
          title: '状态', // '状态'
          minWidth: 120,
          render: (h, params) => {
            return params.row.status === 0 ? h('span', {
              class: 'redColor'
            }, '停用') : h('span', {
              class: 'greenColor'
            }, '启用');
          }
        }, {
          title: '操作', // '操作'
          key: 'operate',
          width: 240,
          render: (h, params) => {
            return h('div', [
              !v.getPermission('autoSendMessageAutoRule_get') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => { // 查看
                    let v = this;
                    v.viewStatus = 'view';
                    v.ruleTitle = '查看' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    v.ruleEditStatus = true;
                    v.$nextTick(function () {
                      v.ruleEditModel = true;
                      v.ruleParmas = {
                        autoRuleId: params.row.autoRuleId,
                        name: params.row.name,
                        details: params.row || {},
                        status: params.row.status
                      };
                      v.timestamp = date;
                    });
                  }
                }
              }, '查看'), !v.getPermission('autoSendMessageAutoRule_update') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => { // 编辑
                    let v = this;
                    v.ruleTitle = '站内信自动发送规则--编辑' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    v.ruleEditStatus = true;
                    v.$nextTick(function () {
                      v.ruleEditModel = true;
                      v.viewStatus = 'edit';
                      v.ruleParmas = {
                        autoRuleId: params.row.autoRuleId,
                        name: params.row.name,
                        status: params.row.status
                      };
                      v.timestamp = date;
                    });
                  }
                }
              }, '编辑'), params.row.status === 0 ? !v.getPermission('autoSendMessageAutoRule_enable') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.setStatus(params.row.autoRuleId, 0);
                  }
                }
              }, '启用') : params.row.status === 1 ? !v.getPermission('autoSendMessageAutoRule_disable') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.setStatus(params.row.autoRuleId, 1);
                  }
                }
              }, '停用') : '', !v.getPermission('autoSendMessageAutoRule_delete') || h('Button', {
                props: {
                  size: 'small',
                  type: 'error'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.isDelModal(() => {
                      this.delRules(params.row.autoRuleId);
                    });
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      listData: [],
      tableSelectList: [],
      pageParams: {
        pageSize: 10,
        name: null,
        orderBy: 'status',
        status: 1,
        pageNum: 1, // code: null,
        ruleType: 'autoSendMessage'
      },
      split1: 0.2,
      leftModel: '1',
      pageParamsStatus: false,
      triggerList: [],
      sortDisableValue: true
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    },
    wrapObj () {
      return {
        height: this.domHeight - 100 + 'px'
      };
    },
    tableHeight () {
      return this.getTableHeight(420);
    }
  },
  watch: {
    pageParamsStatus: {
      handler (n) {
        let v = this;
        if (n) {
          v.$Loading.start();
          Promise.resolve(v.getPermission('autoSendMessageAutoRule_query') ? v.getList() : v.gotoError()).then(() => {
            v.$Loading.finish();
          });
          v.pageParamsStatus = false;
        }
      }
    },
    sortDisableValue (n, o) {
      sortableItem.option('disabled', n);
    }
  },
  methods: {
    delRules (ruleId) { // 删除规则
      let v = this;
      v.axios.delete(api.delete_autoSendMessageAutoRule + '?autoRuleIds=' + ruleId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    closeModal (value) { // 关闭规则窗口
      let v = this;
      v.ruleEditModel = false;
      if (value === 1) {
        v.pageParamsStatus = true;
      }
    },
    setStatus (autoRuleId, type) { // 启用停用规则
      let v = this;
      let url;
      if (type) {
        url = api.set_autoSendMessageAutoRuleDisable;
      } else {
        url = api.set_autoSendMessageAutoRuleEnable;
      }
      v.axios.put(url + autoRuleId).then(response => {
        if (response.data.code === 0) {
          v.pageParamsStatus = true;
          v.$Message.success('操作成功');
        } else {
          v.$Message.error('操作成功');
        }
      });
    },
    enableUser (index, status) {
      let v = this;
      if (index === 0) {
        v.pageParams.status = 1;
      } else {
        v.pageParams.status = 0;
      }
      v.enableList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    endFunc (e) { // 移动后逻辑处理
      let v = this;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      if (oldIndex === newIndex) {
        return false;
      }
      let obj = {
        currentId: v.listData[oldIndex].autoRuleId, // 规则ID
        previousId: newIndex > 0 ? v.listData[newIndex].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
      };
      if (newIndex >= 0 && newIndex !== v.listData.length - 1) {
        obj.nextId = v.listData[newIndex + 1].autoRuleId;// 因为listData并没有更新，所以newIndex取的是原来的位置
      }
      v.axios.put(api.update_MessageAutoRulePriority, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          if (newIndex === 0 || newIndex === v.listData.length - 1) {
            v.pageParamsStatus = true;
          }
          v.listData[oldIndex].sortIndex = newIndex;
          v.listData[newIndex].sortIndex = oldIndex;
          v.$Message.success('修改成功');
        }
      }).catch(() => {
        v.pageParamsStatus = true;
      });
    },
    getList () { // 查询规则列表
      let v = this;
      v.listData = [];
      v.tableLoading = true;
      v.axios.post(api.put_autoSendMessageAutoRule, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas.list;
          list.forEach((n, i) => {
            n.sortIndex = i;
          });
          v.listData = list;
          v.total = response.data.datas.total;
          v.loadingFalse();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    addNewRules () { // 添加站内信自动发送规则
      let v = this;
      v.ruleTitle = '添加站内信自动发送规则';
      const date = new Date().getTime();
      v.viewStatus = 'newItem';// 查看类型
      v.ruleParmas = {
        name: '',
        autoRuleId: null,
        status: 0
      };
      v.ruleEditStatus = true;
      v.$nextTick(function () {
        v.ruleEditModel = true;
        v.timestamp = date;
      });
    },
    searchRulesName () {
      let v = this;
      if (v.pageParams.name === '') {
        v.pageParams.name = null;
      }
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        v.tableSelectList = pos;
      });
    },
    tableSort (autoRuleId, index, oldIndex) { // 更新优先级
      let v = this;
      let obj = {
        currentId: autoRuleId, // 规则ID
        previousId: index ? v.listData[index].autoRuleId : null,
        priority: v.listData[oldIndex].priority
      };
      if (!index && v.listData.length > 1) {
        obj.nextId = v.listData[0].autoRuleId;
      }
      v.axios.put(api.update_ebayAutoRule, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.pageParamsStatus = true;
          v.$Message.success('修改成功');
        }
      });
    },
    getTriggerList () { // 获取触发时间列表
      let v = this;
      v.axios.get(api.get_triggerTimeList).then(response => {
        if (response.data.code === 0) {
          v.triggerList = response.data.datas;
          setLocalStorage('triggerList', response.data.datas);
        }
      });
    },
    selectCode (value) { // 触发时间事件
      let v = this;
      if (!value) {
        v.pageParams.code = null;
        if (v.columns.length === 8) {
          v.columns.splice(2, 1);
        }
        v.sortDisableValue = true;
      } else {
        v.pageParams.code = value;
        if (v.columns.length === 7) {
          v.insertColumn();
        }
        v.sortDisableValue = false;
      }
      v.$nextTick(function () {
        v.pageParams.pageNum = 1;
        v.pageParamsStatus = true;
      });
    },
    insertColumn () {
      let v = this;
      let column = {
        title: '优先级', // '优先级'
        minWidth: 120,
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
          if (v.listData.length > 1) {
            return h('div', arr);
          }
        }
      };
      v.columns.splice(2, 0, column);
    }
  },
  created () {
  },
  mounted () {
    let v = this;
    v.pageParamsStatus = true;
    v.getTriggerList();
    sortEl = v.$refs.dragable.$children[1].$el.children[1];
    sortableItem = Sortable.create(sortEl, {
      onEnd: v.endFunc,
      disabled: true
    });
  }
};
</script >
<style scoped >
.back-blue {
  background-color: #2D8CF0;
  color: #ffffff;
}
</style >
