<template>
  <div class='addProductModal'>
    <Row style='background-color: rgb(242, 242, 242);overflow-y: scroll'>
      <Col span='18'>
        <div class='text'>
          <span>已选择：</span>
          <Tag
            closable
            color="blue"
            v-for='(v,i) in saveSelectMore'
            :key='i'
            @on-close='closeTag(v,i)'>{{ v.cnName }}
          </Tag>
        </div>
      </Col>
      <Col span='6' class="position-sticky">
        <div style='position: relative;width: 88%;height: 100px;'>
          <div class="tags"></div>
          <div class="btnGroup">
            <Button type='primary' @click='ok' style='margin-right: 10px'>确定</Button>
            <Button @click='cancel'>取消</Button>
          </div>
        </div>
      </Col>
    </Row>
    <div style='padding-top: 20px'>
      <Form ref="pageParams" :model="pageParams" :label-width="90" class="form-search-content">
        <FormItem label="SPU" prop="spuList" class="form-item-flex" v-if="!['FBA'].includes(type)">
          <dyt-input-tag
            v-if="pageParams.spuFuzzySearch != 1"
            v-model="pageParams.spuList"
            :limit="1"
            placeholder="请输入SPU，多个用逗号或换行分隔"
            type="textarea"
          />
          <Input
            v-else
            v-model="pageParams.spuSearchValue"
            placeholder="请输入SPU"
          />
          <Button
            @click="inputSwitch('spuFuzzySearch', pageParams.spuFuzzySearch == 1 ? 0 : 1)"
          >{{ pageParams.spuFuzzySearch != 1 ? '精准' : '模糊' }}</Button>
        </FormItem>
        <FormItem label="SKU" prop="skuList" class="form-item-flex" v-if="!['FBA'].includes(type)">
          <dyt-input-tag
            v-if="pageParams.skuFuzzySearch != 1"
            v-model="pageParams.skuList"
            :limit="1"
            placeholder="请输入SKU，多个用逗号或换行分隔"
            type="textarea"
          />
          <Input
            v-else
            v-model="pageParams.skuSearchValue"
            placeholder="请输入SKU"
          />
          <Button
            @click="inputSwitch('skuFuzzySearch', pageParams.skuFuzzySearch == 1 ? 0 : 1)"
          >{{ pageParams.skuFuzzySearch != 1 ? '精准' : '模糊' }}</Button>
        </FormItem>
        <FormItem label="搜索字符" prop="skuList" class="form-item-flex border-set-radius" v-if="['FBA'].includes(type)">
          <Input
            :placeholder='searchplaceholder'
            style='width: 200px;'
            v-model.trim='sku'
          />
          <Checkbox v-model="fuzzySearch" class="ml10">模糊搜索</Checkbox>
        </FormItem>
        <FormItem :label-width="0" class="ml10 width-auto">
          <Button type='primary' @click='search'>搜索</Button>
        </FormItem>
      </Form>
      <!-- <span style='font-size: 14px;'>搜索字符：</span> -->
    </div>
    <div style='height: 500px'>
      <Row>
        <Col span='5' v-if='categoryOption'>
          <Card dis-hover style='overflow-x: scroll;height: 460px;overflow-y: scroll;'>
            <div
              style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
              v-if="treeData.length>0"
              @click="exchangeTree">{{ showTree ? '全部收起' : '全部展开' }}
            </div>
            <Tree :data="treeData" @on-toggle-expand="changeExpand" @on-select-change='clickNode'></Tree>
          </Card>
        </Col>
        <Col :span='categoryOption ? "18" : "23"' style='margin-left: 10px;margin-top: -9px'>
          <Table
            highlight-row border
            :columns="columns"
            :loading="Tableloading"
            :data="proData"
            style='margin-top: 10px'
            height='460'
            class="data-table-view"
          />
          <!--分页-->
          <div class='fr pages'>
            <Page
              :total="tableItemTotal"
              :current='pageNum'
              show-total
              show-sizer
              show-elevator
              style='margin-top: 10px'
              :page-size="pageSize"
              :page-size-opts='[10, 20, 50, 100]'
              @on-change='pageNumChange'
              @on-page-size-change='pageSizeChange'></Page>
          </div>
        </Col>
      </Row>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    onlyChoseOne: {
      default: false // 只能选择一个
    },
    warehouseId: {
      default: null
    },
    categoryOption: {
      default: true
    },
    eliminateData: {
      default: null
    },
    from: {
      default: null
    }, // 移动添加商品不需要控制相同sku不能添加
    ctrl: {
      default: false
    },
    type: {
      default: null
    }
  },
  data() {
    let v = this;
    return {
      showTree: true,
      Tableloading: false,
      sku: '',
      fuzzySearch: false,
      searchplaceholder: 'SKU',
      productCategoryId: '',
      pageNum: 1,
      pageSize: 100,
      tableItemTotal: 0,
      single: true,
      treeData: [],
      saveSelectMore: [],
      pageParams: {
        spuList: [],
        skuList: [],
        spuSearchValue: null,
        skuSearchValue: null,
        spuFuzzySearch: 0,
        skuFuzzySearch: 0,
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 50,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return v.tableImg(h, params, 'imgUrl');
          }
        }, {
          title: 'SKU',
          key: 'sku',
          width: 110,
          align: 'center'
        }, {
          title: 'SKU属性',
          key: 'productGoodsSpecifications',
          width: 170,
          align: 'center',
          render(h, params) {
            let text = '';
            if (params.row.productGoodsSpecifications) {
              text = [];
              text = params.row.productGoodsSpecifications.map(i => {
                return i.name + ':' + i.value;
              }).join(',');
            }
            return h('span', text);
          }
        }, {
          title: '中文描述',
          key: 'cnName',
          align: 'center',
          minWidth: 150
        }, {
          title: '英文描述',
          key: 'enName',
          minWidth: 150,
          align: 'center',
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 90,
          renderHeader: (h, { column }) => {
            // 单选情况
            if (this.onlyChoseOne) return h('div', {}, column.title);
            let lightStatus = [];
            this.proData.forEach(tRow => {
              if (this.$common.isBoolean(tRow.lightStatus) && tRow.lightStatus) {
                lightStatus.push(tRow.lightStatus);
              }
            });
            const isCheckAll = lightStatus.length == this.proData.length && this.proData.length > 0;
            // 多选情况
            return h('div', {
              class: 'td-item-flex'
            }, [
              h('div', {}, column.title),
              h('Button', {
                class: 'ml5',
                props: {
                  type: isCheckAll ? 'warning' : 'primary',
                  size: 'small',
                  disabled: this.proData.length <= 0
                },
                on: {
                  click: () => {
                    this.tableCheckAllData(isCheckAll);
                  }
                }
              }, isCheckAll ? '取消' : '全选'),
            ]);
          },
          render: (h, params) => {
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
                  disabled: !!((v.disabledSlt && (params.row.availableNumber === 0 || !params.row.availableNumber)))
                },
                style: {
                  display: !params.row.lightStatus ? 'block' : 'none'
                },
                on: {
                  click() {
                    if (v.onlyChoseOne && v.saveSelectMore.length > 0) {
                      // 只能选择一个
                      v.$Message.error('只能选择一个');
                      return;
                    }
                    v.proData[params.index].lightStatus = !params.row.lightStatus;
                    // 选择多个
                    if (v.ctrl) {
                      v.saveSelectMore.push(params.row);
                    } else {
                      let goodsId = v.saveSelectMore.map(val => val.productGoodsId ? val.productGoodsId : val.producId);
                      if (goodsId.indexOf(params.row.productGoodsId ? params.row.productGoodsId : params.row.producId) === -1) {
                        v.saveSelectMore.push(params.row);
                      }
                    }
                  }
                }
              }, '选择'), h('Button', {
                props: {
                  type: 'warning',
                  size: 'small'
                },
                style: {
                  display: params.row.lightStatus ? 'block' : 'none'
                },
                on: {
                  click() {
                    v.proData[params.index].lightStatus = !params.row.lightStatus;
                    let goodsId = v.saveSelectMore.map(val => val.goodsId ? val.goodsId : val.inventoryId);
                    if (goodsId.indexOf(params.row.goodsId ? params.row.goodsId : params.row.inventoryId) > -1) {
                      v.saveSelectMore.splice(goodsId.indexOf(params.row.goodsId), 1);
                    }
                  }
                }
              }, '取消')
            ]);
          }
        }
      ],
      proData: []
    };
  },
  watch:{
    type:{
      handler(newVal, oldVal){
        if(newVal === 'spu'){
          this.columns[2] = {
            title: 'SPU',
            key: 'spu',
            width: 130,
            align: 'center'
          }
          this.columns.splice(3,1)
          this.searchplaceholder = 'spu'
        }
      },
      immediate: true
    }
  },
  created() {
    // this.getList();
    if (this.categoryOption) {
      this.getTreeData();
    }
    if (this.type === 'FBA') {
      this.searchplaceholder = 'asin';
      this.columns.splice(3, 0, {
        title: 'asin',
        key: 'asin',
        align: 'center'
      });
    }
    // 查询所有产品时 不需要批次号和库位
    if (this.from) {
      this.columns.splice(8, 2);
    }
  },
  methods: {
    getList() { // 获取到产品的列表
      if (this.Tableloading) return;
      this.Tableloading = true;
      let obj = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        productCategoryId: this.productCategoryId,
        productCategoryIds: this.$common.isEmpty(this.productCategoryId) ? [] : [this.productCategoryId],
        ...this.$common.copy(this.pageParams),
      };
      if (obj.spuFuzzySearch != 1) {
        delete obj.spuSearchValue;
      } else {
        obj.spuList = [];
      }
      if (obj.skuFuzzySearch != 1) {
        delete obj.skuSearchValue;
      } else {
        obj.skuList = [];
      }
      let goodsInfoUrl = api.categoryGoodsList;
      let newSku = this.sku;
      if (['FBA'].includes(this.type)) {
        obj.fuzzySearch = this.fuzzySearch ? 1 : 0;
        delete obj.spuList;
        delete obj.skuList;
        delete obj.spuFuzzySearch;
        delete obj.skuFuzzySearch;
        delete obj.spuFuzzySearch;
        delete obj.skuFuzzySearch;
        if (['FBA'].includes(this.type)) {
          if (!this.$common.isEmpty(newSku) && newSku.indexOf(' ') != -1) {
            newSku = newSku.replace(/\s+/g, ','); // 将空格或多个空格替换成','
          }
          // FBA 需要调另外的接口和多传入一个备货仓id
          if (this.$common.isEmpty(newSku)) {
            obj.asinList = null;
          } else {
            obj.asinList = newSku.indexOf(',') != -1 ? newSku.split(',') : [newSku];
          }
          obj.warehouseId = this.warehouseId;
          goodsInfoUrl = api.planFbaAddGoods;
          obj.skuList = obj.asinList;
        }
      }
      this.$nextTick(() => {
        this.axios.post(goodsInfoUrl, obj).then(res => {
          if (res && res.data && res.data.code === 0) {
            this.proData = this.processData(this.$common.copy(res.data.datas.list));
            this.tableItemTotal = res.data.datas.total;
            this.Tableloading = false;
            if (this.pageNum != res.data.datas.pageNum || this.pageSize != res.data.datas.pageSize) {
              this.$nextTick(() => {
                this.getList();
              });
            }
          }
        }).catch(() => {
          this.Tableloading = false;
        })
      });
    },
    getTreeData() { // 获取树形结构数据
      this.axios.get(api.allGoodsCategory).then(res => {
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
    clickNode(val) {
      if (this.$common.isEmpty(val) || this.$common.isEmpty(val[0].productCategoryId)) return;
      this.productCategoryId = val[0].productCategoryId;
      this.getList();
    },
    // 精准(模糊)输入切换
    inputSwitch (key, val) {
      this.pageParams[key] = val;
    },
    // 列表全选(取消全选)
    tableCheckAllData (isCheckAll) {
      let producId = '';
      if (isCheckAll) {
        let removeList = [];
        let checkId = [];
        // 已选择的商品ID
        this.saveSelectMore.forEach(f => {
          producId = f.productGoodsId || f.producId;
          if (!this.$common.isEmpty(producId)) {
            checkId.push(producId);
          }
        });
        // 将当前页码选择的数据筛选出来
        this.proData.forEach(row => {
          producId = row.productGoodsId || row.producId;
          row.lightStatus = false;
          if (!this.$common.isEmpty(producId) && checkId.includes(producId)) {
            removeList.push(producId);
          }
        });
        // 清空当前页选中的数据(其他页面不清空)
        this.saveSelectMore = this.saveSelectMore.filter(item => {
          producId = item.productGoodsId || item.producId;
          return !(!this.$common.isEmpty(producId) && removeList.includes(producId));
        });
        return;
      }
      let rowList = this.saveSelectMore;
      let isNull = false;
      this.proData.forEach(row => {
        isNull = !(this.disabledSlt && (row.availableNumber === 0 || !row.availableNumber));
        producId = row.productGoodsId || row.producId;
        // 过滤已添加的数据
        if (isNull && !this.$common.isEmpty(producId) && !rowList.includes(producId) && !row.lightStatus) {
          row.lightStatus = true;
          rowList.push(row);
        }
      });
      this.saveSelectMore = rowList;
    },
    // 树选择值改变时
    changeChildToChildren(childList) {
      childList.forEach(val => {
        val.title = val.cnName;
        val.children = [];
        val.expand = true;
        if (!val.parentId) {
          // 是根元素的hua ,不做任何操作,如果是正常的for-i循环,可以直接continue.
        } else {
          // 如果ele是子元素的话 ,把ele扔到他的父亲的child数组中.
          childList.forEach(item => {
            if (item.productCategoryId === val.parentId) {
              let childArray = item.children;
              if (!childArray) {
                childArray = [];
              }
              childArray.push(val);
              item.children = childArray;
            }
          });
        }
      });
      // 去除重复元素
      childList = childList.filter(ele => !ele.parentId);
      return childList;
    },
    // 处理是否选中
    processData(list) {
      const pGoodsIds = this.saveSelectMore.map(m => {
        return m.productGoodsId || m.producId;
      });
      let producId = '';
      list.forEach(row => {
        producId = row.productGoodsId || row.producId;
        if (this.$common.isEmpty(producId)) {
          row.lightStatus = false;
        } else {
          row.lightStatus = pGoodsIds.includes(producId);
        }
      });
      return list;
    },
    pageNumChange(num) {
      this.pageNum = num;
      this.getList();
    },
    pageSizeChange(size) {
      this.pageSize = size;
      this.getList();
    },
    ok() {
      if (this.saveSelectMore.length == 0) {
        this.$Message.warning('请选择商品！');
        return;
      }
      this.$emit('addProductSuccess', this.saveSelectMore);
      this.$parent.$parent.addProductModal = false;
    },
    cancel() {
      // this.$parent.$parent.addProductModal = false;
      this.$emit('addProductCancel', false);
    },
    search() {
      this.getList();
    },
    closeTag(item, index) {
      if (!this.ctrl) {
        let id = item.goodsId ? item.goodsId : item.inventoryId;
        let datasId = this.proData.map(val => val.goodsId ? val.goodsId : val.inventoryId);
        if (datasId.indexOf(id) > -1) {
          this.proData[datasId.indexOf(id)].lightStatus = false;
        }
      } else {
        let id = item.warehouseLocationId + item.receiptBatchNo + item.inventoryId;
        let datasId = this.proData.map(val => val.warehouseLocationId + val.receiptBatchNo + val.inventoryId);
        if (datasId.indexOf(id) > -1) {
          this.proData[datasId.indexOf(id)].lightStatus = false;
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
    }
  }
};
</script>

<style>
.text {
  height: 100px;
  padding: 10px 10px;
  font-size: 16px;
  font-weight: 600;
}

.btnGroup {
  position: absolute;
  right: 2px;
  bottom: 10px;
}

.addProductModal .ivu-checkbox-wrapper {
  display: inline-block;
}

.addProductModal .ivu-modal-footer {
  display: none;
}
</style>
<style lang="less" scoped>
.position-sticky{
  position: sticky;
  top: 0;
}
.form-search-content{
  :deep(.ivu-form-item) {
    margin-bottom: 10px;
    &.width-auto{
      .ivu-form-item-content{
        width: auto;
      }
    }
    display: inline-block;
    .ivu-form-item-content{
      width: 300px;
    }
  }
}
.form-item-flex{
  :deep(.ivu-form-item-content){
    display: flex;
    align-items: center;
    .ivu-btn{
      border-radius: 0 4px 4px 0;
      border-left: none;
      &:hover{
        border-color: #e3e5e8;
      }
      &:focus{
        box-shadow: none;
      }
    }
    .dyt-input-tag-content, .ivu-input-wrapper .ivu-input{
      border-radius: 4px 0 0 4px;
    }
  }
  &.border-set-radius{
    :deep(.ivu-form-item-content){
      .ivu-btn{
        border-radius: 4px;
      }
      .dyt-input-tag-content, .ivu-input-wrapper .ivu-input{
        border-radius: 4px;
      }
    }
  }
}
.data-table-view{
  :deep(.ivu-table){
    .td-item-flex{
      display: flex;
      align-items: center;
    }
  }
}
</style>