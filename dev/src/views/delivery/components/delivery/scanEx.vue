<style scoped>
.autoRight {
  overflow-y: auto;
  overflow-x: hidden;
  height: 850px
}

.settingCursor {
  cursor: pointer;
}

.checkboxStyle {
  display: block;
  padding-bottom: 10px
}

.packageCode {
  justify-content: center;
  font-size: 24px;
  color: #0054A6;
}

.packageNationFlag {
  justify-content: center;
}

.shippingCode {
  justify-content: center;
  font-size: 16px;
  margin-top: 10px;
  color: #3cb034;
}

.shippingCode em {
  font-style: normal;
  margin-right: 10px;
  color: #333
}

.packageItem {
  font-size: 24px
}

.packageSetting {
  background-color: #dbebd4;
  height: 190px;
  border-bottom: 1px solid #e1e1e1;
  border-left: 1px solid #e1e1e1;
  border-right: 1px solid #e1e1e1;
}

.packageSettingBody {
  border-top: 1px solid #e1e1e1;
}

.packageSettingFont {
  line-height: 34px;
  margin-left: 5px
}

.scanPageItem {
  margin-bottom: 10px;
  border: 1px solid #e1e1e1;
  background-color: #fff
}

.scanPageItemHeader {
  border-bottom: 1px solid #e9eaec;
  padding: 13px 16px;
  line-height: 1;
}

.scanPageItemHeaderContent {
  width: 100%;
  height: 24px;
  line-height: 20px;
  font-size: 14px;
  color: #1c2438;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spicLeft {
  margin-left: 15px
}

.scanPageItemBody {
  padding: 10px;
}

.overbagShippingName {
  font-size: 24px;
  color: #0054A6;
}

.overbagParams {
  font-size: 20px
}

.overbagParams span {
  color: #ff3300
}

.gotoExwarehouse {
  justify-content: space-between;
}

.scanEx {
  margin-top: -15px;
  line-height: 32px;
}
</style>
<template>
  <div class="commonFilter">
    <div class="flexBox gotoExwarehouse layout-breadcrumb">
      <Breadcrumb style="margin-top:5px">
        <BreadcrumbItem>直发</BreadcrumbItem>
        <BreadcrumbItem>扫描出库</BreadcrumbItem>
      </Breadcrumb>
      <Button type="primary" @click="gotoExwarehouse" icon="arrow-swap">切换为批量出库 </Button>
    </div>
    <Row>
      <Col :span="11">
        <Card :bordered="false">
          <p slot="title">扫描</p>
          <p slot="extra">
            <Poptip
              width="300" v-model="poptipModel" class="poptipEditStyle" placement="bottom">
              <div slot="content">
                <CheckboxGroup v-model="packageSettingModel.settingSelect">
                  <Row>
                    <Col :span="6">
                      <Checkbox label="称重" class="checkboxStyle">
                        <span>称重</span>
                      </Checkbox>
                    </Col>
                    <Col :span="6">
                      <dyt-select v-model="packageSettingModel.weight" size="small"><Option value="克(g)"> 克(g)</Option>
                      </dyt-select>
                    </Col>
                  </Row>
                  <Checkbox label="量尺寸" class="checkboxStyle">
                    <span>量尺寸</span>
                  </Checkbox>
                </CheckboxGroup>
                <div>
                  <Button size="small" @click="cancelPoptip">关闭 </Button>
                  <Button size="small" type="primary" @click="savePoptip">保存 </Button>
                </div>
              </div>
              <Icon type="md-settings" class="settingCursor"></Icon>
            </Poptip>
          </p>
          <div>
            <div class="flexBox packageCode">
              {{ packageModel.code }}
            </div>
            <div class="flexBox packageNationFlag">
              <span :class='["bigNationalFlag bignationalFlag" + packageModel.webstoreItemSite]'></span>
            </div>
            <div class="flexBox shippingCode">
              <em>{{ packageModel.nation }}</em>{{ packageModel.postcode }}
            </div>
            <div class="packageItem normalTop">
              <span>物流方式：</span> <span class="">{{ packageModel.shippingMethod }}</span>
            </div>
            <div class="packageItem normalTop">
              <span>运单号：</span> <span class="redColor">{{ packageModel.waybillNo }}</span>
            </div>

            <div class="packageItem normalTop">
              <span>实际称重：</span> <span class="greenColor">{{ packageModel.weight }}g</span>
            </div>
          </div>
        </Card>
        <div class="packageSetting">
          <div class="packageSettingBody">
            <Form :model="formItem" :label-width="70">
              <Row class="normalTop">
                <Col :span="10">
                  <FormItem label="扫描：" prop="scan">
                    <Input
                      v-model.trim="formItem.scan"
                      style="width:200px"
                      ref="input1"
                      placeholder="可扫描运单号或者包裹号"
                      @on-keyup.13="goNextInput(1)"></Input>
                  </FormItem>
                </Col>
              </Row>
              <Row v-if="storeagePackageSetting.indexOf('称重') >= 0">
                <Col :span="10">
                  <FormItem label="称重：" prop="weigh">
                    <Input v-model.trim="formItem.weight" ref="input2" @on-keyup.13="goNextInput(2)">
                      <span slot="append">g</span> </Input>
                  </FormItem>
                </Col>
              </Row>
               <!-- eslint-disable vue/valid-v-if  -->
               <!-- eslint-disable-next-line vue/no-parsing-error -->
              <Row v-if="storeagePackageSetting.indexOf('量尺寸')) >= 0">
                <FormItem label="尺寸：">
                  <Col :span="5">
                    <Input v-model.trim="formItem.length" ref="input3" placeholder="长" @on-keyup.13="goNextInput(3)">
                      <span slot="append">cm</span> </Input>
                  </Col>
                  <Col :span="5" style="margin-left:5px">
                    <Input v-model.trim="formItem.width" ref="input4" placeholder="宽" @on-keyup.13="goNextInput(4)">
                      <span
                        slot="append">cm</span> </Input>
                  </Col>
                  <Col :span="5" style="margin-left:5px">
                    <Input v-model.trim="formItem.height" ref="input5" placeholder="高" @on-keyup.13="goNextInput(5)">
                      <span slot="append">cm</span> </Input>
                  </Col>
                </FormItem>
              </Row>
            </Form>
          </div>
        </div>
      </Col>
      <Col :span="12" offset="1">
        <div class="autoRight">
          <div class="scanPageItem" v-for="(item, index) in scanData" :key="index">
            <div class="scanPageItemHeader">
              <div class="scanPageItemHeaderContent flexBox" style="justify-content: space-between;">
                <span>已扫 <span class="blueColor spicLeft">{{ shippingMethodPos[index] }}</span></span> <span>
                  <Button
                    type="primary"
                    size="small"
                    icon="bag"
                    @click="setPackageOver(item[0].shippingMethodId,index)">结袋</Button>
                </span>
              </div>
            </div>
            <div class="scanPageItemBody">
              <Table highlight-row border :columns="scanColumn" :data="item" size="small"></Table>
            </div>
          </div>
        </div>
      </Col>
    </Row>
    <Keep-alive>
      <Modal v-model="overbagModel.status" @on-ok="overBag">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">结袋</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="overbagContent">
              <div class="flexBox flexBoxJustContent overbagShippingName normalTop">{{ overbagModel.overbagShippingName }}</div>
              <div class="flexBox flexBoxJustContent overbagParams normalTop">
                <span>{{ overbagModel.packageCount }}</span> 个包裹
              </div>
              <div
                class="flexBox flexBoxJustContent overbagParams normalTop"
                v-if="storeagePackageSetting.indexOf('称重') >=  0">
                <span>{{ overbagModel.packageWeight / 1000 }} KG</span> 总重
              </div>
              <div class="flexBox flexBoxJustContent normalTop">
                <Checkbox v-model="overbagModel.overbagConfirm">导出物流确认excel</Checkbox>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Keep-alive>
    <keep-alive>
      <Modal
        v-model="isRecycl"
        :mask-closable="false"
        v-if="isRecyclStatus"
        ok-text="继续发货"
        cancel-text="去回收"
        @on-ok="keepOut"
        @on-cancel="goCancel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">作废包裹回收提醒</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <Row>
                <Col :span="1">
                  <Icon type="md-information-circle" color="#2b85e4" size="44"></Icon>
                </Col>
                <Col :span="21" :offset="2">
                  <p>
                    【作废包裹】中存在未回收包裹，是否先回收包裹? </p>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import packageDetails from './packageDetails';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  components: {
    packageDetails
  },
  data () {
    return {
      // 标发货提示参数
      isRecycl: false,
      isRecyclStatus: false, // end
      overbagModel: {
        status: false,
        overbagShippingName: '',
        packageCount: '',
        packageWeight: 0,
        overbagConfirm: false,
        shippingMethodId: ''
      },
      packageModel: {
        shippingMethod: '',
        nation: '',
        postcode: '',
        code: '',
        waybillNo: '',
        weight: '',
        shippingMethodId: '',
        webstoreItemSite: 0
      },
      scanData: [],
      scanColumn: [
        {
          title: '包裹号',
          align: 'center',
          key: 'packageCode'
        }, {
          title: '运单号',
          align: 'center',
          key: 'waybillNo'
        }, {
          title: '国家/地区',
          align: 'center',
          key: 'country'
        }, {
          title: '邮编',
          align: 'center',
          key: 'postcode'
        }, {
          title: '称重' + '(g)',
          align: 'center',
          key: 'weight'
        }
      ],
      formItem: {
        height: '',
        width: '',
        length: '',
        weight: '',
        packageId: '',
        scan: ''
      },
      poptipModel: false,
      packageSettingModel: {
        settingSelect: [],
        weight: '克' + '(g)'
      },
      storeagePackageSetting: [],
      storeageNum: [1],
      deliveryBatchNo: '',
      shippingMethodPos: []
    };
  },
  created () {
    let v = this;
    let exSetting = localStorage.getItem('exSetting');
    if (exSetting) {
      v.packageSettingModel.settingSelect = exSetting.split(',');
      v.storeagePackageSetting = exSetting.split(',');
      if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') >= 0) {
        v.storeageNum = [1, 2, 3, 4, 5];
      } else if (exSetting.indexOf('称重') >= 0 && exSetting.indexOf('量尺寸') < 0) {
        v.storeageNum = [1, 2];
      } else if (exSetting.indexOf('称重') < 0 && exSetting.indexOf('量尺寸') >= 0) {
        v.storeageNum = [1, 3, 4, 5];
      }
    }
    v.axios.get(api.get_deliveryBatchNo).then(response => {
      if (response.data.code === 0) {
        v.deliveryBatchNo = response.data.datas;
      }
    });
    v.$store.commit('active', '88889-888892');
  },
  methods: {
    cancelPoptip () {
      this.poptipModel = false;
    },
    savePoptip () {
      let v = this;
      localStorage.setItem('exSetting', v.packageSettingModel.settingSelect);
      v.storeagePackageSetting = v.packageSettingModel.settingSelect;
      v.poptipModel = false;
    },
    goNextInput (num) {
      let v = this;
      const l = v.storeageNum.length;
      const cur = v.storeageNum.indexOf(num);
      if (v.formItem.scan === '') {
        v.$Message.error('包裹号不能为空');
        return false;
      }
      if (num > 1) {
        let reg = v.$regular.priceReg;
        let value = this.$refs['input' + num].value;
        if (!reg.test(value)) {
          v.$Message.error('该选项只允许输入整数或两位小数');
          return false;
        }
      }
      if (num === 1 && v.formItem.scan !== '') {
        v.axios.get(api.get_packageByCode + v.formItem.scan).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.packageModel.code = data.packageCode;
            v.packageModel.postcode = data.buyerPostalCode;
            v.packageModel.nation = data.buyerCountryCode;
            v.packageModel.shippingMethod = data.carrierName + ' > ' + data.shippingMethodName;
            v.packageModel.waybillNo = data.trackingNumber;
            v.packageModel.shippingMethodId = data.shippingMethodId;
            v.packageModel.webstoreItemSite = data.webstoreItemSite;
            v.formItem.packageId = data.packageId;
            if (l === 1) {
              v.setMarkPackage();
            }
          }
        });
      } else if (num === 2) {
        v.packageModel.weight = v.formItem.weight;
      }
      if (cur === l - 1 && l !== 1) {
        v.setMarkPackage();
      } else if (cur !== l - 1) {
        v.$refs['input' + (num + 1)].focus();
      }
    },
    keepOut () {
      this.setMarkPackage(1);
    },
    goCancel () {
      this.$router.push('cancelPackage');
    },
    setMarkPackage (flag) { // 标记包裹出库
      let v = this;
      let obj = v.deepCopy(v.formItem);
      delete obj.scan;
      obj.deliveryBatchNo = v.deliveryBatchNo;
      if (flag) {
        obj.flag = 1;
      }
      v.axios.put(api.set_markPackageDelivery, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let tbj = {
            packageCode: v.packageModel.code,
            waybillNo: v.packageModel.waybillNo,
            country: v.packageModel.nation,
            postcode: v.packageModel.postcode,
            weight: v.formItem.weight,
            shippingMethodId: v.packageModel.shippingMethodId
          };
          if (v.shippingMethodPos.indexOf(v.packageModel.shippingMethod) < 0) {
            v.shippingMethodPos.push(v.packageModel.shippingMethod);
            v.scanData.push([tbj]);
          } else {
            let i = v.shippingMethodPos.indexOf(v.packageModel.shippingMethod);
            v.scanData[i].push(tbj);
          }
        } else if (response.data.code === 111138) {
          v.isRecyclStatus = true;
          v.$nextTick(function () {
            v.isRecycl = true;
          });
        }
      });
    },
    setPackageOver (shippingMethodId, index) {
      let v = this;
      v.overbagModel.status = true;
      v.overbagModel.overbagShippingName = v.packageModel.shippingMethod;
      v.overbagModel.packageCount = v.scanData[index].length;
      v.overbagModel.packageWeight = 0;
      v.scanData[index].forEach((n, i) => {
        v.overbagModel.packageWeight = Number(n.weight) + Number(v.overbagModel.packageWeight);
      });
      v.overbagModel.overbagConfirm = false;
      v.overbagModel.shippingMethodId = shippingMethodId;
    },
    overBag () {
      let v = this;
      if (v.overbagModel.overbagConfirm) {
        let newTab = window.open('about:blank');
        v.axios.get(api.set_packageOverBag + '?deliveryBatchNo=' + v.deliveryBatchNo + '&&shippingMethodId=' + v.overbagModel.shippingMethodId).then(response => {
          if (response.data.code === 0) {
            let erpCommon = v.$store.state.erpConfig;
            newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 2000);
          } else {
            newTab.close();
          }
        });
      }
    },
    gotoExwarehouse () {
      this.$router.push('/EXwarehouse');
    }
  }
};
</script>
