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
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入站点名称" v-model="queryParam.siteName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="10">
            <a-form-item label="日期" >
              <j-date v-model="queryParam.createTime_begin"  date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择开始时间" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end"  date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择结束时间"></j-date>
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

    <!-- table区域-begin -->
    <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
      <i class="anticon anticon-info-circle ant-alert-icon"></i> 当前页合计：
      <a style="margin-left: 3%;cursor:default" v-if="item.name" v-for="(item,idx) in totalColData" :key="idx">{{item.name}}：{{item.val}}</a>

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
          <span slot="orderSuccess" slot-scope="text, record" @click="showDia(record)" class="dia-txt">
            {{text}}
          </span>
          <span slot="orderFail" slot-scope="text, record" @click="showDia(record)" class="dia-txt">
            {{text}}
          </span>
           
      </a-table>
    </div>
    <!-- table区域-end -->
    <a-modal
      :dialog-style="{ top: '200px' }"
      :title="modalTitle"
      :visible="modalVisible"
      @ok="modalVisible=false"
      @cancel="modalVisible=false"
      :width="650"
    >
       <template slot="footer">
        <a-button @click="modalVisible=false">确认</a-button>
      </template>
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="orderColumns"
        :dataSource="orderData"
        :loading="loading"
        >

      </a-table>
    </a-modal>


  </a-card>
</template>



<script>

  import { axios } from '@/utils/request'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: 'SysOrdertotalList',
    mixins:[JeecgListMixin],
    components:{

      JDate

    },
    data(){
      return {
        isLoading:false,
        totalData:{},
        needTotal:1,
        modalVisible:false,
        modalTitle:'',
        columns: [
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
            title:'充值金额',
            align:"center",
            dataIndex: 'payMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥'+t.toFixed(2):t
            }
          },
          {
            title:'成功笔数',
            align:"center",
            sorter:true,
            dataIndex: 'orderSuccess',
            scopedSlots: {customRender: 'orderSuccess'},
          },
          {
            title:'失败笔数',
            align:"center",
            sorter:true,
            dataIndex: 'orderFail',
            scopedSlots: {customRender: 'orderFail'},
          },
          {
            title:'充值成功率',
            align:"center",
            dataIndex: 'orderRate',
            sorter:true,
            customRender:function (t,r,index) {
              return t?t+"%":t
            }

          },

          {
            title:'代理收入',
            align:"center",
            dataIndex: 'qdMoney',
            sorter:true
          },
          {
            title:'平台收入',
            align:"center",
            dataIndex: 'totalMoney',
            sorter:true
          },

        ],
        orderColumns:[
            {
              title:'渠道',
              align:"center",
              dataIndex: 'clientType',
              customRender:function (t,r,index) {
                return t==1?'羞羞漫画H5':t==2?'油条漫画H5':t==3?'油条漫画PC':t==4?'油条漫画iOS':t==5?'油条漫Android':'未知'
              }
            },
            {
              title:'微信成功笔数',
              align:"center",
              dataIndex: 'wechatSucess',
            },
            {
              title:'微信失败笔数',
              align:"center",
              dataIndex: 'wechatFaile',
            },
            {
              title:'支付宝成功笔数',
              align:"center",
              dataIndex: 'alipaySucess',
            },
            {
              title:'支付宝失败笔数',
              align:"center",
              dataIndex: 'alipayFaile',
            },
            {
              title:'成功率',
              align:"center",
              dataIndex: 'sucessRate',
              customRender:function (t,r,index) {
                return t?Number(t*100)+'%':''
              }
            },
        ],
        url: {
          list: "/system/sysTotal/list",
        },
        orderData:[]
        
      }
    },
    created:function() {

    },
    methods:{
      showDia(data){
        let queryData=JSON.parse(JSON.stringify(data))
        queryData.createTime=queryData.createTime.length>8?queryData.createTime.substring(0,queryData.createTime.length - 9):queryData.createTime;
        axios({
          url: '/system/sysTotal/payFaileAndSucess',
          method: 'get',
          data: { id: queryData.id}
        }).then(res => {
          if(res.code==0){
            this.modalTitle=queryData.createTime+'渠道充值分析'
            this.modalVisible=true
            this.orderData=res.result
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
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
  .dia-txt{
    cursor: pointer;
    color: #1890ff;
  }
</style>