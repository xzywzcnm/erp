import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';
export default {
  data() {
    return {
      warehouseList: {},
      transWarehouse: ['佛山丽山仓', '六楼全托管仓'],
    };
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    isTransWarehouse() {
      let wareInfo = this.warehouseList[this.warehouseId] || {};
      // console.log(wareInfo, this.transWarehouse.includes(wareInfo.warehouseName))
      return this.transWarehouse.includes(wareInfo.warehouseName);
    },
  },
  created() {
    this.getWarehouseList();
  },
  methods: {
    // 获取仓库列表
    getWarehouseList() {
      this.$store.dispatch('getWarehouseList').then(list => {
        this.warehouseList = this.$common.arrayToObj(list || [], 'warehouseId');
      })
    },
    getLapaSku(sku) {
      return new Promise(resolve => {
        this.axios.post(api.scanConvert + sku, {}, { hiddenError: true }).then(res => {
          if (res.data.code === 0) {
            resolve(this.$common.isEmpty(res.data.datas) ? sku : res.data.datas);
          } else {
            resolve(sku);
          }
        }).catch(() => {
          resolve(sku);
        })
      })
    },
  },
};
