<style scoped>
.setting {
  font-size: 14px;
  line-height: 32px;
  font-weight: 700;
}

.cancel {
  color: red;
  line-height: 32px;
  cursor: pointer;
  margin-left: 20px;
}

.save-edit {
  color: green;
  line-height: 32px;
  cursor: pointer;
  margin-left: 20px;
}

.tableImg {
  margin: 0px auto;
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: block;
  top: 50%;
  transform: translateY(-50%);
}

.description {
  margin-left: 20px;
}
</style>
<style>
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.supplierTabsBar .ivu-tabs-nav-prev, .supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}

.addProductBar .ivu-modal-footer {
  display: none;
}
</style>
<template>
  <div >
    <div class="commonFilter" >
      <div class="card-container" >
        <Form ref="pageParams" :model="pageParams" :label-width="90" >
          <div class="card-content" >
            <div class="platformParamsSelect" >
              <Row >
                <Col :span="24" >
                  <FormItem label="仓库" prop="warehouseId" >
                    <ButtonGroup >
                      <template v-for="(item, index) in warehouseArr" >
                        <template v-if="item.selected" >
                          <Button
                              type="primary" @click="warehouseChange(item, index)" >{{ item.warehouseName }}</Button >
                        </template >
                        <template v-else >
                          <Button @click="warehouseChange(item, index)" >{{ item.warehouseName }}</Button >
                        </template >
                      </template >
                    </ButtonGroup >
                    <!-- <RadioGroup v-model="pageParams.warehouseId" type="button" @on-change="startLoading">
                      <template v-for="(item, index) in warehouseArr">
                        <Radio :label="item.warehouseId"><span>{{item.warehouseName}}</span></Radio>
                      </template>
                    </RadioGroup> -->
                  </FormItem >
                </Col >
              </Row >
            </div >
          </div >
          <div class="card-content normalTop" >
            <div class="platformParamsSelect" >
              <Row >
                <Col :md="6" :lg="5" >
                  <FormItem label="商品标签" prop="tagName" >
                    <dyt-select v-model="pageParams.tagName" filterable clearable >
                    <Option v-for="(item,index) in productLabelArr" :value="item" :key="index" >{{ item }}</Option >
                    </dyt-select >
                  </FormItem >
                </Col >
                <Col :md="6" :lg="5" >
                  <FormItem label="商品分类" prop="categoryId" >
                    <dyt-select v-model="pageParams.categoryId" clearable > <Option
                        v-for="(item,index) in categoryArr"
                        :value="item.productCategoryId"
                        :key="index" >{{ item.cnName }} </Option > </dyt-select >
                  </FormItem >
                </Col >
              </Row >
              <Row class="normalTop20" >
                <Col :md="6" :lg="5" >
                  <Input v-model.trim="pageParams.searchValue" > <dyt-select
                      v-model="pageParams.searchType" slot="prepend" style="width: 90px;" > <Option
                      v-for="(item,index) in searchTypeArr" :value="item.key" :key="index" >{{ item.value }}</Option >
                  </dyt-select > </Input >
                </Col >
                <Col :md="6" :lg="4" >
                  <Button type="primary" @click="search" style="margin-left: 30px" >
                    搜索 </Button >
                </Col >
              </Row >
            </div >
          </div >
        </Form >
      </div >
    </div >
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformParamsSelect" >
            <template v-if="!isEditDays" >
              <Form ref="defaultDelivery" :model="defaultDelivery" :label-width="90" >
                <Row >
                  <Col :span="2" class="setting" >默认交期设置：</Col >
                  <Col :span="3" >
                    <FormItem label="采购天数" prop="purchaseDays" >
                      <InputNumber v-model="defaultDelivery.purchaseDays" disabled ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="3" >
                    <FormItem label="头程天数" prop="headloadDays" >
                      <InputNumber v-model="defaultDelivery.headloadDays" disabled ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="3" >
                    <FormItem label="预警天数" prop="warningDays" >
                      <InputNumber v-model="defaultDelivery.warningDays" disabled ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="4" :offset="1" >
                    <Button type="dashed" @click="editDeliveryFn" >编辑</Button >
                  </Col >
                </Row >
              </Form >
            </template >
            <template v-else-if="isEditDays" >
              <Form ref="editDefaultDelivery" :model="editDefaultDelivery" :label-width="90" >
                <Row >
                  <Col :span="2" class="setting" >默认交期设置：</Col >
                  <Col :span="3" >
                    <FormItem label="采购天数" prop="purchaseDays" >
                      <InputNumber :min="0" :max="9999" v-model="editDefaultDelivery.purchaseDays" ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="3" >
                    <FormItem label="头程天数" prop="headloadDays" >
                      <InputNumber :min="0" :max="9999" v-model="editDefaultDelivery.headloadDays" ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="3" >
                    <FormItem label="预警天数" prop="warningDays" >
                      <InputNumber :min="0" :max="9999" v-model="editDefaultDelivery.warningDays" ></InputNumber >
                    </FormItem >
                  </Col >
                  <Col :span="4" :offset="1" >
                    <Icon type="android-done" class="save-edit" size="20" @click="saveEditFn" ></Icon >
                    <Icon type="ios-undo" class="cancel" size="20" @click="cancelEditFn" ></Icon >
                  </Col >
                </Row >
              </Form >
            </template >
          </div >
        </div >
      </div >
    </div >
    <div class="commonFilter normalTop clear" >
      <div class="fl" >
        <Button type="primary" class="iconbuttons" @click="addProductFn" style="width: 100px;" >
          添加商品 </Button >
        <span class="description" >
          安全交期=采购交期+头程天数（海外仓）+预警天数
        </span >
      </div >
      <div class="fr" >
        <Button
            type="primary"
            class="iconbuttons"
            @click="confirmModify('purchase')"
            :loading="modifyLoading"
            style="width: 100px;"
            :disabled="modifyDisabled" >
          确定修改 </Button >
      </div >
    </div >
    <div class="commonFilter normalTop" >
      <div class="orderTable" >
        <Form ref="purchase" :model="purchase" >
          <keep-alive >
            <Table
                ref="managementTable"
                highlight-row
                :border="false"
                :height="tableHeight"
                :loading="Tableloading"
                :columns="purchaseColumn"
                :data="purchase.purchaseData"
                @on-selection-change="getSelectValue" ></Table >
          </keep-alive >
        </Form >
        <div class="table-page clear" >
          <div class="table-page-right" >
            <keep-alive >
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
                  :page-size-opts="pageArray" ></Page >
            </keep-alive >
          </div >
        </div >
      </div >
    </div >
    <!--添加商品-->
    <div v-if="isShowAddPro" >
      <Modal
          v-model="isShowAddPro"
          :width="1100"
          title="添加商品"
          :styles="{top: '50px'}"
          :mask-closable="false"
          class='addProductModal1 headerBar addProductBar' >
        <addProduct
            :disabledSlt='false'
            :from='true'
            @addProductSuccess='addProductSuccess'
            @addProductCancel='addProductCancel'
            :warehouseId="pageParams.warehouseId"
            :eliminateData='proData' ></addProduct >
      </Modal >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
// import common from '@/assets/common.js';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import addProduct from '@/components/common/addProduct';

export default {
  mixins: [Mixin, tableMixin],
  components: { addProduct: addProduct },
  data () {
    let self = this;
    return {
      pageParamsStatus: false,
      warehouseType: '', // 0:本地仓， 1:海外仓
      tableHeight: self.getTableHeight(420),
      skuTableHeight: self.getTableHeight(360),
      totalPage: 0,
      total: 0,
      curPage: 1,
      modifyLoading: false,
      modifyDisabled: true,
      setLoading: false,
      isShowAddPro: false,
      productLabelArr: [], // 商品标签
      pageParams: {
        categoryId: '',
        email: '',
        tagName: '',
        merchantId: '',
        name: '',
        pageNum: 1,
        pageSize: 10,
        sku: '',
        warehouseId: '',
        searchValue: '',
        searchType: 0
      },
      categoryArr: [],
      searchTypeArr: [
        {
          value: 'SKU编号',
          key: 0
        }, {
          value: '商品名称',
          key: 1
        }
      ],
      isEditDays: false,
      defaultDelivery: {
        purchaseDays: 0,
        headloadDays: 0,
        warningDays: 0
      },
      searchSku: '',
      skuData: [], // SKU表格数据
      proData: [],
      warehouseArr: [],
      skuParams: {
        total: 0,
        pageSize: 10,
        pageNum: 1
      },
      editDefaultDelivery: {},
      selectSkuArr: [], // 已选中表格行数据
      purchase: {
        purchaseData: [] // 主table
      },
      purchaseColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'thumbUrl',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            if (params.row.thumbUrl) {
              return h('Poptip', {
                props: {
                  trigger: 'hover',
                  width: 500,
                  placement: 'right'
                }
              }, [
                h('div', {
                  style: {
                    width: '80px',
                    height: '80px',
                    margin: '5px auto'
                  }
                }, [
                  h('img', {
                    attrs: {
                      src: params.row.thumbUrl
                    },
                    style: {
                      'margin': '0 auto',
                      'position': 'relative',
                      'max-width': '100%',
                      'max-height': '100%',
                      'display': 'block',
                      'top': '50%',
                      '-webkit-transform': 'translateY(-50%)',
                      '-ms-transform': 'translateY(-50%)',
                      'transform': 'translateY(-50%)'
                    }
                  })
                ]), h('div', {
                  slot: 'content'
                }, [
                  h('img', {
                    attrs: {
                      src: params.row.thumbUrl
                    },
                    style: {
                      'max-width': '100%',
                      'max-height': '100%'
                    }
                  })
                ])
              ]);
            } else {
              return h('div', {
                style: {
                  width: '80px',
                  height: '80px',
                  margin: '5px auto'
                }
              }, [
                h('img', {
                  attrs: {
                    src: './static/images/placeholder.jpg'
                  },
                  style: {
                    'margin': '0 auto',
                    'position': 'relative',
                    'max-width': '100%',
                    'max-height': '100%',
                    'display': 'block',
                    'top': '50%',
                    '-webkit-transform': 'translateY(-50%)',
                    '-ms-transform': 'translateY(-50%)',
                    'transform': 'translateY(-50%)'
                  }
                })
              ]);
            }
          }
        }, {
          key: 'skuNo',
          align: 'center',
          title: 'SKU编号'
        }, {
          key: 'name',
          align: 'center',
          title: '商品名称'
        }, {
          key: 'purchaseDays',
          align: 'center',
          title: '采购天数',
          render: (h, params) => {
            return h('FormItem', {
              props: {
                prop: 'purchaseData.' + params.index + '.purchaseDays' /* rules: [
                 { type: 'number', min: 0,max: 9999, message: '请输入正整数', trigger: 'change' }
                 ] */
              },
              style: {
                marginTop: '24px'
              }
            }, [
              h('InputNumber', {
                props: {
                  value: self.purchase.purchaseData[params.index].purchaseDays,
                  min: 0,
                  max: 9999,
                  step: 0.5
                },
                on: {
                  'on-change': (value) => {
                    self.purchase.purchaseData[params.index].purchaseDays = value;
                    self.purchase.purchaseData[params.index].safetyDays = self.purchase.purchaseData[params.index].purchaseDays + self.purchase.purchaseData[params.index].headloadDays + self.purchase.purchaseData[params.index].warningDays;
                  }
                }
              })
            ]);
          }
        }, {
          key: 'headloadDays',
          align: 'center',
          title: '头程天数',
          render: (h, params) => {
            return h('FormItem', {
              props: {
                prop: 'purchaseData.' + params.index + '.headloadDays'
              },
              style: {
                marginTop: '24px'
              }
            }, [
              h('InputNumber', {
                props: {
                  value: self.purchase.purchaseData[params.index].headloadDays,
                  disabled: self.warehouseType == '0',
                  min: 0,
                  max: 9999,
                  step: 0.5
                },
                on: {
                  'on-change': (value) => {
                    self.purchase.purchaseData[params.index].headloadDays = value;
                    self.purchase.purchaseData[params.index].safetyDays = self.purchase.purchaseData[params.index].purchaseDays + self.purchase.purchaseData[params.index].headloadDays + self.purchase.purchaseData[params.index].warningDays;
                  }
                }
              })
            ]);
          }
        }, {
          key: 'warningDays',
          align: 'center',
          title: '预警天数',
          render: (h, params) => {
            return h('FormItem', {
              props: {
                prop: 'purchaseData.' + params.index + '.warningDays',
                rules: [
                  {
                    type: 'number',
                    min: 0,
                    max: 9999,
                    message: '请输入正整数',
                    trigger: 'change'
                  }
                ]
              },
              style: {
                marginTop: '24px'
              }
            }, [
              h('InputNumber', {
                props: {
                  value: self.purchase.purchaseData[params.index].warningDays,
                  min: 0,
                  max: 9999,
                  step: 0.5
                },
                on: {
                  'on-change': (value) => {
                    self.purchase.purchaseData[params.index].warningDays = value;
                    self.purchase.purchaseData[params.index].safetyDays = self.purchase.purchaseData[params.index].purchaseDays + self.purchase.purchaseData[params.index].headloadDays + self.purchase.purchaseData[params.index].warningDays;
                  }
                }
              })
            ]);
          }
        }, {
          key: 'safetyDays',
          align: 'center',
          title: '安全交期',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                value: self.purchase.purchaseData[params.index].safetyDays,
                disabled: true,
                min: 0,
                max: 9999,
                step: 0.5
              },
              on: {
                'on-change': (val) => {
                  self.purchase.purchaseData[params.index].safetyDays = val;
                }
              }
            });
          }
        }
      ],
      skuColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          key: 'pic',
          title: '图片',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                width: '60px',
                height: '60px',
                'margin': '5px auto'
              }
            }, [
              h('img', {
                style: {
                  margin: '0 auto',
                  position: 'relative',
                  'max-width': '100%',
                  'max-height': '100%',
                  display: 'block',
                  top: '50%',
                  '-webkit-transform': 'translateY(-50%)',
                  '-ms-transform': 'translateY(-50%)',
                  'transform': 'translateY(-50%)'
                },
                attrs: {
                  'src': params.row.goodsUrl ? params.row.goodsUrl : self.placeholderSrc
                }
              })
            ]);
          }
        }, {
          key: 'cnName',
          align: 'center',
          title: '商品名称',
          render: (h, params) => {
            return h('div', {
              style: {
                'display': '-webkit-box',
                '-webkit-box-orient': 'vertical',
                '-webkit-line-clamp': 3,
                'overflow': 'hidden'
              }
            }, params.row.cnName);
          }
        }, {
          key: 'sku',
          align: 'center',
          title: 'SKU编号'
        }, {
          key: 'productGoodsSpecifications ',
          align: 'center',
          title: '属性'
        }
      ],
      ruleValidate: {
        transWarehouse: [
          {
            required: true,
            message: '不能为空',
            trigger: 'change'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    },
    'purchase.purchaseData': {
      handler: function (newVal, oldVal) {
        let v = this;
        if (newVal) {
          v.modifyDisabled = false;
        }
      },
      deep: true
    }
  },
  activated () {
    this.reset();
    this.intiBaseDataList();
    this.startLoading();
  },
  methods: {
    startLoading () {
      this.$Loading.start();
      this.getList();
      this.getDeliveryTime();
    },
    getList () { // 獲取分頁
      let v = this;
      v.Tableloading = true;
      v.selectionArr = [];
      v.axios.post(api.deliveryList, v.pageParams).then(res => {
        if (res.data.code === 0) {
          v.purchase.purchaseData = res.data.datas.list;
          v.total = res.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
        }
        v.Tableloading = false;
      });
    },
    getDeliveryTime () {
      let v = this;
      v.axios.get(api.deliveryDefault + '?warehouseId=' + v.pageParams.warehouseId).then(res => {
        if (res.data.code == 0) {
          if (res.data.datas) {
            v.defaultDelivery = res.data.datas;
          } else {
            v.defaultDelivery = {
              purchaseDays: 0,
              headloadDays: 0,
              warningDays: 0
            };
          }
        }
      });
    },
    warehouseChange (item, index) {
      let v = this;
      v.pageParams.warehouseId = item.warehouseId;
      v.warehouseType = item.warehouseType;
      v.warehouseArr.forEach((n, i) => {
        if (index === i) {
          v.warehouseArr[i].selected = true;
        } else {
          v.warehouseArr[i].selected = false;
        }
      });
      v.startLoading();
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    reset () {
      this.$refs['pageParams'].resetFields();
      this.selectionArr = [];
    },
    search () {
      this.pageParams.pageNum = 1;
      if (this.pageParams.searchType == 0) {
        this.pageParams.sku = this.pageParams.searchValue;
        this.pageParams.name = '';
      } else {
        this.pageParams.sku = '';
        this.pageParams.name = this.pageParams.searchValue;
      }
      this.pageParamsStatus = true;
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    editDeliveryFn () {
      this.editDefaultDelivery = this.deepCopy(this.defaultDelivery);
      this.isEditDays = true;
    },
    cancelEditFn () {
      this.isEditDays = false;
    },
    saveEditFn () {
      let v = this;
      let obj = {
        dataCode: '01',
        dataDesc: '安全交期默认设置',
        dataType: 'deliveryTimeDefault',
        purchaseDays: v.editDefaultDelivery.purchaseDays,
        headloadDays: v.editDefaultDelivery.headloadDays,
        warningDays: v.editDefaultDelivery.warningDays,
        warehouseId: v.pageParams.warehouseId
      };
      v.axios.post(api.deliverySet, obj).then(res => {
        if (res.data.code == 0) {
          v.$Message.success('保存成功');
          v.getDeliveryTime();
          v.isEditDays = false;
        }
      });
    },
    addProductFn () {
      let v = this;
      v.isShowAddPro = true;
    },
    addProductCancel () {
      this.isShowAddPro = false;
    },
    addProductSuccess (data) {
      let v = this;
      data.forEach((n, i) => {
        let isExist = false;
        v.purchase.purchaseData.forEach((m, j) => {
          if (n.productGoodsId === m.goodsId) {
            isExist = true;
          }
        });
        if (isExist) {
          this.$Notice.warning({
            title: '',
            desc: n.cnName + ' 已存在，请勿重复添加！'
          });
        } else {
          let arr = [];
          if (n.productGoodsProductGoodsTags) {
            n.productGoodsProductGoodsTags.forEach((l, k) => {
              arr.push(l.tagName);
            });
          }
          v.purchase.purchaseData.push({
            warehouseId: v.pageParams.warehouseId,
            warehouseType: v.warehouseType,
            deliveryTimeId: '',
            goodsId: n.productGoodsId,
            categoryId: n.productCategoryId,
            headloadDays: 0,
            tagName: arr.length > 0 ? arr.join(',') : '',
            name: n.cnName,
            purchaseDays: 0,
            safetyDays: 0,
            skuNo: n.sku,
            thumbUrl: n.goodsUrl,
            warningDays: 0
          });
          v.total++;
        }
      });
      v.isShowAddPro = false;
    },
    confirmModify (name) {
      let v = this;
      if (v.purchase.purchaseData.length == 0) {
        v.$Message.warning('请选择商品！');
        return;
      }
      v.modifyLoading = true;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.axios.post(api.deliverySave, v.purchase.purchaseData).then(res => {
            v.modifyLoading = false;
            if (res.data.code == 0) {
              v.$Message.success('修改成功！');
              v.pageParamsStatus = true;
            }
          });
        }
      });
    },
    intiBaseDataList () {
      let v = this;
      v.axios.get(api.allGoodsCategory).then(res => {
        if (res.data.code == 0) {
          v.categoryArr = res.data.datas;
        }
      });
      v.axios.post(api.warehouse, { pageNum: 1 }).then(res => {
        if (res.data.code == 0) {
          v.warehouseArr = res.data.datas;
          if (v.warehouseArr.length > 0) {
            v.warehouseArr.forEach((n, i) => {
              v.$set(v.warehouseArr[i], 'selected', false);
              if (i === 0) {
                v.warehouseArr[i].selected = true;
                v.pageParams.warehouseId = n.warehouseId;
                v.warehouseType = v.warehouseArr[0].warehouseType;
              }
            });
          }
        }
      });
      v.axios.get(api.label).then(res => {
        if (res.data.code == 0) {
          v.productLabelArr = res.data.datas;
        }
      });
    }
  }
};
</script >
