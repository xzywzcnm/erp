<template>
  <div class="technologicalRequirePage">
    <div>
      <div class="mb10">
        <Button type="primary" @click="add" v-if="isEdit">新增工艺</Button>
      </div>
      <Table border :columns="technoColumns" :data="tableData"></Table>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
    <Modal v-model="productInfo.dialogVisible" width="800" title="新增工艺" :mask-closable="false" :closable="false">
      <div>
        <Form ref="productInfo" :model="productInfo.formValidate" inline :label-width="80" class="fmb16 formSearch">
          <FormItem label="工艺类型:" prop="technologyType">
            <dyt-select v-model="productInfo.formValidate.technologyType" placeholder="请选择" multiple :max-tag-count="1">
              <Option v-for="(item, index) in productInfo.techTypeList" :key="`b-${index}`" :value="item.value">
                {{ item.label }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="工艺名称:" prop="technologyName">
            <Input v-model="productInfo.formValidate.technologyName" placeholder="请输入" />
          </FormItem>
          <FormItem label="" :label-width="0">
            <Button type="primary" @click="search">查询</Button>
          </FormItem>
        </Form>
        <Table border :columns="productInfo.modalTableColumns" :data="productInfo.modalTableData" max-height="460"
          @on-selection-change="selectChange" ref="selection" :loading="productInfo.tableLoading"></Table>
        <div style="text-align:right;" class="mt10"><page-common :pageConfig="productInfo.proPage"
            @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common></div>
      </div>
      <div slot="footer">
        <Button @click="productInfo.dialogVisible = false">取消</Button>
        <Button type="primary" @click="handleNext">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api.js';
import pageCommon from './pageCommon';
export default {
  name: "technologicalRequire",
  components: { pageCommon },
  props: {
    // 是否显示
    modelVisible: { type: Boolean, default: false },
    // 是否禁用
    disabled: { type: Boolean, default: false },
    // 商品数据
    productData: { type: Object, default () { return {} } }
  },
  data() {
    const techTypeList = {
      0: { label: '裁剪', value: 0 },
      1: { label: '车缝', value: 1 },
      2: { label: '尾整', value: 2 },
    }
    const commonColumns = [
      {
        title: '工艺名称',
        key: 'technologyName',
        align: 'center',
        width: '160',
        render: (h, { row }) => {
          if (row.isDeleted == 0 || this.$common.isEmpty(row.isDeleted)) return h('span', {}, row.technologyName);
          return h('div', {}, [
            h('div', {}, row.technologyName),
            h('div', {
              style: {
                color: '#f20'
              }
            }, '(已删除)')
          ])
        }
      },
      {
        title: '工艺类型',
        key: 'technologyType',
        align: 'center',
        width: '160',
        render: (h, params) => {
          let item = techTypeList[params.row.technologyType] || {};
          return h('span', item.label || '');
        }
      },
      {
        title: '工艺描述',
        key: 'description',
        align: 'center',
      }
    ]
    return {
      pageLoading: false,
      fileList: [],
      tableData: [],
      tableTecColumns: commonColumns,
      productInfo: {
        dialogVisible: false,
        formValidate: { technologyType: [], technologyName: '' },
        modalTableColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          ...commonColumns,
        ],
        modalTableData: [],
        checkedList: [],
        techTypeList: techTypeList,
        proPage: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
        },
        tableLoading: false,
      },
    };
  },
  watch: {
    // technological: {
    //   immediate: true,
    //   deep: true,
    //   handler (val, oldVal) {
    //     this.$nextTick(() => {
    //       if (!this.modelVisible) return;
    //       this.pageInit(val);
    //     })
    //   }
    // },
    modelVisible: {
      immediate: true,
      deep: true,
      handler (val) {
        if (!val) return this.resetData();
        this.$nextTick(() => {
          setTimeout(() => {
            this.pageInit(this.technological);
          }, 300)
        })
      }
    }
  },
  computed: {
    // 工艺信息
    technological () {
      if (this.$common.isEmpty(this.productData)) return {};
      if (this.$common.isEmpty(this.productData.laPaApiProductTechnologyVOList) && this.$common.isEmpty(this.productData.fileUrlList)) return {};
      return {
        fileUrlList: this.productData.fileUrlList,
        list: this.productData.laPaApiProductTechnologyVOList
      }
    },
    // 是否可编辑
    isEdit () {
      return !this.disabled;
    },
    // 列表列设置
    technoColumns () {
      const operation = {
        title: '操作',
        key: 'index',
        width: '120',
        align: 'center',
        render: (h, { index }) => {
          return h('div', {
            style: {
              display: 'inline-block',
              cursor: 'pointer',
              color: '#2d8cf0',
            },
            on: {
              'click': () => {
                this.$Modal.confirm({
                  title: '操作',
                  content: '<p>确认移除该工艺？</p>',
                  loading: true,
                  onOk: () => {
                    this.$Modal.remove();
                    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                    this.tableData.splice(index, 1);
                  }
                });
              }
            }
          }, '移除')
        },
      };
      return this.isEdit ? [operation, ...this.tableTecColumns] : this.tableTecColumns;
    }
  },
  created() {},
  methods: {
    pageInit (datas) {
      this.pageLoading = true;
      let awaitRes = [
        () => {
          return this.detail(datas);
        }
      ];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 重置数据
    resetData () {
      this.tableData = [];
    },
    detail(temps) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(temps)) return resolve(temps);
        this.fileList = (temps.fileUrlList || []).map(item => {
          return {
            url: item,
            name: '',
            selected: false
          }
        });
        this.tableData = (temps.list || []).map(k => {
          return {
            description: k.technologyDesc,
            ...k,
          }
        })
        resolve(temps);
      })
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        let temp = {};
        // temp.fileUrlList = this.$common.isEmpty(this.fileList) ? [] : this.fileList.map(item => item.url);
        temp.list = this.tableData.map(k => {
          return {
            ...k,
            technologyDesc: k.description,
          }
        })
        if (type == 1) {
          // if (this.$common.isEmpty(temp.list)) {
          //   this.$Message.error('“工艺要求”工艺至少选一个');
          //   return resolve({ success: false, message: '“工艺要求”工艺至少选一个' });
          // }
          const findDeleteRow = temp.list.find(fin => {
            return fin.isDeleted == 1;
          });
          if (!this.$common.isEmpty(findDeleteRow)) {
            this.$Message.error('“工艺要求”存在已删除的工艺，请移除后再保存');
            return resolve({ success: false, message: '“工艺要求”存在已删除的工艺，请移除后再保存' });
          }
          resolve({ success: true, data: temp });
          return;
        }
        resolve({ success: true, data: temp });
      })
    },
    add() {
      this.productInfo.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['productInfo'].resetFields();
        this.$refs.selection.selectAll(false);
      })
      this.search();
    },
    search() {
      this.productInfo.proPage.pageNum = 1;
      this.getList();
    },
    getList() {
      let temp = this.$common.removeEmpty({ ...this.productInfo.formValidate, ...this.productInfo.proPage });
      delete temp.total;
      this.productInfo.tableLoading = true;
      this.axios.post(api.queryProductTechnologyList, temp).then((res) => {
        if (res.data && res.data.datas) {
          this.productInfo.modalTableData = res.data.datas.list || [];
          this.productInfo.proPage.total = res.data.datas.total || 0;
          this.$refs.selection.selectAll(false);
          this.productInfo.checkedList = [];
        }
      }).finally(() => {
        this.productInfo.tableLoading = false;
      });
    },
    handleNext() {
      let list = this.productInfo.checkedList;
      if (!list.length) {
        this.$Message.warning('请勾选要添加的工艺!');
        return;
      }
      let temp = {};
      let arr = [...this.tableData, ...list];
      arr.forEach(k => { temp[k.technologyId] = k });
      this.tableData = Object.values(temp);
      this.productInfo.dialogVisible = false;
    },
    // 表格多项选择
    selectChange(list) {
      this.productInfo.checkedList = list;
    },
    // 返回pageSize
    ChangePageSize(pageSize) {
      this.productInfo.proPage.pageSize = pageSize;
      this.getList();
    },
    // 返回page
    ChangePage(page) {
      this.productInfo.proPage.pageNum = page;
      this.getList();
    },
  }
};
</script>
<style lang="less" scoped>
.technologicalRequirePage {
  position: relative;
  padding: 10px;
  .h4sty {
    font-weight: bold;
    width: 80px;
  }

  .tech-picture {
    display: flex;
    margin-bottom: 30px;
    .tech-picture-main{
      position: relative;
      .no-drop-mask{
        display: none;
      }
      &.tech-picture-no-drop{
        .no-drop-mask{
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          cursor: no-drop;
        }
      }
    }
  }

  // .table-footer {
  //   display: flex;
  //   align-items: center;
  //   padding: 10px 0;
  //   border: 1px solid #dcdee2;
  //   border-top: none;
  //   background-color: #f8f8f9;

  //   .seat {
  //     width: 120px;
  //   }

  //   .flex1 {
  //     flex: 1;
  //     display: flex;
  //     justify-content: center;
  //   }
  // }
}
</style>
