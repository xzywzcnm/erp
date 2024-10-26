<template>
  <div class="abnormalPackageRecycled">
    <!--头部筛选区域-->
    <div class="searchMain">
      <Form ref="pageParams" :model="pageParams" :label-width="80">
        <dyt-filter ref="dyt-filter">
          <Form-item label="SKU" prop="skus">
            <dyt-input-tag :limit="1" :string="true" type="textarea" placeholder="支持批量查询，多个SKU用逗号或换行分隔"
              v-model.trim="pageParams.skus" />
          </Form-item>
          <Form-item label="中文描述" prop="goodsCnDesc">
            <Input placeholder="输入中文描述查询" v-model.trim="pageParams.goodsCnDesc"></Input>
          </Form-item>
          <Form-item label="英文描述" prop="goodsEnDesc">
            <Input placeholder="输入英文描述查询" v-model.trim="pageParams.goodsEnDesc"></Input>
          </Form-item>
          <Form-item label="库区" prop="warehouseBlockIds">
            <dyt-select v-model="pageParams.warehouseBlockIds" multiple placeholder="多个库区，用逗号或换行分隔" :max-tag-count="1">
              <Option v-for="item in warehouseBlockList" :value="item.warehouseBlockId" :key="item.warehouseBlockId"
                :label="item.warehouseBlockName"></Option>
            </dyt-select>
          </Form-item>
          <Form-item label="库位" prop="warehouseLocationIds">
            <dyt-select v-model="pageParams.warehouseLocationIds" multiple remote :remote-method="getWarehouseLocation"
              @click.native="getWarehouseLocation('')" placeholder="多个库位，用逗号或换行分隔" :max-tag-count="1">
              <Option v-for="item in warehouseLocationList" :value="item.warehouseLocationId"
                :key="item.warehouseLocationId" :label="item.warehouseLocationName"></Option>
            </dyt-select>
          </Form-item>

          <div slot="operation">
            <Button type="primary" @click="search" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询
            </Button>
            <Button @click="reset" v-once icon="md-refresh">重置 </Button>
          </div>
        </dyt-filter>
      </Form>
    </div>

    <!--排序-->
    <div class="funMain">
      <div class="funMain__flex">
        <div>
          <Buttons type="primary" trigger="click" @on-click="generateAllBtn">
            <Button type="primary" class="iconbuttons" @click="generateBtn">
              <Icon type="document-text"></Icon>
              生成归库单
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item name="1">生成归库单（所有结果集）
              </Buttons-item>
            </Buttons-menu>
          </Buttons>
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
      <Table highlight-row border :loading="TableLoading" max-height="500" :columns="recycledColumn" :data="cancelData"
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
      warehouseBlockList: [],
      warehouseLocationList: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        skus: '',
        goodsCnDesc: '',
        goodsEnDesc: '',
        warehouseBlockIds: [],
        warehouseLocationIds: [],
        warehouseId: v.getWarehouseId(),
        orderBy: 'sku',
        upDown: 'up',
      },
      sortButtonList: [
        {
          sortHeader: "按SKU",
          sortField: "sku",
          sortType: "up",
          default: true,
        },
        {
          sortHeader: "按库区",
          sortField: "wwb",
          sortType: "up",
        },
        {
          sortHeader: "按库位",
          sortField: "wwl",
          sortType: "up",
        },
      ],
      totalPage: 0,
      total: 0,
      curPage: 1,
      cancelData: [],
      recycledColumn: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '产品图片',
          key: 'goodsUrl',
          align: 'center',
          render: (h, params) => {
            return v.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          minWidth: 200,
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '库区',
          key: 'warehouseBlockName',
          align: 'center'
          // render: (h, params) => {
          //   let data = v.$store.state.warehouseList;
          //   let text = '';
          //   if (data.length >0) {
          //     data.map((item) => {
          //       if(item.warehouseId === params.row.warehouseId) {
          //         text = item.warehouseName;
          //       }
          //     })
          //   }
          //   return h('div', text);
          // }
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center'
        }, {
          title: '数量',
          key: 'quantity',
          align: 'center'
        }, {
          title: '操作',
          key: 'operate',
          fixed: 'right',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('Button', {
              props: {
                size: 'small',
                type: 'primary'
              },
              on: {
                click: () => {
                  this.optionGeneraten(params);
                }
              }
            }, '生成归库单');
          }
        }
      ],
      statusList: [
        {
          selected: true,
          status: null,
          title: '全部'
        }, {
          selected: false,
          status: 0,
          title: '等待归库'
        }, {
          selected: false,
          status: 1,
          title: '归库完成'
        }
      ],
      original_data: [],
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
    v.getWarehouseBlock();
    v.getWarehouseLocation();
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
      // v.modifyTheSort(0, true);
      // this.pageParams.upDown = 'up';
      // this.pageParams.orderBy = 'sku';
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
      Promise.resolve(value.forEach((n, i) => {
        if (v.tabName === 'recycled') {
          pos.push(n.recycleProductId);
        } else if (v.tabName === 'stock') {
          pos.push(n.regressProductNumber);
        }
      })).then(() => {
        v.packageIds = pos;
      });
    }, // 生成归库单的方法
    generateData(type) {
      let v = this;
      let data = {};
      if (type === 'single') {
        if (this.packageIds.length <= 0) {
          v.$Message.warning({
            content: '请选择操作数据',
            duration: 3
          });
          return false;
        }
        data = {
          recycleProductIds: v.packageIds,
          warehouseId: v.getWarehouseId()
        };
      }
      if (type === 'all') {
        data = {
          recycleProductIds: null,
          warehouseId: v.getWarehouseId()
        };
        let item = {
          orderBy: this.pageParams.orderBy,
          upDown: this.pageParams.upDown,
          pageNum: this.pageParams.pageNum,
          pageSize: this.pageParams.pageSize,
          skus: v.pageParams.skus === '' ? [] : this.sepCommasFn(v.pageParams.skus),
          goodsCnDesc: v.pageParams.goodsCnDesc,
          goodsEnDesc: v.pageParams.goodsEnDesc,
          warehouseBlockIds: v.pageParams.warehouseBlockIds,
          warehouseLocationIds: v.pageParams.warehouseLocationIds,
          warehouseId: v.getWarehouseId()
        };
        data = Object.assign({}, data, item);
      }
      v.axios.post(api.get_generateAll, JSON.stringify(data)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('操作失败，请重新尝试');
        }
      });
    }, // 生成归库单
    generateBtn() {
      this.generateData('single');
    }, // 生成所有归库单
    generateAllBtn() {
      this.generateData('all');
    }, // 列表操作按钮---生成归库单
    optionGeneraten(data) {
      let v = this;
      v.axios.get(api.get_generate + data.row.recycleProductId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          v.$Message.success('操作失败，请重新尝试');
        }
      });
    }, // 获取已回收产品--列表数据
    getList() {
      let v = this;
      v.cancelData = [];
      v.TableLoading = true;
      v.SearchDisabled = true;
      let item = {
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown,
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        skus: v.pageParams.skus === '' ? [] : this.sepCommasFn(v.pageParams.skus),
        goodsCnDesc: v.pageParams.goodsCnDesc === '' ? '' : v.pageParams.goodsCnDesc,
        goodsEnDesc: v.pageParams.goodsEnDesc === '' ? '' : v.pageParams.goodsEnDesc,
        warehouseBlockIds: v.pageParams.warehouseBlockIds === '' ? [] : v.pageParams.warehouseBlockIds,
        warehouseLocationIds: v.pageParams.warehouseLocationIds === '' ? [] : v.pageParams.warehouseLocationIds,
        warehouseId: v.getWarehouseId()
      };
      v.axios.post(api.get_recycledProducts, JSON.stringify(item)).then(response => {
        if (response.data.code === 0) {
          if (response.data.datas.list != null && response.data.datas.list.length > 0) {
            v.$nextTick(function () {
              v.cancelData = response.data.datas.list;
              v.total = Number(response.data.datas.total);
              v.totalPage = Number(response.data.datas.pages);
              v.TableLoading = false;
              v.SearchDisabled = false;
            });
          } else {
            v.cancelData = [];
            v.TableLoading = false;
            v.SearchDisabled = false;
            v.$nextTick(function () {
              v.total = 0;
              v.totalPage = 0;
            });
          }
        }
      });
    }, // 获取库区的下拉数据
    getWarehouseBlock() {
      // 获取库区下拉
      let v = this;
      v.axios.get(api.get_warehouseBlock + '?warehouseId=' + v.pageParams.warehouseId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseBlockList = data;
          }
        }
      });
    }, // 获取库位下拉数据
    getWarehouseLocation(query) {
      let v = this;
      v.axios.get(api.get_linkage_warehouseLocation + '?warehouseId=' + v.pageParams.warehouseId + '&warehouseBlockIdList=' + v.pageParams.warehouseBlockIds + '&warehouseLocationName=' + query).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseLocationList = data;
          }
        }
      });
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
