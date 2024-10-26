<template>
  <div>
    <Modal v-model="isVisible" title="选择平台和店铺" width="500px" :mask-closable="false" class="selectPlatform formDetail">
      <div>
        <Form ref="tableForm" :model="mainInfo" :rules="ruleValidate" :label-width="100">
          <Form-item label="平台主体：" prop="platformType">
            <dyt-select v-model="mainInfo.platformType" @on-change="platformChange">
              <Option v-for="(item, index) in platformList" :value="item.value" :key="index + 'platformType'"
                :label="item.label">
              </Option>
            </dyt-select>
          </Form-item>
          <FormItem label="店铺：" prop="saleAccount">
            <!--  @on-change="saleAccountChange" -->
            <dyt-select v-model="mainInfo.saleAccount">
              <Option v-for="(item, index) in shopList" :value="item.accountCode" :key="index + 'saleAccount'"
                :label="item.accountCode" />
            </dyt-select>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="confirmData">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { outListTypeList, arrayToObj } from "./fileData";
export default {
  name: "selectPlatform",
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      isVisible: false,
      mainInfo: {
        platformType: '',
        saleAccount: '',
        // platformId: '',
        // saleAccountId: '',
      },
      ruleValidate: {
        platformType: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        saleAccount: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
      },
      platformList: arrayToObj(outListTypeList),
      shopList: [],
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", false);
      },
      deep: true,
    },
  },
  computed: {},
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.resetData();
      this.$nextTick(() => {
        this.resetData();
      })
    },
    resetData() {
      this.$refs['tableForm'].resetFields();
      // this.mainInfo.platformId = null;
      // this.mainInfo.saleAccountId = null;
    },
    // 根据平台获取对应的店铺信息
    platformChange(e) {
      let item = this.platformList[e] || {};
      // this.mainInfo.platformId = item.platformId;
      this.$store.dispatch("getAllStoreList", { platformId: item.platformId }).then((list) => {
        this.mainInfo.saleAccount = "";
        this.shopList = list;
      });
    },
    // saleAccountChange(e) {
    //   let list = arrayToObj(this.shopList, 'accountCode');
    //   let item = list[e] || {};
    //   this.mainInfo.saleAccountId = item.saleAccountId;
    // },
    confirmData() {
      this.$refs['tableForm'].validate((valid) => {
        if (!valid) return;
        this.$emit('addStock', this.$common.copy(this.mainInfo));
        this.isVisible = false;
      })
    },
  },
};
</script>

<style lang="less"></style>