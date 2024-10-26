<template>
  <div style="padding: 20px;">
    dome 预览
    <dytSelectDome />
    <dyt-inputTag
      v-model="dytTags"
      style="width: 200px; margin-top: 20px;"
    />
    <dyt-filter-dome />
    <dytViewUpload />
    <RadioGroup v-model="animal">
      <Radio label="金斑蝶">9999</Radio>
      <Radio label="爪哇犀牛"></Radio>
      <Radio label="印度黑羚"></Radio>
    </RadioGroup>
    <!-- dyt-inputNumber -->
    <div>
      <dyt-inputNumber placeholder="请输入数字" v-model="inputNumber" />
      <dyt-inputNumber style="margin-left: 10px;" v-model="inputNumber" :disabled="true" />
      <dyt-inputNumber style="margin-left: 10px;" placeholder="请输入数字" v-model="inputNumber" :readonly="true" />
    </div>
    <div style="padding: 10px;">
      <dyt-inputTag placeholder="请输入" v-model="tags" />
      <dyt-inputTag style="margin-top: 15px;" placeholder="请输入" v-model="tags" :disabled="true" />
    </div>
    <Button @click="copyTxt">复制到粘贴板</Button>
    <dyt-ellipsis :content="content" :show-expand="true"></dyt-ellipsis>
  </div>
</template>
<script>
import dytSelectDome from '@/views/testDome/components/dyt-select';
import dytFilterDome from '@/views/testDome/components/dyt-filter';
import dytUpload from '@/views/testDome/components/dyt-upload';

export default {
  mixins: [],
  components: { dytSelectDome, dytFilterDome, dytUpload },
  data () {
    return {
      bigDataVal: [],
      bigDataVa0: [],
      bigDataVal1: [],
      bigDataVa2: [],
      optionsData: [],
      animal: '',
      inputNumber: null,
      tags: ['222'],
      dytTags: [],
      content: `双减”政策落地后，中小学生迎来了新学期的第一个周末，记者在走访上海的各类培训机构时发现，非学科类的培训班成为“香饽饽”。
      上海市友谊路的一处青少年活动中心，主要开办的是一些运动、艺术、科技类的培训课程，记者手边的这间教室里正在进行的就是一场少儿泰拳的体验课。
      记者了解到，在“双减”政策落地之后的首个周末，这里整体的咨询订单量是成倍增长，有不少家长都是带着小朋友过来参加试听课，也咨询相关的培训计划。
      家长们告诉记者，对于孩子周末突然减少的课业补习，他们多多少少还是有一些担心，但想到孩子减轻了课业压力，能够有更多时间来培养自己的兴趣爱好，给孩子报一些兴趣班也是个不错的选择。
      学生家长：其实担心还是多少有一点，但是我相信整个学校的教育也在调整，我们自己作为家长，也要更合理地规划孩子的课余生活。
      学生家长：我是周末送孩子来上单簧管课程的，因为其实之前就有这方面的打算了，正好现在遇到“双减”，也希望给孩子有一些兴趣爱好的培养。`
    }
  },
  computed: {},
  watch: {
    bigDataVal: {
      deep: true,
      handler (val, old) {
        // console.log(val, old)
      }
    }
  },
  mounted () {},
  created () {
    // console.log(this.$common.getUrlParams())
    this.optionsData = this.initSelect();
  },
  methods: {
    initSelect (str) {
      let list = [];
      for (let i = 0; i < 1000; i++) {
        list.push({
          label: `label-${i + 1}`,
          value: `value-${i + 1}`,
          index: `index-${i + 1}`
        })
      }
      return list;
    },
    // 自定义下拉以及选中值展示
    optionTemplate (option) {
      let newVal = option;
      if (typeof option == 'string') {
        const fil = this.optionsData.filter(item => {
          return option == item['value']
        })[0];
        fil && (newVal = fil);
      }
      return `select-${newVal.value}-${newVal.label}`;
    },
    optionTemplate1 (option) {
      let newVal = option;
      if (typeof option == 'string') {
        const fil = this.optionsData.filter(item => {
          return option == item['value']
        })[0];
        fil && (newVal = fil);
      }
      return `${newVal.value}：${newVal.label}`;
    },
    copyTxt () {
      const random = `${new Date().getTime()}-${(Math.random() * Math.pow(10, 10)).toFixed(0)}`;
      console.log('需要复制的内容', random)
      this.$common.copyToClip(random).then(res => {
        res ? this.$Message.success('复制成功') : this.$Message.warning('复制失败')
      })
    },
    // 按照需要返回， 返回true即为匹配到
    filterMethod (option, keyword) {
      return option.value.includes(`${keyword}1`)
    },
    // 自定义标记搜索位置(使用 option-template 插槽时无效)
    matchTemplate (str) {
      return `<span style="color:#f20;">${str}</span>`
    }
  }
};
</script>
