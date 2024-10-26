<template>
  <div class="grayBg" style="margin:12px 0;">
    <span>排序方式：</span>
    <Button-group>
      <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" @click="clickSortButton(item)" :key="item.value">{{ item.label }}
        <Icon type="md-arrow-up" v-if="item.checked && (item.toogle==='up')"></Icon>
        <Icon type="md-arrow-down" v-if="item.checked && item.toogle==='down'"></Icon>
      </Button>
    </Button-group>
  </div>
</template>

<script>
/* eslint-disable vue/no-mutating-props */
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
      let frclick = data.checked;
      this.sortData.forEach((k, i) => {
        this.sortData[i].checked = false;
        if (k.value === data.value) {
          this.sortData[i].checked = true;
          if (frclick) this.sortData[i].toogle = this.sortData[i].toogle === 'up' ? 'down' : 'up';
        }
      });
      this.$emit('search_cli', data);
    },
  }
};
</script>