<template>
  <div class="scan">
    <div class="scan-box hvr-round-corners">
      <div>
        <div class="title">{{ title }}</div>
        <div>
          <Input size="large" class="ipt" ref="scanIpt" :placeholder="placeholder" v-model.trim="model" @on-enter="enterHandel"></Input>
        </div>
        <img src="../../../../assets/images/scan.png" class="s-img" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'scan',
  components: {},
  props: {
    title: {
      default: '扫描SKU：'
    },
    placeholder: {
      default: '请扫描SKU'
    }
  },
  data () {
    return {
      model: '',
      autofocus: true
    };
  },
  activated () {
    this.model = '';
  },
  methods: {
    enterHandel () {
      this.$emit('enter', this.model);
    }
  },
  computed: {},
  mounted () {
    this.$nextTick(() => {
      this.$refs.scanIpt.focus();
    });
  }
};
</script>

<style scoped>
.scan {
  width: 600px;
  height: 600px;
  margin: 0 auto;
  text-align: center;
  box-shadow: 0 0 16px rgba(185, 185, 185, 0.8);
  border-radius: 90px;
}

.scan-box {
  width: 100%;
  height: 100%;
  border-radius: 80px;
  background-color: #fff;
}

.scan .title {
  font-size: 30px;
  padding: 60px;
}

.scan .ipt {
  font-size: 30px;
  width: 300px;
}

.hvr-round-corners {
  display: inline-block;
  vertical-align: middle;
  -webkit-transform: perspective(1px) translateZ(0);
  transform: perspective(1px) translateZ(0);
  box-shadow: 0 0 1px rgba(0, 0, 0, 0);
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-property: border-radius;
  transition-property: border-radius;
}

.hvr-round-corners:hover,
.hvr-round-corners:focus,
.hvr-round-corners:active {
  border-radius: 90px;
}

.s-img {
  margin: 50px;
}
</style>
