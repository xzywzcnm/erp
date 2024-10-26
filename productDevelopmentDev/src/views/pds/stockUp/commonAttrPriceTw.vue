<template>
  <Modal
    v-model="attrPrice"
    :title="attrPriceTitle"
    class="clearMarginAuto"
    width="680"
    @on-visible-change="attrPriceChange"
  >
    <p slot="header" @mousedown="moveMt" class="moveHead">
      <span>{{ attrPriceTitle }}</span>
    </p>
    <Table
      :columns="attrPriceColumns"
      style="max-height: 568px"
      highlight-row
      :data="newDate"
      @on-selection-change="selectionChange"
    ></Table>
    <div slot="footer">
      <Button type="text" @click="attrPrice = false">取消</Button>
      <Button type="primary" @click="addAttrPrice">确定</Button>
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

/**
 * 多属性
 * 两个多属性页面对应不同界面
 * */
export default {
  name: "commonAttrPriceTw",
  mixins: [CommonMixin],
  props: ["productAttrs", "attrPriceDateInit", "newDateInit"], /*  *
   * productGoodsInfoResultList 在供货商多属性选择的子产品
   * */
  components: {},
  data () {
    // let v = this;
    return {
      attrPrice: false,
      attrPriceTitle: "多属性价格",
      attrPriceColumns: [],
      attrPriceDate: [],
      initDate: "",
      emitDate: [],
      newDate: []
    };
  },
  created () {},
  methods: {
    selectionChange (val) {
      let v = this;
      v.emitDate = val;
    },
    attrPriceChange (val) {
      let v = this;
      if (val) {
        this.getVariList(function () {
          if (v.attrPriceDateInit) {
            v.attrPriceDateInit.forEach((item) => {
              v.attrPriceDate.forEach((priceItem) => {
                if (item.productGoodsId === priceItem.productGoodsId) {
                  priceItem.unitPrice = item.goodPrice;
                  priceItem.goodWeight = item.goodWeight;
                  priceItem.productGoodsId = item.productGoodsId;
                  priceItem.variQuotationId = item.variQuotationId;
                  if (item.purchaseAmount) {
                    priceItem.purchaseAmount = item.purchaseAmount;
                  } else {
                    priceItem.purchaseAmount = "";
                  }
                }
              });
            });
            v.newDate = [];
            v.attrPriceDate.forEach((item) => {
              if (item.unitPrice !== "" && item.goodWeight !== "") {
                v.newDate.push(item);
              }
            });
            v.newDateInit.forEach((item) => {
              v.newDate.forEach((child) => {
                if (item.productGoodsId === child.productGoodsId) {
                  child.purchaseAmount = item.purchaseAmount;
                  child._checked = true;
                }
              });
            });
          }
        });
      }
    },
    getVariList (callback) {
      let v = this;
      v.$axios
        .get(api.getQueryVari + "?productId=" + v.$store.state.createId)
        .then((res) => {
          if (res.code === 0) {
            var data = res.datas;
            v.fixDate(data);
            callback && callback();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    fixDate (data) {
      let v = this;
      let columns = [
        {
          type: "selection",
          width: 60,
          align: "center",
          fixed: "left"
          /**
           * fixed
           * 测试：60条数据后 输入框巨卡
           * */
        },
        {
          title: "序号",
          width: 60,
          key: "index"
        }
      ];
      data[0].variTypeNameList.forEach((item, index) => {
        columns.splice(2, 0, {
          align: "center",
          title: item,
          index: index + 1,
          render: (h, params) => {
            return h("div", params.row.variationNameList[index]);
          }
        });
      });
      /* columns.push({
       align:'center',
       key:'purchaseAmount',
       width:100,
       renderHeader(h){
       return h('div',{},[
       h('span','采购数量'),
       h('Checkbox',{
       on:{
       'on-change' (val) {
       if(val){
       if(v.attrPriceDate[0].purchaseAmount===''){
       v.$msg.error({
       content:'请填写第一个采购数量',
       duration:5
       });
       return ;
       }
       v.attrPriceDate.forEach(item=>{
       item.purchaseAmount=v.attrPriceDate[0].purchaseAmount;
       })
       }

       }
       }
       }),
       h('span','相同')
       ])
       },
       render(h,params){
       return h('Input',{
       props:{
       value:params.row.purchaseAmount
       },
       on:{
       input: (val) => {
       v.$set(v.attrPriceDate[params.index],'purchaseAmount',val)
       }
       }
       })
       }
       })
       columns.push({
       align:'center',
       key:'goodWeight',
       width:100,
       renderHeader(h){
       return h('div',{},[
       h('span','重量（g）'),
       h('Checkbox',{
       on:{
       'on-change' (val) {
       if(val){
       if(v.attrPriceDate[0].goodWeight===''){
       v.$msg.error({
       content:'请填写第一个重量',
       duration:5
       });
       return ;
       }
       v.attrPriceDate.forEach(item=>{
       item.goodWeight=v.attrPriceDate[0].goodWeight;
       })
       }
       }
       }
       }),
       h('span','相同')
       ])
       },
       render(h,params){
       return h('Input',{
       props:{
       value:params.row.goodWeight
       },
       on:{
       input: (val) => {
       v.$set(v.attrPriceDate[params.index],'goodWeight',val)
       }
       }
       })
       }
       });
       columns.push({
       align:'center',
       key:'goodPrice',
       width:100,
       renderHeader(h){
       return h('div',{},[
       h('span','产品单价'),
       h('Checkbox',{
       on:{
       'on-change' (val) {
       if(val){
       if(v.attrPriceDate[0].unitPrice===''){
       v.$msg.error({
       content:'请填写第一个产品单价',
       duration:5
       });
       return ;
       }
       v.attrPriceDate.forEach(item=>{
       item.unitPrice=v.attrPriceDate[0].unitPrice;
       })
       }
       }
       }
       }),
       h('span','相同')
       ])
       },
       render(h,params){
       return h('Input',{
       props:{
       value:params.row.unitPrice
       },
       on:{
       input: (val) => {
       v.$set(v.attrPriceDate[params.index],'unitPrice',val)
       }
       }
       })
       }
       }); */
      v.attrPriceColumns = columns;
      data.forEach((item, index) => {
        item.index = index + 1;
        if (item.unitPrice === undefined) {
          item.unitPrice = "";
        }
        if (item.goodWeight === undefined) {
          item.goodWeight = "";
        }
        if (item.purchaseAmount === undefined) {
          item.purchaseAmount = "";
        }
      });
      v.attrPriceDate = data;
    },
    addAttrPrice () {
      let v = this;
      /*  if(v.emitDate.length <1){
       v.$msg.info('未选择产品');
       v.attrPrice=false;
       }else {
       v.emitDate.forEach((item,index)=>{
       if(item.purchaseAmount==''||item.unitPrice==''||item.goodWeight==''){
       arr.push(index)
       }
       });
       if(arr.length>0){
       let str='';
       arr.forEach(item=>{
       str+='、'+item
       });
       v.$msg.error({
       content:'序号'+str+'，请填写完整,包含（采购数量，采购价格，采购重量）',
       duration:5
       })
       }else {
       v.emitDate.forEach(item=>{
       item.specifications=item.variationNameList.join('/');
       item.productId=v.$store.state.createId;
       item.productCode=null;
       }); */
      v.emitDate.forEach((item) => {
        item.specifications = item.variationNameList.join("/");
        item.productId = v.$store.state.createId;
        item.productCode = null;
      });
      v.$emit("getAttrPrice", v.emitDate);
      v.attrPrice = false;
    }
  }
};
</script>

<style scoped></style>
