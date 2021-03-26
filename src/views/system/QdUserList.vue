<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="4" :sm="6">
            <a-form-item label="账号 / 名称">
              <a-input placeholder="请输入账号 / 名称 查询" v-model="queryParam.key"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="4" :sm="6">
            <a-form-item label="手机号码">
              <a-input placeholder="请输入手机号码查询" v-model="queryParam.phone"></a-input>
            </a-form-item>
          </a-col>

          <a-col :md="3" :sm="5">
            <a-form-item label="状态">
              <a-select v-model="queryParam.status" placeholder="请选择状态">
                <a-select-option value="">请选择用户状态</a-select-option>
                <a-select-option value="1">正常</a-select-option>
                <a-select-option value="2">冻结</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :md="4" :sm="6" v-has="'user:list'">
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

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="border-top: 5px">
      <a-button @click="handleAdd"  type="primary" icon="plus">添加渠道商</a-button>
      <!--<a-button type="primary" icon="download" @click="handleExportXls('用户信息')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay" @click="handleMenuClick">

          <a-menu-item key="2">
            <a-icon type="lock" @click="batchFrozen('2')"/>
            冻结
          </a-menu-item>
          <a-menu-item key="3">
            <a-icon type="unlock" @click="batchFrozen('1')"/>
            解冻
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <template slot="avatarslot" slot-scope="text, record, index">
          <div class="anty-img-wrap">
            <a-avatar shape="square" :src="getAvatarView(record.avatar)" icon="user"/>
          </div>
        </template>
        <template slot="hrefSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">未生成</span>
          <a :href="text" target="_blank">{{text}}</a>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleLink(record)" >生成推广链接</a>

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
              <a-menu-item >
                <a @click="handleEdit(record)" >编辑</a>
              </a-menu-item>

              <a-menu-item v-has="'user:edit'">
                  <a @click="handleDaili(record.id)">二级渠道</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status==1">
                <a-popconfirm title="确定冻结吗?" @confirm="() => handleFrozen(record.id,2,record.username)">
                  <a>冻结</a>
                </a-popconfirm>
              </a-menu-item>

              <a-menu-item v-if="record.status==2">
                <a-popconfirm title="确定解冻吗?" @confirm="() => handleFrozen(record.id,1,record.username)">
                  <a>解冻</a>
                </a-popconfirm>
              </a-menu-item>



            </a-menu>
          </a-dropdown>
        </span>


      </a-table>
    </div>
    <!-- table区域-end -->

    <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>

    <qdUser-modal ref="modalForm2" @ok="modalFormOk2"></qdUser-modal>

    <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal>

    <sys-user-agent-modal ref="sysUserAgentModal"></sys-user-agent-modal>

    <appLink-modal ref="linkModalForm" @ok="modalFormOk"></appLink-modal>

    <qdOrderTotalList-modal ref="qdOrderTotalListForm" @ok="modalFormOk"></qdOrderTotalList-modal>

    <qdAppUser-modal ref="qdAppUserModalForm" @ok="modalFormOk"></qdAppUser-modal>
  </a-card>
</template>

<script>
  import UserModal from './modules/QdUserModal'
  import PasswordModal from './modules/PasswordModal'
  import { axios } from '@/utils/request'
  import QdUserModal from './modules/QdUserDownList'
  import QdAppUserModal from  './modules/AppUserByQdListModal'

  import {putAction} from '@/api/manage';
  import {frozenBatch} from '@/api/api'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import SysUserAgentModal from "./modules/SysUserAgentModal";
  import AppLinkModal from  './modules/AppLinkModal'
  import QdOrderTotalListModal from  './modules/QdOrderTotalListModal'
  import {  mapGetters } from 'vuex'
  import {getAction } from '@/api/manage'
  var deductList=[];
  function getDeductName(id) {
    for(let i in deductList){
      if(deductList[i].id == id) return deductList[i].roleName
    }
  }
  export default {
    name: "UserList",
    mixins: [JeecgListMixin],
    components: {
      SysUserAgentModal,
      UserModal,
      PasswordModal,
      QdUserModal,
      AppLinkModal,
      QdOrderTotalListModal,
      QdAppUserModal
    },
    data() {
      return {
        description: '渠道商管理',
        queryParam: {},
        deductList:[],
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
            scopedSlots: {customRender: "hrefSlot"}
          },
          {
            title: '分成比 %',
            align: "center",
            width:90,
            dataIndex: 'profitShare',
          },
          {
            title: '扣量规则',
            align: "center",
            width:110,
            dataIndex: 'deductId',

            sorter:true,
            customRender:function (t,r,index) {
              return getDeductName(t);
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
            width: 180
          }

        ],
        url: {
          imgerver: window._CONFIG['domianURL'] + "/sys/common/view",
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/sys/user/qdList",
          delete: "/sys/user/deleteQdUser",
          deleteBatch: "/sys/user/deleteBatch",
          exportXlsUrl: "/sys/user/exportXls",
          importExcelUrl: "sys/user/importExcel",
        },
      }
    },
    created(){
      if(this.userInfo().channelId==0)
      this.getDdeuctList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      ...mapGetters(["userInfo"]),
      handleQdUser(record){
        this.$refs.qdAppUserModalForm.showModal(record.id);
        this.$refs.qdAppUserModalForm.title = "读者列表";
        this.$refs.qdAppUserModalForm.disableSubmit = false;

      },
      loadData(arg) {
        if(this.userInfo().channelId!=0){
          let tem = [];
          for(let i in this.columns){
            if(this.columns[i].title != "扣量规则") tem.push(this.columns[i])
          }
          this.columns = tem;
        }
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
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

      handleEdit: function (record) {
        this.$refs.modalForm.edit(record,this.deductList);
        this.$refs.modalForm.title = "编辑";
        this.$refs.modalForm.disableSubmit = false;
      },
      handleAdd: function () {
        this.$refs.modalForm.add(this.deductList);
        this.$refs.modalForm.title = "新增";
        this.$refs.modalForm.disableSubmit = false;
      },

      getDdeuctList(){
        this.confirmLoading = true;
        let that = this;
        axios({
          url: "/app/appDeductRole/getList",
          method:'post' ,
        }).then((res) =>{

          this.confirmLoading = false;
          if (res.code==0 && res.success) {
            deductList = res.result;
            that.deductList = res.result;
          } else {
            that.$message.warning("扣量规则列表获取失败");
          }
        })
      },

      handleOrder(record){
        this.$refs.qdOrderTotalListForm.show(record.id);

      },
      modalFormOk2(){},
      handleLink: function (record) {

        this.$refs.linkModalForm.show({isDef:1},record.id);

      },
      handleDaili(id){
        this.$refs.modalForm2.showModel(id,this.deductList);
      },
      getAvatarView: function (avatar) {
        return this.url.imgerver + "/" + avatar;
      },

      batchFrozen: function (status) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！');
          return false;
        } else {
          let ids = "";
          let that = this;
          let isAdmin = false;
          that.selectionRows.forEach(function (row) {
            if (row.username == 'admin') {
              isAdmin = true;
            }
          });
          if (isAdmin) {
            that.$message.warning('管理员账号不允许此操作,请重新选择！');
            return;
          }
          that.selectedRowKeys.forEach(function (val) {
            ids += val + ",";
          });
          that.$confirm({
            title: "确认操作",
            content: "是否" + (status == 1 ? "解冻" : "冻结") + "选中账号?",
            onOk: function () {
              frozenBatch({ids: ids, status: status}).then((res) => {
                if (res.success) {
                  that.$message.success(res.message);
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              });
            }
          });
        }
      },
      handleMenuClick(e) {
        if (e.key == 1) {
          this.batchDel();
        } else if (e.key == 2) {
          this.batchFrozen(2);
        } else if (e.key == 3) {
          this.batchFrozen(1);
        }
      },
      handleFrozen: function (id, status, username) {
        let that = this;
        //TODO 后台校验管理员角色
        if ('admin' == username) {
          that.$message.warning('管理员账号不允许此操作！');
          return;
        }
        frozenBatch({ids: id, status: status}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleChangePassword(username) {
        //this.$refs.passwordmodal.show(username);
      },
      handleAgentSettings(username){
        this.$refs.sysUserAgentModal.agentSettings(username);
        this.$refs.sysUserAgentModal.title = "用户代理人设置";
      },
      passwordModalOk() {
        //TODO 密码修改完成 不需要刷新页面，可以把datasource中的数据更新一下
      }
    }

  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>