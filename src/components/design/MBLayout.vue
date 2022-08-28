<template>
    <div :class="[isPcTeminal?'mobile-wrap':'self-adaption-wrap',secondList.length>0?'has-menu':'']">
        <van-cell class="home-title" :title="title" center>
            <template #icon>
                <van-icon v-if="!isPcTeminal" class="back-icon" name="arrow-left" @click="$router.go(-1)" />
            </template>
        </van-cell>
        <van-tabs @click="onClick" v-model="secActive" color="#409eff" title-active-color="#409eff" v-if="secondList.length>0">
          <van-tab v-for="item in secondList" :name="item.privId" :key="item.privId" :title="item.privName">
          </van-tab>
        </van-tabs>
        <div class="cont-part">
            <ProtalView ref="view"></ProtalView>
        </div>
        <van-tabbar v-model="firActive" @change="onChange">
            <van-tabbar-item v-for="item in portal.portalPrivList" :name="item.privId" :icon="!!item.showIcon ? (!!item.icon ? item.icon : 'A10394_home') : ''" icon-prefix="icon" :key="item.privId">{{item.privName}}</van-tabbar-item>
        </van-tabbar>
    </div>
</template>
<script>
import { mapState } from "vuex";
import ProtalView from "../../components/design/PortalView";


export default {
    props: {

    },
    components: {
        ProtalView
    },
    data() {
        return {
            firActive: '',
            secActive: '',
            secondList: [],
            title: ''
        };
    },
    methods: {
        onClick(name) {
            let page = {};
            for(let i=0; i<this.secondList.length; i++) {
                let item = this.secondList[i];
                if(item.privId === name) {
                    page = item;
                    break;
                }
            }
            this.title = page.privName;
            this.$refs.view.openPage(page);
        },
        onChange(name) {
            let menu = {};
            for(let i=0; i<this.portal.portalPrivList.length; i++) {
                let item = this.portal.portalPrivList[i];
                if(item.privId === name) {
                    menu = item;
                    break;
                }
            }
            this.title = menu.privName;
            this.$refs.view.openPage(menu);
            this.setSeconds(menu.children || []);
        },
        setSeconds(list) {
            this.secondList = list;
            if(list.length>0) {
                let page = list[0];
                this.title = page.privName;
                this.secActive = page.privId;
                this.$refs.view.openPage(page);
            }
        },
        pageActive(id){
            let obj = {fir: null, sec: null};
            for(let i=0;i<this.portal.portalPrivList.length;i++) {
                let fir = this.portal.portalPrivList[i];
                if(fir.privId === id) {
                    obj.fir = fir;
                    break;
                }
                if(fir.children && fir.children.length>0) {
                    for(let j=0; j<fir.children.length; j++) {
                        let sec = fir.children[j];
                        if(sec.privId === id) {
                            obj.sec = sec;
                            obj.fir = fir;
                            this.secondList = fir.children;
                            break;
                        }
                    }
                }
            }
            if(obj.fir) {
                this.firActive = obj.fir.privId;
                this.title = obj.fir.privName;
            }
            if(obj.sec) {
                this.secActive = obj.sec.privId;
                this.title = obj.sec.privName;
            }
        }
    },
    watch: {
        homePage: {
        immediate: true,
        handler(newVal, oldVal) {
            this.pageActive(newVal.privId);
        },
        },
    },
    mounted() {

    },
    computed: {
        ...mapState({
            portal: state => state.DataPortal.portal,
            homePage: state => state.DataPortal.homePage,
            isPcTeminal: state => state.isPcTeminal
        })
    }
};
</script>

<style lang="scss" scoped>
.mobile-wrap{
    width:400px;
    height:600px;
    border: 1px solid red;
    margin: auto;
    position: relative;
    transform: translateY(-50%);
    top: 50%;
    background-color: #fff;
    .van-tabbar-item--active{
        color:#409eff;
    }
    .cont-part{
        height: calc(100% - 94px);
    }
}

.has-menu{
    .cont-part{
        height: calc(100% - 138px);
    }
}

.self-adaption-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #fff;
    .van-tabbar-item--active{
        color:#409eff;
    }
}

.home-title{
    text-align: center;
    font-size: 16px;
    font-weight: bold;
}

.cont-part{
    height: calc(100% - 138px);
}
/deep/ .back-icon {
    &:hover {
        color:#409eff;
    }
}
</style>
