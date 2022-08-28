<template>
    <div class="setting-wrap">
        <van-cell title="设置" />
        <van-cell :title="`账号:  ${userInfo.userName} / ${userInfo.userId}`" />
        <van-cell-group title="安全设置">
            <van-cell title="修改密码" is-link to="EditPassword" />
        </van-cell-group>
        <van-cell-group title="关于">
            <van-cell title="软件版本" value="v1.0" />
        </van-cell-group>
        <van-cell title="退出登录" style="text-align: center; margin-top: 20px;" @click="doLogout" />
        <Footer />
    </div>
</template>

<script>
import LogOutMixins from '../../utils/LogOutMixins';
import Footer from './Footer'
export default {
    mixins: [LogOutMixins],
    components: {
        Footer
    },
    data() {
        return {
            userInfo: {}
        } 
    },
    computed: {
        
    },
    activated() {
        this.userInfo = (JSON.parse(window.sessionStorage.getItem("X-NG-UserInfo")) || {}).userInfo || {};
    }
}
</script>

<style scoped lang="scss">
.setting-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #f7f8fa;
    & > div:first-child {
        text-align: center;
    }
}
</style>