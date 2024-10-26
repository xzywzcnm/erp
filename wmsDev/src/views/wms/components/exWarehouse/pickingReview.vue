<template>
  <div class="sorting">
    <!-- 扫描 -->
    <div class="card-container">
      <div class="card-content">
        <Row justify="center" align="bottom">
          <Col :span="13">
          <div style="paddingtop: 15px">
            扫描/录入拣货单单号开始拣货复核
            <Input v-model.trim="pickList" style="width: 300px; marginleft: 15px" autofocus ref="packListIpt"
              @on-enter="pickStart"></Input>
          </div>
          </Col>
          <!--          <Col :span="5" offset="1" style="height: 47px">-->
          <!--            <Row style="marginTop:12px;">-->
          <!--              <Col :span="13">本月包裹数：</Col>-->
          <!--              <Col :span="11">{{ packingPickingPackageCount.monthCount }}</Col>-->
          <!--            </Row>-->
          <!--            <Row>-->
          <!--              <Col :span="13">今日包裹数：</Col>-->
          <!--              <Col :span="11">{{ packingPickingPackageCount.todayCount }}</Col>-->
          <!--            </Row>-->
          <!--          </Col>-->
          <!--          <Col :span="5">-->
          <!--            <Row style="marginTop:29px;">-->
          <!--              <Col :span="13">包裹总数：</Col>-->
          <!--              <Col :span="11">{{ packingPickingPackageCount.yearCount }}</Col>-->
          <!--            </Row>-->
          <!--          </Col>-->
        </Row>
      </div>
    </div>
    <h2>正在进行的拣货复核</h2>
    <!-- 表格 -->
    <div class="normalTop">
      <Table border :loading="loading" :height="tableHeight" :columns="packingColumn" :data="packingData"></Table>
    </div>
    <!-- 拣货单异常 -->
    <Modal v-if="pickingListStatus" v-model="pickingListModelStatus" width="500" title="开启拣货复核异常">
      <div style="padding: 10px 20px">
        <Row>
          <Col span="6">
          <div>
            <Icon type="md-information-circle" color="#2b85e4" style="font-size: 50px"></Icon>
          </div>
          </Col>
          <!-- <Col span="16" style="font-size:16px" v-if="errorCode === 116105">{{ '您扫描或输入的拣货单【 {pickList} 】未打印，不能开始拣货复核'.replace('{pickList}', pickList)}}</Col> -->
          <Col span="16" style="font-size: 16px" v-if="errorCode === 116103">{{
            "您扫描或输入的拣货单【 {pickList} 】已完成".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === packWorking">{{
            "您扫描或输入的拣货单【 {pickList} 】不存在或状态已改变,请刷新后重试".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116106">{{
            "您扫描或输入的拣货单【 {pickList} 】下不存在出库单".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116107">{{
            "您扫描或输入的拣货单【 {pickList} 】下不存在有效出库单".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <!-- <Col span="16" style="font-size:16px" v-else-if="errorCode === 116108">{{ '您扫描或输入的拣货单【 {pickList} 】下存在商品备注'.replace('{pickList}', pickList)}}</Col> -->
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116109">{{
            "您扫描或输入的拣货单【 {pickList} 】下存在普通打印出库单".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116110">{{
            "您扫描或输入的拣货单【 {pickList} 】未进行多品分拣".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116115">{{
            "您扫描或输入的拣货单【 {pickList} 】下存在出库单未下发物流商成功".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else-if="errorCode === 116011">{{
            "您扫描或输入的拣货单【 {pickList} 】拣货未完成".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
          <Col span="16" style="font-size: 16px" v-else>{{
            "您扫描或输入的拣货单【 {pickList} 】在系统中未找到，请确认拣货单是否已被删除".replace(
              "{pickList}",
              packingText
            )
          }}
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button style="marginright: 210px" @click="cancel">我知道了</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";

export default {
  mixins: [Mixin, tableMixin],
  data() {
    return {
      pickList: null, // 拣货单单号
      loading: false,
      packingPickingPackageCount: {
        monthCount: 0,
        todayCount: 0,
        yearCount: 0,
      },
      packingData: [],
      packingColumn: [
        {
          title: "NO",
          width: 60,
          align: "center",
          key: "index",
          fixed: "left",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "拣货单号",
          key: "pickingGoodsNo",
          align: "center",
        },
        {
          title: "拣货单类型",
          key: "packageGoodsType",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.packageGoodsType === "MM" ? "多品" : "单品"
            );
          },
        },
        {
          title: "作业开始时间",
          key: "scanStartTime",
          align: "center",
          render: (h, params) => {
            return h("div", this.$uDate.dealTime(params.row.scanStartTime));
          },
        },
        {
          title: "时长",
          key: "workTime",
          align: "center",
        },
        {
          title: "包裹进度",
          key: "packageProgress",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.packageNum + "/" + params.row.totalPackageNum
            );
          },
        },
        {
          title: "货品进度",
          key: "productProgress",
          align: "center",
          render: (h, params) => {
            return h(
              "span",
              params.row.goodsNum + "/" + params.row.totalGoodsNum
            );
          },
        },
        {
          title: "小组成员",
          key: "userId",
          align: "center",
          render: (h, params) => {
            let list = this.$store.state.userInfoList;
            if (list && list[params.row.userId]) {
              return h("span", list[params.row.userId].userName);
            }
          },
        },
      ],
      pickingListStatus: false,
      pickingListModelStatus: false,
      errorCode: null,
      packingText: "",
    };
  },
  methods: {
    getPickType(pickType) {
      let pickTypeObj = {
        SS: "单品单件",
        SM: "单品多件",
        MM: "多品",
      };
      if (pickType !== null) {
        return pickTypeObj[pickType];
      } else {
        return "";
      }
    },
    pickStart() {
      // 开始拣货复核
      let v = this;
      if (v.pickList !== null && v.pickList !== "") {
        v.$Spin.show();
        v.axios
          .put(
            api.get_scanPickingGoodsNo +
            "/" +
            v.pickList +
            "?warehouseId=" +
            v.getWarehouseId()
          )
          .then((response) => {
            v.$Spin.hide();
            v.packingText = v.pickList;
            if (response.data.code === 0) {
              // let data = response.data.datas;
              // console.log(data);
              // window.location.href = '//' + window.location.host + '/wms-service/packingWork.html';
              window.location.href = `//${window.location.host
                }/wms-service/packingWork.html?warehouseId=${v.getWarehouseId()}`;
            }
            v.pickList = "";
          });
      } else {
        v.pickingListModelStatus = false;
      }
    },
    cancel() {
      let v = this;
      v.pickingListModelStatus = false;
      v.$nextTick(() => {
        v.$refs.packListIpt.focus();
      });
    },
    hasPicking() {
      // 判断是否有正在处理的拣货复核
      let v = this;
      v.axios.get(api.get_getScanningPickingGoods).then((response) => {
        if (response.data.code === 0) {
          let warehouseId = response.data.datas.warehouseId;
          if (warehouseId === v.getWarehouseId()) {
            this.$Modal.confirm({
              title: "温馨提示",
              content: "存在正在进行的拣货复核，是否立即进入",
              onOk() {
                v.pickList = response.data.datas.pickingGoodsNo;
                v.pickStart();
              },
            });
          } else {
            let warehouse = this.$store.state.warehouseList.filter(
              (i) => i.warehouseId === warehouseId
            );
            let warehouseName = warehouse ? warehouse[0].warehouseName : "";
            if (warehouseName) {
              this.$Modal.confirm({
                title: "温馨提示",
                content:
                  "仓库" +
                  "[" +
                  warehouseName +
                  "]" +
                  "存在正在进行的拣货复核，是否立即跳转" +
                  "仓库" +
                  "[" +
                  warehouseName +
                  "]",
                onOk() {
                  let arr = [...v.$store.state.warehouseList];
                  let wareItem = {};
                  arr.forEach((val) => {
                    if (val.warehouseId === warehouseId) {
                      val.check = true;
                      wareItem = val;
                    } else {
                      val.check = false;
                    }
                  });
                  v.$emit(
                    "setWarehouseOverseaType",
                    wareItem.warehouseOverseaType
                  );
                  // v.$parent.$refs['leftComponent'].warehouseOverseaType = wareItem.warehouseOverseaType;
                  sessionStorage.setItem("refreshLeft", true);
                  v.$store.commit("warehouseList", arr);
                  v.$store.commit("warehouseId", wareItem.warehouseId);
                  // localStorage.setItem('warehouseId', wareItem.warehouseId);
                  window.location.href = `#/packWorking?warehouseId=${wareItem.warehouseId}`;
                  window.location.reload();
                  // window.location.href = '#/index';
                  v.$store.commit("active", "8000-8001");
                  // 处理切换仓库刷新角标的问题
                  v.$store.commit("badgeStatus", true);
                },
              });
            } else {
              v.$Message.error("仓库ID错误");
            }
          }
        }
      });
    },
    getList() {
      let v = this;
      if (v.getPermission("wmsPickingGoods_getPackingPickingGoodsInfo")) {
        v.axios
          .get(
            api.get_packingPickingGoodsInfo +
            "?warehouseId=" +
            v.getWarehouseId()
          )
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data.isPacking) {
                // 跳转到拣货复核页面
                window.location.href =
                  "//" + window.location.host + "/wms-service/packingWork.html";
              }
              v.packingData = data.packingPickingGoods;
              if (data.packingPickingPackageCount) {
                v.packingPickingPackageCount = data.packingPickingPackageCount;
              }
            }
          });
        // let name = v.$store.state.userInfo.userName;
        // localStorage.setItem('userName', JSON.stringify(name));
        // let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
        // localStorage.setItem('filenodeViewTargetUrl', JSON.stringify(filenodeViewTargetUrl));
      } else {
        v.gotoError(); // 无权限
      }
    },
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(480);
    },
  },
  created() {
    let v = this;
    v.hasPicking();
    v.getUserMesCommon();
    v.getList();
  },
  updated: function () {
    this.$nextTick(() => {
      this.$refs.packListIpt.focus();
      // Code that will run only after the
      // entire view has been re-rendered
    });
  },
};
</script>
