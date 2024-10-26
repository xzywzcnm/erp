import api from '@/api/api';

export default {
  data () {
    return {
      // 商品标签列表
      productTagList: [], // 商品标签列表
      customProductTagList: [], // 这个标签列表包含自定义标签
      // 分拣 light
      state: 0, // 0为初始状态，1为正在打开，2为已经打开，3为打开失败
      socket: null,
      timeLeft: 0
    };
  },
  methods: {
    getWareHoseName (warehouseId) {
      // 根绝warehoseId
      let v = this;
      let status = 0;
      if (v.storeList.length === 0) {
        return '未匹配';
      }
      for (let i = 0; i < v.storeList.length; i++) {
        let item = v.storeList[i];
        if (item.warehouseId === warehouseId) {
          status = 1;
          return item.warehouseName;
        }
        if (i === v.storeList.length - 1 && status === 0) {
          return '未匹配';
        }
      }
    },
    getProductTagList (prefix) {
      // 获取标签列表(筛选下拉)
      let v = this;
      return new Promise(resolve => {
        let url = api.get_labelNames;
        if (prefix) {
          url = prefix + url;
        }
        v.axios.get(url).then(function (response) {
          if (response.data.code === 0) {
            v.productTagList = response.data.datas;
            v.customProductTagList = v.deepCopy(response.data.datas);
            resolve(true);
          }
        });
      });
    }
  }
};
