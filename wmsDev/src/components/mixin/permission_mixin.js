// 权限
export default {
  computed: {
    roleList() {
      return this.$store.state.roleList || {};
    },
    isAdmin() {
      return this.$store.state.isAdmin;
    },
  },
  methods: {
    getPermission(name) {
      // console.log(this.isAdmin, this.roleList)
      return this.isAdmin || this.roleList[name];
    },
  },
}