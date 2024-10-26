/**
 * @Description: 全局定义请求接口异常提示语
 * @author jing
 * @date: 2020/9/10 17:56
 * @params:
 */
export default {
  '510002': '库区类型错误',
  '510003': '库位不是异常处理库位',
  '116316': '补件单状态错误',
  '116319': '包裹存在待完成的补拣单',
  '116321': 'sku不存在',
  '553111': '取消分配失败:异常拣货出库单无法进行取消分配操作',
  '116127': '异常包裹中存在正常拣货包裹',
  '111177': '包裹已作废',
  '111176': '标出库失败，此包裹已作废待回收',
  '116126': '完成包装失败，包装状态已变更!',
  '116112': '没有正在扫描的拣货复核,请扫描',
  '116002': '不是多品多件拣货单，无法开启分拣作业。',
  '116003': '系统每个操作员同一时间只允许开启一个分拣作业',
  '116004': '每张拣货单同一时间只允许一位操作员进行分拣作业',
  '116005': '已经分拣完成，您可以对该拣货单重新开启分拣作业。',
  '116006': '正在进行拣货复核，无法开启分拣作业',
  '116009': '存在已进行普通打印出库单',
  '116119': '拣货篮不能找到唯一没包装完成的拣货单',
  '116120': '拣货篮没有待完成的拣货单',
  '116105': '拣货单未打印，不能开始拣货复核',
  '116103': '拣货单已完成',
  '116104': '拣货单不存在或状态已改变,请刷新后重试',
  '116106': '拣货单下不存在出库单',
  '116107': '拣货单下不存在有效出库单',
  '116108': '拣货单下存在商品备注',
  '116109': '拣货单下存在普通打印出库单',
  '116110': '拣货单未进行多品分拣',
  '116115': '拣货单下存在出库单未下发物流商成功',
  '116011': '拣货单拣货未完成',
  '554131': '目标库位正在盘点中',
  '229994': '采购单状态已变更',
  '116125': '分拣仅支持销售出库拣货单',
  '310021': '包裹未交运，不能执行发货',
  '116314': '只有出库单处于创建状态才能进行对出库单添加货品操作',
  '210055': 'sku与upc不可重复',
  '210053': 'upc已存在',
  '210054': 'UPC存在重复',
  '610006': '只有标准区和良品区可以绑定商品sku',
  '610007': 'sku已经绑定在其库区',
  '551003': '存在重复SKU',
  '553708': '操作库存移动单失败,库位不能为收货库位',
  '553606': '新增失败,调整库位不能为收货库位',
  '551000': '操作异常',
  '116123': '非销售出库单拣货单不支持拣货复核',
  '554118': '上架单创建失败,上架数量不能超过待上架数量且上架数量不能小于1',
  '310017': '包裹已截留',
  '116313': '包裹已截留',
  '553409': '质检数量少于取消数量',
  '553410': '上架数量少于取消数量',
  '553411': '收货数量少于取消数量',
  '553412': '收货库存不足少于取消数量',
  '116310': '本次出库单添加的货品不在调拨的货品中',
  '116311': '本次出库单添加的货品数量超过了调拨数量',
  '116312': 'fba调拨生成的其他出库单不允许添加新货品',
  '119131': '物流设置首续重计费,重量大于首重情况续重单位重量必须大于等于1',
  '554125': '导入补录运单号excel出库单号为空',
  '554127': '存在空的LAPA SKU',
  '554128': '存在空的skuCode',
  '554129': 'LAPA SKU系统不存在',
  '554130': 'skuCode 系统不存在',
  '554126': '导入补录运单号excel运单号为空',
  '552001': '请求参数错误',
  '553309': '出库单调拨数量超过调拨单还需要调拨的数量',
  '116122': '用户正在包装其他拣货单',
  '553310': '本次调拨无效，生成出库单无调拨数量大于0的明细',
  '554119': '上架单创建失败,上架库位不能和收获库位一致',
  '553102': '取消分配失败:已发货、已取消、已生成拣货单或已拣货的不可取消',
  '106104': '已存在相同的关联LAPA SKU',
  '553209': '未找到可以分配的库存，无法分配',
  '111122': '包裹已出库',
  '111123': '包裹已作废',
  '111004': '包裹不存在',
  '554001': '加工完成的前置条件为所有加工货品都已分配完成！',
  '553910': '箱号不能为空',
  '553911': 'sku不能为空',
  '553912': '装箱数量不能为空',
  '553913': '未找到对应出库单',
  '553914': '出库单号错误',
  '553205': '只有拣货库位才能进行分配操作',
  '553915': 'SKU不存在在',
  '111117': '查询不到相关的包裹',
  '116001': '拣货单不存在',
  '116121': '清空扫描失败，该包裹已经扫描完成',
  '553916': '装箱数量错误',
  '116010': '该拣货单下只有一个包裹，不能移除',
  '116007': '拣货单已完成拣货复核,无法重新分拣',
  '116201': '仓库正在配货中，请稍后再试',
  '553207': '分配失败',
  '554102': '分区使用中不能删除',
  '106101': '同步太频繁，请稍后再同步',
  '111150': '包裹状态已变更,操作异常',
  '554101': '已拣货的拣货单不能再次标记为已拣货',
  '554103': '分区方案使用中不能停用',
  '551001': '当前出库单产品无库存，无法分配',
  '552003': '请求参数错误',
  '552004': '请求参数错误',
  '552005': '请求参数错误',
  '552006': '请求参数错误',
  '552007': '请求参数错误',
  '552008': '操作失败',
  '552009': '没找到数据',
  '553100': '操作失败',
  '552000': '良品数量和不良品数量大于待质检数量',
  '553101': '操作失败',
  '553103': '操作失败',
  '553104': '操作失败',
  '553105': '操作失败',
  '553106': '操作失败',
  '553107': '操作失败',
  '553108': '操作失败',
  '553109': '操作失败',
  '553110': '操作失败',
  '553200': '操作失败',
  '553201': '请求参数错误',
  '553202': '没找到对应的数据明细',
  '553203': '没找到对应的出库单',
  '553204': '数据状态不正确', // '553205': '数据类型不正确',
  '553206': '只有处于创建状态或部分分配状态的出库单才能进行分配操作',
  '553301': '没找到对应的调出仓库',
  '553302': '没找到对应的调入仓库',
  '553303': '操作失败',
  '553304': '发货仓库和目的仓库不能相同',
  '553305': '调拨数量不正确',
  '553306': '不能加入相同的产品',
  '553307': '找不到对应数据',
  '553308': '数据状态不正确',
  '553401': '请求参数错误',
  '553402': '操作失败',
  '553403': '数据状态不正确',
  '553404': '找不到对应数据',
  '553405': '数据状态不正确',
  '553406': '找不到对应数据',
  '553407': '已经完成质检，不能取消拆包',
  '553500': '获取库位失败',
  '553501': '仓库不存在',
  '553502': '库位不存在',
  '553503': '库区不存在',
  '553504': '校验库区失败',
  '553505': '校验库区类型格式失败',
  '553506': '校验库区状态格式失败',
  '553601': '数据状态不正确',
  '553602': '不能重复操作',
  '553603': '正在盘点',
  '554116': '分区名称重复',
  '553604': '数量不正确',
  '553701': '不能重复操作',
  '553702': '拣货库位移动数量不能大于可用数量，不良品库位移动数量不能大于不良品数量',
  '553703': '数量不正确',
  '553704': '不能存在相同库位',
  '553705': '已经审核',
  '553706': '找不到对应数据',
  '553707': '操作失败',
  '553801': '库存盘点中',
  '553802': '没找到库存',
  '553804': '操作失败',
  '553805': '数量不正确',
  '553806': 'sku不存在',
  '553807': '操作失败',
  '553808': '没找到货品',
  '553809': '操作失败',
  '553810': '数量不正确',
  '553811': '找不到对应数据',
  '553812': '库存不足',
  '553813': '数据状态不正确',
  '553814': '未审核',
  '553901': '数据状态不正确',
  '553902': '不是拣货库位',
  '553903': '数据状态不正确',
  '553904': '找不到对应数据',
  '553905': '找不到对应数据',
  '553906': '找不到入库单',
  '553907': '数量不正确',
  '111142': '更新订单系统异常',
  '553208': '未找到可拣货库位，无法分配',
  '403': '没有权限',
  '999999': '系统错误',
  '116317': '只能开启属于自己的补拣单且不能同时开启多个',
  '116318': '只有补拣中的可以修改',
  '116320': '当前用户没有唯一执行中的补件单',
  '116322': '提交补录的数量超过可以补录的数量',
  '116323': '包裹没有待补拣的货品',
  '510001': '库位不是可用状态',
  '554133': '存在包含当前sku,且在盘点中的盘点单.请先完成盘点后再开始这个盘点单',
  '1111': '重复分配',
  '106103': '同步仓库暂未生成下载任务，请稍后再同步',
  '111102': '请选择物流商',
  '554132': '该店铺已经绑定其他仓库!',
  '554135': '不允许超量收货',
  '554136': '入库单已关闭,不能进行收货!',
  '116324': '当前包裹不是已打印状态',
  '116325': '扫描的sku数量与应包装数量不一致',
  '116101': '包裹不存在',
  '554139': '盘点数量必须大于等于(分配数量+冻结数量-已拣数量)',
  '116114': '未匹配合适出库单',
  '171001': '无效key',
  '116326': '扫描sku数量与身份码数量不一致',
  '310030': '该提单非正在装箱状态',
  '116008': '结束分拣的拣货单分拣状态不是分拣中,不能结束分拣',
  '310029': '该包裹已提单',
  '553803': '商品库存不足',
  '554142': '当前已有处理中的任务，请等待',
  '554144': '',
  '554145': '扫描的sku不存在于箱中',
  '554146': '这个箱还是空箱，请先装满',
  '554147': '无法找到该谷仓账号对应的key',
  '554117': '谷仓系统的SKU不存在或者不是可用状态',
  '554148': '删除失败，拣货单中包含的出库单有拣货单已拣货',
  '554150': '无法移除,出库单已开始拣货',
  '554149': '操作失败，该箱正在装组合产品',
  '554160': '未填写质检类型',
  '554161': '质检比例不能为空且不能超过100',
}; 