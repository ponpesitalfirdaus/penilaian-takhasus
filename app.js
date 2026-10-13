// --- APPLICATION STATE & INITIALIZATION ---
const LOCAL_STORAGE_KEY = 'takhasus_quran_evaluations_v1';
let evaluations = [];

// Sample initial data
const sampleData = [
    {
        id: 'eval_1710000000001',
        namaSantri: 'Muhammad Al-Fatih',
        nisSantri: 'TKH-2026-012',
        kelompokSantri: "Takhasus 'Ulya (Tingkat Lanjut)",
        juzUjian: 'Juz 30 (An-Naba - An-Nas)',
        tglEvaluasi: '2026-10-10',
        namaPenguji: 'Ust. Ahmad Dahlan, M.Ag',
        hafalan: { kelancaran: 90, tajwid: 88, urutan: 92, kemandirian: 95 },
        totalHafalan: 90.5,
        adab: { allah: 19, guru: 15, quran: 15, teman: 10, tanggungjawab: 10, lingkungan: 9, kejujuran: 10, kemandirian: 5, emosi: 5 },
        totalAdab: 97,
        catatan: 'MasyaAllah hafalan sangat mutqan dan tartil. Pertahankan adab tawadhu.'
    },
    {
        id: 'eval_1710000000002',
        namaSantri: 'Aisyah Humaira',
        nisSantri: 'TKH-2026-045',
        kelompokSantri: 'Takhasus Wustha (Tingkat Menengah)',
        juzUjian: 'Juz 29 (Al-Mulk - Al-Mursalat)',
        tglEvaluasi: '2026-10-12',
        namaPenguji: 'Ustadzah Fatimah, S.Pd.I',
        hafalan: { kelancaran: 78, tajwid: 82, urutan: 75, kemandirian: 80 },
        totalHafalan: 78.8,
        adab: { allah: 18, guru: 14, quran: 14, teman: 9, tanggungjawab: 8, lingkungan: 9, kejujuran: 9, kemandirian: 4, emosi: 4 },
        totalAdab: 89,
        catatan: 'Perlu murajaah ulang pada Surah Al-Maarij dan Al-Haqqah sebelum tes ulang.'
    }
];

window.onload = function() {
    const tglInput = document.getElementById('tglEvaluasi');
    if (tglInput) tglInput.value = new Date().toISOString().split('T')[0];

    loadDataFromStorage();

    if (window.lucide) {
        lucide.createIcons();
    }

    calculateHafalanScore();
    calculateAdabScore();
};

// --- DATA STORAGE FUNCTIONS ---
function loadDataFromStorage() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        try {
            evaluations = JSON.parse(stored);
        } catch(e) {
            evaluations = sampleData;
        }
    } else {
        evaluations = sampleData;
        saveDataToStorage();
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
        btn.classList.remove('bg-white', 'text-emerald-950', 'shadow', 'font-semibold');
        btn.classList.add('text-emerald-100', 'hover:bg-white/10');
    });

    const activeTab = document.getElementById('tab-' + tabKey);
    const activeView = document.getElementById('view-' + tabKey);

    if (activeView && activeTab) {
        activeView.classList.remove('hidden');
        activeTab.classList.add('bg-white', 'text-emerald-950', 'shadow', 'font-semibold');
        activeTab.classList.remove('text-emerald-100', 'hover:bg-white/10');
    }

    if (tabKey === 'rekap') renderTable();
    if (tabKey === 'print') {
        populateRaporSelect();
        const sel = document.getElementById('raporSelectSantri');
        if (sel && sel.value) loadRaporView(sel.value);
    }

    if (window.lucide) {
        lucide.createIcons();
    }
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

    if (score >= 85) {
        badgeContainer.innerHTML = `
            <span class="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Lulus Ujian
            </span>
        `;
        descContainer.innerHTML = `<span class="text-emerald-300 font-semibold">&bull; Rekomendasi:</span> dapat Melanjutkan ke juz berikutnya.`;
    } else if (score >= 75) {
        badgeContainer.innerHTML = `
            <span class="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Perlu Remedial
            </span>
        `;
        descContainer.innerHTML = `<span class="text-amber-300 font-semibold">&bull; Rekomendasi:</span> Remedial pada bagian yang belum kuat, lalu tes ulang.`;
    } else {
        badgeContainer.innerHTML = `
            <span class="inline-flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold">
                <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Bimbingan Intensif
            </span>
        `;
        descContainer.innerHTML = `<span class="text-rose-300 font-semibold">&bull; Rekomendasi:</span> Penguatan hafalan & Bimbingan Intensif Sebelum tes ulang.`;
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function calculateAdabScore() {
    const fields = ['allah', 'guru', 'quran', 'teman', 'tanggungjawab', 'lingkungan', 'kejujuran', 'kemandirian', 'emosi'];
    let total = 0;

    fields.forEach(f => {
        const el = document.getElementById('adab_' + f);
        const val = parseInt(el?.value) || 0;
        total += val;
    });

    if (document.getElementById('totalAdabDisplay')) document.getElementById('totalAdabDisplay').innerText = total;

    const predikatBadge = document.getElementById('adabPredikatBadge');
    if (predikatBadge) {
        if (total >= 90) {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800';
            predikatBadge.innerText = 'Sangat Baik';
        } else if (total >= 80) {
            predikatBadge.className = 'inline-block mt-0.5 text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800';
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

    const evalObj = {
        id: editId ? editId : 'eval_' + Date.now(),
        namaSantri: document.getElementById('namaSantri').value.trim(),
        nisSantri: document.getElementById('nisSantri').value.trim(),
        kelompokSantri: document.getElementById('kelompokSantri').value,
        juzUjian: document.getElementById('juzUjian').value.trim(),
        tglEvaluasi: document.getElementById('tglEvaluasi').value,
        namaPenguji: document.getElementById('namaPenguji').value.trim(),
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
        showToast('Data penilaian berhasil diperbarui!', 'success');
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
        if (filter === 'LANJUT') matchStatus = item.totalHafalan >= 85;
        if (filter === 'REMEDIAL') matchStatus = item.totalHafalan >= 75 && item.totalHafalan < 85;
        if (filter === 'INTENSIF') matchStatus = item.totalHafalan < 75;

        return matchSearch && matchStatus;
    });

    if (document.getElementById('statTotalSantri')) document.getElementById('statTotalSantri').innerText = evaluations.length;
    const countLulus = evaluations.filter(i => i.totalHafalan >= 85).length;
    const countRemedial = evaluations.filter(i => i.totalHafalan >= 75 && i.totalHafalan < 85).length;
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
        let statusBadge = '';
        let statusText = '';
        if (item.totalHafalan >= 85) {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Lanjut Juz</span>';
            statusText = 'Dapat Melanjutkan ke Juz Berikutnya';
        } else if (item.totalHafalan >= 75) {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Remedial</span>';
            statusText = 'Remedial bagian belum kuat, tes ulang';
        } else {
            statusBadge = '<span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Intensif</span>';
            statusText = 'Bimbingan Intensif sebelum tes ulang';
        }

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50/80 transition';
        tr.innerHTML = `
            <td class="p-3.5">
                <div class="font-bold text-slate-800">${escapeHtml(item.namaSantri)}</div>
                <div class="text-[11px] text-slate-400">${escapeHtml(item.nisSantri)} | ${escapeHtml(item.kelompokSantri)}</div>
            </td>
            <td class="p-3.5 font-medium text-slate-700">${escapeHtml(item.juzUjian)}</td>
            <td class="p-3.5 text-center font-bold text-emerald-700 text-base">${item.totalHafalan.toFixed(1)}</td>
            <td class="p-3.5 text-center font-bold text-teal-700">${item.totalAdab}</td>
            <td class="p-3.5">
                ${statusBadge}
                <p class="text-[11px] text-slate-500 mt-0.5">${statusText}</p>
            </td>
            <td class="p-3.5 text-slate-500 text-xs">${item.tglEvaluasi}</td>
            <td class="p-3.5 text-center">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="openWaModalFor('${item.id}')" title="Kirim WA" class="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition">
                        <i data-lucide="message-square" class="w-4 h-4"></i>
                    </button>
                    <button onclick="editEvaluation('${item.id}')" title="Edit Data" class="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition">
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

    if (window.lucide) {
        lucide.createIcons();
    }
}

function editEvaluation(id) {
    const item = evaluations.find(i => i.id === id);
    if (!item) return;

    document.getElementById('edit-id').value = item.id;
    document.getElementById('namaSantri').value = item.namaSantri;
    document.getElementById('nisSantri').value = item.nisSantri;
    document.getElementById('kelompokSantri').value = item.kelompokSantri;
    document.getElementById('juzUjian').value = item.juzUjian;
    document.getElementById('tglEvaluasi').value = item.tglEvaluasi;
    document.getElementById('namaPenguji').value = item.namaPenguji;

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
    showToast('Data dimuat ke form input untuk diedit.', 'info');
}

function deleteEvaluation(id) {
    if (window.confirm('Apakah Anda yakin ingin menghapus data penilaian santri ini?')) {
        evaluations = evaluations.filter(i => i.id !== id);
        saveDataToStorage();
        showToast('Data berhasil dihapus.', 'info');
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

    let statusTitle = '';
    let statusDesc = '';
    let statusClass = '';

    if (item.totalHafalan >= 85) {
        statusTitle = 'LULUS (Lanjut Juz Berikutnya)';
        statusDesc = 'MasyaAllah Hafalan Mutqan. Santri dapat melanjutkan hafalan ke Juz berikutnya.';
        statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    } else if (item.totalHafalan >= 75) {
        statusTitle = 'REMEDIAL & TES ULANG';
        statusDesc = 'Perlu perbaikan/remedial pada bagian hafalan yang belum kuat sebelum tes ulang.';
        statusClass = 'bg-amber-50 text-amber-800 border-amber-300';
    } else {
        statusTitle = 'BIMBINGAN INTENSIF';
        statusDesc = 'Memerlukan penguatan hafalan dan pendampingan intensif sebelum dapat tes ulang.';
        statusClass = 'bg-rose-50 text-rose-800 border-rose-300';
    }

    container.innerHTML = `
        <!-- Kop Rapor -->
        <div class="border-b-2 border-emerald-900 pb-4 mb-6 text-center">
            <h2 class="text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-wide uppercase">RAPOR EVALUASI TAKHASUS AL-QUR'AN</h2>
            <p class="text-xs sm:text-sm text-slate-600 font-medium">Lembaga Pendidikan Al-Qur'an & Kelompok Bimbingan Hafalan</p>
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
            <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-emerald-600 pl-2">A. Capaian Penilaian Hafalan</h3>
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
                        <td class="border border-slate-300 p-2 text-center font-bold text-emerald-700">${(item.hafalan.kelancaran * 0.4).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Tajwid & Makhorijul Huruf</td>
                        <td class="border border-slate-300 p-2 text-center">25%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.tajwid}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-emerald-700">${(item.hafalan.tajwid * 0.25).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Ketepatan Ayat & Urutan Ayat</td>
                        <td class="border border-slate-300 p-2 text-center">20%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.urutan}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-emerald-700">${(item.hafalan.urutan * 0.20).toFixed(1)}</td>
                    </tr>
                    <tr>
                        <td class="border border-slate-300 p-2">Kemandirian & Kesiapan Hafalan</td>
                        <td class="border border-slate-300 p-2 text-center">15%</td>
                        <td class="border border-slate-300 p-2 text-center font-semibold">${item.hafalan.kemandirian}</td>
                        <td class="border border-slate-300 p-2 text-center font-bold text-emerald-700">${(item.hafalan.kemandirian * 0.15).toFixed(1)}</td>
                    </tr>
                    <tr class="bg-slate-50 font-bold">
                        <td colspan="3" class="border border-slate-300 p-2 text-right">TOTAL NILAI HAFALAN</td>
                        <td class="border border-slate-300 p-2 text-center text-base text-emerald-800">${item.totalHafalan.toFixed(1)} / 100</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Adab Breakdown & Result Box -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-teal-600 pl-2">B. Skor Adab & Karakter</h3>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div class="flex justify-between"><span>Total Skor Adab:</span> <strong class="text-teal-700 font-bold text-sm">${item.totalAdab} / 100</strong></div>
                    <div class="flex justify-between text-slate-500"><span>Kualifikasi:</span> <span>${getAdabPredikatText(item.totalAdab)}</span></div>
                </div>
            </div>
            <div>
                <h3 class="text-sm font-bold text-slate-800 mb-2 border-l-4 border-emerald-600 pl-2">C. Status Hasil Evaluasi</h3>
                <div class="p-3 rounded-xl border ${statusClass} text-xs">
                    <strong class="block font-bold text-sm mb-1">${statusTitle}</strong>
                    <span>${statusDesc}</span>
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

    let statusStr = '';
    if (item.totalHafalan >= 85) statusStr = '✅ LULUS (Dapat Lanjut ke Juz Berikutnya)';
    else if (item.totalHafalan >= 75) statusStr = '⚠️ REMEDIAL (Tes ulang pada bagian yang belum kuat)';
    else statusStr = '🔴 BIMBINGAN INTENSIF (Penguatan hafalan sebelum tes ulang)';

    const text = `*RAPOR EVALUASI TAKHASUS AL-QUR'AN* 📖\n` +
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
        `🌟 *Skor Adab & Karakter:* ${item.totalAdab} / 100 (${getAdabPredikatText(item.totalAdab)})\n\n` +
        `📌 *Status:* ${statusStr}\n\n` +
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
    showToast('Teks WhatsApp berhasil disalin ke clipboard!', 'success');
}

// --- CSV EXPORT ---
function exportCSV() {
    if (evaluations.length === 0) {
        showToast('Tidak ada data untuk diekspor.', 'warning');
        return;
    }

    let csv = 'ID,Nama Santri,NIS,Kelompok,Juz Ujian,Tanggal,Nilai Hafalan,Skor Adab,Status,Penguji,Catatan\n';

    evaluations.forEach(i => {
        let status = i.totalHafalan >= 85 ? 'Lanjut Juz' : (i.totalHafalan >= 75 ? 'Remedial' : 'Intensif');
        csv += `"${i.id}","${i.namaSantri}","${i.nisSantri}","${i.kelompokSantri}","${i.juzUjian}","${i.tglEvaluasi}",${i.totalHafalan.toFixed(1)},${i.totalAdab},"${status}","${i.namaPenguji}","${(i.catatan || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekap_Takhasus_Quran_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV berhasil diunduh.', 'success');
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

    let typeClass = 'bg-slate-800 text-white';
    if (type === 'success') typeClass = 'bg-emerald-700 text-white';
    if (type === 'warning') typeClass = 'bg-amber-600 text-white';

    toast.className = `px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-white/20 transform transition duration-300 translate-y-2 opacity-0 flex items-center gap-2 ${typeClass}`;
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
