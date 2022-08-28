<template>
  <div style="position:absolute;width:100%;height:100%;background:rgba(0,0,0,0.4)">
    <el-dialog width="280px" :visible="tenantDialog" :modal="false" :close-on-click-modal="false">
      <div slot="title" class="dialog-title">
        <span>租户选择</span>
        <div class="title-line"></div>
      </div>
      <el-form ref="tenantForm">
        <el-form-item
          size="mini"
          prop="tenantId"
          class="win-item"
          label="租户："
          style="margin-bottom:10px;"
        >
          <el-select v-model="value">
            <el-option
              v-for="item in tenantData"
              :key="item.tenantId"
              :label="item.tenantName"
              :value="item.tenantId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSubmit" size="mini">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
  import {mapState} from "vuex";
  import { service } from 'ngbd-utils'

  export default {
    data() {
      return {
        userId: window.sessionStorage.getItem("user_id"),
        tenantId: window.sessionStorage.getItem("tenant_id"),
        tenantDialog: true,
        value: "",
        tenantData: []
      };
    },

    methods: {
      onSubmit() {
        let tenantId = this.value;
        let tenantName;
        this.tenantData.forEach(listVal => {
          if (tenantId == listVal.tenantId) {
            tenantName = listVal.tenantName;
          }
        })
        window.sessionStorage.setItem("tenant_name", tenantName);
        window.sessionStorage.setItem("tenant_id", tenantId);
        this.tenantDialog = false;
        this.$router.push({
          path: '/index',
          name: 'index'
        }) 
      }
    },
    mounted() {
      let param;
      param = {
        user_id: this.userId
      }

      service({
        maskOff: true,
        url: this.cctSysMs + '/frame/qryUserTenantList',
        method: 'post',
        data: param
      }).then(val => {
        if (val.status === 200 && val.data.respResult === "1") {
          if (val.data.respData.length > 0) {
            val.data.respData.forEach(listVal => {
              this.tenantData.push({
                tenantId: listVal.tenantId,
                tenantName: listVal.tenantName
              })
            });
            this.value = this.tenantData[0].tenantId;
          }
        }
      }).catch(err => {
        // this.$message.error("查询租户列表异常");
        console.error(err);
      });
    },
    computed: {
      ...mapState({
        cctSysMs: state => state.cctSysMs
      })
    }
  };
</script>


