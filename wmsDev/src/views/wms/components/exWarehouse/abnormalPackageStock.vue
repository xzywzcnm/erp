<template>
  <div class="abnormalPackageStock">
    <!--头部筛选区域-->
    <div class="searchMain">
      <Form ref="pageParams" :model="pageParams" :label-width="70">
        <dyt-filter ref="dyt-filter">
          <FormItem label="状态" prop="status">
            <dyt-select v-model="pageParams.status">
              <Option v-for="(item, i) in statusList" :value="item.status" :key="i + 'statusList'" :label="item.title">
              </Option>
            </dyt-select>
          </FormItem>
          <Form-item label="单号" prop="regressProductNumbers">
            <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="支持批量查询，多个单号用逗号或换行分隔"
              v-model.trim="pageParams.regressProductNumbers" />
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询</Button>
            <Button @click="reset" v-once icon="md-refresh">重置 </Button>
          </div>
        </dyt-filter>
      </Form>
    </div>

    <!--排序-->
    <div class="funMain">
      <div class="funMain__flex">
        <div>
          <Button type="primary" @click="MarkCompleted" style="margin-right: 15px;">标记归库完成 </Button>
          <Button type="primary" @click="PrintStock">打印归库单 </Button>
        </div>
        <div>
          <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch"
            :sorType="{ DESC: 'down', ASC: 'up' }">
          </dyt-sortBySelect>
        </div>
      </div>
    </div>

    <!--列表区域-->
    <div>
      <Table highlight-row border :loading="TableLoading" :height="tableHeight" :columns="stockColumn" :data="stock_data"
        @on-selection-change="getSelectValue"></Table>
    </div>

    <div class="pagesMain">
      <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
        :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
      </Page>
    </div>
  </div>
</template>

<style lang="less" scoped>
.sortList {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 15px;
  margin: 0 12px;
}
</style>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  mixins: [Mixin],
  props: {
    tabName: {
      type: String,
      default: 'recycled'
    }
  },
  data() {
    let v = this;
    return {
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        status: '',
        regressProductNumbers: '',
        warehouseId: this.getWarehouseId(),
        orderBy: 'regressProductNumber',
        upDown: 'down',
      },
      sortButtonList: [
        {
          sortHeader: "归库单号",
          sortField: "regressProductNumber",
          sortType: "down",
          default: true,
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      stock_data: [],
      stockColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '归库单号',
          key: 'regressProductNumber',
          align: 'center',
          render: (h, params) => {
            return h('span', {
              class: 'blueColor cursor underline',
              on: {
                click: () => {
                  v.$emit('talgDetails', true, params.row);
                }
              }
            }, params.row.regressProductNumber);
          }
        }, {
          title: '状态',
          key: 'InventoryStatus',
          align: 'center',
          render: (h, params) => {
            let status = params.row.status;
            let text = '';
            if (status === 0) {
              text = '等待归库';
            } else if (status === 1) {
              text = '归库完成';
            }
            return h('span', text);
          }
        }, // {
        //   title: '中文描述',
        //   key: 'goodsCnDesc',
        //   align: 'center'
        // },
        {
          title: '产品种类/数量',
          key: 'typeQuantity',
          align: 'center',
          render: (h, params) => {
            let quantity = params.row.quantity;
            let skuNumber = params.row.skuNumber;
            return h('div', [h('p', skuNumber + ' / ' + quantity)]);
          }
        }, {
          title: '库区',
          key: 'warehouseBlockName',
          align: 'center'
          // render: (h, params) => {
          //   let text = params.row.warehouseBlockNames.length > 0 ? params.row.warehouseBlockNames.join(',')
          //   : params.row.warehouseBlockName;
          //   return h('div', text)
          // }
        }, {
          title: '创建人/创建时间',
          key: 'buyerCountryCode',
          align: 'center',
          render: (h, params) => {
            let userInfoList = JSON.parse(localStorage.getItem('userInfoList'));
            let text = '';
            if (params.row.createdBy !== null) {
              text = userInfoList[params.row.createdBy].userName;
            }
            let time = v.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime');
            return h('div', [h('p', text), h('p', time)]);
          }
        }, {
          title: '归库人/归库时间',
          key: 'packageCode',
          align: 'center',
          render: (h, params) => {
            let userName = '';
            let userInfoList = JSON.parse(localStorage.getItem('userInfoList'));
            if (params.row.updatedBy !== null) {
              userName = userInfoList[params.row.updatedBy].userName;
            }
            let time = v.$uDate.getDataToLocalTime(params.row.updatedTime, 'fulltime');
            return h('div', params.row.status === 1 ? [h('p', userName), h('p', time)] : '');
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          width: 300,
          render: (h, params) => {
            let v = this;
            return h('div', {
              style: {
                display: 'flex'
                // justifyContent: 'space-around'
              }
            }, [
              h('Button', {
                style: {
                  marginRight: '10px'
                },
                props: {
                  size: 'small',
                  type: 'primary'
                },
                on: {
                  click: () => {
                    v.$emit('talgDetails', true, params.row);
                  }
                }
              }, '查看详情'), params.row.status !== 1 ? h('Button', {
                style: {
                  marginRight: '10px'
                },
                props: {
                  size: 'small',
                  type: 'primary'
                },
                on: {
                  click: () => {
                    v.markStockData('single', params.row.regressProductNumber);
                  }
                }
              }, '标记已归库') : '', h('Button', {
                props: {
                  size: 'small',
                  type: 'primary'
                },
                on: {
                  click: () => {
                    v.PrintStockData('single', params.row.regressProductNumber);
                  }
                }
              }, '打印归库单')
            ]);
          }
        }
      ],
      statusList: [
        // {
        //   selected: true,
        //   status: '*',
        //   title: '全部'
        // },
        {
          selected: false,
          status: 0,
          title: '等待归库'
        }, {
          selected: false,
          status: 1,
          title: '归库完成'
        }
      ],
      tableSelectRow: [],
      packageIds: []
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(310);
    }
  },
  created() {
    let v = this;
    v.pageParamsPrototype = v.deepCopy(v.pageParams);
    v.getList();
    localStorage.setItem('userInfoList', JSON.stringify(v.$store.state.userInfoList));
  },
  methods: {
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.upDown = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    // 重置按钮
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
      // v.selectStatus(0, null);
      // v.modifyTheSort(0, true);
    }, // 搜索按钮
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    }, // 获取列表的勾选项
    getSelectValue(value) {
      // table获取所选值
      let v = this;
      let pos = [];
      this.tableSelectRow = value;
      Promise.resolve(value.forEach((n, i) => {
        if (v.tabName === 'recycled') {
          pos.push(n.recycleProductId);
        } else if (v.tabName === 'stock') {
          pos.push(n.regressProductNumber);
        }
      })).then(() => {
        v.packageIds = pos;
      });
    }, // 获取归库单---列表的数据
    getList() {
      let v = this;
      v.stock_data = [];
      v.TableLoading = true;
      v.SearchDisabled = true;
      let item = {
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown,
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        status: this.pageParams.status,
        regressProductNumbers: v.pageParams.regressProductNumbers === ''
          ? null
          : this.sepCommasFn(v.pageParams.regressProductNumbers),
        warehouseId: v.getWarehouseId()
      };
      this.packageIds = [];
      v.axios.post(api.get_stockForm, JSON.stringify(item)).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.list != null && response.data.datas.list.length > 0) {
            v.$nextTick(function () {
              v.stock_data = response.data.datas.list;
              v.total = Number(response.data.datas.total);
              v.totalPage = Number(response.data.datas.pages);
              v.TableLoading = false;
              v.SearchDisabled = false;
            });
          } else {
            v.stock_data = [];
            v.TableLoading = false;
            v.SearchDisabled = false;
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        }
      });
    },
    // // 状态
    // selectStatus(index, item) {
    //   let v = this;
    //   v.pageParams.status = item == null ? null : item.status;
    //   v.statusList.forEach((n, i) => {
    //     if (i === index) {
    //       n.selected = true;
    //     } else {
    //       n.selected = false;
    //     }
    //   });
    // },
    // 标记归库的方法
    markStockData(type, data) {
      let query;
      if (type === 'all') {
        let inWareed = [];
        let notWare = [];
        if (this.$common.isEmpty(this.tableSelectRow)) {
          this.$Message.warning({
            content: '请选择操作数据',
            duration: 3
          });
          return false;
        }
        this.tableSelectRow.forEach(f => {
          if (f.status == 1) {
            inWareed.push(f.regressProductNumber);
          } else {
            notWare.push(f.regressProductNumber);
          }
        })
        if (!this.$common.isEmpty(inWareed)) {
          this.$Message.warning(`归库单号为：${inWareed.join('、')} 的数据已经归库，此次操作不会对以上数据进行操作`);
        }
        if (this.$common.isEmpty(notWare)) {
          this.$Message.warning({
            content: '您选择的数据中都为已归库的数据，请刷新列表后重新选择未归库的数据',
            duration: 3
          });
          return false;
        }
        query = notWare;
      } else if (type === 'single') {
        query = [data];
      }
      this.axios.post(api.get_markStock, JSON.stringify(query)).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
        }
      }).finally(() => {
        this.getList();
      });
    }, // 标记归库完成
    MarkCompleted() {
      this.markStockData('all');
    }, // 批量打印归库单
    PrintStock() {
      let v = this;
      if (this.packageIds.length > 0) {
        this.PrintStockData('all', this.packageIds);
      } else {
        v.$Message.warning({
          content: '请选择操作数据',
          duration: 3
        });
      }
    }, // 打印归库单的方法
    PrintStockData(type, data) {
      let query;
      if (type === 'all') {
        query = data.join(',');
      } else if (type === 'single') {
        query = data;
      }
      let goto = this.$router.resolve({
        path: '/stockForm',
        query: {
          warehouseId: this.getWarehouseId(),
          regressProductNumber: query,
          type: type
        }
      });
      window.open(goto.href, '_blank');
    }
  },
  watch: {
    tabName() {
      this.reset();
    },
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
};

</script>
