<style scoped >
/* .radio {} */

.mode {
  padding: 10px 20px;
  border-radius: 5px;
  border: 1px solid #BECDDD;
  background: #F1F6FC;
  text-align: center;
  display: inline-block;
  font-size: 14px;
}

.dropright {
  vertical-align: middle;
  margin-left: 20px;
  margin-right: 5px;
  display: inline-block;
}

.rightArrow {
  border-width: 12px;
  border-style: solid;
  border-color: transparent transparent transparent #BFE3F6;
  margin-bottom: 5px;
  display: inline-block;
}
</style>
<template>
  <div>
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformParamsSelect" >
            <span style="font-size: 18px;line-height: 24px;font-weight: 700;" >
              采购模式：
            </span > <span >
              <RadioGroup v-model="procurementMode.dataValue" >
                <Radio label="1" style="margin-left: 20px;" >常规模式</Radio >
                <!--  <Radio label="2" style="margin-left: 20px;">快捷模式</Radio>-->
              </RadioGroup >
            </span >
          </div >
          <div class="normalTop30" >
            <template v-if="procurementMode.dataValue == '1' || procurementMode.dataValue == ''" >
              <span class="mode" >
                备货建议
              </span > <span class="dropright" >
                <span class="rightArrow" ></span >
              </span > <span class="mode" >
                备货计划
              </span > <span class="dropright" >
                <span class="rightArrow" ></span >
              </span > <span class="mode" >
                采购需求
              </span > <span class="dropright" >
                <span class="rightArrow" ></span >
              </span > <span class="mode" >
                采购单
              </span >
            </template >
            <template v-else-if="procurementMode.dataValue == '2'" >
              <span class="mode" >
                备货建议
              </span > <span class="dropright" >
                <span class="rightArrow" ></span >
              </span > <span class="mode" >
                备货计划
              </span >
            </template >
          </div >
        </div >
      </div >
    </div >
    <div class="commonFilter normalTop30" >
      <div class="orderTable" >
        <div data-v-119457ba="" class="ivu-table-wrapper" >
          <div class="ivu-table ivu-table-border" ><!---->
            <div class="ivu-table-header" >
              <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;" >
                <tbody class="ivu-table-tbody" >
                <tr class="ivu-table-row" >
                  <td class="ivu-table-column-center" style="width: 300px;" >
                    <div class="ivu-table-cell" >
                      SKU采购人员设置
                    </div >
                  </td >
                  <td class="ivu-table-column-right" >
                    <div class="ivu-table-cell" >
                      SKU采购人员设置
                    </div >
                  </td >
                  <td class="ivu-table-column-center" >
                    <div class="ivu-table-cell" >
                      <RadioGroup v-model="purchaserSettings.dataValue" >
                        <Radio label="1" style="margin-left: 20px;" > SKU采购人员同供应商采购人</Radio >
                        <!-- <Radio label="2" style="margin-left: 20px;" disabled>SKU自由设置采购人</Radio>-->
                      </RadioGroup >
                    </div >
                  </td >
                </tr >
                </tbody >
              </table >
            </div >
          </div >
        </div >
        <div class="clear normalTop30" >
          <div class="table-page-right" >
            <Button
                type="primary"
                @click="save"
                v-if="getPermission('procurementBase_save')"
                :loading="saveLoading"
                class="iconbuttons"
                style="width: 100px;" >
              保存 </Button >
            <!-- <Button type="primary" class="iconbuttons" style="margin-left: 12px;width: 100px;">
              取消
            </Button> -->
          </div >
        </div >
      </div >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    // let self = this;
    return {
      loading: false,
      pageParamsStatus: false,
      saveLoading: false,
      procurementMode: {
        dataType: 'purchaseBaseSetting',
        dataCode: 'purchaseModalSetting',
        dataValue: ''
      },
      purchaserSettings: {
        dataType: 'purchaseBaseSetting',
        dataCode: 'purchaserSetting',
        dataValue: ''
      },
      pageParams: {
        pageNum: 1,
        pageSize: 10
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    }
  },
  activated () {
    this.startLoading();
  },
  methods: {
    startLoading () {
      let v = this;
      v.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      v.axios.get(api.baseDataList + '?dataType=purchaseBaseSetting').then(response => {
        if (response.data.code == 0 && response.data.datas) {
          let arr = response.data.datas;
          arr.forEach((n, i) => {
            if (n.dataCode == 'purchaseModalSetting') {
              v.procurementMode = n;
            } else if (n.dataCode == 'purchaserSetting') {
              v.purchaserSettings = n;
            }
          });
        }
      });
    },
    save () {
      let v = this;
      if (!v.procurementMode.dataValue) {
        v.$Message.warning('请选择采购模式！');
      } else if (!v.purchaserSettings.dataValue) {
        v.$Message.warning('请选择SKU采购人员设置！');
      } else {
        v.saveLoading = true;
        let arr = [];
        arr.push(v.procurementMode);
        arr.push(v.purchaserSettings);
        v.axios.post(api.procurementBaseSave, arr).then(res => {
          v.saveLoading = false;
          if (res.data.code == 0) {
            v.$Message.success('保存成功！');
            v.pageParamsStatus = true;
            // 存储用户选择的采购模式
            sessionStorage.setItem('purchaseMode', v.procurementMode.dataValue);
            v.$store.commit('purchaseMode', v.procurementMode.dataValue);
            v.$store.commit('menuStatus', true); // 刷新左侧菜单栏
          }
        });
      }
    }
  }
};
</script >
