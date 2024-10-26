<template >
  <div >
    <div class="modalItemContent" >
      <div class="addModalData" >
        <Form
            :model="newWareLocateParams"
            label-position="right"
            :label-width="90"
            ref="newWareLocateParams"
            :rules="ruleWareLocate" >
          <Form-item label="所属仓库：" prop="selectWareHouse" >
            <dyt-select
                filterable
                v-model="newWareLocateParams.selectWareHouse"
                @on-change='selectWareBlock'
                style="width:220px"
                :disabled="wareLocateModalStatus === 'edit' || editType === 'look'"
                placeholder="请输入仓库" > <Option
                style="width:200px"
                v-for="v in wareHouseTypeList"
                :value="v.warehouseId"
                :key="v.warehouseId" >{{ v.warehouseName }}</Option> </dyt-select >
          </Form-item >
          <Form-item label="所属库区：" prop="selectWareArea" >
            <Row >
              <Col span="24" >
                <dyt-select
                    v-model="newWareLocateParams.selectWareArea"
                    style="width:220px"
                    placeholder="请选择库区"
                    :disabled="wareLocateModalStatus === 'edit' || editType === 'look'"
                    :label-in-value="true"
                    @on-change='showCheckBox' > <Option
                    v-for="item in wareBlockNameList"
                    :value="item.warehouseBlockId"
                    :key="item.warehouseBlockId" >{{ item.warehouseBlockName }}
                <span v-if="item.warehouseBlockType==='00'" >(收货区)</span >
                <span v-if="item.warehouseBlockType==='10'" >(标准区)</span >
                <span v-if="item.warehouseBlockType==='11'" >(良品区)</span >
                <span v-if="item.warehouseBlockType==='12'" >(不良品区)</span >
                <!-- <span v-if="item.warehouseBlockType==='20'">(退货区)</span> -->
               </Option> </dyt-select >
              </Col >
              <!-- <Col span="24">
                <Form-item>
                  <RadioGroup>
                    <Radio :label="1">作为拣货库位</Radio>
                    <Radio :label="0">作为收货库位</Radio>
                  </RadioGroup>
                  <Checkbox v-model="newWareLocateParams.pickingOpen" v-if="wareLocateModalStatus === 'add'">作为拣货库位</Checkbox>
                  <Checkbox v-if="wareLocateModalStatus === 'edit'" v-model="newWareLocateParams.pickingOpen">作为拣货库位</Checkbox>
                </Form-item>
              </Col> -->
            </Row >
          </Form-item >
          <!-- 库位使用 -->
          <Form-item label="库位使用：" prop="selectWareUse" >
            <dyt-select
                v-model="newWareLocateParams.selectWareUse"
                style="width: 220px"
                :disabled="wareLocateModalStatus === 'edit' || editType === 'look'"
                placeholder="请选择库位" >
              <Option v-if="isAbnormal === false && !rejectsTalg" value="0" >作为收货库位</Option >
              <Option v-if="isAbnormal === false && !rejectsTalg" value="1" >作为拣货库位</Option >
              <Option value="2" v-if="!rejectsTalg">作为异常处理库位</Option >
              <Option v-if="isAbnormal === false && rejectsTalg"  value="3" >作为不良品库位</Option >
            </dyt-select >
          </Form-item >
          <Form-item label="库位代码：" prop="wareLocateCode" >
            <Input
                :disabled="disabledStatus || editType === 'look'"
                v-model.trim="newWareLocateParams.wareLocateCode"
                style="width:220px"
                placeholder="请输入库位代码"
                :maxlength="15" ></Input >
          </Form-item >
          <Form-item label="库位名称：" prop="wareLocateName" >
            <Input
                :disabled="editType === 'look'"
                v-model.trim="newWareLocateParams.wareLocateName"
                style="width:220px"
                placeholder="请输入库位名称"
                :maxlength="50" ></Input >
          </Form-item >
          <Form-item label="状态：" prop="selectStatus" >
            <dyt-select v-model="newWareLocateParams.selectStatus" :disabled="editType === 'look'" style="width:220px" >
            <Option value="0" >可用</Option > <Option value="1" >停用</Option > </dyt-select >
          </Form-item >
          <Form-item label="拣货优先级：" prop="sortId" >
            <!--<Input v-model.trim="newWareLocateParams.sortId" style="width:220px"></Input>-->
            <InputNumber
                :disabled="editType === 'look'"
                :min="1"
                v-model.trim="newWareLocateParams.sortId"
                style="width:220px"
                :max="99999999999" ></InputNumber >
          </Form-item >
          <!-- <p><span style="font-weight:bold;">限制条件</span></p>
           <div style="border:1px lightgrey solid;padding-top:15px;margin-right:20px;">
             <Row>
               <Col span="14">
                 <Form-item label="体积限制：" prop="volumeLimit">
                   &lt;!&ndash;<Input v-model.trim="newWareLocateParams.volumeLimit" style="width:220px"></Input>&ndash;&gt;
                   <InputNumber v-model.trim="newWareLocateParams.volumeLimit" style="width:220px" :min='0' :precision='4'></InputNumber>
                 </Form-item>
               </Col>
               <Col span="8" offset="2">
                 <Form-item prop="volumeOpen" style="position:relative;left:10px;">
                   <Checkbox v-model="newWareLocateParams.volumeOpen" style="position:relative;right:70px;">开启</Checkbox>
                 </Form-item>
               </Col>
             </Row>
             <Row>
               <Col span="14" >
                 <Form-item label="重量限制：" prop="weightLimit">
                   &lt;!&ndash;<Input v-model.trim="newWareLocateParams.weightLimit" style="width:220px"></Input>&ndash;&gt;
                   <InputNumber v-model.trim="newWareLocateParams.weightLimit" style="width:220px" :min='0' :precision="0"></InputNumber>
                 </Form-item>
               </Col>
               <Col span="8" offset="2">
                 <Form-item prop="weightOpen" style="position:relative;left:10px;">
                   <Checkbox v-model="newWareLocateParams.weightOpen" style="position:relative;right:70px;">开启</Checkbox>
                 </Form-item>
               </Col>
             </Row>
            <Row>
               <Col span="14" >
                 <Form-item label="数量限制：" prop="quantityLimit">
                   &lt;!&ndash;<Input v-model.trim="newWareLocateParams.quantityLimit" style="width:220px"></Input>&ndash;&gt;
                   <InputNumber v-model.trim="newWareLocateParams.quantityLimit" style="width:220px" :min='0' :precision="0" :max='99999999999'></InputNumber>
                 </Form-item>
               </Col>
               <Col span="8" offset="2">
                 <Form-item prop="quantityOpen" style="position:relative;left:10px;">
                   <Checkbox v-model="newWareLocateParams.quantityOpen" style="position:relative;right:70px;">开启</Checkbox>
                 </Form-item>
               </Col>
             </Row>
             <Row>
               <Col span="10" >
                 <Form-item prop="allowProduct">
                   <Checkbox v-model="newWareLocateParams.allowProduct">允许混放产品</Checkbox>
                 </Form-item>
               </Col>
               <Col span="12" >
                 <Form-item prop="allowBatch">
                   <Checkbox v-model="newWareLocateParams.allowBatch">允许混放批次</Checkbox>
                 </Form-item>
               </Col>
             </Row>
           </div>-->
        </Form >
      </div >
    </div >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';

export default {
  mixins: [Mixin, productMixin],
  data () {
    return {
      rejectsTalg: false,
      isAbnormal: false,
      newWareLocateParams: {
        selectWareHouse: '', // 所属仓库
        selectWareArea: '', // 所属库区
        selectWareUse: '0', // 库位使用  0：收货库位  1：拣货库位
        wareLocateCode: '', // 库位代码
        wareLocateName: '', // 库位名称
        selectStatus: '0', // 库位状态
        sortId: null, // SortID
        volumeLimit: '', // 体积限制
        weightLimit: '', // 重量限制
        quantityLimit: '', // 数量限制
        volumeOpen: false, // 体积限制标志
        weightOpen: false, // 重量限制标志
        quantityOpen: false, // 数量限制标志
        allowProduct: false, // 产品混放标志
        allowBatch: false // 批次混放标志
        // pickingOpen: this.wareLocateModalStatus === 'add' // 作为拣货库位
      },
      disabledStatus: false, // 编辑时库位代码不能修改
      wareHouseTypeList: [], // 仓库下拉列表
      wareBlockNameList: [], // 库区下拉列表
      isShowCheck: this.wareLocateModalStatus === 'add' ? '' : {},
      ruleWareLocate: {
        selectWareHouse: [
          {
            required: true,
            message: '所属仓库不能为空',
            trigger: 'change'
          }
        ],
        selectWareArea: [
          {
            required: true,
            message: '所属库区不能为空',
            trigger: 'change'
          }
        ],
        selectWareUse: [
          {
            required: true,
            message: '库位使用不能为空',
            trigger: 'change'
          }
        ],
        wareLocateCode: [
          {
            required: true,
            message: '库位代码不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 30,
            message: '超出最大长度限制',
            trigger: 'blur'
          }, {
            validator: this.validateFormSku,
            trigger: 'blur'
          }
        ],
        wareLocateName: [
          {
            required: true,
            message: '库位名称不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 50,
            message: '超出最大长度限制',
            trigger: 'blur'
          }, {
            validator: this.validateFormSku,
            trigger: 'blur'
          }
        ],
        selectStatus: [
          {
            required: true,
            message: '库位状态不能为空',
            trigger: 'change'
          }
        ]
      }
    };
  },
  created () {
    this.getWareHouseName(); // 调用仓库下拉列表
  },
  props: {
    editType: { // 编辑状态
      default: 'look'
    },
    curSingleDtl: { // 查看库位当前行的数据
      default: null
    },
    openFlag: { // 打开模态框的标记
      default: null
    },
    wareId: { // 编辑当前行仓库ID
      default: null
    },
    wareLocateId: { // 编辑当前行库位ID
      default: null
    },
    wareBlockId: { // 编辑当前行库区ID
      default: null
    },
    wareLocateModalStatus: { // 状态 add edit
      default: null
    }
  },
  watch: {
    // 查看当前库位信息
    '$store.state.wareLocateWatchFlag': function (bool) {
      let v = this;
      v.isAbnormal = false;
      if (v.wareLocateModalStatus === 'edit') {
        if (bool) {
          v.$nextTick(() => {
            v.newWareLocateParams.selectWareHouse = v.curSingleDtl.warehouseId; // 仓库名称
            v.newWareLocateParams.wareLocateCode = v.curSingleDtl.warehouseLocationCode; // 库位代码
            v.newWareLocateParams.wareLocateName = v.curSingleDtl.warehouseLocationName; // 库位名称
            v.newWareLocateParams.selectStatus = v.curSingleDtl.warehouseLocationStatus; // 库位状态
            v.newWareLocateParams.sortId = v.curSingleDtl.sortId; // SortID
            v.newWareLocateParams.volumeLimit = v.curSingleDtl.limitVolume; // 体积
            v.newWareLocateParams.weightLimit = v.curSingleDtl.limitWeight; // 重量
            v.newWareLocateParams.quantityLimit = v.curSingleDtl.limitQuantity; // 数量
            v.curSingleDtl.limitVolumeFlag === '0'
            ? v.newWareLocateParams.volumeOpen = true
            : v.newWareLocateParams.volumeOpen = false; // 体积限制
            v.curSingleDtl.limitWeightFlag === '0'
            ? v.newWareLocateParams.weightOpen = true
            : v.newWareLocateParams.weightOpen = false; // 重量限制
            v.curSingleDtl.limitQuantityFlag === '0'
            ? v.newWareLocateParams.quantityOpen = true
            : v.newWareLocateParams.quantityOpen = false; // 数量限制
            v.curSingleDtl.goodsFlag === '0'
            ? v.newWareLocateParams.allowProduct = false
            : v.newWareLocateParams.allowProduct = true; // 混放批次
            v.curSingleDtl.batchFlag === '0'
            ? v.newWareLocateParams.allowBatch = false
            : v.newWareLocateParams.allowBatch = true; // 多批次
            // v.newWareLocateParams.pickingOpen = v.curSingleDtl.pickingFlag !== '0';
            v.newWareLocateParams.selectWareUse = v.curSingleDtl.pickingFlag; // 库位使用
            v.curSingleDtl.pickingFlag === '3' ? this.rejectsTalg = true : this.rejectsTalg = false;
          });

          v.selectWareBlock(v.curSingleDtl.warehouseId, () => {
            v.newWareLocateParams.selectWareArea = v.curSingleDtl.warehouseBlockId; // 库区名称
          });
        } else {
          // v.newWareLocateParams.selectWareHouse = ''; // 仓库名称
          // v.newWareLocateParams.selectWareArea = ''; // 库区名称
          // v.newWareLocateParams.wareLocateCode = ''; // 库位代码
          // v.newWareLocateParams.wareLocateName = ''; // 库位名称
          // v.newWareLocateParams.selectStatus = ''; // 库位状态
          // v.newWareLocateParams.sortId = ''; // SortID
          // v.newWareLocateParams.volumeLimit = ''; // 体积
          // v.newWareLocateParams.weightLimit = ''; // 重量
          // v.newWareLocateParams.quantityLimit = ''; // 数量
        }
      }
      if (!bool) {
        this.$refs['newWareLocateParams'].resetFields();
      }
    }
  },
  methods: {
    // 获取仓库下拉列表
    getWareHouseName () {
      var v = this;
      v.axios.get(api.wmsService + api.query_warehouse).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    }, // 选择仓库，获取所在库区
    selectWareBlock (val, callback) {
      this.newWareLocateParams.selectWareHouse = val;
      if (val) {
        this.getWareBlockName(callback); // 调用库区下拉列表
      }
    }, // 获取库区下拉列表，仓库和库区联动选择
    getWareBlockName (callback) {
      var v = this;
      var obj = {
        warehouseBlockStatus: null,
        warehouseBlockTypeList: null,
        warehouseId: this.newWareLocateParams.selectWareHouse
      };
      v.axios.post(api.wmsService + api.selectBlockType, obj).then(res => {
        if (res.data.code === 0) {
          v.wareBlockNameList = res.data.datas.filter(item => item.warehouseBlockType !== '20');
          callback && callback();
          if (res.data.datas.length === 0) {
            this.$Message.warning({
              content: '该仓库没有库区，无法新建！',
              duration: 5
            });
          }
        }
      });
    }, // 选择显示作为拣货库位多选框
    showCheckBox (val) {
      this.rejectsTalg = false;
      if (val.label.indexOf('不良') > -1) {
        this.rejectsTalg = true;
      }
      this.newWareLocateParams.selectWareArea = val.value;
      var obj = this.wareBlockNameList.find((val, index) => {
        return val.warehouseBlockId === this.newWareLocateParams.selectWareArea;
      });
      if (obj && obj.warehouseBlockType && this.wareLocateModalStatus === 'add') {
        this.isShowCheck = obj.warehouseBlockType;
        this.isAbnormal = false;
        if (obj.warehouseBlockType === '00') {
          // this.newWareLocateParams.pickingOpen = false;
          this.newWareLocateParams.selectWareUse = '0';
        } else if (obj.warehouseBlockType === '30') {
          this.isAbnormal = true;
          this.newWareLocateParams.selectWareUse = '2';
        } else {
          // this.newWareLocateParams.pickingOpen = true;
          this.newWareLocateParams.selectWareUse = '1';
        }
      }
    }, // 选择显示作为拣货库位多选框
    showCheckBoxEdit (val) {
      this.isShowCheck = val;
    },
    paramsObj () {
      var v = this;
      let obj = {};
      if (v.wareLocateModalStatus === 'add') {
        obj = {
          warehouseId: v.newWareLocateParams.selectWareHouse, // 仓库ID
          warehouseLocationCode: v.newWareLocateParams.wareLocateCode, // 库位代码
          warehouseLocationName: v.newWareLocateParams.wareLocateName, // 库位名称
          warehouseLocationStatus: v.newWareLocateParams.selectStatus, // 库位状态
          warehouseBlockId: v.newWareLocateParams.selectWareArea, // 库区ID
          sortId: v.newWareLocateParams.sortId, // SortID
          limitVolume: v.newWareLocateParams.volumeLimit, // 体积
          limitWeight: v.newWareLocateParams.weightLimit, // 重量
          limitQuantity: v.newWareLocateParams.quantityLimit, // 数量
          limitVolumeFlag: v.newWareLocateParams.volumeOpen === true ? '0' : '1', // 体积限制标志
          limitWeightFlag: v.newWareLocateParams.weightOpen === true ? '0' : '1', // 重量限制标志
          limitQuantityFlag: v.newWareLocateParams.quantityOpen === true ? '0' : '1', // 数量限制标志
          goodsFlag: v.newWareLocateParams.allowProduct === true ? '1' : '0', // 允许混放产品标志
          batchFlag: v.newWareLocateParams.allowBatch === true ? '1' : '0', // 允许混放批次标志
          // pickingFlag: v.newWareLocateParams.pickingOpen === true ? '1' : '0' // 作为拣货库位
          pickingFlag: v.newWareLocateParams.selectWareUse // 库位使用
        };
      } else {
        obj = {
          warehouseId: v.wareId, // 仓库ID
          warehouseBlockId: v.newWareLocateParams.selectWareArea, // 库区ID
          warehouseLocationId: v.wareLocateId, // 库位ID
          warehouseLocationCode: v.newWareLocateParams.wareLocateCode, // 库位代码
          warehouseLocationName: v.newWareLocateParams.wareLocateName, // 库位名称
          warehouseLocationStatus: v.newWareLocateParams.selectStatus, // 库位状态
          sortId: v.newWareLocateParams.sortId, // SortID
          limitVolume: v.newWareLocateParams.volumeLimit, // 体积
          limitWeight: v.newWareLocateParams.weightLimit, // 重量
          limitQuantity: v.newWareLocateParams.quantityLimit, // 数量
          limitVolumeFlag: v.newWareLocateParams.volumeOpen === true ? '0' : '1', // 体积限制标志
          limitWeightFlag: v.newWareLocateParams.weightOpen === true ? '0' : '1', // 重量限制标志
          limitQuantityFlag: v.newWareLocateParams.quantityOpen === true ? '0' : '1', // 数量限制标志
          goodsFlag: v.newWareLocateParams.allowProduct === true ? '1' : '0', // 允许混放产品标志
          batchFlag: v.newWareLocateParams.allowBatch === true ? '1' : '0', // 允许混放批次标志
          // pickingFlag: v.newWareLocateParams.pickingOpen === true ? '1' : '0' // 作为拣货库位
          pickingFlag: v.newWareLocateParams.selectWareUse // 库位使用
        };
      }
      return obj;
    },
    getCreateParams (name) {
      var v = this;
      var obj = this.paramsObj();
      if (v.newWareLocateParams.selectWareHouse && this.wareBlockNameList.length === 0) {
        this.$Message.warning({
          content: '该仓库没有库区，无法新建！',
          duration: 5
        });
        return;
      }
      v.$refs[name].validate((valid) => {
        let params = {
          warehouseId: obj.warehouseId,
          warehouseLocationCode: obj.warehouseLocationCode,
          warehouseLocationName: obj.warehouseLocationName
        };
        if (valid) {
          v.axios.post(api.wmsService + api.check_wareLocate, params).then(response => {
            if (response.data.code === 0) {
              if (response.data.datas) {
                v.$emit('createFail');
                v.$Message.error('库位代码或者库位名称已存在！' + '！');
              } else {
                v.axios.post(api.wmsService + api.addWareLocateData, obj).then(res => {
                  if (res.data.code === 0) {
                    v.$emit('createSuccess');
                    v.$Message.success('新增库位成功' + '！');
                  } else {
                    v.$emit('createFail');
                    v.$Message.warning('新增库位失败' + '！');
                  }
                });
              }
            }
          });
        } else {
          v.$Message.warning('新增库位失败' + '！');
        }
      });
    },
    getEditParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate((valid) => {
        if (valid) {
          if (obj.limitVolume === null) {
            obj.limitVolume = 0;
          }
          if (obj.limitWeight === null) {
            obj.limitWeight = 0;
          }
          if (obj.limitQuantity === null) {
            obj.limitQuantity = 0;
          }
          v.axios.post(api.wmsService + api.wareLocateWatchDtl, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('editSuccess');
              v.$Message.success('编辑库位成功' + '！');
            } else {
              v.$emit('editFail');
              v.$Message.warning('编辑库位失败' + '！');
            }
          });
        } else {
          v.$Message.warning('编辑库位失败' + '！');
        }
      });
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    }, // 新增库位
    addNewWareLocate () {
      this.getCreateParams('newWareLocateParams');
    }, // 新增和查看编辑库位
    editOrWatchWareLocate () {
      this.getEditParams('newWareLocateParams');
    }, // 重置表单
    resetNewWareLocate () {
      this.handleReset('newWareLocateParams');
    }
  }
};
</script>
