<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入渠道帐号" v-model="queryParam.userAccount"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="10">
            <a-form-item label="时间" >
              <j-date v-model="queryParam.createTime_begin"  date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end"  date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
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
    

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 当前页合计：
        <a style="margin-left: 2%;cursor:default" v-if="item.name" v-for="(item,idx) in totalColData" :key="idx">{{item.name}}：{{item.val}}</a>

      </div>

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
        

      </a-table>
    </div>

    
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  
  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'
  import { getAction, } from '@/api/manage'
  export default {
    name: "AppLinkLogTotalList",
    mixins:[JeecgListMixin],
    components: {
      JDate
    },
    data () {
      return {
        description: '分成统计',
        needTotal:1,
        // 表头
        columns: [
          /*{
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },*/
          {
            title: '日期',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true,
            customRender:function (t,r,index) {
              return t.length>8?t.substring(0,t.length - 9):t;
            }
          },
          {
            title:'渠道帐号',
            align:"center",
            dataIndex: 'userAccount',
            sorter:true,

          },
          {
            title:'订单数',
            align:"center",
            dataIndex: 'orderCount',
            sorter:true,

          },


          {
            title:'充值金额',
            align:"center",
            dataIndex: 'payMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):t
            }
          },
          {
            title:'一级分成',
            align:"center",
            dataIndex: 'shareMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):t
            }
          },
          {
            title:'充值分成',
            align:"center",
            dataIndex: 'money',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):t
            }
          },

        ],
        url: {
          list: "/app/appLowerUserTotal/list",

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
      loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        if(this.novelId) params.novelId = this.novelId;
        params.source = 2;
        this.loading = true;
        this.totalColData = [];
        getAction(this.url.list, params).then((res) => {
          if (res.success) {

            this.dataSource = res.result.records;
            if(this.needTotal && this.dataSource.length>0) {

              let colData = this.MyCommon.makeTotal(this.dataSource[0],this.dataSource);

              for(let key in colData){
                if(colData[key]>0 && key!='id' && key!='userAllCount'){
                  let title = this.MyCommon.getColName(this.columns,key);

                  this.totalColData.push({
                    name: title,
                    val:title.indexOf("成功率")>=0?colData[key] + " %" : colData[key]
                  })
                }

              }
            }
            this.ipagination.total = res.result.total;
          }
          if(res.code===510){
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
      },
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>