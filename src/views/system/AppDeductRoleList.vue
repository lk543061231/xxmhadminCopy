<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8">
            <a-form-item>
              <a-input placeholder="规则名称" v-model="queryParam.roleName"></a-input>
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
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">

        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="图片不存在"
               style="max-width:80px;font-size: 12px;font-style: italic;"/>
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

          <a-divider type="vertical"/>
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>

        </span>

      </a-table>
    </div>

    <appDeductRole-modal ref="modalForm" @ok="modalFormOk"></appDeductRole-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppDeductRoleModal from './modules/AppDeductRoleModal'
  import { axios } from '@/utils/request'

  export default {
    name: 'AppDeductRoleList',
    mixins: [JeecgListMixin],
    components: {
      AppDeductRoleModal
    },
    data() {
      return {
        description: '扣量规则管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key: 'rowIndex',
            width: 60,
            align: 'center',
            customRender: function(t, r, index) {
              return parseInt(index) + 1
            }
          },
          {
            title: '规则名称',
            align: 'center',
            dataIndex: 'roleName'
          },
          {
            title: '规则参数（新用户）',
            align: 'center',
            dataIndex: 'roleTxt'
          },
          {
            title: '规则参数（老用户）',
            align: 'center',
            dataIndex: 'roleTxt2'
          },
          {
            title: '创建人',
            align: 'center',
            width: 150,
            dataIndex: 'createBy'

          },
          {
            title: '创建时间',
            align: 'center',
            width: 150,
            dataIndex: 'createTime',
            sorter: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: '/app/appDeductRole/list',
          delete: '/app/appDeductRole/delete',
          deleteBatch: '/app/appDeductRole/deleteBatch',
          exportXlsUrl: '/app/appDeductRole/exportXls',
          importExcelUrl: 'app/appDeductRole/importExcel'
        },
        dictOptions: {}
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    methods: {

      batchFrozen: function(status) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！')
          return false
        } else {
          let ids = ''
          let that = this
          that.selectedRowKeys.forEach(function(val) {
            ids += val + ','
          })
          that.$confirm({
            title: '确认操作',
            content: '是否' + (status == 1 ? '解冻' : '冻结') + '选中数据?',
            onOk: function() {
              that.changeState(ids, status)
            }
          })
        }
      },
      handleFrozen: function(id, status) {
        this.changeState(id, status)
      },
      changeState(ids, status) {
        let that = this
        axios({
          url: '/app/appDeductRole/changeState',
          method: 'post',
          data: { ids: ids, status: status }
        }).then((res) => {
          if (res.success) {
            that.$message.success(res.message)
            that.loadData()
            that.onClearSelected()
          } else {
            that.$message.warning(res.message)
          }
        })
      },
      initDictConfig() {
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>