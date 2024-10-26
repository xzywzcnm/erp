<template >
  <div >
    <div class="modalItemContent" >
      <!--{{curSingleDtl}}-->
      <div class="addModalData" >
        <Form
            :model="newWareLocateParams"
            label-position="right"
            :label-width="90"
            ref="newWareLocateParams"
            :rules="ruleWareLocate" >
          <Form-item label="所属仓库：：" prop="selectWareHouse" >
            <Select
                v-model="newWareLocateParams.selectWareHouse"
                @on-change="selectWareBlock"
                style="width:220px"
                placeholder="请选择仓库" > <Option
                v-for="i in wareHouseTypeList"
                :value="i.warehouseId"
                :key="i.warehouseId" >{{ v.warehouseName }}</Option > </Select >
          </Form-item >
          <Form-item label="所属库区：" prop="selectWareArea" >
            <Row >
              <Col span="16" >
                <Select
                    v-model="newWareLocateParams.selectWareArea"
                    style="width:220px"
                    placeholder="请选择库区"
                    @on-change="showCheckBox"
                    label-in-value > <Option
                    v-for="item in wareBlockNameList"
                    :value="item.warehouseBlockId"
                    :key="item.warehouseBlockId" >{{ item.warehouseBlockName }}
                <span v-if="item.warehouseBlockType === '00'" >(收货区)</span >
                <!--收货区-->
                <span v-if="item.warehouseBlockType === '10'" >(标准区)</span ><!--标准区-->
                <span v-if="item.warehouseBlockType === '11'" >(良品区)</span >
                <span v-if="item.warehouseBlockType === '12'" >(不良品区)</span >
                <span v-if="item.warehouseBlockType === '20'" >(退货区)</span > </Option > </Select >
              </Col >
              <Col span="7" >
                <Form-item >
                  <!--<Checkbox v-model="newWareLocateParams.pickingOpen" v-if="curSingleDtl.warehouseBlockType ==='11'||curSingleDtl.warehouseBlockType ==='12'">作为拣货库位</Checkbox>-->
                  <Checkbox v-model="newWareLocateParams.pickingOpen" >作为拣货库位</Checkbox >
                </Form-item >
              </Col >
            </Row >
          </Form-item >
          <Form-item label="库位代码：" prop="wareLocateCode" >
            <Input
                v-model.trim="newWareLocateParams.wareLocateCode"
                style="width:220px"
                placeholder="请输入库位代码" ></Input >
          </Form-item >
          <Form-item label="库位名称：" prop="wareLocateName" >
            <Input
                v-model.trim="newWareLocateParams.wareLocateName"
                style="width:220px"
                placeholder="请输入库位名称" ></Input >
          </Form-item >
          <Form-item label="库位类型：" prop="selectType" >
            <Select v-model="newWareLocateParams.selectType" style="width:220px" > <Option value="0" >地面平仓</Option >
            <Option value="1" >重力式货架</Option > <Option value="2" >窄巷道货架</Option > </Select >
          </Form-item >
          <Form-item label="状态：" prop="selectStatus" >
            <Select v-model="newWareLocateParams.selectStatus" style="width:220px" > <Option value="0" >可用</Option >
            <Option value="1" >停用</Option > </Select >
          </Form-item >
          <Form-item label="SortID：" >
            <Input v-model.trim="newWareLocateParams.sortId" style="width:220px" ></Input >
          </Form-item >
          <!-- <Form-item label="限制条件："></Form-item> -->
          <p >
            <span style="font-weight:bold;" >限制条件</span >
          </p >
          <div style="border:1px lightgrey solid;padding-top:15px;margin-right:20px;" >
            <Row >
              <Col span="14" >
                <Form-item label="体积限制：" >
                  <Input v-model.trim="newWareLocateParams.volumeLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.volumeOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="14" >
                <Form-item label="重量限制：" >
                  <Input v-model.trim="newWareLocateParams.weightLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.weightOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="14" >
                <Form-item label="数量限制：" >
                  <Input v-model.trim="newWareLocateParams.quantityLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.quantityOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="10" >
                <Form-item >
                  <Checkbox v-model="newWareLocateParams.allowProduct" >
                    允许混放产品
                  </Checkbox >
                </Form-item >
              </Col >
              <Col span="12" >
                <Form-item >
                  <Checkbox v-model="newWareLocateParams.allowBatch" >
                    允许混放批次
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
          </div >
        </Form >
      </div >
    </div >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      newWareLocateParams: {
        selectWareHouse: '', // 所属仓库
        selectWareArea: '', // 所属库区
        wareLocateCode: '', // 库位代码
        wareLocateName: '', // 库位名称
        selectType: '0', // 库位类型
        selectStatus: '0', // 库位状态
        sortId: '', // SortID
        volumeLimit: '', // 体积限制
        weightLimit: '', // 重量限制
        quantityLimit: '', // 数量限制
        volumeOpen: false, // 体积限制标志
        weightOpen: false, // 重量限制标志
        quantityOpen: false, // 数量限制标志
        allowProduct: false, // 产品混放标志
        allowBatch: false, // 批次混放标志
        pickingOpen: false // 作为拣货库位
      },
      wareHouseTypeList: [], // 仓库下拉列表
      wareBlockNameList: [], // 库区下拉列表
      isShowCheck: {},
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
        wareLocateCode: [
          {
            required: true,
            message: '库位代码不能为空',
            trigger: 'blur'
          }
        ],
        wareLocateName: [
          {
            required: true,
            message: '库位名称不能为空',
            trigger: 'blur'
          }
        ],
        selectType: [
          {
            required: true,
            message: '库位类型不能为空',
            trigger: 'change'
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
  props: {
    curSingleDtl: {
      // 查看库位当前行的数据
      default: null
    },
    openFlag: {
      // 打开模态框的标记
      default: null
    },
    wareId: {
      // 编辑当前行仓库ID
      default: null
    },
    wareLocateId: {
      // 编辑当前行库位ID
      default: null
    },
    wareBlockId: {
      // 编辑当前行库区ID
      default: null
    }
  },
  watch: {
    '$store.state.wareLocateWatchFlag': function (bool) {
      // 查看当前库位信息
      let v = this;
      if (bool) {
        v.newWareLocateParams.selectWareHouse = v.curSingleDtl.warehouseId; // 仓库名称
        v.newWareLocateParams.selectWareArea = v.curSingleDtl.warehouseBlockId; // 库区名称
        v.newWareLocateParams.wareLocateCode = v.curSingleDtl.warehouseLocationCode; // 库位代码
        v.newWareLocateParams.wareLocateName = v.curSingleDtl.warehouseLocationName; // 库位名称
        v.newWareLocateParams.selectType = v.curSingleDtl.warehouseLocationType; // 库位类型
        v.newWareLocateParams.selectStatus = v.curSingleDtl.warehouseLocationStatus; // 库位状态
        v.newWareLocateParams.sortId = v.curSingleDtl.sortId; // SortID
        v.newWareLocateParams.volumeLimit = v.curSingleDtl.limitVolume; // 体积
        v.newWareLocateParams.weightLimit = v.curSingleDtl.limitWeight; // 重量
        v.newWareLocateParams.quantityLimit = v.curSingleDtl.limitQuantity; // 数量
        v.curSingleDtl.limitVolumeFlag === '0'
        ? (v.newWareLocateParams.volumeOpen = true)
        : (v.newWareLocateParams.volumeOpen = false); // 体积限制
        v.curSingleDtl.limitWeightFlag === '0'
        ? (v.newWareLocateParams.weightOpen = true)
        : (v.newWareLocateParams.weightOpen = false); // 重量限制
        v.curSingleDtl.limitQuantityFlag === '0'
        ? (v.newWareLocateParams.quantityOpen = true)
        : (v.newWareLocateParams.quantityOpen = false); // 数量限制
        v.curSingleDtl.goodsFlag === '0'
        ? (v.newWareLocateParams.allowProduct = false)
        : (v.newWareLocateParams.allowProduct = true); // 混放批次
        v.curSingleDtl.batchFlag === '0'
        ? (v.newWareLocateParams.allowBatch = false)
        : (v.newWareLocateParams.allowBatch = true); // 多批次
        //        v.curSingleDtl.warehouseBlockType ==='11' || v.curSingleDtl.warehouseBlockType ==='12'? v.newWareLocateParams.pickingOpen = true : v.newWareLocateParams.pickingOpen = false
        v.newWareLocateParams.pickingOpen = v.curSingleDtl.pickingFlag !== '0';
      } else {
        v.newWareLocateParams.selectWareHouse = ''; // 仓库名称
        v.newWareLocateParams.selectWareArea = ''; // 库区名称
        v.newWareLocateParams.wareLocateCode = ''; // 库位代码
        v.newWareLocateParams.wareLocateName = ''; // 库位名称
        v.newWareLocateParams.selectType = ''; // 库位类型
        v.newWareLocateParams.selectStatus = ''; // 库位状态
        v.newWareLocateParams.sortId = ''; // SortID
        v.newWareLocateParams.volumeLimit = ''; // 体积
        v.newWareLocateParams.weightLimit = ''; // 重量
        v.newWareLocateParams.quantityLimit = ''; // 数量
      }
    }
  },
  created () {
    this.getWareHouseName(); // 调用仓库下拉列表
  },
  methods: {
    getWareHouseName () {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectWareHouseName).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    selectWareBlock (val) {
      // 选择仓库，获取所在库区
      this.newWareLocateParams.selectWareHouse = val;
      this.getWareBlockName(); // 调用库区下拉列表
    },
    showCheckBox (val) {
      // 选择显示作为拣货库位多选框
      this.isShowCheck = val;
    },
    getWareBlockName () {
      // 获取库区下拉列表，仓库和库区联动选择
      var v = this;
      var obj = {
        warehouseBlockStatus: null,
        warehouseBlockTypeList: null,
        warehouseId: this.newWareLocateParams.selectWareHouse
      };
      v.axios.post(api.selectBlockType, obj).then(res => {
        if (res.data.code === 0) {
          v.wareBlockNameList = res.data.datas;
        }
      });
    },
    paramsObj () {
      var v = this;
      var obj = {
        warehouseId: v.wareId, // 仓库ID
        warehouseBlockId: v.wareBlockId, // 库区ID
        warehouseLocationId: v.wareLocateId, // 库位ID
        warehouseLocationCode: v.newWareLocateParams.wareLocateCode, // 库位代码
        warehouseLocationName: v.newWareLocateParams.wareLocateName, // 库位名称
        warehouseLocationType: v.newWareLocateParams.selectType, // 库位类型
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
        pickingFlag: v.newWareLocateParams.pickingOpen === true ? '1' : '0' // 作为拣货库位
      };
      return obj;
    },
    getEditParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          v.axios.post(api.wareLocateWatchDtl, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('editSuccess');
              v.$Message.success('编辑库位成功！');
            } else {
              v.$emit('editFail');
            }
          });
        } else {
          v.$Message.warning('编辑库位失败！');
        }
      });
    },
    editOrWatchWareLocate () {
      // 新增和查看编辑库位
      this.getEditParams('newWareLocateParams');
    }
  }
};
</script>
