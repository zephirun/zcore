import{j as e}from"./iframe-d970cace.js";import"./preload-helper-a4192956.js";const x={title:"Foundations/Typography",parameters:{docs:{description:{component:"ZCORE Enterprise Typography scale rules, constrained mapping for maximum legibility in ERP interfaces."}}}},t=({label:p,token:l,sampleClass:a})=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(120px, 1fr) minmax(100px, 1fr) 3fr",gap:"16px",borderBottom:"1px solid var(--border-subtle)",padding:"16px 0",alignItems:"center"},children:[e.jsx("span",{style:{fontSize:"12px",fontWeight:"600",color:"var(--text-main)"},children:p}),e.jsx("span",{style:{fontSize:"11px",color:"var(--text-muted)",fontFamily:"monospace",padding:"4px 8px",background:"var(--bg-elevated)",borderRadius:"4px",width:"fit-content"},children:l}),e.jsx("span",{style:{fontSize:`var(${l})`,color:"var(--text-main)",fontWeight:a!=null&&a.includes("bold")?"600":"400",fontFamily:"var(--font-main)"},children:"The quick brown fox jumps over the lazy dog."})]}),o=()=>e.jsxs("div",{style:{fontFamily:"var(--font-main)",maxWidth:"800px"},children:[e.jsx("h3",{style:{fontSize:"18px",fontWeight:"600",color:"var(--text-main)",marginBottom:"8px"},children:"Typography System"}),e.jsxs("p",{style:{fontSize:"14px",color:"var(--text-muted)",marginBottom:"32px"},children:["Font Family: ",e.jsx("code",{children:"var(--font-main)"})," (Inter / System Sans-Serif)"]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"minmax(120px, 1fr) minmax(100px, 1fr) 3fr",gap:"16px",borderBottom:"1px solid var(--border-color)",paddingBottom:"8px",marginBottom:"8px"},children:[e.jsx("span",{style:{fontSize:"11px",fontWeight:"600",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Role"}),e.jsx("span",{style:{fontSize:"11px",fontWeight:"600",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Variable"}),e.jsx("span",{style:{fontSize:"11px",fontWeight:"600",color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"},children:"Sample"})]}),e.jsx(t,{label:"Display / 3XL",token:"--text-3xl",sampleClass:"bold"}),e.jsx(t,{label:"Hero / 2XL",token:"--text-2xl",sampleClass:"bold"}),e.jsx(t,{label:"Heading 1 / XL",token:"--text-xl",sampleClass:"bold"}),e.jsx(t,{label:"Heading 2 / LG",token:"--text-lg",sampleClass:"bold"}),e.jsx(t,{label:"Heading 3 / Base",token:"--text-base",sampleClass:"bold"}),e.jsx(t,{label:"Body Normal / SM",token:"--text-sm"}),e.jsx(t,{label:"Body Compact / XS",token:"--text-xs"}),e.jsx(t,{label:"Caption / 2XS",token:"--text-2xs"})]})]});o.__docgenInfo={description:"",methods:[],displayName:"TypographyScale"};var r,n,s;o.parameters={...o.parameters,docs:{...(r=o.parameters)==null?void 0:r.docs,source:{originalSource:`() => {
  return <div style={{
    fontFamily: 'var(--font-main)',
    maxWidth: '800px'
  }}>
            <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--text-main)',
      marginBottom: '8px'
    }}>Typography System</h3>
            <p style={{
      fontSize: '14px',
      color: 'var(--text-muted)',
      marginBottom: '32px'
    }}>Font Family: <code>var(--font-main)</code> (Inter / System Sans-Serif)</p>

            <div style={{
      display: 'flex',
      flexDirection: 'column'
    }}>
                <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 1fr) 3fr',
        gap: '16px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '8px',
        marginBottom: '8px'
      }}>
                    <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>Role</span>
                    <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>Variable</span>
                    <span style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>Sample</span>
                </div>

                <TypoSample label="Display / 3XL" token="--text-3xl" sampleClass="bold" />
                <TypoSample label="Hero / 2XL" token="--text-2xl" sampleClass="bold" />
                <TypoSample label="Heading 1 / XL" token="--text-xl" sampleClass="bold" />
                <TypoSample label="Heading 2 / LG" token="--text-lg" sampleClass="bold" />
                <TypoSample label="Heading 3 / Base" token="--text-base" sampleClass="bold" />

                <TypoSample label="Body Normal / SM" token="--text-sm" />
                <TypoSample label="Body Compact / XS" token="--text-xs" />
                <TypoSample label="Caption / 2XS" token="--text-2xs" />
            </div>
        </div>;
}`,...(s=(n=o.parameters)==null?void 0:n.docs)==null?void 0:s.source}}};const d=["TypographyScale"];export{o as TypographyScale,d as __namedExportsOrder,x as default};
