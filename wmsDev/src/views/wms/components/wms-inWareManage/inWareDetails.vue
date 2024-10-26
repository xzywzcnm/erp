<template>
  <div class="inWareDetailsPage detail-form">
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom:10px;">
      <Icon type="chevron-left"></Icon>
      <a @click="backPage">返回列表</a>
    </div>
    <div class="dataSort grayBg">
      <h3>
        入库单详情： <span>{{ inWareDetailsDataList.receiptNo }}</span>
      </h3>
    </div>
    <div style="background-color: #fff;margin:0 10px 0 10px;padding: 6px 0;">
      <Form label-position="right" :label-width="140">
        <Row>
          <Col span="6">
          <Form-item label="入库单编号：">
            <span>{{ inWareDetailsDataList.receiptNo }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="入库单类型：">
            <span v-if="inWareTypeList[inWareDetailsDataList.receiptType]">
              {{ inWareTypeList[inWareDetailsDataList.receiptType].label }}
            </span>
            <!-- <span v-if="inWareDetailsDataList.receiptType === '0'">备货入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '1'">生产入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '2'">调拨入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '3'">退货入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '4'">其他入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '5'">急采入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '6'">海外仓备货入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '7'">FBA备货入库</span>
            <span v-if="inWareDetailsDataList.receiptType === '8'">直发备货入库</span> -->
            <Icon v-if="inWareDetailsDataList.transitStatus === 1" type="ios-shuffle"
              style="font-size: 20px; color: #2D8CF0; font-weight: bold; position: relative; top: 1px; left: 3px;" />
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="入库单状态：">
            <span v-if="inWareDetailsDataList.receiptStatus === '0'">入库单创建</span>
            <span v-if="inWareDetailsDataList.receiptStatus === '1'">入库单取消</span>
            <span v-if="inWareDetailsDataList.receiptStatus === '2'">入库单关闭</span>
            <span v-if="inWareDetailsDataList.receiptStatus === '3'">收货中</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="仓库：">
            <span>{{ inWareDetailsDataList.warehouseName }}</span>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <Form-item label="参考编号：">
            <span>{{ inWareDetailsDataList.referenceNo }}</span>
          </Form-item>
          </Col>
          <!-- <Col span="6">
          <Form-item label="供应商名称：">
            <span>{{ inWareDetailsDataList.supplierName }}</span>
          </Form-item>
          </Col> -->
          <Col span="6">
          <Form-item label="运费/报关费/其他费用：">
            <span v-if="inWareDetailsDataList.feeFreight !== null &&
              inWareDetailsDataList.feeDeclaration !== null &&
              inWareDetailsDataList.feeOther !== null
              ">
              {{ inWareDetailsDataList.feeFreight }} /
              {{ inWareDetailsDataList.feeDeclaration }} /
              {{ inWareDetailsDataList.feeOther }}
            </span> <span v-else>无</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="币种：">
            <span v-if="inWareDetailsDataList.currency === '0'">人民币</span>
            <span v-if="inWareDetailsDataList.currency === '1'">美元</span>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <Form-item label="创建时间：">
            <span>{{ inWareDetailsDataList.createdTime }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="创建人：">
            <span>{{ inWareDetailsDataList.createdBy }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="预期到货时间：">
            <p v-if="inWareDetailsDataList.expectedStartTime !== null &&
              inWareDetailsDataList.expectedEndTime !== null
              ">
              <span>{{ inWareDetailsDataList.expectedStartTime }}</span> <span>到</span>
              <span>{{ inWareDetailsDataList.expectedEndTime }}</span>
            </p>
            <p v-else>无</p>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="最后修改时间：">
            <span>{{ inWareDetailsDataList.updatedTime }}</span>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <Form-item label="最后修改人：">
            <span>{{ inWareDetailsDataList.updatedBy }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="采购员：">
            <span>{{ inWareDetailsDataList.purchaserName }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="所属事业部：">
            {{
              businessDeptJson[inWareDetailsDataList.businessDeptId] ?
              businessDeptJson[inWareDetailsDataList.businessDeptId].name : inWareDetailsDataList.businessDeptName
            }}
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="发出仓库：">
            <span>{{ inWareDetailsDataList.sendWarehouseName }}</span>
          </Form-item>
          </Col>
        </Row>
        <Row>
          <Col span="6">
          <Form-item label="来货特项：">
            <template v-if="inWareDetailsDataList.comingSpecial">
              <span v-for="(item, index) in inWareDetailsDataList.comingSpecial.split(',')" :key="index">
                <span>
                  {{ index > 0 ? ',' : '' }}
                  {{ productTagList[item] ? productTagList[item].comingSpecial : item }}
                </span>
              </span>
            </template>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="平台订单号：">
            <span>{{ inWareDetailsDataList.platformOrderNo }}</span>
          </Form-item>
          </Col>
          <Col span="6">
          <Form-item label="是否为质检">
            <span>{{ ['1', '2', 1, 2].includes(inWareDetailsDataList.checkType) ? '是' : '否' }}</span>
          </Form-item>
          </Col>
          <Col>
          <Form-item label="是否为维修">
            <span>{{ [0, 1].includes(inWareDetailsDataList.maintenanceStatus) ? inWareDetailsDataList.maintenanceStatus ==
              0 ? '否' : '是' : '-' }}</span>
          </Form-item>
          </Col>
          <!-- <Col span="6">
          <Form-item label="第三方商品标签：">
            <span>{{ doverseaTagName }}</span>
          </Form-item>
          </Col> -->
        </Row>
      </Form>
    </div>

    <!-- 000000000000000000000000000000000000000000000000000 -->
    <!-- 收货需质检和收货上架表格 -->
    <div v-if="$store.state.tableShow === 'starts'">
      <div class="dataSort grayBg clear">
        <Button type="error" @click="closeOrder" v-if="isCloseShow" :disabled="!getPermission('wmsReceipt_close_single')"
          title="入库单在上架数量等于预期数量，且没有异常数量时，自动关闭">关闭入库单 </Button>
        <!-- <Button type="info" @click="qualityShowButton" style="float:right;" v-show="isShow" :needQFlag='needQFlag'>收货需质检</Button>-->
        <Button type="info" style="float:right;" @click="printCode">打印产品标签</Button>
        <Button type="primary" style="float:right; margin-right:10px;" @click="shelvesShowButton" v-show="isShow"
          :needSFlag="needSFlag" :disabled="!getPermission('wmsReceiptBatch_create')">收货 </Button>

        <Button v-if="getPermission('wmsReceipt_modifyReceiptOverseaTag') && inWareDetailsDataList.receiptStatus === '0'"
          type="primary" style="float:right;" class=" mr10" :disabled="!data6.length" @click="outByThirdLabel">
          匹配第三方标签入库
        </Button>

        <Button type="error" style="margin-left: 10px;"
          v-if="getPermission('wmsReceipt_cancelReceipt') && ![2, '2'].includes(inWareDetailsDataList.receiptStatus)"
          @click="cancelFn">取消收货</Button>
      </div>
      <div class="shopTable">
        <!--表格-->
        <Table highlight-row border :loading="TableLoading" :columns="columns6" :data="data6"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="totalRecords" @on-change="changePage" show-total show-elevator show-sizer
              :page-size="pageParams.pageSize" @on-page-size-change="changePageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </div>
    <!-- 无源入库表格 -->
    <div v-if="$store.state.tableShow === 'starts' && isNoSouceTableShow">
      <div class="dataSort grayBg" style="margin-top:60px;">
        <h3>无源入库</h3>
      </div>
      <div class="shopTable">
        <!--表格-->
        <Table highlight-row border :loading="TableLoading" :columns="columns7" :data="data7"></Table>
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="detailUTotal" :current="pageParams.detailUPageNum" :page-size="pageParams.detailUPageSize"
              show-total show-sizer show-elevator @on-change="changeDtlUPage" @on-page-size-change="changeDtlUPageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </div>

    <!-- 点击收货，确认上架表格 -->
    <div v-if="$store.state.tableShow === 'shelfTables'">
      <div class="dataSort grayBg">
        <!-- <Button type="success" icon="md-add" @click="addNewProductBtn(1)" class="mr10">添加货品</Button> -->
        <Button type="dashed" @click="selectAllShelf">
          <span v-if="!selectAllShelfStatus">全选</span> <span v-else>取消全选</span>
        </Button>
        <Button @click="cancelShow" style="float:right;">取消</Button>
        <!--确认收货按钮-->
        <Button type="primary" style="float:right;margin-right:10px;" @click="confirmShelvesButton">确认收货
        </Button>
        <Checkbox v-model="isCheck" style="float:right;margin-right:10px;line-height: 32px"
          :disabled="qualityTest.haveCheck == 1">需要质检
        </Checkbox>
        <!-- <Select v-model="isReceiptClose" @on-change="saveCache" style="width: 120px;float:right;margin-right:10px;">
          <Option v-for="(item, index) in receivingType" :key="index" :value="item.value">{{ item.text }}</Option>
        </Select> -->
        <span style="float: right;margin-top: 7px;">
          是否允许超量收货
          <RadioGroup v-model="isOvercharge" @on-change="saveCache">
            <Radio label="Y">是</Radio>
            <Radio label="N">否</Radio>
          </RadioGroup>
        </span>
        <!--<Checkbox
          v-model="isReceiptClose"
          style="float:right;margin-right:10px;line-height: 32px"
          >收货后关闭入库单
        </Checkbox>-->
      </div>
      <div class="shopTable">
        <!--确认上架表格-->
        <Table highlight-row border :columns="shelvesColumns" :data="shelvesData" :loading="TableLoading"
          v-if="shelvesTableStatus" @on-selection-change="selectShelvesTableBtn" @on-select="shelvesDataChange"
          @on-select-cancel="shelvesDataChangeCancel" ref="selection1"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="totalRecords" @on-change="changePage" show-total show-elevator show-sizer
              :page-size="pageParams.pageSize" @on-page-size-change="changePageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认收货需质检表格 这个被pass掉啦还是做下记录，写的坑货代码，我才不给你优化！！是个人才！！ -->
    <div v-if="$store.state.tableShow === 'qualityTables'">
      <div class="dataSort grayBg">
        <Button type="success" icon="md-add" @click="addNewProductBtn(2)">添加货品</Button>
        <Button type="dashed" @click="selectAllCheck">
          <span v-if="!selectAllCheckStatus">全选</span> <span v-else>取消全选</span>
        </Button>
        <Button @click="cancelShow" style="float:right;">取消</Button>
        <!--确认质检按钮-->
        <Button type="info" style="float:right;margin-right:10px;" @click="confirmQualityButton">确认质检
        </Button>
      </div>
      <div class="shopTable">
        <!--确认收货需质检的表格-->
        <Table highlight-row border :columns="qualityColumns" :data="qualityData" :loading="TableLoading"
          v-if="qualityTableStatus" @on-selection-change="selectQualityTableBtn" ref="selection2"></Table>
        <!--分页按钮-->
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="totalRecords" @on-change="changePage" show-total show-elevator show-sizer
              @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
    </div>

    <!-- 上架的无源入库表格 -->
    <div v-show="isNoShelfTableShow">
      <div class="dataSort grayBg" style="margin-top:60px;">
        <h3>无源入库</h3>
      </div>
      <div class="shopTable">
        <Table highlight-row border :columns="columns10" :loading="TableLoading" :data="data10" v-if="notShelfTableStatus"
          @on-selection-change="selectNotShelfBtn"></Table>
      </div>
    </div>
    <!-- 质检的无源入库表格 -->
    <div v-show="isNoQualityTableShow">
      <div class="dataSort grayBg" style="margin-top:60px;">
        <h3>无源入库</h3>
      </div>
      <div class="shopTable">
        <Table highlight-row border :columns="columns11" :loading="TableLoading" :data="data11"
          v-if="notQualityTableStatus" @on-selection-change="selectNotQualityBtn" ref="selection4"></Table>
      </div>
    </div>
    <!-- 00000000000000000000000000000000000000000000000 -->

    <!-- 收货批次表格 -->
    <div class="dataSort grayBg" style="margin-top:60px;">
      <h3>收货记录</h3>
    </div>
    <div class="shopTable" style="margin-bottom:70px;">
      <!--表格-->
      <Table highlight-row border :loading="TableLoading" :columns="batchColumns" :data="batchData"></Table>
      <div class="table-page">
        <div class="table-page-right" style="position: relative">
          <Page :total="batchTableTotal" :current="pageParams.batchPageNum" :page-size="pageParams.batchPageSize"
            show-total show-sizer show-elevator @on-change="changeBatchPage" @on-page-size-change="changeBatchPageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 质检记录 -->
    <div class="dataSort grayBg" style="margin-top:60px;">
      <h3>
        质检记录
        <Button type="primary" size="small" style="margin-left: 10px" @click="openQcImg">查看质检图片
        </Button>
      </h3>
    </div>
    <div class="shopTable" style="margin-bottom:70px;">
      <!--表格-->
      <Table highlight-row border :columns="CheckQueryColumns" :loading="TableLoading" :data="CheckQueryData"></Table>
      <div class="table-page">
        <div class="table-page-right" style="position: relative">
          <Page :total="CheckQueryTotal" :current="pageParams.CheckQueryPageNum"
            :page-size="pageParams.CheckQueryPageSize" show-total show-sizer show-elevator
            @on-change="changeCheckQueryPage" @on-page-size-change="changeCheckQueryPageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 上架记录 -->
    <div class="dataSort grayBg" style="margin-top:60px;">
      <h3>上架记录</h3>
    </div>
    <div class="shopTable" style="margin-bottom:70px;">
      <!--表格-->
      <Table highlight-row border :columns="ShelveColumns" :loading="TableLoading" :data="ShelveData"></Table>
      <div class="table-page">
        <div class="table-page-right" style="position: relative">
          <Page :total="ShelveTableTotal" :current="pageParams.ShelvePageNum" :page-size="pageParams.ShelvePageSize"
            show-total show-sizer show-elevator @on-change="changeShelvePage" @on-page-size-change="changeShelvePageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!--组件化操作日志-->
    <optionDaily :operationLog="operationLog" @showNoteFunc="showNoteFunc" :from="identification"
      :params="{ inWareOrderId, receiptNo: inWareDetailsDataList.receiptNo, pickingId: '' }"
      @addSuccessBack="addSuccessBack"></optionDaily>
    <!-- 库位选择模态框 -->
    <div v-if="showLocationModal">
      <Modal v-model="showLocationModal" title="库位选择" :styles="{ top: '80px', width: '800px' }" class="headerBar">
        <div class="content">
          <selectWareLocate @sendData="getData" :clickIndex="clickIndex" :receiptWareId="receiptWareId"
            :open="showLocationModal" :workType="workType" :locateCheckType="locateCheckType"></selectWareLocate>
        </div>
        <div slot="footer"></div>
      </Modal>
    </div>
    <!-- 添加货品模态框 -->
    <div v-if="showProductModal">
      <Modal v-model="showProductModal" :title="addProductTitle" :styles="{ top: '80px', width: '1200px' }"
        class="headerBar addProductBar">
        <div class="content">
          <!--<addProduct @userSelectOk='userSelectOk' :openProduct='showProductModal' :inWareNo="inWareDetailsDataList.receiptNo" :inWareDtlAdd="inWareDtlAdd"></addProduct>-->
          <addProduct :disabledSlt="false" :from="true" @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel" :wareId="wareId" :eliminateData="$store.state.tableShow === 'shelfTables'
              ? shelvesData
              : qualityData
              "></addProduct>
        </div>
        <div slot="footer">
          <Button type="primary" @click="confirmAddProductBtn">确认添加货品</Button>
          <Button @click="cancelAddBtn">取消</Button>
        </div>
      </Modal>
    </div>
    <Modal title="质检图片" v-model="qcImgModal" width="800" :mask-closable="false" :closable="modalClose">
      <Card>
        <div v-if="qcImgList.length === 0">
          暂无图片
        </div>
        <div v-else>
          <!-- <div v-for="(item, index) in qcImgList" :key="index" style="margin-bottom: 10px;">
            <img style="width: 100%" :src="item" />
          </div> -->
          <dyt-previewImg :fileList.sync="qcImgList" :imgOption="{ listWidth: 90, listHeight: 90, mode: 'multiple' }">
          </dyt-previewImg>
        </div>
      </Card>
    </Modal>
    <cancelReceipt ref="cancelReceipt" :cancelData="cancelData" @getList="searchData"></cancelReceipt>

    <!-- 第三方标签入库 -->
    <outByThirdLabel ref="outByThirdLabel" :modelVisible.sync="thrdLableInfo.visible" @confirmLabel="confirmLabel"
      :data="thrdLableInfo.data" type="inStock" />
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import selectWareLocate from './selectWareLocate';
import addProduct from '../wms-inStock/newAddProduct';
import optionDaily from '@/views/wms/components/common/commonDaily';
import cancelReceipt from '@/views/wms/components/wms-inWareManage/componts/cancelReceipt';
import outByThirdLabel from '@/views/wms/components/exWarehouse/sellStockOutDtl/outByThirdLabel';
import { inWareTypeObj } from '@/views/wms/components/common/receiptType.js';

export default {
  mixins: [Mixin],
  components: {
    selectWareLocate: selectWareLocate, // 选择库位组件
    addProduct: addProduct, // 添加货品组件
    optionDaily,
    cancelReceipt,
    outByThirdLabel
  },
  props: {
    inWareOrderId: {
      default: null // 当前行的入库单id
    },
    inWareOrderNo: {
      default: null // 入库单编号
    },
    batchNo: {
      default: null
    },
    shelfS: {
      default: null
    }
  },
  data() {
    let self = this;
    return {
      inWareTypeList: inWareTypeObj(),
      updateRow: {},
      businessDeptJson: {},
      selectDatas: [], // 记录已经被勾选的数据
      deselectData: [], // 记录取消勾选收货的数据
      identification: '',
      isOvercharge: 'N',
      // receivingType: [
      //   {
      //     text: '手动关闭',
      //     value: '0'
      //   }, {
      //     text: '本次收货后关闭',
      //     value: '1'
      //   }, {
      //     text: '完全收货后关闭',
      //     value: '2'
      //   }
      // ],
      cancelData: [],
      Dposition: {
        name: '',
        id: ''
      },
      qcImgModal: false,
      qcImgList: [],
      // isReceiptClose: '0',
      isCheck: false, // 是否需要质检
      wareId: this.getWarehouseId(),
      inWareDtlAdd: '0',
      isNoSouceTableShow: false, // 无源入库表格隐藏
      needQFlag: 'markQ',
      needSFlag: 'markS',
      checkNum: 0,
      selectAllShelfStatus: false,
      selectAllCheckStatus: false,
      workType: 'shelfFlag', // 默认确认上架添加货品
      locateCheckType: 'checkShelvesP', // 库位选择标记
      isCloseShow: true,
      shelvesTableStatus: true,
      qualityTableStatus: true,
      notShelfTableStatus: true,
      notQualityTableStatus: true,
      clickIndex: null, // 当前行 库位选择的下标
      receiptWareId: '', // 选择的仓库id
      showNotes: true, // 展示备注
      isShow: true, // 收货上架和收货需质检默认显示
      isNoShelfTableShow: false, // 上架 无源入库表格默认隐藏
      isNoQualityTableShow: false, // 质检 无源入库表格默认隐藏
      pageParams: {
        pageNum: 1,
        pageSize: 100,
        CheckQueryPageNum: 1,
        CheckQueryPageSize: 10,
        ShelvePageNum: 1,
        ShelvePageSize: 10,
        detailUPageNum: 1,
        detailUPageSize: 10,
        batchPageNum: 1,
        batchPageSize: 10,
        addNotes: '' // 添加备注
      },
      totalRecords: 0, // 总条数
      detailUTotal: 0, // 无源入库总条数
      batchTableTotal: 0, // 收货批次分页总条数
      ShelveTableTotal: 0, // 收货批次分页总条数
      CheckQueryTotal: 0, // 收货批次分页总条数
      wareLocationTitle: '库位选择',
      showLocationModal: false, // 库位选择模态框
      addProductTitle: '添加产品',
      showProductModal: false, // 添加货品模态框

      columns6: [// 有源入库表格
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        },
        {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, '超量收货');
            }
          }
        },
        {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: 'SKU/条码编码',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsSku || ''),
              h('div', params.row.barCode || ''),
            ])
            // return h('span', {
            //   style: {
            //     color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
            //   }
            // }, params.row.goodsSku);
          }
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsAttributes);
          }
        },
        {
          title: '中英文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        },
        {
          title: '预期数量',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.expectedNumber);
          }
        },
        {
          title: '增加数',
          key: 'overshootNumber',
          align: 'center',
          minWidth: 80,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '入库单创建后增加的数量' }
            }, '增加数')
          },
        },
        {
          title: '取消数量',
          key: 'cancelNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '下单后取消的数量，取消数量=取消数+少货数' }
            }, '取消数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.cancelNumber);
          }
        },
        {
          title: '发货数量',
          key: 'despatchNumber',
          align: 'center',
          minWidth: 80,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '已经发货的数量' }
            }, '发货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.despatchNumber);
          }
        },
        {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        },
        {
          title: '未收货数量',
          key: 'nobatchNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '未收货数量=预期数量+增加数量-取消数量-收货数量' }
            }, '未收货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.nobatchNumber);
          }
        },
        {
          title: '合格数',
          key: 'qualifiedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '问题数',
          key: 'failedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '上架数',
          key: 'shelveNumber',
          align: 'center',
          minWidth: 80,
        },

        {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsVolume);
          }
        },
        {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsWeight);
          }
        },
        // {
        //   title: '是否免检',
        //   key: 'checkFlag',
        //   align: 'center',
        //   minWidth: 100,
        //   render(h, params) {
        //     return params.row.checkFlag === '0'
        //       ? h('span', {
        //         style: {
        //           color: params.row.receiptDetailStatus === '3'
        //             ? '#f00'
        //             : ''
        //         }
        //       }, 'N')
        //       : h('span', {
        //         style: {
        //           color: params.row.receiptDetailStatus === '3'
        //             ? '#f00'
        //             : ''
        //         }
        //       }, 'Y');
        //   }
        // }
      ],
      data6: [],

      columns7: [// 无源入库表格
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        }, {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data7: [],

      shelvesColumns: [// 收货上架表格
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {}, '超量收货');
            }
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU/条码编码',
          // key: 'goodsSku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.goodsSku || ''),
              h('div', params.row.barCode || ''),
            ])
          }
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中英文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        }, {
          title: '预期数量',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.expectedNumber);
          }
        }, {
          title: '取消数量',
          key: 'cancelNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '下单后取消的数量，取消数量=取消数+少货数' }
            }, '取消数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.cancelNumber);
          }
        }, {
          title: '发货数量',
          key: 'despatchNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '已经发货的数量' }
            }, '发货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.despatchNumber);
          }
        }, {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        }, {
          title: '未收货数量',
          key: 'nobatchNumber',
          align: 'center',
          minWidth: 100,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '未收货数量=预期数量-取消数量-收货数量' }
            }, '未收货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.nobatchNumber);
          }
        },
        {
          title: '合格数',
          key: 'qualifiedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '问题数',
          key: 'failedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '上架数',
          key: 'shelveNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let arr = [];
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    self.$set(self.shelvesData[params.index], 'currentbatchNumber', value);
                    self.$set(self.shelvesData[params.index], 'editCurrentbatchNumber', value);
                    // params.row.currentbatchNumber = value;
                    // self.shelvesData[params.index].currentbatchNumber = value;
                    self.$nextTick(() => {
                      // self.shelvesData[params.index] = params.row;
                      // self.shelvesData.map((item, index) => {
                      //   if (params.index === index) {
                      //     item['editCurrentbatchNumber'] = value;
                      //   }
                      // });
                      // self.$set(self.shelvesData, params.index, params.row);
                      if (params.row._checked) {
                        if (self.selectDatas.length > 0) {
                          self.selectDatas.map((ele, idx) => {
                            if (ele.productGoodsId === params.row.productGoodsId) {
                              self.selectDatas.splice(idx, 1, params.row);
                            } else {
                              self.selectDatas.push(params.row);
                            }
                          });
                        } else {
                          if (params.row.currentbatchNumber > 0) {
                            self.selectDatas.push(params.row);
                          }
                        }

                        self.shelvesData.map((ele) => {
                          if (!ele['editCurrentbatchNumber'] && ele.currentbatchNumber > 0) {
                            arr.push(ele);
                          }
                        });

                        let query = self.unique([...arr, ...self.selectDatas]);
                        localStorage.setItem('selectDatas', JSON.stringify(query));
                      }
                      this.selectAllShelfStatus = false;
                    });
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.updateRow = params;
                    self.showLocationModal = true;
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.clickIndex = params.index;
                    self.workType = 'shelfFlag';
                    self.locateCheckType = 'checkShelvesP';
                  }
                }
              })
            ]);
          }
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 120
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        },
        // {
        //   title: '是否免检',
        //   key: 'checkFlag',
        //   align: 'center',
        //   minWidth: 100,
        //   render(h, params) {
        //     return params.row.checkFlag === '0' ? 'N' : 'Y';
        //   }
        // }
      ],
      shelvesData: [], // 收货需要质检表格
      qualityColumns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {}, '超量收货');
            }
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        }, {
          title: '预期数量',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '未收货数量',
          key: 'nobatchNumber',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('span', {
              style: {
                color: +params.row.nobatchNumber < 0 ? '#f00' : ''
              }
            }, params.row.nobatchNumber);
          }
        }, {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.currentbatchNumber = value;
                    self.qualityData[params.index] = params.row;
                    self.$nextTick(() => {
                      let arr = [];
                      self.$refs.selection2.objData[params.index]._isChecked = false;
                      let data = self.$refs.selection2.objData;
                      for (let key in data) {
                        if (data.hasOwnProperty(key) && data[key]._isChecked) {
                          arr.push(data[key]);
                        }
                      }
                      self.$refs.selection2.$emit('on-selection-change', arr);
                      self.shelvesData[params.index] = params.row;
                    });
                    self.selectAllCheckStatus = false;
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.showLocationModal = true;
                    self.clickIndex = params.index;
                    self.workType = 'qualityFlag';
                    self.locateCheckType = 'checkQualityP';
                  }
                }
              })
            ]);
          }
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      qualityData: [], // 上架的无源入库表格
      columns10: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        },
        {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        },
        {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.currentbatchNumber = value;
                    self.data10[params.index] = params.row;
                    self.$nextTick(() => {
                      let arr = [];
                      self.$refs.selection3.objData[params.index]._isChecked = false;
                      let data = self.$refs.selection3.objData;
                      for (let key in data) {
                        if (data.hasOwnProperty(key) && data[key]._isChecked) {
                          arr.push(data[key]);
                        }
                      }
                      self.$refs.selection3.$emit('on-selection-change', arr);
                      self.data10[params.index] = params.row;
                    });
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.showLocationModal = true;
                    self.clickIndex = params.index;
                    self.workType = 'shelfFlag';
                    self.locateCheckType = 'checkShelvesU';
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-add'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    let obj = JSON.parse(JSON.stringify(self.data10[params.index]));
                    obj.warehouseLocationName = '';
                    obj.warehouseLocationId = '';
                    obj.currentbatchNumber = '';
                    obj.goodsEndDate = '';
                    self.data10.splice(params.index + 1, 0, obj); // 新增库位行
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-remove'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    self.data10.splice(params.index, 1); // 删除库位行
                  }
                }
              })
            ]);
          }
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data10: [], // 确认质检的无源入库表格
      columns11: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {}, '超量收货');
            }
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        },
        {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        },
        {
          title: '未收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.currentbatchNumber = value;
                    self.data11[params.index] = params.row;
                    self.$nextTick(() => {
                      let arr = [];
                      self.$refs.selection4.objData[params.index]._isChecked = false;
                      let data = self.$refs.selection4.objData;
                      for (let key in data) {
                        if (data.hasOwnProperty(key) && data[key]._isChecked) {
                          arr.push(data[key]);
                        }
                      }
                      self.$refs.selection4.$emit('on-selection-change', arr);
                      self.data11[params.index] = params.row;
                    });
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.showLocationModal = true;
                    self.clickIndex = params.index;
                    self.workType = 'qualityFlag';
                    self.locateCheckType = 'checkQualityU';
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-add'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    let obj = JSON.parse(JSON.stringify(self.data11[params.index]));
                    obj.warehouseLocationName = '';
                    obj.warehouseLocationId = '';
                    obj.currentbatchNumber = '';
                    obj.goodsEndDate = '';
                    self.data11.splice(params.index + 1, 0, obj); // 新增库位行
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-remove'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    self.data11.splice(params.index, 1); // 删除库位行
                  }
                }
              })
            ]);
          }
        },
        {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data11: [], // 质检记录
      CheckQueryColumns: [
        {
          title: '行号',
          key: 'index',
          align: 'center',
          width: 70,
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '质检记录',
          key: 'receiptBatchCheckDetailNo',
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '本次质检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          width: 120,
          render(h, params) {
            let oldNum = (params.row.oldProblemCheckNumber || 0) - 0;// 重新质检数量
            return h('span', params.row.passCheckNumber + params.row.problemCheckNumber + oldNum);
          }
        }, {
          title: '合格数',
          key: 'passCheckNumber',
          align: 'center',
          width: 90
        }, {
          title: '不合格数',
          key: 'problemCheckNumber',
          align: 'center',
          width: 90
        },
        {
          title: '不良原因',
          key: 'problemCheckReason',
          align: 'center',
          tooltip: true
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          width: 90
        }, {
          title: '质检完成时间',
          key: 'updatedTime',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', this.$uDate.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '质检人',
          key: 'checkCreatedByName',
          align: 'center'
        }
      ],
      CheckQueryData: [], // 上架记录
      ShelveColumns: [
        {
          title: '行号',
          key: 'index',
          align: 'center',
          width: 70,
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '上架记录',
          key: 'receiptCheckShelveDetailNo',
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '本次上架数量',
          key: 'shelveNumber',
          align: 'center'
        }, {
          title: '上架库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '备注',
          key: 'remark',
          align: 'center'
        }, {
          title: '上架时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', this.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '上架人',
          key: 'createdBy',
          align: 'center'
        }
      ],
      ShelveData: [], // 添加收货批次号
      batchColumns: [
        {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center'
        }, {
          title: '产品SKU',
          key: 'goodsSku',
          align: 'center'
        }, /* {
         title: '产品有效期',
         key: 'goodsEndDate',
         align: 'center'
         }, */
        {
          title: '重量' + '(g)',
          key: 'batchWeight',
          align: 'center'
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '收货时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', this.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '收货数',
          key: 'batchNumber',
          align: 'center'
        }, {
          title: '收货人',
          key: 'createdBy',
          align: 'center'
        }
      ],
      batchData: [], // 收货批次表格数据
      inWareDetailsDataList: {}, // 入库单详情头部数据
      operationLog: [], // 系统操作日志
      userConfirmShelvesList: [], // 勾选确认上架的表格数据
      userConfirmQualityList: [], // 勾选确认收货的表格数据
      userSelectTable: [], // 选择添加货品
      noSouceDataList: [], // 勾选上架无源入库表格数据
      noQualityDataList: [], // 勾选质检无源入库表格数据
      validShelfSku: [], // 校验上架有源入库sku和库位
      validCheckSku: [], // 校验质检有源入库sku和库位
      validShelvesUSku: [], // 校验上架无源入库sku和库位
      validQualityUSku: [], // 校验质检无源入库sku和库位
      autoWarehouseLocationId: null, // 默认的库位id
      qualityTest: { // 质检信息
        haveCheck: null, // 是否有质检单（1：有）
        checkType: null, // 质检类型（0:免检，1:抽检，2:全检）
      },
      thrdLableInfo: {
        // allLabelList: [],
        // labelList: [],
        visible: false,
        // loading: false,
        data: {},
      },
      productTagList: {},
    };
  },
  created() {
    if (localStorage.getItem('receiptSetting')) {
      let receiptSetting = JSON.parse(localStorage.getItem('receiptSetting'));
      this.isOvercharge = receiptSetting.isOvercharge ? receiptSetting.isOvercharge : 'N';
    }
    this.searchData();
    // this.getThridLabelAll();
    this.getPositionList({
      pageNum: 1,
      pageSize: 100000,
      pickingCheckFlag: 1
    }).then(data => {
      data.forEach(i => {
        if (i.pickingCheckFlag === '1' && i.checkStatus !== '1') {
          // pickingCheckFlag 1  默认库位
          // checkStatus 状态(0待盘点1盘点中2已完成) ,
          this.Dposition.id = i.warehouseLocationId;
          this.Dposition.name = i.warehouseLocationName;
        }
      });
      if (!this.Dposition.id) {
        let obj = data.find(i => {
          return i.checkStatus !== '1';
        });
        if (obj) {
          this.Dposition.id = obj.warehouseLocationId;
          this.Dposition.name = obj.warehouseLocationName;
        }
      }
    });
    this.getComingSpecialList();
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    getBusinessDept() {
      return this.$store.getters.getBusinessDeptList
    },
    // // 第三方标签名称
    // doverseaTagName() {
    //   if (this.$common.isEmpty(this.inWareDetailsDataList) || this.$common.isEmpty(this.thrdLableInfo)) return '';
    //   if (this.$common.isEmpty(this.inWareDetailsDataList.overseaTagId) || this.$common.isEmpty(this.thrdLableInfo.allLabelList)) return '';
    //   const checkdTag = this.thrdLableInfo.allLabelList.find(item => {
    //     return this.inWareDetailsDataList.overseaTagId == item.overseaTagId
    //   })
    //   if (this.$common.isEmpty(checkdTag)) return '';
    //   return checkdTag.name;
    // }
  },
  watch: {
    getBusinessDept: {
      deep: true,
      immediate: true,
      handler(val) {
        this.businessDeptJson = {};
        (val || []).forEach(item => {
          this.$set(this.businessDeptJson, item.id, item);
        })
      }
    }
  },
  methods: {
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        let temp = {};
        (list || []).forEach(k => {
          temp[k.comingSpecialId] = k;
        })
        this.productTagList = temp;
      })
    },
    cancelFn() {
      this.getWaitCheckShelve(this.inWareOrderNo).then((data) => {
        if (data && data.length > 0) {
          this.cancelData = data.map(i => {
            i.receiptNo = this.inWareOrderNo;
            return i;
          });
          this.$refs.cancelReceipt.modal1 = true;
        } else {
          this.$Message.error('无可取消收货数据');
        }
      });
    },
    getPositionList(params = {}) {
      return new Promise(resolve => {
        let obj = {
          warehouseId: this.wareId, // warehouseBlockType: ['00', '10'],
          warehouseLocationStatus: 0,
          pickingFlag: this.$store.state.pickingFlag,
          ...params
        };
        this.axios.post(api.getLocationList, obj).then(res => {
          if (res.data.code === 0) {
            this.positionList = res.data.datas.list;
            resolve(res.data.datas.list);
          }
        });
      });
    },
    openQcImg() {
      this.qcImgModal = true;
    },
    printCode() {
      let v = this;
      if ('getPrintDate' in this.$listeners) {
        let params = {};
        params.inWareOrderNo = v.inWareOrderNo;
        params.activeRow = v.$store.state.activeRow;
        params.referenceNo = v.inWareDetailsDataList.referenceNo;
        this.$emit('getPrintDate', params);
        return;
      }
      v.$parent.getPrintDate(this.inWareOrderNo, v.$store.state.activeRow, v.inWareDetailsDataList.referenceNo).then(() => {
        v.$store.commit('printSkuModal', true);
      });
    },
    addProductSuccess(data) {
      let v = this;
      data.forEach(val => {
        val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
        val.warehouseLocationName = ''; // 初始化一个空值
        if (+val.nobatchNumber > 0) {
          val.currentbatchNumber = val.nobatchNumber;
        } else {
          val.currentbatchNumber = 0;
        }
      });
      // v.data10 = v.data10.concat(data);
      // if (v.data10.length !== 0) {
      //   v.isNoShelfTableShow = true; // 上架无源入库表格显示
      // } else {
      //   v.isNoShelfTableShow = false;
      // }
      // v.isNoQualityTableShow = false; // 质检无源入库表格隐藏
      // v.showProductModal = false;
      if (v.checkNum === 1) {
        var obj = {};
        for (var i = 0; i < data.length; i++) {
          obj[data[i].goodsSku] = 1;
          for (var j = 0; j < v.data10.length; j++) {
            if (obj[v.data10[j].goodsSku]) {
              v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
              v.showProductModal = true;
              return;
            }
          }
        }
        if (data.length === 0) {
          v.showProductModal = true;
          v.$Message.info('请勾选你要添加的货品');
        } else {
          v.showProductModal = false;
          v.$Message.success('成功添加货品');
          data.forEach(val => {
            val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
          });
          v.data10 = v.data10.concat(data);
          if (v.data10.length !== 0) {
            v.isNoShelfTableShow = true; // 上架无源入库表格显示
          } else {
            v.isNoShelfTableShow = false;
          }
          v.isNoQualityTableShow = false; // 质检无源入库表格隐藏
        }
        v.data10.forEach((n, i) => {
          n.warehouseLocationName = ''; // 初始化一个空值
          n.currentbatchNumber = null;
        });
      } else {
        let obj = {};
        for (let i = 0; i < data.length; i++) {
          obj[data[i].goodsSku] = 1;
          for (let j = 0; j < v.data11.length; j++) {
            if (obj[v.data11[j].goodsSku]) {
              v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
              v.showProductModal = true;
              return;
            }
          }
        }
        if (data.length === 0) {
          v.showProductModal = true;
          v.$Message.info('请勾选你要添加的货品');
        } else {
          v.showProductModal = false;
          v.$Message.success('成功添加货品');
          data.forEach(val => {
            val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
          });
          v.data11 = v.data11.concat(data);
          if (v.data11.length !== 0) {
            v.isNoQualityTableShow = true; // 质检无源入库表格显示
          } else {
            v.isNoQualityTableShow = false;
          }
          v.isNoShelfTableShow = false; // 上架无源入库表格隐藏
        }
        v.data11.forEach((n, i) => {
          n.warehouseLocationName = ''; // 初始化一个空值
          n.currentbatchNumber = null;
        });
      }
    },
    addProductCancel() {
      this.showProductModal = false;
    },
    getDefaultLoc(obj) {
      let v = this;
      return new Promise((resolve, reject) => {
        v.axios.get(api.getCheckWarehouseLoction + v.wareId).then(res => {
          if (res.data.code === 0) {
            obj.forEach(val => {
              if (res.data.datas) {
                v.autoWarehouseLocationId = res.data.datas.warehouseLocationId;
                v.$nextTick(() => {
                  v.$set(val, 'warehouseLocationName', res.data.datas.warehouseLocationName);
                  v.$set(val, 'warehouseLocationId', res.data.datas.warehouseLocationId);
                  v.$set(val, 'warehouseBlockId', res.data.datas.warehouseBlockId);
                });
              } else {
                v.$nextTick(() => {
                  v.$set(val, 'warehouseLocationName', '');
                  v.$set(val, 'warehouseLocationId', null);
                  v.$set(val, 'warehouseBlockId', null);
                });
              }
              v.$nextTick(() => {
                if (+val.nobatchNumber >= 0) {
                  v.$set(val, 'currentbatchNumber', val.nobatchNumber);
                } else {
                  v.$set(val, 'currentbatchNumber', 0);
                }
              });
            });
            resolve(obj);
          }
        });
      });
    },
    addSuccessBack() {
      this.searchData();
    },
    // 重置质检单数据
    resetQualityTest() {
      this.qualityTest.haveCheck = null;
      this.qualityTest.checkType = null;
    },
    // 页面查询函数
    searchData() {
      var v = this;
      v.resetQualityTest();
      v.identification = '';
      var obj = {
        receiptNo: v.inWareOrderNo, // 入库单编号
        receiptDetailPQueryParam: {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize
        },
        receiptDetailUQueryParam: {
          pageNum: v.pageParams.detailUPageNum,
          pageSize: v.pageParams.detailUPageSize
        },
        receiptBatchQueryParam: {
          pageNum: v.pageParams.batchPageNum,
          pageSize: v.pageParams.batchPageSize
        },
        receiptBatchCheckQueryParam: {
          // 质检记录
          pageNum: v.pageParams.CheckQueryPageNum,
          pageSize: v.pageParams.CheckQueryPageSize
        },
        receiptShelveQueryParam: {
          // 上架记录
          pageNum: v.pageParams.ShelvePageNum,
          pageSize: v.pageParams.ShelvePageSize
        }
      };
      v.TableLoading = true;
      if (v.inWareOrderNo) {
        v.axios.post(api.watchInWareDetails, obj).then(res => {
          // this.$store.commit('tableShow', 'starts');
          v.TableLoading = false;
          if (res.data.code === 0) {
            let receipt = res.data.datas.receipt || {};
            v.inWareDetailsDataList = v.processObjTime(receipt, ['createdTime', 'updatedTime']); // 入库单详情头部信息

            // 因采购单生成质检单，需反显已有质检值且不允许操作
            v.qualityTest.haveCheck = receipt.haveCheck;// 是否有质检单（1：有）
            v.qualityTest.checkType = receipt.checkType;// 质检类型（0:免检，1:抽检，2:全检）
            v.isCheck = [1, 2, '1', '2'].includes(receipt.checkType);

            // 采购员
            let list = this.$store.state.userInfoList;
            if (list && v.inWareDetailsDataList.purchaserId) {
              v.inWareDetailsDataList.purchaserName = list[v.inWareDetailsDataList.purchaserId].userName;
            } else {
              v.inWareDetailsDataList.purchaserName = '';
            }
            v.data6 = res.data.datas.receiptDetailPPage.list;
            v.data7 = res.data.datas.receiptDetailUPage.list; // 无源入库表格数据
            if (v.data7.length !== 0) {
              v.isNoSouceTableShow = true;
            } else {
              v.isNoSouceTableShow = false;
            }
            v.batchData = res.data.datas.receiptBatchPage.list; // 收货批次
            v.CheckQueryData = res.data.datas.receiptBatchCheckPage ? res.data.datas.receiptBatchCheckPage.list : [];
            v.ShelveData = res.data.datas.receiptShelvePage ? res.data.datas.receiptShelvePage.list : [];
            v.CheckQueryTotal = res.data.datas.receiptBatchCheckPage ? res.data.datas.receiptBatchCheckPage.total : 0;
            v.ShelveTableTotal = res.data.datas.receiptShelvePage ? res.data.datas.receiptShelvePage.total : 0;
            if (v.CheckQueryData && v.CheckQueryData.length > 0) {
              v.CheckQueryData.forEach(i => {
                try {
                  let obj = JSON.parse(i.checkAttachment);
                  v.qcImgList.push(...obj);
                } catch (e) {
                  if (i.checkAttachment) {
                    v.qcImgList.push(...i.checkAttachment.split(','));
                  }
                }
              });
              v.qcImgList = v.qcImgList.map(k => {
                return { url: k }
              })
            }
            v.batchTableTotal = res.data.datas.receiptBatchPage.total;
            if (this.needSFlag === 'markS') {
              v.data10 = res.data.datas.receiptDetailUPage.list;
            }
            if (this.needQFlag === 'markQ') {
              v.data11 = res.data.datas.receiptDetailUPage.list;
            }
            v.detailUTotal = res.data.datas.receiptDetailUPage.total;
            v.isNoQualityTableShow = false;
            v.isNoShelfTableShow = false;
            let obj = res.data.datas.receiptDetailPPage.list;
            // 查询默认库位
            v.getDefaultLoc(obj).then(res => {
              if (res) {
                v.qualityData = res;
                for (var i = 0; i < this.qualityData.length; i++) {
                  v.$set(this.qualityData[i], '_checked', true);
                }
                v.selectAllCheckStatus = true;
                v.userConfirmQualityList = this.qualityData;
                v.shelvesData = [];
                // 缓存修改的数据
                let data = JSON.parse(JSON.stringify(res));
                let selectDatas = JSON.parse(localStorage.getItem('selectDatas'));
                data.forEach((item, index) => {
                  if (selectDatas) {
                    selectDatas.forEach((ele, idx) => {
                      if (item.productGoodsId === ele.productGoodsId) {
                        item['warehouseLocationName'] = ele.editWarehouseLocationName
                          ? ele.editWarehouseLocationName
                          : ele.warehouseLocationName;
                        item['currentbatchNumber'] = ele.editCurrentbatchNumber
                          ? ele.editCurrentbatchNumber
                          : ele.currentbatchNumber;
                        item['warehouseLocationId'] = ele.editWarehouseLocationId;
                      }
                    });
                  }
                  if (v.deselectData.length > 0) {
                    v.deselectData.forEach((talg) => {
                      if (talg === item.productGoodsId) {
                        item['_checked'] = false;
                      }
                    });
                  }
                });
                v.shelvesData = data;
                localStorage.setItem('selectDatas', JSON.stringify(data));
              } else {
                localStorage.setItem('selectDatas', JSON.stringify(obj));
              }
            });
            v.totalRecords = res.data.datas.receiptDetailPPage.total;
            v.operationLog = res.data.datas.receiptLog; // 备注信息
            v.$store.commit('operationLog', v.operationLog);
            v.identification = 'inStock';
            if (v.inWareDetailsDataList.receiptStatus === '2') {
              v.isShow = false;
              v.isCloseShow = false;
            }
            if (v.batchNo === '0') {
              v.isShow = false;
              v.isCloseShow = false;
            } else if (this.batchNo === '1') {
              v.isShow = false;
              v.isCloseShow = false;
            } else if (this.batchNo === '2') {
              v.isShow = false;
              v.isCloseShow = false;
            }
            if (v.shelfS === '0') {
              v.isShow = false;
              v.isCloseShow = false;
            } else if (this.shelfS === '1') {
              v.isShow = false;
              v.isCloseShow = false;
            } else if (this.shelfS === '2') {
              v.isShow = false;
              v.isCloseShow = false;
            }
            // 确认上架库位
            // v.shelvesData.forEach((n, i) => {
            //   n.warehouseLocationName = ''; // 初始化一个空值
            //   n.currentbatchNumber = null;
            // });
            // // 确认质检库位
            // v.qualityData.forEach((n, i) => {
            //   n.warehouseLocationName = ''; // 初始化一个空值
            //   n.currentbatchNumber = null;
            // });
          }
        });
      }
    }, // 有源入库表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    }, // 有源入库切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.searchData();
    }, // 无源入库表格分页
    changeDtlUPage(page) {
      this.pageParams.detailUPageNum = page;
      this.searchData();
    }, // 无源入库切换每页条数
    changeDtlUPageSize(size) {
      this.pageParams.detailUPageSize = size;
      this.searchData();
    }, // 收货批次表格分页
    changeBatchPage(page) {
      this.pageParams.batchPageNum = page;
      this.searchData();
    }, // 收货批次表格切换每页条数
    changeBatchPageSize(size) {
      this.pageParams.batchPageSize = size;
      this.searchData();
    }, // 质检记录表格切换每页条数
    changeCheckQueryPage(page) {
      this.pageParams.CheckQueryPageNum = page;
      this.searchData();
    }, // 质检记录表格切换每页条数
    changeCheckQueryPageSize(size) {
      this.pageParams.CheckQueryPageSize = size;
      this.searchData();
    }, // 上架记录表格切换每页条数
    changeShelvePage(page) {
      this.pageParams.ShelvePageNum = page;
      this.searchData();
    }, // 上架记录表格切换每页条数
    changeShelvePageSize(size) {
      this.pageParams.ShelvePageSize = size;
      this.searchData();
    },
    // 返回列表按钮
    backPage() {
      this.$emit('backPage', 'list');
    },
    // 全选上架按钮
    selectAllShelf() {
      var v = this;
      v.selectAllShelfStatus = !v.selectAllShelfStatus;
      v.$refs.selection1.selectAll(v.selectAllShelfStatus);
      v.$refs.selection3.selectAll(v.selectAllShelfStatus);
    }, // 全选质检按钮
    selectAllCheck() {
      var v = this;
      v.selectAllCheckStatus = !v.selectAllCheckStatus;
      v.$refs.selection2.selectAll(v.selectAllCheckStatus);
      v.$refs.selection4.selectAll(v.selectAllCheckStatus);
    }, // 筛选手动备注的信息
    showNoteFunc(bool) {
      if (!bool) {
        let optionData = [...this.operationLog];
        this.operationLog = optionData.filter(val => {
          return val.logTypeDesc !== '10';
        });
      } else {
        this.searchData();
      }
    }, // 勾选收货上架表格行
    selectShelvesTableBtn(data) {
      this.userConfirmShelvesList = data;
      // 默认全部不勾选
      this.shelvesData.forEach((n, i) => {
        n._checked = false;
      });
      // 勾选选中部分
      let receiptDetailIdList = data.map(k => { return k.receiptDetailId });
      this.shelvesData.forEach((n, i) => {
        if (receiptDetailIdList.includes(n.receiptDetailId)) {
          n._checked = true;
        }
      });
    },
    shelvesDataChangeCancel(selection, row) {
      let v = this;
      v.shelvesData.forEach((n, i) => {
        if (n.productGoodsId === row.productGoodsId) {
          n._checked = false;
          v.deselectData.push(row.productGoodsId);
        }
      });
    },
    shelvesDataChange(selection, row) {
      let v = this;
      v.shelvesData.forEach((n, i) => {
        if (n.productGoodsId === row.productGoodsId) {
          n._checked = true;
          if (v.deselectData.length > 0) {
            v.deselectData.map((item, index) => {
              if (item === row.productGoodsId) {
                v.deselectData.splice(index, 1);
              }
            });
          }
        }
      });
    }, // 勾选收货需质检表格行
    selectQualityTableBtn(data) {
      var v = this;
      v.userConfirmQualityList = data;
      let productIds = v.userConfirmQualityList.map(val => val.productGoodsId);
      v.qualityData.forEach(val2 => {
        if (productIds.indexOf(val2.productGoodsId) > -1) {
          v.$set(val2, '_checked', true);
        } else {
          v.$set(val2, '_checked', false);
        }
      });
    }, // 勾选上架无源入库表格行
    selectNotShelfBtn(data) {
      var v = this;
      v.noSouceDataList = data;
      v.noSouceDataList.forEach(val => {
        val.batchVolume = val.goodsVolume;
        val.batchWeight = val.goodsWeight;
        val.receiptId = v.inWareOrderId;
        val.receiptNo = v.inWareDetailsDataList.receiptNo;
        val.warehouseId = v.inWareDetailsDataList.warehouseId;
        val.resultFlag = 'S';
        val.source = 'U';
        v.data10.forEach((m, t) => {
          if (m.goodsSku === val.goodsSku) {
            val.goodsEndDate = m.goodsEndDate;
          }
        });
      });
    }, // 勾选质检无源入库表格行
    selectNotQualityBtn(data) {
      var v = this;
      v.noQualityDataList = data;
    }, // 确认上架参数
    // shelfParamsObj () {
    //   let v = this;
    //   let shelfOrderList = [];
    //   this.userConfirmShelvesList.forEach(val => {
    //     val.batchVolume = val.goodsVolume;
    //     val.batchWeight = val.goodsWeight;
    //     val.receiptId = v.inWareOrderId;
    //     val.receiptNo = v.inWareDetailsDataList.receiptNo;
    //     val.warehouseId = v.inWareDetailsDataList.warehouseId;
    //     val.resultFlag = 'S';
    //     val.source = 'P';
    //     v.userConfirmShelvesList.forEach((m, t) => {
    //       if (m.goodsSku === val.goodsSku) {
    //         val.goodsEndDate = m.goodsEndDate;
    //       }
    //     });
    //   });
    //   shelfOrderList = v.userConfirmShelvesList.filter(i => i.currentbatchNumber > 0);
    //   return shelfOrderList;
    // }, // 收货上架校验
    shelfDtlValidFn() {
      let v = this;
      let valid = true;
      let newList = JSON.parse(localStorage.getItem('selectDatas'));
      if (newList && newList.length === 0) {
        v.$Message.info({
          content: '请勾选要上架的数据,本次收货数量不能都为空',
          duration: 5
        });
        valid = false;
        return;
      }
      if (newList) {
        for (var i = 0; i < newList.length; i++) {
          if (newList[i].currentbatchNumber === null) {
            v.$Message.info({
              content: '本次收货数量不能为空',
              duration: 5
            });
            valid = false;
            return;
          }
          if (newList[i].currentbatchNumber <= 0) {
            v.$Message.info({
              content: '本次收货数量不能小于等于0',
              duration: 5
            });
            valid = false;
            return;
          }
          var re = v.$regular.AllNumber;
          if (!re.test(newList[i].currentbatchNumber)) {
            v.$Message.info({
              content: '本次收货数量不能为小数或0',
              duration: 5
            });
            valid = false;
            return;
          }
          if (!newList[i].warehouseLocationName || newList[i].warehouseLocationName === '') {
            v.$Message.info({
              content: '收货库位不能为空',
              duration: 5
            });
            valid = false;
            return;
          }
        }
      }

      return valid;
    },
    saveCache() {
      let v = this;
      // 和收货共用
      if (localStorage.getItem('receiptSetting')) {
        let receiptSetting = JSON.parse(localStorage.getItem('receiptSetting'));
        receiptSetting.isOvercharge = v.isOvercharge; // 是否超量收货
        localStorage.setItem('receiptSetting', JSON.stringify(receiptSetting));
      } else {
        let receiptSetting = {
          isOvercharge: v.isOvercharge // 是否超量收货
        };
        localStorage.setItem('receiptSetting', JSON.stringify(receiptSetting));
      }
    }, // 确认上架按钮
    confirmShelvesButton() {
      let v = this;
      let selectDatas = JSON.parse(localStorage.getItem('selectDatas'));
      if (v.isOvercharge === 'N' && selectDatas && selectDatas.some(i => i.currentbatchNumber > i.nobatchNumber)) {
        v.$Message.error('不允许超量收货！');
        return;
      }
      // 处理上架无源的数据
      let noneSourceDetails = [];
      if (v.noSouceDataList.length > 0) {
        v.noSouceDataList.map((item) => {
          noneSourceDetails.push({
            currentBatchNumber: item.currentBatchNumber,
            productGoodsId: item.productGoodsId,
            receiptDetailId: item.receiptDetailId ? item.receiptDetailId : null,
            warehouseLocationId: item.warehouseLocationId
          });
        });
      }
      let cancelReceiptDetailIds = v.deselectData.length > 0 ? v.deselectData : [];
      // 处理上架货品的数据
      let modifyDetails = [];
      if (selectDatas && selectDatas.length > 0) {
        for (let i = 0; i < selectDatas.length; i++) {
          modifyDetails.push({
            currentBatchNumber: selectDatas[i].editCurrentbatchNumber
              ? selectDatas[i].editCurrentbatchNumber
              : selectDatas[i].currentbatchNumber,
            productGoodsId: selectDatas[i].productGoodsId,
            receiptDetailId: selectDatas[i].receiptDetailId,
            warehouseLocationId: selectDatas[i].editWarehouseLocationId
          });
        }
      }
      var shelfObj = {
        isOvercharge: v.isOvercharge
          ? v.isOvercharge
          : 'N',
        noneSourceDetails: noneSourceDetails,
        resultFlag: v.isCheck ? 'Q' : 'S',
        // closeReceipt: v.isReceiptClose,
        receiptNo: this.inWareDetailsDataList.receiptNo,
        selectAll: v.selectAllShelfStatus,
        cancelReceiptDetailIds: cancelReceiptDetailIds,
        modifyDetails: modifyDetails,
        autoWarehouseLocationId: v.autoWarehouseLocationId
      };
      if (this.shelfDtlValidFn()) {
        v.axios.post(api.detail_receiveBatch, shelfObj).then(res => {
          if (res.data.code === 0) {
            v.$Message.success('收货成功！');
            this.searchData();
            v.userConfirmShelvesList = []; // 清除上架有源入库数据
            v.noSouceDataList = []; // 清除上架无源入库数据
            localStorage.removeItem('selectDatas');
            v.deselectData = [];
            v.selectDatas = [];
            v.$store.commit('tableShow', 'starts'); // 确认上架之后，返回关闭入库单页面
            this.validShelfSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validCheckSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validShelvesUSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validQualityUSku.forEach(val => {
              val.warehouseLocationId = '';
            });
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: '添加仓储入库单收货批次参数不能为空', // 添加仓储入库单收货批次参数不能为空
              duration: 4
            });
          } else if (res.data.code === -2) {
            v.$Message.info({
              content: '收货动作标志不能为空', // 收货动作标志不能为空
              duration: 4
            });
          }
        });
      }
    }, // 确认质检参数
    checkParamsObj() {
      let v = this;
      let qualityOrderList = [];
      v.userConfirmQualityList.forEach(val => {
        val.batchVolume = val.goodsVolume;
        val.batchWeight = val.goodsWeight;
        val.receiptId = v.inWareOrderId;
        val.receiptNo = v.inWareDetailsDataList.receiptNo;
        val.warehouseId = v.inWareDetailsDataList.warehouseId;
        val.resultFlag = 'Q';
        val.source = 'P';
      });
      v.noQualityDataList.forEach(val => {
        val.batchVolume = val.goodsVolume;
        val.batchWeight = val.goodsWeight;
        val.receiptId = v.inWareOrderId;
        val.receiptNo = v.inWareDetailsDataList.receiptNo;
        val.warehouseId = v.inWareDetailsDataList.warehouseId;
        val.resultFlag = 'Q';
        val.source = 'U';
      });
      if (v.userConfirmQualityList.length === 0) {
        qualityOrderList = v.noQualityDataList;
      } else if (v.noQualityDataList.length === 0) {
        qualityOrderList = v.userConfirmQualityList;
      } else {
        qualityOrderList = qualityOrderList.concat(v.userConfirmQualityList, v.noQualityDataList);
      }
      return qualityOrderList;
    }, // 确认质检校验
    checkDtlValidFn() {
      let v = this;
      let valid = true;
      let checkList = this.checkParamsObj();
      if (checkList.length === 0) {
        v.$Message.info({
          content: '请勾选要质检的数据',
          duration: 5
        });
        valid = false;
        return;
      }
      for (var i = 0; i < checkList.length; i++) {
        if (checkList[i].currentbatchNumber === null) {
          v.$Message.info({
            content: '本次收货数量不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
        if (checkList[i].currentbatchNumber <= 0) {
          v.$Message.info({
            content: '本次收货数量不能小于等于0',
            duration: 5
          });
          valid = false;
          return;
        }
        var re = v.$regular.AllNumber;
        if (!re.test(checkList[i].currentbatchNumber)) {
          v.$Message.info({
            content: '本次收货数量不能为小数或0',
            duration: 5
          });
          valid = false;
          return;
        }
        if (checkList[i].warehouseLocationName === '') {
          v.$Message.info({
            content: '收货库位不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
      }
      return valid;
    }, // 确认收货需质检按钮
    confirmQualityButton() {
      let v = this;
      let qualityOrderList = this.checkParamsObj();
      var qualityObj = {
        receiptBatch: qualityOrderList,
        resultFlag: 'Q',
        receiptNo: this.inWareDetailsDataList.receiptNo,
        isOvercharge: v.isOvercharge
          ? v.isOvercharge
          : 'N'
      };
      if (this.checkDtlValidFn()) {
        v.axios.post(api.add_receiveBatch, qualityObj).then(res => {
          if (res.data.code === 0) {
            v.$Message.success('确认质检成功');
            this.searchData();
            v.userConfirmQualityList = []; // 清除质检有源入库数据
            v.noQualityDataList = []; // 清除质检无源入库数据
            v.$store.commit('tableShow', 'starts'); // 确认收货之后，返回关闭入库单页面
            this.validShelfSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validCheckSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validShelvesUSku.forEach(val => {
              val.warehouseLocationId = '';
            });
            this.validQualityUSku.forEach(val => {
              val.warehouseLocationId = '';
            });
          } else if (res.data.code === -1) {
            v.$Message.info({
              content: '添加仓储入库单收货批次参数不能为空',
              duration: 4
            });
          } else if (res.data.code === -2) {
            v.$Message.info({
              content: '收货动作标志不能为空',
              duration: 4
            });
          } else if (res.data.code === 554135) {
            v.$Message.error('不允许超量收货');
            return false;
          } else if (res.data.code === 554136) {
            v.$Message.error('入库单已关闭,不能进行收货!');
            return false;
          }
        });
      }
    }, // 收货上架的按钮
    shelvesShowButton() {
      var v = this;
      v.$store.commit('tableShow', 'shelfTables');
      if (v.data10.length !== 0) {
        v.isNoShelfTableShow = true; // 上架无源入库表格显示
      } else {
        v.isNoShelfTableShow = false;
      }
      for (var i = 0; i < this.shelvesData.length; i++) {
        this.shelvesData[i].warehouseLocationName = this.Dposition.name;
        this.shelvesData[i].warehouseLocationId = this.Dposition.id;
        this.shelvesData[i].warehouseBlockId = '';
        v.$set(this.shelvesData[i], '_checked', true);
      }
      v.selectAllShelfStatus = true;
      v.data10.forEach(val => {
        v.$set(val, '_checked', true);
      });
      v.noSouceDataList = JSON.parse(JSON.stringify(v.data10));
      v.userConfirmShelvesList = JSON.parse(JSON.stringify(v.shelvesData));
      v.searchData();
      localStorage.removeItem('selectDatas');
    },
    // 收货需质检的按钮
    qualityShowButton() {
      var v = this;
      v.$store.commit('tableShow', 'qualityTables');
      if (v.data11.length !== 0) {
        v.isNoQualityTableShow = true; // 质检无源入库表格显示
      } else {
        v.isNoQualityTableShow = false;
      }
      for (var i = 0; i < this.qualityData.length; i++) {
        v.$set(this.qualityData[i], '_checked', true);
      }
      v.selectAllCheckStatus = true;
      v.data11.forEach(val => {
        v.$set(val, '_checked', true);
      });
      v.noQualityDataList = v.data11;
      v.userConfirmQualityList = this.qualityData;
    }, // 取消按钮
    cancelShow() {
      this.$store.commit('tableShow', 'starts');
      this.pageParams.pageNum = 1;
      this.isNoShelfTableShow = false;
      this.isNoQualityTableShow = false;
      this.searchData();
      this.validShelfSku.forEach(val => {
        val.warehouseLocationId = '';
      });
      this.validCheckSku.forEach(val => {
        val.warehouseLocationId = '';
      });
      this.validShelvesUSku.forEach(val => {
        val.warehouseLocationId = '';
      });
      this.validQualityUSku.forEach(val => {
        val.warehouseLocationId = '';
      });
    }, // 关闭入库单
    closeOrder() {
      var v = this;
      v.isDelModal(() => {
        v.axios.post(api.close_order + '?receiptIds=' + [this.inWareOrderId]).then(res => {
          if (res.data.code === 0) {
            v.isCloseShow = false; // 隐藏关闭入库单按钮
            v.isShow = false; // 隐藏收货上架按钮和收货需质检按钮
            v.$Message.success('成功关闭入库单');
            this.searchData();
          }
        });
      }, () => {
      }, '是否要关闭入库单');
    }, // 添加货品勾选的数据
    userSelectOk(data) {
      this.userSelectTable = data; // 用户勾选表格当前行的数据
    }, // 添加货品模态框
    addNewProductBtn(num) {
      this.showProductModal = true;
      this.checkNum = num;
    }, // 添加货品按钮
    confirmAddProductBtn() {
      var v = this;
      if (v.checkNum === 1) {
        var obj = {};
        for (var i = 0; i < v.userSelectTable.length; i++) {
          obj[v.userSelectTable[i].goodsSku] = 1;
          for (var j = 0; j < v.data10.length; j++) {
            if (obj[v.data10[j].goodsSku]) {
              v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
              v.showProductModal = true;
              return;
            }
          }
        }
        if (v.userSelectTable.length === 0) {
          v.showProductModal = true;
          v.$Message.info('请勾选你要添加的货品');
        } else {
          v.showProductModal = false;
          v.$Message.success('成功添加货品');
          v.userSelectTable.forEach(val => {
            val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
          });
          v.data10 = v.data10.concat(v.userSelectTable);
          if (v.data10.length !== 0) {
            v.isNoShelfTableShow = true; // 上架无源入库表格显示
          } else {
            v.isNoShelfTableShow = false;
          }
          v.isNoQualityTableShow = false; // 质检无源入库表格隐藏
        }
        v.data10.forEach((n, i) => {
          n.warehouseLocationName = ''; // 初始化一个空值
          n.currentbatchNumber = null;
        });
      } else {
        let obj = {};
        for (let i = 0; i < v.userSelectTable.length; i++) {
          obj[v.userSelectTable[i].goodsSku] = 1;
          for (let j = 0; j < v.data11.length; j++) {
            if (obj[v.data11[j].goodsSku]) {
              v.$Message.info('添加货品失败，你已经添加了该货品，不能重复添加');
              v.showProductModal = true;
              return;
            }
          }
        }
        if (v.userSelectTable.length === 0) {
          v.showProductModal = true;
          v.$Message.info('请勾选你要添加的货品');
        } else {
          v.showProductModal = false;
          v.$Message.success('成功添加货品');
          v.userSelectTable.forEach(val => {
            val.goodsVolume = val.goodsLength * val.goodsWidth * val.goodsHeight;
          });
          v.data11 = v.data11.concat(v.userSelectTable);
          if (v.data11.length !== 0) {
            v.isNoQualityTableShow = true; // 质检无源入库表格显示
          } else {
            v.isNoQualityTableShow = false;
          }
          v.isNoShelfTableShow = false; // 上架无源入库表格隐藏
        }
        v.data11.forEach((n, i) => {
          n.warehouseLocationName = ''; // 初始化一个空值
          n.currentbatchNumber = null;
        });
      }
    }, // 取消添加货品
    cancelAddBtn() {
      this.$Message.info('取消添加货品');
      this.showProductModal = false;
    }, // 获取库位名称
    getData(selectData) {
      let v = this;
      // 确认上架库位选择
      if (this.locateCheckType === 'checkShelvesP') {
        v.shelvesData.forEach((n, i) => {
          if (i === selectData.clickIndex) {
            let obj = {};
            obj.warehouseLocationId = selectData.warehouseLocationId;
            obj.goodsSku = n.goodsSku;
            for (let i = 0; i < this.validShelfSku.length; i++) {
              if (this.validShelfSku[i].goodsSku !== obj.goodsSku) {
                break;
              }
              if (this.validShelfSku[i].warehouseLocationId === selectData.warehouseLocationId) {
                v.$Message.info({
                  content: '相同Sku，收货库位不能相同',
                  duration: 5
                });
                return;
              }
            }
            this.validShelfSku.splice(0, 1, obj);
            n.warehouseLocationName = selectData.warehouseLocationName; // 库位名称
            n['editWarehouseLocationName'] = selectData.warehouseLocationName;
            n.warehouseLocationId = selectData.warehouseLocationId; // 库位ID
            n['editWarehouseLocationId'] = selectData.warehouseLocationId;
            n.warehouseBlockId = selectData.warehouseBlockId; // 库区ID
            v.shelvesTableStatus = false;
            v.$nextTick(function () {
              v.shelvesTableStatus = true;
            });
            v.$Message.success('选择库位成功');
            v.selectAllShelfStatus = false;
            this.showLocationModal = false;
          }
        });
        if (v.updateRow.row._checked) {
          let item = v.shelvesData[v.updateRow.index];
          if (v.selectDatas.length > 0) {
            v.selectDatas.map((ele, idx) => {
              if (ele.productGoodsId === v.updateRow.row.productGoodsId) {
                v.selectDatas.splice(idx, 1, item);
              } else {
                v.selectDatas.push(item);
              }
            });
          } else {
            v.selectDatas.push(item);
          }
          let query = v.unique(v.selectDatas);
          localStorage.setItem('selectDatas', JSON.stringify(query));
        }
        v.userConfirmShelvesList = v.shelvesData.filter(val => val['_checked']);
      }
      // 确认质检库位选择
      if (this.locateCheckType === 'checkQualityP') {
        v.qualityData.forEach((n, i) => {
          if (i === selectData.clickIndex) {
            let obj = {};
            obj.warehouseLocationId = selectData.warehouseLocationId;
            obj.goodsSku = n.goodsSku;
            for (let i = 0; i < this.validCheckSku.length; i++) {
              if (this.validCheckSku[i].goodsSku !== obj.goodsSku) {
                break;
              }
              if (this.validCheckSku[i].warehouseLocationId === selectData.warehouseLocationId) {
                v.$Message.info({
                  content: '相同Sku，收货库位不能相同',
                  duration: 5
                });
                return;
              }
            }
            this.validCheckSku.splice(0, 1, obj);
            n.warehouseLocationName = selectData.warehouseLocationName; // 库位名称
            n.warehouseLocationId = selectData.warehouseLocationId; // 库位ID
            n.warehouseBlockId = selectData.warehouseBlockId; // 库区ID
            v.qualityTableStatus = false;
            v.$nextTick(function () {
              v.qualityTableStatus = true;
            });
            v.$Message.success('选择库位成功');
            v.selectAllCheckStatus = false;
            this.showLocationModal = false;
            // v.$set(n, '_checked', false);
          }
        });
        v.userConfirmQualityList = v.qualityData.filter(val => val['_checked']);
      }
      // 上架无源入库库位选择
      if (this.locateCheckType === 'checkShelvesU') {
        v.data10.forEach((n, i) => {
          if (i === selectData.clickIndex) {
            let obj = {};
            obj.warehouseLocationId = selectData.warehouseLocationId;
            obj.goodsSku = n.goodsSku;
            for (let i = 0; i < this.validShelvesUSku.length; i++) {
              if (this.validShelvesUSku[i].goodsSku !== obj.goodsSku) {
                break;
              }
              if (this.validShelvesUSku[i].warehouseLocationId === selectData.warehouseLocationId) {
                v.$Message.info({
                  content: '相同Sku，收货库位不能相同',
                  duration: 5
                });
                return;
              }
            }
            this.validShelvesUSku.splice(0, 1, obj);
            n.warehouseLocationName = selectData.warehouseLocationName; // 库位名称
            n.warehouseLocationId = selectData.warehouseLocationId; // 库位ID
            n.warehouseBlockId = selectData.warehouseBlockId; // 库区ID
            v.notShelfTableStatus = false;
            v.$nextTick(function () {
              v.notShelfTableStatus = true;
            });
            v.$Message.success('选择库位成功');
            this.showLocationModal = false;
            // v.$set(n, '_checked', false);
          }
        });
        v.noSouceDataList = JSON.parse(JSON.stringify(v.data10)).filter(val => val['_checked']);
      }
      // 质检无源入库库位选择
      if (this.locateCheckType === 'checkQualityU') {
        v.data11.forEach((n, i) => {
          if (i === selectData.clickIndex) {
            let obj = {};
            obj.warehouseLocationId = selectData.warehouseLocationId;
            obj.goodsSku = n.goodsSku;
            for (let i = 0; i < this.validQualityUSku.length; i++) {
              if (this.validQualityUSku[i].goodsSku !== obj.goodsSku) {
                break;
              }
              if (this.validQualityUSku[i].warehouseLocationId === selectData.warehouseLocationId) {
                v.$Message.info({
                  content: '相同Sku，收货库位不能相同',
                  duration: 5
                });
                return;
              }
            }
            this.validQualityUSku.splice(0, 1, obj);
            n.warehouseLocationName = selectData.warehouseLocationName; // 库位名称
            n.warehouseLocationId = selectData.warehouseLocationId; // 库位ID
            n.warehouseBlockId = selectData.warehouseBlockId; // 库区ID
            v.notQualityTableStatus = false;
            v.$nextTick(function () {
              v.notQualityTableStatus = true;
            });
            v.$Message.success('选择库位成功');
            this.showLocationModal = false;
            // v.$set(n, '_checked', false);
          }
        });
        v.noQualityDataList = v.data11.filter(val => val['_checked']);
      }
    }, // 去重数组
    unique(arr) {
      const res = new Map();
      return arr.filter((a) => !res.has(a.productGoodsId) && res.set(a.productGoodsId, 1));
    },
    // // 获取所有的第三方标签
    // getThridLabelAll() {
    //   this.axios.post(api.productOverseaTagList).then(({ data }) => {
    //     if (data.code !== 0) return;
    //     this.thrdLableInfo.allLabelList = data.datas || [];
    //   });
    // },
    // 按第三方标签入库
    outByThirdLabel() {
      const { receiptNo } = this.inWareDetailsDataList;
      // let arr = this.data6.map(k => k.productGoodsId);
      //   this.thrdLableInfo.loading = true;
      //   this.axios.get(api.queryProductGoodsCommonOverseaTag + receiptNo)
      //     .then(({ data }) => {
      //       if (data.code !== 0) return;
      //       let list = data.datas || [];

      //       this.thrdLableInfo.labelList = this.thrdLableInfo.allLabelList.filter(k => {
      //         return list.includes(k.overseaTagId);
      //       })
      //       this.thrdLableInfo.visible = true;
      //     }).finally(() => {
      //       this.thrdLableInfo.loading = false;
      //     })
      this.thrdLableInfo.data = {
        receiptNo,
      }
      this.thrdLableInfo.visible = true;
    },
    // 选择第三方标签返回
    confirmLabel(temp) {
      let rqApi = `${api.modifyReceiptOverseaTag}${this.inWareDetailsDataList.receiptNo}`;
      Object.keys(temp).forEach((key, index) => {
        rqApi += `${index > 0 ? '&' : '?'}${key}=${temp[key]}`;
      })
      // console.log(temp, rqApi);
      let dom = this.$refs['outByThirdLabel'];
      dom.loading = true;
      this.axios.post(rqApi).then(({ data }) => {
        if (data.code !== 0) return;
        this.$Message.success("操作成功");
        dom.isVisible = false;
        this.searchData();
      }).finally(() => {
        dom.loading = false;
      })
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style>
