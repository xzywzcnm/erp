<template>
  <div>
    <div class="shopTable">
      <Button type="primary" class="mr10" @click="openAddModal" v-if="getPermission('exchangeRate_insert')">添加 </Button>
      <Button class="mr10" @click="updateOfficialExchangeRate"
        v-if="getPermission('exchangeRate_updateOfficialExchange')">更新官方汇率 </Button>
      <!-- <Icon class="mr10" style="cursor: pointer;" v-if="getPermission('exchangeRate_update')" size="16" @click="openSettingModal" type="md-settings" /> -->
      <Button class="mr10" @click="updateOfficialToSelf"
        v-if="getPermission('exchangeRate_officialToLocal')">批量更新官方汇率至我的汇率 </Button>
      <Button class="mr10" v-if="getPermission('exchangeRate_update')" @click="openSettingModal">
        <Icon class="mr10" type="md-settings" style="font-size:16px" />汇率更新设置
      </Button>
    </div>
    <div class="shopTable">
      <Table highlight-row :border="true" :loading="loading2" :columns="columns" :data="data1"></Table>
    </div>
    <!--添加汇率-->
    <Modal :mask-closable="false" v-model="modal1" width="900" title="添加汇率">
      <Table highlight-row border max-height="450" :loading="loading1" :columns="columns2" :data="data2"
        @on-selection-change="checkDateMt"></Table>
      <div slot="footer">
        <Button @click="addExchangeRate" type="primary">保存 </Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
    <!--汇率更新设置-->
    <Modal :mask-closable="false" v-model="modal2" width="900" title="汇率更新设置">
      <div style="display:flex;align-items:center">
        <div class="line mr10"></div>
        <span>更新频率设置</span>
      </div>
      <div class="p10">
        <Checkbox v-model="isUpdate"></Checkbox>
        <span>自动更新官方汇率与我的汇率,每天北京时间22:00更新最新汇率;</span>
      </div>
      <div style="display:flex;align-items:center">
        <div class="line mr10"></div>
        <span>我的汇率更新设置</span>
      </div>
      <div class="mt10 mb10">
        选择币种<dyt-select class="ml10" style="width: 200px" v-model="checkSettingCurrency">
          <Option v-for="(item, index) in data1" :key="index" :value="item.targetCurrencyCode">{{ item.currencyName }}
          </Option>
        </dyt-select>
        <Button class="ml10" @click="addSettingCurrency">添加 </Button>
      </div>
      <Table highlight-row border :columns="columns3" :loading="loading3" :data="data3"></Table>
      <p>说明：</p>
      <p>1.设置了汇率更新比率的币种,在手动系统定时更新基准汇率时,会自动更新我的汇率”,计算公式=基准汇率*比率</p>
      <p>例如:设置欧元更新比率为95% ,欧元最新的基准汇率为8.0。则更新后的“我的汇率*=8 0*95%=7.6</p>
      <p>2.设置了汇率更新比率的币种不能手工设置汇率</p>
      <div slot="footer">
        <Button @click="updateExchangeRate" type="primary" v-if="getPermission('exchangeRate_settingUpdateRate')">保存
        </Button>
        <Button @click="modal2 = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'exchangeRate',
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      modal1: false, // 添加汇率
      modal2: false, // 汇率更新设置
      loading1: false,
      loading2: false,
      loading3: false,
      checkSettingCurrency: '', // 更新汇率比币种
      columns: [
        {
          title: '代码', // 代码
          minWidth: 140,
          align: 'center',
          key: 'targetCurrencyCode'
        }, {
          title: '符号', // 符号
          minWidth: 140,
          align: 'center',
          key: 'currencySymbol'
        }, {
          title: '名称', // 名称
          minWidth: 140,
          align: 'center',
          key: 'currencyName'
        }, {
          title: '官方汇率', // 官方汇率
          minWidth: 140,
          align: 'center',
          key: 'officialExchangeRate'
        }, {
          title: '我的汇率',
          minWidth: 180,
          align: 'center',
          key: 'merchantExchangeRate',
          render (h, params) {
            if (params.row.updateRate) {
              return h('div', params.row.merchantExchangeRate + '(已设置更新汇率比)');
            } else {
              if (params.row.edit) {
                return h('p', {}, [
                  h('Input', {
                    style: {
                      width: '100px'
                    },
                    props: {
                      value: params.row.merchantExchangeRate,
                      maxLength: 200
                    },
                    on: {
                      input (val) {
                        v.$set(v.data1[params.index], 'merchantExchangeRate', val);
                      }
                    }
                  }), h('Icon', {
                    class: 'cursor-bold',
                    props: {
                      type: 'md-checkmark',
                      size: '18'
                    },
                    on: {
                      'click' () {
                        if (v.typeOf(Number(params.row.merchantExchangeRate)) !== 'number' || isNaN(Number(params.row.merchantExchangeRate))) {
                          v.$Message.info('请输入数字');
                          return;
                        }
                        if (Number(params.row.merchantExchangeRate) < 0.0001) {
                          v.$Message.info('最小值为0.0001');
                          return;
                        }
                        v.updateExchange(params.row.exchangeRateId, params.row.merchantExchangeRate, params.index);
                        v.$nextTick(() => {
                          v.data1[params.index].edit = false;
                        });
                      }
                    }
                  }), h('Icon', {
                    class: 'cursor-bold',
                    props: {
                      type: 'md-close',
                      size: '18'
                    },
                    on: {
                      'click' () {
                        v.data1[params.index].merchantExchangeRate = v.data1[params.index].oldMerchantExchangeRate;
                        v.$nextTick(() => {
                          v.data1[params.index].edit = false;
                        });
                      }
                    }
                  })
                ]);
              } else {
                return h('div', {
                  style: {
                    'color': 'blue',
                    'cursor': 'pointer',
                    'text-decoration': 'underline'
                  },
                  on: {
                    'click' () {
                      /* let data = JSON.parse(JSON.stringify(params.row));
                       data.edit = true; */
                      v.data1[params.index].edit = true;
                    }
                  }
                }, params.row.merchantExchangeRate);
              }
            }
          }
        }, {
          title: '是否是主货币',
          minWidth: 140,
          align: 'center',
          key: 'merchantExchangeRate',
          render (h, params) {
            let isTrue = params.row.baseCurrencyCode === params.row.targetCurrencyCode;
            let text = isTrue ? '是' : '否';
            return h('span', {
              style: {
                color: isTrue ? 'green' : ''
              }
            }, text);
          }
        },
        {
          title: '首页显示',
          minWidth: 140,
          align: 'center',
          key: 'isShow',
          render: (h, { row }) => {
            return h('RadioGroup', {
              props: {
                type: 'button',
                buttonStyle: 'solid',
                value: row.isShow
              },
              on: {
                'on-change': (val) => {
                  row.isShow = val
                  let temp = (val == '开') ? '1' : '0'
                  v.axios.get(api.updateShowStatusById + `?exchangeRateId=${row.exchangeRateId}&showStatus=${temp}`).then(res => {

                  })
                }
              }
            }, [
              h('Radio', {
                props: {
                  label: '开'
                }
              }),
              h('Radio', {
                props: {
                  label: '关'
                },
                style: {
                  background: (row.isShow == '关') ? '#ff001d' : '',
                  borderColor: (row.isShow == '关') ? '#ff001d' : '',
                  boxShadow: (row.isShow == '关') ? '-1px 0 0 0 red' : ''
                }
              })
            ])
          }
        },
        {
          title: '最后更新时间',
          minWidth: 140,
          align: 'center',
          key: 'updatedDate',
          render (h, params) {
            return h('span', v.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }
      ],
      data1: [],
      checkAddData: [],
      columns3: [
        {
          title: '代码',
          minWidth: 140,
          align: 'center',
          key: 'targetCurrencyCode'
        }, {
          title: '符号',
          minWidth: 140,
          align: 'center',
          key: 'baseCurrencyCode'
        }, {
          title: '名称',
          minWidth: 140,
          align: 'center',
          key: 'currencyName'
        }, {
          title: '汇率更新比率%',
          minWidth: 140,
          align: 'center',
          render (h, params) {
            return h('p', {}, [
              h('Input', {
                style: {
                  width: '100px'
                },
                props: {
                  value: v.data3[params.index].updateRate,
                  size: 'small'
                },
                on: {
                  'on-change': (e) => {
                    let data = JSON.parse(JSON.stringify(params.row));
                    data.updateRate = e.target.value;
                    v.data3[params.index] = data;
                  }
                }
              }), h('span', '%')
            ]);
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          width: 120,
          render (h, params) {
            return !v.getPermission('exchangeRate_deleteUpdateRate') || h('Button', {
              props: {
                type: 'error',
                size: 'small'
              },
              on: {
                'click' () {
                  v.isDelModal(() => {
                    v.deleteCurrencyRate(params.row.exchangeRateId);
                    v.data3.splice(params.index, 1);
                  });
                }
              }
            }, '删除');
          }
        }
      ],
      columns2: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '代码',
          minWidth: 140,
          align: 'center',
          key: 'currencyCode'
        }, {
          title: '符号',
          minWidth: 140,
          align: 'center',
          key: 'currencySymbol'
        }, {
          title: '名称',
          minWidth: 140,
          align: 'center',
          key: 'currencyName'
        }, {
          title: '汇率',
          minWidth: 140,
          align: 'center',
          key: 'exchangeRate'/*,
           sortable: true */
        }
      ], // 添加汇率列表
      data2: [], // 添加汇率列表数据
      data3: [], // 添加汇率比列表数据
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: { // 参数
        pageNum: 1,
        pageSize: 10,
        status: null,
        roleId: null,
        orderBy: 'userName',
        upDown: 'up',
        searchValue: null // 搜索内容
      },
      isUpdate: true
    };
  },
  created () {
    this.getList();
  },
  props: {},
  watch: {},
  methods: {
    updateExchange (exchangeRateId, exchange, index) {
      // 更新商户汇率
      let v = this;
      v.axios.post(api.update_exchangeRateUpdateById + '?exchangeRateId=' + exchangeRateId + '&exchange=' + exchange).then(response => {
        if (response.data.code === 0) {
          v.data1[index].oldMerchantExchangeRate = v.data1[index].merchantExchangeRate;
          v.$Message.success('操作成功');
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    deleteCurrencyRate (id) {
      // 删除汇率比
      let v = this;
      v.axios.delete(api.detele_deleteUpdateRate + id).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          // v.getQueryExistUpdateRate();
          v.getList();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    },
    addSettingCurrency () {
      // 添加更新货币到汇率更新比
      let v = this;
      if (!v.checkSettingCurrency) {
        v.$Message.info('请选择货币');
        return;
      }
      let name = '货币';
      let valid = v.data3.some(i => {
        if (i.targetCurrencyCode === v.checkSettingCurrency) {
          name = i.currencyName;
          return true;
        }
      });
      if (valid) {
        v.$Message.info(name + '已添加');
        return;
      }
      let row = v.data1.filter(i => i.targetCurrencyCode === v.checkSettingCurrency)[0];
      v.data3.push(row);
    },
    openSettingModal () {
      // 打开设置弹窗
      let v = this;
      v.modal2 = true;
      v.checkSettingCurrency = null;
      v.getCurrencyInfo();
      v.getQueryExistUpdateRate();
    },
    openAddModal () {
      // 打开添加弹窗
      let v = this;
      v.modal1 = true;
      v.getExchangeRateOfficial();
    },
    getQueryExistUpdateRate () {
      // 获取更新汇率比
      let v = this;
      if (!v.getPermission('exchangeRate_queryExistUpdateRate')) {
        v.data3 = [];
        v.$Message.info('无权限');
        return;
      }
      v.loading3 = true;
      v.axios.get(api.get_queryExistUpdateRate).then(response => {
        v.loading3 = false;
        if (response.data.code === 0) {
          v.data3 = response.data.datas;
        }
      });
    },
    getExchangeRateOfficial () {
      // 获取官方汇率
      let v = this;
      v.loading1 = true;
      v.axios.get(api.get_exchangeRateOfficial).then(response => {
        v.loading1 = false;
        if (response.data.code === 0) {
          v.data2 = response.data.datas;
        }
      });
    },
    getList () {
      let v = this;
      if (!v.getPermission('exchangeRate_query')) {
        v.getError();
        return;
      }
      v.loading2 = true;
      v.axios.get(api.get_exchangeRateQuery).then(response => {
        v.loading2 = false;
        if (response.data.code === 0) {
          response.data.datas.forEach(i => {
            i.edit = false;
            i.oldMerchantExchangeRate = i.merchantExchangeRate;
          });
          v.data1 = response.data.datas
          v.data1.forEach(item => {
            item.isShow = (item.isShow == '1') ? '开' : '关'
          })
        }
      });
    },
    checkDateMt (data) {
      // 添加汇率选择数据
      this.checkAddData = data;
    },
    addExchangeRate () {
      // 添加汇率
      let v = this;
      if (v.checkAddData.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      let params = v.checkAddData.map(i => {
        return {
          'officialExchange': i.exchangeRate, // 官方汇率
          'targetCurrencyCode': i.currencyCode // 目标币种
        };
      });
      v.axios.post(api.insert_ExchangeRate, params).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('添加成功');
          v.getList();
          v.modal1 = false;
        } else {
          v.$Message.error('添加失败');
        }
      });
    },
    updateOfficialExchangeRate () {
      // 更新官方汇率
      let v = this;
      v.axios.put(api.put_exchangeRateUpdateOfficialExchange).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.getList();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    updateOfficialToSelf () {
      // 更新官方汇率到我的汇率
      let v = this;
      v.axios.put(api.update_BatchExchageOfficialToLocal).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.getList();
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    updateExchangeRate () {
      // 汇率更新设置
      let v = this;
      if (v.data3.length === 0) {
        v.$Message.error('请添加货币');
        return;
      }
      let name = [];
      v.data3.forEach(i => {
        if (i.updateRate <= 0) {
          name.push(i.targetCurrencyCode);
        }
      });
      if (name.length > 0) {
        let str = name.join('/');
        v.$Message.info(str + '未填写汇率更新比率');
        return;
      }
      let params = v.data3.map(i => {
        return {
          'targetCurrencyCode': i.targetCurrencyCode,
          'updateRate': i.updateRate
        };
      });
      let temp = (v.isUpdate) ? '1' : '0'
      v.axios.post(api.update_settingUpdateRate + `?isUpdate=${temp}`, params).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.getQueryExistUpdateRate();
          v.modal2 = false;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('操作失败，请重新尝试');
        }
      });
    }
  }
};
</script>

<style scoped lang='less'>
.line {
  width: 3px;
  height: 15px;
  background: #0072fa;
}

:deep(.ivu-input) {
  height: 25px;
}

.cursor-bold {
  cursor: pointer;
}

.cursor-bold:hover {
  font-weight: bold;
}

:deep(.ivu-radio-group-button){
  .ivu-radio-wrapper {
    height: 25px;
    line-height: 25px;
  }
}
</style>
