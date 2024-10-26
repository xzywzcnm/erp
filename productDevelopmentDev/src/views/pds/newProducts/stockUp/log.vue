<template>
  <div>
    <p v-for="(item,index) in list" :key="index" class="log-main">
      <span v-if="item.createdTime">{{item.createdTime ? getDataToLocalTime(item.createdTime, "fulltime") : ''}}</span>
      <span class="lineText" v-if="item.operatorId">
        <span v-for="litem in purchaserArr" :key="litem.userId">{{item.operatorId === litem.userId ? litem.userName : ''}}</span>
      </span>
      <span v-if="item.logContent && item.logContent != '指派填写文本资料和填写图片资料'">{{item.logContent}}</span>
      <span v-if="item.logContent == '指派填写文本资料和填写图片资料'">指派填写图片资料和填写文本资料</span>
      <span class="lineText" v-if="item.receiverId">
        <span v-for="litem in purchaserArr" :key="litem.userId">{{item.receiverId === litem.userId ? litem.userName : ''}}</span>
      </span>
      <span class="lineText" v-if="item.logContent == '指派填写文本资料和填写图片资料'">
        <span v-for="litem in purchaserArr" :key="litem.userId">
          <span>{{item.receiverId[0] === litem.userId ? litem.userName+' ' : ''}}</span>
          <span>{{item.receiverId[1] === litem.userId ? litem.userName : ''}}</span>
        </span>
       
      </span>
      <span v-if="item.logRemarks">备注：{{item.logRemarks}}</span>
    </p>
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template> 
 
<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
export default {
  name: "log",
  mixins: [CommonMixin],
  components: {},
  data () {
    return {
      pageLoading: false,
      list: [],
    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    purchaserArr: {
      type: Array,
      default () {
        return [];
      }
    },
  },
  created () {
    this.getLogList();
  },
  methods: {
    getLogList () {
      let { productId } = this.productData;
      this.pageLoading = true;
      this.$axios
        .get(api.queryLog, { params: { productId } })
        .then(({ code, datas }) => {
          if (code !== 0) return;
          this.list = datas || [];
          this.list.forEach(item =>{
            if(item.logContent == '指派填写文本资料和填写图片资料'){
              console.log(item.receiverId);
              let a = item.receiverId.split(";");
              item.receiverId = a
            }
          })
        }).finally(() => {
          this.pageLoading = false;
        });
    }
  }
};
</script>

<style>
.log-main > span {
  display: inline-block;
  margin-right: 20px;
  margin-top: 16px;
}
.log-main .lineText {
  color: #2d8cf0;
}
</style>