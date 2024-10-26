<template >
  <div class="productAbnormal page-main-content">
    <div class="listPage">
      <div class="searchMain">
        <Form ref="pageSearchForm" :model="searchFormData" :label-width="90">
          <dyt-filter ref="dyt-filter">
            <FormItem label="供应商" prop="supplierCode">
              <dyt-select v-model="searchFormData.supplierCode" placeholder="请选择供应商" @on-change="selectSupplierChange">
                <Option
                  v-for="(item, index) in supplierDataList"
                  :value="item.supplierCode"
                  :key="`s-${index}`"
                  :label="item.supplierName"
                />
              </dyt-select>
            </FormItem>
            <FormItem label="供方货号" prop="supplierNoList">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.supplierNoList"
                placeholder="多个请用逗号或回车分隔"
              />
            </FormItem>
            <FormItem label="SKC" prop="styleNumberList">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.styleNumberList"
                placeholder="多个请用逗号或回车分隔"
              />
            </FormItem>
            <FormItem label="库位" prop="warehouseLocationCodeList">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.warehouseLocationCodeList"
                placeholder="多个请用逗号或回车分隔"
              />
            </FormItem>
            <FormItem label="SKU" prop="skuList">
              <dyt-input-tag
                :limit="1"
                type="textarea"
                v-model="searchFormData.skuList"
                placeholder="多个请用逗号或回车分隔"
              />
            </FormItem>
            <FormItem label="名称" prop="productName">
              <dyt-input v-model="searchFormData.productName" placeholder="请输入名称" />
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="searchData(true)" :disabled="searchLoading" icon="md-search">查询</Button>
              <Button style="margin-left: 10px" @click="resetSearch" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <Button
              v-if="permission.export"
              type="primary"
              class="ml10"
              @click="openExportModal"
              :loading="exportData.loading"
            >导出</Button>
          </div>
          <!--排序-->
          <div>
            <!-- <span>排序方式：</span>
            <Button-group>
              <Button
                :type="item.checked ? 'primary' : 'default'"
                v-for="item in sortData"
                :disabled="searchLoading"
                @click="clickSortButton(item)"
                :key="item.value"
              >
                {{ item.label }}
                <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
                <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
              </Button>
            </Button-group> -->
          </div>
        </div>
      </div>
      <div class="tableMain">
        <div class="tableBox">
          <Table
            border
            highlight-row
            :height="tableHeight"
            ref="tableRef"
            :columns="tableColumns"
            :loading="searchLoading"
            :data="tableDaata"
            @on-selection-change="tableSelectionChange"
            :span-method="handleSpan"
          ></Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page
          :total="tableTotal"
          :current="searchFormData.pageNum"
          :page-size="searchFormData.pageSize"
          show-total
          show-sizer
          show-elevator
          @on-change="pageNumChange"
          @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"
        >
        </Page>
      </div>
    </div>
    <!-- 库存明细 -->
    <inventoryParticulars
      :visible.sync="particularsVisible"
      :supplier-data="supplierDataList"
      :module-data="checkTableRowInfo"
    />
    <!-- 导出弹窗 -->
    <Modal
      v-model="exportData.visible"
      title="导出所有"
      :mask-closable="false"
      width="700"
    >
      <div class="modal-export-content">
        <div class="modal-export-tips">
          <Icon type="md-information-circle" class="export-tips-icon" />
          <span>确认是否要导出所有查询的订单：</span>
          <span style="color: #f60;">{{ tableTotal }}</span>
        </div>
        <div>
          是否导出图片：
          <RadioGroup v-model="exportData.isExportImage">
            <Radio :label="1">导出图片</Radio>
            <Radio :label="0">
              不导出图片<span style="color: #f60; margin-left: 5px;">导出商品图片，数据量大，导出速度慢，请耐心等待</span>
            </Radio>
          </RadioGroup>

        </div>
        <Spin fix size="large" v-if="exportData.loading"></Spin>
      </div>
      <div slot="footer">
        <Button type="primary" @click="exportConfirm" :loading="exportData.loading">确定</Button>
        <Button @click="exportCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import inventoryParticulars from './inventoryParticulars';

// 合并行的列
const mergeColKey = [
  "inventoryId",
  "warehouseLocationCode"
];

export default {
  mixins: [Mixin],
  components: {
    inventoryParticulars
  },
  data () {
    return {
      particularsVisible: false,
      exportData: {
        visible: false,
        isExportImage: 0,
        loading: false
      },
      checkTableRowInfo: {},
      // 搜索栏值
      searchFormData: {
        pageNum: 1,
        pageSize: 20,
        sortType: 'DESC',
        sortField: 'warehouseLocationCode',
        supplierCode: '',
        supplierNoList: [],
        styleNumberList: [],
        warehouseLocationCodeList: [],
        skuList: [],
        productName: ''
      },
      searchLoading: false,
      sortData: [{
        value: 'CT',
        checked: true,
        toogle: true, // true DESC false ASC
        label: '按创建时间'
      },
      {
        value: 'UT',
        checked: false,
        toogle: true, // true DESC false ASC
        label: '按更新时间'
      }],
      // 表格列
      tableColumns: [
        // {
        //   type: "selection",
        //   width: 50,
        //   align: "center",
        // },
        {
          title: "基本信息",
          key: "inventoryId",
          align: "center",
          minWidth: 150,
          render: (h, { row }) => {
            let item = [];
            const imgage = h('div', {
              class: 'inventory-img',
            }, [this.tableImg(h, row, "imagePath")]);

            item.push(h('div', {}, [
              h('span', {}, 'SKC：'),
              h('span', {}, `${row.styleNumber || '-'}`)
            ]));

            item.push(h('div', {}, [
              h('span', {}, '供方货号：'),
              h('span', {}, `${row.supplierNo || '-'}`)
            ]));

            item.push(h('div', {}, `${row.productName || '-'}`));

            return h('div', {
              class: 'inventory-col',
            }, [imgage, h('div', {
              class: 'inventory-info',
            }, item)]);
          }
        },
        {
          title: "库位",
          key: "warehouseLocationCode",
          align: "center",
          width: 150,
        },
        {
          title: "SKU",
          key: "sku",
          align: "center",
          width: 150,
        },
        {
          title: "SKU属性",
          key: "specifications",
          align: "center",
          width: 150,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.specifications)) return h('div', '');
            return h('div', {
              style: {
                'display': 'inline-block',
                'white-space': 'pre-wrap',
                'text-align': 'left',
                'margin': '0 auto'
              },
            }, row.specifications);
          }
        },
        {
          title: "未发货数量",
          key: "unissuedQuantity",
          align: "center",
          width: 90,
        },
        {
          title: "未生产数量",
          key: "unProducedQuantity",
          align: "center",
          width: 90,
        },
        {
          title: "库存余量",
          key: "inventoryNum",
          align: "center",
          width: 90,
        },
        {
          title: "备注",
          key: "remark",
          align: "center",
          minWidth: 150,
        },
        {
          title: "操作",
          key: "operation",
          align: "center",
          width: 130,
          fixed: "right",
          render: (h, { row }) => {
            let item = [];
            this.permission.view && item.push(h('span', {
              class: 'operation-btn',
              on: {
                click: () => {
                  this.openParticulars(row);
                }
              }
            }, '库存明细'));
            return item;
          }
        }
      ],
      supplierDataList: [],
      // 表格数据
      tableDaata: [],
      // 选中数据
      tableSelectionData: [],
      // 列表总条数
      tableTotal: 0
    };
  },
  watch: {},
  created () {},
  computed: {
    // 权限
    permission() {
      return {
        // 查询
        query: this.getPermission("supplierInventory_list"),
        // 查看
        view: this.getPermission("supplierInventory_detailLogList"),
        // 导出
        export: this.getPermission("supplierInventory_export")
      };
    },
    tableHeight() {
      return this.getTableHeight(275);
    },
  },
  activated () {
    // this.searchData();
  },
  mounted () {
    // 获取供应商
    this.getSupplierList().then((res) => {
      // if (this.$common.isEmpty(res)) return;
      // this.searchFormData.supplierCode = res[0].supplierCode;
      // this.$nextTick(() => {
      //   this.searchData();
      // })
    });
  },
  methods: {
    // 查询列表数据
    searchData (type) {
      if (!this.permission.query) return this.$Message.error('您暂无权限查询！');
      if (this.searchLoading) return;
      const queryParams = this.getParamsData();
      if (this.$common.isEmpty(queryParams.supplierCode)) {
        this.$Message.error('请选择供应商');
        return;
      }
      this.searchLoading = true;
      // 是否重置页码
      if (type) {
        this.searchFormData.pageNum = 1;
      }
      this.tableSelectionData = [];
      this.axios.post(api.directly_queryPage, queryParams).then((res) => {
        if (!res || !res.data || res.data.code != 0 || !res.data.datas.data) return;
        let newList = [];
        let oldRow = {};
        (res.data.datas.data.list || []).forEach(row => {
          oldRow = this.$common.copy(row);
          delete oldRow.spsSupplierInventoryDetailVOS;
          if (!this.$common.isEmpty(row.spsSupplierInventoryDetailVOS)) {
            row.spsSupplierInventoryDetailVOS.forEach((item, sIndex) => {
              newList.push({
                ...oldRow,
                ...item,
                rowspan: sIndex == 0 ? row.spsSupplierInventoryDetailVOS.length : 0,
                colspan: sIndex == 0 ? 1 : 0,
              });
            })
          } else {
            newList.push({
              ...oldRow,
              rowspan: 1,
              colspan: 1,
            });
          }
        })
        this.tableDaata = newList;
        this.tableTotal = res.data.datas.data.total;
      }).finally(() => {
        this.$nextTick(() => {
          this.searchLoading = false;
        })
      })
    },
    // 选择供应商改变时
    selectSupplierChange () {
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.searchFormData.supplierCode)) {
          this.tableSelectionData = [];
          this.tableDaata = [];
          this.tableTotal = 0;
          return;
        }
        this.searchData(true);
      })
    },
    // 处理合并行列
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (mergeColKey.includes(column.key)) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
      return { rowspan: 1, colspan: 1 };
    },
    // 重置搜索栏
    resetSearch () {
      this.$refs["pageSearchForm"].resetFields();
    },
    // 获取已初始库存余量的供应商
    getSupplierList() {
      return new Promise((resolve) => {
        if (!this.$common.isEmpty(this.supplierDataList)) return resolve(this.supplierDataList);
        this.axios.post(`${api.get_SupplierInfo}?businessDeptIds=''`).then(res => {
          if (!res || !res.data || !res.data.datas) {
            this.supplierDataList = [];
            return resolve([]);
          }
          this.supplierDataList = (res.data.datas || []).filter(item => {
            return item.isInitInventory == 1;
          });
          resolve(this.supplierDataList);
        }).catch(() => {
          this.supplierDataList = [];
          return resolve([]);
        })
      })
    },
    // 返回搜索栏的值
    getParamsData () {
      let param = this.$common.copy(this.searchFormData);
      return param;
    },
    // 选中
    tableSelectionChange (val) {
      this.tableSelectionData = val;
    },
    // 排序
    clickSortButton (data) {
      this.searchFormData.sortType = data.value;
      // DESC 降
      this.sortField = data.toogle ? 'DESC' : 'ASC';
      if (data.value === this.searchFormData.sortType) {
        data.toogle = !data.toogle;
      }
      this.sortData.forEach((n) => {
        n.checked = data.value === n.value;
      });
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 页码改变
    pageNumChange(page) {
      this.searchFormData.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 条数改变
    pageSizeChange(size) {
      this.searchFormData.pageSize = size;
      this.$nextTick(() => {
        this.searchData();
      });
    },
    // 打开库存明细弹窗
    openParticulars (row) {
      this.checkTableRowInfo = this.$common.copy(row);
      this.$nextTick(() => {
        this.particularsVisible = true;
      });
    },
    // 打开导出弹窗
    openExportModal () {
      if (this.exportData.loading) return;
      const queryParams = this.getParamsData();
      if (this.$common.isEmpty(queryParams.supplierCode)) {
        this.$Message.error('请选择供应商');
        return;
      }
      this.exportData.visible = true;
    },
    // 导出数据
    exportConfirm () {
      if (this.exportData.loading) return;
      this.exportData.loading = true;
      let queryParams = this.getParamsData();
      queryParams.isExportImage = this.exportData.isExportImage;
      queryParams.warehouseId = this.$store.state.warehouseId;
      delete queryParams.pageNum;
      delete queryParams.pageSize;
      this.axios.post(api.directly_export, queryParams).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.$Message.success('导出成功！');
        this.exportCancel();
        // this.searchData();
      }).finally(() => {
        this.exportData.loading = false;
      })
    },
    // 关闭导出窗口
    exportCancel () {
      this.exportData.visible = false;
    }
  }
};
</script>
<style lang="less" scoped>
.page-main-content{
  :deep(.ivu-table-cell) {
    .operation-btn{
      display: inline-block;
      margin-left: 10px;
      color: #2d8cf0;
      text-decoration: underline;
      text-underline-position: under;
      cursor: pointer;
      &:nth-of-type(1){
        margin-left: 0;
      }
    }
    .inventory-col{
      display: flex;
      .inventory-img{
        padding-left: 10px;
      }
      .inventory-info{
        flex: 100;
        padding-left: 10px;
        text-align: left;
      }
    }
  }
}
.modal-export-content{
  position: relative;
}
.modal-export-tips{
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  .export-tips-icon{
    margin-right: 10px;
    color: #f60; font-size: 30px;
  }
}
</style>