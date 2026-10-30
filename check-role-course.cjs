const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const changedPages = [13, 15, 17, 32, 38, 83, 84, 85, 86, 87, 88];
// Original artwork and case baselines: b513c19. Opening order updated on 2026-10-30.
const expected = {
  original: '1ad3280cf8945c2363693a1bb9c837069b32a562e8c9afecee40d9d816b9b8a7',
  raw: '1ad3280cf8945c2363693a1bb9c837069b32a562e8c9afecee40d9d816b9b8a7',
  assets: "168825b6e9f203dc3918af6f759fdc65684eae8f16fa50c65c6fbefaf400518b",
  grandmother: 'b462b99eb88c107efb8a30fc29ca9012ba9e6cbe6af199d6e58bac4d1897bdd5',
  untouched: "00e0a93d9dbf2204cd08574856f36d52e53a77e3ee0e7348241b5e94e1e582f8"
};
const window = { addEventListener() {}, scrollTo() {} };
vm.runInNewContext(read('content.js'), { window });
vm.runInNewContext(read('methodology.js'), { window });
const deck = window.LESSON;
assert.equal(deck.length, 88);
assert.equal(deck[0].original, 1, 'Opening must pose the question');
assert.equal(deck[1].original, 2, 'The next page must answer the definition');
assert.deepEqual(Array.from(deck.slice(2, 6), s => s.title), ['角色、形象与IP', '课程结构：理论、案例与传统流程', '先确定为谁、为什么设计', '开始画之前：设计简报']);
assert.equal(deck.filter(s => s.kind === 'raw').length, 48);
assert.equal(hash(window.ORIGINAL), expected.original, 'Original-deck data changed');
assert.equal(hash(deck.filter(s => s.kind === 'raw')), expected.raw, 'Raw slides changed');
assert.equal(hash(deck.map(s => [s.image, s.animation, s.original, s.courseChapter, s.kind])), expected.assets, 'Slide identity/order or original assets changed');
assert.equal(hash(deck.slice(65, 81)), expected.grandmother, 'Independent grandmother workflow changed');
assert.equal(hash(deck.filter((s, i) => !changedPages.includes(i + 1))), expected.untouched, 'An out-of-scope lesson changed');
assert.deepEqual(Array.from(deck.flatMap((s, i) => s.practice ? [i + 1] : [])), changedPages);

// Mount the actual renderer with the small DOM surface it uses on startup.
const elements = {
  canvas: { clientWidth: 1920, children: [], style: { setProperty() {} }, innerHTML: '' },
  progress: { style: {} }
};
const document = {
  getElementById: id => elements[id], addEventListener() {},
  documentElement: { scrollHeight: 1080 }
};
vm.runInNewContext(read('app.js'), {
  window, document, history: { replaceState() {} }, location: { hash: '#1' },
  localStorage: { getItem() { return null; }, setItem() {} },
  requestAnimationFrame: fn => fn(), innerHeight: 1080, scrollY: 0
});
const html = elements.canvas.innerHTML;
assert.equal((html.match(/class="slideframe"/g) || []).length, 88);
assert.equal((html.match(/<details class="lesson-reveal">/g) || []).length, 3);
assert.match(html, /#character-homework/);
assert.match(html, /至少10个核心表情/);
assert.match(html, /至少4姿势、2套服装/);
for (const page of changedPages) assert.ok(html.includes(`data-slide="${page - 1}"`));
for (const name of ['style.css', 'content.js', 'methodology.js', 'app.js']) assert.ok(read('index.html').includes(`${name}?v=19`));
console.log(JSON.stringify({ result: 'PASS', pages: 88, rawPages: 48, changedPages, teacherPrompts: 3, originalAssetsAndGrandmotherFlow: 'UNCHANGED', homeworkLink: 'PRESENT', cacheVersion: 19 }, null, 2));
