import defaultWarehouse from './defaultWarehouse'; // 默认自营仓库
import thirdWarehouse from './thirdUniversal'; // 通用第三方
import cneWarehouse from './cne-warehouse'; // cne 仓库
import fbaWarehouse from './FBA-warehouse'; // FBA 仓库
import winitWarehouse from './winit-warehouse'; // 万邑通 仓库
import gcWarehouse from './gc-warehouse'; // 谷仓
import fourpxoutWarehouse from './fourpxout-warehouse'; // 递四方
import pylWarehouse from './pyl-warehouse'; // PYL
import rinidWarehouse from './rinid-warehouse'; // 睿邑达
import nfWarehouse from './nf-warehouse'; // 新火
import shlWarehouse from './shl-warehouse'; // SHL
import efWarehouse from './EF-warehouse'; // EF 仓库
import yunWarehouse from './yun-warehouse'; // 云仓
import amloutstore from './aml-warehouse'; // 艾姆勒
import directlyWarehouse from './directly-warehouse'; // 直发仓

export default {
  // 默认自营仓库
  default: { label: '自营仓库', value: 'default', menu: defaultWarehouse },
  // 通用第三方
  third: { label: '第三方通用', value: 'third', menu: thirdWarehouse },
  // cne 仓库
  cne: { label: 'CNE', value: 'cne', menu: cneWarehouse },
  // fba 仓库
  fba: { label: 'FBA', value: 'fba', menu: fbaWarehouse },
  // 万邑通 仓库
  winit: { label: '万邑通', value: 'winit', menu: winitWarehouse },
  // 谷仓
  gc: { label: '谷仓', value: 'gc', menu: gcWarehouse },
  // ef 仓
  ef: { label: 'EF', value: 'ef', menu: efWarehouse },
  // 云仓
  yun: { label: '云仓', value: 'yun', menu: yunWarehouse },
  // 递四方
  fourpxout: { label: '递四方', value: 'fourpxout', menu: fourpxoutWarehouse },
  // PYL
  pyl: { label: 'PYL', value: 'pyl', menu: pylWarehouse },
  // 睿邑达
  rinid: { label: '睿邑达', value: 'rinid', menu: rinidWarehouse },
  // 新火
  nf: { label: '新火', value: 'nf', menu: nfWarehouse },
  // SHL
  shl: { label: 'SHL', value: 'shl', menu: shlWarehouse },
  // 艾姆勒
  aml: { label: '艾姆勒', value: 'aml', menu: amloutstore },
  // 直发仓
  directly: { label: '直发仓', value: 'directly', menu: directlyWarehouse },
};
