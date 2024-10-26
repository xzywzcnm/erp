<template >
  <div
      class="tabInputBox" @click="focusIn" >
    <div
        style="margin: 3px 5px;border: 1px solid #ddd;padding: 2px 10px;background-color: #f3f3f3;display: inline-block;border-radius: 3px;"
        v-for="(item,index) in tags"
        :key="index"
        v-if="tags.length>0"
        :title="item.attrVal" >
      <span class="tabText" >{{ item.attrVal }}</span >
      <Icon
          v-show="!disabled" type="md-close" @click="delTag(index)" class="tagClose" size="14" ></Icon >
    </div >
    <Input
        v-show="!disabled"
        class="tagInput"
        ref="tagIpt"
        :style="{width:tagName.length*12+100+'px'}"
        @on-enter="addTag"
        @on-blur="addTag"
        v-model="tagName" />
  </div >
</template >
<script >
export default {
  name: 'tagInput',
  components: {},
  data () {
    return {
      tagName: ''
    };
  },
  props: {
    tags: {
      type: Array
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    focusIn () {
      this.$refs.tagIpt.focus();
    },
    delTag (index) {
      let v = this;
      v.tags.splice(index, 1);
      v.$emit('tagsMt', v.tags);
    },
    addTag () {
      let v = this;
      let valid = true;
      if (v.tagName !== '') {
        v.tags.forEach(item => {
          if (item.attrVal === v.tagName) valid = false;
        });
        if (!valid) {
          v.tagName = '';
          return;
        }
        v.tags.push({ attrVal: v.tagName });
        v.tagName = '';
        v.$emit('tagsMt', v.tags);
      }
    }
  }
};
</script >

<style >
.tagInput .ivu-input {
  border: 0;
}

.tagInput .ivu-input:focus {
  box-shadow: 0 0 0
}
</style >
<style scoped >
.tagClose {
  display: inline-block;
  font-size: 14px;
  margin-left: 10px;
  vertical-align: middle;
  cursor: pointer
}

.tabText {
  max-width: 260px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
  display: inline-block;
}

.tagClose:hover {
  color: #cc0031
}

.tabInputBox {
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  width: 100%;
  cursor: text;
  min-height: 34px;
}

.tagInput {
  display: inline-block;
  max-width: 260px;
}
</style >
