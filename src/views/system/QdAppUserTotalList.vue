<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
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
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: 'QdAppUserTotalList',
    mixins:[JeecgListMixin],

    components:{

      JDate

    },
    data(){
      return {
        isLoading:false,
        totalData:{},

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
            title:'充值人数',
            align:"center",
            dataIndex: 'payUserCount',
            sorter:true,
            customRender:function (t,r,index) {
              return t + '人';
            }
          },
          {
            title:'新增用户数',
            align:"center",
            dataIndex: 'newUserCount',
            sorter:true,
            customRender:function (t,r,index) {
              return t + '人';
            }
          },
          {
            title:'累计用户数',
            align:"center",
            dataIndex: 'userTotalCount',
            sorter:true,
            customRender:function (t,r,index) {
              return t + '人';
            }
          },



        ],
        url: {
          list: "/app/appUserTotal/list",

        },
      }
    },
    created:function() {
      this.getIndexTotal()
    },
    methods:{
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