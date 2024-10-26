<template>
  <div class="qualityTestPro">
    <div>
        <Form class="formSearch fmb16" inline :label-width="120">
            <FormItem label="质检项目名称:">
              <Input placeholder="请输入质检项目名称"></Input>
            </FormItem>
            <FormItem label="质检内容描述:">
              <Input placeholder="请输入质检内容描述"></Input>
            </FormItem>
            <FormItem :label-width="30">
              <Button type="primary"  icon="ios-search" size="small" class="mr10">查询 </Button>
              <Button icon="md-refresh" size="small" class="ml30">重置</Button>
            </FormItem>
        </Form>
         <Button type="primary"  size="small" class="ml30" @click="isShowAddDialog = true">添加</Button>
    </div>
      <!-- 列表 -->
    <div class="orderTable normalTop commonFilter" >
      <Table
          highlight-row
          :loading="Tableloading"
          border
          :height="tableHeight"
          :columns="columns1"
          :data="data1" >
            <template slot-scope="{row}" slot="number">
              <span :style="{color: '#009999'}">{{row.number1}}</span>
            </template>
            <template slot="project">
              <span :style="{color: '#009999'}">衣长</span>
            </template>
            <template slot="description">
              <span :style="{color: '#009999'}">衣长测量</span>
            </template>
            <template slot="creator">
              <span :style="{color: '#009999'}">张三</span>
            </template>
            <template slot="createTime">
              <span :style="{color: '#009999'}">2016-10-03</span>
            </template>
            <template slot="action">
            <Button size="small" style="margin-right: 5px" type="info">编辑</Button>
            <Button size="small" type="error">删除</Button>
            </template>
          
          </Table >
      <div class="table-page" >
        <div class="table-page-right" >
          <Page
              :total="100" ></Page >
        </div >
      </div >
    </div >
     <!--添加质检项目-->
    <Modal
        v-model="isShowAddDialog" title="添加质检项目" :width="560" >
      <div class="normalTop" >
        <Form  :label-width="100"  >
          <div >
            <FormItem label="质检项目">
              <Input placeholder="请输入质检项目名称" v-model="projectName"></Input >
            </FormItem >
          </div >
          <div class="normalTop" >
            <FormItem label="质检内容描述" >
              <Input
                  type="textarea"
                  :rows="5"
                  placeholder="请输入质检内容描述"
                  :maxlength='500'
                  v-model="projectDescription" ></Input >
            </FormItem >
          </div >
        </Form >
      </div >
      <div slot="footer" style="text-align: center;" >
        <Button type="primary" @click="addList">保存 </Button >
        <Button type="primary" @click=" isShowAddDialog = false">关闭</Button >
      </div >
    </Modal >
  </div>
  
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
export default {
  mixins: [Mixin],
  data(){
    return{
      isShowAddDialog:false,
      projectName : "",
      projectDescription : "",
      columns1: [
        {
          title: '序号',
          key: 'number'
        },
        {
          title: '质检项目',
          key: 'project'
        },
        {
          title: '质检内容描述',
          key: 'description'
        },
        {
          title: '创建人',
          key: 'creator'
        },
        {
          title: '创建时间',
          key: 'createTime'
        },
        {
          title: '操作',
          key: 'action'
        }
      ],
      data1: [
        {
          number: '1',
          project: "衣长",
          description: '衣长测量',
          creator: '张三',
          createTime:"2016-10-03",
          action:"删除"
        },
        {
          number: '2',
          project: "衣长",
          description: '衣长测量',
          creator: '张三',
          createTime:"2016-10-03",
          action:"删除"
        },
        {
          number: '3',
          project: "肩宽",
          description: '肩宽测量',
          creator: '张三',
          createTime:"2016-10-03",
          action:"删除"
        },
        {
          number: '4',
          project: "肩宽",
          description: '肩宽测量',
          creator: '张三',
          createTime:"2016-10-03",
          action:"删除"
        },
      ]
    }
  },
  created(){
    this.tableHeight = this.getTableHeight(420);
    this.getList()

  },
  methods:{
    getList(params){
      this.axios.post(api.queryProjectList).then(function(data){
        console.log(data);
      })
    },
    addList(){
      console.log(this.projectName);
      console.log(this.projectDescription);
      this.axios.post(api.queryProjectList).then(function(data){
        console.log(data);
      })
      this.isShowAddDialog = false
    }
  }
}

</script>

<style>

</style>