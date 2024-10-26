import Qs from 'qs';
export default {
  data () {
    return {
      // 表格加载
      tableLoading: false,
      // 表格列表
      tableList: [],
      // url后缀
      searchFix: {},

      // 分页条数
      pageArray: [10, 20, 50, 100],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10
      },
      // 请求接口
      api: '',
      // 请求类型
      type: '',
      // 列表接口权限
      permiPower: '',
      // 表格多选
      columnList: [],
      // 控制搜索更多
      searchFilter: false,
      searchCriteria: {}, // 表格条件搜索
      resetOption: {}, // 重置条件是有些情况是非空或非数组的，可以放到这里
      arraySearch: {}, // 有些表单查询条件需要额外转换，可以放到这里
      resetArray: {} // 重置额外表单条件是有些情况是非空或非数组的，可以放到这里
    };
  },
  watch: {},
  methods: {
    // 查询列表
    search () {
      this.total = 0;
      this.proPage.pageNum = 1;
      this.fetch();
    },
    // 重置表单条件
    reset () {
      // 这里是表单查询
      Object.keys(this.searchCriteria).forEach(key => {
        let search = this.searchCriteria[key];
        let resetOption = this.resetOption; // 重置条件配置
        if (resetOption && key in resetOption) {
          this.searchCriteria[key] = resetOption[key];
          return;
        }
        if (Array.isArray(search)) {
          this.searchCriteria[key] = [];
          return;
        }
        this.searchCriteria[key] = '';
      });
      // 这里是表单中不能直接传给后端的中间表单字段,比如看多个查询的例子
      Object.keys(this.arraySearch).forEach(key => {
        let search = this.arraySearch[key];
        let resetArray = this.resetArray; // 重置条件配置
        if (resetArray && (key in resetArray)) {
          this.arraySearch[key] = resetArray[key];
          return;
        }
        if (Array.isArray(search)) {
          this.arraySearch[key] = [];
          return;
        }
        this.arraySearch[key] = '';
      })
    },
    // 返回pageSize
    ChangePageSize (pageSize) {
      this.proPage.pageSize = pageSize;
      this.search();
    },
    // 返回page
    ChangePage (page) {
      this.proPage.pageNum = page;
      this.fetch();
    },
    // 发起请求 (api: 接口; type: 请求类型; permiPower: 接口权限)
    fetch (api, type, permiPower) {
      if (api) this.api = api;
      if (type) this.type = type;
      if (permiPower) this.permiPower = permiPower;
      if (!(this.api && this.type)) {
        return Promise.reject(new Error('api和type必传'));
      }
      // 接口权限(暂时)
      if (this.permiPower && !this.getPermission(this.permiPower)) {
        this.$Message.error('无权限');
        return;
      }
      // 处理查询条件
      let reqParams = Object.assign({}, this.searchCriteria);
      this.tableLoading = true;
      if (this.type === 'post') {
        reqParams = Object.assign(reqParams, this.proPage)
        delete reqParams.total;
        return this.axiosPost(reqParams);
      } else {
        return this.axiosGet(reqParams);
      }
    },
    // get请求
    axiosGet (reqParams) {
      return this.axios.get(this.api, reqParams).then(({ data }) => {
        if (data.code == 0) {
          this.tableList = data.datas || [];
          this.columnList = [];
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // post请求
    axiosPost (reqParams) {
      let api = this.api;
      if (Object.keys(this.searchFix).length) api += `?${Qs.stringify(this.searchFix)}`;// 有后端要求将某参数放到url后面的要求
      return this.axios.post(api, reqParams).then(({ data }) => {
        if (data.code == 0) {
          this.tableList = data.datas.list;
          if (!data.datas.list) {
            this.tableList = data.datas || [];
          }
          this.proPage.total = data.datas.total;
          this.columnList = [];
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 表格多项选择
    selectChange (list) {
      this.columnList = list;
    },
    // 多个用逗号或回车隔开
    wordFormat (key, name) {
      if (!key && name) return;
      this.searchCriteria[name] =
        this[key].trim() === ''
          ? []
          : this[key]
            .trim()
            .replace(/\n/g, ',')
            .replace(/，/g, ',') // 中文逗号
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item !== '');
    },
    // 高级选项
    toggleClick () {
      this.searchFilter = !this.searchFilter;
    }
  },
  mounted () {

  }
};
