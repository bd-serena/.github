<template>
  <div class="cont-wrap">
    <iframe
      :class="{ 'has-footer': portal.showFooter === '1' }"
      v-if="load"
      width="100%"
      height="100%"
      scrolling="no"
      :src="pagePath"
      frameborder="0"
    ></iframe>
    <div v-if="!load">暂无页面</div>
    <footer v-if="portal.showFooter === '1'">{{ portal.footer }}</footer>
  </div>
</template>

<style lang="sass" scoped>

</style>

<script>
import PageView from "../../views/PagePreView";
import { mapActions, mapState } from "vuex";
import PortalMixin from '../template/mixins/PortalMixin'
export default {
  name: "PortalView",
  components: {
    PageView,
  },
  mixins: [PortalMixin],
  data() {
    return {
      load: false,
      pagePath: "",
    };
  },
  computed: {
    ...mapState({
      portal: (state) => state.DataPortal.portal,
      homePage: (state) => state.DataPortal.homePage,
      pageCache: state => state.DataPortal.pageCache
    }),
  },
  watch: {

  },
  methods: {
    ...mapActions({
      queryPageInfoById: "HomeBody/queryPageInfoById",
    })
  },
  mounted() {

  },
};
</script>

<style lang="scss" scoped>
.cont-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  footer {
    position: absolute;
    width: 100%;
    height: 30px;
    bottom: 0;
    text-align: center;
    color: #606266;
    font-size: 12px;
    background: #c0c4cc;
    line-height: 30px;
  }
  .has-footer {
    padding-bottom: 30px;
  }
}
</style>
