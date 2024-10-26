<template >
  <div>
    <!--拣货单设置-->
    <div class="packWorkCard">
      <div class="packCardTitle">
        <h3>拣货单设置</h3>
      </div>
      <div style="background:#fff;padding:10px 10px;">
        <Form class="normalTop" :model="pickingParams" :label-width="250" label-position="left">
          <FormItem label="单品拣货单打印时货品列表输入顺序:">
            <dyt-select v-model="pickingParams.singlePrintOrder" style="width: 300px">
              <Option v-for="item in packSortList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="多品拣货单打印时货品列表输入顺序:">
            <dyt-select v-model="pickingParams.multiPrintOrder" style="width: 300px">
              <Option v-for="item in packSortList" :key="item.value" :value="item.value">{{ item.label }}</Option>
            </dyt-select>
          </FormItem>
        </Form>
      </div>
    </div>
    <!-- 包装作业设置 -->
    <div class="packWorkCard">
      <div class="packCardTitle">
        <h3>包装作业设置</h3>
      </div>
      <div style="background:#fff;padding:10px 10px;">
        <Form class="normalTop" :model="pageParams" :label-width="250" label-position="left">
          <!-- 自动分拣 -->
          <Form-item label="多品多件包裹自动分拣功能：">
            <RadioGroup v-model="pageParams.autoPack">
              <Radio label="Y">开启</Radio>
              <Radio label="N">关闭</Radio>
            </RadioGroup>
            <Checkbox v-model="pageParams.print" style="margin-left:10px;">分拣时打印地址面单
            </Checkbox>
          </Form-item>
          <!--拣货复核时进行包装-->
          <Form-item label="拣货复核时进行包装：">
            <RadioGroup v-model="pageParams.reviewPackaging">
              <Radio label="Y">是</Radio>
              <Radio label="N">否</Radio>
            </RadioGroup>
          </Form-item>
          <!-- 称重 -->
          <Form-item label="是否要在拣货复核时对包裹称重?">
            <RadioGroup v-model="pageParams.weighingPack">
              <Radio label="Y">称重</Radio>
              <Radio label="N">不称重</Radio>
            </RadioGroup>
          </Form-item>
          <!-- 标记为已发货 -->
          <Form-item label="对包装作业中的已包装的包裹标记为已发货?">
            <RadioGroup v-model="pageParams.stampPackage">
              <Radio label="Y">是</Radio>
              <Radio label="N">否</Radio>
            </RadioGroup>
          </Form-item>
          <!-- 语音播报 -->
          <Form-item label="是否启用语音播报货位号?">
            <RadioGroup v-model="pageParams.speechpackNum">
              <Radio label="Y">是</Radio>
              <Radio label="N">否</Radio>
            </RadioGroup>
          </Form-item>
        </Form>
      </div>
    </div>
    <!-- 分拣架设置 -->
    <div class="packWorkCard" style="marginTop:50px;">
      <div class="packCardTitle">
        <h3>分拣架设置(仅在多品多件包裹自动分拣功能开启时可用)</h3>
      </div>
      <div style="background:#fff;padding:10px 10px;">
        <Row>
          <Col span="8">
          <div style="marginTop:10px;marginLeft:40%;">
            <Checkbox v-model="pickBoxSetting.leftBoxStatus">启用左侧分拣货架</Checkbox>
          </div>
          <div style="marginLeft:30%;marginTop:20px;">
            货架矩阵 <dyt-select v-model="pickBoxSetting.leftBoxRow" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
            </dyt-select> 行
            <dyt-select v-model="pickBoxSetting.leftBoxCol" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
            </dyt-select> 列
          </div>
          <div style="marginTop:20px;">
            <Row class="pick_box_setting" v-for="(item, index) in Number(pickBoxSetting.leftBoxRow)" :key="item">
              <Col v-for="(i, j) in Number(pickBoxSetting.leftBoxCol)" :key="j">
              <div class="pickBox">
                <div style="border-top: 15px solid #ed4014;border-right: 15px solid transparent;float:left;"></div>
                <div style="text-align:center;margin-top:15px;">{{ 100 + 10 * (index + 1) + (j + 1) }}</div>
              </div>
              </Col>
            </Row>
          </div>
          </Col>
          <Col span="8" style="border-left:1px solid #d7d7d7;">
          <div style="marginTop:10px;marginLeft:40%;">
            <Checkbox v-model="pickBoxSetting.midBoxStatus">启用中间分拣货架</Checkbox>
          </div>
          <div style="marginLeft:30%;marginTop:20px;">
            货架矩阵 <dyt-select v-model="pickBoxSetting.midBoxRow" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
            </dyt-select> 行
            <dyt-select v-model="pickBoxSetting.midBoxCol" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
            </dyt-select> 列
          </div>
          <div style="marginTop:20px;marginLeft:10px;">
            <Row class="pick_box_setting" v-for="(item, index) in Number(pickBoxSetting.midBoxRow)" :key="item">
              <Col v-for="(i, j) in Number(pickBoxSetting.midBoxCol)" :key="j">
              <div class="pickBox">
                <div style="border-top: 15px solid #ff9900;border-right: 15px solid transparent;float:left;"></div>
                <div style="text-align:center;marginTop:15px;">{{ 200 + 10 * (index + 1) + (j + 1) }}</div>
              </div>
              </Col>
            </Row>
          </div>
          </Col>
          <Col span="8" style="border-left:1px solid #d7d7d7;">
          <div style="marginTop:10px;marginLeft:40%;">
            <Checkbox v-model="pickBoxSetting.rigBoxStatus">启用右侧分拣货架</Checkbox>
          </div>
          <div style="marginLeft:30%;marginTop:20px;">
            货架矩阵 <dyt-select v-model="pickBoxSetting.rigBoxRow" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
            </dyt-select> 行
            <dyt-select v-model="pickBoxSetting.rigBoxCol" style="width:50px;margin:0 5px;">
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="4">4</Option>
              <Option value="5">5</Option>
            </dyt-select> 列
          </div>
          <div style="marginTop:20px;marginLeft:10px;">
            <Row class="pick_box_setting" v-for="(item, index) in Number(pickBoxSetting.rigBoxRow)" :key="item">
              <Col v-for="(i, j) in Number(pickBoxSetting.rigBoxCol)" :key="j">
              <div class="pickBox">
                <div style="border-top: 15px solid #2db7f5;border-right: 15px solid transparent;float:left;"></div>
                <div style="text-align:center;marginTop:15px;">{{ 300 + 10 * (index + 1) + (j + 1) }}</div>
              </div>
              </Col>
            </Row>
          </div>
          </Col>
        </Row>
      </div>
    </div>
    <!-- 保存 -->
    <div style="margin: 20px 10px;padding:10px 10px;background-color: #169bd5;">
      <Button style="marginLeft:96%;" v-if="getPermission('packageSettingCommon_updateSortingSetting')" @click="save">保存 </Button>
    </div>
  </div>
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      packSortList: [
        {
          label: '库区组-》库区-》库位sortID 升序',
          value: '0'
        }, {
          label: '仅按货品SKU字符升序',
          value: '1'
        }, {
          label: '仅按货品库位字符升序',
          value: '2'
        }
      ],
      pickingParams: {
        singlePrintOrder: '0',
        multiPrintOrder: '0'
      },
      pageParams: { // 包装作业设置
        autoPack: 'Y', // 自动分拣
        print: false, // 是否打印
        reviewPackaging: 'Y', // 拣货复核时包装
        weighingPack: 'Y', // 称重
        stampPackage: 'Y', // 标记已发货
        speechpackNum: 'Y' // 语音播报
      },
      pickBoxSetting: { // 分拣架设置
        leftBoxStatus: true, // 启用左侧分拣货架
        midBoxStatus: true, // 中间
        rigBoxStatus: true, // 右侧
        leftBoxRow: '4', // 左侧货架行
        leftBoxCol: '5', // 列
        midBoxRow: '4',
        midBoxCol: '5',
        rigBoxRow: '4',
        rigBoxCol: '5'
      }
    };
  },
  methods: {
    save () { // 保存
      let v = this;
      if (!v.pickBoxSetting.leftBoxStatus && !v.pickBoxSetting.midBoxStatus && !v.pickBoxSetting.rigBoxStatus) {
        v.$Message.error('请至少选择一个拣货架');
        return false;
      }
      let pos = [];
      // 组装参数，N否Y是
      let leftShelfTypeVal = v.pickBoxSetting.leftBoxRow + 'x' + v.pickBoxSetting.leftBoxCol;
      let midShelfTypeVal = v.pickBoxSetting.midBoxRow + 'x' + v.pickBoxSetting.midBoxCol;
      let rightShelfTypeVal = v.pickBoxSetting.rigBoxRow + 'x' + v.pickBoxSetting.rigBoxCol;
      pos.push({
        paramKey: 'enableAutoSorting',
        paramValue: v.pageParams.autoPack
      }, {
        paramKey: 'enableSortingPrinted',
        paramValue: v.pageParams.print ? 'Y' : 'N'
      }, {
        paramKey: 'enablePackingWeight',
        paramValue: v.pageParams.weighingPack
      }, {
        paramKey: 'enablePackingPrintedPackageShip',
        paramValue: v.pageParams.stampPackage
      }, {
        paramKey: 'enableVoiceBroadcast',
        paramValue: v.pageParams.speechpackNum
      }, {
        paramKey: 'enableLeftShelfType',
        paramValue: v.pickBoxSetting.leftBoxStatus ? 'Y' : 'N'
      }, {
        paramKey: 'enableMidShelfType',
        paramValue: v.pickBoxSetting.midBoxStatus ? 'Y' : 'N'
      }, {
        paramKey: 'enableRightShelfType',
        paramValue: v.pickBoxSetting.rigBoxStatus ? 'Y' : 'N'
      }, {
        paramKey: 'singlePrintOrder',
        paramValue: v.pickingParams.singlePrintOrder
      }, {
        paramKey: 'multiPrintOrder',
        paramValue: v.pickingParams.multiPrintOrder
      }, {
        paramKey: 'leftShelfType',
        paramValue: leftShelfTypeVal
      }, {
        paramKey: 'midShelfType',
        paramValue: midShelfTypeVal
      }, {
        paramKey: 'rightShelfType',
        paramValue: rightShelfTypeVal
      }, {
        paramKey: 'enablePickingReviewForPackaging',
        paramValue: v.pageParams.reviewPackaging
      });
      let obj = {
        paramBoList: pos
      };
      v.axios.put(api.wmsService + api.update_sortingSetting, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('保存成功');
        }
      });
    },
    getSetting () { // 获取设置信息
      let v = this;
      if (!v.getPermission('packageSettingCommon_queryErpCommonSettingParam')) return;
      let obj = {
        typeList: ['packing', 'sorting', 'pickingGoods'] // packing表示查询包装作业设置，sorting表示查询分拣架设置 pickingGoods拣货单
      };
      v.axios.post(api.wmsService + api.get_packageSetting, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              if (n.paramKey === 'leftShelfType') { // 获取拣货架
                let value = n.paramValue.split('x');
                v.pickBoxSetting.leftBoxRow = value[0];
                v.pickBoxSetting.leftBoxCol = value[1];
              } else if (n.paramKey === 'midShelfType') {
                let value = n.paramValue.split('x');
                v.pickBoxSetting.midBoxRow = value[0];
                v.pickBoxSetting.midBoxCol = value[1];
              } else if (n.paramKey === 'rightShelfType') {
                let value = n.paramValue.split('x');
                v.pickBoxSetting.rigBoxRow = value[0];
                v.pickBoxSetting.rigBoxCol = value[1];
              } else if (n.paramKey === 'enableLeftShelfType') { // 获取拣货架状态
                if (n.paramValue === 'Y') {
                  v.pickBoxSetting.leftBoxStatus = true;
                } else {
                  v.pickBoxSetting.leftBoxStatus = false;
                }
              } else if (n.paramKey === 'enableMidShelfType') {
                if (n.paramValue === 'Y') {
                  v.pickBoxSetting.midBoxStatus = true;
                } else {
                  v.pickBoxSetting.midBoxStatus = false;
                }
              } else if (n.paramKey === 'enableRightShelfType') {
                if (n.paramValue === 'Y') {
                  v.pickBoxSetting.rigBoxStatus = true;
                } else {
                  v.pickBoxSetting.rigBoxStatus = false;
                }
              } else if (n.paramKey === 'enableAutoSorting') { // 获取包装设置
                v.pageParams.autoPack = n.paramValue;
              } else if (n.paramKey === 'enableSortingPrinted') {
                if (n.paramValue === 'Y') {
                  v.pageParams.print = true;
                } else {
                  v.pageParams.print = false;
                }
              } else if (n.paramKey === 'enablePackingWeight') {
                v.pageParams.weighingPack = n.paramValue;
              } else if (n.paramKey === 'enablePickingReviewForPackaging') {
                v.pageParams.reviewPackaging = n.paramValue;
              } else if (n.paramKey === 'enablePackingPrintedPackageShip') {
                v.pageParams.stampPackage = n.paramValue;
              } else if (n.paramKey === 'enableVoiceBroadcast') {
                v.pageParams.speechpackNum = n.paramValue;
              } else if (n.paramKey === 'singlePrintOrder') {
                if (n.paramValue !== null && n.paramValue !== undefined) {
                  v.pickingParams.singlePrintOrder = n.paramValue;
                }
              } else if (n.paramKey === 'multiPrintOrder') {
                if (n.paramValue !== null && n.paramValue !== undefined) {
                  v.pickingParams.multiPrintOrder = n.paramValue;
                }
              }
            });
          }
        }
      });
    }
  },
  created () {
    let v = this;
    v.getPermissionCallback('logistics_sortOrderSetting').then(() => {
      v.getSetting();
    });
  }
};
</script >

<style scoped >
.packWorkCard {
  background-color: #fff;
  border: 1px solid #d7d7d7;
}

.packCardTitle {
  padding: 10px;
  background-color: #f7f7f7;
  border-bottom: 1px solid #d7d7d7;
}

.pick_box_setting {
  display: flex !important;
  flex-wrap: wrap;
}
.pick_box_setting .pickBox {
  width: 93px;
  height: 50px;
  margin-top: 5px;
  margin-bottom: 5px;
  border: 1px solid #000;
  font-weight: bold;
  margin-right: 11px;
  box-sizing: border-box;
}
.pick_box_setting .ivu-col:last-child .pickBox {
  margin-right: 0 !important;
}
</style >
