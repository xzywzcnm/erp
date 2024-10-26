export default {
  state: {
    isEditable:true,
    winFilter:[]
  },
  mutations: {
    edit(state){
      state.isEditable = false
      console.log(state.isEditable,'state.isEditable');
    },
    getPictureList(state,payload){
      state.winFilter = payload
      console.log(state.winFilter,'state.winFilter');
    }
  },
  actions: {
        
  }
};
    