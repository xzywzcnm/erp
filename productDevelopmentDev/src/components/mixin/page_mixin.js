import Qs from "qs";
import pageCommon from '@/components/pageCommon';
import CommonMixin from "@/components/mixin/commonMixin";
export default {
  components: { pageCommon },
  mixins: [CommonMixin],
  data () {
    return {
      // 表格加载
      tableLoading: false,
      // 表格列表
      tableList: [],
      // url后缀
      searchFix: {},
      // 表格条件搜索
      searchCriteria: {},
      // 分页条数
      pageArray: [10, 50, 100],
      proPage: {
        total: 0,
        pageNum: 1,
        pageSize: 10,
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
    };
  },
  methods: {
    // 查询列表
    search () {
      this.total = 0; 
      this.proPage.pageNum = 1;
      this.fetch();
    },
    // 重置表单条件
    reset () {
      Object.keys(this.searchCriteria).forEach(k => {
        const type = Object.prototype.toString.call(this.searchCriteria[k]);
        if(type === "[object Array]"){
          this.searchCriteria[k] = [];
        }else if(type === "[object Object]"){
          this.searchCriteria[k] = {};
        }else {
          this.searchCriteria[k] = '';
        }
      });
    },
    // 返回pageSize
    ChangePageSize (pageSize) {
      this.proPage.pageSize = pageSize;
      if (this.$common.isEmpty(this.fetchList)) return this.search();
      this.fetchList();
    },
    // 返回page
    ChangePage (page) {
      this.proPage.pageNum = page;
      if (this.$common.isEmpty(this.fetchList)) return this.fetch();
      this.fetchList();
    },
    // 发起请求 (api: 接口; type: 请求类型; permiPower: 接口权限)
    fetch(api,type,permiPower) {
      if(api) this.api = api;
      if(type) this.type = type;
      if(permiPower) this.permiPower = permiPower;
      if(!(this.api && this.type)) {
        return Promise.reject(new Error('api和type必传'));
      }
      // 接口权限(暂时)
      if (this.permiPower && !this.getPermission(this.permiPower)) {
        this.$Message.error('无权限');
        return;
      }
      // 处理查询条件
      let reqParams = {};
      if (typeof this.getFilterParams === 'function') {
        reqParams = Object.assign({}, this.getFilterParams());
      } else {
        reqParams = Object.assign({},this.searchCriteria);
      }
      reqParams = this.$common.removeEmpty(this.searchCriteria);
      this.tableLoading = true;
      if(this.type === 'post') {
        if(api == '/pds-service/pds/lapa/workbench/product/myLaPaProductInfoList') {
          return this.axiosPost(reqParams);
        }
        reqParams = Object.assign(reqParams,this.proPage);
        delete reqParams.total;
        return this.axiosPost(reqParams);
      }else {
        return this.axiosGet(reqParams);
      }
    },
    // get请求
    axiosGet(reqParams){
      return this.axios.get(this.api, reqParams).then((data) => {
        if (data.code == 0) {
          this.tableList = data.datas || [];
          this.columnList = [];
        }
      }).finally(()=>{
        this.tableLoading = false;
      });
    },
    // post请求
    axiosPost(reqParams){
      if(reqParams.modelNo){
        reqParams.modelNo = reqParams.modelNo.replace(/\n/g,' ')
        reqParams.modelNo = reqParams.modelNo.trim()
        reqParams.modelNo = reqParams.modelNo.replace(/ /g,',')
      }
      if(reqParams.referenceSpu){
        reqParams.referenceSpu = reqParams.referenceSpu.replace(/\n/g,' ')
        reqParams.referenceSpu = reqParams.referenceSpu.trim()
        reqParams.referenceSpu = reqParams.referenceSpu.replace(/ /g,',')
      }
      let api = this.api;
      if(api == '/pds-service/pds/lapa/workbench/product/myLaPaProductInfoList'){
        return this.axios.post(api, reqParams).then((data) => {
          if (data.code == 0) {
            this.tableList = this.$common.isUndefined(data.datas.list) ? data.datas : data.datas.list;
            this.proPage.total = this.$common.isUndefined(data.datas.total) ? 0 : data.datas.total;
            this.columnList = [];
          } 
        }).finally(()=>{
          this.tableLoading = false;
        });
      }else {
        if(Object.keys(this.searchFix).length) api+= `?${Qs.stringify(this.searchFix)}`;//有后端要求将某参数放到url后面的要求
        return this.axios.post(api, reqParams).then((data) => {
          if (data.code == 0) {
            this.tableList = this.$common.isUndefined(data.datas.list) ? data.datas : data.datas.list;
            this.proPage.total = this.$common.isUndefined(data.datas.total) ? 0 : data.datas.total;
            this.columnList = [];
            // console.log(data)
          } 
        }).finally(()=>{
          this.tableLoading = false;
        });
      }
      
    },
    // 表格多项选择
    selectChange (list) {
      this.columnList = list;
    },
    // 多个用逗号或回车隔开
    wordFormat (key,name) {
      if(!key&&name) return;
      this.searchCriteria[name] =
        this[key].trim() === ""
          ? []
          : this[key]
            .trim()
            .replace(/\n/g, ",")
            .replace(/，/g, ",") // 中文逗号
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
    },
    // 高级选项
    toggleClick () {
      this.searchFilter = !this.searchFilter;
    },
  }
};