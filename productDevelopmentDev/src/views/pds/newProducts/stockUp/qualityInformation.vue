<template>
  <div>
    <Form ref="formValidate" :rules="ruleValidate" :model="formValidate">
      <!-- <FormItem label="供应商名称:">
        <span v-for="item in supplyList" :key="item.supplierId">{{
          productData.supplierId === item.supplierId ? item.supplierName : ""
        }}</span>
      </FormItem> -->
      <FormItem label="商品分类:">
        <span>{{ formValidate.productCategory || "-" }}</span>
      </FormItem>
      <div class="update-checkType">
        <Form-item label="质检类型" prop="checkType" style="display: inline-block;">
          <RadioGroup v-model="formValidate.checkType">
            <Radio label="0" :disabled="disabledIf">免检</Radio>
            <Radio label="2" :disabled="disabledIf">全检</Radio>
            <Radio label="1" :disabled="disabledIf">抽检</Radio>
          </RadioGroup>
        </Form-item>
        <Form-item label="质检比例(%)" prop="checkRate" style="display: inline-block;">
          <Input
            style="max-width:400px"
            :disabled="![1, '1'].includes(formValidate.checkType) || disabledIf"
            v-model.trim="formValidate.checkRate"
            placeholder="请输入质检比例"
          />
        </Form-item>
      </div>
      <FormItem label="选择质检模板" prop="qualityTemplateId" :class="{'qualityTemplateIdRequired': qualityTemplateIdRequired}">
        <dyt-select
          v-model="formValidate.qualityTemplateId"
          placeholder="请选择质检模板"
          filterable
          clearable
          style="width:400px"
          :disabled="disabledIf"
        >
          <Option
            v-for="(item, index) in qualityProjectList"
            :value="item.qualityClassificationId"
            :key="index"
            @click.native="selectClickOption"
          >{{ item.qualityClassification }}</Option>
        </dyt-select>
      </FormItem>
    </Form>

    <Table border :columns="tableColumns" :data="tableData"></Table>
    <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
  </div>
</template>

<script>
import api from '@/api/api.js';
export default {
  data () {
    return {
      qualityVisble: true,
      qualityTemplateJson: {},
      isSelectOption: false,
      formValidate: {
        checkType: '0',
        checkRate: '0',
        productCategory: "",
        qualityTemplateId: ''
      },
      qualityProjectList: [],//质检模板列表
      projectIdList: [],//分类下的ID
      tableColumns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      commodityData: [],
      rulesValidate: {
        checkRate: [
          { validator: this.validateCheckRate, trigger: 'change' },
          { validator: this.validateCheckRate, trigger: 'blur' }
        ]
      },
      disabledIf: false,
      spuQualityTemplateId: '' // spu 绑定质检模板 ID
    }
  },
  props: {
    commodityInfoData: {
      type: Object,
      default () {
        return {
          pageStateCode: -1,
          laPaProductGoodsInfo: {}
        };
      },
    },
    supplyList: {
      type: Array,
      default () {
        return [];
      },
    },
    productData: {
      type: Object,
      default () {
        return {};
      },
    },
    operatList: {
      type: Array,
      default () {
        return [];
      },
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ruleValidate () {
      return {
        ...this.rulesValidate,
        qualityTemplateId: [
          { type: 'string', required: this.qualityTemplateIdRequired, message: "质检模板必选", trigger: "blur" },
          { type: 'string', required: this.qualityTemplateIdRequired, message: "质检模板必选", trigger: "change" }
        ]
      }
    },
    qualityTemplateIdRequired () {
      return ![0, '0'].includes(this.formValidate.checkType);
    },
    tableData () {
      return this.qualityTemplateJson[this.formValidate.qualityTemplateId || this.spuQualityTemplateId] || [];
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.tableData)) return 0;
      let priceTotal = 0;
      this.tableData.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  mounted () {
    this.findGoodTypeName()
    // this.getFormData()
    //this.getQualityProjectList()

  },
  watch: {
    commodityInfoData: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val || val.pageStateCode !== 0) return;
        this.getDetail(JSON.parse(JSON.stringify(val)));

      },
    },
    isDisabled: {
      immediate: true,
      deep: true,
      handler (val) {
        this.disabledIf = val;
      },
    },
    // 类型改变时
    'formValidate.checkType': {
      deep: true,
      handler (val) {
        const goodsInfo = this.commodityInfoData.laPaProductGoodsInfo;
        if ([0, '0'].includes(val)) {
          this.$set(this.formValidate, 'checkRate', '0');
          if ((this.$common.isEmpty(goodsInfo) || this.$common.isEmpty(goodsInfo.qualityTemplateId)) && !this.isSelectOption) {
            this.formValidate.qualityTemplateId = '';
          }
          return;
        }
        if ([1, '1'].includes(val)) {
          const rate = Number(this.formValidate.checkRate);
          const lastRate = this.$common.isEmpty(rate) ? '1' : rate > 1 && rate < 100 ? Math.floor(rate).toString() : '1';
          this.$set(this.formValidate, 'checkRate', lastRate);
        } else if ([2, '2'].includes(val)) {
          this.$set(this.formValidate, 'checkRate', '100');
        }
        if ((this.$common.isEmpty(goodsInfo) || this.$common.isEmpty(goodsInfo.qualityTemplateId))) {
          if (!this.$common.isEmpty(this.spuQualityTemplateId) && this.$common.isEmpty(this.formValidate.qualityTemplateId)) {
            this.formValidate.qualityTemplateId = this.spuQualityTemplateId.toString();
          }
        }
      }
    }
  },
  methods: {
    getDetail (val) {
      this.isSelectOption = false;
      let awaitList = [
        () => {
          return this.getAllQuality();
        }
      ];
      this.getAllQuality(awaitList).then((arr) => {
        if (!this.$common.isEmpty(val.laPaProductGoodsInfo) && !this.$common.isEmpty(val.laPaProductGoodsInfo.checkType)) {
          this.$set(this.formValidate, 'checkRate', val.laPaProductGoodsInfo.checkRate);
          this.$nextTick(() => {
            this.$set(this.formValidate, 'checkType', val.laPaProductGoodsInfo.checkType);
          })
        }
        if (this.$common.isEmpty(val.laPaProductGoodsInfo) || this.$common.isEmpty(val.laPaProductGoodsInfo.qualityTemplateId)) return;
        this.formValidate.qualityTemplateId = val.laPaProductGoodsInfo.qualityTemplateId;
      })
    },
    selectClickOption () {
      this.isSelectOption = true;
    },
    // 根据商品分类id找到对应的分类名称(质检分类id)
    findGoodTypeName () {
      let { goodTypeId } = this.productData;
      this.operatList.forEach((k) => {
        if (k.productCategoryId === goodTypeId) {
          this.formValidate.productCategory = k.productCategoryNavigation;
          if (this.$common.isEmpty(k.qualityClassificationId)) {
            this.spuQualityTemplateId = this.getParentClassifyId(k.parentId)
          } else {
            this.spuQualityTemplateId = k.qualityClassificationId;
          }
        }
      });
      if (this.$common.isEmpty(this.spuQualityTemplateId)) {
        this.qualityVisble = false;
        // this.$emit('getQualityVisble', false);
      } else {
        this.qualityVisble = true;
      }
    },
    //如果商品分类没有绑定质检，向父取质检id
    getParentClassifyId (id) {
      let list = this.operatList.find((k) => {
        return k.productCategoryId == id
      })
      if (list === undefined) return null
      if (list.qualityClassificationId === null && list.parentId !== null) return this.getParentClassifyId(list.qualityClassificationId)
      if (list.qualityClassificationId != null) return list.qualityClassificationId
      return null
    },
    // 获取所有质检模板
    getAllQuality () {
      return new Promise((resolve) => {
        this.axios.get(api.getAllQualityTemplate).then((res) => {
          if (res && res.code === 0) {
            this.qualityProjectList = res.datas || [];
            (res.datas || []).forEach(item => {
              this.$set(this.qualityTemplateJson, item.qualityClassificationId, item.qualityProjectVOList);
            })
            resolve(res.datas || []);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    getFormData () {
      return {
        data: {
          qualityInspectionList: this.tableData.map(item => {
            return {
              productId: this.productData.goodTypeId,
              qualityClassificationId: this.formValidate.qualityTemplateId || this.spuQualityTemplateId || '',
              qualityProjectId: item.qualityProjectId,
              qualityProject: item.qualityProject,
              qualityDescription: item.qualityDescription
            }
          }),
          qualityTemplateId : this.formValidate.qualityTemplateId || ''
        },
        updateType: {
          checkType: this.formValidate.checkType,
          checkRate: this.formValidate.checkRate
        }
      }
    },
    // 验证表单
    validate () {
      return new Promise((resolve) => {
        this.$refs["formValidate"].validate((valid) => {
          // if (valid) {
          resolve(valid ? this.getFormData() : false);
          // }
        });
      });
    },
    // 验证质检比例
    validateCheckRate (rule, value, callback) {
      if (![1, '1'].includes(this.formValidate.checkType)) {
        return callback();
      }
      if (this.$common.isEmpty(value, true)) {
        return callback(new Error('请输入质检比例'));
      }
      const re = /^[0-9]+$/;
      if (!re.test(value)) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      const rate = Number(value);
      if (rate < 1 || rate > 99) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      callback();
    }
  }
}
</script>

<style lang="less">
.update-checkType{
  position: relative;
  .ivu-form-item{
    .ivu-form-item-label, .ivu-form-item-content{
      display: inline-block;
    }
  }
}
.qualityTemplateIdRequired{
  .ivu-form-item-label{
    &:before{
      content: '*';
      display: inline-block;
      margin-right: 2px;
      line-height: 1;
      font-family: SimSun;
      // font-size: 14px;
      color: #ed4014;
    }
  }
}
</style>