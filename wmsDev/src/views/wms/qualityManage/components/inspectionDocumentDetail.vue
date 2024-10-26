<template>
  <div>
    <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading">
      <div slot="lefts">
        <Button type="primary" v-if="isEdit" @click="saveData" :loading="saveLoading">保存</Button>
        <Button class="ml10" @click="modalVisible = false;">取消</Button>
      </div>
      <div class="model-content">
        <Form ref="formDocument" :model="formData" :label-width="110" :inline="true" class="detail-form formDetail">
          <div class="stock-block">
            <div class="title">基本信息</div>
            <div>
              <FormItem label="质检单号:">
                <span class="span-block">{{ wmsReceiptCheckBase.receiptCheckNo || '' }}</span>
              </FormItem>
              <FormItem label="质检状态:">
                <span class="span-block">
                  {{ checkStatusList[wmsReceiptCheckBase.checkStatus] &&
                    checkStatusList[wmsReceiptCheckBase.checkStatus].label }}
                </span>
              </FormItem>
              <FormItem label="采购单号:">
                <span class="span-block">{{ wmsReceiptCheckBase.purchaseNo || '' }}</span>
              </FormItem>
              <FormItem label="入库单号:">
                <span class="span-block">{{ wmsReceiptCheckBase.receiptNo || '' }}</span>
              </FormItem>
              <FormItem label="供应商:">
                <span class="span-block">{{ wmsReceiptCheckBase.supplierName || '' }}</span>
              </FormItem>
              <FormItem label="下单数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.purchaseNumber || 0 }}</span>
              </FormItem>
              <FormItem label="应检数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.planCheckNumber || 0 }}</span>
              </FormItem>
              <FormItem label="质检比例:">
                <span class="span-block">{{ wmsReceiptCheckBase.checkRate || 0 }}%</span>
              </FormItem>
              <FormItem label="送检数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.expectedCheckNumber || 0 }}</span>
              </FormItem>
              <FormItem label="已检合格数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.qualifiedCheckedNumber || 0 }}</span>
              </FormItem>
              <FormItem label="已检问题数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.failedCheckedNumber || 0 }}</span>
              </FormItem>
              <FormItem label="待检数量:">
                <span class="span-block">{{ wmsReceiptCheckBase.awaitCheckedNumber || 0 }}</span>
              </FormItem>
              <FormItem label="质检类型:">
                <span>
                  {{ checkTypeList[wmsReceiptCheckBase.checkType] && checkTypeList[wmsReceiptCheckBase.checkType].label }}
                </span>
              </FormItem>
              <FormItem label="创建时间:">
                <span class="span-block">{{ wmsReceiptCheckBase.createdTime || '' }}</span>
              </FormItem>
              <FormItem label="备货仓库:">
                <span class="span-block">
                  <span v-for="(item, index) in warehouseList" :key="index + 'warehouseList'">
                    <span v-if="item.warehouseId === wmsReceiptCheckBase.warehouseId">
                      {{ item.warehouseName || '' }}
                    </span>
                  </span>
                </span>
              </FormItem>
              <FormItem label="采购员:">
                <span class="span-block"
                  v-if="wmsReceiptCheckBase.purchaserId && purchaserList[wmsReceiptCheckBase.purchaserId]">
                  {{ purchaserList[wmsReceiptCheckBase.purchaserId].userName }}
                </span>
              </FormItem>
              <FormItem label="存放编码:">
                <span class="span-block">
                  {{ modalData.slotCode || '' }}
                </span>
              </FormItem>
              <FormItem label="质检完成时间:">
                <span class="span-block">
                  {{ modalData.checkFinishTime || '' }}
                </span>
              </FormItem>
              <FormItem label="类型:">
                <span class="span-block">
                  {{ wmsReceiptCheckBase.qualityInspectionType ? '维修' : '质检' }}
                </span>
              </FormItem>
              <FormItem label="维修内容:">
                <span class="span-block">
                  {{ wmsReceiptCheckBase.maintenanceContent || '' }}
                </span>
              </FormItem>
            </div>
          </div>
          <div class="stock-block">
            <div class="title flex-title">
              <span>质检备注</span>
              <Icon class="md-add--sty" type="md-add" v-if="isEdit" @click="editRemark" />
            </div>
            <div style="padding-left: 30px;">
              <div v-for="(item, index) in (totalData.receiptCheckRemarkDTO || [])" :key="index + 'receiptCheckRemarkDTO'"
                class="remark-record">
                <div>{{ item.createdTime || '' }}</div>
                <div class="remark-record_right">
                  <span v-if="item.createdBy">{{ item.createdBy }}：</span>
                  <div class="remark-record_content">{{ item.remark }}</div>
                </div>
              </div>
              <div class="remark-submit mt10" v-if="isEdit && remarkVisible">
                <FormItem label="" class="autoLong" :label-width="0" prop="remark"
                  :rules="{ required: true, message: '请输入质检备注', trigger: 'blur' }">
                  <Input v-model="formData.remark" maxlength="200" show-word-limit type="textarea" style="width: 426px" />
                </FormItem>
                <Button type="primary" @click="submitRemark" :loading="remarkLoading">保存</Button>
              </div>
            </div>
          </div>
          <div class="stock-block">
            <div class="title">商品质检信息</div>
            <div>
              <div class="quality-setting mb10" v-if="isEdit">
                <FormItem label="质检类型:" class="autoLong radio-fontsize0" :label-width="80">
                  <RadioGroup v-model="formData.qualityType" @on-change="qualityTypeChange">
                    <Radio :label="item.value" v-for="(item, index) in qualityTypeList" :key="index + 'qualityType'">
                      {{ item.label }}
                    </Radio>
                  </RadioGroup>
                </FormItem>
                <span class="linkText cursorClick quality-setting-a" @click="settingQualityNum"
                  v-if="formData.qualityType == 1">批量设置抽检数量</span>
                <FormItem label="质检总比例:" class="autoLong" :label-width="80">
                  <div class="span-block">{{ totalCheckRate }}%</div>
                </FormItem>
              </div>
              <Table border highlight-row :columns="commodityColumns" :data="formData.wmsReceiptCheckDetailBaseList">
                <template slot-scope="{ row, index }" slot="commodityInfo">
                  <div class="good-block">
                    <div class="mr10">
                      <dyt-previewImg :url="row.allImageUrl"></dyt-previewImg>
                    </div>
                    <div class="order-item">
                      <div class="order-li">SKU：<span>{{ row.sku || '' }}</span></div>
                      <div class="order-li--text">
                        <Tooltip :content="row.description" :disabled="!row.description" placement="top">
                          {{ row.description || '' }}</Tooltip>
                      </div>
                      <div class="order-li order-li--tag">{{ row.goodsAttributes || '' }}</div>
                    </div>
                  </div>
                </template>
                <template slot-scope="{ row, index }" slot="checkStatus">
                  <span>
                    {{ checkStatusList[row.checkStatus] && checkStatusList[row.checkStatus].label }}
                  </span>
                </template>
                <template slot-scope="{ row, index }" slot="planCheckNumber">
                  <FormItem label="" class="autoLong inspected-num" :label-width="0"
                    :prop="'wmsReceiptCheckDetailBaseList.' + index + '.planCheckNumber'"
                    :rules="{ validator: validatePlanCheckNumber, trigger: 'change', purchaseNumber: row.purchaseNumber }"
                    v-if="isEdit">
                    <Input v-model="formData.wmsReceiptCheckDetailBaseList[index].planCheckNumber" type="number"
                      class="spinButton" :disabled="formData.qualityType != 1" @input="planCheckNumberChange(index)" />
                  </FormItem>
                  <div v-else>{{ row.planCheckNumber || 0 }}</div>
                </template>
                <!-- 表格-质检标准列 -->
                <template slot-scope="{ row, index }" slot="checkRate">
                  <div class="linkText cursorClick" @click="qualiTemplate(row)">
                    <div>{{ row.checkRate || 0 }}%</div>
                    <div v-if="row.goodsQualityInfo">{{ row.goodsQualityInfo.qualityTemplateName || '' }}</div>
                  </div>
                </template>
                <template slot-scope="{ row, index }" slot="failedCheckedNumber">
                  <span :class="row.failedCheckedNumber > 0 ? 'linkText cursorClick' : ''"
                    @click="seeQuanlifyProduct(row)">{{
                      row.failedCheckedNumber || 0 }}</span>
                </template>
                <!-- <template slot-scope="{ row, index }" slot="checkerId">
                  <span v-for="(item, key) in qualityPersonList" :key="key + 'qualityPersonList'">
                    <span v-if="item.checkCreatedBy === row.checkerId">
                      {{ item.checkCreatedByName || '' }}
                    </span>
                  </span>
                </template> -->
              </Table>
              <!-- 详情做分页按钮 -->
              <div class="pagesMain" v-if="!isEdit">
                <dyt-pagination :total="totalGoodList.length" :current="commodityPages.pageNum"
                  :page-size="commodityPages.pageSize" @on-change="commodityChangePage"
                  @on-page-size-change="commodityChangePageSize">
                </dyt-pagination>
              </div>
            </div>
          </div>
          <div class="stock-block">
            <div class="title">送检批次信息</div>
            <div>
              <Table border highlight-row :columns="inspectColumns"
                :data="(totalData.queryBatchCheckResultList ||
                  []).slice((inspectPages.pageNum - 1) * inspectPages.pageSize, inspectPages.pageNum * inspectPages.pageSize)">
                <template slot-scope="{ row, index }" slot="receiptBatchNo">
                  <span class="linkText cursorClick" @click="seeInspectionDetail(row)">{{ row.receiptBatchNo || ''
                  }}</span>
                </template>
                <template slot-scope="{ row, index }" slot="checkStatus">
                  <span>
                    {{ checkStatusList[row.checkStatus] && checkStatusList[row.checkStatus].label }}
                  </span>
                </template>
                <template slot-scope="{ row, index }" slot="receiptNo">
                  <span class="linkText cursorClick" @click="seePickingNoDetail(row)">{{ row.receiptNo || '' }}</span>
                </template>
                <template slot-scope="{ row, index }" slot="checkRate">
                  <span>{{ row.checkRate || 0 }}%</span>
                </template>
                <!-- <template slot-scope="{ row, index }" slot="createdBy">
                  <span v-for="(item, key) in qualityPersonList" :key="key + 'inspectColumnscreatedBy'">
                    <span v-if="item.checkCreatedBy === row.createdBy">
                      {{ item.checkCreatedByName || '' }}
                    </span>
                  </span>
                </template> -->
              </Table>
              <!--分页按钮-->
              <div class="pagesMain" v-if="totalData.queryBatchCheckResultList">
                <dyt-pagination :total="totalData.queryBatchCheckResultList.length" :current="inspectPages.pageNum"
                  :page-size="inspectPages.pageSize" @on-change="inspectChangePage"
                  @on-page-size-change="inspectChangePageSize">
                </dyt-pagination>
              </div>
            </div>
          </div>
          <div class="stock-block">
            <div class="title">质检批次信息</div>
            <div>
              <Table border highlight-row :columns="qualityColumns"
                :data="(totalData.queryQualityBatchInfoList ||
                  []).slice((qualityPages.pageNum - 1) * qualityPages.pageSize, qualityPages.pageNum * qualityPages.pageSize)">
                <template slot-scope="{ row, index }" slot="checkAttachment">
                  <div class="picture-width">
                    <dyt-previewImg :fileList="returnList(row)"
                      :imgOption="{ listWidth: 50, listHeight: 50, mode: 'multiple' }">
                    </dyt-previewImg>
                  </div>
                </template>
              </Table>
              <!--分页按钮-->
              <div class="pagesMain" v-if="totalData.queryQualityBatchInfoList">
                <dyt-pagination :total="totalData.queryQualityBatchInfoList.length" :current="qualityPages.pageNum"
                  :page-size="qualityPages.pageSize" @on-change="qualityChangePage"
                  @on-page-size-change="qualityChangePageSize">
                </dyt-pagination>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </dyt-model>
    <!-- 质检详情 -->
    <quality-inspection-details :modelVisible.sync="inspectVisible" :modalData="inspectData">
    </quality-inspection-details>
    <!-- 入库单详情 -->
    <warehouse-order-details :dialogVisible.sync="warehouseOrderVisible" :modalData="warehouseOrderData">
    </warehouse-order-details>
    <!-- 批量设置抽检数量 -->
    <setting-quality-num :modelVisible.sync="settingVisible" :detailData="formData" @settingRules="settingRules">
    </setting-quality-num>
    <!-- 质检问题产品转合格产品 -->
    <quality-problem-products :modelVisible.sync="problemVisible" :modalData="problemData">
    </quality-problem-products>
    <!-- 质检模板详情 -->
    <qualityInspectionTemplate :modelVisible.sync="qualiInfo.visible" :modalData="qualiInfo.data" />
  </div>
</template>
<script>
import Big from 'big.js';
import api from '@/api/api';
import regular from '@/utils/regular.js';
import qualityInspectionDetails from './qualityInspectionDetails';
import warehouseOrderDetails from './warehouseOrderDetails';
import settingQualityNum from './settingQualityNum';
import qualityProblemProducts from './qualityProblemProducts';
import { checkStatusList, checkTypeList } from './commonData.js';
import qualityInspectionTemplate from './qualityInspectionTemplate';
export default {
  name: "inspectionDocumentDetail",
  components: { qualityInspectionDetails, warehouseOrderDetails, settingQualityNum, qualityProblemProducts, qualityInspectionTemplate },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => { return {} }
    },
    type: {
      type: String,
      default: () => { return 'detail' }
    },
  },
  data() {
    return {
      pageLoading: false,
      modalVisible: false,
      formData: {
        remark: '', // 备注
        qualityType: 0, // 选择抽检类型
        wmsReceiptCheckDetailBaseList: [], // 商品信息
      },
      commodityColumns: [
        {
          title: '商品信息',
          slot: 'commodityInfo',
          minWidth: 220,
          align: 'center',
        },
        {
          title: '质检状态',
          slot: 'checkStatus',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '下单数',
          key: 'purchaseNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '应检数',
          slot: 'planCheckNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '质检标准',
          slot: 'checkRate',
          minWidth: 120,
          align: 'center',
        },
        {
          title: '送检数',
          key: 'expectedCheckNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '已检合格数',
          key: 'qualifiedCheckedNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '已检问题数',
          slot: 'failedCheckedNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '待检数',
          key: 'awaitCheckedNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '待应检数',
          key: 'awaitPlanCheckedNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '退货数',
          key: 'refundNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '销毁数',
          key: 'destructionNumbe',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '剩余数',
          key: 'remainNumber',
          minWidth: 90,
          align: 'center',
        },
        {
          title: '质检员',
          key: 'checkerId',
          minWidth: 90,
          align: 'center',
        },
      ], // 商品质检信息
      inspectColumns: [
        {
          title: '送检批次号',
          slot: 'receiptBatchNo',
          minWidth: 160,
          align: 'center',
        },
        {
          title: '质检状态',
          slot: 'checkStatus',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '入库单编号',
          slot: 'receiptNo',
          minWidth: 170,
          align: 'center',
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '送检数量',
          key: 'expectedCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '应检数量',
          key: 'planCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '质检比例',
          slot: 'checkRate',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '已检合格数',
          key: 'passCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '已检问题数',
          key: 'problemCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '待质检数量',
          key: 'waitCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '待应检数量',
          key: 'awaitPlanCheckedNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '质检人',
          key: 'createdBy',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '创建时间',
          key: 'createdTime',
          width: 100,
          align: 'center',
        },
      ], // 送检批次信息
      qualityColumns: [
        {
          title: '质检记录号',
          key: 'receiptBatchCheckDetailNo',
          minWidth: 170,
          align: 'center',
        },
        {
          title: '送检批次号',
          key: 'receiptBatchNo',
          minWidth: 160,
          align: 'center',
        },
        {
          title: '问题原因',
          key: 'problemCheckReason',
          minWidth: 120,
          align: 'center',
          tooltip: true,
        },
        {
          title: '质检图片',
          slot: 'checkAttachment',
          width: 150,
          align: 'center',
        },
        {
          title: '备注',
          key: 'remark',
          minWidth: 120,
          align: 'center',
          tooltip: true,
        },
        {
          title: '质检数',
          key: 'awaitPlanCheckedNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '合格数',
          key: 'passCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '问题数',
          key: 'problemCheckNumber',
          minWidth: 100,
          align: 'center',
        },
        {
          title: '质检时间',
          key: 'createdTime',
          width: 100,
          align: 'center',
        },
        {
          title: '质检人',
          // slot: 'createdBy',
          key: 'createdBy',
          minWidth: 100,
          align: 'center',
        },
      ], // 质检批次信息
      inspectVisible: false, // 质检详情弹框
      inspectData: {}, // 质检详情数据
      warehouseOrderVisible: false, // 入库单详情弹框
      warehouseOrderData: {}, // 入库单详情数据
      qualityTypeList: [
        {
          label: '免检',
          value: 0,
        },
        {
          label: '全检',
          value: 2,
        },
        {
          label: '抽检',
          value: 1,
        }
      ],
      settingVisible: false, // 批量设置抽检数量弹框
      editIndex: [], // 记录应检数量修改行
      problemVisible: false, // 质检问题产品详情
      problemData: {}, // 质检问题产品详情数据
      remarkVisible: false, // 添加备注
      isEdit: false, // 是否可编辑
      checkStatusList: checkStatusList, // 质检状态下拉列表
      checkTypeList: checkTypeList, // 质检类型
      wmsReceiptCheckBase: {}, // 基本信息数据
      totalData: {}, // 详情接口数据
      warehouseList: [], // 仓库列表
      // qualityPersonList: [], // 质检人员列表
      saveLoading: false, // 保存加载
      remarkLoading: false, // 备注保存加载
      purchaserList: {}, // 采购人员
      commodityPages: { // 商品分页信息
        pageNum: 1,
        pageSize: 10,
      },
      inspectPages: { // 送检批次分页信息
        pageNum: 1,
        pageSize: 10,
      },
      qualityPages: { // 质检批次分页信息
        pageNum: 1,
        pageSize: 10,
      },
      totalGoodList: [], // 总商品列表
      qualiInfo: {
        visible: false,
        data: {},
      },
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    },
    // 设置对应sku的质检比例
    'formData.wmsReceiptCheckDetailBaseList': {
      handler(nval, oval) {
        // 质检中或质检完成使用后端返回，因为后续质检比例会变动
        if ([1, 2, '1', '2'].includes(this.wmsReceiptCheckBase.checkStatus)) return;
        let editIndex = this.editIndex || [];// 变动的数据行
        if (!editIndex.length) return false;
        editIndex.forEach(index => {
          let row = this.formData.wmsReceiptCheckDetailBaseList[index] || {};
          let proportion = new Big(row.planCheckNumber || 0).div(row.purchaseNumber || 0).times(100);
          proportion = this.keepTwoDecimal(proportion);
          this.$set(this.formData.wmsReceiptCheckDetailBaseList[index], 'checkRate', proportion);
        })
      },
      deep: true
    },
  },
  computed: {
    // 总质检比例 = 总应检数量 / 总下单数量 * 100%；
    totalCheckRate() {
      let wmsReceiptCheckDetailBaseList = this.formData.wmsReceiptCheckDetailBaseList || [];
      if (!wmsReceiptCheckDetailBaseList.length) return 0;
      let [totalPurchaseNumber, totalPlanCheckNumber] = [0, 0];
      wmsReceiptCheckDetailBaseList.forEach(k => {
        totalPurchaseNumber = new Big(totalPurchaseNumber).plus(k.purchaseNumber || 0);// 总下单数
        totalPlanCheckNumber = new Big(totalPlanCheckNumber).plus(k.planCheckNumber || 0);// 总应检数
      })
      let propertion = new Big(totalPlanCheckNumber || 0).div(totalPurchaseNumber || 0).times(100);
      propertion = this.keepTwoDecimal(propertion);
      return propertion;
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.isEdit = this.type == 'edit';// 是否编辑页面

      this.resetData();
      this.getDetail();
      this.getWarehouseList();
      this.getPurchaserList();
      // this.getQualityName();
    },
    // 重置数据
    resetData() {
      this.formData.remark = '';
      this.formData.qualityType = 0;
      this.formData.wmsReceiptCheckDetailBaseList = [];

      this.inspectData = {};
      this.warehouseOrderData = {};
      this.editIndex = [];
      this.problemData = {};
      this.wmsReceiptCheckBase = {};
      this.totalData = {};
    },
    // 关闭窗口
    backList() {
      this.modalVisible = false;
    },
    // 获取详情
    getDetail(type) {
      this.pageLoading = true;
      this.axios.get(api.quality_getReceiptCheckDetail, { params: { receiptCheckNo: this.modalData.receiptCheckNo } }).then(({ data }) => {
        if (data.code !== 0) return;
        let datas = data.datas || {};
        this.totalData = datas;
        if (type === 'remark') return;// 只需要更新备注部分
        this.wmsReceiptCheckBase = datas.wmsReceiptCheckBase || {};// 基本信息
        this.formData.qualityType = Number(this.wmsReceiptCheckBase.checkType || 0);
        this.totalGoodList = datas.wmsReceiptCheckDetailBaseList || [];// 总商品列表
        this.resetPages();
        this.sliceGoodList(this.commodityPages.pageNum, this.commodityPages.pageSize);
      }).finally(() => {
        this.pageLoading = false;
      })
    },
    // 切割商品信息
    sliceGoodList(page, pageSize) {
      let list = [];
      if (this.isEdit) {
        list = this.totalGoodList;
      } else {
        list = this.totalGoodList.slice((page - 1) * pageSize, page * pageSize);// 切割对应分页的数据
      }
      this.formData.wmsReceiptCheckDetailBaseList = list.map(k => {
        // 质检中或质检完成使用后端返回，因为后续质检比例会变动（接口返回 checkRate 的值多少就多少， 不做更改）
        // if ([0, '0'].includes(this.wmsReceiptCheckBase.checkStatus)) {
        //   let checkRate = new Big(k.planCheckNumber || 0).div(k.purchaseNumber || 0).times(100);
        //   checkRate = this.keepTwoDecimal(checkRate);
        //   k.checkRate = checkRate;// 质检比例
        // }
        k.copyplanCheckNumber = k.planCheckNumber;// 质检比例
        return k;
      });
    },
    // 重置页数
    resetPages() {
      let arr = ['commodityPages', 'inspectPages', 'qualityPages'];
      arr.forEach(k => {
        this[k].pageNum = 1;
        this[k].pageSize = 10;
      })
    },
    // 查看质检详情
    seeInspectionDetail(row) {
      this.inspectData = row;
      this.inspectVisible = true;
    },
    // 查看入库单详情
    seePickingNoDetail(row) {
      this.warehouseOrderData = row;
      this.warehouseOrderVisible = true;
    },
    // 批量设置抽检数量
    settingQualityNum() {
      this.settingVisible = true;
    },
    // 设置规则返回
    settingRules(datas) {
      let _self = this;
      let { type, value } = datas;
      let wmsReceiptCheckDetailBaseList = this.$common.copy(this.formData.wmsReceiptCheckDetailBaseList || []);
      let fun = {
        // 相同SPU的产品，总抽检比例
        1() {
          let skuList = [];
          let spuList = fun.computedSpuList();
          // console.log(spuList, 1);
          Object.keys(spuList).forEach(k => {
            skuList.push(...spuList[k].skuList);
          });
          // console.log(skuList);
          let editIndex = [];
          skuList.forEach((k, i) => {
            editIndex.push(i);
            _self.$set(_self.formData.wmsReceiptCheckDetailBaseList[i], 'planCheckNumber', k.skuPlanCheckNumber); // 设置sku的应检数
          })
          _self.editIndex = editIndex;
        },
        // 每款产品(SKU)，抽检比例
        2() {
          let editIndex = [];
          wmsReceiptCheckDetailBaseList.forEach((k, i) => {
            editIndex.push(i);
            // 计算SKU的应检数量 = 下单数量 * SKU抽检比例，四舍五入
            let planCheckNumber = Math.round(new Big(value || 0).div(100).times(k.purchaseNumber || 0));
            _self.$set(_self.formData.wmsReceiptCheckDetailBaseList[i], 'planCheckNumber', planCheckNumber); // 设置sku的应检数
          })
          _self.editIndex = editIndex;
        },
        // 每款产品(SKU)，抽检件数
        3() {
          let editIndex = [];
          wmsReceiptCheckDetailBaseList.forEach((k, i) => {
            editIndex.push(i);
            _self.$set(_self.formData.wmsReceiptCheckDetailBaseList[i], 'planCheckNumber', value); // 设置sku的应检数
          })
          _self.editIndex = editIndex;
        },
        // 生成number个min-max不重复的随机数
        random(min, max, number) {
          let arr = [];
          while (arr.length < number) { // 原数组长度为0，每次成功添加一个元素后长度加1，当数组添加最后一个数字之前长度为number即可
            let num = fun.randomNumBoth(min, max); // 生成一个随机整数
            if (arr.length === 0) { // 如果数组长度为0则直接添加到arr数组
              arr.push(num);
            } else {
              for (let i = 0; i < arr.length; i++) { // 当新生成的数字与数组中的元素不重合时则添加到arr数组
                if (arr.join(',').indexOf(num) < 0) {
                  arr.push(num);
                }
              }
            }
          }
          return arr;
        },
        // 生成min-max的随机数
        randomNumBoth(min, max) {
          var Range = max - min;
          var Rand = Math.random();
          var num = min + Math.floor(Rand * Range); // 舍去
          return num;
        },
        // 计算spu内sku的应检数量
        computedSpuList() {
          // 先按SPU算出总的应检数量，四舍五入；
          // 再按SKU算出SKU的整配抽检数量 = 商值(SKU下单数据 * SPU抽检比例)，余值需要用来计算随机抽检数量；
          // 再计算出 SPU随机抽检总数量 =  SPU应检数量 - SKU整配抽检数量之和；
          // 再循环SPU随机抽检总数量，{ 余值(SKU下单数据 * SPU抽检比例)不为0的SKU，随机得到SKU后，此次SKU的随机抽检数量为1 }，最终得出SKU的随机抽检数量；
          // SKU的应检数量 = SKU整配数量 + SKU随机抽检数量；

          // spu归类
          let spuList = {}
          wmsReceiptCheckDetailBaseList.forEach((k, i) => {
            k.recordIndex = i;// 记录原行数
            k.recordPlanCheckNumber = 0;// 应检数
            if (k.spu in spuList) {
              spuList[k.spu].skuList.push(k);
            } else {
              spuList[k.spu] = { skuList: [k] };
            }
          })
          // 计算总的应检数量
          Object.keys(spuList).forEach(k => {
            let spuItem = spuList[k];
            let totalPlanCheckNumber = 0;// spu总下单数

            spuItem.skuList.forEach(skuItem => {
              totalPlanCheckNumber = new Big(totalPlanCheckNumber).plus(skuItem.purchaseNumber || 0);// spu总下单数
              let skuPlanCheckNumber = new Big(value || 0).div(100).times(skuItem.purchaseNumber || 0) - 0;// SKU整配数量
              skuItem.skuPlanCheckNumber = parseInt(skuPlanCheckNumber);// SKU的整配抽检数量
              let list = skuPlanCheckNumber ? String(skuPlanCheckNumber).split('.') : [];
              let num = Number(list[1] || 0);
              skuItem.randomPool = !!(num > 0);// 大于0丢入随机池
            })
            let spuPlanCheckNumber = Math.round(new Big(value || 0).div(100).times(totalPlanCheckNumber));// spu总应检数
            spuItem.totalPlanCheckNumber = totalPlanCheckNumber - 0;// spu总应检数
            spuItem.spuPlanCheckNumber = spuPlanCheckNumber;// spu总应检数

            let surplusPlanCheckNumber = spuPlanCheckNumber;// 随机池要抽取的数量
            spuItem.skuList.forEach(skuItem => {
              surplusPlanCheckNumber = Number(new Big(surplusPlanCheckNumber).minus(skuItem.skuPlanCheckNumber));
            })
            spuItem.surplusPlanCheckNumber = surplusPlanCheckNumber;// 随机池要抽取的数量

            // 存在随机池要抽取的数量
            if (surplusPlanCheckNumber > 0) {
              let surplusSkuList = spuItem.skuList.filter(skuItem => skuItem.randomPool);
              // 在多个sku内抽取要质检的个数
              let suplusArr = fun.random(0, surplusSkuList.length, surplusPlanCheckNumber);
              suplusArr.forEach(k => {
                // 对象引用存入值
                surplusSkuList[k].draw = true;
                surplusSkuList[k].skuPlanCheckNumber++;
              })
            }
          })
          return spuList;
        }
      }
      type && fun[type]();
    },
    // 应检数输入
    planCheckNumberChange(index) {
      this.editIndex = [index];
    },
    // 应检数量限制
    validatePlanCheckNumber(rule, value, callback) {
      if (value === '' || value === undefined || value === null) {
        return callback(new Error('请输入内容'));
      }
      if (!regular.integer.test(value)) {
        return callback(new Error('限大于或等于0的整数'));
      }
      if (new Big(value || 0).minus(rule.purchaseNumber || 0) > 0) {
        return callback(new Error('不能小于下单数'));
      }
      return callback();
    },
    // 质检类型变更
    qualityTypeChange(e) {
      let wmsReceiptCheckDetailBaseList = this.formData.wmsReceiptCheckDetailBaseList || [];
      let editIndex = [];
      wmsReceiptCheckDetailBaseList.forEach((k, i) => {
        editIndex.push(i);
        let num = 0;
        if (e === 0) num = 0;
        if (e === 1) num = k.copyplanCheckNumber || 0;
        if (e === 2) num = k.purchaseNumber || 0;
        this.$set(this.formData.wmsReceiptCheckDetailBaseList[i], 'planCheckNumber', num); // 设置sku的应检数
      })
      this.editIndex = editIndex;
    },
    // 查看问题产品
    seeQuanlifyProduct(row) {
      if (row.failedCheckedNumber <= 0) return;
      this.problemData = Object.assign({}, row, { apiType: 'detail', receiptCheckNo: this.wmsReceiptCheckBase.receiptCheckNo });
      this.problemVisible = true;
    },
    // 保存质检备注
    submitRemark() {
      this.$refs['formDocument'].validateField('remark', (valid) => {
        if (valid === '请输入质检备注') return false;
        let params = {};
        params.receiptCheckId = this.modalData.receiptCheckId;// 质检单ID
        params.remark = this.formData.remark;// 备注
        params.createdBy = this.$store.state.userInfo && this.$store.state.userInfo.userName;// 创建人

        this.remarkLoading = true;
        this.axios.post(api.quality_createRemarkDTO, params).then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success('操作成功');
          this.formData.remark = '';
          this.remarkVisible = false;
          this.getDetail('remark');
        }).finally(() => {
          this.remarkLoading = false;
        })
      })
    },
    // 打开备注
    editRemark() {
      this.remarkVisible = true;
    },
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch('getWarehouseList').then(res => {
        this.warehouseList = res || [];
      })
    },
    // 获取采购人员列表
    getPurchaserList() {
      this.$store.dispatch('getPurchaserList').then(res => {
        this.purchaserList = res || {};
      })
    },
    // // 获取质检人员列表
    // getQualityName() {
    //   this.$store.dispatch('getQualityPersonList').then(res => {
    //     this.qualityPersonList = res || [];
    //   })
    // },
    // 处理图片列表
    returnList(row) {
      let picArr = row.checkAttachment ? row.checkAttachment.split(',') : [];
      let list = picArr.filter(k => k).map((k, i) => { return { url: k } });
      return list;
    },
    // 保存数据
    saveData() {
      this.$refs['formDocument'].validate((valid) => {
        if (!valid) return;
        let [params, totalPlanCheckNumber, receiptCheckDetailBaseList] = [{}, 0, 0, []];
        let wmsReceiptCheckBase = this.wmsReceiptCheckBase;
        let list = this.formData.wmsReceiptCheckDetailBaseList;
        receiptCheckDetailBaseList = list.map(k => {
          totalPlanCheckNumber = new Big(totalPlanCheckNumber).plus(k.planCheckNumber || 0);// 总应检数
          return {
            receiptCheckDetailId: k.receiptCheckDetailId, // 质检单详情Id
            planCheckNumber: k.planCheckNumber, // 应检数量
            checkRate: k.checkRate, // 质检比例
          }
        })
        params.receiptCheckId = wmsReceiptCheckBase.receiptCheckId;// 质检单Id
        params.planCheckNumber = Number(totalPlanCheckNumber);// 应检数量
        params.checkRate = this.totalCheckRate;// 质检比例
        params.checkType = this.formData.qualityType;// 质检类型（0:免检，1:抽检，2:全检）
        params.receiptCheckDetailBaseList = receiptCheckDetailBaseList;// 质检单明细
        // console.log(params);
        this.saveLoading = true;
        this.axios.post(api.quality_updateReceiptCheckType, params).then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success('操作成功');
          this.modalVisible = false;
          this.$emit('checkSearch');
        }).finally(() => {
          this.saveLoading = false;
        })
      })
    },
    // 四舍五入保留2位小数（若第二位小数为0，则保留一位小数）
    keepTwoDecimal(num) {
      var result = parseFloat(num);
      if (isNaN(result)) return result;
      result = Math.round(num * 100) / 100;
      return result;
    },
    // 商品表格分页
    commodityChangePage(page) {
      this.commodityPages.pageNum = page;
      this.sliceGoodList(page, this.commodityPages.pageSize);
    },
    // 商品切换每页条数
    commodityChangePageSize(size) {
      this.commodityPages.pageSize = size;
      this.sliceGoodList(this.commodityPages.pageNum, size);
    },
    // 送检批次表格分页
    inspectChangePage(page) {
      this.inspectPages.pageNum = page;
    },
    // 送检批次切换每页条数
    inspectChangePageSize(size) {
      this.inspectPages.pageSize = size;
    },
    // 送检批次表格分页
    qualityChangePage(page) {
      this.qualityPages.pageNum = page;
    },
    // 送检批次切换每页条数
    qualityChangePageSize(size) {
      this.qualityPages.pageSize = size;
    },
    // 质检模板详情
    qualiTemplate(row) {
      this.qualiInfo.data = Object.assign({ rowCheckRate: row.checkRate }, row, this.wmsReceiptCheckBase);
      this.qualiInfo.visible = true;
    }
  }
}
</script>
<style lang="less">
.model-content {
  .good-block {
    padding: 4px 0;
    display: flex;
    align-items: center;
  }

  .flex-title {
    display: flex;
    align-items: center;

    .md-add--sty {
      font-size: 18px;
      font-weight: bolder;
      color: #0000FF;
      margin-left: 20px;
      cursor: pointer;
    }
  }

  .remark-submit {
    display: flex;
    align-items: flex-end;
  }

  .remark-record {
    display: flex;
    align-items: flex-start;

    &:not(:last-child) {
      margin-bottom: 4px;
    }

    .remark-record_right {
      flex: 1;
      overflow: hidden;
      display: flex;
      align-items: flex-start;
      margin-left: 20px;
    }

    .remark-record_content {
      flex: 1;
    }
  }

  .quality-setting {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .quality-setting-a {
      margin: 0 20px;
    }
  }

  .inspected-num {
    margin: 0;
  }
}
</style>