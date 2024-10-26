<template>
  <div>
    <ul class="ulmain">
      <template v-for="(item,index) in list">
        <li class="ulmain__limain ulmain__limain--more" v-if="item.list && (item.list.upside || item.list.downside)" :key="`li-${index}`">
          <div class="limain__mainmore" style="display: flex;">
            <div class="limain__chid-main" v-for="(citem, cindex) in item.list.upside" :key="`upside-${index}-${cindex}`">
              <div class="limain__main" :class="computedStyle(citem)">
                <span class="limain__circle">{{citem.step}}</span>
                <span class="limain__text">{{citem.name}}</span>
              </div>
            </div>
          </div>
          <div class="limain__mainmore" style="display: flex;">
            <div class="limain__chid-main" v-for="(citem, cindex) in item.list.downside" :key="`downside-${index}-${cindex}`">
              <div class="limain__main" :class="computedStyle(citem)">
                <span class="limain__circle">{{citem.step}}</span>
                <span class="limain__text">{{citem.name}}</span>
              </div>
            </div>
          </div>
        </li>
        <li class="ulmain__limain" :key="index" v-else>
          <div class="limain__main" :class="computedStyle(item)">
            <span class="limain__circle">{{item.step}}</span>
            <span class="limain__text">{{item.name}}</span>
          </div>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
const constant = {
  stockList: [
    { name: "创建需求", index: 0, step: 1 },
    { name: "需求审核", index: 1, step: 2 },
    { name: "完善商品资料", index: 2, step: 3 },
    { name: "审核商品资料", index: 3, step: 4 },
    { name: "审样核价", index: 4, step: 5 },
    {
      list: {
        upside: [
          { name: "完善文本资料", index: 5, step: 6, textVerifyStatus: 2, type: 'text' },
          { name: "审核文本资料", index: 5, step: 7, textVerifyStatus: 3, type: 'text' },
        ],
        downside: [
          { name: "完善图片资料", index: 5, step: 6, pictureVerifyStatus: 2, type: 'pic' },
          { name: "审核图片资料", index: 5, step: 7, pictureVerifyStatus: 3, type: 'pic' }
        ]
      }
    },
    { name: "侵权审核", index: 6, step: 8 },
    { name: "生成SKU", index: 7, step: 9 },
    { name: "同步上架", index: 10, step: 10 },
  ],
  cloundlist: [
    { name: "创建需求", index: 0, step: 1 },
    { name: "完善商品基础资料", index: 1, step: 2 },
    {
      list: {
        upside: [
          { name: "完善文本资料", index: 5, step: 6, textVerifyStatus: 2, type: 'text' },
          { name: "审核文本资料", index: 5, step: 7, textVerifyStatus: 3, type: 'text' },
        ],
        downside: [
          { name: "完善图片资料", index: 5, step: 6, pictureVerifyStatus: 2, type: 'pic' },
          { name: "审核图片资料", index: 5, step: 7, pictureVerifyStatus: 3, type: 'pic' }
        ]
      }
    },
    { name: "侵权审核", index: 6, step: 4 },
    { name: "生成SKU", index: 7, step: 5 },
    { name: "同步上架", index: 10, step: 6 }
  ],
  plate: [
    { name: "创建需求", index: 0, step: 1 },
    { name: "需求确认", index: 1, step: 2 },
    { name: "制作样衣", index: 14, step: 3 },
    { name: "样衣审核", index: 15, step: 4 },
    { name: "完善样衣资料", index: 16, step: 5 },
    { name: "价格估算", index: 17, step: 6 },
    { name: "价格确认", index: 18, step: 7 },
    { name: "完善商品资料", index: 19, step: 8 },
    // { name: "待审核资料", index: 3, step: 8 },
    // { name: "审样核价", index: 4, step: 9 },
    {
      list: {
        upside: [
          { name: "完善文本资料", index: 20, step: 9, textVerifyStatus: 2, type: 'text' },
          { name: "审核文本资料", index: 20, step: 10, textVerifyStatus: 3, type: 'text' },
        ],
        downside: [
          { name: "完善图片资料", index: 20, step: 9, pictureVerifyStatus: 2, type: 'pic' },
          { name: "审核图片资料", index: 20, step: 10, pictureVerifyStatus: 3, type: 'pic' }
        ]
      }
    },
    { name: "侵权审核", index: 21, step: 11 },
    { name: "生成SKU", index: 22, step: 12 },
    { name: "完成", index: 23, step: 13 },
  ]
}
const stepStaus = {
  15: 16, // 完善样衣资料
  17: 0, // 创建需求
  18: 15, // 样衣审核
  2: 18, // 价格确认
  5: 19, // 完善商品资料
  6: 20, // 完善文本资料、审核文本资料、完善图片资料、审核图片资料
  11: 21, // 侵权审核
  12: 22, // 生成SKU
  10: 100 // 完成
}
      
export default {
  name: "statuStep",
  data () {
    return {
      list: [],
      step: ''
    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    platformType: { type: String, default: '' }
  },
  created () {
    let { status, lastStatus, productSource } = this.productData;
    if (['plate'].includes(this.platformType)) {
      this.list = constant.plate;
      if (status == 8) {
        status = this.$common.isEmpty(lastStatus) ? -1 : lastStatus; // 最后状态
      }
      this.step = this.$common.isEmpty(stepStaus[status]) ? status : stepStaus[status];
      // console.log(status, this.step, this.productData.status);
      return;
    }
    this.list = productSource > 1 ? constant.cloundlist : constant.stockList;
    if ([8, 9].includes(status)) {
      this.step = lastStatus || lastStatus === 0 ? lastStatus : -1;
    } else if ([11, 12].includes(status)) { //同步erp和同步listing
      this.step = 7;
    } else {
      this.step = status;
    }
  },
  methods: {
    // 计算步骤
    computedStyle (item) {
      // console.log(this.step, this.productData)
      let str = '';
      let itemIndex = item.index;
      if (itemIndex === 5 || itemIndex == 20) {
        let { textVerifyStatus, pictureVerifyStatus } = this.productData;
        if (item.type === 'text') {
          str = textVerifyStatus >= item.textVerifyStatus ? 'ulmain__liactive' : '';
        } else if (item.type === 'pic') {
          str = pictureVerifyStatus >= item.pictureVerifyStatus ? 'ulmain__liactive' : '';
        }
      } else {
        str = this.step >= itemIndex ? 'ulmain__liactive' : '';
      }
      return str;
    }
  }
};
</script>
<style lang="less" scoped>
@lin-width: 16px;
.ulmain {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  font-size: 14px;
  color: #333333;
  .ulmain__limain {
    padding: 10px @lin-width;
    position: relative;
    margin-top: -10px;
    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
    &:not(:first-child)::before {
      content: "";
      position: absolute;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
      width: @lin-width;
      height: 2px;
      background: #5cadff;
    }
    &:not(:last-child)::after {
      content: "";
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%);
      width: @lin-width;
      height: 2px;
      background: #5cadff;
    }
  }
  .limain__main {
    display: flex;
    align-items: center;
  }
  .limain__circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    overflow: hidden;
    text-align: center;
    line-height: 18px;
    display: inline-block;
    margin-right: 2px;
    background: #fff;
    border: 1px solid #999;
  }
  .ulmain__liactive {
    .limain__circle {
      color: #fff;
      background: #2d8cf0;
      border: 1px solid #2d8cf0;
    }
    .limain__text {
      color: #2d8cf0;
    }
  }
  .ulmain__limain--more {
    &:not(:last-child)::before {
      height: 46px;
      border: 2px solid #5cadff;
      background: transparent;
      border-right: none;
      border-radius: 4px 0 0 4px;
    }
    &:not(:last-child)::after {
      height: 46px;
      border: 2px solid #5cadff;
      background: transparent;
      border-left: none;
      border-radius: 0 4px 4px 0;
    }
    .limain__mainmore {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
      .limain__chid-main {
        position: relative;
        display: flex;
        padding-left: 68px;
        &:before {
          content: "";
          position: absolute;
          left: 0px;
          top: 50%;
          transform: translateY(-50%);
          width: 68px;
          height: 2px;
          background: #5cadff;
        }
        &:first-child {
          padding-left: 0;
          &:before {
            display: none;
          }
        }
      }
    }
  }
}
</style>