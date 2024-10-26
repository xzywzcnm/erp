<template >
  <div class="carousel-box" >
    <div class="img-box-prev" @click="prev" ></div >
    <div style="padding:  0 15px;" >
      <div style="overflow: hidden;position: relative;height: 60px;" ref="carousel" >
        <div :style="{ width: list.length * 66 + 'px' }" class="carousel-img-box" ref="carouselItem" >
          <img
              class="img-item fl"
              v-for="(item, imgIndex) in list"
              :src="item.src"
              width="60"
              height="60"
              :key="`${imgIndex}`"
              @click="activeImg(item)" />
        </div >
      </div >
    </div >
    <div class="img-box-next" @click="next" >></div >
  </div>
</template>

<script>
export default {
  name: 'carousel',
  mixins: [],
  props: {
    list: {
      default: []
    }
  },
  components: {},
  data () {
    return {};
  },
  methods: {
    prev () {
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) + 60 : 0;
      if (left <= 0) {
        this.$refs.carouselItem.style.left = left + 'px';
      } else {
        this.$refs.carouselItem.style.left = 0 + 'px';
      }
    },
    next () {
      let width = this.$refs.carousel.offsetWidth;
      let widthItem = this.$refs.carouselItem.offsetWidth;
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) - 60 : -60;
      if (left < -(widthItem - width)) {
        this.$refs.carouselItem.style.left = -(widthItem - width) + 'px';
      } else {
        this.$refs.carouselItem.style.left = left + 'px';
      }
    },
    activeImg (item) {
      this.$emit('activeImg', item);
    }
  },
  computed: {}
};
</script>

<style scoped>
.carousel-box {
  width: 100%;
  margin-top: 10px;
  position: relative;
  height: 60px;
  transition: left 0.3s ease;
}

.carousel-img-box {
  height: 60px;
  position: absolute;
  left: 0;
  top: 0;
}

.carousel-box .img-box-prev,
.carousel-box .img-box-next {
  position: absolute;
  width: 15px;
  line-height: 57px;
  font-weight: bold;
  top: 0;
  height: 60px;
  cursor: pointer;
}

.carousel-box .img-box-prev:hover,
.carousel-box .img-box-next:hover {
  color: #2baee9;
}

.carousel-box .img-box-prev {
  left: 0;
}

.carousel-box .img-box-next {
  right: 0;
  text-align: right;
}

.img-item {
  object-fit: cover;
  margin: 0 3px;
}
</style>
