<style scoped >
.title {
  border: 1px solid #dddee1;
  padding: 5px 10px;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 600;
}

.content {
  border: 1px solid #dddee1;
  border-top: none;
  padding: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
}

.select {
  color: #2d8cf0;
  font-size: 12px;
}

.assign {
  display: inline-block;
  margin-left: 5px;
  color: #2d8cf0;
  cursor: pointer;
}

.assign:hover {
  color: #ff6600;
  text-decoration: underline;
}

.selectCondition {
  width: auto;
  min-height: 150px;
  border: 1px solid #eee;
  margin-top: 20px;
  padding: 10px;
}

.ruleName {
  display: inline-block;
  margin-left: 10px;
  color: #2d8cf0
}

.ruleName:hover {
  color: #ff6600;
  cursor: pointer;
  text-decoration: underline;
}

.saveRuleName {
  display: inline-block;
  margin-left: 10px;
  color: #2d8cf0
}

.description {
  margin-left: 20px;
  color: #FF0000;
}
</style>
<style>
.supplierTabsBar .ivu-tabs-nav-prev, .supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

</style>
<template>
  <div >
    <template >
      <div class="supplierTabsBar commonFilter normalTop" >
        <template >
          <Tabs v-model="currentTabItem" @on-click="showCurrentPage" >
            <TabPane v-for="(item) in tabItems" :label="item.value" :key="item.key" :name="item.key" ></TabPane >
          </Tabs >
        </template >
      </div >
      <div class="flexBox spaceBetween" >
        <div class="tableControl" >
          <Button type="primary" @click="checkRulesFn" class="iconbuttons" style="margin-left: 12px" >
            审核规则冲突检测 </Button >
          <Button type="primary" @click="editRuleFn(true, null)" class="iconbuttons" style="margin-left: 12px" >
            新增审核规则 </Button >
          <span class="description" >
            <template v-if="currentTabItem == '1'" >
              注:如没有添加审批环节，则新增供应商无需审批
            </template >
            <template v-if="currentTabItem == '2'" >
              注:如没有添加审批环节，则新增报价无需审批
            </template >
          </span >
        </div >
      </div >
      <div class="commonFilter normalTop" >
        <div class="orderTable" >
          <keep-alive >
            <Table
                ref="managementTable"
                highlight-row
                :border="false"
                :height="tableHeight"
                :loading="Tableloading"
                :columns="rulesColumn"
                :data="rulesData"
                @on-selection-change="getSelectValue" ></Table >
          </keep-alive >
          <div class="table-page clear" >
            <div class="table-page-right" >
              <keep-alive >
                <Page
                    :total="total"
                    @on-change="changePage"
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
      <!--审核规则冲突检测-->
      <Modal v-model="isShowCheckRules" title="审核规则冲突检测" >
        <div style="max-height: 500px;overflow-y: auto;" >
          <template v-if="checkRulesLoading" >
            <Spin size="large" style="margin: 0 auto;width: 20px;text-align: center;" ></Spin >
          </template >
          <template v-else >
            <div
                v-if="conflictRules && conflictRules.length==0"
                style="text-align: center;font-size: 14px;margin-top: 20px;" >
              无数据
            </div >
            <div v-if="conflictRules && conflictRules.length>0" >
              <div v-for="(item, index) in conflictRules" :key="`d3${index}`">
                <p v-for="(ruleItem, ruleIndex) in item.conflictRulesList" :key="`f${ruleIndex}`">
                  <span class="ruleName" @click="editFn(item.supplierRuleId)" >{{ item.ruleName }}</span >
                  <span style="margin-left: 5px;" >和</span > <span
                    class="ruleName" @click="editFn(ruleItem.supplierRuleId)" >{{ ruleItem.ruleName }}</span > <span
                    style="margin-left: 5px;" >
                    {{
                    '有共同的：' + ruleItem.ruleGroup == 'category' ? '主营品类' : ruleItem.ruleGroup == 'developer'
                                                                          ? '开发人'
                                                                          : ruleItem.ruleGroup == 'purchaser'
                                                                            ? '采购人'
                                                                            : ruleItem.ruleGroup == 'priceRange'
                                                                              ? '单价范围'
                                                                              : ruleItem.ruleGroup == 'floatingRange'
                                                                                ? '上浮范围'
                                                                                : ruleItem.ruleGroup == 'auditer'
                                                                                  ? '审批人'
                                                                                  : ruleItem.ruleGroup == 'suber'
                                                                                    ? '提交人'
                                                                                    : ''
                  }}
                  </span >
                </p >
              </div >
            </div >
          </template >
        </div >
        <div slot="footer" class="normalTop20" style="text-align: center;" >
          <!-- <Button type="primary" @click="ignore">忽略</Button> -->
          <Button type="primary" @click="isShowCheckRules = false" >关闭</Button >
        </div >
      </Modal >

      <!--新增审核规则-->
      <Modal v-model="isShowAddRules" :title="ruleTitle" width="860" >
        <Form ref="checkRules" :model="checkRules" :label-width="120" :rules="ruleValidate" >
          <Row >
            <Col :span="16" >
              <div style="margin-right: 20px;" >
                <div class="title" >
                  已选条件
                </div >
                <div class="content" style="height: 250px;overflow-y: auto;" >
                  <template v-if="isSelectedCondition" >
                    <div
                        v-for="(item, index) in optionalConditionArr"
                        v-if="item.ruleGroup !='auditer' && item.isCheck"
                        :key="index"
                        style="line-height: 20px" >
                      <span >{{ item.ruleGroupName + '为' }}</span > <span class="assign" @click="assignFn(item)" >
                        <!--未指定内容时显示-->
                        <template v-if="!item.conditionValueArr || item.conditionValueArr.length == 0" >
                          {{ '指定' + item.ruleGroupName }}
                        </template >
                      <!--已有内容时显示-->
                        <template v-else-if="item.conditionValueArr && (item.ruleGroup =='category' || item.ruleGroup =='developer' || item.ruleGroup =='purchaser' || item.ruleGroup =='suber')" >
                          <template v-for="(valueItem, valueIndex) in item.conditionValueArr" >
                            <span v-if="valueIndex > 0" style="margin: 0 5px" :key="`d-${valueIndex}`">
                              或
                            </span >
                            {{ valueItem.conditionValue }}
                          </template >
                        </template >
                        <template v-else-if="item.ruleGroup =='priceRange' || item.ruleGroup =='floatingRange'" >
                          <template v-if="item.conditionValueArr[0].inputValue || item.conditionValueArr[1].inputValue" >
                            <!-- <span style="margin-right: 10px">{{item.currency}}</span> -->
                            <template v-for="(valueItem, valueIndex) in item.conditionValueArr" >
                              <span v-if="valueIndex > 0 && valueItem.inputValue" style="margin: 0 5px" :key="`d1${valueIndex}`">
                               且
                              </span >
                              <span v-if="valueItem.inputValue" :key="`d2${valueIndex}`">
                                {{ valueItem.selectValue }} {{ valueItem.inputValue }}
                              </span >
                            </template >
                          </template >
                          <template v-else >
                            {{ '指定' + item.ruleGroupName }}
                          </template >
                        </template >
                      </span >
                    </div >
                  </template >
                  <template v-else >
                    <span >您当前未选择任何条件</span >
                  </template >
                </div >
                <div class="title" >
                  <span >审批人：</span >
                  <Button type="primary" size="small" @click="addReviewer" v-if="isEditRule" >添加 </Button >
                </div >
                <div class="content" style="height: 200px;overflow-y: auto;" >
                  <Row >
                    <template v-for="(item, index) in reviewer.conditionValueArr" >
                      <Col :span="5" :offset="index % 3 === 0? 0 : 1" style="margin-bottom: 10px;" >
                        <dyt-select v-model="item.conditionValue" filterable :disabled="!isEditRule" transfer > <Option
                            v-for="(subItem,subIndex) in reviewerList"
                            :value="subItem.name"
                            :key="subIndex"
                            @click.native="addReviewerIdFn(subItem,index)" >{{ subItem.name }} </Option > </dyt-select >
                      </Col >
                      <Col :span="2" >
                        <Button
                            type="text"
                            shape="circle"
                            icon="minus-round"
                            @click="removeReviewer(index)"
                            v-if="isEditRule" ></Button >
                        <span style="display: inline-block;height: 1rem;" v-if="!isEditRule" ></span >
                      </Col >
                    </template >
                  </Row >
                </div >
                <div class="title" >
                  <FormItem label="审核规则名称：" prop="ruleName" >
                    <Input v-model.trim="checkRules.ruleName" style="width: 340px;" :readonly="!isEditRule" ></Input >
                  </FormItem >
                </div >
              </div >
            </Col >
            <Col :span="8" >
              <div class="title" >
                可选条件
              </div >
              <div class="content" style="height: 575px;padding: 10px;overflow-y: auto;margin-bottom: none;" >
                <template v-for="(item,index) in optionalConditionArr" v-if="item.ruleGroup !='auditer'">
                  <Checkbox
                      :key="`t${index}`"
                      v-model="item.isCheck"
                      @on-change="checkConditionChange"
                      :disabled="!isEditRule"
                      @click.native="conditionCheckedFn(item)" ></Checkbox >
                  <span :key="`s${index}`">{{ item.ruleGroupName }}</span >
                  <span class="select" :key="`s2${index}`">{{ '指定' + item.ruleGroupName }}</span >
                  <br :key="`b${index}`">
                </template >
              </div >
            </Col >
          </Row >
        </Form >
        <div slot="footer" class="normalTop20" style="text-align: center;" >
          <Button
              type="primary" @click="saveFn('checkRules')" v-if="isEditRule" :loading="saveRuleLoading" >保存 </Button >
          <Button type="primary" @click="isShowAddRules = false" >取消</Button >
        </div >
      </Modal >
      <!--指定条件-->
      <Modal v-model="assignModal.isShowAssignModal" :title="assignModal.assignModalTitle" >
        <Form ref="assignModal" :model="assignModal" :label-width="60" :rules="ruleValidate" >
          <div style="margin-left: 20px;" >
            <template v-if="assignModal.ruleGroup == 'priceRange' || assignModal.ruleGroup == 'floatingRange'" >
              <Row >
                <!-- <Col :span="12">
                  <FormItem label="币种：">
                    <dyt-select clearable :disabled="!isEditRule" v-model="assignModal.currency">
                      <Option v-for="(item, index) in assignModal.currencyArr" :value="item.code" :key="item.code">{{ item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                </Col> -->
                <Col :span="12" >
                  <div style="font-size: 12px;line-height: 1;padding: 10px 12px" >
                    满足以下全部条件：
                  </div >
                </Col >
              </Row >
              <template v-for="(item, index) in assignModal.selectedValueArr" >
                <Row class="normalTop" >
                  <Col :span="1" style="padding-top: 6px;" >
                    <Checkbox v-model="item._isCheck" ></Checkbox >
                  </Col >
                  <Col :span="8" :offset="1" >
                    <dyt-select v-model="item.selectValue" :disabled="!item._isCheck" >
                    <template v-if="index == 0" >
                      <Option :value="'≧'" > ≧</Option > <Option :value="'>'" > ></Option >
                      <Option :value="'='" > =</Option >
                    </template >
                    <template v-else-if="index == 1" >
                      <!-- eslint-disable-next-line vue/no-parsing-error -->
                      <Option :value="'<'" > <</Option > <Option :value="'≦'" > ≦</Option >
                    </template >
                    </dyt-select >
                  </Col >
                  <Col :span="6" :offset="1" >
                    <!-- <Form-item :prop="'selectedValueArr.' + index + '.inputValue'" :rules="item._isCheck?[{required: true, message: '不能为空', trigger: 'blur'},{type: 'number', required: true, pattern:/^[a-z0-9]+$/, message:'请输入数字', trigger:'change'}] : []">
                      <Input v-model="item.inputValue" number :disabled="!item._isCheck"></Input>
                    </Form-item> -->
                    <template >
                      <InputNumber :min="0" v-model.number="item.inputValue" :disabled="!item._isCheck" ></InputNumber >
                    </template >
                  </Col >
                </Row >
              </template >
            </template >
            <template v-else >
              <div >
                <dyt-select
                    ref="assignSelect"
                    v-model="assignModal.selectedValue"
                    :disabled="!isEditRule"
                    filterable
                    clearable >
                <template v-if="assignModal.ruleGroup == 'category'" >
                  <Option
                      v-for="(item,index) in assignModal.modalSelectionArr"
                      :value="item.supplierCategoryId"
                      :key="index"
                      @click.native="assignClickFn(item,index)" >{{ item.categoryName }} </Option >
                </template >
                <template v-else >
                  <Option
                      v-for="(item,index) in assignModal.modalSelectionArr"
                      :value="item.name"
                      :key="index"
                      @click.native="assignClickFn(item,index)" >{{ item.name }} </Option >
                </template >
                </dyt-select >
              </div >
              <div class="selectCondition" >
                <template v-for="(item, index) in assignModal.selectedValueArr" >
                  <Col :span="5" :offset="index % 3 === 0? 0 : 1" style="margin-bottom: 10px;" >
                    <Input readonly :value="item.conditionValue" ></Input >
                  </Col >
                  <Col :span="2" >
                    <Button
                        type="text"
                        shape="circle"
                        icon="md-remove-circle"
                        @click="removeFn(index)"
                        v-if="isEditRule" ></Button >
                    <span style="display: inline-block;height: 1rem;" v-if="!isEditRule" ></span >
                  </Col >
                </template >
              </div >
            </template >
          </div >
        </Form >
        <div slot="footer" class="normalTop20" style="text-align: center;" >
          <Button type="primary" @click="confirmFn('assignModal')" v-if="isEditRule" >确定 </Button >
          <Button type="primary" @click="assignModal.isShowAssignModal = false" >关闭 </Button >
        </div >
      </Modal >
      <!--保存时审核规则冲突检测-->
      <Modal v-model="isShowSaveCheckRules" title="审核规则冲突检测" >
        <div style="margin-left: 20px;max-height: 500px;overflow-y: auto;" >
          <template v-if="checkRulesLoading" >
            <Spin size="large" style="margin: 0 auto;width: 20px;text-align: center;" ></Spin >
          </template >
          <template v-else >
            <div v-for="(item, index) in savaConflictRules" :key="`item${index}`">
              <p v-for="(ruleItem, ruleIndex) in item.conflictRulesList" :key="`item1${ruleIndex}`">
                <span class="saveRuleName" >{{ item.ruleName }}</span > <span style="margin-left: 5px;" >和</span > <span
                  class="saveRuleName" >{{ ruleItem.ruleName }}</span > <span style="margin-left: 5px;" >
                  {{
                  '有共同的：' + ruleItem.ruleGroup == 'category' ? '主营品类' : ruleItem.ruleGroup == 'developer'
                                                                        ? '开发人'
                                                                        : ruleItem.ruleGroup == 'purchaser'
                                                                          ? '采购人'
                                                                          : ruleItem.ruleGroup == 'priceRange'
                                                                            ? '单价范围'
                                                                            : ruleItem.ruleGroup == 'floatingRange'
                                                                              ? '上浮范围'
                                                                              : ruleItem.ruleGroup == 'auditer'
                                                                                ? '审批人'
                                                                                : ruleItem.ruleGroup == 'suber'
                                                                                  ? '提交人'
                                                                                  : ''
                }}
                </span >
              </p >
            </div >
          </template >
        </div >
        <div slot="footer" class="normalTop20" style="text-align: center;" >
          <Button type="primary" @click="keepSaveFn" >继续保持</Button >
          <Button type="primary" @click="isShowSaveCheckRules = false" >返回修改</Button >
        </div >
      </Modal >
    </template >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    let self = this;
    return {
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(420),
      totalPage: 0,
      total: 0,
      curPage: 1,
      currentTabItem: '1', // 标签页
      isShowCheckRules: false, // 审核规则冲突检测
      isShowAddRules: false, // 新增审核规则
      saveRuleLoading: false, // 防止多次点击保存规则
      ruleTitle: '',
      isEditRule: false, // 是否可编辑
      isShowSaveCheckRules: false, // 保存时规则冲突检测
      isSelectedCondition: false,
      assignModal: {
        isShowAssignModal: false,
        assignModalTitle: '',
        selectedValue: '',
        ruleGroup: '',
        currency: '',
        selectedValueArr: [],
        modalSelectionArr: [],
        currencyArr: []
      },
      mainCategoryArr: [], // 主营品类
      developerArr: [], // 开发人员
      purchaserArr: [], // 采购人员
      suberArr: [], // 提交人
      reviewerList: [], // 审批人
      pageParams: {
        pageNum: 1,
        pageSize: 10, // conditionIds: [],
        ruleGroup: 'auditer', // category主营品类, developer开发人, purchaser采购人, priceRange单价范围, floatingRange上浮范围, auditer审批人, suber提交人
        ruleType: 1 // 1供应商审核，2报价审核
      },
      rulesParams: {
        /* pageNum: 1,
         pageSize: 10 */
      },
      tabItems: [
        {
          key: '1',
          value: '供应商审核设置'
        }, {
          key: '2',
          value: '报价审核设置'
        }
      ],
      selectionArr: [], // 已选中表格行数据
      rulesData: [], // table数据
      rulesColumn: [
        {
          key: 'rulePriority',
          align: 'center',
          title: '审核步骤',
          render: (h, params) => {
            // let content = null;
            if (self.rulesData.length >= 2) {
              if (params.index == 0) {
                return [
                  h('span', params.row.rulePriority), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'md-arrow-down'
                    },
                    attrs: {
                      title: '下移'
                    },
                    style: {
                      color: '#57a3f3',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        let val = params.row.rulePriority;
                        self.rulesData[params.index].rulePriority = self.rulesData[params.index + 1].rulePriority;
                        self.rulesData[params.index + 1].rulePriority = val;
                        self.adjustFn('down', self.rulesData[params.index], self.rulesData[params.index + 1]);
                      }
                    }
                  }), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'arrow-down-a'
                    },
                    attrs: {
                      title: '置底'
                    },
                    style: {
                      color: '#75b62d',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('bottom', params.row);
                      }
                    }
                  })
                ];
              } else if (params.index == self.rulesData.length - 1) {
                return [
                  h('span', params.row.rulePriority), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'md-arrow-up'
                    },
                    attrs: {
                      title: '上移'
                    },
                    style: {
                      color: '#f25d3d',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        let val = params.row.rulePriority;
                        self.rulesData[params.index].rulePriority = self.rulesData[params.index - 1].rulePriority;
                        self.rulesData[params.index - 1].rulePriority = val;
                        self.adjustFn('up', self.rulesData[params.index], self.rulesData[params.index - 1]);
                      }
                    }
                  }), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'arrow-up-a'
                    },
                    attrs: {
                      title: '置顶'
                    },
                    style: {
                      color: '#4c1413',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('top', params.row);
                      }
                    }
                  })
                ];
              } else if (params.index > 0 && params.index < self.rulesData.length - 1 && self.rulesData.length > 2) {
                return [
                  h('span', params.row.rulePriority), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'md-arrow-up'
                    },
                    attrs: {
                      title: '上移'
                    },
                    style: {
                      color: '#f25d3d',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        let val = params.row.rulePriority;
                        self.rulesData[params.index].rulePriority = self.rulesData[params.index - 1].rulePriority;
                        self.rulesData[params.index - 1].rulePriority = val;
                        self.adjustFn('up', self.rulesData[params.index], self.rulesData[params.index - 1]);
                      }
                    }
                  }), h('Icon', {
                    props: {
                      'size': 18,
                      'type': 'md-arrow-down'
                    },
                    attrs: {
                      title: '下移'
                    },
                    style: {
                      color: '#57a3f3',
                      'margin-left': '10px',
                      'cursor': 'pointer',
                      'vertical-align': 'middle'
                    },
                    on: {
                      click: () => {
                        let val = params.row.rulePriority;
                        self.rulesData[params.index].rulePriority = self.rulesData[params.index + 1].rulePriority;
                        self.rulesData[params.index + 1].rulePriority = val;
                        self.adjustFn('down', self.rulesData[params.index], self.rulesData[params.index + 1]);
                      }
                    }
                  })
                ];
              }
            } else {
              return h('span', params.row.rulePriority);
            }
          }
        }, {
          key: 'ruleName',
          align: 'center',
          title: '审核规则名称'
        }, {
          key: 'conditionValue',
          align: 'center',
          title: '审批人'
        }, {
          key: 'status',
          align: 'center',
          title: '状态',
          render: (h, params) => {
            return ('span', params.row.useFlag === 1 ? '启用' : '停用');
          }
        }, {
          key: 'operation',
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              h('Buttons', {
                props: {
                  trigger: 'click'
                },
                class: 'defaultStyle trimming',
                on: {
                  'on-click': (val) => {
                    self.rulesData.forEach((item, i) => {
                      delete item['_checked'];
                    });
                    self.$set(self.rulesData[params.index], '_checked', true);
                    self.selectionArr = [];
                    self.selectionArr.push(params.row);
                    switch (val) {
                      case '2':
                        self.editFn(params.row.supplierRuleId);
                        break;
                      case '3':
                        self.disableFn(params.row);
                        break;
                      case '4':
                        self.deleteFn(params.row);
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
                      self.showDetails(params.row.supplierRuleId);
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
                  }, params.row.useFlag === 1 ? '停用' : '启用'), h('Buttons-item', {
                    props: {
                      name: '4'
                    }
                  }, '删除')
                ])
              ])
            ]);
          }
        }
      ],
      checkRulesLoading: false,
      conflictRules: [],
      savaConflictRules: [],
      newCheckRule: {
        ruleAuditMode: '1', // 规则审核方式（1全部，2单个）
        ruleConditionList: [ // 供应商规则条件表
          /* {
           conditionId: null,
           conditionValue: '',
           ruleGroup: '',
           supplierRuleConditionId: '',
           supplierRuleId: null
           } */
        ],
        ruleName: '',
        ruleType: 0,
        supplierRuleId: null,
        useFlag: 1
      },
      checkRules: {},
      newReviewer: {
        ruleGroup: 'auditer',
        ruleGroupName: '审批人',
        conditionValueArr: []
      },
      reviewer: {},
      supplierOptionalConditionArr: [ // 供应商审核
        {
          isCheck: false,
          ruleGroup: 'category',
          ruleGroupName: '主营品类',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'developer',
          ruleGroupName: '开发人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'purchaser',
          ruleGroupName: '采购人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'suber',
          ruleGroupName: '提交人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'auditer',
          ruleGroupName: '审批人',
          conditionValueArr: []
        }
      ],
      quoteOptionalConditionArr: [ // 报价审核
        {
          isCheck: false,
          ruleGroup: 'category',
          ruleGroupName: '主营品类',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'developer',
          ruleGroupName: '开发人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'purchaser',
          ruleGroupName: '采购人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'suber',
          ruleGroupName: '提交人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'priceRange',
          ruleGroupName: '单价范围',
          currency: '',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'priceRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'priceRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'floatingRange',
          ruleGroupName: '上浮范围',
          currency: '',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'floatingRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'floatingRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'auditer',
          ruleGroupName: '审批人',
          conditionValueArr: []
        }
      ],
      optionalConditionArr: [],
      conditionCheckedObj: {},
      ruleValidate: {
        ruleName: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 32,
            message: '不能超过32字符',
            trigger: 'change'
          }
        ],
        currency: [
          {
            required: true,
            message: '币种不能为空',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  activated () {
    this.currentTabItem = '1';
    this.intiBaseDataList();
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
      v.axios.post(api.queryAuditRulesList, v.pageParams).then(response => {
        v.total = 0;
        v.Tableloading = true;
        if (response.data.code == 0) {
          v.rulesData = response.data.datas.list;
          v.total = response.data.datas.total;
          v.Tableloading = false;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    adjustFn (type, data1, data2) {
      let v = this;
      let adjustParam = {
        adjustType: type,
        supplierRuleList: [data1]
      };
      if (data2) {
        adjustParam.supplierRuleList.push(data2);
      }
      v.axios.post(api.adjustAuditPriority, adjustParam).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('操作成功');
          v.getList();
        }
      });
    },
    checkRulesFn () {
      this.checkRulesLoading = true;
      this.getCheckRulesFn();
      this.isShowCheckRules = true;
    },
    getCheckRulesFn () {
      let v = this;
      let obj = {
        ruleType: Number(v.currentTabItem)
      };
      v.axios.post(api.checkAuditRules, obj).then(res => {
        if (res.data.code == 0) {
          v.conflictRules = res.data.datas;
        }
        v.checkRulesLoading = false;
      });
    },
    rulesChangePageSize (pageSize) {
      this.rulesParams.pageSize = pageSize;
      this.checkRulesFn();
    },
    editRuleFn (val, data) {
      let v = this;
      v.isEditRule = val;
      v.conditionCheckedObj = {};
      if (data) { // 编辑
        v.checkRules = data;
        v.ruleTitle = val ? '编辑审核规则' : '查看审核规则';
        let ruleType = v.checkRules.ruleType + '';
        if (ruleType == '1') {
          v.optionalConditionArr = v.copyArr(v.supplierOptionalConditionArr);
        } else if (ruleType == '2') {
          v.optionalConditionArr = v.copyArr(v.quoteOptionalConditionArr);
        }
        let isExist = false;
        v.reviewer = Object.assign({}, v.newReviewer);
        v.reviewer.conditionValueArr = [];
        v.optionalConditionArr.forEach((n, i) => { // 把请求的数组相同类型的拼装再一起
          if (n.ruleGroup != 'priceRange' && n.ruleGroup != 'floatingRange') {
            v.optionalConditionArr[i].conditionValueArr = []; // 先清空
          }
          if (n.isCheck === true && n.ruleGroup != 'auditer') { // 先去掉未选择项的勾
            v.checkRules.ruleConditionList.forEach((m, j) => {
              if (n.ruleGroup == m.ruleGroup) {
                isExist = true;
              }
            });
            v.optionalConditionArr[i].isCheck = !!isExist;
          }
          if (v.checkRules.ruleConditionList) {
            v.checkRules.ruleConditionList.forEach((m, j) => {
              if (n.ruleGroup == m.ruleGroup) {
                if (n.ruleGroup == 'auditer') {
                  v.reviewer.conditionValueArr.push(m);
                } else if (n.ruleGroup == 'priceRange' || n.ruleGroup == 'floatingRange') {
                  let arr = [];
                  n.isCheck = true;
                  /* if(m.conditionValue.indexOf(' ') != -1) {
                   v.optionalConditionArr[i].currency = m.conditionValue.split(' ')[0]
                   arr = m.conditionValue.split(' ')[1].split(':')
                   } else {
                   arr = m.conditionValue.split(':')
                   } */
                  arr = m.conditionValue.split(':');
                  if (arr.length > 0) {
                    arr.forEach((l, k) => {
                      v.optionalConditionArr[i].conditionValueArr[k] = Object.assign({
                        _isCheck: true,
                        selectValue: l.split(',')[0],
                        inputValue: Number(l.split(',')[1])
                      }, m);
                    });
                  }
                } else {
                  n.isCheck = true;
                  v.optionalConditionArr[i].conditionValueArr.push(m);
                }
              }
            });
          }
        });
      } else { // 新增
        if (v.pageParams.ruleType == 1) {
          v.optionalConditionArr = v.copyArr(v.supplierOptionalConditionArr);
        } else if (v.pageParams.ruleType == 2) {
          v.optionalConditionArr = v.copyArr(v.quoteOptionalConditionArr);
        }
        v.optionalConditionArr.forEach((n, i) => {
          if (n.ruleGroup != 'priceRange' && n.ruleGroup != 'floatingRange') {
            v.optionalConditionArr[i].conditionValueArr = []; // 先清空
          }
          v.reviewer.conditionValueArr = [];
          n.isCheck = false;
        });
        v.checkRules = Object.assign({}, v.newCheckRule);
        v.checkRules.ruleType = Number(v.currentTabItem);
        v.reviewer = Object.assign({}, v.newReviewer);
        v.reviewer.conditionValueArr = [];
        v.ruleTitle = '新增审核规则';
      }
      v.isSelectedConditionFn();
      v.saveRuleLoading = false;
      v.isShowAddRules = true;
    },
    showCurrentPage (name) { // tabs页切换
      this.pageParams.ruleType = Number(name);
      this.rulesData = [];
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    showDetails (id) {
      let v = this;
      v.axios.post(api.queryAuditRulesDetail, [id]).then(res => {
        if (res.data.code == 0) {
          v.editRuleFn(false, res.data.datas[0]);
        }
      });
    },
    editFn (id) {
      let v = this;
      v.axios.post(api.queryAuditRulesDetail, [id]).then(res => {
        if (res.data.code == 0) {
          v.editRuleFn(true, res.data.datas[0]);
        }
      });
    },
    disableFn (data) {
      let v = this;
      let obj = {
        supplierRuleId: data.supplierRuleId,
        useFlag: data.useFlag === 0 ? 1 : 0
      };
      v.axios.post(api.useFlag, [obj]).then(res => {
        if (res.data.code == 0) {
          v.$Message.success(data.useFlag === 1 ? '停用成功' : '启用成功');
          v.getList();
        }
      });
    },
    deleteFn (data) {
      let v = this;
      v.axios.get(api.removeAuditRules + '?supplierRuleId=' + data.supplierRuleId).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('删除成功');
          v.getList();
        }
      });
    },
    addReviewer () {
      this.reviewer.conditionValueArr.push({
        conditionId: '', // 条件id
        conditionValue: '', // 条件值
        ruleGroup: 'auditer',
        supplierRuleConditionId: null, // 新增时为Null
        supplierRuleId: null // 新增时为Null
      });
    },
    addReviewerIdFn (item, index) {
      this.reviewer.conditionValueArr[index].conditionId = item.id;
    },
    assignFn (data) { // 弹窗
      let v = this;
      v.assignModal.selectedValueArr = [];
      v.assignModal.modalSelectionArr = [];
      v.assignModal.selectedValue = '';
      v.assignModal.ruleGroup = data.ruleGroup;
      v.optionalConditionArr.forEach((n, i) => {
        if (data.ruleGroup == 'category' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定主营品类';
          v.assignModal.modalSelectionArr = v.deepCopy(v.mainCategoryArr);
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
          v.$refs.assignSelect.clearSingleSelect();
        } else if (data.ruleGroup == 'developer' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定开发人';
          v.assignModal.modalSelectionArr = v.deepCopy(v.developerArr);
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
          v.$refs.assignSelect.clearSingleSelect();
        } else if (data.ruleGroup == 'purchaser' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定采购人';
          v.assignModal.modalSelectionArr = v.deepCopy(v.purchaserArr);
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
          v.$refs.assignSelect.clearSingleSelect();
        } else if (data.ruleGroup == 'suber' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定提交人';
          v.assignModal.modalSelectionArr = v.deepCopy(v.suberArr);
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
          v.$refs.assignSelect.clearSingleSelect();
        } else if (data.ruleGroup == 'priceRange' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定单价范围';
          // v.assignModal.currency = n.currency
          // v.getCurrencyFn()
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
        } else if (data.ruleGroup == 'floatingRange' && n.ruleGroup == data.ruleGroup) {
          v.assignModal.assignModalTitle = '指定上浮范围';
          // v.assignModal.currency = n.currency
          // v.getCurrencyFn()
          v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
        }
      });
      v.assignModal.isShowAssignModal = true;
    },
    getCurrencyFn () {
      let v = this;
      v.axios.post(api.getCurrencyDropdownList).then(res => {
        if (res.data.code == 0) {
          v.assignModal.currencyArr = res.data.datas;
        }
      });
    },
    removeFn (index) {
      this.assignModal.selectedValueArr.splice(index, 1);
    },
    assignClickFn (item, index) {
      let v = this;
      let isExist = false;
      v.assignModal.selectedValueArr.forEach((n, i) => {
        if (n.conditionId === (v.assignModal.ruleGroup == 'category' ? item.supplierCategoryId : item.id)) {
          isExist = true;
        }
      });
      if (!isExist) {
        v.assignModal.selectedValueArr.push({
          conditionId: v.assignModal.ruleGroup == 'category' ? item.supplierCategoryId : item.id, // 条件id
          conditionValue: v.assignModal.ruleGroup == 'category' ? item.categoryName : item.name, // 条件值
          ruleGroup: v.assignModal.ruleGroup,
          supplierRuleConditionId: null, // 新增时为Null
          supplierRuleId: null // 新增时为Null
        });
      } else {
        v.$Message.error('该选项已经存在');
      }
    },
    confirmFn (name) {
      let v = this;
      if (v.assignModal.ruleGroup == 'priceRange' || v.assignModal.ruleGroup == 'floatingRange') {
        let _checked = false;
        let inputEmpty = false;
        let inputError = false;
        v.assignModal.selectedValueArr.forEach((m, j) => {
          if (m._isCheck) {
            _checked = true;
            if (m.inputValue === null || m.inputValue === '') {
              inputEmpty = true;
            }
          }
        });
        if (v.assignModal.selectedValueArr[0].inputValue && v.assignModal.selectedValueArr[1].inputValue && (v.assignModal.selectedValueArr[0].inputValue >= v.assignModal.selectedValueArr[1].inputValue)) {
          inputError = true;
        }
        /* if(!v.assignModal.currency) {
         v.$Message.error('请选择币种！')
         return
         } */
        if (!_checked || inputEmpty) {
          v.$Message.error('请指定范围，或进行取消操作！');
          return;
        }
        if (inputError) {
          v.$Message.error('请输入正确的范围值！');
          return;
        }
      }
      v.optionalConditionArr.forEach((n, i) => {
        if (n.ruleGroup == v.assignModal.ruleGroup) {
          v.optionalConditionArr[i].conditionValueArr = v.assignModal.selectedValueArr;
          /* if(v.assignModal.ruleGroup == 'priceRange' || v.assignModal.ruleGroup == 'floatingRange') {
           v.optionalConditionArr[i].currency = v.assignModal.currency
           } */
        }
      });
      v.assignModal.ruleGroup = '';
      v.assignModal.modalSelectionArr = [];
      v.assignModal.isShowAssignModal = false;
      /* v.$refs[name].validate((valid) => {
       if (valid) {
       v.optionalConditionArr.forEach((n, i)=> {
       if(n.ruleGroup == v.assignModal.ruleGroup) {
       v.optionalConditionArr[i].conditionValueArr = v.assignModal.selectedValueArr
       if(v.assignModal.ruleGroup == 'priceRange' || v.assignModal.ruleGroup == 'floatingRange') {
       v.optionalConditionArr[i].currency = v.assignModal.currency
       }
       }
       })
       v.assignModal.ruleGroup = ''
       v.assignModal.modalSelectionArr = []
       v.assignModal.isShowAssignModal = false
       }
       }) */
    },
    removeReviewer (index) {
      this.reviewer.conditionValueArr.splice(index, 1);
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    checkConditionChange (val) {
      if (val) {
        this.assignFn(this.conditionCheckedObj);
      }
      this.isSelectedConditionFn();
    },
    conditionCheckedFn (data) {
      this.conditionCheckedObj = Object.assign({}, data);
    },
    isSelectedConditionFn () {
      let v = this;
      let isExist = false;
      v.optionalConditionArr.forEach((item) => {
        if (item.isCheck) {
          isExist = true;
        }
      });
      v.isSelectedCondition = !!isExist;
    },
    saveFn (name) { // 保存
      let v = this;
      let isSelected = false; // 是否选择了条件
      let conditionIsNull = ''; // 选择条件是否指定了内容
      let reviewerIsNull = false; // 添加的审核人是否为空
      v.optionalConditionArr.forEach((n, i) => {
        if (n.ruleGroup != 'auditer' && n.isCheck === true) {
          if (n.conditionValueArr.length == 0) {
            conditionIsNull = n.ruleGroupName + '未指定内容';
          }
          isSelected = true;
        }
      });
      if (!isSelected) { // 未选择条件时退出
        v.$Message.error('请选择条件');
        return;
      }
      if (conditionIsNull) { // 选择条件未指定内容时退出
        v.$Message.error(conditionIsNull);
        return;
      }
      if (v.reviewer.conditionValueArr.length == 0) { // 未添加审核人时退出
        v.$Message.error('请添加审核人');
        return;
      }
      v.reviewer.conditionValueArr.forEach((n, i) => {
        if (!n.conditionValue) {
          reviewerIsNull = true;
        }
      });
      if (reviewerIsNull) { // 添加的审核人为空时退出
        v.$Message.error('请选择审核人');
        return;
      }
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.saveRuleLoading = true;
          v.combineContentFn();
          v.saveRuleFn();
          /*
           v.axios.post(api.saveBycheckAuditRules, v.checkRules)
           .then(res => {
           if(res.data.code == 0) {
           if(res.data.datas && res.data.datas.length > 0) {
           //debugger
           v.savaConflictRules = res.data.datas
           v.isShowSaveCheckRules = true
           v.saveRuleLoading = false
           } else {

           }
           }
           }) */
        }
      });
    },
    combineContentFn () {
      let v = this;
      let conditionArr = [];
      let str = '';
      v.optionalConditionArr.forEach((n, i) => {
        // eslint-disable-next-line no-empty
        if (!n.isCheck && n.ruleGroup != 'auditer') {

        } else if (n.ruleGroup == 'auditer') {
          v.reviewer.conditionValueArr.forEach((m, j) => {
            conditionArr.push(m);
          });
        } else if (n.ruleGroup == 'priceRange' || n.ruleGroup == 'floatingRange') {
          let arr = [];
          n.conditionValueArr.forEach((m, j) => {
            if (m._isCheck) {
              arr.push(m.selectValue + ',' + m.inputValue);
            }
          });
          str = arr.length > 1 ? arr.join(':') : arr.length == 1 ? arr[0] : '';
          n.conditionValueArr[0].conditionValue = str;
          conditionArr.push(n.conditionValueArr[0]);
        } else {
          n.conditionValueArr.forEach((m, j) => {
            conditionArr.push(m);
          });
        }
      });
      v.checkRules.ruleConditionList = conditionArr;
    },
    saveRuleFn () {
      let v = this;
      v.axios.post(api.saveAuditRules, v.checkRules).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('保存成功');
          if (v.isShowSaveCheckRules) {
            v.isShowSaveCheckRules = false;
          }
          v.isShowAddRules = false;
          if (v.isShowCheckRules) {
            v.getCheckRulesFn();
          } else {
            v.getList();
          }
        }
        v.saveRuleLoading = false;
      });
    },
    keepSaveFn () {
      this.saveRuleFn();
    },
    intiBaseDataList () {
      let v = this;
      v.axios.get(api.commodityDeveloper).then(res => {
        if (res.data.code == 0) {
          // v.developerArr = res.data.datas
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != 'service') {
              arr.push({
                id: i,
                name: datas[i].userName
              });
            }
          }
          v.developerArr = arr;
          v.purchaserArr = arr;
          v.suberArr = arr;
          v.reviewerList = arr;
        }
      });
      v.axios.post(api.categoryQuery, {}).then(res => {
        if (res.data.code == 0) {
          v.mainCategoryArr = res.data.datas.list;
        }
      });
    }
  }
};
</script >
