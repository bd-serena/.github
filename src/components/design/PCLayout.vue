<template>
  <div class="layout-wrap" :key="portal.layoutType">
    <!-- 顶部导航 -->
    <el-container v-if="portal.layoutType === '3'">
        <el-header height="40px">
            <slot name="header"></slot>
            <div class="home-page" @click="goHome">
                <span class="icon-A10394_home"></span>
            </div>
            <slot name="menu"></slot>
        </el-header>
        <el-main>
            <slot name="main"></slot>
        </el-main>
    </el-container>
    <!-- 左导航 -->
    <el-container v-else-if="portal.layoutType === '2'">
        <el-aside width="160px">
            <div class="header-wrap" style="height:50px;width:100%;padding-left: 16px; padding-top:10px;">
                <slot name="header"></slot>
            </div>
            <div class="home-page" style="height:30px;width:100%;line-height:30px;margin-left:0;text-align: center; position:relative; z-index:0" @click="goHome">
                <span class="icon-A10394_home"></span>
            </div>
            <div style="height:100%; margin-top:-80px; padding-top:70px; float:left; width:100%;">
                <slot name="left"></slot>
            </div>
        </el-aside>
        <el-main>
            <slot name="main"></slot>
        </el-main>
    </el-container>
    <!-- 双导航 -->
    <el-container v-else>
        <el-header height="40px">
            <slot name="header"></slot>
            <div class="home-page" @click="goHome">
                <span class="icon-A10394_home"></span>
            </div>
            <slot name="menu2"></slot>
        </el-header>
            <el-container>
                <el-aside width="160px">
                    <slot name="left2"></slot>
                </el-aside>
                <el-main>
                    <slot name="main"></slot>
                </el-main>
            </el-container>
    </el-container>
  </div>
</template>
<script>
import { mapState } from "vuex";
import PortalMixin from '../template/mixins/PortalMixin'
export default {
    props: {
        layoutType: {
            type: String,
            default: 'top'
        }
    },
    mixins: [PortalMixin],
    data() {
        return {

        };
    },
    methods: {
        goHome() {
            this.activeHomePage(this.homePage);
        }
    },
    mounted() {

    },
    computed: {
        ...mapState({
            portal: state => state.DataPortal.portal,
            homePage: state => state.DataPortal.homePage
        })
    }
};
</script>

<style lang="scss" scoped>
.home-page {
    cursor: pointer;
    float: left;
    font-size: 16px;
    color: #afc0d0;
    height: 100%;
    line-height: 39px;
    margin-left: 20px;
    &:hover{
        color: #409eff;
    }
    &.actived{
        color: #409eff;
    }
}

.layout-wrap{
    height: 100%;
}
.el-header{
    background-color: #2f5377;
    border-bottom: 1px solid #0a2b4c;
}
.el-aside{
    background-color: #2f5377;
    border-right: 1px solid #0a2b4c;
}
.el-main{
    padding:0;
    overflow: hidden;
}
</style>
