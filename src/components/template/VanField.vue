<template>
    <div>
        <div class="van-input">
            <van-field  v-model="value" placeholder="请输入用户名" />
        </div>
    </div>
</template>

<script>
import {dateToString} from '../../utils/DateUtil';
export default {
    props:['vscompt'],
    data(){
        return{
            value:''
        }
    },
    mounted(){
       
    },
    methods:{
        
    }
}
</script>

<style lang="scss" scoped>
.van-input{
    .van-cell{
        padding:5px 10px;
        line-height: 20px;
        border:1px solid #ebeef5;
        border-radius: 5px;
    }
}
</style>

