<template>
  <!-- 添加数据源弹窗 -->
  <div>
    <el-dialog
      class="datasrc-dialog"
      title="添加数据源"
      style="height:100%"
      :visible.sync="dataSrcDialogVis"
      :close-on-click-modal="false"
      size="mini"
      width="750px"
      :destroy-on-close="true"
      v-loading="loading"
    >
      <div style="height:510px;width:100%">
        <!--显示资产-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv=='100'">
          <div class="db-list-wrap">
            <div class="db-item">
              <div>
                <div class="db-icon icon-A10716_component"></div>
                <div class="db-tit">数据实体</div>
              </div>
              <div>
                <span class="plus-icon icon-A10072_add" @click="openInnerDialog(1)"></span>
              </div>
            </div>
          </div>
        </el-tabs>

        <!--显示资产与直连库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv=='110'">
          <el-tab-pane label="数据资产" name="first">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10716_component"></div>
                  <div class="db-tit">数据实体</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openInnerDialog(1)"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="数据库" name="second">
            <div class="db-list-wrap">
              <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                <div class="db-item" v-for="(item,index) in dbList" :key="index+Math.random()">
                  <div>
                    <div :class="['db-icon',item.resourceTypeDesc]"></div>
                    <div class="db-tit">{{item.resourceTypeName}}</div>
                  </div>
                  <div>
                    <span class="plus-icon icon-A10072_add" @click="openInnerDialog(2,item)"></span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!--显示资产与直连库、本地excel库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv== '111'">
          <el-tab-pane label="数据资产" name="first">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10716_component"></div>
                  <div class="db-tit">数据实体</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openInnerDialog(1)"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="数据库" name="second">
            <div class="db-list-wrap">
              <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                <div class="db-item" v-for="(item,index) in dbList" :key="index+Math.random()">
                  <div>
                    <div :class="['db-icon',item.resourceTypeDesc]"></div>
                    <div class="db-tit">{{item.resourceTypeName}}</div>
                  </div>
                  <div>
                    <span class="plus-icon icon-A10072_add" @click="openInnerDialog(2,item)"></span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
          <el-tab-pane label="文件数据源" name="third">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">EXCEL</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openUploadDialog"></span>
                </div>
              </div>
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">CSV</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>

              <!--交互系统-->
               <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">交互系统</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>

            </div>
          </el-tab-pane>
        </el-tabs>

        <!--显示直连库、本地excel库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv == '011'">
          <el-tab-pane label="数据库" name="second">
            <div class="db-list-wrap">
              <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
                <div class="db-item" v-for="(item,index) in dbList" :key="index+Math.random()">
                  <div>
                    <div :class="['db-icon',item.resourceTypeDesc]"></div>
                    <div class="db-tit">{{item.resourceTypeName}}</div>
                  </div>
                  <div>
                    <span class="plus-icon icon-A10072_add" @click="openInnerDialog(2,item)"></span>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>

          <el-tab-pane label="文件数据源" name="third">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">EXCEL</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openUploadDialog"></span>
                </div>
              </div>
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">CSV</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>

               <!--交互系统-->
               <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">交互系统</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!--显示本地excel库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv == '001'">
          <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">EXCEL</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openUploadDialog"></span>
                </div>
              </div>
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">CSV</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>

               <!--交互系统-->
               <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">交互系统</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>
            </div>
        </el-tabs>

        <!--显示资产、本地excel库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv== '101'">
          <el-tab-pane label="数据资产" name="first">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10716_component"></div>
                  <div class="db-tit">数据实体</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openInnerDialog(1)"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>
         <el-tab-pane label="文件数据源" name="third">
            <div class="db-list-wrap">
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">EXCEL</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openUploadDialog"></span>
                </div>
              </div>
              <div class="db-item">
                <div>
                  <div class="db-icon icon-A10159_excel"></div>
                  <div class="db-tit">CSV</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="OpenCSVDialog"></span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>

        <!--显示直连库-->
        <el-tabs v-model="activeTabName" v-show="datasourcePriv== '010'">
          <div class="db-list-wrap">
            <el-scrollbar style="height:100%;" :native="false" :noresize="false" tag="section">
              <div class="db-item" v-for="(item,index) in dbList" :key="index+Math.random()">
                <div>
                  <div :class="['db-icon',item.resourceTypeDesc]"></div>
                  <div class="db-tit">{{item.resourceTypeName}}</div>
                </div>
                <div>
                  <span class="plus-icon icon-A10072_add" @click="openInnerDialog(2,item)"></span>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-tabs>
      </div>

      <el-dialog
        width="680px"
        title="传统关系数据库添加"
        :visible.sync="addEntityVis"
        append-to-body
        :destroy-on-close="true"
        class="inner-dialog-wrap"
        id="auto_ds_tab"
        :close-on-click-modal="false"
        v-loading="loading"
      >
        <el-table
          :data="assetDataSrcList"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          ref="assetListTable"
          height="400"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="resource_name" label="数据源名称" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="conn_name" label="数据源信息" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="resource_type_name" label="数据源类型" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column prop="db_user_mode" label="用户" :show-overflow-tooltip="true"></el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addEntityVis=false" size="mini">取 消</el-button>
          <el-button type="primary" @click="addAssetDataSrc" size="mini">添 加</el-button>
        </div>
      </el-dialog>
    </el-dialog>
    <el-dialog
      width="480px"
      :title="curEditDataSrc == ''?'数据源添加':'数据源更新'"
      :visible.sync="addDBVis"
      append-to-body
      :destroy-on-close="true"
      class="inner-dialog-wrap"
      :close-on-click-modal="false"
      :before-close="handleClose"
      id="auto_dsAdd_dialog"
    >
      <el-form
        :model="dbRuleForm"
        :rules="dbRules"
        ref="dbRuleForm"
        label-width="100px"
        class="demo-dbRuleForm"
        size="mini"
      >
        <el-form-item label="数据库版本" prop="db_version">
          <el-select v-model="dbRuleForm.db_version" placeholder="请选择数据库版本" style="width:100%">
            <el-option
              v-for="versionItem in dbVersionList"
              :key="versionItem.id"
              :label="versionItem.dbVersion"
              :value="versionItem.dbVersion"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="数据源名称" prop="dsName">
          <el-input v-model="dbRuleForm.dsName" placeholder="列表显示名称"></el-input>
        </el-form-item>
        <el-form-item label="数据库地址" prop="ip_address">
          <el-input v-model="dbRuleForm.ip_address" placeholder="主机名或IP"></el-input>
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="dbRuleForm.port" placeholder="请输入端口"></el-input>
        </el-form-item>
        <el-form-item label="数据库名称" prop="db_name">
          <el-input v-model="dbRuleForm.db_name" placeholder="数据库名称"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="user_name">
          <el-input v-model="dbRuleForm.user_name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="dbRuleForm.password" placeholder="请输入密码" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetDbForm" size="mini">取 消</el-button>
        <el-button type="primary" @click="submitDataSrcForm(1)" size="mini">连接测试</el-button>
        <el-button
          type="primary"
          @click="submitDataSrcForm(2)"
          size="mini"
        >{{curEditDataSrc == ""?'添 加':'更 新'}}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="excelUploadDialog"
      title="上传文件"
      width="530px"
      @close="closeUploadDialog('uploadForm')"
      v-loading="upLoding"
    >
      <el-form ref="uploadForm" :model="uploadForm" :rules="uploadRules">
        <el-form-item
          :label-width="'100px'"
          label="请选择文件"
          class="star"
          style="margin-left:10px"
          prop="foldName"
        >
          <el-input
            v-model="uploadForm.foldName"
            size="mini"
            style="width:308px"
            placeholder="选择待上传文件"
            :disabled="true"
          ></el-input>
          <el-upload
            class="compt-import"
            :show-file-list="false"
            action
            accept=".xls, .xlsx"
            :auto-upload="false"
            :before-upload="uploadExcel"
            :on-change="changeFile"
          >
            <el-button slot="trigger" size="mini" type="primary">选择</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item
          :label-width="'100px'"
          label="请输入名称"
          class="star"
          prop="dsName"
          style="margin-left:10px"
        >
          <el-tooltip effect="light" placement="right">
            <div slot="content" style="color:#409eff">
              名称只能由中英文、数字及下划线、斜线
              <br />、反斜线、竖线、小括号、中括号组成，
              <br />不超过50个字符
              <br />
            </div>
            <el-input
              v-model="uploadForm.dsName"
              size="mini"
              style="width:308px"
              :title="uploadForm.dsName"
            ></el-input>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span style="margin-left:20px;margin-top:20px;font-size:13px;color:red">
        注意：1、您使用的是Excel上传，将默认使用第一个sheet,导入时默认
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        第一行为表头;
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px;color:red">
        2、文件列数不超过100列，文件大小不超过20M，若文件较大，
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        建议以追加的方式分批次上传。
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px"></span>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="uploadReset('uploadForm')">取 消</el-button>
        <el-button
          type="primary"
          @click="submitUpload('uploadForm')"
          size="mini"
        >确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="csvUploadDialog"
      title="上传文件"
      width="530px"
      @close="closeCsvDialog('CSVForm')"
      v-loading="csLoading"
    >
      <el-form ref="CSVForm" :model="CSVForm" :rules="uploadRules">
        <el-form-item :label-width="'100px'" label="请选择文件" class="star" style="margin-left:10px">
          <el-input
            v-model="CSVForm.foldName"
            size="mini"
            style="width:308px"
            placeholder="选择待上传文件"
            :disabled="true"
          ></el-input>
          <el-upload
            class="compt-import"
            :show-file-list="false"
            action
            accept=".csv"
            :auto-upload="false"
            :before-upload="CsvUploadMethod"
            :on-change="changeCsvFile"
          >
            <el-button slot="trigger" size="mini" type="primary">选择</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item
          :label-width="'100px'"
          label="请输入名称"
          class="star"
          prop="dsName"
          style="margin-left:10px"
        >
          <el-tooltip effect="light" placement="right">
            <div slot="content" style="color:#409eff">
              名称只能由中英文、数字及下划线、斜线
              <br />、反斜线、竖线、小括号、中括号组成，
              <br />不超过50个字符
              <br />
            </div>
            <el-input
              v-model="CSVForm.dsName"
              size="mini"
              style="width:308px"
              :title="CSVForm.dsName"
            ></el-input>
          </el-tooltip>
        </el-form-item>
      </el-form>
      <span style="margin-left:20px;margin-top:20px;font-size:13px;color:red">
        注意：1、您使用的是CSV上传，将默认使用第一个sheet，导入时默认
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        第一行为表头;
        <br />
      </span>
      <span style="margin-left:58px;font-size:13px;color:red">
        2、文件列数不超过100列，文件大小不超过20M，若文件较大，
        <br />
      </span>
      <span style="margin-left:79px;font-size:13px;color:red">
        建议以追加的方式分批次上传。
        <br />
      </span>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="csvReset('CSVForm')">取 消</el-button>
        <el-button type="primary" @click="csvUpload('CSVForm')" size="mini">确定</el-button>
      </div>
    </el-dialog>
    <!-- 内层弹窗点取消，第一层弹窗还留着 内层弹窗点确定，第一层弹窗也一起关掉 -->
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
import { objDeepCopy } from "../../utils/comonFunc.js";
import { AESUtil } from "ngbd-utils";
export default {
  props: {
    dataSrcInfo: {
      //是否编辑状态
      type: [String, Object],
      default: ""
    }
  },
  data() {
    var checkLength = (dbRules, value, callback) => {
      if (!value) {
        return callback(new Error("请输入数据源名称"));
      } else if (value.length > 15) {
        callback(new Error("数据源名称不能超过15个字符"));
      } else {
        callback();
      }
    };
    var checkIp = (dbRules, value, callback) => {
      var reg =
        "^(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\." +
        "(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\." +
        "(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)\\." +
        "(1\\d{2}|2[0-4]\\d|25[0-5]|[1-9]\\d|\\d)$";
      var re = new RegExp(reg);

      if (!value) {
        return callback(new Error("请输入数据库地址"));
      } else if (!re.test(value)) {
        callback(new Error("地址不符合规范"));
      } else {
        callback();
      }
    };
    var checkPort = (dbRules, value, callback) => {
      var reg = "^[0-9]+$";
      var re = new RegExp(reg);
      if (!value) {
        return callback(new Error("请输入端口"));
      } else if (!re.test(value)) {
        callback(new Error("端口号不符合规范"));
      } else {
        callback();
      }
    };
    var checkDbName = (dbRules, value, callback) => {
      if (!value) {
        return callback(new Error("请输入数据库名称"));
      } else if (value.length > 20) {
        callback(new Error("数据库名称不能超过20个字符"));
      } else {
        callback();
      }
    };
    var checkUsername = (dbRules, value, callback) => {
      if (!value) {
        return callback(new Error("请输入用户名"));
      } else if (value.length > 20) {
        callback(new Error("用户名不能超过20个字符"));
      } else {
        callback();
      }
    };
    var checkPassword = (dbRules, value, callback) => {
      if ((value || "").trim() === "") {
        callback(new Error("请输入密码"));
      }
      // if (!value) {
      //   return callback(new Error("请输入密码"));
      // }
      else if (value.length > 20) {
        callback(new Error("密码不能超过20个字符"));
      } else {
        callback();
      }
    };
    var checkFoldName = (uploadRules, value, callback) => {
      var reg = /^[a-zA-Z0-9\|_\\\(\/\)\[\]\u4E00-\u9FA5]+$/;
      // var reg="^[a-zA-Z0-9\|_\\\\(\/\)\\[\\]\u4E00-\u9FA5]+$"
      if (value.length > 50) {
        callback(new Error("文件名称不能超过50个字符"));
      } else if (!reg.test(value.trim())) {
        callback(new Error("文件名称错误"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      addEntityVis: false, //新增实体弹窗
      dbList: Object.freeze([]), //数据源库类型 调接口查

      dbRuleForm: {
        dsName: "",
        ip_address: "",
        port: "",
        db_name: "",
        db_version: "",
        user_name: "",
        password: ""
      },
      dbRules: {
        // dsName: [
        //   { required: true, message: "请输入数据源名称", trigger: "blur" }
        // ],

        // ip_address: [
        //   { required: true, message: "请输入数据库地址", trigger: "blur" }
        // ],
        // port: [{ required: true, message: "请输入端口", trigger: "blur" }],
        // db_name: [
        //   { required: true, message: "请输入数据库名称", trigger: "blur" }
        // ],
        // db_version: [
        //   { required: true, message: "请选择数据库版本", trigger: "change" }
        // ],
        // user_name: [
        //   { required: true, message: "请输入用户名", trigger: "blur" }
        // ],
        // password: [
        //   {
        //     message: "请输入密码",
        //     trigger: "blur",
        //     validator: this.checkPassword,
        //     required: true
        //   }
        // ]
        dsName: [{ required: true, validator: checkLength, trigger: "blur" }],
        ip_address: [{ required: true, validator: checkIp, trigger: "blur" }],
        port: [{ required: true, validator: checkPort, trigger: "blur" }],
        db_name: [{ required: true, validator: checkDbName, trigger: "blur" }],
        db_version: [
          { required: true, message: "请选择数据库版本", trigger: "change" }
        ],
        user_name: [
          { required: true, validator: checkUsername, trigger: "blur" }
        ],
        password: [
          {
            required: true,
            validator: checkPassword,
            trigger: "blur"
          }
        ]
      },
      assetDataSrcList: [], // 资产数据源列表
      multipleSelection: [], //资产数据源选中列表
      curSelDbType: "", //当前选择新增的数据库类型
      curEditDataSrc: "", //当前编辑的数据源
      dbVersionList: [], //数据库版本下拉列表
      curOptState: 0, //标识当前是属于测试连接（0），新增的保存（1），还是修改时的更新（2）
      /**本地文件上传模块begin */
      excelUploadDialog: false,
      uploadForm: {
        foldName: "",
        dsName: ""
      },
      uploadRules: {
        dsName: [{ required: true, validator: checkFoldName, trigger: "blur" }],
        foldName: [
          { required: true, message: "请选择上传文件", trigger: "change" }
        ]
      },
      file: null,
      upLoding: false,
      /**本地文件上传模块end */
      /**本地文件上传CSV模块beign */
      csvUploadDialog: false,
      CSVForm: {
        foldName: "",
        dsName: ""
      },
      CsvFile: null,
      csLoading: false
      /**本地文件上传CSV模块end */
    };
  },
  methods: {
    // 资产数据源列表多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 添加资产数据源信息
    addAssetDataSrc() {
      const _this = this;
      let connIdArr = [];
      this.multipleSelection.forEach(selectedRow => {
        if (
          selectedRow.conn_id != null &&
          !connIdArr.includes(selectedRow.conn_id)
        ) {
          connIdArr.push(selectedRow.conn_id);
        }
      });
      let isSucc = false;
      _this.loading = true;
      // 如果数组为空就相当与删除
      this.getDataSrcReqApi({
        param: {
          tenantId: window.sessionStorage.getItem("tenant_id") || "34234234",
          connIds: connIdArr
        },
        type: "addAssetDataSrc"
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success("数据源添加成功");
            isSucc = true;
            _this.loading = false;
          } else {
            _this.$message.error(
              response.data.respErrorDesc || "数据源添加失败"
            );
            _this.loading = false;
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("数据源添加失败");
        })
        .finally(() => {
          _this.addEntityVis = false;
          if (isSucc) {
            // 成功把外围弹窗一起关掉
            _this.upDataSrcDialogVis(false);
            _this.triggerSearch();
          }
        });
    },
    getDataSourceType() {
      this.getSourceType().then(val => {
        const souceAry = val.data.respData;
        if (val.data.respResult == 1 && souceAry.length > 0) {
          let dbList = souceAry.filter(item => {
            return item.resourceTypeId === "database";
          });
          if (dbList.length > 0) {
            // 新增数据源弹窗的数据库列表
            this.dbList = Object.freeze(dbList[0].children || []);
          }
        }
      });
    },
    // 打开新增数据源内层弹窗，type=1:数据源 2--自定义数据库类型
    openInnerDialog(type, dbType = {}) {
      switch (type) {
        case 1:
          this.addEntityVis = true;
          break;
        case 2:
          // 在关闭自定义数据源的弹窗之前，要把当前点击的数据源信息重置
          this.curEditDataSrc = "";
          for (const key in this.dbRuleForm) {
            this.dbRuleForm[key] = "";
          }
          this.addDBVis = true;
          this.curSelDbType = dbType.resourceTypeKey || "";
          this.queryDbVersionList(this.curSelDbType);
          break;
        default:
          break;
      }
    },
    queryDbVersionList(dbType) {
      let _this = this;
      this.getDataSrcReqApi({
        param: {
          dbType: dbType
        },
        type: "qryDbVersion"
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.dbVersionList = response.data.respData || [];
          } else {
            _this.$message.error(
              response.data.respErrorDesc || "数据库版本查询失败"
            );
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error("数据库版本查询失败");
        });
    },
    // 测试连接
    testConnection(parameter) {
      let _this = this;
      let paramList = [],
        dsType = this.curSelDbType;
      if (parameter != undefined) {
        paramList = parameter.paramList; //列表页行数据的测试连接
        dsType = parameter.dsType;
      } else {
        paramList = this.getDSParamList(); //弹窗内测试连接
      }
      this.getDataSrcReqApi({
        param: {
          dsType: dsType,
          paramList: paramList
        },
        type: "testConnection"
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success(`数据源连接成功`);
          } else {
           /*  _this.$message.error(
              `连接失败，填写的数据库信息不正确或未开启数据库服务，请检查！`
            ); */
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error(
          //   `连接失败，填写的数据库信息不正确或未开启数据库服务，请检查！`
          // );
        });
    },
    submitDataSrcForm(type) {
      //1--连接测试校验 2--添加校验
      if (type === 1) {
        this.curOptState = 0;
      } else if (this.curEditDataSrc == "") {
        //新增保存
        this.curOptState = 1;
      } else {
        this.curOptState = 2;
      } //标识当前是属于测试连接（0），新增的保存（1），还是修改时的更新（2）
      this.$refs["dbRuleForm"].validate(valid => {
        if (valid) {
          if (type === 1) {
            this.testConnection();
          } else {
            this.addCustomizeDataSrc();
          }
        } else {
          return false;
        }
      });
    },
    // 新增自定义数据库数据源
    addCustomizeDataSrc() {
      const _this = this;
      let paramList = [];
      let postName = "addCustomizeDataSrc";
      let param = {};
      if (this.curEditDataSrc == "") {
        //新增
        paramList = this.getDSParamList();
        param = {
          dsName: (this.dbRuleForm.dsName || "").trim(),
          dsType: this.curSelDbType,
          tenantId: window.sessionStorage.getItem("tenant_id") || "34234234",
          optUser: window.sessionStorage.getItem("user_id") || "9990035",
          optTime: "",
          paramList: paramList
        };
        _this.loading = true;
      } else {
        let oriParamList = objDeepCopy(this.curEditDataSrc.paramList);
        oriParamList = oriParamList.filter(item => {
          return item.paramName !== "tns";
        }); //tns每次编辑都会重新生成，所以不能传到后台
        //编辑
        let addParam = objDeepCopy(this.dbRuleForm);
        for (let index = 0; index < oriParamList.length; index++) {
          const param1 = oriParamList[index];
          const keyName = param1.paramName;
          if (keyName === "db_type") continue; //db_type不在表单内，所以需要跳过
          oriParamList[index].paramValue = (
            this.dbRuleForm[keyName] || ""
          ).trim();
          // Encrypt
          if (keyName === "password") {
            //密码需要用aes加密
            oriParamList[index].paramValue = AESUtil.encrypt(
              (this.dbRuleForm[keyName] || "").trim()
            );
            oriParamList[index]["isEncrypt"] = 1;
          }
          if (addParam.hasOwnProperty(keyName)) {
            delete addParam[keyName];
          }
        }
        //后端列表不返回password，从this.dbRuleForm获取
        // if ((oriParamList.filter(res => res.paramName === "password") || []).length < 1) {
        //   oriParamList.push({paramName:'password',paramValue: AESUtil.encrypt(this.dbRuleForm["password"] || "").trim(),isEncrypt : '1'})
        // }

        //将页面新增的参数更新到后台
        let addParaList = [];
        for (let key in addParam) {
          if (!["dsName", "tns", "db_type"].includes(key)) {
            let item = {
              paramName: key,
              paramValue:
                key === "password"
                  ? AESUtil.encrypt(addParam["password"] || "").trim()
                  : (addParam[key] || "").trim(),
              isEncrypt: key === "password" ? "1" : "0"
            };
            addParaList.push(item);
          }
        }
        postName = "upCustomizeDataSrc";
        paramList = oriParamList;
        paramList = paramList.concat(addParaList);
        param = {
          dsId: this.curEditDataSrc.dsId,
          dsName: (this.dbRuleForm.dsName || "").trim(),
          dsType: this.curEditDataSrc.dsType,
          paramList: paramList
        };
      }

      let messagePrefix = postName === "upCustomizeDataSrc" ? "更新" : "添加";

      this.getDataSrcReqApi({
        param: param,
        type: postName
      })
        .then(function(response) {
          if (response.data.respResult === "1") {
            _this.$message.success(`数据源${messagePrefix}成功`);
            _this.loading = false;
            _this.addDBVis = false;
            // 成功把外围弹窗一起关掉
            if (_this.dataSrcDialogVis) {
              _this.upDataSrcDialogVis(false);
            }
            _this.triggerSearch();
          } else {
            _this.$message.error(
              response.data.respErrorDesc || `数据源${messagePrefix}失败`
            );
            _this.loading = false;
          }
        })
        .catch(function(error) {
          console.error(error);
          // _this.$message.error(`数据源${messagePrefix}失败`);
        });
    },
    resetDbForm() {
      this.$refs["dbRuleForm"].resetFields();
      this.addDBVis = false;
    },
    editDataSrc(rowData) {
      this.curEditDataSrc = objDeepCopy(rowData);
      this.queryDbVersionList(rowData.dsType);
      this.addDBVis = true;
      this.curSelDbType = rowData.dsType;
      let form = this.dbRuleForm;
      form.dsName = rowData.dsName;
      let paramList = rowData.paramList;
      for (let index = 0; index < paramList.length; index++) {
        const element = paramList[index];
        if (!["tns", "db_type"].includes(element.paramName)) {
          //编辑密码不返回
          form[element.paramName] = element.paramValue;
          if (element.paramName === "password") {
            form[element.paramName] = ""; //编辑时密码框不回显回来
          }
        }
      }
    },
    // 获取自定义数据源表单参数数据
    getDSParamList() {
      let paramList = [];
      for (const key in this.dbRuleForm) {
        if (this.dbRuleForm.hasOwnProperty(key) && key !== "dsName") {
          let value1 = (this.dbRuleForm[key] || "").trim();
          // Encrypt
          if (key === "password") {
            //密码需要用aes加密
            value1 = AESUtil.encrypt(value1);
          }
          paramList.push({
            paramName: key,
            paramValue: value1,
            isEncrypt: key === "password" ? 1 : 0
          });
        }
      }
      if (
        !paramList.some(item => {
          return item.paramName === "db_type";
        })
      ) {
        //谦信那边的接口需要有db_type
        paramList.push({
          paramName: "db_type",
          paramValue: this.curSelDbType
        });
      }
      return paramList;
    },
    // checkPassword(rule, value, callback) {
    //   // 任何情况都校验 都必填
    //   if ((value || "").trim() === "") {
    //     callback(new Error("请输入密码"));
    //   }
    //
    //   else {
    //     callback();
    //   }
    // },
    handleClose(done) {
      this.$refs["dbRuleForm"].resetFields(); //清除校验提示
      this.$nextTick(() => {
        done();
      });
    },
    // 触发数据源列表页面数据的刷新
    triggerSearch() {
      this.$emit("emitListSearch");
    },
    /**本地上传文件excel--begin */
    /**触发上传文件对话框 */
    openUploadDialog() {
      this.excelUploadDialog = true;
    },
    uploadExcel() {
      let formData = new FormData();
      formData.append("file", this.file.raw);
      formData.append("dsName", this.uploadForm.dsName);
      this.upLoding = true;
      this.extExcelUpload(formData)
        .then(res => {
          if (res) {
            if (res.status == 200 && res.data.respResult == "1") {
              this.$message({
                type: "success",
                message: "上传成功"
              });
              this.upLoding = false;
              this.excelUploadDialog = false;
              this.dataSrcDialogVis = false;
              this.triggerSearch();
            } else if (res.data.respResult == "0") {
              this.$message.error(res.data.respErrorDesc);
              this.upLoding = false;
            }
          }
        })
        .catch(err => {
          this.$message.error(err);
          console.error(err);
          this.upLoding = false;
        })
        .finally(() =>{
          this.upLoding = false;
        });
    },
    changeFile(file) {
      this.file = file;
      this.uploadForm.foldName = file.name;
      let test = file.name.split(".");
      this.uploadForm.dsName = test[0];
    },
    uploadReset(uploadForm) {
      this.upLoding = false;
      this.excelUploadDialog = false;
      this.file = null;
      this.$refs[uploadForm].resetFields();
      this.uploadForm.foldName = "";
    },
    closeUploadDialog(uploadForm) {
      this.excelUploadDialog = false;
      this.upLoding = false;
      this.file = null;
      this.uploadForm.dsName = "";
      this.uploadForm.foldName = "";
      this.$refs[uploadForm].resetFields();
    },
    submitUpload(uploadForm) {
      if (this.file == null) {
        this.$message({
          message: "请选择文件",
          type: "warning"
        });
        return;
      }
      let test = this.uploadForm.foldName.split(".");
      if (test[test.length - 1] != "xls" && test[test.length - 1] != "xlsx") {
        this.$message.error("文件后缀名应为.xlsx或是.xls");
        return;
      }
      this.$refs.uploadForm.validate(valid => {
        if (valid) {
          this.$confirm("确认上传该excel文件?", "提示", {
            closeOnClickModal: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.uploadExcel();
            })
            .catch(err => {
              console.error(err);
            });
        } else {
          this.$message("请按照提示要求输入文件名");
        }
      });
    },
    /**本地上传文件excel--end */
    /**本地上传CSV --begin*/
    OpenCSVDialog() {
      this.csvUploadDialog = true;
    },
    closeCsvDialog(CSVForm) {
      this.csLoading = false;
      this.csvUploadDialog = false;
      this.CSVForm.foldName = "";
      this.CSVForm.dsName = "";
      this.$refs[CSVForm].resetFields();
    },
    csvReset(CSVForm) {
      this.csLoading = false;
      this.csvUploadDialog = false;
      this.CsvFile = null;
      this.CSVForm.foldName = "";
      this.CSVForm.dsName = "";
      this.$refs[CSVForm].resetFields();
    },
    csvUpload(CSVForm) {
      if (this.CsvFile == null) {
        this.$message({
          message: "请选择文件",
          type: "warning"
        });
        return;
      }
      let test = this.CSVForm.foldName.split(".");
      if (test[test.length - 1] != "csv") {
        this.$message.error("文件仅支持CSV格式！");
        return;
      }
      this.$refs.CSVForm.validate(valid => {
        if (valid) {
          this.$confirm("确认上传该csv文件?", "提示", {
            closeOnClickModal: false,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              this.CsvUploadMethod();
            })
            .catch(err => {});
        } else {
          this.$message("请按照提示要求输入文件名");
        }
      });
    },
    CsvUploadMethod() {
      let formData = new FormData();
      formData.append("file", this.CsvFile.raw);
      formData.append("dsName", this.CSVForm.dsName);
      this.csLoading = true;
      this.extCsvUpload(formData)
        .then(res => {
          if (res) {
            if (res.status == 200 && res.data.respResult == "1") {
              this.$message.success("上传成功");
              this.csLoading = false;
              this.csvUploadDialog = false;
              this.dataSrcDialogVis = false;
              this.triggerSearch();
            } else if (res.data.respResult == "0") {
              this.$message.error(res.data.respErrorDesc);
              this.csLoading = false;
            }
          }
        })
        .catch(err => {
          this.$message.error(err);
          console.error(err);
          this.csLoading = false;
        })
        .finally(() =>{
          this.csLoading = false;
        });
    },
    changeCsvFile(file) {
      this.CsvFile = file;
      this.CSVForm.foldName = file.name;
      let test = file.name.split(".");
      this.CSVForm.dsName = test[0];
    },
    /**本地上传CSV --end*/
    ...mapActions({
      getDataSrcReqApi: "DataSetMgt/getDataSrcReqApi",
      extExcelUpload: "compt/extExcelUpload", //本地文件上传
      extCsvUpload: "compt/extCsvUpload", //本地csv文件上传
      getSourceType: "DataSetMgt/getSourceType" //数据源查询
    }),
    ...mapMutations({
      upDataSrcDialogVis: "DataSetMgt/upDataSrcDialogVis",
      upActiveTabName: "DataSetMgt/upActiveTabName",
      upAddDBVis: "DataSetMgt/upAddDBVis"
    })
  },
  computed: {
    ...mapState({
      datasourcePriv: state => state.commonProperties.datasourcePriv //数据源类型显示块
    }),
    dataSrcDialogVis: {
      get: function() {
        return this.$store.state.DataSetMgt.dataSrcDialogVis;
      },
      set: function(val) {
        this.upDataSrcDialogVis(val);
      }
    },
    activeTabName: {
      get: function() {
        return this.$store.state.DataSetMgt.activeTabName;
      },
      set: function(val) {
        this.upActiveTabName(val);
      }
    },
    addDBVis: {
      get: function() {
        return this.$store.state.DataSetMgt.addDBVis;
      },
      set: function(val) {
        this.upAddDBVis(val);
      }
    }
  },
  watch: {
    // 监听打开资产数据源弹窗
    addEntityVis(newVal, oldVal) {
      if (newVal) {
        const _this = this;
        this.getDataSrcReqApi({
          param: {
            tenantId: window.sessionStorage.getItem("tenant_id") || "34234234"
          },
          type: "getAssetList"
        })
          .then(function(response) {
            if (response.data.respResult === "1") {
              _this.assetDataSrcList = response.data.respData || [];
              // 重置表格勾选情况
              _this.multipleSelection = [];
              _this.$nextTick(() => {
                (_this.assetDataSrcList || []).forEach(row => {
                  if (row.isCheck === "1") {
                    _this.$refs.assetListTable.toggleRowSelection(row);
                    _this.multipleSelection.push(row);
                  }
                });
              });
            } else {
              _this.$message.error(
                response.data.respErrorDesc || "列表查询失败"
              );
            }
          })
          .catch(function(error) {
            console.error(error);
            // _this.$message.error("列表查询失败");
          });
      }
    },
    dataSrcDialogVis(newVal, oldVal) {
      if (newVal) {
        this.getDataSourceType();
        if (
          this.datasourcePriv == "110" ||
          this.datasourcePriv == "111" ||
          this.datasourcePriv == "011"
        ) {
          //多个选中直连
          this.upActiveTabName("second");
        } else {
          //否则默认选中第一个
          this.upActiveTabName("first");
        }
      }
    },
    dataSrcInfo(newVal, oldVal) {
      if (newVal !== "") {
        this.editDataSrc(newVal);
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.star {
  /deep/.el-form-item__label::before {
    content: "*";
    color: #f56c6c;
    margin-right: 4px;
  }
}

// 新增数据源弹窗样式
.datasrc-dialog {
  /deep/.el-dialog__body {
    padding: 0 20px;
  }
  /deep/.el-tabs__header {
    margin-bottom: 3px;
  }
  .db-list-wrap {
    width: 100%;
    overflow: hidden;
    border: 1px solid #e4e7ed;
    height: 441px;
    padding: 25px 10px;
    .db-item {
      position: relative;
      width: 20%;
      height: 120px;
      display: inline-block;
      padding: 10px;
      & > div {
        width: 100%;
        height: 80px;
        border-radius: 4px;
      }
      & > div:first-child {
        position: relative;
        text-align: center;
        color: #8cc5ff;
        .db-tit {
          font-size: 16px;
        }
        .db-icon {
          font-size: 36px;
          margin-bottom: 6px;
          margin-top: 1px;
        }
      }
      & > div:last-child {
        z-index: 1;
        position: absolute;
        top: 0px;
        left: 0px;
        background-color: rgba(64, 158, 255, 0.6);
        display: none;
        text-align: center;
        line-height: 80px;
        .plus-icon {
          color: #fff;
          font-size: 30px;
          cursor: pointer;
          vertical-align: middle;
        }
      }
      &:hover {
        & > div:last-child {
          display: block;
        }
      }
    }

    /deep/.el-scrollbar__wrap {
      overflow: hidden;
    }
  }
  /deep/.el-tabs__nav {
    margin-left: -69px;
    left: 50%;
  }
}
</style>
<style>
/* 双弹窗第二层弹窗的遮罩 */
.inner-dialog-wrap {
  background: rgba(0, 0, 0, 0.55);
}
.compt-import {
  display: inline-block;
}
</style>
