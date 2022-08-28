<template>
<div style="height:100%">
        <el-form v-if="compt.type == 'form'" :inline="compt.inline">
            <el-form-item v-for="item in compt.formItems" :key="item.type"  :label="item.label">
                <el-input :placeholder="item.placeholder" v-if="item.type=='input'" v-model="item.m_value"></el-input>
                <el-select :placeholder="item.placeholder" v-else-if="item.type=='select'" v-model="item.m_value">
                    <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
                </el-select>
                <el-button :type="item.btnType" v-else-if="item.type=='button'">{{ item.label }}</el-button>
            </el-form-item>
        </el-form>
        <el-table v-else-if="compt.type == 'table'" v-bind="compt.tableattrs" height="100%" size="mini">
            <el-table-column 
            v-for="col in compt.columns" 
            v-bind:key="col.prop"
            v-bind="col">
            </el-table-column>  
        </el-table>
         <el-tree v-else-if="compt.type == 'tree'" :data="compt.data" :props="compt.props"></el-tree>
        <el-form v-else-if="compt.type == 'input'" :label-width="compt.labelWidth">
            <el-form-item :label="compt.label">
                <el-input :placeholder="compt.placeholder" v-model="compt.m_value"></el-input>
            </el-form-item>
        </el-form>
        <el-form v-else-if="compt.type=='select'" :label-width="compt.labelWidth">
            <el-form-item :label="compt.label">
                <el-select :placeholder="compt.placeholder" v-model="compt.m_value" style="width:100%">
                    <el-option v-for="option in compt.options" :key="option.value" :label="option.label" :value="option.value"></el-option>
                </el-select>
            </el-form-item>
        </el-form>
        <el-button :type="compt.btnType" v-else-if="compt.type=='button'">{{ compt.label }}</el-button>
</div>
</template>
<script>
export default {
    components:{
    },
    props:{
        isDesign:Boolean,
        edcuiCompts:Array,
        compt:Object
    },
    data() {
        return{
            inputVal:''
        }
    },
    methods:{
       
    }
}
</script>
<style>

</style>


