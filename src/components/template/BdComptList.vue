<template>
<div style="width:100%;height:100%;position:relative;">
    <el-radio-group style="width: 100%;" v-model="typeId" @change="changeHandle">
        <div v-if="comptType==='DvDecoration'">
                <div :class="['compt-list', item.label === 'decoration-7' ? '' : 'need-scale']" v-for="item in comptList">
                    <div class="compt-list-block">
                        <dv-decoration v-if="show" :vscompt="item"></dv-decoration>
                    </div>
                    <el-radio :label="item.value">{{item.label}}</el-radio>
                </div>
        </div>
        <div v-else-if="comptType==='DvBorder'">
                <div :class="['compt-list', 'need-scale']" v-for="item in comptList">
                    <div class="compt-list-block">
                        <dv-border v-if="show" :vscompt="item"></dv-border>
                    </div>
                    <el-radio :label="item.value">{{item.label}}</el-radio>
                </div>
        </div>
    </el-radio-group>
</div>
</template>

<script>
import DvDecoration from "../template/DvDecoration.vue"
import DvBorder from "../template/DvBorder.vue"

export default {
    props: ["comptType","list","activeId"],
    components:{
        DvDecoration,
        DvBorder
    },
    data() {
        return {
            show:false,
            comptList:[],
            typeId:''
        };
    },
    created() {
        this.show=false;
        this.typeId = this.activeId;
        this.list.forEach(val=>{
            let id = val.value;
            let item = {comptAttrs:{
                extendSetting:{
                    displayId:id
                }
            },
            label:val.label,
            value:val.value
            }
            this.comptList.push(item);
        })
    },
    mounted() {
        setTimeout(() => {
            this.show=true;
        },100);
    },
    watch: {
        activeId(nv, ov) {
            this.typeId = nv
        }
    },
    computed: {

    },
    methods: {
        changeHandle(val){
            this.$emit('changeHandle',val)
        }
    }
};
</script>

<style lang="scss" scoped>
.compt-list{
    display:inline-block;
    text-align: left;
    padding: 0 5px;
    width: 50%;
    .el-radio{
        color:#afc0d0;
    }
    &.need-scale {
        height: 121px;
        position: relative;
        .compt-list-block {
            transform: scale(0.3) translate(-550px,-365px);
            width: 470px;
            height: 300px;
            position: absolute;
            border-radius: 15px;
        }
        .el-radio{
            position: absolute;
            bottom: 5px;
        }
    }
}
.compt-list-block{
    // width: 100%;
    width: 137px;
    height: 90px;
    background: #0a2c4c;
    overflow: hidden;
    margin-top: 10px;
    margin-bottom: 5px;
    border-radius: 5px;
    border: 1px solid transparent;
}
</style>
