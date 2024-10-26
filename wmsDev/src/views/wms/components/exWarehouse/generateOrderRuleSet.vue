<template >
  <div >
    <Form :label-width="110" >
      <Card class="center" >
        <p slot="title" >范围设置</p >
        <Row >
          <Col :span="12" >
            <Form-item label="物流渠道" >
              <Select
                  style="width:220px"
                  v-model="searchParams.logisticChannel"
                  multiple
                  @on-change="logisticChannelChange" >
              <!--<Option value="*">全部</Option>-->
              <OptionGroup :label="v.title" v-for="(v, index) in mock" :key="index" >
                <Option v-for="item in v.children" :value="item.value" :key="item.value" >{{ item.code }}</Option >
              </OptionGroup >
              </Select >
            </Form-item >
          </Col >
          <Col :span="12" >
            <Form-item label="出库单类型" >
              <Select style="width:220px" v-model="searchParams.outListType" multiple @on-change="outListTypeChange" >
              <Option value="*" >全部</Option > <Option
                  v-for="item in outListTypeList"
                  :value="item.value"
                  :key="item.value" > {{ item.label }} </Option > </Select >
            </Form-item >
          </Col >
        </Row >
        <Row >
          <Col :span="2" style="padding-top: 5px" >
            <Icon type="md-help-circle" style="margin-right: 10px" ></Icon >
            <Checkbox v-model="single" ></Checkbox >
          </Col >
          <Col :span="12" >
            <Form-item label="包含固定商品" style="margin-left: -11px" >
              <Input
                  v-model="searchParams.textarea"
                  type="textarea"
                  :disabled="!single"
                  :autosize="{ minRows: 2, maxRows: 5 }"
                  placeholder="支持多个SKU，请用逗号或空格分开" ></Input >
            </Form-item >
          </Col >
        </Row >
      </Card >
      <Card class="center" >
        <p slot="title" >合并规则</p >
        <pickListRule ></pickListRule >
      </Card >
      <Card class="center" >
        <p slot="title" >时间设置</p >
        <Form-item label="拣货单生成时间" >
          <RadioGroup v-model="createListTime" vertical >
            <Radio label="1" >
              <span >固定周期</span > <span >每过<InputNumber
                :max="23"
                :min="0"
                v-model="constTime"
                size="small" ></InputNumber >小时生成拣货单</span >
            </Radio >
            <!--<br>-->
            <Radio label="2" style="display: inline-block" >
              <span >每天定时</span >
            </Radio >
            <span style="display: inline-block" >
              <span >每天</span >
              <span v-for="(v, i) in timePickRecordList" :key="i" >
                <TimePicker
                    format="HH:mm"
                    placeholder="Select time"
                    style="width: 70px;margin-right: 5px"
                    :value="v.value"
                    size="small" ></TimePicker >
              </span >
              <span @click="addTimePick" ><Icon
                  type="plus-circled"
                  style="font-size: 18px;cursor: pointer" ></Icon ></span >
              <span @click="dltTimePick" ><Icon
                  type="minus-circled"
                  style="font-size: 18px;cursor: pointer" ></Icon ></span >
              <span >生成拣货单</span >
            </span >
          </RadioGroup >
        </Form-item >
      </Card >
    </Form >
  </div >
</template >
<style scoped >
.center {
  width: 96%;
  margin: 0 auto;
  margin-top: 10px;
}
</style >
<script >
import pickListRule from './pickListRule';

export default {
  components: {
    pickListRule
  },
  data () {
    return {
      mock: [
        {
          title: 'xxcx',
          children: [
            {
              code: 'ss',
              value: 'ss'
            }, {
              code: 'xx',
              value: 'dfs'
            }
          ]
        }
      ],
      single: false,
      constTime: 0.5,
      createListTime: '1',
      wareList: [],
      logisticChannelList: [],
      outListTypeList: [],
      searchParams: {
        textarea: '',
        logister: [],
        outListType: [],
        logisticChannel: []
      },
      timePickRecordList: [{ value: 0 }]
    };
  },
  methods: {
    logisterChange () {
      // 物流商选择
    },
    outListTypeChange () {
      // 类型选择
    },
    logisticChannelChange (arr) {
      // 渠道选择
    },
    addTimePick () {
      // 新增时间组件
      let obj = { value: 0 };
      this.timePickRecordList.push(obj);
    },
    dltTimePick () {
      // 删除时间组件
      if (this.timePickRecordList.length > 1) {
        this.timePickRecordList.pop();
      }
    }
  }
};
</script >
