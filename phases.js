// Desktop: the route selects one phase and its content swaps in place without scrolling.
// Narrower screens: all phases stay in sequence and the route jumps to them. Content stays in the HTML.
(()=>{
const explorer=document.querySelector('.phase-explorer');
if(!explorer)return;
const cards=[...explorer.querySelectorAll('[data-phase]')],status=explorer.querySelector('.phase-status');
const wide=matchMedia('(min-width: 1280px)');
const behavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
const panelOf=card=>document.getElementById(card.getAttribute('aria-controls'));
const cardOf=name=>cards.find(card=>card.dataset.phase===name);
let current=(cards.find(card=>card.getAttribute('aria-pressed')==='true')||cards[0]).dataset.phase;
function render(){
 const stacked=wide.matches;
 explorer.classList.toggle('is-stacked',stacked);
 cards.forEach(card=>{
  const active=card.dataset.phase===current,panel=panelOf(card);
  if(stacked)card.setAttribute('aria-pressed',String(active));else card.removeAttribute('aria-pressed');
  panel.classList.toggle('is-inactive',stacked&&!active);
  panel.inert=stacked&&!active;
 });
 explorer.querySelectorAll('[data-next-phase]').forEach(button=>button.hidden=!stacked);
}
function select(name){
 current=name;
 render();
 const card=cardOf(name);
 status.textContent='Phase '+card.querySelector('.phase-number').textContent+': '+card.querySelector('.phase-name').textContent;
 return card;
}
cards.forEach(card=>card.addEventListener('click',()=>{
 if(wide.matches)select(card.dataset.phase);
 else panelOf(card).scrollIntoView({behavior:behavior(),block:'start'});
}));
explorer.querySelectorAll('[data-next-phase]').forEach(button=>button.addEventListener('click',()=>{
 const card=select(button.dataset.nextPhase);
 card.focus({preventScroll:true});
 // Only scroll when the start of the new phase would otherwise be out of sight.
 const header=document.querySelector('.header')?.getBoundingClientRect().bottom||0;
 if(explorer.getBoundingClientRect().top<header-60)explorer.scrollIntoView({behavior:behavior(),block:'start'});
}));
wide.addEventListener('change',render);
render();
})();
