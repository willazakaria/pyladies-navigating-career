(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.getElementById('stage');
  const stageWrap = document.getElementById('stageWrap');
  const total = slides.length;
  const notes = window.SPEAKER_NOTES || [];
  const nodes = {
    counter: document.getElementById('slideCounter'),
    prev: document.getElementById('prevBtn'),
    next: document.getElementById('nextBtn'),
    progress: document.getElementById('progressSegments'),
    build: document.getElementById('buildIndicator'),
    notesBtn: document.getElementById('notesBtn'),
    presenter: document.getElementById('presenterPanel'),
    closeNotes: document.getElementById('closeNotes'),
    notesContent: document.getElementById('noteContent'),
    notesTitle: document.getElementById('noteHeading'),
    notesPos: document.getElementById('notePosition'),
    notesPhase: document.getElementById('notePhase'),
    elapsed: document.getElementById('elapsed'),
    overview: document.getElementById('overviewOverlay'),
    overviewGrid: document.getElementById('overviewGrid'),
    toast: document.getElementById('toast'),
  };
  const revealSteps = slides.map(s => [...s.querySelectorAll('[data-reveal]')] );
  const revealPositions = Array(total).fill(0);
  let activeIndex = 0;
  let presenterOpen = false;
  let openedOverview = false;
  let timerInterval = null;
  let elapsedSeconds = 0;
  let toastTimeout = null;
  let syncHash = true;

  const pad = n => String(n).padStart(2, '0');
  const asClock = seconds => `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  const noteSafe = index => (notes[index] || 'Catatan tidak tersedia untuk slide ini.').trim();

  function notify(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add('show');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => nodes.toast.classList.remove('show'), 2100);
  }

  function resizeStage() {
    if (window.matchMedia('(max-width:760px)').matches) {
      stage.style.setProperty('--stage-scale', '1');
      return;
    }
    const w = Math.max(300, stageWrap.clientWidth - 38);
    const h = Math.max(220, stageWrap.clientHeight - 28);
    const scale = Math.min(w / 1440, h / 810);
    stage.style.setProperty('--stage-scale', String(scale));
  }

  function syncReveals(index) {
    revealSteps[index].forEach((element, ix) => element.classList.toggle('revealed', ix < revealPositions[index]));
  }

  function currentRevealLeft() {
    return revealSteps[activeIndex].length - revealPositions[activeIndex];
  }

  function updateNavigation() {
    const formatted = pad(activeIndex+1);
    nodes.counter.innerHTML = `${formatted} <small>/ ${total}</small>`;
    nodes.prev.disabled = activeIndex === 0 && revealPositions[0] === 0;
    nodes.next.disabled = activeIndex === total-1 && currentRevealLeft() === 0;
    const left = currentRevealLeft();
    nodes.build.textContent = left ? `${left} poin lagi` : '';
    nodes.notesTitle.textContent = slides[activeIndex].dataset.title || 'Slide';
    nodes.notesPos.textContent = `${formatted} / ${total}`;
    nodes.notesPhase.textContent = slides[activeIndex].dataset.phase || 'STORY';
    nodes.notesContent.textContent = noteSafe(activeIndex);
    [...nodes.progress.children].forEach((item, i) => {
      item.classList.toggle('active', i === activeIndex);
      item.classList.toggle('complete', i < activeIndex);
      item.setAttribute('aria-current', i === activeIndex ? 'step' : 'false');
    });
    [...nodes.overviewGrid.children].forEach((item, i) => item.classList.toggle('selected', i===activeIndex));
    document.title = `${formatted} · ${slides[activeIndex].dataset.title} — Navigating Career in Tech`;
  }

  function stopTimer() {
    if (timerInterval) { window.clearInterval(timerInterval); timerInterval = null; }
  }

  function goto(index, opts = {}) {
    const next = Math.max(0, Math.min(total - 1, index));
    if (next !== activeIndex) {
      stopTimer();
      if (opts.backward && revealPositions[next] === 0) revealPositions[next] = revealSteps[next].length;
      slides[activeIndex].classList.remove('active');
      slides[activeIndex].setAttribute('aria-hidden','true');
      activeIndex = next;
      slides[activeIndex].classList.add('active');
      slides[activeIndex].removeAttribute('aria-hidden');
      syncReveals(activeIndex);
      stageWrap.scrollTop = 0;
    }
    updateNavigation();
    if (syncHash) history.replaceState(null,'',`#slide-${next+1}`);
  }

  function forward(skipBuilds = false) {
    if (!skipBuilds && currentRevealLeft()>0) {
      revealPositions[activeIndex]++;
      syncReveals(activeIndex);
      updateNavigation();
    } else if (activeIndex < total-1) goto(activeIndex+1);
  }
  function backward(skipBuilds = false) {
    if (!skipBuilds && revealPositions[activeIndex]>0) {
      revealPositions[activeIndex]--;
      syncReveals(activeIndex);
      updateNavigation();
    } else if (activeIndex>0) goto(activeIndex-1,{backward:true});
  }
  function toggleNotes(force) {
    presenterOpen = typeof force === 'boolean' ? force : !presenterOpen;
    nodes.presenter.classList.toggle('open', presenterOpen);
    document.getElementById('app').classList.toggle('has-notes', presenterOpen);
    nodes.presenter.setAttribute('aria-hidden', String(!presenterOpen));
    window.setTimeout(resizeStage, 80);
  }
  function toggleOverview(force) {
    openedOverview = typeof force === 'boolean' ? force : !openedOverview;
    nodes.overview.hidden = !openedOverview;
    if (openedOverview) document.getElementById('closeOverview').focus();
  }
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    else document.documentElement.requestFullscreen?.().catch(()=>notify('Browser tidak mengizinkan fullscreen.'));
  }
  function startCountdown(slide, button) {
    stopTimer();
    let remaining = Number(slide.dataset.timer || 15);
    const display = slide.querySelector('.timer-display');
    if (!display) return;
    display.textContent = asClock(remaining);
    if (button) button.textContent = '↺ Ulangi timer';
    const endTime = Date.now()+remaining*1000;
    timerInterval = window.setInterval(() => {
      remaining = Math.max(0, Math.ceil((endTime - Date.now())/1000));
      display.textContent = asClock(remaining);
      if (remaining <= 0) { stopTimer(); notify('Waktu diskusi selesai.'); }
    }, 100);
  }
  function makeNav() {
    slides.forEach((slide, idx) => {
      const dot = document.createElement('button');
      dot.className = 'progress-dot';
      dot.type = 'button';
      dot.title = `${pad(idx+1)} — ${slide.dataset.title}`;
      dot.setAttribute('aria-label', `Ke slide ${idx+1}: ${slide.dataset.title}`);
      dot.addEventListener('click', () => goto(idx));
      nodes.progress.append(dot);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'overview-item';
      const small = document.createElement('small');
      small.textContent = `${pad(idx+1)} / ${slide.dataset.phase || 'STORY'}`;
      const title = document.createElement('strong');
      title.textContent = slide.dataset.title;
      item.append(small, title);
      item.addEventListener('click', () => {goto(idx);toggleOverview(false);});
      nodes.overviewGrid.append(item);
    });
  }

  nodes.next.addEventListener('click',()=>forward());
  nodes.prev.addEventListener('click',()=>backward());
  nodes.notesBtn.addEventListener('click',()=>toggleNotes());
  nodes.closeNotes.addEventListener('click',()=>toggleNotes(false));
  document.getElementById('overviewBtn').addEventListener('click',()=>toggleOverview());
  document.getElementById('closeOverview').addEventListener('click',()=>toggleOverview(false));
  document.getElementById('fullscreenBtn').addEventListener('click',toggleFullscreen);
  nodes.overview.addEventListener('click',event => {if(event.target===nodes.overview)toggleOverview(false);});
  document.querySelectorAll('[data-start-timer]').forEach(btn=>btn.addEventListener('click',()=>startCountdown(btn.closest('.slide'),btn)));
  document.querySelectorAll('.choice[data-choice]').forEach(choice=>choice.addEventListener('click',()=>{
    const group=choice.closest('[data-group]');
    group?.querySelectorAll('.choice').forEach(item => { item.classList.remove('selected');item.setAttribute('aria-pressed','false'); });
    choice.classList.add('selected');
    choice.setAttribute('aria-pressed','true');
  }));
  document.querySelectorAll('.choice').forEach(choice=>choice.setAttribute('aria-pressed','false'));

  document.addEventListener('keydown', event => {
    const target=event.target;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName||'') || target?.isContentEditable) return;
    if (target?.tagName === 'BUTTON' && (event.key === ' ' || event.key === 'Enter')) return;
    if (openedOverview) { if (event.key==='Escape' || event.key.toLowerCase()==='o') toggleOverview(false); return; }
    const key=event.key;
    if (key==='ArrowRight'||key==='ArrowDown'||key===' '||key==='PageDown') { event.preventDefault(); forward(event.shiftKey); }
    else if (key==='ArrowLeft'||key==='ArrowUp'||key==='PageUp') { event.preventDefault(); backward(event.shiftKey); }
    else if (key==='Home') {event.preventDefault();goto(0);}
    else if (key==='End') {event.preventDefault();goto(total-1);}
    else if (key.toLowerCase()==='n') toggleNotes();
    else if (key.toLowerCase()==='o') toggleOverview();
    else if (key.toLowerCase()==='f') toggleFullscreen();
    else if (key.toLowerCase()==='r') {revealPositions[activeIndex]=revealSteps[activeIndex].length;syncReveals(activeIndex);updateNavigation();notify('Semua poin pada slide ini sudah ditampilkan.');}
    else if (key==='Escape' && presenterOpen) toggleNotes(false);
    else if (key==='?') notify('← → navigasi · Shift+→ lewati animasi · N catatan · O semua slide · F fullscreen');
  });

  let swipeStart = null;
  stageWrap.addEventListener('touchstart',event => {if (event.touches.length===1)swipeStart={x:event.touches[0].clientX,y:event.touches[0].clientY};}, {passive:true});
  stageWrap.addEventListener('touchend',event => {
    if(!swipeStart || !event.changedTouches.length) return;
    const dx=event.changedTouches[0].clientX-swipeStart.x;
    const dy=event.changedTouches[0].clientY-swipeStart.y;
    if (Math.abs(dx)>80 && Math.abs(dx)>Math.abs(dy)*1.4) { if(dx<0)forward();else backward(); }
    swipeStart=null;
  },{passive:true});

  window.addEventListener('resize',resizeStage);
  window.addEventListener('hashchange',()=>{
    const number=Number((location.hash.match(/^#slide-(\d+)$/)||[])[1]);
    if (number>=1 && number<=total) goto(number-1);
  });
  document.addEventListener('visibilitychange',()=>{ /* Timer uses endTime and stays accurate on return. */ });
  window.setInterval(()=>{ elapsedSeconds++; nodes.elapsed.textContent=asClock(elapsedSeconds); },1000);

  makeNav();
  slides.forEach((slide,idx) => { if(idx)slide.setAttribute('aria-hidden','true'); syncReveals(idx); });
  const initial=Number((location.hash.match(/^#slide-(\d+)$/)||[])[1]);
  if (initial>=1&&initial<=total) goto(initial-1);
  else goto(0);
  resizeStage();
})();
