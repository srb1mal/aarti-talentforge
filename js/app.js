/* ===================================================
   Aarti TalentForge — AI Resume Intelligence
   Client-side, department-aware resume scoring engine.
   =================================================== */

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/* ===================================================
   DEPARTMENT PROFILES
   Each department is scored against the work that
   actually happens there:
     core   — primary domain skills (highest weight)
     tools  — software / equipment / systems
     certs  — qualifications & certifications
     titles — relevant job titles (role-fit bonus)
     fields — relevant education streams
   =================================================== */
const DEPARTMENTS = {
  rollingmill: {
    name: 'Rolling Mill', emoji: '🔩',
    blurb: 'Hot & cold rolling, bar/wire mills and mill operations.',
    hint: 'Looks for mill operation, rolling, reheating furnace, TMT/wire rod, pass schedule and roll-shop experience.',
    core: ['rolling mill','hot rolling','cold rolling','wire rod','tmt','bar mill','reheating furnace',
      'rolling','mill operation','pass schedule','roll change','finishing mill','rolling stand','roll shop',
      'tolerance','rolling speed','descaling','cooling bed','shearing','tundish'],
    tools: ['plc','scada','level 2 automation','caliper','micrometer','hmi'],
    certs: ['iso 9001','six sigma','diploma mechanical','b.tech metallurgy','b.tech mechanical'],
    titles: ['mill operator','rolling engineer','shift incharge','production engineer','mill manager'],
    fields: ['metallurgy','mechanical','production','industrial']
  },
  sms: {
    name: 'Steel Melting Shop (SMS)', emoji: '🔥',
    blurb: 'EAF/induction melting, ladle metallurgy & continuous casting.',
    hint: 'Looks for melting, EAF, induction furnace, ladle refining, continuous casting and tapping experience.',
    core: ['steel melting','melting shop','sms','electric arc furnace','eaf','induction furnace','ladle furnace',
      'continuous casting','ccm','tapping','deoxidation','ladle metallurgy','tundish','billet','bloom','slag',
      'refractory','tapping temperature','alloy addition','scrap charging'],
    tools: ['plc','scada','spectrometer','level 2 automation'],
    certs: ['iso 9001','b.tech metallurgy','diploma metallurgy','six sigma'],
    titles: ['furnace operator','sms engineer','melt shop incharge','caster operator'],
    fields: ['metallurgy','mechanical','production']
  },
  metallurgy: {
    name: 'Metallurgy & Quality (QA/QC)', emoji: '🔬',
    blurb: 'Metallurgical testing, quality control and material certification.',
    hint: 'Looks for metallurgy, spectrometer, UTM, microstructure, heat treatment, inspection and QMS.',
    core: ['metallurgy','quality control','quality assurance','qa','qc','inspection','spectrometer','utm',
      'tensile test','hardness test','microstructure','heat treatment','metallography','non destructive testing',
      'ndt','ultrasonic testing','material testing','calibration','iso 9001','spc','root cause analysis'],
    tools: ['minitab','spectrometer','utm','hardness tester','microscope'],
    certs: ['iso 9001','iso 17025','six sigma','asnt','b.tech metallurgy'],
    titles: ['quality engineer','metallurgist','qa engineer','lab incharge','quality manager'],
    fields: ['metallurgy','materials','chemistry','mechanical']
  },
  powerplant: {
    name: 'Power Plant', emoji: '⚡',
    blurb: 'Captive power, boilers, turbines and electrical generation.',
    hint: 'Looks for boiler, turbine, BOP, captive power, DCS operation and electrical/thermal background.',
    core: ['power plant','boiler','turbine','captive power','thermal power','generator','dcs','bop',
      'steam','condenser','cooling tower','switchyard','transformer','feed water','combustion','coal handling',
      'load management','power generation','electrical maintenance','boiler operation','co-generation'],
    tools: ['dcs','scada','plc','pms','sap pm'],
    certs: ['boiler operation engineer','boe','b.tech electrical','b.tech mechanical','diploma electrical'],
    titles: ['power plant engineer','boiler operator','turbine operator','shift charge engineer','electrical engineer'],
    fields: ['electrical','mechanical','power','thermal']
  },
  maintenance: {
    name: 'Maintenance & Engineering', emoji: '🛠️',
    blurb: 'Mechanical, electrical & instrumentation maintenance.',
    hint: 'Looks for preventive/breakdown maintenance, hydraulics, PLC, motors, drives and reliability work.',
    core: ['maintenance','preventive maintenance','breakdown maintenance','mechanical maintenance',
      'electrical maintenance','instrumentation','hydraulics','pneumatics','bearings','gearbox','motor',
      'vfd','drives','lubrication','vibration analysis','reliability','tpm','overhauling','alignment','welding'],
    tools: ['plc','scada','sap pm','cmms','autocad'],
    certs: ['b.tech mechanical','b.tech electrical','diploma mechanical','diploma electrical','tpm'],
    titles: ['maintenance engineer','mechanical engineer','electrical engineer','instrumentation engineer','maintenance manager'],
    fields: ['mechanical','electrical','instrumentation','mechatronics']
  },
  cybersecurity: {
    name: 'Cyber Security', emoji: '🛡️',
    blurb: 'OT/IT security, SOC, threat detection and compliance.',
    hint: 'Looks for SIEM, firewall, VAPT, SOC, ISO 27001, incident response and OT security.',
    core: ['cyber security','information security','network security','firewall','siem','soc','vapt',
      'penetration testing','vulnerability assessment','incident response','threat detection','endpoint security',
      'ids','ips','encryption','iso 27001','security audit','phishing','malware analysis','ot security','zero trust'],
    tools: ['splunk','wireshark','nessus','crowdstrike','palo alto','fortinet','kali linux','qualys'],
    certs: ['ceh','cissp','comptia security+','iso 27001','oscp','cisa'],
    titles: ['security analyst','soc analyst','cyber security engineer','infosec specialist','security architect'],
    fields: ['computer','information technology','cyber','electronics']
  },
  it: {
    name: 'Information & Technology (IT)', emoji: '💻',
    blurb: 'Software, infrastructure, networks and end-user support.',
    hint: 'Looks for programming, networking, servers, cloud, databases, helpdesk and infra administration.',
    core: ['software development','programming','python','java','javascript','sql','networking','cloud','aws',
      'azure','linux','windows server','active directory','database','devops','it support','helpdesk',
      'troubleshooting','api','virtualization','vmware','backup','router','switch'],
    tools: ['react','angular','node','docker','kubernetes','git','jira','powershell','mysql','oracle'],
    certs: ['ccna','mcsa','aws certified','itil','azure certified','b.tech cse','mca'],
    titles: ['software engineer','it engineer','system administrator','network engineer','developer','it support'],
    fields: ['computer','information technology','electronics','software']
  },
  sap: {
    name: 'SAP', emoji: '🧩',
    blurb: 'SAP ERP implementation, support and module configuration.',
    hint: 'Looks for SAP modules (MM/SD/PP/FICO/ABAP), S/4HANA, configuration and end-to-end implementation.',
    core: ['sap','sap mm','sap sd','sap pp','sap fico','sap fi','sap co','sap abap','sap basis','sap hana',
      's/4hana','sap qm','sap pm','sap implementation','configuration','end to end implementation','blueprint',
      'erp','functional consultant','idoc','user acceptance testing','gap analysis'],
    tools: ['sap gui','solution manager','fiori','lsmw','abap'],
    certs: ['sap certified','sap mm certification','sap fico certification','itil','mba'],
    titles: ['sap consultant','sap functional consultant','sap abap consultant','sap analyst','erp consultant'],
    fields: ['computer','information technology','commerce','engineering']
  },
  finance: {
    name: 'Account & Finance', emoji: '📈',
    blurb: 'Accounting, taxation, audit, costing and treasury.',
    hint: 'Looks for accounting, GST/TDS, finalisation, audit, costing, SAP FICO and CA/CMA/MBA finance.',
    core: ['accounting','finance','tally','gst','tds','taxation','audit','balance sheet','finalisation','costing',
      'budgeting','financial analysis','reconciliation','accounts payable','accounts receivable','payroll',
      'forecasting','compliance','cash flow','treasury','invoicing','ledger','statutory audit'],
    tools: ['tally','sap fico','ms excel','quickbooks','oracle financials','zoho books'],
    certs: ['ca','cma','cs','mba finance','m.com','icwa'],
    titles: ['accountant','finance executive','accounts manager','financial analyst','finance manager','auditor'],
    fields: ['commerce','finance','accounting','business']
  },
  procurement: {
    name: 'Procurement & Supply Chain', emoji: '🚚',
    blurb: 'Sourcing, purchase, inventory, dispatch and logistics.',
    hint: 'Looks for procurement, vendor management, inventory, SAP MM, negotiation and logistics planning.',
    core: ['procurement','purchase','supply chain','sourcing','vendor management','inventory','warehouse',
      'dispatch','logistics','negotiation','material planning','mrp','contract','rfq','purchase order',
      'cost reduction','freight','stock','import','export','vendor development'],
    tools: ['sap mm','erp','ms excel','ariba','oracle scm'],
    certs: ['cscp','cpm','mba operations','mba scm','diploma materials management'],
    titles: ['procurement engineer','purchase officer','supply chain executive','materials manager','logistics manager'],
    fields: ['mechanical','commerce','operations','business']
  },
  safety: {
    name: 'Safety & Environment (EHS)', emoji: '🦺',
    blurb: 'Industrial safety, environment, fire and statutory compliance.',
    hint: 'Looks for EHS, ISO 45001/14001, hazard analysis, risk assessment, fire safety and audits.',
    core: ['safety','health safety environment','ehs','industrial safety','hazard identification','risk assessment',
      'hira','iso 45001','iso 14001','fire safety','ppe','safety audit','incident investigation','permit to work',
      'environment','effluent','pollution control','first aid','toolbox talk','safety training','mock drill'],
    tools: ['ms excel','ehs software','iso documentation'],
    certs: ['nebosh','iosh','adis','pdis','iso 45001','b.tech'],
    titles: ['safety officer','ehs engineer','safety manager','environment officer','fire officer'],
    fields: ['safety','environment','mechanical','chemical']
  },
  ppc: {
    name: 'Production Planning (PPC)', emoji: '🗓️',
    blurb: 'Production scheduling, capacity planning and dispatch control.',
    hint: 'Looks for production planning, scheduling, MRP, capacity planning, ERP and coordination.',
    core: ['production planning','ppc','scheduling','capacity planning','mrp','demand planning','dispatch planning',
      'order management','inventory control','lean manufacturing','kaizen','5s','line balancing','forecasting',
      'shop floor coordination','oee','production control','master production schedule'],
    tools: ['sap pp','erp','ms excel','ms project'],
    certs: ['mba operations','six sigma','apics','b.tech production','diploma'],
    titles: ['ppc engineer','production planner','planning executive','ppc manager'],
    fields: ['production','industrial','mechanical','operations']
  },
  hr: {
    name: 'Human Resources', emoji: '🧑‍💼',
    blurb: 'Recruitment, payroll, IR, training and compliance.',
    hint: 'Looks for recruitment, payroll, HRMS, labour law, employee relations and statutory compliance.',
    core: ['recruitment','talent acquisition','onboarding','payroll','employee relations','industrial relations',
      'training','hrms','performance management','labour law','compensation','sourcing','interviewing','grievance',
      'attendance','statutory compliance','engagement','induction','hr policy','exit formalities','pf esi'],
    tools: ['hrms','sap hr','ms excel','naukri','linkedin recruiter','greythr'],
    certs: ['mba hr','pgdm hr','shrm','labour law certification'],
    titles: ['hr executive','hr manager','recruiter','hr business partner','ir manager'],
    fields: ['human resource','business','psychology','management']
  },
  sales: {
    name: 'Sales & Marketing', emoji: '📣',
    blurb: 'B2B steel sales, dealer network and business development.',
    hint: 'Looks for B2B sales, business development, CRM, dealer/channel management and negotiation.',
    core: ['sales','marketing','b2b','business development','crm','negotiation','client relationship',
      'lead generation','target achievement','channel sales','dealer management','distribution','market analysis',
      'export sales','key account','revenue growth','pricing','tender','steel sales'],
    tools: ['crm','salesforce','ms excel','zoho crm'],
    certs: ['mba marketing','pgdm','bba'],
    titles: ['sales executive','business development manager','area sales manager','marketing manager','key account manager'],
    fields: ['marketing','business','commerce','management']
  }
};

/* education / general banks */
const EDU = {
  doctorate: ['phd','ph.d','doctorate'],
  masters: ['master','m.tech','mtech','mba','m.com','msc','m.sc','mca','pgdm','me ','m.e.'],
  bachelors: ['bachelor','b.tech','btech','b.e','b.e.','be ','b.com','bsc','b.sc','bba','engineering','degree'],
  diploma: ['diploma','iti','polytechnic']
};
const ACTION_VERBS = ['managed','led','developed','implemented','increased','reduced','improved','achieved',
  'delivered','optimized','optimised','supervised','executed','coordinated','designed','maintained','operated',
  'commissioned','installed','reduced','streamlined','spearheaded','handled','monitored','trained'];
const METRIC_RE = /(\d{1,3}(?:[.,]\d+)?\s*%)|(₹\s?\d)|(rs\.?\s?\d)|(\d+\s*(?:mt|tonnes?|tons?|tpd|tph|crore|lakh|kw|mw|kg))/gi;
const CONTACT = {
  email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
  phone: /(\+?\d[\d\s-]{8,}\d)/,
  linkedin: /linkedin\.com\/[a-z0-9-]+/i
};

/* ---------- State ---------- */
const LS_KEY = 'aarti_talentforge_v2';
const STAGES = ['New', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];
const ACTIVE_STAGES = ['Shortlisted', 'Interview', 'Selected']; // counts as "in pipeline"
let candidates = loadCandidates();
let currentAnalysis = null;
let resumeText = '';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

function loadCandidates() {
  let list;
  try { list = JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { list = []; }
  // migrate older records to the pipeline-stage model
  list.forEach(c => { if (!c.stage) c.stage = c.shortlisted ? 'Shortlisted' : 'New'; });
  return list;
}
function saveCandidates() { localStorage.setItem(LS_KEY, JSON.stringify(candidates)); }

function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tid); t._tid = setTimeout(() => t.classList.remove('show'), 2600);
}
function scoreColor(s) {
  if (s >= 80) return 'var(--green)';
  if (s >= 65) return 'var(--blue)';
  if (s >= 50) return 'var(--amber)';
  return 'var(--red)';
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* ---------- Tabs ---------- */
function activateTab(id) {
  $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === id));
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === id));
  $('#mainNav').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // ensure reveal items in the now-visible panel show even if observer missed them
  const panel = document.getElementById(id);
  if (panel) setTimeout(() => $$('.reveal', panel).forEach(e => e.classList.add('in')), 60);
  if (id === 'pool') renderPool();
}
document.addEventListener('click', e => {
  const link = e.target.closest('[data-tab]');
  if (link) { e.preventDefault(); activateTab(link.dataset.tab); }
  const goto = e.target.closest('[data-goto]');
  if (goto) { e.preventDefault(); activateTab(goto.dataset.goto); }
});
$('#navToggle').addEventListener('click', () => $('#mainNav').classList.toggle('open'));

/* ---------- Init departments ---------- */
function initDepartments() {
  const sel = $('#deptSelect'), filterSel = $('#filterDept'), grid = $('#deptGrid');
  Object.entries(DEPARTMENTS).forEach(([key, d]) => {
    sel.insertAdjacentHTML('beforeend', `<option value="${key}">${d.emoji} ${d.name}</option>`);
    filterSel.insertAdjacentHTML('beforeend', `<option value="${key}">${d.name}</option>`);
    grid.insertAdjacentHTML('beforeend', `
      <div class="dept-tile reveal">
        <div class="dept-emoji">${d.emoji}</div>
        <h4>${d.name}</h4>
        <p>${d.blurb}</p>
      </div>`);
  });
  $('[data-stat="depts"]').textContent = Object.keys(DEPARTMENTS).length;
  updateDeptHint();
  sel.addEventListener('change', updateDeptHint);
}
function updateDeptHint() {
  const d = DEPARTMENTS[$('#deptSelect').value];
  $('#deptHint').textContent = d ? d.hint : '';
}

/* ===================================================
   ADVANCED SCORING ENGINE  (8 weighted dimensions)
   Core 30 · Tools 12 · Certs 8 · Experience 16 ·
   Education 14 · Achievements 8 · Contact 6 · Structure 6
   =================================================== */
function matchList(lower, list) {
  const found = [], missing = [];
  list.forEach(item => (lower.includes(item.toLowerCase()) ? found : missing).push(item));
  return { found, missing };
}

function analyzeResume(text, deptKey, minExp) {
  const lower = text.toLowerCase();
  const dept = DEPARTMENTS[deptKey];
  const wordCount = (text.match(/\b[\w.+#]+\b/g) || []).length;

  // 1 — Core domain skills (30)
  const coreM = matchList(lower, dept.core);
  const coreScore = Math.round((coreM.found.length / dept.core.length) * 30);

  // 2 — Tools / systems (12)
  const toolM = matchList(lower, dept.tools);
  const toolScore = Math.round((toolM.found.length / Math.max(1, dept.tools.length)) * 12);

  // 3 — Certifications (8)
  const certM = matchList(lower, dept.certs);
  const certScore = Math.min(8, certM.found.length * 3);

  // 4 — Experience (16)
  let years = 0;
  [...lower.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs|year)/g)].forEach(m => { years = Math.max(years, +m[1]); });
  let expScore;
  if (minExp <= 0) expScore = years > 0 ? 16 : 9;
  else expScore = Math.min(16, Math.round((years / minExp) * 16));
  if (years === 0) expScore = Math.min(expScore, 6);

  // 5 — Education + field relevance (14)
  let eduScore = 0, eduLevel = 'Not detected';
  if (EDU.doctorate.some(k => lower.includes(k))) { eduScore = 11; eduLevel = 'Doctorate'; }
  else if (EDU.masters.some(k => lower.includes(k))) { eduScore = 10; eduLevel = "Master's"; }
  else if (EDU.bachelors.some(k => lower.includes(k))) { eduScore = 8; eduLevel = "Bachelor's"; }
  else if (EDU.diploma.some(k => lower.includes(k))) { eduScore = 5; eduLevel = 'Diploma/ITI'; }
  const fieldMatch = dept.fields.some(f => lower.includes(f));
  if (eduScore && fieldMatch) eduScore = Math.min(14, eduScore + 3);

  // 6 — Achievements / impact (8) — action verbs + quantified metrics
  const verbHits = ACTION_VERBS.filter(v => lower.includes(v)).length;
  const metricHits = (text.match(METRIC_RE) || []).length;
  let achScore = Math.min(4, verbHits) + Math.min(4, metricHits * 2);
  achScore = Math.min(8, achScore);

  // 7 — Contact completeness (6)
  let contactScore = 0; const contacts = [];
  if (CONTACT.email.test(text)) { contactScore += 3; contacts.push('email'); }
  if (CONTACT.phone.test(text)) { contactScore += 2; contacts.push('phone'); }
  if (CONTACT.linkedin.test(text)) { contactScore += 1; contacts.push('linkedin'); }

  // 8 — Structure / readability (6)
  const sectionWords = ['experience','education','skills','project','summary','objective','certification','achievement','responsibilities'];
  const sectionHits = sectionWords.filter(s => lower.includes(s)).length;
  let structScore = Math.min(3, Math.ceil(sectionHits / 2));
  if (wordCount >= 200 && wordCount <= 1400) structScore += 3;
  else if (wordCount > 80) structScore += 1;
  structScore = Math.min(6, structScore);

  const total = Math.min(100, coreScore + toolScore + certScore + expScore + eduScore + achScore + contactScore + structScore);

  let verdict, vcolor;
  if (total >= 80) { verdict = 'Excellent Fit'; vcolor = 'var(--green)'; }
  else if (total >= 65) { verdict = 'Strong Candidate'; vcolor = 'var(--blue)'; }
  else if (total >= 50) { verdict = 'Average — Review'; vcolor = 'var(--amber)'; }
  else { verdict = 'Below Threshold'; vcolor = 'var(--red)'; }

  // matched / missing display sets
  const matched = [...coreM.found, ...toolM.found, ...certM.found];
  const missing = [...coreM.missing.slice(0, 8), ...toolM.missing.slice(0, 3)];

  // AI insights
  const insights = buildInsights({ dept, coreM, toolM, certM, years, minExp, eduLevel, fieldMatch, metricHits, verbHits, contacts, total });

  return {
    total, verdict, vcolor, matched, missing, years, wordCount, contacts, eduLevel, fieldMatch,
    coreRatio: Math.round((coreM.found.length / dept.core.length) * 100),
    breakdown: [
      { label: 'Core Skills', score: coreScore, max: 30 },
      { label: 'Tools & Systems', score: toolScore, max: 12 },
      { label: 'Certifications', score: certScore, max: 8 },
      { label: 'Experience', score: expScore, max: 16 },
      { label: 'Education', score: eduScore, max: 14 },
      { label: 'Achievements / Impact', score: achScore, max: 8 },
      { label: 'Contact Info', score: contactScore, max: 6 },
      { label: 'Structure', score: structScore, max: 6 }
    ],
    insights
  };
}

function buildInsights(d) {
  const out = [];
  if (d.coreM.found.length >= d.dept.core.length * 0.5)
    out.push(['✅', `Strong domain alignment — matched ${d.coreM.found.length} core ${d.dept.name} skills.`]);
  else
    out.push(['⚠️', `Limited core skill coverage for ${d.dept.name}. Consider only if other strengths compensate.`]);

  if (d.years) out.push(['📅', `Detected ${d.years} yr(s) of experience${d.minExp ? ` against a ${d.minExp} yr requirement.` : '.'}`]);
  else out.push(['❓', 'No clear years-of-experience statement found in the resume.']);

  if (d.eduLevel !== 'Not detected')
    out.push([d.fieldMatch ? '🎓' : 'ℹ️', `${d.eduLevel} qualification${d.fieldMatch ? ' in a relevant field.' : ' (field relevance not detected).'}`]);
  else out.push(['⚠️', 'Education level could not be detected.']);

  if (d.certM.found.length) out.push(['🏅', `Relevant certifications found: ${d.certM.found.join(', ')}.`]);
  if (d.metricHits) out.push(['📈', `Resume shows ${d.metricHits} quantified result(s) — good evidence of impact.`]);
  else out.push(['💡', 'Tip: candidate could strengthen the resume with measurable achievements.']);

  if (d.contacts.length < 2) out.push(['📞', 'Incomplete contact details — verify email/phone before shortlisting.']);
  return out;
}

/* ===================================================
   FILE HANDLING
   =================================================== */
async function extractText(file) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      txt += content.items.map(it => it.str).join(' ') + '\n';
    }
    return txt;
  }
  return await file.text();
}

async function handleFile(file) {
  const status = $('#fileStatus');
  status.classList.remove('err');
  status.textContent = `Reading "${file.name}"...`;
  try {
    const text = await extractText(file);
    if (!text || text.trim().length < 30) throw new Error('Could not read enough text (scanned image PDFs are not supported — use the paste option).');
    resumeText = text;
    $('#pasteArea').value = text.slice(0, 5000);
    status.textContent = `✓ Loaded "${file.name}" (${(text.match(/\b\w+\b/g) || []).length} words)`;
    $('#analyzeBtn').disabled = false;
    if (!$('#candName').value) {
      const guess = file.name.replace(/\.(pdf|txt)$/i, '').replace(/[_-]+/g, ' ').replace(/resume|cv|final|updated/gi, '').trim();
      if (guess) $('#candName').value = guess.replace(/\b\w/g, c => c.toUpperCase());
    }
    prefillContacts(text);
  } catch (err) {
    status.classList.add('err'); status.textContent = '✗ ' + err.message;
    resumeText = ''; $('#analyzeBtn').disabled = true;
  }
}

const dz = $('#dropzone'), fileInput = $('#fileInput');
dz.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });
['dragover','dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
dz.addEventListener('drop', e => { if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
$('#pasteArea').addEventListener('input', e => {
  const v = e.target.value.trim();
  resumeText = v;
  $('#analyzeBtn').disabled = v.length <= 30;
});

/* auto-detect email/phone from the resume to save HR typing */
function prefillContacts(text) {
  const found = [];
  const em = text.match(CONTACT.email);
  const ph = text.match(CONTACT.phone);
  if (em && !$('#candEmail').value) { $('#candEmail').value = em[0]; found.push('email'); }
  if (ph && !$('#candPhone').value) { $('#candPhone').value = ph[0].trim(); found.push('phone'); }
  $('#contactPrefill').textContent = found.length ? `Auto-detected ${found.join(' & ')} from the resume — please verify.` : '';
}

/* ===================================================
   ANALYZE + RENDER
   =================================================== */
$('#analyzeBtn').addEventListener('click', () => {
  if (!resumeText || resumeText.trim().length < 30) { toast('Please upload or paste a resume first.'); return; }
  const deptKey = $('#deptSelect').value;
  const minExp = parseInt($('#minExp').value, 10) || 0;
  const btn = $('#analyzeBtn');
  const overlay = $('#scanOverlay');

  // brief live "scanning" pass for a processing feel
  btn.disabled = true; btn.textContent = 'Analyzing…';
  $('#resultEmpty').hidden = true;
  overlay.hidden = false;

  setTimeout(() => {
    try {
      currentAnalysis = analyzeResume(resumeText, deptKey, minExp);
      currentAnalysis.dept = deptKey;
      currentAnalysis.name = $('#candName').value.trim() || 'Unnamed Candidate';
      renderResult(currentAnalysis);
    } catch (err) {
      console.error('Analysis failed:', err);
      toast('Something went wrong while analyzing. Please try again.');
      $('#resultEmpty').hidden = false;
    } finally {
      overlay.hidden = true;
      btn.disabled = false; btn.textContent = 'Analyze Resume';
    }
  }, 950);
});

function renderResult(a) {
  $('#resultEmpty').hidden = true;
  $('#resultBody').hidden = false;

  const circ = 2 * Math.PI * 52;
  const ring = $('#ringFg');
  ring.style.stroke = a.vcolor;
  setTimeout(() => { ring.style.strokeDashoffset = circ * (1 - a.total / 100); }, 60);

  const numEl = $('#scoreNum');
  let n = 0; clearInterval(numEl._iv);
  numEl._iv = setInterval(() => { n += 2; if (n >= a.total) { n = a.total; clearInterval(numEl._iv); } numEl.textContent = n; }, 16);

  $('#verdict').innerHTML = `<span class="pill" style="background:${a.vcolor}">${a.verdict}</span>`;
  $('#metaLine').innerHTML =
    `${DEPARTMENTS[a.dept].emoji} ${DEPARTMENTS[a.dept].name} · ${a.coreRatio}% core match` +
    `${a.years ? ' · ' + a.years + ' yrs exp' : ''} · ${a.eduLevel}`;

  $('#breakdown').innerHTML = a.breakdown.map(b => `
    <div class="bd-row">
      <div class="bd-head"><span>${b.label}</span><b>${b.score}/${b.max}</b></div>
      <div class="bd-bar"><div class="bd-fill" data-w="${(b.score / b.max) * 100}"></div></div>
    </div>`).join('');
  setTimeout(() => $$('.bd-fill').forEach(f => f.style.width = f.dataset.w + '%'), 80);

  $('#insights').innerHTML = '<h4>AI Insights</h4><ul>' +
    a.insights.map(([ic, txt]) => `<li data-ic="${ic}">${escapeHtml(txt)}</li>`).join('') + '</ul>';

  $('#matchedChips').innerHTML = a.matched.length
    ? a.matched.map(s => `<span class="chip">${s}</span>`).join('')
    : '<span class="chip">No direct keywords found</span>';
  $('#missingChips').innerHTML = a.missing.length
    ? a.missing.map(s => `<span class="chip">${s}</span>`).join('')
    : '<span class="chip">All key skills present</span>';

  $('#hlText').innerHTML = highlightText(resumeText, a.matched);
}

/* highlight matched keywords inside a resume excerpt */
function highlightText(text, terms) {
  const excerpt = text.slice(0, 3500);
  let html = escapeHtml(excerpt);
  const uniq = [...new Set(terms)].sort((a, b) => b.length - a.length);
  uniq.forEach(t => {
    if (!t) return;
    const re = new RegExp('(' + escapeReg(escapeHtml(t)) + ')', 'gi');
    html = html.replace(re, '<mark>$1</mark>');
  });
  if (text.length > 3500) html += ' …';
  return html;
}

$('#rescanBtn').addEventListener('click', () => {
  resumeText = ''; currentAnalysis = null;
  ['pasteArea','candName','candPosition','candEmail','candPhone','candNotes'].forEach(id => $('#' + id).value = '');
  $('#candSource').selectedIndex = 0;
  $('#contactPrefill').textContent = '';
  $('#fileStatus').textContent = ''; fileInput.value = '';
  $('#resultBody').hidden = true; $('#resultEmpty').hidden = false;
  $('#analyzeBtn').disabled = true;
});

$('#saveBtn').addEventListener('click', () => {
  if (!currentAnalysis) return;
  const a = currentAnalysis;
  candidates.push({
    id: Date.now(), name: a.name, dept: a.dept, score: a.total, verdict: a.verdict,
    skills: a.matched.slice(0, 4), years: a.years, edu: a.eduLevel,
    position: $('#candPosition').value.trim(),
    email: $('#candEmail').value.trim(),
    phone: $('#candPhone').value.trim(),
    source: $('#candSource').value,
    notes: $('#candNotes').value.trim(),
    date: new Date().toISOString(),
    stage: a.total >= 65 ? 'Shortlisted' : 'New'
  });
  saveCandidates();
  toast(`Saved "${a.name}" to the candidate pool.`);
  updateHeroStats();
});

/* ===================================================
   CANDIDATE POOL
   =================================================== */
function renderPool() {
  const dept = $('#filterDept').value;
  const minScore = parseInt($('#filterScore').value, 10);
  const stage = $('#filterStatus').value;
  const q = $('#searchBox').value.trim().toLowerCase();

  const list = candidates
    .filter(c => !dept || c.dept === dept)
    .filter(c => c.score >= minScore)
    .filter(c => !stage || c.stage === stage)
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.skills || []).join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.score - a.score);

  renderDashboard();

  const body = $('#poolBody');
  $('#poolEmpty').style.display = list.length ? 'none' : 'block';
  body.innerHTML = list.map((c, i) => {
    const d = DEPARTMENTS[c.dept];
    const chips = (c.skills || []).map(s => `<span class="mini-chip">${s}</span>`).join('') || '—';
    const opts = STAGES.map(s => `<option value="${s}" ${c.stage === s ? 'selected' : ''}>${s}</option>`).join('');
    return `
      <tr>
        <td data-label="Rank"><span class="rank-badge ${i === 0 ? 'top' : ''}">${i + 1}</span></td>
        <td data-label="Candidate">
          <div class="cand-name">${escapeHtml(c.name)}</div>
          <div class="cand-sub">${c.position ? escapeHtml(c.position) + ' · ' : ''}${c.years ? c.years + ' yrs · ' : ''}${c.edu || ''}</div>
          ${c.email ? `<div class="cand-sub">✉ ${escapeHtml(c.email)}${c.phone ? ' · ☎ ' + escapeHtml(c.phone) : ''}</div>` : ''}
        </td>
        <td data-label="Department"><span class="dept-tag">${d ? d.emoji + ' ' + d.name : c.dept}</span></td>
        <td data-label="Score"><span class="score-tag" style="background:${scoreColor(c.score)}">${c.score}</span></td>
        <td data-label="Skills"><div class="mini-chips">${chips}</div></td>
        <td data-label="Stage">
          <select class="stage-select stage-${c.stage}" data-act="stage" data-id="${c.id}">${opts}</select>
        </td>
        <td data-label="">
          <button class="icon-btn" data-act="del" data-id="${c.id}" title="Remove">🗑️</button>
        </td>
      </tr>`;
  }).join('');
}

/* HR Insights dashboard */
function renderDashboard() {
  const dash = $('#hrDash');
  const total = candidates.length;
  if (!total) { dash.innerHTML = ''; return; }
  const inPipeline = candidates.filter(c => ACTIVE_STAGES.includes(c.stage)).length;
  const selected = candidates.filter(c => c.stage === 'Selected').length;
  const avg = Math.round(candidates.reduce((s, c) => s + c.score, 0) / total);

  const bands = [
    { label: 'Excellent', min: 80, color: 'var(--green)' },
    { label: 'Strong', min: 65, max: 79, color: 'var(--blue)' },
    { label: 'Average', min: 50, max: 64, color: 'var(--amber)' },
    { label: 'Below', min: 0, max: 49, color: 'var(--red)' }
  ];
  const distRows = bands.map(b => {
    const n = candidates.filter(c => c.score >= b.min && (b.max === undefined || c.score <= b.max)).length;
    const pct = Math.round((n / total) * 100);
    return `<div class="dist-row"><span class="dl">${b.label}</span>
      <div class="dist-track"><div class="dist-fill" style="background:${b.color};width:0" data-w="${pct}"></div></div>
      <span class="dn">${n}</span></div>`;
  }).join('');

  dash.innerHTML = `
    <div class="kpi"><div class="kpi-val">${total}</div><div class="kpi-label">Total Candidates</div></div>
    <div class="kpi blue"><div class="kpi-val">${inPipeline}</div><div class="kpi-label">In Pipeline</div></div>
    <div class="kpi green"><div class="kpi-val">${selected}</div><div class="kpi-label">Selected</div></div>
    <div class="kpi amber"><div class="kpi-val">${avg}</div><div class="kpi-label">Avg. Score</div></div>
    <div class="dist-card"><h4>Score Distribution</h4>${distRows}</div>`;
  setTimeout(() => $$('.dist-fill', dash).forEach(f => f.style.width = f.dataset.w + '%'), 60);
}

$('#poolBody').addEventListener('change', e => {
  const sel = e.target.closest('select[data-act="stage"]');
  if (!sel) return;
  const c = candidates.find(x => x.id === Number(sel.dataset.id));
  if (!c) return;
  c.stage = sel.value;
  saveCandidates(); renderPool(); updateHeroStats();
});

$('#poolBody').addEventListener('click', e => {
  const btn = e.target.closest('button[data-act="del"]'); if (!btn) return;
  candidates = candidates.filter(x => x.id !== Number(btn.dataset.id));
  saveCandidates(); renderPool(); updateHeroStats();
});
['filterDept','filterScore','filterStatus','searchBox'].forEach(id => $('#' + id).addEventListener('input', renderPool));

$('#clearBtn').addEventListener('click', () => {
  if (!candidates.length) { toast('Pool is already empty.'); return; }
  if (confirm('Remove ALL candidates from the pool? This cannot be undone.')) {
    candidates = []; saveCandidates(); renderPool(); updateHeroStats(); toast('Candidate pool cleared.');
  }
});

$('#exportBtn').addEventListener('click', () => {
  if (!candidates.length) { toast('Nothing to export.'); return; }
  const rows = [['Name','Position','Department','Score','Verdict','Experience(yrs)','Education','Email','Phone','Source','Stage','TopSkills','Notes','Date']];
  candidates.slice().sort((a, b) => b.score - a.score).forEach(c => {
    const d = DEPARTMENTS[c.dept];
    rows.push([c.name, c.position || '', d ? d.name : c.dept, c.score, c.verdict, c.years, c.edu || '',
      c.email || '', c.phone || '', c.source || '', c.stage || '',
      (c.skills || []).join(' | '), c.notes || '', new Date(c.date).toLocaleDateString()]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'aarti_talentforge_candidates.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('Exported shortlist to CSV.');
});

/* ---------- Hero stats (animated count-up) ---------- */
function countTo(el, target) {
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) { el.textContent = target; return; }
  const steps = 28; let i = 0;
  clearInterval(el._iv);
  el._iv = setInterval(() => {
    i++; const v = Math.round(start + (target - start) * (i / steps));
    el.textContent = v;
    if (i >= steps) { el.textContent = target; clearInterval(el._iv); }
  }, 22);
}
function updateHeroStats() {
  const total = candidates.length;
  const shortlisted = candidates.filter(c => ACTIVE_STAGES.includes(c.stage)).length;
  const avg = total ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / total) : 0;
  countTo($('[data-stat="total"]'), total);
  countTo($('[data-stat="shortlisted"]'), shortlisted);
  countTo($('[data-stat="avg"]'), avg);
}

/* ---------- Rotating department ticker ---------- */
function startTicker() {
  const el = $('#rotateWord'); if (!el) return;
  const names = Object.values(DEPARTMENTS).map(d => d.name);
  let i = 0;
  setInterval(() => {
    i = (i + 1) % names.length;
    el.classList.add('swap');
    setTimeout(() => { el.textContent = names[i]; el.classList.remove('swap'); }, 350);
  }, 2400);
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  els.forEach(e => io.observe(e));
}

/* ---------- Hero talent-network background ---------- */
function initHeroNetwork() {
  const canvas = $('#netCanvas');
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes, raf;
  const COUNT = 46, LINK = 130;

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = r.width; h = canvas.height = r.height;
  }
  function build() {
    nodes = Array.from({ length: COUNT }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35
    }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK) {
          ctx.strokeStyle = `rgba(61,164,240,${(1 - dist / LINK) * 0.32})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(116,194,255,0.8)';
      ctx.beginPath(); ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }
  resize(); build(); step();
  window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); build(); step(); });
}

/* ---------- Init ---------- */
initDepartments();
updateHeroStats();
startTicker();
initReveal();
initHeroNetwork();
