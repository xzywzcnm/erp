import { oneOf } from '../utils/assist';
import { getWarehouseId } from '@/utils/getService';

export default {
  props: {
    to: {
      type: [Object, String]
    },
    replace: {
      type: Boolean,
      default: false
    },
    target: {
      type: String,
      validator (value) {
        return oneOf(value, ['_blank', '_self', '_parent', '_top']);
      },
      default: '_self'
    }
  },
  computed: {
    linkUrl () {
      const type = typeof this.to;
      return type === 'string' ? this.to : null;
    }
  },
  methods: {
    handleClick (new_window = false) {
      if (new_window) {
        window.open(this.to);
      } else {
        const isRoute = this.$router;
        if (isRoute) {
          this.replace ? this.$router.replace({path: this.to, query: { warehouseId: getWarehouseId() }}) : this.$router.push({path: this.to, params: { warehouseId: getWarehouseId() }});
        } else {
          window.location.href = `${this.to}${this.to.includes('?')?'&':'?'}warehouseId=${getWarehouseId()}`;
        }
      }
    },
    handleCheckClick (event, new_window = false) {
      if (this.to) {
        if (this.target === '_blank') {
          return false;
        } else {
          event.preventDefault();
          this.handleClick(new_window);
        }
      }
    }
  }
};
