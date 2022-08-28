<template>
  <el-dialog
    size="mini"
    title="分享"
    width="900px"
    :visible.sync="sharedDialogVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="reset"
    :destroy-on-close="true"
    class="el-dialog-share"
  >
    <div class="condi-set-box interact-set-wrap" style="height: 330px">
      <el-tabs type="border-card" tab-position="top" v-model="activeName" @tab-click="handleClick">

        <!--角色选显卡-->
        <el-tab-pane label="按角色" name="roleTab">
        <div style="float: left; height: 250px; width:200px;">
          <!-- 左边模块 -->
          <!--全选-->
          <el-checkbox v-model="checkAll" @change="roleAllChange">全选</el-checkbox>
          <el-input
            placeholder="请输入角色名"
            v-model="filterText"
            prefix-icon="el-icon-search"
            size="mini"
            style="width: 60%"
            @keyup.enter.native="roleResFilter"
          >
          </el-input>
          <div style="margin: 5px 0;"></div>
          <!--model表示已经选中-->
          <el-checkbox-group v-model="checkedRoleIds" @change="checkedRolesChange">
              <el-scrollbar style="height: 215px; width:200px" :native="false" :noresize="false">
                <el-checkbox style="display:block;margin-left:0px;" v-for="role in roleList" :label="role.roleName" :key="role.roleId" :disabled="disableRoleIds.includes(role.roleId)"></el-checkbox>
              </el-scrollbar>
          </el-checkbox-group>
        </div>

        <!--中间按钮-->
        <div @click="roleMove()" style="float:left; width:50px; vertical-align:middle; padding-top:100px;"><a>>></a></div>

        <!--右边表格-->
        <div style="float:left;width:68%; height:250px">
          <div style="float:right;">
            <span class="tool-btn-text" @click="batchDelRoles">批量删除</span>
            &nbsp;&nbsp;&nbsp;
            <span class="tool-btn-text" @click="openAuthRoles">批量授权</span>
          </div> 
          <!--分享角色列表-->
          <el-table
            v-loading="loading"
            border
            @select="selectRoleTable"
            @select-all="selectRoleTable"
            :data="roleTableData"
            height="100%"
            style="width: 100%"
            size="mini"
          >
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="roleId" label="角色ID" v-if="false" :show-overflow-tooltip="true" min-width="30px"></el-table-column>
          <el-table-column prop="roleName" label="授权角色" :show-overflow-tooltip="true" min-width="35px"></el-table-column>
          <!--授权类型-->
          <el-table-column prop="" label="授权类型" :show-overflow-tooltip="true" min-width="50px">
            <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.authType" @change="roleAuthTypeChange(scope.row.roleId,$event)">
              <el-option v-for="item in displayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </template>
          </el-table-column>
          <!--有效期-->
          <el-table-column prop="" label="有效期" :show-overflow-tooltip="true" min-width="175px">
            <template slot-scope="scope">
              <el-date-picker
                size="mini"
                v-model="scope.row.roleTimeInterval"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="roleTimeChange(scope.row)" >
              </el-date-picker>
            </template>
          </el-table-column>
          <!--操作列-->
          <el-table-column label="操作" min-width="20px">
            <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="移除" placement="top-start">
                <span class="icon-A10065_delete tool-btn-icon"  @click="removeRole(scope.row)"></span>
            </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        </div>

        <!--批量角色授权-->
        <el-dialog
          size="mini"
          title="批量授权"
          :visible.sync="showRoleDialog"
          :append-to-body="true"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          width="600px"
        >
            <div>
            授权类型：
            <el-select size="mini" v-model="batchRoleAuthType">
              <el-option v-for="item in displayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </div>
             &nbsp;
            <div>
            有效期限：
            <el-date-picker
                v-model="batchRoleTime"
                size="mini"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            </div>

            <span slot="footer" class="dialog-footer">
              <el-button size="mini" type="primary" @click="batchRoleAuth">确 定</el-button>
            </span>
        </el-dialog>

        </el-tab-pane>


       <!--用户选显卡-->
        <el-tab-pane label="按用户" name="userTab">
        <div style="float: left; height: 250px; width:200px;">
          <!-- 左边模块 -->
          <!--全选-->
          <el-checkbox v-model="checkAll" @change="userAllChange">全选</el-checkbox>
          <el-input
            placeholder="请输入用户名"
            v-model="filterText"
            prefix-icon="el-icon-search"
            size="mini"
            style="width: 60%"
            @keyup.enter.native="userResFilter"
          >
          </el-input>
          <div style="margin: 5px 0;"></div>
          <!--model表示已经选中-->
          <el-checkbox-group v-model="checkedUserIds" @change="checkedUserIdsChange">
              <el-scrollbar style="height: 215px; width:200px" :native="false" :noresize="false">
                <el-checkbox style="display:block; margin-left:0px;" v-for="user in userList" :label="user.userName" :key="user.userId" :disabled="disableUserIds.includes(user.userId)"></el-checkbox>
              </el-scrollbar>
          </el-checkbox-group>
        </div>


        <!--中间按钮-->
        <div @click="userMove()" style="float:left; width:50px; vertical-align:middle; padding-top:100px;"><a>>></a></div>


        <!--右边表格-->
        <div style="float:left;width:68%; height:250px">
          <div style="float:right;">
              <span class="tool-btn-text" @click="batchDelUser">批量删除</span>
              &nbsp;&nbsp;&nbsp;
              <span class="tool-btn-text" @click="openAuthUsers">批量授权</span>
          </div>
          <!--分享用户列表-->
          <el-table
            v-loading="loading"
            border
            @select="selectUserTable"
            @select-all="selectUserTable"
            :data="userTableData"
            height="100%"
            style="width: 100%"
            size="mini"
          >
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column prop="userId" label="用户ID" v-if="false" :show-overflow-tooltip="true" min-width="40px"></el-table-column>
          <el-table-column prop="userName" label="授权用户" :show-overflow-tooltip="true" min-width="35px"></el-table-column>
          <!--授权类型-->
          <el-table-column prop="" label="授权类型" :show-overflow-tooltip="true" min-width="50px">
            <template slot-scope="scope">
            <el-select size="mini" v-model="scope.row.authType" @change="userAuthTypeChange(scope.row.roleId,$event)">
              <el-option v-for="item in displayOptions"
              style="height:30px;"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </template>
          </el-table-column>
          <!--有效期-->
          <el-table-column prop="" label="有效期" :show-overflow-tooltip="true" min-width="175px">
            <template slot-scope="scope">
              <el-date-picker
                size="mini"
                v-model="scope.row.userTimeInterval"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="userTimeChange(scope.row)" >
              </el-date-picker>
            </template>
          </el-table-column>
          <!--操作列-->
          <el-table-column label="操作" min-width="20px">
            <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" content="移除" placement="top-start">
                <span class="icon-A10065_delete tool-btn-icon"  @click="removeUser(scope.row)"></span>
            </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        </div>


          <!--批量用户授权-->
        <el-dialog
          size="mini"
          title="批量授权"
          :visible.sync="showUserDialog"
          :append-to-body="true"
          :close-on-click-modal="false"
          :close-on-press-escape="false"
          width="600px"
        >
            <div>
            授权类型：
            <el-select size="mini" v-model="batchUserAuthType">
              <el-option v-for="item in displayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
              </el-option>
            </el-select>
            </div>
             &nbsp;
            <div>
            有效期限：
            <el-date-picker
                v-model="batchUserTime"
                size="mini"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="~"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            </div>

            <span slot="footer" class="dialog-footer">
              <el-button size="mini" type="primary" @click="batchUserAuth">确 定</el-button>
            </span>
        </el-dialog>



        </el-tab-pane>
      </el-tabs>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="cancelShare">重置</el-button
      >
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="shareApply" size="mini"
        >确 定</el-button
      >
    </div>
  </el-dialog>
  
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import { service } from "ngbd-utils";

export default {
  data() {
    return {
      loading: false,
      showRoleDialog:false,//批量授权角色弹窗
      showUserDialog:false,//批量授权用户弹窗
      roleList: [], //角色列表
      roleSharedList: [], //当前子系统下已分享的角色列表
      allPublicRoleMap: {}, //已发布的所有菜单角色权限配置信息{menuId:roleList}
      activeName: "roleTab",
      userList: [], //用户列表
      userSharedList: [], //当前子系统下已分享的用户列表
      checkAll: false,
      checkedRoleIds:[], //选中角色ID集合
      checkedRoles:[], //选中角色集合
      disableRoleIds:[], //需要被禁用的角色复选框
      filterText: "",
      roleTimeInterval:['2020-08-08','2020-08-08'],//角色时间区间数组
      roleTableData:[],//分享角色表格数据
      disableUserIds:[],
      checkedUserIds:[],
      checkedUsers:[], //选中用户集合
      userTimeInterval:['2020-08-08','2020-08-08'],//用户时间区间数组
      userTableData:[],//用户分享表格数据
      oriRoleTableData:[], //原始角色表格数据
      oriUserTableData:[],//原始用户表格数据
      shareRoleList:[],//选中的分享角色列表
      shareUserList:[],//选中分享用户列表
      batchRoleAuthType:"",//批量授权类型-角色
      batchRoleTime:"",//批量时间-角色
      batchUserTime:"",//批量时间-用户
      batchUserAuthType:"",//批量授权类型-角色
      displayOptions:[
        {
          value:"0",
          label:"仅查看"
        },
        {
          value:"1",
          label:"查看及导出"
        }
      ],
    };
  },
  computed: {
    sharedDialogVis: {
      get() {
        return this.$store.state.AnalyReportAttr.sharedDialogVis;
      },
      set(value) {
        this.setSharedDialogVis(value);
      },
    },
    ...mapState({
      renderEngine: (state) => state.renderEngine,
      defaultSystemId: (state) => state.defaultSystemId,
      pageCache: (state) => state.HomeBody.pageCache,
      pubSYSUrl: (state) => state.pubSYSUrl,
    }),
  },
  methods: {
    ...mapMutations({
      setSharedDialogVis: "AnalyReportAttr/setSharedDialogVis",
    }),
    ...mapActions({
      setPageCache: "HomeBody/setPageCache",
      deleteShare: "HomeBody/deleteShare",
      querySharedDetail: "HomeBody/querySharedDetail",
    }),
    handleClick(tab, event) {},
    //角色复选框全选
    roleAllChange(val) {
      this.checkedRoleIds = [];
      this.checkedRoles = [];
      if(val){
         this.roleList.forEach(item=>{
        //这里回显勾选一定要设置成中文名称label起作用
        this.checkedRoleIds.push(item.roleName);
        this.checkedRoles.push(item);
      })  
      }
      this.checkedRoleIds = val ? this.checkedRoleIds : [];
    },
    //选中分享角色列表
    selectRoleTable(select) {
        this.shareRoleList = select;
    },
    //选中分享用户列表
    selectUserTable(select){
      this.shareUserList = select;
    },
    //批量授权角色权限
    batchRoleAuth(){
      //将要批量修改的角色ID取出来
      for(var r = 0 ; r < this.shareRoleList.length; r++ ){
        for(var j = 0 ; j < this.roleTableData.length; j++){
            if(this.shareRoleList[r].roleId === this.roleTableData[j].roleId){
                this.roleTableData[j].authType = this.batchRoleAuthType;
                this.roleTableData[j].roleTimeInterval = this.batchRoleTime;
                var effectiveTime = (this.roleTableData[j].roleTimeInterval[0] || "").replace(
                    /\s*/g,
                    ""
                  );
                var invalidTime = (this.roleTableData[j].roleTimeInterval[1] || "").replace(
                    /\s*/g,
                    ""
                ) ;
                //设置对应时间
                this.roleTableData[j].effectiveTime = effectiveTime;
                this.roleTableData[j].invalidTime = invalidTime;
            }
        }
      }
      //关闭对应弹窗
      this.showRoleDialog = false;
    },
    //批量授权用户权限
    batchUserAuth(){
        //将要批量修改的角色ID取出来
      for(var r1 = 0 ; r1 < this.shareUserList.length; r1++ ){
        for(var j1 = 0 ; j1 < this.userTableData.length; j1++){
            if(this.shareUserList[r1].userId === this.userTableData[j1].userId){
                this.userTableData[j1].authType = this.batchUserAuthType;
                this.userTableData[j1].userTimeInterval = this.batchUserTime;
                var effectiveTime = (this.userTableData[j1].userTimeInterval[0] || "").replace(
                    /\s*/g,
                    ""
                  );
                var invalidTime = (this.userTableData[j1].userTimeInterval[1] || "").replace(
                    /\s*/g,
                    ""
                ) ;
                //设置对应时间
                this.userTableData[j1].effectiveTime = effectiveTime;
                this.userTableData[j1].invalidTime = invalidTime;
            }
        }
      }
      //关闭对应弹窗
      this.showUserDialog = false;
    },
    //用户复选框全选
    userAllChange(val){
      this.checkedUserIds = [];
      this.checkedUsers = [];
      if(val){
         this.userList.forEach(item=>{
            //这里回显勾选一定要设置成中文名称label起作用
            this.checkedUserIds.push(item.userName);
            this.checkedUsers.push(item);
        })  
      }
      this.checkedUserIds = val ? this.checkedUserIds : [];
    },
    //批量删除角色
    batchDelRoles(){
      if(this.shareRoleList.length === 0){
            this.$message.warning(`批量移除分享角色选项不能为空!`);
            return false;
      }
      var tempRoleName = [];
      for(var f = 0 ; f < this.shareRoleList.length ; f++ ){
         //解除左侧冻结复选框
        for(var z = 0 ; z < this.disableRoleIds.length ; z++){
            if(this.shareRoleList[f].roleId === this.disableRoleIds[z]){
                tempRoleName.push(this.shareRoleList[f].roleName);
                //移除对应数据
                this.disableRoleIds.splice(z,1);
            }
        }

        //移除表格中数据
        for(var m = 0 ; m < this.roleTableData.length; m++){
          if(this.shareRoleList[f].roleId === this.roleTableData[m].roleId){
            this.roleTableData.splice(m,1);
          }
        }
      }
       //去除相应勾选
      for(var b = 0 ; b < tempRoleName.length ; b++){
        for(var n = 0 ; n < this.checkedRoleIds.length ; n++){
             //对应名称相同
             if(tempRoleName[b] === this.checkedRoleIds[n]){
              //移除对应数据
              this.checkedRoleIds.splice(n,1);
          }
        }
      }
    },
    //打开批量授权角色页面
    openAuthRoles(){
      if(this.shareRoleList.length === 0){
            this.$message.warning(`批量授权角色选项不能为空!`);
            return false;
      }
      this.batchRoleAuthType = "";
      this.batchRoleTime = "";
      this.showRoleDialog = true;
    },
    openAuthUsers(){
      if(this.shareUserList.length === 0){
            this.$message.warning(`批量授权用户选项不能为空!`);
            return false;
      }
      this.batchUserAuthType = "";
      this.batchUserTime = "";
      this.showUserDialog = true;
    },
    //批量移除用户
    batchDelUser(){
      if(this.shareUserList.length === 0){
            this.$message.warning(`批量移除分享用户选项不能为空!`);
            return false;
      }
      var tempUserName = [];
      for(var f1 = 0 ; f1 < this.shareUserList.length ; f1++ ){
         //解除左侧冻结复选框
        for(var z1 = 0 ; z1 < this.disableUserIds.length ; z1++){
            if(this.shareUserList[f1].userId === this.disableUserIds[z1]){
                tempUserName.push(this.shareUserList[f1].userName);
                //移除对应数据
                this.disableUserIds.splice(z1,1);
            }
        }

        //移除表格中数据
        for(var m1 = 0 ; m1 < this.userTableData.length; m1++){
          if(this.shareUserList[f1].userId === this.userTableData[m1].userId){
            this.userTableData.splice(m1,1);
          }
        }
      }
       //去除相应勾选
      for(var b1 = 0 ; b1 < tempUserName.length ; b1++){
        for(var n1 = 0 ; n1 < this.checkedUserIds.length ; n1++){
             //对应名称相同
             if(tempUserName[b1] === this.checkedUserIds[n1]){
              //移除对应数据
              this.checkedUserIds.splice(n1,1);
          }
        }
      }
    },
    //角色检索
    roleResFilter() {
      this.queryRoleList({ sysId: this.defaultSystemId || "1016", roleName:this.filterText});
    },
    //用户检索
    userResFilter(){
      this.queryUserList({  tenantId: window.sessionStorage.getItem("tenant_id"), key:this.filterText});
    },
    //角色选中改变
    checkedRolesChange(val){
      this.checkedRoles = [];
      for(var x = 0 ; x < val.length ; x++ ){
        for(var y = 0 ; y < this.roleList.length ; y++ ){
            if(val[x] === this.roleList[y].roleName && !this.checkedRoles.includes(this.roleList[y])){
                this.checkedRoles.push(this.roleList[y]);
            }
        }
      }
    },
    //用户选中改变
    checkedUserIdsChange(val){
       this.checkedUsers = [];
      for(var x1 = 0 ; x1 < val.length ; x1++ ){
        for(var y1 = 0 ; y1 < this.userList.length ; y1++ ){
            if(val[x1] === this.userList[y1].userName && !this.checkedUsers.includes(this.userList[y1])){
                this.checkedUsers.push(this.userList[y1]);
            }
        }
      }
    },
    //角色批量移动到右侧表格中(不包含已经冻结的选项)
    roleMove(){
       //移动数据之前将对应复选框选项变成冻结状态
       for(var p = 0 ; p < this.checkedRoles.length ;p++){
         if(this.oriRoleTableData.length > 0){
             for(var h = 0 ; h < this.oriRoleTableData.length ; h++){
                if(this.checkedRoles[p].roleId === this.oriRoleTableData[h].roleId){
                    this.checkedRoles[p].authType = this.oriRoleTableData[h].authType;
                    this.checkedRoles[p].roleTimeInterval = this.oriRoleTableData[h].roleTimeInterval;
                    this.checkedRoles[p].effectiveTime = this.oriRoleTableData[h].effectiveTime;
                    this.checkedRoles[p].invalidTime =  this.oriRoleTableData[h].invalidTime;
                }else{
                  this.checkedRoles[p].effectiveTime = '2020-08-08';
                  this.checkedRoles[p].invalidTime =  '2020-08-08';
                  this.$set(this.checkedRoles[p],'roleTimeInterval', ['2020-08-08','2020-08-08']);
                }
            }
         }else{
           this.checkedRoles[p].effectiveTime = '2020-08-08';
           this.checkedRoles[p].invalidTime =  '2020-08-08';
           this.$set(this.checkedRoles[p],'roleTimeInterval', ['2020-08-08','2020-08-08']);
         }
          this.disableRoleIds.push(this.checkedRoles[p].roleId);
       }

       //将数据添加到对应tab表格中
       this.roleTableData = this.checkedRoles;
    },
    //用户批量移动到右侧表格中
    userMove(){
        //移动数据之前将对应复选框选项变成冻结状态
       for(var p1 = 0 ; p1 < this.checkedUsers.length ;p1++){
          if(this.oriUserTableData.length > 0){
             for(var h1 = 0 ; h1 < this.oriUserTableData.length ; h1++){
                if(this.checkedUsers[p1].roleId === this.oriUserTableData[h1].roleId){
                    this.checkedUsers[p1].authType = this.oriUserTableData[h1].authType;
                    this.checkedUsers[p1].userTimeInterval = this.oriUserTableData[h1].userTimeInterval;
                    this.checkedUsers[p1].effectiveTime = this.oriUserTableData[h1].effectiveTime;
                    this.checkedUsers[p1].invalidTime =  this.oriUserTableData[h1].invalidTime;
                }else{
                  this.checkedUsers[p1].effectiveTime = this.oriUserTableData[h1].effectiveTime;
                  this.checkedUsers[p1].invalidTime =  this.oriUserTableData[h1].invalidTime;
                  this.$set(this.checkedUsers[p1],'userTimeInterval', ['2020-08-08','2020-08-08']);
                }
            }
         }else{
            this.checkedUsers[p1].effectiveTime = this.oriUserTableData[h1].effectiveTime;
            this.checkedUsers[p1].invalidTime =  this.oriUserTableData[h1].invalidTime;
            this.$set(this.checkedUsers[p1],'userTimeInterval', ['2020-08-08','2020-08-08']);
         }
          this.disableUserIds.push(this.checkedUsers[p1].userId);
       }
       //将数据添加到对应tab表格中
       this.userTableData = this.checkedUsers;
    },
    //角色授权类型触发事件
    roleAuthTypeChange(id,authType){
      for(var m = 0 ; m < this.checkedRoles.length ; m++){
        //表示本行数据-对授权类型进行赋值
        if(this.checkedRoles[m].roleId === id){
            this.checkedRoles[m].authType = authType;
            break;
        }
      }
      //映射到表格中
      this.roleTableData = this.checkedRoles;
    },
    //用户授权类型触发
    userAuthTypeChange(id,authType){
        for(var m1 = 0 ; m1 < this.checkedRoles.length ; m1++){
        //表示本行数据-对授权类型进行赋值
        if(this.checkedUsers[m1].userId === id){
            this.checkedUsers[m1].authType = authType;
            break;
        }
      }
      //映射到表格中
      this.userTableData = this.checkedUsers;
    },
    //角色生效时间区间
    roleTimeChange(row){
        let time = row.roleTimeInterval
        if(time != null){
              var effectiveTime = (time[0] || "").replace(
            /\s*/g,
            ""
          );
          var invalidTime = (time[1] || "").replace(
            /\s*/g,
            ""
          );
          for(var m = 0 ; m < this.checkedRoles.length ; m++){
            //表示本行数据-对授权类型进行赋值
            if(this.checkedRoles[m].roleId === row.roleId){
                this.checkedRoles[m].roleTimeInterval = time;
                this.checkedRoles[m].effectiveTime = effectiveTime;
                this.checkedRoles[m].invalidTime = invalidTime;
                break;
            }
          }
        }
      //映射到表格中
      this.roleTableData = this.checkedRoles;
    },
    //用户生效事件区间
    userTimeChange(row){
       let time = row.roleTimeInterval
        if(time != null){
          var effectiveTime = (time[0] || "").replace(
            /\s*/g,
            ""
          );
          var invalidTime = (time[1] || "").replace(
            /\s*/g,
            ""
          );
          for(var m1 = 0 ; m1 < this.checkedUsers.length ; m1++){
            //表示本行数据-对授权类型进行赋值
            if(this.checkedUsers[m1].userId === row.userId){
                this.checkedUsers[m1].userTimeInterval = time;
                this.checkedUsers[m1].effectiveTime = effectiveTime;
                this.checkedUsers[m1].invalidTime = invalidTime;
                break;
            }
          }
        }
      //映射到表格中
      this.userTableData = this.checkedUsers;
    },
    //移除角色行
    removeRole(row){
      let removeRoleName = "";//移除角色名称
      //移除左侧冻结复选框
      for(var d = 0 ; d <  this.disableRoleIds.length ; d++){
          if(this.disableRoleIds[d] === row.roleId){
              this.disableRoleIds.splice(d,1);
          }
      }

      for(var u = 0 ; u < this.checkedRoles.length; u++){
        if(this.checkedRoles[u].roleId === row.roleId){
            removeRoleName = this.checkedRoles[u].roleName;
        }
      }

      //移除勾选
      for(var v = 0 ; v < this.checkedRoleIds.length; v++){
        if(this.checkedRoleIds[v] === removeRoleName){
          this.checkedRoleIds.splice(v,1);
        }
      }
  
      //移除表格中数据
      for(var t = 0 ; t < this.roleTableData.length ; t++){
         if(this.roleTableData[t].roleId === row.roleId){
           this.roleTableData.splice(t,1);
         }
      }

    },
    //移除用户行
    removeUser(row){
       let removeUserName = "";//移除用户中文名
      //移除左侧冻结复选框
      for(var d1 = 0 ; d1 <  this.disableUserIds.length ; d1++){
          if(this.disableUserIds[d1] === row.userId){
              this.disableUserIds.splice(d1,1);
          }
      }

      for(var u1 = 0 ; u1 < this.checkedUsers.length; u1++){
        if(this.checkedUsers[u1].userId === row.userId){
            removeUserName = this.checkedUsers[u1].userName;
        }
      }

      //移除勾选
      for(var v1 = 0 ; v1 < this.checkedUsers.length; v1++){
        if(this.checkedUserIds[v1] === removeUserName){
          this.checkedUserIds.splice(v1,1);
        }
      }
  
      //移除表格中数据
      for(var t1 = 0 ; t1 < this.userTableData.length ; t1++){
         if(this.userTableData[t1].userId === row.userId){
           this.userTableData.splice(t1,1);
         }
      }

    },
    closeDialog() {
      this.setSharedDialogVis(false);
      this.reset();
    },
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    //重置数据
    reset() {
      //左侧数据冻结全部打开
      this.disableRoleIds = [];
      this.disableUserIds = [];

      this.checkedUsers = [];
      this.checkedRoles = [];

      //清空右侧数据
      this.setPageCache("");
      this.roleTableData = [];
      this.userTableData = [];
    },
    roleSelectedChange(data, moveStatus, moveList){
      this.roleSharedList = data;
    },
    userSelectedChange(data, moveStatus, moveList){
      this.userSharedList = data;
    },
    cancelShare() {
      let _this = this;
      this.$confirm("确认取消分享?", "提示", {
        closeOnClickModal: false,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.deleteShare(this.pageCache.pageId)
          .then(function () {
            _this.reset();
            _this.setSharedDialogVis(false);
            _this.$message.success("取消分享成功");
          })
          .catch((err) => {
            console.error(err);
          });
      });
    },
    //分享应用(用户与角色模块不能为空)
    shareApply() {
      if (
        this.roleTableData.length === 0 &&
        this.userTableData.length === 0
      ) {
        this.$message.warning(`分享角色或用户不能为空`);
        return false;
      }

      if(this.roleTableData.length > 0){
        for(var s = 0 ; s < this.roleTableData.length ; s++ ){
          if(this.roleTableData[s].roleTimeInterval === '' && this.roleTableData[s].authType === ''){
              this.$message.warning(`分享角色的有效期与授权类型不能为空!`);
              return false;
          }
        }
      }

      if(this.userTableData.length > 0){
         for(var q = 0 ; q < this.userTableData.length ; q++ ){
          if(this.userTableData[q].userTimeInterval === '' && this.userTableData[q].authType === ''){
              this.$message.warning(`分享用户的有效期与授权类型不能为空!`);
              return false;
          }
        }
      }

      let objId = this.pageCache.pageId;
      let shareRoles = [];
      let shareUsers = [];
      this.roleTableData.forEach((role) => {
        shareRoles.push({ objId: objId, sharedRole: role.roleId ,authType: role.authType , tempEffectiveTime: role.effectiveTime, tempInvalidTime: role.invalidTime});
      });
      this.userTableData.forEach((user) => {
        shareUsers.push({ objId: objId, sharedUser: user.userId ,authType: user.authType , tempEffectiveTime: user.effectiveTime,tempInvalidTime: user.invalidTime});
      });
      let params = {
        shareUsers: shareUsers,
        shareRoles: shareRoles,
      };
      this.share(params, 1);
    },
    queryRoleList(param) {
      let _this = this;
      //获取菜单列表
      service({
        maskOff: true,
        url: `${this.pubSYSUrl}/role/queryRoles`,
        method: "post",
        data: param
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            if (
              response.data.respData != null &&
              response.data.respData.length > 0
            ) {
              let data = response.data.respData;
              _this.roleList = data;
            }
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    queryUserList(param) {
      let _this = this;
      //获取菜单列表
      service({
        maskOff: true,
        url: `${this.pubSYSUrl}/tenant/getTenantUnSelUsers`,
        method: "post",
        data: param,
        headers: {
          "X-UserId": window.sessionStorage.getItem("user_id") || "9999012",
        },
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            if (
              response.data.respData != null &&
              response.data.respData.length > 0
            ) {
              let data = response.data.respData;
              _this.userList = data;
            }
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    //分享应用
    share(param) {
      let _this = this;
      service({
        maskOff: true,
        url: `${this.renderEngine}/share/`,
        method: "post",
        data: param
      })
        .then(function (response) {
          if (response.data.respResult === "1") {
            _this.$message.success("应用分享成功");
            _this.reset();
            _this.setSharedDialogVis(false);
            _this.$parent.search();
            return;
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
    //查询应用已分享的角色和用户列表
    getSharedRoleAndUserList(pageId) {
      let _this = this;
      this.querySharedDetail(pageId)
        .then(function (response) {
          if (response.data.respResult === "1") {
            let shareUsers = response.data.respData.shareUsers || [];
            let shareRoles = response.data.respData.shareRoles || [];
            //回显用户列表
            shareUsers.forEach((user) => {
              //设置要冻结的复选框
              _this.disableUserIds.push(user.sharedUser);
              //设置要勾选的复选框
              _this.checkedUserIds.push(user.userName);
              //设置表格数据
              var tempUserTime =  [];
              tempUserTime.push(user.effectiveTime);
              tempUserTime.push(user.invalidTime);
              user.userTimeInterval = tempUserTime;
              user.userId = user.sharedUser;
              _this.checkedUsers.push(user);
              _this.userTableData.push(user);
              _this.oriUserTableData.push(user);
            });
            shareRoles.forEach((role) => {
               //设置要冻结的复选框
              _this.disableRoleIds.push(role.sharedRole);
              //设置要勾选的复选框
              _this.checkedRoleIds.push(role.roleName);
              //设置表格数据
              var tempRoleTime = [];
              tempRoleTime.push(role.effectiveTime);
              tempRoleTime.push(role.invalidTime);
              role.roleId = role.sharedRole;
              role.roleTimeInterval = tempRoleTime;
              _this.checkedRoles.push(role);
              _this.roleTableData.push(role);
              _this.oriRoleTableData.push(role);
            });
          } else {
            _this.$message.error(response.data.respErrorDesc);
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    },
  },
  mounted() {
    //获取当前页面已分享的角色和用户
    if (this.pageCache && this.pageCache.pageId) {
      this.getSharedRoleAndUserList(this.pageCache.pageId);
    }
    //查询所有的角色列表和用户列表
    this.queryRoleList({ sysId: this.defaultSystemId || "1016" });
    this.queryUserList({
      tenantId: window.sessionStorage.getItem("tenant_id"),
    });
  },
};
</script>

<style lang="scss" scoped>
$border-clr01: #dcdfe6; // 边框色1
$main-color: #409eff; //主色调
$bg-clr01: #ecf5ff; // 块背景色1
$txt-clr01: #afc0d0; // 文字颜色1
$txt-clr02: #606266;
.condi-set-box {
  height: 300px;
  padding: 0;

  /deep/ .el-main {
    padding: 0;
  }

  /deep/ .el-header {
    padding: 0;
  }

  /deep/ .el-form-item__label {
    text-align: right;
  }

  .condi-aside {
    border-right: 1px dashed $border-clr01;

    .con-dataset {
      display: inline-block;
      width: 110px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 19px;
      vertical-align: -5px;
    }
  }

  .condi-main {
    padding-left: 20px;
    overflow: hidden;

    /deep/ .el-input-group {
      vertical-align: top;
    }
  }

  .field-list {
    width: 100%;
    height: 28px;
    border: 1px solid $border-clr01;
    border-radius: 3px;
    margin-bottom: 10px;
    line-height: 26px;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 10px;
    font-size: 12px;

    &.active {
      border-color: $main-color;
      background-color: $bg-clr01;
      color: $main-color;
    }
  }
}

.interact-set-wrap {
  /deep/ .el-tabs__nav {
    margin-left: -84px;
    left: 50%;
  }

  .two-tab /deep/ .el-tabs__nav {
    margin-left: -83px;
  }

  /deep/ .el-tab-pane {
    .horizon-split-line {
      margin: 10px 0px 20px;
      border-bottom: 1px dashed $border-clr01;
    }

    & > .el-checkbox {
      height: 24px;
      line-height: 25px;
      margin-top: 4px;
      margin-bottom: 4px;
    }
  }

  /deep/ .el-tabs__header {
    margin: 0 0 10px;
  }

  /deep/ .el-checkbox,
  /deep/ .el-checkbox__label {
    font-size: 12px;
  }

  .check-item {
    display: inline-block;
    width: 50%;
    margin-bottom: 6px;

    &:nth-last-child(1),
    &:nth-last-child(2) {
      margin-bottom: 6px;
    }

    /deep/ span {
      font-size: 12px;
    }

    /deep/ .el-checkbox {
      margin-right: 10px;

      &.is-checked + .check-item-label {
        color: $main-color;
      }
    }

    &.hide-label {
      /deep/ .el-checkbox__label {
        display: none;
      }
    }

    .check-item-label {
      display: inline-block;
      width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
      vertical-align: -3px;
      color: $txt-clr02;

      &.selected {
        color: $main-color;
      }
    }

    .check-item-icon {
      margin-left: 10px;
      cursor: pointer;
      color: $txt-clr02;

      &:hover {
        color: $main-color;
      }

      /deep/ .el-select {
        .el-input__inner {
          border: none;
          height: 17px;
          line-height: 17px;
          text-overflow: ellipsis;
        }
      }
    }
  }

  #secondCheckgroup .check-item-label {
    width: 130px;
  }

  .condi-main {
    margin-top: -9px;
  }

  .ds-title {
    color: $txt-clr02;
  }

  /deep/ .el-tab-pane {
    .tab-check-wrap {
      height: 200px;
      width: 100%;

      /deep/ .el-scrollbar {
        .el-scrollbar__wrap {
          overflow-x: hidden;
        }
      }
    }
  }

  /deep/ .el-transfer-panel__list.is-filterable {
    height: 126px;
    padding-top: 0;
  }

  /deep/ .el-transfer-panel {
    width: 270px;
  }
}
</style>
<style>
.interact-set-wrap
  .el-checkbox.is-checked
  + .check-item-label
  + .not-selected
  .el-select
  .el-select__caret::before {
  color: #f56c6c;
  animation: blink 3s linear infinite;
  /* 其它浏览器兼容性前缀 */
  -webkit-animation: blink 3s linear infinite;
  -moz-animation: blink 3s linear infinite;
  -ms-animation: blink 3s linear infinite;
  -o-animation: blink 3s linear infinite;
}

@-webkit-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.interact-set-wrap .check-item-icon .el-select .el-input__icon {
  line-height: 17px;
  transform: rotateZ(180deg);
}
.el-input-pageName {
  width: 185px;
}
.el-input-pageUrl {
  width: 275px;
}
.publish-menus .el-form-item__label {
  width: 78px;
}
</style>




