<template>
    <div>
        <Modal
        title="编辑采购信息"
        v-model="isVisible"
        width="780">
        <Form ref="editPurchaseInfo" :model="formData" :label-width="100"  :rules="editFormRules">
        <FormItem label="SPU">
            <Input style="width:260px" v-model="formData.productSpu" disabled></Input>
        </FormItem>
        <FormItem label="分类">
            <Input style="width:500px" v-model="formData.productCategoryNavigation" disabled></Input>
        </FormItem>
        <FormItem label="供应商" prop="supplierId">
                <dyt-select v-model="formData.supplierId" style="width:500px">
                  <Option v-for="(item,index) in supplierList"  :key="index" :value="item.supplierId">{{ item.supplierName }}</Option>
                </dyt-select>
        </FormItem>
        <FormItem prop="copyProductGoodsQOList" :label-width="0">
             <Table height="450" style="margin-left:35px" ref="editPurchaseInfoTable" :columns="editPurchaseInfoColumn" :data="formData.copyProductGoodsQOList" border></Table>
        </FormItem>
      </Form>
        <div slot="footer">
          <Button @click="saveData" type="primary">保 存</Button>
          <Button @click="closeModal">取 消</Button>
        </div>
      </Modal>
    </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  name: 'editPurchaseInfo',
  mixins: [Mixin],
  props: {
    modalVisible: { type: Boolean, default: false },
    modalData: { type: Object, default: () => {} }
  },
  data () {
    return {
      isVisible: false,
      formData: {
        productSpu: '',
        productCategoryNavigation: '',
        supplierId: '',
        copyProductGoodsQOList: []
      },
      supplierList: [],
      ruleValidate: {},
      editPurchaseInfoColumn: [
        {
          title: "图片",
          key: "image",
          width: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'null', params.row.image);
          }
        },
        {
          title: "属性",
          key: "specificationList",
          width: 120,
          render: (h, params) => {
            const [ attr1, attr2 ] = params.row.specificationList
            return [h('div', {
              style: {
                textAlign: 'center'
              }
            }, `${attr1.name}:${attr1.value}`),
            h('div', {
              style: {
                textAlign: 'center'
              }
            }, `${attr2.name}:${attr2.value}`)]
          }
        },
        {
          minWidth: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '供方货号', type: 'supplierGoodsCode' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'supplierGoodsCode' });
          }
        },
        {
          minWidth: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '采购链接', type: 'supplierPurchaseLink' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'supplierPurchaseLink' });
          }
        },
        {
          minWidth: 150,
          renderHeader: (h) => {
            return this.tableHead(h, { title: '价格', type: 'priceDetails' });
          },
          render: (h, params) => {
            return this.tableRender(h, params, { type: 'priceDetails' }, true);
          }
        },
      ],
      disabledIf: false,
      supplierIndex: null,
      attr1NameArr: [],
      attr2NameArr: [],
      editFormRules: {
        supplierId: [
          { required: true, message: "请选择供应商", trigger: "blur" },
        ]
      },
      priceDetails: [
        { required: true, message: "请输入价格", trigger: "change", type: 'number' },
        { required: true, message: "请输入价格", trigger: "blur", type: 'number' }
      ],
      modalData1: {},
      tableValue: {
        supplierGoodsCode: false,
        supplierPurchaseLink: false,
        priceDetails: false
      }
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.isVisible = val;
      }
    },
    isVisible: {
      handler (val) {
        this.$emit('update:modalVisible', val);
      }
    },
    modalData: {
      handler (val) {
        this.attr1NameArr = val.copyProductGoodsQOList.map(item => item.specificationList[0].name)
        this.attr2NameArr = val.copyProductGoodsQOList.map(item => item.specificationList[1].name)
        this.modalData1 = JSON.parse(JSON.stringify(val))
        this.formData = JSON.parse(JSON.stringify(val))
      }
    },
  },
  created() {
    this.getSupplierList()
  },
  methods: {
    // 获取供应商
    getSupplierList() {
      this.axios.get(api.queryAllSupplierInfo).then((res) => {
        this.supplierList = res.data.datas;
      });
    },
    // 表头相同勾选
    tableHead(h, data) {
      return h("div", {
        style: {
          display: "flex",
          flexAligns: "center",
        },
      },
      [
        h("span", data.title),
        h("Checkbox", {
          props: {
            disabled: !this.formData.copyProductGoodsQOList.length || this.disabledIf,
            value: this.tableValue[data.type]
          },
          style: { marginLeft: "45px" },
          on: {
            "on-change": (event) => {
              this.$set(this.tableValue, data.type, event);
              if (this.$common.isArray(data.type)) {
                data.type.forEach(key => {
                  this.sameChange(event, key);
                })
                return;
              }
              this.sameChange(event, data.type);
            },
          },
        }, "相同"),
      ]);
    },
    // 表格内容渲染
    tableRender(h, params, data, transNumber = false) {
      let { type } = data; // type 类型
      let { index, row } = params;
      let refsName = 'ref' + index + type;
      return h('FormItem', {
        props: {
          prop: `copyProductGoodsQOList.${index}.${type}`,
          labelWidth: 0,
          rules: this[type],
        },
        style: {
          position: 'relative'
        },
      }, [
        h(`${type === 'priceDetails' ? 'InputNumber' : 'Input'}`, {
          style: {
            width: '100%',
          },
          class: `table-input ${refsName} numberBtn`,
          props: {
            placeholder: '请输入',
            disabled: this.disabledIf,
            value: row[type],
            min: type === 'priceDetails' ? 0 : ''
          },
          on: {
            input: (val) => {
              if (!transNumber) {
                this.$set(this.formData.copyProductGoodsQOList[index], type, val);
                return;
              }
              const nVal = this.$common.isEmpty(val) ? null : this.$common.isEmpty(Number(val)) ? val : Number(val);
              this.$set(this.formData.copyProductGoodsQOList[index], type, nVal);
            },
            'on-focus': (val) => {
              this.supplierNoIndex(index, type);
            },
            'on-blur': (val) => {
              this.suppllierBlur(index, type);
            },
          }
        }),
        h('div', {
          style: {
            position: 'absolute',
            top: '50%',
            right: '0px',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            width: '32px',
            textAlign: 'center',
            display: row['show' + type] ? 'block' : 'none',
          },
          on: {
            'mousedown': (e) => { // 鼠标按住不放，设置drop值为true 不让图标消失
              this.$set(this.formData.copyProductGoodsQOList[index], 'drop' + type, true);
            },
            'mouseup': (e) => { // 鼠标弹起不放，设置drop值为true 不让图标消失
              this.$set(this.formData.copyProductGoodsQOList[index], 'drop' + type, true);
            },
          }
        }, [
          h('Dropdown', {
            props: {
              transfer: true,
              trigger: 'click',
            },
            on: {
              'on-visible-change': (val) => {
                this.supplierNoChange(val, type);
              },
              'on-click': (val) => {
                this.supplierNoClick(val, type);
              },
            }
          }, [
            h('a', {
              props: {
                href: 'javascript:void(0)',
              },
            }, [
              h('Icon', {
                props: {
                  type: 'md-funnel'
                }
              })
            ]),
            h('DropdownMenu', {
              slot: 'list',
            }, [
              h('DropdownItem', {
                props: {
                  name: 'all-' + index
                },
              }, '应用到所有'),
              h('DropdownItem', {
                props: {
                  name: `${this.attr1NameArr[index]}-` + index
                },
              }, [
                h('span', '应用到'),
                h('span', {
                  style: {
                    color: '#2d8cf0',
                    marginLeft: '4px'
                  }
                }, `${this.attr1NameArr[index]}`)
              ]),
              h('DropdownItem', {
                props: {
                  name: `${this.attr2NameArr[index]}-` + index
                },
              }, [
                h('span', '应用到'),
                h('span', {
                  style: {
                    color: '#2d8cf0',
                    marginLeft: '4px'
                  }
                }, `${this.attr2NameArr[index]}`)
              ]),
            ]),
          ])
        ])
      ])
    },
    // 勾选相同
    sameChange(e, type) {
      const val = this.formData.copyProductGoodsQOList[0][type];
      if (!(e && val)) return;
      this.formData.copyProductGoodsQOList.forEach((k, i) => {
        this.formData.copyProductGoodsQOList[i][type] = val;
      });
    },
    // 供方货号聚焦
    supplierNoIndex(index, type) {
      this.formData.copyProductGoodsQOList.forEach((item, attrIndex) => {
        this.$set(this.formData.copyProductGoodsQOList[attrIndex], 'drop' + type, false);
        this.$set(this.formData.copyProductGoodsQOList[attrIndex], 'show' + type, attrIndex === index);
      })
      this.supplierIndex = index;
    },
    // 供方货号失焦
    suppllierBlur(index, type) {
      if (this.formData.copyProductGoodsQOList[index]['drop' + type]) return;
      this.$set(this.formData.copyProductGoodsQOList[index], 'show' + type, false);
    },
    // 供方货号打开/关闭
    supplierNoChange(val, type) {
      let supplierIndex = this.supplierIndex;
      this.$set(this.formData.copyProductGoodsQOList[supplierIndex], 'show' + type, !!val);
      this.$set(this.formData.copyProductGoodsQOList[supplierIndex], 'drop' + type, !!val);
      // 供方货号关闭，聚焦放回输入框
      if (val) return;
      let refsName = 'ref' + supplierIndex + type;
      let dom = document.querySelector('.' + refsName);
      if (!dom) return;
      dom.querySelector('input').focus();
      // 重新聚焦
      this.supplierNoIndex(supplierIndex, type)
    },
    // 供方货号选择(1:应用到所有；2：应用到color)
    supplierNoClick(e, type) {
      if (!e) return;
      let arr = e.split('-');
      const [status, index, copyProductGoodsQOList] = [arr[0], arr[1], this.formData.copyProductGoodsQOList];
      let data = copyProductGoodsQOList[index] || {};
      copyProductGoodsQOList.forEach((item, index) => {
        let attr1Name = this.attr1NameArr[index]
        let attr2Name = this.attr2NameArr[index]
        let judgeStag = {
          'all': true, // 所有
          [attr1Name]: data.specificationList[0].value === item.specificationList[0].value, // 属性1
          [attr2Name]: data.specificationList[1].value === item.specificationList[1].value, // 属性2
        }
        if (judgeStag[status]) this.$set(this.formData.copyProductGoodsQOList[index], type, data[type]);
      })
    },
    saveData() {
      this.$refs.editPurchaseInfo.validate((valid) => {
        if (!valid) return this.$Message.error('请输入价格及选择供应商');
        const resultArr = this.formData.copyProductGoodsQOList.map(item => {
          return {
            productCategoryId: item.productCategoryId,
            productGoodsId: item.productGoodsId,
            supplierGoodsCode: item.supplierGoodsCode,
            supplierPurchaseLink: item.supplierPurchaseLink,
            priceDetails: item.priceDetails,
            supplierId: this.formData.supplierId
          }
        })
        let hasPriceZero = false
        resultArr.forEach(item => {
          if (item.priceDetails === 0) {
            hasPriceZero = true
          }
        })
        if (hasPriceZero === true) return this.$Message.error('价格不可为0')
        this.$emit('getEditPurchaseInfo', { resultArr: resultArr, curData: this.formData })
        this.isVisible = false
        this.tableValue = {
          supplierGoodsCode: false,
          supplierPurchaseLink: false,
          priceDetails: false
        }
      })
    },
    closeModal() {
      this.isVisible = false
      this.tableValue = {
        supplierGoodsCode: false,
        supplierPurchaseLink: false,
        priceDetails: false
      }
      this.formData = this.modalData1
    }
  },
}
</script>
<style lang="less">
  .numberBtn {
    .ivu-input-number-handler-wrap {
      display: none;
    }
  }
</style>
