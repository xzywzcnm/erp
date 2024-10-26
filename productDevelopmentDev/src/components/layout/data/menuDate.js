// 菜单
export default {
  menu: [
    {
      name: "控制台",
      menuKey: "productDev_control",
      icon: "icon-kongzhitai",
      children: [
        {
          name: "首页",
          path: "/index",
          menuKey: "productDev_controlIndex"
        },
      ]
    },
    {
      name: "供应商商品选款",
      menuKey: "productDev_optionAll",
      icon: "icon-pinpaizhuanxiang",
      children: [
        {
          name: "选款",
          path: "/chooseStyle",
          menuKey: "productDev_chooseStyle"
        },
      ]
    },
    
    {
      name: "LAPA新品开发",
      menuKey: "productDev_my",
      icon: "icon-developer",
      children: [
        {
          name: "现货创建需求",
          path: "/createRequire",
          menuKey: "productDev_myDemandList"
        },
        {
          name: "打版创建需求",
          path: "/plateMaking",
          menuKey: "productDev_plateMaking"
        },
        {
          name: "我的待办任务",
          path: "/todoTask",
          menuKey: "productDev_myPerfect"
        },
      ]
    },
    {
      name: '基础数据设置',
      // menuKey: "productDev_my",
      icon: 'icon-Shape',
      children: [
        {
          name: '商品编码自动编码规则',
          path: '/codingRules',
          menuKey: 'productDev_codingRules'
        },
        {
          name: 'UPC生成规则',
          path: '/upcGenerationRules',
          menuKey: 'productDev_upcGenerationRules'
        },
        {
          name: 'SKC颜色管理',
          path: '/skcColormanage',
          menuKey: 'productDev_skcColormanage'
        },
        {
          name: '分类类型管理',
          path: '/typeManage',
          menuKey: 'productDev_typeManage'
        },
        // {
        //   name: '尺码管理',
        //   path: '/sizeManage',
        //   menuKey: 'productDev_sizeManage'
        // },
        {
          name: '尺码和尺码类型管理',
          path: '/sizeManage',
          menuKey: 'productDev_sizeManage'
        },
        {
          name: '审核人员设置',
          path: '/approverSettings',
          menuKey: 'productDev_approverSettings'
        },
        {
          name: '物料管理',
          path: '/materialManage',
          menuKey: 'productDev_materialManage'
        },
        {
          name: '工艺管理',
          path: '/craftManage',
          menuKey: 'productDev_craftManage'
        },
        {
          name: '工序管理',
          path: '/workstageManage',
          menuKey: 'productDev_workstageManage'
        },
        {
          name: '二次工艺管理',
          path: '/twiceCraftManage',
          menuKey: 'productDev_twiceCraftManage'
        },
      ]
    },
    {
      name: '导入/导出任务',
      // menuKey: "productDev_my",
      icon: 'icon-developer',
      children: [
        {
          name: '导入查看',
          path: '/importTask',
          menuKey: 'productDev_importTask'
        },
        {
          name: '导出查看',
          path: '/exportTask',
          menuKey: 'productDev_exportTask'
        },
      ]
    }
    // {
    //   name: "我的新品开发(旧)",
    //   menuKey: "productDev_my",
    //   icon: "icon-developer",
    //   children: [
    //     {
    //       name: "销售需求创建",
    //       path: "/demandList",
    //       menuKey: "productDev_myDemandList"
    //     },
    //     {
    //       name: "已询价商品管理",
    //       path: "/perfect",
    //       menuKey: "productDev_myPerfect"
    //     },
    //     {
    //       name: "待办任务", // 待办
    //       path: "/backlog",
    //       menuKey: "productDev_myBacklog",
    //       dataItemNum: ""
    //     },
    //     {
    //       name: "已办任务",
    //       path: "/haveDone",
    //       menuKey: "productDev_myHaveDone"
    //     },
    //     {
    //       name: "我的样品采购",
    //       path: "/samplePurchase",
    //       menuKey: "productDev_mySamplePurchase"
    //     },
    //     {
    //       name: "付款记录",
    //       path: "/paymentList",
    //       menuKey: "productDev_myPaymentList"
    //     },
    //     {
    //       name: "新品计算器",
    //       path: "/calc",
    //       menuKey: "productDev_myCalc"
    //     }
    //   ]
    // },
    // {
    //   name: "数据查询",
    //   menuKey: "productDev_dataQuery",
    //   icon: "icon-plus-datasearch",
    //   children: [
    //     {
    //       name: "样品采购列表",
    //       menuKey: "productDev_purchasingManagement",
    //       path: "/manage"
    //     },
    //     {
    //       name: "需求列表",
    //       menuKey: "productDev_demandManagement",
    //       path: "/allList"
    //     }
    //   ]
    // },
    // {
    //   name: "设置",
    //   menuKey: "productDev_processConfiguration",
    //   icon: "icon-jinlingyingcaiwangtubiao20",
    //   children: [
    //     {
    //       name: "流程配置",
    //       menuKey: "productDev_processConfigurationChild",
    //       path: "/procedure"
    //     },
    //     {
    //       name: "费用模板管理",
    //       menuKey: "productDev_processConfigurationChild", // productDev_feeTemplateManage
    //       path: "/feeTemplate"
    //     },
    //     {
    //       name: "头程运输",
    //       menuKey: "productDev_processConfigurationChild", // productDev_headTransport
    //       path: "/headTransport"
    //     },
    //     {
    //       name: "收货地址管理",
    //       path: "/receivingAddress",
    //       menuKey: "productDev_processConfigurationChild" // productDev_receivingAddress
    //     }
    //   ]
    // },
    // {
    //   name: "组件管理",
    //   menuKey: "productDev_optionAll",
    //   icon: "icon-pinpaizhuanxiang",
    //   children: [
    //     {
    //       name: "组件基础",
    //       path: "/basic",
    //       menuKey: "productDev_chooseStyle"
    //     },
    //   ]
    // },
  ]
};
