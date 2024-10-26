<template>
  <div class="printGoodsShelves">
    <div class="demo-tabs-style2">
      <Tabs type="card" v-model="tabStatus">
        <TabPane label="单个打印" name="0">
          <Form :model="singlePrint" :rules="singleRules" :inline="true" :label-width="0" class="commonPrint"
            ref="single">
            <FormItem label="货架号:" prop="firstNumber" :label-width="70">
              <Input v-model="singlePrint.firstNumber" placeholder="首编号例如：A"></Input>
            </FormItem>
            <FormItem>
              <Icon type="md-remove" />
            </FormItem>
            <FormItem prop="areaNumber">
              <Input v-model="singlePrint.areaNumber" placeholder="区号例如：A001"></Input>
            </FormItem>
            <FormItem>
              <Icon type="md-remove" />
            </FormItem>
            <FormItem prop="lineNumber">
              <Input v-model="singlePrint.lineNumber" placeholder="行号例如：01"
                @on-blur="formatRange(singlePrint.lineNumber, 'line')"></Input>
            </FormItem>
            <FormItem>
              <Icon type="md-remove" />
            </FormItem>
            <FormItem prop="rowNumber">
              <Input v-model="singlePrint.rowNumber" placeholder="列号例如：01"
                @on-blur="formatRange(singlePrint.rowNumber, 'row')"></Input>
            </FormItem>
            <div v-if="getPermission('wms_printGoodsShelvesLabel')">
              <FormItem :label-width="70">
                <Button type="primary" @click="printEvent('single')" :loading="loading">打印</Button>
              </FormItem>
            </div>
          </Form>
        </TabPane>
        <TabPane label="批量打印1.0" name="1">
          <div class="tip">
            <p>货架标签样式说明，默认不对字符长度有限制</p>
            <p>举例：A001-01-01</p>
            <p>A是货架首编号</p>
            <p>001是货架区号</p>
            <p>第一个01是货架所在的行</p>
            <p>第二个01是货架所在的列</p>
          </div>
          <Form :model="multiplePrint" :rules="multipleRules" :label-width="100" class="commonPrint" ref="multiple">
            <FormItem label="货架首编号:" prop="firstNumber">
              <Input v-model="multiplePrint.firstNumber" placeholder="例如：A"></Input>
            </FormItem>
            <div style="display:flex;">
              <FormItem label="货架区号:" prop="areaNumber1">
                <Input v-model="multiplePrint.areaNumber1" placeholder="例如：1"
                  @keyup.native="number('areaNumber1')"></Input>
              </FormItem>
              <FormItem :label-width="0" style="padding: 0 10px;">
                <Icon type="md-remove" />
              </FormItem>
              <FormItem prop="areaNumber2" :label-width="0">
                <Input v-model="multiplePrint.areaNumber2" placeholder="例如：2" type="number"
                  @keyup.native="number('areaNumber2')"></Input>
              </FormItem>
            </div>
            <FormItem label="货架行数:" prop="lines">
              <div style="display:flex;">
                <Input v-model="multiplePrint.lines" placeholder="例如：1" type="number"></Input>
                <span class="ml10">行</span>
              </div>
            </FormItem>
            <FormItem label="货架列数:" prop="rows">
              <div style="display:flex;">
                <Input v-model="multiplePrint.rows" placeholder="例如：1" type="number"></Input>
                <span class="ml10">列</span>
              </div>
            </FormItem>
            <FormItem v-if="getPermission('wms_printBatchGoodsShelvesLabelV1')">
              <Button type="primary" @click="printEvent('multiple')" :loading="loading">批量打印</Button>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane label="批量打印格式2.0" name="2">
          <div class="tip">
            <p>货架标签样式说明，默认不对字符长度有限制</p>
            <p>举例：1A01-01-0101</p>
            <p>1A01楼A区第一条巷道</p>
            <p>-01第一组货架</p>
            <p>-0101第几层第几个储位</p>
          </div>
          <Form :model="multiplePrint_" :rules="multipleRules_" :label-width="120" class="commonPrint" ref="multiple2">
            <FormItem label="货架首编号:" prop="firstNumber">
              <Input v-model="multiplePrint_.firstNumber" placeholder="例如：A"></Input>
            </FormItem>
            <div style="display:flex;">
              <FormItem label="货架区号:" prop="areaNumber1">
                <Input v-model="multiplePrint_.areaNumber1" placeholder="例如：1"
                  @keyup.native="number('areaNumber1')"></Input>
              </FormItem>
              <FormItem :label-width="0" style="padding: 0 10px;">
                <Icon type="md-remove" />
              </FormItem>
              <FormItem prop="areaNumber2" :label-width="0">
                <Input v-model="multiplePrint_.areaNumber2" placeholder="例如：2" type="number"
                  @keyup.native="number('areaNumber2')"></Input>
              </FormItem>
            </div>
            <div style="display:flex;">
              <FormItem label="货架行数:" prop="lines1">
                <Input v-model="multiplePrint_.lines1" placeholder="例如：1" @keyup.native="number('lines1')"></Input>
              </FormItem>
              <FormItem :label-width="0" style="padding: 0 10px;">
                <Icon type="md-remove" />
              </FormItem>
              <FormItem prop="lines2" :label-width="0">
                <Input v-model="multiplePrint_.lines2" placeholder="例如：2" type="number"
                  @keyup.native="number('lines2')"></Input>
              </FormItem>
            </div>
            <FormItem label="货架列首位数:" prop="first_">
              <Input v-model="multiplePrint_.first_" placeholder="例如：1" type="number"></Input>
            </FormItem>
            <FormItem label="货架列末位数:" prop="second_">
              <Input v-model="multiplePrint_.second_" placeholder="例如：1" type="number"></Input>
            </FormItem>
            <FormItem v-if="getPermission('wms_printBatchGoodsShelvesLabelV2')">
              <Button type="primary" @click="printEvent('multiple2')" :loading="loading">批量打印</Button>
            </FormItem>
          </Form>
        </TabPane>
      </Tabs>
    </div>
    <!-- 打印标签 -->
    <print-common ref="printCommon" :printModal.sync="printModal" :printData="printData"
      :pintField="pintField"></print-common>
  </div>
</template>

<script>
import printCommon from '@/views/wms/components/pirntCommon/index';
import common from '@/components/mixin/common_mixin';
export default {
  name: 'printGoodsShelves',
  components: { printCommon },
  mixins: [common],
  data() {
    // 公共验证
    let validateFun = (val_1, val_2, callback) => {
      if (val_1 && val_2) {
        if (val_1 > val_2) {
          return callback(new Error('请确保范围大小是否正确'));
        }
        if (val_1.length != val_2.length) {
          return callback(new Error('数字位数请保持一致'));
        }
      }
      callback();
    }
    let checkRange = (rule, value, callback) => {
      let { areaNumber1, areaNumber2 } = this.multiplePrint;
      validateFun(areaNumber1, areaNumber2, callback);
    };
    let checkRange_area = (rule, value, callback) => {
      let { areaNumber1, areaNumber2 } = this.multiplePrint_;
      validateFun(areaNumber1, areaNumber2, callback);
    };
    var checkRange_line = (rule, value, callback) => {
      let { lines1, lines2 } = this.multiplePrint_;
      validateFun(lines1, lines2, callback);
    };
    return {
      tabStatus: '0', // tab状态
      loading: false,
      // 单个打印-表单数据
      singlePrint: {
        firstNumber: '',
        areaNumber: null,
        lineNumber: null,
        rowNumber: null
      },
      // 批量打印1.0-表单数据
      multiplePrint: {
        firstNumber: '',
        areaNumber1: null,
        areaNumber2: null,
        lines: null,
        rows: null
      },
      // 批量打印2.0-表单数据
      multiplePrint_: {
        firstNumber: '',
        areaNumber1: null,
        areaNumber2: null,
        lines1: null,
        lines2: null,
        first_: null,
        second_: null
      },
      // 单个打印-规则校验
      singleRules: {
        firstNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        areaNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        lineNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        rowNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      // 批量打印1.0-规则校验
      multipleRules: {
        firstNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        areaNumber1: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange }
        ],
        areaNumber2: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange }
        ],
        lines: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        rows: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      // 批量打印2.0-规则校验
      multipleRules_: {
        firstNumber: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        areaNumber1: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange_area }
        ],
        areaNumber2: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange_area }
        ],
        lines1: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange_line }
        ],
        lines2: [
          { required: true, message: '不能为空', trigger: 'blur' },
          { trigger: 'blur', validator: checkRange_line }
        ],
        first_: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ],
        second_: [
          { required: true, message: '不能为空', trigger: 'blur' }
        ]
      },
      printModal: false, // 打印弹框
      printData: [], // 打印的数据
      isPrintComplete: false, // 打印提示
      pintField: {
        label: '货架标签',
        columns: [
          { label: 'barCode', key: 'barCode', barcode: true },
          { label: 'shelf', key: 'shelf' },
          { label: 'num', key: 'num' },
          { label: '数量', key: 'printNum', noprint: true }
        ], // 打印表头
        pintContent: ['barCode', 'shelf', 'num'],
        printParams: {// 打印纸张大小
          width: 90,
          height: 60
        },
        positionKey: { // 打印标签位置
          barCode: {
            paddingTop: '6px',
            height: '80px',
          },
          shelf: {
            textAlign: 'left',
            wordBreak: 'break-all',
            fontSize: '40px',
            lineHeight: '40px',
            padding: '0 4px',
          },
          num: {
            textAlign: 'center',
            wordBreak: 'break-all',
            fontSize: '40px',
            lineHeight: '40px',
            padding: '0 4px',
          }
        },
        codeOption: {
          barCode: {
            codeConfig: {
              height: 60,
              width: 1.5,
            }, // 二维码配置
            svgConfig: {
              displayValue: true, // 显示下标文字信息
            },
            svgStyle: {
              fontSize: '10pt',
            }
          }
        }
      }
    }
  },
  methods: {
    number(tag) {
      const tabStatus = this.tabStatus;
      let temp = { '0': 'singlePrint', '1': 'multiplePrint', '2': 'multiplePrint_' };
      let type = temp[tabStatus] || '';
      if (!(type && this[type][tag])) return;
      this[type][tag] = this[type][tag].replace(/[^\.\d]/g, '');
      this[type][tag] = this[type][tag].replace('.', '');
    },
    formatRange(val, status) {
      if (val === '' || val === null) return;
      let num = null;
      if (Number(val) < 10 && val.length < 2) {
        Number(val) === 0 ? (num = null) : (num = '0' + val);
        status == 'line'
          ? (this.singlePrint.lineNumber = num)
          : (this.singlePrint.rowNumber = num);
      }
    },
    //  打印
    printEvent(formName) {
      this.$refs[formName].validate(valid => {
        if (!valid) return;
        let [self, arr, singlePrint, multiplePrint, multiplePrint_] = [this, [], this.singlePrint, this.multiplePrint, this.multiplePrint_];
        let fun = {
          // 单个打印
          'single': () => {
            arr[0] = {
              shelf: singlePrint.firstNumber + singlePrint.areaNumber,
              num: '-' + singlePrint.lineNumber + '-' + singlePrint.rowNumber
            };
          },
          // 批量打印
          'multiple': () => {
            for (let i = Number(multiplePrint.areaNumber1); i <= Number(multiplePrint.areaNumber2); i++) {
              let n1 = multiplePrint.areaNumber1.length;
              let v = self.dealNullNumber(i, n1);
              for (let j = 0; j <= multiplePrint.lines; j++) {
                let len = multiplePrint.lines.length;
                j = self.dealNullNumber(j, len);
                for (let k = 0; k <= multiplePrint.rows; k++) {
                  let obj = {};
                  obj.shelf = multiplePrint.firstNumber + v;
                  let len = multiplePrint.rows.length;
                  k = self.dealNullNumber(k, len);
                  obj.num = '-' + j + '-' + k;
                  arr.push(obj);
                }
              }
            }
          },
          // 批量打印2.0
          'multiple2': () => {
            // 区号 函数 首位数 抹尾数
            let [areaList, lineList, first_List, last_List] = [[], [], [], []];
            // 循环遍历出区号数组内容
            for (let i = Number(multiplePrint_.areaNumber1); i <= Number(multiplePrint_.areaNumber2); i++) {
              let len = multiplePrint_.areaNumber1.length;
              i = self.dealNullNumber(i, len);
              areaList.push(i)
            }
            // 循环遍历出行数数组内容
            for (let i = Number(multiplePrint_.lines1); i <= Number(multiplePrint_.lines2); i++) {
              let len = multiplePrint_.lines1.length;
              i = self.dealNullNumber(i, len);
              lineList.push(i)
            }
            // 循环遍历出首位数数组内容
            for (let i = 1; i <= Number(multiplePrint_.first_); i++) {
              let len = multiplePrint_.first_.length;
              i = self.dealNullNumber(i, len);
              first_List.push(i)
            }
            // 循环遍历出抹尾数数组内容
            for (let i = 1; i <= Number(multiplePrint_.second_); i++) {
              let len = multiplePrint_.second_.length;
              i = self.dealNullNumber(i, len);
              last_List.push(i)
            }
            // 这里开始组装
            // 遍历区号
            for (let i = 0; i < areaList.length; i++) {
              // 遍历行数
              for (let j = 0; j < lineList.length; j++) {
                // 遍历首位数
                for (let k = 0; k < first_List.length; k++) {
                  // 遍历末尾数
                  for (let l = 0; l < last_List.length; l++) {
                    let obj = {};
                    obj.shelf = multiplePrint_.firstNumber + areaList[i];
                    obj.num = '-' + lineList[j] + '-' + first_List[k] + last_List[l];
                    arr.push(obj)
                  }
                }
              }
            }
            // 这里结束组
          },
          // 打印标签
          printLabel: () => {
            // 处理要打印的数据
            arr = arr.map(arritem => {
              arritem.barCode = arritem.shelf + arritem.num;
              arritem.printNum = 1;
              return arritem;
            })
            self.printData = arr;
            if (!arr.length) {
              self.$Message.warning('打印数据为空，请正确填写~');
              return;
            }
            // this.printModal = true;
            // return;
            let printCommon = self.$refs.printCommon;
            printCommon.setData().then(() => {
              self.isPrintComplete = true;
              printCommon.pintAll();
              // 这里要等待打印加载完毕才能放开
              let timer = setInterval(() => {
                if (!printCommon.loading) {
                  clearInterval(timer);
                  self.isPrintComplete = false;
                }
              }, 200);
              // 组件销毁前，清空定时器
              this.$once('hook:beforeDestory', () => {
                clearInterval(timer);
                timer = null;
              })
              // 1分钟后，弹框未关闭，则自动关掉定时器
              setTimeout(() => {
                if (printCommon.loading) {
                  clearInterval(timer);
                  self.isPrintComplete = false;
                }
              }, 60000);
            })
          }
        }
        if (this.isPrintComplete) {
          this.$Message.warning({
            content: '正在打印中，请耐心等待打印完成后再做此操作！',
            top: 150,
            duration: 3
          })
          return;
        }
        this.loading = true;
        fun[formName]();
        fun.printLabel();
        this.loading = false;
      });
    },
    // 补0函数
    dealNullNumber(num, n) {
      var len = num.toString().length;
      while (len < n) {
        num = '0' + num;
        len++;
      }
      if (Number(num) < 10 && len === 1) {
        num = '0' + num
      }
      return num.toString();
    }
  }
}
</script>

<style lang="less">
.printGoodsShelves {
  height: 100%;
  padding: 20px 10px;
  background: #fff;

  .demo-tabs-style2>.ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab {
    border-radius: 0;
    background: #fff;
  }

  .demo-tabs-style2>.ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active {
    border-top: 1px solid #3399ff;
  }

  .demo-tabs-style2>.ivu-tabs.ivu-tabs-card>.ivu-tabs-bar .ivu-tabs-tab-active:before {
    content: "";
    display: block;
    width: 100%;
    height: 1px;
    background: #3399ff;
    position: absolute;
    top: 0;
    left: 0;
  }

  .commonPrint {
    padding-top: 20px;

    .ivu-form-item-label {
      font-size: 14px;
    }

    .ivu-input-wrapper {
      width: 200px;
    }
  }

  .tip {
    background-color: rgba(253, 246, 236, 1);
    padding: 20px;

    p {
      color: #df9500;
      line-height: 20px;
    }
  }
}
</style>
