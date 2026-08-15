import React, {useEffect, useMemo, useState} from "react";
import {BrowserRouter, Routes, Route, Link, NavLink, Outlet, useNavigate} from "react-router-dom";
import {ArrowRight, Braces, CheckCircle2, Code2, Database, Download, FileCode2, FileUp,
FolderKanban, GitBranch, Globe2, KeyRound, Layers3, Logs, Mail, Plus, RefreshCw,
Save, Search, ServerCog, Settings2, ShieldCheck, Table2, TestTube2, Trash2, Upload,
Activity, Workflow} from "lucide-react";
import {create} from "zustand";

const projectService={
  list: async () => {
    try { return {data:{status:"success",data:JSON.parse(localStorage.getItem("visual-backend-platform.projects.v1")||"[]")}}; }
    catch { return {data:{status:"success",data:[]}}; }
  },
  get: async id => {
    const list=(await projectService.list()).data.data;
    return {data:{status:"success",data:list.find(p=>p.id===id)}};
  },
  create: async payload => {
    const key="visual-backend-platform.projects.v1";
    const list=(await projectService.list()).data.data;
    const now=new Date().toISOString();
    const saved={...payload,id:payload.id||`project_${Date.now()}`,createdAt:now,updatedAt:now};
    localStorage.setItem(key,JSON.stringify([saved,...list]));
    return {data:{status:"success",data:saved}};
  },
  update: async (id,payload) => {
    const key="visual-backend-platform.projects.v1";
    const list=(await projectService.list()).data.data.map(p=>p.id===id?{...payload,id,updatedAt:new Date().toISOString()}:p);
    const saved=list.find(p=>p.id===id);
    localStorage.setItem(key,JSON.stringify(list));
    return {data:{status:"success",data:saved}};
  },
  remove: async id => {
    const key="visual-backend-platform.projects.v1";
    const list=(await projectService.list()).data.data.filter(p=>p.id!==id);
    localStorage.setItem(key,JSON.stringify(list));
    return {data:{status:"success",data:null}};
  },
  generate: async (id,payload) => {
    const p=payload;
    const preview=`// Visual Backend — UI-only generator preview
// Project: ${p?.projectName||"Project"}
// Backend target: ${p?.backend||"SPRING_BOOT"}
// Database: ${p?.database||"MYSQL"}
// Tables: ${(p?.tables||[]).map(x=>x.name).join(", ")}
// APIs: ${(p?.apis||[]).map(x=>x.method+" "+x.path).join(", ")}
// Business Rules: ${(p?.businessRules||[]).length}
// Workflows: ${(p?.workflows||[]).length}
// Authentication: ${p?.security?.authentication||"NONE"}

// This browser-only version stores project definitions in localStorage.
// No Java/Spring Boot server is required.`;
    return {data:{status:"success",data:{preview}}};
  }
};

const store=create(set=>({
  project:null,
  setProject:p=>set({project:p}),
  patch:p=>set(s=>({project:{...s.project,...p,updatedAt:new Date().toISOString()}})),
  mutate:fn=>set(s=>({project:fn({...s.project})}))
}));



const TYPES=["STRING","TEXT","INTEGER","LONG","DECIMAL","BOOLEAN","DATE","DATETIME","TIME","UUID","EMAIL","ENUM","JSON","BLOB","CLOB"];
const DBS=["MYSQL","ORACLE","POSTGRESQL","SQL_SERVER"];
const BACKENDS=["SPRING_BOOT"];
const METHODS=["GET","POST","PUT","PATCH","DELETE"];
const API_TYPES=["REST","CRUD","DROPDOWN","FILE_UPLOAD","PAYMENT","EXTERNAL","SEARCH","BULK","IMPORT","EXPORT","REPORT","WEBHOOK","EMAIL","SMS","NOTIFICATION"];
const CONTENT_TYPES=["application/json","application/xml","application/x-www-form-urlencoded","multipart/form-data","text/plain","application/octet-stream"];
const FILE_ENCODINGS=["MULTIPART","BASE64","BYTE_ARRAY","BINARY","DATA_URL","HEX"];
const AUTH=["NONE","JWT","OAUTH2","BASIC","API_KEY"];
const PERMS=["CREATE","READ","UPDATE","DELETE","EXECUTE"];
const RULE_OPS=["EQUALS","NOT_EQUALS","GREATER_THAN","LESS_THAN","GREATER_OR_EQUAL","LESS_OR_EQUAL","CONTAINS","IS_NULL","IS_NOT_NULL"];
const RULE_ACTIONS=["ASSIGN","REJECT","THROW_EXCEPTION","REQUIRE","CALL_API"];
const uid=p=>`${p}_${Math.random().toString(36).slice(2,9)}`;

const field=(name="field")=>({
  id:uid("field"),name,type:"STRING",primaryKey:false,autoIncrement:false,
  unique:false,nullable:true,defaultValue:"",
  validations:{required:false,email:false,minLength:"",maxLength:"",min:"",max:"",pattern:""}
});
const table=(name="customers")=>{
  const id=field("id");
  Object.assign(id,{type:"LONG",primaryKey:true,autoIncrement:true,nullable:false,validations:{...id.validations,required:true}});
  return {id:uid("table"),name,description:"",fields:[id,field("name"),field("email")],
    crud:{create:true,read:true,update:true,delete:true}};
};
const apiDef=(base="/api")=>({
  id:uid("api"),name:"getCustomers",type:"REST",method:"GET",path:`${base}/customers`,
  description:"",auth:"NONE",pathParams:[],queryParams:[],headers:[],
  request:{contentType:"application/json",fields:[]},
  response:{status:200,contentType:"application/json",fields:[]},
  file:{fieldName:"file",encoding:"MULTIPART",maxSizeMb:5,multiple:false,allowedExtensions:".jpg,.png,.pdf",mimeTypes:"image/*,application/pdf"},
  payment:{provider:"CUSTOM",operation:"CREATE_ORDER",secretRef:"PAYMENT_SECRET"},
  external:{url:"",method:"GET",timeoutMs:10000,retries:2},
  search:{fields:[],pageSize:20,sortField:"createdAt",sortDirection:"DESC"},
  bulk:{operation:"CREATE",arrayRoot:"items"},
  transfer:{format:"CSV",validateRows:true,continueOnError:false},
  report:{groupBy:"",aggregations:[]},
  webhook:{secretRef:"WEBHOOK_SECRET",event:""},
  message:{template:"",toField:"email"}
});
const newProject=(name="Customer Platform")=>({
  id:uid("project"),projectName:name,description:"",
  backend:"SPRING_BOOT",database:"MYSQL",packageName:"com.example.generated",
  application:{port:8080,baseUrl:"/api"},tables:[table()],relationships:[],
  apis:[apiDef("/api")],
  businessRules:[],workflows:[],integrations:[],audit:{enabled:true},
  security:{authentication:"JWT",roles:[{id:uid("role"),name:"ADMIN",permissions:[...PERMS]}],apiAccess:{}},
  exceptionHandling:{enabled:true,response:{status:"status",status_message:"status_message",data:"data"}},
  observability:{logging:true,metrics:true,correlationId:true,health:true},
  codegen:{language:"JAVA",framework:"SPRING_BOOT",packageName:"com.example.generated"}
});





function Btn({children,primary=false,danger=false,...p}){return <button className={`btn ${primary?"primary":""} ${danger?"danger":""}`} {...p}>{children}</button>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Header({eyebrow,title,action}){return <header className="header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div><div className="actions">{action}</div></header>}
function Empty({title,text,action}){return <div className="empty"><Code2 size={42}/><h2>{title}</h2><p>{text}</p>{action}</div>}









function Layout(){
  const p=store(s=>s.project);
  const [mobileOpen,setMobileOpen]=useState(false);
  const sections=[
    ["CORE",[["overview","Overview",Settings2],["database","Database",Database],["tables","Tables & Fields",Table2],["relationships","Relationships",GitBranch]]],
    ["API DESIGN",[["apis","API Designer",Braces],["tester","API Tester",TestTube2],["files","File Upload",FileUp],["payments","Payments",KeyRound],["external","External APIs",Globe2]]],
    ["LOGIC",[["rules","Business Rules",Layers3],["workflow","Workflows",Workflow],["messages","Notifications",Mail]]],
    ["SECURITY",[["security","Auth & RBAC",ShieldCheck],["exceptions","Exceptions",CheckCircle2]]],
    ["DATA & OPS",[["data","Import / Export",Upload],["reports","Reports",Activity],["audit","Audit Logs",Logs],["observability","Observability",Activity]]],
    ["CODEGEN",[["codegen","Code Generator",FileCode2],["metadata","Metadata",Code2]]]
  ];
  return <div className="app"><aside className={`sidebar ${mobileOpen?"mobileOpen":""}`}>
    <Link className="brand" to="/"><span className="brandMark"><Code2 size={18}/></span>Visual Backend</Link>
    <div className="navLabel">WORKSPACE</div><NavLink to="/" onClick={()=>setMobileOpen(false)}><FolderKanban size={15}/>Projects</NavLink>
    {p&&sections.map(([label,items])=><React.Fragment key={label}><div className="navLabel">{label}</div>{items.map(([key,text,Icon])=><NavLink key={key} to={`/projects/${p.id}/${key}`} onClick={()=>setMobileOpen(false)}><Icon size={15}/>{text}</NavLink>)}</React.Fragment>)}
    <div className="sidebarFoot">Final Phase: React visual designer + Spring Boot metadata backend. Deployment is intentionally excluded.</div>
  </aside>
    <nav className="mobileNav">
      <NavLink to="/" end><FolderKanban size={17}/><span>Projects</span></NavLink>
      {p ? <>
        <NavLink to={`/projects/${p.id}/overview`}><Settings2 size={17}/><span>Overview</span></NavLink>
        <NavLink to={`/projects/${p.id}/apis`}><Braces size={17}/><span>APIs</span></NavLink>
        <button onClick={()=>setMobileOpen(v=>!v)}><Layers3 size={17}/><span>More</span></button>
      </> : <button onClick={()=>setMobileOpen(v=>!v)}><Layers3 size={17}/><span>Menu</span></button>}
    </nav>
    <main className="content"><Outlet/></main></div>
}

function Dashboard(){
  const setProject=store(s=>s.setProject),[projects,setProjects]=useState([]),[err,setErr]=useState("");
  useEffect(()=>{projectService.list().then(r=>setProjects(r.data?.data||[])).catch(()=>setErr("Unable to load local projects."));},[]);
  return <><Header eyebrow="WORKSPACE" title="Projects" action={<Link className="btn primary" to="/projects/new"><Plus size={16}/>New Project</Link>}/>
    {err&&<div className="notice">{err}</div>}
    {projects.length?<div className="cards">{projects.map(p=><Link className="card" key={p.id} to={`/projects/${p.id}/overview`} onClick={()=>setProject(p)}><div className="cardIcon"><ServerCog size={18}/></div><h3>{p.projectName}</h3><p>{p.backend} · {p.database}</p><small>{p.tables?.length||0} tables · {p.apis?.length||0} APIs</small></Link>)}</div>
    :<Empty title="No projects" text="Create your first visual backend definition." action={<Link className="btn primary" to="/projects/new"><Plus size={16}/>Create Project</Link>}/>}
  </>
}

function NewProject(){
  const nav=useNavigate(),setProject=store(s=>s.setProject),[name,setName]=useState(""),[description,setDescription]=useState(""),[db,setDb]=useState("MYSQL");
  async function createProject(e){
    e.preventDefault();if(!name.trim())return;
    const p=newProject(name);p.description=description;p.database=db;
    try{const r=await projectService.create(p);const saved=r.data.data;setProject(saved);nav(`/projects/${saved.id}/overview`);}
    catch{setProject(p);nav(`/projects/${p.id}/overview`);}
  }
  return <div className="narrow"><Header eyebrow="PROJECT" title="Create Project"/>
    <form className="panel form" onSubmit={createProject}><Field label="Project Name"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Insurance Backend"/></Field>
      <Field label="Description"><textarea rows="3" value={description} onChange={e=>setDescription(e.target.value)}/></Field>
      <div className="two"><Field label="Backend"><select defaultValue="SPRING_BOOT"><option>SPRING_BOOT</option></select></Field><Field label="Database"><select value={db} onChange={e=>setDb(e.target.value)}>{DBS.map(x=><option key={x}>{x}</option>)}</select></Field></div>
      <Btn primary><ServerCog size={15}/>Create Project</Btn>
    </form>
  </div>
}

function ProjectPage({page}){
  const p=store(s=>s.project),patch=store(s=>s.patch);if(!p)return <Empty title="Project not loaded" text="Open a project first." action={<Link className="btn" to="/">Projects</Link>}/>;
  if(page==="overview")return <Overview p={p}/>;
  if(page==="database")return <DatabasePage p={p} patch={patch}/>;
  if(page==="tables")return <Tables p={p} patch={patch}/>;
  if(page==="relationships")return <Relations p={p} patch={patch}/>;
  if(page==="apis")return <ApiDesigner p={p} patch={patch}/>;
  if(page==="tester")return <ApiTester p={p}/>;
  if(page==="files")return <FilePage p={p} patch={patch}/>;
  if(page==="payments")return <PaymentPage p={p} patch={patch}/>;
  if(page==="external")return <ExternalPage p={p} patch={patch}/>;
  if(page==="rules")return <Rules p={p} patch={patch}/>;
  if(page==="workflow")return <WorkflowPage p={p} patch={patch}/>;
  if(page==="messages")return <MessagePage p={p} patch={patch}/>;
  if(page==="security")return <Security p={p} patch={patch}/>;
  if(page==="exceptions")return <ExceptionPage p={p} patch={patch}/>;
  if(page==="data")return <TransferPage p={p} patch={patch}/>;
  if(page==="reports")return <ReportPage p={p} patch={patch}/>;
  if(page==="audit")return <AuditPage p={p} patch={patch}/>;
  if(page==="observability")return <Observability p={p} patch={patch}/>;
  if(page==="codegen")return <CodeGen p={p} patch={patch}/>;
  return <Metadata p={p}/>;
}

function Overview({p}){return <><Header eyebrow="FINAL PLATFORM" title={p.projectName} action={<Link className="btn primary" to={`/projects/${p.id}/codegen`}>Generate Code<ArrowRight size={15}/></Link>}/>
  <div className="statGrid">{[
    ["Tables",p.tables.length],["Fields",p.tables.reduce((n,t)=>n+t.fields.length,0)],["APIs",p.apis.length],["Rules",p.businessRules.length],["Workflows",p.workflows.length],["Integrations",p.integrations.length],["Roles",p.security.roles.length],["Audit",p.audit.enabled?"ON":"OFF"]
  ].map(x=><div className="stat" key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></div>)}</div>
  <div className="panel"><h2>Final Phase Scope</h2><p>Schema → API → file/payment/external integrations → business rules → workflow → security/RBAC → exception contract → import/→ reports → audit → observability → Spring Boot code generation.</p></div>
</>}

function DatabasePage({p,patch}){return <><Header eyebrow="CORE" title="Database & Runtime"/>
  <div className="panel"><div className="two"><Field label="Database"><select value={p.database} onChange={e=>patch({database:e.target.value})}>{DBS.map(x=><option key={x}>{x}</option>)}</select></Field>
    <Field label="Port"><input type="number" value={p.application.port} onChange={e=>patch({application:{...p.application,port:+e.target.value}})}/></Field>
    <Field label="Base URL"><input value={p.application.baseUrl} onChange={e=>patch({application:{...p.application,baseUrl:e.target.value}})}/></Field>
    <Field label="Package"><input value={p.packageName} onChange={e=>patch({packageName:e.target.value})}/></Field></div>
  </div></>}

function Tables({p,patch}){
  const [active,setActive]=useState(0),t=p.tables[active];
  const updateTables=tables=>patch({tables});
  const add=()=>{updateTables([...p.tables,table(`table_${p.tables.length+1}`)]);setActive(p.tables.length)};
  const update=(i,v)=>updateTables(p.tables.map((x,n)=>n===i?v:x));
  function validation(f,i){
    const v=f.validations,setF=n=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?n:x)});
    return <div className="validation"><b>Validation</b><div className="checks"><label><input type="checkbox" checked={v.required} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,validations:{...v,required:e.target.checked}}:x)})}/>Required</label>
      <label><input type="checkbox" checked={v.email} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,validations:{...v,email:e.target.checked}}:x)})}/>Email</label>
      <label><input type="checkbox" checked={f.unique} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,unique:e.target.checked}:x)})}/>Unique</label></div>
      <div className="three"><Field label="Min Length"><input value={v.minLength} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,validations:{...v,minLength:e.target.value}}:x)})}/></Field>
      <Field label="Max Length"><input value={v.maxLength} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,validations:{...v,maxLength:e.target.value}}:x)})}/></Field>
      <Field label="Regex"><input value={v.pattern} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,validations:{...v,pattern:e.target.value}}:x)})}/></Field></div></div>
  }
  return <><Header eyebrow="CORE" title="Tables & Fields" action={<Btn primary onClick={add}><Plus size={15}/>New Table</Btn>}/>
    <div className="workspace"><aside className="panel list">{p.tables.map((x,i)=><button className={active===i?"selected":""} onClick={()=>setActive(i)} key={x.id}>{x.name}<span>{x.fields.length}</span></button>)}</aside>
    <section><div className="panel"><div className="two"><Field label="Table Name"><input value={t.name} onChange={e=>update(active,{...t,name:e.target.value})}/></Field><Field label="Description"><input value={t.description} onChange={e=>update(active,{...t,description:e.target.value})}/></Field></div>
      <div className="checks">{Object.keys(t.crud).map(k=><label key={k}><input type="checkbox" checked={t.crud[k]} onChange={e=>update(active,{...t,crud:{...t.crud,[k]:e.target.checked}})}/>{k}</label>)}</div></div>
      <div className="panel"><div className="sectionHead"><h2>Fields</h2><Btn onClick={()=>update(active,{...t,fields:[...t.fields,field(`field${t.fields.length+1}`)]})}><Plus size={14}/>Field</Btn></div>
        {t.fields.map((f,i)=><div className="fieldCard" key={f.id}><div className="fieldRow"><input value={f.name} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,name:e.target.value}:x)})}/>
          <select value={f.type} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,type:e.target.value}:x)})}>{TYPES.map(x=><option key={x}>{x}</option>)}</select>
          <label><input type="checkbox" checked={f.primaryKey} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,primaryKey:e.target.checked}:x)})}/>PK</label>
          <label><input type="checkbox" checked={f.autoIncrement} onChange={e=>update(active,{...t,fields:t.fields.map((x,n)=>n===i?{...x,autoIncrement:e.target.checked}:x)})}/>Auto</label>
          <button className="icon danger" onClick={()=>update(active,{...t,fields:t.fields.filter((_,n)=>n!==i)})}><Trash2 size={14}/></button></div>{validation(f,i)}</div>)}</div>
    </section></div></>}

function Relations({p,patch}){const add=()=>patch({relationships:[...p.relationships,{id:uid("rel"),fromTable:p.tables[0]?.name||"",toTable:p.tables[1]?.name||"",type:"ONE_TO_MANY",fromField:"id",toField:"id"}]});return <><Header eyebrow="CORE" title="Relationships" action={<Btn primary onClick={add}><Plus size={15}/>Relationship</Btn>}/>{p.relationships.map((r,i)=><div className="panel relation" key={r.id}><select value={r.fromTable} onChange={e=>patch({relationships:p.relationships.map((x,n)=>n===i?{...x,fromTable:e.target.value}:x)})}>{p.tables.map(t=><option key={t.id}>{t.name}</option>)}</select><select value={r.type} onChange={e=>patch({relationships:p.relationships.map((x,n)=>n===i?{...x,type:e.target.value}:x)})}><option>ONE_TO_ONE</option><option>ONE_TO_MANY</option><option>MANY_TO_ONE</option><option>MANY_TO_MANY</option></select><select value={r.toTable} onChange={e=>patch({relationships:p.relationships.map((x,n)=>n===i?{...x,toTable:e.target.value}:x)})}>{p.tables.map(t=><option key={t.id}>{t.name}</option>)}</select></div>)}</>}

function ApiDesigner({p,patch}){
  const [active,setActive]=useState(0),a=p.apis[active];
  const upd=(x)=>patch({apis:p.apis.map((v,n)=>n===active?{...v,...x}:v)});
  const add=()=>{patch({apis:[...p.apis,apiDef(p.application.baseUrl)]});setActive(p.apis.length)};
  if(!a)return <Empty title="No API" text="" action={<Btn primary onClick={add}><Plus/>API</Btn>}/>;
  const params=(key,title)=> <div className="sub"><div className="sectionHead"><h3>{title}</h3><Btn onClick={()=>upd({[key]:[...a[key],{id:uid("param"),name:"param",type:"STRING",required:false,defaultValue:""}]})}><Plus size={13}/>Add</Btn></div>{a[key].map((x,i)=><div className="paramRow" key={x.id}><input value={x.name} onChange={e=>upd({[key]:a[key].map((v,n)=>n===i?{...v,name:e.target.value}:v)})}/><select value={x.type} onChange={e=>upd({[key]:a[key].map((v,n)=>n===i?{...v,type:e.target.value}:v)})}>{TYPES.slice(0,12).map(t=><option key={t}>{t}</option>)}</select><label><input type="checkbox" checked={x.required} onChange={e=>upd({[key]:a[key].map((v,n)=>n===i?{...v,required:e.target.checked}:v)})}/>Required</label><button className="icon danger" onClick={()=>upd({[key]:a[key].filter((_,n)=>n!==i)})}><Trash2 size={13}/></button></div>)}</div>;
  return <><Header eyebrow="API DESIGN" title="API Contract Designer" action={<Btn primary onClick={add}><Plus size={15}/>New API</Btn>}/><div className="workspace"><aside className="panel list">{p.apis.map((x,i)=><button className={active===i?"selected":""} onClick={()=>setActive(i)} key={x.id}><b>{x.method}</b> {x.name}</button>)}</aside><section>
    <div className="panel"><div className="two"><Field label="Name"><input value={a.name} onChange={e=>upd({name:e.target.value})}/></Field><Field label="Type"><select value={a.type} onChange={e=>upd({type:e.target.value})}>{API_TYPES.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Method"><select value={a.method} onChange={e=>upd({method:e.target.value})}>{METHODS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Path"><input value={a.path} onChange={e=>upd({path:e.target.value})}/></Field><Field label="Auth"><select value={a.auth} onChange={e=>upd({auth:e.target.value})}>{AUTH.map(x=><option key={x}>{x}</option>)}</select></Field></div>{params("pathParams","Path Parameters")}{params("queryParams","Query Parameters")}{params("headers","Headers")}</div>
    <div className="panel"><h2>Request / Response</h2><div className="two"><Field label="Request Content Type"><select value={a.request.contentType} onChange={e=>upd({request:{...a.request,contentType:e.target.value}})}>{CONTENT_TYPES.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Response Status"><input type="number" value={a.response.status} onChange={e=>upd({response:{...a.response,status:+e.target.value}})}/></Field></div></div>
  </section></div></>}

function ApiTester({p}){const [i,setI]=useState(0),[body,setBody]=useState("{}"),[result,setResult]=useState(""),a=p.apis[i];async function send(){try{const r=await fetch(a.path.startsWith("http")?a.path:`http://localhost:8080${a.path}`,{method:a.method,headers:{"Content-Type":a.request.contentType},body:["POST","PUT","PATCH"].includes(a.method)?body:undefined});const data=await r.text();let parsed=data;try{parsed=JSON.parse(data)}catch{}setResult(JSON.stringify({status:r.status,data:parsed},null,2));}catch(e){setResult(JSON.stringify({status:e.response?.status||0,error:e.response?.data||e.message},null,2));}}return <><Header eyebrow="DEVELOPER TOOL" title="API Tester"/><div className="panel"><Field label="API"><select value={i} onChange={e=>setI(+e.target.value)}>{p.apis.map((x,n)=><option value={n} key={x.id}>{x.method} {x.path}</option>)}</select></Field><Field label="JSON Body"><textarea rows="8" value={body} onChange={e=>setBody(e.target.value)}/></Field><Btn primary onClick={send}><TestTube2 size={15}/>Send</Btn></div><pre className="json">{result||"Response will appear here."}</pre></>}

function FilePage({p,patch}){const [a,setA]=useState(p.apis.find(x=>x.type==="FILE_UPLOAD")||p.apis[0]);function save(){patch({apis:p.apis.map(x=>x.id===a.id?a:x)});}return <><Header eyebrow="INTEGRATION" title="File Upload"/><div className="panel"><div className="two"><Field label="API"><select value={a.id} onChange={e=>setA(p.apis.find(x=>x.id===e.target.value))}>{p.apis.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Encoding"><select value={a.file.encoding} onChange={e=>setA({...a,file:{...a.file,encoding:e.target.value}})}>{FILE_ENCODINGS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Max Size MB"><input type="number" value={a.file.maxSizeMb} onChange={e=>setA({...a,file:{...a.file,maxSizeMb:+e.target.value}})}/></Field><Field label="Allowed Extensions"><input value={a.file.allowedExtensions} onChange={e=>setA({...a,file:{...a.file,allowedExtensions:e.target.value}})}/></Field></div><Btn primary onClick={save}><Save size={14}/>Save File Config</Btn></div></>}

function PaymentPage({p,patch}){const [cfg,setCfg]=useState(p.apis[0].payment);const [apiId,setApiId]=useState(p.apis[0].id);function save(){patch({apis:p.apis.map(x=>x.id===apiId?{...x,payment:cfg,type:"PAYMENT"}:x)});}return <><Header eyebrow="INTEGRATION" title="Payment Integration"/><div className="panel"><div className="two"><Field label="API"><select value={apiId} onChange={e=>{setApiId(e.target.value);setCfg(p.apis.find(x=>x.id===e.target.value).payment)}}>{p.apis.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Provider"><select value={cfg.provider} onChange={e=>setCfg({...cfg,provider:e.target.value})}><option>RAZORPAY</option><option>STRIPE</option><option>PAYPAL</option><option>CUSTOM</option></select></Field><Field label="Operation"><select value={cfg.operation} onChange={e=>setCfg({...cfg,operation:e.target.value})}><option>CREATE_ORDER</option><option>VERIFY_PAYMENT</option><option>REFUND</option><option>STATUS</option></select></Field><Field label="Secret Reference"><input value={cfg.secretRef} onChange={e=>setCfg({...cfg,secretRef:e.target.value})}/></Field></div><Btn primary onClick={save}><Save size={14}/>Save Payment Metadata</Btn></div></>}

function ExternalPage({p,patch}){const [apiId,setApiId]=useState(p.apis[0].id),[cfg,setCfg]=useState(p.apis[0].external);function save(){patch({apis:p.apis.map(x=>x.id===apiId?{...x,type:"EXTERNAL",external:cfg}:x)});}return <><Header eyebrow="INTEGRATION" title="External API"/><div className="panel"><div className="two"><Field label="API"><select value={apiId} onChange={e=>{setApiId(e.target.value);setCfg(p.apis.find(x=>x.id===e.target.value).external)}}>{p.apis.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field><Field label="Target URL"><input value={cfg.url} onChange={e=>setCfg({...cfg,url:e.target.value})}/></Field><Field label="Method"><select value={cfg.method} onChange={e=>setCfg({...cfg,method:e.target.value})}>{METHODS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Timeout (ms)"><input type="number" value={cfg.timeoutMs} onChange={e=>setCfg({...cfg,timeoutMs:+e.target.value})}/></Field><Field label="Retries"><input type="number" value={cfg.retries} onChange={e=>setCfg({...cfg,retries:+e.target.value})}/></Field></div><Btn primary onClick={save}><Save size={14}/>Save External API</Btn></div></>}

function Rules({p,patch}){const add=()=>patch({businessRules:[...p.businessRules,{id:uid("rule"),name:"Rule",table:p.tables[0]?.name||"",field:"id",operator:"EQUALS",value:"",action:"THROW_EXCEPTION",message:"Rule failed",enabled:true}]});return <><Header eyebrow="LOGIC" title="Business Rules" action={<Btn primary onClick={add}><Plus size={15}/>New Rule</Btn>}/>{p.businessRules.map((r,i)=><div className="panel" key={r.id}><div className="three"><Field label="Name"><input value={r.name} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,name:e.target.value}:x)})}/></Field><Field label="Field"><input value={r.field} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,field:e.target.value}:x)})}/></Field><Field label="Operator"><select value={r.operator} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,operator:e.target.value}:x)})}>{RULE_OPS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Value"><input value={r.value} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,value:e.target.value}:x)})}/></Field><Field label="Action"><select value={r.action} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,action:e.target.value}:x)})}>{RULE_ACTIONS.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Message"><input value={r.message} onChange={e=>patch({businessRules:p.businessRules.map((x,n)=>n===i?{...x,message:e.target.value}:x)})}/></Field></div></div>)}</>}

function WorkflowPage({p,patch}){const add=()=>patch({workflows:[...p.workflows,{id:uid("wf"),name:"Customer Workflow",enabled:true,steps:["VALIDATE","SAVE","NOTIFY"]}]});return <><Header eyebrow="LOGIC" title="Workflow Designer" action={<Btn primary onClick={add}><Plus size={15}/>New Workflow</Btn>}/>{p.workflows.map((w,i)=><div className="panel" key={w.id}><Field label="Workflow Name"><input value={w.name} onChange={e=>patch({workflows:p.workflows.map((x,n)=>n===i?{...x,name:e.target.value}:x)})}/></Field><div className="workflow">{w.steps.map((s,n)=><span key={n}>{n+1}. {s}</span>)}</div></div>)}</>}

function MessagePage({p,patch}){const add=()=>patch({integrations:[...p.integrations,{id:uid("msg"),type:"EMAIL",template:"Hello {{name}}",toField:"email"}]});return <><Header eyebrow="INTEGRATION" title="Email / SMS / Notification" action={<Btn primary onClick={add}><Plus size={15}/>Add Message</Btn>}/>{p.integrations.map((x,i)=><div className="panel" key={x.id}><div className="three"><Field label="Type"><select value={x.type} onChange={e=>patch({integrations:p.integrations.map((v,n)=>n===i?{...v,type:e.target.value}:v)})}><option>EMAIL</option><option>SMS</option><option>NOTIFICATION</option><option>WHATSAPP</option></select></Field><Field label="To Field"><input value={x.toField} onChange={e=>patch({integrations:p.integrations.map((v,n)=>n===i?{...v,toField:e.target.value}:v)})}/></Field><Field label="Template"><input value={x.template} onChange={e=>patch({integrations:p.integrations.map((v,n)=>n===i?{...v,template:e.target.value}:v)})}/></Field></div></div>)}</>}

function Security({p,patch}){const s=p.security,add=()=>patch({security:{...s,roles:[...s.roles,{id:uid("role"),name:"USER",permissions:["READ"]}]}});return <><Header eyebrow="SECURITY" title="Authentication & RBAC"/><div className="panel"><Field label="Authentication"><select value={s.authentication} onChange={e=>patch({security:{...s,authentication:e.target.value}})}>{AUTH.map(x=><option key={x}>{x}</option>)}</select></Field></div><div className="panel"><div className="sectionHead"><h2>Roles</h2><Btn onClick={add}><Plus size={14}/>Role</Btn></div>{s.roles.map((r,i)=><div className="role" key={r.id}><input value={r.name} onChange={e=>patch({security:{...s,roles:s.roles.map((x,n)=>n===i?{...x,name:e.target.value}:x)}})}/><div className="checks">{PERMS.map(per=><label key={per}><input type="checkbox" checked={r.permissions.includes(per)} onChange={e=>patch({security:{...s,roles:s.roles.map((x,n)=>n===i?{...x,permissions:e.target.checked?[...new Set([...x.permissions,per])]:x.permissions.filter(v=>v!==per)}:x)}})}/>{per}</label>)}</div></div>)}</div></>}

function ExceptionPage({p,patch}){const e=p.exceptionHandling;return <><Header eyebrow="ERROR CONTRACT" title="Global Exception Handling"/><div className="panel"><div className="three"><Field label="Status Key"><input value={e.response.status} onChange={x=>patch({exceptionHandling:{...e,response:{...e.response,status:x.target.value}}})}/></Field><Field label="Message Key"><input value={e.response.status_message} onChange={x=>patch({exceptionHandling:{...e,response:{...e.response,status_message:x.target.value}}})}/></Field><Field label="Data Key"><input value={e.response.data} onChange={x=>patch({exceptionHandling:{...e,response:{...e.response,data:x.target.value}}})}/></Field></div><pre className="json">{JSON.stringify({status:"success",status_message:"message",data:{}},null,2)}</pre></div></>}

function TransferPage({p,patch}){const [format,setFormat]=useState("CSV");const add=()=>patch({integrations:[...p.integrations,{id:uid("transfer"),type:"DATA_TRANSFER",format,validateRows:true,continueOnError:false}]});return <><Header eyebrow="DATA" title="Import / Export" action={<Btn primary onClick={add}><Plus size={15}/>Configure</Btn>}/><div className="panel"><div className="two"><Field label="Format"><select value={format} onChange={e=>setFormat(e.target.value)}><option>CSV</option><option>EXCEL</option><option>JSON</option></select></Field><Field label="Validation"><select defaultValue="STRICT"><option>STRICT</option><option>LENIENT</option></select></Field></div></div></>}

function ReportPage({p,patch}){const [group,setGroup]=useState("status"),[agg,setAgg]=useState("count(id),sum(amount)");return <><Header eyebrow="DATA" title="Report Designer"/><div className="panel"><div className="two"><Field label="Group By"><input value={group} onChange={e=>setGroup(e.target.value)}/></Field><Field label="Aggregations"><input value={agg} onChange={e=>setAgg(e.target.value)}/></Field></div><Btn primary onClick={()=>patch({integrations:[...p.integrations,{id:uid("report"),type:"REPORT",groupBy:group,aggregations:agg.split(",").map(x=>x.trim())}]})}><Save size={14}/>Save Report</Btn></div></>}

function AuditPage({p,patch}){return <><Header eyebrow="OPS" title="Audit Logging"/><div className="panel"><label><input type="checkbox" checked={p.audit.enabled} onChange={e=>patch({audit:{...p.audit,enabled:e.target.checked}})}/> Enable audit logging</label><p>Capture who, action, API, entity, old value, new value, timestamp and correlation ID.</p></div></>}

function Observability({p,patch}){const o=p.observability;const toggle=k=>patch({observability:{...o,[k]:!o[k]}});return <><Header eyebrow="OPS" title="Observability"/><div className="panel"><div className="checks">{Object.keys(o).map(k=><label key={k}><input type="checkbox" checked={o[k]} onChange={()=>toggle(k)}/>{k}</label>)}</div><p>Spring Boot Actuator, structured logs, metrics, health and correlation metadata are generated from this configuration.</p></div></>}

function CodeGen({p,patch}){const [preview,setPreview]=useState("");async function generate(){try{const r=await projectService.generate(p.id,p);setPreview(r.data?.data?.preview||JSON.stringify(r.data?.data||r.data,null,2));}catch{setPreview(`// Spring Boot preview\n// Project: ${p.projectName}\n// Tables: ${p.tables.map(t=>t.name).join(", ")}\n// APIs: ${p.apis.map(a=>a.method+" "+a.path).join(", ")}\n// Rules: ${p.businessRules.length}\n// Security: ${p.security.authentication}\n\n// Backend generator endpoint is ready to be extended with ZIP generation.`);}}return <><Header eyebrow="CODEGEN" title="Spring Boot Code Generator" action={<Btn primary onClick={generate}><RefreshCw size={14}/>Generate Preview</Btn>}/><div className="panel"><div className="two"><Field label="Language"><select><option>JAVA</option></select></Field><Field label="Framework"><select><option>SPRING_BOOT</option></select></Field><Field label="Package"><input value={p.packageName} onChange={e=>patch({packageName:e.target.value})}/></Field></div></div><pre className="code">{preview||"Click Generate Preview."}</pre></>}

function Metadata({p}){const json=JSON.stringify(p,null,2);function download(){const b=new Blob([json],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="project-metadata.json";a.click();URL.revokeObjectURL(u)}return <><Header eyebrow="CODEGEN" title="Universal Metadata" action={<Btn primary onClick={download}><Download size={14}/>Export JSON</Btn>}/><pre className="json">{json}</pre></>}

function SaveBar(){const p=store(s=>s.project),[msg,setMsg]=useState("");async function save(){try{await projectService.update(p.id,p);setMsg("Saved to Spring Boot backend.");}catch{setMsg("Backend unavailable — current design remains in UI memory.");}setTimeout(()=>setMsg(""),2500)}return p?<div className="savebar">{msg&&<span>{msg}</span>}<Btn primary onClick={save}><Save size={14}/>Save Project</Btn></div>:null}


function App(){
  return <BrowserRouter>
    <Routes>
      <Route element={<><Layout/><SaveBar/></>}>
        <Route path="/" element={<Dashboard/>}/>
        <Route path="/projects/new" element={<NewProject/>}/>
        <Route path="/projects/:id/:page" element={<ProjectRoute/>}/>
      </Route>
    </Routes>
  </BrowserRouter>;
}

function ProjectRoute(){
  const location = window.location.pathname;
  const page = location.split("/").pop();
  return <ProjectPage page={page}/>;
}

export default App;
