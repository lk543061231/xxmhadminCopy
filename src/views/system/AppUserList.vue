<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入帐号" v-model="queryParam.account"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-select v-model="queryParam.agentId" placeholder="请选择代理分类">
                <a-select-option v-for="(item,idx) in agentList" :key="idx" :value="item.id">{{item.itemTag}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="6">
            <a-form-item >
              <a-input placeholder="请输入手机号" v-model="queryParam.mobile"></a-input>
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


      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">

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
                <a @click="handlePay(record)">充值</a>

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

    <appUser-modal ref="modalForm" @ok="modalFormOk"></appUser-modal>
    <userPay-modal ref="modalForm2" @ok="modalFormOk"></userPay-modal>
  </a-card>
</template>

<script>
  var agentList= [];
  function getAgentName(id) {
    for(let i in agentList){
      if(agentList[i].id == id)
        return agentList[i].itemTag;
    }
    return "未开通"
  }

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppUserModal from './modules/AppUserModal'
  import { axios } from '@/utils/request'
  import UserPayModal from "./modules/UserPayModal"
  import { getAction } from '@/api/manage'

  export default {
    name: "AppUserList",
    mixins:[JeecgListMixin],
    components: {
      AppUserModal,
      UserPayModal
    },
    data () {
      return {
        description: '用户数据管理页面',
        agentList:[],
        // 表头
        columns: [

          {
            title:'帐号',
            align:"center",
            dataIndex: 'account'
          },

          {
            title:'书币',
            align:"center",
            sorter:true,
            dataIndex: 'point'
          },
          {
            title:'余额',
            align:"center",
            sorter:true,
            dataIndex: 'balance'
          },
          {
            title:'首充',
            align:"center",
            dataIndex: 'firstPay',
            sorter:true,
            customRender:function (t,r,index) {
              return t == 0?"否":"是"
            }
          },
          {
            title:'VIP到期时间',
            align:"center",
            dataIndex: 'vipDueTime',
            sorter:true,
            customRender:function (text) {
              if(!text) return "未开通";
              var time = new Date(text);
              if(time.getTime() < new Date().getTime()) return "已过期"
              return text
            }
          },
          {
            title:'代理等级',
            align:"center",
            dataIndex: 'agentId',
            customRender:function (text) {
              return getAgentName(text)
            }
          },
          {
            title:'上级帐号',
            align:"center",
            dataIndex: 'parentAccount'
          },

          {
            title:'手机号',
            align:"center",
            dataIndex: 'mobile',
            sorter:true,
            customRender:function (t,r,index) {
              return t?t:"未绑定"
            }
          },
          {
            title:'上次登陆时间',
            align:"center",
            dataIndex: 'lastLoginTime',
            customRender:function (text) {
              return text
            }
          },
          {
            title:'上次登陆IP',
            align:"center",
            dataIndex: 'lastLoginIp'
          },
          {
            title:'状态',
            align:"center",
            dataIndex: 'status_dictText'
          },
          {
            title:'注册时间',
            align:"center",
            dataIndex: 'createTime',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
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
          list: "/app/appUser/list",
          delete: "/app/appUser/delete",
          deleteBatch: "/app/appUser/deleteBatch",
          exportXlsUrl: "/app/appUser/exportXls",
          importExcelUrl: "app/appUser/importExcel",
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
    created(){
      this.getAgentList()
    },

    methods: {
      handlePay(record){
          this.$refs.modalForm2.show(record);

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
                               url: "/app/appUser/changeState",
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


      loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        if(this.agentList.length<=0) return;

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件


        this.loading = true;
        this.totalColData=[];

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

      getAgentList(){
        let that = this;
        getAction('/app/appItem/list',{pageNo:1,pageSize:999,itemType:3}).then((res) => {

          if (res.success) {
            let list = res.result.records;
            this.agentList = list
            agentList = list;
            that.loadData()
          } else {
            that.$message.warning('代理列表获取失败')
          }
        })
      }
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>