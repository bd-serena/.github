<template>
  <el-container>
    <el-header height="60px" style="position:relative;z-index:1;">
      <div class="head-logo cmcc-logo-wrap">
        <div
          v-if="commonProperties.logoName=='newland'"
          :class="[commonProperties.logoName + '-icon']"
        >
          <div class="icon-A10244_newlangLogo"></div>
        </div>
        <div
          v-else-if="commonProperties.logoName=='default'"
          :class="[commonProperties.logoName + '-icon']"
        >
          <div :style="{backgroundImage:`url(${loginLogo})`}"></div>
          <span>大数据分析与可视化</span>
        </div>
        <div v-else>
          <span class="logo-icon">
            <i class="icon-A10050_cmccLogo" style="position: absolute;top: 9px;"></i>
            <i class="icon-A10050_cmccLogoIn"></i>
          </span>
          <span class="icon-A10488_cmccLogo"></span>
        </div>
      </div>
      <div class="head-menu">
        <input type="hidden" :value="menuName" />
        <div
          v-for="(menu, index) in menus"
          :key="index"
          :class="[{actived : active == menu.menuName}, 'menu-block']"
        >
          <div class="sep-line" v-if="menu.menuName=='数据集管理'"></div>
          <div
            class="menu-item"
            v-if="menu.parentId === '0'"
            @click="selected(menu)"
          >
            <span class="menu-block-tit">{{menu.menuName}}</span>
          </div>
          <div class="sep-line" v-if="menu.menuName=='驾驶舱' || menu.menuName === '运营首页'"></div>
        </div>
      </div>
      <div class="head-right">
        <p>
          你好！
          <span v-popover:popover1>{{userInfo.userName}}</span>
        </p>
        <span class="icon-A10112_phone help-icon" v-popover:popoverScan></span>
        <span class="icon-A10344_setting help-icon" v-popover:popoverSetting></span>
        <span class="icon-A10086_question help-icon" v-popover:popover2></span>
        <span class="icon-A10108_quit logout-icon" @click="doLogout"></span>
      </div>
      <el-popover
        ref="popoverScan"
        placement="bottom-start"
        trigger="click"
      >
        <div id="mobileQrCode">
          <img style="width:130px;height:130px;" :src="mobileSrc" />
        </div>
      </el-popover>
      <el-popover
        ref="popover1"
        placement="bottom-start"
        trigger="hover"
        popper-class="index-popo"
        width="500"
      >
        <slot>
          <div class="user-title">
            <span class="icon-A10044_customerGroup user-icon"></span>
            <span style="position:relative;top:-2px;">用户组</span>
          </div>
          <div class="tenant-list" v-for="(value, key, index) in tenantInfos">
            <div class="tenant-list-item" v-bind:class="{ 'current-tenant':key==current}">
              <!-- <div class="tenant-list-item" :class="key === 0 ? 'current-tenant' : ''"> -->
              <span @click="changeTenant(key,value.tenantId,$event)">{{value.tenantName}}</span>
            </div>
          </div>
          <div class="user-info">
            <div class="user-info-item" style="margin-right:4px">
              <div>员工工号：</div>
              <div class="user-info-more">{{userInfo.userId}}</div>
            </div>
            <div class="user-info-item">
              <div>员工姓名：</div>
              <div class="user-info-more">{{userInfo.userName}}</div>
            </div>
            <div class="user-info-item">
              <div>员工别名：</div>
              <div class="user-info-more">{{nickName}}</div>
            </div>
            <div class="user-info-item">
              <div>登陆时间：</div>
              <div>{{loginTime}}</div>
            </div>
            <div class="user-info-item">
              <span
                class="user-update"
                style="margin-left:10px;color:#409eff"
                @click="changeUserInfo"
              >基本资料修改</span>
              <span
                style="margin-left:10px;color:#409eff"
                @click="dialogVisible=true"
                id="abc"
                @mouseover="changeMask(true)"
                @mouseout="changeMask(false)"
              >密码修改</span>
            </div>
          </div>
        </slot>
      </el-popover>
      <el-popover
        ref="popover2"
        placement="bottom-start"
        trigger="hover"
        popper-class="help-popo"
      >
        <slot>
          <div class="help-title">帮助</div>
          <div class="help-block">
            <div class="help-block-item" v-if="showCompDevelop === '1'" @click="helpFunc('compt')">
              <span class="icon-A10716_component"></span>
              <p>组件开发</p>
            </div>
            <div class="help-block-item" v-if="showCompDevelop === '1'" @click="helpFunc('document')">
              <span class="icon-A10600_Function"></span>
              <p>帮助文档</p>
            </div>
            <div class="help-block-item" v-if="showCompDevelop !== '1'">
              <span class="icon-A10038_waitting" style="font-size: 36px"></span>
            </div>
            <!-- <div class="help-block-item">
              <span class="icon-A10600_Function"></span>
              <p>操作手册</p>
            </div>
            <div class="help-block-item">
              <span class="icon-A10676_video"></span>
              <p>操作视频</p>
            </div> -->
          </div>
        </slot>
      </el-popover>
      <el-popover
        v-if="commonProperties.showDemo === '1'"
        ref="popoverSetting"
        placement="bottom-start"
        trigger="hover"
        popper-class="help-popo"
      >
        <slot>
          <div class="help-title">设置</div>
          <div class="help-block">
            <div class="help-block-item setting-demo">
              <div class="help-block-div">
                <el-switch
                  v-model="showDemoBak"
                  active-color="#409eff"
                  inactive-color="#e9e9eb">
                </el-switch>
                <p>案例展示</p>
              </div>
               <div class="help-block-div" @click="toAnaly">
                <i class="icon-A10392_search" style="font-size: 18px;width:40px;height:20px"></i>
                <p>使用分析</p>
              </div>
            </div>
          </div>
        </slot>
      </el-popover>
    </el-header>
    <el-container v-if="menus.length===0"></el-container>
    <el-container v-else style="margin-top: -60px;padding-top: 60px;">
      <el-container v-show="!newWindow && menuName==='系统管理'">
        <div style="width:100%;height:100%" v-loading="systemLoading">
          <iframe :src="pubSystemUrl" width="100%" height="100%" frameborder="0" scrolling="no"></iframe>
        </div>
      </el-container>
      <el-container v-show="menuName!=='系统管理'">
        <div v-if="this.classTypeId == '1004'" :class="isCollapse?'minwidth':'maxwidth'">
          <div class="collapse-btn">
            <i
              class="el-icon-d-arrow-left menu-slide"
              v-show="!isCollapse"
              @click="isCollapse = true"
            />
            <i
              class="el-icon-d-arrow-right menu-slide"
              v-show="isCollapse"
              @click="isCollapse = false"
            />
          </div>
          <div :class="{'aside-menu-tree': true}">
            <div
              v-for="(node,index) in this.menudata"
              :key="index"
              class="menu-tree-options"
              :class="node.isSelect?'dateSetSelect':''"
              @click="clickDateSetTree(index,node)"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="node.label"
                placement="right"
                v-if="isCollapse"
              >
                <i class="menu-tree-icon" :class="node.nodeIcon" />
              </el-tooltip>
              <span v-if="!isCollapse" class="menu-tree-icon" :class="node.nodeIcon"></span>
              <span v-if="!isCollapse" class="menu-tree-text">{{ node.label }}</span>
            </div>
          </div>
        </div>
        <el-aside style="width:200px;height:100%;overflow:hidden;">
          <HomeTree  @changeCurrent="emailTaskChange"></HomeTree>
        </el-aside>
        <el-main>
          <component v-if="isComponent" v-bind:is="component"></component>
        </el-main>
        <!--数据集列表页面-->
        <!-- <el-main v-if="this.classTypeId == '1004'&&this.dataSetTreeIndex==1">
          <DataSetMgt></DataSetMgt>
        </el-main> -->
        <!--数据源列表页面-->
        <!-- <el-main v-if="this.classTypeId == '1004'&&this.dataSetTreeIndex==0">
          <dataSource></dataSource>
        </el-main> -->
        <!--维度页面-->
        <!-- <el-main v-if="this.classTypeId == '1004'&&this.dataSetTreeIndex==2">
          <dimension></dimension>
        </el-main> -->

        <!--即席查询、报表定制、数据大屏-->
        <!-- <el-main
          v-if="this.classTypeId=='1002' || this.classTypeId=='1003' || this.classTypeId=='1005' "
        >
          <HomeBody></HomeBody>
        </el-main> -->
        <!--驾驶舱-->
        <!-- <el-main v-if="this.classTypeId == 'drive'">
          <CockpitMgt></CockpitMgt>
        </el-main> -->

        <!--内容定制 -->
        <!-- <el-main v-if="this.classTypeId=='1001'">
          <AnalysisReport></AnalysisReport>
        </el-main> -->

        <!--报表定制-->
        <!-- <el-main v-if="this.menuName==='报表定制'||this.menuName==='自助报表'">
          <HomeBody></HomeBody>
        </el-main> -->
      </el-container>
    </el-container>
    <bd-div
      type="bd-editPwd-pc"
      :visible.sync="dialogVisible"
    />
    <bd-div
      type="bd-modifyUser-pc"
      :visible.sync="addUserDialog"
      @submitClick="submitUserForm"
    />
  </el-container>
</template>

<script>
import HomeTree from "../components/home/HomeTree";
// import HomeBody from "../components/home/HomeBody";
// import DataSetMgt from "../components/home/DataSetMgt";
// import AnalysisReport from "../components/home/AnalysisReport";
// import dataSource from "../components/home/dataSource";
// import dimension from "../components/home/dimension";
// import CockpitMgt from "../components/home/CockpitMgt";
import loginLogo from "../../public/comptPic/loginLogo.png";

import { mapActions, mapMutations, mapState } from "vuex";
import { dateToString } from "../utils/DateUtil.js";
import { service } from "ngbd-utils";
import eventBus from '../plugins/transData.js';
import QRCode from "qrcode";
import LogOutMixins from '../utils/LogOutMixins'

export default {
  mixins: [LogOutMixins],
  components: {
    HomeTree
    // HomeBody,
    // DataSetMgt,
    // AnalysisReport,
    // dataSource,
    // dimension,
    // CockpitMgt
  },
  data() {
    return {
      currentTabComponent: 'DataSetMgt',
      component: null,
      isComponent: true,
      updateLoading: false,
      icMessage: "",
      nickName: "",
      hisComponent: '', // 记录历史点击的组件名，用作判断是否为邮件发送组件
      icOptions: [],
      sexOptions: [],
      areaOptions: [],
      addUserDialog: false,
      loading: false,
      //控制修改密码弹框的显示隐藏
      dialogVisible: false,
      current: 0, //默认选择第一个租户
      menus: [],
      // active: '即席查询',
      visiableMore: false,
      menuId: "",
      defaultProps: {
        children: "children",
        label: "label"
      },
      isCollapse: true,
      // dataSetTreeIndex: 0,
      menudata: [
        // 此处的nodType与tabeditor中对应跳转到组件相关联
        // {
        //   id: "1",
        //   label: "数据源",
        //   //nodeType: "2",
        //   nodeIcon: "icon-A10393_home",
        //   isSelect: true
        // },
        // {
        //   id: "2",
        //   label: "数据集",
        //   //nodeType: "3",
        //   nodeIcon: "icon-A10157_indicatorAnalyze",
        //   isSelect: false
        // },
        // {
        //   id: "3",
        //   label: "数据集",
        //   // nodeType: "4",
        //   nodeIcon: "icon-A10157_indicatorAnalyze",
        //   isSelect: false
        // }
      ],
      loginLogo: loginLogo,
      pubSystemUrl: "/edc-pub-system/#/system",
      newWindow: false,
      userInfo: {},
      tenantInfos: [],
      userName: "",
      userId: "",
      tenantName: "",
      loginTime: "",
      menuTypeList: [],
      systemLoading: true, // 系统管理遮罩
      mobileSrc: ''
    };
  },
  mounted() {
    let userInfo = (JSON.parse(window.sessionStorage.getItem("X-NG-UserInfo")) || {}).userInfo;
    window.sessionStorage.setItem("user_nickName",userInfo.nickName);
    this.nickName = userInfo.nickName;
    const tenant_id = window.sessionStorage.getItem("tenant_id");
    this.setTenantId({ id: tenant_id }); //设置租户值
    // 系统管理加载遮罩
    eventBus.$on('systemLoading', param => {
      this.systemLoading = param;
    });
    this.$nextTick(() => {
      this.generateQRCode();
    })
  },
  methods: {
    generateQRCode() {
      var that = this;
      let {
        protocol,
        host
      } = window.location;
      let url1 = `${protocol}//${host}/dataeleph/#/`;
      console.log("手机访问地址", url1);
      QRCode.toDataURL(url1)
        .then(url => {
          that.mobileSrc = url;
        })
        .catch(err => {
          console.error(err);
        });
    },
    emailTaskChange(val) {
      if (val === 'EmailTaskMgt' || val === 'sharedFolder') {
        this.currentTabComponent = val;
        this.hisComponent = val;
      } else if (this.hisComponent === 'EmailTaskMgt') {
        this.currentTabComponent = 'HomeBody';
        this.hisComponent = 'HomeBody';
      } else if (this.hisComponent === 'sharedFolder') {
        this.currentTabComponent = this.classTypeId === '1001' ? 'AnalysisReport' : 'HomeBody';
        this.hisComponent =  this.classTypeId === '1001' ? 'AnalysisReport' : 'HomeBody';
      }
    },
    submitUserForm() {
      let userInfo = (JSON.parse(window.sessionStorage.getItem("X-NG-UserInfo")) || {}).userInfo
      this.nickName = userInfo.nickName
    },
    changeUserInfo() {
      this.addUserDialog = true;
    },
    changeMask: function(b) {
      if (b) {
        document.getElementById("abc").style.cursor = "pointer";
      } else {
        document.getElementById("abc").style.cursor = "wait";
      }
    },
    clickDateSetTree(index, node) {
      // 清除列表数据，切换菜单时
      if (index != this.dataSetTreeIndex) {
        this.setTableData({ total: 0, list: [] });
      }
      this.currentTabComponent = node.url
      this.hisComponent = node.url;
      this.setDataSetTreeIndex(index);
      // if (node.label == "数据源") {
      //   this.setDataSetTreeIndex(0);
      // } else if (node.label == "数据集") {
      //   this.setDataSetTreeIndex(1);
      // } else if (node.label == "维度") {
      //   this.setDataSetTreeIndex(2);
      // } else {
      //   this.setDataSetTreeIndex(999);
      // }
      for (let i = 0; i < this.menudata.length; i++) {
        if (i == index) {
          this.menudata[i].isSelect = true;
        } else {
          this.menudata[i].isSelect = false;
        }
      }
    },
    getData() {
      // this.menus = [];
      this.menus = JSON.parse(window.sessionStorage.getItem("X-NG-PrivList"))
      if (this.menus.length === 0) {
        this.$message.warning('用户未授权相应角色，请联系管理员');
        return;
      }
      // 合并菜单和菜单类型
      let typeList = this.menuTypeList
      this.menus.forEach((ele) => {
        ele.url = ele.menuAddr
        ele.id = ele.menuId

        typeList.forEach((tl) => {
          if (tl.classTypeName === ele.menuName) {
            ele["classTypeId"] = tl.classTypeId
          }
        })

        // 临时使用
        if (ele.menuName === '系统管理') {
          sessionStorage.setItem("menuId", ele.menuId)
        }
        const list2tree = (list, parentId) => {
          return list.filter(item => {
            if (item.parentId === parentId && item.menuType !== '2') {
              item.children = list2tree(list, item.menuId)
            return true
          }
          return false
          })
        };
        if((ele.menuName === '运营首页' || ele.menuName === '驾驶舱') && ele.parentId === '0') {
          ele["classTypeId"] = "drive";
          let cockpitMenu = list2tree(this.menus,ele.menuId);
          // this.menus.forEach((em) => {
          //   if (em.parentId === ele.menuId && em.menuType !== '2') {
          //     let _d = { id:em.menuId, menuName:em.menuName, description:em.description}
          //     cockpitMenu.push(_d)
          //   }
          // })
          //设置按钮菜单
          let cockButtons = this.menus.filter(item => {
            return item.parentId === ele.menuId && item.menuType === '2'
          })
          this.setCockpitButton(cockButtons);
          this.setDriveTree(cockpitMenu);
          this.$store.commit("HomeTree/setTreeList", {
            result: this.driveTree,
            myFolder: "drive"
          });
        }
        // 临时使用
      })
      // 设置默认展示的菜单模块
      this.currentTabComponent = this.menus[0].url
      this.hisComponent = this.menus[0].url
      //默认选中第一个菜单
      let menuInfo = this.menus[0];
      if (window.sessionStorage.getItem("dataSrcChoose") != undefined) {
        //从数据集设计页面的新增数据源跳转过来的，选中数据集
        let filterMenu = this.menus.filter(item => {
          return item.classTypeId == 1004;
        });
        if (filterMenu.length > 0) {
          menuInfo = filterMenu[0];
        }
      }
      window.sessionStorage.setItem(
        "homeMenu",
        JSON.stringify(this.menus)
      );

      this.$store.commit("HomeTree/setMenuName", menuInfo.menuName);
      this.setMenuClassTypeId(menuInfo.classTypeId);
      if (window.sessionStorage.getItem("dataSrcChoose") != undefined) {
        //从数据集设计页面的新增数据源跳转过来的，选中数据集
        this.$nextTick(() => {
          document
            .getElementsByClassName("icon-A10607_DataSource")[0]
            .parentElement.click();
          this.upDataSrcDialogVis(true);
        });
      }
      // service({
      //   maskOff: true,
      //   url: this.cctSysMs + "/frame/qryMenuTree",
      //   method: "post",
      //   data: {
      //     user_id: window.sessionStorage.getItem("user_id"),
      //     home_city: window.sessionStorage.getItem("home_city"),
      //     sys_id: this.defaultSystemId || 1016
      //   }
      // })
      //   .then(response => {
      //     if (response.data.respResult == "0") {
      //       this.$message.error(response.data.respErrorDesc);
      //     } else {
      //       this.menus = response.data.respData || [];
      //       if (this.menus.length === 0) {
      //         this.$message.warning('用户未授权相应角色，请联系管理员');
      //         return;
      //       }
      //       // 合并菜单和菜单类型
      //       let typeList = this.menuTypeList
      //       this.menus.forEach((ele) => {
      //         typeList.forEach((tl) => {
      //           if (tl.classTypeName === ele.menuName) {
      //             ele["classTypeId"] = tl.classTypeId
      //           }
      //         })
      //       })
      //       permissionFilters.authTreeData(this.menus, 'url', 'submenu')
      //       // 设置默认展示的菜单模块
      //       this.currentTabComponent = this.menus[0].url
      //       for (let index = 0; index < this.menus.length; index++) {
      //         const element = this.menus[index];
      //         /**
      //        *  内容定制/分析报告  --- 1001
      //        即席查询--1002
      //        报表定制--1003
      //        数据大屏--1005
      //        */
      //         // switch (element.menuName) {
      //         //   case "即席查询":
      //         //     this.menus[index]["classTypeId"] = 1002;
      //         //     this.menus[index]["routePath"] = '/index/HomeBody';
      //         //     break;
      //         //   case "报表定制":
      //         //   case "自助报表":
      //         //     this.menus[index]["classTypeId"] = 1003;
      //         //     this.menus[index]["routePath"] = '/index/HomeBody';
      //         //     break;
      //         //   case "内容定制":
      //         //   case "分析报告":
      //         //     this.menus[index]["classTypeId"] = 1001;
      //         //     this.menus[index]["routePath"] = "/index/AnalysisReport";
      //         //     break;
      //         //   case "数据集管理":
      //         //     this.menus[index]["classTypeId"] = 1004;
      //         //     this.menus[index]["routePath"] = "/index/DataSetMgt";
      //         //     //新增数据集子菜单
      //         //     this.menudata = [];
      //         //     for (let j = 0; j < this.menus[index].submenu.length; j++) {
      //         //       var obj = {
      //         //         id: this.menus[index].submenu[j].id,
      //         //         label: this.menus[index].submenu[j].menuName,
      //         //         nodeIcon: this.menus[index].submenu[j].description,
      //         //         isSelect: false
      //         //       };
      //         //       if (this.menus[index].submenu[j].menuName == "数据集") {
      //         //         obj.isSelect = true;
      //         //         this.setDataSetTreeIndex(1);
      //         //       }
      //         //       this.menudata.push(obj);
      //         //     }
      //         //     break;
      //         //   case "数据大屏":
      //         //     this.menus[index]["classTypeId"] = 1005;
      //         //     this.menus[index]["routePath"] = '/index/HomeBody';
      //         //     break;
      //         //   case "驾驶舱":
      //         //     this.menus[index]["classTypeId"] = "drive";
      //         //     this.menus[index]["routePath"] = "/index";
      //         //     if (!element.submenu) {
      //         //       element.submenu = [];
      //         //     }
      //         //     this.setDriveTree(element.submenu);
      //         //     break;
      //         //   case "系统管理":
      //         //     sessionStorage.setItem("menuId", element.id);
      //         //     this.pubSystemUrl = "/edc-pub-system/#/system";
      //         //     break;
      //         // }

      //         //查询按钮菜单列表---改成直接走privList
      //         // service({
      //         //   maskOff: true,
      //         //   url: this.cctSysMs + "/frame/qryBtnList",
      //         //   method: "post",
      //         //   data: {
      //         //     user_id: window.sessionStorage.getItem("user_id"),
      //         //     home_city: window.sessionStorage.getItem("home_city"),
      //         //     priv_id: this.menus[index].id
      //         //   }
      //         // })
      //         //   .then(response => {
      //         //     if (response.data.respResult == "0") {
      //         //       this.$message.error(response.data.respErrorDesc);
      //         //     } else {
      //         //       this.menus[index]["btnList"] = response.data.respData;
      //         //       // this.$store.commit("HomeTree/setBtnList", this.menus[index]["btnList"]);
      //         //     }
      //         //   })
      //         //   .catch(error => {
      //         //     console.error(error);
      //         //   });
      //       }

      //       //默认选中第一个菜单
      //       let menuInfo = this.menus[0];
      //       if (window.sessionStorage.getItem("dataSrcChoose") != undefined) {
      //         //从数据集设计页面的新增数据源跳转过来的，选中数据集
      //         let filterMenu = this.menus.filter(item => {
      //           return item.classTypeId == 1004;
      //         });
      //         if (filterMenu.length > 0) {
      //           menuInfo = filterMenu[0];
      //         }
      //       }
      //       window.sessionStorage.setItem(
      //         "homeMenu",
      //         JSON.stringify(this.menus)
      //       );

      //       this.$store.commit("HomeTree/setMenuName", menuInfo.menuName);
      //       this.setMenuClassTypeId(menuInfo.classTypeId);
      //       if (window.sessionStorage.getItem("dataSrcChoose") != undefined) {
      //         //从数据集设计页面的新增数据源跳转过来的，选中数据集
      //         this.$nextTick(() => {
      //           document
      //             .getElementsByClassName("icon-A10607_DataSource")[0]
      //             .parentElement.click();
      //           this.upDataSrcDialogVis(true);
      //         });
      //       }
      //     }
      //   })
      //   .catch(error => {});
    },
    created() {
      //hometree.js里面的函数
      let newMenus = this.menus.filter(item => item.parentId === '0');
      this.$store.commit("HomeTree/setMenuName", newMenus.length > 0 ? newMenus[0].menuName : "");
    },
    changeTenant(key, tid, event) {
      var param = {
        tenantId: tid
      };
      //切换租户
      service({
        maskOff: true,
        url: "/edc-pub-system-ms/v1/tenant/switchTenant",
        method: "post",
        data: param,
        headers: {
          "X-UserId": sessionStorage.getItem("user_id"),
          "X-SystemId": "1016"
        }
      })
        .then(resp => {
          if (resp.status == 200 && resp.data.respResult == "1") {
            //将session中的租户信息进行切换
            window.sessionStorage.setItem("tenant_id", tid);
            this.current = key;
            this.setTenantId({ id: tid }); //设置租户值
          } else {
            throw "租户切换失败";
          }
        })
        .catch(err => {
          // this.$message.error("租户切换异常：" + err);
        });
    },
    selected(menu) {
      //  this.active = menuName;  //点击事件
      // this.menuName = menuName;
      //使用vuex进行传递值,使用这个方法去触发函数
      // 清除列表数据，切换菜单时
      let _this = this
      _this.menudata = []
      if (menu.menuName != this.menuName) {
        this.setTableData({ total: 0, list: [] });
      }
      if (menu.menuName != "") {
        _this.menus.forEach((em) => {
            if (em.parentId === menu.menuId && em.menuType !== '2') {
              _this.isCollapse = true;
              let _d = {label: em.menuName, isSelect: false, nodeIcon: em.description, url: em.url}
              _this.menudata.push(_d)
            }
          })
          if (_this.menudata.length > 0) {
            this.isCollapse = true;
            // 默认指定展示数据集页面
            if (menu.classTypeId === '1004') {
              menu.url = _this.menudata[1].url
              _this.menudata[1].isSelect = true
              _this.setDataSetTreeIndex(1);
              this.setDatasetType(0);
            }
          } else {
            this.setDataSetTreeIndex(999);
          }
      }

      this.$store.commit("HomeTree/setMenuName", menu.menuName);
      this.setMenuClassTypeId(menu.classTypeId);
      this.setBtnList(menu.btnList);
      if(menu.url != null && menu.url != '') {
        if(menu.url.indexOf("edc-pub-system") > -1) {
          //系统管理
          sessionStorage.setItem("menuId", menu.menuId);
          if (this.newWindow) {
              window.open(menu.url);
          } else {
              this.pubSystemUrl = menu.url;
          }
        } else if (menu.url.indexOf("edc-servicecustomization-web") > -1) {
          //服务定制工具
          window.open(menu.url);
        } else {
          //其他菜单
          this.currentTabComponent = menu.url
          this.hisComponent = menu.url
          window.currentMenuId = menu.id
        }
      }
    },
    helpFunc(operate){
      switch(operate){
        case 'compt':
          let menuListObj = {menuList: this.$store.state.menuList};
          sessionStorage.setItem("store", JSON.stringify(menuListObj)); //把菜单列表信息传过去
          let routeData = this.$router.resolve({name: "ComptMgt"}); //query: { timestamp: getTimestamp }
          window.open(routeData.href, "_blank");
          break;
        case 'document':
          let url = '/help/dataeleph/index';
          window.open(url,"_blank");
          break;
      }
    },
    toAnaly(){
      let commonProperties = this.$store.state.commonProperties;
      sessionStorage.setItem("commonProperties", JSON.stringify(commonProperties));
      let routeData = this.$router.resolve({name: "AnalyIndex"}); //query: { timestamp: getTimestamp }
      window.open(routeData.href, "_blank");
    },
    queryMenuTypeList() {
      //查询菜单类型列表
      service({
        maskOff: true,
        url: this.renderEngine + "/catalog/getCatalogClass",
        method: "get"
      })
        .then(response => {
          if (response.data.respResult == "0") {
            this.$message.error(response.data.respErrorDesc);
          } else {
            let data = response.data.respData||[];
            if(data.length>0){
              this.menuTypeList = data
            }
          }
          // 查询菜单并且合并菜单
          this.getData()
        })
        .catch(error => {
          console.error(error);
        });
    },
    ...mapMutations({
      setMenuName: "HomeTree/setMenuName",
      setBtnList: "HomeTree/setBtnList",
      setDatasetType: "DataSetDesign/setDatasetType",
      setMenuClassTypeId: "HomeTree/setMenuClassTypeId",
      setDataSetTreeIndex: "HomeTree/setDataSetTreeIndex",
      upDataSrcDialogVis: "DataSetMgt/upDataSrcDialogVis",
      setDriveTree: "HomeTree/setDriveTree",
      setTableData: "DataSetMgt/setTableData",
      upisShowDemo: "upisShowDemo",
      setCockpitButton: "HomeTree/setCockpitButton"
    }),
    ...mapActions({
      setDatasetType: "DataSetDesign/setDatasetType",
      getVueConfig: "getVueConfig",
      queryTreeData: "HomeTree/queryTreeData",
      setCatalog: "HomeBody/setCatalog",
      setTenantId: "HomeBody/setTenantId",
      updateUserPassword: "DataSetMgt/updateUserPassword"
    })
  },
  activated() {
    let XNGUserInfo = JSON.parse(window.sessionStorage.getItem("X-NG-UserInfo")) || {}
    let userInfo = XNGUserInfo.userInfo;
    window.sessionStorage.setItem("user_nickName",userInfo.nickName);
    this.nickName = userInfo.nickName;
    // 查询菜单类型列表
    this.queryMenuTypeList()
    if (this.menuName != "数据集管理") {
      this.setDataSetTreeIndex(999);
    }
    //当前租户
    let ctenant = XNGUserInfo.currentTenant;
    //租户列表
    let tenants = XNGUserInfo.tenantList;
    this.userInfo = XNGUserInfo.userInfo;
    this.userName = window.sessionStorage.getItem("user_name");
    this.userId = window.sessionStorage.getItem("user_id");
    this.tenantName = window.sessionStorage.getItem("tenant_name");
    this.tenantInfos = XNGUserInfo.tenantList;
    let str = dateToString(new Date());
    this.loginTime = str.substring(0, str.length - 3);

    if (ctenant != null) {
      for (var i = 0; i < tenants.length; i++) {
        if (ctenant.tenantId == tenants[i].tenantId) {
          this.current = i;
          break;
        }
      }
    } else {
      this.current = 0;
    }
  },
  computed: {
    ...mapState({
      cctSysMs: state => state.cctSysMs,
      renderEngine: state => state.renderEngine,
      commonProperties: state => state.commonProperties,
      menuName: state => state.HomeTree.menuName,
      classTypeId: state => state.HomeTree.menuClassTypeId,
      treeData: state => state.HomeTree.treeData,
      dataSetTreeIndex: state => state.HomeTree.dataSetTreeIndex,
      myFolder: state => state.commonProperties.myFolder,
      defaultSystemId: state => state.defaultSystemId,
      menuList: state => state.menuList,
      showCompDevelop: state => state.commonProperties.showCompDevelop,
      isShowDemo: state => state.isShowDemo,
      driveTree: state => state.HomeTree.driveTree
    }),
    active () {
      return this.menuName;
    },
    showDemoBak: {
      get: function () {
        return this.isShowDemo;
      },
      set: function (nv) {
        this.upisShowDemo(nv);
      }
    },
    loader () {
      return () => import(`../components/home/${this.currentTabComponent}`);
    }
  },
  watch: {
    currentTabComponent (value) {
      if (value && value.indexOf('edc-pub-system') > -1) { // 系统管理
        return;
      }
      this.loader()
        .then(() => {
          this.isComponent = true;
          this.component = () => this.loader()
        })
        .catch((error) => {
          // this.component = () => import(`../components/home/HomeBody`);
          this.isComponent = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
$main-color: #409eff;
$border-clr1: #0e3b67;
$border-clr2: #000;
$border-clr3: #496988;
.user-update:hover {
  cursor: pointer;
}
.el-header {
  & > div {
    display: inline-block;
    color: #fff;
    font-size: 12px;
    height: 50px;
  }

  .head-logo {
    float: left;
    margin-left: 35px;
    overflow: hidden;
    .newland-icon {
      font-size: 85px;
      margin-top: -17px;
    }

    span {
      font-size: 100px;
      display: inline-block;
      position: relative;
      top: -20px;
    }

    &.cmcc-logo-wrap {
      span:last-child {
        font-size: 80px;
        top: -15px;
      }

      span:first-child {
        font-size: 29px;
        top: -36px;
        margin-right: 5px;
        margin-top: 0px;
      }
    }
    .default-icon {
      & > div {
        height: 20px;
        width: 108px;
        background-repeat: no-repeat;
        background-size: 100%;
        margin-top: 8px;
      }
      > span:last-child {
        font-size: 12px;
      }
    }
  }

  .head-right {
    float: right;

    p {
      display: inline-block;
      margin-right: 10px;
    }
  }

  .head-menu {
    float: left;
    margin-left: 71px;
    position: relative;

    .menu-block {
      position: relative;
      display: inline-block;

      .menu-item {
        position: relative;
        display: inline-block;
        cursor: pointer;
        height: 50px;
        margin: 0 10px;

        span {
          width: 100%;
        }

        &.no-important {
          margin-left: 25px;
        }

        .menu-block-icon {
          font-size: 20px;
          margin-top: 10px;
        }

        .menu-block-tit {
          font-size: 14px;
          line-height: 50px;
        }

        &:hover {
          color: #409eff;
        }
      }
    }

    .menu-block.actived {
      color: #409eff;
    }

    .menu-block-btn {
      display: inline-block;
      min-width: 20px;
      height: 52px;
      top: -4px;
      // margin-top: 5px;
      > div {
        height: 51px;
      }

      border: 1px solid transparent;
      border-radius: 3px;

      &.actived {
        background-color: $border-clr1;
        border: 1px solid $border-clr2;
      }

      &:hover {
        background-color: $border-clr1;
        border: 1px solid $border-clr2;
      }

      .menu-block-icon {
        margin-top: 5px;
      }
    }
  }
}

.el-aside {
  padding: 0 15px;
}

// 内容布局

.el-header {
  background-color: #0a2b4c;
  color: #333;
  text-align: center;
  height: 60px;
  line-height: 60px;
}

.el-aside {
  background-color: #2f5377;
  color: #333;
}

.el-main {
  background-color: #e4e7ee;
  color: #333;
  overflow: hidden;
}

/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-active {
  // transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  transition: all 0.5s ease;
}

.slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active for below version 2.1.8 */
 {
  transform: translateX(10px);
  opacity: 0;
}

.show-more {
  position: absolute;
  // right: -15px;
  top: 50%;
  margin-top: -25px;
  height: 50px;
  left: 0;
  line-height: 50px;
  width: 20px;
  cursor: pointer;
}

.sep-line {
  display: inline-block;
  border-left: 1px dashed $border-clr3;
  height: 14px;
  margin: 0 10px;
  vertical-align: -2px;
}

.help-icon {
  margin-right:10px;
  cursor: pointer;
}

.logout-icon {
  cursor: pointer;
}

.help-title{
  height:30px;
  line-height: 30px;
  font-size:16px;
  text-align: center;
  border-bottom: 1px solid #0a2b4c;
}

.help-block{
  padding:10px 5px;
  .help-block-item{
    width:60px;
    &.setting-demo {
      width: 100%;
      &:hover{
        color:unset;
      }
      p {
      }
    }
    float:left;
    text-align: center;
    margin: 0 5px;
    cursor: pointer;
    &:hover{
      color:$main-color;
    }
    span{
      font-size:18px;
    }
  }
}
.help-block::after{
  content: "";
  display: block;
  clear: both;
}

.help-block-div{
  display: flex;
  justify-content: space-around;
  cursor: pointer;
  margin-top: 5px;
}

.help-block-div:hover{
  color:$main-color;
}
</style>

<style lang="scss">
body {
  /deep/ .index-popo {
    padding: 11px 17px;

    p {
      line-height: 25px;
    }
  }
  .user-title {
    margin-top: 4px;
    .user-icon {
      color: #002069;
      font-size: 18px;
      margin-right: 10px;
    }
  }
  .tenant-list {
    float: left;
    margin-top: 3px;
    margin-bottom: 12px;
  }
  .tenant-list-item {
    float: left;
    width: 110px;
    text-align: left;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 44px;
    margin-top: 3px;
    span {
      cursor: pointer;
      &:hover {
        color: #409eff;
      }
    }
    &.current-tenant {
      color: #409eff;
    }
    &:nth-child(3) {
      margin-right: 0px;
    }
  }
  .user-info {
    float: left;
    width: 100%;
    color: #909399;
    font-size: 12px;
    border-top: 1px solid #909399;
    padding-top: 12px;
    .user-info-item {
      float: left;
      margin-bottom: 5px;
      margin-right: 20px;
      & > div {
        float: left;
      }
      &:nth-child(3) {
        .user-info-more {
          width: 80px;
        }
      }
    }
    .user-info-more {
      width: 60px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .user-info1 {
    float: left;
    width: 100%;
    color: #909399;
    font-size: 12px;
    border-top: 1px solid #909399;
    padding-top: 12px;
    .user-info-item {
      float: left;
      margin-bottom: 5px;
      & > div {
        float: left;
      }
    }
    .user-info-more {
      width: 60px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
<style >
.minwidth {
  width: 45px;
  background-color: #0e3b67;
  position: relative;
}

.maxwidth {
  width: 190px;
  background-color: #0e3b67;
  position: relative;
}
.collapse-btn {
  height: 30px;
  border-bottom: 1px solid #0a2b4c;
  width: 100%;
}
.aside-menu-tree {
  width: 190px;
  height: calc(100% - 30px);
  color: #afc0d0;
}
.menu-tree-options {
  height: 40px;
  cursor: pointer;
}
.minwidth .aside-menu-tree {
  padding: 10px 0 0 8px;
}
.maxwidth .aside-menu-tree {
  padding: 10px 20px 0;
}
.menu-tree-icon {
  display: inline-block;
  vertical-align: 2px;
  font-size: 16px;
  padding: 5px;
}
.menu-tree-text {
  display: inline-block;
  overflow: hidden;
  width: 85px;
  height: 20px;
  margin-left: 20px;
  font-size: 14px;
}
.menu-slide {
  position: absolute;
  top: 5px;
  right: 50%;
  margin-right: -10px;
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  z-index: 9;
}
.dateSetSelect {
  color: #409eff;
}
.dateSetSelect .el-tooltip {
  background-color: #0a2b4c;
  border-radius: 3px;
}
.dateSetSelect span:first-child {
  background-color: #0a2b4c;
  border-radius: 3px;
}

.help-popo{
  padding:0;
}
</style>


