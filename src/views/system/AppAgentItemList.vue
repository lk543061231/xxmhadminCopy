<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>

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

    <appItem-modal ref="modalForm" @ok="modalFormOk"></appItem-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppItemModal from './modules/AppAgentItemModal'
  import { axios } from '@/utils/request'
  import { deleteAction, getAction,downFile } from '@/api/manage'

  function getVipType(type) {
    switch (type){
      case 1 : return "月卡";
      case 2 : return "年卡";
      case 3 : return "日卡";
      case 4 : return "周卡";
      case 5 : return "季卡";
      case 6 : return "半年卡";
      case 7 : return "终身卡";
      default: return "无";
    }
  }
  export default {
    name: "AppItemList",
    mixins:[JeecgListMixin],
    components: {
      AppItemModal
    },
    data () {
      return {
        description: '代理加盟管理页面',
        // 表头
        columns: [

          {
            title:'商品名称',
            align:"center",
            dataIndex: 'itemTag'
          },

          {
            title:'商品金额',
            align:"center",
            dataIndex: 'price',
            sorter: true
          },
          {
            title:'代理等级',
            align:"center",
            dataIndex: 'agentLevel',
            sorter: true
          },
          {
            title:'一级返利',
            align:"center",
            dataIndex: 'rebateLev1',
            customRender:function (t,r,index) {
              return t+"%"
            }


          },
          {
            title:'二级返利',
            align:"center",
            dataIndex: 'rebateLev2',
            customRender:function (t,r,index) {
              return t+"%"
            }

          },
          {
            title:'三级返利',
            align:"center",
            dataIndex: 'rebateLev3',
            customRender:function (t,r,index) {
              return t+"%"
            }

          },

          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText',
            sorter: true
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
          list: "/app/appItem/list",
          delete: "/app/appItem/delete",
          deleteBatch: "/app/appItem/deleteBatch",
          exportXlsUrl: "/app/appItem/exportXls",
          importExcelUrl: "app/appItem/importExcel",
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

      loadData(arg) {
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
        this.totalColData=[];
        params.itemType = 3;

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
                               url: "/app/appItem/changeState",
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