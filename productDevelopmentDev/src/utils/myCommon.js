const common = {
  copy: (obj,cache = []) => {
    // 如果为普通数据类型，则直接返回，完成拷贝
    if (obj===null || typeof obj !== "object"){
      return obj
    }
    const hit = find(cache,c=>c.original===obj)
    if(hit){
      return hit.copy
    }
    // 定义拷贝的数据类型
    const copy = Array.isArray(obj) ? [] : {}
    // 用来记录拷贝的原始值和copy值
    cache.push[{
      original:obj,
      copy
    }]
    // 递归调用深拷贝函数，拷贝对象中的每一个值
    Object.keys(obj).forEach(key=>{
      copy[key] = common.copy(obj[key],cache)
    })
    return copy
  }
}
export default common