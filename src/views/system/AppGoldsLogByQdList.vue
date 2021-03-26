<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item label="用户帐号">
              <a-input placeholder="请输入用户帐号" v-model="queryParam.userAccount"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="书名">
              <a-input placeholder="请输入书名" v-model="queryParam.novelName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="10">
            <a-form-item label="购买时间" >
              <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择开始时间" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择结束时间"></j-date>
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
        @change="handleTableChange">

      </a-table>
    </div>


  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'

  export default {
    name: "AppGoldsLogList",
    mixins:[JeecgListMixin],
    components:{
      JDate
    },
    data () {
      return {
        description: '书币支付记录管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },


          {
            title:'用户帐号',
            align:"center",
            dataIndex: 'userAccount'
          },
          {
            title:'书名',
            align:"center",
            dataIndex: 'novelName'
          },
          {
            title:'购买章节',
            align:"center",
            dataIndex: 'chapterName'
          },
          {
            title:'支付书币',
            align:"center",
            dataIndex: 'golds',
            sorter:true,
          },{
            title:'书币余额',
            align:"center",
            dataIndex: 'accountBalance',
            sorter:true,
          },

          {
            title:'购买时间',
            align:"center",
            dataIndex: 'createTime',
            sorter:true,
          }
        ],
        url: {
          list: "/app/appGoldsLog/qd/list",
          delete: "/app/appGoldsLog/delete",
          deleteBatch: "/app/appGoldsLog/deleteBatch",
          exportXlsUrl: "/app/appGoldsLog/exportXls",
          importExcelUrl: "app/appGoldsLog/importExcel",
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
                               url: "/app/appGoldsLog/changeState",
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