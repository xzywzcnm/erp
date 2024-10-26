<template>
  <Card style="margin-top: 15px;">
    一般用法
    <dyt-select
      style="margin-top: 15px; width: 300px;"
      v-model="dytSelect"
      transfer
      clearable
      filterable
      @on-query-change="remoteMethod"
    >
      <template v-for="(item, index) in dytSelectList">
        <Option :value='item.value' :key="index">{{item.label}}</Option>
      </template>
    </dyt-select>
    排序用法
    <dyt-select
      v-model="model1"
      :option.sync="list"
      :disabled="isDisabled"
      :multiple="false"
      :label-in-value="true"
      :replace-key="replaceKey"
      sort-key="dyt"
    >
      <!-- @option-sort="optionSort" -->

      <!-- 使用该插槽设置方法 option-sort 后排序，需在 option 加 sync 进行同步-->
      <!-- <template slot-scope="props">
        <Option
          v-for="item in props.list"
          :value="item.value"
          :key="item.value"
      >{{ item.label }}</Option>
      </template> -->
      <!-- 使用该插槽，需在 option 加 sync 进行同步 -->
      <Option
        v-for="item in list"
        :value="item.id"
        :key="item.id"
      >{{ item.name }}</Option>
    </dyt-select>
  </Card>
</template>
<script>
// 该组件用 iviewui 的 select 封装，iviewui 支持的用法全部支持，
// 新增参数:
// option: 下拉数据，数组格式
// replace-key 当下拉数据中数据格式非 {value:'', label: ''}时设置
// sort-key 存储当前组件排序的 key, 尽量按照功能模块命名，字符串格式
// 新增方法：
// option-sort: 该方法为自定义排序，返回 {value, cache}，支持 promise, 必须 return 一个需缓存的值或 promise 对象
// value 为当前选中值，cache为缓存的值
export default {
  data () {
    return {
      // 用于下拉值非 {value:'', label: ''} 情况替换key
      replaceKey: {
        value: 'id', label: 'name'
      },
      isDisabled: false,
      // 默认选择值
      model1: 'v2',
      // 下拉列表数据
      list: [],
      dytSelect: 'value-10',
      dytSelectList: []
    }
  },
  computed: {},
  watch: {},
  mounted () {},
  created () {
    this.dytSelectList = this.initSelect();
    setTimeout(() => {
      this.list = [
        { name: '1', id: 'v1' },
        { name: '2', id: 'v2' },
        { name: '3', id: 'v3' },
        { name: '4', id: 'v4' },
        { name: '5', id: 'v5' }
      ]
      // this.dytSelectList = this.dytSelectList.filter(item => {
      //   return !item.value.includes('1')
      // })
    }, 1000)
  },
  methods: {
    // 自定义排序， 支持 promise, 必须返回缓存值，
    // 不使用插槽设置 option-sort 需在 option 加 sync 进行同步
    optionSort (val) {
      console.log(val)
      return { value: 'V5', sortNo: 1 }
    },
    initSelect () {
      let list = [];
      for (let i = 0; i < 100; i++) {
        list.push({
          label: `label-${i + 1}`,
          value: `value-${i + 1}`
        })
      }
      return list;
    },
    remoteMethod () {
      this.dytSelectList = this.initSelect();
    }
  }
};
</script>
