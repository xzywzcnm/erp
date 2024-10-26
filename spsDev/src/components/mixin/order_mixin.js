import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  watch: {},
  data () {
    return {};
  },
  methods: {
    modifyEditStatus (index) {
      this.order.remarks.forEach((i, j) => {
        if (index === j) {
          i.edit = !i.edit;
          i.remarkDraft = i.remark;
        }
      });
    },
    deleteRemark (id, index) {
      let v = this;
      v.isDelModal(() => {
        v.axios.delete(api.purchaseRemark + '/' + id).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('操作成功');
            v.order.remarks.splice(index, 1);
          }
        });
      });
    },
    editRemark (id, remark, index) {
      let v = this;
      v.axios.put(api.purchaseRemark + '?purchaseRemarkId=' + id + '&remark=' + remark).then(response => {
        if (response.data.code === 0) {
          v.order.remarks[index].remark = remark;
          v.order.remarks[index].nowTime = v.getDateTime(new Date().getTime(), 'fulltime');
          v.order.remarks[index].edit = false;
          v.$Message.success('操作成功');
        }
      });
    },
    addRemark () {
      let v = this;
      let text = v.remarkContent.replace(/\n|\r\n/g, '<br>');
      let query = encodeURIComponent(text);
      let reg = new RegExp('<br>', 'g');
      v.axios.post(api.purchaseRemark + '?purchaseId=' + v.order.purchaseId + '&remark=' + query).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          if (v.order.remarks === null) {
            v.order.remarks = [];
          }
          v.order.remarks.unshift({
            updatedBy: v.$store.state.userId || sessionStorage.getItem('userId'),
            nowTime: v.getDateTime(new Date().getTime(), 'fulltime'),
            remarkDraft: v.remarkContent.replace(reg, '\n'),
            remark: v.remarkContent.replace(reg, '\n'),
            edit: false,
            purchaseRemarkId: response.data.datas
          });
          v.remarkContent = '';
        }
      });
    }
  },
  mounted () {

  }
};
