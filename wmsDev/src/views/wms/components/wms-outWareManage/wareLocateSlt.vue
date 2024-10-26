<template >
  <div >
    <div class="modalItemContent" >
      <Row >
        <Col span="24" >
          <Row >
            <Form :model="pageParams" :label-width="80" label-position="left" >
              <Col span="6" >
                <Form-item label="所属库区：" >
                  <Select v-model="pageParams.warehouseBlockId" @on-change="blockIdChange" >
                  <Option value="*" >全部</Option > <Option
                      v-for="item in wareBlockList"
                      :value="item.warehouseBlockId"
                      :key="item.warehouseBlockId" >{{ item.warehouseBlockName }} </Option > </Select >
                </Form-item >
              </Col >
              <Col span="6" offset="1" >
                <Form-item label="库位：" >
                  <!--<Input v-model.trim="pageParams.wareLocate"></Input>-->
                  <Select
                      v-model="pageParams.wareLocate"
                      filterable
                      remote
                      transfer
                      placement="top"
                      :remote-method="getWarehouseLocation"
                      :loading="loading2"
                      @click.native="getWarehouseLocation('')"
                      placeholder="输入搜索词进行远程查询" > <Option
                      v-for="item in $store.state.positionList"
                      :value="item.warehouseLocationId"
                      :key="item.warehouseLocationId"
                      :label="item.warehouseLocationName" ></Option > </Select >
                </Form-item >
              </Col >
              <!--<Col span="6" offset="5" style='padding-top: 10px'>-->
              <!--<Checkbox v-model="pageParams.availableFlag" @on-change='searchData'><span>显示库存为0的产品</span></Checkbox>-->
              <!--</Col>-->
            </Form >
          </Row >
        </Col >
        <Col span="24" style="margin-bottom: 15px;" >
          <Row >
            <Form :model="pageParams" :label-width="80" label-position="left" >
              <Col span="6" >
                <Form-item label="库位使用：" >
                  <Select v-model="pageParams.yOrNPickLocation" @on-change="yOrNPickLocationChange" >
                  <Option value="*" >全部</Option > <Option value="0" >作为收货库位</Option >
                  <Option value="1" >作为拣货库位</Option > </Select >
                </Form-item >
              </Col >
              <Col span="6" offset="1" >
                <Button
                    type="primary"
                    @click="searchData('noPageSearch')"
                    :disabled="SearchDisabled"
                    icon="ios-search" >查询</Button >
              </Col >
            </Form >
          </Row >
        </Col >
      </Row >
      <!-- 表格	 -->
      <Row >
        <Col span="24" >
          <Table highlight-row border :columns="columns6" :loading="TableLoading" :data="data6" ></Table >
          <!--分页按钮-->
          <div class="table-page" >
            <div class="table-page-right" >
              <Page
                  :total="totalRecords"
                  :current="pageParams.pageNum"
                  @on-change="changePage"
                  show-total
                  :page-size="pageParams.pageSize"
                  show-elevator
                  show-sizer
                  @on-page-size-change="changePageSize"
                  placement="top"
                  :page-size-opts="pageArray" ></Page >
            </div >
          </div >
        </Col >
      </Row >
    </div >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      loading2: false,
      pageParams: {
        // 参数
        wareLocate: '', // 库位
        warehouseBlockId: '*', // 所属库区
        yOrNPickLocation: '*', // 库位使用
        pageNum: 1,
        pageSize: 10,
        availableFlag: ''
      },
      totalRecords: 0, // 总条数
      // 所属库区
      wareBlockList: [], // 库位
      wareLocateList: [], // 库位使用
      columns6: [
        {
          title: '产品SKU',
          key: 'goodsSku',
          width: 75,
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          width: 100
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          width: 100
        }, {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center',
          width: 100
        }, {
          title: '库区',
          key: 'warehouseBlockName',
          align: 'center',
          width: 70
        }, {
          title: '库位',
          key: 'warehouseLocationName',
          align: 'center',
          width: 70
        }, {
          title: '库位使用',
          key: 'pickingFlag',
          align: 'center',
          width: 70,
          render: (h, params) => {
            if (params.row.pickingFlag === '0') {
              return h('span', '收货库位');
            } else if (params.row.pickingFlag === '1') {
              return h('span', '拣货库位');
            }
          }
        }, {
          title: '库存数量',
          key: 'availableNumber',
          align: 'center',
          width: 100
        }, {
          title: '分配数量',
          key: 'allottedNumber',
          align: 'center',
          width: 80
        }, {
          title: '冻结数量',
          key: 'frozenNumber',
          align: 'center',
          width: 80
        }, {
          title: '可用数量',
          key: 'availableNumber',
          align: 'center',
          width: 80
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small',
                    disabled: params.row.availableNumber === 0 || params.row.checkStatus === '1'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.checkLocation(params.row);
                    }
                  }
                }, params.row.checkStatus === '1' ? '盘点中' : '选择')
              ]);
            }
          }
        }
      ],
      data6: []
    };
  },
  props: {
    open: {
      default: null
    },
    wareId: {
      default: null
    },
    clickIndex: {
      default: null
    },
    curTableSku: {
      default: null
    },
    type: {
      default: null // 判断调用地方的来源 不同地方查询不同的列表
    },
    sku: {},
    productId: {
      default: null
    }
  },
  computed: {},
  watch: {
    open: function (val) {
      if (val) {
        this.getWareLocateListData();
      }
    }
  },
  created () {
    var v = this;
    v.getWareLocateListData(v.pageParams); // 渲染表格内容
  },
  methods: {
    getWarehouseLocation (query) {
      let v = this;
      return new Promise(resolve => {
        if (query !== '') {
          v.pageParams.wareLocate = '';
        }
        this.getPositionListNew({ query: query }).then((data) => {
          if (query !== '') {
            if (data.length === 0) {
              v.$Message.info('无相关匹配库位');
              return;
            }
            data.forEach(i => {
              if (i.warehouseLocationName === query) {
                v.pageParams.wareLocate = i.warehouseLocationId;
              }
            });
          }
          resolve();
        });
      });
    },
    searchData: function (flag) {
      // 查询搜索功能
      var v = this;
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        warehouseId: this.wareId, // 选择哪条仓库的id
        productGoodsId: this.productId
      };
      if (v.pageParams.wareLocate) {
        paramsObj.warehouseLocationId = v.pageParams.wareLocate === '*' ? null : v.pageParams.wareLocate;
      } // 输入搜索库位
      if (v.pageParams.warehouseBlockId !== '*') {
        paramsObj.warehouseBlockId = v.pageParams.warehouseBlockId === '*' ? null : v.pageParams.warehouseBlockId;
      } // 所属库区
      if (v.pageParams.yOrNPickLocation !== '*') {
        paramsObj.pickingFlag = v.pageParams.yOrNPickLocation === '*' ? null : v.pageParams.yOrNPickLocation;
      } // 库位使用
      if (flag === 'noPageSearch') {
        paramsObj.pageNum = 1; // 点击查询按钮将页码重置为1
        this.pageParams.pageNum = 1;
      }
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(api.get_locationInv, paramsObj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          if (res.data.datas) {
            this.data6 = res.data.datas.list;
          } else {
            this.data6 = [];
          }
          if (res.data) {
            let obj = {
              total: res.data.datas.total,
              limitMaxTotal: res.data.datas.limitMaxTotal
            };
            this.setPageInfo(obj);
          }
        }
      }).catch(() => {
        // console.log('查询数据失败');
      });
    },
    getWareLocateListData (obj) {
      // 获取后台表格内容
      var v = this;
      let paramsobj = {
        warehouseId: this.wareId, // 选择哪条仓库的id
        productGoodsId: this.productId
      };
      v.TableLoading = true;
      v.SearchDisabled = true;
      v.axios.post(this.type === 'fromGoodProcess' ? api.stockLocation : api.get_locationInv, paramsobj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          this.data6 = res.data.datas.list;
          this.totalRecords = res.data.datas.total;
          if (res.data) {
            let obj2 = {
              total: res.data.datas.total,
              limitMaxTotal: res.data.datas.limitMaxTotal
            };
            this.setPageInfo(obj2);
          }
        }
      }).catch(() => {
        // console.log('获取表格数据失败');
      });
      this.getWareBlockName(); // 调用仓库下拉列表
    },
    getWareBlockName: function () {
      // 获取所属库区下拉列表
      var v = this;
      v.axios.get(this.type === 'fromGoodProcess'
                  ? api.blockList + '?warehouseId=' + this.wareId
                  : api.get_wareList + '?warehouseId=' + this.wareId).then(res => {
        var data = null; // 先声明初始下拉列表项为空
        if (res.data.code === 0) {
          data = res.data.datas;
        }
        v.wareBlockList = data || [];
      });
      v.locationSearch(null);
    },
    locationSearch (params) {
      let str = '';
      str = params
            ? api.get_wareLocationList + '?warehouseBlockId=' + params + '&warehouseId=' + this.wareId
            : api.get_wareLocationList + '?warehouseId=' + this.wareId;
      this.axios.get(str).then(res => {
        if (res.data.code === 0) {
          this.wareLocateList = res.data.datas;
        }
      });
    },
    changePage (page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize (size) {
      this.pageParams.pageSize = +size;
      this.searchData();
    },
    checkLocation (data) {
      // 选择库位
      this.$Message.success('选择库位成功！');
      this.$parent.$parent.showLocationModal = false;
      this.$emit('sendData', data);
    },
    blockIdChange (val) {
      this.pageParams.warehouseBlockId = val;
      this.locationSearch(val);
    },
    wareLocateChange (val) {
      this.pageParams.wareLocate = val;
    },
    yOrNPickLocationChange (val) {
      this.pageParams.yOrNPickLocation = val;
    }
  },
  mounted () {}
};
</script>
