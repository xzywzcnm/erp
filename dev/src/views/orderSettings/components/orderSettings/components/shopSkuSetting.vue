<style scoped >
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
</style >
<template >
  <div >
    <!-- 编辑混淆规则 弹窗 -->
    <Modal
        title="编辑混淆规则"
        width="900"
        :value="showModal"
        @on-visible-change="modalVisibleChangeFn"
        @on-ok="shopSettingOk"
        :loading="loading" >
      <!-- 截取规则 -->
      <div class="normalTop20" >
        <Row >
          <Col span="4" >
            <Checkbox v-model="shopSetting.matchOriginalSku" >优先匹配原始SKU</Checkbox >
          </Col >
          <Col span="20" >
            <div class="red" >说明：</div >
            <div class="red" >1.勾选时，用原始SKU匹配成功则不会再用截取后的SKU进行匹配；</div >
            <div class="red" >2.不勾选，系统只会用截取后的SKU进行匹配，匹配失败的订单进入“未匹配商品”</div >
          </Col >
        </Row >
      </div >
      <div class="normalTop" >
        <RadioGroup v-model="shopSetting.splitPattern" >
          <Radio
              :label="1" class="mr20" >截取起始符与结束符之间的字符
          </Radio >
          <Radio
              :label="2" class="mr20" >截取从固定位置起止的字符
          </Radio >
        </RadioGroup >
      </div >
      <!-- 截取起始符与结束符之间的字符 -->
      <div
          class v-if="shopSetting.splitPattern === 1" >
        <Row class="normalTop20" >
          <Col span="18" >
            <div class="list" >
              <div class="list-item" >
                <Row
                    type="flex" align="middle" >
                  <Col span="4" >SKU起始符</Col >
                  <Col span="12" >
                    <dyt-select
                        v-model="shopSetting.skuStart" multiple @on-open-change="selectStartOpenChangeFn" > <Option
                        v-for="item in interceptStartArr"
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
                        v-model="shopSetting.skuEnd" multiple @on-open-change="selectEndOpenChangeFn" > <Option
                        v-for="item in interceptEndArr"
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
                        v-model="shopSetting.validStart" style="width: 100px; margin: 0 10px;" > <Option
                        v-for="item in validArr" :value="item.value" :key="item.value" >{{ item.label }}</Option>
                    </dyt-select > <span >的起始符作为有效起始符</span >
                    </div >
                    <div class="normalTop" >
                      <span >找到多个结束符时，以字符串中</span > <dyt-select
                        v-model="shopSetting.validEnd" style="width: 100px; margin: 0 10px;" > <Option
                        v-for="item in validArr" :value="item.value" :key="item.value" >{{ item.label }}</Option>
                    </dyt-select > <span >的结束符作为有效结束符</span >
                    </div >
                    <div class="normalTop" >
                      <span >找到多个结束符时，以字符串中</span > <dyt-select
                        v-model="shopSetting.endLeftStart" style="width: 160px; margin: 0 10px;" > <Option
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
          class v-if="shopSetting.splitPattern === 2" >
        <Row class="normalTop20" >
          <Col span="18" >
            <div class="list" >
              <RadioGroup
                  v-model="splitType" vertical @on-change="splitTypeChangeFn" style="width: 100%" >
                <div class="list-item" >
                  <Row
                      type="flex" align="middle" >
                    <Col span="4" >
                      <Radio label="forward" >向前截取</Radio >
                    </Col >
                    <Col span="20" >
                      <span >从第1位截取到第</span >
                      <InputNumber
                          v-model="shopSetting.forwardIndex"
                          :disabled="splitType !== 'forward'"
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
                      <Radio label="middle" >中间截取</Radio >
                    </Col >
                    <Col span="20" >
                      <span >从第</span >
                      <InputNumber
                          v-model="shopSetting.middleStartIndex"
                          :disabled="splitType !== 'middle'"
                          @on-change="middleStartIndexFn"
                          :step="1"
                          :min="1"
                          style="width: 80px; margin: 0 10px;" ></InputNumber >
                      <span >位截取到第</span >
                      <InputNumber
                          v-model="shopSetting.middleEndIndex"
                          :disabled="splitType !== 'middle'"
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
                      <Radio label="backward" >向后截取</Radio >
                    </Col >
                    <Col span="20" >
                      <span >从第</span >
                      <InputNumber
                          v-model="shopSetting.backwardIndex"
                          :disabled="splitType !== 'backward'"
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
                      type="primary" @click="splitSkuFn" >截取 </Button >
                </Col >
              </Row >
            </div >
            <div class="list-item" >
              <Row
                  type="flex" align="middle" >
                <Col span="4" >截取结果</Col >
                <Col span="8" >
                  <Input v-model="splitSku" />
                </Col >
              </Row >
            </div >
          </div >
        </Col >
      </Row >
    </Modal >
  </div >
</template >

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    platformId: { // 平台id
      type: String
    },
    platformStatus: { // 平台状态
      type: String
    },
    isBatchSetup: { // 是否是批量设置
      type: Boolean
    },
    saleAccountIds: { //
      type: Array,
      default: () => []
    },
    show: {
      type: Boolean,
      default: false
    },
    interceptArr: {
      type: Array,
      default: () => []
    },
    shopSkuSetting: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data () {
    let v = this;
    return {
      matchType: 'PORTION', // 未开启:DISABLE, 全平台店铺生效:ALL, 部分平台/店铺生效:PORTION ,
      showModal: v.show,
      loading: true,
      sku: '',
      splitSku: '',
      shopSetting: {
        // 店铺设置
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
        settingPattern: 2, // 1按平台设置 2按店铺设置, 部分平台/店铺生效
        skuMatchSettingId: 0, // sku匹配设置流水号，部分平台/店铺生效
        status: 0 // 状态0关闭 1启用，部分平台/店铺生效
      },
      interceptStartArr: v.deepCopy(v.interceptArr), // 可截取起始符字符列表
      interceptEndArr: v.deepCopy(v.interceptArr), // 可截取结束符字符列表
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
      splitType: 'forward' // 截取方式 forward middle backward
    };
  },
  created () {
    this.presetShopSetting();
  },
  methods: {
    presetShopSetting () {
      let v = this;
      let arr = Object.keys(v.shopSkuSetting);
      if (arr.length > 0) {
        // eslint-disable-next-line eqeqeq
        v.shopSetting.matchOriginalSku = v.shopSkuSetting.matchOriginalSku == 1;
        v.shopSetting.splitPattern = v.shopSkuSetting.splitPattern || 1;
        v.shopSetting.skuStart = v.shopSkuSetting.skuStart ? v.shopSkuSetting.skuStart.split(',').map(Number) : [];
        v.shopSetting.skuEnd = v.shopSkuSetting.skuEnd ? v.shopSkuSetting.skuEnd.split(',').map(Number) : [];
        v.shopSetting.validStart = v.shopSkuSetting.validStart || 'L';
        v.shopSetting.validEnd = v.shopSkuSetting.validEnd || 'R';
        v.shopSetting.endLeftStart = v.shopSkuSetting.endLeftStart || 'R';
        v.shopSetting.splitForward = v.shopSkuSetting.splitForward || 1;
        v.shopSetting.splitMiddle = v.shopSkuSetting.splitMiddle || 0;
        v.shopSetting.splitBackward = v.shopSkuSetting.splitBackward || 0;
        v.splitType = v.shopSkuSetting.splitForward === 1 ? 'forward' : v.shopSkuSetting.splitMiddle === 1
                                                                        ? 'middle'
                                                                        : v.shopSkuSetting.splitBackward === 1
                                                                          ? 'backward'
                                                                          : 'forward';
        v.shopSetting.forwardIndex = v.shopSkuSetting.forwardIndex || 1;
        v.shopSetting.middleStartIndex = v.shopSkuSetting.middleStartIndex || 1;
        v.shopSetting.middleEndIndex = v.shopSkuSetting.middleEndIndex || 1;
        v.shopSetting.backwardIndex = v.shopSkuSetting.backwardIndex || 1;
        v.shopSetting.saleAccountId = v.shopSkuSetting.saleAccountId;
        v.shopSetting.settingPattern = v.shopSkuSetting.settingPattern || 2;
        v.shopSetting.skuMatchSettingId = v.shopSkuSetting.skuMatchSettingId || '';
        v.shopSetting.status = v.shopSkuSetting.status;
      } else {
        v.shopSetting.matchOriginalSku = false;
        v.shopSetting.splitPattern = 1;
        v.shopSetting.skuStart = [];
        v.shopSetting.skuEnd = [];
        v.shopSetting.validStart = 'L';
        v.shopSetting.validEnd = 'R';
        v.shopSetting.endLeftStart = 'R';
        v.shopSetting.splitForward = 1;
        v.shopSetting.splitMiddle = 0;
        v.shopSetting.splitBackward = 0;
        v.splitType = 'forward';
        v.shopSetting.forwardIndex = 1;
        v.shopSetting.middleStartIndex = 1;
        v.shopSetting.middleEndIndex = 1;
        v.shopSetting.backwardIndex = 1;
        v.shopSetting.saleAccountId = '';
        v.shopSetting.settingPattern = 2;
        v.shopSetting.skuMatchSettingId = '';
        v.shopSetting.status = 0;
      }
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
      v.interceptStartArr.forEach(item => {
        if (v.shopSetting.skuEnd.indexOf(item.idx) > -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    },
    resetInterceptEndArr () {
      // 格式化 可选的SKU截取结束符
      let v = this;
      v.interceptEndArr.forEach(item => {
        if (v.shopSetting.skuStart.indexOf(item.idx) > -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    }, // 选择 截取方式
    splitTypeChangeFn (value) {
      let v = this;
      switch (value) {
        case 'forward': // 向前截取
          v.shopSetting.splitForward = 1;
          v.shopSetting.splitMiddle = 0;
          v.shopSetting.splitBackward = 0;
          v.shopSetting.middleStartIndex = 1;
          v.shopSetting.middleEndIndex = 1;
          v.shopSetting.backwardIndex = 1;
          break;
        case 'middle': // 中间截取
          v.shopSetting.splitForward = 0;
          v.shopSetting.splitMiddle = 1;
          v.shopSetting.splitBackward = 0;
          v.shopSetting.forwardIndex = 1;
          v.shopSetting.backwardIndex = 1;
          break;
        case 'backward': // 向后截取
          v.shopSetting.splitForward = 0;
          v.shopSetting.splitMiddle = 0;
          v.shopSetting.splitBackward = 1;
          v.shopSetting.forwardIndex = 1;
          v.shopSetting.middleStartIndex = 1;
          v.shopSetting.middleEndIndex = 1;
          break;
      }
    },
    forwardIndexFn (value) {
      if (value === null) {
        this.shopSetting.forwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.shopSetting.forwardIndex = num;
      }
    },
    middleStartIndexFn (value) {
      if (value === null) {
        this.shopSetting.middleStartIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.shopSetting.middleStartIndex = num;
      }
    },
    middleEndIndexFn (value) {
      if (value === null) {
        this.shopSetting.middleEndIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.shopSetting.middleEndIndex = num;
      }
    },
    backwardIndexFn (value) {
      if (value === null) {
        this.shopSetting.backwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.shopSetting.backwardIndex = num;
      }
    }, // 弹窗开启/关闭 切换
    modalVisibleChangeFn (value) {
      let v = this;
      v.sku = '';
      v.splitSku = '';
      if (!value) { // 关闭
        this.$emit('closeModal');
      }
    },
    checkSplitSkuRule () {
      let v = this;
      // 截取起始符与结束符之间的字符时，起始和截止符不能全部为空
      if (v.shopSetting.splitPattern === 1 && v.shopSetting.skuStart.length === 0 && v.shopSetting.skuEnd.length === 0) {
        v.$Message.warning({
          content: 'sku起始和截止符不能全部为空',
          duration: 3
        });
        return false;
      }
      // 截取从固定位置起止的字符 中间截取时起始位要小于截止位
      if (v.shopSetting.splitPattern === 2 && v.splitType === 'middle' && v.shopSetting.middleStartIndex > v.shopSetting.middleEndIndex) {
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
      let paramsObj = v.deepCopy(v.shopSetting);
      paramsObj.sku = v.sku;
      paramsObj.matchOriginalSku = paramsObj.matchOriginalSku === true ? 1 : 0;
      paramsObj.skuStart = paramsObj.skuStart.join(',');
      paramsObj.skuEnd = paramsObj.skuEnd.join(',');
      v.axios.post(api.splitSku, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.splitSku = res.data.datas.sku;
        }
      });
    }, // 编辑确定
    shopSettingOk () {
      let v = this;
      v.skuMatchSettingSaveFn();
    }, // 保存
    skuMatchSettingSaveFn () {
      let v = this;
      if (!v.checkSplitSkuRule()) {
        // 不通过截取规则
        this.loading = false;
        this.$nextTick(() => {
          this.loading = true;
        });
        return;
      }
      // 要组装参数
      let paramsObj = {};
      paramsObj.skuMatchPlatformSettingBo = {};
      paramsObj.skuMatchPlatformSettingBo.matchType = v.matchType;
      paramsObj.skuMatchPlatformSettingBo.platformId = v.platformId;
      paramsObj.skuMatchPlatformSettingBo.platformStatus = v.platformStatus;
      paramsObj.skuMatchPlatformSettingBo.settingPattern = v.shopSetting.settingPattern;
      // paramsObj.skuMatchPlatformSettingBo.platformSettings = [];
      // let obj = {};
      // obj.platformId = v.platformId;
      // obj.platformStatus = v.platformStatus;
      // paramsObj.skuMatchPlatformSettingBo.platformSettings.push(obj);
      paramsObj.skuMatchSettings = [];
      let matchSettings = v.deepCopy(v.shopSetting);
      matchSettings.matchOriginalSku = matchSettings.matchOriginalSku === true ? 1 : 0;
      matchSettings.skuStart = matchSettings.skuStart.join(',');
      matchSettings.skuEnd = matchSettings.skuEnd.join(',');
      if (v.isBatchSetup) { // 批量设置
        // let itemSettings = v.deepCopy(matchSettings);
        v.saleAccountIds.forEach(item => {
          let itemSettings = v.deepCopy(matchSettings);
          itemSettings.saleAccountId = item;
          paramsObj.skuMatchSettings.push(itemSettings);
        });
      } else { // 单个编辑
        paramsObj.skuMatchSettings.push(matchSettings);
      }
      v.loading = true;
      v.axios.post(api.skuMatchSettingSave, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.loading = false;
          v.showModal = false;
          v.$emit('refresh');
        } else {
          this.loading = false;
          this.$nextTick(() => {
            this.loading = true;
          });
        }
      });
    }
  }
};
</script >
