// 权限
export default {
  data() {
    return {}
  },
  computed: {
    controlList() {
      return this.$store.state.roleList || {};
    },
    isAdmin() {
      return this.$store.state.isAdmin;
    }
  },
  methods: {
    // 是否有权限
    getPermission(name) {
      return !!(this.isAdmin || this.controlList[name])
    },
  },
};
