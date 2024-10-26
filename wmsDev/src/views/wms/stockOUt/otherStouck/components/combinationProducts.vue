<template>
  <div class="combinationProducts" v-if="list.length">
    <div v-for="(litem,lindex) in list" :key="lindex+'list'" class="columns-list">
      <!-- 循环列头 -->
      <div v-for="(item,index) in columns" :key="index+'columns'" class="columns-items" :style="columnWidth(item)">
        <div v-if="item.type==='expand'" class="combination-style"></div>
        <!-- 固定列头宽度 -->
        <div style="padding: 0 18px;line-height: 18px;" v-else>
          <!-- 产品列表(特殊) -->
          <div v-if="item.key === 'pickingDetailStatus'">
            {{pickingStatus[litem.pickingDetailStatus] && pickingStatus[litem.pickingDetailStatus].name}}
          </div>
          <!-- 图片 -->
          <div v-else-if="item.key === 'goodsUrl'" class="images">
            <img :src="imgURl(litem.goodsUrl)" alt="图片">
          </div>
          <!-- 拣货单列表 按商品查看(特殊) -->
          <div v-else-if="item.key === 'warehouseLocationName'">
            <Input v-model="list[lindex].warehouseLocationName" placeholder="请输入" clearable
              @on-focus="allocateInventory(litem,lindex,$event)" :disabled="isDisabled(litem)"
              @on-clear="locationNameClear(lindex)"></Input>
          </div>
          <!-- 其余公用 -->
          <div v-else-if="columnFeild.includes(item.key)">{{ litem[item.key] }}</div>
          <div v-else></div>
        </div>
      </div>
    </div>

    <!-- 库位选择 -->
    <div v-if="inventoryInfo.showLocationModal">
      <Modal v-model="inventoryInfo.showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }"
        class="headerBar" :mask-closable="false" :footer-hide="true">
        <div class="content">
          <wareLocateSlt :open="inventoryInfo.showLocationModal" :wareId="wareId" :sku="inventoryInfo.data.goodsSku"
            :productId="inventoryInfo.data.productGoodsId" @sendData="getData"></wareLocateSlt>
        </div>
      </Modal>
    </div>

  </div>
</template>
<script>
import wareLocateSlt from '@/views/wms/components/exWarehouse/wareLocateSlt';
export default {
  name: 'combinationProducts',
  components: { wareLocateSlt },
  props: {
    index: Number, // 行
    lists: Array, // 行数据
    params: Object, // 表信息
    columns: Array, // 表头
    pickingStatus: Object, // 行状态
    columnFeild: Array, // 需要显示的字段
    isEdit: Boolean, // 输入框是否可编辑
    wareId: String// 仓库id
  },
  watch: {
    lists: {
      handler(val) {
        this.list = val || [];
      },
      deep: true,
      immediate: true
    }
  },
  data() {
    return {
      inventoryInfo: { // 库位信息
        showLocationModal: false, // 库位模态框
        data: {},
        clickIndex: '', // 库位位置
        target: '' // 库位选择目标
      },
      list: []
    }
  },
  methods: {
    // 样式
    columnWidth(item) {
      let [str, otherStr] = ['', ''];
      if (item.width) str += `width:${item.width}px;`;
      if (item.minWidth) str += `minWidth:${item.minWidth}px;flex:1;`;
      if (item.title === '订单数量总数') otherStr += 'justify-content: flex-start;padding:0 8px;';
      return str + otherStr;
    },
    // 图片路径处理
    imgURl(url) {
      if (!url) return require('#@/static/images/placeholder.jpg');
      return this.$store.state.imgUrlPrefix + url;
    },
    // 选择库位
    allocateInventory(row, index, e) {
      this.inventoryInfo.showLocationModal = true;
      this.inventoryInfo.data = row;
      this.inventoryInfo.clickIndex = index;
      this.inventoryInfo.target = e && e.target;
      if (e && e.target) e.target.blur();
    },
    // 选择库位框返回数据
    getData(data) {
      this.inventoryInfo.showLocationModal = false;
      let cindex = this.inventoryInfo.clickIndex;
      this.$emit('getData', { cindex, index: this.index, data });
    },
    // 库位值清除
    locationNameClear(cindex) {
      this.$emit('locationNameClear', { cindex, index: this.index });
    },
    // 是否可编辑 true 不可
    isDisabled(data) {
      if (!this.isEdit) return true;
      if (!data.pickingDetailId) return false; // 添加产品时可编辑
      return !['0', '1'].includes(data.pickingDetailStatus);
    }
  }
};
</script>
<style scoped lang="less">
.combinationProducts {
  .columns-list {
    display: flex;
    align-items: stretch;
  }

  .columns-items {
    padding: 2px 0;
    border-bottom: 1px solid #e7eaec;
    display: flex;
    align-items: center;
    justify-content: center;
    word-break: break-all;
    position: relative;
    min-height: 32px;
  }

  .expand-row {
    margin-bottom: 16px;
  }

  .images {
    width: 60px;
    height: 60px;
    margin: 0 auto;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .combination-style {
    position: absolute;
    left: 0;
    top: -4px;
    bottom: -2px;
    width: 2px;
    background: #2d8cf0;
  }
}
</style>
