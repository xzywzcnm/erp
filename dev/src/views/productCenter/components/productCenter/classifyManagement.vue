<template >
  <div class="labelCont">
    <div class="categoryCont">
      <div class="treeCont">
        <!-- 树形菜单 -->
        <div class="categoryTree">
          <div style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;" v-if="categoryTree.length>0" @click="exchangeTree">{{ showTree ? '全部收起' : '全部展开' }}
          </div>
          <Tree ref="categoryTree" :load-data="loadData" :data="categoryTree" @on-select-change="view" @on-toggle-expand="changeExpand" @on-check-change="checkDateHandel"></Tree>
          <Spin v-if="loading3" fix></Spin>
        </div>
        <div class="categoryBtn">
          <Button :disabled="!viewMode || productCategory.productCategoryId == null || productCategory.productCategoryId == -1" type="primary" icon="edit" @click="edit">编辑 </Button>
          <Button :disabled="!viewMode || productCategory.productCategoryId == null" type="primary" icon="md-add" @click="add">新增子分类 </Button>
          <Button :disabled="!viewMode || productCategory.productCategoryId == null || productCategory.productCategoryId == -1" type="primary" icon="trash-a" @click="delConfirm">删除 </Button>
          <div class="categoryBatchBtn">
            批量处理:
            <!-- <Button>删除</Button>-->
            <Button @click="exportCategory" v-if="getPermission('productCategory_export')">导出 </Button>
          </div>
        </div>

      </div>
      <!-- 分割线 -->
      <div class="line"></div>
      <!-- 详细信息 -->
      <div class="categoryDetail">
        <Form ref="productCategory" :model="productCategory" :label-width="95" label-position="left">
          <Form-item label="分类ID" :rules="{ required: true, message:'分类ID不能为空', trigger: 'blur' }" prop="productCategoryCode">
            <Input style="width:300px" :maxlength="50" v-model.trim="productCategory.productCategoryCode" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="分类中文名称" :rules="{ required: true,validator:cnameValidator,  trigger: 'blur' }" prop="cnName">
            <Input style="width:300px" :maxlength="50" v-model.trim="productCategory.cnName" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="分类英文名称" prop="enName">
            <Input style="width:300px" :maxlength="100" v-model.trim="productCategory.enName" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="尺码类型" prop="sizeType">
            <dyt-select style="width:300px" v-model="productCategory.sizeType" :disabled="viewMode">
              <Option v-for="(item,key) in sizeList" :value="item.sizeTypeId" :key="key">{{ item.typeName }}</Option>
            </dyt-select>
          </Form-item>
          <Form-item label="报关编码" prop="hsCode">
            <Input style="width:300px" :maxlength="30" v-model.trim="productCategory.hsCode" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="中文报关名称" prop="cnHsName">
            <Input style="width:300px" :maxlength="200" v-model.trim="productCategory.cnHsName" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="英文报关名称" prop="enHsName">
            <Input style="width:300px" :maxlength="200" v-model.trim="productCategory.enHsName" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="描述" prop="description">
            <Input type="textarea" :autosize="{ minRows: 3, maxRows: 5 }" style="width:300px" :maxlength="500" v-model.trim="productCategory.description" :disabled="viewMode"></Input>
          </Form-item>
          <Form-item label="绑定属性" prop="attributeId">
            <dyt-select clearable filterable v-model="productCategory.attributeId" :disabled="viewMode || !getPermission('queryProductCategoryProductAttribute')" style="width: 300px;">
              <template v-for="(item, index) in attributeList">
                <Option v-if="item" :value="item.classificationId" :key="`${index}`">{{item.classificationName}}</Option>
              </template>
            </dyt-select>
          </Form-item>

          <Form-item label="绑定质检分类" prop="classifyId">
            <dyt-select placement='top' clearable filterable v-model="productCategory.qualityClassificationId" :disabled="viewMode || !getPermission('queryProductCategoryProductAttribute')" style="width: 300px;">
              <template v-for="(item, index) in classifyList">
                <Option v-if="item" :value="item.qualityClassificationId" :key="`${index}`">{{item.qualityClassification}}</Option>
              </template>
            </dyt-select>
          </Form-item>

          <FormItem v-if="!viewMode">
            <Button type="primary" @click="save()">保存 </Button>
            <Button @click="cancel()" style="margin-left: 8px">取消 </Button>
          </FormItem>
        </Form>
      </div>
    </div>
    <delConfirmModal ref="delConfirmModal" @ok="del"></delConfirmModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import delConfirmModal from './delConfirmModal';

export default {
  mixins: [Mixin, productMixin],
  components: {
    delConfirmModal: delConfirmModal
  },
  data () {
    let v = this;
    return {
      attributeList: [],
      classifyList: [], // 质检分类
      showTree: true,
      loading3: false,
      selectedNode: [],
      viewMode: true, // 是否查看模式
      checkedTreeDate: [], // 已选择树分类
      selectedProductCategory: null, // 当前选中的分类
      productCategory: { // 分类表单模型
        productCategoryCode: null,
        cnName: null,
        enName: null,
        sizeType: null,
        hsCode: null,
        cnHsName: null,
        enHsName: null,
        description: null,
        attributeId: '',
        productCategoryId: -1,
        qualityClassificationId: ''// 质检分类id
      },
      oldProductCategory: {},
      categoryTree: [ // 分类树
        {
          title: '全部分类',
          expand: true,
          productCategoryId: -1,
          render (h, { root, node, data }) {
            return h('span', {
              class: 'hover-color-ccc',
              on: {
                'click' () {
                  v.selectedNode = data;
                  v.productCategory.productCategoryId = -1;
                  v.view([data]);
                }
              }
            }, '全部分类');
          },
          children: []
        }
      ],
      nameToObject: {},
      sizeList: []
    };
  },
  created: function () {

  },
  methods: {
    cnameValidator (rule, value, callback) {
      if (this.productCategory.cnName === '') {
        return callback(new Error('分类中文名称不能为空'));
      } else if (this.productCategory.cnName.indexOf('->') > -1) { // 不能包含->特殊字符
        return callback(new Error('不能包含->特殊字符'));
      } else {
        callback();
      }
    },
    checkDateHandel (data) {
      let v = this;
      v.checkedTreeDate = data;
    },
    exportCategory () {
      let v = this;
      v.axios.post(api.export_productCategory).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success('导入成功');
        }
      }).catch(() => {
      });
    },
    save () { // 保存
      let self = this;
      let v = this;
      let currentNode = self.selectedNode;
      let productCategoryId = self.productCategory.productCategoryId;
      // 编辑
      if (productCategoryId) {
        self.$refs.productCategory.validate((valid) => {
          if (!valid) return;
          const hand = {
            infoSave: () => {
              self.axios.put(api.edit_productCategory, self.productCategory).then(response => {
                if (response.data.code === 0) {
                  for (let key in self.productCategory) {
                    self.$set(currentNode, key, self.productCategory[key]);
                  }
                  self.viewMode = true;
                  self.getList('update');
                  self.$Message.success('更新成功');
                  this.oldProductCategory = this.deepCopy(self.productCategory);
                }
              });
            }
          }
          if (this.oldProductCategory.attributeId && this.oldProductCategory.attributeId != this.productCategory.attributeId) {
            this.$Modal.confirm({
              title: '提示',
              content: '<p>操作存在风险，是否确认操作？</p>',
              onOk: () => {
                hand.infoSave();
              },
              onCancel: () => { }
            });
          } else {
            hand.infoSave();
          }
        });
        // 新增
      } else {
        self.productCategory.parentId = (currentNode.productCategoryId !== -1) ? currentNode.productCategoryId : null;
        self.$refs.productCategory.validate((valid) => {
          if (valid) {
            self.axios.post(api.add_productCategory, self.productCategory).then(response => {
              if (response.data.code === 0) {
                self.getList('update');
                const children = currentNode.children || [];
                self.productCategory.expand = true;
                let { ...newCategory } = self.productCategory;
                newCategory.productCategoryId = response.data.datas;
                newCategory.render = (h, { root, node, data }) => {
                  return h('span', [
                    h('span', {
                      style: {
                        color: 'red',
                        cursor: 'pointer'
                      }
                    }, '('), h('span', {
                      class: 'hover-underline',
                      style: {
                        color: 'red',
                        cursor: 'pointer'
                      },
                      on: {
                        'click' () {
                          v.$router.push({
                            path: '/productGoods',
                            query: {
                              categoryId: data.productCategoryId
                            }
                          });
                        }
                      }
                    }, 0), h('span', {
                      style: {
                        color: 'red',
                        cursor: 'pointer'
                      }
                    }, ')'), h('span', {
                      class: 'hover-color-ccc',
                      on: {
                        'click' () {
                          v.selectedNode = data;
                          v.productCategory.productCategoryId = data.productCategoryId;
                          v.view([data]);
                        }
                      }
                    }, data.cnName)
                  ]);
                };
                children.unshift(newCategory);
                self.$set(currentNode, 'children', children);
                self.$refs['productCategory'].resetFields();
                this.view([]);
                var { ...rowData } = currentNode;
                self.productCategory = rowData;
                self.viewMode = true;
                self.$Message.success('新增成功');
              }
            });
          }
        });
      }
    },
    cancel () { // 取消
      this.$refs['productCategory'].resetFields();
      var { ...rowData } = this.selectedNode;
      this.productCategory = rowData;
      this.viewMode = true;
    },
    getList () { // 获取列表数据
      this.getTypelist();

      let self = this;
      if (self.$store.state.category) {
        self.categoryTree[0].children = self.$store.state.category;
        return;
      }
      self.loading3 = true;
      this.axios.get(api.get_productCategory, { hiddenError: true }).then(resa => {
        self.loading3 = false;
        if (resa.data.code === 0) {
          // self.categoryTree[0].children = self.toTree(resa.data.datas, 'productCategoryNavigation', '->');
          self.categoryTree[0].children = self.toTree(resa.data.datas);
          self.$store.commit('category', self.categoryTree[0].children);
          self.axios.get(api.get_tagProductCount).then(resb => {
            if (resb.data.code === 0) {
              resa.data.datas.forEach(i => {
                resb.data.datas.forEach(j => {
                  if (i.productCategoryId === j.productCategoryId) {
                    i.categoryCount = j.productCount;
                  }
                });
              });
              self.$store.commit('category', self.categoryTree[0].children);
            }
          });
        }
      });
    },
    recursionCount (data) {
      let v = this;
      data.forEach(i => {
        if (i.children && i.children.length > 0) {
          i.categoryCount = i.children.reduce((b, j) => {
            return b + j.categoryCount;
          }, 0);
          v.recursionCount(i.children);
        }
      });
    },
    // toTree (arr, key, Identification) {
    toTree (arr) {
      // let newArr = [];
      let v = this;
      let treeJson = {};
      let parentIdList = arr.filter(item => {
        treeJson[item.productCategoryId] = item;
        if (!item.parentId) {
          item.children = [];
          return true;
        }
        return false;
      });
      arr.forEach(i => {
        // let matchName; // 最后一个name
        // let name = i[key]; // 用来判断的值 =>分割
        // if (name.lastIndexOf(Identification) > -1) {
        //   matchName = name.slice(0, name.lastIndexOf(Identification));
        // } else {
        //   matchName = name;
        //   newArr.push(i);
        // }
        if (i.parentId && treeJson[i.parentId]) {
          if (treeJson[i.parentId].children) {
            treeJson[i.parentId].children.push(i);
          } else {
            treeJson[i.parentId].children = [i];
          }
        }
        if (!i.categoryCount) {
          i.categoryCount = 0;
        } else {
          if (i.children) {
            i.categoryCount = i.children.reduce((a, b) => {
              return b.categoryCount + a;
            }, 0);
          } else {
            i.categoryCount = i.categoryCount;
          }
        }
        i.render = (h, { root, node, data }) => {
          return h('span', [
            h('span', {
              style: {
                color: 'red',
                cursor: 'pointer'
              }
            }, '('), h('span', {
              class: 'hover-underline',
              style: {
                color: 'red',
                cursor: 'pointer'
              },
              on: {
                'click' () {
                  v.$router.push({
                    path: '/productGoods',
                    query: {
                      categoryId: data.productCategoryId
                    }
                  });
                }
              }
            }, data.categoryCount), h('span', {
              style: {
                color: 'red',
                cursor: 'pointer'
              }
            }, ')'), h('span', {
              class: 'hover-color-ccc',
              on: {
                'click' () {
                  v.selectedNode = data;
                  v.productCategory.productCategoryId = data.productCategoryId;
                  v.view([data]);
                }
              }
            }, data.cnName)
          ]);
        };
        i.expand = true;
        // if (v.nameToObject[matchName]) {
        //   v.nameToObject[matchName].children.push(i);
        // }
        // v.nameToObject[name] = i;
        // v.nameToObject[name].children = [];
      });
      v.sizeTypeforCatergory(parentIdList);
      return parentIdList;
      // v.sizeTypeforCatergory(newArr);
      // return newArr;
    },
    // 子级分类根据母分类反显尺码类型
    sizeTypeforCatergory (list) {
      let a = (list, item) => {
        list.forEach(k => {
          if (item && (item.sizeType || item.sizeType === 0) && !(k.sizeType || k.sizeType === 0)) {
            k.sizeType = item.sizeType;
          }
          if (k.children && k.children.length) {
            a(k.children, k);
          }
        })
      }
      a(list);
    },
    view (selectedProductCategorys) { // 查看
      if (selectedProductCategorys.length === 0) {
        this.selectedProductCategory.selected = true;
      } else {
        this.productCategory = this.deepCopy(selectedProductCategorys[0]);
        this.selectedProductCategory = selectedProductCategorys[0];
        this.oldProductCategory = this.deepCopy(this.productCategory);
      }
      this.viewMode = true;
    },
    edit () { // 编辑
      if (this.getPermission('productCategory_update')) {
        this.view([]);
        this.viewMode = false;
        /* this.productCategory.productCategoryId = this.$refs.categoryTree.getSelectedNodes()[0].productCategoryId; */
      }
    },
    add () { // 新增
      if (this.getPermission('productCategory_insert')) {
        this.viewMode = false;
        this.productCategory = {};
        this.oldProductCategory = {};
      }
    },
    delConfirm () { // 删除确认
      if (this.getPermission('productCategory_delete')) {
        this.$refs.delConfirmModal.show();
      }
    },
    del () { // 删除
      let self = this;
      self.axios.delete(api.del_productCategory + self.productCategory.productCategoryId).then(response => {
        if (response.data.code === 0) {
          self.$Message.success('删除成功');
          let categoryData = this.selectedNode;
          self.removeTreeNode(null, categoryData);
          self.reset();
        }
        self.$refs.delConfirmModal.hide();
      });
    },
    reset () {
      this.productCategory = {
        productCategoryId: -1
      };
      this.categoryTree[0].selected = true;
    },
    removeTreeNode (parent, categoryData) { // 删除选择节点
      let self = this;
      parent = (parent !== null ? parent : self.categoryTree[0]);

      if (parent.productCategoryId === (categoryData.parentId == null ? -1 : categoryData.parentId)) {
        const index = parent.children.indexOf(categoryData);
        parent.children.splice(index, 1);
        self.$set(parent, 'children', parent.children);
        return;
      }

      let children = parent.children;

      for (let i = 0; i < children.length; i++) {
        let item = children[i];

        if (item.productCategoryId === categoryData.parentId) {
          const index = item.children.indexOf(categoryData);
          item.children.splice(index, 1);
          self.$set(item, 'children', item.children);
          break;
        }

        if (item.children && item.children.length > 0) {
          self.removeTreeNode(item, categoryData);
        }
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
    },
    // 获取属性分类
    productAttribute () {
      this.attributeList = [];
      this.axios.get(api.get_productAttribute).then(res => {
        if (res.data.code == 0 && res.data.datas) {
          this.attributeList = res.data.datas;
        }
      })
    },
    // 获取质检分类
    getClassifyId () {
      this.classifyList = [];
      this.axios.post(api.queryClassifyList, { pageNum: 1, pageSize: 100, qualityClassification: null, qualityProject: null }).then(res => {
        // 对分类id相同的数据作处理
        let arr = res.data.datas.list
        arr = arr.map(item => {
          const i = arr.find(_item => item.qualityClassificationId === _item.qualityClassificationId);
          if (i !== item) {
            i.qualityProjectId.push(item.qualityProjectId);
            i.qualityProject.push(item.qualityProject);
            return undefined;
          } else {
            i.qualityProjectId = [i.qualityProjectId];
            i.qualityProject = [i.qualityProject];
            return i;
          }
        }).filter(item => item !== undefined);
        this.classifyList = arr
      })
    },
    // 获取尺码类型
    getTypelist () {
      this.axios
        .get(api.queryProductSizeTypeList, { hiddenError: true })
        .then(({ data }) => {
          if (data.code === 0) {
            this.sizeList = data.datas || [];
          }
        })
    }
  },
  activated () {
    var self = this;
    self.selectedProductCategory = self.categoryTree[0];
    self.$Loading.start();
    Promise.resolve(self.getPermission('productCategory_queryAll') ? self.getList('init') : self.gotoError()).then(() => {
      self.$Loading.finish();
    });
    // 获取属性分类
    this.productAttribute();
    // 获取质检分类
    this.getClassifyId()
  },
  watch: {
    'productCategory.cnName': function (n, o) {
      this.productCategory.title = n;
    }
  }
};
</script>

<style>
.hover-color-ccc {
  cursor: pointer;
  padding: 0 4px;
}

.hover-color-ccc:hover {
  background-color: #d5e8fc;
}
</style>
