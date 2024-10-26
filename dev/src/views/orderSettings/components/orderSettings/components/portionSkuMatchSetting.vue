<style scoped>
.footer {
  display: flex;
  padding: 15px;
  justify-content: flex-end;
  background: rgba(22, 155, 213, 1);
}

.list {
  border: 1px solid #dcdee2;
  border-radius: 6px;
}

.list .list-item {
  padding: 12px 24px;
  border-bottom: 1px solid #e8eaec;
}

.list .list-item:last-child {
  border-bottom: none;
}
</style>
<template>
  <div>
    <!-- 平台tab栏 -->
    <Tabs
        :value="platformId" @on-click="platformChangeFn" >
      <TabPane
          v-for="(item, index) in platforms" :key="index" :label="item.platformId" :name="item.platformId" ></TabPane >
    </Tabs >
    <template >
      <div class="normalTop" >
        <!-- 平台设置选择 -->
        <Row >
          <Col span="2" >
            <div class="normalFontSizeOneSize fontBold" >平台设置:</div >
          </Col >
          <Col span="20" >
            <RadioGroup v-model="platformStatus" >
              <Radio
                  label="0" class="mr20" >关闭
              </Radio >
              <Radio
                  label="1" class="mr20" >开启
              </Radio >
            </RadioGroup >
          </Col >
        </Row >
        <!-- 混淆设置选择 -->
        <Row class="normalTop20" >
          <Col span="2" >
            <div class="normalFontSizeOneSize fontBold" >混淆设置:</div >
          </Col >
          <Col span="20" >
            <RadioGroup
                v-model="platformSetting.settingPattern" @on-change="settingPatternChangeFn" >
              <Radio
                  :label="1" class="mr20" :disabled="platformStatus == 0" >按平台设置
              </Radio >
              <Radio
                  :label="2" class="mr20" :disabled="platformStatus == 0" >按店铺设置
              </Radio >
            </RadioGroup >
          </Col >
        </Row >
        <!-- 按平台设置 -->
        <template v-if="platformSetting.settingPattern === 1" >
          <!-- 截取规则 -->
          <div class="normalTop20" >
            <Row >
              <Col span="4" >
                <Checkbox
                    v-model="platformSetting.matchOriginalSku" :disabled="platformStatus == 0" >优先匹配原始SKU
                </Checkbox >
              </Col >
              <Col span="20" >
                <div class="red" >说明：</div >
                <div class="red" >1.勾选时，用原始SKU匹配成功则不会再用截取后的SKU进行匹配；</div >
                <div class="red" >2.不勾选，系统只会用截取后的SKU进行匹配，匹配失败的订单进入“未匹配商品”</div >
              </Col >
            </Row >
          </div >
          <div class="normalFontSizeOneSize normalTop20 fontBold" >截取规则-按平台设置</div >
          <div class="normalTop" >
            <RadioGroup v-model="platformSetting.splitPattern" >
              <Radio
                  :label="1" class="mr20" :disabled="platformStatus != 1" >截取起始符与结束符之间的字符
              </Radio >
              <Radio
                  :label="2" class="mr20" :disabled="platformStatus != 1" >截取从固定位置起止的字符
              </Radio >
            </RadioGroup >
          </div >
          <!-- 截取起始符与结束符之间的字符 -->
          <div
              class v-if="platformSetting.splitPattern === 1" >
            <Row class="normalTop20" >
              <Col span="18" >
                <div class="list" >
                  <div class="list-item" >
                    <Row
                        type="flex" align="middle" >
                      <Col span="4" >SKU起始符</Col >
                      <Col span="12" >
                        <dyt-select
                            v-model="platformSetting.skuStart"
                            multiple
                            @on-open-change="selectStartOpenChangeFn"
                            :disabled="platformStatus != 1" > <Option
                            v-for="item in platformInterceptStartArr"
                            :value="item.idx"
                            :key="item.idx"
                            :disabled="item.disabled" >{{ item.charDesc }}</Option> </dyt-select >
                      </Col >
                    </Row >
                  </div >
                  <div class="list-item" >
                    <Row
                        type="flex" align="middle" >
                      <Col span="4" >SKU结束符</Col >
                      <Col span="12" >
                        <dyt-select
                            v-model="platformSetting.skuEnd"
                            multiple
                            @on-open-change="selectEndOpenChangeFn"
                            :disabled="platformStatus != 1" > <Option
                            v-for="item in platformInterceptEndArr"
                            :value="item.idx"
                            :key="item.idx"
                            :disabled="item.disabled" >{{ item.charDesc }}</Option> </dyt-select >
                      </Col >
                    </Row >
                  </div >
                  <div class="list-item" >
                    <Row
                        type="flex" align="middle" >
                      <Col span="4" >异常处理</Col >
                      <Col span="20" >
                        <div >
                          <span >找到多个起始符时，以字符串中</span > <dyt-select
                            v-model="platformSetting.validStart"
                            style="width: 100px; margin: 0 10px;"
                            :disabled="platformStatus != 1" > <Option
                            v-for="item in validArr" :value="item.value" :key="item.value" >{{ item.label }}</Option>
                        </dyt-select > <span >的起始符作为有效起始符</span >
                        </div >
                        <div class="normalTop" >
                          <span >找到多个结束符时，以字符串中</span > <dyt-select
                            v-model="platformSetting.validEnd"
                            style="width: 100px; margin: 0 10px;"
                            :disabled="platformStatus != 1" > <Option
                            v-for="item in validArr" :value="item.value" :key="item.value" >{{ item.label }}</Option>
                        </dyt-select > <span >的结束符作为有效结束符</span >
                        </div >
                        <div class="normalTop" >
                          <span >找到多个结束符时，以字符串中</span > <dyt-select
                            v-model="platformSetting.endLeftStart"
                            style="width: 160px; margin: 0 10px;"
                            :disabled="platformStatus != 1" > <Option
                            v-for="item in endLeftStartArr"
                            :value="item.value"
                            :key="item.value" >{{ item.label }}</Option> </dyt-select > <span >的结束符作为有效结束符</span >
                        </div >
                      </Col >
                    </Row >
                  </div >
                </div >
              </Col >
            </Row >
          </div >
          <!-- 截取从固定位置起止的字符 -->
          <div
              class v-if="platformSetting.splitPattern === 2" >
            <Row class="normalTop20" >
              <Col span="18" >
                <div class="list" >
                  <RadioGroup
                      v-model="splitType" vertical @on-change="splitTypeChangeFn" style="width: 100%" >
                    <div class="list-item" >
                      <Row
                          type="flex" align="middle" >
                        <Col span="4" >
                          <Radio
                              label="forward" :disabled="platformStatus != 1" >向前截取
                          </Radio >
                        </Col >
                        <Col span="20" >
                          <span >从第1位截取到第</span >
                          <InputNumber
                              v-model="platformSetting.forwardIndex"
                              :disabled="splitType !== 'forward' || platformStatus != 1"
                              @on-change="forwardIndexFn"
                              :step="1"
                              :min="1"
                              style="width: 80px; margin: 0 10px;" ></InputNumber >
                          <span >位（包含起止位置字符本身）</span >
                        </Col >
                      </Row >
                    </div >
                    <div class="list-item" >
                      <Row
                          type="flex" align="middle" >
                        <Col span="4" >
                          <Radio
                              label="middle" :disabled="platformStatus != 1" >中间截取
                          </Radio >
                        </Col >
                        <Col span="20" >
                          <span >从第</span >
                          <InputNumber
                              v-model="platformSetting.middleStartIndex"
                              :disabled="splitType !== 'middle' || platformStatus != 1"
                              @on-change="middleStartIndexFn"
                              :step="1"
                              :min="1"
                              style="width: 80px; margin: 0 10px;" ></InputNumber >
                          <span >位截取到第</span >
                          <InputNumber
                              v-model="platformSetting.middleEndIndex"
                              :disabled="splitType !== 'middle' || platformStatus != 1"
                              @on-change="middleEndIndexFn"
                              :step="1"
                              :min="1"
                              style="width: 80px; margin: 0 10px;" ></InputNumber >
                          <span >位（包含起止位置字符本身）</span >
                        </Col >
                      </Row >
                    </div >
                    <div class="list-item" >
                      <Row
                          type="flex" align="middle" >
                        <Col span="4" >
                          <Radio
                              label="backward" :disabled="platformStatus != 1" >向后截取
                          </Radio >
                        </Col >
                        <Col span="20" >
                          <span >从第</span >
                          <InputNumber
                              v-model="platformSetting.backwardIndex"
                              :disabled="splitType !== 'backward' || platformStatus != 1"
                              @on-change="backwardIndexFn"
                              :step="1"
                              :min="1"
                              style="width: 80px; margin: 0 10px;" ></InputNumber >
                          <span >位截取到最后一位（包含起止位置字符本身）</span >
                        </Col >
                      </Row >
                    </div >
                  </RadioGroup >
                </div >
              </Col >
            </Row >
          </div >
          <!-- 截取测试 -->
          <div class="normalFontSizeOneSize normalTop20 fontBold" >Custom Label/SKU截取测试</div >
          <div class="normalTop" >填入需要截取的Custom Label,点击截取,系统将根据您本页面的设置给出截取的结果。</div >
          <Row class="normalTop" >
            <Col span="18" >
              <div class="list" >
                <div class="list-item" >
                  <Row
                      type="flex" align="middle" >
                    <Col span="4" >需要截取的SKU</Col >
                    <Col span="8" >
                      <Input v-model="sku" />
                    </Col >
                    <Col
                        span="4" offset="1" >
                      <Button
                          type="primary" :disabled="platformStatus != 1" @click="splitSkuFn" >截取 </Button >
                    </Col >
                  </Row >
                </div >
                <div class="list-item" >
                  <Row
                      type="flex" align="middle" >
                    <Col span="4" >截取结果</Col >
                    <Col span="8" >
                      <Input
                          v-model="splitSku" :disabled="platformStatus != 1" />
                    </Col >
                  </Row >
                </div >
              </div >
            </Col >
          </Row >
        </template >
        <!-- 按店铺设置 -->
        <template v-if="platformSetting.settingPattern === 2" >
          <!-- 截取规则 -->
          <div class="normalFontSizeOneSize normalTop20 fontBold" >截取规则-按店铺设置</div >
          <div class="normalTop20" >
            <Button
                type="primary" :disabled="platformStatus != 1" @click="batchSetup" >批量设置 </Button >
            <Button
                style="marginLeft: 10px;"
                type="primary"
                :disabled="platformStatus != 1"
                @click="batchShutdown" >批量停用 </Button >
          </div >
          <div
              class="normalTop20" style="min-height: 400px;" >
            <Table
                border :columns="columns" :data="shopDataCache" @on-selection-change="shopSelectChange" ></Table >
          </div >
        </template >
      </div >
    </template >
    <!-- 保存 -->
    <div class="footer" >
      <Button
          @click="skuMatchSettingSaveFn" :disabled="!getPermission('skuMatchSetting_create')" >保存 </Button >
    </div >
    <template v-if="showModal" >
      <shopSkuSetting
          @refresh="refresh"
          @closeModal="closeModal"
          :isBatchSetup="isBatchSetup"
          :platformId="platformId"
          :platformStatus="platformStatus"
          :saleAccountIds="saleAccountIds"
          :show="showModal"
          :shopSkuSetting="shopSkuSetting"
          :interceptArr="defaultInterceptArr" ></shopSkuSetting >
    </template >
  </div >
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import shopSkuSetting from './shopSkuSetting';

export default {
  mixins: [Mixin],
  components: {
    shopSkuSetting
  },
  props: {
    platforms: {
      type: Array,
      default: () => []
    }
  },
  data () {
    let v = this;
    return {
      matchType: 'PORTION', // 未开启:DISABLE, 全平台店铺生效:ALL, 部分平台/店铺生效:PORTION ,
      platformId: this.platforms[0].platformId || '', // 平台id
      platformStatus: this.platforms[0].platformStatus || '0', // 平台状态
      sku: '',
      splitSku: '',
      showModal: false,
      isBatchSetup: false, // 是否是批量设置
      selectShop: [], // 选择的店铺数据
      shopSkuSetting: {},
      platformSetting: {
        // 平台设置
        matchOriginalSku: false, // 优先匹配原始sku 0否 1是
        splitPattern: 1, // 截取方式 1截取起始符与结束符之间的字符 2截取从固定位置起止的字符
        skuStart: [], // sku起始符，可多选
        skuEnd: [], // sku结束符，可多选
        validStart: 'L', // 找到多个起始符时，以字符串中 L最左侧 R最右侧 的起始符作为有效起始符
        validEnd: 'R', // 找到多个结束符时，以字符串中 L最左侧 R最右侧 的结束符作为有效结束符 ,
        endLeftStart: 'R', // 结束符在起始符左侧时，以 R最右侧的起始符右侧 L最左侧的结束符左侧 的字符串作为有效SKU
        splitForward: 1, // 向前截取 0否 1是 默认是向前截取
        splitMiddle: 0, // 中间截取 0否 1是
        splitBackward: 0, // 向后截取 0否 1是
        forwardIndex: 1, // 向前截取 从第1位截取到第forwardIndex位(包含起止位置字符本身)
        middleStartIndex: 1, // 中间截取 从第middleStartIndex位开始
        middleEndIndex: 1, // 中间截取 截取到第middleEndIndex位(包含起止位置字符本身)
        backwardIndex: 1, // 向后截取 从第backwardIndex位截取到最后一位(包含起止位置字符本身)
        saleAccountId: '', // 平台店铺id，全平台没有这个参数，部分平台/店铺生效
        settingPattern: 1, // 混淆设置：1按平台设置 2按店铺设置, 部分平台/店铺生效
        skuMatchSettingId: 0, // sku匹配设置流水号，部分平台/店铺生效
        status: 0 // 状态0关闭 1启用，部分平台/店铺生效
      },
      defaultInterceptArr: [], // 可选截取字符串
      platformInterceptStartArr: [],
      platformInterceptEndArr: [],
      validArr: [
        {
          value: 'L',
          label: '最左侧'
        }, {
          value: 'R',
          label: '最右侧'
        }
      ],
      endLeftStartArr: [
        {
          value: 'L',
          label: '最左侧的结束符左侧'
        }, {
          value: 'R',
          label: '最右侧的起始符右侧'
        }
      ],
      splitType: 'forward', // 截取方式 forward middle backward
      shopData: [],
      skuMatchSettingIds: [],
      saleAccountIds: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: '操作',
          key: 'operate',
          align: 'center',
          width: 160,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  size: 'small',
                  // eslint-disable-next-line eqeqeq
                  disabled: v.platformStatus != 1
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    v.editShopSetting(params.row);
                  }
                }
              }, '编辑' // 编辑
              ), params.row.status === 1 ? h('Button', {
                props: {
                  size: 'small',
                  // eslint-disable-next-line eqeqeq
                  disabled: v.platformStatus != 1
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    v.disableSetting(params.row);
                  }
                }
              }, '停用' // 停用
              ) : h('Button', {
                props: {
                  size: 'small',
                  // eslint-disable-next-line eqeqeq
                  disabled: v.platformStatus != 1
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    v.enableSetting(params.row);
                  }
                }
              }, '启用' // 启用
              )
            ]);
          }
        }, {
          title: '平台', // 平台
          key: 'platformId',
          align: 'center'
        }, {
          title: '代号', // 店铺代号
          key: 'accountCode',
          align: 'center'
        }, {
          title: '账户名', // 账号
          key: 'account',
          align: 'center'
        }, {
          title: '状态', // 状态
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return params.row.status === 1 ? h('span', {
              style: {
                color: '#3cb034'
              }
            }, '启用') : h('span', {
              style: {
                color: '#de2910'
              }
            }, '未启用');
          }
        }
      ]
    };
  },
  created () {
    this.getPlatformSkuMatchSetting(this.platformId);
    this.getSplitChars();
  },
  activated () {
  },
  updated () {
  },
  mounted () {
  },
  computed: {
    shopDataCache () {
      return this.shopData.filter(i => i.platformId !== i.saleAccountId);
    }
  },
  watch: {},
  methods: {
    getPlatformSkuMatchSetting (platformId) {
      // 按平台ID查询平台sku匹配设置 后面带参数
      let v = this;
      if (platformId) {
        v.axios.get(api.get_platformSkuMatchSetting + '/' + platformId).then(res => {
          if (res.data.code === 0) {
            let arr = res.data.datas;
            v.shopData = v.deepCopy(arr);
            this.presetPlatformSetting(arr);
          }
        });
      }
    }, // 赋值 platformSetting
    presetPlatformSetting (arr) {
      let v = this;
      if (arr && arr.length > 0) {
        // eslint-disable-next-line eqeqeq
        v.platformSetting.matchOriginalSku = arr[0].matchOriginalSku == 1;
        v.platformSetting.splitPattern = arr[0].splitPattern || 1;
        v.platformSetting.skuStart = arr[0].skuStart ? arr[0].skuStart.split(',').map(Number) : [];
        v.platformSetting.skuEnd = arr[0].skuEnd ? arr[0].skuEnd.split(',').map(Number) : [];
        v.platformSetting.validStart = arr[0].validStart || 'L';
        v.platformSetting.validEnd = arr[0].validEnd || 'R';
        v.platformSetting.endLeftStart = arr[0].endLeftStart || 'R';
        v.platformSetting.splitForward = arr[0].splitForward || 1;
        v.platformSetting.splitMiddle = arr[0].splitMiddle || 0;
        v.platformSetting.splitBackward = arr[0].splitBackward || 0;
        v.splitType = arr[0].splitForward === 1 ? 'forward' : arr[0].splitMiddle === 1
                                                              ? 'middle'
                                                              : arr[0].splitBackward === 1 ? 'backward' : 'forward';
        v.platformSetting.forwardIndex = arr[0].forwardIndex || 1;
        v.platformSetting.middleStartIndex = arr[0].middleStartIndex || 1;
        v.platformSetting.middleEndIndex = arr[0].middleEndIndex || 1;
        v.platformSetting.backwardIndex = arr[0].backwardIndex || 1;
        v.platformSetting.saleAccountId = arr[0].saleAccountId;
        v.platformSetting.settingPattern = v.platforms.filter(i => {
          if (i.platformId === arr[0].platformId) {
            return i;
          }
        })[0].settingPattern;
        v.platformSetting.skuMatchSettingId = arr[0].skuMatchSettingId || '';
        v.platformSetting.status = arr[0].status;
      } else {
        v.platformSetting.matchOriginalSku = false;
        v.platformSetting.splitPattern = 1;
        v.platformSetting.skuStart = [];
        v.platformSetting.skuEnd = [];
        v.platformSetting.validStart = 'L';
        v.platformSetting.validEnd = 'R';
        v.platformSetting.endLeftStart = 'R';
        v.platformSetting.splitForward = 1;
        v.platformSetting.splitMiddle = 0;
        v.platformSetting.splitBackward = 0;
        v.splitType = 'forward';
        v.platformSetting.forwardIndex = 1;
        v.platformSetting.middleStartIndex = 1;
        v.platformSetting.middleEndIndex = 1;
        v.platformSetting.backwardIndex = 1;
        v.platformSetting.saleAccountId = '';
        v.platformSetting.settingPattern = 1;
        v.platformSetting.skuMatchSettingId = '';
        v.platformSetting.status = 0;
      }
    }, // 获取截取符号列表
    getSplitChars () {
      let v = this;
      v.axios.get(api.get_splitChars).then(res => {
        if (res.data.code === 0) {
          let arr = res.data.datas;
          arr.forEach(item => {
            item.disabled = false;
          });
          v.defaultInterceptArr = v.deepCopy(arr);
          v.platformInterceptStartArr = v.deepCopy(arr);
          v.platformInterceptEndArr = v.deepCopy(arr);
        }
      });
    },
    getSkuMatchSetting (name) {
      // 查询平台sku匹配设置 未开启 全平台/店铺生效  部分生效
      let v = this;
      v.axios.get(api.get_skuMatchSetting).then(res => {
        let arr = res.data.datas.platformSettings.filter(item => {
          return item.platformId === name;
        });
        v.platformStatus = arr[0].platformStatus || '0';
      });
    }, // 选择平台
    platformChangeFn (name) {
      let v = this;
      v.skuMatchSettingIds = [];
      v.saleAccountIds = [];
      v.selectShop = [];
      v.platformId = name;
      v.getSkuMatchSetting(name);
      v.$emit('getSkuMatchSetting');
      v.getPlatformSkuMatchSetting(name);
    }, // 选择混淆设置
    settingPatternChangeFn () {
      let v = this;
      v.skuMatchSettingIds = [];
      v.saleAccountIds = [];
      v.selectShop = [];
    },
    selectStartOpenChangeFn (value) {
      if (value) {
        this.resetInterceptStartArr();
      }
    },
    selectEndOpenChangeFn (value) {
      if (value) {
        this.resetInterceptEndArr();
      }
    },
    resetInterceptStartArr () {
      // 格式化 可选的SKU截取起始符
      let v = this;
      v.platformInterceptStartArr.forEach(item => {
        if (v.platformSetting.skuEnd.indexOf(item.idx) > -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    },
    resetInterceptEndArr () {
      // 格式化 可选的SKU截取结束符
      let v = this;
      v.platformInterceptEndArr.forEach(item => {
        if (v.platformSetting.skuStart.indexOf(item.idx) > -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    },
    splitTypeChangeFn (value) {
      // 选择 截取方式
      let v = this;
      switch (value) {
        case 'forward': // 向前截取
          v.platformSetting.splitForward = 1;
          v.platformSetting.splitMiddle = 0;
          v.platformSetting.splitBackward = 0;
          v.platformSetting.middleStartIndex = 1;
          v.platformSetting.middleEndIndex = 1;
          v.platformSetting.backwardIndex = 1;
          break;
        case 'middle': // 中间截取
          v.platformSetting.splitForward = 0;
          v.platformSetting.splitMiddle = 1;
          v.platformSetting.splitBackward = 0;
          v.platformSetting.forwardIndex = 1;
          v.platformSetting.backwardIndex = 1;
          break;
        case 'backward': // 向后截取
          v.platformSetting.splitForward = 0;
          v.platformSetting.splitMiddle = 0;
          v.platformSetting.splitBackward = 1;
          v.platformSetting.forwardIndex = 1;
          v.platformSetting.middleStartIndex = 1;
          v.platformSetting.middleEndIndex = 1;
          break;
      }
    },
    forwardIndexFn (value) {
      if (value === null) {
        this.platformSetting.forwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.platformSetting.forwardIndex = num;
      }
    },
    middleStartIndexFn (value) {
      if (value === null) {
        this.platformSetting.middleStartIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.platformSetting.middleStartIndex = num;
      }
    },
    middleEndIndexFn (value) {
      if (value === null) {
        this.platformSetting.middleEndIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.platformSetting.middleEndIndex = num;
      }
    },
    backwardIndexFn (value) {
      if (value === null) {
        this.platformSetting.backwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.platformSetting.backwardIndex = num;
      }
    }, // 批量设置
    batchSetup () {
      let v = this;
      if (v.saleAccountIds.length === 0) {
        v.$Message.error('请先选择店铺');
        return false;
      }
      v.shopSkuSetting = {};
      v.showModal = true;
      v.isBatchSetup = true;
    },
    // 批量停用
    batchShutdown () {
      if (this.selectShop.length === 0) {
        this.$Message.error('请先选择店铺');
        return false;
      }
      let hasShutdownItem = false;
      this.selectShop.forEach(item => {
        // eslint-disable-next-line eqeqeq
        if (item.status == 0) {
          hasShutdownItem = true; // 有停用的
        }
      });
      if (hasShutdownItem) {
        this.$Message.error('请选择已启用的店铺进行批量停用！');
        return false;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认停用选中的规则？`,
        onOk: () => {
          this.axios.put(api.batchDisable, this.skuMatchSettingIds).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('停用成功');
              this.getPlatformSkuMatchSetting(this.platformId);
            }
          });
        }
      });
    }, // 选择店铺
    shopSelectChange (val) {
      let v = this;
      v.selectShop = val;
      let skuMatchIdArr = [];
      let saleAccountIdArr = [];
      if (val.length) {
        val.forEach((n, i) => {
          skuMatchIdArr.push(n.skuMatchSettingId);
          saleAccountIdArr.push(n.saleAccountId);
        });
        v.skuMatchSettingIds = skuMatchIdArr;
        v.saleAccountIds = saleAccountIdArr;
      } else {
        v.skuMatchSettingIds = [];
        v.saleAccountIds = [];
      }
    }, // 编辑
    editShopSetting (data) {
      let v = this;
      let id = data.skuMatchSettingId;
      let saleId = data.saleAccountId;
      v.axios.get(api.shopSkuSetting + '/' + id).then(res => {
        if (res.data.code === 0) {
          let obj = res.data.datas || { 'saleAccountId': saleId };
          v.shopSkuSetting = obj;
          v.showModal = true;
          v.isBatchSetup = false;
        }
      });
    }, //
    closeModal () {
      this.shopSkuSetting = {};
      this.showModal = false;
    }, // 停用
    disableSetting (row) {
      const id = row.skuMatchSettingId;
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认停用`,
        onOk: () => {
          this.axios.put(api.disableSetting + '/' + id).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('停用成功');
              this.getPlatformSkuMatchSetting(this.platformId);
            }
          });
        }
      });
    }, // 启用
    enableSetting (row) {
      // 就是没有设置过的店铺是没有这个ID，要启用的话就要先编辑
      const id = row.skuMatchSettingId;
      if (!id) {
        this.$Message.warning({
          content: '请先编辑！',
          duration: 3
        });
        return;
      }
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认启用`,
        onOk: () => {
          this.axios.put(api.enableSetting + '/' + id).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('启用成功');
              this.getPlatformSkuMatchSetting(this.platformId);
            }
          });
        }
      });
    },

    checkSplitSkuRule () {
      let v = this;
      // 截取起始符与结束符之间的字符时，起始和截止符不能全部为空
      if (v.platformSetting.splitPattern === 1 && v.platformSetting.skuStart.length === 0 && v.platformSetting.skuEnd.length === 0) {
        v.$Message.warning({
          content: 'sku起始和截止符不能全部为空',
          duration: 3
        });
        return false;
      }
      // 截取从固定位置起止的字符 中间截取时起始位要小于截止位
      if (v.platformSetting.splitPattern === 2 && v.splitType === 'middle' && v.platformSetting.middleStartIndex > v.platformSetting.middleEndIndex) {
        v.$Message.warning({
          content: '中间截取的起始位不能大于结束位',
          duration: 3
        });
        return false;
      }
      return true;
    }, // 获取截取结果
    splitSkuFn () {
      let v = this;
      if (v.sku.length === 0) {
        // 待截取的sku不能为空
        v.$Message.warning({
          content: '需要截取的SKU不能为空',
          duration: 3
        });
        return;
      }
      if (!v.checkSplitSkuRule()) {
        // 不通过截取规则
        return;
      }
      // 要组装参数
      let paramsObj = v.deepCopy(v.platformSetting);
      paramsObj.sku = v.sku;
      paramsObj.matchOriginalSku = paramsObj.matchOriginalSku === true ? 1 : 0;
      paramsObj.skuStart = paramsObj.skuStart.join(',');
      paramsObj.skuEnd = paramsObj.skuEnd.join(',');
      v.axios.post(api.splitSku, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.splitSku = res.data.datas.sku;
        }
      });
    }, // 保存
    skuMatchSettingSaveFn () {
      let v = this;
      if (!v.checkSplitSkuRule()) {
        // 不通过截取规则
        return;
      }
      // 要组装参数
      let paramsObj = {};
      paramsObj.skuMatchPlatformSettingBo = {};
      paramsObj.skuMatchPlatformSettingBo.matchType = v.matchType;
      paramsObj.skuMatchPlatformSettingBo.platformId = v.platformId;
      paramsObj.skuMatchPlatformSettingBo.platformStatus = v.platformStatus;
      paramsObj.skuMatchPlatformSettingBo.settingPattern = v.platformSetting.settingPattern;
      // paramsObj.skuMatchPlatformSettingBo.platformSettings = [];
      // let obj = {};
      // obj.platformId = v.platformId;
      // obj.platformStatus = v.platformStatus;
      // paramsObj.skuMatchPlatformSettingBo.platformSettings.push(obj);
      paramsObj.skuMatchSettings = [];
      let matchSettings = v.deepCopy(v.platformSetting);
      matchSettings.matchOriginalSku = matchSettings.matchOriginalSku === true ? 1 : 0;
      matchSettings.skuStart = matchSettings.skuStart.join(',');
      matchSettings.skuEnd = matchSettings.skuEnd.join(',');
      paramsObj.skuMatchSettings.push(matchSettings);
      v.axios.post(api.skuMatchSettingSave, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
        }
      });
    }, // 刷新
    refresh () {
      this.getPlatformSkuMatchSetting(this.platformId);
    }
  }
};
</script >
