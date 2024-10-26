<style scope>
.form-wid {
  width: 370px;
}

.settlement-type-box {
  margin-left: -90px;
  margin-top: 10px;
}

.settlement-type-box1 {
  margin-left: 0px;
  margin-top: 10px;
}

.singleSearchBtn {
  margin-left: 20px;
  margin-top: 5px;
}

.address {
  width: 80px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}

.chooseAdd {
  float: left;
  width: 580px;
}

.pic {
  width: auto;
  height: 180px;
}

.pic img {
  display: inline-block;
  margin: 0 auto;
  max-height: 100%;
  max-width: 100%;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}

.delTitle {
  font-size: 14px;
  margin: 10px;
}

.hasQuote {
  font-size: 14px;
  margin: 10px;
  color: red;
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

.editSupplierModal .ivu-modal-footer {
  display: none;
}
</style>
<template>
  <div>
    <template>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form
                ref="pageParams"
                :model="pageParams"
                :label-width="labelWidth"
              >
                <dyt-filter>
                  <FormItem label="供应商等级" prop="supplierLevel">
                    <dyt-select
                      v-model="pageParams.supplierLevel"
                      clearable
                      @on-change="search"
                      placeholder="请选择供应商等级"
                    >
                      <Option
                        v-for="(item, index) in supplierLevelArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="开发人员" prop="developerId">
                    <dyt-select
                      v-model="pageParams.developerId"
                      filterable
                      clearable
                      @on-change="search"
                    >
                      <Option
                        v-for="(item, index) in developerArr"
                        :value="item.userId"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="供应商类型" prop="supplierTypeList">
                    <dyt-select
                      v-model="pageParams.supplierTypeList"
                      clearable
                      multiple
                      :max-tag-count="1"
                    >
                      <Option
                        v-for="(item, index) in supplierTypeArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="采购人员" prop="purchaserId">
                    <dyt-select
                      v-model="pageParams.purchaserId"
                      filterable
                      clearable
                      @on-change="search"
                    >
                      <Option
                        v-for="(item, index) in purchaserArr"
                        :value="item.userId"
                        :key="index"
                        >{{ item.name }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="结算方式" prop="settlementType">
                    <dyt-select
                      v-model="pageParams.settlementType"
                      clearable
                      @on-change="search"
                      placeholder="请选择结算方式"
                    >
                      <Option
                        v-for="(item, index) in settlementMethodArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="主营品类" prop="supplierCategoryIds">
                    <dyt-select
                      v-model="pageParams.supplierCategoryIds"
                      :max-tag-count="1"
                      clearable
                      @on-change="search"
                      multiple
                    >
                      <Option
                        v-for="(item, index) in mainCategoryArr"
                        :value="item.supplierCategoryId"
                        :key="index"
                        >{{ item.categoryName }}</Option
                      >
                    </dyt-select>
                  </FormItem>
                  <FormItem label="引进时间">
                    <DatePicker
                      transfer
                      type="daterange"
                      placement="bottom-end"
                      placeholder="选择日期"
                      style="width: 100%"
                      split-panels
                      v-model="submitTime"
                      @on-clear="resetDate"
                      :options="dateOptions"
                      @on-change="getDateValue"
                    />
                  </FormItem>
                  <FormItem label="" :label-width="30" class="form-item-notlabel">
                    <dyt-input
                      v-model.trim="searchSupplier"
                      @on-enter="getList"
                      style="width: 360px"
                    >
                      <dyt-select
                        v-model="supplierOptionDefault"
                        slot="prepend"
                        :style="`width: ${labelWidth || 110}px`"
                        @on-change="changeSupplierType"
                      >
                        <Option
                          v-for="item in supplierArr"
                          :value="item.type"
                          :key="item.type"
                          >{{ item.title }}</Option
                        >
                      </dyt-select>
                    </dyt-input>
                  </FormItem>
                  <FormItem label="供应商类别" prop="supplierAbutmentType" :label-width="190">
                    <dyt-select v-model="pageParams.supplierAbutmentType">
                      <Option value="0">未对接系统</Option>
                      <Option value="1">已对接系统</Option>
                      <Option value="2">1688供应商</Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button
                      type="primary"
                      @click="searchSupplierList"
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
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox">
        <div class="tableControl flexBox">
          <div v-if="currentTabItem == '0' || currentTabItem == '3'">
            <Button
              v-if="getPermission('supplierManagement_save')"
              type="primary"
              @click="addSupplierFn"
              class="iconbuttons"
              style="margin-left: 12px"
            >
              新增供应商
            </Button>
            <Button
              v-if="getPermission('supplierManagement_batchImport')"
              type="primary"
              @click="importExcel = true"
              class="iconbuttons"
              style="margin-left: 12px"
            >
              批量导入
            </Button>
            <Dropdown
              @on-click="exportMt"
              v-if="getPermission('supplierManagement_batchExport')"
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
        <div class="tableControl" v-if="currentTabItem == '1'">
          <Button
            type="primary"
            @click="addSupplierFn"
            class="iconbuttons"
            style="margin-left: 12px"
          >
            新增供应商
          </Button>
          <!-- <Button type="primary" @click="batchOperation('8')" class="iconbuttons" style="margin-left: 12px">
            批量删除/停用
          </Button> -->
          <Button
            type="primary"
            v-if="getPermission('supplierManagement_batchOperation')"
            @click="batchOperation('0')"
            class="iconbuttons"
            style="margin-left: 12px"
          >
            批量提交
          </Button>
        </div>
        <div class="tableControl" v-if="currentTabItem == '2'">
          <Button
            type="primary"
            v-if="getPermission('supplierManagement_batchOperation')"
            @click="batchOperation('1')"
            class="iconbuttons"
            style="margin-left: 12px"
          >
            批量审核
          </Button>
          <Button
            type="primary"
            v-if="getPermission('supplierManagement_batchOperation')"
            @click="batchOperation('2')"
            class="iconbuttons"
            style="margin-left: 12px"
          >
            批量驳回
          </Button>
        </div>
        <div class="tableControl" v-if="currentTabItem == '4'">
          <Button
            type="primary"
            v-if="getPermission('supplierManagement_batchOperation')"
            @click="batchOperation('6')"
            class="iconbuttons"
            style="margin-left: 12px"
          >
            批量移入待审核
          </Button>
        </div>
        <Button
          type="primary"
          style="margin-left: 12px"
          v-if="
            getPermission('supplierManagement_batch_update') &&
            (currentTabItem == '3' || currentTabItem == '1')
          "
          @click="modifyEdit"
          >批量修改
        </Button>
      </div>
      <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="currentTabItem" @on-click="showCurrentPage">
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
        <div class="orderTable">
          <keep-alive>
            <Table
              ref="managementTable"
              highlight-row
              border
              :height="tableHeight"
              :loading="Tableloading"
              :columns="suppliersColumn"
              :data="suppliersData"
              @on-selection-change="getSelectValue"
            ></Table>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
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
                  :page-size-opts="pageArray"
                ></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
      <!--新增/编辑供应商-->
      <Modal
        class-name="editSupplierModal"
        v-model="isShowSupplier"
        :title="
          editSupplierType == '1'
            ? '新增供应商'
            : editSupplierType == '2'
            ? '编辑供应商'
            : '查看供应商'
        "
        :width="1280"
        :styles="{ top: '20px' }"
        :mask-closable="!isEditSupplier"
      >
        <template v-if="isShowSupplier">
          <addSupplier
            :editSupplierData="editSupplier"
            :isEditSupplier="isEditSupplier"
            :editSupplierType="editSupplierType"
            :auditStatus="pageParams.auditStatus"
            :source="'supplier'"
            @save-supplier="saveSupplierFn"
            @submit-supplier="submitSupplierFn"
            @batch-operation="batchOperation"
            @close-supplier-modal="closeSupplierModal"
          ></addSupplier>
        </template>
        <div slot="footer" style="text-align: center"></div>
      </Modal>
      <!--操作日志-->
      <Modal v-model="isShowOperationLog" :width="820" title="操作日志">
        <div class="supplierTabsBar">
          <Table
            ref="hisPriceTable"
            highlight-row
            border
            max-height="560"
            :loading="Tableloading"
            :columns="operationLogColumn"
            :data="operationLogData"
          ></Table>
          <div class="table-page clear">
            <div class="table-page-right">
              <Page
                :total="operationLog.total"
                @on-change="logChangePage"
                show-total
                :page-size="operationLog.pageSize"
                show-elevator
                :current="operationLog.pageNum"
                show-sizer
                @on-page-size-change="logChangePageSize"
                placement="top"
                :page-size-opts="pageArray"
              ></Page>
            </div>
          </div>
        </div>
        <div slot="footer">
          <Button type="primary" @click="isShowOperationLog = false"
            >关闭
          </Button>
        </div>
      </Modal>
      <!--批量导入-->
      <Modal
        v-model="importExcel"
        title="批量导入"
        class-name="verticalCenterModal"
        :styles="{ top: '280px' }"
        width="400"
      >
        <template
          v-if="
            uploadList.length == 0 ||
            (uploadList.length > 0 &&
              uploadList[uploadList.length - 1].status === 'finished')
          "
        >
          <div style="text-align: center; margin: 20px 0">
            <dytUpload
              ref="import"
              type="drag"
              :format="['XLS', 'XLSX']"
              :action="batchImport"
              name="file"
              :headers="headObj"
              :on-success="okUpload"
              :on-error="uploadError"
              :show-upload-list="false"
              :onFormatError="formatError"
            >
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="60"></Icon>
                <p>导入</p>
              </div>
            </dytUpload>
          </div>
          <div style="text-align: center">
            <a href="javascript:void(0)" @click="downloadEcxel()"
              >下载Excel文件模板</a
            >
          </div>
        </template>
        <template v-else>
          <div style="margin: 20px 0">
            <Progress
              v-if="uploadList[uploadList.length - 1].showProgress"
              :percent="uploadList[uploadList.length - 1].percentage"
              hide-info
            ></Progress>
          </div>
        </template>
        <div slot="footer"></div>
      </Modal>
      <!--停用\删除-->
      <Modal v-model="isShowConfirmDel" title="提示" width="400">
        <div style="margin: 20px 0">
          <div v-if="!supplierHasMsg" class="delTitle">确定删除此供应商？</div>
          <div v-if="supplierHasMsg">
            <div class="delTitle">确定停用此供应商？</div>
            <div class="hasQuote">
              停用此供应商将会作废此供应商的所有产品报价，请谨慎操作！！！
            </div>
          </div>
        </div>
        <div slot="footer" style="text-align: center">
          <Button type="primary" @click="batchOperation(operationType)"
            >确定</Button
          >
          <Button type="primary" @click="isShowConfirmDel = false">取消</Button>
        </div>
      </Modal>
      <!--批量修改供应商-->
      <Modal v-model="model2" title="批量修改供应商">
        <Form ref="formBatchEdit" :model="formBatchEdit" :label-width="90">
          <div
            v-for="(item, index) in formBatchEdit.items"
            :key="index"
            style="display: flex"
          >
            <Checkbox
              v-model="item.isCheck"
              class="mr10"
              style="margin-top: 8px"
              @on-change="resetItem($event, item)"
            >
            </Checkbox>
            <FormItem :label="item.label">
              <template v-if="item.key === 'supplierLevel'">
                <!--供应商等级-->
                <dyt-select
                  v-model="item.value"
                  clearable
                  placeholder="请选择供应商等级"
                  class="form-wid"
                  :disabled="!item.isCheck"
                >
                  <Option
                    v-for="(item, index) in supplierLevelArr"
                    :value="item.dataValue"
                    :key="index"
                    >{{ item.dataDesc }}</Option
                  >
                </dyt-select>
              </template>
              <template v-if="item.key === 'supplierCategoryId'">
                <!--主营品类-->
                <dyt-select
                  ref="'refBatch1"
                  v-model="item.value"
                  clearable
                  class="form-wid"
                  :disabled="!item.isCheck"
                >
                  <Option
                    v-for="(item, index) in mainCategoryArr"
                    :value="item.supplierCategoryId"
                    :key="index"
                    >{{ item.categoryName }}
                  </Option>
                </dyt-select>
              </template>
              <template v-if="item.key === 'developerId'">
                <!--开发员-->
                <dyt-select
                  ref="'refBatch2"
                  v-model="item.value"
                  filterable
                  class="form-wid"
                  clearable
                  :disabled="!item.isCheck"
                >
                  <Option
                    v-for="(item, index) in developerArr"
                    :value="item.userId"
                    :key="index"
                    >{{ item.name }}
                  </Option>
                </dyt-select>
              </template>
              <template v-if="item.key === 'purchaserId'">
                <!--采购员-->
                <dyt-select
                  ref="'refBatch3"
                  v-model="item.value"
                  filterable
                  class="form-wid"
                  clearable
                  :disabled="!item.isCheck"
                >
                  <Option
                    v-for="(item, index) in purchaserArr"
                    :value="item.userId"
                    :key="index"
                    >{{ item.name }}
                  </Option>
                </dyt-select>
              </template>
              <template v-if="item.key === 'supplierType'">
                <!--供应商类型-->
                <dyt-select
                  ref="'refBatch4"
                  v-model="item.value"
                  class="form-wid"
                  clearable
                  :disabled="!item.isCheck"
                >
                  <Option
                    v-for="(item, index) in supplierTypeArr"
                    :value="item.dataValue"
                    :key="index"
                    >{{ item.dataDesc }}
                  </Option>
                </dyt-select>
              </template>
              <template v-if="item.key === 'settlementType'">
                <!--结算方式-->
                <div>
                  <dyt-select
                    v-model="item.value"
                    class="form-wid"
                    @on-change="settlementTypeChangeFn"
                    placeholder="请选择结算方式"
                    :disabled="!item.isCheck"
                  >
                    <Option
                      v-for="(item, index) in settlementMethodArr"
                      :value="item.dataValue"
                      :key="index"
                      >{{ item.dataDesc }}
                    </Option>
                  </dyt-select>
                </div>
                <!--结算时间-->
                <div v-if="item.value == '04'" class="settlement-type-box">
                  <FormItem label="结算时间" prop="settlementTime">
                    <dyt-select
                      v-model="item.value1"
                      style="width: 126px"
                      @on-change="settlementTimeChangeFn"
                      placeholder="请选择"
                      :disabled="!item.isCheck"
                    >
                      <Option
                        v-for="(item, index) in settlementTimeArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}
                      </Option>
                    </dyt-select>
                    <dyt-select
                      v-model="item.value2"
                      style="width: 216px"
                      @on-change="settlementPeriodChangeFn"
                      placeholder="请选择"
                      :disabled="!item.isCheck"
                    >
                      <Option
                        v-for="(item, index) in settlementPeriodArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                </div>
                <!-- 周结 半月结 -->
                <div
                  v-if="item.value2 == '02' || item.value2 == '04'"
                  class="settlement-type-box1"
                >
                  <FormItem prop="settlementTimeValue" :label-width="10">
                    <dyt-select
                      v-model="item.value3"
                      class="form-wid"
                      placeholder="请选择"
                      :disabled="!item.isCheck"
                    >
                      <Option
                        v-for="(item, index) in settlementTimeValueArr"
                        :value="item.dataValue"
                        :key="index"
                        >{{ item.dataDesc }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                </div>
                <!--月结-->
                <div v-if="item.value2 == '03'" class="settlement-type-box1">
                  <FormItem prop="settlementTimeValue" :label-width="10">
                    <DatePicker
                      type="date"
                      format="d"
                      transfer
                      class="form-wid"
                      @on-change="settlementTimeValueChangeFn"
                      placeholder="选择日期"
                      v-model="item.value3"
                      :disabled="!item.isCheck"
                      :readonly="!item.isCheck"
                    ></DatePicker>
                  </FormItem>
                </div>
              </template>
            </FormItem>
          </div>
        </Form>
        <div slot="footer">
          <Button type="primary" @click="batchBatchEdit">确定</Button>
          <Button @click="model2 = false">取消</Button>
        </div>
      </Modal>
    </template>
  </div>
</template>

<script>
import api from "@/api/api";
// import common from '@/assets/common.js';
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import addSupplier from "./common/addSupplier";
// import Buttons from '@/components/localComponents/buttons/buttons';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    // Buttons,
    addSupplier,
  },
  data() {
    let self = this;
    // let end = new Date();
    // let start = new Date();
    // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      model2: false,
      formBatchEdit: {
        items: [
          {
            isCheck: false,
            label: "供应商等级" + "：",
            key: "supplierLevel",
            value: "",
          },
          {
            isCheck: false,
            label: "主营品类" + "：",
            key: "supplierCategoryId",
            value: "",
          },
          {
            isCheck: false,
            label: "开发员" + "：",
            key: "developerId",
            value: "",
          },
          {
            isCheck: false,
            label: "采购员" + "：",
            key: "purchaserId",
            value: "",
          },
          {
            isCheck: false,
            label: "供应商类型" + "：",
            key: "supplierType",
            value: "",
          },
          {
            isCheck: false,
            label: "结算方式" + "：",
            key: "settlementType",
            value: "",
            value1: "",
            value2: "",
            value3: "",
          },
        ],
      },
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(340),
      totalPage: 0,
      total: 0,
      curPage: 1,
      currentTabItem: "3", // 标签页
      importExcel: false, // 批量导入
      isShowSupplier: false,
      isEditSupplier: false, // 是否可编辑
      editSupplierType: "", // 打开编辑供应商modal的类型
      isShowOperationLog: false, // 操作日志
      isShowConfirmDel: false, // 确认删除/停用
      operationType: "",
      supplierHasMsg: false,
      supplierInfo: {},
      batchImport: api.batchImport, // 导入EXCEL
      actionUrl: api.fileUpLoad,
      uploadList: [],
      supplierLevelArr: [], // 供应商等级
      developerArr: [], // 开发人员
      supplierTypeArr: [], // 供应商类型
      purchaserArr: [], // 采购人员
      settlementMethodArr: [], // 结算方式
      submitTime: [], //
      pageParams: {
        auditStatus: 3, // 审批状态（1待提交，2待审核，3已审核，4已停用）
        developerId: null,
        supplierAbutmentType: null, // 供应商类别
        developerName: null, // isDefault: 1,
        pageNum: 1,
        pageSize: 10,
        purchaserId: null,
        purchaserName: null,
        settlementType: null,
        supplierIds: [],
        supplierCategoryIds: null,
        supplierLevel: null,
        supplierTypeList: [],
        supplierCode: "", // 供应商代码 ,
        supplierName: "", // 供应商名称 ,
        startIntroduceTime: null, //始引进时间
        endIntroduceTime: null, //末引进时间
      },
      searchSupplier: "",
      supplierOptionDefault: "1",
      supplierArr: [
        {
          type: "1",
          title: "供应商名称",
        },
        {
          type: "2",
          title: "供应商代码",
        },
      ],
      newSupplier: {
        // 新增、编辑供货商
        supplierName: "",
        supplierCode: "",
        supplierLevel: "",
        supplierCategoryId: "",
        developerName: "",
        developerId: "",
        purchaserName: "",
        purchaserId: "",
        countryId: "64961f3d-9e6b-11e7-87bc-0050568e2f6d", // 中国
        provinceId: "",
        cityId: "",
        supplierType: "",
        address: "",
        storeUrl: "",
        useFlag: 0,
        settlementRemark: "",
        settlementType: "",
        settlementPeriod: "",
        settlementPeriodName: "",
        settlementTime: "",
        settlementTimeName: "",
        settlementTimeValue: "",
        supplierPaymentList: [
          // 供应商支付方式表，默认无数据
          // {
          //   isDefault: 0,
          //   merchantId: '',
          //   paymentAccount: '',
          //   paymentAccountName: '',
          //   paymentBank: '',
          //   paymentType: '',
          //   subbranch: '',
          //   supplierIds: [],
          //   supplierId: '',
          //   supplierPaymentId: ''
          // }
        ],
        supplierContactList: [
          // 供应商联系人表
          {
            contactMan: "",
            email: "",
            faxNumber: "",
            isDefault: 0,
            merchantId: "",
            mobilePhone: "",
            qqNumber: "",
            supplierContactId: "",
            supplierId: "",
            telephone: "",
            wwAccount: "",
          },
        ],
        supplierAttachmentList: [
          // 供应商附件表
          /* {
           attachmentDesc: '',
           attachmentUrl: '',
           merchantId: '',
           supplierAttachmentId: '',
           supplierId: '',
           } */
        ],
        introduceTime: "",
        returnAdress: [],
        returnAdressDetail: "",
        returnContactMan: "",
        returnTelephone: null,
      },
      editSupplier: {}, // 新增、编辑供应商
      tabItems: [
        {
          key: "3",
          value: "正式供应商",
        },
        {
          key: "1",
          value: "草稿",
        },
        {
          key: "2",
          value: "待审核",
        },
        {
          key: "4",
          value: "已停用",
        },
        {
          key: "0",
          value: "所有供应商",
        },
      ],
      selectionArr: [], // 已选中表格行数据
      suppliersData: [], // 主table
      suppliersColumn: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          key: "supplierName",
          align: "center",
          title: "供应商名称",
        },
        {
          key: "supplierCode",
          align: "center",
          title: "代码",
          render: (h, params) => {
            if (params.row.supplierCode) {
              return h("span", params.row.supplierCode);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "supplierLevelName",
          align: "center",
          title: "供应商等级",
          render: (h, params) => {
            if (params.row.supplierLevelName) {
              return h("span", params.row.supplierLevelName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "supplierTypeName",
          align: "center",
          title: "供应商类型",
          render: (h, params) => {
            if (params.row.supplierTypeName) {
              return h("span", params.row.supplierTypeName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "categoryName",
          align: "center",
          title: "主营品类",
          render: (h, params) => {
            if (params.row.categoryName) {
              return h("span", params.row.categoryName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "contactMan",
          align: "center",
          title: "默认联系人",
          render: (h, params) => {
            if (params.row.contactMan) {
              return h("span", params.row.contactMan);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "mobilePhone",
          align: "center",
          title: "默认联系人手机",
          render: (h, params) => {
            if (params.row.mobilePhone) {
              return h("span", params.row.mobilePhone);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "settlementTypeName",
          align: "center",
          title: "结算方式",
          render: (h, params) => {
            if (params.row.settlementTypeName) {
              return h("span", params.row.settlementTypeName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "introduceTime",
          align: "center",
          title: "引进时间",
          minWidth:130,
          render: (h, params) => {
            if (params.row.introduceTime) {
              return h("span", params.row.introduceTime);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "developerName",
          align: "center",
          title: "开发人",
          render: (h, params) => {
            if (params.row.developerName) {
              return h("span", params.row.developerName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "purchaserName",
          align: "center",
          title: "采购人",
          render: (h, params) => {
            if (params.row.purchaserName) {
              return h("span", params.row.purchaserName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          key: "operation",
          align: "center",
          width: 120,
          fixed: "right",
          title: "操作",
          render: (h, params) => {
            return h("div", [
              !self.getPermission("supplierManagement_info") ||
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
                        self.suppliersData.forEach((item, i) => {
                          delete item["_checked"];
                        });
                        self.$set(
                          self.suppliersData[params.index],
                          "_checked",
                          true
                        );
                        self.selectionArr = [];
                        self.selectionArr.push(params.row);
                        switch (val) {
                          case "2":
                            self.editSupplierFn(
                              "2",
                              true,
                              params.row.supplierId
                            );
                            break;
                          case "3":
                            self.delOrDisFn(params.row, "8");
                            break;
                          case "4":
                            self.delOrDisFn(params.row, "7");
                            // self.batchOperation('7');
                            break;
                          case "5":
                            self.editSupplierFn(
                              "4",
                              false,
                              params.row.supplierId
                            );
                            break;
                          case "6":
                            self.quoteFn(params.row);
                            break;
                          case "7":
                            self.showOperationLogFn(params.row.supplierId);
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
                            self.editSupplierFn(
                              "3",
                              false,
                              params.row.supplierId
                            );
                          },
                        },
                      },
                      "查看"
                    ),
                    h(
                      "Buttons-menu",
                      {
                        slot: "list",
                      },
                      [
                        // 草稿状态或停用状态显示
                        !self.getPermission("supplierManagement_modify") ||
                        self.currentTabItem == "1" ||
                        self.currentTabItem == "3" ||
                        self.currentTabItem == "4"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "2",
                              },
                            },
                            "编辑"
                          )
                          : "", // 草稿状态显示
                        !self.getPermission("supplierManagement_remove") ||
                        self.currentTabItem == "1"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "3",
                              },
                            },
                            "删除/停用"
                          )
                          : "", // 只有已审核状态有停用按钮
                        !self.getPermission("supplierManagement_remove") ||
                        self.currentTabItem == "3"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "4",
                              },
                            },
                            "停用"
                          )
                          : "", // 待审核状态显示
                        self.currentTabItem == "2"
                          ? h(
                            "Buttons-item",
                            {
                              props: {
                                name: "5",
                                disabled:
                                    self.isSelf(params.row.createdBy) &&
                                    !self.isSelf(params.row.auditPersonIds),
                              },
                            },
                            "审核"
                          )
                          : "",
                        //  h('Buttons-item', {
                        //   props: {
                        //     name: '6'
                        //   }
                        // }, '报价'),
                        !self.getPermission("supplierManagement_logList") ||
                          h(
                            "Buttons-item",
                            {
                              props: {
                                name: "7",
                              },
                            },
                            "操作日志"
                          ),
                      ]
                    ),
                  ]
                ),
            ]);
          },
        },
      ],
      operationLog: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
        supplierId: "",
      },
      operationLogColumn: [
        {
          key: "content",
          align: "center",
          title: "操作内容",
          width: 400, // render: (h, params)=> {
          //   if(params.row.logFrom == 1) {
          //     return [
          //       h('span', {
          //         style: {
          //           color: 'rgb(236, 124, 25)'
          //         }
          //       }, '状态由： '),
          //       h('span', params.row.oldData),
          //       h('span', {
          //         style: {
          //           color: 'rgb(236, 124, 25)'
          //         }
          //       }, ' 变为： '),
          //       h('span', params.row.newData)
          //     ]
          //   } else if(params.row.logFrom == 3) {
          //     return [
          //       h('span', params.row.oldData),
          //       h('span', {
          //         style: {
          //           color: 'red'
          //         }
          //       }, ' 已被删除')
          //     ]
          //   }
          // }
        },
        {
          key: "createdTime",
          align: "center",
          title: "操作日期",
          render: (h, params) => {
            return h(
              "span",
              self.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          key: "operatorName",
          align: "center",
          title: "操作人",
        },
      ],
      operationLogData: [],
    };
  },
  computed: {
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    businessDeptIds () {
      if (this.$common.isEmpty(this.authUserInfo) || this.$common.isEmpty(this.authUserInfo.securityUser)) {
        return '';
      }
      return this.authUserInfo.securityUser.businessDeptIds || '';
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
  },
  created() {
    this.pageParams.pageSize = this.getPageSizeCache();
  },
  activated() {
    this.reset();
    this.intiBaseDataList();
    this.startLoading();
  },
  mounted() {
    this.uploadList = this.$refs.import.fileList;
  },
  methods: {
    settlementTypeChangeFn() {},
    settlementTimeChangeFn() {},
    settlementPeriodChangeFn() {},
    settlementTimeValueChangeFn() {},
    resetItem(value, data) {
      if (!value) {
        if (data.key === "settlementType") {
          data.value1 = null;
          data.value2 = null;
          data.value3 = null;
        }
        data.value = null;
      }
    },
    modifyEdit() {
      let v = this;
      if (v.selectionArr.length === 0) {
        v.$Message.info("未选择数据");
        return;
      }
      v.formBatchEdit.items.forEach((i) => {
        i.value = "";
        i.isCheck = false;
        if (i.value1) i.value1 = "";
        if (i.value2) i.value2 = "";
        if (i.value3) i.value3 = "";
      });
      v.model2 = true;
      v.$nextTick(() => {
        if (v.$refs.refBatch1) {
          v.$refs.refBatch1.reset();
        }
        if (v.$refs.refBatch2) {
          v.$refs.refBatch2.reset();
        }
        if (v.$refs.refBatch3) {
          v.$refs.refBatch3.reset();
        }
        if (v.$refs.refBatch4) {
          v.$refs.refBatch4.reset();
        }
      });
      v.intiBaseDataList();
    },
    exportMt(name) {
      let v = this;
      if (name === "0") {
        // 选中
        if (v.selectionArr.length < 1) {
          v.$Message.error("未选择数据");
          return;
        }
        v.exportEcxel("single");
      } else {
        // 全部
        if (v.suppliersData.length === 0) {
          v.$Message.warning({
            content: "无数据导出",
            duration: 5,
          });
          return;
        }
        v.exportEcxel("all");
      }
    },
    startLoading() {
      this.$Loading.start();
      this.getList();
    },
    // 筛选条件
    getPageParams () {
      let pageParams = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(this.authUserInfo) && !this.$common.isEmpty(this.authUserInfo.securityUser)) {
        pageParams.businessDeptIds = this.businessDeptIds;
      }
      if (this.supplierOptionDefault == 1) {
        // 供应商名称
        pageParams.supplierName = this.searchSupplier;
        pageParams.supplierCode = '';
      } else if (this.supplierOptionDefault == 2) {
        // 供应商代码
        pageParams.supplierName = '';
        pageParams.supplierCode = this.searchSupplier;
      }
      return pageParams;
    },
    getList() {
      // 獲取分頁
      if (!this.getPermission("supplierManagement_list")) {
        this.$Message.error("无权限");
        return;
      }
      this.selectionArr = [];
      this.Tableloading = true;
      this.SearchDisabled = true;
      let pageParams = this.getPageParams();
      this.axios.post(api.managementList, pageParams).then((res) => {
        this.Tableloading = false;
        this.SearchDisabled = false;
        if (res.data.code === 0) {
          this.suppliersData = res.data.datas.list;
          this.total = res.data.datas.total;
          this.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    changeSupplierType(value) {
      this.searchSupplier = "";
    },
    searchSupplierList() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    changePage(page) {
      this.$Loading.start();
      this.pageParams.pageNum = page;
      this.getList();
    },
    // 重置
    reset () {
      this.supplierOptionDefault = '1';
      this.currentTabItem = "3";
      this.selectionArr = [];
      this.searchSupplier = '';
      this.$nextTick(() => {
        this.$refs["pageParams"].resetFields();
      })
    },
    search() {
      this.pageParams.supplierIds = [];
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
    },
    showCurrentPage(name) {
      // tabs页切换
      this.pageParams.auditStatus = name === "0" ? null : Number(name);
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    downloadEcxel() {
      // 下载标发货导入的模板
      const path = this.$store.state.imgUrl + '/sps-service/template/supplierTemplate.xlsx';
      window.open(path);
    },
    addSupplierFn() {
      // 添加供应商
      this.editSupplier = this.deepCopy(this.newSupplier);
      // this.editSupplier = Object.assign({}, this.newSupplier)
      this.isEditSupplier = true;
      this.editSupplierType = "1";
      this.isShowSupplier = true;
    },
    editSupplierFn(type, val, data) {
      // 查看、编辑供应商
      let temp = {
        supplierIds: [data],
        businessDeptIds: this.businessDeptIds,
      };
      this.axios.post(api.managementInfo, temp).then((res) => {
        if (res.data.code == 0) {
          // console.log('查看：', res.data.datas);
          this.editSupplier = res.data.datas;
          this.editSupplier.supplierAttachmentIds = [];
          this.editSupplier.supplierContactIds = [];
          this.editSupplier.supplierPaymentIds = [];
          this.isEditSupplier = val;
          this.editSupplierType = type;
          //地址字符串转数组
          if (this.editSupplier.returnAddress) {
            this.editSupplier.returnAddress =
              this.editSupplier.returnAddress.split(",");
          }
          this.editSupplier.setupStatus =
            this.editSupplier.setupStatus == 0 ? false : true;
          this.isShowSupplier = true;
        }
      });
    },
    delOrDisFn(data, type) {
      let v = this;
      /* let obj = {
        supplierId: data.supplierId
      }; */
      v.operationType = type;
      v.axios.post(api.goodsQuery, data.supplierId).then((res) => {
        if (res.data.code == 0) {
          if (res.data.datas) {
            v.supplierHasMsg = true;
          } else {
            v.supplierHasMsg = false;
          }
          v.isShowConfirmDel = true;
        }
      });
    }, // 文件上传成功的回调
    okUpload(data, file, fileList) {
      // let noTSatisfiableStr = data.datas;
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          this.getList();
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          // window.location = this.$store.state.imgUrl + data.datas;
          this.importExcel = false;
        }
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入供应商失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      } else {
        this.$Message.error("导入失败，请参考模板填写");
      }
    }, // 上传失败回调
    uploadError() {
      this.$Message.error("导入失败，格式有误");
      this.importExcel = false;
    },
    formatError(file) {
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
      // this.importExcel = false
    },
    exportEcxel(val) {
      // 批量导出
      if (this.suppliersData.length === 0) {
        this.$Message.error("无数据导出");
      } else {
        const filterParams = this.getPageParams();
        let params = {};
        if (val === "single") {
          params.businessDeptIds = filterParams.businessDeptIds;
          params.supplierIds = [];
          this.selectionArr.forEach((n, i) => {
            params.supplierIds.push(n.supplierId);
          });
        } else {
          params = filterParams;
        }
        this.$Message.warning({
          content: "正在导出数据",
          duration: 5,
        });
        this.axios.post(api.batchExport, params).then((response) => {
          if (response.data.code == 0) {
            this.$Message.success("导出成功");
            this.getList();
            // let newTab = window.open('about:blank');
            // newTab.location.href = v.$store.state.imgUrl + response.data.datas;
          }
        });
      }
    },
    validBatchEdit() {
      return new Promise((resolve) => {
        if (this.formBatchEdit.items.some((i) => i.value && i.value.length > 0)) {
          resolve(true);
        } else {
          this.$Message.info("请输入您要修改的数据");
          resolve(false);
        }
      });
    },
    batchBatchEdit() {
      this.validBatchEdit().then((valid) => {
        if (valid) {
          let params = {
            supplierIds: this.selectionArr.map((i) => i.supplierId),
          };
          this.formBatchEdit.items.forEach((i) => {
            if (i.isCheck && i.value) {
              if (i.key === "settlementType") {
                // 结算方式
                params.settlementTime = i.value1;
                params.settlementTimeValue = i.value3; // 结算
                params.settlementPeriod = i.value2; // 结算周期
              } else if (i.key === "developerId") {
                params.developerName = this.developerArr.filter(
                  (j) => j.userId === i.value
                )[0].name;
              } else if (i.key === "purchaserId") {
                params.purchaserName = this.developerArr.filter(
                  (j) => j.userId === i.value
                )[0].name;
              }
              params[i.key] = i.value;
            }
          });
          this.axios.post(api.update_editSupplier, params).then((response) => {
            if (response.data.code === 0) {
              this.$Message.success("操作成功");
              this.model2 = false;
              this.search();
            }
          });
        }
      });
    },
    batchOperation(str) {
      // 0提交 1审核通过 2审核驳回 3移入草稿 4作废 5删除 6移入待审核 7停用
      let v = this;
      if (v.selectionArr.length === 0) {
        switch (str) {
          case "0":
            v.$Message.error("请选择需要提交的供应商");
            break;
          case "1":
            v.$Message.error("请选择需要审核的供应商");
            break;
          case "2":
            v.$Message.error("请选择需要驳回的供应商");
            break;
          case "5":
            v.$Message.error("请选择需要删除的供应商");
            break;
          case "6":
            v.$Message.error("请选择需要移入待审核的供应商");
            break;
          case "7":
            v.$Message.error("请选择需要停用的供应商");
            break;
          case "8":
            v.$Message.error("请选择需要删除/停用的供应商");
            break;
        }
      } else {
        let obj = {
          operationType: str,
          supplierIds: [],
        };
        v.selectionArr.forEach((n, i) => {
          obj.supplierIds.push(n.supplierId);
        });
        v.axios.post(api.operation, obj).then((response) => {
          if (response.data.code == 0) {
            v.$Message.success("操作成功！");
            if (str == "7" || str == "8") {
              v.isShowConfirmDel = false;
            }
            if (v.isShowSupplier) {
              v.isShowSupplier = false;
            }
            v.getList();
          }
        });
      }
    },
    quoteFn(data) {
      let v = this;
      sessionStorage.setItem("supplierId", data.supplierId);
      // let host = common.getHost();
      v.$router.push("supplierProduct");
      // window.location.href = host + '/supplierManagement.html#/supplierProduct';
    },
    handleSuccess(res, file, fileList) {
      // 上传成功
      let v = this;
      if (res.code == 0) {
        file.url = res.datas[0];
        let arr = file.url.split("/");
        let name = arr[arr.length - 1];
        file.name = name.split(".")[0];
        v.editSupplier.supplierAttachmentList.push({
          attachmentDesc: "",
          attachmentUrl: file.url,
          supplierAttachmentId: "",
        });
      } else {
        v.$Message.error("上传失败，请重试");
        new Error("图片上传接口异常！");
      }
    },
    handleFormatError(file) {
      // 上传文件格式有误
      let v = this;
      v.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[jpg、png或gif]",
      });
    },
    handleMaxSize(file) {
      // 上传文件超过限定大学
      this.$Notice.warning({
        title: "文件大小受限",
        desc: "文件 " + file.name + " 太大, 不能超过2M",
      });
    },
    deleteImg(index) {
      if (
        this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
      ) {
        this.editSupplier.supplierAttachmentIds.push(
          this.editSupplier.supplierAttachmentList[index].supplierAttachmentId
        );
      }
      this.editSupplier.supplierAttachmentList.splice(index, 1);
    },
    saveSupplierFn() {
      let v = this;
      v.editSupplierType = "";
      v.isShowSupplier = false;
      v.pageParamsStatus = true;
    },
    submitSupplierFn() {
      this.editSupplierType = "";
      this.isShowSupplier = false;
      this.pageParamsStatus = true;
    },
    closeSupplierModal() {
      this.isShowSupplier = false;
      this.editSupplierType = "";
    },
    logChangePageSize(pageSize) {
      this.operationLog.pageSize = pageSize;
    },
    logChangePage(page) {
      this.operationLog.pageNum = page;
    },
    showOperationLogFn(id) {
      let v = this;
      v.operationLog.supplierId = id;
      v.Tableloading = true;
      v.axios.post(api.managementLogList, v.operationLog).then((res) => {
        v.Tableloading = false;
        if (res.data.code == 0) {
          v.operationLogData = res.data.datas.list;
          v.operationLog.total = res.data.datas.total;
        }
      });
      v.isShowOperationLog = true;
    },
    getDateValue(value) {
      // 获取日期返回值
      let v = this;
      if (value && value.length > 0 && value[0] != "") {
        v.pageParams.startIntroduceTime = value[0];
        v.pageParams.endIntroduceTime = value[1];
      }
    },
    resetDate() {
      // 清空日期
      let v = this;
      v.pageParams.startIntroduceTime = null;
      v.pageParams.endIntroduceTime = null;
    },
  },
};
</script>
<style lang="less" scoped>
.form-item-notlabel{
  :deep(.ivu-form-item-label) {
    display: none;
  }
  :deep(.ivu-form-item-content) {
    width: calc(var(--list-form-item-width) + 110px);
  }
}
</style>