// 公共方法
import publicService from '@/components/mixin/publicService_mixin'; // 业务公共请求组件
export default {
  mixins: [publicService],
  data () {
    return {
      platformId: ''
    };
  },
  methods: {
    changeValue (value) {
      // 修改平台值
      let v = this;
      if (value === '全部') {
        v.pageParams.platformId = '';
      } else {
        v.pageParams.platformId = value;
      }
    }
  }
};
