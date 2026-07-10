function u(l,s){const r=n=>{const e=n==null?"":String(n);return/[",\n]/.test(e)?`"${e.replace(/"/g,'""')}"`:e},a=s.join(","),t=l.map(n=>s.map(e=>r(n[e])).join(",")).join(`
`);return`${a}
${t}`}function f(l){const s=l.replace(/\r\n/g,`
`).split(`
`).filter(t=>t.trim().length>0);if(s.length===0)return[];const r=t=>{const n=[];let e="",i=!1;for(let o=0;o<t.length;o++){const c=t[o];i?c==='"'&&t[o+1]==='"'?(e+='"',o++):c==='"'?i=!1:e+=c:c==='"'?i=!0:c===","?(n.push(e),e=""):e+=c}return n.push(e),n},a=r(s[0]).map(t=>t.trim());return s.slice(1).map(t=>{const n=r(t),e={};return a.forEach((i,o)=>e[i]=(n[o]??"").trim()),e})}function p(l,s,r="text/csv"){const a=new Blob([l],{type:r}),t=URL.createObjectURL(a),n=document.createElement("a");n.href=t,n.download=s,n.click(),URL.revokeObjectURL(t)}export{p as d,f as p,u as t};
