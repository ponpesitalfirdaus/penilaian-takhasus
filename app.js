// --- STORAGE KEYS ---
const LOCAL_STORAGE_KEY = 'takhasus_quran_evaluations_v1';
const MASTER_SANTRI_KEY = 'takhasus_master_santri_v1';
const MASTER_PENGUJI_KEY = 'takhasus_master_penguji_v1';

let evaluations = [];
let masterSantri = [];
let masterPenguji = [];

// Sample Master Data Default
const defaultSantri = [
    { id: 's_1', nama: 'Muhammad Al-Fatih', nis: 'TKH-2026-012', kelompok: "Takhasus 'Ulya (Tingkat Lanjut)" },
    { id: 's_2', nama: 'Aisyah Humaira', nis: 'TKH-2026-045', kelompok: 'Takhasus Wustha (Tingkat Menengah)' },
    { id: 's_3', nama: 'Abdullah Azzam', nis: 'TKH-2026-001', kelompok: 'Takhasus Ula (Tingkat Dasar)' }
];

const defaultPenguji = [
    { id: 'p_1', nama: 'Ust. Ahmad Dahlan, M.Ag' },
    { id: 'p_2', nama: 'Ustadzah Fatimah, S.Pd.I' },
    { id: 'p_3', nama: 'Ust. Ahmad Fauzi, Lc.' }
];

window.onload = function() {
    const tglInput = document.getElementById('tglEvaluasi');
    if (tglInput) tglInput.value = new Date().toISOString().split('T')[0];

    loadMasterData();
    loadDataFromStorage();

    if (window.lucide) lucide.createIcons();

    calculateHafalanScore();
    calculateAdabScore();
};

// --- PREDIKAT AL-QUR'AN HELPER ---
function getPredikatQuran(score) {
    if (score >= 90) {
        return {
            title: 'Mumtaz (Istimewa)',
            badge: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
            statusText: 'Lanjut Juz Berikutnya',
            code: 'MUMTAZ'
        };
    } else if (score >= 80) {
        return {
            title: 'Jayyid Jiddan (Sangat Baik)',
            badge: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
            statusText: 'Lanjut Juz (Pemantapan Mandiri)',
            code: 'JAYYID_JIDDAN'
        };
    } else if (score >= 70) {
        return {
            title: 'Jayyid (Baik)',
            badge: 'bg-sky-100 text-sky-900 border-sky-300 font-bold',
            statusText: 'Remedial Bagian Belum Kuat',
            code: 'JAYYID'
        };
    } else if (score >= 60) {
        return {
            title: 'Maqbul (Cukup)',
            badge: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
            statusText: 'Remedial & Tes Ulang',
            code: 'MAQBUL'
        };
    } else {
        return {
            title: 'Rasib (Mengulang)',
            badge: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
            statusText: 'Bimbingan Intensif Sebelum Tes Ulang',
            code: 'RASIB'
        };
    }
}

// --- MASTER DATA FUNCTIONS ---
function loadMasterData() {
    const santriStored = localStorage.getItem(MASTER_SANTRI_KEY);
    masterSantri = santriStored ? JSON.parse(santriStored) : defaultSantri;
    if (!santriStored) localStorage.setItem(MASTER_SANTRI_KEY, JSON.stringify(masterSantri));

    const pengujiStored = localStorage.getItem(MASTER_PENGUJI_KEY);
    masterPenguji = pengujiStored ? JSON.parse(pengujiStored) : defaultPenguji;
    if (!pengujiStored) localStorage.setItem(MASTER_PENGUJI_KEY, JSON.stringify(masterPenguji));

    populateMasterDropdowns();
    renderMasterTables();
}

function populateMasterDropdowns() {
    const selSantri = document.getElementById('selectSantri');
    const selPenguji = document.getElementById('selectPenguji');

    if (selSantri) {
        selSantri.innerHTML = '<option value="">-- Pilih Santri --</option>';
        masterSantri.forEach(s => {
            selSantri.innerHTML += `<option value="${s.id}">${s.nama} (${s.nis})</option>`;
        });
    }

    if (selPenguji) {
        selPenguji.innerHTML = '<option value="">-- Pilih Penguji --</option>';
        masterPenguji.forEach(p => {
            selPenguji.innerHTML += `<option value="${p.nama}">${p.nama}</option>`;
        });
    }
}

function onSantriSelected(santriId) {
    const santri = masterSantri.find(s => s.id === santriId);
    if (santri) {
        document.getElementById('namaSantri').value = santri.nama;
        document.getElementById('nisSantri').value = santri.nis;
        document.getElementById('kelompokSantri').value = santri.kelompok;
    } else {
        document.getElementById('namaSantri').value = '';
        document.getElementById('nisSantri').value = '';
        document.getElementById('kelompokSantri').value = '';
    }
}

function openMasterModal() {
    document.getElementById('masterModal').classList.remove('hidden');
    renderMasterTables();
}

function closeMasterModal() {
    document.getElementById('masterModal').classList.add('hidden');
}

function switchMasterTab(tab) {
    if (tab === 'santri') {
        document.getElementById('view-master-santri').classList.remove('hidden');
        document.getElementById('view-master-penguji').classList.add('hidden');
        document.getElementById('tab-master-santri').className = 'px-4 py-2 border-b-2 border-amber-500 text-amber-900 font-bold';
        document.getElementById('tab-master-penguji').className = 'px-4 py-2 text-slate-500 hover:text-slate-700';
    } else {
        document.getElementById('view-master-santri').classList.add('hidden');
        document.getElementById('view-master-penguji').classList.remove('hidden');
        document.getElementById('tab-master-santri').className = 'px-4 py-2 text-slate-500 hover:text-slate-700';
        document.getElementById('tab-master-penguji').className = 'px-4 py-2 border-b-2 border-amber-500 text-amber-900 font-bold';
    }
}

function addMasterSantri(e) {
    e.preventDefault();
    const nama = document.getElementById('newNamaSantri').value.trim();
    const nis = document.getElementById('newNisSantri').value.trim();
    const kelompok = document.getElementById('newKelompokSantri').value;

    masterSantri.unshift({ id: 's_' + Date.now(), nama, nis, kelompok });
    localStorage.setItem(MASTER_SANTRI_KEY, JSON.stringify(masterSantri));

    document.getElementById('newNamaSantri').value = '';
    document.getElementById('newNisSantri').value = '';

    populateMasterDropdowns();
    renderMasterTables();
    showToast('Santri berhasil ditambahkan.', 'success');
}

function deleteMasterSantri(id) {
    masterSantri = masterSantri.filter(s => s.id !== id);
    localStorage.setItem(MASTER_SANTRI_KEY, JSON.stringify(masterSantri));
    populateMasterDropdowns();
    renderMasterTables();
}

function addMasterPenguji(e) {
    e.preventDefault();
    const nama = document.getElementById('newNamaPenguji').value.trim();
    masterPenguji.unshift({ id: 'p_' + Date.now(), nama });
    localStorage.setItem(MASTER_PENGUJI_KEY, JSON.stringify(masterPenguji));
    document.getElementById('newNamaPenguji').value = '';
    populateMasterDropdowns();
    renderMasterTables();
    showToast('Penguji berhasil ditambahkan.', 'success');
}

function deleteMasterPenguji(id) {
    masterPenguji = masterPenguji.filter(p => p.id !== id);
    localStorage.setItem(MASTER_PENGUJI_KEY, JSON.stringify(masterPenguji));
    populateMasterDropdowns();
    renderMasterTables();
}

function renderMasterTables() {
    const tbSantri = document.getElementById('masterSantriTable');
    const tbPenguji = document.getElementById('masterPengujiTable');

    if (tbSantri) {
        tbSantri.innerHTML = masterSantri.map(s => `
            <tr>
                <td class="p-2 font-semibold">${escapeHtml(s.nama)}</td>
                <td class="p-2">${escapeHtml(s.nis)}</td>
                <td class="p-2 text-slate-500">${escapeHtml(s.kelompok)}</td>
                <td class="p-2 text-center">
                    <button onclick="deleteMasterSantri('${s.id}')" class="text-rose-600 hover:text-rose-800"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if (tbPenguji) {
        tbPenguji.innerHTML = masterPenguji.map(p => `
            <tr>
                <td class="p-2 font-semibold">${escapeHtml(p.nama)}</td>
                <td class="p-2 text-center">
                    <button onclick="deleteMasterPenguji('${p.id}')" class="text-rose-600 hover:text-rose-800"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if (window.lucide) lucide.createIcons();
}

// --- EVALUATIONS DATA STORAGE ---
function loadDataFromStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        try {
            evaluations = JSON.parse(stored);
        } catch(e) {
            evaluations = [];
        }
    }
    renderTable();
    populateRaporSelect();
}

function saveDataToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(evaluations));
    renderTable();
    populateRaporSelect();
}

// --- TAB NAVIGATION ---
function switchTab(tabKey) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'shadow', 'font-bold');
        btn.classList.add('text-amber-100', 'hover:bg-white/10');
    });

    const activeTab = document.getElementById('tab-' + tabKey);
    const activeView = document.getElementById('view-' + tabKey);

    if (activeView && activeTab) {
        activeView.classList.remove('hidden');
        activeTab.classList.add('bg-amber-500', 'text-slate-950', 'shadow', 'font-bold');
        activeTab.classList.remove('text-amber-100', 'hover:bg-white/10');
    }

    if (tabKey === 'rekap') renderTable();
    if (tabKey === 'print') {
        populateRaporSelect();
        const sel = document.getElementById('raporSelectSantri');
        if (sel && sel.value) loadRaporView(sel.value);
    }

    if (window.lucide) lucide.createIcons();
}

// --- REAL-TIME CALCULATIONS ---
function calculateHafalanScore() {
    const kelancaran = parseFloat(document.getElementById('hafalan_kelancaran')?.value) || 0;
    const tajwid = parseFloat(document.getElementById('hafalan_tajwid')?.value) || 0;
    const urutan = parseFloat(document.getElementById('hafalan_urutan')?.value) || 0;
    const kemandirian = parseFloat(document.getElementById('hafalan_kemandirian')?.value) || 0;

    const c_kelancaran = kelancaran * 0.40;
    const c_tajwid = tajwid * 0.25;
    const c_urutan = urutan * 0.20;
    const c_kemandirian = kemandirian * 0.15;

    if (document.getElementById('contrib_kelancaran')) document.getElementById('contrib_kelancaran').innerText = c_kelancaran.toFixed(1);
    if (document.getElementById('contrib_tajwid')) document.getElementById('contrib_tajwid').innerText = c_tajwid.toFixed(1);
    if (document.getElementById('contrib_urutan')) document.getElementById('contrib_urutan').innerText = c_urutan.toFixed(1);
    if (document.getElementById('contrib_kemandirian')) document.getElementById('contrib_kemandirian').innerText = c_kemandirian.toFixed(1);

    const total = c_kelancaran + c_tajwid + c_urutan + c_kemandirian;
    if (document.getElementById('totalHafalanDisplay')) document.getElementById('totalHafalanDisplay').innerText = total.toFixed(1);

    updateStatusIndicator(total);
}

function updateStatusIndicator(score) {
    const badgeContainer = document.getElementById('statusBadgeContainer');
    const descContainer = document.getElementById('statusRecommendationText');

    if (!badgeContainer || !descContainer) return;

    const pred = getPredikatQuran(score);

    badgeContainer.innerHTML = `
        <span class="inline-flex items-center gap-1 ${pred.badge} border px-3 py-1 rounded-full text-xs">
            ${pred.title}
        </span>
    `;
    descContainer.innerHTML = `<span class="text-amber-300 font-semibold">&bull; Status:</span> ${pred.statusText}`;

    if (window.lucide) lucide.createIcons();
}

function calculateAdabScore() {
    const fields = ['allah', 'guru', 'quran', 'teman', 'tanggungjawab', 'lingkungan', 'kejujuran', 'kemandirian', 'emosi'];
    let total = 0;

    fields.forEach(f => {
        const el = document.getElementById('adab_' + f);
        total += parseInt(el?.value) || 0;
    });

    if (document.getElementById('totalAdabDisplay')) document.getElementById('totalAdabDisplay').innerText = total;

    const predikatBadge = document.getElementById('adabPredikatBadge');
    if (predikatBadge) {
        if (total >= 90) {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
            predikatBadge.innerText = 'Sangat Baik';
        } else if (total >= 80) {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900';
            predikatBadge.innerText = 'Baik';
        } else if (total >= 70) {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800';
            predikatBadge.innerText = 'Cukup';
        } else {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800';
            predikatBadge.innerText = 'Perlu Bimbingan';
        }
    }
}

// --- FORM SUBMISSION ---
function handleFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-id').value;
    const totalHafalan = parseFloat(document.getElementById('totalHafalanDisplay').innerText);

    const fieldsAdab = ['allah', 'guru', 'quran', 'teman', 'tanggungjawab', 'lingkungan', 'kejujuran', 'kemandirian', 'emosi'];
    let sumAdab = 0;
    const adabObj = {};
    fieldsAdab.forEach(f => {
        const v = parseInt(document.getElementById('adab_' + f)?.value) || 0;
        adabObj[f] = v;
        sumAdab += v;
    });

    const namaSantri = document.getElementById('namaSantri').value;
    const nisSantri = document.getElementById('nisSantri').value;
    const kelompokSantri = document.getElementById('kelompokSantri').value;
    const namaPenguji = document.getElementById('selectPenguji').value;

    if (!namaSantri) {
        showToast('Sila pilih Santri terlebih dahulu!', 'warning');
        return;
    }

    const evalObj = {
        id: editId ? editId : 'eval_' + Date.now(),
        namaSantri: namaSantri,
        nisSantri: nisSantri,
        kelompokSantri: kelompokSantri,
        juzUjian: document.getElementById('juzUjian').value.trim(),
        tglEvaluasi: document.getElementById('tglEvaluasi').value,
        namaPenguji: namaPenguji,
        hafalan: {
            kelancaran: parseFloat(document.getElementById('hafalan_kelancaran').value) || 0,
            tajwid: parseFloat(document.getElementById('hafalan_tajwid').value) || 0,
            urutan: parseFloat(document.getElementById('hafalan_urutan').value) || 0,
            kemandirian: parseFloat(document.getElementById('hafalan_kemandirian').value) || 0
        },
        totalHafalan: totalHafalan,
        adab: adabObj,
        totalAdab: sumAdab,
        catatan: document.getElementById('catatanPenguji').value.trim()
    };

    if (editId) {
        const idx = evaluations.findIndex(item => item.id === editId);
        if (idx !== -1) evaluations[idx] = evalObj;
        showToast('Data penilaian berhasil dikemaskini!', 'success');
    } else {
        evaluations.unshift(evalObj);
        showToast('Data penilaian berhasil disimpan!', 'success');
    }

    saveDataToStorage();
    resetForm();
    switchTab('rekap');
}

function resetForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('evaluationForm').reset();
    document.getElementById('namaSantri').value = '';
    document.getElementById('tglEvaluasi').value = new Date().toISOString().split('T')[0];
    calculateHafalanScore();
    calculateAdabScore();
}

// --- TABLE RENDER & REKAP ---
function renderTable() {
    const tbody = document.getElementById('rekapTableBody');
    if (!tbody) return;

    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const filter = document.getElementById('filterStatus')?.value || 'ALL';

    tbody.innerHTML = '';

    let filtered = evaluations.filter(item => {
        const matchSearch = item.namaSantri.toLowerCase().includes(search) || item.nisSantri.toLowerCase().includes(search);
        let matchStatus = true;
        const pred = getPredikatQuran(item.totalHafalan);
        if (filter !== 'ALL') matchStatus = pred.code === filter;

        return matchSearch && matchStatus;
    });

    if (document.getElementById('statTotalSantri')) document.getElementById('statTotalSantri').innerText = evaluations.length;
    const countLulus = evaluations.filter(i => i.totalHafalan >= 80).length;
    const countRemedial = evaluations.filter(i => i.totalHafalan < 80 && i.totalHafalan >= 60).length;
    const avgHafalan = evaluations.length > 0 ? (evaluations.reduce((acc, curr) => acc + curr.totalHafalan, 0) / evaluations.length).toFixed(1) : '0.0';

    if (document.getElementById('statLulus')) document.getElementById('statLulus').innerText = countLulus;
    if (document.getElementById('statRemedial')) document.getElementById('statRemedial').innerText = countRemedial;
    if (document.getElementById('statAvgHafalan')) document.getElementById('statAvgHafalan').innerText = avgHafalan;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="font-medium text-xs">Belum ada data penilaian santri yang sesuai.</p>
                </td>
            </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    filtered.forEach(item => {
        const pred = getPredikatQuran(item.totalHafalan);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition';
        tr.innerHTML = `
            <td class="p-3.5">
                <div class="font-bold text-slate-800">${escapeHtml(item.namaSantri)}</div>
                <div class="text-[11px] text-slate-400">${escapeHtml(item.nisSantri)} | ${escapeHtml(item.kelompokSantri)}</div>
            </td>
            <td class="p-3.5 font-medium text-slate-700">${escapeHtml(item.juzUjian)}</td>
            <td class="p-3.5 text-center font-bold text-blue-900 text-base">${item.totalHafalan.toFixed(1)}</td>
            <td class="p-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-[11px] border ${pred.badge}">${pred.title}</span>
            </td>
            <td class="p-3.5 text-center font-bold text-amber-700">${item.totalAdab}</td>
            <td class="p-3.5 text-slate-500 text-xs">${item.tglEvaluasi}</td>
            <td class="p-3.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="openWaModalFor('${item.id}')" title="Kirim WA" class="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition">
                        <i data-lucide="message-square" class="w-4 h-4"></i>
                    </button>
                    <button onclick="editEvaluation('${item.id}')" title="Edit Data" class="p-1.5 bg-blue-50 text-blue-900 hover:bg-blue-100 rounded-lg transition">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteEvaluation('${item.id}')" title="Hapus" class="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
}

function editEvaluation(id) {
    const item = evaluations.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-id').value = item.id;

    // Set dropdown santri jika wujud
    const s = masterSantri.find(x => x.nama === item.namaSantri);
    if (s) {
        document.getElementById('selectSantri').value = s.id;
        onSantriSelected(s.id);
    } else {
        document.getElementById('selectSantri').value = '';
        document.getElementById('namaSantri').value = item.namaSantri;
        document.getElementById('nisSantri').value = item.nisSantri;
        document.getElementById('kelompokSantri').value = item.kelompokSantri;
    }

    document.getElementById('selectPenguji').value = item.namaPenguji;
    document.getElementById('juzUjian').value = item.juzUjian;
    document.getElementById('tglEvaluasi').value = item.tglEvaluasi;

    document.getElementById('hafalan_kelancaran').value = item.hafalan.kelancaran;
    document.getElementById('hafalan_tajwid').value = item.hafalan.tajwid;
    document.getElementById('hafalan_urutan').value = item.hafalan.urutan;
    document.getElementById('hafalan_kemandirian').value = item.hafalan.kemandirian;

    const fieldsAdab = ['allah', 'guru', 'quran', 'teman', 'tanggungjawab', 'lingkungan', 'kejujuran', 'kemandirian', 'emosi'];
    fieldsAdab.forEach(f => {
        if (item.adab && item.adab[f] !== undefined) {
            document.getElementById('adab_' + f).value = item.adab[f];
        }
    });

    document.getElementById('catatanPenguji').value = item.catatan || '';

    calculateHafalanScore();
    calculateAdabScore();
    switchTab('input');
    showToast('Data dimuat ke borang input untuk diedit.', 'info');
}

function deleteEvaluation(id) {
    if (window.confirm('Adakah anda pasti mahu memadamkan data penilaian santri ini?')) {
        evaluations = evaluations.filter(i => i.id !== id);
        saveDataToStorage();
        showToast('Data berhasil dipadamkan.', 'info');
    }
}

// --- RAPOR PRINT GENERATOR ---
function populateRaporSelect() {
    const sel = document.getElementById('raporSelectSantri');
    if (!sel) return;

    sel.innerHTML = '';

    if (evaluations.length === 0) {
        sel.innerHTML = '<option value="">(Belum Ada Data Santri)</option>';
        if (document.getElementById('raporContainer')) {
            document.getElementById('raporContainer').innerHTML = '<p class="text-center py-10 text-slate-400">Belum ada data evaluasi santri.</p>';
        }
        return;
    }

    evaluations.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.innerText = `${item.namaSantri} - ${item.juzUjian} (${item.tglEvaluasi})`;
        sel.appendChild(opt);
    });

    if (sel.value) loadRaporView(sel.value);
}

function loadRaporView(id) {
    const item = evaluations.find(i => i.id === id);
    const container = document.getElementById('raporContainer');
    if (!container) return;

    if (!item) {
        container.innerHTML = '<p class="text-center text-slate-400 py-10">Data tidak ditemukan.</p>';
        return;
    }

    const pred = getPredikatQuran(item.totalHafalan);

    container.innerHTML = `
        <!-- Kop Rapor -->
        <div class="border-b-2 border-blue-950 pb-4 mb-6 text-center">
            <img src="https://lh3.googleusercontent.com/d/1Zw8z1i2yixH-k6umwcDbOc7Xu6v3HTQl" alt="Logo Al Firdaus" class="w-20 h-20 mx-auto mb-2 object-contain">
            <h2 class="text-xl sm:text-2xl font-extrabold text-blue-950 tracking-wide uppercase">RAPOR EVALUASI TAKHASUS AL-QUR'AN</h2>
            <p class="text-xs sm:text-sm text-amber-700 font-bold">AL FIRDAUS BANDAR LAMPUNG</p>
            <p class="text-xs text-slate-500">Lembaga Pendidikan Al-Qur'an & Bimbingan Hafalan</p>
        </div>

        <!-- Info Santri & Penguji -->
        <div class="grid grid-cols-2 gap-4 text-xs sm:text-sm mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
                <p class="text-slate-500">Nama Santri: <strong class="text-slate-800">${escapeHtml(item.namaSantri)}</strong></p>
                <p class="text-slate-500 mt-1">NIS / ID: <strong class="text-slate-800">${escapeHtml(item.nisSantri)}</strong></p>
                <p class="text-slate-500 mt-1">Kelompok: <strong class="text-slate-800">${escapeHtml(item.kelompokSantri)}</strong></p>
            </div>
            <div>
                <p class="text-slate-500">Juz Ujian: <strong class="text-slate-800">${escapeHtml(item.juzUjian)}</strong></p>
                <p class="text-slate-500 mt-1">Tanggal Evaluasi: <strong class="text-slate-800">${item.tglEvaluasi}</strong></p>
                <p class="text-slate-500 mt-1">Penguji: <strong class="text-slate-800">${escapeHtml(item.namaPenguji)}</strong></p>
            </div>
        </div>

        <!-- Table Assessment Breakdown -->
        <div class="mb-6">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-amber-500 pl-2">A. Capaian Penilaian Hafalan</h3>
            <table class="w-full text-xs sm:text-sm border-collapse border border-slate-300">
                <thead>
                    <tr class="bg-slate-100 text-slate-700 font-bold">
                        <th class="border border-slate-300 p-2 text-left">Komponen Penilaian</th>
                        <th class="border border-slate-300 p-2 text-center">Bobot</th>
                        <th class="border border-slate-300 p-2 text-center">Nilai Mentah</th>
                        <th class="border border-slate-300 p-2 text-center">Nilai Akhir</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="border border-slate-300 p-2">Kelancaran & Ketepatan Hafalan</td>
                        <td class="border border-slate-300 p-2 text-center">40%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.kelancaran}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${(item.hafalan.kelancaran * 0.4).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Tajwid & Makhorijul Huruf</td>
                        <td class="border border-slate-300 p-2 text-center">25%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.tajwid}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${(item.hafalan.tajwid * 0.25).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Ketepatan Ayat & Urutan Ayat</td>
                        <td class="border border-slate-300 p-2 text-center">20%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.urutan}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${(item.hafalan.urutan * 0.20).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Kemandirian & Kesiapan Hafalan</td>
                        <td class="border border-slate-300 p-2 text-center">15%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.kemandirian}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-blue-900">${(item.hafalan.kemandirian * 0.15).toFixed(1)}</td>
                    </tr>
                    <tr class="bg-amber-50 font-bold">
                        <td colspan="3" class="border border-slate-300 p-2 text-right text-slate-800">TOTAL NILAI HAFALAN</td>
                        <td class="border border-slate-300 p-2 text-center text-base text-blue-950 font-extrabold">${item.totalHafalan.toFixed(1)} / 100</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Adab Breakdown & Result Box -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-blue-900 pl-2">B. Skor Adab & Karakter</h3>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div class="flex justify-between"><span>Total Skor Adab:</span> <strong class="text-blue-900 font-bold text-sm">${item.totalAdab} / 100</strong></div>
                    <div class="flex justify-between text-slate-500"><span>Kualifikasi:</span> <span>${getAdabPredikatText(item.totalAdab)}</span></div>
                </div>
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-amber-500 pl-2">C. Predikat Al-Qur'an & Status</h3>
                <div class="p-3 rounded-xl border ${pred.badge} text-xs">
                    <strong class="block font-bold text-sm mb-1">${pred.title}</strong>
                    <span>${pred.statusText}</span>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div class="mb-8">
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-slate-600 pl-2">D. Catatan / Rekomendasi Ustadz Penguji</h3>
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs italic text-slate-700">
                "${escapeHtml(item.catatan || 'Tidak ada catatan tambahan.')}"
            </div>
        </div>

        <!-- Signatures -->
        <div class="grid grid-cols-2 text-center text-xs mt-12 pt-6 border-t border-slate-200">
            <div>
                <p class="text-slate-500">Orang Tua / Wali Santri</p>
                <div class="h-16"></div>
                <p class="font-bold text-slate-800">( ............................................ )</p>
            </div>
            <div>
                <p class="text-slate-500">Penguji / Bimbingan Takhasus</p>
                <div class="h-16"></div>
                <p class="font-bold text-slate-800">${escapeHtml(item.namaPenguji)}</p>
            </div>
        </div>
    `;
}

// --- WHATSAPP MESSAGE GENERATOR ---
function openWaModalFor(id) {
    const item = evaluations.find(i => i.id === id);
    if (!item) return;

    const pred = getPredikatQuran(item.totalHafalan);

    const text = `*RAPOR EVALUASI TAKHASUS AL-QUR'AN* 📖\n` +
        `*AL FIRDAUS BANDAR LAMPUNG*\n` +
        `----------------------------------------\n` +
        `*Nama Santri:* ${item.namaSantri}\n` +
        `*NIS:* ${item.nisSantri}\n` +
        `*Kelompok:* ${item.kelompokSantri}\n` +
        `*Materi/Juz Ujian:* ${item.juzUjian}\n` +
        `*Tanggal Evaluasi:* ${item.tglEvaluasi}\n\n` +
        `*HASIL EVALUASI:* \n` +
        `📊 *Nilai Hafalan:* ${item.totalHafalan.toFixed(1)} / 100\n` +
        `   • Kelancaran (40%): ${item.hafalan.kelancaran}\n` +
        `   • Tajwid & Makhraj (25%): ${item.hafalan.tajwid}\n` +
        `   • Urutan Ayat (20%): ${item.hafalan.urutan}\n` +
        `   • Kemandirian (15%): ${item.hafalan.kemandirian}\n\n` +
        `🌟 *Predikat Al-Qur'an:* ${pred.title}\n` +
        `🤲 *Skor Adab & Karakter:* ${item.totalAdab} / 100 (${getAdabPredikatText(item.totalAdab)})\n\n` +
        `📌 *Status/Rekomendasi:* ${pred.statusText}\n\n` +
        `📝 *Catatan Penguji:* \n"${item.catatan || '-'}"\n\n` +
        `_Penguji: ${item.namaPenguji}_\n` +
        `_Barakallahu Fiikum._`;

    document.getElementById('waTextContent').value = text;
    document.getElementById('waModal').classList.remove('hidden');
}

function closeWaModal() {
    document.getElementById('waModal').classList.add('hidden');
}

function copyWaText() {
    const textEl = document.getElementById('waTextContent');
    textEl.select();
    document.execCommand('copy');
    showToast('Teks WhatsApp berhasil disalin ke papan klip!', 'success');
}

// --- CSV EXPORT ---
function exportCSV() {
    if (evaluations.length === 0) {
        showToast('Tidak ada data untuk diekspor.', 'warning');
        return;
    }

    let csv = 'ID,Nama Santri,NIS,Kelompok,Juz Ujian,Tanggal,Nilai Hafalan,Predikat Quran,Skor Adab,Penguji,Catatan\n';

    evaluations.forEach(i => {
        const pred = getPredikatQuran(i.totalHafalan);
        csv += `"${i.id}","${i.namaSantri}","${i.nisSantri}","${i.kelompokSantri}","${i.juzUjian}","${i.tglEvaluasi}",${i.totalHafalan.toFixed(1)},"${pred.title}",${i.totalAdab},"${i.namaPenguji}","${(i.catatan || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Takhasus_AlFirdaus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fail CSV berhasil dimuat turun.', 'success');
}

// --- HELPER UTILITIES ---
function getAdabPredikatText(score) {
    if (score >= 90) return 'Sangat Baik';
    if (score >= 80) return 'Baik';
    if (score >= 70) return 'Cukup';
    return 'Perlu Bimbingan';
}

function escapeHtml(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');

    let typeClass = 'bg-slate-900 text-white border-amber-400/50';
    if (type === 'success') typeClass = 'bg-blue-950 text-white border-amber-400';
    if (type === 'warning') typeClass = 'bg-amber-600 text-white';

    toast.className = `px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border transform transition duration-300 translate-y-2 opacity-0 flex items-center gap-2 ${typeClass}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
