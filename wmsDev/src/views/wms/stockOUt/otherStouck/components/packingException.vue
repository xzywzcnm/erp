<template>
  <div>
    <Modal v-model="isVisible" title="装箱" :width="500" :mask-closable="false" class="packingExceptionPage">
      <Form :ref="formName" :model="formValidate" :rules="ruleValidate" :label-width="110" class="formDetail">
        <template v-if="isTemu">
          <FormItem label="货箱称重总重量" prop="weight" class="box-kg">
            <Input v-model="formValidate.weight" placeholder="请输入"><span slot="append">kg</span></Input>
          </FormItem>
        </template>
        <template v-else>
          <FormItem label="货箱型号" prop="boxTypeCode">
            <Select v-model="formValidate.boxTypeCode" placeholder="请选择" @on-change="boxTypeCodeChange">
              <Option v-for="(item, index) in containerModelList" :key="index" :value="item.boxId">
                {{ item.boxTypeName }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="货箱整箱称重" prop="weight" class="box-kg">
            <Input v-model="formValidate.weight" placeholder="请输入"><span slot="append">kg</span></Input>
          </FormItem>
          <FormItem label="货箱尺寸" prop="boxSize" class="box-size">
            <div class="box-size__div">
              <Input v-model.number="formValidate.boxSize.length" placeholder="长" class="mr10" type="number"><span
                slot="append">cm</span></Input>
              <Input v-model.number="formValidate.boxSize.width" placeholder="宽" class="mr10" type="number"><span
                slot="append">cm</span></Input>
              <Input v-model.number="formValidate.boxSize.height" placeholder="高" type="number"><span
                slot="append">cm</span></Input>
            </div>
          </FormItem>
          <div class="fmb0">
            <FormItem label="计抛重量" class="box-kg">
              <div>{{ throwingWeight }} kg</div>
            </FormItem>
            <FormItem label="抛重比" class="box-kg">
              <div>{{ throwingWeightRatio }} %</div>
            </FormItem>
          </div>
          <div class="throwingStyle">
            <div>1.计抛重量=体积（长cm*宽cm*高cm）/6000；</div>
            <div>2.抛重比=计抛重量/重量；</div>
          </div>
        </template>
      </Form>
      <div slot="footer">
        <template v-if="!isTemu">
          <Button type="error" @click="handleSubmit(3)" :loading="errorLoading"
            v-if="pickingDetail.skuUnBoxNum > 0 && !repicking">出库单结束装箱</Button>
          <Button type="primary" @click="handleSubmit(2)" :loading="goonLoading"
            v-if="pickingDetail.skuUnBoxNum > 0 || repicking">继续装箱</Button>
          <Button type="primary" @click="handleSubmit(1)" :loading="finishLoading"
            v-if="pickingDetail.skuUnBoxNum <= 0 && !repicking">出库单完成装箱</Button>
        </template>
        <template v-else>
          <Button type="primary" @click="handleSubmit(1)" :loading="finishLoading">出库单完成装箱</Button>
        </template>
      </div>
    </Modal>

    <!-- 打印标签 -->
    <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData" :pintField="pintField"
      :printMessage="printMessage"></print-common>

    <!-- temu装箱 -->
    <Modal v-model="temuConfirmVisible" title="货箱完成装箱" :width="500" :mask-closable="false" class="temuPackPage">
      <div class="contents">
        <Icon type="md-alert" class="mr10 icons" />
        是否完成装箱，进入下一箱装箱环节？
      </div>
      <div slot="footer">
        <Button type="error" @click="temuSubmit(2)" :loading="errorLoading">出库单结束装箱</Button>
        <Button type="primary" @click="temuSubmit(1)" :loading="finishLoading">完成装箱</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Big from 'big.js';
import api from '@/api/api';
import printCommon from '@/views/wms/components/pirntCommon/index';
import { boxLabel, temuLabel } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';
const patternFloat = { message: '大于0的数字,小数精度1位', pattern: /^[1-9][0-9]{0,}(\.\d{1})?$/ };
export default {
  name: 'packingException',
  components: { printCommon },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    pickingDetail: {
      type: Object,
      default() {
        return {}
      }
    },
    rowData: {
      type: Object,
      default() {
        return {}
      }
    },
    repicking: {// 是否重新装箱
      type: Boolean,
      default() {
        return false
      }
    },
    temuVisible: {// temu装箱确认弹框
      type: Boolean,
      default() {
        return false
      }
    },
  },
  data() {
    return {
      formName: 'formValidate',
      isVisible: false,
      formValidate: {
        boxTypeCode: '',
        weight: '',
        boxSize: {
          length: '',
          width: '',
          height: ''
        }
      },
      ruleValidate: {
        weight: [
          { required: true, message: '请输入', trigger: 'blur' },
          { type: 'string', message: '大于0的数字,小数精度3位', pattern: /^[1-9][0-9]{0,}(\.\d{1,3})?$/ }
        ],
        boxSize: [
          {
            type: 'object',
            required: true,
            fields: {
              length: [
                { type: 'number', required: true, message: '请输入长', trigger: 'blur' },
                patternFloat
              ],
              width: [
                { type: 'number', required: true, message: '请输入宽', trigger: 'blur' },
                patternFloat
              ],
              height: [
                { type: 'number', required: true, message: '请输入高', trigger: 'blur' },
                patternFloat
              ]
            }
          }
        ]
      },
      containerModelList: [],
      boxArr: ['length', 'width', 'height'],
      errorLoading: false,
      goonLoading: false,
      finishLoading: false,
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      printMessage: false, // 打印提示
      temuConfirmVisible: false, // temu装箱确认弹框
      isTemuFinish: false, // 完成装箱
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
        if (val) return;
        this.reset();
        this.$nextTick(() => {
          this.$refs[this.formName].resetFields();
          this.$emit('update:modelVisible', val);
        })
      },
      deep: true
    },
    temuVisible: {
      handler(val) {
        val && (this.temuConfirmVisible = val);
        this.isTemuFinish = false;
      },
      deep: true
    },
    temuConfirmVisible: {
      handler(val) {
        !val && this.$emit('update:temuVisible', val);
      },
      deep: true
    },
  },
  computed: {
    // 根据不同出库类型不同打印内容
    pintField() {
      let { pickingType, pickingSubType } = this.rowData || {};
      !pickingType && (pickingType = 'O5');// 不存在出库单类型，则默认为FBA出库单
      if (pickingType === 'O11') {
        let str = 'box' + pickingSubType;
        if (this.isTemuFinish) str = 'address';
        return temuLabel[str] || {};
      } else {
        return boxLabel[pickingType] || {};
      }
    },
    // 计抛重量=体积（长cm*宽cm*高cm）/ 6000 两位小数，四舍五入
    throwingWeight() {
      let { length, width, height } = this.formValidate.boxSize;
      let num = Number(new Big(length || 0).times(width || 0).times(height || 0));
      if (num > 0) {
        num = parseFloat(new Big(num).div(6000)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    // 抛重比=计抛重量/重量 百分比，两位小数，四舍五入
    throwingWeightRatio() {
      let throwingWeight = this.throwingWeight || 0;
      let weight = this.formValidate.weight || 0;
      let num = 0;
      if (throwingWeight > 0 && weight > 0) {
        num = parseFloat(new Big(throwingWeight).div(weight).times(100)).toFixed(2);
        num = Number(new Big(num).times(100).div(100));
      }
      return num;
    },
    // 是否temu出库单
    isTemu() {
      return this.rowData.pickingType === 'O11';
    }
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      !this.isTemu && this.getBoxList();
    },
    // 重置数据
    reset() {
      this.boxArr.forEach(k => {
        this.formValidate.boxSize[k] = '';
      })
    },
    // 获取货箱列表
    getBoxList() {
      let temp = {};
      temp.pageNum = 1;
      temp.pageSize = 60;
      temp.status = 1;// （1-可用，0-不可用，2-全部）

      this.axios.post(api.wmsBoxesList, temp).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let datas = data.datas || {};
        this.containerModelList = datas.list || [];
      })
    },
    // 切换货箱
    boxTypeCodeChange(e) {
      if (!e) return;
      this.containerModelList.forEach(k => {
        if (k.boxId === e) {
          this.boxArr.forEach(ik => {
            this.formValidate.boxSize[ik] = k[ik] || null;
          })
        }
      })
    },
    // 完成装箱
    handleSubmit(type) {
      this.$refs[this.formName].validate((valid) => {
        if (!valid) return;
        let temp = {};
        if (!this.isTemu) {
          this.boxArr.forEach(ik => {
            temp[ik] = this.formValidate.boxSize[ik];
          })
        }
        temp.weight = this.formValidate.weight;
        temp.pickingId = this.rowData.pickingId;
        let typeObj = { 1: 'finishPacking', 2: 'continuePacking', 3: 'exceptionBox' };
        type && typeObj[type] && this[typeObj[type]](temp);
      })
    },
    // 出库单结束装箱
    finishPacking(temp) {
      this.finishLoading = true;
      this.axios.post(api.wmsPickingBoxesFinish, temp).then(({ data }) => {
        if (!(data && data.code === 0)) {
          this.finishLoading = false;
          return false;
        }
        this.$Message.success('操作成功~');
        this.boxLabelPrint(data.datas).finally(() => {
          // temu寄样结束装箱打印地址标签
          if (this.isTemu && this.rowData.pickingSubType === 0) {
            this.isTemuFinish = true;// 改变成地址标签
            this.temuAddressLabel().finally(() => {
              this.finishLoading = false;
              this.$Message.success("已打印地址标签，请粘贴地址标签~");
              this.isVisible = false;
              this.$emit('refreshBox', 'closePage');
            })
          } else {
            this.finishLoading = false;
            this.isVisible = false;
            this.$emit('refreshBox', 'closePage');
          }
        })
      }).catch(() => {
        this.finishLoading = false;
      })
    },
    // 还有未装箱完成的sku，强制完成装箱提示异常
    exceptionBox(temp) {
      // 获取未装箱的sku列表
      this.axios.get(api.getNonBoxSku, { params: { pickingId: this.rowData.pickingId } }).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let list = data.datas || [];
        let str = '';
        list.forEach(k => {
          str += `<div style="margin-right: 20px;">${k.goodSku} (x ${k.number})</div>`;
        })
        // 抛出异常
        this.$Modal.confirm({
          title: '装箱异常',
          width: '500',
          maskClosable: false,
          content: `
            <div style="max-height: 400px;overflow-y:auto;display:flex;flex-wrap:wrap;">${str}</div>
            <div style="margin-top: 25px;font-size:12px;color:red;">以上sku未装箱，是否继续装箱，如继续，这些sku会被标记为异常!</div>
          `,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            if (this.isTemu) {
              this.isVisible = true;
            } else {
              this.finishPacking(temp);
            }
          },
          onCancel: () => {
            this.isVisible = false;
          }
        });
      })
    },
    // 继续装箱
    continuePacking(temp) {
      return new Promise((resolve) => {
        let apiUrl = '';
        if (this.repicking) {
          apiUrl = api.finishReBox;
          temp.pickingBoxNo = this.pickingDetail.pickingBoxNo;
        } else {
          apiUrl = api.wmsPickingBoxesNext;
        }
        this.goonLoading = true;
        this.axios.post(apiUrl, temp).then(({ data }) => {
          if (!(data && data.code === 0)) return resolve();
          this.$Message.success('操作成功~');
          // 重新装箱的货箱不需要重复打印货箱标签
          if (this.repicking) {
            this.isVisible = false;
            this.$emit('refreshBox', 'refreshPage');
            resolve();
          } else {
            this.boxLabelPrint(data.datas).finally(() => {
              this.isVisible = false;
              this.$emit('refreshBox', 'refreshPage');
              resolve();
            })
          }
        }).finally(() => {
          this.goonLoading = false;
        }).catch(() => {
          resolve();
        })
      })
    },
    // 装箱后打印货箱标签
    boxLabelPrint(boxCode) {
      return new Promise((resolve, reject) => {
        this.printData = [];// 置空

        let list = this.pickingDetail.wmsPickingBoxesDetailsVo || [];
        if (!list.length) return resolve();// 存在空箱的情况不用打印

        let printData = {};
        printData.printNum = 1;
        // temu寄样需要打印另外格式的包标签
        if (this.isTemu && this.rowData.pickingSubType === 0) {
          boxCode = list[0].platSku;// spu，一箱只有一个spu，所以随意取第一条
        }
        printData.boxCode = printData.barCode = boxCode;
        this.printData.push(printData);

        this.commonPrint().finally(() => {
          resolve();
        })
      })
    },
    // temu完成装箱（type：1继续下一箱；2异常结束装箱）
    temuSubmit(type) {
      if (type == 1) {
        let temp = {};
        temp.pickingId = this.rowData.pickingId;
        this.continuePacking(temp).finally(() => {
          this.temuConfirmVisible = false;
        })
      } else {
        this.temuConfirmVisible = false;
        this.exceptionBox();
      }
    },
    // 获取地址信息并打印地址标签
    temuAddressLabel() {
      return new Promise((resolve) => {
        this.printData = [];// 置空
        this.axios.get(api.querySendLabelDetailInfo, { params: { pickingId: this.rowData.pickingId } })
          .then(({ data }) => {
            if (!(data && data.code === 0)) return resolve({});
            let printData = data.datas || {};
            printData.consigneeName1 = '收货人名称：' + printData.consigneeName;
            printData.consigneeLinkTel1 = '联系电话：' + printData.consigneeLinkTel;
            let address = printData.consigneeCity + printData.consigneeAddress;
            printData.consigneeAddress1 = '详细地址：' + address;
            printData.consigneeAddress2 = address;
            printData.printNum = 1;
            this.printData.push(printData);
            this.commonPrint().finally(() => {
              resolve();
            })
          }).catch(() => {
            resolve({});
          })
      })
    },
    commonPrint() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
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
    }
  }
}
</script>

<style lang="less">
.packingExceptionPage {
  .box-kg .ivu-form-item-content {
    width: 200px;
  }

  .box-size {
    .box-size__div {
      display: flex;
      align-items: center;
    }
  }

  .throwingStyle {
    margin-top: 8px;
    padding-left: 100px;
    font-size: 12px;
    line-height: 28px;
    color: #999;
  }
}

.temuPackPage {
  .contents {
    display: flex;
    align-items: center;
    padding: 6px 16px 8px;
  }

  .icons {
    font-size: 28px;
    color: #f90;
  }
}
</style>
