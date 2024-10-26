<template >
  <div >
    <div class="usersFilter" >
      <div class="card-container" >
        <div class="card-content" >
          <div class="platformParamsSelect" >
            <div class="filterItem" >
              业务角色
              <Button-group style="marginLeft:10px;" >
                <template v-for="(item, index) in roleList" >
                  <Button v-if="item.selected" type="primary" @click="enbaleRole(index, item.status)" :key="index" >
                    {{ item.title }} </Button >
                  <Button v-if="!item.selected" @click="enbaleRole(index, item.status)" :key="index" >
                    {{ item.title }} </Button >
                </template >
              </Button-group >
            </div >
            <div class="filterItem platformClass" >
              平台
              <Button-group style="marginLeft:10px;" >
                <template v-for="(item, index) in platformGroup" v-if="index < 5" >
                  <Button
                      v-if="item.selected"
                      type="primary"
                      @click="getPlatformData(item.platformId, index)"
                      :key="index" >
                    {{ item.title }} </Button >
                  <span
                      class="pseudoButton"
                      v-if="!item.selected"
                      @click="getPlatformData(item.platformId, index)"
                      :key="index" >{{ item.title }}</span >
                </template >
                <template v-if="platformGroup.length > 5" >
                  <Dropdown style="margin-left: 10px" >
                    <Button :type="moreTitle !== '更多平台' ? 'primary' : 'default'" >
                      {{ moreTitle }}
                      <Icon type="md-arrow-dropdown" />
                    </Button >
                    <Dropdown-menu slot="list" >
                      <Dropdown-item v-for="(item, index) in platformGroup" v-if="index >= 5" :key="item.id" >
                        <div @click="getPlatformData(item.platformId, index, 2)" >{{ item.title }}</div >
                      </Dropdown-item >
                    </Dropdown-menu >
                  </Dropdown >
                </template >
              </Button-group >
            </div >
            <div class="shopClass" >
              <Form :model="pageParams" label-position="right" :label-width="70" @submit.native.prevent>
                <dyt-filter :filter-row="1">
                  <Form-item label="店铺名称">
                    <dyt-input
                      placeholder="可输入店铺ID、店铺名称查询"
                      v-model.trim="pageParams.searchValue"
                      style="width: 200px"
                      @on-enter="search"
                    />
                  </Form-item>
                  <div slot="operation">
                    <Button
                      v-if="getPermission('accountBusinessSale_query')"
                      type="primary"
                      @click="search"
                      :disabled="SearchDisabled"
                      icon="md-search"
                    >查询</Button>
                    <Button style="marginLeft:10px;" @click="reset" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div >
          </div >
        </div >
      </div >
    </div >
    <div class="dataSort grayBg" >
      <span >排序：</span >
      <Button-group >
        <template v-for="(item, index) in buttonGroupModel" >
          <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index" >
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
          </Button >
          <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index" >
            {{ item.title }}
            <Icon type="md-arrow-round-up" v-if="item.status && item.selected" ></Icon >
            <Icon type="md-arrow-round-down" v-if="!item.status && item.selected" ></Icon >
          </Button >
        </template >
      </Button-group >
    </div >
    <div class="normalPadding normalTop shopTable" >
      <Table highlight-row border :loading="tableLoading" :height="tableHeight" :columns="roleColumns" :data="roleData" ></Table >
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
    <!-- 业绩统计设置模态框 -->
    <Modal
        v-model="editRoleModal"
        v-if="editRoleModalStatus"
        width="800"
        @on-ok="editSave"
        @on-cancel="editCancel"
        title="业绩统计设置" >
      <div class="editModal" >
        <RadioGroup v-model="editData.manageMode" >
          <div >
            <Radio :label="1" style="fontSize:18px;fontWeight:700;" >单人管理模式
            </Radio >
            <span style="fontSize:12opx;" >店铺所有绩效数据都归到单个销售员</span >
            <div style="marginTop:20px;marginLeft:20px;" v-if="editData.manageMode === 1" >
              选择销售员： <dyt-select
                v-model.trim="userId" :transfer="true" filterable clearable style="width:150px" @on-clear="delRole" >
            <Option
                v-for="(item, index) in allUserList" :key="index" :value="item.userId" >{{ item.userName }}</Option>
            </dyt-select >
            </div >
          </div >
          <div style="marginTop:40px;" >
            <Radio :label="2" style="fontSize:18px;fontWeight:700;" >多人管理模式
            </Radio >
            <span style="fontSize:12opx;" >绩效数据按SKU分配到多个销售员</span >
            <div style="marginTop:10px;width:750px;" v-if="editData.manageMode === 2" >
              <Tabs @on-click="changeType" :value="saleDivideType" >
                <!-- 按分类划分 -->
                <TabPane label="按分类划分" name="1" >
                  <div class="categoryBox" >
                    <div style="fontSize:14px;fontWeight:700;" >
                      <span style="marginLeft:20px; width: 90px; display: inline-block;" >分类中文名称</span >
                      <span style="marginLeft:200px; width: 90px; display: inline-block;" >分类英文名称</span >
                      <span style="marginLeft:220px;" >业务员</span >
                      <Icon
                          v-if="!editCateStatus"
                          style="marginLeft:5px;cursor:pointer;"
                          type="md-create"
                          @click="editCategoryRole(0)" />
                      <Icon
                          v-if="editCateStatus"
                          style="marginLeft:5px;cursor:pointer;"
                          type="ios-undo"
                          @click="editCategoryRole(1)" />
                    </div >
                    <div
                        style="cursor: pointer; margin: 5px 0 0 18px; color: #2D8CF0;"
                        v-if="categoryTree.length>0"
                        @click="exchangeTree" >{{ showTree ? '全部收起' : '全部展开' }}
                    </div >
                    <Tree
                        ref="categoryTree"
                        :load-data="loadData"
                        :data="categoryTree"
                        :render="renderContent"
                        @on-toggle-expand="changeExpand"
                        style="marginLeft:20px;" ></Tree >
                  </div >
                </TabPane >
                <!-- 按商品划分 -->
                <TabPane label="按商品划分" name="2" >
                  <div class="" >
                    <Table highlight-row border height="420" :columns="productColumns" :data="productData" ></Table>
                  </div >
                </TabPane >
              </Tabs >
            </div >
          </div >
        </RadioGroup >
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
    return {
      tableHeight: 600,
      showTree: true,
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      pageParams: {
        platformId: null,
        searchValue: null,
        pageNum: 1,
        pageSize: 20,
        orderBy: 'platform',
        upDown: 'up'
      },
      total: 0,
      curPage: 1,
      roleList: [
        {
          selected: true,
          status: '',
          title: '销售员'
        }
      ],
      platformGroup: [
        {
          selected: true,
          platformId: '',
          title: '全部'
        }, {
          selected: false,
          platformId: 'ebay',
          title: 'Ebay'
        }, {
          selected: false,
          platformId: 'aliexpress',
          title: 'AliExpress'
        }, {
          selected: false,
          platformId: 'shopify',
          title: 'Shopify'
        }, {
          selected: false,
          platformId: 'lazada',
          title: 'Lazada'
        }, {
          selected: false,
          platformId: 'wish',
          title: 'Wish'
        }, {
          selected: false,
          platformId: 'joom',
          title: 'Joom'
        }, {
          selected: false,
          platformId: 'tophatter',
          title: 'Tophatter'
        }, {
          selected: false,
          platformId: 'cdiscount',
          title: 'Cdiscount'
        }, {
          selected: false,
          platformId: 'newegg',
          title: 'Newegg'
        }, {
          selected: false,
          platformId: 'priceminister',
          title: 'Priceminister'
        }, {
          selected: false,
          platformId: 'walmart',
          title: 'Walmart'
        }, {
          selected: false,
          platformId: 'dhgate',
          title: 'Dhgate'
        }, {
          selected: false,
          platformId: 'alibaba',
          title: 'Alibaba'
        }, {
          selected: false,
          platformId: 'yandex',
          title: 'Yandex'
        }, {
          selected: false,
          platformId: 'mycom',
          title: 'Mycom'
        }, {
          selected: false,
          platformId: 'shopee',
          title: 'Shopee'
        }, {
          selected: false,
          platformId: 'factorymarket',
          title: 'Factorymarket'
        }, {
          selected: false,
          platformId: 'mercadolibre',
          title: 'Mercadolibre'
        }, {
          selected: false,
          platformId: 'amazon',
          title: 'Amazon'
        },
        {
          selected: false,
          platformId: 'real',
          title: 'Real'
        },
        {
          selected: false,
          platformId: 'allegro',
          title: 'Allegro'
        },
        {
          selected: false,
          platformId: 'ept',
          title: 'Ept'
        }
      ],
      buttonGroupModel: [
        {
          type: 'platform',
          selected: true,
          status: true, // true up false down
          title: '按平台'
        }, {
          type: 'updatedTime',
          selected: false,
          status: true, // true up false down
          title: '按最后修改时间'
        }
      ],
      moreTitle: '更多平台',
      roleData: [],
      roleColumns: [
        {
          title: '序号',
          key: 'number',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '平台',
          key: 'platform',
          width: 160,
          align: 'center',
          render: (h, params) => {
            let platformId = null;
            if (params.row.platformId === 'ebay') {
              platformId = 'platformLogo ebay';
            } else if (params.row.platformId === 'aliexpress') {
              platformId = 'platformLogo aliexpress';
            } else if (params.row.platformId === 'shopify') {
              platformId = 'platformLogo shopify';
            } else if (params.row.platformId === 'lazada') {
              platformId = 'platformLogo lazada';
            } else if (params.row.platformId === 'wish') {
              platformId = 'platformLogo wish';
            } else if (params.row.platformId === 'joom') {
              platformId = 'platformLogo joom';
            } else if (params.row.platformId === 'tophatter') {
              platformId = 'platformLogo tophatter';
            } else if (params.row.platformId === 'cdiscount') {
              platformId = 'platformLogo cdiscount';
            } else if (params.row.platformId === 'newegg') {
              platformId = 'platformLogo newegg';
            } else if (params.row.platformId === 'priceminister') {
              platformId = 'platformLogo priceminister';
            } else if (params.row.platformId === 'walmart') {
              platformId = 'platformLogo walmart';
            } else if (params.row.platformId === 'dhgate') {
              platformId = 'platformLogo dhgate';
            } else if (params.row.platformId === 'alibaba') {
              platformId = 'platformLogo alibaba';
            } else if (params.row.platformId === 'yandex') {
              platformId = 'platformLogo yandex';
            } else if (params.row.platformId === 'mycom') {
              platformId = 'platformLogo mycom';
            } else if (params.row.platformId === 'shopee') {
              platformId = 'platformLogo shopee';
            } else if (params.row.platformId === 'factorymarket') {
              platformId = 'platformLogo factorymarket';
            } else if (params.row.platformId === 'mercadolibre') {
              platformId = 'platformLogo mercadolibre';
            } else if (params.row.platformId === 'amazon') {
              platformId = 'platformLogo amazon';
            } else if (params.row.platformId === 'real') {
              platformId = 'platformLogo real';
            } else if (params.row.platformId === 'allegro') {
              platformId = 'allegro_img';
            } else if (params.row.platformId === 'ept') {
              platformId = 'ept_img';
            } else if (params.row.platformId === 'jdyn') {
              platformId = 'jdyn_img';
            }
            return h('span', {
              class: platformId
            });
          }
        }, {
          title: '店铺',
          key: 'accountCode',
          minWidth: 160,
          align: 'center'
        }, {
          title: '账户',
          key: 'account',
          minWidth: 160,
          align: 'center'
        }, {
          title: '管理模式',
          key: 'manageMode',
          minWidth: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.manageMode === 2) { // 1：单人管理 2：多人管理
              return h('span', '多人管理');
            } else {
              return h('span', '单人管理');
            }
          }
        }, {
          title: '管理员',
          key: 'saleMen',
          minWidth: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.manageMode) {
              if (params.row.saleMen) {
                return h('span', this.getName(params.row.saleMen));
              }
            } else {
              return h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '未指定');
            }
          }
        }, {
          title: '最后修改时间',
          key: 'updatedTime',
          minWidth: 160,
          align: 'center'
        }, {
          title: '操作',
          key: 'operate',
          minWidth: 180,
          maxWidth: 240,
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              style: {
                display: (() => {
                  return this.getPermission('accountBusinessSale_edit') ? 'inline-block' : 'none';
                })()
              },
              props: {
                size: 'small'
              },
              on: {
                click: () => {
                  this.editRole(params.row.saleAccountId);
                }
              }
            }, '编辑');
          }
        }
      ],
      editRoleModal: false, // 模态框状态
      editRoleModalStatus: false,
      editCateStatus: false, // 分类编辑状态
      editData: [], // 存当前编辑的数据
      bsData: [],
      editDataCopy: [], // 取消编辑分类业务员用到
      userId: null, // 单人模式业务员
      allUserList: [], // 业务员集合
      userInfoMap: [], // 根据id获取name
      categoryTree: [], // 分类列表
      delCateData: [], // 保存时比较数据
      saleDivideType: '1', // tab标签页控制
      editProductStatus: false,
      productData: [], // 按商品划分多人管理模式
      productColumns: [
        {
          title: 'SKU',
          key: 'sku',
          width: 160,
          align: 'center'
        }, {
          title: '商品中文名',
          key: 'cnName',
          minWidth: 160,
          align: 'center'
        }, {
          title: '商品英文名',
          key: 'enName',
          minWidth: 160,
          align: 'center'
        }, {
          title: '业务员',
          key: '',
          width: 160,
          align: 'center',
          renderHeader: (h, params) => {
            return h('span', [
              h('span', '业务员'), !this.editProductStatus ? h('Icon', {
                props: {
                  type: 'md-create',
                  cursor: 'pointer'
                },
                style: {
                  marginLeft: '5px'
                },
                on: {
                  click: () => {
                    this.changeProStatus(0);
                  }
                }
              }) : h('Icon', {
                props: {
                  type: 'ios-undo',
                  cursor: 'pointer'
                },
                style: {
                  marginLeft: '5px'
                },
                on: {
                  click: () => {
                    this.changeProStatus(1);
                  }
                }
              })
            ]);
          },
          render: (h, params) => {
            let name = null;
            let uId = null;
            if (this.editData.manageMode === 2 && this.editData.saleDivideType === 2) {
              this.editData.businessSaleDivides.forEach((n, i) => {
                if (params.row.productGoodsId === n.businessId) {
                  if (this.userInfoMap[n.userId]) {
                    name = this.userInfoMap[n.userId].userName;
                    uId = this.userInfoMap[n.userId].userId;
                  }
                }
              });
            }
            if (this.editProductStatus) {
              return h('Select', {
                props: {
                  value: uId,
                  transfer: true,
                  clearable: true
                },
                style: {
                  width: '120px'
                },
                on: {
                  'input': (val) => { // val为userId
                    if (this.editProductStatus) {
                      let status = false;
                      if (this.editData.businessSaleDivides.length) {
                        this.editData.businessSaleDivides.forEach((m, t) => {
                          if (m.businessId === params.row.productGoodsId) {
                            if (val) { // 若该分类已存在，则修改其对应的业务员ID
                              m.userId = val;
                            }
                          } else { // 不存在，则新增
                            if (val) {
                              status = true;
                            }
                          }
                        });
                      } else {
                        status = true;
                      }
                      if (status) {
                        this.editData.businessSaleDivides.push({
                          businessId: params.row.productGoodsId,
                          userId: val
                        });
                      }
                    }
                  },
                  'on-clear': (val) => { // 删除
                    this.editData.businessSaleDivides.forEach((m, t) => {
                      if (m.businessId === params.row.productGoodsId) {
                        this.editData.businessSaleDivides.splice(t, 1);
                      }
                    });
                  }
                }
              }, this.getOption(h));
            } else {
              return h('span', name);
            }
          }
        }
      ]
    };
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  methods: {
    enbaleRole (index, status) { // 角色
      let v = this;
      v.roleList.forEach((n, i) => {
        if (i === index) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
    },
    getPlatformData (id, index, type) { // 平台
      let v = this;
      if (index === 0) {
        v.pageParams.platformId = null;
      }
      v.platformGroup.forEach((n, i) => {
        if (i === index) {
          if (type === 2) {
            v.moreTitle = n.title;
          } else {
            v.moreTitle = '更多平台';
          }
          n.selected = true;
          v.pageParams.platformId = n.platformId;
        } else {
          n.selected = false;
        }
      });
    },
    search () { // 查询
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.searchValue = '';
      v.getPlatformData(null, 0);
    },
    getList () { // 获取店铺账户业务角色列表
      let v = this;
      if (!v.getPermission('accountBusinessSale_query')) return;
      v.loadingTrue();
      v.axios.post(api.get_business, v.pageParams).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.loadingFalse();
          if (data.list) {
            v.roleData = data.list;
            v.$nextTick(function () {
              v.total = Number(response.data.datas.total);
            });
          }
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    getCommodityDeveloper () {
      let v = this;
      // commodityDeveloper（即商品开发员）
      v.axios.get(api.productServiceCommon + api.get_queryByBusinessRoleType + 'seller').then((res) => {
        if (res.data.code === 0) {
          v.allUserList = res.data.datas;
        }
      });
    },
    editRole (id) { // 编辑
      let v = this;
      v.editRoleModal = true;
      v.editRoleModalStatus = true;
      v.getCategory();
      v.getProduct();
      // let box = [];
      v.axios.get(api.get_businessInfo + id).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data === null) {
            let pos = {
              businessSaleDivides: [],
              manageMode: 1,
              saleAccountId: id,
              saleDivideType: 1
            };
            v.editData = pos;
          } else {
            v.editData = data;
          }
          // v.editData = data;
          v.editDataCopy = v.deepCopy(v.editData); // 撤销时用
          v.bsData = v.deepCopy(v.editData.businessSaleDivides);
          // 获取业务员下拉列表
          /* let allUserInfoList = v.$store.state.userInfoList;
           v.userInfoMap = allUserInfoList;
           for (let n in allUserInfoList) {
           box.push({
           userName: allUserInfoList[n].userName,
           userId: allUserInfoList[n].userId
           });
           }
           v.allUserList = box; */
          if (data.manageMode === 1) {
            if (data.businessSaleDivides.length) {
              v.userId = data.businessSaleDivides[0].userId;
            }
          }
          if (data.saleDivideType === 1) {
            v.saleDivideType = '1';
          } else if (data.saleDivideType === 2) {
            v.saleDivideType = '2';
          }
        }
      });
    },
    editSave () { // 编辑保存
      let v = this;
      let obj = {};
      if (v.editData.manageMode === 1) {
        let pos = [];
        if (v.userId) {
          pos.push({
            businessId: null,
            userId: v.userId
          });
        }
        obj = {
          businessSaleDivides: pos,
          manageMode: 1,
          saleAccountId: v.editData.saleAccountId,
          saleDivideType: null
        };
      } else {
        let num = null;
        if (v.saleDivideType === '1') {
          num = 1;
        } else {
          num = 2;
        }
        // 处理businessSaleDivides里的数据，保证在切换后保存的都是该模式下的数据
        // if (v.saleDivideType === '1') {
        //   let status = false;
        //   let cateData = v.deepCopy(v.editData);
        //   cateData.businessSaleDivides.forEach((n, i) => {
        //     v.delCateData.forEach((m, t) => {
        //       if (n.businessId === m.productCategoryId) {
        //         status = true;
        //       }
        //     });
        //     if (!status) {
        //       v.editData.businessSaleDivides.splice(i, 1);
        //     }
        //     status = false;
        //   });
        // } else if (v.saleDivideType === '2') {
        //   let proStatus = false;
        //   let data = v.deepCopy(v.editData);
        //   data.businessSaleDivides.forEach((j, k) => {
        //     v.productData.forEach((s, y) => {
        //       if (j.businessId === s.productGoodsId) {
        //         proStatus = true;
        //       }
        //     });
        //     if (!proStatus) {
        //       v.editData.businessSaleDivides.splice(k, 1);
        //     }
        //     proStatus = false;
        //   });
        // }
        obj = {
          businessSaleDivides: v.editData.businessSaleDivides,
          manageMode: 2,
          saleAccountId: v.editData.saleAccountId,
          saleDivideType: num
        };
      }
      v.axios.post(api.update_businessSale, obj).then(response => {
        if (response.data.code === 0) {
          v.editCateStatus = false;
          v.editProductStatus = false;
          v.pageParamsStatus = true;
          v.$Message.success('操作成功');
        }
      });
    },
    editCancel () { // 编辑取消

    },
    getCategory () { // 获取分类列表
      let v = this;
      v.axios.get(api.get_allCategory).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.categoryTree = v.toTree(data, null);
          }
          v.delCateData = data; // 保存时用来比较数据
        }
      });
    },
    getProduct () { // 获取商品列表
      let v = this;
      let obj = {
        pageNum: 1,
        pageSize: 100
      };
      v.axios.post('.' + api.query_productGoods, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas.list;
          v.productData = data;
        }
      });
    },
    toTree (data, parentId) { // 组装数据
      var tree = [];
      var temp;
      for (var i = 0; i < data.length; i++) {
        if (data[i].parentId === parentId) {
          var obj = data[i];
          obj.title = obj.cnName;
          obj.expand = true;
          temp = this.toTree(data, data[i].productCategoryId);
          if (temp.length > 0) {
            obj.children = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    },
    renderContent (h, { root, node, data }) {
      let v = this;
      let name = null;
      let uId = null;
      if (v.editData.manageMode === 2 && v.editData.saleDivideType === 1) {
        v.editData.businessSaleDivides.forEach((n, i) => {
          if (data.productCategoryId === n.businessId) {
            if (v.userInfoMap[n.userId]) {
              name = v.userInfoMap[n.userId].userName;
              uId = v.userInfoMap[n.userId].userId;
            }
          }
        });
      }
      if (v.editCateStatus) {
        return h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            width: '710px'
          }
        }, [
          h('div', {
            style: {
              marginLeft: '5px',
              flex: 1,
              padding: '0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            },
            attrs: {
              title: data.cnName
            }
          }, data.cnName),
          h('div', {
            style: {
              flex: 1,
              padding: '0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            },
            attrs: {
              title: data.enName
            }
          }, data.enName),
          h('div', {
            style: {
              flex: 1,
              padding: '0 10px',
              display: 'flex',
              justifyContent: 'center'
            }
          }, [
            h('Select', {
              props: {
                value: uId,
                transfer: true,
                clearable: true
              },
              style: {
                width: '130px',
                padding: '0 10px'
              },
              on: {
                'input': (val) => { // val为userId
                  if (v.editCateStatus) {
                    let status = false;
                    if (v.editData.businessSaleDivides.length) {
                      v.editData.businessSaleDivides.forEach((m, t) => {
                        if (m.businessId === data.productCategoryId) {
                          if (val) { // 若该分类已存在，则修改其对应的业务员ID
                            m.userId = val;
                          }
                        } else { // 不存在，则新增
                          if (val) {
                            status = true;
                          }
                        }
                      });
                    } else {
                      status = true;
                    }
                    if (status) {
                      v.editData.businessSaleDivides.push({
                        businessId: data.productCategoryId,
                        userId: val
                      });
                    }
                  }
                },
                'on-clear': (val) => { // 删除
                  v.editData.businessSaleDivides.forEach((m, t) => {
                    if (m.businessId === data.productCategoryId) {
                      v.editData.businessSaleDivides.splice(t, 1);
                    }
                  });
                }
              }
            }, v.getOption(h))
          ])
        ]);
      } else {
        return h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            width: '710px'
          }
        }, [
          h('div', {
            style: {
              marginLeft: '5px',
              flex: 1,
              padding: '0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            },
            attrs: {
              title: data.cnName
            }
          }, data.cnName),
          h('div', {
            style: {
              flex: 1,
              padding: '0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            },
            attrs: {
              title: data.enName
            }
          }, data.enName),
          h('div', {
            style: {
              flex: 1,
              padding: '0 10px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            },
            attrs: {
              title: name
            }
          }, name)
        ]);
      }
    },
    getOption (h) {
      let pos = [];
      this.allUserList.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n.userId
          }
        }, n.userName));
      });
      return pos;
    },
    editCategoryRole (val) { // 切换编辑状态
      let v = this;
      if (val) {
        v.editCateStatus = false;
        v.editData = v.deepCopy(v.editDataCopy);
      } else {
        v.editCateStatus = true;
      }
    },
    delRole () { // 单人模式删除业务员
      let v = this;
      v.userId = null;
    },
    getName (val) {
      let v = this;
      let userInfo = v.$store.state.userInfoList;
      let pos = [];
      val.forEach((n, i) => {
        pos.push(userInfo[n].userName);
      });
      return pos.join('、');
    },
    changeProStatus (val) {
      let v = this;
      if (val) {
        v.editProductStatus = false;
      } else {
        v.editProductStatus = true;
      }
    },
    changeType (name) {
      let v = this;
      if (name !== v.saleDivideType) {
        v.saleDivideType = name;
      }
      if (Number(name) !== v.editData.saleDivideType) {
        v.editData.businessSaleDivides = [];
      } else {
        v.editData.businessSaleDivides = v.deepCopy(v.bsData);
      }
    },
    changeExpand (data) {
      let v = this;
      let expand_arr = [];
      let categoryTree_arr = [];
      v.categoryTree.map((item, index) => {
        if (item.children) {
          categoryTree_arr.push(item);
          if (item.expand === false) {
            expand_arr.push(item.expand);
          } else {
            if (item.productCategoryId === data.productCategoryId) {
              expand_arr.splice(index, 1);
            }
          }
        }
      });
      if (expand_arr.length === categoryTree_arr.length) {
        this.showTree = false;
      } else {
        this.showTree = true;
      }
    },

    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree () {
      this.showTree = !this.showTree;
      this.categoryTree = this.treeChangeExpand(this.categoryTree, this.showTree);
    },

    // 递归给树设置expand
    treeChangeExpand (treeData, flag) {
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], 'expand', flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(370);
    this.getCommodityDeveloper();
    this.getPermissionCallback('generalSettings_businessRoleManage').then(() => {
      this.getList();
    });
  }
};
</script >

<style scoped >
.platformClass {
  margin-left: 50px;
}

.shopClass {
  margin-top: 20px;
}

.buttonClass {
  margin-left: 60px;
}

.categoryBox {
  /* width: 100%;
  height: 150px;
  overflow: auto; */
  padding-bottom: 20px;
}
</style >
