<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item >
              <a-input placeholder="请输入书名 关键字" v-model="queryParam.key"></a-input>
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

          <a @click="handleChapter(record)">章节查看</a>
          <a-divider type="vertical" />
          <a @click="handleLink(record)">生成推广链接</a>
        </span>

      </a-table>
    </div>

    <!--<appNovel-modal ref="modalForm" @ok="modalFormOk"></appNovel-modal>-->
    <appComicChapterList-modal ref="chapterForm" @ok="modalFormOk"></appComicChapterList-modal>
    <appLink-modal ref="linkModalForm" @ok="modalFormOk"></appLink-modal>

  </a-card>
</template>

<script>
  import AppLinkModal from  './/modules/AppLinkModal'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppComicChapterListModal from './AppComicChapterList'

  import { axios } from '@/utils/request'
  var cateList= [];
  function getCateName(id) {
    for(let i in cateList){
      if(cateList[i].id == id)
        return cateList[i].categoryName;
    }
  }
  export default {
    name: "AppComicList",
    mixins:[JeecgListMixin],
    components: {
      AppLinkModal,
      AppComicChapterListModal
    },
    data () {
      return {
        description: '漫画信息管理页面',
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
            title:'推广数',
            align:"center",
            dataIndex: 'tgCount',
            sorter:'true',
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
            title:'创建人',
            align:"center",
            dataIndex: 'createBy',

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


      handleLink: function (record) {
        if(record.chapterCount<=0){
          this.$message.warning('该条记录没有章节，请重新选择');
          return ;
        }
        record.type=2;
        this.$refs.linkModalForm.show(record);
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
            that.$message.warning("分类列表获取失败");
          }
        })
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>