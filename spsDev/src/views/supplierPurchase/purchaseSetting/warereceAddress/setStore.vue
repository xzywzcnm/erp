<template>
  <div>
    <!-- eslint-disable-next-line vue/no-mutating-props -->
    <Modal
      class="modal-main"
      v-model="dialogObj.modelVisible"
      :mask-closable="false"
      title="绑定仓库"
      :width="800"
    >
      <div class="content">
        <Form ref="formValidate" :model="dialogObj.data" :label-width="80">
          <FormItem label="地址名称:">
            <span>{{ dialogObj.data.addressName || "-" }}</span>
          </FormItem>
          <FormItem label="绑定仓库:">
            <div>
              <Button
                v-for="item in checkList"
                :key="item"
                class="mr10"
                style="margin-bottom: 10px"
                >{{ item }}</Button
              >
            </div>
            <CheckboxGroup
              v-model="checkGroupVal"
              @on-change="checkValueChange"
            >
              <Checkbox
                :label="item.warehouseId"
                v-for="item in list"
                :key="item.warehouseId"
                >{{ item.warehouseName }}</Checkbox
              >
            </CheckboxGroup>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="handleSubmit()" :loading="loading"
          >保存
        </Button>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
export default {
  data() {
    return {
      list: [],
      checkGroupVal: [],
      loading: false,
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          modelVisible: false,
          title: "",
          data: {},
          warehouseArr: {},
        };
      },
    },
  },
  watch: {
    "dialogObj.modelVisible": {
      handler(newVal, oldVal) {
        if (newVal) {
          this.handleReset();
        }
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    checkList() {
      let checkName = [];
      this.list.forEach((item) => {
        if (this.checkGroupVal.includes(item.warehouseId)) {
          checkName.push(item.warehouseName)
        }
      });
      return checkName;
    },
  },
  methods: {
    // 提交
    handleSubmit() {
      let list = this.checkGroupVal;
      if (!list.length) {
        this.$Message.error("请勾选要绑定的仓库~");
        return;
      }
      list = list.map((k) => {
        return { warehouseId: k };
      });
      let temp = {};
      temp.addWarehouseQOList = list;
      console.log(this.dialogObj.data, "this.dialogObj.data");
      temp.addressIdList = this.dialogObj.data.addressIdList;
      // console.log(temp);
      // return;
      this.loading = true;
      this.axios
        .post(api.addressBinding, temp)
        .then(({ data }) => {
          if (data.code == 0) {
            this.$Message.info("操作成功");
            // eslint-disable-next-line vue/no-mutating-props
            this.dialogObj.modelVisible = false;
            this.$emit("fetch");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 重置
    handleReset() {
      if (!this.$common.isEmpty(this.dialogObj.data.warehouseIds)) {
        // 设置只能绑定一个仓库
        this.checkGroupVal = this.dialogObj.data.warehouseIds.slice(-1);
      }
      this.list = this.dialogObj.warehouseArr;
    },
    // 选择值改变
    checkValueChange(data) {
      // 设置只能绑定一个仓库
      if (!this.$common.isEmpty(data)) {
        this.checkGroupVal = data.slice(-1);
      } else {
        this.checkGroupVal = [];
      }
    },
  },
};
</script>