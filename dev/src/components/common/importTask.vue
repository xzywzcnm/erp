<template >
  <!--	erp--所有导入查看的公共组件-->
  <!-- 订单的导入查看暂时木有，后面会出需求，页面先放着 -->
  <div class="importTask">
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth" class="fixwidthForm">
              <dyt-filter>
                <FormItem label="渠道" class="notplatformParamsSelect" v-if="customChannel">
                  <Button-group>
                    <template v-for="(item, index) in platformGroup" v-if="index < 5">
                      <Button v-if="item.selected" type="primary" @click="getPlatformData(index, item)" :key="index">
                        {{ item.name }} </Button>
                      <Button class="pseudoButton" v-if="!item.selected" @click="getPlatformData(index, item)"
                        :key="index">{{ item.name }} </Button>
                    </template>
                    <template v-if="platformGroup.length > 5">
                      <Dropdown style="margin-left: 10px" transfer>
                        <Button>
                          更多渠道
                          <Icon type="md-arrow-dropdown" />
                        </Button>
                        <Dropdown-menu slot="list">
                          <Dropdown-item v-for="(item, index) in platformGroup" v-if="index >= 5" :key="index">
                            <div @click="getPlatformData(index, item)">{{ item.name }}</div>
                          </Dropdown-item>
                        </Dropdown-menu>
                      </Dropdown>
                    </template>
                  </Button-group>
                </FormItem>
                <FormItem label="导入状态" class="notplatformParamsSelect">
                  <Button-group>
                    <template v-for="(item, index) in typeList">
                      <Button v-if="item.selected" type="primary" @click="enbaleType(index, item.status)" :key="index">
                        {{ item.title }} </Button>
                      <Button v-if="!item.selected" @click="enbaleType(index, item.status)" :key="index">
                        {{ item.title }} </Button>
                    </template>
                  </Button-group>
                </FormItem>
                <Form-item label="导入类型">
                  <dyt-select v-model="pageParams.types" multiple :max-tag-count="1">
                    <Option v-for="(item, index) in importTypesList" :key="index" :value="item.value">{{ item.label }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="任务号">
                  <dyt-input placeholder="请输入任务号" v-model.trim="pageParams.operateCode"></dyt-input>
                </Form-item>
                <Form-item label="导入时间">
                  <DatePicker transfer type="date" v-model="pageParams.createdTime" @on-change="selectDate"
                    @on-clear="resetDate" placeholder="选择日期" style="width: calc(100% - 40px);" />
                  <span style="marginLeft:10px;">之前</span>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!-- 列表 -->
    <div class="orderTable normalTop">
      <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="importColumn"
        :data="importData"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import { getService } from '@/utils/getService';

const typeDefinition = {
  productCenter: [
    {
      value: 'productImport',
      label: '商品导入'
    },
    {
      value: 'productSkuMappingImport',
      label: '映射导入'
    },
    {
      value: 'productGoodsTagAddImport',
      label: '导入商品标签'
    },
    {
      value: 'productGoodsTagDeleteImport',
      label: '解绑标签'
    },
    {
      value: 'productGoodsAssembleImport',
      label: '导入组装信息'
    },
    {
      value: 'TemuThirdPartyTagImport',
      label: 'Temu第三方标签导入'
    },
    {
      value: 'tiktokThirdPartyTagImport',
      label: 'tiktok第三方标签导入'
    }
  ],
  otherType: [
    {
      value: 'handOrderImport',
      label: '手工单导入'
    },
    {
      value: 'defineOrderImport',
      label: '自定义渠道'
    },
    {
      value: 'returnTrackingNumberImport',
      label: '退货跟踪号导入'
    },
    {
      value: 'returnPackageImport',
      label: '退货订单导入'
    }
  ]
}

export default {
  mixins: [Mixin],
  data () {
    return {
      filenodeViewTargetUrl: this.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      pageParamsStatus: false, // 是否重新加载列表数据
      total: 0, // 总记录数
      userInfoMap: [], // 操作人
      platformGroup: [],
      customChannel: false, // 判断是否是自定义渠道
      productCenter: false, // 判断当前系统是否是商品管理系统
      importTypesList: [],
      platformId: ['definePlatform'],
      pageParams: {
        types: [],
        status: null,
        operateCode: null,
        createdTime: null,
        pageSize: 10,
        pageNum: 1
      },
      typeList: [ // 2:操作中 3:操作完成 4：操作失败(格式校验不通过或其他运行时异常)
        {
          selected: true,
          status: '',
          title: '全部'
        }, {
          selected: false,
          status: 3,
          title: '导入完成'
        }, {
          selected: false,
          status: 4,
          title: '导入失败'
        }, {
          selected: false,
          status: 2,
          title: '导入中'
        }
      ],
      importData: [],
      importColumn: [
        {
          title: '序号',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '导入任务号',
          key: 'operateCode',
          align: 'center',
          minWidth: 120
        }, {
          title: '导入类型',
          key: 'types',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            if (this.productCenter) {
              const typeObj = typeDefinition.productCenter.find(fin => {
                return fin.value == row.type
              })
              if (this.$common.isEmpty(typeObj)) return h('span', '');
              return h('span', typeObj.label);
            } else {
              const typeObj = typeDefinition.otherType.find(fin => {
                return fin.value == row.type
              })
              if (this.$common.isEmpty(typeObj)) return h('span', '待定');
              return h('span', typeObj.label);
            }
          }
        },
        {
          title: '导入文件',
          key: 'originPath',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', {
              style: {
                color: '#0000FF',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  window.open(this.filenodeViewTargetUrl + params.row.originPath);
                }
              }
            }, params.row.originName);
          }
        }, {
          title: '导入时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '状态',
          key: 'status',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (params.row.status === 2) {
              return h('span', '导入中');
            } else if (params.row.status === 3) {
              return h('span', '导入完成');
            } else if (params.row.status === 4) {
              return h('Tooltip', {
                style: {
                  textAlign: 'center',
                  color: '#f00',
                  cursor: 'pointer'
                },
                class: 'wayBillStatusError',
                props: {
                  placement: 'top',
                  transfer: true,
                  content: params.row.reason
                }
              }, [
                h('span', '导入失败')
              ]);
            }
          }
        }, {
          title: '操作人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.userInfoMap[params.row.createdBy]) {
              return h('span', this.userInfoMap[params.row.createdBy].userName || params.row.createdBy);
            }
          }
        }, {
          title: '',
          key: '',
          align: 'center',
          minWidth: 120,
          renderHeader: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  color: '#008000'
                }
              }, '成功'), h('span', '/'), h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '失败')
            ]);
          },
          render: (h, params) => {
            if (params.row.status !== 2 && params.row.status !== 4) {
              return h('div', [
                h('span', {
                  style: {
                    color: '#008000'
                  }
                }, params.row.success), h('span', '/'), h('span', {
                  style: {
                    color: '#FF0000'
                  }
                }, params.row.failure)
              ]);
            }
          }
        }, {
          title: '操作',
          width: 200,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            let html = h('div', {
              style: {
                color: '#0000FF',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  window.open(this.filenodeViewTargetUrl + params.row.targetPath);
                }
              }
            }, '下载文件');

            if (params.row.status !== 2 && params.row.status !== 4) {
              return params.row.failure !== 0 ? html : '';
            }
          }
        }
      ],
      importTypes: [ // 导入类型
        {
          value: 'handOrderImport',
          label: '手工单导入'
        }, {
          value: 'defineOrderImport',
          label: '自定义渠道'
        }, {
          value: 'returnTrackingNumberImport',
          label: '退货跟踪号导入'
        }, {
          value: 'returnPackageImport',
          label: '退货订单导入'
        }
      ]
    };
  },
  methods: {
    enbaleType (index, status) { // 选择状态
      let v = this;
      if (index === 0) {
        v.pageParams.status = null;
      } else if (index === 1) {
        v.pageParams.status = '3';
      } else if (index === 2) {
        v.pageParams.status = '4';
      } else {
        v.pageParams.status = '2';
      }
      v.typeList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    selectDate (val) { // 选择日期
      let v = this;
      if (!val) return;
      v.pageParams.createdTime = v.getUniversalTime(new Date(val).getTime(), 'fulltime');
    },
    resetDate () { // 重置日期
      let v = this;
      v.pageParams.createdTime = null;
    },
    search () { // 查询
      let v = this;
      v.pageParams.pageNum = 1;
      v.pageParamsStatus = true;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.types = [];
      // v.pageParams.status = null;
      v.enbaleType(0, '');
      v.pageParams.operateCode = null;
      v.pageParams.createdTime = null;
    },
    getList () { // 获取列表数据
      let v = this;
      let userIds = [];
      let types = [];
      if (v.pageParams.types.length === 0) {
        const productCenterTypes = typeDefinition.productCenter.map(m => m.value);
        types = v.customChannel ? [v.importTypes[1].value] : v.productCenter ? productCenterTypes : v.importTypes.map(i => i.value);
      } else {
        types = v.pageParams.types;
      }
      let obj = {
        types: types,
        status: v.pageParams.status,
        operateCode: v.pageParams.operateCode,
        createdTime: v.pageParams.createdTime,
        pageSize: v.pageParams.pageSize,
        pageNum: v.pageParams.pageNum
      };
      if (!v.productCenter) {
        obj.platformIds = v.customChannel ? v.platformId : [v.inGroup];
      }
      let url = v.productCenter ? api.query_taskInfoData : api.query_taskData;

      v.loadingTrue();
      v.axios.post(url, obj).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach((n, i) => {
              userIds.push(n.updatedBy);
            });
          }
          Promise.resolve(v.getUserInfoMap(userIds)).then(result => {
            v.loadingFalse();
            v.importData = data.list;
            v.total = data.total;
          });
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
            }
          }).finally(() => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    }, // 获取渠道
    GetPlatformGroup (data) {
      return new Promise((resolve) => {
        this.getHavePlatformGroup().then(res => {
          this.platformId = this.$common.isEmpty(res.platformData) ? [] : res.platformData[0].platformId;
          this.shopList = this.$common.copy(res.shopData);
          this.platformGroup = this.$common.copy(res.platformData);
          this.CascaderData = this.$common.copy(res.cascaderData);
          // if (!this.$common.isEmpty(this.platformGroup) && this.platformGroup[0].name == '全部') {
          //   this.platformGroup[0].platformId = 'definePlatform';
          // }
          this.$nextTick(() => {
            this.getList();
            resolve(true);
          })
        });
      });
    }, // 切换渠道
    getPlatformData (index, item) {
      let v = this;
      v.platformId = [];
      v.platformId.push(item.platformId);
      v.platformGroup.map((item, idx) => {
        if (idx === index) {
          item.selected = true;
        } else {
          item.selected = false;
        }
      });
      if (index > 4) {
        let talg = v.platformGroup[1];
        v.platformGroup[1] = v.platformGroup[index];
        v.platformGroup[index] = talg;
      }
      this.getList();
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(245);
    // 判断当前的渠道是否是自定义渠道
    let str = window.location.href;
    if (str.indexOf('definePlatform.html') != -1) {
      this.customChannel = true;
      let data = JSON.parse(localStorage.getItem('platformGroup'));
      this.importTypesList = [this.importTypes[1]];
      this.GetPlatformGroup(data);
      return;
    }
    this.customChannel = false;
    if (str.indexOf('productCenter.html') !== -1) {
      // 判断当前系统是否是商品管理系统
      this.productCenter = true;
      let importProductTypes = typeDefinition.productCenter;
      this.importTypesList = importProductTypes;
    } else {
      this.productCenter = false;
      this.importTypesList = this.importTypes;
    }
    this.pageParamsStatus = true;
  },
  watch: {
    pageParamsStatus: function (n, o) { // 监听重置列表数据
      let v = this;
      if (n) {
        v.$Loading.start();
        let type = getService();
        let permission_name = '';
        if (type) {
          if (type === 'menuOrder') {
            permission_name = 'orderCommonTaskInfo_queryCommonTaskInfoData'
          } else if (type === 'menuProduct') {
            permission_name = 'productCenter_importTask'
          }
          v.getPermission(permission_name) ? v.getList() : v.gotoError();
          v.$Loading.finish();
        }
        v.pageParamsStatus = false;
      }
    }
  }
};
</script>
