<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Tabs v-model="channel" @on-click="changeTab">
            <!--通用渠道-->
            <TabPane label="通用渠道" name="0"></TabPane>
            <!--自定义渠道-->
            <TabPane label="自定义渠道" name="1" v-if="getPermission('saleAccount_list')"></TabPane>
            <TabPane label="渠道管理" name="2" v-if="getPermission('merchantPlatform_management')"></TabPane>
          </Tabs>
          <div v-if="channel === '0'" class="platformParamsSelect">
            <Form ref="filterParams" :model="filterParams" label-position="right" :label-width="80">
              <FormItem label="平台" style="margin-bottom: 10px;" class="notplatformParamsSelect">
                <!-- <Button-group>
                      <template v-for="(item, index) in platformGroup">
                        <span v-if="index < 8" :key="`platformGroup_${index}`">
                          <Button v-if="item.selected" type="primary" @click="getPlatformData(item.platformId)" :key="index">{{ item.title }} </Button>
                          <span class="pseudoButton" v-if="!item.selected" @click="getPlatformData(item.platformId)" :key="index">{{ item.title }}</span>
                        </span>
                      </template>
                      <template v-if="platformGroup.length >= 8">
                        <Dropdown style="margin-left: 10px">
                          <Button>
                            {{ moreTitle }}
                            <Icon type="md-arrow-dropdown" />
                          </Button >
                          <Dropdown-menu slot="list" >
                            <Dropdown-item v-for="(item, index) in platformGroup.slice(5)" :key="`${item.id}-${index}`" >
                              <div @click="getPlatformData(item.platformId)" >{{ item.title }}</div >
                            </Dropdown-item >
                          </Dropdown-menu >
                        </Dropdown >
                      </template >
                    </Button-group > -->
                <RadioGroup v-model="newBtnValue" type="button" button-style="solid" @on-change="changeCurrencyBtn">
                  <Radio v-for="(item, index) in platformGroupShow" :key="index" :label="item.platformId"
                    v-if="index < 8">{{ item.name }}</Radio>
                </RadioGroup>
                <template v-if="platformGroupShow.length >= 8">
                  <Dropdown style="margin-left: 10px">
                    <Button>
                      {{ moreTitle }}
                      <Icon type="md-arrow-dropdown" />
                    </Button>
                    <Dropdown-menu slot="list">
                      <Dropdown-item v-for="(item, index) in platformGroupShow" v-if="index >= 7" :key="item.id">
                        <div @click="getPlatformData(item.platformId, index)">{{ item.name }}</div>
                      </Dropdown-item>
                    </Dropdown-menu>
                  </Dropdown>
                </template>
                <authAbnormalWarnSet class="ml10" v-if="permission.setWarn" />
              </FormItem>
              <!-- </div > -->
              <!-- </div > -->
              <div class="platformSearch clear">
                <dyt-filter :filter-row="1" ref="dytFilter">
                  <Form-item label="账号状态：" class="form-filter-item" prod="status">
                    <dyt-select ref="productGoodsTagsSelect" v-model="filterParams.status">
                      <Option v-for="(name, index) in enableList" :key="index" :value="name.status" :label="name.title" />
                    </dyt-select>
                  </Form-item>
                  <Form-item label="授权状态：" class="form-filter-item"
                    v-if="!['tophatter', 'cdiscount', 'newegg', 'priceminister', 'walmart', 'amazon', 'real', 'ept', 'jdyn'].includes(shopPlatformType)"
                    prod="authStatus">
                    <dyt-select ref="productGoodsTagsSelect" v-model="filterParams.authStatus">
                      <template v-for="(name, index) in impowerList">
                        <Option :key="index" :value="name.status"
                          v-if="!['dhgate', 'mycom', 'factorymarket', 'yandex', 'shopee', 'mercadolibre', 'alibabagj', 'vova'].includes(shopPlatformType) && index >= 3"
                          :label="name.title"
                        />
                        <Option :key="`else-${index}`" :value="name.status" v-else-if="index < 3" :label="name.title" />
                      </template>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="站点：" class="form-filter-item" v-if="shopPlatformType === 'newegg'" prod="status">
                    <dyt-select ref="productGoodsTagsSelect" v-model="filterParams.status">
                      <Option v-for="(name, index) in siteList" :key="index" :value="name.site" :label="name.title" />
                    </dyt-select>
                  </Form-item>
                  <!-- <Form-item label="搜索字符：" prop="searchValue" @submit.native.prevent>
                    <dyt-input
                    placeholder="请输入账户名、代号"
                    v-model.trim="filterParams.searchValue"
                    style="width: 200px"
                    @on-enter="search" > </dyt-input >
                  </Form-item > -->
                  <Form-item label="代号：" @submit.native.prevent prop="accountCode">
                    <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入代号,多个代号用逗号分隔"
                      v-model="filterParams.accountCode" />
                  </Form-item>
                  <Form-item label="账户名：" prop="account" @submit.native.prevent>
                    <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入账户名,多个账户名用逗号分隔"
                      v-model="filterParams.account" />
                  </Form-item>
                  <Form-item label="所属事业部" prop="businessDeptIdList" prod="businessDeptIdList">
                    <dyt-select v-model="filterParams.businessDeptIdList" :max-tag-count="1" multiple
                      placeholder="请选择所属事业部">
                      <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`" :label="item.name" />
                    </dyt-select>
                  </Form-item>
                  <div slot="operation">
                    <Button type="primary" @click="search" v-if="getPermission(`${shopPlatformType}Account_list`)"
                      :disabled="SearchDisabled" icon="md-search">查询 </Button>
                    <Button class="ml10" @click="reset" v-once icon="md-refresh">重置 </Button>
                  </div>
                </dyt-filter>
              </div>
            </Form>
          </div>
          <div v-else-if="channel === '1'">
            <Form ref="filterParams1" label-position="right" :label-width="120">
              <div class="platformParamsSelect">
                <Form-item label="渠道" class="notplatformParamsSelect">
                  <local-buttons class="inline" :data="channelListShow.slice(0, 8)" @btnClick="btnClick" :value.sync="pageParamsCustomize.platformId" />
                  <Dropdown v-if="channelListShow.length > 7" class="ml20">
                    <Button>更多
                      <Icon type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                      <DropdownItem v-for="(item, index) in channelListShow" v-if="index > 6"
                        @click.native="checkedChannel(item, index)" :key="`${item.value}${index}`">{{ item.label }}
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                  <authAbnormalWarnSet class="ml10" v-if="permission.setWarn" />
                </Form-item>
              </div>
              <div class="platformParamsSelect">
              </div>
              <div class="platformParamsSelect">
                <dyt-filter :filter-row="1" ref="dytFilter1">
                  <Form-item label="账号状态：" prop="status">
                    <dyt-select v-model="pageParamsCustomize.status">
                      <Option v-for="(name, index) in tabsData2" :key="index" :value="name.value">{{ name.label }}
                      </Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item label="自定义店铺ID：" prop="accountCode">
                    <!-- <dyt-input v-model="pageParamsCustomize.accountCode" :maxlength="200" placeholder="请输入自定义店铺ID" /> -->
                    <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入店铺ID,多个店铺ID用逗号分隔"
                      v-model="pageParamsCustomize.accountCode" />
                  </Form-item>
                  <Form-item label="自定义店铺名称：" prop="account">
                    <!-- <dyt-input v-model="pageParamsCustomize.account" :maxlength="200" placeholder="请输入自定义店铺名称" /> -->
                    <dyt-input-tag type="textarea" :limit="1" :string="false" placeholder="请输入店铺名称,多个店铺名称用逗号分隔"
                      v-model="pageParamsCustomize.account" />
                  </Form-item>
                  <Form-item label="所属事业部" prop="businessDeptIdList">
                    <dyt-select v-model="pageParamsCustomize.businessDeptIdList" :max-tag-count="1" multiple
                      placeholder="请选择所属事业部">
                      <Option v-for="(item, index) in businessDeptDataList" :value='item.id' :key="`business-${index}`">
                        {{ item.name }}</Option>
                    </dyt-select>
                  </Form-item>
                  <div slot="operation">
                    <Button type="primary" @click="customSearch" v-once icon="md-search">查询 </Button>
                    <Button class="ml10" @click="reset" v-once icon="md-refresh">重置 </Button>
                  </div>
                </dyt-filter>
              </div>
            </Form>
          </div>
          <div v-else-if="channel === '2'">
            <div class="content">
              <div class="Leftcontent">
                <div class="aside_title firTitle">
                  <span style="font-size:14px;">通用渠道</span>
                </div>
                <div class="left_box aside_List contentLeft">
                  <div class="globalScrollbar" style="height:100%">
                    <ul class="aside_List">
                      <li :key="index" @click.stop="selectLeft(item)"
                        v-bind:class="{ 'actived': currIdLeft === item.platformId }"
                        v-for="(item, index) in platformGroupShow">
                        <span>{{ item.name }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="moveBtnGroup">
                <Button style="display:block;margin-bottom:20px" :disabled="!currIdLeft"
                  @click="updateSort('left', currIdLeft, 1)">上移
                  <Icon type="ios-arrow-up" class="ml5" />
                </Button>
                <Button style="display:block" :disabled="!currIdLeft" @click="updateSort('left', currIdLeft, 2)">下移
                  <Icon type="ios-arrow-down" class="ml5" />
                </Button>
              </div>
              <div class="rightContent">
                <div class="rightTitle">
                  <RadioGroup v-model="btnValue" type="button" button-style="solid" style="width:250px"
                    @on-change="changeBtnValue">
                    <Radio label="启用" class="radioItem"></Radio>
                    <Radio label="停用" class="radioItem"></Radio>
                  </RadioGroup>
                  <div class="aside_title secTitle">
                    <span style="font-size:14px">自定义渠道</span>
                    <Button type="text" class="addBtn" @click="channelHandel('add')"
                      v-if="btnValue == '启用'">+新增渠道</Button>
                  </div>
                </div>
                <div class="left_box aside_List contentRight">
                  <ul class="aside_List">
                    <li :key="index" @click.stop="selectRight(item)"
                      v-bind:class="{ 'actived': currIdRight === item.name }"
                      v-for="(item, index) in btnValue == '启用' ? channelListShow : channelListShowStop" v-if="index > 0">
                      <div class="channelItem">
                        <div>{{ item.name }}</div>
                        <div>
                          <!-- 编辑 -->
                          <Icon
                            v-if="(item.name == currIdRight && btnValue == '启用') && getPermission('merchantPlatform_updateDefine')"
                            @click.stop="channelHandel('edit', item)" type="ios-create" class="iconEdit" title="编辑" />
                          <!-- 停用 -->
                          <Icon
                            v-if="item.name == currIdRight && btnValue == '启用' && getPermission('merchantPlatform_updateStatus')"
                            type="md-power" class="iconStop" @click.stop="operateChannel(item, 'stop')" title="停用" />
                          <!-- 启用 -->
                          <Icon
                            v-if="item.name == currIdRight && btnValue == '停用' && getPermission('merchantPlatform_updateStatus')"
                            type="logo-youtube" class="iconOpen" @click.stop="operateChannel(item, 'open')" title="启用" />
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="moveBtnGroup ml20" v-if="btnValue == '启用'">
                <Button style="display:block;margin-bottom:20px" :disabled="!currIdRight"
                  @click="updateSort('right', currIdRight, 1)">上移
                  <Icon type="ios-arrow-up" class="ml5" />
                </Button>
                <Button style="display:block" :disabled="!currIdRight" @click="updateSort('right', currIdRight, 2)">下移
                  <Icon type="ios-arrow-down" class="ml5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="modal" :title="modalTitle" :mask-closable="false" @on-cancel="closeModal">
      <Form ref="formInline" :model="formInline" :rules="ruleInline">
        <FormItem prop="platformId" label="渠道代码" :label-width="80">
          <Input type="text" :disabled="modalType !== 'add'" v-model="formInline.platformId" :maxlength="20"></Input>
        </FormItem>
        <FormItem prop="name" label="渠道名称" :label-width="80">
          <Input type="text" v-model="formInline.name" :maxlength="50"></Input>
        </FormItem>
        <FormItem prop="webSite" label="渠道网址" :label-width="80">
          <Input type="text" v-model="formInline.webSite" :maxlength="200"></Input>
        </FormItem>
        <FormItem prop="remark" label="备注" :label-width="80">
          <Input type="textarea" v-model="formInline.remark" :maxlength="200" class="remarkContent"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="saveMt">保存 </Button>
        <Button @click="closeModal">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';
import authAbnormalWarnSet from '@/views/generalSettings/components/generalSettings/components/authAbnormalWarnSet'; // 异常提醒设置
import api from '@/api/api';

export default {
  components: {
    authAbnormalWarnSet
  },
  mixins: [Mixin],
  props: {
    pageParams: Object,
    shopPlatformType: String, // 平台类型
    siteList: Array
  },
  watch: {
    shopPlatformType: {
      handler(n) {
        this.changePlatform(n);
        this.newBtnValue = n;
      },
      immediate: true
    },
    channel: {
      handler(n, o) {
        if (n && n !== o) {
          this.$store.commit('SETTING_CHANNEL', Number(n));
          if (n === '0') {
            this.search();
          } else if (n === '1') {
            if (this.otherOpen) return;
            this.pageParamsCustomize.platformId = -1;
            this.customSearch();
          }
        }
        if (n === '0' && this.platformGroupShow.length != 0) {
          this.changePlatformLocation(this.platformGroupShow);
        }
      },
      immediate: true
    },
    '$route.params.platform': {
      handler(val) {
        if (val) {
          this.changePlatformLocation(this.platformGroupShow);
        }
      }
    }
  },
  data() {
    return {
      otherOpen: false,
      formInline: {
        merchantPlatformId: '', // 渠道id
        name: '', // 渠道名称
        platformId: '', //  渠道代码
        remark: '', // 备注
        webSite: '' // 网址
      },
      businessDeptDataList: [],
      ruleInline: {
        platformId: [
          {
            required: true,
            message: '渠道代码不能为空',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '渠道名称不能为空',
            trigger: 'blur'
          }
        ],
        webSite: [
          {
            required: true,
            message: '渠道网址不能为空',
            trigger: 'blur'
          }
        ]
      },
      modalType: 'add', // add 添加  edit 编辑
      modal: false,
      modalTitle: '新增',
      pageParamsCustomize: {
        pageNum: 1,
        pageSize: 10,
        businessDeptIdList: [],
        account: [], // 自定义店铺名称 ,
        accountCode: [], // 自定义店铺id ,
        orderBy: 'createdTime', // 排序 createdTime 按时间 accountCode 按代号 ,
        platformId: -1, // 平台id 全部则不传 ,
        platformType: 1, // 平台类型 0 通用平台 1自定义平台 ,
        status: -1, // 自定义店铺状态 0停用 1启用 -1全部 ,
        upDown: 'up' // up 升序 down降序
      },
      filterParams: {
        businessDeptIdList: [],
        status: '-1',
        authStatus: '-1',
        accountCode: [],
        account: [],
        site: null
      },
      channelList: [
        {
          value: '-1',
          label: '全部'
        }
      ],
      channel: '0', // 0 通用平台 1 自定义渠道
      moreFilter: false, // 高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      moreTitle: '更多',
      enableList: [
        {
          selected: true,
          status: '-1',
          title: '全部'
        },
        {
          selected: false,
          status: '1',
          title: '启用'
        },
        {
          selected: false,
          status: '0',
          title: '停用'
        }
      ],
      impowerList: [
        {
          selected: true,
          status: '-1',
          title: '全部'
        },
        {
          selected: false,
          status: '1',
          title: '已授权'
        },
        {
          selected: false,
          status: '0',
          title: '未授权'
        },
        {
          selected: false,
          status: '2',
          title: '授权过期'
        }
      ],
      platformGroup: [],
      platformName: '',
      currIdLeft: null,
      currIdRight: null,
      btnValue: '启用',
      newBtnValue: '',
      channelListShow: [], // 所有自定义渠道（启用
      channelListShowStop: [], // 所有自定义渠道（停用
      platformGroupShow: [] // 所有通用渠道
    };
  },
  computed: {
    permission() {
      return {
        setWarn: this.getPermission('saleAccountSettingAuthWarn'),
      }
    },
  },
  created() {
    this.$common.promiseAll([
      () => {
        return this.getPlatformGroupNew(true)
      },
      this.removeLocalItem
    ]).finally(() => {
      this.$bus.on('common-shop-view', this.removeLocalItem);
      this.removeLocalItem();
    });
  },
  mounted() {},
  methods: {
    removeLocalItem () {
      const cType = localStorage.getItem('goto-channel');
      const accountName = localStorage.getItem('not-auth-abnormal-warn');
      setTimeout(() => {
        localStorage.removeItem('goto-channel');
        localStorage.removeItem('not-auth-abnormal-warn');
      }, 2000);
      if (this.$common.isEmpty(cType)) {
        if (!this.$common.isEmpty(accountName)) {
          this.$set(this.filterParams, 'account', [accountName]);
          this.$nextTick(() => {
            this.search();
          })
        }
        return;
      }
      let choseIndex = 0;
      const platformInfo = this.channelListShow.find((item, index) => {
        choseIndex = index;
        return item.platformId == cType;
      });
      if (this.channel != '1') {
        this.otherOpen = true;
        this.channel = '1';
      }
      this.$nextTick(() => {
        if (this.$common.isEmpty(platformInfo) || this.pageParamsCustomize.platformId == platformInfo.value) {
          this.otherOpen = false;
          return;
        }
        choseIndex > 7 ? this.checkedChannel(platformInfo, choseIndex) : this.btnClick(platformInfo);
        this.$nextTick(() => {
          this.otherOpen = false;
          if (!this.$common.isEmpty(accountName)) {
            this.$set(this.pageParamsCustomize, 'account', [accountName]);
          }
          this.customSearch();
        })
      });
    },
    initFilter() {
      this.$refs.dytFilter && this.$refs.dytFilter.init();
      this.$refs.dytFilter1 && this.$refs.dytFilter1.init();
    },
    checkedChannel(item, index) {
      /**
       * 更多平台中选择平台
       * @params
       * item 选择数据
       * */
      for (let key in this.formInline) {
        this.formInline[key] = item[key];
      }
      let nIndex = 0;
      this.pageParamsCustomize.platformId = item.value;
      this.formInline.merchantPlatformId = item.merchantPlatformId;
      this.formInline.remark = item.descs;
      this.channelList.forEach((val, vIndex) => {
        if (val.merchantPlatformId === item.merchantPlatformId) {
          nIndex = vIndex;
        }
      })
      this.channelList.splice(1, 0, ...this.channelList.splice(nIndex, 1));
      if (index && index > 7) {
        this.changeArrItem(this.channelListShow, index, 7)
      }
    },
    btnClick(item) {
      for (let key in this.formInline) {
        this.formInline[key] = item[key];
      }
      this.pageParamsCustomize.platformId = item.value;
    },
    saveMt() {
      // 新增保存 编辑保存
      if (this.modalType === 'add') {
        // 新增保存
        this.$refs.formInline.validate((valid) => {
          if (valid) {
            if (this.formInline.hasOwnProperty('merchantPlatformId')) { delete this.formInline.merchantPlatformId; }
            this.axios
              .post(api.add_merchantPlatform, this.formInline)
              .then((response) => {
                if (response.data.code === 0) {
                  this.$Message.success('操作成功');
                  this.modal = false;
                  this.getPlatformGroupNew(false);
                } else {
                  this.$Message.error('添加失败');
                }
              });
          }
        });
      } else if (this.modalType === 'edit') {
        this.$refs.formInline.validate((valid) => {
          if (valid) {
            this.axios
              .put(api.update_merchantPlatform, this.formInline)
              .then((response) => {
                if (response.data.code === 0) {
                  this.$Message.success('操作成功');
                  this.modal = false;
                  this.getPlatformGroupNew(false);
                } else {
                  this.$Message.error('操作失败，请重新尝试');
                }
              });
          }
        });
      }
    },
    channelHandel(type = 'add', item) {
      /**
       * 打开操作框
       * @params
       * type String 操作类型 add  edit
       * */
      if (type === 'add') {
        for (let key in this.formInline) {
          this.formInline[key] = '';
        }
        this.modalTitle = '新增';
      } else {
        this.setFormData(item)
        this.modalTitle = '编辑';
      }
      this.modalType = type;
      this.modal = true;
    },
    // 平台路由跳转
    getPlatformData(id, index) {
      this.platformGroup.forEach((n, i) => {
        if (id === n.platformId) {
          this.$router.push(id);
        }
      });
      if (index && index > 7) {
        this.changeArrItem(this.platformGroupShow, index, 7)
      }
    },
    search() {
      this.$nextTick(() => {
        this.$emit('combineData', this.filterParams);
      })
    },
    customSearch() {
      if (this.otherOpen) return;
      this.$nextTick(() => {
        this.$emit('customListCombine', this.pageParamsCustomize);
      })
    },
    reset() {
      if (this.$store.state.SETTING_CHANNEL === 0) {
        this.$refs['filterParams'].resetFields();
        this.$nextTick(() => {
          this.filterParams.status = '-1';
          this.filterParams.authStatus = '-1';
        })
        // this.impower(0, '');
        // this.enbaleUser(0, '');
      } else {
        this.pageParamsCustomize = {
          pageNum: 1,
          pageSize: 10,
          account: [], // 自定义店铺名称 ,
          accountCode: [], // 自定义店铺id ,
          orderBy: 'createdTime', // 排序 createdTime 按时间 accountCode 按代号 ,
          platformId: -1, // 平台id 全部则不传 ,
          platformType: 1, // 平台类型 0 通用平台 1自定义平台 ,
          status: -1, // 自定义店铺状态 0停用 1启用 -1全部 ,
          upDown: 'up' // up 升序 down降序
        };
      }
    },
    changePlatform(shopPlatformType) {
      this.filterParams.platformId = shopPlatformType;
      this.makePlatformGroup().then((res) => {
        this.platformGroup.forEach((n, i) => {
          if (shopPlatformType === n.platformId) {
            n.selected = true;
            if (i >= 8) {
              this.platformName = n.title;
              const old = this.platformGroup[7];
              this.platformGroup.splice(i, 1);
              this.platformGroup.splice(7, 1, n, old);
            }
            this.platformName = n.title;
          } else {
            n.selected = false;
          }
        });
      });
    },
    // 所有平台列表 已启用
    makePlatformGroup() {
      return new Promise((resolve) => {
        let platformGroup = this.$store.state.platformGroup;
        if (platformGroup === null || platformGroup.length === 0) {
          this.getPlatformGroup(1, '/setting-service/erpCommon').then(
            (result) => {
              if (result) {
                this.PlatformGroupformat(resolve);
              }
            }
          );
        } else {
          this.PlatformGroupformat(resolve);
        }
      });
    },
    // 处理不同渠道需要的平台数据格式 type:1 通用渠道 type:2 自定义渠道
    PlatformGroupformat(resolve) {
      let list = (this.$store.state.platformGroup || []).filter((i) => i.type === 1);
      let pos = [];
      this.channelList = [
        {
          value: -1,
          label: '全部'
        },
        ...this.$store.state.platformGroup
          .filter((i) => i.type === 2)
          .map((i) => {
            i.value = i.platformId;
            i.label = i.name;
            return i;
          })
      ];
      list.forEach((n, i) => {
        pos.push({
          selected: n.platformId === this.shopPlatformType,
          platformId: n.platformId,
          title: n.name
        });
      });
      this.platformGroup = pos;
      this.platformGroup.forEach(k => {
        this.$set(k, 'label', k.title)
      })
      this.$store.commit(
        'platformGroupShow',
        !!this.platformGroup.length
      );
      this.$parent.pageParamsStatus = true;
      resolve();
    },
    // 选中侧边栏供应商项目
    selectLeft(item) {
      this.currIdLeft = item.platformId;
    },
    selectRight(item) {
      this.currIdRight = item.name;
    },
    operateChannel(item, type) {
      let text = type == 'stop' ? '停用' : '启用';
      let handleType = type == 'stop' ? 0 : 1; // 0:停用 1:启用
      this.$Modal.confirm({
        title: '操作提示',
        render: (h) => {
          return h('div', [
            h('span', {
              style: {
                marginLeft: '38px'
              }
            }, `确认是否要${text}渠道：`),
            h('span', {
              style: {
                color: 'orange'
              }
            }, item.label)
          ]);
        },
        loading: true,
        onOk: () => {
          let reqParams = {
            handleType,
            merchantPlatformId: item.merchantPlatformId,
            name: item.name
          }
          this.axios.post(api.update_platformStatus, reqParams).then((res) => {
            if (res.data.code === 0) {
              this.getPlatformGroupNew(false);
              this.$Message.success('操作成功');
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && this.$Message.error('操作失败，请重新尝试');
            }
          }).finally(() => {
            this.$Modal.remove();
          })
        }
      });
    },
    changeCurrencyBtn(item) {
      this.getPlatformData(item)
    },
    // 数组元素互换位置
    changeArrItem(arr, index1, index2) {
      [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
    },
    updateSort(position, val, type) {
      // position: left左  right右
      // val: 平台ID
      // type: 1上移  2下移
      let list = position == 'left' ? this.platformGroupShow : this.channelListShow;
      let isUpdateLeft = position == 'left';
      let reqParams = {};
      list.forEach(k => {
        let itemId = position == 'left' ? k.platformId : k.name;
        if (itemId == val) {
          let temp = {
            operationType: type, // 1上移 2下移
            merchantPlatformId: k.merchantPlatformId,
            type: k.type,
            status: k.status,
            orderNo: k.orderNo,
            platformId: k.platformId,
            name: k.name,
            descs: k.descs,
            signUrl: k.signUrl,
            webSite: k.webSite
          };
          reqParams = temp
        }
      })
      this.axios.post(api.sort_commonPlatform, reqParams).then((res) => {
        if (res.data.code === 0) {
          this.$Message.success('操作成功');
          this.getPlatformGroupNew(isUpdateLeft);
        } else {
          (!res.data || ![999993, '999993'].includes(res.data.code)) && this.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 获取所有平台 1启用0停用
    getPlatformGroupNew(isUpdateLeft) {
      return new Promise((resolve) => {
        let status = this.btnValue == '启用' ? 1 : 0;
        this.axios.get(api.get_queryByStatus + `?status=${status}`).then(res => {
          if (res && res.data.code === 0) {
            let data = res.data.datas;
            let listRight = [];
            let listLeft = [];
            this.$store.commit('platformGroup', data);
            if (isUpdateLeft || (this.channel == 2 && this.btnValue === '启用')) {
              listLeft = data.filter(k => {
                return k.type == 1
              })
              if (this.channel === '0') {
                this.changePlatformLocation(listLeft)
              }
              this.platformGroupShow = listLeft;
            }
            listRight = data.filter(k => {
              this.$set(k, 'value', k.platformId);
              this.$set(k, 'label', k.name);
              return k.type == 2
            })
            let first = {
              value: -1,
              label: '全部'
            };
            listRight.unshift(first);
            if (status) {
              this.channelListShow = listRight;
            } else {
              this.channelListShowStop = listRight
            }
          }
        }).then(() => {
          if (this.channel !== '2') {
            this.changePlatformLocation(this.platformGroupShow);
          }
          resolve({ state: 'finally' });
        }).catch(() => {
          resolve({ state: 'finally' });
        });
      })
    },
    changeBtnValue() {
      this.getPlatformGroupNew(false).finally(() => {
        this.currIdRight = null;
      });
    },
    // 获取事业部
    getBusinessDeptData() {
      return new Promise((resolve) => {
        this.axios.get(api.get_businessDeptList).then(res => {
          if (res && res.data) {
            this.businessDeptDataList = res.data.data || [];
          }
        }).finally(() => {
          resolve({ state: 'finally' })
        })
      })
    },
    setFormData(item) {
      let form = this.formInline;
      form.platformId = item.platformId; //  渠道代码
      form.name = item.name; // 渠道名称
      form.webSite = item.webSite; // 网址
      form.remark = item.descs; // 备注
      form.merchantPlatformId = item.merchantPlatformId // 渠道id
    },
    // 防止通过非点击平台按钮而跳转路由导致的按钮选中问题
    changePlatformLocation(data) {
      let isExist = data.slice(0, 8).find(i => i.platformId === this.$route.params.platform);
      if (!isExist) {
        let index = data.findIndex(j => j.platformId === this.$route.params.platform);
        this.changeArrItem(data, index, 7);
      }
    },
    closeModal() {
      this.modal = false;
      this.$refs['formInline'].resetFields();
    },
    changeTab() {
      this.btnValue = '启用';
      this.getPlatformGroupNew(false);
    }
  }
};
</script>
<style scoped lang="less">
.search-box {
  margin-bottom: 0 !important;
  margin-top: 10px;
}

.content {
  /* height:calc(100vh - 230px); */
  height: 700px;
  background-color: #fff;
  display: flex;
}

.left_box {
  width: 200px;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  height: 422px;
}

.aside_List {
  overflow: auto;
}

.aside_List>li {
  position: relative;
  padding: 14px 20px;
  color: #333333;
  border-bottom: 1px solid #DCDFE6;
}

.aside_List>li>span {
  display: inline-block;
  white-space: normal;
  word-break: break-all;
}

.aside_List>li:hover {
  cursor: pointer;
  background-color: #ECF5FF
}

.aside_List>li.actived {
  background-color: #ECF5FF
}

.aside_title {
  border-bottom: 1px solid #dcdfe6;
  color: #426282;
  font-weight: 600;
  background-color: #f8f9fd;
  height: 45px;
  display: table-cell;
  vertical-align: middle;
  line-height: 45px;
  padding: 0 20px;
}

.moveBtnGroup {
  margin-top: 150px;
}

.contentLeft {
  width: 150px;
  height: 425px;
}

.contentRight {
  width: 250px;
  height: 425px;
}

.radioItem {
  width: 50%;
  text-align: center
}

.addBtn {
  margin-left: 30px;
  color: #2d8cf0;
  font-size: 14px;
  padding-bottom: 5px
}

.iconStop {
  font-size: 20px;
  color: red
}

.iconOpen {
  font-size: 20px;
  color: #63cd00;
  margin-left: 20px
}

.iconEdit {
  font-size: 20px;
  margin-right: 10px
}

.rightContent {
  margin-left: 100px;
}

.rightTitle {
  margin-top: 20px
}

.secTitle {
  width: 250px;
  border: 1px solid #dcdfe6
}

.firTitle {
  width: 150px;
  border: 1px solid #dcdfe6;
}

.Leftcontent {
  margin: 50px 0 0 100px;
}

.ivu-dropdown-menu {
  max-height: 168px;
}

.channelItem {
  display: flex;
  justify-content: space-between
}

.remarkContent {
  :deep(textarea) {
    height: 80px;
  }
}
</style>
