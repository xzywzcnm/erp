<style scoped>
.deleteTip {
  padding: 20px 30px;
  font-size: 16px;
}
.card-content {
  border-color: #ffff;
}
</style>
<style>
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}
</style>
<template>
  <div>
    <template v-if="purchaseShow === 'stockingPlan'">
      <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs
            v-model="pageParams.status"
            @on-click="showCurrentPage"
            style="background: #ffff; padding: 0px 10px"
          >
            <TabPane
              v-for="item in tabItems"
              :label="item.value"
              :key="item.key"
              :name="String(item.key)"
            ></TabPane>
          </Tabs>
        </template>
      </div>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="120">
                <dyt-filter v-if="!isCancel">
                  <FormItem label="仓库类型" prop="backupWarehouseType">
                    <dyt-select
                      v-model="pageParams.backupWarehouseType"
                      clearable
                      @on-change="warehouseTypeChange"
                      placeholder="请选择"
                    >
                      <Option
                        v-for="(item, index) in warehouseTypeArr"
                        :value="item.value"
                        :key="index"
                        >{{ item.typeDesc }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="备货仓库" prop="backupWarehouseId">
                    <dyt-select
                      ref="backupWarehouseId"
                      v-model="pageParams.backupWarehouseId"
                      filterable
                      clearable
                      @on-open-change="warehouseOpen"
                    >
                      <Option
                        v-for="(item, index) in backupWarehouseArr"
                        :value="item.warehouseId"
                        :key="index"
                        >{{ item.warehouseName }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="提交人" prop="submitterId">
                    <dyt-select
                      v-model="pageParams.submitterId"
                      clearable
                      filterable
                      placeholder="请选择"
                    >
                      <Option
                        v-for="(item, index) in submitterArr"
                        :value="item.id"
                        :key="index"
                        >{{ item.name }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem class="form-item-label">
                    <dyt-select
                      slot="label"
                      v-model="pageParams.skuOrNameType"
                      style="width: 110px"
                      @on-change="searchTypeChangeFn"
                    >
                      <Option
                        v-for="item in searchTypeArr"
                        :value="item.key"
                        :key="item.type"
                        >{{ item.value }}</Option
                      >
                    </dyt-select>
                    <dyt-input-tag
                      v-model="pageParams.numOrSku"
                      :limit="1"
                      :string="true"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="提交时间" prop="submitTimeArr">
                    <Date-picker
                      transfer
                      type="datetimerange"
                      split-panels
                      @on-clear="resetDate('submit')"
                      @on-change="(val) => { getDateValue(val, 'submit') }"
                      :clearable="true"
                      format="yyyy-MM-dd HH:mm:ss"
                      style="width: 100%"
                      placeholder="选择日期"
                      :options="dateOptions"
                      placement="bottom-end"
                      v-model="submitTimeArr"
                    />
                  </FormItem>
                  <FormItem label="备货类型" prop="readyType">
                    <dyt-select
                      v-model="pageParams.readyType"
                      filterable
                      clearable
                    >
                      <Option
                        v-for="(item, index) in purchaseTypeArr"
                        :value="item.key"
                        :key="index"
                        >{{ item.value }}</Option
                      >
                    </dyt-select>
                  </FormItem>

                  <FormItem label="质检类型" prop="checkTypeList">
                    <dyt-select
                      v-model="pageParams.checkTypeList"
                      filterable
                      clearable
                      multiple
                    >
                      <Option :value="0">免检</Option>
                      <Option :value="1">抽检</Option>
                      <Option :value="2">全检</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="下单情况" prop="cancel">
                    <dyt-select
                      v-model="pageParams.cancel"
                      filterable
                      clearable
                    >
                      <Option :value="1">有作废</Option>
                      <Option :value="0">无作废</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="所属事业部" prop="businessDeptId">
                    <dyt-select
                      v-model="pageParams.businessDeptId"
                      filterable
                      clearable
                    >
                      <Option
                        v-for="item in allowBusinessDept"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      ></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="平台主体：" prop="platformSubject">
                    <dyt-select
                      v-model="pageParams.platformSubject"
                      filterable
                    >
                      <Option
                        v-for="(item, index) in platformEntityArr"
                        :value="item.value"
                        :key="index"
                        >{{ item.label }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="店铺：" prop="saleAccountId">
                    <dyt-select
                      v-model="pageParams.saleAccountId"
                      filterable
                      @on-open-change="saleAccountIdOpen"
                    >
                      <Option
                        v-for="(item, index) in selectedAccountsArr"
                        :value="item.saleAccountId"
                        :key="index"
                        >{{ item.accountCode }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="search"
                      :disabled="SearchDisabled"
                      icon="ios-search"
                      >搜索</Button
                    >
                    <Button
                      @click="reset"
                      style="margin-left: 10px"
                      v-once
                      icon="md-refresh"
                      >重置</Button
                    >
                  </div>
                </dyt-filter>
                <dyt-filter v-else>
                    <FormItem label="备货类型" prop="readyTypeList">
                    <dyt-select
                      v-model="cancelPageParams.readyTypeList"
                      filterable
                      clearable
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="(item, index) in purchaseTypeArr"
                        :value="item.key"
                        :key="index"
                        >{{ item.value }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="备货仓库" prop="backupWarehouseIdList">
                    <dyt-select
                      ref="warehouseId"
                      v-model="cancelPageParams.backupWarehouseIdList"
                      filterable
                      clearable
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="(item, index) in warehouseArr"
                        :value="item.warehouseId"
                        :key="index"
                        >{{ item.warehouseName }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="取消时间" prop="cancelTimeArr">
                    <Date-picker
                      transfer
                      type="datetimerange"
                      split-panels
                      @on-clear="resetDate('cancel')"
                      @on-change="(val) => { getDateValue(val, 'cancel') }"
                      :clearable="true"
                      format="yyyy-MM-dd HH:mm:ss"
                      style="width: 100%"
                      placeholder="选择日期"
                      :options="dateOptions"
                      placement="bottom-end"
                      v-model="cancelTimeArr"
                    />
                  </FormItem>
                  <FormItem label="备货计划编号" prop="planSerialNumberList">
                    <dyt-input-tag
                      v-model="cancelPageParams.planSerialNumberList"
                      :limit="1"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="采购单号" prop="purchaseNumberList">
                    <dyt-input-tag
                      v-model="cancelPageParams.purchaseNumberList"
                      :limit="1"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="SPU" prop="spuList">
                    <dyt-input-tag
                      v-model="cancelPageParams.spuList"
                      :limit="1"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="SKU" prop="skuList">
                    <dyt-input-tag
                      v-model="cancelPageParams.skuList"
                      :limit="1"
                      placeholder="多个用逗号或换行分隔"
                      type="textarea"
                    />
                  </FormItem>
                  <FormItem label="计划人" prop="planCreateByList">
                    <dyt-select
                      v-model="cancelPageParams.planCreateByList"
                      clearable
                      filterable
                      placeholder="请选择"
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="(item, index) in submitterArr"
                        :value="item.id"
                        :key="index"
                        >{{ item.name }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="所属事业部" prop="businessDeptIdList">
                    <dyt-select
                      v-model="cancelPageParams.businessDeptIdList"
                      filterable
                      clearable
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="item in allowBusinessDept"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                      ></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="平台主体：" prop="platformSubject">
                    <dyt-select
                      v-model="cancelPageParams.platformSubject"
                      filterable
                    >
                      <Option
                        v-for="(item, index) in platformEntityArr"
                        :value="item.value"
                        :key="index"
                        >{{ item.label }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="店铺：" prop="accountCodeList">
                    <dyt-select
                      v-model="cancelPageParams.accountCodeList"
                      filterable
                      @on-open-change="saleAccountIdOpen"
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="(item, index) in selectedAccountsArr"
                        :value="item.saleAccountId"
                        :key="index"
                        >{{ item.accountCode }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="search"
                      :disabled="SearchDisabled"
                      icon="ios-search"
                      >搜索</Button
                    >
                    <Button
                      @click="resetCancel"
                      style="margin-left: 10px"
                      v-once
                      icon="md-refresh"
                      >重置</Button
                    >
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <!-- <Button
            type="primary"
            v-if="getPermission('stockUpPlan_save')"
            class="iconbuttons"
            @click="addLcPlanFn"
            style="margin-left: 12px"
          >
            新建自营仓备货计划
          </Button> -->
          <!-- <Button
            type="primary"
            v-if="getPermission('stockUpPlan_save')"
            class="iconbuttons"
            @click="addOsPlanFn"
            style="margin-left: 12px"
          >
            新建海外仓备货计划</Button
          > -->
          <!-- <Button type="primary" v-if="getPermission('stockUpPlan_save')" class="iconbuttons" @click="addFBAPlanFn" style="margin-left: 12px">
            新建FBA备货计划 </Button> -->
          <Button
            type="primary"
            v-if="getPermission('stockUpPlan_save') && !isCancel"
            class="iconbuttons"
            @click="newAddPlan"
            style="margin-left: 12px"
          >
            新建备货计划</Button
          >
          <Dropdown
            @on-click="clickDrop"
            v-if="getPermission('stockUpPlan_exportByIds') && !isCancel"
            style="margin-left: 12px"
          >
            <Button type="primary" style="margin-left: 12px"
              ><span class="icon iconfont" style="font-size: 12px"
                >&#xe639;</span
              >
              Excel导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <!-- 采购取消导出 -->
          <Dropdown
            @on-click="exportCancel"
            v-if="getPermission('purchaseCancel_export') && isCancel"
            style="margin-left: 12px"
          >
            <Button type="primary" style="margin-left: 12px"
              ><span class="icon iconfont" style="font-size: 12px"
                >&#xe639;</span
              >
              Excel导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">导出选中数据</DropdownItem>
              <DropdownItem name="1">导出所有结果集</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
      <!-- <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="pageParams.status" @on-click="showCurrentPage">
            <TabPane
              v-for="item in tabItems"
              :label="item.value"
              :key="item.key"
              :name="String(item.key)"
            ></TabPane>
          </Tabs>
        </template>
      </div> -->
      <div class="commonFilter">
        <div class="orderTable">
          <keep-alive>
            <Table
              v-if="!isCancel"
              ref="managementTable"
              highlight-row
              :border="true"
              :height="tableHeight"
              :loading="Tableloading"
              :columns="stockColumn"
              :data="stockData"
              @on-selection-change="getSelectValue"
            >
              <template slot-scope="{ row }" slot="planSerialNumber">
                <div style="text-align: left">
                  <span>计划编号：</span>
                  <span
                    style="
                      color: #2d8cf0;
                      cursor: pointer;
                      text-decoration: underline;
                    "
                    @click="seeDetail(row.planId)"
                    >{{ row.planSerialNumber }}</span
                  >
                </div>

                <div style="display: flex; flex-wrap: wrap">
                  <div
                    style="
                      width: 50px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                    "
                    v-if="row.readyType == 0"
                  >
                    急采
                  </div>

                  <div
                    style="
                      width: 60px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.readyType == 1"
                  >
                    普通备货
                  </div>
                  <div
                    style="
                      width: 60px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.readyType == 2"
                  >
                    海外仓备货
                  </div>
                  <div
                    style="
                      width: 50px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.readyType == 3"
                  >
                    FBA备货
                  </div>
                  <div
                    style="
                      width: 60px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.readyType == 4"
                  >
                  全托管备货
                  </div>
                  <div
                    style="
                      width: 60px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.readyType == 5"
                  >
                  直发备货
                  </div>
                  <div
                    style="
                      width: 50px;
                      background: #f2f2f2;
                      color: rgb(60, 176, 52);
                      margin-right: 10px;
                      margin-top: 5px;
                    "
                    v-if="row.status != 4"
                  >
                    {{ row.statusName }}
                  </div>
                  <div
                    style="
                      width: 50px;
                      background: #f9e8f4;
                      color: #eb3223;
                      margin-right: 10px;
                      margin-top: 5px;
                    "
                    v-if="row.status == 4"
                  >
                    取消备货
                  </div>
                  <div
                    style="
                      width: 50px;
                      background: #f9e8f4;
                      color: #eb3223;
                      margin-right: 10px;
                      margin-top: 5px;
                    "
                    v-if="row.cancel == 1"
                  >
                    有作废
                  </div>
                  <div
                    style="
                      width: 60px;
                      background: #e5f3fd;
                      color: #34a3f0;
                      margin-top: 5px;
                      margin-right: 10px;
                    "
                    v-if="row.businessDeptName"
                  >
                    {{ row.businessDeptName }}
                  </div>
                </div>
              </template>
            </Table>
            <Table
              v-else
              ref="managementTable"
              highlight-row
              :border="true"
              :height="tableHeight"
              :loading="Tableloading"
              :columns="cancelColumn"
              :data="cancelData"
              @on-selection-change="getCancelSelectValue"
            >
            <template slot-scope="{ row }" slot="cancelGoods">
              <!-- 取消商品 -->
              <div class="mt10 mb10 flexBox">
                <large-picture :url="row.imagePath" :imageHigh="'60px'">
                <slot name="picslot"></slot>
              </large-picture>
              <div class="ml10">
                 <div>
                   SKU: {{ row.sku }}
                 </div>
                 <div>
                    {{ row.productName }}
                 </div>
                 <div style="color: green">
                   {{ row.specifications }}
                 </div>
              </div>
              </div>
            </template>
            </Table>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
                <Page
                  v-if="!isCancel"
                  :total="total"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="pageParams.pageNum"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray"
                ></Page>
                <Page
                  v-else
                  :total="total"
                  @on-change="changePage"
                  show-total
                  :page-size="cancelPageParams.pageSize"
                  show-elevator
                  :current="cancelPageParams.pageNum"
                  show-sizer
                  @on-page-size-change="changeCancelPageSize"
                  placement="top"
                  :page-size-opts="pageArray"
                ></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </template>
    <transition name="bounce">
      <template v-if="purchaseShow === 'addStockingPlan'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBackFromAddPlan">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
          </div>
          <div class="mainContent">
            <addStockingPlan
              :plans="planDatas"
              :plansType="plansType"
              :isEdit="isEdit"
              :houseType="houseType"
              @addPlanGoBack="addPlanGoBack"
            ></addStockingPlan>
          </div>
        </div>
      </template>
    </transition>
    <!--删除提示-->
    <Modal v-model="isShowDeleteTip" :width="400" title="提示">
      <div class="deleteTip">确定删除此备货计划？</div>
      <div slot="footer">
        <Button
          type="primary"
          @click="delPlanFn"
          style="width: 80px; margin-right: 30px"
          >确定</Button
        >
        <Button
          type="primary"
          @click="isShowDeleteTip = false"
          style="width: 80px"
          >关闭</Button
        >
      </div>
    </Modal>
    <!--备货计划相关联采购单-->
    <Modal
      v-model="isShowCorrelative"
      @on-visible-change="showCorrelativeChange"
      :width="720"
      title="备货计划相关联采购单"
    >
      <div>
        <div>
          <Input
            v-model.trim="purchaseOrder.sku"
            style="width: 350px; margin: 0 auto"
            placeholder="SKU搜索"
          >
            <Button
              slot="append"
              icon="ios-search"
              type="primary"
              @click="seeRelatedOrderBySku"
            ></Button>
          </Input>
        </div>
        <div class="normalTop20">
          <Table
            highlight-row
            border
            :columns="purchaseOrder.orderColumn"
            :data="purchaseOrder.orderData"
          ></Table>
        </div>
      </div>
      <div slot="footer">
        <Button
          type="primary"
          @click="isShowCorrelative = false"
          size="large"
          style="width: 80px; margin-right: 30px"
          >关闭
        </Button>
      </div>
    </Modal>
    <Modal v-model="model2" title="温馨提示">
      <p>您是否需要在表格中导出产品图片</p>
      <RadioGroup v-model="exportImgSetting">
        <Radio :label="0">不导出图片</Radio>
        <Radio :label="1">导出图片</Radio>
      </RadioGroup>
      <div slot="footer">
        <Button type="text" @click="model2 = false">取消</Button>
        <Button type="primary" @click="exportMt">导出</Button>
      </div>
    </Modal>
    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="purchaseShow === 'showOrderDetail'">
        <div class="subLayer infoDetails">
          <div>
            <purchase-detail
              :dialogObj="dialogDetail"
              @getList="getList"
              @goBackFromAdd="goBack"
              :showType="1"
            ></purchase-detail>
          </div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import addStockingPlan from "./common/addStockingPlan";
import largePicture from "@/components/largePicture";
import purchaseDetail from "../../../supplierPurchase/purchaseManagement/supplyOrder/purchaseDetail";



export default {
  mixins: [Mixin, tableMixin],
  components: { addStockingPlan, largePicture, purchaseDetail },
  data() {
    let self = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      model2: false,
      exportImgSetting: 0,
      exportType: null,
      houseType: "",
      purchaseShow: "stockingPlan",
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(340),
      totalPage: 0,
      total: 0,
      curPage: 1,
      planCurrentTabItem: null, // 备货计划标签页
      planTabItems: [], //
      operationType: "",
      plansType: "", // 1:新增、2：查看、3：编辑、4：审核
      isEdit: false, // 是否可编辑
      isShowDeleteTip: false, // 删除提示
      isShowCorrelative: false, // 备货计划相关联采购单
      searchTypeArr: [
        {
          key: 1,
          value: "备货计划编号",
        },
        {
          key: 2,
          value: "SKU编号",
        },
      ],
      warehouseTypeArr: [],
      backupWarehouseArr: [],
      platformEntityArr: [
        { label: 'Temu' , value: 'Temu' },
        { label: 'shein' , value: 'shein' },
        { label: 'tiktok' , value: 'tiktok' }
      ],
      accountsArr: [],
      selectedAccountsArr: [],
      purchaseTypeArr: [
        {
          key: "0",
          value: "急采",
        },
        {
          key: "1",
          value: "普通备货",
        },
        {
          key: "2",
          value: "海外仓备货",
        },
        {
          key: "3",
          value: "FBA备货",
        },
        {
          key: "4",
          value: "全托管备货",
        },
        {
          key: "5",
          value: "直发备货",
        },
      ],
      purchaseTypeArr1: {
        0: "急采",
        1: "普通备货",
        2: "海外仓备货",
        3: "FBA备货",
        4: "全托管备货",
        5: "直发备货",
      },
      warehouseArr: [],
      submitterArr: [],
      submitTimeArr: [start, end],
      cancelTimeArr: [start, end],
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        backupWarehouseId: "", // 备货仓库Id
        readyType: "", //备货类型
        status: "0", // 审批状态（null全部,1待提交，2待审核，3已审核，4取消备货）
        backupWarehouseType: "",
        planSerialNumber: "",
        skuList: [],
        submissionAtFirstTime: "",
        submissionDeadline: "",
        submitterId: "",
        numOrSku: "",
        skuOrNameType: 1,
        checkTypeList: [], //质检类型
        cancel: null, //下单情况
        businessDeptId: "",
        platformSubject: "", // 平台主体
        saleAccountId: "", // 店铺ID
      },
      cancelPageParams: {
        backupWarehouseIdList: [],
        readyTypeList: [],
        skuList: [],
        planSerialNumberList: [],
        purchaseNumberList: [],
        spuList: [],
        platformSubject: "", // 平台主体
        accountCodeList: [],
        cancelStartTime: '',
        cancelEndTime: '',
        businessDeptIdList: [],
        planCreateByList: [],
        pageNum: 1,
        pageSize: 10,
      },
      tabItems: [
        {
          key: "0",
          value: "全部",
        },
        {
          key: "1",
          value: "待提交",
        },
        {
          key: "2",
          value: "待审核",
        },
        {
          key: "3",
          value: "已审核",
        },
        {
          key: "4",
          value: "取消备货",
        },
        {
          key: "5",
          value: "采购取消记录",
        },
      ],
      delPlan: {
        planId: "",
      },
      relatedOrderPlanId: "",
      selectionArr: [], // 已选中表格行数据
      selectionCancelArr: [], // 已选中采购取消表格行数据
      stockData: [], // 主table
      cancelData: [], // 采购取消订单table
      stockColumn: [],
      cancelColumn: [],
      planDatas: {},
      lcPlans: {
        suggestType: 0,
        backupWarehouseType: "0",
        createdName:
          this.$store.state.userName ||
          sessionStorage.getItem("userName") ||
          "",
        purchaseWarehouseId: "",
        purchaseWarehouseName: "",
        backupWarehouseId: "",
        backupWarehouseName: "",
        remark: "",
        planDetailsList: [],
        skuQuantity: 0,
        estimatedAmount: 0,
      },
      osPlans: {
        suggestType: 1,
        backupWarehouseType: "1",
        createdName:
          this.$store.state.userName ||
          sessionStorage.getItem("userName") ||
          "",
        purchaseWarehouseId: "",
        purchaseWarehouseName: "",
        backupWarehouseId: "",
        backupWarehouseName: "",
        remark: "",
        planDetailsList: [],
        skuQuantity: 0,
        estimatedAmount: 0,
        platformSubject: "", // 平台主体
        saleAccountId: "", // 店铺ID
        platformOrderNo: '' // 平台订单号
      },
      fbaPlans: {
        suggestType: 2,
        backupWarehouseType: "2",
        createdName:
          this.$store.state.userName ||
          sessionStorage.getItem("userName") ||
          "",
        purchaseWarehouseId: "",
        purchaseWarehouseName: "",
        backupWarehouseId: "",
        backupWarehouseName: "",
        remark: "",
        planDetailsList: [],
        skuQuantity: 0,
        estimatedAmount: 0,
      },
      warehouse: {
        transWarehouse: "",
      },
      purchaseOrder: {
        sku: "",
        orderData: [],
        orderColumn: [
          {
            key: "purchaseNumber",
            align: "center",
            title: "采购单号",
          },
          {
            key: "createdTime",
            align: "center",
            title: "生成日期",
            render: (h, params) => {
              return (
                "span",
                self.getDataToLocalTime(params.row.createdTime, "fulltime")
              );
            },
          },
          {
            key: "purchaseStatus",
            align: "center",
            title: "采购入库单状态",
            render(h, params) {
              /*
               *  {
               value: '入库单创建',
               key: 0
               },
               {
               value: '入库单关闭',
               key: 2
               },
               {
               value: '收货中',
               key: 3
               }
               * */
              let status = params.row.purchaseStatus;
              let str =
                status === 0
                  ? "入库单创建"
                  : status === 2
                  ? "入库单关闭"
                  : status === 3
                  ? "收货中"
                  : "";
              return h("span", str);
            },
          },
        ],
      },
      ruleValidate: {
        transWarehouse: [
          {
            required: true,
            message: "不能为空",
            trigger: "change",
          },
        ],
      },
      dialogDetail: {
        data: {},
        supplyList: {},
      },
    };
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
    'pageParams.platformSubject': {
      handler(newVal, oldVal) {
        this.selectedAccountsArr = this.accountsArr.filter(item => item.platformId == newVal)
      }
    },
    'cancelPageParams.platformSubject': {
      handler(newVal, oldVal) {
        this.selectedAccountsArr = this.accountsArr.filter(item => item.platformId == newVal)
      }
    }
  },
  created() {
    this.pageParams.pageSize = this.getPageSizeCache();
    this.getAccounts()
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"] || {};
    },
    // 获取当前登录账号可查看的事业部数据信息
    allowBusinessDept () {
      return this.$store.getters['allowBusinessDept'];
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds () {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
    // 是否为采购取消记录栏
    isCancel() {
      return this.pageParams.status == '5'
    }
  },
  activated() {
    this.reset();
    this.intiBaseDataList();
    this.startLoading();
    this.resetCancel()
  },
  methods: {
    searchTypeChangeFn() {
      this.pageParams.numOrSku = "";
    },
    clickDrop(value) {
      this.exportType = value;
      this.model2 = true;
    },
    exportCancel(val) {
      let params = {}
      let purchaseCancelIdList = []
      if(val == '0') {
        if(this.selectionCancelArr.length === 0) {
          this.$Message.error("未选择数据");
          return;
        }
        purchaseCancelIdList = this.selectionCancelArr.map(item => item.purchaseCancelId)
      } 
      this.getDateValue(this.cancelTimeArr, 'cancel');
      params = val == '0' ? {
        purchaseCancelIdList: purchaseCancelIdList
      } : this.getPageParams();
      this.axios.post(api.export_purchaseCancel, params).then((res) => {
        if (res.data.code == 0) {
          this.$Message.success("导出成功");
        }
      });
    },
    exportMt() {
      let v = this;
      let value = v.exportType;
      if (value === "0") {
        // 选中导出
        if (v.selectionArr.length === 0) {
          v.$Message.error("未选择数据");
          return;
        }
        let palanIds = this.selectionArr.map((i) => i.planId);
        v.batchExport({
          planIds: palanIds,
          isExportImage: v.exportImgSetting,
        });
      } else {
        // 所有导出
        v.exportEcxel();
      }
    },
    batchExport(planIds) {
      /**
       * params
       * planIds 备货计划id
       * */
      let v = this;
      // 选中导出
      v.axios
        .post(api.export_planByIds, planIds)
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("导出成功");
            v.selectionArr = this;
            v.pageParamsStatus = true; // 刷新list
            // window.location.href = v.$store.state.imgUrl +   response.data.datas;
          }
        })
        .catch(() => {});
    },
    startLoading() {
      this.$Loading.start();
      this.getList();
    },
    // 获取筛选条件
    getPageParams () {
      let params  = this.$common.copy(this.isCancel ? this.cancelPageParams : this.pageParams);
      params.businessDeptIds = this.allowBusinessDeptIds;
      params.status = params.status == "0" ? null : Number(params.status);
      if(!this.isCancel){
        for (let index in params) {
          params[index] = params[index] || null;
        }
        if (params.readyType == "0" || params.readyType == "1") {
          params.readyType = Number(params.readyType);
        }
        if (params.skuOrNameType === 1) {
        // 备货计划编号
          params.planSerialNumberList = this.sepCommasFn(params.numOrSku);
          params.skuList = null;
        } else if (params.skuOrNameType === 2) {
        // SKU
          params.skuList = this.sepCommasFn(params.numOrSku);
          params.planSerialNumberList = null;
        }
      }
      for (let key in params) {
        if(this.$common.isEmpty(params[key])) {
          delete params[key]
        }
      }
      return params;
    },
    getList() {
      // 獲取分頁
      let v = this;
      if ((!v.getPermission("stockUpPlan_list") && !this.isCancel) ||(!v.getPermission("purchaseCancel_queryPage") && this.isCancel)) {
        v.$Message.error("无权限");
        return;
      }
      if(v.isCancel) {
        v.getDateValue(v.cancelTimeArr, 'cancel');
      } else {
        v.getDateValue(v.submitTimeArr, 'submit');
      }
      v.selectionArr = [];
      v.selectionCancelArr = []
      const params = this.getPageParams();
      v.Tableloading = true;
      v.SearchDisabled = true;
      let reqApi = this.isCancel ? api.cancelList : api.planList
      v.axios.post(reqApi, params).then((res) => {
        v.Tableloading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          !v.isCancel ? v.stockData = res.data.datas.list : v.cancelData = res.data.datas.list
          v.total = res.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    changePage(page) {
      let v = this;
      v.$Loading.start();
      v.isCancel ? v.cancelPageParams.pageNum = page : v.pageParams.pageNum = page;
      v.getList();
    },
    changeCancelPageSize(val) {
      this.$Loading.start();
      this.cancelPageParams.pageSize = val 
      this.getList();
    },
    reset() {
      this.purchaseShow = "stockingPlan";
      this.$nextTick(() => {
        this.$refs["pageParams"].resetFields();
      });
      this.pageParams.numOrSku = null;
      this.pageParams.skuOrNameType = 1;
      this.pageParams.status = "0";
      this.selectionArr = [];
      this.getColumns(0);
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.submitTimeArr = [start, end];
      this.pageParams.submissionAtFirstTime = "";
      this.pageParams.submissionDeadline = "";
    },
    resetCancel() {
      this.purchaseShow = "stockingPlan";
      this.selectionCancelArr = []
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      this.cancelTimeArr = [start, end];
      this.cancelPageParams.cancelStartTime = start
      this.cancelPageParams.cancelEndTime = end
      this.cancelPageParams.backupWarehouseIdList = []
      this.cancelPageParams.skuList = []
      this.cancelPageParams.spuList = []
      this.cancelPageParams.accountCodeList = []
      this.cancelPageParams.businessDeptIdList = []
      this.cancelPageParams.planCreateByList = []
      this.cancelPageParams.planSerialNumberList = []
      this.cancelPageParams.platformSubject = null
      this.cancelPageParams.purchaseNumberList = []
      this.cancelPageParams.readyTypeList = []
    },
    search() {
      let v = this;
      v.pageParams.pageNum = 1;
      v.pageParams.planSerialNumber = "";
      v.pageParams.skuList = this.isCancel ? v.pageParams.skuList  : [];
      this.pageParamsStatus = true;
    },
    resetDate(type) {
      // 清空日期
      if(type == 'submit') {
        this.pageParams.submissionAtFirstTime = "";
        this.pageParams.submissionDeadline = "";
      } else {
        this.cancelPageParams.cancelStartTime = "";
        this.cancelPageParams.cancelEndTime = "";
      }
    },
    getDateValue(value, type) {
      // 获取日期返回值
      var v = this;
      v.resetDate('submit')
      v.resetDate('cancel')
      if(type == 'submit') {
        if (value[0] != "") {
          v.pageParams.submissionAtFirstTime = v.getDateTime(
            value[0],
            "fulltime"
          );
          v.pageParams.submissionDeadline = v.getDateTime(value[1], "fulltime");
        }
      } else {
        if (value[0] != "") {
          v.cancelPageParams.cancelStartTime = v.getDateTime(
            value[0],
            "fulltime"
          );
          v.cancelPageParams.cancelEndTime = v.getDateTime(value[1], "fulltime");
        }
      }
    },
    getSelectValue(selection) {
      // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    getCancelSelectValue(selection) {
      this.selectionCancelArr = selection;
    },
    warehouseTypeChange() {
      if(this.isCancel) return;
      let v = this;
      v.pageParams.backupWarehouseId = "";
      v.$refs["backupWarehouseId"].clearSingleSelect();
      v.backupWarehouseArr = [];
      if (v.pageParams.backupWarehouseType) {
        v.warehouseArr.forEach((item) => {
          if (v.pageParams.backupWarehouseType === item.warehouseType)
            v.backupWarehouseArr.push(item);
        });
      } else {
        v.backupWarehouseArr = [];
      }
    },
    warehouseOpen(val) {
      if (!val) return;
      if (!this.pageParams.backupWarehouseType &&  !this.isCancel) {
        this.$Message.warning("请先选择仓库类型");
      }
    },
    saleAccountIdOpen(val) {
      if (!val) return;
      if ((!this.pageParams.platformSubject && !this.isCancel) || (!this.cancelPageParams.platformSubject && this.isCancel)) {
        this.$Message.warning("请先选择平台主体");
      }
    },
    getColumns(type) {
      let v = this;
      v.pageParams.pageNum = 1;
      if(!this.isCancel) {
        v.stockColumn = [];
        const columns = [
          {
            type: "selection",
            width: 60,
            align: "center",
          },
          {
            key: "planSerialNumber",
            title: "备货计划",
            align: "center",
            width: 240,
            slot: "planSerialNumber",
          // render: (h, params) => {
          //   return [
          //     h(
          //       "span",
          //       {
          //         style: {},
          //       },
          //       `计划编号：`
          //     ),
          //     h(
          //       "span",
          //       {
          //         style: {
          //           color: "#2c74f6 ",
          //           textDecoration: "underline",
          //           cursor: "pointer",
          //         },
          //       },
          //       `${params.row.planSerialNumber}`
          //     ),
          //   ];
          // },
          },
          // {
          //   key: "readyType",
          //   title: "操作",
          //   align: "center",
          //   slot: "readyType",
          //   render: (h, params) => {
          //     let temp;
          //     if (params.row.status == 0) {
          //       temp = "提交";
          //     } else if (params.row.status == 1) {
          //       temp = "审核";
          //     }
          //     return [
          //       h(
          //         "div",
          //         {
          //           style: {
          //             color: "#001ef5",
          //             cursor: "pointer",
          //           },
          //         },
          //         temp
          //       ),
          //       h(
          //         "div",
          //         {
          //           style: {
          //             color: "#001ef5",
          //             cursor: "pointer",
          //           },
          //         },
          //         "取消备货"
          //       ),
          //     ];
          //   },
          // },
          // {
          //   key: "readyType",
          //   title: "备货类型",
          //   align: "center",
          //   render: (h, params) => {
          //     // if (params.row.purchaseType == 1) {
          //     //   return h('span', '急采');
          //     // } else {
          //     //   return h('span', '备货');
          //     // }
          //     return h("span", this.purchaseTypeArr1[params.row.readyType]);
          //   },
          // },
          //  {
          //   key: 'purchaseType',
          //   title: '采购类型',
          //   align: 'center',
          //   render: (h, params) => {
          //     if (params.row.purchaseType == 1) {
          //       return h('span', '急采');
          //     } else {
          //       return h('span', '备货');
          //     }
          //   }
          // },
          {
            key: "backupWarehouseName",
            align: "center",
            title: `平台主体/店铺`,
            width: "120",
            render: (h, params) => {
              return h('div', {}, [
                h('p', {}, params.row.platformSubject 
              ? params.row.platformSubject : '-'),
                h('p', {}, params.row.accountCode 
              ? params.row.accountCode : '-')
              ])
            },
          },
          {
            key: "backupWarehouseName",
            align: "center",
            title: `备货仓库/中转仓库`,
            width: "120",
            render: (h, params) => {
              return h('div', {}, [
                h('p', {class: params.row.warehouseStatus === "1" ? "red" : "",}, params.row.backupWarehouseName 
              ? params.row.backupWarehouseName : '-'),
                h('p', {class: params.row.purchaseWarehouseName === "1" ? "red" : "",}, params.row.purchaseWarehouseName 
              ? params.row.purchaseWarehouseName : '-')
              ])
            },
          },
          {
            key: "estimatedAmount",
            align: "center",
            title: "预计金额(CNY)",
            width: "120",
            render: (h, params) => {
            /* let amount = params.row.estimatedAmount.toFixed(2); */
            /* let currency = params.row.currency ? params.row.currency : ''; */
              if (params.row.estimatedAmount) {
                return h(
                  "span",
                  // v.getCurrency(
                  //   params.row.estimatedAmount,
                  //   params.row.currency,
                  //   2
                  // )
                  params.row.estimatedAmount
                );
              } else {
                return h("span", "-");
              }
            },
          },
          {
            key: "skuQuantity",
            align: "center",
            title: "SKU数量",
          },
          {
            key: "totalReplenishQuantity",
            align: "center",
            title: "备货数量",
          },
          {
            key: "totalPlanCheckNumber",
            align: "center",
            title: "应检数量",
          },
          {
            key: "totalCheckType",
            align: "center",
            title: "质检类型",
            render: (h, params) => {
              let temp = { 0: "免检", 1: "抽检", 2: "全检" };
              let totalCheckType = temp[params.row.totalCheckType];
              return h("span", `${totalCheckType}`);
            },
          },
          {
            key: "totalCheckRate",
            align: "center",
            title: "质检比例",
            render: (h, params) => {
              return h("span", `${params.row.totalCheckRate}%`);
            },
          },
          {
            key: "remark",
            align: "center",
            title: "备货备注",
            tooltip: true,
          },
          {
            key: "submitterName",
            align: "center",
            title: "提交人",
          },
          // {
          //   key: "statusName",
          //   align: "center",
          //   title: "状态",
          // },
          /* {
         key: 'reviewer',
         align: 'center',
         title: '当前审核人'
         }, */ 
          {
            key: "submissionTime",
            align: "center",
            title: "提交时间",
            width: "100",
            render: (h, params) => {
              if (params.row.submissionTime) {
                return h(
                  "span",
                  v.getDataToLocalTime(params.row.submissionTime, "fulltime")
                );
              } else {
                return h("span", "-");
              }
            },
          },

          {
            key: "operation",
            align: "center",
            width: 150,
            fixed: "right",
            title: "操作",
            render: (h, params) => {
            // if (true) {
              return h("div", [
                !v.getPermission("stockUpPlan_info") ||
                h(
                  "Buttons",
                  {
                    props: {
                      trigger: "click",
                      transfer: true,
                    },
                    class: "defaultStyle trimming",
                    on: {
                      "on-click": (val) => {
                        v.stockData.forEach((item, i) => {
                          delete item["_checked"];
                        });
                        v.$set(v.stockData[params.index], "_checked", true);
                        v.selectionArr = [];
                        v.selectionArr.push(params.row);
                        switch (val) {
                          case "1":
                            v.seePlanDetailsFn(true, "3", params.row.planId);
                            break;
                          case "2":
                            v.delPlan.planId = params.row.planId;
                            v.isShowDeleteTip = true;
                            break;
                          case "3":
                            v.seePlanDetailsFn(false, "4", params.row.planId);
                            break;
                          case "4":
                            break;
                          case "5":
                            v.relatedOrderPlanId = params.row.planId;
                            v.seeRelatedOrder(params.row);
                            break;
                          case "6":
                            v.seePlanDetailsFn(false, "2", params.row.planId);
                            break;
                        }
                      },
                    },
                  },
                  [
                    h(
                      "Button",
                      {
                        type: "default",
                        class: "iconbuttons",
                        on: {
                          click() {
                            if (v.pageParams.status == "1") {
                              v.seePlanDetailsFn(true, "3", params.row.planId);
                            } else if (
                              v.getPermission("stockUpPlan_audit") &&
                              v.pageParams.status == "2"
                            ) {
                              v.seePlanDetailsFn(false, "4", params.row.planId);
                            } else {
                              v.seePlanDetailsFn(false, "2", params.row.planId);
                            }
                          },
                        },
                        props: {
                          disabled:
                            v.pageParams.status == "2" &&
                            v.isSelf(params.row.createdBy) &&
                            !v.isSelf(params.row.auditPersonIds),
                        },
                      },
                      v.pageParams.status == "1"
                        ? "编辑"
                        : v.getPermission("stockUpPlan_audit") &&
                          v.pageParams.status == "2"
                        ? "审核"
                        : "查看"
                    ),
                    h(
                      "Buttons-menu",
                      {
                        slot: "list",
                      },
                      [
                        h(
                          "Buttons-item",
                          {
                            props: {
                              name: "6",
                            },
                            style: {
                              display: (() => {
                                if (
                                  v.pageParams.status == "1" ||
                                  (v.getPermission("stockUpPlan_audit") &&
                                    v.pageParams.status == "2")
                                ) {
                                  return "block";
                                } else {
                                  return "none";
                                }
                              })(),
                            },
                          },
                          "查看"
                        ), // 待提交
                        /* v.pageParams.status == '1'? h('Buttons-item', {
                   props: {
                   name: '1'
                   }
                   }, '编辑') : '', */
                        // 全部、待提交
                        !v.getPermission("stockUpPlan_remove") ||
                        v.pageParams.status == "1"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "2",
                              },
                            },
                            "删除"
                          )
                          : "", // 待审核
                        /*! v.getPermission('stockUpPlan_audit') ||v.pageParams.status == '2'? h('Buttons-item', {
                   props: {
                   name: '3'
                   }
                   }, '审核') : '', */
                        /* h('Buttons-item', {
                   props: {
                   name: '4'
                   }
                   }, '打印'), */
                        // 全部
                        !v.getPermission("stockUpPlan_queryRelatedPurchase") ||
                        v.pageParams.status == "0" ||
                        v.pageParams.status == "3"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "5",
                              },
                            },
                            "相关联采购单"
                          )
                          : "",
                      ]
                    ),
                  ]
                ),
              ]);
            // }
            },
          },
        ];
        columns.forEach((n, i) => {
          if (n.key != "reviewer" || (type == 2 && n.key == "reviewer")) {
            v.stockColumn.push(n);
          }
        });
        if (v.pageParams.status == "2") {
          v.stockColumn.splice(9, 0, {
            key: "ruleName",
            title: "审核流程", // 审核流程
            align: "center",
            render(h, params) {
              let ruleName = ''
              if(params.row.extJson){
                let data = JSON.parse(params.row.extJson)
                ruleName = data.ruleName
              }
              let text = ruleName || "";
              return h("span", text);
            },
          });
        }
      } else {
        // 采购取消表格
        this.cancelColumn = [
          {
            type: "selection",
            width: 55,
            align: "center",
          },
          {
            key: "cancelGoods",
            title: "取消商品",
            align: "center",
            width: 250,
            slot: "cancelGoods",
          },
          {
            key: "cancelType",
            title: "取消类型",
            align: "center",
            width: 90,
            render: (h, params) => {
              let typeMap = {
                1 : {
                  label: '需求作废',
                  color: 'red'
                },
                2 : {
                  label: '剩余取消',
                  color: '#CD0AFF'
                },
                3 : {
                  label: '确认少货',
                  color: 'orange'
                },
              }
              return h('div', {
                style: {
                  color: typeMap[params.row.cancelType].color
                }
              }, typeMap[params.row.cancelType].label)
            }
          },
          {
            key: 'cancelNum',
            title: "取消数量",
            align: "center",
            width: 85,
          },
          {
            key: 'cancelReason',
            title: "取消原因",
            align: "center",
            width: 120,
            render: (h, params) => {
              return h('Tooltip', {
                props: {
                  content: params.row.cancelReason,
                  maxWidth: 200,
                  transfer: true
                },
              }, [
                h('div', {
                  style: {
                    display: '-webkit-box',
                    '-webkit-box-orient': 'vertical',
                    '-webkit-line-clamp': 3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }, params.row.cancelReason)
              ])
            }
          // tooltip: true,
          // tooltipMaxWidth: 200
          },
          {
            key: 'planSerialNumber',
            title: "备货计划编号",
            align: "center",
            width: 150,
            render: (h, params) => {
              return h('div', {
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                },
                on: {
                  click: () => {
                    this.seeDetail(params.row.planId)
                  }
                }
              }, params.row.planSerialNumber)
            }
          },
          {
            key: "readyType",
            title: "备货类型",
            align: "center",
            width: 90,
            render: (h, params) => {
              let typeMap = {
                0 : {
                  label: '急采',
                },
                1 : {
                  label: '普通备货',
                },
                2 : {
                  label: '海外仓备货',
                },
                3 : {
                  label: 'FBA备货',
                },
                4 : {
                  label: '全托管备货',
                },
                5 : {
                  label: '直发备货',
                },
              }
              return h('div', {}, typeMap[params.row.readyType].label)
            }
          },
          {
            key: 'businessDeptId',
            title: "所属事业部",
            align: "center",
            width: 110,
            render: (h, params) => {
              let resultBusiness = ''
              this.allowBusinessDept.forEach(item => {
                if(item.id == params.row.businessDeptId) {
                  resultBusiness = item.name
                }
              })
              return h('div', {}, resultBusiness)
            }
          },
          {
            key: "backupWarehouseName",
            align: "center",
            title: `平台主体/店铺`,
            width: 120,
            render: (h, params) => {
              return h('div', {}, [
                h('p', {}, params.row.platformSubject 
              ? params.row.platformSubject : '-'),
                h('p', {}, params.row.accountCode 
              ? params.row.accountCode : '-')
              ])
            },
          },
          {
            key: "backupWarehouseName",
            align: "center",
            title: `备货仓库`,
            width: 120,
            render: (h, params) => {
              let backupWarehouseName = ''
              this.warehouseArr.forEach(item => {
                if(item.warehouseId == params.row.backupWarehouseId){
                  backupWarehouseName = item.warehouseName
                }
              })
              return h('div', {}, backupWarehouseName)
            },
          },
          {
            key: "planCreateBy",
            align: "center",
            title: "计划人",
            render: (h, params) => {
              let planCreateByName = ''
              this.submitterArr.forEach(item => {
                if(item.id == params.row.planCreateBy) {
                  planCreateByName = item.name
                }
              })
              return h('div', {}, planCreateByName)
            }
          },
          {
            key: 'purchaseNumber',
            title: "取消采购单",
            align: "center",
            width: 150,
            render: (h, params) => {
              return h('div', {
                style: {
                  color: '#2d8cf0',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                },
                on: {
                  click: () => {
                    this.showPurchaseDetail(1, params.row, params.index)
                  }
                }
              }, params.row.purchaseNumber)
            }
          },
          {
            key: "cancelCreateBy",
            align: "center",
            title: "取消人",
            render: (h, params) => {
              let cancelCreateByName = ''
              this.submitterArr.forEach(item => {
                if(item.id == params.row.cancelCreateBy) {
                  cancelCreateByName = item.name
                }
              })
              return h('div', {}, cancelCreateByName)
            }
          },
          {
            key: "cancelTime",
            align: "center",
            title: "取消时间",
            width: 100  
          },
        ]
      }
    },
    showCurrentPage(type) {
      // tabs页切换
      this.getColumns(type);
      this.getList();
    },
    addLcPlanFn() {
      let v = this;
      v.planDatas = v.deepCopy(v.lcPlans);
      v.planDatas.addType = "local";
      v.purchaseShow = "addStockingPlan";
      v.isEdit = true;
      v.plansType = "1";
      v.houseType = "self";
    },
    addOsPlanFn() {
      let v = this;
      v.planDatas = v.deepCopy(v.osPlans);
      v.planDatas.addType = "os";
      v.purchaseShow = "addStockingPlan";
      v.isEdit = true;
      v.plansType = "1";
      v.houseType = "overSea";
    },
    //新建备货计划
    newAddPlan() {
      let v = this;
      v.planDatas = v.deepCopy(v.osPlans);
      v.planDatas.addType = "os";
      v.planDatas.accountsArr = v.accountsArr
      v.purchaseShow = "addStockingPlan";
      v.isEdit = true;
      v.plansType = "1";
      v.houseType = "";
    },
    addFBAPlanFn() {
      let v = this;
      v.purchaseShow = "addStockingPlan";
      v.planDatas = v.deepCopy(v.fbaPlans);
      v.planDatas.addType = "FBA";
      v.isEdit = true;
      v.plansType = "1";
      v.houseType = "fba";
    },
    seePlanDetailsFn(isEdit, type, val) {
      let v = this;
      v.Tableloading = true;
      v.axios.post(api.planInfo + "?planId=" + val).then((res) => {
        if (res.data.code == 0) {
          v.getProductListInfo(
            res.data.datas.planDetailsList.map((i) => i.goodsId)
          ).then((data) => {
            let productGoodInfo = {};
            res.data.datas.planDetailsList = res.data.datas.planDetailsList.map(i => {
              productGoodInfo = data.find(j => i.goodsId === j.productGoodsId);
              return {...i, ...(this.$common.isEmpty(productGoodInfo) ? {} : productGoodInfo)};
            });
            v.planDatas = v.deepCopy(res.data.datas);
            if (v.planDatas.createdBy) {
              v.submitterArr.forEach((item) => {
                if (v.planDatas.createdBy == item.id) {
                  // 查找创建人名称
                  v.planDatas = Object.assign(v.planDatas, {
                    createdName: item.name,
                    suggestType: v.planDatas.backupWarehouseType,
                  });
                }
              });
            }
            v.warehouseArr.forEach((item) => {
              if (v.planDatas.backupWarehouseId === item.warehouseId) {
                v.planDatas.backupWarehouseName = item.warehouseName;
              }
              if (v.planDatas.purchaseWarehouseId === item.warehouseId) {
                v.planDatas.purchaseWarehouseName = item.warehouseName;
              }
            });
            switch (v.planDatas.backupWarehouseType) {
              case 0:
                v.houseType = "self";
                break;
              case 1:
                v.houseType = "overSea";
                break;
              case 2:
                v.houseType = "fba";
                break;
            }
            v.planDatas.accountsArr = v.accountsArr
            v.purchaseShow = "addStockingPlan";
            v.isEdit = isEdit;
            v.plansType = type;
          });
        }
      }).finally(() => {
        v.Tableloading = false;
      });
    },
    seeRelatedOrder(data) {
      let v = this;
      let obj = {
        planId: data.planId,
      };
      v.axios.post(api.planQueryRelatedPurchase, obj).then((res) => {
        if (res.data.code == 0) {
          v.purchaseOrder.orderData = res.data.datas.list;
          v.isShowCorrelative = true;
        }
      });
    },
    seeRelatedOrderBySku() {
      let v = this;
      // 如果sku为空，就默认用planId查找
      if (v.purchaseOrder.sku.length == 0) {
        let data = {};
        data.planId = v.relatedOrderPlanId;
        v.seeRelatedOrder(data);
        return;
      }
      // 否则就要用id和sku一起查找
      let obj = {
        planId: v.relatedOrderPlanId,
        sku: v.purchaseOrder.sku,
      };
      v.axios.post(api.planQueryRelatedPurchase, obj).then((res) => {
        if (res.data.code == 0) {
          v.purchaseOrder.orderData = res.data.datas.list;
        }
      });
    },
    showCorrelativeChange(value) {
      if (!value) {
        this.purchaseOrder.sku = "";
      }
    },
    goBackFromAddPlan() {
      this.purchaseShow = "stockingPlan";
    },
    addPlanGoBack(val) {
      this.purchaseShow = val;
      this.pageParamsStatus = true;
    },
    exportEcxel() {
      let v = this;
      if (v.stockData.length == 0) {
        v.$Message.error("无数据导出");
      } else {
        v.getDateValue(v.submitTimeArr, 'submit');
        const params = this.getPageParams();
        v.axios.post(api.planExport, params).then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("导出成功");
          }
        });
      }
    },
    delPlanFn() {
      let v = this;
      v.axios
        .get(api.planDelete + "?planId=" + v.delPlan.planId)
        .then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("删除成功！");
            v.isShowDeleteTip = false;
            v.pageParamsStatus = true;
          }
        });
    },
    intiBaseDataList() {
      let v = this;
      v.axios.get(api.warehouseType).then((res) => {
        if (res.data.code == 0) {
          v.warehouseTypeArr = res.data.datas;
        }
      });
      v.axios.post(api.warehouse, { pageNum: 1 }).then((res) => {
        if (res.data.code == 0) {
          v.warehouseArr = res.data.datas;
        }
      });
      v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                id: i,
                name: datas[i].userName,
              });
            }
          }
          v.submitterArr = arr;
        }
      });
    },
    seeDetail(planId) {
      this.seePlanDetailsFn(false, "2", planId);
    },
    getAccounts() {
      this.platformEntityArr.forEach(item => {
        this.axios.get(`${api.queryAccounts}?platformId=${item.value === 'tiktok' ? item.value + '888' : item.value}`).then(res => {
          if(res.data.code === 0) {
            res.data.datas.length !== 0 ? this.accountsArr.push(res.data.datas) : ''
            this.accountsArr = this.accountsArr.flat()
          }
        })
      })    
    },
    // 查看采购单详情
    showPurchaseDetail(type, row, index) {
      //type 1--查看
      this.dialogDetail.data = row;
      this.dialogDetail.type = type;
      this.purchaseShow = "showOrderDetail";
    },
    goBack() {
      this.purchaseShow = "stockingPlan";
    },
  },
};
</script>
