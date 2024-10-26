<template >
  <div >
    <div class="modalItemContent" >
      <Row >
        <Col span="4" >
          <Form :model="pageParams" label-position="left" :label-width="50" >
            <div class="filterItem" >
              <Form-item label="SKU：" >
                <Input placeholder="输入SKU编码" v-model.trim="pageParams.skuCode" style="width: 200px" ></Input >
              </Form-item >
            </div >
          </Form >
        </Col >
        <Col span="16" >
          <div class="filterItem filterConfirm" >
            <Button type="primary" @click="productDtlSearch" :disabled="SearchDisabled" icon="ios-search" >查询</Button >
          </div >
        </Col >
        <Col span="4" >
          <Form :model="pageParams" label-position="left" >
            <div class="filterItem" >
              <Form-item >
                <Checkbox v-model="pageParams.single" >显示库存为0的产品</Checkbox >
              </Form-item >
            </div >
          </Form >
        </Col >
      </Row >
      <div style="margin-bottom:50px;" >
        <!--表格-->
        <Row >
          <Col span="4" >
            <Card dis-hover style="overflow:auto;" >
              <div
                  style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
                  v-if="treeData.length>0"
                  @click="exchangeTree" >{{showTree ? '全部收起' : '全部展开'}}
              </div >
              <Tree :data="treeData" @on-toggle-expand="changeExpand" @on-select-change="clickNode" ></Tree >
            </Card >
          </Col >
          <Col span="19" style="margin-left: 10px" >
            <Table
                highlight-row
                border
                :columns="columns6"
                :loading="TableLoading"
                :data="productData"
                ref="selection"
                @on-selection-change="selectItem"
                height="400" ></Table >
          </Col >
        </Row >
        <!--分页按钮-->
        <div class="table-page" >
          <div class="table-page-right" >
            <Page
                :total="totalRecords"
                :current="pageParams.pageNum"
                @on-change="changePage"
                show-total
                :page-size="pageParams.pageSize"
                show-elevator
                show-sizer
                @on-page-size-change="changePageSize"
                placement="top"
                :page-size-opts="pageArray" ></Page >
          </div >
        </div >
      </div >
    </div >
  </div >
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      showTree: true,
      pageParams: {
        skuCode: '',
        single: false,
        pageNum: 1,
        pageSize: 10
      },
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '商品图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.goodsUrl
                     ? v.$store.state.imgUrlPrefix + params.row.goodsUrl
                     : require('../../../../../public/static/images/placeholder.jpg')
              },
              style: {
                width: '60px',
                height: '60px',
                padding: '6px 0 2px 0'
              }
            });
          }
        }, {
          title: '商品编码',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '重量(g)',
          key: 'goodsWeight',
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center'
        }, {
          title: '产品有效期',
          key: 'goodsEndDate',
          align: 'center'
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '库存数量',
          key: 'inventoryNumber',
          align: 'center'
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          align: 'center'
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          align: 'center'
        }, {
          title: '可用数量',
          key: 'availableNumber',
          align: 'center'
        }
      ],
      productData: [],
      productCategoryId: '',
      treeData: []
    };
  },
  props: {
    open: {
      default: null
    },
    wareId: {
      default: null
    },
    allotWareOutId: {
      // 库存调拨仓库ID
      default: null
    },
    goodsFlag: {
      // 库存调拨产品列表标识
      default: null
    }
  },
  watch: {
    open: function (val) {
      if (val) {
        this.searchData();
        this.getTreeData();
      }
    },
    'pageParams.single': function (val) {
      // 显示库存为0的产品
      if (val === true) {
        this.searchData();
      } else {
        this.searchData();
      }
    }
  },
  created () {
    // this.searchData();
    this.getTreeData();
  },
  methods: {
    getTreeData () {
      // 获取树形结构数据
      let obj = { allFlag: '1' };
      this.axios.post(api.categoryList, obj).then(res => {
        if (res.data.code === 0) {
          let objList = res.data.datas;
          let arr = this.changeChildToChildren(objList);
          this.treeData = arr;
        }
      });
    },
    clickNode (val) {
      this.productCategoryId = val[0].code;
      this.searchData();
    },
    changeChildToChildren (childList) {
      childList.forEach(val => {
        val.title = val.name;
        val.children = val.child;
        val.expand = true;
        if (val.hasOwnProperty('child')) {
          val.children = this.changeChildToChildren(val.child);
        }
      });
      return childList;
    },
    selectItem (data) {
      // 选择单行表格行
      this.$emit('userSelectOk', data);
    },
    searchData () {
      // 查询功能
      var v = this;
      if (this.goodsFlag === 'allotGoods') {
        var paramsObj = {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize,
          warehouseId: v.allotWareOutId, // 调拨单仓库ID
          inventoryNumber: v.pageParams.single === true ? '0' : null,
          productCategoryId: this.productCategoryId,
          likeFlag: 1
        };
        v.TableLoading = true;
        v.SearchDisabled = true;
        if (v.pageParams.skuCode) paramsObj.goodsSkuName = v.pageParams.skuCode; // 输入SKU编码查询
        v.axios.post(api.get_outStockProduct, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.columns6.splice(6, 3);
            this.productData = res.data.datas.list;
            this.totalRecords = res.data.datas.total;
          }
        });
      } else {
        var inventObj = {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize,
          warehouseId: v.wareId,
          inventoryNumber: v.pageParams.single === true ? '0' : null,
          productCategoryId: this.productCategoryId
        };
        if (v.pageParams.skuCode) inventObj.goodsSkuName = v.pageParams.skuCode; // 输入SKU编码查询
        // v.axios.post(api.get_productListData, inventObj)
        // v.axios.post(api.get_goodsList, inventObj)
        v.axios.post(api.get_outStockProduct, inventObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.productData = res.data.datas.list;
            this.totalRecords = res.data.datas.total;
          }
        });
      }
    },
    productDtlSearch () {
      // 页面查询
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    },
    changePage (page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    changeExpand (data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },

    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree () {
      this.showTree = !this.showTree;
      this.treeData = this.treeChangeExpand(this.treeData, this.showTree);
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
