<template>
  <a-card :bordered="false">

    <div class="top">
        <div class="tit">ios升级管理</div>
        <a-button @click="handleAdd('ios')" type="primary" icon="plus">新增版本</a-button>
    </div>
  
    <div>
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange">

        <span slot="action" slot-scope="text, record">
          <a-button class="btn" type='primary' @click="changeStatus(record)">{{record.status?'停用':'启用'}}</a-button>
          <a-button class="btn" type='primary' @click="handleEdit(record)">编辑</a-button>
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a-button type="primary" >删除</a-button>
          </a-popconfirm>
        </span>

      </a-table>
    </div>
    <!-- table区域-end -->
    

    <AppVersionModal ref="modalForm" @ok="modalFormOk" ></AppVersionModal>
  </a-card>
</template>



<script>

  import { axios } from '@/utils/request'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppVersionModal from './modules/AppVersionModal'
  import JDate from '@/components/jeecg/JDate'
    import {  httpAction } from '@/api/manage'
  export default {
    name: 'SysOrdertotalList',
    mixins:[JeecgListMixin],
    components:{

      JDate,
      AppVersionModal

    },
    data(){
      return {
        isLoading:false,
        totalData:{},
        needTotal:1,

        columns: [
            {
               title: '版本号',
                align: "center",
                width: 150,
                dataIndex: 'version', 
            },
            {
               title: '更新说明',
                align: "center",
                width: 150,
                dataIndex: 'content', 
            },
            {
               title: '是否强制更新',
                align: "center",
                width: 150,
                dataIndex: 'isEnforceUpdate', 
                customRender:(text)=>{
                  if(text){
                    return '是'
                  }else{
                    return '否'
                  }
                }
            },
            {
               title: '发布时间',
                align: "center",
                width: 150,
                dataIndex: 'updateTime', 
            },
            {
               title: '状态',
                align: "center",
                width:150,
                dataIndex: 'status', 
                customRender:(text)=>{
                  if(text){
                    return '正常'
                  }else{
                    return '停止'
                  }
                }
            },
            {
                title: '操作',
                width: 300,
                dataIndex: 'action',
                align:"center",
                scopedSlots: { customRender: 'action' },
            }
     
        ],
        url: {
          list: "/app/update/list",
          delete: "/app/update/delete",
          edit: "/app/update/edit",
        },
        queryParam:{
            clientType:2
        }
      }
    },
    created:function() {
        this.searchQuery()
    },
    methods:{
        changeStatus(data){
          var formData=JSON.parse(JSON.stringify(data))
          formData.status= data.status==1?0:1
          var that=this
          this.$confirm({
            title: "提示",
            content: "是否改变选中状态?",
            onOk: function () {
              httpAction(that.url.edit, formData,'put').then((res) => {
                if (res.success) {
                  that.$message.success(res.message);
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              });
            }
          });
        }
    }
  }
</script>

<style lang="scss" scoped>
.top{
    display: flex;
    justify-content: space-between;
    padding: 20px;
}
  .circle-cust{
    position: relative;
    top: 28px;
    left: -100%;
  }
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  /* 首页访问量统计 */
  .head-info {
    position: relative;
    text-align: left;
    padding: 0 32px 0 0;
    min-width: 125px;

    &.center {
      text-align: center;
      padding: 0 32px;
    }

    span {
      color: rgba(0, 0, 0, .45);
      display: inline-block;
      font-size: .95rem;
      line-height: 42px;
      margin-bottom: 4px;
    }
    p {
      line-height: 42px;
      margin: 0;
      a {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }
  .btn{
    margin-right: 10px;
  }
</style>