<template>
  <span class="sortby-select">
    <span>排序：</span>
    <Select v-model="currentSortField" placeholder="请选择" class="sort-select"
      :class="currentSortType !== '' ? 'active' : ''" @on-change="changeSortField">
      <Option v-for="item in sortButtonList" :key="item.sortField" :value="item.sortField">
        {{ `${item.sortHeader}` }}
      </Option>
    </Select>
    <Button class="sort-button" :class="currentSortType === '' ? '' : 'active'" @click="changeSortType()"
      v-if="currentSortField">
      <span class="sort-button__icon">
        <span>
          {{ currentSortType === '' ? '无序' : (currentSortType === sorType.ASC ? '升序' : '降序') }}
        </span>
        <Icon type="md-arrow-up" v-if="currentSortType === sorType.ASC" />
        <Icon type="md-arrow-down" v-if="currentSortType === sorType.DESC" />
      </span>
    </Button>
  </span>
</template>

<script>
/**
 * @description 排序下拉按钮组件（使用方法可参考 orderGrossDetail.vue）
 * @param {Array} sortButtonList // 排序按钮列表
 * @param {String} sortHeader // 必填，按钮文字
 * @param {String} sortField // 必填，排序prop
 * @param {String} sortType // 非必填，ASC / DESC，为空则默认降序。
 *
 * 注：当页面需在首次进入时就有默认排序，请将要默认排序的按钮放在sortButtonList的第一位，
 * 另外，为避免重复请求，父组件在 created 中就不要再 fetch() 了
 *
 * 传进来的按钮列表数组格式：
 *  sortButtonList: [
      {
        sortHeader: '入库时间',
        sortField: 'warehousingTime',
        sortType: 'ASC'
        default: true,
      },
      {
        sortHeader: '采购时间',
        sortField: 'purchaseTime',
      },
    ],
 */
export default {
  name: 'dytSortBySelect',
  props: {
    // 排序按钮列表
    sortButtonList: {
      type: Array,
      default() {
        return [];
      }
    },
    sorType: {
      type: Object,
      default() {
        return {
          DESC: 'DESC',
          ASC: 'ASC'
        };
      }
    },
    currentSort: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      currentSortField: '', // 当前排序prop
      currentSortType: '', // 当前排序Type
      defaultSort: {}// 默认排序
    };
  },
  watch: {
    sortButtonList: {// 设置默认值
      deep: true,
      immediate: true,
      handler(val) {
        if (!Array.isArray(val)) return;
        let list = val.filter(k => k.default);
        if (!list.length) return;
        this.currentSortField = list[0].sortField || '';
        this.currentSortType = list[0].sortType || '';
        this.defaultSort = list[0] || {};
      }
    },
    currentSort: {
      deep: true,
      handler(val) {
        let sortInfo = val || {};
        this.currentSortField = sortInfo.sortField || '';
        this.currentSortType = sortInfo.sortType || '';
      }
    }
  },
  methods: {
    // 向父组件传递 sortType sortField
    changeSortField(e) {
      if (!e) {
        let defaultSort = this.defaultSort;
        this.currentSortType = defaultSort.sortType || '';
        this.currentSortField = defaultSort.sortField || '';
      } else {
        this.sortButtonList.find((obj) => {
          if (obj.sortField === this.currentSortField) {
            // 有设置默认排序则使用默认，没设置则默认降序
            this.currentSortType = obj.sortType || this.sorType.DESC;
          }
        });
      }
      this.$emit('sortInfo', this.currentSortType, this.currentSortField);
    },
    changeSortType() {
      // 避免没有 sortField 的情况
      if (!this.currentSortField) {
        this.$message.warning('请选择要按哪一列数据排序！');
        return;
      }
      // 反选
      this.currentSortType = this.currentSortType === this.sorType.ASC ? this.sorType.DESC : this.sorType.ASC;
      this.$emit('sortInfo', this.currentSortType, this.currentSortField);
    }
  }
};
</script>
<style lang="less">
.sortby-select {
  .sort-select {
    width: 110px;

    .el-input__inner {
      color: #838a9d;
      padding: 0 20px 0 10px;
    }

    .el-input__icon {
      width: 15px;
    }
  }

  .sort-select.active {
    .el-input .el-input__inner {
      color: #4d8ce9 !important;
      border-color: #4d8ce9 !important;
    }
  }

  .sort-button {
    margin-left: 10px;
    padding: 0px 10px;
    font-size: 14px;

    svg {
      font-size: 10px;
      padding-top: 1px;
    }

    svg.active {
      color: #4d8ce9;
      margin-right: -2px;
    }

    .sort-button__icon {
      display: inline-flex;
      align-items: center;
    }
  }

  .sort-button.active {
    border-color: #4d8ce9 !important;
    color: #4d8ce9 !important;
  }

  .sort-button:hover,
  .sort-button:focus {
    background-color: #ffffff;
  }
}
</style>
