<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :md="4" :sm="8">
              <a-form-item >
                <a-input placeholder="链接名称" v-model="queryParam.linkName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :md="3" :sm="6">
              <a-form-item >
                <a-select v-model="queryParam.type" placeholder="请选择类型">
                  <a-select-option :value="1">小说</a-select-option>
                  <a-select-option :value="2">漫画</a-select-option>
                  <!--<a-select-option :value="3">同人</a-select-option>-->
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
          <span v-if="!text" style="font-size: 12px;font-style: italic;">获取失败</span>
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
          <a @click="copyUrl(record)">复制链接</a>

          <a-divider type="vertical" />

          <a @click="toQrCode(record)">二维码</a>

          <a-divider type="vertical" />
          <a-dropdown v-if="record.isDef==0">
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
               <a-menu-item>
                <a @click="handleEdit(record)">编辑</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>

              </a-menu-item>

            </a-menu>
          </a-dropdown>
          <span v-else class="ant-dropdown-link" style="color: #999" >默认 <a-icon type="down" /></span>

        </span>

      </a-table>
    </div>

    <appLink-modal ref="modalForm" @ok="modalFormOk"></appLink-modal>
    <sysQrCode-modal ref="qrCodeForm" @ok="modalFormOk"></sysQrCode-modal>
    <appLinkLogDetail-modal ref="appLinkLogDetailForm" @ok="modalFormOk"></appLinkLogDetail-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppLinkModal from './modules/AppLinkModal'
  import { axios } from '@/utils/request'
  import SysQrCodeModal from './modules/SysQrCodeModal'
  import AppLinkLogDetailModal from  './modules/AppLinkLogDetailModal'

  export default {
    name: "AppLinkList",
    mixins:[JeecgListMixin],
    components: {
      AppLinkModal,
      SysQrCodeModal,
      AppLinkLogDetailModal,

    },
    data () {
      return {
        description: '推广链接管理页面',
        // 表头
        columns: [

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
            title:'内容标题',
            align:"center",
            dataIndex: 'novelName'
          },
          {
            title:'文案标题',
            align:"center",
            dataIndex: 'contentTitle'
          },

          {
            title:'备注',
            align:"center",
            dataIndex: 'note'
          },
          {
            title:'类型',
            align:"center",
            dataIndex: 'type',
            customRender:function (t,r,index) {
              return t==1?"小说":"漫画";
            }

          },
          {
            title: '创建时间',
            align: "center",
            width: 150,
            dataIndex: 'createTime',
            sorter: true
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
      toQrCode(record){
        this.$refs.qrCodeForm.show(record.linkUrl);
      },
      copyUrl(r){
        let t =this;
        try {
          var input = document.createElement('input');
          input.setAttribute('readonly', 'readonly');
          input.setAttribute('value', r.linkUrl);
          document.body.appendChild(input);

          input.select();
          var res = document.execCommand('copy');
          document.body.removeChild(input);
          t.$message.success("复制到粘贴板成功");
          return res;
        }catch (e) {
          t.$message.error("复制到粘贴板失败，请手动复制");
        }
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
                               url: "/app/appLink/changeState",
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