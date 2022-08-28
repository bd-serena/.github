import { mapActions } from "vuex";
export default {
    methods: {
        ...mapActions({
            queryPageInfoById: "HomeBody/queryPageInfoById",
        }),
        activeHomePage(val) {
            if (val.privId) {
              this.$nextTick(() => {
                this.openPage(val);
              });
            }
        },
        openPage(data) {
            if (data.pageType) {
              let pageId = "";
              let openType = data.openType;
              if (data.pageType === "1008") {
                //外部页面
                pageId = data.svcAddr;
                this.queryOuterPage(pageId, openType);
              } else {
                //内部页面
                pageId = data.pageId;
                this.queryInnerPage(pageId, openType);
              }
            } else {
              this.load = false;
            }
        },
        queryInnerPage(pageId, openType) {
            this.load = false;
            this.queryPageInfoById({ pageId }).then((val) => {
              if (val.status == 200 && val.data.respResult == "1") {
                let pageInfo = val.data.respData;
                if (!pageInfo) {
                  return;
                }
                pageInfo.operation = "preview";
                sessionStorage.setItem("pageCache", JSON.stringify(pageInfo));
                let routeData = this.$router.resolve({ name: "pageView" }); //query: { timestamp: getTimestamp }
                if (openType === "1") {
                  //当前页
                  this.pagePath = routeData.href;
                  this.load = true;
                } else if (openType === "2") {
                  //新窗口
                  window.open(routeData.href, "_blank");
                }
              }
            });
        },
        queryOuterPage(pageId, openType) {
            if (openType === "1") {
              //当前页
              this.load = false;
              this.pagePath = pageId;
              this.load = true;
            } else if (openType === "2") {
              //新窗口
              window.open(pageId, "_blank");
            }
        }
    }
}