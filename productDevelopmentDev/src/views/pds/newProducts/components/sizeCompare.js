// 已知尺码排序
export let sortSizelist = ()=> {
  let sizeSort = [
    { size: 'XXS' },
    { size: 'XS' },
    { size: 'S' },
    { size: 'M' },
    { size: 'L' },
    { size: 'XL' },
    { size: '2XL' },
    { size: '3XL' },
    { size: '4XL' },
    { size: '5XL' },
    { size: '6XL' },
    { size: '7XL' },
    { size: 'Free Size' },
  ]
  sizeSort = sizeSort.map((k, index) => {
    return { size: k.size, sizeNum: index };
  })
  return sizeSort;
}

// 尺码比较
export let compareFun = (prop) => {
  return (a, b) => {
    let c = a[prop];
    let d = b[prop];
    return c - d;
  }
}