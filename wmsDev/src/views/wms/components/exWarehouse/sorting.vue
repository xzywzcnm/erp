<template >
  <div class="sorting" >
    <!-- 扫描 -->
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div style="paddingTop:15px;" >
            扫描/录入拣货单单号开始多品分拣 <Input
              v-model.trim="pickList"
              ref="packListIpt"
              autofocus
              style="width:300px;marginLeft:15px;"
              @on-enter="pickStart" ></Input >
          </div >
        </div >
      </div >
    </div >
    <h2 style="marginLeft:10px;" >正在进行的分拣作业</h2 >
    <!-- 表格 -->
    <div class="orderTable normalTop" >
      <Table border :loading="loading" :height="tableHeight" :columns="sortingColumn" :data="sortingData" ></Table >
    </div >
    <!-- 拣货单异常 -->
    <Modal v-if="pickingListStatus" v-model="pickingListModelStatus" width="500" title="开启多品分拣作业异常" >
      <div style="padding:10px 20px;" >
        <Row >
          <Col span="6" >
            <div >
              <Icon type="md-information-circle" color="#2b85e4" style="font-size:50px" ></Icon >
            </div >
          </Col >
          <Col
              v-if="errorCode === 116001"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】在系统中未找到，请确认拣货单是否已被删除或拣货单号输入错误。'.replace( '{pickList}', pickListText ) }}
          </Col >
          <Col
              v-if="errorCode === 116002"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】不是多品多件拣货单，无法开启分拣作业。'.replace( '{pickList}', pickListText ) }}
          </Col >
          <Col v-if="errorCode === 116119" span="16" style="font-size:16px" >拣货篮不能找到唯一没包装完成的拣货单
          </Col >
          <Col v-if="errorCode === 116120" span="16" style="font-size:16px" >拣货篮没有待完成的拣货单
          </Col >
          <Col v-if="errorCode === 116003" span="16" style="font-size:16px" >
            <div >当前系统中存在由您开启的、尚未完成的分拣作业，</div >
            <div style="marginTop:15px;" >
              拣货单号：{{ pickNo }}
            </div >
            <div style="marginBottom:15px;" >
              分拣作业开始时间：{{ pickStartTime }}
            </div >
            <div >
              {{ '系统每个操作员同一时间只允许开启一个分拣作业，所以，很抱歉，你无法对拣货单【 {pickList} 】开启分拣作业。'.replace( '{pickList}', pickListText ) }}
            </div >
          </Col >
          <Col
              v-if="errorCode === 116004"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】正在进行分拣作业，每张拣货单同一时间只允许一位操作员进行分拣作业，无法再次开启。'.replace( '{pickList}', pickListText ) }}
          </Col >
          <Col v-if="errorCode === 116005" span="16" style="font-size:16px" >
            <div style="marginBottom:15px;" >
              {{ '您扫描或输入的拣货单【 {pickList} 】已经分拣完成，您可以对该拣货单重新开启分拣作业。'.replace( '{pickList}', pickListText ) }}
            </div >
            <RadioGroup v-model="restPick" >
              <Radio label="no" >
                <span >我搞错了，我不需要重新分拣</span >
              </Radio >
              <Radio label="yes" >
                <span >是的，我需要对这个拣货单进行重新分拣</span >
              </Radio >
            </RadioGroup >
          </Col >
          <Col
              v-if="errorCode === 116006"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】正在进行拣货复核，无法开启分拣作业。'.replace( '{pickList}',pickListText ) }}
          </Col >
          <Col
              v-if="errorCode === 116007"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】已经完成拣货复核，无法开启分拣作业。'.replace( '{pickList}',pickListText ) }}
          </Col >
          <Col
              v-if="errorCode === 116009"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】下存在已进行普通打印出库单'.replace( '{pickList}',pickListText ) }}
          </Col >
          <Col
              v-if="errorCode === 116011"
              span="16"
              style="font-size:16px" >{{ '您扫描或输入的拣货单【 {pickList} 】拣货未完成'.replace( '{pickList}',pickListText ) }}
          </Col >
        </Row >
      </div >
      <div slot="footer" >
        <Button v-if="errorCode !== 116005" style="marginRight:210px;" @click="cancel" >我知道了 </Button >
        <Button v-if="errorCode === 116005" style="marginRight:210px;" @click="ok" >确定 </Button >
      </div >
    </Modal >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    return {
      sortingStatus: false, // 刷新表格数据
      pickList: null, // 拣货单单号
      loading: false,
      sortingData: [],
      pickNo: null,
      sortingColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          key: 'index',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '操作',
          key: '',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'text'
              },
              style: {
                color: 'rgb(0, 84, 166)'
              },
              on: {
                click: () => {
                  this.cancelPick(params.row.pickingGoodsId);
                }
              }
            }, '撤销');
          }
        }, {
          title: '拣货单号',
          key: 'pickingGoodsNo',
          align: 'center'
        }, {
          title: '拣货单类型',
          key: 'packageGoodsType',
          align: 'center',
          render: (h, params) => {
            return h('div', '多品');
          }
        }, {
          title: '作业开始时间',
          key: 'sortingStartTime',
          align: 'center',
          render: (h, params) => {
            let date = this.$uDate.dealTime(params.row.sortingStartTime);
            return h('div', date);
          }
        }, {
          title: '时长',
          key: '',
          align: 'center',
          render: (h, params) => {
            let date = this.$uDate.dealTime(params.row.sortingStartTime);
            return h('div', this.getTime(date));
          }
        }, {
          title: '分拣状态',
          key: 'sortingStatus',
          align: 'center',
          render: (h, params) => {
            if (params.row.sortingStatus === '0') {
              return h('div', '待分拣');
            } else if (params.row.sortingStatus === '1') {
              return h('div', '正在分拣');
            } else if (params.row.sortingStatus === '2') {
              return h('div', '分拣完成');
            }
          }
        }, {
          title: '操作员',
          key: 'sortingUserId',
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            let list = this.userList;
            if (list && list[params.row.sortingUserId]) {
              return h('span', list[params.row.sortingUserId].userName);
            }
          }
        }
      ],
      userList: null, // 分拣人名称
      pickingListStatus: false, // 异常弹框
      pickingListModelStatus: false,
      errorCode: null, // 异常
      pickStartTime: null, // 分拣作业开始时间 异常用到
      restPick: 'no', // 是否需要重新分拣
      pickListText: ''
    };
  },
  methods: {
    getList () {
      // 获取正在进行的分拣列表
      let v = this;
      if (v.getPermission('wmsPickingGoods_querySortingList')) {
        let pos = [];
        let list = [];
        v.axios.get(api.get_sortingList).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data) {
              data.forEach((n, i) => {
                pos.push(n);
                list.push(n.sortingUserId);
              });
            }
            Promise.resolve(v.getUserInfoMap(list)).then(result => {
              v.sortingData = pos;
            });
          }
        });
      } else {
        v.gotoError(); // 无权限
      }
    },
    pickStart () {
      // 开始分拣
      let v = this;
      if (v.getPermission('wmsPickingSorting_startSorting')) {
        if (v.pickList !== null && v.pickList !== '') {
          v.pickListText = v.pickList;
          v.axios.get(api.get_pickingId + '?pickingGoodsNo=' + v.pickList + '&warehouseId=' + v.getWarehouseId()).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas.pickingGoodsId;
              localStorage.setItem('pickingGoodsNo', JSON.stringify(data));
              window.location.href = '//' + window.location.host + '/wms-service/sortingInfo.html?warehouseId=' + v.getWarehouseId();
            } else {
              /* v.pickingListStatus = true;
               v.pickingListModelStatus = true;
               if (response.data.code === 116001) {
               // 拣货单信息不存在
               v.errorCode = 116001;
               } else if (response.data.code === 116002) {
               // 拣货单类型错误,不是多品
               v.errorCode = 116002;
               } else if (response.data.code === 116119) {
               v.errorCode = 116119;
               } else if (response.data.code === 116120) {
               v.errorCode = 116120;
               } else if (response.data.code === 116003) {
               // 已开启其他分拣作业
               let time = response.data.datas.sortingStartTime;
               v.pickStartTime = v.$uDate.dealTime(time);
               v.pickNo = response.data.datas.pickingGoodsNo;
               v.errorCode = 116003;
               } else if (response.data.code === 116004) {
               // 拣货单正在被别人分拣中
               v.errorCode = 116004;
               } else if (response.data.code === 116005) {
               // 拣货单已完成分拣
               v.errorCode = 116005;
               } else if (response.data.code === 116006) {
               // 拣货单正在包装中
               v.errorCode = 116006;
               } else if (response.data.code === 116007) {
               // 拣货单已完成拣货复核
               v.errorCode = 116007;
               } else if (response.data.code === 116009) {
               // 拣货单下存在已进行普通打印出库单
               v.errorCode = 116009;
               } else if (response.data.code === 116011) {
               // 拣货单未打印或拣货未完成
               v.errorCode = 116011;
               } */
            }
            v.pickList = '';
          });
        } else {
          v.pickingListModelStatus = false;
        }
      } else {
        v.$Message.warning('没有权限');
      }
    },
    ok () {
      // 异常 已分拣完成，重新开启分拣
      let v = this;
      if (v.restPick === 'yes') {
        // 重新开启分拣
        if (v.pickList !== null) {
          v.axios.get(api.get_pickingId + '?pickingGoodsNo=' + v.pickList + '&flag=1' + '&warehouseId=' + v.getWarehouseId()).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas.pickingGoodsId;
              localStorage.setItem('pickingGoodsNo', JSON.stringify(data));
              window.location.href = '//' + window.location.host + '/wms-service/sortingInfo.html?warehouseId=' + v.getWarehouseId();
            } else if (response.data.code === 116007) {
              v.$nextTick(() => {
                v.$refs.packListIpt.focus();
              });
            }
          });
        }
      } else if (v.restPick === 'no') {
        v.pickingListModelStatus = false;
        v.$nextTick(() => {
          v.$refs.packListIpt.focus();
        });
      }
    },
    cancel () {
      // 关闭异常弹框
      let v = this;
      v.pickingListModelStatus = false;
      v.$nextTick(() => {
        v.$refs.packListIpt.focus();
      });
    },
    getUserInfoMap (userIds) {
      // 获取分拣人名称
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userList = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    },
    cancelPick (pickingGoodsNo) {
      // 撤销分拣
      let v = this;
      v.axios.post(api.cancel_sorting + pickingGoodsNo).then(response => {
        if (response.data.code === 0) {
          v.sortingStatus = true;
        }
      });
    },
    getTime (time) {
      let v = this;
      let nowTime = v.$uDate.getNowTime() / 1000; // 现在的时间(秒)
      let oldTime = new Date(time).getTime() / 1000; // 分拣开始的时间(秒)
      let theTime = parseInt(nowTime - oldTime);
      let theTime1 = 0; // 分
      let theTime2 = 0; // 时
      if (theTime / 60 / 60 >= 1) {
        theTime2 = parseInt(theTime / 60 / 60);
        theTime = theTime % (60 * 60);
        if (theTime / 60 >= 1) {
          theTime1 = parseInt(theTime / 60);
        }
        return theTime2 + 'hour ' + theTime1 + 'min';
      } else if (theTime / 60 / 60 < 1 && theTime / 60 >= 1) {
        theTime1 = parseInt(theTime / 60);
        return theTime1 + 'min';
      } else if (theTime > 0 && theTime < 1) {
        return 'Less than a minute';
      }
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(480);
    }
  },
  watch: {
    sortingStatus (n, o) {
      let v = this;
      if (n) {
        v.getList();
        v.sortingStatus = false;
      }
    }
  },
  created () {
    let v = this;
    v.getList();
    // let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
    // localStorage.setItem('filenodeViewTargetUrl', JSON.stringify(filenodeViewTargetUrl));
  },
  updated: function () {
    this.$nextTick(() => {
      this.$refs.packListIpt.focus();
      // Code that will run only after the
      // entire view has been re-rendered
    });
  }
};
</script >
