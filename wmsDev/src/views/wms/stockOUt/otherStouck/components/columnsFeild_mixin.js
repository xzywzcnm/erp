/*
  海外仓产品列表表头
*/
import combinationProducts from './combinationProducts.vue';
export default {
  components: { combinationProducts },
  data() {
    return {
      columnFeild: ['goodsSku', 'goodsCnDesc', 'expectedNumber', 'doneAssignedNumber', 'notAssignedNumber', 'actualPickingNumber', 'missNumber', 'pickingDetailStatus', 'skuProductCost'], // 子sku显示字段
      wareColumn: ['warehouseLocationName', 'warehouseLocationId', 'receiptBatchNo', 'inventoryId', 'availableNumber'], // 库位选择赋值字段
    };
  },
  computed: {
    // 表头
    columns() {
      let _self = this;
      let detailData = this.detailData;
      let { pickingType, pickingSubType, labelType } = detailData;
      let fun = {
        // 出库单类型对应的表头字段
        pickingItem: [],
        // 所有的表头
        list: {
          'selection': {
            type: 'selection',
            width: 60,
            align: 'center',
            fixed: 'left'
          },
          'index': {
            title: '行号',
            type: 'index',
            width: 70,
            align: 'center'
          },
          'pickingDetailStatus': {
            title: '行状态',
            slot: 'pickingDetailStatus',
            key: 'pickingDetailStatus',
            width: 90,
            align: 'center'
          },
          'goodsUrl': {
            title: '产品图片',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return this.tableImg(h, params, 'goodsUrl');
            }
          },
          'goodsSku': {
            title: '产品sku',
            align: 'center',
            width: 120,
            key: 'goodsSku'
          },
          'goodsCnDesc': {
            title: '中文描述',
            align: 'center',
            minWidth: 150,
            key: 'goodsCnDesc'
          },
          'expectedNumber': {
            title: '订单数量总数',
            minWidth: 120,
            slot: 'expectedNumber',
            key: 'expectedNumber',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '订单数量总数')
                ]
              )
            }
          },
          'labelName': {
            title: '标签名称',
            align: 'center',
            minWidth: 120,
            slot: 'labelName',
            key: 'labelName',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, _self.isBarn ? '' : '*'),
                  h('span', '标签名称')
                ]
              )
            }
          },
          'skuDesc': {
            title: '备注',
            align: 'center',
            minWidth: 120,
            slot: 'skuDesc',
            key: 'skuDesc'
          },
          'doneAssignedNumber': {
            title: '已分配数量',
            align: 'center',
            width: 120,
            key: 'doneAssignedNumber'
          },
          'notAssignedNumber': {
            title: '未分配数量',
            align: 'center',
            width: 120,
            key: 'notAssignedNumber'
          },
          'actualPickingNumber': {
            title: '已拣货数量',
            align: 'center',
            width: 120,
            key: 'actualPickingNumber'
          },
          'warehouseLocationName': {
            title: '分配库位',
            width: 120,
            align: 'center',
            slot: 'warehouseLocationName',
            key: 'warehouseLocationName'
          },
          'option': {
            title: '操作',
            align: 'center',
            slot: 'option',
            fixed: 'right',
            width: 120
          },
          'missNumber': {
            align: 'center',
            width: 120,
            key: 'missNumber',
            renderHeader: (h, params) => {
              return h('div', {
                style: { color: '#D9001B' }
              }, '异常sku数量')
            }
          },
          'skuProductCost': {
            title: 'sku价格',
            minWidth: 120,
            key: 'skuProductCost',
            align: 'center'
          },
          'expand': {
            key: 'expand',
            type: 'expand',
            align: 'center',
            width: 2,
            render: (h, params) => {
              let row = params.row || {};
              if (!(row.isAssemble == 1 && row.assembleGoodsList && row.assembleGoodsList.length)) return;
              return h(combinationProducts, {
                props: {
                  index: params.index,
                  lists: row.assembleGoodsList,
                  columns: _self.columns,
                  columnFeild: _self.columnFeild,
                  pickingStatus: _self.pickingStatus,
                  isEdit: _self.isEdit,
                  wareId: _self.wareId
                  //   wareColumn: wareColumn,
                },
                on: {
                  locationNameClear(temp) { // 清除库位
                    _self.wareColumn.forEach(k => {
                      _self.$set(_self.formValidate.data[temp.index].assembleGoodsList[temp.cindex], k, '');
                    })
                  },
                  getData(temp) { // 选择库位
                    _self.wareColumn.forEach(k => {
                      _self.$set(_self.formValidate.data[temp.index].assembleGoodsList[temp.cindex], k, temp.data[k]);
                    })
                  }
                }
              })
            }
          },
          'productLength': {
            title: '商品长(cm)',
            minWidth: 120,
            slot: 'productLength',
            key: 'productLength',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '商品长(cm)')
                ]
              )
            }
          },
          'productWidth': {
            title: '商品宽(cm)',
            minWidth: 120,
            slot: 'productWidth',
            key: 'productWidth',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '商品宽(cm)')
                ]
              )
            }
          },
          'productHeight': {
            title: '商品高(cm)',
            minWidth: 120,
            slot: 'productHeight',
            key: 'productHeight',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '商品高(cm)')
                ]
              )
            }
          },
          'productWeight': {
            title: '商品重(KG)',
            minWidth: 120,
            slot: 'productWeight',
            key: 'productWeight',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '商品重(KG)')
                ]
              )
            }
          },
          'goodsSkc': {
            title: '产品skc',
            align: 'center',
            width: 120,
            key: 'skc'
          },
          'platformSpu': {
            title: '平台spu',
            align: 'center',
            minWidth: 120,
            key: 'platSpu',
            slot: 'platSpu',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '平台spu')
                ]
              )
            }
          },
          'platformSampleNo': {
            title: '平台样品编号',
            align: 'center',
            minWidth: 120,
            key: 'platSamplesNo',
            slot: 'platSamplesNo',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '平台样品编号')
                ]
              )
            }
          },
          'platformSkc': {
            title: '平台skc',
            align: 'center',
            minWidth: 120,
            key: 'platSkc',
            slot: 'platSkc',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '平台skc')
                ]
              )
            }
          },
          'platformSku': {
            title: '平台SKU',
            align: 'center',
            minWidth: 120,
            key: 'platformSku',
            slot: 'platformSku',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '平台SKU')
                ]
              )
            }
          },
          'mrp': {
            title: 'MRP(INR)',
            align: 'center',
            minWidth: 120,
            key: 'mrp',
            slot: 'mrp',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', 'MRP(INR)')
                ]
              )
            }
          },
          'importerInfo': {
            title: '进口商信息',
            align: 'center',
            minWidth: 120,
            key: 'importerInfo',
            slot: 'importerInfo',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', '进口商信息')
                ]
              )
            }
          },
          'ymsSupplierSku': {
            title: 'YMS供应商SKU',
            align: 'center',
            minWidth: 120,
            key: 'ymsSupplierSku',
            slot: 'ymsSupplierSku',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', 'YMS供应商SKU')
                ]
              )
            }
          },
          'ymsProductSpec': {
            title: 'YMS商品规格',
            align: 'center',
            minWidth: 120,
            key: 'ymsProductSpec',
            slot: 'ymsProductSpec',
            renderHeader: (h, params) => {
              return h('div',
                [
                  h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                  h('span', 'YMS商品规格')
                ]
              )
            }
          },
          // 'goodId': {
          //   title: '商品ID',
          //   align: 'center',
          //   minWidth: 120,
          //   key: 'goodId',
          //   slot: 'goodId',
          //   renderHeader: (h, params) => {
          //     return h('div',
          //       [
          //         h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
          //         h('span', 'goodId')
          //       ]
          //     )
          //   }
          // },
        },
        // 不同出库单类型公用 platSku 字段，因此拿来处理
        commonRender() {
          let platSkuList = [
            { key: 'ean', title: 'EAN' },
            { key: 'FNSKU', title: 'FNSKU' },
            { key: 'UPCEAN', title: 'UPC/EAN' },
            { key: 'ocskuID', title: 'oc skuID' },
            { key: 'gcsku', title: '谷仓sku' },
            { key: 'SHLsku', title: 'SHLsku' },
            { key: 'wytong', title: '万邑通sku' },
            { key: 'rinid', title: '睿邑达SKU' },
            { key: 'fbp', title: 'FBPSKU' },
            { key: 'aimule', title: '艾姆勒sku' },
            { key: 'fms', title: 'YMS SKU' },
            { key: 'FBP-URAL', title: '商品ID' },
          ]
          let commonRender = {}
          platSkuList.forEach(k => {
            commonRender[k.key] = {
              title: k.title,
              align: 'center',
              minWidth: 120,
              slot: 'platSku',
              key: 'platSku',
              renderHeader: (h, params) => {
                return h('div',
                  [
                    h('span', { style: { color: '#D9001B', marginRight: '4px' } }, '*'),
                    h('span', k.title)
                  ]
                )
              }
            }
          })
          this.list = Object.assign(this.list, commonRender);
        },
        // 根据不同的出库单类型，显示不同的字段
        pickingExist() {
          this.pickingItem = [];
          let obj = {
            'O5': 'FNSKU',
            'O6': 'UPCEAN',
            'O7': 'ocskuID',
            'O8': 'gcsku',
            'O9': 'SHLsku',
            'O10': 'wytong',
            'O11': {
              0: ['platformSpu', 'platformSampleNo'],
              1: ['platformSkc'],
            },
            'O13': 'ean',
            'O17': 'rinid',
            'O18': 'fbp',
            'O19': 'aimule',
            'O20': 'fms',
            'O21': 'FBP-URAL',
          };
          let type = obj[pickingType];
          if (_self.$common.isEmpty(type)) return;
          if (pickingType === 'O11') {
            let list = type[pickingSubType] || [];
            this.pickingItem.push(...list);
          } else {
            this.pickingItem.push(type);
          }
        },
        // 添加产品
        addProduct() {
          // 公用表头
          let numList = ['expand', 'index', 'goodsUrl', 'goodsSku', 'goodsCnDesc', 'expectedNumber', 'labelName'];
          // 处理万邑通出库列表头
          if (['O10'].includes(pickingType)) {
            const O10Col = ['productLength', 'productWidth', 'productHeight', 'productWeight'];
            numList = [...numList, ...O10Col];
          }
          // 公用表头
          numList = [...numList, 'skuDesc', 'option'];
          // 插入对应出库单类型数据
          numList.splice(['O10'].includes(pickingType) ? 11 : 7, 0, ...this.pickingItem);
          // temu出库单增加产品sku
          if (pickingType === 'O11' && pickingSubType == 1) numList.splice(4, 0, 'goodsSkc');
          // 删除标签名称
          if (['O17', 'O19'].includes(pickingType)) numList.splice(6, 1);
          // FBA出库
          if (['O5'].includes(pickingType) && labelType == 2) {
            let indiaList = ['platformSku', 'mrp', 'importerInfo'];
            numList.splice(8, 0, ...indiaList);
          }
          // yms 出库单
          if (['O20'].includes(pickingType)) {
            let indiaList = ['ymsSupplierSku', 'ymsProductSpec'];
            numList.splice(6, 1);
            numList.splice(7, 0, ...indiaList);
          }
          // FBP-URAL 出库单
          if (['O21'].includes(pickingType)) {
            numList.splice(6, 1);
          }
          let list = numList.map(k => this.list[k]);
          return list;
        },
        // 产品详情
        productDetail() {
          let numList = ['expand', 'index', 'pickingDetailStatus', 'goodsUrl', 'goodsSku', 'goodsCnDesc', 'expectedNumber', 'labelName'];
          if (['O10'].includes(pickingType)) {
            const O10Col = ['productLength', 'productWidth', 'productHeight', 'productWeight'];
            numList = [...numList, ...O10Col];
          }
          numList = [...numList, 'skuDesc', 'skuProductCost', 'doneAssignedNumber', 'notAssignedNumber', 'actualPickingNumber', 'missNumber'];
          // 插入对应出库单类型数据
          numList.splice(['O10'].includes(pickingType) ? 12 : 8, 0, ...this.pickingItem);
          // temu出库单增加产品sku
          if (pickingType === 'O11' && pickingSubType == 1) numList.splice(5, 0, 'goodsSkc');
          // 删除标签名称
          if (['O17', 'O19'].includes(pickingType)) numList.splice(7, 1);
          // FBA出库
          if (['O5'].includes(pickingType) && labelType == 2) {
            let indiaList = ['platformSku', 'mrp', 'importerInfo'];
            numList.splice(9, 0, ...indiaList);
          }
          // yms 出库单
          if (['O20'].includes(pickingType)) {
            let indiaList = ['ymsSupplierSku', 'ymsProductSpec'];
            numList.splice(7, 1);
            numList.splice(8, 0, ...indiaList);
          }
          // FBP-URAL 出库单
          if (['O21'].includes(pickingType)) {
            numList.splice(7, 1);
          }
          let arr = numList.map(k => this.list[k]);
          // 是否可编辑
          if (_self.isEdit) {
            if (detailData.pickingGoodsStatus === '0') {
              arr.unshift(this.list['selection']);
              let warehouseIndex = null;
              arr.forEach((i, key) => {
                if (i.key == 'skuDesc' || i.slot == 'skuDesc') warehouseIndex = key;
              })
              arr.splice(warehouseIndex + 1, 0, this.list['warehouseLocationName'])
            }
          }
          if (_self.isEdit || (detailData.pickingNewStatus > 2 && detailData.pickingNewStatus < 99)) {
            arr.push(this.list['option']);
          }
          return arr;
        }
      }
      fun.commonRender();
      fun.pickingExist();
      // 添加产品
      if (!detailData.pickingId) return fun.addProduct();
      // 产品详情
      return fun.productDetail();
    }
  },
};
