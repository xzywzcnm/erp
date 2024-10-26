import {
  findComponentUpward,
  findComponentsUpward
} from '../d-Table/relation/utils/assist';

export default {
  data () {
    return {
      menu: findComponentUpward(this, 'Menu')
    };
  },
  computed: {
    hasParentSubmenu () {
      return !!findComponentUpward(this, 'Submenu');
    },
    parentSubmenuNum () {
      return findComponentsUpward(this, 'Submenu').length;
    },
    mode () {
      return this.menu.mode;
    }
  }
};
