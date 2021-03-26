<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item >
              <a-input placeholder="订单号" v-model="queryParam.orderNum"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="6">
            <a-form-item >
              <a-input placeholder="渠道帐号" v-model="queryParam.qdUserAccount"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8" >
            <a-form-item label="渠道标识">
              <a-select v-model="queryParam.channelId" placeholder="请选择">
                <a-select-option :value="1">一级</a-select-option>
                <a-select-option :value="2">二级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8" >
            <a-form-item label="扣量">
              <a-select v-model="queryParam.isDeduct" placeholder="请选择">
                <a-select-option :value="1">是</a-select-option>
                <a-select-option :value="0">否</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>


          <template v-if="toggleSearchStatus">
            <a-col :md="8" :sm="10">
              <a-form-item label="充值时间" >
                <j-date v-model="queryParam.createTime_begin" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间" ></j-date>
                <span style="width: 10px;">~</span>
                <j-date v-model="queryParam.createTime_end" :showTime="true" date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
              </a-form-item>
            </a-col>

            <a-col :md="4" :sm="8" >
              <a-form-item label="收入来源">
                <a-select v-model="queryParam.source" placeholder="请选择">
                  <a-select-option :value="1">用户充值</a-select-option>
                  <a-select-option :value="2">下级分成</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>



          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    
    <!-- 操作按钮区域 -->
    

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
  import JDate from '@/components/jeecg/JDate'
  export default {
    name: "AppLinkLogList",
    mixins:[JeecgListMixin],
    components: {
      JDate
    },
    data () {
      return {
        description: '链接充值记录管理页面',
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
            title:'订单号',
            align:"center",
            dataIndex: 'orderNum'
          },
          {
            title:'渠道帐号',
            align:"center",
            dataIndex: 'qdUserAccount'
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
            title:'商品名称',
            align:"center",
            dataIndex: 'itemName',

          },
          {
            title:'充值金额',
            align:"center",
            dataIndex: 'payMoney',
            sorter:true,
            customRender:function (t,r,index) {
              return '￥ ' + t.toFixed(2)
            }
          },
          {
            title:'分成比%',
            align:"center",
            dataIndex: 'profitShare',
            sorter:true,
          },
          {
            title:'分成金额',
            align:"center",
            dataIndex: 'money',
            sorter:true,
            customRender:function (t,r,index) {
              return '￥ ' + t.toFixed(2)
            }

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
            title:'是否扣量',
            align:"center",
            dataIndex: 'isDeduct',
            sorter:true,
            customRender:function (t,r,index) {
              return t==1?"是":"否"
            }

          },
          {
            title:'收入来源',
            align:"center",
            dataIndex: 'source',
            sorter:true,
            customRender:function (t,r,index) {
              if(t==1) return "用户充值"
              if(t==2) return "下级分成"
            }
          },

          {
            title: '充值时间',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true
          }
        ],
        url: {
          list: "/app/appLinkLog/list",
          delete: "/app/appLinkLog/delete",
          deleteBatch: "/app/appLinkLog/deleteBatch",
          exportXlsUrl: "/app/appLinkLog/exportXls",
          importExcelUrl: "app/appLinkLog/importExcel",
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
                               url: "/app/appLinkLog/changeState",
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