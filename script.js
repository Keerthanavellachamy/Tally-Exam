/* AURA SmartExam - shared script for index.html (student) and faculty.html */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const CFG={total:100,mins:60,wa:'917339044193',inst:'AURA Institute & Technology'};

/* ---- Theme (saved in localStorage, works on every page) ---- */
function setTheme(t){document.documentElement.dataset.theme=t;LS.set('aura_theme',t);const b=$('#themeBtn'),l=t==='dark'?'Switch to light mode':'Switch to dark mode';b.textContent=t==='dark'?'☀️':'🌙';b.setAttribute('aria-label',l);b.title=l}
setTheme(LS.get('aura_theme','dark'));
$('#themeBtn').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');

/* ---- Scoring (key is in questions.js, separate from the question list) ---- */
function score(ans){let c=0,w=0;QUESTIONS.forEach(q=>{const a=ans[q.id];if(a)a===ANSWER_KEY[q.id]?c++:w++});return{correct:c,incorrect:w,attempted:c+w,unanswered:QUESTIONS.length-c-w,marks:c,pct:+(c/QUESTIONS.length*100).toFixed(1)}}

/* ---- Faculty report + WhatsApp (shared by student and faculty pages) ---- */
const fdate=t=>new Date(t).toLocaleString('en-IN');
function repText(r){return [CFG.inst,'Tally Prime Certification Test - Faculty Report','Student Name: '+r.name,'Registration Number: '+r.reg,'Submitted: '+fdate(r.time),'Total Questions: '+CFG.total,'Attempted: '+r.attempted,'Unanswered: '+r.unanswered,'Correct: '+r.correct,'Incorrect: '+r.incorrect,'Total Marks: '+r.marks+' / 100','Percentage: '+r.pct+'%','','Q.No | Selected | Correct Answer | Result',...QUESTIONS.map(q=>{const a=r.ans[q.id],k=ANSWER_KEY[q.id];return q.id+' | '+(a||'Unanswered')+' | '+k+' | '+(!a?'Unanswered':a===k?'Correct':'Incorrect')})].join('\n')}
function dl(r){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([repText(r)],{type:'text/plain'}));a.download='AURA_SmartExam_Report_'+r.reg.replace(/[^A-Za-z0-9_-]/g,'_')+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function waUrl(r){const head=['*'+CFG.inst+'*','Tally Prime Certification Test','Student: '+r.name,'Registration No: '+r.reg,'Submitted: '+fdate(r.time),'Total Marks: '+r.marks+' / 100','Percentage: '+r.pct+'%','Correct: '+r.correct+' | Incorrect: '+r.incorrect,'Attempted: '+r.attempted+' | Unanswered: '+r.unanswered].join('\n'),base='https://wa.me/'+CFG.wa+'?text=';
 const note='\n\nThe complete report (with correct answers) is a separate downloadable file. It is NOT attached to this message.';
 let url=base+encodeURIComponent(head+'\n\nAnswer summary (- = unanswered): '+QUESTIONS.map(q=>q.id+(r.ans[q.id]||'-')).join(' ')+note);
 if(url.length>1900){const un=QUESTIONS.filter(q=>!r.ans[q.id]).map(q=>q.id).join(', ');url=base+encodeURIComponent(head+'\n\nConcise summary - unanswered Q.Nos: '+(un||'none')+note)}
 return url}

/* ================= STUDENT SITE ================= */
if($('#home')){
let S=LS.get('aura_session',null),cur=0,timer=null,inExam=false;
const save=()=>LS.set('aura_session',S);
function show(v){$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));document.body.dataset.view=v;inExam=v==='exam';scrollTo(0,0)}
$('#getStarted').onclick=()=>{show('login');$('#name').focus()};
$('#homeLink').onclick=e=>{if(!$('#home').classList.contains('on')){e.preventDefault();show('home')}};

$('#loginForm').onsubmit=e=>{e.preventDefault();const n=$('#name').value.trim(),r=$('#reg').value.trim().toUpperCase(),er=$('#lerr');
 if(!n){er.textContent='Please enter your student name.';return}
 if(!r){er.textContent='Please enter your registration number.';return}
 if(LS.get('aura_reports',[]).some(x=>x.reg===r)){er.textContent='An examination has already been submitted for this registration number.';return}
 er.textContent='';S={name:n,reg:r,ans:{},rev:{},vis:{},end:0,done:false};save();
 const w=$('#welcome');w.textContent='Welcome, '+n+'! Login successful (simulated). Opening instructions…';w.hidden=false;
 setTimeout(()=>{$('#iWho').textContent='Student: '+n+' | Reg. No: '+r;show('instr')},1300)};

$('#startBtn').onclick=()=>{if(S.end)return;$('#startBtn').disabled=true;$('#starting').classList.add('on');setTimeout(()=>{$('#starting').classList.remove('on');S.start=Date.now();S.end=S.start+CFG.mins*60000;S.cur=0;save();begin()},1400)};
function begin(){cur=S.cur||0;show('exam');$('#hStudent').textContent=S.name+' ('+S.reg+')';buildGrid();render();timer=setInterval(tick,500);tick()}
function tick(){const left=Math.max(0,S.end-Date.now()),m=Math.floor(left/60000),s=Math.floor(left%60000/1000),low=left<=300000;
 $('#timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');$('#timer').classList.toggle('low',low);
 $('#hStatus').textContent=low?'⚠ Last 5 minutes':'● In Progress';$('#hStatus').classList.toggle('low',low);
 if(left<=0){clearInterval(timer);submit()}}

/* ---- Question display ---- */
const st=id=>{const a=S.ans[id],r=S.rev[id];return a&&r?'ar':a?'ans':r?'rv':S.vis[id]?'na':'nv'};
function buildGrid(){const g=$('#grid');g.innerHTML='';QUESTIONS.forEach((q,i)=>{const b=document.createElement('button');b.className='qn';b.type='button';b.textContent=i+1;b.setAttribute('aria-label','Go to question '+(i+1));b.onclick=()=>{cur=i;render()};g.appendChild(b)})}
function render(anim=true){const q=QUESTIONS[cur];S.vis[q.id]=1;S.cur=cur;save();
 $('#qno').textContent='Question '+(cur+1)+' of '+QUESTIONS.length;$('#qtext').textContent=q.question;
 if(anim){const b=$('#qbox');b.classList.remove('in');void b.offsetWidth;b.classList.add('in')}
 const o=$('#opts');o.innerHTML='';
 Object.entries(q.options).forEach(([k,t])=>{const l=document.createElement('label');l.className='opt'+(S.ans[q.id]===k?' sel':'');
  l.innerHTML='<input type="radio" name="a" value="'+k+'"'+(S.ans[q.id]===k?' checked':'')+'><b></b><span></span>';$('b',l).textContent=k;$('span',l).textContent=t;
  $('input',l).onchange=()=>{S.ans[q.id]=k;save();render(false)};o.appendChild(l)});
 $('#prev').disabled=cur===0;$('#next').disabled=cur===QUESTIONS.length-1;$('#mark').textContent=S.rev[q.id]?'Unmark Review':'Mark for Review';
 const A=Object.values(S.ans).filter(Boolean).length,R=Object.values(S.rev).filter(Boolean).length;
 $('#cA').textContent=A;$('#cU').textContent=QUESTIONS.length-A;$('#cR').textContent=R;$('#bar').style.width=A/QUESTIONS.length*100+'%';$('#plabel').textContent=A+' of '+QUESTIONS.length+' answered';
 $$('.qn').forEach((b,i)=>{b.className='qn '+st(QUESTIONS[i].id)+(i===cur?' cur':'')})}
$('#prev').onclick=()=>{if(cur>0){cur--;render()}};$('#next').onclick=()=>{if(cur<QUESTIONS.length-1){cur++;render()}};
$('#clr').onclick=()=>{delete S.ans[QUESTIONS[cur].id];save();render(false)};
$('#mark').onclick=()=>{const id=QUESTIONS[cur].id;S.rev[id]=!S.rev[id];save();render(false)};
document.addEventListener('keydown',e=>{if(!inExam||$('#modal').classList.contains('on')||e.ctrlKey||e.altKey||e.metaKey)return;const k=e.key.toLowerCase(),q=QUESTIONS[cur];
 if(k==='n')$('#next').click();else if(k==='p')$('#prev').click();else if(k==='m')$('#mark').click();
 else if('abcd'.includes(k)&&k.length===1&&q.options[k.toUpperCase()]){S.ans[q.id]=k.toUpperCase();save();render(false)}});

/* ---- Submit ---- */
$('#submit').onclick=()=>{const A=Object.values(S.ans).filter(Boolean).length,R=Object.values(S.rev).filter(Boolean).length;
 $('#mText').textContent='Attempted: '+A+' | Unanswered: '+(QUESTIONS.length-A)+' | Marked for review: '+R+'. You cannot change answers after submitting.';$('#modal').classList.add('on');$('#mYes').focus()};
$('#mNo').onclick=()=>$('#modal').classList.remove('on');$('#mYes').onclick=()=>submit();
function submit(){if(!S||S.done)return;S.done=true;clearInterval(timer);save();   /* 1. save final submission + status first */
 const sc=score(S.ans),rep={name:S.name,reg:S.reg,start:S.start,time:new Date().toISOString(),ans:S.ans,...sc},reps=LS.get('aura_reports',[]);  /* 2. calculate */
 if(!reps.some(r=>r.reg===S.reg))reps.push(rep);LS.set('aura_reports',reps);S.report=rep;save();
 $('#modal').classList.remove('on');show('done');
 if(!S.waOpened){S.waOpened=true;save();window.open(waUrl(rep),'_blank')}}   /* 3. open WhatsApp once; fallback button is on the confirmation screen */
$('#dlBtn').onclick=()=>{if(S&&S.report)dl(S.report)};$('#waBtn').onclick=()=>{if(S&&S.report)window.open(waUrl(S.report),'_blank')};
addEventListener('beforeunload',e=>{if(inExam&&S&&!S.done){e.preventDefault();e.returnValue=''}});

/* ---- Restore after refresh ---- */
if(S&&S.done)show('done');else if(S&&S.end)begin();else if(S&&S.name){$('#iWho').textContent='Student: '+S.name+' | Reg. No: '+S.reg;show('instr')}
}

/* ================= FACULTY SITE ================= */
if($('#fac')){
const reps=()=>LS.get('aura_reports',[]);
function view(r){const ag=QUESTIONS.map(q=>{const a=r.ans[q.id];return '<span class="'+(a?(a===ANSWER_KEY[q.id]?'c':'w'):'')+'" title="Q'+q.id+'">'+q.id+':'+(a||'-')+'</span>'}).join('');
 $('#vbody').innerHTML='<h3></h3><p class="mu"></p><table><tr><td>Attempted / Unanswered</td><td>'+r.attempted+' / '+r.unanswered+'</td></tr><tr><td>Correct / Incorrect</td><td>'+r.correct+' / '+r.incorrect+'</td></tr><tr><td>Total Marks</td><td>'+r.marks+' / 100 ('+r.pct+'%)</td></tr></table><p class="mu" style="margin-top:10px">All selected answers (green = correct, red = incorrect, grey = unanswered):</p><div class="ag">'+ag+'</div><div class="row"><button class="btn sm" id="vdl">Download Report</button><button class="btn sm" id="vwa">Send Faculty Report via WhatsApp</button></div>';
 $('#vbody h3').textContent=r.name+' ('+r.reg+')';$('#vbody p').textContent='Submitted: '+fdate(r.time);$('#vdl').onclick=()=>dl(r);$('#vwa').onclick=()=>window.open(waUrl(r),'_blank');$('#vmodal').classList.add('on')}
function dash(){$('#flogin').classList.remove('on');$('#fdash').classList.add('on');$('#logout').hidden=false;const R=reps(),p=R.map(r=>r.pct);
 $('#stats').innerHTML=[['Submissions',R.length],['Average %',R.length?(p.reduce((a,b)=>a+b,0)/p.length).toFixed(1):'-'],['Highest %',R.length?Math.max(...p):'-'],['Lowest %',R.length?Math.min(...p):'-']].map(x=>'<div class="card"><b class="gt">'+x[1]+'</b>'+x[0]+'</div>').join('');
 $('#empty').hidden=R.length>0;const tb=$('#rows');tb.innerHTML='';
 R.forEach(r=>{const tr=document.createElement('tr');tr.innerHTML='<td></td><td></td><td>'+fdate(r.time)+'</td><td>'+r.attempted+'/100</td><td>'+r.marks+'</td><td>'+r.pct+'%</td><td style="white-space:nowrap"><button class="btn sm" data-a="v">View Report</button> <button class="btn sm ghost" data-a="d">Download Report</button> <button class="btn sm ghost" data-a="w">WhatsApp</button></td>';
  tr.children[0].textContent=r.name;tr.children[1].textContent=r.reg;tr.onclick=e=>{const a=e.target.dataset.a;if(a==='v')view(r);if(a==='d')dl(r);if(a==='w')window.open(waUrl(r),'_blank')};tb.appendChild(tr)})}
$('#fForm').onsubmit=e=>{e.preventDefault();if($('#fu').value.trim()==='faculty'&&$('#fp').value==='aura@123'){sessionStorage.setItem('aura_fac','1');dash()}else $('#ferr').textContent='Invalid username or password.'};
$('#logout').onclick=()=>{sessionStorage.removeItem('aura_fac');location.reload()};$('#vclose').onclick=()=>$('#vmodal').classList.remove('on');
if(sessionStorage.getItem('aura_fac'))dash();
}
