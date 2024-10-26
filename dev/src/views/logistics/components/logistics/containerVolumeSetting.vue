<template>
  <div class="mainBox">
    <div class="card-content">
      <div class="pt10">
        <Form :model="searchCriteria" label-position="right" :label-width="60" ref="searchCriteria">
          <dyt-filter :filter-row="1">
            <Form-item label="使用状态" prop="status">
              <dyt-select v-model="searchCriteria.status" :clearable="false">
                <Option v-for="(item,index) in boxStatus" :key="'boxStatus'+index" :value="item.value">{{ item.label }}</Option>
              </dyt-select>
            </Form-item>
            <div slot="operation">
              <Button type="primary" icon="md-search" class="mr10" @click="search">查询</Button>
              <Button icon="md-refresh" @click="reset">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
    </div>
    <div class="mb10 mt10" v-if="getPermission('boxVolumnAuthority_add')">
      <Button type="primary" @click="addBoxVolume('add')">新增货箱体积</Button>
    </div>
    <div class="usersFilter">
      <Table highlight-row border :columns="columns" :data="tableList" :height="tableHeight" :loading="tableLoading">
        <template slot-scope="{ row }" slot="boxSize">
          <span>{{row.length}}*{{row.width}}*{{row.height}}cm</span>
        </template>
        <template slot-scope="{ row }" slot="createdTime">
          <span>{{getDataToLocalTime(row.createdTime, 'fulltime')}}</span>
        </template>
        <template slot-scope="{ row }" slot="status">
          <template v-for="(item,index) in boxStatus">
            <span :key="'boxStatus' + index" v-if="item.value === row.status">
              <span :style="{color: item.color}">{{item.label}}</span>
            </span>
          </template>
        </template>
        <template slot-scope="{ row }" slot="action">
          <Button size="small" class="mr10" @click="addBoxVolume('edit',row)" v-if="getPermission('boxVolumnAuthority_edit')">编辑</Button>
          <Button size="small" @click="addBoxVolume('detail',row)" v-if="getPermission('boxVolumnAuthority_check')">查看</Button>
        </template>
      </Table>
      <dyt-page :pageConfig="proPage" @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></dyt-page>
    </div>
    <!-- 弹框 -->
    <volume-setting-edit :modelVisible.sync="modelVisible" :modelData="modelData" :modelType="modelType" @search="search"></volume-setting-edit>
  </div>
</template>

<script>
import api from '@/api/api';
import volumeSettingEdit from './components/volumeSettingEdit';
import pageMixin from '@/components/mixin/page_mixin';
export default {
  name: 'containerVolumeSetting',
  mixins: [pageMixin],
  components: { volumeSettingEdit },
  data () {
    return {
      tableHeight: 650,
      searchCriteria: {
        status: 2
      },
      resetOption: {
        status: 2
      },
      columns: [
        {
          type: 'index',
          title: '序号',
          align: 'center',
          width: 70
        }, {
          title: '货箱型号代码',
          key: 'boxTypeCode',
          align: 'center',
          minWidth: 120
        }, {
          title: '货箱型号名称',
          key: 'boxTypeName',
          align: 'center',
          minWidth: 120
        }, {
          title: '货箱尺寸',
          slot: 'boxSize',
          align: 'center',
          minWidth: 120
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 180,
          tooltip: true
        },
        {
          title: '创建时间',
          slot: 'createdTime',
          align: 'center',
          minWidth: 120
        },
        {
          title: '状态',
          slot: 'status',
          align: 'center',
          minWidth: 120
        },
        {
          title: '操作',
          slot: 'action',
          align: 'center',
          width: 140
        }
      ],
      modelVisible: false,
      boxStatus: [
        { label: '全部', value: 2 },
        { label: '可用', color: '#19be6b', value: 1 },
        { label: '停用', color: '#ed4014', value: 0 }
      ],
      isEidt: false,
      modelData: {},
      modelType: ''
    };
  },
  created () {
    this.fetch(api.wmsBoxesList, 'post');
  },
  methods: {
    addBoxVolume (type, row) {
      let _slef = this;
      let fun = {
        // 添加
        add () {
          _slef.isEidt = true;
          _slef.modelData = row || {};
        },
        // 编辑
        edit (row) {
          _slef.isEidt = true;
          _slef.modelData = _slef.$common.copy(row);
        },
        // 详情
        detail (row) {
          _slef.isEidt = false;
          _slef.modelData = _slef.$common.copy(row);
        }
      }
      type && fun[type](row);
      this.modelVisible = true;
      this.modelType = type;
    },
    // 判断是否有权限
    getPermission (name) {
      let roleList = this.$store.state.roleList || [];
      let isAdmin = this.$store.state.isAdmin;
      return isAdmin || (name && roleList[name]);
    },
    getDataToLocalTime (date, type) { // 本地时间
      if (date === null) return null;
      let b;
      try {
        if (date.replace) {
          b = new Date(Date.parse(date.replace(/-/g, '/'))).getTime() + this.$common.getDefaultTimezoom() * 60 * 60 * 1000;
        }
      } catch (err) {
        b = new Date(date).getTime() + this.$common.getDefaultTimezoom() * 60 * 60 * 1000;
      }
      let d = new Date(b);
      let year = d.getFullYear();
      let month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1;
      let day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
      let hours = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
      let minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
      let seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
      if (type === 'fulltime') {
        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
      } else {
        return year + '-' + month + '-' + day;
      }
    }
  }
};
</script>

<style scoped></style>
