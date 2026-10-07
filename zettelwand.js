// Symptom wall: notes on the left, the chosen symptom with its help on the right (below on narrow screens).
// Without JavaScript all symptoms stay visible one below the other.
(()=>{
const board=document.querySelector('.symptom-board');
if(!board)return;
const wall=board.querySelector('.symptom-wall'),prompt=board.querySelector('.symptom-prompt');
const notes=[...wall.querySelectorAll('.symptom-note')],details=[...board.querySelectorAll('.symptom-detail')];
const narrow=matchMedia('(max-width:900px)'),motion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
function show(id){
 notes.forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.symptom===id)));
 details.forEach(d=>d.classList.toggle('is-open',d.id==='symptom-'+id));
 prompt.hidden=true;
 const open=details.find(d=>d.id==='symptom-'+id);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){open.classList.remove('is-entering');void open.offsetWidth;open.classList.add('is-entering');}
 if(narrow.matches)open.scrollIntoView({behavior:motion()});
}
notes.forEach(n=>n.addEventListener('click',()=>show(n.dataset.symptom)));
board.querySelectorAll('.symptom-back').forEach(b=>{b.hidden=false;b.addEventListener('click',()=>{const pressed=wall.querySelector('[aria-pressed=true]');wall.scrollIntoView({behavior:motion()});pressed?.focus({preventScroll:true});});});
wall.hidden=false;prompt.hidden=false;
board.classList.add('is-active');
})();
