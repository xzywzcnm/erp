<template >
  <div class="tabContainer" >
    <Tabs
        type="card" v-model="tabValue" >
      <TabPane
          label="所有账号" name="0" ></TabPane >
      <TabPane
          label="非所有账号" name="1" ></TabPane >
    </Tabs >
    <div
        v-if="tabValue === '0'" class="b-content" >
      <div >
        <Checkbox
            :true-value=1 :false-value=0 v-model="allSalesSettingDetail.selectedStatus" >
          当买家给我留了好评的时候自动给买家留评价，评价内容从评价模板
        </Checkbox >
        <dyt-select
            class="w256" v-model="allSalesSettingDetail.feedbackTemplateId" > <Option
            v-for="(item,index) in tempList" :key="index" :value="item.feedbackTemplateId" >{{ item.name }}</Option>
        </dyt-select >
      </div >
    </div >
    <div
        v-if="tabValue === '1'" class="b-content" >
      <div
          class="operate-box" v-if="getPermission('afterSalesSetting_saveAutoFeedback')" >
        <Button @click="addSaleList" >新增一组账号</Button >
      </div >
      <Card
          v-for="(model,index) in salesSettingDetail" :key="index" class="mb10" dis-hover >
        <div
            class="sale-close" v-if="salesSettingDetail.length > 1" >
          <Icon
              @click="deleteRow(index)" size="22" type="md-close" />
        </div >
        <div class="mb10" ><span class="saleLabel" >选择账号：</span ><dyt-select
            size="small" class="w256" > <Option
            v-for="(item,dindex) in shopList"
            :key="dindex"
            :value="item.saleAccountId"
            :disabled="choseId.indexOf(item.saleAccountId) > -1"
            @click.native="addUser(index,item)" >{{ item.accountCode }}</Option> </dyt-select >
          <div
              class="mb20 mt10 tag-reset" v-if="model.saleAccountIdList.length > 0" >
            <span class="saleLabel" >已选择账号：</span >
            <Tag
                color="primary"
                v-for="(user,userIndex) in model.saleAccountIdList"
                :key="userIndex"
                @on-close="deleteUser(index,userIndex,user.saleAccountId)"
                closable >{{ user.accountCode }}
            </Tag >
          </div >
        </div >
        <div >
          <Checkbox
              v-model="model.selectedStatus" :true-value=1 :false-value=0 >
            当买家给我留了好评的时候自动给买家留评价，评价内容从评价模板
          </Checkbox >
          <dyt-select
              class="w256" v-model="model.feedbackTemplateId" size="small" > <Option
              v-for="(item,index) in tempList" :key="index" :value="item.feedbackTemplateId" >{{ item.name }}</Option>
          </dyt-select >
        </div >
      </Card >
    </div >
    <div
        class="footer-btn" v-if="getPermission('afterSalesSetting_saveAutoFeedback')" >
      <div class="fr" >
        <Button
            type="primary" @click="saveHandel" >确定 </Button >
      </div >
    </div >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'automaticEvaluation',
  mixins: [Mixin],
  data () {
    return {
      tabValue: '0',
      single: false,
      allSalesSettingDetail: {},
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
    if (!this.getPermission('afterSalesSetting_detailAutoFeedbackSetting')) {
      this.gotoError();
      return;
    }
    this.resetDate(); // 初始化数据
    this.getShopList(null, '/cs-service/erpCommon');
    this.getTemp(); // 获取模板
    this.getDetailAutoFeedbackSetting(true);
  },
  methods: {
    resetDate () {
      this.allSalesSettingDetail = {
        selectedStatus: 0,
        feedbackTemplateId: ''
      };
      this.salesSettingDetail = [
        {
          selectedStatus: 0,
          feedbackTemplateId: '',
          saleAccountIdList: []
        }
      ];
    },
    deleteRow (index) {
      let v = this;
      v.salesSettingDetail[index].saleAccountIdList.forEach(i => {
        v.choseId.splice(v.choseId.indexOf(i.saleAccountId), 1);
      });
      v.salesSettingDetail.splice(index, 1);
    },
    addSaleList () {
      this.salesSettingDetail.push({
        action: [
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
      v.validHandel().then((valid) => {
        if (valid[0]) {
          let params = v.setParams();
          v.axios.post(api.update_saveAutoFeedback, params).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('保存成功');
            }
          });
        } else {
          v.$Message.error(valid[1]);
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
            action: JSON.stringify({
              selectedStatus: v.allSalesSettingDetail.selectedStatus,
              feedbackTemplateId: v.allSalesSettingDetail.feedbackTemplateId
            })
          }
        ];
      } else if (v.tabValue === '1') {
        detail = v.salesSettingDetail.map(i => {
          return {
            saleAccountIdList: i.saleAccountIdList.map(i => i.saleAccountId),
            action: JSON.stringify({
              selectedStatus: i.selectedStatus,
              feedbackTemplateId: i.feedbackTemplateId
            })
          };
        });
      }
      params.details = detail;
      return params;
    },
    getDetailAutoFeedbackSetting (goTab) {
      /**
       * params
       * goTab 是否跳转到相应tab Boolean
       * */
      let v = this;
      v.resetDate();
      v.axios.get(api.get_detailAutoFeedbackSetting).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data[0].accountType === 0) {
            if (goTab) {
              v.$nextTick(() => {
                v.tabValue = '0';
              });
            }

            v.allSalesSettingDetail.selectedStatus = JSON.parse(data[0].action).selectedStatus;
            v.allSalesSettingDetail.feedbackTemplateId = JSON.parse(data[0].action).feedbackTemplateId;
          } else {
            if (goTab) {
              v.$nextTick(() => {
                v.tabValue = '1';
              });
            }
            v.salesSettingDetail = data.map(i => {
              return {
                selectedStatus: JSON.parse(i.action).selectedStatus,
                feedbackTemplateId: JSON.parse(i.action).feedbackTemplateId,
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
  bottom: -50px;
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
