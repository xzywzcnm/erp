<template>
  <transition name="bounce">
    <template v-if="dialogObj.modelVisible">
      <!-- :mask-closable="false" -->
      <!-- <Drawer title="选款详情" v-model="dialogObj.modelVisible" width="70%" :styles="styles"> -->
      <div class="subLayer">
        <div class="topper">
          <span class="arrowLeft" @click="closeOrder()">
            <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
          </span>
        </div>
        <div class="mainContent fmb10" :style="{'overflow-y':'auto'}">
          <Row style="min-width:1000px;">
            <Col span="12" :gutter="16">
            <option-detail :data="data" :other-data.sync:="otherData"></option-detail>
            </Col>
            <Col span="12">
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="150">
              <!-- <div v-if="[1,4].includes(data.status)">审样核价处理：</div>
        <div v-if="data.status === 2">上架处理：</div>
        <div v-if="data.status === 3">审核记录：</div> -->
              <!-- status===5 为审核不通过 -->
              <!-- <template v-if="data.status > 0">
          <div class="flexCenter fmb0">
            <FormItem label="开发员:">
              <span>{{data.purchaserId || '-'}}</span>
            </FormItem>
            <FormItem label="审核时间:">
              <span>{{data.electionTime?getDataToLocalTime(data.electionTime, 'fulltime'):'-'}}</span>
            </FormItem>
          </div>
          <FormItem label="选款意见:">
            <span>{{data.electionOpinion || '-'}}</span>
          </FormItem>
          <div class="flexCenter fmb0" v-if="data.status > 1">
            <FormItem label="质检员:">
              <span>{{data.inspectorsId || '-'}}</span>
            </FormItem>
            <FormItem label="审核时间:">
              <span>{{data.examineTime?getDataToLocalTime(data.examineTime, 'fulltime'):'-'}}</span>
            </FormItem>
          </div>
          <FormItem label="审样核价意见:" v-if="data.status > 1">
            <span>{{data.examineOpinion ? data.examineOpinion: '-'}}</span>
          </FormItem>
        </template> -->

              <!-- <template v-if="data.status > 1 && data.isExamine ===0">
          <div class="flexCenter fmb0">
            <FormItem label="质检员:">
              <span>{{data.inspectorsId || '-'}}</span>
            </FormItem>
            <FormItem label="审核时间:">
              <span>{{data.examineTime?getDataToLocalTime(data.examineTime, 'fulltime'):'-'}}</span>
            </FormItem>
          </div>
          <FormItem label="审样核价意见:">
            <span>{{data.examineOpinion || '-'}}</span>
          </FormItem>
        </template> -->

              <!-- <template v-if="data.status === 3">
          <div class="flexCenter fmb0">
            <FormItem label="操作员:">
              <span>{{data.spuOperator || '-'}}</span>
            </FormItem>
            <FormItem label="上架时间:">
              <span>{{data.shelfDte?getDataToLocalTime(data.shelfDte, 'fulltime'):'-'}}</span>
            </FormItem>
          </div>
          <FormItem label="SPU:">
            <span>{{data.spu || '-'}}</span>
          </FormItem>
        </template> -->

              <!-- <template v-if="data.status === 1">
          <FormItem label="审样核价意见:">
            <Input v-model="formValidate.examineOpinion" type="textarea" :autosize="{minRows: 5,maxRows: 5}" :maxlength="1000"></Input>
            <div style="text-align:right;">{{formValidate.examineOpinion ? formValidate.examineOpinion.length : 0}}/1000</div>
          </FormItem>
          <FormItem label="审样核价结果:" prop="examineResult" key="examineResult">
            <CheckboxGroup v-model="formValidate.examineResult" @on-change="singleExamine">
              <Checkbox :label="0">审样核价通过</Checkbox>
              <Checkbox :label="1">审样核价不通过</Checkbox>
            </CheckboxGroup>
          </FormItem>
        </template> -->

              <!-- <template v-if="data.status === 2">
          <FormItem label="SPU:" prop="spu" key="spu">
            <Input v-model="formValidate.spu"></Input>
          </FormItem>
        </template> -->

              <!-- 新的新品开发 -->
              <!-- <template v-if="data.status === 0">  prop="electionOpinion"-->
              <div>选款处理：</div>
              <FormItem label="选款结果:" prop="electionResult" key="electionResult">
                <CheckboxGroup v-model="formValidate.electionResult" @on-change="singleGender">
                  <Checkbox :label="0">选款通过</Checkbox>
                  <Checkbox :label="1">选款不通过</Checkbox>
                </CheckboxGroup>
              </FormItem>

              <template v-if="formValidate.electionResult&&formValidate.electionResult[0]===0">
                <FormItem label="设置ERP商品分类:" prop="goodTypeId" key="goodTypeId">
                  <!-- <dyt-select v-model="formValidate.goodTypeId" :disabled="!(data.status===0)">
                    <Option v-for="item in erpCategoryList" :value="item.productCategoryId" :key="item.productCategoryId">
                      {{ item.cnName }}
                    </Option>
                  </dyt-select> -->
                  <Cascader :data="erpCategoryList" v-model="formValidate.goodTypeId" @on-change="productCategoryChange"></Cascader>
                </FormItem>
                <FormItem label="开发流程选择:" prop="productSource" key="productSource">
                  <dyt-select v-model="formValidate.productSource" filterable>
                    <Option v-for="item in developmentProcessList" :value="item.progressId" :key="item.progressId">{{ item.progressName }}</Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="指派选款审款:" prop="examineBy" key="examineBy" v-if="data.status == 0">
                  <dyt-select v-model="formValidate.examineBy" filterable>
                    <Option v-for="item in infringementReviewList" :value="item.userId" :key="item.userId">{{ item.userName }}</Option>
                  </dyt-select>
                </FormItem>
                <!-- <FormItem :label="formValidate.productSource==1?'指派侵权审核':'指派完善商品资料'" prop="requireVerifyBy" key="requireVerifyBy"> -->

                <!-- <FormItem label="指派侵权审核:" prop="requireVerifyBy" key="requireVerifyBy">
                  <dyt-select v-model="formValidate.requireVerifyBy" filterable >
                    <Option v-for="item in infringementReviewList" :value="item.userId" :key="item.userId">{{ item.userName }}</Option>
                  </dyt-select>
                </FormItem> -->
              </template>
              <!-- </template> -->

              <FormItem label="选款意见:" prop="reviewOpinions" style="padding-right:60px">
                <Input v-model="formValidate.reviewOpinions" type="textarea" placeholder="填写后选款意见会同步到新品基础资料及供应商系统..." :autosize="{minRows: 5,maxRows: 5}" :maxlength="1000"></Input>
                <span style="position:absolute;margin-top:90px">{{formValidate.reviewOpinions&&formValidate.reviewOpinions.length}}/1000</span>
              </FormItem>

              <FormItem class="mt30">
                <!-- <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading" v-if="data.status < 2" :disabled="disBtn()">提交</Button> -->
                <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading" :disabled="disBtn()">提交</Button>
                <!-- <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading" v-if="data.status === 2">上架</Button> -->
                <Button @click="closeOrder()" class="ml10">关闭</Button>
              </FormItem>
            </Form>
            </Col>
          </Row>
        </div>

      </div>
      <!-- <div class="demo-drawer-footer">
      <Button style="margin-right: 8px" @click="value3 = false">Cancel</Button>
      <Button type="primary" @click="value3 = false">Submit</Button>
    </div> -->
      <!-- </Drawer> -->

    </template>
  </transition>
</template>

<script>
import api from '@/api/api.js';
import optionDetail from './optionDetail';
import CommonMixin from "@/components/mixin/commonMixin";
// import { formData } from './configFile';
const formValidate = {
  electionResult: [],
  goodTypeId: [],
  requireVerifyBy: '',
  productSource: '',
  reviewOpinions: '',
  examineBy: ''//指派选款审款
};
export default {
  components: { optionDetail },
  mixins: [CommonMixin],
  data () {
    return {
      data: {},
      otherData: {},
      formValidate: formValidate,
      ruleValidate: {
        electionResult: [
          { type: 'array', required: true, message: '请选择选款结果', trigger: 'change' }
        ],
        // isExamine: [
        //   { type: 'number', required: true, message: '请选择审样核价', trigger: 'change' }
        // ],
        // examineResult: [
        //   { type: 'array', required: true, message: '请选择审样核价结果', trigger: 'change' }
        // ],
        // spu: [
        //   { required: true, message: '请输入SPU', trigger: 'blur' }
        // ],
        goodTypeId: [
          { required: true, message: '请设置ERP商品分类', trigger: 'change', type: 'array' }
        ],
        requireVerifyBy: [
          { required: true, message: '请指派侵权审核', trigger: 'change' }
        ],
        examineBy: [
          { required: true, message: '请指派选款审款', trigger: 'change' }
        ],
        productSource: [
          { required: true, message: '请选择开发流程' }
        ],
        reviewOpinions: [
          { required: true, message: '请输入选款意见', trigger: 'blur' }
        ],
      },
      loading: false,
      erpCategoryList: [],
      infringementReviewList: [],
      developmentProcessList: [
        { progressId: 1, progressName: "备货开发" },
        { progressId: 2, progressName: "云仓开发" }
      ],
      value3: false,
      styles: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        paddingBottom: '53px',
        position: 'static'
      },
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          data: {}
        };
      }
    },
    isReview: {
      type: Number,
      default () {
      }
    },
  },
  watch: {
    'dialogObj.modelVisible': {
      handler (newVal) {
        if (newVal) {
          this.open();
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.formValidate = JSON.parse(JSON.stringify(formValidate));
      // 获取详情 
      this.getDetail();
      // 获取指派侵权审核 选款审款
      this.getUserMesReviewList();
    },
    // 关闭窗口
    closeOrder () {
      // eslint-disable-next-line vue/no-mutating-props
      this.dialogObj.modelVisible = false;
      this.data = {};
      this.catagoryId = ''
      this.$refs['formValidate'] && this.$refs['formValidate'].resetFields();
    },
    // 获取详情
    getDetail () {
      this.$Spin.show();
      this.$axios
        .get(api.ectionDetail, { params: { electionId: this.dialogObj.data.electionId } })
        .then(({ code, datas }) => {
          if (code === 0) {
            this.data = datas;
            // this.formValidate = formData[datas.status] ? JSON.parse(JSON.stringify(formData[datas.status])) : {};
            // datas.status = 3
            this.formValidate.electionResult.push(datas.electionResult);
            this.formValidate.requireVerifyBy = datas.requireVerifyBy
            this.formValidate.productSource = datas.productSource
            this.catagoryId = datas.goodTypeId
            // this. goodTypeId = [datas.goodTypeId]
            if (datas.status > 0) {
              this.formValidate.reviewOpinions = datas.reviewOpinions;
              // this.formValidate.electionResult = [1];
            }
            // this.formValidate.requireVerifyBy = datas.requireVerifyBy;
            // 获取商品分类
            this.$nextTick(() => {
              this.getCategoryList();
            })
          }
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let [data, form, temp] = [this.data, this.formValidate, {}];
          temp.electionId = data.electionId;
          // if (data.status === 0) {
          const keys = [
            'electionId', 'suppliernNo', 'supplierName', 'modelNo', 'reviewOpinions', 'goodTypeId',
            'goodDate', 'minimumOrderQuantity', 'pictureUrl', 'isStock', 'purchaser', 'requireVerifyBy', 'productSource', 'supplierId', 'sizeType', 'sizeImageUrl', 'examineBy', 'remark',
          ];
          keys.forEach(key => {
            if (key === 'goodTypeId') {
              temp[key] = form[key][form[key].length - 1];
            } else {
              temp[key] = typeof form[key] == 'undefined' ? data[key] : form[key];
            }
          });
          temp.electionResult = form.electionResult[0];
          // form.electionResult[0] === 0 ? temp.isExamine = form.isExamine : '';
          // console.log("选款", temp);
          // return;
          temp["isReview"] = this.isReview
          //审款时候不通过传2
          if (temp.electionResult == 1 && this.isReview == 1) temp["isReview"] = 2;
          if (!temp.requireVerifyBy) {
            temp["requireVerifyBy"] = this.formValidate.examineBy
          }
          if (temp.examineBy == '') temp["examineBy"] = this.formValidate.requireVerifyBy
          //temp["goodTypeIdArray"] = this.goodTypeIdArray
          this.singleStyle(temp);

          // }
          // if (data.status === 1) {
          //   temp.examineOpinion = form.examineOpinion;
          //   temp.examineResult = form.examineResult[0];
          //   this.singlePrice(temp);
          // }
          // if (data.status === 2) {
          //   temp.spu = form.spu;
          //   this.singleShelve(temp);
          // }
        }
      });
    },
    // 单个选款
    singleStyle (temp) {
      this.loading = true;
      this.$axios
        .post(api.oneEction, temp)
        .then((res) => {
          if (res.code === 0) {
            this.$Message.info('操作成功');
            this.closeOrder();
            this.$emit('fetch');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 单个审样核价
    singlePrice (temp) {
      this.loading = true;
      this.$axios
        .post(api.oneExamine, temp)
        .then((res) => {
          if (res.code === 0) {
            this.$Message.info('操作成功');
            this.closeOrder();
            this.$emit('fetch');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 单个上架
    singleShelve (temp) {
      this.loading = true;
      this.$axios
        .post(api.oneShelve, temp)
        .then((res) => {
          if (res.code === 0) {
            this.$Message.info('操作成功');
            this.closeOrder();
            this.$emit('fetch');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 选款单选框
    singleGender (e) {
      this.formValidate.electionResult = e.splice(e.length - 1, 1);
    },
    // 审样核价单选框
    singleExamine (e) {
      this.formValidate.examineResult = e.splice(e.length - 1, 1);
    },
    // 按钮状态
    disBtn () {
      let data = this.formValidate;
      return !((data.electionResult && data.electionResult.length) || (data.examineResult && data.examineResult.length));
    },
    // 获取商品末级分类列表
    getCategoryList () {
      this.$axios.get(api.productCategoryqueryAll).then(({ code, datas }) => {
        if (code !== 0) return;
        this.erpCategoryList = this.getProductCategoryTree(datas || [], null);
        // this.$nextTick(() => {
        //   this.$set(this.formValidate, 'goodTypeId', this.getErpCatagory(datas|| [],[this.catagoryId]));
        // })
        // this.formValidate.goodTypeId = this.getErpCatagory(datas|| [],[this.catagoryId])
        //this.getErpCatagory(datas|| [],[this.catagoryId])
        this.$nextTick(() => {
          this.getErpCatagory(datas || [], [this.catagoryId])
        })
        console.log(this.formValidate.goodTypeId);
      });
    },
    // 组装商品分类树
    getProductCategoryTree (productCategoryList, parentId) {
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
    //获取erp商品资料
    getErpCatagory (productCategoryList, goodTypeId) {
      // console.log('goodTypeId',goodTypeId);
      // const id = goodTypeId[0];
      // const b = productCategoryList.filter(item => {
      //   return item.value == id;
      // }).map(d => {
      //   return d.parentId;
      // })
      // if(b[0]) {
      //   goodTypeId = [...b, ...goodTypeId]
      //   const list = productCategoryList.filter(item => {
      //     return item.value == b[0];
      //   }).map(d => {
      //     return d.parentId;
      //   })
      //   goodTypeId = [...list, ...goodTypeId];
      //   this.getErpCatagory(productCategoryList, goodTypeId);
      // }
      // return goodTypeId;

      productCategoryList.forEach(item => {
        if (item.value == goodTypeId) {
          this.formValidate.goodTypeId.unshift(item.value)
          if (item.parentId == null) return
          this.getErpCatagory(productCategoryList, item.parentId)
        }
      })
    },
    // 获取指派侵权审核
    getUserMesReviewList () {
      // this.getUserMesCommon().then((result) => {
      //   if (result) {
      //     this.infringementReviewList = Object.values(this.$store.state.userInfoList);
      //   }
      // });
      this.$axios
        .get(api.userList, {
          params: { module: 'pds' }
        }).then(res => {
          this.infringementReviewList = res.datas
        })
    },

    //获取开发流程选择
    // getDevelopList(){
    //   this.getDevelopCommon().then((result) => {
    //     if (result) {
    //       this.developmentProcessList = Object.values(this.$store.state.DevelopList);
    //     }
    //   });
    // },
    productCategoryChange (e) {
      console.log(e);
    }
  }
};
</script>
<style scoped>
.opinionTips {
  display: flex;
  justify-content: space-between;
}
.opinionTips span:first-child {
  color: #ff1010;
}
.mt30 {
  margin-top: 30px;
}
/* .demo-drawer-footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  background: #fff;
} */
</style>