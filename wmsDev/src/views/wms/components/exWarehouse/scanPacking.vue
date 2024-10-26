<template>
  <div class="scanPacking">
    <!--头部筛选区域-->
    <div class="searchMain mb10">
      <Form ref="pageParams" :model="pageParams" :label-width="90">
        <dyt-filter>
          <Form-item label="箱号/袋号：" prop="bussinessId">
            <dyt-input v-model.trim="pageParams.bussinessId" :element-id="'bussinessId'"
              @on-keyup.13="changeEnterKey(1)"></dyt-input>
          </Form-item>
          <Form-item label="扫描出库单号/运单号：" prop="waybillNo" :label-width="140">
            <dyt-input v-model.trim="pageParams.waybillNo" :element-id="'deliveryOrder'"
              @on-keyup.13="changeEnterKey(2)"></dyt-input>
          </Form-item>
          <div slot="operation">
            <Button type="primary" @click="printCaseMark">打印箱唛</Button>
            <Button type="primary" style="margin-left: 10px;" @click="endPacking">结束装箱</Button>
          </div>
        </dyt-filter>
      </Form>
    </div>
    <!--列表区域-->
    <Card :bordered="false">
      <h2 slot="title" class="title_box">已扫描出库单</h2>
      <Table highlight-row border :loading="TableLoading" :height="tableHeight" max-height="650" :columns="tableColumns"
        :data="tableData"></Table>
    </Card>
    <!--打印箱唛-->
    <printCaseMarkModal v-if="printTalg" :wmsPickupOrderId="wmsPickupOrderId" @closeBtn="closeBtn"></printCaseMarkModal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import printCaseMarkModal from './printCaseMarkModal';

export default {
  name: 'scanPacking',
  mixins: [Mixin],
  props: {
    pickupOrderNumber: {
      type: String,
      default: null
    },
    type: { // 装箱的标记
      type: String,
      default: 'scanning'
    }
  },
  data () {
    let v = this;
    return {
      pageParams: {
        bussinessId: '',
        waybillNo: ''
      },
      tableColumns: [
        {
          title: '出库单号',
          key: 'packageCode',
          align: 'center'
        },
        {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center'
        },
        {
          title: '操作',
          key: 'options',
          align: 'center',
          width: 100,
          render (h, params) {
            return h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              on: {
                click: () => {
                  v.deletePackage(params.row.wmsPickupOrderDetailId);
                }
              }
            }, '移除');
          }
        }
      ],
      tableData: [],
      wmsPickupOrderId: null,
      printTalg: false
    };
  },
  computed: {
    tableHeight () {
      return this.getTableHeight(315);
    }
  },
  created () {
    this.Packing();
  },
  methods: {
    // 结束装箱
    endPacking () {
      let v = this;
      if (v.pageParams.bussinessId !== '') {
        if (v.wmsPickupOrderId !== null) {
          v.axios.put(api.put_wmsPickupOrder_overPickupOrder + `${v.wmsPickupOrderId}`).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功！');
              let obj = {
                value: 'packingManage',
                type: 'scanning'
              };
              v.$emit('changeTabs', obj);
            }
          });
        } else {
          v.$Message.warning('请先扫描箱号/袋号！');
          return false;
        }
      } else {
        v.$Message.warning('请输入箱号/袋号！');
        return false;
      }
    },
    // 回车键扫描
    changeEnterKey (value) {
      let v = this;
      // 箱号/袋号
      if (value === 1) {
        if (v.type === 'scanning' || v.type === 'adding') {
          if (v.pageParams.bussinessId !== '') {
            v.axios.get(api.get_wmsPickupOrder + `${v.pageParams.bussinessId}`).then(response => {
              if (response.data.code === 0) {
                let data = response.data.datas;
                v.wmsPickupOrderId = data.wmsPickupOrderId;
                if (data.wmsPickupOrderDetails) {
                  v.tableData = data.wmsPickupOrderDetails;
                }
              }
            });
          } else {
            v.$Message.warning('请输入箱号/袋号！');
            return false;
          }
        }
      } else if (value === 2) {
        // 扫描出库单号/运单号
        if (this.pageParams.waybillNo !== '') {
          v.axios.post(api.post_wmsPickupOrderDetail_scanPackaging +
            `${v.pageParams.waybillNo}?wmsPickupOrderId=${v.wmsPickupOrderId}`).then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data) {
                v.tableData.push(data);
              }
            }
          });
        } else {
          v.$Message.warning('请输入出库单号/运单号！');
          return false;
        }
      }
    },
    // 装箱
    Packing () {
      let v = this;
      // 继续装箱
      if (v.type === 'continue') {
        v.axios.get(api.get_wmsPickupOrder_continuePickupOrder + `${v.pickupOrderNumber}`).then(response => {
          v.TableLoading = false;
          if (response.data.code === 0) {
            v.pageParams.bussinessId = response.data.datas.pickupOrderNumber;
            v.wmsPickupOrderId = response.data.datas.wmsPickupOrderId;
            v.tableData = response.data.datas.wmsPickupOrderDetails;
            v.$nextTick(() => {
              v.getFocus('deliveryOrder');
            });
          }
        });
      } else if (v.type === 'adding') {
        // 新增箱/袋
        v.axios.post(api.post_wmsPickupOrder).then(response => {
          v.TableLoading = false;
          if (response.data.code === 0) {
            v.pageParams.bussinessId = response.data.datas.pickupOrderNumber;
            v.wmsPickupOrderId = response.data.datas.wmsPickupOrderId;
            v.$nextTick(() => {
              v.getFocus('bussinessId');
            });
          }
        });
      }
    },
    // 删除已扫描的出库单
    deletePackage (wmsPickupOrderDetailId) {
      let v = this;
      v.$Modal.confirm({
        title: '是否要删除当前出库单号？',
        onOk: () => {
          v.axios.delete(api.delete_wmsPickupOrderDetail_deletePackage + `${wmsPickupOrderDetailId}`).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功！');
              v.Packing();
            }
          });
        },
        onCancel: () => {
        }
      });
    },
    // 关闭打印箱唛的弹窗
    closeBtn (value) {
      this.printTalg = value;
    },
    // 打印箱唛
    printCaseMark () {
      if (this.pageParams.bussinessId !== '') {
        if (this.wmsPickupOrderId !== '') {
          this.printTalg = true;
        } else {
          this.$Message.warning('请先扫描箱号/袋号！');
          return false;
        }
      } else {
        this.$Message.warning('请输入箱号/袋号！');
        return false;
      }
    }
  },
  components: {
    printCaseMarkModal
  }
};
</script>

<style scoped>
.title_box {
  font-size: 17px;
}
</style>
