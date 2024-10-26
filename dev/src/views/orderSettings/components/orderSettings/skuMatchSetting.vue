<style scoped>
.skuMatchItem {
  font-size: 28px;
  font-weight: bold;
  margin: 0 80px 20px 0;
}

.footer {
  /* position: fixed;
    bottom: 0; */
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
</style><!-- 有待优化啊 -->
<template>
  <div class="normalPadding" v-if="getPermission('skuMatchSetting_platformSettings')" style="position: relative;">
    <!-- 设置选项 -->
    <RadioGroup v-model="matchType" @on-change="matchTypeChangeFn">
      <Radio label="DISABLE" class="skuMatchItem">未启用
      </Radio>
      <Radio label="ALL" class="skuMatchItem">全平台/店铺生效
      </Radio>
      <Radio label="PORTION" class="skuMatchItem">部分平台/店铺生效
      </Radio>
    </RadioGroup>
    <!-- 未启用 -->
    <div v-if="matchType === 'DISABLE'" style="font-size: 28px; min-height: 600px;">
      <div class="mb20 fontBold" style="color: #169BD5">说明：此功能用于系统下载订单后，可设置匹配LAPA SKU时，按照规则对平台SKU截取后再匹配
      </div>
      <div class="mb20">
        <span class="fontBold red">未启用：</span> 仅匹配LAPA SKU和LAPA映射SKU
      </div>
      <div class="mb20">
        <span class="fontBold red">全平台/店铺生效：</span> 系统设置统一的截取规则
      </div>
      <div class="mb20">
        <span class="fontBold red">部分平台/店铺生效：</span> 可按照平台/店铺维度设置各自的截取规则
      </div>
    </div>
    <!-- 全平台/店铺生效 -->
    <div v-if="matchType === 'ALL'">
      <div class="card-container normalTop">
        <div class="card-content">
          <!-- 截取规则 -->
          <div class="normalFontSizeOneSize normalTop fontBold">截取规则</div>
          <div class="normalTop">
            <Row>
              <Col span="4">
              <Checkbox v-model="skuMatchSettings.matchOriginalSku">优先匹配原始SKU
              </Checkbox>
              </Col>
              <Col span="20">
              <div class="red">说明：</div>
              <div class="red">1.勾选时，用原始SKU匹配成功则不会再用截取后的SKU进行匹配；</div>
              <div class="red">2.不勾选，系统只会用截取后的SKU进行匹配，匹配失败的订单进入“未匹配商品”</div>
              </Col>
            </Row>
          </div>
          <div class="normalTop30">
            <RadioGroup v-model="skuMatchSettings.splitPattern">
              <Radio :label="1" class="mr20">截取起始符与结束符之间的字符
              </Radio>
              <Radio :label="2" class="mr20">截取从固定位置起止的字符
              </Radio>
            </RadioGroup>
          </div>
          <div class v-if="skuMatchSettings.splitPattern === 1">
            <Row class="normalTop20">
              <Col span="18">
              <div class="list">
                <div class="list-item">
                  <Row type="flex" align="middle">
                    <Col span="4">SKU起始符</Col>
                    <Col span="12">
                    <dyt-select v-model="skuMatchSettings.skuStart" multiple @on-open-change="selectStartOpenChangeFn">
                      <Option v-for="item in interceptStartArr" :value="item.idx" :key="item.idx" :disabled="item.disabled">{{ item.charDesc }}</Option>
                    </dyt-select>
                    </Col>
                  </Row>
                </div>
                <div class="list-item">
                  <Row type="flex" align="middle">
                    <Col span="4">SKU结束符</Col>
                    <Col span="12">
                    <dyt-select v-model="skuMatchSettings.skuEnd" multiple @on-open-change="selectEndOpenChangeFn">
                      <Option v-for="item in interceptEndArr" :value="item.idx" :key="item.idx" :disabled="item.disabled">{{ item.charDesc }}</Option>
                    </dyt-select>
                    </Col>
                  </Row>
                </div>
                <div class="list-item">
                  <Row type="flex" align="middle">
                    <Col span="4">异常处理</Col>
                    <Col span="20">
                    <div>
                      <span>找到多个起始符时，以字符串中</span> <dyt-select v-model="skuMatchSettings.validStart" style="width: 100px; margin: 0 10px;">
                        <Option v-for="item in validArr" :value="item.value" :key="item.value">{{ item.label }}</Option>
                      </dyt-select> <span>的起始符作为有效起始符</span>
                    </div>
                    <div class="normalTop">
                      <span>找到多个结束符时，以字符串中</span> <dyt-select v-model="skuMatchSettings.validEnd" style="width: 100px; margin: 0 10px;">
                        <Option v-for="item in validArr" :value="item.value" :key="item.value">{{ item.label }}</Option>
                      </dyt-select> <span>的结束符作为有效结束符</span>
                    </div>
                    <div class="normalTop">
                      <span>找到多个结束符时，以字符串中</span> <dyt-select v-model="skuMatchSettings.endLeftStart" style="width: 160px; margin: 0 10px;">
                        <Option v-for="item in endLeftStartArr" :value="item.value" :key="item.value">{{ item.label }}</Option>
                      </dyt-select> <span>的结束符作为有效结束符</span>
                    </div>
                    </Col>
                  </Row>
                </div>
              </div>
              </Col>
            </Row>
          </div>
          <div class v-if="skuMatchSettings.splitPattern === 2">
            <Row class="normalTop20">
              <Col span="18">
              <div class="list">
                <RadioGroup v-model="splitType" vertical @on-change="splitTypeChangeFn" style="width: 100%">
                  <div class="list-item">
                    <Row type="flex" align="middle">
                      <Col span="4">
                      <Radio label="forward">向前截取</Radio>
                      </Col>
                      <Col span="20">
                      <span>从第1位截取到第</span>
                      <InputNumber v-model="skuMatchSettings.forwardIndex" :disabled="splitType !== 'forward'" @on-change="forwardIndexFn" :step="1" :min="1" style="width: 80px; margin: 0 10px;"></InputNumber>
                      <span>位（包含起止位置字符本身）</span>
                      </Col>
                    </Row>
                  </div>
                  <div class="list-item">
                    <Row type="flex" align="middle">
                      <Col span="4">
                      <Radio label="middle">中间截取</Radio>
                      </Col>
                      <Col span="20">
                      <span>从第</span>
                      <InputNumber v-model="skuMatchSettings.middleStartIndex" :disabled="splitType !== 'middle'" @on-change="middleStartIndexFn" :step="1" :min="1" style="width: 80px; margin: 0 10px;"></InputNumber>
                      <span>位截取到第</span>
                      <InputNumber v-model="skuMatchSettings.middleEndIndex" :disabled="splitType !== 'middle'" @on-change="middleEndIndexFn" :step="1" :min="1" style="width: 80px; margin: 0 10px;"></InputNumber>
                      <span>位（包含起止位置字符本身）</span>
                      </Col>
                    </Row>
                  </div>
                  <div class="list-item">
                    <Row type="flex" align="middle">
                      <Col span="4">
                      <Radio label="backward">向后截取</Radio>
                      </Col>
                      <Col span="20">
                      <span>从第</span>
                      <InputNumber v-model="skuMatchSettings.backwardIndex" :disabled="splitType !== 'backward'" @on-change="backwardIndexFn" :step="1" :min="1" style="width: 80px; margin: 0 10px;"></InputNumber>
                      <span>位截取到最后一位（包含起止位置字符本身）</span>
                      </Col>
                    </Row>
                  </div>
                </RadioGroup>
              </div>
              </Col>
            </Row>
          </div>
          <!-- 截取测试 -->
          <div class="normalFontSizeOneSize normalTop20 fontBold">Custom Label/SKU截取测试</div>
          <div class="normalTop">填入需要截取的Custom Label,点击截取,系统将根据您本页面的设置给出截取的结果。</div>
          <Row class="normalTop">
            <Col span="18">
            <div class="list">
              <div class="list-item">
                <Row type="flex" align="middle">
                  <Col span="4">需要截取的SKU</Col>
                  <Col span="8">
                  <Input v-model="sku" />
                  </Col>
                  <Col span="4" offset="1">
                  <Button type="primary" @click="splitSkuFn">截取 </Button>
                  </Col>
                </Row>
              </div>
              <div class="list-item">
                <Row type="flex" align="middle">
                  <Col span="4">截取结果</Col>
                  <Col span="8">
                  <Input v-model="splitSku" />
                  </Col>
                </Row>
              </div>
            </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
    <!-- 部分平台/店铺生效 -->
    <div v-if="matchType === 'PORTION'">
      <div class="card-container normalTop">
        <div class="card-content">
          <portionSkuMatchSetting :platforms="platforms"></portionSkuMatchSetting>
        </div>
      </div>
    </div>
    <!-- 保存 -->
    <div class="footer" v-if="matchType === 'DISABLE' || matchType === 'ALL'">
      <Button @click="skuMatchSettingSaveFn" :disabled="!getPermission('skuMatchSetting_create')">保存 </Button>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import portionSkuMatchSetting from './components/portionSkuMatchSetting';

export default {
  mixins: [Mixin],
  components: {
    portionSkuMatchSetting
  },
  data () {
    return {
      matchType: '', // 未开启:DISABLE, 全平台店铺生效:ALL, 部分平台/店铺生效:PORTION ,
      platforms: [], // 各平台列表
      sku: '', // 原SKU
      splitSku: '', // 截取结果的sku
      skuMatchSettings: {
        // sku匹配设置
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
        // settingPattern: 0, // 1按平台设置 2按店铺设置, 部分平台/店铺生效
        skuMatchSettingId: 0, // sku匹配设置流水号，部分平台/店铺生效
        status: 0 // 状态0关闭 1启用，部分平台/店铺生效
      },
      interceptStartArr: [], // 可截取起始符字符列表
      interceptEndArr: [], // 可截取结束符字符列表
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
  },
  activated () {
    this.init();
  },
  computed: {},
  methods: {
    init () {
      let v = this;
      v.getSkuMatchSetting();
    },
    matchTypeChangeFn (value) {
      let v = this;
      if (value === 'ALL') {
        v.getSplitChars();
        // v.getPlatformSkuMatchSetting("ALL");
      }
    },
    getSkuMatchSetting () {
      // 查询平台sku匹配设置 未开启 全平台/店铺生效  部分生效
      let v = this;
      v.axios.get(api.get_skuMatchSetting).then(res => {
        v.matchType = res.data.datas.matchType || 'DISABLE';
        v.platforms = res.data.datas.platformSettings;
        if (v.matchType === 'ALL') {
          v.getSplitChars();
          v.getPlatformSkuMatchSetting('ALL');
        }
      });
    },
    getPlatformSkuMatchSetting (platformId) {
      // 按平台ID查询平台sku匹配设置 后面带参数
      let v = this;
      v.axios.get(api.get_platformSkuMatchSetting + '/' + platformId).then(res => {
        let arr = res.data.datas;
        if (platformId === 'ALL' && arr.length > 0) {
          v.skuMatchSettings.matchOriginalSku = arr[0].matchOriginalSku == 1;
          v.skuMatchSettings.splitPattern = arr[0].splitPattern;
          v.skuMatchSettings.skuStart = arr[0].skuStart.split(',').map(Number);
          v.skuMatchSettings.skuEnd = arr[0].skuEnd.split(',').map(Number);
          v.skuMatchSettings.validStart = arr[0].validStart;
          v.skuMatchSettings.validEnd = arr[0].validEnd;
          v.skuMatchSettings.endLeftStart = arr[0].endLeftStart;
          v.skuMatchSettings.splitForward = arr[0].splitForward;
          v.skuMatchSettings.splitMiddle = arr[0].splitMiddle;
          v.skuMatchSettings.splitBackward = arr[0].splitBackward;
          v.splitType = arr[0].splitForward === 1 ? 'forward' : arr[0].splitMiddle === 1
            ? 'middle'
            : arr[0].splitBackward === 1 ? 'backward' : 'forward';
          v.skuMatchSettings.forwardIndex = arr[0].forwardIndex;
          v.skuMatchSettings.middleStartIndex = arr[0].middleStartIndex;
          v.skuMatchSettings.middleEndIndex = arr[0].middleEndIndex;
          v.skuMatchSettings.backwardIndex = arr[0].backwardIndex;
          v.skuMatchSettings.saleAccountId = arr[0].saleAccountId;
          // v.skuMatchSettings.settingPattern = arr[0].settingPattern;
          v.skuMatchSettings.skuMatchSettingId = arr[0].skuMatchSettingId;
          v.skuMatchSettings.status = arr[0].status;
        }
      });
    },
    getSplitChars () {
      // 获取截取符号列表
      let v = this;
      v.axios.get(api.get_splitChars).then(res => {
        let arr = res.data.datas;
        arr.forEach(item => {
          item.disabled = false;
        });
        v.interceptStartArr = v.deepCopy(arr);
        v.interceptEndArr = v.deepCopy(arr);
      });
    },
    splitTypeChangeFn (value) {
      // 选择 截取方式
      let v = this;
      switch (value) {
        case 'forward': // 向前截取
          v.skuMatchSettings.splitForward = 1;
          v.skuMatchSettings.splitMiddle = 0;
          v.skuMatchSettings.splitBackward = 0;
          v.skuMatchSettings.middleStartIndex = 1;
          v.skuMatchSettings.middleEndIndex = 1;
          v.skuMatchSettings.backwardIndex = 1;
          break;
        case 'middle': // 中间截取
          v.skuMatchSettings.splitForward = 0;
          v.skuMatchSettings.splitMiddle = 1;
          v.skuMatchSettings.splitBackward = 0;
          v.skuMatchSettings.forwardIndex = 1;
          v.skuMatchSettings.backwardIndex = 1;
          break;
        case 'backward': // 向后截取
          v.skuMatchSettings.splitForward = 0;
          v.skuMatchSettings.splitMiddle = 0;
          v.skuMatchSettings.splitBackward = 1;
          v.skuMatchSettings.forwardIndex = 1;
          v.skuMatchSettings.middleStartIndex = 1;
          v.skuMatchSettings.middleEndIndex = 1;
          break;
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
        if (v.skuMatchSettings.skuEnd.indexOf(item.idx) > -1) {
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
        if (v.skuMatchSettings.skuStart.indexOf(item.idx) > -1) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
    },
    forwardIndexFn (value) {
      if (value === null) {
        this.skuMatchSettings.forwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.skuMatchSettings.forwardIndex = num;
      }
    },
    middleStartIndexFn (value) {
      if (value === null) {
        this.skuMatchSettings.middleStartIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.skuMatchSettings.middleStartIndex = num;
      }
    },
    middleEndIndexFn (value) {
      if (value === null) {
        this.skuMatchSettings.middleEndIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.skuMatchSettings.middleEndIndex = num;
      }
    },
    backwardIndexFn (value) {
      if (value === null) {
        this.skuMatchSettings.backwardIndex = 1;
        return;
      }
      let str = String(value);
      if (str.indexOf('.') > -1) {
        let num = Number(str.slice(0, str.indexOf('.')));
        this.skuMatchSettings.backwardIndex = num;
      }
    },
    checkSplitSkuRule () {
      let v = this;
      // 截取起始符与结束符之间的字符时，起始和截止符不能全部为空
      if (v.matchType === 'ALL' && v.skuMatchSettings.splitPattern === 1 && v.skuMatchSettings.skuStart.length == 0 && v.skuMatchSettings.skuEnd.length == 0) {
        v.$Message.warning({
          content: 'sku起始和截止符不能全部为空',
          duration: 3
        });
        return false;
      }
      // 截取从固定位置起止的字符 中间截取时起始位要小于截止位
      if (v.matchType === 'ALL' && v.skuMatchSettings.splitPattern === 2 && v.splitType === 'middle' && v.skuMatchSettings.middleStartIndex > v.skuMatchSettings.middleEndIndex) {
        v.$Message.warning({
          content: '中间截取的起始位不能大于结束位',
          duration: 3
        });
        return false;
      }
      return true;
    },
    splitSkuFn () {
      // 获取截取结果
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
      let paramsObj = v.deepCopy(v.skuMatchSettings);
      paramsObj.sku = v.sku;
      paramsObj.matchOriginalSku = paramsObj.matchOriginalSku === true ? 1 : 0;
      paramsObj.skuStart = paramsObj.skuStart.join(',');
      paramsObj.skuEnd = paramsObj.skuEnd.join(',');
      v.axios.post(api.splitSku, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.splitSku = res.data.datas.sku;
        }
      });
    },
    skuMatchSettingSaveFn () {
      // 保存sku匹配设置
      let v = this;
      if (!v.checkSplitSkuRule()) {
        // 不通过截取规则
        return;
      }
      // 要组装参数
      let paramsObj = {};
      paramsObj.skuMatchPlatformSettingBo = {};
      paramsObj.skuMatchPlatformSettingBo.matchType = v.matchType;
      // paramsObj.skuMatchPlatformSettingBo.platformSettings = [];
      paramsObj.skuMatchSettings = [];
      let matchSettings = v.deepCopy(v.skuMatchSettings);
      matchSettings.matchOriginalSku = matchSettings.matchOriginalSku === true ? 1 : 0;
      matchSettings.skuStart = matchSettings.skuStart.join(',');
      matchSettings.skuEnd = matchSettings.skuEnd.join(',');
      paramsObj.skuMatchSettings.push(matchSettings);
      v.axios.post(api.skuMatchSettingSave, paramsObj).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('操作成功');
          v.init();
        }
      });
    }
  }
};
</script >
