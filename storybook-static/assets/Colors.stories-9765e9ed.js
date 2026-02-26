import{j as e}from"./iframe-d970cace.js";import"./preload-helper-a4192956.js";const x={title:"Foundations/Colors",parameters:{docs:{description:{component:"ZCORE Enterprise Color System. These design tokens ensure systematic application of colors in light and dark modes."}}}},m=({name:t,hexVar:a})=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",width:"120px",marginBottom:"24px"},children:[e.jsx("div",{style:{height:"80px",backgroundColor:`var(${a})`,borderRadius:"8px",border:"1px solid var(--border-color)",boxShadow:"var(--shadow-sm)",marginBottom:"8px",transition:"all 0.2s ease"}}),e.jsx("span",{style:{fontSize:"12px",fontWeight:"600",color:"var(--text-main)",letterSpacing:"-0.01em"},children:t}),e.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)",fontFamily:"monospace"},children:a})]}),r=({title:t,colors:a})=>e.jsxs("div",{style:{marginBottom:"40px"},children:[e.jsx("h3",{style:{fontSize:"16px",fontWeight:"600",color:"var(--text-main)",marginBottom:"16px",borderBottom:"1px solid var(--border-color)",paddingBottom:"8px"},children:t}),e.jsx("div",{style:{display:"flex",gap:"24px",flexWrap:"wrap"},children:a.map(n=>e.jsx(m,{...n},n.hexVar))})]}),o=()=>e.jsxs("div",{style:{fontFamily:"var(--font-main)"},children:[e.jsx(r,{title:"Primary Interaction Scale",colors:[{name:"Primary Core",hexVar:"--color-primary"},{name:"Primary Dim (Hover)",hexVar:"--color-primary-dim"},{name:"Accent Layer",hexVar:"--color-accent"}]}),e.jsx(r,{title:"Surface & Backgrounds",colors:[{name:"Main Canvas",hexVar:"--bg-main"},{name:"Card Surface",hexVar:"--bg-card"},{name:"Elevated (Modals)",hexVar:"--bg-elevated"},{name:"Input Fields",hexVar:"--bg-input"},{name:"Hover State",hexVar:"--bg-hover"}]}),e.jsx(r,{title:"Typography Colors",colors:[{name:"Main Text",hexVar:"--text-main"},{name:"Muted Text",hexVar:"--text-muted"},{name:"Light/Inverted Text",hexVar:"--text-light"}]}),e.jsx(r,{title:"Borders & Dividers",colors:[{name:"Standard Border",hexVar:"--border-color"},{name:"Input Border",hexVar:"--border-input"},{name:"Subtle Divider",hexVar:"--border-subtle"}]}),e.jsx(r,{title:"Semantic Feedback",colors:[{name:"Success",hexVar:"--color-success"},{name:"Warning",hexVar:"--color-warning"},{name:"Error / Danger",hexVar:"--color-error"},{name:"Info",hexVar:"--color-info"}]})]});o.__docgenInfo={description:"",methods:[],displayName:"ColorTokens"};var i,s,l;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`() => {
  return <div style={{
    fontFamily: 'var(--font-main)'
  }}>
            <ColorGroup title="Primary Interaction Scale" colors={[{
      name: 'Primary Core',
      hexVar: '--color-primary'
    }, {
      name: 'Primary Dim (Hover)',
      hexVar: '--color-primary-dim'
    }, {
      name: 'Accent Layer',
      hexVar: '--color-accent'
    }]} />

            <ColorGroup title="Surface & Backgrounds" colors={[{
      name: 'Main Canvas',
      hexVar: '--bg-main'
    }, {
      name: 'Card Surface',
      hexVar: '--bg-card'
    }, {
      name: 'Elevated (Modals)',
      hexVar: '--bg-elevated'
    }, {
      name: 'Input Fields',
      hexVar: '--bg-input'
    }, {
      name: 'Hover State',
      hexVar: '--bg-hover'
    }]} />

            <ColorGroup title="Typography Colors" colors={[{
      name: 'Main Text',
      hexVar: '--text-main'
    }, {
      name: 'Muted Text',
      hexVar: '--text-muted'
    }, {
      name: 'Light/Inverted Text',
      hexVar: '--text-light'
    }]} />

            <ColorGroup title="Borders & Dividers" colors={[{
      name: 'Standard Border',
      hexVar: '--border-color'
    }, {
      name: 'Input Border',
      hexVar: '--border-input'
    }, {
      name: 'Subtle Divider',
      hexVar: '--border-subtle'
    }]} />

            <ColorGroup title="Semantic Feedback" colors={[{
      name: 'Success',
      hexVar: '--color-success'
    }, {
      name: 'Warning',
      hexVar: '--color-warning'
    }, {
      name: 'Error / Danger',
      hexVar: '--color-error'
    }, {
      name: 'Info',
      hexVar: '--color-info'
    }]} />
        </div>;
}`,...(l=(s=o.parameters)==null?void 0:s.docs)==null?void 0:l.source}}};const p=["ColorTokens"];export{o as ColorTokens,p as __namedExportsOrder,x as default};
