<template >
  <div >
    <div class="modalItemContent" >
      <Form :model="pageParams" label-position="left" :label-width="50" >
        <Row >
          <Col span="5" >
            <div class="filterItem" >
              <Form-item label="SKU：" >
                <Input placeholder="输入SKU编码、商品名称" v-model.trim="pageParams.skuCode" style="width: 180px" ></Input >
              </Form-item >
            </div >
          </Col >
          <Col span="4" >
            <div class="filterItem filterConfirm" >
              <Button
                  type="primary"
                  @click="productDtlSearch"
                  :disabled="SearchDisabled"
                  icon="ios-search" >搜索</Button >
            </div >
          </Col >
          <Col span="5" offset="10" >
            <div class="filterItem" >
              <Form-item >
                <!-- <Checkbox v-model="pageParams.single">显示库存为0的产品</Checkbox> -->
              </Form-item >
            </div >
          </Col >
        </Row >
      </Form >
      <div style="margin-bottom:50px;" >
        <Row >
          <Col span="4" >
            <Card dis-hover >
              <div
                  style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
                  v-if="treeData.length>0"
                  @click="exchangeTree" >{{showTree ? '全部收起' : '全部展开'}}
              </div >
              <Tree :data="treeData" @on-toggle-expand="changeExpand" @on-select-change="clickNode" ></Tree >
            </Card >
          </Col >
          <Col span="19" style="margin-left: 10px" >
            <!--表格-->
            <Table
                highlight-row
                border
                :columns="columns7"
                :data="data6"
                ref="selection"
                :loading="TableLoading"
                @on-selection-change="selectButton"
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
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      showTree: true,
      pageParams: {
        skuCode: '',
        single: false,
        pageNum: 1,
        pageSize: 10
      },
      totalRecords: 0, // 总条数
      columns7: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          title: '图片',
          key: 'goodsUrl',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160
        }, {
          title: '重量(g)',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 120
        }, {
          title: '长宽高(cm)',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', {
              attrs: {
                style: 'color:#fa5555'
              }
            }, (params.row.goodsLength ? params.row.goodsLength : '0') + '*' + (params.row.goodsWidth
                                                                                ? params.row.goodsWidth
                                                                                : '0') + '*' + (params.row.goodsHeight
                                                                                                ? params.row.goodsHeight
                                                                                                : '0'));
          }
        }, {
          title: '库存数量',
          key: 'inventoryNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', params.row.inventoryNumber ? params.row.inventoryNumber : 0);
          }
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', params.row.allottedNumber ? params.row.allottedNumber : 0);
          }
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', params.row.frozenNumber ? params.row.frozenNumber : 0);
          }
        }, {
          title: '可用数量',
          key: 'availableNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('span', params.row.availableNumber ? params.row.availableNumber : 0);
          }
        }
      ],
      data6: [],
      treeData: [],
      productCategoryId: ''
    };
  },
  props: {
    openProduct: {
      default: null
    },
    inWareNo: {
      // 入库单号
      default: null
    },
    inWareDtlAdd: {
      // 入库详情添加货品的标记
      default: null
    }
  },
  watch: {
    openProduct: function (val) {
      if (val) {
        this.searchData();
      }
    }
  },
  created () {
    this.searchData();
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
    selectButton (data) {
      // 勾选表格行
      this.$emit('userSelectOk', data);
    },
    searchData () {
      // 查询功能方法
      var v = this;
      v.TableLoading = true;
      v.SearchDisabled = true;
      if (this.inWareDtlAdd === '0') {
        var paramsObj = {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize, // receiptNo: v.inWareNo,
          warehouseId: v.getWarehouseId(),
          productCategoryId: this.productCategoryId,
          likeFlag: '1'
        };
        if (v.pageParams.skuCode) paramsObj.goodsSkuName = v.pageParams.skuCode; // 输入SKU编码
        v.axios.post(api.get_goodsList, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            v.data6 = res.data.datas.list;
            v.totalRecords = res.data.datas.total;
          }
        });
      } else {
        let paramsObj = {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize,
          warehouseId: v.getWarehouseId(),
          productCategoryId: this.productCategoryId,
          likeFlag: '1'
        };
        if (v.pageParams.skuCode) paramsObj.goodsSkuName = v.pageParams.skuCode; // 输入SKU编码
        v.axios.post(api.get_goodsList, paramsObj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            v.data6 = res.data.datas.list;
            v.totalRecords = res.data.datas.total;
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
</script>
