<style scoped>
.strategyTitle {
  background-color: #b0cfde;
  line-height: 24px;
  padding: 4px;
}

.dashedBorder {
  border-top: 1px dashed #dddee1;
  margin: 5px 0;
}

.param {
  display: inline-block;
  width: 40px;
}

.formula {
  font-size: 14px;
}

.green {
  color: green;
}

.red {
  color: red;
}

.lineThrough {
  text-decoration: line-through;
}

.upgradeTitle {
  padding: 4px 4px 4px 20px;
  background-color: #b0cfde;
}

.add {
  margin-right: 10px;
}

.minus {
  margin-left: 6px;
}

.add:hover, .minus:hover {
  cursor: pointer;
  color: #2d8cf0;
}
</style>
<style>
.supplierTabsBar .ivu-tabs-nav-prev, .supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.strategy .ivu-form-item-error-tip {
  top: 20%;
  left: 53%;
}

.strategy .ivu-form-item {
  margin-bottom: 6px;
}

.formula .ivu-form-item-content {
  margin-left: 10px !important;
}

.strategy .formula .ivu-form-item {
  margin-bottom: 20px;
}

.strategy .formula .ivu-form-item-error-tip {
  top: 100%;
  left: 0;
}

.strategy .calTable .ivu-table th, .strategy .calTable .ivu-table td {
  height: 36px;
}

.basicFormula .ivu-form-item {
  margin-bottom: 16px;
}

.ivu-form .basicFormula .ivu-form-item-label {
  width: 50px !important;
  padding: 10px 3px 10px 0;
}

.basicFormula .ivu-form-item-content {
  margin-left: 50px !important;
}

.basicFormula .ivu-form-item-error-tip {
  top: 100%;
  left: 0;
}

.ivu-form .avg1 .ivu-form-item-label {
  width: 34px !important;
}

.avg1 .ivu-form-item-content {
  margin-left: 34px !important;
}

.warehouse .ivu-poptip, .warehouse .ivu-poptip-rel {
  width: 100%
}
</style>
<template>
  <div >
    <div class="strategy" :style="{maxHeight: modalHeight + 'px', overflow: 'auto'}" >
      <Form ref="strategy" :model="strategy" :label-width="120" :rules="ruleValidate" >
        <div >
          <FormItem label="备货策略名称：" prop="name" >
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <Input v-model="strategy.name" style="width:326px;" :disabled="operationType == '2'" ></Input >
          </FormItem >
        </div >
        <div class="normalTop" >
          <FormItem label="备货策略类型：" prop="strategyType" >
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <RadioGroup v-model="strategy.strategyType" @on-change="strategyTypeChange" >
              <Radio :label="0" :disabled="operationType == '2' || operationType == '3'" >自营仓库备货策略</Radio >
              <Radio :label="1" :disabled="operationType == '2' || operationType == '3'" >第三方仓库备货策略</Radio >
              <Radio :label="2" :disabled="operationType == '2' || operationType == '3'" >亚马逊FBA备货策略</Radio >
            </RadioGroup >
          </FormItem >
        </div >
        <template v-if="strategy.strategyType == 0 || strategy.strategyType == 1" >
          <div >
            <p class="strategyTitle" >可选条件</p >
            <p class="normalTop" >
              <template v-if="strategy.strategyType == 0" >
                <FormItem label="指定仓库：" prop="warehouse" >
                  <!-- eslint-disable-next-line vue/no-mutating-props -->
                  <dyt-select v-model="strategy.warehouse"
                      multiple
                      style="width:326px"
                      label-in-value
                      :disabled="operationType == '2'" > <Option
                      v-for="(item,index) in selfWarehouseArr"
                      :disabled="item.warehouseStatus === '1'"
                      :value="item.warehouseId"
                      :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
                </FormItem >
              </template >
              <template v-if="strategy.strategyType == 1" >
                <FormItem label="指定仓库：" prop="warehouse" >
                  <!-- eslint-disable-next-line vue/no-mutating-props -->
                  <dyt-select v-model="strategy.warehouse"
                      multiple
                      style="width:326px"
                      label-in-value
                      :disabled="operationType == '2'" > <Option
                      v-for="(item,index) in thirdWarehouseArr"
                      :disabled="item.warehouseStatus === '1'"
                      :value="item.warehouseId"
                      :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
                </FormItem >
              </template >
            </p >
            <p >
              <FormItem label="指定标签：" prop="label" >
                <!-- eslint-disable-next-line vue/no-mutating-props -->
                <dyt-select v-model="strategy.label" multiple style="width:326px" :disabled="operationType == '2'" > <Option
                    v-for="(item,index) in labelArr" :value="item" :key="index" >{{ item }}</Option > </dyt-select >
              </FormItem >
            </p >
            <p >
              <FormItem label="指定分类：" prop="classification" >
                <!-- eslint-disable-next-line vue/no-mutating-props -->
                <dyt-select v-model="strategy.classification" multiple style="width:326px" :disabled="operationType == '2'" >
                <Option
                    v-for="(item,index) in goodsCategoryArr"
                    :value="item.productCategoryId"
                    :key="index" >{{ item.cnName }} </Option > </dyt-select >
              </FormItem >
            </p >
          </div >
        </template >
        <template v-if="strategy.strategyType == 2" >
          <FormItem label="备货店铺：" prop="amazonAccount" >
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <dyt-select v-model="strategy.amazonAccount"
                multiple
                style="width:326px"
                label-in-value
                :disabled="operationType == '2'"
                filterable > <Option
                v-for="(item,index) in amazonAccountArr"
                :disabled="item.warehouseStatus === '1'"
                :value="item.warehouseId"
                :key="index" >{{ item.warehouseName }} </Option > </dyt-select >
          </FormItem >
        </template >
        <div class="dashedBorder" ></div >
        <div >
          <FormItem label="日均销量算法：" prop="type" >
            <!-- eslint-disable-next-line vue/no-mutating-props -->
            <RadioGroup v-model="strategy.type" @on-change="typeChangeFn" >
              <Radio :label="1" :disabled="operationType == '2'" >基础版</Radio >
              <Radio :label="2" :disabled="operationType == '2'" >升级版</Radio >
            </RadioGroup >
          </FormItem >
        </div >
        <div >
          <Card >
            <div class="basicFormula" v-if="strategy.type == 1" >
              <Row >
                <Col :span="5" >
                  <span style="font-size: 12px;line-height: 32px;" >基础版日均销量计算公式：</span >
                </Col >
                <Col :span="19" >
                  <Row >
                    <Col :span="4" class="avg1" >
                      <FormItem label="avg1*" prop="avg1" >
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber v-model="strategy.formula.avg1"
                            :max="1"
                            :min="0"
                            :step="0.01"
                            style="width: 60px;"
                            :disabled="operationType == '2'" ></InputNumber >
                      </FormItem >
                    </Col >
                    <Col :span="5" >
                      <FormItem label="+avg3*" prop="avg3" >
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber v-model="strategy.formula.avg3"
                            :max="1"
                            :min="0"
                            :step="0.01"
                            style="width: 60px;"
                            :disabled="operationType == '2'" ></InputNumber >
                      </FormItem >
                    </Col >
                    <Col :span="5" >
                      <FormItem label="+avg7*" prop="avg7" >
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber v-model="strategy.formula.avg7"
                            :max="1"
                            :min="0"
                            :step="0.01"
                            style="width: 60px;"
                            :disabled="operationType == '2'" ></InputNumber >
                      </FormItem >
                    </Col >
                    <Col :span="5" >
                      <FormItem label="+avg15*" prop="avg15" >
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber v-model="strategy.formula.avg15"
                            :max="1"
                            :min="0"
                            :step="0.01"
                            style="width: 60px;"
                            :disabled="operationType == '2'" ></InputNumber >
                      </FormItem >
                    </Col >
                    <Col :span="5" >
                      <FormItem label="+avg30*" prop="avg30" >
                        <!-- eslint-disable-next-line vue/no-mutating-props -->
                        <InputNumber v-model="strategy.formula.avg30"
                            :max="1"
                            :min="0"
                            :step="0.01"
                            style="width: 60px;"
                            :disabled="operationType == '2'" ></InputNumber >
                      </FormItem >
                    </Col >
                  </Row >
                </Col >
              </Row >
              <div style="margin-top: 5px;" >
                您可以将以上参数通过一个科学计算法计算之后作为日均销量来生成自动补货采购计划<br > 例如avg7*0.6+avg15*0.25+avg30*0.15
                <Poptip trigger="hover" style="vertical-align: middle;" >
                  <Icon type="ios-help" size="20" ></Icon >
                  <div slot="content" >
                    <div style="padding: 10px;" >
                      您可在您的公式中使用以下参数：
                      <p >
                        <span class="param" >avg1</span > <span >代表近1天平均销量</span >
                      </p >
                      <p >
                        <span class="param" >avg3</span > <span >代表近3天平均销量</span >
                      </p >
                      <p >
                        <span class="param" >avg7</span > <span >代表近7天平均销量</span >
                      </p >
                      <p >
                        <span class="param" >avg15</span > <span >代表近15天平均销量</span >
                      </p >
                      <p >
                        <span class="param" >avg30</span > <span >代表近30天平均销量</span >
                      </p >
                      <p >
                        <span class="param" >avgt</span > <span >代表安全交期内平均销量</span >
                      </p >
                    </div >
                  </div >
                </Poptip >
              </div >
            </div >
            <div v-if="strategy.type == 2" style="font-size: 12px;" >
              <div >
                <div class="upgradeTitle" >
                  <span >
                    分类日均销量计算
                  </span >
                  <Poptip placement="right" width="560" :transfer="true" trigger="click" >
                    <Button size="small" style="margin-left: 10px" >设置说明</Button >
                    <div slot="content" >
                      <p style="margin-bottom: 10px;" >
                        avg1 代表近1天平均销量<br > avg3 代表近3天平均销量<br > avg7 代表近7天平均销量<br > avg15 代表近15天平均销量<br > avg30 代表近30天平均销量<br > avgt 代表安全交期内平均销量
                      </p >
                      <p style="margin-bottom: 10px;" >
                        <!-- eslint-disable-next-line vue/no-parsing-error -->
                        持续上升：3天平均销量 >7天平均销量 >15天平均销量 >30天平均销量<br > 持续下降：3天平均销量 &gt;7天平均销量 &gt;15天平均销量 &gt;30天平均销量<br > 波动上升：(3天平均销量 + 7天平均销量) > (15天平均销量 + 30天平均销量)<br > 波动下降：(3天平均销量 + 7天平均销量) < (15天平均销量 + 30天平均销量)
                      </p >
                      <p style="margin-bottom: 10px;" >
                        avg1、avg3…avgt，每一项您都可以根据实际情况进行设置或者不设值，系统会将您所设参数<br > 组成一个科学计算公式，按公式计算所得结果作为日均销量来生成自动补货采购计划。如持续<br > 上升中你设值：avg7设0.6、avg15设0.25、avg30设0.15,则销售持续上升的sku的日均销量<br > 计算公式为：avg7*0.6+avg15*0.25+avg30*0.15
                      </p >
                    </div >
                  </Poptip >
                </div >
                <div class="calTable" >
                  <div class="ivu-table-wrapper" >
                    <div class="ivu-table ivu-table-border" ><!---->
                      <div class="ivu-table-header" >
                        <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;" >
                          <thead >
                          <tr >
                            <th class="column_2 ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span class="" >销量走势</span >
                              </div >
                            </th >
                            <th class="column_3 multiCols ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span class="" >avg3</span >
                              </div >
                            </th >
                            <th class="column_4 ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span class="" >avg7</span >
                              </div >
                            </th >
                            <th class="column_5 ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span class="" >avg15</span >
                              </div >
                            </th >
                            <th class="column_6 ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span class="" >avg30</span >
                              </div >
                            </th >
                          </tr >
                          </thead >
                          <tbody class="ivu-table-tbody" >
                          <tr class="ivu-table-row" >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span >持续上升</span >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell">
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_GROWING.AVG_THREE"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_GROWING.AVG_SEVEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_GROWING.AVG_FIFTEEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_GROWING.AVG_THIRTY"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                          </tr >
                          <tr class="ivu-table-row" >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span >波动上升</span >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_GROWING.AVG_THREE"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_GROWING.AVG_SEVEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_GROWING.AVG_FIFTEEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_GROWING.AVG_THIRTY"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                          </tr >
                          <tr class="ivu-table-row" >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span >持续下降</span >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_DOWN.AVG_THREE"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_DOWN.AVG_SEVEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_DOWN.AVG_FIFTEEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.KEEP_DOWN.AVG_THIRTY"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                          </tr >
                          <tr class="ivu-table-row" >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <span >波动下降</span >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_DOWN.AVG_THREE"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_DOWN.AVG_SEVEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_DOWN.AVG_FIFTEEN"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                            <td class="ivu-table-column-center" >
                              <div class="ivu-table-cell" >
                                <!-- eslint-disable-next-line vue/no-mutating-props -->
                                <InputNumber v-model="strategy.formula.WAVE_DOWN.AVG_THIRTY"
                                    :max="1"
                                    :min="0"
                                    :step="0.01"
                                    style="width: 60px;"
                                    :disabled="operationType == '2'" ></InputNumber >
                              </div >
                            </td >
                          </tr >
                          </tbody >
                        </table >
                      </div >
                    </div >
                  </div >
                </div >
              </div >
              <div >
                <div class="upgradeTitle clear" >
                  <div class="fl" >
                    <span >
                      客单量系数设置
                    </span >
                    <Poptip placement="right" width="560" :transfer="true" trigger="click" >
                      <Button size="small" style="margin-left: 10px" >设置说明</Button >
                      <div slot="content" >
                        <p style="margin-bottom: 10px;" >
                          客单量范围：单个订单中单个SKU的数量。 </p >
                        <p style="margin-bottom: 10px;" >
                          客单量系数：当某SKU客单量偶发性大增时，为了日均销量准确，系统用以修复该SKU客单量<br > 的一个数值（0到1之间的小数），如客单系统为0.1，当某订单中同一SKU数量为100时,系统<br > 会按10（100*0.1）个进行销量统计。
                        </p >
                      </div >
                    </Poptip >
                  </div >
                  <div class="fr" v-if="operationType == '1' || operationType=='3'" >
                    <Icon type="ios-plus" size="22" class="add" @click="addOrderFactorFn" ></Icon >
                  </div >
                </div >
                <div >
                  <Row style="margin: 5px 0;" >
                    <Col :span="12" style="text-align: center;" >
                      客单量范围
                    </Col >
                    <Col :span="10" style="border-left: 1px solid #dddee1;text-align: center;" >
                      客单量系数
                    </Col >
                  </Row >
                  <template v-for="(item,index) in strategy.orderFactor" >
                    <Row style="margin: 5px 0;" >
                      <Col :span="12" style="text-align: center;" >
                        <InputNumber
                            :max="999999"
                            :min="0"
                            :step="1"
                            v-model="item.start"
                            style="width: 80px;"
                            size="small"
                            :disabled="operationType == '2'" ></InputNumber >
                        <span style="display: inline-block;" > --</span >
                        <InputNumber
                            :max="999999"
                            :min="0"
                            :step="1"
                            v-model="item.end"
                            style="width: 80px;"
                            size="small"
                            :disabled="operationType == '2'" ></InputNumber >
                      </Col >
                      <Col :span="10" style="border-left: 1px solid #dddee1;text-align: center;" >
                        <InputNumber
                            :max="1"
                            :min="0"
                            :step="0.01"
                            v-model="item.factor"
                            style="width: 80px;"
                            size="small"
                            :disabled="operationType == '2'" ></InputNumber >
                      </Col >
                      <template v-if="operationType == '1' || operationType=='3'" >
                        <Col :span="2" style="text-align: center;" >
                          <Icon
                              type="ios-minus-outline"
                              size="22"
                              class="minus"
                              @click="delOrderFactorFn(index)" ></Icon >
                        </Col >
                      </template >
                    </Row >
                  </template >
                </div >
              </div >
              <div >
                <div class="upgradeTitle clear" >
                  <div class="fl" >
                    <span >
                      销售系数设置
                    </span >
                    <Poptip placement="right" width="560" :transfer="true" trigger="click" >
                      <Button size="small" style="margin-left: 10px" >设置说明</Button >
                      <div slot="content" >
                        <p style="margin-bottom: 10px;" >
                          销售系数：在节假日或搞促销活动期间销量突升的情况下，在原有日均销量的基础上，乘以<br > 对应日期区间设置的值，使最终日均销量更趋合理。 </p >
                        <p style="margin-bottom: 10px;" >
                          客单量系数：当某SKU客单量偶发性大增时，为了日均销量准确，系统用以修复该SKU客单量<br > 的一个数值（0到1之间的小数），如客单系统为0.1，当某订单中同一SKU数量为100时,系统<br > 会按10（100*0.1）个进行销量统计。
                        </p >
                      </div >
                    </Poptip >
                  </div >
                  <div class="fr" v-if="operationType == '1' || operationType=='3'" >
                    <Icon type="ios-plus" size="22" class="add" @click="addSalesFactorFn" ></Icon >
                  </div >
                </div >
                <div >
                  <Row style="margin: 5px 0;" >
                    <Col :span="12" style="text-align: center;" >
                      日期区间
                    </Col >
                    <Col :span="10" style="border-left: 1px solid #dddee1;text-align: center;" >
                      销售系数
                    </Col >
                  </Row >
                  <template v-for="(item,index) in strategy.salesFactor" >
                    <Row style="margin: 5px 0;" >
                      <Col :span="12" style="text-align: center;" >
                        <DatePicker
                            v-model="item.start"
                            type="date"
                            placeholder='选择日期'
                            transfer
                            style="width: 120px;"
                            size="small"
                            @on-change="val=> item.start = getDateTime(val, 'fulltime')"
                            :disabled="operationType == '2'" ></DatePicker >
                        <!-- <Input v-model="item.start" style="width: 80px;" size="small"></Input> -->
                        <span style="display: inline-block;" > --</span >
                        <DatePicker
                            v-model="item.end"
                            type="date"
                            transfer
                            placeholder='选择日期'
                            style="width: 120px;"
                            size="small"
                            @on-change="val=> item.end = getDateTime(val, 'fulltime')"
                            :disabled="operationType == '2'" ></DatePicker >
                      </Col >
                      <Col :span="10" style="border-left: 1px solid #dddee1;text-align: center;" >
                        <InputNumber
                            :max="1"
                            :min="0"
                            :step="0.01"
                            v-model="item.factor"
                            style="width: 80px;"
                            size="small"
                            :disabled="operationType == '2'" ></InputNumber >
                      </Col >
                      <template v-if="operationType == '1' || operationType=='3'" >
                        <Col :span="2" style="text-align: center;" >
                          <Icon
                              type="ios-minus-outline"
                              size="22"
                              class="minus"
                              @click="delSalesFactorFn(index)" ></Icon >
                        </Col >
                      </template >
                    </Row >
                  </template >
                </div >
              </div >
            </div >
          </Card >
        </div >
        <div class="normalTop" >
          <div class="formula" style="padding-bottom: 20px;" >
            <span style="display: inline-block;" >
              剩余库存数量：可用库存+在途+
            </span >
            <template v-if="strategy.strategyType == 0" >
              <span style="display: inline-block;width: 200px" >
                <FormItem prop="addOptions" >
                  <!-- eslint-disable-next-line vue/no-mutating-props -->
                  <dyt-select v-model="strategy.optional.addOptions"
                      multiple
                      @on-change="stockFormulaFn"
                      :disabled="operationType == '2'"
                      transfer >
                    <Option
                        v-for="(item,index) in addOptionsArr"
                        :value="item.dataCode"
                        :key="index" >{{ item.dataDesc }}</Option >
                  </dyt-select >
                </FormItem >
              </span > <span style="display: inline-block;margin-left: 10px;" >
                -
              </span > <span style="display: inline-block;width: 200px" >
                <FormItem prop="subOptions" >
                  <!-- eslint-disable-next-line vue/no-mutating-props -->
                  <dyt-select v-model="strategy.optional.subOptions"
                      multiple
                      @on-change="stockFormulaFn"
                      :disabled="operationType == '2'"
                      transfer >
                    <Option
                        v-for="(item,index) in subOptionsArr"
                        :value="item.dataCode"
                        :key="index" >{{ item.dataDesc }}</Option >
                  </dyt-select >
                </FormItem >
              </span >
            </template >
            <template v-if="strategy.strategyType == 1" >
              <CheckboxGroup v-model="tripartite" style="display: inline" >
                <Checkbox label="02" :disabled="operationType == '2'" >
                  <span >备货计划审核中的商品数</span >
                </Checkbox >
                <span style="display: inline-block;" >
                +
              </span >
                <Checkbox label="04" :disabled="operationType == '2'" >
                  <span >调入本仓库但调出仓库还未出库的商品数</span >
                </Checkbox >
                <span style="display: inline-block;" >
                -
              </span >
                <Checkbox label="05" :disabled="operationType == '2'" >
                  <span >已创建出库单还未出库商品数
                  </span >
                </Checkbox >
              </CheckboxGroup >

              <!--  <span style="display: inline-block;width: 150px">
                  <FormItem prop="pendings">

                    <Checkbox v-model="strategy.pendings" :disabled="operationType == '2'">
                      <span>pending订单产品数</span>
                    </Checkbox>
                  </FormItem>
                </span>
                <span style="display: inline-block;">
                  +
                </span>
                <span style="display: inline-block;width: 160px">
                  <FormItem prop="approvals">
                    <Checkbox v-model="strategy.approvals" :disabled="operationType == '2'">
                      <span>备货计划审批中产品数</span>
                    </Checkbox>
                  </FormItem>
                </span>-->
            </template >
            <template v-if="strategy.strategyType == 2" >
              <CheckboxGroup v-model="amazonList" style="display: inline" >
                <Checkbox label="02" :disabled="operationType == '2'" >
                  <span >备货计划审核中商品数</span >
                </Checkbox >
                <span style="display: inline-block;" >
                +
              </span >
                <Checkbox label="09" :disabled="operationType == '2'" >
                  <span >申报中商品数</span >
                </Checkbox >
                <span style="display: inline-block;" >
                -
              </span >
                <Checkbox label="10" :disabled="operationType == '2'" >
                  <span >pending订单商品数</span >
                </Checkbox >
              </CheckboxGroup >
            </template >
          </div >
          <div >
            备货建议条件：
            <template v-if="strategy.strategyType == 0" >备货建议公式=</template >
            （日均销量*安全交期）-剩余库存数量＞0提示采购建议
          </div >
          <!-- <p>
            <span>（日均销量*安全交期）-(</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('00') != -1? false : true}">可用库存</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('01') != -1? false : true}">+备货计划审批中货品数</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('02') != -1? false : true}">+采购需求</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('03') != -1? false : true}">+在途货品</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('04') != -1? false : true}">+处于审批状态中的采购单货品数</span>
            <span :class="{green: true, lineThrough: formulaStr.indexOf('05') != -1? false : true}">+未入库的组装加工单中的成品数</span>
            ) + (
            <span :class="{red: true, lineThrough: formulaStr.indexOf('06') != -1? false : true}">+未配货订单包裹货品数量</span>
            <span :class="{red: true, lineThrough: formulaStr.indexOf('07') != -1? false : true}">+组装加工产品未组装的加工单所需货品数量</span>
            <span :class="{red: true, lineThrough: formulaStr.indexOf('08') != -1? false : true}">+本仓调出但未出库的货品数量</span>
            <span>）＞0提示采购建议</span>
          </p> -->
        </div >
        <div class="dashedBorder" ></div >
        <div >
          <div >
            <FormItem label="备货频率：" prop="frequency" >
              <!-- eslint-disable-next-line vue/no-mutating-props -->
              <InputNumber :max="9999" :min="0" v-model="strategy.frequency" :disabled="operationType == '2'" ></InputNumber >
              <span >天</span >
            </FormItem >
          </div >
          <div >
            <FormItem label="备货建议取值公式：" prop="takeValueType" >
              <!-- eslint-disable-next-line vue/no-mutating-props -->
              <RadioGroup v-model="strategy.takeValueType" >
                <Radio :label="1" :disabled="operationType == '2'" >
                  <span v-if="strategy.strategyType == 0" >备货公式计算数</span >
                  <span v-if="strategy.strategyType == 1 || strategy.strategyType == 2" >安全交期*日均销量</span >
                </Radio >
                <Radio :label="2" :disabled="operationType == '2'" >备货频率*日均销量</Radio >
                <Radio :label="3" :disabled="operationType == '2'" >两者最大值</Radio >
              </RadioGroup >
            </FormItem >
          </div >
        </div >
      </Form >
    </div >
    <div style="text-align: center;padding: 28px 18px 0 18px;" >
      <Button
          type="primary"
          @click="save('strategy')"
          :loading="saveLoading"
          v-if="operationType != '2'"
          style="margin-right: 30px;" >确定 </Button >
      <Button type="primary" @click="close" >关闭</Button >
    </div >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  props: ['operationType', 'strategy'],
  mixins: [Mixin],
  data () {
    var self = this;
    return {
      modalHeight: self.getTableHeight(240),
      tripartite: [],
      amazonList: '',
      formulaStr: '', // 选中项组合的字符串
      strategyObj: {},
      selfWarehouseArr: [], // 自营仓库
      thirdWarehouseArr: [], // 第三方仓库
      labelArr: [], // 标签数组
      goodsCategoryArr: [], // 商品分类数组
      amazonAccountArr: [], // 备货店铺
      subOptionsArr: [
        {
          dataDesc: '已创建出库单但还未出库商品数',
          dataCode: '05'
        }, {
          dataDesc: '已创建出库单但还未出库商品数',
          dataCode: '06'
        }, {
          dataDesc: '要调出本仓库还未生成出库单的商品数',
          dataCode: '07'
        }
      ],
      addOptionsArr: [
        {
          dataDesc: '备货计划审核中的商品数',
          dataCode: '01'
        }, {
          dataDesc: '未入库的组装加工单中的成品数',
          dataCode: '03'
        }, {
          dataDesc: '调入本仓库但调出仓库还未出库的商品数',
          dataCode: '04'
        }
      ],
      saveLoading: false,
      ruleValidate: {
        name: [
          {
            required: true,
            message: '不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 100,
            message: '不能超过100个字符',
            trigger: 'change'
          }
        ],
        strategyType: [
          {
            required: true,
            type: 'number',
            message: '请选择',
            trigger: 'change'
          }
        ],
        type: [
          {
            required: true,
            type: 'number',
            message: '请选择',
            trigger: 'change'
          }
        ],
        warehouse: [
          {
            required: true,
            type: 'array',
            min: 1,
            message: '请选择至少一个',
            trigger: 'change'
          }
        ],
        label: [
          {
            required: true,
            type: 'array',
            min: 1,
            message: '请选择至少一个',
            trigger: 'change'
          }
        ],
        classification: [
          {
            required: true,
            type: 'array',
            min: 1,
            message: '请选择至少一个',
            trigger: 'change'
          }
        ],
        amazonAccount: [
          {
            required: true,
            type: 'array',
            min: 1,
            message: '请选择至少一个',
            trigger: 'change'
          }
        ],
        frequency: [
          {
            required: true,
            type: 'number',
            min: 0,
            message: '不能为空',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  created () {
    this.strategyObj = this.deepCopy(this.strategy);
    this.tripartite = [...this.strategyObj.optional.subOptions, ...this.strategyObj.optional.addOptions];
    this.amazonList = [...this.strategyObj.optional.subOptions, ...this.strategyObj.optional.addOptions];
    this.getWarehouse();
    this.getLabel();
    this.getGoodsCategory();
    // this.getFormulaFn()
    this.stockFormulaFn();
  },
  methods: {
    getLabel () {
      let v = this;
      v.axios.get(api.label).then(res => {
        if (res.data.code == 0) {
          v.labelArr = res.data.datas;
        }
      });
    },
    getWarehouse () {
      let v = this;
      v.selfWarehouseArr = [];
      v.thirdWarehouseArr = [];
      v.amazonAccountArr = [];
      v.axios.post(api.warehouse, {}).then(res => {
        res.data.datas.forEach((n, i) => {
          if (n.warehouseType == '0') {
            v.selfWarehouseArr.push(n);
          } else if (n.warehouseType == '1' && !n.shopName) {
            v.thirdWarehouseArr.push(n);
          } else if (n.warehouseType == '1' && n.shopName) {
            v.amazonAccountArr.push(n);
          }
        });
      });
    },
    strategyTypeChange (val) {
      let v = this;
      v.strategy.warehouse = [];
      v.strategy.label = [];
      v.strategy.classification = [];
      v.strategy.amazonAccount = [];
      v.strategy.optional.subOptions = [];
      v.strategy.optional.addOptions = [];
      v.strategy.pendings = false;
      v.strategy.approvals = false;
    },
    getGoodsCategory () {
      let v = this;
      v.axios.get(api.allGoodsCategory).then(res => {
        if (res.data.code == 0) {
          v.goodsCategoryArr = res.data.datas;
        }
      });
    },
    getFormulaFn () { // 获取备货公式列表
      let v = this;
      v.subOptionsArr = [];
      v.addOptionsArr = [];
      v.axios.get(api.baseDataList + '?dataType=backupSuggestFormula').then(res => {
        if (res.data.code == 0) {
          let arr = res.data.datas;
          arr.forEach((n, i) => {
            if (n.dataValue == '-') {
              v.subOptionsArr.push(n);
            } else if (n.dataValue == '+') {
              v.addOptionsArr.push(n);
            }
          });
        }
      });
    },
    stockFormulaFn () {
      let v = this;
      let arr = [];
      if (v.strategy.strategyType === 0 || v.strategy.strategyType === 1) {
        v.strategy.optional.subOptions.forEach((n, i) => { // 筛选出符合subOptionsArr的选项
          v.subOptionsArr.forEach((m, j) => {
            if (n == m.dataCode) {
              arr.push(n);
            }
          });
        });
        v.strategy.optional.addOptions.forEach((n, i) => { // 筛选出符合addOptionsArr的选项
          v.addOptionsArr.forEach((m, j) => {
            if (n == m.dataCode) {
              arr.push(n);
            }
          });
        });
        v.formulaStr = arr.join(',');
      }
    },
    typeChangeFn (val) {
      let v = this;
      if (v.strategy.type == 1) {
        v.strategy.formula = {
          avg1: null,
          avg3: null,
          avg7: null,
          avg15: null,
          avg30: null
        };
      } else {
        v.strategy.formula = {
          KEEP_GROWING: {
            AVG_THREE: null,
            AVG_SEVEN: null,
            AVG_FIFTEEN: null,
            AVG_THIRTY: null
          },
          WAVE_GROWING: {
            AVG_THREE: 0.2,
            AVG_SEVEN: 0.3,
            AVG_FIFTEEN: 0.2,
            AVG_THIRTY: 0.3
          },
          KEEP_DOWN: {
            AVG_THREE: null,
            AVG_SEVEN: null,
            AVG_FIFTEEN: null,
            AVG_THIRTY: null
          },
          WAVE_DOWN: {
            AVG_THREE: 0.3,
            AVG_SEVEN: 0.2,
            AVG_FIFTEEN: 0.3,
            AVG_THIRTY: 0.2
          }
        };
        v.strategy.orderFactor = [];
        v.strategy.salesFactor = [];
      }
    },
    addOrderFactorFn () {
      // eslint-disable-next-line vue/no-mutating-props
      this.strategy.orderFactor.push({
        start: null,
        end: null,
        factor: null
      });
    },
    delOrderFactorFn (index) {
      // eslint-disable-next-line vue/no-mutating-props
      this.strategy.orderFactor.splice(index, 1);
    },
    addSalesFactorFn () {
      // eslint-disable-next-line vue/no-mutating-props
      this.strategy.salesFactor.push({
        start: null,
        end: null,
        factor: null
      });
    },
    delSalesFactorFn (index) {
      // eslint-disable-next-line vue/no-mutating-props
      this.strategy.salesFactor.splice(index, 1);
    },
    getStrategyConditionList () {
      let v = this;
      v.strategy.strategyConditionList = [];
      if (v.strategy.warehouse.length > 0) {
        let arr = v.strategy.strategyType == 0 ? v.selfWarehouseArr : v.thirdWarehouseArr;
        v.strategy.warehouse.forEach((n, i) => {
          arr.forEach((m, j) => {
            if (n == m.warehouseId) {
              v.strategy.strategyConditionList.push({
                conditionId: m.warehouseId,
                conditionType: 'warehouse',
                conditionValue: m.warehouseName
              });
            }
          });
        });
      }
      if (v.strategy.label.length > 0) {
        v.strategy.label.forEach((n, i) => {
          v.strategy.strategyConditionList.push({
            conditionType: 'label',
            conditionValue: n
          });
        });
      }
      if (v.strategy.classification.length > 0) {
        v.strategy.classification.forEach((n, i) => {
          v.goodsCategoryArr.forEach((m, j) => {
            if (n == m.productCategoryId) {
              v.strategy.strategyConditionList.push({
                conditionId: m.productCategoryId,
                conditionType: 'category',
                conditionValue: m.cnName
              });
            }
          });
        });
      }
      if (v.strategy.amazonAccount.length > 0) {
        v.strategy.amazonAccount.forEach((n, i) => {
          v.amazonAccountArr.forEach((m, j) => {
            if (n == m.warehouseId) {
              v.strategy.strategyConditionList.push({
                conditionId: m.warehouseId,
                conditionType: 'amazonAccount',
                conditionValue: m.amazonAccountName
              });
            }
          });
        });
      }
    },
    save (name) {
      let v = this;
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.getStrategyConditionList();
          let obj = v.deepCopy(v.strategy);
          if (obj.type == 1) {
            obj.orderFactor = '';
            obj.salesFactor = '';
            let formulaArr = [];
            for (let item in obj.formula) {
              if (obj.formula[item]) {
                formulaArr.push(item + '*' + obj.formula[item]);
              }
            }
            obj.formula = formulaArr.join('+');
          } else {
            obj.orderFactor = JSON.stringify(obj.orderFactor);
            obj.salesFactor = JSON.stringify(obj.salesFactor);
            obj.formula = JSON.stringify(obj.formula);
          }
          if (obj.strategyType == 1) {
            obj.optional.subOptions = [];
            obj.optional.addOptions = [];
            if (v.tripartite.indexOf('04') > -1) {
              obj.optional.subOptions.push('04');
              v.tripartite.splice(v.tripartite.indexOf('04'), 1);
            }
            obj.optional.addOptions = [...v.tripartite];
          } else if (obj.strategyType == 2) {
            obj.optional.subOptions = [];
            obj.optional.addOptions = [];
            if (v.amazonList.indexOf('10') > -1) {
              obj.optional.subOptions.push('04');
              v.amazonList.splice(v.amazonList.indexOf('04'), 1);
            }
            obj.optional.addOptions = [...v.amazonList];
          }
          obj.optional.addOptions = new Set(obj.optional.addOptions.concat(['00', '01']));
          obj.optional = JSON.stringify(obj.optional);
          delete obj.warehouse;
          delete obj.label;
          delete obj.classification;
          delete obj.amazonAccount;
          delete obj.pendings;
          delete obj.approvals;
          v.saveLoading = true;
          v.axios.post(api.strategySave, obj).then(res => {
            v.saveLoading = false;
            if (res.data.code == 0) {
              v.$Message.success('保存成功！');
              v.$emit('saveSuccess');
            }
          });
        }
      });
    },
    close () {
      this.$emit('closeStrategy');
    }
  }
};
</script>
