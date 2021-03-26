<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="8">
            <a-form-item label="标题">
              <a-input placeholder="请输入标题" v-model="queryParam.title"></a-input>
            </a-form-item>
          </a-col>
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
      <a-button type="primary" icon="download" @click="handleExportXls('常见问题')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>

              </a-menu-item>
              <a-menu-item v-if="record.status==1">
                                                           <a-popconfirm title="确定冻结吗?" @confirm="() => handleFrozen(record.id,2)">
                                                             <a>冻结</a>
                                                           </a-popconfirm>
                                                         </a-menu-item>

                                                         <a-menu-item v-if="record.status==2">
                                                           <a-popconfirm title="确定解冻吗?" @confirm="() => handleFrozen(record.id,1)">
                                                             <a>解冻</a>
                                                           </a-popconfirm>
                                                         </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <appFaq-modal ref="modalForm" @ok="modalFormOk"></appFaq-modal>
  </a-card>
</template>

<script>



  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppFaqModal from './modules/AppFaqModal'
  import { axios } from '@/utils/request'

  import {initDictOptions, filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  export default {
    name: "AppFaqList",
    mixins:[JeecgListMixin],
    components: {
      AppFaqModal
    },
    data () {
      return {
        description: '常见问题管理页面',
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
            title:'标题',
            align:"center",
            dataIndex: 'title'
          },
          {
            title:'内容',
            align:"center",
            dataIndex: 'content'
          },

          {
            title:'排序',
            align:"center",
            dataIndex: 'sort'
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText'
          },
          {
            title:'创建人',
            align:"center",
            dataIndex: 'createBy'
          },
          {
            title:'创建日期',
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
          list: "/app/appFaq/list",
          delete: "/app/appFaq/delete",
          deleteBatch: "/app/appFaq/deleteBatch",
          exportXlsUrl: "/app/appFaq/exportXls",
          importExcelUrl: "app/appFaq/importExcel",
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
                               url: "/app/appFaq/changeState",
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