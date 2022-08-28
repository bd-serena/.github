<template>
    <div>
            <vue-ruler-tool
            :content-layout="{left:200,top:100}"
            :is-scale-revise="true"
            :preset-line="presetLine"
            >
                <div class="test"></div>
            </vue-ruler-tool>
        </div>
</template>

<script>
import VueRulerTool from './vue-ruler-tool.vue'
export default {
    data(){
        return{
            //  presetLine: [{ type: 'l', site: 100 }, { type: 'v', site: 200 }]
            presetLine:[]
        }
    },
    components:{
        VueRulerTool
    }
}
</script>
