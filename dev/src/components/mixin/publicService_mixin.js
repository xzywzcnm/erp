import api from '@/api/api';

export default {
  data () {
    return {
      // 仓库列表相关属性
      storeStatus: false,
      storeList: [],
      storeJson: {},
      selectStore: '', // 选中仓库
      productTagList: [], // 商品标签列表
      customProductTagList: [], // 这个标签列表包含自定义标签
      // 分拣 light
      state: 0, // 0为初始状态，1为正在打开，2为已经打开，3为打开失败
      socket: null,
      timeLeft: 0,
      allStoreJson: {},
      allStorelist: [] // 全部仓库列表
    };
  },
  methods: {
    // 获取账户对应权限的仓库列表
    getStore (type) {
      return new Promise((resolve, reject) => {
        this.storeJson = {};
        if (this.storeList && this.storeList.length) {
          this.storeList.forEach(item => {
            this.$set(this.storeJson, item.warehouseId, item)
          });
          resolve(this.storeList);
          return;
        }
        this.axios.post(api.queryUserAllwarehouse).then(response => {
          if (response.data && response.data.code === 0) {
            let list = response.data.datas || [];
            this.storeList = this.$common.copy(list);
            list.forEach(item => {
              this.$set(this.storeJson, item.warehouseId, item)
            });
            this.storeStatus = true; // 暂时写死(不知道通途设置这个来做什么555)
            if (type !== 3 && list[0]) this.selectStore = list[0].warehouseId;
            resolve(list);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(false);
          }
        }).catch(err => {
          reject(err);
        })
      });
    },
    // 获取所有的仓库列表
    getAllstore (type, storeType, prefix) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getAllstore').then((list) => {
          this.allStorelist = list || [];
          list.forEach(item => {
            this.$set(this.allStoreJson, item.warehouseId, item)
          });
          this.storeStatus = true; // 暂时写死(不知道通途设置这个来做什么555)
          if (storeType !== 3 && list[0]) this.selectStore = list[0].warehouseId;
          resolve(list);
        }).catch(err => {
          reject(err);
        })

        // if (!prefix) prefix = '/order-service/erpCommon';
        // const erpCommon = this.$store.state.erpConfig;
        // let obj = {
        //   userId: erpCommon.userInfo.userId,
        //   merchantId: erpCommon.userInfo.merchantId,
        //   warehouseStatus: type,//仓库状态(0正常1禁用null全部)
        // };
        // this.axios.post(prefix + api.get_storeList, obj).then(response => {
        //   if (response.data && response.data.code === 0) {
        //     let list = response.data.datas || [];
        //     this.allStorelist = list;
        //     this.storeStatus = true; // 暂时写死(不知道通途设置这个来做什么555)
        //     if (storeType !== 3 && list[0]) this.selectStore = list[0].warehouseId;
        //     resolve(list);
        //   } else {
        //     reject(false);
        //   }
        // }).catch(err => {
        //   reject(err);
        // })
      });
    },
    // 从仓库列表查找仓库名
    findWareHouseName (warehouseId, listType) {
      const EmptyName = '未匹配';
      let matchingItem = (this[listType] || []).filter(item => {
        return item.warehouseId === warehouseId;
      })
      let warehouseName = matchingItem[0] && matchingItem[0].warehouseName;
      return warehouseName || EmptyName;
    },
    // 获取标签列表(筛选下拉)
    getProductTagList (prefix) {
      return new Promise((resolve, reject) => {
        const url = (prefix || '') + api.get_labelNames;
        this.axios.get(url, { hiddenError: true }).then((response) => {
          if (response.data && response.data.code === 0) {
            let list = response.data.datas || [];
            this.productTagList = list;
            this.customProductTagList = this.deepCopy(list);
            if (this.$route.query.tagId) {
              this.pageParams.tagNames = [this.$route.query.tagId];
            }
            resolve(true);
          } else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject(false);
          }
        }).catch(err => {
          reject(err);
        })
      })
    }
  }
};
