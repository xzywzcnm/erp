<template >
  <div class="issueLogisticsRule">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form class="normalTop" :model="pageParams" :label-width="80" label-position="left">
            <dyt-filter :filter-row="1">
              <!-- 状态 -->
              <FormItem label="状态" :label-width="40">
                <dyt-select v-model="pageParams.status">
                  <Option v-for="(item,index) in logisticsList" :key="index" :value="item.status">{{ item.title }}</Option>
                </dyt-select>
              </FormItem>
              <!-- 仓库 -->
              <Form-item label="仓库名称">
                <dyt-select style="width:230px;" v-model="pageParams.warehouseId" filterable>
                  <Option v-for="item in wrapperList" :key="item.warehouseId" :value="item.warehouseId" :v="item.saleAccountId">{{ item.warehouseName }}</Option>
                </dyt-select>
              </Form-item>
              <div slot="operation">
                <Button style="marginLeft:10px;" v-if="getPermission('wmsWarehouseAutoRule_queryAutoUploadCarrierRule')" type="primary" :disabled="SearchDisabled" icon="md-search" @click="search">查询</Button>
                <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <!-- 操作 -->
    <!-- <div class="tableControl">
      <Button style="margin-left:10px;" type="primary" @click="addAllotRule">
        新建规则
      </Button>
    </div> -->
    <!-- 表格 -->
    <div class="orderTable normalTop">
      <Table highlight-row border :loading="tableLoading" :height="tableHeight" :columns="allotRuleColumn" :data="allotRuleData"></Table>
    </div>
    <!-- 新建、编辑规则 -->
    <Modal width="700" :title="allotRuleModalTit" v-model="allotRuleModal" v-if="allotRuleModalStatus">
      <!-- <span>仓库：</span>
      <dyt-select style="width:230px;marginLeft:10px;" v-model="allotRuleparams.warehouseId" filterable>
        <Option v-for="item in wrapperModalList" :key="item.warehouseId" :value="item.warehouseId" :v="item.saleAccountId">{{item.warehouseName}}</Option>
      </dyt-select> -->
      <Divider orientation="left">开关设置</Divider>
      <i-switch size="large" v-model="allotRuleparams.status">
        <span slot="open">启用</span> <span slot="close">停用</span>
      </i-switch>
      <Divider orientation="left">时间设置</Divider>
      <Card :bordered="false" dis-hover style="overflowX:auto;">
        <Form class='timeSet'>
          <FormItem label="自动下发物流商时间：">
            <RadioGroup v-model="allotRuleparams.timeSetting">
              <Radio label="1">
                <span>固定时间</span> <span style="marginLeft:10px;">每过<InputNumber size='small' v-model='allotRuleparams.repeatIntervalAutoPoint'></InputNumber></span>
              </Radio>
              <dyt-select v-model="allotRuleparams.repeatIntervalAutoPointUnit" size='small' style="width: 80px">
                <Option v-for="item in repeatIntervalAutoPointUnits" :value="item.key" :key="item.key">{{ item.value }}</Option>
              </dyt-select> <span>下发物流商</span> <br>
              <Radio label="2">
                <span>每天定时</span> <span style="marginLeft:10px;">每天<TimePicker format="HH:mm" v-model='v.time' style="width: 80px;margin-right: 5px" size='small' v-for='(v,i) in addInputDataList' :key='i'></TimePicker>
                  <span @click='addTimePicker'>
                    <Icon type="md-add-circle" style='font-size: 18px'></Icon>
                  </span>
                  <span @click='dltTimePicker'>
                    <Icon type="md-remove-circle" style='font-size: 18px' v-if='addInputDataList.length>1'></Icon>
                  </span>下发物流商</span>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Form>
      </Card>
      <Divider orientation="left">其他设置</Divider>
      <Form class='timeSet'>
        <FormItem label="自动下发物流商范围:">
          <RadioGroup v-model="pickingStatusList">
            <Radio label="1">全部</Radio>
            <Radio label="2">已分配完成出库单</Radio>
          </RadioGroup>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button @click="cancelRule">取消</Button>
        <Button type="error" @click="saveRule">确定 </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      tableHeight: 650,
      pickingStatusList: '1',
      pageParamsStatus: false, // 刷新
      pageParams: {
        status: 1,
        warehouseId: 'null'
      },
      repeatIntervalAutoPointUnits: [
        {
          key: 1,
          value: '小时'
        }, {
          key: 2,
          value: '分钟'
        }
      ],
      logisticsList: [ // 状态
        {
          selected: true,
          status: 3,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '启用'
        }, {
          selected: false,
          status: 0,
          title: '停用'
        }
      ],
      wrapperList: [ // 仓库
        {
          warehouseId: 'null',
          warehouseName: '全部'
        }
      ],
      wrapperModalList: [], // 规则详情仓库列表
      allotRuleData: [],
      allotRuleColumn: [
        {
          title: 'NO.',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '仓库',
          key: 'warehouseId',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let name = null;
            if (this.wrapperList) {
              this.wrapperList.forEach((n, i) => {
                if (n.warehouseId === params.row.warehouseId) {
                  name = n.warehouseName;
                }
              });
            }
            return h('div', name);
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.status) {
              return h('div', {
                style: {
                  color: '#008000'
                }
              }, '启用');
            } else {
              return h('div', {
                style: {
                  color: '#FF0000'
                }
              }, '停用');
            }
          }
        }, {
          title: '最后修改人',
          key: 'updatedBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.userInfoMap && this.userInfoMap[params.row.updatedBy]) {
              return h('div', this.userInfoMap[params.row.updatedBy].userName);
            }
            return h('div', '');
          }
        }, {
          title: '最后修改时间',
          key: 'updatedTime',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '操作',
          key: 'operate',
          minWidth: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px',
                  display: (() => {
                    return this.getPermission('wmsWarehouseAutoRule_setAutoUploadCarrierTask')
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.showModal(params.row);
                  }
                }
              }, '编辑'), params.row.status ? h('Button', {
                style: {
                  display: (() => {
                    return this.getPermission('wmsWarehouseAutoRule_disableAutoUploadCarrierRule')
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.disableRule(params.row);
                  }
                }
              }, '停用') : h('Button', {
                style: {
                  display: (() => {
                    return this.getPermission('wmsWarehouseAutoRule_enableAutoDistributeRule')
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.enableRule(params.row);
                  }
                }
              }, '启用')
            ]);
          }
        }
      ],
      userInfoMap: [],
      allotRuleModal: false,
      allotRuleModalStatus: false,
      allotRuleModalTit: null,
      addInputDataList: [{ time: '' }], // 每天定时的时间点
      saveLoading: true,
      allotRuleparams: {
        warehouseId: null,
        status: true,
        dayDateAutoPoint: '', // 每天定时的时间点
        repeatIntervalAutoPoint: null, // 任务执行的固定周期,单位时，如每隔n小时执行
        repeatIntervalAutoPointUnit: 1, // 任务执行的固定周期,单位时，如每隔n小时执行
        timeSetting: '1' // 时间设置选择,1开启固定周期,2开启每天定时
      }
    };
  },
  methods: {
    search () { // 查询
      let v = this;
      v.pageParamsStatus = true;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.status = 3;
      v.pageParams.warehouseId = 'null';
    },
    addAllotRule () { // 新建规则
      let v = this;
      v.allotRuleModal = true;
      v.allotRuleModalStatus = true;
      v.allotRuleModalTit = '下发物流商规则--创建';
    },
    getList () { // 查询仓下发物流商规则
      let v = this;
      if (!v.getPermission('wmsWarehouseAutoRule_queryAutoUploadCarrierRule')) return;
      let obj = {
        warehouseIds: v.pageParams.warehouseId === 'null' ? null : [v.pageParams.warehouseId],
        status: v.pageParams.status == 3 ? null : v.pageParams.status
      };
      let pos = [];
      v.loadingTrue();
      v.axios.post(api.wmsService + api.query_carrierRule, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              pos.push(n.updatedBy);
            });
            Promise.resolve(v.getUserInfoMap(pos)).then(result => {
              v.loadingFalse();
              v.allotRuleData = data;
            });
          } else {
            v.loadingFalse();
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    // 获取仓库下拉列表
    getWareHouseName () {
      var v = this;
      v.axios.post(api.queryUserAllwarehouse).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data) {
            data.forEach((n, i) => {
              v.wrapperList.push(n);
            });
            v.wrapperModalList = data;
          }
        }
      });
    },
    getUserInfoMap (userIds) {
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userInfoMap = response.data.datas;
              resolve(true);
            }
          }).finally(() => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    },
    disableRule (row) { // 停用
      const id = row.wmsWarehouseAutoRuleId;
      let warehouseInfo = (this.wrapperList || []).find(n => n.warehouseId === row.warehouseId);
      if (this.$common.isEmpty(warehouseInfo)) {
        warehouseInfo = { warehouseName: '' };
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认停用：<span style="color: #f20;">${warehouseInfo.warehouseName}</span>`,
        onOk: () => {
          this.axios.put(api.wmsService + api.disable_carrierRule + id).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('停用成功');
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    enableRule (row) { // 启用
      const id = row.wmsWarehouseAutoRuleId;
      let warehouseInfo = (this.wrapperList || []).find(n => n.warehouseId === row.warehouseId);
      if (this.$common.isEmpty(warehouseInfo)) {
        warehouseInfo = { warehouseName: '' };
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认启用：<span style="color: #f20;">${warehouseInfo.warehouseName}</span>`,
        onOk: () => {
          this.axios.put(api.wmsService + api.enable_carrierRule + id).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('启用成功');
              this.pageParamsStatus = true;
            }
          });
        }
      });
    },
    saveRule () { // 保存规则
      let v = this;
      let pos = [];
      // if (!v.allotRuleparams.warehouseId) {
      //   v.$Message.error(v.t('issueLogisticsRule.saveError'));
      //   v.saveLoading = false;
      //   v.$nextTick(function () {
      //     v.saveLoading = true;
      //   });
      //   return false;
      // }
      if (v.allotRuleparams.status) {
        v.allotRuleparams.status = 1;
      } else {
        v.allotRuleparams.status = 0;
      }
      let valid = true;
      if (v.allotRuleparams.timeSetting === '2') {
        if (v.addInputDataList[0].time) {
          //  保存传零时区
          let time = v.$common.getDefaultTimezoom();
          v.addInputDataList.forEach((n, i) => {
            let utc = n.time.split(':');
            let uTime = null;
            if (time) {
              let str = time > 0 ? '+' : '-';
              let num = time;
              if (str === '+') {
                uTime = Number(utc[0]) - Number(num) < 0
                  ? 24 + Number(utc[0]) - Number(num)
                  : Number(utc[0]) - Number(num);
              } else if (str === '-') {
                uTime = Number(utc[0]) + Number(num) > 24
                  ? Number(utc[0]) + Number(num) - 24
                  : Number(utc[0]) + Number(num);
              }
            }
            if (!utc[1]) {
              valid = false;
            }
            let strTime = uTime.toString() + ':' + utc[1];
            pos.push(strTime);
          });
        } else {
          valid = false;
        }
      }
      if (!valid) {
        v.$Message.error('请填写每天定时时间');
        return;
      }
      v.allotRuleparams.dayDateAutoPoint = pos;
      let obj = {
        pickingStatusList: v.pickingStatusList === '1' ? null : ['2']
      };
      v.allotRuleparams.otherSettingJson = JSON.stringify(obj);
      v.axios.post(api.wmsService + api.set_carrierRule, v.allotRuleparams).then(response => {
        if (response.data.code === 0) {
          // v.saveLoading = false;
          v.allotRuleModal = false;
          v.cancelRule();
          v.pageParamsStatus = true;
          v.$Message.success('操作成功');
        } else {
          v.saveLoading = false;
          v.$nextTick(function () {
            v.saveLoading = true;
          });
        }
      });
    },
    cancelRule () { // 取消规则
      let v = this;
      v.allotRuleModal = false;
      v.allotRuleparams.warehouseId = null;
      v.allotRuleparams.status = true;
      v.allotRuleparams.dayDateAutoPoint = '';
      v.allotRuleparams.repeatIntervalAutoPoint = null;
      v.allotRuleparams.repeatIntervalAutoPointUnit = 1;
      v.allotRuleparams.timeSetting = '1';
      v.addInputDataList = [{ time: '' }];
    },
    addTimePicker () {
      this.addInputDataList.push({ time: '' });
    },
    dltTimePicker () {
      this.addInputDataList.pop();
    },
    showModal (val) {
      let v = this;
      let pos = [];
      if (val.dayDateAutoPoint) { // 转时区
        let time = v.$common.getDefaultTimezoom();
        let list = val.dayDateAutoPoint.split(',');
        list.forEach((n, i) => {
          let utc = n.split(':');
          let uTime = null;
          if (time) {
            let str = time > 0 ? '+' : '-';
            let num = time;
            if (str === '+') {
              uTime = Number(utc[0]) + Number(num) > 24
                ? Number(utc[0]) + Number(num) - 24
                : Number(utc[0]) + Number(num);
            } else if (str === '-') {
              uTime = Number(utc[0]) - Number(num) < 0
                ? 24 + Number(utc[0]) - Number(num)
                : Number(utc[0]) - Number(num);
            }
          }
          let strTime = uTime.toString() + ':' + utc[1];
          pos.push({ 'time': strTime });
        });
        v.addInputDataList = pos;
      }
      let value = val.otherSettingJson ? JSON.parse(val.otherSettingJson).pickingStatusList : null;
      v.pickingStatusList = !value ? '1' : '2';
      v.allotRuleparams.warehouseId = val.warehouseId;
      v.allotRuleparams.status = (val.status === 1);
      v.allotRuleparams.dayDateAutoPoint = val.dayDateAutoPoint;
      v.allotRuleparams.repeatIntervalAutoPoint = Number(val.repeatIntervalAutoPoint);
      v.allotRuleparams.repeatIntervalAutoPointUnit = Number(val.repeatIntervalAutoPointUnit);
      v.allotRuleparams.timeSetting = val.timeSetting;
      v.allotRuleModal = true;
      v.allotRuleModalStatus = true;
      v.allotRuleModalTit = '下发物流商规则--编辑';
    }
  },
  created () {
    let v = this;
    this.tableHeight = this.getTableHeight(185);
    v.getPermissionCallback('logistics_issueLogisticsRule').then(() => {
      v.getList();
      v.getWareHouseName(); // 调用仓库下拉列表
    });
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
};
</script >
