<template>
  <div>
    <Modal
      v-model="modal1"
      width="1000"
      class="rule-modal"
      title="规则">
      <Row  :gutter="10">
        <Col :span="15">
          <!--已选规则-->
          <div class="normalTop" >
            <div class="modalItem rulesRightHeight" >
              <div class="modalItemHeader" >
                <h6 >已选条件</h6 >
              </div >
              <div class="modalItemContent">
                <template v-if="rules !== null && rules.length > 0" >
                  <template v-for="(ruleItem, index) in rules"  >
                    <div v-if="ruleItem._check" class="mb10" :key="index">
                      <div >
                        <span>{{ruleItem.groupDescription}}</span>
                        <span>{{ruleItem._prefixText}}</span>

                        <!--是否类型-->
                        <template v-if="ruleItem._ruleType === 'IS'">
                          <dyt-select
                            v-if="ruleItem.items[0]._isOperation"
                            v-model="ruleItem.values[ruleItem.items[0].name]"
                            @on-change="validRule(ruleItem.id)"
                            class="wid-70 ml10"><Option value="1">是</Option><Option value="0">否</Option>
                          </dyt-select>
                          <span v-else class="edit-style" @click="editOperation(index,0)">{{ruleItem.items[0].value === '0' ? '否' : '是'}}</span>
                        </template>

                        <!--单个input-->
                        <template v-else-if="ruleItem._ruleType === 'INPUT'">
                          <Input v-if="ruleItem.items[0]._isOperation" class="wid-150 ml10" v-model="ruleItem.values[ruleItem.items[0].name]" @on-change="validRule(ruleItem.id)" />
                          <span v-else class="edit-style" @click="editOperation(index,0)">{{ruleItem.values[ruleItem.items[0].name] ? ruleItem.values[ruleItem.items[0].name] : ruleItem._guidanceText}}</span>
                        </template>

                        <!--非通用单个模板-->
                        <template v-else>

                          <template v-if="ruleItem.id === 'order-service-A014'">
                            <Poptip
                              transfer
                              width="500"
                              placement="bottom" >
                                <span class="blueColor cursor ml5" >
                                  <span v-if="ruleItem.values[ruleItem.items[0].name] === '0'" >订单包含多个交易（且运输类型完全相同 ） 或者 订单仅包含一个交易</span >
                                  <span v-else-if="ruleItem.values[ruleItem.items[0].name] === '1'" >订单包含多个交易（且运输类型不完全相同 ）</span >
                                  <span v-else >{{ruleItem._guidanceText}}</span >
                                </span >
                              <div slot="content" class="keywordString" >
                                <RadioGroup v-model="ruleItem.values[ruleItem.items[0].name]" @on-change="validRule(ruleItem.id)">
                                  <Radio label="0" style="marginTop:10px;" >订单包含多个交易（且运输类型完全相同 ） 或者 订单仅包含一个交易</Radio >
                                  <br >
                                  <Radio label="1" style="marginTop:10px;" >订单包含多个交易（且运输类型不完全相同 ）</Radio >
                                </RadioGroup >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A018'">
                            <Poptip
                              transfer
                              width="500"
                              placement="bottom" >
                              <span  v-if="(ruleItem.checkbox1 || ruleItem.checkbox2)
                                          && (ruleItem.values['startType'] !== null || ruleItem.values['endType']!== null)"
                                class="blueColor cursor ml5"
                              >
                                  <span v-if="ruleItem.checkbox1">
                                      <span v-if="ruleItem.values['startType'] !== null">{{greaterSign[ruleItem.values['startType']].label}}</span>
                                      <span>{{ruleItem.values['startValue']}}</span>
                                  </span>
                                  <span v-if="ruleItem.checkbox2" class="ml5">
                                      <span v-if="ruleItem.values['endType'] !== null">{{LessSign[ruleItem.values['endType']].label}}</span>
                                      <span>{{ruleItem.values['endValue']}}</span>
                                  </span>
                              </span>
                              <span class="blueColor cursor ml5" v-else>{{ruleItem._guidanceText}}</span >
                              <div slot="content" class="keywordString" >
                                <span >订单收货邮编字符长度满足以下选中的条件:</span >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox1"  @on-change="changeCheckbox(ruleItem.checkbox1,index,[0,1]);validRule(ruleItem.id)"></Checkbox >
                                  <dyt-select
                                    v-model="ruleItem.values['startType']"
                                    style="width:120px;"
                                    size="small"
                                    @on-change="validRule(ruleItem.id)"
                                    :disabled="!ruleItem.checkbox1" >
                                    <Option v-for="(sign, index) in greaterSign" :value="sign.value" :key="index">{{sign.label}}</Option >
                                  </dyt-select >
                                  <InputNumber
                                    :min="0"
                                    size="small"
                                    style="marginLeft:10px;"
                                    @on-change="validRule(ruleItem.id)"
                                    :disabled="!ruleItem.checkbox1"
                                    v-model="ruleItem.values['startValue']" ></InputNumber >
                                </div >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox2" @on-change="changeCheckbox(ruleItem.checkbox2,index,[2,3]);validRule(ruleItem.id)"></Checkbox >
                                  <dyt-select
                                    v-model="ruleItem.values['endType']"
                                    style="width:120px;"
                                    size="small"
                                    @on-change="validRule(ruleItem.id)"
                                    :disabled="!ruleItem.checkbox2" >
                                    <Option v-for="(sign, index) in LessSign" :value="sign.value" :key="index">{{sign.label}}</Option >
                                  </dyt-select >
                                  <InputNumber
                                    :min="0"
                                    size="small"
                                    @on-change="validRule(ruleItem.id)"
                                    style="marginLeft:10px;"
                                    :disabled="!ruleItem.checkbox2"
                                    v-model="ruleItem.values['endValue']" ></InputNumber >
                                </div >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A019'">
                            <Poptip
                              transfer
                              width="500"
                              placement="bottom" >
                            <span class="blueColor cursor" >
                              指定条件
                            </span >
                              <div slot="content" class="keywordString" >
                                <span >订单收件人电话符合以下选中的条件：</span >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox1" ></Checkbox >
                                  <span >移动电话可读字符长度≤</span >
                                  <InputNumber
                                    :min="0"
                                    size="small"
                                    style="marginLeft:10px;"
                                    :disabled="!ruleItem.checkbox1"
                                    v-model="ruleItem.values['mobileLength']" ></InputNumber >
                                </div >
                                <dyt-select
                                  v-model="ruleItem.values['phonePreRelateType']"
                                  style="width:120px;"
                                  size="small"
                                  :disabled="!ruleItem.checkbox2" >
                                  <Option v-for="(ar, index) in andOr" :value="ar.value" :key="index">{{ar.label}}</Option >
                                </dyt-select >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox2" ></Checkbox >
                                  <span >固定电话可读字符长度≤</span >
                                  <InputNumber
                                    :min="0"
                                    size="small"
                                    style="marginLeft:10px;"
                                    :disabled="!ruleItem.checkbox2"
                                    v-model="ruleItem.values['phoneLength']" ></InputNumber >
                                </div >
                                <dyt-select
                                  v-model="ruleItem.values['mobilePreRelateType']"
                                  style="width:120px;"
                                  size="small"
                                  :disabled="!ruleItem.checkbox3 || (ruleItem.checkbox3 && (!ruleItem.checkbox1 && !ruleItem.checkbox2))" >
                                  <Option v-for="ar in andOr" :value="ar.value" :key="ar.value">{{ar.label}}</Option >
                                </dyt-select >
                                <div class="platformSelect normalTop" >
                                  <Checkbox
                                    :disabled="!ruleItem.checkbox1"
                                    v-model="ruleItem.checkbox3" ></Checkbox >
                                  <span > 移动电话前缀</span >
                                  <dyt-select
                                    v-model="ruleItem.values['mobilePreSlect']"
                                    style="width:120px;"
                                    size="small"
                                    :disabled="!ruleItem.checkbox3">
                                    <Option v-for="ar in isBy" :value="ar.value" :key="ar.value">{{ar.label}}</Option >
                                  </dyt-select >
                                  <Input
                                    style="width:200px;marginLeft:10px;"
                                    type="textarea"
                                    placeholder="可输入多个，中间用英文逗号隔开"
                                    v-model.trim="ruleItem.values['mobilePres']"
                                    :disabled="!ruleItem.checkbox3" ></Input >
                                </div >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A015'">
                            <Poptip
                              transfer
                              width="500"
                              placement="bottom" >
                              <a v-if="ruleItem.values['streets'] && ruleItem.values['streets'].length > 1  && ruleItem.values['streets'].some(i => i.value)" ><span
                                v-for="(item,index) in  ruleItem.values['streets']"
                                :key="index"
                                :title="JSON.stringify(ruleItem.values['streets'])"
                                class="mr5" >{{ item.value }}</span ></a >
                              <a v-else >指定字符串</a >
                              <div slot="content" class="keywordString" >
                                <span >指定要在地址(仅街道1+街道2，不含国家/地区省市信息)中查找的字符：</span >
                                <Form
                                  ref="streets"
                                  class="reset-form"
                                  :model="ruleItem.values"
                                  :label-width="80"
                                  style="width: 300px" >
                                  <FormItem
                                    v-for="(item, sIndex) in ruleItem.values['streets']"
                                    :key="sIndex"
                                    :label="'关键字' + sIndex" >
                                    <Row >
                                      <Col span="18" >
                                        <Input type="text" v-model.trim="item.value" placeholder="请输入关键字..." ></Input >
                                      </Col >
                                      <Col span="4" offset="1" >
                                        <Button @click="streetsRemove(index,sIndex)" >删除</Button >
                                      </Col >
                                    </Row >
                                  </FormItem >
                                  <FormItem >
                                    <Row >
                                      <Col span="12" >
                                        <Button type="dashed" long @click="streetsAdd(index)" icon="md-add" >新增</Button >
                                      </Col >
                                    </Row >
                                  </FormItem >
                                </Form >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A016'">
                            <Poptip
                              transfer
                              width="500"
                              placement="bottom" >
                            <span class="blueColor cursor" >
                              指定长度
                            </span >
                              <span >{{ ruleItem.values['length'] }}</span >
                              <div slot="content" class="keywordString" >
                                <span >订单地址信息字符长度小于：</span >
                                <InputNumber
                                  :min="0"
                                  size="small"
                                  style="marginLeft:10px;"
                                  v-model="ruleItem.values['length']" ></InputNumber >
                                <div style="color: red;marginTop: 5px;" >
                                  *此处地址信息由街道1与街道2合并组成，不包含国家/地区、省州、城市信息。
                                </div >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A017'">
                            <Poptip
                              transfer
                              width="650"
                              placement="bottom" >
                      <span class="blueColor cursor" >
                        <span v-if="(ruleItem.checkbox1 && ruleItem.values['beginStr']) || (ruleItem.checkbox2 && ruleItem.values['containsStr'])" >
                          <span v-if="ruleItem.checkbox1" >以 <span class="plr10" >{{ruleItem.values['beginStr'] }}</span > 开头</span >
                          <span v-if="ruleItem.checkbox1 && ruleItem.checkbox2" >
                            <span v-if="ruleItem.values['relevance'] === 0" >,并且</span >
                            <span v-if="ruleItem.values['relevance'] === 1" >,或者</span >
                          </span >
                          <span v-if="ruleItem.checkbox2" >包含 <span
                            class="plr10" >{{ ruleItem.values['containsStr'] }}</span ></span >
                        </span >
                        <span v-else >指定格式</span >
                      </span >
                              <div slot="content" class="keywordString" >
                                <span >订单邮编至少符合以下选中的条件中的任意一个条件(输入内容仅限数字、英文字母、中划线和空隔)：</span >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox1" >以</Checkbox >
                                  <Input
                                    style="width:200px;marginLeft:10px;"
                                    type="textarea"
                                    placeholder="可输入多个，中间用英文逗号隔开"
                                    v-model.trim="ruleItem.values['beginStr']"
                                    :disabled="!ruleItem.checkbox1" ></Input >
                                  开头
                                </div >
                                <dyt-select
                                  v-model="ruleItem.values['relevance']"
                                  style="width:80px;marginTop:15px;"
                                  size="small"
                                  :disabled="!(ruleItem.checkbox1 && ruleItem.checkbox2)" >
                                  <Option :value="0" >并且</Option >
                                  <Option :value="1" >或者</Option >
                                </dyt-select >
                                <div class="platformSelect normalTop" >
                                  <Checkbox v-model="ruleItem.checkbox2" >包含</Checkbox >
                                  <Input
                                    style="width:200px;marginLeft:10px;"
                                    type="textarea"
                                    placeholder="可输入多个，中间用英文逗号隔开"
                                    v-model.trim="ruleItem.values['containsStr']"
                                    :disabled="!ruleItem.checkbox2" ></Input >
                                </div >
                              </div >
                            </Poptip >
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A020'">
                            <span class="blueColor cursor" @click="$refs.ruleTempAbnormal.open(ruleItem.values,ruleItem.id)">指定异常</span>
                          </template>

                          <template v-if="ruleItem.id === 'order-service-A004'">
                            <span
                              v-if="!ruleItem.items[0]._isOperation"
                              class="blueColor itemPaddingRight cursor countryCodesName"
                              @click="editOperation(index,0)" >
                              {{ countryCodesName === '' ? '指定国家' : countryCodesName }}
                            </span >
                            <treeSelect
                              v-else
                              :treeData="countryData"
                              ref="treeSelectRef1"
                              v-model="countryCodes"
                              filterable
                              @on-change="getTreeData($event,ruleItem.id)"
                              style="width:200px"
                              show-checkbox ></treeSelect>
                            <!-- 且邮编在 -->
                            <span
                              class="itemPaddingRight"
                              :class="{textMarginTop: ruleItem.values['countryCodes']}" >且邮编在</span >
                            <span
                              class="blueColor itemPaddingRight cursor"
                              :class="{textMarginTop: ruleItem.items[0]._isOperation}" >
                              <Poptip
                                transfer
                                width="500"
                                placement="bottom" >
                                <!-- 指定范围 -->
                                <span class="blueColor itemPaddingRight cursor" >
                                  <span v-for="(item, index) in postcodeArr" :key="index" >
                                    <span v-if="index > 0" >, </span >
                                    {{
                                      item.postcode1 !== '' && item.postcode2 !== ''
                                        ? item.postcode1 + '-' + item.postcode2
                                        : postcodeArea !== '' ? postcodeArea : '指定范围'
                                    }}
                                  </span >
                                </span >
                                <div slot="content" class="keywordString" >
                                  <RadioGroup
                                    v-model="ruleItem.values['postalCodeType']"
                                    @on-change="getPostCodeType" >
                                    <!-- 邮编段 -->
                                    <Radio :label="0" >
                                      <span >邮编段</span >
                                    </Radio >
                                    <!-- 邮编列表 -->
                                    <Radio :label="1" >
                                      <span >邮编列表</span >
                                    </Radio >
                                  </RadioGroup >
                                  <!-- 邮编段 -->
                                  <div class="normalTop" v-if="ruleItem.values['postalCodeType'] === 0" >
                                    <!-- <Input v-model.trim="postcodeOne" style="width:150px"></Input>
                                    <span> - </span>
                                    <Input v-model.trim="postcodeTwo" style="width:150px"></Input> -->
                                    <div v-for="(item, index) in postcodeArr" :key="index" class="normalMarginBottom" >
                                      <Input v-model.trim="item.postcode1" style="width:150px" ></Input >
                                      <span > - </span >
                                      <Input v-model.trim="item.postcode2" style="width:150px" ></Input >
                                      <Button
                                        type="primary"
                                        shape="circle"
                                        icon="md-add"
                                        class="normalLMargin"
                                        v-if="index === 0"
                                        @click="addPostcodeFn" ></Button >
                                      <Button
                                        type="error"
                                        shape="circle"
                                        icon="md-remove"
                                        class="normalLMargin"
                                        v-if="index > 0"
                                        @click="deletePostcodeFn(index)" ></Button >
                                    </div >
                                  </div >
                                  <!-- 邮编列表 -->
                                  <div class="normalTop" v-if="ruleItem.values['postalCodeType'] === 1" >
                                    <Input
                                      v-model="postcodeArea"
                                      style="width:300px"
                                      type="textarea"
                                      :rows="5"
                                      placeholder="多邮编换行请求半角输入逗号隔开" ></Input >
                                  </div >
                                </div >
                              </Poptip >
                            </span>
                          </template>
                        </template>

                        <Tooltip content="当前规则未填写完成" class="ml10" v-if="!ruleItem._checkStatus">
                          <Icon class="red cursor" size="18" v-if="!ruleItem._checkStatus" type="md-alert" />
                        </Tooltip>
                      </div >
                    </div>
                  </template>
                </template >
              </div>
            </div>
          </div>
          <!--设定动作-->
          <div>

          </div>
        </Col>
        <Col :span="9">
          <!--所有规则-->
          <div class="normalTop" >
            <div class="modalItem rulesRightHeight" >
              <div class="modalItemHeader" >
                <h6 >可选条件</h6 >
              </div >
              <div class="modalItemContent" style="max-height: 610px;overflow: auto">
                <template v-if="rules !== null && rules.length > 0" >
                  <div v-for="(item, index) in rules" :key="index">
                    <div
                      v-if="((index >  0 && item.group !== rules[index - 1].group ) || index === 0) && item.group !== null"
                      class="groupTitle" >
                      {{ item.groupDescription }}
                      <span style="position: relative; top: 1px; cursor: pointer;" v-if="item.groupDescription === 'Aliexpress'">
                          <Tooltip
                            transfer
                            content="十日达订单即X日达订单，如5日达、10日达" >
                          <Icon size="18" type="md-help-circle" />
                        </Tooltip >
                        </span>
                    </div >
                    <Checkbox v-model="item._check" @on-change="checkHandel(item)">
                      <span v-html="item.display" ></span >
                    </Checkbox >
                  </div >
                </template >
              </div >
            </div >
          </div >
        </Col>
      </Row>
      <div slot="footer">
        <Button type="primary" @click="save">保存</Button>
        <Button @click="modal1=false">取消</Button>
      </div>
    </Modal>
    <ruleTempAbnormal ref="ruleTempAbnormal"
         @confirm="OnRuleTempAbnormalConfirm"
    ></ruleTempAbnormal>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
import ruleMixin from '@/components/mixin/rule_mixin';
import ruleTempAbnormal from './ruleTempAbnormal';
import {
  RULE_TYPE_IS,
  RULE_TYPE_INPUT,
  RULE_HAS_CHECKBOX
} from '@/utils/enum';
import api from '@/api/api';

export default {
  name: 'newRule',
  mixins: [Mixin, ruleMixin],
  data () {
    return {
      modal1: false,
      rules: null, // 所有规则
      ruleAction: null, // 规则动作
      ruleId: null // 规则id

    };
  },
  created () {

  },
  props: {
    ruleType: {
      type: String,
      required: true
    }
  },
  watch: {},
  methods: {
    /**
     * 赋值特殊处理
     * @date: 2021/10/11 18:08
     */
    specialToView (ruleCode) {
      let v = this;
      if (ruleCode === 'order-service-A001') {
        v.shipmentPlatformList = v.getEnablePlatform();
      } else if (ruleCode === 'order-service-A004') {
        v.countryCodesAndPostCodeIO('output');
      }
    },
    /**
     * 选择change事件
     * 处理特殊模板规则
     * @date: 2021/10/11 18:12
     */
    checkHandel (item) {
      let v = this;
      if (item.id === 'order-service-A001') {
        v.shipmentPlatformList = v.getEnablePlatform();
      } else if (item.id === 'order-service-A004') {
        v.getCommonCountry();
      }
    },
    /**
     * checkbox处理
     * @param value 当前值
     * @param index rule Index
     * @param rulesIndex 规则项name Index
     * */
    changeCheckbox (value, index, rulesIndex) {
      this.rules.forEach((i, ind) => {
        if (index === ind) {
          rulesIndex.forEach(j => {
            i.items[j]._disabled = !value;
          });
        }
      });
    },
    /**
     * 验证规则
     * @date: 2021/10/11 9:18
     * @param ruleCode 验证单条规则
     */
    validRule (ruleCode) {
      let v = this;
      let valid = true;
      function mt (i, bo) {
        valid = !(i._check && i.items.every(j => (i.values[j.name] === null || j._disabled)));
        if (bo && !valid) return;
        v.$set(i, '_checkStatus', valid); // define true
      }
      v.rules.forEach(i => {
        if (ruleCode) {
          if (i.id === ruleCode) mt(i, true);
        } else {
          mt(i);
        }
      });
      return valid;
    },
    /**
     * 保存
     * */
    save () {
      let v = this;
      if (!v.validRule()) return;
      let params = v.fixParams();
      console.log(params);
    },
    fixParams () {
      let v = this;
      let params = [];
      if (v.rules) {
        v.rules.forEach(i => {
          if (i._check) {
            if (i.id === 'order-service-A004') {
              v.countryCodesAndPostCodeIO('input', i.id, i);
            }
            params.push({
              ruleCode: i.id,
              autoRuleParams: i.items.map(j => {
                let obj = {};
                obj.name = j.name;
                obj.value = j._disabled ? null : i.values[j.name];
                return obj;
              })
            });
          }
        });
      }
      return params;
    },
    dataToView (detail, rs) {
      this.ruleToView(detail.ruleItems, rs);
    },
    ruleToView (detail, rs) {
      let v = this;
      if (detail && detail.length) {
        detail.forEach(i => {
          rs.forEach(j => {
            if (i.ruleCode === j.id) {
              j._check = true;
              if (RULE_HAS_CHECKBOX[j.id]) {
                // 需要处理checkbox
                j.items.forEach(k => {
                  i.ruleItemParams.forEach(p => {
                    if (k.name === p.name) {
                      j.values[k.name] = p.value;
                      if (p.value !== null) {
                        for (let key in RULE_HAS_CHECKBOX[j.id]) {
                          if (RULE_HAS_CHECKBOX[j.id][key].includes(k.name)) {
                            j[key] = true;
                          }
                        }
                      }
                    }
                  });
                });
              } else {
                j.items.forEach(k => {
                  i.ruleItemParams.forEach(p => {
                    if (k.name === p.name) {
                      j.values[k.name] = p.value;
                    }
                  });
                });
              }
              v.specialToView(i);
            }
          });
        });
      }
      this.rules = rs;
    },
    /**
     * 获取规则
     * @date: 2021/10/9 11:47
     * @param  ruleId 规则id
     */
    getRuleDetails (ruleId) {
      let v = this;
      let apiUrl = null;
      switch (v.ruleType) {
        case 'smart':
          apiUrl = api.get_carrierAutoRule;
          break;
      }
      if (!apiUrl) return;
      v.axios.get(apiUrl + v.ruleId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let rs = v.initRuleData(data);
          v.dataToView(data, rs);
        }
      });
    },
    /**
     * 初始化规则数据
     * */
    initRuleData (data) {
      return data.rules.map(i => {
        i._check = false; // 是否选中
        i._checkStatus = true;
        i._prefixText = i.display.replace(/<span.*<\/span>/g, '');
        i.checkbox1 = false;
        i.checkbox2 = false;
        i.checkbox3 = false;
        i.checkbox4 = false;
        if (RULE_TYPE_IS.includes(i.id)) i._ruleType = 'IS';
        if (RULE_TYPE_INPUT.includes(i.id)) i._ruleType = 'INPUT';
        i._guidanceText = i.display.replace(/.*>(.*)<.*/g, '$1'); // 帮助文字;
        i.values = {};
        i._status = {};
        i.items = i.items.map(j => {
          i.values[j.name] = null;
          i._status[j.name] = false;
          j.value = null;
          j._disabled = false;
          j._isOperation = false; // 规则项操作状态
          return j;
        });
        return i;
      });
    },
    /**
     * 改变编辑状态
     * 一个条件有多个对象的时候建议使用name
     * @date: 2021/10/11 17:25
     */
    editOperation (index, ruleIndex, name) {
      if (name) {
        this.rules[index].items.forEach((i, rIndex) => {
          if (i.name === name) {
            this.$set(this.rules[index]._status, name, true);
          }
        });
      } else {
        this.$set(this.rules[index].items[ruleIndex], '_isOperation', true);
      }
    },
    /**
     * 数据清空
     * @date: 2021/10/9 11:56
     */
    resetRuleData () {
      return new Promise(resolve => {
        resolve();
      });
    },

    open (ruleAction) {
      let v = this;
      v.ruleAction = ruleAction || {};
      v.ruleId = v.ruleAction.autoRuleId || 'null';
      async function openInit () {
        await v.resetRuleData();
        await v.getRuleDetails(v.ruleId);
      }
      openInit();
      this.modal1 = true;
    }

  },
  components: {
    ruleTempAbnormal
  }
};
</script>

<style>
.reset-form .ivu-form-item {
  margin-bottom: 16px;
}
</style>
<style scoped>
.wid-70 {
  width: 70px;
}
.wid-150 {
  width: 150px;
}
.groupTitle {
  font-size: 14px;
  font-weight: bold;
}
.modalItemContent {
  padding: 10px;
}
.edit-style {
  margin-left: 5px;
  cursor: pointer;
  color: #0054a6;
}
.modalItemContent .error {
  color: #ff0000;
}
</style>
