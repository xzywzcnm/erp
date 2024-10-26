// cs store
export default {
  state: {
    orderDetails: null,
    contactBuyer: {}, // 缓存订单详情中当前选中联系买家的信息
    orderShippingDetails: [], // 订单物流信息
  },
  mutations: {
    orderDetails (state, data) {
      state.orderDetails = data;
    },
    orderShippingDetails (state, data) {
      state.orderShippingDetails = data;
    },
    contactBuyer (state, data) {
      state.contactBuyer = data;
    }
  },
  actions: {},
  getters: {
    getOrderDetails (state) {
      return state.orderDetails;
    }
  }
};
