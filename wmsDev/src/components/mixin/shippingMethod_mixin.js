// 多选物流方式
import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';
export default {
  data() {
    return {
      appendToBody: true,
      treeMultiple: true,
      retryTitle: '重试',
      noOptionsText: '无选项',
      treePlaceholder: '请选择',
      treeRetryText: '重试？',
      treeLimit: 1,
      treeClearable: true,
      shippingMethodModel: [],
      shippingMethodList: [],
    }
  },
  computed: {
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
  },
  created() {
    this.getShippingList();
  },
  methods: {
    getShippingList() {
      this.axios.get(api.get_enableCarriers + '?warehouseId=' + this.getWarehouseId() + '&isFilter=true' + '&time=' + new Date().getTime()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas || [];
          this.shippingMethodList = data.map(k => {
            return {
              ...k,
              id: k.carrierId,
              label: k.carrierName,
              children: null,
            }
          })
        }
      });
    },
    loadOptions({ action, parentNode, callback }) {
      if (['LOAD_CHILDREN_OPTIONS'].includes(action)) {
        this.axios.get(api.get_enableShippingMethods + '?carrierId=' + parentNode.id + '&warehouseId=' + this.getWarehouseId()).then(response => {
          if (response.data.code === 0) {
            let list = response.data.datas || [];
            parentNode.children = list.map(k => {
              k.id = k.shippingMethodId;
              k.label = k.carrierShippingMethodName;
              return k;
            })
            callback();
          } else {
            callback(new Error('加载失败，'))
          }
        }).catch(() => {
          callback(new Error('加载失败，'))
        });
      }
    },
  },
}