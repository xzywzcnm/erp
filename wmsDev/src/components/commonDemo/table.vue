<template >
  <div>
    {{data1}}
    <Table :columns="columns1" :data="data1" ></Table >
  </div>
</template>

<script>
export default {
  name: 'table',
  data () {
    let v = this;
    return {
      columns1: [
        {
          title: 'Name',
          key: 'name',
          render (h, params) {
            return h('Input', {
              props: {
                value: params.row.name
              },
              style: {
                width: '120px',
                margin: '0 auto'
              },
              on: {
                // 01
                /*
                 input (val) {
                 v.data1[params.index].name = val;
                 }
                 */
                // 02
                /*
                 'on-change' (e) {
                 v.data1[params.index].name = e.target.value;
                 }
                 */
              }
            });
          }
        }, {
          title: 'age',
          key: 'age',
          render (h, params) {
            return h('InputNumber', {
              props: {
                size: 'small',
                value: params.row.age, // 将单元格的值给Input
                min: 0
              },
              style: {
                width: '70%'
              },
              on: {
                input (value) {
                  v.data1[params.index].age = value;
                }
              }
            });
          }
        }, {
          title: 'Radio',
          key: 'radio',
          render (h, params) {
            return h('RadioGroup', {
              props: {
                value: this.rowChioseNum
              },
              on: {
                'on-change': value => {
                  v.data1[params.index].radio = value;
                }
              }
            }, [
              h('Radio', {
                style: {
                  color: '#378000'
                },
                props: {
                  label: 1
                }
              }, '已打'), h('Radio', {
                style: {
                  color: '#ff0000'
                },
                props: {
                  label: 0
                }
              }, '未打')
            ]);
          }
        }
      ],
      data1: [
        {
          name: 'gan',
          age: '12',
          radio: '1'
        }, {
          name: 'gan1',
          age: '13',
          radio: '2'
        }
      ]
    };
  },
  created () {

  },
  props: {},
  watch: {},
  methods: {}
};
</script >

<style scoped >

</style >
