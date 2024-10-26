<template>
  <div class="labelCont">
    <div class="categoryCont">
      <Input v-model="keywordTree" placeholder="请输入关键词" style="width: 285px; margin: 20px 0 0 10px;" clearable @on-enter="inputEnter" />
      <div class="treeCont">
        <!-- 树形菜单 -->
        <div class="categoryTree">
          <Tree ref="categoryTree" :data="categoryTree" @on-select-change="view" :render="renderContent"></Tree>
        </div>
        <div class="categoryBtn" id="bbbb">
          <Button :disabled="operateStatus" type="primary" @click="edit" v-if="getPermission('messageFolder_updateFolderName')">编辑
          </Button>
          <Button :disabled="operateStatus" type="primary" icon="md-add" @click="add" v-if="getPermission('messageFolder_create')">新增子分类
          </Button>
          <Button style="marginRight:10px;" :disabled="operateStatus" type="primary" @click="delConfirm" v-if="getPermission('messageFolder_delete')">删除
          </Button>
          <Icon v-show="!operateStatus && upShowStatus" style="cursor:pointer;" title="上移" color="#fa8143" size="20" type="md-arrow-round-up" @click="upData" v-if="getPermission('messageFolder_changeOrder')" />
          <Icon v-show="!operateStatus && downShowStatus" size="20" style="cursor:pointer;" title="下移" color="#4fadd9" type="md-arrow-round-down" @click="downData" v-if="getPermission('messageFolder_changeOrder')" />
        </div>
      </div>
      <!-- 分割线 -->
      <div class="line"></div>
      <!-- 详细信息 -->
      <div class="categoryDetail">
        <Button type="primary" @click="addParentFold" v-if="getPermission('messageFolder_create')">添加
        </Button>
        <span style="marginLeft:20px;">(只能添加顶级父类文件夹)</span>
        <div class="parentFolder">
          <div style="marginBottom:40px;">
            <span>顶级父类文件夹目录名称：</span> <Input :disabled="addParentFoldStatus" :maxlength="30" style="width:210px;margin:15px 0;" v-model.trim="folderName"></Input>
            <Button :disabled="addParentFoldStatus" style="marginLeft:10px;" type="primary" @click="saveParentFold">保存
            </Button>
            <Button :disabled="addParentFoldStatus" style="marginLeft:10px;" @click="cancelParentFold">取消
            </Button>
          </div>
          <Divider />
          <div style="marginTop:40px;">
            <span>新增子类文件夹目录名称：</span> <Input :disabled="addFolderStatus" :maxlength="30" style="width:210px;margin:15px 12px;" v-model.trim="addFolderName"></Input> <br> <span>修改子类文件夹目录名称：</span> <Input :disabled="editFolderStatus" style="width:210px;margin:15px 12px;" v-model.trim="editFolderName"></Input>
            <Button :disabled="addFolderStatus && editFolderStatus" style="marginLeft:10px;" type="primary" @click="save">保存
            </Button>
            <Button :disabled="addFolderStatus && editFolderStatus" style="marginLeft:10px;" @click="cancel">取消
            </Button>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除 -->
    <Modal v-model="delTempModal" title="删除" v-if="delTempModalStatus" @on-ok="delTempOK">
      <div style="margin: 20px;fontSize: 14px;">
        <p>确认删除?</p>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      keywordTree: '',
      platformId: 'ebay', // 暂时写死
      updateStatus: false, // 刷新数据
      selectedProductCategory: null, // 当前选中的分类
      categoryTree: [],
      folderName: null, // 新增父级文件夹name
      addFolderName: null, // 新增子类文件夹name
      editFolderName: null, // 修改子级文件夹name
      operateStatus: true, // 操作控制
      addParentFoldStatus: true, // 添加顶级父类文件夹状态控制
      addFolderStatus: true, // 添加子级分类状态
      editFolderStatus: true, // 编辑状态
      viewStatus: null,
      delTempModal: false, // 删除
      delTempModalStatus: false,
      upShowStatus: false,
      downShowStatus: false,
      treeData: [],
      talgItemId: ''
    };
  },
  methods: {
    getList () { // 获取模板分类树
      let v = this;
      v.axios.get(api.get_folder + '?platformId=' + v.platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.treeData = data;
          if (data) {
            let treeData = v.toTree(data, null);
            v.toLastLength(treeData);
            v.categoryTree = treeData;
          }
        }
      });
    },
    toLastLength (data) {
      data[data.length - 1].lastChild = true;
      data.forEach(i => {
        if (i.children && i.children.length > 0) {
          this.toLastLength(i.children);
        }
      });
    },
    view (val) { // 点击查看分类树
      let v = this;
      if (val.length) {
        v.operateStatus = false;
        v.viewStatus = true;
        v.selectedProductCategory = val[0];
        v.addFolderStatus = true;
        v.editFolderStatus = true;
        v.editFolderName = null;
        v.addFolderName = null;
        // 上移，下移显示判断
        if (val[0].nodeKey === 0) {
          v.upShowStatus = false;
          v.downShowStatus = true;
        } else if (val[0].lastChild) {
          v.upShowStatus = true;
          v.downShowStatus = false;
        } else {
          v.upShowStatus = true;
          v.downShowStatus = true;
        }
      } else {
        v.operateStatus = true;
        v.viewStatus = false;
      }
    },
    toTree (data, parentFolderId) { // 组装数据
      let tree = [];
      let temp;
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentFolderId === parentFolderId) {
          let obj = data[i];
          obj.title = obj.folderName;
          obj.id = 'tree_item_' + i + 1;
          temp = this.toTree(data, data[i].folderId);
          if (temp.length > 0) {
            obj.children = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    },
    edit () { // 编辑
      let v = this;
      v.editFolderStatus = false;
      v.operateStatus = true;
      v.editFolderName = v.selectedProductCategory.folderName;
    },
    add () { // 新增
      let v = this;
      v.addFolderStatus = false;
      v.operateStatus = true;
    },
    delConfirm () { // 删除
      let v = this;
      v.delTempModal = true;
      v.delTempModalStatus = true;
    },
    addParentFold () { // 添加一级文件夹
      let v = this;
      v.addParentFoldStatus = false;
    },
    save () {
      let v = this;
      if (!v.editFolderStatus && v.editFolderName) { // 编辑
        let obj = {
          folderName: v.editFolderName,
          folderId: v.selectedProductCategory.folderId
        };
        v.axios.put(api.update_folderName, obj).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('修改成功');
            v.updateStatus = true;
            v.cancel();
          }
        });
      } else if (!v.addFolderStatus && v.addFolderName) { // 新增
        let obj = {
          parentFolderId: v.selectedProductCategory.folderId,
          folderName: v.addFolderName,
          platformId: v.platformId
        };
        v.createFolder(obj, 1);
      } else {
        v.$Message.error('请输入目录名称');
      }
    },
    cancel () {
      let v = this;
      v.addFolderStatus = true;
      v.editFolderStatus = true;
      v.editFolderName = null;
      v.addFolderName = null;
      if (v.viewStatus) {
        v.operateStatus = false;
      } else {
        v.operateStatus = true;
      }
    },
    saveParentFold () { // 添加顶级父类文件夹保存
      let v = this;
      if (v.folderName) {
        let obj = {
          folderName: v.folderName,
          parentFolderId: null,
          platformId: v.platformId
        };
        v.createFolder(obj, 0);
      } else {
        v.$Message.error('请输入目录名称');
        return false;
      }
    },
    cancelParentFold () { // 添加顶级父类文件夹取消
      let v = this;
      v.folderName = null;
      v.addParentFoldStatus = true;
    },
    createFolder (obj, type) { // 新增
      let v = this;
      if (obj) {
        v.axios.post(api.create_folder, obj).then(response => {
          if (response.data.code === 0) {
            v.updateStatus = true;
            if (!type) { // 父级文件夹
              v.folderName = null;
              v.addParentFoldStatus = true;
            } else { // 子级文件夹
              v.cancel();
            }
          }
        });
      }
    },
    delTempOK () { // 删除确认
      let v = this;
      v.axios.delete(api.del_folder + v.selectedProductCategory.folderId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          v.operateStatus = true;
          v.updateStatus = true;
        }
      });
    },
    upData () { // 上移
      let v = this;
      let obj = {
        changeType: 'up',
        folderId: v.selectedProductCategory.folderId
      };
      v.changeFolder(obj);
    },
    downData () { // 下移
      let v = this;
      let obj = {
        changeType: 'down',
        folderId: v.selectedProductCategory.folderId
      };
      v.changeFolder(obj);
    },
    changeFolder (obj) { // 调整文件夹顺序
      let v = this;
      v.axios.defaults.headers['PlatformId'] = v.platformId;
      v.axios.put(api.update_folderOrder, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.operateStatus = true;
          v.updateStatus = true;
        }
      });
    },
    // 处理tree只展开当前项
    handerExpand (value) {
      let v = this;
      let handerData = function (data) {
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          v.$set(item, 'expand', value);
          if (item.children && item.children.length > 0) {
            handerData(item.children);
          }
        }
        return v.categoryTree;
      };
      handerData(v.categoryTree);
    },

    // 关键词检索
    inputEnter () {
      let v = this;
      v.talgItemId = '';
      if (v.keywordTree !== '') {
        let find = function (data, title) {
          for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (item.title === title) {
              v.talgItemId = item.id;
              // v.$set(item, 'expand', true);
              return false;
            } else {
              if (item.title.indexOf(title) > -1) {
                v.talgItemId = item.id;
                // v.$set(item, 'expand', true);
                return false;
              }
            }
            if (item.children && item.children.length > 0) {
              find(item.children, title);
            }
          }
        };
        find(v.categoryTree, v.keywordTree);
        if (v.talgItemId !== '') {
          let id = '#' + v.talgItemId;
          v.$nextTick(() => {
            document.querySelector(id).scrollIntoView({ block: 'start', behavior: 'smooth' });
          });
        } else {
          v.talgItemId = '';
          v.$Message.warning('没有检索到相关的关键词~~');
        }
      } else {
        v.$Message.error('请输入关键词~~');
      }
    },
    // 自定义tree的展示
    renderContent (h, { root, node, data }) {
      let v = this;
      let styles = {
        backgroundColor: '#2D8CF0',
        color: '#fff',
        padding: '0 2px'
      };
      return h('span', {
        attrs: {
          id: data.id
        },
        style: v.talgItemId === data.id ? styles : ''
      }, data.title);
    }
  },
  created () {
    if (!this.getPermission('messageFolder_queryAll')) {
      this.gotoError();
    }
    this.getList();
  },
  watch: {
    updateStatus (n, o) {
      var v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('messageFolder_queryAll') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.updateStatus = false;
      }
    },
    keywordTree: {
      handler (value) {
        let v = this;
        if (value === '') {
          v.talgItemId = '';
        }
      },
      deep: true,
      immediate: true
    },
    talgItemId: {
      handler (value) {
        let v = this;
        if (value) {
          v.handerExpand(true);
        } else {
          v.handerExpand(false);
        }
      }
    }
  }
};
</script>

<style scoped>
.labelCont {
  padding: 0 0 10px 0;
  margin-right: 20px;
  background-color: #fff;
  border: 1px solid #d7dde4;
}

.categoryCont {
  width: 100%;
  min-width: 1020px;
  height: 760px;
  background-color: #fff;
  overflow: auto;
  position: relative;
}

.treeCont {
  width: 300px;
  height: 700px;
  position: absolute;
}

.categoryTree {
  width: 95%;
  height: 85%;
  overflow: auto;
  position: absolute;
  left: 10px;
  top: 15px;
}

.categoryBtn {
  position: absolute;
  left: 10px;
  bottom: 15px;
}

.categoryBtn button {
  margin-left: 5px;
}

.line {
  width: 0.5px;
  border-left: 1px solid #d7dde4;
  position: absolute;
  left: 330px;
  top: 10px;
  bottom: 10px;
}

.categoryDetail {
  width: 23%;
  position: absolute;
  right: 43%;
  top: 50px;
}

.parentFolder {
  margin: 30px;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
</style>
