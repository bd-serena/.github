<template>
  <div class="attrSet">
    <el-tabs type="border-card" v-model="activeName" class="tabcard">
      <el-tab-pane
        label="门户设置"
        name="menu"
        style="height: 100%"
        key="menu-pane"
        class="grid-content"
      >
        <div style="padding: 10px 20px">
          <el-collapse ref="collapse" v-model="activeCollapse">
            <el-collapse-item title="基本设置" name="1">
              <div class="cont-line" v-if="portal.portalType==='1'">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <span class="inp-sp">门户名称</span>
                  </div>
                  <div class="inp-line-2">
                    <el-input
                      size="mini"
                      v-model="portal.portalName"
                      placeholder="请输入内容"
                      maxlength="15"
                      show-word-limit
                      class="text-input"
                    ></el-input>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-if="portal.portalType==='1'">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <el-checkbox v-model="showSubtitle"
                      @change="showSubtitleChange"
                      >显示副标题</el-checkbox
                    >
                  </div>
                  <div class="inp-line-2 inp-line-3">
                    <el-input
                      size="mini"
                      v-model="portal.subtitle"
                      placeholder="请输入副标题"
                      maxlength="15"
                      show-word-limit
                      class="text-input"
                    ></el-input>
                  </div>
                </div>
              </div>
              <div class="cont-line" v-if="portal.portalType==='1'">
                <div class="inp-line">
                  <div class="back-line"></div>
                  <div class="inp-line-1">门户Logo</div>
                  <div class="single-line">
                    <div class="img-line">
                      <div class="img-line-item" v-if="img64 !== ''">
                        <img :src="img64" alt="" />
                        <span class="del-icon icon-A10439_close" @click="delLogo"></span>
                      </div>
                      <el-upload
                        ref="upload"
                        class="upload-button"
                        :show-file-list="false"
                        action
                        accept=".jpg, .png"
                        :auto-upload="false"
                        :on-change="fileChange"
                      >
                        <div class="img-line-item img-upload" slot="trigger">
                          <span class="icon-A10691_onLine"></span>
                          <p>图片上传</p>
                        </div>
                      </el-upload>
                    </div>
                    <div class="line-tip">
                      建议：png/jpg、60*60～180*60dpi、200k以内
                    </div>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-if="portal.portalType==='1'">
                <div class="inp-line">
                  <div class="back-line"></div>
                  <div class="inp-line-1">图标布局</div>
                  <div class="single-line">
                    <div
                      class="lay-line-item"
                      @click="setExtend('layoutType', '1')"
                    >
                      <div
                        :class="{
                          'lay-line-wrap': true,
                          active: portal.layoutType === '1',
                        }"
                      >
                        <div class="lay-img">
                          <div class="lay-top"></div>
                          <div class="lay-left"></div>
                        </div>
                      </div>
                      <div class="lay-tit">双导航</div>
                    </div>
                    <div
                      class="lay-line-item"
                      @click="setExtend('layoutType', '3')"
                    >
                      <div
                        :class="{
                          'lay-line-wrap': true,
                          active: portal.layoutType === '3',
                        }"
                      >
                        <div class="lay-img">
                          <div class="lay-top"></div>
                        </div>
                      </div>
                      <div class="lay-tit">顶导航</div>
                    </div>
                    <div
                      class="lay-line-item"
                      @click="setExtend('layoutType', '2')"
                    >
                      <div
                        :class="{
                          'lay-line-wrap': true,
                          active: portal.layoutType === '2',
                        }"
                      >
                        <div class="lay-img">
                          <div class="lay-left"></div>
                        </div>
                      </div>
                      <div class="lay-tit">左导航</div>
                    </div>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </div>

              <div class="cont-line">
                <div class="inp-line">
                  <div class="back-line"></div>
                  <div class="inp-line-1">门户地址</div>
                  <div class="single-line">
                    <div class="url-line">
                      {{ portalURL }}
                    </div>
                    <div>
                      <el-input
                        v-model="portal.portalAlias"
                        class="url-input"
                        size="mini"
                        placeholder="请输入别名"
                        maxlength="20"
                        show-word-limit
                      ></el-input>
                      <el-button
                        @click="copyURL"
                        :data-clipboard-text="
                          portalURL + '/' + portal.portalAlias
                        "
                        id="copy_text"
                        class="url-button"
                        size="mini"
                        type="primary"
                        >复制链接</el-button
                      >
                    </div>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </div>

              <div class="cont-line">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <span class="inp-sp">主题风格</span>
                  </div>
                  <div class="inp-line-2">
                     <el-select
                        size="mini"
                        v-model="portal.themeType"
                      >
                        <el-option
                          v-for="item in themeOption"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-if="portal.portalType==='1'">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <el-checkbox v-model="showFooter"
                      @change="showFooterChange"
                      >显示页脚</el-checkbox
                    >
                  </div>
                  <div class="inp-line-2 inp-line-3">
                    <el-input
                      size="mini"
                      v-model="portal.footer"
                      placeholder="请输入页脚"
                      maxlength="15"
                      show-word-limit
                      class="text-input"
                    ></el-input>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="内容设置"
        name="page"
        class="grid-content"
        key="page-pane"
      >
        <div class="cont-left">
          <div class="add-menu" @click="addTopMenu">
            <span class="icon-A10072_add"></span>
            <span>添加一级菜单</span>
          </div>
          <div class="menu-tree" :key="treeKey">
            <el-scrollbar style="height: 100%" class="ht-overflow">
              <el-tree
                ref="tree"
                :data="portal.portalPrivList"
                :expand-on-click-node="false"
                :render-content="renderContent"
                :default-expanded-keys="expendIds"
                node-key="privId"
              ></el-tree>
            </el-scrollbar>
          </div>
        </div>
        <div class="cont-right">
          <el-collapse ref="collapse2" v-model="activeCollapse2">
            <el-collapse-item title="菜单设置" name="1">
              <div class="cont-line">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <span class="inp-sp">菜单名称</span>
                  </div>
                  <div class="inp-line-2">
                    <el-input
                      size="mini"
                      v-model="menu.privName"
                      :maxlength="portal.portalType==='1' ? 8 : 4"
                      class="text-input"
                      @focus="cacheName"
                      @blur="nameCheck"
                    ></el-input>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-show="!!menu.children && portal.portalType==='1'">
                <div class="single-line">
                  <el-checkbox v-model="isFolder"
                  @change="folderChange"
                  :disabled="!menu.children"
                    >菜单默认展开</el-checkbox
                  >
                </div>
              </div>

              <div class="cont-line" v-if="showIconSelect">
                <div class="single-line">
                  <el-checkbox true-label="1" false-label="0" v-model="menu.showIcon">显示菜单图标</el-checkbox>
                </div>
              </div>

              <div class="cont-line" v-if="showIconSelect">
                <div class="inp-line">
                  <div class="inp-line-1">
                    <span class="inp-sp">图标样式</span>
                  </div>
                  <div class="inp-line-2">
                    <el-popover
                      placement="bottom"
                      width="350"
                      v-model="visible"
                      @hide="popoverHide"
                      @show="popoverShow"
                      popper-class="style-panel-popover"
                    >
                      <el-scrollbar class="popover-scroll">
                        <div class="icon-list-wrap">
                          <div
                            v-for="(iconClass,index) in iconArray"
                            :key="index"
                            class="item-icon"
                            :class="iconIndex == index?'selected':''"
                            @click="selectIcon(index)"
                          >
                            <div :class="'icon-'+iconClass"></div>
                          </div>
                        </div>
                      </el-scrollbar>
                      <div style="text-align: right;">
                        <el-button type="primary" size="mini" @click="submitIcon()">确定</el-button>
                      </div>
                      <el-button slot="reference" size="mini" type="primary">选择</el-button>
                    </el-popover>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-show="!menu.children">
                <div class="inp-line">
                  <div class="back-line"></div>
                  <div class="inp-line-1">内容设置</div>
                  <div class="single-line">
                    <div class="single-line-item">
                      <el-radio-group v-model="pageType" @change="pageTypeChange">
                        <el-radio label="1">内容选择</el-radio>
                        <el-radio label="2">自定义</el-radio>
                        <el-radio label="-1" style="margin-top:10px;">空白页面</el-radio>
                      </el-radio-group>
                    </div>
                    <div class="single-line-item" v-show="pageType === '1'">
                      <el-select
                        size="mini"
                        v-model="menu.pageType"
                        placeholder="请选择"
                        v-if="selectLoad"
                        @change="pageSelect"
                      >
                        <el-option
                          v-for="item in catalogOption"
                          :key="item.classTypeId"
                          :label="item.classTypeName"
                          :value="item.classTypeId"
                        >
                        </el-option>
                      </el-select>
                    </div>
                    <div class="single-line-item" v-show="pageType === '1'">
                      <el-select
                        size="mini"
                        v-model="menu.pageId"
                        placeholder="请选择"
                        filterable
                        remote
                        v-loadmore="loadMore"
                        :remote-method="remoteMethod"
                        id="dataSet_1"
                      >
                        <div class="datas-opt main-content-tool">
                          <div class="tool-btn" @click="getPageList('clear')">
                            <span
                              class="icon-A10280-refresh tool-btn-icon"
                            ></span>
                            <span class="tool-btn-text">刷新</span>
                          </div>
                        </div>
                        <el-option
                          v-for="item in pageList"
                          :key="item.pageId"
                          :label="item.pageName"
                          :value="item.pageId"
                        >
                        </el-option>
                        <div style="height: 40px; min-width: 200px"></div>
                      </el-select>
                    </div>
                    <div class="single-line-item" v-show="pageType === '2'">
                      <el-input
                        size="mini"
                        v-model="menu.svcAddr"
                        maxlength="100"
                        class="text-input"
                        placeholder="请输入地址"
                      ></el-input>
                    </div>
                    <div class="single-line-item">
                      <div class="inp-line-1">
                        <el-checkbox v-model="isHome"
                        :disabled="!!menu.children"
                        @change="homeChange"
                          >设置为主页</el-checkbox
                        >
                      </div>
                    </div>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </div>

              <div class="cont-line" v-show="!menu.children">
                <div class="inp-line">
                  <div class="back-line"></div>
                  <div class="inp-line-1">查看方式</div>
                  <div class="single-line">
                    <div class="single-line-item">
                      <el-radio-group v-model="menu.openType" :disabled="!!menu.children">
                        <el-radio label="1" key="1">当前页面</el-radio>
                        <el-radio label="2" key="2">新窗口</el-radio>
                      </el-radio-group>
                    </div>
                    <div style="clear: both"></div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import { mapMutations, mapState, mapActions } from "vuex";
import Clipboard from "clipboard";
import getUUID from "../../utils/UUID";
export default {
  components: {},
  directives: {
    loadmore: {
      bind(el, binding) {
        const SELECTWRAP_DOM = el.querySelector(
          ".el-select-dropdown .el-select-dropdown__wrap"
        );
        if (!SELECTWRAP_DOM) {
          return false;
        }
        SELECTWRAP_DOM.addEventListener("scroll", function () {
          /*
           * scrollHeight 获取元素内容高度(只读)
           * scrollTop 获取或者设置元素的偏移值,常用于, 计算滚动条的位置, 当一个元素的容器没有产生垂直方向的滚动条, 那它的scrollTop的值默认为0.
           * clientHeight 读取元素的可见高度(只读)
           * 如果元素滚动到底, 下面等式返回true, 没有则返回false:
           * ele.scrollHeight - ele.scrollTop === ele.clientHeight;
           */
          const CONDITION =
            this.scrollHeight - this.scrollTop <= this.clientHeight;
          if (CONDITION) {
            binding.value();
          }
        });
      },
    },
  },
  data() {
    return {
      selectLoad: true,
      pageType: "1",
      activeCollapse: ["1"],
      activeCollapse2: ["1"],
      activeName: "menu",
      radio: "top",
      menuType: "1",
      catalogOption: [],
      value: "",
      value2: "",
      portalURL: "http://www.newland.com",
      filterText1: "",
      start: 1,
      pageList: [],
      nameCache: "",
      timeFn: null,
      addCount: 1,
      themeOption:[
        {
          label: '浅色版',
          value: '2'
        }
      ],
      isFolder: false,
      isHome: false,
      showSubtitle: false,
      showFooter: false,
      tempName: '',
      extraPage: '',
      iconIndex: '',
      iconArray: [
        'A10482_RadarMap',
        'A10573_Chart',
        'A10523_liveness',
        'A10519_MIGU',
        'A10515_WBN',
        'A10122_goal',
        'A10062_3strip',
        'A10126_platmanage',
        'A10469_AreaMap',
        'A10527_Remuneration',
        'A10526_payment',
        'A10194_data',
        'A10407_help'
      ],
      visible: false,
      initialIcon: '',
      showIconSelect: false,
      img64:'favicon.ico'
    };
  },
  watch: {
    portal(val){
      if(val.portalPrivList.length>0){
        let id = val.portalPrivList[0].privId;
        setTimeout(() => {
          let dom = document.querySelector(`div[data-trigger='${id}']`);
          if(dom){
            dom.click();
          }
        }, 10);
      }
    },
    'menu.isFolder': {
      handler(newVal, oldVal) {
        let val = newVal === '1' ? true : false;
        this.isFolder = val;
      }
    },
    'menu.isHome': {
      handler(newVal, oldVal) {
        let val = newVal === '1' ? true : false;
        this.isHome = val;
      }
    },
    'portal.showSubtitle': {
      handler(newVal, oldVal) {
        let val = newVal === '1' ? true : false;
        this.showSubtitle = val;
      }
    },
    'portal.showFooter': {
      handler(newVal, oldVal) {
        let val = newVal === '1' ? true : false;
        this.showFooter = val;
      }
    },
    'menu.pageType': {
      handler(newVal, oldVal) {
        this.getPageList('clear');
      }
    }
  },
  computed: {
    ...mapState({
      portal: state => state.DataPortal.portal,
      menu: state => state.DataPortal.menu,
      expendIds: state => state.DataPortal.expendIds,
      treeKey: state => state.DataPortal.treeKey
    })
  },
  created() {
    this.$axios
      .get("/render-engine/v1/outAuth/getCatalogClass")
      .then((resp) => {
        if (resp.status == 200 && resp.data.respResult == "1") {
          let data = resp.data.respData || [];
          this.catalogOption = data;
        }
      })
      .catch((err) => {});
  },
  mounted() {

  },
  methods: {
    ...mapMutations({
      upLayoutType: "DataPortal/upLayoutType",
      setMenu: "DataPortal/setMenu",
      upTreeKey: "DataPortal/upTreeKey"
    }),
    ...mapActions({
      queryTableData: "HomeBody/queryTableData",
      queryPageInfoById: "HomeBody/queryPageInfoById"
    }),
    folderChange(val) {
      let res = val ? '1' : '0';
      this.menu.isFolder = res;
    },
    homeChange(val) {
      this.forEachTree();
      let res = val ? '1' : '0';
      this.menu.isHome = res;
    },
    showSubtitleChange(val) {
      let res = val ? '1' : '0';
      this.portal.showSubtitle = res;
    },
    showFooterChange(val) {
      let res = val ? '1' : '0';
      this.portal.showFooter = res;
    },
    pageTypeChange(val) {
      this.selectLoad = false;
      if(val === '2') {  //自定义
        this.$set(this.menu,'pageType','1008');
        this.$set(this.menu,'pageId','');
      } else if(val === '1') {  //内部页面
        this.$set(this.menu,'pageType','');
        this.$set(this.menu,'svcAddr','');
        this.selectLoad = true;
      } else {  //空白页面
        this.$set(this.menu,'pageType','-1');
        this.$set(this.menu,'svcAddr','');
        this.$set(this.menu,'pageId','');
      }
    },
    pageSelect(val) { //页面类型改变清空已选页面
      this.menu.pageId = '';
    },
    loadMore() {
      if (this.start) {
        ++this.start;
        this.getPageList(null, this.filterText1);
      }
    },
    setExtend(key, val) {
      this.portal[key] = val;
    },
    getPageList(act, pageName) {
      if (act === "clear") {
        this.pageList.splice(0, this.pageList.length);
        this.start = 1;
      }
      if(!this.menu.pageType){
        return;
      }
      let param = {
        isNeedDemo: "0",
        start: this.start,
        pageCount: 10,
        catalogId: "workfold",
        classTypeId: this.menu.pageType,
        workFlag: "1",
        isTopPage: "1",
      };
      if (!!pageName) {
        param.pageName = pageName;
      }
      this.queryTableData(param)
        .then((resp) => {
          if (resp.status == 200 && resp.data.respResult == "1") {
            let data = resp.data.respData || [];
            for(let i=0; i<data.length; i++) {
              if(data[i].pageId === this.extraPage) {
                data.splice(i,1);
              }
            }
            this.pageList = this.pageList.concat(data);
          }
        })
        .catch((err) => {});
    },
    copyURL() {
      //复制
      var clipboard = new Clipboard("#copy_text");
      clipboard.on("success", (e) => {
        // 释放内存
        clipboard.destroy();
        this.$message.success("复制成功！");
      });
      clipboard.on("error", (e) => {
        // 不支持复制
        Message({
          message: "该浏览器不支持自动复制",
          type: "warning",
        });
        // 释放内存
        clipboard.destroy();
      });
    },
    remoteMethod(query) {
      this.filterText1 = query;
      this.start = 1;
      if (query != "") {
        this.getPageList("clear", query);
      } else {
        this.getPageList("clear");
      }
    },
    renderContent(h, { node, data }) {
      let className = "tree-item";
      let right; //驾驶舱tree目录样式
      let icon = (
        <span class="tree-icon">
          <span
            class="icon-A10279-new"
            on-click={(e) => {
              this.treeAddHandle(data, node);
            }}
          />
          <span
            class="icon-A10278-Deleted"
            on-click={(e) => {
              this.treeDelHandle(node, data);
            }}
          />
        </span>
      );
      return (
        <span class={className}>
          <div
            class="tree-tit ellipsis"
            style={right}
            data-trigger={data.privId}
            on-click={(val) => this.activeMenu(data,node)}
          >
            <span title={data.privName}>
              {data.privName}
            </span>
          </div>
          {icon}
        </span>
      );
    },
    addTopMenu(){
      if(this.portal.portalType === '2' && this.portal.portalPrivList.length>5) {
        this.$message.console.warning('一级菜单最多只能添加5个');
        return;
      }
      const topMenu = {
        isHome: "0",
        privName: '新增菜单',
        privId: getUUID(),
        parentId: this.portal.portalId,
        pageId: ''
      };
      this.portal.portalPrivList.push(topMenu);
      this.upTreeKey()
    },
    doAddMenu(data) {
      if(data.pageType) {
        delete data.pageType;
      }
      if(data.pageId) {
        delete data.pageId;
      }
      if(data.svcAddr) {
        delete data.svcAddr;
      }
      const newChild = {
        isHome: "0",
        privName: '新增菜单',
        privId: getUUID(),
        parentId: data.privId
      };
      this.$refs.tree.append(newChild, data);
      this.expendIds.push(data.privId);
      setTimeout(() => {
        let dom = document.querySelector(`div[data-trigger='${newChild.privId}']`);
        if(dom){
          this.selectLoad = true;
          dom.click();
        }
      }, 0);
      this.upTreeKey();
    },
    treeAddHandle(data, node) {
      // let node = this.$refs.tree.getNode({privId: data.privId});
      if(this.portal.portalType === '1' && node.level === 3) {  //pc只能加4级
        this.$message.warning('菜单最多为3级');
        return;
      }
      if(this.portal.portalType === '2' && node.level === 2) {
        this.$message.warning('菜单最多为2级');
        return;
      }
      if(this.portal.portalType === '2' && node.childNodes.length > 9) {
        this.$message.warning('二级菜单最多只能添加10个');
        return;
      }
      if((data.pageId && data.pageId !== '') || (data.svcAddr && data.svcAddr !== '')) {  //判断是否已经绑定页面
         this.$confirm('设置的菜单内容将清空，确认新增？', "提示", {
          closeOnClickModal: false,
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }).then(() => {
          this.doAddMenu(data);
          this.$message({
            type: "success",
            message: "操作成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        })
      } else {
        this.doAddMenu(data);
      }
    },
    treeDelHandle(node, data){
      if (data.children != null && data.children.length > 0) {
        this.$message.warning("子目录不为空，请先删除子目录");
        return;
      } else {
        this.$confirm('确认删除该菜单吗？', "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          const parent = node.parent;
          this.$refs.tree.remove(node);
          if(parent.childNodes.length===0) {
            delete parent.data.children;
          }
          this.$message({
            type: "success",
            message: "操作成功!"
          });
          this.upTreeKey();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        })
      }
    },
    activeMenu(val,node){
      this.setMenu(val);
      if(val.showIcon === undefined) {
        this.$set(this.menu, 'showIcon', "0");
      }
      this.$set(this.menu, 'pageId', val.pageId || '');
      this.$set(this.menu, 'imgUrl', val.imgUrl || '');
      this.checkShowIcon(node);
      if(val.pageType === '1008') { //自定义
        this.pageType = '2';
      } else if(val.pageType === '-1') {
        this.pageType = '-1';
      } else {
        this.pageType = '1';
        this.selectLoad = true;
      }
      if(!!val.pageId) {
        setTimeout(() => {
          this.inPageList(val.pageId)
        }, 500);
      }
    },
    checkShowIcon(node) {
      if(this.portal.portalType === '1') {
        this.showIconSelect = true;
      } else if(this.portal.portalType === '2') {
        if(node.level === 2) {
          this.showIconSelect = false;
        } else {
          this.showIconSelect = true;
        }
      }
    },
    inPageList(pageId) {
      let flag = false;
      this.extraPage = '';
      for(let i=0;i<this.pageList.length;i++) {
        if(this.pageList[i].pageId === pageId) {
          flag = true;
          break;
        }
      }
      if(!flag) {
        this.queryPageInfoById({pageId}).then(resp=>{
          if (resp.status == 200 && resp.data.respResult == "1") {
            let pageInfo = resp.data.respData;
            this.pageList.unshift(pageInfo);
            this.extraPage = pageId;
          }
        })
      }
    },
    travelTree(node,act) {
      node.forEach(val=>{
        val.isHome = '0';
        if(val.children) {
          this.travelTree(val.children);
        }
      })
    },
    forEachTree() {
      let tree = this.portal.portalPrivList;
      tree.forEach(val=>{
        val.isHome = '0';
        if(val.children) {
          this.travelTree(val.children);
        }
      })
    },
    cacheName() {
      this.tempName = this.menu.privName;
    },
    nameCheck() {
      if(this.menu.privName === '') {
        this.$message.warning('菜单名称不能为空');
        this.menu.privName = this.tempName;
      }
    },
    selectIcon (index) {
      this.iconIndex = index;
      let val = this.iconArray[index];
      this.menu.imgUrl = val;
    },
    submitIcon () {
      this.initialIcon = this.iconArray[this.iconIndex];
      this.visible = false;
    },
    popoverHide () {
      let icon = this.initialIcon;
      this.menu.imgUrl = icon;
    },
    popoverShow () {
      this.initialIcon = this.menu.imgUrl;
      this.iconIndex = this.iconArray.findIndex((value) => {
        return value == this.initialIcon
      })
    },
    fileChange (file) {
      let raw = file.raw
      const isJPG = 'image/jpeg'
      const isPNG = 'image/png'
      const isLt50K = file.size / 1024 > 200
      if (raw.type !== isJPG && raw.type !== isPNG) {
        this.$message.error('上传图片只能是 JPG、PNG 格式!')
        return
      }
      if (isLt50K) {
        this.$message.error('上传图片大小不能超过 200K!')
        return
      }
      this.imgTrans(raw)
    },
    imgTrans (file) {
      let _this = this
      let reader = new FileReader() // html5读文件
      reader.readAsDataURL(file) // 转BASE64
      reader.onload = function (e) {
        // 读取完毕后调用接口
        let base64 = e.target.result
        _this.img64 = base64
      }
    },
    delLogo() {
      this.img64 = '';
    }
  }
};
</script>
<style lang="scss" scoped src="../../assets/css/AttrSet.scss"/>
<style lang="scss" scoped>
.attrSet {
  height: 100%;
  border-left: 1px solid #0a2b4c;
  /deep/ .el-tag {
    width: 100%;
    height: 28px;
    line-height: 26px;
    margin-bottom: 10px;
    font-size: 12px;
    cursor: move;
  }

  .tabcard.el-tabs--border-card {
    background: transparent;
    border: none;
  }

  /deep/ .tabcard.el-tabs--border-card > .el-tabs__header {
    height: 40px;
    padding-top: 10px;
    border: none;
  }

  /deep/ .tabcard .el-tabs__content {
    padding: 0;
  }

  /deep/ .tabcard .el-tabs__item {
    height: 31px;
    line-height: 30px;
    padding: 0 15px;
    border: none;
  }

  /deep/ .tabcard .el-tabs__item.is-active {
    border: none;
    border-radius: 2px 2px 0 0;
  }

  /deep/ .el-tabs__nav-wrap {
    height: 40px;
    width: 100%;
  }

  /deep/ .opt-btn {
    cursor: pointer;
    padding-left: 3px;
  }

  /deep/ .el-tabs__nav-scroll {
    float: right;
    padding-right: 15px;
  }

  /deep/ .tabOption .el-tabs__nav-scroll .el-tabs__nav {
    height: 0;
  }

  .nav-title {
    position: absolute;
    height: 40px;
    line-height: 40px;
    padding-left: 10px;
    font-size: 16px;
    z-index: 99;
  }

  /deep/ .el-tabs__header {
    margin: 0;
  }

  /deep/ .el-tabs.el-tabs--top,
  /deep/ .el-row-24 {
    height: 100%;
  }

  /deep/ .el-tabs__content {
    height: calc(100% - 40px);
  }

  /deep/ .el-row-24 .el-col {
    height: 100%;
    padding: 10px 0 10px 10px;
  }

  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }

  /deep/ .table-wrap .el-scrollbar__view {
    padding-right: 10px;
  }

  /deep/ .table-wrap .el-scrollbar__view > div > div,
  /deep/ .table-wrap .el-scrollbar__view .col-title {
    margin-bottom: 10px;
  }

  /deep/#big-screen .table-wrap .el-scrollbar__view {
    padding-right: 20px;
  }
  .big-screen {
    padding-right: 0px;
  }
  /deep/.stylattr .text-input .el-input__inner[maxlength] {
    padding-right: 45px;
  }

  /deep/.table-wrap .el-radio__label {
    color: #afc0d0;
  }

  /deep/ .el-checkbox__label {
    font-size: 12px;
  }

  /deep/ .col-title span {
    font-size: 12px;
    &.el-tooltip {
      font-size: 14px;
    }
  }
}

/* 滚动条 */
/deep/ .el-tabs__nav-scroll {
  padding-left: 0px !important;
}

.tabOption .el-tabs__nav-scroll .el-tabs__nav {
  height: 0;
}

.el-scrollbar__wrap {
  overflow-x: hidden;
}

.table-wrap .el-scrollbar__view {
  padding-right: 10px;
}

.table-wrap .el-scrollbar__view > div {
  margin-bottom: 10px;
}

//   收缩内容块
/deep/ .el-collapse-item__header {
  background-color: #2f5377;
  color: #fff;
  height: 33px;
  line-height: 33px;
  padding-left: 20px;
  position: relative;
  font-size: 14px;
}

/deep/ .el-collapse-item__header .el-collapse-item__arrow {
  position: absolute;
  left: 0;
}

/deep/ .el-collapse-item__wrap {
  background-color: transparent;
}

/deep/ .el-collapse-item__header,
/deep/ .el-collapse-item__wrap {
  border-bottom: 0px;
}

/deep/ .el-collapse-item__content {
  color: #afc0d0;
  opacity: 0.8;
  padding: 0;
  font-size: 12px;
}

/deep/ .el-collapse {
  border: 0px;
}

/deep/ .el-tabs__active-bar {
  height: 0 !important;
}

/deep/ .el-tabs__nav-wrap {
  height: 31px !important;
}

/deep/ .tabtwo .el-tabs__nav-wrap.is-top {
  padding-left: 110px;
}

.cont-line {
  margin-top: 10px;
  &:first-child {
    margin-top: 0px;
  }
}

.inp-line {
  width: 100%;
  overflow: hidden;
  min-height: 30px;
  position: relative;
  .inp-line-1 {
    color: #fff;
    .inp-sp {
      color: #afc0d0;
    }
  }
}

.back-line {
  width: 100%;
  height: 1px;
  border-bottom: 1px dashed #4e6d8b;
  position: absolute;
  top: 12px;
  z-index: -1;
}

.single-line {
  clear: both;
  padding-top: 5px;
  .line-tip {
    color: #0a2b4c;
    font-size: 12px;
    float: left;
    line-height: 30px;
  }
  .img-line-item {
    cursor: pointer;
    width: 110px;
    height: 70px;
    border: 1px solid #0a2b4c;
    border-radius: 5px;
    background: #0e3b67;
    text-align: center;
    float: left;
    margin-right: 10px;
    position: relative;
    .del-icon {
      display: none;
      position: absolute;
      top:5px;
      right:5px;
      color:red;
      font-size: 18px;
    }
    img {
      width: 45px;
      height: 45px;
      margin-top: 12px;
    }
    &:hover {
      border-color: #409eff;
      .del-icon {
        display: block;
      }
    }

  }

  .img-upload {
    color: #3f678d;
    span {
      font-size: 40px;
      line-height: 49px;
    }
    p {
      line-height: 10px;
    }
  }
  .lay-line-item {
    float: left;
    text-align: center;
    margin-right: 10px;
    .lay-tit {
      line-height: 30px;
    }
    .lay-img {
      width: 76px;
      height: 37px;
      background: #c0c4cc;
      margin: auto;
      margin-top: 5px;
      position: relative;
      .lay-top {
        background: #6189b3;
        width: 100%;
        height: 5px;
        position: absolute;
        z-index: 1;
      }
      .lay-left {
        background: #567da7;
        width: 12px;
        height: 100%;
        position: absolute;
        z-index: 0;
      }
    }
  }
  .lay-line-wrap {
    width: 88px;
    height: 50px;
    border: 1px solid #2f5377;
    border-radius: 5px;
    background: transparent;
    cursor: pointer;
    &:hover,
    &.active {
      border-color: #409eff;
      background: #0e3b67;
    }
  }
  .url-line {
    color: #0a2b4c;
  }
  .url-input {
    float: left;
    width: calc(100% - 90px);
  }
  .url-button {
    float: right;
  }
  .single-line-item {
    &:first-child {
      margin-top: 5px;
    }
    margin-top: 10px;
    .el-radio {
      float: left;
      margin-right: 0;
      color: #afc0d0;
      &:first-child {
        margin-right: 10px;
      }
    }
  }
  /deep/.el-input__count-inner {
    background: transparent;
  }
}

.inp-line-1 {
  float: left;
  display: block;
  background: #2f5377;
  padding-right: 10px;
  line-height: 24px;
}

.inp-line-2 {
  width: calc(100% - 60px);
  float: right;

  /deep/ .el-input__count-inner,
  /deep/ .el-textarea .el-input__count {
    color: #fff;
    background-color: transparent;
    font-size: 12px;
    transform: scale(0.8);
    opacity: 0.7;
  }
}

.inp-line-3 {
  width: calc(100% - 105px);
}

.stylattr .el-radio {
  color: #fff;
  margin-right: 18px;
  &:last-child {
    margin-right: 0;
  }
}

/deep/ .el-color-picker__trigger {
  border: 1px solid #0a2b4c !important;
  background-color: #0e3b67 !important;
}

.el-radio__inner,
.el-checkbox__inner {
  background: #0e3b67 !important;
  border: 1px solid #0a2b4c !important;
}

.el-radio__input.is-checked + .el-radio__label {
  color: #fff !important;
}

.showPagingCls_1 {
  width: 50%;
}

.showPagingCls_2 {
  float: right;
  margin-top: -24px;
  margin-right: 60px;
}

$font-main2: #afc0d0;
$font-clr1: #45fffd;
$border-clr3: #498bce;
$input-bg-clr1: #0e3b67; // 输入框背景色

/***样式块 **/
// .pane-style {
//   height: 100%;
//   padding: 10px;

.el-form-item {
  margin-bottom: 5px;
}

.item-block {
  margin-bottom: 20px;
}

.item_label {
  padding-left: 10px;
  display: inline-block;
}

.sub-nav-title {
  height: 22px;
}

span[class^="icon-"] {
  font-size: 12px;
}

.batch-item {
  cursor: pointer;
}

/deep/ .batch-dialog {
  /deep/ .el-form-item__label {
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #606266 !important;
  }

  /deep/ .el-input__inner {
    color: #606266 !important;
    background-color: #ffffff !important;
    border: 1px solid #dcdfe6 !important;
  }
}

/deep/ .el-form-item__label {
  color: $font-main2;
}

/deep/ .cbox.el-checkbox {
  color: $font-main2;
}

/deep/ .cbox .el-checkbox__input.is-checked + .el-checkbox__label {
  color: $font-main2;
}

.item_label {
  color: $font-main2;
}

.batch-item:hover {
  color: $font-clr1;
}

.align-item:hover,
.align-item.selected {
  border-color: $border-clr3;
  background: $input-bg-clr1;
}

.align-item span {
  border-top: 2px solid $font-main2;
}

.item-block .sub-nav-title {
  color: $font-clr1;
}

/deep/ .advance-col-form {
  .el-form-item:not(:first-child) {
    padding-left: 40px;
  }
}

// }

.tab-item-wrap {
  padding: 5px 0;
}

.tab-item-tit {
  float: left;
}

.tab-item-icon {
  float: right;

  span {
    margin-left: 5px;
    cursor: pointer;

    &:hover {
      color: #409eff;
    }
  }
}

.tab-item:after {
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
}

.tool-text {
  margin-right: 10px;
}

.tool-button {
  width: 20px;
  display: inline-block;
  cursor: pointer;
  text-align: center;

  &:hover,
  &.actived {
    background-color: #409eff;
  }
}

.upload-button {
  float: left;
  margin-right: 20px;
}

/deep/.interval-cont {
  input.el-input__inner {
    padding-right: 0;
    padding-right: 5px;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: textfield;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
}

.blank-mask {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
}
.el-checkbox {
  color: #afc0d0;
}
#pane-page {
  height: 100%;
}
.cont-left {
  height: 100%;
  width: 50%;
  border-right: 1px solid #0e3b67;
  float: left;
  padding: 10px;
}
.cont-right {
  height: 100%;
  width: 50%;
  float: left;
  padding: 0 10px;
}

.add-menu {
  width: 156px;
  height: 28px;
  border: 1px dashed #afc0d0;
  border-radius: 5px;
  background: #4e6d8b;
  color: #afc0d0;
  text-align: center;
  line-height: 26px;
  cursor: pointer;
  .icon-A10072_add {
    font-size: 14px;
    margin-right: 5px;
  }
}

/deep/.menu-tree {
  height: 100%;
  margin-top: -30px;
  padding-top: 50px;
  .el-tree {
    background: transparent;
    height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    color: #afc0d0;
  }
  .el-tree-node__content:hover {
    background-color: transparent;
    color: #409eff;
  }
  .el-tree-node:focus > .el-tree-node__content {
    background-color: transparent;
  }
  .el-tree-node__expand-icon {
    font-size: 14px;
    margin-left: -5px;
  }
  .el-tree-node__children .el-tree-node__children .is-leaf {
    color: transparent;
  }
  .el-tree-node__content {
    height: 31px;
  }
  .tree-item {
    width: 100%;
    height: 21px;
    position: relative;
    .tree-tit {
      position: absolute;
      left: 0;
      right: 40px;
      overflow: hidden;
      white-space: nowrap;
      input {
        width: 100%;
      }
    }
    .tree-tit.ellipsis {
      text-overflow: ellipsis;
    }
    &:hover {
      .tree-icon {
        display: block;
      }
    }
  }
  .tree-icon {
    display: none;
    font-size: 18px;
    position: absolute;
    z-index: 2;
    right: 0;
    height: 100%;
    .icon-A10278-Deleted {
      margin-left: 5px;
    }
  }
  .tree-icon:hover {
    display: block;
  }
  .el-tree-node.is-current > .el-tree-node__content .tree-tit {
    color: #409eff;
  }
}

.main-content-tool {
  text-align: right;
}

.main-content-tool .tool-btn {
  cursor: pointer;
  margin-left: 20px;
  display: inline-block;
  &:first-child {
    margin-left: 0;
  }
}

.main-content-tool .tool-btn .tool-btn-icon {
  color: #409eff;
  margin-right: 5px;
}

.main-content-tool .tool-btn .tool-btn-text {
  position: relative;
  top: -1px;
}
</style>
