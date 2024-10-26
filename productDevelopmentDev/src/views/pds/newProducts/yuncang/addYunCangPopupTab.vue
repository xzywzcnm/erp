<template>
  <transition name="bounce">
    <template v-if="tabVisible">
      <div class="subLayer">
        <div class="topper topper--flex">
          <span class="title">{{yuncangData.title || '云仓新品需求'}}</span>
          <div class="topper__right">
            <Button type="primary" @click="gatherInformation" v-if="showgatherBtn">1688信息采集</Button>
            <Dropdown trigger="click" :transfer="true" placement="bottom-end" class="ml10">
              <Button type="primary" v-if="btnType === 'add' || btnType === 'edit'" @click="handleSubmit('audit')">提交</Button>
              <DropdownMenu slot="list" v-if="requireVerifyBy && step['basis'] && step['commodity']&& step['attribute']">
                <DropdownItem @click.native="handleSubmit('auditForman')">指定侵权审核操作人</DropdownItem>
                <DropdownItem @click.native="handleSubmit('audit')">未指定侵权审核操作人</DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <Button @click="assignUserOpen('transferDialogOpen')" class="ml10" v-if="productSource === 4 && btnType === 'verify'">转交</Button>

            <Button class="ml10" @click="handleSubmit('save')" v-if="btnType === 'add' || btnType === 'edit'">保存</Button>
            <Button class="ml10" v-if="btnType === 'verify'" @click="editType()">编辑</Button>
            <Dropdown trigger="click" :transfer="true" placement="bottom-end" class="ml10">
              <Button @click="cancel()">取消</Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="dropClick(1)">从开发需求list进入</DropdownItem>
                <DropdownItem @click.native="dropClick(2)">从提交审核页面进入</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div class="mainContent" :style="{'overflow-y':'auto'}">
          <Tabs class="tabs-content">
            <TabPane label="基础资料" name="basis">
              <addYunCangBasisInfo
                v-if="!pageLoading"
                ref="addYunCangBasisInfo"
                :is-disabled.sync="isDisabled"
                :basiclData="basiclData"
                :gatherBasic="true"
                :gatherDetail="gatherDetail"
                @backBasicsDetail="backBasicsDetail"
                @basisInfoChange="basisInfoChange"
                v-bind="$attrs"
                v-on="$listeners"
                :product-data="yuncangData.data"
                :productSource="productSource"
              />
            </TabPane>
            <!-- <TabPane label="商品资料" name="commodity">
              <yunCangProductInfo ref="yunCangProductInfo" :is-disabled="isDisabled" v-bind="$attrs" v-on="$listeners" :product-data="productData" :commodityProductid="commodityProductid" @getAttrlist="getAttrlist" :pageActiveTab="pageActiveTab" />
            </TabPane>
            <TabPane label="属性信息" name="attribute" v-if="attributeVisible">
              <yunCangAttributeInfo ref="yunCangAttributeInfo" :product-data.sync="basisForm" :attributeData="attributeData[productId]" :is-visible.sync="attributeVisible" :is-disabled="isDisabled" v-bind="$attrs" :attributeValueIds="attributeValueIds" />
            </TabPane> -->
          </Tabs>
        </div>
        <!-- 指派弹框 -->
        <assign-user ref="assignUser" :productData="productData" @closeDialog="closeDialog" :productSource="productSource"></assign-user>
        <!-- 加载遮罩层 -->
        <Spin v-if="pageLoading || gatherLoading" fix></Spin>
      </div>
    </template>
  </transition>
</template>
<script>
import api from '@/api/api.js';
import addYunCangBasisInfo from './addYunCangBasisInfo';
// import yunCangProductInfo from './yunCangProductInfo';
// import yunCangAttributeInfo from './yunCangAttributeInfo';
import assignUser from '../stockUp/assignUser';
export default {
  name: "addYunCangPopupTab",
  components: { addYunCangBasisInfo, assignUser },
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    // activeTab: {
    //   type: String,
    //   default: 'basis'
    // },
    openType: { //查看还是编辑
      type: String,
      default: 'edit'
    },
    yuncangData: {
      type: Object,
      default () {
        return {
          data: {},
          title: '',
          type: ''
        };
      }
    },
    productSource: {
      type: Number,
      default: null
    },
  },
  data () {
    return {
      isDisabled: false,
      tabVisible: false, //窗口变量
      // pageActiveTab: 'basis', //tab选项
      attributeVisible: false, //是否存在属性
      basisForm: {},//基础信息
      gatherDetail: {},
      basiclData: {},
      pageData: {},
      gatherLoading: false,
      pageLoading: false,
      attributeData: {},//属性信息
      productId: '', //商品分类id
      productData: {}, //基础信息
      step: [], // 选项卡进度
      commodityProductid: '',//商品id
      normalData: {},//用来记录基础信息是否有改动
      btnType: '',//按钮
      verifyToedit: false,
      attributeValueIds: [],
      requireVerifyBy: ''
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        this.tabVisible = val;
        if (val) this.open();
      }
    },
    tabVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:modelVisible', val)
      }
    },
    // 默认打开tab
    // activeTab: {
    //   immediate: true,
    //   handler (val) {
    //     this.tabsClick(val || 'basis')
    //   }
    // },
    btnType: {
      deep: true,
      handler (val) {
        this.isDisabled = val === 'verify';
      }
    },
  },
  computed: {
    // 商品链接
    goodLink () {
      if (this.$common.isEmpty(this.pageData) || this.$common.isEmpty(this.pageData.goodLink)) return '';
      return this.pageData.goodLink;
    },
    // 供应商
    supplier () {
      if (this.$common.isEmpty(this.pageData) || this.$common.isEmpty(this.pageData.supplier)) return '';
      return this.pageData.supplier;
    },
    // 分类 ID
    productCategoryId () {
      if (this.$common.isEmpty(this.pageData) || this.$common.isEmpty(this.pageData.productCategory)) return '';
      return this.pageData.productCategory[this.pageData.productCategory.length - 1];
    },
    // 当前分类对应的尺码
    productCategorySize () {
      if (this.$common.isEmpty(this.pageData) || this.$common.isEmpty(this.pageData.productCategorySize)) return {};
      return this.pageData.productCategorySize;
    },
    // 尺码价格列表
    pricelist () {
      if (this.$common.isEmpty(this.pageData) || this.$common.isEmpty(this.pageData.pricelist)) return [];
      return this.pageData.pricelist;
    },
    // 是否显示采集按钮
    showgatherBtn () {
      return this.pageData.isAlBaba;
      // return !this.$common.isEmpty(this.goodLink) && !this.$common.isEmpty(this.supplier) && this.pageData.isAlBaba;
    }
  },
  methods: {
    // 窗口打开
    open () {
      this.reset();
      let data = this.yuncangData.data;
      this.btnType = this.yuncangData.type;
      this.getVerifyMansetting();
      if (JSON.stringify(data) === '{}') return;

      // console.log("窗口打开", data);
      let obj = ["productId", "goodTypeId", "supplierId", "createdBy"];
      obj.forEach(k => {
        this.productData[k] = data[k] || '';
      })
      this.commodityProductid = data.productId;
      if (this.$common.isEmpty(data.productId)) return;
      this.pageLoading = true;
      this.getBasicsDetail(data.productId).then(res => {
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
    // 上一级详情改变
    backBasicsDetail (data) {
      this.pageData = this.$common.copy(data);
    },
    // 获取到基本信息
    getBasicsDetail (productId) {
      return new Promise((resolve) => {
        this.basiclData = {};
        this.$axios.get(api.queryLaPaProductInfo, { params: { productId: productId } }).then((res) => {
          this.basiclData = res.code === 0 ? res.datas || {} : {};
          this.pageData = this.$common.copy(this.basiclData);
          resolve(this.basiclData);
        }).catch(err => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 获取 1688 采集信息
    gatherInformation () {
      if (this.gatherLoading) return;
      this.gatherLoading = true;
      this.gatherDetail = {};
      if (this.$common.isEmpty(this.goodLink)) {
        this.$Message.error('请选择填入"商品链接"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (this.$common.isEmpty(this.productCategoryId)) {
        this.$Message.error('请选择"商品分类"后再做此操作');
        this.gatherLoading = false;
        return;
      }
      if (!this.$common.isEmpty(this.productCategorySize) && this.$common.isEmpty(this.pricelist)) {
        this.$Message.error('请选中要使用的尺码组中的任一尺码');
        this.gatherLoading = false;
        return;
      }
      this.$axios.post(api.getGrabInformation, {
        goodLink: this.goodLink,
        productCategoryId: this.productCategoryId
      }).then((res) => {
        if (res.code != 0) return;
        this.gatherDetail = this.$common.trim(res.datas);
      }).finally(() => {
        this.gatherLoading = false;
      })
    },
    // 基础资料
    addYunCangBasisInfo (str) {
      if (!this.$refs.addYunCangBasisInfo) {
        return new Promise(resolve => {
          resolve(false);
        })
      }
      return new Promise(resolve => {
        this.$refs.addYunCangBasisInfo.getFormData().then(temp => {
          // 表单验证不通过
          if (!temp) {
            resolve(temp);
            return false;
          }
          // 是否改动过
          if (JSON.stringify(this.normalData) === JSON.stringify(temp) && this.step.basis) {
            resolve(true);
            return false;
          }
          // 详情打开提交审核不需要保存
          if (str === 'audit' && this.btnType === 'verify') {
            resolve(true);
            return false;
          }
          this.handleBasicInfo(temp, resolve);
        })
      })
    },
    // 提交基础资料
    handleBasicInfo (temp, resolve) {
      this.normalData = this.$common.copy(temp);
      temp.laPaProductInfo.productId = this.commodityProductid || '';
      let laPaProductInfo = this.$common.copy(temp.laPaProductInfo);
      laPaProductInfo.createdBy = this.$store.state.erpConfig?.userInfo?.userId;
      this.$axios
        .post(api.saveBase, temp)
        .then(({ code, datas }) => {
          if (code === 0) {
            this.commodityProductid = datas;
            laPaProductInfo.productId = datas;
            this.productData = laPaProductInfo;
            resolve(true);
            this.verifySubmit()
          } else {
            resolve(false);
          }
        })
        .catch(err => {
          resolve(false);
        })
        .finally(() => {
          this.$Modal.remove();
        });
    },
    // 商品资料
    yunCangProductInfo () {
      if (this.$refs.yunCangProductInfo) {
        return this.$refs.yunCangProductInfo.getFormData();
      }
      return Promise.resolve(true);
    },
    // 属性
    yunCangAttributeInfo () {
      if (this.$refs.yunCangAttributeInfo && this.attributeVisible) {
        return this.$refs.yunCangAttributeInfo.getFormData();
      }
      return new Promise(resolve => {
        resolve({
          attributeValueIds: [],
          attributeValueList: []
        })
      })
    },

    handleSubmit (str) {
      if (str == 'save') {
        // console.log('保存直接不验证推出');
        let temp = this.$refs.addYunCangBasisInfo.handleSubmit(2)
        return this.$axios
          .post(api.saveBase, temp)
          .then(this.$Message.success('操作成功~'))
          .finally(() => {
            this.$Spin.hide();
            this.tabVisible = false;
            this.verifyToedit = false;
            this.$emit('fetch');
          });
      }
      this.addYunCangBasisInfo(str);
      // 详情打开提交审核不需要保存
      // if (str === 'audit' && this.btnType === 'verify') {
      //   console.log('走到判断');
      //   this.submitSecond(str);
      //   return false;
      // }

      // let parameter = { ...res[0], attributeValueQOList: res[1]?.attributeValueIds };
      // this.$Spin.show();
      // this.$axios.post(api.saveGoods, parameter).then(({ code }) => {
      //   if (code !== 0) return;
      //   this.submitSecond(str);
      // }).finally(() => {
      //   this.$Spin.hide();
      // });
      // })
    },

    submitSecond (str) {
      // console.log('submitSecond');
      if (str === 'audit') {
        this.verifySubmit();
        //this.assignPic()
        return;
      }
      if (str === 'auditForman') {
        this.verfiyForm();
        return;
      }
      this.closeDialog();
    },
    // 提交侵权审核(现在放在生成sku前面)
    verifySubmit () {
      //给云仓传过去status
      // console.log(this.yuncangData.data.status, 'this.yuncangData.data.status');
      if (!this.yuncangData.data.status) {
        this.productData.status = 0
      } else {
        this.productData.status = this.yuncangData.data.status
      }
      let temp = {
        title: '指定人完善商品',
        status: 4,
        productSource: 3,
        labelAssign: '指定完善商品资料',
        assignMan: true,
      };
      this.$refs['assignUser'].verifyDialogOpen(temp);

    },

    //指定提交图片文本审核人
    assignPic (content, status) {
      this.$refs['assignUser'].nextDialogOpen(
        {
          title: content,
          content: content,
          status: status,
          advinceForSupply: false,
        }
      );
    },

    // 基础资料改变时
    basisInfoChange (data) {
      this.basisForm = this.$common.copy(data);
      this.basisForm.supplierId = this.basisForm.supplier;
      if (this.basisForm.productCategory.length) {
        this.productId = this.basisForm.productCategory.slice(-1)[0];//商品分类ID
        this.basisForm.goodTypeId = this.productId;
        if (this.attributeData[this.productId]) {
          this.attributeVisible = !!this.attributeData[this.productId].attributeClassifyVOList;
        } else {
          this.getAttributeValueList({
            productCategoryId: this.productId
          }).then(res => {
            // 当属性信息返回为空时，隐藏属性信息
            this.attributeVisible = !(!res.attributeClassifyVOList || res.attributeClassifyVOList.length == 0);
            this.attributeData[this.productId] = res;
          })
        }
      } else {
        this.attributeVisible = false;
      }
    },
    // 所属分类下拉
    getAttributeValueList (attr) {
      return new Promise(resolve => {
        this.axios.post(api.query_findAttribute, {
          productCategoryId: attr.productCategoryId
        }).then(res => {
          if (res.code == 0) {
            resolve(res.datas || {});
            return;
          }
          resolve({})
        }).catch(() => {
          resolve({})
        })
      })
    },
    // 取消(关闭)
    cancel () {
      if (this.verifyToedit) return;
      // if (this.commodityProductid) this.$emit('fetch');
      this.tabVisible = false;
    },
    // 重置
    reset () {
      this.attributeVisible = false;
      this.basisForm = {};
      this.attributeData = {};
      this.productId = '';
      //this.pageActiveTab = 'basis';
      this.productData = {};
      this.step = [];
      this.commodityProductid = '';
      this.normalData = {};
      this.btnType = '';
    },
    // 关闭窗口
    closeDialog () {
      this.$emit('fetch');
      if (this.verifyToedit) {
        this.dropClick(2);
        return;
      }
      this.tabVisible = false;
    },
    // 编辑
    editType () {
      this.btnType = 'edit';
      this.verifyToedit = true;
    },
    // 入口
    dropClick (index) {
      if (index === 1) {
        this.tabVisible = false;
      }
      if (index === 2) {
        this.btnType = 'verify';
      }
      this.verifyToedit = false;
    },
    // 获取属性信息
    getAttrlist (list) {
      this.attributeValueIds = list;
    },
    handleVerify (audit) {
      //if (this.requireVerifyBy) return;
      this.handleSubmit(audit);
    },

    // handleVerify () {
    //   this.$refs.addYunCangBasisInfo.getFormData().then(temp => {
    //     console.log(temp);
    //     this.$axios
    //       .post(api.saveBase, temp)
    //       .then((res) => {
    //         this.verfiyForm()

    //       })
    //   })
    // },

    // 获取审核人员配置
    getVerifyMansetting () {
      this.$Spin.show();
      return this.$axios
        .get(api.queryProductDefaulReviewer)
        .then((res) => {
          if (res.code !== 0) return;
          let list = res.datas || [];
          list.forEach(k => {
            if (k.process === 0 && k.flowType === 2) {
              this.requireVerifyBy = k.requireVerifyBy;
            }
          })
        }).finally(() => {
          this.$Spin.hide();
        });
    },
    // 指定侵权审核操作人
    verfiyForm () {
      let temp = {};
      temp.requireVerifyBy = this.requireVerifyBy;
      temp.productId = this.commodityProductid;
      temp.type = 4;
      temp.productSource = 3;
      // console.log(temp)
      // return;
      this.$Spin.show();
      this.$axios
        .post(api.productVerify, temp)
        .then(({ code }) => {
          if (code !== 0) return;
          this.$Message.success('操作成功~');
          this.closeDialog();
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    assignUserOpen () {
      this.$refs['assignUser'].transferDialogOpen();
    }
  }
};
</script>