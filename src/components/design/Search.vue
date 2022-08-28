<template>
    <div>
        <el-form>
            <el-form-item label="选择服务" :label-width="formLabelWidth">
                <el-select v-model="serviceUrl" placeholder="请选择服务">
                    <el-option label="post" value="http://10.1.2.111:8088/public/apiTest"></el-option>
                    <el-option label="get" value="http://10.1.2.111:8088/public/tableData"></el-option>
                </el-select>
                <span class="url-span">服务地址：<span>{{serviceUrl}}</span></span>
            </el-form-item>
            <el-form-item label="绑定组件" :label-width="formLabelWidth">
                <el-select v-model="childCompt" placeholder="请绑定组件">
                    <el-option v-for="comp in dependCompt" :key="comp.comptSort" :label="comp.type" :value="comp.comptSort"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="hideSearch">取 消</el-button>
            <el-button type="primary" @click="save">确 定</el-button>
        </div>
    </div>
</template>

<script>
import {mapState,mapGetters,mapMutations,mapActions} from 'vuex';
export default {
    data(){
        return{
            formLabelWidth: '120px',
            serviceUrl:'',
            childCompt:''
        }
    },
    computed:{
        ...mapState({
            s_edcuiCompts:state=>state.compt.s_edcuiCompts
        }),
        ...mapGetters({
            activedCompt:'compt/getActivedCompt'
        }),
        dependCompt(){
            return this.s_edcuiCompts.filter((val)=>val.jixi==null)
        }
    },
    methods:{
        hideSearch(){
            this.$emit('hideSearch');
        },
        save(){
            this.activedCompt.childCompt=this.childCompt;
            this.activedCompt.serviceUrl=this.serviceUrl;
            this.$emit('hideSearch')
        }
    }
}
</script>

<style scoped>
    .url-span {
        marign-left : 20px;
    }

    .url-span span {
        color : #9cdcfe;
    }

    .dialog-footer{
        text-align:right;
    }
</style>



