<template >
  <div class="tabContainer" >
    <Tabs type="card" v-model="tabValue" >
      <TabPane label="所有账号" name="0" ></TabPane >
      <TabPane label="非所有账号" name="1" ></TabPane >
    </Tabs >
    <div v-if="tabValue === '0'" class="b-content" >
      <div v-for="(k,index) in allSalesSettingDetail" :key="index" class="mb10" >
        <span class="saleLabel" >{{ salesText[index] }}</span >
        <Checkbox v-model="k.selectedStatus" :true-value=1 :false-value=0 >
          订单金额转换为币种
        </Checkbox >
        <dyt-select v-model="k.currency" style="width: 150px" class="plr10" size="small" >
        <Option v-for="(item, index) in currencyList" :key="index" :value="item.value" >{{ item.label }}</Option>
        </dyt-select >之后小于 <span class="plr10" ><InputNumber
          :precision="3" :min="0" :max="99999999" class="w256" v-model.trim="k.price" size="small" /></span >则<dyt-select
          size="small" class="w256 plr10" v-model="k.handlerType" > <Option
          v-for="(item,vIndex) in typeList" :value='item.value' :key="vIndex" >{{ item.label }}</Option> </dyt-select >
      </div >
    </div >
    <div v-if="tabValue === '1'" class="b-content" >
      <div class="operate-box" v-if="getPermission('afterSalesSetting_saveAutoRefund')" >
        <Button @click="addSaleList" >新增一组账号</Button >
      </div >
      <Card v-for="(model,index) in salesSettingDetail" :key="index" class="mb10" dis-hover >
        <div class="sale-close" v-if="salesSettingDetail.length > 1" >
          <Icon @click="deleteRow(index)" size="22" type="md-close" />
        </div >
        <div ><span class="saleLabel" >选择账号：</span ><dyt-select size="small" class="w256" > <Option
            v-for="(item,bindex) in shopList"
            :key="bindex"
            :value="item.saleAccountId"
            :disabled="choseId.indexOf(item.saleAccountId) > -1"
            @click.native="addUser(index,item)" >{{ item.accountCode }}</Option> </dyt-select >
          <div class="mb20 mt10 tag-reset" v-if="model.saleAccountIdList.length > 0" >
            <span class="saleLabel" >已选择账号：</span >
            <Tag
                color="primary"
                v-for="(user,userIndex) in model.saleAccountIdList"
                :key="userIndex"
                @on-close="deleteUser(index,userIndex,user.userId)"
                closable >{{ user.accountCode }}
            </Tag >
          </div >
        </div >
        <div v-for="(k,hindex) in model.action" :key="hindex" class="mb10" >
          <span class="saleLabel" >{{ salesText[hindex] }}</span >
          <Checkbox v-model="k.selectedStatus" :true-value=1 :false-value=0 >
            订单金额转换为币种
          </Checkbox >
          <dyt-select v-model="k.currency" style="width: 150px" class="plr10" size="small" >
          <Option v-for="(item, dindex) in currencyList" :key="dindex" :value="item.value" >{{ item.label }}</Option>
          </dyt-select >之后小于 <span class="plr10" ><InputNumber
            :precision="3" :min="0" :max="99999999" class="w256" v-model.trim="k.price" size="small" /></span >则<dyt-select
            size="small" class="w256 plr10" v-model="k.handlerType" > <Option
            v-for="(item,vIndex) in typeList" :value='item.value' :key="vIndex" >{{ item.label }}</Option> </dyt-select >
        </div >
      </Card >
    </div >
    <div class="footer-btn" v-if="getPermission('afterSalesSetting_saveAutoRefund')" >
      <div class="fr" >
        <Button type="primary" @click="saveHandel" >确定 </Button >
      </div >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'automaticEvaluation',
  mixins: [Mixin],
  data () {
    return {
      typeList: [
        {
          label: '升级为纠纷后自动退款',
          value: 1
        }, {
          label: '直接退款',
          value: 2
        }
      ],
      tabValue: '0',
      single: false,
      salesText: ['未收到货：', '与描述不符：'],
      allSalesSettingDetail: [],
      salesSettingDetail: [],
      tempList: [],
      choseId: [],
      checkValues: []
      /* {
       "action": "string",
       "saleAccountIdList": [
       "string"
       ]
       } */
    };
  },
  created () {
    if (!this.getPermission('afterSalesSetting_detailAutoRefundSetting')) {
      this.gotoError();
      return;
    }
    this.resetDate(); // 初始化数据
    this.getCurrencyInfo();
    this.getShopList(null, '/cs-service/erpCommon');
    this.getDetailAutoFeedbackSetting(true);
  },
  methods: {
    deleteRow (index) {
      let v = this;
      v.salesSettingDetail[index].saleAccountIdList.forEach(i => {
        v.choseId.splice(v.choseId.indexOf(i.saleAccountId), 1);
      });
      this.salesSettingDetail.splice(index, 1);
    },
    addSaleList () {
      this.salesSettingDetail.push({
        action: [
          {
            selectedStatus: 0,
            currency: 'CNY',
            price: '',
            handlerType: 1
          }, {
            selectedStatus: 0,
            currency: 'CNY',
            price: '',
            handlerType: 1
          }
        ],
        saleAccountIdList: []
      });
    },
    addUser (index, item) {
      if (this.choseId.indexOf(item.saleAccountId) > -1) return; // 已选择则不添加
      this.salesSettingDetail[index].saleAccountIdList.push(item);
      this.choseId.push(item.saleAccountId);
    },
    deleteUser (index, userIndex, userId) {
      this.salesSettingDetail[index].saleAccountIdList.splice(userIndex, 1);
      this.choseId.splice(this.choseId.indexOf(userId), 1);
    },
    getTemp () {
      let v = this;
      v.axios.post(api.getFeedTemplate + 'ebay').then(res => {
        if (res.data.code === 0) {
          v.tempList = res.data.datas;
        }
      });
    },
    validHandel () {
      let v = this;
      return new Promise(resolve => {
        let valid = true;
        let text = '';
        if (v.tabValue === '1') {
          valid = !v.salesSettingDetail.some(i => {
            return i.saleAccountIdList.length === 0;
          });
          text = '账号不能为空';
        }
        resolve([valid, text]);
      });
    },
    saveHandel () {
      let v = this;
      v.validHandel().then(data => {
        if (data[0]) {
          let params = v.setParams();
          v.axios.post(api.update_saveAutoRefund, params).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('保存成功');
            }
          });
        } else {
          v.$Message.error(data[1]);
        }
      });
    },
    setParams () {
      let v = this;
      let params = {
        'accountType': v.tabValue
      };
      let detail = {};
      if (v.tabValue === '0') {
        detail = [
          {
            action: JSON.stringify(v.allSalesSettingDetail)
          }
        ];
      } else if (v.tabValue === '1') {
        detail = v.salesSettingDetail.map(i => {
          return {
            saleAccountIdList: i.saleAccountIdList.map(i => i.saleAccountId),
            action: JSON.stringify(i.action)
          };
        });
      }
      params.details = detail;
      return params;
    },
    resetDate () {
      this.salesSettingDetail = [
        {
          action: [
            {
              selectedStatus: 0,
              currency: 'CNY',
              price: '',
              handlerType: 1
            }, {
              selectedStatus: 0,
              currency: 'CNY',
              price: '',
              handlerType: 1
            }
          ],
          saleAccountIdList: []
        }
      ];
      this.allSalesSettingDetail = [
        {
          selectedStatus: 0,
          currency: '',
          price: '',
          handlerType: 1
        }, {
          selectedStatus: 0,
          currency: '',
          price: '',
          handlerType: 1
        }
      ];
    },
    getDetailAutoFeedbackSetting (goTab) {
      let v = this;
      v.resetDate();
      v.axios.get(api.get_detailAutoRefundSetting).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data[0].accountType === 0) {
            if (goTab) {
              v.$nextTick(() => {
                v.tabValue = '0';
              });
            }
            v.allSalesSettingDetail = JSON.parse(data[0].action);
          } else {
            if (goTab) {
              v.$nextTick(() => {
                v.tabValue = '1';
              });
            }
            v.salesSettingDetail = data.map(i => {
              return {
                action: JSON.parse(i.action),
                saleAccountIdList: i.afterSalesSettingAccountList.map(j => {
                  return {
                    saleAccountId: j.saleAccountId,
                    accountCode: j.accountCode
                  };
                }),
                choseId: i.afterSalesSettingAccountList.map(j => {
                  return j.saleAccountId;
                })
              };
            });
            v.choseId = [
              ...new Set(v.salesSettingDetail.reduce((a, b) => {
                return a.concat(b.choseId);
              }, []))
            ];
          }
        }
      });
    }
  },
  watch: {
    tabValue () {
      this.getDetailAutoFeedbackSetting();
    }
  }
};
</script >
<style >
.tag-reset .ivu-tag-text, .tag-reset .ivu-tag i.ivu-icon {
  color: #fff !important;
}

</style >
<style scoped >
.saleLabel {
  display: inline-block;
  width: 110px;
}

.b-content {
  padding: 16px 16px 40px 16px;
  min-height: 456px;
  position: relative;
  padding-bottom: 100px;
}

.sale-close {
  position: absolute;
  right: 5px;
  top: 5px;
  color: red;
  cursor: pointer
}

.footer-btn {
  position: absolute;
  height: 100px;
  bottom: 0;
  left: 0;
  width: 100%;
  padding-right: 100px;
}

.operate-box {
  padding: 6px 10px;
  width: 100%;
  background-color: #e5e5e5;
  margin-bottom: 10px;
}
</style >
