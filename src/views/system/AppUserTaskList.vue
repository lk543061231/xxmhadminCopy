<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="任务名称">
              <a-input placeholder="请输入任务名称" v-model="queryParam.taskName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="8">
            <a-form-item label="奖励类型">
              <j-dict-select-tag placeholder="请选择奖励类型" v-model="queryParam.taskType" dictCode="task_type"/>
            </a-form-item>
          </a-col>
          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="任务分类">
                <j-dict-select-tag placeholder="请选择任务分类" v-model="queryParam.cateType" dictCode="task_cate"/>
              </a-form-item>
            </a-col>
          </template>
          <a-col :md="6" :sm="8" >
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
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('任务中心')">导出</a-button>


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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />

        </span>

      </a-table>
    </div>

    <appUserTask-modal ref="modalForm" @ok="modalFormOk"></appUserTask-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppUserTaskModal from './modules/AppUserTaskModal'
  import { axios } from '@/utils/request'
  import {initDictOptions, filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import JDictSelectTag from '@/components/dict/JDictSelectTag.vue'
  export default {
    name: "AppUserTaskList",
    mixins:[JeecgListMixin],
    components: {
      JDictSelectTag,
      AppUserTaskModal
    },
    data () {
      return {
        description: '任务中心管理页面',
        // 表头
        columns: [
          {
            title:'任务图标',
            align:"center",
            dataIndex: 'taskIco',
            scopedSlots: {customRender: 'imgSlot'}
          },
          {
            title:'任务编号',
            align:"center",
            dataIndex: 'taskNo'
          },
          {
            title:'任务名称',
            align:"center",
            dataIndex: 'taskName'
          },

         /* {
            title:'任务描述',
            align:"center",
            dataIndex: 'taskSub'
          },*/

          {
            title:'奖励类型',
            align:"center",
            dataIndex: 'taskType',
            customRender:(text)=>{
              console.log(text)
              if(!text){
                return ''
              }else{
                return filterMultiDictText(this.dictOptions['taskType'], text+"")
              }
            }
          },
          {
            title:'奖励书币',
            align:"center",
            dataIndex: 'giveCoin'
          },
          {
            title:'奖励VIP',
            align:"center",
            dataIndex: 'giveVip',
            customRender:function (t,r,index) {
              return t?t:'无'
            }
          },
          {
            title:'任务分类',
            align:"center",
            dataIndex: 'cateType',
            customRender:(text)=>{
              if(!text){
                return ''
              }else{
                return filterMultiDictText(this.dictOptions['cateType'], text+"")
              }
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
          list: "/app/appUserTask/list",
          delete: "/app/appUserTask/delete",
          deleteBatch: "/app/appUserTask/deleteBatch",
          exportXlsUrl: "/app/appUserTask/exportXls",
          importExcelUrl: "app/appUserTask/importExcel",
        },
        dictOptions:{
         taskType:[],
         cateType:[],
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
                               url: "/app/appUserTask/changeState",
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
        initDictOptions('task_type').then((res) => {
          if (res.success) {
            this.$set(this.dictOptions, 'taskType', res.result)
          }
        })
        initDictOptions('task_cate').then((res) => {
          if (res.success) {
            this.$set(this.dictOptions, 'cateType', res.result)
          }
        })
      }
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>