<template>
  <div class="addProductModal">
    <Row style="background-color: rgb(242, 242, 242);overflow-y: scroll">
      <Col span="18">
      <div class="text-tags">
        <span>已选择：</span>
        <Tag closable color="blue" v-for="(v, i) in saveSelectMore" :key="i" @on-close="closeTag(v, i)">
          {{ v.goodsSku }}
        </Tag>
      </div>
      </Col>
      <Col span="6" class="position-sticky">
      <div style="position: relative;width: 88%;height: 100px;">
        <div class="tags"></div>
        <div class="btnGroup">
          <Button type="primary" @click="ok" style="margin-right: 10px">确定</Button>
          <Button @click="cancel">取消</Button>
        </div>
      </div>
      </Col>
    </Row>

    <Form ref="productData" :model="productData" inline class="productData-form mt20" :label-width="70"
      @submit.native.prevent>
      <template v-if="isFba">
        <FormItem label="商品类型:">
          <Select v-model="productData.isAssemble">
            <Option v-for="(item, index) in isAssembleList" :key="'isAssembleList' + index" :value="item.value">
              {{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="搜索条件:" v-if="productData.isAssemble === 0">
          <Select v-model="productData.hasInventory" clearable>
            <Option :value="1">模糊搜索</Option>
            <Option :value="0">库存不为0的产品</Option>
          </Select>
        </FormItem>
      </template>
      <FormItem label="搜索字符:">
        <Input placeholder="SKU/商品名称" v-model.trim="productData.singleSkuName"
          v-if="productData.hasInventory == 1 || productData.single"></Input>
        <dyt-input-tag v-else :limit="1" :string="true" type="textarea" v-model.trim="productData.mulSkuName"
          placeholder="SKU/商品名称,多个请用逗号或回车分隔" />
      </FormItem>
      <FormItem :label-width="0">
        <Button type="primary" @click="search" style="margin-right: 10px" :disabled="loading">搜索</Button>
        <Checkbox v-model="productData.single" v-if="!isFba">模糊搜索</Checkbox>
      </FormItem>
    </Form>
    <div class="product-content">
      <div class="category-left" v-if="categoryOption">
        <Card dis-hover style="overflow-x: scroll;height: 100%;">
          <div style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;" v-if="treeData.length > 0"
            @click="exchangeTree">{{ showTree ? '全部收起' : '全部展开' }}</div>
          <Tree :data="treeData" @on-toggle-expand="changeExpand" @on-select-change="clickNode"></Tree>
        </Card>
      </div>
      <div class="table-right">
        <div class="table-main">
          <Table highlight-row border :columns="columns" :data="data" height="450" :loading="loading"></Table>
          <div class="fr pages">
            <Page :total="tableItemTotal" :current="productData.pageNum" show-total show-sizer show-elevator
              style="margin-top: 10px" :page-size-opts="pageArray" @on-change="pageNumChange"
              @on-page-size-change="pageSizeChange"></Page>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productData from '@/assets/productData/productData.js'

export default {
  // 入库单添加产品要查所有
  mixins: [Mixin],
  props: {
    // 分类树
    categoryOption: {
      type: Boolean,
      default: true
    }, // 已选择商品数组对象
    eliminateData: {
      type: Array,
      default: () => {
        return []
      }
    }, // 判断用什么请求 区分入库单\出库单\全部商品
    from: {
      default: null
    }, // 正常禁用 入库单除外 (库存调整可用 TWMS-1189)
    disabledSlt: {
      type: Boolean,
      default: true
    }, // 移动添加商品不需要控制相同sku不能添加
    ctrl: {
      type: Boolean,
      default: false
    },
    queryTagInfo: {// 是否返回sku标签id
      type: Boolean,
      default: false
    },
    // 是否可多选
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showTree: true,
      productCategoryId: '',
      tableItemTotal: 0,
      treeData: [],
      saveSelectMore: [],
      data: [],
      loading: false,
      productData: {
        isAssemble: 0,
        hasInventory: '',
        singleSkuName: '',
        mulSkuName: '',
        single: false,
        pageNum: 1,
        pageSize: 10
      },
      isAssembleList: [
        { label: '普通产品', value: 0 },
        { label: '组合产品', value: 1 }
      ]
    };
  },
  created() {
    if (this.categoryOption) this.getTreeData();
  },
  watch: {
    'productData.singleSkuName': {
      handler(val) {
        this.productData.mulSkuName = val;
      },
      deep: true,
    },
    'productData.mulSkuName': {
      handler(val) {
        this.productData.singleSkuName = val;
      },
      deep: true,
    },
  },
  computed: {
    // 是否为海外仓
    isFba() {
      return this.$route.path === '/fbaStockOut';
    },
    // 海外仓组合和普通产品显示不同
    columns() {
      var v = this;
      let startList = [
        {
          title: '序号',
          type: 'index',
          width: 70,
          align: 'center'
        },
        {
          title: '图片',
          key: 'goodsUrl',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          width: 90
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          width: 90
        },
        {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          width: 200
        },
        {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          width: 200
        },
        {
          title: '重量' + '(g)',
          key: 'goodsWeight',
          align: 'center',
          width: 90
        },
        {
          title: '长宽高' + '(cm)',
          key: 'inventoryNumber',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', {}, [
              h('span', {}, params.row.goodsLength
                ? params.row.goodsLength
                : '0'),
              h('span', {}, '*'),
              h('span', {}, params.row.goodsWidth
                ? params.row.goodsWidth
                : '0'),
              h('span', {}, '*'),
              h('span', {}, params.row.goodsHeight
                ? params.row.goodsHeight
                : '0')
            ]);
          }
        },
        {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          width: 130
        },
        {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center',
          width: 100
        }
      ]
      let numList = [
        {
          title: '库存数量',
          key: 'inventoryNumber',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('span', params.row.inventoryNumber || 0);
          }
        },
        {
          title: '分配数量',
          key: 'allottedNumber',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('span', params.row.allottedNumber || 0);
          }
        },
        {
          title: '冻结数量',
          key: 'frozenNumber',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('span', params.row.frozenNumber || 0);
          }
        },
        {
          title: '不良品数量',
          key: 'defectiveNumber',
          align: 'center',
          width: 110,
          render: (h, params) => {
            return h('span', params.row.defectiveNumber || 0);
          }
        },
        {
          title: '可用数量',
          key: 'availableNumber',
          align: 'center',
          width: 90,
          render: (h, params) => {
            return h('span', params.row.availableNumber || 0);
          }
        }
      ];
      let endList = [
        {
          title: '商品状态',
          key: 'inventoryNumber',
          align: 'center',
          width: 90,
          render: (h, params) => {
            let text = ''
            productData.productStatus.forEach(item => {
              if (params.row.status === item.value) {
                text = item.label;
              }
            })
            return h('span', {}, text);
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 100,
          renderHeader: (h, params) => {
            let name = this.operatorChange;
            if (v.multiple && (name != '操作')) {
              return h('Button', {
                props: {
                  type: name == '全部选择' ? 'primary' : 'warning',
                  size: 'small',
                },
                on: {
                  click() {
                    if (name === '全部选择') {
                      v.data.forEach((k, i) => {
                        if (!k.isDisabledBtn && !k.lightStatus) {
                          // 组合产品的检验
                          if (!v.combinationSku(k)) return;
                          v.$set(v.data[i], 'lightStatus', true);
                          // 选择多个
                          if (v.ctrl) {
                            v.saveSelectMore.push(k);
                          } else {
                            let key = k.inventoryId ? 'inventoryId' : 'goodsId';
                            let inventoryId = v.saveSelectMore.map(val => val[key]);
                            if (inventoryId.indexOf(k[key]) === -1) {
                              v.saveSelectMore.push(k);
                            }
                          }
                        }
                      })
                    }
                    if (name === '全部取消') {
                      v.data.forEach((k, i) => {
                        if (!k.isDisabledBtn && k.lightStatus) {
                          v.$set(v.data[i], 'lightStatus', false);
                          let key = k.inventoryId ? 'inventoryId' : 'goodsId';
                          let goodsId = v.saveSelectMore.map(val => val[key]);
                          if (goodsId.indexOf(k[key]) > -1) {
                            v.saveSelectMore.splice(goodsId.indexOf(k[key]), 1);
                          }
                        }
                      })
                    }
                  }
                }
              }, name)
            } else {
              return h('span', '操作');
            }
          },
          render: function (h, params) {
            return h('div', {
              style: {
                display: 'flex',
                justifyContent: 'center'
              }
            }, [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small',
                  // disabled: v.diableBtn(params.row),
                  disabled: params.row.isDisabledBtn,
                },
                style: {
                  display: !params.row.lightStatus ? 'block' : 'none'
                },
                on: {
                  click() {
                    //  是否支持选择多个
                    if (!v.multiple && v.saveSelectMore.length > 0) {
                      v.$Message.error('只能选择一个商品，如需选择其他商品，请取消已选中的再操作');
                      return;
                    }
                    // 组合产品的检验
                    if (!v.combinationSku(params.row)) return;
                    v.data[params.index].lightStatus = !params.row.lightStatus;
                    // 选择多个
                    if (v.ctrl) {
                      v.saveSelectMore.push(params.row);
                    } else {
                      let key = params.row.inventoryId ? 'inventoryId' : 'goodsId';
                      let inventoryId = v.saveSelectMore.map(val => val[key]);
                      if (inventoryId.indexOf(params.row[key]) === -1) {
                        v.saveSelectMore.push(params.row);
                      }
                    }
                  }
                }
              }, '选择'),
              h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                style: {
                  display: params.row.lightStatus ? 'block' : 'none'
                },
                on: {
                  click() {
                    v.data[params.index].lightStatus = !params.row.lightStatus;
                    let key = params.row.inventoryId ? 'inventoryId' : 'goodsId';
                    let goodsId = v.saveSelectMore.map(val => val[key]);
                    if (goodsId.indexOf(params.row[key]) > -1) {
                      v.saveSelectMore.splice(goodsId.indexOf(params.row[key]), 1);
                    }
                  }
                }
              }, '取消')
            ]);
          }
        }
      ]
      let list = [...startList];

      // 普通产品
      if (v.productData.isAssemble === 0) {
        list.push(...numList);
      }
      list.push(...endList);
      // 查询所有产品时 不需要批次号和库位
      if (v.from) list.splice(8, 2);
      return list;
    },
    operatorChange() {
      let name = '全部选择';
      // 全部已选择(是否存在未选择)
      let checkedList = this.data.filter(k => {
        return !k.lightStatus && !k.isDisabledBtn;
      })
      if (!checkedList.length) name = '全部取消';
      // console.log(checkedList, 'checkedList');
      // 全部不可选(是否存在可选行)
      let unDisabledList = this.data.filter(k => {
        return !k.isDisabledBtn;
      })
      // console.log(unDisabledList, 'unDisabledList');
      if (!unDisabledList.length) name = '操作';
      return name;
    }
  },
  methods: {
    getList() {
      let productData = this.productData || {};
      let goodsSkuName = productData.mulSkuName;
      [',', '，', '\n'].forEach(sp => {
        goodsSkuName = goodsSkuName.replace(sp, ',');
      })
      let obj = {
        productCategoryId: this.productCategoryId,
        warehouseId: this.getWarehouseId(),
        pageNum: productData.pageNum,
        pageSize: productData.pageSize,
        goodsSkuName: goodsSkuName,
        // 获取到产品的列表
        selectedProductGoodsIds: this.eliminateData.map(val => val.productGoodsId).filter(id => !this.$common.isEmpty(id)),
        isAssemble: productData.isAssemble,
        selectedInventoryIds: this.eliminateData.map(val => val.inventoryId).filter(id => !this.$common.isEmpty(id))
      };
      if (this.queryTagInfo) obj.queryTagInfo = this.queryTagInfo;// 返回sku条码编码
      // 海外仓
      if (this.isFba) {
        obj.likeFlag = productData.hasInventory == 1 ? '1' : '0';// 模糊搜索
        // 普通产品
        if (productData.isAssemble === 0) {
          obj.hasInventory = productData.hasInventory === 0 ? 1 : null;
        }
      } else {
        obj.likeFlag = productData.single ? '1' : '0';// 模糊搜索
      }

      // get_inWareGoodsList: 入库单; get_outStockProduct: 出库单;
      let apiUrl = ['inware', 'allGoods'].includes(this.from) ? api.get_inWareGoodsList : api.get_outStockProduct;
      this.loading = true;
      this.axios.post(apiUrl, obj).then(({ data }) => {
        if (data.code === 0) {
          let list = data.datas && data.datas.list ? data.datas.list : [];
          this.data = list.map(val => {
            val.isDisabledBtn = this.diableBtn(val);
            val.lightStatus = false;
            return val;
          })
          this.tableItemTotal = data.datas && data.datas.total ? data.datas.total : 0;
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    // 获取树形结构数据
    getTreeData() {
      let obj = { allFlag: '1' };
      this.axios.post(api.categoryList, obj).then(res => {
        if (res.data.code === 0) {
          let objList = res.data.datas;
          let arr = this.changeChildToChildren(objList);
          this.treeData = [
            {
              title: '全部',
              expand: true,
              code: '',
              children: arr
            }
          ];
        }
      });
    },
    // 点击分类
    clickNode(val) {
      this.productCategoryId = val[0].code;
      this.getList();
    },
    // 分类树递归
    changeChildToChildren(childList) {
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
    pageNumChange(num) {
      this.productData.pageNum = num;
      this.getList();
    },
    pageSizeChange(size) {
      this.productData.pageSize = size;
      this.getList();
    },
    ok() {
      // 添加成功派发
      if (this.saveSelectMore && this.saveSelectMore.length > 0) {
        this.$emit('addProductSuccess', this.$common.copy(this.saveSelectMore));
      } else {
        this.$Message.info('未选择数据');
      }
    },
    cancel() {
      // 取消后派发
      this.$emit('addProductCancel', false);
    },
    search() {
      this.productData.pageNum = 1;
      this.getList();
    },
    closeTag(item, index) {
      if (!this.ctrl) {
        let id = item.goodsId
          ? item.goodsId
          : item.inventoryId;
        let datasId = this.data.map(val => val.goodsId
          ? val.goodsId
          : val.inventoryId);
        if (datasId.indexOf(id) > -1) {
          this.data[datasId.indexOf(id)].lightStatus = false;
        }
      } else {
        let id = item.warehouseLocationId + item.receiptBatchNo + item.inventoryId;
        let datasId = this.data.map(val => val.warehouseLocationId + val.receiptBatchNo + val.inventoryId);
        if (datasId.indexOf(id) > -1) {
          this.data[datasId.indexOf(id)].lightStatus = false;
        }
      }
      this.saveSelectMore.splice(index, 1);
    },
    changeExpand(data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },
    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree() {
      this.showTree = !this.showTree;
      this.treeData = this.treeChangeExpand(this.treeData, this.showTree);
    },
    // 递归给树设置expand
    treeChangeExpand(treeData, flag) {
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], 'expand', flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    },
    // 检验组合产品下的子sku库存是否存在
    combinationSku(row) {
      // 是否是海外仓出库单是否组合产品 isAssemble
      if (this.isFba && row.isAssemble == 1 && row.wmsInventoryProductResult && row.wmsInventoryProductResult.length) {
        let availableNumberFlag = '';
        row.wmsInventoryProductResult.forEach(k => {
          !k.availableNumber && !availableNumberFlag && (availableNumberFlag = k.goodsSku);
        })
        if (availableNumberFlag) {
          this.$Message.error({
            content: `组合产品下的子产品${availableNumberFlag}库存为0`,
            duration: 5
          });
          return false;
        }
        return true;
      } else {
        return true;
      }
    },
    // 按钮是否高亮
    diableBtn(params) {
      let path = this.$route.path;
      let { pickingFlag, isAssemble, assembleGoodsList } = params || {};
      let [availableFlag, defectiveFlag, frozenNumberFlag] = [false, false, false];
      // 组合产品
      if (isAssemble == 1 && Array.isArray(assembleGoodsList) && assembleGoodsList.length) {
        // 组合产品的sku全部都有库存显示可选择按钮，否则置灰
        assembleGoodsList.forEach(k => {
          !k.availableNumber && (availableFlag = true);
          !k.defectiveNumber && (defectiveFlag = true);
          !k.frozenNumber && (frozenNumberFlag = true);
        })
      } else {
        // availableNumber:可用数量;defectiveNumber:不良品数量;frozenNumber:冻结数量;
        let { availableNumber, defectiveNumber, frozenNumber } = params || {};
        availableFlag = availableNumber === 0 || !availableNumber;// 可用数量
        defectiveFlag = defectiveNumber === 0 || !defectiveNumber;// 不良品数量
        frozenNumberFlag = frozenNumber === 0 || !frozenNumber;// 冻结数量
      }
      // pathFlag：库位标志类型(0收货库位,1拣货库位,2异常库位,3不良品库位);
      // 库存移动:'/inventoryMove';库存调整:'/inventoryAdjust';
      let pathFlag = pickingFlag === '0' && ['/inventoryMove', '/inventoryAdjust'].includes(path);
      let freezeFlag = (path === '/inventoryFreeze') && availableFlag;// 库存冻结:'/inventoryFreeze'
      return !!((this.disabledSlt && availableFlag && defectiveFlag && frozenNumberFlag) || pathFlag) || freezeFlag;
    }
  }
};
</script>

<style lang="less">
.addProductModal {
  .position-sticky{
    position: sticky;
    top: 0;
  }
  .text-tags {
    height: 100px;
    padding: 10px 10px;
    font-size: 16px;
    font-weight: 600;

    .ivu-icon-ios-close {
      color: #666 !important;
    }
  }

  .btnGroup {
    position: absolute;
    right: 2px;
    bottom: 10px;
  }

  .ivu-checkbox-wrapper {
    display: inline-block;
  }

  .ivu-modal-footer {
    display: none;
  }

  .productData-form {
    .ivu-form-item {
      margin-bottom: 20px;
    }

    .ivu-form-item-content {
      width: 200px;
    }
  }

  .product-content {
    display: flex;
    align-items: top;
    height: 500px;

    .category-left {
      width: 300px;
      overflow: hidden;
    }

    .table-right {
      flex: 1;
      overflow: hidden;
    }

    .table-main {
      height: 100%;
      //   display: flex;
      //   flex-direction: column;
      padding: 0 0 0 10px;
      //   .tables {
      //     flex: 1;
      //     overflow: hidden;
      //   }
    }
  }
}
</style>
