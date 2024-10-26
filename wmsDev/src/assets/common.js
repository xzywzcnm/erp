// import store from '@/store/store';
import menuAmazonFba from '@/api/menu/menuAmazonFba';
import menuWinit from '@/api/menu/menuWinit';
import menuBarn from '@/api/menu/menuBarn';
import third from '@/api/menu/thirdOutboundOrder';
import menuCne from '@/api/menu/menuCne';
import menuDirectly from "@/api/menu/menuDirectly"; // 直发仓
import menuRinid from '@/api/menu/menuRinid';
import menuNovFire from '@/api/menu/menuNovFire';
import menuAmloutstore from "@/api/menu/menuAmloutstore";
import menuShl from '@/api/menu/menuShl';
import menu4px from '@/api/menu/menu4px';
import menuPyl from '@/api/menu/menuPyl';
import menuYuncang from '@/api/menu/menuYuncang';
import menuWarehouse from '@/api/menu/menuWarehouse';
// 监听路由变化--动态修改页面的title
let titleFun = (to) => {
  if (!to.path) return;
  let menulist = [
    ...menuAmazonFba.menu, ...menuWinit.menu, ...menuBarn.menu, ...menu4px.menu, ...menuPyl.menu, ...menuYuncang.menu,
    ...menuWarehouse.menu, ...menuShl.menu, third.menu, ...menuCne.menu, menuRinid.menu, ...menuNovFire.menu,
    ...menuDirectly.menu, menuAmloutstore.menu
  ];
  let [list, isName] = [[], null];
  let a = (arr) => {
    arr.forEach(k => {
      list.push(k);
      if (k.children && k.children.length) {
        a(k.children);
      }
    });
  };
  a(menulist);
  list.forEach(k => {
    if (!isName && (k.path && k.path.includes(to.path))) isName = k;
  });
  // console.log(list);
  return isName && isName.name;
};
export { titleFun };
