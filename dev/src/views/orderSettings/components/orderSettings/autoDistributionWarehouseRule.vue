<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form ref="pageParmas" style="padding-top: 15px;" :model="pageParams" label-position="right" :label-width="70" @submit.native.prevent>
            <dyt-filter :filter-row="1">
              <FormItem label="状态" :label-width="40">
                <dyt-select ref="productGoodsTagsSelect" v-model="pageParams.status">
                  <Option v-for="(item,index) in enableList" :key="index" :value="item.status">{{ item.title }}</Option>
                </dyt-select>
              </FormItem>
              <Form-item label="规则名称" prop="name" @submit.native.prevent>
                <dyt-input placeholder="输入规则名称查找" v-model.trim="pageParams.name" v-if="getPermission('warehouseAutoRule_query')" style="width: 200px" @on-enter="search"></dyt-input>
              </Form-item>
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="normalLMargin">
      <!-- <span>自动分配有货仓库：</span>
      <i-switch v-model="switch1" @on-change="changeSwitch" :true-value="1" :false-value="0"></i-switch> -->
      <Button type="primary" @click="addRule" v-if="getPermission('warehouseAutoRule_insert')" icon="md-add">添加新规则</Button>
      <Button type="error" @click="delRule" v-if="getPermission('warehouseAutoRule_delete')" class="ml10">删除</Button>
    </div>
    <!-- 列表数据模块 -->
    <div class="commonFilter normalTop">
      <Table
        ref="dragable"
        highlight-row
        border
        :columns="columns"
        :loading="tableLoading"
        :data="listData"
        :height="tableHeight"
        @on-selection-change="selectData"
      />
    </div>
    <!-- 规则创建编辑 -->
    <Modal
      v-model="ruleEditModel"
      v-if="ruleEditStatus"
      :mask-closable="false"
      :loading="ruleLoading"
      class-name="modal-order-smart-rule"
    >
      <div class="ivu-modal-confirm-head">
        <div class="ivu-modal-confirm-head-title">{{ ruleTitle }}</div>
      </div>
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
        <rule
          :timestamp="timestamp"
          :ruleType="'autoCompartment'"
          :ruleParmas="ruleParmas"
          :looKsettings="looKsettings"
          :type="'warehose'"
          @closeModal="closeModal"
        />
      </div>
      <div slot="footer"></div>
    </Modal>
    <!-- 优先级调整 -->
    <ruleSortModal
      @modalConfirm="tableRowSort"
      :model-data="ruleSortData"
      :model-visible.sync="chonseSortVisible"
    />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import orderSettingsMixin from './mixin/orderSettingsMixin'; // 设置中心-订单mixin文件
import Sortable from 'sortablejs';
import rule from './components/smartRule';
import ruleSortModal from '@/views/orderSettings/components/orderSettings/components/ruleSortModal';

export default {
  mixins: [Mixin, orderSettingsMixin],
  components: {
    rule,
    ruleSortModal
  },
  data () {
    var self = this;
    return {
      tableHeight: 500,
      // 规则创建编辑
      switch1: 0,
      ruleEditModel: false,
      ruleEditStatus: false,
      ruleLoading: false,
      ruleTitle: null,
      ruleParmas: null,
      timestamp: 0,
      ruleSortData: {
        rowIndex: null,
        tableList: [],
        row: {}
      },
      chonseSortVisible: false,
      looKsettings: false, // End
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'No.',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.sortIndex + 1);
          }
        }, {
          title: '优先级',
          width: 120,
          align: 'center',
          render: (h, params) => {
            if (!self.getPermission('warehouseAutoRule_updatePriority') || self.listData.length == 1) {
              return h('div', {}, '');
            }
            let arr = [];
            if (params.index == 0 || params.index != self.listData.length - 1) {
              arr.push(h('span', {
                attrs: {
                  title: '置底'
                },
                class: 'icon iconfont icon-setBottom-copy normalFontSizeTwoSize cursor greenColor',
                on: {
                  click: () => {
                    self.tableRowSort({ newIndex: self.listData.length - 1, oldIndex: params.index });
                  }
                }
              }));
            }
            if (params.index != 0 || params.index == self.listData.length - 1) {
              arr.push(h('span', {
                attrs: {
                  title: '置顶'
                },
                class: 'icon iconfont icon-zhiding1 normalFontSizeTwoSize cursor blueColor',
                on: {
                  click: () => {
                    self.tableRowSort({ newIndex: 0, oldIndex: params.index });
                  }
                }
              }));
            }
            arr.push(h('Icon', {
              props: {
                type: 'md-move',
                size: 18
              },
              attrs: {
                title: '移动'
              },
              style: {
                marginLeft: '5px',
                position: 'relative',
                top: '-2px'
              },
              class: 'cursor-move grayColor'
            }));
            arr.push(h('Icon', {
              attrs: {
                title: '编辑排序'
              },
              style: {
                marginLeft: '5px',
                position: 'relative'
              },
              class: 'cursor normalFontSizeTwoSize lapa lapa-edit',
              on: {
                click: () => {
                  this.ruleSortData = {
                    rowIndex: params.index,
                    row: this.$common.copy(params.row),
                    tableList: this.$common.copy(self.listData),
                  }
                  this.$nextTick(() => {
                    this.chonseSortVisible = true;
                  })
                }
              }
            }));
            return h('div', {}, arr);
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
          align: 'center',
          minWidth: 120,
          maxWidth: 200,
          key: 'createdBy',
          render: (h, params) => {
            return h('span', self.getUserName(params.row.createdBy));
          }
        }, {
          title: '最后更新人',
          align: 'center',
          minWidth: 120,
          maxWidth: 200,
          key: 'updatedBy',
          render: (h, params) => {
            return h('span', self.getUserName(params.row.updatedBy));
          }
        }, {
          title: '添加时间',
          align: 'center',
          minWidth: 200,
          maxWidth: 240,
          key: 'createdTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.createdTime, 'fulltime'));// return last update time
          }
        },
        {
          title: '最后更新时间',
          align: 'center',
          minWidth: 200,
          maxWidth: 240,
          key: 'updatedTime',
          render: (h, params) => {
            return h('span', self.getDataToLocalTime(params.row.updatedTime, 'fulltime'));// return last update time
          }
        }, {
          title: '操作',
          align: 'center',
          key: 'operate',
          width: 260,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('warehouseAutoRule_get') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '订单自动规则--查看' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = true;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        editType: 'edit',
                        type: 0, // 0 warehose edit 1 audit create 2 audit edit
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: params.row.name,
                        status: params.row.status,
                        details: params.row || {}
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '查看'), h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('warehouseAutoRule_update') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.ruleTitle = '订单自动规则--编辑' + '(' + params.row.name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;
                      self.ruleParmas = {
                        editType: 'edit',
                        type: 0, // 0 warehose edit 1 audit create 2 audit edit
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: params.row.name,
                        status: params.row.status
                      };
                      self.timestamp = date;
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
                    return self.getPermission('warehouseAutoRule_enable') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 0);
                  }
                }
              }, '启用') : params.row.status === 1 ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('warehouseAutoRule_disable') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.setStatus(params.row, 1);
                  }
                }
              }, '停用') : '', h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px',
                  display: (() => {
                    return self.getPermission('warehouseAutoRule_copy') ? 'line-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    let name = params.row.name;
                    name = name + '(0)';
                    self.ruleTitle = '订单自动规则--创建' + '(' + name + ')';
                    const date = new Date().getTime();
                    self.ruleEditStatus = true;
                    self.looKsettings = false;
                    self.$nextTick(function () {
                      self.ruleEditModel = true;

                      self.ruleParmas = {
                        editType: 'copy',
                        type: 0, // 0 warehose edit 1 audit create 2 audit edit
                        autoRuleId: params.row.autoRuleId,
                        warehouseId: params.row.warehouseId,
                        name: name,
                        status: 0
                      };
                      self.timestamp = date;
                    });
                  }
                }
              }, '复制'), h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  'click' () {
                    self.delRuleFn([params.row.autoRuleId]);
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      loading: true,
      total: 0,
      listData: [],
      buttonGroupModel: [
        {
          type: 'tokenEffectiveDate',
          selected: true,
          status: true, // true up false down
          title: '按状态'
        }, {
          type: 'accountCode',
          selected: false,
          status: true, // true up false down
          title: '按仓库'
        }
      ],
      pageParams: {
        name: null,
        status: -1
      },
      enableList: [
        {
          selected: true,
          status: -1,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '启用'
        }, {
          selected: false,
          status: 0,
          title: '停用'
        }
      ],
      selectTabData: [] // 表格选择数据
    };
  },
  created () {
    this.tableHeight = this.getTableHeight(230);
  },
  mounted () {
    this.pageParamsStatus = true;
    let el = this.$refs.dragable.$children[1].$el.children[1];
    if (this.getPermission('warehouseAutoRule_updatePriority')) {
      Sortable.create(el, {
        handle: '.grayColor',
        onEnd: this.tableRowSort
      });
    }
    // this.getAssignInventory();
  },
  methods: {
    // 移动后逻辑处理
    tableRowSort (params) {
      if (this.$common.isEmpty(params)) return false;
      const oldIndex = params.oldIndex;
      const newIndex = params.newIndex;
      if (this.$common.isEmpty(oldIndex) || this.$common.isEmpty(newIndex) || oldIndex === newIndex) {
        this.$common.isFunction(params.callBack) && params.callBack(false);
        return false;
      }
      let obj = {};
      let newList = this.$common.copy(this.listData);
      if (oldIndex > newIndex) {
        obj = {
          currentId: newList[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? newList[newIndex - 1].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== newList.length - 1) {
          obj.nextId = newList[newIndex].autoRuleId;// 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      } else {
        obj = {
          currentId: newList[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? newList[newIndex].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== newList.length - 1) {
          obj.nextId = newList[newIndex + 1].autoRuleId;// 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      }
      this.saveSortInfo(obj).then((val) => {
        this.listData = [];
        this.$common.isFunction(params.callBack) && params.callBack(val);
        if (val) {
          newList[oldIndex].sortIndex = newIndex;
          newList.forEach((row, index) => {
            if (oldIndex > newIndex) {
              if (newIndex <= index && oldIndex > index) {
                row.sortIndex = index + 1;
              }
            } else if (oldIndex < index && newIndex >= index) {
              row.sortIndex = index - 1;
            }
          });
          newList.sort((a, b) => { return a.sortIndex - b.sortIndex });
          this.$nextTick(() => {
            this.listData = newList;
          });
          return;
        }
        this.$nextTick(() => {
          this.listData = newList;
        });
      });
    },
    // 排序保存
    saveSortInfo (obj) {
      return new Promise((resolve) => {
        this.axios.put(api.update_warehouseRulePriority, JSON.stringify(obj)).then(response => {
          if (!response || !response.data || response.data.code != 0) return resolve(false);
          this.$Message.success('修改成功');
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      })
    },
    getList () {
      let v = this;
      if (!v.getPermission('warehouseAutoRule_query')) return;
      v.listData = [];
      v.loadingTrue();
      v.axios.post(api.get_automatickWarehouseRuleList, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let list = response.data.datas;
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
    search () {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
    },
    reset () {
      let v = this;
      v.$refs['pageParmas'].resetFields();
      v.pageParams.status = -1;
    },
    closeModal (value) {
      let v = this;
      v.ruleEditModel = false;
      if (value === 1) {
        v.pageParamsStatus = true;
      }
    },
    // 查询有货仓库状态
    getAssignInventory () {
      return new Promise((resolve) => {
        this.axios.get(api.get_autoAssignInventory).then(response => {
          if (response.data.code === 0) {
            this.switch1 = Number(response.data.datas);
          }
          resolve(response.data);
        }).catch(() => {
          resolve({});
        });
      })
    },
    setStatus (row, type) {
      const autoRuleId = row.autoRuleId;
      let url = api.set_warehouseRuleEnabled;
      if (type) {
        url = api.set_warehouseRuleDisabled;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${type == 1 ? '停' : '启'}用规则：<span style="color: #f20;">${row.name}</span>`,
        onOk: () => {
          this.axios.put(url + autoRuleId).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.pageParamsStatus = true;
              this.$Message.success('操作成功');
            }
          });
        }
      });
    },
    changeSwitch (val) {
      let v = this;
      v.axios.put(api.set_autoAssignInventory + '?auto=' + val).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('修改成功');
        } else {
          v.$Message.error('修改失败');
          v.switch1 = val === 1 ? 0 : 1;
        }
      });
    },
    selectData (val) { // 表格选择数据
      let v = this;
      v.selectTabData = val;
    },
    addRule () { // 添加新规则
      let v = this;
      v.ruleTitle = '订单自动规则--创建';
      const date = new Date().getTime();
      v.ruleEditStatus = true;
      v.looKsettings = false;
      v.$nextTick(function () {
        v.ruleEditModel = true;
        v.ruleParmas = {
          editType: 'add',
          type: 0, // 0 warehose edit 1 audit create 2 audit edit
          name: '',
          autoRuleId: null,
          status: 0
        };
        v.timestamp = date;
      });
    },
    delRule () { // 删除规则
      let v = this;
      let pos = [];
      if (v.selectTabData.length) {
        v.selectTabData.forEach((n, i) => {
          pos.push(n.autoRuleId);
        });
        v.delRuleFn(pos);
      } else {
        v.$Message.error('请选择');
      }
    },
    delRuleFn (autoRuleIds) {
      let v = this;
      v.isDelModal(() => {
        v.axios.delete(api.del_wareAutoRule + '?autoRuleIds=' + autoRuleIds).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.pageParamsStatus = true;
            v.selectTabData = [];
          }
        });
      });
    }
  }
};
</script>
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
