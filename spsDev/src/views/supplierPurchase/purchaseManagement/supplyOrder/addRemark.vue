<template>
  <div>
    <div class="paraTitle titleLeft" style="margin: 20px 0">
      采购备注
      <Icon type="md-add" class="addIcon" @click="addRemark" />
    </div>
    <div style="width: 100%; margin-left: 5px; font-size: 12px">
      <div
        v-for="(item, index) in showRemarkList"
        :key="index"
        class="remarkItemTextarea"
      >
        <div style="display: flex">
          <div style="width: 130px">{{ item.createdTime || "--" }}</div>
          <div
            style="
              margin-left: 10px;
              width: 110px;
              word-wrap: break-word;
              text-align: right;
            "
          >
            {{ item.name + "：" || "--" }}
          </div>
          <div class="itemRemark" style="width: 1100px">
            {{ item.remark || "--" }}
          </div>
        </div>
      </div>
    </div>
    <div class="remarkItemTextarea">
      <div style="display: flex" v-if="isEdit">
        <Input
          type="textarea"
          v-model="remarkInp"
          class="textareaContent"
          maxlength="500"
        ></Input>
        <Button type="primary" style="margin: 40px 0 0 10px" @click="saveRemark"
          >保存</Button
        >
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import { time_now } from "@/utils/comfun.js";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],

  props: {
    isVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    showRemarkList: {
      type: Array,
      default() {
        return [];
      },
    },
    purchaseId: {
      type: String,
      default() {
        return "";
      },
    },
  },

  watch: {
    isVisible: {
      handler(val) {
        this.isEdit = val;
        this.showRemarkArr = this.showRemarkList;
        this.id = this.purchaseId;
        this.userName =
          this.$store.state.allUser[this.$store.state.userInfo.userId].userName;
      },
    },
    isEdit: {
      handler(val) {
        this.$emit("update:isVisible", val);
      },
    },
  },

  data() {
    return {
      isEdit: false,
      remarkInp: "",
      showRemarkArr: [],
      userName: "",
    };
  },

  methods: {
    time_now,
    addRemark() {
      this.isEdit = !this.isEdit;
    },
    saveRemark() {
      if (this.remarkInp != "") {
        let temp = {
          createdTime: this.time_now(),
          name: this.userName,
          remark: this.remarkInp,
        };
        if (this.showRemarkArr == null) {
          this.showRemarkArr = [];
          this.showRemarkArr.push(temp);
        } else {
          this.showRemarkArr.unshift(temp);
        }
        this.axios
          .post(
            api.purchaseRemark,
            {},
            { params: { purchaseId: this.id, remark: this.remarkInp } }
          )
          .then((res) => {
            if (res.status === 200) {
              this.$Message.success(res.data.message);
            }
          });
        this.remarkInp = "";
      }
      this.isEdit = false;
    },
  },
};
</script>

<style scoped>
.itemRemark {
  margin-left: 15px;
  display: inline;
  white-space: pre-wrap;
  width: 400px;
}
.addIcon {
  font-size: 20px;
  font-weight: 600;
  color: #2d8cf0;
  margin-left: 10px;
  cursor: pointer;
}
.paraTitle {
  font-size: 16px;
  font-weight: bold;
}
.remarkItemTextarea {
  margin: 10px 0 0 30px;
}
.remarkItemTextarea >>> .ivu-form-item-content {
  line-height: 20px !important;
}
.textareaContent >>> textarea {
  width: 800px !important;
  height: 73px !important;
}
.textareaContent {
  width: 800px;
}
</style>