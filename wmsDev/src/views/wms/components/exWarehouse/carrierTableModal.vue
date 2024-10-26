<template>
  <Modal v-model="carrierTableModal" title="承运商" width="800" :mask-closable="false" class-name="carrierTableModalStyle">
    <div class="carrier_table_filter">
      <span>承运商名称：</span>
      <Input v-model="carrierTableParams.nameCn" placeholder="请输入承运商名称" style="width: 250px" @on-enter="inputEnter" />
    </div>
    <div class="normalTop">
      <Table highlight-row border :loading="TableLoading" :columns="carrierTableColumns" :data="carrierTableData">
      </Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="carrierTotal" @on-change="carrierChangePage" show-total :page-size="carrierTableParams.pageSize"
            show-elevator :current="carrierCurPage" show-sizer @on-page-size-change="carrierChangePageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <div slot="footer" style="text-align: center; margin-top: 25px;">
      <Button @click="carrierTableModal = false">关闭</Button>
    </div>
  </Modal>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import api from '@/api/api';

export default {
  name: 'carrierTableModal',
  mixins: [Mixin],
  data() {
    let _this = this;
    return {
      carrierTableModal: false,
      carrierTableParams: {
        nameCn: '',
        trackingMoreCarrierCodeIds: [],
        type: null,
        pageNum: 1,
        pageSize: 10
      },
      carrierTotalPage: 0,
      carrierTotal: 0,
      carrierCurPage: 1,
      carrierTableColumns: [
        {
          title: '承运人',
          key: 'name',
          align: 'center'
        },
        {
          title: '承运商名称',
          key: 'nameCn',
          align: 'center'
        },
        {
          title: '承运人电话',
          key: 'phone',
          align: 'center'
        },
        {
          title: '是否可用',
          key: 'isEnabled',
          align: 'center',
          render: (h, params) => {
            let txt = params.row.isEnabled === '1'
              ? '可用'
              : '不可用';
            return h('span', txt);
          }
        },
        {
          title: '操作',
          key: 'options',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('a', {
              style: {
                display: 'inline-block',
                textDecoration: 'none',
                width: '100%',
                height: '100%'
              },
              on: {
                click: function () {
                  // let code = params.row.code;
                  // let carrierName = params.row.nameCn;
                  _this.$emit('success', params.row)
                  _this.carrierTableModal = false;
                  /* if (v.carrierStatusTalg === 'add') {
                    v.carrierCode = code;
                    v.carrierName = carrierName;
                    v.carrierTableModal = false;
                  } else if (v.carrierStatusTalg === 'edit') {
                    v.carrierCode = code;
                    v.carrierName = carrierName;
                    v.carrierTableModal = false;
                  } */
                }
              }
            }, '选取');
          }
        }
      ],
      carrierTableData: [],
    };
  },
  created() {

  },
  props: {},
  watch: {},
  methods: {
    // 查询承运商
    inputEnter() {
      if (this.carrierTableParams.nameCn !== '') {
        this.getSystemTrackingMoreCarrierData();
      } else {
        this.$Message.warning('承运商的名称不能为空!');
        return false;
      }
    },
    open() {
      this.carrierTableParams.nameCn = '';
      this.carrierTableParams.trackingMoreCarrierCodeIds = [];
      this.carrierTableParams.type = null;
      this.carrierTableParams.pageNum = 1;
      this.carrierTableParams.pageSize = 10;
      this.carrierStatusTalg = '';
      this.carrierTableModal = true;
      this.getSystemTrackingMoreCarrierData();
    },
    // 承运商的分页切换
    carrierChangePage(page) {
      let v = this;
      v.TableLoading = true;
      v.carrierTableParams.pageNum = page;
      v.curPage = page;
      v.getSystemTrackingMoreCarrierData();
    },
    carrierChangePageSize(pageSize, plat) {
      this.setPageSizeCache(pageSize);
      this.carrierTableParams.pageSize = pageSize;
      this.getSystemTrackingMoreCarrierData();
    },
    // 获取承运商的数据
    getSystemTrackingMoreCarrierData() {
      this.TableLoading = true;
      this.axios.post(api.post_systemTrackingMoreCarrier_query, this.carrierTableParams).then((res) => {
        this.TableLoading = false;
        if (res.data.code === 0) {
          this.carrierTableModal = true;
          let data = res.data.datas;
          this.carrierTotal = data.total;
          this.carrierTableData = data.list;
        }
      });
    },
  }
};
</script>

<style scoped>

</style>
