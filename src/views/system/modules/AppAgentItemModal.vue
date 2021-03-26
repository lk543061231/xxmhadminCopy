<template>
  <a-drawer
    :title="title"
    :width="width"
    placement="right"
    :closable="false"
    @close="close"
    :visible="visible">

    <a-spin :spinning="confirmLoading">
      <a-form :form="form">


        <a-form-item label="商品名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'itemTag', validatorRules.itemTag]" placeholder="请输入商品名称"></a-input>
        </a-form-item>

        <a-form-item label="商品金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'price', validatorRules.price]" placeholder="请输入商品金额" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="代理等级" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'agentLevel', validatorRules.agentLevel]" placeholder="请输入代理等级" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="一级返利 %" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'rebateLev1', validatorRules.rebateLev1]" placeholder="请输入一级返利" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="二级返利 %" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'rebateLev2', validatorRules.rebateLev2]" placeholder="请输入二级返利" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="三级返利 %" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'rebateLev3', validatorRules.rebateLev3]" placeholder="请输入三级返利" style="width: 100%"/>
        </a-form-item>


      </a-form>
    </a-spin>
    <a-button type="primary" @click="handleOk">确定</a-button>
    <a-button type="primary" @click="handleCancel">取消</a-button>
  </a-drawer>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'

  export default {
    name: 'AppItemModal',
    components: {},
    data() {
      return {
        form: this.$form.createForm(this),
        title: '操作',
        width: 800,
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        },
        itemType: 1,

        confirmLoading: false,
        validatorRules: {
          itemType: {},
          itemTag: { rules: [{ required: true, message: '请输入商品名称!' }] },
          agentLevel: { rules: [{ required: true, message: '请输入代理等级!' }] },
          rebateLev1:{ rules: [{ required: true, message: '请输入一级返利!' }] },
          rebateLev2:{ rules: [{ required: true, message: '请输入二级返利!' }] },
          rebateLev3:{ rules: [{ required: true, message: '请输入三级返利!' }] },
          price: { rules: [{ required: true, validator: this.validatePrice }] },
          itemDescribe: {},
          status: {},
          isDel: {}
        },
        url: {
          add: '/app/appItem/add',
          edit: '/app/appItem/edit'
        }

      }
    },
    created() {
    },
    methods: {

      add() {
        this.edit({})
      },
      edit(record) {
        this.form.resetFields()
        this.model = Object.assign({}, record)
        if (record.itemType) this.itemType = record.itemType
        this.visible = true
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model, 'itemType', 'itemTag', 'golds', 'vipType', 'price', 'itemDescribe', 'rebateLev1', 'rebateLev2', 'rebateLev3','agentLevel'))
        })
      },
      close() {
        this.$emit('close')
        this.visible = false
      },

      validateGolds(rule, value, callback) {
        if (!value || value < 0) {
          callback('书币不能小于0')
        }
        callback()
      },

      validatePrice(rule, value, callback) {
        if (!value || value < 0) {
          callback('金额不能小于0')
        }
        callback()
      },

      handleOk() {
        const that = this
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }
            let formData = Object.assign(this.model, values)
            formData.itemType = 3
            if (formData.itemType == 1) {
              formData.vipType = 0
            } else {
              formData.golds = 0
            }
            httpAction(httpurl, formData, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
              that.close()
            })
          }

        })
      },
      handleCancel() {
        this.close()
      },
      popupCallback(row) {
        this.form.setFieldsValue(pick(row, 'itemType', 'itemTag', 'golds', 'vipType', 'price', 'itemDescribe', 'isDel'))
      }

    }
  }
</script>

<style lang="less" scoped>
  /** Button按钮间距 */
  .ant-btn {
    margin-left: 30px;
    margin-bottom: 30px;
    float: right;
  }
</style>