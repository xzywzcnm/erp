<template>
  <div class="qualityTesTablePage" v-if="detailData.pickingGoodsStatus == 1">
    <!--分配列表-->
    <div class="list-tit">
      <span>质检列表</span>
      <span @click="changeShow">
        <Icon :type="assignListShow ? 'ios-arrow-up' : 'ios-arrow-down'" class="list-ico"></Icon>
      </span>
    </div>
    <!-- 分配表格 -->
    <div style="margin-bottom:20px;" v-if="assignListShow">
      <Form ref="formValidate" :model="formValidate" class="disable-color product-form fmb0 errorText">
        <Table highlight-row border :columns="columns" :data="formValidate.data">
          <template slot-scope="{ row, index }" slot="acceptanceNumber">
            <FormItem :prop="`data.${index}.acceptanceNumber`"
              :rules="{ validator: validateQuantity, trigger: 'blur', name: 'acceptanceNumber', index: index }">
              <Input v-model.number="formValidate.data[index].acceptanceNumber" placeholder="请输入" type="number"
                class="spinButton" :disabled="isDisabled" clearable
                @on-keyup="numberInput(index, 'acceptanceNumber', 'problemNumber')" @on-blur="inputBlur"
                @on-clear="numberInput(index, 'acceptanceNumber', 'problemNumber')"></Input>
            </FormItem>
          </template>
          <template slot-scope="{ row, index }" slot="problemNumber">
            <FormItem :prop="`data.${index}.problemNumber`"
              :rules="{ validator: validateQuantity, trigger: 'blur', name: 'problemNumber', index: index }">
              <Input v-model.number="formValidate.data[index].problemNumber" placeholder="请输入" type="number"
                class="spinButton" :disabled="isDisabled" clearable
                @on-keyup="numberInput(index, 'problemNumber', 'acceptanceNumber')" @on-blur="inputBlur"
                @on-clear="numberInput(index, 'problemNumber', 'acceptanceNumber')"></Input>
            </FormItem>
          </template>
        </Table>
      </Form>
    </div>
  </div>
</template>

<script>
import Big from 'big.js';
import common from '@/components/mixin/common_mixin';
export default {
  mixins: [common],
  name: 'qualityTesTable',
  props: {
    detailData: {
      type: Object,
      default() {
        return {}
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    let _self = this;
    return {
      formValidate: {
        data: []
      },
      columns: [
        {
          title: '行号',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        },
        {
          title: '产品图片',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: '产品sku',
          align: 'center',
          key: 'goodsSku',
        },
        {
          title: '订单数量',
          align: 'center',
          key: 'expectedNumber'
        },
        {
          title: '质检比例',
          align: 'center',
          key: 'qualityCheckRatio'
        },
        {
          title: '应检数量',
          align: 'center',
          key: 'checkQuality'
        },
        {
          title: '已检合格数',
          align: 'center',
          slot: 'acceptanceNumber',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '已检合格数'),
              h('div', {
                style: {
                  display: _self.isDisabled ? 'none' : 'inline-block',
                  color: 'red',
                  fontSize: '12px',
                  marginLeft: '2px',
                  transform: 'scale(.9)',
                  cursor: 'pointer',
                },
                on: {
                  click() {
                    _self.formValidate.data.forEach((k, i) => {
                      _self.$set(_self.formValidate.data[i], 'acceptanceNumber', k.checkQuality);
                      _self.$set(_self.formValidate.data[i], 'problemNumber', 0);
                    })
                  }
                }
              }, '一键填写')
            ])
          }
        },
        {
          title: '已检问题数',
          align: 'center',
          slot: 'problemNumber',
          renderHeader: (h, params) => {
            return h('div', [
              h('span', '已检问题数'),
              h('div', {
                style: {
                  display: _self.isDisabled ? 'none' : 'inline-block',
                  color: 'red',
                  fontSize: '12px',
                  marginLeft: '2px',
                  transform: 'scale(.9)',
                  cursor: 'pointer',
                },
                on: {
                  click() {
                    _self.formValidate.data.forEach((k, i) => {
                      _self.$set(_self.formValidate.data[i], 'problemNumber', k.checkQuality);
                      _self.$set(_self.formValidate.data[i], 'acceptanceNumber', 0);
                    })
                  }
                }
              }, '一键填写')
            ])
          }
        },
        {
          title: '质检人',
          align: 'center',
          key: 'qualityCheckPeople'
        }
      ],
      assignListShow: true,
      defaultList: [], // 记录原有数据
    }
  },
  watch: {
    detailData: {
      handler(val) {
        if (!(val && val.pickingId)) return;
        this.setData(JSON.parse(JSON.stringify(val)));
      },
      deep: true,
      immediate: true,
    }
  },
  computed: {
    // 是否可编辑 true 不可
    isDisabled() {
      let { qualityCheckStatus, qualityCheckRatio } = this.detailData;
      // qualityCheckStatus:质检状态(0:未质检，1:质检完成);
      return !(this.isEdit && qualityCheckRatio > 0 && qualityCheckStatus === 0);
    },
  },
  methods: {
    setData(val) {
      this.formValidate.data = val.wmsPickingQualityCheckList || [];
      this.defaultList = this.$common.copy(val.wmsPickingQualityCheckList || []);
    },
    changeShow() {
      this.assignListShow = !this.assignListShow;
    },
    // 校验数量
    validateQuantity(rule, value, callback) {
      let { qualityCheckRatio } = this.detailData;
      if (qualityCheckRatio) {
        let { index } = rule;
        // 请完善sku质检信息
        if (value === '') return callback(new Error('请输入内容'));
        if (!this.$regular.integer.test(value)) return callback(new Error('大于或等于0的整数'));
        let item = this.formValidate.data[index];// 对应列
        let { acceptanceNumber, problemNumber, expectedNumber } = item;
        // 已检合格数+已检问题数 不超过订单数量 且两者不能同时为0
        let addNum = Number(new Big(acceptanceNumber || 0).plus(problemNumber || 0));
        if (addNum <= 0) return callback(new Error('不能同时为0'));
        let subNum = Number(new Big(expectedNumber || 0).minus(addNum));
        if (subNum < 0) return callback(new Error('不超过订单数量'));
        if (subNum > 0) return callback(new Error('质检数不符合应检数'));
        callback();
      } else {
        // 质检标准选项为“0”，为免检，跳过质检流程；
        callback();
      }
    },
    // 保存表单信息
    handleSubmit() {
      return new Promise((resolve, reject) => {
        this.$refs['formValidate'].validate((valid) => {
          if (valid) {
            let list = this.formValidate.data;
            let arr = [];
            list.forEach((k, i) => {
              let temp = this.defaultList[i];
              let acceptFlag = temp.acceptanceNumber === k.acceptanceNumber;
              let problemFlag = temp.problemNumber === k.problemNumber;
              !(acceptFlag && problemFlag) && arr.push(k);
            })
            resolve(arr);
          } else {
            resolve(false);
          }
        })
      })
    },
    // input失焦去除表单验证
    inputBlur() {
      this.$refs['formValidate'].validate();
    },
    // 应检数量 = 已检合格数 + 已检问题数
    numberInput(index, type, subType) {
      let item = this.formValidate.data[index];
      let checkQuality = item.checkQuality || 0;
      let num = item[type] || 0;
      if (!this.$regular.integer.test(num)) num = 0;
      if (num > checkQuality) num = checkQuality;
      this.$set(this.formValidate.data[index], type, num);
      let subNum = Number(new Big(checkQuality || 0).minus(num || 0));
      this.$set(this.formValidate.data[index], subType, subNum);
    }
  }
}
</script>

<style lang="less" >
.qualityTesTablePage.qualityTesTablePage {
  .list-tit {
    font-size: 16px;
    padding: 15px 0;
  }

  .list-ico {
    font-size: 18px;
    cursor: pointer;
  }

  .errorText {
    .ivu-form-item-error-tip {
      left: auto;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      padding: 0;
    }
  }

}
