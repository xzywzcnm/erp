<style scoped>
.supplier-name {
  display: inline-block;
  vertical-align: middle;
}

.wangwang, .qq {
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
}

.wangwang img, .qq img {
  max-width: 100%;
  max-height: 100%;
}

.tableImg {
  margin: 0px auto;
  position: relative;
  max-width: 100%;
  max-height: 100%;
  display: block;
  top: 50%;
  transform: translateY(-50%);
}

.tooltipImg {
  max-width: 100%;
  max-height: 100%;
}

.related {
  cursor: pointer;
  color: rgb(45, 140, 240);
}

.related:hover {
  color: #ff6600;
  text-decoration: underline;
}

.sort {
  vertical-align: middle;
  margin-left: 5px;
  cursor: pointer;
}

.sort:hover {
  color: black;
}

.bottom {
  color: #75b62d
}

.top {
  color: #4c1413
}

.down {
  color: #57a3f3
}

.up {
  color: #f25d3d
}

.sortItem {
  display: inline-block;
  width: 80px;
}

.sequence {
  display: inline-block;
}
</style>
<template>
  <div>
    <div class="ivu-table-wrapper" >
      <div class="ivu-table ivu-table-border" ><!---->
        <div class="ivu-table-header" >
          <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;" >
            <thead >
            <tr >
              <th class="column_0 ivu-table-column-center" style="width: 50px;" >
                <div class="ivu-table-cell" >
                  <!-- <Checkbox v-model="checkAll" @on-change="checkAllFn" :disabled="!requirementData || requirementData.length == 0"></Checkbox> -->
                </div >
              </th >
              <th class="column_1 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >图片</span >
                </div >
              </th >
              <th class="column_2 ivu-table-column-center" style="width: 240px;" >
                <div class="ivu-table-cell" >
                  <span class="" ></span >
                </div >
              </th >
              <th class="column_3 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >供应商</span >
                </div >
              </th >
              <!--<th class="column_4 ivu-table-column-center">
                <div class="ivu-table-cell">
                  <span class="">1688商品</span>
                </div>
              </th>-->
              <th class="column_5 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >采购仓库</span >
                </div >
              </th >
              <th class="column_6 ivu-table-column-center" v-if="tabsValue === 0" >
                <div class="ivu-table-cell" >
                  <span class="" >提交时间</span >
                </div >
              </th >
              <th class="column_6 ivu-table-column-center" v-if="tabsValue === 1" >
                <div class="ivu-table-cell" >
                  <span class="" >作废时间</span >
                </div >
              </th >
              <th class="column_7 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >可用库存</span >
                </div >
              </th >
              <th class="column_8 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >在途数量</span >
                </div >
              </th >
              <th class="column_8 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >缺货数量</span >
                </div >
              </th >
              <th class="column_9 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >需求数量</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >最近采购价</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >供应商报价</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >采购员</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" v-if="tabsValue === 1" style="width: 120px;" >
                <div class="ivu-table-cell" >
                  <span class="" >作废原因</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" style="width: 120px;" >
                <div class="ivu-table-cell" >
                  <span class="" >采购链接</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" v-if="tabsValue === 0" style="width: 120px;" >
                <div class="ivu-table-cell" >
                  <span class="" >操作</span >
                </div >
              </th >
            </tr >
            </thead >
            <tbody class="ivu-table-tbody" >
            <template v-if="requirementData && requirementData.length>0" >
              <template>
                <tr v-for="(item, index) in requirementData" class="ivu-table-row" :key="index">
                  <td >
                    <div class="ivu-table-cell" >
                      <Checkbox
                          v-model="item.supplierChecked"
                          @on-change="supplierCheckFn"
                          @click.native="getDataIndex(index)" ></Checkbox >
                    </div >
                  </td >
                  <td colspan="14" >
                    <div class="ivu-table-cell" >
                        <span class="supplier-name" >
                          {{ item.supplierName }}
                        </span >
                      <template v-if="item.supplierId" >
                          <span class="wangwang" style="margin-left: 20px" v-if="item.wwAccount" >
                            <a
                                :href="'https://awp.taobao.com/bs/wwlight.html?ver=3&touid=' + item.wwAccount + '&siteid=cntaobao&status=1&charset=utf-8'"
                                target="_blank"
                                :title="'旺旺' + '：' + item.wwAccount" >
                              <img :src="'./static/images/wangwang.png'" >
                            </a >
                          </span > <span class="qq" style="margin-left: 5px" v-if="item.qqNumber" >
                            <a
                                :href="'http://wpa.qq.com/msgrd?v=3&uin=' + item.qqNumber + '&site=qq&menu=yes'"
                                target="_blank"
                                :title="'QQ: '+ item.qqNumber" >
                              <img :src="'./static/images/qq.png'" >
                            </a >
                          </span >
                      </template >
                    </div >
                  </td >
                </tr >
                <template>
                  <tr v-for="(dataItem, dataIndex) in item.requirementDataList" class="ivu-table-row" :key="index">
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <Checkbox
                            v-model="dataItem.isCheck"
                            @on-change="checkRowFn"
                            @click.native="getDataIndex(index)" ></Checkbox >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <template v-if="dataItem.thumbUrl" >
                          <Poptip trigger="hover" content="content" :width="500" placement="right" >
                            <div style="width: 60px; height: 60px; margin: 5px auto;" >
                              <img class="tableImg" :src="dataItem.thumbUrl" >
                            </div >
                            <div slot="content" >
                              <img class="tooltipImg" :src="dataItem.thumbUrl" >
                            </div >
                          </Poptip >
                        </template >
                        <template v-else >
                          <div style="width: 60px; height: 60px; margin: 5px auto;" >
                            <img class="tableImg" :src="'./static/images/placeholder.jpg'" >
                          </div >
                        </template >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <Row type="flex" justify="center" align="middle" >
                          <Col :span="16" >
                            <span >{{ dataItem.skuNo }}</span > <br /> <span >{{ dataItem.goodsName }}</span >
                          </Col >
                          <!-- <Col :span="7" :offset="1">
                             <template v-if="dataItem.searchUrl">
                               <a :href="dataItem.searchUrl" target="_blank" class="related">同款搜货</a>
                             </template>
                             &lt;!&ndash; <span class="related" @click="sameProSreachFn(dataItem.searchUrl)" v-if="dataItem.searchUrl">
                               同款搜货
                             </span> &ndash;&gt;
                           </Col>-->
                        </Row >
                      </div >
                    </td >
                    <td class="multiCols ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                          <span v-if="dataItem.supplierName" :class="{'red':dataItem.supplierStatus === 4}" >
                            {{ dataItem.supplierName }}
                          </span > <span v-else >-</span >
                      </div >
                    </td >
                    <!--<td class="multiCols ivu-table-column-center">
                      <div class="ivu-table-cell">
                        <template v-if="dataItem.relatedPlatformGoods">
                          <span v-if="dataItem.relatedPlatformGoods">
                            {{JSON.parse(dataItem.relatedPlatformGoods).attributeDisplayName}}
                          </span>
                        </template>
                        <template v-else>
                          <span>-</span>
                        </template>
                      </div>
                    </td>-->
                    <td class="multiCols ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                          <span
                              v-if="dataItem.purchaseWarehouseName"
                              :class="{'red':dataItem.purchaseWarehouseStatus === '1'}" >
                            {{ dataItem.purchaseWarehouseName }}
                          </span > <span v-else >-</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" v-if="tabsValue === 0" >
                      <div class="ivu-table-cell" >
                        <span >{{ getDataToLocalTime(dataItem.submissionTime, 'fulltime') }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" v-if="tabsValue === 1" >
                      <div class="ivu-table-cell" >
                        <span >{{ getDataToLocalTime(dataItem.obsoleteTime, 'fulltime') }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ dataItem.availableStock }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ dataItem.onPassageQuantity }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ dataItem.outNumberOfStock }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ getCurrency(dataItem.requiredQuantity) }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span v-if="dataItem.currentCost" >{{ dataItem.currentCost }}</span > <span v-else >-</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <template v-if="dataItem.supplierPrice" >
                          <span >{{ dataItem.supplierPrice }}</span >
                        </template >
                        <template v-else >
                          <span >-</span >
                        </template >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span v-if="dataItem.purchaserName" >{{ dataItem.purchaserName }}</span >
                        <span v-else >-</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" v-if="tabsValue === 1" >
                      <div class="ivu-table-cell" >
                        <span style="overflow: hidden;text-overflow: ellipsis" >{{ dataItem.obsoleteDesc }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span style="overflow: hidden;text-overflow: ellipsis" >{{ dataItem.goodsUrl }}</span >
                      </div >
                    </td >

                    <td class="ivu-table-column-center" v-if="tabsValue === 0" >
                      <div class="ivu-table-cell" >
                        <Buttons
                            v-if="getPermission('purchaseRequirement_applyOrder')"
                            trigger="click"
                            class="defaultStyle trimming"
                            @on-click="rowOperation"
                            @click.native="getRowDatas(dataItem,dataIndex)" >
                          <Button type="default" class="iconbuttons" @click="rowOperation('1',dataItem,dataIndex)" >
                            <span >下单</span >
                          </Button >
                          <Buttons-menu slot="list" >
                            <Buttons-item
                                v-if="tabsValue === 0 && getPermission('purchaseRequirement_cancelOrder')" name="2" >
                              作废
                            </Buttons-item >
                          </Buttons-menu >
                        </Buttons >
                      </div >
                    </td >
                  </tr >
                </template >
              </template >
            </template >
            <template v-if="!requirementData || requirementData.length === 0" >
              <tr >
                <td colspan="13" class="ivu-table-column-center" ><span >暂无筛选结果</span ></td >
              </tr >
            </template >
            </tbody >
          </table >
        </div >
        <div class="ivu-spin ivu-spin-large ivu-spin-fix" v-if="loading" >
          <div class="ivu-spin-main" >
            <span class="ivu-spin-dot" ></span >
            <div class="ivu-spin-text" ></div >
          </div >
        </div >
      </div >
    </div >
  </div >
</template>
<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['height', 'loading', 'requirementData', 'currentTabItem', 'tabsValue'],
  mixins: [Mixin],
  data () {
    return {
      checkAll: false,
      requirementDataIndex: null,
      selectionArr: [],
      self: this,
      rowData: {},
      rowIndex: 0,
      pageNo: 1,
      parentIndex: null,
      dataIndex: null,
      supplierPurchaseLink: ''
    };
  },
  methods: {
    rowOperation (name, data, index) {
      this.$emit('tableRowOperation', name, data || this.rowData, index || this.rowIndex);
    },
    getRowDatas (data, index) {
      this.rowData = data;
      this.rowIndex = index;
    },
    checkAllFn (val) {
      let v = this;
      let arr = [];
      v.requirementData.forEach((n, i) => {
        n.supplierChecked = val;
        n.requirementDataList.forEach((m, j) => {
          m.isCheck = val;
          if (val) {
            arr.push(m);
          }
        });
      });
      v.$emit('on-selection-change', arr);
    },
    supplierCheckFn (val) {
      let v = this;
      let arr = [];
      let _isCheckAll = true;
      v.requirementData.forEach((n, i) => {
        n.requirementDataList.forEach((m, j) => {
          if (v.requirementDataIndex === i) {
            m.isCheck = val;
            if (val) {
              arr.push(m);
            } else {
              _isCheckAll = false;
            }
          } else {
            if (m.isCheck) {
              arr.push(m);
            } else {
              _isCheckAll = false;
            }
          }
        });
      });
      v.checkAll = _isCheckAll;
      v.$emit('on-selection-change', arr);
    },
    getDataIndex (index) {
      this.requirementDataIndex = index;
    },
    checkRowFn (val) {
      let v = this;
      let arr = [];
      v.requirementData.forEach((n, i) => {
        n.requirementDataList.forEach((m, j) => {
          if (m.isCheck) {
            arr.push(m);
          }
        });
      });
      v.$emit('on-selection-change', arr);
      // 全部选上的时候，checkAll也有勾上
      let _isCheckAll = true;
      v.requirementData.forEach((n, i) => {
        n.requirementDataList.forEach((m, j) => {
          if (!m.isCheck) {
            _isCheckAll = false;
          }
        });
      });
      v.checkAll = _isCheckAll;
      // 当该供应商下的选项全部勾上，该供应商也要勾上
      let _supplierChecked = true;
      v.requirementData[v.requirementDataIndex].requirementDataList.forEach((n, i) => {
        if (!n.isCheck) {
          _supplierChecked = false;
        }
      });
      v.requirementData[v.requirementDataIndex].supplierChecked = _supplierChecked;
    }
  },
  created () {
    let v = this;
    v.$nextTick(() => {
      if (v.requirementData && v.requirementData.length > 0) {
        v.requirementData.forEach((n, i) => {
          v.$set(v.requirementData, 'supplierChecked', false);
          n.requirementDataList.forEach((m, j) => {
            v.$set(v.requirementData[i].requirementDataList[j], 'isCheck', false);
          });
        });
      }
    });
  },
  watch: {
    currentTabItem (n, o) {
      let v = this;
      if (n) {
        v.checkAll = false;
      }
    }
  }
};
</script >
