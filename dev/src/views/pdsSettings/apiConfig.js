// const base = '/setting-service/erpCommon';
const base = '';
export const sizeManageApiConfig = {
  // 尺码类型管理
  sizeTypeManage: {
    queryProductSizeTemplate: base + '/pds-service/pds/lapa/workbench/product/queryProductSizeTemplate',
    saveProductSizeTemplate: base + '/pds-service/pds/lapa/workbench/product/saveProductSizeTemplate',
    queryProductSizeTemplateName: base + '/pds/lapa/workbench/product/queryProductSizeTemplateName'
  },
  // 尺码部位管理
  sizePartsManage: {
    // 尺码部位-查询
    queryProductSizePartList: '/pds-service/pds/lapa/workbench/product/queryProductSizePartList',
    // 尺码部位-添加
    addProductSizePart: '/pds-service/pds/lapa/workbench/product/addProductSizePart',
    // 尺码部位-更新
    editProductSizePart: '/pds-service/pds/lapa/workbench/product/editProductSizePart',
    // 尺码部位-删除
    delProductSizePart: '/pds-service/pds/lapa/workbench/product/delProductSizePart'
  },
  // 分类尺码管理
  sizeClassManage: {
    // 分类尺码-新增
    addProductSizeClassification: '/pds-service/pds/lapa/workbench/product/addProductSizeClassification',
    // 分类尺码-编辑
    updateProductSizeClassification: '/pds-service/pds/lapa/workbench/product/updateProductSizeClassification',
    // 分类尺码-删除
    delProductSizeClassification: '/pds-service/pds/lapa/workbench/product/delProductSizeClassification',
    // 分类尺码-查询
    queryProductSizeClassificationList: '/pds-service/pds/lapa/workbench/product/queryProductSizeClassificationList',
    // 分类尺码-详情
    queryProductSizeClassificationInfo: '/pds-service/pds/lapa/workbench/product/queryProductSizeClassificationInfo',
    // 尺码项目
    queryAllProductSizePartList: '/pds-service/pds/lapa/workbench/product/queryAllProductSizePartList'
  },
  // 尺码图片管理
  pictureManage: {
    // 设置-尺码图片-查询
    queryProductSizePictureList: '/pds-service/pds/lapa/workbench/product/queryProductSizePictureList',
    // 设置-尺码图片-新增
    addProductSizePicture: '/pds-service/pds/lapa/workbench/product/addProductSizePicture',
    // 设置-尺码图片-删除
    delProductSizePicture: '/pds-service/pds/lapa/workbench/product/delProductSizePicture',
    // 设置-尺码图片-编辑
    editProductSizePicture: '/pds-service/pds/lapa/workbench/product/editProductSizePicture',
    // 设置-尺码图片-详情
    queryProductSizePictureInfo: '/pds-service/pds/lapa/workbench/product/queryProductSizePictureInfo',
    // 上传图片
    upload: '/pds-service/pds/lapa/workbench/product/upload'
  }
}
