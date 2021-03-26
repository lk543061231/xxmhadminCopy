<template>

  <a-modal
    :title="'充值明细'"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleCancel"
    cancelText="关闭">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :md="4" :sm="8">
              <a-form-item >
                <a-input placeholder="用户帐号" v-model="queryParam.userAccount"></a-input>
              </a-form-item>
            </a-col>

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
      <div>
        <a-table
          ref="table"
          bordered
          size="middle"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          @change="handleTableChange"
        >
        </a-table>
      </div>
    </a-card>
  </a-modal>
</template>

<script>
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import { getAction } from '@/api/manage'
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: 'QdUserDownList',
    mixins: [JeecgListMixin],
    components:{
      JDate
    },
    data(){
      return{
        confirmLoading:false,
        visible:false,

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
            title:'订单号',
            align:"center",
            dataIndex: 'orderNum'
          },
          {
            title:'用户帐号',
            align:"center",
            dataIndex: 'userAccount'
          },
          {
            title:'充值金额',
            align:"center",
            dataIndex: 'payMoney',
            sorter:true,
          },
          {
            title:'分成比 %',
            align:"center",
            dataIndex: 'profitShare',
            sorter:true,
          },
          {
            title:'分成金额',
            align:"center",
            dataIndex: 'money',
            sorter:true,
          },

          {
            title: '充值时间',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true
          }

        ],
        linkId:"",
        url: {
          imgerver: window._CONFIG['domianURL'] + "/sys/common/view",
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/app/appLinkLog/detail/list",
          delete: "/sys/user/deleteQdUser",
          deleteBatch: "/sys/user/deleteBatch",
          exportXlsUrl: "/sys/user/exportXls",
          importExcelUrl: "sys/user/importExcel",
        },
      }
    },
    methods:{
      showModal(id){
        this.visible = true;
        this.linkId = id;
        this.loadData();
      },
      handleCancel(){
        this.visible = false;
        this.dataSource = [];
        this.linkId = ""
      },
      loadData(arg) {
        if(!this.linkId) return;
        console.log(213)
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        params.linkId = this.linkId;


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

</style>