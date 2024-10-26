<template >
  <div >
    <div class="usersFilter" >
      <div >
        <div class="card-content" >
          <div class="pt10" >
            <Form
                :model="pageParams" label-position="left" :label-width="100" >
              <Row >
                <Col :span="8" >
                  <div class="filterItem" >
                    <!--店铺列表-->
                    <Form-item
                        label="店铺" prop="saleAccountIds" >
                      <dyt-select
                          v-model="pageParams.saleAccountId" filterable multiple placeholder="请选择店铺，可输入搜索" > <Option
                          v-for="(item,index) in shopList"
                          :key="index"
                          :value="item.saleAccountId"
                          :v="item.saleAccountId" >{{ item.accountCode }}</Option> </dyt-select >
                    </Form-item >
                  </div >
                </Col >
                <Col
                    :span="8" :offset="1" >
                  <div class="filterItem" >
                    <Form-item label="SKU/产品名称" >
                      <Input
                          v-model="pageParams.searchValue" placeholder="请输入SKU或产品名称" ></Input >
                    </Form-item >
                  </div >
                </Col >
              </Row >
            </Form >
          </div >
          <div class="filterItem filterConfirm" >
            <Button
                type="primary" @click="search" icon="search" size="small" style="marginLeft:40px;" >查询 </Button >
          </div >
        </div >
      </div >
    </div >
    <div class="usersFilter mb10 mt10" >
      <Button
          type="primary" @click="modal1 = true" >新增对照 </Button >
      <Button
          type="error" class="ml10" >批量删除 </Button >
    </div >
    <div class="usersFilter" >
      <!--带电资质列表-->
      <Table
          highlight-row border @on-selection-change="checkDataMt" :columns="columns1" :data="data1" ></Table >
      <div class="table-page" >
        <div class="table-page-right" >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray"
              :current="curPage" ></Page >
        </div >
      </div >
    </div >
    <!--新增带电资质对照-->
    <Modal
        v-model="modal1" title="新增带电资质对照" width="1100" >
      <Form :label-width="120" >
        <Row
            v-for="(item,index) in addCQList" :key="index" >
          <Col span="7" >
            <FormItem label="ebay账号：" >
              <dyt-select
                  v-model="item.saleAccountId"
                  filterable
                  placeholder="请选择店铺，可输入搜索"
                  @on-change="addQualificationChange($event,index)" > <Option
                  v-for="(item,index) in shopList"
                  :key="index"
                  :value="item.saleAccountId"
                  :v="item.saleAccountId" >{{ item.accountCode }}</Option> </dyt-select >
            </FormItem >
          </Col >
          <Col
              span="7" offset="1" >
            <FormItem label="带电资质类型：" >
              <dyt-select
                  v-model="item.qualification" filterable multiple placeholder="请选择店铺，可输入搜索" > <Option
                  v-for="(item,index) in item.qualificationList"
                  :key="index"
                  :value="item.saleAccountId"
                  :v="item.saleAccountId" >{{ item.accountCode }}</Option> </dyt-select >
            </FormItem >
          </Col >
          <Col span="3" >
            <Icon
                type="md-add" @click="pushCQ" v-if="index === 0" />
            <Icon
                type="md-close" v-if="index > 0" />
          </Col >
        </Row >
        <Button
            @click="openProductFn" class="mb10" type="primary" >新增货品 </Button >
        <Table
            highlight-row border :columns="columns2" :data="addProductValue" ></Table >
      </Form >
    </Modal >
    <matchingGoodsModal
        ref="matchingGoodsModal"
        :showNumber="false"
        :prefix="'/setting-service'"
        :choseData="addProductValue"
        @saveHandel="addProductSave" ></matchingGoodsModal >
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';

export default {
  name: 'chargedQualification',
  mixins: [Mixin],
  components: {
    matchingGoodsModal
  },
  data () {
    let v = this;
    return {
      addProductValue: [],
      checkData: [], // 选择的数据
      shopList: [],
      addCQList: [
        {
          saleAccountId: '',
          qualification: '',
          qualificationList: []
        }
      ],
      columns1: [
        {
          title: '店铺',
          key: 'email',
          align: 'center',
          minWidth: 220
        }, {
          title: '带电类型',
          key: 'email',
          align: 'center',
          minWidth: 220
        }, {
          title: '带电资质类型',
          key: 'email',
          align: 'center',
          minWidth: 220
        }, {
          title: '图片',
          key: 'email',
          align: 'center',
          minWidth: 220
        }, {
          title: 'SKU/产品名称',
          key: 'email',
          align: 'center',
          minWidth: 220
        }, {
          title: '操作',
          key: 'action',
          width: 180,
          render (h, params) {
            return h('Button', {
              props: {
                size: 'small',
                type: 'error'
              },
              on: {
                'click' () {
                  v.delQualification(params.row.carrierGoodsBatteryId);
                }
              }
            }, '删除');
          }
        }
      ],
      data1: [],
      columns2: [
        {
          title: '店铺'
        }, {
          title: '带电资质'
        }, {
          title: '带电资质类型'
        }, {
          title: '商品图片',
          key: 'productPic',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            let productPic = null;
            let goodsImageMap = self.goodsImageMap;
            if (goodsImageMap && goodsImageMap[params.row.productGoodsId]) {
              productPic = goodsImageMap[params.row.productGoodsId][0];
            }
            return v.tableImg(h, params, '', productPic);
          }
        }, {
          title: 'SKU/产品名称'
        }, {
          title: '操作',
          width: 80
        }
      ],
      data2: [],
      modal1: false,
      pageParamsStatus: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        'carrierCode': 'speedpak', // 物流商编码 edis传 speedpak ,
        'pageNum': 0,
        'pageSize': 10,
        'saleAccountId': '',
        'searchValue': ''
      }
    };
  },
  created () {
    this.getShop();
  },
  props: {},
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  methods: {
    pushCQ () {
      this.addCQList.push({
        saleAccountId: '',
        qualification: '',
        qualificationList: []
      });
    },
    openProductFn () {
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
    },
    addProductSave (data) {
      this.addProductValue = data;
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
    },
    getShop () {
      let v = this;
      // 查询所有店铺  目前平台只有ebay
      let newArr = ['ebay'];
      v.axios.post(api.get_shopList + '?checkUser=false&time=' + new Date().getTime(), JSON.stringify(newArr)).then(response => {
        if (response.data.code === 0) {
          v.shopList = response.data.datas;
        }
      });
    },
    search () {
      let v = this;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    getList () {
      let v = this;
      // 查询列表数据
      v.axios.post(api.get_carrierGoodsBattery, v.pageParams).then(response => {
        if (response.data.code === 0) {
          v.data1 = response.data.datas;
        }
      });
    },
    delQualification ({ id, type = 'single' }) {
      let v = this;
      // 删除资质 type single 单个删除  batch 批量删除
      // 查询列表数据
      if (type === 'single') {
        v.axios.delete(api.del_carrierGoodsBattery + 'id').then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.search();
          }
        });
      } else {
        if (v.checkData.length === 0) {
          v.$Message.info('未选择数据');
          return;
        }
        v.axios.post(api.del_carrierGoodsBatteryBatch + '?carrierGoodsBatteryIds=' + JSON.stringify(v.checkData.map(i => i.carrierGoodsBatteryId))).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.search();
          }
        });
      }
    },
    addQualificationChange (value, index) {
      if (this.$common.isEmpty(value)) {
        this.addCQList[index].qualificationList = [];
        return;
      }
      this.axios.get(api.get_queryCarrierBattery + '?carrierCode=speedpak&account=' + value).then(response => {
        if (response.data.code === 0) {
          this.addCQList[index].qualificationList = response.data.datas.filter(f => {
            return !this.$common.isEmpty(f.saleAccountId);
          });
        }
      });
    },
    checkDataMt (data) {
      this.checkData = data;
    }
  }
};
</script >

<style scoped >

</style >
