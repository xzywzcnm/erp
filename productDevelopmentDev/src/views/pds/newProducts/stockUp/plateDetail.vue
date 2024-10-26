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
            <template v-if="dialogObj.btnoperat === 'verifyStyle'">
              <Button type="primary" @click="paymentReview()">审款通过</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyPower'">
              <Button type="primary" @click="infringementReview()">侵权审核通过</Button>
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen')">驳回提交人</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'filInfo'">
              <Button type="primary" @click="goodVerifySubmit()">提交审核</Button>
              <Button @click="goodVerifySubmit('save')">保存</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyInfo'">
              <Button type="primary" @click="accessNoVerifyPrice()">通过并无需审样核价</Button>
              <Button type="primary" @click="assignVeriGoodPrice()">审样核价</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'verifyPrice'">
              <Button type="primary" @click="accessVeirfyPrice(1)">审样核价通过</Button>
              <Button @click="accessVeirfyPrice(2)">保存</Button>
            </template>
            <template v-if="dialogObj.btnoperat === 'assignPic' || dialogObj.btnoperat === 'assignData'">
              <Button type="primary" @click="assignPic('完善图片资料', 11)"
                v-if="productData.pictureVerifyStatus === 0">指派完善图片</Button>
              <Button type="primary" @click="assignPic('完善文本资料', 12)"
                v-if="productData.textVerifyStatus === 0">指派完善文本</Button>
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
            <template v-if="dialogObj.btnoperat === 'becomeSku'">
              <template v-if="ErpVisisable">
                <Button type="primary" @click="synchronization(1)">同步到商品</Button>
              </template>
              <template v-if="!ErpVisisable && statusTemp.listingSynSuccess != 1">
                <Button type="primary" @click="openSyncToListingAndYmsModal">同步到Listing以及YMS</Button>
                <Button type="primary" @click="synchronization(2)">同步到Listing</Button>
              </template>
            </template>
            
            <template v-if="amendBasic.includes(dialogObj.btnoperat) && !this.editBasic && !(productData.productSource === 1 && productData.status === 0)">
              <Button type="primary" @click="editBasicData(true)">修改基础资料</Button>
            </template>
            <template v-if="submitSaveBtn.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="saveAndSubmitData(1)">提交</Button>
            </template>
            <template v-if="verifyBtn.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="verifySubmit()">提交</Button>
            </template>
            <template v-if="submitSaveAudit.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="verifySubmit()">提交审核</Button>
            </template>
            <template v-if="rejectBtn.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="assignUserOpen('rejectDialogOpen')">驳回</Button>
            </template>
            <template v-if="saveBtn.includes(dialogObj.btnoperat)">
              <Button type="primary" @click="saveAndSubmitData(2)">保存</Button>
            </template>
            <template v-if="trunMan.includes(dialogObj.btnoperat)">
              <Button @click="assignUserOpen('transferDialogOpen')">转交</Button>
            </template>
            <template v-if="failBtn.includes(dialogObj.btnoperat) && !editBasic">
              <Button @click="assignUserOpen('voidDialogOpen')">作废</Button>
            </template>            
          </template>
          <Button type="primary"
            v-if="(dialogObj.btnoperat === 'finishPic' && this.tag === 'commodityInformation') || (dialogObj.btnoperat === 'finishData' && this.tag === 'commodityInformation')"
            @click="goodVerifySubmit('saveDelete')">保存</Button>
          <Button @click="closeDialog(1)">关闭</Button>
        </div>
      </div>
      <div class="mainContent" :style="{ 'overflow-y': 'auto' }">
        <statuStep :productData="productData" platformType="plate" />
        <div class="main--flex">
          <div class="main--flex__left">
            <statu-button
              @statusButton="statusButton"
              :index="tag"
              :productData="productData"
              :dialogObj='dialogObj'
              class="plate-detail-side"
              platformType="plate"
            />
          </div>
          <div class="main--flex__right">
            <!-- 基础资料和打版资料 -->
            <div v-show="['editBasicData', 'basicData'].includes(tag) || ['perfectSample'].includes(dialogObj.btnoperat)">
              <keep-alive>
                <createPlateData
                  ref="basicData"
                  v-show="['editBasicData', 'basicData'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :operatList="operatList"
                  :visibleSide="false"
                  :detailTag="tag"
                  :isedit="{ editBasic: editBasic, btnoperat: dialogObj.btnoperat }"
                  :btnoperat="dialogObj.btnoperat"
                  @closeDialog="closeDialog"
                />
              </keep-alive>
            </div>
            <div v-if="['materialConfirm', 'pEvaluationConfirm'].includes(dialogObj.btnoperat) || ['materialData'].includes(tag)">
              <keep-alive>
                <!-- 物料资料 -->
                <materialData
                  ref="materialRefDemo"
                  v-show="['materialData'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :modelVisible="modelVisible.modelVisible"
                  :openType="openType"
                  :btnoperat="dialogObj.btnoperat"
                />
              </keep-alive>
            </div>
            <div v-if="['perfectSample', 'sampleConfirm'].includes(dialogObj.btnoperat) || ['sampleManufacturing'].includes(tag)">
              <keep-alive>
                <!-- 制作样衣(纸样文件) tag sampleManufacturing -->
                <sampleDressInfo
                  ref="sampleRefDemo"
                  v-show="['sampleManufacturing'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :modelVisible="modelVisible.modelVisible"
                  :openType="openType"
                  :btnoperat="dialogObj.btnoperat"
                />
              </keep-alive>
            </div>
            <div
              v-if="['pEvaluationConfirm'].includes(dialogObj.btnoperat) || ['processRequirement', 'sampleDressAudit', 'twiceProcessTag'].includes(tag)"
            >
              <keep-alive>
                <!-- 样衣审核(车缝工价) tag sampleDressAudit -->
                <sewingLaborRrate
                  ref="sdAuditRefDemo"
                  v-show="['sampleDressAudit'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :modelVisible="modelVisible.modelVisible"
                  :openType="openType"
                  :btnoperat="dialogObj.btnoperat"
                />
              </keep-alive>
              <keep-alive>
                <!-- 样衣审核(工艺要求) tag processRequirement -->
                <technologicalRequire
                  ref="trRefDemo"
                  v-show="['processRequirement'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :modelVisible="modelVisible.modelVisible"
                  :openType="openType"
                  :btnoperat="dialogObj.btnoperat"
                />
              </keep-alive>
              <keep-alive>
                <!-- 样衣审核(二次工艺要求) tag twiceProcessTag -->
                <twiceCraftRequire
                  ref="twiceRefDemo"
                  v-show="['twiceProcessTag'].includes(tag)"
                  :productData="productData"
                  v-bind="$attrs"
                  :modelVisible="modelVisible.modelVisible"
                  :openType="openType"
                  :btnoperat="dialogObj.btnoperat"
                />
              </keep-alive>
            </div>
            <!-- 大货价格 tag: 'priceEvaluation', btnoperat: 'priceConfirmation'-->
            <keep-alive>
              <bulkPrice
                ref="peRefDemo"
                v-if="['priceConfirmation'].includes(tag)"
                :productData="productData"
                v-bind="$attrs"
                :modelVisible="modelVisible.modelVisible"
                :openType="openType"
                :btnoperat="dialogObj.btnoperat"
              />
            </keep-alive>
            <!-- 商品资料 -->
            <keep-alive>
              <commodity-information-tab
                ref="commodityInformation"
                v-if="['commodityInformation'].includes(tag)"
                :productData="productData"
                :operatList="operatList"
                :open-type.sync="openType"
                v-bind="$attrs"
                @goodVerifyHandle="goodVerifyHandle"
                @closeDialog="closeDialog"
                :dialogObj='dialogObj'
                platformType="plate"
              />
            </keep-alive>

            <sample-review ref="sampleReview" v-if="tag === 'sampleReview'" :productData="productData"
              @verifyFormValidate="verifyFormValidate" v-bind="$attrs" :openType="openType"
            />
            <text-material ref="textMaterial" v-if="tag === 'textMaterial'" :productData="productData"
              @closeDialog="closeDialog" @comfirmVerifyText="comfirmVerifyText" :openType="openType"
              :operatList="operatList" :btnoperat="dialogObj.btnoperat"
            />
            <picture-material ref="pictureMaterial" v-if="tag === 'pictureMaterial'" :productData="productData"
              @closeDialog="closeDialog" @confirmVerifyPic="confirmVerifyPic" :openType="openType"
              @statusButton='statusButton' :btnoperat="dialogObj.btnoperat"
            />
            <keep-alive>
              <generate-sku
                ref="generateSku"
                v-if="['generateSku'].includes(tag)"
                :productData="productData"
                v-bind="$attrs"
                @closeDialog="closeDialog"
                :openType="openType"
                platformType="plate"
              />
            </keep-alive>
            <log ref="log" v-if="tag === 'log'" :productData="productData" v-bind="$attrs" />
          </div>
        </div>
      </div>
      <!-- 指派弹框 -->
      <assign-user ref="assignUser" :productData="productData" :submit-before="submitBefore" @closeDialog="closeDialog"
        @veriySubmit="veriySubmit" v-bind="$attrs" :dialogObj='dialogObj' />
      
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
    </div>
  </transition>
</template>
 
<script>
import api from '@/api/api.js';
import statuStep from './statuStep';
import statuButton from './statuButton';
import createPlateData from './createPlateData';
import sampleReview from './sampleReview';
import materialData from './materialData';
import textMaterial from './textMaterial';
import pictureMaterial from './pictureMaterial';
import generateSku from './generateSku';
import sampleDressInfo from './sampleDressInfo';
import sewingLaborRrate from './sewingLaborRrate';
import technologicalRequire from './technologicalRequire';
import twiceCraftRequire from './twiceCraftRequire';
import bulkPrice from './bulkPrice';
import syncInfoYmsModal from '@/views/pds/componentPage/syncInfoYmsModal';
import commodityInformationTab from './commodityInformationTab';

import log from './log';
import assignUser from './assignUser';
export default {
  name: "plateDetail",
  components: {
    statuStep,
    statuButton,
    createPlateData,
    sampleReview,
    textMaterial,
    pictureMaterial,
    materialData,
    generateSku,
    sampleDressInfo,
    sewingLaborRrate,
    technologicalRequire,
    twiceCraftRequire,
    commodityInformationTab,
    bulkPrice,
    log,
    assignUser,
    syncInfoYmsModal
  },
  data() {
    return {
      tag: 'basicData',
      openType: 'edit',
      syncYmsVisibleModal: false,
      selectTreeProductCategory: [],
      checkTableRow: {},
      productData: {},
      // 修改基础资料
      amendBasic: [],
      // 保存并且提交
      submitSaveBtn: [
        'subverify', 'editBasicData', 'edit', 'materialConfirm', 'sampleConfirm', 'pEvaluationConfirm', 'perfectSample',
      ],
      // 提交
      verifyBtn: ['pConfirmation', 'sDressConfirm'],
      // 提交审核按钮
      submitSaveAudit: [],
      // 保存
      saveBtn: [
        'subverify', 'editBasicData', 'edit', 'materialConfirm'
      ],
      // 作废
      failBtn: [
        'subverify', 'edit', 'materialConfirm', 'pConfirmation', 'verifyStyle', 'filInfo', 'verifyInfo', 'verifyPic', 'verifyData',
        'sDressConfirm'
      ],
      // 转交
      trunMan: [
        'materialConfirm', 'sampleConfirm', 'sDressConfirm', 'pEvaluationConfirm', 'pConfirmation', 'verifyStyle', 'verifyPower',
        'verifyPrice', 'verifyPic', 'verifyData', 'finishPic', 'finishData', 'perfectSample'
      ],
      // 驳回
      rejectBtn: [
        'materialConfirm', 'sDressConfirm', 'pConfirmation', 'verifyStyle', 'verifyInfo', 'verifyPrice', 'sampleConfirm', 'pEvaluationConfirm',
        'perfectSample'
      ],
      editBasic: false,
      modelVisible: false,
      ErpVisisable: true,
      statusTemp: {},
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
          openType: 'edit'
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
      const nowState = data.status;
      if (['pConfirmation', 'sDressConfirm'].includes(this.dialogObj.btnoperat)) {
        return status;
      }
      if (['pEvaluationConfirm'].includes(this.dialogObj.btnoperat) && ['sampleDressAudit', 'twiceProcessTag', 'processRequirement', 'materialData'].includes(this.tag)) {
        return status && nowState == 15;
      }
      if (['perfectSample'].includes(this.dialogObj.btnoperat) && ['sampleManufacturing', 'editBasicData'].includes(this.tag)) {
        return status && nowState == 18;
      }
      if (['editBasicData', 'basicData'].includes(this.tag)) {
        if (['verifyPower'].includes(this.dialogObj.btnoperat)) {
          return this.tag === this.dialogObj.tag && status;
        }
        return status && nowState == 0;
      }
      return this.tag === this.dialogObj.tag && status;
    }
  },
  created() {
    // this.isSync()
  },
  methods: {
    //判断是否同步
    isSync() {
      let productId = this.dialogObj.data.productId
      this.$axios.get(api.querySynInfo, {
        params: { productId: productId }
      }).then(({ datas }) => {
        this.statusTemp = datas || {};
        // spsSynSuccess 采购系统同步状态 0-未同步 1-已同步 2-同步失败
        // productSynSuccess 商品系统同步状态 0-未同步 1-已同步 2-同步失败
        // listingSynSuccess 刊登系统同步状态 0-未同步 1-已同步 2-同步失败
        if (datas.spsSynSuccess == 1 && datas.productSynSuccess == 1) this.ErpVisisable = false;
      })
    },
    // 打开窗口
    open(val) {
      this.isSync();
      this.tag = this.dialogObj.tag;
      this.productData = this.dialogObj.data;
      this.editBasic = false;
      this.modelVisible = val;
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
    // 商品资料提交审核
    goodVerifySubmit(type) {
      this.$refs['commodityInformation'].handleSubmit(type);
    },
    // 审款
    paymentReview() {
      let temp = {
        title: '审核商品资料',
        // assignMan: true,
        advinceForSupply: true,
        status: 4,
        labelAssign: '指派侵权审核',
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
        content: '确定审核通过，并通知创建人同步商品',
        advinceForSupply: true,
        status: 4,
        productType: type
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);
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
    // 保存 1 为提交  其他保存
    saveAndSubmitData(type) {
      // 基础资料、打版资料提交(保存) 待样衣审核 时有可能修改 打版资料， 需要保存一下
      if (['subverify', 'edit'].includes(this.dialogObj.btnoperat)) {
        return this.$refs['basicData'].handleSubmit(type, this.dialogObj.btnoperat).then(res => {
          if (!res.success) return;
          res && res.isColose && this.closeDialog();
        })
      }
      // 物料资料提交(保存)
      if (['materialConfirm'].includes(this.dialogObj.btnoperat)) {
        return this.$refs.materialRefDemo.saveFormData(type).then(res => {
          if (!res.success) return;
          res && res.isColose && this.closeDialog();
          if (type != 1) return;
          this.assignUserNext({
            title: "提交制作样衣",
            content: "制作样衣",
            type: type,
            // 当 status 为 0 时提交，为 1 时驳回, 为 4 时审核通过 (物料资料提交需要传 4 ，后端流程问题)
            status: 4
          })
        })
      }
      // 制作样衣(纸样文件)提交(保存)
      if (['sampleConfirm'].includes(this.dialogObj.btnoperat)) {
        return this.$refs.sampleRefDemo.saveFormData(type).then(res => {
          if (!res.success) return;
          res && res.isColose && this.closeDialog();
          if (type != 1) return;
          this.assignUserNext({
            title: "提交样衣审核",
            content: "样衣审核",
            type: type
          })
        })
      }
      // 完善样衣资料
      if (['perfectSample'].includes(this.dialogObj.btnoperat)) {
        return this.$common.promiseAll([
          // 基础资料保存
          () => {
            return this.$refs.basicData.handleSubmit(type, this.dialogObj.btnoperat)
          },
          // 纸样保存
          () => {
            return this.$refs.sampleRefDemo.saveFormData(type)
          }
        ]).then((resArr) => {
          let isFail = [];
          let isClose = [];
          resArr.forEach(item => {
            !item.success && isFail.push(item);
            item.isColose && isClose.push(item);
          });
          if (!this.$common.isEmpty(isFail)) return;
          (!this.$common.isEmpty(isClose) && isClose.length == resArr.length) && this.closeDialog();
          if (type != 1) return;
          this.assignUserNext({
            title: "提交样衣资料",
            content: "价格估算",
            type: type
          })
        })
      }
      // 样衣审核-价格估算-(车缝工价)提交(保存)
      if (['pEvaluationConfirm'].includes(this.dialogObj.btnoperat)) {
        return this.$common.promiseAll([
          // 物料价格保存
          () => {
            return this.$refs.materialRefDemo.saveFormData(type)
          },
          // 车缝工价
          () => {
            return this.$refs.sdAuditRefDemo.saveFormData(type)
          },
          // 工艺要求
          () => {
            return this.$refs.trRefDemo.saveFormData(type)
          },
          // 二次工艺要求
          () => {
            return this.$refs.twiceRefDemo.saveFormData(type)
          }
        ]).then((resArr) => {
          let isFail = [];
          let isClose = [];
          resArr.forEach(item => {
            !item.success && isFail.push(item);
            item.isColose && isClose.push(item);
          });
          if (!this.$common.isEmpty(isFail)) return;
          (!this.$common.isEmpty(isClose) && isClose.length == resArr.length) && this.closeDialog();
          if (type != 1) return;
          this.assignUserNext({
            title: "提交价格估算",
            content: "价格确认",
            type: type
          })
        })
      }
    },
    // 
    assignUserNext (obj) {
      this.$refs.assignUser && this.$refs.assignUser.nextDialogOpen({
        productId: this.productData.productId,
        // status: 0 提交，1 驳回, 4 审核通过, 8 转交, 9 作废
        status: 0,
        ...obj
      });
    },
    // 提交审核
    verifySubmit () {
      return new Promise(resolve => {
        if (['pConfirmation'].includes(this.dialogObj.btnoperat)) {
          this.assignUserNext({
            title: "价格确认通过",
            content: "完善商品信息",
            type: 1,
            // 流程问题，， status 需要传 4
            status: 4
          })
          return;
        }
        if (['sDressConfirm'].includes(this.dialogObj.btnoperat)) {
          this.assignUserNext({
            title: "样衣审核通过",
            content: "完善样衣资料",
            type: 1,
            // 流程问题，， status 需要传 4
            status: 4
          })
          return;
        }
        this.$refs['basicData'].getFormdata().then(res => {
          if (res) {
            let { productId } = this.productData;
            this.$refs['assignUser'].nextDialogOpen(
              {
                title: "提交审核",
                content: "审核基础资料",
                productId: productId,
                status: 0,
                advinceForSupply: false,
              }
            );
          }
        })
      })
    },
    // 商品资料提交审核返回
    goodVerifyHandle () {
      this.$refs['assignUser'].nextDialogOpen({
        title: "指派完善图片或文本",
        content: "指派完善图片或文本",
        status: 0,
        advinceForSupply: false
      });
    },
    // 指派审样核价
    assignVeriGoodPrice() {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: "审核商品资料",
          content: "审样核价",
          status: 4,
          advinceForSupply: true
        }
      );
    },
    // 修改基础资料
    editBasicData(result) {
      this.editBasic = result;
      if (!result) {
        this.$refs['basicData'].getProductDetail();
      }
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
      this.$refs.generateSku && this.$refs.generateSku.handleData(num, {
        title: '同步商品系统',
        content: '确定生成SKU并同步？确定后不可修改'
      });
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
<style lang="less" scoped>

.main--flex {
  display: flex;
  position: relative;
  overflow: hidden;
  .plate-detail-side{
    position: fixed;
  }
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