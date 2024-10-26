<template >
  <div class="productAdditionOperation">
    <div class="tips">你扫描的货品 {{ data.sku || '' }}，需要增加操作项：</div>
    <div class="lists">
      <div v-for="(item, index) in (data.list || [])" :key="index" class="item">
        <div>{{ item.reminderName }}:</div>
        <div class="tags" :style="{ color: item.color }">
          {{ item.operation }}
          <div class="bgTags" :style="{ backgroundColor: item.color }"></div>
        </div>
        <div>原因:{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'productAdditionOperation',
  props: {
    data: {
      type: Object,
      defaul() {
        return {
          sku: '',
          list: []
        }
      }
    }
  },
  data() {
    return {}
  }
}
</script>

<style lang="less">
.productAdditionOperation {
  height: 100%;
  overflow: auto;

  .tips {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .lists {
    padding-left: 20px;

    .item {
      display: flex;
      align-items: center;

      &:not(:last-child) {
        margin-bottom: 20px;
      }

      .tags {
        font-size: 18px;
        font-weight: bold;
        margin: 0 10px;
        position: relative;
        padding: 0 6px;

        .bgTags {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          opacity: 0.2;
        }
      }
    }
  }
}
</style>