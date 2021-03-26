<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item >
              <a-input placeholder="链接名称" v-model="queryParam.linkName"></a-input>
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
      <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('推广链接')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
          <a-menu-item key="2" @click="batchFrozen('2')">
                              <a-icon type="lock" />
                              冻结
                            </a-menu-item>
                            <a-menu-item key="3" @click="batchFrozen('1')">
                              <a-icon type="unlock" />
                              解冻
                            </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
      <i class="anticon anticon-info-circle ant-alert-icon"></i> 当前页合计：
      <a style="margin-left: 2%;cursor:default" v-if="item.name" v-for="(item,idx) in totalColData" :key="idx">{{item.name}}：{{item.val}}</a>

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
        
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="hrefSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;"></span>
          <a :href="text" target="_blank">{{text}}</a>
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
           <a @click="toDetail(record)">充值明细</a>




        </span>

      </a-table>
    </div>


    <appLinkLogDetail-modal ref="appLinkLogDetailForm" @ok="modalFormOk"></appLinkLogDetail-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import { axios } from '@/utils/request'
  import AppLinkLogDetailModal from  './modules/AppLinkLogDetailModal'

  export default {
    name: "AppLinkList",
    mixins:[JeecgListMixin],
    components: {

      AppLinkLogDetailModal,

    },
    data () {
      return {
        description: '推广链接统计页面',
        needTotal:1,
        // 表头
        columns: [

          {
            title: '创建时间',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true
          },
          {
            title:'链接名称',
            align:"center",
            dataIndex: 'linkName'
          },
          {
            title:'链接地址',
            align:"center",
            dataIndex: 'linkUrl',
            scopedSlots: {customRender: "hrefSlot"}
          },
          {
            title:'推广内容',
            align:"center",
            dataIndex: 'novelName'
          },
          {
            title:'推广类型',
            align:"center",
            dataIndex: 'type',
            customRender:function (t,r,index) {
              return t==1?"小说":"漫画"
            }
          },
          {
            title:'文案标题',
            align:"center",
            dataIndex: 'contentTitle'
          },
          {
            title:'访问量',
            align:"center",
            dataIndex: 'accessCount',
            sorter: true
          },
          {
            title:'引导人数',
            align:"center",
            dataIndex: 'userCount',
            sorter: true
          },
          {
            title:'充值金额',
            align:"center",
            dataIndex: 'payMoney',
            sorter: true,
            customRender:function (t,r,index) {
              return t?'￥ ' + t.toFixed(2):t
            }
          },

          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/app/appLink/list",
          delete: "/app/appLink/delete",
          deleteBatch: "/app/appLink/deleteBatch",
          exportXlsUrl: "/app/appLink/exportXls",
          importExcelUrl: "app/appLink/importExcel",
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
      toDetail(record){
        this.$refs.appLinkLogDetailForm.showModal(record.id);

      },

       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
  .c-btn{
    height: 30px;
    line-height: 30px;
    font-size: 20px;
    color: #FFFFFF;
    letter-spacing: 0.29px;
    font-weight: 500;
    background: #1AAE8B;
    text-align: center;
    margin-left: 10px;
  }

</style>