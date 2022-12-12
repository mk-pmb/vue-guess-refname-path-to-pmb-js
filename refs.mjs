// -*- coding: utf-8, tab-width: 2 -*-


function findRef(needle, haystack) {
  if (!haystack) { return false; }
  const maybes = Object.entries(haystack.$refs);
  const found = maybes.map(([r, m]) => (m === needle) && r).filter(Boolean);
  const refName = found[0];
  return (refName && { refName, needle, haystack });
}


const EX = function guessRefNamesPath(vueElem) {
  let el = vueElem;
  const refPath = [];
  let nMiss = 0;
  const hints = [];
  while (el) {
    const par = el.$parent;
    if (!par) { break; }
    const found = (
      findRef(el, par.$parent)
      // ^- Prefer grandparent because path will be shorter,
      //    and because vue2-teleport doesn't expose a ref.
      || findRef(el, par)
      || false);
    const nextEl = (found.haystack || par);
    const { refName } = found;
    refPath.push(refName);
    console.debug('refPath', found, refPath);
    if (found) {
      hints.push({ refName });
    } else {
      nMiss += 1;
      const d = el.$el;
      hints.push({ domId: d.id, domCls: d.className });
    }
    el = nextEl;
  }
  refPath.reverse();
  hints.reverse();
  if (nMiss) {
    hints.reverse();
    const msg = ('Detected missing path components in Vue refs path: '
      + refPath.join(' -> ') + ' (n_miss=' + nMiss + ')');
    const err = new Error(msg);
    Object.assign(err, {
      nMiss,
      refPath,
      hints,
    });
    throw err;
  }
  console.debug('refPath', refPath);
  return refPath;
};


export default EX;
