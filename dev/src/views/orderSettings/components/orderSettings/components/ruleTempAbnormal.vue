<template>
  <Modal
    v-model="anomalousModal"
    width="800"
    :mask-closable="false"
    title="选择指定异常"
    @on-ok="anomalousOk"
    @on-cancel="anomalousCancel" >
    <h3 >本条件用于筛选异常状况，以下条件符合任何一项，即认为符合本条件。</h3 >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox1" >
        <span style="marginLeft:10px;" >姓名字符中空格数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox1"
          v-model="anomalousModalParams.nameSpaceLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >俄罗斯邮政要求收件人地址为全名，此处可输入2</span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox2" >
        <span style="marginLeft:10px;" >姓名字符数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox2"
          v-model="anomalousModalParams.nameCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >输入1时，相当于收件人姓名为空</span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox3" >
        <span style="marginLeft:10px;" >地址字符数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox3"
          v-model="anomalousModalParams.addressCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >地址1+地址2的总字符长度</span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox4" >
        <span style="marginLeft:10px;" >城市名字字符数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox4"
          v-model="anomalousModalParams.cityCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >输入1时，相当于城市名称为空</span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox5" >
        <span style="marginLeft:10px;" >省/州名字字符数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox5"
          v-model="anomalousModalParams.stateCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >输入1时，相当于省州名称为空 </span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox6" >
        <span style="marginLeft:10px;" >邮编字符数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox6"
          v-model="anomalousModalParams.postCodeCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >输入1时，相当于邮编为空</span >
      </Checkbox >
    </div >
    <div style="marginTop:10px;" >
      <Checkbox v-model="anomalousModalParams.checkbox7" >
        <span style="marginLeft:10px;" >电话号码数字字符个数小于</span >
        <InputNumber
          size="small"
          :min="1"
          :disabled="!anomalousModalParams.checkbox7"
          v-model="anomalousModalParams.phoneCharacterLess" ></InputNumber >
        <span style="marginLeft:20px;color:red;" >电话、手机两个号码必须都小于该值才认为该条件成立</span >
      </Checkbox >
    </div >
  </Modal >
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'ruleTempAbnormal',
  mixins: [Mixin],
  data () {
    return {
      anomalousModal: false,
      ruleId: '',
      anomalousModalParams: {
        checkbox1: false,
        checkbox2: false,
        checkbox3: false,
        checkbox4: false,
        checkbox5: false,
        checkbox6: false,
        checkbox7: false,
        nameSpaceLess: null,
        nameCharacterLess: null,
        addressCharacterLess: null,
        cityCharacterLess: null,
        stateCharacterLess: null,
        postCodeCharacterLess: null,
        phoneCharacterLess: null
      }
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {
    /**
     * @date: 2021/10/19 15:49
     * @param data false | rules.values
     */
    open (data, ruleId) {
      let v = this;
      v.ruleId = ruleId;
      for (let key in v.anomalousModalParams) {
        if (key.includes('checkbox')) {
          v.anomalousModalParams[key] = false;
        } else {
          v.anomalousModalParams[key] = null;
        }
      }
      if (data) {
        for (let bItem in data) {
          if (data[bItem]) {
            if (bItem === 'nameSpaceLess') {
              v.anomalousModalParams.checkbox1 = true;
              v.anomalousModalParams.nameSpaceLess = Number(data[bItem]);
            } else if (bItem === 'nameCharacterLess') {
              v.anomalousModalParams.checkbox2 = true;
              v.anomalousModalParams.nameCharacterLess = Number(data[bItem]);
            } else if (bItem === 'addressCharacterLess') {
              v.anomalousModalParams.checkbox3 = true;
              v.anomalousModalParams.addressCharacterLess = Number(data[bItem]);
            } else if (bItem === 'cityCharacterLess') {
              v.anomalousModalParams.checkbox4 = true;
              v.anomalousModalParams.cityCharacterLess = Number(data[bItem]);
            } else if (bItem === 'stateCharacterLess') {
              v.anomalousModalParams.checkbox5 = true;
              v.anomalousModalParams.stateCharacterLess = Number(data[bItem]);
            } else if (bItem === 'postCodeCharacterLess') {
              v.anomalousModalParams.checkbox6 = true;
              v.anomalousModalParams.postCodeCharacterLess = Number(data[bItem]);
            } else if (bItem === 'phoneCharacterLess') {
              v.anomalousModalParams.checkbox7 = true;
              v.anomalousModalParams.phoneCharacterLess = Number(data[bItem]);
            }
          }
        }
      }
      v.anomalousModal = true;
    },
    anomalousOk () { // 选择指定异常确认
      let v = this;
      let pos = [];
      if (v.anomalousModalParams.checkbox1) {
        pos.push({
          name: 'nameSpaceLess',
          value: v.anomalousModalParams.nameSpaceLess
        });
      }
      if (v.anomalousModalParams.checkbox2) {
        pos.push({
          name: 'nameCharacterLess',
          value: v.anomalousModalParams.nameCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox3) {
        pos.push({
          name: 'addressCharacterLess',
          value: v.anomalousModalParams.addressCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox4) {
        pos.push({
          name: 'cityCharacterLess',
          value: v.anomalousModalParams.cityCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox5) {
        pos.push({
          name: 'stateCharacterLess',
          value: v.anomalousModalParams.stateCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox6) {
        pos.push({
          name: 'postCodeCharacterLess',
          value: v.anomalousModalParams.postCodeCharacterLess
        });
      }
      if (v.anomalousModalParams.checkbox7) {
        pos.push({
          name: 'phoneCharacterLess',
          value: v.anomalousModalParams.phoneCharacterLess
        });
      }
      let obj = {
        nameSpaceLess: null,
        nameCharacterLess: null,
        addressCharacterLess: null,
        cityCharacterLess: null,
        stateCharacterLess: null,
        postCodeCharacterLess: null,
        phoneCharacterLess: null
      };
      pos.forEach(i => {
        obj[i.name] = i.value;
      });
      this.$emit('confirm', {
        values: obj,
        id: v.ruleId
      });
    },
    anomalousCancel () { // 选择指定异常取消
      let v = this;
      // 新增关闭弹框时，清空数据
      if (v.ruleParmas.type) {
        v.anomalousModalParams = {
          checkbox1: false,
          checkbox2: false,
          checkbox3: false,
          checkbox4: false,
          checkbox5: false,
          checkbox6: false,
          checkbox7: false,
          nameSpaceLess: null,
          nameCharacterLess: null,
          addressCharacterLess: null,
          cityCharacterLess: null,
          stateCharacterLess: null,
          postCodeCharacterLess: null,
          phoneCharacterLess: null
        };
      }
      v.anomalousModal = false;
    }
  }
};
</script>

<style scoped>

</style>
