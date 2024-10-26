<template>
  <div class="mainBox pdsIndex">
    <!--  v-if="false" -->
    <div>
      <Card dis-hover>
        <div class="f16 fontWeight" style="padding-bottom: 25px" solt="header">
          我的工作台
        </div>
        <Row type="flex" justify="space-between" class="code-row-bg">
          <Col span="7">
          <Card dis-hover>
            <Row>
              <Col span="10"><img src="../../../assets/images/hasdone.png" />
              </Col>
              <Col span="14">
              <p>待办任务</p>
              <local-count class="connt" :startVal="0" :usegroup="isTrue" :end="todoNum"></local-count>
              </Col>
            </Row>
          </Card>
          </Col>
          <Col span="7">
          <Card dis-hover>
            <Row>
              <Col span="10"><img src="../../../assets/images/upcoming.png" />
              </Col>
              <Col span="14">
              <p>本月已办</p>
              <local-count class="connt" :startVal="0" :usegroup="isTrue" :end="doneNum"></local-count>
              </Col>
            </Row>
          </Card>
          </Col>
          <Col span="7">
          <Card dis-hover>
            <Row>
              <Col span="10"><img src="../../../assets/images/upcoming1.png" />
              </Col>
              <Col span="14">
              <p>本月创建</p>
              <local-count class="connt" :startVal="0" :usegroup="isTrue" :end="createNum"></local-count>
              </Col>
            </Row>
          </Card>
          </Col>
        </Row>
      </Card>
      <Card dis-hover style="margin-top: 20px">
        <div class="f16 fontWeight" style="padding-bottom: 25px" solt="header">
          统计面板
          <Tooltip content="商户整体完成情况">
            <img class="tool-img" src="../../../assets/images/help.png" width="16" />
          </Tooltip>
        </div>
        <Row type="flex" justify="space-between" class="code-row-bg">
          <Col span="10">
          <Button :class="{ 'ivu-btn-primary': time === 'month' }" @click="
          time = 'month'; getChartData(); ">近30天</Button>
          <Button :class="{ 'ivu-btn-primary': time === 'year' }" @click="
          time = 'year'; getChartData(); ">近一年</Button>
          <Poptip trigger="click" content="content">
            <Button @click="time = 'custom'" :class="{ 'ivu-btn-primary': time === 'custom' }">自定义</Button>
            <div slot="content">
              <Date-picker ref="timeDate" type="datetimerange" style="width: 280px;margin-right: 10px;"
                :editable="false" :options="dateOptions" :time-picker-options="{ steps: [1, 10, 10] }"
                format="yyyy-MM-dd" placement="bottom-end" placeholder="请选择日期" v-model="payTimeArr">
              </Date-picker>
              <Button @click="getChartData(payTimeArr)">搜索</Button>
            </div>
          </Poptip>
          </Col>
          <Col span="10">
          <dyt-select v-model="typeModel">
            <Option @click.native="getChartData()" v-for="(item, index) in typeList" :key="index" :value="item.value"
              :label="item.label"></Option>
          </dyt-select>
          <p class="fr">
            <span style="padding-right: 50px">总计：{{ chartTotal }}</span><span>平均值：{{ chartAverage }}</span>
          </p>
          </Col>
        </Row>
        <e-charts ref="echartMain" style="height: 300px;" :options="option"></e-charts>
        <div class="mb10">
          <Button :class="{ 'ivu-btn-primary': TableTimeType === 'week' }" @click="
          TableTimeType = 'week'; getTableDate();" class="mr10">本周</Button>
          <Button :class="{ 'ivu-btn-primary': TableTimeType === 'month' }" @click="
          TableTimeType = 'month'; getTableDate();" class="mr10">本月</Button>
          <Button :class="{ 'ivu-btn-primary': TableTimeType === 'year' }" @click="
          TableTimeType = 'year'; getTableDate(); ">最近一年</Button>
        </div>
        <Table height="300" :columns="columns1" :data="data1"></Table>
      </Card>
    </div>
    <!-- <Row>
       <Col span="18"></Col>
       <Col span="6" >
         <Card  title="公告栏" dis-hover>
             <ul v-show="announcementList.length >0">
               <li v-for="(item,index) in announcementList" :key="index" class="bulletinBoard"><a class="name" @click="openAnnouncement(item)" :title="item.announceTitle" >{{item.announceTitle}}</a><span class="time" :title="item.updatedTime">{{item.updatedTime}}</span></li>
               <li v-show="announcementList.length" class="more-bullet"><a >更多</a></li>
             </ul>
             <div v-show="announcementList.length === 0">暂无公告</div>
         </Card>
       </Col>
     </Row>-->
    <Modal v-model="modal1" :title="announcementRow.announceTitle">
      {{ announcementRow.announceContent }}
      <!--<Input v-show="isEdit" v-model="announcementRow.announceContent"  type="textarea"/>-->
      <p v-show="!isEdit">{{ announcementRow.announceContent }}</p>
      <!--<div slot="footer">
        <Button type="primary" @click="saveAnnounce">确定</Button>
        <Button type="text" v-show="isEdit" @click="delAnnounce">删除公告</Button>
      </div>-->
    </Modal>
  </div>
</template>

<style>
.echarts {
  width: 100%;
  height: 100%;
}
</style>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
import ECharts from "vue-echarts/components/ECharts";
import "echarts/lib/chart/line";
import "echarts/lib/component/polar";
import "echarts/lib/component/legend";
import api from "@/api/api";

export default {
  name: "index",
  mixins: [CommonMixin],
  components: {
    ECharts
  },
  data() {
    return {
      chartTotal: 0,
      chartAverage: 0,
      modal1: false,
      announcementRow: "",
      isEdit: false,
      columns1: [
        {
          title: "时间",
          key: "time"
        },
        {
          title: "创建总数",
          key: "createCount"
        },
        {
          title: "询价总数",
          key: "quotateCount"
        },
        {
          title: "编辑描述总数",
          key: "descriptionCount"
        },
        {
          title: "图片处理总数",
          key: "pictureCount"
        },
        {
          title: "取样总数",
          key: "sampleCount"
        }
      ],
      data1: [],
      time: "month",
      TableTimeType: "week",
      typeModel: "0",
      todoNum: 0,
      doneNum: 0,
      createNum: 0,
      payTimeArr: [], // 0已创建总数，1已询价总数，2已处理图片总数，3已处理取样总数，4已处理描述总数
      typeList: [
        {
          value: "0",
          label: "创建总数"
        },
        {
          value: "1",
          label: "询价总数"
        },
        {
          value: "2",
          label: "处理图片总数"
        },
        {
          value: "3",
          label: "处理取样总数"
        },
        {
          value: "4",
          label: "处理描述总数"
        }
      ],
      announcementList: [],
      option: {
        grid: {
          left: '3%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: ["1"]
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: [],
            type: "line",
            itemStyle: {
              normal: {
                color: "red",
                label: {
                  show: true,
                  color: "black"
                }
              }
            }
          }
        ]
      },
      chartStartTime: "",
      chartEndTime: ""
    };
  },
  created() {
    // document.title = "首页";
    this.getNum();
    this.getChartData();
    this.getTableDate();
    this.getQueryAnnounceList();
  },
  mounted() {
    let fun = () => {
      this.$refs.echartMain && this.$refs.echartMain.resize();
    }
    setTimeout(() => {
      fun();
    }, 500)
    window.addEventListener("resize", fun, false);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", fun);
    });
  },
  methods: {
    getNum() {
      let v = this;
      v.getTodoNum();
      v.getDoneNum();
      v.getCreatedNum();
      /* v.$axios.all([v.getTodoNum(), v.getDoneNum(), v.getCreatedNum()]).then((res) => {
       // v.todoNum = res[0].code === 0 ?res[0].datas :0;
       v.doneNum = res[1].code === 0 ? res[1].datas : 0;
       v.createNum = res[2].code === 0 ? res[2].datas : 0;
       }); */
    },
    getTodoNum() {
      let v = this;
      v.$axios.get(api.getTodoNumLog + "?time=1").then((res) => {
        if (res.code === 0) {
          v.todoNum = res.datas;
        }
      });
    },
    getDoneNum() {
      let v = this;
      // var end = new Date();
      // var day = new Date().getDay() || 7;
      var start = new Date(new Date().setDate(1));
      v.$axios
        .post(api.getDoneNum, {
          queryEndTime: v.format("yyyy-MM-dd"), // 结束时间,格式为YYYY-MM-dd
          queryStartTime: v.formatTime(start, "yyyy-MM-dd") // 开始时间,格式为YYYY-MM-dd
        })
        .then((res) => {
          if (res.code === 0) {
            v.doneNum = res.datas;
          }
        });
    },
    getCreatedNum() {
      let v = this;
      var start = new Date(v.timeZoomDate);
      start.setDate(1);
      return v.$axios
        .post(api.getCreatedNum, {
          queryEndTime: v.format("yyyy-MM-dd"), // 结束时间,格式为YYYY-MM-dd
          queryStartTime: v.formatTime(start, "yyyy-MM-dd") // 开始时间,格式为YYYY-MM-dd
        })
        .then((res) => {
          if (res.code === 0) {
            v.createNum = res.datas;
          }
        });
    },
    getChartData(data) {
      let v = this;
      if (data) {
        if (v.getBetweenDay(data[1], data[0]) > 31) {
          v.$msg.error("自定义最长时间间隔31天");
          return;
        } else {
          v.chartStartTime = v.formatTime(data[0], "yyyy-MM-dd");
          v.chartEndTime = v.formatTime(data[1], "yyyy-MM-dd");
        }
      } else if (v.time === "month") {
        v.chartEndTime = v.format("yyyy-MM-dd");
        v.chartStartTime = v.formatTime(
          new Date(v.chartEndTime).getTime() - 60 * 60 * 1000 * 24 * 30,
          "yyyy-MM-dd"
        );
      } else if (v.time === "year") {
        v.chartEndTime = v.format("yyyy-MM-dd");
        v.chartStartTime = v.formatTime(
          new Date(new Date().getTime() - 60 * 60 * 1000 * 24 * 365),
          "yyyy-MM-dd"
        );
      }
      v.$axios
        .post(api.getChartData, {
          dataType: v.typeModel,
          queryStartTime: v.chartStartTime, // 开始时间，格式为YYYY-MM-dd
          queryEndTime: v.chartEndTime // 结束时间，格式为YYYY-MM-dd
        })
        .then((res) => {
          if (res.code === 0 && res.datas.length) {
            let series = [];
            let data = [];
            res.datas.forEach((item) => {
              if (item) {
                series.push(item.count);
                data.push(item.time);
              }
            });
            v.chartTotal = series.reduce((a, b) => {
              return a + b;
            }, 0);
            v.chartAverage = (v.chartTotal / series.length).toFixed(1);
            v.option.xAxis.data = data;
            v.option.series[0].data = series;
          }
        });
    },
    getQueryAnnounceList() {
      let v = this;
      v.$axios
        .post(api.queryAnnounceList, {
          pageNum: 1, // 第几页
          pageSize: 5, // 每页条数
          queryStartTime: "2018-01-01 00:00:00", // 查询开始时间，必需，格式为yyyy-MM-dd HH:mm:ss
          queryEndTime: v.getUniversalTime(new Date().getTime(), "fulltime") // 查询结束时间，必需，格式为yyyy-MM-dd HH:mm:ss
        })
        .then((res) => {
          if (res.code === 0) {
            v.announcementList =
              res.datas.announceList === null ? [] : res.datas.announceList;
            v.isEdit = res.datas.editable === 1;
          }
        })
        .catch(() => { });
    },
    getTableDate() {
      let v = this;
      let start = "";
      let end = new Date();
      if (v.TableTimeType === "week") {
        var day = new Date().getDay() || 7;
        start = v.formatTime(
          new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1 - day),
          "yyyy-MM-dd"
        );
      } else if (v.TableTimeType === "month") {
        start = v.formatTime(new Date().setDate(1), "yyyy-MM-dd");
      } else {
        start = v.formatTime(
          new Date(new Date().setMonth(0)).setDate(1),
          "yyyy-MM-dd"
        );
      }
      v.$axios
        .post(api.getReportList, {
          queryStartTime: start, // 开始时间，格式为YYYY-MM-dd
          queryEndTime: v.formatTime(end, "yyyy-MM-dd") // 结束时间，格式为YYYY-MM-dd
        })
        .then((res) => {
          if (res.code === 0) {
            v.data1 = res.datas;
          }
        })
        .catch(() => { });
    },
    openAnnouncement(item) {
      let v = this;
      v.modal1 = true;
      v.announcementRow = item;
    },
    saveAnnounce() {
      let v = this;
      if (v.isEdit) {
        v.$axios
          .post(api.saveAnnounce, {
            announceContent: v.announcementRow.announceContent, // 公告内容，必需
            announceId: v.announcementRow.announceId, // 公告ID，编辑时必需
            announceTitle: v.announcementRow.announceTitle // 公告标题，必需
          })
          .then((res) => {
            v.modal1 = false;
            if (res.code === 0) {
              v.$msg.success("保存成功");
            }
          })
          .catch(() => { });
      } else {
        v.modal1 = false;
      }
    },
    delAnnounce() {
      let v = this;
      v.$axios
        .post(api.deleteAnnounceByIds, [v.announcementRow.announceId])
        .then((res) => {
          v.modal1 = false;
          if (res.code === 0) {
            v.$msg.success("删除成功");
            v.getQueryAnnounceList();
          }
        })
        .catch(() => { });
    }
  },
  computed: {}
};
</script>

<style scoped>
.connt {
  font-size: 26px;
  font-weight: bold;
}

.bulletinBoard {
  display: flex;
  margin: 8px;
}

.bulletinBoard .time,
.bulletinBoard .name {
  width: 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bulletinBoard .time {
  padding-left: 10px;
}

.more-bullet {
  display: flex;
  flex-direction: row-reverse;
}

.tool-img {
  vertical-align: text-bottom;
}
</style>
