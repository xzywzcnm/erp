<template >
  <div class="compBtn" >
    <Button :icon="icon" @click="statusShowDiffText ? diffClick() : click(value)" :disabled="disabled" >{{ title }}</Button>
    <Dropdown style="margin-left: -7px" @on-click="click" transfer >
      <Button >
        <Icon type="ios-arrow-down" ></Icon>
      </Button >
      <DropdownMenu slot="list" v-if="!listenNormal">
        <DropdownItem
            v-for="(v, i) in dropList"
            :key="i"
            :name="v.value"
            v-if="v.flagCode ? v.flagCode.indexOf(v.status) > -1 : ''" >{{ v.label }}
        </DropdownItem>
      </DropdownMenu>
      <DropdownMenu slot="list" v-if="listenNormal">
        <DropdownItem v-for="(v, i) in dropList" :name="v.value" :key="i" >{{ v.label }}</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
export default {
  // props: ['title', 'dropList', 'listenNormal', 'statusShowDiffText', 'status', 'icon'],
  props: {
    title: {
      default: null
    },
    dropList: {
      default: null
    },
    listenNormal: {
      default: null
    },
    statusShowDiffText: {
      default: null
    },
    value: {
      default: null
    },
    status: {
      default: null
    },
    icon: {
      default: null
    },
    btnType: {
      default: 'primary'
    },
    disabled: {
      default: null
    }
  },
  data () {
    return {};
  },
  methods: {
    click (name) {
      this.$emit('click', name);
    }, // 根据状态显示文字点击button
    diffClick () {
      this.$emit('click', this.status);
    }
  }
};
</script>

<style>
.compBtn .ivu-dropdown button {
  width: 24px;
  border-left: 1px solid #eee;
  padding: 0px !important;
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
  text-align: center;
}
</style >
