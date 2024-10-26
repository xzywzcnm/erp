<template >
  <div >
    <Card title="选择邮寄方式" >
      <!--全部-->
      <Checkbox
          :value="checkAllShip"
          :indeterminate="indeterminateAll"
          @click.prevent.native="handleCheckAllShip"
          style="font-size: 14px;padding-bottom: 10px;" >全部<span class="redColor pl5" >({{ shipTreeData[0].pickingNumber }})</span >
      </Checkbox >
      <!--邮寄方式 循环-->
      <div v-for="(item, index) in shipTreeData[0].queryMailResultList" :key="index" >
        <p >
          <Icon
              type="md-arrow-dropright"
              :class="{ transformArr: item.isTrans }"
              class="arr-icon"
              @click.prevent.native="item.isTrans = !item.isTrans" ></Icon >
          <Checkbox
              :indeterminate="item.indeterminate"
              :value="item.checkAll"
              @click.prevent.native="handleCheckAll(item)" ><span
              class="check-text" style="color: #333" >{{ item.logisticsDealerName
                      }}<span
                style="white-space: nowrap" class="redColor" >({{ item.pickingNumber }})</span ></span ></Checkbox >
        </p >
        <div v-if="item.isTrans" >
          <p
              style="padding-left: 30px;" v-for="(shippingMethods,
                    childIndex) in item.queryMailResultList" :key="childIndex" >
            <CheckboxGroup
                v-model="item.checkAllGroup" @on-change="checkAllGroupChange(item.checkAllGroup, item)" >
              <Checkbox :label="shippingMethods.logisticsMailCode" ><span class="check-text" >{{ shippingMethods.logisticsMailName
                          }}<span
                    style="white-space: nowrap" class="redColor" >({{ shippingMethods.pickingNumber }})</span ></span >
              </Checkbox >
            </CheckboxGroup >
          </p >
        </div >
      </div >
    </Card >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'shipTree',
  mixins: [Mixin],
  data () {
    return {
      checkAllShip: false,
      indeterminateAll: false,
      shipTreeData: [
        {
          logisticsDealerName: '全部',
          pickingNumber: 0,
          logisticsDealerCode: '0000',
          expand: true,
          queryMailResultList: []
        }
      ]
    };
  },
  created () {
    this.getAllShipMethod();
  },
  props: {
    params: {
      // 查询参数
      type: Object,
      default: () => {}
    }
  },
  watch: {},
  methods: {
    handleCheckAllShip () {
      // 改变全部选中状态
      this.shipTreeData[0].queryMailResultList.forEach(item => {
        if (this.checkAllShip) {
          this.$nextTick(() => {
            item.checkAll = false;
            item.checkAllGroup = [];
            this.checkAllShipHandel(true);
          });
        } else {
          this.$nextTick(() => {
            item.checkAll = true;
            item.checkAllGroup = item.queryMailResultList.map(i => {
              return i.logisticsMailCode;
            });
            this.checkAllShipHandel(true);
          });
        }
      });
      this.$emit('changeShip', this.treeParams());
      // this.searchParams.logisticType = this.treeParams();
      // this.searchData();
    },
    handleCheckAll (item) {
      // 选择物流商
      if (item.checkAll) {
        this.$nextTick(() => {
          item.checkAll = false;
          item.checkAllGroup = [];
          this.checkAllShipHandel(); // 更新全部的状态
        });
      } else {
        this.$nextTick(() => {
          item.checkAll = true;
          item.checkAllGroup = item.queryMailResultList.map(i => {
            return i.logisticsMailCode;
          });
          this.checkAllShipHandel(); // 更新全部的状态
        });
      }
    },
    checkAllGroupChange (data, item) {
      // 更新邮寄方式
      if (data.length === item.queryMailResultList.length) {
        item.indeterminate = false;
        item.checkAll = true;
      } else if (data.length > 0) {
        item.indeterminate = true;
        item.checkAll = false;
      } else {
        item.indeterminate = false;
        item.checkAll = false;
      }
      this.checkAllShipHandel(); //  更新全部checkBox的展示
    },
    checkAllShipHandel (search) {
      // search Boolean
      // 更新选择全部checkBox的状态
      let isCheck = false;
      let checkLen = 0;
      this.shipTreeData[0].queryMailResultList.forEach(i => {
        if (i.checkAllGroup.length > 0) {
          isCheck = true;
          if (i.checkAllGroup.length === i.queryMailResultList.length) {
            checkLen += 1;
          }
        }
      });
      if (isCheck) {
        if (checkLen === this.shipTreeData[0].queryMailResultList.length) {
          this.checkAllShip = true;
          this.indeterminateAll = false;
        } else {
          this.checkAllShip = false;
          this.indeterminateAll = true;
        }
      } else {
        this.checkAllShip = false;
        this.indeterminateAll = false;
      }
      if (!search) {
        this.$emit('changeShip', this.treeParams());
        // this.searchParams.logisticType = this.treeParams();
        // this.searchData();
      }
    },
    getAllShipMethod () {
      // 获取所有的邮寄方式
      let v = this;
      let obj = JSON.parse(JSON.stringify(this.params));
      delete obj.pageSize;
      delete obj.pageNum;
      v.axios.post(api.get_chooseShippingMethodOnSupTkNum, obj).then(res => {
        if (res.data.code === 0 && res.data.datas) {
          res.data.datas.forEach(i => {
            i.checkAll = false;
            i.checkAllGroup = []; // 用来存已选择的邮寄方式
            i.isTrans = true; // 控制子的显示
            i.indeterminate = false;
            if (i.queryMailResultList && i.queryMailResultList.length > 0) {
              i.queryMailResultList.forEach(j => {
                if (j.logisticsDealerCode) {
                  delete j.logisticsDealerCode; // 删除为了区分父子
                }
              });
            }
          });
          v.shippingMethodDataNew = res.data.datas;
          v.shipTreeData[0].pickingNumber = v.shippingMethodDataNew.reduce((a, b) => {
            return a + b.pickingNumber;
          }, 0);
          v.shipTreeData[0].queryMailResultList = v.shippingMethodDataNew;
        }
      });
    },
    treeParams () {
      // 参数
      let arr = this.shipTreeData[0].queryMailResultList.map(i => {
        return i.checkAllGroup;
      }).flat(2).map(i => {
        return i;
      });
      return arr || null;
    }
  }
};
</script >

<style scoped >
.pl5 {
  padding-left: 5px;
}

.check-text {
  padding-left: 5px;
  font-size: 12px;
  word-wrap: break-word;
  word-break: break-all;
}

.check-text:hover {
  color: #000;
}

.arr-icon {
  width: 12px;
  float: left;
  margin-right: 5px;
  font-size: 12px;
  text-align: center;
  margin-top: 5px;
  cursor: pointer;
  -webkit-transition: all 0.2s ease-in-out;
  transition: all 0.2s ease-in-out;
}

.checkGroupBox {
  padding-bottom: 10px;
}
</style >
