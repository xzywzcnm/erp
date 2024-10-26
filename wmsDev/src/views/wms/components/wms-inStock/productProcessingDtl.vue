<template>
  <div>
    <div class="backList">
      <Icon type="ios-arrow-back"></Icon>
      <a
        href="javascript:;" style="margin-left: 5px" @click="$parent.workShow = 'list'">返回列表</a>
    </div>
    <div v-if="!startProcess">
      <Card dis-hover :bordered="false" class="baseInfo">
        <div slot="title">加工成品</div>
        <div>
          <Button type="primary" @click="selectOneProduct">选择产品</Button>
        </div>
        <div class="clear">
          <Form inline :label-width="100" style="width: 500px;margin-top: 20px" class="fl">
            <FormItem label="SKU：">
              <span>{{ selectRow.goodsSku }}</span>
            </FormItem>
            <FormItem label="商品中文名称：">
              <span>{{ selectRow.goodsCnDesc }}</span>
            </FormItem>
            <FormItem label="商品英文名称：">
              <span>{{ selectRow.goodsEnDesc }}</span>
            </FormItem>
            <br/>
            <FormItem label="加工数量：">
              <InputNumber v-model="processMount" :min="1" :precision="0" @on-change="changeNum"></InputNumber>
            </FormItem>
          </Form>
          <div>
            <img
              :src="$store.state.imgUrlPrefix + selectRow.goodsUrl"
              alt=""
              style="margin-top: 20px;max-width: 200px"/>
          </div>
        </div>
      </Card>
      <Card dis-hover :bordered="false" class="baseInfo">
        <div slot="title">加工原料商品</div>
        <!--<div><Button type='primary' @click='selectMoreProduct'>选择产品</Button><Button type='error' style='margin-left: 10px' @click='data=[]'>移除</Button></div>-->
        <Table
          highlight-row
          border
          :columns="columns"
          :loading="TableLoading"
          :data="data"
          style="margin-top: 10px">
        </Table>
      </Card>
      <Card dis-hover :bordered="false" class="baseInfo">
        <div slot="title">加工费用</div>
        <Form inline :label-width="180" style="">
          <FormItem label="材料费(不含物料) CNY：">
            <InputNumber v-model="materialFee" :min="0"></InputNumber>
          </FormItem>
          <FormItem label="人工费 CNY：">
            <InputNumber v-model="laborFee" :min="0"></InputNumber>
          </FormItem>
        </Form>
      </Card>
      <div style="text-align: center;padding-top: 20px">
        <Button type="primary" @click="createList">{{ type === 'add' ? '创建加工单' : '保存' }}</Button>
      </div>
    </div>
    <div v-if="addProductModal">
      <Modal class="addProductModal" v-model="addProductModal" title="添加产品">
        <!--singleExclude单个排除-->
        <pdtProcessDtlAddPdt
          :from="bool"
          :selectGoodsList="data"
          :singleExclude="selectMoreRow"
          :moreExclude="selectRow"
          :sltOneOrMore="sltOneOrMore"
          @selectOver="selectOver"
          @selectMoreOver="selectMoreOver"></pdtProcessDtlAddPdt>
      </Modal>
    </div>
  </div>
</template>

<script>
import pdtProcessDtlAddPdt from './pdtProcessDtlAddPdt';
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';

export default {
  props: ['type', 'apiParams'],
  components: {
    pdtProcessDtlAddPdt
  },
  mixins: [common],
  data () {
    return {
      TableLoading: false,
      startProcess: false,
      sltOneOrMore: 'one',
      addProductModal: false,
      workWare: '',
      workWareList: [],
      processMount: 1,
      bool: false,
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 120,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.sku || params.row.goodsSku || '');
          }
        }, {
          title: '中文描述',
          key: 'cnName',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.cnName || params.row.goodsCnDesc || '');
          }
        }, {
          title: '英文描述',
          key: 'enName',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.enName || params.row.goodsEnDesc || '');
          }
        }, {
          title: '重量',
          key: 'weight',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.weight || params.row.goodsWeight || '');
          }
        }, {
          title: '尺寸(长*宽*高)',
          key: 'inventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('span', (params.row.goodsLength || params.row.length || 0) + '*' + (params.row.goodsWidth || params.row.width || 0) + '*' + (params.row.goodsHeight || params.row.height || 0));
          }
        }, // {
        //   title: '源数据',
        //   key: 'quantity',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('div', params.row.quantity);
        //   }
        // },
        {
          title: '数量',
          key: 'quantity',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.number || params.row.needNumber || '');
          }
        }
      ],
      data: [],
      selectRow: '',
      selectMoreRow: '',
      materialFee: '',
      laborFee: '',
      detailObj: '',
      wareId: this.getWarehouseId()
    };
  },
  created () {
    if (this.type === 'edit') {
      // 查看编辑
      this.TableLoading = true;
      this.axios.get(api.workingById + '?workingId=' + this.apiParams).then(res => {
        this.TableLoading = false;
        if (res.data.code === 0) {
          this.detailObj = res.data.datas;
          this.selectRow = {
            goodsSku: this.detailObj.finishedProductGoodsSku,
            goodsEnDesc: this.detailObj.goodsEnDesc,
            goodsCnDesc: this.detailObj.goodsCnDesc,
            productGoodsId: this.detailObj.productGoodsId
          };
          this.processMount = this.detailObj.workingNumber;
          this.laborFee = this.detailObj.laborFee;
          this.materialFee = this.detailObj.materialFee;
          this.axios.post(api.workingDetail, {
            workingNo: this.detailObj.workingNo
          }).then(res => {
            if (res.data.code === 0) {
              let list = res.data.datas.list;
              list.forEach(val => {
                val.goodsUrl = val.goodsImgUrl;
              });
              this.data = list;
            }
          });
        }
      });
    } else {
    }
  },
  methods: {
    selectOver (selectRow) {
      this.selectRow = selectRow;
      // 获取产品原料列表信息
      this.TableLoading = true;
      this.axios.get(api.getProductMaterial + '?productGoodsId=' + selectRow.productGoodsId).then(res => {
        this.TableLoading = false;
        if (res.data.code === 0) {
          // this.data = res.data.datas;
          let data = res.data.datas;
          if (this.processMount) {
            data.forEach((n, i) => {
              n.number = n.quantity * this.processMount;
            });
          }
          this.data = res.data.datas;
        }
      });
    },
    selectMoreOver (selectMoreRow) {
      this.selectMoreRow = selectMoreRow;
      this.selectMoreRow.forEach(val => {
        val.needNumber = 1;
      });
      this.data = [...this.data, ...this.selectMoreRow];
    },
    selectOneProduct () {
      this.bool = true;
      this.addProductModal = true;
      this.sltOneOrMore = 'one';
    },
    selectMoreProduct () {
      this.bool = false;
      this.addProductModal = true;
      this.sltOneOrMore = 'more';
    },
    validateFn () {
    },
    createBeforeValidate () {
      let flag = true;
      if (!this.selectRow.goodsSku) {
        this.$Message.warning('请选择加工产品');
        flag = false;
        return flag;
      }
      if (this.data.length === 0) {
        this.$Message.warning('请选择原料产品');
        flag = false;
        return flag;
      }
      if (!this.materialFee) {
        this.$Message.warning('请填写材料费');
        flag = false;
        return flag;
      }
      if (!this.laborFee) {
        this.$Message.warning('请填写人工费');
        flag = false;
        return flag;
      }
      return flag;
    },
    createList () {
      if (this.createBeforeValidate()) {
        let obj = {
          finishedProductGoodsSku: this.selectRow.productGoodsId, // 加工产品id
          laborFee: this.laborFee, // 人工费
          materialFee: this.materialFee, // 材料费
          methodType: this.type === 'edit' ? 'modify' : 'add', // add 添加/ modify编辑
          warehouseId: this.wareId,
          workingDetailList: this.data.map(val => ({
            needNumber: val.number || val.needNumber,
            productGoodsId: val.materialProductGoodsId || val.productGoodsId
          })),
          workingNumber: this.processMount // 加工数量
        };
        if (this.type === 'edit') {
          obj.workingId = this.detailObj.workingId;
          obj.workingNo = this.detailObj.workingNo;
          obj.receiptBatchNo = this.detailObj.receiptBatchNo;
        }
        this.axios.post(api.createList, obj).then(res => {
          if (res.data.code === 0) {
            this.$emit('createSuccess');
          }
        });
      }
    },
    changeNum (val) {
      // 若加工数量为null,则重置为默认值1
      let v = this;
      if (!val) {
        v.processMount = 1;
      }
      if (v.data.length > 0) {
        v.selectOver(v.selectRow); // 重新计算数量
      }
    }
  }
};
</script>

<style>
.backList {
  background-color: #ffffff;
  padding: 10px 8px;
}

.baseInfo {
  margin-top: 10px;
}

.addProductModal .ivu-modal {
  width: 1000px !important;
}
</style>
