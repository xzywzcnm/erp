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
                    @on-change="showCheckBox" > <Option
                    v-for="item in wareBlockNameList"
                    :value="item.warehouseBlockId"
                    :key="item.warehouseBlockId" >{{ item.warehouseBlockName }}
                <span v-if="item.warehouseBlockType === '00'" >(收货区)</span >
                <span v-if="item.warehouseBlockType === '10'" >(标准区)</span >
                <span v-if="item.warehouseBlockType === '11'" >(良品区)</span >
                <span v-if="item.warehouseBlockType === '12'" >(不良品区)</span >
                <span v-if="item.warehouseBlockType === '20'" >(退货区)</span > </Option > </Select >
              </Col >
              <Col span="7" >
                <Form-item >
                  <Checkbox
                      v-model="newWareLocateParams.pickingOpen"
                      v-if="isShowCheck === '11' || isShowCheck === '12'" >作为拣货库位
                  </Checkbox >
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
          <Form-item label="SortID：" prop="sortId" >
            <Input v-model.trim="newWareLocateParams.sortId" style="width:220px" ></Input >
          </Form-item >
          <!-- <Form-item label="限制条件："></Form-item> -->
          <p >
            <span style="font-weight:bold;" >限制条件</span >
          </p >
          <div style="border:1px lightgrey solid;padding-top:15px;margin-right:20px;" >
            <Row >
              <Col span="14" >
                <Form-item label="体积限制：" prop="volumeLimit" >
                  <Input v-model.trim="newWareLocateParams.volumeLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item prop="volumeOpen" style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.volumeOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="14" >
                <Form-item label="重量限制：" prop="weightLimit" >
                  <Input v-model.trim="newWareLocateParams.weightLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item prop="weightOpen" style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.weightOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="14" >
                <Form-item label="数量限制：" prop="quantityLimit" >
                  <Input v-model.trim="newWareLocateParams.quantityLimit" style="width:220px" ></Input >
                </Form-item >
              </Col >
              <Col span="8" offset="2" >
                <Form-item prop="quantityOpen" style="position:relative;left:10px;" >
                  <Checkbox
                      v-model="newWareLocateParams.quantityOpen"
                      style="position:relative;right:70px;" >开启
                  </Checkbox >
                </Form-item >
              </Col >
            </Row >
            <Row >
              <Col span="10" >
                <Form-item prop="allowProduct" >
                  <Checkbox v-model="newWareLocateParams.allowProduct" >允许混放产品</Checkbox >
                </Form-item >
              </Col >
              <Col span="12" >
                <Form-item prop="allowBatch" >
                  <Checkbox v-model="newWareLocateParams.allowBatch" >允许混放批次</Checkbox >
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
        pickingOpen: true // 作为拣货库位
      },
      wareHouseTypeList: [], // 仓库下拉列表
      wareBlockNameList: [], // 库区下拉列表
      isShowCheck: '',
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
    showCheckBox (val) {
      // 选择显示作为拣货库位多选框
      this.newWareLocateParams.selectWareArea = val;
      var obj = this.wareBlockNameList.find((val, index) => {
        return val.warehouseBlockId === this.newWareLocateParams.selectWareArea;
      });
      this.isShowCheck = obj.warehouseBlockType;
    },
    paramsObj () {
      var v = this;
      var obj = {
        warehouseId: v.newWareLocateParams.selectWareHouse, // 仓库ID
        warehouseLocationCode: v.newWareLocateParams.wareLocateCode, // 库位代码
        warehouseLocationName: v.newWareLocateParams.wareLocateName, // 库位名称
        warehouseLocationType: v.newWareLocateParams.selectType, // 库位类型
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
        pickingFlag: this.isShowCheck === '11' || this.isShowCheck === '12' ? '1' : '0' // 作为拣货库位
      };
      return obj;
    },
    getCreateParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          v.axios.post(api.addWareLocateData, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('createSuccess');
              v.$Message.success('新增库位成功！');
            } else {
              v.$emit('createFail');
            }
          });
        } else {
          v.$Message.warning('新增库位失败！');
        }
      });
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    },
    addNewWareLocate () {
      // 新增库位
      this.getCreateParams('newWareLocateParams');
    },
    resetNewWareLocate () {
      // 重置表单
      this.handleReset('newWareLocateParams');
    }
  }
};
</script>
