<template>
  <div>
    <Modal v-model="isVisible" :title="modalTitle" width="80%" :mask-closable="false" :closable="modalClose"
      class="problemGoodHandSheet-page">
      <div class="formDetail detail-form">
        <Form ref="formCustom" :model="formData" :rules="formDataRules" :label-width="100" inline class="fmb18">
          <div class="formWidth240">
            <div class="fmb0" style="margin-bottom:6px;">
              <template v-if="type === 'create'">
                <FormItem label="处理单号:">
                  <span>保存后自动生成</span>
                </FormItem>
              </template>
              <div v-if="['detail', 'edit'].includes(type)">
                <FormItem label="处理单号:">
                  <span>{{ formData.receiptCheckQuestionNo }}</span>
                </FormItem>
                <FormItem label="处理类型:">
                  <span v-if="processTypeList[formData.questionType]">
                    {{ processTypeList[formData.questionType].label }}
                  </span>
                </FormItem>
                <FormItem label="处理状态:">
                  <span v-if="processStatusList[formData.questionStatus]">
                    {{ processStatusList[formData.questionStatus].statusLable }}
                  </span>
                </FormItem>
              </div>
              <div>
                <FormItem label="供应商:">
                  <span v-for="(item, index) in supplierList" :key="index + 'supplierId'">
                    <span v-if="formData.supplierId === item.supplierId">{{ item.supplierName }}</span>
                  </span>
                </FormItem>
                <FormItem label="开发人员:">
                  <span v-for="(item, index) in userListData" :key="index + 'developerId'">
                    <span v-if="formData.developerId === item.userId">{{ item.userName }}</span>
                  </span>
                </FormItem>
                <FormItem label="采购员:">
                  <span v-for="(item, index) in userListData" :key="index + 'purchaserId'">
                    <span v-if="formData.purchaserId === item.userId">{{ item.userName }}</span>
                  </span>
                </FormItem>
                <FormItem label="所属事业部:">
                  <div v-if="formData.businessDeptIdList">
                    <span v-for="(item, index) in formData.businessDeptIdList" :key="index">
                      <span v-if="businessDeptList[item]">
                        <span v-if="index > 0">,</span>
                        {{ businessDeptList[item].name }}
                      </span>
                    </span>
                  </div>
                </FormItem>
              </div>
            </div>
            <div class="autoLong" v-if="isCreate">
              <FormItem label="处理类型:" prop="questionType">
                <RadioGroup v-model="formData.questionType" type="button" button-style="solid">
                  <template v-for="item in processTypeArr ">
                    <Radio :label="item.value" :style="activeRadio(item)">
                      {{ item.label }}
                    </Radio>
                  </template>
                </RadioGroup>
              </FormItem>
            </div>

            <!-- 退货 -->
            <template v-if="formData.questionType === '0'">
              <div>
                <FormItem label="收货人名称:" prop="receipterName">
                  <dytInput v-model="formData.receipterName" :disabled="!isEdit" placeholder="请输入收货人名称" />
                </FormItem>
                <FormItem label="联系电话:" prop="telephone" class="autoLong">
                  <div class="flexBox">
                    <dytInput v-model="formData.telephone" style="width: 240px;" :disabled="!isEdit"
                      placeholder="请输入联系电话" />
                    <div class="linkText cursorClick ml15" @click="copyAddress" v-if="type === 'detail'">
                      <Icon type="ios-browsers-outline" style="font-size: 16px;margin-right: 4px;font-weight: bold;" />
                      <span>复制收货人地址信息</span>
                    </div>
                  </div>
                </FormItem>
              </div>
              <div>
                <FormItem label="退货地址地区:" prop="refundAddress">
                  <Cascader :data="areaList" v-model="formData.refundAddress" :disabled="!isEdit"
                    :load-data="loadAreaData" :filterable="true" :change-on-select="true" placeholder="请选择退货地址地区" />
                </FormItem>
                <FormItem label="详细地址:" class="autoLong form-width590" prop="rAddress">
                  <dytInput v-model="formData.rAddress" :disabled="!isEdit" placeholder="请输入详细地址" />
                </FormItem>
              </div>
              <div>
                <FormItem label="快递公司:" prop="logisticsId">
                  <dyt-select v-model="formData.logisticsId" :disabled="!isEdit">
                    <Option v-for="( item, index ) in expressCompanyList " :value="item.logisticsId"
                      :label="item.logisticsName" :key="index"></Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="快递单号:" prop="deliveryNo">
                  <dytInput v-model="formData.deliveryNo" :disabled="!isEdit" placeholder="请输入快递单号" />
                </FormItem>
              </div>
              <div class="form-width590">
                <FormItem label="备注:" prop="remark">
                  <dytInput type="textarea" v-model="formData.remark" :disabled="!isEdit"
                    :autosize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注" />
                </FormItem>
              </div>
              <div class="form-width590" v-if="isCreate">
                <FormItem label="跳转入库出库单创建页面:" prop="isJumpPage">
                  <RadioGroup v-model="formData.isJumpPage">
                    <Radio :label="1" class="mr20">需要(点击确认按钮后自动跳转至创建页面)</Radio>
                    <Radio :label="0">不需要</Radio>
                  </RadioGroup>
                </FormItem>
              </div>
            </template>
            <!-- 销毁 -->
            <div class="autoLong" v-if="formData.questionType === '1'">
              <FormItem label="">
                <Alert type="warning" class="alert-tip">提示：货物由仓库自行销毁处理</Alert>
              </FormItem>
            </div>
            <!-- 重新质检 -->
            <template v-if="formData.questionType === '3'">
              <FormItem label="质检比例:" prop="checkRate">
                <div class="flexCenter">
                  <dytInput v-model="formData.checkRate" :disabled="!isEdit" placeholder="请输入" />
                  <span class="ml10">%</span>
                </div>
              </FormItem>
              <div class="autoLong">
                <FormItem label="备注:">
                  <div class="flexCenter">
                    <Input v-model="formData.testRemarks" maxlength="200" show-word-limit type="textarea"
                      placeholder="处理意见" :rows="3" style="width:400px;" :disabled="!isEdit" />
                    <Alert type="warning" class="alert-tip" style="flex:1;max-width:500px;margin-left: 20px;">
                      <span class="tips">提示：</span>
                      <div>
                        <div>货物按商品最新质检标准，重新生成送检任务，重新质检；</div>
                        <div style="color:#FF0000;margin-top:4px;">创建“重新质检”处理单前，先修改好商品的质检标准；</div>
                      </div>
                    </Alert>
                  </div>
                </FormItem>
              </div>
            </template>
            <!-- 转合格上架 -->
            <template v-if="formData.questionType === '2'">
              <div class="autoLong">
                <FormItem label="备注:">
                  <div class="flexCenter">
                    <Input v-model="formData.groundingRemarks" maxlength="200" show-word-limit type="textarea"
                      placeholder="处理意见" :rows="3" style="width:350px;" :disabled="!isEdit" />
                    <Alert type="warning" class="alert-tip" style="flex:1;margin-left: 20px;">
                      提示：货物生成上架任务，可上架为合格品
                    </Alert>
                  </div>
                </FormItem>
              </div>
            </template>
          </div>
        </Form>
        <div class="stock-block">
          <div class="title">问题商品信息</div>
          <div>
            <Table highlight-row border ref="productInfoTable" :columns="columns" :data="tableList"
              :span-method="handleSpan" @on-selection-change="selectProblemProduct">
              <template slot-scope="{ row }" slot="orderInfo">
                <div class="order-item">
                  <div class="order-li">质检单号: {{ row.receiptCheckNo || '' }}</div>
                  <div class="order-li">采购单号: {{ row.purchaseNo || '' }}</div>
                  <div class="order-li">入库单号: {{ row.receiptNo || '' }}</div>
                  <div class="order-li">存放编码: {{ storageCodeShow(row) }}</div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="basicInfo">
                <div class="order-item">
                  <div class="order-li">质检记录号: {{ row.receiptBatchCheckDetailNo || '' }}</div>
                  <div class="order-li">SKU: {{ row.sku || '' }}</div>
                  <div class="order-li--text" v-if="row.productName">
                    <Tooltip :content="row.productName" :disabled="!row.productName" placement="top">
                      {{ row.productName || '' }}</Tooltip>
                  </div>
                  <div class="order-li" style="color: #008000;">{{ row.productAttributes || '' }}</div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="picture">
                <div class="picture-width">
                  <dyt-previewImg :fileList="returnList(row)"
                    :imgOption="{ listWidth: 50, listHeight: 50, mode: 'multiple' }">
                  </dyt-previewImg>
                </div>
              </template>
            </Table>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button v-if="isEdit && !isLoadFail" type="primary" @click="submitSave" :disabled="modalLoad">确 定</Button>
        <span v-if="isEdit && isLoadFail" style="color:#f40;margin-right: 10px;">获取信息失败，无法进行保存操作</span>
        <Button @click="isVisible = false">取 消</Button>
      </div>
      <Spin fix v-if="modalLoad"></Spin>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Big from 'big.js';
import copy from '@/utils/clipboard.js';
import regular from '@/utils/regular.js';
import { getWarehouseId } from '@/utils/getService';
import { processTypeList, processStatusList } from './fileData.js';
import localforage from 'localforage';
export default {
  name: 'problemGoodHandSheet',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    moduleList: {
      type: [Array, Object],
      default() {
        return []
      }
    },
    type: {// 区分创建:create和查看:detail和修改质检单:edit
      type: String,
      default() {
        return 'create'
      }
    },
    // isOtherComing: {// 是否其他入库类型   http://192.168.91.3/www/index.php?m=task&f=view&taskID=9650 需求
    //   type: Boolean,
    //   default() {
    //     return false
    //   }
    // },
  },
  data() {
    return {
      isVisible: false,
      modalLoad: true,
      topAreaList: [],
      formData: {
        receiptCheckQuestionNo: '',
        questionType: null,
        questionStatus: '',
        supplierId: null,
        supplierName: null,
        developerId: '',
        purchaserId: null,
        receipterName: null,
        telephone: null,
        rCityId: '', // 退货地址 ID
        rCityName: '', // 退货地址名称
        refundAddress: [],
        rAddress: '', // 退货供应商地址
        logisticsId: '',
        logisticsName: '',
        deliveryNo: null,
        remark: null, // 备注
        receiptCheckQuestionDetailBaseList: [],
        checkRate: '100', // 质检比例，默认100
        testRemarks: '', // 质检意见
        groundingRemarks: '', // 上架意见
        businessDeptIdList: '', // 事业部id
        isJumpPage: 0, // 默认不需要
      },
      // 表单验证
      formDataRules: {
        receipterName: [
          { validator: this.validateMaxLength, trigger: 'change' },
          { validator: this.validateMaxLength, trigger: 'blur' }
        ],
        telephone: [
          { validator: this.validateMaxLength, trigger: 'change' },
          { validator: this.validateMaxLength, trigger: 'blur' }
        ],
        rAddress: [
          { validator: this.validateMaxLength, trigger: 'change', name: 'rAddress' },
          { validator: this.validateMaxLength, trigger: 'blur', name: 'rAddress' }
        ],
        deliveryNo: [
          { validator: this.validateMaxLength, trigger: 'change' },
          { validator: this.validateMaxLength, trigger: 'blur' }
        ],
        questionType: [
          { required: true, message: '请选择', trigger: 'change' },
        ],
        checkRate: [
          { required: true, message: '请输入', trigger: 'blur' },
          { pattern: /^\d\.([1-9]{1,2}|[0-9][1-9])$|^[1-9]\d{0,1}(\.\d{1,2}){0,1}$|^100(\.0{1,2}){0,1}$/, message: '大于0或小于等于100', trigger: 'blur' },
        ],
      },
      oldFormData: {},
      columns: [
        {
          title: '单号信息',
          slot: 'orderInfo',
          align: 'center',
          minWidth: 240,
        },
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: '基本信息',
          slot: 'basicInfo',
          align: 'center',
          minWidth: 160,
        }, {
          title: '问题原因',
          key: 'problemCheckReason',
          align: 'center',
          minWidth: 120,
        },
        {
          title: '质检图片',
          slot: 'picture',
          align: 'center',
          width: 150,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 120,
        },
        {
          title: '数量',
          key: 'remainNumber',
          minWidth: 100
        },
      ],
      expressCompanyList: [],
      tableList: [],
      supplierList: [], // 供应商列表
      userListData: [], // 人员数据
      // 地址列表
      areaList: [],
      isLoadFail: false,
      addressJson: {},
      processTypeList: processTypeList,
      processStatusList: processStatusList,
      selectProblemProductList: []
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
        this.clearData();
      },
      deep: true
    },
    'formData.questionType': {
      handler(val) {
        if (['0', '1'].includes(val)) {
          this.tableList.forEach((item, index) => {
            if (!this.$refs.productInfoTable.objData[index]) return;
            this.$refs.productInfoTable.objData[index]._isDisabled = true;
            this.$refs.productInfoTable.objData[index]._isChecked = true;
          })
          this.selectProblemProductList = this.tableList
        } else if (['2', '3'].includes(val) && this.type === 'create') {
          this.tableList.forEach((item, index) => {
            if (!this.$refs.productInfoTable.objData[index]) return;
            this.$refs.productInfoTable.objData[index]._isChecked = item.isSelected;
            this.$refs.productInfoTable.objData[index]._isDisabled = false
          })
          this.selectProblemProductList = []
        }
      }
    },
    type: {
      handler(val) {
        if (['edit', 'detail'].includes(val)) {
          this.columns = this.columns.filter(item => !item.hidden)
        }
      }
    }
  },
  computed: {
    modalTitle() {
      return this.isCreate ? '创建问题商品处理单' : this.type === 'edit' ? '编辑问题商品处理单' : '查看问题商品处理单';
    },
    // 是否为可编辑
    isEdit() {
      return ['create', 'edit'].includes(this.type);
    },
    // 是否创建处理
    isCreate() {
      return ['create'].includes(this.type);
    },
    // 地址
    rCityName() {
      let cityName = [];
      this.formData.refundAddress.forEach(id => {
        if (this.addressJson[id]) {
          cityName.push(this.addressJson[id].districtCnName);
        }
      })
      return cityName.join(',');
    },
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    businessDeptList() {
      let obj = {};
      let list = this.$store.getters.getBusinessDeptList || [];
      list.forEach(k => { obj[k.id] = k })
      return obj;
    },
    processTypeArr() {
      return Object.values(this.processTypeList).sort((a, b) => {
        return a.sort - b.sort;
      });
    },
  },
  methods: {
    // 窗口打开
    openModal() {
      this.isVisible = true;
      this.modalLoad = true;
      this.oldFormData = this.$common.copy(this.formData);
      this.getAddressList(1).then((res) => {
        this.topAreaList = res;
        this.areaList = res;
        // 需要加载的数据
        let awaitList = [this.getSupplierList(), this.getAllUser(), this.getLogistics()];
        if (!this.isCreate) {
          const questionNo = this.moduleList.receiptCheckQuestionNo;
          awaitList.push(this.getDetail(questionNo));
        } else {
          const paramsList = this.moduleList.map(m => m.receiptCheckNo);
          awaitList.push(this.getCreateDetail(paramsList));
          awaitList.push(this.getCreateGetSupplierInfo(paramsList));
        }
        Promise.all(awaitList).then(() => {
          let awaitOtherList = [];
          if (this.isCreate) {
            awaitOtherList.push(this.getRefundAddress(this.formData.supplierId));
          }
          Promise.all(awaitOtherList).finally(() => {
            this.modalLoad = false;
          }).catch(() => {
            this.modalLoad = false;
          })
        }).catch(() => {
          this.modalLoad = false;
        });
      }).catch(() => {
        this.modalLoad = false;
      });
    },
    // 创建处理单时获取供应商退货地址、用户信息
    getRefundAddress(supplierId) {
      return new Promise((resolve) => {
        if (this.$common.isEmpty(supplierId)) return resolve({});
        this.axios.get(api.get_refundAddress, {
          params: {
            supplierId: supplierId || ''
          },
          hiddenError: true
        }).then(({ data }) => {
          const keys = ['telephone'];
          keys.forEach(key => {
            typeof data.datas[key] !== 'undefined' && this.$set(this.formData, key, data.datas[key]);
          });
          if (typeof data.datas['rAddressDetail'] !== 'undefined') {
            this.$set(this.formData, 'rAddress', data.datas['rAddressDetail']);
          }
          if (typeof data.datas['contactMan'] !== 'undefined') {
            this.$set(this.formData, 'receipterName', data.datas['contactMan']);
          }
          if (typeof data.datas['rAddress'] !== 'undefined') {
            const address = (data.datas['rAddress'] || '').split(',').filter(f => !this.$common.isEmpty(f, true));
            this.getCreateRefundAddress(address).then((res) => {
              this.$set(this.formData, 'refundAddress', res);
              resolve({});
            })
          } else {
            resolve({});
          }
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 创建时转换为地址ID
    getCreateRefundAddress(addressArr, isId = false) {
      return new Promise((resolve) => {
        let treeList = this.$common.copy(this.topAreaList);
        let val = [];
        const hand = (data, index = 0, allData) => {
          let obj = {};
          let treeIndex = 0;
          data.forEach((item, tIndex) => {
            if ((isId && item.id === addressArr[index]) || (!isId && item.label === addressArr[index])) {
              obj = item;
              treeIndex = tIndex;
            }
          })
          if (this.$common.isEmpty(obj)) {
            this.areaList = treeList;
            return resolve(val);
          }
          val.push(obj.value);
          this.getAddressList(obj.id).then(res => {
            allData[treeIndex].children = res;
            if (addressArr.length - 1 > index) {
              hand(res, index + 1, allData[treeIndex].children);
            } else {
              this.areaList = treeList;
              resolve(val);
            }
          })
        }
        hand(this.topAreaList, 0, treeList);
      })
    },
    // 获取详情
    getDetail(questionNo) {
      return new Promise((resolve) => {
        this.axios.get(api.get_receiptCheckQuestionDetail, {
          params: {
            receiptCheckQuestionNo: questionNo || ''
          }
        }).then(({ data }) => {
          const tNumber = ['logisticsId'];
          this.isLoadFail = data.code !== 0;
          if (data.datas) {
            let newFormData = {};
            const notKeys = ['rCityId'];
            newFormData['refundAddress'] = (data.datas['rCityId'] || '').split(',').filter(f => !this.$common.isEmpty(f, true)).map(m => Number(m));
            this.getCreateRefundAddress(newFormData['refundAddress'], true).then(res => {
              Object.keys(this.formData).forEach(key => {
                if (['testRemarks', 'groundingRemarks'].includes(key)) {
                  newFormData[key] = data.datas['remark'] || '';
                } else if (key === 'businessDeptIdList') {
                  newFormData[key] = Array.from(new Set(data.datas[key] || []));
                } else {
                  if (typeof data.datas[key] !== 'undefined') {
                    if (tNumber.includes(key)) {
                      newFormData[key] = Number(data.datas[key]);
                    } else if (!notKeys.includes(key)) {
                      newFormData[key] = data.datas[key];
                    }
                  }
                }
              })
              this.formData = { ...this.formData, ...newFormData };
              this.handTableListData(data.datas.receiptCheckQuestionDetailProductList || [], this.isCreate);
              resolve({ ...this.formData, ...newFormData });
            });
          } else {
            this.isLoadFail = true;
            resolve(this.formData);
          }
        }).catch(() => {
          this.isLoadFail = true;
          resolve(this.formData);
        })
      })
    },
    // 创建时获取基本信息
    getCreateDetail(receiptNos) {
      return new Promise((resolve) => {
        this.axios.post(api.get_createProcessingQuery, receiptNos).then(res => {
          if (res && res.data && res.data.datas) {
            this.handTableListData(res.data.datas, this.isCreate);
          } else {
            this.isLoadFail = true;
          }
          resolve(res.data || {});
        }).catch(() => {
          this.isLoadFail = true;
          resolve({});
        })
      })
    },
    // 获取快递公司
    getLogistics() {
      return new Promise((resolve) => {
        this.axios.post(api.get_logistics, {}, { hiddenError: true }).then(({ data }) => {
          if (data) {
            this.expressCompanyList = data.datas || [];
          }
          resolve(data);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取地址(默认值返回中国省份，中国的 ID 为 1)
    getAddressList(parentId = 1) {
      return new Promise((resolve) => {
        this.axios.get(api.get_addresstreeList, { params: { parentId: parentId }, hiddenError: true }).then(({ data }) => {
          const list = this.addressListHand(this.$common.copy(data.data || []), {
            label: 'districtCnName',
            value: 'id',
            children: 'childrenDistrictList'
          }, 'childrenDistrictList');
          resolve(list);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 展开子级加载
    loadAreaData(item, callback) {
      item.loading = true;
      this.getAddressList(item.value).then(res => {
        item.children = this.$common.isEmpty(res) ? [] : res;
        item.loading = false;
        callback();
      })
    },
    // 地址处理
    addressListHand(data, obj, childKey, ids = [], names = '') {
      const keys = Object.keys(obj);
      data.forEach(item => {
        this.addressJson[item[obj.value]] = item;
        keys.forEach(key => {
          if (key === 'children' && [0, '0'].includes(item.isLastNode)) {
            item.loading = false;
          }
          item[key] = item[obj[key]];
        })
        if (item[childKey] && this.$common.isArray(item[childKey])) {
          this.addressListHand(item[childKey], obj, childKey, [...ids, item[obj.value]], `${names ? names + ',' : ''}${item[obj.label]}`);
        }
        delete item[childKey];
      })
      return data;
    },
    // 获取创建处理单获取供应商信息
    getCreateGetSupplierInfo(params) {
      return new Promise((resolve) => {
        this.axios.post(api.get_createProcessingGetSupplierInfo, params, { hiddenError: true }).then(({ data }) => {
          const keys = Object.keys(data.datas || {});
          if (!this.isLoadFail) {
            this.isLoadFail = data.code !== 0;
          }
          keys.forEach(key => {
            if (key == 'businessDeptId') {
              return this.$set(this.formData, 'businessDeptIdList', [data.datas[key]]);
            }
            this.$set(this.formData, key, data.datas[key]);
          });
          resolve(data.datas || {});
        }).catch(() => {
          this.isLoadFail = true;
          resolve({});
        })
      })
    },
    // 获取供应商列表
    getSupplierList() {
      return new Promise((resolve) => {
        this.$store.dispatch('getSupplierList').then(res => {
          this.supplierList = res || [];
          resolve(res || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取人员
    getAllUser() {
      return new Promise((resolve) => {
        this.$store.dispatch('getPurchaserList').then(res => {
          this.userListData = Object.values(res || {});
          resolve(res || {});
        }).catch(() => {
          resolve({});
        })
      })
    },
    // 表格数据处理
    handTableListData(data, isCreate) {
      let newData = [];
      if (isCreate) {
        // 列表数据合并设置
        Object.keys(data).forEach(key => {
          const list = data[key].filter(f => f.problemCheckNumber && f.problemCheckNumber > 0);
          list.forEach((row, index) => {
            newData.push({
              ...row,
              pictureUrl: row.allImageUrl ? row.allImageUrl.split(',') : [],
              remainNumber: typeof row.problemCheckNumber !== 'number' ? null : row.problemCheckNumber,
              rowspan: index === 0 ? list.length : 0,
              colspan: index === 0 ? 1 : 0,
            })
          })
        })
      } else {
        data.forEach(item => {
          if (!this.$common.isEmpty(item.receiptProblemDetailList)) {
            let list = item.receiptProblemDetailList || [];
            // 这里加退货销毁类型判断，因为原bug导致问题商品剩余数量为0，后续新增类型不会有这种情况
            if (['0', '1'].includes(this.formData.questionType)) {
              list = list.filter(f => f.remainNumber && f.remainNumber > 0);
            }
            // 列表数据合并设置
            list.forEach((row, index) => {
              newData.push({
                ...row,
                pictureUrl: row.allImageUrl ? row.allImageUrl.split(',') : [],
                purchaseNo: item.purchaseNo,
                receiptCheckNo: item.receiptCheckNo,
                receiptNo: item.receiptNo,
                rowspan: index === 0 ? list.length : 0,
                colspan: index === 0 ? 1 : 0,
                slotCode: item.slotCode,
                slotType: item.slotType,
                isSelected: false
              });
            })
          }
        })
      }
      this.tableList = newData;
      if (this.formData.questionType === null) {
        this.tableList.forEach(item => {
          item._disabled = true;
        })
      }
    },
    // 处理图片列表
    returnList(row) {
      return (row.pictureUrl || []).filter(f => !this.$common.isEmpty(f)).map(pictureUrl => {
        return { url: pictureUrl };
        // return { url: `${this.imagePrefix}${pictureUrl}` };
      })
    },
    // 合格数量限制
    validateQualifyNum(rule, value, callback) {
      if (value === '' || value === undefined || value === null) {
        return callback(new Error('请输入内容'));
      }
      if (!regular.integer.test(value)) {
        return callback(new Error('限大于或等于0的整数'));
      }
      if (new Big(value || 0).minus(rule.remainingQuantity || 0) > 0) {
        return callback(new Error('不能小于SKU剩余数量'));
      }
      return callback();
    },
    // 表格列合并
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        return { rowspan: row.rowspan, colspan: row.colspan };
      }
    },
    // 提交保存数据
    submitSave() {
      this.$refs.formCustom.validate((valid) => {
        if (!valid) return;
        let _self = this;
        let params = this.$common.copy(this.formData);
        let delOtherList = ['checkRate', 'testRemarks', 'groundingRemarks'];
        let delBackList = ['receipterName', 'telephone', 'refundAddress', 'rAddress', 'deliveryNo', 'rCityName', 'rCityId', 'logisticsId', 'logisticsName'];
        let fun = {
          'delParams'(params, deleteKeys) {
            Object.keys(params).forEach(key => {
              deleteKeys.includes(key) && delete params[key];
            });
          },
          'processData0'() {
            if (params.refundAddress.length > 0) {
              params.rCityId = params.refundAddress.join(',');
              delete params.refundAddress;
            }
            params.logisticsId = params.logisticsId || null;
            params.logisticsName = _self.expressCompanyList.filter(f => f.logisticsId === params.logisticsId).map(m => m.logisticsName).join('');
            params.rCityName = _self.rCityName;
            fun.delParams(params, delOtherList);
          },
          'processData1'() {
            fun.delParams(params, [...delBackList, ...delOtherList, 'remark']);
          },
          'processData2'() {
            params.remark = params.groundingRemarks;
            fun.delParams(params, [...delBackList, ...delOtherList]);
          },
          'processData3'() {
            params.remark = params.testRemarks;
            let list = _self.$common.copy(delOtherList);
            list.shift();
            fun.delParams(params, [...delBackList, ...list]);
          },
        }
        if (params.supplierId) {
          params.supplierName = this.supplierList.filter(f => f.supplierId === params.supplierId).map(m => m.supplierName).join('');
        }
        params.warehouseId = getWarehouseId();
        // 判断是否创建
        if (this.isCreate) {
          params.receiptCheckQuestionDetailBaseList = this.selectProblemProductList.map(row => {
            return {
              receiptCheckNo: row.receiptCheckNo,
              receiptBatchCheckDetailNo: row.receiptBatchCheckDetailNo,
              productGoodsId: row.productGoodsId,
              remainNumber: row.remainNumber === 0 ? 0 : row.remainNumber
                ? row.remainNumber : null,
              refundNumber: typeof row.refundNumber !== 'number' ? 0 : row.refundNumber, // 创建时为 0
              destructionNumber: typeof row.destructionNumber !== 'number' ? 0 : row.destructionNumber, // 创建时为 0
              remark: row.remark,
            }
          })
          params.receiptCheckIdList = this.moduleList.map(k => k.receiptCheckId);
        } else {
          fun.delParams(params, ['receiptCheckQuestionDetailBaseList'])
        }
        fun['processData' + params.questionType]();
        // 空字符串需置空
        Object.keys(params).forEach(key => {
          params[key] === '' && (params[key] = null);
        })
        this.requestFor(params);
      })
    },
    // 重新质检校验
    reQualityInspection(data) {
      let params = this.$common.copy(data);
      params.checkRate = new Big(params.checkRate).div(100);
      let flag = false;
      this.tableList.forEach(k => {
        let num = new Big(params.checkRate).times(k.remainNumber || 0);
        if (num < 1) flag = true;
      })
      if (flag) {
        this.$Message.error('最小值为：1，重新质检的应检数量不能等于0');
        return false;
      }
      return true;
    },
    requestFor(params) {
      let rqApi = api[this.isCreate ? 'create_processing' : 'update_processing'];
      if (this.isCreate && params.receiptCheckQuestionDetailBaseList.length === 0) {
        return this.$Message.warning('请勾选至少一项问题商品')
      }
      // this.jumpToPurchase(params);
      // return;
      this.modalLoad = true;
      this.axios.post(rqApi, params).then(res => {
        if (res && res.data && res.data.code === 0) {
          this.$Message.success('操作成功');
          this.isVisible = false;
          this.$emit('submitSuccess', res);
          this.jumpToPurchase(params);
        }
      }).finally(() => {
        this.modalLoad = false;
      })
    },
    // 新的窗口打开入库出库单创建页面（采购管理系统）
    async jumpToPurchase(data) {
      if (!(this.isCreate && [0, '0'].includes(data.questionType) && [1].includes(data.isJumpPage))) {
        return false;
      }
      const key = 'problemPiece';
      let problemPieceData = await localforage.getItem(key) || {};
      const problemId = new Date().getTime() + parseInt(Math.random() * 100000);
      problemPieceData[problemId] = Object.assign({ tableList: this.tableList, ...data });
      // console.log(problemPieceData);
      await localforage.setItem(key, problemPieceData);
      const page = `/sps-service/supplierPurchase.html#/receivedProOutboundApply?problemId=${problemId}`;
      const path = window.location.origin + page;
      // const path = 'http://172.20.200.108:8099' + page;
      // const name = '入库出库申请-采购管理系统';
      window.open(path);
    },
    // 清空数据
    clearData() {
      this.isLoadFail = false;
      this.formData = this.$common.copy(this.oldFormData);
      this.$nextTick(() => {
        this.$refs.formCustom.resetFields();
      })
    },
    validateMaxLength(rule, value, callback) {
      let limitNum = 50;
      if (rule.name === 'rAddress') limitNum = 200;// 地址限制字符变更
      if (typeof value === 'string' && value.length > limitNum) {
        return callback(new Error(`不可超过 ${limitNum} 字符`));
      }
      callback();
    },
    // 处理要显示的编码
    storageCodeShow(row) {
      if (row.slotType == 1 && row.slotCode) {
        return (row.slotCode < 10 ? '0' + row.slotCode : row.slotCode) + '框';
      }
      return row.slotCode || '';
    },
    // 复制收货人地址信息
    copyAddress(e) {
      let formData = this.formData;
      // 数据格式：收货人名称：收货人名称值；联系电话：联系电话值；退货地址地区：退货地址地区值；详细地址：详细地址值；
      let text = `收货人名称：${formData.receipterName || ''}；联系电话：${formData.telephone || ''}；退货地址地区：${formData.rCityName || ''}；详细地址：${formData.rAddress || ''}；`;
      copy(e, text);
    },
    // 处理类型对应颜色
    activeRadio(row) {
      let str = {};
      let flag = this.formData.questionType === row.value;
      if (flag) {
        str.background = str.borderColor = row.color;
        str.boxShadow = '0 1px 6px ' + row.color;
      }
      return str;
    },
    selectProblemProduct(val) {
      this.selectProblemProductList = val
    }
  }
}
</script>

<style lang="less">
.problemGoodHandSheet-page {
  .ivu-modal {
    min-width: 1000px;
    max-width: 1800px;
  }

  .alert-tip {
    margin: 0;

    .tips {
      white-space: nowrap;
    }

    .ivu-alert-message {
      display: flex;
    }
  }

  .form-width590 .ivu-form-item-content {
    width: 500px;
  }

  .ivu-modal-body {
    max-height: calc(100vh - 300px);
    overflow: auto;
  }

  .inputNuberArrow {
    width: 59px;

    .ivu-input-number-handler-wrap {
      display: none;
    }
  }
}
</style>
