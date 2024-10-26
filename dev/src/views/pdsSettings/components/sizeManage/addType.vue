<template>
  <Modal width="800px" v-model="isVisible" title="关联尺码" :mask-closable="false" class="add-type-contain">
    <div class="form-contain">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
        <FormItem label="尺码:" prop="sizeList">
          <dyt-select v-model="formValidate.sizeList" filterable multiple>
            <Option v-for="(item,key) in sizeList" :value="item.sizeId" :key="key">{{ item.size }}</Option>
          </dyt-select>
        </FormItem>
      </Form>
      <Table :columns="columns" :data="tableList" border :loading="tableLoading">
        <template slot-scope="{ index }" slot="sort">
          <span>{{index + 1}}</span>
        </template>
        <template slot-scope="{ row }" slot="size">
          <span>{{row.size}}</span>
        </template>
        <div slot-scope="scope" slot="action" class="action-column">
          <Icon @click="mobileRow(scope, 'down')" v-if="tableList.length > scope.index + 1" type="md-arrow-round-down" title="下移一行" />
          <Icon @click="mobileRow(scope, 'up')" v-if="scope.index > 0" type="md-arrow-round-up" title="上移一行" />
        </div>
      </Table>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit('formValidate')" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api.js';
export default {
  name: 'addSize',
  data () {
    return {
      formValidate: {
        sizeList: []
      },
      ruleValidate: {
        sizeList: [
          { required: true, message: '必填', trigger: 'change', type: 'array' }
        ]
      },
      sizeTypeList: [],
      loading: false,
      isVisible: false,
      tableList: [],
      columns: [
        {
          title: '排序',
          slot: 'sort',
          width: '70px',
          align: 'center'
        },
        {
          title: 'Column 2',
          slot: 'size',
          minWidth: 100,
          align: 'center'
        },
        {
          title: '操作',
          slot: 'action',
          width: '120px',
          align: 'center'
        }
      ],
      selectJson: {},
      tableLoading: false,
      getType: false
    }
  },
  props: {
    modelVisible: {
      type: Boolean,
      default () { return false; }
    },
    dialogObj: {
      type: Object,
      default () { return {}; }
    },
    sizeList: {
      type: Array,
      default () { return []; }
    }
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      if (!newVal) {
        this.tableList = [];
        this.selectJson = {};
        this.getType = false
      }
      this.$emit('update:modelVisible', newVal);
    },
    'formValidate.sizeList': {
      deep: true,
      handler (newVal, oldVal) {
        this.getType && (this.tableList = this.getTableList(newVal, oldVal));
      }
    }
  },
  methods: {
    // 打开窗口
    open () {
      this.isVisible = this.modelVisible;
      this.$refs['formValidate'].resetFields();
      this.formValidate.sizeList = (this.dialogObj.sizeList || []).map(k => {
        this.$set(this.selectJson, k.sizeId, k);
        return k.sizeId;
      })
      this.sizeList.forEach(item => {
        !this.selectJson[item.sizeId] && this.$set(this.selectJson, item.sizeId, item);
      });
      this.$nextTick(() => {
        this.tableList = this.getTableList(this.formValidate.sizeList, this.formValidate.sizeList, true);
      });
    },
    // 表格数据获取（需要保持表格排序）
    getTableList (newVal, oldVa, type) {
      setTimeout(() => {
        type && (this.getType = type);
      }, 500);
      let newList = [];
      let noSort = [];
      // 新增的值排序为空
      if (newVal.length > oldVa.length) {
        newVal.forEach(id => {
          !oldVa.includes(id) && (this.selectJson[id].sortNo = null);
        })
      }
      newVal.forEach(id => {
        if (this.selectJson[id]) {
          if (typeof this.selectJson[id].sortNo != 'number') {
            noSort.push(this.selectJson[id]);
          } else {
            newList.push(this.selectJson[id]);
          }
        }
      })
      noSort.sort((min, big) => {
        return min.sizeId - big.sizeId
      })
      // 排序值为空或
      noSort.forEach((item, index) => {
        this.selectJson[item.sizeId].sortNo = newList.length + index + 1;
        item.sortNo = newList.length + index + 1;
      });
      newList = [...newList, ...noSort];

      newList.sort((min, big) => {
        return min.sortNo - big.sortNo
      })
      // console.log('列表数据', newList)
      return newList;
    },
    // 表格行交换
    mobileRow (res, type) {
      if (type == 'up') {
        this.tableList[res.index - 1].sortNo = res.index + 1;
        this.selectJson[this.tableList[res.index - 1].sizeId].sortNo = res.index + 1;
        this.tableList[res.index].sortNo = res.index;
        this.selectJson[this.tableList[res.index].sizeId].sortNo = res.index;
      } else {
        this.tableList[res.index + 1].sortNo = res.index + 1;
        this.selectJson[this.tableList[res.index + 1].sizeId].sortNo = res.index + 1;
        this.tableList[res.index].sortNo = res.index + 2;
        this.selectJson[this.tableList[res.index].sizeId].sortNo = res.index + 2;
      }
      this.tableList.sort((min, big) => {
        return min.sortNo - big.sortNo
      })
    },
    // 保存处理
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const newList = this.tableList.map(item => {
            return { sizeId: item.sizeId, sortNo: item.sortNo }
          })
          const temp = {
            sizeList: newList,
            sizeTypeId: this.dialogObj.sizeTypeId,
            sizeGroupNo: this.dialogObj.sizeGroupNo
          }
          this.loading = true;
          this.axios.post(api.saveProductSizeTypeRel, temp).then(({ data }) => {
            if (data.code === 0) {
              this.$Message.success('操作成功');
              this.isVisible = false;
              this.$emit('fetch');
            }
          }).finally(() => {
            this.loading = false;
          });
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.action-column{
  font-size: 20px;
  .ivu-icon{
    padding: 0 10px;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.add-type-contain{
  .ivu-modal-body{
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
}

</style>
