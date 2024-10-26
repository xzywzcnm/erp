<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div style="paddingTop:10px;">
            <Form :model="pageParams" label-position="right" :label-width="70" @submit.native.prevent>
              <dyt-filter :filter-row="1">
                <Form-item label="状态" class="form-filter-item" :label-width="40">
                  <dyt-select v-model="pageParams.status">
                    <Option v-for="(item,index) in ruleStatusList" :key="index" :value="item.status">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="规则名称" class="form-filter-item">
                  <dyt-input style="width:220px;" clearable v-model.trim="pageParams.name"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" icon="md-search" :disabled="SearchDisabled" @click="search">查询</Button>
                  <Button style="marginLeft:10px;" @click="reset" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!--操作区-->
    <div style="margin-left: 10px;">
      <Button type="primary" icon="md-add" @click="addRule" v-if="getPermission('ebayMessageAutoRule_insert')">添加
      </Button>
      <Button style="marginLeft: 10px;" type="error" @click="delRule" v-if="getPermission('ebayMessageAutoRule_delete')">删除
      </Button>
      <Button style="marginLeft: 10px;" @click="refreshData">刷新
      </Button>
      <span style="marginLeft:10px;">数值越小表示优先级越高，1 为最高优先级。当一条站内信满足多条规则时，采用优先级最高的规则分派。</span>
    </div>
    <!-- 表格 -->
    <div style="margin: 10px 10px;">
      <Table ref="dragable" highlight-row border :columns="columns" :loading="tableLoading" :data="listData" @on-selection-change="selectVal"></Table>
    </div>
    <!-- 规则创建编辑 -->
    <Modal v-model="ruleEditModel" v-if="ruleEditStatus" width="1000" :mask-closable="false" :loading="ruleLoading">
      <div class="ivu-modal-confirm-head">
        <div class="ivu-modal-confirm-head-title">{{ ruleTitle }}</div>
      </div>
      <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
        <rule @closeModal="closeModal" :ruleParmas="ruleParmas" :timestamp="timestamp"></rule>
      </div>
      <div slot="footer"></div>
    </Modal>
    <!--加载更多数据-->
    <div class="spin_box" v-show="showMore">
      <Icon type="ios-loading" size=23 class="demo-spin-icon-load"></Icon>
      <div class="txt">加载中...</div>
    </div>
    <!--没有更多数据-->
    <div class="spin_box" v-show="moreDataTalg">没有更多数据啦~~</div>
  </div>
</template>

<style lang="less" scoped>
.spin_box {
  width: 100%;
  text-align: center;
  padding: 10px 0 25px 0;
  color: #2d8cf0;
  font-size: 15px;

  .txt {
    margin-top: 5px;
    position: relative;
    left: 6px;
  }

  .demo-spin-icon-load {
    animation: ani-demo-spin 0.8s linear infinite;
  }

  @keyframes ani-demo-spin {
    from {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
</style>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import rule from './components/rule';
import Sortable from 'sortablejs';

let sortEl;
export default {
  mixins: [Mixin],
  components: {
    rule
  },
  data () {
    let v = this;
    return {
      moreDataTalg: false,
      showMore: false,
      pages: 0,
      pageSize: 15,
      originalData: [],
      pageParams: {
        status: 1,
        name: null
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      ruleStatusList: [ // 状态
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
      listData: [],
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
          width: 200,
          align: 'center',
          render: (h, params) => {
            let arr = [];
            arr = [
              // h('span',
              //   {
              //     attrs: {
              //       title: '非优先'
              //     },
              //     class: 'icon iconfont icon-setBottom-copy normalFontSizeTwoSize cursor greenColor',
              //     on: {
              //       click: () => {
              //         self.tableSort(params.row.autoRuleId, this.listData.length - 1, params.index);
              //       }
              //     }
              //   }
              // ),
              // h('span',
              //   {
              //     attrs: {
              //       title: '优先'
              //     },
              //     class: 'icon iconfont icon-zhiding1 normalFontSizeTwoSize cursor blueColor',
              //     on: {
              //       click: () => {
              //         self.tableSort(params.row.autoRuleId, 0, params.index);
              //       }
              //     }
              //   }
              // ),
              h('Icon', {
                props: {
                  type: 'md-move',
                  size: 18
                },
                style: {
                  marginLeft: '5px',
                  position: 'relative',
                  top: '-2px'
                },
                class: 'cursor-move grayColor'
              })
            ];
            // if (params.index === 0) {
            //   arr.splice(1, 1);
            // } else if (params.index === this.listData.length - 1) {
            //   arr.splice(0, 1);
            // }
            return h('div', arr);
          }
        }, {
          title: '规则名称',
          key: 'name',
          align: 'center',
          minWidth: 150,
          sortable: true
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.status) {
              return h('div', '启用');
            } else {
              return h('div', '停用');
            }
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          maxWidth: 280,
          render: (h, params) => {
            return h('div', [
              !v.getPermission('ebayMessageAutoRule_get') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    const date = new Date().getTime();
                    this.ruleEditStatus = true;
                    this.$nextTick(function () {
                      this.ruleEditModel = true;
                      this.ruleParmas = {
                        type: 2, // 0 edit 1 add 2 see
                        name: params.row.name,
                        autoRuleId: params.row.autoRuleId,
                        details: params.row || {},
                        status: params.row.status
                      };
                      this.timestamp = date;
                    });
                  }
                }
              }, '查看'), !v.getPermission('ebayMessageAutoRule_update') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    const date = new Date().getTime();
                    this.ruleEditStatus = true;
                    this.$nextTick(function () {
                      this.ruleEditModel = true;
                      this.ruleParmas = {
                        type: 0, // 0 edit 1 add 2 see
                        name: params.row.name,
                        autoRuleId: params.row.autoRuleId,
                        status: params.row.status
                      };
                      this.timestamp = date;
                    });
                  }
                }
              }, '编辑'), params.row.status ? !v.getPermission('ebayMessageAutoRule_enable') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.ruleDisable(params.row.autoRuleId);
                  }
                }
              }, '停用') : !v.getPermission('ebayMessageAutoRule_disable') || h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.ruleEnable(params.row.autoRuleId);
                  }
                }
              }, '启用'), !v.getPermission('ebayMessageAutoRule_delete') || h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    let id = params.row.autoRuleId;
                    v.isDelModal(() => {
                      v.delTabData([id]);
                    });
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      selectTabVal: [], // 表格选择数据
      ruleEditModel: false, // 添加，编辑
      ruleEditStatus: false,
      ruleLoading: false,
      ruleTitle: 'eBay消息自动处理规则',
      ruleParmas: null,
      timestamp: 0,
      sortDisableValue: true
    };
  },
  created () { },
  methods: {
    addRule () { // 添加
      let v = this;
      const date = new Date().getTime();
      v.ruleEditStatus = true;
      v.$nextTick(function () {
        v.ruleEditModel = true;
        v.ruleParmas = {
          type: 1, // 0 edit 1 add 2 see
          name: '',
          autoRuleId: null,
          status: 0
        };
        v.timestamp = date;
      });
    },
    delRule () { // 删除
      let v = this;
      let pos = [];
      if (v.selectTabVal.length) {
        v.selectTabVal.forEach((n, i) => {
          pos.push(n.autoRuleId);
        });
        v.isDelModal(() => {
          v.delTabData(pos);
        });
      } else {
        v.$Message.error('请选择需要删除的规则!');
      }
    },
    delTabData (val) {
      let v = this;
      v.axios.delete(api.del_ebayAutoRule + '?autoRuleIds=' + val).then(response => {
        if (response.data.code === 0) {
          v.selectTabVal = []; // 删除完清空已选择
          v.$Message.success('删除成功');
          v.pageParamsStatus = true;
        }
      });
    },
    refreshData () { // 刷新
      let v = this;
      v.pageParamsStatus = true;
    },
    getList () { // 获取列表数据
      let v = this;
      let obj = {
        name: v.pageParams.name,
        status: v.pageParams.status,
        ruleType: 'ebayMessage'
      };
      v.listData = [];
      v.loadingTrue();
      v.axios.post(api.get_ebayAutoRule, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            n.sortIndex = i;
          });
          v.originalData = JSON.parse(JSON.stringify(data));
          v.pageSize = 15;
          v.listData = v.originalData.slice(0, v.pageSize);
          if (v.originalData.length <= 15) {
            v.moreDataTalg = true;
          } else {
            v.moreDataTalg = false;
          }
          v.loadingFalse();
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    tableSort (autoRuleId, index, oldIndex) { // 优先级
      let v = this;
      let obj = {
        currentId: autoRuleId, // 规则ID
        previousId: index ? v.listData[index].autoRuleId : null,
        priority: v.listData[oldIndex].priority
      };
      if (!index && v.listData.length > 1) {
        obj.nextId = v.listData[0].autoRuleId;
      }
      // v.axios.put(api.update_ebayAutoRule)
    },
    search () { // 查询
      let v = this;
      v.pageParamsStatus = true;
    },
    reset () { // 重置
      this.pageParams.name = null;
      this.pageParams.status = 1;
    },
    selectVal (val) { // 表格选择数据
      let v = this;
      v.selectTabVal = val;
    },
    ruleEnable (id) { // 启用
      let v = this;
      v.axios.put(api.put_ebayRuleEnable + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('启用成功');
          v.pageParamsStatus = true;
        }
      });
    },
    ruleDisable (id) { // 停用
      let v = this;
      v.axios.put(api.put_ebayRuleDisenable + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('停用成功');
          v.pageParamsStatus = true;
        }
      });
    },
    closeModal (value) {
      let v = this;
      v.ruleEditModel = false;
      if (value === 1) {
        v.pageParamsStatus = true;
      }
    },
    endFunc (e) {
      let v = this;
      const oldIndex = e.oldIndex;
      const newIndex = e.newIndex;
      let obj;
      if (oldIndex === newIndex) {
        return false;
      }
      if (oldIndex > newIndex) { // 上移
        obj = {
          currentId: v.listData[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? v.listData[newIndex - 1].autoRuleId : null
        };
        if (newIndex >= 0 && newIndex !== v.listData.length - 1) {
          obj.nextId = v.listData[newIndex + 1].autoRuleId; // 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      } else { // 下移
        obj = {
          currentId: v.listData[oldIndex].autoRuleId, // 规则ID
          previousId: newIndex > 0 ? v.listData[newIndex].autoRuleId : null // 因为listData并没有更新，所以newIndex取的是原来的位置
        };
        if (newIndex >= 0 && newIndex !== v.listData.length - 1) {
          obj.nextId = v.listData[newIndex + 1].autoRuleId; // 因为listData并没有更新，所以newIndex取的是原来的位置
        }
      }
      v.axios.put(api.update_ebayAutoRule, JSON.stringify(obj)).then(response => {
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
    // 滚动加载更多数据
    handleReachBottom () {
      let v = this;
      if (v.listData.length === v.originalData.length) {
        v.moreDataTalg = true;
        return false;
      }
      v.showMore = true;
      v.pages++;
      let number = v.pageSize * v.pages;
      setTimeout(() => {
        if (v.originalData.length > 0) {
          v.listData = v.originalData.slice(0, number);
          v.showMore = false;
        }
      }, 800);
    }
  },
  mounted () {
    let v = this;
    v.getList();
    sortEl = v.$refs.dragable.$children[1].$el.children[1];
    Sortable.create(sortEl, {
      onEnd: v.endFunc
    });

    // 滚动加载更多数据
    window.onscroll = function () {
      if (v.getScrollTop() + v.getClientHeight() >= (v.getScrollHeight())) {
        if (!v.showMore) {
          v.handleReachBottom();
        }
      }
    };
  },
  destroyed () {
    window.onscroll = null;
  },
  watch: {
    pageParamsStatus (n, o) {
      var v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('ebayMessageAutoRule_query') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  }
};
</script>
