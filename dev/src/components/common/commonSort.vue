<template >
  <div class="dataSort grayBg" ><!--排序-->
    <span >排序：</span >
    <Button-group >
      <template
          v-for="(item,index) in buttonGroupModel" >
        <Button
            v-if="item.selected" type="primary" @click="shopModifyTheSort(index, item.status)" :key="index" >
          {{ item.title }}
          <Icon
              type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
          <Icon
              type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
        </Button >
        <Button
            v-if="!item.selected" @click="shopModifyTheSort(index, item.status)" :key="index" >
          {{ item.title }}
          <Icon
              type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
          <Icon
              type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
        </Button >
      </template >
    </Button-group >
  </div >
</template >
<script >
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    buttonGroupModel: Array,
    emitName: {
      type: String,
      default: 'updatePageList'
    }
  },
  methods: {
    shopModifyTheSort (index, status) {
      let v = this;
      let obj = {};
      obj.orderBy = v.buttonGroupModel[index].type;
      v.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      obj.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
      v.$emit(v.emitName, obj);
    }
  }
};
</script >
