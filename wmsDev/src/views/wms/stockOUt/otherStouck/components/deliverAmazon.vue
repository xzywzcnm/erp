<template>
  <div>
    <!-- amazonFba 发货 -->
    <Modal v-model="amazonFbaModal" v-if="amazonFbaModalStatus" :styles="{ top: '80px', width: '800px' }" title="发货">
      <div style="marginLeft:20px;">
        <!-- 步骤条 -->
        <Steps :current="deliveryStep" style="marginLeft:50px;">
          <Step title="上传物流信息"></Step>
          <Step title="上传装箱清单"></Step>
          <Step title="打印外箱标签"></Step>
          <Step title="发货"></Step>
        </Steps>
        <div style="marginTop:20px;">
          <Card dis-hover>
            <!-- 步骤1 -->
            <div v-if="deliveryStep === 0">
              <h3>1. 上传物流信息</h3>
              <div style="margin:20px;">
                <span>运输类型：</span>
                <RadioGroup v-model="shipmentType" style="marginLeft:10px;">
                  <Radio label="SP">小包裹快递</Radio>
                  <Radio label="LTL">零担货运/货车荷载 (LTL/FTL)</Radio>
                </RadioGroup>
              </div>
              <div style="marginLeft:20px;">
                <span>承运人：</span> <Select style="width:220px;marginLeft:20px;" v-model="carrierName">
                  <Option v-for="item in carrierNameList" :value="item.id" :key="item.id"> {{ item.label }}</Option>
                </Select>
              </div>
            </div>
            <!-- 步骤2 -->
            <div v-if="deliveryStep === 1">
              <h3>2. 上传装箱清单</h3>
              <Table style="marginTop:15px;" :columns="boxColumns" :data="boxData"></Table>
            </div>
            <!-- 步骤3 -->
            <div v-if="deliveryStep === 2">
              <h3>3. 打印外箱标签</h3>
              <div style="marginTop:10px;">
                <span>请选择纸张类型：</span> <Select style="width:220px;marginLeft:20px;" v-model="pageType">
                  <Option v-for="item in pageTypeList" :value="item.value" :key="item.value"> {{ item.label }}</Option>
                </Select>
              </div>
              <Table style="marginTop:15px;" :columns="printBoxColumns" :data="boxData"></Table>
            </div>
            <!-- 步骤4 -->
            <div v-if="deliveryStep === 3">
              <h3>4. 发货</h3>
              <div style="margin:20px;">
                <span style="color: red;"> * </span> <span>跟踪单号：</span> <Input v-model.trim="trackingNumber" style="width:220px;marginLeft:80px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>计费类型：</span>
                <RadioGroup v-model="billingType" style="marginLeft:80px;">
                  <Radio label="kg">千克（KG）</Radio>
                  <Radio label="cmb">立方米（CBM）</Radio>
                </RadioGroup>
              </div>
              <div style="margin:20px;">
                <span>头程运费（CNY）：</span> <Input v-model.trim="firstShippingFee" style="width:220px;marginLeft:20px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>头程报关（CNY）：</span> <Input v-model.trim="firstTariff" style="width:220px;marginLeft:20px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>其他费用（CNY）：</span> <Input v-model.trim="otherFee" style="width:220px;marginLeft:20px;"></Input>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button style="marginRight:15px;" v-if="deliveryStep === 2" type="primary" @click="print">打印</Button>
        <Button v-if="deliveryStep !== 3" type="primary" @click="nextOne">下一步</Button>
        <Button v-if="deliveryStep === 3" type="primary" @click="delivery">发货</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: 'deliverAmazon',
  data () {
    return {
      amazonFbaModal: false, // fba发货
      amazonFbaModalStatus: false,
      deliveryStep: 0, // 步骤条
      shipmentType: 'SP',
      printBoxColumns: [],
      boxData: [], // 发货
      carrierNameList: [
        {
          id: 'other',
          label: 'other'
        }
      ],
      // 上传装箱清单
      boxColumns: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '箱号',
          key: 'boxCode',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 120
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 120
        }, {
          title: '装箱数量',
          key: 'quantity',
          align: 'center',
          minWidth: 120
        }
      ],
      pageTypeList: [
        {
          label: 'PackageLabel_Letter_2',
          value: 'PackageLabel_Letter_2'
        }, {
          label: 'PackageLabel_Letter_6',
          value: 'PackageLabel_Letter_6'
        }, {
          label: 'PackageLabel_A4_2',
          value: 'PackageLabel_A4_2'
        }, {
          label: 'PackageLabel_A4_4',
          value: 'PackageLabel_A4_4'
        }, {
          label: 'PackageLabel_Plain_Paper',
          value: 'PackageLabel_Plain_Paper'
        }
      ],
      // 打印外箱标签
      pageType: null,
      trackingNumber: null,
      billingType: 'kg',
      firstShippingFee: null,
      firstTariff: null,
      otherFee: null,
      nextStatus: false, // 打印外箱标签状态控制，需先打印，才能继续下一步
      carrierName: null,
      pickingId: null // 上传物流信息
    }
  },
  methods: {
    nextOne () {
      // fba发货(共四个步骤)
      let v = this;
      if (v.deliveryStep === 0) {
        // one
        if (v.carrierName) {
          let obj = {
            pickingId: v.pickingId,
            carrierName: v.carrierName,
            shipmentType: v.shipmentType
          };
          v.axios.post(api.put_transport, obj).then(response => {
            if (response.data.code === 0) {
              v.deliveryStep = 1; // 下一步
            }
          });
        } else {
          v.$Message.error('请选择承运人');
        }
      } else if (v.deliveryStep === 1) {
        // two
        v.axios.post(api.put_fbaSubmitFeed + v.pickingId).then(response => {
          if (response.data.code === 0) {
            v.deliveryStep = 2; // 下一步
            // 这里修改第三步中表格的表头
            let colunm = [
              {
                title: '装箱状态',
                key: 'status',
                align: 'center',
                minWidth: 120,
                render: (h, params) => {
                  return h('div', {
                    style: {
                      color: '#008000'
                    }
                  }, '已上传');
                }
              }
            ];
            this.printBoxColumns = this.boxColumns.concat(colunm);
          }
        });
      } else if (v.deliveryStep === 2) {
        // three
        if (v.nextStatus) {
          v.deliveryStep = 3; // 下一步
        } else {
          v.$Message.error('未打印，不能进行下一步操作');
        }
      }
    },
    delivery () {
      // fba发货
      let v = this;
      if (!v.trackingNumber) {
        v.$Message.error('跟踪单号不能为空');
        return false;
      }
      let obj = {
        trackingNumber: v.trackingNumber,
        billingType: v.billingType,
        firstShippingFee: v.firstShippingFee,
        firstTariff: v.firstTariff,
        otherFee: v.otherFee,
        pickingId: v.pickingId
      };
      v.axios.post(api.get_fbaShipping, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.amazonFbaModal = false;
          // 清空数据
          v.shipmentType = 'SP';
          v.carrierName = null;
          v.trackingNumber = null;
          v.billingType = 'kg';
          v.firstShippingFee = null;
          v.firstTariff = null;
          v.otherFee = null;
          v.searchFn();
        }
      });
    },
    print () {
      // 打印外箱标签
      let v = this;
      if (v.pageType) {
        v.axios.get(api.print_fbaLables + '?pickingId=' + v.pickingId + '&pageType=' + v.pageType).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
            window.open(filenodeViewTargetUrl + data, '_blank');
            v.nextStatus = true;
          }
        });
      } else {
        v.$Message.error('请选择纸张类型');
      }
    }
  }
}
</script>

<style>
</style>
