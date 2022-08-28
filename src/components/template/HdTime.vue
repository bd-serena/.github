<template>
  <div
    style="width:100%;height:100%;position:relative"
    :style="{'font-size':vscompt.comptAttrs.extendSetting.fontSize+'px','color':vscompt.comptAttrs.extendSetting.color}"
  >
    <div
      style="display: inline-block;margin-right:20px;"
      v-if="vscompt.comptAttrs.extendSetting.isIcon"
    >
      <span class="icon-A10192_time"></span>
    </div>
    <div
      style="display: inline-block;margin-right:20px;"
      v-if="vscompt.comptAttrs.extendSetting.isYear"
    >{{this.getDate()}}</div>
    <div
      style="display: inline-block;margin-right:20px;"
      v-if="vscompt.comptAttrs.extendSetting.isWeek"
    >{{this.getWeek()}}</div>
    <div
      style="display: inline-block;margin-right:20px;"
      v-if="vscompt.comptAttrs.extendSetting.isTime"
    >{{this.time}}</div>
  </div>
</template>

<script>
export default {
  props: ["vscompt"],
  data() {
    return {
      time: ""
    };
  },
  mounted() {
    this.getDate();
    this.getWeek();
    this.getTime();
    setInterval(() => {
      this.getTime();
    }, 1000);
  },
  watch: {
    "vscompt.comptAttrs.extendSetting.isYear": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.vscompt.styleAttrs[0].children[2].isShow = true;

          this.vscompt.styleAttrs[0].children[2].value = 0;
          this.vscompt.comptAttrs.extendSetting.yearWay = 0;
        } else {
          this.vscompt.styleAttrs[0].children[2].isShow = false;
          this.vscompt.styleAttrs[0].children[2].value = "";
          //this.vscompt.styleAttrs[0].children[2].options = [];
        }
      }
    },
    "vscompt.comptAttrs.extendSetting.isTime": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.vscompt.styleAttrs[0].children[5].isShow = true;
          this.vscompt.styleAttrs[0].children[5].value = 0;
          this.vscompt.comptAttrs.extendSetting.timeWay = 0;
        } else {
          this.vscompt.styleAttrs[0].children[5].isShow = false;
          this.vscompt.styleAttrs[0].children[5].value = "";
        }
      }
    },
    "vscompt.comptAttrs.extendSetting.yearWay": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        this.getDate();
      }
    },
    "vscompt.comptAttrs.extendSetting.timeWay": {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        this.getTime();
      }
    }
  },
  computed: {},
  methods: {
    getDate() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var days = date.getDate();
      month = month < 10 ? "0" + month : month;
      days = days < 10 ? "0" + days : days;
      let type = this.vscompt.comptAttrs.extendSetting.yearWay;
      if (type == 0) {
        return year + "-" + month + "-" + days;
      } else if (type == 1) {
        return year + "/" + month + "/" + days;
      } else {
        return year + "年" + month + "月" + days + "日";
      }
    },
    getWeek() {
      var date = new Date();
      let week = date.getDay();
      if (week == 0) {
        return "星期天";
      } else if (week == 1) {
        return "星期一";
      } else if (week == 2) {
        return "星期二";
      } else if (week == 3) {
        return "星期三";
      } else if (week == 4) {
        return "星期四";
      } else if (week == 5) {
        return "星期五";
      } else {
        return "星期六";
      }
    },
    getTime() {
      var date = new Date();
      var h = date.getHours();
      var m = String(date.getMinutes()).padStart(2, "0");
      var d = String(date.getSeconds()).padStart(2, "0");
      let type = this.vscompt.comptAttrs.extendSetting.timeWay;
      if (type == 0) {
        this.time = h + ":" + m + ":" + d;
      } else {
        this.time = h + ":" + m;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
/deep/.time {
  display: inline-block;
}
</style>