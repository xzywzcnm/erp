<template >
  <div :class="wrap" >
    <Card
        shadow class="normalLRMargin" >
      <Form
          ref="formInline" :model="pageParams" inline :label-width="80" class="formItem" >
        <FormItem label="回评状态" >
          <RadioGroup
              v-model="pageParams.status" type="button" >
            <Radio label="0" >全部</Radio >
            <Radio label="1" >未回评</Radio >
            <Radio label="2" >已回评</Radio >
          </RadioGroup >
        </FormItem >
      </Form >
    </Card >
    <Card
        shadow class="normalMargin" >
      <Button
          @click="showMoreDialog" type="primary" icon="ios-keypad" >批量回评 </Button >
    </Card >
    <Card
        shadow class="normalLRMargin" >
      <keep-alive >
        <Table
            :columns="columns"
            :loading="tableLoading"
            highlight-row
            border
            :data="tableData"
            @on-selection-change="getSelectValue" ></Table >
      </keep-alive >
      <Row
          type="flex" justify="end" class="normalTop" >
        <keep-alive >
          <Page
              :total="total"
              @on-change="changePage"
              show-total
              :page-size="pageParams.pageSize"
              show-elevator
              :current="curPage"
              show-sizer
              @on-page-size-change="changePageSize"
              placement="top"
              :page-size-opts="pageArray" ></Page >
        </keep-alive >
      </Row >
    </Card >
    <keep-alive>
      <Modal
          v-model="replyModel"
          title="给买家留评价"
          :mask-closable="false"
          :width="600"
          v-if="replyModelStatus"
          @on-ok="moreReply" >
        <div class="normalMargin" >
          <Form
              ref="formInline" :model="moreParams" label-position="left" :label-width="80" >
            <Row type="flex" >
              <Radio :value="true" >好评</Radio >
            </Row >
            <Row
                type="flex" class="normalTop" >
              <Checkbox v-model="moreParams.selectInContent" >随机从评选模板中挑选评选内容</Checkbox >
            </Row >
            <FormItem
                :label-width="100" label="选择评价模板" class="normalTop" >
              <dyt-select v-model="moreParams.model" > <Option >1</Option > </dyt-select >
            </FormItem >
            <FormItem
                :label-width="100" label="评价内容" class="normalTop" >
              <Input
                  v-model="moreParams.textModel" type="textarea" />
            </FormItem >
          </Form >
        </div >
      </Modal >
    </keep-alive >
  </div >
</template>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #FFF !important;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    return {
      moreParams: {
        selectInContent: false,
        model: '',
        textModel: '',
        feedbackLevel: 'Positive'
      },
      replyModelStatus: false,
      replyModel: false,
      curPage: 0,
      total: 0,
      totalPage: 0,
      pageParams: {
        pageSize: 10,
        pageNo: 1,
        status: '0'
      },
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '销售号/买家账号',
          key: 'name'
        }, {
          title: '付款日期',
          key: 'name'
        }, {
          title: '买家评价',
          key: 'name'
        }, {
          title: '我的评价',
          key: 'name'
        }, {
          title: '留评价时间',
          key: 'name'
        }, {
          title: '操作',
          key: 'name'
        }
      ],
      tableData: [],
      idArr: []
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  methods: {
    getSelectValue (value) {
      let arr = value.map(n => {
        return n.productId;
      });
      this.idArr = arr;
    },
    // moreReply () {},
    showMoreDialog () {
      let v = this;
      if (v.idArr.length === 0) {
        v.$Message.error('请选择要回评的订单');
        return;
      }
      // if (v.idArr.length === 0) {
      //   v.$Message.warning('请选择需要回复的评价');
      //   return false;
      // }
      v.replyModelStatus = true;
      v.$nextTick(function () {
        v.replyModel = true;
      });
    },
    getList () {
      let v = this;
      const obj = {
        url: api.get_evaluateList,
        data: v.pageParams
      };
      v.loadingFalse();
      v.tableData = [];
      v.ajaxData(obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.tableData = data.list;
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        } else {
          v.tableData = [];
          v.$nextTick(function () {
            v.total = 0;
            v.totalPage = 0;
          });
        }
      });
    }
  },
  mounted () {
    let v = this;
    v.getList();
  }
};
</script>
