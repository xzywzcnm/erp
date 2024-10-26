<template>
  <div class="index_box">
    <Card dis-hover>
      <p slot="title" class="card_title">仓库数据统计</p>
      <Row>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <div class="icon iconfont on_sale_today" style="font-size: 60px;">&#xe66d;</div>
            <div class="text">
              <p class="on_sale_today">今日上架商品数量</p>
              <p class="on_sale_today">{{
                    indexData.onShelfSkuNum
                    ? indexData.onShelfSkuNum
                    : 0
                                         }}</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <div class="icon iconfont on_sale_today" style="font-size: 60px;">&#xe697;</div>
            <div class="text">
              <p class="on_sale_today">今日上架批次数量</p>
              <p class="on_sale_today">{{
                    indexData.onShelfBatchNum
                    ? indexData.onShelfBatchNum
                    : 0
                                         }}</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <div class="icon iconfont goods_shelves" style="font-size: 60px;">&#xe66d;</div>
            <div class="text">
              <p class="goods_shelves">待上架商品数量</p>
              <p class="goods_shelves">{{
                    indexData.notOnShelfSkuNum
                    ? indexData.notOnShelfSkuNum
                    : 0
                                         }}</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <div class="icon iconfont goods_shelves" style="font-size: 60px;">&#xe697;</div>
            <div class="text">
              <p class="goods_shelves">待上架批次数量</p>
              <p class="goods_shelves">{{
                    indexData.notOnBatchNum
                    ? indexData.notOnBatchNum
                    : 0
                                         }}</p>
            </div>
          </div>
        </div>
        </Col>
      </Row>
    </Card>
    <Card dis-hover style="margin-top: 20px">
      <p slot="title" class="card_title">我的工作量统计</p>
      <Row>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <img src="../../../assets/images/u482.png" alt="" width="80" />
            <div class="text">
              <p>到货入库</p>
              <p>0</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <img src="../../../assets/images/u530.png" alt="" width="80" />
            <div class="text">
              <p>质检</p>
              <p>0</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <img src="../../../assets/images/u495.png" alt="" width="80" />
            <div class="text">
              <p>库存转移</p>
              <p>0</p>
            </div>
          </div>
        </div>
        </Col>
        <Col span="6">
        <div class="textBox">
          <div class="textBox_item">
            <img src="../../../assets/images/u504.png" alt="" width="80" />
            <div class="text">
              <p>拣货</p>
              <p>0</p>
            </div>
          </div>
        </div>
        </Col>
      </Row>
    </Card>
    <Card style="margin-top: 20px">
      <p slot="title" class="card_title">统计看板</p>
      <div id="main" style="width: 100%;height:400px;"></div>
    </Card>
  </div>
</template>

<script>
// 引入 echarts 主模块。
import * as Echart from 'echarts/lib/echarts';
// 引入折线图。
import 'echarts/lib/chart/line';
// 引入提示框组件、标题组件、工具箱组件。
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/toolbox';
import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';

export default {
  data () {
    return {
      indexData: {}
    };
  },
  mounted () {
    let myChart = Echart.init(document.getElementById('main'));
    myChart.setOption({
      title: {
        text: '每月出库量'
      },
      tooltip: {},
      xAxis: {
        data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        nameGap: 0,
        nameLocation: 'end'
      },
      yAxis: {
        min: 2000,
        max: 6000
      },
      series: [
        {
          name: '销量',
          type: 'line',
          data: []
        }
      ]
    });

    let fun = () => {
      myChart.resize();
    }
    window.addEventListener('resize', fun);
    this.$once('hook:beforeDestory', () => {
      window.removeEventListener('resize', fun);
    })
  },
  computed: {
    warehouseId () {
      return getWarehouseId();
    }
  },
  created () {
    this.GetIndexData();
  },
  methods: {
    GetIndexData () {
      this.axios.get(api.get_querySkuNumAndBatchNum + `?warehouseId=${this.warehouseId}`).then((response) => {
        if (response.data.code === 0) {
          if (response.data.datas !== null) {
            this.indexData = response.data.datas;
          }
        }
      });
    }
  }
};
</script>

<style lang='less' scoped>
.index_box {
  .card_title {
    font-size: 18px;
    color: #333;
    font-weight: bold;
  }

  .textBox {
    border: 1px solid #eee;
    width: 260px;
    padding: 10px 20px;

    .textBox_item {
      display: flex;
      align-items: center;

      .text {
        margin-left: 12px;
        font-size: 16px;

        p:nth-child(2) {
          font-weight: 700;
        }
      }
    }

    &:hover {
      cursor: pointer;
      transform: translateY(-2%);
      box-shadow: 1px 1px 10px 2px #ccc;
      transition: box-shadow 0.4s, transform 0.4s;

      .on_sale_today {
        color: #3d9ff9;
      }

      .goods_shelves {
        color: #13ae67;
      }
    }
  }
}
</style>
