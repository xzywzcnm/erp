<template>
  <div class="grayBg sort-main">
    <span style="line-height: 32px;">排序方式：</span>
    <Button-group>
      <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" @click="clickSortButton(item)" :key="item.value">{{ item.label }}
        <Icon type="md-arrow-up" v-if="item.checked && (item.toogle==='up')"></Icon>
        <Icon type="md-arrow-down" v-if="item.checked && item.toogle==='down'"></Icon>
      </Button>
    </Button-group>
  </div>
</template>

<script>
export default {
  data () {
    return {};
  },
  props: {
    sortData: {
      type: Array,
      default () {
        return [];
      }
    }
  },
  methods: {
    // 按钮点击排序
    clickSortButton: function (data) {
      let reqData = this.sortData
      let frclick = data.checked;
      reqData.forEach((k, i) => {
        reqData[i].checked = false;
        if (k.value === data.value) {
          reqData[i].checked = true;
          if (frclick) reqData[i].toogle = reqData[i].toogle === 'up' ? 'down' : 'up';
        }
      });
      this.$emit('search_cli', data);
    },
  }
};
</script>
<style lang="less" scoped>
.sort-main {
  display: flex;
  justify-content: flex-end;
}
</style>