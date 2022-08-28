import { service } from "ngbd-utils";
import { Dialog } from 'vant';
import { mapState } from 'vuex';
export default {
    computed: {
      ...mapState({
        isPcTeminal: state => state.isPcTeminal
      })
    },
    methods: {
        doLogout() {
            //校验会话id
            if (this.isPcTeminal) {
              this.$confirm("确定要注销吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
              }).then(this.confirmLogOut);
            } else {
              Dialog.confirm({
                message: '确定要注销吗?',
                title: '提示'
              }).then(this.confirmLogOut);
            }
          },
          confirmLogOut() {
            service({
              maskOff: true,
              url: "/edc-pub-system-ms/v1/auth/sessionAvailable",
              method: "post",
              data: {},
              headers: {
                "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
              }
            })
              .then(resp => {
                if (resp.status == 200 && resp.data.respResult == "1") {
                  //会话有效状态==>logout
                  this.logout();
                } else {
                  //会话失效退出并跳转到登陆界面
                  var callbackUrl = window.sessionStorage.getItem("X-NG-CallbackUrl");
                  window.sessionStorage.clear()
                  if (callbackUrl !== null && callbackUrl.indexOf("http") == 0) {
                    //资产登陆页面进来
                    window.opener = null;
                    window.open("", "_self");
                    window.close();
                  } else {
                    this.$router.push({ path: "/" });
                  }
                }
              })
              .catch(err => {
                // this.$message.error("会话校验失败:" + err);
                console.error(err);
              });
          },
          logout() {
            //退出
            service({
              maskOff: true,
              url: "/edc-pub-system-ms/v1/login/logout",
              method: "post",
              data: {},
              headers: {
                "X-NG-SessionId": window.sessionStorage.getItem("X-NG-SessionId")
              }
            })
              .then(resp => {
                if (resp.status == 200 && resp.data.respResult == "1") {
                  var callbackUrl = window.sessionStorage.getItem("X-NG-CallbackUrl");
                  window.sessionStorage.clear()
                  if (callbackUrl !== null && callbackUrl.indexOf("http") == 0) {
                    //资产登陆页面进来
                    window.opener = null;
                    window.open("", "_self");
                    window.close();
                  } else {
                    this.$router.push({ path: "/" });
                  }
                } else {
                  throw "退出失败";
                }
              })
              .catch(err => {
                // this.$message.error("退出异常：" + err);
              });
          },
    },
}