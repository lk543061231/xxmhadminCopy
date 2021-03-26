<template>
  <a-modal
    :title="'漫画选择'"
    :width="1200"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    :maskClosable="false"
    @cancel="handleCancel"
    cancelspan="关闭">
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
    <div class="table-view" style="height: 500px;overflow-y: scroll">

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
          <img v-else :src="getImgView(text)" height="100px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <span slot="action" slot-scope="text, record">

          <a @click="selectItem(record)">选中</a>

        </span>

      </a-table>
    </div>


  </a-card>
  </a-modal>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import {  getAction } from '@/api/manage'
  import { axios } from '@/utils/request'

  var cateList= [];
  function getCateName(id) {
    for(let i in cateList){
      if(cateList[i].id == id)
        return cateList[i].categoryName;
    }
  }
  export default {
    name: "appComicList",
    mixins:[JeecgListMixin],
    components: {

    },
    data () {
      return {
        description: '漫画选择页面',
        cateList:[],
        visible:false,
        confirmLoading:false,
        objData:{},
        loadEnd:0,
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

          {
            title:'章节数',
            align:"center",
            dataIndex: 'chapterCount',

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
            title:'所属分类',
            align:"center",
            dataIndex: 'categoryId',
            sorter:'true',
            customRender:function (t,r,index) {
              return getCateName(t);
            }
          },
          {
            title:'所属频道',
            align:"center",
            dataIndex: 'channel',
            sorter:'true',
            customRender:function (t,r,index) {
              return t==1?"男频":"女频";
            }
          },

          {
            title:'推广数',
            align:"center",
            dataIndex: 'tgCount',
            sorter:'true',
          },
          {
            title:'上架日期',
            align:"center",
            dataIndex: 'createTime',
            sorter:'true',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            scopedSlots: { customRender: 'action' },
            width:80
          }
        ],
        url: {
          list: "/app/appComic/list",
          delete: "/app/appComic/delete",
          deleteBatch: "/app/appComic/deleteBatch",
          exportXlsUrl: "/app/appComic/exportXls",
          importExcelUrl: "app/appComic/importExcel",
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
    },

    methods: {
      show(){
        this.loadEnd = 1;
        this.loadData();
        this.visible = true;
      },
      selectItem(item){
        if(item.chapterCount<=0){
          this.$message.error("该小说无章节，请重新选择")
          return
        }
        this.handleCancel()
        this.$emit('ok',item);

      },
      loadData(arg) {
        if(this.loadEnd == 0) return;
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

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

      handleOk(){
        this.handleCancel()
      },
      handleCancel(){
        this.visible = false;
        this.dataSource = []
        this.loadEnd = 0;
      },

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
                               url: "/app/appComic/changeState",
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
        this.$refs.modalForm.add(cateList);
        this.$refs.modalForm.title = "新增";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleChapter: function (record) {
        record.viewModel = 2;
        this.$refs.chapterForm.show(record);

      },


      getCateList(){
        let that = this;
        axios({
          url: "/app/api/getComicCategoryList",
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
      }
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'

</style>