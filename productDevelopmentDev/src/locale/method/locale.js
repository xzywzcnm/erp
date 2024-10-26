import {t} from '../method';

export default {
  methods: {
    t (...args) {
      return t.apply(this, args);
    }
  }
};
