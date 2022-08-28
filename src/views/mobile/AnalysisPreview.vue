<template>
    <el-container>
        <el-main style="padding: 0; height: calc(100% - 50px)">
            <PagePreView />
        </el-main>
        <el-footer height="50px">
            <Footer :key="$route.fullPath" />
        </el-footer>
    </el-container>
</template>

<script>
import Footer from './Footer'
import PagePreView from './../PagePreView'
export default {
    components: {
      Footer,
      PagePreView
    }
}
</script>
