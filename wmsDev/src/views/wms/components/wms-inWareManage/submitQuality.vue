<template >
  <div>
    <Card class="mt10" dis-hover>
      <Row>
        <Col span="7">
        <div>
          <div class="big-img-box">
            <local-img-zoom :src="imgSrc" :bigsrc="imgSrc"></local-img-zoom>
          </div>
        </div>
        </Col>
        <Col span="16" offset="1">
        <Card dis-hover title="商品信息">
          <Row class="receipt-top">
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              入库单号： </p>
            <p class="receipt-top-text text-eli" :title="curObj.receiptNo">
              {{ curObj.receiptNo }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              批次号： </p>
            <p class="receipt-top-text text-eli" :title="curObj.receiptNo">
              {{ curObj.receiptBatchNo }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              收货库区： </p>
            <p class="receipt-top-text text-eli">
              收货库区 </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              收货库位： </p>
            <p class="receipt-top-text text-eli" :title="qualityDataList.warehouseLocationName">
              {{ qualityDataList.warehouseLocationName }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">SKU：</p>
            <p class="receipt-top-text text-eli" :title="curObj.goodsSku">
              {{ curObj.goodsSku }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              商品中文名称： </p>
            <p class="receipt-top-text" :title="qualityDataList.goodsCnDesc">
              {{ qualityDataList.goodsCnDesc }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              商品英文名称： </p>
            <p class="receipt-top-text" :title="qualityDataList.goodsEnDesc">
              {{ qualityDataList.goodsEnDesc }} </p>
            </Col>
            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              重量(g)： </p>
            <p class="receipt-top-text text-eli" :title="qualityDataList.goodsWeight">
              {{ qualityDataList.goodsWeight }} </p>
            </Col>
            <Col span="12" class="receipt-top-box" v-for="(item) in baseInfoList" :key="item.typeValueId">
            <p class="receipt-top-label">
              {{ item.name }}： </p>
            <p class="receipt-top-text text-eli" :title="curObj.Color">
              {{ item.value }} </p>
            </Col>

            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              长宽高(cm)： </p>
            <p class="receipt-top-text text-eli" :title="
              qualityDataList.goodsLength +
              '*' +
              qualityDataList.goodsWidth +
              '*' +
              qualityDataList.goodsHeight
            ">
              {{ qualityDataList.goodsLength }}*{{ qualityDataList.goodsWidth }}*{{ qualityDataList.goodsHeight }} </p>
            </Col>

            <Col span="12" class="receipt-top-box">
            <p class="receipt-top-label">
              质检状态： </p>
            <p class="receipt-top-text text-eli">
              <span style="color:green;" v-if="curObj.checkStatus === '0'">待质检</span> <span style="color:green;"
                v-if="curObj.checkStatus === '1'">部分质检</span> <span style="color:green;"
                v-if="curObj.checkStatus === '2'">质检完成</span>
            </p>
            </Col>

          </Row>
        </Card>
        </Col>
      </Row>
      <Card dis-hover title="商品图片">
        <preview-img :fileList="imgList" :isDisabled="true"></preview-img>
        <span class="text-style" @click="showImgList" v-if="imgList.length != 0">{{ isAllList ? '点击收起' : '点击查看全部'
        }}</span>
      </Card>

      <Card dis-hover title="质检标准" class="mt10">
        <!-- <div class="qc-box">
          <Row v-for="(item, index) in qcList" type="flex" justify="center" align="middle" :key="index" class="quality-item">
            <Col span="6">
            <div class="quality-tit">{{ item.measureName }}</div>
            </Col>
            <Col span="18">
            <Row class="row-i" v-for="childrenItem in item.list" :key="childrenItem.itemValue">
              <Col span="10">{{ childrenItem.itemName }}</Col>
              <Col span="14">{{ childrenItem.itemValue }}</Col>
            </Row>
            </Col>
          </Row>
        </div> -->
        <Table border :columns="tablecolumns" :data="tableData"></Table>
        <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
      </Card>
      <Spin size="large" fix v-if="spinShow"></Spin>
    </Card>
    <Card title="质检图片" class="mt10" dis-hover>
      <div style="min-height: 60px;">
        <div class="demo-upload-list" v-for="(item, index) in uploadList" :key="index">
          <template v-if="item.status === 'finished'">
            <img v-if="item.response.datas !== ''" :src="item.response.datas" /> <img v-else
              src="../../../../../public/static/images/placeholder.jpg" />
            <div class="demo-upload-list-cover">
              <Icon type="ios-trash-outline" @click.native="handleRemove(item)" v-if="item.response.success"></Icon>
            </div>
          </template>
          <!--<template v-else>-->
          <!--<Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>-->
          <!--</template>-->
        </div>

        <div v-if="!uploadList.length && curObj.checkStatus === '2'">
          暂无图片
        </div>

        <dytUpload class="fl" ref="upload" :action="imgAddress" :headers="headObj" :show-upload-list="false"
          :format="['jpg', 'jpeg', 'png', 'bmp', 'gif']" name="files" multiple type="drag"
          style="display: inline-block;width:58px;" :max-size="2048" :on-success="uploadSuccess" :on-error="uploadError"
          :before-upload="handleBeforeUpload" :on-format-error="handleFormatError" :default-file-list="hasUploadlists"
          :on-progress="onProg" v-show="curObj.checkStatus !== '2'">
          <div style="width: 58px;height:58px;line-height: 58px;" v-if="isShowImg">
            <Icon type="md-camera" size="20"></Icon>
          </div>
        </dytUpload>

        <div style="display: inline-block;width: 58px; height: 58px; line-height: 58px;padding-left: 20px" class="fl"
          v-if="onProgFlag">
          <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
        </div>
      </div>
    </Card>
    <Card title="质检记录" class="mt10" dis-hover>
      <Table :columns="columns6" :loading="TableLoading" :data="data6" highlight-row border></Table>
    </Card>
    <Spin size="large" fix v-if="spinShow"></Spin>
    <div class="fix-submit" v-if="
      (curObj.checkStatus === '0' || curObj.checkStatus === '1') &&
      tabsName === 'detail'
    ">
      <div class="amount1">
        <p class="amount">
          <span style="color:#ff5e6a">送检数量：<span class="fontWeight" style="color:#ff5e6a">{{
              curObj.expectedCheckNumber
          }}</span></span> <span style="color:#4fa5e5">已检数量：<span class="fontWeight" style="color:#4fa5e5">{{
    curObj.expectedCheckNumber - curObj.waitCheckNumber
}}</span></span> <span style="color:#ff5e6a">待检数量：<span class="fontWeight" style="color:#ff5e6a">{{
    curObj.waitCheckNumber
}}</span></span>
        </p>
      </div>

      <div class="formStyle">
        <Form ref="newQualityParams" :model="newQualityParams" :rules="ruleValidate" inline :label-width='80'>
          <Row>
            <Col span="3">
            <FormItem prop="qualifiedNum" label="良品数量">
              <Input v-model.trim="newQualityParams.qualifiedNum" @on-blur="qualifiedBlur('Y')"
                :disabled="curObj.checkStatus === '2'"></Input>
            </FormItem>
            </Col>
            <Col span="15">
            <FormItem label="备注" prop="remarks">
              <Input :autosize="{ minRows: 5, maxRows: 6 }" placeholder="填写备注" v-model.trim="newQualityParams.remarks"
                :maxlength="50" :disabled="curObj.checkStatus === '2'" style="width:1100px"></Input>
            </FormItem>
            </Col>
            <Col span="6">
            <FormItem>
              <Button type="primary" @click="submitQuality">提交结果</Button>
            </FormItem>
            </Col>

          </Row>
          <Row>
            <Col span="3">
            <FormItem prop="unqualifiedNum" label="不良品数量">
              <Input v-model.trim="newQualityParams.unqualifiedNum" @on-blur="qualifiedBlur('N')"
                :disabled="curObj.checkStatus === '2'"></Input>
            </FormItem>
            </Col>
            <Col span="12">
            <FormItem label="不良原因" prop="problemCheckReason">
              <Select v-model="newQualityParams.problemCheckReason" style="width:1100px" multiple>
                <Option v-for="(item, index) in qualityProjectList" :value="item.qualityProject" :key="index">{{
                    item.qualityProject
                }}</Option>
              </Select>
            </FormItem>
            </Col>

          </Row>
        </Form>
      </div>

    </div>
    <Modal v-model="dialogView" title="提示" @on-ok="dialogConfirm" @on-cancel="dialogView = false">
      <div class="mt20 ml20">
        <Icon type="md-alert" style="font-size:20px;color:#ff982d" class="mr10" />
        <span style="font-size:15px;">是否确认不选择不良原因？</span>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import previewImg from '@/components/common/previewImg';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin],
  components: {
    previewImg
  },
  data () {
    return {
      tablecolumns: [
        {
          title: '序号',
          type: 'index',
          width: 100
        },
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          align: 'left',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.price) || row.price < 0) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      tableData: [],
      qcList: [],
      spinShow: false,
      imgSrc: '',
      list: [],
      copyApiImg: [],
      count: 0,
      onProgFlag: false,
      isShowImg: true, // 上传图片按钮默认显示
      uploadList: [],
      saveImgPath: [],
      hasUploadlists: [],
      imgAddress: api.upload_Img, // 上传图片的接口
      uploadSuccessFlag: false,
      newQualityParams: {
        qualifiedNum: 0, // 合格数量
        unqualifiedNum: 0, // 不合格数量
        remarks: '', // 备注
        problemCheckReason: []// 不良原因

      },
      ruleValidate: {
        qualifiedNum: [
          {
            validator: this.validateNum(),
            trigger: 'blur'
          } // 合格数量
        ],
        unqualifiedNum: [
          {
            validator: this.validateNum(),
            trigger: 'blur'
          } // 不合格数量
        ]
      },
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center',
          fixed: 'left'
        }, {
          title: '质检记录',
          key: 'receiptBatchCheckDetailNo',
          align: 'center',
          minWidth: 150
        }, {
          title: '本次质检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '合格数量',
          key: 'passCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '不合格数量',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 80
        },
        {
          title: '不良原因',
          key: 'problemCheckReason',
          align: 'center',
          minWidth: 100
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 160
        }, {
          title: '质检时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 160
        }, {
          title: '质检人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120
        }
      ],
      data6: [],
      qualityDataList: {}, // 质检记录表格数据
      allImgList: [],
      imgList: [],
      isAllList: false,
      qualityProjectList: [],
      dialogView: false, // 弹框
      supplierList: [], // 供应商列表,
      obj: null,
      baseInfoList: []
    };
  },
  props: {
    curObj: {
      default: null
    },
    open: {
      default: false
    },
    type: {
      default: 'look'
    },
    tabsName: {
      default: 'list'
    }
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.tableData)) return 0;
      let priceTotal = 0;
      this.tableData.forEach(row => {
        if (!(this.$common.isEmpty(row.price) || row.price < 0)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  watch: {},
  created () {
    // this.getQualityDetailData(this.curObj);
  },
  methods: {
    qualifiedBlur (y) {
      /**
       * @Description: 当良品不良品数量加起来大于待检数量则做相应修改
       * @author gan
       * @date: 2020/11/17 16:42
       * @params: y  Y 良品 N 不良品
      */
      let v = this;
      let qualifiedNum = Number(v.newQualityParams.qualifiedNum); // 良品数
      let unqualifiedNum = Number(v.newQualityParams.unqualifiedNum); // 不良品数
      let waitCheckNumber = v.curObj.waitCheckNumber; // 待检数量
      if (qualifiedNum + unqualifiedNum > waitCheckNumber) {
        if (y === 'Y') {
          if (qualifiedNum > waitCheckNumber) {
            v.newQualityParams.qualifiedNum = waitCheckNumber;
            v.newQualityParams.unqualifiedNum = 0;
          } else {
            v.newQualityParams.unqualifiedNum = waitCheckNumber - qualifiedNum;
          }
        } else {
          if (unqualifiedNum > waitCheckNumber) {
            v.newQualityParams.unqualifiedNum = waitCheckNumber;
            v.newQualityParams.qualifiedNum = 0;
          } else {
            v.newQualityParams.qualifiedNum = waitCheckNumber - unqualifiedNum;
          }
        }
      }
    }, /* 详情图 */
    submitQuality () {
      this.handleSubmit();
    },
    prev () {
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) + 60 : 0;
      if (left <= 0) {
        this.$refs.carouselItem.style.left = left + 'px';
      } else {
        this.$refs.carouselItem.style.left = 0 + 'px';
      }
    },
    next () {
      let width = this.$refs.carousel.offsetWidth;
      let widthItem = this.$refs.carouselItem.offsetWidth;
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) - 60 : -60;
      if (left < -(widthItem - width)) {
        this.$refs.carouselItem.style.left = -(widthItem - width) + 'px';
      } else {
        this.$refs.carouselItem.style.left = left + 'px';
      }
    },
    activeImg (item) {
      this.imgSrc = item;
    },
    validateNum () {
      // 合格数量和不合格数量校验
      let v = this;
      var validateNum = function (rule, value, callback) {
        var re = v.$regular.AllNumber;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('大于0的整数'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateNum;
    },
    checkDtlObj () {
      // 提交质检参数
      let v = this;
      let newObj = {
        passCheckNumber: v.newQualityParams.qualifiedNum || 0, // 合格数量
        problemCheckNumber: v.newQualityParams.unqualifiedNum || 0, // 不合格数量
        remark: v.newQualityParams.remarks, // 备注
        problemCheckReason: v.newQualityParams.problemCheckReason, // 不良原因
        waitCheckNumber: v.curObj.waitCheckNumber, // 待质检数量
        warehouseName: v.curObj.warehouseName, // 仓库名称
        checkAttachment: v.saveImgPath.toString(), // 图片地址
        receiptBatchCheckId: v.curObj.receiptBatchCheckId, // 质检单ID
        receiptNo: v.curObj.receiptNo, // 入库单编号
        warehouseId: v.curObj.warehouseId, // 仓库ID
        receiptBatchNo: v.curObj.receiptBatchNo, // 批次号
        warehouseLocationId: v.curObj.warehouseLocationId, // 库位ID
        productGoodsId: v.curObj.goodsSku, // 货品SKU
        goodsSku: v.curObj.goodsSku, // 货品SKU
        checkStatus: v.curObj.checkStatus, // 质检状态
        expectedCheckNumber: v.curObj.expectedCheckNumber, // 送检数量
        receiptBatchCheckNo: v.curObj.receiptBatchCheckNo // 质检编号
      };
      return newObj;
    },
    getParams (name) {
      let v = this;
      let obj = this.checkDtlObj();
      this.obj = this.checkDtlObj();
      if (Number(obj.passCheckNumber) === 0 && Number(obj.problemCheckNumber) === 0) {
        v.$Message.error({
          duration: 5,
          content: '请输入质检数量'
        });
        return;
      }
      v.$refs[name].validate(valid => {
        if (valid) {
          if (this.newQualityParams.unqualifiedNum > 0 && this.newQualityParams.problemCheckReason.length == 0) {
            this.dialogView = true
            return
          }
          this.dialogConfirm(obj)
        } else {
          v.$Message.info({
            content: '合格数量或者不合格数量不能为空',
            duration: 4
          });
        }
      });
    },
    dialogConfirm () {
      let obj = this.obj
      let v = this;
      if (this.newQualityParams.qualifiedNum !== '' || this.newQualityParams.unqualifiedNum !== '') {
        // if (this.newQualityParams.qualifiedNum !== '0' && this.newQualityParams.unqualifiedNum !== '0') {
        if (Number(this.newQualityParams.qualifiedNum) <= v.curObj.waitCheckNumber && Number(this.newQualityParams.unqualifiedNum) <= v.curObj.waitCheckNumber) {
          var addNum = null;
          obj.problemCheckReason = obj.problemCheckReason.toString()// 后端接受字符串
          addNum = Number(this.newQualityParams.qualifiedNum) + Number(this.newQualityParams.unqualifiedNum);
          if (obj.problemCheckNumber == 0) obj.problemCheckReason = ''// 不良品数量为0，不良原因不保存
          if (addNum <= this.curObj.waitCheckNumber) {
            v.axios.post(api.submitQualityCheck, obj).then(res => {
              if (res.data.code === 0) {
                v.$emit('createSuccess');
                // v.getQualityDetailData(this.curObj);
              } else if (res.data.code === -1) {
                v.$Message.info('质检数量不能为空或0');
                // v.$emit('validateFail');
              } else if (res.data.code === -2) {
                v.$Message.info('质检数量不能超过待质检数量');
                // v.$emit('validateFail');
              } else if (res.data.code === -3) {
                v.$Message.info('插入质检明细信息表失败');
                // v.$emit('validateFail');
              } else if (res.data.code === -4) {
                v.$Message.info('插入质检明细信息表失败');
                //  v.$emit('validateFail');
              } else if (res.data.code === -5) {
                v.$Message.info('插入日志表失败');
                // v.$emit('validateFail');
              } else if (res.data.code === -6) {
                v.$Message.info('修改质检状态失败');
                // v.$emit('validateFail');
              } else {
                // v.$emit('createFail');
              }
            });
          } else {
            v.$Message.info({
              content: '合格数量和不合格数量之和不能超过待检数量',
              duration: 5
            });
            // v.$emit('validateFail');
          }
        } else {
          v.$Message.info({
            content: '合格数量或者不合格数量不能大于待检数量',
            duration: 4
          });
          // v.$emit('validateFail');
        }
      } else {
        v.$Message.info({
          content: '合格数量或者不合格数量不能为0',
          duration: 4
        });
        // v.$emit('validateFail');
      }
    },
    handleSubmit () {
      this.getParams('newQualityParams'); // 提交质检结果前，进行表单校验
      this.uploadList = [];
    },
    handleReset (name) {
      // this.$refs[name].resetFields();
    },
    resetFormFn () {
      // 清空表单数据
      this.handleReset('newQualityParams');
      this.uploadList = [];
    },
    getQualityDetailData (obj) {
      // 查看提交质检结果前的数据
      var v = this;
      v.spinShow = true;
      var obj2 = {
        merchantId: obj.merchantId,
        receiptBatchCheckNo: obj.receiptBatchCheckNo,
        receiptNo: obj.receiptNo,
        receiptBatchNo: obj.receiptBatchNo,
        warehouseLocationId: obj.warehouseLocationId,
        productGoodsId: obj.goodsSku
      };
      let arr = [];
      v.TableLoading = true;
      v.axios.post(api.submitQualityData, obj2).then(res => {
        v.spinShow = false;
        v.TableLoading = false;
        if (res.data.code === 0) {
          v.qualityDataList = res.data.datas;
          if (v.qualityDataList.goodsUrl) {
            v.imgSrc = v.$store.state.imgUrlPrefix + v.qualityDataList.goodsUrl;
          } else {
            v.imgSrc = require('../../../../../public/static/images/placeholder.jpg');
          }
          v.curObj.checkStatus = v.qualityDataList.checkStatus;
          v.curObj.expectedCheckNumber = v.qualityDataList.expectedCheckNumber;
          v.curObj.waitCheckNumber = v.qualityDataList.expectedCheckNumber - v.qualityDataList.checkedNumber;
          v.newQualityParams.qualifiedNum = v.curObj.waitCheckNumber;
          v.newQualityParams.unqualifiedNum = 0;
          v.newQualityParams.problemCheckReason = []
          if (res.data.datas.productQualityMeasureJsonMessage) {
            // 质检标准
            let obj = JSON.parse(res.data.datas.productQualityMeasureJsonMessage) || [];
            v.qcList = [
              ...new Set(obj.map(i => {
                return JSON.stringify({
                  measureName: i.measureName,
                  list: []
                });
              }))
            ].map(i => {
              return JSON.parse(i);
            });
            obj.forEach(i => {
              v.qcList.forEach(j => {
                if (i.measureName === j.measureName) {
                  j.list.push({
                    itemName: i.itemName,
                    itemValue: i.itemValue
                  });
                }
              });
            });
          }
          res.data.datas.receiptBatchCheckDetailList.forEach(val => {
            if (val.checkAttachment && val.checkAttachment !== '') {
              if (val.checkAttachment.indexOf(',') > -1) {
                arr = [...arr, ...val.checkAttachment.split(',')];
              } else {
                arr.push(val.checkAttachment);
              }
            }
          });
          this.uploadList = arr.map(val => {
            return {
              percentage: 100,
              showProgress: true,
              status: 'finished',
              response: {
                datas: val
              }
            };
          });
          this.copyApiImg = [...this.uploadList];
          let data = res.data.datas.receiptBatchCheckDetailList;
          for (let i = 0; i < data.length; i++) {
            data[i].expectedCheckNumber = Number(data[i].passCheckNumber) + Number(data[i].problemCheckNumber);
            data[i].createdTime = this.$uDate.dealTime(data[i].createdTime);
          }
          this.data6 = data;
        }
      });
    },
    onProg (res, file, fileList) {
      this.onProgFlag = true;
    },
    uploadSuccess: function (res, file, fileList) {
      // 图片上传成功的回调函数
      this.count--;
      if (this.count === 0) {
        this.onProgFlag = false;
      }
      var v = this;
      if (res.success) {
        v.uploadSuccessFlag = false;
        v.saveImgPath.push(v.$store.state.erpConfig.filenodeViewTargetUrl + res.datas);
        let link = v.$store.state.erpConfig.filenodeViewTargetUrl;
        fileList.forEach(i => {
          if (i.response.datas.includes(link)) {
            i.response.datas = i.response.datas;
          } else {
            i.response.datas = link + i.response.datas;
          }
        });
        this.uploadList = [...this.copyApiImg, ...fileList];
        if (res.datas) {
          v.$Message.success(file.name + '上传图片成功');
        } else {
          v.$Message.warning(file.name + '上传图片失败');
        }
      }
    },
    uploadError: function () {
      // 图片上传失败的回调函数
      this.$Message.warning('上传失败');
      this.count--;
      if (this.count === 0) {
        this.onProgFlag = false;
      }
    },
    handleFormatError (file) {
      // 验证文件格式
      this.$Notice.warning({
        title: '文件格式不正确',
        desc: '文件格式' + file.name + '不正确，请选择jpg或者png格式'
      });
    },
    handleBeforeUpload () {
      // 图片上传不超过5张
      this.count++;
      const check = this.uploadList.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: '图片上传不能超过5张'
        });
      }
      return check;
    },
    handleRemove (file) {
      // 删除图片的回调函数
      if (file.response.success) {
        this.uploadSuccessFlag = false;
        this.$Message.success(file.name + '删除图片成功');
        const fileList = this.$refs.upload.fileList;
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
        this.uploadList = this.$refs.upload.fileList;
        this.saveImgPath.splice(this.saveImgPath.indexOf(file.response.datas), 1);
        // this.isShowImg = true;
      }
    },
    getColorSize (obj) {
      this.axios.post('/wms-service/erpCommon/product-service/productGoodsSpecification/queryByProductGoodsIds', [obj.productGoodsId]).then(res => {
        if (!res.data || !res.data.datas || !res.data.datas[obj.productGoodsId]) return;
        this.baseInfoList = res.data.datas[obj.productGoodsId];
      })
    },
    getImgList (obj) {
      this.axios.post('/wms-service/erpCommon/product-service/productImage/queryByProductGoodsIds', obj.productGoodsId).then(({ data }) => {
        let list = data.datas
        this.imgList = []
        const imgUrlPrefix = this.$store.state.imgUrlPrefix;
        list.forEach((item, index) => {
          list[index] = imgUrlPrefix + item
          let temp = {}
          temp.url = item
          if (index < 3) this.imgList.push(temp)
        })
        this.allImgList = list
      })
    },
    showImgList () {
      this.imgList = []
      if (this.isAllList) {
        this.isAllList = false
        this.allImgList.forEach((item, index) => {
          let temp = {}
          temp.url = item
          if (index < 3) this.imgList.push(temp)
        })
      } else {
        this.isAllList = true
        this.allImgList.forEach((item, index) => {
          let temp = {}
          temp.url = item
          this.imgList.push(temp)
        })
      }
    },
    getProductQuality (obj) {
      this.axios.post('/wms-service/erpCommon/product-service/productQualityProject/queryQualityProjectListById', obj.productGoodsId).then(res => {
        this.tableData = res.data.datas
        this.qualityProjectList = []
        res.data.datas.forEach(item => {
          let temp = {}
          temp.qualityProject = item.qualityProject
          temp.qualityProjectId = item.qualityProjectId
          this.qualityProjectList.push(temp)
        })
      })
    },
    getSupplierList () {
      this.axios.get(api.quality_getSupplierList).then(res => {
      })
    }
  },
  mounted () {
    this.uploadList = this.$refs.upload.fileList;
  }
};
</script>
<style >
.modalContentTitle {
  border-bottom: 1px solid lightgrey;
  margin-bottom: 10px;
}

.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 4px;
}

.demo-upload-list img {
  width: 100%;
  height: 100%;
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
}

.demo-upload-list:hover .demo-upload-list-cover {
  display: block;
}

.demo-upload-list-cover i {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  margin: 0 2px;
}

.demo-spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
</style >
<style scoped >
.mt10 {
  margin-top: 10px;
}

.pd10 {
  padding: 10px;
}

.text-eli {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.big-img-box {
  width: 100%;
  height: 265px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.carousel-box {
  width: 100%;
  margin-top: 10px;
  position: relative;
  height: 60px;
  transition: left 0.3s ease;
}

.carousel-img-box {
  height: 60px;
  position: absolute;
  left: 0;
  top: 0;
}

.carousel-box .img-box-prev,
.carousel-box .img-box-next {
  position: absolute;
  width: 15px;
  line-height: 57px;
  font-weight: bold;
  top: 0;
  height: 60px;
  cursor: pointer;
}

.carousel-box .img-box-prev:hover,
.carousel-box .img-box-next:hover {
  color: #2baee9;
}

.carousel-box .img-box-prev {
  left: 0;
}

.carousel-box .img-box-next {
  right: 0;
  text-align: right;
}

.img-item {
  object-fit: cover;
  margin: 0 3px;
}

.tabs-p10 {
  padding: 0 10px;
}

.receipt-top {
  max-height: 286px;
  overflow-y: auto;
}

.receipt-top-box {
  padding-bottom: 15px;
}

.receipt-top-label {
  display: inline-block;
  text-align: right;
  float: left;
  font-weight: bold;
}

.receipt-top-text {
  float: left;
  word-break: break-all;
}

.quality-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.quality-item .row-i {
  margin: 7px 0;
}

.quality-item .row-i:first-child {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quality-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.quality-item:first-child {
  padding-top: 0;
}

.fix-submit {
  position: fixed;
  bottom: 0;
  height: 150px;
  width: 100%;
  background-color: #f9f9f9;
  border: 1px solid #dadada;
  z-index: 9;
  /* padding-left: 30px; */
}

.fix-submit .amount1 {
  font-size: 18px;
  margin-top: 8px;
  border-bottom: 1px solid #d6d6d6;
}

.fix-submit .amount1 .amount {
  margin-left: 30px;
}

.fix-submit .amount span {
  margin-right: 50px;
}

.fix-submit .formStyle {
  margin-top: 10px;
  margin-left: 30px;
}

.qc-box {
  max-height: 300px;
  overflow-y: auto;
}

.pb150 {
  padding-bottom: 150px;
}

.text-style {
  color: #4f8ee4;
  cursor: pointer;
  text-decoration: underline;
}
</style >
