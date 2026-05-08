import{r as m,g as Le,R as De}from"./vendor-react-BLqbEV1W.js";function we(e){var t,r,o="";if(typeof e=="string"||typeof e=="number")o+=e;else if(typeof e=="object")if(Array.isArray(e)){var a=e.length;for(t=0;t<a;t++)e[t]&&(r=we(e[t]))&&(o&&(o+=" "),o+=r)}else for(r in e)e[r]&&(o&&(o+=" "),o+=r);return o}function Mr(){for(var e,t,r=0,o="",a=arguments.length;r<a;r++)(e=arguments[r])&&(t=we(e))&&(o&&(o+=" "),o+=t);return o}const ae="-",Ve=e=>{const t=Fe(e),{conflictingClassGroups:r,conflictingClassGroupModifiers:o}=e;return{getClassGroupId:n=>{const i=n.split(ae);return i[0]===""&&i.length!==1&&i.shift(),ke(i,t)||We(n)},getConflictingClassGroupIds:(n,i)=>{const l=r[n]||[];return i&&o[n]?[...l,...o[n]]:l}}},ke=(e,t)=>{var n;if(e.length===0)return t.classGroupId;const r=e[0],o=t.nextPart.get(r),a=o?ke(e.slice(1),o):void 0;if(a)return a;if(t.validators.length===0)return;const s=e.join(ae);return(n=t.validators.find(({validator:i})=>i(s)))==null?void 0:n.classGroupId},me=/^\[(.+)\]$/,We=e=>{if(me.test(e)){const t=me.exec(e)[1],r=t==null?void 0:t.substring(0,t.indexOf(":"));if(r)return"arbitrary.."+r}},Fe=e=>{const{theme:t,prefix:r}=e,o={nextPart:new Map,validators:[]};return Be(Object.entries(e.classGroups),r).forEach(([s,n])=>{oe(n,o,s,t)}),o},oe=(e,t,r,o)=>{e.forEach(a=>{if(typeof a=="string"){const s=a===""?t:ge(t,a);s.classGroupId=r;return}if(typeof a=="function"){if(Ue(a)){oe(a(o),t,r,o);return}t.validators.push({validator:a,classGroupId:r});return}Object.entries(a).forEach(([s,n])=>{oe(n,ge(t,s),r,o)})})},ge=(e,t)=>{let r=e;return t.split(ae).forEach(o=>{r.nextPart.has(o)||r.nextPart.set(o,{nextPart:new Map,validators:[]}),r=r.nextPart.get(o)}),r},Ue=e=>e.isThemeGetter,Be=(e,t)=>t?e.map(([r,o])=>{const a=o.map(s=>typeof s=="string"?t+s:typeof s=="object"?Object.fromEntries(Object.entries(s).map(([n,i])=>[t+n,i])):s);return[r,a]}):e,He=e=>{if(e<1)return{get:()=>{},set:()=>{}};let t=0,r=new Map,o=new Map;const a=(s,n)=>{r.set(s,n),t++,t>e&&(t=0,o=r,r=new Map)};return{get(s){let n=r.get(s);if(n!==void 0)return n;if((n=o.get(s))!==void 0)return a(s,n),n},set(s,n){r.has(s)?r.set(s,n):a(s,n)}}},Ee="!",Ze=e=>{const{separator:t,experimentalParseClassName:r}=e,o=t.length===1,a=t[0],s=t.length,n=i=>{const l=[];let d=0,c=0,u;for(let g=0;g<i.length;g++){let w=i[g];if(d===0){if(w===a&&(o||i.slice(g,g+s)===t)){l.push(i.slice(c,g)),c=g+s;continue}if(w==="/"){u=g;continue}}w==="["?d++:w==="]"&&d--}const f=l.length===0?i:i.substring(c),b=f.startsWith(Ee),y=b?f.substring(1):f,x=u&&u>c?u-c:void 0;return{modifiers:l,hasImportantModifier:b,baseClassName:y,maybePostfixModifierPosition:x}};return r?i=>r({className:i,parseClassName:n}):n},Ye=e=>{if(e.length<=1)return e;const t=[];let r=[];return e.forEach(o=>{o[0]==="["?(t.push(...r.sort(),o),r=[]):r.push(o)}),t.push(...r.sort()),t},qe=e=>({cache:He(e.cacheSize),parseClassName:Ze(e),...Ve(e)}),Je=/\s+/,Ke=(e,t)=>{const{parseClassName:r,getClassGroupId:o,getConflictingClassGroupIds:a}=t,s=[],n=e.trim().split(Je);let i="";for(let l=n.length-1;l>=0;l-=1){const d=n[l],{modifiers:c,hasImportantModifier:u,baseClassName:f,maybePostfixModifierPosition:b}=r(d);let y=!!b,x=o(y?f.substring(0,b):f);if(!x){if(!y){i=d+(i.length>0?" "+i:i);continue}if(x=o(f),!x){i=d+(i.length>0?" "+i:i);continue}y=!1}const g=Ye(c).join(":"),w=u?g+Ee:g,S=w+x;if(s.includes(S))continue;s.push(S);const E=a(x,y);for(let C=0;C<E.length;++C){const W=E[C];s.push(w+W)}i=d+(i.length>0?" "+i:i)}return i};function Qe(){let e=0,t,r,o="";for(;e<arguments.length;)(t=arguments[e++])&&(r=Se(t))&&(o&&(o+=" "),o+=r);return o}const Se=e=>{if(typeof e=="string")return e;let t,r="";for(let o=0;o<e.length;o++)e[o]&&(t=Se(e[o]))&&(r&&(r+=" "),r+=t);return r};function Xe(e,...t){let r,o,a,s=n;function n(l){const d=t.reduce((c,u)=>u(c),e());return r=qe(d),o=r.cache.get,a=r.cache.set,s=i,i(l)}function i(l){const d=o(l);if(d)return d;const c=Ke(l,r);return a(l,c),c}return function(){return s(Qe.apply(null,arguments))}}const h=e=>{const t=r=>r[e]||[];return t.isThemeGetter=!0,t},Ce=/^\[(?:([a-z-]+):)?(.+)\]$/i,et=/^\d+\/\d+$/,tt=new Set(["px","full","screen"]),rt=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,ot=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,nt=/^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/,st=/^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,at=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/,j=e=>O(e)||tt.has(e)||et.test(e),R=e=>G(e,"length",bt),O=e=>!!e&&!Number.isNaN(Number(e)),te=e=>G(e,"number",O),L=e=>!!e&&Number.isInteger(Number(e)),it=e=>e.endsWith("%")&&O(e.slice(0,-1)),p=e=>Ce.test(e),M=e=>rt.test(e),lt=new Set(["length","size","percentage"]),ct=e=>G(e,lt,ze),dt=e=>G(e,"position",ze),ut=new Set(["image","url"]),pt=e=>G(e,ut,gt),ft=e=>G(e,"",mt),D=()=>!0,G=(e,t,r)=>{const o=Ce.exec(e);return o?o[1]?typeof t=="string"?o[1]===t:t.has(o[1]):r(o[2]):!1},bt=e=>ot.test(e)&&!nt.test(e),ze=()=>!1,mt=e=>st.test(e),gt=e=>at.test(e),ht=()=>{const e=h("colors"),t=h("spacing"),r=h("blur"),o=h("brightness"),a=h("borderColor"),s=h("borderRadius"),n=h("borderSpacing"),i=h("borderWidth"),l=h("contrast"),d=h("grayscale"),c=h("hueRotate"),u=h("invert"),f=h("gap"),b=h("gradientColorStops"),y=h("gradientColorStopPositions"),x=h("inset"),g=h("margin"),w=h("opacity"),S=h("padding"),E=h("saturate"),C=h("scale"),W=h("sepia"),le=h("skew"),ce=h("space"),de=h("translate"),K=()=>["auto","contain","none"],Q=()=>["auto","hidden","clip","visible","scroll"],X=()=>["auto",p,t],v=()=>[p,t],ue=()=>["",j,R],F=()=>["auto",O,p],pe=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],U=()=>["solid","dashed","dotted","double","none"],fe=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"],ee=()=>["start","end","center","between","around","evenly","stretch"],N=()=>["","0",p],be=()=>["auto","avoid","all","avoid-page","page","left","right","column"],A=()=>[O,p];return{cacheSize:500,separator:":",theme:{colors:[D],spacing:[j,R],blur:["none","",M,p],brightness:A(),borderColor:[e],borderRadius:["none","","full",M,p],borderSpacing:v(),borderWidth:ue(),contrast:A(),grayscale:N(),hueRotate:A(),invert:N(),gap:v(),gradientColorStops:[e],gradientColorStopPositions:[it,R],inset:X(),margin:X(),opacity:A(),padding:v(),saturate:A(),scale:A(),sepia:N(),skew:A(),space:v(),translate:v()},classGroups:{aspect:[{aspect:["auto","square","video",p]}],container:["container"],columns:[{columns:[M]}],"break-after":[{"break-after":be()}],"break-before":[{"break-before":be()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...pe(),p]}],overflow:[{overflow:Q()}],"overflow-x":[{"overflow-x":Q()}],"overflow-y":[{"overflow-y":Q()}],overscroll:[{overscroll:K()}],"overscroll-x":[{"overscroll-x":K()}],"overscroll-y":[{"overscroll-y":K()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[x]}],"inset-x":[{"inset-x":[x]}],"inset-y":[{"inset-y":[x]}],start:[{start:[x]}],end:[{end:[x]}],top:[{top:[x]}],right:[{right:[x]}],bottom:[{bottom:[x]}],left:[{left:[x]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",L,p]}],basis:[{basis:X()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",p]}],grow:[{grow:N()}],shrink:[{shrink:N()}],order:[{order:["first","last","none",L,p]}],"grid-cols":[{"grid-cols":[D]}],"col-start-end":[{col:["auto",{span:["full",L,p]},p]}],"col-start":[{"col-start":F()}],"col-end":[{"col-end":F()}],"grid-rows":[{"grid-rows":[D]}],"row-start-end":[{row:["auto",{span:[L,p]},p]}],"row-start":[{"row-start":F()}],"row-end":[{"row-end":F()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",p]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",p]}],gap:[{gap:[f]}],"gap-x":[{"gap-x":[f]}],"gap-y":[{"gap-y":[f]}],"justify-content":[{justify:["normal",...ee()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...ee(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...ee(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[S]}],px:[{px:[S]}],py:[{py:[S]}],ps:[{ps:[S]}],pe:[{pe:[S]}],pt:[{pt:[S]}],pr:[{pr:[S]}],pb:[{pb:[S]}],pl:[{pl:[S]}],m:[{m:[g]}],mx:[{mx:[g]}],my:[{my:[g]}],ms:[{ms:[g]}],me:[{me:[g]}],mt:[{mt:[g]}],mr:[{mr:[g]}],mb:[{mb:[g]}],ml:[{ml:[g]}],"space-x":[{"space-x":[ce]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[ce]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",p,t]}],"min-w":[{"min-w":[p,t,"min","max","fit"]}],"max-w":[{"max-w":[p,t,"none","full","min","max","fit","prose",{screen:[M]},M]}],h:[{h:[p,t,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[p,t,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[p,t,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[p,t,"auto","min","max","fit"]}],"font-size":[{text:["base",M,R]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",te]}],"font-family":[{font:[D]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractions"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",p]}],"line-clamp":[{"line-clamp":["none",O,te]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",j,p]}],"list-image":[{"list-image":["none",p]}],"list-style-type":[{list:["none","disc","decimal",p]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[w]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[w]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...U(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",j,R]}],"underline-offset":[{"underline-offset":["auto",j,p]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:v()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",p]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",p]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[w]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...pe(),dt]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",ct]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},pt]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[y]}],"gradient-via-pos":[{via:[y]}],"gradient-to-pos":[{to:[y]}],"gradient-from":[{from:[b]}],"gradient-via":[{via:[b]}],"gradient-to":[{to:[b]}],rounded:[{rounded:[s]}],"rounded-s":[{"rounded-s":[s]}],"rounded-e":[{"rounded-e":[s]}],"rounded-t":[{"rounded-t":[s]}],"rounded-r":[{"rounded-r":[s]}],"rounded-b":[{"rounded-b":[s]}],"rounded-l":[{"rounded-l":[s]}],"rounded-ss":[{"rounded-ss":[s]}],"rounded-se":[{"rounded-se":[s]}],"rounded-ee":[{"rounded-ee":[s]}],"rounded-es":[{"rounded-es":[s]}],"rounded-tl":[{"rounded-tl":[s]}],"rounded-tr":[{"rounded-tr":[s]}],"rounded-br":[{"rounded-br":[s]}],"rounded-bl":[{"rounded-bl":[s]}],"border-w":[{border:[i]}],"border-w-x":[{"border-x":[i]}],"border-w-y":[{"border-y":[i]}],"border-w-s":[{"border-s":[i]}],"border-w-e":[{"border-e":[i]}],"border-w-t":[{"border-t":[i]}],"border-w-r":[{"border-r":[i]}],"border-w-b":[{"border-b":[i]}],"border-w-l":[{"border-l":[i]}],"border-opacity":[{"border-opacity":[w]}],"border-style":[{border:[...U(),"hidden"]}],"divide-x":[{"divide-x":[i]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[i]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[w]}],"divide-style":[{divide:U()}],"border-color":[{border:[a]}],"border-color-x":[{"border-x":[a]}],"border-color-y":[{"border-y":[a]}],"border-color-s":[{"border-s":[a]}],"border-color-e":[{"border-e":[a]}],"border-color-t":[{"border-t":[a]}],"border-color-r":[{"border-r":[a]}],"border-color-b":[{"border-b":[a]}],"border-color-l":[{"border-l":[a]}],"divide-color":[{divide:[a]}],"outline-style":[{outline:["",...U()]}],"outline-offset":[{"outline-offset":[j,p]}],"outline-w":[{outline:[j,R]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:ue()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[w]}],"ring-offset-w":[{"ring-offset":[j,R]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",M,ft]}],"shadow-color":[{shadow:[D]}],opacity:[{opacity:[w]}],"mix-blend":[{"mix-blend":[...fe(),"plus-lighter","plus-darker"]}],"bg-blend":[{"bg-blend":fe()}],filter:[{filter:["","none"]}],blur:[{blur:[r]}],brightness:[{brightness:[o]}],contrast:[{contrast:[l]}],"drop-shadow":[{"drop-shadow":["","none",M,p]}],grayscale:[{grayscale:[d]}],"hue-rotate":[{"hue-rotate":[c]}],invert:[{invert:[u]}],saturate:[{saturate:[E]}],sepia:[{sepia:[W]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[r]}],"backdrop-brightness":[{"backdrop-brightness":[o]}],"backdrop-contrast":[{"backdrop-contrast":[l]}],"backdrop-grayscale":[{"backdrop-grayscale":[d]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[c]}],"backdrop-invert":[{"backdrop-invert":[u]}],"backdrop-opacity":[{"backdrop-opacity":[w]}],"backdrop-saturate":[{"backdrop-saturate":[E]}],"backdrop-sepia":[{"backdrop-sepia":[W]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[n]}],"border-spacing-x":[{"border-spacing-x":[n]}],"border-spacing-y":[{"border-spacing-y":[n]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",p]}],duration:[{duration:A()}],ease:[{ease:["linear","in","out","in-out",p]}],delay:[{delay:A()}],animate:[{animate:["none","spin","ping","pulse","bounce",p]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[C]}],"scale-x":[{"scale-x":[C]}],"scale-y":[{"scale-y":[C]}],rotate:[{rotate:[L,p]}],"translate-x":[{"translate-x":[de]}],"translate-y":[{"translate-y":[de]}],"skew-x":[{"skew-x":[le]}],"skew-y":[{"skew-y":[le]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",p]}],accent:[{accent:["auto",e]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",p]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":v()}],"scroll-mx":[{"scroll-mx":v()}],"scroll-my":[{"scroll-my":v()}],"scroll-ms":[{"scroll-ms":v()}],"scroll-me":[{"scroll-me":v()}],"scroll-mt":[{"scroll-mt":v()}],"scroll-mr":[{"scroll-mr":v()}],"scroll-mb":[{"scroll-mb":v()}],"scroll-ml":[{"scroll-ml":v()}],"scroll-p":[{"scroll-p":v()}],"scroll-px":[{"scroll-px":v()}],"scroll-py":[{"scroll-py":v()}],"scroll-ps":[{"scroll-ps":v()}],"scroll-pe":[{"scroll-pe":v()}],"scroll-pt":[{"scroll-pt":v()}],"scroll-pr":[{"scroll-pr":v()}],"scroll-pb":[{"scroll-pb":v()}],"scroll-pl":[{"scroll-pl":v()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",p]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[j,R,te]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-s","border-color-e","border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}},Pr=Xe(ht),yt={},he=e=>{let t;const r=new Set,o=(c,u)=>{const f=typeof c=="function"?c(t):c;if(!Object.is(f,t)){const b=t;t=u??(typeof f!="object"||f===null)?f:Object.assign({},t,f),r.forEach(y=>y(t,b))}},a=()=>t,l={setState:o,getState:a,getInitialState:()=>d,subscribe:c=>(r.add(c),()=>r.delete(c)),destroy:()=>{(yt?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),r.clear()}},d=t=e(o,a,l);return l},vt=e=>e?he(e):he;var Ae={exports:{}},je={},Ie={exports:{}},$e={};/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var T=m;function xt(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var wt=typeof Object.is=="function"?Object.is:xt,kt=T.useState,Et=T.useEffect,St=T.useLayoutEffect,Ct=T.useDebugValue;function zt(e,t){var r=t(),o=kt({inst:{value:r,getSnapshot:t}}),a=o[0].inst,s=o[1];return St(function(){a.value=r,a.getSnapshot=t,re(a)&&s({inst:a})},[e,r,t]),Et(function(){return re(a)&&s({inst:a}),e(function(){re(a)&&s({inst:a})})},[e]),Ct(r),r}function re(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!wt(e,r)}catch{return!0}}function At(e,t){return t()}var jt=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?At:zt;$e.useSyncExternalStore=T.useSyncExternalStore!==void 0?T.useSyncExternalStore:jt;Ie.exports=$e;var It=Ie.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Y=m,$t=It;function Rt(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Mt=typeof Object.is=="function"?Object.is:Rt,Pt=$t.useSyncExternalStore,_t=Y.useRef,Ot=Y.useEffect,Tt=Y.useMemo,Gt=Y.useDebugValue;je.useSyncExternalStoreWithSelector=function(e,t,r,o,a){var s=_t(null);if(s.current===null){var n={hasValue:!1,value:null};s.current=n}else n=s.current;s=Tt(function(){function l(b){if(!d){if(d=!0,c=b,b=o(b),a!==void 0&&n.hasValue){var y=n.value;if(a(y,b))return u=y}return u=b}if(y=u,Mt(c,b))return y;var x=o(b);return a!==void 0&&a(y,x)?(c=b,y):(c=b,u=x)}var d=!1,c,u,f=r===void 0?null:r;return[function(){return l(t())},f===null?void 0:function(){return l(f())}]},[t,r,o,a]);var i=Pt(e,s[0],s[1]);return Ot(function(){n.hasValue=!0,n.value=i},[i]),Gt(i),i};Ae.exports=je;var Nt=Ae.exports;const Lt=Le(Nt),Re={},{useDebugValue:Dt}=De,{useSyncExternalStoreWithSelector:Vt}=Lt;let ye=!1;const Wt=e=>e;function Ft(e,t=Wt,r){(Re?"production":void 0)!=="production"&&r&&!ye&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),ye=!0);const o=Vt(e.subscribe,e.getState,e.getServerState||e.getInitialState,t,r);return Dt(o),o}const ve=e=>{(Re?"production":void 0)!=="production"&&typeof e!="function"&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");const t=typeof e=="function"?vt(e):e,r=(o,a)=>Ft(t,o,a);return Object.assign(r,t),r},_r=e=>e?ve(e):ve;let Ut={data:""},Bt=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||Ut},Ht=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Zt=/\/\*[^]*?\*\/|  +/g,xe=/\n+/g,P=(e,t)=>{let r="",o="",a="";for(let s in e){let n=e[s];s[0]=="@"?s[1]=="i"?r=s+" "+n+";":o+=s[1]=="f"?P(n,s):s+"{"+P(n,s[1]=="k"?"":t)+"}":typeof n=="object"?o+=P(n,t?t.replace(/([^,])+/g,i=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,i):i?i+" "+l:l)):s):n!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),a+=P.p?P.p(s,n):s+":"+n+";")}return r+(t&&a?t+"{"+a+"}":a)+o},I={},Me=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+Me(e[r]);return t}return e},Yt=(e,t,r,o,a)=>{let s=Me(e),n=I[s]||(I[s]=(l=>{let d=0,c=11;for(;d<l.length;)c=101*c+l.charCodeAt(d++)>>>0;return"go"+c})(s));if(!I[n]){let l=s!==e?e:(d=>{let c,u,f=[{}];for(;c=Ht.exec(d.replace(Zt,""));)c[4]?f.shift():c[3]?(u=c[3].replace(xe," ").trim(),f.unshift(f[0][u]=f[0][u]||{})):f[0][c[1]]=c[2].replace(xe," ").trim();return f[0]})(e);I[n]=P(a?{["@keyframes "+n]:l}:l,r?"":"."+n)}let i=r&&I.g?I.g:null;return r&&(I.g=I[n]),((l,d,c,u)=>{u?d.data=d.data.replace(u,l):d.data.indexOf(l)===-1&&(d.data=c?l+d.data:d.data+l)})(I[n],t,o,i),n},qt=(e,t,r)=>e.reduce((o,a,s)=>{let n=t[s];if(n&&n.call){let i=n(r),l=i&&i.props&&i.props.className||/^go/.test(i)&&i;n=l?"."+l:i&&typeof i=="object"?i.props?"":P(i,""):i===!1?"":i}return o+a+(n??"")},"");function q(e){let t=this||{},r=e.call?e(t.p):e;return Yt(r.unshift?r.raw?qt(r,[].slice.call(arguments,1),t.p):r.reduce((o,a)=>Object.assign(o,a&&a.call?a(t.p):a),{}):r,Bt(t.target),t.g,t.o,t.k)}let Pe,ne,se;q.bind({g:1});let $=q.bind({k:1});function Jt(e,t,r,o){P.p=t,Pe=e,ne=r,se=o}function _(e,t){let r=this||{};return function(){let o=arguments;function a(s,n){let i=Object.assign({},s),l=i.className||a.className;r.p=Object.assign({theme:ne&&ne()},i),r.o=/ *go\d+/.test(l),i.className=q.apply(r,o)+(l?" "+l:"");let d=e;return e[0]&&(d=i.as||e,delete i.as),se&&d[0]&&se(i),Pe(d,i)}return a}}var Kt=e=>typeof e=="function",Z=(e,t)=>Kt(e)?e(t):e,Qt=(()=>{let e=0;return()=>(++e).toString()})(),_e=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),Xt=20,ie="default",Oe=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(n=>n.id===t.toast.id?{...n,...t.toast}:n)};case 2:let{toast:o}=t;return Oe(e,{type:e.toasts.find(n=>n.id===o.id)?1:0,toast:o});case 3:let{toastId:a}=t;return{...e,toasts:e.toasts.map(n=>n.id===a||a===void 0?{...n,dismissed:!0,visible:!1}:n)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(n=>n.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(n=>({...n,pauseDuration:n.pauseDuration+s}))}}},H=[],Te={toasts:[],pausedAt:void 0,settings:{toastLimit:Xt}},z={},Ge=(e,t=ie)=>{z[t]=Oe(z[t]||Te,e),H.forEach(([r,o])=>{r===t&&o(z[t])})},Ne=e=>Object.keys(z).forEach(t=>Ge(e,t)),er=e=>Object.keys(z).find(t=>z[t].toasts.some(r=>r.id===e)),J=(e=ie)=>t=>{Ge(t,e)},tr={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},rr=(e={},t=ie)=>{let[r,o]=m.useState(z[t]||Te),a=m.useRef(z[t]);m.useEffect(()=>(a.current!==z[t]&&o(z[t]),H.push([t,o]),()=>{let n=H.findIndex(([i])=>i===t);n>-1&&H.splice(n,1)}),[t]);let s=r.toasts.map(n=>{var i,l,d;return{...e,...e[n.type],...n,removeDelay:n.removeDelay||((i=e[n.type])==null?void 0:i.removeDelay)||(e==null?void 0:e.removeDelay),duration:n.duration||((l=e[n.type])==null?void 0:l.duration)||(e==null?void 0:e.duration)||tr[n.type],style:{...e.style,...(d=e[n.type])==null?void 0:d.style,...n.style}}});return{...r,toasts:s}},or=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||Qt()}),V=e=>(t,r)=>{let o=or(t,e,r);return J(o.toasterId||er(o.id))({type:2,toast:o}),o.id},k=(e,t)=>V("blank")(e,t);k.error=V("error");k.success=V("success");k.loading=V("loading");k.custom=V("custom");k.dismiss=(e,t)=>{let r={type:3,toastId:e};t?J(t)(r):Ne(r)};k.dismissAll=e=>k.dismiss(void 0,e);k.remove=(e,t)=>{let r={type:4,toastId:e};t?J(t)(r):Ne(r)};k.removeAll=e=>k.remove(void 0,e);k.promise=(e,t,r)=>{let o=k.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(a=>{let s=t.success?Z(t.success,a):void 0;return s?k.success(s,{id:o,...r,...r==null?void 0:r.success}):k.dismiss(o),a}).catch(a=>{let s=t.error?Z(t.error,a):void 0;s?k.error(s,{id:o,...r,...r==null?void 0:r.error}):k.dismiss(o)}),e};var nr=1e3,sr=(e,t="default")=>{let{toasts:r,pausedAt:o}=rr(e,t),a=m.useRef(new Map).current,s=m.useCallback((u,f=nr)=>{if(a.has(u))return;let b=setTimeout(()=>{a.delete(u),n({type:4,toastId:u})},f);a.set(u,b)},[]);m.useEffect(()=>{if(o)return;let u=Date.now(),f=r.map(b=>{if(b.duration===1/0)return;let y=(b.duration||0)+b.pauseDuration-(u-b.createdAt);if(y<0){b.visible&&k.dismiss(b.id);return}return setTimeout(()=>k.dismiss(b.id,t),y)});return()=>{f.forEach(b=>b&&clearTimeout(b))}},[r,o,t]);let n=m.useCallback(J(t),[t]),i=m.useCallback(()=>{n({type:5,time:Date.now()})},[n]),l=m.useCallback((u,f)=>{n({type:1,toast:{id:u,height:f}})},[n]),d=m.useCallback(()=>{o&&n({type:6,time:Date.now()})},[o,n]),c=m.useCallback((u,f)=>{let{reverseOrder:b=!1,gutter:y=8,defaultPosition:x}=f||{},g=r.filter(E=>(E.position||x)===(u.position||x)&&E.height),w=g.findIndex(E=>E.id===u.id),S=g.filter((E,C)=>C<w&&E.visible).length;return g.filter(E=>E.visible).slice(...b?[S+1]:[0,S]).reduce((E,C)=>E+(C.height||0)+y,0)},[r]);return m.useEffect(()=>{r.forEach(u=>{if(u.dismissed)s(u.id,u.removeDelay);else{let f=a.get(u.id);f&&(clearTimeout(f),a.delete(u.id))}})},[r,s]),{toasts:r,handlers:{updateHeight:l,startPause:i,endPause:d,calculateOffset:c}}},ar=$`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ir=$`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,lr=$`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,cr=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ar} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ir} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${lr} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,dr=$`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ur=_("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${dr} 1s linear infinite;
`,pr=$`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,fr=$`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,br=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${pr} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${fr} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,mr=_("div")`
  position: absolute;
`,gr=_("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,hr=$`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,yr=_("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${hr} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,vr=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?m.createElement(yr,null,t):t:r==="blank"?null:m.createElement(gr,null,m.createElement(ur,{...o}),r!=="loading"&&m.createElement(mr,null,r==="error"?m.createElement(cr,{...o}):m.createElement(br,{...o})))},xr=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,wr=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,kr="0%{opacity:0;} 100%{opacity:1;}",Er="0%{opacity:1;} 100%{opacity:0;}",Sr=_("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Cr=_("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,zr=(e,t)=>{let r=e.includes("top")?1:-1,[o,a]=_e()?[kr,Er]:[xr(r),wr(r)];return{animation:t?`${$(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${$(a)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Ar=m.memo(({toast:e,position:t,style:r,children:o})=>{let a=e.height?zr(e.position||t||"top-center",e.visible):{opacity:0},s=m.createElement(vr,{toast:e}),n=m.createElement(Cr,{...e.ariaProps},Z(e.message,e));return m.createElement(Sr,{className:e.className,style:{...a,...r,...e.style}},typeof o=="function"?o({icon:s,message:n}):m.createElement(m.Fragment,null,s,n))});Jt(m.createElement);var jr=({id:e,className:t,style:r,onHeightUpdate:o,children:a})=>{let s=m.useCallback(n=>{if(n){let i=()=>{let l=n.getBoundingClientRect().height;o(e,l)};i(),new MutationObserver(i).observe(n,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return m.createElement("div",{ref:s,className:t,style:r},a)},Ir=(e,t)=>{let r=e.includes("top"),o=r?{top:0}:{bottom:0},a=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:_e()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...o,...a}},$r=q`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,B=16,Or=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:a,toasterId:s,containerStyle:n,containerClassName:i})=>{let{toasts:l,handlers:d}=sr(r,s);return m.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:B,left:B,right:B,bottom:B,pointerEvents:"none",...n},className:i,onMouseEnter:d.startPause,onMouseLeave:d.endPause},l.map(c=>{let u=c.position||t,f=d.calculateOffset(c,{reverseOrder:e,gutter:o,defaultPosition:t}),b=Ir(u,f);return m.createElement(jr,{id:c.id,key:c.id,onHeightUpdate:d.updateHeight,className:c.visible?$r:"",style:b},c.type==="custom"?Z(c.message,c):a?a(c):m.createElement(Ar,{toast:c,position:u}))}))};export{Or as F,_r as a,Mr as c,Pr as t};
