<template>
  <div class="mainBox">
    <Tabs type="card" @on-click="switchTab" value="skcColor">
      <TabPane label="SKC颜色管理" name="skcColor">
        <Card shadow>
          <div class="operaBtn">
            <div>
              <Button type="primary" class="mr10" @click="add()" v-if="getPermission('pdsSettings_skcColormanage_add')">添加</Button>
              <Button type="primary" @click="exportExcel()" :loading="exportLoading" v-if="getPermission('pdsSettings_skcColormanage_export')">导出</Button>
            </div>
            <div>
              <Button type="primary" @click="switchTab('skcColor')">刷新</Button>
            </div>
          </div>
          <div class="mt10">
            <Table :columns="columns" :data="tableList" border :loading="tableLoading" highlight-row :max-height="tableHeight">
              <!-- <template slot-scope="{ row,index }" slot="colorId">
                <span>{{preNum(row)}}</span>
              </template> -->
            </Table>
          </div>
          <sck-color :dialogObj="dialogObj" @fetch="fetch" />
        </Card>
      </TabPane>
      <TabPane label="SKC属性名管理" name="skcAttribute">
        <Card shadow>
          <div class="operaBtn">
            <div>
              <Button type="primary" class="mr10" @click="editTable()" v-if="!editStatus">编辑</Button>
              <Button type="primary" class="mr10" v-if="editStatus" @click="saveSkc()">保存</Button>
              <Button type="primary" class="mr10" v-if="editStatus" @click="editStatus = false">取消</Button>
            </div>
            <div>
              <Button type="primary" @click="switchTab('skcAttribute')">刷新</Button>
            </div>
          </div>
          <div class="mt10">
            <Table :columns="columns1" :data="tableList" border :loading="tableLoading" highlight-row :max-height="tableHeight">
              <!-- <template slot-scope="{ row,index }" slot="colorId">
                <span>{{preNum(row)}}</span>
              </template> -->
            </Table>
          </div>
        </Card>

      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import api from '@/api/api.js';
import pageMixin from '@/components/mixin/page_mixin';
import CommonMixin from "@/components/mixin/commonMixin";
import sckColor from './skcColormanage/add';
import { downFile } from '@/utils/comConfig.js';

export default {
  name: 'skcColormanage',
  components: { sckColor },
  mixins: [pageMixin, CommonMixin],
  data () {
    return {
      tableHeight: 685,
      columns: [
        {
          title: 'SKC码',
          key: 'skcCode'
        },
        {
          title: '颜色中文名称',
          key: 'color'
        },
        {
          title: '颜色英文名称（英式）',
          key: 'colorEn'
        },
        {
          title: '颜色英文名称（美式）',
          key: 'colorAmerican'
        },
        {
          title: '颜色英文名称（澳式）',
          key: 'colorAustralian'
        },
        {
          title: '颜色德文名称',
          key: 'colorGerman'
        },
        {
          title: '颜色波兰名称',
          key: 'colorPoland'
        },
        {
          title: '颜色法文名称',
          key: 'colorFrance'
        },
        {
          title: '颜色西班牙文名称',
          key: 'colorSpanish'
        }
      ],
      columns1: [
        {
          title: '中文名',
          key: 'cnName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.cnName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.cnName = event.target.value;
                  }
                }
              }, params.row.cnName)
            }
            return h('span', {
              props: {
                value: params.row.cnName
              }
            }, params.row.cnName)
          }
        },
        {
          title: '英文名（英式）',
          key: 'enName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.enName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.enName = event.target.value;
                  }
                }
              }, params.row.enName)
            }
            return h('span', {
              props: {
                value: params.row.enName
              }
            }, params.row.enName)
          }
        },
        {
          title: '英文名（美式）',
          key: 'anName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.anName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.anName = event.target.value;
                  }
                }
              }, params.row.anName)
            }
            return h('span', {
              props: {
                value: params.row.anName
              }
            }, params.row.anName)
          }
        },
        {
          title: '英文名（澳式）',
          key: 'auName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.auName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.auName = event.target.value;
                  }
                }
              }, params.row.auName)
            }
            return h('span', {
              props: {
                value: params.row.auName
              }
            }, params.row.auName)
          }
        },
        {
          title: '德文名',
          key: 'gerName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.gerName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.gerName = event.target.value;
                  }
                }
              }, params.row.gerName)
            }
            return h('span', {
              props: {
                value: params.row.gerName
              }
            }, params.row.gerName)
          }
        },
        {
          title: '波兰名',
          key: 'polName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.polName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.polName = event.target.value;
                  }
                }
              }, params.row.polName)
            }
            return h('span', {
              props: {
                value: params.row.polName
              }
            }, params.row.polName)
          }
        },
        {
          title: '法文名',
          key: 'fraName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.fraName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.fraName = event.target.value;
                  }
                }
              }, params.row.fraName)
            }
            return h('span', {
              props: {
                value: params.row.fraName
              }
            }, params.row.fraName)
          }
        },
        {
          title: '西班牙文名',
          key: 'spanishName',
          render: (h, params) => {
            if (this.editStatus == true) {
              return h('Input', {
                props: {
                  value: params.row.spanishName
                },
                on: {
                  'on-change': (event) => {
                    this.editDatas.spanishName = event.target.value;
                  }
                }
              }, params.row.spanishName)
            }
            return h('span', {
              props: {
                value: params.row.spanishName
              }
            }, params.row.spanishName)
          }
        }
      ],
      dialogObj: {
        modelVisible: false,
        data: {}
      },
      exportLoading: false,
      editStatus: false,
      // 提交更改的数据
      editDatas: {},
      tableData: []
    }
  },
  created () {
    this.searchTable();
  },
  activated () {},
  mounted () {},
  methods: {
    searchTable () {
      this.fetch(api.queryProductColorList, 'get');
    },
    // 添加
    add () {
      this.dialogObj.modelVisible = true;
    },
    // 导出
    exportExcel () {
      this.exportLoading = true;
      this.axios({
        method: 'post',
        url: api.exportProductColorList,
        responseType: 'blob',
        timeout: 600000
      }).then(({ resData, filename }) => {
        this.$Message.success('正在导出...');
        downFile(resData, filename)
      }).finally(() => {
        this.exportLoading = false;
      })
    },
    // 根据长度colorId前面增加0
    preNum (row) {
      if (!row.colorId) return;
      // let all = String(this.tableList.length).length;
      let all = 2;
      let num = String(row.colorId).length;
      let sub = all - num;

      let str = '';
      for (let i = 0; i < sub; i++) {
        str += '0';
      }
      return str + row.colorId;
    },
    editTable () {
      this.editStatus = true
    },
    saveSkc () {
      this.axios.post(api.updateProductColorAttribute, this.editDatas).then(res => {
        this.$Message.success('修改SKC属性名成功')
        this.editStatus = false
      })
    },
    switchTab (name) {
      if (name == 'skcColor') {
        this.searchTable();
      }
      if (name == 'skcAttribute') {
        this.fetch(api.queryProductColorAttribute, 'post').then(res => {
          this.editDatas = this.tableList[0]
        }).catch((err) => {
          console.error(err);
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.operaBtn{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
