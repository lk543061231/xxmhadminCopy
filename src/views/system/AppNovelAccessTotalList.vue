<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">

        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item >
              <a-input placeholder="漫画名称" v-model="queryParam.novelName"></a-input>
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
        
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
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
    name: "AppNovelAccessTotalList",
    mixins:[JeecgListMixin],
    components: {
      JDate
    },
    data () {
      return {
        description: '小说访问统计报表管理页面',
        // 表头
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
            title:'名称',
            align:"center",
            dataIndex: 'novelName'
          },
          {
            title:'类型',
            align:"center",
            dataIndex: 'type',
            sorter:true,
            customRender:function (t,r,index) {
              return t==1?"小说":"漫画"
            }

          },

          {
            title:'访问数',
            align:"center",
            sorter:true,
            dataIndex: 'accessCount'
          },
          {
            title:'消费书币',
            align:"center",
            sorter:true,
            dataIndex: 'goldsCount'
          },

        ],
        url: {
          list: "/app/appNovelAccessTotal/list",
          delete: "/app/appNovelAccessTotal/delete",
          deleteBatch: "/app/appNovelAccessTotal/deleteBatch",
          exportXlsUrl: "/app/appNovelAccessTotal/exportXls",
          importExcelUrl: "app/appNovelAccessTotal/importExcel",
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

       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>