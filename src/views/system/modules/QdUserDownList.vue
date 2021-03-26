<template>
  <a-modal
    :title="'二级渠道'"
    :width="1400"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleCancel"
    cancelText="关闭">
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @submit.prevent="searchQuery">
          <a-row :gutter="24">

            <a-col :md="6" :sm="8">
              <a-form-item label="账号 / 名称">
                <a-input placeholder="请输入账号 / 名称 查询" v-model="queryParam.username"></a-input>
              </a-form-item>
            </a-col>



            <a-col :md="6" :sm="8" v-has="'user:list'">
              <a-form-item label="扣量规则">
                <a-select v-model="queryParam.deductId" placeholder="请选择">
                  <a-select-option value="">请选择</a-select-option>
                  <a-select-option :value="item.id" v-for="(item,idx) in deductList" :key="idx">{{item.roleName}}</a-select-option>

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
      <div>
        <a-table
          ref="table"
          bordered
          size="middle"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          >

          <template slot="avatarslot" slot-scope="text, record, index">
            <div class="anty-img-wrap">
              <a-avatar shape="square" :src="getAvatarView(record.avatar)" icon="user"/>
            </div>
          </template>

          <span slot="action" slot-scope="text, record">
            <a @click="handleEdit(record)" >编辑</a>
            <a-divider type="vertical" />
             <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down"/>
            </a>
               <a-menu slot="overlay">
                 <a-menu-item >
                   <a @click="handleOrder(record)" >订单统计</a>
                 </a-menu-item>
                 <a-menu-item >
                   <a @click="handleQdUser(record)" >读者列表</a>
                 </a-menu-item>
               </a-menu>
             </a-dropdown>

          </span>





        </a-table>
      </div>
      <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>
      <qdOrderTotalList-modal ref="qdOrderTotalListForm" @ok="modalFormOk"></qdOrderTotalList-modal>
      <qdAppUser-modal ref="qdAppUserModalForm" @ok="modalFormOk"></qdAppUser-modal>
    </a-card>
  </a-modal>
</template>

<script>
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import { getAction } from '@/api/manage'
  import UserModal from './QdUserModal'
  import QdOrderTotalListModal from  './QdOrderTotalListModal'
  import QdAppUserModal from  './AppUserByQdListModal'
  var deductList=[];
  function getDeductName(id) {
    for(let i in deductList){
      if(deductList[i].id == id) return deductList[i].roleName
    }
  }

  export default {
    name: 'QdUserDownList',
    mixins: [JeecgListMixin],
    components:{
      UserModal,
      QdOrderTotalListModal,
      QdAppUserModal
    },
    data(){
      return{
        confirmLoading:false,
        visible:false,

        columns: [
          /*{
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },*/
          {
            title: '用户账号',
            align: "center",
            dataIndex: 'username',
            width: 120
          },
          {
            title: '渠道名称',
            align: "center",
            width: 100,
            dataIndex: 'realname',
          },

          {
            title: '手机号码',
            align: "center",
            width: 110,
            dataIndex: 'phone'
          },
          {
            title: '微信号',
            align: "center",
            width:120,
            dataIndex: 'weixin'
          },
          {
            title: '推广链接',
            align: "center",

            dataIndex: 'defUrl',
            customRender:function (t,r,index) {
              return t?t:'未生成';
            }
          },
          {
            title: '余额',
            align: "center",
            width:90,
            dataIndex: 'accountBalance',
            sorter:true
          },
          {
            title: '扣量规则',
            align: "center",
            width:120,
            dataIndex: 'deductId',
            sorter:true,
            customRender:function (t,r,index) {
              return getDeductName(t);
            }
          },


          {
            title: '分成比 %',
            align: "center",
            width:100,
            dataIndex: 'profitShare',
          },

          {
            title: '状态',
            align: "center",
            width: 80,
            dataIndex: 'status_dictText'
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
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 200
          }

        ],
        deductList:[],
        parentId:"",
        url: {
          imgerver: window._CONFIG['domianURL'] + "/sys/common/view",
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/sys/user/qdListByParentId",
          delete: "/sys/user/deleteQdUser",
          deleteBatch: "/sys/user/deleteBatch",
          exportXlsUrl: "/sys/user/exportXls",
          importExcelUrl: "sys/user/importExcel",
        },
      }
    },
    methods:{
      handleQdUser(record){
        this.$refs.qdAppUserModalForm.showModal(record.id);
        this.$refs.qdAppUserModalForm.title = "读者列表";
        this.$refs.qdAppUserModalForm.disableSubmit = false;
      },

      handleOrder(record){
        this.$refs.qdOrderTotalListForm.show(record.id);

      },
      handleEdit: function (record) {
        this.$refs.modalForm.edit(record,this.deductList);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
      },
      showModel(id,list){
        if(list){
          this.deductList = list;
          deductList = list;
        }
        this.visible = true;
        this.parentId = id;
        this.loadData();
      },
      handleCancel(){
        this.visible = false;
        this.dataSource = [];
        this.parentId = ""
      },
      loadData(arg) {
        if(!this.parentId) return;
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        params.parentId = this.parentId;
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
    }
  }
</script>

<style scoped>

</style>