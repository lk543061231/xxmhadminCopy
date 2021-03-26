<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入手机号" v-model="queryParam.mobile"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="5">
            <a-form-item label="状态">
              <a-select v-model="queryParam.state" placeholder="请选择">
                <a-select-option  :value="1">成功</a-select-option>
                <a-select-option  :value="2">失败</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="5">
            <a-form-item label="类型">
              <a-select v-model="queryParam.type" placeholder="请选择">
                <a-select-option  :value="1">登录</a-select-option>
                <a-select-option  :value="2">绑定手机</a-select-option>
                <a-select-option  :value="3">密码找回</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="10">
            <a-form-item label="时间" >
              <j-date v-model="queryParam.createTime_begin" showTime="true"  date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择开始时间" ></j-date>
              <span style="width: 10px;">~</span>
              <j-date v-model="queryParam.createTime_end" showTime="true"  date-format="YYYY-MM-DD HH:mm:ss" style="width:45%" placeholder="请选择结束时间"></j-date>
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
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('短信记录')">导出</a-button>

      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
         
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">
        
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>


        </span>

      </a-table>
    </div>


  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'

  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'

  export default {
    name: "AppMsgLogList",
    mixins:[JeecgListMixin],
    components: {
      JDate
    },
    data () {
      return {
        description: '短信记录管理页面',
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
            title:'手机号',
            align:"center",
            dataIndex: 'mobile'
          },
		  {
            title:'验证码',
            align:"center",
            dataIndex: 'code'
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'state',
            sorter:true,
            customRender:function (t,r,index) {
              return t==1?"成功":"失败";
            }

          },
		  {
            title:'发送类型',
            align:"center",
            dataIndex: 'type',
            sorter:true,
            customRender:function (t,r,index) {
              return t==1?"登录":t==2?"绑定手机":"密码找回";
            }
          },

          {
            title:'错误消息',
            align:"center",
            dataIndex: 'msg'
          },
          {
            title:'发送时间',
            align:"center",
            dataIndex: 'createTime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/app/appMsgLog/list",
          delete: "/app/appMsgLog/delete",
          deleteBatch: "/app/appMsgLog/deleteBatch",
          exportXlsUrl: "/app/appMsgLog/exportXls",
          importExcelUrl: "app/appMsgLog/importExcel",
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
                               url: "/app/appMsgLog/changeState",
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