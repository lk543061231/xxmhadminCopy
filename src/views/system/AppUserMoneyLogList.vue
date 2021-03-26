<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="8" :sm="10">
            <a-form-item label="时间" >
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
    <!-- 查询区域-END -->
    


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

        <template slot="spanSlot" slot-scope="text">
          <span  style="color: red" v-if="text>0">+{{text?text.toFixed(2):0}}</span>
          <span  style="color: #0DBD02" v-else>{{text?text.toFixed(2):0}}</span>
        </template>



      </a-table>
    </div>


  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'

  export default {
    name: "AppUserMoneyLogList",
    mixins:[JeecgListMixin],
    components: {
      JDate
    },
    data () {
      return {
        description: '渠道资金变动记录管理页面',
        // 表头
        columns: [
          {
            title: '时间',
            dataIndex: 'createTime',
            key:'rowIndex',
            align:"center"
          },
          {
            title:'变动前',
            align:"center",
            sorter:true,
            dataIndex: 'changeLast',
            customRender:function (t,r,index) {
              return t?t.toFixed(2):0
            }
          },

          {
            title:'变动金额',
            align:"center",
            sorter:true,
            dataIndex: 'money',
            scopedSlots: {customRender: "spanSlot"}
          },


          {
            title:'变动类型',
            align:"center",
            dataIndex: 'changeType',
            sorter:true,
            customRender:function (t,r,index) {
              if(t==1) return "充值收入"
              if(t==2) return "下级分成"
              if(t==3) return "结算支出"
              return  "未知"
            },
          },
          {
            title:'变动后',
            align:"center",
            dataIndex: 'changeNow',
            sorter:true,
            customRender:function (t,r,index) {
              return t?t.toFixed(2):0
            }

          },
        ],
        url: {
          list: "/app/appUserMoneyLog/list",
          delete: "/app/appUserMoneyLog/delete",
          deleteBatch: "/app/appUserMoneyLog/deleteBatch",
          exportXlsUrl: "/app/appUserMoneyLog/exportXls",
          importExcelUrl: "app/appUserMoneyLog/importExcel",
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

        batchFrozen: function (status) {
                        if (this.selectedRowKeys.length <= 0) {
                          this.$message.warning('请选择一条记录！');
                          return false;
                        } else {
                          let ids = "";
                          let that = this;
                          that.selectedRowKeys.forEach(function (val) {
                            ids += val + ",";
                          });
                          that.$confirm({
                            title: "确认操作",
                            content: "是否" + (status == 1 ? "解冻" : "冻结") + "选中数据?",
                            onOk: function () {
                              that.changeState(ids,status);
                            }
                          });
                        }
                      },
          handleFrozen: function (id, status) {
                         this.changeState(id,status);
                       },
       changeState(ids,status){
                             let that = this;
                             axios({
                               url: "/app/appUserMoneyLog/changeState",
                               method:'post' ,
                               data: {ids: ids, status: status}
                             }).then((res) =>{
                               if (res.success) {
                                 that.$message.success(res.message);
                                 that.loadData();
                                 that.onClearSelected();
                               } else {
                                 that.$message.warning(res.message);
                               }
                             })
                           },
      initDictConfig(){
      }
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>