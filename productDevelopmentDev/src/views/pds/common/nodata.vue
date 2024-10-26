<template>
  <div class="no-data" v-if="listDate.length == 0">
    <img src="../../../assets/images/common/nodata.png" />
  </div>
</template>

<script>
export default {
  name: "nodata",
  props: {
    listDate: {
      type: Array,
      default: () => {
        return []
      }
    }
  }
};
</script>

<style scoped>
.no-data {
  width: 600px;
  margin: 0 auto;
  position: relative;
  padding-top: 30px;
  text-align: center;
}
</style>
