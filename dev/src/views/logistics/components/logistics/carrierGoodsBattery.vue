<template>
  <div>
    <div class="usersFilter">
      <div>
        <div class="card-content">
          <div class="pt10 platformParamsSelect">
            <Form ref="formeParams" :model="pageParams" label-position="right" :label-width="100">
              <dyt-filter :filter-row="1">
                <!--店铺列表-->
                <Form-item label="店铺" prop="saleAccountIdList">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIdList"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="SKU" prop="skuList">
                  <dyt-input-tag
                    v-model="pageParams.skuList"
                    type="textarea"
                    :limit="1"
                    placeholder="请输入SKU，多个SKU可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="商品中文名称" prop="goodsCnName">
                  <dyt-input v-model="pageParams.goodsCnName" placeholder="请输入商品中文名称"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="search" icon="md-search" :disabled="SearchDisabled">查询</Button>
                  <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <div class="usersFilter mb10 mt10">
      <Button type="primary" v-if="getPermission('carrierGoodsBattery_insert')" @click="openModal1">新增对照 </Button>
      <Button type="primary" v-if="getPermission('carrierGoodsBattery_import')" @click="openImportModal" class="ml10">导入对照</Button>
      <Dropdown class="ml10" v-if="getPermission('carrierGoodsBattery_batchDelete')">
          <Button type="error">
            批量删除
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="delQualification({type:'batch'})">删除增删除选中</DropdownItem>
            <DropdownItem @click.native="delQualification({type:'all'})">删除所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
    </div>
    <div class="usersFilter">
      <!--带电资质列表-->
      <Table highlight-row border @on-selection-change="checkDataMt" :columns="columns1" :data="data1" :height="tableHeight" :loading="tableLoading"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :current="curPage"></Page>
        </div>
      </div>
    </div>
    <!--新增带电资质对照-->
    <Modal v-model="modal1" title="新增带电资质对照" width="1100">
      <Form :label-width="120">
        <Row v-for="(item,index) in addCQList" :key="index">
          <Col span="7">
            <FormItem label="ebay账号">
              <dyt-select
                ref="shopListModalRef"
                v-model="item.account"
                filterable
                placeholder="请选择店铺，可输入搜索"
                @on-change="addQualificationChange($event, index)"
              >
                <Option
                  v-for="(item,cindex) in shopList"
                  :key="cindex"
                  :value="item.account"
                  :v="item.account"
                >{{ item.accountCode }}</Option>
              </dyt-select>
            </FormItem>
          </Col>
          <Col span="7" offset="1">
            <FormItem label="带电资质类型">
              <dyt-select
                ref="qualificationListModal"
                v-model="item.batteryId"
                filterable
                placeholder="请选择带电资质类型"
                @on-change="qualificationChange($event,index)"
                :disabled="$common.isEmpty(item.account)"
              >
                <Option
                  v-for="(oItem,cindex) in item.qualificationList"
                  :key="cindex"
                  :value="oItem.batteryId"
                  :v="oItem.batteryId"
                >{{ oItem.batteryName }}</Option>
              </dyt-select>
            </FormItem>
          </Col>
          <!-- <Col span="6" offset="1">
            <FormItem label="带电类型">
              <dyt-select ref="electrificationTypeModal" v-model="item.miniBatteryType" filterable>
                <Option
                  v-for="(item,index) in item.electrizationList"
                  :key="index"
                  :value="item.batteryId"
                  :v="item.batteryId"
                >{{ item.batteryName }}</Option>
              </dyt-select>
            </FormItem>
          </Col> -->
          <Col span="3">
            <Icon type="md-add" @click="pushCQ" style="margin: 6px 0 0 6px;cursor: pointer" size="18" v-if="index === 0" />
            <Icon type="md-close" size="18" @click="delCQ(index)" style="margin: 6px 0 0 6px;cursor: pointer" v-if="index > 0" />
          </Col>
        </Row>
        <Button @click="openProductFn" class="mb10" type="primary">新增货品 </Button>
        <Table highlight-row border max-height="600" :columns="columns2" :data="addProductValue"></Table>
      </Form>
      <div slot="footer">
        <Button @click="addQualification" type="primary" :loading="addLoading">保存 </Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
    <!-- 导入对照 -->
    <Modal
      v-model="switchInportModal"
      title="导入对照"
    >
      <div style="position: relative;">
        <p style="margin-top: 5px;float: left;">选择导入文件：</p>
        <div>
          <dytUpload
            ref="upload"
            name="excleFile"
            :show-upload-list="false"
            :accept="importAccept"
            :action="importUrl"
            :before-upload="importBefore"
            style='display: inline-block'
            :disabled="importModalLoading"
          >
            <Button>选择文件</Button>
          </dytUpload>
          <a href="javascript:;" style='margin-left: 20px' @click='downloadImportModule'>下载模板</a>
          <div v-if="importFile !== null" style="marginTop:10px">
            上传文件：{{ importFile.name }}
          </div>
          <!-- <div class="skuUpdate mt10">
            导入已经存在的对照时：
            <RadioGroup v-model="updateIgnore">
              <Radio label="0">覆盖</Radio>
              <Radio label="1">忽略</Radio>
            </RadioGroup>
          </div> -->
        </div>
        <Spin fix v-if="importModalLoading"></Spin>
      </div>
      <div slot="footer">
        <Button @click="uploadCancel">取消</Button>
        <Button @click="importUpload" type="primary" :loading="importModalLoading">确定</Button>
      </div>
    </Modal>
    <matchingGoodsModal v-if="modal1" ref="matchingGoodsModal" :showNumber="false" :prefix="'/setting-service'" :choseData="addProductValue" :openTalg="openTalg" @saveHandel="addProductSave"></matchingGoodsModal>
    <Spin fix v-if="pageLoading"></Spin>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import matchingGoodsModal from '@/components/common/order/matchingGoodsModal';

export default {
  name: 'chargedQualification',
  mixins: [Mixin],
  components: {
    matchingGoodsModal
  },
  data () {
    return {
      tableHeight: 650,
      addProductValue: [],
      checkData: [], // 选择的数据
      shopList: [],
      shopInfoJson: {},
      addLoading: false,
      importUrl: api.importCarrierGoodsBattery,
      switchInportModal: false,
      importModalLoading: false,
      importFile: null,
      filenodeViewTargetUrl: this.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      importAccept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      addCQList: [
        {}
      ],
      electrization: [ // 带电类型
        {
          batteryId: 'NO_BATTERY',
          batteryName: '不带电'
        }, {
          batteryId: 'LITHIUM_ION_BATTERY_PACKED_WITH_EQUIPMENT',
          batteryName: '配套锂离子电池'
        }, {
          batteryId: 'LITHIUM_ION_BATTERY_CONTAINED_IN_EQUIPMENT',
          batteryName: '内置锂离子电池'
        }, {
          batteryId: 'LITHIUM_METAL_BATTERY_PACKED_WITH_EQUIPMENT',
          batteryName: '配套锂金属电池'
        }, {
          batteryId: 'LITHIUM_METAL_BATTERY_CONTAINED_IN_EQUIPMENT',
          batteryName: '内置锂金属电池'
        }, {
          batteryId: 'DRY_PACKED_WITH_EQUIPMENT',
          batteryName: '配套干电池'
        }
      ],
      columns1: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '店铺',
          key: 'account',
          align: 'center',
          minWidth: 220,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.saleAccountId)) return h('span', '');
            const rowAccunt = this.shopInfoJson[row.saleAccountId];
            if (this.$common.isEmpty(rowAccunt)) return h('span', row.account || '');
            return h('span', rowAccunt.accountCode);
          }
        },
        {
          title: '带电类型',
          key: 'batteryType',
          align: 'center',
          minWidth: 220
        }, {
          title: '带电资质ID',
          key: 'batteryId',
          align: 'center',
          minWidth: 220
        }, {
          title: '图片',
          key: 'pictureUrl',
          align: 'center',
          minWidth: 220,
          render: (h, params) => {
            return this.tableImg(h, params, 'pictureUrl');
          }
        }, {
          title: 'SKU/产品名称',
          key: 'email',
          align: 'center',
          minWidth: 220,
          render: (h, params) => {
            return h('div', {}, [
              h('p', params.row.sku), h('p', params.row.productName)
            ]);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 180,
          render: (h, params) => {
            return !this.getPermission('carrierGoodsBattery_delete') || h('Button', {
              props: {
                size: 'small',
                type: 'error'
              },
              on: {
                'click': () => {
                  this.delQualification({ id: params.row.carrierGoodsBatteryId });
                }
              }
            }, '删除');
          }
        }
      ],
      data1: [],
      columns2: [
        {
          title: '商品图片',
          key: 'productPic',
          align: 'center',
          render: (h, params) => {
            let rowInfo = this.$common.copy(params);
            const thumb = `${this.filenodeViewTargetUrl}/thumb`;
            if (!this.$common.isEmpty(rowInfo.row.productPic) && rowInfo.row.productPic.includes(thumb)) {
              const subIndex = rowInfo.row.productPic.indexOf(thumb);
              rowInfo.row.productPic = rowInfo.row.productPic.substring(subIndex + thumb.length, rowInfo.row.productPic.length);
            }
            return this.tableImg(h, rowInfo, 'productPic');
          }
        }, {
          title: 'SKU',
          align: 'center',
          key: 'sku'
        }, {
          title: '产品名称',
          align: 'center',
          key: 'cnName'
        }, {
          title: '操作',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return h('Button', {
              props: {
                size: 'small',
                type: 'error'
              },
              on: {
                'click': () => {
                  this.addProductValue.splice(params.index, 1);
                }
              }
            }, '删除');
          }
        }
      ],
      data2: [],
      modal1: false,
      pageParamsStatus: false,
      pageLoading: false,
      totalPage: 0,
      total: 0,
      curPage: 1,
      carrierKey: 'speedpak',
      pageParams: {
        'carrierCode': 'speedpak', // 物流商编码 edis传 speedpak ,
        'pageNum': 1,
        'pageSize': 20,
        'saleAccountIdList': [],
        'skuList': [],
        'goodsCnName': null
      },
      openTalg: ''
    };
  },
  created () {
    this.pageLoading = true;
    this.tableHeight = this.getTableHeight(300);
    this.$common.promiseAll([
      () => {
        return this.getShop();
      }
    ]).finally(() => {
      this.pageLoading = false;
      this.pageParamsStatus = true;
    })
  },
  props: {},
  watch: {
    pageParamsStatus (n) {
      if (n) {
        this.getPermission('carrierGoodsBattery_query') ? this.getList() : this.gotoError();
        this.pageParamsStatus = false;
      }
    }
  },
  methods: {
    reset () {
      this.$refs.formeParams.resetFields();
    },
    setParams (batteryArr) {
      return {
        batteries: batteryArr.map(i => {
          return {
            'account': i.account,
            'batteryId': i.batteryId,
            'batteryName': i.batteryName,
            'batteryType': i.batteryType,
            'saleAccountId': i.saleAccountId,
            'miniBatteryType': i.miniBatteryType
          };
        }),
        'carrierCode': this.carrierKey,
        'productGoodsIds': this.addProductValue.map(i => i.productGoodsId)
      };
    },
    addQualification () {
      if (this.addLoading) return;
      let batteryArr = this.addCQList.filter(i => {
        // if (i.account && (i.batteryId || i.miniBatteryType)) {
        //   return i;
        // }
        if (i.account && i.batteryId) {
          return i;
        }
      });
      if (batteryArr.length === 0) {
        // this.$Message.error('账号或带电资质类型或带电类型不能为空');
        this.$Message.error('账号、带电资质类型不能为空');
        return;
      }
      if (this.addProductValue.length === 0) {
        this.$Message.error('请选择商品');
        return;
      }
      let params = this.setParams(batteryArr);
      this.addLoading = true;
      this.axios.post(api.add_carrierGoodsBattery, params).then(response => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功');
          this.modal1 = false;
          this.search();
        } else {
          this.$Message.error('添加失败');
        }
        this.$nextTick(() => {
          this.addLoading = false;
        })
      }).catch(() => {
        this.$nextTick(() => {
          this.addLoading = false;
        })
      })
    },
    pushCQ () {
      this.addCQList.push({
        saleAccountId: '',
        qualification: '',
        qualificationList: [],
        electrizationList: this.electrization
      });
    },
    delCQ (index) {
      this.addCQList.splice(index, 1);
    },
    openProductFn () {
      this.$refs.matchingGoodsModal.matchingGoodsStatus = true;
      this.$refs.matchingGoodsModal.matchingGoodsModal = true;
      this.openTalg = 'set_focus';
    },
    addProductSave (data) {
      this.addProductValue = data;
      this.$refs.matchingGoodsModal.matchingGoodsModal = false;
    },
    // 获取店铺 查询所有店铺  目前平台只有ebay
    getShop () {
      return new Promise((resolve) => {
        let newArr = ['ebay'];
        this.axios.post(api.get_shopList + '?checkUser=false&time=' + new Date().getTime(), JSON.stringify(newArr)).then(response => {
          if (response.data.code === 0) {
            this.shopList = response.data.datas;
            response.data.datas.forEach(item => {
              this.$set(this.shopInfoJson, item.saleAccountId, item)
            })
          }
        }).finally(() => {
          resolve(true);
        })
      })
    },
    search () {
      this.curPage = 1;
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
    },
    setNull (obj) {
      for (let key in obj) {
        if (obj[key] === '') {
          obj[key] = null;
        }
      }
      return obj;
    },
    getPageParams () {
      let params = this.$common.copy(this.pageParams);
      params = this.setNull(params);
      return params;
    },
    getList () {
      // 查询列表数据
      let params = this.getPageParams();
      this.loadingTrue();
      this.axios.post(api.get_carrierGoodsBattery, params).then(response => {
        if (response.data.code === 0) {
          this.checkData = [];
          this.loadingFalse();
          this.data1 = response.data.datas.list;
          this.total = response.data.datas.total;
        }
      }).catch(() => {
        this.loadingFalse();
      });
    },
    // 打开新增对照弹窗
    openModal1 () {
      // 打开新增资质对照
      this.addCQList = [
        {
          account: '',
          qualification: '',
          qualificationList: [],
          electrizationList: this.electrization
        }
      ];
      this.addProductValue = [];
      this.modal1 = true;
      this.addLoading = false;
      this.$nextTick(() => {
        this.$refs.shopListModalRef[0].query = '';
        this.$refs.shopListModalRef[0].focusIndex = -1;
        this.$refs.qualificationListModal[0].query = '';
        this.$refs.qualificationListModal[0].focusIndex = -1;
      });
    },
    delQualification ({ id, type = 'single' }) {
      // 删除资质 type single 单个删除  batch 批量删除
      // 查询列表数据
      if (type === 'single') {
        this.isDelModal(() => {
          this.axios.delete(api.del_carrierGoodsBattery + id).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success('操作成功');
              this.search();
            }
          });
        });
        return;
      }
      // 批量删除时
      if (['batch', 'all'].includes(type)) {
        let params = null;
        let total = 0;
        let apiUrl = api.del_carrierGoodsBatteryBatch;
        if (type == 'batch') {
          if (this.checkData.length === 0) {
            this.$Message.info('未选择数据');
            return;
          }
          params = this.checkData.map(i => i.carrierGoodsBatteryId);
          total = this.checkData.length;
        } else {
          params = this.getPageParams();
          apiUrl = api.del_deleteByAllList;
          total = this.total;
          delete params.pageSize;
          delete params.pageNum;
        }
        this.isDelModal(() => {
          this.axios.post(apiUrl, params).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success('操作成功');
              this.search();
            }
          });
        }, null, total)
      }
    },
    addQualificationChange (value, index) {
      if (this.$common.isEmpty(value)) {
        this.addCQList[index].qualificationList = [];
        this.addCQList[index].electrizationList = [];
        this.$set(this.addCQList[index], 'batteryId', '');
        this.addCQList[index].batteryName = '';
        this.addCQList[index].batteryType = '';
        return;
      }
      // 添加资质对照
      this.shopList.forEach(i => {
        if (i.account === value) {
          this.addCQList[index].saleAccountId = i.saleAccountId;
        }
      });
      this.axios.get(api.get_queryCarrierBattery + '?carrierCode=' + this.carrierKey + '&account=' + value).then(response => {
        if (response.data.code === 0) {
          this.addCQList[index].qualificationList = (response.data.datas || []).filter(item => {
            return !this.$common.isEmpty(item.batteryId);
          })
          this.addCQList[index].electrizationList = this.electrization;
        }
      });
    },
    qualificationChange (value, index) {
      this.$set(this.addCQList[index], 'batteryId', value);
      this.addCQList[index].qualificationList.forEach(i => {
        if (i.batteryId === value) {
          this.addCQList[index].batteryName = i.batteryName;
          this.addCQList[index].batteryType = i.batteryType;
        }
      });
    },
    // 打开导入对照弹窗
    openImportModal () {
      this.switchInportModal = true;
    },
    // 导入对照前处理
    importBefore (file) {
      let fileType = file.type;
      const accept = this.importAccept.split(',');
      let tLowerCaseType = '';
      fileType = accept.find(type => {
        tLowerCaseType = type.trim().toLocaleLowerCase();
        if (tLowerCaseType.includes('/*')) {
          tLowerCaseType = tLowerCaseType.substring(0, tLowerCaseType.indexOf('/*') + 1);
          return fileType.substring(0, tLowerCaseType.length) == tLowerCaseType;
        }
        return tLowerCaseType == fileType;
      });
      if (this.$common.isEmpty(fileType)) {
        this.$Message.error('文件格式有误，请选择表格文件');
        return false;
      }
      this.importFile = file;
      return false;
    },
    // 导入对照处理
    importUpload () {
      this.importModalLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('file', this.importFile);
      this.axios.post(`${this.importUrl}?carrierCode=${this.carrierKey}`, newForm, { isCache: false }).then(res => {
        if (!res || !res.data || res.data.code != 0) return;
        this.importFile = null;
        this.getList();
      }).finally(() => {
        this.importModalLoading = false;
      })
    },
    // 关闭导入对照弹窗
    uploadCancel () {
      this.switchInportModal = false;
      this.importFile = null;
    },
    // 下载导入对照模板
    downloadImportModule () {
      window.open(`${this.filenodeViewTargetUrl}/wms-service/template/batteryImpoerTemplate.xlsx`, '_self');
    },
    checkDataMt (data) {
      this.checkData = data;
    }
  }
};
</script>

<style scoped>
</style>
