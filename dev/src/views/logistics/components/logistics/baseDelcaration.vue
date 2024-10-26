<template >
  <div >
    <div class="commonFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformSearch clear" >
            <Form ref="pageParams" :model="pageParams" label-position="left" :label-width="70" >
              <dyt-filter :filter-row="1">
                <Form-item label="搜索字符" prop="searchValue" >
                  <dyt-input
                    placeholder="可输入中文申报名、英文申报名、海关编码"
                    v-model.trim="pageParams.searchValue"
                    style="width: 300px"
                    @on-enter="search"></dyt-input >
                </Form-item >
                <div slot="operation">
                  <Button
                    type="primary"
                    v-if="getPermission('packageCommonDeclare_query')"
                    @click="search"
                    :disabled="SearchDisabled"
                    icon="md-search">查询</Button>
                  <Button style="marginLeft:10px;" @click="reset" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form >
          </div >
        </div >
      </div >
    </div >

    <div class="normalPadding" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" v-if="getPermission('packageCommonDeclare_insert')" @click="show" >
          <Icon type="md-add" ></Icon >
          添加常用申报信息
        </Button >
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span >排序：</span >
        <Button-group >
          <template v-for="(item, index) in buttonGroupModel" >
            <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index" >
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
            </Button >
            <Button v-if="!item.selected" @click="modifyTheSort(index, item.status)" :key="index" >
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
            </Button >
          </template >
        </Button-group >
      </div >
    </div >
    <div class="normalPadding normalTop" >
      <Table
          highlight-row border :loading="tableLoading" :columns="declarationColumn" :height="tableHeight" :data="declarationData" ></Table >
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
    <keep-alive >
      <Modal
          v-model="fillInDeclare"
          width="700"
          :mask-closable="maskClosable"
          :loading="declareModalLoading"
          v-if="fillInDeclareStatus"
          @on-ok="handleSubmit('declarePageParams')"
          @on-cancel="closeDeclare" >
        <div class="ivu-modal-confirm" >
          <div class="ivu-modal-confirm-head" >
            <div class="ivu-modal-confirm-head-title" >常用申报信息</div >
          </div >
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render" >
            <div class="normalTop" >
              <Form ref="declarePageParams" :model="declarePageParams" :rules="ruleValidate" :label-width="110" >
                <Row >
                  <Col :span="12" >
                    <FormItem label="中文申报名" prop="goodsNameCn" >
                      <Input v-model="declarePageParams.goodsNameCn" ></Input >
                    </FormItem >
                  </Col >
                  <Col :span="11" :offset="1" >
                    <FormItem label="英文申报名" prop="goodsNameEn" >
                      <Input v-model="declarePageParams.goodsNameEn" ></Input >
                    </FormItem >
                  </Col >
                </Row >
                <Row >
                  <Col :span="12" >
                    <FormItem label="重量（单个）" prop="unitWeight" >
                      <Input v-model="declarePageParams.unitWeight" > <dyt-select
                          v-model="gram" slot="append" style="width: 50px" > <Option value="g" >g</Option > </dyt-select >
                      </Input >
                    </FormItem >
                  </Col >
                  <Col :span="11" :offset="1" >
                    <FormItem label="价值（单个）" prop="unitPrice" >
                      <Input v-model="declarePageParams.unitPrice" > <dyt-select
                          v-model="declarePageParams.declareCurrency" slot="append" style="width: 70px" >
                      <Option value="USD" >USD</Option > </dyt-select > </Input >
                    </FormItem >
                  </Col >
                </Row >
                <Row >
                  <Col :span="24" >
                    <FormItem label="海关编码" prop="hsCode" >
                      <Input v-model="declarePageParams.hsCode" ></Input >
                    </FormItem >
                  </Col >
                </Row >
              </Form >
            </div >
          </div >
        </div >
      </Modal >
    </keep-alive >
    <!-- 删除确认 -->
    <Modal v-model="delModal" title="删除" v-if="delModalStatus" @on-ok="delOK" >
      <div style="margin: 20px;fontSize: 14px;" >
        <p >确认删除?</p >
      </div >
    </Modal >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    var self = this;
    const vaildChinese = (rule, value, callback) => {
      var reg = self.$regular.MatchChinese;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入中文'));
      } else {
        callback();
      }
    };
    const vaildEnglish = (rule, value, callback) => {
      var reg = self.$regular.MatchEnglish;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许输入英文'));
      } else {
        callback();
      }
    };
    const validNum = (rule, value, callback) => {
      var reg = self.$regular.AllNumber;
      if (value === '' || value === null) {
        callback(new Error('内容不能为空'));
      } else if (!reg.test(value)) {
        callback(new Error('只允许数字'));
      } else {
        callback();
      }
    };
    const validatePrice = (rule, value, callback) => {
      let priceReg = self.$regular.hasPriceNum;
      if (!priceReg.test(value)) {
        callback(new Error('价格必须为数字,且最多允许两位小数'));
      } else {
        callback();
      }
    };
    return {
      tableHeight: 500,
      gram: 'g',
      pageParams: {
        orderBy: 'hsCode',
        searchValue: null,
        upDown: 'up',
        pageNum: 1,
        pageSize: 10
      },
      declarePageParams: {
        goodsNameCn: null,
        goodsNameEn: null,
        unitWeight: null,
        unitPrice: null,
        hsCode: null,
        declareCurrency: 'USD'
      },
      maskClosable: false,
      saveStatus: 'edit',
      declareModalLoading: true,
      ruleValidate: {
        goodsNameCn: [
          {
            validator: vaildChinese,
            trigger: 'blur'
          }
        ],
        goodsNameEn: [
          {
            validator: vaildEnglish,
            trigger: 'blur'
          }
        ],
        unitWeight: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        unitPrice: [
          {
            validator: validatePrice,
            trigger: 'blur'
          }
        ],
        hsCode: [
          {
            validator: validNum,
            trigger: 'blur'
          }
        ],
        declareNum: [
          {
            validator: this.validateEmpty(),
            trigger: 'blur'
          }
        ]
      },
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      fillInDeclare: false,
      fillInDeclareStatus: false,
      declarationColumn: [
        {
          title: '海关编码',
          key: 'hsCode',
          align: 'center'
        }, {
          title: '中文申报名',
          align: 'center',
          key: 'goodsNameCn'
        }, {
          title: '英文申报名',
          align: 'center',
          key: 'goodsNameEn'
        }, {
          title: '申报重量(单个g)',
          align: 'center',
          key: 'unitWeight'
        }, {
          title: '申报价值(单个)',
          align: 'center',
          key: 'unitPrice',
          render: (h, params) => {
            return h('div', 'USD ' + params.row.unitPrice);
          }
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px',
                  display: (() => {
                    return self.getPermission('packageCommonDeclare_update') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.show('edit', params.row);
                  }
                }
              }, '编辑'), h('Button', {
                style: {
                  display: (() => {
                    return self.getPermission('packageCommonDeclare_delete') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    self.del(params.row.packageCommonDeclareId);
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      declarationData: [],
      total: 0,
      curPage: 1,
      pageParamsStatus: false,
      buttonGroupModel: [
        {
          type: 'hsCode',
          selected: true,
          status: true, // true up false down
          title: '按海关编码'
        }, {
          type: 'goodsNameEn',
          selected: false,
          status: true, // true up false down
          title: '按英文申报名'
        }
      ],
      delModal: false,
      delModalStatus: false,
      delId: null // 删除参数 id
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  methods: {
    getList () {
      let v = this;
      if (!v.getPermission('packageCommonDeclare_query')) return;
      v.loadingTrue();
      v.axios.post(api.erpServiceCommon + api.wmsService + api.get_packageCommonDeclare, JSON.stringify(v.pageParams)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.loadingFalse();
          if (data.list !== null && data.list.length > 0) {
            v.declarationData = data.list;
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.totalPage = Number(data.pages);
            });
          } else {
            v.total = 0;
            v.totalPage = 1;
            v.declarationData = [];
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    startLoading () {
      let v = this;
      v.$Loading.start();
      Promise.resolve(v.getList()).then(function () {
        v.$Loading.finish();
      });
    },
    closeDeclare () {
      let v = this;
      v.decalreData = [];
      v.$refs.declarePageParams.resetFields();
    },
    saveDeclare (type) {
      let v = this;
      if (type === 'save') {
        v.axios.post(api.erpServiceCommon + api.wmsService + api.add_packageCommonDeclare, JSON.stringify(v.declarePageParams)).then(response => {
          if (response.data.code === 0) {
            v.declareModalLoading = false;
            v.$nextTick(function () {
              v.fillInDeclare = false;
              v.closeDeclare();
            });
            v.$Message.success('保存成功');
            v.pageParamsStatus = true;
          }
        });
      } else {
        v.axios.put(api.wmsService + api.update_packageCommonDeclare, JSON.stringify(v.declarePageParams)).then(response => {
          if (response.data.code === 0) {
            v.declareModalLoading = false;
            v.$nextTick(function () {
              v.fillInDeclare = false;
              v.closeDeclare();
            });
            v.$Message.success('修改成功');
            v.pageParamsStatus = true;
          }
        });
      }
    },
    search () {
      var v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset () {
      var v = this;
      v.$refs['pageParams'].resetFields();
    },
    show (type, obj) {
      let v = this;
      v.fillInDeclareStatus = true;
      v.$nextTick(function () {
        v.fillInDeclare = true;
        if (type === 'edit') {
          for (var key in obj) {
            for (var t in v.declarePageParams) {
              if (key === t) {
                v.declarePageParams[t] = obj[key];
              }
            }
          }
          v.declarePageParams.packageCommonDeclareId = obj.packageCommonDeclareId;
          v.saveStatus = 'edit';
        } else {
          v.saveStatus = 'save';
          delete v.declarePageParams.packageCommonDeclareId;
        }
      });
    },
    handleSubmit (name) {
      var v = this;
      v.$refs[name].validate(function (valid) {
        if (valid) {
          v.saveDeclare(v.saveStatus);
        } else {
          v.declareModalLoading = false;
          v.$nextTick(function () {
            v.declareModalLoading = true;
          });
        }
      });
    },
    del (id) {
      let v = this;
      v.delModal = true;
      v.delModalStatus = true;
      v.delId = id;
    },
    delOK () {
      let v = this;
      v.axios.delete(api.wmsService + api.del_packageCommonDeclare + v.delId).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('删除成功');
          v.pageParamsStatus = true;
        } else {
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('删除失败,请重新尝试');
        }
      });
    }
  },
  created () {
    let v = this;
    this.tableHeight = this.getTableHeight(290);
    v.getPermissionCallback('logistics_baseDelcaration').then(() => {

    });
  }
};
</script >
