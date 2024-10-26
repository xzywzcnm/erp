<template>
  <div class="sorting">
    <!-- 扫描 -->
    <div
      class="card-container" style="marginLeft:12px;">
      <div class="card-content">
        <Row
          justify="center" align="bottom">
          <Col :span="18">
            <div style="paddingTop:15px;">
              扫描/录入拣货单单号开始包装作业 <Input
              v-model.trim="pickList" style="width:300px;marginLeft:15px;" @on-enter="pickStart"></Input>
            </div>
          </Col>
          <Col
            :span="3" offset="1" style="height: 47px">
            <Row style="marginTop:12px;">
              <Col :span="13">本月包裹数：</Col>
              <Col :span="11">{{ packingPickingPackageCount.monthCount }}</Col>
            </Row>
            <Row>
              <Col :span="13">今日包裹数：</Col>
              <Col :span="11">{{ packingPickingPackageCount.todayCount }}</Col>
            </Row>
          </Col>
          <Col :span="2">
            <Row style="marginTop:29px;">
              <Col :span="13">包裹总数：</Col>
              <Col :span="11">{{ packingPickingPackageCount.yearCount }}</Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
    <h2 style="marginLeft:10px;">正在进行的包装作业</h2>
    <!-- 表格 -->
    <div class="orderTable normalTop">
      <keep-alive>
        <Table
          border
          highlight-row
          :loading="loading"
          :height="tableHeight"
          :columns="packingColumn"
          :data="packingData"></Table>
      </keep-alive>
    </div>
    <!-- 拣货单异常 -->
    <Modal
      v-if="pickingListStatus" v-model="pickingListModelStatus" width="500">
      <p slot="header">
        开启包装作业异常 </p>
      <div style="padding:10px 20px;">
        <Row>
          <Col span="6">
            <div>
              <Icon
                type="md-information-circle" color="#2b85e4" style="font-size:50px"></Icon>
            </div>
          </Col>
          <Col
            span="16"
            style="font-size:16px">{{ '您扫描或输入的拣货单【 {pickList} 】在系统中未找到，请确认拣货单是否已被删除'.replace('{pickList}', pickList) }}
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button
          style="marginRight:210px;" @click="cancel">我知道了 </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    return {
      pickList: null, // 拣货单单号
      loading: false,
      packingPickingPackageCount: {
        monthCount: 0,
        todayCount: 0,
        yearCount: 0
      },
      packingData: [],
      packingColumn: [
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
          title: '拣货单号',
          key: 'pickingGoodsNo',
          align: 'center'
        }, {
          title: '拣货单类型',
          key: 'packageGoodsType',
          align: 'center',
          render: (h, params) => {
            return h('span', this.getPickType(params.row.packageGoodsType));
          }
        }, {
          title: '作业开始时间',
          key: 'scanStartTime',
          align: 'center'
        }, {
          title: '时长',
          key: 'workTime',
          align: 'center'
        }, {
          title: '包裹进度',
          key: 'packageProgress',
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.packageNum + '/' + params.row.totalPackageNum);
          }
        }, {
          title: '货品进度',
          key: 'productProgress',
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.goodsNum + '/' + params.row.totalGoodsNum);
          }
        }, {
          title: '小组成员',
          key: 'userId',
          align: 'center'
        }
      ],
      pickingListStatus: false,
      pickingListModelStatus: false
    };
  },
  methods: {
    getPickType (pickType) {
      let pickTypeObj = {
        SS: '单品单件',
        SM: '单品多件',
        MM: '多品'
      };
      if (pickType !== null) {
        return pickTypeObj[pickType];
      } else {
        return '';
      }
    },
    pickStart () { // 开始包装作业
      let v = this;
      if (v.pickList !== null) {
        v.axios.put(api.wmsService + api.get_scanPickingGoodsNo + '/' + v.pickList).then(response => {
          if (response.data.code === 0) {
            // let data = response.data.datas;
            window.location.href = '//' + window.location.host + '/erp_service/packagingWork.html';
          } else {
            v.pickingListStatus = true;
            v.pickingListModelStatus = true;
          }
        });
      }
    },
    cancel () {
      let v = this;
      v.pickingListModelStatus = false;
    }
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(480);
    }
  },
  created () {
    let v = this;
    v.axios.get(api.erpServiceCommon + api.wmsService + api.get_packingPickingGoodsInfo).then(response => {
      if (response.data.code === 0) {
        let data = response.data.datas;
        if (data.isPacking) { // 跳转到包装作业页面
          window.location.href = '//' + window.location.host + '/erp_service/packagingWork.html';
        }
        v.packingData = data.packingPickingGoods;
        v.packingPickingPackageCount = data.packingPickingPackageCount;
      }
    });
  }
};
</script>
