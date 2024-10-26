<template >
  <div>
    <!-- 结束作业 -->
    <Modal v-model="isFinish" v-if="isFinishStatus" width="1200" title="拣货复核-结束作业" :styles="{ top: '100px' }">
      <!-- 无异常 -->
      <div v-if="endStatus">
        <div
          style="height:60px;paddingLeft:10px;marginBottom:20px;border:1px solid #ccc;background:#ffffcc;lineHeight:60px;font-size:16px;font-weight:bold;">
          {{ '您即将结束拣货单 {pickingGoodsNo} 的拣货复核'.replace('{pickingGoodsNo}', pickingGoodsNo) }}
        </div>
        <Table border height="138" :columns="countDataColumn" :data="countData"></Table>
        <div style="marginTop:20px;">
          {{ '共 {scannedCount} 人参与本次拣货复核'.replace('{scannedCount}', scannedCount) }}
          ，
          {{ '包装总时间 {scannedTime} 分钟'.replace('{scannedTime}', scannedTime) }}
          ，
          {{ '总计(人.时) {userScannedTime} 分钟'.replace('{userScannedTime}', userScannedTime) }}
        </div>
        <Table border :columns="userDataColumn" :data="userData"></Table>
      </div>
      <!-- 有异常 -->
      <div v-if="!endStatus">
        <div
          style="height:60px;paddingLeft:10px;marginBottom:20px;border:1px solid #ccc;background:#ffffcc;lineHeight:60px;font-size:16px;font-weight:bold;">
          {{ '您即将结束拣货单 {pickingGoodsNo} 的拣货复核，但系统检测到以下异常'.replace('{pickingGoodsNo}', pickingGoodsNo) }}：
        </div>
        <div v-if="printData.length > 0" style="height:320px;border:1px solid #ccc;background:#d6e9f2;marginTop:20px;">
          <Row>
            <Col span="15" style="marginLeft:10px;">
            <Row>
              <Col span="20">
              <span style="color:#ff0000;">以下包裹货品已扫描但包裹正在打印中</span>
              </Col>
              <Col span="4">
              <span style="cursor:pointer;" @click="importExcel(0)">保存为Excel</span>
              </Col>
            </Row>
            <dTable border height="200" :columns="printDataColumn" :data="printData"></dTable>
            </Col>
            <Col span="8" style="marginLeft:20px;">
            <span style="cursor:pointer;" @click="importExcel(1)">保存为Excel</span>
            <Table border height="200" :columns="printGoodsDataColumn" :data="printGoodsData"></Table>
            </Col>
          </Row>
          <div style="marginTop:20px;marginLeft:10px;fontSize:14px;">
            <div>通常因打印机信息返回异常导致，需要人工确认地址标签是否已经正常打印。</div>
            <div>如果您标记为已打印，强制结束拣货复核时将认为这些包裹已经正常包装，包裹无法再生成新的拣货单。</div>
            <div>如果您标记为未打印，强制结束拣货复核时将认为这些包裹未打印包装，系统将把这些包裹从拣货单中移除，您可以重新生成新的拣货单。</div>
          </div>
        </div>
        <div v-if="cancelData.length > 0" style="height:320px;border:1px solid #ccc;background:#d6e9f2;marginTop:20px;">
          <Row>
            <Col span="15" style="marginLeft:10px;">
            <Row>
              <Col span="20">
              <span style="color:#ff0000;">以下包裹尚未打印或包裹打印前被作废</span>
              </Col>
              <Col span="4">
              <span style="cursor:pointer;" @click="startImportExcel(0)">保存为Excel</span>
              </Col>
            </Row>
            <Table border height="200" :columns="cancelDataColumn" :data="cancelData"></Table>
            </Col>
            <Col span="8" style="marginLeft:20px;">
            <span style="cursor:pointer;" @click="startImportExcel(1)">保存为Excel</span>
            <Table border height="200" :columns="cancelGoodsDataColumn" :data="cancelGoodsData"></Table>
            </Col>
          </Row>
          <div style="marginTop:20px;marginLeft:10px;fontSize:14px;">
            <div>强制结束拣货复核时未打印包裹将从拣货单中移除，再次生成新的拣货单。</div>
            <div>拣货单打印之后，地址标签打印之前，包裹被作废，将会导致拣货的实物货品剩余。</div>
            <div>正常情况下，本项货品汇总应与您手中的货品实物一致。</div>
          </div>
        </div>
        <div v-if="cancelPrintData.length > 0"
          style="height:320px;border:1px solid #ccc;background:#d6e9f2;marginTop:20px;">
          <Row>
            <Col span="15" style="marginLeft:10px;">
            <Row>
              <Col span="20">
              <span style="color:#ff0000;">以下包裹打印之后被作废</span>
              </Col>
              <Col span="4">
              <span style="cursor:pointer;" @click="endImportExcel(0)">保存为Excel</span>
              </Col>
            </Row>
            <Table border height="200" :columns="cancelPrintColumn" :data="cancelPrintData"></Table>
            </Col>
            <Col span="8" style="marginLeft:20px;">
            <span style="cursor:pointer;" @click="endImportExcel(1)">保存为Excel</span>
            <Table border height="200" :columns="cancelPrintGoodsColumn" :data="cancelPrintGoodsData"></Table>
            </Col>
          </Row>
          <div style="marginTop:20px;marginLeft:10px;fontSize:14px;">
            <div>地址标签打印后，包裹被作废，会导致包裹被正常包装，建议立即拦截，并在[回收包裹]中进行确认。</div>
          </div>
        </div>
        <!--打印未拣货/打印出库单明细-->
        <div>
          <p class="red title">未拣货/打印出库单明细
            <Button type="primary" class="ml10" @click="PrintDistributionList">打印配货清单 </Button>
          </p>
          <Table border :columns="columns" :data="data"></Table>
        </div>
      </div>
      <div slot="footer">
        <Button v-if="endStatus" type="primary" @click="finishPackWork(0)">结束作业 </Button>
        <Button v-if="!endStatus" type="error" @click="finishPackWork(1)">强制结束 </Button>
        <Button v-if="!endStatus" type="primary" @click="backPacking">返回继续包装 </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import tableMixin from '@/components/mixin/table_mixin';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin, tableMixin],
  props: {
    pickingGoodsNo: {
      type: String,
      default() {
        return null;
      },
    },
    pickingGoodsId: {
      type: String,
      default() {
        return null;
      },
    },
    currentPackageData: {
      type: Array,
      default() {
        return [];
      },
    },
    packageList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  // props: ['pickingGoodsNo', 'pickingGoodsId', 'currentPackageData'],
  data() {
    let v = this;
    return {
      original_data: [],
      row_packageCode: [],
      columns: [
        {
          title: '出库单号',
          key: 'packageCode'
        }, {
          title: 'SKU',
          key: 'sku'
        }, {
          title: '分配数量',
          key: 'doneAssignedNumber'
        }, {
          title: '库位',
          key: 'wmsLocationList',
          render(h, params) {
            let arr = params.row.wmsLocationList && params.row.wmsLocationList.length > 0
              ? params.row.wmsLocationList
              : [];
            return h('div', {}, arr.map(i => h('span', i)));
          }
        }, {
          title: '已扫描数量',
          key: 'actualPickingNumber',
          render(h, params) {
            return h('InputNumber', {
              props: {
                value: 0,
                min: 0,
                max: v.data[params.index].doneAssignedNumber
              },
              on: {
                'on-change'(value) {
                  v.data1[params.index].actualPickingNumber = value;
                  v.data2[params.row.packageGoodsId] = value;
                  v.data[params.index].unselectedQuantity = v.data[params.index].doneAssignedNumber - v.data1[params.index].actualPickingNumber;
                }
              }
            });
          }
        }, {
          title: '未拣数量',
          key: 'unselectedQuantity'
        }
      ],
      data: [],
      data1: [],
      data2: {},
      isFinish: false,
      isFinishStatus: false,
      endStatus: false, // 控制展示显示正常结束信息或是异常结束信息
      countData: [// 结束作业无异常 统计项目数据
        {
          countName: '已完成包装包裹总数',
          allPackTotalCount: null,
          packedCount: null
        }, {
          countName: '已完成包装货品总数',
          allPackTotalCount: null,
          packedCount: null
        }
      ],
      countDataColumn: [
        {
          title: '统计项目',
          key: 'countName',
          align: 'center'
        }, {
          title: '拣货单数量',
          key: 'allPackTotalCount',
          align: 'center'
        }, {
          title: '实际完成数量',
          key: 'packedCount',
          align: 'center'
        }
      ],
      scannedCount: null, // 本次拣货复核人数
      scannedTime: null, // 总时间
      userScannedTime: null, // 人工时
      userData: [], // 扫描员扫描详情
      userDataColumn: [
        {
          title: '作业人',
          key: 'userId',
          align: 'center',
          render: (h, params) => {
            let list = this.userList;
            if (list) {
              return h('span', list[params.row.userId].userName);
            }
          }
        }, {
          title: '包裹总数',
          key: 'packageTotalCount',
          align: 'center'
        }, {
          title: '货品总数',
          key: 'goodsTotalCount',
          align: 'center'
        }, {
          title: '作业时长(分钟)',
          key: 'scannedTime',
          align: 'center'
        }, {
          title: '包裹速度(每分钟)',
          key: '',
          align: 'center',
          render: (h, params) => {
            let num = params.row.packageTotalCount / params.row.scannedTime;
            return h('div', num.toFixed(2));
          }
        }, {
          title: '货品速度(每分钟)',
          key: '',
          align: 'center',
          render: (h, params) => {
            let num = params.row.goodsTotalCount / params.row.scannedTime;
            return h('div', num.toFixed(2));
          }
        }
      ],
      printChioseData: [], // 已打印包裹code
      unPrintChioseData: [], // 未打印包裹code
      rowChioseNum: 1,
      headChioseNum: 1,
      printData: [], // 结束作业有异常 正在打印中的数据
      printDataColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center'
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center'
        }, {
          title: '收件人',
          key: 'buyerName',
          align: 'center'
        }, {
          title: '扫描时间',
          key: 'scannedTime',
          align: 'center',
          render: (h, params) => {
            let date = this.$uDate.dealTime(params.row.scannedTime);
            return h('div', date);
          }
        }, {
          title: '操作',
          width: 150,
          align: 'center',
          renderHeader: (h, params) => {
            return h('RadioGroup', {
              props: {
                value: this.headChioseNum
              },
              on: {
                'on-change': value => {
                  this.allChiose(value);
                }
              }
            }, [
              h('Radio', {
                style: {
                  color: '#378000'
                },
                props: {
                  label: 1
                }
              }, '全选'), h('Radio', {
                style: {
                  color: '#ff0000'
                },
                props: {
                  label: 0
                }
              }, '全选')
            ]);
          },
          render: (h, params) => {
            return h('RadioGroup', {
              props: {
                value: this.rowChioseNum
              },
              on: {
                'on-change': value => {
                  this.rowChiose(value, params.index);
                }
              }
            }, [
              h('Radio', {
                style: {
                  color: '#378000'
                },
                props: {
                  label: 1
                }
              }, '已打'), h('Radio', {
                style: {
                  color: '#ff0000'
                },
                props: {
                  label: 0
                }
              }, '未打')
            ]);
          }
        }
      ],
      printGoodsData: [], // 正在打印中的货品小计
      printGoodsDataColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '货品小计',
          key: 'sku',
          align: 'center'
        }, {
          title: '数量',
          key: 'quantity',
          align: 'center'
        }
      ],
      cancelData: [], // 打印前作废的包裹信息
      cancelDataColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center'
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center'
        }, {
          title: '收件人',
          key: 'buyerName',
          align: 'center'
        }, {
          title: '货品信息',
          key: '',
          align: 'center',
          render: (h, params) => {
            let pos = [];
            if (this.cancelGoodsData) {
              this.cancelGoodsData.forEach((n, i) => {
                if (n.packageCode === params.row.packageCode) {
                  let item = h('div', [h('div', n.sku + ' * ' + n.quantity)]);
                  pos.push(item);
                }
              });
              return h('div', pos);
            }
          }
        }
      ],
      cancelGoodsData: [], // 打印前作废sku
      cancelGoodsDataColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '货品小计',
          key: 'sku',
          align: 'center'
        }, {
          title: '数量',
          key: 'quantity',
          align: 'center'
        }
      ],
      cancelPrintData: [], // 打印后作废的包裹信息
      cancelPrintColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '出库单号',
          key: 'packageCode',
          align: 'center'
        }, {
          title: '运单号',
          key: 'trackingNumber',
          align: 'center'
        }, {
          title: '收件人',
          key: 'buyerName',
          align: 'center'
        }, {
          title: '货品信息',
          key: '',
          align: 'center',
          render: (h, params) => {
            let pos = [];
            if (this.cancelPrintData) {
              this.cancelPrintData.forEach((n, i) => {
                if (n.packageCode === params.row.packageCode) {
                  let item = h('div', [h('div', n.sku + ' * ' + n.quantity)]);
                  pos.push(item);
                }
              });
              return h('div', pos);
            }
          }
        }
      ],
      cancelPrintGoodsData: [], // 打印后作废的sku
      cancelPrintGoodsColumn: [
        {
          title: 'NO',
          width: 60,
          align: 'center',
          fixed: 'left',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '货品小计',
          key: 'sku',
          align: 'center'
        }, {
          title: '数量',
          key: 'quantity',
          align: 'center'
        }
      ],
      userList: [] // 作业人
    };
  },
  methods: {
    PrintDistributionList() {
      /**
       * 打印配货清单
       * */
      let v = this;
      let obj = {
        packageCodeList: v.data.map(i => i.packageCode),
        warehouseId: v.getWarehouseId()
      };
      v.$Spin.show();
      v.axios.post(api.queryDeliveryListPath, obj).then(response => {
        v.$Spin.hide();
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.every((n, i) => {
            let jsonObj = {
              pdf: n.deliveryListLabelPath,
              postId: n.packageCode
            };
            v.startPrint(jsonObj, n.packageCode);
            return true;
          });
        }
      });
    },
    normalData() {
      // 获取正常的结束展示信息
      let v = this; // countData
      let pos = [];
      v.axios.get(api.get_statisticsPack + v.pickingGoodsId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          // console.log(data);
          v.countData[0].allPackTotalCount = data.packageTotalCount; // 拣货单所有包裹数量
          v.countData[0].packedCount = data.packedPackageCount; // 拣货单已完成拣货复核包裹数量
          v.countData[1].allPackTotalCount = data.goodsTotalCount; // 拣货单所有货品总数
          v.countData[1].packedCount = data.packedGoodsCount; // 拣货单完成扫描货品数量
          v.scannedCount = data.scannedCount; // 本次拣货复核人数
          v.scannedTime = data.scannedTime; // 包装总时间
          v.userScannedTime = data.userScannedTime; // 人工时
          data.scannerDetails.forEach((n, i) => {
            pos.push(n.userId);
          });
          if (pos.length > 0) {
            Promise.resolve(v.getUserInfoMap(pos)).then(result => {
              v.userData = data.scannerDetails; // 扫描员扫描详情
            });
          }
        }
      });
    },
    abnormalData() {
      // 获取异常的结束展示信息
      let v = this;
      v.row_packageCode = [];
      v.axios.get(api.get_warnPackages + v.pickingGoodsId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.printData = data.printingPackages; // 打印中的包裹信息
          v.printGoodsData = data.printingSkus; // 打印中的sku
          v.cancelData = data.unprintPackages; // 作废的的包裹信息
          v.cancelGoodsData = data.unprintSkus; // 作废的的包裹sku
          v.cancelPrintData = data.invalidPackages; // 打印后作废的包裹
          v.cancelPrintGoodsData = data.invalidSkus; // 打印后作废的sku
          v.data = data.waitPrintSuccessSkus.map(i => {
            i.unselectedQuantity = i.doneAssignedNumber;
            // v.currentPackageData.forEach(j => {
            //   if (i.sku === j.sku) {
            //     i.unselectedQuantity = i.doneAssignedNumber - j.scanQuantity;
            //   }
            // });
            return i;
          }).filter(i => i.unselectedQuantity > 0); // 未拣货/打印出库单明细
          v.original_data = v.data;
          v.data1 = data.waitPrintSuccessSkus.map(i => {
            return {
              packageGoodsId: i.packageGoodsId,
              actualPickingNumber: 0
            };
          }); // 未拣货/打印出库单明细
          let new_data = [];
          if (v.headChioseNum === 1) {
            let packageCode_arr = [];
            v.printData.map((ele) => {
              packageCode_arr.push(ele.packageCode);
            });

            v.data.map((item) => {
              if (packageCode_arr.indexOf(item.packageCode) <= -1) {
                new_data.push(item);
              }
            });
          }
          v.data = new_data;
        }
      });
    },
    allChiose(val) {
      let v = this;
      // 先清空，防止点全选前点过单个
      v.printChioseData = [];
      v.unPrintChioseData = [];
      v.headChioseNum = val;
      if (val) {
        // 0未打 1已打
        v.rowChioseNum = 1;
        let pos = [];
        v.printData.forEach((n, i) => {
          pos.push(n.packageCode);
        });
        v.printChioseData = pos;

        let new_data = [];
        if (v.headChioseNum === 1) {
          let packageCode_arr = [];
          v.printData.map((ele) => {
            packageCode_arr.push(ele.packageCode);
          });

          v.original_data.map((item) => {
            if (packageCode_arr.indexOf(item.packageCode) <= -1) {
              new_data.push(item);
            }
          });
        }
        v.data2 = {};
        v.data = new_data;
      } else {
        v.rowChioseNum = 0;
        let box = [];
        v.printData.forEach((n, i) => {
          box.push(n.packageCode);
        });
        v.unPrintChioseData = box;
        v.data = v.original_data;
      }
    },
    rowChiose(val, index) {
      let v = this;
      // 判断是否点过全选，若有则需改值和状态
      if (v.headChioseNum !== null) {
        if (val !== v.headChioseNum) {
          v.headChioseNum = null;
        } else {
          return false;
        }
      }
      if (val) {
        // 0未打 1已打
        v.printChioseData.push(v.printData[index].packageCode);
        // 若当前code为已打，则需判断未打中是否有这个code，有则移除（改变状态时用到）
        if (v.unPrintChioseData.indexOf(v.printData[index].packageCode) !== -1) {
          let pid = v.unPrintChioseData.indexOf(v.printData[index].packageCode);
          v.unPrintChioseData.splice(pid, 1);
        }

        let new_data = [];
        v.row_packageCode.push(v.printData[index].packageCode);
        v.original_data.map((item) => {
          if (v.row_packageCode.indexOf(item.packageCode) <= -1) {
            new_data.push(item);
          }
        });
        v.data2 = {};
        v.data = new_data;
      } else {
        v.original_data.map((item) => {
          if (item.packageCode === v.printData[index].packageCode) {
            v.data.push(item);
            v.row_packageCode.splice(index, 1);
          }
        });
        v.unPrintChioseData.push(v.printData[index].packageCode);
        // 若当前code为未打，则需判断已打中是否有这个code，有则移除（改变状态时用到）
        if (v.printChioseData.indexOf(v.printData[index].packageCode) !== -1) {
          let uid = v.printChioseData.indexOf(v.printData[index].packageCode);
          v.printChioseData.splice(uid, 1);
        }
      }
      if (v.printChioseData.length === v.printData.length) {
        v.headChioseNum = 1;
      } else if (v.unPrintChioseData.length === v.printData.length) {
        v.headChioseNum = 0;
      }
    },
    finishPackWork(type) {
      // 结束作业
      let v = this;
      let obj;
      if (v.headChioseNum === 1) {
        let pos = [];
        v.printData.forEach((n, i) => {
          pos.push(n.packageCode);
        });
        v.printChioseData = pos;
      }
      if (type) {
        // 有异常 强制结束
        let new_arr = [];
        if (v.data) {
          v.data.map((item) => {
            new_arr.push({
              packageGoodsId: item.packageGoodsId,
              actualPickingNumber: v.data2[item.packageGoodsId] || 0
            });
          });
        }
        obj = {
          pickingGoodsId: v.pickingGoodsId,
          printPackageCodes: v.printChioseData,
          unprintPackageCodes: v.unPrintChioseData,
          updateActualPickingNumBoList: new_arr
          // updateActualPickingNumBoList: v.data1
        };
      } else {
        // 无异常
        obj = {
          pickingGoodsId: v.pickingGoodsId,
          printPackageCodes: [],
          unprintPackageCodes: []
        };
      }
      if (v.data.length > 0) {
        let new_arr = v.handerGrouping(v.data, function (item) {
          return [item.packageCode]; // 可添加多个属性
        }, 'packageCode');
        let unselectedQuantity_arr = [];
        if (new_arr.length > 0) {
          new_arr.map((ele) => {
            if (ele.data.length > 0) {
              ele.data.map((talg) => {
                if (talg.unselectedQuantity > 0) {
                  unselectedQuantity_arr.push(talg);
                }
              });
            }
          });
        }
        if (unselectedQuantity_arr.length <= 0) {
          v.$Message.error({
            content: '同一个出库单中未拣数量至少要有一个是大于0',
            duration: 4
          });
          return false;
        }
      }
      // // 处理增值服务
      // let unPickingPackageList = v.data.filter(k => {
      //   return !(k.unselectedQuantity <= 0);
      // }).map(k => k.packageCode)
      // let addItemList = [];
      // this.packageList.forEach((item) => {
      //   // 异常包裹不需要记录增值服务数据
      //   if (unPickingPackageList.includes(item.packageCode)) return;
      //   item.skus.forEach((skuItem) => {
      //     let vacuumizeNumber = skuItem.vacuumizeNumber || 0;
      //     let replacePackingNumber = skuItem.replacePackingNumber || 0;
      //     if (vacuumizeNumber > 0 || replacePackingNumber > 0) {
      //       addItemList.push({
      //         packageId: item.packageId,
      //         productGoodsId: skuItem.productGoodsId,
      //         vacuumizeNumber: skuItem.vacuumizeNumber,
      //         replacePackingNumber: skuItem.replacePackingNumber,
      //       })
      //     }
      //   })
      // })
      // addItemList.length && (obj.skuValueAddedServiceList = addItemList);
      // console.log(obj, 'obj', this.packageList, v.data2, v.data);
      // return;
      v.axios.put(api.confirm_finishPaxking, obj).then(response => {
        if (response.data.code === 0) {
          window.location.href = `//${window.location.host}/wms-service/wms.html#/packWorking?warehouseId=${v.getWarehouseId()}`;
          v.printChioseData = [];
          v.unPrintChioseData = [];
        }
      });
    },
    backPacking() {
      // 返回继续包装
      let v = this;
      v.isFinish = false;
      v.headChioseNum = 1;
      v.rowChioseNum = 1;
      v.printChioseData = [];
      v.unPrintChioseData = [];
    },
    importExcel(val) {
      // 正在打印 导出
      let v = this;
      let obj = {};
      let filenodeViewTargetUrl = localStorage.getItem('imgUrlPrefix');
      if (val) {
        // printGoodsData
        if (!v.printGoodsData) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '货品小计',
            column: 'goodsTotal'
          }, {
            title: '数量',
            column: 'goodsNum'
          }
        ];
        let pos = [];
        v.printGoodsData.forEach((n, i) => {
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'goodsTotal',
              content: n.sku
            }, {
              column: 'goodsNum',
              content: n.quantity
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_printingSkuExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      } else {
        // printData
        if (!v.printData.length) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '包裹号',
            column: 'pickNo'
          }, {
            title: '运单号',
            column: 'followNo'
          }, {
            title: '收件人',
            column: 'buyerName'
          }, {
            title: '扫描时间',
            column: 'time'
          }
        ];
        let pos = [];
        // let box = [];
        v.printData.forEach((n, i) => {
          let date = this.$uDate.dealTime(n.scannedTime);
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'pickNo',
              content: n.packageCode
            }, {
              column: 'followNo',
              content: n.trackingNumber
            }, {
              column: 'buyerName',
              content: n.buyerName
            }, {
              column: 'time',
              content: date
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_printingExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      }
    },
    startImportExcel(val) {
      // 打印前作废 导出
      let v = this;
      let obj = {};
      let filenodeViewTargetUrl = localStorage.getItem('imgUrlPrefix');
      if (val) {
        // cancelGoodsData
        if (!v.cancelGoodsData) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '货品小计',
            column: 'goodsTotal'
          }, {
            title: '数量',
            column: 'goodsNum'
          }
        ];
        let pos = [];
        v.cancelGoodsData.forEach((n, i) => {
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'goodsTotal',
              content: n.sku
            }, {
              column: 'goodsNum',
              content: n.quantity
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_unPrintSkuExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      } else {
        // cancelData
        if (!v.cancelData.length) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '包裹号',
            column: 'pickNo'
          }, {
            title: '运单号',
            column: 'followNo'
          }, {
            title: '收件人',
            column: 'buyerName'
          }, {
            title: '货品信息',
            column: 'goodsMes'
          }
        ];
        let pos = [];
        let box = [];
        v.cancelData.forEach((n, i) => {
          if (v.cancelGoodsData) {
            v.cancelGoodsData.forEach((v, p) => {
              if (v.packageCode === n.packageCode) {
                let item = v.sku + ' * ' + v.quantity;
                box.push(item);
              }
            });
          }
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'pickNo',
              content: n.packageCode
            }, {
              column: 'followNo',
              content: n.trackingNumber
            }, {
              column: 'buyerName',
              content: n.buyerName
            }, {
              column: 'goodsMes',
              content: box.toString()
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_unPrintExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      }
    },
    endImportExcel(val) {
      // 打印后作废 导出
      let v = this;
      let obj = {};
      let filenodeViewTargetUrl = localStorage.getItem('imgUrlPrefix');
      if (val) {
        // cancelPrintGoodsData
        if (!v.cancelPrintGoodsData) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '货品小计',
            column: 'goodsTotal'
          }, {
            title: '数量',
            column: 'goodsNum'
          }
        ];
        let pos = [];
        v.cancelPrintGoodsData.forEach((n, i) => {
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'goodsTotal',
              content: n.sku
            }, {
              column: 'goodsNum',
              content: n.quantity
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_invalidSkuExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      } else {
        // cancelPrintData
        if (!v.cancelPrintData.length) {
          v.$Message.error('no data！');
          return false;
        }
        // 组装数据
        let excelContentList = []; // 数据
        let excelTitleList = [// 表头
          {
            title: 'No',
            column: 'no'
          }, {
            title: '包裹号',
            column: 'pickNo'
          }, {
            title: '运单号',
            column: 'followNo'
          }, {
            title: '收件人',
            column: 'buyerName'
          }, {
            title: '货品信息',
            column: 'goodsMes'
          }
        ];
        let pos = [];
        let box = [];
        v.cancelPrintData.forEach((n, i) => {
          if (v.cancelGoodsData) {
            v.cancelGoodsData.forEach((v, p) => {
              if (v.packageCode === n.packageCode) {
                let item = v.sku + ' * ' + v.quantity;
                box.push(item);
              }
            });
          }
          pos.push([
            {
              column: 'no',
              content: i + 1
            }, {
              column: 'pickNo',
              content: n.packageCode
            }, {
              column: 'followNo',
              content: n.trackingNumber
            }, {
              column: 'buyerName',
              content: n.buyerName
            }, {
              column: 'goodsMes',
              content: box.toString()
            }
          ]);
        });
        pos.forEach((m, t) => {
          excelContentList.push({
            excelColumnContentList: m
          });
        });
        obj = {
          excelContentList: excelContentList,
          excelTitleList: excelTitleList
        };
        let newTab = window.open('about:blank');
        v.axios.post(api.import_invalidExcel, obj).then(response => {
          if (response.data.code === 0) {
            // let newTab = window.open('about:blank');
            newTab.location.href = filenodeViewTargetUrl + response.data.datas;
            setTimeout(function () {
              newTab.close();
            }, 1000);
          } else {
            newTab.close();
          }
        });
      }
    },
    getUserInfoMap(userIds) {
      // 获取分拣人名称
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userList = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    }
  }
};
</script >

<style scoped >
.title {
  padding: 20px 0;
}

.red {
  color: red;
}

.ml10 {
  margin-left: 10px;
}
</style >
