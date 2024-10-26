<template >
  <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;"><!--排序-->
    <span >排序：</span >
    <Button-group v-if="$store.state.SETTING_CHANNEL === 0" >
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
    <Button-group v-if="$store.state.SETTING_CHANNEL === 1" >
      <template
          v-for="(item,index) in customButtonGroupModel" >
        <Button
            v-if="item.selected" type="primary" @click="customShopModifyTheSort(index, item.status)" :key="index" >
          {{ item.title }}
          <Icon
              type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
          <Icon
              type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
        </Button >
        <Button
            v-if="!item.selected" @click="customShopModifyTheSort(index, item.status)" :key="index" >
          {{ item.title }}
          <Icon
              type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
          <Icon
              type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
        </Button >
      </template >
    </Button-group >
  </div >
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    buttonGroupModel: Array
  },
  data () {
    return {
      customButtonGroupModel: [
        {
          type: 'createdTime',
          selected: true,
          status: true, // true up false down
          title: '创建时间'
        }, {
          type: 'accountCode',
          selected: false,
          status: true, // true up false down
          title: '按代号'
        }
      ]
    };
  },
  methods: {
    shopModifyTheSort (index, status) {
      let obj = {};
      obj.orderBy = this.buttonGroupModel[index].type;
      this.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          this.buttonGroupModel[index].status = !this.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      obj.upDown = this.buttonGroupModel[index].status ? 'up' : 'down';
      this.$emit('combineData', obj);
      this.$emit('customListCombine', obj);
    },
    customShopModifyTheSort (index, status) {
      let obj = {};
      obj.orderBy = this.customButtonGroupModel[index].type;
      this.customButtonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          this.customButtonGroupModel[index].status = !this.customButtonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      obj.upDown = this.customButtonGroupModel[index].status ? 'up' : 'down';
      this.$emit('combineData', obj);
      this.$emit('customListCombine', obj);
    }
  }
};
</script >
