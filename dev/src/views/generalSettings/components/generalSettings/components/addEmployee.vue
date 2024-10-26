<template >
  <div class="employee-modal-content">
    <div class="information-content">
      <!--基本资料-->
      <div class="modalItem" id="basic_information">
        <div class="modalItemHeader" >
          <div class="block-title">基本资料</div>
        </div>
        <div class="modalItemContent" >
          <div class="addEmpolyeeData" >
            <Form
                ref="newEmployeeParams"
                :model="newEmployeeParams"
                :rules="ruleCustom"
                label-position="right"
                :label-width="100" >
              <!-- <Form-item label="邮箱" prop="email" >
                <Input v-model.trim="newEmployeeParams.email" :disabled="true"></Input >
              </Form-item > -->
              <!-- <Form-item class="mobileClass" label="电话" prop="mobile" >
                <Input v-model.trim="newEmployeeParams.mobile" :disabled="true"></Input >
              </Form-item > -->
              <Form-item label="姓名" prop="userName" >
                <dyt-input v-model.trim="newEmployeeParams.userName"></dyt-input >
              </Form-item >
              <!-- <Form-item label="密码" prop="password" >
                <Row >
                  <Col span="12" >
                    <Input v-model="newEmployeeParams.password" :autofocus="passwordFocus" ></Input >
                  </Col >
                  <Col span="5" offset="1" >
                    <Button @click="getStrongPassword" >重新生成</Button >
                  </Col >
                </Row >
              </Form-item > -->
            </Form >
          </div >
        </div >
      </div>
      <!--角色-->
      <div class="sticky-modal-item modalItemHeader" >
        <div class="block-title">角色</div>
      </div>
      <div class="not-border-top modalItem" id="role_information" v-if="employeeAdmin !== '1'" >
        <div class="modalItemContent" >
          <Card dis-hover >
            <div slot="title" >操作角色</div >
            <div class="roleData clear" >
              <Checkbox-group v-model="newEmployeeParams.roleIdList" @on-change="permissionsHand(newEmployeeParams.roleIdList, true)">
                <div class="roleItem" v-for="(item, index) in changeRoleList" :key="index" >
                  <Checkbox :label="item.roleId" :title="item.title" >
                    <span >{{ item.title }}</span >
                  </Checkbox >
                </div >
              </Checkbox-group >
            </div >
          </Card >
          <Card dis-hover >
            <div slot="title" >业务角色</div >
            <div class="roleData clear" >
              <Checkbox-group v-model="newEmployeeParams.businessRoleTypeList">
                <div class="roleItem" v-for="(item, index) in businessRoleTypeList" :key="'businessRoleTypeList'+index" >
                  <Checkbox :label="item.roleId" :title="item.title" >
                    <span >{{ item.title }}</span >
                  </Checkbox >
                </div >
              </Checkbox-group >
            </div >
          </Card >
        </div >
      </div>
      <!--店铺权限-订单管理系统-->
      <div class="sticky-modal-item modalItemHeader" >
        <div class="block-title">
          <div>店铺权限-订单管理系统</div>
          <div
            class="custom-checkbox"
            :class="{
              'checkbox-disabled': isStoreSuperAdmin,
              'checkbox-indeterminate': groupCheck.orderIndeterLeft,
              'checkbox-checked': groupCheck.orderLeft
            }"
            @click="orderCheckAll('default')"
          >
            <span class="custom-check-frame" />全选
          </div>
        </div>
      </div>
      <div class="modalItem not-border-top" id="order_information" v-if="employeeAdmin !== '1'" >
        <template>
          <div v-for="(typeItem, index) in platformTypeList" class="modalItemContent" :key="index" >
            <div class="roleData clear" >
              <div class="clear platform-box">
                <div class="shopTable">
                  <div class="platformItem" v-if="userPlatformType.includes(typeItem)">
                    <span :class="typeItem"></span >
                  </div>
                  <div v-else style="font-size: initial;">{{ typeItem }}</div>
                </div>
                <div
                  class="custom-checkbox"
                  :class="{
                    'checkbox-disabled': isStoreSuperAdmin,
                    'checkbox-indeterminate': indeterminate[index],
                    'checkbox-checked': checkAll[index]
                  }"
                  @click="handleCheckAll(index,typeItem)"
                >
                  <span class="custom-check-frame" />全选
                </div>
              </div>
              <Checkbox-group :disabled="isStoreSuperAdmin" v-model="checkAllGroup[index]" @on-change="chooseAllGroupChange(index,typeItem)">
                <div v-for="(pKey, pIndex) in Object.keys(platAccountJson[typeItem] || {})" :key="`pat-${pIndex}`">
                  <div class="business-dept-checkbox" v-if="platAccountJson[typeItem][pKey] && platAccountJson[typeItem][pKey].length != 0">
                    <div
                      v-if="chooseGroupDept[typeItem] && chooseGroupDept[typeItem].orderVal && chooseGroupDept[typeItem].orderVal[pKey]"
                      class="custom-checkbox"
                      :class="{
                        'checkbox-disabled': isStoreSuperAdmin,
                        'checkbox-indeterminate': chooseGroupDept[typeItem].orderVal[pKey].indeter,
                        'checkbox-checked': chooseGroupDept[typeItem].orderVal[pKey].check
                      }"
                      @click="orderBusinessDeptChoose('order-left', typeItem, pKey, index)"
                    >
                      <span class="custom-check-frame" />{{ businessDeptJson[pKey].businessDeptName }}
                    </div>
                  </div>
                  <div class="business-dept-item">
                    <div
                      class="roleItem"
                      v-for="(item, sIndex) in (platAccountJson[typeItem][pKey] || [])"
                      :key="`${index}-${pIndex}-${sIndex}`"
                    >
                      <Checkbox :label="item.saleAccountId" :title="item.account" :disabled="isStoreSuperAdmin">
                        <span >{{ item.accountCode }}</span>
                      </Checkbox>
                    </div>
                  </div>
                </div>
              </Checkbox-group>
            </div>
          </div>
        </template>
      </div>
      <!--店铺权限-客服管理系统-->
      <div class="sticky-modal-item modalItemHeader" >
        <div class="block-title">
          <div>店铺权限-客服管理系统</div>
          <div
            class="custom-checkbox"
            :class="{
              'checkbox-disabled': isStoreSuperAdmin,
              'checkbox-indeterminate': groupCheck.customerIndeterLeft,
              'checkbox-checked': groupCheck.customerLeft
            }"
            @click="customerCheckAll('default')"
          >
            <span class="custom-check-frame" />全选
          </div>
        </div>
      </div>
      <div class="not-border-top modalItem" id="customer_information" v-if="employeeAdmin !== '1'" >
        <template>
          <div v-for="(typeItem, index) in platformTypeList" class="modalItemContent" :key="index">
            <div class="roleData clear" >
              <div class="clear platform-box" >
                <div class="shopTable">
                  <div class="platformItem" v-if="userPlatformType.includes(typeItem)">
                    <span :class="typeItem" ></span >
                  </div>
                  <div v-else style="font-size: initial;">{{ typeItem }}</div>
                </div>
                <div
                  class="custom-checkbox"
                  :class="{
                    'checkbox-disabled': isStoreSuperAdmin,
                    'checkbox-indeterminate': indeterminateSale[index],
                    'checkbox-checked': checkSaleAll[index]
                  }"
                  @click="handleCheckSaleAccountAll(index,typeItem)"
                >
                  <span class="custom-check-frame" />全选
                </div>
              </div>
              <Checkbox-group :disabled="isStoreSuperAdmin" v-model="checkSaleAllGroup[index]" @on-change="checkSaleAllGroupChange(index,typeItem)">
                <div v-for="(pKey, pIndex) in Object.keys(platAccountJson[typeItem] || {})" :key="`pat-${pIndex}`">
                  <div class="business-dept-checkbox" v-if="platAccountJson[typeItem][pKey] && platAccountJson[typeItem][pKey].length != 0">
                    <div
                      v-if="chooseGroupDept[typeItem] && chooseGroupDept[typeItem].csVal && chooseGroupDept[typeItem].csVal[pKey]"
                      class="custom-checkbox"
                      :class="{
                        'checkbox-disabled': isStoreSuperAdmin,
                        'checkbox-indeterminate': chooseGroupDept[typeItem].csVal[pKey].indeter,
                        'checkbox-checked': chooseGroupDept[typeItem].csVal[pKey].check
                      }"
                      @click="orderBusinessDeptChoose('cs-left', typeItem, pKey, index)"
                    >
                      <span class="custom-check-frame" />{{ businessDeptJson[pKey].businessDeptName }}
                    </div>
                  </div>
                  <div class="business-dept-item">
                    <div
                      class="roleItem"
                      v-for="(item, sIndex) in (platAccountJson[typeItem][pKey] || [])"
                      :key="`${index}-${pIndex}-${sIndex}`"
                    >
                      <Checkbox :label="item.saleAccountId" :title="item.account" :disabled="isStoreSuperAdmin">
                        <span >{{ item.accountCode }}</span>
                      </Checkbox>
                    </div>
                  </div>
                </div>
              </Checkbox-group>
            </div>
          </div>
        </template>
      </div>
      <!--仓库权限-->
      <div class="sticky-modal-item modalItemHeader" >
        <div class="block-title">
          <div>仓库权限</div>
          <div>
            <div
              class="custom-checkbox"
              :class="{
                'checkbox-indeterminate': groupCheck.warehouseIndeterLeft,
                'checkbox-checked': groupCheck.warehouseLeft
              }"
              @click="warehouseCheckAll('default')"
            >
              <span class="custom-check-frame" />全选
            </div>
          </div>
        </div>
      </div>
      <div class="not-border-top modalItem" id="warehouse_information" v-if="employeeAdmin !== '1'" >
        <div>
          <div class="roleItem" v-for="(item, index) in warehouseList" :key="index" >
            <Checkbox
                v-model="warehouseListMap[index]" @on-change="warehouseChange({
                          value:$event,
                          warehouseId: item.warehouseId,
                          index:index
                      })" :title="item.warehouseName" >
              <span >{{ item.warehouseName }}</span >
            </Checkbox >
            <div v-for="(cItem,cIndex) in permissionsKeys" :key="cIndex" >
              <!-- 这里云仓的分配不在我们系统，需要过滤掉 -->
              <template v-if="!(item.isYms == 1 && cItem.permission == 'noneAssignUploadPackage')">
                <Checkbox
                    v-model="warehouseListPerMap[index][cIndex]" :disabled="!warehouseListMap[index]" @on-change="warehousePerChange({
                            value: $event,
                            warehouseId: item.warehouseId,
                            permission: cItem,
                            index: index
                        })" >{{ cItem.desc }}
                </Checkbox >
              </template>
              </div >
          </div >
        </div >
      </div>
    </div>
    <!-- 搜索模块 -->
    <div class="information-search-content">
      <!-- 搜索栏 -->
      <div class="information-search-bar">
        <Form ref="employeeForm" :model="pageFormParams" label-position="right" :label-width="0">
          <div style="display: flex;padding: 0 15px 0 0;">
            <Form-item style="flex:100;" prop="searchValue">
              <dyt-input-tag
                type="textarea"
                :limit="1"
                :string="false"
                placeholder="请输入店铺简称，多个逗号或回车分隔"
                v-model.trim="pageFormParams.searchValue"
              />
            </Form-item>
            <div style="margin-left: 10px;">
              <Button type="primary" @click="searchStore">查询</Button>
              <Button style="margin-left: 10px;" @click="resetStore">重置</Button>
            </div>
          </div>
        </Form>
      </div>
      <!--店铺权限-订单管理系统-->
      <div class="modalItem" id="order_search" v-if="employeeAdmin !== '1'" >
        <div class="modalItemHeader" >
          <div class="block-title">
            <div>店铺权限-订单管理系统</div>
            <div
              class="custom-checkbox"
              :class="{
                'checkbox-disabled': isStoreSuperAdmin,
                'checkbox-indeterminate': groupCheck.orderIndeterRight,
                'checkbox-checked': groupCheck.orderRight
              }"
              @click="orderCheckAll('search')"
            >
              <span class="custom-check-frame" />全选
            </div>
          </div>
        </div>
        <template v-for="(typeItem, index) in platformTypeList">
          <div
            class="roleData clear modalItemContent"
            v-if="searchStoreJson[typeItem] && searchStoreJson[typeItem].length != 0"
            :key="`sr-${index}`"
            style="padding-bottom: 10px;"
          >
            <div class="clear platform-box" >
              <div class="shopTable">
                <div class="platformItem" v-if="userPlatformType.includes(typeItem)">
                  <span :class="typeItem" ></span >
                </div>
                <div v-else style="font-size: initial;">{{ typeItem }}</div>
              </div>
              <div
                class="custom-checkbox"
                :class="{
                  'checkbox-disabled': isStoreSuperAdmin,
                  'checkbox-indeterminate': rightPaltChoose.order && rightPaltChoose.order[typeItem] && rightPaltChoose.order[typeItem].indeter,
                  'checkbox-checked': rightPaltChoose.order && rightPaltChoose.order[typeItem] && rightPaltChoose.order[typeItem].check,
                }"
                @click="orderAllCheckChange(index,typeItem)"
              >
                <span class="custom-check-frame" />全选
              </div>
            </div>
            <Checkbox-group :disabled="isStoreSuperAdmin" v-model="searchOrderAllCheck[index]" @on-change="searchOrderChange(index,typeItem)">
              <div
                v-for="(pKey, pIndex) in Object.keys(searchStoreJson[typeItem] || {})"
                :key="`pat-${pIndex}`"
              >
                <div
                  class="business-dept-checkbox"
                  v-if="searchStoreJson[typeItem][pKey] && searchStoreJson[typeItem][pKey].length != 0"
                >
                  <div
                    class="custom-checkbox"
                    :class="{
                      'checkbox-disabled': isStoreSuperAdmin,
                      'checkbox-indeterminate': rightChoose.order && rightChoose.order[typeItem] && rightChoose.order[typeItem][pKey] && rightChoose.order[typeItem][pKey].indeter,
                      'checkbox-checked': rightChoose.order && rightChoose.order[typeItem] && rightChoose.order[typeItem][pKey] && rightChoose.order[typeItem][pKey].check
                    }"
                    @click="orderBusinessDeptChoose('order-right', typeItem, pKey, index)"
                  >
                    <span class="custom-check-frame" />{{ businessDeptJson[pKey].businessDeptName }}
                  </div>
                </div>
                <div class="business-dept-item">
                  <div
                    class="roleItem"
                    v-for="(item, sIndex) in searchStoreJson[typeItem][pKey]"
                    :key="`${index}-${pIndex}-${sIndex}`"
                  >
                    <Checkbox :label="item.saleAccountId" :title="item.account" :disabled="isStoreSuperAdmin">
                      <span >{{ item.accountCode }}</span>
                    </Checkbox>
                  </div>
                </div>
              </div>
            </Checkbox-group>
          </div>
        </template>
        <div v-if="searchStoreList.length === 0" style="padding: 15px; color: #999;">暂无数据！</div>
      </div >
      <!--店铺权限-客服管理系统-->
      <div class="modalItem" id="customer_search" v-if="employeeAdmin !== '1'" >
        <div class="modalItemHeader" >
          <div class="block-title">
            <div>店铺权限-客服管理系统</div>
            <div
              class="custom-checkbox"
              :class="{
                'checkbox-disabled': isStoreSuperAdmin,
                'checkbox-indeterminate': groupCheck.customerIndeterRight,
                'checkbox-checked': groupCheck.customerRight
              }"
              @click="customerCheckAll('search')"
            >
              <span class="custom-check-frame" />全选
            </div>
          </div>
        </div>
        <div v-for="(typeItem, index) in platformTypeList" class="modalItemContent" :key="index">
          <div class="roleData clear" v-if="searchStoreList.filter(f => f.platformId === typeItem).length > 0">
            <div class="clear platform-box" >
              <div class="shopTable">
                <div class="platformItem" v-if="userPlatformType.includes(typeItem)">
                  <span :class="typeItem"></span >
                </div>
                <div v-else style="font-size: initial;">{{ typeItem }}</div>
              </div>
              <div
                class="custom-checkbox"
                :class="{
                  'checkbox-disabled': isStoreSuperAdmin,
                  'checkbox-indeterminate': rightPaltChoose.cs && rightPaltChoose.cs[typeItem] && rightPaltChoose.cs[typeItem].indeter,
                  'checkbox-checked': rightPaltChoose.cs && rightPaltChoose.cs[typeItem] && rightPaltChoose.cs[typeItem].check,
                }"
                @click="csAllCheckChange(index,typeItem)"
              >
                <span class="custom-check-frame" />全选
              </div>
            </div>
            <Checkbox-group :disabled="isStoreSuperAdmin" v-model="searchCsAllCheck[index]" @on-change="searchCsChange(index,typeItem)">
              <div
                v-for="(pKey, pIndex) in Object.keys(searchStoreJson[typeItem] || {})"
                :key="`pat-${pIndex}`"
              >
                <div
                  class="business-dept-checkbox"
                  v-if="searchStoreJson[typeItem][pKey] && searchStoreJson[typeItem][pKey].length != 0"
                >
                  <div
                    class="custom-checkbox"
                    :class="{
                      'checkbox-disabled': isStoreSuperAdmin,
                      'checkbox-indeterminate': rightChoose.cs && rightChoose.cs[typeItem] && rightChoose.cs[typeItem][pKey] && rightChoose.cs[typeItem][pKey].indeter,
                      'checkbox-checked': rightChoose.cs && rightChoose.cs[typeItem] && rightChoose.cs[typeItem][pKey] && rightChoose.cs[typeItem][pKey].check
                    }"
                    @click="orderBusinessDeptChoose('cs-right', typeItem, pKey, index)"
                  >
                    <span class="custom-check-frame" />{{ businessDeptJson[pKey].businessDeptName }}
                  </div>
                </div>
                <div class="business-dept-item">
                  <div
                    class="roleItem"
                    v-for="(item, sIndex) in searchStoreJson[typeItem][pKey]"
                    :key="`${index}-${pIndex}-${sIndex}`"
                  >
                    <Checkbox :label="item.saleAccountId" :title="item.account" :disabled="isStoreSuperAdmin">
                      <span >{{ item.accountCode }}</span>
                    </Checkbox>
                  </div>
                </div>
              </div>
            </Checkbox-group>
          </div>
        </div>
        <div v-if="searchStoreList.length === 0" style="padding: 15px; color: #999;">暂无数据！</div>
      </div>
    </div>
    <!--锚点-->
    <div class="anchor_point" v-if="anchorTalg">
      <li ref="anchor" :class="anchorIndex === 1 ? 'anchor_active' : ''" @click="anchorSelect('#basic_information', 1)">基本资料</li>
      <li ref="anchor" :class="anchorIndex === 2 ? 'anchor_active' : ''" v-if="employeeAdmin !== '1'" @click="anchorSelect('#role_information', 2)">角色</li>
      <li ref="anchor" :class="anchorIndex === 3 ? 'anchor_active' : ''" v-if="employeeAdmin !== '1'" @click="anchorSelect('#order_information', 3)">店铺权限-订单管理系统</li>
      <li ref="anchor" :class="anchorIndex === 4 ? 'anchor_active' : ''" v-if="employeeAdmin !== '1'" @click="anchorSelect('#customer_information', 4)">店铺权限-客服管理系统</li>
      <li ref="anchor" :class="anchorIndex === 5 ? 'anchor_active' : ''" v-if="employeeAdmin !== '1'" @click="anchorSelect('#warehouse_information', 5)">仓库权限</li>
    </div>
    <Spin size="large" fix v-if="spinShow" ></Spin >
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import Checkbox from '@/components/localComponents/d-Table/relation/checkbox/checkbox';

export default {
  components: { Checkbox },
  mixins: [Mixin],
  data () {
    // let v = this;
    return {
      anchorIndex: 1,
      spinShow: false,
      groupCheck: {
        orderLeft: false,
        orderIndeterLeft: false,
        customerLeft: false,
        customerIndeterLeft: false,
        warehouseLeft: false,
        warehouseIndeterLeft: false,
        orderRight: false,
        orderIndeterRight: false,
        customerRight: false,
        customerIndeterRight: false
      },
      searchStoreList: [],
      pageFormParams: {
        searchValue: []
      },
      warehousePermissions: [],
      warehouseListMap: [],
      warehouseListPerMap: [],
      businessRoleTypeList: [
        {
          roleId: 'seller',
          title: '销售员' // 销售员
        },
        {
          roleId: 'commodityDeveloper',
          title: '产品开发员' // 商品开发员
        },
        {
          roleId: 'productDeveloperSupervisor',
          title: '产品开发主管' // 商品开发主管
        }
        // {
        //   roleId: 'cargoOwner',
        //   title: '货主' // 货主
        // }
      ],
      newEmployeeParams: {
        roleIdList: [],
        saleAccountIdList: [],
        warehouseIdList: [],
        // password: '',
        userName: '',
        email: '',
        mobile: '',
        businessRoleTypeList: []
      },
      ruleCustom: {
        // password: [
        //   {
        //     required: true,
        //     validator: v.validatePass(),
        //     trigger: 'blur'
        //   }
        // ],
        // email: [
        //   {
        //     required: false,
        //     validator: v.validateEmail(),
        //     trigger: 'blur'
        //   }
        // ],
        // mobile: [
        //   {
        //     required: true,
        //     validator: v.validateMobile(),
        //     trigger: 'blur'
        //   }
        // ],
        userName: [
          {
            required: true,
            validator: this.validateUserName(),
            trigger: 'blur'
          }
        ]
      },
      formValidMobile: {
        mobile: [
          {
            required: false,
            validator: this.validateMobile(),
            trigger: 'blur'
          }
        ]
      },
      passwordFocus: false,
      role: [],
      platformTypeList: [],
      userPlatformType: [],
      platformCsTypeList: ['ebay'],
      saleAccountList: [],
      shopPermissionList: [],
      roleStatus: [true, true, false],
      indeterminate: [],
      indeterminateSale: [],
      checkAll: [],
      checkSaleAll: [],
      checkAllGroup: [],
      oldCheckAllGroup: [],
      searchOrderAllCheck: {},
      searchCsAllCheck: {},
      checkSaleAllGroup: [],
      oldCheckSaleAllGroup: [],
      catchAllGroup: [],
      accountIdGroup: [],
      changeRoleList: [],
      platGroupJson: {},
      businessDeptJson: {},
      platAccountJson: {},
      platAccountIdJson: {},
      isStoreSuperAdmin: false
    };
  },
  props: {
    warehouseList: {
      type: Array,
      default: () => [] // eslint代码规范
    },
    permissionsKeys: {
      type: Array,
      default: () => [] // eslint代码规范
    },
    modalRoleList: {
      type: Array,
      default: null
    },
    uid: {
      type: String,
      default: null
    },
    timestamp2: null,
    employeeAdmin: String,
    anchorTalg: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    addEmployeeStatus () {
      return this.$store.state.addEmployeeStatus;
    },
    // 订单选中值去重
    orderAllCheckRepeat () {
      const allCheck = this.$common.arrRemoveRepeat(this.checkAll);
      const indeterCheck = this.$common.arrRemoveRepeat(this.indeterminate);
      if (this.$common.isEmpty(allCheck)) return [false];
      if (allCheck.length == 2 || (allCheck.length == 1 && !allCheck[0])) return this.$common.arrRemoveRepeat([...allCheck, ...indeterCheck]);
      if (allCheck.length == 1) return [true];
    },
    // 客服选中值去重
    customerAllCheckRepeat () {
      const allCheck = this.$common.arrRemoveRepeat(this.checkSaleAll);
      const indeterCheck = this.$common.arrRemoveRepeat(this.indeterminateSale);
      if (this.$common.isEmpty(allCheck)) return [false];
      if (allCheck.length == 2 || (allCheck.length == 1 && !allCheck[0])) return this.$common.arrRemoveRepeat([...allCheck, ...indeterCheck]);
      if (allCheck.length == 1) return [true];
    },
    // 仓库选中值去重
    warehouseAllCheckRepeat () {
      return this.$common.arrRemoveRepeat(this.warehouseListMap);
    },
    // 右边搜索栏订单选中值去重
    orderSearchCheckRepeat () {
      let checkId = this.$common.flat(Object.values(this.searchOrderAllCheck));
      let checkAllId = this.searchStoreList.map(m => m.saleAccountId);
      let indeter = false;
      let isCheck = !this.$common.isEmpty(checkId);
      if (isCheck && !this.$common.isEmpty(checkAllId)) {
        indeter = checkId.length != checkAllId.length;
      }
      return { check: isCheck, indeter: indeter };
    },
    // 右边搜索栏客服选中值去重
    customerSearchCheckRepeat () {
      let checkId = this.$common.flat(Object.values(this.searchCsAllCheck));
      let checkAllId = this.searchStoreList.map(m => m.saleAccountId);
      let indeter = false;
      let isCheck = !this.$common.isEmpty(checkId);
      if (isCheck && !this.$common.isEmpty(checkAllId)) {
        indeter = checkId.length != checkAllId.length;
      }
      return { check: isCheck, indeter: indeter };
    },
    // 左边是否选中事业部
    chooseGroupDept () {
      let chooseDept = {};
      Object.keys(this.platGroupJson || {}).forEach(plat => {
        chooseDept[plat] = {};
        Object.keys(this.platGroupJson[plat] || {}).forEach(type => {
          chooseDept[plat][type] = {};
          Object.keys(this.platGroupJson[plat][type] || {}).forEach(dept => {
            if (!this.$common.isEmpty(this.platGroupJson[plat][type][dept])) {
              chooseDept[plat][type][dept] = {
                check: !this.$common.isEmpty(this.platGroupJson[plat][type][dept]),
                indeter: true
              };
              if (!this.$common.isEmpty(this.platAccountIdJson[plat]) && !this.$common.isEmpty(this.platAccountIdJson[plat][dept])) {
                chooseDept[plat][type][dept].indeter = this.platGroupJson[plat][type][dept].length != this.platAccountIdJson[plat][dept].length;
              }
            } else {
              chooseDept[plat][type][dept] = { check: false, indeter: false };
            }
          });
        });
      });
      return chooseDept;
    },
    // 搜索栏数据
    searchStoreJson () {
      let obj = {};
      let paltData = [];
      let deptKey = '';
      this.platformTypeList.forEach(palt => {
        paltData = this.searchStoreList.filter(f => f.platformId == palt);
        if (!this.$common.isEmpty(paltData)) {
          obj[palt] = {};
          paltData.forEach(item => {
            deptKey = this.$common.isEmpty(item.businessDeptId) ? 'notBind' : item.businessDeptId;
            if (this.$common.isUndefined(obj[palt][deptKey])) {
              obj[palt][deptKey] = [item];
            } else {
              obj[palt][deptKey].push(item);
            }
          });
        }
      });
      return obj;
    },
    // 右侧选中
    rightChoose () {
      let obj = {
        order: {},
        cs: {},
      };
      let orderVal = {};
      let csVal = {};
      this.platformTypeList.forEach((palt, index) => {
        orderVal[palt] = this.searchOrderAllCheck[index];
        csVal[palt] = this.searchCsAllCheck[index];
        obj.order[palt] = {};
        obj.cs[palt] = {};
      });

      let deptVal = [];
      let orderCheck = false;
      let csCheck = false;
      Object.keys(this.searchStoreJson).forEach(falt => {
        if (!this.$common.isEmpty(this.searchStoreJson[falt])) {
          Object.keys(this.searchStoreJson[falt]).forEach(dept => {
            deptVal = this.searchStoreJson[falt][dept].map(m => m.saleAccountId);
            orderCheck = !!deptVal.find(m => orderVal[falt].includes(m));
            csCheck = !!deptVal.find(m => csVal[falt].includes(m));
            obj.order[falt][dept] = {
              check: orderCheck,
              indeter: orderCheck && !!deptVal.find(m => !orderVal[falt].includes(m))
            }
            obj.cs[falt][dept] = {
              check: csCheck,
              indeter: csCheck && !!deptVal.find(m => !csVal[falt].includes(m))
            }
          });
        }
      });
      return obj;
    },
    // 右侧事业部选中
    rightPaltChoose () {
      let obj = {
        order: {},
        cs: {},
      };
      let valObj = {
        order: {},
        cs: {},
      }
      this.platformTypeList.forEach((palt, index) => {
        obj.order[palt] = {
          check: !this.$common.isEmpty(this.searchOrderAllCheck[index]),
          indeter: false
        };
        obj.cs[palt] = {
          check: !this.$common.isEmpty(this.searchCsAllCheck[index]),
          indeter: false
        };
        valObj.order[palt] = [];
        valObj.cs[palt] = [];
        if (!this.$common.isEmpty(this.searchStoreList)) {
          this.searchStoreList.forEach(item => {
            if (item.platformId == palt) {
              valObj.order[palt].push(item.saleAccountId);
              valObj.cs[palt].push(item.saleAccountId);
            }
          });
          if (!this.$common.isEmpty(this.searchOrderAllCheck[index]) && !this.$common.isEmpty(valObj.order[palt])) {
            obj.order[palt].indeter = valObj.order[palt].length != this.searchOrderAllCheck[index].length;
          }
          if (!this.$common.isEmpty(this.searchCsAllCheck[index]) && !this.$common.isEmpty(valObj.cs[palt])) {
            obj.cs[palt].indeter = valObj.cs[palt].length != this.searchCsAllCheck[index].length;
          }
        }
      });
      return obj;
    },
  },
  watch: {
    addEmployeeStatus (n) {
      if (n && this.uid === null) {
        this.addNewEmployee();
      } else if (n && this.uid !== null) {
        this.editEmployee();
      }
    },
    timestamp2 (n, o) {
      let v = this;
      v.resetForm();
      if (n !== o && o !== null && v.uid !== null) {
        v.getUserMes();
      }
    },
    anchorTalg: {
      handler (data) {
        // !data && this.permissionsHand([], true)
        this.anchorIndex = 1;
        if (!data) {
          this.searchStoreList = [];
          this.searchOrderAllCheck = {};
          this.searchCsAllCheck = {};
          this.pageFormParams.searchValue = [];
        }
      },
      deep: true
    },
    'newEmployeeParams.roleIdList': {
      deep: true,
      handler (val) {
        this.permissionsHand(val, false);
      }
    },
    // 订单选中值改变时
    orderAllCheckRepeat: {
      deep: true,
      handler (val) {
        const isCheck = val.length == 1 && val[0];
        this.groupCheck.orderLeft = isCheck;
        this.groupCheck.orderIndeterLeft = isCheck ? false : val.length == 2;
      }
    },
    // 客服选中值改变时
    customerAllCheckRepeat: {
      deep: true,
      handler (val) {
        const isCheck = val.length == 1 && val[0];
        this.groupCheck.customerLeft = isCheck;
        this.groupCheck.customerIndeterLeft = isCheck ? false : val.length == 2;
      }
    },
    // 仓库选中值改变时
    warehouseAllCheckRepeat: {
      deep: true,
      handler (val) {
        const isCheck = val.length == 1 && val[0];
        this.groupCheck.warehouseLeft = isCheck;
        this.groupCheck.warehouseIndeterLeft = isCheck ? false : val.length == 2;
      }
    },
    // 订单右边选中值改变时
    orderSearchCheckRepeat: {
      deep: true,
      handler (val) {
        this.groupCheck.orderRight = val.check;
        this.groupCheck.orderIndeterRight = val.indeter;
      }
    },
    // 客服右边选中值改变时
    customerSearchCheckRepeat: {
      deep: true,
      handler (val) {
        this.groupCheck.customerRight = val.check;
        this.groupCheck.customerIndeterRight = val.indeter;
      }
    },
  },
  created () {
    if (this.permissionsKeys) {
      this.warehouseListPerMap = this.warehouseList.map(() => {
        return this.permissionsKeys.map(() => false);
      });
    }
    this.warehouseListMap = this.warehouseList.map(() => false);

    this.changeRoleList = this.modalRoleList.slice(1, this.modalRoleList.length);
    // this.getSaleAccounts();
    if (this.uid === null) {
      this.getShopListTwo();
      this.getStrongPassword();
    } else {
      this.getUserMes();
    }
  },
  methods: {
    targetEnv () {
      const envConfig = {
        testHost: ['testing.lapa.com.cn'],
        devHost: ['172.20.200.30'],
        // eslint-disable-next-line no-undef
        env: process.env.NODE_ENV
      }
      const location = window.location;

      if (envConfig.env === 'development' || envConfig.devHost.includes(location.host)) {
        return 'dev'
      } else if (envConfig.testHost.includes(location.host) || location.port) {
        return 'test'
      }
      return 'prop'
    },
    permissionsHand (val, type) {
      this.$nextTick(() => {
        const env = this.targetEnv();
        const superAdminId = {
          dev: '666352597245887275',
          // dev: '666016163456750008',
          test: '666016163456750008',
          prop: '666016163456750008'
        };
        if (val.includes(superAdminId[env]) && !type) {
          this.isStoreSuperAdmin = true;
          this.oldCheckAllGroup = this.$common.copy(this.checkAllGroup);
          this.oldCheckSaleAllGroup = this.$common.copy(this.checkSaleAllGroup);
          let obj = {};
          this.platformTypeList.forEach((n, i) => {
            this.shopPermissionList.forEach(a => {
              if (n === a.platformId) {
                if (this.checkSaleAllGroup[i] && !this.checkSaleAllGroup[i].includes(a.saleAccountId)) {
                  this.checkSaleAllGroup[i].push(a.saleAccountId);
                  this.$nextTick(() => {
                    this.checkSaleAllGroupChange(i, n, true);
                  });
                }
                if (this.$common.isEmpty(obj[n])) {
                  obj[n] = [a.saleAccountId];
                } else if (!obj[n].includes(a.saleAccountId)) {
                  obj[n].push(a.saleAccountId);
                }
                if (this.checkAllGroup[i] && !this.checkAllGroup[i].includes(a.saleAccountId)) {
                  this.checkAllGroup[i].push(a.saleAccountId);
                  this.$nextTick(() => {
                    this.chooseAllGroupChange(i, n, true);
                  });
                }
              }
            })
          });
        } else if (!val.includes(superAdminId[env]) && type) {
          this.isStoreSuperAdmin = false;
          this.checkAllGroup = this.$common.copy(this.oldCheckAllGroup);
          this.checkSaleAllGroup = this.$common.copy(this.oldCheckSaleAllGroup);
          this.$nextTick(() => {
            this.platformTypeList.forEach((n, i) => {
              this.checkSaleAllGroup[i] && this.checkSaleAllGroup[i].forEach(() => {
                this.checkSaleAllGroupChange(i, n, true);
              });
              this.checkAllGroup[i] && this.checkAllGroup[i].forEach(() => {
                this.chooseAllGroupChange(i, n, true);
              });
              if (this.$common.isEmpty(this.checkSaleAllGroup[i])) {
                this.checkSaleAll.splice(i, 1, false);
              }
              if (this.$common.isEmpty(this.checkAllGroup[i])) {
                this.checkAll.splice(i, 1, false);
              }
            })
          });
        }
      })
    },
    warehouseChange (data) {
      /**
       * 仓库change
       * @param data.value  true false
       * @param data.warehouse 仓库
       * @param data.index 索引
       * */
      if (data.value) {
        // 选中
        if (this.warehousePermissions.length > 0) {
          let arr = this.warehousePermissions.map(i => i.warehouseId);
          if (!arr.includes(data.warehouseId)) {
            this.warehousePermissions.push({
              warehouseId: data.warehouseId,
              permissions: []
            });
          }
        } else {
          this.warehousePermissions.push({
            warehouseId: data.warehouseId,
            permissions: []
          });
        }
      } else {
        // 去除选中
        if (this.warehousePermissions.length > 0) {
          let arr = this.warehousePermissions.map(i => i.warehouseId);
          if (arr.includes(data.warehouseId)) {
            this.warehousePermissions.forEach((i, ind) => {
              if (i.warehouseId === data.warehouseId) {
                this.warehousePermissions.splice(ind, 1);
              }
            });
          }
          this.permissionsKeys.forEach((m, pIndex) => {
            this.warehouseListPerMap[data.index][pIndex] = false;
          });
        }
      }
    },
    warehousePerChange (data) {
      /**
       * 仓库下面的权限
       * @param data.value  true false
       * @param data.warehouse 仓库
       * @param data.index 索引
       * */
      if (data.value) {
        // 选中
        this.warehousePermissions.forEach(i => {
          if (i.warehouseId === data.warehouseId) {
            if (!i.permissions) {
              i.permissions = [];
            }
            i.permissions.push(data.permission);
          }
        });
      } else {
        // 去除选中  后面添加新的 记得修改
        this.warehousePermissions.forEach(i => {
          if (i.warehouseId === data.warehouseId) {
            i.permissions = [];
          }
        });
      }
    },
    getSaleAccounts () {
      this.axios.post(api.get_querySaleAccounts, {
        'platformIds': [
          'ebay'
        ],
        'subsystemCode': 'cs-service'
      }).then(response => {
        if (response.data.code === 0) {
          this.saleAccountList = response.data.datas;
        }
      });
    },
    // 仓库checkbox 展示
    setWarehouseView () {
      // let keys = this.permissionsKeys.map(i => i.permission);
      let warehouseInfo = {};
      let checkWarehouse = [];
      (this.warehousePermissions || []).forEach(item => {
        warehouseInfo[item.warehouseId] = item;
      });
      this.warehouseList.forEach((i, index) => {
        if (!this.$common.isEmpty(warehouseInfo[i.warehouseId])) {
          checkWarehouse.push(true);
          this.permissionsKeys.forEach((k, l) => {
            if (k.permission && warehouseInfo[i.warehouseId].permissions) {
              if (warehouseInfo[i.warehouseId].permissions.length > 0) {
                if (warehouseInfo[i.warehouseId].permissions[0].permission === k.permission) {
                  this.warehouseListPerMap[index][l] = true;
                }
              }
            }
          });
        } else {
          checkWarehouse.push(false);
        }
      });
      this.warehouseListMap = checkWarehouse;
    },
    getUserMes () {
      this.isStoreSuperAdmin = false;
      this.spinShow = true;
      this.getShopListTwo().then((resData) => {
        this.axios.post(api.get_userDetail + this.uid).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data.userAccounts) {
              const allSaleAccountId = this.shopPermissionList.map(m => m.saleAccountId);
              data.userAccounts = data.userAccounts.filter(f => allSaleAccountId.includes(f.saleAccountId));
              let sdata = {};
              let orderServicePlat = {};
              let csServicePlat = {};
              (resData || []).forEach(m => {
                sdata[m.saleAccountId] = m;
              });
              let deptKey = '';
              data.userAccounts.forEach(j => {
                if (!this.$common.isEmpty(sdata[j.saleAccountId]) && !this.$common.isEmpty(sdata[j.saleAccountId].platformId)) {
                  deptKey = this.$common.isEmpty(sdata[j.saleAccountId].businessDeptId) ? 'notBind' : sdata[j.saleAccountId].businessDeptId;
                  if (j.subsystemCode === 'order-service') {
                    if (this.$common.isUndefined(orderServicePlat[sdata[j.saleAccountId].platformId])) {
                      orderServicePlat[sdata[j.saleAccountId].platformId] = [j];
                    } else {
                      orderServicePlat[sdata[j.saleAccountId].platformId].push(j);
                    }
                    // 事业部分组
                    if (this.$common.isUndefined(this.platGroupJson[sdata[j.saleAccountId].platformId].orderVal[deptKey])) {
                      this.$set(this.platGroupJson[sdata[j.saleAccountId].platformId].orderVal, deptKey, [j.saleAccountId]);
                    } else if (!this.platGroupJson[sdata[j.saleAccountId].platformId].orderVal[deptKey].includes(j.saleAccountId)) {
                      this.platGroupJson[sdata[j.saleAccountId].platformId].orderVal[deptKey].push(j.saleAccountId);
                    }
                  }
                  if (j.subsystemCode === 'cs-service') {
                    if (this.$common.isUndefined(csServicePlat[sdata[j.saleAccountId].platformId])) {
                      csServicePlat[sdata[j.saleAccountId].platformId] = [j];
                    } else {
                      csServicePlat[sdata[j.saleAccountId].platformId].push(j);
                    }
                    // 事业部分组
                    if (this.$common.isUndefined(this.platGroupJson[sdata[j.saleAccountId].platformId].csVal[deptKey])) {
                      this.$set(this.platGroupJson[sdata[j.saleAccountId].platformId].csVal, deptKey, [j.saleAccountId]);
                    } else if (!this.platGroupJson[sdata[j.saleAccountId].platformId].csVal[deptKey].includes(j.saleAccountId)) {
                      this.platGroupJson[sdata[j.saleAccountId].platformId].csVal[deptKey].push(j.saleAccountId);
                    }
                  }
                }
              });
              // 平台分组
              this.platformTypeList.forEach((n, i) => {
                // 订单权限平台店铺分组
                if (!this.$common.isEmpty(orderServicePlat[n])) {
                  this.checkAllGroup[i] = this.$common.arrRemoveRepeat(orderServicePlat[n].map(m => m.saleAccountId));
                  this.$nextTick(() => {
                    this.chooseAllGroupChange(i, n, true);
                  });
                }
                // 客服权限平台店铺分组
                if (!this.$common.isEmpty(csServicePlat[n])) {
                  this.checkSaleAllGroup[i] = this.$common.arrRemoveRepeat(csServicePlat[n].map(m => m.saleAccountId));
                  this.$nextTick(() => {
                    this.checkSaleAllGroupChange(i, n, true);
                  });
                }
              });
              this.oldCheckSaleAllGroup = this.$common.copy(this.checkSaleAllGroup);
              this.oldCheckAllGroup = this.$common.copy(this.checkAllGroup);

              this.newEmployeeParams.roleIdList = data.roleIdList;
              this.newEmployeeParams.businessRoleTypeList = data.businessRoleTypeList;
              this.newEmployeeParams.warehouseIdList = data.warehouseIdList ? data.warehouseIdList : [];
            } else {
              this.newEmployeeParams.roleIdList = data.roleIdList;
              this.newEmployeeParams.businessRoleTypeList = data.businessRoleTypeList;
              this.newEmployeeParams.warehouseIdList = data.warehouseIdList ? data.warehouseIdList : [];
            }
            this.newEmployeeParams.email = data.email;
            this.newEmployeeParams.mobile = data.mobile || '';
            this.newEmployeeParams.userName = data.userName;
            this.warehousePermissions = data.warehousePermissions;
            this.setWarehouseView();
          }
          this.spinShow = false;
        }).catch(() => {
          this.spinShow = false;
        });
      });
    },
    getStrongPassword () { // 强密码生成
      const length = 16;
      let chars;
      if (!chars) chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789*&%$#@!';
      let randomChars = '';
      for (let x = 0; x < length; x++) {
        let i = Math.floor(Math.random() * chars.length);
        randomChars += chars.charAt(i);
      }
      this.newEmployeeParams.password = randomChars;
    },
    // 获取平台信息、店铺信息
    getShopListTwo () {
      return new Promise((resolve, reject) => {
        this.getPlatformGroup('1', '/setting-service/erpCommon').then(result => {
          if (result) {
            let arr = this.$store.state.platformGroup;
            let newArr = [];
            arr.forEach((n, i) => {
              newArr.push(n.platformId);
            });
            this.axios.post(api.get_shopList + '?checkUser=false&time=' + new Date().getTime(), JSON.stringify(newArr)).then(response => {
              let resData = [];
              if (response && response.data && response.data.code == 0) {
                resData = this.$common.copy(response.data.datas || []);
              }
              this.makePermisssionList(resData).finally(() => {
                resolve(resData);
              });
            });
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        });
      });
    },
    // 解构权限数据
    makePermisssionList (list) {
      return new Promise((resolve) => {
        let pos = [];// 平台类别数组
        let groupPos = {};// 平台权限组合
        this.platAccountJson = {};
        this.platAccountIdJson = {};
        this.platGroupJson = {};
        let deptKey = '';
        list.forEach(n => {
          if (!this.$common.isEmpty(n.platformId)) {
            deptKey = this.$common.isEmpty(n.businessDeptId) ? 'notBind' : n.businessDeptId;
            if (this.$common.isUndefined(this.businessDeptJson[deptKey])) {
              this.$set(this.businessDeptJson, deptKey, {
                businessDeptId: deptKey,
                businessDeptName: deptKey == 'notBind' ? '未绑定事业部' : n.businessDeptName || deptKey
              });
            }
            if (this.$common.isUndefined(this.platAccountJson[n.platformId])) {
              this.$set(this.platAccountJson, n.platformId, {});
              this.$set(this.platAccountIdJson, n.platformId, {});
            }
            if (this.$common.isUndefined(this.platAccountJson[n.platformId][deptKey])) {
              this.$set(this.platAccountJson[n.platformId], deptKey, [n]);
              this.$set(this.platAccountIdJson[n.platformId], deptKey, [n.saleAccountId]);
            } else {
              this.platAccountJson[n.platformId][deptKey].push(n);
              this.platAccountIdJson[n.platformId][deptKey].push(n.saleAccountId);
            }
            if (this.$common.isUndefined(this.platGroupJson[n.platformId])) {
              this.$set(this.platGroupJson, n.platformId, {});
              this.$set(this.platGroupJson[n.platformId], 'orderVal', {});
              this.$set(this.platGroupJson[n.platformId], 'csVal', {});
            }
            if (this.$common.isUndefined(this.platGroupJson[n.platformId].orderVal[deptKey])) {
              this.$set(this.platGroupJson[n.platformId].orderVal, deptKey, []);
              this.$set(this.platGroupJson[n.platformId].csVal, deptKey, []);
            }
            if (pos.indexOf(n.platformId) < 0 && n.platformId !== null) {
              pos.push(n.platformId);
              groupPos[n.platformId] = [n.saleAccountId];
            } else if (pos.indexOf(n.platformId) >= 0) {
              groupPos[n.platformId].push(n.saleAccountId);
            }
          }
        });
        this.userPlatformType = this.$common.arrRemoveRepeat(list.filter(i => i.platformType === 0).map(i => i.platformId));
        this.platformTypeList = pos;
        this.shopPermissionList = list;
        this.$nextTick(() => {
          this.getGroup(groupPos);
          this.$nextTick(() => {
            resolve({ state: 'finally' });
          })
        });
      })
    },
    // 分组处理
    getGroup (groupPos) {
      this.indeterminate = [];
      this.indeterminateSale = [];
      this.checkAll = [];
      this.checkSaleAll = [];
      this.checkAllGroup = [];
      this.checkSaleAllGroup = [];
      this.oldCheckAllGroup = [];
      this.oldCheckSaleAllGroup = [];

      this.platformTypeList.forEach((n, i) => {
        if (this.$common.isEmpty(this.indeterminate[i])) {
          this.indeterminate.push(false);
        } else {
          this.indeterminate[i] = false;
        }
        if (this.$common.isEmpty(this.indeterminateSale[i])) {
          this.indeterminateSale.push(false);
        } else {
          this.indeterminateSale[i] = false;
        }
        if (this.$common.isEmpty(this.checkAll[i])) {
          this.checkAll.push(false);
        } else {
          this.checkAll[i] = false;
        }
        if (this.$common.isEmpty(this.checkSaleAll[i])) {
          this.checkSaleAll.push(false);
        } else {
          this.checkSaleAll[i] = false;
        }
        if (this.$common.isUndefined(this.checkAllGroup[i])) {
          this.checkAllGroup.push([]);
        } else {
          this.checkAllGroup[i] = [];
        }
        if (this.$common.isUndefined(this.checkSaleAllGroup[i])) {
          this.checkSaleAllGroup.push([]);
        } else {
          this.checkSaleAllGroup[i] = [];
        }
        this.$set(this.searchOrderAllCheck, i, []);
        this.$set(this.searchCsAllCheck, i, []);
        if (this.$common.isUndefined(this.catchAllGroup[i])) {
          this.catchAllGroup.push(groupPos[n]);
        } else {
          this.catchAllGroup[i] = groupPos[n];
        }
      });
    },
    resetForm () {
      this.$refs['newEmployeeParams'].resetFields();
      this.newEmployeeParams.roleIdList = [];
      // v.newEmployeeParams.password = '';
      this.warehousePermissions = [];
      this.newEmployeeParams.businessRoleTypeList = [];
      this.checkAllGroup.forEach((n, i) => {
        this.checkAllGroup.splice(i, 1, []);
        this.indeterminate.splice(i, 1, false);
        this.checkAll.splice(i, 1, false);
      });
      this.checkSaleAllGroup.forEach((n, i) => {
        this.checkSaleAllGroup.splice(i, 1, []);
        this.indeterminateSale.splice(i, 1, false);
        this.checkSaleAll.splice(i, 1, false);
      });
      if (this.permissionsKeys) {
        this.warehouseList.forEach((wItem, wIndex) => {
          if (this.$common.isUndefined(this.warehouseListPerMap[wIndex])) {
            this.warehouseListPerMap.push([]);
          }
          this.permissionsKeys.forEach((m, pIndex) => {
            this.warehouseListPerMap[wIndex][pIndex] = false;
          });
        })
      }
      this.warehouseListMap = this.warehouseList.map(() => false);
    },
    addNewEmployee () { // 保存员工数据
      this.$common.promiseAll([this.handleSubmit('newEmployeeParams'), this.integrateSaleAccountId()]).then(result => {
        if (result[0]) {
          this.axios.post(api.add_user, this.getSaveData()).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('新增成功');
              this.$emit('saveSuccess');
              this.$parent.$parent.modal9 = false;
              this.resetForm();
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && this.$Message.error('保存失败，请重新尝试');
            }
            this.$emit('resetLoading');
            this.$store.commit('addEmployeeStatus', false);
          }).catch(() => {
            this.$Message.error('保存失败，请重新尝试');
            this.$emit('resetLoading');
            this.$store.commit('addEmployeeStatus', false);
          });
        } else {
          this.$Message.error('表单验证失败!');
          this.anchorSelect('#basic_information', 1);
          this.$emit('resetLoading');
          this.$store.commit('addEmployeeStatus', false);
        }
      });
    },
    // 返回保存员工信息
    getSaveData () {
      const removeKey = ['mobile'];
      let obj = this.$common.copy(this.newEmployeeParams);
      obj.warehousePermissions = this.warehousePermissions;
      obj.userId = this.uid;
      if (this.$common.isEmpty(obj.password)) delete obj.password;
      removeKey.forEach(key => {
        if (!this.$common.isUndefined(obj[key])) {
          delete obj[key]
        }
      })
      return obj;
    },
    editEmployee () { // 保存员工数据
      this.$common.promiseAll([() => this.handleSubmit('newEmployeeParams'), () => this.integrateSaleAccountId()]).then(result => {
        if (result[0]) {
          this.axios.put(api.add_user, this.getSaveData()).then(response => {
            if (response.data.success) {
              this.$Message.success('保存成功');
              this.$parent.$parent.modal9 = false;
              this.$parent.$parent.pageParamsStatus = true;
              this.resetForm();
            }
            this.$emit('resetLoading');
            this.$store.commit('addEmployeeStatus', false);
          }).catch(() => {
            this.$Message.error('表单验证失败!');
            this.anchorSelect('#basic_information', 1);
            this.$emit('resetLoading');
            this.$store.commit('addEmployeeStatus', false);
          });
        } else {
          this.$Message.error('表单验证失败!');
          this.anchorSelect('#basic_information', 1);
          this.$emit('resetLoading');
          this.$store.commit('addEmployeeStatus', false);
        }
      });
    },
    // 点击事业部选择(取消)店铺
    orderBusinessDeptChoose (type, plat, dept, index) {
      if (this.isStoreSuperAdmin) return;
      if (type == 'order-left') {
        let chooseVal = [];
        const deptVal = this.platAccountJson[plat][dept].map(m => {
          return m.saleAccountId;
        });
        if (this.$common.isEmpty(this.platGroupJson[plat].orderVal[dept])) {
          chooseVal = deptVal;
          this.checkAllGroup[index] = this.$common.arrRemoveRepeat([...this.checkAllGroup[index], ...deptVal]);
        } else {
          this.checkAllGroup[index] = this.checkAllGroup[index].filter(item => {
            return !deptVal.includes(item);
          });
        }
        this.$set(this.platGroupJson[plat].orderVal, dept, chooseVal);
        this.$nextTick(() => {
          this.chooseAllGroupChange(index, plat, true);
        });
        return;
      }
      if (type == 'order-right') {
        let chooseVal = [];
        const deptVal = this.searchStoreJson[plat][dept].map(m => {
          return m.saleAccountId;
        });
        if (this.rightChoose.order[plat][dept].check) {
          // 非全选当前事业部店铺
          chooseVal = this.rightChoose.order[plat][dept].indeter ? deptVal : [];
        } else {
          chooseVal = deptVal;
        }
        if (this.$common.isEmpty(chooseVal)) {
          // 移除对应事业部的店铺值
          this.searchOrderAllCheck[index] = this.searchOrderAllCheck[index].filter(val => !deptVal.includes(val));
        } else {
          this.searchOrderAllCheck[index] = this.$common.arrRemoveRepeat([...this.searchOrderAllCheck[index], ...chooseVal]);
        }
        this.$nextTick(() => {
          this.searchOrderChange(index, plat);
        });
        return;
      }
      if (type == 'cs-left') {
        let chooseVal = [];
        const deptVal = this.platAccountJson[plat][dept].map(m => {
          return m.saleAccountId;
        });
        if (this.$common.isEmpty(this.platGroupJson[plat].csVal[dept])) {
          chooseVal = deptVal;
          this.checkSaleAllGroup[index] = this.$common.arrRemoveRepeat([...this.checkSaleAllGroup[index], ...deptVal]);
        } else {
          this.checkSaleAllGroup[index] = this.checkSaleAllGroup[index].filter(item => {
            return !deptVal.includes(item);
          });
        }
        this.$set(this.platGroupJson[plat].csVal, dept, chooseVal);
        this.$nextTick(() => {
          this.checkSaleAllGroupChange(index, plat, true);
        });
        return;
      }
      if (type == 'cs-right') {
        let chooseVal = [];
        const deptVal = this.searchStoreJson[plat][dept].map(m => {
          return m.saleAccountId;
        });
        if (this.rightChoose.cs[plat][dept].check) {
          // 非全选当前事业部店铺
          chooseVal = this.rightChoose.cs[plat][dept].indeter ? deptVal : [];
        } else {
          chooseVal = deptVal;
        }
        if (this.$common.isEmpty(chooseVal)) {
          // 移除对应事业部的店铺值
          this.searchCsAllCheck[index] = this.searchCsAllCheck[index].filter(val => !deptVal.includes(val));
        } else {
          this.searchCsAllCheck[index] = this.$common.arrRemoveRepeat([...this.searchCsAllCheck[index], ...chooseVal]);
        }
        this.$nextTick(() => {
          this.searchCsChange(index, plat);
        });
      }
    },
    handleSubmit (name) {
      return new Promise((resolve) => {
        this.$refs[name].validate(function (valid) {
          if (valid) return resolve(true);
          resolve(false);
          this.$nextTick(function () {
            this.$parent.loadingStatus = false;
          });
        });
      })
    },
    authEmail (value) {
      let v = this;
      return Promise.resolve(v.axios.get(api.check_email + '?email=' + value).then(response => {
        if (response.data.datas.data === 0) {
          return true;
        } else {
          return false;
        }
      }).catch(() => {
        v.$Message.error('邮箱验证失败，请重新尝试');
        return false;
      }));
    },
    integrateSaleAccountId () {
      return new Promise((resolve) => {
        let pos = [];
        let obj = {};
        let obj1 = {};
        this.checkAllGroup.forEach(n => {
          n.forEach(j => {
            if (!obj[j]) {
              pos.push({
                merchantId: this.$store.state.erpConfig.userInfo.merchantId,
                'saleAccountId': j,
                subsystemCode: 'order-service'
              });
            }
          });
        });
        this.checkSaleAllGroup.forEach(n => {
          n.forEach(j => {
            if (!obj1[j]) {
              pos.push({
                merchantId: this.$store.state.erpConfig.userInfo.merchantId,
                'saleAccountId': j,
                subsystemCode: 'cs-service'
              });
            }
          });
        });
        this.newEmployeeParams.userAccounts = pos;
        resolve(pos);
      })
    },
    validatePass () { // 密码校验
      let v = this;
      let validatePass = function (rule, value, callback) {
        if (v.newEmployeeParams.password === '' && v.uid === null) {
          callback(new Error('请输入密码'));
        } else {
          callback();
        }
      };
      return validatePass;
    },
    validateUserName () { // 用户名校验，非空判断
      let v = this;
      let validateUserName = function (rule, value, callback) {
        if (v.newEmployeeParams.userName === '') {
          callback(new Error('请输入姓名'));
        } else {
          callback();
        }
      };
      return validateUserName;
    },
    // 订单店铺权限全选
    orderCheckAll (type) {
      if (this.isStoreSuperAdmin) return;
      if (type == 'default') {
        let isCheck = [];
        let isIndeter = [];
        let allCheckItem = [];
        const checkAll = this.orderAllCheckRepeat;
        const isAll = !(checkAll.length == 1 && checkAll[0]);
        this.checkAll.forEach((item, index) => {
          isCheck.push(isAll);
          isIndeter.push(isAll ? false : checkAll.length == 2);
          allCheckItem.push(isAll ? this.shopPermissionList.filter(i => {
            return i.platformId === this.platformTypeList[index];
          }).map(i => i.saleAccountId) : []);
        });
        this.checkAllGroup = allCheckItem;
        this.checkAll = isCheck;
        this.indeterminate = isIndeter;

        // 事业部选择处理 和 右边搜索栏处理
        this.$nextTick(() => {
          let platData = {};
          // 右边搜索栏处理
          let checkId = [];
          this.platformTypeList.forEach((item, index) => {
            if (isAll) {
              checkId = this.searchStoreList.filter(f => item == f.platformId).map(m => m.saleAccountId);
            }
            platData[item] = this.checkAllGroup[index];
            this.$set(this.searchOrderAllCheck, index, checkId);
          });
          // 事业部选择处理
          let deptVal = [];
          Object.keys(this.platGroupJson || {}).forEach(plat => {
            Object.keys(this.platGroupJson[plat].orderVal || {}).forEach(dept => {
              deptVal = this.platAccountJson[plat][dept].map(m => m.saleAccountId);
              this.platGroupJson[plat].orderVal[dept] = (platData[plat] || []).filter(val => deptVal.includes(val));
            });
          });
        });
        return;
      }
      let platAllCheck = [];
      let allValList = [];
      this.platformTypeList.forEach((typeItem, index) => {
        const allVal = this.searchStoreList.filter(f => f.platformId === typeItem).map(m => m.saleAccountId);
        platAllCheck.push(this.searchOrderAllCheck[index].length === allVal.length);
        allValList.push(allVal);
      });
      platAllCheck = this.$common.arrRemoveRepeat(platAllCheck);
      this.platformTypeList.forEach((typeItem, index) => {
        if (platAllCheck.length == 1 && platAllCheck[0]) {
          // 全选情况
          this.$set(this.searchOrderAllCheck, index, []);
          this.searchOrderChange(index, typeItem);
        } else {
          // 非全选情况
          this.$set(this.searchOrderAllCheck, index, allValList[index]);
          this.searchOrderChange(index, typeItem);
        }
      });
    },
    // 客服店铺权限全选
    customerCheckAll (type) {
      if (this.isStoreSuperAdmin) return;
      if (type == 'default') {
        let isCheck = [];
        let isIndeter = [];
        let allCheckItem = [];
        const checkAll = this.customerAllCheckRepeat;
        const isAll = !(checkAll.length == 1 && checkAll[0]);
        this.checkSaleAll.forEach((item, index) => {
          isCheck.push(isAll);
          isIndeter.push(isAll ? false : checkAll.length == 2);
          allCheckItem.push(isAll ? this.shopPermissionList.filter(i => {
            return i.platformId === this.platformTypeList[index];
          }).map(i => i.saleAccountId) : []);
        });
        this.checkSaleAllGroup = allCheckItem;
        this.checkSaleAll = isCheck;
        this.indeterminateSale = isIndeter;
        // 右边搜索栏处理
        this.$nextTick(() => {
          let platData = {};
          let checkId = [];
          this.platformTypeList.forEach((item, index) => {
            if (isAll) {
              checkId = this.searchStoreList.filter(f => item == f.platformId).map(m => m.saleAccountId);
            }
            platData[item] = this.checkSaleAllGroup[index];
            this.$set(this.searchCsAllCheck, index, checkId);
          });
          // 事业部选择处理
          let deptVal = [];
          Object.keys(this.platGroupJson || {}).forEach(plat => {
            Object.keys(this.platGroupJson[plat].csVal || {}).forEach(dept => {
              deptVal = this.platAccountJson[plat][dept].map(m => m.saleAccountId);
              this.platGroupJson[plat].csVal[dept] = (platData[plat] || []).filter(val => deptVal.includes(val));
            });
          });
        });
        return;
      }
      let platAllCheck = [];
      let allValList = [];
      this.platformTypeList.forEach((typeItem, index) => {
        const allVal = this.searchStoreList.filter(f => f.platformId === typeItem).map(m => m.saleAccountId);
        platAllCheck.push(this.searchCsAllCheck[index].length === allVal.length);
        allValList.push(allVal);
      });
      platAllCheck = this.$common.arrRemoveRepeat(platAllCheck);
      this.platformTypeList.forEach((typeItem, index) => {
        if (platAllCheck.length == 1 && platAllCheck[0]) {
          // 全选情况
          this.$set(this.searchCsAllCheck, index, []);
          this.searchCsChange(index, typeItem);
        } else {
          // 非全选情况
          this.$set(this.searchCsAllCheck, index, allValList[index]);
          this.searchCsChange(index, typeItem);
        }
      });
    },
    // 仓储仓库权限全选
    warehouseCheckAll (type) {
      let isCheck = [];
      if (type == 'default') {
        const checkAll = this.warehouseAllCheckRepeat;
        const isAll = !(checkAll.length == 1 && checkAll[0]);
        let checkData = this.$common.copy(this.warehousePermissions || []);
        const wIdList = checkData.map(i => i.warehouseId);
        this.warehouseList.forEach((item, index) => {
          isCheck.push(isAll);
          if (!isAll) {
            this.permissionsKeys.forEach((m, pIndex) => {
              this.warehouseListPerMap[index][pIndex] = false;
            });
            checkData = [];
          } else {
            if (!wIdList.includes(item.warehouseId)) {
              checkData.push({
                warehouseId: item.warehouseId,
                permissions: []
              });
            }
          }
        });

        this.warehousePermissions = checkData;
        this.warehouseListMap = isCheck;
      }
    },
    // 订单权限-对应平台全选(取消全选)
    handleCheckAll (index, typeItem) {
      if (this.isStoreSuperAdmin) return;
      const checkAllVal = this.$common.copy(this.checkAllGroup);
      checkAllVal[index] = [];
      this.indeterminate.splice(index, 1, false);
      this.$nextTick(() => {
        if (this.checkAll[index]) {
          this.checkAll.splice(index, 1, false);
        } else {
          this.checkAll.splice(index, 1, true);
          checkAllVal[index] = this.shopPermissionList.filter(i => {
            return i.platformId === typeItem;
          }).map(i => i.saleAccountId);
        }
        this.checkAllGroup = checkAllVal;
        // 事业部选择处理
        let deptVal = [];
        if (!this.$common.isEmpty(this.platGroupJson[typeItem])) {
          Object.keys(this.platGroupJson[typeItem].orderVal || {}).forEach(dept => {
            if (!this.$common.isEmpty(this.platAccountJson[typeItem])) {
              deptVal = (this.platAccountJson[typeItem][dept] || []).map(m => m.saleAccountId);
              this.platGroupJson[typeItem].orderVal[dept] = checkAllVal[index].filter(val => deptVal.includes(val));
            }
          });
        }
        this.$nextTick(() => {
          this.orderAllCheckChange(index, typeItem, true);
        })
      })
    },
    // 客服权限-对应平台全选(取消全选)
    handleCheckSaleAccountAll (index, typeItem) {
      if (this.isStoreSuperAdmin) return;
      const checkAllVal = this.$common.copy(this.checkSaleAllGroup);
      checkAllVal[index] = [];
      this.$nextTick(() => {
        if (this.checkSaleAll[index]) {
          this.checkSaleAll.splice(index, 1, false);
          this.indeterminateSale.splice(index, 1, false);
        } else {
          this.checkSaleAll.splice(index, 1, true);
          this.indeterminateSale.splice(index, 1, false);
          checkAllVal[index] = this.shopPermissionList.filter(i => {
            return i.platformId === typeItem;
          }).map(i => i.saleAccountId);
        }
        this.checkSaleAllGroup = checkAllVal;
        // 事业部选择处理
        let deptVal = [];
        if (!this.$common.isEmpty(this.platGroupJson[typeItem])) {
          Object.keys(this.platGroupJson[typeItem].csVal || {}).forEach(dept => {
            if (!this.$common.isEmpty(this.platAccountJson[typeItem])) {
              deptVal = (this.platAccountJson[typeItem][dept] || []).map(m => m.saleAccountId);
              this.platGroupJson[typeItem].csVal[dept] = checkAllVal[index].filter(val => deptVal.includes(val));
            }
          });
        }
        this.$nextTick(() => {
          this.csAllCheckChange(index, typeItem, true);
        })
      })
    },
    // 订单权限-店铺选中(取消)
    chooseAllGroupChange (index, typeItem, isType = false) {
      let data = this.checkAllGroup[index] || [];
      if (!isType) {
        this.oldCheckAllGroup = this.$common.copy(this.checkAllGroup);
        this.searchOrderChange(index, typeItem, true);
      }
      let platformListLength = this.shopPermissionList.filter(i => i.platformId === typeItem).length;
      // 事业部选择处理
      let deptVal = [];
      if (!this.$common.isEmpty(this.platGroupJson[typeItem])) {
        Object.keys(this.platGroupJson[typeItem].orderVal || {}).forEach(dept => {
          if (!this.$common.isEmpty(this.platAccountJson[typeItem])) {
            deptVal = (this.platAccountJson[typeItem][dept] || []).map(m => m.saleAccountId);
            this.platGroupJson[typeItem].orderVal[dept] = data.filter(val => deptVal.includes(val));
          }
        });
      }
      if (data.length === platformListLength) {
        this.indeterminate.splice(index, 1, false);
        this.checkAll.splice(index, 1, true);
      } else if (data.length > 0) {
        this.indeterminate.splice(index, 1, true);
        this.checkAll.splice(index, 1, false);
      } else {
        this.indeterminate.splice(index, 1, false);
        this.checkAll.splice(index, 1, false);
      }
    },
    // 客服权限-店铺选中(取消)
    checkSaleAllGroupChange (index, typeItem, isType = false) {
      let data = this.checkSaleAllGroup[index];
      if (!isType) {
        this.oldCheckSaleAllGroup = this.$common.copy(this.checkSaleAllGroup);
        this.searchCsChange(index, typeItem, true);
      }
      let platformListLength = this.shopPermissionList.filter(i => i.platformId === typeItem).length;
      // 事业部选择处理
      let deptVal = [];
      if (!this.$common.isEmpty(this.platGroupJson[typeItem])) {
        Object.keys(this.platGroupJson[typeItem].csVal || {}).forEach(dept => {
          if (!this.$common.isEmpty(this.platAccountJson[typeItem])) {
            deptVal = (this.platAccountJson[typeItem][dept] || []).map(m => m.saleAccountId);
            this.platGroupJson[typeItem].csVal[dept] = data.filter(val => deptVal.includes(val));
          }
        });
      }
      if (data.length === platformListLength) {
        this.indeterminateSale.splice(index, 1, false);
        this.checkSaleAll.splice(index, 1, true);
      } else if (data.length > 0) {
        this.indeterminateSale.splice(index, 1, true);
        this.checkSaleAll.splice(index, 1, false);
      } else {
        this.indeterminateSale.splice(index, 1, false);
        this.checkSaleAll.splice(index, 1, false);
      }
    },
    anchorSelect (idName, index) {
      const dom = document.querySelector('.information-content');
      const activeDom = document.querySelector(idName);
      if (dom && activeDom) {
        dom.scrollTop = (activeDom.offsetTop - 32);
      }
      if ([3, 4].includes(index)) {
        const rDom = document.querySelector('.information-search-content');
        const aDom = document.querySelector(index == 3 ? '#order_search' : '#customer_search');
        if (rDom && aDom) {
          rDom.scrollTop = aDom.offsetTop - 42;
        }
      }
      // document.querySelector(idName).scrollIntoView({ block: 'start', behavior: 'smooth' });
      this.anchorIndex = index;
    },
    // 搜索模块-搜索执行
    searchStore () {
      this.platformTypeList.forEach((item, index) => {
        this.$set(this.searchOrderAllCheck, index, []);
        this.$set(this.searchCsAllCheck, index, []);
      });
      this.$nextTick(() => {
        if (this.$common.isEmpty(this.pageFormParams.searchValue) && this.searchStoreList.length === 0) {
          this.searchStoreList = [];
          this.$Message.error({ content: '请输入店铺简称', closable: true });
          return;
        }
        let list = [];
        this.shopPermissionList.forEach(item => {
          if (this.pageFormParams.searchValue.includes(item.accountCode)) {
            list.push(item)
          }
        });
        this.searchStoreList = list;
        this.$nextTick(() => {
          this.platformTypeList.forEach((item, index) => {
            list.forEach(nl => {
              if (item === nl.platformId) {
                this.checkAllGroup[index].includes(nl.saleAccountId) && this.searchOrderAllCheck[index].push(nl.saleAccountId);
                this.checkSaleAllGroup[index].includes(nl.saleAccountId) && this.searchCsAllCheck[index].push(nl.saleAccountId);
              }
            })
          });
        })
      })
    },
    // 搜索模块-重置条件
    resetStore () {
      this.$refs.employeeForm && this.$refs.employeeForm.resetFields();
    },
    // 搜索模块-订单全选
    orderAllCheckChange (index, typeItem, type) {
      if (this.isStoreSuperAdmin) return;
      const allVal = this.searchStoreList.filter(f => f.platformId === typeItem);
      let arr = this.searchOrderAllCheck[index].length === allVal.length ? [] : allVal.map(m => m.saleAccountId);
      if (type) {
        arr = allVal.filter(f => this.checkAllGroup[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
      }
      this.$set(this.searchOrderAllCheck, index, arr);
      !type && this.searchOrderChange(index, typeItem);
    },
    // 搜索模块-客服全选
    csAllCheckChange (index, typeItem, type) {
      const allVal = this.searchStoreList.filter(f => f.platformId === typeItem);
      let arr = this.searchCsAllCheck[index].length === allVal.length ? [] : allVal.map(m => m.saleAccountId);
      if (type) {
        arr = allVal.filter(f => this.checkSaleAllGroup[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
      }
      this.$set(this.searchCsAllCheck, index, arr);
      !type && this.searchCsChange(index, typeItem);
    },
    // 搜索模块-订单选项改变
    searchOrderChange (index, typeItem, type) {
      const allVal = this.searchStoreList.filter(f => f.platformId === typeItem);
      const allCheck = this.$common.copy(this.checkAllGroup);
      if (!type) {
        const nuCheck = allVal.filter(f => !this.searchOrderAllCheck[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
        // 移除调取消选中值
        const filterVal = allCheck[index].filter(f => !nuCheck.includes(f));
        allCheck[index] = this.$common.arrRemoveRepeat([...filterVal, ...this.searchOrderAllCheck[index]]);
        this.checkAllGroup = allCheck;
        this.$nextTick(() => {
          this.chooseAllGroupChange(index, typeItem);
        })
      } else {
        const arr = allVal.filter(f => allCheck[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
        this.$set(this.searchOrderAllCheck, index, arr);
      }
    },
    // 搜索模块-客服选项改变
    searchCsChange (index, typeItem, type) {
      const allVal = this.searchStoreList.filter(f => f.platformId === typeItem);
      const allCheck = this.$common.copy(this.checkSaleAllGroup);
      if (!type) {
        const nuCheck = allVal.filter(f => !this.searchCsAllCheck[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
        // 移除调取消选中值
        const filterVal = allCheck[index].filter(f => !nuCheck.includes(f));
        allCheck[index] = this.$common.arrRemoveRepeat([...filterVal, ...this.searchCsAllCheck[index]]);
        this.checkSaleAllGroup = allCheck;
        this.$nextTick(() => {
          this.checkSaleAllGroupChange(index, typeItem);
        })
      } else {
        const arr = allVal.filter(f => allCheck[index].includes(f.saleAccountId)).map(m => m.saleAccountId);
        this.$set(this.searchCsAllCheck, index, arr);
      }
    }
    /* changeBusinessRole (val) {
      // 产品开发员和产品开发主管最多只能存在一个
      let list = this.newEmployeeParams.businessRoleTypeList;
      if (list.indexOf('commodityDeveloper') != -1 && list.indexOf('productDeveloperSupervisor') != -1) {
        let commodityDeveloperIndex = null;
        let productDeveloperSupervisorIndex = null;
        list.forEach((k, index) => {
          if (k == 'commodityDeveloper') {
            commodityDeveloperIndex = index
          }
          if (k == 'productDeveloperSupervisor') {
            productDeveloperSupervisorIndex = index
          }
        })
        list.splice(Math.min(commodityDeveloperIndex, productDeveloperSupervisorIndex), 1)
      }
    } */
  }
};
</script>
<style lang="less" scoped>
.checkbox-indeter-style{
  .custom-check-frame{
    content: '';
    border-color: #2d8cf0;
    background-color: #2d8cf0;
    &:before{
      position: absolute;
      content: '';
      width: 10px;
      height: 0;
      left: 2px;
      top: 7px;
      border-bottom: 2px solid #fff;
      border-right: 2px solid #fff;
      transform: scale(1);
    }
  }
}
.sticky-modal-item {
  position: sticky;
  top: 0;
  margin: 0 19px 0 0;
  border: 1px solid #d7dde4;
  background-color: #f7f7f7;
  height: 32px;
  z-index: 10;
}
.not-border-top{
  border-top: none;
}
.business-dept-checkbox{
  padding: 10px 20px 5px 10px;
}
.business-dept-item{
  margin-left: 10px;
  margin-right: 10px;
  border: 1px solid #dcdee2;
  border-radius: 5px;
}
.custom-checkbox {
  position: relative;
  display: table;
  line-height: normal;
  cursor: pointer;
  user-select: none;
  .custom-check-frame{
    position: relative;
    display: inline-block;
    margin-right: 5px;
    width: 16px;
    height: 16px;
    border: 1px solid #dcdee2;
    border-radius: 2px;
    background-color: #fff;
    font-size: 0;
    vertical-align: middle;
    transition: border-color .2s ease-in-out,background-color .2s ease-in-out,box-shadow .2s ease-in-out;
  }
  &.checkbox-checked{
    .custom-check-frame{
      border-color: #2d8cf0;
      background-color: #2d8cf0;
      &:before{
        position: absolute;
        content: '';
        width: 5px;
        height: 10px;
        top: 1px;
        left: 5px;
        border-bottom: 2px solid #fff;
        border-right: 2px solid #fff;
        transform: rotate(45deg) scale(1);
      }
    }
    &.checkbox-indeterminate{
      .checkbox-indeter-style;
    }
  }
  &.checkbox-indeterminate{
    .checkbox-indeter-style;
  }
  &.checkbox-disabled{
    cursor: not-allowed;
    .custom-check-frame{
      border-color: #dcdee2;
      background-color: #f3f3f3;
      &:before{
        border-bottom: 2px solid #ccc;
        border-right: 2px solid #ccc;
      }
    }
    &.checkbox-indeterminate {
      .custom-check-frame{
        &:before{
          border-bottom: 2px solid #ccc;
          border-right: 2px solid #ccc;
        }
      }
    }
    &.checkbox-checked{
      .custom-check-frame{
        &:before{
          border-bottom: 2px solid #ccc;
          border-right: 2px solid #ccc;
        }
      }
    }
  }
}
.roleItem {
  margin: 6px 0 0 6px;
  :deep(.ivu-checkbox-wrapper){
    display: block;
    margin: 0;
    padding: 2px 5px;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: break-word;
    overflow: hidden;
    .ivu-checkbox{
      margin-right: 2px;
    }
  }
}
.block-title{
  padding: 0 10px;
  line-height: 32px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.employee-modal-content{
  display: flex;
  .information-content,
  .information-search-content,
  .anchor_point{
    max-height: calc(100vh - 246px);
    vertical-align: top;
    overflow: auto;
  }
  .information-content{
    position: relative;
    flex: 54;
    border-right: 1px solid #ccc;
  }
  .information-search-content{
    position: relative;
    flex: 46;
    margin-left: 10px;
    border-right: 1px solid #ccc;
    .information-search-bar{
      position: sticky;
      top: 0;
      padding-bottom: 10px;
      box-shadow: 0 0 5px #ccc;
      background-color: #fff;
      z-index: 10;
    }
  }
  .anchor_point {
    position: relative;
    padding: 0 0 0 15px;
    border-radius: 0;
    background-color: #fff;
    li {
      height: 30px;
      line-height: 30px;
      cursor: pointer;
    }
    .anchor_active {
      color: #2d8cf0
    }
  }
  .addEmpolyeeData .ivu-form .mobileClass .ivu-form-item-label:before {
    color: #fff;
  }
  .platform-box {
    display: flex;
    padding: 15px 5px 5px 10px;
    border-bottom: 1px solid #ddd;
    align-items: flex-end;
    .platformItem{
      padding: 0;
    }
  }
  .roleData{
    margin: 0;
    width: auto;
  }
  .shopTable{
    flex: 100;
    margin: 0;
    font-size: 0;
  }
  .ivu-form-item{
    margin: 0;
  }
}
</style>
