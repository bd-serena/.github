<template>
  <div style="width:100%;height:100%" v-loading.lock="true"></div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
export default {
  components: {},
  data() {
    return {
      outParamMap: null
    };
  },
  methods: {
    ...mapActions({
      getVueConfig: "getVueConfig",
      queryPageInfoById: "HomeBody/queryPageInfoById"
    }),
    ...mapMutations({
      setVueConfig: "setVueConfig",
      setDefaultSystemId: "setDefaultSystemId"
    }),
    goToPrev(pageId) {
      this.queryPageInfoById({ pageId })
        .then(val => {
          if (val.status == 200 && val.data.respResult == 1) {
            var bean = val.data.respData;
            bean["operation"] = "preview";
            switch (bean.classTypeId) {
              case "1002":
                bean["isQueryPre"] = 1; //即席查询预览
                break;
              case "1001002":
                bean["isMoBilePre"] = 1; //手机端预览
              default:
                break;
            }
            sessionStorage.setItem("pageCache", JSON.stringify(bean));

            /**
           * 内容定制/分析报告  --- 1001
                 即席查询--1002
                 报表定制--1003
                 数据大屏--1005
           */
            switch (bean.classTypeId) {
              case "1002": //即席查询
                this.$router.push({
                  path: "/preview",
                  name: "preview",
                  query: {
                    id: bean.pageId
                  }
                });
                break;
              case "1003": //报表
                this.$router.push({
                  path: "/reportView",
                  name: "reportView",
                  query: {
                    id: bean.pageId,
                    isEdit: true
                  }
                });
                break;
              case "1005":
              case "1001001":
              case "1001002": //大屏-pc-手机
                if(this.outParamMap !== null){  //保存外部参数
                  sessionStorage.setItem("outerParam",JSON.stringify(this.outParamMap));
                }
                this.$router.push({
                  path: "/pageView",
                  name: "pageView",
                  query: {
                    id: bean.pageId
                  }
                });
                break;
              default:
                break;
            }
          } else {
            // throw "页面信息查询失败";
          }
        })
        .catch(err => {
          // this.$message.error("页面信息查询失败" + err);
        });
    }
  },
  mounted() {
    let XUserInfo = window.sessionStorage.getItem("X-NG-UserInfo");
    if (XUserInfo != null && XUserInfo != "") {
      let xUser = JSON.parse(XUserInfo);
      let user = xUser.userInfo;
      let tenant = xUser.currentTenant;
      if (tenant === null) {
        tenant = xUser.tenantList[0];
      }
      window.sessionStorage.setItem("user_id", user.userId); //设置user_id
      window.sessionStorage.setItem("tenant_id", tenant.tenantId);
      window.sessionStorage.setItem("tenant_name", tenant.tenantName);
      window.sessionStorage.setItem("home_city", user.homeCity);
      window.sessionStorage.setItem("user_name", user.userName);
      window.sessionStorage.setItem("user_mobile", user.mobilePhone);
    }

    this.getVueConfig()
      .then(resp => {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let param = resp.data.respData;
          this.setVueConfig(param);
          this.setDefaultSystemId(param.systemId);
          try {
            var pageId = window.location.href.split("?")[1].split("=")[1];
            if (pageId.indexOf("#") > 0) {
              pageId = pageId.split("#")[0];
            }
            if (pageId.indexOf("&") > 0) {
              pageId = pageId.split("&")[0];
            }
            let outParam = window.location.href.split("?")[1].split('&');
            let outParamMap = {};
            if(outParam.length>1){
              outParam = outParam.splice(1,outParam.length);
              outParam.forEach(val=>{
                let [key,value] = val.split('=');
                outParamMap[key] = value;
              })
              this.outParamMap = outParamMap;
            }
            this.goToPrev(pageId);
          } catch (e) {
            this.$message.error("pageId获取失败");
          }
        } else {
          throw "查询配置文件失败";
        }
      })
      .catch(err => {
        // this.$message.error("登录异常：" + err);
        console.error(err);
      });
  },
  computed: {}
};
</script>
