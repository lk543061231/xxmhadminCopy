<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="4" :sm="8" v-has="'user:list'">
            <a-form-item >
              <a-input placeholder="渠道帐号" v-model="queryParam.qdUserAccount"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="3" :sm="6" >
            <a-form-item label="结算方式">
              <a-select v-model="queryParam.settlementType" placeholder="请选择">
                <a-select-option :value="1">支付宝</a-select-option>
                <a-select-option :value="2">银行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="8" :sm="10">
            <a-form-item label="结算时间" >
              <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">


        <template slot="spanSlot" slot-scope="text">
          <span  style="color: red" v-if="text">￥{{text.toFixed(2)}}</span>
          <span  style="color: red" v-else>已结算</span>

        </template>

      </a-table>
    </div>


  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'
  import { mapGetters } from 'vuex'
  import { getAction, } from '@/api/manage'

  export default {
    name: "SysUserSettleLogList",
    mixins:[JeecgListMixin],
    components: {
    JDate
    },
    data () {
      return {
        description: '渠道结算记录管理页面',
        // 表头
        columns: [
          {
            title:'用户帐号',
            align:"center",
            dataIndex: 'userAccount'
          },
          {
            title:'用户名',
            align:"center",
            dataIndex: 'userName'
          },
          {
            title:'结算金额',
            align:"center",
            dataIndex: 'money',
            sorter:true,
            scopedSlots: {customRender: "spanSlot"},

          },
          {
            title:'渠道标识',
            align:"center",
            dataIndex: 'channelId',
            sorter:true,
            customRender:function (t,r,index) {
              return t == 1?"一级":t==2?"二级":"未知"
            }
          },
          {
            title:'结算方式',
            align:"center",
            dataIndex: 'settlementType',
            customRender:function (t,r,index) {
              return t == 1?"支付宝":t==2?"银行":"未知"
            }

          },

          {
            title:'结算帐户',
            align:"center",
            dataIndex: 'payAccount',

          },
          {
            title:'收款人',
            align:"center",
            dataIndex: 'payName',
          },
          {
            title:'银行名称',
            align:"center",
            dataIndex: 'bankName',
          },
          {
            title:' 状态',
            align:"center",
            dataIndex: 'status',
            scopedSlots: {customRender: "spanSlot"},


          },
          {
            title:'备注',
            align:"center",
            dataIndex: 'note'
          },
          {
            title: '结算时间',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true
          },
        ],
        url: {
          list: "/system/sysUserSettleLog/list",

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
      ...mapGetters(["userInfo"]),
      loadData(arg) {
        let user = this.userInfo();
        if(user.channelId!=0){
          let tem = []
          for(let i in this.columns){
            if(this.columns[i].title != "渠道标识"){
              tem.push(this.columns[i])
            }
          }
          this.columns = tem
        }
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

        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.success) {

            this.dataSource = res.result.records;

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