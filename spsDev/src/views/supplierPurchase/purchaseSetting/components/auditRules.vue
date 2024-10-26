<style scoped>
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
  color: #2d8cf0;
}

.ruleName:hover {
  color: #ff6600;
  cursor: pointer;
  text-decoration: underline;
}

.saveRuleName {
  display: inline-block;
  margin-left: 10px;
  color: #2d8cf0;
}

.description {
  margin-left: 20px;
  color: #ff0000;
}
</style>
<style>
.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}
</style>
<template>
  <div>
    <template>
      <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="pageParams.ruleType" @on-click="showCurrentPage">
            <TabPane v-for="(item) in tabItems" :label="item.value" :key="item.key" :name="item.key"></TabPane>
          </Tabs>
        </template>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <Button type="primary" @click="editRuleFn('1', null)" class="iconbuttons" style="margin-left: 12px">
            新增审批规则 </Button>
          <span class="description">
            <template v-if="pageParams.ruleType == '1' || pageParams.ruleType == '2'">
             注:如没有添加审批环节，则备货计划无需审批
            </template>
            <template v-if="pageParams.ruleType == '3'">
              注:如没有添加审批环节，则采购单无需审批
            </template>
            <template v-if="pageParams.ruleType == '4'">
              注:如没有添加审批环节，则供应商无需审批
            </template>
            <template v-if="pageParams.ruleType == '5'">
              注:如没有添加审批环节，则报价无需审批
            </template>
          </span>
        </div>
      </div>
      <div class="commonFilter normalTop">
        <div class="orderTable">
          <keep-alive>
            <Table
              ref="managementTable"
              highlight-row
              :border="true"
              :loading="Tableloading"
              :columns="rulesColumn"
              :data="rulesData"
              @on-selection-change="getSelectValue"></Table>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
                <Page
                  :total="total"
                  @on-change="changePage"
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="pageParams.pageNum"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray"></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
      <!--审核规则冲突检测-->
      <Modal v-model="isShowCheckRules" title="审核规则冲突检测">
        <div style="max-height: 500px;overflow-y: auto;">
          <template v-if="checkRulesLoading">
            <Spin size="large" style="margin: 0 auto;width: 20px;text-align: center;"></Spin>
          </template>
          <template v-else>
            <div
              v-if="conflictRules && conflictRules.length==0"
              style="text-align: center;font-size: 14px;margin-top: 20px;">
              无数据
            </div>
            <div v-if="conflictRules && conflictRules.length>0">
              <div v-for="(item, index) in conflictRules" :key="'conflictRules'+index">
                <p v-for="(ruleItem, ruleIndex) in item.conflictRulesList" :key="'conflictRulesList'+ruleIndex">
                  <span class="ruleName" @click="editFn(item.supplierRuleId)">{{ item.ruleName }}</span>
                  <span style="margin-left: 5px;">和</span> <span
                  class="ruleName" @click="editFn(ruleItem.supplierRuleId)">{{ ruleItem.ruleName }}</span> <span
                  style="margin-left: 5px;">
                    有共同的： {{
                    ruleItem.ruleGroup == 'category' ? '主营品类' : ruleItem.ruleGroup == 'developer'
                      ? '开发人'
                      : ruleItem.ruleGroup == 'purchaser'
                        ? '采购人'
                        : ruleItem.ruleGroup == 'priceRange'
                          ? '单价范围'
                          : ruleItem.ruleGroup == 'floatingRange'
                            ? '上浮范围'
                            : ruleItem.ruleGroup == 'auditer'
                              ? '审批人'
                              : ruleItem.ruleGroup == 'suber' ? '提交人' : ''
                  }}
                  </span>
                </p>
              </div>
            </div>
          </template>
        </div>
        <div slot="footer" class="normalTop20" style="text-align: center;">
          <!-- <Button type="primary" @click="ignore">忽略</Button> -->
          <Button type="primary" @click="isShowCheckRules = false">关闭</Button>
        </div>
      </Modal>

      <!--新增审核规则-->
      <Modal v-model="isShowAddRules" :title="modalParams.title" width="960" :mask-closable="!modalParams.isEditRule">
        <Form ref="checkRules" :model="checkRules" :label-width="120" :rules="ruleValidate">
          <Row>
            <Col :span="16">
              <div style="margin-right: 20px;">
                <div class="title">
                  已选条件
                </div>
                <div class="content" style="height: 250px;overflow-y: auto;">
                  <template v-if="isSelectedCondition">
                    <div v-for="(item, index) in optionalConditionArr" :key="'optionalConditionArr'+index" style="line-height: 20px">
                      <template v-if="item.ruleGroup !='auditer' && item.isCheck">
                        <span>{{ item.ruleGroupName }}</span>
                        <template v-if="item.ruleGroup !='updateSupplierFlag' && item.ruleGroup !='numgreaterthan' && item.ruleGroup !='freightCheckImport'">
                          <span>为</span> <span class="assign" @click="assignFn(item)">
                            <!--未指定内容时显示-->
                            <template v-if="!item.conditionValueArr || item.conditionValueArr.length == 0">
                              {{ '指定' + item.ruleGroupName }}
                            </template>
                          <!--已有内容时显示-->
                            <template v-else>
                              <template
                                v-if="item.ruleGroup =='category' 
                                || item.ruleGroup =='developer' 
                                || item.ruleGroup =='purchaser' 
                                || item.ruleGroup =='suber' 
                                || item.ruleGroup =='backupWarehouse' 
                                || item.ruleGroup =='creator' 
                                || item.ruleGroup == 'purchaseWarehouse'
                                || item.ruleGroup == 'stockApply'
                                || item.ruleGroup == 'freightCheck'
                                || item.ruleGroup == 'billApplyStatus'
                                || item.ruleGroup == 'billApplyAll'
                                || item.ruleGroup == 'stockApplyWarehouse'
                                ">
                                <span v-for="(valueItem, valueIndex) in item.conditionValueArr" :key="'conditionValueArr1'+valueIndex">
                                  <span  v-if="valueIndex > 0" style="margin: 0 5px">
                                    或
                                  </span>
                                  {{ valueItem.conditionValue }}
                                </span>
                              </template>
                              <!--预计金额范围 -->
                              <template
                                v-else-if="item.ruleGroup =='priceRange' || item.ruleGroup =='floatingRange' || item.ruleGroup == 'estimatedAmountRange' || item.ruleGroup == 'numberRange' || item.ruleGroup == 'purchaseAmountRange' || item.ruleGroup == 'purchasePirceRange' || item.ruleGroup == 'purchaseFloatRange'">
                                <template v-if="item.conditionValueArr[0]._isCheck || item.conditionValueArr[1]._isCheck">
                                  <!-- <span style="margin-right: 10px">{{item.currency}}</span> -->
                                  <span v-for="(valueItem, valueIndex) in item.conditionValueArr" :key="'conditionValueArr2'+valueIndex">
                                    <span v-if="valueIndex > 0 && valueItem.isCheck" style="margin: 0 5px">
                                      且
                                    </span>
                                    <span v-if="valueItem._isCheck">
                                      {{ valueItem.selectValue }} {{ valueItem.inputValue }}<span v-if="item.ruleGroup === 'purchaseFloatRange'">%</span>
                                    </span>
                                  </span>
                                </template>
                                <template v-else>
                                  {{ '指定' + item.ruleGroupName }}
                                </template>
                              </template>
                            </template>
                          </span>
                        </template>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    <span>您当前未选择任何条件</span>
                  </template>
                </div>
                <div class="title">
                  <span>审批人：</span>
                  <Button type="primary" size="small" @click="addReviewer" :disabled="isJumpReviewer" v-if="modalParams.isEditRule">添加</Button>
                </div>
                <div class="content" style="height: 200px;overflow-y: auto;">
                  <Row>
                    <span v-for="(item, index) in reviewer.conditionValueArr" style="margin-right:30px" :key="'conditionValueArr3'+index">
                      <Col v-if="!modalParams.isEditRule">
                        {{ item.conditionValue }}
                      </Col>
                      <Col :span="5" :offset="index % 3 === 0? 0 : 1" style="margin-bottom: 10px;" v-else>
                        <dyt-select 
                        v-model="item.conditionValue" 
                        filterable 
                        style="width:120px" 
                        :disabled="!modalParams.isEditRule" 
                        transfer
                        @on-change="(val) => { enterReviewerIdFn(item, index) }"
                        >
                          <Option
                            v-for="(subItem,subIndex) in assignSelectArr.auditer"
                            :value="subItem.name"
                            :disabled="choseAuditer.indexOf(subItem.id)>-1"
                            :key="subIndex"
                            >{{ subItem.name }} </Option></dyt-select>
                      </Col>
                      <Col :span="2">
                        <Button
                          type="text"
                          shape="circle"
                          icon="md-remove-circle"
                          @click="removeReviewer(index)"
                          v-if="modalParams.isEditRule"></Button>
                        <span style="display: inline-block;height: 1rem;" v-if="!modalParams.isEditRule"></span>
                      </Col>
                    </span>
                  </Row>
                </div>
                <div class="title">
                  <FormItem label="审核规则名称：" prop="ruleName">
                    <Input
                      v-model.trim="checkRules.ruleName"
                      style="width: 340px;"
                      :disabled="!modalParams.isEditRule"></Input>
                  </FormItem>
                </div>
              </div>
            </Col>
            <Col :span="8">
              <!-- 可选模块 -->
              <div class="module" v-if="isBillPayment">
                <div class="title">
                  可选模块
                </div>
                <div class="content" style="height: 50%;padding: 10px;overflow-y: auto;margin-bottom: none;">
                    <CheckboxGroup 
                    class="flexBox" 
                    style="flex-direction: column" 
                    v-model="selectModule"
                    @on-change="selectModuleFn"
                    >
                    <Checkbox 
                    v-for="(item, index) in billModule" 
                    :label="item.label"
                    :key="index"
                    :disabled="!modalParams.isEditRule">
                      {{ item.name }}
                    </Checkbox>
                  </CheckboxGroup>
                </div>
              </div>
              <!-- 可选条件 -->
              <div class="condition">
                <div class="title">
                可选条件
              </div>
              <div class="content" style="height: 50%;padding: 10px;overflow-y: auto;margin-bottom: none;">
                <span v-for="(item,index) in optionalConditionArr" :key="'optionalConditionArr'+index" v-if="item.ruleGroup !='auditer'">
                  <Checkbox
                    v-model="item.isCheck"
                    @on-change="checkConditionChange"
                    :disabled="!modalParams.isEditRule"
                    @click.native="conditionCheckedFn(item)"></Checkbox>
                  <span>{{ item.ruleGroupName }}</span> <span
                  class="select"
                  v-if="item.ruleGroup !='updateSupplierFlag' && item.ruleGroup !='numgreaterthan' && item.ruleGroup !='freightCheckImport'">{{ '指定' + item.ruleGroupName }}</span>
                  <br>
                </span>
              </div>
              </div>
            </Col>
          </Row>
        </Form>
        <div slot="footer" class="normalTop20" style="text-align: center;">
          <Button
            type="primary"
            @click="saveFn('checkRules')"
            v-if="modalParams.isEditRule && getPermission('ruleSetting_saveAuditRules')"
            :loading="saveRuleLoading">保存 </Button>
          <Button type="primary" @click="isShowAddRules = false">取消</Button>
        </div>
      </Modal>
      <!--指定条件-->
      <Modal v-model="assignModal.isShowAssignModal" :title="assignModal.assignModalTitle">
        <Form ref="assignModal" :model="assignModal" :label-width="60" :rules="ruleValidate">
          <div style="margin-left: 20px;">
            <template
              v-if="assignModal.ruleGroup == 'priceRange' || assignModal.ruleGroup == 'floatingRange' || assignModal.ruleGroup == 'estimatedAmountRange' || assignModal.ruleGroup == 'numberRange' || assignModal.ruleGroup == 'purchaseAmountRange' || assignModal.ruleGroup == 'purchasePirceRange' || assignModal.ruleGroup == 'purchaseFloatRange'">
              <Row>
                <!-- <Col :span="12">
                  <FormItem label="币种：">
                    <dyt-select clearable :disabled="!isEditRule" v-model="assignModal.currency">
                      <Option v-for="(item, index) in assignModal.currencyArr" :value="item.code" :key="item.code">{{ item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                </Col> -->
                <Col :span="12">
                  <div style="font-size: 12px;line-height: 1;padding: 10px 12px">
                    满足以下全部条件：
                  </div>
                </Col>
              </Row>
              <template v-for="(item, index) in assignModal.selectedValueArr">
                <Row class="normalTop">
                  <Col :span="1" style="padding-top: 6px;">
                    <Checkbox v-model="item._isCheck"></Checkbox>
                  </Col>
                  <Col :span="8" :offset="1">
                    <dyt-select v-model="item.selectValue" :disabled="!item._isCheck || !modalParams.isEditRule">
                      <template v-if="index == 0">
                        <Option :value="'≧'"> ≧</Option> <Option :value="'>'"> ></Option>
                        <Option :value="'='"> =</Option>
                      </template>
                      <template v-else-if="index == 1">
                         <!-- eslint-disable-next-line vue/no-parsing-error -->
                        <Option :value="'<'"> &lt; </Option>
                        <Option :value="'≦'"> ≦</Option>
                      </template>
                    </dyt-select>
                  </Col>
                  <Col :span="6" :offset="1">
                    <template>
                      <InputNumber
                        :min="0"
                        v-model.number="item.inputValue"
                        :disabled="!item._isCheck || !modalParams.isEditRule"></InputNumber>
                    </template>
                  </Col>
                </Row>
              </template>
            </template>
            <!-- 账单及退款规则 -->
            <template v-else-if="assignModal.ruleGroup =='stockApply' 
            || assignModal.ruleGroup =='freightCheck' 
            || assignModal.ruleGroup =='billApplyAll'
            || assignModal.ruleGroup =='billApplyStatus'
            " >
            <!-- 选择入库金额退抵方式、运费金额退抵方式、账单状态 -->
              <div v-if="assignModal.ruleGroup =='stockApply' 
            || assignModal.ruleGroup =='freightCheck' 
            || assignModal.ruleGroup == 'billApplyStatus' 
            ">
            <div>
              <dyt-select
              ref="assignSelect"
              v-model="assignModal.selectedValue"
              :disabled="!modalParams.isEditRule"
              filterable
              clearable>
              <!-- 状态选择 -->
              <Option
                  v-for="(item,index) in assignModal.modalSelectionArr"
                  :value="item.value"
                  :key="index"
                  @click.native="assignBillClickFn(item,index, 'fir')">{{ item.value }}</Option>
              </dyt-select>
            </div>
            <div class="selectCondition">
                <span v-for="(item, index) in assignModal.selectedValueArr" :key="'selectedValueArr'+index">
                  <Col :span="8"  style="margin-bottom: 10px;">
                    <Input readonly :value="item.conditionValue"></Input>
                  </Col>
                  <Col :span="2">
                    <Button
                      type="text"
                      shape="circle"
                      icon="md-remove-circle"
                      @click="removeFn(index)"
                      v-if="modalParams.isEditRule"></Button>
                    <span style="display: inline-block;height: 1rem;" v-if="!modalParams.isEditRule"></span>
                  </Col>
                </span>
              </div>
              </div>
              <div v-else>
                <CheckboxGroup 
                    class="flexBox" 
                    v-model="billApplyAllStatus"
                    @on-change="getModule">
                    <span class="mr20">选择操作:</span>
                    <Checkbox 
                    class="mr20"
                    v-for="(item, index) in assignModal.modalSelectionArr" 
                    :label="item.value"
                    :key="index"
                    :disabled="!modalParams.isEditRule"
                    @click.native="assignBillClickFn(item,index, 'checkBox')">
                      {{ item.name }}
                    </Checkbox>
                  </CheckboxGroup>
              </div>
            </template>
            <template v-else>
              <div>
                <dyt-select
                  ref="assignSelect"
                  v-model="assignModal.selectedValue"
                  :disabled="!modalParams.isEditRule"
                  filterable
                  clearable>
                  <template v-if="assignModal.ruleGroup == 'category'">
                    <Option
                      v-for="(item,index) in assignModal.modalSelectionArr"
                      :value="item.supplierCategoryId"
                      :key="index"
                      @click.native="assignClickFn(item,index)">{{ item.categoryName }} </Option>
                  </template>
                  <template v-else-if="assignModal.ruleGroup=='backupWarehouse' 
                  || assignModal.ruleGroup=='purchaseWarehouse' 
                  || assignModal.ruleGroup == 'stockApplyWarehouse' ">
                    <Option
                      v-for="(item,index) in assignModal.modalSelectionArr"
                      :value="item.warehouseName"
                      :key="index"
                      @click.native="assignClickFn(item,index)">{{ item.warehouseName }} </Option>
                  </template>
                  <template v-else>
                    <Option
                      v-for="(item,index) in assignModal.modalSelectionArr"
                      :value="item.name"
                      :key="index"
                      @click.native="assignClickFn(item,index)">{{ item.name }} </Option>
                  </template>
                </dyt-select>
              </div>
              <div class="selectCondition">
                <span v-for="(item, index) in assignModal.selectedValueArr" :key="'selectedValueArr'+index">
                  <Col :span="5" :offset="index % 3 === 0? 0 : 1" style="margin-bottom: 10px;">
                    <Input readonly :value="item.conditionValue"></Input>
                  </Col>
                  <Col :span="2">
                    <Button
                      type="text"
                      shape="circle"
                      icon="md-remove-circle"
                      @click="removeFn(index)"
                      v-if="modalParams.isEditRule"></Button>
                    <span style="display: inline-block;height: 1rem;" v-if="!modalParams.isEditRule"></span>
                  </Col>
                </span>
              </div>
            </template>
          </div>
        </Form>
        <div slot="footer" class="normalTop20" style="text-align: center;">
          <Button type="primary" @click="confirmFn('assignModal')" v-if="modalParams.isEditRule">确定</Button>
          <Button type="primary" @click="assignModal.isShowAssignModal = false">关闭</Button>
        </div>
      </Modal>
      <!--保存时审核规则冲突检测-->
      <Modal v-model="isShowSaveCheckRules" title="审核规则冲突检测">
        <div style="margin-left: 20px;max-height: 500px;overflow-y: auto;">
          <template v-if="checkRulesLoading">
            <Spin size="large" style="margin: 0 auto;width: 20px;text-align: center;"></Spin>
          </template>
          <template v-else>
            <div v-for="(item, index) in savaConflictRules" :key="'savaConflictRules'+index">
              <p v-for="(ruleItem, ruleIndex) in item.conflictRulesList" :key="'conflictRulesList'+ruleIndex">
                <span class="saveRuleName">{{ item.ruleName }}</span> <span style="margin-left: 5px;">和</span> <span
                class="saveRuleName">{{ ruleItem.ruleName }}</span> <span style="margin-left: 5px;">
                  有共同的：
                </span> <span style="color: #ff6600;">
                  {{ ruleItem.sameField }}
                <!-- {{ruleItem.ruleGroup == 'category'? '主营品类' : ruleItem.ruleGroup == 'developer'? '开发人' : ruleItem.ruleGroup == 'purchaser'? '采购人' : ruleItem.ruleGroup == 'priceRange'? '单价范围' : ruleItem.ruleGroup == 'floatingRange'? '上浮范围' : ruleItem.ruleGroup == 'auditer'? '审批人' : ruleItem.ruleGroup == 'suber'? '提交人' : ruleItem.ruleGroup == 'prepareWarehouse' && pageParams.ruleType == '3'? '仓库' : ruleItem.ruleGroup == 'prepareWarehouse' && pageParams.ruleType == '5'? '店铺' : ruleItem.ruleGroup == 'estimatedAmountRange'? '预计金额范围' : ruleItem.ruleGroup == 'numberRange'? '数量范围' : ruleItem.ruleGroup == 'goods'? '货品' : ruleItem.ruleGroup == 'goodsClassify'? '货品分类' : ruleItem.ruleGroup == 'purchaseWarehouse'? '采购仓库' : ruleItem.ruleGroup == 'purchaseAmountRange'? '采购金额范围' : ruleItem.ruleGroup == 'purchasePirceRange'? '采购单价范围' : ruleItem.ruleGroup == 'purchaseFloatRange'? '采购浮动范围' : ruleItem.ruleGroup == 'purchaseNumberRange'? '采购数量范围' : ruleItem.ruleGroup == 'updateSupplierFlag'? '更换供应商' : ruleItem.ruleGroup == 'numgreaterthan'? '采购总数量大于需求数量' : ''}} -->
                </span>
              </p>
            </div>
          </template>
        </div>
        <div slot="footer" class="normalTop20" style="text-align: center;">
          <Button type="primary" @click="keepSaveFn"> 继续保持</Button>
          <Button type="primary" @click="isShowSaveCheckRules = false"> 返回修改</Button>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data() {
    let self = this;
    return {
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(360),
      totalPage: 0,
      total: 0,
      curPage: 1,
      currentTabItem: '3', // 标签页
      isShowCheckRules: false, // 审核规则冲突检测
      isShowAddRules: false, // 新增审核规则
      saveRuleLoading: false, // 防止多次点击保存规则
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
      modalParams: {
        isEditRule: false, // 是否可编辑
        title: '', // 模态框标题
        isNew: false, //是否为新建
      },
      assignSelectArr: {
        category: [], // 主营品类
        developer: [], // 开发人员
        purchaser: [], // 采购人员
        suberArr: [], // 提交人
        auditer: [], // 审批人
        backupWarehouse: [], // 仓库
        fbaBackupWarehouse: [], // fba仓库
        purchaseWarehouse: [], // 采购仓库
        creator: [], // 创建人
        stockApply: [  // 入库金额退抵方式
          {label: '待提交', value: '待提交', id: '1'},
          {label: '待创建出库单', value: '待创建出库单', id: '2'},
          {label: '待出库寄出', value: '待出库寄出', id: '3'},
          {label: '待核对', value: '待核对', id: '4'},
          {label: '待审核', value: '待审核', id: '5'},
          {label: '待审核-累计月结抵扣', value: '待审核-累计月结抵扣', id: '5,1'},
          {label: '待审核-逐单现金退还', value: '待审核-逐单现金退还', id: '5,2'},
          {label: '待审核-由公司承担', value: '待审核-由公司承担', id: '5,3'},
          {label: '待审核-其他', value: '待审核-其他', id: '5,4'},
          {label: '待审核-到付寄出', value: '待审核-到付寄出', id: '5,5'},
        ],
        freightCheck: [ // 运费金额退抵方式
        {label: '待处理', value: '待处理', id: '0'},
        {label: '待审核', value: '待审核', id: '1'},
        {label: '待审核-累计月结抵扣', value: '待审核-累计月结抵扣', id: '1,1'},
        {label: '待审核-逐单现金退还', value: '待审核-逐单现金退还', id: '1,2'},
        {label: '待审核-由公司承担', value: '待审核-由公司承担', id: '1,3'},
        {label: '待审核-其他', value: '待审核-其他', id: '1,4'},
        {label: '待审核-到付寄出', value: '待审核-到付寄出', id: '1,5'},
        {label: '待复审', value: '待复审', id: '2'},
        {label: '待复审-累计月结抵扣', value: '待复审-累计月结抵扣', id: '2,1'},
        {label: '待复审-逐单现金退还', value: '待复审-逐单现金退还', id: '2,2'},
        {label: '待复审-由公司承担', value: '待复审-由公司承担', id: '2,3'},
        {label: '待复审-其他', value: '待复审-其他', id: '2,4'},
        {label: '待复审-到付寄出', value: '待复审-到付寄出', id: '2,5'},
        ],
        billApplyStatus: [ // 账单状态
        {label: '待提交', value: '待提交', id: '1'},
        {label: '待采购审核', value: '待采购审核', id: '2'},
        {label: '待财务审核', value: '待财务审核', id: '3'},
        {label: '待付款', value: '待付款', id: '4'},          
        ],
        billApplyAll: [ // 账单汇总
        {name: '编辑', value: '编辑', id: '1'},
        {name: '删除', value: '删除', id: '2'},
        ],
        stockApplyWarehouse: []
      },
      billApplyAllStatus: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10, // conditionIds: [],
        // ruleGroup: 'auditer', //category主营品类, developer开发人, purchaser采购人, priceRange单价范围, floatingRange上浮范围, auditer审批人, suber提交人
        ruleType: '3' // 1供应商审核，2报价审核
      },
      tabItems: [
        {
          key: '1',
          value: '自营及第三方仓备货计划审核规则'
        }, {
          key: '2',
          value: 'FBA备货计划审核规则'
        }, {
          key: '3',
          value: '采购单审核规则设置'
        }, {
          key: '4',
          value: '供应商审核设置'
        }, {
          key: '5',
          value: '报价审核设置'
        }, {
          key: '6',
          value: '账单及抵退货款审核设置'
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
                return !self.getPermission('ruleSetting_adjustAuditPriority') || [
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
                return !self.getPermission('ruleSetting_adjustAuditPriority') || [
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
                return !self.getPermission('ruleSetting_adjustAuditPriority') || [
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
            return h('span', {
              style: {
                color: params.row.useFlag === 1 ? 'green' : 'red'
              }
            }, params.row.useFlag === 1 ? '启用' : '停用');
          }
        }, {
          key: 'operation',
          align: 'center',
          fixed: 'right',
          title: '操作',
          render: (h, params) => {
            return h('div', [
              !self.getPermission('ruleSetting_queryAuditRulesDetail') || h('Buttons', {
                props: {
                  trigger: 'click',
                  transfer: true
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
                    click() {
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
                  }, '编辑'),
                  !self.getPermission('ruleSetting_useFlag') || h('Buttons-item', {
                    props: {
                      name: '3'
                    }
                  }, params.row.useFlag === 1 ? '停用' : '启用'),
                  !self.getPermission('ruleSetting_removeAuditRules') || h('Buttons-item', {
                    props: {
                      name: '4',
                      disabled: params.row.ruleType == 6 && params.row.useFlag === 1
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
        ruleConditionList: [], // 供应商规则条件表
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
      stockingPlanConditionArr: [ // 备货计划
        {
          isCheck: false,
          ruleGroup: 'backupWarehouse',
          ruleGroupName: '备货仓库',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'estimatedAmountRange',
          ruleGroupName: '预计金额范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'estimatedAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'estimatedAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'numberRange',
          ruleGroupName: '数量范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'numberRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'numberRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'creator',
          ruleGroupName: '创建人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'auditer',
          ruleGroupName: '审批人',
          conditionValueArr: []
        }
      ],
      fbaStockingConditionArr: [ // fba备货计划
        {
          isCheck: false,
          ruleGroup: 'backupWarehouse',
          ruleGroupName: '备货店铺',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'estimatedAmountRange',
          ruleGroupName: '预计金额范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'estimatedAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'estimatedAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'numberRange',
          ruleGroupName: '数量范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'numberRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'numberRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'creator',
          ruleGroupName: '创建人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'auditer',
          ruleGroupName: '审批人',
          conditionValueArr: []
        }
      ],
      purchasePlanConditionArr: [ // 采购计划
        {
          isCheck: false,
          ruleGroup: 'purchaseWarehouse',
          ruleGroupName: '采购仓库',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'purchaseAmountRange',
          ruleGroupName: '采购金额范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchaseAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchaseAmountRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'purchasePirceRange',
          ruleGroupName: '采购单价范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchasePirceRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchasePirceRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'purchaseFloatRange',
          ruleGroupName: '采购浮动范围',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchaseFloatRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '≧',
              inputValue: null
            }, {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'purchaseFloatRange',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null,
              _isCheck: false,
              selectValue: '<',
              inputValue: null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'purchaser',
          ruleGroupName: '采购人',
          conditionValueArr: []
        }, {
          isCheck: false,
          ruleGroup: 'updateSupplierFlag',
          ruleGroupName: '更换供应商',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'updateSupplierFlag',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null // 新增时为Null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'numgreaterthan',
          ruleGroupName: '采购总数量大于需求数量',
          conditionValueArr: [
            {
              conditionId: '', // 条件id
              conditionValue: '', // 条件值
              ruleGroup: 'numgreaterthan',
              supplierRuleConditionId: null, // 新增时为Null
              supplierRuleId: null // 新增时为Null
            }
          ]
        }, {
          isCheck: false,
          ruleGroup: 'auditer',
          ruleGroupName: '审批人',
          conditionValueArr: []
        }
      ],
      billAndRefundOfLoansArr: [
        {
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
      },
      personOpenArr: [],  //   已启用人员（审批人）
      selectModule: [], // 可选模块
      billModule: [
        { label: '1', name: '入库出库申请' },
        { label: '2', name: '寄出运费核对' },
        { label: '3', name: '账单申请管理' },
      ],
    };
  },
  computed: {
    choseAuditer() {
      let arr = this.reviewer.conditionValueArr.map(i => {
        return i.conditionId;
      });
      return arr;
    },
    isBillPayment() {
      return this.pageParams.ruleType == '6'
    },
    isShowRefundArr() {
      if(this.assignModal.ruleGroup == 'stockApply' && this.assignModal.selectedValue == '5') return true;
      if(this.assignModal.ruleGroup == 'freightCheck'
      && (this.assignModal.selectedValue == '1' || this.assignModal.selectedValue == '2')) return true;
      return false
    },
    isJumpReviewer() {
      // 校验是否只选择了入库出库申请里面的免仓库寄出流程
      let resultList = this.optionalConditionArr.filter(item => item.isCheck == true)
      const isValid = resultList.every(obj => {
        return ['stockApplyWarehouse'].includes(obj.ruleGroup);
      });
      return isValid
    }
  },
  watch: {
    pageParamsStatus(n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    },
    selectModule: {
      handler(newVal, oldVal) {
        let oldValObj = oldVal
        if(!oldValObj) {
          oldValObj = []
        }
        if(!this.modalParams.isNew && this.$common.isEmpty(oldVal)) {
          // 此处是为了防止编辑状态下，获取接口传参selectModule会重复添加可选条件
          return ;
        } else {
          this.optionalConditionArr =  this.getBillAndRefundOfLoansArr(newVal, oldValObj, 'add')
        }
      }
    },
    isShowAddRules: {
      handler(newVal, oldVal) {
        if(!newVal) {
          this.selectModule = []
        }
      }
    }
  },
  activated() {
    this.pageParams.ruleType = '1';
    // this.intiBaseDataList()
    this.startLoading();
  },
  methods: {
    startLoading() {
      var v = this;
      v.$Loading.start();
      v.getList();
    },
    getList() { // 獲取分頁
      let v = this;
      if (!v.getPermission('ruleSetting_list')) {
        v.$Message.error('无权限');
        return;
      }
      let params = v.deepCopy(v.pageParams);
      params.ruleType = Number(params.ruleType);
      v.Tableloading = true;
      v.axios.post(api.queryAuditRulesList, params).then(response => {
        v.Tableloading = false;
        v.total = 0;
        if (response.data.code == 0) {
          v.rulesData = response.data.datas.list;
          v.total = response.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    adjustFn(type, data1, data2) {
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
    checkRulesFn() {
      this.checkRulesLoading = true;
      this.getCheckRulesFn();
      this.isShowCheckRules = true;
    },
    getCheckRulesFn() {
      let v = this;
      let obj = {
        ruleType: Number(v.pageParams.ruleType)
      };
      v.axios.post(api.checkAuditRules, obj).then(res => {
        if (res.data.code == 0) {
          v.conflictRules = res.data.datas;
        }
        v.checkRulesLoading = false;
      });
    },
    editRuleFn(val, data) {
      let v = this;
      let type = val == '1' ? '新增' : val == '2' ? '查看' : val == '3' ? '编辑' : '';
      let operationType = v.pageParams.ruleType == '4' ? '供应商审核规则' : v.pageParams.ruleType == '5'
        ? '报价审核规则'
        : v.pageParams.ruleType == '1'
          ? '备货计划审核规则'
          : v.pageParams.ruleType == '3'
            ? '采购单审核规则'
            : v.pageParams.ruleType == '2'
              ? 'FBA备货计划审核规则'
              : v.pageParams.ruleType == '6'
              ? '账单及抵退货款审核设置'
              : '';
      v.modalParams.title = type + operationType;
      v.modalParams.isEditRule = !!(val == '1' || val == '3');
      v.modalParams.isNew = val == '1'
      v.conditionCheckedObj = {};
      if (data) { // 编辑
        v.checkRules = data;
        let ruleType = v.checkRules.ruleType + '';
        if (ruleType == '1') {
          v.optionalConditionArr = v.deepCopy(v.stockingPlanConditionArr);
        } else if (ruleType == '2') {
          v.optionalConditionArr = v.deepCopy(v.fbaStockingConditionArr);
        } else if (ruleType == '3') {
          v.optionalConditionArr = v.deepCopy(v.purchasePlanConditionArr);
        } else if (ruleType == '4') {
          v.optionalConditionArr = v.deepCopy(v.supplierOptionalConditionArr);
        } else if (ruleType == '5') {
          v.optionalConditionArr = v.deepCopy(v.quoteOptionalConditionArr);
        } else if (ruleType == '6') {
          v.billAndRefundOfLoansArr = this.getBillAndRefundOfLoansArr(v.selectModule, [], 'edit')
          v.optionalConditionArr = v.billAndRefundOfLoansArr
        }
        let isExist = false;
        v.reviewer = v.deepCopy(v.newReviewer);
        v.optionalConditionArr.forEach((n, i) => { // 把请求的数组相同类型的拼装再一起
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
                } else if (n.ruleGroup == 'priceRange' || n.ruleGroup == 'floatingRange' || n.ruleGroup == 'estimatedAmountRange' || n.ruleGroup == 'numberRange' || n.ruleGroup == 'purchaseAmountRange' || n.ruleGroup == 'purchasePirceRange' || n.ruleGroup == 'purchaseFloatRange') {
                  let arr = [];
                  n.isCheck = true;
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
                  if (n.ruleGroup == 'updateSupplierFlag' || n.ruleGroup == 'numgreaterthan' || n.ruleGroup == 'freightCheckImport') { // 更换供应商、采购总数量大于需求数量
                    v.optionalConditionArr[i].conditionValueArr = v.deepCopy([m]);
                  } else {
                    v.optionalConditionArr[i].conditionValueArr.push(m);
                  }
                }
              }
            });
          }
        });
      } else { // 新增
        let ruleType = v.pageParams.ruleType + '';
        if (ruleType == '1') {
          v.optionalConditionArr = v.deepCopy(v.stockingPlanConditionArr);
        } else if (ruleType == '2') {
          v.optionalConditionArr = v.deepCopy(v.fbaStockingConditionArr);
        } else if (ruleType == '3') {
          v.optionalConditionArr = v.deepCopy(v.purchasePlanConditionArr);
        } else if (ruleType == '4') {
          v.optionalConditionArr = v.deepCopy(v.supplierOptionalConditionArr);
        } else if (ruleType == '5') {
          v.optionalConditionArr = v.deepCopy(v.quoteOptionalConditionArr);
        } else if (ruleType == '6') {
          v.optionalConditionArr = v.deepCopy(v.billAndRefundOfLoansArr);
          this.selectModule = []
        }
        v.checkRules = v.deepCopy(v.newCheckRule);
        v.checkRules.ruleType = Number(v.pageParams.ruleType);
        v.reviewer = v.deepCopy(v.newReviewer);
      }
      v.isSelectedConditionFn();
      v.saveRuleLoading = false;
      v.intiBaseDataList();
      v.isShowAddRules = true;
    },
    showCurrentPage(name) { // tabs页切换
      // this.rulesData = []
      this.pageParams.pageNum = 1;
      this.getList();
    },
    changePage(page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    showDetails(id) {
      let v = this;
      v.axios.post(api.queryAuditRulesDetail, [id]).then(res => {
        if (res.data.code == 0) {
          if(res.data.datas[0].ruleType == 6) {
          v.selectModule = res.data.datas[0].selectModule.split(',')
        }
          v.editRuleFn('2', res.data.datas[0]);
        }
      });
    },
    editFn(id) {
      let v = this;
      v.axios.post(api.queryAuditRulesDetail, [id]).then(res => {
        if (res.data.code == 0) {
          if(res.data.datas[0].ruleType == 6) {
          v.selectModule = res.data.datas[0].selectModule.split(',')
        }
          v.editRuleFn('3', res.data.datas[0]);
        }
      });
    },
    disableFn(data) {
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
    deleteFn(data) {
      let v = this;
      v.axios.get(api.removeAuditRules + '?supplierRuleId=' + data.supplierRuleId).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('删除成功');
          v.getList();
        }
      });
    },
    addReviewer() {
      this.reviewer.conditionValueArr.push({
        conditionId: '', // 条件id
        conditionValue: '', // 条件值
        ruleGroup: 'auditer',
        supplierRuleConditionId: null, // 新增时为Null
        supplierRuleId: null // 新增时为Null
      });
    },
    addReviewerIdFn(item, index) {
      if (this.choseAuditer.indexOf(item.id) === -1) {
        this.reviewer.conditionValueArr[index].conditionId = item.id;
      }
    },
    assignFn(data) { // 弹窗
      let v = this;
      if (data.ruleGroup != 'updateSupplierFlag' && data.ruleGroup != 'numgreaterthan' && data.ruleGroup != 'freightCheckImport') {
        v.assignModal.selectedValueArr = [];
        v.assignModal.modalSelectionArr = [];
        v.assignModal.selectedValue = '';
        v.assignModal.ruleGroup = data.ruleGroup;
        v.optionalConditionArr.forEach((n, i) => {
          if (n.ruleGroup == data.ruleGroup) {
            v.assignModal.assignModalTitle = '指定' + n.ruleGroupName;
            if (data.ruleGroup == 'category' 
            || data.ruleGroup == 'developer' 
            || data.ruleGroup == 'purchaser' 
            || data.ruleGroup == 'suber' 
            || data.ruleGroup == 'backupWarehouse' 
            || data.ruleGroup == 'creator' 
            || data.ruleGroup == 'purchaseWarehouse'
            || data.ruleGroup == 'stockApply'
            || data.ruleGroup == 'freightCheck'
            || data.ruleGroup == 'billApplyStatus'
            || data.ruleGroup == 'stockApplyWarehouse'
            ) {
              v.assignModal.modalSelectionArr = v.deepCopy(v.assignSelectArr[data.ruleGroup]);
              if (n.ruleGroup == 'backupWarehouse' && v.pageParams.ruleType == '2') { // fba备货店铺
                v.assignModal.modalSelectionArr = v.deepCopy(v.assignSelectArr.fbaBackupWarehouse);
              }
              v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
              v.$nextTick(() => {
                v.$refs.assignSelect.clearSingleSelect();
              });
            } else if (data.ruleGroup == 'priceRange' 
            || data.ruleGroup == 'floatingRange' 
            || data.ruleGroup == 'estimatedAmountRange' 
            || data.ruleGroup == 'numberRange' 
            || data.ruleGroup == 'purchaseAmountRange' 
            || data.ruleGroup == 'purchasePirceRange' 
            || data.ruleGroup == 'purchaseFloatRange'
            ) {
              v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
            } else if(data.ruleGroup == 'billApplyAll') {
              v.assignModal.modalSelectionArr = v.deepCopy(v.assignSelectArr[data.ruleGroup]);
              v.assignModal.selectedValueArr = v.deepCopy(n.conditionValueArr);
              if(v.$common.isEmpty(v.billApplyAllStatus) && !v.$common.isEmpty(v.assignModal.selectedValueArr)) {
                v.billApplyAllStatus = v.assignModal.selectedValueArr.map(item => item.conditionValue)
              }
            }
          }
        });
        v.assignModal.isShowAssignModal = true;
      }
    },
    removeFn(index) {
      this.assignModal.selectedValueArr.splice(index, 1);
    },
    assignClickFn(item, index) {
      let v = this;
      let isExist = false;
      let id = v.assignModal.ruleGroup == 'category'
        ? item.supplierCategoryId
        : v.assignModal.ruleGroup == 'backupWarehouse' || v.assignModal.ruleGroup == 'purchaseWarehouse' || v.assignModal.ruleGroup == 'stockApplyWarehouse'
          ? item.warehouseId
          : item.id;
      let name = v.assignModal.ruleGroup == 'category'
        ? item.categoryName
        : v.assignModal.ruleGroup == 'backupWarehouse' || v.assignModal.ruleGroup == 'purchaseWarehouse'|| v.assignModal.ruleGroup == 'stockApplyWarehouse'
          ? item.warehouseName
          : item.name;
      v.assignModal.selectedValueArr.forEach((n, i) => {
        if (n.conditionId === id) {
          isExist = true;
        }
      });
      if (!isExist) {
        v.assignModal.selectedValueArr.push({
          conditionId: id, // 条件id
          conditionValue: name, // 条件值
          ruleGroup: v.assignModal.ruleGroup,
          supplierRuleConditionId: null, // 新增时为Null
          supplierRuleId: null // 新增时为Null
        });
      } else {
        v.$Message.error('该选项已经存在');
      }
    },
    assignBillClickFn(item, index ,type) {
      let v = this;
      let flag = true;
      // 多选框会导致重复勾选问题
      if(type == 'checkBox') {
        v.assignModal.selectedValueArr.forEach(obj => {
          if(obj.conditionValue === item.value) {
            flag = false;
          }
        })
      }
      if(!flag) return;
        let value = item.value
        let isExist = false;
        v.assignModal.selectedValueArr.forEach((n, i) => {
          if (n.conditionValue === value) {
            isExist = true;
          }
        });
        if (!isExist) {
          v.assignModal.selectedValueArr.push({
            conditionId: item.id, // 条件id
            conditionValue: value, // 条件值
            ruleGroup: v.assignModal.ruleGroup,
            supplierRuleConditionId: null, // 新增时为Null
            supplierRuleId: null, // 新增时为Null
          });
        } else {
          v.$Message.error('该选项已经存在');
        }
    },
    confirmFn(name) {
      let v = this;
      if (v.assignModal.ruleGroup == 'priceRange' || v.assignModal.ruleGroup == 'floatingRange' || v.assignModal.ruleGroup == 'estimatedAmountRange' || v.assignModal.ruleGroup == 'numberRange' || v.assignModal.ruleGroup == 'purchaseAmountRange' || v.assignModal.ruleGroup == 'purchasePirceRange' || v.assignModal.ruleGroup == 'purchaseFloatRange') {
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
        }
      });
      v.assignModal.ruleGroup = '';
      v.assignModal.modalSelectionArr = [];
      v.assignModal.isShowAssignModal = false;
    },
    removeReviewer(index) {
      this.reviewer.conditionValueArr.splice(index, 1);
    },
    getSelectValue(selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    checkConditionChange(val) {
      if (val) {
        this.assignFn(this.conditionCheckedObj);
      }
      this.isSelectedConditionFn();
    },
    conditionCheckedFn(data) {
      this.conditionCheckedObj = this.deepCopy(data);
    },
    isSelectedConditionFn() { // 判断是否有选中
      let v = this;
      let isExist = false;
      v.optionalConditionArr.forEach((item) => {
        if (item.isCheck) {
          isExist = true;
        }
      });
      v.isSelectedCondition = !!isExist;
    },
    saveFn(name) { // 保存
      let v = this;
      let isSelected = false; // 是否选择了条件
      let conditionIsNull = ''; // 选择条件是否指定了内容
      let reviewerIsNull = false; // 添加的审核人是否为空
      v.optionalConditionArr.forEach((n, i) => {
        if (n.isCheck === true && (n.ruleGroup != 'auditer' 
        || n.ruleGroup != 'updateSupplierFlag' 
        || n.ruleGroup != 'numgreaterthan'
        || n.ruleGroup != 'freightCheckImport')) {
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
      if (v.reviewer.conditionValueArr.length == 0 && !this.isJumpReviewer) { // 未添加审核人时退出
        v.$Message.error('请添加审核人');
        return;
      }
      v.reviewer.conditionValueArr.forEach((n, i) => {
        if (!n.conditionValue) {
          reviewerIsNull = true;
        }
      });
      if (reviewerIsNull && !this.isJumpReviewer) { // 添加的审核人为空时退出
        v.$Message.error('请选择审核人');
        return;
      }
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.saveRuleLoading = true;
          v.combineContentFn();
          v.saveRuleFn();
          /* v.axios.post(api.saveBycheckAuditRules, v.checkRules)
           .then(res => {
           v.saveRuleLoading = false
           if(res.data.code == 0) {
           if(res.data.datas && res.data.datas.length > 0) {
           v.savaConflictRules = res.data.datas
           v.savaConflictRules.forEach((n, i)=> {
           n.conflictRulesList.forEach((m, j)=> {
           let str = m.ruleGroup == 'category'? '主营品类' : m.ruleGroup == 'developer'? '开发人' : m.ruleGroup == 'purchaser'? '采购人' : m.ruleGroup == 'priceRange'? '单价范围' : m.ruleGroup == 'floatingRange'? '上浮范围' : m.ruleGroup == 'auditer'? '审批人' : m.ruleGroup == 'suber'? '提交人' : m.ruleGroup == 'backupWarehouse' && v.pageParams.ruleType == '1'? '仓库' : m.ruleGroup == 'backupWarehouse' && v.pageParams.ruleType == '2'? '店铺' : m.ruleGroup == 'estimatedAmountRange'? '预计金额范围' : m.ruleGroup == 'numberRange'? '数量范围' : m.ruleGroup == 'goods'? '货品' : m.ruleGroup == 'goodsClassify'? '货品分类' : m.ruleGroup == 'purchaseWarehouse'? '采购仓库' : m.ruleGroup == 'purchaseAmountRange'? '采购金额范围' : m.ruleGroup == 'purchasePirceRange'? '采购单价范围' : m.ruleGroup == 'purchaseFloatRange'? '采购浮动范围' : m.ruleGroup == 'purchaseNumberRange'? '采购数量范围' : m.ruleGroup == 'updateSupplierFlag'? '更换供应商' : m.ruleGroup == 'numgreaterthan'? '采购总数量大于需求数量' : ''
           v.$set(m, 'sameField', str)
           })
           })
           v.isShowSaveCheckRules = true
           } else {
           v.saveRuleFn()
           }
           }
           }) */
        }
      });
    },
    combineContentFn() {
      let v = this;
      let conditionArr = [];
      let str = '';
      v.optionalConditionArr.forEach((n, i) => {
        if (!n.isCheck && n.ruleGroup != 'auditer') {
        } else if (n.ruleGroup == 'auditer') {
          v.reviewer.conditionValueArr.forEach((m, j) => {
            conditionArr.push(m);
          });
        } else if (n.ruleGroup == 'priceRange' || n.ruleGroup == 'floatingRange' || n.ruleGroup == 'estimatedAmountRange' || n.ruleGroup == 'numberRange' || n.ruleGroup == 'purchaseAmountRange' || n.ruleGroup == 'purchasePirceRange' || n.ruleGroup == 'purchaseFloatRange') {
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
      // 当为账单及抵退货款审核设置时需要添加可选模块参数
      v.pageParams.ruleType == '6' ? v.checkRules.selectModule = v.selectModule.join(',') : null
    },
    saveRuleFn() {
      let v = this;
      v.axios.post(api.saveAuditRules, v.checkRules).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('保存成功');
          v.getList();
          v.isShowAddRules = false;
          /* if(v.isShowSaveCheckRules) {
           v.isShowSaveCheckRules = false
           }
           v.isShowAddRules = false
           if(v.isShowCheckRules) {
           v.getCheckRulesFn()
           } else {
           v.getList()
           } */
        }
        v.saveRuleLoading = false;
      });
    },
    keepSaveFn() {
      this.saveRuleFn();
    },
    intiBaseDataList() {
      let v = this;
      v.axios.get(api.userList).then(res => {
        if (res.data.code == 0) {
          // v.developerArr = res.data.datas
          let arr = [];
          let datas = res.data.datas;
          v.personOpenArr = [];
          for (let i in datas) {
            if (i != 'service') {
              arr.push({
                id: i,
                name: datas[i].userName
              });
              if(datas[i].status == 1) {
                v.personOpenArr.push({
                  id: i,
                  name: datas[i].userName
                });
              }
            }
          }
          v.assignSelectArr.developer = arr;
          v.assignSelectArr.purchaser = arr;
          v.assignSelectArr.suber = arr;
          v.assignSelectArr.auditer = v.personOpenArr;
          // v.assignSelectArr.auditer = arr;
          v.assignSelectArr.creator = arr;
        }
      });
      v.axios.post(api.categoryQuery, {}).then(res => {
        if (res.data.code == 0) {
          v.assignSelectArr.category = res.data.datas.list;
        }
      });
      v.axios.post(api.warehouse, {}).then(res => {
        if (res.data.code == 0) {
          v.assignSelectArr.fbaBackupWarehouse = [];
          v.assignSelectArr.backupWarehouse = res.data.datas;
          v.assignSelectArr.purchaseWarehouse = res.data.datas;
          v.assignSelectArr.stockApplyWarehouse = res.data.datas;
          res.data.datas.forEach(n => {
            if (n.warehouseType === '1' && n.shopName) {
              v.assignSelectArr.fbaBackupWarehouse.push(n);
            }
          });
        }
      });
    },
    // 获取到可用模块
    getModule(val) {
      this.assignModal.selectedValueArr = this.assignModal.selectedValueArr.filter(item => val.includes(item.conditionValue))
    },
    // 获取账单及退抵货款审核规则数组
    getBillAndRefundOfLoansArr(newVal, oldVal, type) {
      if (newVal.includes('1') && !oldVal.includes('1')) {
          this.billAndRefundOfLoansArr.push({
            isCheck: false,
            ruleGroup: 'stockApply',
            ruleGroupName: '入库金额退抵方式',
            conditionValueArr: []
          },
          {
            isCheck: false,
            ruleGroup: 'stockApplyWarehouse',
            ruleGroupName: '免待寄出流程仓库',
            conditionValueArr: []
          },
          );
        } else if(oldVal.includes('1') && !newVal.includes('1')) {
          this.billAndRefundOfLoansArr = 
          this.billAndRefundOfLoansArr.filter(item => item.ruleGroupName !== '入库金额退抵方式' && item.ruleGroupName !== '免待寄出流程仓库')
        }

        if (newVal.includes('2') && !oldVal.includes('2')) {
          this.billAndRefundOfLoansArr.push(
            {
              isCheck: false,
              ruleGroup: 'freightCheck',
              ruleGroupName: '运费金额退抵方式',
              conditionValueArr: []
            },
            {
              isCheck: false,
              ruleGroup: 'freightCheckImport',
              ruleGroupName: '运费导入',
              conditionValueArr: [
                {
                  conditionId: '', // 条件id
                  conditionValue: '', // 条件值
                  ruleGroup: 'freightCheckImport',
                  supplierRuleConditionId: null, // 新增时为Null
                  supplierRuleId: null // 新增时为Null
                }
              ]
            }
          );
        }else if(oldVal.includes('2') && !newVal.includes('2')) {
          this.billAndRefundOfLoansArr = 
          this.billAndRefundOfLoansArr.filter(item => item.ruleGroupName !== '运费金额退抵方式' && item.ruleGroupName !== '运费导入')
        }

        if (newVal.includes('3') && !oldVal.includes('3')) {
          this.billAndRefundOfLoansArr.push(
            {
              isCheck: false,
              ruleGroup: 'billApplyStatus',
              ruleGroupName: '账单状态',
              conditionValueArr: []
            },
            {
              isCheck: false,
              ruleGroup: 'billApplyAll',
              ruleGroupName: '账单汇总',
              conditionValueArr: []
            }
          );
        }else if(oldVal.includes('3') && !newVal.includes('3')) {
          this.billAndRefundOfLoansArr = 
          this.billAndRefundOfLoansArr.filter(item => item.ruleGroupName !== '账单状态' && item.ruleGroupName !== '账单汇总')
        }
        return this.billAndRefundOfLoansArr
    },
    enterReviewerIdFn(item,index) {
      if (this.choseAuditer.indexOf(item.id) === -1) {
        let id = null
        this.assignSelectArr.auditer.forEach(obj => {
          if(item.conditionValue == obj.name) {
            id = obj.id
          }
        })
        this.reviewer.conditionValueArr[index].conditionId = id;
      }
    },
    selectModuleFn(val) {
      // 处理在编辑状态下，将所有可选模块置空之后再选择可选模块，导致无法触发添加可用条件问题
     if(val.length == 0) {
      this.modalParams.isNew = true
     }
    }
  }
};
</script>
