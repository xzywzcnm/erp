/*
 * @Author: Jaycee
 * @Date: 2022-04-25 11:16:59
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2022-06-27 14:50:12
 */
import Qs from 'qs';
import { timeOption } from '@/utils/comConfig.js';
export default {
  data () {
    return {
      // 列表数据加载中
      tableLoading: false,
      // 列表数据总条数
      pageTotal: 0,
      // 列表页数
      pageArray: [10, 20, 50, 100],
      // 列表数据
      tableList: [],
      // 时间快捷面板
      options: timeOption,
      // 列表数据勾选项
      selectionList: [],
      // api请求方式
      apiType: 'get',
      // 列表api
      mapi: '',
      // 列表权限
      power: '',
      resetOption: {}, // 重置条件是有些情况是非空或非数组的，可以放到这里
      arraySearch: {}, // 有些表单查询条件需要额外转换，可以放到这里
      resetArray: {} // 重置额外表单条件是有些情况是非空或非数组的，可以放到这里
    };
  },
  methods: {
    // 获取权限
    getPermission (name) {
      if (!name) return false;
      let { isAdmin, roleList } = this.$store.state;
      return isAdmin || roleList[name];
    },
    // 加载列表数据
    fetch (mapi, type, power) {
      // 清空
      this.selectionList = [];

      // 这里是常规表格列表，每次搜索搜索之后都清空之前勾选的数据
      this.$refs.selection && this.$refs.selection.selectAll(false);

      // 列表加载传入api接口
      if (mapi) this.mapi = mapi;

      // 列表加载传入请求方式
      if (type) this.apiType = type;

      if (!(this.mapi && this.apiType)) {
        return Promise.reject(new Error('api和apiType必传'));
      }

      // 列表权限
      if (power) this.power = power;
      if (this.power && !this.getPermission(this.power)) {
        this.$Message.error('暂无查看列表权限');
        return;
      }

      // 打开loading
      this.tableLoading = true;

      // 获取请求参数
      let reqParams = this.$common.removeEmpty(this.searchParams);
      // console.log(reqParams, 'reqParams')

      // 根据不同请求方式发起请求
      if (this.apiType === 'post') {
        return this.requestPost(this.mapi, reqParams);
      }

      return this.requestGet(this.mapi, reqParams);
    },
    // get请求
    requestGet (mapi, reqParams) {
      return this.axios
        .get(mapi + '?' + Qs.stringify(reqParams))
        .then(res => {
          this.returnDate(res);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // post请求
    requestPost (mapi, paramsData) {
      return this.axios
        .post(mapi, paramsData)
        .then(res => {
          this.returnDate(res);
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 返回数据
    returnDate (res) {
      let data = res.data || {};
      if (data.code === 0 && data.datas) {
        this.tableList = data.datas.list || [];
        this.pageTotal = data.datas.total;
      }
    },
    // 检验搜索条件是否加上(通过比较值得改动来判断是不是输入条件)
    validateForm () {
      let [normalObj, nowsearchObj] = [{}, {}]; // normalObj 表单查询初始条件  nowsearchObj 表单查询条件
      Object.keys(this.searchParams).forEach(key => {
        var array = ['pageNum', 'pageSize', 'orderBy', 'orderSeq'];
        if (!~array.indexOf(key)) {
          let search = this.searchParams[key];
          nowsearchObj[key] = search;

          let resetOption = this.resetOption; // 重置条件配置(有些默认值非空字符串非空数组)
          let nullArr = ['', null, undefined, -99, '-99']; // 筛空字符串或全部
          if (resetOption && key in resetOption) {
            if (
              this.hideFormdata.includes(key) ||
                            nullArr.includes(resetOption[key])
            ) {
              normalObj[key] = resetOption[key];
              return;
            }
          }
          if (Array.isArray(search)) {
            normalObj[key] = [];
            return;
          }
          normalObj[key] = '';
        }
      });
      return JSON.stringify(normalObj) === JSON.stringify(nowsearchObj);
    },
    // 搜索
    search () {
      this.searchParams.pageNum = 1;
      this.fetch();
    },
    // 多选操作
    tableSelectChange (arr) {
      this.selectionList = this.$common.copy(arr);
    },
    // 页码切换事件
    pageNumChange (val) {
      this.searchParams.pageNum = val;
      this.fetch();
    },
    // 页数切换事件
    pageSizeChange (val) {
      this.searchParams.pageSize = val;
      this.fetch();
    },
    // 重置
    reset () {
      // 这里是表单查询
      Object.keys(this.searchParams).forEach(key => {
        var array = ['pageNum', 'pageSize', 'orderBy', 'orderSeq'];
        if (!~array.indexOf(key)) {
          let search = this.searchParams[key];
          let resetOption = this.resetOption; // 重置条件配置
          if (resetOption && key in resetOption) {
            this.searchParams[key] = resetOption[key];
            return;
          }
          if (Array.isArray(search)) {
            this.searchParams[key] = [];
            return;
          }
          this.searchParams[key] = '';
        }
      });
      // 这里是表单中不能直接传给后端的中间表单字段,比如看多个查询的例子
      Object.keys(this.arraySearch).forEach(key => {
        let search = this.arraySearch[key];
        let resetArray = this.resetArray; // 重置条件配置
        if (resetArray && key in resetArray) {
          this.arraySearch[key] = resetArray[key];
          return;
        }
        if (Array.isArray(search)) {
          this.arraySearch[key] = [];
          return;
        }
        this.arraySearch[key] = '';
      });
    },
    // 搜索栏按钮处理
    operation (type) {
      type == 'submit' && this.search(); // 搜索
      type == 'refresh' && this.reset(); // 重置
    }
  }
};
