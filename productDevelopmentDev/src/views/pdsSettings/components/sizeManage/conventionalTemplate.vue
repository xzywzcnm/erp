<template>
  <Modal :width="90" v-model="isVisible" :title="templateInfo.title" :closable="false" :mask-closable="false">
    <div class="conventionalTemplate">
      <Spin v-if="pageLoading" fix ></Spin >
      <div>
        <!-- <div class="template-title">{{templateInfo.title}}</div> -->
        <Table
          :columns="tableColumns"
          :data="tableData"
          border
          :max-height="tableHeight"
        >
          <template slot-scope="scope" slot="input">
            <dyt-input
              v-model="tableData[scope.index][scope.column.attr]"
              @on-focus="inputFocus(scope.row, scope.index, scope.column, $event)"
              @on-blur="inputBlur"
              @on-keyup="inputKeyUp"
              :ref="`${scope.index}-${scope.column.attr}`"
              :placeholder="scope.column.attr == 'size' ? '尺码名称' : scope.index > 0 ? '属性值' : '属性名'"
            />
          </template>
          <template slot-scope="scope" slot="span">
            <span>{{tableData[scope.index][scope.column.attr]}}</span>
          </template>
        </Table>
      </div>
      <!-- <div class="operation-btn">
        <Button type="primary" @click="addRow('before')" :disabled="!nowRow.row">光标前新增一行</Button>
        <Button type="primary" @click="addRow('after')" :disabled="!nowRow.row && tableData.length > 0">光标后新增一行</Button>
        <Button type="primary" @click="deleteRow" :disabled="!nowRow.row">删除当前行</Button>
      </div> -->
    </div>
    <div slot="footer">
      <Button @click="cancel" :disabled="pageLoading">取消</Button>
      <Button type="primary" @click="save" :disabled="pageLoading">确定</Button>
    </div>
  </Modal>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import api from '@/api/api';

export default {
  name: 'conventionalTemplate',
  components: {},
  mixins: [CommonMixin],
  props: {
    templateInfo: {
      type: Object,
      default: () => {
        return {
          row: {}
        }
      }
    },
    modelVisible: { type: Boolean, default: false }
  },
  data () {
    return {
      pageLoading: false,
      isVisible: false,
      tableHeight: 600,
      // 当前行
      nowRow: {},
      // 列设置
      tableColumns: [
        {
          title: 'Size-Details',
          align: 'center',
          children: [
            { title: 'Tag Size', attr: 'size', suitedKey: 'name', align: 'center', minWidth: 100, slot: 'span' },
            { title: '美式英语', attr: 'anValue', suitedKey: 'anName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '英式英语', attr: 'enValue', suitedKey: 'enName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '澳式英语', attr: 'auValue', suitedKey: 'auName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '德语', attr: 'gerValue', suitedKey: 'gerName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '法语', attr: 'fraValue', suitedKey: 'fraName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '西班牙语', attr: 'spnValue', suitedKey: 'spnName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '意大利语', attr: 'itValue', suitedKey: 'itName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '葡萄牙语', attr: 'porValue', suitedKey: 'porName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '波兰语', attr: 'polValue', suitedKey: 'polName', align: 'center', minWidth: 100, slot: 'input' },
            { title: '中文', attr: 'cnValue', suitedKey: 'cnName', align: 'center', minWidth: 100, slot: 'input' }
          ]
        }
      ],
      // 表格默认数据
      tableData: [],
      // 文本和值匹配键
      nameKeys: {},
      // 新增空行
      addRowData: {},
      // 初始化数据
      oldTableData: [],
      isFocus: false
    };
  },
  computed: {
    // 权限
    permission () {
      return {
        // query: this.getPermission('queryAttributeClassificationList')
      }
    }
  },
  watch: {
    modelVisible: {
      immediate: true,
      deep: true,
      handler (newVal) {
        this.isVisible = newVal;
        newVal && this.$nextTick(() => {
          this.initPage()
        })
      }
    },
    isVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:modelVisible', val);
      }
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(335) < 114 ? 114 : this.getTableHeight(335);
  },
  methods: {
    async initPage () {
      let newList = [];
      let noSort = [];
      let sizeInfo = [];
      // 设置新增行的空值
      this.tableColumns[0].children.forEach(item => {
        this.$set(this.nameKeys, item.suitedKey, item.attr)
        this.$set(this.addRowData, item.attr, '');
      })
      this.pageLoading = true;
      if (this.templateInfo.row && this.templateInfo.row.sizeList) {
        this.templateInfo.row.sizeList.forEach(item => {
          typeof item.sortNo != 'number' ? noSort.push(item) : newList.push(item);
        });
        // 获取尺码数据
        try {
          sizeInfo = await this.getSzieSet();
        } catch (error) {
          console.error(error);
        }
      }
      noSort.sort((min, big) => {
        return min.sizeId - big.sizeId
      })
      // 排序值为空或
      noSort.forEach((item, index) => {
        item.sortNo = newList.length + index + 1;
      });
      newList = [...newList, ...noSort];
      newList.sort((min, big) => {
        return min.sortNo - big.sortNo;
      });
      if (sizeInfo.length == 0) {
        let list = this.$common.copy(this.addRowData);
        !list.size && (list.size = 'Size');
        this.tableData = [list];
      } else {
        this.tableDataHand(sizeInfo, newList);
        this.pageLoading = false;
        return;
      }

      newList.forEach(item => {
        this.tableData.push({
          ...this.$common.copy(this.addRowData),
          size: item.size || '',
          sizeId: item.sizeId || ''
        })
      });
      this.oldTableData = this.$common.copy(this.tableData);
      this.pageLoading = false;
    },
    // 接口返回值处理
    tableDataHand (data, size) {
      const values = Object.values(this.nameKeys);
      const keys = Object.keys(this.nameKeys);
      const nameRow = this.$common.copy(this.addRowData);
      let resData = this.$common.copy(data);
      let sizeJson = {};
      size.forEach(item => {
        sizeJson[item.sizeId] = item;
      })
      // 增加排序标记
      resData = resData.map(item => {
        return { ...item, sortNo: sizeJson[item.sizeId].sortNo }
      })
      // 进行排序
      resData.sort((min, big) => {
        return min.sortNo - big.sortNo;
      })
      resData.forEach(item => {
        // 移除排序标记
        delete item.sortNo;
        Object.keys(item).forEach(key => {
          if (keys.includes(key) && !nameRow[values[keys.indexOf(key)]]) {
            nameRow[values[keys.indexOf(key)]] = item[key];
          }
        })
      })
      this.tableData = [...[nameRow], ...resData];
      this.oldTableData = this.$common.copy(this.tableData);
    },
    // 获取尺码模板数据
    getSzieSet () {
      return new Promise(resolve => {
        this.axios.post(api.sizeManageApiConfig.sizeTypeManage.queryProductSizeTemplate, {
          sizeTypeId: this.templateInfo.row.sizeTypeId,
          templateType: this.templateInfo.templateType,
          sizeGroupNo: this.templateInfo.row.sizeGroupNo
        }).then(res => {
          res && res.code == 0 ? resolve(res.datas || []) : resolve([]);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 保存尺码模板数据
    save (callBack) {
      // this.pageLoading = true;
      const obj = {
        sizeGroupNo: this.templateInfo.row.sizeGroupNo,
        sizeTypeId: this.templateInfo.row.sizeTypeId,
        templateAttributesDTOList: this.dataHand(this.tableData),
        templateType: this.templateInfo.templateType,
        templateName: this.templateInfo.templateName
      }
      this.axios.post(api.sizeManageApiConfig.sizeTypeManage.saveProductSizeTemplate, obj).then(res => {
        if (res && res.code == 0) {
          this.$Message.success('保存成功');
          this.cancelSave();
        } else {
          this.$Message.error('保存失败！');
        }
        this.$nextTick(() => {
          typeof callBack == 'function' && callBack();
        })
        this.pageLoading = false;
      }).catch(() => {
        this.$nextTick(() => {
          typeof callBack == 'function' && callBack();
        })
        this.pageLoading = false;
      })
    },
    // 提交保存时数据处理
    dataHand (data) {
      let newData = this.$common.copy(data);
      let name = newData.splice(0, 1)[0];
      const values = Object.values(this.nameKeys);
      const keys = Object.keys(this.nameKeys);
      const keysVal = Object.keys(name);
      let nameJsons = {};
      values.forEach((val, index) => {
        if (keysVal.includes(val)) {
          nameJsons[keys[index]] = name[val]
        }
      });
      const list = newData.map(item => {
        return { ...item, ...nameJsons }
      })
      return list;
    },
    // 取消
    cancel () {
      this.dataIsChange() ? this.$Modal.confirm({
        title: '提示',
        okText: '保 存',
        cancelText: '不保存',
        render: h => {
          return h('span', '表格模板已被您修改，是否需要保存？');
        },
        // 保存
        onOk: () => {
          this.save(() => {
            this.cancelSave();
          })
        },
        // 取消
        onCancel: this.cancelSave
      }) : this.cancelSave();
    },
    // 取消保存
    cancelSave (callBack) {
      // this.tableData = this.$common.copy(this.oldTableData);
      this.$nextTick(() => {
        typeof callBack == 'function' && callBack();
        this.isVisible = false;
      })
    },
    inputFocus (row, index, column, event) {
      this.isFocus = true;
      this.nowRow = { row: row, index: index, col: column };
      // event.currentTarget.select();
    },
    inputBlur () {
      this.isFocus = false;
      setTimeout(() => {
        !this.isFocus && (this.nowRow = {});
      }, 500)
    },
    // 键盘事件
    inputKeyUp (e) {
      const hand = {
        getColIndex: (colKey) => {
          const colArr = this.tableColumns[0].children.map(item => {
            return item.attr
          })
          return colArr.indexOf(colKey);
        },
        // 左
        '37': (num) => {
          const colIndex = hand.getColIndex(this.nowRow.col.attr);
          if (colIndex == -1) return;
          const colInfo = this.tableColumns[0].children[colIndex + (num || -1)];
          if (colInfo) {
            const dome = this.$refs[`${this.nowRow.index}-${colInfo.attr}`];
            dome && dome.focus({ cursor: 'all' });
          }
        },
        // 上
        '38': (num) => {
          const dome = this.$refs[`${this.nowRow.index + (num || -1)}-${this.nowRow.col.attr}`];
          dome && dome.focus({ cursor: 'all' });
        },
        // 右
        '39': () => {
          hand['37'](1);
        },
        // 下
        '40': () => {
          hand['38'](1);
        }
      }
      hand[e.keyCode] && hand[e.keyCode]();
    },
    // 新增行
    addRow (type) {
      const newRow = this.$common.copy(this.addRowData);
      if (!this.nowRow.row) {
        this.tableData.push(newRow);
        this.$nextTick(() => {
          this.$refs[`0-${this.nameKeys.name}`].focus({ cursor: 'end' });
        })
        return;
      }
      if (type == 'before') {
        this.tableData.splice(this.nowRow.index, 0, newRow);
        this.$nextTick(() => {
          // 新增后，，保持焦点不变
          this.$refs[`${this.nowRow.index + 1}-${this.nowRow.col.attr}`].focus({ cursor: 'end' });
        })
      } else {
        this.tableData.splice(this.nowRow.index + 1, 0, newRow);
        this.$nextTick(() => {
          // 新增后，，保持焦点不变
          this.$refs[`${this.nowRow.index}-${this.nowRow.col.attr}`].focus({ cursor: 'end' });
        })
      }
    },
    deleteRow () {
      if (!this.nowRow.row) return;
      this.tableData.splice(this.nowRow.index, 1);
      // 删除后，焦点移动到最近一行
      if (this.nowRow.index != this.tableData.length) {
        this.$refs[`${this.nowRow.index}-${this.nowRow.col.attr}`].focus({ cursor: 'end' });
      } else if (this.tableData.length > 0) {
        this.$refs[`${this.nowRow.index - 1}-${this.nowRow.col.attr}`].focus({ cursor: 'end' });
      }
    },
    dataIsChange () {
      const old = JSON.stringify(this.oldTableData);
      const newTabel = JSON.stringify(this.tableData);
      return old != newTabel;
    }
  }
};
</script>
<style lang="less" scoped>
.conventionalTemplate{
  min-height: 200px;
  .template-title{
    margin-top: 15px;
    padding: 8px 10px;
    color: #fff;
    background-color: #113f6d;
  }
  .operation-btn{
    padding: 10px 0 0 0;
    text-align: right;
    button {
      margin-right: 5px;
      &:last-child{
        margin: 0;
      }
    }
  }
}
</style>
