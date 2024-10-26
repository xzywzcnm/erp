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
      <FormItem label="选择质检模板" prop="qualityTemplateId">
        <dyt-select v-model="formValidate.qualityTemplateId" placeholder="请选择质检模板" filterable clearable style="width:400px" :disabled="disabledIf">
          <Option v-for="(item, index) in qualityProjectList" :value="item.qualityClassificationId" :key="index">{{ item.qualityClassification }}</Option>
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
      formValidate: {
        productCategory: "",
        qualityTemplateId: ''
      },
      qualityTemplateJson: {},
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
      ruleValidate: {
        qualityTemplateId: [
          { type: 'string', required: true, message: "质检模板必选", trigger: "blur" },
          { type: 'string', required: true, message: "质检模板必选", trigger: "change" }
        ]
      },
      disabledIf: false,
      qualityClassificationId: ''//分类id
    }
  },
  props: {
    commodityInfoData: {
      type: Object,
      default () {
        return {
          pageStateCode: -1,
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
    tableData () {
      return this.qualityTemplateJson[this.formValidate.qualityTemplateId] || [];
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
    this.findGoodTypeName();
    // this.getFormData()
    // this.getQualityProjectList()
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
  },
  methods: {
    getDetail (val) {
      let awaitList = [
        () => {
          return this.getAllQuality();
        }
      ];
      this.getAllQuality(awaitList).then((arr) => {
        if (val.laPaProductQualityInspectionList.length !== 0) {
          this.qualityClassificationId = val.laPaProductQualityInspectionList[0].qualityClassificationId;
        }
        if (this.$common.isEmpty(val.laPaProductGoodsInfo) || this.$common.isEmpty(val.laPaProductGoodsInfo.qualityTemplateId)){
          if (!this.$common.isEmpty(this.qualityClassificationId)) {
            this.formValidate.qualityTemplateId = (this.qualityClassificationId).toString();
          }
          return;
        }
        this.formValidate.qualityTemplateId = val.laPaProductGoodsInfo.qualityTemplateId;
      })
    },

    // 根据商品分类id找到对应的分类名称(质检分类id)
    findGoodTypeName () {
      let { goodTypeId } = this.productData;
      this.operatList.forEach((k) => {
        if (k.productCategoryId === goodTypeId) {
          this.formValidate.productCategory = k.productCategoryNavigation;
          this.qualityClassificationId = k.qualityClassificationId
        }
      });
      if (this.qualityClassificationId == null) this.$emit('getQualityVisble', false);
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
        qualityInspectionList: this.tableData.map(item => {
          return {
            productId: this.productData.goodTypeId,
            qualityClassificationId: this.formValidate.qualityTemplateId || '',
            qualityProjectId: item.qualityProjectId,
            qualityProject: item.qualityProject,
            qualityDescription: item.qualityDescription
          }
        }),
        qualityTemplateId : this.formValidate.qualityTemplateId || ''
      }
    },
    // 验证表单
    validate () {
      return new Promise((resolve) => {
        this.$refs["formValidate"].validate((valid) => {
          if (valid) {
            resolve(valid ? this.getFormData() : false);
          }
        });
      });
    },

  }
}
</script>

<style>
</style>