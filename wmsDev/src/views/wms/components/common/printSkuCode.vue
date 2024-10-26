<template>
  <div>
    <Modal :mask-closable="false" title="打印SKU" @on-visible-change="visibleChange" class="skuPrintM"
      v-model="$store.state.printSkuModal" width="1000">
      <print-box ref="printBox" :sourceList="sourceList" :printObject="printObject"></print-box>
      <div class="mb10 printSkuCode_printBtn">
        <div>
          <Button @click="batchDelete">删除选中</Button>
        </div>
        <div>
          <div class="printSkuCode_printBtn_numset">
            <span class="mr10">统一设置打印数量</span>
            <InputNumber :min="1" @on-change="uniteSetAmount" size="small" v-model="printAmount"></InputNumber>
          </div>
        </div>
      </div>
      <Table highlight-row border :columns="columns" :data="data" @on-selection-change="changeTable" max-height="365"
        ref="printTable">
      </Table>
      <div slot="footer">
        <span style="display: inline-flex;align-items: center;">
          <Checkbox v-model="thirdLabel" style="margin-right: 40px;" v-if="!['inventory'].includes(printSource)">
            打印的标签为第三方标签
          </Checkbox>
          <Checkbox v-model="isCloseModal" style="margin-right: 40px;" v-if="printSource === 'receipt'">不自动关闭</Checkbox>
        </span>
        <Button @click="cancelSku">取消</Button>
        <Button @click="print" type="primary" v-if="printSource === 'receipt'">打印</Button>
        <Button @click="receivingGoods" type="primary" v-if="printSource === 'receipt'">收货</Button>
        <Button :disabled="disabledPrint" @click="uploadToControl" type="primary">{{ printBtnText }}</Button>
      </div>
      <Spin size="large" fix v-if="beingCreatePrint">
        处理打印数据中，数据量越多需要时间越久，请耐心等待...
      </Spin>
    </Modal>
  </div>
</template>
<script>
import 'draggabilly';
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
import printBox from '@/components/common/print';
// import { createPdf } from '@/utils/createPdf';
import printCommon from '@/utils/printCommon';
import { getPrintHtml } from '@/utils/printTagCommon';

export default {
  mixins: [common], // tipsDataLength 的长度大于1给出提示框
  components: {
    printBox,
  },
  props: [
    'printSkuObj', // 打印数据
    'printType',
    'qualityCheckProcurementId',
    'tipsDataLength',
    'wherePrintPage',
    'barCodeShow',
    'printSource' // 打印来源   inventory 库存余量  inWareManage // 入库单详情
  ],
  data() {
    return {
      isCloseModal: true,
      thirdLabel: false,
      value1: '1',
      checkData: [],
      printBtnText: '打印',
      noAutoClosePrintModal: localStorage.getItem('noAutoClosePrintModal') === '1',
      downPrintControl: true,
      skuGoodPosDistance: '&nbsp;&nbsp;',
      singleD: '&nbsp;&nbsp;',
      doubleD: '&nbsp;&nbsp;&nbsp;&nbsp;',
      printer: '',
      sku: '',
      copySku: '',
      printerList: [],
      tableClickIndex: 0,
      goodsPosition: '',
      goodsName: '',
      goodsSize: '',
      selfDefineContent: '',
      printAmount: 1, // 统一打印数量
      centerOrNot: '0', // 居中不居中
      distance: '0',
      data: [],
      printMachine: '0', // 打印控件
      commomSize: '',
      disabledPrint: false,
      printPurchanNo: '1',
      productBinding: '1',
      receiptBatchNo: '1',
      printLocation: '1',
      sourceList: [], // 要显示的打印条件
      beingCreatePrint: false,
    };
  },
  computed: {
    // 打印参数
    columns() {
      let v = this;
      let arr = [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '图片',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU/条码编码',
          align: 'center',
          // key: 'goodsSku',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.goodsSku || ''),
              h('div', params.row.barCode || ''),
            ])
          }
        }, {
          title: '商品名称',
          align: 'center',
          key: 'goodsCnDesc',
          render: (h, params) => {
            return h('div', {}, params.row.goodsCnDesc);
          }
        }, {
          title: '参考编号',
          align: 'center',
          key: 'referenceNo',
          render(h, params) {
            if (params.row.referenceNo2) {
              return h('div', {}, [
                h('span', params.row.referenceNo + '/'),
                h('span', v.sepCommasFn(params.row.referenceNo2).join('/'))
              ]);
            } else {
              return h('div', {}, [h('span', params.row.referenceNo)]);
            }
          }
        }, {
          title: '打印数量',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('Input', {
              props: {
                size: 'small',
                value: v.data[params.index].notReceivingNumber
              },
              style: {
                width: '60px'
              },
              on: {
                'on-blur': e => {
                  let value = 1;
                  if (v.typeOf(Number(e.target.value)) === 'number' && Number(e.target.value).toString() !== 'NaN') {
                    value = e.target.value;
                  }
                  v.data[params.index].notReceivingNumber = Number(value);
                  v.$nextTick(() => {
                    v.$set(v.data[params.index], 'notReceivingNumber', Number(value));
                  });
                  // t.data[params.index] =  params.row
                }
              }
            });
          }
        }, {
          title: '规格',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, [
              h('Input', {
                props: {
                  value: params.row.goodsAttributes
                },
                on: {
                  'on-blur': val => {
                    params.row.goodsAttributes = val.target.value;
                    v.$nextTick(() => {
                      v.$set(v.data[params.index], 'goodsAttributes', val.target.value);
                      // v.$refs.printBox.setInitData(v.data[0]);
                    });
                    if (params.index === 0) {
                      v.commomSize = val.target.value;
                    }
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          align: 'center',
          key: 'address',
          width: 90,
          render: (h, params) => {
            return h('div', {
              style: {
                width: '22px',
                height: '22px'
              },
              on: {
                click: () => {
                  if (v.data.length > 1) {
                    v.data.splice(params.index, 1);
                    if (v.data.length === 0) {
                      $('.container').css('display', 'none');
                    }
                  }
                }
              }
            }, [
              h('Icon', {
                attrs: {},
                props: {
                  type: 'ios-trash'
                },
                style: {
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '22px',
                  height: '22px'
                }
              }, '删除')
            ]);
          }
        }
      ];
      if (this.printSource === 'inventory') {
        // 库存余量
        arr.splice(4, 1);
        return arr;
      } else if (this.printSource === 'receipt') {
        arr.splice(2, 0, {
          title: '入库单号',
          key: 'receiptNo'
        });
        return arr;
      } else {
        return arr;
      }
    },
    printObject() {
      return this.data[0] || {};
    }
  },
  mounted() {
    this.$nextTick(() => {
      $('.procurementNo').draggabilly({});
    });
  },
  methods: {
    setPrintView() {
      // 根据页面设置打印哪些展示
      /**
       * PRINT_003: 'goodsCnDesc', // 中文名称
       PRINT_004: 'goodsAttributes', // 规格
       PRINT_005: 'defineContent', // 自定义内容
       PRINT_006: 'warehouseLocationName', // 产品库位
       PRINT_007: 'warehouseBlockName', // 产品绑定库区
       PRINT_008: 'receiptBatchNo', // 批次号
       PRINT_009: 'referenceNo' // 参考编号 */

      // console.log(this.printSource, 111);
      // 'receipt', 'shelvesManage', 'qualityManage', 'inWareManageSource'

      this.sourceList = [];
      let [list, printSource] = [[], this.printSource];
      if (['inWareManageSource', 'shelvesManage', 'qualityManage'].includes(printSource)) {
        // 入库单详情 (入库单管理 || 质检 || 上架)
        list = ['PRINT_007', 'PRINT_009'];
      } else if (printSource === 'receipt') {
        // 收货界面
        list = ['PRINT_006', 'PRINT_007', 'PRINT_008', 'PRINT_009', 'PRINT_0010', 'PRINT_0011'];
      } else if (printSource === 'inventory') {
        // 库存余量
        list = ['PRINT_006', 'PRINT_007', 'PRINT_008'];
      }
      this.sourceList = list;
    },
    receivingGoods() {
      this.data.forEach(i => {
        i.iSClOSE = !this.isCloseModal;
      });
      this.$emit('printEnd', this.data);
    },
    // 打印
    print() {
      if (this.printSource === 'receipt') {
        this.data.forEach(i => {
          i.receiptBatchNo = '';
          i.warehouseLocationName = '';
          i.warehouseLocationNameBarCode = '';
        });
      }
      let data = this.data.map(i => {
        if (i.skuBarcode) {
          i.skuBarcode = this.entityToString(i.skuBarcode);
        } else if (i.barcode) {
          i.skuBarcode = this.entityToString(i.barcode);
        }
        i.printNumber = i.notReceivingNumber; // 打印数量
        return i;
      });
      // (收货，上架，质检，入库单)存在第三方标签且勾选情况下打印第三方标签，否则按原流程打印LAPA标签
      if (!['inventory'].includes(this.printSource) && this.thirdLabel) {
        this.thirdLabelPrint();
      } else {
        this.$refs.printBox.onPrint(data).then(response => {
          this.$store.commit('printSkuModal', false);
        });
      }
    },
    // 打印标签弹窗
    thirdLabelPrint() {
      let printList = (this.data || []).filter(k => k.printNumber).map(k => {
        let obj = k.thirdLabelInfoDTO || {};
        obj.printNumber = k.printNumber;
        obj.platformSubject = k.platformSubject ? k.platformSubject.toLowerCase() : k.platformSubject;
        // shein 次属性为空，则打印主属性
        if (obj.platformSubject === 'shein') {
          obj.skuSpecName = obj.skuSpecName || obj.skcSpecName;
        }
        if (obj.platformSubject === 'tiktok') {
          // tiktok的属地定死
          obj.countryName = 'CHINA';
          // 关键属性，“主属性”-“次属性”；
          obj.keyAttributes = obj.skcSpecName + '-' + obj.skuSpecName;
          obj.itemNumber = '货号：' + obj.lapaSku;
        }
        return obj;
      });
      if (!printList.length) {
        this.$Message.error('打印数量为0!');
        return;
      }
      let platformSubject = printList[0].platformSubject;
      if (!platformSubject) {
        this.$Message.error('标签平台不存在~');
        return;
      }
      let tagSzie = {
        tiktok: {
          size: {
            width: 70,
            height: 20,
            unit: 'mm',
          },
          replaceKey: {
            tagType: "platformSubject", // 标签类型 platformId
            barcode: "barCode", // 条码，Number、String
            leftTop: "barCode", // 条码左上角
            rightTop: "platformSku", // 条码右上角
            leftBottom: "keyAttributes", // 条码左下角
            rightBottom: "countryName", // 条码右下角
            rightBottomSubjoinTxt: "MADE IN", // 条码右下角附加值
            leftFourLine: "itemNumber", // 条码第四行左下角
          }
        },
        temu: {
          size: {
            width: 70,
            height: 20,
            unit: 'mm',
          },
          replaceKey: {
            tagType: 'platformSubject', // 标签类型 platformId
            barcode: 'barCode', // 条码，Number、String
            leftTop: 'lapaSku', // 条码左上角
            middleTop: 'skcSpecName', // 条码正上(即条码中间上方)
            rightTop: 'skuSpecName', // 条码右上角
            leftBottom: 'platformSku', // 条码左下角
            middleBottom: '', // 条码正下(即条码中间下方)
            rightBottom: 'countryName', // 条码右下下角
            rightBottomSubjoinTxt: 'Made In' // 右下角附加值
          }
        },
        shein: {
          size: {
            width: 70,
            height: 20,
            unit: 'mm',
          },
          replaceKey: {
            tagType: 'platformSubject', // 标签类型 platformId
            barcode: 'barCode', // 条码，Number、String
            leftTop: 'supplierItem', // 条码左上角
            middleTop: '', // 条码正上(即条码中间上方)
            rightTop: '', // 条码右上角
            rightTopSubjoinTxt: 'Made In', // 右上角附加值
            rightTopDefaultTxt: 'China', // 当右上角数据为空时，使用该值替补
            // leftBottom: 'platformSku', // 条码左下角
            leftBottom: 'productSkcId', // 条码左下角
            middleBottom: '', // 条码正下(即条码中间下方)
            rightBottom: 'skuSpecName', // 条码右下下角
          }
        },
      }
      let tagOption = tagSzie[platformSubject];
      if (!tagOption) {
        this.$Message.error(`未新增${platformSubject}平台标签配置!`);
        return;
      }
      this.beingCreatePrint = true;
      this.$common.promiseAll(printList.map(k => {
        return () => {
          return new Promise((resolve) => {
            getPrintHtml(k, tagOption).then((res) => {
              resolve({ ...res, printNumber: k.printNumber });
            })
          })
        }
      })).then((list) => {
        let tagViewHtml = [];
        list.forEach(res => {
          if (!res.success || this.$common.isEmpty(res.data)) return;
          const printQuantity = Number(res.printNumber);
          (res.data).forEach(item => {
            for (let index = 0; index < printQuantity; index++) {
              tagViewHtml.push(item);
            }
          });
        })
        if (!tagViewHtml.length) {
          this.$Message.error('标签生成异常~');
          this.beingCreatePrint = false;
          return;
        }
        let fun = (index) => {
          let printList = tagViewHtml.slice(index * 40, (index + 1) * 40);
          if (!printList.length) {
            this.beingCreatePrint = false;
            if (!this.isCloseModal) {
              this.$store.commit('printSkuModal', false);
            }
            return;
          }
          this.printTag(printList).finally(() => {
            index++;
            fun(index);
          });
        }
        fun(0);
      }).catch((err) => {
        this.beingCreatePrint = false;
        throw new Error(err);
      })
    },
    // 打印标签
    printTag(list) {
      return new Promise(resolve => {
        let allTagHtml = '';
        list.forEach((item, index) => {
          allTagHtml = `${allTagHtml}${item.printHtml}`;
        })
        // 将 html 放到 html 文档中
        allTagHtml = `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>标签打印</title>
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body{
            font-size: 0;
          }
          img {
            vertical-align: top;
          }
        </style>
        <body>${allTagHtml}</body>
      </html>`;
        printCommon.htmlPrint(allTagHtml).then((res) => {
          // console.log(res);
        }).finally(() => {
          resolve('finish');
        })
      })
    },
    changeTable(data) {
      this.checkData = data.map(i => {
        return i.productGoodsId;
      });
    },
    // 删除选中
    batchDelete() {
      let i = this.data.length;
      while (i--) {
        if (this.checkData.indexOf(this.data[i].productGoodsId) > -1) {
          this.data.splice(i, 1);
        }
      }
      this.checkData = [];
    },
    visibleChange(n) {
      this.$nextTick(() => {
        if (!n) {
          this.$store.commit('printSkuModal', false);
        } else {
          this.setPrintView();
          this.disabledPrint = false;
          this.printAmount = 1;

          let printData = this.deepCopy(this.printSkuObj);
          this.data = printData;
          this.thirdLabel = !!printData.filter(k => k.barCode).length;// 打印内容是否有条码编码

          this.checkData = this.data.map(i => i.productGoodsId); // 默认选中；删除用
          this.data.forEach(val => {
            if (val._printNumber) {
              val.notReceivingNumber = val._printNumber; // 直接设置打印数量
            } else {
              let value = val.expectedNumber - val.doneNumber;
              value = value < 1 ? 1 : value;
              val.notReceivingNumber = value;
            }
            // 兼容之前代码
            if (val.barcode) {
              val.skuBarcode = val.barcode;
            }
            val._checked = true; // 默认选中
            val.editPosition = !!(!val.cargoSpace || val.cargoSpace === '--');
            val.editSize = !val.goodsAttributes;
            if (!val.cargoSpace) {
              val.cargoSpace = '---';
            }
          });
          // if (this.data && this.data[0]) {
          //   this.$refs.printBox.setInitData(JSON.parse(JSON.stringify(this.data[0])));
          // }
          $.ajax({
            type: 'post',
            url: 'http://localhost:10099/check',
            jsonpCallback: 'checkHandler',
            dataType: 'jsonp',
            jsonp: 'callback',
            success: () => {
              this.downPrintControl = true;
            },
            error: () => {
              this.downPrintControl = false;
              let url = this.$store.state.erpConfig.filenodeViewTargetUrl + '/wms-service/tool/TongtoolPrinter.exe';
              this.$Modal.info({
                width: 400,
                content: `请下载打印控件<a href=${url}>点击下载</a>`
              });
            }
          });
        }
      });
    },
    uniteSetAmount(num) {
      this.$nextTick(() => {
        this.data.forEach(val => {
          this.$set(val, 'notReceivingNumber', num);
        });
        let data = JSON.parse(JSON.stringify(this.data));
        this.data = [];
        this.data = data;
      });
    },
    printSKUFn(callback) {
      let obj = null;
      // 拆包
      if (this.printType === 'all') {
        obj = {
          paramList: this.data.map(val => ({
            cargoSpace: val.cargoSpace
              ? val.cargoSpace
              : null,
            goodsAttributes: val.goodsAttributes
              ? val.goodsAttributes
              : null,
            qualityCheckGoodsId: val.qualityCheckGoodsId
          }))
        };
      } else {
        obj = {
          paramList: this.data.map(val => ({
            cargoSpace: val.editPosition
              ? val.cargoSpace
              : null,
            goodsAttributes: val.editSize
              ? val.goodsAttributes
              : null,
            qualityCheckGoodsId: val.qualityCheckGoodsId
          }))
        };
      }
      obj.qualityCheckParcelId = this.$store.state.parcelIdAndProcurId.qualityCheckParcelId; // 包裹id
      obj.qualityCheckProcurementId = this.$store.state.parcelIdAndProcurId.qualityCheckProcurementId; // 采购单id
      this.axios.post(api.create, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('打印成功');
          this.$emit('printsuccess', obj);
          if (typeof callback === 'function') {
            callback();
          }
          if (!localStorage.getItem('noAutoClosePrintModal') || localStorage.getItem('noAutoClosePrintModal') === '0') {
            // 自动关闭
            this.$store.commit('printSkuModal', false);
          }
        }
      });
    },
    entityToString(entity) {
      /**
       * 转html实体
       * */
      let div = document.createElement('div');
      div.innerHTML = entity;
      return div.innerText || div.textContent;
    },
    uploadToControl() {
      if (this.printSource === 'receipt') {
        // 收货并打印  先收货拿库位批次再打印
        this.$Spin.show();
        this.$parent.receipt(false, this.data).then((data) => {
          this.data.forEach(i => {
            data.receptList.forEach(data => {
              if (data.receiptNo === i.receiptNo) {
                data.receiptBatchNos.forEach(j => {
                  for (let key in j) {
                    if (i.productGoodsId === key) {
                      i.receiptBatchNo = j[key];
                    }
                  }
                });
                i.warehouseLocationName = data.warehouseLocationName;
                i.warehouseLocationNameBarCode = data.warehouseLocationNameBarCode;
              }
            })
          });
          let printData = this.data.map(i => {
            i.printNumber = i.notReceivingNumber; // 打印数量
            if (i.skuBarcode) {
              i.skuBarcode = this.entityToString(i.skuBarcode);
            } else if (i.barcode) {
              i.skuBarcode = this.entityToString(i.barcode);
            }
            return i;
          });

          // (收货，上架，质检，入库单)存在第三方标签且勾选情况下打印第三方标签，否则按原流程打印LAPA标签
          if (!['inventory'].includes(this.printSource) && this.thirdLabel) {
            this.thirdLabelPrint();
          } else {
            this.$refs.printBox.onPrint(printData).then(() => {
              if (!this.isCloseModal) {
                this.$store.commit('printSkuModal', false);
              }
            });
          }
        });
      } else {
        let printData = this.data.map(i => {
          if (i.skuBarcode) {
            i.skuBarcode = this.entityToString(i.skuBarcode);
          } else if (i.barcode) {
            i.skuBarcode = this.entityToString(i.barcode);
          }
          i.printNumber = i.notReceivingNumber; // 打印数量
          return i;
        });

        // (收货，上架，质检，入库单)存在第三方标签且勾选情况下打印第三方标签，否则按原流程打印LAPA标签
        if (!['inventory'].includes(this.printSource) && this.thirdLabel) {
          this.thirdLabelPrint();
        } else {
          this.$refs.printBox.onPrint(printData).then(response => {
            if (response.status === 200) {
            } else {
              this.data.forEach(i => {
                i.iSClOSE = !this.isCloseModal;
              });
              this.$emit('printEnd', this.data);
              if (!this.wherePrintPage) {
                //              this.printSKUFn() //数据库改状态
                this.disabledPrint = true;
              } else {
                // this.$store.commit('printSkuModal', false)
                this.disabledPrint = true;
              }
            }
            if (!this.isCloseModal) {
              this.$store.commit('printSkuModal', false);
            }
          });
        }
      }
    }, // 获取后台条码
    getBarCodeFn() {
      let arr = '';
      if (this.printType === 'single') {
        arr = this.data.map(val => val.goodsSku);
      } else {
        arr = this.data.map(val => val.goodsSku);
      }
      return new Promise((resolve, reject) => {
        this.axios.post(api.getBarCode, arr).then(res => {
          var skuvaild = false;
          if (res.data.code === 0) {
            this.data.forEach(val1 => {
              res.data.datas.forEach(val2 => {
                let key = Object.getOwnPropertyNames(val2)[0];
                if (val1.goodsSku === key) {
                  let value = val2[key]
                    ? val2[key]
                    : '';
                  this.$set(val1, 'barcode', value);
                }
              });
            });
            this.data.forEach(item => {
              if (item.barcode === '' || item.barcode === null || item.barcode === undefined) {
                skuvaild = true;
              }
            });
            if (skuvaild) {
              this.$Message.error({
                content: '条形码未生成成功，请重新点击打印。', // 条形码未生成成功，请重新点击打印。
                duration: 5
              });
            } else {
              resolve();
            }
          }
        });
      });
    },
    cancelSku() {
      this.disabledPrint = false;
      this.$store.commit('printSkuModal', false);
    }
  },
  // watch: {
  //   '$store.state.printSkuModal': function (bool) {
  //   }
  // }
};
</script>
<style lang="less">
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center2 {
  position: absolute;
  top: 28%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.distanceArea .ivu-form-item {
  margin-bottom: 3px;
}

.skuPrintM {
  .ivu-modal {
    margin-top: -88px;
  }

  .ivu-card-body {
    padding: 16px 0;
  }

  .ivu-table-wrapper {
    border: 0;
  }

  .ivu-table:after {
    background-color: #fff;
  }
}

.skuFontCenter {
  position: absolute;
  top: 0%;
  left: 50%;
  transform: translate(-50%, 0%);
}

.skuPrintForm .ivu-form-item:nth-child(1),
.skuPrintForm .ivu-form-item:nth-child(2) {
  margin-bottom: 10px;
}

.ivu-input-group-append,
.ivu-input-group-prepend {
  background-color: #fff;
}

.setting-size-item {
  padding-bottom: 10px;
}

.printSkuCode_printBtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: #f2f2f2;

  .printSkuCode_printBtn_numset {
    display: flex;
    align-items: center;
  }
}
</style>
