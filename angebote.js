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
const stage=explorer.querySelector('.format-stage'),flipBox=document.createElement('div');
flipBox.className='format-flip';
flipBox.innerHTML='<button type="button"><b aria-hidden="true">←</b> <span></span></button><button type="button"><span></span> <b aria-hidden="true">→</b></button>';
const flip=[...flipBox.children];
stage.append(flipBox);
let focus=cards[0];
function show(card,animate=true){
 focus=card;
 cards.forEach(c=>{
  const on=c===card;
  c.classList.toggle('is-focus',on);
  c.closest('.format-group').classList.toggle('has-focus',c.closest('.format-group').contains(card));
 });
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===card.id.replace('format-',''))));
 // On narrow screens the format index scrolls sideways; keep the chosen format visible there.
 const pressed=index.querySelector('[aria-pressed=true]'),list=pressed.parentElement,box=list.getBoundingClientRect(),r=pressed.getBoundingClientRect();
 if(r.left<box.left||r.right>box.right)list.scrollLeft+=r.left-box.left-24;
 const i=cards.indexOf(card);
 [cards[(i+cards.length-1)%cards.length],cards[(i+1)%cards.length]].forEach((c,dir)=>{flip[dir].querySelector('span').textContent=nameOf(c);flip[dir].setAttribute('aria-label',(dir?'Nächstes':'Vorheriges')+' Format: '+nameOf(c));});
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
// Leaf through the formats at the end of the card, so a long card never hides the choice.
flip.forEach((b,dir)=>b.addEventListener('click',()=>{
 show(cards[(cards.indexOf(focus)+(dir?1:cards.length-1))%cards.length]);
 if(focus.getBoundingClientRect().top<0||stage.getBoundingClientRect().top<0)stage.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}));
// A link like angebote.html#format-workshop opens that format, e.g. from a topic page.
const linked=()=>cards.find(c=>'#'+c.id===location.hash);
window.addEventListener('hashchange',()=>{const card=linked();if(card){show(card);stage.scrollIntoView();}});
finder.hidden=false;index.hidden=false;
explorer.classList.add('is-active');
show(linked()||focus,false);
// The browser jumps to the anchor itself; afterwards show the whole stage with the format index.
if(linked())addEventListener('load',()=>requestAnimationFrame(()=>stage.scrollIntoView()));
})();
