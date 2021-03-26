<template>
  <a-modal
    :title="'订单统计'"
    :width="1500"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleCancel"
    cancelText="关闭">
    <div class="page-header-index-wide">
  <a-card :bordered="false">

    <a-row :gutter="24" style="background: #F0F2F5;padding-top: 24px">

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="isLoading" title="帐户余额" :total=" totalData.accountBalance?'￥' + totalData.accountBalance:'￥'+0">
          <a-tooltip title="帐户余额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <span>今日收入：{{totalData.moneyToday?'￥' + totalData.moneyToday:'￥'+0}}</span>
          <template slot="footer">
            <span >本周收入：{{totalData.moneyWeek?'￥' + totalData.moneyWeek:'￥'+0}}</span>
          </template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="isLoading" title="本月收入" :total=" totalData.moneyMonth?'￥' + totalData.moneyMonth:'￥'+0">
          <a-tooltip title="本月收入" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend :flag="totalData.monthRatio>0?'up':'down'" >
              <span slot="term">较上月</span>
              {{totalData.monthRatio}}%
            </trend>
          </div>
          <template slot="footer">上月收入：{{totalData.moneyLastMonth?'￥' + totalData.moneyLastMonth:'￥'+0}}</template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="isLoading" title="累计收入" :total=" totalData.moneyAll?'￥' + totalData.moneyAll:'￥'+0">
          <a-tooltip title="累计收入" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>

          <template slot="footer">累计结算：￥{{totalData.settleMoneyTotal?totalData.settleMoneyTotal:0}}</template>
        </chart-card>
      </a-col>

      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="isLoading" title="引导人数" :total=" totalData.userAll? totalData.userAll + '人':0 + '人'">
          <a-tooltip title="引导人数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <span >本月人数：{{totalData.userMonth?totalData.userMonth + '人':0 + '人'}}</span>
          </div>
          <template slot="footer">今日人数：{{totalData.userToday?totalData.userToday + '人':0 + '人'}}</template>
        </chart-card>
      </a-col>

    </a-row>

    <a-row>
      <a-col :span="24">
        <a-card :loading="isLoading" :bordered="false" title="每日汇总统计" :style="{ marginTop: '24px' }">
          <!-- 查询区域 -->
          <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
              <a-row :gutter="24">
                <a-col :md="10" :sm="12">
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
          <div>

            <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
              <i class="anticon anticon-info-circle ant-alert-icon"></i> 当前页合计：
              <a style="margin-left: 2.6%;cursor:default" v-if="item.name" v-for="(item,idx) in totalColData" :key="idx">{{item.name}}：{{item.val}}</a>

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
      </a-col>
    </a-row>

    <!-- table区域-end -->
  </a-card>
    </div>
  </a-modal>
</template>



<script>

  import { axios } from '@/utils/request'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import JDate from '@/components/jeecg/JDate'
  import {  getAction } from '@/api/manage'
  import ChartCard from '@/components/ChartCard'
  import ACol from "ant-design-vue/es/grid/Col"
  import ATooltip from "ant-design-vue/es/tooltip/Tooltip"
  import Trend from '@/components/Trend'
  export default {
    name: 'DqIndex',
    mixins:[JeecgListMixin],
    components:{
      JDate,
      ATooltip,
      ACol,
      ChartCard,
      Trend,
    },
    data(){
      return {
        confirmLoading:false,
        visible:false,
        isLoading:false,
        totalData:[],
        needTotal:1,
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
              return t?'￥ ' + t.toFixed(2):0;
            }
          },
          ,
          {
            title:'充值分成',
            align:"center",
            dataIndex: 'shareMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },
          {
            title:'下级分成',
            align:"center",
            dataIndex: 'lowerShareMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },

          {
            title:'书币充值',
            align:"center",
            dataIndex: 'itemPayTotal',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },
          {
            title:'书币充值笔数',
            align:"center",
            dataIndex: 'itemPayCount',
            sorter:true,
          },
          {
            title:'VIP充值',
            align:"center",
            dataIndex: 'vipPayTotal',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },
          {
            title:'VIP充值笔数',
            align:"center",
            dataIndex: 'vipPayCount',
            sorter:true,
          },
          {
            title:'独家解锁',
            align:"center",
            dataIndex: 'dujiaPayTotal',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },
          {
            title:'独家解锁笔数',
            align:"center",
            dataIndex: 'dujaiPayCount',
            sorter:true,
          },
          {
            title:'支付通道费',
            align:"center",
            dataIndex: 'commissionMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return '￥ ' + t.toFixed(2)
            }

          },
          {
            title:'收入总计',
            align:"center",
            dataIndex: 'totalMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):0;
            }
          },



        ],
        userId:"",
        totalData:{},
        loadEnd:0,
        url: {
          list: "/app/appUserTotal/list/qd",

        },
      }
    },

    methods:{
      show(userId){
        this.userId = userId;
        this.loadEnd = 1;
        this.loadData();
        this.getIndexTotals()
        this.visible= true;
        this.totalColData=[]

      },
      getIndexTotals(){

        let that = this;
        this.isLoading = true;
        axios({
          url: "sys/user/total/totalByIndex",
          method:'post' ,
          data:{userId:this.userId},
        }).then((res) =>{
          this.isLoading = false;
          if (res.code==0 && res.success) {

            if(res.result.moneyMonth && res.result.moneyLastMonth){
              let l = res.result.moneyLastMonth * 100;
              let t =  res.result.moneyMonth * 100;
              let r =  Math.round((t - l) / l *100);
              res.result.monthRatio = r.toFixed(2)
            }else{
              res.result.monthRatio = 0;
            }
            that.totalData = res.result;
          } else {
            that.$message.warning("统计数据获取失败");
          }
        })
      },

      loadData() {
        if(this.loadEnd==0) return;
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        if(!this.userId){
          this.$message.error("参数出错")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容

        var params = this.getQueryParams();//查询条件
        params.userId = this.userId;
        if(this.novelId) params.novelId = this.novelId;

        this.loading = true;
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
      handleCancel(){
        this.loadEnd = 0;
        this.userId="";
        this.visible= false;
        this.totalData =[]
      },

      getIndexTotal(){
        let that = this;
        this.isLoading = true;
        axios({
          url: "sys/user/total/totalByIndex",
          method:'post' ,
          data:{type:0},

        }).then((res) =>{
          this.isLoading = false;
          if (res.code==0 && res.success) {
            if(res.result.moneyMonth && res.result.moneyLastMonth){
              let l = res.result.moneyLastMonth * 100;
              let t =  res.result.moneyMonth * 100;
              let r =  Math.round((t - l) / l *100);
              res.result.monthRatio = r.toFixed(2)
            }else{
              res.result.monthRatio = 0;
            }
            that.totalData = res.result;
          } else {
            that.$message.warning("统计数据获取失败");
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
  .page-header-index-wide{
    height: 600px;
    overflow-y: scroll;
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
</style>