<template>
  <a-card :bordered="false">

    <div class="top">
        <div class="tit">数据分析统计</div>
    </div>
    <a-radio-group v-model="queryParam.clientType" :style="{ marginBottom: '20px' }">
      <a-radio-button :value="1">羞羞漫画h5</a-radio-button>
      <a-radio-button :value="2">油条漫画h5</a-radio-button>
      <a-radio-button :value="3">油条漫画pc</a-radio-button>
      <a-radio-button :value="4">油条漫画ios</a-radio-button>
      <a-radio-button :value="5">油条漫画android</a-radio-button>
    </a-radio-group>
  
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

      </a-table>
    </div>
    <!-- table区域-end -->

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
               title: '日期/统计事件',
                align: "center",
                width: 150,
                dataIndex: 'createTime', 
            },
            {
               title: '章节页提示充值弹窗次数',
                align: "center",
                width: 150,
                dataIndex: 'rechargeAlert', 
            },
            {
               title: '提示充值弹窗的充值按钮点击量',
                align: "center",
                width: 150,
                dataIndex: 'rechargeAlertButton', 
            },
            {
               title: '充值按钮点击率',
                align: "center",
                width: 150,
                dataIndex: 'rechargeButtonRate', 
                customRender:function (t,r,index) {
                  return t?t+'%':'';
                }
            },
            {
               title: '充值页面',
                align: "center",
                width: 150,
                dataIndex: 'rechargePage', 
            },
            {
               title: '去支付按钮点击量',
                align: "center",
                width: 150,
                dataIndex: 'rechargeButton',
                
            },
            {
               title: '支付按钮点击率',
                align: "center",
                width: 150,
                dataIndex: 'payButtonRate', 
                customRender:function (t,r,index) {
                  return t?t+'%':'';
                }
            },
            {
               title: '订单提交数',
                align: "center",
                width: 150,
                dataIndex: 'orderCount', 
            },
            {
               title: '订单支付成功数',
                align: "center",
                width: 150,
                dataIndex: 'orderSucessCount', 
            },
            {
               title: '订单支付率',
                align: "center",
                width: 150,
                dataIndex: 'orderSucessRate',
               
            },
        ],
        url: {
          list: "/app/accessStatistic/search",
          delete: "/app/update/delete",
          edit: "/app/update/edit",
        },
        queryParam:{
            clientType:1
        }
      }
    },
    created:function() {
        // this.searchQuery()
    },
    watch:{
       "queryParam.clientType":function(val){
           this.searchQuery()
       } 
    },
    methods:{
        
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