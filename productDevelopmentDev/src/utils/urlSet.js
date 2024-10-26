export const urlSetting = (url) => {
  let exp = /(http|https):\/\/([\w.]+\/?)\S*/;
  if(url == null) return;
  if(exp.test(url))return url;
  //if(url.indexOf('./filenode/s')!= -1)return url;
  return`./filenode/s${url}` ;
};