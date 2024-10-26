// @ts-nocheck

import common from '../../../utils/common';
// 页面引导组件样式
import 'driver.js/dist/driver.min.css';
import Driver from 'driver.js';

const guide = {
  backRes: {},
  defaultConfig: {
    allowClose: false,
    closeBtnText: '退出',
    nextBtnText: '下一步',
    prevBtnText: '上一步',
    doneBtnText: '我知道了'
  },
  popover: {
    title: '提示',
    className: 'step-popover-class'
  },
  hand: (showModal) => {
    const driver = new Driver(guide.defaultConfig);
    driver.defineSteps([
      {
        element: '.table-row-order-fuide td.stockout-info-column',
        popover: {
          ...guide.popover,
          description: '当失败类型为缺货',
          position: 'right'
        },
        onHighlightStarted: () => {
          const body = document.querySelector('body');
          let bodyClass = body.className.split(' ');
          if (!bodyClass.includes('body-driver-fix-calss')) {
            bodyClass.push('body-driver-fix-calss');
            body.className = bodyClass.join(' ');
          }
        }
      },
      {
        element: '.ivu-table-fixed-right .ivu-table-fixed-body .table-row-order-fuide td.stockout-operate-column',
        popover: {
          ...guide.popover,
          description: '使用 <缺货商品数据> 功能，查看缺货商品的全部订单、库存、采购以及SPU其他有库存商品的库存信息',
          position: 'left'
        },
        onNext: () => {
          // 执行弹窗窗口
          showModal(guide.backRes);
          // 阻止进入下一个步骤
          driver.preventMove();
          // 执行一些动作或创建要移动到的元素然后移动到该元素
          driver.moveNext();
          const overlay = document.querySelector('#driver-page-overlay');
          const stage = document.querySelector('#driver-highlighted-element-stage');
          overlay && overlay.remove();
          stage && stage.remove();
        }
      },
      {
        element: '.stockoutOrderDetails .pane-details-info.sgasg.sdgh',
        popover: {
          ...guide.popover,
          description: ' ',
          position: 'top'
        }
      }
    ]);
    driver.start();
  },
  handModal: (closeModal) => {
    const driver = new Driver(guide.defaultConfig);
    driver.defineSteps([
      {
        element: '.stockoutOrderDetails .pane-details-info',
        popover: {
          ...guide.popover,
          description: '订单中缺货的商品',
          position: 'bottom'
        },
        onHighlighted: () => {
          const modal = document.querySelector('.stockout-order-modal.driver-fix-stacking');
          const overlay = document.querySelector('#driver-page-overlay');
          const stage = document.querySelector('#driver-highlighted-element-stage');
          modal.appendChild(overlay);
          modal.appendChild(stage);
        }
      },
      {
        element: '.stockoutOrderDetails .goodsMissingTable',
        popover: {
          ...guide.popover,
          description: '缺货商品其他订单缺货数据',
          position: 'bottom'
        }
      },
      {
        element: '.stockoutOrderDetails .orderInfoTable',
        popover: {
          ...guide.popover,
          description: '缺货商品库存与正在采购数据',
          position: 'bottom'
        }
      },
      {
        element: '.stockoutOrderDetails .wmsInventoryTable',
        popover: {
          ...guide.popover,
          description: '缺货商品有库存的SPU商品信息',
          position: 'top'
        },
        onHighlightStarted: () => {
          const details = document.querySelector('.stockoutOrderDetails .tab-pane-details');
          const tabpane = document.querySelector('.stockoutOrderDetails .ivu-tabs-tabpane');
          if (!details || !tabpane) return;
          tabpane.scrollTop = details.offsetHeight - tabpane.offsetHeight;
        },
        onNext: () => {
          const overlay = document.querySelector('#driver-page-overlay');
          const stage = document.querySelector('#driver-highlighted-element-stage');
          const body = document.querySelector('body');
          let bodyClass = body.className.split(' ');
          overlay && overlay.remove();
          stage && stage.remove();
          if (bodyClass.includes('body-driver-fix-calss')) {
            bodyClass.splice(bodyClass.indexOf('body-driver-fix-calss'), 1);
            body.className = bodyClass.join(' ');
          }
          closeModal();
        }
      }
    ]);
    driver.start();
  }
};
const orderGuide = (showModal) => {
  // const isSeptGiup = window.localStorage.getItem(`erpStockoutOrder-${userName}`);
  // setTimeout(() => {
  //   if (!common.isEmpty(guide.backRes) && isSeptGiup !== 'pass') {
  //     // 记录当前用户
  //     window.localStorage.setItem(`erpStockoutOrder-${userName}`, 'pass');
  //     guide.hand(showModal);
  //   }
  // }, 500)
}
const modalGuide = (closeModal) => {
  // const rowSeptGiup = window.localStorage.getItem(`erpStockoutOrder-${userName}`);
  // const modalGuideSept = window.localStorage.getItem(`modalGuideStockoutOrder-${userName}`);
  // if (modalGuideSept !== 'pass' && rowSeptGiup === 'pass') {
  //   // 记录当前用户
  //   window.localStorage.setItem(`modalGuideStockoutOrder-${userName}`, 'pass');
  //   guide.handModal(closeModal);
  // }
}
const rowClassName = (row, index) => {
  if ([4, '4'].includes(row.outOfStockStatusConcat)) {
    common.isEmpty(guide.backRes) && (guide.backRes = row);
    return 'table-row-order-fuide';
  }
}
export default {
  orderGuide: orderGuide,
  modalGuide: modalGuide,
  rowClassName: rowClassName
};
