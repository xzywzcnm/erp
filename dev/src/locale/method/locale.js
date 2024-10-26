import { t } from '@/locale/method/index';

export default {
  methods: {
    t (...args) {
      return t.apply(this, args);
    }
  }
};
