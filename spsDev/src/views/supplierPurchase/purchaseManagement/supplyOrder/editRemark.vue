<template>
  <div>
    <Modal v-model="formData.modelVisible" title="需方备注" @on-cancel="cancelRemark" @on-ok="submitRemark" width="800px" class="modalDirection" :mask="false" :mask-closable="false">
      <div :title="formData.list.supplierRemark" class="supplierRemarkText">供方备注：{{formData.list.supplierRemark || '-'}}</div>
      <div class="textareaContent">
        <div>发货要求：</div>
        <!-- <div><textarea class="textareaBox" v-model="requireDespatch"></textarea></div> -->
        <Input v-model="requireDespatch" maxlength="100" show-word-limit type="textarea" placeholder="请输入发货要求..." style="width: 400px" />
        <div class="textareaTips">发货要求对订单所有SKU有效</div>
      </div>
      <div class="textareaContent">
        <div>需方备注：</div>
        <Input v-model="purchaserRemark" maxlength="100" show-word-limit type="textarea" placeholder="请输入需方备注..." style="width: 400px" />
        <div class="textareaTips">需方备注对选择的SKU有效</div>
      </div>
      <div class="textareaContent">
        <div>跟单备注：</div>
        <Input v-model="followRemark" maxlength="100" show-word-limit type="textarea" placeholder="请输入跟单备注..." style="width: 400px" />
        <div class="textareaTips">跟单备注对选择的SKU有效</div>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';

export default {
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          list: {},
          purchaserRemark: '',
          requireDespatch: '',
          followRemark: ''
        };
      }
    }
  },
  data () {
    return {
      formData: this.dialogObj,
      purchaserRemark: this.dialogObj.purchaserRemark,
      requireDespatch: this.dialogObj.requireDespatch,
      followRemark: this.dialogObj.followRemark
    }
  },
  watch: {
    'dialogObj.modelVisible': {
      handler: function () {
        if (this.dialogObj.modelVisible == true) {
          this.formData = this.dialogObj;
          this.purchaserRemark = this.dialogObj.purchaserRemark;
          this.requireDespatch = this.dialogObj.requireDespatch;
          this.followRemark = this.dialogObj.followRemark;
        }
      }
    }
  },
  methods: {
    // 提交
    submitRemark () {
      let row = this.formData.list;
      let temp = {
        id: parseInt(row.orderInfoGoodsId),
        supplierOrderId: row.purchaseNumber,
        skuNo: row.skuNo,
        purchaserRemark: this.purchaserRemark,
        requireDespatch: this.requireDespatch,
        followRemark: this.followRemark,
        orderType: row.orderType,
      }
      this.axios.post(api.modifyRemark, temp).then(({ data }) => {
        if (data.code == 0) {
          this.$Message.success(data.datas);
          this.$emit('showItemRemark', temp)
        }
      }).finally(err => {
        this.formData.modelVisible = false
      })
    },
    cancelRemark () {
      this.formData.modelVisible = false
    },
  }
}
</script>

<style scoped>
.requireText {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.remarkText {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin: 10px 0;
}
.iconContent {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.iconText {
  background-color: #eee;
  color: #00bfff;
}
.modalDirection >>> .ivu-modal-wrap {
  top: 230px;
}
.textareaContent {
  display: flex;
  margin: 20px 10px;
}
.supplierRemarkText {
  margin: 20px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.textareaBox {
  width: 400px;
  height: 60px;
  padding: 10px;
}
.textareaTips {
  margin-left: 10px;
  color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>