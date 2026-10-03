(()=>{
const section=document.querySelector('.cases'),status=section.querySelector('.case-status');
function setState(panel,state,announce=true){
 panel.querySelectorAll('[data-state]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.state===state)));
 panel.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.dataset.view!==state);
 if(announce)status.textContent=panel.querySelector('.case-tag').textContent+': '+(state==='after'?'So geht’s heute.':'So lief’s bisher.');
}
section.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{
 section.querySelectorAll('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 section.querySelectorAll('.case-panel').forEach(panel=>{panel.hidden=panel.id!=='fall-'+button.dataset.case;if(!panel.hidden)setState(panel,'before');});
}));
section.querySelectorAll('[data-state]').forEach(button=>button.addEventListener('click',()=>setState(button.closest('.case-panel'),button.dataset.state)));
section.querySelectorAll('.reveal-change').forEach(button=>button.addEventListener('click',()=>{const panel=button.closest('.case-panel');setState(panel,'after');panel.querySelector('[data-state="after"]').focus({preventScroll:true});panel.querySelector('.state-picker').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
})();
