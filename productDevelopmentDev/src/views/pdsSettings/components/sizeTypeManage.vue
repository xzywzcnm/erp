<template>
  <div class="mainBox sizeTypeManage" style="min-width: 800px;">
    <Card shadow>
      <div class="operaBtn" style="display: flex;">
        <div style="flex: 50;">
          <!-- v-if="getPermission('pdsSettings_sizeTypeRelManage_export')" -->
          <Button type="primary" @click="exportExcel()" :loading="exportLoading">导出</Button>
        </div>
        <div style="flex: 50; text-align: right;">
          <Button icon="ivu-icon ivu-icon-md-sync" type="primary" @click="getList" :disabled="tableLoading">刷新</Button>
        </div>
      </div>
      <div class="mt10">
        <Table :columns="columns" :data="tableList" border :loading="tableLoading" highlight-row
          :max-height="tableHeight">
          <template slot-scope="{ row }" slot="sizeType">
            <span>{{ typeNameJson[row.sizeTypeId] ? typeNameJson[row.sizeTypeId].typeName : '' }}</span>
          </template>
          <template slot-scope="{ row }" slot="sizeGroupNo">
            <span v-if="!$common.isEmpty(row.sizeTypeId) && useStandTypeId.includes(Number(row.sizeTypeId))">
              {{ sizeStand[row.sizeGroupNo] && sizeStand[row.sizeGroupNo].name }}
            </span>
            <span v-else>{{ sizeGroup[row.sizeGroupNo] && sizeGroup[row.sizeGroupNo].name }}</span>
          </template>
          <template slot-scope="{ row }" slot="size">
            <span style="font-size: 14px;">{{ row.selectSizeTxt }}</span>
          </template>
          <template slot-scope="{ row }" slot="action">
            <!-- v-if="getPermission('pdsSettings_sizeTypeRelManage_update')" -->
            <!-- 尺码编辑 -->
            <Button size="small" @click="edit(row)">编辑</Button>
          </template>
          <template slot-scope="{ row }" slot="action1">
            <!-- 尺码模板编辑 -->
            <Button size="small" @click="openTemplate(row, 'general')">编辑</Button>
          </template>
          <!-- <template slot-scope="{ row }" slot="action2">
            <Button v-if="![3, '3'].includes(row.sizeTypeId)" size="small" @click="openTemplate(row, 'bottom')">编辑</Button>
          </template> -->
          <template slot-scope="{ row }" slot="action3">
            <!-- 跳码分段编辑 -->
            <Button size="small" @click="openJumpSize(row)" v-if="!$common.isEmpty(row.sizeList)">编辑</Button>
          </template>
        </Table>
      </div>
      <addType :modelVisible.sync="modelVisible" :dialogObj="dialogObj" @fetch="getList" :sizeList="sizeList" />
      <setJumpSize :modelVisible.sync="jumpSizeVisible" :dialogObj="dialogObj" @fetch="getList" :sizeList="sizeList" />
      <conventionalTemplate :modelVisible.sync="templateVisible" :template-info.sync="templateInfo" />
    </Card>
  </div>
</template>

<script>
import api from '@/api/api.js';
import CommonMixin from "@/components/mixin/commonMixin";
import addType from './sizeManage/addType';
import setJumpSize from './sizeManage/setJumpSize';
import conventionalTemplate from './sizeManage/conventionalTemplate';
import { downFile } from '@/utils/comConfig.js';

export default {
  name: 'sizeTypeManage',
  components: { addType, conventionalTemplate, setJumpSize },
  mixins: [CommonMixin],
  data() {
    return {
      templateVisible: false,
      jumpSizeVisible: false,
      templateInfo: {},
      tableList: [],
      typeNameJson: {},
      columns: [
        {
          title: '尺码类型',
          slot: 'sizeType',
          width: '150px'
        },
        {
          title: '尺码组',
          slot: 'sizeGroupNo',
          width: '150px'
        },
        {
          title: '尺码',
          slot: 'size',
          minWidth: 200
        },
        {
          title: '编辑',
          slot: 'action',
          align: 'center',
          width: 90
        },
        {
          title: '尺码模版',
          slot: 'action1',
          align: 'center',
          width: 90
        },
        {
          title: '跳码分段',
          slot: 'action3',
          align: 'center',
          width: 90
        }
        // {
        //   title: '下装尺码模版',
        //   slot: 'action2',
        //   align: 'center',
        //   width: '120px'
        // }
      ],
      tableLoading: false,

      modelVisible: false,
      dialogObj: {},
      useStandTypeId: [0, 1],
      sizeGroup: {
        1: { name: '尺码组1' },
        2: { name: '尺码组2' }
      },
      sizeStand: {
        1: { name: '现货款' },
        2: { name: '打版款' }
      },
      sizeList: [],
      exportLoading: false,
      tableHeight: 500
    }
  },
  activated() { },
  created() {
    this.tableHeight = this.getTableHeight(230);
    this.getTypelist();
    this.getsizeList();
    this.getList();
  },
  methods: {
    // 获取尺码列表
    getList() {
      this.tableLoading = true;
      this.axios.get(api.queryProductSizeTypeRel).then((data) => {
        if (data.code === 0) {
          let list = this.computedList(data.datas || []);
          this.tableList = list.map(row => {
            return {
              ...row,
              selectSizeTxt: this.mulSize(row).join(' / ')
            }
          });
        }
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 处理尺码数据
    computedList(list) {
      let typelist = this.sortSizelist();
      list.forEach(k => {
        if (!(k.sizeList && k.sizeList.length)) return;
        k.sizeList.forEach((ck, ci) => {
          // 数字
          if (/^\d+$/.test(ck.size)) {
            ck.sizeNum = ck.size;
            return;
          }

          // 已知服装型号
          let flag = false;
          typelist.forEach(tk => {
            if (!flag && (ck.size === tk.size)) {
              ck.sizeNum = tk.sizeNum;
              flag = true;
            }
          })
          if (flag) return;

          // 未知(sizeid按照添加顺序)
          ck.sizeNum = ck.sizeId;
        })
        k.sizeList.sort(this.compare('sizeNum'));
      });

      return list;
    },
    // 添加
    edit(row) {
      this.dialogObj = JSON.parse(JSON.stringify(row));
      this.$nextTick(() => {
        this.modelVisible = true;
      });
    },
    // 打开模板
    openTemplate(row, type) {
      let title = this.typeNameJson[row.sizeTypeId] ? this.typeNameJson[row.sizeTypeId].typeName : '';
      this.templateInfo.templateName = title;
      this.templateVisible = true;
      this.templateInfo.templateType = type == 'general' ? 0 : 1;
      this.templateInfo.row = row;
      this.templateInfo.title = title;
      // general bottom
    },
    // 打开跳码分段弹窗
    openJumpSize (row) {
      if (this.$common.isEmpty(row.sizeList)) return this.$Message.error('尚未关联尺码，不能设置跳码分段');
      this.dialogObj = JSON.parse(JSON.stringify(row));
      this.$nextTick(() => {
        this.jumpSizeVisible = true;
      });
    },
    // 导出
    exportExcel() {
      this.exportLoading = true;
      this.axios({
        method: 'post',
        url: api.exportProductSizeTypeRelList,
        responseType: 'blob',
        timeout: 600000
      }).then(({ resData, filename }) => {
        this.$Message.success('正在导出...');
        downFile(resData, filename);
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    // 获取尺码类型
    getTypelist() {
      this.axios.get(api.queryProductSizeTypeList, { hiddenError: true }).then((data) => {
        if (data.code === 0) {
          (data.datas || []).forEach(item => {
            this.$set(this.typeNameJson, item.sizeTypeId, item);
          })
        }
      })
    },
    // 获取尺码列表
    getsizeList() {
      return this.axios.get(api.queryProductSizeList).then((data) => {
        if (data.code === 0) {
          this.sizeList = data.datas || [];
        }
      })
    },
    // 处理尺码
    mulSize(row) {
      let list = [];
      let rowIdObj = {};
      (row.sizeList || []).forEach(item => {
        rowIdObj[item.sizeId] = item;
      });
      this.sizeList.forEach(k => {
        if (!this.$common.isEmpty(rowIdObj[k.sizeId])) {
          list.push(rowIdObj[k.sizeId]);
        }
      });
      list.sort((a, b) => {
        return a.sortNo - b.sortNo;
      });
      return list.map(m => m.size);
    },
    // 尺码比较
    compare(prop) {
      return (a, b) => {
        let c = a[prop];
        let d = b[prop];
        return c - d;
      }
    },
    // 尺码
    sortSizelist() {
      let sizeSort = [
        { size: 'XXS' },
        { size: 'XS' },
        { size: 'S' },
        { size: 'M' },
        { size: 'L' },
        { size: 'XL' },
        { size: '2XL' },
        { size: '3XL' },
        { size: '4XL' },
        { size: '5XL' },
        { size: '6XL' },
        { size: '7XL' },
        { size: 'Free Size' }
      ]
      sizeSort = sizeSort.map((k, index) => {
        return { size: k.size, sizeNum: index };
      })
      return sizeSort;
    }
  }
}
</script>

<style lang="less" scoped>
.sizeTypeManage {
  padding: 0;

  :deep(.ivu-table-cell-slot) {
    .ivu-btn {
      padding: 0 4px;
    }
  }
}
</style>
