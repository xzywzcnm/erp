<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content platformParamsSelect">
          <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
            <dyt-filter>
              <Form-item label="任务号：" prop="supplementPickingNo">
                <dyt-input placeholder="输入任务号" clearable v-model.trim="pageParams.supplementPickingNo"> </dyt-input>
              </Form-item>
              <Form-item label="拣货库区组：" prop="warehouseBlockGroupId">
                <dyt-select v-model="pageParams.warehouseBlockGroupId">
                  <Option v-for="item in wareAreaGroupList" :value="item.warehouseBlockGroupId"
                    :key="item.warehouseBlockGroupId" :label="item.name"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="拣货库区：" prop="warehouseBlockId">
                <!-- 联动 @on-open-change="wareBlockChange" -->
                <dyt-select v-model="pageParams.warehouseBlockId">
                  <Option v-for="item in warehouseBlockList" :value="item.warehouseBlockId"
                    :label="item.warehouseBlockName" :key="item.warehouseBlockId"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="拣货库位：" prop="warehouseLocationId">
                <dyt-select v-model="pageParams.warehouseLocationId" remote :remote-method="getWarehouseLocation"
                  @click.native="getWarehouseLocation('')" placeholder="输入搜索词进行远程查询">
                  <Option v-for="item in warehouseLocationList" :value="item.warehouseLocationId"
                    :label="item.warehouseLocationName" :key="item.warehouseLocationId">
                  </Option>
                </dyt-select>
              </Form-item>
              <Form-item label="异常处理库区：" prop="exceptionHandBlockId">
                <dyt-select v-model="pageParams.exceptionHandBlockId" @on-change="exceptChange">
                  <Option v-for="item in abnormalReservoirArea" :value="item.warehouseBlockId"
                    :label="item.warehouseBlockName" :key="item.warehouseBlockId"></Option>
                </dyt-select>
              </Form-item>
              <Form-item label="异常处理库位：" prop="exceptionHandLocationId">
                <dyt-select v-model="pageParams.exceptionHandLocationId">
                  <Option v-for="item in abnormalReservoirLocation" :value="item.warehouseLocationId"
                    :label="item.warehouseLocationName" :key="item.warehouseLocationId">
                  </Option>
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>

    <div class="actionBar" style="display: flex;">
      <div style="flex: 100;">
        <Dropdown class="ml10">
          <Button type="primary" v-if="getPermission('supplementPicking_printSupplementPickingDetail')"
            @click="printPickUpBtn">
            打印补拣单
          </Button>
        </Dropdown>
      </div>
      <div class="dataSort grayBg" style="padding: 0; margin:0; border: none;">
        <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
        </dyt-sortBySelect>
      </div>
    </div>
    <Table border ref="selection" :height="tableHeight" :columns="columns" :loading="TableLoading" :data="tableData"
      @on-selection-change="tableChange"></Table>
    <!--分页-->
    <div class="fr pages">
      <Page :total="total" :current="pageParams.pageNum" :page-size="pageParams.pageSize" show-total show-sizer
        show-elevator style="margin-top: 10px" @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
        :page-size-opts="pageArray"></Page>
    </div>
    <!--录入补拣结果弹窗-->
    <Modal :styles="{ top: '80px', width: '1000px' }" v-model="confirmModal" :mask-closable="false" class="pick_up_modal">
      <h2 class="title">录入补拣结果</h2>
      <div v-for="(item, index) in modalData" :key="index">
        <h3 class="packageCode_text">{{ '出库单：' + item.packageCode }}
          <span style="color: red;">{{
            item.isRehandle !== 0
            ? '(已作废)'
            : ''
          }}</span>
        </h3>
        <Table border ref="selection" :columns="modalColumns" :loading="TableLoading" :data="item.data"></Table>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" @click="submitPickUpBtn" v-if="getPermission('supplementPicking_submitSupplementResult')">
          提交补拣结果
        </Button>
        <Button @click="confirmModal = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script type="text/ecmascript-6">
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  mixins: [Mixin],
  data() {
    let v = this;
    return {
      newData: {},
      sortButtonList: [
        {
          sortHeader: "按创建时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按处理状态",
          sortField: "HS",
          sortType: "DESC",
        },
      ],
      total: 0,
      isRehandle: false,
      confirmModal: false,
      warehouseBlockList: [], // 库区下拉列表
      warehouseLocationList: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        supplementPickingNo: '',
        warehouseBlockGroupId: '',
        warehouseBlockId: '',
        warehouseLocationId: '',
        exceptionHandBlockId: '',
        exceptionHandLocationId: '',
        orderBy: 'CT',
        orderSeq: 'DESC',
        pageNum: 1,
        pageSize: 10,
        warehouseId: v.getWarehouseId()
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: 'NO',
          width: 70,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '任务号',
          key: 'supplementPickingNo',
          align: 'center'
        }, {
          title: '处理状态', // (0待补拣，1正在补，2补完成)
          key: 'supplementPickingStatus',
          align: 'center',
          render: (h, params) => {
            let text = '';
            let color = '#515a6e';
            let status = params.row.supplementPickingStatus;
            const hand = {
              0: () => {
                text = '待补拣';
                color = '#2D8CF0';
              },
              1: () => {
                text = '正在补拣';
              },
              2: () => {
                text = '补拣完成';
                color = '#1ecc29';
              },
              3: () => {
                text = '已处理';
                color = '#ee39e6';
              },
              4: () => {
                text = 'pda已补拣完成';
                color = '#d30438';
              }
            };
            hand[status]();
            return h('span', {
              style: {
                color: color
              }
            }, text);
          }
        }, {
          title: '出库单数量',
          key: 'pickingNumber',
          align: 'center'
        }, {
          title: 'SKU数量',
          key: 'goodsSkuNumber',
          align: 'center'
        }, {
          title: '货品数量',
          key: 'goodsQuantityNumber',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('span', v.$uDate.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '补拣人',
          key: 'supplementPickingUserId',
          align: 'center',
          render: (h, params) => {
            let userName = '';
            let list = v.$store.state.userInfoList;
            localStorage.setItem('userInfoList', JSON.stringify(list));
            if (list && params.row.supplementPickingUserId) {
              userName = list[params.row.supplementPickingUserId].userName;
              return h('span', userName);
            }
          }
        }, {
          title: '操作',
          key: 'h',
          align: 'center',
          width: 160,
          render: (h, params) => {
            return v.getPermission('supplementPicking_detailSupplementResult') && params.row.supplementPickingStatus === 4
              ? h('Button', {
                props: {
                  size: 'small',
                  type: 'primary'
                },
                on: {
                  click: () => {
                    v.pickUpBtn(params.row.supplementPickingId);
                  }
                }
              }, '录入补拣结果')
              : '';
          }
        }
      ],
      tableData: [],
      wareAreaGroupList: [
        {
          name: '全部',
          warehouseBlockGroupId: 'null'
        }
      ],
      abnormalReservoirArea: [],
      abnormalReservoirLocation: [],
      modalData: [],
      modalColumns: [
        {
          title: '产品图片',
          align: 'center',
          key: 'goodsUrl',
          render: (h, params) => {
            return v.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'sku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '未拣货数量', // 未拣货数量 = 已分配数量-实际拣货数量
          key: 'quantityNotPicked',
          align: 'center',
          render: (h, params) => {
            let quantityNotPicked = params.row.doneAssignedNumber - params.row.actualPickingNumber;
            return h('span', quantityNotPicked);
          }
        }, {
          title: '补拣数量',
          key: 'supplementPickingNum',
          align: 'center',
          render: (h, params) => {
            let quantityNotPicked = params.row.doneAssignedNumber - params.row.actualPickingNumber;
            v.newData[params.row.packageId + params.row.productGoodsId] = {
              supplementPickingNum: params.row.supplementPickingNum,
              packageGoodsId: params.row.packageGoodsId,
              packageId: params.row.packageId
            };
            return h('InputNumber', {
              props: {
                min: 0,
                max: quantityNotPicked,
                value: params.row.supplementPickingNum
              },
              style: {
                width: '90px'
              },
              on: {
                'on-change'(val) {
                  params.row.supplementPickingNum = val;
                  v.newData[params.row.packageId + params.row.productGoodsId].supplementPickingNum = val;
                }
              }
            });
          }
        }
      ],
      supplementPickingId: null,
      supplementPickingIdList: []
    };
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(330);
    }
  },
  created() {
    this.getWarehouseAbBlock();
    this.getWareAreaGroup();
    this.getWarehouseBlock();
    this.getList();
  },
  methods: {
    // 勾选列表数据
    tableChange(data) {
      this.supplementPickingIdList = [];
      if (data.length > 0) {
        data.map((item) => {
          this.supplementPickingIdList.push(item.supplementPickingId);
        });
      }
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.pageParams.orderSeq = type;
      this.pageParams.orderBy = feild;
      this.search();
    },
    // 获取库区下拉
    getWarehouseBlock() {
      let v = this;
      v.axios.get(api.get_warehouseBlock + '?warehouseId=' + v.pageParams.warehouseId + '&warehouseBlockGroupId=' + v.pageParams.warehouseBlockGroupId).then(response => {
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
      v.axios.get(api.get_warehouseLocation + '?warehouseId=' + v.pageParams.warehouseId + '&warehouseBlockGroupId=' + v.pageParams.warehouseBlockGroupId + '&warehouseBlockId=' + v.pageParams.warehouseBlockId + '&warehouseLocationName=' + query).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.warehouseLocationList = data;
          }
        }
      });
    }, // 获取库区组下拉
    getWareAreaGroup() {
      let v = this;
      let pos = [];
      v.axios.get(api.get_wareAreaGroupList + '?warehouseId=' + v.getWarehouseId()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.wareAreaGroupData = data;
            data.forEach((n, i) => {
              pos.push(n);
            });
            pos.unshift({
              name: '全部',
              warehouseBlockGroupId: 'null'
            });
            v.wareAreaGroupList = pos;
          } else {
            v.wareAreaGroupData = [
              {
                name: '全部',
                warehouseBlockGroupId: 'null'
              }
            ];
          }
        }
      });
    }, // 获取异常库区
    getWarehouseAbBlock() {
      let v = this;
      v.axios.get(api.get_warehouseBlock + '?warehouseId=' + v.pageParams.warehouseId + '&warehouseBlockTypes=30').then(response => {
        if (response.data.code === 0) {
          v.abnormalReservoirArea = response.data.datas;
        }
      });
    },
    exceptChange(data) {
      this.getWarehouseLocal(data).then((reseponse) => {
        this.abnormalReservoirLocation = reseponse;
      });
    }, // 获取异常库位
    getWarehouseLocal(data) {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.queryByBlocksAndFlag + '?warehouseId=' + v.pageParams.warehouseId + '&warehouseBlockIdList=' + data + '&pickingFlag=2').then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    }, // 重置按钮
    reset() {
      let v = this;
      v.$refs['pageParams'].resetFields();
    }, // 查询按钮
    search() {
      let v = this;
      v.pageParamsStatus = true;
      v.pageParams.pageNum = 1;
    }, // 获取补拣任务列表的数据
    getList() {
      let v = this;
      if (v.getPermission('supplementPicking_list')) {
        v.TableLoading = true;
        let obj = JSON.stringify(v.pageParams);
        v.axios.post(api.post_supplementPicking, obj).then(res => {
          v.TableLoading = false;
          if (res.data.code === 0) {
            this.tableData = res.data.datas.list;
            this.total = res.data.datas.total;
          } else {
            this.$Message.warning({
              content: '操作失败',
              duration: 4
            });
          }
        });
      } else {
        v.gotoError();
      }
    }, // 录入补拣结果
    pickUpBtn(data) {
      let v = this;
      if (data) {
        v.TableLoading = true;
        v.supplementPickingId = data;
        v.axios.get(api.get_detailSupplementResult + data).then(res => {
          v.TableLoading = false;
          v.confirmModal = true;
          if (res.data.code === 0) {
            let data = res.data.datas;
            let new_arr = v.handerGrouping(data, function (item) {
              return [item.packageCode]; // 可添加多个属性
            }, ['packageCode', 'isRehandle']);
            v.modalData = new_arr;
          } else {
            this.$Message.warning({
              content: '操作失败',
              duration: 4
            });
          }
        });
      }
    }, // 提交补拣结果
    submitPickUpBtn() {
      let v = this;
      let obj = {
        supplementPickingId: v.supplementPickingId,
        detailSupplementResultBo: []
      };
      for (let key in v.newData) {
        obj.detailSupplementResultBo.push(v.newData[key]);
      }
      let arr = [];
      v.modalData.map((item) => {
        if (item.isRehandle !== 0) {
          arr.push(item);
        }
      });
      let talg = false;
      if (arr.length > 0) {
        v.$Modal.confirm({
          title: '当前补拣任务有出库单已作废，请注意回收货品',
          onOk: () => {
            talg = true;
          },
          onCancel: () => { }
        });
      } else {
        talg = true;
      }
      if (talg) {
        v.axios.post(api.post_submitSupplementResult, obj).then(res => {
          if (res.data.code === 0) {
            v.confirmModal = false;
            v.pageParamsStatus = true;
          }
        });
      }
    }, // 打印补拣单
    printPickUpBtn() {
      if (this.supplementPickingIdList.length > 0) {
        let goto = this.$router.resolve({
          path: '/printPickUpList',
          query: {
            warehouseId: this.getWarehouseId(),
            data: this.supplementPickingIdList.join(',')
          }
        });
        window.open(goto.href, '_blank');
      } else {
        this.$Message.warning({
          content: '请选择操作数据',
          duration: 3
        });
      }
    },
    pageNumChange(page) {
      this.pageParams.pageNum = page;
      this.getList();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.pageParams.pageSize = size;
      this.getList();
    }
  },
  watch: {
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

<style lang="less" scoped >
.pick_up_modal {
  .title {
    color: #333;
    font-size: 18px;
  }

  .packageCode_text {
    color: #2D8CF0;
    font-weight: bold;
    font-size: 16px;
    margin: 10px 0 15px 0;
  }
}
</style >
