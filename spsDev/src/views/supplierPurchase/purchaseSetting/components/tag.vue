<template >
  <div class="labelCont" >
    <div class="btnCont" >
      <Button
          type="primary" icon="md-add" @click="add" :disabled="!getPermission('purchaseTag_insert')" >添加标签 </Button >
    </div >
    <div class="label-content" >
      <Tag
          class="tag"
          v-model="tagList"
          v-for="(item, index) in tagList"
          :key=item.purchaseTagId
          :name=item.name
          closable
          @on-close="delConfirm(item.purchaseTagId, index)" >
        <div v-if="item.edit" >
          <Input v-model.trim="item.name" :maxlength="50" size="small" style="width: 150px;" />
          <Icon
              class="tagIcon"
              size="16"
              type="md-checkmark"
              v-if="getPermission('purchaseTag_modifyTag')"
              @click.native="editLabel(item)" ></Icon >
          <Icon style="cursor: pointer;" type="ios-undo" size="16" @click="item.edit = false" />
        </div >
        <div v-else >
          <div style="display: flex; align-items: center;" >
            <i class="ivu-icon ivu-icon-ios-pricetags-outline" ></i >
            <span style="margin: 0 5px;" >{{ item.name }}</span >
            <Icon class="tagIcon" type="md-create" @click.native="openEditModal(item)" style="margin: 5px 0" />
          </div >
        </div >
      </Tag >
      <Tag class="tag" color="primary" v-show="showNewTag" >
        <Input
            :autofocus="true"
            ref="tagInput"
            style="width: 200px;"
            v-model.trim="newTag.value"
            :maxlength="50"
            placeholder="请输入" ></Input >
        <Icon class="tagIcon" type="md-close" @click.native="cancel" ></Icon >
        <Icon class="tagIcon" type="md-checkmark" @click.native="save" ></Icon >
      </Tag >
    </div >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      editModel: false,
      loading: false,
      tagList: [], // 标签列表
      newTag: { // 新增标签对象
        value: null
      },
      showNewTag: false // 是否显示新增标签
    };
  },
  methods: {
    // 编辑标签名称
    editLabel (item, params = {}) {
      let v = this;
      if (params.updateRefrenceFlag === undefined) {
        params = {
          newTagName: item.name,
          purchaseTagId: item.purchaseTagId,
          updateRefrenceFlag: 1
        };
      }
      v.axios.put(api.edit_purchaseTag, params).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('保存成功');
          item.name = item.newName;
          item.edit = false;
        } else if (res.data.code === 121008) {
          v.$Modal.confirm({
            title: '修改标签',
            content: '是否同步修改关联商品的标签信息',
            onOk: () => {
              let obj = Object.assign(params, { updateRefrenceFlag: 1 });
              v.editLabel(item, obj);
            },
            onCancel: () => {
              let obj = Object.assign(params, { updateRefrenceFlag: 0 });
              v.editLabel(item, obj);
            }
          });
        } else if (res.data.code === 121009) {
          v.$Message.error('商品标签不能包含逗号');
        } else if (res.data.code === 1210010) {
          v.$Message.error('商品标签不能包含空格');
        } else {
          v.$Message.error('保存失败');
        }
      });
    },
    openEditModal (item) {
      item.edit = true;
      item.newName = item.name;
    },
    delConfirm (purchaseTagId, index) { // 删除确认
      if (this.getPermission('purchaseTag_delete')) {
        let delRow = {
          purchaseTagId: purchaseTagId
        };
        this.$Modal.confirm({
          title: '是否确认删除?',
          onOk: () => {
            this.del(delRow);
          },
          onCancel: () => {}
        });
      }
    },
    add () {
      let self = this;
      self.showNewTag = true;
      self.$nextTick(function () {
        self.$refs.tagInput.focus();
      });
    },
    getTagName () {
      return this.axios.get(api.purchaseTag_all);
    },
    getList () {
      let v = this;
      v.getTagName().then(resa => {
        if (resa.data.code === 0) {
          resa.data.datas.forEach(i => {
            i.edit = false;
          });
          v.tagList = resa.data.datas;
        }
      });
    },
    del (delRow) { // 删除
      let self = this;
      self.axios.delete(api.delete_purchaseTag + delRow.purchaseTagId).then(response => {
        if (response.data.code === 0) {
          self.getList();
          self.$Message.success('删除成功');
        }
      });
    },
    save () { // 保存
      let self = this;
      if (self.newTag.value === null || self.newTag.value === undefined || self.newTag.value === '') {
        self.$Message.error('标签名称不能为空');
        return false;
      }
      self.axios.post(api.add_purchaseTag + '?name=' + encodeURI(self.newTag.value)).then(response => {
        if (response.data.code === 0) {
          self.showNewTag = false;
          self.$Message.success('新增成功');
          self.$nextTick(function () {
            // self.tagList.push({
            //   name: self.newTag.value,
            //   productTagId: response.data.datas
            // });
            self.newTag.value = null;
            self.getList();
          });
        } else if (response.data.code === 121001) {
          self.$Message.error('标签名称已存在');
        } else if (response.data.code === 121009) {
          self.$Message.error('商品标签不能包含逗号');
        } else if (response.data.code === 1210010) {
          self.$Message.error('商品标签不能包含空格');
        }
      });
    },
    cancel () {
      this.newTag.value = null;
      this.showNewTag = false;
    }
  },
  activated () {
    var self = this;
    self.$Loading.start();
    Promise.resolve(self.getPermission('purchaseTag_queryAll') ? self.getList() : self.gotoError()).then(() => {
      self.$Loading.finish();
    });
  }
};
</script >

<style scoped >
.labelCont {
  padding: 0 0 10px 0;
  /* width: 80%; */
  /* height: 50%; */
  margin-left: 12px;
  margin-right: 20px;
  background-color: #fff;
  border: 1px solid #d7dde4;
}

.labelTit {
  color: #fff;
  background-color: #113f6d;
  padding: 10px;
  font-size: 16px;
  font-weight: 700;
}

.btnCont {
  padding: 10px;
}

.label-content {
  /* padding: 0 0 50px 0; */
  width: 100%;
  height: 700px;
  overflow: auto;
  border-top: 1px solid #d7dde4;
}

.tag {
  /* width: 11%; */
  height: 40px;
  line-height: 40px;
  margin-left: 12px;
  margin-top: 12px;
}

.tagInput {
  width: 70%;
  margin-bottom: 3px;
}

.tagIcon {
  cursor: pointer;
  margin-left: 15px;
}

.addBrand {
  margin-left: 10px;
}

.label {
  display: inline-block;
  vertical-align: top;
}

.upload {
  width: 200px;
  margin-left: 5px;
  display: inline-block;
}

.orderTable {
  padding: 0 12px;
}

.stopStatus {
  color: #de2910
}

.openStatus {
  color: #3cb034
}

.tag {
  height: 40px;
  line-height: 40px;
  margin-left: 12px;
  margin-top: 12px;
}
</style >
<style >
.labelCont .ivu-tag-text {
  display: inline-block
}
</style >
