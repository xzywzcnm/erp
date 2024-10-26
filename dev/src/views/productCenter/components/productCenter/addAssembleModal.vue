<template >
  <div >
    <!-- 组装信息 -->
    <Modal
        v-model="matchingGoodsModal"
        v-if="matchingGoodsStatus"
        @on-cancel="closeMatchModal"
        title="添加产品"
        :width="1200"
        class="matchingGoods" >
      <!-- 已选择 -->
      <div class="chioseGoods" >
        已选择:
        <div class="fr" >
          <Button style="marginRight:10px;" type="primary" @click="chioseSave" size="small" >保存 </Button >
          <Button @click="backDetail" size="small" >返回 </Button >
        </div >
        <div style="marginTop:10px;" >
          <template v-for="(item,index) in matchingGoodsList">
            <div
                class="chioseGoodsList"
                v-if="matchingGoodsList.length"
                :key="index" >
              {{ item.sku }} *
              <InputNumber :min="1" v-model.trim="item.quantity" style="width:50px;" ></InputNumber >
              <span @click="delSku(index)" style="cursor:pointer;marginLeft:10px;" >X</span >
            </div >
          </template>
        </div >
      </div >
      <!-- 搜索字符 -->
      <div class="tabChanger" >
        搜索字符: <Input
          placeholder="SPU、SKU、商品名称" v-model.trim="matchingGoodsParams1.searchValue" style="width:200px;" ></Input >
        <Button style="marginLeft:10px;" type="primary" size="small" @click="searchChar1" >查询 </Button >
        <Checkbox style="marginLeft:10px;" v-model="fuzzySearch1" >模糊搜索
        </Checkbox >
        <Row style="marginTop:20px;" >
          <Col span="6" >
            <div style="width:260px;height:550px;border:1px solid #eee;overflow: auto;" >
              <!-- <Input placeholder="请输入" v-model.trim="matchingGoodsParams1.productCategoryIds" icon="md-search" style="width:200px;marginLeft:25px;marginTop:10px;"></Input> -->
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
                  :loading="tableLoading"
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
  props: ['openType', 'editAssembleIndex'],
  data () {
    let self = this;
    return {
      productStatus: productData.productStatus,
      showTree: true,
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      matchingGoodsStatus: false, // 状态控制
      matchingGoodsModal: false,
      matchingGoodsParamsStatus1: false,
      matchingGoodsParams1: { // 普通商品
        isAssemble: -1,
        searchValue: '',
        fuzzySearch: 0,
        productCategoryIds: [],
        pageNum: 1,
        pageSize: 10
      },
      productCategoryId: '',
      matchingGoodsList: [], // 已选择商品
      chioseList1: [], // 普通商品选择数据
      fuzzySearch1: false,
      goodsImageMap: null,
      norGoodsData: [],
      norGoodsColumn: [
        {
          title: '操作',
          width: 80,
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
          align: 'center',
          render: (h, params) => {
            let specificationsList = params.row.productGoodsSpecifications;
            let pos = '';
            if (specificationsList !== null && specificationsList !== []) {
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
          align: 'center',
          render: (h, params) => {
            let orderTagList = params.row.productGoodsTags;
            let pos = [];
            if (orderTagList !== [] && orderTagList !== null) {
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
              return h('div', pos);
            }
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
      ],
      addProStatus: false, // false编辑  true新增
      openStatus: false // 变参商品组装信息有值时，第一次选择需将数据放入已选择中
    };
  },
  computed: {
    norGoodstableHeight () {
      return this.getTableHeight(420);
    }
  },
  watch: {
    matchingGoodsParamsStatus1 (n, o) {
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
      v.tableLoading = true;
      v.axios.post(api.query_productGoodsTab, v.matchingGoodsParams1).then(response => {
        v.tableLoading = false;
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
          v.axios.post(api.productGoodsImage_queryByProductGoodsIds, productGoodsIds).then(function (response) {
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
      let url = null;
      if (v.goodsImageMap && v.goodsImageMap[val.productGoodsId]) {
        url = v.goodsImageMap[val.productGoodsId][0];
      }
      pos.push({
        productGoodsId: val.productGoodsId,
        sku: val.sku,
        name: val.cnName,
        value: val.productGoodsSpecifications,
        quantity: 1,
        pictureUrl: url
      });
      // 判断已选择商品列表中是否已有当前选择项 有的话数量加1，无则新增
      if (v.chioseList1 && v.chioseList1.length) {
        let status = false; // 判断是否有相同项
        let index = null; // 记录相同项的下标
        v.chioseList1.forEach((n, i) => {
          if (n.productGoodsId === pos[0].productGoodsId) {
            status = true;
            index = i;
          }
        });
        if (status) {
          v.chioseList1[index].quantity += 1;
        } else {
          v.chioseList1.push(pos[0]);
        }
      } else { // 已选商品列表为空，直接新增
        v.chioseList1 = pos;
      }
      if (v.openType === 2 && v.openStatus) { // 变参商品已有组装信息时，需先将数据放入chioseList1
        let typeStatus = false;
        let typeIndex = null;
        // 由于外面传过来的值和这里的值不同，所以先对外面的值进行改造
        let box = [];
        v.matchingGoodsList.forEach((j, k) => {
          box.push({
            productGoodsId: j.materialProductGoodsId,
            sku: j.sku,
            name: j.cnName,
            value: j.productGoodsSpecifications,
            quantity: j.quantity,
            pictureUrl: j.pictureUrl
          });
        });
        for (let m = 0; m < box.length; m++) {
          for (let t = 0; t < v.chioseList1.length; t++) {
            if (box[m].productGoodsId === v.chioseList1[t].productGoodsId) {
              typeStatus = true;
              typeIndex = t;
            }
          }
          if (typeStatus) {
            v.chioseList1[typeIndex].quantity += box[m].quantity;
          } else {
            v.chioseList1.push(box[m]);
          }
          typeStatus = false;
        }
        v.openStatus = false; // 防止重复执行
        if (!v.addProStatus) {
          v.$parent.productInfo.productGoodsList[v.editAssembleIndex].editStatus = true; // 变更当前编辑数据的状态，表示该数据内部有改变
        }
      }
      v.matchingGoodsList = v.chioseList1;
    },
    chioseSave () { // 添加产品保存
      let v = this;
      if (v.matchingGoodsList.length) {
        v.$emit('addTabData', v.matchingGoodsList); // 触发addTabData方法，向父组件传递数据
        v.matchingGoodsList = []; // 清空已选择数据
        v.chioseList1 = [];
        v.matchingGoodsModal = false;
      } else {
        v.$Message.error('请至少选择一个');
      }
    },
    backDetail () { // 人工匹配模态框 返回
      let v = this;
      v.matchingGoodsList = [];
      v.chioseList1 = [];
      v.matchingGoodsModal = false;
    },
    closeMatchModal () { // 模态框关闭时 清空已选择列表
      let v = this;
      v.backDetail();
    },
    delSku (index) { // 删除已选择
      let v = this;
      if (v.openType === 2 && v.openStatus) { // 进来直接点删除
        v.matchingGoodsList.splice(index, 1);
      } else {
        let id = v.matchingGoodsList[index].productGoodsId;
        if (v.chioseList1.length) {
          v.chioseList1.forEach((n, i) => {
            if (n.productGoodsId === id) {
              v.chioseList1.splice(i, 1);
            }
          });
        }
      }
    },
    getTreeData () { // 获取分类树
      let v = this;
      let userId = v.$store.state.erpConfig.userInfo.userId;
      let merchantId = v.$store.state.erpConfig.userInfo.merchantId;
      v.axios.get(api.get_productCategory, {
        hiddenError: true,
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
</script >

<style >
.matchingGoods .ivu-tabs-nav {
  float: right;
}
</style >
