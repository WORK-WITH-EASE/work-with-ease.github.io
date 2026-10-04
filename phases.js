// Shows one phase of the approach at a time; all content stays in the HTML.
(()=>{
const flow=document.querySelector('.phase-flow');
if(!flow)return;
const cards=[...flow.querySelectorAll('[data-phase]')],status=document.querySelector('.phase-status');
const behavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
const panelOf=card=>document.getElementById(card.getAttribute('aria-controls'));
function select(name,announce=true){
 cards.forEach(card=>{const active=card.dataset.phase===name;card.setAttribute('aria-pressed',String(active));panelOf(card).hidden=!active;});
 const card=cards.find(c=>c.dataset.phase===name);
 if(announce)status.textContent='Phase '+card.querySelector('.phase-number').textContent+': '+card.querySelector('.phase-name').textContent;
 return card;
}
cards.forEach(card=>card.addEventListener('click',()=>{
 select(card.dataset.phase);
 const panel=panelOf(card);
 if(panel.getBoundingClientRect().top>innerHeight*.7)panel.scrollIntoView({behavior:behavior(),block:'start'});
}));
document.querySelectorAll('[data-next-phase]').forEach(button=>{
 button.hidden=false;
 button.addEventListener('click',()=>{const card=select(button.dataset.nextPhase);card.focus({preventScroll:true});flow.scrollIntoView({behavior:behavior(),block:'start'});});
});
select((cards.find(c=>c.getAttribute('aria-pressed')==='true')||cards[0]).dataset.phase,false);
})();
