<template>
  <div>
    <h2>已入库产品出库流程</h2>
    <Form ref="receivedProApplyForm" class="mt20" :model="receivedProApplyForm" :label-width="120" :rules="ruleValidate">
      <div style="display: flex">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size: 18px; font-weight: 700">产品到货出库信息申请</span>
      </div>
      <Divider />
      <Row>
        <Col :span="6">
        <FormItem label="处理编号:">
          <span>保存后创建</span>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="创建人:">
          <span>{{ userInfo.userName }}</span>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="所属事业部:">
          <span>{{ businessDept }}</span>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="申请日期:" prop="applyTime">
          <DatePicker :value="receivedProApplyForm.applyTime" type="date" placeholder="选择日期" style="width: 200px"
            @on-change="getApplyTime" format="yyyy-MM-dd">
          </DatePicker>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="收件供应商名称:" prop="supplierId">
          <dyt-select v-model="receivedProApplyForm.supplierId" clearable filterable>
            <Option v-for="(item, index) in supplierArr" :value="item.supplierId" :key="index">{{ item.supplierName }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="结算方式:">
          <!-- <Input v-model="receivedProApplyForm.settlementTypeName"/> -->
          <!-- <dyt-select v-model="receivedProApplyForm.settlementTypeName" clearable filterable>
            <Option v-for="(item, index) in settlementMethodArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}
            </Option>
          </dyt-select> -->
          {{ showText('settlementTypeName', receivedProApplyForm.settlementTypeName) }}
        </FormItem>
        </Col>
        <Col :span="12">
        <FormItem label="供应商收件信息:">
          <Input v-model="receivedProApplyForm.supplierReceivingInfo" />
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="出库原因:" prop="pickingReason">
          <dyt-select v-model="receivedProApplyForm.pickingReason" clearable filterable>
            <Option v-for="(item, index) in outboundReasonList" :value="item.value" :key="index">{{ item.label }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="申请出库总金额:">
          {{ receivedProApplyForm.stockApplyTotalAmount }}元
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="申请出库总数量:">
          {{ receivedProApplyForm.actualStockNumber }}件
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="需抵/退还金额:">
          {{ receivedProApplyForm.returnTotalAmount }}元
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="申请补充说明:">
          <Input v-model="receivedProApplyForm.applyRemark" :maxlength="200" />
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="仓库:" prop="warehouseId">
          <dyt-select v-model="receivedProApplyForm.warehouseId" clearable filterable>
            <Option v-for="(item, index) in warehouseList" :value="item.id" :key="index">{{ item.name }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="申请出库明细">
          <div v-if="!receivedProApplyForm.applyDetailFilePath">
            <Upload ref="excelUploadRef" name="files" accept=".xlsx,.xls" :show-upload-list="true"
              :before-upload="fileUploadBefore" :action="uploadFilesUrl" :max-size="10240" class="upload-item">
              <div class="upload-icon">
                <Button type="primary">
                  <Icon type="ios-cloud-upload" />
                  上传
                </Button>
              </div>
              <Spin v-if="isUploadLoading" fix></Spin>
            </Upload>
          </div>
          <div v-else>
            <Icon type="ios-paper" size="20" color="green" />
            {{ receivedProApplyForm.applyDetailFileName }}
            <Icon type="md-eye" size="20" class="ml10" style="cursor: pointer" @click="getDetailsExcel('see')" />
            <Icon type="md-download" size="20" class="ml20" style="cursor: pointer"
              @click="getDetailsExcel('download')" />
            <Icon type="ios-trash" size="20" class="ml20" style="cursor: pointer" @click="getDetailsExcel('delete')" />
          </div>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="到货异常编号:" prop="abnormalArrivalNo">
          <Input v-model="receivedProApplyForm.abnormalArrivalNo" :maxlength="17" />
        </FormItem>
        </Col>
      </Row>
      <div class="mt20" style="display: flex">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size: 18px; font-weight: 700">出库明细列表</span>
      </div>
      <Divider />
      <div class="flexBox mt20">
        <Button type="primary" @click="addGoods">添加商品</Button>
        <Button type="primary" class="ml10" @click="importExcel = true">Excel导入</Button>
      </div>
      <div class="normalTop">
        <Table :border="true" :columns="goodsColumn" :data="tableData"
          :height="pagination.total > 8 ? 450 : 0" class="demandTableStyle"
        >
          <template slot-scope="{ index }" slot="returnNumber">
            <FormItem class="mt20" :label-width="0" :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.returnNumber'
              " :rules="{required: true, type: 'number', message: '请填写', trigger: 'change',}"
            >
              <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].returnNumber" :min="1" :precision="0"></InputNumber>
            </FormItem>
          </template>
          <template slot-scope="{ index }" slot="price">
            <FormItem class="mt20" :label-width="0" :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.price'"
              :rules="{ validator: validPrice, trigger: 'change' }">
              <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].price" :min="1"></InputNumber>
            </FormItem>
          </template>
          <template slot-scope="{ index }" slot="stockReason">
            <FormItem class="mt20" :label-width="0">
              <Input v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].stockReason"
              placeholder="请输入" :maxlength="200" type="textarea" :rows="3" show-word-limit></Input>
            </FormItem>
          </template>
          <template slot-scope="{ index }" slot="discount">
            <FormItem class="mt20" :label-width="0" :prop="'wmsGoodsStockApplyDetailList.' + (tableIndex + index) + '.discount'"
              :rules="{ validator: validDiscount, trigger: 'change' }">
              <InputNumber v-model="receivedProApplyForm.wmsGoodsStockApplyDetailList[(tableIndex + index)].discount"></InputNumber>
            </FormItem>
          </template>
        </Table>
        <Page
          class="mt10"
          style="text-align: right;"
          :total="pagination.total"
          @on-change="pageNumChange"
          show-total
          :page-size="pagination.pageSize"
          show-elevator
          :current="pagination.pageNum"
          show-sizer
          @on-page-size-change="pageSizeChange"
          placement="top"
          :page-size-opts="pageArray"
        />
      </div>
      <!--添加商品-->
      <div v-if="isShowAddPro">
        <Modal v-model="isShowAddPro" :width="1100" title="添加商品" :styles="{ top: '50px' }" :mask-closable="false"
          class="addProductModal1 headerBar addProductBar">
          <addProduct :disabledSlt="false" :from="true" @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel"></addProduct>
        </Modal>
      </div>
      <Spin v-if="loading" fix></Spin>
      <!-- Excel导入 -->
      <Modal v-model="importExcel" title="导入模板" @on-ok="importExcel = false" class-name="verticalCenterModal"
        @on-cancel="importExcel = false" :styles="{ top: '280px' }" width="400">
        <template v-if="uploadList.length == 0 ||
          (uploadList.length > 0 &&
            uploadList[uploadList.length - 1].status === 'finished')
          ">
          <div style="text-align: center; margin: 20px 0">
            <Upload ref="import" type="drag" :format="['XLS', 'XLSX']" :action="action" name="file" :headers="headObj"
              :on-success="okUpload" :on-error="uploadError" :show-upload-list="false" :onFormatError="formatError">
              <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="60"></Icon>
                <p>导入</p>
              </div>
            </Upload>
          </div>
          <div style="text-align: center">
            <a href="javascript:void(0)" @click="downloadEcxel()">下载Excel文件模板</a>
          </div>
        </template>
        <template v-else>
          <div style="margin: 20px 0">
            <Progress v-if="uploadList[uploadList.length - 1].showProgress"
              :percent="uploadList[uploadList.length - 1].percentage" hide-info></Progress>
          </div>
        </template>
        <div slot="footer"></div>
      </Modal>
    </Form>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import addProduct from "@/components/common/addProduct";
export default {
  mixins: [Mixin],
  components: { addProduct },
  props: {
    problemPieceData: {
      type: Object,
      default() { return {} }
    },
    abnormalData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      pageArray: [10, 20, 50, 100],
      pagination: {
        total: 0,
        pageNum: 1,
        pageSize: 20,
      },
      tableData: [],
      receivedProApplyForm: {
        applyTime: null,
        settlementTypeName: null,
        supplierReceivingInfo: null,
        pickingNo: null,
        pickingReason: null,
        applyRemark: null,
        warehouseId: null,
        supplierId: null,
        applyDetailFilePath: null,
        applyDetailFileName: null,
        stockApplyTotalAmount: null,
        actualStockNumber: null,
        returnTotalAmount: null,
        wmsGoodsStockApplyDetailList: [],
        abnormalArrivalNo: null
      },
      ruleValidate: {
        applyTime: [
          { required: true, message: "请选择日期", trigger: "change" },
        ],
        supplierId: [{ required: true, message: "请选择", trigger: "change" }],
        pickingReason: [
          {
            required: true,
            type: "number",
            message: "请选择",
            trigger: "change",
          },
        ],
        warehouseId: [{ required: true, message: "请选择", trigger: "change" }],
        abnormalArrivalNo: [
          {
            validator: this.checkWhiteSpace,
            trigger: 'change',
            message: '输入值不能包含空格'
          }
        ]
      },
      outboundReasonList: [
        {
          label: "质量问题",
          value: 1,
        },
        {
          label: "入库错误",
          value: 2,
        },
        {
          label: "采多出库",
          value: 3,
        },
        {
          label: "库存报废",
          value: 4,
        },
        {
          label: "滞销/清仓处理",
          value: 5,
        },
        {
          label: "问题商品退货",
          value: 6,
        },
      ],
      supplierArr: [],
      settlementMethodArr: [],
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + "?basePath=/product",
      importExcel: false,
      isShowAddPro: false,
      goodsColumn: [
        {
          key: "goodsInfo",
          align: "center",
          title: "商品信息",
          minWidth: 220,
          render: (h, params) => {
            //  处理-规格
            let spec = "";
            if (
              params.row.productGoodsSpecifications &&
              typeof params.row.productGoodsSpecifications == "object"
            ) {
              spec = params.row.productGoodsSpecifications
                .map((i) => i.name + ":" + i.value)
                .join(",");
            } else {
              spec = params.row.productGoodsSpecifications;
            }

            return h(
              "div",
              {
                style: {
                  display: "flex",
                },
              },
              [
                h("div", { style: {} }, [this.tableImg(h, params, "goodsUrl")]),
                h("div", { class: "ml20" }, [
                  h("div", {}, `SKU：${params.row.skuNo || "-"}`),
                  h("div", {}, `名称：${params.row.goodsName || "-"}`),
                  h(
                    "div",
                    {
                      style: {
                        color: "#7FA37E",
                      },
                    },
                    `${spec || "-"}`
                  ),
                ]),
              ]
            );
          },
        },
        {
          key: "returnNumber",
          title: "预计退货数量",
          align: "center",
          width: 250,
          slot: "returnNumber",
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '预计退货数量'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: "stockReason",
          title: "仓库出库原则",
          width: 280,
          align: "center",
          slot: "stockReason",
          // render: (h, params) => {
          //   return h('Input', {
          //     props: {
          //       placeholder: '请输入',
          //       maxlength: 200,
          //       type: 'textarea',
          //       rows: 3,
          //       showWordLimit: true
          //     }
          //   }, params.row.stockReason)
          // }
        },
        {
          key: "price",
          title: "采购价格",
          align: "center",
          width: 250,
          slot: "price",
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '采购价格'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: "discount",
          title: "折扣方案",
          align: "center",
          width: 250,
          slot: "discount",
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {}, '折扣方案'),
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px'
                }
              }, '*'),
            ])
          }
        },
        {
          key: "opeation",
          title: "操作",
          width: 200,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  color: "red",
                  cursor: "pointer",
                },
                on: {
                  click: () => {
                    this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach(
                      (item, index) => {
                        if (item.goodsId == params.row.goodsId) {
                          this.receivedProApplyForm.wmsGoodsStockApplyDetailList.splice(
                            index,
                            1
                          );
                        }
                      }
                    );
                  },
                },
              },
              "删除"
            );
          },
        },
      ],
      action: api.import_goodsStockApply,
      uploadList: [],
      loading: false,
    };
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo;
    },
    businessDept() {
      let businessDeptInfo = {};
      let authInfo = this.$store.state.authUserInfo;
      if (this.$common.isEmpty(this.$store.getters["businessDeptList"]))
        return businessDeptInfo;
      this.$store.getters["businessDeptList"].forEach((item) => {
        businessDeptInfo[item.id] = item;
      });
      let data = businessDeptInfo[authInfo.securityUser.businessDeptId] || {};
      return data.name;
    },
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters["allowBusinessDeptIds"].join(",");
    },
    // 当前表格起始下标
    tableIndex () {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize;
    }
  },
  watch: {
    "receivedProApplyForm.supplierId": {
      handler(newVal, oldVal) {
        this.supplierArr.forEach((item) => {
          if (item.supplierId === newVal) {
            this.receivedProApplyForm.settlementTypeName = item.settlementType;
            this.receivedProApplyForm.supplierReceivingInfo =
              item.supplierReceivingInfo;
          }
        });
      },
    },
    "receivedProApplyForm.wmsGoodsStockApplyDetailList": {
      handler(newVal, oldVal) {
        let stockApplyTotalAmount =
          this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce(
            (pre, next) => {
              return pre + next.price * next.returnNumber;
            },
            0
          );
        let actualStockNumber =
          this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce(
            (pre, next) => {
              return pre + next.returnNumber;
            },
            0
          );
        let returnTotalAmount =
          this.receivedProApplyForm.wmsGoodsStockApplyDetailList.reduce(
            (pre, next) => {
              return pre + next.price * next.returnNumber * next.discount;
            },
            0
          );
        this.receivedProApplyForm.stockApplyTotalAmount = parseFloat(
          stockApplyTotalAmount.toFixed(2)
        );
        this.receivedProApplyForm.actualStockNumber = parseFloat(
          actualStockNumber.toFixed(2)
        );
        this.receivedProApplyForm.returnTotalAmount = parseFloat(
          returnTotalAmount.toFixed(2)
        );
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.getAllWarehouse().finally(() => {
      this.initCreateData();
    })
    this.getSupplierArr();
  },
  methods: {
    // http://192.168.91.3/www/index.php?m=task&f=view&taskID=9433 相关需求
    initCreateData() {
      let data = this.problemPieceData;
      if (this.$common.isEmpty(data)) return;
      this.receivedProApplyForm.applyTime = this.$common.dayjs().format('YYYY-MM-DD');
      this.receivedProApplyForm.pickingReason = 6;
      const defaultWarehouseName = 'temu虚拟仓';
      let wareItem = this.warehouseList.filter(k => {
        return k.name.toLowerCase() === defaultWarehouseName;
      })[0] || {};
      this.receivedProApplyForm.warehouseId = wareItem.id;

      // 供应商收件信息 收件人名称+空格+联系电话+空格+退货地址地区+空格+详细地址
      let receiveParams = ['receipterName', 'telephone', 'rCityName', 'rAddress'];
      let supplierReceivingInfo = '';
      receiveParams.forEach(k => {
        if (data[k]) supplierReceivingInfo += ' ' + data[k];
      });
      this.receivedProApplyForm.supplierReceivingInfo = supplierReceivingInfo;

      // 相同sku，累计数量
      let tableList = {};
      (data.tableList || []).forEach(k => {
        k.productGoodsSpecifications = k.goodsAttributes;
        if (tableList[k.sku]) {
          tableList[k.sku].remainNumber += k.remainNumber;
        } else {
          tableList[k.sku] = k;
        }
      })
      this.addProductSuccess(Object.values(tableList));
    },
    // 如果从到货异常处理跳转过来进行数据初始化 需求：http://192.168.91.3/www/index.php?m=task&f=view&taskID=9602
    initAbnormalData() {
      if(this.$common.isEmpty(this.abnormalData)) return;
      this.receivedProApplyForm.supplierId = this.abnormalData.receiptSupplierId
      this.receivedProApplyForm.abnormalArrivalNo = this.abnormalData.abnormalArrivalNo
      this.receivedProApplyForm.wmsGoodsStockApplyDetailList = this.abnormalData.wmsGoodsStockApplyDetailList
      this.receivedProApplyForm.pickingReason = 6;
      this.searchTable();
      // 需求变更 http://192.168.91.3/www/index.php?m=task&f=view&taskID=9602
      // 在这里的所属事业部需要使用到货异常的采购员的事业部
      // let bList = this.$common.isEmpty(this.$store.getters["businessDeptList"]) ? [] : this.$store.getters["businessDeptList"]
      //   bList.forEach(item => {
      //     if(item.name == this.abnormalData.businessDeptName) {
      //       this.receivedProApplyForm.businessDeptId = item.id
      //     }
      //   }) 
    },
    getSupplierArr() {
      this.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            this.settlementMethodArr = res.data.datas;
          }
        });
      this.axios
        .post(
          `${api.get_SupplierInfo}?businessDeptIds=${this.allowBusinessDeptIds}`
        )
        .then((res) => {
          if (res.data.code === 0) {
            this.supplierArr = res.data.datas.map((item) => {
              let supplierReceivingInfo = "";
              supplierReceivingInfo = `${item.contactMan ? item.contactMan : ""
              }  ${item.telephone ? item.telephone : ""}  ${item.rAddress ? item.rAddress : ""
              }  ${item.rAddressDetail ? item.rAddressDetail : ""} `;
              supplierReceivingInfo = this.$common.isEmpty(
                supplierReceivingInfo.trim()
              )
                ? "--"
                : supplierReceivingInfo;
              return {
                ...item,
                supplierReceivingInfo: supplierReceivingInfo,
              };
            });
          }
          this.initAbnormalData();
        });
    },
    // 上传excel
    fileUploadBefore(file) {
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type)) {
        this.$Message.error("文件格式不对，请上传xlsx、xls格式的文件");
        return false;
      }
      // this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append("files", file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${Math.random().toString().substring(2, 5) +
        new Date().getTime().toString()
      }`;
      this.axios
        .post(uploadUrl, newForm)
        .then((res) => {
          if (!res || res.data.code != 0) return;
          this.receivedProApplyForm.applyDetailFilePath = res.data.datas[0];
          this.receivedProApplyForm.applyDetailFileName = file.name;
        })
        .finally(() => {
          this.isUploadLoading = false;
        });
      return false;
    },
    // 对excel文件进行下载、预览、删除操作
    getDetailsExcel(type) {
      if (type == "download") {
        window.open(
          "./filenode/s" + this.receivedProApplyForm.applyDetailFilePath
        );
      } else if (type == "delete") {
        this.receivedProApplyForm.applyDetailFilePath = null;
        this.receivedProApplyForm.applyDetailFileName = null;
      } else {
        let url = "filenode/s" + this.receivedProApplyForm.applyDetailFilePath;
        let localUrl = window.location.href;
        localUrl = localUrl.split("supplierPurchase")[0];
        // 在线预览excel
        window.open(
          `https://view.officeapps.live.com/op/view.aspx?src=${(localUrl +=
            url)}`
        );
      }
    },
    // 选择成功回调
    addProductSuccess(data) {
      let arr = [];
      data.forEach((n, i) => {
        let isExist = false;
        this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach(
          (m, j) => {
            if (n.productGoodsId == m.goodsId) {
              // 如果该商品存在，数量+1
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList[
                j
              ].returnNumber += 1;
              isExist = true;
            }
          }
        );
        if (!isExist) {
          // 如果该商品不存在，新增一条数据
          arr.push({
            cnName: n.cnName,
            goodsId: n.productGoodsId,
            goodsUrl: n.goodsUrl,
            sku: n.sku,
            productGoodsSpecifications: n.productGoodsSpecifications,
            remainNumber: n.remainNumber,
          });
        }
      });
      if (arr.length > 0) {
        this.axios.post(api.planQueryGoodsInfo, arr).then((res) => {
          if (res.data.datas && res.data.datas.length > 0) {
            res.data.datas.forEach((i) => {
              arr.forEach((j) => {
                if (i.skuNo === j.sku) {
                  i.productGoodsSpecifications = j.productGoodsSpecifications;
                  i.returnNumber = j.remainNumber || null;
                }
              });
            });
            res.data.datas.forEach((n, i) => {
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(
                Object.assign(n, {
                  // returnNumber: null,
                  stockReason: null,
                  price: null,
                  discount: null,
                  goodsUrl: n.thumbUrl,
                })
              );
            });
            this.searchTable();
          }
        });
      }
      this.isShowAddPro = false;
    },
    // 取消选择回调
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addGoods() {
      this.isShowAddPro = true;
    },
    // 下载导入的模板
    downloadEcxel() {
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/stockGoodsTemplate.xlsx";
      window.location.href = path;
    },
    // 页码改变
    pageNumChange (val) {
      this.pagination.pageNum = val;
      this.searchTable();
    },
    // 列表条数改变
    pageSizeChange (val) {
      this.pagination.pageNum = 1;
      this.pagination.pageSize = val;
      this.searchTable();
    },
    // 列表数据处理
    searchTable () {
      this.$nextTick(() => {
        const pageSize = this.pagination.pageSize;
        const pageNum = this.pagination.pageNum
        this.tableData = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.slice((pageNum - 1) * pageSize, pageNum * pageSize);
        this.pagination.total = this.receivedProApplyForm.wmsGoodsStockApplyDetailList.length;
      });
    },
    // 文件上传成功的回调
    okUpload(data, file, fileList) {
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          if (
            this.receivedProApplyForm.wmsGoodsStockApplyDetailList.length > 0
          ) {
            data.datas.goodsStockInfoVOList.forEach((n, i) => {
              let isExist = false;
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList.forEach(
                (m, j) => {
                  if (n.productGoodsId == m.goodsId || n.goodsId == m.goodsId) {
                    // 如果该商品存在，数量累加
                    this.receivedProApplyForm.wmsGoodsStockApplyDetailList[
                      j
                    ].returnNumber += n.returnNumber;
                    isExist = true;
                  }
                }
              );
              if (!isExist) {
                this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(
                  Object.assign(n, {
                    skuNo: n.goodsSku,
                    goodsName: n.goodsCnDesc,
                    productGoodsSpecifications: n.goodsAttributes,
                  })
                );
              }
            });
          } else {
            data.datas.goodsStockInfoVOList.forEach((n, i) => {
              this.receivedProApplyForm.wmsGoodsStockApplyDetailList.push(
                Object.assign(n, {
                  skuNo: n.goodsSku,
                  goodsName: n.goodsCnDesc,
                  productGoodsSpecifications: n.goodsAttributes,
                })
              );
            });
          }
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          this.importExcel = false;
        }
        this.searchTable();
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      } else if (data.code === 221108) {
        this.$Message.error("文件导入失败");
        this.importExcel = false;
      } else {
        this.$Message.error(data.message);
        this.importExcel = false;
      }
    }, // 上传失败回调
    uploadError() {
      this.$Message.error("导入失败");
      this.importExcel = false;
    },
    // 上传格式错误
    formatError(file) {
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
    },
    // 提交或者暂存
    submitOrSave(type) {
      this.$refs.receivedProApplyForm.validate((valid) => {
        if (valid) {
          let obj = this.$common.copy(this.receivedProApplyForm);
          if (!obj.wmsGoodsStockApplyDetailList.length)
            return this.$Message.error("请添加商品");
          let authInfo = this.$store.state.authUserInfo;
          obj.status = type === "save" ? 1 : 2;
          this.supplierArr.forEach((item) => {
            if (item.supplierId === obj.supplierId) {
              obj.supplierName = item.supplierName;
            }
          });
          obj.wmsGoodsStockApplyDetailList =
            obj.wmsGoodsStockApplyDetailList.map((item) => {
              return {
                goodsId: item.goodsId,
                returnNumber: item.returnNumber,
                price: item.price,
                discount: item.discount,
                stockReason: item.stockReason,
              };
            });
          // obj.businessDeptId = this.$common.isEmpty(this.abnormalData) ? 
          // authInfo.securityUser.businessDeptId : obj.businessDeptId;
          // 需求变更为取创建人事业部 http://192.168.91.3/www/index.php?m=task&f=view&taskID=9602
          obj.businessDeptId = authInfo.securityUser.businessDeptId
          //记账月份更为自动使用创建月份
          obj.tallyTime = this.$common.dayjs().format('YYYY-MM');
          this.loading = true;
          this.axios
            .post(api.add_stockApply, obj)
            .then((res) => {
              if (res.data.code === 0) {
                this.$Message.success("操作成功");
                this.$emit("goBack", true);
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    // 选中申请时间
    getApplyTime(val) {
      this.receivedProApplyForm.applyTime = val;
    },
    // 校验折扣信息
    validDiscount(rule, value, callback) {
      this.$nextTick(() => {
        if (value > 1) {
          this.$Message.error("不能大于1");
          return callback(new Error("不得大于1"));
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          this.$Message.error("小数位数不能超过两位且不为0");
          return callback(new Error("小数位数不得超过两位且不为0"));
        }
        // 校验通过
        callback();
      });
    },
    // 校验采购价格
    validPrice(rule, value, callback) {
      this.$nextTick(() => {
        if (this.$common.isEmpty(value)) {
          this.$Message.error("请填写采购价格");
          return callback(new Error("请填写采购价格"));
        }
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          this.$Message.error("小数位数不能超过两位");
          return callback(new Error("小数位数不得超过两位"));
        }
        // 校验通过
        callback();
      });
    },
    // 检验空格
    checkWhiteSpace(rule, value, callback) {
      if (/\s/.test(value)) {
        callback(new Error('输入值不能包含空格'));
      } else {
        callback();
      }
    },
    showText(type, val) {
      let result = ''
      if(type == 'settlementTypeName' && val) {
        let list =  this.$common.arrayToObj(this.settlementMethodArr, 'dataValue')
        result = list[val] ? list[val].dataDesc : ''
      }
      return result
    }
  },
};
</script>
<style lang="less">
.demandTableStyle {
  .ivu-input-number-handler-wrap {
    display: none;
  }

  .ivu-form-item-error-tip {
    display: none;
  }
}
</style>