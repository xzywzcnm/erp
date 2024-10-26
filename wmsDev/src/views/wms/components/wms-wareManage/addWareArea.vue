<template >
  <div >
    <div class="modalItemContent" >
      <div class="addModalData" >
        <Form
            :model="newWareAreaParams"
            label-position="right"
            :label-width="90"
            ref="newWareAreaParams"
            :rules="ruleWareArea" >
          <Form-item label="库区代码：" prop="wareAreaCode" >
            <Input
                v-model.trim="newWareAreaParams.wareAreaCode" style="width:250px" placeholder="请输入库区代码" ></Input >
          </Form-item >
          <Form-item label="库区名称：" prop="wareAreaName" >
            <Input
                v-model.trim="newWareAreaParams.wareAreaName" style="width:250px" placeholder="请输入库区名称" ></Input >
          </Form-item >
          <Form-item label="SortID：" prop="sortId" >
            <Input
                v-model.trim="newWareAreaParams.sortId" style="width:250px" placeholder="请输入SortID" ></Input >
          </Form-item >
          <Form-item label="仓库：" prop="selectWareHouse" >
            <Select v-model="newWareAreaParams.selectWareHouse" style="width:250px" > <Option
                v-for="item in wareHouseTypeList"
                :value="item.warehouseId"
                :key="item.warehouseId" >{{ item.warehouseName }}</Option > </Select >
          </Form-item >
          <Form-item label="库区类型：" prop="selectWareAreaType" >
            <Select v-model="newWareAreaParams.selectWareAreaType" style="width:250px" >
            <Option value="00" >收货区</Option > <Option value="10" >标准区</Option > <Option value="11" >良品区</Option >
            <Option value="12" >不良品区</Option > <Option value="20" >退货区</Option > </Select >
          </Form-item >
          <Form-item label="状态：" prop="selectStatus" >
            <Select v-model="newWareAreaParams.selectStatus" style="width:250px" > <Option value="0" >可用</Option >
            <Option value="1" >停用</Option > </Select >
          </Form-item >
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
      wareHouseTypeList: [], // 选择仓库
      newWareAreaParams: {
        wareAreaCode: '', // 库区代码
        wareAreaName: '', // 库区名称
        sortId: '', // SortID
        selectWareHouse: '', // 选择仓库
        selectWareAreaType: '', // 选择库区类型
        selectStatus: '' // 选择状态
      },
      ruleWareArea: {
        wareAreaCode: [
          {
            required: true,
            message: '库区代码不能为空',
            trigger: 'blur'
          }
        ],
        wareAreaName: [
          {
            required: true,
            message: '库区名称不能为空',
            trigger: 'blur'
          }
        ],
        selectWareHouse: [
          {
            required: true,
            message: '仓库不能为空',
            trigger: 'change'
          }
        ],
        selectWareAreaType: [
          {
            required: true,
            message: '库区类型不能为空',
            trigger: 'change'
          }
        ],
        selectStatus: [
          {
            required: true,
            message: '库区状态不能为空',
            trigger: 'change'
          }
        ]
      }
    };
  },
  created () {
    this.getWareAreaName(); // 渲染仓库列表
  },
  methods: {
    // 获取仓库下拉列表
    getWareAreaName () {
      var v = this;
      v.axios.post(api.selectWareBlockName).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    paramsObj () {
      var v = this;
      var obj = {
        warehouseId: v.newWareAreaParams.selectWareHouse, // 仓库标记
        warehouseBlockCode: v.newWareAreaParams.wareAreaCode,
        warehouseBlockName: v.newWareAreaParams.wareAreaName,
        sortId: v.newWareAreaParams.sortId,
        warehouseBlockType: v.newWareAreaParams.selectWareAreaType,
        warehouseBlockStatus: v.newWareAreaParams.selectStatus
      };
      return obj;
    },
    getCreateParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          v.axios.post(api.addWareAreaData, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('createSuccess');
              // this.$store.commit('wareAreaWatchFlag', true);
              v.$Message.success('新增库区成功！');
            } else {
              v.$emit('createFail');
            }
          });
        } else {
          v.$Message.warning('新增库区失败！');
        }
      });
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    }, // 新增库区
    addNewWareArea () {
      this.getCreateParams('newWareAreaParams');
    }, // 重置表单
    resetNewWareArea () {
      this.handleReset('newWareAreaParams');
    }
  }
};
</script>
