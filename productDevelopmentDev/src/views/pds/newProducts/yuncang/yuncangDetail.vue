<template>
  <transition name="bounce">
    <div class="subLayer" v-if="modelVisible">
      <div class="topper topper--flex">
        <div>
          <span class="title">需求详情</span>
          <span class="small-title" v-if="productData.modelNo">设计款号-{{ productData.modelNo }}</span>
        </div>
        <div class="topper__right">
          <template v-if="permissionStatus">
            <template v-if="gatherBasicBtn || gatherAttBtn">
              <Button type="primary" @click="gatherInformation">1688信息采集</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyPower'">
              <Button type="primary" @click="infringementReview()">侵权审核通过</Button>
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen')">驳回</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'assignPic' || dialogObj.btnoperat === 'assignData'">
              <Button type="primary" @click="assignPic('完善图片资料', 11)"
                v-if="productData.pictureVerifyStatus === 0">指派完善图片</Button>
              <Button type="primary" @click="assignPic('完善文本资料', 12)"
                v-if="productData.textVerifyStatus === 0">指派完善文本</Button>
            </template>
            <!-- 指派完善图片或完善资料 -->
            <template v-if="dialogObj.btnoperat === 'assignPic' || dialogObj.btnoperat === 'filInfo'">
              <Button type="primary" @click="goodVerifySubmit()" v-if="productData.textVerifyStatus === 0">提交</Button>
              <Button @click="goodVerifySubmit('save')" v-if="productData.textVerifyStatus === 0">保存</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'finishPic'">
              <Button type="primary" @click="submitUploadPic(1)">提交审核图片资料</Button>
              <Button @click="submitUploadPic(2)">保存</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'finishData'">
              <Button type="primary" @click="submitUploadText(1)">提交审核文本资料</Button>
              <Button @click="submitUploadText(2)">保存</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyPic'">
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen', 2)">图片驳回编辑</Button>
              <Button type="primary" @click="dataVerifySuccess(6)">图片审核通过</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyData'">
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen', 3)">文本驳回编辑</Button>
              <Button type="primary" @click="dataVerifySuccess(7)">文本审核通过</Button>
            </template>
            <!-- <template v-if="dialogObj.btnoperat === 'becomeSku'">
              <Button type="primary" @click="synchronization()">同步到Listing和商品系统</Button>
            </template> -->
            <template v-if="dialogObj.btnoperat === 'becomeSku' && ErpVisisable">
              <Button type="primary" @click="synchronization(1)">同步到ERP</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'becomeSku' && !ErpVisisable">
              <Button type="primary" @click="openSyncToListingAndYmsModal">同步到Listing以及YMS</Button>
              <Button type="primary" @click="synchronization(2)">同步到Listing</Button>
            </template>

            <template v-if="rejectBtn.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen')">驳回提交人</Button>
            </template>
            <template v-if="failBtn.includes(dialogObj.btnoperat) && !editBasic">
              <Button @click="assignUserOpen('voidDialogOpen')">作废</Button>
            </template>
            <template v-if="trunMan.includes(dialogObj.btnoperat)">
              <Button @click="assignUserOpen('transferDialogOpen')">转交</Button>
            </template>
          </template>
          <Button type="primary"
            v-if="(dialogObj.btnoperat === 'finishPic' && this.tag === 'commodityInformation') || (dialogObj.btnoperat === 'finishData' && this.tag === 'commodityInformation')"
            @click="goodVerifySubmit('saveDelete')">保存</Button>
          <Button @click="closeDialog(1)">关闭</Button>
        </div>
      </div>

      <div class="mainContent" :style="{ 'overflow-y': 'auto' }">
        <statu-step :productData="productData"></statu-step>
        <div class="main--flex">
          <div class="main--flex__left">
            <statu-button @statusButton="statusButton" :index="tag" :productData="productData" :dialogObj='dialogObj'>
            </statu-button>
          </div>
          <div class="main--flex__right">
            <!-- 基础资料 -->
            <basic-data ref="basicData" v-if="tag === 'basicData' && !pageLoading" :productData="productData"
              :basiclData="basiclData" :gatherDetail="gatherDetail" :operatList="operatList" v-bind="$attrs"
              :gatherBasic="gatherBasicBtn" @closeDialog="closeDialog" @backBasicsDetail="basicsDetailChange"
              :isedit="{ editBasic: editBasic, btnoperat: dialogObj.btnoperat }" />
            <!-- 商品资料 -->
            <keep-alive>
              <commodity-information-tab ref="commodityInformation" v-if="tag === 'commodityInformation' && !pageLoading"
                :productData="productData" :basiclData="basiclData" :gatherDetail="gatherDetail" :operatList="operatList"
                :gatherInformation="gatherAttBtn" :open-type.sync="openType" v-bind="$attrs"
                @goodVerifyHandle="goodVerifyHandle" @closeDialog="closeDialog" @activeTab="commodityActiveTab"
                :dialogObj='dialogObj' />
            </keep-alive>
            <!-- 完善文本 -->
            <text-material ref="textMaterial" v-if="tag === 'textMaterial'" :productData="productData"
              @closeDialog="closeDialog" @comfirmVerifyText="comfirmVerifyText" :openType="openType"
              :operatList="operatList" :btnoperat="dialogObj.btnoperat" />
            <!-- 完善图片 -->
            <picture-material ref="pictureMaterial" v-if="tag === 'pictureMaterial'" :productData="productData"
              @closeDialog="closeDialog" @confirmVerifyPic="confirmVerifyPic" :openType="openType"
              @statusButton="statusButton" :btnoperat="dialogObj.btnoperat" />
            <!-- SKU -->
            <generate-sku ref="generateSku" v-if="tag === 'generateSku'" :productData="productData" v-bind="$attrs"
              @closeDialog="closeDialog" :openType="openType" />
            <!-- 日志 -->
            <log ref="log" v-if="tag === 'log'" :productData="productData" v-bind="$attrs" />
          </div>
        </div>
      </div>

      <!-- 指派弹框 -->
      <assign-user ref="assignUser" :productData="productData" :submit-before="submitBefore" @closeDialog="closeDialog"
        @veriySubmit="veriySubmit" v-bind="$attrs" :dialogObj=dialogObj />
        
      <!-- 同步到YMS弹窗 -->
      <sync-info-yms-modal
        :modal-visible.sync="syncYmsVisibleModal"
        system="product"
        :modal-data="{
          productCategory: selectTreeProductCategory,
          data: checkTableRow,
          callBack: syncInfoToListing
        }"
        @closeDialog="closeDialog"
      />
      <!-- 加载遮罩层 -->
      <Spin v-if="pageLoading || gatherLoading" fix></Spin>
    </div>
  </transition>
</template>
 
<script>
import api from '@/api/api.js';
import statuStep from '../stockUp/statuStep';
import statuButton from '../stockUp/statuButton';
import basicData from '../stockUp/basicData';
import commodityInformationTab from './commodityInformationTab';
import textMaterial from '../stockUp/textMaterial';
import pictureMaterial from '../stockUp/pictureMaterial';
import generateSku from '../stockUp/generateSku';
import syncInfoYmsModal from '@/views/pds/componentPage/syncInfoYmsModal';
import log from '../stockUp/log';
import assignUser from '../stockUp/assignUser';

export default {
  name: "yuncangDetail",
  components: {
    statuStep, statuButton, basicData, commodityInformationTab, textMaterial, pictureMaterial, generateSku, log, assignUser,
    syncInfoYmsModal
  },
  data() {
    return {
      tag: 'basicData',
      openType: 'edit',
      productData: {},
      syncYmsVisibleModal: false,
      selectTreeProductCategory: [],
      checkTableRow: {},
      failBtn: ['subverify', 'verifyStyle', 'filInfo', 'verifyInfo', 'verifyPic', 'verifyData'],
      trunMan: ['verifyPower', 'verifyPrice', 'verifyPic', 'verifyData', 'finishPic', "finishData"],
      rejectBtn: ['verifyStyle', 'verifyInfo', 'verifyPrice'],
      pageLoading: false,
      gatherLoading: false,
      // 商品基本详情信息
      basiclData: {},
      // 商品详情模块信息变更后的值
      newBasicsData: {},
      // 采集详情
      gatherDetail: {},
      commodityInfoActiveTab: '',
      editBasic: false,
      modelVisible: false,
      ErpVisisable: true,
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          modelVisible: false,
          data: {},
          tag: '',
          btnoperat: '',
          openType: 'edit',
          ErpVisisable: true
        };
      }
    },
    operatList: {
      type: Array,
      default() {
        return [];
      }
    },
  },
  watch: {
    dialogObj: {
      deep: true,
      immediate: true,
      handler(newVal) {
        this.openType = newVal.openType;
        if (newVal.modelVisible) {
          this.open(newVal);
        }
      }
    },
    modelVisible: {
      deep: true,
      handler(newVal) {
        !newVal && this.$emit('update:dialogObj', {
          ...this.dialogObj,
          modelVisible: false
        });
      }
    }
  },
  computed: {
    // 是否可编辑
    permissionStatus() {
      let userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      let data = this.productData;
      let status = false;
      if (data.status === 5) {
        let picObj = {
          0: "requireVerifyBy",
          1: "pictureCompleteBy",
          2: "pictureVerifyBy",
        };
        let textObj = {
          0: "requireVerifyBy",
          1: "textCompleteBy",
          2: "textVerifyBy",
        };
        if (picObj[data.pictureVerifyStatus] && data[picObj[data.pictureVerifyStatus]] === userInfo.userId) {
          status = true;
        }
        if (textObj[data.textVerifyStatus] && data[textObj[data.textVerifyStatus]] === userInfo.userId) {
          status = true;
        }
      } else {
        status = data.requireVerifyBy === userInfo.userId;
      }
      return this.tag === this.dialogObj.tag && status;
    },
    // 商品链接
    goodLink() {
      if (this.$common.isEmpty(this.basiclData) || this.$common.isEmpty(this.basiclData.laPaProductInfo)) return '';
      return this.basiclData.laPaProductInfo.goodLink || '';
    },
    // 商品分类ID
    goodsCategoryId() {
      if (this.$common.isEmpty(this.newBasicsData)) return '';
      if (this.$common.isEmpty(this.newBasicsData.laPaProductInfo)) {
        if (this.$common.isEmpty(this.newBasicsData.productCategory)) return '';
        return this.newBasicsData.productCategory[this.newBasicsData.productCategory.length - 1];
      }
      return this.newBasicsData.laPaProductInfo.goodTypeId || '';
    },
    // 当前分类对应的尺码
    productCategorySize() {
      if (this.$common.isEmpty(this.newBasicsData)) return {};
      if (this.$common.isEmpty(this.newBasicsData.laPaProductInfo)) {
        if (this.$common.isEmpty(this.newBasicsData.productCategorySize)) return {};
        return this.newBasicsData.productCategorySize;
      }
      return { sizeType: this.newBasicsData.laPaProductInfo.sizeType };
    },
    // 尺码价格列表
    pricelist() {
      if (this.$common.isEmpty(this.newBasicsData)) return [];
      if (this.$common.isEmpty(this.newBasicsData.laPaProductSizeRelList)) {
        if (this.$common.isEmpty(this.newBasicsData.pricelist)) return [];
        return this.newBasicsData.pricelist;
      }
      return this.newBasicsData.laPaProductSizeRelList || [];
    },
    // 在基础资料模块时候显示采集按钮
    gatherBasicBtn() {
      return this.isAlBaba && (this.dialogObj.btnoperat === 'edit' || this.editBasic);
    },
    // 在商品资料模块时显示采集按钮
    gatherAttBtn() {
      return this.isAlBaba && this.dialogObj.btnoperat === 'filInfo' && ['commodity', 'attribute'].includes(this.commodityInfoActiveTab);
    },
    // 选中的供应商
    selectSupplier() {
      let supplierId = '';
      if (this.$common.isEmpty(this.newBasicsData)) return {};
      if (this.$common.isEmpty(this.newBasicsData.laPaProductInfo)) {
        supplierId = this.newBasicsData.supplier;
      } else {
        supplierId = this.newBasicsData.laPaProductInfo.supplierId;
      }
      if (this.$common.isEmpty(supplierId)) return {};
      return (this.$attrs.supplyList || []).find(f => f.supplierId === supplierId);
    },
    // 是否为 1688 供应商
    isAlBaba() {
      if (this.$common.isEmpty(this.selectSupplier)) return false;
      return [1, '1'].includes(this.selectSupplier.setupStatus);
    },
    // 创建人ID
    createdBy () {
      if (this.$common.isEmpty(this.dialogObj.data) || this.$common.isEmpty(this.dialogObj.data.createdBy)) return '';
      return this.dialogObj.data.createdBy;
    }
  },
  methods: {
    //判断是否同步
    isSync() {
      let productId = this.dialogObj.data.productId
      this.$axios.get(api.querySynInfo, {
        params: { productId: productId }
      }).then(res => {
        if (res.datas.spsSynSuccess == 1 && res.datas.spsSynSuccess == 1) this.ErpVisisable = false
      }
      )
    },
    // 打开窗口
    open(val) {
      this.isSync()
      this.tag = this.dialogObj.tag;
      this.productData = this.dialogObj.data;
      this.editBasic = false;
      this.modelVisible = val;

      if (this.$common.isEmpty(this.dialogObj.data) || this.$common.isEmpty(this.dialogObj.data.productId)) return;
      this.pageLoading = true;
      this.getBasicsDetail(this.dialogObj.data.productId).then(res => {
        let awaitRes = [];
        this.$common.promiseAll(awaitRes).then(resArr => {
          // console.log(resArr);
        }).finally(() => {
          this.pageLoading = false;
        })
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 获取新品品基本信息
    getBasicsDetail(productId) {
      return new Promise((resolve) => {
        this.basiclData = {};
        this.$axios.get(api.queryLaPaProductInfo, { params: { productId: productId } }).then((res) => {
          this.basiclData = res.code === 0 ? res.datas || {} : {};
          this.newBasicsData = this.$common.copy(this.basiclData);
          resolve(this.basiclData);
        }).catch(err => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 基本信息改变
    basicsDetailChange(data) {
      this.newBasicsData = this.$common.copy(data);
    },
    // 获取 1688 采集信息
    gatherInformation() {
      if (this.$common.isEmpty(this.goodLink)) {
        this.$Message.error('请选择填入"商品链接"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (this.$common.isEmpty(this.goodsCategoryId)) {
        this.$Message.error('请选择"商品分类"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (!this.$common.isEmpty(this.productCategorySize) && this.$common.isEmpty(this.pricelist)) {
        this.$Message.error('请选中要使用的尺码组中的任一尺码');
        this.gatherLoading = false;
        return;
      }
      if (this.gatherLoading) return;
      this.gatherLoading = true;
      this.gatherDetail = {};
      this.$axios.post(api.getGrabInformation, {
        goodLink: this.goodLink,
        productCategoryId: this.goodsCategoryId
      }).then((res) => {
        if (res.code != 0) return;
        this.gatherDetail = this.$common.trim(res.datas);
      }).finally(() => {
        this.gatherLoading = false;
      })
    },
    // 切换到什么标签下
    commodityActiveTab(tabName) {
      this.commodityInfoActiveTab = tabName;
    },
    // 关闭窗口 (type:1 不需要更新列表接口)
    closeDialog(type) {
      this.modelVisible = false;
      this.ErpVisisable = true;
      !type && this.$emit('fetch');
    },
    // 按钮点击切换
    statusButton(type) {
      this.tag = type || 'basicData';
    },
    // 提交审核图片资料
    submitUploadPic(type, callBack) {
      this.$refs['pictureMaterial'].handleData(type, callBack);
    },
    // 保存至审核图片
    confirmVerifyPic() {
      let temp = {
        title: '提交审核图片',
        assignMan: true,
        advinceForSupply: false,
        status: 13,
        labelAssign: '指派审核图片'
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 提交审核文本资料
    submitUploadText(type, callBack) {
      this.$refs['textMaterial'].handleData(type, callBack);
    },
    // 保存至审核商品资料
    comfirmVerifyText() {
      let temp = {
        title: '提交审核商品资料',
        assignMan: true,
        advinceForSupply: false,
        status: 14,
        labelAssign: '指派审核商品资料'
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 审样核价通过/审样核价保存
    accessVeirfyPrice(type, callBack) {
      this.$refs['sampleReview'].handleData(type, callBack);
    },
    // 审样核价验证通过
    verifyFormValidate() {
      let temp = {
        title: '审样核价',
        content: '确认审样核价通过？',
        advinceForSupply: true,
        status: 4
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 审款
    paymentReview() {
      let temp = {
        title: '审核商品资料',
        assignMan: true,
        advinceForSupply: true,
        status: 4,
        labelAssign: '指派侵权审核'
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 通过并无需审样核价
    accessNoVerifyPrice() {
      let temp = {
        title: '审核商品资料',
        content: '确定审核通过，并通知提交人完善商品资料',
        advinceForSupply: true,
        status: 5
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 侵权审核
    infringementReview() {
      let type = this.categoryData(this.productData.goodTypeId) ? 0 : 1;
      let temp = {
        title: '侵权审核',
        content: '确定审核通过，并通知创建人生成sku',
        advinceForSupply: true,
        status: 4,
        assignMan: true,
        showNextContent: true,
        nextLabel: '下一阶段',
        nextContent: '生成SKU',
        createdBy: this.createdBy,
        labelAssign: '指派人员',
        productType: type
      };
      this.$nextTick(() => {
        this.$refs['assignUser'].verifyDialogOpen(temp);
      });
    },
    // 处理商品分类
    categoryData(productCategoryId) {
      let productList = this.getProductCategoryTree(this.operatList, null);
      let result = null;
      let a = (list, id) => {
        list.forEach(k => {
          if (id === k.productCategoryId) {
            if (k.sizeType || k.sizeType === 0) {
              result = k;
            } else {
              if (k.parentId) {
                a(productList, k.parentId);
              }
            }
          } else {
            if (k.children && k.children.length) {
              a(k.children, id);
            }
          }
        });
      };
      a(productList, productCategoryId);
      return result;
    },
    // 组装商品分类树
    getProductCategoryTree(productCategoryList, parentId) {
      var tree = [];
      var children;
      productCategoryList.forEach((n) => {
        if (n.parentId === parentId) {
          n.label = n.cnName;
          n.value = n.productCategoryId;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },

    // 审样核价审核
    veriySubmit(data) {
      this.$refs['sampleReview'].handleForm(data);
    },
    // 转交之前需要对信息进行保存
    submitBefore(callBack) {
      switch (this.dialogObj.btnoperat) {
        case 'verifyPrice':
          this.accessVeirfyPrice(2, (res) => {
            typeof callBack == 'function' && callBack(res);
          })
          break;
        case 'finishPic':
          this.submitUploadPic(2, (res) => {
            typeof callBack == 'function' && callBack(res);
          })
          break;
        case 'finishData':
          this.submitUploadText(2, (res) => {
            typeof callBack == 'function' && callBack(res);
          })
          break;
        default:
          typeof callBack == 'function' && callBack(true);
          break;
      }
    },
    // 保存
    savebasicData() {
      this.$refs['basicData'].handleSubmit(2);
    },
    // 提交审核
    verifySubmit() {
      let { productId } = this.productData;
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: "提交审核",
          content: "审核基础资料",
          productId: productId,
          status: 0,
          advinceForSupply: false
        }
      );
    },
    // 商品资料提交审核
    goodVerifySubmit(type) {
      this.$refs['commodityInformation'].handleSubmit(type);
    },
    // 商品资料提交审核返回
    goodVerifyHandle() {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: "指定图片文本审核人",
          content: "指定图片文本审核人",
          status: 23,
          advinceForSupply: false,
          isModelVisiable: true
        }
      );
    },
    // 指派审样核价
    assignVeriGoodPrice() {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: "审核商品资料",
          content: "审样核价",
          status: 4,
          advinceForSupply: true,
        }
      );
    },
    // 修改基础资料
    editBasicData(result) {
      this.editBasic = result;
      // if (!result) {
      //   this.$refs['basicData'].getProductDetail();
      // }
    },
    // 按钮弹框
    assignUserOpen(way, status) {
      let temp = {
        'finishPic': 15,
        'finishData': 16,
      };
      if (way === 'transferDialogOpen' && temp[this.dialogObj.btnoperat]) {
        this.$refs['assignUser'][way](temp[this.dialogObj.btnoperat]);
      } else {
        this.$refs['assignUser'][way](status);
      }
    },
    // 指派完善图片或完善资料
    assignPic(content, status) {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: content,
          content: content,
          status: status,
          advinceForSupply: false,
        }
      );
    },

    assignPandT() {
      //提交商品资料的保存
      //表单的校验

      //提交图片/文本的审核人
      //跳出去待完善图片和文本

    },

    // 图片/文本审核通过
    // dataVerifySuccess (status) {
    //   let temp = {
    //     title: '审核商品资料',
    //     // assignMan: true,
    //     content: '确定审核通过？',
    //     advinceForSupply: false,
    //     status: status,
    //     // labelAssign: '指派生成sku'
    //   };
    //   this.$refs['assignUser'].verifyDialogOpen(temp);
    // },
    dataVerifySuccess(status) {
      if (this.dialogObj.btnoperat === 'verifyPic') this.$refs['pictureMaterial'].handlePic();
      //图片审核
      if (this.dialogObj.data.pictureVerifyStatus == 2 && this.dialogObj.data.textVerifyStatus == 3) {
        this.$refs['pictureMaterial'].handlePic();
        this.$refs['assignUser'].nextDialogOpen(
          {
            title: "指派侵权审核人",
            content: "侵权审核",
            status: 6,
            advinceForSupply: false,
            remarkShow: true
          }
        );
        return
      }
      //文本审核
      if (this.dialogObj.data.pictureVerifyStatus == 3 && this.dialogObj.data.textVerifyStatus == 2) {
        this.$refs['assignUser'].nextDialogOpen(
          {
            title: "指派侵权审核人",
            content: "侵权审核",
            status: 7,
            advinceForSupply: false,
            remarkShow: true
          }
        );
        return
      }
      let temp = {
        title: '审核商品资料',
        // assignMan: true,
        content: '确定审核通过？',
        advinceForSupply: false,
        status: status,
        // labelAssign: '指派生成sku'
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
    },
    // 同步到listing
    synchronization(num) {
      this.$refs['generateSku'].handleData(num);
    },
    syncInfoToListing () {
      return () => {
        return this.$refs['generateSku'].handleData(2, { notSpin: true, notConfirm: true });
      }
    },
    // 同步信息到 Listing 和 YMS
    openSyncToListingAndYmsModal () {
      this.checkTableRow = this.$common.copy(this.productData);
      this.$set(this.checkTableRow, 'productCategoryId', this.productData.goodTypeId);
      this.$nextTick(() => {
        this.syncYmsVisibleModal = true;
      });
    }
  }
};
</script>
<style scoped>
.main--flex {
  display: flex;
  overflow: hidden;
}

.main--flex__left {
  width: 110px;
  margin-right: 20px;
}

.main--flex__right {
  /* 这里宽度这么做的原因是因为Table组件在flex布局下面宽度会自动无限增加的问题 */
  width: calc(100% - 130px);
  border: 1px solid #dcdee2;
  padding: 20px 10px;
}

.topper__right button {
  margin-left: 10px;
}
</style>