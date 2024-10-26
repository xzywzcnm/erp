<style scoped >
.expand-row {
  cursor: pointer;
}

.expand-row .expandBox {
  padding: 10px 10px;
  width: 100%;
  border-bottom: 1px solid #ccc;
  transition: 0.1s ease-in-out;
}

.expand-row .expandBox:last-child {
  border-bottom: 0
}

.expand-row .expandBox:hover {
  background-color: #dce2cb
}

.mail-icon {
  font-size: 24px;
  color: #ff7800;
  margin-right: 5px;
}

.fontWeight {
  font-weight: bold
}
</style >
<style >
td.ivu-table-expanded-cell {
  padding: 10px;
}

.expand-row .ivu-table-cell {
  padding: 0px;
}
</style>
<template>
  <div>
    <Row class="expand-row">
      <template>
        <div v-for="(item, index) in row.childrenRe" ref="expandRow" @click="highlightRow(item, index)" class="expandBox" :key="index" >
          <Row >
            <Col span="18" >
              <Icon class="mail-icon" v-if="item.webstoreMessageId !== null" type="ios-mail-outline" />
              <Icon type="ios-mail-open-outline" v-else class="mail-icon" />
              <span class="f14" :class="{'fontWeight': item.disposeMethod === 0}">{{ item.sender }}</span ></Col>
            <Col span="6" >
              <Icon v-if="item.remarkCount > 0" color="red" size="16" type="ios-chatbubbles" />
              {{
                item.sender === row.buyerAccount || item.sender === 'ebay'
                ? getDataToLocalTime(item.receiveTime, 'fulltime')
                : getDataToLocalTime(item.sendTime, 'fulltime')
              }}
            </Col>
          </Row>
          <Row>
            <Col span="24" :class="{'fontWeight': item.disposeMethod === 0}">
              {{ item.subject }}
            </Col>
          </Row>
        </div>
      </template>
    </Row>
  </div>
</template>
<script>
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  props: {
    row: Object
  },
  data () {
    return {};
  },
  created () {
  },
  methods: {
    highlightRow (val, index) {
      let v = this;
      v.$emit('click', val);
    }
  }
};
</script >
