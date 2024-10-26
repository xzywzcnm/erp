<style scoped >
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
  <div >
    <div class="ivu-table-wrapper" >
      <div class="ivu-table ivu-table-border" ><!---->
        <div class="ivu-table-header" >
          <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;" >
            <thead >
            <tr >
              <th class="column_0 ivu-table-column-center" style="width: 50px;" >
                <div class="ivu-table-cell" >
                  <Checkbox
                      v-model="checkAll"
                      @on-change="checkAllFn"
                      :disabled="!priceData || priceData.length == 0" ></Checkbox >
                </div >
              </th >
              <th class="column_1 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >图片</span >
                </div >
              </th >
              <th class="column_2 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >SKU编号/商品名称</span >
                </div >
              </th >
              <th class="column_3 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >首选供应商</span >
                </div >
              </th >
              <th class="column_4 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >供应商名称</span >
                </div >
              </th >
              <th class="column_5 multiCols ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >最新报价</span >
                </div >
              </th >
              <th class="column_6 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >采购交期（天）</span >
                </div >
              </th >
              <th class="column_7 ivu-table-column-center" >
                <div class="ivu-table-cell" >
                  <span class="" >最新报价时间</span >
                </div >
              </th >
              <!-- <th class="column_8 multiCols ivu-table-column-center" style="width: 180px;">
                 <div class="ivu-table-cell">
                   <span class="">关联的1688商品</span>
                 </div>
               </th>-->
              <th class="column_9 ivu-table-column-center" style="width: 150px;" >
                <div class="ivu-table-cell" >
                  <span class="" >操作</span >
                </div >
              </th >
              <th class="column_10 ivu-table-column-center" style="width: 100px;" >
                <div class="ivu-table-cell" >
                  <span class="" >历史价格</span >
                </div >
              </th >
            </tr >
            </thead >
            <tbody class="ivu-table-tbody" >
            <template v-if="priceData && priceData.length>0" >
              <template v-for="(item, index) in priceData" >
                <template v-for="(dataItem, dataIndex) in item.supplierGoodsResultList" >
                  <tr class="ivu-table-row" :key="`${index}${dataIndex}`">
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <Checkbox v-model="dataItem.isCheck" @on-change="checkRowFn" ></Checkbox >
                      </div >
                    </td >
                    <td
                        class="ivu-table-column-center"
                        v-if="dataIndex == 0"
                        :rowspan="item.supplierGoodsResultList.length" >
                      <div class="ivu-table-cell" >
                        <template v-if="dataItem.thumbUrl" >
                          <Poptip trigger="hover" content="content" :width="500" placement="right" >
                            <div style="width: 80px; height: 80px; margin: 5px auto;" >
                              <img class="tableImg" :src="dataItem.thumbUrl" >
                            </div >
                            <div slot="content" >
                              <img class="tooltipImg" :src="dataItem.thumbUrl" >
                            </div >
                          </Poptip >
                        </template >
                        <template v-else >
                          <div style="width: 80px; height: 80px; margin: 5px auto;" >
                            <img class="tableImg" :src="'./static/images/placeholder.jpg'" >
                          </div >
                        </template >
                      </div >
                    </td >
                    <td
                        class="ivu-table-column-center"
                        v-if="dataIndex == 0"
                        :rowspan="item.supplierGoodsResultList.length" >
                      <div class="ivu-table-cell" >
                        <div style="color: rgb(45, 140, 240);" >{{ dataItem.skuNo }}</div >
                        <div >{{ dataItem.goodsName }}</div >
                        <div
                            v-if="dataItem.productGoodsSpecifications"
                            style="color: green" >({{ dataItem.productGoodsSpecifications }})
                        </div >
                      </div >
                    </td >
                    <td class="multiCols ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <div class="sortItem" >
                          <span v-if="dataItem.supplierDefaultSort == 1" >首选供应商</span > <span
                            v-else >备选供应商  <span v-if="currentTabItem != 2" >{{ dataIndex + 1 }}</span ></span >
                        </div >
                        <!-- <div class="sequence" v-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>1 && dataIndex ==0"> -->
                        <div
                            class="sequence"
                            v-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>1 && dataIndex ==0 && dataItem.supplierDefaultSort ==1" >
                          <Icon
                              class="sort down"
                              type="md-arrow-down"
                              :size="18"
                              title="下移"
                              @click="adjustFn('down', index, dataIndex)" ></Icon >
                          <Icon
                              class="sort bottom"
                              type="arrow-down-a"
                              :size="18"
                              title="置底"
                              @click="adjustFn('bottom', index, dataIndex)" ></Icon >
                        </div >
                        <div
                            class="sequence"
                            v-else-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>1 && dataIndex ==0" >
                          <Icon
                              class="sort down"
                              type="md-arrow-down"
                              :size="18"
                              title="下移"
                              @click="adjustFn('down', index, dataIndex)" ></Icon >
                          <!-- <Icon class="sort bottom" type="arrow-down-a" :size="18" title="置底" @click="adjustFn('bottom', index, dataIndex)"></Icon> -->
                        </div >
                        <div
                            class="sequence"
                            v-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>2 && dataIndex >0 &&dataIndex < item.supplierGoodsResultList.length-1" >
                          <!-- <div class="sequence" v-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>2 && dataItem.supplierDefaultSort >0 && dataItem.supplierDefaultSort < item.supplierGoodsResultList.length-1"> -->
                          <Icon
                              class="sort up"
                              type="md-arrow-up"
                              :size="18"
                              title="上移"
                              @click="adjustFn('up', index, dataIndex)" ></Icon >
                          <Icon
                              class="sort down"
                              type="md-arrow-down"
                              :size="18"
                              title="下移"
                              @click="adjustFn('down', index, dataIndex)" ></Icon >
                        </div >
                        <div
                            class="sequence"
                            v-else-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>1 && dataIndex == item.supplierGoodsResultList.length-1" >
                          <!-- <div class="sequence" v-else-if="getPermission('supplierPrice_adjustSupplierOrder') && item.supplierGoodsResultList.length>1 && dataItem.supplierDefaultSort == item.supplierGoodsResultList.length-1"> -->
                          <Icon
                              class="sort up"
                              type="md-arrow-up"
                              :size="18"
                              title="上移"
                              @click="adjustFn('up', index, dataIndex)" ></Icon >
                          <Icon
                              class="sort top"
                              type="arrow-up-a"
                              :size="18"
                              title="置顶"
                              @click="adjustFn('top', index, dataIndex)" ></Icon >
                        </div >
                      </div >
                    </td >
                    <td class="multiCols ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                                            <span >
                                                {{ dataItem.supplierName }}
                                            </span >
                      </div >
                    </td >
                    <td class="multiCols ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <div
                            v-for="(dtItem,dtIndex) in dataItem.priceDetailsList"
                            :key="`${dtIndex}`"
                            :style="{ textAlign: 'center', padding: '3px', borderTop: (dataItem.priceDetailsList.length > 1 && dtIndex > 0)? '1px solid rgb(233, 234, 236)' : 'none'}" >
                          {{ dtItem }} {{ dataItem.currency }}
                        </div >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ dataItem.estimateDeliveryDays }}</span >
                      </div >
                    </td >
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <span >{{ getDataToLocalTime(dataItem.createdTime, 'fulltime') }}</span >
                      </div >
                    </td >
                    <!--<td class="ivu-table-column-center">
                        <div class="ivu-table-cell">
                          <div v-if="dataItem.relationStatus==2">
                            <template v-if="(currentTabItem == '1' || currentTabItem == '4')">
                              <Row>
                                <Col :span="16">
                                  <dyt-select @on-open-change="getRelationProFn" transfer @click.native="recordIndexFn(index, dataIndex, dataItem.supplierPurchaseLink)" v-model="dataItem.selectValue">
                                    <Option v-for="(selectItem, selectIndex) in dataItem.selectVariations" :value="selectItem.variationMap.specId" :key="selectIndex" @click.native="selectChangeFn(index, dataIndex, selectItem)">{{selectItem.variationMap.attributeDisplayName}}</Option>
                                  </dyt-select>
                                </Col>
                                <Col :span="7" :offset="1">
                                  <Button type="primary" size="small" style="margin-top: 4px;" @click="confirmRelatedFn(index, dataIndex)" :disabled="!dataItem.selectValue">
                                    确定
                                  </Button>
                                </Col>
                              </Row>
                            </template>
                          </div>
                          <div class="related" @click="relatedPlatFn(dataItem)" v-if="dataItem.relationStatus == 3">
                            {{JSON.parse(dataItem.relatedPlatformGoods).attributeDisplayName}}
                          </div>
                          <div v-if="dataItem.relationStatus == 1">
                            -
                          </div>
                        </div>
                    </td>-->
                    <td class="ivu-table-column-center" >
                      <div class="ivu-table-cell" >
                        <Buttons
                            trigger="click"
                            v-if="getPermission('supplierPrice_querySupplierGoods')"
                            class="defaultStyle trimming"
                            @on-click="rowOperation"
                            @click.native="getRowDatas(dataItem,dataIndex)" >
                          <Button
                              type="default"
                              class="iconbuttons"
                              @click="rowOperation('1',dataItem,dataIndex)"
                              v-if="currentTabItem != 2" >
                            <span >查看</span >
                          </Button >
                          <Button
                              type="default"
                              class="iconbuttons"
                              @click="rowOperation('5',dataItem,dataIndex)"
                              v-if="currentTabItem == 2" >
                            <span >审核通过</span >
                          </Button >
                          <Buttons-menu slot="list" >
                            <Buttons-item
                                name="2" v-if="currentTabItem != 2 &&  getPermission('supplierPrice_update')" >
                              编辑
                            </Buttons-item >
                            <Buttons-item name="3" v-if="currentTabItem == 3 && getPermission('supplierPrice_remove')" >
                              作废
                            </Buttons-item >
                            <Buttons-item name="4" v-if="currentTabItem == 1" >
                              删除
                            </Buttons-item >
                            <!-- <Buttons-item name="5" v-if="currentTabItem == 2"> -->
                            <Buttons-item name="7" v-if="currentTabItem == 2" >
                              驳回
                            </Buttons-item >
                          </Buttons-menu >
                        </Buttons >
                      </div >
                    </td >
                    <td
                        class="ivu-table-column-center"
                        v-if="dataIndex == 0"
                        :rowspan="item.supplierGoodsResultList.length" >
                      <div class="ivu-table-cell" >
                                          <span
                                              class="related"
                                              @click="viewHistory(dataItem,dataIndex)"
                                              v-if="getPermission('supplierPrice_queryPriceHistory')" >
                                            历史价格
                                          </span >
                      </div >
                    </td >
                  </tr >
                </template >
              </template >
            </template >
            <template v-if="!priceData || priceData.length === 0" >
              <tr >
                <td colspan="10" class="ivu-table-column-center" ><span >暂无筛选结果</span ></td >
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
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['height', 'loading', 'priceData', 'currentTabItem'],
  mixins: [Mixin],
  data () {
    return {
      checkAll: false,
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
    viewHistory (data) {
      this.$emit('tableViewHistory', data);
    },
    checkAllFn (val) {
      let v = this;
      if (val) {
        let arr = [];
        v.priceData.forEach((n, i) => {
          n.supplierGoodsResultList.forEach((m, j) => {
            if (!m.isCheck) {
              m.isCheck = true;
            }
            arr.push(m);
          });
        });
        v.$emit('on-selection-change', arr);
      } else {
        v.priceData.forEach((n, i) => {
          n.supplierGoodsResultList.forEach((m, j) => {
            if (m.isCheck) {
              m.isCheck = false;
            }
          });
        });
        v.$emit('on-selection-change', []);
      }
    },
    checkRowFn (val) {
      let v = this;
      let arr = [];
      v.priceData.forEach((n, i) => {
        n.supplierGoodsResultList.forEach((m, j) => {
          if (m.isCheck) {
            arr.push(m);
          }
        });
      });
      v.$emit('on-selection-change', arr);
      let _isCheckAll = true;
      v.priceData.forEach((n, i) => {
        n.supplierGoodsResultList.forEach((m, j) => {
          if (!m.isCheck) {
            _isCheckAll = false;
          }
        });
      });
      v.checkAll = _isCheckAll;
    },
    adjustFn (type, index_1, index_2) {
      let v = this;
      let parentArr = v.priceData[index_1].supplierGoodsResultList;
      let obj = {
        'action': '', // 动作(top:置顶 floor:置底 up:向上 down:向下) ,
        'goodsId': parentArr[index_2].goodsId, // 商品ID ,
        'supplierGoodsId': parentArr[index_2].supplierGoodsId // 商品报价顺序ID
      };
      if (type == 'bottom') { // 将最后一行的supplierDefaultSort赋值给当前行，当前行后面的依次递减
        // 置底
        obj.action = 'floor';
      } else if (type == 'top') { // 将第一一行的supplierDefaultSort赋值给当前行，当前行前面的依次递加
        // 置顶
        obj.action = 'top';
      } else if (type == 'down') { // 调换本行和下一行的supplierDefaultSort排序值
        // 下移
        obj.action = 'down';
      } else if (type == 'up') { // 调换本行和上一行的supplierDefaultSort排序值
        // 上移
        obj.action = 'up';
      }
      v.$emit('tableAdjustFn', obj);
    },
    getRelationProFn (val) {
      let v = this;
      if (val) {
        v.axios.get(api.getRelatedDetail + '?supplierPurchaseLink=' + v.supplierPurchaseLink).then(res => {
          if (res.data.code == 0) {
            v.$set(v.priceData[v.parentIndex].supplierGoodsResultList[v.dataIndex], 'selectVariations', res.data.datas.selectVariations);
          }
        });
      }
    },
    recordIndexFn (index, dataIndex, val) {
      this.parentIndex = index;
      this.dataIndex = dataIndex;
      this.supplierPurchaseLink = val;
    },
    selectChangeFn (index, dataIndex, data) {
      // eslint-disable-next-line vue/no-mutating-props
      this.priceData[index].supplierGoodsResultList[dataIndex].relatedPlatformGoods = JSON.stringify(data.variationMap);
    },
    confirmRelatedFn (index, dataIndex) {
      this.$emit('rowConfirmRelatedFn', this.priceData[index].supplierGoodsResultList[dataIndex]);
    },
    relatedPlatFn (data) {
      this.$emit('rowRelatedPlat', data);
    }
  },
  created () {
    let v = this;
    v.$nextTick(() => {
      if (v.priceData && v.priceData.length > 0) {
        v.priceData.forEach((n, i) => {
          n.supplierGoodsResultList.forEach((m, j) => {
            v.$set(this.priceData[i].supplierGoodsResultList[j], 'isCheck', false);
            if (m.relationStatus == 2) {
              let arr = [];
              v.$set(this.priceData[i].supplierGoodsResultList[j], 'selectVariations', arr);
              v.$set(this.priceData[i].supplierGoodsResultList[j], 'selectValue', '');
            }
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
