<template>
  <Modal width="850px" v-model="isVisible" title="跳码分段设置" :mask-closable="false" class="add-type-contain">
    <div class="modal-form-contain">
      <div v-if="isGetError" style="color:#f20; font-size: 20px;">获取分段信息失败，不可以编辑</div>
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="90" v-show="!isGetError">
        <FormItem label="尺码信息:" class="font-weight not-margin">
          {{ sizeInfoTxt }}
        </FormItem>
        <FormItem label="启用尺码跳码功能" class="font-weight not-margin" :label-width="140">
          <i-switch v-model="formValidate.enabled" />
        </FormItem>
        <div v-if="formValidate.enabled" class="mt10">
          <div v-for="(item, index) in formValidate.subsectionList" :key="`segment-${index}`" class="segment-item-box">
            <div class="ivu-form-item segment-label">段{{ index + 1 }}</div>
            <FormItem label="" :label-width="0" :prop="`subsectionList.${index}.startId`">
              <dyt-select v-model="formValidate.subsectionList[index].startId" filterable :disabled="true" placeholder="">
                <Option v-for="(subSize, sIndex) in sizeSortList" :value="subSize.sizeId" :key="`s-${sIndex}`" :label="subSize.size" />
              </dyt-select>
            </FormItem>
            <div class="ivu-form-item segment-space">——</div>
            <FormItem
              label=""
              :label-width="0"
              :prop="`subsectionList.${index}.endId`"
              :rules="{required: true, validator: validateSize, msg: '请选择尺码', trigger: 'change'}"
            >
              <dyt-select
                v-model="formValidate.subsectionList[index].endId"
                placeholder="请选择尺码"
                filterable
                :clearable="false"
                :disabled="(index + 1) === formValidate.subsectionList.length"
                @on-open-change="selectOpenHand($event, index)"
                @on-select="subsectionChose($event, index)"
              >
                <Option
                  v-for="(subSize, sIndex) in sizeSortList"
                  :value="subSize.sizeId"
                  :key="`e-${sIndex}`"
                  :disabled="subSize.disabled"
                  :label="subSize.size"
                />
              </dyt-select>
            </FormItem>
            <FormItem
              label="默认跳码:"
              :label-width="100"
              class="hopping-code-input"
              :prop="`subsectionList.${index}.hoppingCode`"
              :rules="[
                {required: true, validator: validateHoppingCode, msg: '请输入跳码', trigger: 'blur'},
                {required: true, validator: validateHoppingCode, msg: '请输入跳码', trigger: 'change'}
              ]"
            >
              <dyt-input v-model="formValidate.subsectionList[index].hoppingCode" placeholder="请输入大于0的数字" />
            </FormItem>
            <div
              class="ivu-form-item ml10"
              v-if="(index + 1) === formValidate.subsectionList.length && !!formValidate.subsectionList[index].startId && isVisibleAdd"
              title="新增分段"
            >
              <Icon class="add-subsection-btn" type="ios-add-circle-outline" @click="addSubsection(item, index)" />
            </div>
            <div
              class="ivu-form-item ml10" v-if="(index + 1) === formValidate.subsectionList.length && index != 0"
              title="移除分段"
            >
              <Icon class="remove-subsection-btn" type="md-close-circle" @click="removeSubsection(item, index)" />
            </div>
          </div>
        </div>
      </Form>
      <Spin fix v-if="pageLoading" />
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取消</Button>
      <Button
        type="primary"
        @click="handleSubmit"
        :loading="pageLoading"
        v-if="!$common.isEmpty(sizeSortList) && !isGetError"
      >确定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api.js';
export default {
  name: 'setJumpSize',
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
  data () {
    return {
      formValidate: {
        enabled: false,
        subsectionList: []
      },
      isGetError: false,
      ruleValidate: {},
      pageLoading: false,
      isVisible: false,
      sizeSortList: [],
      selectJson: {},
      isValidate: false,
      tableLoading: false
    }
  },
  watch: {
    modelVisible (newVal) {
      if (newVal) this.open();
    },
    isVisible (newVal) {
      if (!newVal) {
        this.sizeSortList = [];
        this.selectJson = {};
      }
      this.$emit('update:modelVisible', newVal);
    }
  },
  computed: {
    sizeInfoTxt () {
      return (this.sizeSortList || []).map(m => m.size).join(' / ');
    },
    // 是否可以继续新增段
    isVisibleAdd () {
      let lastItem = this.formValidate.subsectionList.slice(-1);
      if (!this.$common.isEmpty(lastItem)) {
        lastItem = lastItem[0];
      }
      let startIndex = 0;
      let endIndex = 0;
      this.sizeSortList.forEach((item, index) => {
        if (item.sizeId == lastItem.startId) {
          startIndex = index;
        }
        if (item.sizeId == lastItem.endId) {
          endIndex = index;
        }
      });
      return endIndex - startIndex > 1;
    },
  },
  methods: {
    // 打开窗口
    open () {
      this.initData();
      this.$refs['formValidate'].resetFields();
      let sizeList = (this.dialogObj.sizeList || []).map(k => {
        this.$set(this.selectJson, k.sizeId, {...k, disabled: false});
        return k.sizeId;
      })
      this.sizeList.forEach(item => {
        !this.selectJson[item.sizeId] && this.$set(this.selectJson, item.sizeId, {...item, disabled: false});
      });
      this.$nextTick(() => {
        this.sizeSortList = this.getSortList(sizeList, sizeList);
        this.oldTableData = this.$common.copy(this.sizeSortList);
        this.handSubsectionDetails().finally(() => {
          this.$nextTick(() => {
            this.pageLoading = false;
          })
        });
      });
    },
    // 设置默认值
    initData () {
      this.isValidate = false;
      this.pageLoading = true;
      this.isVisible = this.modelVisible;
      this.formValidate.enabled = false;
    },
    // 处理分段数据
    handSubsectionDetails () {
      return new Promise((resolve) => {
        this.getSubsectionDetails().then(res => {
          this.isGetError = !res.state;
          if (this.$common.isEmpty(res.data)) {
            let initArr = [];
            const frist = this.sizeSortList.slice(0, 1);
            const last = this.sizeSortList.slice(-1);
            if (!this.$common.isEmpty(frist)) {
              initArr.push({
                startId: frist[0].sizeId,
                endId: last[0].sizeId,
                hoppingCode: '',
                sortNo: 1
              });
            }
            this.formValidate.subsectionList = initArr;
            return resolve({state: 'finally'});
          }
          let ids = [];
          let hoppingList = [];
          let isEnabled = null;
          (res.data || []).forEach(item => {
            if (!isEnabled) {
              isEnabled = item.status;
            }
            if (!this.$common.isEmpty(item.sizeIds)) {
              ids = item.sizeIds.split(',').map(m => Number(m));
              hoppingList.push({
                startId: ids[0],
                endId: ids.slice(-1)[0],
                hoppingCode: item.hoppingCode,
                sortNo: item.sortNo
              });
            }
          });
          hoppingList.sort((min, big) => {
            return min.sortNo - big.sortNo
          });
          this.formValidate.enabled = this.$common.isEmpty(isEnabled) ? false : isEnabled == 1 ? true : false;
          this.formValidate.subsectionList = hoppingList;
          resolve({state: 'finally'});
        })
      })
    },
    // 获取分段详情
    getSubsectionDetails () {
      return new Promise((resolve) => {
        this.axios.get(api.queryHoppingCode, {
          params: {
            sizeTypeId: this.dialogObj.sizeTypeId,
            sizeGroupNo: this.dialogObj.sizeGroupNo,
          }
        }).then((data) => {
          if (!data || data.code != 0) return resolve({state: false, data: []});
          resolve({state: true, data: data.datas || []});
        }).catch((err) => {
          console.error(err);
          resolve({state: false, data: []});
        })
      })
    },
    // 表格数据获取（需要保持表格排序）
    getSortList (newVal, oldVa) {
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
      });
      return newList;
    },
    // 选中项目
    subsectionChose (val, index) {
      const nextItem = this.formValidate.subsectionList[index + 1];
      nextItem.startId = val.value;
    },
    // 下拉展示时
    selectOpenHand (visible, index) {
      if (!visible) return;
      let dIndex = [0, this.sizeSortList.length - 1];
      let dmIndex = null;
      const nowItem = this.formValidate.subsectionList[index];
      const nextItem = this.formValidate.subsectionList[index + 1];
      let maxIndex = null;
      this.sizeSortList.forEach((item, fIndex) => {
        if ([nowItem.startId].includes(item.sizeId) && !dIndex.includes(fIndex)) {
          dmIndex = fIndex;
        }
        if (!this.$common.isEmpty(nextItem.endId) && [nextItem.endId].includes(item.sizeId) && !dIndex.includes(fIndex)) {
          maxIndex = fIndex;
        }
      });
      this.sizeSortList = this.sizeSortList.map((m, mIdex) => {
        if ((!this.$common.isEmpty(dmIndex) && dmIndex >= mIdex) || dIndex.includes(mIdex)) {
          m.disabled = true;
        } else if (!this.$common.isEmpty(maxIndex) && mIdex >= maxIndex) {
          m.disabled = true;
        } else {
          m.disabled = false;
        }
        return m;
      });
    },
    // 新增段
    addSubsection (item, index) {
      let newItem = this.formValidate.subsectionList[index];
      const last = this.sizeSortList.slice(-1);
      const addItem = {
        startId: '',
        endId: last[0].sizeId,
        hoppingCode: '',
        sortNo: newItem.sortNo + 1
      };
      newItem.endId = '';
      this.formValidate.subsectionList.push(addItem);
    },
    // 删除段
    removeSubsection (item, index) {
      this.$Modal.confirm({
        title: "操作提示",
        content: `是否确认移除分段?`,
        onOk: () => {
          const newItem = this.formValidate.subsectionList[index];
          let preItem = this.formValidate.subsectionList[index - 1];
          preItem.endId = newItem.endId;
          this.formValidate.subsectionList.splice(index, 1);
        }
      });
    },
    // 验证尺码必填
    validateSize (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.isValidate || !this.formValidate.enabled) return callback();
        this.$common.formItemVerify(rule, value, callback);
      });
    },
    // 验证跳码
    validateHoppingCode (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.formValidate.enabled) return callback();
        this.$common.validatorMaxNumber({...rule, point: 1, min: 0, notIncludes: ['min']}, value, callback);
      });
    },
    // 处理参数
    handParams () {
      let newParams = [];
      this.formValidate.subsectionList.forEach((item) => {
        newParams.push({
          sizeTypeId: this.dialogObj.sizeTypeId,
          sizeGroupNo: this.dialogObj.sizeGroupNo,
          sizeIds: ((val) => {
            let startIndex = null;
            let endIndex = null;
            let ids = [];
            this.sizeSortList.forEach((size, index) => {
              if (size.sizeId == val.startId) {
                startIndex = index;
              }
              if (!this.$common.isEmpty(startIndex) && this.$common.isEmpty(endIndex)) {
                ids.push(size.sizeId);
              }
              if (size.sizeId == val.endId) {
                endIndex = index;
              }
            });
            return ids.join(',');
          })(item),
          hoppingCode: Number(item.hoppingCode),
          sortNo: item.sortNo,
          status: this.formValidate.enabled ? 1 : 0,
        });
      });
      return newParams;
    },
    // 保存处理
    handleSubmit () {
      this.isValidate = true;
      this.$nextTick(() => {
        this.$refs.formValidate.validate((valid) => {
          this.isValidate = false;
          if (!valid) return;
          let temp = this.handParams();
          this.pageLoading = true;
          this.axios.post(api.addHoppingCode, temp).then((data) => {
            if (!data || data.code != 0) return;
            this.$Message.success('操作成功');
            this.isVisible = false;
            this.$emit('fetch');
          }).finally(() => {
            this.pageLoading = false;
          });
        })
      })
    }
  }
}
</script>
<style lang="less" scoped>
.modal-form-contain{
  .segment-item-box{
    display: flex;
    align-items: center;
    .segment-label{
      padding-right: 10px;
      width: 80px;
      text-align: right;
    }
    .segment-space{
      padding: 0 10px;
    }
    .add-subsection-btn{
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      color: #00b107;
    }
    .remove-subsection-btn{
      font-size: 30px;
      cursor: pointer;
      color: #f60;
    }
  }
  :deep(.ivu-form) {
    *{
      font-size: 14px;
    }
    .font-weight{
      .ivu-form-item-label, .ivu-form-item-content{
        font-weight: bold;
      }
    }
    .not-margin{
      margin-bottom: 0;
    }
    .segment-item-box{
      .ivu-form-item-content {
        width: 125px;
      }
      .hopping-code-input{
        .ivu-form-item-content {
          width: 170px;
        }
      }
    }
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
