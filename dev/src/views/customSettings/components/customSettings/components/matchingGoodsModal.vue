<template >
  <div >
    <!-- 人工匹配商品 test -->
    <Modal
        v-model="matchingGoodsModal"
        v-if="matchingGoodsStatus"
        @on-cancel="closeMatchModal"
        title="人工匹配商品"
        :width="1200"
        class="matchingGoods" >
      <!-- 已选择 -->
      <div class="chioseGoods" >
        已选择:
        <div class="fr" >
          <Button type="primary" @click="chioseSave" size="small" >保存 </Button >
          <Button class="ml10" @click="backDetail" size="small" >返回 </Button >
        </div >
        <div class="mt10" >
          <div class="chioseGoodsList" >
            <Tag
                closable
                v-if="matchingGoodsList.length"
                v-for="(item,index) in matchingGoodsList"
                :key="index"
                @on-close="delSku(index)" >{{ item }}
            </Tag >
          </div >
        </div >
      </div >
      <!-- 搜索字符 -->
      <div class="tabChanger" >
        <div >
          搜索字符: <Input placeholder="SPU、SKU、商品名称" v-model.trim="matchingGoodsParams1.searchValue" style="width:200px;"></Input >
          <Button class="ml10" type="primary" size="small" @click="searchChar1" >查询</Button >
          <Checkbox class="ml10" v-model="fuzzySearch1" >模糊搜索
          </Checkbox >
        </div >
        <Row >
          <Col span="6" >
            <div style="width:260px;height:550px;border:1px solid #eee;overflow: auto;" >
              <div
                  style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
                  v-if="categoryTree.length>0"
                  @click="exchangeTree" >{{ showTree ? '全部收起' : '全部展开' }}
              </div >
              <Tree
                  ref="categoryTree"
                  :load-data="loadData"
                  :data="categoryTree"
                  @on-toggle-expand="changeExpand"
                  @on-select-change="view" ></Tree >
            </div >
          </Col >
          <Col span="18" >
            <div class="" >
              <Table
                  highlight-row
                  border
                  :height="norGoodstableHeight"
                  :columns="norGoodsColumn"
                  :data="norGoodsData" ></Table >
              <div class="table-page flexBox" >
                <Page
                    :total="norGoodsTotal"
                    @on-change="norGoodsChangePage"
                    show-total
                    :page-size="matchingGoodsParams1.pageSize"
                    show-elevator
                    :current="norGoodsCurPage"
                    show-sizer
                    @on-page-size-change="norGoodsChangePageSize"
                    placement="top"
                    :page-size-opts="pageArray" ></Page >
              </div >
            </div >
          </Col >
        </Row >
      </div >
      <div slot="footer" ></div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';

export default {
  mixins: [Mixin],
  data () {
    let self = this;
    return {
      productStatus: productData.productStatus,
      showTree: true,
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      chioseIndex: null, // 人工匹配商品的下标
      // 人工匹配商品模态框
      matchingGoodsStatus: false, // 点击人工匹配状态控制
      matchingGoodsModal: false,
      matchingGoodsParamsStatus1: false,
      matchingGoodsParams1: { // 普通商品
        searchValue: '',
        fuzzySearch: 0,
        productCategoryIds: [],
        pageNum: 1,
        pageSize: 10
      },
      productCategoryId: '',
      matchingGoodsList: [], // 人工匹配 已选择商品
      chioseList1: [], // 普通商品选择数据
      fuzzySearch1: false,
      fuzzySearch2: false,
      goodsImageMap: null,
      norGoodsData: [],
      norGoodsColumn: [
        {
          title: '操作',
          width: 80,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#3399ff',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.getSelectValue1(params.row);
                }
              }
            }, '选择');
          }
        }, {
          title: 'SPU',
          key: 'spu',
          width: 80,
          align: 'center'
        }, {
          title: '商品图片',
          key: 'productPic',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            let productPic = null;
            let goodsImageMap = self.goodsImageMap;
            if (goodsImageMap && goodsImageMap[params.row.productGoodsId]) {
              productPic = goodsImageMap[params.row.productGoodsId][0];
            }
            return self.tableImg(h, params, '', productPic);
          }
        }, {
          title: 'SKU',
          key: 'sku',
          width: 80,
          align: 'center'
        }, {
          title: 'SKU属性',
          key: '',
          minWidth: 100,
          render: (h, params) => {
            let specificationsList = params.row.productGoodsSpecifications;
            let pos = '';
            if (!this.$common.isEmpty(specificationsList)) {
              if (specificationsList.length) {
                specificationsList.forEach((n, i) => {
                  pos += n.value + '.';
                });
                pos = pos.substr(0, pos.length - 1);
              }
            }
            return h('div', pos);
          }
        }, {
          title: '商品中文名称',
          key: 'cnName',
          minWidth: 120,
          align: 'center'
        }, {
          title: '商品英文名称',
          key: 'enName',
          minWidth: 120,
          align: 'center'
        }, {
          title: '重量(g)',
          key: 'weight',
          minWidth: 100,
          align: 'center'
        }, {
          title: '长宽高(cm)',
          key: '',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.length + '*' + params.row.width + '*' + params.row.height);
          }
        }, {
          title: '特性标签',
          key: '',
          minWidth: 120,
          render: (h, params) => {
            let orderTagList = params.row.productGoodsTags;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
              orderTagList.forEach((n, i) => {
                let item = h('div', [
                  h('Icon', {
                    props: {
                      type: 'pricetag',
                      color: '#f00'
                    },
                    style: {
                      marginRight: '5px'
                    }
                  }), h('span', n)
                ]);
                pos.push(item);
              });
            }
            return h('div', pos);
          }
        }, {
          title: '商品状态',
          key: 'status',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let text = '';
            this.productStatus.forEach(item => {
              if (item.value == params.row.status) {
                text = h('span', item.label);
              }
            })
            return text;
          }
        }
      ],
      norGoodsTotal: 0,
      norGoodsCurPage: 1,
      norGoodsTotalPage: 0,
      categoryTree: [ // 分类树
        {
          title: '全部分类',
          expand: true,
          productCategoryId: '',
          selected: true,
          children: []
        }
      ]
    };
  },
  computed: {
    norGoodstableHeight () {
      return this.getTableHeight(420);
    }
  },
  watch: {
    matchingGoodsParamsStatus1 (n) {
      let v = this;
      if (n) {
        v.getNormalGoodsData();
        v.matchingGoodsParamsStatus1 = false;
      }
    }
  },
  created () {
    let v = this;
    v.selectedProductCategory = v.categoryTree[0];
    v.$Loading.start();
    Promise.resolve(v.getTreeData()).then(() => {
      v.$Loading.finish();
    });
  },
  methods: {
    searchChar1 () { // 人工匹配商品 搜索字符
      let v = this;
      v.matchingGoodsParams1.pageNum = 1;
      v.norGoodsCurPage = 1;
      v.matchingGoodsParamsStatus1 = true;
    },
    getNormalGoodsData () { // 获取普通商品列表
      let v = this;
      let pos = [];
      let productGoodsIds = [];
      // 是否模糊查询 0否 1是
      if (v.fuzzySearch1) {
        v.matchingGoodsParams1.fuzzySearch = 1;
      } else {
        v.matchingGoodsParams1.fuzzySearch = 0;
      }
      // 分类id
      if (v.productCategoryId !== '' && v.productCategoryId !== null) {
        let categoryList = [];
        categoryList.push(v.productCategoryId);
        v.matchingGoodsParams1.productCategoryIds = categoryList;
      } else {
        v.matchingGoodsParams1.productCategoryIds = [];
      }
      v.axios.post(api.query_productGoods, v.matchingGoodsParams1).then(response => {
        if (response.data.code === 0 && response.data.datas) {
          let data = response.data.datas;
          data.list.forEach((n, i) => {
            pos.push(n);
            productGoodsIds.push(n.productGoodsId);
          });
          Promise.resolve(v.getGoodsImageMap(productGoodsIds)).then(result => {
            v.norGoodsData = pos;
            v.$nextTick(function () {
              v.norGoodsTotal = Number(data.total);
            });
          });
        }
      });
    },
    norGoodsChangePage (page) { // 分页切换
      let v = this;
      v.matchingGoodsParams1.pageNum = page;
      v.matchingGoodsParamsStatus1 = true;
      v.norGoodsCurPage = page;
    },
    norGoodsChangePageSize (pageSize, plat) {
      let v = this;
      v.matchingGoodsParams1.pageSize = pageSize;
      v.matchingGoodsParamsStatus1 = true;
    },
    getGoodsImageMap (productGoodsIds) { // 获取货品图片Map
      var v = this;
      return new Promise(resolve => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios.post(api.query_productImgs, productGoodsIds).then(function (response) {
            if (response.data.code === 0) {
              v.goodsImageMap = response.data.datas;
            }
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    },
    getSelectValue1 (val) { // 普通商品选择商品
      let v = this;
      let pos = [];
      pos.push(val.sku);
      // 判断已选择商品列表中是否已有当前选择项 有的话数量加1，无则新增
      if (v.chioseList1 && v.chioseList1.length) {
        let status = false; // 判断是否有相同项
        v.chioseList1.forEach((n, i) => {
          if (n === pos[0]) {
            status = true;
          }
        });
        if (status) {
          v.$Message.error('已存在！');
        } else {
          v.chioseList1.push(pos[0]);
        }
      } else { // 已选商品列表为空，直接新增
        v.chioseList1 = pos;
      }
      v.matchingGoodsList = v.chioseList1;
    },
    chioseSave () { // 保存
      let v = this;
      debugger;
      if (v.matchingGoodsList.length) {
        v.$emit('editData', v.matchingGoodsList); // 触发editData方法，向父组件传递数据
      }
    },
    backDetail () { // 人工匹配模态框 返回
      let v = this;
      v.matchingGoodsList = [];
      v.chioseList1 = [];
      v.matchingGoodsModal = false;
      v.$parent.marryStatus = false;
      v.$parent.componentsStatus['C007'].skus = false;
    },
    closeMatchModal () { // 模态框关闭时 清空已选择列表
      let v = this;
      v.backDetail();
    },
    delSku (index) { // 删除已选择
      let v = this;
      v.matchingGoodsList.splice(index, 1);
    },
    getTreeData () { // 获取人工匹配分类树
      let v = this;
      let userId = v.$store.state.erpConfig.userInfo.userId;
      let merchantId = v.$store.state.erpConfig.userInfo.merchantId;
      v.axios.get(api.get_allCategory, {
        headers: {
          UserId: merchantId + ',' + userId
        }
      }).then(response => {
        if (response.data.code === 0) {
          v.categoryTree[0].children = v.toTree(response.data.datas, null);
        }
      });
    },
    toTree (data, parentId) { // 组装数据
      var tree = [];
      var temp;
      for (var i = 0; i < data.length; i++) {
        if (data[i].parentId === parentId) {
          var obj = data[i];
          obj.title = obj.cnName;
          obj.expand = true;
          temp = this.toTree(data, data[i].productCategoryId);
          if (temp.length > 0) {
            obj.children = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    },
    view (selectedProductCategorys) { // 查看
      if (selectedProductCategorys.length === 0) {
        this.selectedProductCategory.selected = true;
        this.productCategoryId = '';
        this.matchingGoodsParamsStatus1 = true;
      } else {
        this.productCategoryId = selectedProductCategorys[0].productCategoryId;
        this.matchingGoodsParamsStatus1 = true;
      }
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
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], 'expand', flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    }
  }
};
</script>

<style>
.matchingGoods .ivu-tabs-nav {
  float: right;
}
</style >
<style scoped >
.chioseGoods {
  border: 1px solid #e8e8e8;
  margin-bottom: 10px;
  padding: 10px 10px;
}

.chioseGoodsList {
  display: inline-block;
  margin-left: 15px;
  margin-top: 10px;
}
</style>
