<template >
  <div >
    <div class="tabContainer commonFilter" >
      <div style="padding:10px;" >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="red" />
            <Input
                style="width:300px;marginLeft:20px;" :maxlength="20" v-model="priorLevelList[0].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="purple" />
            <Input
                style="width:300px;marginLeft:20px;" v-model="priorLevelList[1].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="blue" />
            <Input
                style="width:300px;marginLeft:20px;" v-model="priorLevelList[2].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="darkGreen" />
            <Input
                style="width:300px;marginLeft:20px;" :maxlength="20" v-model="priorLevelList[3].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="green" />
            <Input
                style="width:300px;marginLeft:20px;" :maxlength="20" v-model="priorLevelList[4].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="orange" />
            <Input
                style="width:300px;marginLeft:20px;" :maxlength="20" v-model="priorLevelList[5].priorityName" ></Input >
          </Col >
        </Row >
        <br >
        <Row >
          <Col >
            <Icon
                type="md-flag" color="yellow" />
            <Input
                style="width:300px;marginLeft:20px;" :maxlength="20" v-model="priorLevelList[6].priorityName" ></Input >
          </Col >
        </Row >
        <div >
          <Button
              type="primary"
              style="margin:20px 30px;"
              @click="save"
              v-if="getPermission('messagePriority_update')" >保存 </Button >
          <span style="font-weight:800;" >由上向下，优先级别递减</span >
        </div >
      </div >
    </div >
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      priorLevelList: [
        {
          priorityName: ''
        }, {
          priorityName: ''
        }, {
          priorityName: ''
        }, {
          priorityName: ''
        }, {
          priorityName: ''
        }, {
          priorityName: ''
        }, {
          priorityName: ''
        }
      ]
    };
  },
  methods: {
    getList () {
      let v = this;
      v.axios.get(api.get_messagePriority).then(response => {
        if (response.data.code === 0) {
          v.priorLevelList = response.data.datas;
        }
      });
    },
    save () { // 保存
      let v = this;
      v.axios.put(api.update_messagePriority, v.priorLevelList).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('保存成功');
        }
      });
    }
  },
  created () {
    this.getPermission('messagePriority_queryAll') ? this.getList() : this.gotoError();
  }
};
</script >
