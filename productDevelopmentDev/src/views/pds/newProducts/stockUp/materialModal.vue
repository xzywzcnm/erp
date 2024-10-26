<template>
  <Modal v-model="pageVisible" title="新增物料" :mask-closable="false" width="80%">
    <div class="modal-contain">
      <div class="filter-contain">
        <Form
          ref="formRefDemo"
          label-position="right"
          :model="filterData"
          :label-width="80"
          class="form-contain"
        >
          <Form-item label="物料类型" prop="materialTypes">
            <dytSelect v-model="filterData.materialTypes" :multiple="true" :max-tag-count="1">
              <Option v-for="(item, index) in Object.values(materialTypeData)" :value="item.value" :key="`s-${index}`">{{ item.label }}</Option>
            </dytSelect>
          </Form-item>
          <Form-item label="物料名称" prop="materialNames">
            <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入物料名称, 多个逗号或回车分隔" v-model="filterData.materialNames" />
          </Form-item>
        </Form>
        <div class="filter-btn">
          <Button type="primary" @click="getTableList({pageNumber: 1})" icon="md-search" :disabled="tableLoading">查询</Button>
        </div>
      </div>
      <Table :columns="columns" :data="tableData" @on-selection-change="tableCheckChange" border highlight-row height="450" />
      <div class="page-contain">
        <div>
          <Checkbox v-model="isPushAll">添加到所有颜色</Checkbox>
        </div>
        <Page
          :total="total"
          @on-change="changePageHnad"
          show-total
          :page-size="filterData.pageSize"
          show-elevator
          :current="filterData.pageNum"
          show-sizer
          @on-page-size-change="changePageSizeHnad"
          placement="top"
          :page-size-opts="pageArray"
        />
      </div>
      <Spin v-if="loading" fix></Spin>
    </div>
    <div slot="footer">
      <Button @click="pageVisible = false">取消</Button>
      <Button type="primary" @click="handleSubmit" :loading="loading">确定</Button>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
  </Modal>
</template>

<script>
import api from '@/api/api.js';
import { materialTypeData, meteringUnit } from '@/utils/pdsSettingConstant';

export default {
  name: 'materialModal',
  props: {
    modelVisible: {type: Boolean, default: false},
    modelData: {
      type: Object,
      default () {
        return {
          fhTableData: [],
          tableData: []
        }
      }
    }
  },
  data () {
    return {
      pageVisible: false,
      pageLoading: false,
      tableLoading: false,
      isPushAll: false,
      total: 0,
      pageArray: [10, 20, 50, 100, 500],
      supplyList: [],
      filterData: {
        pageNum: 1,
        pageSize: 20,
        enableStatus: 1, // 必须是启用状态的
        materialTypes: [],
        materialNames: []
      },
      materialTypeData: materialTypeData,
      meteringUnit: meteringUnit,
      tableData: [],
      checkedTableData: [],
      loading: false,
      columns: [
        {
          type: 'selection',
          width: 50,
          key: 'selection',
          align: 'center',
          // fixed: 'left'
        },
        {
          title: '物料编码',
          key: 'materialCode',
          width: 160,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.materialCode)) return h('span', '');
            return h('span', {
              style: {},
              on: {
                click: () => {
                  this.pushMaterial(row, 'view');
                }
              },
            }, row.materialCode);
          }
        },
        {
          title: '物料名称',
          key: 'materialName',
          align: 'center',
          minWidth: 150
        },
        {
          title: '图片',
          key: 'path',
          align: 'center',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.path)) return h('span', '');
            let imgUrl = row.path;
            return h('Poptip', {
              props: {
                placement: 'right',
                trigger: 'hover',
                transfer: true
              },
              style: {
                width: '46px',
                height: '46px',
                objectFit: 'cover',
                verticalAlign: 'middle',
                margin: '2px'
              }
            }, [
              h('div', {}, [
                h('img', {
                  attrs: {
                    src: `./filenode/s${imgUrl}`,
                    onerror: 'javascript:this.src=\'./static/images/placeholder.jpg\''
                  },
                  style: {
                    width: '46px',
                    height: '46px',
                    objectFit: 'cover',
                    verticalAlign: 'middle',
                    cursor: 'pointer'
                  }
                }),
                h('span')
              ]), !imgUrl || h('img', {
                slot: 'content',
                props: {},
                attrs: {
                  src: `./filenode/s${imgUrl}`,
                },
                style: {
                  width: '400px',
                  height: 'auto',
                  verticalAlign: 'middle'
                }
              })
            ]);
          }
        },
        {
          title: '物料单价',
          key: 'price',
          width: 100,
          align: 'center'
        },
        {
          title: '物料类型',
          key: 'materialType',
          align: 'center',
          width: 100,
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.materialTypeData[row.materialType])) return h('span','');
            return h('span', `${this.materialTypeData[row.materialType].label}`);
          }
        },
        {
          title: '物料供应商',
          key: 'supplierId',
          minWidth: 110,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.supplierId)) return h('span','');
            const supplyInfo = this.supplyList.find(item => {
              return item.supplierId == row.supplierId
            })
            if (this.$common.isEmpty(supplyInfo)) return h('span','');
            return h('span', supplyInfo.supplierName);
          }
        },
        {
          title: '物料单位',
          key: 'unitMeasurement',
          width: 100,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(this.meteringUnit[row.unitMeasurement])) return h('span','');
            return h('span', `${this.meteringUnit[row.unitMeasurement].label}`);
          }
        }
      ]
    };
  },
  watch: {
    modelVisible: {
      handler (newVal) {
        this.pageVisible = newVal;
        if (!newVal) return;
        this.$nextTick(() => {
          this.initData();
        })
      },
      deep: true,
      immediate: true
    },
    pageVisible : {
      deep: true,
      handler (newVal) {
        this.$emit('update:modelVisible', newVal);
        if (newVal) return;
        this.resetData();
      },
      
    },
  },
  computed: {
    // 登录人事业部信息
    securityUser () {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    }
  },
  methods: {
    // 初始化数据
    initData () {
      this.$refs.formRefDemo && this.$refs.formRefDemo.resetFields();
      let awaitRes = [this.getTableList, this.getSupplierList];
      this.checkedTableData = [];
      this.tableData = [];
      this.loading = true;
      this.$common.promiseAll(awaitRes).finally(() => {
        // const partIds = (this.modelData.fhTableData || []).map(m => m.partId);
        // this.tableData = (this.modelData.tableData || []).filter(item => !partIds.includes(item.partId));
        this.loading = false;
      })
    },
    // 查询物料信息
    getTableList (page) {
      if (!this.$common.isEmpty(page) && !this.$common.isEmpty(page.pageNumber)) {
        this.filterData.pageNum = page.pageNumber;
      }
      this.tableLoading = true;
      this.$nextTick(() => {
        this.checkedTableData = [];
        this.tableData = [];
        this.$axios.post(api.queryProductMaterialList, this.filterData).then((res) => {
          if (res.code != 0 || this.$common.isEmpty(res.datas)) return;
          this.total = res.datas.total;
          this.tableData = res.datas.list;
        }).finally(() => {
          this.tableLoading = false;
        })
      })
    },
    // 重置数据
    resetData () {
      this.tableData = [];
      this.checkedTableData = [];
      this.loading = false;
    },
    // 获取供应商列表
    getSupplierList() {
      this.$axios.get(api.queryAllSupplierInfo).then((res) => {
        this.supplyList = res.code === 0 ? res.datas || [] : [];
      })
    },
    // 确定
    handleSubmit () {
      if (this.$common.isEmpty(this.checkedTableData)) {
        return this.$Message.error('请选择数据!');
      }
      this.$emit('confirm', {
        // 是否添加到所有颜色
        type: this.isPushAll,
        // 选中的数据
        data: this.checkedTableData
      });
      this.$nextTick(() => {
        this.pageVisible = false;
      })
    },
    // 选中数据改变
    tableCheckChange (val) {
      this.checkedTableData = this.$common.copy(val);
    },
    // 翻页
    changePageHnad (val) {
      this.filterData.pageNum = val;
      this.$nextTick(() => {
        this.getTableList();
      })
    },
    // 列表条数
    changePageSizeHnad (val) {
      this.filterData.pageSize = val;
      this.$nextTick(() => {
        this.getTableList();
      })
    }
  }
};
</script>

<style lang="less" scoped>
.modal-contain{
  position: relative;
  .filter-contain{
    display: flex;
    flex-flow: wrap;
    .form-contain{
      display: flex;
      flex-flow: wrap;
      max-width: calc(100% - 100px);
      :deep(.ivu-form-item){
        width: 300px;
        .ivu-select{
          width: 100%;
        }
      }
    }
    .filter-btn{
      margin-left: 10px;
    }
  }
  :deep(.ivu-table-column-center) {
    .ivu-table-cell{
      &:first-child {
        padding: 8px;
        white-space: initial;
        word-break: break-word;
        text-overflow: initial;
        overflow: initial;
      }
    }
  }
  .page-contain{
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    :deep(.ivu-page){
      display: inline-block;
    }
  }
}
</style>