<template>
  <a-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleCancel"
    cancelText="关闭">
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    <div class="table-operator" v-if="viewModel==2">
    <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px" >重置</a-button>
    </div>
    <!-- 操作按钮区域 -->
    <div class="table-operator" v-if="viewModel==1">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('小说章节模板')">模板导出</a-button>
      <a-upload name="file" :data="{novelId:novelId}" :showUploadList="false" :disabled="excelLoading" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" :icon="excelLoading?'loading':'import'">导入</a-button>
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

      <a-dropdown v-if="selectedRowKeys.length > 0 && viewModel==1" >
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="changeNeedGolds(1)">免费</a-menu-item>
          <a-menu-item key="2" @click="changeNeedGolds('2')">

            收费
          </a-menu-item>
          <a-menu-item key="3" @click="changeNeedGolds('3')">
            会员免费
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 计费模式 <a-icon type="down" /></a-button>

      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div >
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="viewModel==1">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="viewModel == 1?columns:columns2"
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

        <span slot="action" slot-scope="text, record" v-if="viewModel==1">
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
        <span slot="action" slot-scope="text, record" v-else>
          <a @click="handleDetail(record)">查看</a>
        </span>

      </a-table>
    </div>

    <appNovelChapter-modal ref="modalForm" @ok="modalFormOk"></appNovelChapter-modal>
  </a-card>
  </a-modal>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppNovelChapterModal from './modules/AppNovelChapterModal'
  import { axios } from '@/utils/request'
  import { getAction } from '@/api/manage'

  export default {
    name: "AppNovelChapterList",
    mixins:[JeecgListMixin],
    components: {
      AppNovelChapterModal
    },
    data () {
      return {
        description: '小说章节管理页面',
        visible:false,
        title:"章节列表",
        confirmLoading: false,
        excelLoading:false,
        viewModel:1,

        // 表头
        columns: [


          {
            title:'章节名称',
            align:"center",
            dataIndex: 'chapterName'
          },
          {
            title:'序号',
            align:"center",
            sorter:"true",
            dataIndex: 'sort'
          },

          {
            title:'计费模式',
            align:"center",
            dataIndex: 'needGold',
            sorter:"true",
            customRender:function (t,r,index) {
              return t==1?"免费":t==2?"收费":"会员免费";
            }
          },
          {
            title:'书币',
            align:"center",
            dataIndex: 'golds',
            sorter:"true"
          },


          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText',
            sorter:"true"
          },
          {
            title:'更新日期',
            align:"center",
            dataIndex: 'updateTime',
            sorter:'true',
          },

          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        columns2: [
          {
            title:'章节名称',
            align:"center",
            dataIndex: 'chapterName'
          },
          {
            title:'序号',
            align:"center",
            sorter:"true",
            dataIndex: 'sort'
          },

          {
            title:'更新日期',
            align:"center",
            dataIndex: 'updateTime',
            sorter:'true',
          },

          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/app/appNovelChapter/list",
          delete: "/app/appNovelChapter/delete",
          deleteBatch: "/app/appNovelChapter/deleteBatch",
          exportXlsUrl: "/app/appNovelChapter/exportXls",
          importExcelUrl: "app/appNovelChapter/importExcel",
        },
        novelId:"",
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
      /* 导入 */
      handleImportExcel(info){
       this.excelLoading = true;

        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          this.excelLoading = false;
          if(info.file.response.success){

            this.$message.success(` ${info.file.response.message}`);
            this.loadData();
          } else {
            this.$message.error(`${info.file.name} ${info.file.response.message}.`);
          }
        } else if (info.file.status === 'error') {

          this.excelLoading = false;
          this.$message.error(`文件上传失败: ${info.file.msg} `);
        }
      },


      loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        if(!this.novelId) return;
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

      show(record){
        this.novelId = record.id;
        if(record.viewModel) this.viewModel = record.viewModel;
        this.title = this.title + " - "  + record.novelTitle;
        if(!this.novelId) {
          this.$message.warning('参数出错：novelId为空"');
          return;
        }
        this.visible = true;
        this.loadData()
      },

      changeNeedGolds(status){
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
            content: "是否修改选中数据?",
            onOk: function () {
              that.loading = true;
              axios({
                url: "/app/appNovelChapter/changeNeedGolds",
                method:'post' ,
                data: {ids: ids, status: status}
              }).then((res) =>{

                if (res.success) {
                  that.$message.success(res.message);
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                  that.loading = false;
                }
              })
            }
          });
        }
      },

      handleCancel () {
        this.close()
      },
      handleEdit: function (record) {
        this.$refs.modalForm.edit(record);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleAdd: function () {

        this.$refs.modalForm.add(this.novelId);
        this.$refs.modalForm.title = "新增";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleDetail:function(record){
        record.viewModel = 2;
        this.$refs.modalForm.edit(record);
        this.$refs.modalForm.title="详情";
        this.$refs.modalForm.disableSubmit = true;
      },
      close:function(){
        this.visible = false;
        this.dataSource=[];
        this.ipagination.total = 0;
        this.title="章节列表"
        this.ipagination.current=1

      },
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
                               url: "/app/appNovelChapter/changeState",
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