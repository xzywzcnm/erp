<template >
  <Modal
      v-model="isShow" width="360" @on-cancel="cancel" class-name="vertical-center-modal" >
    <div
        slot="header" style="color:#fff" >
      <h3 >删除</h3 >
    </div >
    <div style="text-align:center" >
      <span style="font-size:15px;font-weight:bold" v-html="tipsText"></span>
    </div >
    <div slot="footer" >
      <Button @click="cancel" >取消</Button >
      <Button
          type="error" size="large" @click="ok" >确定 </Button >
    </div >
  </Modal >
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      tipsText: '是否确认删除?',
      isShow: false,
      arguments: null
    };
  },
  methods: {
    show () {
      this.arguments = Array.prototype.slice.call(arguments);
      this.isShow = true;
    },
    changeText (t) {
      this.tipsText = this.$common.isEmpty(t) ? '是否确认删除?' : t;
    },
    hide () {
      this.isShow = false;
      this.$nextTick(() => {
        this.tipsText = '是否确认删除?';
      })
    },
    ok () {
      let fuStr = 'self.$emit(\'ok\'';
      this.arguments.forEach((n, i) => {
        fuStr += ', self.arguments[' + i + ']';
      });
      this.evil(fuStr + ')');
    },
    cancel () {
      this.hide();
      this.$emit('cancel');
    },
    evil (fn) {
      let self = this;
      var Fn = Function;
      return new Fn('self', fn)(self);
    }
  }
};
</script >
