<template>
    <div class="edit-pwd-wrap">
        <van-nav-bar title="修改密码" left-arrow @click-left="returnPrevPage" style="margin-bottom: 20px;" />
        <bd-div
            :key="refreshKey"
            type="bd-editPwd-pc"
            :terminal-type="Number(1)"
            :visible.sync="dialogVisible"
        />
    </div>
</template>
<script>
export default {
    data () {
        return {
            dialogVisible: false,
            refreshKey: 0
        }
    },
    methods: {
        returnPrevPage() {
            this.$router.go(-1);
        }
    },
    activated() {
        this.refreshKey++;
        this.dialogVisible = true;
    },
    watch: {
        dialogVisible(newVal) {
            if (!newVal) {
                this.returnPrevPage();
            }
        }
    }
}
</script>

<style scoped lang="scss">
.edit-pwd-wrap {
    width: 100%;
    height: 100%;
    background-color: #f7f8fa;
}
</style>

