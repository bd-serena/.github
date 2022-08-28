import { mapActions, mapGetters } from "vuex";
export default {
  methods: {
    updateCompt(compt,pageType) { //更新组件样式
      let compType = compt.type;
      let param={
        compType,
        classTypeId: pageType
      }
      compt.updated = true;
      this.qryStyleAttrs(param).then(resp=>{
        if (resp.status == 200 && resp.data.respResult == "1") {
          let newCompt = resp.data.respData;
          let newStyle = newCompt.styleAttrs;
          let oldStyle = compt.styleAttrs;
          /* let newSetting = newCompt.comptAttrs.extendSetting;
          let oldSetting = compt.comptAttrs.extendSetting;
          for(let key in oldSetting) {
            if(key in newSetting) {
              newSetting[key] = oldSetting[key]
            }
          } */
          for(let {enName,children} of oldStyle) {
            for(let item of newStyle) {
              if(item.enName === enName){ //匹配到了
                this.updateStyleAttr(children, item.children);
                break;
              }
            }
          }
          this.$set(compt,'styleAttrs',newCompt.styleAttrs);
        }
      }).catch(err=>{})
    },
    updateStyleAttr(oldList,newList) {  //更新styleattr
      for(let i=0; i<oldList.length; i++) {
        for(let j=0; j<newList.length; j++) {
          if(oldList[i].enName === newList[j].enName) {
            newList[j] = oldList[i];
            break;
          }
        }
      }
    },
    clearUpdated() {  //清空所有组件的updated属性
      this.allCompts.forEach(val=>{
        delete(val.updated)
      })
    },
    setBgStyle(val) {
      let bgStyle = `background:${val.comptAttrs.extendSetting['backgroundColor']||val.comptAttrs.extendSetting['commonBackgroundColor']||val.comptAttrs.extendSetting['BgColor']||''}`
      if (this.pageCache.classTypeId === '1005') {
        const bgCompt = val.type === 'HdTitle' || val.type === 'ElDatagrid' || val.type === 'CrossTable' || val.type === 'VeWordCloud' || val.type === 'PcKpiBlock' || val.type === 'HdVerticalLine' || val.type === 'HdHorizontalLine' || val.type === 'ElBreadCrumb' || val.type === 'ElCarousel' || val.type === 'ElTabs' || val.type === 'Query' || val.type === 'VeRing' || val.type === 'HdTopFive' || val.type === 'HdHeader' || val.type === 'HdVerTitle' || val.type === 'HdTextarea' || val.type === 'HdIconKpiBlock' || val.type === 'HdKpiBlock1' || val.type === 'HdKpiBlock2' || val.type === 'HdKpiBlock3' || val.type === 'HdWater' || val.type === 'ElSwiper' || val.type === 'HdCorner' || val.type === 'HdBorderWrap' || val.type === 'HdTitleShape' || val.type === 'DvBorder' || val.type === 'DvDecoration' || val.type === 'HdIconBlock' || val.type === 'ElImage' || val.type === 'HdFlopDevice' || val.type === 'ComptsDevKpiBlock1' || val.type === 'HdKpiBlock' || val.type === 'MobileQuery' || val.type === 'HdTime'
        return bgCompt ? bgStyle : '';
      } else {
        const bgCompt = val.type === 'VeTitle' || val.type === 'ElDatagrid' || val.type === 'CrossTable' || val.type === 'BdTextNote' || val.type === 'VeWordCloud' || val.type === 'PcKpiBlock' || val.type === 'HdVerticalLine' || val.type === 'HdHorizontalLine' || val.type === 'ElBreadCrumb' || val.type === 'ElCarousel' || val.type === 'ElTabs' || val.type === 'Query' || val.type === 'HdIconBlock' || val.type === 'ComptsDevKpiBlock1' || val.type === 'MobileQuery' || val.type === 'VanCollapse';
        return bgCompt ? bgStyle : '';
      }
    },
    setFontStyle(compt) {
      let fontStyle = `color:${compt.comptAttrs.extendSetting['commonTitleColor']||'#000'};font-size:${compt.comptAttrs.extendSetting['commonTitleFontSize']+'px'||'16px'};`
      let fontBigStyle = `color:${compt.comptAttrs.extendSetting['commonTitleColor']||'#fff'};font-size:${compt.comptAttrs.extendSetting['commonTitleFontSize']+'px'||'16px'};`
      if (this.pageCache.classTypeId === '1005') {
        return fontBigStyle;
      } else {
        return fontStyle;
      }
    },
    setHeaderStyle(compt) {
      let headerStyle = `background:${compt.comptAttrs.extendSetting['backgroundColor']||compt.comptAttrs.extendSetting['commonBackgroundColor']||''};`
      return headerStyle;
    },
    ...mapActions({
      qryStyleAttrs: "PageDesign/qryStyleAttrs"
    })
  },
  computed: {
    ...mapGetters({
      allCompts: "PageDesign/getAllFlatCompt"
    })
  }
}
