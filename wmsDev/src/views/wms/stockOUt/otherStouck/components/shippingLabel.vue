<template>
  <div>
    <Modal v-model="isVisible" title="打印发货标签" width="80%" :mask-closable="false" class="shippingLabelPage"
      :footer-hide="true">
      <Form :model="formValidate" ref="formValidate" :label-width="100" class="formDetail" @submit.native.prevent>
        <FormItem label="货箱编号:" class="formWidth240" prop="pickingBoxNo">
          <dyt-input :disabled="loading" v-model.trim="formValidate.pickingBoxNo" placeholder="回车/扫描货箱编号" ref="skuDom"
            @on-keyup.enter="pickingBoxNoChange"></dyt-input>
        </FormItem>
      </Form>

      <!-- 货箱信息 -->
      <information-detail ref="informationDetail" :modelVisible="isVisible" :detailData="detailData"
        :pickingData="pickingData"></information-detail>

      <!-- 打印标签 -->
      <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData"
        :pintField="pintField"></print-common>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import informationDetail from './informationDetail.vue';
import printCommon from '@/views/wms/components/pirntCommon/index';
import { temuLabel } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';
export default {
  name: 'shippingLabel',
  components: { informationDetail, printCommon },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    detailData: {// 出库单详情信息
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      isVisible: false,
      formValidate: {
        pickingBoxNo: '',
      },
      pickingData: {}, // 某一箱数据
      allPickingList: {}, // 全部货箱数据
      loading: false,
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (!val) {
          this.$emit('update:modelVisible', val);
        }
      },
      deep: true
    },
  },
  computed: {
    // 根据不同出库类型不同打印内容
    pintField() {
      return temuLabel['sendLabel'] || {};
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.pickingData = {};
      let pickingBoxes = this.detailData.pickingBoxes || {};
      let list = pickingBoxes.pickingBoxesVOS || [];
      list.forEach(k => {
        this.allPickingList[k.boxCode] = k;
      })
      this.resetForm();
    },
    // 扫描
    pickingBoxNoChange() {
      let pickingBoxNo = this.formValidate.pickingBoxNo;
      if (!pickingBoxNo) return this.$Message.error('请输入货箱编号~');
      let item = this.allPickingList[pickingBoxNo];
      if (!item) {
        this.$Message.error('不存在该货箱~');
        this.resetForm();
        return false;
      }
      if (!item.deliveryOrderSn) {
        this.$Message.error('不存在发货单号~');
        this.resetForm();
        return false;
      }
      this.pickingData = item;

      let temp = {};
      temp.pickingId = this.detailData.pickingId;
      temp.deliveryOrderSn = item.deliveryOrderSn;
      temp.pickingBoxNo = pickingBoxNo;

      // console.log(temp);
      this.loading = true;
      this.axios.post(api.getBoxMarkLabelInfo, temp).then(({ data }) => {
        if (!(data && data.code === 0)) {
          this.loading = false;
          this.resetForm();
          return false;
        }
        this.printLabel(data.datas).finally(() => {
          this.loading = false;
          this.resetForm();
        })
        this.$refs['informationDetail'].open();
      }).catch(() => {
        this.loading = false;
        this.resetForm();
      })
    },
    // 打印货箱标签
    printLabel(data) {
      this.printData = [];
      // 处理数据
      // data.packageNum
      // for (let i = 1; i <= data.totalPackageNum; i++) {
      let temp = Object.assign({}, data);
      // temp.packageIndex = data.packageIndex;
      temp.packageText = `第${data.packageIndex}包（共${data.totalPackageNum}包）`;
      temp.productSkcIdText = 'SKC ' + temp.productSkcId;
      temp.skcExtCodeText = 'SKC货号 ' + temp.skcExtCode;
      temp.packageSkcNumText = `x ${temp.packageSkcNum}件`;
      temp.vim = 'VMI';
      temp.time1 = `发货日期：${temp.time}`;
      temp.packageSn1 = temp.packageSn;
      temp.printNum = 1;
      this.printData.push(temp);
      // }
      // console.log(data, this.printData);
      return new Promise((resolve) => {
        this.$nextTick(() => {
          // this.printModal = true;
          // resolve();
          let printCommon = this.$refs.printCommon;
          if (printCommon) {
            printCommon.setData().then(() => {
              printCommon.pintAll();
              let timer = null;
              // 这里要等待打印加载完毕才能回调，因为完成装箱关闭页面会导致打印获取不到打印内容而出错
              let fun = () => {
                if (!printCommon.loading) {
                  clearTimeout(timer);// 清空一次性定时器
                  resolve();
                  return;
                }
                setTimeout(() => {
                  fun();
                }, 200)
              }
              setTimeout(() => {
                fun();
              }, 200)

              // 1分钟后，弹框未关闭，则自动关掉定时器
              timer = setTimeout(() => {
                if (printCommon.loading) resolve();
              }, 60000);
            })
          } else {
            resolve();
          }
        })
      })
    },
    resetForm() {
      this.$nextTick(() => {
        this.$refs['formValidate'].resetFields();
        this.$refs["skuDom"] && this.$refs["skuDom"].focus();
      })
    }
  }
}
</script>

<style lang="less">

</style>
