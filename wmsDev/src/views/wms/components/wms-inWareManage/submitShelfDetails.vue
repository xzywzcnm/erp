<template >
  <div>
    <Card class="mt10" dis-hover>
      <Row>
        <Col span="7">
        <div>
          <div class="big-img-box">
            <local-img-zoom :src="imgSrc" :bigsrc="imgSrc"></local-img-zoom>
          </div>
          <!-- <carousel
                          :list="list"
                          @activeImg="activeImg"></carousel>-->
        </div>
        </Col>
        <Col span="16" offset="1">
        <Card dis-hover title="商品信息">
          <Row class="receipt-top">
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              入库单号： </p>
            <p class="receipt-top-text text-eli" :title="curObj.receiptNo">
              {{ curObj.receiptNo }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              批次号： </p>
            <p class="receipt-top-text text-eli" :title="curObj.receiptBatchNo">
              {{ curObj.receiptBatchNo }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              收货库区： </p>
            <p class="receipt-top-text text-eli">
              收货库区 </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              收货库位： </p>
            <p class="receipt-top-text text-eli" :title="shelvesDataList.warehouseLocationName">
              {{ shelvesDataList.warehouseLocationName }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">SKU：</p>
            <p class="receipt-top-text text-eli" :title="shelvesDataList.goodsSku">
              {{ shelvesDataList.goodsSku }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              中文描述： </p>
            <p class="receipt-top-text" :title="shelvesDataList.goodsCnDesc">
              {{ shelvesDataList.goodsCnDesc }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              英文描述： </p>
            <p class="receipt-top-text" :title="shelvesDataList.goodsEnDesc">
              {{ shelvesDataList.goodsEnDesc }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              重量(g)： </p>
            <p class="receipt-top-text text-eli" :title="shelvesDataList.goodsWeight">
              {{ shelvesDataList.goodsWeight }} </p>
            </Col>

            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              长宽高(cm)： </p>
            <p class="receipt-top-text text-eli" :title="shelvesDataList.goodsLength +
              '*' +
              shelvesDataList.goodsWidth +
              '*' +
              shelvesDataList.goodsHeight
              ">
              {{ shelvesDataList.goodsLength }}*{{ shelvesDataList.goodsWidth }}*{{ shelvesDataList.goodsHeight }} </p>
            </Col>
            <Col span="12" class="receipt-top-box" v-for="(item) in baseInfoList" :key="item.typeValueId">
            <p class="receipt-top-label">
              {{ item.name }}： </p>
            <p class="receipt-top-text text-eli" :title="curObj.Color">
              {{ item.value }} </p>
            </Col>

            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              质检结果： </p>
            <p class="receipt-top-text text-eli">
              <span style="color:green;" v-if="curObj.qcResult === 1">良品</span> <span style="color:green;"
                v-if="curObj.qcResult === 0">不良品</span>
            </p>
            </Col>

            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              条码编码： </p>
            <p class="receipt-top-text text-eli" :title="curObj.Color">
              {{ curObj.barCode }} </p>
            </Col>
          </Row>
        </Card>
        </Col>
      </Row>
      <Card title="上架库位推荐" class="mt10" dis-hover>
        <Table :columns="columns5" :loading="TableLoading" :data="data5"></Table>
      </Card>
      <Card title="上架记录" class="mt10" dis-hover>
        <Table highlight-row border :columns="columns6" :loading="TableLoading" :data="data6"></Table>
      </Card>
      <Spin size="large" fix v-if="spinShow"></Spin>
    </Card>
    <div class="fix-submit" v-if="(curObj.shelveStatus === '0' || curObj.shelveStatus === '1') &&
      tabsName === 'detail'
      ">
      <p class="amount">
        <span>待上架总数量：{{
          shelvesDataList.waitShelveNumber
        }}</span> <span>已上架数量：{{
  shelvesDataList.shelveNumber
}}</span> <span>未上架数量：{{
  shelveNumberShowText
}}</span>
      </p>

      <Form ref="newShelvesParams" :model="newShelvesParams" :label-width="98" label-position="right"
        :rules="ruleValidate" inline>
        <Row>
          <Col span="4">
          <FormItem label="上架数量">
            <InputNumber v-model.trim="newShelvesParams.shelveNumber" :min="1" :max="shelvesDataList.waitShelveNumber -
              shelvesDataList.shelveNumber
              "></InputNumber>
          </FormItem>
          </Col>
          <Col span="5">
          <FormItem prop="unqualifiedNum" label="上架库位">
            <Select v-model="newShelvesParams.warehouseLocationId" filterable remote transfer placement="top"
              :remote-method="getWarehouseLocation" :loading="loading2" @click.native="getWarehouseLocation('')"
              placeholder="输入搜索词进行远程查询">
              <Option v-for="item in $store.state.positionList" :value="item.warehouseLocationId"
                :key="item.warehouseLocationId" :label="item.warehouseLocationName"></Option>
            </Select>
            <!--<Input v-model.trim="newQualityParams.unqualifiedNum" :disabled='curObj.checkStatus==="2"'></Input>-->
          </FormItem>
          </Col>
          <Col span="4">
          <FormItem label="备注" prop="remarks">
            <Input type="textarea" placeholder="0-50个字符" :maxlength="50" :autosize="{ minRows: 5, maxRows: 6 }"
              v-model.trim="newShelvesParams.remark" :disabled="shelvesDataList.shelveStatus === '2'"></Input>
          </FormItem>
          </Col>
          <Col span="3">
          <FormItem>
            <Button type="primary" @click="submitQuality">提交结果</Button>
          </FormItem>
          </Col>
        </Row>
      </Form>
    </div>
  </div>
</template>
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import selectWareLocate from './selectWareLocate';
import carousel from './componts/carousel';

export default {
  mixins: [Mixin],
  components: {
    selectWareLocate: selectWareLocate,
    carousel
  },
  data() {
    let v = this;
    return {
      loading2: false,
      columns5: [
        {
          title: '序号',
          align: 'center',
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '库区',
          align: 'center',
          render(h, params) {
            return h('span', params.row.warehouseBlockName);
          }
        }, {
          title: '库位',
          align: 'center',
          render(h, params) {
            return h('span', params.row.warehouseLocationName);
          }
        }, {
          title: '当前库存',
          align: 'center',
          render(h, params) {
            if (params.row.locationSkuInventorys.length === 0) {
              return h('span', { style: { color: 'red' } }, '空库存');
            } else {
              return h('div', {}, params.row.locationSkuInventorys.map(i => {
                return h('p', {}, i.goodsSku + '*' + i.inventoryNumber);
              }));
            }
          }
        }, {
          title: '操作',
          align: 'center',
          render(h, params) {
            if (v.tabsName === 'detail' && (v.curObj.shelveStatus === '0' || v.curObj.shelveStatus === '1')) {
              return h('Button', {
                on: {
                  click() {
                    v.getWarehouseLocation(params.row.warehouseLocationName).then(() => {
                      v.$nextTick(() => {
                        setTimeout(() => {
                          v.newShelvesParams.warehouseLocationId = params.row.warehouseLocationId;
                        }, 100);
                      });
                    });
                  }
                }
              }, '选择');
            } else {
              return h('span', '无');
            }
          }
        }
      ],
      data5: [],
      imgSrc: '',
      list: [],
      shelfLocate: 'shelfLocateName',
      shelveNumberShowText: 0,
      newShelvesParams: {
        shelveNumber: 0, // 本次上架
        remark: '', // 备注
        warehouseLocationId: ''
      },
      ruleValidate: {
        curShelfPassNum: [
          {
            validator: this.validateNum(),
            trigger: 'blur'
          } // 上架合格数
        ],
        curShelfProblemNum: [
          {
            validator: this.validateNum(),
            trigger: 'blur'
          } // 上架不合格数
        ]
      },
      checknum: 0,
      showLocationModal: false, // 库位选择模态框
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '上架记录',
          key: 'receiptCheckShelveDetailNo',
          align: 'center',
          minWidth: 120
        }, {
          title: '本次上架数量',
          key: 'shelveNumber',
          minWidth: 120,
          align: 'center'
        }, {
          title: '上架库位',
          minWidth: 138,
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '备注',
          key: 'remark',
          minWidth: 138,
          align: 'center'
        }, {
          title: '上架时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120
        }, {
          title: '上架人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120
        }
      ],
      data6: [],
      warehouseLocationId: '',
      shelvesDataList: {}, // 上架结果数据
      baseInfoList: []
    };
  },
  props: {
    curObj: {
      default: null
    },
    open: {
      default: null
    },
    type: {
      default: 'look'
    },
    tabsName: {
      default: 'list'
    }
  },
  watch: {
    open: function (val) {
      if (val) {
        this.getShelvesDetailData(this.curObj);
        this.getGoodWarehouseLocal(this.curObj);
      }
    }
  },
  created() {
    // this.getShelvesDetailData(this.curObj);
    // this.getPositionList(this.curObj);
    // this.getGoodWarehouseLocal(this.curObj);
  },
  methods: {
    getGoodWarehouseLocal(params) {
      let v = this;
      let type = params.qcResult === 0 ? '12' : '10,11'; // 1 良品  0 不良品
      v.TableLoading = true;
      v.axios.get(api.goodWarehouseLocal + '?warehouseId=' + params.warehouseId + '&sku=' + params.goodsSku + '&warehouseBlockTypeList=' + type).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          v.data5 = res.data.datas;
        }
      }).catch();
    },
    activeImg(item) {
      this.imgSrc = item.src;
    },
    submitQuality() {
      this.handleSubmit();
    },
    validateNum() {
      // 合格数量和不合格数量校验
      let v = this;
      var validateNum = function (rule, value, callback) {
        var re = v.$regular.AllNumber;
        var result = [];
        result = re.test(v.newShelvesParams.shelveNumber);
        if (value !== '') {
          if (result === false) {
            callback(new Error('大于0的整数'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateNum;
    },
    formInputFn() {
      var v = this;
      if (this.newShelvesParams.curShelfPassNum !== '0' && this.newShelvesParams.curShelfProblemNum !== '0') {
        if (Number(this.newShelvesParams.curShelfPassNum) > Number(this.shelvesDataList.passCheckNumber)) {
          v.$Message.info({
            content: '当前本次上架数量不能大于质检合格数量',
            duration: 4
          });
        } else if (Number(this.newShelvesParams.curShelfProblemNum) > Number(this.shelvesDataList.problemCheckNumber)) {
          v.$Message.info({
            content: '当前本次上架数量不能大于质检不合格数量',
            duration: 4
          });
        }
      } else {
        v.$Message.info({
          content: '本次上架数量不能为0',
          duration: 4
        });
      }
    },
    shelfDtlObj() {
      // 提交上架参数
      let v = this;
      let inventoryLogList = [];
      let obj1 = {
        warehouseLocationId: v.newShelvesParams.locationIdOne,
        changedNum: v.newShelvesParams.curShelfPassNum,
        productGoodsId: v.curObj.productGoodsId,
        receiptBatchNo: v.curObj.receiptBatchNo,
        remainderNum: Number(v.newShelvesParams.curShelfPassNum) + Number(v.newShelvesParams.curShelfProblemNum) - Number(v.newShelvesParams.curShelfPassNum)
      };
      let obj2 = {
        warehouseLocationId: v.newShelvesParams.locationIdTwo,
        changedNum: v.newShelvesParams.curShelfProblemNum,
        productGoodsId: v.curObj.productGoodsId,
        receiptBatchNo: v.curObj.receiptBatchNo,
        remainderNum: Number(v.newShelvesParams.curShelfPassNum) + Number(v.newShelvesParams.curShelfProblemNum) - Number(v.newShelvesParams.curShelfProblemNum)
      };
      inventoryLogList.push(obj1, obj2);
      let newObj = {
        productGoodsId: v.curObj.productGoodsId,
        inventoryNumber: Number(v.newShelvesParams.curShelfPassNum) + Number(v.newShelvesParams.curShelfProblemNum),
        remark: v.newShelvesParams.remarks, // 备注
        warehouseId: v.curObj.warehouseId,
        warehouseLocationId: v.shelvesDataList.warehouseLocationId,
        receiptBatchNo: v.curObj.receiptBatchNo,
        passShelveNumber: v.newShelvesParams.curShelfPassNum, // 本次已上架合格数量
        passWarehouseLocationId: v.newShelvesParams.locationIdOne, // 选择上架合格库位id
        problemShelveNumber: v.newShelvesParams.curShelfProblemNum, // 本次已上架问题数量
        problemWarehouseLocationId: v.newShelvesParams.locationIdTwo, // 选择上架问题库位id
        receiptCheckDetailShelveNo: v.shelvesDataList.receiptCheckDetailShelveNo,
        receiptNo: v.curObj.receiptNo, // 入库单编号
        wmsResponseInventoryLog: inventoryLogList
      };
      return newObj;
    },
    getParams(name) {
      var v = this;
      let obj1 = {
        warehouseLocationId: v.newShelvesParams.warehouseLocationId,
        changedNum: v.newShelvesParams.shelveNumber,
        productGoodsId: v.curObj.productGoodsId,
        receiptBatchNo: v.curObj.receiptBatchNo,
        goodsSku: v.curObj.goodsSku,
        remainderNum: Number(v.shelvesDataList.waitShelveNumber) - Number(v.newShelvesParams.shelveNumber)
      };
      let obj = {
        productGoodsId: v.curObj.productGoodsId,
        shelveNumber: v.newShelvesParams.shelveNumber, // 上架数量
        inventoryNumber: Number(v.newShelvesParams.shelveNumber),
        remark: v.newShelvesParams.remark, // 备注
        warehouseId: v.curObj.warehouseId,
        goodsSku: v.curObj.goodsSku,
        warehouseLocationId: v.shelvesDataList.warehouseLocationId,
        receiptBatchNo: v.curObj.receiptBatchNo,
        passShelveNumber: v.newShelvesParams.shelveNumber, // 本次已上架合格数量
        problemWarehouseLocationId: '', // 选择上架问题库位id
        receiptCheckDetailShelveNo: v.shelvesDataList.receiptCheckDetailShelveNo,
        receiptNo: v.curObj.receiptNo, // 入库单编号
        wmsResponseInventoryLog: [obj1]
      };
      if (v.newShelvesParams.warehouseLocationId === '' || v.newShelvesParams.warehouseLocationId === null) {
        v.$Message.error({
          duration: 5,
          content: '上架库位不能为空'
        });
        return;
      }
      v.axios.post(api.submitShelvesCheck, obj).then(res => {
        if (res.data.code === 0) {
          //  v.$Message.success('上架成功');
          if (res.data.others.datas) {
            // code 554131
            let text = '操作失败:库位正在盘点中(盘点单：' + res.data.others.datas + ')';
            v.$Message.error(text);
          } else {
            v.$emit('createSuccess');
            v.getShelvesDetailData(v.curObj);
          }
        }
      });
    },
    handleSubmit() {
      this.getParams('newShelvesParams'); // 提交上架结果前，进行表单校验
    },
    handleReset(name) {
      this.$refs[name].resetFields();
    },
    resetFormFn() {
      // 清空表单数据
      this.handleReset('newShelvesParams');
    },
    getShelvesDetailData(obj) {
      // 查看提交上架结果前的数据
      var v = this;
      v.TableLoading = true;
      v.axios.get(api.submitShelvesData + obj.receiptCheckDetailShelveId).then(res => {
        v.TableLoading = false;
        if (res.data.code === 0) {
          v.shelvesDataList = res.data.datas;
          if (v.shelvesDataList.goodsUrl) {
            v.imgSrc = v.$store.state.imgUrlPrefix + v.shelvesDataList.goodsUrl;
          } else {
            v.imgSrc = require('../../../../../public/static/images/placeholder.jpg');
          }
          v.curObj.shelveStatus = v.shelvesDataList.shelveStatus; // 更新状态;
          v.shelvesDataList.shelveNumber = Number(v.shelvesDataList.alreadyShelveNumber);
          v.shelvesDataList.waitShelveNumber = Number(v.shelvesDataList.waitShelveNumber);
          v.newShelvesParams.shelveNumber = Number(v.shelvesDataList.waitShelveNumber) - Number(v.shelvesDataList.alreadyShelveNumber);
          v.shelveNumberShowText = v.newShelvesParams.shelveNumber;
          v.warehouseLocationId = v.shelvesDataList.warehouseLocationId;
          v.data6 = this.processTimeData(res.data.datas.receiptRecord, 'createdTime'); // 上架记录表格数据
        }
      });
    },
    getWarehouseLocation(query) {
      let obj = this.curObj.qcResult === 1 ? '11' : '12';
      let pickingFlag = this.curObj.qcResult === 1 ? '1' : '3'; // 不良品只能上架不良品库位
      let v = this;
      return new Promise(resolve => {
        if (query !== '') {
          v.newShelvesParams.warehouseLocationId = '';
        }
        this.getPositionListNew(['10', obj], pickingFlag, query).then((data) => {
          if (query !== '') {
            if (data.length === 0) {
              v.$Message.info('无相关匹配库位');
              return;
            }
            data.forEach(i => {
              if (i.warehouseLocationName === query) {
                v.newShelvesParams.warehouseLocationId = i.warehouseLocationId;
              }
            });
          }
          resolve();
        });
      });
    },
    showSelectWareLocation(num) {
      var v = this;
      v.checknum = num;
      v.showLocationModal = true;
      v.$refs.selectWareLocate.selectNum = num;
      v.$refs.selectWareLocate.getWareBlockName();
    },
    getData(data) {
      // 选择库位
      var v = this;
      if (v.checknum === 1) {
        v.newShelvesParams.locationIdOne = data.warehouseLocationId; // 选择上架合格库位id
        v.newShelvesParams.selectPassWareBlock = data.warehouseLocationName; // 选择上架合格库位名称
      } else {
        v.newShelvesParams.locationIdTwo = data.warehouseLocationId; // 选择上架问题库位id
        v.newShelvesParams.selectProblemWareBlock = data.warehouseLocationName; // 选择上架问题库位名称
      }
      v.showLocationModal = false;
    },
    getColorSize(obj) {
      this.axios.post('/wms-service/erpCommon/product-service/productGoodsSpecification/queryByProductGoodsIds', [obj.productGoodsId]).then(res => {
        if (!res.data || !res.data.datas || !res.data.datas[obj.productGoodsId]) return;
        this.baseInfoList = res.data.datas[obj.productGoodsId];
      })
    },
    getImgList(obj) {
      this.axios.post('/wms-service/erpCommon/product-service/productGoodsImage/queryByProductGoodsIds', [obj.productGoodsId]).then(({ data }) => {
        let list = data && data.datas[obj.productGoodsId] ? data.datas[obj.productGoodsId] : [];
        this.imgList = []
        const imgUrlPrefix = this.$store.state.imgUrlPrefix;
        list.forEach((item, index) => {
          list[index] = imgUrlPrefix + item
          let temp = {}
          temp.url = item
          if (index < 3) this.imgList.push(temp)
        })
        this.allImgList = list
      })
    }

  }
};
</script>
<style >
.modalContentTitle {
  border-bottom: 1px solid lightgrey;
  margin-bottom: 10px;
}

.z_index .ivu-modal-wrap {
  z-index: 10000;
}

.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
<style scoped >
.mt10 {
  margin-top: 10px;
}

.pd10 {
  padding: 10px;
}

.big-img-box {
  width: 100%;
  height: 265px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.text-eli {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.tabs-p10 {
  padding: 0 10px;
}

.receipt-top {
  max-height: 286px;
  overflow-y: auto;
}

.receipt-top-box {
  padding-bottom: 15px;
}

.receipt-top-label {
  display: inline-block;
  text-align: left;
  float: left;
  font-weight: bold;
  word-break: break-all;
}

.receipt-top-text {
  float: left;
}

.quality-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.quality-item .row-i {
  margin: 7px 0;
}

.quality-item .row-i:first-child {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quality-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.quality-item:first-child {
  padding-top: 0;
}

.fix-submit {
  position: fixed;
  bottom: 0;
  height: 150px;
  width: 100%;
  background-color: rgba(154, 154, 154, 0.7);
  z-index: 9;
  padding-left: 30px;
}

.fix-submit .amount {
  font-size: 18px;
  margin-top: 10px;
}

.fix-submit .amount span {
  margin-right: 50px;
}

.qc-box {
  max-height: 300px;
  overflow-y: auto;
}

.pb150 {
  padding-bottom: 150px;
}
</style >
