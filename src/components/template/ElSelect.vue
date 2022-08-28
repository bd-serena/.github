<template>
    <el-form size="mini" :label-width="vscompt.labelWidth">
            <el-form-item :label="vscompt.label" :title="vscompt.label" :required="vscompt.isSetRequired">
                <el-select :placeholder="vscompt.placeholder" v-model="vscompt.m_value" style="width:140px" :title="vscompt.m_value">
                    <el-option v-for="option in vscompt.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
</template>

<script>
export default {
    props:['vscompt'],
    data(){
        return{
           optData:null,
           param:null
        }
    },
    mounted(){
        // this.optData=this.option.data;
        // this.param=this.option.param;
    },
    methods:{
        
    }
}
</script>

