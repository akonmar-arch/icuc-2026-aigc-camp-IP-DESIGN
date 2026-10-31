const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const changedPages = [13, 15, 17, 32, 38];
// Original artwork: b513c19. Page 38 teacher notes removed on 2026-10-31.
const expected = {
  original: '1ad3280cf8945c2363693a1bb9c837069b32a562e8c9afecee40d9d816b9b8a7',
  raw: '1ad3280cf8945c2363693a1bb9c837069b32a562e8c9afecee40d9d816b9b8a7',
  assets: 'fcef906255d345f580469cc581c78c873517326b34fa19f8cf41d5ad2cc470b9',
  grandmother: 'b462b99eb88c107efb8a30fc29ca9012ba9e6cbe6af199d6e58bac4d1897bdd5',
  retained: '5f9b948e2c738c63949b6736778400443181921e1d728ae12577dbf630bf6423'
};
const window = { addEventListener() {}, scrollTo() {} };
vm.runInNewContext(read('content.js'), { window });
const deck = window.LESSON;
assert.equal(hash(deck.slice(0, 82)), '117230b238a8d9ebcc047971ca80ab7972b3604376baabab1a2009f5aca52fd6', 'Existing course or video changed');
assert.equal(deck.length, 83);
assert.equal(hash(deck.filter((s, i) => i !== 37)), 'a1fde02c34d91ea423b3b8274287e637ba44b5d1e3c76a258a0f211d43be665f', 'Another lesson changed');
assert.ok(!deck[37].takeaway && !deck[37].reveal);
assert.ok(!deck[37].lead.includes('教师提示'));
assert.equal(deck[0].original, 1, 'Opening must pose the question');
assert.equal(deck[1].original, 2, 'The next page must answer the definition');
assert.deepEqual(Array.from(deck.slice(2, 6), s => s.title), ['角色、形象与IP', '课程结构：理论、案例与传统流程', '先确定为谁、为什么设计', '开始画之前：设计简报']);
assert.equal(deck.filter(s => s.kind === 'raw').length, 48);
assert.equal(hash(window.ORIGINAL), expected.original, 'Original-deck data changed');
assert.equal(hash(deck.filter(s => s.kind === 'raw')), expected.raw, 'Raw slides changed');
assert.equal(hash(deck.slice(0, 81).map(s => [s.image, s.animation, s.original, s.courseChapter, s.kind])), expected.assets, 'Slide identity/order or original assets changed');
assert.equal(hash(deck.slice(65, 81)), expected.grandmother, 'Independent grandmother workflow changed');
assert.equal(hash(deck.slice(0, 81)), expected.retained, 'A retained lesson changed');
assert.equal(deck[81].title, '巴斯光年幕后故事');
assert.equal(deck.at(-1).title, '作业｜《光年正传》镜头观察');
assert.equal(deck[81].kind, 'rawvideo');
assert.ok(fs.statSync(path.join(__dirname, deck[81].video)).size < 100 * 1024 * 1024, 'Video exceeds the hosting file limit');
assert.ok(fs.existsSync(path.join(__dirname, deck[81].poster)));
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
assert.equal((html.match(/class="slideframe"/g) || []).length, 83);
assert.equal((html.match(/<details class="lesson-reveal">/g) || []).length, 1);
assert.ok(!html.includes('data-slide="83"'), 'Removed pages still render');
assert.ok(html.includes('至少 3 个'));
assert.ok(html.includes('DOC / DOCX'));
assert.ok(html.includes('2026年11月6日 17:00（北京时间）'));
assert.equal((html.match(/<video /g) || []).length, 1);
assert.match(html, /controls playsinline preload="none"/);
assert.ok(!html.includes('autoplay'));
assert.ok(!read('index.html').includes('methodology.js'), 'Removed append script is still loaded');
for (const page of changedPages) assert.ok(html.includes(`data-slide="${page - 1}"`));
for (const name of ['style.css', 'content.js', 'app.js']) assert.ok(read('index.html').includes(`${name}?v=24`));
console.log(JSON.stringify({ result: 'PASS', pages: 83, rawPages: 48, changedPages, teacherPrompts: 1, originalAssetsAndGrandmotherFlow: 'UNCHANGED', lastPage: deck.at(-1).title, retainedPages: 'UNCHANGED', cacheVersion: 24 }, null, 2));
