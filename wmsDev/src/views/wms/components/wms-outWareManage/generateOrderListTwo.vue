<template >
  <div class="generateBox" >
    <Tabs value="1" v-if="workShow === 'list'" >
      <TabPane label="按出库单拣货" name="1" class="tabs" >
        <Form :label-width="100" class="listBox" >
          <div class="platformSearch clear" >
            <Row >
              <Col span="7" >
                <div class="filterItem" >
                  <Form-item label="出库单编号：" >
                    <dyt-input-tag :limit="1" :string="true" type="textarea"
                        v-model.trim="searchParams.outListNo"
                        placeholder="多个出库单请用逗号或回车分隔"
                        style="width:220px" />
                  </Form-item >
                </div >
              </Col >
              <Col span="7" >
                <div class="filterItem" >
                  <Form-item label="订单号：" >
                    <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="searchParams.orderNo" placeholder="多个订单号请用逗号或回车分隔" style="width:220px" />
                  </Form-item >
                </div >
              </Col >
            </Row >
          </div >
          <div class="platformSearch" >
            <Row >
              <Col span="7" >
                <div class="filterItem" >
                  <Form-item label="物流方式：" >
                    <Cascader
                        :data="apiLogisterList"
                        :load-data="loadData"
                        style="width:220px"
                        transfer
                        @on-change="logisticTypeChange" ></Cascader >
                    <!--<Select style="width:220px" v-model="searchParams.logisticType">-->
                    <!--<Option value="*">全部</Option>-->
                    <!--<Option v-for='v in apiLogisterList' :key='v.value' :value='v.value'>{{v.label}}</Option>-->
                    <!--</Select>-->
                  </Form-item >
                </div >
              </Col >
              <Col span="7" >
                <div class="filterItem" >
                  <Form-item label="包裹类型：" >
                    <Button-group >
                      <Button
                          :type="item.checked ? 'primary' : 'ghost'"
                          v-for="item in packTypeBtnData"
                          @click="clickPackTypeBtnData(item)"
                          :key="item.value" >{{ item.label }} </Button >
                    </Button-group >
                  </Form-item >
                </div >
              </Col >
            </Row >
          </div >
          <div class="platformSearch" >
            <Row >
              <Col span="3" pull="1" >
                <div class="filterItem filterConfirm queryBtn" style="margin-left: 20px" >
                  <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="ios-search" >查询</Button >
                </div >
              </Col >
            </Row >
          </div >
        </Form >
        <!--排序-->
        <div class="grayBg" >
          <span >排序方式：</span >
          <Button-group >
            <Button
                :type="item.checked ? 'primary' : 'ghost'"
                v-for="item in sortData"
                :disabled="SearchDisabled"
                @click="clickSortButton(item)"
                :key="item.value" >{{ item.label }}
              <Icon type="md-arrow-up" v-if="item.checked && !item.toogle" ></Icon >
              <Icon type="md-arrow-down" v-if="item.checked && item.toogle" ></Icon >
            </Button >
          </Button-group >
        </div >
        <Button type="primary" @click="openCreateList" style="margin-bottom: 10px" >生成拣货单</Button >
        <Table
            border
            ref="selection"
            :columns="columns"
            :loading="TableLoading"
            :data="data"
            @on-selection-change="tableChange" ></Table >
        <div class="fr pages" >
          <Page
              :total="tableItemTotal"
              :current="searchParams.pageNum"
              show-total
              show-sizer
              show-elevator
              @on-change="pageNumChange"
              @on-page-size-change="pageSizeChange"
              :page-size-opts="pageArray" ></Page >
        </div >
        <!--生成拣货单-->
        <div v-if="createPickListModel" >
          <Modal class="createPick" style="width: 600px" v-model="createPickListModel" title="生成拣货单" >
            <createPickList :apiParams="tableSltData" type="other" ></createPickList >
          </Modal >
        </div >
      </TabPane >
      <TabPane label="自动拣货波次" name="2" style="background-color: #fff;padding-top: 20px;padding-left: 10px" >
        <div class="clear" style="padding-bottom: 30px" >
          <div
              style="margin-left: 50px;background-color: rgba(228, 228, 228, 1);width: 140px;height: 54px;line-height: 54px;"
              class="fl" >
            <span style="font-size: 16px" >单品规则</span >
            <i-switch >
              <span slot="open" >开</span > <span slot="close" >关</span >
            </i-switch >
          </div >
          <div
              style="background-color: rgba(242, 242, 242, 1);;width: 140px;height: 54px;line-height: 54px;padding-left: 10px"
              class="fl" >
            <span style="font-size: 16px" >多品规则</span >
            <i-switch >
              <span slot="open" >开</span > <span slot="close" >关</span >
            </i-switch >
          </div >
        </div >
        <Card :bordered="false" dis-hover >
          <div slot="title" >合并规则</div >
          <pickListRule ></pickListRule >
        </Card >
        <Card :bordered="false" dis-hover >
          <div slot="title" >时间设置</div >
          <Form class="timeSet" >
            <FormItem label="拣货单生成时间" >
              <RadioGroup v-model="delayTime" >
                <Radio label="0" >
                  <span >固定周期</span > <span >每过<InputNumber size="small" ></InputNumber >小时生成拣货单</span >
                </Radio >
                <br />
                <Radio label="1" >
                  <span >每天定时</span > <span >每天
                    <TimePicker
                        format="HH:mm"
                        v-model="v.time"
                        placeholder=""
                        style="width: 80px;margin-right: 5px"
                        size="small"
                        v-for="(v, i) in addInputDataList"
                        :key="i" ></TimePicker >
                    <span @click="addTimePicker" ><Icon type="md-add" style="font-size: 18px" ></Icon ></span >
                    <span @click="dltTimePicker" ><Icon
                        type="md-remove"
                        style="font-size: 18px"
                        v-if="addInputDataList.length > 1" ></Icon ></span >
                    生成拣货单
                  </span >
                </Radio >
              </RadioGroup >
            </FormItem >
          </Form >
        </Card >
        <Button type="primary" style="margin-left: 20px" >保存</Button >
      </TabPane >
    </Tabs >
    <div v-if="workShow === 'detail'" >
      <sellStockOutDtl :pickingNo="pickingNo" :workShow="workShow" :workType="workType" ></sellStockOutDtl >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import createPickList from './createPickList';
import sellStockOutDtl from './sellStockOutDtl';
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import pickListRule from './pickListRule';

export default {
  components: {
    createPickList,
    sellStockOutDtl,
    compoundBtn,
    pickListRule
  },
  data () {
    var v = this;
    return {
      delayTime: '0',
      searchParams: {
        outListNo: '',
        orderNo: '',
        logisticType: '',
        pageNum: 1,
        pageSize: 10,
        packType: ''
      },
      pickingNo: '',
      workShow: 'list',
      workType: 'sellStock',
      cacheClickVal: 'CT', // 排序缓存值
      orderSeq: 'DESC',
      apiLogisterList: [],
      tableItemTotal: 0,
      tableSltData: [],
      createPickListModel: false, // 控制生成拣货单的模态框
      addInputDataList: [{ time: '' }],
      sortData: [
        {
          label: '按库区',
          value: 'CT',
          checked: true,
          toogle: true
        }, {
          label: '按付款时间',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      packTypeBtnData: [
        {
          label: '全部',
          value: '',
          checked: true
        }, {
          label: '单品',
          value: 'SS',
          checked: false
        }, {
          label: '多品',
          value: 'MM',
          checked: false
        }, {
          label: '有发货提醒',
          value: 'xx',
          checked: false
        }
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '出库单编号',
          key: 'pickingNo',
          align: 'center',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  v.pickingNo = params.row.pickingNo;
                  v.workShow = 'detail';
                }
              }
            }, params.row.pickingNo);
          }
        }, {
          title: '订单号',
          width: 98,
          align: 'center',
          key: 'type'
        }, {
          title: '国家/地区',
          width: 98,
          align: 'center',
          key: 'consigneeCountry'
        }, {
          title: 'SKU数量',
          width: 110,
          align: 'center',
          key: 'warehouseName'
        }, {
          title: '物品数量',
          align: 'center',
          width: 160,
          key: 'referenceNo'
        }, {
          title: '物流方式',
          align: 'center',
          key: 'logisticsDealerName'
        }, {
          title: '拣货库区',
          width: 98,
          align: 'center',
          key: 'pickStatus'
        }, {
          title: '库位使用',
          align: 'center',
          key: 'deliverFinishTime'
        }, {
          title: '付款时间',
          align: 'center',
          key: 'createdName'
        }, {
          title: '操作',
          key: 'h',
          align: 'center',
          width: 180,
          render: (h, params) => {
            return h(compoundBtn, {
              props: {
                dropList: [
                  {
                    label: '查看出库单详情',
                    value: '1',
                    flagCode: ['0', '1'],
                    status: '0'
                  }
                ],
                title: '生成拣货单',
                listenNormal: false
              },
              on: {
                click: val => {
                  if (!val) {
                    // 生成拣货单
                  } else {
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: []
    };
  },
  created () {
    this.searchFn();
  },
  methods: {
    paramsFn () {
      let obj = {
        orderBy: this.cacheClickVal === '' ? null : this.cacheClickVal,
        orderSeq: this.orderSeq, // packageGoodsStatus: this.searchParams.picked === '*' ? null : this.searchParams.picked,
        packageType: this.searchParams.packType === '' || this.searchParams.packType[0] === '*'
                     ? null
                     : this.searchParams.packType,
        pageNum: this.searchParams.pageNum,
        pageSize: this.searchParams.pageSize,
        pickingNo: this.searchParams.outListNo === '' ? null : this.chEnCsv(this.searchParams.outListNo), // 出库单编号
        pickingStatus: ['2'], // 出库单状态
        //                    pickingType: this.searchParams.outListType === '' || this.searchParams.outListType[0] === '*' ? ['S1'] : this.searchParams.outListType,
        //                    referenceNo: this.searchParams.referenceNo === '' ? null : this.chEnCsv(this.searchParams.referenceNo),//参考编号
        warehouseId: ['146064154430799872'],
        orderNos: this.searchParams.orderNo,
        pickingExtendList: this.searchParams.logisticType.length !== 0 ? [
          {
            logisticsDealerCode: this.searchParams.logisticType[0],
            logisticsMailCode: this.searchParams.logisticType[1]
          }
        ] : null
      };
      return obj;
    },
    chEnCsv (params) {
      // 中英文逗号分隔
      let arr = [];
      if (params.indexOf(',') > -1) {
        arr = params.split(',');
      } else if (params.indexOf('，') > -1) {
        arr = params.split('，');
      } else {
        arr.push(params);
      }
      return arr;
    },
    processData (listData) {
      listData.forEach(val => {
        val.type = val.pickingType === 'S1' ? '销售出库' : val.pickingType === 'O3' ? '其他出库' : val.pickingType === 'O1'
                                                                                           ? '调拨出库'
                                                                                           : val.pickingType === 'O2'
                                                                                             ? '组装加工'
                                                                                             : '';
        val.status = val.pickingStatus === '0' ? '订单创建' : val.pickingStatus === '1' ? '部分分配' : val.pickingStatus === '2'
                                                                                               ? '分配完成'
                                                                                               : val.pickingStatus === '3'
                                                                                                 ? '部分发货'
                                                                                                 : val.pickingStatus === '4'
                                                                                                   ? '完成发货'
                                                                                                   : val.pickingStatus === '5'
                                                                                                     ? '订单完成'
                                                                                                     : '';
        val.pickStatus = val.packageGoodsStatus === '0' ? '未拣货' : val.packageGoodsStatus === '1' ? '已拣货' : '';
      });
      return listData;
    },
    searchFn () {
      // 查询
      let obj = this.paramsFn();
      obj.pickingStatus = ['2'];
      obj.getLabelStatus = 3;
      this.TableLoading = true;
      this.SearchDisabled = true;
      this.axios.post(api.get_sellStockList, obj).then(res => {
        this.TableLoading = false;
        this.SearchDisabled = false;
        if (res.data.code === 0) {
          let data = this.processData(res.data.datas.list);
          this.data = data;
          this.tableItemTotal = res.data.datas.total;
        }
      });
    },
    addTimePicker () {
      this.addInputDataList.push({ time: '' });
    },
    dltTimePicker () {
      this.addInputDataList.pop();
    },
    logisticTypeChange (value) {
      this.searchParams.logisticType = value;
    },
    clickPackTypeBtnData (item) {
      this.packTypeBtnData.forEach(function (n) {
        n.checked = item.value === n.value;
      });
      this.searchParams.packType = item.value;
    },
    searchData () {
      // 查询按钮
      this.searchParams.pageNum = 1;
      this.searchFn();
    },
    clickSortButton (data) {
      // 点击排序按钮
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
    openCreateList () {
      // 打开生成拣货单模态框
      if (this.tableSltData.length === 0) {
        this.$Message.warning({
          content: '请选择要操作的数据',
          duration: 3
        });
        return;
      }
      this.createPickListModel = true;
    },
    tableChange (data) {
      // 表格选择项变化
      this.tableSltData = data;
    },
    loadData (item, callback) {
      // 动态根据选择的物流商查对应的物流方式
      item.loading = true;
      this.axios.get(api.get_sendType + `?carrierId=${item.id}`).then(res => {
        if (res.data.code === 0) {
          if (res.data.datas.length > 0) {
            let data = res.data.datas;
            let child = data.map(val => {
              return {
                label: val.name,
                value: val.code,
                id: val.code
              };
            });
            item.children = child;
          } else {
            item.children = [
              {
                label: '暂无数据',
                value: '-',
                disabled: true
              }
            ];
          }
          item.loading = false;
          callback();
        }
      });
    },
    pageNumChange (page) {
      this.searchParams.pageNum = page;
      this.searchFn();
    },
    pageSizeChange (size) {
      this.searchParams.pageSize = size;
      this.searchFn();
    }
  }
};
</script >

<style >
.generateBox {
  margin-left: 6px;
}

.generateBox .grayBg {
  margin-left: 0;
  margin-right: 0;
}

.generateBox .tabs {
  margin-bottom: 0px;
}

.listBox {
  background-color: #ffffff;
  /*margin-left: 6px;*/
  padding-top: 10px;
}

.grayBg {
  margin-top: 20px;
}

.queryBtn {
  margin-left: 170px !important;
  margin-bottom: 20px;
}

.timeSet .ivu-form .ivu-form-item-label {
  font-size: 14px;
}
</style >
