#!/usr/bin/env node
/**
 * Build public/images/_candidates/review.html — a self-contained page showing
 * the currently-applied image beside the 4 fetched candidates for every slug,
 * with radio buttons and an "Export picks.json" button. Open it, pick where the
 * default (candidate 1) is wrong, export picks.json into scripts/, then re-run
 * apply-image-picks.js.
 */
const fs = require('fs');
const path = require('path');

const CAND = path.join(__dirname, '..', 'public', 'images', '_candidates');
const slugs = fs
  .readdirSync(CAND)
  .filter((d) => fs.existsSync(path.join(CAND, d, 'meta.json')))
  .sort();

const rows = slugs
  .map((slug) => {
    const meta = JSON.parse(fs.readFileSync(path.join(CAND, slug, 'meta.json'), 'utf8'));
    const cands = (meta.candidates || [])
      .map(
        (c, i) => `
      <label class="cand">
        <input type="radio" name="${slug}" value="c${i + 1}"${i === 0 ? ' checked' : ''}>
        <img src="${slug}/${c.file}" loading="lazy">
        <span>c${i + 1}</span>
      </label>`,
      )
      .join('');
    return `
    <div class="row">
      <div class="meta"><b>${slug}</b><br><small>${meta.query}</small><br>
        <label class="cand"><input type="radio" name="${slug}" value="keep"><span>keep current</span></label>
      </div>
      <div class="current"><img src="../procedures/${slug}.jpg" loading="lazy"><span>applied</span></div>
      <div class="cands">${cands}</div>
    </div>`;
  })
  .join('\n');

const html = `<!doctype html><meta charset="utf-8"><title>KmedTour procedure image review</title>
<style>
 body{font:14px system-ui;margin:0;padding:16px;background:#f5f6f8}
 .row{display:flex;gap:12px;align-items:center;background:#fff;border:1px solid #e3e6ea;border-radius:8px;padding:10px;margin-bottom:10px}
 .meta{width:220px;flex:none}
 .current img,.cand img{height:90px;width:150px;object-fit:cover;border-radius:6px;display:block}
 .current{flex:none;text-align:center;color:#888}
 .cands{display:flex;gap:10px;flex-wrap:wrap}
 .cand{display:inline-block;text-align:center;cursor:pointer}
 .cand input,.meta input{display:block;margin:4px auto 0}
 .bar{position:sticky;top:0;background:#1B4DFF;color:#fff;padding:12px 16px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
 button{font:600 14px system-ui;padding:8px 16px;border:0;border-radius:6px;background:#fff;color:#1B4DFF;cursor:pointer}
</style>
<div class="bar"><span><b>${slugs.length}</b> procedures — candidate 1 is applied by default; change any radio, then export.</span>
 <button onclick="exportPicks()">Export picks.json</button></div>
${rows}
<script>
function exportPicks(){
  const p={};
  document.querySelectorAll('input[type=radio]:checked').forEach(i=>{ if(i.value!=='c1') p[i.name]=i.value; });
  const a=document.createElement('a');
  a.href='data:application/json,'+encodeURIComponent(JSON.stringify(p,null,2));
  a.download='picks.json'; a.click();
}
</script>`;

fs.writeFileSync(path.join(CAND, 'review.html'), html);
console.log(`Wrote review.html for ${slugs.length} procedures → public/images/_candidates/review.html`);
