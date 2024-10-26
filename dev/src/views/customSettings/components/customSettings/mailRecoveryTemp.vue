<template>
  <div>
    <div class="tabContainer commonFilter">
      <div style="padding:10px;">
        <div class="mt10 main-page">
          <div class="page-left-side">
            <Card :bordered="true" :style="{height:curHeight + 'px',marginBottom: '20px'}" v="curHeight">
              <p slot="title">
                模板分类
                <Button
                  icon="md-close"
                  type="text"
                  title="删除模板分类"
                  size="small"
                  style="float:right;margin-right:10px;cursor:pointer;font-size: 16px;"
                  v-if="getPermission('messageTemplateCategory_delete')"
                  :disabled="chioseTemp.categoryType != 0"
                  @click="deleteTempType"
                />
                <Button
                  icon="md-add"
                  type="text"
                  title="增加模板分类"
                  size="small"
                  style="float:right;margin-right:10px;cursor:pointer;font-size: 16px;"
                  v-if="getPermission('messageTemplateCategory_create')"
                  @click="addTemp"
                />
                <Button
                  icon="md-create"
                  type="text"
                  title="编辑模板分类"
                  size="small"
                  style="float:right;margin-right:10px;cursor:pointer;font-size: 16px;"
                  v-if="getPermission('messageTemplateCategory_updateCategoryName')"
                  :disabled="chioseTemp.categoryType != 0"
                  @click="editTemp"
                />
              </p>
              <div class="provider">
                <Table
                  highlight-row
                  :border="false"
                  :show-header="false"
                  :stripe="false"
                  :columns="categoryColumns"
                  :data="categoryData"
                  size="small"
                  :height="enableTableHeight"
                  @on-row-click="getTableList"
                />
              </div>
            </Card>
          </div>
          <div class="page-right-side">
            <div class="search-body">
              <Form ref="searchFilterRef" :model="pageParams" :label-width="70">
                <dyt-filter :handleTable="true" tableClassName=".list-data-table">
                  <Form-item label="模板名称" prop="templateName">
                    <Input v-model.trim="pageParams.templateName" placeholder="请输入模板名称" />
                  </Form-item>
                  <Form-item label="创建人" prop="createdByList">
                    <dyt-select v-model="pageParams.createdByList" :max-tag-count="1" :multiple="true" placeholder="请选创建人">
                    <Option v-for="(item, index) in allUserData" :key="`user-${index}`" :value="item.userId" :label="item.userName" />
                  </dyt-select>
                  </Form-item>
                  <div slot="operation">
                    <Button type="primary" :disabled="SearchDisabled" icon="ios-search" @click="search">查询</Button>
                    <Button class="ml10" @click="resetForm" icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
            <div class="table-operation">
              <div>
                <Button icon="md-add" type="primary" @click="addTemplet(0)" v-if="getPermission('messageTemplate_create')">新增</Button>
                <Button class="ml10" type="error" @click="delTableRow({})" v-if="getPermission('messageTemplate_batchDelete')">删除</Button>
              </div>
              <div>
                <!-- 排序 -->
                <span>排序方式：</span>
                <Button-group>
                  <template v-for="(item, index) in buttonGroupModel">
                    <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
                      {{ item.title }}
                      <Icon type="md-arrow-round-up" v-if="item.status && item.selected" />
                      <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" />
                    </Button>
                    <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index,item.status)" :key="index">
                      {{ item.title }}
                      <Icon type="md-arrow-round-up" v-if="item.status && item.selected" />
                      <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" />
                    </Button>
                  </template>
                </Button-group>
              </div>
            </div>
            <div class="mt10 list-data-table">
              <Table
                highlight-row
                border
                :height="enableTableHeight"
                :loading="tableLoading"
                :columns="tempColumn"
                :data="tempData"
                @on-selection-change="getSelectValue"
              />
              <div class="table-page flexBox">
                <Page
                  :total="total"
                  @on-change="changePage"
                  show-total
                  :disabled="tableLoading"
                  :page-size="pageParams.pageSize"
                  show-elevator
                  :current="curPage"
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 新增，编辑模板分类 -->
    <Modal
      v-model="reviseTempModal"
      :title="reviseTit"
      v-if="reviseTempModalStatus"
      @on-ok="reviseTempOK"
      @on-cancel="reviseTempCancel"
      :mask-closable="false"
    >
      <div style="margin: 20px;font-size: 14px;">
         <div class="form-item-row">
          <div class="item-row-label">分类名称：</div>
          <dytInput class="item-row-content" v-model="tempName" :maxlength="30" placeholder="请输入分类名称" />
         </div>
      </div>
    </Modal>
    <!-- 新增，编辑模板 -->
    <Modal
      width="700"
      v-model="templetModal"
      :title="templetModalTit"
      @on-visible-change="visibleChange1"
      :mask-closable="false"
    >
      <div style="margin: 10px;" class="templet-modal-edit">
        <Spin fix v-if="templetInfoLoading"></Spin>
        <Form
          ref="templetModalFormRef"
          :rules="ruleValidate"
          :model="templetModalParams"
          :label-width="85"
          label-position="right"
        >
          <div class="platformParamsSelectRt">
            <Form-item label="模板名称：" prop="messageTemplateName">
              <dytInput v-model.trim="templetModalParams.messageTemplateName" placeholder="请输入模板名称" />
            </Form-item >
            <Form-item label="模板分类：" prop="templateCategoryId">
              <dyt-select v-model="templetModalParams.templateCategoryId" placeholder="请选择模板分类">
                <Option
                  v-for="(item,index) in templetCategoryList"
                  :key="index"
                  :value="item.templateCategoryId"
                >{{ item.categoryName }}</Option>
              </dyt-select >
            </Form-item >
            <Form-item label="备注：" prop="remark" >
              <dytInput v-model.trim="templetModalParams.remark" placeholder="请输入备注" />
            </Form-item>
            <!-- <Form-item label="数据字段：" prop="dataField" >
              <dyt-select style="width:300px;" filterable v-model="dataFieldListValue">
                <Option
                  v-for="(item,index) in dataFieldList"
                  :key="index"
                  @click.native="addMessageContent(item.value)"
                  :value="item.value"
                >{{ item.title }}</Option>
              </dyt-select>
            </Form-item> -->
            <Form-item label="内容：" prop="messageContent" class="item-content-line">
              <div style="flex:100;">
                <dytInput
                  type="textarea"
                  :autosize="{minRows: 6,maxRows: 8}"
                  ref="messageContent"
                  @on-blur="messageBlur"
                  v-model.trim="templetModalParams.messageContent"
                  placeholder="请输入内容"
                  @on-change="msgContentChange"
                />
                <dytInput type="textarea" v-show="false" v-model.trim="text" />
              </div>
              <Button class="item-content-btn" type="text" size="small" :disabled="transtionLoading" @click="translationText">译</Button>
            </Form-item>
            <Form-item label=" ">
              <div style="line-height: 1.4em;white-space: pre-wrap;">{{ messageContentTranslation }}</div>
            </Form-item>
            <!-- <Form-item label="适用范围：" prop="applyScope">
              <CheckboxGroup @on-change="scopeChange" v-model="scopeValue">
                <div>
                  <Checkbox label="002" :disabled="applyScopeStatus" >适用于部分商品分类
                  </Checkbox >
                  <a @click="model6 = true" v-if="scopeValue.indexOf('002') > -1 ">
                    {{ CheckedData.length > 0 ? showText : '指定商品分类' }}
                  </a>
                </div>
                <div>
                  <Checkbox label="003" :disabled="applyScopeStatus" >适用于部分商品品牌</Checkbox>
                  <a @click="model7 = true" v-if="scopeValue.indexOf('003') > -1">
                    {{ productBrandIds.length > 0 ? showText1 : '指定商品品牌'}}
                  </a>
                </div>
                <div>
                  <Checkbox label="004" :disabled="applyScopeStatus">适用于部分商品</Checkbox>
                  <a v-if="scopeValue.indexOf('004') > -1" @click="openProductFn" >
                    {{ addProductValue.length > 0 ? showText2 : '指定商品' }}
                  </a>
                </div>
              </CheckboxGroup>
              <Checkbox v-model="scopeAllValue" @on-change="scopeAllChange" :disabled="applyScopeAllStatus" >适用于全部商品</Checkbox>
            </Form-item> -->
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="templetModalOK" :loading="templetInfoLoading" type="primary">确定</Button>
        <Button @click="templetModalCancel">取消</Button>
      </div>
    </Modal>
    <Modal v-model="model6" @on-visible-change="visibleChange" title="商品分类" @on-ok="getCheckedNodes" :mask-closable="false">
      <div style="height: 556px;overflow-y: auto">
        <div
          style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
          v-if="categoryTree.length != 0"
          @click="exchangeTree"
        >
          {{ showTree ? '全部收起' : '全部展开' }}
        </div>
        <Tree ref="category" :data="categoryTree" multiple @on-toggle-expand="changeExpand" show-checkbox ></Tree>
      </div>
    </Modal>
    <Modal v-model="model7" height="500" title="商品品牌" :mask-closable="false">
      <div style="height: 500px;overflow-y: auto">
        <dyt-select v-model="productBrandIds" filterable multiple>
          <Option
            v-for="(item,index) in productBrandList"
            :key="index"
            :value="item.productBrandId"
          >{{ item.name }}</Option>
        </dyt-select>
      </div>
    </Modal>
    <matchingGoodsModal
      ref="matchingGoodsModal"
      :showNumber="false"
      :prefix="'/setting-service'"
      :choseData="addProductValue"
      @saveHandel="addProductSave"
    />
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';
import dataField from '@/utils/dataField';

export default {
  mixins: [Mixin],
  components: {
    matchingGoodsModal
  },
  data () {
    return {
      showTree: true,
      text: '',
      messageContentTranslation: '',
      // dataFieldListValue: '',
      orderInfo: {},
      typeStatus: 1, // 表示执行人工匹配功能
      inPage: '',
      shelvesData: [],
      qualityData: [],
      // wareId: localStorage.getItem('warehouseId'),
      wareId: sessionStorage.getItem('warehouseId'),
      productBrandList: [], // 商品品牌列表
      productBrandIds: [], // 品牌值
      scopeAllValue: false,
      scopeValue: [],
      model6: false,
      model7: false,
      addProductValue: [],
      productCategoryTree: [ // 商品分类树
        {
          title: '全部',
          expand: true,
          children: []
        }
      ],
      platformId: 'ebay', // 暂时写死，后面需要改
      tempStatus: false,
      enableTableHeight: 0,
      addStatus: false, // true 新增模板
      categoryColumns: [
        {
          title: '',
          align: 'center',
          key: 'categoryName'
        }
      ],
      categoryData: [],
      reviseTempModal: false, // 新增，编辑模板分类
      reviseTempModalStatus: false,
      reviseTit: '',
      chioseTemp: null, // 选中数据
      tempName: null, // 分类名称
      reviseStatus: null, // add 新增  edit 编辑
      buttonGroupModel: [
        {
          type: 'createdTime',
          selected: true,
          status: false, // true up false down
          title: '创建时间'
        },
        {
          type: 'updatedTime',
          selected: false,
          status: false, // true up false down
          title: '更新时间'
        },
      ],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        searchValue: null,
        templateName: '', // 模板名称
        createdByList: [], // 创建人
        orderBy: 'createdTime',
        platformId: null,
        templateCategoryId: null,
        upDown: 'down',
        pageNum: 1,
        pageSize: 20,
      },
      tempColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '模板名称',
          minWidth: 150,
          key: 'messageTemplateName',
          align: 'center'
        },
        {
          title: '模板类型',
          minWidth: 150,
          key: 'categoryName',
          align: 'center'
        },
        {
          title: '备注',
          minWidth: 150,
          key: 'remark',
          align: 'center'
        },
        {
          title: '创建信息',
          minWidth: 150,
          key: 'createdTime',
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            let createdName = '';
            if (!this.$common.isEmpty(row.createdBy)) {
              createdName = this.allUserList[row.createdBy];
              item.push(h('div', {}, this.$common.isEmpty(createdName) ? row.createdBy : createdName.userName || ''));
            }
            if (!this.$common.isEmpty(row.createdTime)) {
              item.push(h('div', {}, this.$common.toLocaleDate(row.createdTime, 'fulltime')));
            }
            return h('div', {
              style: {
                'display': 'inline-block',
                'text-align': 'left',
                'margin': '0 auto',
              }
            }, item);
          }
        },
        {
          title: '最后更新信息',
          minWidth: 150,
          key: 'updatedTime',
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            let updatedName = '';
            if (!this.$common.isEmpty(row.updatedBy)) {
              updatedName = this.allUserList[row.updatedBy];
              item.push(h('div', {}, this.$common.isEmpty(updatedName) ? row.updatedBy : updatedName.userName || ''));
            }
            if (!this.$common.isEmpty(row.updatedTime)) {
              item.push(h('div', {}, this.$common.toLocaleDate(row.updatedTime, 'fulltime')));
            }
            return h('div', {
              style: {
                'display': 'inline-block',
                'text-align': 'left',
                'margin': '0 auto',
              }
            }, item);
          }
        },
        {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 150,
          render: (h, params) => {
            let oItem = [];
            if (this.getPermission('messageTemplate_update')) {
              oItem.push(h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.addTemplet(1, params.row.messageTemplateId);
                  }
                }
              }, '编辑'));
            }
            if (this.getPermission('messageTemplate_delete')) {
              oItem.push(h('Button', {
                class: 'ml5',
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.delTableRow(params.row);
                  }
                }
              }, '删除'));
            }
            return h('div', {}, oItem);
          }
        }
      ],
      tempData: [], // 模板数据
      templateIdList: [], // 批量删除模板id
      templetModal: false, // 新增，编辑模板模态
      templetModalTit: null,
      templetInfoLoading: false,
      transtionLoading: false,
      templetModalParams: {
        messageTemplateName: '',
        templateCategoryId: '',
        remark: '',
        messageContent: ''
      },
      categoryTree: [ // 分类树
        {
          title: '全部分类',
          expand: true,
          productCategoryId: -1,
          children: []
        }
      ],
      templetCategoryList: [], // 模板分类下拉
      dataFieldList: dataField, // 数据字段
      applyScopeStatus: false,
      applyScopeAllStatus: false,
      templeStatus: null, // add 新增 edit 编辑
      nameToObject: {},
      ruleValidate: { // 校验
        messageTemplateName: [
          { required: true, validator: this.formMaxVerify, maxLength: 20, msg: '请输入模板名称', trigger: 'blur' },
          { required: true, validator: this.formMaxVerify, maxLength: 20, msg: '请输入模板名称', trigger: 'change' }
        ],
        templateCategoryId: [
          { required: true, validator: this.$common.formItemVerify, msg: '请选择模板分类', trigger: 'change' },
        ],
        remark: [
          { validator: this.formMaxVerify, maxLength: 50, msg: '请输入备注', trigger: 'blur' },
          { validator: this.formMaxVerify, maxLength: 50, msg: '请输入备注', trigger: 'change' }
        ],
        messageContent: [
          { required: true, validator: this.formMaxVerify, msg: '请输入内容', trigger: 'blur' },
          { required: true, validator: this.formMaxVerify, msg: '请输入内容', trigger: 'change' },
        ]
      },
      CheckedData: [],
      selectionStart: null
    };
  },
  watch: {
    curHeight (n, o) {
      if (n !== o) {
        this.getEnableHeight();
      }
    },
    show (n, o) {
      if (n !== o) {
        this.getEnableHeight();
      }
    },
    tempStatus (n, o) {
      if (n !== o) {
        this.getCategoryTemp();
      }
    },
    pageParamsStatus (n, o) {
      if (n) {
        this.getTemplet();
        this.pageParamsStatus = false;
      }
    }
  },
  computed: {
    allUserList () {
      return this.$store.state.userInfoList || {};
    },
    allUserData () {
      return Object.values(this.allUserList || {});
    },
    showText () {
      let str = this.CheckedData.reduce((a, b) => {
        return a + b.productCategoryNavigation + '';
      }, '');
      if (str.length > 16) {
        return str.slice(0, 16) + '等';
      } else {
        return str;
      }
    },
    showText1 () {
      let str = this.productBrandList.filter((i) => {
        if (this.productBrandIds.indexOf(i.productBrandId) > -1) {
          return i;
        }
      }).map(i => {
        return i.name;
      }).join('');
      if (str.length > 16) {
        return str.slice(0, 16) + '等';
      } else {
        return str;
      }
    },
    showText2 () {
      let str = this.addProductValue.reduce((a, b) => {
        return a + b.sku;
      }, '');
      if (str.length > 16) {
        return str.slice(0, 16) + '等';
      } else {
        return str;
      }
    },
    curHeight () {
      return (this.domHeight - 180) < 300 ? 280 : (this.domHeight - 180);
    },
    disableTableHeight () {
      if (this.show) {
        return this.curHeight / 2 - 80;
      } else {
        return 0;
      }
    },
  },
  created () {
    this.getEnableHeight();
    this.getCategoryTemp();
    this.getProductCategoryList();
    this.getProductBrandList();
  },
  methods: {
    openProductFn () {
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    addProductSave (data) {
      this.addProductValue = data;
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
    },
    addProductSuccess (data) {
    },
    addProductCancel (data) {
    },
    // 重置搜索条件
    resetForm () {
      this.$refs.searchFilterRef && this.$refs.searchFilterRef.resetFields();
    },
    getProductBrandList () { // 获取品牌列表(筛选下拉)
      this.axios.get(api.carrierServiceCommon + api.getAll_productBrand, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          this.productBrandList = response.data.datas;
        }
      });
    },
    visibleChange1 (open) {
      if (open) {
        this.messageContentTranslation = '';
        this.applyScopeStatus = false;
        this.applyScopeAllStatus = false;
        this.scopeValue = [];
        this.CheckedData = [];
        this.scopeAllValue = false;
        this.selectionStart = null;
      } else {
        this.transtionLoading = false;
        this.templetInfoLoading = false;
        this.$refs.templetModalFormRef && this.$refs.templetModalFormRef.resetFields();
      }
    },
    visibleChange2 (open) {
      if (open) {
        /*   this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
         this.$refs.matchingGoodsModal.matchingGoodsModal = true;
         this.$refs.matchingGoodsModal.getMapGoodsData();
         this.$refs.matchingGoodsModal.getNormalGoodsData(); */
      }
    },
    // 验证
    formMaxVerify (rule, value, callback) {
      this.$nextTick(() => {
        const newVal = this.templetModalParams[rule.field];
        this.$common.strMaxVerify(rule, newVal, callback);
      });
    },
    visibleChange (open) {
      if (open) {
        this.categoryTree[0].children = [];
        this.$nextTick(() => {
          this.categoryTree[0].children = this.toTree(this.setCheckedNodes(this.$store.state.categoryData), 'productCategoryNavigation', '->');
        });
      }
    },
    ruleConfParamsFn () {
      return new Promise(resolve => {
        this.templetModalParams.saveRuleConfParams = [];
        if (this.scopeAllValue) {
          // 适用于所有商品
          this.templetModalParams.saveRuleConfParams.push({
            ruleCode: 'All',
            ruleValue: []
          });
        } else {
          if (this.scopeValue.indexOf('002') > -1) {
            if (this.CheckedData.length === 0) {
              this.$Message.error('请选择产品分类');
              resolve(false);
              return;
            }

            this.templetModalParams.saveRuleConfParams.push({
              ruleCode: '002',
              ruleValue: this.CheckedData.map(i => {
                return i.productCategoryId;
              })
            });
          }

          if (this.scopeValue.indexOf('003') > -1) {
            if (this.productBrandIds.length === 0) {
              this.$Message.error('请选择产品品牌');
              resolve(false);
              return;
            }
            this.templetModalParams.saveRuleConfParams.push({
              ruleCode: '003',
              ruleValue: this.productBrandIds
            });
          }
          if (this.scopeValue.indexOf('004') > -1) {
            if (this.addProductValue.length === 0) {
              this.$Message.error('请选择产品');
              resolve(false);
              return;
            }
            this.templetModalParams.saveRuleConfParams.push({
              ruleCode: '004',
              ruleValue: this.addProductValue.map(i => {
                return JSON.stringify(i);
              })
            });
          }
        }
        if (this.templetModalParams.saveRuleConfParams.length < 1) {
          this.$Message.error('请选择适用范围');
          resolve(false);
        } else {
          resolve(true);
        }
      });
    },
    getCheckedNodes (data) {
      this.CheckedData = this.$refs.category.getCheckedNodes();
    },
    setCheckedNodes (data) {
      // 设置选中的值
      if (this.CheckedData.length > 0) {
        let arr = [];
        data.forEach(i => {
          let obj = i;
          obj.checked = false;
          this.CheckedData.forEach(j => {
            if (i.productCategoryId === j.productCategoryId) {
              obj.checked = true;
            }
          });
          arr.push(obj);
        });
        return arr;
      }
      return data;
    },
    getProductCategoryList () { // 获取列表数据
      let self = this;
      if (self.$store.state.categoryData) {
        return;
      }
      self.loading3 = true;
      this.axios.get(api.carrierServiceCommon + api.get_productCategory, { hiddenError: true }).then(resa => {
        self.loading3 = false;
        if (resa.data.code === 0) {
          self.$store.commit('categoryData', resa.data.datas);
        }
      });
    },
    toTree (arr = [], key, Identification) {
      let newArr = [];
      arr.forEach(i => {
        let matchName; // 最后一个name
        let name = i[key]; // 用来判断的值 =>分割
        if (name.lastIndexOf(Identification) > -1) {
          matchName = name.slice(0, name.lastIndexOf(Identification));
        } else {
          matchName = name;
          newArr.push(i);
        }
        i.title = i.cnName;
        if (this.nameToObject[matchName]) {
          this.nameToObject[matchName].children.push(i);
        }
        this.nameToObject[name] = i;
        this.nameToObject[name].children = [];
      });
      return newArr;
    },
    getEnableHeight () {
      if (this.show) {
        this.enableTableHeight = this.curHeight / 2 - 60;
      } else {
        this.$nextTick(() => {
          this.enableTableHeight = this.curHeight - 80;
        }, 1000);
      }
    },
    slowHide (curHeight) {
      return curHeight - 1;
    },
    getTableList (data, index) { // 选中当前模板
      this.chioseTemp = data;
      this.getTemplet();
    },
    getCategoryTemp () { // 获取模板分类
      let pos = [ // 模板分类数据
        {
          categoryName: '全部',
          templateCategoryId: '',
          categoryType: 2
        }
      ];
      let list = [];
      this.axios.get(api.get_categoryTemp + '?platformId=' + this.platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              pos.push(n);
              list.push(n);
            });
          }
          this.templetCategoryList = list;
        }
      });
      this.categoryData = pos;
      this.getTableList(pos[0], 0); // 默认查询全部
      this.categoryData[0]._highlight = true; // 默认第一条高亮
    },
    editTemp () { // 编辑模板
      if (this.chioseTemp !== null) {
        if (this.chioseTemp.categoryType === 0) { // 普通模板
          this.reviseTempModal = true;
          this.reviseTempModalStatus = true;
          this.reviseTit = '编辑';
          this.reviseStatus = 'edit';
          this.tempName = this.chioseTemp.categoryName;
        } else if (this.chioseTemp.categoryType === 1) { // 常用模板
          this.$Message.error('常用模板不能进行修改');
        } else {
          this.$Message.error('内置模板不能编辑');
        }
      } else {
        this.$Message.error('请选择需要编辑的类型');
      }
    },
    addTemp () { // 新增模板
      this.reviseTempModal = true;
      this.reviseTempModalStatus = true;
      this.reviseTit = '增加';
      this.reviseStatus = 'add';
    },
    // 删除模板类型
    deleteTempType () {
      if (this.$common.isEmpty(this.chioseTemp)) return this.$Message.error('请选择需要删除的模板分类');
      this.isDelModal(() => {
        if (this.chioseTemp !== null) {
          this.axios.delete(api.del_categoryTemp + this.chioseTemp.templateCategoryId).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('删除成功');
              this.tempStatus = new Date().getTime();
              this.chioseTemp = null;
            }
          });
        }
      }, null, null, `
        <div>您确定删除 <span style="color: #f20;">${this.chioseTemp.categoryName}</span> 分类？</div>
        <div style="margin-top:20px;font-size: 12px;color:#999;">注意：当模板分类下存在回复模板时，不允许删除模板分类</div>
      `);
    },
    reviseTempOK () { // 新增，编辑模板分类
      if (this.reviseStatus === 'add') {
        if (this.tempName) {
          let obj = {
            categoryName: this.tempName,
            platformId: this.platformId
          };
          this.axios.post(api.create_categoryTemp, obj).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('新增成功');
              this.tempStatus = new Date().getTime();
              this.tempName = null;
            }
          });
        }
      } else if (this.reviseStatus === 'edit') {
        let obj = {
          categoryName: this.tempName,
          templateCategoryId: this.chioseTemp.templateCategoryId,
          platformId: this.platformId
        };
        this.axios.put(api.update_categoryTemp, obj).then(response => {
          if (response.data.code === 0) {
            this.$Message.success('修改成功');
            this.tempStatus = new Date().getTime();
            this.tempName = null;
          }
        });
      }
    },
    reviseTempCancel () { // 取消新增，编辑
      this.tempName = null;
      this.reviseTempModal = false;
    },
    addTemplet (type, val) { // 新增,编辑模板
      this.templetModalTit = '站内信回复模板';
      this.templetModal = true;
      this.$refs.templetModalFormRef && this.$refs.templetModalFormRef.resetFields();
      this.$nextTick(() => {
        if (type) { // 编辑
          this.templeStatus = 'edit';
          if (val) {
            this.templetModalParams = {};
            this.templetInfoLoading = true;
            this.axios.get(api.get_messageTemplate + val).then(response => {
              if (response.data.code === 0) {
                let data = response.data.datas.messageTemplate;
                if (response.data.datas.ruleConfs.length > 0) {
                  this.setRuleParams(response.data.datas.ruleConfs);
                }
                if (data.templateCategoryId === null) {
                  data.templateCategoryId = '';
                }
                this.templetModalParams = data;
              }
              this.templetInfoLoading = false;
            }).catch(() => {
              this.templetInfoLoading = false;
            });
          }
        } else {
          this.templetModalParams.templateCategoryId = this.chioseTemp.templateCategoryId || '';
          // 新增
          this.templeStatus = 'add';
        }
      })
    },
    // 内容改变时
    msgContentChange () {
      this.messageContentTranslation = '';
      this.transtionLoading = false;
    },
    // 翻译
    translationText () {
      if (this.$common.isEmpty(this.templetModalParams.messageContent, true)) {
        this.messageContentTranslation = '';
        return;
      }
      if (this.transtionLoading) return;
      this.transtionLoading = true;
      this.axios.post(api.aliTranslate, this.templetModalParams.messageContent).then(res => {
        this.transtionLoading = false;
        if (!res || !res.data || res.data.code != 0) {
          this.messageContentTranslation = '';
          return;
        }
        this.messageContentTranslation = res.data.datas;
      }).catch(() => {
        this.messageContentTranslation = '';
        this.transtionLoading = false;
      })
    },
    setRuleParams (data) {
      let arr1 = []; // 产品分类
      let arr2 = []; // 产品品牌
      let arr3 = []; // 部分产品
      let arr4 = [];
      data.forEach(i => {
        if (i.ruleCode === '002') {
          arr1.push(i.ruleValue);
        } else if (i.ruleCode === '003') {
          arr2.push(i.ruleValue);
        } else if (i.ruleCode === '004') {
          arr3.push(i.ruleValue);
        } else if (i.ruleCode === 'All') {
          arr4.push(i.ruleCode);
        }
      });
      if (arr1.length > 0) {
        // 适用于部分商品分类
        this.scopeValue.push('002');
        this.CheckedData = this.$store.state.categoryData.filter(i => {
          if (arr1.indexOf(i.productCategoryId) > -1) {
            return i;
          }
        });
        this.applyScopeAllStatus = true;
      }
      if (arr2.length > 0) {
        // 适用于部分商品品牌
        this.scopeValue.push('003');
        this.productBrandIds = arr2;
        this.applyScopeAllStatus = true;
      }
      if (arr3.length > 0) {
        // 适用于部分商品
        this.scopeValue.push('004');
        this.addProductValue = arr3.map(i => {
          return JSON.parse(i);
        });
        this.applyScopeAllStatus = true;
      }
      if (arr4.length > 0) {
        // 所有产品
        this.scopeAllValue = true;
      } else {
        this.scopeAllValue = false;
      }
    },
    getSelectValue (value) { // table获取所选值
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.messageTemplateId);
      })).then(() => {
        this.templateIdList = pos;
      });
    },
    // (批量)删除模板
    delTableRow (row) {
      if (!this.$common.isEmpty(row)) {
        // 单个
        this.isDelModal(() => {
          this.axios.delete(api.del_mesTemp + row.messageTemplateId).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('删除成功');
              this.pageParamsStatus = true;
            }
          });
        }, null, null, `您确定删除 <span style="color:#f20;">${row.messageTemplateName}</span> 模板？`);
        return;
      }
      if (this.$common.isEmpty(this.templateIdList)) return this.$Message.error('请选择要删除的模板!');
      // 批量
      this.isDelModal(() => {
        this.axios.post(api.del_mesTempBatch, this.templateIdList).then(response => {
          if (response.data.code === 0) {
            this.$Message.success('删除成功');
            this.pageParamsStatus = true;
          }
        });
      }, null, null, `您确定删除选中的 <span style="color:#f20;">${this.templateIdList.length}</span> 个模板？`);
    },
    // 搜索参数处理
    getSearchParams () {
      let param = this.$common.copy(this.pageParams);
      if (this.chioseTemp.categoryType === 2) {
        delete param.templateCategoryId;
      } else {
        param.templateCategoryId = this.chioseTemp.templateCategoryId;
      }
      param.platformId = this.platformId;
      return param;
    },
    // 查询模板列表
    getTemplet () {
      this.templateIdList = [];
      if (!this.getPermission('messageTemplate_query')) return this.$Message.error('您暂无查询权限！');
      this.loadingTrue();
      this.axios.post(api.query_categoryTemp, this.getSearchParams()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.tempData = data.list;
          this.$nextTick(() => {
            this.total = Number(data.total);
            this.totalPage = Number(data.pages);
          });
        }
        this.loadingFalse();
      }).catch(() => {
        this.loadingFalse();
      });
    },
    // 新增，编辑模板模态确认
    templetModalOK () {
      this.$refs.templetModalFormRef.validate((valid) => {
        this.templetInfoLoading = true;
        if (valid) {
          // this.ruleConfParamsFn().then(data => {
          // if (!data) {
          //   this.templetModal = true;
          // } else {
          if (this.templeStatus === 'add') { // 新增
            this.templetModalParams.platformId = this.platformId;
            this.axios.post(api.set_messageTemplate, this.templetModalParams).then(response => {
              if (response.data.code === 0) {
                this.$Message.success('新增成功');
                this.$nextTick(() => {
                  this.templetModal = false;
                  this.pageParamsStatus = true;
                });
              }
              this.templetInfoLoading = false;
            }).catch(() => {
              this.templetInfoLoading = false;
            });
          } else { // 编辑
            this.axios.put(api.update_messageTemplate, this.templetModalParams).then(response => {
              if (response.data.code === 0) {
                this.$Message.success('修改成功');
                this.$nextTick(() => {
                  this.templetModal = false;
                  this.pageParamsStatus = true;
                });
              }
              this.templetInfoLoading = false;
            }).catch(() => {
              this.templetInfoLoading = false;
            });
          }
          // }
          // });
        } else {
          this.templetInfoLoading = false;
        }
      });
    },
    scopeChange (val) { // 指定范围
      /*  console.log(val);
       // templetModalParams
       /!*
       *
       * {
       "ruleCode": "string",
       "ruleValue": [
       "string"
       ]
       }
       * *!/
       let arr = [];
       if (val && val.length > 0) {
       if (val.indexOf('002') > -1) {
       arr.push({
       ruleCode: '002'
       });
       }
       if (val.indexOf('003') > -1) {
       arr.push({
       ruleCode: '002'
       });
       }
       if (val.indexOf('004') > -1) {
       arr.push({
       ruleCode: '002'
       });
       }
       } */

      if (val.length) {
        this.applyScopeAllStatus = true;
      } else {
        this.applyScopeAllStatus = false;
      }
    },
    scopeAllChange (val) { // 指定范围所有商品
      if (val) {
        this.applyScopeStatus = true;
      } else {
        this.applyScopeStatus = false;
      }
    },
    templetModalCancel () {
      this.templetModal = false;
    },
    messageBlur (e) {
      this.selectionStart = e.target.selectionStart;
    },
    addMessageContent (data) {
      if (!this.templetModalParams.messageContent) {
        this.templetModalParams.messageContent = '';
      }
      this.$nextTick(() => {
        this.$refs.messageContent.$el.children[0].focus();
        setTimeout(() => {
          this.$refs.messageContent.$el.children[0].selectionStart = this.selectionStart + data.length;
          this.$refs.messageContent.$el.children[0].selectionEnd = this.selectionStart + data.length;
        });
        if (this.selectionStart !== null) {
          this.text = this.text.slice(0, this.selectionStart) + data + this.text.slice(this.selectionStart, this.text.length);
          this.templetModalParams.messageContent = this.templetModalParams.messageContent.slice(0, this.selectionStart) + data + this.templetModalParams.messageContent.slice(this.selectionStart, this.templetModalParams.messageContent.length);
        } else {
          this.text = this.templetModalParams.messageContent + '' + data;
          this.templetModalParams.messageContent = this.templetModalParams.messageContent + '' + data;
        }

        //
      });
    },
    changeExpand (data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },

    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree () {
      this.showTree = !this.showTree;
      this.categoryTree = this.treeChangeExpand(this.categoryTree, this.showTree);
    },

    // 递归给树设置expand
    treeChangeExpand (treeData, flag) {
      for (let i = 0; i < treeData.length; i++) {
        this.$set(treeData[i], 'expand', flag);
        if (treeData[i].children) {
          treeData[i].children = this.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    }
  },

};
</script>

<style lang="less" scoped>
.tabContainer{
  // background: none;
  .main-page{
    width: 100%;
  }
  .page-left-side{
    display: inline-block;
    width: 260px;
    vertical-align: top;
  }
  .page-right-side{
    display: inline-block;
    margin-left: 35px;
    width: calc(100% - 300px);
    vertical-align: top;
  }
  .table-operation{
    display: flex;
    justify-content: space-between;
  }
  .search-body{
    :deep(.ivu-form){
      .ivu-form-item-content{
        width: 200px;
      }
    }
  }
}
.templet-modal-edit{
  padding: 0 30px 0 10px;
  :deep(.ivu-form){
    .item-content-line{
      .ivu-form-item-content{
        display: flex;
        align-items:flex-end;
      }
    }
    .item-content-btn{
      display: inline-block;
      height: auto;
      margin-left: 15px;
      padding: 4px 6px;
      line-height: normal;
      background: #8700ff;
      color: #fff;
    }
  }
}
.platformParamsSelectRt,
.platformParamsSelectTwo{
  :deep(.ivu-form-item) {
    margin-bottom: 15px;
    .ivu-form-item-error-tip{
      padding-top: 0;
    }
  }
}
.form-item-row{
  display: flex;
  .item-row-label{
    width: 80px;
    height: 32px;
    line-height: 32px;
    text-align: right;
  }
  .item-row-content{
    flex: 100;
  }
}
</style>
