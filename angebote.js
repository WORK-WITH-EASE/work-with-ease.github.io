// Format explorer: chips on the left choose matching formats, one format at a time is in focus on the right.
// Without JavaScript all formats stay visible one below the other.
(()=>{
const explorer=document.querySelector('.format-explorer');
if(!explorer)return;
const finder=explorer.querySelector('.format-finder'),index=explorer.querySelector('.format-index'),result=finder.querySelector('.finder-result');
const cards=[...explorer.querySelectorAll('.format-card')],buttons=[...index.querySelectorAll('[data-format]')];
const has=(card,key,value)=>card.dataset[key].split(' ').includes(value);
const nameOf=card=>card.querySelector('h4').textContent;
const join=list=>list.length>1?list.slice(0,-1).join(', ')+' oder '+list.at(-1):list[0];
let focus=cards[0];
function show(card,animate=true){
 focus=card;
 cards.forEach(c=>{
  const on=c===card;
  c.classList.toggle('is-focus',on);
  c.closest('.format-group').classList.toggle('has-focus',c.closest('.format-group').contains(card));
 });
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===card.id.replace('format-',''))));
 if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches){card.classList.remove('is-entering');void card.offsetWidth;card.classList.add('is-entering');}
}
function update(){
 const groesse=finder.querySelector('[name=groesse]:checked')?.value,stand=finder.querySelector('[name=stand]:checked')?.value;
 let matches=cards.filter(c=>(!groesse||has(c,'groessen',groesse))&&(!stand||has(c,'stand',stand)));
 let hint='';
 if(groesse&&stand&&!matches.length){matches=cards.filter(c=>has(c,'stand',stand));hint=' Für diese Gruppengröße ungewöhnlich – sprechen Sie uns an.';}
 buttons.forEach(b=>b.classList.toggle('is-match',matches.some(c=>c.id==='format-'+b.dataset.format)));
 result.textContent=matches.length?'Passend: '+join(matches.map(nameOf))+'.'+hint:'Kein Format passt genau – sprechen Sie uns an.';
 if(matches.length&&!matches.includes(focus))show(matches[0]);
}
finder.addEventListener('change',update);
const toggle=finder.querySelector('.finder-toggle'),body=finder.querySelector('.finder-body');
toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));body.hidden=!open;explorer.classList.toggle('is-collapsed',!open);});
buttons.forEach(b=>b.addEventListener('click',()=>show(document.getElementById('format-'+b.dataset.format))));
finder.hidden=false;index.hidden=false;
explorer.classList.add('is-active');
show(focus,false);
})();
