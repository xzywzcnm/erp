<template >
  <div class="pick" style="padding-left: 10px" >
    <div v-if="workShow === 'list'" >
      <Form :label-width="90" class="pickList" >
        <FormItem label="仓库：" >
          <!--<ButtonGroup>-->
          <!--<Button :type="v.check?'primary':'ghost'" v-for='(v,i) in wareList' :key='i'-->
          <!--@click='wareChange(v.value)'>{{v.txt}}-->
          <!--</Button>-->
          <Select v-model="formItem.ware" style="width:220px" @on-change="wareChange" > <Option value="*" >全部</Option >
          <Option
              v-for="item in wareList"
              :value="item.warehouseId"
              :key="item.warehouseId" > {{ item.warehouseName }} </Option > </Select >
          <!--</ButtonGroup>-->
        </FormItem >
        <FormItem label="拣货单编号：" >
          <Input v-model.trim="formItem.pickingGoodsNo" style="width:220px" ></Input >
        </FormItem >
        <FormItem label="拣货单状态：" >
          <ButtonGroup >
            <Button
                :type="v.check ? 'primary' : 'default'"
                v-for="(v, i) in pickListStatusList"
                :key="i"
                @click="statusChange(v.value)" >{{ v.txt }} </Button >
          </ButtonGroup >
        </FormItem >
        <FormItem label="拣货单类型：" >
          <ButtonGroup >
            <Button
                :type="v.check ? 'primary' : 'default'"
                v-for="(v, i) in pickListTypeList"
                :key="i"
                @click="typeChange(v.value)" >{{ v.txt }} </Button >
          </ButtonGroup >
          <Button type="primary" class="search" @click="search" >查询</Button >
        </FormItem >
      </Form >
      <!--排序-->
      <div class="dataSort grayBg" >
        <span >排序方式：</span >
        <Button-group >
          <Button
              :type="item.checked ? 'primary' : 'default'"
              v-for="item in sortData"
              @click="clickSortButton(item)"
              :key="item.value" >{{ item.label }}
            <Icon type="md-arrow-up" v-if="item.checked && !item.toogle" ></Icon >
            <Icon type="md-arrow-down" v-if="item.checked && item.toogle" ></Icon >
          </Button >
        </Button-group >
      </div >
      <!--工具-->
      <div class="clear" style="margin: 10px 0" >
        <div class="fr" style="padding-right: 20px" >
          <Dropdown @on-click="batchOption" >
            <Button icon="ios-copy-outline" >批量操作</Button >
            <DropdownMenu slot="list" >
              <DropdownItem name="0" >打印拣货单</DropdownItem >
              <DropdownItem name="1" >标记为已拣货</DropdownItem >
            </DropdownMenu >
          </Dropdown >
        </div >
      </div >
      <!--表格-->
      <Table
          border
          ref="selection"
          :columns="columns"
          :loading="TableLoading"
          :data="data"
          @on-selection-change="tableChange" ></Table >
      <!--分页-->
      <div class="fr pages" >
        <Page
            :total="tableItemTotal"
            :current="formItem.pageNum"
            show-total
            show-sizer
            show-elevator
            @on-change="pageNumChange"
            @on-page-size-change="pageSizeChange"
            :page-size-opts="pageArray" ></Page >
      </div >
    </div >
    <div v-if="workShow === 'detail'" >
      <pickListDtl :pickingGoodsNo="pickingGoodsNo" :pickingStatus="pickingStatus" ></pickListDtl >
    </div >
    <!--test-->
  </div >
</template>

<script>
import dropDown from './dropDownOpt';
import pickListDtl from './pickListDtl';
import api from '@/api/api';

export default {
  components: {
    dropDown,
    pickListDtl
  },
  data () {
    var v = this;
    return {
      workShow: 'list',
      cacheClickVal: 'CT',
      orderSeq: 'DESC',
      tableItemTotal: 0,
      pickingGoodsNo: '', // 拣货单编号
      formItem: {
        ware: null,
        pickingGoodsNo: null,
        pickListStatus: null,
        pickListType: null,
        pageNum: 1,
        pageSize: 10
      },
      wareList: [//          {txt: '全部', check: true, value: null},
        //          {txt: '深圳仓库', check: false, value: '1'},
        //          {txt: '广州仓库', check: false, value: '2'},
      ],
      pickListStatusList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '已拣货',
          check: false,
          value: '1'
        }, {
          txt: '未拣货',
          check: false,
          value: '0'
        }
      ],
      pickListTypeList: [
        {
          txt: '全部',
          check: true,
          value: null
        }, {
          txt: '单品',
          check: false,
          value: 'SS'
        }, {
          txt: '多品',
          check: false,
          value: 'MM'
        }
      ],
      sortData: [
        {
          label: '按添加时间',
          value: 'CT',
          checked: true,
          toogle: true
        }, {
          label: '按拣货单状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '拣货单编号',
          key: 'pickingGoodsNo',
          align: 'center',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  v.pickingGoodsNo = params.row.pickingGoodsNo;
                  v.pickingStatus = params.row.packageGoodsStatus;
                  v.workShow = 'detail';
                }
              },
              style: {
                display: 'inline-block',
                width: '100%',
                height: '100%'
              }
            }, params.row.pickingGoodsNo);
          }
        }, {
          title: '拣货单类型',
          key: 'type',
          align: 'center'
        }, {
          title: '拣货单状态',
          key: 'status',
          align: 'center',
          width: 98
        }, {
          title: '仓库',
          key: 'warehouseName',
          align: 'center'
        }, {
          title: '出库单数',
          key: 'pickingNumber',
          align: 'center',
          width: 98
        }, {
          title: 'SKU数',
          key: 'goodsSkuNumber',
          align: 'center',
          width: 98
        }, {
          title: '货品数',
          key: 'goodsQuantityNumber',
          align: 'center',
          width: 98
        }, {
          title: '拣货完成时间',
          key: 'finishTime',
          align: 'center'
        }, {
          title: '创建人', // 创建人
          key: 'createdByName',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'op',
          align: 'center',
          render: (h, params) => {
            return h(dropDown, {
              props: {
                dropList: [
                  {
                    code: '打印拣货单',
                    value: '1',
                    flagCode: ['1'],
                    status: '1'
                  }, {
                    code: '标记为已拣货',
                    value: '2',
                    flagCode: ['0'],
                    status: params.row.packageGoodsStatus
                  }, {
                    code: '删除',
                    value: '3',
                    flagCode: ['0'],
                    status: params.row.packageGoodsStatus
                  }
                ],
                styleData: { width: '80px' },
                txt: '操作',
                listenNormal: false
              },
              on: {
                nameValBack: val => {
                  if (val === '2') {
                    this.markHasPicked({
                      pickingGoodsNos: [params.row.pickingGoodsNo]
                    });
                  } else if (val === '3') {
                    // 删除
                    this.axios.post(api.delete_listPickNo + '?pickingGoodsNo=' + params.row.pickingGoodsNo + '&packageGoodsStatus=' + params.row.packageGoodsStatus).then(res => {
                      if (res.data.code === 0) {
                        this.data.splice(params.index, 1);
                      }
                    });
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: [],
      tableSltData: [],
      pickingStatus: ''
    };
  },
  methods: {
    initData () {
      // 仓库数据
      this.axios.get(api.get_stockOutWareList).then(res => {
        if (res.data.code === 0) {
          this.wareList = res.data.datas;
        }
      });
    },
    wareChange (value) {
      // 仓库选择
      //        this.wareList.forEach(it => {
      //          it.check = (value === it.value)
      //        })
      this.formItem.ware = value;
    },
    statusChange (value) {
      this.pickListStatusList.forEach(it => {
        it.check = value === it.value;
      });
      this.formItem.pickListStatus = value;
    },
    typeChange (value) {
      this.pickListTypeList.forEach(it => {
        it.check = value === it.value;
      });
      this.formItem.pickListType = value;
    },
    clickSortButton (data) {
      // 排序按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.orderSeq = 'DESC'; // 降
      } else {
        this.orderSeq = 'ASC';
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.searchFn();
    },
    search () {
      this.formItem.pageNum = 1;
      this.searchFn();
    },
    searchFn () {
      // 查询函数
      let obj = {
        warehouseId: this.formItem.ware === '*' ? null : this.formItem.ware,
        packageGoodsStatus: this.formItem.pickListStatus,
        packageGoodsType: this.formItem.pickListType,
        pickingGoodsNo: this.formItem.pickingGoodsNo === '' ? null : this.formItem.pickingGoodsNo,
        pageNum: this.formItem.pageNum,
        pageSize: this.formItem.pageSize,
        orderSeq: this.orderSeq,
        orderBy: this.cacheClickVal
      };
      this.TableLoading = true;
      this.axios.post(api.get_pickList, obj).then(res => {
        this.TableLoading = false;
        if (res.data.code === 0) {
          this.data = this.processResData(res.data.datas.list);
          this.tableItemTotal = res.data.datas.total;
        }
      });
    },
    processResData (data) {
      // 中文匹配
      data.forEach(val => {
        val.type = val.packageGoodsType === 'SS' ? '单品单件' : val.packageGoodsType === 'SM'
                                                            ? '单品多件'
                                                            : val.packageGoodsType === 'MM' ? '多品' : '';
        val.status = val.packageGoodsStatus === '0' ? '未拣货' : val.packageGoodsStatus === '1' ? '已拣货' : '';
      });
      return data;
    },
    markHasPicked (params) {
      // 标记为已发货
      this.axios.post(api.mark_hasPicked, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('标记成功');
          this.searchFn();
        }
      });
    },
    pageNumChange (page) {
      this.formItem.pageNum = page;
      this.searchFn();
    },
    pageSizeChange (size) {
      this.formItem.pageSize = size;
      this.searchFn();
    },
    tableChange (data) {
      this.tableSltData = data;
    },
    batchOption (val) {
      // 批量操作
      if (this.tableSltData.length === 0) {
        this.$Message.warning({
          content: '请选择操作数据',
          duration: 3
        });
        return;
      }
      if (val === '1') {
        let arr = this.tableSltData.map(val => {
          return val.pickingGoodsNo;
        });
        this.markHasPicked({ pickingGoodsNos: arr });
      }
    }
  },
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        this.searchFn();
      }
    }
  },
  created () {
    this.initData();
    this.searchFn();
  }
};
</script >

<style >
.pickList {
  background-color: #fff;
  padding: 20px 0;
}

.pick .search {
  margin-left: 20px;
}

.pick .dataSort {
  margin: 10px 0;
}
</style >
