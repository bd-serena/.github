<template>
  <el-container class="computed-field-wrap">
    <el-aside width="400px" class="left-wrap">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="65px"
        class="computed-form"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="ruleForm.name" size="mini" ref="input1" placeholder="COL1"></el-input>
        </el-form-item>
        <el-form-item label="表达式" class="is-required">
          <div class="exp-wrap"
               :class="expErrorText!=''?'error-exp':''"
               @click="cmReset"
               @keydown.enter="confirmExp"
               @keydown.delete="deleteExp"
          >
            <codemirror
              ref="myCm"
              v-model="content"
              :options="cmOptions"
              class="codesql"
              @ready="onCmReady"
              @cursorActivity="handleShowHint"
            ></codemirror>
            <div class="el-form-item__error" style="line-height:25px; height: 25px;">{{expErrorText}}</div>
          </div>
        </el-form-item>
      </el-form>
    </el-aside>
    <el-main style="padding:0;overflow:hidden;padding-left:20px;">
      <el-container class="right-wrap">
        <el-header style="padding: 0;" height="40px">
          <MainTitle title="温馨提示"></MainTitle>
        </el-header>
        <el-main style="padding:0;height:200px;overflow:hidden;text-align:justify;">
          <ul>
            <li class="field-tip">1.字段名称只能由中英文、数字及下划线、%组成，不超过50个字符</li>
            <li class="field-tip">2.目前支持数值字段作为参数，支持的计算有：加法、减法、乘法、除法</li>
            <li class="field-tip">3.表达式中仅支持输入如下字符：+、-、*、/、[、(、)</li>
            <li class="field-tip">4.在表达式中输入[ 唤出列表来插入度量字段名</li>
            <li
              class="field-tip"
            >5.支持函数：(1)abs(x)返回数字的绝对值；(2)round(x,digits)对数字四舍五入或取小数点位数；(3)substr(x,start,length)对字段进行截取，目前仅支持字符串和数值字段；(4)sum(x)对字段进行汇总
            </li>
          </ul>
        </el-main>
      </el-container>
    </el-main>
    <div class="suggestion-wrap" v-show="isShowSuggestion" :style="suggestionStyle" tabindex="-1">
      <el-scrollbar style="height:100%;width:auto">
        <ul v-if="curHintType == 1">
          <li
            v-for="(item,index) in allRelFields"
            @click="addField(item)"
            :class="activeIdx == index?'selected':''"
            :title="item.phy_tab_name+'.'+item[SHOW_TYPE_ARR[item.show_type]]"
          >{{item.phy_tab_name+'.'+item[SHOW_TYPE_ARR[item.show_type]]}}
          </li>
          <!-- {{item.phy_tab_name+'.'+item.col_chs_name||item.col_name}} -->
        </ul>
        <ul v-if="curHintType == 2">
          <li
            v-for="(item,index) in funcHintOption"
            @click="addFunc(item)"
            :class="activeIdx == index?'selected':''"
            :title="item.label"
          >{{item.label}}
          </li>
          <!-- {{item.phy_tab_name+'.'+item.col_chs_name||item.col_name}} -->
        </ul>
      </el-scrollbar>
    </div>
  </el-container>
</template>

<script>
  import MainTitle from "../../components/tools/MainTitle";
  import {fieldMatch, objDeepCopy} from "../../utils/comonFunc.js";
  import {mapActions, mapState} from "vuex";
  import {codemirror} from "vue-codemirror";
  import "codemirror/lib/codemirror.css";
  import "codemirror/addon/hint/show-hint.css";
  import {service} from 'ngbd-utils';

  require("codemirror/addon/hint/show-hint");
  require("codemirror/addon/hint/sql-hint");

  export default {
    name: "ComputedDesign",
    components: {
      MainTitle,
      codemirror
    },
    props: {
      editFieldIdx: {
        //是否编辑状态
        type: Number,
        default: -1
      },
      allData: {
        type: Array,
        default() {
          return []
        }
      },
      fieldTypeList: {
        type: Object,
        default() {
          return {}
        }
      },
      formatList: {
        type: Array,
        default() {
          return []
        }
      },
      cpFieldInfo: {
        type: Object,
        default() {
          return {}
        }
      },
      datasetDetail: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        content: "",
        cmOptions: {
          mode: "text/x-mariadb",
          indentUnit: 2, // 缩进单位，默认2
          smartIndent: true, // 是否智能缩进
          tabSize: 4, // Tab缩进，默认4
          readOnly: false, // 是否只读，默认false
          showCursorWhenSelecting: true,
          addModeClass: true,
          extraKeys: {
          }
        },
        placeholder: "请选择函数",
        editor: null,
        ruleForm: {
          name: ""
        },
        rules: {
          name: [
            {
              required: true,
              message: "", //名称校验不通过，请修改
              trigger: "blur",
              validator: this.checkName
            }
          ]
        },
        funcFilterText: "",
        funcDataOri: Object.freeze([
          {
            label: "sum",
            usage: "sum(x)",
            desc: "sum(x,y...)",
            acceptColType: "number"
          },
          {
            label: "avg",
            usage: "avg(x)",
            desc: "avg(x)",
            acceptColType: "number"
          },
          {
            label: "substr",
            usage: "substr(x,y,z)",
            desc: "substr(x,y,z)",
            acceptColType: "number"
          }
        ]),
        funcData: [],
        isShowSuggestion: false,
        suggestionStyle: {
          top: "0px",
          left: "0px"
        },
        fieldList: [],
        cmEditor: null,
        expErrorText: "",
        expErrorDesc: "", //表达式错误详情
        activeIdx: -1,
        curHintType: 1, //1--field 2--func
        funcHintOptionOri: [
          {
            label: "abs",
            value: "abs()"
          },
          {
            label: "round",
            value: "round()"
          },
          {
            label: "substr",
            value: "substr()"
          },
          {
            label: "sum",
            value: "sum()"
          }
        ],
        funcHintOption: [],
        relFieldsArr: [],
        inputValidFlag: false,
        allRelFields: [], //当前相关的字段
        sendRequestFlag: false, //判断是否点击校验请求
        useOneTabFlag: false, //计算字段是否只涉及一张表
        curUseTab: "", //计算字段只涉及一张表时的表别名
        groupFunc: ['sum']
      };
    },
    methods: {
      // 检验计算字段是否只包含一张表的字段
      ifUseOneTab(field, tabAlias) {
        let flag = true,
        colFunExp = field.col_fun_exp;
        if (typeof this.allFieldsMap.keys == "function") {
          for (let key of this.allFieldsMap.keys()) {
            if (key != tabAlias && colFunExp.indexOf(`[${key}.`) > -1) {
              flag = false;
              break;
            }
          }
        }
        return flag;
      },
      checkCpFieldExpDup(cpField, passIdx = -1) {
        let flag = false;
        for (let index = 0; index < this.allData.length; index++) {
          const element = this.allData[index];
          if (passIdx == index) continue; //过滤掉这个计算字段本身
          if (
            element.is_calcul == "1" &&
            element.col_fun_exp == cpField.col_fun_exp
          ) {
            flag = true;
            break;
          }
        }
        return flag;
      },
      isDuplicate(name, exclude) {
        //检验是否重名
        var flag = false;
        if (name.trim() == "") return true;
        for(let i = 0; i < this.allData.length; i++) {
          let element = this.allData[i];
          if((exclude && exclude[0] == 1 && exclude[1] == i) || (exclude && exclude[0] == 2 && exclude[1] == i)) continue;
          if (element[this.SHOW_TYPE_ARR[element.show_type]].trim() == name) {
            flag = true;
            break;
          }
        }
        return flag;
      },
      checkName(rule, value, callback) {
        value = (value || "").trim();
        this.inputValidFlag = false;
        if (!value) {
          return callback(new Error("名称不能为空"));
        } else if (value.trim().length > 50) {
          return callback(new Error("名称超过规定长度"));
        }
        if (
          /^(.*?[`~!@#$^&\*\-+=<>?:"{}|,.;'\·~！@#\¥……&*——\-+={}|《》？：“”、；‘’，。、「」/\\()<>{}[\]]+).+$/g.test(
            value
          )
        ) {
          return callback(new Error("名称格式不符"));
        }
        if (
          /([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_%]){1,50}$/g.test(
            value
          )
        ) {
          if (this.isDuplicate(value.trim(),[2,this.editFieldIdx])) {
            callback(new Error("名称重名"));
          } else {
            this.inputValidFlag = true;
            callback();
          }
        } else {
          callback(new Error("名称格式不符"));
        }
      },
      addFunc(item) {
        var text = `${item.label}()`;
        this.addTextToCm(text, text.length - 1, false);
      },
      addField(item) {
        let text = item[this.SHOW_TYPE_ARR[item.show_type]] + "]";
        // var text = `${item.phy_tab_name}.${item.col_chs_name || item.col_name}`; //  item.col_id
        this.addTextToCm(text, text.length, true);
      },
      addTextToCm(text, curMoveLength, isField) {
        this.cmEditor.focus();
        let cursor = this.cmEditor.getCursor();
        const curLine = this.cmEditor.getLine(cursor.line);
        let rtChar = curLine.substring(cursor.ch).trim();
        rtChar = rtChar.substring(0, 1);
        if (isField && rtChar === "]") {
          //判断其后有没有紧跟的]，有的话不用补]
          text = text.substring(0, text.length - 1);
          curMoveLength -= 1;
        }
        if (isField) {
          this.cmEditor.replaceSelection(text);
          this.cmEditor.setCursor({
            line: cursor.line,
            ch: cursor.ch + curMoveLength
          });
        } else {
          let token = this.cmEditor.getTokenAt(cursor);
          if (token.string.length>1 && token.string[0]==='/') {
            token.string = token.string.substring(1,token.string.length);
            token.start = token.start+1;
          }
          if (token.string != undefined && token.string != "") {
            let newCursor = {...cursor};
            newCursor.ch = newCursor.ch - token.string.length;
            this.cmEditor.replaceRange(text, newCursor, cursor);
            cursor = this.cmEditor.getCursor();
            this.cmEditor.setCursor({
              line: cursor.line,
              ch: cursor.ch - 1
            });
          } else {
            this.cmEditor.replaceSelection(text);
            this.cmEditor.setCursor({
              line: cursor.line,
              ch: cursor.ch + curMoveLength
            });
          }
        }
      },
      windowClickHandle() {
        const cur = this.cmEditor.getCursor();
        const token1 = this.cmEditor.getTokenAt(cur);
        if (this.isShowSuggestion && token1.string != "[") {
          this.isShowSuggestion = false;
        }
      },
      onCmReady(cm) {
        this.cmEditor = cm;
      },
      handleShowHint() {
        const cur = this.cmEditor.getCursor();
        const token1 = this.cmEditor.getTokenAt(cur);
        // document.querySelector(".suggestion-wrap .el-scrollbar__wrap").scrollTo(0, 0);
        this.activeIdx = -1;
        if (token1.string.length>1 && token1.string[0]==='/') {
          token1.string = token1.string.substring(1,token1.string.length);
          token1.start = token1.start+1;
        }
        if (token1.type == "bracket" && token1.string == "[") {
          this.curHintType = 1;
          this.updateHintPanelPos();
          this.isShowSuggestion = true;
          // 判断当前需展示整形字段（abs,），还是字符型字段（substring）
          let curFieldFlag = "number";
          let curLineTokens = this.cmEditor.getLineTokens(cur.line);
          let TokensBeforeCur = curLineTokens.filter(token2 => {
            return token2.end <= cur.ch && (token2.string || "").trim() != "";
          });
          let tokenCount = TokensBeforeCur.length;
          if (
            tokenCount > 2 &&
            TokensBeforeCur[tokenCount - 2].type == "bracket" &&
            (TokensBeforeCur[tokenCount - 3].string || "")
              .trim()
              .toLocaleLowerCase() == "substr"
          ) {
            //如果在函数内 字段列表显示整型和字符型
            curFieldFlag = "string";
          }
          this.filterHintField(curFieldFlag);
        } else if (token1.string != undefined && token1.string.trim() != "") {
          let curString = token1.string.trim().toLocaleLowerCase();
          let hintFilter = this.funcHintOptionOri.filter(item => {
            return item.label.indexOf(curString) == 0;
          });
          if (hintFilter.length > 0 && curString != "") {
            this.curHintType = 2;
            this.updateHintPanelPos();
            this.isShowSuggestion = true;
            this.funcHintOption = hintFilter;
          }
        }
      },
      updateFieldList(acceptColType) {
        var list = [];
        this.allFieldsMap.forEach((value, key) => {
          for (let index = 0; index < value.length; index++) {
            list.push(value[index]);
          }
        });
        if (acceptColType == "all") this.fieldList = list;
        else {
          this.fieldList = list.filter(item => {
            return acceptColType.indexOf(item.col_raw_type.toLocaleLowerCase()) > -1;
          });
        }
      },
      ...mapActions({
        updateAllFieldsMap: "DataSetDesign/updateAllFieldsMap",
        getDataEntity: "DataSetMgt/getDataEntity"
      }),
      getNearestFuncName(line) {
        var lastIdx = line.lastIndexOf("(");
        var res = line.substring(0, lastIdx).match(/\w+/g) || [];
        var func = "";
        if (res.length > 0) {
          func = res[res.length - 1];
        }
        return func;
      },
      colFunExpTrans(colFunExpDesc) {
        var transItem = colFunExpDesc;
        var arrNoDistinct = colFunExpDesc.match(/\[(.+?)\]/g) || []; //匹配[]
        for (let index = 0; index < arrNoDistinct.length; index++) {
          let item = arrNoDistinct[index].trim();
          item = item.substring(item.indexOf("[") + 1, item.lastIndexOf("]"));
          arrNoDistinct[index] = item.trim();
        }
        var arr = Array.from(new Set(arrNoDistinct));
        var firColId = "",
          firTabKey = "";
        var matchMap = [];
        for (let index = 0; index < arr.length; index++) {
          const element = arr[index].trim();
          let res = this.allFileds.filter(item => {
            return item[this.SHOW_TYPE_ARR[item.show_type]] == element;
          });
          if (res.length > 0) {
            matchMap.push([
              `[${res[0][this.SHOW_TYPE_ARR[res[0].show_type]]}]`,
              `[${res[0].tab_alias}.${res[0].col_id}]`
            ]);
            if (firColId == "") {
              firColId = res[0].col_id;
              firTabKey = res[0].tab_alias;
            }
          }
        }
        // 为避免 "time1"将"time"给替换，先进行倒排序；
        // matchMap.sort(function(x, y) {
        //   return y.localeCompare(x);
        // });
        for (let index = 0; index < matchMap.length; index++) {
          const element = matchMap[index][0];
          const element2 = matchMap[index][1];
          while (transItem.indexOf(element) > -1) {
            transItem = transItem.replace(element, element2);
          }
        }
        return {col: transItem, tabKey: firTabKey, firColId: firColId};
      },
      checkExp(colFunExp) {
        var flag = false;
        this.relFieldsArr = [];
        if (colFunExp.trim() == "") {
          this.expErrorText = "表达式不能为空";
          this.expErrorDesc = "";
        } else {
          // 校验括号、中括号是否成对
          var midLBracketSize = (colFunExp.match(/\[/g) || []).length,
            midRBracketSize = (colFunExp.match(/\]/g) || []).length,
            lBracketSize = (colFunExp.match(/\(/g) || []).length,
            rBracketSize = (colFunExp.match(/\)/g) || []).length;
          if (
            midLBracketSize >= 0 &&
            midRBracketSize >= 0 &&
            midRBracketSize == midLBracketSize &&
            lBracketSize == rBracketSize
          ) {
            flag = true;
          } else {
            this.expErrorText = "括号数量不匹配，请检查";
            this.expErrorDesc = "";
          }
          if (flag) {
            //检查表达式
            var str = colFunExp;

            // 检查函数
            var funcExpRes = this.checkFuncExp(str);
            flag = funcExpRes.flag;
            // 检查加减乘除左右算式是否合法
            if (!flag) {
              // this.expErrorText = "字段请放在[]内";
              this.expErrorText = funcExpRes.errorInfo;
              this.expErrorDesc = "";
            } else {
              //检查[]内的字段是否是字段设置中选择的
              let fieldsArr = str.match(/\[(.+?)\]/g) || [];
              for (let index = 0; index < fieldsArr.length; index++) {
                const item1 = fieldsArr[index].trim();
                var fieldName = item1.substring(1, item1.length - 1);
                // 检查colFunExp
                let fieldRes = this.allFileds.filter(item => {
                  return `${item.tab_alias}.${item.col_id}` == fieldName;
                });
                if (fieldRes.length == 0) {
                  flag = false;
                  this.expErrorText = "字段名称不匹配";
                  this.expErrorDesc = "";
                  break;
                } else if (
                  !["number", "char"].includes(
                    fieldMatch(fieldRes[0].col_raw_type, this.fieldTypeList)
                  )
                ) {
                  //char和number类型以外的字段不允许出现
                  flag = false;
                  this.expErrorText = "字段类型不匹配";
                  this.expErrorDesc = "";
                  break;
                } else {
                  this.relFieldsArr.push(objDeepCopy(fieldRes[0]));
                }
              }
            }
          }
        }
        return flag;
      },
      saveComputedField() {
        var flag = true;
        var res = {
          isEdit: this.editFieldIdx > -1 ? true : false,
          fieldItem: {},
          isValid: false
        };
        this.$refs["ruleForm"].validate(valid => {
          if (valid) {
            this.inputValidFlag = true;
          } else {
            this.inputValidFlag = false;
            flag = false;
          }
        });
        if(!flag){
          return;
        }
        // 去掉[]前后的空字符串
        this.content = this.content.replace(/\s*\]\s*/g, "]");
        this.content = this.content.replace(/\s*\[\s*/g, "[");
        this.content = (this.content || "").trim();
        if (this.content.trim() == "") {
          this.expErrorText = "表达式不能为空";
          this.expErrorDesc = "";
          res.isValid = false;
          return res;
        }
        var col_fun_exp_desc = this.content;
        col_fun_exp_desc = col_fun_exp_desc
          .replace(/%E2%80%8B/g, "")
          .replace(/%20%20%20%20/g, ""); //替换掉所有的换行和制表位
        var transRes = this.colFunExpTrans(col_fun_exp_desc);
        if (transRes.firColId.trim() == "") {
          //如果都没有拖入字段，不能保存
          this.expErrorText = "表达式至少要使用一个字段参与计算";
          this.expErrorDesc = "";
          flag = false;
        }
        var flag2 = this.checkExp(transRes.col); //因为字段表达式里的字段名称可能包含特殊符号或者()[]，先进行翻译，再对col_fun_exp校验
        if (flag && flag2) {
          if (!this.checkExpField(transRes.col)) {
            this.expErrorText = "字段类型不匹配";
            this.expErrorDesc = "";
            flag = false;
          } else {
            this.expErrorText = "";
            this.expErrorDesc = "";
          }
        }
        // 检查是否用到非法类型的字段拿去运算 若字符串拿去做加减乘除
        if (flag && flag2) {
          var fieldItem = {
            af_id: "",
            element_id: "", //element.col_id
            element_name: "",
            element_type: "2",
            is_calcul: "1",
            tab_id: "",
            tab_chs_name: "",
            tab_col_id: "",
            col_type: "number",
            col_fun_exp: "",
            col_fun_exp_desc: "",
            is_trans_dim: "",
            dim_id: "",
            dim_name: "",
            dim_level_id: "",
            dim_level_name: "",
            order_id: "0",
            col_id: "",
            col_name: "",
            col_chs_name: "",
            create_time: "",
            create_user: "",
            create_user_name: "",
            show_type: "0",
            is_show: "1",
            show_format: "",
            source_format: "",
            iconClr: "",
            tab_alias: "",
            is_copy: "0",
            phy_tab_name: "",
            is_data_priv: 0
          };
          let funcName = this.content.substring(0,this.content.indexOf("("));
          if (this.groupFunc.includes(funcName)) {
            fieldItem.is_calcul = "2";  //如果是聚合函数类型为2
          }
          fieldItem.element_name = (this.ruleForm.name || "").trim();
          fieldItem.col_fun_exp_desc = col_fun_exp_desc;
          fieldItem.col_fun_exp = transRes.col;
          // 校验计算字段表达式是否重复
          if (this.checkCpFieldExpDup(fieldItem, this.editFieldIdx)) {
            this.expErrorText = "计算字段表达式不允许重复，请进行修改";
            this.expErrorDesc = "";
            return;
          }

          let tabInfo1 = this.allFieldsMap.get(transRes.tabKey) || [];
          fieldItem.tab_id = tabInfo1.length > 0 ? tabInfo1[0].tab_id : "";
          fieldItem.iconClr = tabInfo1.length > 0 ? tabInfo1[0].iconClr : "";
          fieldItem.tab_col_id = transRes.firColId;
          fieldItem.col_id = transRes.firColId; //col_id 补上 待测试
         
          res.fieldItem = objDeepCopy(fieldItem);

          var that = this;
          var fields = [fieldItem].concat(this.relFieldsArr);
          fields[0]["col_name"] = fields[0].element_name;
          /* if(this.relFieldsArr.length === 1 && this.relFieldsArr[0].col_type === 'dat') { //网关暂不支持计算字段时间格式
            fields[0]["dgw_fun_param"] = this.relFieldsArr[0].dgw_fun_param;
            fields[0]["dgw_function"] = this.relFieldsArr[0].dgw_function;
          } */
          if (this.sendRequestFlag) {
            //是否已经发送校验请求
            return;
          }
          this.sendRequestFlag = true;
          this.useOneTabFlag = this.ifUseOneTab(
            fieldItem,
            transRes.tabKey
          );
          if (this.useOneTabFlag) {
            this.curUseTab = transRes.tabKey;
          } else {
            this.curUseTab = "";
          }
          this.preparePreviewParam(fields)
            .then(response => {
              if (response.status === 200 && response.data.respResult == 1) {
                let calcParam = fields[0];
                if(fields.length>1){
                  calcParam.related_fields = [];
                  for(let i=1;i<fields.length;i++) {
                    let {is_calcul,tab_id,col_id,tab_alias} = fields[i];
                    let res = {is_calcul,tab_id,col_id,tab_alias};
                    calcParam.related_fields.push(res);
                  }
                }
                calcParam.af_id = this.datasetDetail.af_id;
                this.$emit('cpfieldAddSuccess',calcParam);
              }else {
                 that.expErrorText = "表达式校验失败";
              }
            })
            .catch(error => {
              res.isValid = false;
              that.expErrorText = "表达式校验请求失败";
              this.expErrorDesc = "";
            })
            .finally(() => {
              this.sendRequestFlag = false;
            });
        } else {
          res.isValid = false;
        }
      },
      getNearestChar(line) {
        var lineRtrim = line.replace(/(\s*$)/g, ""); //右边去空格
        return line.charAt(lineRtrim.length - 1);
      },
      checkExpValid(str, patt, leftArr, rightArr) {
        var flag = true;
        var result;
        // let patt = /[\+\-\*\/]/g;
        while ((result = patt.exec(str)) != null && flag) {
          //检查+-*/前后第一个非空字符只能是中小括号
          let left = str.substring(0, result.index);
          left = left.trim();
          let right = str.substring(result.index + 1);
          right = right.trim();
          let ltLastChar = left.substring(left.length - 1),
            rtFirstChar = right.substring(0, 1);
          if (
            (left != "" && leftArr.length > 0 && !leftArr.includes(ltLastChar)) ||
            (right != "" &&
              rightArr.length > 0 &&
              !rightArr.includes(rtFirstChar))
          ) {
            flag = false;
          }
        }
        return flag;
      },
      updateHintPanelPos() {
        var cursorObj = document.getElementsByClassName("CodeMirror-cursor")[0];
        var cursorTop = parseInt(cursorObj.style.top);
        var cursorLeft = parseInt(cursorObj.style.left);
        var scr_t = document.getElementsByClassName("CodeMirror-vscrollbar")[0]
          .scrollTop;
        var scr_l = document.getElementsByClassName("CodeMirror-hscrollbar")[0]
          .scrollLeft;
        if (scr_t > cursorTop) {
          scr_t = cursorTop - 90;
        }
        if (scr_l > cursorLeft) {
          scr_l = cursorLeft - 200;
        }
        if (cursorTop > 190) {
          cursorTop -= 50;
        }
        if (cursorLeft > 500) {
          cursorLeft -= 200;
        }
        var top = cursorTop - scr_t + 72 + 16, //名称错误提示文字占位
          left = cursorLeft - scr_l + 67;
        this.suggestionStyle = {
          top: top + "px",
          left: left + "px"
        };
      },
      checkFuncExp(str) {
        var flag = true;
        var errorInfo = "";
        let funcArr = this.funcHintOptionOri.sort(function (x, y) {
          return y.label.localeCompare(x.label);
        });

        let str2 = str;
        str2 = str2.toLocaleLowerCase();
        const funcNameExp = /(abs|round|substr|sum)\(/g;

        var isHasFunc = false;
        for (let index = 0; index < funcArr.length; index++) {
          if (str2.indexOf(funcArr[index].label+'(') > -1) {
            isHasFunc = true;
            break;
          }
        }
        if (isHasFunc) {
          if (
            str.match(funcNameExp) == null ||
            (str.match(funcNameExp) != null &&
              str.match(funcNameExp).length != str2.match(funcNameExp).length)
          ) {
            //大小写不匹配
            flag = false;
            errorInfo = "函数名称必须为小写";
          }

          if (flag) {
            // 函数前面只能是 (\(|\+|\-|\*|\/)?\s*
            var positions = new Array();
            for (let index = 0; index < funcArr.length; index++) {
              const element = funcArr[index].label+'(';
              var pos = str.indexOf(element);

              while (pos > -1) {
                positions.push({
                  pos: pos,
                  labelLength: element.length - 1
                });
                pos = str.indexOf(element, pos + 1);
              }
            }

            for (let index = 0; index < positions.length; index++) {
              const substr = str.substring(0, positions[index].pos).trim();
              let lastChar = substr.substring(substr.length - 1);
              let start = positions[index].pos + positions[index].labelLength;
              let rtFirstChar = str.substring(start, start + 1);
              if (lastChar != "" && lastChar.match(/(\(|\+|\-|\*|\/)/g) == null) {
                flag = false;
                errorInfo = "函数名称前必须为运算符或(";
                break;
              }
              if (
                rtFirstChar == "" ||
                (rtFirstChar != "" && rtFirstChar != "(")
              ) {
                flag = false;
                errorInfo = "函数名称后必须紧跟括号";
                break;
              }
            }
          }
        }

        return {
          flag: flag,
          errorInfo: errorInfo
        };
      },
      preparePreviewParam(col_list, res) {
        // var item = {};
        let catalogId = "";
       
        // 数据集信息
        let entity_lists = this.datasetDetail.subject_info.tab_rel_list;
       
        let param = {
          anly_frame_info: {
            af_desc: this.datasetDetail.af_desc,
            af_id: "",
            af_id_list: [],
            af_name: this.datasetDetail.af_name,
            af_status: "1",
            af_status_desc: "",
            af_status_list: [],
            af_type: "",
            anly_subject_id: this.datasetDetail.anly_subject_id,
            anly_subject_name: "",
            anly_frame_disposes: [],
            anly_frame_elements: col_list,
            anly_frame_tab_infos: [],
            anly_frame_target_grps: [],
            catalogId: catalogId,
            conn_id: "",
            data_cycle: "",
            dispose_desc: "",
            dispose_type: "",
            dispose_type_list: [],
            frame_id: this.datasetDetail.frame_id,
            frame_id_list: [],
            frame_name: "",
            h_af_name: "",
            latest_date_time: "",
            orderBeans: [],
            page_count: 1,
            phy_chs_name: "",
            publish_time: "",
            publish_user: "",
            record_num_from: "",
            record_num_to: "",
            start: 0,
            storage_type: "",
            storage_type_list: [],
            sub_status: "",
            sub_status_desc: "",
            sub_target_object: "",
            subject_id: "",
            subject_id_list: [],
            subject_info: {
              af_name: "",
              bus_info: "",
              create_time: "",
              create_time_end: "",
              data_cycle: "",
              frame_id: "",
              frame_name: "",
              is_imp_type: "0",
              is_query_detail: "0",
              is_rule: "",
              key: "",
              max_record_num: "",
              min_record_num: "",
              oper_id: "",
              phy_tab_name: "",
              publish_time: "",
              publish_time_end: "",
              publish_user: "",
              rule_cond_type: "",
              subject_group: "",
              subject_id: "",
              subject_name: "",
              subject_status: "1",
              tab_chs_name: "",
              tab_rel_list: entity_lists,
              update_time: "",
              update_user: "",
              user_name: "",
              rule_group_list: []
            },
            subject_name: "",
            tab_chs_name: "",
            tab_id: "",
            update_time: "",
            update_time_end: "",
            update_user: ""
          }
        };

        var params = {
          begin_date: "",
          head_bean: {
            pageCount: 1,
            start: 1,
            user_id: window.sessionStorage.getItem("user_id")
          },
          is_need_log: 1,
          is_need_paging: 1,
          is_need_permission: 1,
          is_need_trans: 1,
          query_type: "1",
          where_bean: {},
          order_list: [],
          anly_frame_info: param.anly_frame_info
        };

      
        return service({
          maskOff: true,
          // url: this.dgwMsUrl + "/dataAnlyFrameQuery/queryAfPropertyData",
          url: this.renderEngine + "/dataAnlyFrameQuery/queryAfPropertyData",
          method: 'post',
          data: params,
          timeout: this.axiosTimeout
        });
      },
      // 根据参数过滤自动提示面板的字段
      filterHintField(neededFieldType = "number") {
        let filterFields = [];
        switch (neededFieldType) {
          case "number":
            filterFields = this.allFileds.filter(item => {
              let colType = item.col_raw_type;
              colType = (colType || "").toLocaleLowerCase();
              return (this.fieldTypeList[colType] || {}).elementType == "2";
            });

            break;
          case "string": //针对substring函数,应该列出整形和字符型
            filterFields = this.allFileds.filter(item => {
              let colType = item.col_raw_type;
              colType = (colType || "").toLocaleLowerCase();
              let fieldType = fieldMatch(colType, this.fieldTypeList);
              return fieldType == "number" || fieldType == "char";
            });
            break;
          default:
            break;
        }
        this.allRelFields = filterFields;
      },
      // 校验是否用了非法的字段（如运算时用了字符字段）
      checkExpField(colFunExp) {
        let flag = true;
        if (colFunExp.indexOf("substr") == -1) {
          //没有substr,则用到的字段必须全部是数值型字段
          flag = this.checkNumField(colFunExp);
        } else {
          let oriColFunExp = colFunExp;
          let fields1 = this.allFileds.filter(item => {
            let colType = item.col_raw_type;
            colType = (colType || "").toLocaleLowerCase();
            let fieldType = fieldMatch(colType, this.fieldTypeList);
            return fieldType == "number" || fieldType == "char";
          }); //可以放substr的字段
          for (let index = 0; index < fields1.length; index++) {
            const element = fields1[index];
            while (
              oriColFunExp.indexOf(
                `substr([${element.tab_alias}.${
                  element[this.SHOW_TYPE_ARR[element.show_type]]
                  }],`
              ) > -1
              ) {
              oriColFunExp = oriColFunExp.replace(
                `substr([${element.tab_alias}.${
                  element[this.SHOW_TYPE_ARR[element.show_type]]
                  }],`,
                "("
              );
            }
            if (oriColFunExp.indexOf("substr(") == -1) {
              break;
            }
          }
          flag = this.checkNumField(oriColFunExp);
        }
        return flag;
      },
      checkNumField(colFunExp) {
        let flag = true;
        //没有substr,则用到的字段必须全部是数值型字段
        for (let index = 0; index < this.allFileds.length; index++) {
          const element = this.allFileds[index];
          let fieldType = fieldMatch(element.col_raw_type || "", this.fieldTypeList);
          if (
            fieldType != "number" &&
            colFunExp.indexOf(
              `[${element.tab_alias}.${
                element[this.SHOW_TYPE_ARR[element.show_type]]
                }]`
            ) > -1
          ) {
            flag = false;
            break;
          }
        }
        return flag;
      },
      cmReset() {
        this.cmOptions.readOnly = false;
        this.activeIdx = -1;
      },
      selectExp(direction) {
        let scrollTop = 0;
        this.cmOptions.readOnly = true;
        if (this.allRelFields.length > 0 || this.funcHintOption.length > 0) {
          switch (direction) {
            case "up":
              if (this.activeIdx > 0) {
                this.activeIdx--;
                // scrollTop = document.querySelector(".suggestion-wrap ul").children[this.activeIdx].offsetTop;
                // document.querySelector(".suggestion-wrap .el-scrollbar__wrap").scrollTo(0, scrollTop);
              }
              break;
            case "down":
              if (this.activeIdx < this.allRelFields.length - 1 || this.activeIdx < this.funcHintOption.length - 1) {
                this.activeIdx++;
                scrollTop = document.querySelector(".suggestion-wrap ul").children[this.activeIdx].offsetTop;
                if (scrollTop > 116) {
                  // document.querySelector(".suggestion-wrap .el-scrollbar__wrap").scrollTo(0, (this.activeIdx - 4) * 29);
                }
              }
              break;
          }
        }

      },
      confirmExp() {
        if (this.isShowSuggestion) {
          if (this.curHintType == 1) {
            this.addField(this.allRelFields[this.activeIdx]);
          } else if (this.curHintType == 2) {
            this.addFunc(this.funcHintOption[this.activeIdx]);
          }
        }
        this.isShowSuggestion = false;
        this.cmOptions.readOnly = false;
      },
      deleteExp() {
        const cur = this.cmEditor.getCursor();
        const token1 = this.cmEditor.getTokenAt(cur);
        if (!token1.type && token1.string == "") {
          this.isShowSuggestion = false;
        }
        this.cmOptions.readOnly = false;
      }
    },
    watch: {
      funcFilterText(newVal) {
        newVal = newVal.trim().toLocaleLowerCase();
        if (newVal == "") {
          this.funcData = objDeepCopy(this.funcDataOri);
        } else {
          this.funcData = this.funcDataOri.filter(item => {
            return item.label.toLocaleLowerCase().indexOf(newVal) > -1;
          });
        }
      },
    },
    computed: {
      allFileds() {
        //剔除计算字段和复制字段
        let data = this.allData.filter(item => {
          return (
            item.is_copy != "1" && item.is_calcul != "1" && !item.from_compt
          )
        })
        // 时间格式保留第一个
        let arry = [];
        let res = [];
        for(let i=0; i<data.length; i++) {
          if(data[i].col_type === "dat") {
            if(arry.includes(data[i].element_id)){
              continue;
            }else{
              arry.push(data[i].element_id);
              res.push(data[i])
            }
          } else {
            res.push(data[i])
          }
        }
        return res;
      },    
      ...mapState({
        allFieldsMap: state => state.DataSetDesign.allFieldsMap,
        dgwMsUrl: state => state.dgwMsUrl,
        renderEngine: state => state.renderEngine,
        axiosTimeout: state => state.commonProperties.axiosTimeout,
        pageCache: state => state.HomeBody.pageCache
      })
    },
    mounted() {
      this.funcData = objDeepCopy(this.funcDataOri);
      document.addEventListener("click", this.windowClickHandle);
      this.cmOptions.extraKeys = {
        "Up": () => {
          this.selectExp('up');
        },
        "Down": () => {
          this.selectExp('down')
        }
      }
    },
    beforeDestroy() {
      document.removeEventListener("click", this.windowClickHandle);
    }
  };
</script>

<style lang="scss" scoped>
  $main-color: #409eff; //主色调
  $bd-clr1: #dcdfe6;
  .field-tip {
    // color: #c0c4cc;
    margin-bottom: 10px;
    // padding-left: 65px;
    font-size: 12px;
    // margin-top: 16px;
  }

  .computed-field-wrap {
    position: relative;
    height: 312px;

    .left-wrap {
      padding-right: 20px;
      border-right: 1px dashed $bd-clr1;

      /deep/ .el-form-item__error {
        padding: 0px;
        height: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
        white-space: nowrap;
        width: 100%;
      }

      /deep/ .el-popover.err-pop-wrap {
        width: 100%;
      }
    }

    .right-wrap {
      /deep/ .main-title {
        margin-bottom: 10px;
      }

      .func-item {
        width: 100%;
        border-bottom: 1px solid $bd-clr1;
        padding: 10px 0;
        cursor: pointer;

        &:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        &:first-child {
          padding-top: 0;
        }

        .func-item-tit {
          color: $main-color;
        }

        & > div {
          width: 100%;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
        }
      }

      /deep/ .el-scrollbar__wrap {
        overflow-x: hidden;
      }
    }

    .exp-wrap {
      position: relative;
      width: 100%;
      border: 1px solid $bd-clr1;
      height: 216px;

      &.error-exp {
        border: 1px solid #f56c6c;
      }

      .content:empty::before {
        content: attr(placeholder);
        font-size: 14px;
        color: #ccc;
        line-height: 21px;
        padding-top: 10px;
      }
    }
  }

  .computed-form {
    /deep/ .el-form-item:first-child {
      // margin-bottom: 0;
    }
  }

  .codesql {
    width: 100%;
    height: 100%;
    // overflow-y: scroll;
    /deep/ .CodeMirror.cm-s-default {
      height: 214px;

      .cm-m-sql {
        color: #606266 !important;
      }

      .CodeMirror-line {
        line-height: 20px;
      }
    }
  }

  .suggestion-wrap {
    position: absolute;
    height: 150px;
    width: 300px;
    // width: 150px;
    // overflow: hidden;
    z-index: 1000;
    border: 1px solid $bd-clr1;
    background: #fff;

    ul {
      padding: 0 10px;
      width: 100%;
    }

    li {
      cursor: pointer;
      padding: 5px 0;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }

    li:hover,
    li.selected {
      color: $main-color;
    }

    /deep/ .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }

  .err-pop-wrap {
    width: 100%;
    height: 100px;
    overflow: hidden;
    word-break: break-all;
    line-height: 23px;
    font-size: 12px;

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }

  .err-detail-icon {
    // color: $main-color;
    cursor: pointer;
    margin-left: 10px;
  }
</style>
<style>
  .el-popover.err-pop-wrap .el-scrollbar__wrap {
    overflow-x: hidden;
    padding-right: 10px;
  }
</style>
