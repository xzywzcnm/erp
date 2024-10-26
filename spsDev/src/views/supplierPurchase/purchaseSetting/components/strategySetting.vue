<style scoped>
.deleteTip {
  padding: 20px 30px;
  font-size: 16px;
}
</style>
<style>
.strategy-modal .ivu-modal-content .ivu-modal-footer {
  display: none;
}
</style>
<template>
  <div >
    <div class="flexBox spaceBetween normalTop20" >
      <div class="tableControl" >
        <Button type="primary" class="iconbuttons" @click="addStrategyFn" style="margin-left: 12px;width: 100px;" >
          新增策略 </Button >
      </div >
    </div >
    <div class="commonFilter normalTop20" >
      <div class="orderTable" >
        <keep-alive >
          <Table
              ref="mainProTable"
              highlight-row
              :border="true"
              :height="tableHeight"
              :loading="Tableloading"
              :columns="stockColumn"
              :data="stockData"
              @on-selection-change="getSelectValue" ></Table >
        </keep-alive >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <keep-alive >
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
            </keep-alive >
          </div >
        </div >
      </div >
    </div >
    <!--新增/编辑供应商-->
    <Modal
        class-name="strategy-modal"
        v-model="isShowStrategy"
        :title="operationType == '1'? '新增备货策略' : operationType == '2'? '查看备货策略' : '编辑备货策略'"
        :width="800"
        :mask-closable="operationType == '1' || operationType == '3'? false : true"
        :styles="{top: '50px'}" >
      <template v-if="isShowStrategy" >
        <strategyModal
            :operationType="operationType"
            :strategy="strategy"
            @saveSuccess="saveSuccess"
            @closeStrategy="closeStrategy" ></strategyModal >
      </template >
      <div slot="footer" >

      </div >
    </Modal >
    <!--删除提示-->
    <Modal v-model="isShowDeleteTip" :width="400" title="提示" >
      <div class="deleteTip" >
        确定删除此备货计划？
      </div >
      <div slot="footer" >
        <Button
            type="primary"
            @click="delStrategyFn"
            :loading="delLoading"
            style="width: 80px;margin-right: 30px;" >确定 </Button >
        <Button type="primary" @click="isShowDeleteTip = false" style="width: 80px;" >关闭</Button >
      </div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import strategyModal from './common/strategyModal';

export default {
  components: {
    strategyModal: function (resolve, reject) {
      resolve(strategyModal);
    }
  },
  mixins: [Mixin, tableMixin],
  data () {
    let self = this;
    return {
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(320),
      totalPage: 0,
      total: 0,
      curPage: 1,
      isShowDeleteTip: false,
      delLoading: false,
      isShowStrategy: false,
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      operationType: '1', // 1:新增、2:查看、 3:编辑
      newStrategy: { // 新增策略初始化
        name: '',
        strategyType: 0,
        warehouse: [],
        label: [],
        classification: [],
        amazonAccount: [],
        optional: { // 备货建议公式
          subOptions: [],
          addOptions: []
        },
        frequency: null,
        formula: null,
        takeValueType: 1,
        type: 1,
        orderFactor: [
          /* {
           start: 0,
           end: 2,
           factor: 0.1
           } */
        ],
        salesFactor: [],
        pendings: false,
        approvals: false
      },
      strategy: {}, // 策略
      delStrategy: { // 删除策略
        strategyId: ''
      },
      selectionArr: [], // 已选中表格行数据
      stockData: [],
      stockColumn: [
        {
          key: 'name',
          align: 'center',
          title: '备货建议名称'
        }, {
          key: 'strategyTypeName',
          align: 'center',
          title: '备货建议类型'
        }, {
          key: 'warehouseName',
          align: 'center',
          title: '仓库/店铺',
          className: 'warehouse',
          render: (h, params) => {
            if (params.row.warehouseName) {
              return h('Poptip', {
                props: {
                  trigger: 'hover',
                  placement: 'bottom',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%'
                  }
                }, params.row.warehouseName), h('div', {
                  slot: 'content'
                }, [
                  h('div', params.row.warehouseName)
                ])
              ]);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'formula',
          align: 'center',
          title: '日均销量公式',
          render: (h, params) => {
            if (params.row.type == 1) {
              return h('span', params.row.formula);
            } else {
              return h('span', '-');
            }
          }
        }, {
          key: 'frequency',
          align: 'center',
          title: '采购频率'
        }, {
          key: 'operation',
          align: 'center',
          title: '操作',
          width: 160,
          render: (h, params) => {
            return h('div', [
              h('Buttons', {
                props: {
                  trigger: 'click',
                  transfer: true
                },
                class: 'defaultStyle trimming',
                on: {
                  'on-click': (val) => {
                    self.stockData.forEach((item, i) => {
                      delete item['_checked'];
                    });
                    self.$set(self.stockData[params.index], '_checked', true);
                    self.selectionArr = [];
                    self.selectionArr.push(params.row);
                    switch (val) {
                      case '2':
                        // eslint-disable-next-line no-case-declarations
                        let strategyData = {};
                        self.axios.post(api.strategyInfo + '?strategyId=' + params.row.strategyId).then(res => {
                          if (res.data.code == 0) {
                            if (res.data.datas) {
                              strategyData = res.data.datas;
                              self.strategySetFn('3', strategyData);
                            } else {
                              self.$Message.error('无数据！');
                            }
                          }
                        });
                        break;
                      case '3':
                        self.isShowDeleteTip = true;
                        self.delStrategy.strategyId = params.row.strategyId;
                        break;
                    }
                  }
                }
              }, [
                h('Button', {
                  type: 'default',
                  class: 'iconbuttons',
                  on: {
                    click () {
                      let strategyData = {};
                      self.axios.post(api.strategyInfo + '?strategyId=' + params.row.strategyId).then(res => {
                        if (res.data.code == 0) {
                          if (res.data.datas) {
                            strategyData = res.data.datas;
                            self.strategySetFn('2', strategyData);
                          } else {
                            self.$Message.error('无数据！');
                          }
                        }
                      });
                    }
                  }
                }, '查看'), h('Buttons-menu', {
                  slot: 'list'
                }, [
                  h('Buttons-item', {
                    props: {
                      name: '2'
                    }
                  }, '编辑'), h('Buttons-item', {
                    props: {
                      name: '3'
                    }
                  }, '删除')
                ])
              ])
            ]);
          }
        }
      ],
      ruleValidate: {
        name: [
          {
            required: true,
            message: '不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 100,
            message: '不能超过100个字符',
            trigger: 'change'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      var v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  activated () {
    this.startLoading();
  },
  methods: {
    startLoading () {
      var v = this;
      v.$Loading.start();
      v.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      v.Tableloading = true;
      v.axios.post(api.strategyList, v.pageParams).then(response => {
        v.Tableloading = false;
        v.total = 0;
        if (response.data.code == 0) {
          v.stockData = response.data.datas.list;
          v.total = response.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    addStrategyFn () {
      let v = this;
      v.strategy = v.deepCopy(v.newStrategy);
      v.getNewformula();
      v.operationType = '1';
      v.isShowStrategy = true;
    },
    strategySetFn (type, data) { // 操作类型2:查看，3：编辑、数据
      let v = this;
      v.operationType = type;
      v.strategy = v.deepCopy(data);
      v.$set(v.strategy, 'warehouse', []);
      v.$set(v.strategy, 'label', []);
      v.$set(v.strategy, 'classification', []);
      v.$set(v.strategy, 'amazonAccount', []);
      v.strategy.strategyConditionList.forEach((n, i) => {
        if (n.conditionType == 'warehouse') {
          v.strategy.warehouse.push(n.conditionId);
        } else if (n.conditionType == 'label') {
          v.strategy.label.push(n.conditionValue);
        } else if (n.conditionType == 'category') {
          v.strategy.classification.push(n.conditionId);
        } else if (n.conditionType == 'amazonAccount') {
          v.strategy.amazonAccount.push(n.conditionId);
        }
      });
      v.strategy.optional = JSON.parse(v.strategy.optional);
      /* if(v.strategy.strategyType == 1) {
       /!*v.strategy.optional.pendings = v.strategy.optional.pendings == 0? false : true
       v.strategy.optional.approvals = v.strategy.optional.approvals == 0? false : true*!/
       v.$set(v.strategy, 'pendings',  v.strategy.optional.hasOwnProperty('subOptions') && v.strategy.optional.subOptions.includes('09'))
       v.$set(v.strategy, 'approvals', v.strategy.optional.hasOwnProperty('addOptions') && v.strategy.optional.addOptions.includes('01'))
       }else if(v.strategy.strategyType == 1){

       } */
      // let optional = JSON.parse(v.strategy.optional)
      /* v.$set(v.strategy, 'subOptions', optional.subOptions)
       v.$set(v.strategy, 'addOptions', optional.addOptions) */
      if (v.strategy.type == 2) {
        v.strategy.orderFactor = JSON.parse(data.orderFactor);
        v.strategy.salesFactor = JSON.parse(data.salesFactor);
        v.strategy.formula = JSON.parse(v.strategy.formula);
      } else if (v.strategy.type == 1) {
        let arr1 = v.strategy.formula.split('+');
        v.strategy.formula = {
          avg1: null,
          avg3: null,
          avg7: null,
          avg15: null,
          avg30: null
        };
        arr1.forEach((n, i) => {
          if (n.indexOf('avg1*') != '-1') {
            v.strategy.formula.avg1 = Number(n.split('*')[1]);
          } else if (n.indexOf('avg3*') != '-1') {
            v.strategy.formula.avg3 = Number(n.split('*')[1]);
          } else if (n.indexOf('avg7*') != '-1') {
            v.strategy.formula.avg7 = Number(n.split('*')[1]);
          } else if (n.indexOf('avg15*') != '-1') {
            v.strategy.formula.avg15 = Number(n.split('*')[1]);
          } else if (n.indexOf('avg30*') != '-1') {
            v.strategy.formula.avg30 = Number(n.split('*')[1]);
          }
        });
      }
      v.isShowStrategy = true;
    },
    getNewformula (val) {
      let v = this;
      if (v.strategy.type == 1) {
        v.strategy.formula = {
          avg1: null,
          avg3: null,
          avg7: null,
          avg15: null,
          avg30: null
        };
      } else {
        v.strategy.formula = {
          KEEP_GROWING: {
            AVG_THREE: null,
            AVG_SEVEN: null,
            AVG_FIFTEEN: null,
            AVG_THIRTY: null
          },
          WAVE_GROWING: {
            AVG_THREE: 0.2,
            AVG_SEVEN: 0.3,
            AVG_FIFTEEN: 0.2,
            AVG_THIRTY: 0.3
          },
          KEEP_DOWN: {
            AVG_THREE: null,
            AVG_SEVEN: null,
            AVG_FIFTEEN: null,
            AVG_THIRTY: null
          },
          WAVE_DOWN: {
            AVG_THREE: 0.3,
            AVG_SEVEN: 0.2,
            AVG_FIFTEEN: 0.3,
            AVG_THIRTY: 0.2
          }
        };
        v.strategy.orderFactor = [];
        v.strategy.salesFactor = [];
      }
    },
    delStrategyFn () {
      let v = this;
      v.delLoading = true;
      v.axios.post(api.strategyRemove + '?strategyId=' + v.delStrategy.strategyId).then(res => {
        v.delLoading = false;
        if (res.data.code == 0) {
          v.$Message.success('删除成功！');
          v.isShowDeleteTip = false;
          v.pageParamsStatus = true;
        }
      });
    },
    saveSuccess () {
      this.isShowStrategy = false;
      this.pageParamsStatus = true;
    },
    closeStrategy () {
      this.isShowStrategy = false;
    }
  }
};
</script >
