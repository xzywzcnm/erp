import menuCommonSettings from './menuCommonSettings';

export default {
  menu: [
    ...menuCommonSettings.generalSettings,
    ...menuCommonSettings.logistics,
    ...menuCommonSettings.orderSettings,
    ...menuCommonSettings.customSettings,
    ...menuCommonSettings.pdsSettings,
    ...menuCommonSettings.productSettings,
    ...menuCommonSettings.spsSettings,
    ...menuCommonSettings.financeSettings,
  ],
  generalSettings: menuCommonSettings.generalSettings,
  logistics: menuCommonSettings.logistics,
  orderSettings: menuCommonSettings.orderSettings,
  customSettings: menuCommonSettings.customSettings,
  pdsSettings: menuCommonSettings.pdsSettings,
  productSettings: menuCommonSettings.productSettings,
  spsSettings: menuCommonSettings.spsSettings,
  financeSettings: menuCommonSettings.financeSettings
};
