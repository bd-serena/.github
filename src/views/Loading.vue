<template>
  <div style="width:100%;height:100%" v-loading.lock="true"></div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";

export default {
  components: {},
  data() {
    return {};
  },
  methods: {
    ...mapActions({
      getVueConfig: "getVueConfig"
    }),
    ...mapMutations({
      setVueConfig: "setVueConfig",
      setDefaultSystemId: "setDefaultSystemId"
    })
  },
  mounted() {
    let sessionId = window.sessionStorage.getItem('X-NG-SessionId');
    // if (sessionId != null && sessionId != "") {
    //   this.$axios.defaults.headers.common['X-NG-SessionId'] = sessionId;
    // }
    let XUserInfo=window.sessionStorage.getItem("X-NG-UserInfo");
    if(XUserInfo!=null&&XUserInfo!=""){
      let xUser = JSON.parse(XUserInfo);
      let user = xUser.userInfo;
      let tenant = xUser.currentTenant;
      if(tenant===null){
        tenant = xUser.tenantList[0];
      }
      window.sessionStorage.setItem("user_id", user.userId);  //设置user_id
      window.sessionStorage.setItem("tenant_id", tenant.tenantId);
      // window.sessionStorage.setItem("tenant_id", "34234234");
      window.sessionStorage.setItem("tenant_name", tenant.tenantName);
      window.sessionStorage.setItem("home_city", user.homeCity);
      window.sessionStorage.setItem("user_name",user.userName);
      window.sessionStorage.setItem("user_mobile", user.mobilePhone);
    }

    this.getVueConfig()
      .then(resp => {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let param = resp.data.respData;
          this.setVueConfig(param);
          this.setDefaultSystemId(param.systemId);
          window.sessionStorage.setItem("X-SystemId",param.systemId);
          this.$router.push({ path: "/index" });
        } else {
          throw "查询配置文件失败";
        }
      })
      .catch(err => {
        // this.$message.error("登录异常：" + err);
      });
  },
  computed: {}
};
</script>
