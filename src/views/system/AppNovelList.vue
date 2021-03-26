<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item >
              <a-input placeholder="请输入书名 / 作者名 关键字" v-model="queryParam.key"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="4" :sm="8">
            <a-form-item label="所属分类">
              <a-select v-model="queryParam.categoryId" placeholder="请选择">
                <a-select-option v-for="(item,idx) in cateList" :key="idx" :value="item.id">{{item.categoryName}}</a-select-option>

              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="首页属性">
              <a-select v-model="queryParam.indexColId" placeholder="请选择">
                <a-select-option v-for="(item,idx) in colList" :key="idx" :value="item.id">{{item.title}}</a-select-option>
              </a-select>
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
      <!--<a-button type="primary" icon="download" @click="handleExportXls('小说信息')">导出</a-button>
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

      <a-dropdown v-if="colList.length > 0 && selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item  @click="batchSetCol(item.id)" v-for="(item,idx) in colList" :key="idx">{{item.title}}</a-menu-item>

        </a-menu>
        <a-button style="margin-left: 8px"> 首页属性 <a-icon type="down" /></a-button>
      </a-dropdown>

      <a-dropdown v-if="cateList.length > 0 && selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item  @click="batchMove(item.id)" v-for="(item,idx) in cateList" :key="idx">{{item.categoryName}}</a-menu-item>

        </a-menu>
        <a-button style="margin-left: 8px"> 批量移动 <a-icon type="down" /></a-button>
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
          <img v-else :src="getImgView(text)" height="100px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
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
          <a @click="handleChapter(record)">章节管理</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="手动采集该章节吗?" @confirm="() => handleCj(record.id)">
                  <a>手动采集</a>
                </a-popconfirm>
              </a-menu-item>
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

    <appNovel-modal ref="modalForm" @ok="modalFormOk"></appNovel-modal>
    <appNovelChapterList-modal ref="chapterForm" @ok="modalFormOk"></appNovelChapterList-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppNovelModal from './modules/AppNovelModal'
  import AppNovelChapterListModal from './AppNovelChapterList'
  import { axios } from '@/utils/request'

  var cateList= [];
  function getCateName(id) {
    for(let i in cateList){
      if(cateList[i].id == id)
        return cateList[i].categoryName;
    }
  }
  export default {
    name: "AppNovelList",
    mixins:[JeecgListMixin],
    components: {
      AppNovelModal,
      AppNovelChapterListModal
    },
    data () {
      return {
        description: '小说信息管理页面',
        cateList:[],
        // 表头
        columns: [

          {
            title:'封面',
            align:"center",
            dataIndex: 'imgUrl',
            scopedSlots: {customRender: "imgSlot"}
          },
          {
            title:'书名',
            align:"center",
            dataIndex: 'novelTitle'
          },
          {
            title:'作者',
            align:"center",
            dataIndex: 'author'
          },
          /*{
            title:'简介',
            align:"center",
            dataIndex: 'introduction',
            width:250,
            customRender:function (t,r,index) {
              if(t.length>30)
                return t.substring(0,27) + "..."
            }
          },*/
          {
            title:'章节数',
            align:"center",
            dataIndex: 'chapterCount',

          },
          {
            title:'字数',
            align:"center",
            dataIndex: 'keyWords',
            sorter:'true',
            customRender:function (t,r,index) {
              if(t>10000){
                let s = (t / 10000);
                return s.toFixed(2) + " 万"
              }else{
                return t;
              }

            }
          },
          {
            title:'点赞数',
            align:"center",
            dataIndex: 'praiseCount',
            sorter:'true',
          },
          {
            title:'点击数',
            align:"center",
            dataIndex: 'clickCount',
            sorter:'true',
          },
          {
            title:'收藏数',
            align:"center",
            dataIndex: 'favCount',
            sorter:'true',
          },
          {
            title:'所属分类',
            align:"center",
            dataIndex: 'categoryId',
            sorter:'true',
            customRender:function (t,r,index) {
              return getCateName(t);
            }
          },

          {
            title:'连载类型',
            align:"center",
            dataIndex: 'overType',
            sorter:'true',
            customRender:function (t,r,index) {
              return t==1?"连载":"完结";
            }
          },
          {
            title:'排序',
            align:"center",
            dataIndex: 'sort',
            sorter:'true',
          },

          {
            title:'推荐',
            align:"center",
            dataIndex: 'isReco',
            sorter:'true',
            customRender:function (t,r,index) {
              return t==1?"是":"否";
            }
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText',
            sorter:'true',
          },


          {
            title:'创建日期',
            align:"center",
            dataIndex: 'createTime',
            sorter:'true',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
          }
        ],
        colList:[],
        url: {
          list: "/app/appNovel/list",
          delete: "/app/appNovel/delete",
          deleteBatch: "/app/appNovel/deleteBatch",
          exportXlsUrl: "/app/appNovel/exportXls",
          importExcelUrl: "app/appNovel/importExcel",
          imgerver: window._CONFIG['domianURL']+"/sys/common/view",
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
    created:function(){
      this.getCateList()
      this.getIndexRowList()
    },
    methods: {
      getAvatarView(text){
        return this.url.imgerver +"/"+ text;
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
                               url: "/app/appNovel/changeState",
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
      },
      handleEdit: function (record) {
        this.$refs.modalForm.edit(record,cateList);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleAdd: function () {
        this.$refs.modalForm.add(cateList,colList);
        this.$refs.modalForm.title = "新增";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleChapter: function (record) {
        this.$refs.chapterForm.show(record);

      },

      handleCj(id){
        let c = 0;
        let that = this;
        this.loading = true;
        axios({
          url: "/app/api/actionOne",
          method:'post' ,
          data:{id:id,type:1},

        }).then((res) =>{

          if (res.success) {

          } else {
            that.$message.warning(res.message);
            c=1;
            that.loading = false;
          }
        }).catch(function (error) {
          c=1;
          that.loading = false;
        })

        setTimeout(()=>{
          if(c==0){
            that.loading = false;
            that.$message.success("采集请求已发送");
          }

        },3000)


      },

      getIndexRowList(){
        let that = this;
        axios({
          url: "/app/appIndexRow/getList",
          method:'post' ,
          data:{type:1},

        }).then((res) =>{

          if (res.code==0 && res.success) {

            that.colList = res.result

          } else {
            that.$message.warning("首页栏目列表获取失败");
          }
        })
      },

      handleEdit: function (record) {
        this.$refs.modalForm.edit(record,cateList,this.colList);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleAdd: function () {
        this.$refs.modalForm.add(cateList,this.colList);
        this.$refs.modalForm.title = "新增";
        this.$refs.modalForm.disableSubmit = false;
      },


      getCateList(){
        let that = this;
        axios({
          url: "/app/api/getNovelCategoryList",
          method:'post' ,
          data:{type:0},

        }).then((res) =>{

          if (res.code==0 && res.success) {
            cateList = res.result;
            that.cateList = cateList
          } else {
            that.$message.warning("小说分类列表获取失败");
          }
        })
      },

      batchSetCol(id){
        if(id) {
          if (this.selectedRowKeys.length <= 0) {
            this.$message.warning('请选择一条记录！');
            return;
          } else {
            var ids = "";
            for (var a = 0; a < this.selectedRowKeys.length; a++) {
              ids += this.selectedRowKeys[a] + ",";
            }
            var that = this;
            this.$confirm({
              title: "确认修改",
              content: "是否批量设置/取消首页属性?",
              onOk: function() {
                that.loading = true;
                axios({
                  url: "/app/appIndexRow/batchSetCol",
                  method:'post' ,
                  data:{id:id,ids:ids,type:1},

                }).then((res) =>{
                  that.loading = false;
                  if ( res.success) {
                    that.loadData()
                    that.$message.success("设置成功");
                    that.selectedRowKeys = [];
                  } else {
                    that.$message.warning(res.message);
                  }
                })

              }
            })
          }
        }
      },

      batchMove(id){
        if(id) {
          if (this.selectedRowKeys.length <= 0) {
            this.$message.warning('请选择一条记录！');
            return;
          } else {
            var ids = "";
            for (var a = 0; a < this.selectedRowKeys.length; a++) {
              ids += this.selectedRowKeys[a] + ",";
            }
            var that = this;
            this.$confirm({
              title: "确认修改",
              content: "是否批量移动分类?",
              onOk: function() {
                that.loading = true;
                axios({
                  url: "/app/appNovel/batchMove",
                  method: 'post',
                  data: { id: id, ids: ids },

                }).then((res) => {
                  that.loading = false;
                  if (res.success) {
                    that.loadData()
                    that.$message.success("设置成功");
                    that.selectedRowKeys = [];
                  } else {
                    that.$message.warning(res.message);
                  }
                })

              }
            })
          }
        }
      },
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>