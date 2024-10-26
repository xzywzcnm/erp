<template >
  <div >
    <div >
      <Form class="clear" >
        <div class="fl sku" >
          <FormItem label="SKU：" >
            <Input v-model.trim="search.sku" placeholder="" style="width: 220px" ></Input >
            <Button @click="searchP" >查询</Button >
          </FormItem >
        </div >
        <FormItem class="fr" >
          <Checkbox v-model="search.single" @on-change="searchP" >显示库存为0的产品</Checkbox >
        </FormItem >
      </Form >
    </div >
    <!--表格-->
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
        <Table :columns="columns" :loading="TableLoading" :data="data" @on-selection-change="tableSltItemFn" ></Table >
      </Col >
    </Row >
    <div class="clear" >
      <div class="fr pages" >
        <Page
            :total="pageTotal"
            show-total
            show-elevator
            @on-change="pageNumChange"
            :page-size-opts="pageArray" ></Page >
      </div >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';

export default {
  props: ['wareId'],
  data () {
    return {
      showTree: true,
      TableLoading: false,
      pageTotal: 0,
      tableSltItem: '',
      search: {
        sku: '',
        single: '',
        pageNum: 1,
        pageSize: 10
      },
      treeData: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: '商品编码',
          key: 'goodsSku'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc'
        }, {
          title: '重量',
          key: 'goodsWeight'
        }, {
          title: '库存数量',
          key: 'inventoryNumber'
        }, {
          title: '分配数量',
          key: 'allottedNumber'
        }, {
          title: '冻结数量',
          key: 'frozenNumber'
        }, {
          title: '可用数量',
          key: 'availableNumber'
        }
      ],
      data: [],
      productCategoryId: ''
    };
  },
  created () {
    let obj = { warehouseId: this.wareId };
    this.TableLoading = true;
    this.axios.post(api.get_outStockProduct, obj).then(res => {
      this.TableLoading = false;
      if (res.data.code === 0) {
        this.data = res.data.datas.list;
        this.pageTotal = Number(res.data.datas.total);
      }
    });
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
      this.searchP();
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
    tableSltItemFn (data) {
      this.tableSltItem = data;
    },
    searchP () {
      let obj = {
        warehouseId: this.wareId,
        inventoryNumber: this.search.single ? '0' : '1',
        goodsSkuName: this.search.sku ? this.search.sku : null,
        pageNum: this.search.pageNum,
        pageSize: this.search.pageSize,
        productCategoryId: this.productCategoryId,
        likeFlag: '1'
      };
      this.axios.post(api.get_outStockProduct, obj).then(res => {
        if (res.data.code === 0) {
          this.data = res.data.datas.list;
          this.pageTotal = Number(res.data.datas.total);
        }
      });
    },
    pageNumChange (num) {
      this.search.pageNum = +num;
      this.searchP();
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

<style >
.sku .ivu-form-item-label,
.sku .ivu-form-item-content {
  float: left;
}
</style >
