const STORAGE_KEY = "angelaNgetichPortfolio_v1";
const starterProjects = [
  {id:"sample-1",title:"A portrait in the afternoon",category:"photography",date:"2026-11-01",description:"A personal visual moment, captured in natural light.",media:"assets/angela-2.jpg",type:"image",sample:true},
  {id:"sample-2",title:"The art of perspective",category:"photography",date:"2026-11-02",description:"A frame that celebrates colour, culture and expression.",media:"assets/angela-3.jpg",type:"image",sample:true},
  {id:"sample-3",title:"Meet the storyteller",category:"interviews",date:"2026-11-03",description:"A glimpse into the person behind the stories.",media:"assets/angela-1.jpg",type:"image",sample:true}
];
let projects = loadProjects();
let activeFilter = "all";
const $ = s => document.querySelector(s);
const grid = $("#galleryGrid"), dialog = $("#projectDialog"), form = $("#projectForm");
function loadProjects(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(saved)?saved:starterProjects.slice()}catch{return starterProjects.slice()}}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(projects))}catch(e){showToast("Storage is full. Try a smaller media file.");}}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function categoryName(c){return ({photography:"Photography",video:"Video",articles:"Articles",interviews:"Interviews"})[c]||c}
function renderGallery(){
  const term=$("#gallerySearch").value.trim().toLowerCase();
  const shown=projects.filter(p=>(activeFilter==="all"||p.category===activeFilter)&&(`${p.title} ${p.description} ${p.category}`).toLowerCase().includes(term));
  $("#countAll").textContent=projects.length;
  grid.innerHTML=shown.map((p,i)=>`<article class="gallery-card" style="animation-delay:${i*55}ms">
    <div class="gallery-media" data-preview="${escapeHTML(p.id)}">${p.type==="video"?`<video src="${p.media}" muted preload="metadata"></video>`:`<img src="${p.media}" alt="${escapeHTML(p.title)}" loading="lazy">`}<span class="media-type">${p.type==="video"?"▶ VIDEO":categoryName(p.category).toUpperCase()}</span></div>
    <div class="gallery-info"><div class="gallery-meta"><span>${categoryName(p.category)}</span><span>${p.date?new Date(p.date+"T00:00:00").toLocaleDateString(undefined,{month:"short",year:"numeric"}):"PROJECT"}</span></div><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.description||"A project from Angela's portfolio.")}</p><div class="card-actions"><button class="mini-btn" data-edit="${escapeHTML(p.id)}">✎ Edit</button><button class="mini-btn delete" data-delete="${escapeHTML(p.id)}">× Delete</button></div></div>
  </article>`).join("");
  $("#emptyState").hidden=shown.length!==0;
}
function showToast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
function openForm(project){
  form.reset();$("#projectId").value=project?.id||"";$("#dialogTitle").textContent=project?"Edit project":"Add a project";$("#projectTitle").value=project?.title||"";$("#projectCategory").value=project?.category||"photography";$("#projectDate").value=project?.date||new Date().toISOString().slice(0,10);$("#projectDescription").value=project?.description||"";$("#formError").textContent="";$("#projectFile").required=!project;
  dialog.showModal();$("#projectTitle").focus();
}
function closeForm(){dialog.close()}
function dataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
form.addEventListener("submit",async e=>{
  e.preventDefault();const id=$("#projectId").value,existing=projects.find(p=>p.id===id),file=$("#projectFile").files[0];
  if(!existing&&!file){$("#formError").textContent="Please choose an image or video for this project.";return}
  if(file&&file.size>35*1024*1024){$("#formError").textContent="Please choose a file smaller than 35 MB.";return}
  const save=$("#saveProject");save.disabled=true;save.textContent="Saving…";
  try{
    let media=existing?.media||"",type=existing?.type||"image";
    if(file){media=await dataURL(file);type=file.type.startsWith("video/")?"video":"image"}
    const item={id:id||("project-"+Date.now()),title:$("#projectTitle").value.trim(),category:$("#projectCategory").value,date:$("#projectDate").value,description:$("#projectDescription").value.trim(),media,type};
    if(existing)projects=projects.map(p=>p.id===id?item:p);else projects.unshift(item);
    persist();renderGallery();closeForm();showToast(existing?"Project updated.":"Project added to your gallery.");
  }catch(err){$("#formError").textContent="Could not read that file. Please try another."}
  finally{save.disabled=false;save.textContent="Save project ↗"}
});
function deleteProject(id){const p=projects.find(x=>x.id===id);if(!p)return;if(!confirm(`Delete “${p.title}” from the gallery? This cannot be undone.`))return;projects=projects.filter(x=>x.id!==id);persist();renderGallery();showToast("Project deleted.");}
function previewProject(id){const p=projects.find(x=>x.id===id);if(!p)return;$("#previewContent").innerHTML=p.type==="video"?`<video src="${p.media}" controls autoplay playsinline></video>`:`<img src="${p.media}" alt="${escapeHTML(p.title)}">`;$("#previewCaption").textContent=p.title;$("#previewDialog").showModal()}
grid.addEventListener("click",e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]"),preview=e.target.closest("[data-preview]");if(edit)openForm(projects.find(p=>p.id===edit.dataset.edit));else if(del)deleteProject(del.dataset.delete);else if(preview)previewProject(preview.dataset.preview)});
$("#openUpload").addEventListener("click",()=>openForm());$("#emptyUpload").addEventListener("click",()=>openForm());$("#closeDialog").addEventListener("click",closeForm);$("#cancelDialog").addEventListener("click",closeForm);$("#closePreview").addEventListener("click",()=>$("#previewDialog").close());
$("#previewDialog").addEventListener("close",()=>{$("#previewContent").innerHTML=""});
document.querySelectorAll(".filter-btn").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));btn.classList.add("active");activeFilter=btn.dataset.filter;renderGallery()}));
$("#gallerySearch").addEventListener("input",renderGallery);
$("#menuToggle").addEventListener("click",()=>{const open=$("#mainNav").classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",String(open))});
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>{$("#mainNav").classList.remove("open");$("#menuToggle").setAttribute("aria-expanded","false")}));
$("#year").textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
renderGallery();
