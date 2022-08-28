<template>
  <el-dialog
    size="mini"
    title="邮件推送"
    width="700px"
    :visible.sync="emailTaskDialogVis"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="reset"
    :destroy-on-close="true"
    class="el-dialog-cockpitPublic"
  >
    <div>
      <el-form
        :model="emailObj"
        :rules="emailRules"
        ref="emailForm"
        label-width="100px"
        class="demo-emailRuleForm"
        size="mini"
      >
        <el-form-item label="主题" prop="subject">
          <el-input size="mini" maxlength="1000" v-model="emailObj.subject" placeholder="请输入主题"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="2" style="min-width: 85px;">
            <el-form-item label="" prop="emailTimeSuffix">
              <el-checkbox size="mini" v-model="emailObj.emailTimeSuffix">时间后缀</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="12" style="height: 46px; padding-left: 8px;">
            <el-form-item v-show="emailObj.emailTimeSuffix" label="" prop="subjectTimeStamp">
              <el-select v-model="emailObj.subjectTimeStamp" placeholder="请选择" size="mini">
                <el-option
                  v-for="item in timeStampList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="内容" prop="bodyText">
          <el-input size="mini"  maxlength="10000" show-word-limit type="textarea" resize="none" :rows="5" v-model="emailObj.bodyText" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="附件" prop="pageName">
          <el-input size="mini" disabled v-model="pageName"></el-input>
        </el-form-item>
        <div class="email-setting">
          <el-row>
            <el-col :span="6" style="margin-right: 15px; width: 28%;">
              <el-form-item label="发送周期" prop="pushType">
                <el-select v-model="emailObj.pushType" placeholder="请选择" size="mini">
                  <el-option
                    v-for="item in dateOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="6">
              <el-form-item v-show="emailObj.emailTimeSuffix" label="" prop="subjectTimeStamp">
                <el-select v-model="emailObj.subjectTimeStamp" placeholder="请选择" size="mini" style="width: 43%">
                  <el-option
                    v-for="item in timeStampList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col> -->
            <el-col :span="12" style="float: right;" v-show="emailObj.pushType==='2'">
              <el-form-item label="具体时间" prop="targetTime">
                <el-time-picker
                  v-model="emailObj.targetTime"
                  clearable
                  size="mini"
                  value-format="HH:mm:ss"
                  format="HH:mm"
                  style="width: 44%"
                  placeholder="请选择">
                </el-time-picker>
              </el-form-item>
            </el-col>
            <el-col :span="8" v-show="emailObj.pushType==='3'" >
              <el-form-item label="每月第" prop="targetDay">
                <el-select v-model="emailObj.targetDay" placeholder="请选择" size="mini">
                  <el-option
                    v-for="item in dayDataPickOption"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-show="emailObj.pushType==='3'" :span="1" style="width: 20px; line-height: 28px; padding-left: 12px;">
              <span>天</span>
            </el-col>
            <el-col :span="8" class="mini-label" v-show="emailObj.pushType==='3'" >
              <el-form-item label="时间" prop="targetTime">
                <el-time-picker
                  v-model="emailObj.targetTime"
                  clearable
                  size="mini"
                  value-format="HH:mm:ss"
                  format="HH:mm"
                  placeholder="请选择">
                </el-time-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-show="emailObj.pushType!=='1'">
            <el-col :span="12">
              <el-form-item label="开始日期" prop="beginTime">
                <el-date-picker
                  v-model="emailObj.beginTime"
                  size="mini"
                  type="date"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  editable
                  :picker-options="startDatePickerOptions"
                  clearable
                  @change="dataComponentInit"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束日期" prop="endTime">
                <el-date-picker
                  v-model="emailObj.endTime"
                  size="mini"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                  type="date"
                  editable
                  clearable
                  :picker-options="endDatePickerOptions"
                  @change="dataComponentInit"
                  placeholder="选择日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="收件人"
                prop="addressName"
                class="info-required"
              >
                <el-input ref="emailUserNameRef" v-model="emailObj.addressName" size="mini" @input="inputChange" @blur="inputBlur" @focus="inputFocus"></el-input>
                </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-form-item label="" prop="addressee">
              <el-select
                filterable
                ref="emailUserRef"
                size="mini"
                v-model="emailObj.addressee"
                class="el-muti_select"
                multiple
                clearable
                :collapse-tags="false"
                @remove-tag="removeAddressee"
                @clear="clearAddressee"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in addresseeList"
                  :key="item.userId"
                  :label="item.userName"
                  :value="item.userId"
                />
              </el-select>
            </el-form-item>
          </el-row>
        </div>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="mini" @click="closeDialog">取 消</el-button>
      <el-button class="content-submit" type="primary" @click="saveEmailTask" size="mini"><i :class="{'el-icon-loading':isSubmit, 'loading-class': true}"></i>确 定</el-button>
    </div>
  </el-dialog>
</template>


<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
export default {
  name: 'EmailTask',
  props: {
    pageObj: {
      type: Object
    }
  },
  data() {
    return {
      emailObj: {
        addressee: [],
        pushType: '2',
        subjectTimeStamp: 'yyyyMMdd',
        beginTime: '',
        endTime: '',
        subject: '',
        bodyText: '',
        targetTime: '',
        targetDay: '',
        emailTimeSuffix: '',
        createTime: '',
        updateTime: ''
      },
      isEdit: 0,
      addrIsNull: 0,
      firstEmail: {
        name: '',
        userId: ''
      },
      isSubmit: false,
      currentUserName: "",
      pageId: this.pageObj.pageId,
      selectFocus: false,
      taskId: this.pageObj.taskId,
      pageName: this.pageObj.pageName,
      isCancel: this.pageObj.isCancel,
      taskType: this.pageObj.taskType,
      addressEmailList: [],
      mailParam: '',
      taskContent: {}, // 存放报表的json文件
      emailRules: {
        subject: [
          { required: true, message: '主题为必填项', trigger: '' }
        ],
        pushType: [
          { required: true, message: '发送周期为必填项', trigger: '' }
        ],
        targetTime: [
          { required: true, message: '具体时间为必填项', trigger: '' }
        ],
        targetDay: [
          { required: true, message: '日期为必填项', trigger: '' }
        ],
        endTime: [
          { required: true, message: '结束日期为必填项', trigger: '' }
        ],
        beginTime: [
          { required: true, message: '开始日期为必填项', trigger: '' }
        ],
        addressee: [
          { validator: this.addresseeValid, trigger: 'change' }
        ]
      },
      contentAutosize: { minRows: 2, maxRows: 6 },
      dateOptions: [{
          value: '2',
          label: '日'
        }, {
          value: '3',
          label: '月'
        }, {
          value: '1',
          label: '一次性'
        }, 
        // {
        //   value: '4',
        //   label: '年'
        // }, 
      ],
      timeStampList: [{
          value: 'yyyy',
          label: 'yyyy'
        }, {
          value: 'yyyyMM',
          label: 'yyyyMM'
        }, {
          value: 'yyyyMMdd',
          label: 'yyyyMMdd'
        }, {
          value: 'yyyyMMddHHmmss',
          label: 'yyyyMMddHHmmss'
        }, 
      ],
      addresseeList: [
      ],
      startDatePickerOptions: {},
      endDatePickerOptions: {}
    }
  },
  computed: {
    ...mapState({
      pageCache: state => state.HomeBody.pageCache,
    }),
    ...mapGetters({
    }),
    emailTaskDialogVis: {
      get() {
        // if (this.$store.state.ReportMgt.emailTaskDialogVis) {
        //   this.getTaskData();
        // }
        return this.$store.state.ReportMgt.emailTaskDialogVis;
      },
      set(value) {
        this.setEmailTaskDialogVis(value);
      },
    },
    mailTaskParam: {
      get() {
        return this.$store.state.ReportMgt.mailTaskParam;
      }
    },
    dayDataPickOption() {
      let array = [];
      let curDayNum = this.mGetDate(new Date().getFullYear(), new Date().getMonth() + 1);
      for (let i = 1; i < curDayNum + 1; i++) {
        let day = i < 10 ? "0" + i : "" + i;
        let obj = {
          "value": day,
          "label": day
        }
        array.push(obj);
      }
      return array;
    }
  },
  methods: {
    ...mapMutations({
      setEmailTaskDialogVis: "ReportMgt/setEmailTaskDialogVis",
    }),
    ...mapActions({
      doExportReport: "ReportMgt/doExportReport",
      queryEmailTask: "HomeBody/queryEmailTask",
      queryEmailUser: "AnalyReportAttr/queryEmailUser", // 输入查询人员列表
      createRegularMailTask: "AnalyReportAttr/createRegularMailTask" // 创建推送任务
    }),
    closeDialog() {
      this.setEmailTaskDialogVis(false);
      this.reset();
    },
    reset() {
      
    },
    mGetDate(year, month){
      var d = new Date(year, month, 0);
      return d.getDate();
    },
    clearAddressee() {
      this.emailObj.addressee.unshift(this.currentUserName);
    },
    removeAddressee(val, index, arr) {
      // if (val === window.sessionStorage.getItem("user_id")) {
      //   this.emailObj.addressee.unshift(window.sessionStorage.getItem("user_id"))
      //   this.$message.info("不允许删除");
      // }
    },
    addresseeValid(rule, value, callback) {
      let msg = "";
      if (!this.emailObj.addressee || this.emailObj.addressee.length === 0) {
        msg = "收件人为必填项";
      }
      if (msg) {
        callback(new Error(msg));
        return;
      }
      callback();
    },
    inputBlur() {
      setTimeout(() => {
        if (this.$refs.emailUserRef) {
          let className = this.$refs.emailUserRef.$el.className;
          let classAtr = className.replace("normal-input","");
          this.$refs.emailUserRef.$el.className = classAtr;
        }
      }, 100)
    },
    inputFocus() {
      setTimeout(() => {
        this.$refs.emailUserRef.$el.classList.add("normal-input");
      }, 100)
    },
    inputChange(val) {
      if (val) {
        setTimeout(() => {
          this.getUserEmailList(val);
          this.selectFocus = true;
          this.$refs.emailUserRef.focus();
          this.$refs.emailUserRef.$el.classList.add("normal-input");
        }, 100)
        setTimeout(() => {
          this.selectFocus = true;
          this.$refs.emailUserNameRef.focus();
        }, 100)
      }
    },
    paramValid() {
      // 保存前先进行校验
      if (this.emailObj.pushType !== '1') {
        let beginTime = new Date(this.emailObj.beginTime.replace(/-/, "/"));
        let endTime = new Date(this.emailObj.endTime.replace(/-/, "/"));
        if (beginTime > endTime) {
          this.$message.error("开始日期不可以大于结束日期");
          this.isSubmit = false;
          return false;
        }
      }
      if (this.addrIsNull) {
        this.$message.error("收件人邮箱为空，请联系系统管理员设置用户电子邮箱。");
        this.isSubmit = false;
        return false;
      }
      // this.emailObj.targetTime;
      // let endDate = `${this.emailObj.endTime} ${this.emailObj.targetTime}:59`
      // let time = Date.parse(endDate);
      // if (!isNaN(time)) {
      //   let endTimeStamp = new Date(Date.parse(endDate.replace(/-/g, "/")));
      //   if (endTimeStamp < new Date()) {
      //     this.$message.error("结束日期和具体时间不可以小于当前时间" + this.emailObj.targetTime);
      //   }
      // }
      let obj = {};
      let param = this.beforeSubmit(obj);
      // this.setEmailTaskDialogVis(false);
      if (obj.msg) {
        this.isSubmit = false;
        return false;
      }
      this.submitTask(param);
    },
    saveEmailTask() {
      if (this.isSubmit) {
        return;
      }
      this.isSubmit = true;
      if (this.emailObj.pushType !== '3') {
        // 发送周期不是月份时去掉校验规则
        delete this.emailRules.targetDay; 
      }
      if (this.emailObj.pushType === '1') {
        delete this.emailRules.targetTime;
        delete this.emailRules.beginTime;
        delete this.emailRules.endTime;
      }
      // 保存推送任务
      this.$refs.emailForm.validate(valid => {
        if (valid) {
          this.paramValid();
        } else {
          this.isSubmit = false;
          return false;
        }
      });
    },
    queryEmailList() {
      let that = this;
      var param = {
          "mailPushTaskInfo":{
            "pageId": this.pageObj.pageId,           //报表Id
            "taskType": "1"
          },
          "isNeedMailInfo": 1,     //查询是否需要关联邮件内容 0：不做关联
        }
        this.queryEmailTask(param)
          .then(val => {
            if (val.status === 200 && val.data.respResult === "1") {
              // var total = val.data.dataTotalCount;
              // that.pageObj.taskId = val.data.respData.data[0].taskId;
              var list = val.data.respData.data;
              if (list && list.length > 0) {
                that.initData(list[0]);
              } else {
                that.getUserEmailList("");
              }
              // this.$store.commit("DataSetMgt/setTableData", {total, list});
            } else {
              this.$message.error("页面查询失败");
              // console.error(val);
            }
            this.loading = false;
          })
          .catch(err => {
            // this.$message.error("页面查询异常");
            this.loading = false;
          });
    },
    getUserEmailList(queryString, userIdList) {
      // 获取用户邮箱
      let _this = this;
      this.queryEmailUser({
        "searchUser": queryString,
        "userIdList": userIdList
      })
        .then(response => {
          if (
            response.data.respResult === "1" &&
            response.data.respData && response.data.respData.userEmailList.length > 0
          ) {
            let emailList = response.data.respData.userEmailList;
            _this.addresseeList = [];
            // emailList.forEach(item => {
            // 如果是编辑状态，取第一个用户为创建用户。新建取当前用户为创建用户
            if (userIdList) {
              this.isEdit = 1;
            }
            // userIdList: true   修改页面初始化
            // isEdit: true       修改页面查询邮件列表
            // else               新建页面初始化/查询邮件列表
            let firstUser = (userIdList && userIdList.length > 0) ? userIdList[0] : (this.isEdit ? this.firstEmail.userId : window.sessionStorage.getItem("user_id"));
            emailList.forEach(item => {
              let obj = {
                "userId": item.userId,
                "userName": `${item.userName}  <${item.mailAddr}>`
              }
              if (obj.userId !== firstUser) {
                _this.addresseeList.push(obj);
              } else {
                if (!item.mailAddr) {
                  this.addrIsNull = 1;
                }
                _this.firstEmail.userId = obj.userId;
                _this.firstEmail.name = obj.userName;
                _this.currentUserName = obj.userName;
              }
            })
            if (userIdList) {
              // 是否为编辑页面
              if (_this.emailObj.addressee && _this.emailObj.addressee.length === 0) {
                _this.emailObj.addressee.push(_this.currentUserName);
              } else {
                // 编辑页面查询
                _this.emailObj.addressee.shift();
                _this.emailObj.addressee.unshift(_this.currentUserName);
              } 
            } else {
              // 查找邮箱列表或用户新建任务初始化
              if (_this.emailObj.addressee && _this.emailObj.addressee.length === 0) {
                _this.emailObj.addressee.push(_this.currentUserName);
              }
            }
          }
        })
        .catch(error => {
          this.$message.error("查询收件人列表失败");
          console.error(error);
        })
      // var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // cb(results);
      // 调用 callback 返回建议列表的数据
    },
    getFormatDate(curDate) {
      // 将2020-02-02 20:20:20 转为 2020-02-02
      //获取当前时间
      var date = new Date(curDate);
      var seperator1 = "-";
      // var seperator2 = ":";
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      // var hours =
      //   date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      // var minutes =
      //   date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      // var seconds =
      //   date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      var strDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var currentdate =
        date.getFullYear() +
        seperator1 +
        month +
        seperator1 +
        strDate;
        // " " +
        // hours +
        // seperator2 +
        // minutes +
        // seperator2 +
        // seconds;
      return currentdate;
    },
    getNowFormatDate() {
      //获取当前时间
      var date = new Date();
      var seperator1 = "-";
      var seperator2 = ":";
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var hours =
        date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      var minutes =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      var seconds =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      var strDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var currentdate =
        date.getFullYear() +
        seperator1 +
        month +
        seperator1 +
        strDate +
        " " +
        hours +
        seperator2 +
        minutes +
        seperator2 +
        seconds;
      return currentdate;
    },
    compareTime(beginTime, fixPushTime, obj) {
      if (beginTime > fixPushTime) {
        obj.fixedPointDate = beginTime.getDate() < 10 ? '0' + beginTime.getDate() : beginTime.getDate();
        obj.fixedPointMonth = (beginTime.getMonth() + 1) < 10 ? '0' + (beginTime.getMonth() + 1) : (beginTime.getMonth() + 1);
        obj.fixedPointYear = beginTime.getFullYear();
      } else {
        obj.fixedPointDate = fixPushTime.getDate() < 10 ? '0' + fixPushTime.getDate() : fixPushTime.getDate();
        obj.fixedPointMonth = (fixPushTime.getMonth() + 1) < 10 ? '0' + (fixPushTime.getMonth() + 1) : (fixPushTime.getMonth() + 1);
        obj.fixedPointYear = fixPushTime.getFullYear();
      }
    },
    compareDay(beginTime, fixPushTime, obj) {
      if (beginTime <= fixPushTime) {
        obj.fixedPointDate = fixPushTime.getDate() < 10 ? '0' + fixPushTime.getDate() : fixPushTime.getDate();
        obj.fixedPointMonth = (fixPushTime.getMonth() + 1) < 10 ? '0' + (fixPushTime.getMonth() + 1) : (fixPushTime.getMonth() + 1);
        obj.fixedPointYear = fixPushTime.getFullYear();
      } else if (beginTime.getDate() > fixPushTime.getDate()) {
        // 开始时间的日期和推送时间的日期比较
        // 如果推送时间日期比较小，那么将开始时间+1月，给推送日期
        let afterMonthBeginTime = new Date(beginTime.setMonth(beginTime.getMonth() + 1));
        obj.fixedPointDate = fixPushTime.getDate() < 10 ? '0' + fixPushTime.getDate() : fixPushTime.getDate(); // 不能改变推送日
        obj.fixedPointMonth = (afterMonthBeginTime.getMonth() + 1) < 10 ? '0' + (afterMonthBeginTime.getMonth() + 1) : (afterMonthBeginTime.getMonth() + 1);
        obj.fixedPointYear = afterMonthBeginTime.getFullYear();
      } else {
        obj.fixedPointDate = fixPushTime.getDate() < 10 ? '0' + fixPushTime.getDate() : fixPushTime.getDate(); // 不能改变推送日
        obj.fixedPointMonth = (beginTime.getMonth() + 1) < 10 ? '0' + (beginTime.getMonth() + 1) : (beginTime.getMonth() + 1);
        obj.fixedPointYear = beginTime.getFullYear();
      }
    },
    // compareEndData(pointTime) {
    //   let msg = "";
    //   switch(this.emailObj.pushType) {
    //     case '2':

    //   }
    //   return msg;
    // },
    computedTime() {
      let obj = {
        "err": ""
      }
      let beginTime;
      let fixPushTime;
      try {
        switch(this.emailObj.pushType) {
          case '1': 
            fixPushTime = new Date();
            let hours = fixPushTime.getHours() < 10 ? '0' + fixPushTime.getHours() : fixPushTime.getHours();
            let minutes = fixPushTime.getMinutes() < 10 ? '0' + fixPushTime.getMinutes() : fixPushTime.getMinutes();
            let seconds = '00';
            obj.fixedPointDate = fixPushTime.getDate() < 10 ? '0' + fixPushTime.getDate() : fixPushTime.getDate();
            obj.fixedPointMonth = (fixPushTime.getMonth() + 1) < 10 ? '0' + (fixPushTime.getMonth() + 1) : (fixPushTime.getMonth() + 1);
            obj.fixedPointYear = fixPushTime.getFullYear();
            // this.compareTime(beginTime, fixPushTime, obj);
            obj.fixedPointTime = hours + ':' + minutes + ":" + seconds;
            break;
          case '2':
            // fixPushTime = new Date(this.getFormatDate(this.getNowFormatDate()) + " " + this.targetTime);
            beginTime = new Date(this.emailObj.beginTime + " 00:00:00");
            fixPushTime = new Date();
            this.compareTime(beginTime, fixPushTime, obj);
            break;
          case '3':
            beginTime = new Date(this.emailObj.beginTime + " 00:00:00");
            let curDate = new Date();
            fixPushTime = new Date(curDate.getFullYear() + '-' + (curDate.getMonth() + 1) + '-' + this.emailObj.targetDay + " " + this.emailObj.targetTime);
            if (curDate > beginTime) {
              beginTime = curDate;
            }
            this.compareDay(beginTime, fixPushTime, obj);
            break;
          default:
            break;
        }
        // let fixTime = new Date(obj.fixedPointYear + "-" + obj.fixedPointMonth + "-" + obj.fixedPointDate + " " + this.emailObj.targetTime);
        // if (fixTime > new Date(obj.);
      } catch (e) {
        obj.err = "时间转化错误";
      }
      return obj;
    },
    beforeSubmit(obj) {
      // 先抄送给自己
      let targetEmail = [];
      this.emailObj.addressee.forEach(item => {
        targetEmail.push(item);
      })
      targetEmail.shift(); // 删除自己默认填写的邮箱
      //  = obj.userId;
      targetEmail.unshift(this.firstEmail.userId); //
      // let date = new Date();
      // let month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1 + "";
      let pointTime = this.computedTime();
      if (pointTime.err) {
        this.$message.error(pointTime.err);
        // return false;
        obj.msg = pointTime.err;
      }
      // i
      // let isError = this.compareEndData(pointTime);
      let secondTargetTime = this.emailObj.targetTime.substring(0, this.emailObj.targetTime.lastIndexOf(':') + 1) + "00";
      let param = {
        "mailPushTaskInfo": {
          "taskId": this.taskId,                                //任务id
          "pageId": this.pageId,                                //报表id
          "userId": window.sessionStorage.getItem("user_id"),   //操作用户
          "tenantId": sessionStorage.getItem("tenant_id"), //当前租户
          "taskType": typeof(this.taskType) === 'undefined' ? 1 : this.taskType,                            //任务类型 1：定时邮件
          "fixedPointTime": this.emailObj.pushType === '1' ? pointTime.fixedPointTime : secondTargetTime,                                  //推送定点时间 hh:mm:ss
          "fixedPointDate": ""+pointTime.fixedPointDate,  //推送定点日期 dd
          "fixedPointMonth": ""+pointTime.fixedPointMonth,                                 //推送定点月 MM
          "fixedPointYear": ""+pointTime.fixedPointYear,                                  //推送定点年 yyyy
          "beginTime": this.emailObj.pushType !== '1' ? this.emailObj.beginTime + " 00:00:00" : this.getFormatDate(this.getNowFormatDate()) + " 00:00:00",                 //任务起始时间   yyyy-MM-dd hh:mm:ss 
          "endTime": this.emailObj.pushType !== '1' ? this.emailObj.endTime + " 23:59:59" : this.getFormatDate(this.getNowFormatDate()) + " 23:59:59",                     //任务结束时间  yyyy-MM-dd hh:mm:ss 推送周期为立即推送，发送几天日期
          "stepLength": 1,                                      //步长 
          "nextPushTime":"",                                    //下次推送时间
          "isCancel": 0,        //是否取消 1:取消 0：开放
          "createTime": this.emailObj.createTime ? this.emailObj.createTime : this.getNowFormatDate(),                //创建时间 
          "updateTime": this.emailObj.updateTime ? this.emailObj.updateTime : this.getNowFormatDate(),                //更新时间 
          "pushType": this.emailObj.pushType,                   //推送类型 1：一次性 2：按日 3：按月 4：按年
          "subject": this.emailObj.subject,                     //主题 1000
          "subjectTimeStamp": this.emailObj.emailTimeSuffix ? this.emailObj.subjectTimeStamp : '',   //主题后缀时间戳格式
          "bodyText": this.emailObj.bodyText,                   //正文 10000
          "taskContent": (JSON.stringify(this.taskContent) === '{}') ? JSON.stringify(this.mailTaskParam) : JSON.stringify(this.taskContent),                                    //报表设置 json数据
          "recipient": JSON.stringify(targetEmail),//邮箱接收 json数据
          "ccRecipient":"",                                     //邮箱抄送 json数据
        },
        "queryPushBeginTime":"",                              //推送时间范围检索 
        "queryPushEndTime":"",                                //推送时间范围检索
        "isNeedMailInfo": 0,                                  //查询是否需要关联邮件内容 0：不做关联   
        "startPage":"",                                       //起始页
        "pageNum":""                                          //分页数量
      };
      return param;
    },
    initData(data) {
      let beginDate = this.getFormatDate(data.beginTime);
      let endDate = this.getFormatDate(data.endTime);
      this.taskId = data.taskId;
      this.pageId = data.pageId;
      this.pageName = data.pageName;
      this.taskType = data.taskType;
      this.fixedPointTime = data.fixedPointTime;
      this.fixedPointDate = data.fixedPointDate;
      this.fixedPointMonth = data.fixedPointMonth;
      this.fixedPointYear = data.fixedPointYear;
      this.emailObj.beginTime = beginDate;
      this.emailObj.endTime = endDate;
      this.emailObj.createTime = data.createTime;
      this.emailObj.updateTime = data.updateTime;
      this.stepLength = data.stepLength;
      this.isCancel = data.isCancel;
      this.emailObj.pushType = data.pushType;
      this.taskContent = JSON.parse(data.taskContent);
      this.emailObj.addressee = JSON.parse(data.recipient);
      this.emailObj.subject = data.subject;
      this.emailObj.targetTime = data.pushType !== '1' ? data.fixedPointTime : '';
      this.emailObj.targetDay = data.pushType === '3' ? data.fixedPointDate : '';
      this.addressEmailList = JSON.parse(data.recipient);
      if (data.subjectTimeStamp) {
        this.emailObj.emailTimeSuffix = true;
        this.emailObj.subjectTimeStamp = data.subjectTimeStamp;
      }
      this.emailObj.bodyText = data.bodyText;

      // 重新添加本人的邮件
      if(this.emailObj.addressee && this.emailObj.addressee.length > 0) {
        this.getUserEmailList("", this.emailObj.addressee);
      }
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      };
    },
    handleSelect(item) {
      console.log(item);
    },
    getTaskData() {
      this.isSubmit = false;
      let param = {
        "mailPushTaskInfo":{
          "taskId": this.pageObj.taskId,             //任务id
          "taskType": "1",           //任务类型 1：定时邮件
        },
        "isNeedMailInfo": "1"     //查询是否需要关联邮件内容 0：不做关联
      }
      this.queryEmailTask(param)
        .then(val => {
          if (val.status === 200 && val.data.respResult === "1") {
            var list = val.data.respData.data[0];
            this.initData(list);
          } else {
            this.$message.error("页面查询失败");
            // console.error(val);
          }
          this.loading = false;
        })
        .catch(err => {
          // this.$message.error("页面查询异常");
          this.loading = false;
        });
    },
    dataComponentInit() {
      let that = this;
      this.startDatePickerOptions.disabledDate = function(time) {
        var todayYear = (new Date()).getFullYear();
        var todayMonth = (new Date()).getMonth();
        var todayDay = (new Date()).getDate();
        var todayTime = (new Date(todayYear, todayMonth, todayDay, '00', '00', '00')).getTime();// 毫秒
        if (time.getTime() < todayTime) {
          return true;
        }
        // 大于结束时间
        if (that.emailObj.endTime) {
          let endDate = new Date(that.emailObj.endTime.replace(/-/,"/"));
          if (endDate < time.getTime()) {
            return true;
          } 
        } 
        return false;
      }
      this.endDatePickerOptions.disabledDate = function(time) {
        var todayYear = (new Date()).getFullYear();
        var todayMonth = (new Date()).getMonth();
        var todayDay = (new Date()).getDate();
        var todayTime = (new Date(todayYear, todayMonth, todayDay, '00', '00', '00')).getTime();// 毫秒
        if (time.getTime() < todayTime) {
          return true;
        }
        // 小于开始时间
        if (that.emailObj.beginTime) {
          let beginTime = new Date(that.emailObj.beginTime.replace(/-/,"/"));
          if (beginTime > time.getTime()) {
            return true;
          } 
        } 
        return false;
      }
    },
    submitTask(param) {
      this.createRegularMailTask(param)
        .then(response => {
          if (
            response.data.respResult === "1"
          ) {
            this.setEmailTaskDialogVis(false);
            this.$message.success(response.data.respData);
          }
          else {
            this.setEmailTaskDialogVis(false);
            this.$message.error(response.data.respErrorDesc);
          }
          this.isSubmit = false;
          // cb(results);
        })
        .catch(error => {
          this.isSubmit = false;
          this.setEmailTaskDialogVis(false);
          this.$message.error("邮件推送任务配置失败");
          console.error(error);
        })
    }

  },
  mounted() {
    this.addrIsNull = 0;
    if (this.pageObj && this.pageObj.taskId) {
      this.getTaskData();
    } else {
      this.queryEmailList();
      this.isSubmit = false;
    }
    this.dataComponentInit();
  },
  beforeDestroy() {
    
  },
  watch: {
    pageObj: {
      handle: function(newVal, oldVal) {
        this.pageId = newVal.pageId;
        this.taskId = newVal.taskId;
        this.pageName = newVal.pageName;
        this.isCancel = newVal.isCancel;
        this.taskType = newVal.taskType;
      },
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
// $font-normal-color: #606266;
// $background-normal-color: #f5f7fa;
.el-muti_select /deep/.el-icon-circle-close{
  height:54px;
  line-height:54px;
}
.el-muti_select /deep/.el-input /deep/input{
  height:54px!important;
}

.el-muti_select /deep/.el-icon-circle-close{
  height:54px;
  line-height:54px;
}
.el-muti_select /deep/.el-input /deep/input{
  height:54px!important;
}
.el-muti_select /deep/ .el-select__tags:hover {
  overflow-y: scroll;
}
.el-muti_select /deep/ .el-select__tags {
  padding-right: 4px;
  height: 54px;
  overflow-y: hidden;
  z-index: 200 !important;
  .el-tag {
    overflow: hidden!important;
  }
}
.el-muti_select /deep/ .el-select{
  width: 100%;
  height: 100px;
}
.el-muti_select /deep/ .el-select__tags > span > span:first-child i{
  display:none !important;
}
// .el-select .el-tag__close.el-icon-close {
  
// }
/deep/ .el-form-item__content {
  // width: 100%;
  & > .el-textarea,& .el-select, & .el-date-editor, & .el-input, & .el-autocomplete{
    width: 100%;
  }
}
.el-col.mini-label{
  float: right;
}
.el-select__tags{
  ::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  ::-webkit-scrollbar-track {
    opacity: 0;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: 1px solid #ffffff;
    border-right-width: 2px;
    background-color: #c8c8c8;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
}
// 可滚动区域 鼠标移入 滚动条显示 鼠标移出 滚动条隐藏
.scroll-wrap-enable::-webkit-scrollbar-thumb,
.ht_master .wtHolder::-webkit-scrollbar-thumb,
.el-table__body-wrapper::-webkit-scrollbar-thumb {
  // opacity:0 ;
  visibility: hidden;
}

.scroll-wrap-enable:hover::-webkit-scrollbar-thumb,
.ht_master .wtHolder:hover::-webkit-scrollbar-thumb,
.el-table__body-wrapper:hover::-webkit-scrollbar-thumb {
  // opacity:1;
  visibility: visible // background: #e8e8e8;
}
.info-required:before {
  content: "*";
  color: #F56C6C;
  // display: inline-block;
  // line-height: 15px;
  position: absolute;
  left: 33px;
  top: 3px;
  // height: 10px;
  margin-right: 4px;
}
/deep/ .el-select.normal-input .el-input .el-input__inner {
  border-color: #C0C4CC !important;
}
.loading-class{
  position: absolute;
  left: 2px;
}
/deep/.el-button.content-submit{
  position: relative;
}
</style>
<style lang="scss" scoped>

  .el-select /deep/ .el-select__tags::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  .el-select /deep/ .el-select__tags::-webkit-scrollbar-track {
    opacity: 0;
  }

  .el-select /deep/ .el-select__tags::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: 1px solid #ffffff;
    border-right-width: 2px;
    background-color: #c8c8c8;
  }

  .el-select /deep/ .el-select__tags::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
  

  
  .el-textarea /deep/ .el-textarea__inner::-webkit-scrollbar {
    width: 9px;
    height: 9px;
  }

  .el-textarea /deep/ .el-textarea__inner::-webkit-scrollbar-track {
    opacity: 0;
  }

  .el-textarea /deep/ .el-textarea__inner::-webkit-scrollbar-thumb {
    border-radius: 4.5px;
    border: 1px solid #ffffff;
    border-right-width: 2px;
    background-color: #c8c8c8;
  }

  .el-textarea /deep/ .el-textarea__inner::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
</style>

