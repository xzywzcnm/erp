<style scoped>
.strategyTitle {
  background-color: #b0cfde;
  line-height: 24px;
  padding: 4px;
}

.dashedBorder {
  border-top: 1px dashed #dddee1;
  margin: 5px 0;
}

.param {
  display: inline-block;
  width: 40px;
}

.formula {
  font-size: 14px;
}

.green {
  color: green;
}

.red {
  color: red;
}

.lineThrough {
  text-decoration: line-through;
}

.upgradeTitle {
  padding: 4px 4px 4px 20px;
  background-color: #b0cfde;
}

.add {
  margin-right: 10px;
}

.minus {
  margin-left: 6px;
}

.add:hover,
.minus:hover {
  cursor: pointer;
  color: #2d8cf0;
}
</style>
<style>
.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.strategy .ivu-form-item-error-tip {
  top: 20%;
  left: 70%;
}

.strategy .ivu-form-item {
  margin-bottom: 6px;
}

.formula .ivu-form-item-content {
  margin-left: 10px !important;
}

.strategy .formula .ivu-form-item {
  margin-bottom: 20px;
}

.strategy .formula .ivu-form-item-error-tip {
  top: 100%;
  left: 0;
}

.strategy .calTable .ivu-table th,
.strategy .calTable .ivu-table td {
  height: 36px;
}
</style>
<template>
  <div>
    <div class="flexBox spaceBetween normalTop20">
      <div class="tableControl">
        <Button type="primary" class="iconbuttons" @click="synchronizeFn" style="margin-left: 12px;width: 100px;">
          从ERP同步 </Button>
      </div>
    </div>
    <div class="commonFilter normalTop20">
      <div class="orderTable">
        <keep-alive>
          <dTable highlight-row :border="true" :loading="loading" :columns="accountColumn" :data="accountData"></dTable>
        </keep-alive>
      </div>
    </div>
    <!--导出Excel-->
    <Modal v-model="isShowViewAccount" title="导出Excel" width="480">
      <div>
        <Form ref="accountInfo" :model="accountInfo" :label-width="150" :rules="ruleValidate">
          <div>
            <FormItem label="账户名称（LAPA名称）：" prop="accountName">
              <Input v-model="accountInfo.accountName" style="width:300px;" :disabled="true"></Input>
            </FormItem>
          </div>
          <div>
            <FormItem label="账号（1688）：" prop="account">
              <Input v-model="accountInfo.account" style="width:300px;" :disabled="true"></Input>
            </FormItem>
          </div>
          <div>
            <FormItem label="授权用户：" prop="authorizedUser">
              <template>
                <div v-for="(item, index) in accountInfo.authorizedUser" :key="index">{{ item.name + '(' + item.email + ')' }}</div>
              </template>
            </FormItem>
          </div>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="isShowViewAccount = false" style="width: 100px;">关闭 </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';

export default {
  mixins: [Mixin, tableMixin],
  data () {
    let self = this;
    return {
      loading: false,
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(420),
      isShowViewAccount: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      selectionArr: [], // 已选中表格行数据
      accountData: [],
      accountInfo: {
        accountName: 'abc',
        account: '1321654',
        authorizedUser: [
          {
            name: '张三',
            email: '777@qq.com'
          }, {
            name: '李四',
            email: '888@qq.com'
          }, {
            name: '王五',
            email: '999@qq.com'
          }
        ]
      },
      accountColumn: [
        {
          key: 'categoryName',
          align: 'center',
          title: '账户名称（LAPA名称）'
        }, {
          key: 'categoryName',
          align: 'center',
          title: '账户名（1688）'
        }, {
          key: 'categoryName',
          align: 'center',
          title: '平台'
        }, {
          key: 'categoryDesc',
          align: 'center',
          title: '日均销量公式'
        }, {
          key: 'categoryDesc',
          align: 'center',
          title: '绑定时间'
        }, {
          key: 'operation',
          align: 'center',
          title: '操作',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'dashed'
              },
              on: {
                click: () => {
                  self.seeAccountInfoFn(params.row);
                }
              }
            }, '查看');
          }
        }
      ],
      ruleValidate: {
        templateName: [
          {
            required: true,
            message: '不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 100,
            message: '不能超过100个字符',
            trigger: 'change'
          }
        ]
      }
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      var v = this;
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
      var v = this;
      v.$Loading.start();
      v.getList();
    },
    getList () { // 獲取分頁
      let v = this;
      v.axios.post(api.query, v.pageParams).then(response => {
        v.total = 0;
        if (response.data.code == 0) {
          v.stockData = response.data.datas.list;
          v.total = response.data.datas.total;
          v.loading = false;
          v.$Loading.finish(); // 隐藏加载条
        }
      });
    },
    changePage (page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    getSelectValue (selection) { // table获取所选值
      let v = this;
      v.selectionArr = selection;
    },
    synchronizeFn () {
      this.isShowViewAccount = true;
    },
    seeAccountInfoFn () {
      let v = this;
      v.isShowViewAccount = true;
    }
  }
};
</script >
