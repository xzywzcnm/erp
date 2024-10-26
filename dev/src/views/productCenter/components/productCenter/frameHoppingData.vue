<template>
  <div class="frame-hopping-page">
    <div class="mb10">
      <Button type="primary" @click="pushFhData" v-if="isEdit">新增部位</Button>
    </div>
    <Form ref="filterRefsDome" :model="formValidate" :rules="ruleValidate" :label-width="100" class="form-contain-item" v-if="!pageLoading">
      <Table :columns="[...frameHopping, ...frameTableHopping]" :data="formValidate.fhTableData" border highlight-row class="frame-hopping-table">
        <template slot-scope="{ index }" slot="sampleSize">
          <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.sampleSize`" :rules="validatePrice">
            <Input v-model="formValidate.fhTableData[index].sampleSize" placeholder="请输入" clearable style="width:100%;" :disabled="!isEdit" />
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="allowance">
          <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.allowance`" :rules="validatePrice">
            <Input v-model="formValidate.fhTableData[index].allowance" placeholder="请输入" clearable style="width:100%;" :disabled="!isEdit" />
          </FormItem>
        </template>
        <template slot-scope="{ index }" slot="sizeHopping">
          <FormItem label="" :label-width="0" :prop="`fhTableData.${index}.sizeHopping`" :rules="sizeHoppMaxVerify">
            <Input v-model="formValidate.fhTableData[index].sizeHopping" placeholder="请输入" clearable style="width:100%;" :disabled="!isEdit" />
          </FormItem>
        </template>
        <!-- 追加的列 -->
        <template v-for="(pCol, Pindex) in frameTableHopping" slot-scope="{ index }" :slot="`${pCol.slot}`">
          <FormItem v-if="pCol.slot" label="" :label-width="0" :prop="`fhTableData.${index}.${pCol.slot}`" :key="`slot-${Pindex}`" :rules="validatePrice">
            <Input
              v-model="formValidate.fhTableData[index][pCol.slot]"
              placeholder="请输入"
              clearable style="width:100%;"
              :disabled="!isEdit"
            />
          </FormItem>
        </template>
      </Table>
    </Form>
    <!-- 添加部分数据弹窗 -->
    <pushFhTable :modelVisible.sync="pushFhVisible" :modelData="pushModelFhData" @confirm="pushFhConfirm"/>
    <Spin v-if="pageLoading" fix></Spin>
  </div>
</template>
<script>
import api from '@/api/api.js';
import pushFhTable from './pushFhTable';

export default {
  name: "frameHoppingPage",
  components: {
    pushFhTable
  },
  props: {
    // 是否显示
    modelVisible: { type: Boolean, default: false },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 商品数据
    productData: { type: Object, default () { return {} } },
    // 尺码数据
    sizeList: { type: Array, default () { return [] } }
  },
  data() {
    return {
      formValidate: {
        fhTableData: []
      },
      ruleValidate: {},
      // 验证是否大于等于 0 的2位小数
      validatePrice: [
        { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
        { required: true, validator: this.$common.validatorMaxNumber, min: 0, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
      ],
      // 验证跳码
      sizeHoppMaxVerify: [
        { required: true, validator: this.$common.strMaxVerify, msg: '请输入跳码值', maxLength: 50, trigger: 'blur' },
        { required: true, validator: this.$common.strMaxVerify, msg: '请输入跳码值', maxLength: 50, trigger: 'change' }
      ],
      // 跳码表列设置
      frameTbalCol: [
        {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: 90,
          render: (h, { row }) => {
            return h('div', {
              style: {
                cursor: 'pointer',
                color: '#2d8cf0'
              },
              on: {
                click: () => {
                  this.removeFrameData([row]);
                }
              }
            }, '移除');
          }
        },
        {
          title: '部位',
          key: 'position',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            if (row.isDeleted == 0 || this.$common.isEmpty(row.isDeleted)) return h('span', {}, row.position);
            return h('span', {}, [
              h('div', {}, row.position),
              h('div', {
                style: {
                  color: '#f20'
                }
              }, '(已删除)')
            ])
          }
        },
        {
          title: '量法',
          key: 'measurementDescription',
          align: 'center',
          minWidth: 100,
          render: (h, { row }) => {
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, row.measurementDescription);
          }
        },
        {
          title: '样衣尺码',
          slot: 'sampleSize',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '公差',
          slot: 'allowance',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '跳码',
          slot: 'sizeHopping',
          align: 'center',
          minWidth: 100
        }
      ],
      partSizeData: {},
      pageLoading: false,
      pushFhVisible: false,
      pushModelFhData: {},
    };
  },
  watch: {
    modelVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) return this.resetData();
        this.$nextTick(() => {
          this.initPage();
        })
      }
    },
    // productDetail: {
    //   immediate: true,
    //   deep: true,
    //   handler (val) {
    //     this.transformTable(this.$common.copy(val));
    //   }
    // }
  },
  computed: {
    // 是否可编辑
    isEdit () {
      return !this.disabled;
    },
    // 可用尺码
    sizeData () {
      let sizeObj = {};
      this.sizeList.forEach(item => {
        if (!item.disabled) {
          item.children.forEach(s => {
            sizeObj[s.sizeId] = s;
          })
        }
      })
      return sizeObj;
    },
    // 商品ID
    productId () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productId)) return '';
      return this.productData.productId;
    },
    // 商品多属性（尺码需要从这里来）
    productGoodsList () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productGoodsList)) return [];
      return this.productData.productGoodsList;
    },
    // 已保存的尺码
    productDetail () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productManufactureVOList)) return [];
      return this.productData.productManufactureVOList;
    },
    // 获取所有的 size 规格
    getSizeConfig () {
      let sizeInfo = {};
      let sizeIdList = [];
      let otherInfo = {};
      let backInfo = [];
      const sizeDataList = Object.values(this.sizeData);
      this.productGoodsList.forEach(m => {
        if (!this.$common.isEmpty(m.productGoodsSpecifications)) {
          sizeInfo = m.productGoodsSpecifications.find(fin => fin.name == 'Size');
          if (!this.$common.isEmpty(sizeInfo)) {
            if (!this.$common.isEmpty(sizeInfo.typeValueId)) {
              sizeIdList.push(Number(sizeInfo.typeValueId));
            } else if (!this.$common.isEmpty(sizeInfo.value)) {
              otherInfo = sizeDataList.find(fin => fin.size == sizeInfo.value);
              if (!this.$common.isEmpty(otherInfo)) {
                sizeIdList.push(Number(otherInfo.sizeId));
              }
            }
          }
        }
      });
      let sizeText = [];
      let keyAndVal = [];
      this.productDetail.forEach(m => {
        if (!this.$common.isEmpty(m.sizeText)) {
          sizeText = m.sizeText.split(',');
          sizeText.forEach(s => {
            if (!this.$common.isEmpty(s)) {
              keyAndVal = s.split(':');
              otherInfo = sizeDataList.find(fin => fin.size == keyAndVal[0]);
              sizeIdList.push(Number(m.colorId));
            }
          })
        }
      });
      // 去重
      sizeIdList = this.$common.arrRemoveRepeat(sizeIdList);
      // 过滤空值
      sizeIdList = sizeIdList.filter(f => !this.$common.isEmpty(f));

      sizeIdList.forEach(sizeId => {
        if (!this.$common.isEmpty(this.sizeData[sizeId])) {
          backInfo.push(this.sizeData[sizeId]);
        }
      })
      return backInfo;
    },
    // 控制表格操作列展示
    frameHopping () {
      if (!this.isEdit) {
        return this.frameTbalCol.filter(fil => fil.key != 'operation')
      }
      return this.frameTbalCol;
    },
    // 跳码表追加的列
    frameTableHopping () {
      let pushCol = [];
      (this.getSizeConfig || []).forEach(item => {
        if (!this.$common.isEmpty(item.size)) {
          pushCol.push({
            title: item.size,
            // slot: `slot-${item.size}-${item.sizeId}`,
            slot: `slot-${item.size}`,
            align: 'center',
            minWidth: 100,
          })
        }
      })
      return pushCol;
    }
  },
  created() {},
  methods: {
    // 初始化数据
    initPage () {
      this.pageLoading = true;
      this.$common.promiseAll([this.getSizePartList]).finally(() => {
        this.transformTable(this.$common.copy(this.productDetail));
        this.pageLoading = false;
      })
    },
    // 重置数据
    resetData () {
      this.formValidate = {
        fhTableData: []
      }
    },
    // 添加部位测量数据
    pushFhData () {
      this.$set(this.pushModelFhData, 'fhTableData', this.formValidate.fhTableData);
      this.$nextTick(() => {
        this.pushFhVisible = true;
      })
    },
    // 获取尺码部位部位测量数据
    getSizePartList () {
      return new Promise((resolve) => {
        this.axios.get(api.queryAllProductSizePartList).then((res) => {
          if (res.data.code !== 0) {
            resolve({});
            return;
          }
          let obj = {};
          (res.data.datas || []).forEach(k => { obj[k.partId] = k; });
          this.partSizeData = obj;
          this.$set(this.pushModelFhData, 'tableData', (res.data.datas || []));
          resolve(obj);
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 字符长度验证
    strMaxVerify (rule, value, callback) {
      const maxLength = Number(rule.maxLength);
      if (rule.required && this.$common.isEmpty(value)) {
        return callback(new Error(rule.msg || '必填项不能为空'));
      }
      if (!this.$common.isEmpty(maxLength) && !this.$common.isEmpty(value) && value.length > maxLength) {
        return callback(new Error(`最多可输入 ${maxLength} 字符长度`));
      }
      callback();
    },
    // 确认添加部位测量数据
    pushFhConfirm (data) {
      let rowsDefaultVal = {};
      [...this.frameHopping, ...this.frameTableHopping].forEach(m => {
        if (m.key !== 'operation') {
          if (!this.$common.isEmpty(m.key)) {
            rowsDefaultVal[m.key] = null;
          } else if (!this.$common.isEmpty(m.slot)) {
            rowsDefaultVal[m.slot] = null;
          }
        }
      });
      let itemVal = {};
      const pushList = data.map(item => {
        itemVal = {
          ...rowsDefaultVal,
          ...item,
          position: item.cnName,
          positionId: item.partId
        }
        delete itemVal.partId;
        Object.keys(itemVal).forEach(key => {
          if (key.substring(key.length - 4, key.length) === 'Name') {
            delete itemVal[key];
          }
        })
        return itemVal;
      });
      this.formValidate.fhTableData = [...this.formValidate.fhTableData, ...pushList];
    },
    // 移除跳码表数据
    removeFrameData (row) {
      if (this.$common.isEmpty(row)) return;
      const rowName = row.map(item => item.position);
      this.$Modal.confirm({
        title: '操作',
        content: `<p>确认移除部位：${rowName.join('，')}？</p>`,
        loading: true,
        onOk: () => {
          const rowIds = this.$common.isArray(row) ? row.map(item => item.positionId) : [row.positionId];
          this.formValidate.fhTableData = this.formValidate.fhTableData.filter(item => {
            return !rowIds.includes(item.positionId);
          });
          this.$Modal.remove();
        }
      })
    },
    // 将接口返回的数据格式化
    transformTable (data) {
      const removeKey = ['relatedId', 'sizeText'];
      let rowInfo = {};
      let sizeText = [];
      let keyAndVal = [];
      let sizeObj = {};
      this.formValidate.fhTableData = data.map(row => {
        sizeObj = {};
        sizeText = row.sizeText.split(',');
        sizeText.forEach(s => {
          if (!this.$common.isEmpty(s)) {
            keyAndVal = s.split(':');
            sizeObj[`slot-${keyAndVal[0]}`] = this.$common.isEmpty(keyAndVal[1]) ? null : keyAndVal[1];
          }
        });
        rowInfo = {
          ...row,
          ...sizeObj,
          position: row.cnName,
          measurementDescription: row.measurementDescription,
          positionId: row.relatedId
        }

        removeKey.forEach(key => {
          delete rowInfo[key];
        });

        return rowInfo;
      })
    },
    // 处理跳码表数据
    handFhTableData (data) {
      const removeKey = ['classificationIdList', 'classificationNameList', 'positionId', 'position'];
      const keySplit = 'slot-';
      let startKey = '';
      let endKey = '';
      let keyVal = [];
      const newData = this.$common.copy(data);
      newData.forEach(item => {
        item.productId = this.productId; // 商品ID
        item.type = 3; // 后端要求写上； 类型（1：工艺，2：工序，3：尺码）
        item.relatedId = item.positionId; // 部位ID
        item.cnName = item.position; // 部位名称
        item.partId = item.positionId; // 部位ID
        // 尺码信息
        item.sizeText = '';
        Object.keys(item).forEach(key => {
          startKey = key.substring(0, keySplit.length);
          if (startKey === keySplit) {
            endKey = key.substring(keySplit.length, key.length);
            if (this.$common.isEmpty(endKey)) return;
            keyVal = endKey.split('-');
            item.sizeText = this.$common.isEmpty(item.sizeText) ? `${keyVal[0]}:${item[key]}` : `${item.sizeText},${keyVal[0]}:${item[key]}`;
            // item.laPaProductPatternInfoTableSizeQOList.push({
            //   size: keyVal[0],
            //   sizeId: keyVal[1],
            //   value: item[key]
            // })
            delete item[key];
          }
          if (removeKey.includes(key)) {
            delete item[key];
          }
        })
      });
      return newData;
    },
    // 获取表单数据
    getFormData (type) {
      return new Promise((resolve) => {
        const backRes = this.handFhTableData(this.formValidate.fhTableData || []);

        if (type == 1 && this.$refs.filterRefsDome) {
          this.$refs.filterRefsDome.validate((valid) => {
            if (!valid) {
              this.$Message.error('“生产尺码”表单验证不通过，请检查');
              return resolve({ success: false, message: '“生产尺码”表单验证不通过，请检查' });
            }
            const findDeleteRow = backRes.find(fin => {
              return fin.isDeleted == 1;
            });
            if (!this.$common.isEmpty(findDeleteRow)) {
              this.$Message.error('“生产尺码”存在已删除的部位，请移除后再保存');
              return resolve({ success: false, message: '“生产尺码”存在已删除的部位，请移除后再保存' });
            }
            resolve({ success: true, data: backRes });
          })
          return;
        }
        resolve({ success: true, data: backRes });
      })
    }
  }
};
</script>
<style lang="less" scoped>
.frame-hopping-page {
  position: relative;
  padding: 10px;
  .frame-hopping-table{
    :deep(.ivu-form-item){
      margin: 0;
    }
  }
}
</style>
