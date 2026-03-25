/* ════════════════════════════════════════════════
   KOVER — script.js   v5
   Word-only · Grouped student cards · Mandatory logo
   ════════════════════════════════════════════════ */
'use strict';

/* ── PAGE NAV ── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(id);
  if (t) { t.classList.add('active'); window.scrollTo({ top: 0, behavior: 'instant' }); }
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('revealed'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

/* ── LOGO UPLOAD ── */
let logoDataURL = null;

function initLogoUpload() {
  const zone        = document.getElementById('uploadZone');
  const input       = document.getElementById('logoInput');
  const preview     = document.getElementById('logoPreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const removeBtn   = document.getElementById('removeLogo');

  input.addEventListener('change', () => handleLogoFile(input.files[0]));
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) handleLogoFile(f);
  });

  function handleLogoFile(file) {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      showToast('Please upload a PNG or JPG image.', 'error'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File must be under 5MB.', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      logoDataURL = e.target.result;
      preview.src = logoDataURL;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      removeBtn.style.display = 'inline-flex';
      zone.classList.remove('has-error');
      document.getElementById('logoErr').classList.remove('visible');
    };
    reader.readAsDataURL(file);
  }
}

function removeLogo() {
  logoDataURL = null;
  document.getElementById('logoPreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = '';
  document.getElementById('removeLogo').style.display = 'none';
  document.getElementById('logoInput').value = '';
}

/* ── STUDENTS (max 2) ── */
let studentCount = 1;

function addStudent() {
  if (studentCount >= 2) return;
  studentCount = 2;

  const list = document.getElementById('studentsList');
  list.classList.add('two-students');

  const div = document.createElement('div');
  div.className = 'student-card';
  div.dataset.index = '1';
  div.innerHTML = `
    <div class="student-card-header">
      <span class="student-label">Student 2</span>
      <button type="button" class="btn-remove-student" onclick="removeStudent(this)">✕ Remove</button>
    </div>
    <div class="input-group">
      <label>Full Name <span class="req-star">*</span></label>
      <input type="text" class="s-name" placeholder="e.g. Nadia Islam" />
      <span class="err-msg">Name is required</span>
    </div>
    <div class="input-group">
      <label>Student ID <span class="req-star">*</span></label>
      <input type="text" class="s-id" placeholder="e.g. 2020-3-60-013" />
      <span class="err-msg">ID is required</span>
    </div>
    <div class="input-group">
      <label>Email Address <span class="req-star">*</span></label>
      <input type="email" class="s-email" placeholder="e.g. nadia@student.edu" />
      <span class="err-msg">Email is required</span>
    </div>`;
  list.appendChild(div);

  /* Hide the add button once 2 students exist */
  document.getElementById('addStudentBtn').disabled = true;
  document.getElementById('addStudentBtn').style.opacity = '.35';
  document.getElementById('addStudentBtn').style.cursor = 'not-allowed';

  div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeStudent(btn) {
  btn.closest('.student-card').remove();
  studentCount = 1;
  document.getElementById('studentsList').classList.remove('two-students');
  const addBtn = document.getElementById('addStudentBtn');
  addBtn.disabled = false;
  addBtn.style.opacity = '';
  addBtn.style.cursor = '';
}

/* ── DOC TYPE TOGGLE ── */
function initDocTypeToggle() {
  const sel  = document.getElementById('docType');
  const wrap = document.getElementById('customDocTypeWrap');
  sel.addEventListener('change', () => {
    wrap.style.display = sel.value === 'Other' ? 'flex' : 'none';
  });
}

/* ── VALIDATION ── */
function validateForm() {
  let valid = true;
  let firstErr = null;

  function markField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const g = el.closest('.input-group');
    if (!el.value.trim()) {
      g.classList.add('has-error'); el.classList.add('invalid');
      if (!firstErr) firstErr = g;
      valid = false;
    } else {
      g.classList.remove('has-error'); el.classList.remove('invalid');
    }
  }

  /* Logo */
  if (!logoDataURL) {
    document.getElementById('uploadZone').classList.add('has-error');
    document.getElementById('logoErr').classList.add('visible');
    if (!firstErr) firstErr = document.getElementById('uploadZone');
    valid = false;
  } else {
    document.getElementById('uploadZone').classList.remove('has-error');
    document.getElementById('logoErr').classList.remove('visible');
  }

  /* Required text fields */
  ['uniName', 'deptName', 'docTitle', 'courseName', 'courseCode',
   'submissionDate', 'instructorName', 'instructorTitle', 'instructorDept'].forEach(markField);

  /* Doc type select */
  const sel = document.getElementById('docType');
  const sg  = sel.closest('.input-group') || sel.parentElement;
  if (!sel.value) {
    sg.classList.add('has-error'); sel.classList.add('invalid');
    if (!firstErr) firstErr = sg;
    valid = false;
  } else {
    sg.classList.remove('has-error'); sel.classList.remove('invalid');
  }
  if (sel.value === 'Other') markField('customDocType');

  /* Students — name, id, email all required */
  document.querySelectorAll('.student-card').forEach(card => {
    ['s-name', 's-id', 's-email'].forEach(cls => {
      const el = card.querySelector('.' + cls);
      const g  = el.closest('.input-group');
      if (!el.value.trim()) {
        g.classList.add('has-error'); el.classList.add('invalid');
        if (!firstErr) firstErr = g;
        valid = false;
      } else {
        g.classList.remove('has-error'); el.classList.remove('invalid');
      }
    });
  });

  if (!valid && firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  return valid;
}

/* ── FORM SUBMIT ── */
function initFormSubmit() {
  document.getElementById('coverForm').addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    buildCoverPage();
    openModal();
  });
}

/* ── COLLECT DATA ── */
function collectData() {
  const dt = document.getElementById('docType').value;
  const finalType = dt === 'Other' ? document.getElementById('customDocType').value : dt;

  const students = [];
  document.querySelectorAll('.student-card').forEach(card => {
    students.push({
      name:  card.querySelector('.s-name').value.trim(),
      id:    card.querySelector('.s-id').value.trim(),
      email: card.querySelector('.s-email').value.trim(),
    });
  });

  const dateRaw = document.getElementById('submissionDate').value;
  let formattedDate = '';
  if (dateRaw) {
    const d = new Date(dateRaw + 'T00:00:00');
    formattedDate = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return {
    uniName:         document.getElementById('uniName').value.trim(),
    facultyName:     document.getElementById('facultyName').value.trim(),
    deptName:        document.getElementById('deptName').value.trim(),
    docType:         finalType,
    docTitle:        document.getElementById('docTitle').value.trim(),
    courseName:      document.getElementById('courseName').value.trim(),
    courseCode:      document.getElementById('courseCode').value.trim(),
    courseSection:   document.getElementById('courseSection').value.trim(),
    semester:        document.getElementById('semester').value.trim(),
    students,
    submissionDate:  formattedDate,
    instructorName:  document.getElementById('instructorName').value.trim(),
    instructorTitle: document.getElementById('instructorTitle').value.trim(),
    instructorDept:  document.getElementById('instructorDept').value.trim(),
  };
}

/* ── BUILD COVER PAGE (modal preview) ── */
function buildCoverPage() {
  const d   = collectData();
  const out = document.getElementById('coverPageOutput');

  const logoHtml = logoDataURL
    ? `<img class="cp-logo-img" src="${logoDataURL}" alt="University Logo" />`
    : `<div class="cp-logo-placeholder">LOGO</div>`;

  function cpField(label, valueHtml) {
    return `<div class="cp-field"><span class="cp-label">${label}</span><span class="cp-value">${valueHtml}</span></div>`;
  }

  /* Students block */
  let studentsHtml = '';
  if (d.students.length === 1) {
    const s = d.students[0];
    studentsHtml = `
      <div class="cp-two-col">
        ${cpField('Submitted By', x(s.name))}
        ${cpField('Student ID', x(s.id))}
        ${cpField('Email', x(s.email))}
      </div>`;
  } else {
    /* 2 students: side-by-side columns */
    studentsHtml = `<div class="cp-students-grid">`;
    d.students.forEach((s, i) => {
      studentsHtml += `
        <div class="cp-student-col">
          <div class="cp-student-col-label">Student ${i + 1}</div>
          <div class="cp-student-row"><span class="cp-label">Name</span><span class="cp-value">${x(s.name)}</span></div>
          <div class="cp-student-row"><span class="cp-label">ID</span><span class="cp-value">${x(s.id)}</span></div>
          <div class="cp-student-row"><span class="cp-label">Email</span><span class="cp-value">${x(s.email)}</span></div>
        </div>`;
    });
    studentsHtml += `</div>`;
  }

  /* Instructor */
  let instrHtml = x(d.instructorName);
  instrHtml += `<span class="cp-value sub">${x(d.instructorTitle)}</span>`;
  instrHtml += `<span class="cp-value sub">${x(d.instructorDept)}</span>`;

  out.innerHTML = `
    <div class="cp-stripe-top"></div>
    <div class="cp-inner">
      <div class="cp-logo-wrap">${logoHtml}</div>
      <p class="cp-uni-name">${x(d.uniName)}</p>
      ${d.facultyName ? `<p class="cp-faculty-name">${x(d.facultyName)}</p>` : ''}
      <p class="cp-dept-name">${x(d.deptName)}</p>
      <div class="cp-div-thick"></div>
      <div class="cp-div-thin"></div>
      <p class="cp-doc-eyebrow">Document Type</p>
      <p class="cp-doc-type">${x(d.docType)}</p>
      <p class="cp-doc-title">${x(d.docTitle)}</p>
      <div class="cp-div-light"></div>
      <div class="cp-body">
        <div class="cp-two-col">
          ${cpField('Course Name', x(d.courseName))}
          ${cpField('Course Code', x(d.courseCode))}
          ${d.courseSection ? cpField('Section', x(d.courseSection)) : ''}
          ${d.semester      ? cpField('Semester / Term', x(d.semester)) : ''}
        </div>
        <div class="cp-div-light"></div>
        ${studentsHtml}
        <div class="cp-div-light"></div>
        <div class="cp-two-col">
          <div class="cp-field"><span class="cp-label">Submitted To</span>${instrHtml}</div>
          ${cpField('Submission Date', x(d.submissionDate))}
        </div>
      </div>
    </div>
    <div class="cp-stripe-bottom"></div>`;
}

function x(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── MODAL ── */
function openModal() {
  document.getElementById('previewModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.getElementById('previewModal').classList.remove('open');
  document.body.style.overflow = '';
}
function handleModalClick(e) {
  if (e.target === document.getElementById('previewModal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════════════════
   WORD DOWNLOAD
   • Letter 8.5" × 11" with 0 margin (bars touch edges)
   • Actual body content padded 0.75in each side
   • Logo 90×90 base64 — shows in protected view
   • Two-student layout: side-by-side table columns
   • Exactly mirrors the HTML preview
══════════════════════════════════════════════════════════ */
function downloadWord() {
  const d = collectData();
  const filename = safe(`${d.docTitle || 'cover-page'}_${d.uniName || 'kover'}.doc`);

  /* ── Helpers ── */
  function bar(color, h, mt, mb) {
    return `<table width="100%" cellpadding="0" cellspacing="0"
      style="width:100%;border-collapse:collapse;margin-top:${mt}pt;margin-bottom:${mb}pt">
      <tr><td style="background-color:${color};height:${h}pt;line-height:${h}pt;
        mso-line-height-rule:exactly;font-size:1pt;padding:0">&nbsp;</td></tr>
    </table>`;
  }
  function sep(mt) {
    return bar('#e0e6f0', 1, mt, 0);
  }
  function labelCell(text) {
    return `<td style="width:36%;padding:7pt 14pt 7pt 0;
      font-family:'Times New Roman',Times,serif;font-size:10.5pt;font-weight:bold;
      color:#0d47a1;vertical-align:top;border-bottom:1pt solid #eaeff8">${text}</td>`;
  }
  function valueCell(html) {
    return `<td style="padding:7pt 0 7pt 0;
      font-family:'Times New Roman',Times,serif;font-size:10.5pt;
      color:#1a1a1a;vertical-align:top;border-bottom:1pt solid #eaeff8">${html}</td>`;
  }
  function row(label, valueHtml) {
    return `<tr>${labelCell(label)}${valueCell(valueHtml)}</tr>`;
  }

  /* ── Logo ── */
  const logoHtml = logoDataURL
    ? `<p style="text-align:center;margin:0 0 10pt 0;line-height:1;mso-line-height-rule:exactly">
         <img src="${logoDataURL}" width="90" height="90"
           style="width:90px;height:90px;object-fit:contain;display:inline-block;vertical-align:middle"
           alt="University Logo" />
       </p>`
    : '';

  /* ── Course rows ── */
  const courseRows =
    row('Course Name', d.courseName) +
    row('Course Code', d.courseCode) +
    (d.courseSection ? row('Section', d.courseSection) : '') +
    (d.semester      ? row('Semester / Term', d.semester) : '');

  /* ── Student block ── */
  let studentBlock = '';
  if (d.students.length === 1) {
    const s = d.students[0];
    studentBlock = `
      <table width="100%" cellpadding="0" cellspacing="0"
        style="width:100%;border-collapse:collapse">
        ${row('Submitted By', s.name)}
        ${row('Student ID',   s.id)}
        ${row('Email',        s.email)}
      </table>`;
  } else {
    /* Two students: 2-column table, 3 rows each */
    const s1 = d.students[0], s2 = d.students[1];
    function sCell(val, isFirst) {
      return `<td style="width:50%;padding:6pt 8pt 6pt ${isFirst?'0':'16pt'};
        font-family:'Times New Roman',Times,serif;font-size:10pt;
        color:#1a1a1a;vertical-align:top;border-bottom:1pt solid #eaeff8">${val}</td>`;
    }
    function sLbl(val, isFirst) {
      return `<td style="width:50%;padding:6pt 8pt 2pt ${isFirst?'0':'16pt'};
        font-family:'Times New Roman',Times,serif;font-size:8.5pt;font-weight:bold;
        color:#0d47a1;text-transform:uppercase;letter-spacing:.5pt;vertical-align:top">${val}</td>`;
    }
    studentBlock = `
      <table width="100%" cellpadding="0" cellspacing="0"
        style="width:100%;border-collapse:collapse;background-color:#f8faff">
        <!-- Header row -->
        <tr style="background-color:#edf2ff">
          <td style="width:50%;padding:5pt 8pt 5pt 0;font-family:'Times New Roman',Times,serif;
            font-size:9pt;font-weight:bold;color:#0d47a1;text-transform:uppercase;
            letter-spacing:.8pt;border-bottom:2pt solid #0d47a1">Student 1</td>
          <td style="width:50%;padding:5pt 8pt 5pt 16pt;font-family:'Times New Roman',Times,serif;
            font-size:9pt;font-weight:bold;color:#0d47a1;text-transform:uppercase;
            letter-spacing:.8pt;border-bottom:2pt solid #0d47a1">Student 2</td>
        </tr>
        <!-- Name row -->
        <tr>
          ${sLbl('Name', true)}${sLbl('Name', false)}
        </tr>
        <tr>
          ${sCell(s1.name, true)}${sCell(s2.name, false)}
        </tr>
        <!-- ID row -->
        <tr>
          ${sLbl('Student ID', true)}${sLbl('Student ID', false)}
        </tr>
        <tr>
          ${sCell(s1.id, true)}${sCell(s2.id, false)}
        </tr>
        <!-- Email row -->
        <tr>
          ${sLbl('Email', true)}${sLbl('Email', false)}
        </tr>
        <tr>
          ${sCell(s1.email, true)}${sCell(s2.email, false)}
        </tr>
      </table>`;
  }

  /* ── Instructor ── */
  let instrVal = d.instructorName;
  instrVal += `<br><span style="font-family:'Times New Roman',Times,serif;font-size:9.5pt;
    color:#546e7a;font-weight:normal">${d.instructorTitle}</span>`;
  instrVal += `<br><span style="font-family:'Times New Roman',Times,serif;font-size:9.5pt;
    color:#546e7a;font-weight:normal">${d.instructorDept}</span>`;

  /* ── Full Word HTML ── */
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="Microsoft Word 15">
<!--[if gte mso 9]><xml>
<w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:SpellingState>Clean</w:SpellingState>
  <w:GrammarState>Clean</w:GrammarState>
  <w:DoNotOptimizeForBrowser/>
  <w:CompatibilityMode/>
</w:WordDocument>
</xml><![endif]-->
<style>
  @page Section1 {
    size: 8.5in 11in;
    margin: 0in 0in 0in 0in;
    mso-header-margin: 0in;
    mso-footer-margin: 0in;
    mso-paper-source: 0;
    mso-page-orientation: portrait;
  }
  div.Section1 { page: Section1; }
  body {
    font-family: 'Times New Roman', Times, serif;
    color: #111111;
    background: #ffffff;
    margin: 0; padding: 0;
    mso-margin-top-alt: 0; mso-margin-bottom-alt: 0;
  }
  p   { margin: 0; padding: 0; mso-margin-top-alt:0; mso-margin-bottom-alt:0; }
  td  { mso-line-height-rule: exactly; }
  table { border-collapse: collapse; }
  /* Content wrapper: horizontal padding only */
  .content { padding: 0 0.75in; }
</style>
</head>
<body>
<div class="Section1">

${bar('#0d47a1', 10, 0, 0)}

<div class="content">

<p style="margin-top:18pt"></p>

${logoHtml}

<p style="font-family:'Times New Roman',Times,serif;text-align:center;font-size:15pt;
  font-weight:bold;color:#0d47a1;text-transform:uppercase;letter-spacing:1.5pt;
  margin-bottom:3pt">${d.uniName}</p>
${d.facultyName ? `<p style="font-family:'Times New Roman',Times,serif;text-align:center;
  font-size:11pt;color:#283593;margin-bottom:2pt">${d.facultyName}</p>` : ''}
<p style="font-family:'Times New Roman',Times,serif;text-align:center;
  font-size:11.5pt;color:#1a237e;margin-bottom:10pt">${d.deptName}</p>

${bar('#0d47a1', 2.5, 0, 2)}
${bar('#c5cae9', 1, 0, 10)}

<p style="font-family:'Times New Roman',Times,serif;text-align:center;font-size:8pt;
  font-weight:bold;color:#546e7a;letter-spacing:3pt;text-transform:uppercase;
  margin-bottom:4pt">Document Type</p>
<p style="font-family:'Times New Roman',Times,serif;text-align:center;font-size:13pt;
  font-weight:bold;color:#0d47a1;text-transform:uppercase;letter-spacing:2.5pt;
  margin-bottom:6pt">${d.docType}</p>
<p style="font-family:'Times New Roman',Times,serif;text-align:center;font-size:16pt;
  font-weight:bold;color:#0d1b3e;line-height:1.35;margin-bottom:14pt">${d.docTitle}</p>

${sep(0)}
<table width="100%" cellpadding="0" cellspacing="0"
  style="width:100%;border-collapse:collapse">
  ${courseRows}
</table>

${sep(8)}
${studentBlock}

${sep(8)}
<table width="100%" cellpadding="0" cellspacing="0"
  style="width:100%;border-collapse:collapse">
  ${row('Submitted To', instrVal)}
  ${row('Submission Date', d.submissionDate)}
</table>

</div><!-- .content -->

${bar('#0d47a1', 8, 20, 0)}

</div><!-- .Section1 -->
</body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Word file downloaded!', 'success');
}

/* ── TOAST ── */
function showToast(msg, type = 'info') {
  document.getElementById('kover-toast')?.remove();
  const C = {
    success: { bg:'rgba(52,211,153,.14)',  bdr:'rgba(52,211,153,.38)',  clr:'#34d399', icon:'✓' },
    error:   { bg:'rgba(248,113,113,.14)', bdr:'rgba(248,113,113,.38)', clr:'#f87171', icon:'✕' },
    warning: { bg:'rgba(251,191,36,.14)',  bdr:'rgba(251,191,36,.38)',  clr:'#fbbf24', icon:'⚠' },
    info:    { bg:'rgba(0,212,170,.12)',   bdr:'rgba(0,212,170,.35)',   clr:'#00d4aa', icon:'ℹ' },
  };
  const c = C[type] || C.info;
  if (!document.getElementById('kover-toast-style')) {
    const s = document.createElement('style');
    s.id = 'kover-toast-style';
    s.textContent = `
      @keyframes kTIn  { from{opacity:0;transform:translateY(10px) scale(.96)} to{opacity:1;transform:none} }
      @keyframes kTOut { from{opacity:1} to{opacity:0;transform:translateY(6px)} }`;
    document.head.appendChild(s);
  }
  const t = document.createElement('div');
  t.id = 'kover-toast';
  t.style.cssText = `position:fixed;bottom:26px;right:26px;z-index:9999;display:flex;
    align-items:center;gap:10px;padding:13px 20px;background:${c.bg};border:1px solid ${c.bdr};
    border-radius:12px;color:${c.clr};font-family:'DM Sans',sans-serif;font-size:.88rem;
    font-weight:600;backdrop-filter:blur(14px);box-shadow:0 8px 32px rgba(0,0,0,.4);
    animation:kTIn .3s cubic-bezier(.34,1.56,.64,1) forwards;max-width:340px;`;
  t.innerHTML = `<span>${c.icon}</span><span style="color:#eef0f8;font-weight:500">${msg}</span>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'kTOut .25s ease forwards';
    setTimeout(() => t.remove(), 270);
  }, 3200);
}

/* ── UTILS ── */
function safe(name) {
  return name.replace(/[^a-z0-9_\-\.]/gi, '_').replace(/__+/g, '_').substring(0, 80);
}

/* ── LIVE VALIDATION CLEAR ── */
function initLiveValidation() {
  document.querySelectorAll('.input-group input, .input-group select').forEach(el => {
    el.addEventListener('input', () => {
      if (el.value.trim()) {
        el.classList.remove('invalid');
        el.closest('.input-group')?.classList.remove('has-error');
      }
    });
  });
  document.getElementById('studentsList').addEventListener('input', e => {
    const el = e.target;
    if (el.matches('input') && el.value.trim()) {
      el.classList.remove('invalid');
      el.closest('.input-group')?.classList.remove('has-error');
    }
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initLogoUpload();
  initDocTypeToggle();
  initFormSubmit();
  initLiveValidation();
  document.getElementById('submissionDate').value = new Date().toISOString().split('T')[0];
});