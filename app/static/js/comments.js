import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDoc, setDoc, updateDoc, increment, query, orderBy, getDocs, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyApK7IJBYNtw0WD74sHFaNKlMPLAqT1xbg",
  authDomain: "joes-mission.firebaseapp.com",
  projectId: "joes-mission",
  storageBucket: "joes-mission.firebasestorage.app",
  messagingSenderId: "81899759818",
  appId: "1:81899759818:web:5a8aaec3afd8c454b46c33"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const section = document.getElementById('comments');
const postKey = section.getAttribute('data-post');
const colRef = collection(db, 'comments', postKey, 'entries');
const saluteStorage = 'saluted:' + postKey;

// Top-level name toggle
const toggle = document.getElementById('cm-name-toggle');
const nameInput = document.getElementById('cm-name');
toggle.addEventListener('click', function() {
  toggle.classList.toggle('open');
  nameInput.classList.toggle('visible');
  if (nameInput.classList.contains('visible')) nameInput.focus();
});

function fmt(ts) {
  const d = ts && ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Post-level salute
async function initPostSalute() {
  const btn = document.getElementById('post-salute-btn');
  const countEl = document.getElementById('post-salute-count');
  if (!btn) return;
  const postSaluteRef = doc(db, 'salutes', postKey);
  try {
    const snap = await getDoc(postSaluteRef);
    const count = snap.exists() ? (snap.data().count || 0) : 0;
    countEl.textContent = count;
  } catch(e) { console.error(e); }
  if (localStorage.getItem(saluteStorage)) btn.classList.add('saluted');
  btn.addEventListener('click', async function() {
    if (btn.classList.contains('saluted')) return;
    btn.classList.add('saluted');
    localStorage.setItem(saluteStorage, '1');
    try {
      const snap = await getDoc(postSaluteRef);
      if (snap.exists()) {
        await updateDoc(postSaluteRef, { count: increment(1) });
      } else {
        await setDoc(postSaluteRef, { count: 1 });
      }
      const newSnap = await getDoc(postSaluteRef);
      countEl.textContent = newSnap.data().count;
    } catch(e) { console.error(e); }
  });
}

// Build tree from flat list
function buildTree(docs) {
  const map = {};
  const roots = [];
  docs.forEach(d => { map[d.id] = { data: d.data(), id: d.id, children: [] }; });
  docs.forEach(d => {
    const node = map[d.id];
    const pid = node.data.parentId || null;
    if (pid && map[pid]) { map[pid].children.push(node); }
    else { roots.push(node); }
  });
  return roots;
}

// Build a comment element
function buildEl(node, depth) {
  const { data: c, id: docId, children } = node;
  const item = document.createElement('div');
  item.className = 'comment-item';

  const header = document.createElement('div');
  header.className = 'comment-item-header';
  const nameEl = document.createElement('span');
  nameEl.className = 'comment-item-name';
  nameEl.textContent = c.name || 'Anonymous';
  const dateEl = document.createElement('span');
  dateEl.className = 'comment-item-date';
  dateEl.textContent = fmt(c.ts);
  header.appendChild(nameEl);
  header.appendChild(dateEl);

  const textEl = document.createElement('p');
  textEl.className = 'comment-item-text';
  textEl.textContent = c.text;

  item.appendChild(header);
  item.appendChild(textEl);

  // Action bar
  const actions = document.createElement('div');
  actions.className = 'comment-actions';

  // Salute button
  const saluteBtn = document.createElement('button');
  saluteBtn.className = 'salute-btn';
  const saluteEmoji = document.createElement('span');
  saluteEmoji.className = 'salute-emoji';
  saluteEmoji.textContent = '\uD83E\uDDE1';
  const saluteCount = document.createElement('span');
  saluteCount.className = 'salute-count';
  saluteCount.textContent = c.salutes || 0;
  saluteBtn.appendChild(saluteEmoji);
  saluteBtn.appendChild(saluteCount);
  const commentSaluteKey = 'saluted:' + postKey + ':' + docId;
  if (localStorage.getItem(commentSaluteKey)) saluteBtn.classList.add('saluted');
  saluteBtn.addEventListener('click', async function() {
    if (saluteBtn.classList.contains('saluted')) return;
    saluteBtn.classList.add('saluted');
    localStorage.setItem(commentSaluteKey, '1');
    const current = parseInt(saluteCount.textContent) || 0;
    saluteCount.textContent = current + 1;
    try {
      const ref = doc(db, 'comments', postKey, 'entries', docId);
      await updateDoc(ref, { salutes: increment(1) });
    } catch(e) { console.error(e); saluteCount.textContent = current; }
  });
  actions.appendChild(saluteBtn);

  // Reply button
  const replyBtn = document.createElement('button');
  replyBtn.className = 'comment-reply-btn';
  replyBtn.textContent = '\u21a9 Reply';
  actions.appendChild(replyBtn);

  // Expand replies button
  let expandBtn = null;
  if (children.length > 0) {
    expandBtn = document.createElement('button');
    expandBtn.className = 'expand-replies-btn';
    const caret = document.createElement('span');
    caret.className = 'expand-caret';
    caret.textContent = '\u25b6';
    const label = document.createElement('span');
    label.textContent = children.length + (children.length === 1 ? ' reply' : ' replies');
    expandBtn.appendChild(caret);
    expandBtn.appendChild(label);
    actions.appendChild(expandBtn);
  }

  item.appendChild(actions);

  // Reply form
  const replyForm = document.createElement('div');
  replyForm.className = 'reply-form';
  replyForm.innerHTML =
    '<textarea class="comment-textarea" placeholder="Write a reply\u2026" rows="2"></textarea>' +
    '<div class="reply-name-row">' +
      '<input class="reply-name-input" type="text" placeholder="Your name (optional)" autocomplete="off" />' +
      '<button class="reply-submit" type="button">Post reply</button>' +
      '<button class="reply-cancel" type="button">Cancel</button>' +
    '</div>';
  item.appendChild(replyForm);

  // Children
  const childrenWrap = document.createElement('div');
  childrenWrap.className = 'comment-children';
  children.forEach(child => childrenWrap.appendChild(buildEl(child, depth + 1)));
  item.appendChild(childrenWrap);

  // Event listeners
  if (expandBtn) {
    expandBtn.addEventListener('click', () => {
      const isOpen = childrenWrap.classList.toggle('open');
      expandBtn.classList.toggle('open', isOpen);
      const label = expandBtn.querySelector('span:last-child');
      label.textContent = (isOpen ? '\u25be ' : '') + children.length + (children.length === 1 ? ' reply' : ' replies');
    });
  }

  replyBtn.addEventListener('click', () => {
    replyForm.classList.toggle('open');
    if (replyForm.classList.contains('open')) replyForm.querySelector('textarea').focus();
  });

  replyForm.querySelector('.reply-cancel').addEventListener('click', () => {
    replyForm.classList.remove('open');
    replyForm.querySelector('textarea').value = '';
    replyForm.querySelector('.reply-name-input').value = '';
  });

  replyForm.querySelector('.reply-submit').addEventListener('click', async function() {
    const text = replyForm.querySelector('textarea').value.trim();
    if (!text) return;
    const name = replyForm.querySelector('.reply-name-input').value.trim();
    this.textContent = 'Posting\u2026';
    this.disabled = true;
    try {
      await addDoc(colRef, { name, text, parentId: docId, ts: serverTimestamp() });
      replyForm.querySelector('textarea').value = '';
      replyForm.querySelector('.reply-name-input').value = '';
      replyForm.classList.remove('open');
      await load();
    } catch(e) { console.error('Failed to post reply:', e); }
    this.textContent = 'Post reply';
    this.disabled = false;
  });

  return item;
}

// Render
function render(docs) {
  const list = document.getElementById('cm-list');
  list.innerHTML = '';
  if (!docs || !docs.length) {
    list.innerHTML = '<p class="comment-empty">No comments yet. Be the first.</p>';
    return;
  }
  buildTree(docs).forEach(node => list.appendChild(buildEl(node, 0)));
}

async function load() {
  try {
    const q = query(colRef, orderBy('ts', 'asc'));
    const snap = await getDocs(q);
    render(snap.docs);
  } catch(e) { console.error('Failed to load comments:', e); render([]); }
}

// Post top-level comment
document.getElementById('cm-submit').addEventListener('click', async function() {
  const text = document.getElementById('cm-text').value.trim();
  if (!text) return;
  const name = nameInput.value.trim();
  const btn = document.getElementById('cm-submit');
  btn.textContent = 'Posting\u2026';
  btn.disabled = true;
  try {
    await addDoc(colRef, { name, text, parentId: null, ts: serverTimestamp() });
    document.getElementById('cm-text').value = '';
    nameInput.value = '';
    await load();
  } catch(e) { console.error('Failed to post comment:', e); }
  btn.textContent = 'Post';
  btn.disabled = false;
});

load();
initPostSalute();
