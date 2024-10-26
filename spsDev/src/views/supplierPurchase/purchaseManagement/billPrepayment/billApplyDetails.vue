<template>
  <div>
    <div style="display: flex">
      <div style="width: 4px; height: 20px; background: #2c74f6"></div>
      <span class="ml10" style="font-size:18px;font-weight:700">采购申请提交</span>
    </div>
    <Divider />
    <Form ref="billForm" :model="billForm" :label-width="120" :rules="ruleValidate">
      <Row>
        <Col :span="5">
        <FormItem label="供应商名称" prop="supplierId">
          <div v-if="isEdit && billForm.status == 1">
            <dyt-select v-model="billForm.supplierId" clearable placeholder="请选择" @on-change="getAccountPrice">
              <Option v-for="(item, index) in supplierList" :value="item.supplierId" :key="index">{{ item.supplierName }}
              </Option>
            </dyt-select>
          </div>
          <div v-else>
            {{ billForm.supplierName }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="账单月份:" prop="billMonth">
          <div v-if="isEdit && billForm.status == 1">
            <DatePicker transfer type="month" style="width: 100%" v-model="billForm.billMonth" placeholder="选择日期"
              format="yyyy-MM" @on-change="getDateValue"></DatePicker>
          </div>
          <div v-else>
            {{ billForm.billMonth }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="结算方式:" prop="settlementType">
          <div v-if="isEdit && billForm.status == 1">
            <dyt-select v-model="billForm.settlementType" clearable placeholder="请选择">
              <Option v-for="(item, index) in settlementTypeArr" :value="item.dataValue" :key="index">{{ item.dataDesc }}
              </Option>
            </dyt-select>
          </div>
          <div v-else>
            {{ billForm.settlementType }}
          </div>
        </FormItem>

        </Col>
        <Col :span="9">
        <FormItem label="付款信息汇总:" prop="paymentInfo">
          <div v-if="isEdit && billForm.status == 1">
            <Input v-model="billForm.paymentInfo" placeholder="请输入" style="width: 400px" />
          </div>
          <div v-else>
            {{ billForm.paymentInfo }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem prop="receiptTotalPrice">
          <span slot="label">
            <span style="color:red">入库总金额确认:</span>
          </span>
          <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.receiptTotalPrice" :max="1000000000" class="amountInput" placeholder="请输入" />
          </div>
          <div v-else>
            {{ billForm.receiptTotalPrice }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="其他金额:" prop="otherPrice">
          <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.otherPrice" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'otherPrice') }" />
          </div>
          <div v-else>
            {{ billForm.otherPrice }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="其他金额说明:" prop="otherPriceReason">
          <div v-if="isEdit && billForm.status == 1">
            <Input v-model="billForm.otherPriceReason" :maxlength="200" placeholder="请输入" />
          </div>
          <div v-else>
            {{ billForm.otherPriceReason }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem prop="totalPayAmount">
          <span slot="label">
            <span style="color:red">实际应付金额:</span>
          </span>
          <div v-if="isEdit && billForm.status == 1">
            <!-- <InputNumber v-model="billForm.totalPayAmount" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'totalPayAmount') }" /> -->
          </div>
          <div>
            {{ billForm.totalPayAmount }}
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem label="账单明细表">
          <div v-if="!billForm.billDetailExcelUrl">
            <div v-if="billForm.status === 1 && isEdit">
              <Upload ref="excelUploadRef" name="files" :show-upload-list="true" :before-upload="fileUploadBefore"
                :action="uploadFilesUrl" :max-size="10240" class="upload-item">
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
              -
            </div>
          </div>
          <div v-else>
            <Icon type="ios-paper" size="20" color="green" />
            {{ billForm.billDetailExcelName }}
            <Icon type="md-eye" size="20" class="ml10" style="cursor:pointer" @click="getBillExcel('see')" />
            <Icon type="md-download" size="20" class="ml20" style="cursor:pointer" @click="getBillExcel('download')" />
            <Icon type="ios-trash" v-if="isEdit && billForm.status == 1" size="20" class="ml20" style="cursor:pointer"
              @click="getBillExcel('delete')" />
          </div>
        </FormItem>
        </Col>
        <Col :span="5">
        <FormItem prop="monthUnpaidPrice">
          <span slot="label">
            <span style="color:red">月总剩未付:</span>
          </span>
          <div>
            {{ billForm.monthUnpaidPrice }}
          </div>
        </FormItem>
        </Col>
      </Row>
      <div style="display: flex" class="mt20">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size:18px;font-weight:700">抵/减/扣 项目及金额</span>
      </div>
      <Divider />
      <Row>
        <Col :span="6">
        <FormItem prop="freightReduction" :label-width="140">
          <div slot="label">
            <span style="color:red">运费抵/退金额汇总:</span>
          </div>
          <!-- <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.freightReduction" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'freightReduction') }" disabled />
          </div> -->
          <div>
            {{ billForm.freightReduction }}
          </div>
        </FormItem>
        </Col>
        <Col :span="18">
        <FormItem prop="outboundPriceReduction" :label-width="140">
          <div slot="label">
            <span style="color:red">出库抵/退金额汇总:</span>
          </div>
          <!-- <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.outboundPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'outboundPriceReduction') }" disabled />
          </div> -->
          <div>
            {{ billForm.outboundPriceReduction }}
          </div>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="供应商扣/罚金额汇总:" prop="supplierPriceReduction" :label-width="140">
          <!-- <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.supplierPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'supplierPriceReduction') }" disabled />
          </div> -->
          <div>
            {{ billForm.supplierPriceReduction }}
          </div>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="另抵/退/扣/减金额汇总:" prop="otherPriceReduction" :label-width="140">
          <!-- <div v-if="isEdit && billForm.status == 1">
            <InputNumber v-model="billForm.otherPriceReduction" :max="1000000000" class="amountInput" placeholder="请输入"
              @on-change="(e) => { changeNum(e, 'otherPriceReduction') }" disabled />
          </div> -->
          <div >
            {{ billForm.otherPriceReduction }}
          </div>
        </FormItem>
        </Col>
        <Col :span="6">
        <FormItem label="抵/退/扣/减补充说明:" prop="reductionReason" :label-width="140">
          <div v-if="isEdit && billForm.status == 1">
            <Input style="width: 400px" v-model="billForm.reductionReason" :maxlength="200" placeholder="请输入" />
          </div>
          <div v-else>
            {{ billForm.reductionReason }}
          </div>
        </FormItem>
        </Col>
      </Row>
      <div style="display: flex" class="mt20">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size:18px;font-weight:700">财务付款进度说明</span>
      </div>
      <Row>
        <Col :span="24">
        <span class="ml20">财务付款情况说明</span>
        </Col>
        <Col :span="24" v-if="billForm.status !== 4 || !isEdit">
        <Button class="ml20 mt10" type="primary" @click="exportBtn">
          excel导出
          <Icon type="md-download" />
        </Button>
        </Col>
        <Col :span="24">
        <Table highlight-row class="ml20 mt10" style="width: 1200px" :border="true" :columns="billFormColumns"
          :data="billForm.spsSupplierBillApplyPaymentList">
          <!-- 付款时间 -->
          <template slot-scope="{ row }" slot="payTime">
            <FormItem :label-width="0" :prop="'spsSupplierBillApplyPaymentList.' + row._index + '.payTime'"
              :rules="{ required: true, message: ' ', trigger: 'change' }">
              <div v-if="isEdit && billForm.status === 4" class="mt10">
                <DatePicker v-model="billForm.spsSupplierBillApplyPaymentList[row._index].payTime" transfer type="date"
                  format="yyyy-MM-dd" style="width: 100%" @on-change="(e) => { getBillDateValue(e, row._index) }">
                </DatePicker>
              </div>
              <div v-else class="mt10">
                {{ billForm.spsSupplierBillApplyPaymentList[row._index].payTime }}
              </div>
            </FormItem>
          </template>
          <!-- 付款金额 -->
          <template slot-scope="{ row }" slot="payAmount">
            <FormItem :label-width="0" :prop="'spsSupplierBillApplyPaymentList.' + row._index + '.payAmount'" :rules="[
              { required: true, type: 'number', message: ' ', trigger: 'change' },
              { validator: validNum, trigger: 'change' }
            ]">
              <div v-if="!isEdit || billForm.status !== 4">
                {{ billForm.spsSupplierBillApplyPaymentList[row._index].payAmount }}
              </div>
              <div v-else class="mt10">
                <InputNumber class="amountInput" style="width: 100px"
                  v-model="billForm.spsSupplierBillApplyPaymentList[row._index].payAmount"
                  :disabled="!isEdit || billForm.status !== 4" :min="0"
                  @on-change="(val) => { changePayment(val, row._index) }"></InputNumber>
              </div>
            </FormItem>
          </template>
          <!-- 付款水单 -->
          <template slot-scope="{ row }" slot="paymentReceiptUrl">
            <div v-if="isEdit && billForm.status === 4">
              <div class="form-pic-item">
                <!-- <Poptip trigger="hover" transfer placement="top"> -->
                <div class="pic-item-view" v-if="billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl">
                  <largePicture
                    :url="`./filenode/s${billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl}`"
                    :picStyle="{
                      height: '60px',
                      width: '60px'
                    }" v-if="billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl">
                    <slot name="picslot"></slot>
                  </largePicture>
                  <div class="pic-view-cover">
                    <div class="pic-view-btn">
                      <Icon title="删除" type="ios-trash-outline" @click.native="removeImg(row._index)" />
                    </div>
                  </div>
                </div>
                <!-- <div class="image-preview-content" slot="content">
                    <img style="width:350px" :src="`./filenode/s${billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl}`" />
                  </div> -->
                <!-- </Poptip> -->
                <Upload v-if="!billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl" ref="imgUploadRef"
                  name="files" :show-upload-list="false" :multiple="true" accept="image/*"
                  :before-upload="(file) => { imgFileUploadBefore(file, row._index) }" :action="uploadFilesUrl"
                  :max-size="5120" class="upload-item">
                  <div class="upload-icon">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                  <Spin v-if="isUploadLoading" fix></Spin>
                </Upload>
              </div>
            </div>
            <div v-else>
              <div class="form-pic-item">
                <!-- <Poptip transfer trigger="hover" placement="top" v-if="billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl">
                  <div class="pic-item-view">
                    <img :src="`./filenode/s${billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl}`" />
                  </div>
                  <div slot="content">
                    <img style="width:350px" :src="`./filenode/s${billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl}`" />
                  </div>
                </Poptip> -->
                <largePicture
                  :url="`./filenode/s${billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl}`"
                  :picStyle="{
                    height: '60px'
                  }" v-if="billForm.spsSupplierBillApplyPaymentList[row._index].paymentReceiptUrl">
                  <slot name="picslot"></slot>
                </largePicture>
              </div>
            </div>
          </template>
          <!-- 付款说明 -->
          <template slot-scope="{ row }" slot="paymentReason">
            <div v-if="isEdit && billForm.status === 4">
              <Input v-model="billForm.spsSupplierBillApplyPaymentList[row._index].paymentReason" :maxlength="200" />
            </div>
            <div v-else>
              <Tooltip transfer :max-width="300" placement="right-start">
                <div slot="content">
                  <div>{{ billForm.spsSupplierBillApplyPaymentList[row._index].paymentReason }}</div>
                </div>
                <div style="width:350px ;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis">
                  {{ billForm.spsSupplierBillApplyPaymentList[row._index].paymentReason }}
                </div>
              </Tooltip>
            </div>
          </template>
        </Table>
        </Col>
        <Col :span="24">
        <div class="mt10 ml20" v-if="billForm.status === 4 && isEdit">
          <Button type="primary"
            v-if="billForm.monthUnpaidPrice !== 0 && this.getPermission('supplierBillApply_addPayment')"
            @click="operationTable('add')">
            <Icon type="md-add" />新增
          </Button>
          <Button type="error" class="ml10" v-if="billForm.spsSupplierBillApplyPaymentList.length !== 0
            && this.getPermission('supplierBillApply_delPayment')" @click="operationTable('delete')">
            <Icon type="md-backspace" />删除
          </Button>
        </div>
        </Col>
      </Row>
      <div style="display: flex" class="mt20">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size:18px;font-weight:700">备注</span>
        <Icon type="md-add" class="addIcon" @click="addRemark" />
      </div>
      <Row>
        <Col :span="24" class="mb20">
        <div style="width: 100%; margin-left: 5px; font-size: 12px">
          <div v-for="(item, index) in billForm.spsSupplierBillApplyRemarkList" :key="index" class="remarkItemTextarea">
            <div style="display: flex">
              <div style="width: 130px">{{ item.createdTime || "--" }}</div>
              <div style="
                          margin-left: 10px;
                          width: 110px;
                          word-wrap: break-word;
                          text-align: right;
                        ">
                {{ item.createdBy + "：" || "--" }}
              </div>
              <div class="itemRemark" style="width: 1100px">
                {{ item.remark || "--" }}
              </div>
            </div>
          </div>
        </div>
        <div class="remarkItemTextarea">
          <div style="display: flex" v-if="isRemarkEdit">
            <Input type="textarea" v-model="remarkInp" class="textareaContent" maxlength="500"></Input>
            <Button type="primary" style="margin: 40px 0 0 10px" @click="saveRemark">保存</Button>
          </div>
        </div>
        </Col>
      </Row>
      <div v-if="billForm.status === 6">
        <div style="display: flex" class="mt20">
          <div style="width: 4px; height: 20px; background: #e71627"></div>
          <span class="ml10" style="font-size:18px;font-weight:700">已拒绝</span>
        </div>
        <div class="mt20">拒绝原因:
          <span class="ml20">{{ billForm.cancelReason }}</span>
        </div>
      </div>
      <div style="display: flex" class="mt20">
        <div style="width: 4px; height: 20px; background: #2c74f6"></div>
        <span class="ml10" style="font-size:18px;font-weight:700">操作日志</span>
      </div>
      <Row>
        <Col :span="24" class="mt20">
          <Table
              border
              :columns="orderLogColumns"
              :data="billForm.spsSupplierBillApplyLogList"
              :loading="loading"
              max-height="450"
            ></Table>
        </Col>
      </Row>
    </Form>
    <Modal v-model="rejectModalVisible" title="拒绝确认" @on-ok="cancelBill">
      <div>请填写拒绝原因：</div>
      <Input v-model="cancelReason" :rows="3" type="textarea" :maxlength="150" show-word-limit></Input>
      <div style="color:red" class="mt10">
        拒绝导致此账单变状态变更为“已作废"状态
      </div>
    </Modal>
    <Spin v-if="loading" fix></Spin>
  </div>
</template>
<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import { time_now } from "@/utils/comfun.js";
import largePicture from "@/components/largePicture";

export default {
  mixins: [Mixin],
  components: { largePicture },
  props: {
    billFormData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    settlementTypeArr: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      billForm: {
        supplierId: null,
        settlementType: null,
        paymentInfo: null,
        billMonth: null,
        receiptTotalPrice: null,
        otherPrice: null,
        otherPriceReason: null,
        totalPayAmount: null,
        freightReduction: null,
        outboundPriceReduction: null,
        supplierPriceReduction: null,
        otherPriceReduction: null,
        reductionReason: null,
        billDetailExcelUrl: null,
        billDetailExcelName: null,
        billApplyId: null
      },
      ruleValidate: {
        billMonth: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        supplierId: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        receiptTotalPrice: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' },
          { validator: this.validNum, trigger: 'change' }
        ],
        otherPrice: [
          { validator: this.validNum, trigger: 'change' }
        ],
        totalPayAmount: [
          { required: true, type: 'number', message: '请输入', trigger: 'change' },
          { validator: this.validNum, trigger: 'change' }
        ],
        freightReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        outboundPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        supplierPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ],
        otherPriceReduction: [
          { validator: this.validNum, trigger: 'change' }
        ]
      },
      supplierList: [],
      isUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product',
      loading: false,
      billFormColumns: [
        {
          key: 'serialNumber',
          title: '序号',
          width: 80,
          align: 'center'
        },
        {
          key: 'payTime',
          title: '付款时间',
          width: 260,
          align: 'center',
          slot: 'payTime'
        },
        {
          key: 'payAmount',
          title: '本次付款金额',
          width: 150,
          align: 'center',
          slot: 'payAmount',
          // render: (h, params) => {
          //   return h('InputNumber', {
          //     props: {
          //       value: this.billForm.spsSupplierBillApplyPaymentList[params.row._index].payAmount,
          //       disabled: (this.isEdit && this.billForm.status !== 4) || params.row.billApplyPaymentId,
          //       min: 0,
          //       max: this.billForm.monthUnpaidPrice,
          //       formatter: (value) => {
          //         return parseFloat(Math.floor(value*100)/100)
          //       }
          //     },
          //     on: {
          //       'on-change':(val) => {

          //       }
          //     },
          //     class: 'amountInput',
          //     style: {
          //       width: '100px'
          //     }
          //   }, params.row.payAmount)
          // }
        },
        {
          key: 'remainingUnpaidAmount',
          title: '剩余未付金额',
          width: 160,
          align: 'center'
        },
        {
          key: 'paymentReceiptUrl',
          title: '付款水单',
          width: 130,
          align: 'center',
          slot: 'paymentReceiptUrl'
        },
        {
          key: 'paymentReason',
          title: '付款说明',
          align: 'center',
          slot: 'paymentReason'
        }
      ],
      isRemarkEdit: false,
      remarkInp: '',
      rejectModalVisible: false,
      cancelReason: null,
      orderLogColumns: [
        {
          key: "createdBy",
          title: "操作人", // 操作人
          width: 110,
          render:(h, params) =>{
            // let createdName = ''
            // this.purchaserList.forEach(item => {
            //   if(item.userId === params.row.createdBy){
            //     createdName = item.name
            //   }
            // })
            // createdName = this.$common.isEmpty(createdName) ? params.row.createdBy : createdName
            return h("span",{} ,params.row.createdBy);
          },
        },
        {
          key: "logContentDesc",
          title: "操作内容描述", // 操作内容描述
          minWidth: 230,
          render(h, params) {
            return h("span", params.row.logContentDesc);
          },
        },
        {
          key: "createdTime",
          title: "操作时间", // 操作时间
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              params.row.createdTime
            );
          },
        },
      ],
    }
  },
  created() {
    this.getSupplierList()
  },
  watch: {
    'billForm.supplierId': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.supplierList.forEach(item => {
            if (item.supplierId === newVal) {
              let paymentInfo = this.$common.isEmpty(item.paymentInfoList) ? '' : item.paymentInfoList.join(',')
              this.$set(this.billForm, 'paymentInfo', paymentInfo)
              this.$set(this.billForm, 'settlementType', item.settlementType)
            }
          })
        }
      }
    },
    // 此处由于监听的类型为引用类型，导致old和new会始终相等，因此拆分
    'billForm.receiptTotalPrice': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1 && oldVal) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    'billForm.otherPrice': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1 && oldVal) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    'billForm.freightReduction': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    'billForm.outboundPriceReduction': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    'billForm.supplierPriceReduction': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    'billForm.otherPriceReduction': {
      handler(newVal, oldVal) {
        if (this.billForm.status == 1) {
          this.billForm.totalPayAmount = Number(this.resultAllTotalAmount.toFixed(2))
        }
      }
    },
    billFormData: {
      handler(newVal, oldVal) {
        this.billForm = newVal
        this.billForm.spsSupplierBillApplyLogList = this.billForm.spsSupplierBillApplyLogList 
        ? this.billForm.spsSupplierBillApplyLogList : []
        let pattern = /-/
        if (!pattern.test(this.billForm.billMonth)) {
          const date = new Date(this.billForm.billMonth);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          this.billForm.billMonth = `${year}-${month}`;
        }
        this.billForm.spsSupplierBillApplyPaymentList.forEach(item => {
          item.payTime = this.formatTime(item.payTime)
        })
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    // 获取当前登录账号可查看的事业部ID列表
    allowBusinessDeptIds() {
      return this.$store.getters['allowBusinessDeptIds'].join(',');
    },
    isEdit() {
      return this.billForm.editType === 'edit'
    },
    userName() {
      return this.$store.state.allUser[this.$store.state.userInfo.userId].userName
    },
    maxPaymentNum() {
      let oldSpsSupplierBillApplyPaymentList = this.$common.copy(this.billForm.spsSupplierBillApplyPaymentList)
      oldSpsSupplierBillApplyPaymentList.splice(oldSpsSupplierBillApplyPaymentList.length - 1, 1)
      let max = oldSpsSupplierBillApplyPaymentList.reduce((pre, next) => {
        return pre + next.payAmount
      }, 0)
      return this.billForm.totalPayAmount - max
    },
    resultAllTotalAmount() {
      let result = (this.billForm.receiptTotalPrice + this.billForm.otherPrice)
        - (this.billForm.freightReduction + this.billForm.outboundPriceReduction
          + this.billForm.supplierPriceReduction + this.billForm.otherPriceReduction)
      return result
    }
  },
  methods: {
    time_now,
    // 字符串转日期
    // 获取当前用户下可查看事业部所属供应商
    getSupplierList() {
      this.axios.post(`${api.get_billSupplierInfo}?businessDeptIds=${this.allowBusinessDeptIds}`).then(res => {
        if (res.data.code === 0) {
          this.supplierList = res.data.datas
        }
      })
    },
    // 选择账单时间
    getDateValue(val) {
      this.billForm.billMonth = val
      this.getAccountPrice();
    },
    // 选择账单支付情况时间
    getBillDateValue(val, index) {
      this.billForm.spsSupplierBillApplyPaymentList[index].payTime = val
    },
    // 上传excel
    fileUploadBefore(file) {
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(file.type)) {
        this.$Message.error('文件格式不对，请上传xlsx、xls格式的文件');
        return false;
      }
      // this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.billForm.billDetailExcelUrl = res.data.datas[0]
        this.billForm.billDetailExcelName = file.name
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    //  上传付款水单图片
    imgFileUploadBefore(file, index) {
      if (!file.type.includes('image/')) {
        this.$Message.error('文件格式不对，请上传图片格式的文件');
        return false;
      }
      this.isUploadLoading = true;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
      this.axios.post(uploadUrl, newForm).then(res => {
        if (!res || res.data.code != 0) return;
        this.billForm.spsSupplierBillApplyPaymentList[index].paymentReceiptUrl = res.data.datas[0]
      }).finally(() => {
        this.isUploadLoading = false;
      })
      return false;
    },
    // 对excel文件进行下载、预览、删除操作
    getBillExcel(type) {
      if (type == 'download') {
        window.open('./filenode/s' + this.billForm.billDetailExcelUrl)
      } else if (type == 'delete') {
        this.billForm.billDetailExcelUrl = null
        this.billForm.billDetailExcelName = null
      } else {
        let url = 'filenode/s' + this.billForm.billDetailExcelUrl
        let localUrl = window.location.href
        localUrl = localUrl.split('supplierPurchase')[0]
        // 在线预览excel
        window.open(`https://view.officeapps.live.com/op/view.aspx?src=${localUrl += url}`)
      }
    },
    // 提交或暂存
    saveOrSubmit(type) {
      let obj = this.$common.copy(this.billForm)
      if (obj.totalPayAmount < 0) return this.$Message.error('实际应付总额不能为负数')
      obj.type = type === 'save' ? 0 : 1
      this.$refs.billForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.axios.post(api.add_billApply, obj).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('操作成功')
              this.$emit('goBackForm', true)
            }
            if (res.data.code === 403) return this.$Message.error('暂无添加账单权限')
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    // 同意或拒绝
    agreeOrReject(type) {
      if (type == 'agree') {
        let flag = true
        this.billForm.spsSupplierBillApplyPaymentList =
          this.$common.isEmpty(this.billForm.spsSupplierBillApplyPaymentList) ? [] : this.billForm.spsSupplierBillApplyPaymentList
        this.billForm.spsSupplierBillApplyPaymentList.forEach(item => {
          if (item.remainingUnpaidAmount < 0) return flag = false
        })
        if (!flag) return this.$Message.error('剩余未付金额不小于0')
        // 如果为待付款状态同意前，需要调用保存接口再调用同意接口
        if (this.billForm.status === 4) {
          this.$refs.billForm.validate((valid) => {
            if (valid) {
              this.loading = true
              let objArr = []
              objArr = this.billForm.spsSupplierBillApplyPaymentList
              if (this.$common.isEmpty(objArr)) {
                this.axios.get(`${api.submit_billApply}?billApplyId=${this.billForm.billApplyId}&status=${this.billForm.status}`).then(res => {
                  if (res.data.code == 0) {
                    this.$Message.success('操作成功')
                    this.$emit('goBackForm', true)
                  } else if (res.data.code === 403) return this.$Message.error('暂无同意账单权限')
                }).finally(() => {
                  this.loading = false
                })
              } else {
                let obj = {
                  billApplyId: this.billForm.billApplyId,
                  payAmount: this.billForm.totalPayAmount,
                  spsSupplierBillApplyPaymentList: this.billForm.spsSupplierBillApplyPaymentList
                }
                this.loading = true
                this.axios.post(api.add_billApplyPayment, obj).then(res => {
                  if (res.data.code == 0) {
                    this.axios.get(`${api.submit_billApply}?billApplyId=${this.billForm.billApplyId}&status=${this.billForm.status}`).then(res => {
                      if (res.data.code == 0) {
                        this.$Message.success('操作成功')
                        this.$emit('goBackForm', true)
                      } else if (res.data.code === 403) return this.$Message.error('暂无同意账单权限')
                    }).finally(() => {
                      this.loading = false
                    })
                  } else if (res.data.code === 403) return this.$Message.error('暂无权限')
                })
              }
            }
          })
        } else {
          this.axios.get(`${api.submit_billApply}?billApplyId=${this.billForm.billApplyId}&status=${this.billForm.status}`).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功')
              this.$emit('goBackForm', true)
            } else if (res.data.code === 403) return this.$Message.error('暂无同意账单权限')
          }).finally(() => {
            this.loading = false
          })
        }

      } else {
        this.rejectModalVisible = true
      }
    },
    cancelBill() {
      this.loading = true
      this.axios.get(`${api.cancel_bill}?billApplyId=${this.billForm.billApplyId}&cancelReason=${this.cancelReason}`).then(res => {
        if (res.data.code == 0) {
          this.$Message.success('操作成功')
          this.$emit('goBackForm', true)
        } else if (res.data.code === 403) return this.$Message.error('暂无权限')
      }).finally(() => {
        this.loading = false
      })

    },
    // 保存
    savePayment() {
      this.$refs.billForm.validate((valid) => {
        if (valid) {
          let flag = true
          this.billForm.spsSupplierBillApplyPaymentList =
            this.$common.isEmpty(this.billForm.spsSupplierBillApplyPaymentList) ? [] : this.billForm.spsSupplierBillApplyPaymentList
          this.billForm.spsSupplierBillApplyPaymentList.forEach(item => {
            if (item.remainingUnpaidAmount < 0) return flag = false
          })
          if (!flag) return this.$Message.error('剩余未付金额不小于0')
          let obj = {
            billApplyId: this.billForm.billApplyId,
            payAmount: this.billForm.totalPayAmount,
            spsSupplierBillApplyPaymentList: this.billForm.spsSupplierBillApplyPaymentList
          }
          this.loading = true
          this.axios.post(api.add_billApplyPayment, obj).then(res => {
            if (res.data.code == 0) {
              this.$Message.success('操作成功')
              this.$emit('goBackForm', true)
            } else if (res.data.code === 403) return this.$Message.error('暂无权限')
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },
    // 导出付款情况
    exportBtn() {
      if (!this.getPermission('supplierBillApply_exportPayment')) return this.$Message.error('暂无权限')
      if (this.billForm.spsSupplierBillApplyPaymentList.length == 0) return this.$Message.error('无数据不允许导出')
      this.loading = true
      this.axios.get(`${api.export_paymentList}?billApplyId=${this.billForm.billApplyId}`).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功')
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 添加备注
    addRemark() {
      if (!this.getPermission('supplierBillApply_addRemark')) return this.$Message.error('暂无权限')
      this.isRemarkEdit = !this.isRemarkEdit;
    },
    // 保存备注
    saveRemark() {
      if (this.remarkInp != "") {
        let temp = {
          billApplyId: this.billForm.billApplyId,
          remark: this.remarkInp,
          createdBy: this.userName,
          createdTime: this.time_now(),
        };
        if (this.billForm.spsSupplierBillApplyRemarkList == null) {
          this.billForm.spsSupplierBillApplyRemarkList = [];
          this.billForm.spsSupplierBillApplyRemarkList.push(temp);
        } else {
          this.billForm.spsSupplierBillApplyRemarkList.unshift(temp);
        }
        this.axios
          .post(api.add_billApplyRemark, temp)
          .then((res) => {
            if (res.data.code === 200) {
              this.$Message.success(res.data.message);
            }
          });
        this.remarkInp = "";
      }
      this.isRemarkEdit = false;
    },
    // 新增付款情况
    operationTable(type) {
      if (type == 'add') {
        this.billForm.spsSupplierBillApplyPaymentList =
          this.$common.isEmpty(this.billForm.spsSupplierBillApplyPaymentList) ? [] : this.billForm.spsSupplierBillApplyPaymentList
        this.billForm.spsSupplierBillApplyPaymentList.push({
          serialNumber: this.billForm.spsSupplierBillApplyPaymentList.length + 1,
          payTime: null,
          payAmount: null,
          paymentReceiptUrl: null,
          paymentReason: null,
          remainingUnpaidAmount: this.billForm.spsSupplierBillApplyPaymentList.length == 0 ? this.billForm.monthUnpaidPrice :
            this.billForm.spsSupplierBillApplyPaymentList[this.billForm.spsSupplierBillApplyPaymentList.length - 1].remainingUnpaidAmount,
          billApplyId: this.billForm.billApplyId
        })
      } else {
        if (!this.getPermission('supplierBillApply_delPayment')) return this.$Message.error('暂无权限')
        this.billForm.spsSupplierBillApplyPaymentList.splice(this.billForm.spsSupplierBillApplyPaymentList.length - 1, 1)
        if (!this.$common.isEmpty(this.billForm.spsSupplierBillApplyPaymentList)) {
          let resultNum = this.billForm.spsSupplierBillApplyPaymentList.reduce((pre, next) => {
            return pre + next.payAmount
          }, 0)
          this.billForm.spsSupplierBillApplyPaymentList.forEach(item => {
            item.remainingUnpaidAmount = Number((this.billForm.totalPayAmount - resultNum).toFixed(2))
          })
        }
      }
    },
    // 移除付款水单图片
    removeImg(index) {
      this.billForm.spsSupplierBillApplyPaymentList[index].paymentReceiptUrl = null
    },
    changePayment(val, index) {
      this.$set(this.billForm.spsSupplierBillApplyPaymentList[index], 'payAmount', Number(val))
      let allPayMent = this.billForm.spsSupplierBillApplyPaymentList.reduce((pre, next) => {
        return pre + next.payAmount
      }, 0)
      let remainingUnpaidAmount = Number((this.billForm.totalPayAmount - allPayMent).toFixed(2))
      this.billForm.spsSupplierBillApplyPaymentList.forEach(item => {
        this.$set(item, 'remainingUnpaidAmount', remainingUnpaidAmount)
      })
    },
    changeNum(val, type) {
      this.billForm[type] = Number(val)
    },
    validNum(rule, value, callback) {
      const reg = /^\d{1,9}(\.\d{1,2})?$/;
      if ((reg.test(value) && Number(value) >= 0) || this.$common.isEmpty(value)) {
        callback();
      } else {
        callback(new Error('不超过2位小数且整数最大为9位数'));
      }
    },
    // 格式化时间
    formatTime(time, type) {
      let pattern = /-/
      let resultTime = ''
      if (!pattern.test(time) && !this.$common.isEmpty(time)) {
        const date = new Date(time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0')
        if (type === 'month') {
          resultTime = `${year}-${month}`;
        } else {
          resultTime = `${year}-${month}-${day}`;
        }
        return resultTime
      } else {
        return time
      }
    },
    getAccountPrice() {
      let { supplierId, billMonth } = this.billForm;
      let fun = (resultData) => {
        let temp = {
          freightReduction: 'freightTotalPrice',
          outboundPriceReduction: 'outboundTotalPrice',
          supplierPriceReduction: 'fineTotalPrice',
          otherPriceReduction: 'otherTotalPrice',
        }
        Object.keys(temp).forEach(key => {
          let num = this.$common.isEmpty(resultData[temp[key]]) ? null : resultData[temp[key]] - 0;
          this.$set(this.billForm, key, num);
        })
      }
      fun({});// 清空抵/减/扣 项目及金额
      if (!(supplierId && billMonth)) return;
      this.axios.get(api.getBySupplierAndBillMonth, { params: { supplierId, billMonth } }).then(({ data }) => {
        if (data.code === 0) {
          fun(data.datas || {});
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.amountInput {
  width: 200px;

  .ivu-input-number-handler-wrap {
    display: none;
  }
}

.itemRemark {
  margin-left: 15px;
  display: inline;
  white-space: pre-wrap;
  width: 400px;
}

.addIcon {
  font-size: 20px;
  font-weight: 600;
  color: #2d8cf0;
  margin-left: 10px;
  cursor: pointer;
}

.remarkItemTextarea {
  margin: 10px 0 0 30px;
}

.remarkItemTextarea .ivu-form-item-content {
  line-height: 20px !important;
}

.textareaContent textarea {
  width: 800px !important;
  height: 73px !important;
}

.textareaContent {
  width: 800px;
}

.form-pic-item {
  display: flex;
  justify-content: flex-start;
  flex-flow: wrap;

  .pic-item-view {
    position: relative;
    margin-right: 10px;
    width: 60px;
    height: 60px;

    >img {
      height: 100%;
      width: 100%;
    }

    .pic-view-cover {
      position: absolute;
      top: 25%;
      left: 25%;
      width: 50%;
      height: 50%;

      &:hover {
        background: rgba(0, 0, 0, 0.5);

        .pic-view-btn {
          display: block;
        }
      }

      .pic-view-btn {
        display: none;
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translate(0, -50%);
        font-size: 20px;
        color: #fff;
        text-align: center;

        >i {
          cursor: pointer;
        }
      }
    }
  }

  .upload-item {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 60px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
  }

  .upload-icon {
    width: 70px;
    height: 70px;

    i> {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
</style>