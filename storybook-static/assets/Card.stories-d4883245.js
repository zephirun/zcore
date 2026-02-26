import{j as o}from"./iframe-d970cace.js";import"./preload-helper-a4192956.js";const m=({children:r,className:v="",padding:x="var(--space-6)",noBorder:y=!1,hoverEffect:s=!1,...d})=>{const h={background:"var(--bg-card)",borderRadius:"var(--radius)",border:y?"none":"1px solid var(--border-color)",padding:x,boxShadow:"var(--shadow-sm)",transition:s?"transform 0.2s, box-shadow 0.2s":"none",display:"flex",flexDirection:"column",...d.style||{}};return o.jsx("div",{style:h,className:`ui-card ${v}`,onMouseEnter:e=>{s&&(e.currentTarget.style.transform="translateY(-2px)",e.currentTarget.style.boxShadow="var(--shadow-md)")},onMouseLeave:e=>{s&&(e.currentTarget.style.transform="translateY(0)",e.currentTarget.style.boxShadow="var(--shadow-sm)")},...d,children:r})},f=m;m.__docgenInfo={description:"",methods:[],displayName:"Card",props:{className:{defaultValue:{value:"''",computed:!1},required:!1},padding:{defaultValue:{value:"'var(--space-6)'",computed:!1},required:!1},noBorder:{defaultValue:{value:"false",computed:!1},required:!1},hoverEffect:{defaultValue:{value:"false",computed:!1},required:!1}}};const S={title:"Layout/Card",component:f,parameters:{docs:{description:{component:"Primary container for grouping related content, forms, or data blocks. Uses native adaptive density for paddings."}}},argTypes:{title:{control:"text"},subtitle:{control:"text"},noPadding:{control:"boolean"}}},g=r=>o.jsx(f,{...r,children:o.jsx("div",{style:{color:"var(--text-muted)",fontSize:"14px"},children:"This is the content inside the card. It automatically respects the --density-card-padding variable."})}),a=g.bind({});a.args={title:"Informações do Cliente",subtitle:"Dados de faturamento e endereço"};const t=g.bind({});t.args={title:"Lista de Pedidos Recentes",noPadding:!0};var n,i,l;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`args => <Card {...args}>
        <div style={{
    color: 'var(--text-muted)',
    fontSize: '14px'
  }}>
            This is the content inside the card. It automatically respects the --density-card-padding variable.
        </div>
    </Card>`,...(l=(i=a.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,u,p;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`args => <Card {...args}>
        <div style={{
    color: 'var(--text-muted)',
    fontSize: '14px'
  }}>
            This is the content inside the card. It automatically respects the --density-card-padding variable.
        </div>
    </Card>`,...(p=(u=t.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};const T=["Default","NoPadding"];export{a as Default,t as NoPadding,T as __namedExportsOrder,S as default};
