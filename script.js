// helper
async function api(path, opts){ const res = await fetch(path, opts); return res.json(); }

// load lists
async function loadCampaigns(){
  const el = document.getElementById('campaignList');
  const data = await api('/api/campaigns');
  el.innerHTML = data.map(c=>`<div><strong>${c.title}</strong> — $${c.goal}<br>${c.description}</div>`).join('<hr>') || 'No campaigns';
}
async function loadPartners(){
  const el = document.getElementById('partnerList');
  const data = await api('/api/partners');
  el.innerHTML = data.map(p=>`<div><strong>${p.org}</strong> (${p.type}) — ${p.country} — ${p.contact}</div>`).join('<hr>') || 'No partners';
}
async function loadData(){
  const el = document.getElementById('dataList');
  const data = await api('/api/data');
  if(!data.length){ el.textContent = 'No uploads yet.'; return; }
  el.innerHTML = data.map(d=>`<div><a href="/uploads/${d.filename}" target="_blank">${d.original}</a> — ${new Date(d.uploadedAt).toLocaleString()}</div>`).join('<hr>');
}
async function loadResources(){
  const el = document.getElementById('resourceList');
  const data = await api('/api/resources');
  el.innerHTML = data.map(r=>`<div>${r.name} — ${r.contact}</div>`).join('<hr>') || 'No resources';
}
async function refreshAnalytics(){
  const out = document.getElementById('analyticsOutput');
  const data = await api('/api/analytics');
  out.textContent = JSON.stringify(data, null, 2);
}

// forms
document.getElementById('campaignForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  const res = await api('/api/campaigns',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(fd) });
  alert(res.message); e.target.reset(); loadCampaigns(); refreshAnalytics();
});
document.getElementById('partnerForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  const res = await api('/api/partners',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(fd) });
  alert(res.message); e.target.reset(); loadPartners(); refreshAnalytics();
});
document.getElementById('dataForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const formData = new FormData(e.target);
  const res = await fetch('/api/data',{ method:'POST', body: formData });
  const json = await res.json();
  alert(json.message || 'Uploaded'); e.target.reset(); loadData(); refreshAnalytics();
});
document.getElementById('resourceForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(e.target));
  const res = await api('/api/resources',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(fd) });
  alert(res.message); e.target.reset(); loadResources(); refreshAnalytics();
});
document.getElementById('refreshAnalytics').addEventListener('click', refreshAnalytics);

// initial load
loadCampaigns(); loadPartners(); loadData(); loadResources(); refreshAnalytics();
