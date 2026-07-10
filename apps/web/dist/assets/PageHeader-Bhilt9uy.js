import{g as n,j as e,L as x}from"./index-Csl5UYmv.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=n("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);function d({title:i,subtitle:s,crumbs:a,actions:r}){return e.jsxs("div",{className:"mb-6",children:[a&&a.length>0&&e.jsx("nav",{"aria-label":"Breadcrumb",className:"mb-2 flex items-center gap-1 text-sm text-graphite-500",children:a.map((t,l)=>e.jsxs("span",{className:"flex items-center gap-1",children:[t.to?e.jsx(x,{to:t.to,className:"hover:text-brand-600",children:t.label}):e.jsx("span",{className:"text-graphite-700 dark:text-graphite-300",children:t.label}),l<a.length-1&&e.jsx(h,{className:"h-4 w-4"})]},l))}),e.jsxs("div",{className:"flex flex-wrap items-start justify-between gap-3",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold text-graphite-900 dark:text-graphite-50",children:i}),s&&e.jsx("p",{className:"mt-1 text-graphite-500",children:s})]}),r&&e.jsx("div",{className:"flex items-center gap-2",children:r})]})]})}export{d as P};
