<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入帐号" v-model="queryParam.account"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="链接名称" v-model="queryParam.linkName"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>

            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    
    <!-- 操作按钮区域 -->
    <div class="table-operator">



    </div>

    <!-- table区域-begin -->
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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

      </a-table>
    </div>


  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  import { axios } from '@/utils/request'

  export default {
    name: "AppUserList",
    mixins:[JeecgListMixin],
    components: {

    },
    data () {
      return {
        description: '用户数据管理页面',
        // 表头
        columns: [

          {
            title:'帐号',
            align:"center",
            dataIndex: 'account'
          },

          {
            title:'书币',
            align:"center",
            sorter:true,
            dataIndex: 'point'
          },
          {
            title:'首充',
            align:"center",
            dataIndex: 'firstPay',
            sorter:true,
            customRender:function (t,r,index) {
              return t == 0?"否":"是"
            }
          },
          {
            title:'VIP到期时间',
            align:"center",
            dataIndex: 'vipDueTime',
            sorter:true,
            customRender:function (text) {
              if(!text) return "未开通";
              var time = new Date(text);
              if(time.getTime() < new Date().getTime()) return "已过期"
              return text
            }
          },
          {
            title:'独家解锁',
            align:"center",
            dataIndex: 'dujiaLock',
            customRender:function (t,r,index) {
              return t == 0?"否":"是"
            }
          },
          {
            title:'上次登陆时间',
            align:"center",
            dataIndex: 'lastLoginTime',
            customRender:function (text) {
              return text
            }
          },
          {
            title:'上次登陆IP',
            align:"center",
            dataIndex: 'lastLoginIp'
          },

          {
            title:'注册时间',
            align:"center",
            dataIndex: 'createTime',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },{
            title:'引导链接 ',
            align:"center",
            dataIndex: 'linkName'
          },
        ],
        url: {
          list: "/app/appUser/qd/list",
          delete: "/app/appUser/delete",
          deleteBatch: "/app/appUser/deleteBatch",
          exportXlsUrl: "/app/appUser/exportXls",
          importExcelUrl: "app/appUser/importExcel",
        },
        dictOptions:{
        } 
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>