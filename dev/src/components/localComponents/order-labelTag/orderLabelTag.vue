<template>
  <div class="tagsList">
    <dyt-input placeholder="请输入关键字" v-model.trim="searchTagIdList" class="tags-list-order-label-tag" />
    <Checkbox-group v-model="tagIdList">
      <ul>
        <li v-for="(item, tagIndex) in newTagsList" :key="tagIndex">
          <Checkbox :label="item.tagId">{{ item.tagName }}</Checkbox>
        </li>
      </ul>
    </Checkbox-group>
    <div v-if="newTagsList.length === 0" style="color:#cbcbcb;">未匹配到数据</div>
  </div>
</template>
<script>

export default {
  name: 'orderLabelTag',
  components: {},
  model: {
    prop: 'value',
    event: 'valueChange'
  },
  props: {
    value: { type: Array, default: () => { return [] } },
    tagsList: { type: Array, default: () => { return [] } }
  },
  data () {
    return {
      olDtagIdList: [],
      tagIdList: [],
      newTagsList: [],
      searchTagIdList: ''
    }
  },
  watch: {
    searchTagIdList: {
      deep: true,
      handler (val) {
        const olDtagIdList = this.$common.copy(this.tagIdList);
        this.newTagsList = this.$common.isEmpty(val) ? this.tagsList : this.tagsList.filter(item => item.tagName.includes(val));
        this.$nextTick(() => {
          this.tagIdList = olDtagIdList;
        })
      }
    },
    tagsList: {
      immediate: true,
      deep: true,
      handler (val) {
        this.newTagsList = val;
      }
    },
    tagIdList: {
      deep: true,
      handler (val) {
        this.$emit('valueChange', val);
      }
    },
    value: {
      deep: true,
      immediate: true,
      handler (val) {
        this.tagIdList = val;
      }
    }
  },
  computed: {},
  created () {},
  mounted () {},
  methods: {}
};
</script>
<style lang="less" scoped>
.tagsList{
  position: relative;
  padding-right: 5px;
  .tags-list-order-label-tag{
    position: sticky;
    top: 0;
    padding-bottom: 10px;
    background:#fff;
    z-index: 10;
  }
}

</style>
